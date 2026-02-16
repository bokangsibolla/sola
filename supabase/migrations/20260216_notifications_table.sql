-- ============================================================
-- Notifications table — unified activity feed
-- ============================================================

CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN (
                'community_reply',
                'connection_request',
                'connection_accepted',
                'new_message',
                'admin_announcement'
              )),
  title       text NOT NULL,
  body        text,

  -- Deep-link routing
  target_type text CHECK (target_type IN ('thread', 'conversation', 'profile')),
  target_id   uuid,

  -- Who triggered this notification (null for admin announcements)
  actor_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  is_read     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Primary query: "show me my unread notifications, newest first"
CREATE INDEX idx_notifications_user_unread
  ON notifications(user_id, is_read, created_at DESC);

-- Secondary: quick unread count check
CREATE INDEX idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only read their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Only triggers / service role can insert (no direct client inserts)
-- This is enforced by NOT having an INSERT policy for authenticated users.
-- Trigger functions run as SECURITY DEFINER and bypass RLS.
