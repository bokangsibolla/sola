-- ============================================================
-- Curated Volunteer Organizations — Southeast Asia
-- ============================================================
-- ~60 verified organizations across 10 countries.
-- All accept volunteers directly — no placement agency fees.
-- Safe to re-run (INSERT ON CONFLICT DO UPDATE).
-- ============================================================

-- Helper: deterministic UUIDs from slug
-- uuid_generate_v5(uuid_ns_url(), key)

-- ── THAILAND ─────────────────────────────────────────────

-- Elephant Nature Park — Chiang Mai
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, phone, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:elephant-nature-park'),
  'ba437e7c-cb67-5276-92c8-34e4809f0c14', -- Chiang Mai
  'elephant-nature-park-volunteer',
  'Elephant Nature Park',
  'volunteer', 'animal', '1 week',
  'Founded by Lek Chailert, Elephant Nature Park is Southeast Asia''s most respected elephant sanctuary. Volunteers help prepare food, assist with feeding and bathing, clean enclosures, and observe elephant behavior. The sanctuary rescues elephants from logging, tourism, and street begging. On-site accommodation and meals included.',
  'https://www.elephantnaturepark.org',
  NULL, true,
  '{"skills_needed": [], "languages": ["English"], "includes_accommodation": true, "includes_meals": true, "cost_note": "THB 5,500-11,000/week (~USD 150-300) — goes directly to elephant care", "how_to_apply": "Book directly via website", "what_volunteers_do": "Prepare food for elephants, assist with feeding and bathing, clean enclosures, observe elephant behavior, support rescue operations", "email": "info@elephantnaturepark.org"}'::jsonb,
  'morning', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details,
  volunteer_type = EXCLUDED.volunteer_type,
  min_commitment = EXCLUDED.min_commitment,
  website = EXCLUDED.website;

-- Elephant Rescue Park — Chiang Mai
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:elephant-rescue-park'),
  'ba437e7c-cb67-5276-92c8-34e4809f0c14',
  'elephant-rescue-park-volunteer',
  'Elephant Rescue Park',
  'volunteer', 'animal', '1 week',
  'Part of the Save Elephant Foundation network, Elephant Rescue Park provides a safe haven for rescued elephants. Volunteers assist with daily elephant care, food preparation, habitat maintenance, and education programs. Accommodation and meals included on-site.',
  'https://www.elephantrescuepark.com',
  true,
  '{"skills_needed": [], "languages": ["English"], "includes_accommodation": true, "includes_meals": true, "cost_note": "USD 200-400/week (contribution to sanctuary operations)", "how_to_apply": "Book via website — direct booking, no agency", "what_volunteers_do": "Daily elephant care, food preparation, habitat maintenance, education work", "email": null}'::jsonb,
  'morning', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details,
  min_commitment = EXCLUDED.min_commitment;

