-- ============================================================
-- Volunteer Opportunities Schema Extension
-- ============================================================
-- Adds 'volunteer' to place_type enum and volunteer-specific
-- columns to the places table.
-- ============================================================

-- 1. Extend place_type to include 'volunteer'
ALTER TABLE places DROP CONSTRAINT IF EXISTS places_place_type_check;
ALTER TABLE places ADD CONSTRAINT places_place_type_check CHECK (place_type IN (
  'hotel', 'hostel', 'homestay',
  'restaurant', 'cafe', 'bakery', 'bar', 'club', 'rooftop',
  'activity', 'coworking', 'landmark', 'transport', 'shop', 'tour',
  'wellness', 'spa', 'salon', 'gym',
  'laundry', 'pharmacy', 'clinic', 'hospital', 'atm', 'police',
  'volunteer'
));

-- 2. Add volunteer-specific columns
ALTER TABLE places ADD COLUMN IF NOT EXISTS volunteer_type text;
ALTER TABLE places ADD COLUMN IF NOT EXISTS min_commitment text;
ALTER TABLE places ADD COLUMN IF NOT EXISTS volunteer_details jsonb DEFAULT '{}';

-- 3. Constraint: volunteer_type required when place_type is 'volunteer'
ALTER TABLE places ADD CONSTRAINT volunteer_type_required CHECK (
  place_type != 'volunteer' OR volunteer_type IS NOT NULL
);

-- 4. Index for fast volunteer queries by city
CREATE INDEX IF NOT EXISTS idx_places_volunteer_city
  ON places (city_id)
  WHERE place_type = 'volunteer' AND is_active = true;

-- 5. Index for volunteer_type filtering
CREATE INDEX IF NOT EXISTS idx_places_volunteer_type
  ON places (volunteer_type)
  WHERE place_type = 'volunteer' AND is_active = true;

COMMENT ON COLUMN places.volunteer_type IS 'Type of volunteering: animal, teaching, conservation, community, healthcare, construction, farming';
COMMENT ON COLUMN places.min_commitment IS 'Minimum time commitment: Drop-in, 1 week, 2 weeks, 1 month, 3 months, etc.';
COMMENT ON COLUMN places.volunteer_details IS 'JSONB: skills_needed, languages, includes_accommodation, includes_meals, cost_note, how_to_apply, what_volunteers_do, email';
