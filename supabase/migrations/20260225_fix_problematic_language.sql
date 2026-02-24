-- Fix problematic language: remove "cheap", "chaotic" as labels, "gritty", "sketchy", "dirt cheap"
-- These words are subjective, dismissive, and not on-brand for Sola.
-- Replace with factual, respectful alternatives.

BEGIN;

-- ============================================================
-- 1. CITIES TABLE — positioning_line fixes
-- ============================================================

-- Manila: "Chaotic capital" → respectful alternative
UPDATE cities SET
  positioning_line = 'Sprawling capital with world-class food and nightlife'
WHERE slug = 'manila'
  AND positioning_line LIKE '%Chaotic capital%';

-- ============================================================
-- 2. CITY_AREAS TABLE — area enrichment fixes
-- ============================================================

-- Kampot Riverfront: remove "cheap" from crowd_vibe
UPDATE city_areas SET
  crowd_vibe = 'Mix of backpackers eating Khmer street food and couples at the slightly nicer spots'
WHERE id = '6acd29d3-71a6-5376-bb2e-2020ff32219f'
  AND crowd_vibe LIKE '%cheap Khmer food%';

-- Russian Market, Phnom Penh: remove "cheap" from vibe_description and crowd_vibe
UPDATE city_areas SET
  vibe_description = 'Named for the Russians who shopped here in the 1980s. The covered market sells everything from textiles to electronics. Streets around it have local food stalls and backpacker hostels.',
  crowd_vibe = 'Local shoppers, garment workers on lunch, and backpackers hunting for bargain textiles',
  practical_info = '{"getting_around": "Tuk-tuk from Riverside takes about 10 minutes.", "budget_note": "Most affordable area for shopping and eating in Phnom Penh, meals under $2."}'::jsonb
WHERE id = '344865d8-e98f-58d4-af7b-855f210a634c';

-- Pub Street, Siem Reap: remove "cheap drinks" and "dirt cheap"
UPDATE city_areas SET
  positioning_line = 'Siem Reap''s loud, neon-lit street for late-night drinks and post-temple socializing',
  practical_info = '{"getting_around": "Walkable from Old Market in two minutes.", "budget_note": "Drinks are very affordable — $0.50-2 for beer, cocktails around $3."}'::jsonb
WHERE id = '94a324bc-1e01-58e1-8270-7c7a9a832f2a';

-- Nyaung-U, Bagan: remove "cheap restaurants" and "Cheapest base"
UPDATE city_areas SET
  vibe_description = 'Nyaung-U is the actual town where people live. It has a morning market, bus station, and the best selection of affordable restaurants. Most backpacker hostels are here. The Shwezigon Pagoda sits at the edge of town and glows gold at sunset.',
  practical_info = '{"getting_around": "E-bike to Old Bagan takes 10 minutes, flat roads.", "atms": "A couple of ATMs near the market, CB Bank is most reliable.", "wifi": "Cafes have basic wifi, hostels are hit or miss.", "budget_note": "Most affordable base in Bagan, meals $1-3, dorm beds $6-10."}'::jsonb
WHERE id = 'feddb3fa-9de9-5a9b-9346-482138d18ef9';

-- Khao San, Bangkok: remove "cheap stays", "loud, cheap", "cheapest areas"
UPDATE city_areas SET
  who_it_suits = 'First-timers and budget travelers who want affordable stays and easy socializing',
  vibe_description = 'Khao San Road is loud, lively, and always busy. Street vendors sell pad thai for 50 baht and bars blast music until late. It''s not the "real" Bangkok but it''s a rite of passage. The side streets have quieter guesthouses and better food.',
  practical_info = '{"getting_around": "No BTS or MRT nearby, so you rely on taxis, tuk-tuks, or the Chao Phraya boat.", "atms": "Several ATMs along the main road but withdrawal fees are steep.", "budget_note": "One of the most affordable areas in Bangkok for food and beds."}'::jsonb
WHERE id = 'fea9dbbc-36ff-5460-9adc-5cc432bdfa59';

-- Hanoi Old Quarter: remove "chaotic" from positioning_line
UPDATE city_areas SET
  positioning_line = 'Hanoi''s centuries-old trading quarter where every street has a specialty'
WHERE id = '58d7b0ae-b1ea-594e-afee-a7c1ab02ac8d'
  AND positioning_line LIKE '%chaotic%';

-- Poblacion, Manila: remove "gritty" and "slightly run-down"
UPDATE city_areas SET
  vibe_description = 'A former residential neighborhood now packed with rooftop bars, speakeasies, and hostels. The streets are narrow and unpolished. After dark it comes alive. By day it is quiet and low-key, which is part of the charm.',
  practical_info = '{"getting_around": "Walkable at night between venues. Grab for getting in and out.", "budget_note": "Cocktails are 250-400 PHP. Street food stalls open late for affordable eats.", "nearest_hospital": "Makati Medical Center is a short Grab ride away."}'::jsonb
