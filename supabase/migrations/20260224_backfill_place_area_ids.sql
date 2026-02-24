-- Backfill city_area_id for places that lost it during recovery migration
-- Two-step approach: nearest centroid match, then primary area fallback
-- Safe to re-run (all UPDATEs have WHERE city_area_id IS NULL)

BEGIN;

-- Step 1: Nearest centroid match
-- For each city_area, compute avg lat/lng from already-assigned places.
-- For unassigned places with lat/lng, assign to nearest area centroid.
WITH area_centroids AS (
  SELECT
    p.city_id,
    p.city_area_id,
    AVG(p.lat)  AS avg_lat,
    AVG(p.lng)  AS avg_lng
  FROM places p
  WHERE p.city_area_id IS NOT NULL
    AND p.lat IS NOT NULL
    AND p.lng IS NOT NULL
  GROUP BY p.city_id, p.city_area_id
),
nearest AS (
  SELECT DISTINCT ON (p.id)
    p.id AS place_id,
    ac.city_area_id
  FROM places p
  JOIN area_centroids ac ON ac.city_id = p.city_id
  WHERE p.city_area_id IS NULL
    AND p.lat IS NOT NULL
    AND p.lng IS NOT NULL
  ORDER BY p.id,
    ( (p.lat - ac.avg_lat) * (p.lat - ac.avg_lat)
    + (p.lng - ac.avg_lng) * (p.lng - ac.avg_lng) )
)
UPDATE places
SET city_area_id = nearest.city_area_id
FROM nearest
WHERE places.id = nearest.place_id
  AND places.city_area_id IS NULL;

-- Step 2: Primary area fallback
-- For remaining unassigned places (no lat/lng, or cities with no pre-assigned places),
-- assign to the city's primary area (is_primary = true, fallback to lowest order_index).
WITH primary_areas AS (
  SELECT DISTINCT ON (city_id)
    city_id,
    id AS area_id
  FROM city_areas
  ORDER BY city_id, is_primary DESC NULLS LAST, order_index ASC
)
UPDATE places
SET city_area_id = pa.area_id
FROM primary_areas pa
WHERE places.city_id = pa.city_id
  AND places.city_area_id IS NULL;

COMMIT;
