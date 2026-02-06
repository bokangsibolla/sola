-- Migration: Add NOT NULL constraints to boolean and timestamp columns
--
-- This migration hardens the schema by ensuring boolean and timestamp columns
-- cannot contain NULL values. For each boolean column, we follow the pattern:
--   1. SET DEFAULT (so future inserts get a value)
--   2. UPDATE existing NULLs to the default
--   3. SET NOT NULL (so NULLs are rejected going forward)
--
-- Timestamp columns (created_at, updated_at) already have DEFAULT now() from
-- prior migrations, so we only UPDATE NULLs and SET NOT NULL.

BEGIN;

-- ============================================================================
-- 1. Boolean columns: SET DEFAULT → UPDATE NULLs → SET NOT NULL
-- ============================================================================

-- countries.is_active (default true)
ALTER TABLE countries ALTER COLUMN is_active SET DEFAULT true;
UPDATE countries SET is_active = true WHERE is_active IS NULL;
ALTER TABLE countries ALTER COLUMN is_active SET NOT NULL;

-- cities.is_active (default true)
ALTER TABLE cities ALTER COLUMN is_active SET DEFAULT true;
UPDATE cities SET is_active = true WHERE is_active IS NULL;
ALTER TABLE cities ALTER COLUMN is_active SET NOT NULL;

-- city_areas.is_active (default true)
ALTER TABLE city_areas ALTER COLUMN is_active SET DEFAULT true;
UPDATE city_areas SET is_active = true WHERE is_active IS NULL;
ALTER TABLE city_areas ALTER COLUMN is_active SET NOT NULL;

-- city_areas.is_primary (default false)
ALTER TABLE city_areas ALTER COLUMN is_primary SET DEFAULT false;
UPDATE city_areas SET is_primary = false WHERE is_primary IS NULL;
ALTER TABLE city_areas ALTER COLUMN is_primary SET NOT NULL;

-- places.is_active (default true)
ALTER TABLE places ALTER COLUMN is_active SET DEFAULT true;
UPDATE places SET is_active = true WHERE is_active IS NULL;
ALTER TABLE places ALTER COLUMN is_active SET NOT NULL;

-- profiles.is_online (default false)
ALTER TABLE profiles ALTER COLUMN is_online SET DEFAULT false;
UPDATE profiles SET is_online = false WHERE is_online IS NULL;
ALTER TABLE profiles ALTER COLUMN is_online SET NOT NULL;

-- collections.is_public (default false)
ALTER TABLE collections ALTER COLUMN is_public SET DEFAULT false;
UPDATE collections SET is_public = false WHERE is_public IS NULL;
ALTER TABLE collections ALTER COLUMN is_public SET NOT NULL;

-- ============================================================================
-- 2. Timestamp columns: UPDATE NULLs → SET NOT NULL
--    (DEFAULT now() already set in prior migrations)
-- ============================================================================

-- countries
UPDATE countries SET created_at = now() WHERE created_at IS NULL;
ALTER TABLE countries ALTER COLUMN created_at SET NOT NULL;
UPDATE countries SET updated_at = now() WHERE updated_at IS NULL;
ALTER TABLE countries ALTER COLUMN updated_at SET NOT NULL;

-- cities
UPDATE cities SET created_at = now() WHERE created_at IS NULL;
ALTER TABLE cities ALTER COLUMN created_at SET NOT NULL;
UPDATE cities SET updated_at = now() WHERE updated_at IS NULL;
ALTER TABLE cities ALTER COLUMN updated_at SET NOT NULL;

-- city_areas
UPDATE city_areas SET created_at = now() WHERE created_at IS NULL;
ALTER TABLE city_areas ALTER COLUMN created_at SET NOT NULL;
UPDATE city_areas SET updated_at = now() WHERE updated_at IS NULL;
ALTER TABLE city_areas ALTER COLUMN updated_at SET NOT NULL;

-- places
UPDATE places SET created_at = now() WHERE created_at IS NULL;
ALTER TABLE places ALTER COLUMN created_at SET NOT NULL;
UPDATE places SET updated_at = now() WHERE updated_at IS NULL;
ALTER TABLE places ALTER COLUMN updated_at SET NOT NULL;

-- profiles
UPDATE profiles SET created_at = now() WHERE created_at IS NULL;
ALTER TABLE profiles ALTER COLUMN created_at SET NOT NULL;
UPDATE profiles SET updated_at = now() WHERE updated_at IS NULL;
ALTER TABLE profiles ALTER COLUMN updated_at SET NOT NULL;

-- ============================================================================
-- 3. Add missing updated_at column to trips table + trigger
-- ============================================================================

ALTER TABLE trips ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_updated_at ON trips;
CREATE TRIGGER trg_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 4. Add missing created_at column to community_topics table
-- ============================================================================

ALTER TABLE community_topics ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

COMMIT;
