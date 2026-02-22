-- Sola Connect policy: new columns for connection messages, message deletion, post types

-- 1. Optional message on connection requests (max 200 chars enforced client-side)
ALTER TABLE connection_requests ADD COLUMN IF NOT EXISTS message text;

-- 2. Soft-delete for messages (sender can mark own messages as deleted)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;

-- 3. Post type on community threads (question, tip, experience, safety_alert)
ALTER TABLE community_threads ADD COLUMN IF NOT EXISTS post_type text
  CHECK (post_type IS NULL OR post_type IN ('question', 'tip', 'experience', 'safety_alert'));

-- 4. RLS: only sender can soft-delete own messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Senders can soft-delete own messages' AND tablename = 'messages'
  ) THEN
    CREATE POLICY "Senders can soft-delete own messages"
      ON messages FOR UPDATE
      USING (auth.uid() = sender_id)
      WITH CHECK (is_deleted = true);
  END IF;
END
$$;
