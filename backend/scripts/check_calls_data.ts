
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkData() {
    console.log('Checking database data...');

    // 1. Check Profiles
    const { data: profiles, error: pError } = await supabase.from('profiles').select('id, email, org_id, role');
    if (pError) console.error('Profiles error:', pError);
    else {
        console.log(`Found ${profiles.length} profiles:`);
        profiles.forEach(p => console.log(` - ${p.email} (${p.role}) Org: ${p.org_id}`));
    }

    // 2. Check Calls (All)
    const { data: allCalls, error: cError } = await supabase.from('calls').select('id, title, org_id, user_id');
    if (cError) console.error('Calls error:', cError);
    else {
        console.log(`Found ${allCalls.length} TOTAL calls in DB.`);
        if (allCalls.length > 0) {
            console.log('Sample call org_id:', allCalls[0].org_id);
        }
    }

    // 3. Check Calls specifically for the first org found
    if (profiles.length > 0 && profiles[0].org_id) {
        const orgId = profiles[0].org_id;
        console.log(`Checking calls for Org ID: ${orgId}`);
        const { count, error: countError } = await supabase
            .from('calls')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', orgId);

        if (countError) console.error('Count error:', countError);
        else console.log(`Calls count for this org: ${count}`);
    }
}

checkData();
