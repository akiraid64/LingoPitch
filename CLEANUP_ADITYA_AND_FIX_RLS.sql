-- COMPLETE CLEANUP: Delete Aditya's data and fix RLS
-- Run this in Supabase SQL Editor

-- =======================================================
-- STEP 1: Delete Aditya's organization
-- =======================================================
DELETE FROM organizations
WHERE
    id = 'aed2e4ea-b66e-4a5b-a337-e8992c1ff76e';

-- =======================================================
-- STEP 2: Delete Aditya's profile
-- =======================================================
DELETE FROM profiles WHERE email = 'sabatadityakumar@gmail.com';

-- Or if you want to be more specific:
-- DELETE FROM profiles WHERE full_name LIKE '%Aditya%Sabat%';

-- =======================================================
-- STEP 3: Add missing RLS policy (CRITICAL!)
-- =======================================================
CREATE POLICY "Users can view org profiles" ON profiles FOR
SELECT USING (
        org_id IS NOT NULL
        AND org_id IN (
            SELECT org_id
            FROM profiles
            WHERE
                id = auth.uid ()
        )
    );

-- =======================================================
-- STEP 4: Verify cleanup and policies
-- =======================================================

-- Should show only 1 organization (Akira Yu's)
SELECT id, name, referral_code FROM organizations;

-- Should show only 1 profile (Akira Yu)
SELECT id, full_name, email, org_id FROM profiles;

-- Should show 4 policies now
SELECT policyname, cmd
FROM pg_policies
WHERE
    tablename = 'profiles'
ORDER BY cmd, policyname;

-- =======================================================
-- STEP 5: Manual cleanup required
-- =======================================================
-- You MUST also delete Aditya's user from Supabase Auth:
-- 1. Go to Supabase Dashboard
-- 2. Authentication → Users
-- 3. Find user: sabatadityakumar@gmail.com
-- 4. Click "..." menu → Delete User
--
-- After this, Aditya can sign up again using referral code: FAB4I4I7
-- =======================================================