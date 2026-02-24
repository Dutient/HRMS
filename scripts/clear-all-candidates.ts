import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase environment variables not found in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function clearData() {
    console.log('🧹 Clearing all data for retest...');

    // 1. Delete all candidates (cascades to interviews)
    console.log('🗑️ Deleting all candidates...');
    const { error: dbError } = await supabase
        .from('candidates')
        .delete()
        .neq('name', '___NON_EXISTENT_NAME___'); // standard way to delete all

    if (dbError) {
        console.error('❌ Error deleting candidates:', dbError.message);
    } else {
        console.log('✅ Candidates cleared.');
    }

    // 2. Clear resumes storage bucket
    console.log('📂 Clearing resumes storage bucket...');
    const { data: files, error: listError } = await supabase
        .storage
        .from('resumes')
        .list();

    if (listError) {
        console.error('❌ Error listing files:', listError.message);
    } else if (files && files.length > 0) {
        const fileNames = files.map(f => f.name);
        const { error: deleteError } = await supabase
            .storage
            .from('resumes')
            .remove(fileNames);

        if (deleteError) {
            console.error('❌ Error deleting files:', deleteError.message);
        } else {
            console.log(`✅ ${fileNames.length} resume files deleted.`);
        }
    } else {
        console.log('✅ Storage bucket is already empty.');
    }

    // 3. Optional: Clear ranking_jobs if needed
    console.log('🗑️ Deleting all ranking jobs...');
    const { error: jobsError } = await supabase
        .from('ranking_jobs')
        .delete()
        .neq('status', '___NON_EXISTENT_STATUS___');

    if (jobsError) {
        console.error('❌ Error deleting ranking jobs:', jobsError.message);
    } else {
        console.log('✅ Ranking jobs cleared.');
    }

    console.log('\n✨ All clear! Ready for retest.');
}

clearData();
