-- =====================================================================
-- Sola Ops Dashboard — backend tables for analytics, trust & safety,
-- monetization tracking, and admin access.
-- =====================================================================

-- ---------------------------------------------------------------------------
-- 1. Admin Role (extend profiles)
-- ---------------------------------------------------------------------------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- ---------------------------------------------------------------------------
-- 2. User Attribution (UTM tracking, first-touch)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_attribution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  referrer text,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_attribution_user ON user_attribution(user_id);
CREATE INDEX IF NOT EXISTS idx_user_attribution_campaign ON user_attribution(utm_campaign) WHERE utm_campaign IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_attribution_source ON user_attribution(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_attribution_created ON user_attribution(created_at);

ALTER TABLE user_attribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attribution"
  ON user_attribution FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attribution"
  ON user_attribution FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all attribution"
  ON user_attribution FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- ---------------------------------------------------------------------------
-- 3. Affiliate Clicks (server-side outbound click tracking)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  url text NOT NULL,
  partner text NOT NULL DEFAULT 'direct',
  link_type text NOT NULL DEFAULT 'outbound'
    CHECK (link_type IN ('booking', 'maps', 'website', 'outbound')),
  place_id uuid REFERENCES places(id) ON DELETE SET NULL,
  city_id uuid REFERENCES cities(id) ON DELETE SET NULL,
  country_id uuid REFERENCES countries(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_partner ON affiliate_clicks(partner);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_place ON affiliate_clicks(place_id) WHERE place_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created ON affiliate_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_user ON affiliate_clicks(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_link_type ON affiliate_clicks(link_type);

ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can log own clicks"
  ON affiliate_clicks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all clicks"
  ON affiliate_clicks FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- ---------------------------------------------------------------------------
-- 4. Content Reports (community posts, replies — not just users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('community_post', 'community_reply', 'place_review')),
  target_id uuid NOT NULL,
  reason text NOT NULL DEFAULT 'other'
    CHECK (reason IN ('spam', 'harassment', 'misinformation', 'inappropriate', 'safety_concern', 'other')),
  details text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_target ON content_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_created ON content_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_content_reports_reporter ON content_reports(reporter_id);

ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own content reports"
  ON content_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create content reports"
  ON content_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all content reports"
  ON content_reports FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can update content reports"
  ON content_reports FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- ---------------------------------------------------------------------------
-- 5. Extend user_reports for admin moderation
-- ---------------------------------------------------------------------------

-- Add resolution tracking columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reports' AND column_name = 'resolved_by') THEN
    ALTER TABLE user_reports ADD COLUMN resolved_by uuid REFERENCES auth.users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reports' AND column_name = 'resolved_at') THEN
    ALTER TABLE user_reports ADD COLUMN resolved_at timestamptz;
  END IF;
END $$;

-- Admin policies for user_reports (check if they exist first)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_reports' AND policyname = 'Admins can view all user reports') THEN
    CREATE POLICY "Admins can view all user reports"
      ON user_reports FOR SELECT
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_reports' AND policyname = 'Admins can update user reports') THEN
    CREATE POLICY "Admins can update user reports"
      ON user_reports FOR UPDATE
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_created ON user_reports(created_at);

-- ---------------------------------------------------------------------------
-- 6. Admin read policies for existing tables (blocked_users)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blocked_users' AND policyname = 'Admins can view all blocks') THEN
    CREATE POLICY "Admins can view all blocks"
      ON blocked_users FOR SELECT
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
  END IF;
END $$;
