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
 * @returns Array of upload results
 */
export async function uploadResumesAndCreateCandidates(
  formData: FormData
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

      // Extract candidate name from filename (remove extension and timestamp)
      const candidateName = file.name
        .replace(/\.pdf$/i, "")
        .replace(/^\d+_/, "")
        .replace(/_/g, " ")
        .trim();

      // Step C: Insert candidate record
      const { data: candidateData, error: insertError } = await supabase
        .from("candidates")
        .insert({
          name: candidateName,
          email: `${candidateName.toLowerCase().replace(/\s+/g, ".")}@example.com`, // Placeholder email
          role: "To be determined", // Placeholder role
          source: "Bulk Upload",
          status: "New",
          resume_url: resumeUrl,
          applied_date: new Date().toISOString().split("T")[0],
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
  }

  // Revalidate candidates page
  revalidatePath("/candidates");

  console.log(`✅ Bulk upload complete: ${results.filter(r => r.success).length}/${files.length} successful`);
  
  return results;
}
