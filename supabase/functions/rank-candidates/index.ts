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
}

interface RankingResult {
  id: string;
  match_score: number;
  reasoning: string;
}

serve(async (req) => {
  // Handle CORS preflight
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

  try {
    const body = await req.json()
    jobId = body.jobId
    const jobDescription = body.jobDescription

    if (!jobId || !jobDescription) {
      throw new Error('Missing jobId or jobDescription')
    }

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    console.log(`🎯 Starting ranking job ${jobId}`)

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)

    // Update job status to processing
    await supabase
      .from('ranking_jobs')
      .update({
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .eq('id', jobId)

    // Fetch all candidates
    console.log('📊 Fetching candidates from database...')
    const { data: candidates, error: fetchError } = await supabase
      .from('candidates')
      .select('id, name, skills, summary, experience, role')
      .order('created_at', { ascending: false })

    if (fetchError) {
      throw new Error(`Database error: ${fetchError.message}`)
    }

    if (!candidates || candidates.length === 0) {
      throw new Error('No candidates found to rank')
    }

    console.log(`✅ Found ${candidates.length} candidates to rank`)

    // Update total count
    await supabase
      .from('ranking_jobs')
      .update({ total_candidates: candidates.length })
      .eq('id', jobId)

    // Process candidates in batches of 5 for better reliability (reduced from 10)
    const BATCH_SIZE = 5
    const batches = []
    for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
      batches.push(candidates.slice(i, i + BATCH_SIZE))
    }

    console.log(`🤖 Processing ${batches.length} batches...`)

    let processedCount = 0
    const allRankings: RankingResult[] = []

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      console.log(`Processing batch ${batchIndex + 1}/${batches.length}`)

      try {
        // Rank this batch with Gemini
        const rankings = await rankBatchWithGemini(jobDescription, batch)
        allRankings.push(...rankings)

        // Update Supabase with scores
        for (const ranking of rankings) {
          await supabase
            .from('candidates')
            .update({ match_score: ranking.match_score })
            .eq('id', ranking.id)
        }

        processedCount += batch.length

        // Update progress
        await supabase
          .from('ranking_jobs')
          .update({ processed_candidates: processedCount })
          .eq('id', jobId)

        console.log(`✅ Processed ${processedCount}/${candidates.length} candidates`)

        // Small delay to avoid rate limits (Gemini free tier: 15 RPM)
        await new Promise(resolve => setTimeout(resolve, 5000)) // 5 seconds for safety

      } catch (error) {
        console.error(`❌ Error processing batch ${batchIndex + 1}:`, error)
        
        // Give failed candidates a default score of 0 so they don't appear blank
        console.log(`⚠️ Setting default score of 0 for ${batch.length} candidates in failed batch`)
        for (const candidate of batch) {
          try {
            await supabase
              .from('candidates')
              .update({ match_score: 0 })
              .eq('id', candidate.id)
            console.log(`  - Set score 0 for candidate ${candidate.id}`)
          } catch (updateError) {
            console.error(`  - Failed to set default score for ${candidate.id}:`, updateError)
          }
        }
        
        // Continue with next batch even if one fails
        processedCount += batch.length
        await supabase
          .from('ranking_jobs')
          .update({ processed_candidates: processedCount })
          .eq('id', jobId)
      }
    }

    // Mark job as completed
    await supabase
      .from('ranking_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        processed_candidates: candidates.length
      })
      .eq('id', jobId)

    console.log(`✅ Job ${jobId} completed successfully`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully ranked ${allRankings.length} candidates`,
        jobId
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    )

  } catch (error) {
    console.error('❌ Fatal error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    // Try to update job status to failed if we have a jobId
    if (jobId) {
      try {
        const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
        await supabase
          .from('ranking_jobs')
          .update({
            status: 'failed',
            error_message: errorMessage,
            completed_at: new Date().toISOString()
          })
          .eq('id', jobId)
      } catch (updateError) {
        console.error('Failed to update job status:', updateError)
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    )
  }
})

/**
 * Rank a batch of candidates using Gemini AI
 */
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

CRITICAL: Return ONLY the JSON array, no additional text, no markdown formatting.`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      throw new Error('No response from Gemini API')
    }

    // Clean up the response
    let jsonText = text.trim()
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "")
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "")
    }

    const rankings = JSON.parse(jsonText) as RankingResult[]

    if (!Array.isArray(rankings)) {
      throw new Error("AI response is not an array")
    }

    // Ensure all candidates have a score
    const rankedIds = new Set(rankings.map((r) => r.id))
    const missingCandidates = candidates.filter((c) => !rankedIds.has(c.id))

    for (const candidate of missingCandidates) {
      rankings.push({
        id: candidate.id,
        match_score: 0,
        reasoning: "Unable to rank this candidate",
      })
    }

    // Clamp scores between 0-100
    return rankings.map((r) => ({
      ...r,
      match_score: Math.max(0, Math.min(100, r.match_score)),
    }))

  } catch (error) {
    console.error("❌ Error in Gemini API call:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to rank candidates: ${errorMessage}`)
  }
}
