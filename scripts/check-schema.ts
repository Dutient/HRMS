
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("Checking 'candidates' table schema...");

    // Try to select the new columns
    const { data, error } = await supabase
        .from("candidates")
        .select("position, job_opening, domain")
        .limit(1);

    if (error) {
        console.error("❌ Error selecting new columns:", error.message);
        if (error.message.includes("does not exist")) {
            console.error("👉 It seems the migration has NOT been run. The columns are missing.");
        }
    } else {
        console.log("✅ Columns 'position', 'job_opening', 'domain' exist.");
        console.log("Sample data:", data);
    }

    // Also check if there is any data in the table
    const { count } = await supabase.from("candidates").select("*", { count: "exact", head: true });
    console.log(`Total candidates in DB: ${count}`);
}

checkSchema().catch(console.error);
