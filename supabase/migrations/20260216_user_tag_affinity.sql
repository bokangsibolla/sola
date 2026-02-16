-- Tag affinity scores derived from user behavior
CREATE TABLE user_tag_affinity (
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_id     uuid NOT NULL REFERENCES destination_tags(id) ON DELETE CASCADE,
  score      numeric(6,2) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, tag_id)
);

CREATE INDEX idx_user_tag_affinity_user ON user_tag_affinity(user_id);
CREATE INDEX idx_user_tag_affinity_score ON user_tag_affinity(user_id, score DESC);

ALTER TABLE user_tag_affinity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own affinity"
  ON user_tag_affinity FOR SELECT
  USING (auth.uid() = user_id);

-- Track which events have been processed for affinity scoring
ALTER TABLE user_events ADD COLUMN IF NOT EXISTS processed_for_affinity boolean DEFAULT false;
CREATE INDEX idx_user_events_unprocessed ON user_events(processed_for_affinity) WHERE processed_for_affinity = false;

-- Scoring function: processes unprocessed events and updates affinity scores
CREATE OR REPLACE FUNCTION compute_tag_affinity()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  batch_size int := 1000;
  decay_factor numeric := 0.95;
BEGIN
  -- Step 1: Process unprocessed events and update affinity scores
  WITH event_batch AS (
    SELECT id, user_id, event_type, entity_type, entity_id
    FROM user_events
    WHERE processed_for_affinity = false
    ORDER BY created_at
    LIMIT batch_size
  ),
  event_weights AS (
    SELECT
      eb.id AS event_id,
      eb.user_id,
      dt.id AS tag_id,
      CASE eb.event_type
        WHEN 'viewed_country' THEN 1
        WHEN 'viewed_city' THEN 1
        WHEN 'viewed_place' THEN 2
        WHEN 'saved_place' THEN 5
        WHEN 'opened_collection' THEN 2
        WHEN 'created_trip' THEN 10
        WHEN 'added_place_to_trip' THEN 5
        WHEN 'unsaved_place' THEN -3
        ELSE 0
      END AS weight
    FROM event_batch eb
    JOIN destination_tags dt ON (
      (eb.entity_type = 'country' AND dt.entity_type = 'country' AND dt.entity_id = eb.entity_id)
      OR (eb.entity_type = 'city' AND dt.entity_type = 'city' AND dt.entity_id = eb.entity_id)
      OR (eb.entity_type = 'place' AND dt.entity_type = 'city' AND dt.entity_id = (
        SELECT city_id FROM places WHERE id = eb.entity_id LIMIT 1
      ))
    )
    WHERE eb.event_type IN (
      'viewed_country', 'viewed_city', 'viewed_place',
      'saved_place', 'unsaved_place', 'opened_collection',
      'created_trip', 'added_place_to_trip'
    )
  ),
  aggregated AS (
    SELECT user_id, tag_id, SUM(weight) AS total_weight
    FROM event_weights
    GROUP BY user_id, tag_id
  )
  INSERT INTO user_tag_affinity (user_id, tag_id, score, updated_at)
  SELECT user_id, tag_id, total_weight, now()
  FROM aggregated
  ON CONFLICT (user_id, tag_id)
  DO UPDATE SET
    score = user_tag_affinity.score + EXCLUDED.score,
    updated_at = now();

  -- Step 2: Mark events as processed
  UPDATE user_events
  SET processed_for_affinity = true
  WHERE id IN (
    SELECT id FROM user_events
    WHERE processed_for_affinity = false
    ORDER BY created_at
    LIMIT batch_size
  );

  -- Step 3: Apply daily time decay (only if not already decayed today)
  UPDATE user_tag_affinity
  SET score = score * decay_factor,
      updated_at = now()
  WHERE updated_at < now() - interval '23 hours';

  DELETE FROM user_tag_affinity WHERE score < 0.5;
END;
$$;

-- Personalised city recommendations function
CREATE OR REPLACE FUNCTION get_personalized_cities(p_user_id uuid, p_limit int DEFAULT 10)
RETURNS TABLE (
  city_id uuid,
  city_name text,
  country_name text,
  affinity_score numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT DISTINCT
    c.id AS city_id,
    c.name AS city_name,
    co.name AS country_name,
    MAX(uta.score) AS affinity_score
  FROM cities c
  JOIN countries co ON co.id = c.country_id
  JOIN destination_tags dt ON dt.entity_type = 'city' AND dt.entity_id = c.id
  JOIN user_tag_affinity uta ON uta.tag_id = dt.id AND uta.user_id = p_user_id
  WHERE uta.score > 2
  GROUP BY c.id, c.name, co.name
  ORDER BY affinity_score DESC
  LIMIT p_limit;
$$;
