INSERT INTO discovery_lenses (slug, title, helper_text, icon_name, intro_md, include_tags, exclude_tags, entity_types, order_index)
VALUES
(
  'solo-friendly-first-trip',
  'First solo trip',
  'Places that make your first time easy',
  'sunrise',
  E'Your first solo trip is a big deal — and where you go matters more than you think. These destinations are chosen specifically because they''re easy to navigate alone, have strong communities of solo women travelers, and offer the kind of welcoming infrastructure that lets you focus on the experience rather than the logistics.\n\nEvery city and country here has been vetted for English accessibility, reliable transport, and a proven track record with first-time solo women.',
  '{first_solo_trip,easy_to_navigate,english_widely_spoken}',
  '{}',
  '{country,city}',
  1
),
(
  'female-only-stays',
  'Female-only stays',
  'Dorms and hostels with women-only options',
  'home',
  E'Where you sleep shapes how safe you feel. These destinations have verified female-only accommodation options — from women-only dorm rooms to entire hostels designed for women.\n\nWe check for real female-only policies, not just marketing. Each stay listed here has been confirmed to offer dedicated women-only spaces with proper security measures.',
  '{female_only_stays,women_only_options,women_run}',
  '{}',
  '{city}',
  2
),
(
  'walkable-well-lit',
  'Walkable & well-lit',
  'Neighborhoods safe to explore on foot',
  'sun',
  E'Being able to walk freely — day and night — changes how you experience a place. These neighborhoods and cities are chosen for their well-lit streets, active evening scenes, and the kind of pedestrian infrastructure that means you never feel stuck.\n\nWe look at street lighting, foot traffic patterns, sidewalk quality, and how comfortable solo women report feeling walking after dark.',
  '{walkable_night,walkable_day,well_lit}',
  '{}',
  '{city}',
  3
),
(
  'calm-recharge',
  'Calm places to recharge',
  'Quiet spots when you need a reset',
  'cloud',
  E'Solo travel is exhilarating, but it''s also exhausting. Sometimes you need a place that asks nothing of you — where the pace is gentle, the noise is low, and being alone feels like a luxury, not loneliness.\n\nThese destinations are specifically chosen for their calm energy. Think morning yoga with no schedule, afternoons reading by water, and evenings where silence is the soundtrack.',
  '{quiet,slow_travel,relaxed}',
  '{nightlife_social,lively,fast_paced}',
  '{city}',
  4
),
(
  'easy-transport',
  'Easy to get around',
  'Reliable transport, low friction cities',
  'navigation',
  E'Transportation anxiety is real — especially when you''re alone in a new place. These cities have reliable, safe, and easy-to-use transport systems that work for solo women at any hour.\n\nWe evaluate public transit coverage, ride-sharing availability, walkability, and how easy it is to get from airport to accommodation without stress.',
  '{great_public_transport,reliable_transport,easy_to_navigate}',
  '{}',
  '{city}',
  5
),
(
  'women-traveler-hotspots',
  'Women traveler hotspots',
  'Where solo women already go',
  'users',
  E'There''s something powerful about going where other women have gone before you. These destinations have the strongest concentration of solo women travelers — meaning you''ll find communities, events, and spaces designed with women in mind.\n\nFrom women-run hostels to female-focused group activities, these places make it easy to connect with like-minded travelers.',
  '{strong_solo_community,strong_women_community}',
  '{}',
  '{city,country}',
  6
),
(
  'wellness-retreat',
  'Wellness & retreat',
  'Yoga, spa, meditation destinations',
  'heart',
  E'Solo travel and self-care aren''t separate things — they''re the same thing. These destinations are built around wellness: yoga studios on every corner, meditation retreats that welcome solo women, spa experiences that don''t require a couple''s booking.\n\nEach destination here is vetted for quality wellness offerings, solo-friendly pricing, and the kind of environment where taking care of yourself is the whole point.',
  '{wellness_retreat,spiritual}',
  '{}',
  '{city}',
  7
);
