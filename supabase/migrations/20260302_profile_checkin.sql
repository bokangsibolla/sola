-- Add city check-in columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS checkin_city_id uuid REFERENCES cities(id),
  ADD COLUMN IF NOT EXISTS checked_in_at timestamptz;

-- Index for feed queries: find users checked into a city
CREATE INDEX IF NOT EXISTS idx_profiles_checkin_city
  ON profiles (checkin_city_id)
  WHERE checkin_city_id IS NOT NULL;
