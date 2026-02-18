"use server";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import mammoth from "mammoth";


interface ExtractedData {
  name: string;
  email: string;
  phone: string | null;
  role: string;
  experience: number;
  skills: string[];
  summary: string;
}

/**
 * Extract text from PDF file
 */
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

/**
 * Extract text from DOCX file
 */
async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("Error extracting DOCX text:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}

/**
 * Extract text from TXT file
 */
function extractTextFromTXT(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

// Initialize Bedrock Client
import { BedrockRuntimeClient, InvokeModelCommand, ThrottlingException } from "@aws-sdk/client-bedrock-runtime";

const bedrock = new BedrockRuntimeClient({
  region: "us-east-1", // Hardcoded per requirement or use process.env.BEDROCK_AWS_REGION
  credentials: {
    accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Invoke Bedrock with Exponential Backoff
 */
async function invokeBedrockWithBackoff(
  command: InvokeModelCommand,
  retries = 3,
  delay = 1000
): Promise<any> {
  try {
    return await bedrock.send(command);
  } catch (error) {
    if (retries > 0 && (error instanceof ThrottlingException || (error as any).name === "ThrottlingException" || (error as any).statusCode === 429)) {
      console.warn(`⚠️ Bedrock Throttled. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return invokeBedrockWithBackoff(command, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Use AWS Bedrock (Claude 4.5 Haiku) to extract structured data from resume text
 */
export async function extractDataWithBedrock(
  resumeText: string
): Promise<ExtractedData> {
  const modelId = "us.anthropic.claude-haiku-4-5-20251001-v1:0"; // Use US inference profile for on-demand throughput

  const prompt = `You are an expert resume parser. Extract the following information from this resume and return ONLY a valid JSON object.

<resume>
${resumeText}
</resume>

Return a JSON object with this exact schema:
{
  "name": "full name",
  "email": "email address",
  "phone": "phone number or null",
  "role": "inferred job role",
  "experience": number_of_years_int,
  "skills": ["skill1", "skill2"],
  "summary": "brief summary"
}

Do not include any text before or after the JSON.`;

  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
    temperature: 0.1,
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
    const outputText = responseBody.content[0].text;

    // Clean up response if needed (though Claude is usually good with "ONLY JSON")
    let jsonText = outputText.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    const parsedData = JSON.parse(jsonText);

    // Validate required fields
    if (!parsedData.name || !parsedData.email) {
      throw new Error("Missing required fields (name, email) in extracted data");
    }

    return parsedData as ExtractedData;
  } catch (error) {
    console.error("❌ Error extracting data with Bedrock:", error);
    throw new Error("Failed to parse resume with AI (Bedrock)");
  }
}

// Keep Gemini function for backward compatibility if needed, or remove.
// For now, removing usages in this file but keeping the function commented out or replacing it.
// The instruction said "Replace", so I will replace the export.
// But I need to support `extractDataWithGemini` calls if any other file uses it?
// `bulk-upload-resumes.ts` is the only consumer.
// So I will just replace the function body or rename.
// Let's replace `extractDataWithGemini` entirely with `extractDataWithBedrock` but keep the name if we want minimal refactor,
// OR better, export `extractDataWithBedrock` and update the consumer. 
// I will REPLACE the content of the `extractDataWithGemini` function block with `extractDataWithBedrock` code and rename it to `extractDataWithBedrock`.

/**
 * Process a single resume file
 * @param formData - FormData containing the resume file
 * @returns Success status and message
 */
export async function processResume(formData: FormData): Promise<{
  success: boolean;
  message: string;
  candidateName?: string;
}> {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        message: "Supabase not configured. Please add credentials to .env.local",
      };
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        message: "Gemini API key not configured. Please add GEMINI_API_KEY to .env.local",
      };
    }

    // Extract file from FormData
    const file = formData.get("file") as File;
    if (!file) {
      console.error("❌ No file found in form data");
      return {
        success: false,
        message: "No file provided",
      };
    }

    console.log(`📄 Processing file: ${file.name} (${file.type}, ${file.size} bytes)`);

    // Validate file type
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    const validExtensions = [".pdf", ".docx", ".txt"];

    const hasValidType = validTypes.includes(fileType);
    const hasValidExtension = validExtensions.some((ext) =>
      fileName.endsWith(ext)
    );

    if (!hasValidType && !hasValidExtension) {
      return {
        success: false,
        message: "Invalid file type. Only PDF, DOCX, and TXT files are supported",
      };
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`✅ File converted to buffer (${buffer.length} bytes)`);

    // Extract text based on file type
    let resumeText: string;
    if (fileName.endsWith(".pdf")) {
      console.log("📖 Extracting text from PDF...");
      resumeText = await extractTextFromPDF(buffer);
    } else if (fileName.endsWith(".docx")) {
      console.log("📖 Extracting text from DOCX...");
      resumeText = await extractTextFromDOCX(buffer);
    } else if (fileName.endsWith(".txt")) {
      console.log("📖 Extracting text from TXT...");
      resumeText = extractTextFromTXT(buffer);
    } else {
      return {
        success: false,
        message: "Unsupported file format",
      };
    }

    console.log(`✅ Extracted ${resumeText.length} characters of text`);

    // Check if text was extracted
    if (!resumeText || resumeText.trim().length < 50) {
      console.error(`❌ Not enough text extracted (${resumeText?.length || 0} chars)`);
      return {
        success: false,
        message: "Could not extract enough text from the file",
      };
    }

    // Extract structured data using Bedrock
    console.log("🤖 Extracting data with Bedrock (Claude 4.5 Haiku)...");
    const extractedData = await extractDataWithBedrock(resumeText);
    console.log(`✅ Extracted data for: ${extractedData.name} (${extractedData.email})`);

    // Check if candidate already exists
    console.log("🔍 Checking for duplicate candidate...");
    const { data: existingCandidate } = await supabase
      .from("candidates")
      .select("id")
      .eq("email", extractedData.email)
      .single();

    if (existingCandidate) {
      console.warn(`⚠️ Duplicate candidate found: ${extractedData.email}`);
      return {
        success: false,
        message: `Candidate with email ${extractedData.email} already exists`,
        candidateName: extractedData.name,
      };
    }

    // Insert into Supabase
    console.log("💾 Inserting candidate into database...");
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
    });

    if (error) {
      console.error("❌ Database error:", error);
      return {
        success: false,
        message: `Database error: ${error.message}`,
      };
    }

    console.log(`✅ Successfully added candidate: ${extractedData.name}`);

    // Revalidate the candidates page to show new data
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
