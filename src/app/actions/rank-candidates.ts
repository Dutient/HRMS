"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface CandidateForRanking {
  id: string;
  name: string;
  skills: string[];
  summary: string;
  experience: number;
  role: string;
}

interface RankingResult {
  id: string;
  match_score: number;
  reasoning: string;
}

/**
 * Rank candidates against a job description using AI
 */
export async function rankCandidates(jdText: string): Promise<{
  success: boolean;
  message: string;
  rankedCount?: number;
}> {
  try {
    console.log("🎯 Starting candidate ranking process...");

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

    // Check Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        message: "AI service not configured",
      };
    }

    // Step A: Fetch all candidates from Supabase
    console.log("📊 Fetching candidates from database...");
    const { data: candidates, error: fetchError } = await supabase
      .from("candidates")
      .select("id, name, skills, summary, experience, role")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("❌ Error fetching candidates:", fetchError);
      return {
        success: false,
        message: `Database error: ${fetchError.message}`,
      };
    }

    if (!candidates || candidates.length === 0) {
      return {
        success: false,
        message: "No candidates found to rank",
      };
    }

    console.log(`✅ Found ${candidates.length} candidates to rank`);

    // Step B: Batched AI Processing
    console.log("🤖 Analyzing candidates with Gemini AI...");
    const rankings = await rankWithAI(jdText, candidates as CandidateForRanking[]);

    console.log(`✅ Received rankings for ${rankings.length} candidates`);

    // Step C: Bulk update in Supabase
    console.log("💾 Updating match scores in database...");
    let successCount = 0;
    let errorCount = 0;

    for (const ranking of rankings) {
      const { error: updateError } = await supabase
        .from("candidates")
        .update({ match_score: ranking.match_score })
        .eq("id", ranking.id);

      if (updateError) {
        console.error(`❌ Error updating candidate ${ranking.id}:`, updateError);
        errorCount++;
      } else {
        successCount++;
      }
    }

    console.log(`✅ Updated ${successCount} candidates successfully`);
    if (errorCount > 0) {
      console.warn(`⚠️ Failed to update ${errorCount} candidates`);
    }

    // Step D: Revalidate cache
    revalidatePath("/candidates");

    return {
      success: true,
      message: `Successfully ranked ${successCount} candidates`,
      rankedCount: successCount,
    };
  } catch (error) {
    console.error("❌ Fatal error ranking candidates:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Use Gemini AI to rank candidates against job description
 */
async function rankWithAI(
  jdText: string,
  candidates: CandidateForRanking[]
): Promise<RankingResult[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  // Format candidates for the prompt
  const candidatesInfo = candidates.map((c) => ({
    id: c.id,
    name: c.name,
    role: c.role,
    experience: c.experience,
    skills: c.skills ? c.skills.join(", ") : "No skills listed",
    summary: c.summary,
  }));

  const prompt = `You are an expert technical recruiter. Compare the following candidates against the provided Job Description (JD). 

Job Description:
${jdText}

Candidates to Rank:
${JSON.stringify(candidatesInfo, null, 2)}

Instructions:
1. Analyze each candidate's skills, experience, role, and summary against the JD requirements.
2. Score each candidate from 0-100:
   - 90-100: Exceptional match, exceeds requirements
   - 80-89: Strong match, meets all key requirements
   - 70-79: Good match, meets most requirements
   - 60-69: Moderate match, some gaps
   - 40-59: Weak match, significant gaps
   - 0-39: Poor match, not suitable
3. Provide a brief reasoning (1-2 sentences) for each score.

Return ONLY a valid JSON array with this exact structure:
[
  {
    "id": "candidate_id",
    "match_score": 85,
    "reasoning": "Brief explanation"
  }
]

CRITICAL: Return ONLY the JSON array, no additional text, no markdown formatting.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    const rankings = JSON.parse(jsonText) as RankingResult[];

    // Validate rankings
    if (!Array.isArray(rankings)) {
      throw new Error("AI response is not an array");
    }

    // Ensure all candidates have a score
    const rankedIds = new Set(rankings.map((r) => r.id));
    const missingCandidates = candidates.filter((c) => !rankedIds.has(c.id));

    // Add default scores for missing candidates
    for (const candidate of missingCandidates) {
      rankings.push({
        id: candidate.id,
        match_score: 0,
        reasoning: "Unable to rank this candidate",
      });
    }

    // Clamp scores between 0-100
    return rankings.map((r) => ({
      ...r,
      match_score: Math.max(0, Math.min(100, r.match_score)),
    }));
  } catch (error) {
    console.error("❌ Error in AI ranking:", error);
    throw new Error("Failed to rank candidates with AI");
  }
}