-- Warm Heart Foundation — Chiang Mai (Phrao)
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:warm-heart-foundation'),
  'ba437e7c-cb67-5276-92c8-34e4809f0c14',
  'warm-heart-foundation-volunteer',
  'Warm Heart Foundation',
  'volunteer', 'community', '2 weeks',
  'Based in Phrao (Chiang Mai Province), Warm Heart Foundation runs community development, English teaching, organic farming, and biochar production programs. Highly rated by solo women travelers for being safe, welcoming, and well-organized. Simple homestay-style accommodation included.',
  'https://www.warmheartworldwide.org',
  true,
  '{"skills_needed": ["English fluency"], "languages": ["English", "Thai"], "includes_accommodation": true, "includes_meals": true, "cost_note": "USD 250-350/month contribution (covers room and board)", "how_to_apply": "Apply via website", "what_volunteers_do": "Teach English, support community development projects, assist with organic farming, biochar production", "email": null}'::jsonb,
  'any', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- Lanna Dog Rescue — Chiang Mai
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:lanna-dog-rescue'),
  'ba437e7c-cb67-5276-92c8-34e4809f0c14',
  'lanna-dog-rescue-volunteer',
  'Lanna Dog Rescue',
  'volunteer', 'animal', '1 week',
  'Small local dog rescue in Chiang Mai that accepts volunteers for dog care, walking, feeding, socialization, and veterinary support. No placement fee — just show up and help. A favorite among backpackers who want to give back without paying agency fees.',
  'https://www.lannadog.com',
  true,
  '{"skills_needed": [], "languages": ["English"], "includes_accommodation": false, "includes_meals": false, "cost_note": "No volunteer fee", "how_to_apply": "Contact via website or Facebook", "what_volunteers_do": "Dog care, walking, feeding, socialization, vet support, fostering", "email": null}'::jsonb,
  'morning', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- Pun Pun Organic Farm — Chiang Mai
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:pun-pun-organic-farm'),
  'ba437e7c-cb67-5276-92c8-34e4809f0c14',
  'pun-pun-organic-farm-volunteer',
  'Pun Pun Organic Farm',
  'volunteer', 'farming', '2 weeks',
  'Self-sufficient organic farm outside Chiang Mai focused on seed saving, natural building, and sustainable living. Volunteers learn and practice organic farming, permaculture, and traditional seed preservation. A peaceful retreat for travelers who want hands-on agricultural experience.',
  'http://www.punpunthailand.org',
  true,
  '{"skills_needed": [], "languages": ["English", "Thai"], "includes_accommodation": true, "includes_meals": true, "cost_note": "Small daily contribution for room and board", "how_to_apply": "Apply via website — limited spots", "what_volunteers_do": "Organic farming, seed saving, natural building, food preparation, permaculture practice", "email": null}'::jsonb,
  'morning', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- Mirror Foundation — Chiang Rai
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:mirror-foundation'),
  'ac0551a4-bc21-54e9-a35b-4559ba5cb665', -- Chiang Rai
  'mirror-foundation-volunteer',
  'Mirror Foundation',
  'volunteer', 'teaching', '1 month',
  'Established in 1991, Mirror Foundation works with ethnic minorities and stateless people in northern Thailand''s hill tribe communities. Volunteers teach English, participate in cultural exchange, and support community development. Accommodation is homestay with local families — an immersive cultural experience.',
  'https://www.mirrorartgroup.org',
  true,
  '{"skills_needed": ["English fluency"], "languages": ["English"], "includes_accommodation": true, "includes_meals": true, "cost_note": "USD 150-200/month contribution", "how_to_apply": "Apply via website", "what_volunteers_do": "English teaching in hill tribe communities, cultural exchange, community development support", "email": null}'::jsonb,
  'any', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- Lanta Animal Welfare — Koh Lanta
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:lanta-animal-welfare'),
  '1177058d-fc99-5fbd-a88b-76fe3f269792', -- Koh Lanta
  'lanta-animal-welfare-volunteer',
  'Lanta Animal Welfare',
  'volunteer', 'animal', '1 week',
  'One of the most recommended free-to-volunteer animal organizations in Southeast Asia. Dog walking, bathing, veterinary assistance, kennel cleaning, and helping with spay/neuter campaigns. No volunteer fee — just show up. Budget guesthouses nearby for around USD 15-25/night.',
  'https://www.lantaanimalwelfare.com',
  true,
  '{"skills_needed": [], "languages": ["English"], "includes_accommodation": false, "includes_meals": false, "cost_note": "No volunteer fee", "how_to_apply": "Walk in or contact via website/Facebook", "what_volunteers_do": "Dog walking, bathing, veterinary assistance, kennel cleaning, cat socialization, spay/neuter campaign support", "email": null}'::jsonb,
  'morning', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- Wildlife Friends Foundation Thailand — Phuket (nearest city)
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:wildlife-friends-foundation'),
  '19aa31e1-c413-5b05-8901-0b00ebafa230', -- Bangkok (closest major city)
  'wildlife-friends-foundation-volunteer',
  'Wildlife Friends Foundation Thailand',
  'volunteer', 'animal', '1 week',
  'Located in Phetchaburi (2.5 hours south of Bangkok), WFFT rescues bears, tigers, elephants, primates, and birds. Volunteers prepare food, clean enclosures, assist with behavioral enrichment, and support education programs. On-site volunteer house with accommodation and meals included. Direct booking — no agency middleman.',
  'https://www.wfft.org',
  true,
  '{"skills_needed": [], "languages": ["English"], "includes_accommodation": true, "includes_meals": true, "cost_note": "USD 380/week (covers accommodation, meals, transport from Bangkok)", "how_to_apply": "Book directly via website", "what_volunteers_do": "Prepare food for rescued animals, clean enclosures, behavioral enrichment, education programs", "email": null}'::jsonb,
  'morning', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- Reef Check — Koh Tao
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:reef-check-koh-tao'),
  '4006bf97-02cd-55bc-aabb-e2001e983faf', -- Koh Tao
  'reef-check-koh-tao-volunteer',
  'Reef Check Thailand',
  'volunteer', 'conservation', '3 days',
  'Scientifically rigorous coral reef monitoring on Koh Tao. Volunteers conduct underwater surveys, collect data, and participate in reef restoration and marine debris removal. Requires PADI Open Water certification minimum. Data contributes to global reef monitoring. Perfect for divers who want their dives to count.',
  'https://www.reefcheck.org',
  true,
  '{"skills_needed": ["PADI Open Water certification"], "languages": ["English"], "includes_accommodation": false, "includes_meals": false, "cost_note": "Survey diver training ~USD 200; Koh Tao has abundant budget accommodation", "how_to_apply": "Contact via website for training schedule", "what_volunteers_do": "Underwater coral reef surveys, data collection, reef restoration, marine debris removal", "email": null}'::jsonb,
  'morning', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- Mercy Centre — Bangkok
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:mercy-centre-bangkok'),
  '19aa31e1-c413-5b05-8901-0b00ebafa230', -- Bangkok
  'mercy-centre-bangkok-volunteer',
  'Mercy Centre',
  'volunteer', 'teaching', '2 weeks',
  'Well-established NGO in Bangkok teaching English and life skills to street children and slum community youth. Volunteers assist in after-school programs and community engagement. Frequently recommended on solo travel forums for Bangkok. No placement fee — volunteers arrange own accommodation.',
  'https://www.mercycentre.org',
  true,
  '{"skills_needed": ["English fluency"], "languages": ["English"], "includes_accommodation": false, "includes_meals": false, "cost_note": "No placement fee; volunteers cover own accommodation", "how_to_apply": "Apply via website", "what_volunteers_do": "Teach English and life skills to street children, assist in after-school programs", "email": null}'::jsonb,
  'afternoon', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- ── VIETNAM ──────────────────────────────────────────────

