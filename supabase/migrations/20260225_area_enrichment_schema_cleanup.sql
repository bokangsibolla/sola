-- Area Enrichment Schema + Duplicate Cleanup
-- 2026-02-25
--
-- 1. Add new enrichment columns
-- 2. Dedup 20 duplicate areas (same name in same city)
-- 3. Add missing areas (Pacifico for Siargao)
-- 4. Clean up near-duplicate areas (Siem Reap)
-- 5. Deactivate empty areas with no places

BEGIN;

-- ============================================================
-- 1. NEW COLUMNS
-- ============================================================

ALTER TABLE city_areas ADD COLUMN IF NOT EXISTS vibe_description text;
ALTER TABLE city_areas ADD COLUMN IF NOT EXISTS crowd_vibe text;
ALTER TABLE city_areas ADD COLUMN IF NOT EXISTS practical_info jsonb;

-- ============================================================
-- 2. DEDUP: For each duplicate pair, keep the one with places,
--    transfer is_primary, update area_kind to the better type,
--    deactivate the empty one.
-- ============================================================

-- Helper: For each pair below:
--   "keeper" = the one with places (always the neighborhood variant)
--   "dead"   = the empty original (district/beach/island variant with 0 places)
-- We transfer is_primary to keeper, set proper area_kind, deactivate dead.

-- Da Lat: City Center
UPDATE city_areas SET is_primary = true WHERE id = '43099369-0722-55bd-aa89-348e032507e0'; -- keeper: neighborhood with 12 places
UPDATE city_areas SET is_active = false WHERE id = '4f1605fc-e7d1-5606-a8cc-2f1c7cf37c47'; -- dead: district with 0 places
UPDATE city_areas SET area_kind = 'district' WHERE id = '43099369-0722-55bd-aa89-348e032507e0';

-- Da Lat: Tuyen Lam Lake (both neighborhood, keep one with places)
UPDATE city_areas SET is_active = false WHERE id = 'ff8e3699-090d-5786-a924-b6ab90560d0b'; -- dead: 0 places

-- Da Nang: My Khe Beach
UPDATE city_areas SET is_primary = true WHERE id = '54b69696-bfd2-5fe6-811c-6eabe03a5c79'; -- keeper: 4 places
UPDATE city_areas SET is_active = false WHERE id = '3f73b2fa-59a4-5d44-a32a-4726c27f2625'; -- dead: 0 places
UPDATE city_areas SET area_kind = 'beach' WHERE id = '54b69696-bfd2-5fe6-811c-6eabe03a5c79';

-- El Nido: Corong-Corong
UPDATE city_areas SET is_active = false WHERE id = '9c116d8d-40b0-5633-bbf6-4e5135809f31'; -- dead: 0 places
UPDATE city_areas SET area_kind = 'beach' WHERE id = '426e13f5-2727-5e87-a029-7f3991f920d5';

-- Fes: Fes el-Bali
UPDATE city_areas SET is_primary = true WHERE id = '800445f2-a3d4-5390-9d7d-01c77958b2d2'; -- keeper: 12 places
UPDATE city_areas SET is_active = false WHERE id = 'f19ac7f9-5848-511c-9c2f-a620a97ad2ce'; -- dead: 0 places
UPDATE city_areas SET area_kind = 'district' WHERE id = '800445f2-a3d4-5390-9d7d-01c77958b2d2';

-- Fes: Ville Nouvelle
UPDATE city_areas SET is_active = false WHERE id = 'ec7abf90-cc7c-56d8-b0dc-6010f114a0c8'; -- dead: 0 places
UPDATE city_areas SET area_kind = 'district' WHERE id = '6efb3e5e-1fab-54e5-ad66-85bb5e025162';

-- Gili Islands: Gili Air
UPDATE city_areas SET is_active = false WHERE id = '3ae81b42-a497-5009-a618-0a30d2ef7e02'; -- dead: 0 places
UPDATE city_areas SET area_kind = 'island' WHERE id = '811c9320-216c-504b-b2a9-4728ad1608dc';

-- Gili Islands: Gili Trawangan
UPDATE city_areas SET is_primary = true WHERE id = '2de3e3eb-5ead-5a4e-8066-436fdc0bfb46'; -- keeper: 12 places
UPDATE city_areas SET is_active = false WHERE id = '71ac564a-fbcc-5d2a-950b-8ba1fce1737b'; -- dead: 0 places
UPDATE city_areas SET area_kind = 'island' WHERE id = '2de3e3eb-5ead-5a4e-8066-436fdc0bfb46';

