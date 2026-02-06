-- 20260206_103_harden_conversations.sql
-- Harden conversation & message RLS policies to enforce blocked-user rules,
-- and add a per-user read-state table for unread counts, mute, and archive.

-- ============================================================
-- 1. Replace conversation SELECT policy to exclude blocked users
-- ============================================================
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

-- ============================================================
-- 2. Prevent creating conversations with blocked users
-- ============================================================
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

-- ============================================================
-- 3. Block enforcement on messages SELECT
-- ============================================================
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

-- ============================================================
-- 4. Prevent sending messages to blocked users
-- ============================================================
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

-- ============================================================
-- 5. Per-user unread tracking table
-- ============================================================
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

CREATE POLICY "Users can view own read state"
  ON conversation_read_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own read state"
  ON conversation_read_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own read state"
  ON conversation_read_state FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_read_state_user
  ON conversation_read_state(user_id);
