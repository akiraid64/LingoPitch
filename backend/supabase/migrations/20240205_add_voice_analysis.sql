-- Add analysis column to voice_sessions table
ALTER TABLE voice_sessions ADD COLUMN IF NOT EXISTS analysis JSONB;