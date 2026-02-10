-- Backfill usernames for existing users who don't have one
DO $$
DECLARE
  r RECORD;
  new_username text;
BEGIN
  FOR r IN
    SELECT id, first_name
    FROM profiles
    WHERE username IS NULL
  LOOP
    new_username := generate_unique_username(
      CASE WHEN r.first_name IS NOT NULL AND r.first_name != '' THEN r.first_name
      ELSE 'traveler'
      END
    );
    UPDATE profiles SET username = new_username WHERE id = r.id;
  END LOOP;
END $$;

-- After backfill, make username NOT NULL for future inserts
-- (keep nullable for now in case migration is run on prod incrementally)
-- ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;

COMMENT ON COLUMN profiles.username IS 'Unique lowercase username (auto-generated, editable). Format: a-z, 0-9, underscore, 3-30 chars.';
