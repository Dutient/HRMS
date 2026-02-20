"use server";

import { supabase, isSupabaseConfigured, type Candidate } from "@/lib/supabase";

/**
 * Fetch all candidates from the database
 * @param status - Optional status filter
 * @param filters - Optional metadata filters
 * @returns Array of candidates
 */
export async function getCandidates(
  status?: Candidate["status"],
  filters?: {
    position?: string;
    job_opening?: string;
    domain?: string;
    location?: string;
    min_exp?: string;
    max_exp?: string;
    relocate?: string;
  }
): Promise<Candidate[]> {
  // Return empty array if Supabase is not configured
  if (!isSupabaseConfigured || !supabase) {
    console.warn("Supabase not configured. Please add your credentials to .env.local");
    return [];
  }

  try {
    let query = supabase
      .from("candidates")
      .select("*")
      // Order by match_score descending, nulls last, then by created_at
      .order("match_score", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    // Apply status filter if provided
    if (status) {
      query = query.eq("status", status);
    }

    // Apply metadata filters if provided
    if (filters?.position) {
      query = query.ilike("position", `%${filters.position}%`);
    }
    if (filters?.job_opening) {
      query = query.eq("job_opening", filters.job_opening);
    }
    if (filters?.domain) {
      query = query.ilike("domain", `%${filters.domain}%`);
    }
    if (filters?.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }
    if (filters?.min_exp) {
      query = query.gte("experience", Number(filters.min_exp));
    }
    if (filters?.max_exp) {
      query = query.lte("experience", Number(filters.max_exp));
    }
    if (filters?.relocate === "true") {
      query = query.eq("will_relocate", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching candidates:", error);
      throw new Error("Failed to fetch candidates");
    }

    return data || [];
  } catch (error) {
    console.error("Error in getCandidates:", error);
    return [];
  }
}

/**
 * Fetch candidates in the talent pool
 * @returns Array of talent pool candidates
 */
export async function getTalentPoolCandidates(): Promise<Candidate[]> {
  // Return empty array if Supabase is not configured
  if (!isSupabaseConfigured || !supabase) {
    console.warn("Supabase not configured. Please add your credentials to .env.local");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("status", "Talent Pool")
      .order("rating", { ascending: false });

    if (error) {
      console.error("Error fetching talent pool candidates:", error);
      throw new Error("Failed to fetch talent pool candidates");
    }

    return data || [];
  } catch (error) {
    console.error("Error in getTalentPoolCandidates:", error);
    return [];
  }
}

/**
 * Fetch a single candidate by ID
 * @param id - Candidate UUID
 * @returns Candidate object or null
 */
export async function getCandidateById(
  id: string
): Promise<Candidate | null> {
  // Return null if Supabase is not configured
  if (!isSupabaseConfigured || !supabase) {
    console.warn("Supabase not configured. Please add your credentials to .env.local");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching candidate:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getCandidateById:", error);
    return null;
  }
}

/**
 * Search candidates by name, email, or skills
 * @param searchQuery - Search string
 * @returns Array of matching candidates
 */
export async function searchCandidates(
  searchQuery: string
): Promise<Candidate[]> {
  // ... existing implementation ...
  // Return empty array if Supabase is not configured
  if (!isSupabaseConfigured || !supabase) {
    console.warn("Supabase not configured. Please add your credentials to .env.local");
    return [];
  }

  try {
    if (!searchQuery.trim()) {
      return getCandidates();
    }

    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .or(
        `name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,role.ilike.%${searchQuery}%`
      )
      .order("match_score", { ascending: false });

    if (error) {
      console.error("Error searching candidates:", error);
      throw new Error("Failed to search candidates");
    }

    return data || [];
  } catch (error) {
    console.error("Error in searchCandidates:", error);
    return [];
  }
}

/**
 * Get unique values for filters
 */
export async function getFilterOptions() {
  if (!isSupabaseConfigured || !supabase) {
    return { positions: [], jobOpenings: [], domains: [] };
  }

  try {
    const { data, error } = await supabase
      .from("candidates")
      .select("position, job_opening, domain");

    if (error) throw error;

    const positions = Array.from(new Set(data?.map(c => c.position).filter(Boolean))) as string[];
    const jobOpenings = Array.from(new Set(data?.map(c => c.job_opening).filter(Boolean))) as string[];
    const domains = Array.from(new Set(data?.map(c => c.domain).filter(Boolean))) as string[];

    return {
      positions: positions.sort(),
      jobOpenings: jobOpenings.sort(),
      domains: domains.sort(),
    };
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return { positions: [], jobOpenings: [], domains: [] };
  }
}

/**
 * Fetch candidates for ranking iteration (ID and Name only)
 */
export async function getCandidatesForRanking(
  filters?: {
    position?: string;
    job_opening?: string;
    domain?: string;
  }
): Promise<{ id: string; name: string }[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  try {
    let query = supabase
      .from("candidates")
      .select("id, name")
      .order("created_at", { ascending: false });

    if (filters?.position) query = query.ilike("position", `%${filters.position}%`);
    if (filters?.job_opening) query = query.eq("job_opening", filters.job_opening);
    if (filters?.domain) query = query.ilike("domain", `%${filters.domain}%`);

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching candidates for ranking:", error);
    return [];
  }
}
