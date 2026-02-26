-- Fix Mad Monkey entries: wrong place_type, placeholder descriptions, and duplicates
-- Mad Monkey is a well-known Southeast Asian party hostel chain — NOT a "peaceful hotel"

-- 1. Fix place_type: hotel → hostel for misclassified entries
UPDATE places SET place_type = 'hostel'
WHERE id IN (
  '5b0bfc08-aad5-4301-856c-a80ac71f7874', -- Mad Monkey Vang Vieng
  '5db6b661-73dc-44b4-aed2-0fc826b1ca20'  -- Mad Monkey Koh Rong
);

-- 2. Deactivate duplicate Mad Monkey Phnom Penh (keep f351f8c6 which has a real description)
UPDATE places SET is_active = false
WHERE id = '8828423a-34c1-42ae-b71b-a4c6fbd5f6db'; -- duplicate with bad template description

-- 3. Fix all placeholder/wrong descriptions with accurate, useful content

-- Mad Monkey Koh Rong
UPDATE places SET description = 'Beachfront party hostel on Koh Rong island with dorms and private bungalows. Pool parties, bar nights, and boat trips make this one of the most social spots in Cambodia''s islands. Female dorms available. Great for meeting other backpackers but expect noise — not for early sleepers.'
WHERE id = '5db6b661-73dc-44b4-aed2-0fc826b1ca20';

-- Mad Monkey Siem Reap
UPDATE places SET description = 'Large party hostel near Pub Street with a pool, rooftop bar, and nightly events. Female-only dorms with lockers and air conditioning. Organized tours to Angkor Wat and Tonle Sap. One of the most social hostels in Siem Reap — easy to meet other solo travelers over the free breakfast.'
WHERE id = '9de404b9-7732-46e1-b3d4-078842d1feae';

-- Mad Monkey Vang Vieng
UPDATE places SET description = 'Riverside party hostel with a pool, bar, and daily tubing trips along the Nam Song river. Female dorms available with secure lockers. Social events every night — perfect if you want to meet other backpackers. The setting is beautiful but this is firmly a party spot, not a retreat.'
WHERE id = '5b0bfc08-aad5-4301-856c-a80ac71f7874';

-- Mad Monkey Gili Trawangan
UPDATE places SET description = 'Beachside party hostel on Gili T with a pool, bar, and regular social events. Female dorms with lockers and air conditioning. Walking distance to the night market and dive shops. Good base for snorkeling trips. Expect a lively atmosphere — quiet hours are not this hostel''s strength.'
WHERE id = '5ff784f2-d44f-47c2-b641-23948736322a';

-- Mad Monkey Panglao (Bohol)
UPDATE places SET description = 'Social hostel on Panglao island with a pool and bar area. Female dorms available. Organizes island-hopping tours and trips to the Chocolate Hills. Close to Alona Beach nightlife. Good for solo travelers who want a ready-made social scene and easy access to Bohol''s highlights.'
WHERE id = '54cfd651-561d-4808-9134-6fc60281b961';

-- Mad Monkey Nacpan Beach (El Nido)
UPDATE places SET description = 'Beachfront hostel on Nacpan Beach, about 45 minutes from El Nido town. Dorms and private rooms right on the sand. More relaxed than other Mad Monkey locations but still social — bonfires, volleyball, and communal dinners. Female dorms available. Stunning location but remote, so plan transport.'
WHERE id = '345b7570-7fd2-4576-b55e-07b1ec93e046';

-- Mad Monkey Manila
UPDATE places SET description = 'Social hostel in Makati with a rooftop bar, pool, and regular events. Female-only dorms with secure lockers and air conditioning. Good base for exploring Manila — close to restaurants, malls, and nightlife in the BGC area. Staff organize city tours and pub crawls for solo travelers.'
WHERE id = '8b7a9917-4102-4e5a-aa91-116854689350';

-- Mad Monkey Siargao
UPDATE places SET description = 'Party hostel in General Luna, the main surf town on Siargao. Pool, bar, and nightly events. Female dorms with lockers. Walking distance to Cloud 9 surf break and the main strip of restaurants and bars. Rents motorbikes and organizes island-hopping tours. Social and loud — pack earplugs.'
WHERE id = '4f8979d5-edd6-41ce-ad50-e3d464aee363';

-- Mad Monkey Siquijor
UPDATE places SET description = 'Hostel on Siquijor island with a pool and social common areas. Female dorms available with lockers. Organizes waterfall tours and motorbike rentals for exploring the island. More laid-back than the bigger Mad Monkey locations but still a good spot to meet other backpackers passing through.'
WHERE id = '6442d52e-6f4d-43d4-89d0-9889b3142896';

-- Mad Monkey Hanoi (rewrite from review-style to editorial)
UPDATE places SET description = 'Popular party hostel in Hanoi''s Old Quarter with a rooftop bar and regular events. Female dorms with secure lockers and air conditioning. Walking distance to Hoan Kiem Lake and the best street food stalls. Staff organize pub crawls, cooking classes, and Ha Long Bay trips. Consistently rated one of the best hostels in Vietnam.'
WHERE id = '0cf6a4db-83c7-41f3-952d-50ebb202c78d';
