-- Add onboarding flags for explore mode education
-- Used by useExploreOnboarding hook to persist dismissal state

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS has_seen_explore_modes boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_seen_trip_prompt   boolean NOT NULL DEFAULT false;
