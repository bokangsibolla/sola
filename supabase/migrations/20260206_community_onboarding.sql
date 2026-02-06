-- ============================================================
-- MIGRATION: Community onboarding flags + Sola Team identity
-- ============================================================

-- 1. Add onboarding flags to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS has_seen_community_intro boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_created_first_post boolean NOT NULL DEFAULT false;

-- 2. Add author_type to community_threads for system posts
ALTER TABLE community_threads
  ADD COLUMN IF NOT EXISTS author_type text NOT NULL DEFAULT 'user'
    CHECK (author_type IN ('user', 'system'));

-- 3. Add is_seed flag to community_threads
ALTER TABLE community_threads
  ADD COLUMN IF NOT EXISTS is_seed boolean NOT NULL DEFAULT false;
