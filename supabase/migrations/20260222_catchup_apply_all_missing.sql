-- ============================================================
-- CATCH-UP MIGRATION: Apply all missing migrations to production
-- Created: 2026-02-22
--
-- This script is fully idempotent — safe to run multiple times.
-- It uses IF NOT EXISTS / CREATE OR REPLACE / ON CONFLICT DO NOTHING
-- throughout. Nothing is deleted.
--
-- Sections:
--   1. Extensions
--   2. Profile columns (FIXES LOGIN BUG)
--   3. Missing tables
--   4. Materialized views
--   5. Functions
--   6. Triggers
--   7. RLS policies & security
--   8. Indexes & constraints
--   9. Seed data
-- ============================================================

-- ████████████████████████████████████████████████████████████████
-- SECTION 1: EXTENSIONS
-- ████████████████████████████████████████████████████████████████
-- Source: 20260210_username_infrastructure.sql

CREATE EXTENSION IF NOT EXISTS pg_trgm;


-- ████████████████████████████████████████████████████████████████
-- SECTION 2: PROFILE COLUMNS  *** FIXES LOGIN BUG ***
-- ████████████████████████████████████████████████████████████████
-- Source: 20260206_114, 20260216_add_date_of_birth,
--         20260210_add_currency_preference, 20260210_add_language_preference,
--         20260210_add_explore_onboarding_flags, 20260210_user_verification,
--         20260216_emergency_contact_columns

-- Critical: these two columns are written during onboarding/login
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth date;

-- Preferences
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_currency char(3) DEFAULT 'USD';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language char(2) DEFAULT 'en';

-- Explore onboarding flags
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_seen_explore_modes boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_seen_trip_prompt boolean NOT NULL DEFAULT false;

-- Verification columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unverified';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_selfie_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_submitted_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_reviewed_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_reviewed_by uuid REFERENCES auth.users(id);

-- Add CHECK constraint on verification_status (idempotent via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_verification_status_check' AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_verification_status_check
      CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));
  END IF;
END $$;

-- Emergency contact
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_relationship text;

-- Add CHECK constraint on emergency_contact_relationship
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_emergency_contact_relationship_check' AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_emergency_contact_relationship_check
      CHECK (
        emergency_contact_relationship IS NULL OR
        emergency_contact_relationship IN ('parent', 'partner', 'sibling', 'friend')
      );
  END IF;
END $$;


-- ████████████████████████████████████████████████████████████████
-- SECTION 3: MISSING TABLES
-- ████████████████████████████████████████████████████████████████

-- ── 3a. discovery_lenses ─────────────────────────────────────────
-- Source: 20260205_discovery_lenses_table.sql

CREATE TABLE IF NOT EXISTS discovery_lenses (
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

CREATE INDEX IF NOT EXISTS idx_discovery_lenses_order
  ON discovery_lenses (order_index) WHERE is_active = true;

ALTER TABLE discovery_lenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read discovery lenses" ON discovery_lenses;
CREATE POLICY "Anyone can read discovery lenses"
  ON discovery_lenses FOR SELECT USING (true);

-- ── 3b. user_visited_countries ───────────────────────────────────
-- Source: 20260210_user_visited_countries.sql

CREATE TABLE IF NOT EXISTS user_visited_countries (
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  country_id uuid NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, country_id)
);

CREATE INDEX IF NOT EXISTS idx_uvc_country ON user_visited_countries(country_id);

ALTER TABLE user_visited_countries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Visited countries are publicly readable" ON user_visited_countries;
CREATE POLICY "Visited countries are publicly readable"
  ON user_visited_countries FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can add own visited countries" ON user_visited_countries;
CREATE POLICY "Users can add own visited countries"
  ON user_visited_countries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove own visited countries" ON user_visited_countries;
CREATE POLICY "Users can remove own visited countries"
  ON user_visited_countries FOR DELETE
  USING (auth.uid() = user_id);

-- ── 3c. conversation_read_state ──────────────────────────────────
-- Source: 20260206_103_harden_conversations.sql

CREATE TABLE IF NOT EXISTS conversation_read_state (
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  unread_count int NOT NULL DEFAULT 0,
  is_muted boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE conversation_read_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own read state" ON conversation_read_state;
CREATE POLICY "Users can view own read state"
  ON conversation_read_state FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert own read state" ON conversation_read_state;
CREATE POLICY "Users can upsert own read state"
  ON conversation_read_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own read state" ON conversation_read_state;
CREATE POLICY "Users can update own read state"
  ON conversation_read_state FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_read_state_user
  ON conversation_read_state(user_id);

-- ── 3d. notifications ────────────────────────────────────────────
-- Source: 20260216_notifications_table.sql

CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN (
                'community_reply',
                'connection_request',
                'connection_accepted',
                'new_message',
                'admin_announcement'
              )),
  title       text NOT NULL,
  body        text,
  target_type text CHECK (target_type IN ('thread', 'conversation', 'profile')),
  target_id   uuid,
  actor_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_read     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ── 3e. user_events ──────────────────────────────────────────────
-- Source: 20260216_user_events.sql

CREATE TABLE IF NOT EXISTS user_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type  text NOT NULL,
  entity_type text,
  entity_id   uuid,
  metadata    jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_user_type ON user_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_user_events_created_at ON user_events(created_at);
CREATE INDEX IF NOT EXISTS idx_user_events_entity ON user_events(entity_type, entity_id);

ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert own events" ON user_events;
CREATE POLICY "Users insert own events"
  ON user_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own events" ON user_events;
CREATE POLICY "Users read own events"
  ON user_events FOR SELECT
  USING (auth.uid() = user_id);

