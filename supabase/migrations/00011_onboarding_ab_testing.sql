-- Migration: Onboarding A/B Testing
-- Creates tables for managing onboarding question probabilities and tracking user sessions

-- Table: onboarding_question_config
-- Admin-tunable probabilities for which questions to show during onboarding
CREATE TABLE IF NOT EXISTS onboarding_question_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_key TEXT NOT NULL UNIQUE,
  screen_name TEXT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT false,
  probability NUMERIC(4, 3) NOT NULL DEFAULT 1.000 CHECK (probability >= 0 AND probability <= 1),
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: onboarding_sessions
-- Track what was shown/answered per user during onboarding
CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  config_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
  questions_shown TEXT[] NOT NULL DEFAULT '{}',
  questions_answered TEXT[] NOT NULL DEFAULT '{}',
  questions_skipped TEXT[] NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_user_id ON onboarding_sessions(user_id);

-- Seed data with all questions at probability 1.0 (full flow initially)
INSERT INTO onboarding_question_config (question_key, screen_name, is_required, probability, order_index) VALUES
  -- Profile screen - required fields
  ('first_name', 'profile', true, 1.000, 1),
  ('country', 'profile', true, 1.000, 2),
  -- Profile screen - optional fields
  ('bio', 'profile', false, 1.000, 3),
  ('photo', 'profile', false, 1.000, 4),
  -- Intent screen
  ('trip_intent', 'intent', false, 1.000, 5),
  -- Trip details screen (only for planning intent)
  ('trip_destination', 'trip-details', false, 1.000, 6),
  ('trip_dates', 'trip-details', false, 1.000, 7),
  -- Day style screen
  ('day_style', 'day-style', false, 1.000, 8),
  ('priorities', 'day-style', false, 1.000, 9),
  -- Stay preference screen
  ('stay_preference', 'stay-preference', false, 1.000, 10),
  ('spending_style', 'stay-preference', false, 1.000, 11)
ON CONFLICT (question_key) DO NOTHING;

-- RLS Policies

-- Enable RLS
ALTER TABLE onboarding_question_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

-- Question config: everyone can read (needed for client-side flow calculation)
CREATE POLICY "Anyone can read onboarding config"
  ON onboarding_question_config
  FOR SELECT
  USING (true);

-- Sessions: users can only see/modify their own sessions
CREATE POLICY "Users can view own onboarding sessions"
  ON onboarding_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding sessions"
  ON onboarding_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding sessions"
  ON onboarding_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER onboarding_question_config_updated_at
  BEFORE UPDATE ON onboarding_question_config
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_updated_at();

CREATE TRIGGER onboarding_sessions_updated_at
  BEFORE UPDATE ON onboarding_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_updated_at();
