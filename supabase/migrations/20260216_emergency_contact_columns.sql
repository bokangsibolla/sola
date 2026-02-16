-- Add emergency contact fields to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS emergency_contact_name text,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
  ADD COLUMN IF NOT EXISTS emergency_contact_relationship text CHECK (
    emergency_contact_relationship IS NULL OR
    emergency_contact_relationship IN ('parent', 'partner', 'sibling', 'friend')
  );
