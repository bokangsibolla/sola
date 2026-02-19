-- City page redesign: new structured columns for cities, city_areas, and places
-- Supports Overview | Places | Events 3-tab layout

-- ---------------------------------------------------------------------------
-- cities — new structured content columns
-- ---------------------------------------------------------------------------

ALTER TABLE cities ADD COLUMN IF NOT EXISTS positioning_line    text;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS budget_tier         text CHECK (budget_tier IN ('budget', 'moderate', 'premium'));
ALTER TABLE cities ADD COLUMN IF NOT EXISTS vibe                text;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS walkability         text CHECK (walkability IN ('very_walkable', 'walkable', 'somewhat_walkable', 'car_needed'));
ALTER TABLE cities ADD COLUMN IF NOT EXISTS transit_ease        text CHECK (transit_ease IN ('excellent', 'good', 'limited', 'minimal'));
ALTER TABLE cities ADD COLUMN IF NOT EXISTS women_should_know   jsonb DEFAULT '[]';
ALTER TABLE cities ADD COLUMN IF NOT EXISTS experience_pillars  jsonb DEFAULT '[]';
ALTER TABLE cities ADD COLUMN IF NOT EXISTS how_women_use       jsonb;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS awareness           jsonb;

-- ---------------------------------------------------------------------------
-- city_areas — enrichment columns
-- ---------------------------------------------------------------------------

ALTER TABLE city_areas ADD COLUMN IF NOT EXISTS positioning_line  text;
ALTER TABLE city_areas ADD COLUMN IF NOT EXISTS who_it_suits      text;
ALTER TABLE city_areas ADD COLUMN IF NOT EXISTS hero_image_url    text;

-- ---------------------------------------------------------------------------
-- places — cached image for eliminating N+1 queries
-- ---------------------------------------------------------------------------

ALTER TABLE places ADD COLUMN IF NOT EXISTS image_url_cached text;

-- Composite index for efficient category-based queries on the Places tab
CREATE INDEX IF NOT EXISTS idx_places_city_type
  ON places(city_id, place_type) WHERE is_active = true;
