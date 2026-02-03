-- =====================================================================
-- Migration 00012: Sola Verification System
-- Adds verification tracking for places to support the Sola baseline
-- system for solo female travelers.
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
-- 3. Place verification runs (audit trail of AI verification)
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

-- RLS
ALTER TABLE place_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read place_verifications"
  ON place_verifications FOR SELECT USING (true);

-- ---------------------------------------------------------------------------
-- 4. Place signals (extracted verification signals)
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

-- RLS
ALTER TABLE place_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read place_signals"
  ON place_signals FOR SELECT USING (true);

-- Trigger for updated_at
CREATE TRIGGER trg_place_signals_updated_at
  BEFORE UPDATE ON place_signals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------------------------------------------------------------------------
-- 5. Place Sola notes (contextual notes surfaced in UI)
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

-- RLS
ALTER TABLE place_sola_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read place_sola_notes"
  ON place_sola_notes FOR SELECT USING (true);

-- ---------------------------------------------------------------------------
-- 6. Verification criteria (internal baseline - not public)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS verification_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  criteria_key text UNIQUE NOT NULL,
  criteria_label text NOT NULL,
  category text NOT NULL,
  weight numeric(3,2) DEFAULT 1.00,
  applies_to text[] DEFAULT '{}',
  is_required boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS - internal table, no public read
ALTER TABLE verification_criteria ENABLE ROW LEVEL SECURITY;
-- Service role only - no public policy

-- ---------------------------------------------------------------------------
-- 7. Storage bucket for place images
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('place-images', 'place-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to place images
CREATE POLICY "Public read access for place images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'place-images');

-- Allow authenticated users to upload (for seeding/admin)
CREATE POLICY "Authenticated users can upload place images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'place-images' AND auth.role() = 'authenticated');

-- Allow service role full access
CREATE POLICY "Service role full access to place images"
  ON storage.objects FOR ALL
  USING (bucket_id = 'place-images')
  WITH CHECK (bucket_id = 'place-images');
