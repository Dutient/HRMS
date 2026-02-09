"use server";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export interface ScheduleInterviewData {
  candidateId: string;
  interviewerName: string;
  interviewDate: string; // ISO string
  interviewType: "Screening" | "Technical" | "Final" | "HR";
  meetingLink?: string;
}

/**
 * Schedule an interview for a candidate
 */
export async function scheduleInterview(data: ScheduleInterviewData): Promise<{
  success: boolean;
  message: string;
  interviewId?: string;
}> {
  try {
    console.log("📅 Scheduling interview...", data);

    // Validate Supabase configuration
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        message: "Database connection not configured",
      };
    }

    // Validate required fields
    if (!data.candidateId || !data.interviewerName || !data.interviewDate || !data.interviewType) {
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    // Validate date is in the future
    const interviewDate = new Date(data.interviewDate);
    const now = new Date();
    if (interviewDate < now) {
      return {
        success: false,
        message: "Interview date must be in the future",
      };
    }

    // Insert interview into database
    const { data: interview, error: insertError } = await supabase
      .from("interviews")
      .insert({
        candidate_id: data.candidateId,
        interviewer_name: data.interviewerName,
        interview_date: data.interviewDate,
        interview_type: data.interviewType,
        meeting_link: data.meetingLink || null,
        status: "Scheduled",
      })
      .select()
      .single();

    if (insertError) {
      console.error("❌ Error inserting interview:", insertError);
      return {
        success: false,
        message: `Failed to schedule interview: ${insertError.message}`,
      };
    }

    console.log("✅ Interview created:", interview.id);

    // Update candidate status to 'Interview'
    const { error: updateError } = await supabase
      .from("candidates")
      .update({ status: "Interview" })
      .eq("id", data.candidateId);

    if (updateError) {
      console.warn("⚠️ Failed to update candidate status:", updateError);
      // Don't fail the request if status update fails
    } else {
      console.log("✅ Candidate status updated to Interview");
    }

    // Revalidate the candidates page
    revalidatePath("/candidates");

    return {
      success: true,
      message: "Interview scheduled successfully",
      interviewId: interview.id,
    };
  } catch (error) {
    console.error("❌ Fatal error scheduling interview:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get all interviews for a candidate
 */
export async function getInterviewsByCandidate(candidateId: string) {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("candidate_id", candidateId)
      .order("interview_date", { ascending: true });

    return { data: data || [], error };
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return { data: [], error };
  }
}
