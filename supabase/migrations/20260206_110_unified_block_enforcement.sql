-- ============================================================
-- UNIFIED BLOCK ENFORCEMENT
-- Create a helper function so all features can check blocks consistently
-- ============================================================

-- Note: SECURITY DEFINER is needed because RLS on blocked_users only shows
-- the caller's own blocks. This function must check blocks between any two users.
-- The auth.uid() guard prevents probing whether arbitrary users have blocked each other.
CREATE OR REPLACE FUNCTION is_blocked(user_a uuid, user_b uuid)
RETURNS boolean AS $$
BEGIN
  -- Only allow checking blocks involving the current user
  IF auth.uid() NOT IN (user_a, user_b) THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM blocked_users
    WHERE (blocker_id = user_a AND blocked_id = user_b)
       OR (blocker_id = user_b AND blocked_id = user_a)
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- TRIP BUDDIES: enforce blocks when adding a buddy
-- ============================================================

DROP POLICY IF EXISTS "Trip owner can add buddies" ON trip_buddies;
CREATE POLICY "Trip owner can add buddies"
  ON trip_buddies FOR INSERT
  WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
    AND NOT is_blocked(auth.uid(), user_id)
  );
