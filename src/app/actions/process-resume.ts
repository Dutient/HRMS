"use server";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import mammoth from "mammoth";
import { BedrockRuntimeClient, InvokeModelCommand, ThrottlingException } from "@aws-sdk/client-bedrock-runtime";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExtractedData {
  name: string;
  email: string;
  phone: string | null;
  role: string;
  experience: number;
  skills: string[];
  summary: string;
  current_location: string | null;
  is_willing_to_relocate: boolean | null;
}

// Fields the LLM extracts (email + phone are handled by regex)
interface LLMExtractedData {
  name: string;
  role: string;
  experience: number;
  skills: string[];
  summary: string;
  current_location: string | null;
  is_willing_to_relocate: boolean | null;
}

// ─── Text Extraction Helpers ───────────────────────────────────────────────────

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // @ts-expect-error - pdf-parse is a CommonJS module
    const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js");
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("❌ Error extracting PDF text:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("Error extracting DOCX text:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}

function extractTextFromTXT(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

// ─── Regex Pre-Processing ─────────────────────────────────────────────────────

/**
 * Extract email and phone from raw resume text using regex.
 * This avoids sending these trivially parseable fields to the LLM,
 * saving input/output tokens on every single upload.
 */
function extractFieldsWithRegex(text: string): { email: string | null; phone: string | null } {
  // Use a more specific email regex and avoid capturing prefixed digits if they belong to a phone number
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/i;
  const emailMatch = text.match(emailRegex);

  // Phone regex: look for patterns common in resumes
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = text.match(phoneRegex);

  return {
    email: emailMatch?.[0]?.toLowerCase().trim() ?? null,
    phone: phoneMatch?.[0]?.trim() ?? null,
  };
}

// ─── Bedrock Client ───────────────────────────────────────────────────────────

const bedrock = new BedrockRuntimeClient({
  region: process.env.BEDROCK_AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
  },
});

