-- PRODUCTION SCHEMA MIGRATION
-- This replaces our entire schema with the sales_agent production schema
-- WARNING: This will DROP all existing tables. Backup first if you have data!

-- Step 1: Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "vector";

-- Step 2: Drop old tables (BACKUP FIRST IF YOU HAVE DATA!)
DROP TABLE IF EXISTS analytics_events CASCADE;

DROP TABLE IF EXISTS calls CASCADE;

DROP TABLE IF EXISTS user_profiles CASCADE;

DROP TABLE IF EXISTS cultural_profiles CASCADE;

DROP TABLE IF EXISTS organizations CASCADE;

-- Step 3: Create new production schema

-- Organizations table
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  referral_code text NOT NULL UNIQUE,
  max_seats integer DEFAULT 5,
  used_seats integer DEFAULT 1,
  subscription_tier text DEFAULT 'free'::text CHECK (subscription_tier = ANY (ARRAY['free'::text, 'starter'::text, 'growth'::text, 'enterprise'::text])),
  subscription_status text DEFAULT 'active'::text CHECK (subscription_status = ANY (ARRAY['active'::text, 'past_due'::text, 'canceled'::text, 'trialing'::text])),
  trial_ends_at timestamp with time zone,
  stripe_customer_id text,
  stripe_subscription_id text,
  monthly_call_limit integer DEFAULT 10,
  monthly_calls_used integer DEFAULT 0,
  monthly_reset_at timestamp with time zone DEFAULT (date_trunc('month'::text, now()) + '1 mon'::interval),
  CONSTRAINT organizations_pkey PRIMARY KEY (id)
);

-- Profiles table (replaces user_profiles)
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  org_id uuid,
  email text NOT NULL,
  full_name text,
  role text DEFAULT 'rep'::text CHECK (role = ANY (ARRAY['admin'::text, 'manager'::text, 'rep'::text])),
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  language text DEFAULT 'en'::text CHECK (language = ANY (ARRAY['en'::text, 'lv'::text])),
  onboarding_completed_at timestamp with time zone,
  onboarding_steps jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT profiles_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id)
);

-- Calls table (enhanced)
CREATE TABLE public.calls (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid,
  user_id uuid,
  external_id text UNIQUE,
  title text,
  customer_name text,
  duration_seconds integer,
  transcript jsonb,
  raw_transcript text,
  status text DEFAULT 'queued'::text CHECK (status = ANY (ARRAY['queued'::text, 'processing'::text, 'completed'::text, 'failed'::text])),
  created_at timestamp with time zone DEFAULT now(),
  analyzed_at timestamp with time zone,
  CONSTRAINT calls_pkey PRIMARY KEY (id),
  CONSTRAINT calls_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id),
  CONSTRAINT calls_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- Call scores table (NEW - structured scoring)
CREATE TABLE public.call_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  call_id uuid,
  overall_score integer CHECK (overall_score >= 0 AND overall_score <= 100),
  summary text,
  executive_summary text,
  communication_analysis text,
  sentiment text CHECK (sentiment = ANY (ARRAY['Positive'::text, 'Neutral'::text, 'Negative'::text, 'Mixed'::text])),
  strengths jsonb DEFAULT '[]'::jsonb,
  weaknesses jsonb DEFAULT '[]'::jsonb,
  coaching_tips jsonb DEFAULT '[]'::jsonb,
  key_takeaways jsonb DEFAULT '[]'::jsonb,
  objection_handling text,
  closing_technique text,
  raw_response jsonb,
  created_at timestamp with time zone DEFAULT now(),
  score_needs_discovery integer CHECK (score_needs_discovery >= 0 AND score_needs_discovery <= 100),
  score_value_proposition integer CHECK (score_value_proposition >= 0 AND score_value_proposition <= 100),
  score_decision_process integer CHECK (score_decision_process >= 0 AND score_decision_process <= 100),
  score_stakeholder_id integer CHECK (score_stakeholder_id >= 0 AND score_stakeholder_id <= 100),
  score_insight_delivery integer CHECK (score_insight_delivery >= 0 AND score_insight_delivery <= 100),
  score_objection_handling integer CHECK (score_objection_handling >= 0 AND score_objection_handling <= 100),
  score_active_listening integer CHECK (score_active_listening >= 0 AND score_active_listening <= 100),
  score_competition integer CHECK (score_competition >= 0 AND score_competition <= 100),
  score_next_steps integer CHECK (score_next_steps >= 0 AND score_next_steps <= 100),
  score_call_control integer CHECK (score_call_control >= 0 AND score_call_control <= 100),
  CONSTRAINT call_scores_pkey PRIMARY KEY (id),
  CONSTRAINT call_scores_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.calls(id) ON DELETE CASCADE
);

