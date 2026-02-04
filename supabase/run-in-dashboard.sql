-- =====================================================================
-- COMBINED VERIFICATION MIGRATIONS
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================================

-- ---------------------------------------------------------------------------
-- 1. Create verification status enum
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE place_verification_status AS ENUM (
    'unverified',
    'pending',
    'baseline_passed',
    'baseline_failed',
    'insufficient_data',
    'sola_checked'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Extend places table with verification columns
-- ---------------------------------------------------------------------------

ALTER TABLE places
  ADD COLUMN IF NOT EXISTS verification_status place_verification_status DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS sola_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS sola_checked_by uuid REFERENCES profiles(id);

CREATE INDEX IF NOT EXISTS idx_places_verification_status ON places(verification_status);

-- ---------------------------------------------------------------------------
-- 3. Add internal curation columns
-- ---------------------------------------------------------------------------

ALTER TABLE places
  ADD COLUMN IF NOT EXISTS curation_notes text,
  ADD COLUMN IF NOT EXISTS curation_score numeric(4,2),
  ADD COLUMN IF NOT EXISTS google_rating numeric(2,1),
  ADD COLUMN IF NOT EXISTS google_review_count integer,
  ADD COLUMN IF NOT EXISTS discovered_at timestamptz,
  ADD COLUMN IF NOT EXISTS discovery_query text;

-- ---------------------------------------------------------------------------
-- 4. Place verification runs (audit trail)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS place_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  status place_verification_status NOT NULL,
  sources_checked jsonb DEFAULT '[]',
  raw_findings jsonb DEFAULT '{}',
  confidence_score numeric(3,2),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_place_verifications_place ON place_verifications(place_id);
CREATE INDEX IF NOT EXISTS idx_place_verifications_created ON place_verifications(created_at DESC);

ALTER TABLE place_verifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read place_verifications" ON place_verifications;
CREATE POLICY "Anyone can read place_verifications"
  ON place_verifications FOR SELECT USING (true);

-- ---------------------------------------------------------------------------
-- 5. Place signals
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS place_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  signal_key text NOT NULL,
  signal_value text,
  signal_type text NOT NULL CHECK (signal_type IN ('boolean', 'text', 'category')),
  confidence numeric(3,2),
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (place_id, signal_key)
);

CREATE INDEX IF NOT EXISTS idx_place_signals_place ON place_signals(place_id);
CREATE INDEX IF NOT EXISTS idx_place_signals_key ON place_signals(signal_key);

ALTER TABLE place_signals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read place_signals" ON place_signals;
CREATE POLICY "Anyone can read place_signals"
  ON place_signals FOR SELECT USING (true);

-- ---------------------------------------------------------------------------
-- 6. Place Sola notes
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS place_sola_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  note_type text NOT NULL CHECK (note_type IN ('highlight', 'context', 'consideration')),
  note_text text NOT NULL,
  display_context text DEFAULT 'always',
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_place_sola_notes_place ON place_sola_notes(place_id);

ALTER TABLE place_sola_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read place_sola_notes" ON place_sola_notes;
CREATE POLICY "Anyone can read place_sola_notes"
  ON place_sola_notes FOR SELECT USING (true);

-- ---------------------------------------------------------------------------
-- 7. Storage bucket for place images
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('place-images', 'place-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read access for place images" ON storage.objects;
CREATE POLICY "Public read access for place images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'place-images');

DROP POLICY IF EXISTS "Service role full access to place images" ON storage.objects;
CREATE POLICY "Service role full access to place images"
  ON storage.objects FOR ALL
  USING (bucket_id = 'place-images')
  WITH CHECK (bucket_id = 'place-images');

-- ---------------------------------------------------------------------------
-- 8. Rich curation details columns
-- ---------------------------------------------------------------------------

ALTER TABLE places
  ADD COLUMN IF NOT EXISTS why_selected text,
  ADD COLUMN IF NOT EXISTS highlights jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS considerations jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS solo_female_reviews text,
  ADD COLUMN IF NOT EXISTS google_maps_url text,
  ADD COLUMN IF NOT EXISTS original_type text,
  ADD COLUMN IF NOT EXISTS price_per_night text,
  ADD COLUMN IF NOT EXISTS sources_checked jsonb DEFAULT '[]';

-- ---------------------------------------------------------------------------
-- 9. Time-based organization columns (Migration 00016)
-- ---------------------------------------------------------------------------

ALTER TABLE places
  ADD COLUMN IF NOT EXISTS best_time_of_day text
    CHECK (best_time_of_day IS NULL OR best_time_of_day IN ('morning', 'afternoon', 'evening', 'any')),
  ADD COLUMN IF NOT EXISTS estimated_duration text,
  ADD COLUMN IF NOT EXISTS booking_info text,
  ADD COLUMN IF NOT EXISTS physical_level text
    CHECK (physical_level IS NULL OR physical_level IN ('easy', 'moderate', 'challenging'));

COMMENT ON COLUMN places.best_time_of_day IS 'Best time of day to visit: morning, afternoon, evening, or any';
COMMENT ON COLUMN places.estimated_duration IS 'Estimated duration (e.g., "2-3 hours", "Full day")';
COMMENT ON COLUMN places.booking_info IS 'How to book (e.g., "Book via GetYourGuide", contact info)';
COMMENT ON COLUMN places.physical_level IS 'Physical difficulty level: easy, moderate, or challenging';

CREATE INDEX IF NOT EXISTS idx_places_best_time ON places(city_id, best_time_of_day)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_places_physical_level ON places(physical_level)
  WHERE is_active = true AND physical_level IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 10. Set default time for accommodations (Migration 00017)
-- ---------------------------------------------------------------------------

UPDATE places
SET best_time_of_day = 'any'
WHERE place_type IN ('hotel', 'hostel', 'homestay')
  AND best_time_of_day IS NULL;

-- =====================================================================
-- DONE! Now you can run the seeding script.
-- =====================================================================
