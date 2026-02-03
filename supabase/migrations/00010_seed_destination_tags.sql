-- Seed destination tags for countries
-- Thailand
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'country', id, tag_category, tag_slug, tag_label, tag_order
from countries, (values
  ('travel_style', 'beach_islands', 'Beach & islands', 1),
  ('travel_style', 'foodie', 'Food lover', 2),
  ('travel_style', 'wellness_retreat', 'Wellness', 3),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 2),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 3),
  ('vibe', 'relaxed', 'Relaxed', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1)
) as t(tag_category, tag_slug, tag_label, tag_order)
where countries.slug = 'thailand'
on conflict do nothing;

-- Philippines
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'country', id, tag_category, tag_slug, tag_label, tag_order
from countries, (values
  ('travel_style', 'beach_islands', 'Beach & islands', 1),
  ('travel_style', 'adventure', 'Adventure', 2),
  ('travel_style', 'nature_outdoors', 'Nature & outdoors', 3),
  ('solo_context', 'english_widely_spoken', 'English widely spoken', 1),
  ('solo_context', 'strong_solo_community', 'Strong solo community', 2),
  ('vibe', 'adventurous', 'Adventurous', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'slow_travel', 'Slow travel', 1)
) as t(tag_category, tag_slug, tag_label, tag_order)
where countries.slug = 'philippines'
on conflict do nothing;

-- Indonesia
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'country', id, tag_category, tag_slug, tag_label, tag_order
from countries, (values
  ('travel_style', 'wellness_retreat', 'Wellness', 1),
  ('travel_style', 'beach_islands', 'Beach & islands', 2),
  ('travel_style', 'city_culture', 'Culture', 3),
  ('solo_context', 'strong_solo_community', 'Strong solo community', 1),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 2),
  ('vibe', 'spiritual', 'Spiritual', 1),
  ('budget', 'mid_range', 'Mid-range', 1),
  ('pace', 'slow_travel', 'Slow travel', 1)
) as t(tag_category, tag_slug, tag_label, tag_order)
where countries.slug = 'indonesia'
on conflict do nothing;

-- Portugal
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'country', id, tag_category, tag_slug, tag_label, tag_order
from countries, (values
  ('travel_style', 'city_culture', 'City & culture', 1),
  ('travel_style', 'foodie', 'Food lover', 2),
  ('travel_style', 'beach_islands', 'Beach & islands', 3),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 2),
  ('solo_context', 'great_public_transport', 'Great public transport', 3),
  ('vibe', 'relaxed', 'Relaxed', 1),
  ('budget', 'mid_range', 'Mid-range', 1),
  ('pace', 'mix_of_both', 'Mix of both', 1)
) as t(tag_category, tag_slug, tag_label, tag_order)
where countries.slug = 'portugal'
on conflict do nothing;

-- Japan
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'country', id, tag_category, tag_slug, tag_label, tag_order
from countries, (values
  ('travel_style', 'city_culture', 'City & culture', 1),
  ('travel_style', 'foodie', 'Food lover', 2),
  ('travel_style', 'nature_outdoors', 'Nature & outdoors', 3),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 1),
  ('solo_context', 'great_public_transport', 'Great public transport', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 3),
  ('vibe', 'relaxed', 'Relaxed', 1),
  ('budget', 'mid_range', 'Mid-range', 1),
  ('pace', 'fast_paced', 'Fast-paced', 1)
) as t(tag_category, tag_slug, tag_label, tag_order)
where countries.slug = 'japan'
on conflict do nothing;
