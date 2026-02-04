-- Migration: Add explore screen fields for short_blurb and badge_label
-- These fields support the Explore tab UI without hardcoded content

-- Add short_blurb and badge_label to countries table
ALTER TABLE countries
  ADD COLUMN IF NOT EXISTS short_blurb text,
  ADD COLUMN IF NOT EXISTS badge_label text,
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

COMMENT ON COLUMN countries.short_blurb IS 'One-liner description for explore cards (e.g., "Easy first solo trip, great transit")';
COMMENT ON COLUMN countries.badge_label IS 'Optional badge text (e.g., "Solo-friendly", "Trending", "New")';
COMMENT ON COLUMN countries.is_featured IS 'Whether to feature this country prominently';

-- Add short_blurb and badge_label to cities table
ALTER TABLE cities
  ADD COLUMN IF NOT EXISTS short_blurb text,
  ADD COLUMN IF NOT EXISTS badge_label text,
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

COMMENT ON COLUMN cities.short_blurb IS 'One-liner description for explore cards (e.g., "Beach town with calm cafés")';
COMMENT ON COLUMN cities.badge_label IS 'Optional badge text (e.g., "Hidden gem", "Popular", "New")';
COMMENT ON COLUMN cities.is_featured IS 'Whether to feature this city prominently';

-- Add badge_label to places table (already has description for blurb)
ALTER TABLE places
  ADD COLUMN IF NOT EXISTS badge_label text,
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

COMMENT ON COLUMN places.badge_label IS 'Optional badge text (e.g., "Editor pick", "Trending")';
COMMENT ON COLUMN places.is_featured IS 'Whether to feature this place prominently';

-- Add badge_label to geo_content table (already has best_for for blurb)
ALTER TABLE geo_content
  ADD COLUMN IF NOT EXISTS badge_label text;

COMMENT ON COLUMN geo_content.badge_label IS 'Optional badge text for explore cards';
