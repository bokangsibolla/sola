-- ==========================================================================
-- Migration: Rewrite community seed content
-- - Deletes 7 duplicate threads from double migration run
-- - Removes em dashes from all existing content (looks AI-generated)
-- - Adds 6 new seed profiles for author variety
-- - Flips some system threads to seed profiles
-- - Inserts 25 new threads with 75+ replies across diverse destinations
-- - Recalculates reply_count at the end
-- ==========================================================================

BEGIN;

-- ==========================================================================
-- 1. DELETE DUPLICATE THREADS (created in second migration run at 10:08)
--    CASCADE will delete their replies too
-- ==========================================================================

DELETE FROM community_threads
WHERE created_at >= '2026-02-05 10:08:00+00'::timestamptz
  AND is_seed = true;

-- ==========================================================================
-- 2. FIX EM DASHES IN EXISTING CONTENT
-- ==========================================================================

-- Titles: replace with colon (reads more natural as a subtitle)
UPDATE community_threads
SET title = REPLACE(title, ' — ', ': ')
WHERE title LIKE '%—%';

-- Bodies: replace with period (natural sentence break)
UPDATE community_threads
SET body = REPLACE(body, ' — ', '. ')
WHERE body LIKE '%—%';

UPDATE community_replies
SET body = REPLACE(body, ' — ', '. ')
WHERE body LIKE '%—%';

-- ==========================================================================
-- 3. ADD NEW SEED PROFILES (6 more for variety)
-- ==========================================================================

INSERT INTO community_seed_profiles (id, display_name, avatar_url, bio, home_base) VALUES
  ('b1a2c3d4-1111-4000-a000-000000000001', 'Raya',   NULL, 'Digital marketer from Jakarta. Weekends are for island hopping.', 'Jakarta, Indonesia'),
  ('b1a2c3d4-2222-4000-a000-000000000002', 'Jess',   NULL, 'Quit my London corporate job 6 months ago. Best decision ever.', 'London, UK'),
  ('b1a2c3d4-3333-4000-a000-000000000003', 'Tomoko', NULL, 'Osaka local. Love showing solo travelers the real Japan.', 'Osaka, Japan'),
  ('b1a2c3d4-4444-4000-a000-000000000004', 'Nadia',  NULL, 'Moroccan travel nerd. Ask me anything about North Africa.', 'Casablanca, Morocco'),
  ('b1a2c3d4-5555-4000-a000-000000000005', 'Clare',  NULL, 'Former safari guide, now full-time traveler based in Cape Town.', 'Cape Town, South Africa'),
  ('b1a2c3d4-6666-4000-a000-000000000006', 'Hana',   NULL, 'I run a solo women travel meetup in Seoul. 200+ members.', 'Seoul, South Korea')
ON CONFLICT (id) DO NOTHING;

-- ==========================================================================
-- 4. FLIP SOME SYSTEM THREADS TO SEED PROFILES
--    Makes the community feel less corporate, more organic
-- ==========================================================================

-- "Bali scams..." → Anna (lives in Ubud)
UPDATE community_threads
SET author_type = 'seed',
    seed_profile_id = 'a241e1e0-c352-44e0-b3a7-afb1f48e6924'
WHERE title LIKE 'Bali scams%' AND author_type = 'system';

-- "Getting around Hanoi..." → Mei (logistics person)
UPDATE community_threads
SET author_type = 'seed',
    seed_profile_id = '6e999a3f-b53f-4902-b8b6-7674fd9c1f5a'
WHERE title LIKE 'Getting around Hanoi%' AND author_type = 'system';

-- "SIM cards and connectivity..." → Lucia (Bangkok-based backpacker)
UPDATE community_threads
SET author_type = 'seed',
    seed_profile_id = 'af79b359-43c8-47f8-b3cd-d6800c9d8681'
WHERE title LIKE 'SIM cards%' AND author_type = 'system';

-- "Temple etiquette for women in Thailand" → Lucia
UPDATE community_threads
SET author_type = 'seed',
    seed_profile_id = 'af79b359-43c8-47f8-b3cd-d6800c9d8681'
WHERE title LIKE 'Temple etiquette%' AND author_type = 'system';

-- ==========================================================================
-- 5. INSERT NEW THREADS
--    25 threads across South Korea, Japan, Portugal, Morocco, South Africa,
--    Namibia, Thailand, Vietnam, Indonesia, Philippines, Cambodia, Taiwan,
--    and general travel topics.
--    Timestamps spread across Jan 25 - Feb 20, 2026 for organic feel.
-- ==========================================================================

INSERT INTO community_threads
  (id, author_id, title, body, country_id, city_id, topic_id,
   author_type, is_seed, seed_profile_id, created_at, updated_at)
VALUES

-- T01: Seoul nightlife
('a0000001-0000-4000-8000-000000000001',
 '00000000-0000-0000-0000-000000000001',
 'Is Hongdae safe for solo nightlife?',
 'I''m heading to Seoul next month and really want to experience the nightlife. Hongdae looks amazing but I''m not sure what it''s like for a woman alone. Any bars or areas you''d recommend? I''m not really into clubs, more chill bar vibes.',
 (SELECT id FROM countries WHERE name = 'South Korea'),
 (SELECT id FROM cities WHERE name = 'Seoul'),
 '30d09514-408b-4988-bc86-f32e4d6375fc',
 'seed', true, 'b1a2c3d4-2222-4000-a000-000000000002',
 '2026-01-25 14:30:00+00', '2026-01-25 14:30:00+00'),

-- T02: Cape Town safety
('a0000002-0000-4000-8000-000000000002',
 '00000000-0000-0000-0000-000000000001',
 'Cape Town solo: what''s the real safety situation?',
 'Planning 10 days in Cape Town and I keep getting mixed signals. Some people say it''s totally fine, others make it sound terrifying. Would love to hear from women who''ve actually been there. What areas should I stick to? Can I uber everywhere?',
 (SELECT id FROM countries WHERE name = 'South Africa'),
 (SELECT id FROM cities WHERE name = 'Cape Town'),
 '30d09514-408b-4988-bc86-f32e4d6375fc',
 'seed', true, 'b1a2c3d4-2222-4000-a000-000000000002',
 '2026-01-26 09:15:00+00', '2026-01-26 09:15:00+00'),

-- T03: Osaka food solo
('a0000003-0000-4000-8000-000000000003',
 '00000000-0000-0000-0000-000000000001',
 'Eating alone in Osaka: the ultimate experience',
 'Just got back from 5 days eating my way through Osaka and I need to tell you all. This city is a solo diner''s paradise. Counter seats everywhere, yatai stalls in Shinsekai, and nobody bats an eye if you''re alone. The takoyaki in Dotonbori is obviously great but the real gems are in Tenma and Fukushima neighborhoods. Happy to answer questions if anyone''s planning a trip.',
 (SELECT id FROM countries WHERE name = 'Japan'),
 (SELECT id FROM cities WHERE name = 'Osaka'),
 '28dc1283-b4dd-4356-ad28-5be032ac3d49',
 'seed', true, 'b1a2c3d4-3333-4000-a000-000000000003',
 '2026-01-27 11:00:00+00', '2026-01-27 11:00:00+00'),

-- T04: Capsule hotels
('a0000004-0000-4000-8000-000000000004',
 '00000000-0000-0000-0000-000000000001',
 'Women-only capsule hotels in Japan: totally worth it',
 'I was nervous about capsule hotels but the women-only floors (and some entire women-only locations) in Tokyo and Osaka are actually really nice. Clean, quiet, and way cheaper than regular hotels. Nine Hours in Shinjuku was my favorite. They give you pajamas, there are lockers for your bags, and the capsules have blackout curtains. Slept better than in some actual hotels.',
 (SELECT id FROM countries WHERE name = 'Japan'),
 (SELECT id FROM cities WHERE name = 'Tokyo'),
 'f8b227f4-ebb6-4dfc-a863-4a50e3d416b0',
 'seed', true, '87afafb7-3672-476b-acb0-8ed43af37aad',
 '2026-01-28 16:45:00+00', '2026-01-28 16:45:00+00'),

