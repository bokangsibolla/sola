-- =====================================================================
-- Migration 00021: Drop geo_content table (DEFERRED - DO NOT RUN YET)
-- Part of Geography Schema Consolidation (Task 8)
--
-- WARNING: This migration is DEFERRED. Only run after:
-- 1. All frontend code has been updated and deployed
-- 2. Verified in production for 2+ weeks with no geo_content errors
-- 3. Confirmed that countries and cities tables have all migrated data
--
-- To run this migration manually when ready:
--   psql -f supabase/migrations/00021_drop_geocontent_DEFERRED.sql
--
-- This file is named with _DEFERRED suffix to prevent automatic execution
-- by `supabase db push`. Rename to remove the suffix when ready to run.
-- =====================================================================

-- ---------------------------------------------------------------------------
-- 1. Verify all data has been migrated
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  country_content_count integer;
  city_content_count integer;
  countries_with_content integer;
  cities_with_content integer;
BEGIN
  -- Count geo_content rows by scope
  SELECT count(*) INTO country_content_count FROM geo_content WHERE scope = 'country';
  SELECT count(*) INTO city_content_count FROM geo_content WHERE scope = 'city';

  -- Count countries/cities that have content (title is a good indicator)
  SELECT count(*) INTO countries_with_content FROM countries WHERE title IS NOT NULL;
  SELECT count(*) INTO cities_with_content FROM cities WHERE title IS NOT NULL;

  -- Verify migration completeness
  IF country_content_count > countries_with_content THEN
    RAISE EXCEPTION 'Data migration incomplete: % geo_content country rows but only % countries have content',
      country_content_count, countries_with_content;
  END IF;

  IF city_content_count > cities_with_content THEN
    RAISE EXCEPTION 'Data migration incomplete: % geo_content city rows but only % cities have content',
      city_content_count, cities_with_content;
  END IF;

  RAISE NOTICE 'Migration verification passed: % country records, % city records migrated',
    countries_with_content, cities_with_content;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Drop the geo_content table
-- ---------------------------------------------------------------------------

-- Remove RLS policies first
DROP POLICY IF EXISTS "Public read access" ON geo_content;
DROP POLICY IF EXISTS "Admins can update geo_content" ON geo_content;

-- Drop the table
DROP TABLE IF EXISTS geo_content;

-- ---------------------------------------------------------------------------
-- 3. Confirmation
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  RAISE NOTICE 'geo_content table has been dropped. The geography schema is now consolidated.';
END $$;
