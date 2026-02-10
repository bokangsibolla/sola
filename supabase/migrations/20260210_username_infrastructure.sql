-- Username infrastructure: lowercase constraint, trigram search, auto-generation
-- ============================================================

-- 1. Update CHECK to enforce lowercase-only usernames
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_username_check
  CHECK (username IS NULL OR username ~ '^[a-z0-9_]{3,30}$');

-- 2. Add trigram extension for fuzzy/prefix search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 3. Add trigram index for fast username search
CREATE INDEX IF NOT EXISTS idx_profiles_username_trgm
  ON profiles USING gin (username gin_trgm_ops);

-- 4. Create username generation function
CREATE OR REPLACE FUNCTION generate_unique_username(base_name text)
RETURNS text AS $$
DECLARE
  slug text;
  candidate text;
  suffix int := 0;
BEGIN
  -- Normalize: lowercase, replace spaces/special chars with underscore, strip non-allowed
  slug := lower(trim(base_name));
  slug := regexp_replace(slug, '[^a-z0-9]', '_', 'g');
  slug := regexp_replace(slug, '_+', '_', 'g');  -- collapse multiple underscores
  slug := trim(both '_' from slug);               -- strip leading/trailing underscores

  -- Ensure minimum length
  IF length(slug) < 3 THEN
    slug := 'sola_traveler';
  END IF;

  -- Truncate to leave room for suffix (max 30 chars)
  IF length(slug) > 24 THEN
    slug := left(slug, 24);
  END IF;

  -- Check reserved words
  IF slug IN ('admin', 'support', 'sola', 'moderator', 'mod', 'help',
              'official', 'staff', 'system', 'null', 'undefined',
              'deleted', 'anonymous', 'test', 'root', 'superuser') THEN
    slug := slug || '_traveler';
  END IF;

  -- Try base slug first
  candidate := slug;
  LOOP
    -- Check if taken
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE username = candidate) THEN
      RETURN candidate;
    END IF;
    -- Append incrementing suffix
    suffix := suffix + 1;
    candidate := slug || '_' || suffix::text;
    -- Safety: give up after 1000 attempts (should never happen)
    IF suffix > 1000 THEN
      candidate := slug || '_' || floor(random() * 99999)::int::text;
      RETURN candidate;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 5. Update handle_new_user trigger to auto-generate username
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  generated_username text;
  base_name text;
BEGIN
  base_name := coalesce(
    new.raw_user_meta_data->>'first_name',
    split_part(new.email, '@', 1),
    'traveler'
  );

  generated_username := generate_unique_username(base_name);

  INSERT INTO profiles (id, first_name, username)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    generated_username
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION generate_unique_username(text) IS 'Generates a unique lowercase username from a display name, appending numeric suffix if needed.';
