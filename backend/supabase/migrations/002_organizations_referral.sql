-- Organizations and Referral System
-- Run this migration AFTER 001_initial_schema.sql

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name VARCHAR(255) NOT NULL,
    referral_code VARCHAR(8) NOT NULL UNIQUE,
    owner_id VARCHAR(255) NOT NULL, -- User ID of sales manager/owner
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Add referral code generator function
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- Exclude similar chars
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add org fields to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations (id),
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'member', -- 'sales_manager' or 'member'
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(8);
-- Code used to join

-- Create index
CREATE INDEX IF NOT EXISTS idx_organizations_referral ON organizations (referral_code);

CREATE INDEX IF NOT EXISTS idx_user_profiles_org ON user_profiles (organization_id);

-- Trigger for organizations updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security for organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Anyone can view organizations (for referral validation)
CREATE POLICY "Organizations are viewable by everyone" ON organizations FOR
SELECT USING (true);

-- Anyone can create an organization (needed during signup flow before session is fully established)
CREATE POLICY "Allow organization creation during signup" ON organizations FOR
INSERT
WITH
    CHECK (true);

-- Only owner can update their organization
CREATE POLICY "Owners can update their organization"
  ON organizations FOR UPDATE
  USING (auth.uid()::text = owner_id OR auth.role() = 'service_role');

-- Service role can manage everything
CREATE POLICY "Service role can manage organizations" ON organizations FOR ALL USING (auth.role () = 'service_role');