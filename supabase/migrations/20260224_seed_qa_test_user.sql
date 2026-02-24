-- ============================================================
-- QA TEST USER SEED
-- Creates a dedicated test account for automated QA testing.
-- Safe to re-run (uses ON CONFLICT / IF NOT EXISTS).
-- ============================================================

-- NOTE: The test user must be created in Supabase Auth FIRST via the dashboard
-- or Supabase Admin API, since we can't insert into auth.users directly from SQL.
--
-- Steps to create the auth user (one-time, manual):
--   1. Go to Supabase Dashboard → Authentication → Users
--   2. Click "Add User" → "Create User"
--   3. Email: sola-tester@test.com
--   4. Password: SolaQA2026!test
--   5. Check "Auto Confirm User" (skip email verification)
--   6. Copy the generated UUID and replace QA_USER_ID below
--
-- After creating the auth user, run this migration to seed the profile and data.

-- ============================================================
-- REPLACE THIS with the actual UUID from Supabase Auth after creating the user
-- ============================================================
DO $$
DECLARE
  QA_USER_ID uuid := 'e5350667-0bb7-4d79-95ca-3ca5b6bc32c4';
  lisbon_city_id uuid;
  portugal_trip_id uuid;
  thailand_trip_id uuid;
  qa_thread_id uuid;
BEGIN

  -- ── 1. Profile ────────────────────────────────────────────

  INSERT INTO profiles (
    id, username, first_name, bio, avatar_url,
    home_country_iso2, home_country_name,
    interests, travel_style
  ) VALUES (
    QA_USER_ID,
    'qa_tester',
    'QA Tester',
    'Automated test account for Sola QA. Please do not modify.',
    NULL,
    'US', 'United States',
    ARRAY['solo-travel', 'culture', 'food'],
    'slow'
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    bio = EXCLUDED.bio,
    interests = EXCLUDED.interests;

  -- Mark onboarding as completed and set verified (required for community posting)
  UPDATE profiles SET
    updated_at = now(),
    onboarding_completed_at = now(),
    verification_status = 'verified'
  WHERE id = QA_USER_ID;

  -- ── 2. Get Lisbon city ID ─────────────────────────────────

  SELECT id INTO lisbon_city_id FROM cities WHERE slug = 'lisbon' LIMIT 1;

  -- If Lisbon doesn't exist, try any city as fallback
  IF lisbon_city_id IS NULL THEN
    SELECT id INTO lisbon_city_id FROM cities LIMIT 1;
  END IF;

  -- ── 3. Trip 1: Portugal (with stop + accommodation) ───────

  INSERT INTO trips (
    id, user_id, destination_city_id, destination_name, country_iso2,
    arriving, leaving, nights, status, title, privacy_level, notes
  ) VALUES (
    uuid_generate_v4(), QA_USER_ID, lisbon_city_id, 'Lisbon', 'PT',
    '2026-06-01', '2026-06-10', 9, 'planned',
    'Test Trip to Portugal', 'private',
    'Seeded trip for QA testing. Do not delete.'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO portugal_trip_id;

  -- If already exists, find it
  IF portugal_trip_id IS NULL THEN
    SELECT id INTO portugal_trip_id FROM trips
    WHERE user_id = QA_USER_ID AND title = 'Test Trip to Portugal'
    LIMIT 1;
  END IF;

  -- Add a stop for Lisbon
  IF portugal_trip_id IS NOT NULL AND lisbon_city_id IS NOT NULL THEN
    INSERT INTO trip_stops (trip_id, stop_order, country_iso2, city_id, city_name, start_date, end_date)
    VALUES (portugal_trip_id, 0, 'PT', lisbon_city_id, 'Lisbon', '2026-06-01', '2026-06-10')
    ON CONFLICT DO NOTHING;

    -- Add accommodation
    INSERT INTO trip_accommodations (trip_id, name, check_in, check_out, status, notes)
    VALUES (
      portugal_trip_id, 'Hotel QA Lisbon', '2026-06-01', '2026-06-10',
      'booked', 'Seeded accommodation for QA testing'
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── 4. Trip 2: Thailand (empty) ───────────────────────────

  INSERT INTO trips (
    id, user_id, destination_name, country_iso2,
    status, title, privacy_level, notes
  ) VALUES (
    uuid_generate_v4(), QA_USER_ID, 'Thailand', 'TH',
    'draft', 'Test Trip to Thailand', 'private',
    'Empty seeded trip for QA testing. Do not delete.'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO thailand_trip_id;

  -- ── 5. Community thread ───────────────────────────────────

  INSERT INTO community_threads (
    id, author_id, author_type, title, body,
    country_id, status
  ) VALUES (
    uuid_generate_v4(), QA_USER_ID, 'user',
    'Best cafes for solo women in Lisbon?',
    'Looking for cozy cafes with wifi where I can work and feel safe as a solo female traveler. Any recommendations in Lisbon?',
    (SELECT id FROM countries WHERE iso2 = 'PT' LIMIT 1), 'active'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO qa_thread_id;

  -- Social tests (connect, block, report) will use real users from the travelers feed.
  -- No need to seed a fake friend — the QA agent picks a traveler at runtime.

  RAISE NOTICE 'QA test user seeded successfully. User ID: %', QA_USER_ID;
  RAISE NOTICE 'Portugal trip ID: %', portugal_trip_id;
  RAISE NOTICE 'Thailand trip ID: %', thailand_trip_id;

END $$;
