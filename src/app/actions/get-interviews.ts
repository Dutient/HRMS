"use server";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export interface InterviewWithCandidate {
  id: string;
  candidate_id: string;
  interviewer_name: string;
  interview_date: string;
  interview_type: "Screening" | "Technical" | "Final" | "HR";
  status: "Scheduled" | "Completed" | "Cancelled";
  meeting_link: string | null;
  feedback_score: number | null;
  feedback_notes: string | null;
  created_at: string;
  updated_at: string;
  candidate: {
    id: string;
    name: string;
    role: string;
    email: string;
    avatar_url: string | null;
  } | null;
}

/**
 * Get all interviews with candidate details
 */
export async function getAllInterviews(): Promise<InterviewWithCandidate[]> {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from("interviews")
      .select(`
        *,
        candidate:candidates!candidate_id (
          id,
          name,
          role,
          email,
          avatar_url
        )
      `)
      .order("interview_date", { ascending: false });

    if (error) {
      console.error("Error fetching interviews:", error);
      return [];
    }

    return (data || []) as InterviewWithCandidate[];
  } catch (error) {
    console.error("Fatal error fetching interviews:", error);
    return [];
  }
}

export interface SubmitFeedbackData {
  interviewId: string;
  feedbackScore: number;
  feedbackNotes: string;
  decision: "Strong Yes" | "Yes" | "No";
}

/**
 * Submit feedback for an interview
 */
export async function submitInterviewFeedback(data: SubmitFeedbackData): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    console.log("📝 Submitting interview feedback...", data);

    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        message: "Database connection not configured",
      };
    }

    // Validate required fields
    if (!data.interviewId || !data.feedbackScore || !data.decision) {
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    // Validate score range
    if (data.feedbackScore < 1 || data.feedbackScore > 5) {
      return {
        success: false,
        message: "Score must be between 1 and 5",
      };
    }

    // Append decision to notes
    const fullNotes = `Decision: ${data.decision}\n\n${data.feedbackNotes}`;

    // Update interview with feedback
    const { error: updateError } = await supabase
      .from("interviews")
      .update({
        feedback_score: data.feedbackScore,
        feedback_notes: fullNotes,
        status: "Completed",
      })
      .eq("id", data.interviewId);

    if (updateError) {
      console.error("❌ Error updating interview:", updateError);
      return {
        success: false,
        message: `Failed to submit feedback: ${updateError.message}`,
      };
    }

    console.log("✅ Feedback submitted successfully");

    // Revalidate the interviews page
    revalidatePath("/interviews");
    revalidatePath("/candidates");

    return {
      success: true,
      message: "Feedback submitted successfully",
    };
  } catch (error) {
    console.error("❌ Fatal error submitting feedback:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
