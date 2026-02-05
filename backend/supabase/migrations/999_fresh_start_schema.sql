-- ☢️ NUCLEAR OPTION: FRESH START SCHEMA (FIXED ORDER) ☢️
-- This script will wipe the public schema and recreate everything with proper RLS.
-- Run this in Supabase SQL Editor.

-- ==============================================================================
-- 1. WIPE EVERYTHING & RESET SCHEMA
-- ==============================================================================
DROP SCHEMA IF EXISTS public CASCADE;

CREATE SCHEMA public;

GRANT ALL ON SCHEMA public TO postgres;

GRANT ALL ON SCHEMA public TO public;

COMMENT ON SCHEMA public IS 'standard public schema';

-- ==============================================================================
-- 2. EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "vector";
-- Must be before tables using vector
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 3. TABLES (Created in dependency order)
-- ==============================================================================

-- 3.1 ORGANIZATIONS (Top level, no FKs to other public tables yet)
CREATE TABLE public.organizations (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
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
    owner_id uuid, -- Link to auth.users
    CONSTRAINT organizations_pkey PRIMARY KEY (id)
);

-- 3.2 PROFILES (Depends on Organizations)
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

-- 3.3 TABLES DEPENDING ON ORGS OR PROFILES

-- CALLS
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

-- ANALYTICS EVENTS
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

-- COACHING RUBRICS
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

-- CULTURAL PROFILES (Independent)
CREATE TABLE public.cultural_profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    language_code character varying NOT NULL UNIQUE,
    language_name character varying NOT NULL,
    communication_style text NOT NULL,
    formality_level integer NOT NULL CHECK (formality_level >= 1 AND formality_level <= 10),
    relationship_building text NOT NULL,
    decision_making text NOT NULL,
    negotiation_approach text NOT NULL,
    taboos text[] NOT NULL DEFAULT '{}',
    power_phrases text[] NOT NULL DEFAULT '{}',
    greetings_protocol text NOT NULL,
    business_etiquette text[] NOT NULL DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT cultural_profiles_pkey PRIMARY KEY (id)
);

-- PLAYBOOK CHUNKS
CREATE TABLE public.playbook_chunks (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    org_id uuid NOT NULL,
    playbook_name text NOT NULL,
    chunk_index integer NOT NULL,
    text_content text NOT NULL,
    text_preview text,
    embedding vector (1536), -- Using vector extension
    created_at timestamp
    with
        time zone DEFAULT now(),
        CONSTRAINT playbook_chunks_pkey PRIMARY KEY (id),
        CONSTRAINT playbook_chunks_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations (id)
);

-- USAGE RECORDS
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

-- 3.4 TABLES DEPENDING ON CALLS

-- CALL SCORES
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

-- VOICE SESSIONS (Depends on Orgs, Profiles, Calls)
CREATE TABLE public.voice_sessions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL,
    user_id uuid NOT NULL,
    livekit_room_name text NOT NULL UNIQUE,
    livekit_room_sid text,
    scenario_type text NOT NULL CHECK (scenario_type = ANY (ARRAY['cold_call'::text, 'discovery'::text, 'objection_handling'::text, 'closing'::text])),
    difficulty text DEFAULT 'intermediate'::text CHECK (difficulty = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])),
    persona_name text DEFAULT 'Marcus'::text,
    persona_config jsonb DEFAULT '{}'::jsonb,
    playbook_context jsonb DEFAULT '[]'::jsonb,
    status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'completed'::text, 'failed'::text, 'analyzing'::text])),
    started_at timestamp with time zone,
    ended_at timestamp with time zone,
    duration_seconds integer,
    transcript text,
    call_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT voice_sessions_pkey PRIMARY KEY (id),
    CONSTRAINT voice_sessions_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id),
    CONSTRAINT voice_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
    CONSTRAINT voice_sessions_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.calls(id)
);

-- ==============================================================================
-- 4. HELPER FUNCTIONS (NOW SAFE TO CREATE)
-- ==============================================================================
-- Function to get current user's org_id safely
CREATE OR REPLACE FUNCTION public.get_auth_user_org_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER -- Bypasses RLS
SET search_path = public
STABLE
AS $$
    SELECT org_id FROM profiles WHERE id = auth.uid();
$$;

-- Function to check if user is an admin/owner
CREATE OR REPLACE FUNCTION public.is_org_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND (role = 'admin' OR role = 'manager')
    );
