"use server";

import { createClient } from "@supabase/supabase-js";
import { BedrockEmbeddings } from "@langchain/aws";
import pdf from "pdf-parse";

// Initialize Supabase Client with Service Role Key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        persistSession: false,
    },
});

export async function processAndStoreResume(formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const file = formData.get("file") as File;

        if (!file || !name || !email) {
            return { success: false, message: "Missing required fields" };
        }

        if (file.type !== "application/pdf") {
            return { success: false, message: "Only PDF files are supported" };
        }

        // 1. Parse PDF to Text
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const data = await pdf(buffer);
        const rawText = data.text;

        // 2. Generate Embedding using AWS Bedrock (Titan v1 for 1536 dimensions)
        const embeddings = new BedrockEmbeddings({
            region: process.env.BEDROCK_AWS_REGION,
            model: "amazon.titan-embed-text-v1", // Explicitly using v1 for 1536 dimensions
            credentials: {
                accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
            },
        });

        // Generate a single embedding for the entire text
        // Note: Titan v1 has a context window. LangChain or Bedrock might truncate automatically,
        // but ideally we should ensure it fits. For now, we pass the raw text.
        const vector = await embeddings.embedQuery(rawText);

        // 3. Store in Supabase
        const { error } = await supabase.from("candidates").insert({
            name,
            email,
            resume_text: rawText,
            embedding: vector,
            role: "General Application", // Default role per user request
            status: "New",
            source: "Upload Page",
            applied_date: new Date().toISOString().split('T')[0]
        });

        if (error) {
            console.error("Supabase Insertion Error:", error);
            return { success: false, message: `Database error: ${error.message}` };
        }

        return { success: true, message: "Resume processed and stored successfully!" };

    } catch (error) {
        console.error("Processing Error:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}
