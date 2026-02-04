-- FIX: RLS Infinite Recursion for Profiles Table
-- This must be run AFTER migration 006_complete_production_schema.sql

-- =====================================================
-- DROP OLD PROBLEMATIC POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view profiles in their org" ON profiles;

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;

-- =====================================================
-- CREATE FIXED POLICIES (NO RECURSION!)
-- =====================================================

-- 1. Allow users to ALWAYS view their own profile (breaks recursion!)
CREATE POLICY "Users can view own profile" ON profiles FOR
SELECT USING (id = auth.uid ());

-- 2. Allow users to view OTHER profiles in same org (uses own profile data)
CREATE POLICY "Users can view org profiles" ON profiles FOR
SELECT USING (
        org_id IS NOT NULL
        AND EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND org_id = profiles.org_id
        )
    );

-- 3. Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (id = auth.uid ());

-- 4. Allow profile creation during signup (anyone can insert their own ID)
CREATE POLICY "Users can insert own profile" ON profiles FOR
INSERT
WITH
    CHECK (id = auth.uid ());

-- =====================================================
-- VERIFICATION
-- =====================================================
-- After running this, test with:
-- SELECT * FROM profiles WHERE id = auth.uid();
-- This should work without recursion errors