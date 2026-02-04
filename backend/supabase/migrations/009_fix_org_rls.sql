-- Fix organizations RLS to allow creation during signup
-- Drop all org policies and recreate with proper permissions

-- Drop existing policies
DO $$ 
DECLARE pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'organizations' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON organizations', pol.policyname);
    END LOOP;
END $$;

-- Allow anyone to INSERT a new organization (for signup)
CREATE POLICY "Allow organization creation" ON organizations FOR
INSERT
WITH
    CHECK (true);

-- Allow users to SELECT their own organization
CREATE POLICY "Users can view own organization" ON organizations FOR
SELECT USING (
        id IN (
            SELECT org_id
            FROM profiles
            WHERE
                id = auth.uid ()
        )
    );

-- Allow organization owner to UPDATE
CREATE POLICY "Owners can update organization" ON organizations FOR
UPDATE USING (owner_id = auth.uid ());

-- Reload schema
NOTIFY pgrst, 'reload schema';