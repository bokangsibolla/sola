-- Migration: Enrich Southern Africa city areas with positioning lines, target traveler profiles, and hero images
-- Covers 31 areas across South Africa, Lesotho, Zimbabwe, Namibia, and Mozambique

-- ============================================================
-- CAPE TOWN (6 areas)
-- ============================================================

UPDATE city_areas SET
  positioning_line = 'Atlantic seaboard living with a safe coastal promenade',
  who_it_suits = 'Solo travelers who want walkable streets, ocean views, and easy access to everything',
  hero_image_url = 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800'
WHERE slug = 'sea-point';

UPDATE city_areas SET
  positioning_line = 'Palm-lined beach strip beneath the Twelve Apostles',
  who_it_suits = 'Travelers who want sunset drinks, beach days, and a polished scene',
  hero_image_url = 'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?w=800'
WHERE slug = 'camps-bay';

UPDATE city_areas SET
  positioning_line = 'Creative, affordable neighborhood with a student-town energy',
  who_it_suits = 'Budget-conscious travelers who want local character over polish',
  hero_image_url = 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=800'
WHERE slug = 'observatory';

UPDATE city_areas SET
  positioning_line = 'Central neighborhood at the foot of Table Mountain',
  who_it_suits = 'Solo travelers who want walkable restaurants and easy mountain access',
  hero_image_url = 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800'
WHERE slug = 'gardens';

UPDATE city_areas SET
  positioning_line = 'Historic Cape Malay quarter with colorful houses and deep roots',
  who_it_suits = 'Culturally curious travelers who want history and cooking experiences',
  hero_image_url = 'https://images.unsplash.com/photo-1585061528657-dd739e423e0e?w=800'
WHERE slug = 'bo-kaap';

UPDATE city_areas SET
  positioning_line = 'Arts-driven neighborhood with markets, studios, and street art',
  who_it_suits = 'Creative travelers who want galleries, food markets, and local design',
  hero_image_url = 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=800'
WHERE slug = 'woodstock';

-- ============================================================
-- JOHANNESBURG (4 areas)
-- ============================================================

UPDATE city_areas SET
  positioning_line = 'Johannesburg''s upscale business hub with secure hotels and dining',
  who_it_suits = 'Travelers who want a safe, well-connected base with modern amenities',
  hero_image_url = 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=800'
WHERE slug = 'sandton';

UPDATE city_areas SET
  positioning_line = 'Walkable precinct with galleries, rooftop markets, and boutiques',
  who_it_suits = 'Solo travelers who want art, shopping, and a relaxed urban pace',
  hero_image_url = 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=800'
WHERE slug = 'rosebank';

UPDATE city_areas SET
  positioning_line = 'Inner-city arts district with studios, markets, and street art',
  who_it_suits = 'Adventurous travelers comfortable with urban grit and creative energy',
  hero_image_url = 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=800'
WHERE slug = 'maboneng';

UPDATE city_areas SET
  positioning_line = 'Bohemian strip with independent cafes and a young creative crowd',
  who_it_suits = 'Travelers who want a neighborhood feel with cafes and nightlife',
  hero_image_url = 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=800'
WHERE slug = 'melville';

-- ============================================================
-- DURBAN (3 areas)
-- ============================================================

UPDATE city_areas SET
  positioning_line = 'Upscale coastal suburb with safe beaches and the iconic whale-bone pier',
  who_it_suits = 'Travelers who want a comfortable beach base with good infrastructure',
  hero_image_url = 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800'
WHERE slug = 'umhlanga';

UPDATE city_areas SET
  positioning_line = 'Victorian-era dining strip with Durban''s best restaurants and bars',
  who_it_suits = 'Foodies and solo diners who want walkable evening options',
  hero_image_url = 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800'
WHERE slug = 'florida-road';

UPDATE city_areas SET
  positioning_line = 'Urban beachfront with the Golden Mile boardwalk and uShaka Marine World',
  who_it_suits = 'Active travelers who want beach walks, aquariums, and ocean views',
  hero_image_url = 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800'
WHERE slug = 'beachfront';

-- ============================================================
-- KRUGER NATIONAL PARK (2 areas)
-- ============================================================

UPDATE city_areas SET
  positioning_line = 'Highest game density in the park with iconic rest camps on the Sabie River',
  who_it_suits = 'First-time safari visitors who want reliable Big Five sightings',
  hero_image_url = 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800'
WHERE slug = 'kruger-south';

UPDATE city_areas SET
  positioning_line = 'Quieter section with dramatic river views and fewer day visitors',
  who_it_suits = 'Experienced safari-goers who prefer solitude and self-drive exploration',
  hero_image_url = 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800'
WHERE slug = 'kruger-central';

-- ============================================================
-- LESOTHO - MASERU (1 area)
-- ============================================================

UPDATE city_areas SET
  positioning_line = 'Lesotho''s compact capital and gateway to the highland interior',
  who_it_suits = 'Travelers using Maseru as a practical base before heading into the mountains',
  hero_image_url = 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800'
WHERE slug = 'maseru-center';

-- ============================================================
-- LESOTHO - SEMONKONG (1 area)
-- ============================================================

