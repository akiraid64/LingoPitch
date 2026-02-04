// Test script to simulate the exact auth flow (CommonJS version)
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const supabaseUrl = 'https://zyuxjfztqwvegkslkjqd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5dXhqZnp0cXd2ZWdrc2xranFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzk3ODIsImV4cCI6MjA4NTcxNTc4Mn0.ZkRRQi5Vk_VKiXXRjYAZhlfM_DKEGR031ACGqffyMGY';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false,
    },
});

async function testAuthFlow() {
    console.log('\n========================================');
    console.log('TESTING AUTH FLOW');
    console.log('========================================\n');

    console.log('Enter your test credentials:');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const email = await new Promise(resolve => rl.question('Email: ', resolve));
    const password = await new Promise(resolve => rl.question('Password: ', resolve));
    rl.close();

    console.log('\nStep 1: Signing in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (signInError) {
        console.error('SIGN IN FAILED:', signInError.message);
        process.exit(1);
    }

    console.log('SIGNED IN');
    console.log('User ID:', signInData.user.id);
    console.log('Has session:', !!signInData.session);

    console.log('\nStep 2: Checking session...');
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        console.error('NO SESSION!');
        process.exit(1);
    }

    console.log('Session exists');

    console.log('\nStep 3: Attempting INSERT...');
    const testOrgData = {
        name: "Node Test Org",
        owner_id: signInData.user.id,
        referral_code: "NODETEST",
    };

    const { data: newOrgData, error: newOrgError } = await supabase
        .from('organizations')
        .insert(testOrgData)
        .select('id')
        .single();

    if (newOrgError) {
        console.error('\nINSERT FAILED!');
        console.error('Message:', newOrgError.message);
        console.error('Code:', newOrgError.code);
        console.error('\nDIAGNOSIS: Supabase client has session but INSERT still fails');
        console.error('This means the auth headers are NOT being sent with the request!');
        process.exit(1);
    }

    console.log('\nSUCCESS! Org created:', newOrgData.id);

    // Cleanup
    await supabase.from('organizations').delete().eq('id', newOrgData.id);

    process.exit(0);
}

testAuthFlow().catch(err => {
    console.error('\nUnexpected error:', err);
    process.exit(1);
});
