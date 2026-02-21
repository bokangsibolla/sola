-- Add accommodation-specific detail fields to places table
-- These columns support the accommodation detail page for hotels, hostels, and homestays

ALTER TABLE places
  ADD COLUMN IF NOT EXISTS women_only boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS positioning_summary text,
  ADD COLUMN IF NOT EXISTS why_women_choose text,
  ADD COLUMN IF NOT EXISTS check_in_time text,
  ADD COLUMN IF NOT EXISTS check_out_time text,
  ADD COLUMN IF NOT EXISTS payment_types text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS nearest_transport text,
  ADD COLUMN IF NOT EXISTS location_context text;

-- Index for discovery filtering (women-only accommodations)
CREATE INDEX IF NOT EXISTS idx_places_women_only
  ON places (women_only)
  WHERE women_only = true;
