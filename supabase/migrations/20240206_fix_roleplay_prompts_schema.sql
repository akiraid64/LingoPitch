-- Migration to fix roleplay_prompts schema for organization-specific caching

-- 1. Add org_id column
ALTER TABLE public.roleplay_prompts
ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizations (id);

-- 2. Drop the old unique constraint on language_code
ALTER TABLE public.roleplay_prompts
DROP CONSTRAINT IF EXISTS roleplay_prompts_language_code_key;

-- 3. Add new unique constraint for (org_id, language_code)
-- Note: We allow NULL org_id for default prompts if needed, but for our app every prompt will be linked to an org
ALTER TABLE public.roleplay_prompts
ADD CONSTRAINT roleplay_prompts_org_lang_unique UNIQUE (org_id, language_code);

-- 4. Update the index
DROP INDEX IF EXISTS idx_roleplay_prompts_language_code;

CREATE INDEX idx_roleplay_prompts_org_lang ON public.roleplay_prompts (org_id, language_code);