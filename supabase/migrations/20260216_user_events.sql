-- Passive behavioral event tracking
CREATE TABLE user_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type  text NOT NULL,
  entity_type text,
  entity_id   uuid,
  metadata    jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_user_events_user_id ON user_events(user_id);
CREATE INDEX idx_user_events_user_type ON user_events(user_id, event_type);
CREATE INDEX idx_user_events_created_at ON user_events(created_at);
CREATE INDEX idx_user_events_entity ON user_events(entity_type, entity_id);

ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own events"
  ON user_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own events"
  ON user_events FOR SELECT
  USING (auth.uid() = user_id);
