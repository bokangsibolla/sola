-- Add image pipeline columns for gallery images, quality scoring, and licensing.
-- These complement the existing hero_image_url, image_source, image_attribution columns.

-- Countries
ALTER TABLE countries
  ADD COLUMN IF NOT EXISTS image_gallery_urls text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS image_quality_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS image_license_hint text DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS image_notes text,
  ADD COLUMN IF NOT EXISTS usage_rights_status text DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS canonical_query text;

-- Cities
ALTER TABLE cities
  ADD COLUMN IF NOT EXISTS image_gallery_urls text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS image_quality_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS image_license_hint text DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS image_notes text,
  ADD COLUMN IF NOT EXISTS usage_rights_status text DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS canonical_query text;

-- City areas (neighborhoods) — lighter set of columns
ALTER TABLE city_areas
  ADD COLUMN IF NOT EXISTS image_source text,
  ADD COLUMN IF NOT EXISTS image_attribution text,
  ADD COLUMN IF NOT EXISTS image_cached_at timestamptz;

-- Check constraints for usage_rights_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'countries_usage_rights_check'
  ) THEN
    ALTER TABLE countries
      ADD CONSTRAINT countries_usage_rights_check
      CHECK (usage_rights_status IN ('unknown', 'needs_review', 'ok_internal_testing'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cities_usage_rights_check'
  ) THEN
    ALTER TABLE cities
      ADD CONSTRAINT cities_usage_rights_check
      CHECK (usage_rights_status IN ('unknown', 'needs_review', 'ok_internal_testing'));
  END IF;
END $$;

-- Check constraints for image_license_hint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'countries_license_hint_check'
  ) THEN
    ALTER TABLE countries
      ADD CONSTRAINT countries_license_hint_check
      CHECK (image_license_hint IN ('unknown', 'likely_restricted', 'gov_tourism', 'wikimedia_like'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cities_license_hint_check'
  ) THEN
    ALTER TABLE cities
      ADD CONSTRAINT cities_license_hint_check
      CHECK (image_license_hint IN ('unknown', 'likely_restricted', 'gov_tourism', 'wikimedia_like'));
  END IF;
END $$;
