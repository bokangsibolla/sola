-- Migration: Enrich 64 Southern Africa places with highlights, considerations,
-- timing, duration, physical level, and Google Maps URLs.
-- Covers South Africa, Zimbabwe, Namibia, Mozambique, and Lesotho.

-- ============================================================
-- SOUTH AFRICA — CAPE TOWN (10)
-- ============================================================

UPDATE places SET
  highlights = '["Female dorms available", "Rooftop pool with Signal Hill views", "Walking distance to Sea Point promenade"]'::jsonb,
  considerations = '["Can be noisy on weekends", "Shared bathrooms in dorms"]'::jsonb,
  best_time_of_day = 'any',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Never+Never+Land+Cape+Town'
WHERE slug = 'never-never-land';

UPDATE places SET
  highlights = '["Cable car or multiple hiking routes", "360-degree views of the city and ocean", "Part of a UNESCO World Heritage Site", "Unique fynbos vegetation"]'::jsonb,
  considerations = '["Weather changes rapidly — check conditions before going", "Cable car queues can be long in peak season", "Hiking routes require proper shoes"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '3-5 hours',
  physical_level = 'moderate',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Table+Mountain+Cape+Town'
WHERE slug = 'table-mountain';

UPDATE places SET
  highlights = '["Full moon group hikes are a local tradition", "Dual views of Atlantic and city", "Manageable for most fitness levels", "Free to access"]'::jsonb,
  considerations = '["Some chain-ladder sections near the top", "Parking fills up fast on full moon nights", "Start early for sunrise — headlamp required"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '2-3 hours',
  physical_level = 'moderate',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Lion''s+Head+Sunrise+Hike+Cape+Town'
WHERE slug = 'lions-head-hike';

UPDATE places SET
  highlights = '["Boomslang tree canopy walkway", "Summer sunset concerts on Sundays", "World-class collection of indigenous plants"]'::jsonb,
  considerations = '["Can be crowded on summer weekends", "Limited food options inside — bring a picnic"]'::jsonb,
  best_time_of_day = 'afternoon',
  estimated_duration = '2-3 hours',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Kirstenbosch+National+Botanical+Garden+Cape+Town'
WHERE slug = 'kirstenbosch';

UPDATE places SET
  highlights = '["Learn traditional Cape Malay recipes from local women", "Experience a living neighborhood not a tourist set", "Take home recipes and spice knowledge"]'::jsonb,
  considerations = '["Book through a local operator in advance", "Photography of residents requires permission"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '3-4 hours',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Bo-Kaap+Cooking+Experience+Cape+Town'
WHERE slug = 'bo-kaap-cooking-class';

UPDATE places SET
  highlights = '["Saturday Neighbourgoods Market is the city''s best", "Artisan food stalls and craft beer", "Design-conscious crowd and local art"]'::jsonb,
  considerations = '["Only the Saturday market has the full experience", "Gets very crowded by 11am"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '2-3 hours',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=The+Old+Biscuit+Mill+Cape+Town'
WHERE slug = 'old-biscuit-mill';

UPDATE places SET
  highlights = '["Twelve Apostles mountain backdrop", "Sunset drinks at Chinchilla or Cafe Caprice", "Palm-lined beachfront walkable strip"]'::jsonb,
  considerations = '["Prices are higher than other areas", "See-and-be-seen crowd not for everyone"]'::jsonb,
  best_time_of_day = 'evening',
  estimated_duration = '2-3 hours',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Camps+Bay+Beach+%26+Strip+Cape+Town'
WHERE slug = 'camps-bay-strip';

UPDATE places SET
  highlights = '["Zeitz MOCAA contemporary art museum", "Watershed craft market for South African design", "Working harbor with Table Mountain views"]'::jsonb,
  considerations = '["Tourist-heavy and pricier than city alternatives", "Can feel commercial"]'::jsonb,
  best_time_of_day = 'afternoon',
  estimated_duration = '3-4 hours',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=V%26A+Waterfront+Cape+Town'
WHERE slug = 'va-waterfront';

