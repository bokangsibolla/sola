-- =====================================================================
-- Migration 00015: Add rich curation details to places
-- Stores highlights, considerations, and solo female reviews
-- =====================================================================

-- Add new curation columns
ALTER TABLE places
  ADD COLUMN IF NOT EXISTS why_selected text,
  ADD COLUMN IF NOT EXISTS highlights jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS considerations jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS solo_female_reviews text,
  ADD COLUMN IF NOT EXISTS google_maps_url text,
  ADD COLUMN IF NOT EXISTS original_type text,
  ADD COLUMN IF NOT EXISTS price_per_night text,
  ADD COLUMN IF NOT EXISTS sources_checked jsonb DEFAULT '[]';

-- Add comments
COMMENT ON COLUMN places.why_selected IS 'Editorial explanation of why this place was selected for Sola';
COMMENT ON COLUMN places.highlights IS 'JSON array of highlight strings (positive features)';
COMMENT ON COLUMN places.considerations IS 'JSON array of consideration strings (things to know)';
COMMENT ON COLUMN places.solo_female_reviews IS 'Quotes or summaries from solo female traveler reviews';
COMMENT ON COLUMN places.google_maps_url IS 'Direct Google Maps URL for the place';
COMMENT ON COLUMN places.original_type IS 'More specific type (boutique_hotel, resort, guesthouse, etc.)';
COMMENT ON COLUMN places.price_per_night IS 'Approximate price per night as string';
COMMENT ON COLUMN places.sources_checked IS 'JSON array of sources used for research';
