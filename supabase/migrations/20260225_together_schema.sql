-- Together: activity companion discovery
-- Two tables: together_posts (the activity listing) and together_requests (join requests)

-- ============================================================
-- together_posts
-- ============================================================
CREATE TABLE IF NOT EXISTS together_posts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id       uuid REFERENCES trips(id) ON DELETE SET NULL,
  post_type     text NOT NULL CHECK (post_type IN ('open_plan', 'looking_for')),
  itinerary_block_id uuid REFERENCES itinerary_blocks(id) ON DELETE SET NULL,
  title         text NOT NULL,
  description   text,
  city_id       uuid REFERENCES cities(id),
  country_iso2  text,
  activity_date date,
  start_time    time,
  end_time      time,
  is_flexible   boolean NOT NULL DEFAULT false,
  activity_category text NOT NULL DEFAULT 'other'
    CHECK (activity_category IN ('food','culture','adventure','nightlife','day_trip','wellness','shopping','other')),
  max_companions int NOT NULL DEFAULT 2 CHECK (max_companions BETWEEN 1 AND 5),
  status        text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','cancelled')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE together_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can read open posts"
  ON together_posts FOR SELECT
  USING (status = 'open' OR user_id = auth.uid());

CREATE POLICY "owner can insert posts"
  ON together_posts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "owner can update own posts"
  ON together_posts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "owner can delete own posts"
  ON together_posts FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX idx_together_posts_feed
  ON together_posts (city_id, activity_date, status)
  WHERE status = 'open';

CREATE INDEX idx_together_posts_user
  ON together_posts (user_id, status);

-- ============================================================
-- together_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS together_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       uuid NOT NULL REFERENCES together_posts(id) ON DELETE CASCADE,
  requester_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note          text,
  status        text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','declined','cancelled')),
  responded_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, requester_id)
);

ALTER TABLE together_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read own requests or requests on own posts"
  ON together_requests FOR SELECT
  USING (
    requester_id = auth.uid()
    OR post_id IN (SELECT id FROM together_posts WHERE user_id = auth.uid())
  );

CREATE POLICY "requester can insert"
  ON together_requests FOR INSERT
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "requester or post owner can update"
  ON together_requests FOR UPDATE
  USING (
    requester_id = auth.uid()
    OR post_id IN (SELECT id FROM together_posts WHERE user_id = auth.uid())
  );

CREATE INDEX idx_together_requests_post
  ON together_requests (post_id, status);

CREATE INDEX idx_together_requests_requester
  ON together_requests (requester_id, status);
