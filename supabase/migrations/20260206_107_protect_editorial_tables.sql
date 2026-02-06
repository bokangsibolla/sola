-- ============================================================
-- EDITORIAL TABLE WRITE PROTECTION
-- These tables should only be writable via service role (admin/seeding).
-- RLS is enabled but no INSERT/UPDATE/DELETE policies exist,
-- which means client writes already fail. These comments document intent.
-- ============================================================

COMMENT ON TABLE countries IS 'Editorial content. Writes: service role only.';
COMMENT ON TABLE cities IS 'Editorial content. Writes: service role only.';
COMMENT ON TABLE city_areas IS 'Editorial content. Writes: service role only.';
COMMENT ON TABLE place_categories IS 'Editorial content. Writes: service role only.';
COMMENT ON TABLE places IS 'Editorial content. Writes: service role only.';
COMMENT ON TABLE place_media IS 'Editorial content. Writes: service role only.';
COMMENT ON TABLE tag_groups IS 'Editorial content. Writes: service role only.';
COMMENT ON TABLE tags IS 'Editorial content. Writes: service role only.';
COMMENT ON TABLE place_tags IS 'Editorial content. Writes: service role only.';
COMMENT ON TABLE place_verifications IS 'Verification audit trail. Writes: service role only.';
COMMENT ON TABLE place_sola_notes IS 'Editorial notes. Writes: service role only.';
COMMENT ON TABLE explore_collections IS 'Editorial collections. Writes: service role only.';
COMMENT ON TABLE discovery_lenses IS 'Discovery lenses. Writes: service role only.';
COMMENT ON TABLE verification_criteria IS 'Internal criteria. Writes: service role only.';
COMMENT ON TABLE community_topics IS 'Curated topics. Writes: service role only.';