-- Blue Dragon Children's Foundation — Hanoi
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:blue-dragon-hanoi'),
  'c3b16617-37de-5b65-b7aa-1eff660955ad', -- Hanoi
  'blue-dragon-hanoi-volunteer',
  'Blue Dragon Children''s Foundation',
  'volunteer', 'teaching', '3 months',
  'Australian-founded organization in Hanoi supporting street youth and trafficking survivors. Volunteers teach English, tutor, and mentor young people. Longer commitment required (3 months for teaching) but the impact is profound. Featured in major international press. Solo women frequently recommend this organization.',
  'https://www.bluedragon.org',
  true,
  '{"skills_needed": ["English fluency", "Teaching experience preferred"], "languages": ["English"], "includes_accommodation": false, "includes_meals": false, "cost_note": "No placement fee; accommodation in Hanoi ~USD 300-500/month", "how_to_apply": "Apply via website", "what_volunteers_do": "English teaching, tutoring, mentoring street youth and trafficking survivors", "email": null}'::jsonb,
  'any', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- KOTO (Know One Teach One) — Hanoi
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:koto-hanoi'),
  'c3b16617-37de-5b65-b7aa-1eff660955ad', -- Hanoi
  'koto-hanoi-volunteer',
  'KOTO — Know One Teach One',
  'volunteer', 'teaching', '1 month',
  'Award-winning social enterprise training street youth in hospitality and life skills. Volunteers help with English teaching and vocational training support. KOTO also runs a restaurant in Hanoi where the trainees work — you can eat there too. No placement fee.',
  'https://www.koto.com.au',
  true,
  '{"skills_needed": ["English fluency"], "languages": ["English"], "includes_accommodation": false, "includes_meals": false, "cost_note": "No placement fee", "how_to_apply": "Apply via website", "what_volunteers_do": "Hospitality and life skills training for street youth, English teaching, vocational training support", "email": null}'::jsonb,
  'any', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- Saigon Children's Charity — Ho Chi Minh City
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:saigon-childrens-charity'),
  '80529793-1f29-5f6b-8b01-e58f4385e956', -- Ho Chi Minh City
  'saigon-childrens-charity-volunteer',
  'Saigon Children''s Charity',
  'volunteer', 'teaching', '1 month',
  'UK-registered charity providing education access to underprivileged children in Ho Chi Minh City. Volunteers teach English, tutor students, and support scholarship programs. One of the most cited teaching volunteer organizations in Vietnam. No fee — arrange your own accommodation.',
  'https://www.saigonchildren.com',
  true,
  '{"skills_needed": ["English fluency"], "languages": ["English"], "includes_accommodation": false, "includes_meals": false, "cost_note": "No fee; volunteers arrange own accommodation", "how_to_apply": "Apply via website", "what_volunteers_do": "English teaching, academic tutoring, support for scholarship students", "email": null}'::jsonb,
  'any', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- Sapa O'Chau — Hoi An (closest city we have; actually in Sapa)
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:sapa-ochau'),
  'c3b16617-37de-5b65-b7aa-1eff660955ad', -- Hanoi (gateway city)
  'sapa-ochau-volunteer',
  'Sapa O''Chau',
  'volunteer', 'teaching', '1 week',
  'Founded by a H''mong woman, Sapa O''Chau teaches English to ethnic minority youth in the mountains of northern Vietnam. Volunteers help with English conversation, cultural programs, and trekking guide training. Guesthouse accommodation is connected to the social enterprise. Beloved by solo female travelers for its authentic cultural immersion.',
  'https://www.sapaochau.org',
  true,
  '{"skills_needed": ["English fluency"], "languages": ["English"], "includes_accommodation": true, "includes_meals": false, "cost_note": "Accommodation costs apply (social enterprise model; no placement fee)", "how_to_apply": "Book via website — guesthouse stays support the program", "what_volunteers_do": "English teaching to H''mong youth, cultural programs, trekking guide training", "email": null}'::jsonb,
  'any', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- ── INDONESIA ────────────────────────────────────────────