-- T05: Hoi An tailoring
('a0000005-0000-4000-8000-000000000005',
 '00000000-0000-0000-0000-000000000001',
 'Getting clothes made in Hoi An solo: my honest experience',
 E'Everyone talks about the tailoring in Hoi An so I went in expecting magic. Reality: some shops are amazing, some are tourist traps. Here''s what I learned after getting 4 things made.\n\nGo to shops on the side streets, not the main tourist road. Bring photos of exactly what you want. Get the fabric from the shop (don''t let them source it separately). Allow 3 days minimum for fittings. And be honest if something doesn''t fit right during the first fitting, they want to fix it.\n\nI got a blazer, two dresses, and a jumpsuit for about $180 total. The blazer is genuinely one of the best fitting things I own.',
 (SELECT id FROM countries WHERE name = 'Vietnam'),
 (SELECT id FROM cities WHERE name = 'Hoi An'),
 '28dc1283-b4dd-4356-ad28-5be032ac3d49',
 'seed', true, '62adbba4-98dc-468e-86ee-b82c5053aca3',
 '2026-01-29 08:20:00+00', '2026-01-29 08:20:00+00'),

-- T06: Da Lat hidden gem
('a0000006-0000-4000-8000-000000000006',
 '00000000-0000-0000-0000-000000000001',
 'Da Lat might be my favorite place in Vietnam',
 E'I almost skipped Da Lat because nobody really mentions it. So glad I didn''t. It''s up in the mountains so the weather is actually cool (huge relief after weeks of sweating in HCMC). French colonial architecture everywhere, incredible coffee, a huge night market, and hardly any tourists compared to Hoi An or Hanoi.\n\nThe bus from HCMC takes about 6 hours and costs like $8. I ended up staying a week instead of the 3 days I planned.',
 (SELECT id FROM countries WHERE name = 'Vietnam'),
 (SELECT id FROM cities WHERE name = 'Da Lat'),
 '28dc1283-b4dd-4356-ad28-5be032ac3d49',
 'seed', true, '6e999a3f-b53f-4902-b8b6-7674fd9c1f5a',
 '2026-01-30 13:10:00+00', '2026-01-30 13:10:00+00'),

-- T07: Pai one week
('a0000007-0000-4000-8000-000000000007',
 '00000000-0000-0000-0000-000000000001',
 'Spending a week in Pai: too long or just right?',
 'I keep hearing Pai is tiny and you only need 2-3 days. But I really want to slow down after rushing through Bangkok and Chiang Mai. Is a week there overkill or is there enough to fill the time? I like hiking, yoga, and just being in nature.',
 (SELECT id FROM countries WHERE name = 'Thailand'),
 (SELECT id FROM cities WHERE name = 'Pai'),
 '28dc1283-b4dd-4356-ad28-5be032ac3d49',
 'seed', true, 'a241e1e0-c352-44e0-b3a7-afb1f48e6924',
 '2026-01-31 10:00:00+00', '2026-01-31 10:00:00+00'),

-- T08: Koh Phangan without parties
('a0000008-0000-4000-8000-000000000008',
 '00000000-0000-0000-0000-000000000001',
 'Koh Phangan if you hate parties',
 'I know Koh Phangan is famous for the Full Moon Party but that is really not my scene. I went anyway because the beaches looked beautiful and I''m glad I did. The north side of the island (Haad Salad, Haad Yao) is completely different from the party area. Quiet beaches, yoga studios, amazing seafood. It felt like a different island entirely.',
 (SELECT id FROM countries WHERE name = 'Thailand'),
 (SELECT id FROM cities WHERE name = 'Koh Phangan'),
 'c409702c-f379-4487-8e36-a7ee644a27a5',
 'seed', true, 'af79b359-43c8-47f8-b3cd-d6800c9d8681',
 '2026-02-01 15:30:00+00', '2026-02-01 15:30:00+00'),

-- T09: Bangkok to Chiang Mai night train
('a0000009-0000-4000-8000-000000000009',
 '00000000-0000-0000-0000-000000000001',
 'Taking the night train from Bangkok to Chiang Mai',
 E'Just did this and wanted to share because I was nervous about it. The overnight sleeper train takes about 13 hours (departs around 6pm, arrives 7am). I booked a second class sleeper, upper berth. Each berth has a curtain for privacy.\n\nThe train was clean, the bed was comfortable enough, and I actually slept pretty well. Tips: book at the station a few days ahead or on 12go.asia. Bring snacks. Lower berth is more expensive but wider. Upper berth has a window and more privacy. I felt completely safe.',
 (SELECT id FROM countries WHERE name = 'Thailand'),
 (SELECT id FROM cities WHERE name = 'Chiang Mai'),
 '3ada0307-202f-4dc2-9958-b6cdf3c42947',
 'seed', true, '6e999a3f-b53f-4902-b8b6-7674fd9c1f5a',
 '2026-02-02 07:45:00+00', '2026-02-02 07:45:00+00'),

-- T10: Fes medina without guide
('a0000010-0000-4000-8000-000000000010',
 '00000000-0000-0000-0000-000000000001',
 'I explored Fes medina without a guide and survived',
 E'Everyone told me I absolutely needed a guide for the Fes medina. I hired one for day 1 (which was helpful to get oriented) but then explored on my own for the next 2 days and it was fine. Yes you will get lost. That''s part of the experience. Google Maps actually works surprisingly well in the medina.\n\nPeople will try to "help" you find your way (and expect a tip) but a firm "no thank you" works. The tanneries, the pottery workshops, the random beautiful doors everywhere. Getting lost is when you find the best stuff. Just keep your phone charged and your riad''s location saved.',
 (SELECT id FROM countries WHERE name = 'Morocco'),
 (SELECT id FROM cities WHERE name = 'Fes'),
 '3ada0307-202f-4dc2-9958-b6cdf3c42947',
 'seed', true, 'b1a2c3d4-4444-4000-a000-000000000004',
 '2026-02-03 12:00:00+00', '2026-02-03 12:00:00+00'),

-- T11: Morocco tips
('a0000011-0000-4000-8000-000000000011',
 '00000000-0000-0000-0000-000000000001',
 'Things nobody told me before I went to Morocco',
 E'Just finished 3 weeks in Morocco (Marrakech, Fes, Chefchaouen, Essaouira). Here are the things I wish someone had told me:\n\n1. ATMs are everywhere but many have low withdrawal limits. Bring some euros as backup.\n2. The trains between cities are comfortable and cheap. Book on the ONCF website.\n3. Riads > hotels. They''re usually the same price but way more character.\n4. Haggling is expected in souks but not in restaurants or shops with fixed prices.\n5. Ramadan timing matters. If you''re visiting during Ramadan, many restaurants close during the day.\n6. Chefchaouen really is as blue as the photos. It''s not edited.\n7. The sahara desert trips from Marrakech are 2 full days of driving. Consider going from Fes instead, it''s closer.',
 (SELECT id FROM countries WHERE name = 'Morocco'),
 NULL,
 'c409702c-f379-4487-8e36-a7ee644a27a5',
 'seed', true, 'af79b359-43c8-47f8-b3cd-d6800c9d8681',
 '2026-02-04 09:30:00+00', '2026-02-04 09:30:00+00'),

-- T12: El Nido island hopping
('a0000012-0000-4000-8000-000000000012',
 '00000000-0000-0000-0000-000000000001',
 'El Nido island hopping solo: which tour to pick',
 E'There are 4 island hopping tours in El Nido (Tours A, B, C, D). I did all of them over 4 days and here''s my ranking:\n\nTour A: The classic. Big Lagoon and Small Lagoon are breathtaking. Go early to beat the crowds.\nTour C: My favorite actually. Hidden Beach and Matinloc Shrine are stunning and it felt less crowded.\nTour B: Beautiful caves and snorkeling. Good if you like underwater stuff.\nTour D: Honestly skippable unless you have extra days.\n\nAll tours are around 1,400 pesos ($25) including lunch on the boat. You can book at any shop on the main street. Going solo is easy because they group you with other travelers.',
 (SELECT id FROM countries WHERE name = 'Philippines'),
 (SELECT id FROM cities WHERE name = 'El Nido'),
 '28dc1283-b4dd-4356-ad28-5be032ac3d49',
 'seed', true, '87afafb7-3672-476b-acb0-8ed43af37aad',
 '2026-02-05 14:00:00+00', '2026-02-05 14:00:00+00'),

