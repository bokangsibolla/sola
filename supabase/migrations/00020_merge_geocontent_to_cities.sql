-- =====================================================================
-- Migration 00020: Merge geo_content columns into cities table
-- Part of Geography Schema Consolidation (Task 3)
--
-- This migration:
-- 1. Adds all city-relevant content columns from geo_content to cities
-- 2. Migrates existing data from geo_content WHERE scope = 'city'
-- 3. Is idempotent (safe to re-run)
--
-- NOTE: This migration assumes geo_content table has valid city_id references
-- matching the cities table. Rows with NULL city_id will be silently ignored.
-- =====================================================================

-- ---------------------------------------------------------------------------
-- 1. Add content columns to cities table
-- ---------------------------------------------------------------------------

-- Editorial content fields
ALTER TABLE cities ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS subtitle text;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS summary text;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS summary_md text;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS content_md text;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS why_we_love_md text;

-- Safety & solo travel fields
ALTER TABLE cities ADD COLUMN IF NOT EXISTS safety_rating text;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS solo_friendly boolean DEFAULT true;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS solo_level text;

-- Add CHECK constraints (separate statements for idempotency)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cities_safety_rating_check'
  ) THEN
    ALTER TABLE cities ADD CONSTRAINT cities_safety_rating_check
      CHECK (safety_rating IN ('very_safe', 'generally_safe', 'use_caution', 'exercise_caution'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cities_solo_level_check'
  ) THEN
    ALTER TABLE cities ADD CONSTRAINT cities_solo_level_check
      CHECK (solo_level IN ('beginner', 'intermediate', 'expert'));
  END IF;
END $$;

-- Travel planning fields
ALTER TABLE cities ADD COLUMN IF NOT EXISTS best_months text;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS best_time_to_visit text;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS currency text;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS language text;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS visa_note text;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS highlights text[] DEFAULT '{}';
ALTER TABLE cities ADD COLUMN IF NOT EXISTS avg_daily_budget_usd integer;

-- Quality & connectivity fields
ALTER TABLE cities ADD COLUMN IF NOT EXISTS internet_quality text;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS english_friendliness text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cities_internet_quality_check'
  ) THEN
    ALTER TABLE cities ADD CONSTRAINT cities_internet_quality_check
      CHECK (internet_quality IN ('excellent', 'good', 'fair', 'poor'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cities_english_friendliness_check'
  ) THEN
    ALTER TABLE cities ADD CONSTRAINT cities_english_friendliness_check
      CHECK (english_friendliness IN ('high', 'moderate', 'low'));
  END IF;
END $$;

-- Interest/tag fields
ALTER TABLE cities ADD COLUMN IF NOT EXISTS good_for_interests text[] DEFAULT '{}';
ALTER TABLE cities ADD COLUMN IF NOT EXISTS best_for text;

-- City-specific markdown content sections
ALTER TABLE cities ADD COLUMN IF NOT EXISTS transport_md text;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS culture_etiquette_md text;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS safety_women_md text;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS portrait_md text;

-- City-specific arrays
ALTER TABLE cities ADD COLUMN IF NOT EXISTS top_things_to_do text[] DEFAULT '{}';

-- Publication tracking
ALTER TABLE cities ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- ---------------------------------------------------------------------------
-- 2. Migrate data from geo_content WHERE scope = 'city'
-- ---------------------------------------------------------------------------

UPDATE cities c
SET
  title = COALESCE(c.title, gc.title),
  subtitle = COALESCE(c.subtitle, gc.subtitle),
  summary = COALESCE(c.summary, gc.summary),
  summary_md = COALESCE(c.summary_md, gc.summary_md),
  content_md = COALESCE(c.content_md, gc.content_md),
  why_we_love_md = COALESCE(c.why_we_love_md, gc.why_we_love_md),
  safety_rating = COALESCE(c.safety_rating, gc.safety_rating),
  solo_friendly = COALESCE(c.solo_friendly, gc.solo_friendly),
  solo_level = COALESCE(c.solo_level, gc.solo_level),
  best_months = COALESCE(c.best_months, gc.best_months),
  best_time_to_visit = COALESCE(c.best_time_to_visit, gc.best_time_to_visit),
  currency = COALESCE(c.currency, gc.currency),
  language = COALESCE(c.language, gc.language),
  visa_note = COALESCE(c.visa_note, gc.visa_note),
  -- Arrays: preserve existing non-empty arrays, otherwise use geo_content data
  -- This prevents accidental overwriting of manually curated highlights
  highlights = CASE
    WHEN c.highlights IS NULL OR c.highlights = '{}' THEN gc.highlights
    ELSE c.highlights
  END,
  avg_daily_budget_usd = COALESCE(c.avg_daily_budget_usd, gc.avg_daily_budget_usd),
  internet_quality = COALESCE(c.internet_quality, gc.internet_quality),
  english_friendliness = COALESCE(c.english_friendliness, gc.english_friendliness),
  good_for_interests = CASE
    WHEN c.good_for_interests IS NULL OR c.good_for_interests = '{}' THEN gc.good_for_interests
    ELSE c.good_for_interests
  END,
  -- City-specific fields
  transport_md = COALESCE(c.transport_md, gc.transport_md),
  culture_etiquette_md = COALESCE(c.culture_etiquette_md, gc.culture_etiquette_md),
  safety_women_md = COALESCE(c.safety_women_md, gc.safety_women_md),
  portrait_md = COALESCE(c.portrait_md, gc.portrait_md),
  top_things_to_do = CASE
    WHEN c.top_things_to_do IS NULL OR c.top_things_to_do = '{}' THEN gc.top_things_to_do
    ELSE c.top_things_to_do
  END,
  best_for = COALESCE(c.best_for, gc.best_for),
  published_at = COALESCE(c.published_at, gc.published_at)
FROM geo_content gc
WHERE gc.scope = 'city'
  AND gc.city_id = c.id;

-- ---------------------------------------------------------------------------
-- 3. Add comments for documentation
-- ---------------------------------------------------------------------------

COMMENT ON COLUMN cities.title IS 'Display title for the city page';
COMMENT ON COLUMN cities.subtitle IS 'Subtitle or tagline for the city';
COMMENT ON COLUMN cities.summary IS 'Plain text summary of the city';
COMMENT ON COLUMN cities.summary_md IS 'Markdown formatted summary';
COMMENT ON COLUMN cities.content_md IS 'Main content body in markdown';
COMMENT ON COLUMN cities.why_we_love_md IS 'Editorial "why we love it" section in markdown';
COMMENT ON COLUMN cities.safety_rating IS 'Overall safety rating for solo travelers';
COMMENT ON COLUMN cities.solo_friendly IS 'Whether the city is recommended for solo travelers';
COMMENT ON COLUMN cities.solo_level IS 'Recommended experience level for solo travelers';
COMMENT ON COLUMN cities.best_months IS 'Best months to visit (e.g., "Nov-Mar")';
COMMENT ON COLUMN cities.best_time_to_visit IS 'Detailed best time to visit description';
COMMENT ON COLUMN cities.currency IS 'Local currency name/info (may override country default)';
COMMENT ON COLUMN cities.language IS 'Primary language(s) spoken (may differ from country)';
COMMENT ON COLUMN cities.visa_note IS 'City-specific visa/entry notes if different from country';
COMMENT ON COLUMN cities.highlights IS 'Array of highlight features/attractions';
COMMENT ON COLUMN cities.avg_daily_budget_usd IS 'Average daily budget in USD';
COMMENT ON COLUMN cities.internet_quality IS 'General internet/wifi quality rating';
COMMENT ON COLUMN cities.english_friendliness IS 'English proficiency level of locals';
COMMENT ON COLUMN cities.good_for_interests IS 'Array of interest tags this city is good for';
COMMENT ON COLUMN cities.best_for IS 'Brief description of what the city is best for';
COMMENT ON COLUMN cities.transport_md IS 'Getting around the city - transportation tips in markdown';
COMMENT ON COLUMN cities.culture_etiquette_md IS 'City-specific culture and etiquette tips in markdown';
COMMENT ON COLUMN cities.safety_women_md IS 'City-specific safety tips for women travelers in markdown';
COMMENT ON COLUMN cities.portrait_md IS 'City portrait/overview in markdown';
COMMENT ON COLUMN cities.top_things_to_do IS 'Array of top activities/things to do in the city';
COMMENT ON COLUMN cities.published_at IS 'When the city content was published';
