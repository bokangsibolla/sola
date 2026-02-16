-- ============================================================
-- Notification triggers — generate notifications for key events
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. Community reply → notify thread author + parent reply author
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION notify_on_community_reply()
RETURNS trigger AS $$
DECLARE
  v_thread_author_id uuid;
  v_thread_title text;
  v_parent_author_id uuid;
  v_reply_preview text;
BEGIN
  -- Get thread info
  SELECT author_id, title
  INTO v_thread_author_id, v_thread_title
  FROM community_threads
  WHERE id = NEW.thread_id;

  -- Preview: first 80 chars of reply body
  v_reply_preview := LEFT(NEW.body, 80);

  -- Notify thread author (skip self-reply)
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

  -- If nested reply, also notify parent reply author (skip if same as thread author or self)
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

DROP TRIGGER IF EXISTS trg_notify_community_reply ON community_replies;
CREATE TRIGGER trg_notify_community_reply
  AFTER INSERT ON community_replies
  FOR EACH ROW EXECUTE FUNCTION notify_on_community_reply();

-- ──────────────────────────────────────────────────────────────
-- 2. Connection request → notify receiver
-- ──────────────────────────────────────────────────────────────

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

DROP TRIGGER IF EXISTS trg_notify_connection_request ON connection_requests;
CREATE TRIGGER trg_notify_connection_request
  AFTER INSERT ON connection_requests
  FOR EACH ROW EXECUTE FUNCTION notify_on_connection_request();

-- ──────────────────────────────────────────────────────────────
-- 3. Connection accepted → notify original sender
-- ──────────────────────────────────────────────────────────────

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

DROP TRIGGER IF EXISTS trg_notify_connection_accepted ON connection_requests;
CREATE TRIGGER trg_notify_connection_accepted
  AFTER UPDATE ON connection_requests
  FOR EACH ROW EXECUTE FUNCTION notify_on_connection_accepted();

-- ──────────────────────────────────────────────────────────────
-- 4. New message → notify other participants (with deduplication)
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION notify_on_new_message()
RETURNS trigger AS $$
DECLARE
  v_participant uuid;
  v_participant_ids uuid[];
  v_message_preview text;
  v_existing_id uuid;
BEGIN
  -- Get conversation participants
  SELECT participant_ids INTO v_participant_ids
  FROM conversations
  WHERE id = NEW.conversation_id;

  -- Preview: first 80 chars
  v_message_preview := LEFT(NEW.text, 80);

  -- Notify each participant except sender
  FOREACH v_participant IN ARRAY v_participant_ids
  LOOP
    IF v_participant != NEW.sender_id THEN
      -- Deduplication: if unread notification exists for same conversation + actor, update it
      SELECT id INTO v_existing_id
      FROM notifications
      WHERE user_id = v_participant
        AND type = 'new_message'
        AND target_id = NEW.conversation_id
        AND actor_id = NEW.sender_id
        AND is_read = false
      LIMIT 1;

      IF v_existing_id IS NOT NULL THEN
        -- Update existing notification with latest message preview
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

DROP TRIGGER IF EXISTS trg_notify_new_message ON messages;
CREATE TRIGGER trg_notify_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_on_new_message();
