"use server";

import { createClient } from "@supabase/supabase-js";
import { BedrockEmbeddings } from "@langchain/aws";
import { ChatBedrockConverse } from "@langchain/aws";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// Initialize Supabase (Service Role for RLS bypass logic if needed, but normally Anon is fine if policies allow)
// However, for RPC we might need permissions. Let's use Service Role to be safe for backend logic.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        persistSession: false,
    },
});

export interface MatchResult {
    candidateId: string;
    name: string;
    email: string;
    role: string;
    matchScore: number;
    justification: string;
}

export async function matchCandidates(jobDescription: string): Promise<MatchResult[]> {
    try {
        console.log("🔍 Starting Match Process for JD:", jobDescription.substring(0, 50) + "...");

        // 1. Convert Job Description to Vector Embedding (Titan v1)
        const embeddings = new BedrockEmbeddings({
            region: process.env.BEDROCK_AWS_REGION,
            model: "amazon.titan-embed-text-v1",
            credentials: {
                accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
            },
        });

        const jdVector = await embeddings.embedQuery(jobDescription);
        console.log("✅ Generated JD Vector");

        // 2. Perform Vector Search via Supabase RPC
        const { data: candidates, error } = await supabase.rpc("match_candidates", {
            query_embedding: jdVector,
            match_threshold: 0.1, // Loose threshold to get enough candidates
            match_count: 5 // Get top 5 for ranking
        });

        if (error) {
            console.error("❌ RPC Error:", error);
            throw new Error(`Vector search failed: ${error.message}`);
        }

        if (!candidates || candidates.length === 0) {
            console.log("⚠️ No candidates found matching criteria");
            return [];
        }

        console.log(`✅ Found ${candidates.length} candidates for ranking`);

        // 3. Rank with Claude 3.5 Sonnet
        const chat = new ChatBedrockConverse({
            region: process.env.BEDROCK_AWS_REGION,
            model: "anthropic.claude-3-5-sonnet-20240620-v1:0",
            credentials: {
                accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
            },
            temperature: 0,
        });

        const results: MatchResult[] = [];

        // Process each candidate (could be parallelized)
        // For 5 candidates, serial is okay but `Promise.all` is faster.
        const rankingPromises = candidates.map(async (candidate: any) => {
            const prompt = `
You are an expert HR AI Recruiter. 
Compare the following Candidate Resume against the Job Description.

Job Description:
"${jobDescription}"

Candidate Resume:
"${candidate.resume_text.substring(0, 4000)}" 

Task:
1. Assign a Match Score (0-100) indicating how well the candidate fits the role.
2. Provide a 1-sentence justification.

Output JSON only in this format:
{
  "score": 85,
  "justification": "Candidate has strong React skills but lacks Python experience mentioned in JD."
}
`;
            try {
                const response = await chat.invoke([new HumanMessage(prompt)]);
                const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

                // Extract JSON
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    return {
                        candidateId: candidate.id,
                        name: candidate.name,
                        email: candidate.email,
                        role: candidate.role,
                        matchScore: parsed.score,
                        justification: parsed.justification
                    };
                }
            } catch (err) {
                console.error(`❌ Ranking failed for ${candidate.name}:`, err);
            }
            return null;
        });

        const ranked = await Promise.all(rankingPromises);

        // Filter out nulls and sort by score
        const finalResults = ranked
            .filter((r): r is MatchResult => r !== null)
            .sort((a, b) => b.matchScore - a.matchScore);

        return finalResults;

    } catch (error) {
        console.error("❌ Match Process Failed:", error);
        throw error;
    }
}
