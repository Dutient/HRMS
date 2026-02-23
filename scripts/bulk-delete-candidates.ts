import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function bulkDelete() {
    console.log("🚀 Starting bulk deletion for testing cleanup...");

    console.log(`🔍 Finding ALL candidates for total cleanup...`);

    const { data: candidates, error: findError } = await supabase
        .from("candidates")
        .select("id, name, email");

    if (findError) {
        console.error("❌ Error finding candidates:", findError.message);
        return;
    }

    if (!candidates || candidates.length === 0) {
        console.log("✅ Database is already empty.");
        return;
    }

    console.log(`⚠️ Found ${candidates.length} candidates to delete:`);
    candidates.forEach(c => console.log(`  - ${c.name} (${c.email || "no email"})`));

    const ids = candidates.map(c => c.id);

    const { error: deleteError } = await supabase
        .from("candidates")
        .delete()
        .in("id", ids);

    if (deleteError) {
        console.error("❌ Error during deletion:", deleteError.message);
    } else {
        console.log(`✅ Successfully deleted ${ids.length} candidates.`);
    }
}

bulkDelete().catch(console.error);
