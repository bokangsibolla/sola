-- =====================================================================
-- QUICK FIX: Add time-based columns to places table
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================================

-- Add time-based columns
ALTER TABLE places
  ADD COLUMN IF NOT EXISTS best_time_of_day text
    CHECK (best_time_of_day IS NULL OR best_time_of_day IN ('morning', 'afternoon', 'evening', 'any')),
  ADD COLUMN IF NOT EXISTS estimated_duration text,
  ADD COLUMN IF NOT EXISTS booking_info text,
  ADD COLUMN IF NOT EXISTS physical_level text
    CHECK (physical_level IS NULL OR physical_level IN ('easy', 'moderate', 'challenging'));

-- Create index for time-based queries
CREATE INDEX IF NOT EXISTS idx_places_best_time ON places(city_id, best_time_of_day)
  WHERE is_active = true;

-- Set default time for accommodations
UPDATE places
SET best_time_of_day = 'any'
WHERE place_type IN ('hotel', 'hostel', 'homestay')
  AND best_time_of_day IS NULL;

-- Done!
SELECT 'Migration complete. Time-based columns added to places table.' as status;
