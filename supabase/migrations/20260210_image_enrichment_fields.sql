-- Image enrichment metadata for countries and cities
-- Supports Google Places image sourcing, attribution (ToS compliance), and cache state

-- ── Countries ────────────────────────────────────────────────────────────────

ALTER TABLE countries
  ADD COLUMN IF NOT EXISTS google_place_id     text,
  ADD COLUMN IF NOT EXISTS image_source        text DEFAULT 'unsplash',
  ADD COLUMN IF NOT EXISTS image_attribution   text,
  ADD COLUMN IF NOT EXISTS image_cached_at     timestamptz;

COMMENT ON COLUMN countries.google_place_id   IS 'Google Places API place ID used for image lookup';
COMMENT ON COLUMN countries.image_source      IS 'Origin of hero image: unsplash, google, manual';
COMMENT ON COLUMN countries.image_attribution IS 'Required attribution text per image source ToS';
COMMENT ON COLUMN countries.image_cached_at   IS 'Timestamp when the current hero image was fetched/cached';

-- ── Cities ───────────────────────────────────────────────────────────────────

ALTER TABLE cities
  ADD COLUMN IF NOT EXISTS google_place_id     text,
  ADD COLUMN IF NOT EXISTS image_source        text DEFAULT 'unsplash',
  ADD COLUMN IF NOT EXISTS image_attribution   text,
  ADD COLUMN IF NOT EXISTS image_cached_at     timestamptz;

COMMENT ON COLUMN cities.google_place_id   IS 'Google Places API place ID used for image lookup';
COMMENT ON COLUMN cities.image_source      IS 'Origin of hero image: unsplash, google, manual';
COMMENT ON COLUMN cities.image_attribution IS 'Required attribution text per image source ToS';
COMMENT ON COLUMN cities.image_cached_at   IS 'Timestamp when the current hero image was fetched/cached';
