-- ============================================================
-- TRIP SYSTEM REDESIGN — Phase 1: Foundation Tables
-- Adds: trip_accommodations, trip_transports,
--        trip_notification_settings
-- Alters: trips (is_template), trip_saved_items (source)
-- ============================================================

-- ============================================================
-- 1. trip_accommodations — overnight stays (date-range based)
-- ============================================================

CREATE TABLE IF NOT EXISTS trip_accommodations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  place_id      uuid REFERENCES places(id) ON DELETE SET NULL,
  name          text NOT NULL,
  check_in      date NOT NULL,
  check_out     date NOT NULL,
  address       text,
  location_lat  numeric(10, 7),
  location_lng  numeric(10, 7),
  booking_url   text,
  booking_ref   text,
  cost          numeric(10, 2),
  currency      text DEFAULT 'USD',
  status        text NOT NULL DEFAULT 'planned'
                CHECK (status IN ('planned', 'booked', 'confirmed')),
  notes         text,
  sort_order    int DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trip_accommodations_trip
  ON trip_accommodations(trip_id);

-- Auto-update updated_at
CREATE TRIGGER trip_accommodations_updated_at
  BEFORE UPDATE ON trip_accommodations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE trip_accommodations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trip accommodations"
  ON trip_accommodations FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own trip accommodations"
  ON trip_accommodations FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own trip accommodations"
  ON trip_accommodations FOR UPDATE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own trip accommodations"
  ON trip_accommodations FOR DELETE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));


-- ============================================================
-- 2. trip_transports — inter-city travel between stops
-- ============================================================

CREATE TABLE IF NOT EXISTS trip_transports (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id            uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  from_stop_order    int,
  to_stop_order      int,
  transport_type     text NOT NULL DEFAULT 'other'
                     CHECK (transport_type IN ('flight', 'train', 'bus', 'car', 'ferry', 'other')),
  carrier            text,
  reference          text,
  departure_at       timestamptz,
  arrival_at         timestamptz,
  departure_location text,
  arrival_location   text,
  booking_url        text,
  cost               numeric(10, 2),
  currency           text DEFAULT 'USD',
  notes              text,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trip_transports_trip
  ON trip_transports(trip_id);

-- Auto-update updated_at
CREATE TRIGGER trip_transports_updated_at
  BEFORE UPDATE ON trip_transports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE trip_transports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trip transports"
  ON trip_transports FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own trip transports"
  ON trip_transports FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own trip transports"
  ON trip_transports FOR UPDATE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own trip transports"
  ON trip_transports FOR DELETE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));


-- ============================================================
-- 3. trip_notification_settings — per-trip notification prefs
-- ============================================================

CREATE TABLE IF NOT EXISTS trip_notification_settings (
  trip_id           uuid PRIMARY KEY REFERENCES trips(id) ON DELETE CASCADE,
  morning_summary   boolean DEFAULT false,
  stop_reminders    boolean DEFAULT false,
  evening_journal   boolean DEFAULT false,
  departure_alerts  boolean DEFAULT false,
  reminder_minutes  int DEFAULT 30,
  morning_hour      int DEFAULT 8,
  evening_hour      int DEFAULT 20,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- Auto-update updated_at
CREATE TRIGGER trip_notification_settings_updated_at
  BEFORE UPDATE ON trip_notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE trip_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification settings"
  ON trip_notification_settings FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own notification settings"
  ON trip_notification_settings FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own notification settings"
  ON trip_notification_settings FOR UPDATE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own notification settings"
  ON trip_notification_settings FOR DELETE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));


-- ============================================================
-- 4. ALTER existing tables
-- ============================================================

-- trips: add is_template flag
ALTER TABLE trips ADD COLUMN IF NOT EXISTS
  is_template boolean DEFAULT false;

-- trip_saved_items: add source tracking
ALTER TABLE trip_saved_items ADD COLUMN IF NOT EXISTS
  source text DEFAULT 'manual';

-- Add check constraint for source column (separate statement for IF NOT EXISTS safety)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'trip_saved_items_source_check'
  ) THEN
    ALTER TABLE trip_saved_items
      ADD CONSTRAINT trip_saved_items_source_check
      CHECK (source IN ('manual', 'collection_import', 'suggestion'));
  END IF;
END $$;
