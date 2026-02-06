-- =====================================================================
-- Fix: Reconcile place_signals dual-schema conflict
-- =====================================================================
--
-- The place_signals table was defined twice in two different migrations
-- with different schemas:
--
--   Migration 00004_missing_rls_policies.sql (line 34):
--     Columns: id, user_id, place_id, signal_type (liked/disliked/visited/rated/hidden),
--              rating, note, created_at
--     Purpose: User-facing signals (likes, ratings, etc.)
--
--   Migration 00012_place_verification.sql (line 62):
--     Columns: id, place_id, signal_key, signal_value, signal_type (boolean/text/category),
--              confidence, source, created_at, updated_at
--     Constraint: UNIQUE(place_id, signal_key)
--     Purpose: Verification signals extracted by AI
--
-- Both migrations use CREATE TABLE IF NOT EXISTS, so whichever ran first
-- "won" and the other migration's columns were silently skipped.
--
-- Client code relies on BOTH schemas:
--   - api.ts:1726-1794 queries with user_id, signal_type, rating, note
--   - api.ts:1813 queries with signal_key
--
-- This migration adds all missing columns from both schemas so that the
-- table supports both use cases regardless of which migration ran first.
-- =====================================================================

-- ---------------------------------------------------------------------------
-- 1. Add columns from migration 00004 if missing
-- ---------------------------------------------------------------------------

ALTER TABLE place_signals
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE place_signals
  ADD COLUMN IF NOT EXISTS rating int;

ALTER TABLE place_signals
  ADD COLUMN IF NOT EXISTS note text;

-- ---------------------------------------------------------------------------
-- 2. Add columns from migration 00012 if missing
-- ---------------------------------------------------------------------------

ALTER TABLE place_signals
  ADD COLUMN IF NOT EXISTS signal_key text;

ALTER TABLE place_signals
  ADD COLUMN IF NOT EXISTS signal_value text;

ALTER TABLE place_signals
  ADD COLUMN IF NOT EXISTS confidence numeric(3,2);

ALTER TABLE place_signals
  ADD COLUMN IF NOT EXISTS source text;

-- ---------------------------------------------------------------------------
-- 3. Ensure updated_at column exists with NOT NULL DEFAULT now()
-- ---------------------------------------------------------------------------

ALTER TABLE place_signals
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- If updated_at was already added but nullable, fix it
-- (safe even if column was just created above with the correct default)
ALTER TABLE place_signals
  ALTER COLUMN updated_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT now();

-- Ensure the updated_at trigger exists
DO $$ BEGIN
  CREATE TRIGGER trg_place_signals_updated_at
    BEFORE UPDATE ON place_signals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 4. Drop the existing signal_type CHECK constraint and replace it
--    The old constraint only allows one set of values depending on which
--    migration ran first. The merged constraint allows both sets.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  constraint_name text;
BEGIN
  -- Find and drop any CHECK constraint on signal_type
  FOR constraint_name IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attnum = ANY(con.conkey)
      AND att.attrelid = con.conrelid
    WHERE con.conrelid = 'place_signals'::regclass
      AND con.contype = 'c'
      AND att.attname = 'signal_type'
  LOOP
    EXECUTE format('ALTER TABLE place_signals DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;

ALTER TABLE place_signals
  ADD CONSTRAINT place_signals_signal_type_check
  CHECK (signal_type IN ('liked', 'disliked', 'visited', 'rated', 'hidden', 'boolean', 'text', 'category'));

-- ---------------------------------------------------------------------------
-- 5. Add unique index on (place_id, signal_key) WHERE signal_key IS NOT NULL
--    This replaces the UNIQUE(place_id, signal_key) from 00012 which may
--    not have been created if 00004 ran first.
-- ---------------------------------------------------------------------------

-- Drop the table-level unique constraint if it exists (from 00012)
DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT con.conname INTO constraint_name
  FROM pg_constraint con
  WHERE con.conrelid = 'place_signals'::regclass
    AND con.contype = 'u';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE place_signals DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

-- Create a partial unique index instead (only where signal_key is set)
CREATE UNIQUE INDEX IF NOT EXISTS idx_place_signals_place_key_unique
  ON place_signals(place_id, signal_key) WHERE signal_key IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 6. Ensure all required indexes exist
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_place_signals_user ON place_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_place_signals_place ON place_signals(place_id);
CREATE INDEX IF NOT EXISTS idx_place_signals_key ON place_signals(signal_key);
