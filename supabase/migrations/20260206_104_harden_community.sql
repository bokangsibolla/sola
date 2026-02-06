-- ============================================================
-- Harden Community Feeds
--
-- 1. Filter blocked users from thread and reply SELECT policies
--    so users never see content from people they have blocked.
-- 2. Add author_type and is_seed columns to community_threads
--    for distinguishing system-generated seed content.
-- 3. Prevent self-reactions (users voting on their own content).
-- ============================================================

-- ---------- 1. Thread SELECT policy: filter blocked users ----------

DROP POLICY IF EXISTS "Threads are readable when active and public" ON community_threads;
CREATE POLICY "Threads are readable when active and public"
  ON community_threads FOR SELECT
  USING (
    status != 'removed'
    AND visibility = 'public'
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE blocker_id = auth.uid() AND blocked_id = community_threads.author_id
    )
  );

-- Note: "Authors can see own threads" policy stays unchanged.

-- ---------- 2. Reply SELECT policy: filter blocked users ----------

DROP POLICY IF EXISTS "Replies are readable when active" ON community_replies;
CREATE POLICY "Replies are readable when active"
  ON community_replies FOR SELECT
  USING (
    status = 'active'
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE blocker_id = auth.uid() AND blocked_id = community_replies.author_id
    )
  );

-- Note: "Authors can see own replies" policy stays unchanged.

-- ---------- 3. Add author_type and is_seed columns ----------

ALTER TABLE community_threads
  ADD COLUMN IF NOT EXISTS author_type text NOT NULL DEFAULT 'user'
    CHECK (author_type IN ('user', 'system')),
  ADD COLUMN IF NOT EXISTS is_seed boolean NOT NULL DEFAULT false;

-- ---------- 4. Prevent self-reactions (no voting on own content) ----------

DROP POLICY IF EXISTS "Users can add reactions" ON community_reactions;
CREATE POLICY "Users can add reactions"
  ON community_reactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT (
      (entity_type = 'thread' AND entity_id IN (
        SELECT id FROM community_threads WHERE author_id = auth.uid()
      ))
      OR
      (entity_type = 'reply' AND entity_id IN (
        SELECT id FROM community_replies WHERE author_id = auth.uid()
      ))
    )
  );
