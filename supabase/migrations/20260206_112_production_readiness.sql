-- ============================================================
-- PRODUCTION READINESS
-- Final hardening pass
-- ============================================================

-- 1. Add updated_at to collections (missing)
ALTER TABLE collections ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
DROP TRIGGER IF EXISTS trg_collections_updated_at ON collections;
CREATE TRIGGER trg_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. Add updated_at to saved_places (missing — useful for sync)
ALTER TABLE saved_places ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 3. Add created_at to blocked_users if missing
ALTER TABLE blocked_users ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- 4. Ensure conversations have created_at
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- 5. Text length limits on user-writable fields
ALTER TABLE community_replies
  DROP CONSTRAINT IF EXISTS community_replies_body_length,
  ADD CONSTRAINT community_replies_body_length
    CHECK (char_length(body) >= 1 AND char_length(body) <= 10000);

ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS messages_text_length,
  ADD CONSTRAINT messages_text_length
    CHECK (char_length(text) >= 1 AND char_length(text) <= 5000);

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_bio_length,
  ADD CONSTRAINT profiles_bio_length
    CHECK (bio IS NULL OR char_length(bio) <= 500);

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_first_name_length,
  ADD CONSTRAINT profiles_first_name_length
    CHECK (char_length(first_name) <= 50);

ALTER TABLE trips
  DROP CONSTRAINT IF EXISTS trips_title_length,
  ADD CONSTRAINT trips_title_length
    CHECK (title IS NULL OR char_length(title) <= 200);

ALTER TABLE trips
  DROP CONSTRAINT IF EXISTS trips_notes_length,
  ADD CONSTRAINT trips_notes_length
    CHECK (notes IS NULL OR char_length(notes) <= 5000);

-- 6. Prevent conversations with fewer than 2 participants
ALTER TABLE conversations
  DROP CONSTRAINT IF EXISTS conversations_min_participants,
  ADD CONSTRAINT conversations_min_participants
    CHECK (array_length(participant_ids, 1) >= 2);

-- 7. Ensure message sent_at defaults and NOT NULL
ALTER TABLE messages ALTER COLUMN sent_at SET DEFAULT now();
ALTER TABLE messages ALTER COLUMN sent_at SET NOT NULL;
