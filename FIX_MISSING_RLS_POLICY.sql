-- FIX MISSING RLS POLICY
-- Run this in Supabase SQL Editor

-- Add the missing "view org profiles" policy
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

-- Verify all policies exist
SELECT policyname, cmd
FROM pg_policies
WHERE
    tablename = 'profiles'
ORDER BY cmd, policyname;