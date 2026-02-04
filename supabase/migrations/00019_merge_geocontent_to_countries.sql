-- =====================================================================
-- Migration 00019: Merge geo_content columns into countries table
-- Part of Geography Schema Consolidation (Task 2)
--
-- This migration:
-- 1. Adds all country-relevant content columns from geo_content to countries
-- 2. Migrates existing data from geo_content WHERE scope = 'country'
-- 3. Is idempotent (safe to re-run)
-- =====================================================================

-- ---------------------------------------------------------------------------
-- 1. Add content columns to countries table
-- ---------------------------------------------------------------------------

-- Editorial content fields
ALTER TABLE countries ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS subtitle text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS summary text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS summary_md text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS content_md text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS why_we_love_md text;

-- Safety & solo travel fields
ALTER TABLE countries ADD COLUMN IF NOT EXISTS safety_rating text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS solo_friendly boolean DEFAULT true;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS solo_level text;

-- Add CHECK constraints (separate statements for idempotency)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'countries_safety_rating_check'
  ) THEN
    ALTER TABLE countries ADD CONSTRAINT countries_safety_rating_check
      CHECK (safety_rating IN ('very_safe', 'generally_safe', 'use_caution', 'exercise_caution'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'countries_solo_level_check'
  ) THEN
    ALTER TABLE countries ADD CONSTRAINT countries_solo_level_check
      CHECK (solo_level IN ('beginner', 'intermediate', 'expert'));
  END IF;
END $$;

-- Travel planning fields
ALTER TABLE countries ADD COLUMN IF NOT EXISTS best_months text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS best_time_to_visit text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS currency text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS language text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS visa_note text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS highlights text[] DEFAULT '{}';
ALTER TABLE countries ADD COLUMN IF NOT EXISTS avg_daily_budget_usd integer;

-- Quality & connectivity fields
ALTER TABLE countries ADD COLUMN IF NOT EXISTS internet_quality text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS english_friendliness text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'countries_internet_quality_check'
  ) THEN
    ALTER TABLE countries ADD CONSTRAINT countries_internet_quality_check
      CHECK (internet_quality IN ('excellent', 'good', 'fair', 'poor'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'countries_english_friendliness_check'
  ) THEN
    ALTER TABLE countries ADD CONSTRAINT countries_english_friendliness_check
      CHECK (english_friendliness IN ('high', 'moderate', 'low'));
  END IF;
END $$;

-- Interest/tag fields
ALTER TABLE countries ADD COLUMN IF NOT EXISTS good_for_interests text[] DEFAULT '{}';
ALTER TABLE countries ADD COLUMN IF NOT EXISTS best_for text;

-- Markdown content sections (country tabs)
ALTER TABLE countries ADD COLUMN IF NOT EXISTS getting_there_md text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS visa_entry_md text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS sim_connectivity_md text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS money_md text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS culture_etiquette_md text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS safety_women_md text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS portrait_md text;

-- Publication tracking
ALTER TABLE countries ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- ---------------------------------------------------------------------------
-- 2. Migrate data from geo_content WHERE scope = 'country'
-- ---------------------------------------------------------------------------

UPDATE countries c
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
  getting_there_md = COALESCE(c.getting_there_md, gc.getting_there_md),
  visa_entry_md = COALESCE(c.visa_entry_md, gc.visa_entry_md),
  sim_connectivity_md = COALESCE(c.sim_connectivity_md, gc.sim_connectivity_md),
  money_md = COALESCE(c.money_md, gc.money_md),
  culture_etiquette_md = COALESCE(c.culture_etiquette_md, gc.culture_etiquette_md),
  safety_women_md = COALESCE(c.safety_women_md, gc.safety_women_md),
  portrait_md = COALESCE(c.portrait_md, gc.portrait_md),
  best_for = COALESCE(c.best_for, gc.best_for),
  published_at = COALESCE(c.published_at, gc.published_at)
FROM geo_content gc
WHERE gc.scope = 'country'
  AND gc.country_id = c.id;

-- ---------------------------------------------------------------------------
-- 3. Add comments for documentation
-- ---------------------------------------------------------------------------

COMMENT ON COLUMN countries.title IS 'Display title for the country page';
COMMENT ON COLUMN countries.subtitle IS 'Subtitle or tagline for the country';
COMMENT ON COLUMN countries.summary IS 'Plain text summary of the country';
COMMENT ON COLUMN countries.summary_md IS 'Markdown formatted summary';
COMMENT ON COLUMN countries.content_md IS 'Main content body in markdown';
COMMENT ON COLUMN countries.why_we_love_md IS 'Editorial "why we love it" section in markdown';
COMMENT ON COLUMN countries.safety_rating IS 'Overall safety rating for solo travelers';
COMMENT ON COLUMN countries.solo_friendly IS 'Whether the country is recommended for solo travelers';
COMMENT ON COLUMN countries.solo_level IS 'Recommended experience level for solo travelers';
COMMENT ON COLUMN countries.best_months IS 'Best months to visit (e.g., "Nov-Mar")';
COMMENT ON COLUMN countries.best_time_to_visit IS 'Detailed best time to visit description';
COMMENT ON COLUMN countries.currency IS 'Local currency name/info (separate from currency_code)';
COMMENT ON COLUMN countries.language IS 'Primary language(s) spoken';
COMMENT ON COLUMN countries.visa_note IS 'Brief visa requirements note';
COMMENT ON COLUMN countries.highlights IS 'Array of highlight features/attractions';
COMMENT ON COLUMN countries.avg_daily_budget_usd IS 'Average daily budget in USD';
COMMENT ON COLUMN countries.internet_quality IS 'General internet/wifi quality rating';
COMMENT ON COLUMN countries.english_friendliness IS 'English proficiency level of locals';
COMMENT ON COLUMN countries.good_for_interests IS 'Array of interest tags this country is good for';
COMMENT ON COLUMN countries.best_for IS 'Brief description of what the country is best for';
COMMENT ON COLUMN countries.getting_there_md IS 'How to get there section in markdown';
COMMENT ON COLUMN countries.visa_entry_md IS 'Detailed visa/entry requirements in markdown';
COMMENT ON COLUMN countries.sim_connectivity_md IS 'SIM cards and connectivity info in markdown';
COMMENT ON COLUMN countries.money_md IS 'Money, ATMs, payments info in markdown';
COMMENT ON COLUMN countries.culture_etiquette_md IS 'Culture and etiquette tips in markdown';
COMMENT ON COLUMN countries.safety_women_md IS 'Safety tips for women travelers in markdown';
COMMENT ON COLUMN countries.portrait_md IS 'Country portrait/overview in markdown';
COMMENT ON COLUMN countries.published_at IS 'When the country content was published';
