-- ============================================================
-- SEED: Demo Community Threads & Replies
-- Women-first questions for PH, VN, TH, ID
-- ============================================================

-- Helper: use a demo author (first profile found, or skip if none)
DO $$
DECLARE
  demo_author uuid;
  ph_country uuid;
  vn_country uuid;
  th_country uuid;
  id_country uuid;
  -- cities
  manila_city uuid;
  siargao_city uuid;
  hanoi_city uuid;
  hoian_city uuid;
  bangkok_city uuid;
  chiangmai_city uuid;
  bali_city uuid;
  yogya_city uuid;
  -- topics
  topic_safety uuid;
  topic_stays uuid;
  topic_getting_around uuid;
  topic_culture uuid;
  topic_meeting uuid;
  topic_itinerary uuid;
  -- thread IDs for replies
  t1 uuid; t2 uuid; t3 uuid; t4 uuid;
  t5 uuid; t6 uuid; t7 uuid; t8 uuid;
BEGIN
  -- Get a demo author
  SELECT id INTO demo_author FROM profiles LIMIT 1;
  IF demo_author IS NULL THEN RETURN; END IF;

  -- Countries
  SELECT id INTO ph_country FROM countries WHERE iso2 = 'PH';
  SELECT id INTO vn_country FROM countries WHERE iso2 = 'VN';
  SELECT id INTO th_country FROM countries WHERE iso2 = 'TH';
  SELECT id INTO id_country FROM countries WHERE iso2 = 'ID';

  -- Cities (may be null if not seeded)
  SELECT id INTO manila_city FROM cities WHERE slug = 'manila' LIMIT 1;
  SELECT id INTO siargao_city FROM cities WHERE slug = 'siargao' LIMIT 1;
  SELECT id INTO hanoi_city FROM cities WHERE slug = 'hanoi' LIMIT 1;
  SELECT id INTO hoian_city FROM cities WHERE slug = 'hoi-an' LIMIT 1;
  SELECT id INTO bangkok_city FROM cities WHERE slug = 'bangkok' LIMIT 1;
  SELECT id INTO chiangmai_city FROM cities WHERE slug = 'chiang-mai' LIMIT 1;
  SELECT id INTO bali_city FROM cities WHERE slug = 'bali' LIMIT 1;
  SELECT id INTO yogya_city FROM cities WHERE slug = 'yogyakarta' LIMIT 1;

  -- Topics
  SELECT id INTO topic_safety FROM community_topics WHERE slug = 'safety-comfort';
  SELECT id INTO topic_stays FROM community_topics WHERE slug = 'stays';
  SELECT id INTO topic_getting_around FROM community_topics WHERE slug = 'getting-around';
  SELECT id INTO topic_culture FROM community_topics WHERE slug = 'local-culture';
  SELECT id INTO topic_meeting FROM community_topics WHERE slug = 'meeting-people';
  SELECT id INTO topic_itinerary FROM community_topics WHERE slug = 'itineraries';

  -- Philippines threads
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed)
  VALUES (gen_random_uuid(), demo_author,
    'Solo female safety in Manila — what areas to avoid at night?',
    'I''m arriving in Manila next week for a 3-night stopover. I''ll be staying in Makati but want to explore some street food in Binondo. Any areas I should be careful about after dark? I usually take Grab everywhere but just want to know the vibe.',
    ph_country, manila_city, topic_safety, 'system', true)
  RETURNING id INTO t1;

  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed)
  VALUES (gen_random_uuid(), demo_author,
    'Best hostels with female-only dorms in Siargao?',
    'Heading to Siargao for 5 days to learn surfing. Looking for a hostel with a female-only dorm option that''s social but not a party hostel. Budget around $15-20/night. Bonus if it''s walkable to Cloud 9.',
    ph_country, siargao_city, topic_stays, 'system', true)
  RETURNING id INTO t2;

  -- Vietnam threads
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed)
  VALUES (gen_random_uuid(), demo_author,
    'Getting around Hanoi as a solo woman — motorbike vs Grab?',
    'I keep reading that traffic in Hanoi is insane. Is it worth renting a motorbike or should I just use Grab for everything? I''m comfortable on scooters from Bali but Hanoi looks like a different level. Also, any tips for crossing the street without dying?',
    vn_country, hanoi_city, topic_getting_around, 'system', true)
  RETURNING id INTO t3;

  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed)
  VALUES (gen_random_uuid(), demo_author,
    'Hoi An 3-day itinerary — what would you cut?',
    'I have 3 full days in Hoi An. My list: Ancient Town walking, Marble Mountains, Basket Boat ride, Ba Na Hills, cooking class, tailoring, An Bang Beach. That''s way too much. What would you prioritize and what can I skip?',
    vn_country, hoian_city, topic_itinerary, 'system', true)
  RETURNING id INTO t4;

  -- Thailand threads
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed)
  VALUES (gen_random_uuid(), demo_author,
    'Temple etiquette for women in Bangkok — what to know',
    'First time visiting temples in Bangkok. I know shoulders and knees need to be covered, but are there any other rules for women specifically? Can I enter all areas of the temples? Any that are particularly worth visiting that feel safe and calm?',
    th_country, bangkok_city, topic_culture, 'system', true)
  RETURNING id INTO t5;

  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed)
  VALUES (gen_random_uuid(), demo_author,
    'Meeting other solo women in Chiang Mai — coworking or hostels?',
    'I''ll be in Chiang Mai for 2 weeks working remotely. Want to meet other solo female travelers but I''m not a big drinker and hostel bar scenes aren''t my thing. Are coworking spaces a good way to connect? Any specific ones where women tend to hang out?',
    th_country, chiangmai_city, topic_meeting, 'system', true)
  RETURNING id INTO t6;

  -- Indonesia threads
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed)
  VALUES (gen_random_uuid(), demo_author,
    'Honest talk: is Bali still worth it for solo women?',
    'I see so many mixed opinions. Some say Bali is overrun with influencers and scams, others say it''s still magical. I''m planning 10 days, interested in yoga, rice terraces, and quieter beaches. Is Ubud still authentic or should I look at other areas? Any spots to avoid?',
    id_country, bali_city, topic_itinerary, 'system', true)
  RETURNING id INTO t7;

  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed)
  VALUES (gen_random_uuid(), demo_author,
    'Solo woman in Yogyakarta — Borobudur sunrise tips?',
    'Doing the Borobudur sunrise. Is it safe to go alone or should I book a group tour? I''ve read mixed things about the touts and guides being pushy. Also, is Prambanan worth adding same day or too rushed?',
    id_country, yogya_city, topic_culture, 'system', true)
  RETURNING id INTO t8;

  -- Replies for first 4 threads (2 replies each)
  IF t1 IS NOT NULL THEN
    INSERT INTO community_replies (thread_id, author_id, body) VALUES
    (t1, demo_author, 'Makati is very safe, you''ll be fine there even at night. For Binondo, go during the day — it''s amazing for street food but gets quiet after 8pm. Take Grab to/from and you''ll have zero issues. I walked around Salcedo and Legazpi Village at midnight and felt totally comfortable.'),
    (t1, demo_author, 'Been to Manila 3 times solo. Makati and BGC are the safest areas. I would avoid Tondo and be cautious in Quiapo after dark. Binondo is fine during the day but I wouldn''t linger past sunset. Grab is super cheap so there''s no reason not to use it everywhere.');
  END IF;

  IF t3 IS NOT NULL THEN
    INSERT INTO community_replies (thread_id, author_id, body) VALUES
    (t3, demo_author, 'Honestly, just use Grab for the first 2 days and observe. Hanoi traffic has a rhythm — once you see it, it makes sense. I ended up renting a motorbike on day 3 and it was fine, but the first day I was terrified. For crossing: just walk steadily at a consistent pace and they flow around you. Do NOT stop or run.'),
    (t3, demo_author, 'I used Grab the whole time and was happy with that choice. Motorbike rentals are like $7/day but the stress wasn''t worth it for me. Grab is ₫20-40k for most rides within the Old Quarter. The app works perfectly.');
  END IF;

  IF t5 IS NOT NULL THEN
    INSERT INTO community_replies (thread_id, author_id, body) VALUES
    (t5, demo_author, 'The main rules: cover shoulders and knees (bring a shawl), remove shoes before entering, don''t point your feet at Buddha statues, and don''t touch monks. Women cannot touch monks or hand them anything directly. Wat Pho is my favorite — it''s huge so it never feels crowded, and the reclining Buddha is stunning.'),
    (t5, demo_author, 'Adding to what''s been said: if you''re on your period, some women prefer to skip the most sacred inner areas out of respect, but it''s not strictly required. Wat Arun at sunset is gorgeous and very calm. Skip the Grand Palace if you''re short on time — it''s beautiful but extremely crowded and touristy.');
  END IF;

  IF t7 IS NOT NULL THEN
    INSERT INTO community_replies (thread_id, author_id, body) VALUES
    (t7, demo_author, 'Bali is absolutely still worth it if you know where to go. Skip the Seminyak/Kuta tourist strip. For your interests: Ubud is still lovely (stay north of the center for quiet), Sidemen is the new Ubud but calmer, and Amed/Lovina for quiet beaches. The rice terraces at Jatiluwih are way less crowded than Tegallalang.'),
    (t7, demo_author, 'I just came back from 12 days solo. Ubud is still authentic if you stay outside the center — I was in Penestanan and it was magical. Canggu is fun but very Instagram-heavy. My favorite surprise was Munduk in the north — waterfalls, coffee plantations, almost no tourists. Strongly recommend.');
  END IF;
END $$;
