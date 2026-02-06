-- ============================================================
-- DEPRECATION MARKERS
-- Mark legacy tables/columns for future removal.
-- DO NOT DROP anything — just document and add soft-deprecation.
-- ============================================================

-- 1. geo_content: data merged into countries/cities tables
COMMENT ON TABLE geo_content IS 'DEPRECATED: Data merged into countries and cities tables. Remove client queries before dropping.';

-- 2. trip_places: replaced by trip_saved_items
COMMENT ON TABLE trip_places IS 'DEPRECATED: Replaced by trip_saved_items. Remove client queries before dropping.';

-- 3. helpful_count on community_threads and community_replies
COMMENT ON COLUMN community_threads.helpful_count IS 'DEPRECATED: Replaced by vote_score. Frozen at pre-vote value.';
COMMENT ON COLUMN community_replies.helpful_count IS 'DEPRECATED: Replaced by vote_score. Frozen at pre-vote value.';

-- 4. Drop unused helpful trigger functions
DROP FUNCTION IF EXISTS community_inc_helpful() CASCADE;
DROP FUNCTION IF EXISTS community_dec_helpful() CASCADE;

-- 5. profiles.nationality redundant with home_country_iso2 + home_country_name
COMMENT ON COLUMN profiles.nationality IS 'DEPRECATED: Use home_country_iso2 and home_country_name instead.';
