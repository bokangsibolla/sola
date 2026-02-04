-- Seed editorial collections for Southeast Asia launch

insert into collections (slug, title, subtitle, intro_md, hero_image_url, include_tags, exclude_tags, entity_types, order_index, is_featured)
values
-- 1. First Solo Trips (Countries)
(
  'first-solo-trips',
  'Best destinations for your first solo trip',
  'For first-timers who want ease and charm',
  E'Planning your first solo adventure can feel overwhelming, but these destinations make it easy. Each one combines welcoming locals, safe streets, and enough fellow travelers that you''ll never feel truly alone.\n\nWhether you''re drawn to temples, beaches, or bustling cities, these countries offer the perfect training wheels for independent travel. English is widely understood, transport is straightforward, and the solo travel community is strong.',
  'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200',
  '{first_solo_trip,easy_to_navigate}',
  '{}',
  '{country}',
  1,
  true
),

-- 2. Calm Beach Towns (Cities)
(
  'calm-beach-towns',
  'Calm beach towns for slow travel',
  'Where the pace is gentle and the views are endless',
  E'Sometimes you need a destination that asks nothing of you. These beach towns are built for lingering — morning coffee watching the waves, afternoon naps, sunset drinks with new friends.\n\nPerfect for solo travelers seeking rest over adventure, each of these spots offers calm waters, walkable streets, and the kind of easy rhythm that makes you extend your stay.',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
  '{beach_islands,slow_travel,quiet}',
  '{fast_paced,nightlife_social}',
  '{city}',
  2,
  false
),

-- 3. Cultural Capitals (Cities)
(
  'cultural-capitals',
  'Cultural capitals worth exploring',
  'Art, history, and unforgettable experiences',
  E'Some cities are defined by their culture — the temples you wander, the museums you discover, the neighborhoods that tell stories. These cultural capitals reward the curious traveler.\n\nEach destination offers walkable historic centers, world-class food scenes, and the kind of depth that reveals itself over multiple visits. Perfect for solo travelers who want substance over sun.',
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200',
  '{city_culture,walkable_day}',
  '{}',
  '{city}',
  3,
  false
),

-- 4. Wellness Retreats (Mix)
(
  'wellness-retreats',
  'Wellness & retreat destinations',
  'Recharge your body and mind',
  E'Solo travel is the perfect time to prioritize yourself. These destinations are built around wellness — yoga studios, meditation centers, spa treatments, and healthy food that actually tastes good.\n\nWhether you want a structured retreat or just a place where self-care is the default, these spots attract like-minded travelers and make healthy living effortless.',
  'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200',
  '{wellness_retreat,spiritual}',
  '{}',
  '{country,city}',
  4,
  false
),

-- 5. Adventure & Outdoors
(
  'adventure-outdoors',
  'For the adventurous spirit',
  'Hiking, diving, surfing, and more',
  E'If sitting still isn''t your style, these destinations deliver. From world-class surf breaks to jungle treks, from diving spots to mountain peaks — each offers adventures that push your limits.\n\nSolo adventure travel might sound intimidating, but these places have strong communities of like-minded travelers. You''ll find tours, guides, and new friends at every turn.',
  'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=1200',
  '{adventure,nature_outdoors}',
  '{}',
  '{country,city}',
  5,
  false
),

-- 6. Budget-Friendly Escapes
(
  'budget-friendly',
  'Travel more, spend less',
  'Incredible value without compromise',
  E'Your budget shouldn''t limit your adventures. These destinations offer remarkable value — comfortable stays under $30/night, delicious meals for a few dollars, and experiences that rival destinations costing three times as much.\n\nEach place maintains quality while respecting your wallet. Perfect for extended trips or anyone who wants to make their travel fund stretch further.',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
  '{budget_friendly}',
  '{splurge_worthy}',
  '{country}',
  6,
  false
);
