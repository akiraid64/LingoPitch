-- SQL CLEANUP SCRIPT
-- Run this to clear all data for a fresh start

TRUNCATE TABLE organizations CASCADE;

TRUNCATE TABLE user_profiles CASCADE;

TRUNCATE TABLE calls CASCADE;

TRUNCATE TABLE analytics_events CASCADE;

-- Note: This will NOT delete users from Supabase Auth.
-- IMPORTANT: Run this script, THEN delete users from Supabase Auth > Users tab.
-- THEN you can sign up fresh and expect everything to work.