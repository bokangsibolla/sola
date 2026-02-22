-- 12-month message retention policy
-- Runs weekly (Sunday 3am UTC), deletes conversations with no messages for 12+ months
-- Connections remain intact per policy — only conversations and messages are deleted
-- If two connected users message again after expiry, a new conversation is created

-- First unschedule if exists (idempotent re-run)
SELECT cron.unschedule('cleanup-stale-conversations')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-stale-conversations');

SELECT cron.schedule(
  'cleanup-stale-conversations',
  '0 3 * * 0',
  $$
    -- Delete messages from stale conversations
    DELETE FROM messages
    WHERE conversation_id IN (
      SELECT id FROM conversations
      WHERE last_message_at < now() - interval '12 months'
    );

    -- Delete read state from stale conversations
    DELETE FROM conversation_read_state
    WHERE conversation_id IN (
      SELECT id FROM conversations
      WHERE last_message_at < now() - interval '12 months'
    );

    -- Delete the stale conversations themselves
    DELETE FROM conversations
    WHERE last_message_at < now() - interval '12 months';
  $$
);
