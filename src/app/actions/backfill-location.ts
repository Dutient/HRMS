"use server";

/**
 * One-time backfill: extract location from resume_text for candidates
 * where location is NULL. Uses regex — zero LLM calls, zero cost.
 *
 * Typical resume header patterns:
 *   "New Delhi, India 110085 ◆ 09654528922"
 *   "Mumbai, India | email@example.com"
 *   "San Francisco, CA 94102 • (555) 123-4567"
 *   "Bangalore, Karnataka, India"
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

interface BackfillResult {
    total: number;
    updated: number;
    skipped: number;
    details: { id: string; name: string; location: string | null }[];
}

// ── Known Indian cities / major global cities for validation ──────────────
const KNOWN_CITIES = [
    // Indian cities
    "Mumbai", "Delhi", "New Delhi", "Bangalore", "Bengaluru", "Hyderabad",
    "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
    "Gurgaon", "Gurugram", "Noida", "Chandigarh", "Indore", "Bhopal",
    "Nagpur", "Patna", "Kochi", "Coimbatore", "Thiruvananthapuram",
    "Visakhapatnam", "Surat", "Vadodara", "Mysore", "Mysuru",
    // Global cities
    "San Francisco", "New York", "London", "Singapore", "Dubai",
    "Toronto", "Sydney", "Berlin", "Amsterdam", "Tokyo", "Paris",
    "Seattle", "Austin", "Chicago", "Boston", "Los Angeles",
];

/**
 * Extract location from the first ~500 chars of resume text
 * (where contact/header info typically lives).
 */
function extractLocationFromText(resumeText: string): string | null {
    if (!resumeText) return null;

    // Focus on the header section (first 500 chars)
    const header = resumeText.substring(0, 500);

    // Pattern 1: "City, Country/State ZIPCODE" (e.g., "New Delhi, India 110085")
    const cityCountryZip = header.match(
        /([A-Z][a-zA-Z\s]+),\s*(India|USA|UK|Canada|Australia|Germany|Singapore|UAE|Dubai|[A-Z]{2})\s*\d{0,6}/i
    );
    if (cityCountryZip) {
        const city = cityCountryZip[1].trim();
        const country = cityCountryZip[2].trim();
        // Validate it's a real city, not a random match
        if (KNOWN_CITIES.some((kc) => city.toLowerCase().includes(kc.toLowerCase()))) {
            return `${city}, ${country}`;
        }
    }

    // Pattern 2: "City, State, Country" (e.g., "Bangalore, Karnataka, India")
    const cityStateCountry = header.match(
        /([A-Z][a-zA-Z\s]+),\s*([A-Z][a-zA-Z\s]+),\s*(India|USA|UK|Canada|Australia)/i
    );
    if (cityStateCountry) {
        return `${cityStateCountry[1].trim()}, ${cityStateCountry[3].trim()}`;
    }

    // Pattern 3: Check for known city names anywhere in header
    for (const city of KNOWN_CITIES) {
        const regex = new RegExp(`\\b${city}\\b`, "i");
        if (regex.test(header)) {
            // Try to grab "City, Country/State" context
            const contextMatch = header.match(
                new RegExp(`(${city}[,\\s]+[A-Za-z\\s]+?)(?:\\s*[◆•|\\-\\d]|\\n)`, "i")
            );
            if (contextMatch) {
                // Clean up trailing whitespace and common separators
                return contextMatch[1].replace(/[,\s]+$/, "").trim();
            }
            return city;
        }
    }

    return null;
}

/**
 * Backfill location for all candidates where location IS NULL.
 */
export async function backfillCandidateLocations(): Promise<BackfillResult> {
    if (!isSupabaseConfigured || !supabase) {
        return { total: 0, updated: 0, skipped: 0, details: [] };
    }

    // Fetch candidates with NULL location
    const { data: candidates, error } = await supabase
        .from("candidates")
        .select("id, name, resume_text, location")
        .is("location", null);

    if (error) {
        console.error("Error fetching candidates for backfill:", error);
        throw new Error(`Failed to fetch candidates: ${error.message}`);
    }

    if (!candidates || candidates.length === 0) {
        return { total: 0, updated: 0, skipped: 0, details: [] };
    }

    let updated = 0;
    let skipped = 0;
    const details: BackfillResult["details"] = [];

    for (const candidate of candidates) {
        const location = extractLocationFromText(candidate.resume_text || "");

        if (location) {
            const { error: updateError } = await supabase
                .from("candidates")
                .update({ location })
                .eq("id", candidate.id);

            if (updateError) {
                console.error(`Failed to update ${candidate.name}:`, updateError);
                skipped++;
                details.push({ id: candidate.id, name: candidate.name, location: null });
            } else {
                updated++;
                details.push({ id: candidate.id, name: candidate.name, location });
                console.log(`✅ ${candidate.name} → ${location}`);
            }
        } else {
            skipped++;
            details.push({ id: candidate.id, name: candidate.name, location: null });
            console.log(`⏭️ ${candidate.name} → no location found`);
        }
    }

    revalidatePath("/candidates");

    return {
        total: candidates.length,
        updated,
        skipped,
        details,
    };
}
