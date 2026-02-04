-- =====================================================
-- RLS DIAGNOSTIC TEST SCRIPT
-- Run this in Supabase SQL Editor to find the issue
-- =====================================================

-- TEST 1: Check what policies exist
SELECT '=== CURRENT POLICIES ON ORGANIZATIONS ===' as test;

SELECT
    policyname,
    cmd,
    permissive,
    roles,
    with_check,
    qual
FROM pg_policies
WHERE
    tablename = 'organizations'
ORDER BY cmd, policyname;

-- TEST 2: Check if RLS is enabled
SELECT '=== RLS STATUS ===' as test;

SELECT tablename, rowsecurity
FROM pg_tables
WHERE
    schemaname = 'public'
    AND tablename = 'organizations';

-- TEST 3: Simulate authenticated user INSERT (this is what Supabase client does)
SELECT '=== TEST: INSERT AS AUTHENTICATED USER ===' as test;

SET request.jwt.claims.sub = '78d79bb7-0673-4f81-a910-9699e967aede';

-- Try the INSERT
INSERT INTO organizations (name, slug, referral_code, owner_id)
VALUES ('Diagnostic Test Org', 'diag-test', 'DIAGTEST', '78d79bb7-0673-4f81-a910-9699e967aede'::uuid)
RETURNING id, name;

-- TEST 4: Check if there are MULTIPLE policies conflicting
SELECT '=== CHECKING FOR CONFLICTING INSERT POLICIES ===' as test;

SELECT
    policyname,
    with_check,
    CASE
        WHEN with_check = 'true' THEN 'ALLOWS ALL'
        WHEN with_check LIKE '%auth.uid()%' THEN 'REQUIRES AUTH'
        ELSE 'OTHER CONDITION'
    END as policy_type
FROM pg_policies
WHERE
    tablename = 'organizations'
    AND cmd = 'INSERT';

-- TEST 5: Show the ACTUAL policy definitions
SELECT '=== FULL POLICY DEFINITIONS ===' as test;

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual as using_clause,
    with_check as with_check_clause
FROM pg_policies
WHERE
    tablename = 'organizations'
ORDER BY cmd;

-- =====================================================
-- EXPECTED RESULTS:
-- =====================================================
-- TEST 1: Should show 3 policies (INSERT, SELECT, UPDATE)
-- TEST 2: rowsecurity should be 't' (true)
-- TEST 3: Should succeed and return an org ID
-- TEST 4: Should show INSERT policy with 'ALLOWS ALL' or 'REQUIRES AUTH'
-- TEST 5: Shows full details of all policies
--
-- IF TEST 3 FAILS: The policy with_check is wrong
-- IF TEST 3 SUCCEEDS: The Supabase client isn't sending auth headers
-- =====================================================