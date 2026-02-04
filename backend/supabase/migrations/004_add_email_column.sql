-- Fix: Add missing email column to user_profiles
-- This migration adds the email column that should have been included from the start

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles (email);

-- Backfill emails from auth.users for existing profiles
UPDATE user_profiles up
SET email = au.email
FROM auth.users au
WHERE up.user_id = au.id::text
AND up.email IS NULL;