-- Playbook chunks table (NEW - for RAG)
CREATE TABLE public.playbook_chunks (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    org_id uuid NOT NULL,
    playbook_name text NOT NULL,
    chunk_index integer NOT NULL,
    text_content text NOT NULL,
    text_preview text,
    embedding vector (1536),
    created_at timestamp
    with
        time zone DEFAULT now(),
        CONSTRAINT playbook_chunks_pkey PRIMARY KEY (id),
        CONSTRAINT playbook_chunks_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations (id) ON DELETE CASCADE
);

-- Analytics events table
CREATE TABLE public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  org_id uuid,
  event_name text NOT NULL,
  event_category text NOT NULL,
  event_properties jsonb DEFAULT '{}'::jsonb,
  session_id text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT analytics_events_pkey PRIMARY KEY (id),
  CONSTRAINT analytics_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT analytics_events_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id)
);

-- Coaching rubrics table (NEW - for custom scoring)
CREATE TABLE public.coaching_rubrics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid,
  name text NOT NULL,
  description text,
  methodology text DEFAULT 'generic'::text,
  criteria jsonb NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT coaching_rubrics_pkey PRIMARY KEY (id),
  CONSTRAINT coaching_rubrics_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id)
);

-- Usage records table (NEW - for billing/limits)
CREATE TABLE public.usage_records (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    org_id uuid NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    calls_analyzed integer DEFAULT 0,
    arena_sessions integer DEFAULT 0,
    chat_messages integer DEFAULT 0,
    storage_bytes_used bigint DEFAULT 0,
    created_at timestamp
    with
        time zone DEFAULT now(),
        CONSTRAINT usage_records_pkey PRIMARY KEY (id),
        CONSTRAINT usage_records_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations (id)
);

-- Step 4: Create indexes
CREATE INDEX idx_profiles_org_id ON profiles (org_id);

CREATE INDEX idx_profiles_email ON profiles (email);

CREATE INDEX idx_calls_org_id ON calls (org_id);

CREATE INDEX idx_calls_user_id ON calls (user_id);

CREATE INDEX idx_calls_status ON calls (status);

CREATE INDEX idx_calls_created_at ON calls (created_at DESC);

CREATE INDEX idx_call_scores_call_id ON call_scores (call_id);

CREATE INDEX idx_playbook_chunks_org_id ON playbook_chunks (org_id);

CREATE INDEX idx_playbook_chunks_embedding ON playbook_chunks USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_analytics_user_id ON analytics_events (user_id);

CREATE INDEX idx_analytics_org_id ON analytics_events (org_id);

CREATE INDEX idx_analytics_created_at ON analytics_events (created_at DESC);

-- Step 5: Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

ALTER TABLE call_scores ENABLE ROW LEVEL SECURITY;

ALTER TABLE playbook_chunks ENABLE ROW LEVEL SECURITY;

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS Policies

-- Profiles: Users can view profiles in their org
CREATE POLICY "Users can view profiles in their org" ON profiles FOR
SELECT USING (
        org_id IN (
            SELECT org_id
            FROM profiles
            WHERE
                id = auth.uid ()
        )
    );

CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (id = auth.uid ());

CREATE POLICY "Allow profile creation during signup" ON profiles FOR
INSERT
WITH
    CHECK (true);

-- Organizations: Members can view their org
CREATE POLICY "Users can view their organization" ON organizations FOR
SELECT USING (
        id IN (
            SELECT org_id
            FROM profiles
            WHERE
                id = auth.uid ()
        )
    );

-- Calls: Users can view calls in their org
CREATE POLICY "Users can view calls in their org" ON calls FOR
SELECT USING (
        org_id IN (
            SELECT org_id
            FROM profiles
            WHERE
                id = auth.uid ()
        )
    );

CREATE POLICY "Users can create calls" ON calls FOR
INSERT
WITH
    CHECK (
        org_id IN (
            SELECT org_id
            FROM profiles
            WHERE
                id = auth.uid ()
        )
    );

-- Call scores: Same as calls
CREATE POLICY "Users can view scores in their org" ON call_scores FOR
SELECT USING (
        call_id IN (
            SELECT id
            FROM calls
            WHERE
                org_id IN (
                    SELECT org_id
                    FROM profiles
                    WHERE
                        id = auth.uid ()
                )
        )
    );

-- Playbooks: Org members can view their org's playbooks
CREATE POLICY "Users can view org playbooks" ON playbook_chunks FOR
SELECT USING (
        org_id IN (
            SELECT org_id
            FROM profiles
            WHERE
                id = auth.uid ()
        )
    );

CREATE POLICY "Managers can manage playbooks" ON playbook_chunks FOR ALL USING (
    org_id IN (
        SELECT org_id
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role IN ('manager', 'admin')
    )
);

-- Analytics: Users can view their own events
CREATE POLICY "Users can view own analytics" ON analytics_events FOR
SELECT USING (user_id = auth.uid ());

-- Step 7: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Done! Schema migration complete.