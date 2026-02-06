-- ============================================================
-- STANDARDIZE DEFAULTS
-- Ensure consistent NOT NULL DEFAULT now() for timestamps
-- and NOT NULL DEFAULT 0 for order_index columns
-- ============================================================

-- Fix timestamp columns that should be NOT NULL
-- Pattern: SET DEFAULT → backfill NULLs → SET NOT NULL
ALTER TABLE trip_stops ALTER COLUMN created_at SET DEFAULT now();
UPDATE trip_stops SET created_at = now() WHERE created_at IS NULL;
ALTER TABLE trip_stops ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE trip_saved_items ALTER COLUMN created_at SET DEFAULT now();
UPDATE trip_saved_items SET created_at = now() WHERE created_at IS NULL;
ALTER TABLE trip_saved_items ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE trip_matching_preferences ALTER COLUMN created_at SET DEFAULT now();
UPDATE trip_matching_preferences SET created_at = now() WHERE created_at IS NULL;
ALTER TABLE trip_matching_preferences ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE trip_matching_preferences ALTER COLUMN updated_at SET DEFAULT now();
UPDATE trip_matching_preferences SET updated_at = now() WHERE updated_at IS NULL;
ALTER TABLE trip_matching_preferences ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE trip_entries ALTER COLUMN created_at SET DEFAULT now();
UPDATE trip_entries SET created_at = now() WHERE created_at IS NULL;
ALTER TABLE trip_entries ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE trip_entries ALTER COLUMN updated_at SET DEFAULT now();
UPDATE trip_entries SET updated_at = now() WHERE updated_at IS NULL;
ALTER TABLE trip_entries ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE collections ALTER COLUMN created_at SET DEFAULT now();
UPDATE collections SET created_at = now() WHERE created_at IS NULL;
ALTER TABLE collections ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE push_tokens ALTER COLUMN created_at SET DEFAULT now();
UPDATE push_tokens SET created_at = now() WHERE created_at IS NULL;
ALTER TABLE push_tokens ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE connection_requests ALTER COLUMN created_at SET DEFAULT now();
UPDATE connection_requests SET created_at = now() WHERE created_at IS NULL;
ALTER TABLE connection_requests ALTER COLUMN created_at SET NOT NULL;

-- Ensure all order_index columns are NOT NULL with default 0
ALTER TABLE countries ALTER COLUMN order_index SET DEFAULT 0;
UPDATE countries SET order_index = 0 WHERE order_index IS NULL;
ALTER TABLE countries ALTER COLUMN order_index SET NOT NULL;

ALTER TABLE cities ALTER COLUMN order_index SET DEFAULT 0;
UPDATE cities SET order_index = 0 WHERE order_index IS NULL;
ALTER TABLE cities ALTER COLUMN order_index SET NOT NULL;

ALTER TABLE city_areas ALTER COLUMN order_index SET DEFAULT 0;
UPDATE city_areas SET order_index = 0 WHERE order_index IS NULL;
ALTER TABLE city_areas ALTER COLUMN order_index SET NOT NULL;

ALTER TABLE place_categories ALTER COLUMN order_index SET DEFAULT 0;
UPDATE place_categories SET order_index = 0 WHERE order_index IS NULL;
ALTER TABLE place_categories ALTER COLUMN order_index SET NOT NULL;

ALTER TABLE place_media ALTER COLUMN order_index SET DEFAULT 0;
UPDATE place_media SET order_index = 0 WHERE order_index IS NULL;
ALTER TABLE place_media ALTER COLUMN order_index SET NOT NULL;

ALTER TABLE tag_groups ALTER COLUMN order_index SET DEFAULT 0;
UPDATE tag_groups SET order_index = 0 WHERE order_index IS NULL;
ALTER TABLE tag_groups ALTER COLUMN order_index SET NOT NULL;

ALTER TABLE tags ALTER COLUMN order_index SET DEFAULT 0;
UPDATE tags SET order_index = 0 WHERE order_index IS NULL;
ALTER TABLE tags ALTER COLUMN order_index SET NOT NULL;
