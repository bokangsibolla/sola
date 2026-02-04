-- =====================================================================
-- Migration 00014: Add internal curation notes to places
-- For internal documentation of why places were selected
-- =====================================================================

-- Add internal-only columns to places table
ALTER TABLE places
  ADD COLUMN IF NOT EXISTS curation_notes text,
  ADD COLUMN IF NOT EXISTS curation_score numeric(4,2),
  ADD COLUMN IF NOT EXISTS google_rating numeric(2,1),
  ADD COLUMN IF NOT EXISTS google_review_count integer,
  ADD COLUMN IF NOT EXISTS discovered_at timestamptz,
  ADD COLUMN IF NOT EXISTS discovery_query text;

-- Add comments for internal documentation
COMMENT ON COLUMN places.curation_notes IS 'Internal notes explaining why this place was selected for Sola';
COMMENT ON COLUMN places.curation_score IS 'Internal score based on rating * log(reviews) used for ranking';
COMMENT ON COLUMN places.google_rating IS 'Google Places rating at time of discovery';
COMMENT ON COLUMN places.google_review_count IS 'Google review count at time of discovery';
COMMENT ON COLUMN places.discovered_at IS 'When this place was discovered/added';
COMMENT ON COLUMN places.discovery_query IS 'The search query that found this place';
