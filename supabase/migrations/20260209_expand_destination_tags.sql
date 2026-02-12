-- Migration: Expand destination tags to all cities and countries
-- Date: 2026-02-09
-- Purpose: Add comprehensive destination_tags to all 50 cities and 12 countries
--          based on editorial content, safety info, and user personas.
--          Also adds missing tag categories to previously tagged entities.
--
-- IMPORTANT: Uses ON CONFLICT DO NOTHING to avoid duplicating tags from
--            migrations 00010, 00023, and 20260205.

-- ============================================================================
-- COUNTRIES - New tags for untagged countries
-- ============================================================================

-- Malaysia
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'country', id, tag_category, tag_slug, tag_label, tag_order
FROM countries, (VALUES
  ('travel_style', 'foodie', 'Food lover', 1),
  ('travel_style', 'city_culture', 'City & culture', 2),
  ('travel_style', 'beach_islands', 'Beach & islands', 3),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 2),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 3),
  ('solo_context', 'great_public_transport', 'Great public transport', 4),
  ('vibe', 'relaxed', 'Relaxed', 1),
  ('budget', 'mid_range', 'Mid-range', 1),
  ('pace', 'mix_of_both', 'Mix of both', 1),
  ('environment', 'city', 'City', 1),
  ('environment', 'beach', 'Beach', 2),
  ('environment', 'jungle', 'Jungle', 3),
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('safety_context', 'reliable_transport', 'Reliable transport', 2),
  ('social_comfort', 'strong_women_community', 'Strong women community', 1),
  ('energy_level', 'mixed', 'Mixed energy', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE countries.slug = 'malaysia'
ON CONFLICT DO NOTHING;

-- Singapore
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'country', id, tag_category, tag_slug, tag_label, tag_order
FROM countries, (VALUES
  ('travel_style', 'foodie', 'Food lover', 1),
  ('travel_style', 'city_culture', 'City & culture', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 2),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 3),
  ('solo_context', 'great_public_transport', 'Great public transport', 4),
  ('vibe', 'lively', 'Lively', 1),
  ('pace', 'fast_paced', 'Fast-paced', 1),
  ('environment', 'city', 'City', 1),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('safety', 'walkable_night', 'Walkable at night', 2),
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('safety_context', 'reliable_transport', 'Reliable transport', 2),
  ('energy_level', 'social', 'Social', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE countries.slug = 'singapore'
ON CONFLICT DO NOTHING;

-- Cambodia
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'country', id, tag_category, tag_slug, tag_label, tag_order
FROM countries, (VALUES
  ('travel_style', 'city_culture', 'City & culture', 1),
  ('travel_style', 'adventure', 'Adventure', 2),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 1),
  ('vibe', 'adventurous', 'Adventurous', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'city', 'City', 1),
  ('environment', 'beach', 'Beach', 2),
  ('safety_context', 'reliable_transport', 'Reliable transport', 1),
  ('energy_level', 'mixed', 'Mixed energy', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE countries.slug = 'cambodia'
ON CONFLICT DO NOTHING;

-- Laos
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'country', id, tag_category, tag_slug, tag_label, tag_order
FROM countries, (VALUES
  ('travel_style', 'nature_outdoors', 'Nature & outdoors', 1),
  ('travel_style', 'adventure', 'Adventure', 2),
  ('vibe', 'relaxed', 'Relaxed', 1),
  ('vibe', 'spiritual', 'Spiritual', 2),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'mountain', 'Mountain', 1),
  ('environment', 'jungle', 'Jungle', 2),
  ('energy_level', 'calm', 'Calm', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE countries.slug = 'laos'
ON CONFLICT DO NOTHING;

-- Myanmar
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'country', id, tag_category, tag_slug, tag_label, tag_order
FROM countries, (VALUES
  ('travel_style', 'city_culture', 'City & culture', 1),
  ('travel_style', 'adventure', 'Adventure', 2),
  ('vibe', 'spiritual', 'Spiritual', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'mountain', 'Mountain', 1),
  ('energy_level', 'calm', 'Calm', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE countries.slug = 'myanmar'
ON CONFLICT DO NOTHING;

-- Morocco
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'country', id, tag_category, tag_slug, tag_label, tag_order
FROM countries, (VALUES
  ('travel_style', 'foodie', 'Food lover', 1),
  ('travel_style', 'city_culture', 'City & culture', 2),
  ('travel_style', 'adventure', 'Adventure', 3),
  ('vibe', 'adventurous', 'Adventurous', 1),
  ('vibe', 'lively', 'Lively', 2),
  ('budget', 'mid_range', 'Mid-range', 1),
  ('pace', 'mix_of_both', 'Mix of both', 1),
  ('environment', 'city', 'City', 1),
  ('environment', 'mountain', 'Mountain', 2),
  ('energy_level', 'social', 'Social', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE countries.slug = 'morocco'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COUNTRIES - Missing tags for already-tagged countries
-- ============================================================================

-- Thailand: add energy_level(mixed)
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'country', id, tag_category, tag_slug, tag_label, tag_order
FROM countries, (VALUES
  ('energy_level', 'mixed', 'Mixed energy', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE countries.slug = 'thailand'
ON CONFLICT DO NOTHING;

-- Philippines: add safety_context(reliable_transport), energy_level(social)
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'country', id, tag_category, tag_slug, tag_label, tag_order
FROM countries, (VALUES
  ('safety_context', 'reliable_transport', 'Reliable transport', 1),
  ('energy_level', 'social', 'Social', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE countries.slug = 'philippines'
ON CONFLICT DO NOTHING;

-- Portugal: add environment, safety_context, social_comfort, energy_level
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'country', id, tag_category, tag_slug, tag_label, tag_order
FROM countries, (VALUES
  ('environment', 'city', 'City', 1),
  ('environment', 'beach', 'Beach', 2),
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('safety_context', 'reliable_transport', 'Reliable transport', 2),
  ('social_comfort', 'strong_women_community', 'Strong women community', 1),
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 2),
  ('energy_level', 'mixed', 'Mixed energy', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE countries.slug = 'portugal'
ON CONFLICT DO NOTHING;

-- Japan: add environment, safety_context, energy_level
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'country', id, tag_category, tag_slug, tag_label, tag_order
FROM countries, (VALUES
  ('environment', 'city', 'City', 1),
  ('environment', 'mountain', 'Mountain', 2),
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('safety_context', 'reliable_transport', 'Reliable transport', 2),
  ('energy_level', 'calm', 'Calm', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE countries.slug = 'japan'
ON CONFLICT DO NOTHING;

-- Vietnam: add social_comfort, energy_level
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'country', id, tag_category, tag_slug, tag_label, tag_order
FROM countries, (VALUES
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 1),
  ('energy_level', 'mixed', 'Mixed energy', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE countries.slug = 'vietnam'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CITIES - Thailand
-- ============================================================================

-- Bangkok
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'foodie', 'Food lover', 1),
  ('travel_style', 'city_culture', 'City & culture', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 2),
  ('solo_context', 'great_public_transport', 'Great public transport', 3),
  ('vibe', 'lively', 'Lively', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'fast_paced', 'Fast-paced', 1),
  ('environment', 'city', 'City', 1),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('safety_context', 'reliable_transport', 'Reliable transport', 2),
  ('energy_level', 'social', 'Social', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'bangkok'
ON CONFLICT DO NOTHING;

-- Krabi
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'beach_islands', 'Beach & islands', 1),
  ('travel_style', 'adventure', 'Adventure', 2),
  ('travel_style', 'nature_outdoors', 'Nature & outdoors', 3),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('vibe', 'adventurous', 'Adventurous', 1),
  ('vibe', 'relaxed', 'Relaxed', 2),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'beach', 'Beach', 1),
  ('environment', 'island', 'Island', 2),
  ('energy_level', 'mixed', 'Mixed energy', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'krabi'
ON CONFLICT DO NOTHING;

-- Koh Phangan
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'beach_islands', 'Beach & islands', 1),
  ('travel_style', 'wellness_retreat', 'Wellness', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('vibe', 'relaxed', 'Relaxed', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'beach', 'Beach', 1),
  ('environment', 'island', 'Island', 2),
  ('energy_level', 'mixed', 'Mixed energy', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'koh-phangan'
ON CONFLICT DO NOTHING;

-- Pai
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'nature_outdoors', 'Nature & outdoors', 1),
  ('travel_style', 'wellness_retreat', 'Wellness', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('vibe', 'relaxed', 'Relaxed', 1),
  ('vibe', 'quiet', 'Quiet', 2),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'mountain', 'Mountain', 1),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('energy_level', 'calm', 'Calm', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'pai'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CITIES - Vietnam
-- ============================================================================

-- Ho Chi Minh City
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'foodie', 'Food lover', 1),
  ('travel_style', 'city_culture', 'City & culture', 2),
  ('solo_context', 'strong_solo_community', 'Strong solo community', 1),
  ('vibe', 'lively', 'Lively', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'fast_paced', 'Fast-paced', 1),
  ('environment', 'city', 'City', 1),
  ('safety_context', 'reliable_transport', 'Reliable transport', 1),
  ('energy_level', 'social', 'Social', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'ho-chi-minh-city'
ON CONFLICT DO NOTHING;

-- Hanoi
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'foodie', 'Food lover', 1),
  ('travel_style', 'city_culture', 'City & culture', 2),
  ('vibe', 'lively', 'Lively', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'fast_paced', 'Fast-paced', 1),
  ('environment', 'city', 'City', 1),
  ('safety_context', 'reliable_transport', 'Reliable transport', 1),
  ('energy_level', 'social', 'Social', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'hanoi'
ON CONFLICT DO NOTHING;

-- Da Nang
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'beach_islands', 'Beach & islands', 1),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('vibe', 'relaxed', 'Relaxed', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'mix_of_both', 'Mix of both', 1),
  ('environment', 'beach', 'Beach', 1),
  ('environment', 'city', 'City', 2),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('safety', 'walkable_night', 'Walkable at night', 2),
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('safety_context', 'reliable_transport', 'Reliable transport', 2),
  ('energy_level', 'mixed', 'Mixed energy', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'da-nang'
ON CONFLICT DO NOTHING;

-- Da Lat
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'nature_outdoors', 'Nature & outdoors', 1),
  ('travel_style', 'adventure', 'Adventure', 2),
  ('vibe', 'quiet', 'Quiet', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'mountain', 'Mountain', 1),
  ('energy_level', 'calm', 'Calm', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'da-lat'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CITIES - Indonesia
-- ============================================================================

-- Canggu
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'beach_islands', 'Beach & islands', 1),
  ('travel_style', 'wellness_retreat', 'Wellness', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'strong_solo_community', 'Strong solo community', 2),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 3),
  ('vibe', 'lively', 'Lively', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'mix_of_both', 'Mix of both', 1),
  ('environment', 'beach', 'Beach', 1),
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('social_comfort', 'strong_women_community', 'Strong women community', 1),
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 2),
  ('energy_level', 'social', 'Social', 1),
  ('accommodation_type', 'female_only_stays', 'Female-only stays available', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'canggu'
ON CONFLICT DO NOTHING;

-- Seminyak
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'beach_islands', 'Beach & islands', 1),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 2),
  ('vibe', 'lively', 'Lively', 1),
  ('budget', 'mid_range', 'Mid-range', 1),
  ('pace', 'mix_of_both', 'Mix of both', 1),
  ('environment', 'beach', 'Beach', 1),
  ('energy_level', 'social', 'Social', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'seminyak'
ON CONFLICT DO NOTHING;

-- Yogyakarta
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'city_culture', 'City & culture', 1),
  ('vibe', 'spiritual', 'Spiritual', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'city', 'City', 1),
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('safety_context', 'reliable_transport', 'Reliable transport', 2),
  ('energy_level', 'calm', 'Calm', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'yogyakarta'
ON CONFLICT DO NOTHING;

-- Gili Islands
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'beach_islands', 'Beach & islands', 1),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('vibe', 'relaxed', 'Relaxed', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'beach', 'Beach', 1),
  ('environment', 'island', 'Island', 2),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('energy_level', 'mixed', 'Mixed energy', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'gili-islands'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CITIES - Philippines
-- ============================================================================

-- Manila
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'foodie', 'Food lover', 1),
  ('travel_style', 'city_culture', 'City & culture', 2),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 1),
  ('vibe', 'lively', 'Lively', 1),
  ('budget', 'mid_range', 'Mid-range', 1),
  ('pace', 'fast_paced', 'Fast-paced', 1),
  ('environment', 'city', 'City', 1),
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('safety_context', 'reliable_transport', 'Reliable transport', 2),
  ('energy_level', 'social', 'Social', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'manila'
ON CONFLICT DO NOTHING;

-- Cebu
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'beach_islands', 'Beach & islands', 1),
  ('travel_style', 'adventure', 'Adventure', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 2),
  ('vibe', 'adventurous', 'Adventurous', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'mix_of_both', 'Mix of both', 1),
  ('environment', 'beach', 'Beach', 1),
  ('environment', 'city', 'City', 2),
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('safety_context', 'reliable_transport', 'Reliable transport', 2),
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 1),
  ('energy_level', 'social', 'Social', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'cebu'
ON CONFLICT DO NOTHING;

-- Bohol
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'beach_islands', 'Beach & islands', 1),
  ('travel_style', 'nature_outdoors', 'Nature & outdoors', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 2),
  ('vibe', 'relaxed', 'Relaxed', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'beach', 'Beach', 1),
  ('environment', 'island', 'Island', 2),
  ('energy_level', 'calm', 'Calm', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'bohol'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CITIES - Malaysia
-- ============================================================================

-- Kuala Lumpur
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'foodie', 'Food lover', 1),
  ('travel_style', 'city_culture', 'City & culture', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 2),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 3),
  ('solo_context', 'great_public_transport', 'Great public transport', 4),
  ('vibe', 'lively', 'Lively', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'fast_paced', 'Fast-paced', 1),
  ('environment', 'city', 'City', 1),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('safety', 'walkable_night', 'Walkable at night', 2),
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('safety_context', 'reliable_transport', 'Reliable transport', 2),
  ('social_comfort', 'strong_women_community', 'Strong women community', 1),
  ('energy_level', 'social', 'Social', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'kuala-lumpur'
ON CONFLICT DO NOTHING;

-- Penang
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'foodie', 'Food lover', 1),
  ('travel_style', 'city_culture', 'City & culture', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 2),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 3),
  ('vibe', 'relaxed', 'Relaxed', 1),
  ('vibe', 'aesthetic', 'Aesthetic', 2),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'city', 'City', 1),
  ('environment', 'island', 'Island', 2),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('safety', 'walkable_night', 'Walkable at night', 2),
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 1),
  ('energy_level', 'calm', 'Calm', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'penang'
ON CONFLICT DO NOTHING;

-- Malacca
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'city_culture', 'City & culture', 1),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 2),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 3),
  ('vibe', 'quiet', 'Quiet', 1),
  ('vibe', 'aesthetic', 'Aesthetic', 2),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'city', 'City', 1),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('safety', 'walkable_night', 'Walkable at night', 2),
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('energy_level', 'calm', 'Calm', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'malacca'
ON CONFLICT DO NOTHING;

-- Langkawi
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'beach_islands', 'Beach & islands', 1),
  ('travel_style', 'nature_outdoors', 'Nature & outdoors', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 2),
  ('vibe', 'relaxed', 'Relaxed', 1),
  ('budget', 'mid_range', 'Mid-range', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'beach', 'Beach', 1),
  ('environment', 'island', 'Island', 2),
  ('energy_level', 'calm', 'Calm', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'langkawi'
ON CONFLICT DO NOTHING;

-- Kota Kinabalu
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'adventure', 'Adventure', 1),
  ('travel_style', 'nature_outdoors', 'Nature & outdoors', 2),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 1),
  ('vibe', 'adventurous', 'Adventurous', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'mix_of_both', 'Mix of both', 1),
  ('environment', 'mountain', 'Mountain', 1),
  ('environment', 'jungle', 'Jungle', 2),
  ('safety_context', 'reliable_transport', 'Reliable transport', 1),
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 1),
  ('energy_level', 'mixed', 'Mixed energy', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'kota-kinabalu'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CITIES - Singapore
-- ============================================================================

-- Singapore (city)
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'foodie', 'Food lover', 1),
  ('travel_style', 'city_culture', 'City & culture', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 2),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 3),
  ('solo_context', 'great_public_transport', 'Great public transport', 4),
  ('vibe', 'lively', 'Lively', 1),
  ('pace', 'fast_paced', 'Fast-paced', 1),
  ('environment', 'city', 'City', 1),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('safety', 'walkable_night', 'Walkable at night', 2),
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('safety_context', 'reliable_transport', 'Reliable transport', 2),
  ('energy_level', 'social', 'Social', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'singapore'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CITIES - Cambodia
-- ============================================================================

-- Siem Reap
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'city_culture', 'City & culture', 1),
  ('travel_style', 'adventure', 'Adventure', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 2),
  ('vibe', 'adventurous', 'Adventurous', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'city', 'City', 1),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('safety_context', 'reliable_transport', 'Reliable transport', 2),
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 1),
  ('energy_level', 'social', 'Social', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'siem-reap'
ON CONFLICT DO NOTHING;

-- Phnom Penh
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'city_culture', 'City & culture', 1),
  ('travel_style', 'foodie', 'Food lover', 2),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 1),
  ('solo_context', 'strong_solo_community', 'Strong solo community', 2),
  ('vibe', 'lively', 'Lively', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'fast_paced', 'Fast-paced', 1),
  ('environment', 'city', 'City', 1),
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('safety_context', 'reliable_transport', 'Reliable transport', 2),
  ('energy_level', 'social', 'Social', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'phnom-penh'
ON CONFLICT DO NOTHING;

-- Kampot
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'nature_outdoors', 'Nature & outdoors', 1),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 2),
  ('vibe', 'relaxed', 'Relaxed', 1),
  ('vibe', 'quiet', 'Quiet', 2),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'city', 'City', 1),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 1),
  ('energy_level', 'calm', 'Calm', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'kampot'
ON CONFLICT DO NOTHING;

-- Koh Rong
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'beach_islands', 'Beach & islands', 1),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 2),
  ('vibe', 'relaxed', 'Relaxed', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'beach', 'Beach', 1),
  ('environment', 'island', 'Island', 2),
  ('energy_level', 'mixed', 'Mixed energy', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'koh-rong'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CITIES - Laos
-- ============================================================================

-- Luang Prabang
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'city_culture', 'City & culture', 1),
  ('travel_style', 'nature_outdoors', 'Nature & outdoors', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 2),
  ('vibe', 'spiritual', 'Spiritual', 1),
  ('vibe', 'quiet', 'Quiet', 2),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'city', 'City', 1),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('energy_level', 'calm', 'Calm', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'luang-prabang'
ON CONFLICT DO NOTHING;

-- Vientiane
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'city_culture', 'City & culture', 1),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 2),
  ('vibe', 'relaxed', 'Relaxed', 1),
  ('vibe', 'quiet', 'Quiet', 2),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'city', 'City', 1),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('energy_level', 'calm', 'Calm', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'vientiane'
ON CONFLICT DO NOTHING;

-- Vang Vieng
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'adventure', 'Adventure', 1),
  ('travel_style', 'nature_outdoors', 'Nature & outdoors', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('vibe', 'adventurous', 'Adventurous', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'mix_of_both', 'Mix of both', 1),
  ('environment', 'mountain', 'Mountain', 1),
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 1),
  ('energy_level', 'social', 'Social', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'vang-vieng'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CITIES - Myanmar
-- ============================================================================

-- Yangon
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'city_culture', 'City & culture', 1),
  ('vibe', 'spiritual', 'Spiritual', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'city', 'City', 1),
  ('energy_level', 'calm', 'Calm', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'yangon'
ON CONFLICT DO NOTHING;

-- Bagan
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'city_culture', 'City & culture', 1),
  ('travel_style', 'adventure', 'Adventure', 2),
  ('vibe', 'spiritual', 'Spiritual', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('energy_level', 'calm', 'Calm', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'bagan'
ON CONFLICT DO NOTHING;

-- Inle Lake
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'nature_outdoors', 'Nature & outdoors', 1),
  ('vibe', 'quiet', 'Quiet', 1),
  ('vibe', 'spiritual', 'Spiritual', 2),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'mountain', 'Mountain', 1),
  ('energy_level', 'calm', 'Calm', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'inle-lake'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CITIES - Japan
-- ============================================================================

-- Tokyo
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'foodie', 'Food lover', 1),
  ('travel_style', 'city_culture', 'City & culture', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 2),
  ('solo_context', 'great_public_transport', 'Great public transport', 3),
  ('vibe', 'lively', 'Lively', 1),
  ('pace', 'fast_paced', 'Fast-paced', 1),
  ('environment', 'city', 'City', 1),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('safety', 'walkable_night', 'Walkable at night', 2),
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('safety_context', 'reliable_transport', 'Reliable transport', 2),
  ('energy_level', 'social', 'Social', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'tokyo'
ON CONFLICT DO NOTHING;

-- Kyoto
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'city_culture', 'City & culture', 1),
  ('travel_style', 'nature_outdoors', 'Nature & outdoors', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 2),
  ('vibe', 'spiritual', 'Spiritual', 1),
  ('vibe', 'quiet', 'Quiet', 2),
  ('vibe', 'aesthetic', 'Aesthetic', 3),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'city', 'City', 1),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('energy_level', 'calm', 'Calm', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'kyoto'
ON CONFLICT DO NOTHING;

-- Osaka
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'foodie', 'Food lover', 1),
  ('travel_style', 'city_culture', 'City & culture', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 2),
  ('solo_context', 'great_public_transport', 'Great public transport', 3),
  ('vibe', 'lively', 'Lively', 1),
  ('pace', 'fast_paced', 'Fast-paced', 1),
  ('environment', 'city', 'City', 1),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('safety', 'walkable_night', 'Walkable at night', 2),
  ('safety_context', 'reliable_transport', 'Reliable transport', 1),
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 1),
  ('energy_level', 'social', 'Social', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'osaka'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CITIES - Portugal
-- ============================================================================

-- Lisbon
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'foodie', 'Food lover', 1),
  ('travel_style', 'city_culture', 'City & culture', 2),
  ('travel_style', 'beach_islands', 'Beach & islands', 3),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 2),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 3),
  ('solo_context', 'great_public_transport', 'Great public transport', 4),
  ('solo_context', 'strong_solo_community', 'Strong solo community', 5),
  ('vibe', 'lively', 'Lively', 1),
  ('vibe', 'aesthetic', 'Aesthetic', 2),
  ('budget', 'mid_range', 'Mid-range', 1),
  ('pace', 'mix_of_both', 'Mix of both', 1),
  ('environment', 'city', 'City', 1),
  ('environment', 'beach', 'Beach', 2),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('safety', 'walkable_night', 'Walkable at night', 2),
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('safety_context', 'reliable_transport', 'Reliable transport', 2),
  ('social_comfort', 'strong_women_community', 'Strong women community', 1),
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 2),
  ('energy_level', 'social', 'Social', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'lisbon'
ON CONFLICT DO NOTHING;

-- Porto
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'foodie', 'Food lover', 1),
  ('travel_style', 'city_culture', 'City & culture', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 2),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 3),
  ('vibe', 'relaxed', 'Relaxed', 1),
  ('vibe', 'aesthetic', 'Aesthetic', 2),
  ('budget', 'mid_range', 'Mid-range', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'city', 'City', 1),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('safety', 'walkable_night', 'Walkable at night', 2),
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 1),
  ('energy_level', 'calm', 'Calm', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'porto'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CITIES - Morocco
-- ============================================================================

-- Marrakech
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'city_culture', 'City & culture', 1),
  ('travel_style', 'adventure', 'Adventure', 2),
  ('travel_style', 'foodie', 'Food lover', 3),
  ('vibe', 'lively', 'Lively', 1),
  ('vibe', 'adventurous', 'Adventurous', 2),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'fast_paced', 'Fast-paced', 1),
  ('environment', 'city', 'City', 1),
  ('energy_level', 'social', 'Social', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'marrakech'
ON CONFLICT DO NOTHING;

-- Fes
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'city_culture', 'City & culture', 1),
  ('vibe', 'adventurous', 'Adventurous', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'city', 'City', 1),
  ('energy_level', 'calm', 'Calm', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'fes'
ON CONFLICT DO NOTHING;

-- Chefchaouen
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('travel_style', 'nature_outdoors', 'Nature & outdoors', 1),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 2),
  ('vibe', 'quiet', 'Quiet', 1),
  ('vibe', 'aesthetic', 'Aesthetic', 2),
  ('vibe', 'relaxed', 'Relaxed', 3),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('environment', 'mountain', 'Mountain', 1),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 1),
  ('energy_level', 'calm', 'Calm', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'chefchaouen'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CITIES - Missing tags for already-tagged cities
-- ============================================================================

-- El Nido: add budget(mid_range)
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('budget', 'mid_range', 'Mid-range', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'el-nido'
ON CONFLICT DO NOTHING;

-- Siargao: add budget(budget_friendly)
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('budget', 'budget_friendly', 'Budget-friendly', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'siargao'
ON CONFLICT DO NOTHING;
