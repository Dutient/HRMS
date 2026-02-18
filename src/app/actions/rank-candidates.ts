"use server";

import { createClient } from "@supabase/supabase-js";
import { ChatBedrockConverse } from "@langchain/aws";
import { HumanMessage } from "@langchain/core/messages";
import { revalidatePath } from "next/cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export interface RankResult {
  candidateId: string;
  name: string;
  score: number;
  justification: string;
}

/**
 * Score a list of candidates against a job description using Claude 3.5 Sonnet.
 * Persists match_score and ai_justification to the DB for each candidate.
 * Revalidates /candidates so the page reflects updated scores immediately.
 */
export async function rankCandidates(
  jdText: string,
  candidateIds: string[]
): Promise<{ success: boolean; results?: RankResult[]; message?: string }> {
  if (!jdText || jdText.trim().length < 20) {
    return { success: false, message: "Job description is too short." };
  }
  if (!candidateIds || candidateIds.length === 0) {
    return { success: false, message: "No candidates selected." };
  }

  console.log(`🎯 Ranking ${candidateIds.length} candidates against JD...`);

  // Fetch candidate resume text from DB
  const { data: candidates, error: fetchError } = await supabase
    .from("candidates")
    .select("id, name, email, role, resume_text")
    .in("id", candidateIds)
    .not("resume_text", "is", null);

  if (fetchError) {
    console.error("❌ Failed to fetch candidates:", fetchError);
    return { success: false, message: `DB error: ${fetchError.message}` };
  }

  if (!candidates || candidates.length === 0) {
    return {
      success: false,
      message:
        "None of the selected candidates have resume text. Please re-upload their resumes via Bulk Upload.",
    };
  }

  console.log(`✅ Fetched ${candidates.length} candidates with resume text`);

  const chat = new ChatBedrockConverse({
    region: process.env.BEDROCK_AWS_REGION,
    model: "anthropic.claude-3-5-sonnet-20240620-v1:0",
    credentials: {
      accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
    },
    temperature: 0,
  });

  // Score all candidates in parallel with Claude
  const scoringPromises = candidates.map(async (candidate) => {
    const prompt = `You are an expert HR AI Recruiter.
Compare the Candidate Resume below against the Job Description and return ONLY a JSON object.

Job Description:
"${jdText}"

Candidate Resume:
"${(candidate.resume_text || "").substring(0, 4000)}"

Return JSON only:
{
  "score": <integer 0-100>,
  "justification": "<one sentence explaining the score>"
}`;

    try {
      const response = await chat.invoke([new HumanMessage(prompt)]);
      const content =
        typeof response.content === "string"
          ? response.content
          : JSON.stringify(response.content);

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in Claude response");

      const parsed = JSON.parse(jsonMatch[0]);
      const score = Math.max(0, Math.min(100, parseInt(parsed.score, 10)));
      const justification = parsed.justification || "";

      // Persist to DB
      await supabase
        .from("candidates")
        .update({ match_score: score, ai_justification: justification })
        .eq("id", candidate.id);

      console.log(`✅ Scored ${candidate.name}: ${score}%`);
      return { candidateId: candidate.id, name: candidate.name, score, justification } as RankResult;
    } catch (err) {
      console.error(`❌ Scoring failed for ${candidate.name}:`, err);
      return null;
    }
  });

  const scored = await Promise.all(scoringPromises);
  const results = scored
    .filter((r): r is RankResult => r !== null)
    .sort((a, b) => b.score - a.score);

  // Revalidate so the candidates page re-fetches from DB
  revalidatePath("/candidates");

  console.log(`🏁 Ranking complete. ${results.length}/${candidates.length} candidates scored.`);
  return { success: true, results };
}
