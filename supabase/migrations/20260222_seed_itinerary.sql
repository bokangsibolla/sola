-- ═══════════════════════════════════════════════════════
-- Seed: Demo itinerary for Aisha's Chiang Mai trip
-- Depends on: 20260205_seed_trips.sql, 20260222_itinerary_tables.sql
-- ═══════════════════════════════════════════════════════

DO $$
DECLARE
  v_trip_id uuid;
  v_day1_id uuid;
  v_day2_id uuid;
  v_day3_id uuid;
  v_block1 uuid;
  v_block2 uuid;
  v_block3 uuid;
  v_block4 uuid;
  v_block5 uuid;
  v_block6 uuid;
BEGIN
  -- Find Aisha's active Chiang Mai trip
  SELECT id INTO v_trip_id FROM trips
    WHERE destination_name = 'Chiang Mai' AND status = 'active'
    LIMIT 1;

  IF v_trip_id IS NULL THEN
    RAISE NOTICE 'No Chiang Mai trip found, skipping itinerary seed';
    RETURN;
  END IF;

  -- Update trip with itinerary columns
  UPDATE trips SET
    timezone = 'Asia/Bangkok',
    currency = 'THB',
    budget_total = 45000,
    pace = 'balanced'
  WHERE id = v_trip_id;

  -- Create 3 days
  v_day1_id := gen_random_uuid();
  INSERT INTO trip_days (id, trip_id, day_index, date, title)
  VALUES (v_day1_id, v_trip_id, 1, CURRENT_DATE, 'Old City & Temples');

  v_day2_id := gen_random_uuid();
  INSERT INTO trip_days (id, trip_id, day_index, date, title)
  VALUES (v_day2_id, v_trip_id, 2, CURRENT_DATE + 1, 'Doi Suthep & Night Market');

  v_day3_id := gen_random_uuid();
  INSERT INTO trip_days (id, trip_id, day_index, date, title)
  VALUES (v_day3_id, v_trip_id, 3, CURRENT_DATE + 2, 'Café Hopping & Nimmanhaemin');

  -- ── Day 1 blocks ──────────────────────────────────────
  v_block1 := gen_random_uuid();
  INSERT INTO itinerary_blocks (id, trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_block1, v_trip_id, v_day1_id, 'meal', 'Breakfast at Rustic & Blue', '08:00', 60, 1, 'planned');

  v_block2 := gen_random_uuid();
  INSERT INTO itinerary_blocks (id, trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_block2, v_trip_id, v_day1_id, 'place', 'Wat Chedi Luang', '09:30', 90, 2, 'planned');

  v_block3 := gen_random_uuid();
  INSERT INTO itinerary_blocks (id, trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_block3, v_trip_id, v_day1_id, 'free_time', 'Wander the Old City', '11:30', 60, 3, 'planned');

  v_block4 := gen_random_uuid();
  INSERT INTO itinerary_blocks (id, trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_block4, v_trip_id, v_day1_id, 'meal', 'Lunch at Khao Soi Mae Sai', '12:30', 60, 4, 'planned');

  INSERT INTO itinerary_blocks (trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_trip_id, v_day1_id, 'activity', 'Thai Cooking Class', '15:00', 180, 5, 'booked');

  INSERT INTO itinerary_blocks (trip_id, trip_day_id, block_type, title_override, start_time, order_index, status)
  VALUES (v_trip_id, v_day1_id, 'safety_check', 'Evening check-in', '20:00', 6, 'planned');

  -- ── Day 2 blocks ──────────────────────────────────────
  INSERT INTO itinerary_blocks (trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_trip_id, v_day2_id, 'transport', 'Songthaew to Doi Suthep', '08:30', 30, 1, 'planned');

  v_block5 := gen_random_uuid();
  INSERT INTO itinerary_blocks (id, trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_block5, v_trip_id, v_day2_id, 'place', 'Wat Phra That Doi Suthep', '09:00', 120, 2, 'planned');

  INSERT INTO itinerary_blocks (trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_trip_id, v_day2_id, 'meal', 'Mountain-view lunch', '12:00', 60, 3, 'planned');

  INSERT INTO itinerary_blocks (trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_trip_id, v_day2_id, 'free_time', 'Rest at hotel', '14:00', 120, 4, 'planned');

  INSERT INTO itinerary_blocks (trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_trip_id, v_day2_id, 'activity', 'Sunday Night Market', '18:00', 180, 5, 'planned');

  -- ── Day 3 blocks ──────────────────────────────────────
  INSERT INTO itinerary_blocks (trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_trip_id, v_day3_id, 'meal', 'Coffee at Ristr8to Lab', '09:00', 45, 1, 'planned');

  v_block6 := gen_random_uuid();
  INSERT INTO itinerary_blocks (id, trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_block6, v_trip_id, v_day3_id, 'place', 'MAIIAM Contemporary Art Museum', '10:30', 90, 2, 'planned');

  INSERT INTO itinerary_blocks (trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_trip_id, v_day3_id, 'meal', 'Lunch at Dash!', '12:30', 60, 3, 'planned');

  INSERT INTO itinerary_blocks (trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_trip_id, v_day3_id, 'activity', 'Nimmanhaemin Walk & Shopping', '14:00', 120, 4, 'planned');

  INSERT INTO itinerary_blocks (trip_id, trip_day_id, block_type, title_override, order_index, status)
  VALUES (v_trip_id, v_day3_id, 'note', 'Pack for early checkout tomorrow', 5, 'planned');

  -- ── Block tags ────────────────────────────────────────
  INSERT INTO itinerary_block_tags (block_id, tag_type, label) VALUES
    (v_block2, 'vibe', 'Peaceful'),
    (v_block2, 'women_note', 'Dress modestly — shoulders and knees covered'),
    (v_block3, 'vibe', 'Walkable'),
    (v_block4, 'logistics', 'Cash only'),
    (v_block5, 'vibe', 'Panoramic views'),
    (v_block5, 'logistics', 'Wear comfortable shoes — 306 steps'),
    (v_block6, 'vibe', 'Contemporary');

  -- ── One demo suggestion ───────────────────────────────
  INSERT INTO itinerary_suggestions (trip_id, trip_day_id, block_id, suggestion_type, reason, payload)
  VALUES (
    v_trip_id,
    v_day1_id,
    v_block2,
    'time_shift',
    'Wat Chedi Luang is less crowded before 9 AM — consider starting at 08:30 instead?',
    jsonb_build_object(
      'blockId', v_block2::text,
      'newStartTime', '08:30:00',
      'newEndTime', '10:00:00'
    )
  );

END $$;
