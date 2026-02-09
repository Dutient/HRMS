"use server";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface KeyMetrics {
  totalCandidates: number;
  activeInterviews: number;
  selectedCandidates: number;
  rejectionRate: number;
}

export interface SourcePerformance {
  source: string;
  applicants: number;
  hired: number;
}

export interface RolePipeline {
  role: string;
  Applied: number;
  Interview: number;
  Selected: number;
  Rejected: number;
}

/**
 * Get key metrics for the analytics dashboard
 */
export async function getKeyMetrics(): Promise<KeyMetrics> {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return {
        totalCandidates: 0,
        activeInterviews: 0,
        selectedCandidates: 0,
        rejectionRate: 0,
      };
    }

    // Get total candidates
    const { count: totalCandidates } = await supabase
      .from("candidates")
      .select("*", { count: "exact", head: true });

    // Get active interviews (status = 'Interview')
    const { count: activeInterviews } = await supabase
      .from("candidates")
      .select("*", { count: "exact", head: true })
      .eq("status", "Interview");

    // Get selected candidates
    const { count: selectedCandidates } = await supabase
      .from("candidates")
      .select("*", { count: "exact", head: true })
      .eq("status", "Selected");

    // Get rejected candidates
    const { count: rejectedCandidates } = await supabase
      .from("candidates")
      .select("*", { count: "exact", head: true })
      .eq("status", "Rejected");

    // Calculate rejection rate
    const rejectionRate = totalCandidates && rejectedCandidates
      ? Math.round((rejectedCandidates / totalCandidates) * 100)
      : 0;

    return {
      totalCandidates: totalCandidates || 0,
      activeInterviews: activeInterviews || 0,
      selectedCandidates: selectedCandidates || 0,
      rejectionRate,
    };
  } catch (error) {
    console.error("Error fetching key metrics:", error);
    return {
      totalCandidates: 0,
      activeInterviews: 0,
      selectedCandidates: 0,
      rejectionRate: 0,
    };
  }
}

/**
 * Get source performance data (grouped by source)
 */
export async function getSourcePerformance(): Promise<SourcePerformance[]> {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    const { data: candidates, error } = await supabase
      .from("candidates")
      .select("source, status");

    if (error) {
      console.error("Error fetching source performance:", error);
      return [];
    }

    // Group by source and count applicants and hired
    const sourceMap = new Map<string, { applicants: number; hired: number }>();

    candidates?.forEach((candidate) => {
      const source = candidate.source || "Unknown";
      const current = sourceMap.get(source) || { applicants: 0, hired: 0 };
      
      current.applicants += 1;
      if (candidate.status === "Selected") {
        current.hired += 1;
      }

      sourceMap.set(source, current);
    });

    // Convert to array and sort by applicants
    return Array.from(sourceMap.entries())
      .map(([source, data]) => ({
        source,
        applicants: data.applicants,
        hired: data.hired,
      }))
      .sort((a, b) => b.applicants - a.applicants);
  } catch (error) {
    console.error("Error fetching source performance:", error);
    return [];
  }
}

/**
 * Get role pipeline data (grouped by role and status)
 */
export async function getRolePipeline(): Promise<RolePipeline[]> {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    const { data: candidates, error } = await supabase
      .from("candidates")
      .select("role, status");

    if (error) {
      console.error("Error fetching role pipeline:", error);
      return [];
    }

    // Group by role and count by status
    const roleMap = new Map<string, RolePipeline>();

    candidates?.forEach((candidate) => {
      const role = candidate.role || "Unknown";
      const status = candidate.status || "Applied";
      
      const current = roleMap.get(role) || {
        role,
        Applied: 0,
        Interview: 0,
        Selected: 0,
        Rejected: 0,
      };

      if (status === "Applied") current.Applied += 1;
      else if (status === "Interview") current.Interview += 1;
      else if (status === "Selected") current.Selected += 1;
      else if (status === "Rejected") current.Rejected += 1;

      roleMap.set(role, current);
    });

    // Convert to array and sort by total candidates
    return Array.from(roleMap.values())
      .sort((a, b) => {
        const totalA = a.Applied + a.Interview + a.Selected + a.Rejected;
        const totalB = b.Applied + b.Interview + b.Selected + b.Rejected;
        return totalB - totalA;
      });
  } catch (error) {
    console.error("Error fetching role pipeline:", error);
    return [];
  }
}
