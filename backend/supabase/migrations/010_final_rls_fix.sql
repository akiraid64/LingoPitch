-- FINAL FIX: Drop ALL conflicting policies and create clean ones
-- This fixes the multiple migration conflicts

-- =====================================================
-- STEP 1: Clean up organizations table policies
-- =====================================================
DO $$ 
DECLARE pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'organizations' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON organizations', pol.policyname);
    END LOOP;
END $$;

-- =====================================================
-- STEP 2: Disable/Enable RLS to clear cache
-- =====================================================
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 3: Create simple, working policies
-- =====================================================

-- Allow any authenticated user to INSERT (for signup)
CREATE POLICY "allow_authenticated_insert" ON organizations FOR
INSERT
WITH
    CHECK (auth.uid () IS NOT NULL);

-- Allow users to SELECT their own organization
CREATE POLICY "allow_select_own_org" ON organizations FOR
SELECT USING (owner_id = auth.uid ());

-- Allow owners to UPDATE their organization
CREATE POLICY "allow_owner_update" ON organizations FOR
UPDATE USING (owner_id = auth.uid ());

-- =====================================================
-- STEP 4: Force PostgREST reload
-- =====================================================
NOTIFY pgrst, 'reload schema';

NOTIFY pgrst, 'reload config';

SELECT pg_sleep (1);

-- =====================================================
-- STEP 5: Verify policies are correct
-- =====================================================
SELECT 
    policyname,
    cmd,
    CASE WHEN with_check IS NULL THEN 'N/A' ELSE with_check::text END as with_check,
    CASE WHEN qual IS NULL THEN 'N/A' ELSE qual::text END as qual
FROM pg_policies 
WHERE tablename = 'organizations'
ORDER BY policyname;