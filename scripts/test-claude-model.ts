/**
 * Run with: npx tsx scripts/test-claude-model.ts
 * Tests that the Claude model ID works via AWS Bedrock before deploying.
 */

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { ChatBedrockConverse } from "@langchain/aws";
import { HumanMessage } from "@langchain/core/messages";

const MODEL_ID = "amazon.nova-micro-v1:0";

async function run() {
  console.log(`🧪 Testing model: ${MODEL_ID}`);
  console.log(`🌍 Region: ${process.env.BEDROCK_AWS_REGION}\n`);

  const chat = new ChatBedrockConverse({
    region: process.env.BEDROCK_AWS_REGION,
    model: MODEL_ID,
    credentials: {
      accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
    },
    temperature: 0,
  });

  try {
    const response = await chat.invoke([
      new HumanMessage('Reply with exactly this JSON: {"score": 85, "justification": "Test passed"}'),
    ]);

    const content = typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

    console.log("✅ Model responded:", content);
  } catch (err) {
    console.error("❌ Model call failed:", err);
    process.exit(1);
  }
}

run();
