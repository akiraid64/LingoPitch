
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanup() {
    console.log('\n========================================');
    console.log('🧹 DATABASE DEEP CLEANUP');
    console.log('========================================\n');

    try {
        // 1. Get valid user IDs
        const { data: profiles } = await supabase.from('profiles').select('id, full_name');
        const validUserIds = new Set(profiles?.map(p => p.id) || []);
        const defaultOrgId = profiles?.[0]?.org_id || '5fe8a2f3-e7ec-43e9-ae6f-53f6221546e8';

        console.log(`Valid users found: ${profiles?.length || 0}`);

        // 2. Fetch all calls
        const { data: calls } = await supabase.from('calls').select('id, user_id, org_id, title');

        let ghostCount = 0;
        let orphanCount = 0;
        let fixedCount = 0;

        for (const call of calls || []) {
            // Check if it's a ghost call (user doesn't exist)
            if (!validUserIds.has(call.user_id)) {
                console.log(`🗑️ Deleting ghost call: ${call.title} (${call.id}) - User [${call.user_id}] no longer exists.`);
                await supabase.from('calls').delete().eq('id', call.id);
                ghostCount++;
                continue;
            }

            // Check if it's orphaned (no org_id)
            if (!call.org_id) {
                console.log(`🔧 Fixing orphan call: ${call.title} (${call.id}) - Linking to Org [${defaultOrgId}]`);
                await supabase.from('calls').update({ org_id: defaultOrgId }).eq('id', call.id);
                orphanCount++;
                fixedCount++;
            }
        }

        console.log('\n========================================');
        console.log('✨ CLEANUP COMPLETE');
        console.log(`🗑️ Ghost calls deleted: ${ghostCount}`);
        console.log(`🔧 Orphaned calls fixed: ${orphanCount}`);
        console.log('========================================\n');

    } catch (error) {
        console.error('❌ Cleanup failed:', error);
    }
}

cleanup();