-- T13: Bohol from Cebu
('a0000013-0000-4000-8000-000000000013',
 '00000000-0000-0000-0000-000000000001',
 'Bohol day trip from Cebu: worth it or stay overnight?',
 'Thinking about doing Bohol from Cebu. The Chocolate Hills and tarsier sanctuary look cool but I''m not sure if I should do it as a day trip or stay a night. I only have 2 days left in the Philippines. Anyone done this?',
 (SELECT id FROM countries WHERE name = 'Philippines'),
 (SELECT id FROM cities WHERE name = 'Cebu'),
 '28dc1283-b4dd-4356-ad28-5be032ac3d49',
 'seed', true, 'af79b359-43c8-47f8-b3cd-d6800c9d8681',
 '2026-02-06 11:20:00+00', '2026-02-06 11:20:00+00'),

-- T14: Kampot
('a0000014-0000-4000-8000-000000000014',
 '00000000-0000-0000-0000-000000000001',
 'Kampot: Cambodia''s best kept secret?',
 E'If you''re tired of the temple circuit in Siem Reap and want something completely different, go to Kampot. It''s this sleepy riverside town in southern Cambodia. French colonial buildings, pepper plantations, a national park, and barely any tourists.\n\nThe river is beautiful for kayaking. The kampot pepper is famous worldwide and you can tour the farms. And the food scene is surprisingly great for such a small town. I found an amazing French-Khmer fusion place run by a local couple.\n\nReally easy to get to from Phnom Penh, about 2.5 hours by bus.',
 (SELECT id FROM countries WHERE name = 'Cambodia'),
 (SELECT id FROM cities WHERE name = 'Kampot'),
 '28dc1283-b4dd-4356-ad28-5be032ac3d49',
 'system', true, NULL,
 '2026-02-07 08:00:00+00', '2026-02-07 08:00:00+00'),

-- T15: Taipei night markets
('a0000015-0000-4000-8000-000000000015',
 '00000000-0000-0000-0000-000000000001',
 'Taipei night markets are solo traveler heaven',
 E'If you love food and you''re traveling alone, Taipei night markets are perfect. You just walk around, point at things, eat, repeat. No awkward table-for-one situations. Everything is cheap (most snacks are 50-100 TWD, like $1.50-3).\n\nMy favorites:\n- Shilin: biggest and most famous. Go for the fried chicken and stinky tofu (trust me).\n- Raohe: smaller, one straight line, less overwhelming. The pepper pork bun at the entrance is iconic.\n- Ningxia: local favorite, great for oyster omelets and taro balls.\n\nAll are right next to MRT stations. I felt completely safe at all of them even past midnight.',
 (SELECT id FROM countries WHERE name = 'Taiwan'),
 (SELECT id FROM cities WHERE name = 'Taipei'),
 '28dc1283-b4dd-4356-ad28-5be032ac3d49',
 'seed', true, '6e999a3f-b53f-4902-b8b6-7674fd9c1f5a',
 '2026-02-08 17:00:00+00', '2026-02-08 17:00:00+00'),

-- T16: Canggu vs Ubud
('a0000016-0000-4000-8000-000000000016',
 '00000000-0000-0000-0000-000000000001',
 'Canggu or Ubud for working remotely?',
 'I''m planning to spend a month in Bali working remotely and I can''t decide between Canggu and Ubud. Canggu seems like it has better coworking and more of a social scene but I''ve also heard it''s gotten really crowded and expensive. Ubud is more chill but is the wifi reliable enough for work? Would love to hear from anyone who''s done both.',
 (SELECT id FROM countries WHERE name = 'Indonesia'),
 (SELECT id FROM cities WHERE name = 'Ubud'),
 'f8b227f4-ebb6-4dfc-a863-4a50e3d416b0',
 'seed', true, 'b1a2c3d4-1111-4000-a000-000000000001',
 '2026-02-09 10:30:00+00', '2026-02-09 10:30:00+00'),

-- T17: Sossusvlei solo
('a0000017-0000-4000-8000-000000000017',
 '00000000-0000-0000-0000-000000000001',
 'Sossusvlei without a tour: is it possible?',
 'I really want to see the red dunes at Sossusvlei in Namibia but all the tours are either expensive group trips or self-drive packages. Has anyone done it solo without a car? Is there any public transport option or should I just bite the bullet and rent one?',
 (SELECT id FROM countries WHERE name = 'Namibia'),
 (SELECT id FROM cities WHERE name = 'Sossusvlei'),
 '3ada0307-202f-4dc2-9958-b6cdf3c42947',
 'seed', true, 'b1a2c3d4-2222-4000-a000-000000000002',
 '2026-02-10 08:15:00+00', '2026-02-10 08:15:00+00'),

-- T18: Travel insurance
('a0000018-0000-4000-8000-000000000018',
 '00000000-0000-0000-0000-000000000001',
 'Travel insurance: what actually matters for solo women',
 E'After 2 years of traveling I''ve learned a lot about travel insurance the hard way. Here''s what actually matters when you''re picking a policy:\n\n- Medical evacuation coverage (not just medical expenses). If you get hurt somewhere remote you need to get to a good hospital.\n- Coverage for motorbike accidents. A lot of policies exclude this and it''s the most common injury in Southeast Asia.\n- Mental health coverage. Some newer policies include this.\n- Trip interruption. If something happens at home and you need to fly back.\n- Your electronics. Laptops and phones are expensive to replace abroad.\n\nI use SafetyWing for longer trips and World Nomads for shorter ones. Both have been reliable when I needed to make claims.',
 NULL, NULL,
 '30d09514-408b-4988-bc86-f32e4d6375fc',
 'system', true, NULL,
 '2026-02-11 13:00:00+00', '2026-02-11 13:00:00+00'),

-- T19: Loneliness
('a0000019-0000-4000-8000-000000000019',
 '00000000-0000-0000-0000-000000000001',
 'How do you deal with lonely days on solo trips?',
 E'I''ve been traveling solo for 4 months now and most days are great. But some days the loneliness hits hard, especially in the evenings. I''ll be having an amazing day exploring and then dinner time comes and I just wish I had someone to talk to about it.\n\nI''m not looking for advice on how to meet people (I''m fine at that). It''s more about those quiet moments when you''re alone with your thoughts and everything feels a bit heavy. How do you handle that?',
 NULL, NULL,
 '483e6b7d-5115-4641-b128-80b476a24e03',
 'seed', true, 'b1a2c3d4-2222-4000-a000-000000000002',
 '2026-02-12 20:00:00+00', '2026-02-12 20:00:00+00'),

-- T20: Packing list
('a0000020-0000-4000-8000-000000000020',
 '00000000-0000-0000-0000-000000000001',
 'My actual packing list for 3 months in Southeast Asia',
 E'After way too much overthinking, here''s what I actually used during 3 months in Thailand, Vietnam, and Indonesia:\n\n- 4 t-shirts, 2 tank tops, 1 light long sleeve (for temples)\n- 2 shorts, 1 linen pants, 1 sarong (doubles as beach towel, temple cover-up, and blanket)\n- 1 light rain jacket\n- Swimsuit + coverup\n- Chacos for walking, flip flops for showers/beach\n- Quick-dry towel\n- Toiletries in travel sizes (you can buy everything locally so don''t overpack this)\n- Basic first aid kit with anti-diarrhea meds, antihistamine, bandaids\n- Portable charger, universal adapter, headlamp\n- Padlock for hostel lockers\n- Kindle\n\nEverything fit in a 40L backpack. Don''t bring jeans. Don''t bring heels. Don''t bring more than one nice outfit.',
 NULL, NULL,
 '28dc1283-b4dd-4356-ad28-5be032ac3d49',
 'system', true, NULL,
 '2026-02-13 11:30:00+00', '2026-02-13 11:30:00+00'),

