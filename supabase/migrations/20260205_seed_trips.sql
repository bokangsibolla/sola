-- ============================================================
-- SEED: Demo trips for development
-- Uses the same demo user UUIDs from seed_demo_travelers
-- ============================================================

-- Aisha's trip (active, in Chiang Mai now)
INSERT INTO trips (id, user_id, destination_city_id, destination_name, country_iso2, title, arriving, leaving, nights, status, privacy_level, matching_opt_in, travel_style_tags, notes)
VALUES (
  '11111111-aaaa-1111-aaaa-111111111111',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM cities WHERE slug = 'chiang-mai' LIMIT 1),
  'Chiang Mai',
  'TH',
  'Northern Thailand Solo',
  '2026-01-28',
  '2026-02-15',
  18,
  'active',
  'private',
  true,
  ARRAY['calm', 'nature', 'cultural'],
  'Documenting hill tribe communities for my next project'
);

-- Aisha's trip stop
INSERT INTO trip_stops (trip_id, stop_order, country_iso2, city_id, city_name, start_date, end_date)
VALUES (
  '11111111-aaaa-1111-aaaa-111111111111',
  0,
  'TH',
  (SELECT id FROM cities WHERE slug = 'chiang-mai' LIMIT 1),
  'Chiang Mai',
  '2026-01-28',
  '2026-02-15'
);

-- Aisha's journal entries
INSERT INTO trip_entries (trip_id, user_id, entry_type, title, body, location_name, mood_tag, visibility, created_at)
VALUES
  ('11111111-aaaa-1111-aaaa-111111111111', '00000000-0000-0000-0000-000000000001', 'arrival', 'Arrived in Chiang Mai', 'The old city is beautiful at night. Found a great guesthouse near Tha Phae Gate.', 'Chiang Mai Old City', 'happy', 'private', '2026-01-28T14:00:00Z'),
  ('11111111-aaaa-1111-aaaa-111111111111', '00000000-0000-0000-0000-000000000001', 'note', 'Sunday Walking Street', 'Incredible market along Ratchadamnoen Road. Felt completely safe walking solo. Great street food and handmade jewelry.', 'Ratchadamnoen Road', 'happy', 'private', '2026-02-02T18:00:00Z'),
  ('11111111-aaaa-1111-aaaa-111111111111', '00000000-0000-0000-0000-000000000001', 'comfort_check', NULL, NULL, 'Chiang Mai Old City', 'calm', 'private', '2026-02-03T09:00:00Z'),
  ('11111111-aaaa-1111-aaaa-111111111111', '00000000-0000-0000-0000-000000000001', 'tip', 'Songthaew tip', 'Red trucks (songthaews) cost 30 baht per person inside the old city. Always agree on the price before getting in. Solo women — stick to the red ones, not the private ones at night.', 'Chiang Mai', NULL, 'private', '2026-02-04T10:00:00Z'),
  ('11111111-aaaa-1111-aaaa-111111111111', '00000000-0000-0000-0000-000000000001', 'highlight', 'Doi Suthep sunrise', 'Woke up at 5am to catch the sunrise from Doi Suthep temple. Worth every sleepy minute. The monks were doing morning prayers.', 'Doi Suthep', 'happy', 'private', '2026-02-05T06:30:00Z');

-- Mei's trip (planned, upcoming to Hanoi)
INSERT INTO trips (id, user_id, destination_city_id, destination_name, country_iso2, title, arriving, leaving, nights, status, privacy_level, matching_opt_in, travel_style_tags)
VALUES (
  '22222222-bbbb-2222-bbbb-222222222222',
  '00000000-0000-0000-0000-000000000002',
  (SELECT id FROM cities WHERE slug = 'hanoi' LIMIT 1),
  'Hanoi',
  'VN',
  'Vietnam Food Journey',
  '2026-02-20',
  '2026-03-05',
  13,
  'planned',
  'private',
  true,
  ARRAY['social', 'food', 'cultural']
);

INSERT INTO trip_stops (trip_id, stop_order, country_iso2, city_id, city_name, start_date, end_date)
VALUES
  ('22222222-bbbb-2222-bbbb-222222222222', 0, 'VN', (SELECT id FROM cities WHERE slug = 'hanoi' LIMIT 1), 'Hanoi', '2026-02-20', '2026-02-27'),
  ('22222222-bbbb-2222-bbbb-222222222222', 1, 'VN', (SELECT id FROM cities WHERE slug = 'hoi-an' LIMIT 1), 'Hoi An', '2026-02-27', '2026-03-05');

-- Sofia's trip (completed, past)
INSERT INTO trips (id, user_id, destination_city_id, destination_name, country_iso2, title, arriving, leaving, nights, status, privacy_level, matching_opt_in, travel_style_tags, notes)
VALUES (
  '33333333-cccc-3333-cccc-333333333333',
  '00000000-0000-0000-0000-000000000003',
  (SELECT id FROM cities WHERE slug = 'ubud' LIMIT 1),
  'Ubud',
  'ID',
  'Bali Wellness Retreat',
  '2026-01-05',
  '2026-01-20',
  15,
  'completed',
  'private',
  false,
  ARRAY['calm', 'wellness', 'nature'],
  'Best two weeks of the year. The rice terraces changed something in me.'
);

INSERT INTO trip_stops (trip_id, stop_order, country_iso2, city_id, city_name, start_date, end_date)
VALUES (
  '33333333-cccc-3333-cccc-333333333333',
  0,
  'ID',
  (SELECT id FROM cities WHERE slug = 'ubud' LIMIT 1),
  'Ubud',
  '2026-01-05',
  '2026-01-20'
);

-- Sofia's completed journal
INSERT INTO trip_entries (trip_id, user_id, entry_type, title, body, location_name, mood_tag, visibility, created_at)
VALUES
  ('33333333-cccc-3333-cccc-333333333333', '00000000-0000-0000-0000-000000000003', 'arrival', 'Hello Bali', 'The humidity hit me like a wall but the smell of incense and frangipani made up for it.', 'Ubud', 'happy', 'private', '2026-01-05T11:00:00Z'),
  ('33333333-cccc-3333-cccc-333333333333', '00000000-0000-0000-0000-000000000003', 'stay', 'Bamboo Indah', 'Staying in one of the bamboo houses. It feels like sleeping in a treehouse. The river sounds lull you to sleep.', 'Bamboo Indah, Ubud', 'calm', 'private', '2026-01-06T08:00:00Z'),
  ('33333333-cccc-3333-cccc-333333333333', '00000000-0000-0000-0000-000000000003', 'highlight', 'Tegallalang Rice Terraces', 'Walked through the terraces at golden hour. No words needed.', 'Tegallalang', 'happy', 'private', '2026-01-10T16:30:00Z'),
  ('33333333-cccc-3333-cccc-333333333333', '00000000-0000-0000-0000-000000000003', 'comfort_check', NULL, NULL, 'Ubud', 'calm', 'private', '2026-01-12T20:00:00Z'),
  ('33333333-cccc-3333-cccc-333333333333', '00000000-0000-0000-0000-000000000003', 'tip', 'Scooter rental', 'Rent from your guesthouse, not the street guys. Women traveling solo — avoid riding at night on the monkey forest road, it gets very dark and there are no lights.', 'Ubud', NULL, 'private', '2026-01-15T11:00:00Z');
