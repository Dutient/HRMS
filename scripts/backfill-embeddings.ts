/**
 * Run with: npx tsx scripts/backfill-embeddings.ts
 * Reads credentials from .env.local
 */

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";
import { BedrockEmbeddings } from "@langchain/aws";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const embeddings = new BedrockEmbeddings({
  region: process.env.BEDROCK_AWS_REGION,
  model: "amazon.titan-embed-text-v1",
  credentials: {
    accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
  },
});

async function run() {
  const { data: candidates, error } = await supabase
    .from("candidates")
    .select("id, name, email, role, skills, experience, location, qualification, resume_text, notes")
    .is("embedding", null);

  if (error) { console.error("❌ Fetch failed:", error.message); process.exit(1); }
  if (!candidates?.length) { console.log("✅ All candidates already have embeddings."); return; }

  console.log(`📋 ${candidates.length} candidates need embeddings\n`);

  let processed = 0, skipped = 0, failed = 0;

  for (const c of candidates) {
    const name = c.name || c.email || "Unknown";

    let text: string = c.resume_text || "";
    if (!text) {
      const skillsStr = Array.isArray(c.skills) ? c.skills.join(", ") : (c.skills || "");
      text = [
        c.name        ? `Name: ${c.name}`                   : null,
        c.role        ? `Role: ${c.role}`                   : null,
        skillsStr     ? `Skills: ${skillsStr}`              : null,
        c.experience != null ? `Experience: ${c.experience} years` : null,
        c.location    ? `Location: ${c.location}`           : null,
        c.qualification ? `Qualification: ${c.qualification}` : null,
        c.notes       ? `Notes: ${c.notes}`                 : null,
      ].filter(Boolean).join(". ");
    }

    if (text.length < 10) {
      console.log(`⚠️  [${name}] Not enough text — skipped`);
      skipped++;
      continue;
    }

    try {
      const vector = await embeddings.embedQuery(text);
      const updateData: Record<string, unknown> = { embedding: vector };
      if (!c.resume_text) updateData.resume_text = text;

      const { error: updateError } = await supabase
        .from("candidates").update(updateData).eq("id", c.id);

      if (updateError) {
        console.error(`❌ [${name}] DB update failed: ${updateError.message}`);
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

  console.log(`\n🏁 Done: ${processed} embedded, ${skipped} skipped, ${failed} failed.`);
}

run();