-- T21: Seoul jimjilbangs
('a0000021-0000-4000-8000-000000000021',
 '00000000-0000-0000-0000-000000000001',
 'Best jimjilbangs in Seoul for a solo relaxation day',
 E'Jimjilbangs (Korean bathhouses) are one of my favorite solo activities in Seoul. You pay one entrance fee and can spend the whole day. Most have saunas, hot pools, cold pools, a sleeping area, and a restaurant. Totally normal to go alone.\n\nMy top picks:\n- Dragon Hill Spa in Yongsan: biggest and most famous, open 24 hours. Has an outdoor pool and rooftop area.\n- Siloam Sauna near Seoul Station: traditional, less touristy, great for the local experience.\n- Spa Land in Busan if you''re heading south: inside Shinsegae department store and absolutely stunning.\n\nJust remember: the bathing areas are fully nude and gender-separated. It feels weird for about 30 seconds and then you completely forget about it.',
 (SELECT id FROM countries WHERE name = 'South Korea'),
 (SELECT id FROM cities WHERE name = 'Seoul'),
 '28dc1283-b4dd-4356-ad28-5be032ac3d49',
 'seed', true, 'b1a2c3d4-6666-4000-a000-000000000006',
 '2026-02-14 09:00:00+00', '2026-02-14 09:00:00+00'),

-- T22: Porto vs Lisbon
('a0000022-0000-4000-8000-000000000022',
 '00000000-0000-0000-0000-000000000001',
 'Porto or Lisbon for a solo long weekend?',
 'I have a 4-day weekend coming up and I want to go to Portugal. Can''t decide between Porto and Lisbon. I love good food, wine, walkable cities, and I want to feel safe walking around at night. Which would you pick and why?',
 (SELECT id FROM countries WHERE name = 'Portugal'),
 NULL,
 '30d09514-408b-4988-bc86-f32e4d6375fc',
 'system', true, NULL,
 '2026-02-15 14:15:00+00', '2026-02-15 14:15:00+00'),

-- T23: Yogyakarta temples
('a0000023-0000-4000-8000-000000000023',
 '00000000-0000-0000-0000-000000000001',
 'Borobudur and Prambanan solo: how to do it without a tour',
 E'Did both temples on my own from Yogyakarta and it was straightforward. Here''s how:\n\nBorobudur: Get there for sunrise (4:30am). You can book a sunrise ticket online or at the gate the evening before. Grab from Yogyakarta costs about 200k IDR ($13). The temple at sunrise with the mist and mountains behind it is genuinely one of the most beautiful things I''ve ever seen.\n\nPrambanan: Easy to reach by public bus (Trans Jogja, 3,600 IDR / $0.25). I went in the late afternoon for sunset which was stunning and less crowded than Borobudur.\n\nYou don''t need a guide for either but the audio guide at Borobudur is worth the extra 50k.',
 (SELECT id FROM countries WHERE name = 'Indonesia'),
 (SELECT id FROM cities WHERE name = 'Yogyakarta'),
 '28dc1283-b4dd-4356-ad28-5be032ac3d49',
 'seed', true, 'a241e1e0-c352-44e0-b3a7-afb1f48e6924',
 '2026-02-16 06:30:00+00', '2026-02-16 06:30:00+00'),

-- T24: Chefchaouen
('a0000024-0000-4000-8000-000000000024',
 '00000000-0000-0000-0000-000000000001',
 'Chefchaouen was the most peaceful part of my Morocco trip',
 E'After the intensity of Marrakech and Fes, Chefchaouen felt like exhaling. The blue streets are real (not exaggerated for photos), the pace is slow, and the locals were the friendliest I met in Morocco. I spent 2 days just wandering the medina, taking photos, and sitting in cafes.\n\nIt''s a bit out of the way (5 hours by bus from Fes) but so worth it if you have the time. The mountains around it are beautiful for hiking too. I did a half-day hike to the Spanish Mosque viewpoint which has an incredible view of the whole town.',
 (SELECT id FROM countries WHERE name = 'Morocco'),
 (SELECT id FROM cities WHERE name = 'Chefchaouen'),
 '28dc1283-b4dd-4356-ad28-5be032ac3d49',
 'seed', true, 'b1a2c3d4-4444-4000-a000-000000000004',
 '2026-02-17 16:00:00+00', '2026-02-17 16:00:00+00'),

-- T25: Windhoek
('a0000025-0000-4000-8000-000000000025',
 '00000000-0000-0000-0000-000000000001',
 'Is Windhoek worth a few days or just a stopover?',
 'Flying into Windhoek for a Namibia trip. Most people seem to just pass through but I''m wondering if the city itself is worth exploring for a day or two. Or should I head straight to Sossusvlei / Swakopmund?',
 (SELECT id FROM countries WHERE name = 'Namibia'),
 (SELECT id FROM cities WHERE name = 'Windhoek'),
 '28dc1283-b4dd-4356-ad28-5be032ac3d49',
 'seed', true, 'b1a2c3d4-5555-4000-a000-000000000005',
 '2026-02-18 10:00:00+00', '2026-02-18 10:00:00+00');


-- ==========================================================================
-- 6. INSERT REPLIES FOR NEW THREADS
--    Each thread gets 2-4 replies from different seed profiles + system.
--    Timestamps are offset from thread creation (hours to days later).
-- ==========================================================================

INSERT INTO community_replies
  (thread_id, author_id, body, author_type, seed_profile_id, created_at, updated_at)
VALUES

-- ---- T01: Seoul nightlife (3 replies) ----
('a0000001-0000-4000-8000-000000000001',
 '00000000-0000-0000-0000-000000000001',
 'Hongdae is super safe honestly. Korea in general is one of the safest places I''ve traveled. The whole area is buzzing until late and there are always people around. For chill bars try Yeonnam-dong, it''s right next to Hongdae but way more relaxed. Lots of cute wine bars and craft cocktail spots.',
 'seed', 'b1a2c3d4-6666-4000-a000-000000000006',
 '2026-01-25 16:00:00+00', '2026-01-25 16:00:00+00'),

('a0000001-0000-4000-8000-000000000001',
 '00000000-0000-0000-0000-000000000001',
 'Seoul is consistently rated one of the safest cities in Asia for solo women travelers. Hongdae, Itaewon, and Gangnam all have active nightlife scenes. Public transport runs late (subway until midnight, night buses after) so getting home is easy.',
 'system', NULL,
 '2026-01-25 18:30:00+00', '2026-01-25 18:30:00+00'),

('a0000001-0000-4000-8000-000000000001',
 '00000000-0000-0000-0000-000000000001',
 'Was just there in December. Hongdae felt completely fine at 2am. The convenience stores are open 24/7 and there are always people around. Itaewon has more of an international crowd if that''s your thing.',
 'seed', '6e999a3f-b53f-4902-b8b6-7674fd9c1f5a',
 '2026-01-26 03:15:00+00', '2026-01-26 03:15:00+00'),

-- ---- T02: Cape Town safety (3 replies) ----
('a0000002-0000-4000-8000-000000000002',
 '00000000-0000-0000-0000-000000000001',
 'I live here so I can give you the honest version. Cape Town is beautiful and totally doable solo, but you do need to be street smart. Stick to the City Bowl, Camps Bay, Sea Point, Woodstock during the day. Uber everywhere after dark, it''s cheap and reliable. Don''t walk alone at night, even in nicer areas. During the day the waterfront, Kirstenbosch, Lion''s Head are all perfectly fine.',
 'seed', 'b1a2c3d4-5555-4000-a000-000000000005',
 '2026-01-26 11:00:00+00', '2026-01-26 11:00:00+00'),

('a0000002-0000-4000-8000-000000000002',
 '00000000-0000-0000-0000-000000000001',
 'Cape Town has a well-established solo travel infrastructure. The V&A Waterfront, Camps Bay, and City Bowl are generally safe for daytime walking. We recommend using Uber or Bolt for transport, especially after sunset.',
 'system', NULL,
 '2026-01-26 14:00:00+00', '2026-01-26 14:00:00+00'),

('a0000002-0000-4000-8000-000000000002',
 '00000000-0000-0000-0000-000000000001',
 'Went last April for 2 weeks. Loved it. Used Uber for everything and never felt unsafe. Table Mountain was a highlight, did it with a group I met at my hostel. The wine region day trips are incredible and really easy to organize.',
 'seed', '87afafb7-3672-476b-acb0-8ed43af37aad',
 '2026-01-27 06:45:00+00', '2026-01-27 06:45:00+00'),

-- ---- T03: Osaka food (3 replies) ----
('a0000003-0000-4000-8000-000000000003',
 '00000000-0000-0000-0000-000000000001',
 'Seconding Tenma! That whole area under the train tracks is full of tiny izakayas. I sat at a counter in one that had maybe 8 seats and the owner was grilling yakitori right in front of me. One of my favorite meals ever.',
 'seed', '6e999a3f-b53f-4902-b8b6-7674fd9c1f5a',
 '2026-01-27 14:30:00+00', '2026-01-27 14:30:00+00'),