UPDATE city_areas SET
  positioning_line = 'Remote highland village at the edge of Maletsunyane Falls',
  who_it_suits = 'Adventure travelers who want genuine remoteness and mountain experiences',
  hero_image_url = 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800'
WHERE slug = 'semonkong-village';

-- ============================================================
-- ZIMBABWE - VICTORIA FALLS (2 areas)
-- ============================================================

UPDATE city_areas SET
  positioning_line = 'Walkable adventure town built around one of the world''s great waterfalls',
  who_it_suits = 'Solo travelers who want easy access to the falls and adventure activities',
  hero_image_url = 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=800'
WHERE slug = 'victoria-falls-town';

UPDATE city_areas SET
  positioning_line = 'Quiet lodges along the upper Zambezi with sunset cruise departures',
  who_it_suits = 'Travelers who want riverside tranquility away from the tourist center',
  hero_image_url = 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=800'
WHERE slug = 'zambezi-riverside';

-- ============================================================
-- ZIMBABWE - HARARE (2 areas)
-- ============================================================

UPDATE city_areas SET
  positioning_line = 'Leafy residential neighborhood with cafes, galleries, and a local pace',
  who_it_suits = 'Travelers who want a quiet, walkable base with good restaurants',
  hero_image_url = 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800'
WHERE slug = 'avondale';

UPDATE city_areas SET
  positioning_line = 'Upscale suburb with Harare''s best shopping and a cosmopolitan crowd',
  who_it_suits = 'Travelers who want comfort, security, and practical amenities',
  hero_image_url = 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800'
WHERE slug = 'borrowdale';

-- ============================================================
-- ZIMBABWE - MASVINGO (1 area)
-- ============================================================

UPDATE city_areas SET
  positioning_line = 'Gateway town to the Great Zimbabwe ruins and Lake Mutirikwi',
  who_it_suits = 'History-focused travelers visiting Great Zimbabwe',
  hero_image_url = 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800'
WHERE slug = 'masvingo-center';

-- ============================================================
-- NAMIBIA - WINDHOEK (2 areas)
-- ============================================================

UPDATE city_areas SET
  positioning_line = 'Compact capital blending German colonial architecture with modern Namibia',
  who_it_suits = 'Travelers using Windhoek as a staging point for desert and safari trips',
  hero_image_url = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800'
WHERE slug = 'windhoek-center';

UPDATE city_areas SET
  positioning_line = 'Quiet residential suburb with boutique hotels and garden restaurants',
  who_it_suits = 'Solo travelers who want a peaceful base close to the city center',
  hero_image_url = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800'
WHERE slug = 'klein-windhoek';

-- ============================================================
-- NAMIBIA - SOSSUSVLEI (1 area)
-- ============================================================

UPDATE city_areas SET
  positioning_line = 'The heart of the Namib desert with towering red dunes and Deadvlei',
  who_it_suits = 'Photographers and nature lovers drawn to stark desert landscapes',
  hero_image_url = 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800'
WHERE slug = 'dune-area';

-- ============================================================
-- NAMIBIA - SWAKOPMUND (2 areas)
-- ============================================================

UPDATE city_areas SET
  positioning_line = 'German colonial seaside town and the adventure sports capital of Namibia',
  who_it_suits = 'Active travelers who want sandboarding, skydiving, and coastal charm',
  hero_image_url = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800'
WHERE slug = 'swakopmund-center';

UPDATE city_areas SET
  positioning_line = 'Atlantic waterfront with seafood restaurants and the historic iron jetty',
  who_it_suits = 'Solo diners who want ocean views and fresh Walvis Bay oysters',
  hero_image_url = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800'
WHERE slug = 'swakopmund-waterfront';

-- ============================================================
-- MOZAMBIQUE - MAPUTO (2 areas)
-- ============================================================

UPDATE city_areas SET
  positioning_line = 'Colonial downtown with the central market, street art, and Portuguese-era grandeur',
  who_it_suits = 'Urban explorers who want markets, architecture, and street-level energy',
  hero_image_url = 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800'
WHERE slug = 'maputo-baixa';

UPDATE city_areas SET
  positioning_line = 'Leafy upscale neighborhood with ocean views and Maputo''s grand dame hotel',
  who_it_suits = 'Travelers who want comfort, good cafes, and a quieter pace',
  hero_image_url = 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800'
WHERE slug = 'polana';

-- ============================================================
-- MOZAMBIQUE - TOFO (1 area)
-- ============================================================

UPDATE city_areas SET
  positioning_line = 'Backpacker beach town famous for whale sharks and barefoot living',
  who_it_suits = 'Solo travelers and divers who want ocean adventures and an easy social scene',
  hero_image_url = 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800'
WHERE slug = 'tofo-beachfront';

-- ============================================================
-- MOZAMBIQUE - BAZARUTO (1 area)
-- ============================================================

UPDATE city_areas SET
  positioning_line = 'Pristine island archipelago with turquoise water and luxury lodges',
  who_it_suits = 'Travelers seeking remote island luxury and world-class snorkeling',
  hero_image_url = 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800'
WHERE slug = 'bazaruto-island';