-- BAWA (Bali Animal Welfare Association) — Ubud
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:bawa-bali'),
  '45667a9e-c10d-51aa-a5a1-b3f260d725fa', -- Ubud
  'bawa-bali-volunteer',
  'Bali Animal Welfare Association (BAWA)',
  'volunteer', 'animal', '2 weeks',
  'Bali''s most prominent animal rescue and welfare organization. Volunteers help with dog socialization, kennel assistance, vaccination campaigns, adoption drives, and vet clinic support. BAWA also runs a rabies control program across the island. No placement fee — optional donation welcome.',
  'https://www.bawabali.com',
  true,
  '{"skills_needed": [], "languages": ["English"], "includes_accommodation": false, "includes_meals": false, "cost_note": "No placement fee; optional donation", "how_to_apply": "Apply via website or walk in", "what_volunteers_do": "Dog socialization, kennel assistance, vaccination campaign support, adoption drives, vet clinic assistance", "email": null}'::jsonb,
  'morning', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- Friends of the National Parks Foundation — Ubud (Nusa Penida)
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:fnpf-bali'),
  '45667a9e-c10d-51aa-a5a1-b3f260d725fa', -- Ubud
  'fnpf-bali-starling-volunteer',
  'Friends of the National Parks Foundation',
  'volunteer', 'conservation', '2 weeks',
  'Based on Nusa Penida (off Bali), FNPF runs the endangered Bali Starling captive breeding and release program. Volunteers support habitat restoration, community education, and wildlife monitoring from an eco-camp. One of the most meaningful conservation volunteering experiences in Indonesia.',
  'https://www.fnpf.org',
  true,
  '{"skills_needed": [], "languages": ["English"], "includes_accommodation": true, "includes_meals": true, "cost_note": "USD 200/week (covers accommodation, meals, park fees)", "how_to_apply": "Apply via website", "what_volunteers_do": "Endangered Bali Starling breeding support, habitat restoration, community education, wildlife monitoring", "email": null}'::jsonb,
  'morning', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- Gili Eco Trust — Gili Islands
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:gili-eco-trust'),
  'a307e2eb-d3ee-5244-b55d-6dab9ba185b5', -- Gili Islands
  'gili-eco-trust-volunteer',
  'Gili Eco Trust',
  'volunteer', 'conservation', 'Drop-in',
  'Marine conservation on Gili Trawangan. Join reef cleanup dives, coral transplanting, glass-bottom boat surveys, or beach cleanups. No minimum commitment — even a single dive counts. Certified divers volunteer free; non-divers can join beach cleanups. One of the easiest volunteer opportunities to join while traveling.',
  'https://www.giliecotrust.com',
  true,
  '{"skills_needed": ["Dive certification helpful but not required"], "languages": ["English"], "includes_accommodation": false, "includes_meals": false, "cost_note": "No fee for certified divers; equipment rental costs if not certified", "how_to_apply": "Walk in or check schedule on website", "what_volunteers_do": "Reef monitoring, cleanup dives, coral transplanting, glass-bottom boat surveys, beach cleanup", "email": null}'::jsonb,
  'morning', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- Bali Kids — Canggu/Denpasar
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:bali-kids'),
  'cf0acfb1-d56d-54cf-a249-2dc074b6fce0', -- Canggu
  'bali-kids-volunteer',
  'Bali Kids',
  'volunteer', 'healthcare', '1 month',
  'Australian-founded organization supporting medical outreach for malnourished children in Bali. Volunteers assist with health education, community health screenings, and nutrition programs. Medical background preferred for clinical roles but support positions are open to all. No placement fee.',
  'https://www.balikids.org',
  true,
  '{"skills_needed": ["Medical background preferred for clinical roles"], "languages": ["English"], "includes_accommodation": false, "includes_meals": false, "cost_note": "No placement fee", "how_to_apply": "Apply via website", "what_volunteers_do": "Medical outreach support, health education, community health screenings, nutrition programs", "email": null}'::jsonb,
  'any', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- ── CAMBODIA ─────────────────────────────────────────────