-- ── 3f. user_tag_affinity ────────────────────────────────────────
-- Source: 20260216_user_tag_affinity.sql

CREATE TABLE IF NOT EXISTS user_tag_affinity (
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_id     uuid NOT NULL REFERENCES destination_tags(id) ON DELETE CASCADE,
  score      numeric(6,2) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_user_tag_affinity_user ON user_tag_affinity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tag_affinity_score ON user_tag_affinity(user_id, score DESC);

ALTER TABLE user_tag_affinity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own affinity" ON user_tag_affinity;
CREATE POLICY "Users read own affinity"
  ON user_tag_affinity FOR SELECT
  USING (auth.uid() = user_id);

-- Add processed_for_affinity to user_events (needed by compute_tag_affinity)
ALTER TABLE user_events ADD COLUMN IF NOT EXISTS processed_for_affinity boolean DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_user_events_unprocessed
  ON user_events(processed_for_affinity) WHERE processed_for_affinity = false;

-- ── 3g. travel_updates ───────────────────────────────────────────
-- Source: 20260216_home_materialized_views.sql

CREATE TABLE IF NOT EXISTS travel_updates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL,
  country_id uuid REFERENCES countries(id),
  severity text NOT NULL DEFAULT 'info'
    CHECK (severity IN ('info', 'advisory', 'alert')),
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE travel_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read active travel updates" ON travel_updates;
CREATE POLICY "Authenticated users can read active travel updates"
  ON travel_updates FOR SELECT
  TO authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- ── 3h. homepage_sections ────────────────────────────────────────
-- Source: 20260222_homepage_sections_and_search_chips.sql

CREATE TABLE IF NOT EXISTS homepage_sections (
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

CREATE INDEX IF NOT EXISTS idx_homepage_sections_active
  ON homepage_sections (is_active, order_index);

ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read" ON homepage_sections;
CREATE POLICY "Anyone can read" ON homepage_sections FOR SELECT USING (true);

-- ── 3i. search_chips ─────────────────────────────────────────────
-- Source: 20260222_homepage_sections_and_search_chips.sql

CREATE TABLE IF NOT EXISTS search_chips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  chip_type text NOT NULL DEFAULT 'tag',
  value text NOT NULL,
  surface text NOT NULL DEFAULT 'home',
  order_index int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_chips_surface
  ON search_chips (surface, is_active, order_index);

ALTER TABLE search_chips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read" ON search_chips;
CREATE POLICY "Anyone can read" ON search_chips FOR SELECT USING (true);


-- ████████████████████████████████████████████████████████████████
-- SECTION 4: MATERIALIZED VIEWS
-- ████████████████████████████████████████████████████████████████
-- Source: 20260216_home_materialized_views.sql

-- Women planning here — 30-day saved-place count per city
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_city_planning_count AS
SELECT p.city_id, COUNT(DISTINCT sp.user_id) AS planning_count
FROM saved_places sp
JOIN places p ON p.id = sp.place_id
WHERE sp.created_at > now() - interval '30 days'
  AND p.city_id IS NOT NULL
GROUP BY p.city_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_city_planning_count_city
  ON mv_city_planning_count (city_id);

-- Community activity per city — 30-day thread + reply count
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_city_community_activity AS
SELECT ct.city_id,
  COUNT(DISTINCT ct.id) + COALESCE(SUM(ct.reply_count), 0) AS activity_count
FROM community_threads ct
WHERE ct.city_id IS NOT NULL
  AND ct.created_at > now() - interval '30 days'
  AND ct.status = 'active'
GROUP BY ct.city_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_city_community_activity_city
  ON mv_city_community_activity (city_id);


-- ████████████████████████████████████████████████████████████████
-- SECTION 5: FUNCTIONS
-- ████████████████████████████████████████████████████████████████

-- ── 5a. is_blocked helper ────────────────────────────────────────
-- Source: 20260206_110_unified_block_enforcement.sql

CREATE OR REPLACE FUNCTION is_blocked(user_a uuid, user_b uuid)
RETURNS boolean AS $$
BEGIN
  IF auth.uid() NOT IN (user_a, user_b) THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM blocked_users
    WHERE (blocker_id = user_a AND blocked_id = user_b)
       OR (blocker_id = user_b AND blocked_id = user_a)
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ── 5b. delete_user_data (App Store compliance) ──────────────────
-- Source: 20260206_113_delete_user_cascade.sql

CREATE OR REPLACE FUNCTION public.delete_user_data(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM target_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Communication
  DELETE FROM public.messages       WHERE sender_id = target_user_id;
  DELETE FROM public.conversations  WHERE target_user_id = ANY(participant_ids);
  DELETE FROM public.conversation_read_state WHERE user_id = target_user_id;
  DELETE FROM public.push_tokens    WHERE user_id = target_user_id;

  -- Trips
  DELETE FROM public.trip_matching_preferences WHERE trip_id IN (SELECT id FROM public.trips WHERE user_id = target_user_id);
  DELETE FROM public.trip_saved_items WHERE trip_id IN (SELECT id FROM public.trips WHERE user_id = target_user_id);
  DELETE FROM public.trip_entries    WHERE user_id = target_user_id;
  DELETE FROM public.trip_buddies    WHERE user_id = target_user_id;
  DELETE FROM public.trip_stops      WHERE trip_id IN (SELECT id FROM public.trips WHERE user_id = target_user_id);
  DELETE FROM public.trips           WHERE user_id = target_user_id;

  -- Collections & saved places
  DELETE FROM public.saved_places    WHERE user_id = target_user_id;
  DELETE FROM public.collections     WHERE user_id = target_user_id;

  -- Signals
  DELETE FROM public.place_signals   WHERE user_id = target_user_id;

  -- Community
  DELETE FROM public.community_reactions WHERE user_id = target_user_id;
  DELETE FROM public.community_reports   WHERE reporter_id = target_user_id;
  DELETE FROM public.community_replies   WHERE author_id = target_user_id;
  DELETE FROM public.community_threads   WHERE author_id = target_user_id;

  -- Social
  DELETE FROM public.connection_requests WHERE sender_id = target_user_id OR receiver_id = target_user_id;
  DELETE FROM public.blocked_users       WHERE blocker_id = target_user_id OR blocked_id = target_user_id;
  DELETE FROM public.user_reports        WHERE reporter_id = target_user_id;

  -- Onboarding
  DELETE FROM public.onboarding_sessions WHERE user_id = target_user_id;

  -- Anonymize profile (keep row for referential integrity, wipe PII)
  UPDATE public.profiles SET
    first_name       = 'Deleted',
    username         = NULL,
    bio              = NULL,
    avatar_url       = NULL,
    home_country_iso2 = NULL,
    home_country_name = NULL,
    interests        = '{}',
    travel_style     = NULL,
    is_discoverable  = false,
    location_sharing_enabled = false,
    location_lat     = NULL,
    location_lng     = NULL,
    location_city_name    = NULL,
    location_country_name = NULL,
    updated_at       = now()
  WHERE id = target_user_id;

  -- Delete avatar files from storage
  DELETE FROM storage.objects WHERE bucket_id = 'avatars' AND (storage.foldername(name))[1] = target_user_id::text;
END;
$$;

-- ── 5c. MV wrapper functions ─────────────────────────────────────
-- Source: 20260216_home_materialized_views.sql

CREATE OR REPLACE FUNCTION get_city_planning_count(p_city_ids uuid[])
RETURNS TABLE (city_id uuid, planning_count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT mv.city_id, mv.planning_count
  FROM mv_city_planning_count mv
  WHERE mv.city_id = ANY(p_city_ids);
$$;

CREATE OR REPLACE FUNCTION get_city_community_activity(p_city_ids uuid[])
RETURNS TABLE (city_id uuid, activity_count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT mv.city_id, mv.activity_count
  FROM mv_city_community_activity mv
  WHERE mv.city_id = ANY(p_city_ids);
$$;

-- ── 5d. Notification trigger functions ───────────────────────────
-- Source: 20260216_notification_triggers.sql

CREATE OR REPLACE FUNCTION notify_on_community_reply()
RETURNS trigger AS $$
DECLARE
  v_thread_author_id uuid;
  v_thread_title text;
  v_parent_author_id uuid;
  v_reply_preview text;
BEGIN
  SELECT author_id, title
  INTO v_thread_author_id, v_thread_title
  FROM community_threads
  WHERE id = NEW.thread_id;

  v_reply_preview := LEFT(NEW.body, 80);

  IF v_thread_author_id IS NOT NULL AND v_thread_author_id != NEW.author_id THEN
    INSERT INTO notifications (user_id, type, title, body, target_type, target_id, actor_id)
    VALUES (
      v_thread_author_id,
      'community_reply',
      'replied to your thread',
      v_reply_preview,
      'thread',
      NEW.thread_id,
      NEW.author_id
    );
  END IF;

  IF NEW.parent_reply_id IS NOT NULL THEN
    SELECT author_id INTO v_parent_author_id
    FROM community_replies
    WHERE id = NEW.parent_reply_id;

    IF v_parent_author_id IS NOT NULL
       AND v_parent_author_id != NEW.author_id
       AND v_parent_author_id != COALESCE(v_thread_author_id, '00000000-0000-0000-0000-000000000000')
    THEN
      INSERT INTO notifications (user_id, type, title, body, target_type, target_id, actor_id)
      VALUES (
        v_parent_author_id,
        'community_reply',
        'replied to your comment',
        v_reply_preview,
        'thread',
        NEW.thread_id,
        NEW.author_id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_on_connection_request()
RETURNS trigger AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, target_type, target_id, actor_id)
  VALUES (
    NEW.receiver_id,
    'connection_request',
    'wants to connect',
    'profile',
    NEW.sender_id,
    NEW.sender_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_on_connection_accepted()
RETURNS trigger AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    INSERT INTO notifications (user_id, type, title, target_type, target_id, actor_id)
    VALUES (
      NEW.sender_id,
      'connection_accepted',
      'accepted your connection request',
      'profile',
      NEW.receiver_id,
      NEW.receiver_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_on_new_message()
RETURNS trigger AS $$
DECLARE
  v_participant uuid;
  v_participant_ids uuid[];
  v_message_preview text;
  v_existing_id uuid;
BEGIN
  SELECT participant_ids INTO v_participant_ids
  FROM conversations
  WHERE id = NEW.conversation_id;

  v_message_preview := LEFT(NEW.text, 80);

  FOREACH v_participant IN ARRAY v_participant_ids
  LOOP
    IF v_participant != NEW.sender_id THEN
      SELECT id INTO v_existing_id
      FROM notifications
      WHERE user_id = v_participant
        AND type = 'new_message'
        AND target_id = NEW.conversation_id
        AND actor_id = NEW.sender_id
        AND is_read = false
      LIMIT 1;

      IF v_existing_id IS NOT NULL THEN
        UPDATE notifications
        SET body = v_message_preview,
            created_at = now()
        WHERE id = v_existing_id;
      ELSE
        INSERT INTO notifications (user_id, type, title, body, target_type, target_id, actor_id)
        VALUES (
          v_participant,
          'new_message',
          'sent you a message',
          v_message_preview,
          'conversation',
          NEW.conversation_id,
          NEW.sender_id
        );
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 5e. Unread count trigger functions ───────────────────────────
-- Source: 20260207_115_unread_count_triggers.sql

CREATE OR REPLACE FUNCTION create_conversation_read_states()
RETURNS trigger AS $$
BEGIN
  INSERT INTO conversation_read_state (conversation_id, user_id)
  SELECT NEW.id, unnest(NEW.participant_ids)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_unread_on_message()
RETURNS trigger AS $$
BEGIN
  UPDATE conversation_read_state
  SET unread_count = unread_count + 1
  WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 5f. Tag affinity compute ─────────────────────────────────────
-- Source: 20260216_user_tag_affinity.sql

CREATE OR REPLACE FUNCTION compute_tag_affinity()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  batch_size int := 1000;
  decay_factor numeric := 0.95;
BEGIN
  WITH event_batch AS (
    SELECT id, user_id, event_type, entity_type, entity_id
    FROM user_events
    WHERE processed_for_affinity = false
    ORDER BY created_at
    LIMIT batch_size
  ),
  event_weights AS (
    SELECT
      eb.id AS event_id,
      eb.user_id,
      dt.id AS tag_id,
      CASE eb.event_type
        WHEN 'viewed_country' THEN 1
        WHEN 'viewed_city' THEN 1
        WHEN 'viewed_place' THEN 2
        WHEN 'saved_place' THEN 5
        WHEN 'opened_collection' THEN 2
        WHEN 'created_trip' THEN 10
        WHEN 'added_place_to_trip' THEN 5
        WHEN 'unsaved_place' THEN -3
        ELSE 0
      END AS weight
    FROM event_batch eb
    JOIN destination_tags dt ON (
      (eb.entity_type = 'country' AND dt.entity_type = 'country' AND dt.entity_id = eb.entity_id)
      OR (eb.entity_type = 'city' AND dt.entity_type = 'city' AND dt.entity_id = eb.entity_id)
      OR (eb.entity_type = 'place' AND dt.entity_type = 'city' AND dt.entity_id = (
        SELECT city_id FROM places WHERE id = eb.entity_id LIMIT 1
      ))
    )
    WHERE eb.event_type IN (
      'viewed_country', 'viewed_city', 'viewed_place',
      'saved_place', 'unsaved_place', 'opened_collection',
      'created_trip', 'added_place_to_trip'
    )
  ),
  aggregated AS (
    SELECT user_id, tag_id, SUM(weight) AS total_weight
    FROM event_weights
    GROUP BY user_id, tag_id
  )
  INSERT INTO user_tag_affinity (user_id, tag_id, score, updated_at)
  SELECT user_id, tag_id, total_weight, now()
  FROM aggregated
  ON CONFLICT (user_id, tag_id)
  DO UPDATE SET
    score = user_tag_affinity.score + EXCLUDED.score,
    updated_at = now();

  UPDATE user_events
  SET processed_for_affinity = true
  WHERE id IN (
    SELECT id FROM user_events
    WHERE processed_for_affinity = false
    ORDER BY created_at
    LIMIT batch_size
  );

  UPDATE user_tag_affinity
  SET score = score * decay_factor,
      updated_at = now()
  WHERE updated_at < now() - interval '23 hours';

  DELETE FROM user_tag_affinity WHERE score < 0.5;
END;
$$;

-- ── 5g. Personalized cities ──────────────────────────────────────
-- Source: 20260216_user_tag_affinity.sql

CREATE OR REPLACE FUNCTION get_personalized_cities(p_user_id uuid, p_limit int DEFAULT 10)
RETURNS TABLE (
  city_id uuid,
  city_name text,
  country_name text,
  affinity_score numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT DISTINCT
    c.id AS city_id,
    c.name AS city_name,
    co.name AS country_name,
    MAX(uta.score) AS affinity_score
  FROM cities c
  JOIN countries co ON co.id = c.country_id
  JOIN destination_tags dt ON dt.entity_type = 'city' AND dt.entity_id = c.id
  JOIN user_tag_affinity uta ON uta.tag_id = dt.id AND uta.user_id = p_user_id
  WHERE uta.score > 2
  GROUP BY c.id, c.name, co.name
  ORDER BY affinity_score DESC
  LIMIT p_limit;
$$;

-- ── 5h. Recommended cities (blended scoring) ────────────────────
-- Source: 20260216_recommended_cities_function.sql

CREATE OR REPLACE FUNCTION get_recommended_cities(
  p_user_id uuid,
  p_limit int DEFAULT 12
)
RETURNS TABLE (
  city_id uuid,
  city_name text,
  city_slug text,
  country_name text,
  country_slug text,
  hero_image_url text,
  solo_level text,
  safety_rating text,
  planning_count bigint,
  final_score numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_trip_count int;
  v_save_count int;
  v_country_count int;
  v_personal_weight numeric;
  v_max_planning bigint;
  v_max_activity bigint;
BEGIN
  SELECT COUNT(*) INTO v_trip_count FROM trips WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_save_count FROM saved_places WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_country_count FROM user_visited_countries WHERE user_id = p_user_id;

  IF v_trip_count >= 3 OR v_save_count >= 10 OR v_country_count >= 5 THEN
    v_personal_weight := 0.8;
  ELSIF v_trip_count >= 1 OR v_save_count >= 3 THEN
    v_personal_weight := 0.5;
  ELSE
    v_personal_weight := 0.1;
  END IF;

  SELECT COALESCE(MAX(planning_count), 1) INTO v_max_planning FROM mv_city_planning_count;
  SELECT COALESCE(MAX(activity_count), 1) INTO v_max_activity FROM mv_city_community_activity;

  RETURN QUERY
  WITH personal_scores AS (
    SELECT
      c.id AS cid,
      LEAST(COALESCE(SUM(uta.score), 0), 60) AS tag_score
    FROM cities c
    LEFT JOIN destination_tags dt ON dt.entity_type = 'city' AND dt.entity_id = c.id
    LEFT JOIN user_tag_affinity uta ON uta.tag_id = dt.id AND uta.user_id = p_user_id
    WHERE c.is_active = true AND c.hero_image_url IS NOT NULL
    GROUP BY c.id
  ),
  recent_views AS (
    SELECT DISTINCT c.id AS cid, 15 AS view_boost
    FROM cities c
    JOIN countries co ON co.id = c.country_id
    JOIN user_events ue ON ue.entity_type = 'country'
      AND ue.entity_id = co.id
      AND ue.user_id = p_user_id
      AND ue.event_type = 'viewed_country'
      AND ue.created_at > now() - interval '30 days'
    WHERE c.is_active = true
  ),
  city_saves AS (
    SELECT DISTINCT p.city_id AS cid, 15 AS save_boost
    FROM saved_places sp
    JOIN places p ON p.id = sp.place_id
    WHERE sp.user_id = p_user_id AND p.city_id IS NOT NULL
  ),
  global_scores AS (
    SELECT
      c.id AS cid,
      (COALESCE(mpc.planning_count, 0)::numeric / v_max_planning * 40) AS planning_score,
      (COALESCE(mca.activity_count, 0)::numeric / v_max_activity * 30) AS activity_score,
      CASE WHEN c.is_featured THEN 20 ELSE 0 END AS featured_score,
      CASE WHEN c.safety_rating IN ('very_safe', 'generally_safe') THEN 10 ELSE 0 END AS safety_score,
      mpc.planning_count AS raw_planning
    FROM cities c
    LEFT JOIN mv_city_planning_count mpc ON mpc.city_id = c.id
    LEFT JOIN mv_city_community_activity mca ON mca.city_id = c.id
    WHERE c.is_active = true AND c.hero_image_url IS NOT NULL
  ),
  scored AS (
    SELECT
      c.id,
      c.name,
      c.slug,
      co.name AS co_name,
      co.slug AS co_slug,
      c.hero_image_url,
      c.solo_level,
      c.safety_rating,
      COALESCE(gs.raw_planning, 0) AS raw_planning,
      (COALESCE(ps.tag_score, 0) + COALESCE(rv.view_boost, 0) + COALESCE(cs.save_boost, 0)) AS p_score,
      (gs.planning_score + gs.activity_score + gs.featured_score + gs.safety_score) AS g_score,
      co.id AS country_pk,
      ROW_NUMBER() OVER (PARTITION BY co.id ORDER BY
        (v_personal_weight * (COALESCE(ps.tag_score, 0) + COALESCE(rv.view_boost, 0) + COALESCE(cs.save_boost, 0))
        + (1 - v_personal_weight) * (gs.planning_score + gs.activity_score + gs.featured_score + gs.safety_score))
        DESC
      ) AS country_rank
    FROM cities c
    JOIN countries co ON co.id = c.country_id AND co.is_active = true
    JOIN global_scores gs ON gs.cid = c.id
    LEFT JOIN personal_scores ps ON ps.cid = c.id
    LEFT JOIN recent_views rv ON rv.cid = c.id
    LEFT JOIN city_saves cs ON cs.cid = c.id
    LEFT JOIN user_visited_countries uvc ON uvc.country_id = co.id AND uvc.user_id = p_user_id
    WHERE uvc.country_id IS NULL
      AND c.is_active = true
      AND c.hero_image_url IS NOT NULL
  )
  SELECT
    scored.id,
    scored.name,
    scored.slug,
    scored.co_name,
    scored.co_slug,
    scored.hero_image_url,
    scored.solo_level,
    scored.safety_rating,
    scored.raw_planning,
    (v_personal_weight * scored.p_score + (1 - v_personal_weight) * scored.g_score) AS blended
  FROM scored
  WHERE scored.country_rank <= 2
  ORDER BY blended DESC
  LIMIT p_limit;
END;
$$;

-- ── 5i. Username infrastructure ──────────────────────────────────
-- Source: 20260210_username_infrastructure.sql

CREATE OR REPLACE FUNCTION generate_unique_username(base_name text)
RETURNS text AS $$
DECLARE
  slug text;
  candidate text;
  suffix int := 0;
BEGIN
  slug := lower(trim(base_name));
  slug := regexp_replace(slug, '[^a-z0-9]', '_', 'g');
  slug := regexp_replace(slug, '_+', '_', 'g');
  slug := trim(both '_' from slug);

  IF length(slug) < 3 THEN
    slug := 'sola_traveler';
  END IF;

  IF length(slug) > 24 THEN
    slug := left(slug, 24);
  END IF;

  IF slug IN ('admin', 'support', 'sola', 'moderator', 'mod', 'help',
              'official', 'staff', 'system', 'null', 'undefined',
              'deleted', 'anonymous', 'test', 'root', 'superuser') THEN
    slug := slug || '_traveler';
  END IF;

  candidate := slug;
  LOOP
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE username = candidate) THEN
      RETURN candidate;
    END IF;
    suffix := suffix + 1;
    candidate := slug || '_' || suffix::text;
    IF suffix > 1000 THEN
      candidate := slug || '_' || floor(random() * 99999)::int::text;
      RETURN candidate;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update handle_new_user trigger to auto-generate username
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  generated_username text;
  base_name text;
BEGIN
  base_name := coalesce(
    new.raw_user_meta_data->>'first_name',
    split_part(new.email, '@', 1),
    'traveler'
  );

  generated_username := generate_unique_username(base_name);

  INSERT INTO profiles (id, first_name, username)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    generated_username
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ████████████████████████████████████████████████████████████████
-- SECTION 6: TRIGGERS
-- ████████████████████████████████████████████████████████████████

-- ── 6a. Notification triggers ────────────────────────────────────
-- Source: 20260216_notification_triggers.sql

DROP TRIGGER IF EXISTS trg_notify_community_reply ON community_replies;
CREATE TRIGGER trg_notify_community_reply
  AFTER INSERT ON community_replies
  FOR EACH ROW EXECUTE FUNCTION notify_on_community_reply();

DROP TRIGGER IF EXISTS trg_notify_connection_request ON connection_requests;
CREATE TRIGGER trg_notify_connection_request
  AFTER INSERT ON connection_requests
  FOR EACH ROW EXECUTE FUNCTION notify_on_connection_request();

DROP TRIGGER IF EXISTS trg_notify_connection_accepted ON connection_requests;
CREATE TRIGGER trg_notify_connection_accepted
  AFTER UPDATE ON connection_requests
  FOR EACH ROW EXECUTE FUNCTION notify_on_connection_accepted();

DROP TRIGGER IF EXISTS trg_notify_new_message ON messages;
CREATE TRIGGER trg_notify_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_on_new_message();

-- ── 6b. Unread count triggers ────────────────────────────────────
-- Source: 20260207_115_unread_count_triggers.sql

DROP TRIGGER IF EXISTS trg_conversation_create_read_states ON conversations;
CREATE TRIGGER trg_conversation_create_read_states
  AFTER INSERT ON conversations
  FOR EACH ROW EXECUTE FUNCTION create_conversation_read_states();

DROP TRIGGER IF EXISTS trg_message_increment_unread ON messages;
CREATE TRIGGER trg_message_increment_unread
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION increment_unread_on_message();


-- ████████████████████████████████████████████████████████████████
-- SECTION 7: RLS POLICIES & SECURITY
-- ████████████████████████████████████████████████████████████████

-- ── 7a. Harden conversation/message policies (block enforcement) ─
-- Source: 20260206_103_harden_conversations.sql

DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (
    auth.uid() = ANY(participant_ids)
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE (blocker_id = auth.uid() AND blocked_id = ANY(participant_ids))
         OR (blocked_id = auth.uid() AND blocker_id = ANY(participant_ids))
    )
  );

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    auth.uid() = ANY(participant_ids)
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE (blocker_id = auth.uid() AND blocked_id = ANY(participant_ids))
         OR (blocked_id = auth.uid() AND blocker_id = ANY(participant_ids))
    )
  );

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND auth.uid() = ANY(conversations.participant_ids)
    )
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE (blocker_id = auth.uid() AND blocked_id = messages.sender_id)
         OR (blocked_id = auth.uid() AND blocker_id = messages.sender_id)
    )
  );

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND auth.uid() = ANY(conversations.participant_ids)
    )
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users b
      JOIN conversations c ON c.id = messages.conversation_id
      WHERE (b.blocker_id = auth.uid() AND b.blocked_id = ANY(c.participant_ids))
         OR (b.blocked_id = auth.uid() AND b.blocker_id = ANY(c.participant_ids))
    )
  );