UPDATE places SET
  highlights = '["Most walkable dining strip in Cape Town", "Range from casual brunch to upscale dinner", "Manna Epicure for breakfast and Yours Truly for dinner"]'::jsonb,
  considerations = '["Some restaurants don''t take reservations", "Gets busy on weekend evenings"]'::jsonb,
  best_time_of_day = 'evening',
  estimated_duration = '1-2 hours',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Kloof+Street+Restaurants+Cape+Town'
WHERE slug = 'kloof-street';

UPDATE places SET
  highlights = '["Safe and well-patrolled coastal walkway", "Perfect for solo morning runs", "Mouille Point lighthouse to Bantry Bay stretch", "Free and accessible 24/7"]'::jsonb,
  considerations = '["Can be windy in the afternoon", "No shade along most of the route"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '1-2 hours',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Sea+Point+Promenade+Cape+Town'
WHERE slug = 'sea-point-promenade';

-- ============================================================
-- SOUTH AFRICA — JOHANNESBURG (6)
-- ============================================================

UPDATE places SET
  highlights = '["World-class exhibition design", "Reframes understanding of South African history", "Allow at least 3 hours to do it justice"]'::jsonb,
  considerations = '["Emotionally demanding experience", "Closed on Mondays", "Located in Ormonde — drive or Uber"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '3-4 hours',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Apartheid+Museum+Johannesburg'
WHERE slug = 'apartheid-museum';

UPDATE places SET
  highlights = '["Former prison where Mandela and Gandhi were held", "Houses South Africa''s Constitutional Court", "Powerful contrast between old and new"]'::jsonb,
  considerations = '["Guided tours recommended for full context", "The area outside the complex requires awareness"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '2-3 hours',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Constitution+Hill+Johannesburg'
WHERE slug = 'constitution-hill';

UPDATE places SET
  highlights = '["Independent boutiques and galleries", "Some of Joburg''s best specialty coffee", "Converted industrial architecture"]'::jsonb,
  considerations = '["Small — can be covered in an hour", "Limited parking on weekends"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '1-2 hours',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=44+Stanley+Johannesburg'
WHERE slug = '44-stanley';

UPDATE places SET
  highlights = '["Sunday market with food and crafts", "Working artist studios", "Street art in surrounding Maboneng"]'::jsonb,
  considerations = '["Visit during daytime only", "Uber in and out recommended"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '2-3 hours',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Arts+on+Main+Johannesburg'
WHERE slug = 'arts-on-main';

UPDATE places SET
  highlights = '["Hector Pieterson Memorial and Mandela House", "Vilakazi Street — only street with two Nobel laureates", "Local shisa nyama lunch experience", "Essential context for understanding South Africa"]'::jsonb,
  considerations = '["Book a reputable guide — not a DIY trip", "Half-day commitment minimum"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '4-5 hours',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Soweto+Guided+Tour+Johannesburg'
WHERE slug = 'soweto-guided-tour';

UPDATE places SET
  highlights = '["Lucky Bean for brunch is a Joburg institution", "Young creative crowd", "Walkable strip with cafes and bars"]'::jsonb,
  considerations = '["Uber to and from — don''t walk between precincts at night", "Quieter on weekdays"]'::jsonb,
  best_time_of_day = 'afternoon',
  estimated_duration = '1-2 hours',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=7th+Street+Melville+Johannesburg'
WHERE slug = 'melville-7th-street';

-- ============================================================
-- SOUTH AFRICA — DURBAN (5)
-- ============================================================

UPDATE places SET
  highlights = '["Aquarium built into a ship hull", "Adjacent beach is one of the safer swimming options", "Good for a half-day"]'::jsonb,
  considerations = '["Can feel touristy", "Food options inside are average"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '3-4 hours',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=uShaka+Marine+World+Durban'
WHERE slug = 'ushaka-marine-world';

UPDATE places SET
  highlights = '["Victorian houses converted into restaurants", "Freedom Cafe for bunny chow", "Walkable dining strip with bars"]'::jsonb,
  considerations = '["Quality varies — stick to recommended spots", "Some bars get loud late"]'::jsonb,
  best_time_of_day = 'evening',
  estimated_duration = '2-3 hours',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Florida+Road+Durban'
WHERE slug = 'florida-road-dining';