WHERE id = '9f85425a-f2fd-590a-b91a-26ec7ccb048d';

-- Petitenget, Seminyak: "less chaotic" → "quieter"
UPDATE city_areas SET
  vibe_description = 'Petitenget runs along a temple road that has become Seminyak''s dining and boutique hub. The restaurants here are some of Bali''s best. It is walkable, relatively clean, and quieter than the beach strip.'
WHERE id = 'bfaa880c-5283-5986-a6fe-bfd29de82d5c'
  AND vibe_description LIKE '%less chaotic%';

-- Shibuya, Tokyo: "as chaotic as" → "as electric as"
UPDATE city_areas SET
  vibe_description = 'The scramble crossing is as electric as the videos suggest. Beyond that, Shibuya is a dense cluster of department stores, music venues, and izakayas. Center-gai gets rowdy at night. The backstreets of Udagawacho and Tomigaya are calmer and more interesting.'
WHERE id = 'bf7e8288-5f67-5f1d-920b-1a88adab4406'
  AND vibe_description LIKE '%chaotic%';

-- ============================================================
-- 3. CITIES TABLE — women_should_know fixes
-- ============================================================

-- Hanoi: "Old Quarter is chaotic but safe" → "Old Quarter is intense but safe"
UPDATE cities SET
  women_should_know = REPLACE(women_should_know::text, 'The Old Quarter is chaotic but safe', 'The Old Quarter is intense but safe')::jsonb
WHERE slug = 'hanoi'
  AND women_should_know::text LIKE '%chaotic but safe%';

-- ============================================================
-- 4. PLACES TABLE — description text fixes
-- ============================================================

-- Fix "cheap beers" in The Gem Hostel (HCMC)
UPDATE places SET
  description = REPLACE(description, 'cheap beers', 'affordable drinks')
WHERE description LIKE '%cheap beers%';

-- Fix "cheap beer" in any place descriptions
UPDATE places SET
  description = REPLACE(description, 'cheap beer', 'affordable beer')
WHERE description LIKE '%cheap beer%';

-- Fix "cheap pad thai" → "pad thai" (the cheapness isn't the point)
UPDATE places SET
  description = REPLACE(description, 'with cheap pad thai', 'with pad thai stalls')
WHERE description LIKE '%cheap pad thai%';

-- Fix "sketchy hostel party vibe" → "rowdy hostel party vibe"
UPDATE places SET
  description = REPLACE(description, 'sketchy hostel party vibe', 'rowdy hostel party vibe')
WHERE description LIKE '%sketchy%';

-- Fix "sketchy vibes" → "uncomfortable pressure"
UPDATE places SET
  description = REPLACE(description, 'no sketchy vibes', 'no pressure')
WHERE description LIKE '%sketchy vibes%';

-- Fix "Cheap, filling, and authentic" → "Filling and authentic"
UPDATE places SET
  description = REPLACE(description, 'Cheap, filling, and authentic', 'Filling and authentic')
WHERE description LIKE '%Cheap, filling, and authentic%';

-- Fix "Cheap and filling" → "Filling and satisfying"
UPDATE places SET
  description = REPLACE(description, 'Cheap and filling', 'Filling and satisfying')
WHERE description LIKE '%Cheap and filling%';

-- Fix "cheap, fast, and tasty" → "fast, satisfying, and affordable"
UPDATE places SET
  description = REPLACE(description, 'cheap, fast, and tasty', 'fast, satisfying, and affordable')
WHERE description LIKE '%cheap, fast, and tasty%';

-- Fix "it's cheap enough" → "it's affordable enough"
UPDATE places SET
  description = REPLACE(description, 'it''s cheap enough', 'it''s affordable enough')
WHERE description LIKE '%cheap enough%';

-- ============================================================
-- 5. COUNTRY GUIDES — might_struggle_md fixes
-- ============================================================

-- Vietnam: "can feel chaotic" → "can feel overwhelming"
UPDATE countries SET
  might_struggle_md = REPLACE(might_struggle_md, 'Vietnam can feel chaotic', 'Vietnam can feel fast-paced')
WHERE slug = 'vietnam'
  AND might_struggle_md LIKE '%can feel chaotic%';

-- Colombia: "can be chaotic" → "can be unpredictable"
UPDATE countries SET
  might_struggle_md = REPLACE(might_struggle_md, 'Colombia can be chaotic', 'Colombia can be unpredictable')
WHERE slug = 'colombia'
  AND might_struggle_md LIKE '%can be chaotic%';

COMMIT;