-- Hoi An: An Bang Beach
UPDATE city_areas SET is_active = false WHERE id = 'f832706b-2867-5050-b48e-5e647cf50b39'; -- dead: 0 places
UPDATE city_areas SET area_kind = 'beach' WHERE id = '8ffc9a08-15e1-5f66-8ce4-2d9b7079eee5';

-- Hoi An: Ancient Town
UPDATE city_areas SET is_primary = true WHERE id = '23687677-3e20-5bc8-b11f-762fe734768e'; -- keeper: 19 places
UPDATE city_areas SET is_active = false WHERE id = '87aa6f67-25fc-5dc8-8f29-0baa2d29cbed'; -- dead: 0 places
UPDATE city_areas SET area_kind = 'district' WHERE id = '23687677-3e20-5bc8-b11f-762fe734768e';

-- Koh Rong: Long Set Beach
UPDATE city_areas SET is_active = false WHERE id = 'a67d5dd3-02f8-5479-b498-0c1151d3694d'; -- dead: 0 places
UPDATE city_areas SET area_kind = 'beach' WHERE id = 'd68169d6-8163-5594-9b44-b7d8f9c509f6';

-- Kota Kinabalu: Gaya Street (both neighborhood, keep one with places)
UPDATE city_areas SET is_active = false WHERE id = 'c87837d8-71ec-5a71-8169-51c2c0c7a909'; -- dead: 0 places

-- Malacca: Jonker Street
UPDATE city_areas SET is_primary = true WHERE id = '99c842ec-a27b-5f6b-bac3-9774c1d20942'; -- keeper: 8 places (transfer primary)
UPDATE city_areas SET is_active = false WHERE id = '09333319-2d68-5cb6-a30c-77a789b99e6d'; -- dead: 0 places

-- Pai: Pai Canyon Area (both neighborhood, keep one with places)
UPDATE city_areas SET is_active = false WHERE id = 'c8fc536f-d92f-57d5-9790-c200dac9a718'; -- dead: 0 places

-- Pai: Walking Street
UPDATE city_areas SET is_primary = true WHERE id = 'f86b7834-8903-51c0-b736-a739f2694326'; -- keeper: 14 places
UPDATE city_areas SET is_active = false WHERE id = '7d9aa0c1-be7b-5332-9385-7204c524371d'; -- dead: 0 places

-- Ubud: Central Ubud
UPDATE city_areas SET is_primary = true WHERE id = '4448c836-8fb3-53c0-bb8b-88330ac6f1c4'; -- keeper: 15 places
UPDATE city_areas SET is_active = false WHERE id = 'a9fd7fae-b9c6-5ee5-8d05-c5998b217b2c'; -- dead: 0 places
UPDATE city_areas SET area_kind = 'district' WHERE id = '4448c836-8fb3-53c0-bb8b-88330ac6f1c4';

-- Vang Vieng: Blue Lagoon Area (both neighborhood, keep one with places)
UPDATE city_areas SET is_active = false WHERE id = '3a17a248-2a39-5225-8173-222909e8a04d'; -- dead: 0 places

-- Vang Vieng: Town Center
UPDATE city_areas SET is_primary = true WHERE id = 'e9fe7609-978b-51c0-85bb-60ba2916aba6'; -- keeper: 11 places
UPDATE city_areas SET is_active = false WHERE id = '4ba2a411-950a-567f-98ba-57416f6bab07'; -- dead: 0 places
UPDATE city_areas SET area_kind = 'district' WHERE id = 'e9fe7609-978b-51c0-85bb-60ba2916aba6';

-- Vientiane: That Luang Area
UPDATE city_areas SET is_active = false WHERE id = '1a800410-f610-5d0b-90d0-2e630279f1f1'; -- dead: 0 places
UPDATE city_areas SET area_kind = 'district' WHERE id = '23fceb8b-bebb-51fe-a04f-785795824f85';

-- Yangon: Shwedagon Area
UPDATE city_areas SET is_active = false WHERE id = '30742b01-a90b-5dd7-aa2a-76e3130c5902'; -- dead: 0 places
UPDATE city_areas SET area_kind = 'district' WHERE id = '4faaa954-25d3-5700-be4c-af32754ec77a';

-- ============================================================
-- 3. SIEM REAP: Merge near-duplicates
-- ============================================================

-- "Pub Street" (0 places) is redundant with "Pub Street Area" (3 places)
UPDATE city_areas SET is_active = false
WHERE name = 'Pub Street' AND city_id = (SELECT id FROM cities WHERE slug = 'siem-reap')
AND id != (SELECT id FROM city_areas WHERE name = 'Pub Street Area' AND city_id = (SELECT id FROM cities WHERE slug = 'siem-reap') AND is_active = true LIMIT 1);

