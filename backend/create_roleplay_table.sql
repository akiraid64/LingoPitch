-- Run this SQL in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

CREATE TABLE IF NOT EXISTS public.roleplay_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    language_code VARCHAR(10) UNIQUE NOT NULL,
    generated_prompt TEXT NOT NULL,
    playbook_version VARCHAR(50) DEFAULT 'v1.0',
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.roleplay_prompts ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read
CREATE POLICY "Allow authenticated read access" ON public.roleplay_prompts FOR
SELECT TO authenticated USING (true);

-- Policy: Allow service role to insert/update
CREATE POLICY "Allow service role write access" ON public.roleplay_prompts FOR ALL TO service_role USING (true)
WITH
    CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_roleplay_prompts_language_code ON public.roleplay_prompts (language_code);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_roleplay_prompts_updated_at 
    BEFORE UPDATE ON public.roleplay_prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();