('a0000003-0000-4000-8000-000000000003',
 '00000000-0000-0000-0000-000000000001',
 'How did you handle the language barrier? I want to go to these local spots but I''m worried about ordering without English menus.',
 'seed', '62adbba4-98dc-468e-86ee-b82c5053aca3',
 '2026-01-28 02:00:00+00', '2026-01-28 02:00:00+00'),

('a0000003-0000-4000-8000-000000000003',
 '00000000-0000-0000-0000-000000000001',
 'Most places have picture menus or plastic food displays outside. And honestly, pointing works great. Japanese people are incredibly helpful even if there''s a language gap. Download Google Translate with the Japanese offline pack and you''ll be fine.',
 'seed', 'b1a2c3d4-3333-4000-a000-000000000003',
 '2026-01-28 08:15:00+00', '2026-01-28 08:15:00+00'),

-- ---- T04: Capsule hotels (3 replies) ----
('a0000004-0000-4000-8000-000000000004',
 '00000000-0000-0000-0000-000000000001',
 'This is really helpful, I was so curious about these. Is there enough space for a big backpack? And are the bathroom/shower facilities shared?',
 'seed', 'b1a2c3d4-2222-4000-a000-000000000002',
 '2026-01-28 20:00:00+00', '2026-01-28 20:00:00+00'),

('a0000004-0000-4000-8000-000000000004',
 '00000000-0000-0000-0000-000000000001',
 'Bathrooms are shared but they''re immaculate. Seriously cleaner than most hotel bathrooms I''ve used. There are big lockers for luggage, my 40L backpack fit with room to spare.',
 'seed', '87afafb7-3672-476b-acb0-8ed43af37aad',
 '2026-01-29 01:30:00+00', '2026-01-29 01:30:00+00'),

('a0000004-0000-4000-8000-000000000004',
 '00000000-0000-0000-0000-000000000001',
 'Women-only capsule hotels and women-only floors are widely available in major Japanese cities. Popular chains include Nine Hours, First Cabin (more spacious), and The Millennials. Prices typically range from 3,000 to 5,000 yen per night.',
 'system', NULL,
 '2026-01-29 06:00:00+00', '2026-01-29 06:00:00+00'),

-- ---- T05: Hoi An tailoring (3 replies) ----
('a0000005-0000-4000-8000-000000000005',
 '00000000-0000-0000-0000-000000000001',
 'Which shop did you go to? I''ve been wanting to do this but there are literally hundreds to choose from and I don''t want to waste time on a bad one.',
 'seed', 'a241e1e0-c352-44e0-b3a7-afb1f48e6924',
 '2026-01-29 12:00:00+00', '2026-01-29 12:00:00+00'),

('a0000005-0000-4000-8000-000000000005',
 '00000000-0000-0000-0000-000000000001',
 'I used Yaly Couture for the blazer (pricier but excellent quality) and a smaller shop called Be Be for the dresses. Ask your hostel for recommendations too, the locals always know the best ones.',
 'seed', '62adbba4-98dc-468e-86ee-b82c5053aca3',
 '2026-01-29 15:45:00+00', '2026-01-29 15:45:00+00'),

('a0000005-0000-4000-8000-000000000005',
 '00000000-0000-0000-0000-000000000001',
 'Did this last year. Totally agree on the side streets tip. Also bring your own buttons or zippers if you want specific hardware. The shop I went to only had pretty basic options.',
 'seed', 'af79b359-43c8-47f8-b3cd-d6800c9d8681',
 '2026-01-30 09:00:00+00', '2026-01-30 09:00:00+00'),

-- ---- T06: Da Lat (3 replies) ----
('a0000006-0000-4000-8000-000000000006',
 '00000000-0000-0000-0000-000000000001',
 'I keep hearing about Da Lat! Was it easy to get around on your own? Did you rent a motorbike or use Grab?',
 'seed', '62adbba4-98dc-468e-86ee-b82c5053aca3',
 '2026-01-30 18:00:00+00', '2026-01-30 18:00:00+00'),

('a0000006-0000-4000-8000-000000000006',
 '00000000-0000-0000-0000-000000000001',
 'I used Grab for most things. The city is small enough that rides are really cheap. Some people rent motorbikes but the mountain roads can be intense if you''re not experienced. I did a canyoning day trip which was amazing, the tour company picks you up.',
 'seed', '6e999a3f-b53f-4902-b8b6-7674fd9c1f5a',
 '2026-01-31 02:30:00+00', '2026-01-31 02:30:00+00'),

('a0000006-0000-4000-8000-000000000006',
 '00000000-0000-0000-0000-000000000001',
 'Da Lat is so underrated. The coffee scene there is world class. Try the egg coffee and the weasel coffee if you''re feeling adventurous.',
 'seed', 'b1a2c3d4-1111-4000-a000-000000000001',
 '2026-01-31 07:15:00+00', '2026-01-31 07:15:00+00'),

-- ---- T07: Pai (3 replies) ----
('a0000007-0000-4000-8000-000000000007',
 '00000000-0000-0000-0000-000000000001',
 'A week in Pai is perfect if you want to slow down. There''s a great hot springs, Pai Canyon for sunset, the White Buddha viewpoint, and tons of waterfalls within scooter distance. Plus the food scene is surprisingly good. I stayed 10 days on my first visit and didn''t get bored.',
 'seed', 'af79b359-43c8-47f8-b3cd-d6800c9d8681',
 '2026-01-31 14:00:00+00', '2026-01-31 14:00:00+00'),

('a0000007-0000-4000-8000-000000000007',
 '00000000-0000-0000-0000-000000000001',
 'Pai is a popular wellness and nature destination about 3 hours north of Chiang Mai. The town is small but surrounded by natural attractions. Many solo women stay for extended periods for yoga retreats and the relaxed atmosphere.',
 'system', NULL,
 '2026-02-01 06:00:00+00', '2026-02-01 06:00:00+00'),

('a0000007-0000-4000-8000-000000000007',
 '00000000-0000-0000-0000-000000000001',
 'I actually ended up spending 2 weeks there last year. Rented a little bungalow for $15/night. Did yoga every morning, explored a different waterfall or viewpoint each day, read a lot of books. It''s exactly the kind of place where time stops mattering.',
 'seed', 'a241e1e0-c352-44e0-b3a7-afb1f48e6924',
 '2026-02-01 12:30:00+00', '2026-02-01 12:30:00+00'),

-- ---- T08: Koh Phangan (3 replies) ----
('a0000008-0000-4000-8000-000000000008',
 '00000000-0000-0000-0000-000000000001',
 'This is so good to know! I crossed it off my list because of the party reputation. How did you get there and how long did you stay?',
 'seed', '87afafb7-3672-476b-acb0-8ed43af37aad',
 '2026-02-01 20:00:00+00', '2026-02-01 20:00:00+00'),

('a0000008-0000-4000-8000-000000000008',
 '00000000-0000-0000-0000-000000000001',
 'Ferry from Surat Thani, about 2.5 hours. Stayed 5 days. There''s a great coworking space called Beachub if you need wifi. The Sunday night market in Thong Sala is really nice too.',
 'seed', 'af79b359-43c8-47f8-b3cd-d6800c9d8681',
 '2026-02-02 03:45:00+00', '2026-02-02 03:45:00+00'),

('a0000008-0000-4000-8000-000000000008',
 '00000000-0000-0000-0000-000000000001',
 'The yoga scene on Koh Phangan is actually one of the best in Thailand. Orion Healing Center and Wonderland are both amazing for multi-day retreats.',
 'seed', 'a241e1e0-c352-44e0-b3a7-afb1f48e6924',
 '2026-02-02 10:15:00+00', '2026-02-02 10:15:00+00'),

-- ---- T09: Night train BKK-CM (3 replies) ----
('a0000009-0000-4000-8000-000000000009',
 '00000000-0000-0000-0000-000000000001',
 'Did you feel safe as a solo woman? Were there other solo travelers on the train?',
 'seed', 'b1a2c3d4-2222-4000-a000-000000000002',
 '2026-02-02 12:00:00+00', '2026-02-02 12:00:00+00'),

