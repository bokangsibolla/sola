-- Recommended cities function
-- Blends personal affinity signals with global popularity for the Discover feed.
--
-- Ranking logic:
-- 1. Determine user segment from trip/save/visit counts:
--    - beginner (0 trips, <3 saves, <5 events): 0.1 personal, 0.9 global
--    - intermediate (1-2 trips OR 3-10 saves): 0.5 personal, 0.5 global
--    - experienced (3+ trips OR 10+ saves OR 5+ countries): 0.8 personal, 0.2 global
--
-- 2. Personal score (0-100):
--    - Tag affinity match (max 60): sum of shared tag scores between user and city
--    - Recent country views in 30 days (max 15): viewed the city's country recently
--    - Saves in city (max 15): user has saved places in this city
--
-- 3. Global score (0-100):
--    - 30-day save count from mv_city_planning_count (max 40, normalized)
--    - 30-day community activity from mv_city_community_activity (max 30, normalized)
--    - is_featured flag (+20)
--    - safety_rating >= 'generally_safe' (+10)
--
-- 4. Blended: final = (weight * personal) + ((1 - weight) * global)
--
-- 5. Exclusions: visited countries, max 2 per country, must have hero_image_url

CREATE OR REPLACE FUNCTION get_recommended_cities(
  p_user_id uuid,
  p_limit int DEFAULT 12
)
RETURNS TABLE (
  city_id uuid,
  city_name text,
  city_slug text,
  country_name text,
  country_slug text,
  hero_image_url text,
  solo_level text,
  safety_rating text,
  planning_count bigint,
  final_score numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_trip_count int;
  v_save_count int;
  v_country_count int;
  v_personal_weight numeric;
  v_max_planning bigint;
  v_max_activity bigint;
BEGIN
  -- Determine user segment
  SELECT COUNT(*) INTO v_trip_count FROM trips WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_save_count FROM saved_places WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_country_count FROM user_visited_countries WHERE user_id = p_user_id;

  IF v_trip_count >= 3 OR v_save_count >= 10 OR v_country_count >= 5 THEN
    v_personal_weight := 0.8;  -- experienced
  ELSIF v_trip_count >= 1 OR v_save_count >= 3 THEN
    v_personal_weight := 0.5;  -- intermediate
  ELSE
    v_personal_weight := 0.1;  -- beginner
  END IF;

  -- Get normalization max values for global scores
  SELECT COALESCE(MAX(planning_count), 1) INTO v_max_planning FROM mv_city_planning_count;
  SELECT COALESCE(MAX(activity_count), 1) INTO v_max_activity FROM mv_city_community_activity;

  RETURN QUERY
  WITH personal_scores AS (
    SELECT
      c.id AS cid,
      LEAST(COALESCE(SUM(uta.score), 0), 60) AS tag_score
    FROM cities c
    LEFT JOIN destination_tags dt ON dt.entity_type = 'city' AND dt.entity_id = c.id
    LEFT JOIN user_tag_affinity uta ON uta.tag_id = dt.id AND uta.user_id = p_user_id
    WHERE c.is_active = true AND c.hero_image_url IS NOT NULL
    GROUP BY c.id
  ),
  recent_views AS (
    SELECT DISTINCT c.id AS cid, 15 AS view_boost
    FROM cities c
    JOIN countries co ON co.id = c.country_id
    JOIN user_events ue ON ue.entity_type = 'country'
      AND ue.entity_id = co.id
      AND ue.user_id = p_user_id
      AND ue.event_type = 'viewed_country'
      AND ue.created_at > now() - interval '30 days'
    WHERE c.is_active = true
  ),
  city_saves AS (
    SELECT DISTINCT p.city_id AS cid, 15 AS save_boost
    FROM saved_places sp
    JOIN places p ON p.id = sp.place_id
    WHERE sp.user_id = p_user_id AND p.city_id IS NOT NULL
  ),
  global_scores AS (
    SELECT
      c.id AS cid,
      (COALESCE(mpc.planning_count, 0)::numeric / v_max_planning * 40) AS planning_score,
      (COALESCE(mca.activity_count, 0)::numeric / v_max_activity * 30) AS activity_score,
      CASE WHEN c.is_featured THEN 20 ELSE 0 END AS featured_score,
      CASE WHEN c.safety_rating IN ('very_safe', 'generally_safe') THEN 10 ELSE 0 END AS safety_score,
      mpc.planning_count AS raw_planning
    FROM cities c
    LEFT JOIN mv_city_planning_count mpc ON mpc.city_id = c.id
    LEFT JOIN mv_city_community_activity mca ON mca.city_id = c.id
    WHERE c.is_active = true AND c.hero_image_url IS NOT NULL
  ),
  scored AS (
    SELECT
      c.id,
      c.name,
      c.slug,
      co.name AS co_name,
      co.slug AS co_slug,
      c.hero_image_url,
      c.solo_level,
      c.safety_rating,
      COALESCE(gs.raw_planning, 0) AS raw_planning,
      (COALESCE(ps.tag_score, 0) + COALESCE(rv.view_boost, 0) + COALESCE(cs.save_boost, 0)) AS p_score,
      (gs.planning_score + gs.activity_score + gs.featured_score + gs.safety_score) AS g_score,
      co.id AS country_pk,
      ROW_NUMBER() OVER (PARTITION BY co.id ORDER BY
        (v_personal_weight * (COALESCE(ps.tag_score, 0) + COALESCE(rv.view_boost, 0) + COALESCE(cs.save_boost, 0))
        + (1 - v_personal_weight) * (gs.planning_score + gs.activity_score + gs.featured_score + gs.safety_score))
        DESC
      ) AS country_rank
    FROM cities c
    JOIN countries co ON co.id = c.country_id AND co.is_active = true
    JOIN global_scores gs ON gs.cid = c.id
    LEFT JOIN personal_scores ps ON ps.cid = c.id
    LEFT JOIN recent_views rv ON rv.cid = c.id
    LEFT JOIN city_saves cs ON cs.cid = c.id
    LEFT JOIN user_visited_countries uvc ON uvc.country_id = co.id AND uvc.user_id = p_user_id
    WHERE uvc.country_id IS NULL
      AND c.is_active = true
      AND c.hero_image_url IS NOT NULL
  )
  SELECT
    scored.id,
    scored.name,
    scored.slug,
    scored.co_name,
    scored.co_slug,
    scored.hero_image_url,
    scored.solo_level,
    scored.safety_rating,
    scored.raw_planning,
    (v_personal_weight * scored.p_score + (1 - v_personal_weight) * scored.g_score) AS blended
  FROM scored
  WHERE scored.country_rank <= 2
  ORDER BY blended DESC
  LIMIT p_limit;
END;
$$;
