-- Backfill accommodation detail fields for all hotels, hostels, and homestays
-- Derives positioning_summary from why_selected (first ~200 chars)
-- Derives why_women_choose from solo_female_reviews
-- Sets sensible defaults for check-in/out, payment, transport

-- 1. positioning_summary — first meaningful chunk of why_selected
UPDATE places
SET positioning_summary = LEFT(why_selected, 200)
WHERE place_type IN ('hotel', 'hostel', 'homestay')
  AND positioning_summary IS NULL
  AND why_selected IS NOT NULL;

-- 2. why_women_choose — from solo_female_reviews
UPDATE places
SET why_women_choose = solo_female_reviews
WHERE place_type IN ('hotel', 'hostel', 'homestay')
  AND why_women_choose IS NULL
  AND solo_female_reviews IS NOT NULL;

-- 3. Default check-in / check-out times
UPDATE places
SET
  check_in_time = COALESCE(check_in_time, '2:00 PM'),
  check_out_time = COALESCE(check_out_time, '11:00 AM')
WHERE place_type IN ('hotel', 'hostel', 'homestay');

-- 4. Default payment types
UPDATE places
SET payment_types = ARRAY['Cash', 'Credit Card']
WHERE place_type IN ('hotel', 'hostel', 'homestay')
  AND (payment_types IS NULL OR payment_types = '{}');

-- 5. location_context — derive from city area name if available
UPDATE places p
SET location_context = 'Located in ' || ca.name || COALESCE(
  CASE WHEN ca.positioning_line IS NOT NULL
    THEN ' — ' || ca.positioning_line
    ELSE ''
  END, ''
) || '.'
FROM city_areas ca
WHERE p.city_area_id = ca.id
  AND p.place_type IN ('hotel', 'hostel', 'homestay')
  AND p.location_context IS NULL;

-- 6. nearest_transport — from address or booking_info if available
UPDATE places
SET nearest_transport = booking_info
WHERE place_type IN ('hotel', 'hostel', 'homestay')
  AND nearest_transport IS NULL
  AND booking_info IS NOT NULL
  AND booking_info != '';
