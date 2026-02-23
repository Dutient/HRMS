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

        // 2. Prepare parallel deletion tasks
        const deleteTasks: any[] = [];

        // Task A: Delete resume file from storage if it exists
        if (candidate?.resume_url) {
            const url = new URL(candidate.resume_url);
            const pathParts = url.pathname.split("/resumes/");
            if (pathParts.length > 1) {
                const filePath = pathParts[1];
                deleteTasks.push(
                    supabase.storage
                        .from("resumes")
                        .remove([decodeURIComponent(filePath)])
                        .then(({ error }) => {
                            if (error) console.warn("Error deleting resume file:", error);
                        })
                );
            }
        }

        // Task B: Delete candidate record
        deleteTasks.push(
            supabase
                .from("candidates")
                .delete()
                .eq("id", candidateId)
                .then(({ error }) => {
                    if (error) throw new Error(`Database error: ${error.message}`);
                })
        );

        // 3. Execute all deletions in parallel
        await Promise.all(deleteTasks);

        revalidatePath("/candidates");
        return { success: true, message: "Candidate deleted successfully" };
    } catch (error) {
        console.error("Unexpected error deleting candidate:", error);
        return { success: false, message: "An unexpected error occurred" };
    }
}