-- ── 7b. Trip privacy policies ────────────────────────────────────
-- Source: 20260207_public_trip_access_rls.sql

DROP POLICY IF EXISTS "Public trips visible on profiles" ON trips;
CREATE POLICY "Public trips visible on profiles"
  ON trips FOR SELECT
  USING (
    privacy_level = 'public'
    AND user_id != auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE blocker_id = auth.uid() AND blocked_id = trips.user_id
    )
  );

DROP POLICY IF EXISTS "Friends trips visible to connections" ON trips;
CREATE POLICY "Friends trips visible to connections"
  ON trips FOR SELECT
  USING (
    privacy_level = 'friends'
    AND user_id != auth.uid()
    AND EXISTS (
      SELECT 1 FROM connection_requests
      WHERE status = 'accepted'
        AND (
          (sender_id = auth.uid() AND receiver_id = trips.user_id)
          OR (sender_id = trips.user_id AND receiver_id = auth.uid())
        )
    )
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE blocker_id = auth.uid() AND blocked_id = trips.user_id
    )
  );

DROP POLICY IF EXISTS "Trip stops visible for accessible trips" ON trip_stops;
CREATE POLICY "Trip stops visible for accessible trips"
  ON trip_stops FOR SELECT
  USING (
    trip_id IN (
      SELECT id FROM trips
      WHERE (
        privacy_level = 'public'
        OR (
          privacy_level = 'friends'
          AND EXISTS (
            SELECT 1 FROM connection_requests
            WHERE status = 'accepted'
              AND (
                (sender_id = auth.uid() AND receiver_id = trips.user_id)
                OR (sender_id = trips.user_id AND receiver_id = auth.uid())
              )
          )
        )
      )
      AND NOT EXISTS (
        SELECT 1 FROM blocked_users
        WHERE blocker_id = auth.uid() AND blocked_id = trips.user_id
      )
    )
  );

