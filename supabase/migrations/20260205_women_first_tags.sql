-- Add women-first tag categories to existing destination_tags
-- New tag categories: accommodation_type, safety_context, social_comfort, energy_level

-- CITY-LEVEL TAGS

-- Chiang Mai
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('safety_context', 'reliable_transport', 'Reliable transport', 2),
  ('social_comfort', 'strong_women_community', 'Strong women community', 1),
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 2),
  ('energy_level', 'calm', 'Calm', 1),
  ('accommodation_type', 'female_only_stays', 'Female-only stays available', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'chiang-mai'
ON CONFLICT DO NOTHING;

-- Ubud
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('social_comfort', 'strong_women_community', 'Strong women community', 1),
  ('energy_level', 'calm', 'Calm', 1),
  ('accommodation_type', 'female_only_stays', 'Female-only stays available', 1),
  ('accommodation_type', 'women_run', 'Women-run stays', 2)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'ubud'
ON CONFLICT DO NOTHING;

-- Hoi An
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('safety_context', 'reliable_transport', 'Reliable transport', 2),
  ('energy_level', 'calm', 'Calm', 1),
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'hoi-an'
ON CONFLICT DO NOTHING;

-- El Nido
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('social_comfort', 'strong_women_community', 'Strong women community', 1),
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 2),
  ('energy_level', 'social', 'Social', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'el-nido'
ON CONFLICT DO NOTHING;

-- Siargao
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('social_comfort', 'strong_women_community', 'Strong women community', 1),
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 2),
  ('energy_level', 'social', 'Social', 1),
  ('accommodation_type', 'female_only_stays', 'Female-only stays available', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'siargao'
ON CONFLICT DO NOTHING;

-- COUNTRY-LEVEL TAGS

-- Thailand
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'country', id, tag_category, tag_slug, tag_label, tag_order
FROM countries, (VALUES
  ('safety_context', 'reliable_transport', 'Reliable transport', 1),
  ('social_comfort', 'strong_women_community', 'Strong women community', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE countries.slug = 'thailand'
ON CONFLICT DO NOTHING;

-- Indonesia
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'country', id, tag_category, tag_slug, tag_label, tag_order
FROM countries, (VALUES
  ('social_comfort', 'strong_women_community', 'Strong women community', 1),
  ('energy_level', 'mixed', 'Mixed energy', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE countries.slug = 'indonesia'
ON CONFLICT DO NOTHING;

-- Philippines
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'country', id, tag_category, tag_slug, tag_label, tag_order
FROM countries, (VALUES
  ('social_comfort', 'strong_women_community', 'Strong women community', 1),
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 2)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE countries.slug = 'philippines'
ON CONFLICT DO NOTHING;

-- Vietnam
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'country', id, tag_category, tag_slug, tag_label, tag_order
FROM countries, (VALUES
  ('safety_context', 'reliable_transport', 'Reliable transport', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE countries.slug = 'vietnam'
ON CONFLICT DO NOTHING;
