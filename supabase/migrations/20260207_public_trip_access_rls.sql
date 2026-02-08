-- ============================================================
-- PUBLIC TRIP ACCESS FOR TRAVELER PROFILES
-- Allows authenticated users to view other users' non-private trips
-- for display on traveler profile screens.
--
-- Privacy model:
--   'public'  → visible to all authenticated users
--   'friends' → visible to connected users (accepted connection request)
--   'private' → visible only to trip owner (existing policy)
--
-- These policies combine with existing owner policies via OR semantics.
-- ============================================================

-- Trips: allow reading public trips
DROP POLICY IF EXISTS "Public trips visible on profiles" ON trips;
CREATE POLICY "Public trips visible on profiles"
  ON trips FOR SELECT
  USING (
    privacy_level = 'public'
    AND user_id != auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE blocker_id = auth.uid() AND blocked_id = trips.user_id
    )
  );

-- Trips: allow reading friends-level trips if connected
DROP POLICY IF EXISTS "Friends trips visible to connections" ON trips;
CREATE POLICY "Friends trips visible to connections"
  ON trips FOR SELECT
  USING (
    privacy_level = 'friends'
    AND user_id != auth.uid()
    AND EXISTS (
      SELECT 1 FROM connection_requests
      WHERE status = 'accepted'
        AND (
          (sender_id = auth.uid() AND receiver_id = trips.user_id)
          OR (sender_id = trips.user_id AND receiver_id = auth.uid())
        )
    )
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE blocker_id = auth.uid() AND blocked_id = trips.user_id
    )
  );

-- Trip stops: allow reading stops for visible trips
-- (Relies on the trips policies above — if you can see the trip, you can see its stops)
DROP POLICY IF EXISTS "Trip stops visible for accessible trips" ON trip_stops;
CREATE POLICY "Trip stops visible for accessible trips"
  ON trip_stops FOR SELECT
  USING (
    trip_id IN (
      SELECT id FROM trips
      WHERE (
        privacy_level = 'public'
        OR (
          privacy_level = 'friends'
          AND EXISTS (
            SELECT 1 FROM connection_requests
            WHERE status = 'accepted'
              AND (
                (sender_id = auth.uid() AND receiver_id = trips.user_id)
                OR (sender_id = trips.user_id AND receiver_id = auth.uid())
              )
          )
        )
      )
      AND NOT EXISTS (
        SELECT 1 FROM blocked_users
        WHERE blocker_id = auth.uid() AND blocked_id = trips.user_id
      )
    )
  );
