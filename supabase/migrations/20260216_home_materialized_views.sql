-- Home Page — Materialized Views + Travel Updates
-- Created: 2026-02-16

-- ── A) Women planning here — 30-day saved-place count per city ──────────

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_city_planning_count AS
SELECT p.city_id, COUNT(DISTINCT sp.user_id) AS planning_count
FROM saved_places sp
JOIN places p ON p.id = sp.place_id
WHERE sp.created_at > now() - interval '30 days'
  AND p.city_id IS NOT NULL
GROUP BY p.city_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_city_planning_count_city
  ON mv_city_planning_count (city_id);


-- ── B) Community activity per city — 30-day thread + reply count ────────

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_city_community_activity AS
SELECT ct.city_id,
  COUNT(DISTINCT ct.id) + COALESCE(SUM(ct.reply_count), 0) AS activity_count
FROM community_threads ct
WHERE ct.city_id IS NOT NULL
  AND ct.created_at > now() - interval '30 days'
  AND ct.status = 'active'
GROUP BY ct.city_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_city_community_activity_city
  ON mv_city_community_activity (city_id);


-- ── C) Travel updates table ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS travel_updates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL,
  country_id uuid REFERENCES countries(id),
  severity text NOT NULL DEFAULT 'info'
    CHECK (severity IN ('info', 'advisory', 'alert')),
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: authenticated users can read active updates only
ALTER TABLE travel_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read active travel updates"
  ON travel_updates FOR SELECT
  TO authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));


-- ── D) Wrapper RPC functions ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_city_planning_count(p_city_ids uuid[])
RETURNS TABLE (city_id uuid, planning_count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT mv.city_id, mv.planning_count
  FROM mv_city_planning_count mv
  WHERE mv.city_id = ANY(p_city_ids);
$$;

CREATE OR REPLACE FUNCTION get_city_community_activity(p_city_ids uuid[])
RETURNS TABLE (city_id uuid, activity_count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT mv.city_id, mv.activity_count
  FROM mv_city_community_activity mv
  WHERE mv.city_id = ANY(p_city_ids);
$$;
