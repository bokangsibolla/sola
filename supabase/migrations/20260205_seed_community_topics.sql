-- ============================================================
-- SEED: Community Topics (women-first curated set)
-- ============================================================

INSERT INTO community_topics (label, slug, sort_order) VALUES
  ('Safety & comfort',       'safety-comfort',     1),
  ('Stays',                  'stays',              2),
  ('Getting around',         'getting-around',     3),
  ('Local culture tips',     'local-culture',      4),
  ('Meeting people',         'meeting-people',     5),
  ('Itineraries & things to do', 'itineraries',    6)
ON CONFLICT (slug) DO NOTHING;
