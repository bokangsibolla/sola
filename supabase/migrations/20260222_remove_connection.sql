-- remove_connection: silent connection removal
-- Deletes the accepted connection_request. Conversation stays but becomes
-- inaccessible (getOrCreateConversationGuarded checks connection status).
-- No notification to other user.

CREATE OR REPLACE FUNCTION remove_connection(
  p_user_id uuid,
  p_other_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM connection_requests
  WHERE status = 'accepted'
    AND (
      (sender_id = p_user_id AND receiver_id = p_other_id)
      OR (sender_id = p_other_id AND receiver_id = p_user_id)
    );
END;
$$;
