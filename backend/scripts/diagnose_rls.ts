
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey!);


async function checkRLS() {
    console.log('🔍 Checking Data Existence (Service Role)...');

    // 1. Check if ANY call_scores exist
    const { count, error } = await supabase
        .from('call_scores')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('❌ Error checking call_scores table:', error);
        return;
    }

    console.log(`✅ Total call_scores in DB: ${count}`);

    if (count === 0) {
        console.log('⚠️ No scores exist at all. This explains why Manager sees nothing (if they have no calls).');
    }
}
checkRLS();
