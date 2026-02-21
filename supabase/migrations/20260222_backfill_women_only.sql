-- Backfill women_only flag from existing text fields
-- Scans highlights, solo_female_reviews, why_selected for signals
-- indicating the place offers women-only accommodation options
-- (female dorms, women's floors, ladies-only spaces, etc.)

-- 1. Matches in highlights array (strongest signal — curated data)
UPDATE places
SET women_only = true
WHERE place_type IN ('hotel', 'hostel', 'homestay')
  AND women_only = false
  AND highlights::text ILIKE ANY(ARRAY[
    '%female-only%',
    '%female only%',
    '%women-only%',
    '%women only%',
    '%ladies-only%',
    '%ladies only%',
    '%all-female%',
    '%women''s floor%',
    '%women''s dorm%',
    '%female dorm%'
  ]);

-- 2. Matches in why_selected (high signal — editorial pick reason)
UPDATE places
SET women_only = true
WHERE place_type IN ('hotel', 'hostel', 'homestay')
  AND women_only = false
  AND why_selected ILIKE ANY(ARRAY[
    '%dedicated female dorm%',
    '%female-only dorm%',
    '%women-only%',
    '%women only%',
    '%specifically designed for solo female%',
    '%female only%'
  ]);

-- 3. Matches in solo_female_reviews (medium signal — traveler reports)
-- Require stronger phrasing here to avoid false positives
UPDATE places
SET women_only = true
WHERE place_type IN ('hotel', 'hostel', 'homestay')
  AND women_only = false
  AND solo_female_reviews ILIKE ANY(ARRAY[
    '%female-only dorm%',
    '%all-female dorm%',
    '%women-only dorm%',
    '%dedicated female dorm%',
    '%female only dorm%',
    '%women only dorm%',
    '%ladies dorm%',
    '%female dorm%'
  ]);
