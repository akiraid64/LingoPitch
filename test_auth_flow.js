// Test script to simulate the exact auth flow
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zyuxjfztqwvegkslkjqd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5dXhqZnp0cXd2ZWdrc2xranFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzk3ODIsImV4cCI6MjA4NTcxNTc4Mn0.ZkRRQi5Vk_VKiXXRjYAZhlfM_DKEGR031ACGqffyMGY';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: false, // Don't persist in Node
        detectSessionInUrl: false,
    },
});

async function testAuthFlow() {
    console.log('\n========================================');
    console.log('🧪 TESTING AUTH FLOW');
    console.log('========================================\n');

    // Step 1: Sign in with email/password to get a session
    console.log('📝 Enter your test credentials:');
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const email = await new Promise(resolve => readline.question('Email: ', resolve));
    const password = await new Promise(resolve => readline.question('Password: ', resolve));
    readline.close();

    console.log('\n🔐 Step 1: Signing in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (signInError) {
        console.error('❌ Sign in failed:', signInError.message);
        process.exit(1);
    }

    console.log('✅ Signed in successfully');
    console.log('User ID:', signInData.user.id);
    console.log('Has session:', !!signInData.session);
    console.log('Access token exists:', !!signInData.session?.access_token);

    // Step 2: Check if session is attached to client
    console.log('\n🔍 Step 2: Checking session state...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
        console.error('❌ No session found after sign-in!');
        process.exit(1);
    }

    console.log('✅ Session exists in client');
    console.log('Session user ID:', session.user.id);

    // Step 3: Try to INSERT organization (exactly like AuthContext does)
    console.log('\n📝 Step 3: Attempting to INSERT organization...');
    const testUserId = signInData.user.id;
    const testOrgData = {
        name: "Node Test Org",
        owner_id: testUserId,
        referral_code: "NODETEST",
    };

    console.log('Insert data:', testOrgData);

    const { data: newOrgData, error: newOrgError } = await supabase
        .from('organizations')
        .insert(testOrgData)
        .select('id')
        .single();

    if (newOrgError) {
        console.error('\n❌ INSERT FAILED!');
        console.error('Error message:', newOrgError.message);
        console.error('Error code:', newOrgError.code);
        console.error('Error details:', newOrgError.details);
        console.error('Error hint:', newOrgError.hint);

        console.log('\n🔍 DIAGNOSIS:');
        if (newOrgError.code === '42501') {
            console.log('- RLS policy is blocking the INSERT');
            console.log('- Session exists but might not be passed to REST API');
            console.log('- Check if supabase client auto-attaches auth headers');
        }
        process.exit(1);
    }

    console.log('\n✅ SUCCESS! Organization created:', newOrgData.id);
    console.log('\n🎉 Auth flow works correctly!');

    // Cleanup
    console.log('\n🧹 Cleaning up test org...');
    await supabase.from('organizations').delete().eq('id', newOrgData.id);

    process.exit(0);
}

testAuthFlow().catch(err => {
    console.error('\n💥 Unexpected error:', err);
    process.exit(1);
});
