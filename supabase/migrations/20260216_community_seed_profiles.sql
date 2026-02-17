-- ============================================================
-- Community Seed Profiles: display-only profiles for seed content
-- ============================================================

-- 1. Create seed profiles table
CREATE TABLE IF NOT EXISTS community_seed_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  avatar_url text,
  bio text,
  home_base text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: public SELECT only
ALTER TABLE community_seed_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view seed profiles"
  ON community_seed_profiles FOR SELECT
  USING (true);

-- 2. Update author_type check on community_threads to allow 'seed'
ALTER TABLE community_threads
  DROP CONSTRAINT IF EXISTS community_threads_author_type_check;

ALTER TABLE community_threads
  ADD CONSTRAINT community_threads_author_type_check
  CHECK (author_type IN ('user', 'system', 'seed'));

-- 3. Add seed_profile_id FK to community_threads
ALTER TABLE community_threads
  ADD COLUMN IF NOT EXISTS seed_profile_id uuid
  REFERENCES community_seed_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_threads_seed_profile
  ON community_threads (seed_profile_id)
  WHERE seed_profile_id IS NOT NULL;

-- 4. Add author_type and seed_profile_id to community_replies
ALTER TABLE community_replies
  ADD COLUMN IF NOT EXISTS author_type text NOT NULL DEFAULT 'user';

ALTER TABLE community_replies
  DROP CONSTRAINT IF EXISTS community_replies_author_type_check;

ALTER TABLE community_replies
  ADD CONSTRAINT community_replies_author_type_check
  CHECK (author_type IN ('user', 'system', 'seed'));

ALTER TABLE community_replies
  ADD COLUMN IF NOT EXISTS seed_profile_id uuid
  REFERENCES community_seed_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_replies_seed_profile
  ON community_replies (seed_profile_id)
  WHERE seed_profile_id IS NOT NULL;
