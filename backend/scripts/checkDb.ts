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

// Initialize Supabase client with Service Role Key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnose() {
    console.log('\n========================================');
    console.log('🕵️‍♂️  LingoPitch DB Diagnostic Tool');
    console.log('========================================\n');

    try {
        // 1. Fetch Users & Profiles
        console.log('Fetching Users & Profiles...');
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('*');

        if (profileError) throw profileError;

        console.log(`✅ Found ${profiles.length} profiles:\n`);

        const usersMap = new Map();

        for (const p of profiles) {
            console.log(`👤 Name: ${p.full_name}`);
            console.log(`   ID:   ${p.id}`);
            console.log(`   Role: ${p.role}`);
            console.log(`   Org:  ${p.org_id}`);
            console.log('----------------------------------------');
            usersMap.set(p.id, p.full_name);
        }

        // 2. Fetch Calls Summary
        console.log('\nFetching Recent Calls...');
        const { data: calls, error: callsError } = await supabase
            .from('calls')
            .select('id, user_id, org_id, created_at, title')
            .order('created_at', { ascending: false })
            .limit(10);

        if (callsError) throw callsError;

        console.log(`✅ showing last ${calls.length} calls:\n`);

        calls.forEach(c => {
            const userName = usersMap.get(c.user_id) || 'Unknown User';
            const status = c.org_id ? '✅ Linked' : '❌ ORPHANED (No Org ID)';

            console.log(`📞 [${new Date(c.created_at).toLocaleString()}] ${c.title || 'Untitled Call'}`);
            console.log(`   User: ${userName}`);
            console.log(`   Status: ${status}`);
            console.log(`   Call ID: ${c.id}`);
            if (!c.org_id) console.log(`   ⚠️  This call will NOT be visible to managers!`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error executing diagnostic:', error);
    }
}

diagnose();