-- ── 7c. Trip buddies block enforcement ───────────────────────────
-- Source: 20260206_110_unified_block_enforcement.sql

DROP POLICY IF EXISTS "Trip owner can add buddies" ON trip_buddies;
CREATE POLICY "Trip owner can add buddies"
  ON trip_buddies FOR INSERT
  WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
    AND NOT is_blocked(auth.uid(), user_id)
  );

-- ── 7d. Complete RLS coverage ────────────────────────────────────
-- Source: 20260206_111_complete_rls_coverage.sql

ALTER TABLE trip_buddies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trip participants can view buddies" ON trip_buddies;
CREATE POLICY "Trip participants can view buddies"
  ON trip_buddies FOR SELECT
  USING (
    user_id = auth.uid()
    OR trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Trip owner can remove buddies" ON trip_buddies;
CREATE POLICY "Trip owner can remove buddies"
  ON trip_buddies FOR DELETE
  USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = ANY(participant_ids));

DROP POLICY IF EXISTS "Users can update messages in their conversations" ON messages;
CREATE POLICY "Users can update messages in their conversations"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND auth.uid() = ANY(conversations.participant_ids)
    )
  );

-- ── 7e. Verification selfies storage ─────────────────────────────
-- Source: 20260210_user_verification.sql

