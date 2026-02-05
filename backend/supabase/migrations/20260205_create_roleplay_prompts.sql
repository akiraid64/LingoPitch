-- Create roleplay_prompts table for caching Gemini-generated prompts
CREATE TABLE IF NOT EXISTS roleplay_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    language_code VARCHAR(10) UNIQUE NOT NULL, -- e.g., 'es-419', 'en-US'
    generated_prompt TEXT NOT NULL,
    playbook_version VARCHAR(50), -- To detect when playbook changes
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Index for fast language lookup
CREATE INDEX idx_roleplay_prompts_language ON roleplay_prompts (language_code);

-- Add RLS policies (Row Level Security)
ALTER TABLE roleplay_prompts ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read prompts
CREATE POLICY "Allow authenticated users to read roleplay prompts" ON roleplay_prompts FOR
SELECT TO authenticated USING (true);

-- Only service role can insert/update prompts
CREATE POLICY "Only service role can modify roleplay prompts" ON roleplay_prompts FOR ALL TO service_role USING (true)
WITH
    CHECK (true);