('a0000009-0000-4000-8000-000000000009',
 '00000000-0000-0000-0000-000000000001',
 'Totally safe. There were actually quite a few solo women on my train. The attendants are helpful and check tickets, so you know everyone is supposed to be there. The curtain gives you full privacy. I''d do it again over flying honestly, saves a night of accommodation too.',
 'seed', '6e999a3f-b53f-4902-b8b6-7674fd9c1f5a',
 '2026-02-02 18:30:00+00', '2026-02-02 18:30:00+00'),

('a0000009-0000-4000-8000-000000000009',
 '00000000-0000-0000-0000-000000000001',
 'The Bangkok to Chiang Mai night train is a popular option for solo travelers. Second class sleeper berths range from 800 to 1,200 baht ($22-35). Tickets can be purchased at Hua Lamphong station or online via 12go.asia.',
 'system', NULL,
 '2026-02-03 04:00:00+00', '2026-02-03 04:00:00+00'),

-- ---- T10: Fes medina (3 replies) ----
('a0000010-0000-4000-8000-000000000010',
 '00000000-0000-0000-0000-000000000001',
 'How did people treat you as a solo woman? I''ve heard really mixed things about Morocco for women traveling alone.',
 'seed', 'b1a2c3d4-2222-4000-a000-000000000002',
 '2026-02-03 16:00:00+00', '2026-02-03 16:00:00+00'),

('a0000010-0000-4000-8000-000000000010',
 '00000000-0000-0000-0000-000000000001',
 'Honestly, you''ll get some attention. Catcalling happens, especially in touristy areas. But I never felt unsafe. Dress modestly (cover shoulders and knees), walk with purpose, and don''t engage with people who are being pushy. Most Moroccans are genuinely welcoming. The harassment is annoying but manageable.',
 'seed', 'b1a2c3d4-4444-4000-a000-000000000004',
 '2026-02-04 01:00:00+00', '2026-02-04 01:00:00+00'),

('a0000010-0000-4000-8000-000000000010',
 '00000000-0000-0000-0000-000000000001',
 'Fes has one of the largest car-free urban areas in the world. The medina is a UNESCO World Heritage site with over 9,000 streets. For first-time visitors, we recommend hiring a licensed guide for orientation on day one.',
 'system', NULL,
 '2026-02-04 06:30:00+00', '2026-02-04 06:30:00+00'),

-- ---- T11: Morocco tips (3 replies) ----
('a0000011-0000-4000-8000-000000000011',
 '00000000-0000-0000-0000-000000000001',
 'Great list. I''d add: learn a few words of Darija (Moroccan Arabic). Even just "shukran" (thank you) and "la" (no) go a long way. French is widely spoken too if you have any.',
 'seed', 'b1a2c3d4-4444-4000-a000-000000000004',
 '2026-02-04 14:00:00+00', '2026-02-04 14:00:00+00'),

('a0000011-0000-4000-8000-000000000011',
 '00000000-0000-0000-0000-000000000001',
 'The Ramadan tip is so important. I was there during Ramadan and finding lunch was a real mission. But iftar (the evening meal) was an incredible experience. Some riads host communal iftar dinners which are beautiful.',
 'seed', '87afafb7-3672-476b-acb0-8ed43af37aad',
 '2026-02-05 02:30:00+00', '2026-02-05 02:30:00+00'),

('a0000011-0000-4000-8000-000000000011',
 '00000000-0000-0000-0000-000000000001',
 'How was Essaouira? I''m going to Morocco next month and trying to decide if I should include it or stick to Marrakech and Fes.',
 'seed', 'b1a2c3d4-5555-4000-a000-000000000005',
 '2026-02-05 10:00:00+00', '2026-02-05 10:00:00+00'),

-- ---- T12: El Nido (3 replies) ----
('a0000012-0000-4000-8000-000000000012',
 '00000000-0000-0000-0000-000000000001',
 'Tour C is so underrated! The swimming spot at Secret Beach where you have to squeeze through a crack in the limestone wall? Unreal.',
 'seed', 'b1a2c3d4-1111-4000-a000-000000000001',
 '2026-02-05 18:00:00+00', '2026-02-05 18:00:00+00'),

('a0000012-0000-4000-8000-000000000012',
 '00000000-0000-0000-0000-000000000001',
 'Did you stay in El Nido town or Nacpan? I''ve heard Nacpan Beach area is quieter and has better accommodation.',
 'seed', 'af79b359-43c8-47f8-b3cd-d6800c9d8681',
 '2026-02-06 03:00:00+00', '2026-02-06 03:00:00+00'),

('a0000012-0000-4000-8000-000000000012',
 '00000000-0000-0000-0000-000000000001',
 'I stayed in town for convenience but a girl I met moved to Nacpan after 2 days and said it was way better. Fewer tourists, cheaper rooms, and Nacpan Beach is apparently one of the best in the Philippines.',
 'seed', '87afafb7-3672-476b-acb0-8ed43af37aad',
 '2026-02-06 09:30:00+00', '2026-02-06 09:30:00+00'),

-- ---- T13: Bohol (3 replies) ----
('a0000013-0000-4000-8000-000000000013',
 '00000000-0000-0000-0000-000000000001',
 'Definitely stay overnight if you can. The day trip is rushed and you miss the best parts. Alona Beach is worth a night, the sunset is gorgeous, and you can do the firefly river cruise which you''d miss on a day trip.',
 'seed', 'b1a2c3d4-1111-4000-a000-000000000001',
 '2026-02-06 15:00:00+00', '2026-02-06 15:00:00+00'),

('a0000013-0000-4000-8000-000000000013',
 '00000000-0000-0000-0000-000000000001',
 'I did it as a day trip and kind of regretted it. The ferry is 2 hours each way, then you''re trying to fit the Chocolate Hills, tarsier sanctuary, and a river cruise into like 5 hours. Doable but exhausting. If you only have 2 days I''d say go for the overnight.',
 'seed', '87afafb7-3672-476b-acb0-8ed43af37aad',
 '2026-02-07 01:15:00+00', '2026-02-07 01:15:00+00'),

('a0000013-0000-4000-8000-000000000013',
 '00000000-0000-0000-0000-000000000001',
 'The Cebu to Bohol ferry takes approximately 2 hours. Fast ferries (Ocean Jet, SuperCat) depart from Pier 1 in Cebu City. Tickets cost around 500-800 pesos one way. Bohol attractions are spread out so having a full day is recommended.',
 'system', NULL,
 '2026-02-07 06:00:00+00', '2026-02-07 06:00:00+00'),

-- ---- T14: Kampot (3 replies) ----
('a0000014-0000-4000-8000-000000000014',
 '00000000-0000-0000-0000-000000000001',
 'Kampot was the highlight of my Cambodia trip. The sunset over the river from the Rusty Keyhole bar is something else. Also the abandoned Bokor Hill Station is a wild day trip.',
 'seed', '62adbba4-98dc-468e-86ee-b82c5053aca3',
 '2026-02-07 14:00:00+00', '2026-02-07 14:00:00+00'),

('a0000014-0000-4000-8000-000000000014',
 '00000000-0000-0000-0000-000000000001',
 'Is it safe for solo women? Cambodia generally feels pretty safe to me but I''ve only been to Siem Reap and Phnom Penh.',
 'seed', '6e999a3f-b53f-4902-b8b6-7674fd9c1f5a',
 '2026-02-08 02:00:00+00', '2026-02-08 02:00:00+00'),

('a0000014-0000-4000-8000-000000000014',
 '00000000-0000-0000-0000-000000000001',
 'Kampot is generally considered very safe for solo travelers. The town is small and walkable, and the expat community is welcoming. It''s a popular base for visiting Kep, the coast, and Bokor National Park.',
 'system', NULL,
 '2026-02-08 08:00:00+00', '2026-02-08 08:00:00+00'),

-- ---- T15: Taipei night markets (3 replies) ----
('a0000015-0000-4000-8000-000000000015',
 '00000000-0000-0000-0000-000000000001',
 'Stinky tofu?? How stinky are we talking? I''m curious but also scared lol',
 'seed', 'b1a2c3d4-2222-4000-a000-000000000002',
 '2026-02-08 21:00:00+00', '2026-02-08 21:00:00+00'),

