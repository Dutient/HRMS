import { createClient } from "@supabase/supabase-js";

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Helper to check if Supabase is configured
const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = 
  isValidUrl(supabaseUrl) && 
  supabaseAnonKey.length > 0 && 
  !supabaseUrl.includes("your-project-url-here");

// Create a single supabase client for interacting with the database
// Only create if properly configured
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Type definitions for the database
export interface Candidate {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  avatar_url: string | null;
  role: string;
  experience: number | null;
  skills: string[];
  status:
    | "New"
    | "Screening"
    | "Interview"
    | "Final Round"
    | "Selected"
    | "Rejected"
    | "Talent Pool";
  source: string | null;
  applied_date: string;
  match_score: number | null;
  summary: string | null;
  resume_url: string | null;
  availability: string | null;
  rating: number | null;
  last_engaged: string | null;
  updated_at: string;
}