INSERT INTO storage.buckets (id, name, public)
  VALUES ('verification-selfies', 'verification-selfies', false)
  ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users upload own verification selfie" ON storage.objects;
CREATE POLICY "Users upload own verification selfie"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verification-selfies'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Service role reads verification selfies" ON storage.objects;
CREATE POLICY "Service role reads verification selfies"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-selfies'
    AND auth.role() = 'service_role'
  );

-- ── 7f. Community reactions UPDATE policy ────────────────────────
-- Source: 20260206_community_votes.sql

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'community_reactions' AND policyname = 'Users can update own reactions'
  ) THEN
    CREATE POLICY "Users can update own reactions"
      ON community_reactions
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


-- ████████████████████████████████████████████████████████████████
-- SECTION 8: INDEXES & CONSTRAINTS
-- ████████████████████████████████████████████████████████████████

-- ── 8a. Username trigram index ────────────────────────────────────
-- Source: 20260210_username_infrastructure.sql

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_username_check
  CHECK (username IS NULL OR username ~ '^[a-z0-9_]{3,30}$');

CREATE INDEX IF NOT EXISTS idx_profiles_username_trgm
  ON profiles USING gin (username gin_trgm_ops);

-- ── 8b. Verification pending index ───────────────────────────────
-- Source: 20260210_user_verification.sql

