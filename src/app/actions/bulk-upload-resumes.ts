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
): Promise<UploadResult[]> {
  // Check if Supabase is configured
  if (!isSupabaseConfigured || !supabase) {
    return [{
      fileName: "system",
      success: false,
      message: "Supabase not configured. Please add credentials to .env.local",
    }];
  }

  const files = formData.getAll("files") as File[];
  const results: UploadResult[] = [];

  console.log(`📤 Starting bulk upload of ${files.length} files`);

  // Import Gemini resume parser from process-resume
  const { extractTextFromPDF, extractDataWithGemini } = await import("@/app/actions/process-resume");
  // Removed unused default import
  // const { default: processResume } = await import("@/app/actions/process-resume");

  for (const file of files) {
    try {
      console.log(`📄 Processing: ${file.name}`);

      // Validate file type
      if (file.type !== "application/pdf") {
        results.push({
          fileName: file.name,
          success: false,
          message: "Only PDF files are supported",
        });
        continue;
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
        results.push({
          fileName: file.name,
          success: false,
          message: `Upload failed: ${uploadError.message}`,
        });
        continue;
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
        results.push({
          fileName: file.name,
          success: false,
          message: "Failed to extract text from PDF",
        });
        continue;
      }

      // Step D: Use Gemini to parse resume and extract candidate fields
      let extractedData;
      try {
        // Use the same Gemini extraction as processResume
        // Already imported above
        extractedData = await extractDataWithGemini(resumeText);
      } catch (err) {
        console.error(`❌ Gemini extraction failed:`, err);
        results.push({
          fileName: file.name,
          success: false,
          message: "Gemini extraction failed",
        });
        continue;
      }

      // Step E: Insert candidate record with all fields
      const { data: candidateData, error: insertError } = await supabase
        .from("candidates")
        .insert({
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
        results.push({
          fileName: file.name,
          success: false,
          message: `Database error: ${insertError.message}`,
        });
        continue;
      }

      console.log(`✅ Created candidate: ${candidateData.name}`);

      results.push({
        fileName: file.name,
        success: true,
        candidateName: candidateData.name,
      });
    } catch (error) {
      console.error(`❌ Unexpected error for ${file.name}:`, error);
      results.push({
        fileName: file.name,
        success: false,
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    }

    // Rate limit delay: Wait 4 seconds between processing files to respect Gemini's 15 RPM limit
    // This ensures we don't hit 429 errors during bulk uploads
    if (files.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 4000));
    }
  }

  // Revalidate candidates page
  revalidatePath("/candidates");

  console.log(`✅ Bulk upload complete: ${results.filter(r => r.success).length}/${files.length} successful`);

  return results;
}
