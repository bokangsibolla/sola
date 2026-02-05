-- ============================================================
-- TRIPS REDESIGN MIGRATION
-- Evolves trips from simple records to journey containers
-- ============================================================

-- 1. Add new columns to existing trips table
ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS privacy_level text NOT NULL DEFAULT 'private'
    CHECK (privacy_level IN ('private', 'friends', 'public')),
  ADD COLUMN IF NOT EXISTS matching_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS travel_style_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS flexible_dates boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Make arriving/leaving nullable (support "exploring ideas" mode)
ALTER TABLE trips ALTER COLUMN arriving DROP NOT NULL;
ALTER TABLE trips ALTER COLUMN leaving DROP NOT NULL;

-- Drop the NOT NULL on destination_city_id (support country-only trips)
ALTER TABLE trips ALTER COLUMN destination_city_id DROP NOT NULL;

-- Update status enum to include 'draft'
ALTER TABLE trips DROP CONSTRAINT IF EXISTS trips_status_check;
ALTER TABLE trips ADD CONSTRAINT trips_status_check
  CHECK (status IN ('draft', 'planned', 'active', 'completed'));

-- 2. Trip stops (multi-stop support)
CREATE TABLE IF NOT EXISTS trip_stops (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  stop_order int NOT NULL DEFAULT 0,
  country_iso2 char(2) NOT NULL,
  city_id uuid REFERENCES cities(id),
  city_name text,
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_trip_stops_trip ON trip_stops(trip_id);

-- 3. Trip entries (journal timeline)
CREATE TABLE IF NOT EXISTS trip_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_type text NOT NULL DEFAULT 'note'
    CHECK (entry_type IN ('note', 'arrival', 'departure', 'stay', 'tip', 'comfort_check', 'highlight')),
  title text,
  body text,
  location_name text,
  mood_tag text CHECK (mood_tag IN ('calm', 'happy', 'uneasy', 'unsafe', NULL)),
  visibility text NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'shared', 'public')),
  is_shareable_tip boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_trip_entries_trip ON trip_entries(trip_id);
CREATE INDEX idx_trip_entries_user ON trip_entries(user_id);
CREATE INDEX idx_trip_entries_type ON trip_entries(entry_type);

-- Auto-update updated_at
CREATE TRIGGER trip_entries_updated_at
  BEFORE UPDATE ON trip_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Trip saved items (replaces trip_places with a more flexible model)
CREATE TABLE IF NOT EXISTS trip_saved_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN ('place', 'city', 'country', 'activity')),
  entity_id uuid NOT NULL,
  category text DEFAULT 'general'
    CHECK (category IN ('general', 'accommodation', 'food', 'activity', 'transport', 'other')),
  notes text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_trip_saved_items_trip ON trip_saved_items(trip_id);
CREATE UNIQUE INDEX idx_trip_saved_items_unique ON trip_saved_items(trip_id, entity_type, entity_id);

-- 5. Trip matching preferences
CREATE TABLE IF NOT EXISTS trip_matching_preferences (
  trip_id uuid PRIMARY KEY REFERENCES trips(id) ON DELETE CASCADE,
  style_tags text[] DEFAULT '{}',
  match_radius_km int DEFAULT 50,
  show_profile boolean NOT NULL DEFAULT true,
  show_dates boolean NOT NULL DEFAULT true,
  show_stops boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-update updated_at
CREATE TRIGGER trip_matching_prefs_updated_at
  BEFORE UPDATE ON trip_matching_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Trip stops: owner only
ALTER TABLE trip_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trip stops"
  ON trip_stops FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own trip stops"
  ON trip_stops FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own trip stops"
  ON trip_stops FOR UPDATE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own trip stops"
  ON trip_stops FOR DELETE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

-- Trip entries: owner only (visibility column is for future sharing features)
ALTER TABLE trip_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trip entries"
  ON trip_entries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own trip entries"
  ON trip_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own trip entries"
  ON trip_entries FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own trip entries"
  ON trip_entries FOR DELETE
  USING (user_id = auth.uid());

-- Trip saved items: owner only
ALTER TABLE trip_saved_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trip saved items"
  ON trip_saved_items FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own trip saved items"
  ON trip_saved_items FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own trip saved items"
  ON trip_saved_items FOR UPDATE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own trip saved items"
  ON trip_saved_items FOR DELETE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

-- Trip matching preferences: owner only
ALTER TABLE trip_matching_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matching prefs"
  ON trip_matching_preferences FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can upsert own matching prefs"
  ON trip_matching_preferences FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own matching prefs"
  ON trip_matching_preferences FOR UPDATE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

-- ============================================================
-- MATCHING VIEW
-- ============================================================

CREATE OR REPLACE VIEW trip_overlap_matches AS
SELECT
  t1.id AS my_trip_id,
  t1.user_id AS my_user_id,
  t2.id AS their_trip_id,
  t2.user_id AS their_user_id,
  ts2.city_name AS overlap_city,
  ts2.country_iso2 AS overlap_country,
  GREATEST(ts1.start_date, ts2.start_date) AS overlap_start,
  LEAST(ts1.end_date, ts2.end_date) AS overlap_end,
  t2.travel_style_tags AS their_style_tags
FROM trips t1
JOIN trip_stops ts1 ON ts1.trip_id = t1.id
JOIN trip_stops ts2 ON ts2.country_iso2 = ts1.country_iso2
  AND (ts2.city_id = ts1.city_id OR ts1.city_id IS NULL OR ts2.city_id IS NULL)
  AND ts2.start_date <= ts1.end_date
  AND ts2.end_date >= ts1.start_date
JOIN trips t2 ON t2.id = ts2.trip_id
  AND t2.user_id != t1.user_id
  AND t2.matching_opt_in = true
  AND t2.status IN ('planned', 'active')
WHERE t1.matching_opt_in = true
  AND t1.status IN ('planned', 'active');
