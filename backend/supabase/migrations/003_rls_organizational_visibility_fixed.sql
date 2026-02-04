-- Migration: 003_rls_organizational_visibility.sql
-- Description: Updates RLS policies to allow organizational visibility without recursion.

-- Create helper function to safely fetch user organization without triggering RLS recursion
CREATE OR REPLACE FUNCTION get_auth_user_org() 
RETURNS uuid AS $$
  SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()::text;
$$ LANGUAGE sql SECURITY DEFINER;

-- Enable users to see profiles of others in the same organization
DROP POLICY IF EXISTS "Users within same organization can view profiles" ON user_profiles;

DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;

CREATE POLICY "Users within same organization can view profiles"
  ON user_profiles FOR SELECT
  USING (
    auth.uid()::text = user_id 
    OR 
    (organization_id IS NOT NULL AND organization_id = get_auth_user_org())
    OR
    auth.role() = 'service_role'
  );

-- Allow users to see calls of others in the same organization
DROP POLICY IF EXISTS "Users within same organization can view calls" ON calls;

DROP POLICY IF EXISTS "Users can view their own calls" ON calls;

CREATE POLICY "Users within same organization can view calls"
  ON calls FOR SELECT
  USING (
    auth.uid()::text = user_id 
    OR 
    user_id IN (
      SELECT user_id FROM user_profiles WHERE organization_id = get_auth_user_org()
    )
    OR
    auth.role() = 'service_role'
  );