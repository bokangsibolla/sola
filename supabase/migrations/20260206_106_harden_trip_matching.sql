-- ============================================================
-- Migration: Harden trip_overlap_matches view and trip RLS
-- ============================================================
--
-- Security improvements:
--
-- 1. security_invoker = true  — The view now runs queries using the
--    permissions of the calling user (via RLS) rather than the view
--    owner.  This closes a privilege-escalation vector where any
--    authenticated user could read all trips through the old
--    SECURITY DEFINER view.
--
-- 2. privacy_level filtering — The view only surfaces other users'
--    trips that have privacy_level IN ('friends', 'public'), so
--    private trips are never leaked to the matching engine.
--
-- 3. blocked-user exclusion — A NOT EXISTS guard against the
--    blocked_users table ensures that neither direction of a block
--    (blocker → blocked, blocked → blocker) can produce a match.
--
-- 4. auth.uid() scoping — t1.user_id = auth.uid() is enforced
--    directly in the WHERE clause so the view only ever returns
--    matches for the currently authenticated user.
--
-- Additionally, a new RLS SELECT policy on the trips table allows
-- reading other users' public, matchable trips.  This works
-- alongside the existing "Users can view own trips" policy — in
-- PostgreSQL, multiple SELECT policies combine with OR semantics.
-- ============================================================


-- ============================================================
-- 1. Recreate trip_overlap_matches with security_invoker
-- ============================================================

DROP VIEW IF EXISTS trip_overlap_matches;

CREATE VIEW trip_overlap_matches WITH (security_invoker = true) AS
SELECT
  t1.id AS my_trip_id,
  t1.user_id AS my_user_id,
  t2.id AS their_trip_id,
  t2.user_id AS their_user_id,
  ts2.city_name AS overlap_city,
  ts2.country_iso2 AS overlap_country,
  GREATEST(ts1.start_date, ts2.start_date) AS overlap_start,
  LEAST(ts1.end_date, ts2.end_date) AS overlap_end,
  t2.travel_style_tags AS their_style_tags
FROM trips t1
JOIN trip_stops ts1 ON ts1.trip_id = t1.id
JOIN trip_stops ts2 ON ts2.country_iso2 = ts1.country_iso2
  AND (ts2.city_id = ts1.city_id OR ts1.city_id IS NULL OR ts2.city_id IS NULL)
  AND ts2.start_date <= ts1.end_date
  AND ts2.end_date >= ts1.start_date
JOIN trips t2 ON t2.id = ts2.trip_id
  AND t2.user_id != t1.user_id
  AND t2.matching_opt_in = true
  AND t2.status IN ('planned', 'active')
  AND t2.privacy_level IN ('friends', 'public')
WHERE t1.matching_opt_in = true
  AND t1.status IN ('planned', 'active')
  AND t1.user_id = auth.uid()
  AND NOT EXISTS (
    SELECT 1 FROM blocked_users
    WHERE (blocker_id = t1.user_id AND blocked_id = t2.user_id)
       OR (blocked_id = t1.user_id AND blocker_id = t2.user_id)
  );


-- ============================================================
-- 2. Add public trip read policy for matching
-- ============================================================
-- The existing policy "Users can view own trips" covers
-- user_id = auth.uid().  This new policy adds a second SELECT
-- path so the security_invoker view can read other users'
-- public, matchable trips through RLS.
-- ============================================================

CREATE POLICY "Public trips are visible for matching"
  ON trips FOR SELECT
  USING (
    user_id = auth.uid()
    OR (
      matching_opt_in = true
      AND status IN ('planned', 'active')
      AND privacy_level = 'public'
      AND NOT EXISTS (
        SELECT 1 FROM blocked_users
        WHERE (blocker_id = auth.uid() AND blocked_id = trips.user_id)
           OR (blocked_id = auth.uid() AND blocker_id = trips.user_id)
      )
    )
  );