UPDATE places SET
  highlights = '["Whale-bone pier and coastal walkway", "Dolphins are common", "Safest beach area near Durban"]'::jsonb,
  considerations = '["Gateway mall nearby for shopping", "Can be windy"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '1-2 hours',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Umhlanga+Promenade+Durban'
WHERE slug = 'umhlanga-promenade';

UPDATE places SET
  highlights = '["Largest Indian diaspora in Africa", "World-class bunny chow and biryani", "Guided food tour with historical context"]'::jsonb,
  considerations = '["Spice levels can be intense", "Book in advance"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '3-4 hours',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Durban+Curry+Trail+Durban'
WHERE slug = 'durban-curry-tour';

UPDATE places SET
  highlights = '["Iconic red-and-white hotel next to the lighthouse", "High tea on the terrace with Indian Ocean views", "Polished service"]'::jsonb,
  considerations = '["Premium pricing", "Worth visiting for tea even if not staying"]'::jsonb,
  best_time_of_day = 'afternoon',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=The+Oyster+Box+Durban'
WHERE slug = 'oyster-box-hotel';

-- ============================================================
-- SOUTH AFRICA — KRUGER (4)
-- ============================================================

UPDATE places SET
  highlights = '["Drive yourself through one of Africa''s great parks", "Southern section has highest game density", "Normal sedan handles tar roads", "Incredibly rewarding solo experience"]'::jsonb,
  considerations = '["Gates open sunrise to sunset — plan accordingly", "Book rest camps months ahead for dry season", "Fuel up before entering"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = 'Full day',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Kruger+National+Park+Self-Drive+Safari'
WHERE slug = 'kruger-self-drive-safari';

UPDATE places SET
  highlights = '["Largest rest camp with full amenities", "Sabie River deck for hippo and elephant watching", "Restaurant and shop on-site"]'::jsonb,
  considerations = '["Book months ahead for dry season", "Can feel busy compared to smaller camps"]'::jsonb,
  best_time_of_day = 'any',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Skukuza+Rest+Camp+Kruger'
WHERE slug = 'skukuza-rest-camp';

UPDATE places SET
  highlights = '["Leave before public gates open", "Expert rangers spot wildlife you''d miss alone", "Open vehicle for unobstructed viewing"]'::jsonb,
  considerations = '["Pre-dawn departure", "Warm layers needed — open vehicles are cold at dawn"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '3-4 hours',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Guided+Sunrise+Game+Drive+Kruger'
WHERE slug = 'kruger-sunrise-drive';

UPDATE places SET
  highlights = '["Prime river frontage", "Sunset deck with reliable elephant and hippo sightings", "Smaller and quieter than Skukuza"]'::jsonb,
  considerations = '["Fewer amenities than larger camps", "Book well in advance"]'::jsonb,
  best_time_of_day = 'any',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Lower+Sabie+Rest+Camp+Kruger'
WHERE slug = 'lower-sabie-rest-camp';

-- ============================================================
-- ZIMBABWE — VICTORIA FALLS (5)
-- ============================================================

UPDATE places SET
  highlights = '["Paved paths with unobstructed views of the falls", "Lush rainforest created by constant spray", "One of the Seven Natural Wonders"]'::jsonb,
  considerations = '["Waterproof layer essential during high water", "Camera protection needed from spray", "Entry fee required"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '2-3 hours',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Victoria+Falls+Rainforest+Victoria+Falls'
WHERE slug = 'victoria-falls-rainforest';

UPDATE places SET
  highlights = '["Cantilevered over the Batoka Gorge", "Views of the Zambezi bridge and falls spray", "Ideal for a solo lunch with scenery"]'::jsonb,
  considerations = '["Menu is straightforward — setting is the draw", "Can be windy on the terrace"]'::jsonb,
  best_time_of_day = 'afternoon',
  estimated_duration = '1-2 hours',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Lookout+Cafe+Victoria+Falls'
WHERE slug = 'lookout-cafe';

UPDATE places SET
  highlights = '["111-meter freefall from the historic bridge", "High safety standards", "Bridge walk available as alternative"]'::jsonb,
  considerations = '["Not for the faint-hearted", "Zimbabwe-Zambia border crossing required"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '2-3 hours',
  physical_level = 'moderate',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Bungee+Bridge+Tour+Victoria+Falls'
