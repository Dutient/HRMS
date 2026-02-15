// Supabase Edge Function: Rank Single Candidate
// This function ranks a single candidate against a JD
// Deploy with: supabase functions deploy rank-candidates

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

interface RankingResult {
  match_score: number;
  reasoning: string;
}

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

  try {
    const { candidateId, jdText } = await req.json()

    if (!candidateId || !jdText) {
      throw new Error('Missing candidateId or jdText')
    }
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)

    // 1. Fetch Candidate Details
    const { data: candidate, error: fetchError } = await supabase
      .from('candidates')
      .select('id, name, skills, summary, experience, role, position, job_opening')
      .eq('id', candidateId)
      .single()

    if (fetchError || !candidate) {
      throw new Error(`Candidate not found: ${fetchError?.message}`)
    }

    // 2. Construct Prompt for Gemini
    const candidateInfo = {
      name: candidate.name,
      role: candidate.role,
      experience: candidate.experience,
      skills: candidate.skills,
      summary: candidate.summary,
      position: candidate.position,
      applied_for: candidate.job_opening
    }

    const prompt = `You are an expert technical recruiter. Analyze the following candidate against the Job Description (JD).

Job Description:
${jdText}

Candidate Profile:
${JSON.stringify(candidateInfo, null, 2)}

Instructions:
1. Evaluate the candidate's skills, experience, and role alignment with the JD.
2. Assign a match score from 0 to 100.
3. Provide a concise 1-sentence reasoning.

Return ONLY a JSON object:
{
  "match_score": 85,
  "reasoning": "Strong match due to..."
}`;

    // 3. Call Gemini API
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) throw new Error('Empty response from Gemini')

    // 4. Parse Response
    let jsonText = text.trim()
      .replace(/^```json\s*/, "")
      .replace(/^```\s*/, "")
      .replace(/\s*```$/, "");

    const result = JSON.parse(jsonText) as RankingResult

    // Clamp score
    const score = Math.max(0, Math.min(100, result.match_score))

    // 5. Update Candidate in Supabase
    const { error: updateError } = await supabase
      .from('candidates')
      .update({
        match_score: score,
        // Optional: We could save reasoning if we had a column for it
      })
      .eq('id', candidateId)

    if (updateError) {
      throw new Error(`Failed to update candidate: ${updateError.message}`)
    }

    return new Response(JSON.stringify({
      success: true,
      score,
      reasoning: result.reasoning
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error("❌ Error:", error.message)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
