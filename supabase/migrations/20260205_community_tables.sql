-- ============================================================
-- COMMUNITY FEATURE MIGRATION
-- Place-based Q&A for women solo travelers
-- ============================================================

-- 1. Community Topics (small curated set)
CREATE TABLE community_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);

ALTER TABLE community_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Topics are publicly readable"
  ON community_topics FOR SELECT USING (true);

-- 2. Community Threads (questions / posts)
CREATE TABLE community_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  country_id uuid REFERENCES countries(id),
  city_id uuid REFERENCES cities(id),
  topic_id uuid REFERENCES community_topics(id),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'locked', 'removed')),
  visibility text NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'hidden')),
  pinned boolean NOT NULL DEFAULT false,
  helpful_count int NOT NULL DEFAULT 0,
  reply_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_threads_country_created
  ON community_threads(country_id, created_at DESC);
CREATE INDEX idx_community_threads_city_created
  ON community_threads(city_id, created_at DESC);
CREATE INDEX idx_community_threads_topic
  ON community_threads(topic_id);
CREATE INDEX idx_community_threads_author
  ON community_threads(author_id);

-- Full-text search on title + body
ALTER TABLE community_threads
  ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'B')
  ) STORED;

CREATE INDEX idx_community_threads_search
  ON community_threads USING gin(search_vector);

-- Auto-update updated_at
CREATE TRIGGER community_threads_updated_at
  BEFORE UPDATE ON community_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE community_threads ENABLE ROW LEVEL SECURITY;

-- Readable by all authenticated users (unless removed/hidden)
CREATE POLICY "Threads are readable when active and public"
  ON community_threads FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND status != 'removed'
    AND visibility = 'public'
  );

-- Authors can also see their own hidden threads
CREATE POLICY "Authors can see own threads"
  ON community_threads FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can create threads"
  ON community_threads FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own threads"
  ON community_threads FOR UPDATE
  USING (auth.uid() = author_id);

-- 3. Community Replies
CREATE TABLE community_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES community_threads(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  parent_reply_id uuid REFERENCES community_replies(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'removed')),
  helpful_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_replies_thread
  ON community_replies(thread_id, created_at);
CREATE INDEX idx_community_replies_author
  ON community_replies(author_id);
CREATE INDEX idx_community_replies_parent
  ON community_replies(parent_reply_id);

CREATE TRIGGER community_replies_updated_at
  BEFORE UPDATE ON community_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Replies are readable when active"
  ON community_replies FOR SELECT
  USING (auth.uid() IS NOT NULL AND status = 'active');

CREATE POLICY "Authors can see own replies"
  ON community_replies FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can create replies"
  ON community_replies FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own replies"
  ON community_replies FOR UPDATE
  USING (auth.uid() = author_id);

-- 4. Community Reactions ("Helpful" votes)
CREATE TABLE community_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('thread', 'reply')),
  entity_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, entity_type, entity_id)
);

CREATE INDEX idx_community_reactions_entity
  ON community_reactions(entity_type, entity_id);

ALTER TABLE community_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own reactions"
  ON community_reactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add reactions"
  ON community_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions"
  ON community_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Community Reports (content-level, extends existing user_reports)
CREATE TABLE community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('thread', 'reply')),
  entity_id uuid NOT NULL,
  reason text NOT NULL DEFAULT 'inappropriate',
  details text,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'reviewed', 'actioned')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_reports_entity
  ON community_reports(entity_type, entity_id);

ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own reports"
  ON community_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
  ON community_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- 6. Increment/decrement functions for denormalized counts

-- Increment reply_count on thread when reply is created
CREATE OR REPLACE FUNCTION community_inc_reply_count()
RETURNS trigger AS $$
BEGIN
  UPDATE community_threads
    SET reply_count = reply_count + 1
    WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_community_reply_insert
  AFTER INSERT ON community_replies
  FOR EACH ROW EXECUTE FUNCTION community_inc_reply_count();

-- Decrement reply_count when reply is soft-deleted
CREATE OR REPLACE FUNCTION community_dec_reply_count()
RETURNS trigger AS $$
BEGIN
  IF OLD.status = 'active' AND NEW.status = 'removed' THEN
    UPDATE community_threads
      SET reply_count = GREATEST(reply_count - 1, 0)
      WHERE id = NEW.thread_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_community_reply_soft_delete
  AFTER UPDATE ON community_replies
  FOR EACH ROW EXECUTE FUNCTION community_dec_reply_count();

-- Increment/decrement helpful_count on thread or reply
CREATE OR REPLACE FUNCTION community_inc_helpful()
RETURNS trigger AS $$
BEGIN
  IF NEW.entity_type = 'thread' THEN
    UPDATE community_threads SET helpful_count = helpful_count + 1 WHERE id = NEW.entity_id;
  ELSIF NEW.entity_type = 'reply' THEN
    UPDATE community_replies SET helpful_count = helpful_count + 1 WHERE id = NEW.entity_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_community_reaction_insert
  AFTER INSERT ON community_reactions
  FOR EACH ROW EXECUTE FUNCTION community_inc_helpful();

CREATE OR REPLACE FUNCTION community_dec_helpful()
RETURNS trigger AS $$
BEGIN
  IF OLD.entity_type = 'thread' THEN
    UPDATE community_threads SET helpful_count = GREATEST(helpful_count - 1, 0) WHERE id = OLD.entity_id;
  ELSIF OLD.entity_type = 'reply' THEN
    UPDATE community_replies SET helpful_count = GREATEST(helpful_count - 1, 0) WHERE id = OLD.entity_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_community_reaction_delete
  AFTER DELETE ON community_reactions
  FOR EACH ROW EXECUTE FUNCTION community_dec_helpful();
