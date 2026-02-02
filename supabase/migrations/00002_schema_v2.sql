-- =====================================================================
-- Migration 00002: Schema v2
-- Expands place_type enum, adds unique constraints, updated_at trigger,
-- and new geo_content columns for the full Explore page structure.
-- =====================================================================

-- ---------------------------------------------------------------------------
-- 1. Expand place_type CHECK constraint
-- ---------------------------------------------------------------------------
ALTER TABLE places DROP CONSTRAINT IF EXISTS places_place_type_check;
ALTER TABLE places ADD CONSTRAINT places_place_type_check CHECK (place_type IN (
  'hotel', 'hostel', 'homestay', 'restaurant', 'cafe', 'bakery', 'bar', 'club', 'rooftop',
  'activity', 'coworking', 'landmark', 'transport', 'shop',
  'wellness', 'spa', 'salon', 'gym',
  'laundry', 'pharmacy', 'clinic', 'atm', 'police', 'tour'
));

-- ---------------------------------------------------------------------------
-- 2. Unique constraints on geo_content to prevent duplicates
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_geo_content_country
  ON geo_content(country_id) WHERE scope = 'country' AND country_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_geo_content_city
  ON geo_content(city_id) WHERE scope = 'city' AND city_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 3. Auto-update updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'countries','cities','city_areas','places','profiles','geo_content'
    ])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_updated_at ON %I; CREATE TRIGGER trg_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at();',
      t, t
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 4. New geo_content columns for country "at a glance" + tabbed sections
-- ---------------------------------------------------------------------------
ALTER TABLE geo_content
  ADD COLUMN IF NOT EXISTS summary_md text,
  ADD COLUMN IF NOT EXISTS why_we_love_md text,
  ADD COLUMN IF NOT EXISTS avg_daily_budget_usd integer,
  ADD COLUMN IF NOT EXISTS best_time_to_visit text,
  ADD COLUMN IF NOT EXISTS internet_quality text CHECK (internet_quality IN ('excellent', 'good', 'fair', 'poor')),
  ADD COLUMN IF NOT EXISTS english_friendliness text CHECK (english_friendliness IN ('high', 'moderate', 'low')),
  ADD COLUMN IF NOT EXISTS solo_level text CHECK (solo_level IN ('beginner', 'intermediate', 'expert')),
  ADD COLUMN IF NOT EXISTS good_for_interests text[] DEFAULT '{}',
  -- Country tabbed sections
  ADD COLUMN IF NOT EXISTS getting_there_md text,
  ADD COLUMN IF NOT EXISTS visa_entry_md text,
  ADD COLUMN IF NOT EXISTS sim_connectivity_md text,
  ADD COLUMN IF NOT EXISTS money_md text,
  ADD COLUMN IF NOT EXISTS culture_etiquette_md text,
  ADD COLUMN IF NOT EXISTS safety_women_md text,
  -- City sections
  ADD COLUMN IF NOT EXISTS transport_md text,
  ADD COLUMN IF NOT EXISTS top_things_to_do text[] DEFAULT '{}';

-- ---------------------------------------------------------------------------
-- 5. Expand tag filter_group CHECK to include new groups
-- ---------------------------------------------------------------------------
ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_filter_group_check;
ALTER TABLE tags ADD CONSTRAINT tags_filter_group_check CHECK (filter_group IN (
  'vibe', 'good_for', 'amenity', 'safety', 'cuisine', 'style', 'music', 'physical_level', 'diet'
));
