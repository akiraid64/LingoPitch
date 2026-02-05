
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') }); // Look in backend root

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecentCall() {
    console.log('🔍 Checking most recent call...');

    // 1. Get latest call
    const { data: calls, error: callError } = await supabase
        .from('calls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (callError) {
        console.error('❌ Error fetching calls:', callError);
        return;
    }

    if (!calls || calls.length === 0) {
        console.log('⚠️ No calls found.');
        return;
    }

    const call = calls[0];
    console.log('\n📞 LATEST CALL:');
    console.log(`ID: ${call.id}`);
    console.log(`Title: ${call.title}`);
    console.log(`Created: ${call.created_at}`);
    console.log(`Transcript Type: ${typeof call.transcript}`);
    if (typeof call.transcript === 'object') {
        console.log(`Transcript Content:`, JSON.stringify(call.transcript, null, 2));
    } else {
        console.log(`Transcript Length: ${call.transcript?.length || 0} chars`);
    }

    // 2. Check Voice Session
    console.log('\n🎙️ LINKED VOICE SESSION:');
    const { data: sessions, error: sessionError } = await supabase
        .from('voice_sessions')
        .select('*')
        .eq('call_id', call.id);

    if (sessionError) console.error('❌ Error fetching voice_sessions:', sessionError);
    else if (sessions.length === 0) console.log('⚠️ No voice_session found linked to this call_id.');
    else {
        console.log(`Found ${sessions.length} sessions.`);
        console.log(`Session ID: ${sessions[0].id}`);
        console.log(`Analysis Present: ${!!sessions[0].analysis}`);
        console.log(`Transcript Present: ${!!sessions[0].transcript}`);
    }

    // 3. Check Call Scores
    console.log('\n📊 LINKED CALL SCORES:');
    const { data: scores, error: scoreError } = await supabase
        .from('call_scores')
        .select('*')
        .eq('call_id', call.id);

    if (scoreError) console.error('❌ Error fetching call_scores:', scoreError);
    else if (scores.length === 0) console.log('⚠️ No call_scores found linked to this call_id.');
    else {
        console.log(`Found ${scores.length} score records.`);
        console.log(`Overall Score: ${scores[0].overall_score}`);
    }
}

checkRecentCall();
