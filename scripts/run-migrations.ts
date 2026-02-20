
import postgres from 'postgres';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    // Construct from Supabase URL if DATABASE_URL not present (though usually it is for pooling)
    // Fallback: Ask user or try to construct.
    // For now, let's assume valid connection string is needed. 
    // Supabase usually provides a connection string in dashboard. 
    // If not in env, we might be stuck. 
    // Let's check if we can use the service key to run SQL via REST API? No, not directly without an extension.
    console.error("DATABASE_URL is missing in .env.local. Cannot run migrations.");
    process.exit(1);
}

const sql = postgres(dbUrl);

async function runMigration() {
    try {
        const files = [
            'supabase/migrations/014_add_location_and_cloud_fields.sql',
            'supabase/migrations/013_update_match_rpc.sql'
        ];

        for (const file of files) {
            console.log(`Running ${file}...`);
            const content = fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');
            await sql.unsafe(content);
            console.log(`✅ ${file} applied.`);
        }
    } catch (err) {
        console.error("❌ Migration failed:", err);
    } finally {
        await sql.end();
    }
}

runMigration();
