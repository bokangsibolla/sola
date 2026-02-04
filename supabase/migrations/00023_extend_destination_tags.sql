-- Add additional tags for Southeast Asia launch countries
-- This extends the existing tags from migration 00010

-- Thailand - add environment and safety tags
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'country', id, tag_category, tag_slug, tag_label, tag_order
from countries, (values
  ('environment', 'beach', 'Beach', 1),
  ('environment', 'island', 'Island', 2),
  ('environment', 'city', 'City', 3)
) as t(tag_category, tag_slug, tag_label, tag_order)
where countries.slug = 'thailand'
on conflict do nothing;

-- Indonesia - add environment tags
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'country', id, tag_category, tag_slug, tag_label, tag_order
from countries, (values
  ('environment', 'beach', 'Beach', 1),
  ('environment', 'island', 'Island', 2),
  ('environment', 'jungle', 'Jungle', 3)
) as t(tag_category, tag_slug, tag_label, tag_order)
where countries.slug = 'indonesia'
on conflict do nothing;

-- Philippines - add environment tags
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'country', id, tag_category, tag_slug, tag_label, tag_order
from countries, (values
  ('environment', 'beach', 'Beach', 1),
  ('environment', 'island', 'Island', 2)
) as t(tag_category, tag_slug, tag_label, tag_order)
where countries.slug = 'philippines'
on conflict do nothing;

-- Vietnam - add missing solo_context and environment tags
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'country', id, tag_category, tag_slug, tag_label, tag_order
from countries, (values
  ('travel_style', 'foodie', 'Food lover', 1),
  ('travel_style', 'city_culture', 'City & culture', 2),
  ('travel_style', 'adventure', 'Adventure', 3),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 1),
  ('vibe', 'adventurous', 'Adventurous', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'mix_of_both', 'Mix of both', 1),
  ('environment', 'beach', 'Beach', 1),
  ('environment', 'city', 'City', 2),
  ('environment', 'mountain', 'Mountain', 3)
) as t(tag_category, tag_slug, tag_label, tag_order)
where countries.slug = 'vietnam'
on conflict do nothing;

-- Add city-level tags for spotlight cities

-- Ubud, Bali
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'city', id, tag_category, tag_slug, tag_label, tag_order
from cities, (values
  ('travel_style', 'wellness_retreat', 'Wellness', 1),
  ('travel_style', 'city_culture', 'Culture', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'strong_solo_community', 'Strong solo community', 2),
  ('vibe', 'spiritual', 'Spiritual', 1),
  ('vibe', 'quiet', 'Quiet', 2),
  ('environment', 'jungle', 'Jungle', 1),
  ('pace', 'slow_travel', 'Slow travel', 1)
) as t(tag_category, tag_slug, tag_label, tag_order)
where cities.slug = 'ubud'
on conflict do nothing;

-- Chiang Mai
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'city', id, tag_category, tag_slug, tag_label, tag_order
from cities, (values
  ('travel_style', 'city_culture', 'Culture', 1),
  ('travel_style', 'foodie', 'Food lover', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 2),
  ('vibe', 'relaxed', 'Relaxed', 1),
  ('environment', 'city', 'City', 1),
  ('environment', 'mountain', 'Mountain', 2),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('safety', 'walkable_night', 'Walkable at night', 2)
) as t(tag_category, tag_slug, tag_label, tag_order)
where cities.slug = 'chiang-mai'
on conflict do nothing;

-- Hoi An
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'city', id, tag_category, tag_slug, tag_label, tag_order
from cities, (values
  ('travel_style', 'city_culture', 'Culture', 1),
  ('travel_style', 'foodie', 'Food lover', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('vibe', 'quiet', 'Quiet', 1),
  ('vibe', 'aesthetic', 'Aesthetic', 2),
  ('environment', 'city', 'City', 1),
  ('environment', 'beach', 'Beach', 2),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('safety', 'walkable_night', 'Walkable at night', 2)
) as t(tag_category, tag_slug, tag_label, tag_order)
where cities.slug = 'hoi-an'
on conflict do nothing;

-- El Nido
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'city', id, tag_category, tag_slug, tag_label, tag_order
from cities, (values
  ('travel_style', 'beach_islands', 'Beach & islands', 1),
  ('travel_style', 'adventure', 'Adventure', 2),
  ('solo_context', 'strong_solo_community', 'Strong solo community', 1),
  ('vibe', 'adventurous', 'Adventurous', 1),
  ('vibe', 'relaxed', 'Relaxed', 2),
  ('environment', 'beach', 'Beach', 1),
  ('environment', 'island', 'Island', 2),
  ('pace', 'slow_travel', 'Slow travel', 1)
) as t(tag_category, tag_slug, tag_label, tag_order)
where cities.slug = 'el-nido'
on conflict do nothing;

-- Siargao
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'city', id, tag_category, tag_slug, tag_label, tag_order
from cities, (values
  ('travel_style', 'beach_islands', 'Beach & islands', 1),
  ('travel_style', 'adventure', 'Adventure', 2),
  ('solo_context', 'strong_solo_community', 'Strong solo community', 1),
  ('vibe', 'lively', 'Lively', 1),
  ('vibe', 'adventurous', 'Adventurous', 2),
  ('environment', 'beach', 'Beach', 1),
  ('environment', 'island', 'Island', 2),
  ('pace', 'slow_travel', 'Slow travel', 1)
) as t(tag_category, tag_slug, tag_label, tag_order)
where cities.slug = 'siargao'
on conflict do nothing;