WHERE slug = 'bungee-bridge-tour';

UPDATE places SET
  highlights = '["Colonial-era luxury with gorge views", "Afternoon tea on the terrace", "Sprawling gardens and pool"]'::jsonb,
  considerations = '["Premium pricing", "Worth visiting for tea even if not staying"]'::jsonb,
  best_time_of_day = 'afternoon',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=The+Victoria+Falls+Hotel+Victoria+Falls'
WHERE slug = 'the-victoria-falls-hotel';

UPDATE places SET
  highlights = '["Two-hour drift with drinks and canapes", "Hippos and birdlife along the upper Zambezi", "Golden-hour light show", "Solo travelers blend easily into the relaxed atmosphere"]'::jsonb,
  considerations = '["Book in advance during peak season", "Bring warm layers for after sunset"]'::jsonb,
  best_time_of_day = 'evening',
  estimated_duration = '2-3 hours',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Zambezi+River+Sunset+Cruise+Victoria+Falls'
WHERE slug = 'zambezi-river-sunset-cruise';

-- ============================================================
-- ZIMBABWE — HARARE (3)
-- ============================================================

UPDATE places SET
  highlights = '["Important Shona sculpture collection", "Strong rotating contemporary exhibitions", "Quiet retreat from the city"]'::jsonb,
  considerations = '["Closed on Mondays", "Small gift shop with local art"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '1-2 hours',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=National+Gallery+of+Zimbabwe+Harare'
WHERE slug = 'national-gallery-of-zimbabwe';

UPDATE places SET
  highlights = '["Open-air shopping village with boutiques", "Weekend craft market", "Good cafes for getting oriented"]'::jsonb,
  considerations = '["Borrowdale crowd is upscale", "Useful for SIM cards and supplies"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '1-2 hours',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Sam+Levy''s+Village+Harare'
WHERE slug = 'sam-levys-village';

UPDATE places SET
  highlights = '["Garden setting with seasonal menu", "Solo-friendly bar counter seating", "Zimbabwean and South African wine list"]'::jsonb,
  considerations = '["Reservations recommended for dinner", "Avondale location"]'::jsonb,
  best_time_of_day = 'evening',
  estimated_duration = '1-2 hours',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Amanzi+Restaurant+Harare'
WHERE slug = 'amanzi-restaurant';

-- ============================================================
-- ZIMBABWE — MASVINGO (2)
-- ============================================================

UPDATE places SET
  highlights = '["Largest stone ruins in sub-Saharan Africa", "UNESCO World Heritage Site", "Towering granite walls of a medieval city", "Great Enclosure walk takes roughly an hour"]'::jsonb,
  considerations = '["Hire a local guide for historical context", "Bring water and sun protection", "Remote location"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '3-4 hours',
  physical_level = 'moderate',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Great+Zimbabwe+Ruins+Masvingo'
WHERE slug = 'great-zimbabwe-ruins';

UPDATE places SET
  highlights = '["Vast reservoir with granite hills", "Boat trips and game drives", "Exceptional birdlife"]'::jsonb,
  considerations = '["30 minutes from town", "Limited facilities"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = 'Half day',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Lake+Mutirikwi+Masvingo'
WHERE slug = 'lake-mutirikwi';

-- ============================================================
-- NAMIBIA — WINDHOEK (4)
-- ============================================================

UPDATE places SET
  highlights = '["Windhoek institution with eclectic decor", "Game meat platter with oryx kudu and springbok", "Solo diners are common and welcome"]'::jsonb,
  considerations = '["Can be busy on weekends — arrive early", "Portions are large"]'::jsonb,
  best_time_of_day = 'evening',
  estimated_duration = '1-2 hours',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Joe''s+Beerhouse+Windhoek'
WHERE slug = 'joes-beerhouse';

UPDATE places SET
  highlights = '["Striking 1910 neo-Gothic church", "Hilltop views over parliamentary gardens", "Stained glass interior"]'::jsonb,
  considerations = '["Interior access depends on opening hours", "Quick visit — 30 minutes"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '30 minutes',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Christuskirche+Windhoek'
WHERE slug = 'christuskirche';

