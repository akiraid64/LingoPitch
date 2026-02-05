-- Diagnostic query to check team members
-- Run this in Supabase SQL Editor

-- 1. Check all profiles in the organization
SELECT
    id,
    full_name,
    email,
    role,
    org_id,
    created_at
FROM profiles
WHERE
    org_id = '5a08b9d8-959a-4381-9bad-b21a0a7e2c17'
ORDER BY created_at DESC;

-- 2. Check if RLS is blocking the query
-- Run this as the manager user to test RLS
SET ROLE authenticated;

SET request.jwt.claims.sub = 'bf1d61a9-e976-4eb2-bbb7-c860b867180a';

SELECT id, full_name, email, role, org_id
FROM profiles
WHERE
    org_id = '5a08b9d8-959a-4381-9bad-b21a0a7e2c17'
    AND id != 'bf1d61a9-e976-4eb2-bbb7-c860b867180a';

-- 3. Check RLS policies on profiles table
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE
    tablename = 'profiles';