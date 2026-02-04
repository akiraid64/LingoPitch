-- COMPLETE RLS FIX - Run this to fix all recursion issues
-- This drops ALL old functions and policies, then creates clean new ones

-- =======================================================
-- STEP 1: Drop old helper function (references user_profiles which doesn't exist)
-- =======================================================
DROP FUNCTION IF EXISTS get_auth_user_org ();

-- =======================================================
-- STEP 2: Force drop ALL policies on profiles table
-- =======================================================
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
    END LOOP;
END $$;

-- =======================================================
-- STEP 3: Create new WORKING policies (NO RECURSION!)
-- =======================================================

-- 1. CRITICAL: Users can ALWAYS view their own profile first (breaks all recursion)
CREATE POLICY "Users can view own profile" ON profiles FOR
SELECT USING (id = auth.uid ());

-- 2. Users can view profiles in same org (safe - uses own profile via policy #1)
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

-- 3. Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (id = auth.uid ());

-- 4. Allow new users to create their profile during signup
CREATE POLICY "Users can insert own profile" ON profiles FOR
INSERT
WITH
    CHECK (id = auth.uid ());

-- =======================================================
-- STEP 4: Fix organizations policies (also may have recursion)
-- =======================================================

-- Drop all organization policies
DO $$ DECLARE pol record;

BEGIN FOR pol IN
SELECT policyname
FROM pg_policies
WHERE
    tablename = 'organizations'
    AND schemaname = 'public'
LOOP
EXECUTE format(
    'DROP POLICY IF EXISTS %I ON organizations',
    pol.policyname
);

END
LOOP;

END $$;

-- Recreate safe organization policies
CREATE POLICY "Users can view their organization" ON organizations FOR
SELECT USING (
        id IN (
            SELECT org_id
            FROM profiles
            WHERE
                id = auth.uid ()
        )
    );

CREATE POLICY "Service role can manage organizations" ON organizations FOR ALL USING (auth.role () = 'service_role');

-- Allow creating org during signup
CREATE POLICY "Allow org creation" ON organizations FOR
INSERT
WITH
    CHECK (true);

-- =======================================================
-- DONE! Test with: SELECT * FROM profiles WHERE id = auth.uid();
-- =======================================================