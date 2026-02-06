-- =============================================================================
-- CHECK Constraints & Safety Guards
-- =============================================================================
-- Purpose: Add database-level CHECK constraints to enforce data integrity
-- rules that should never be violated regardless of application logic.
--
-- Includes:
--   - Self-referencing prevention (connections, blocks, reports)
--   - Date ordering (trips, trip stops)
--   - Numeric range validation (price levels, confidence scores, nights)
--   - Text length validation (community thread titles and bodies)
--   - Username format enforcement
--   - RLS policy to prevent blocked users from sending connection requests
-- =============================================================================

-- 1. Connection requests: prevent self-requests
ALTER TABLE connection_requests
  DROP CONSTRAINT IF EXISTS connection_requests_no_self,
  ADD CONSTRAINT connection_requests_no_self
    CHECK (sender_id != receiver_id);

-- 2. Blocked users: prevent self-blocks
ALTER TABLE blocked_users
  DROP CONSTRAINT IF EXISTS blocked_users_no_self,
  ADD CONSTRAINT blocked_users_no_self
    CHECK (blocker_id != blocked_id);

-- 3. User reports: prevent self-reports
ALTER TABLE user_reports
  DROP CONSTRAINT IF EXISTS user_reports_no_self,
  ADD CONSTRAINT user_reports_no_self
    CHECK (reporter_id != reported_id);

-- 4. Trip dates: leaving must be >= arriving (when both present)
ALTER TABLE trips
  DROP CONSTRAINT IF EXISTS trips_date_order,
  ADD CONSTRAINT trips_date_order
    CHECK (arriving IS NULL OR leaving IS NULL OR leaving >= arriving);

-- 5. Trip stops: end_date >= start_date
ALTER TABLE trip_stops
  DROP CONSTRAINT IF EXISTS trip_stops_date_order,
  ADD CONSTRAINT trip_stops_date_order
    CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date);

-- 6. Places: price_level range 1-4
ALTER TABLE places
  DROP CONSTRAINT IF EXISTS places_price_level_range,
  ADD CONSTRAINT places_price_level_range
    CHECK (price_level IS NULL OR (price_level >= 1 AND price_level <= 4));

-- 7. Place verifications: confidence_score 0-1
ALTER TABLE place_verifications
  DROP CONSTRAINT IF EXISTS place_verifications_confidence_range,
  ADD CONSTRAINT place_verifications_confidence_range
    CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1));

-- 8. Trips: nights non-negative
ALTER TABLE trips
  DROP CONSTRAINT IF EXISTS trips_nights_positive,
  ADD CONSTRAINT trips_nights_positive
    CHECK (nights >= 0);

-- 9. Community threads: title length 3-500
ALTER TABLE community_threads
  DROP CONSTRAINT IF EXISTS community_threads_title_length,
  ADD CONSTRAINT community_threads_title_length
    CHECK (char_length(title) >= 3 AND char_length(title) <= 500);

-- 10. Community threads: body length 10-10000
ALTER TABLE community_threads
  DROP CONSTRAINT IF EXISTS community_threads_body_length,
  ADD CONSTRAINT community_threads_body_length
    CHECK (char_length(body) >= 10 AND char_length(body) <= 10000);

-- 11. Connection requests: prevent blocked users from sending
DROP POLICY IF EXISTS "Users can send connection requests" ON connection_requests;
CREATE POLICY "Users can send connection requests"
  ON connection_requests FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE (blocker_id = sender_id AND blocked_id = receiver_id)
         OR (blocked_id = sender_id AND blocker_id = receiver_id)
    )
  );

-- 12. Profiles: username format
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_username_format,
  ADD CONSTRAINT profiles_username_format
    CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_]{3,30}$');
