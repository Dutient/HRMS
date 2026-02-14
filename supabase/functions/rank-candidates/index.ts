// Supabase Edge Function: Rank Candidates
// This function runs without timeout limits and handles large batches
// Deploy with: supabase functions deploy rank-candidates

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

interface CandidateForRanking {
  id: string;
  name: string;
  skills: string[];
  summary: string;
  experience: number;
  role: string;
  position?: string;
  job_opening?: string;
  domain?: string;
}

interface RankingResult {
  id: string;
  match_score: number;
  reasoning: string;
}

// ------------------------------------------------------------------
// Helper: Delay
// ------------------------------------------------------------------
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ------------------------------------------------------------------
// Helper: Rank a batch with Gemini (Single Attempt)
// ------------------------------------------------------------------
async function rankBatchWithGemini(
  jdText: string,
  candidates: CandidateForRanking[]
): Promise<RankingResult[]> {
  const candidatesInfo = candidates.map((c) => ({
    id: c.id,
    name: c.name,
    role: c.role,
    experience: c.experience,
    skills: c.skills ? c.skills.join(", ") : "No skills listed",
    summary: c.summary,
    position: c.position,
    matches_job: c.job_opening ? `Applied for ${c.job_opening}` : undefined,
  }))

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
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })

    if (!response.ok) {
      // If 429, throw specific error to be caught by retry logic
      if (response.status === 429) {
        throw new Error(`429 Too Many Requests`);
      }
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) throw new Error('No response from Gemini API')

    // Clean up response
    let jsonText = text.trim()
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "")
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "")
    }

    const rankings = JSON.parse(jsonText) as RankingResult[]
    if (!Array.isArray(rankings)) throw new Error("AI response is not an array")

    return rankings
  } catch (error) {
    console.error("❌ Error in Gemini API call:", error)
    throw error;
  }
}

// ------------------------------------------------------------------
// Helper: Retry with Exponential Backoff
// ------------------------------------------------------------------
async function retryRankBatchWithGemini(
  jdText: string,
  candidates: CandidateForRanking[],
  maxRetries = 3
): Promise<RankingResult[]> {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await rankBatchWithGemini(jdText, candidates);
    } catch (error: any) {
      const is429 = error.message.includes("429");

      if (is429 && attempt < maxRetries) {
        attempt++;
        const waitTime = 5000 * Math.pow(2, attempt - 1); // 5s, 10s, 20s
        console.warn(`⚠️ Gemini 429 (Attempt ${attempt}/${maxRetries}). Waiting ${waitTime / 1000}s...`);
        await delay(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Exceeded max retries");
}

// ------------------------------------------------------------------
// Main Entry Point
// ------------------------------------------------------------------
serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  let jobId: string | null = null;
  const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)

  try {
    const { jobId: id, jobDescription, filters } = await req.json()
    jobId = id

    if (!jobId || !jobDescription) throw new Error('Missing jobId or jobDescription')
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured')

    console.log(`🎯 Starting ranking job ${jobId}`)

    // Update status to processing
    await supabase.from('ranking_jobs')
      .update({ status: 'processing', started_at: new Date().toISOString() })
      .eq('id', jobId)

    // Build query with filters
    console.log('📊 Fetching candidates...')
    let query = supabase.from('candidates')
      .select('id, name, skills, summary, experience, role, position, job_opening, domain')
      .order('created_at', { ascending: false })

    if (filters?.position) query = query.ilike('position', `%${filters.position}%`)
    if (filters?.job_opening) query = query.eq('job_opening', filters.job_opening)
    if (filters?.domain) query = query.ilike('domain', `%${filters.domain}%`)

    const { data: candidates, error: fetchError } = await query

    if (fetchError) throw new Error(`Database error: ${fetchError.message}`)
    if (!candidates || candidates.length === 0) throw new Error('No candidates found to rank')

    console.log(`✅ Found ${candidates.length} candidates to rank`)

    await supabase.from('ranking_jobs').update({ total_candidates: candidates.length }).eq('id', jobId)

    // Batching
    const BATCH_SIZE = 5
    const batches = []
    for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
      batches.push(candidates.slice(i, i + BATCH_SIZE))
    }

    console.log(`🤖 Processing ${batches.length} batches...`)
    let processedCount = 0

    // SEQUENTIAL LOOP
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing batch ${i + 1}/${batches.length}`);

      try {
        const rankings = await retryRankBatchWithGemini(jobDescription, batch);

        // Update scores
        for (const r of rankings) {
          await supabase.from('candidates')
            .update({ match_score: Math.max(0, Math.min(100, r.match_score)) })
            .eq('id', r.id)
        }
      } catch (error) {
        console.error(`❌ Failed batch ${i + 1}:`, error)
        // Set 0 for failed batch
        for (const c of batch) {
          await supabase.from('candidates').update({ match_score: 0 }).eq('id', c.id)
        }
      }

      processedCount += batch.length
      await supabase.from('ranking_jobs').update({ processed_candidates: processedCount }).eq('id', jobId)

      // Rate Limit Delay
      if (i < batches.length - 1) {
        console.log("⏳ Waiting 4s for rate limit...");
        await delay(4000);
      }
    }

    // Complete
    await supabase.from('ranking_jobs')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', jobId)

    return new Response(JSON.stringify({ success: true, message: 'Ranking completed' }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error(`❌ Fatal error:`, error)
    if (jobId) {
      await supabase.from('ranking_jobs')
        .update({ status: 'failed', error_message: error.message })
        .eq('id', jobId)
    }
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }
})
