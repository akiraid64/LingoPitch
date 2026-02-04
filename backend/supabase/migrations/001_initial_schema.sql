-- LingoPitch Database Schema
-- Run this migration in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cultural Profiles Table
CREATE TABLE IF NOT EXISTS cultural_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language_code VARCHAR(10) NOT NULL UNIQUE,
  language_name VARCHAR(100) NOT NULL,
  communication_style TEXT NOT NULL,
  formality_level INTEGER NOT NULL CHECK (formality_level >= 1 AND formality_level <= 10),
  relationship_building TEXT NOT NULL,
  decision_making TEXT NOT NULL,
  negotiation_approach TEXT NOT NULL,
  taboos TEXT[] NOT NULL DEFAULT '{}',
  power_phrases TEXT[] NOT NULL DEFAULT '{}',
  greetings_protocol TEXT NOT NULL,
  business_etiquette TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calls Table
CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id VARCHAR(255) NOT NULL,
    language_code VARCHAR(10) NOT NULL,
    scenario VARCHAR(255) NOT NULL,
    transcript TEXT NOT NULL,
    analysis JSONB,
    scores JSONB,
    cultural_scores JSONB,
    duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  role VARCHAR(255),
  target_languages TEXT[] DEFAULT '{}',
  practice_count INTEGER DEFAULT 0,
  average_score DECIMAL(3,2) DEFAULT 0,
  cultural_iq DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON calls (user_id);

CREATE INDEX IF NOT EXISTS idx_calls_language_code ON calls (language_code);

CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cultural_profiles_language_code ON cultural_profiles (language_code);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles (user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events (user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events (event_type);

CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events (created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_cultural_profiles_updated_at
  BEFORE UPDATE ON cultural_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Note: Adjust these based on your auth requirements

ALTER TABLE cultural_profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow public read access to cultural profiles
CREATE POLICY "Cultural profiles are viewable by everyone" ON cultural_profiles FOR
SELECT USING (true);

-- Allow service role to insert/update cultural profiles
CREATE POLICY "Service role can manage cultural profiles" ON cultural_profiles FOR ALL USING (auth.role () = 'service_role');

-- Users can only view their own calls
CREATE POLICY "Users can view their own calls"
  ON calls FOR SELECT
  USING (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- Users can create their own calls
CREATE POLICY "Users can create their own calls"
  ON calls FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- Users can view/update their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid()::text = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid()::text = user_id OR auth.role() = 'service_role');

CREATE POLICY "Allow profile creation during signup" ON user_profiles FOR
INSERT
WITH
    CHECK (true);

-- Users can view/create their own analytics events
CREATE POLICY "Users can view their own analytics"
  ON analytics_events FOR SELECT
  USING (auth.uid()::text = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can create their own analytics"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');