-- Update existing accommodations with bestTimeOfDay = 'any'
-- Accommodations are always available throughout the day

UPDATE places
SET best_time_of_day = 'any'
WHERE place_type IN ('hotel', 'hostel', 'homestay')
  AND best_time_of_day IS NULL;

-- Comment for documentation
COMMENT ON COLUMN places.best_time_of_day IS 'When this place is best visited: morning, afternoon, evening, any. Used for time-based city page sections.';
