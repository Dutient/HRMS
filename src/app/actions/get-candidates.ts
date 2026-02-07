"use server";

import { supabase, isSupabaseConfigured, type Candidate } from "@/lib/supabase";

/**
 * Fetch all candidates from the database
 * @param status - Optional status filter
 * @returns Array of candidates
 */
export async function getCandidates(
  status?: Candidate["status"]
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
      .order("created_at", { ascending: false });

    // Apply status filter if provided
    if (status) {
      query = query.eq("status", status);
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