async function invokeBedrockWithBackoff(
  command: InvokeModelCommand,
  retries = 3,
  delay = 1000
): Promise<any> {
  try {
    return await bedrock.send(command);
  } catch (error) {
    if (
      retries > 0 &&
      (error instanceof ThrottlingException ||
        (error as any).name === "ThrottlingException" ||
        (error as any).statusCode === 429)
    ) {
      console.warn(`⚠️ Bedrock Throttled. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return invokeBedrockWithBackoff(command, retries - 1, delay * 2);
    }
    throw error;
  }
}

// ─── LLM Extraction (Nova Micro) ──────────────────────────────────────────────

/**
 * Use AWS Bedrock (Amazon Nova Micro) to extract structured data from resume text.
 * 
 * Cost vs. old Haiku 4.5:
 *   Nova Micro input:  $0.04 / 1M tokens  (was $1.00 — 25× cheaper)
 *   Nova Micro output: $0.16 / 1M tokens  (was $5.00 — 31× cheaper)
 *
 * Scope is intentionally narrow — email and phone are pre-extracted by regex
 * and merged in afterward to minimize token usage.
 */
export async function extractDataWithBedrock(
  resumeText: string
): Promise<ExtractedData | null> {
  // ① Regex extraction — free, instant, zero tokens
  const { email: regexEmail, phone: regexPhone } = extractFieldsWithRegex(resumeText);

  // ② Truncate input to 3,000 chars — sufficient for structured fields, saves ~60% of input tokens
  const truncatedText = resumeText.substring(0, 3000);

  const modelId = "amazon.nova-micro-v1:0";

  // ③ Reduced prompt — no longer asks for email or phone
  const prompt = `You are a resume parser. Extract information from the resume below and return ONLY a valid JSON object with no extra text.
  
  IMPORTANT: Look carefully for the email address and phone number. Sometimes PDF extraction can merge them with other digits or text. Clean them up (e.g., remove any digits that look like they belong to a phone number from the start of an email).

<resume>
${truncatedText}
</resume>

Return this exact JSON schema:
{
  "name": "full name",
  "email": "email address",
  "phone": "phone number or null",
  "role": "inferred job title or role",
  "experience": <integer years>,
  "skills": ["skill1", "skill2"],
  "summary": "one sentence professional summary",
  "current_location": "City, Country or null if not found",
  "is_willing_to_relocate": boolean (true if mentions relocation/travel/remote, else false)
}`;

  // Nova Micro uses the Converse-style messages API
  const payload = {
    messages: [
      {
        role: "user",
        content: [{ text: prompt }],
      },
    ],
    inferenceConfig: {
      maxTokens: 512,
      temperature: 0.1,
    },
  };

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload),
  });

  try {
    const response = await invokeBedrockWithBackoff(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    // Nova Micro response structure: output.message.content[0].text
    const outputText: string =
      responseBody?.output?.message?.content?.[0]?.text ?? "";

    // Strip any markdown code fences Claude/Nova might wrap around JSON
    let jsonText = outputText.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    // Sanitize null bytes — PostgreSQL rejects \u0000 in text columns
    // eslint-disable-next-line no-control-regex
    jsonText = jsonText.replace(/\u0000/g, "");

    const llmData = JSON.parse(jsonText) as LLMExtractedData & { email?: string; phone?: string | null };

    // ④ Validate the LLM returned a name and email at minimum
    if (!llmData.name) {
      console.warn("⚠️ LLM did not return a name — skipping candidate.");
      return null;
    }

    // ⑤ Merge: LLM fields + regex-extracted email/phone as fallbacks
    const email = (llmData.email || regexEmail || "")?.toLowerCase().trim();
    const phoneValue = (llmData.phone || regexPhone || null);
    const phone = typeof phoneValue === 'string' ? phoneValue.trim() : null;

    const merged: ExtractedData = {
      name: llmData.name.trim(),
      role: llmData.role ?? "General Application",
      experience: typeof llmData.experience === "number" ? llmData.experience : 0,
      skills: Array.isArray(llmData.skills) ? llmData.skills : [],
      summary: llmData.summary ?? "",
      email: email,
      phone: phone,
      current_location: llmData.current_location ?? null,
      is_willing_to_relocate: llmData.is_willing_to_relocate ?? false,
    };

    if (!merged.email) {
      console.warn("⚠️ No email found — skipping candidate.");
      return null;
    }

    return merged;
  } catch (error) {
    console.error("❌ Error extracting data with Bedrock (Nova Micro):", error);
    throw error;
  }
}

// ─── Single Resume Processor (used by /upload page) ───────────────────────────

export async function processResume(formData: FormData): Promise<{
  success: boolean;
  message: string;
  candidateName?: string;
}> {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        message: "Supabase not configured. Please add credentials to .env.local",
      };
    }

    const file = formData.get("file") as File;
    if (!file) {
      console.error("❌ No file found in form data");
      return { success: false, message: "No file provided" };
    }

    console.log(`📄 Processing file: ${file.name} (${file.type}, ${file.size} bytes)`);

    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    const validExtensions = [".pdf", ".docx", ".txt"];

    const hasValidType = validTypes.includes(fileType);
    const hasValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!hasValidType && !hasValidExtension) {
      return {
        success: false,
        message: "Invalid file type. Only PDF, DOCX, and TXT files are supported",
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`✅ File converted to buffer (${buffer.length} bytes)`);

    let resumeText: string;
    if (fileName.endsWith(".pdf")) {
      resumeText = await extractTextFromPDF(buffer);
    } else if (fileName.endsWith(".docx")) {
      resumeText = await extractTextFromDOCX(buffer);
    } else {
      resumeText = extractTextFromTXT(buffer);
    }

    // eslint-disable-next-line no-control-regex
    resumeText = resumeText.replace(/\u0000/g, "").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
    console.log(`✅ Extracted ${resumeText.length} characters of text`);

    if (!resumeText || resumeText.trim().length < 50) {
      return {
        success: false,
        message: "Could not extract enough text from the file",
      };
    }

    console.log("🤖 Extracting data with Bedrock (Nova Micro)...");
    const extractedData = await extractDataWithBedrock(resumeText);

    if (!extractedData) {
      return {
        success: false,
        message: "Skipped: Missing Name or Email in resume",
      };
    }

    console.log(`✅ Extracted data for: ${extractedData.name} (${extractedData.email})`);

    // Duplicate check
    const { data: existingCandidate } = await supabase
      .from("candidates")
      .select("id")
      .eq("email", extractedData.email)
      .single();

    if (existingCandidate) {
      return {
        success: false,
        message: `Candidate with email ${extractedData.email} already exists`,
        candidateName: extractedData.name,
      };
    }

    const { error } = await supabase.from("candidates").insert({
      name: extractedData.name,
      email: extractedData.email,
      phone: extractedData.phone,
      role: extractedData.role,
      experience: extractedData.experience,
      skills: extractedData.skills,
      summary: extractedData.summary,
      status: "New",
      source: "Bulk Upload",
      match_score: null,
      applied_date: new Date().toISOString().split("T")[0],
      location: extractedData.current_location,
      will_relocate: extractedData.is_willing_to_relocate,
    });

    if (error) {
      return { success: false, message: `Database error: ${error.message}` };
    }

    console.log(`✅ Successfully added candidate: ${extractedData.name}`);
    revalidatePath("/candidates");

    return {
      success: true,
      message: "Resume processed successfully",
      candidateName: extractedData.name,
    };
  } catch (error) {
    console.error("❌ Fatal error processing resume:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
