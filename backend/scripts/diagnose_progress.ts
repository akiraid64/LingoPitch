
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseProgress() {
    console.log('🔍 Diagnosing Progress Data...');

    // 1. Fetch ALL users who have calls to identify the active user
    const { data: activeUsers } = await supabase
        .from('calls')
        .select('user_id')
        .limit(10);

    // De-duplicate user_ids
    const userIds = [...new Set(activeUsers?.map(c => c.user_id) || [])];

    if (userIds.length === 0) {
        console.log('❌ No calls found for any user.');
        return;
    }

    console.log(`Found ${userIds.length} users with calls. Checking first user: ${userIds[0]}`);
    const userId = userIds[0];

    // 2. Run the EXACT query from MyProgressPage.tsx
    // default 30 days
    const daysAgo = 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    console.log(`\n📅 Query Parameters:`);
    console.log(`User ID: ${userId}`);
    console.log(`Cutoff Date: ${cutoffDate.toISOString()}`);

    const { data, error } = await supabase
        .from('calls')
        .select(`
            id,
            created_at,
            call_scores!inner (
                overall_score,
                score_needs_discovery,
                score_value_proposition,
                score_decision_process,
                score_stakeholder_id,
                score_call_control
            )
        `)
        .eq('user_id', userId)
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: true });

    if (error) {
        console.error('❌ Query Error:', error);
        return;
    }

    console.log(`\n📊 Query Result: ${data?.length || 0} rows returned.`);

    if (data && data.length > 0) {
        console.log('Sample Row 1:', JSON.stringify(data[0], null, 2));

        // Analyze Scores
        const scores = data.map(d => {
            // Handle array vs object response for call_scores
            const cs = Array.isArray(d.call_scores) ? d.call_scores[0] : d.call_scores;
            return cs?.overall_score;
        });
        console.log('Overall Scores found:', scores);

        const validScores = scores.filter(s => typeof s === 'number' && s > 0);
        console.log(`Non-zero scores: ${validScores.length} / ${scores.length}`);
    } else {
        // Debugging why no rows
        // Try without !inner join
        console.log('\n🕵️tTrying query WITHOUT !inner join (checking strictly calls)...');
        const { data: rawCalls } = await supabase
            .from('calls')
            .select('id, created_at')
            .eq('user_id', userId)
            .gte('created_at', cutoffDate.toISOString());

        console.log(`Calls found (raw): ${rawCalls?.length}`);

        if (rawCalls && rawCalls.length > 0) {
            console.log('Check if these calls have scores in call_scores table...');
            const { count } = await supabase
                .from('call_scores')
                .select('*', { count: 'exact', head: true })
                .in('call_id', rawCalls.map(c => c.id));

            console.log(`Matching call_scores records found: ${count}`);
            if (count === 0) {
                console.log('🚨 CONCLUSION: Connection broken. Calls exist, but no matching call_scores.');
            } else {
                console.log('❓ CONCLUSION: Calls and Scores exist. Maybe permissions/RLS issue matching them?');
            }
        }
    }
}

diagnoseProgress();
