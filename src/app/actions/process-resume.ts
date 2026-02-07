"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import mammoth from "mammoth";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
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

/**
 * Use Gemini AI to extract structured data from resume text
 */
async function extractDataWithGemini(
  resumeText: string
): Promise<ExtractedData> {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `You are an expert resume parser. Extract the following information from this resume and return ONLY a valid JSON object with no additional text or markdown formatting:

{
  "name": "full name of the candidate",
  "email": "email address",
  "phone": "phone number (or null if not found)",
  "role": "infer the primary job role/title based on experience and skills",
  "experience": number of years of experience as an integer,
  "skills": ["array", "of", "key", "skills"],
  "summary": "a single sentence summarizing their expertise and experience"
}

Resume text:
${resumeText}

Remember: Return ONLY the JSON object, nothing else.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response - remove markdown code blocks if present
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    const parsedData = JSON.parse(jsonText);

    // Validate required fields
    if (!parsedData.name || !parsedData.email || !parsedData.role) {
      throw new Error("Missing required fields in extracted data");
    }

    return parsedData as ExtractedData;
  } catch (error) {
    console.error("Error extracting data with Gemini:", error);
    throw new Error("Failed to parse resume with AI");
  }
}

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

    // Extract structured data using Gemini
    console.log("🤖 Extracting data with Gemini AI...");
    const extractedData = await extractDataWithGemini(resumeText);
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
