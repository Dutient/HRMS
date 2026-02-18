"use server";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function deleteCandidate(candidateId: string): Promise<{ success: boolean; message: string }> {
    try {
        if (!isSupabaseConfigured || !supabase) {
            return { success: false, message: "Supabase not configured" };
        }

        // 1. Get candidate to find resume URL/path
        const { data: candidate, error: fetchError } = await supabase
            .from("candidates")
            .select("resume_url")
            .eq("id", candidateId)
            .single();

        if (fetchError) {
            console.error("Error fetching candidate for deletion:", fetchError);
            return { success: false, message: "Candidate not found" };
        }

        // 2. Delete resume file from storage if it exists
        if (candidate?.resume_url) {
            // Extract path from URL
            // URL format: .../storage/v1/object/public/resumes/filename.pdf
            // We need just "filename.pdf" or the path inside the bucket
            const url = new URL(candidate.resume_url);
            const pathParts = url.pathname.split("/resumes/");
            if (pathParts.length > 1) {
                const filePath = pathParts[1];
                const { error: storageError } = await supabase.storage
                    .from("resumes")
                    .remove([decodeURIComponent(filePath)]);

                if (storageError) {
                    console.warn("Error deleting resume file:", storageError);
                    // Continue to delete record even if file deletion fails
                }
            }
        }

        // 3. Delete candidate record
        const { error: deleteError } = await supabase
            .from("candidates")
            .delete()
            .eq("id", candidateId);

        if (deleteError) {
            console.error("Error deleting candidate record:", deleteError);
            return { success: false, message: "Failed to delete candidate record" };
        }

        revalidatePath("/candidates");
        return { success: true, message: "Candidate deleted successfully" };
    } catch (error) {
        console.error("Unexpected error deleting candidate:", error);
        return { success: false, message: "An unexpected error occurred" };
    }
}
