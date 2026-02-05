-- Resize embedding column for Gemini (768 dimensions)
-- Also fix the created_at formatting issue in 999_fresh_start_schema.sql

ALTER TABLE public.playbook_chunks
ALTER COLUMN embedding TYPE vector (768);

-- Add index for vector similarity search
CREATE INDEX ON public.playbook_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);