-- Function to lookup org by referral code (bypassing RLS)
CREATE OR REPLACE FUNCTION public.get_org_by_referral(ref_code text)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT json_build_object(
        'id', id,
        'name', name
    )
    FROM organizations
    WHERE referral_code = ref_code
    LIMIT 1;

$$;

-- ==============================================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ==============================================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.call_scores ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.coaching_rubrics ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.cultural_profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.playbook_chunks ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 6. RLS POLICIES
-- ==============================================================================

-- --- PROFILES ---
-- View own profile
CREATE POLICY "Users can view own profile" ON profiles FOR
SELECT USING (id = auth.uid ());

-- View profiles in same org (Safe via function)
CREATE POLICY "Users can view org profiles" ON profiles FOR
SELECT USING (
        org_id IS NOT NULL
        AND org_id = get_auth_user_org_id ()
    );

-- Update own profile
CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (id = auth.uid ());

-- Insert own profile (for signup)
CREATE POLICY "Users can insert own profile" ON profiles FOR
INSERT
WITH
    CHECK (id = auth.uid ());

-- --- ORGANIZATIONS ---
-- View own organization (Safe via function)
CREATE POLICY "Users can view own organization" ON organizations FOR
SELECT USING (id = get_auth_user_org_id ());

-- Create organization (during signup)
CREATE POLICY "Users can create organization" ON organizations FOR
INSERT
WITH
    CHECK (true);

-- Update own organization (Owner only)
CREATE POLICY "Owner can update organization" ON organizations FOR
UPDATE USING (
    id = get_auth_user_org_id ()
    AND owner_id = auth.uid ()
);

-- --- CALLS ---
-- View calls in same org
CREATE POLICY "Users can view org calls" ON calls FOR
SELECT USING (
        org_id = get_auth_user_org_id ()
    );

-- Create calls (for own org)
CREATE POLICY "Users can create calls" ON calls FOR
INSERT
WITH
    CHECK (
        org_id = get_auth_user_org_id ()
        OR
        -- Allow insert if no org yet (rare) or user is just creating it
        user_id = auth.uid ()
    );

-- --- CALL SCORES ---
-- View scores in same org (Indirect logic)
CREATE POLICY "Users can view org call scores" ON call_scores FOR
SELECT USING (
        call_id IN (
            SELECT id
            FROM calls
            WHERE
                org_id = get_auth_user_org_id ()
        )
    );

-- --- ANALYTICS EVENTS ---
-- View org events
CREATE POLICY "Users can view org analytics" ON analytics_events FOR
SELECT USING (
        org_id = get_auth_user_org_id ()
    );

-- Insert events
CREATE POLICY "Users can insert analytics" ON analytics_events FOR
INSERT
WITH
    CHECK (
        org_id = get_auth_user_org_id ()
    );

-- --- COACHING RUBRICS ---
-- View org rubrics
CREATE POLICY "Users can view org rubrics" ON coaching_rubrics FOR
SELECT USING (
        org_id = get_auth_user_org_id ()
    );

-- --- CULTURAL PROFILES ---
CREATE POLICY "Cultural profiles are public" ON cultural_profiles FOR
SELECT USING (true);

-- --- PLAYBOOK CHUNKS ---
CREATE POLICY "Users can view org playbooks" ON playbook_chunks FOR
SELECT USING (
        org_id = get_auth_user_org_id ()
    );

-- --- VOICE SESSIONS ---
CREATE POLICY "Users can view org voice sessions" ON voice_sessions FOR
SELECT USING (
        org_id = get_auth_user_org_id ()
    );

CREATE POLICY "Users can create voice sessions" ON voice_sessions FOR
INSERT
WITH
    CHECK (user_id = auth.uid ());

CREATE POLICY "Users can update own voice sessions" ON voice_sessions FOR
UPDATE USING (user_id = auth.uid ());

-- --- USAGE RECORDS ---
CREATE POLICY "Users can view org usage" ON usage_records FOR
SELECT USING (
        org_id = get_auth_user_org_id ()
    );

-- ==============================================================================
-- 7. CLEANUP & PERMISSIONS
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon,
authenticated,
service_role;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon,
authenticated,
service_role;

GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon,
authenticated,
service_role;

GRANT EXECUTE ON FUNCTION get_auth_user_org_id TO authenticated, service_role;

GRANT
EXECUTE ON FUNCTION is_org_admin TO authenticated,
GRANT
EXECUTE ON FUNCTION is_org_admin TO authenticated,
service_role;

GRANT EXECUTE ON FUNCTION get_org_by_referral TO authenticated, anon;

-- Done!