-- ConCERT — Siem Reap
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:concert-siem-reap'),
  'bdc3914c-9d78-5896-8714-a2cb60263df5', -- Siem Reap
  'concert-siem-reap-volunteer',
  'ConCERT Cambodia',
  'volunteer', 'community', '1 week',
  'Free volunteer matching service in Siem Reap — specifically designed to avoid the agency fee model. ConCERT connects travelers directly with local Cambodian NGOs for teaching, construction, farming, and healthcare volunteering. Endorsed by responsible tourism advocates. No fee to use.',
  'https://www.concertcambodia.org',
  true,
  '{"skills_needed": [], "languages": ["English"], "includes_accommodation": false, "includes_meals": false, "cost_note": "No fee (ConCERT is free; some partner NGOs have small program contributions)", "how_to_apply": "Visit their office in Siem Reap or contact via website", "what_volunteers_do": "Matches you with local NGOs based on your skills and interests — teaching, construction, farming, healthcare", "email": null}'::jsonb,
  'any', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- JWOC (Journeys Within Our Community) — Siem Reap
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:jwoc-siem-reap'),
  'bdc3914c-9d78-5896-8714-a2cb60263df5', -- Siem Reap
  'jwoc-siem-reap-volunteer',
  'Journeys Within Our Community (JWOC)',
  'volunteer', 'teaching', '1 month',
  'Sustainable volunteer organization connected to a hotel that funds the NGO. Volunteers teach English, run library programs, and work on clean water and sanitation projects. No placement fee. JWOC''s model is genuinely ethical — the connected hotel Journeys Within funds the charity directly.',
  'https://www.jwoc.org',
  true,
  '{"skills_needed": ["English fluency"], "languages": ["English"], "includes_accommodation": false, "includes_meals": false, "cost_note": "No volunteer placement fee", "how_to_apply": "Apply via website", "what_volunteers_do": "English teaching, library programs, clean water and sanitation projects, teacher training", "email": null}'::jsonb,
  'any', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- Lotus Outreach — Siem Reap
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:lotus-outreach-cambodia'),
  'bdc3914c-9d78-5896-8714-a2cb60263df5', -- Siem Reap
  'lotus-outreach-cambodia-volunteer',
  'Lotus Outreach Cambodia',
  'volunteer', 'community', '1 month',
  'Women''s empowerment-focused organization in Siem Reap running girls'' education programs, anti-trafficking awareness, and vocational training. Especially relevant for women travelers who want to support other women. No placement fee.',
  'https://www.lotusoutreach.org',
  true,
  '{"skills_needed": [], "languages": ["English"], "includes_accommodation": false, "includes_meals": false, "cost_note": "No placement fee", "how_to_apply": "Apply via website", "what_volunteers_do": "Girls'' education programs, anti-trafficking awareness, vocational training support", "email": null}'::jsonb,
  'any', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- Cambodian Children's Fund — Phnom Penh
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:cambodian-childrens-fund'),
  'f176a087-8256-55c6-9d5d-b95660d5bedf', -- Phnom Penh
  'cambodian-childrens-fund-volunteer',
  'Cambodian Children''s Fund',
  'volunteer', 'teaching', '3 months',
  'Large, well-funded education organization in Phnom Penh. Volunteers tutor English, help in the library, run arts and drama programs, and teach IT skills to at-risk youth. Longer commitment required (3 months for teaching roles). No placement fee.',
  'https://www.cambodianchildrensfund.org',
  true,
  '{"skills_needed": ["English fluency"], "languages": ["English"], "includes_accommodation": false, "includes_meals": false, "cost_note": "No placement fee", "how_to_apply": "Apply via website — background check required", "what_volunteers_do": "English tutoring, library assistance, arts and drama programs, IT skills training", "email": null}'::jsonb,
  'any', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- Tabitha Cambodia — Phnom Penh
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:tabitha-cambodia'),
  'f176a087-8256-55c6-9d5d-b95660d5bedf', -- Phnom Penh
  'tabitha-cambodia-volunteer',
  'Tabitha Cambodia',
  'volunteer', 'construction', '1 week',
  'Build homes for extremely poor families in rural Cambodia. Tabitha runs organized build weeks where volunteers work alongside partner families. Accommodation and meals included during build weeks. One of the most hands-on, tangible volunteer experiences in Southeast Asia.',
  'https://www.tabitha.com.au',
  true,
  '{"skills_needed": [], "languages": ["English"], "includes_accommodation": true, "includes_meals": true, "cost_note": "USD 400-600/build week (covers accommodation, meals, materials)", "how_to_apply": "Apply via website for build week dates", "what_volunteers_do": "Build homes with partner families, site clearing, foundation and wall work, roofing", "email": null}'::jsonb,
  'morning', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- ── PHILIPPINES ──────────────────────────────────────────