UPDATE places SET
  highlights = '["Curated cooperative of Namibian artisans", "Handwoven baskets and San-inspired jewelry", "Artists often on-site", "Fair prices"]'::jsonb,
  considerations = '["Closed on Sunday afternoons", "Small space"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '1 hour',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Craft+Centre+Namibia+Windhoek'
WHERE slug = 'craft-centre-namibia';

UPDATE places SET
  highlights = '["Rooftop pool and reliable amenities", "Central location", "Good base for early departures"]'::jsonb,
  considerations = '["International chain — lacks local character", "Premium pricing"]'::jsonb,
  best_time_of_day = 'any',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Hilton+Windhoek'
WHERE slug = 'hilton-windhoek';

-- ============================================================
-- NAMIBIA — SOSSUSVLEI (4)
-- ============================================================

UPDATE places SET
  highlights = '["170-meter climb with sweeping desert views", "Apricot-colored sand at first light", "Most accessible of the great dunes", "Descent is half the time and twice the fun"]'::jsonb,
  considerations = '["Leave before dawn to catch gates opening", "Bring water — no shade", "Soft sand makes climbing strenuous"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '2-3 hours',
  physical_level = 'challenging',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Dune+45+Sossusvlei'
WHERE slug = 'dune-45-sunrise-climb';

UPDATE places SET
  highlights = '["White clay pan with 900-year-old skeleton trees", "300-meter dunes surrounding the pan", "One of the most photographed landscapes in Africa"]'::jsonb,
  considerations = '["Arrive early to beat midday heat", "5km walk from the 2x4 parking area", "Extremely hot by mid-morning"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '2-3 hours',
  physical_level = 'moderate',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Deadvlei+Sossusvlei'
WHERE slug = 'deadvlei';

UPDATE places SET
  highlights = '["Just outside the park gates for early access", "Pool and desert views", "Extraordinary stargazing with zero light pollution"]'::jsonb,
  considerations = '["Limited dining options — lodge restaurant or nothing", "Book ahead for peak season"]'::jsonb,
  best_time_of_day = 'any',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Sossusvlei+Lodge+Sossusvlei'
WHERE slug = 'sossusvlei-lodge';

UPDATE places SET
  highlights = '["Narrow slot canyon 30 meters deep", "Short manageable walk to the canyon floor", "Beautiful late afternoon light on rock walls"]'::jsonb,
  considerations = '["Sturdy shoes required", "Can be very hot midday"]'::jsonb,
  best_time_of_day = 'afternoon',
  estimated_duration = '1-2 hours',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Sesriem+Canyon+Sossusvlei'
WHERE slug = 'sesriem-canyon';

-- ============================================================
-- NAMIBIA — SWAKOPMUND (4)
-- ============================================================

UPDATE places SET
  highlights = '["Built around a beached tugboat", "Fresh Atlantic oysters from Walvis Bay", "Waves breaking against the glass", "Solo bar seating available"]'::jsonb,
  considerations = '["Reservations recommended for dinner", "Pricier than town alternatives"]'::jsonb,
  best_time_of_day = 'evening',
  estimated_duration = '1-2 hours',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=The+Tug+Restaurant+Swakopmund'
WHERE slug = 'the-tug-restaurant';

UPDATE places SET
  highlights = '["Speeds reach 80 km/h on lie-down boards", "All equipment and transport provided", "Small groups and solo bookings easy"]'::jsonb,
  considerations = '["Morning departures only", "Can be physically demanding"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = 'Half day',
  physical_level = 'moderate',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Sandboarding+Namib+Desert+Swakopmund'
WHERE slug = 'sandboarding-namib-desert';

UPDATE places SET
  highlights = '["Restored 1905 iron jetty", "Meditative walk especially at dusk", "Iconic silhouette of the town"]'::jsonb,
  considerations = '["Can be windy and cold", "Quick visit — 30 minutes"]'::jsonb,
  best_time_of_day = 'evening',
  estimated_duration = '30 minutes',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Swakopmund+Jetty+Swakopmund'
WHERE slug = 'swakopmund-jetty';

UPDATE places SET
  highlights = '["Boutique guesthouse with individually designed rooms", "Sheltered courtyard garden", "Generous breakfast and local recommendations"]'::jsonb,
  considerations = '["On the edge of town — not central", "Limited availability"]'::jsonb,
  best_time_of_day = 'any',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Desert+Breeze+Lodge+Swakopmund'
