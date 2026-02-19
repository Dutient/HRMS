"use server";

import { createClient } from "@supabase/supabase-js";
import { ChatBedrockConverse } from "@langchain/aws";
import { BedrockEmbeddings } from "@langchain/aws";
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
 * Rank candidates against a job description using a two-stage pipeline:
 *
 * Stage 1 — Vector Shortlist (pgvector cosine similarity via Supabase RPC)
 *   Embeds the JD text with Amazon Titan, then calls match_candidates RPC
 *   to mathematically reduce N filtered candidates → Top 15 shortlist.
 *
 * Stage 2 — Deep AI Scoring (Claude 3.5 Sonnet)
 *   Only the 15 shortlisted candidates are scored by Sonnet, saving ~95%+
 *   of LLM costs at scale.
 *
 * Finally, candidates NOT in the shortlist have their match_score reset
 * to null so they drop to the bottom of the UI grid.
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

  // ──────────────────────────────────────────────────
  // Stage 1: Generate JD Vector & Vector Shortlist
  // ──────────────────────────────────────────────────

  // Step 1a: Embed the JD text → 1536-dim vector
  let jdVector: number[];
  try {
    const embeddings = new BedrockEmbeddings({
      region: process.env.BEDROCK_AWS_REGION,
      model: "amazon.titan-embed-text-v1",
      credentials: {
        accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
      },
    });
    console.log("🧠 Generating JD vector embedding...");
    jdVector = await embeddings.embedQuery(jdText);
    console.log("✅ JD vector generated");
  } catch (err) {
    console.error("❌ Failed to generate JD embedding:", err);
    return {
      success: false,
      message: "Failed to generate JD embedding. Check AWS Bedrock credentials.",
    };
  }

  // Step 1b: Call match_candidates RPC — cosine similarity shortlist
  const MATCH_LIMIT = 15;
  const MATCH_THRESHOLD = 0.3; // minimum similarity to be considered

  const { data: shortlisted, error: rpcError } = await supabase.rpc(
    "match_candidates",
    {
      query_embedding: jdVector,
      match_threshold: MATCH_THRESHOLD,
      match_count: MATCH_LIMIT,
      filter_ids: candidateIds,
    }
  );

  if (rpcError) {
    console.error("❌ RPC match_candidates failed:", rpcError);
    return { success: false, message: `Vector search failed: ${rpcError.message}` };
  }

  if (!shortlisted || shortlisted.length === 0) {
    return {
      success: false,
      message:
        "No candidates passed the similarity threshold. Their resumes may not have embeddings — try re-uploading via Bulk Upload.",
    };
  }

  const shortlistedIds: string[] = shortlisted.map((c: any) => c.id);
  console.log(
    `📊 Vector shortlist: ${shortlistedIds.length} / ${candidateIds.length} candidates passed (threshold: ${MATCH_THRESHOLD})`
  );

  // ──────────────────────────────────────────────────
  // Stage 2: Deep AI Scoring (Sonnet on shortlist only)
  // ──────────────────────────────────────────────────

  // Fetch full resume_text for shortlisted candidates
  const { data: candidates, error: fetchError } = await supabase
    .from("candidates")
    .select("id, name, email, role, resume_text")
    .in("id", shortlistedIds)
    .not("resume_text", "is", null);

  if (fetchError) {
    console.error("❌ Failed to fetch shortlisted candidates:", fetchError);
    return { success: false, message: `DB error: ${fetchError.message}` };
  }

  if (!candidates || candidates.length === 0) {
    return {
      success: false,
      message: "Shortlisted candidates have no resume text. Please re-upload their resumes.",
    };
  }

  console.log(`✅ Fetched ${candidates.length} shortlisted candidates with resume text`);

  const chat = new ChatBedrockConverse({
    region: process.env.BEDROCK_AWS_REGION,
    model: "anthropic.claude-3-5-sonnet-20240620-v1:0",
    credentials: {
      accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
    },
    temperature: 0,
  });

  // Score all shortlisted candidates in parallel
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
      return {
        candidateId: candidate.id,
        name: candidate.name,
        score,
        justification,
      } as RankResult;
    } catch (err) {
      console.error(`❌ Scoring failed for ${candidate.name}:`, err);
      return null;
    }
  });

  const scored = await Promise.all(scoringPromises);
  const results = scored
    .filter((r): r is RankResult => r !== null)
    .sort((a, b) => b.score - a.score);

  // ──────────────────────────────────────────────────
  // Stage 3: Reset non-shortlisted candidates
  // ──────────────────────────────────────────────────

  const nonShortlistedIds = candidateIds.filter(
    (id) => !shortlistedIds.includes(id)
  );

  if (nonShortlistedIds.length > 0) {
    const { error: resetError } = await supabase
      .from("candidates")
      .update({ match_score: null, ai_justification: null })
      .in("id", nonShortlistedIds);

    if (resetError) {
      console.warn("⚠️ Failed to reset non-shortlisted scores:", resetError);
    } else {
      console.log(
        `🔄 Reset match_score to null for ${nonShortlistedIds.length} non-shortlisted candidates`
      );
    }
  }

  // ──────────────────────────────────────────────────
  // Stage 4: Revalidate the candidates page
  // ──────────────────────────────────────────────────

  revalidatePath("/candidates");

  console.log(
    `🏁 Ranking complete. ${results.length}/${candidates.length} shortlisted candidates scored. ` +
    `${nonShortlistedIds.length} candidates reset.`
  );
  return { success: true, results };
}