-- Gawad Kalinga — Manila
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:gawad-kalinga'),
  '410b6f38-89c8-5242-a46b-74f1edbe2bf3', -- Manila
  'gawad-kalinga-volunteer',
  'Gawad Kalinga',
  'volunteer', 'construction', '1 week',
  'The Philippines'' most well-known community development NGO. Volunteers build homes and community facilities in urban poor settlements, help with community gardens, and support livelihood programs. Well-organized international volunteer program with group builds available. Accommodation included during builds.',
  'https://www.gk1world.com',
  true,
  '{"skills_needed": [], "languages": ["English"], "includes_accommodation": true, "includes_meals": true, "cost_note": "USD 200-400/week contribution for build programs", "how_to_apply": "Apply via website for upcoming build schedules", "what_volunteers_do": "Build homes, community facilities, gardens; support livelihood and savings programs", "email": null}'::jsonb,
  'morning', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- PAWS Philippines — Manila
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:paws-philippines'),
  '410b6f38-89c8-5242-a46b-74f1edbe2bf3', -- Manila
  'paws-philippines-volunteer',
  'PAWS — Philippine Animal Welfare Society',
  'volunteer', 'animal', 'Drop-in',
  'The Philippines'' most prominent animal welfare organization. Shelter volunteering includes dog/cat care, socialization, adoption drives, and spay/neuter campaign support. Weekend drop-in volunteering is possible — no minimum commitment. Great for travelers passing through Manila who want a meaningful morning.',
  'https://www.paws.org.ph',
  true,
  '{"skills_needed": [], "languages": ["English", "Filipino"], "includes_accommodation": false, "includes_meals": false, "cost_note": "No fee", "how_to_apply": "Check website for volunteer schedule — weekend sessions available", "what_volunteers_do": "Shelter assistance, dog/cat care, socialization, adoption drives, spay/neuter support, fostering", "email": null}'::jsonb,
  'morning', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- Katala Foundation — Puerto Princesa (El Nido gateway)
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:katala-foundation'),
  '0abddf4d-c01d-5dfc-b362-1ef8f3c4a963', -- Puerto Princesa
  'katala-foundation-volunteer',
  'Katala Foundation',
  'volunteer', 'conservation', '2 weeks',
  'Protects the critically endangered Philippine Cockatoo (Katala) in Palawan. Volunteers monitor wild populations, conduct habitat surveys, support community education, and assist with anti-poaching patrols. Field station accommodation included. One of the few orgs offering direct wildlife monitoring access.',
  'https://www.katalafoundation.org',
  true,
  '{"skills_needed": ["Basic fitness for field work"], "languages": ["English"], "includes_accommodation": true, "includes_meals": false, "cost_note": "USD 150-200/2 weeks (covers accommodation)", "how_to_apply": "Contact via website", "what_volunteers_do": "Monitor endangered cockatoo populations, habitat surveys, community education, anti-poaching patrol support", "email": null}'::jsonb,
  'morning', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- ── MALAYSIA ─────────────────────────────────────────────

-- Ecoteer — Penang / various
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:ecoteer-malaysia'),
  '6a9685f6-613d-5426-ab3a-8347b3554ba2', -- Penang
  'ecoteer-malaysia-volunteer',
  'Ecoteer — Sea Turtle & Mangrove Conservation',
  'volunteer', 'conservation', '1 week',
  'Mangrove planting, sea turtle nest monitoring and protection, beach patrol, and juvenile turtle release along Malaysia''s coast. Accommodation in eco-lodge included. A direct conservation program with no separate agency fee — your payment goes to the project.',
  'https://www.ecoteer.com',
  true,
  '{"skills_needed": [], "languages": ["English"], "includes_accommodation": true, "includes_meals": true, "cost_note": "USD 200-350/week (covers accommodation, meals, transport — goes to conservation)", "how_to_apply": "Book directly via website", "what_volunteers_do": "Mangrove planting, sea turtle nest monitoring, beach patrol, juvenile turtle release", "email": null}'::jsonb,
  'any', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- SPCA Penang
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:spca-penang'),
  '6a9685f6-613d-5426-ab3a-8347b3554ba2', -- Penang
  'spca-penang-volunteer',
  'SPCA Penang',
  'volunteer', 'animal', 'Drop-in',
  'One of Malaysia''s oldest animal welfare organizations. Regular weekly volunteer slots for dog walking, cat socialization, kennel work, adoption events, and fundraising. No minimum commitment — drop in for a session. No fee.',
  'https://www.spcapenang.org.my',
  true,
  '{"skills_needed": [], "languages": ["English", "Malay"], "includes_accommodation": false, "includes_meals": false, "cost_note": "No fee", "how_to_apply": "Check website for weekly volunteer schedule", "what_volunteers_do": "Dog walking, cat socialization, kennel work, adoption events, fundraising", "email": null}'::jsonb,
  'morning', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- HUTAN Kinabatangan — Kota Kinabalu
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:hutan-kinabatangan'),
  'ece6da3e-8fc2-59e0-8ffe-5b11a27de113', -- Kota Kinabalu
  'hutan-kinabatangan-volunteer',
  'HUTAN — Kinabatangan Wildlife Conservation',
  'volunteer', 'conservation', '1 week',
  'One of Malaysia''s most respected primate research and conservation NGOs, working in the Kinabatangan River corridor of Sabah (Borneo). Volunteers help with reforestation, habitat restoration corridor planting, and wildlife monitoring for orangutans, pygmy elephants, and proboscis monkeys. Basic field station accommodation.',
  'https://www.hutan.org.my',
  true,
  '{"skills_needed": ["Basic fitness for jungle conditions"], "languages": ["English"], "includes_accommodation": true, "includes_meals": false, "cost_note": "Small program fee", "how_to_apply": "Contact via website", "what_volunteers_do": "Reforestation, habitat corridor planting, wildlife monitoring (orangutans, pygmy elephants, proboscis monkeys)", "email": null}'::jsonb,
  'morning', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- ── LAOS ─────────────────────────────────────────────────

