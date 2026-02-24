-- Backfill guide v2 fields for 7 countries missing content
-- Safe to re-run: UPDATE only, sets fields that are currently NULL

-- Cambodia
UPDATE countries SET
  vibe_summary = 'Raw, resilient, deeply spiritual — temples, floating villages, and a nation rebuilding with fierce pride',
  social_vibe = 'Backpacker-friendly with a close-knit traveler community; Siem Reap and Phnom Penh hostels are social hubs',
  transport_summary = 'Tuk-tuks everywhere, decent bus network between cities, domestic flights for longer routes',
  cultural_note = 'Temple dress codes are strict (cover knees and shoulders); remove shoes before entering pagodas'
WHERE slug = 'cambodia';

-- Laos
UPDATE countries SET
  vibe_summary = 'Slow, serene, and spiritual — Southeast Asia before the crowds found it',
  social_vibe = 'Smaller traveler community but tight-knit; Luang Prabang and Vang Vieng are the main social hubs',
  transport_summary = 'Slow buses and river boats; the new China-Laos railway connects Vientiane to Luang Prabang in 2 hours',
  cultural_note = 'Modest dress expected near temples; the morning alms ceremony in Luang Prabang is sacred — observe silently from a distance'
WHERE slug = 'laos';

-- Malaysia
UPDATE countries SET
  vibe_summary = 'A melting pot of Malay, Chinese, and Indian cultures with world-class food and modern infrastructure',
  social_vibe = 'Easy to connect in hostels and on Borneo dive trips; KL and Penang have active solo traveler scenes',
  transport_summary = 'Excellent buses and trains between cities; Grab (ride-hailing) is reliable and affordable nationwide',
  cultural_note = 'Malaysia is majority Muslim; dress modestly at mosques and in conservative areas, though KL and Penang are cosmopolitan'
WHERE slug = 'malaysia';

-- Myanmar
UPDATE countries SET
  vibe_summary = 'Ancient, otherworldly, and deeply Buddhist — thousands of temples emerging from morning mist',
  social_vibe = 'Small but dedicated traveler community; Bagan, Inle Lake, and Yangon are the main meeting points',
  transport_summary = 'Overnight buses connect major cities; domestic flights save time on longer routes; local transport is basic',
  cultural_note = 'Remove shoes at all religious sites (including outdoor temple complexes); longyi (sarong) is appropriate dress for temple visits'
WHERE slug = 'myanmar';

-- Philippines
UPDATE countries SET
  vibe_summary = 'Island-hopping paradise with 7,641 islands, warm locals, and a backpacker-friendly vibe',
  social_vibe = 'Filipinos are genuinely warm and social; hostel scenes in El Nido, Siargao, and Cebu make meeting people effortless',
  transport_summary = 'Domestic flights between islands are cheap (Cebu Pacific); tricycles and jeepneys for local transport; boats between islands',
  cultural_note = 'Filipinos are hospitable and will go out of their way to help; ''po'' and ''opo'' are respectful ways to say yes to elders'
WHERE slug = 'philippines';

-- Singapore
UPDATE countries SET
  vibe_summary = 'Ultra-efficient, spotlessly clean, with world-class food hidden in humble hawker centers',
  social_vibe = 'More of a solo exploration city than a backpacker hub; meetups, coworking spaces, and food tours are the best way to connect',
  transport_summary = 'World-class MRT system, affordable and air-conditioned; Grab for taxis; the entire island is easily navigable',
  cultural_note = 'Strict laws on littering, gum, and jaywalking are real and enforced; respect the multicultural mix of Chinese, Malay, and Indian traditions'
WHERE slug = 'singapore';

-- Taiwan (only social_vibe, transport_summary, cultural_note — vibe_summary already set)
UPDATE countries SET
  social_vibe = 'Solo-friendly with a welcoming local culture; night markets and hiking groups are natural meeting points',
  transport_summary = 'High-speed rail (THSR) connects north to south in 90 minutes; Taipei MRT is world-class; EasyCard works everywhere',
  cultural_note = 'Taiwanese are warm and polite; recycling is taken seriously at public bins; temple etiquette requires modest dress'
WHERE slug = 'taiwan';
