-- Add currency preference to profiles
ALTER TABLE profiles
  ADD COLUMN preferred_currency char(3) DEFAULT 'USD';

COMMENT ON COLUMN profiles.preferred_currency IS 'ISO 4217 currency code (e.g., USD, EUR, ZAR, THB)';
