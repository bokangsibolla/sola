-- ============================================================
-- SEED: Additional Community Threads & Replies (batch 2)
-- Expands beyond SEA to JP, PT, MA, MY, KH, LA, SG
-- Also fixes reply_count for all seeded threads
-- ============================================================

DO $$
DECLARE
  demo_author uuid;
  -- countries
  jp_country uuid;
  pt_country uuid;
  ma_country uuid;
  my_country uuid;
  kh_country uuid;
  la_country uuid;
  sg_country uuid;
  -- cities
  tokyo_city uuid;
  kyoto_city uuid;
  lisbon_city uuid;
  porto_city uuid;
  marrakech_city uuid;
  penang_city uuid;
  siem_reap_city uuid;
  luang_prabang_city uuid;
  singapore_city uuid;
  -- topics
  topic_safety uuid;
  topic_stays uuid;
  topic_getting_around uuid;
  topic_culture uuid;
  topic_meeting uuid;
  topic_itinerary uuid;
  -- thread IDs for replies
  t9 uuid; t10 uuid; t11 uuid; t12 uuid;
  t13 uuid; t14 uuid; t15 uuid;
BEGIN
  -- Get a demo author
  SELECT id INTO demo_author FROM profiles LIMIT 1;
  IF demo_author IS NULL THEN RETURN; END IF;

  -- Countries
  SELECT id INTO jp_country FROM countries WHERE iso2 = 'JP';
  SELECT id INTO pt_country FROM countries WHERE iso2 = 'PT';
  SELECT id INTO ma_country FROM countries WHERE iso2 = 'MA';
  SELECT id INTO my_country FROM countries WHERE iso2 = 'MY';
  SELECT id INTO kh_country FROM countries WHERE iso2 = 'KH';
  SELECT id INTO la_country FROM countries WHERE iso2 = 'LA';
  SELECT id INTO sg_country FROM countries WHERE iso2 = 'SG';

  -- Cities
  SELECT id INTO tokyo_city FROM cities WHERE slug = 'tokyo' LIMIT 1;
  SELECT id INTO kyoto_city FROM cities WHERE slug = 'kyoto' LIMIT 1;
  SELECT id INTO lisbon_city FROM cities WHERE slug = 'lisbon' LIMIT 1;
  SELECT id INTO porto_city FROM cities WHERE slug = 'porto' LIMIT 1;
  SELECT id INTO marrakech_city FROM cities WHERE slug = 'marrakech' LIMIT 1;
  SELECT id INTO penang_city FROM cities WHERE slug = 'penang' LIMIT 1;
  SELECT id INTO siem_reap_city FROM cities WHERE slug = 'siem-reap' LIMIT 1;
  SELECT id INTO luang_prabang_city FROM cities WHERE slug = 'luang-prabang' LIMIT 1;
  SELECT id INTO singapore_city FROM cities WHERE slug = 'singapore' LIMIT 1;

  -- Topics
  SELECT id INTO topic_safety FROM community_topics WHERE slug = 'safety-comfort';
  SELECT id INTO topic_stays FROM community_topics WHERE slug = 'stays';
  SELECT id INTO topic_getting_around FROM community_topics WHERE slug = 'getting-around';
  SELECT id INTO topic_culture FROM community_topics WHERE slug = 'local-culture';
  SELECT id INTO topic_meeting FROM community_topics WHERE slug = 'meeting-people';
  SELECT id INTO topic_itinerary FROM community_topics WHERE slug = 'itineraries';

  -- ---------------------------------------------------------------
  -- Thread 9: Japan / Tokyo — solo dining
  -- ---------------------------------------------------------------
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed, reply_count)
  VALUES (gen_random_uuid(), demo_author,
    'Solo dining in Tokyo — is it awkward or totally normal?',
    'I''ve heard Japan is one of the best countries for eating alone, but I''m still a bit nervous about it. Are there places that are specifically solo-friendly? I love ramen and sushi but want to try an izakaya too. Do solo women get treated differently at nicer restaurants?',
    jp_country, tokyo_city, topic_culture, 'system', true, 2)
  RETURNING id INTO t9;

  -- ---------------------------------------------------------------
  -- Thread 10: Portugal / Lisbon — walkability and safety
  -- ---------------------------------------------------------------
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed, reply_count)
  VALUES (gen_random_uuid(), demo_author,
    'Walking Lisbon solo at night — which neighbourhoods feel safe?',
    'I''m spending 5 nights in Lisbon and want to walk around after dinner, see the city lit up. I''ll be staying in Alfama. Are there areas I should avoid after dark? What about the bar scene — is it easy to go out alone without feeling out of place?',
    pt_country, lisbon_city, topic_safety, 'system', true, 2)
  RETURNING id INTO t10;

  -- ---------------------------------------------------------------
  -- Thread 11: Morocco / Marrakech — navigating the souks
  -- ---------------------------------------------------------------
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed, reply_count)
  VALUES (gen_random_uuid(), demo_author,
    'Navigating Marrakech souks as a solo woman — real talk',
    'I keep seeing conflicting advice. Some women say Marrakech was amazing, others say the harassment was constant. I''m travelling alone for 4 days and staying in a riad in the medina. What should I actually expect? Any tips for dealing with persistent vendors and unsolicited guides?',
    ma_country, marrakech_city, topic_safety, 'system', true, 2)
  RETURNING id INTO t11;

  -- ---------------------------------------------------------------
  -- Thread 12: Malaysia / Penang — street food solo
  -- ---------------------------------------------------------------
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed, reply_count)
  VALUES (gen_random_uuid(), demo_author,
    'Penang street food crawl — best route for a solo traveler?',
    'I have 3 days in Penang and want to do a proper street food tour but on my own (group tours feel too rushed). What''s the best area to base myself for walking to the best hawker stalls? I want char kway teow, assam laksa, and cendol at minimum. Any local favourites tourists usually miss?',
    my_country, penang_city, topic_itinerary, 'system', true, 2)
  RETURNING id INTO t12;

  -- ---------------------------------------------------------------
  -- Thread 13: Cambodia / Siem Reap — Angkor logistics
  -- ---------------------------------------------------------------
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed, reply_count)
  VALUES (gen_random_uuid(), demo_author,
    'Angkor Wat solo — tuk-tuk driver or bicycle?',
    'Planning 2 days at Angkor. I see most people hire a tuk-tuk driver for the day ($15-20) but I''m wondering if cycling is realistic for a solo woman? The temples seem spread out. Also, is the 3-day pass worth it or can I see the highlights in 2 days? Sunrise worth the 4am wake-up?',
    kh_country, siem_reap_city, topic_getting_around, 'system', true, 2)
  RETURNING id INTO t13;

  -- ---------------------------------------------------------------
  -- Thread 14: Laos / Luang Prabang — slow travel
  -- ---------------------------------------------------------------
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed, reply_count)
  VALUES (gen_random_uuid(), demo_author,
    'Luang Prabang for slow solo travel — how many days is enough?',
    'Everyone says LP is magical but small. I don''t want to rush it — I like slow mornings, journaling at cafes, and exploring on foot. Is 4 days too long or just right? What about the alms-giving ceremony — is it respectful for tourists to watch? Any quiet spots away from the night market crowds?',
    la_country, luang_prabang_city, topic_itinerary, 'system', true, 2)
  RETURNING id INTO t14;

  -- ---------------------------------------------------------------
  -- Thread 15: Japan / Kyoto — connecting with other travellers
  -- ---------------------------------------------------------------
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed, reply_count)
  VALUES (gen_random_uuid(), demo_author,
    'Meeting other solo women in Kyoto — where to find your people?',
    'I''ll be in Kyoto for a week and while I love solo time, I''d also love to meet other women traveling alone. Hostels seem like the obvious answer but are there other ways? Tea ceremonies, cooking classes, hiking groups? I''m 32 and past the party hostel phase but still want connection.',
    jp_country, kyoto_city, topic_meeting, 'system', true, 2)
  RETURNING id INTO t15;

  -- ---------------------------------------------------------------
  -- Replies
  -- ---------------------------------------------------------------

  -- Thread 9 replies (Tokyo solo dining)
  IF t9 IS NOT NULL THEN
    INSERT INTO community_replies (thread_id, author_id, body) VALUES
    (t9, demo_author, 'Solo dining in Japan is genuinely the best in the world. Ramen shops are almost designed for solo eaters — counter seating, ticket machines, minimal interaction. For sushi, sit at the counter at any conveyor belt place or splurge on an omakase counter (many are solo-friendly). Izakayas are fine alone too, especially smaller ones.'),
    (t9, demo_author, 'I ate alone every meal for 10 days in Tokyo and never felt awkward once. The concept of "ohitorisama" (doing things alone with dignity) is deeply cultural. Some restaurants even have single-person booths. Ichiran Ramen has literal dividers between seats. For izakayas, try the ones under the train tracks in Yurakucho — they''re tiny and welcoming.');
  END IF;

  -- Thread 10 replies (Lisbon at night)
  IF t10 IS NOT NULL THEN
    INSERT INTO community_replies (thread_id, author_id, body) VALUES
    (t10, demo_author, 'Lisbon is one of the safest capitals in Europe. Alfama is lovely at night — the narrow streets can feel quiet but not unsafe. Bairro Alto is the bar district, very lively and fine solo. Avoid Martim Moniz area late at night and be aware of pickpockets on tram 28. I walked everywhere alone and never felt threatened.'),
    (t10, demo_author, 'Seconding the safety comments. I did a solo wine bar crawl through Chiado and Principe Real and it was perfect. Portuguese people are warm but not intrusive. The miradouros (viewpoints) at sunset are stunning and there are always other people around. Cais do Sodré has a fun nightlife scene if you want something livelier.');
  END IF;

  -- Thread 11 replies (Marrakech souks)
  IF t11 IS NOT NULL THEN
    INSERT INTO community_replies (thread_id, author_id, body) VALUES
    (t11, demo_author, 'I went solo for 5 days. Honest take: you WILL get attention, catcalls, and persistent vendors. It''s not dangerous but it''s exhausting if you''re not prepared. What helped me: dress conservatively (loose clothing, covered shoulders), walk with purpose like you know where you''re going, learn "la shukran" (no thank you), and don''t engage with anyone who approaches you first. The medina is actually safe — just overwhelming.'),
    (t11, demo_author, 'Three things that made my Marrakech trip great: 1) Stay in a riad with a rooftop — your peaceful escape from the chaos. 2) Hire a female guide for your first morning in the souks (your riad can arrange this). After that you''ll feel confident navigating alone. 3) The new city (Gueliz) is completely different — modern cafes, no hassle, great for when you need a break. The contrast is worth experiencing.');
  END IF;

  -- Thread 12 replies (Penang street food)
  IF t12 IS NOT NULL THEN
    INSERT INTO community_replies (thread_id, author_id, body) VALUES
    (t12, demo_author, 'Stay in George Town — everything is walkable. My route: start at Tek Sen for lunch (arrive early, it queues), walk to Lebuh Kimberly for the famous char kway teow (the one with the longest queue is the right one), then New Lane hawker stalls in the evening. For assam laksa, Air Itam market is the best but it''s a Grab ride away.'),
    (t12, demo_author, 'Penang is SO solo-friendly. Everyone eats alone at hawker centres — you just grab a seat at a shared table and point at what you want. Don''t miss cendol at Teochew Chendul on Lebuh Keng Kwee. Also, the Penang Hill funicular at sunset followed by dinner at the top is a beautiful solo experience. The street art walk through George Town is perfect for a morning wander.');
  END IF;

  -- Thread 13 replies (Angkor logistics)
  IF t13 IS NOT NULL THEN
    INSERT INTO community_replies (thread_id, author_id, body) VALUES
    (t13, demo_author, 'I did both — cycled day 1 (small circuit) and tuk-tuk day 2 (grand circuit). Cycling is doable but HOT. Like, 35°C and no shade between temples. I''d recommend cycling only if you''re fit and start at 5am. The small circuit is about 17km. For the grand circuit, definitely tuk-tuk — it''s 26km and you''ll want the energy for exploring. 2 days is enough for highlights.'),
    (t13, demo_author, 'The sunrise at Angkor Wat is 100% worth it, but get there by 5am for a good spot. I hired a tuk-tuk driver for both days ($18/day) and it was the best decision. Mr. Sao let me take my time, had cold water waiting, and knew the quieter temples. Ask your hostel for a recommendation. Also: bring a headlamp for the steep stairs inside some temples.');
  END IF;

  -- Thread 14 replies (Luang Prabang slow travel)
  IF t14 IS NOT NULL THEN
    INSERT INTO community_replies (thread_id, author_id, body) VALUES
    (t14, demo_author, '4 days is perfect for slow travel. My favourite days: morning alms ceremony (watch respectfully from a distance, do NOT participate as a tourist — it''s sacred), then café with a view of the Mekong, afternoon at Kuang Si waterfalls (the turquoise pools are unreal). Joma Bakery Café is my journaling spot — great coffee, calm vibe, river views.'),
    (t14, demo_author, 'LP is one of the most peaceful places I''ve ever traveled solo. 4 days felt right. Beyond the obvious: climb Phou Si Hill for sunset (arrive 30min early), take a slow boat to Pak Ou Caves, and eat at the morning market near the main temple. The night market is touristy but I loved the quiet streets behind it — monks walking at dawn, bougainvillea everywhere.');
  END IF;

  -- Thread 15 replies (Kyoto meeting people)
  IF t15 IS NOT NULL THEN
    INSERT INTO community_replies (thread_id, author_id, body) VALUES
    (t15, demo_author, 'I''m 34 and had the same worry. What worked for me: 1) Cooking class at Hana Cooking (small group, I met 3 solo women there). 2) The Philosopher''s Path early morning — naturally bumped into other solo walkers and we ended up having matcha together. 3) Piece Hostel in Sanjo has a beautiful lounge that attracts 30+ solo travelers. Not a party vibe at all.'),
    (t15, demo_author, 'Tea ceremony! I did a small-group one in Gion and it was intimate enough to actually talk to people. Also, the Fushimi Inari hike at sunrise attracts other early-bird solo travelers — I met my now-best-friend on that hike. For a less obvious tip: the international community at Café Bibliotic Hello is wonderful — locals and travelers mixing over books and coffee.');
  END IF;

  -- ---------------------------------------------------------------
  -- Fix reply_count for original 8 threads (batch 1)
  -- They have replies but reply_count was left at 0
  -- ---------------------------------------------------------------
  UPDATE community_threads SET reply_count = (
    SELECT COUNT(*) FROM community_replies
    WHERE community_replies.thread_id = community_threads.id
      AND community_replies.status = 'active'
  )
  WHERE is_seed = true;

END $$;
