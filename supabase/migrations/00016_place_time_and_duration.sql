-- =====================================================================
-- Migration 00016: Add time-based fields to places
-- Enables time-of-day organization for city pages
-- =====================================================================

-- Add best_time_of_day column for time-based sections
ALTER TABLE places ADD COLUMN IF NOT EXISTS best_time_of_day TEXT
  CHECK (best_time_of_day IS NULL OR best_time_of_day IN ('morning', 'afternoon', 'evening', 'any'));

-- Add estimated_duration for activities and tours
ALTER TABLE places ADD COLUMN IF NOT EXISTS estimated_duration TEXT;

-- Add booking_info for tours and activities
ALTER TABLE places ADD COLUMN IF NOT EXISTS booking_info TEXT;

-- Add physical_level for activities requiring physical effort
ALTER TABLE places ADD COLUMN IF NOT EXISTS physical_level TEXT
  CHECK (physical_level IS NULL OR physical_level IN ('easy', 'moderate', 'challenging'));

-- Add comments
COMMENT ON COLUMN places.best_time_of_day IS 'Best time of day to visit: morning, afternoon, evening, or any';
COMMENT ON COLUMN places.estimated_duration IS 'Estimated duration (e.g., "2-3 hours", "Full day")';
COMMENT ON COLUMN places.booking_info IS 'How to book (e.g., "Book via GetYourGuide", contact info)';
COMMENT ON COLUMN places.physical_level IS 'Physical difficulty level: easy, moderate, or challenging';

-- Create index for time-based queries
CREATE INDEX IF NOT EXISTS idx_places_best_time ON places(city_id, best_time_of_day)
  WHERE is_active = true;

-- Create index for physical level queries
CREATE INDEX IF NOT EXISTS idx_places_physical_level ON places(physical_level)
  WHERE is_active = true AND physical_level IS NOT NULL;