WHERE slug = 'desert-breeze-lodge';

-- ============================================================
-- MOZAMBIQUE — MAPUTO (4)
-- ============================================================

UPDATE places SET
  highlights = '["Sprawling market under a Portuguese-era iron roof", "Spices cashews and capulana fabric", "Low prices and friendly vendors"]'::jsonb,
  considerations = '["Keep belongings close in crowds", "Go early for the best energy", "Can be overwhelming"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '1-2 hours',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Mercado+Central+Maputo'
WHERE slug = 'mercado-central-maputo';

UPDATE places SET
  highlights = '["Strong espresso and fresh pastries", "Reliable WiFi and shaded terrace", "Creative crowd and remote workers"]'::jsonb,
  considerations = '["Can be busy at lunchtime", "Limited food menu"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '1-2 hours',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Cafe+Acacia+Maputo'
WHERE slug = 'cafe-acacia-maputo';

UPDATE places SET
  highlights = '["Coastal reserve with elephants and flamingos", "Pristine beaches", "Wildlife sightings improving each year"]'::jsonb,
  considerations = '["4x4 required for access", "Day trip requires early start", "Rehabilitation ongoing"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = 'Full day',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Maputo+Special+Reserve+Maputo'
WHERE slug = 'maputo-special-reserve';

UPDATE places SET
  highlights = '["1922 heritage hotel with impeccable service", "Pool terrace overlooking the Indian Ocean", "Refined anchor point for solo travelers"]'::jsonb,
  considerations = '["Premium pricing", "Worth visiting the bar even if not staying"]'::jsonb,
  best_time_of_day = 'any',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Polana+Serena+Hotel+Maputo'
WHERE slug = 'polana-serena-hotel';

-- ============================================================
-- MOZAMBIQUE — TOFO (4)
-- ============================================================

UPDATE places SET
  highlights = '["Right on the beach", "Dive shop on-site for easy ocean excursions", "Social bar that fills nightly", "Meet other solo travelers within the first hour"]'::jsonb,
  considerations = '["Can be noisy", "Basic facilities", "Dorm-style accommodation"]'::jsonb,
  best_time_of_day = 'any',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Fatima''s+Nest+Tofo'
WHERE slug = 'fatimas-nest-tofo';

UPDATE places SET
  highlights = '["One of the world''s most reliable whale shark spots", "Year-round sightings", "Mantas and dolphins as frequent bonuses", "Life-list experience"]'::jsonb,
  considerations = '["Morning departures only", "Ocean conditions can be rough", "Snorkeling skill required"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = 'Half day',
  physical_level = 'moderate',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Tofo+Whale+Shark+Dive+Tofo'
WHERE slug = 'tofo-whale-shark-dive';

UPDATE places SET
  highlights = '["Barefoot beach bar with ocean views", "Cold 2M beers and relaxed playlist", "Mix of surfers divers and long-term travelers"]'::jsonb,
  considerations = '["Unpretentious — don''t expect polish", "Cash preferred"]'::jsonb,
  best_time_of_day = 'evening',
  estimated_duration = '1-2 hours',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Dino''s+Beach+Bar+Tofo'
WHERE slug = 'dinos-beach-bar';

UPDATE places SET
  highlights = '["Steps from the beach with pool", "On-site restaurant with fresh seafood", "Quieter than backpacker spots but still sociable"]'::jsonb,
  considerations = '["Mid-range pricing", "Limited availability in peak season"]'::jsonb,
  best_time_of_day = 'any',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Casa+Barry+Lodge+Tofo'
WHERE slug = 'casa-barry-lodge';

-- ============================================================
-- MOZAMBIQUE — BAZARUTO (2)
-- ============================================================

UPDATE places SET
  highlights = '["Best-preserved coral reefs in western Indian Ocean", "Visibility exceeding 20 meters", "Dugongs and sea turtles common"]'::jsonb,
  considerations = '["Arranged through island lodges", "Remote location", "Weather dependent"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = 'Half day',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Bazaruto+Island+Snorkeling+Bazaruto'
WHERE slug = 'bazaruto-island-snorkeling';

