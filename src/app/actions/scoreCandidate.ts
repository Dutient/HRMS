"use server";

import { createClient } from "@supabase/supabase-js";
import { ChatBedrockConverse } from "@langchain/aws";
import { HumanMessage } from "@langchain/core/messages";

// Initialize Supabase (Service Role for RLS bypass logic if needed, but normally Anon is fine if policies allow)
// However, for updates/RPC we might need permissions. Let's use Service Role to be safe for backend logic.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        persistSession: false,
    },
});

export async function scoreSingleCandidate(candidateId: string, jobDescription: string = "General Requirements", manualResumeText?: string) {
    try {
        console.log(`🤖 Scoring Candidate ${candidateId} against JD: "${jobDescription.substring(0, 30)}..."`);

        let resumeText = manualResumeText;
        let candidateName = "Candidate";

        // 1. Fetch Candidate Details if resume text not provided
        if (!resumeText) {
            console.log("📥 Fetching resume text from database...");
            const { data: candidate, error: fetchError } = await supabase
                .from("candidates")
                .select("resume_text, name")
                .eq("id", candidateId)
                .single();

            if (fetchError || !candidate) {
                console.error("❌ Failed to fetch candidate:", fetchError);
                return { success: false, message: "Candidate not found" };
            }

            resumeText = candidate.resume_text;
            candidateName = candidate.name;
        } else {
            console.log("⚡ Using manual resume text (skipping DB fetch)");
        }

        if (!resumeText) {
            console.warn("⚠️ Candidate has no resume text to score.");
            return { success: false, message: "No resume text available" };
        }

        // 2. Score with Claude 3.5 Sonnet
        const chat = new ChatBedrockConverse({
            region: process.env.BEDROCK_AWS_REGION,
            model: "anthropic.claude-3-5-sonnet-20240620-v1:0",
            credentials: {
                accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
            },
            temperature: 0,
        });

        const prompt = `
You are an expert HR AI Recruiter. 
Evaluate the following Candidate Resume against the Job Description.

Job Description:
"${jobDescription}"

Candidate Resume:
"${resumeText.substring(0, 10000)}" 

Task:
1. Assign a Match Score (0-100) indicating how well the candidate fits the role.
2. Provide a 1-sentence justification explaining the score.

Output JSON only in this format:
{
  "score": 85,
  "justification": "Candidate has strong React skills but lacks Python experience mentioned in JD."
}
`;

        const response = await chat.invoke([new HumanMessage(prompt)]);
        const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

        // Extract JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        let score = null;
        let justification = null;

        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                score = parsed.score;
                justification = parsed.justification;
            } catch (e) {
                console.error("❌ Failed to parse JSON from Claude:", e);
                // Fallback or just logs?
            }
        }

        if (score !== null) {
            // 3. Update Candidate Record
            const { error: updateError } = await supabase
                .from("candidates")
                .update({
                    match_score: score,
                    ai_justification: justification
                })
                .eq("id", candidateId);

            if (updateError) {
                console.error("❌ Failed to update candidate score:", updateError);
                return { success: false, message: `Database update failed: ${updateError.message}` };
            }

            console.log(`✅ Scored Candidate ${candidateName}: ${score}% - ${justification}`);
            return { success: true, score, justification };
        } else {
            console.warn("⚠️ AI did not return a valid score.");
            return { success: false, message: "AI scoring failed" };
        }

    } catch (error) {
        console.error("❌ Scoring Process Failed:", error);
        return { success: false, message: error instanceof Error ? error.message : "Unexpected error" };
    }
}