('a0000015-0000-4000-8000-000000000015',
 '00000000-0000-0000-0000-000000000001',
 'It smells way worse than it tastes honestly. The fried version is crispy on the outside and soft inside. Start with the fried kind before you try the fermented soup version. You''ll probably end up loving it.',
 'seed', '6e999a3f-b53f-4902-b8b6-7674fd9c1f5a',
 '2026-02-09 03:00:00+00', '2026-02-09 03:00:00+00'),

('a0000015-0000-4000-8000-000000000015',
 '00000000-0000-0000-0000-000000000001',
 'Taipei is so similar to Japanese night market culture but even better because everything is ridiculously cheap. I went last year and ate at Raohe every single night.',
 'seed', 'b1a2c3d4-3333-4000-a000-000000000003',
 '2026-02-09 08:30:00+00', '2026-02-09 08:30:00+00'),

-- ---- T16: Canggu vs Ubud (3 replies) ----
('a0000016-0000-4000-8000-000000000016',
 '00000000-0000-0000-0000-000000000001',
 'I''ve lived in Ubud for over a year working remotely. The wifi is solid at most cafes and coworking spaces. Outpost and Hubud are both reliable. Ubud is quieter, cheaper, and the surroundings are beautiful. If you need a social scene you might prefer Canggu but personally I find Canggu too chaotic now.',
 'seed', 'a241e1e0-c352-44e0-b3a7-afb1f48e6924',
 '2026-02-09 15:00:00+00', '2026-02-09 15:00:00+00'),

('a0000016-0000-4000-8000-000000000016',
 '00000000-0000-0000-0000-000000000001',
 'Did a month in each. Canggu if you want to surf, party, and meet other nomads. Ubud if you want peace, yoga, and to actually get work done. My productivity was way higher in Ubud.',
 'seed', 'af79b359-43c8-47f8-b3cd-d6800c9d8681',
 '2026-02-10 01:00:00+00', '2026-02-10 01:00:00+00'),

('a0000016-0000-4000-8000-000000000016',
 '00000000-0000-0000-0000-000000000001',
 'This is really helpful, thanks both. I think I might do 2 weeks each and see which one clicks. Is it easy to find monthly rentals or should I book ahead?',
 'seed', 'b1a2c3d4-1111-4000-a000-000000000001',
 '2026-02-10 06:45:00+00', '2026-02-10 06:45:00+00'),

-- ---- T17: Sossusvlei (3 replies) ----
('a0000017-0000-4000-8000-000000000017',
 '00000000-0000-0000-0000-000000000001',
 'You pretty much need a car for Sossusvlei. The park is in the middle of the desert, no public transport. But renting a car in Namibia is straightforward and the roads are good. You don''t need 4WD for most of the drive, just for the last 5km to the dunes (there''s a shuttle for that part). I drove from Windhoek, about 4.5 hours. Stop at Solitaire on the way for the best apple pie in Africa, not even joking.',
 'seed', 'b1a2c3d4-5555-4000-a000-000000000005',
 '2026-02-10 14:00:00+00', '2026-02-10 14:00:00+00'),

('a0000017-0000-4000-8000-000000000017',
 '00000000-0000-0000-0000-000000000001',
 'Sossusvlei is located within the Namib-Naukluft National Park. Self-drive is the most common option for independent travelers. Car rentals in Windhoek start from around $35/day. The park gates open at sunrise, which is the best time for photography.',
 'system', NULL,
 '2026-02-10 20:00:00+00', '2026-02-10 20:00:00+00'),

('a0000017-0000-4000-8000-000000000017',
 '00000000-0000-0000-0000-000000000001',
 'I found a ride on a backpacker group on Facebook. Someone had extra seats in their rental car and we split the costs. Check the Namibia Backpackers group, people post ride shares all the time.',
 'seed', '87afafb7-3672-476b-acb0-8ed43af37aad',
 '2026-02-11 08:00:00+00', '2026-02-11 08:00:00+00'),

-- ---- T18: Travel insurance (3 replies) ----
('a0000018-0000-4000-8000-000000000018',
 '00000000-0000-0000-0000-000000000001',
 'The motorbike thing is so important. My friend crashed a scooter in Bali and her basic policy didn''t cover it because she didn''t have a motorbike license. She ended up paying $3,000 out of pocket for the hospital.',
 'seed', 'b1a2c3d4-2222-4000-a000-000000000002',
 '2026-02-11 17:00:00+00', '2026-02-11 17:00:00+00'),

('a0000018-0000-4000-8000-000000000018',
 '00000000-0000-0000-0000-000000000001',
 'SafetyWing is great for the price. I''ve been on their Nomad Insurance for 18 months now. Had to use it once for a clinic visit in Vietnam and the claim was processed in about a week.',
 'seed', '6e999a3f-b53f-4902-b8b6-7674fd9c1f5a',
 '2026-02-12 04:30:00+00', '2026-02-12 04:30:00+00'),

('a0000018-0000-4000-8000-000000000018',
 '00000000-0000-0000-0000-000000000001',
 'Adding to this: if you''re doing adventure activities like diving, climbing, or safari, make sure your policy covers them. A lot of base policies exclude "extreme sports" and diving sometimes falls under that category.',
 'seed', 'b1a2c3d4-5555-4000-a000-000000000005',
 '2026-02-12 11:00:00+00', '2026-02-12 11:00:00+00'),

-- ---- T19: Loneliness (4 replies) ----
('a0000019-0000-4000-8000-000000000019',
 '00000000-0000-0000-0000-000000000001',
 'This is so honest and I think every solo traveler goes through it. What helped me was having a routine for those moments. I journal every evening, even just a few sentences about the day. It turns that lonely reflection time into something intentional. Also calling someone from home, even for 10 minutes, can totally reset your mood.',
 'seed', '62adbba4-98dc-468e-86ee-b82c5053aca3',
 '2026-02-13 02:00:00+00', '2026-02-13 02:00:00+00'),

('a0000019-0000-4000-8000-000000000019',
 '00000000-0000-0000-0000-000000000001',
 'I''ve been traveling on and off for years and the loneliness doesn''t fully go away. But I''ve learned it comes in waves and always passes. Something that helps me is going to the same cafe regularly. You start recognizing faces, the staff remembers your order, and it gives you a sense of belonging even in a new place.',
 'seed', 'a241e1e0-c352-44e0-b3a7-afb1f48e6924',
 '2026-02-13 09:00:00+00', '2026-02-13 09:00:00+00'),

('a0000019-0000-4000-8000-000000000019',
 '00000000-0000-0000-0000-000000000001',
 'For me it was accepting that some days will just be like that. Not every day of solo travel is Instagram-worthy. On my lonely days I give myself permission to stay in, watch a movie, order delivery, and just rest. There''s no rule that says you have to be exploring 24/7.',
 'seed', '87afafb7-3672-476b-acb0-8ed43af37aad',
 '2026-02-13 15:45:00+00', '2026-02-13 15:45:00+00'),

('a0000019-0000-4000-8000-000000000019',
 '00000000-0000-0000-0000-000000000001',
 'Honestly? I go to a bar, sit at the counter, and start chatting with whoever''s next to me. But I know that''s not everyone''s style. Hostels with common areas are great for this too, even if you have a private room.',
 'seed', 'af79b359-43c8-47f8-b3cd-d6800c9d8681',
 '2026-02-14 01:00:00+00', '2026-02-14 01:00:00+00'),

-- ---- T20: Packing list (3 replies) ----
('a0000020-0000-4000-8000-000000000020',
 '00000000-0000-0000-0000-000000000001',
 'The sarong tip is gold. I use mine literally every day for something. Also adding: bring a reusable water bottle with a filter. Saves so much money and plastic.',
 'seed', '6e999a3f-b53f-4902-b8b6-7674fd9c1f5a',
 '2026-02-13 16:00:00+00', '2026-02-13 16:00:00+00'),

('a0000020-0000-4000-8000-000000000020',
 '00000000-0000-0000-0000-000000000001',
 'I''d add a money belt or hidden pouch. Not because of theft necessarily but for peace of mind on overnight buses and trains. Also earplugs and an eye mask are essential if you''re doing hostels.',
 'seed', '87afafb7-3672-476b-acb0-8ed43af37aad',
 '2026-02-14 03:00:00+00', '2026-02-14 03:00:00+00'),