UPDATE places SET
  highlights = '["Private villas with direct beach access", "Spa and world-class snorkeling", "True remoteness — no roads no crowds"]'::jsonb,
  considerations = '["Luxury pricing", "Transfers by helicopter or boat from Vilankulo"]'::jsonb,
  best_time_of_day = 'any',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Anantara+Bazaruto+Island+Resort'
WHERE slug = 'anantara-bazaruto';

-- ============================================================
-- LESOTHO — MASERU (3)
-- ============================================================

UPDATE places SET
  highlights = '["Mountain fortress where King Moshoeshoe I unified the Basotho", "Royal graves and stone ruins", "Panoramic views of the lowlands"]'::jsonb,
  considerations = '["Hire a local guide for the full story", "Steep walk to summit", "Bring water and sun protection"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '2-3 hours',
  physical_level = 'moderate',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Thaba+Bosiu+Cultural+Village+Maseru'
WHERE slug = 'thaba-bosiu-cultural-village';

UPDATE places SET
  highlights = '["Established international hotel on the Caledon River", "Views across to South Africa", "Practical base for day trips"]'::jsonb,
  considerations = '["Functional rather than charming", "Limited alternatives in Maseru"]'::jsonb,
  best_time_of_day = 'any',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Avani+Maseru+Hotel+Maseru'
WHERE slug = 'avani-maseru-hotel';

UPDATE places SET
  highlights = '["Largest shopping centre in Lesotho", "Useful for supplies before mountain trips", "Basotho blankets and crafts outside"]'::jsonb,
  considerations = '["Practical stop not a destination", "Limited dining options"]'::jsonb,
  best_time_of_day = 'any',
  estimated_duration = '1 hour',
  physical_level = 'easy',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Pioneer+Mall+Maseru'
WHERE slug = 'pioneer-mall-maseru';

-- ============================================================
-- LESOTHO — SEMONKONG (4)
-- ============================================================

UPDATE places SET
  highlights = '["192-meter single-drop waterfall", "One of the highest in Southern Africa", "Sometimes freezes entirely in winter", "Unfenced dramatic viewpoint"]'::jsonb,
  considerations = '["45-minute walk from the lodge", "Viewpoint is unfenced — exercise caution", "Weather can change quickly"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '2-3 hours',
  physical_level = 'moderate',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Maletsunyane+Falls+Semonkong'
WHERE slug = 'maletsunyane-falls';

UPDATE places SET
  highlights = '["Only formal accommodation in Semonkong", "Stone rondavels with fireplaces", "Organizes pony treks and abseiling", "Genuinely remote sense of place"]'::jsonb,
  considerations = '["Limited connectivity", "Remote — plan accordingly", "Dorm to private options available"]'::jsonb,
  best_time_of_day = 'any',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Semonkong+Lodge+Semonkong'
WHERE slug = 'semonkong-lodge';

UPDATE places SET
  highlights = '["Basotho ponies know the terrain", "Half-day or multi-day options", "Ride through remote villages and mountain passes", "No experience required"]'::jsonb,
  considerations = '["Can be physically demanding over multiple days", "Weather exposure in highlands", "Basic overnight accommodation on multi-day treks"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = 'Half day to multi-day',
  physical_level = 'moderate',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Pony+Trekking+Adventure+Semonkong'
WHERE slug = 'pony-trekking-adventure';

UPDATE places SET
  highlights = '["192-meter abseil — longest commercial single-drop in the world", "Proper safety equipment provided", "Run by Semonkong Lodge"]'::jsonb,
  considerations = '["Weather dependent", "Not for the faint-hearted", "Physically demanding"]'::jsonb,
  best_time_of_day = 'morning',
  estimated_duration = '3-4 hours',
  physical_level = 'challenging',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Abseiling+Maletsunyane+Falls+Semonkong'
WHERE slug = 'abseiling-maletsunyane';

-- ============================================================
-- Backfill image_url_cached from place_media
-- ============================================================

UPDATE places p SET image_url_cached = (
  SELECT pm.url FROM place_media pm
  WHERE pm.place_id = p.id AND pm.media_type = 'image'
  ORDER BY pm.order_index LIMIT 1
) WHERE p.image_url_cached IS NULL AND p.is_active = true;
