"use server";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

/**
 * Rank a single candidate using the Edge Function
 */
export async function rankSingleCandidate(
  candidateId: string,
  jdText: string
): Promise<{
  success: boolean;
  score?: number;
  reasoning?: string;
  message?: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, message: "Supabase not configured" };
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const functionUrl = `${supabaseUrl}/functions/v1/rank-candidates`;

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        candidateId,
        jdText,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Edge Function error: ${errorText}`);
    }

    const data = await response.json();

    // Revalidate to show new score
    revalidatePath("/candidates");

    return {
      success: true,
      score: data.score,
      reasoning: data.reasoning,
    };

  } catch (error) {
    console.error(`Error ranking candidate ${candidateId}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
/**
 * (Legacy) Batch ranking is now handled client-side
 * This file only exports rankSingleCandidate
 */