-- Big Brother Mouse — Luang Prabang
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:big-brother-mouse'),
  'a89f43d9-b8e4-53f5-a641-0c2739982827', -- Luang Prabang
  'big-brother-mouse-volunteer',
  'Big Brother Mouse',
  'volunteer', 'teaching', 'Drop-in',
  'The most flexible volunteer opportunity in Southeast Asia. Join English conversation practice sessions with local students and monks — sessions last about an hour. No minimum commitment, no fee, just walk in. A suggested book donation of USD 10-20 supports literacy programs. Famous on the backpacker circuit for a reason.',
  'https://www.bigbrothermouse.com',
  true,
  '{"skills_needed": ["English fluency"], "languages": ["English"], "includes_accommodation": false, "includes_meals": false, "cost_note": "No fee; book donation of ~USD 10-20 suggested", "how_to_apply": "Walk in — sessions posted on noticeboard outside", "what_volunteers_do": "English conversation practice with students and monks, book donations, literacy programs", "email": null}'::jsonb,
  'afternoon', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- COPE Visitor Centre — Vientiane
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:cope-laos'),
  '7411addf-c299-5eb7-8465-8fe50dc9473e', -- Vientiane
  'cope-laos-volunteer',
  'COPE — Cooperative Orthotic & Prosthetic Enterprise',
  'volunteer', 'community', 'Drop-in',
  'Laos is the most bombed country per capita in history. COPE provides prosthetics and rehabilitation for UXO (unexploded ordnance) victims. Volunteers support fundraising, awareness campaigns, and visitor centre operations. The visitor centre itself is a must-see — powerful and educational.',
  'https://www.copelaos.org',
  true,
  '{"skills_needed": [], "languages": ["English"], "includes_accommodation": false, "includes_meals": false, "cost_note": "No fee", "how_to_apply": "Visit the centre or contact via website", "what_volunteers_do": "Fundraising support, awareness campaigns, visitor centre operations, prosthetics program support", "email": null}'::jsonb,
  'any', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- ── SINGAPORE ────────────────────────────────────────────

-- Willing Hearts — Singapore
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:willing-hearts-singapore'),
  '9ee72f23-fbb1-5edf-882e-c69ea73af58b', -- Singapore
  'willing-hearts-singapore-volunteer',
  'Willing Hearts',
  'volunteer', 'community', 'Drop-in',
  'Singapore''s most beloved volunteer organization. Prepare and distribute daily meals to 3,000+ elderly, disabled, and low-income residents. Kitchen volunteering with no fees, no red tape — just show up. Perfect for a meaningful morning during a Singapore layover.',
  'https://www.willinghearts.org.sg',
  true,
  '{"skills_needed": [], "languages": ["English"], "includes_accommodation": false, "includes_meals": false, "cost_note": "No fee", "how_to_apply": "Just show up — morning sessions available daily", "what_volunteers_do": "Prepare and distribute meals to 3,000+ elderly, disabled, and low-income residents", "email": null}'::jsonb,
  'morning', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- SPCA Singapore
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:spca-singapore'),
  '9ee72f23-fbb1-5edf-882e-c69ea73af58b', -- Singapore
  'spca-singapore-volunteer',
  'SPCA Singapore',
  'volunteer', 'animal', 'Drop-in',
  'Singapore''s primary animal welfare organization. Volunteers help with animal care, dog walking, cat enrichment, adoption events, and administrative support. Training session required before starting. Well-organized program with regular slots.',
  'https://www.spca.org.sg',
  true,
  '{"skills_needed": [], "languages": ["English"], "includes_accommodation": false, "includes_meals": false, "cost_note": "No fee", "how_to_apply": "Register via website — orientation session required", "what_volunteers_do": "Animal care, dog walking, cat enrichment, adoption events, administrative support", "email": null}'::jsonb,
  'morning', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- Marine Conservation Society Singapore
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:mcss-singapore'),
  '9ee72f23-fbb1-5edf-882e-c69ea73af58b', -- Singapore
  'mcss-singapore-volunteer',
  'Marine Conservation Society Singapore',
  'volunteer', 'conservation', 'Drop-in',
  'Singapore has surviving coral reefs — MCSS is the primary organization protecting them. Join reef cleanup dives, coral monitoring, citizen science data collection, and beach surveys. No minimum commitment — join individual events.',
  'https://www.mcss.org.sg',
  true,
  '{"skills_needed": ["Dive certification for reef dives"], "languages": ["English"], "includes_accommodation": false, "includes_meals": false, "cost_note": "No fee (own dive gear or rental costs apply)", "how_to_apply": "Check website for upcoming events", "what_volunteers_do": "Reef cleanup dives, coral monitoring, citizen science data collection, beach surveys", "email": null}'::jsonb,
  'morning', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- ── TAIWAN ───────────────────────────────────────────────

