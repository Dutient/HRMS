
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load env
try {
    const envPath = path.resolve(__dirname, "..", ".env.local");
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach(line => {
        const [key, value] = line.split("=");
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.log("Could not load .env.local, checking process.env");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking schema...");
    const { data, error } = await supabase.from("candidates").select("position").limit(1);

    if (error) {
        console.error("Error:", error.message);
        if (error.code === 'PGRST204' || error.message.includes("does not exist")) {
            console.log("MIGRATION_MISSING");
        }
    } else {
        console.log("MIGRATION_PRESENT");
        console.log("Data sample:", data);
    }
}

check();
