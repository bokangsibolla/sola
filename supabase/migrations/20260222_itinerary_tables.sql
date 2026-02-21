-- ============================================================
-- ITINERARY TABLES MIGRATION
-- Adds trip planning & day-by-day itinerary support
-- Tables: trip_days, itinerary_blocks, itinerary_block_tags,
--         itinerary_suggestions
-- ============================================================

-- ============================================================
-- 1. ALTER trips — add planning columns
-- ============================================================

ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS budget_total numeric,
  ADD COLUMN IF NOT EXISTS pace text CHECK (pace IN ('relaxed', 'balanced', 'packed'));

-- ============================================================
-- 2. trip_days — one row per day of a trip
-- ============================================================

CREATE TABLE trip_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_index integer NOT NULL,
  date date,
  title text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE (trip_id, day_index)
);

CREATE INDEX idx_trip_days_trip ON trip_days(trip_id);

-- Auto-update updated_at
CREATE TRIGGER trip_days_updated_at
  BEFORE UPDATE ON trip_days
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. itinerary_blocks — individual schedule items within a day
-- ============================================================

CREATE TABLE itinerary_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  trip_day_id uuid NOT NULL REFERENCES trip_days(id) ON DELETE CASCADE,
  block_type text NOT NULL DEFAULT 'place'
    CHECK (block_type IN (
      'place', 'accommodation', 'activity', 'transport',
      'meal', 'free_time', 'note', 'safety_check'
    )),
  title_override text,
  start_time time,
  end_time time,
  duration_min integer,
  order_index integer NOT NULL DEFAULT 0,
  place_id uuid REFERENCES places(id) ON DELETE SET NULL,
  location_lat numeric,
  location_lng numeric,
  cost_estimate numeric,
  booking_url text,
  status text NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'booked', 'done', 'skipped')),
  meta jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_itinerary_blocks_day_order ON itinerary_blocks(trip_day_id, order_index);
CREATE INDEX idx_itinerary_blocks_day_time ON itinerary_blocks(trip_day_id, start_time);
CREATE INDEX idx_itinerary_blocks_trip ON itinerary_blocks(trip_id);

-- Auto-update updated_at
CREATE TRIGGER itinerary_blocks_updated_at
  BEFORE UPDATE ON itinerary_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 4. itinerary_block_tags — lightweight labels on blocks
-- ============================================================

CREATE TABLE itinerary_block_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid NOT NULL REFERENCES itinerary_blocks(id) ON DELETE CASCADE,
  tag_type text NOT NULL
    CHECK (tag_type IN ('vibe', 'accessibility', 'women_note', 'logistics')),
  label text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_itinerary_block_tags_block ON itinerary_block_tags(block_id);

-- ============================================================
-- 5. itinerary_suggestions — AI-generated reorder/swap hints
-- ============================================================

CREATE TABLE itinerary_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  trip_day_id uuid REFERENCES trip_days(id) ON DELETE CASCADE,
  block_id uuid REFERENCES itinerary_blocks(id) ON DELETE CASCADE,
  suggestion_type text NOT NULL
    CHECK (suggestion_type IN ('reorder', 'swap', 'insert', 'remove', 'time_shift')),
  reason text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'applied', 'dismissed')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_itinerary_suggestions_trip ON itinerary_suggestions(trip_id);
CREATE INDEX idx_itinerary_suggestions_day ON itinerary_suggestions(trip_day_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- -------------------------------------------------------
-- trip_days: owner access via trips.user_id = auth.uid()
-- -------------------------------------------------------
ALTER TABLE trip_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trip days"
  ON trip_days FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own trip days"
  ON trip_days FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own trip days"
  ON trip_days FOR UPDATE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own trip days"
  ON trip_days FOR DELETE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

-- -------------------------------------------------------
-- itinerary_blocks: owner access via trips.user_id
-- -------------------------------------------------------
ALTER TABLE itinerary_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own itinerary blocks"
  ON itinerary_blocks FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own itinerary blocks"
  ON itinerary_blocks FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own itinerary blocks"
  ON itinerary_blocks FOR UPDATE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own itinerary blocks"
  ON itinerary_blocks FOR DELETE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

-- -------------------------------------------------------
-- itinerary_block_tags: owner access via blocks → trips
-- -------------------------------------------------------
ALTER TABLE itinerary_block_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own block tags"
  ON itinerary_block_tags FOR SELECT
  USING (block_id IN (
    SELECT ib.id FROM itinerary_blocks ib
    JOIN trips t ON t.id = ib.trip_id
    WHERE t.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own block tags"
  ON itinerary_block_tags FOR INSERT
  WITH CHECK (block_id IN (
    SELECT ib.id FROM itinerary_blocks ib
    JOIN trips t ON t.id = ib.trip_id
    WHERE t.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own block tags"
  ON itinerary_block_tags FOR UPDATE
  USING (block_id IN (
    SELECT ib.id FROM itinerary_blocks ib
    JOIN trips t ON t.id = ib.trip_id
    WHERE t.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own block tags"
  ON itinerary_block_tags FOR DELETE
  USING (block_id IN (
    SELECT ib.id FROM itinerary_blocks ib
    JOIN trips t ON t.id = ib.trip_id
    WHERE t.user_id = auth.uid()
  ));

-- -------------------------------------------------------
-- itinerary_suggestions: owner access via trips.user_id
-- -------------------------------------------------------
ALTER TABLE itinerary_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own suggestions"
  ON itinerary_suggestions FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own suggestions"
  ON itinerary_suggestions FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own suggestions"
  ON itinerary_suggestions FOR UPDATE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own suggestions"
  ON itinerary_suggestions FOR DELETE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));
