-- Homepage section builder + search helper chips
-- Used by the home dashboard to drive section order from the database.

-- ── homepage_sections ──────────────────────────────────────────────────

CREATE TABLE homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text NOT NULL,
  order_index int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  title text,
  subtitle text,
  config jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_homepage_sections_active ON homepage_sections (is_active, order_index);

ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read" ON homepage_sections FOR SELECT USING (true);

-- ── search_chips ───────────────────────────────────────────────────────

CREATE TABLE search_chips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  chip_type text NOT NULL DEFAULT 'tag',
  value text NOT NULL,
  surface text NOT NULL DEFAULT 'home',
  order_index int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_search_chips_surface ON search_chips (surface, is_active, order_index);

ALTER TABLE search_chips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read" ON search_chips FOR SELECT USING (true);

-- ── Seed data ──────────────────────────────────────────────────────────

INSERT INTO homepage_sections (section_type, order_index, title, config) VALUES
  ('search',       10, NULL,                  '{}'),
  ('saved',        20, NULL,                  '{}'),
  ('hero',         30, NULL,                  '{"height": 240}'),
  ('destinations', 40, 'Go Anywhere',         '{"limit": 10}'),
  ('community',    50, 'From the community',  '{"limit": 3}');

INSERT INTO search_chips (label, chip_type, value, surface, order_index) VALUES
  ('First solo trip',   'tag', 'first_solo_trip',  'both', 1),
  ('Low hassle',        'tag', 'low_hassle',       'both', 2),
  ('Beach reset',       'tag', 'beach',            'both', 3),
  ('Big city',          'tag', 'city_culture',     'both', 4),
  ('Budget-friendly',   'tag', 'budget_friendly',  'both', 5),
  ('Nature & outdoors', 'tag', 'nature_outdoors',  'explore', 6);
