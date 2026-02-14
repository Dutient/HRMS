"use server";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Create a new ranking job in the database
 * This job will be processed by the Supabase Edge Function
 */
export async function createRankingJob(
  jdText: string,
  filters?: {
    position?: string;
    job_opening?: string;
    domain?: string;
  }
): Promise<{
  success: boolean;
  message: string;
  jobId?: string;
}> {
  try {
    // Validate inputs
    if (!jdText || jdText.trim().length < 50) {
      return {
        success: false,
        message: "Job description is too short. Please provide at least 50 characters.",
      };
    }

    // Check Supabase configuration
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        message: "Database connection not configured",
      };
    }

    console.log("🎯 Creating ranking job...");

    // Create job record
    const { data: job, error: createError } = await supabase
      .from("ranking_jobs")
      .insert({
        job_description: jdText,
        status: "queued",
        filters: filters || null, // Store filters in the job record
      })
      .select()
      .single();

    if (createError || !job) {
      console.error("❌ Error creating job:", createError);
      return {
        success: false,
        message: `Failed to create ranking job: ${createError?.message}`,
      };
    }

    console.log(`✅ Created job ${job.id}`);

    // Trigger the Supabase Edge Function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const functionUrl = `${supabaseUrl}/functions/v1/rank-candidates`;

    console.log("🚀 Triggering Edge Function...");

    try {
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          jobId: job.id,
          jobDescription: jdText,
          filters: filters || null, // Pass filters to Edge Function
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Edge Function error:", errorText);

        // Update job status to failed
        await supabase
          .from("ranking_jobs")
          .update({
            status: "failed",
            error_message: `Edge Function error: ${errorText}`,
          })
          .eq("id", job.id);

        return {
          success: false,
          message: "Failed to start ranking process. Please try again.",
        };
      }

      console.log("✅ Edge Function triggered successfully");

      return {
        success: true,
        message: "Ranking job started successfully",
        jobId: job.id,
      };
    } catch (fetchError) {
      console.error("❌ Error triggering Edge Function:", fetchError);

      // Update job status to failed
      await supabase
        .from("ranking_jobs")
        .update({
          status: "failed",
          error_message: `Failed to trigger: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`,
        })
        .eq("id", job.id);

      return {
        success: false,
        message: "Failed to start ranking process. Please check your configuration.",
      };
    }
  } catch (error) {
    console.error("❌ Fatal error creating ranking job:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get the status of a ranking job
 */
export async function getRankingJobStatus(jobId: string): Promise<{
  success: boolean;
  job?: {
    status: string;
    total_candidates: number;
    processed_candidates: number;
    error_message?: string;
    completed_at?: string;
  };
  message?: string;
}> {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        message: "Database connection not configured",
      };
    }

    const { data: job, error } = await supabase
      .from("ranking_jobs")
      .select("status, total_candidates, processed_candidates, error_message, completed_at")
      .eq("id", jobId)
      .single();

    if (error || !job) {
      return {
        success: false,
        message: "Job not found",
      };
    }

    return {
      success: true,
      job,
    };
  } catch (error) {
    console.error("❌ Error getting job status:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
