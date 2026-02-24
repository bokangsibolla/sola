-- 20260224_verification_notifications.sql
-- Adds notification types for verification outcomes and a trigger to create them.

-- 1. Expand the CHECK constraint on notifications.type
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (
  type IN (
    'community_reply',
    'connection_request',
    'connection_accepted',
    'new_message',
    'admin_announcement',
    'verification_approved',
    'verification_rejected'
  )
);

-- 2. Trigger function: fires when verification_status changes to 'verified' or 'rejected'
CREATE OR REPLACE FUNCTION notify_on_verification_decision()
RETURNS trigger AS $$
BEGIN
  -- Only fire when status actually changed
  IF OLD.verification_status IS NOT DISTINCT FROM NEW.verification_status THEN
    RETURN NEW;
  END IF;

  IF NEW.verification_status = 'verified' THEN
    INSERT INTO notifications (user_id, type, title, body, actor_id)
    VALUES (
      NEW.id,
      'verification_approved',
      'Your identity has been verified',
      'You can now post, connect, and message other travelers.',
      NEW.verification_reviewed_by
    );
  ELSIF NEW.verification_status = 'rejected' THEN
    INSERT INTO notifications (user_id, type, title, body, target_type, target_id, actor_id)
    VALUES (
      NEW.id,
      'verification_rejected',
      'Verification update',
      'Your identity verification wasn''t approved. You can try again with a clearer photo.',
      'profile',
      NEW.id,
      NEW.verification_reviewed_by
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach trigger to profiles table
DROP TRIGGER IF EXISTS trigger_notify_verification_decision ON profiles;
CREATE TRIGGER trigger_notify_verification_decision
  AFTER UPDATE OF verification_status ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_verification_decision();
