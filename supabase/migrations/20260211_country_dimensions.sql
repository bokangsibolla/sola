-- Migration: Add 6-dimension columns and practical link fields
-- Date: 2026-02-11
-- Purpose: Restructure country content around dimensions that matter
--          specifically to women traveling solo.

-- =========================================================================
-- 1. New dimension markdown columns
-- =========================================================================
ALTER TABLE countries
  ADD COLUMN IF NOT EXISTS sovereignty_md text,
  ADD COLUMN IF NOT EXISTS solo_infrastructure_md text,
  ADD COLUMN IF NOT EXISTS health_access_md text,
  ADD COLUMN IF NOT EXISTS experience_density_md text,
  ADD COLUMN IF NOT EXISTS community_connection_md text,
  ADD COLUMN IF NOT EXISTS cost_reality_md text;

-- =========================================================================
-- 2. Structured practical link fields
-- =========================================================================
ALTER TABLE countries
  ADD COLUMN IF NOT EXISTS immigration_url text,
  ADD COLUMN IF NOT EXISTS arrival_card_url text,
  ADD COLUMN IF NOT EXISTS sim_providers jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS health_search_terms text[] DEFAULT '{}';

-- =========================================================================
-- 3. Column comments
-- =========================================================================
COMMENT ON COLUMN countries.sovereignty_md IS 'How it feels to exist here as a woman. Social texture, attention levels, local norms. Sourced from traveler reports.';
COMMENT ON COLUMN countries.solo_infrastructure_md IS 'Can you navigate independently? Transit, apps, connectivity, language reality.';
COMMENT ON COLUMN countries.health_access_md IS 'Medical care quality, pharmacy access, reproductive health, what to pack.';
COMMENT ON COLUMN countries.experience_density_md IS 'What draws women here. Richness, pacing, variety of experiences.';
COMMENT ON COLUMN countries.community_connection_md IS 'Where and how solo women meet people. Traveler scene, social infrastructure.';
COMMENT ON COLUMN countries.cost_reality_md IS 'Real daily costs including safety premium. The midnight taxi, the solo room, the guided tour.';
COMMENT ON COLUMN countries.immigration_url IS 'Official government immigration/visa portal URL';
COMMENT ON COLUMN countries.arrival_card_url IS 'Digital arrival card URL if required (e.g. Visit Japan Web)';
COMMENT ON COLUMN countries.sim_providers IS 'JSON array of {name, url, note} for tourist SIM providers';
COMMENT ON COLUMN countries.health_search_terms IS 'Google Places Text Search queries for finding women health facilities in this country';

-- =========================================================================
-- 4. Add hospital to places place_type CHECK constraint
-- =========================================================================
ALTER TABLE places DROP CONSTRAINT IF EXISTS places_place_type_check;
ALTER TABLE places ADD CONSTRAINT places_place_type_check CHECK (place_type IN (
  'hotel', 'hostel', 'homestay', 'restaurant', 'cafe', 'bakery', 'bar', 'club', 'rooftop',
  'activity', 'coworking', 'landmark', 'transport', 'shop',
  'wellness', 'spa', 'salon', 'gym',
  'laundry', 'pharmacy', 'clinic', 'hospital', 'atm', 'police', 'tour'
));
