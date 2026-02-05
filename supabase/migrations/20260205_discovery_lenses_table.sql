CREATE TABLE discovery_lenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  helper_text text,
  icon_name text NOT NULL DEFAULT 'compass',
  intro_md text,
  include_tags text[] NOT NULL DEFAULT '{}',
  exclude_tags text[] NOT NULL DEFAULT '{}',
  entity_types text[] NOT NULL DEFAULT '{city}',
  sort_by text NOT NULL DEFAULT 'featured_first',
  max_items int NOT NULL DEFAULT 20,
  order_index int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_sponsored boolean NOT NULL DEFAULT false,
  sponsor_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_discovery_lenses_order ON discovery_lenses (order_index) WHERE is_active = true;

ALTER TABLE discovery_lenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read discovery lenses"
  ON discovery_lenses FOR SELECT USING (true);
