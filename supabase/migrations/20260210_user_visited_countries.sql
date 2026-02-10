-- User-managed visited countries (independent of trip data)
CREATE TABLE user_visited_countries (
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  country_id uuid NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, country_id)
);

-- Index for looking up all users who visited a specific country (future matching)
CREATE INDEX idx_uvc_country ON user_visited_countries(country_id);

-- RLS
ALTER TABLE user_visited_countries ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read (for profile viewing + future matching)
CREATE POLICY "Visited countries are publicly readable"
  ON user_visited_countries FOR SELECT
  USING (true);

-- Only the owner can add countries
CREATE POLICY "Users can add own visited countries"
  ON user_visited_countries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only the owner can remove countries
CREATE POLICY "Users can remove own visited countries"
  ON user_visited_countries FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE user_visited_countries IS 'User-managed list of countries they have visited. Supports future matching ("you both traveled to X").';