('a0000020-0000-4000-8000-000000000020',
 '00000000-0000-0000-0000-000000000001',
 'This is basically my exact list haha. Only thing I''d add is a dry bag for boat trips and rainy season. A small one that fits your phone and wallet is enough.',
 'seed', 'af79b359-43c8-47f8-b3cd-d6800c9d8681',
 '2026-02-14 09:30:00+00', '2026-02-14 09:30:00+00'),

-- ---- T21: Jimjilbangs (3 replies) ----
('a0000021-0000-4000-8000-000000000021',
 '00000000-0000-0000-0000-000000000001',
 'Wait, you can sleep there? Like overnight? That would save so much on accommodation.',
 'seed', 'b1a2c3d4-2222-4000-a000-000000000002',
 '2026-02-14 14:00:00+00', '2026-02-14 14:00:00+00'),

('a0000021-0000-4000-8000-000000000021',
 '00000000-0000-0000-0000-000000000001',
 'Yes! A lot of budget travelers use them as a cheap overnight option. Dragon Hill Spa is 24 hours and the sleeping rooms are actually comfortable. About 12,000 won ($9) for entry. Not the best sleep of your life but totally fine for a night or two.',
 'seed', 'b1a2c3d4-6666-4000-a000-000000000006',
 '2026-02-14 20:30:00+00', '2026-02-14 20:30:00+00'),

('a0000021-0000-4000-8000-000000000021',
 '00000000-0000-0000-0000-000000000001',
 'We have something similar in Japan called sento and onsen. The Korean ones are even more elaborate though. Dragon Hill Spa is on my list for my next Seoul trip.',
 'seed', 'b1a2c3d4-3333-4000-a000-000000000003',
 '2026-02-15 07:00:00+00', '2026-02-15 07:00:00+00'),

-- ---- T22: Porto vs Lisbon (3 replies) ----
('a0000022-0000-4000-8000-000000000022',
 '00000000-0000-0000-0000-000000000001',
 'Porto all the way. It''s smaller, easier to navigate, and the food scene is incredible for the price. The Ribeira area along the river is gorgeous. And the port wine cellars in Vila Nova de Gaia are a perfect solo afternoon. You just show up, do a tasting, and chat with other visitors.',
 'seed', 'b1a2c3d4-2222-4000-a000-000000000002',
 '2026-02-15 18:00:00+00', '2026-02-15 18:00:00+00'),

('a0000022-0000-4000-8000-000000000022',
 '00000000-0000-0000-0000-000000000001',
 'I actually prefer Lisbon for solo travel. More neighborhoods to explore, better nightlife, and the day trip options are amazing (Sintra, Cascais). But Porto is more charming and way cheaper. Honestly you can''t go wrong with either.',
 'seed', 'b1a2c3d4-4444-4000-a000-000000000004',
 '2026-02-16 02:00:00+00', '2026-02-16 02:00:00+00'),

('a0000022-0000-4000-8000-000000000022',
 '00000000-0000-0000-0000-000000000001',
 'Both Porto and Lisbon are consistently ranked among the safest cities in Europe for solo women travelers. Porto is more compact and budget-friendly, while Lisbon offers more variety in neighborhoods and activities. The train between the two takes about 3 hours if you want to visit both.',
 'system', NULL,
 '2026-02-16 08:00:00+00', '2026-02-16 08:00:00+00'),

-- ---- T23: Yogyakarta (3 replies) ----
('a0000023-0000-4000-8000-000000000023',
 '00000000-0000-0000-0000-000000000001',
 'The sunrise at Borobudur is no joke. I''ve been 3 times and it still gives me chills. Pro tip: climb to the top level first before the crowds catch up. The stupas with the Buddha statues peeking through are at the top.',
 'seed', 'b1a2c3d4-1111-4000-a000-000000000001',
 '2026-02-16 11:00:00+00', '2026-02-16 11:00:00+00'),

('a0000023-0000-4000-8000-000000000023',
 '00000000-0000-0000-0000-000000000001',
 'How''s Yogyakarta as a base? I''m thinking of spending a few days there. Is it walkable or do you need transport everywhere?',
 'seed', '6e999a3f-b53f-4902-b8b6-7674fd9c1f5a',
 '2026-02-16 20:00:00+00', '2026-02-16 20:00:00+00'),

('a0000023-0000-4000-8000-000000000023',
 '00000000-0000-0000-0000-000000000001',
 'Yogya is great! The city center around Malioboro is walkable. For anything further use Grab or the Trans Jogja buses. I stayed at a small guesthouse in Prawirotaman which is the backpacker/cafe area. Really nice atmosphere, lots of solo travelers.',
 'seed', 'a241e1e0-c352-44e0-b3a7-afb1f48e6924',
 '2026-02-17 06:00:00+00', '2026-02-17 06:00:00+00'),

-- ---- T24: Chefchaouen (3 replies) ----
('a0000024-0000-4000-8000-000000000024',
 '00000000-0000-0000-0000-000000000001',
 'The photos always look so surreal. Is it really that blue in person?',
 'seed', 'b1a2c3d4-2222-4000-a000-000000000002',
 '2026-02-17 20:00:00+00', '2026-02-17 20:00:00+00'),

('a0000024-0000-4000-8000-000000000024',
 '00000000-0000-0000-0000-000000000001',
 'Even more blue in person honestly. And it''s not just the main streets, the whole residential area is painted blue too. Early morning before the day-trippers arrive is magical.',
 'seed', 'b1a2c3d4-4444-4000-a000-000000000004',
 '2026-02-18 03:00:00+00', '2026-02-18 03:00:00+00'),

('a0000024-0000-4000-8000-000000000024',
 '00000000-0000-0000-0000-000000000001',
 'I went last November and it was perfect weather. The Spanish Mosque hike is a must. Bring a picnic and watch sunset from up there.',
 'seed', '62adbba4-98dc-468e-86ee-b82c5053aca3',
 '2026-02-18 10:30:00+00', '2026-02-18 10:30:00+00'),

-- ---- T25: Windhoek (3 replies) ----
('a0000025-0000-4000-8000-000000000025',
 '00000000-0000-0000-0000-000000000001',
 'Windhoek is nice but I''d say 1 day max. Walk around the Christuskirche area, check out the craft market, have a meal at Joe''s Beerhouse (it''s a Namibian institution). Then head out to the landscapes because that''s the real draw. The drive to Sossusvlei or Swakopmund is scenic and worth doing in daylight.',
 'seed', 'b1a2c3d4-5555-4000-a000-000000000005',
 '2026-02-18 15:00:00+00', '2026-02-18 15:00:00+00'),

('a0000025-0000-4000-8000-000000000025',
 '00000000-0000-0000-0000-000000000001',
 'Windhoek is a safe and walkable capital city. Key sights include Independence Memorial Museum, Christuskirche, and the Old Brewery Craft Market. Most travelers use it as a starting point for Namibia''s natural attractions. Car rental offices at the airport make pickup easy on arrival.',
 'system', NULL,
 '2026-02-19 02:00:00+00', '2026-02-19 02:00:00+00'),

('a0000025-0000-4000-8000-000000000025',
 '00000000-0000-0000-0000-000000000001',
 'I spent one night in Windhoek on arrival to recover from jet lag and then drove to Swakopmund the next morning. That felt like the right amount of time.',
 'seed', '87afafb7-3672-476b-acb0-8ed43af37aad',
 '2026-02-19 08:00:00+00', '2026-02-19 08:00:00+00');


-- ==========================================================================
-- 7. RECALCULATE reply_count ON ALL THREADS
--    Safety net in case triggers missed any counts
-- ==========================================================================

UPDATE community_threads t
SET reply_count = (
  SELECT COUNT(*)
  FROM community_replies r
  WHERE r.thread_id = t.id AND r.status = 'active'
);

-- ==========================================================================
-- 8. UPDATE updated_at ON THREADS THAT HAVE REPLIES
--    So they sort correctly in the feed
-- ==========================================================================

UPDATE community_threads t
SET updated_at = COALESCE(
  (SELECT MAX(r.created_at)
   FROM community_replies r
   WHERE r.thread_id = t.id AND r.status = 'active'),
  t.created_at
);

COMMIT;
