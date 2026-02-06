-- ============================================================
-- Migration 115: Per-user unread count triggers + backfill
-- ============================================================
-- The conversation_read_state table already exists (migration 103).
-- This migration adds triggers so the app doesn't need to manually
-- manage read-state rows or unread increments.

-- Trigger A: Auto-create read-state rows when a conversation is created
CREATE OR REPLACE FUNCTION create_conversation_read_states()
RETURNS trigger AS $$
BEGIN
  INSERT INTO conversation_read_state (conversation_id, user_id)
  SELECT NEW.id, unnest(NEW.participant_ids)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_conversation_create_read_states ON conversations;
CREATE TRIGGER trg_conversation_create_read_states
  AFTER INSERT ON conversations
  FOR EACH ROW EXECUTE FUNCTION create_conversation_read_states();

-- Trigger B: Increment unread_count for all participants except the sender
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

DROP TRIGGER IF EXISTS trg_message_increment_unread ON messages;
CREATE TRIGGER trg_message_increment_unread
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION increment_unread_on_message();

-- Backfill: Ensure all existing conversations have read_state rows
INSERT INTO conversation_read_state (conversation_id, user_id)
SELECT c.id, unnest(c.participant_ids)
FROM conversations c
ON CONFLICT DO NOTHING;
