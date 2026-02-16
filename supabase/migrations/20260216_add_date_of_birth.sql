-- Add date_of_birth column for demographics/BI reporting
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth date;
