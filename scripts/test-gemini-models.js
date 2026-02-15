const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found in .env.local");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // Note: getGenerativeModel is for inference. To list models we might need the direct API or just try to instantiate one.
        // The SDK doesn't always expose a clean listModels method in the main entry point in all versions, 
        // but usually we can try to hit the underlying API or just test a few models.

        // Actually, strictly speaking the SDK might not have a public listModels method exposed on the main class in this version.
        // Let's try to test specific models instead.

        const modelsToTest = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-flash-001", "gemini-pro", "gemini-1.5-pro"];

        console.log("Testing models availability...");

        for (const modelName of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                // Try a minimal prompt to verify
                const result = await model.generateContent("Hello");
                const response = await result.response;
                console.log(`✅ ${modelName}: Available (Response: ${response.text().slice(0, 20)}...)`);
            } catch (error) {
                console.error(`❌ ${modelName}: Failed`, error); // full error
            }
        }

    } catch (error) {
        console.error("Fatal error:", error);
    }
}

listModels();