CREATE INDEX IF NOT EXISTS idx_profiles_verification_pending
  ON profiles (verification_submitted_at)
  WHERE verification_status = 'pending';

-- ── 8c. Missing indexes from hardening pass ──────────────────────
-- Source: 20260206_102_add_missing_indexes.sql

-- places
CREATE INDEX IF NOT EXISTS idx_places_city_active
  ON places(city_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_places_city_type_active
  ON places(city_id, place_type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_places_area_active
  ON places(city_area_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_places_city_time_active
  ON places(city_id, best_time_of_day) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_places_city_verified
  ON places(city_id, verification_status) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_places_city_curation
  ON places(city_id, curation_score DESC NULLS LAST) WHERE is_active = true;

-- messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_sent
  ON messages(conversation_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_messages_unread
  ON messages(conversation_id, sender_id) WHERE read_at IS NULL;

-- conversations
CREATE INDEX IF NOT EXISTS idx_conversations_participants
  ON conversations USING gin(participant_ids);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message
  ON conversations(last_message_at DESC);

-- community_threads
CREATE INDEX IF NOT EXISTS idx_community_threads_feed
  ON community_threads(status, visibility, created_at DESC)
  WHERE status = 'active' AND visibility = 'public';
CREATE INDEX IF NOT EXISTS idx_community_threads_top
  ON community_threads(vote_score DESC, created_at DESC)
  WHERE status = 'active' AND visibility = 'public';

-- community_replies
CREATE INDEX IF NOT EXISTS idx_community_replies_thread_sorted
  ON community_replies(thread_id, vote_score DESC, created_at ASC)
  WHERE status = 'active';

-- trips
CREATE INDEX IF NOT EXISTS idx_trips_user_arriving
  ON trips(user_id, arriving ASC NULLS LAST);

-- connection_requests
CREATE INDEX IF NOT EXISTS idx_connection_requests_sender_status
  ON connection_requests(sender_id, status);
CREATE INDEX IF NOT EXISTS idx_connection_requests_receiver_status
  ON connection_requests(receiver_id, status);

-- destination_tags
CREATE INDEX IF NOT EXISTS idx_destination_tags_slug_type
  ON destination_tags(tag_slug, entity_type);

-- saved_places
CREATE INDEX IF NOT EXISTS idx_saved_places_user_collection
  ON saved_places(user_id, collection_id);

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_discoverable_city
  ON profiles(location_city_name)
  WHERE location_sharing_enabled = true AND is_discoverable = true;
CREATE INDEX IF NOT EXISTS idx_profiles_discoverable_country
  ON profiles(location_country_name)
  WHERE location_sharing_enabled = true AND is_discoverable = true;

-- blocked_users
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked
  ON blocked_users(blocked_id);


-- ████████████████████████████████████████████████████████████████
-- SECTION 9: SEED DATA
-- ████████████████████████████████████████████████████████████████

-- ── 9a. Discovery lenses ─────────────────────────────────────────
-- Source: 20260205_seed_discovery_lenses.sql

INSERT INTO discovery_lenses (slug, title, helper_text, icon_name, intro_md, include_tags, exclude_tags, entity_types, order_index)
VALUES
(
  'solo-friendly-first-trip',
  'First solo trip',
  'Places that make your first time easy',
  'sunrise',
  E'Your first solo trip is a big deal — and where you go matters more than you think. These destinations are chosen specifically because they''re easy to navigate alone, have strong communities of solo women travelers, and offer the kind of welcoming infrastructure that lets you focus on the experience rather than the logistics.\n\nEvery city and country here has been vetted for English accessibility, reliable transport, and a proven track record with first-time solo women.',
  '{first_solo_trip,easy_to_navigate,english_widely_spoken}',
  '{}',
  '{country,city}',
  1
),
(
  'female-only-stays',
  'Female-only stays',
  'Dorms and hostels with women-only options',
  'home',
  E'Where you sleep shapes how safe you feel. These destinations have verified female-only accommodation options — from women-only dorm rooms to entire hostels designed for women.\n\nWe check for real female-only policies, not just marketing. Each stay listed here has been confirmed to offer dedicated women-only spaces with proper security measures.',
  '{female_only_stays,women_only_options,women_run}',
  '{}',
  '{city}',
  2
),
(
  'walkable-well-lit',
  'Walkable & well-lit',
  'Neighborhoods safe to explore on foot',
  'sun',
  E'Being able to walk freely — day and night — changes how you experience a place. These neighborhoods and cities are chosen for their well-lit streets, active evening scenes, and the kind of pedestrian infrastructure that means you never feel stuck.\n\nWe look at street lighting, foot traffic patterns, sidewalk quality, and how comfortable solo women report feeling walking after dark.',
  '{walkable_night,walkable_day,well_lit}',
  '{}',
  '{city}',
  3
),
(
  'calm-recharge',
  'Calm places to recharge',
  'Quiet spots when you need a reset',
  'cloud',
  E'Solo travel is exhilarating, but it''s also exhausting. Sometimes you need a place that asks nothing of you — where the pace is gentle, the noise is low, and being alone feels like a luxury, not loneliness.\n\nThese destinations are specifically chosen for their calm energy. Think morning yoga with no schedule, afternoons reading by water, and evenings where silence is the soundtrack.',
  '{quiet,slow_travel,relaxed}',
  '{nightlife_social,lively,fast_paced}',
  '{city}',
  4
),
(
  'easy-transport',
  'Easy to get around',
  'Reliable transport, low friction cities',
  'navigation',
  E'Transportation anxiety is real — especially when you''re alone in a new place. These cities have reliable, safe, and easy-to-use transport systems that work for solo women at any hour.\n\nWe evaluate public transit coverage, ride-sharing availability, walkability, and how easy it is to get from airport to accommodation without stress.',
  '{great_public_transport,reliable_transport,easy_to_navigate}',
  '{}',
  '{city}',
  5
),
(
  'women-traveler-hotspots',
  'Women traveler hotspots',
  'Where solo women already go',
  'users',
  E'There''s something powerful about going where other women have gone before you. These destinations have the strongest concentration of solo women travelers — meaning you''ll find communities, events, and spaces designed with women in mind.\n\nFrom women-run hostels to female-focused group activities, these places make it easy to connect with like-minded travelers.',
  '{strong_solo_community,strong_women_community}',
  '{}',
  '{city,country}',
  6
),
(
  'wellness-retreat',
  'Wellness & retreat',
  'Yoga, spa, meditation destinations',
  'heart',
  E'Solo travel and self-care aren''t separate things — they''re the same thing. These destinations are built around wellness: yoga studios on every corner, meditation retreats that welcome solo women, spa experiences that don''t require a couple''s booking.\n\nEach destination here is vetted for quality wellness offerings, solo-friendly pricing, and the kind of environment where taking care of yourself is the whole point.',
  '{wellness_retreat,spiritual}',
  '{}',
  '{city}',
  7
)
ON CONFLICT (slug) DO NOTHING;

-- ── 9b. Homepage sections ────────────────────────────────────────
-- Source: 20260222_homepage_sections_and_search_chips.sql

INSERT INTO homepage_sections (section_type, order_index, title, config) VALUES
  ('search',       10, NULL,                  '{}'),
  ('saved',        20, NULL,                  '{}'),
  ('hero',         30, NULL,                  '{"height": 240}'),
  ('destinations', 40, 'Go Anywhere',         '{"limit": 10}'),
  ('community',    50, 'From the community',  '{"limit": 3}')
ON CONFLICT DO NOTHING;

-- ── 9c. Search chips ─────────────────────────────────────────────
-- Source: 20260222_homepage_sections_and_search_chips.sql

INSERT INTO search_chips (label, chip_type, value, surface, order_index) VALUES
  ('First solo trip',   'tag', 'first_solo_trip',  'both', 1),
  ('Low hassle',        'tag', 'low_hassle',       'both', 2),
  ('Beach reset',       'tag', 'beach',            'both', 3),
  ('Big city',          'tag', 'city_culture',     'both', 4),
  ('Budget-friendly',   'tag', 'budget_friendly',  'both', 5),
  ('Nature & outdoors', 'tag', 'nature_outdoors',  'explore', 6)
ON CONFLICT DO NOTHING;

-- ── 9d. Backfill conversation read states ────────────────────────
-- Source: 20260207_115_unread_count_triggers.sql

INSERT INTO conversation_read_state (conversation_id, user_id)
SELECT c.id, unnest(c.participant_ids)
FROM conversations c
ON CONFLICT DO NOTHING;


-- ════════════════════════════════════════════════════════════════
-- DONE. Run verification queries:
--
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'profiles' ORDER BY ordinal_position;
--
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public'
-- AND tablename IN ('discovery_lenses', 'notifications', 'user_events',
--   'user_tag_affinity', 'user_visited_countries', 'conversation_read_state',
--   'travel_updates', 'homepage_sections', 'search_chips');
--
-- SELECT routine_name FROM information_schema.routines
-- WHERE routine_schema = 'public'
-- AND routine_name IN ('is_blocked', 'delete_user_data',
--   'notify_on_community_reply', 'get_recommended_cities');
--
-- SELECT matviewname FROM pg_matviews WHERE schemaname = 'public';
-- ════════════════════════════════════════════════════════════════
