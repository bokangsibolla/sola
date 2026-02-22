-- block_user_full: transactional block + conversation cleanup
-- Per Connect policy: blocking removes connection, deletes conversation + messages immediately
-- No notification to blocked user (RLS prevents them from seeing blocked_users rows)

CREATE OR REPLACE FUNCTION block_user_full(
  p_blocker_id uuid,
  p_blocked_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_convo_id uuid;
BEGIN
  -- 1. Insert block (ignore duplicate)
  INSERT INTO blocked_users (blocker_id, blocked_id)
  VALUES (p_blocker_id, p_blocked_id)
  ON CONFLICT (blocker_id, blocked_id) DO NOTHING;

  -- 2. Delete connection requests in both directions
  DELETE FROM connection_requests
  WHERE (sender_id = p_blocker_id AND receiver_id = p_blocked_id)
     OR (sender_id = p_blocked_id AND receiver_id = p_blocker_id);

  -- 3. Find shared conversation
  SELECT id INTO v_convo_id
  FROM conversations
  WHERE participant_ids @> ARRAY[p_blocker_id]
    AND participant_ids @> ARRAY[p_blocked_id]
  LIMIT 1;

  -- 4. Delete conversation data if exists
  IF v_convo_id IS NOT NULL THEN
    DELETE FROM messages WHERE conversation_id = v_convo_id;
    DELETE FROM conversation_read_state WHERE conversation_id = v_convo_id;
    DELETE FROM conversations WHERE id = v_convo_id;
  END IF;
END;
$$;
