"use server";

import { createClient } from "@supabase/supabase-js";
import { BedrockEmbeddings } from "@langchain/aws";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export interface BackfillResult {
  success: boolean;
  processed: number;
  skipped: number;
  failed: number;
  message: string;
}

const BATCH_SIZE = 8; // Stay under Netlify's ~26s function timeout

export async function backfillEmbeddings(): Promise<BackfillResult> {
  console.log("🔄 Starting embedding backfill for candidates with null embedding...");

  const { data: candidates, error } = await supabase
    .from("candidates")
    .select("id, name, email, role, skills, experience, location, qualification, resume_text, notes")
    .is("embedding", null)
    .limit(BATCH_SIZE);

  if (error) {
    console.error("❌ Failed to fetch candidates:", error);
    return { success: false, processed: 0, skipped: 0, failed: 0, message: error.message };
  }

  if (!candidates || candidates.length === 0) {
    console.log("✅ No candidates with null embeddings found.");
    return { success: true, processed: 0, skipped: 0, failed: 0, message: "All candidates already have embeddings." };
  }

  console.log(`📋 Found ${candidates.length} candidates with null embeddings`);

  const embeddings = new BedrockEmbeddings({
    region: process.env.BEDROCK_AWS_REGION,
    model: "amazon.titan-embed-text-v1",
    credentials: {
      accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
    },
  });

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const candidate of candidates) {
    const name = candidate.name || candidate.email || "Unknown";

    // Prefer full resume_text; fall back to constructing from structured fields
    let textToEmbed: string = candidate.resume_text || "";

    if (!textToEmbed) {
      const skillsStr = Array.isArray(candidate.skills) ? candidate.skills.join(", ") : (candidate.skills || "");
      const parts = [
        candidate.name ? `Name: ${candidate.name}` : null,
        candidate.role ? `Role: ${candidate.role}` : null,
        skillsStr ? `Skills: ${skillsStr}` : null,
        candidate.experience != null ? `Experience: ${candidate.experience} years` : null,
        candidate.location ? `Location: ${candidate.location}` : null,
        candidate.qualification ? `Qualification: ${candidate.qualification}` : null,
        candidate.notes ? `Notes: ${candidate.notes}` : null,
      ].filter(Boolean);
      textToEmbed = parts.join(". ");
    }

    if (textToEmbed.length < 10) {
      console.warn(`⚠️ [${name}] Not enough text to embed — skipping`);
      skipped++;
      continue;
    }

    try {
      const vector = await embeddings.embedQuery(textToEmbed);

      const updateData: Record<string, unknown> = { embedding: vector };
      if (!candidate.resume_text && textToEmbed) updateData.resume_text = textToEmbed;

      const { error: updateError } = await supabase
        .from("candidates")
        .update(updateData)
        .eq("id", candidate.id);

      if (updateError) {
        console.error(`❌ [${name}] DB update failed:`, updateError.message);
        failed++;
      } else {
        console.log(`✅ [${name}] Embedding saved`);
        processed++;
      }
    } catch (err) {
      console.error(`❌ [${name}] Embedding failed:`, err);
      failed++;
    }
  }

  // Check if more remain after this batch
  const { count } = await supabase
    .from("candidates")
    .select("id", { count: "exact", head: true })
    .is("embedding", null);

  const remaining = count ?? 0;
  const message = remaining > 0
    ? `Batch done: ${processed} embedded. ${remaining} more remaining — click again to continue.`
    : `All done: ${processed} embedded, ${skipped} skipped, ${failed} failed.`;

  console.log(`🏁 ${message}`);
  return { success: true, processed, skipped, failed, message };
}