-- Taroko National Park Volunteer Program
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:taroko-national-park'),
  '136eee54-06d9-58bc-afcb-853653fb0f44', -- Taipei (gateway)
  'taroko-national-park-volunteer',
  'Taroko National Park Volunteer Program',
  'volunteer', 'conservation', '5 days',
  'Taiwan''s flagship national park runs a direct volunteer program. Help with trail maintenance, environmental education, visitor guidance, and biodiversity monitoring in one of Asia''s most spectacular gorge landscapes. Accommodation at ranger station included. No fee.',
  'https://www.taroko.gov.tw',
  true,
  '{"skills_needed": ["Basic fitness for hiking"], "languages": ["English", "Mandarin helpful"], "includes_accommodation": true, "includes_meals": false, "cost_note": "No fee (accommodation provided by park)", "how_to_apply": "Apply via park website — seasonal programs", "what_volunteers_do": "Trail maintenance, environmental education, visitor guidance, biodiversity monitoring", "email": null}'::jsonb,
  'morning', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- ReefCheck Taiwan
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:reefcheck-taiwan'),
  'be06a2a8-8ca8-58fb-9471-a78f187dae73', -- Tainan (closest to Kenting)
  'reefcheck-taiwan-volunteer',
  'ReefCheck Taiwan',
  'volunteer', 'conservation', '3 days',
  'Part of the global Reef Check network. Conduct coral reef surveys and marine biodiversity monitoring at Kenting (southern Taiwan) and outlying islands. Taiwan''s coral reefs are among Asia''s healthiest. Survey diver training available.',
  'https://www.reefcheck.org.tw',
  true,
  '{"skills_needed": ["Dive certification"], "languages": ["English", "Mandarin"], "includes_accommodation": false, "includes_meals": false, "cost_note": "Survey training fee applies", "how_to_apply": "Contact via website for training schedule", "what_volunteers_do": "Coral reef surveys, marine biodiversity monitoring, dive surveys", "email": null}'::jsonb,
  'morning', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;

-- ── MYANMAR (with safety note) ───────────────────────────

-- All Hands and Hearts — Yangon
INSERT INTO places (id, city_id, slug, name, place_type, volunteer_type, min_commitment, description, website, is_active, volunteer_details, best_time_of_day, original_type)
VALUES (
  uuid_generate_v5(uuid_ns_url(), 'volunteer:all-hands-hearts-myanmar'),
  '959233a5-0225-5c5a-ba17-3fc853c00a43', -- Yangon
  'all-hands-hearts-myanmar-volunteer',
  'All Hands and Hearts',
  'volunteer', 'construction', '2 weeks',
  'International disaster relief organization rebuilding schools, community centers, and homes after cyclones and floods. Accommodation at volunteer camp included. Note: Myanmar''s political situation (post-2021 coup) significantly affects volunteering. Verify current safety and operational status before planning.',
  'https://www.allhandsandhearts.org',
  true,
  '{"skills_needed": [], "languages": ["English"], "includes_accommodation": true, "includes_meals": true, "cost_note": "USD 60 one-time registration fee", "how_to_apply": "Apply via website — check for active Myanmar programs", "what_volunteers_do": "Disaster relief construction — rebuilding schools, community centers, homes", "email": null}'::jsonb,
  'morning', 'volunteer'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  volunteer_details = EXCLUDED.volunteer_details;
