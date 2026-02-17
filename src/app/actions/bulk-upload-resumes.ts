"use server";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

interface UploadResult {
  fileName: string;
  success: boolean;
  candidateName?: string;
  message?: string;
}

/**
 * Upload multiple PDF resumes to Supabase Storage and create candidate records
 * @param formData - FormData containing multiple files
 * @param metadata - Optional metadata (position, job_opening, domain)
 * @returns Array of upload results
 */
export async function uploadResumesAndCreateCandidates(
  formData: FormData,
  metadata?: {
    position?: string;
    job_opening?: string;
    domain?: string;
  }
): Promise<UploadResult> {
  // Check if Supabase is configured
  if (!isSupabaseConfigured || !supabase) {
    return {
      fileName: "system",
      success: false,
      message: "Supabase not configured. Please add credentials to .env.local",
    };
  }

  const file = formData.get("file") as File;

  if (!file) {
    return {
      fileName: "unknown",
      success: false,
      message: "No file provided",
    };
  }

  console.log(`📄 Processing single file: ${file.name}`);

  // Import Gemini resume parser from process-resume
  const { extractTextFromPDF, extractDataWithGemini } = await import("@/app/actions/process-resume");

  try {
    // Validate file type
    if (file.type !== "application/pdf") {
      return {
        fileName: file.name,
        success: false,
        message: "Only PDF files are supported",
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${timestamp}_${sanitizedName}`;

    // Step A: Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(uniqueFileName, file, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error(`❌ Upload error for ${file.name}:`, uploadError);
      return {
        fileName: file.name,
        success: false,
        message: `Upload failed: ${uploadError.message}`,
      };
    }

    console.log(`✅ Uploaded to storage: ${uploadData.path}`);

    // Step B: Get public URL
    const { data: urlData } = supabase.storage
      .from("resumes")
      .getPublicUrl(uploadData.path);

    const resumeUrl = urlData.publicUrl;
    console.log(`🔗 Public URL: ${resumeUrl}`);

    // Step C: Extract text from PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let resumeText = "";
    try {
      resumeText = await extractTextFromPDF(buffer);
    } catch (err) {
      console.error(`❌ Failed to extract text from PDF:`, err);
      // Cleanup uploaded file
      await supabase.storage.from("resumes").remove([uploadData.path]);
      return {
        fileName: file.name,
        success: false,
        message: "Failed to extract text from PDF",
      };
    }

    // Step D: Use Gemini to parse resume and extract candidate fields
    let extractedData;
    try {
      extractedData = await extractDataWithGemini(resumeText);
    } catch (err) {
      console.error(`❌ Gemini extraction failed:`, err);
      // Cleanup uploaded file
      await supabase.storage.from("resumes").remove([uploadData.path]);
      return {
        fileName: file.name,
        success: false,
        message: "Gemini extraction failed",
      };
    }

    // Step D.1: Generate Vector Embedding using AWS Bedrock (Titan v1)
    let vectorElement: number[] | null = null;
    try {
      const { BedrockEmbeddings } = await import("@langchain/aws");
      const embeddings = new BedrockEmbeddings({
        region: process.env.BEDROCK_AWS_REGION,
        model: "amazon.titan-embed-text-v1", // Explicitly using v1 for 1536 dimensions
        credentials: {
          accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
        },
      });
      console.log("🧠 Generating vector embedding...");
      vectorElement = await embeddings.embedQuery(resumeText);
      console.log("✅ Vector embedding generated");
    } catch (err) {
      console.error("❌ Embedding generation failed:", err);
      // We continue without embedding, or fail? User request implies we MUST have it.
      // But for bulk upload resilience, maybe we note it?
      // For now, let's just log and continue, inserting null if the column allows (it might NOT).
      // Actually, the previous 'ingestResume.ts' insertion succeded with vector.
      // Let's assume we want to fail for this candidate if embedding fails, to ensure data consistency.
      await supabase.storage.from("resumes").remove([uploadData.path]);
      return {
        fileName: file.name,
        success: false,
        message: "Embedding generation failed",
      };
    }

    // Step E: Insert candidate record with all fields
    const { data: candidateData, error: insertError } = await supabase
      .from("candidates")
      .insert({
        name: extractedData.name,
        email: extractedData.email,
        phone: extractedData.phone,
        role: extractedData.role || "General Application", // Default per requirement
        experience: extractedData.experience,
        skills: extractedData.skills,
        summary: extractedData.summary,
        status: "New",
        source: "Bulk Upload",
        match_score: null,
        embedding: vectorElement,
        applied_date: new Date().toISOString().split("T")[0],
        resume_url: resumeUrl,
        // Add metadata
        position: metadata?.position || null,
        job_opening: metadata?.job_opening || null,
        domain: metadata?.domain || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error(`❌ Database insert error for ${file.name}:`, insertError);
      // Cleanup: Delete uploaded file if database insert fails
      await supabase.storage.from("resumes").remove([uploadData.path]);
      return {
        fileName: file.name,
        success: false,
        message: `Database error: ${insertError.message}`,
      };
    }

    console.log(`✅ Created candidate: ${candidateData.name}`);

    // Revalidate candidates page
    revalidatePath("/candidates");

    return {
      fileName: file.name,
      success: true,
      candidateName: candidateData.name,
    };

  } catch (error) {
    console.error(`❌ Unexpected error for ${file.name}:`, error);
    return {
      fileName: file.name,
      success: false,
      message: error instanceof Error ? error.message : "Unexpected error",
    };
  }
}
