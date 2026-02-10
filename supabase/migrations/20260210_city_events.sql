-- City Events: time-specific events (festivals, holidays, seasonal, parades, etc.)
-- Editorial content, same write pattern as countries/cities/places.

CREATE TABLE city_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id         UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  event_type      TEXT NOT NULL CHECK (event_type IN (
                    'festival', 'holiday', 'seasonal', 'parade', 'conference', 'sports'
                  )),
  description     TEXT,
  solo_tip        TEXT,
  start_month     INT NOT NULL CHECK (start_month BETWEEN 1 AND 12),
  end_month       INT NOT NULL CHECK (end_month BETWEEN 1 AND 12),
  specific_dates  TEXT,
  recurrence      TEXT NOT NULL DEFAULT 'annual' CHECK (recurrence IN ('annual', 'one_time')),
  year            INT,
  hero_image_url  TEXT,
  website_url     TEXT,
  is_free         BOOLEAN DEFAULT true,
  crowd_level     TEXT CHECK (crowd_level IN ('low', 'moderate', 'high')),
  is_active       BOOLEAN DEFAULT true,
  order_index     INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_city_events_city_id ON city_events(city_id);
CREATE INDEX idx_city_events_months ON city_events(start_month, end_month);

ALTER TABLE city_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "city_events_select" ON city_events
  FOR SELECT USING (is_active = true);

CREATE POLICY "city_events_service_insert" ON city_events
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "city_events_service_update" ON city_events
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "city_events_service_delete" ON city_events
  FOR DELETE USING (auth.role() = 'service_role');

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_city_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_city_events_updated_at
  BEFORE UPDATE ON city_events
  FOR EACH ROW
  EXECUTE FUNCTION update_city_events_updated_at();
