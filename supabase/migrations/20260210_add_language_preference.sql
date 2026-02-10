-- Add language preference to profiles
ALTER TABLE profiles
  ADD COLUMN preferred_language char(2) DEFAULT 'en';

COMMENT ON COLUMN profiles.preferred_language IS 'ISO 639-1 language code (e.g., en, fr, es, de, pt, ja, ko, it)';