-- "Angkor Area" (0 places) is redundant with "Angkor Archaeological Park" (1 place)
UPDATE city_areas SET is_active = false
WHERE name = 'Angkor Area' AND city_id = (SELECT id FROM cities WHERE slug = 'siem-reap');

-- Rename "Pub Street Area" to "Pub Street" (cleaner)
UPDATE city_areas SET name = 'Pub Street', slug = 'pub-street-sr'
WHERE name = 'Pub Street Area' AND city_id = (SELECT id FROM cities WHERE slug = 'siem-reap') AND is_active = true;

-- ============================================================
-- 4. ADD MISSING AREAS
-- ============================================================

-- Siargao: Add Pacifico (northern surf town)
INSERT INTO city_areas (id, city_id, slug, name, area_kind, is_primary, is_active, order_index)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM cities WHERE slug = 'siargao'),
  'pacifico',
  'Pacifico',
  'beach',
  false,
  true,
  4
) ON CONFLICT DO NOTHING;

-- Siargao: Add Union (laid-back fishing village south of General Luna)
INSERT INTO city_areas (id, city_id, slug, name, area_kind, is_primary, is_active, order_index)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM cities WHERE slug = 'siargao'),
  'union',
  'Union',
  'neighborhood',
  false,
  true,
  5
) ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. DEACTIVATE EMPTY AREAS WITH NO VALUE
-- ============================================================

-- Siargao: Dapa has 0 places and is just the port town with nothing for travelers
UPDATE city_areas SET is_active = false
WHERE name = 'Dapa' AND city_id = (SELECT id FROM cities WHERE slug = 'siargao');

-- Bohol: Tagbilaran has 0 places
UPDATE city_areas SET is_active = false
WHERE name = 'Tagbilaran' AND city_id = (SELECT id FROM cities WHERE slug = 'bohol');

-- Cebu: "Cebu City" has 0 places (redundant with "Cebu City Center" which has 50)
UPDATE city_areas SET is_active = false
WHERE name = 'Cebu City' AND city_id = (SELECT id FROM cities WHERE slug = 'cebu')
AND (SELECT count(*) FROM places WHERE city_area_id = city_areas.id AND is_active = true) = 0;

-- Cebu: Mactan has 0 places
UPDATE city_areas SET is_active = false
WHERE name = 'Mactan' AND city_id = (SELECT id FROM cities WHERE slug = 'cebu')
AND (SELECT count(*) FROM places WHERE city_area_id = city_areas.id AND is_active = true) = 0;

-- El Nido: "Town Proper" has 0 places (redundant with "El Nido Town" which has 9)
UPDATE city_areas SET is_active = false
WHERE name = 'Town Proper' AND city_id = (SELECT id FROM cities WHERE slug = 'el-nido')
AND (SELECT count(*) FROM places WHERE city_area_id = city_areas.id AND is_active = true) = 0;

-- Penang: Batu Ferringhi has 0 places
UPDATE city_areas SET is_active = false
WHERE name = 'Batu Ferringhi' AND city_id = (SELECT id FROM cities WHERE slug = 'penang')
AND (SELECT count(*) FROM places WHERE city_area_id = city_areas.id AND is_active = true) = 0;

-- Luang Prabang: Mekong Riverside has 0 places
UPDATE city_areas SET is_active = false
WHERE name = 'Mekong Riverside' AND city_id = (SELECT id FROM cities WHERE slug = 'luang-prabang')
AND (SELECT count(*) FROM places WHERE city_area_id = city_areas.id AND is_active = true) = 0;

-- Vientiane: Mekong Riverfront has 0 places (Mekong Riverside has 11)
UPDATE city_areas SET is_active = false
WHERE name = 'Mekong Riverfront' AND city_id = (SELECT id FROM cities WHERE slug = 'vientiane')
AND (SELECT count(*) FROM places WHERE city_area_id = city_areas.id AND is_active = true) = 0;

-- Inle Lake: Lake Area has 0 places
UPDATE city_areas SET is_active = false
WHERE name = 'Lake Area' AND city_id = (SELECT id FROM cities WHERE slug = 'inle-lake')
AND (SELECT count(*) FROM places WHERE city_area_id = city_areas.id AND is_active = true) = 0;

-- Bangkok: Rattanakosin has 0 places (Old Town (Rattanakosin) has 4)
UPDATE city_areas SET is_active = false
WHERE name = 'Rattanakosin' AND city_id = (SELECT id FROM cities WHERE slug = 'bangkok')
AND (SELECT count(*) FROM places WHERE city_area_id = city_areas.id AND is_active = true) = 0;

COMMIT;
