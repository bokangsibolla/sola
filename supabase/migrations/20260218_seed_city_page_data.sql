-- Comprehensive seed: city page structured data for ALL cities
-- Uses $$ dollar-quoting for JSONB to avoid escaping issues
-- Run AFTER 20260218_city_page_redesign.sql (schema migration)

-- =========================================================================
-- THAILAND
-- =========================================================================

-- Bangkok
UPDATE cities SET
  positioning_line = 'Street food capital with a thriving solo scene',
  budget_tier = 'budget',
  vibe = 'Energetic, sensory, welcoming',
  walkability = 'somewhat_walkable',
  transit_ease = 'excellent',
  women_should_know = $$["Solo women are common and locals are welcoming", "Taxis: always use the meter or Grab", "Dress modestly when visiting temples  - shoulders and knees covered", "Street food is safe and widely eaten by locals", "Night markets are well-lit and generally safe"]$$::jsonb,
  experience_pillars = $$[{"title": "Street food", "descriptor": "Michelin-recognized stalls"}, {"title": "Temples", "descriptor": "400+ across the city"}, {"title": "Markets", "descriptor": "Chatuchak to floating markets"}, {"title": "Wellness", "descriptor": "Thai massage tradition"}]$$::jsonb,
  how_women_use = $${"summary": "Bangkok is a launchpad. Women use it as a base for Thai island hopping, spend a few days in the city exploring food and temples, then head south or north.", "bullets": ["2-3 nights in the city before heading to islands", "Khao San Road for meeting other travelers", "Co-working cafes in Ari and Ekkamai"]}$$::jsonb,
  awareness = $${"summary": "Generally very safe, but awareness helps in a big city.", "bullets": ["Scams: tuk-tuk drivers offering special deals to gem shops", "Red-light districts exist around Sukhumvit Soi 4", "Air quality can be poor Dec-Feb", "Traffic is intense  - use BTS/MRT over taxis when possible"]}$$::jsonb
WHERE slug = 'bangkok';

-- Chiang Mai
UPDATE cities SET
  positioning_line = 'The digital nomad capital with mountain calm',
  budget_tier = 'budget',
  vibe = 'Laid-back, creative, spiritual',
  walkability = 'walkable',
  transit_ease = 'limited',
  women_should_know = $$["One of the safest cities in Southeast Asia for solo women", "Burning season (Feb-Apr) brings poor air quality", "Old City is very walkable and well-connected", "Sunday Walking Street market is unmissable", "Respect temple dress codes  - sarongs available at entrances"]$$::jsonb,
  experience_pillars = $$[{"title": "Temples", "descriptor": "300+ in the old city alone"}, {"title": "Cooking classes", "descriptor": "Farm-to-table Thai cooking"}, {"title": "Cafe culture", "descriptor": "World-class specialty coffee"}, {"title": "Nature", "descriptor": "Doi Suthep to Doi Inthanon"}]$$::jsonb,
  how_women_use = $${"summary": "Women come to Chiang Mai to slow down. It is the place to work from a cafe, take a cooking class, and hike to waterfalls  - all at a fraction of the cost of home.", "bullets": ["Long stays (2-4 weeks) are common", "Nimman area for co-working and cafes", "Weekend trips to Pai or Chiang Rai"]}$$::jsonb,
  awareness = $${"summary": "Very safe with a few seasonal considerations.", "bullets": ["Burning season (Feb-Apr): check AQI before booking", "Songthaews (red trucks) are cheap but negotiate price first", "Night Bazaar area can be touristy  - explore beyond it", "Respect elephant sanctuaries  - only visit ethical ones"]}$$::jsonb
WHERE slug = 'chiang-mai';

-- Krabi
UPDATE cities SET
  positioning_line = 'Limestone cliffs and island-hopping without the crowds',
  budget_tier = 'budget',
  vibe = 'Natural, adventurous, relaxed',
  walkability = 'somewhat_walkable',
  transit_ease = 'limited',
  women_should_know = $$["Ao Nang is the main tourist hub  - walkable and safe", "Long-tail boats are the main island transport", "Railay Beach is only accessible by boat", "Modest swimwear appreciated outside resort beaches", "Rainy season (May-Oct) means cheaper rates but rougher seas"]$$::jsonb,
  experience_pillars = $$[{"title": "Island hopping", "descriptor": "4 Islands and Hong Islands"}, {"title": "Rock climbing", "descriptor": "World-class limestone routes"}, {"title": "Beaches", "descriptor": "Railay, Tubkaak, Ao Nang"}, {"title": "Kayaking", "descriptor": "Mangrove and sea cave exploration"}]$$::jsonb,
  how_women_use = $${"summary": "Krabi is where women go for nature without the full-moon-party energy. It is calmer than Phuket, more scenic than Koh Samui, and perfect for a few days of island hopping and beach time.", "bullets": ["Base in Ao Nang for easy island access", "Day trips to Railay and the 4 Islands", "Combine with a few nights on Koh Lanta"]}$$::jsonb,
  awareness = $${"summary": "Very safe beach destination with basic precautions.", "bullets": ["Long-tail boat prices vary  - agree before boarding", "Currents can be strong at certain beaches", "Limited nightlife  - this is a nature destination", "Motorbike rental requires confidence on hilly roads"]}$$::jsonb
WHERE slug = 'krabi';

-- Pai
UPDATE cities SET
  positioning_line = 'Mountain village with backpacker soul and hot springs',
  budget_tier = 'budget',
  vibe = 'Bohemian, peaceful, intimate',
  walkability = 'very_walkable',
  transit_ease = 'minimal',
  women_should_know = $$["The winding road from Chiang Mai (762 curves) causes motion sickness  - take medication", "Town center is tiny and very walkable", "Everyone rents motorbikes but roads can be treacherous", "ATMs exist but bring backup cash", "The backpacker community is friendly and social"]$$::jsonb,
  experience_pillars = $$[{"title": "Hot springs", "descriptor": "Natural thermal pools in the jungle"}, {"title": "Waterfalls", "descriptor": "Pam Bok and Mo Paeng"}, {"title": "Night market", "descriptor": "Walking Street every evening"}, {"title": "Canyon views", "descriptor": "Pai Canyon at sunset"}]$$::jsonb,
  how_women_use = $${"summary": "Pai is the detox from the detox. Women come here to do very little  - soak in hot springs, wander the night market, and enjoy the mountain air for a few days.", "bullets": ["3-5 nights is the sweet spot", "Easy to meet other solo travelers", "Rent a motorbike or bicycle to explore"]}$$::jsonb,
  awareness = $${"summary": "Very safe small town with transport considerations.", "bullets": ["The road from Chiang Mai is winding  - motion sickness is common", "Motorbike accidents are the biggest risk", "Limited medical facilities  - serious issues need Chiang Mai", "Flooding possible in heavy rain season (Aug-Sep)"]}$$::jsonb
WHERE slug = 'pai';

-- Koh Phangan
UPDATE cities SET
  positioning_line = 'Beyond the Full Moon Party  - yoga retreats and hidden beaches',
  budget_tier = 'budget',
  vibe = 'Spiritual, social, tropical',
  walkability = 'car_needed',
  transit_ease = 'minimal',
  women_should_know = $$["The island has two sides: party (Haad Rin) and wellness (north/west coast)", "Motorbike is essential  - roads are steep and unpaved in parts", "Full Moon Party nights change the island atmosphere completely", "Yoga and wellness retreats are world-class here", "Ferry schedules change seasonally  - book ahead in peak season"]$$::jsonb,
  experience_pillars = $$[{"title": "Yoga retreats", "descriptor": "Month-long programs and drop-ins"}, {"title": "Beaches", "descriptor": "Bottle Beach, Haad Salad, Thong Nai Pan"}, {"title": "Wellness", "descriptor": "Detox, meditation, breathwork"}, {"title": "Snorkeling", "descriptor": "Sail Rock and Koh Ma"}]$$::jsonb,
  how_women_use = $${"summary": "Solo women split between two Koh Phangans: the wellness seekers who base on the north coast for yoga and silence, and the social travelers who come for the party energy and stay for the community.", "bullets": ["Srithanu for yoga and wellness community", "Thong Nai Pan for quiet beach time", "Haad Rin only if you want the Full Moon energy"]}$$::jsonb,
  awareness = $${"summary": "Generally safe island with some practical concerns.", "bullets": ["Motorbike accidents are the number one risk  - many roads are steep and unpaved", "Drink spiking reported at Full Moon Parties  - watch your drinks", "Hospital is basic  - serious injuries require Koh Samui or Surat Thani", "Some bungalows are very isolated  - choose locations with other guests nearby"]}$$::jsonb
WHERE slug = 'koh-phangan';

-- Phuket
UPDATE cities SET
  positioning_line = 'Thai island luxury with beaches for every mood',
  budget_tier = 'moderate',
  vibe = 'Diverse, beachy, vibrant',
  walkability = 'car_needed',
  transit_ease = 'limited',
  women_should_know = $$["Phuket is large  - choose your area carefully based on your vibe", "Patong is the party zone; Kata and Rawai are calmer", "Grab works on the island for transport", "Rip currents during monsoon season (May-Oct) are serious", "Old Town Phuket has beautiful Sino-Portuguese architecture"]$$::jsonb,
  experience_pillars = $$[{"title": "Beaches", "descriptor": "From busy Patong to quiet Nai Harn"}, {"title": "Island trips", "descriptor": "Phi Phi, James Bond Island, Similan"}, {"title": "Old Town", "descriptor": "Sino-Portuguese heritage streets"}, {"title": "Thai cuisine", "descriptor": "Southern Thai curries and seafood"}]$$::jsonb,
  how_women_use = $${"summary": "Phuket works as both a base for island-hopping and a destination itself. Solo women tend to skip Patong and base in Kata, Rawai, or Old Town for a mix of beach, food, and culture.", "bullets": ["Kata Beach for a calm, walkable base", "Old Town for cafes and culture", "Day trips to Phi Phi and Phang Nga Bay"]}$$::jsonb,
  awareness = $${"summary": "Popular tourist destination with standard precautions.", "bullets": ["Patong nightlife area has aggressive touts", "Jet ski and motorbike scams exist  - photograph condition before renting", "Rip currents kill tourists every year  - respect red flags", "Tuk-tuks are expensive  - negotiate or use Grab"]}$$::jsonb
WHERE slug = 'phuket';

-- Koh Samui
UPDATE cities SET
  positioning_line = 'Upscale Thai island with comfort and convenience',
  budget_tier = 'moderate',
  vibe = 'Comfortable, scenic, polished',
  walkability = 'car_needed',
  transit_ease = 'limited',
  women_should_know = $$["More developed than other Thai islands  - has an airport, hospitals, malls", "Chaweng is busy and commercial; Bophut and Maenam are calmer", "Motorbike or Grab needed to get around", "Ang Thong Marine Park day trip is spectacular", "Rainy season (Oct-Dec) brings heavy but short showers"]$$::jsonb,
  experience_pillars = $$[{"title": "Beaches", "descriptor": "Soft sand from Chaweng to Lamai"}, {"title": "Wellness spas", "descriptor": "Luxury Thai wellness resorts"}, {"title": "Viewpoints", "descriptor": "Overlap Stone and Lad Koh"}, {"title": "Island hopping", "descriptor": "Ang Thong Marine Park"}]$$::jsonb,
  how_women_use = $${"summary": "Koh Samui is the comfort pick. Women who want a Thai island with reliable infrastructure, good restaurants, and easy access choose Samui over rougher alternatives.", "bullets": ["Bophut Fisherman Village for evening walks and dining", "Luxury wellness retreats for extended stays", "Easy flights to Bangkok  - no ferry needed"]}$$::jsonb,
  awareness = $${"summary": "Well-developed island with minimal concerns.", "bullets": ["Motorbike accidents remain the top risk", "Some beaches have strong undertow in monsoon season", "Chaweng can feel commercial and touristy", "Prices higher than mainland Thailand"]}$$::jsonb
WHERE slug = 'koh-samui';

-- Koh Lanta
UPDATE cities SET
  positioning_line = 'Quiet Thai island for those who want peace, not parties',
  budget_tier = 'budget',
  vibe = 'Tranquil, authentic, unhurried',
  walkability = 'car_needed',
  transit_ease = 'minimal',
  women_should_know = $$["Much quieter than Phuket or Koh Samui  - this is the laid-back choice", "Southern beaches are more secluded, northern more social", "Old Town on the east coast has charming sea gypsy heritage", "Motorbike is the main transport  - roads are decent", "Best season is Nov-Apr; many places close in low season"]$$::jsonb,
  experience_pillars = $$[{"title": "Quiet beaches", "descriptor": "Long, uncrowded stretches of sand"}, {"title": "Snorkeling", "descriptor": "Koh Rok and 4 Islands"}, {"title": "Old Town", "descriptor": "Stilted houses over the water"}, {"title": "National park", "descriptor": "Mu Ko Lanta marine park"}]$$::jsonb,
  how_women_use = $${"summary": "Koh Lanta attracts women who have done the bigger islands and want something calmer. It is the island where you actually read the book, learn to cook Thai food, and watch sunsets without a crowd.", "bullets": ["Long Beach for social-but-calm base", "Kantiang Bay for near-solitude", "2-3 week stays are common for remote workers"]}$$::jsonb,
  awareness = $${"summary": "Very safe and quiet with basic practical notes.", "bullets": ["Many businesses close May-Oct (low season)", "Medical facilities are basic  - Krabi hospital is 2 hours away", "Internet can be slow in southern parts", "Motorbike needed  - no public transport on the island"]}$$::jsonb
WHERE slug = 'koh-lanta';

-- Koh Tao
UPDATE cities SET
  positioning_line = 'Tiny dive island with a big backpacker community',
  budget_tier = 'budget',
  vibe = 'Adventurous, social, compact',
  walkability = 'walkable',
  transit_ease = 'minimal',
  women_should_know = $$["One of the cheapest places in the world to get PADI certified", "The island is small enough to walk or scooter everywhere", "Sairee Beach is the social hub", "Night ferries are cheap but can be rough in monsoon", "The hiking to viewpoints is steep but rewarding"]$$::jsonb,
  experience_pillars = $$[{"title": "Scuba diving", "descriptor": "Affordable PADI certification"}, {"title": "Snorkeling", "descriptor": "Japanese Gardens and Shark Bay"}, {"title": "Viewpoints", "descriptor": "John-Suwan and Mango viewpoints"}, {"title": "Beach life", "descriptor": "Sairee, Tanote, Freedom Beach"}]$$::jsonb,
  how_women_use = $${"summary": "Women come to Koh Tao to learn to dive. The island is small, the community is tight, and within a few days you know half the people on Sairee Beach.", "bullets": ["3-4 day dive courses are the main draw", "Easy to extend stays once you settle in", "Sairee Beach for the social scene"]}$$::jsonb,
  awareness = $${"summary": "Mostly safe dive island with some concerns.", "bullets": ["Motorbike accidents on steep dirt roads are common", "Some reports of theft from bungalows  - use a safe", "Medical evacuation to Koh Samui needed for serious injuries", "Currents can be strong  - dive with reputable operators only"]}$$::jsonb
WHERE slug = 'koh-tao';

-- Chiang Rai
UPDATE cities SET
  positioning_line = 'Northern Thai arts and temples without the crowds',
  budget_tier = 'budget',
  vibe = 'Artistic, serene, authentic',
  walkability = 'walkable',
  transit_ease = 'limited',
  women_should_know = $$["Much quieter and less touristy than Chiang Mai", "The White Temple (Wat Rong Khun) is the main draw", "Night Bazaar is smaller but more authentic than Chiang Mai", "Hill tribe treks should be booked through ethical operators", "The clock tower light show happens every evening at 7, 8, and 9pm"]$$::jsonb,
  experience_pillars = $$[{"title": "Temples", "descriptor": "White, Blue, and Black temples"}, {"title": "Tea culture", "descriptor": "Choui Fong and hilltop plantations"}, {"title": "Hill tribes", "descriptor": "Ethical cultural visits"}, {"title": "Golden Triangle", "descriptor": "Where Thailand, Laos, and Myanmar meet"}]$$::jsonb,
  how_women_use = $${"summary": "Chiang Rai is a 2-3 day side trip from Chiang Mai for most women. The temples are extraordinary, the pace is gentle, and the tea plantations make for beautiful half-day trips.", "bullets": ["2-3 day trip from Chiang Mai", "Rent a scooter or hire a driver for temple circuit", "Cross the border to Laos via the slow boat from Huay Xai"]}$$::jsonb,
  awareness = $${"summary": "Very safe small city with minor notes.", "bullets": ["Not much nightlife  - this is a daytime destination", "Hill tribe tourism can be exploitative  - choose ethical operators", "Limited English outside tourist sites", "Border areas can have different regulations"]}$$::jsonb
WHERE slug = 'chiang-rai';

-- =========================================================================
-- VIETNAM
-- =========================================================================

-- Ho Chi Minh City
UPDATE cities SET
  positioning_line = 'Relentless energy, incredible food, and a history that demands attention',
  budget_tier = 'budget',
  vibe = 'Frenetic, flavorful, resilient',
  walkability = 'somewhat_walkable',
  transit_ease = 'good',
  women_should_know = $$["Crossing the street is an art  - walk slowly and steadily, traffic flows around you", "District 1 and District 3 are the safest and most walkable", "Grab is essential  - motorbike taxis are the fastest way around", "Bag snatching from motorbikes happens  - carry bags on the building side", "Street food is extraordinary and generally safe"]$$::jsonb,
  experience_pillars = $$[{"title": "Street food", "descriptor": "Pho, banh mi, and bun thit nuong"}, {"title": "War history", "descriptor": "Cu Chi Tunnels and War Remnants Museum"}, {"title": "Coffee culture", "descriptor": "Ca phe sua da and rooftop cafes"}, {"title": "Markets", "descriptor": "Ben Thanh to Binh Tay"}]$$::jsonb,
  how_women_use = $${"summary": "Ho Chi Minh City is the entry point to Vietnam. Women spend 2-3 days eating their way through the city, visiting the war museums, and then heading to the coast or the Mekong Delta.", "bullets": ["District 1 for first-time visitors", "District 3 for a more local, cafe-heavy experience", "Day trips to Cu Chi Tunnels and Mekong Delta"]}$$::jsonb,
  awareness = $${"summary": "Generally safe with street-level awareness needed.", "bullets": ["Bag snatching from motorbikes is real  - use a cross-body bag", "Traffic is intense  - Grab bikes are faster than cars", "Some taxi scams exist  - only use Grab or Vinasun/Mai Linh", "Negotiate prices at markets  - start at 30-40% of asking"]}$$::jsonb
WHERE slug = 'ho-chi-minh-city';

-- Hanoi
UPDATE cities SET
  positioning_line = 'Ancient capital where every street tells a story',
  budget_tier = 'budget',
  vibe = 'Historic, atmospheric, layered',
  walkability = 'walkable',
  transit_ease = 'good',
  women_should_know = $$["The Old Quarter is chaotic but safe  - embrace the sensory overload", "Egg coffee (ca phe trung) is a Hanoi original  - try it", "Crossing streets works the same as Saigon: walk slowly and steadily", "Winter (Nov-Feb) is cold and grey  - pack layers", "Train Street is now restricted but nearby cafes still offer the experience"]$$::jsonb,
  experience_pillars = $$[{"title": "Old Quarter", "descriptor": "36 ancient trading streets"}, {"title": "Food tours", "descriptor": "Bun cha, pho, and banh cuon"}, {"title": "Temples", "descriptor": "Temple of Literature and Tran Quoc Pagoda"}, {"title": "Ha Long Bay", "descriptor": "UNESCO limestone karsts nearby"}]$$::jsonb,
  how_women_use = $${"summary": "Hanoi is where women fall in love with Vietnam. The Old Quarter is endlessly walkable, the food is some of the best in Asia, and it serves as the gateway to Ha Long Bay and Sapa.", "bullets": ["Old Quarter for street food and atmosphere", "West Lake area for a calmer, local experience", "2-day Ha Long Bay cruise from Hanoi"]}$$::jsonb,
  awareness = $${"summary": "Safe and welcoming with typical urban considerations.", "bullets": ["Petty theft in crowded Old Quarter areas", "Winter pollution can be heavy  - check air quality", "Some tourist traps around Hoan Kiem Lake area", "Grab is the safest transport option"]}$$::jsonb
WHERE slug = 'hanoi';

-- Hoi An
UPDATE cities SET
  positioning_line = 'Lantern-lit ancient town where time moves gently',
  budget_tier = 'budget',
  vibe = 'Romantic, artisan, picturesque',
  walkability = 'very_walkable',
  transit_ease = 'limited',
  women_should_know = $$["One of the most photogenic towns in Southeast Asia", "Custom tailoring is the specialty  - get clothes made in 24-48 hours", "The Old Town is pedestrian-only in the evenings", "An Bang Beach is a 10-minute bike ride from town", "Full Moon Lantern Festival happens on the 14th of each lunar month"]$$::jsonb,
  experience_pillars = $$[{"title": "Custom tailoring", "descriptor": "Bespoke clothing in 24-48 hours"}, {"title": "Lantern-lit streets", "descriptor": "Ancient Town at night"}, {"title": "Cooking classes", "descriptor": "Market-to-table Vietnamese cooking"}, {"title": "Cycling", "descriptor": "Rice paddies and fishing villages"}]$$::jsonb,
  how_women_use = $${"summary": "Hoi An is where women decompress. The pace is gentle, the food is exceptional, and there is something deeply satisfying about cycling through rice paddies and coming back to lantern-lit streets.", "bullets": ["3-5 nights to get clothes made and explore", "Cooking classes are a highlight", "Combine with Da Nang (30 min away)"]}$$::jsonb,
  awareness = $${"summary": "Very safe and welcoming small town.", "bullets": ["Flooding happens Oct-Nov  - check weather before booking", "Tailors vary in quality  - check reviews carefully", "Old Town entrance fee required (120,000 VND)", "Cycling at night can be tricky  - use lights"]}$$::jsonb
WHERE slug = 'hoi-an';

-- Da Nang
UPDATE cities SET
  positioning_line = 'Modern beach city bridging old and new Vietnam',
  budget_tier = 'budget',
  vibe = 'Modern, coastal, easygoing',
  walkability = 'walkable',
  transit_ease = 'good',
  women_should_know = $$["Much more modern and organized than Hanoi or Saigon", "My Khe Beach is consistently rated one of Asia best", "The Dragon Bridge breathes fire on weekend nights", "Marble Mountains are a stunning half-day trip", "Great base for both Hoi An and Hue day trips"]$$::jsonb,
  experience_pillars = $$[{"title": "Beach life", "descriptor": "My Khe  - one of Asia best beaches"}, {"title": "Marble Mountains", "descriptor": "Caves, pagodas, and viewpoints"}, {"title": "Ba Na Hills", "descriptor": "Golden Bridge and French village"}, {"title": "Seafood", "descriptor": "Fresh catches along the coast"}]$$::jsonb,
  how_women_use = $${"summary": "Da Nang is the practical base for central Vietnam. Women use it for its beach, its proximity to Hoi An, and its modern infrastructure that makes everything easy.", "bullets": ["Base here and day-trip to Hoi An and Hue", "My Khe Beach area for accommodation", "Dragon Bridge on Saturday and Sunday nights"]}$$::jsonb,
  awareness = $${"summary": "Clean, modern, and very safe.", "bullets": ["Less character than Hoi An or Hanoi  - more of a base than a destination", "Beach can have strong currents in winter", "Construction is ongoing everywhere  - the city is growing fast", "Typhoon season Sep-Nov can disrupt plans"]}$$::jsonb
WHERE slug = 'da-nang';

-- Da Lat
UPDATE cities SET
  positioning_line = 'Cool mountain retreat with French colonial charm',
  budget_tier = 'budget',
  vibe = 'Cool, romantic, artistic',
  walkability = 'walkable',
  transit_ease = 'limited',
  women_should_know = $$["The climate is genuinely cool  - bring a jacket", "Known as the City of Eternal Spring", "Vietnamese couples honeymoon here  - the vibe is romantic", "Coffee farms and flower gardens are the main attractions", "The night market is one of Vietnam best"]$$::jsonb,
  experience_pillars = $$[{"title": "Coffee farms", "descriptor": "Single-origin Vietnamese coffee"}, {"title": "Canyoning", "descriptor": "Waterfall rappelling adventures"}, {"title": "Architecture", "descriptor": "French villas and Crazy House"}, {"title": "Night market", "descriptor": "Street food and local energy"}]$$::jsonb,
  how_women_use = $${"summary": "Da Lat is the escape from the heat. Women come here to cool down after weeks in tropical Vietnam, visit coffee farms, and enjoy a mountain town that feels more European than Southeast Asian.", "bullets": ["2-3 nights is enough to see the highlights", "Canyoning tours are a unique adventure", "Great stop between Ho Chi Minh City and the coast"]}$$::jsonb,
  awareness = $${"summary": "Very safe mountain town.", "bullets": ["Roads can be foggy and winding  - careful on motorbikes", "Rain is frequent even in dry season  - pack layers", "Some tourist attractions feel kitschy  - ask locals for the real spots", "Limited English  - learn basic Vietnamese phrases"]}$$::jsonb
WHERE slug = 'da-lat';

-- =========================================================================
-- INDONESIA
-- =========================================================================

-- Ubud
UPDATE cities SET
  positioning_line = 'Spiritual heart of Bali  - rice terraces, yoga, and craft',
  budget_tier = 'budget',
  vibe = 'Spiritual, lush, creative',
  walkability = 'somewhat_walkable',
  transit_ease = 'minimal',
  women_should_know = $$["The wellness and yoga scene here is world-class", "Traffic in central Ubud is terrible  - walk or scooter", "Tegallalang Rice Terraces are beautiful but very touristy", "Monkey Forest monkeys will grab your belongings  - secure everything", "The art and craft scene is genuine and affordable"]$$::jsonb,
  experience_pillars = $$[{"title": "Yoga retreats", "descriptor": "Renowned studios and teacher trainings"}, {"title": "Rice terraces", "descriptor": "Tegallalang and Jatiluwih"}, {"title": "Art galleries", "descriptor": "Balinese and contemporary art"}, {"title": "Healing", "descriptor": "Traditional Balinese healers"}]$$::jsonb,
  how_women_use = $${"summary": "Ubud is the Eat Pray Love destination for a reason. Women come here for yoga retreats, rice terrace walks, and a slower pace. Many arrive for a week and stay for a month.", "bullets": ["Week-long yoga or meditation retreats", "Morning rice terrace walks before the crowds", "Combine with 3-4 days in Canggu or Seminyak"]}$$::jsonb,
  awareness = $${"summary": "Safe and welcoming with minor practical concerns.", "bullets": ["Traffic congestion in central Ubud is severe", "Monkeys at the Sacred Monkey Forest can be aggressive", "Some wellness practitioners are not certified  - research first", "Rain comes suddenly  - always carry a light rain jacket"]}$$::jsonb
WHERE slug = 'ubud';

-- Canggu
UPDATE cities SET
  positioning_line = 'Surf town turned digital nomad capital',
  budget_tier = 'moderate',
  vibe = 'Trendy, social, health-conscious',
  walkability = 'somewhat_walkable',
  transit_ease = 'minimal',
  women_should_know = $$["The co-working and digital nomad scene is massive", "Batu Bolong Beach is the social surf beach", "Traffic is bad  - scooter is the main transport", "Prices are higher than the rest of Bali", "The smoothie bowl and brunch culture is genuinely excellent"]$$::jsonb,
  experience_pillars = $$[{"title": "Surfing", "descriptor": "Beginner-friendly beach breaks"}, {"title": "Co-working", "descriptor": "Dojo, Outpost, and more"}, {"title": "Brunch culture", "descriptor": "Acai bowls and specialty coffee"}, {"title": "Sunsets", "descriptor": "Echo Beach and Tanah Lot temple"}]$$::jsonb,
  how_women_use = $${"summary": "Canggu is where women work remotely and surf in the afternoon. The social infrastructure  - cafes, co-working spaces, fitness studios  - is built for exactly this lifestyle.", "bullets": ["Batu Bolong area for walkability and social scene", "Pererenan for a quieter, more local feel", "Weekly or monthly stays are the norm"]}$$::jsonb,
  awareness = $${"summary": "Generally safe but with Bali-specific concerns.", "bullets": ["Scooter accidents are extremely common  - wear a helmet always", "Petty theft from parked scooters happens", "The party scene can be intense  - set your own pace", "Rip currents at Echo Beach are dangerous for weak swimmers"]}$$::jsonb
WHERE slug = 'canggu';

-- Seminyak
UPDATE cities SET
  positioning_line = 'Polished Bali beach town with boutiques and beach clubs',
  budget_tier = 'moderate',
  vibe = 'Stylish, indulgent, cosmopolitan',
  walkability = 'walkable',
  transit_ease = 'minimal',
  women_should_know = $$["The most upscale beach area in Bali", "Boutique shopping on Jalan Kayu Aya is excellent", "Beach clubs like Potato Head are iconic sundown spots", "Walking is possible along the main strip", "Restaurants here rival major cities worldwide"]$$::jsonb,
  experience_pillars = $$[{"title": "Beach clubs", "descriptor": "Potato Head, Ku De Ta, W Hotel"}, {"title": "Boutique shopping", "descriptor": "Local designers and concept stores"}, {"title": "Dining", "descriptor": "World-class Indonesian and fusion"}, {"title": "Spa culture", "descriptor": "Luxury Balinese treatments"}]$$::jsonb,
  how_women_use = $${"summary": "Seminyak is the treat-yourself Bali. Women come here for the restaurants, the beach clubs, and the shopping  - with enough culture nearby to feel grounded.", "bullets": ["Base here for a more polished Bali experience", "Sunset cocktails at Potato Head or La Plancha", "Day trips to Ubud and Tanah Lot"]}$$::jsonb,
  awareness = $${"summary": "Safe and well-developed with standard precautions.", "bullets": ["Prices are the highest in Bali", "Beach hawkers can be persistent  - a polite no works", "Traffic is congested, especially around sunset", "Rip currents exist  - swim near lifeguard stations"]}$$::jsonb
WHERE slug = 'seminyak';

-- Yogyakarta
UPDATE cities SET
  positioning_line = 'Java cultural capital with two UNESCO temples',
  budget_tier = 'budget',
  vibe = 'Cultural, artistic, grounded',
  walkability = 'walkable',
  transit_ease = 'good',
  women_should_know = $$["Home to Borobudur and Prambanan  - two of the world greatest temples", "The batik tradition here is genuine and you can take workshops", "Jalan Malioboro is the main street  - bustling but safe", "Dress modestly when visiting temples and the Kraton", "Sunrise at Borobudur is worth the 4am wake-up"]$$::jsonb,
  experience_pillars = $$[{"title": "Borobudur", "descriptor": "World largest Buddhist temple"}, {"title": "Prambanan", "descriptor": "Hindu temple complex at sunset"}, {"title": "Batik art", "descriptor": "Traditional textile workshops"}, {"title": "Kraton", "descriptor": "Living Javanese royal palace"}]$$::jsonb,
  how_women_use = $${"summary": "Yogyakarta is a cultural immersion. Women come for 2-3 days to see the temples and stay longer because the art scene, the food, and the gentle Javanese culture are magnetic.", "bullets": ["Sunrise at Borobudur is unmissable", "Batik workshops for a hands-on craft experience", "Jalan Prawirotaman for the traveler cafe scene"]}$$::jsonb,
  awareness = $${"summary": "Very safe and culturally rich.", "bullets": ["Becak (cycle rickshaw) drivers may overcharge  - agree price first", "Dress conservatively around the Kraton and temples", "Street food is excellent but stick to busy stalls", "Mt. Merapi is an active volcano  - check conditions before visiting"]}$$::jsonb
WHERE slug = 'yogyakarta';

-- Gili Islands
UPDATE cities SET
  positioning_line = 'Car-free islands with turquoise water and sea turtles',
  budget_tier = 'budget',
  vibe = 'Relaxed, turquoise, simple',
  walkability = 'very_walkable',
  transit_ease = 'minimal',
  women_should_know = $$["No cars or motorbikes  - only bicycles and horse carts", "Gili T is the party island, Gili Air is chill, Gili Meno is deserted", "Snorkeling with sea turtles is almost guaranteed", "No ATMs on Gili Meno  - bring cash", "Fast boats from Bali can be rough in bad weather"]$$::jsonb,
  experience_pillars = $$[{"title": "Snorkeling", "descriptor": "Sea turtles and coral reefs"}, {"title": "Island pace", "descriptor": "No motorized vehicles"}, {"title": "Diving", "descriptor": "Affordable PADI courses"}, {"title": "Sunset swings", "descriptor": "Iconic ocean swings"}]$$::jsonb,
  how_women_use = $${"summary": "The Gilis are the decompression stop. Women come here to snorkel, read on the beach, and enjoy the simplicity of an island with no traffic. Gili Air is the solo-women sweet spot.", "bullets": ["Gili Air for the best balance of social and calm", "Gili T if you want nightlife", "3-4 nights is perfect"]}$$::jsonb,
  awareness = $${"summary": "Very safe islands with a few practical notes.", "bullets": ["No hospital  - serious issues require boat to Lombok", "Petty theft from unlocked rooms reported on Gili T", "Fast boats can be canceled in bad weather  - build buffer days", "Jellyfish stings possible  - ask locals about conditions"]}$$::jsonb
WHERE slug = 'gili-islands';

-- =========================================================================
-- PHILIPPINES
-- =========================================================================

-- El Nido
UPDATE cities SET
  positioning_line = 'Dramatic limestone lagoons in an untouched paradise',
  budget_tier = 'budget',
  vibe = 'Stunning, adventurous, raw',
  walkability = 'walkable',
  transit_ease = 'minimal',
  women_should_know = $$["Island-hopping tours A, B, C, and D are the main activities", "Infrastructure is basic  - power outages and slow internet happen", "The town itself is small and walkable", "Corong Corong Beach is quieter than the main town beach", "Tricycles are the main local transport"]$$::jsonb,
  experience_pillars = $$[{"title": "Island hopping", "descriptor": "Hidden lagoons and secret beaches"}, {"title": "Big Lagoon", "descriptor": "Towering limestone karsts"}, {"title": "Kayaking", "descriptor": "Through cathedral-like limestone passages"}, {"title": "Beach life", "descriptor": "Nacpan and Las Cabanas"}]$$::jsonb,
  how_women_use = $${"summary": "El Nido is pure natural drama. Solo travelers base in town, spend mornings on island-hopping boats through limestone lagoons, and unwind at Corong Corong or Nacpan Beach by afternoon.", "bullets": ["Tour A (Big Lagoon, Small Lagoon) is the essential day trip", "Nacpan Beach for a full day away from the crowds", "3-4 nights covers the main tours comfortably"]}$$::jsonb,
  awareness = $${"summary": "Safe but infrastructure is basic.", "bullets": ["Power outages happen regularly", "Internet is unreliable  - not ideal for remote work", "Some boats are overcrowded  - book private if budget allows", "Environmental fee required (200 PHP)"]}$$::jsonb
WHERE slug = 'el-nido';

-- Siargao
UPDATE cities SET
  positioning_line = 'Surf island with palm-tree-lined roads and island soul',
  budget_tier = 'budget',
  vibe = 'Laid-back, surf, tropical',
  walkability = 'somewhat_walkable',
  transit_ease = 'minimal',
  women_should_know = $$["Cloud 9 is one of the best surf breaks in Asia", "The island runs on island time  - everything is slower here", "General Luna is the main tourist area", "Motorbike is essential for exploring", "The palm-tree-lined roads are as beautiful as the beaches"]$$::jsonb,
  experience_pillars = $$[{"title": "Surfing", "descriptor": "Cloud 9 and beginner breaks"}, {"title": "Island hopping", "descriptor": "Naked Island, Daku, Guyam"}, {"title": "Rock pools", "descriptor": "Magpupungko at low tide"}, {"title": "Palm roads", "descriptor": "Iconic coconut tree-lined drives"}]$$::jsonb,
  how_women_use = $${"summary": "Siargao is the Philippines answer to Canggu  - a surf island with a growing cafe scene and a tight community of solo travelers. Women come to surf, island-hop, and settle into the rhythm.", "bullets": ["General Luna for the social base", "Surf lessons for beginners at Jacking Horse", "Island hopping tour to Naked, Daku, and Guyam"]}$$::jsonb,
  awareness = $${"summary": "Safe island with basic infrastructure.", "bullets": ["Medical facilities are very basic  - serious issues need Surigao or Cebu", "Motorbike roads can be flooded after rain", "Typhoon risk Sep-Dec  - check weather before booking", "ATMs run out of cash on weekends  - bring extra"]}$$::jsonb
WHERE slug = 'siargao';

-- Cebu
UPDATE cities SET
  positioning_line = 'Gateway to whale sharks, waterfalls, and island life',
  budget_tier = 'budget',
  vibe = 'Diverse, gateway, friendly',
  walkability = 'somewhat_walkable',
  transit_ease = 'good',
  women_should_know = $$["Cebu City is the gateway  - most people head to Moalboal or Oslob quickly", "Oslob whale shark tours are controversial  - consider Donsol as an ethical alternative", "Moalboal sardine run is a free snorkeling experience", "Kawasan Falls canyoneering is an incredible adventure", "Filipino hospitality is genuinely warm"]$$::jsonb,
  experience_pillars = $$[{"title": "Whale sharks", "descriptor": "Swim alongside gentle giants"}, {"title": "Canyoneering", "descriptor": "Kawasan Falls adventure"}, {"title": "Sardine run", "descriptor": "Millions of sardines in Moalboal"}, {"title": "Island hopping", "descriptor": "Bantayan and Malapascua"}]$$::jsonb,
  how_women_use = $${"summary": "Cebu is a transit hub that becomes an adventure destination. Women fly in, head south for whale sharks and waterfalls, then island-hop to Bohol or Malapascua.", "bullets": ["Moalboal for snorkeling and diving", "Kawasan Falls canyoneering as a day trip", "Bantayan Island for quiet beach days"]}$$::jsonb,
  awareness = $${"summary": "Generally safe with standard urban awareness in the city.", "bullets": ["Cebu City traffic is heavy  - head to nature quickly", "Oslob whale shark feeding is controversial  - research first", "Canyoneering operators vary in safety  - check reviews", "Tricycles and habal-habal are main rural transport"]}$$::jsonb
WHERE slug = 'cebu';

-- Manila
UPDATE cities SET
  positioning_line = 'Chaotic capital with world-class food and nightlife',
  budget_tier = 'budget',
  vibe = 'Intense, surprising, warm',
  walkability = 'somewhat_walkable',
  transit_ease = 'good',
  women_should_know = $$["Makati and BGC (Bonifacio Global City) are the safest, most walkable areas", "Traffic is legendary  - plan around it or use the MRT", "Filipino food is underrated internationally  - try sisig, kare-kare, and halo-halo", "Intramuros (the old walled city) is the cultural heart", "Grab is the essential transport app"]$$::jsonb,
  experience_pillars = $$[{"title": "Food scene", "descriptor": "Filipino cuisine renaissance"}, {"title": "Intramuros", "descriptor": "Spanish colonial walled city"}, {"title": "Nightlife", "descriptor": "Poblacion rooftop bars"}, {"title": "Art", "descriptor": "Galleries in Makati and BGC"}]$$::jsonb,
  how_women_use = $${"summary": "Most women pass through Manila quickly, but those who stay discover a city with incredible food, genuine warmth, and a nightlife scene that rivals anywhere in Asia.", "bullets": ["BGC and Makati for a comfortable, walkable base", "Poblacion for the nightlife and restaurant scene", "1-2 nights before heading to islands"]}$$::jsonb,
  awareness = $${"summary": "Big city awareness needed, especially outside tourist areas.", "bullets": ["Stay in Makati or BGC for safety and walkability", "Traffic can turn a 5km trip into 2 hours", "Petty crime exists  - be aware of surroundings", "Flooding during typhoon season (Jun-Nov) can shut down the city"]}$$::jsonb
WHERE slug = 'manila';

-- Bohol
UPDATE cities SET
  positioning_line = 'Chocolate Hills, tiny tarsiers, and turquoise waters',
  budget_tier = 'budget',
  vibe = 'Natural, quiet, unique',
  walkability = 'car_needed',
  transit_ease = 'limited',
  women_should_know = $$["The Chocolate Hills are a genuinely unique geological formation", "Tarsiers are extremely sensitive  - only visit the Philippine Tarsier Sanctuary", "Panglao Island has the best beaches and resorts", "Renting a motorbike or hiring a driver is essential", "The Loboc River cruise is touristy but scenic"]$$::jsonb,
  experience_pillars = $$[{"title": "Chocolate Hills", "descriptor": "1,200+ cone-shaped hills"}, {"title": "Tarsiers", "descriptor": "World smallest primates"}, {"title": "Panglao beaches", "descriptor": "Alona Beach and Dumaluan"}, {"title": "Diving", "descriptor": "Balicasag Island wall dives"}]$$::jsonb,
  how_women_use = $${"summary": "Bohol is a 2-3 day trip, usually combined with Cebu. Women come for the Chocolate Hills, fall in love with the tarsiers, and spend the remaining time on Panglao beaches.", "bullets": ["Day tour: Chocolate Hills + tarsiers + river cruise", "Base on Panglao for beach and diving", "Easy ferry connection to Cebu"]}$$::jsonb,
  awareness = $${"summary": "Very safe and welcoming.", "bullets": ["Hire a driver for the countryside tour  - roads are long", "Only visit ethical tarsier sanctuaries", "Panglao beach area can feel commercialized", "Limited nightlife  - this is a nature destination"]}$$::jsonb
WHERE slug = 'bohol';

-- Boracay
UPDATE cities SET
  positioning_line = 'White-sand perfection for beach lovers and sunset chasers',
  budget_tier = 'moderate',
  vibe = 'Beach-perfect, social, vibrant',
  walkability = 'very_walkable',
  transit_ease = 'minimal',
  women_should_know = $$["White Beach is genuinely one of the world most beautiful beaches", "The island was closed for rehabilitation in 2018 and has recovered beautifully", "Station 1 is luxury, Station 2 is the social center, Station 3 is budget", "The island is tiny  - you can walk end to end", "Sunset sailing (paraw) is a must-do"]$$::jsonb,
  experience_pillars = $$[{"title": "White Beach", "descriptor": "4km of powdery white sand"}, {"title": "Sunset sailing", "descriptor": "Traditional paraw boats"}, {"title": "Water sports", "descriptor": "Kite surfing at Bulabog Beach"}, {"title": "Island dining", "descriptor": "Seafood and beachfront restaurants"}]$$::jsonb,
  how_women_use = $${"summary": "Boracay is pure beach indulgence. Women come here for the white sand, the sunsets, and the ease of a small island where everything is walkable.", "bullets": ["Station 2 for the social scene and convenience", "Diniwid Beach for a quieter alternative", "3-4 nights is the sweet spot"]}$$::jsonb,
  awareness = $${"summary": "Safe and well-managed since the rehabilitation.", "bullets": ["Environmental rules are strict now  - no beach drinking, no smoking", "Peak season (Nov-May) means higher prices and crowds", "Amihan season (Nov-Feb) can bring rough waters", "Some water activity operators lack safety standards  - check reviews"]}$$::jsonb
WHERE slug = 'boracay';

-- Coron
UPDATE cities SET
  positioning_line = 'Shipwreck diving and hidden lagoons in Palawan',
  budget_tier = 'budget',
  vibe = 'Rugged, stunning, adventurous',
  walkability = 'walkable',
  transit_ease = 'minimal',
  women_should_know = $$["World-class wreck diving  - Japanese WWII shipwrecks", "Kayangan Lake is often called the cleanest lake in the Philippines", "Island-hopping tours are the main activity", "The town itself is basic  - the beauty is in the water", "Hot springs at Maquinit are a perfect end-of-day activity"]$$::jsonb,
  experience_pillars = $$[{"title": "Wreck diving", "descriptor": "WWII Japanese shipwrecks"}, {"title": "Kayangan Lake", "descriptor": "Crystal-clear mountain lake"}, {"title": "Island hopping", "descriptor": "Twin Lagoon and hidden beaches"}, {"title": "Hot springs", "descriptor": "Maquinit saltwater springs"}]$$::jsonb,
  how_women_use = $${"summary": "Coron is for adventure-minded women. The wreck diving is world-class, the lagoons are extraordinary, and the rawness of the place makes it feel like a real discovery.", "bullets": ["Island-hopping tours are the daily activity", "3-4 nights to cover major sites", "Combine with El Nido via expedition boat"]}$$::jsonb,
  awareness = $${"summary": "Safe but remote with basic infrastructure.", "bullets": ["Town is basic  - limited dining and nightlife options", "Some tours overload boats  - book private if possible", "Internet and power can be unreliable", "Bring reef-safe sunscreen  - the environment is fragile"]}$$::jsonb
WHERE slug = 'coron';

-- La Union
UPDATE cities SET
  positioning_line = 'Surf town on the Luzon coast with growing cafe culture',
  budget_tier = 'budget',
  vibe = 'Surf, chill, emerging',
  walkability = 'somewhat_walkable',
  transit_ease = 'limited',
  women_should_know = $$["San Juan is the main surf and tourist area", "The surf is beginner-friendly  - great for first-timers", "Growing cafe and brunch scene along the main road", "Easy weekend trip from Manila (5-6 hours by bus)", "The local community is friendly and welcoming to solo women"]$$::jsonb,
  experience_pillars = $$[{"title": "Surfing", "descriptor": "Beginner-friendly waves at Urbiztondo"}, {"title": "Cafe culture", "descriptor": "Growing specialty coffee scene"}, {"title": "Sunset", "descriptor": "West coast golden hour"}, {"title": "Local food", "descriptor": "Grapes, wine, and Ilocano cuisine"}]$$::jsonb,
  how_women_use = $${"summary": "La Union is the Manila escape. Women come for a surf weekend and sometimes extend to a week, drawn by the relaxed pace and the growing cafe-and-surf community.", "bullets": ["San Juan Beach for surf lessons and social scene", "Weekday visits avoid the Manila weekend crowd", "Combine with a trip to Vigan (UNESCO heritage)"]}$$::jsonb,
  awareness = $${"summary": "Safe surf town with basic considerations.", "bullets": ["Weekend crowds from Manila can be heavy", "Rip currents possible  - surf with instructors if beginner", "Limited nightlife beyond beach bars", "Bus from Manila can be long  - consider overnight buses"]}$$::jsonb
WHERE slug = 'la-union';

-- Dumaguete
UPDATE cities SET
  positioning_line = 'University town with gentle charm and marine wonders',
  budget_tier = 'budget',
  vibe = 'Gentle, intellectual, coastal',
  walkability = 'very_walkable',
  transit_ease = 'good',
  women_should_know = $$["Known as the City of Gentle People  - the reputation is earned", "Apo Island nearby has some of the Philippines best diving", "Silliman University gives the town a young, intellectual energy", "The boulevard seafront promenade is lovely at sunset", "Gateway to Siquijor and southern Cebu"]$$::jsonb,
  experience_pillars = $$[{"title": "Apo Island", "descriptor": "Sea turtle diving and snorkeling"}, {"title": "Boulevard walk", "descriptor": "Sunset along the seafront"}, {"title": "Local food", "descriptor": "Sans Rival cakes and seafood"}, {"title": "Twin Lakes", "descriptor": "Balinsasayao volcanic lakes"}]$$::jsonb,
  how_women_use = $${"summary": "Dumaguete is an under-the-radar gem. Women who find it love the walkable town, the marine life, and the fact that it feels genuinely Filipino rather than touristy.", "bullets": ["Base here for Apo Island day trips", "Walk the boulevard at sunset", "Ferry to Siquijor (1.5 hours)"]}$$::jsonb,
  awareness = $${"summary": "Very safe and welcoming small city.", "bullets": ["Limited international food options", "Ferry schedules can change  - confirm in advance", "Apo Island has limited spots  - book ahead in peak season", "Typhoon risk during wet season"]}$$::jsonb
WHERE slug = 'dumaguete';

-- Siquijor
UPDATE cities SET
  positioning_line = 'Mystical island with waterfalls and healing traditions',
  budget_tier = 'budget',
  vibe = 'Mystical, quiet, enchanting',
  walkability = 'car_needed',
  transit_ease = 'minimal',
  women_should_know = $$["Known as the Island of Fire  - locals embrace the mystical reputation", "Traditional healers (mananambal) still practice here", "The island is small enough to circle by motorbike in half a day", "Cambugahay Falls has natural rope swings into turquoise water", "Very few tourists compared to other Philippine destinations"]$$::jsonb,
  experience_pillars = $$[{"title": "Cambugahay Falls", "descriptor": "Turquoise cascading pools"}, {"title": "Traditional healing", "descriptor": "Centuries-old folk traditions"}, {"title": "Balete tree", "descriptor": "Ancient enchanted tree with fish spa"}, {"title": "Beaches", "descriptor": "Salagdoong and Paliton sunset"}]$$::jsonb,
  how_women_use = $${"summary": "Siquijor is the Philippines hidden gem. Women who make it here find an island with almost no tourists, real cultural traditions, and some of the most beautiful waterfalls in the country.", "bullets": ["Motorbike the island in a day or two", "Stay near San Juan for the best beach access", "Visit a traditional healer for the experience"]}$$::jsonb,
  awareness = $${"summary": "Very safe and peaceful.", "bullets": ["No hospital  - serious issues require ferry to Dumaguete", "ATMs are limited  - bring cash from Dumaguete", "Roads can be rough in rural parts", "Ferry can be canceled in bad weather  - build buffer days"]}$$::jsonb
WHERE slug = 'siquijor';

-- Puerto Princesa
UPDATE cities SET
  positioning_line = 'Gateway to Palawan with an underground river wonder',
  budget_tier = 'budget',
  vibe = 'Natural, gateway, authentic',
  walkability = 'somewhat_walkable',
  transit_ease = 'limited',
  women_should_know = $$["The Underground River is a UNESCO World Heritage Site and genuinely impressive", "Most people use Puerto Princesa as a gateway to El Nido", "The city itself has a pleasant baywalk and seafood restaurants", "Honda Bay island-hopping is a good day activity", "Tricycles are the main city transport"]$$::jsonb,
  experience_pillars = $$[{"title": "Underground River", "descriptor": "UNESCO navigable limestone cave"}, {"title": "Honda Bay", "descriptor": "Island hopping and snorkeling"}, {"title": "Baywalk", "descriptor": "Sunset promenade and seafood"}, {"title": "Firefly watching", "descriptor": "Evening river tours"}]$$::jsonb,
  how_women_use = $${"summary": "Puerto Princesa is usually 1-2 nights before heading to El Nido. But women who stay discover a pleasant city with a great Underground River tour and genuine local charm.", "bullets": ["Underground River tour is a half-day trip", "Honda Bay for a relaxed island-hopping day", "Night at the baywalk for seafood and sunset"]}$$::jsonb,
  awareness = $${"summary": "Safe and friendly city.", "bullets": ["Most attractions require advance booking", "The drive to El Nido is 5-6 hours  - consider flying", "Limited nightlife outside the baywalk area", "Environmental fees apply at most nature sites"]}$$::jsonb
WHERE slug = 'puerto-princesa';

-- Baguio
UPDATE cities SET
  positioning_line = 'Cool mountain retreat in the Philippine highlands',
  budget_tier = 'budget',
  vibe = 'Cool, artistic, pine-scented',
  walkability = 'walkable',
  transit_ease = 'good',
  women_should_know = $$["The Summer Capital of the Philippines  - genuinely cool climate", "Session Road is the main commercial street", "The Tam-awan Village showcases Cordillera indigenous art", "Strawberry picking at La Trinidad is a local experience", "Weekend traffic from Manila can be terrible"]$$::jsonb,
  experience_pillars = $$[{"title": "Pine forests", "descriptor": "Camp John Hay and Botanical Garden"}, {"title": "Art scene", "descriptor": "Tam-awan Village and BenCab Museum"}, {"title": "Market culture", "descriptor": "Baguio City Market and ukay-ukay"}, {"title": "Cool climate", "descriptor": "Escape from tropical heat"}]$$::jsonb,
  how_women_use = $${"summary": "Baguio is where Filipinas go to escape the heat, and solo travelers are discovering it too. The art scene, the cool pine-scented air, and the cafe culture make it a surprising highland gem.", "bullets": ["BenCab Museum is a must-visit", "Session Road for cafes and shopping", "Weekend market for local produce and crafts"]}$$::jsonb,
  awareness = $${"summary": "Safe mountain city with transit notes.", "bullets": ["Weekend traffic from Manila is severe  - visit midweek", "Roads to Baguio are winding  - motion sickness possible", "Fog and rain are common  - pack warm layers", "Earthquake zone  - be aware of exits in buildings"]}$$::jsonb
WHERE slug = 'baguio';

-- =========================================================================
-- MALAYSIA
-- =========================================================================

-- Kuala Lumpur
UPDATE cities SET
  positioning_line = 'Modern Asian capital where Malay, Chinese, and Indian cultures merge',
  budget_tier = 'moderate',
  vibe = 'Multicultural, modern, flavorful',
  walkability = 'somewhat_walkable',
  transit_ease = 'excellent',
  women_should_know = $$["One of the most multicultural cities in Asia  - food reflects this", "The Petronas Towers are iconic but book skybridge tickets early", "KL Sentral area and KLCC are well-connected by rail", "Modest dress recommended at mosques and some government buildings", "Street food in Jalan Alor is legendary"]$$::jsonb,
  experience_pillars = $$[{"title": "Food", "descriptor": "Malay, Chinese, Indian fusion"}, {"title": "Petronas Towers", "descriptor": "Iconic twin towers and skybridge"}, {"title": "Batu Caves", "descriptor": "Hindu temple in limestone caves"}, {"title": "Markets", "descriptor": "Central Market and Jalan Alor"}]$$::jsonb,
  how_women_use = $${"summary": "KL is often a stopover that becomes a stay. Women discover that the food scene is extraordinary, the transit system works, and the mix of cultures creates a city unlike anywhere else in Asia.", "bullets": ["KLCC area for modern comfort and walkability", "Chinatown for budget stays and street food", "Day trips to Batu Caves and Putrajaya"]}$$::jsonb,
  awareness = $${"summary": "Generally safe with standard urban awareness.", "bullets": ["Bag snatching reported in some areas  - use cross-body bags", "Taxi meters are sometimes not used  - insist or use Grab", "Some areas are not walkable  - KL is designed for cars", "Dress modestly in Malay areas and mosques"]}$$::jsonb
WHERE slug = 'kuala-lumpur';

-- Penang
UPDATE cities SET
  positioning_line = 'UNESCO heritage town with the best street food in Asia',
  budget_tier = 'budget',
  vibe = 'Heritage, foodie, artistic',
  walkability = 'very_walkable',
  transit_ease = 'good',
  women_should_know = $$["George Town is a UNESCO World Heritage Site and entirely walkable", "The street food here rivals (some say surpasses) Bangkok", "Street art murals throughout George Town are an attraction in themselves", "The hawker culture is genuine  - follow the locals", "Penang Hill funicular gives panoramic views"]$$::jsonb,
  experience_pillars = $$[{"title": "Street food", "descriptor": "Char kway teow, laksa, cendol"}, {"title": "Street art", "descriptor": "Ernest Zacharevic murals"}, {"title": "Heritage", "descriptor": "UNESCO George Town"}, {"title": "Temples", "descriptor": "Kek Lok Si and clan jetties"}]$$::jsonb,
  how_women_use = $${"summary": "Penang is a food pilgrimage. Women come for 2-3 days and eat their way through George Town  - then return because they missed half the dishes. The walkability and heritage make it effortlessly enjoyable.", "bullets": ["George Town for the full food and heritage experience", "Eat at hawker centers  - not tourist restaurants", "Penang Hill for a half-day excursion"]}$$::jsonb,
  awareness = $${"summary": "Very safe and welcoming.", "bullets": ["Heat and humidity are intense  - hydrate constantly", "Some heritage buildings are fragile  - respect barriers", "Traffic in George Town can be heavy despite its size", "Rain comes suddenly  - carry an umbrella"]}$$::jsonb
WHERE slug = 'penang';

-- Langkawi
UPDATE cities SET
  positioning_line = 'Duty-free island with mangroves and dramatic sunsets',
  budget_tier = 'moderate',
  vibe = 'Island, relaxed, scenic',
  walkability = 'car_needed',
  transit_ease = 'limited',
  women_should_know = $$["Duty-free island  - alcohol and chocolate are significantly cheaper", "Car or scooter rental is essential  - public transport is minimal", "Pantai Cenang is the main tourist beach strip", "The Sky Bridge and cable car views are spectacular", "Langkawi is more developed and comfortable than most Malaysian islands"]$$::jsonb,
  experience_pillars = $$[{"title": "Sky Bridge", "descriptor": "Curved bridge above the canopy"}, {"title": "Mangrove tours", "descriptor": "Eagle watching and cave kayaking"}, {"title": "Beaches", "descriptor": "Tanjung Rhu and Pantai Cenang"}, {"title": "Duty-free shopping", "descriptor": "Tax-free island status"}]$$::jsonb,
  how_women_use = $${"summary": "Langkawi is the easy Malaysian island. Women come here for beach time with creature comforts  - good restaurants, reliable infrastructure, and nature experiences that do not require roughing it.", "bullets": ["Pantai Cenang for restaurants and nightlife", "Tanjung Rhu for a quieter, more scenic beach", "Mangrove tour is a must-do half day"]}$$::jsonb,
  awareness = $${"summary": "Very safe resort island.", "bullets": ["Rental car or scooter is necessary", "Jellyfish can be present seasonally", "Some beaches have sandflies  - bring repellent", "Monsoon season (Sep-Oct) brings heavy rain"]}$$::jsonb
WHERE slug = 'langkawi';

-- Malacca
UPDATE cities SET
  positioning_line = 'Colonial heritage town with straits history and Nyonya cuisine',
  budget_tier = 'budget',
  vibe = 'Historic, compact, flavorful',
  walkability = 'very_walkable',
  transit_ease = 'good',
  women_should_know = $$["The historic center is a UNESCO World Heritage Site", "Jonker Street Night Market (Friday-Sunday) is unmissable", "Nyonya (Peranakan) cuisine is unique to this region", "The whole historic area is walkable in a day", "Easy day trip or overnight from KL (2 hours by bus)"]$$::jsonb,
  experience_pillars = $$[{"title": "Jonker Street", "descriptor": "Night market and antique shops"}, {"title": "Nyonya cuisine", "descriptor": "Peranakan fusion flavors"}, {"title": "Colonial heritage", "descriptor": "Dutch, Portuguese, British layers"}, {"title": "River walk", "descriptor": "Street art along the Malacca River"}]$$::jsonb,
  how_women_use = $${"summary": "Malacca is a 1-2 night trip that feels like stepping back in time. Women come for the Nyonya food, the Jonker Street night market, and the layered colonial history.", "bullets": ["Time your visit for the Friday-Sunday night market", "Walk the river for street art and cafes", "Try chicken rice balls  - a Malacca specialty"]}$$::jsonb,
  awareness = $${"summary": "Very safe heritage town.", "bullets": ["Extremely hot and humid  - walk early morning or evening", "The historic area is compact but beyond it there is little to see", "Some tourist restaurants are overpriced  - follow locals", "Limited nightlife beyond Jonker Street"]}$$::jsonb
WHERE slug = 'malacca';

-- Kota Kinabalu
UPDATE cities SET
  positioning_line = 'Gateway to Mount Kinabalu and Borneo marine life',
  budget_tier = 'moderate',
  vibe = 'Natural, diverse, frontier',
  walkability = 'walkable',
  transit_ease = 'limited',
  women_should_know = $$["Gateway to climbing Mount Kinabalu  - book permits well in advance", "The waterfront sunset is one of the most beautiful in Southeast Asia", "Tunku Abdul Rahman Marine Park is a 15-minute boat ride away", "Sabah is culturally different from peninsula Malaysia  - more indigenous influence", "Filipino market has excellent seafood and pearls"]$$::jsonb,
  experience_pillars = $$[{"title": "Mount Kinabalu", "descriptor": "Southeast Asia highest peak"}, {"title": "Island hopping", "descriptor": "Tunku Abdul Rahman Marine Park"}, {"title": "Sunsets", "descriptor": "Legendary waterfront golden hour"}, {"title": "Seafood", "descriptor": "Filipino market fresh catches"}]$$::jsonb,
  how_women_use = $${"summary": "Kota Kinabalu is for nature-focused women. Whether climbing Kinabalu, diving Sipadan, or just watching the sunset over the South China Sea, this is Borneo adventure with a comfortable city base.", "bullets": ["Climb Mount Kinabalu (book months ahead)", "Island hopping for easy snorkeling day trips", "The waterfront for sunset and seafood"]}$$::jsonb,
  awareness = $${"summary": "Safe city with nature-related considerations.", "bullets": ["Mount Kinabalu climb requires a guide and permit  - book early", "Eastern Sabah (Sandakan area) has different safety considerations", "Monsoon season (Nov-Mar) can affect island trips", "Leeches are common on jungle treks  - wear proper footwear"]}$$::jsonb
WHERE slug = 'kota-kinabalu';

-- =========================================================================
-- SINGAPORE
-- =========================================================================

-- Singapore
UPDATE cities SET
  positioning_line = 'The world most organized city  - safe, clean, and endlessly diverse',
  budget_tier = 'premium',
  vibe = 'Pristine, multicultural, futuristic',
  walkability = 'very_walkable',
  transit_ease = 'excellent',
  women_should_know = $$["Consistently ranked the safest city in the world for women", "The MRT system is spotless and covers the entire island", "Hawker centers serve extraordinary food at low prices", "Gardens by the Bay and Marina Bay Sands are worth the hype", "Chewing gum is famously banned  - as is jaywalking"]$$::jsonb,
  experience_pillars = $$[{"title": "Hawker food", "descriptor": "Michelin-starred stalls for under $5"}, {"title": "Gardens by the Bay", "descriptor": "Supertree Grove and Cloud Forest"}, {"title": "Neighborhoods", "descriptor": "Little India, Chinatown, Kampong Glam"}, {"title": "Architecture", "descriptor": "Marina Bay Sands and shophouses"}]$$::jsonb,
  how_women_use = $${"summary": "Singapore is the no-stress stopover. Women pass through for 2-3 days of hawker food, Gardens by the Bay, and the sheer comfort of a city where everything works. It is also a common first stop for Southeast Asia.", "bullets": ["Chinatown or Kampong Glam for cultural neighborhoods", "Hawker centers for every meal  - Maxwell, Lau Pa Sat, Tiong Bahru", "2-3 days is enough to see the highlights"]}$$::jsonb,
  awareness = $${"summary": "Extremely safe  - possibly the safest city in the world.", "bullets": ["Laws are strict  - no littering, no jaywalking, no gum", "Alcohol is expensive  - drink at hawker centers or 7-Eleven", "Hotels and food in tourist areas are pricey  - eat at hawker centers", "Air-conditioned malls are the escape from humidity"]}$$::jsonb
WHERE slug = 'singapore';

-- =========================================================================
-- CAMBODIA
-- =========================================================================

-- Siem Reap
UPDATE cities SET
  positioning_line = 'Gateway to Angkor Wat  - ancient temples in living jungle',
  budget_tier = 'budget',
  vibe = 'Ancient, spiritual, accessible',
  walkability = 'walkable',
  transit_ease = 'limited',
  women_should_know = $$["Angkor Wat sunrise is genuinely life-changing  - go on your first morning", "A 3-day temple pass gives the best experience", "Pub Street is the nightlife area  - fun but very touristy", "Tuk-tuks are the standard temple transport  - hire one for the day", "Dress modestly at temples  - shoulders and knees covered"]$$::jsonb,
  experience_pillars = $$[{"title": "Angkor Wat", "descriptor": "World largest religious monument"}, {"title": "Ta Prohm", "descriptor": "Temple consumed by jungle roots"}, {"title": "Tonle Sap", "descriptor": "Floating village on a vast lake"}, {"title": "Khmer cuisine", "descriptor": "Amok, lok lak, and cooking classes"}]$$::jsonb,
  how_women_use = $${"summary": "Siem Reap exists because of Angkor, and the temples deliver. Women spend 2-3 days exploring the complex, take a cooking class, and move on  - but the town itself has genuine charm.", "bullets": ["3-day pass for thorough temple exploration", "Sunrise at Angkor Wat on day one", "Cooking class for Khmer cuisine"]}$$::jsonb,
  awareness = $${"summary": "Safe tourist town with standard precautions.", "bullets": ["Child begging is organized  - donating perpetuates it", "Land mines still exist in rural areas  - stick to marked paths", "Some orphanage tourism is exploitative  - do not visit orphanages", "Tuk-tuk prices should be agreed in advance"]}$$::jsonb
WHERE slug = 'siem-reap';

-- Phnom Penh
UPDATE cities SET
  positioning_line = 'Resilient capital where history and modernity collide',
  budget_tier = 'budget',
  vibe = 'Raw, evolving, meaningful',
  walkability = 'somewhat_walkable',
  transit_ease = 'good',
  women_should_know = $$["The Killing Fields and S-21 are emotionally heavy but essential", "The riverfront is pleasant for evening walks", "Tuk-tuks and Grab are the main transport", "The rooftop bar scene is surprisingly excellent", "Dress modestly at the Royal Palace"]$$::jsonb,
  experience_pillars = $$[{"title": "History", "descriptor": "Killing Fields and Tuol Sleng"}, {"title": "Royal Palace", "descriptor": "Silver Pagoda and throne hall"}, {"title": "Riverside", "descriptor": "Evening promenade and dining"}, {"title": "Markets", "descriptor": "Russian Market and Central Market"}]$$::jsonb,
  how_women_use = $${"summary": "Phnom Penh demands more than a quick stop. Women who spend 2-3 days here find a city that is honest about its past and genuinely exciting about its future  - with a food and bar scene to match.", "bullets": ["Killing Fields visit requires emotional preparation", "Russian Market for souvenirs and local food", "Rooftop bars along the riverfront for sundowners"]}$$::jsonb,
  awareness = $${"summary": "Generally safe with urban awareness needed.", "bullets": ["Bag snatching from motorbikes is the main risk", "Avoid walking alone late at night along the river", "Some areas south of the city center are less safe", "Scams targeting tourists exist  - be skeptical of unsolicited help"]}$$::jsonb
WHERE slug = 'phnom-penh';

-- Kampot
UPDATE cities SET
  positioning_line = 'Riverside charm with pepper farms and French colonial echoes',
  budget_tier = 'budget',
  vibe = 'Sleepy, charming, understated',
  walkability = 'very_walkable',
  transit_ease = 'minimal',
  women_should_know = $$["Kampot pepper is world-famous  - visit a farm", "The riverfront is beautiful and walkable", "Bokor Hill Station is a fascinating abandoned resort", "The town is very small and very safe", "Kep (30 min away) has the famous crab market"]$$::jsonb,
  experience_pillars = $$[{"title": "Pepper farms", "descriptor": "World-renowned Kampot pepper"}, {"title": "Riverside", "descriptor": "Colonial architecture and cafes"}, {"title": "Bokor Hill", "descriptor": "Abandoned French hill station"}, {"title": "Kep crab", "descriptor": "Famous crab market nearby"}]$$::jsonb,
  how_women_use = $${"summary": "Kampot is where women go to decompress from the intensity of Southeast Asian travel. The riverfront cafes, the pepper farms, and the complete lack of hustle make it a perfect 2-3 day pause.", "bullets": ["Riverfront cafes for reading and relaxing", "Pepper farm tour for a unique experience", "Day trip to Kep for crab and beach"]}$$::jsonb,
  awareness = $${"summary": "Very safe and peaceful.", "bullets": ["Not much nightlife  - this is a quiet town", "Limited medical facilities", "Some roads outside town are unpaved", "The road to Bokor can be steep  - go with a driver"]}$$::jsonb
WHERE slug = 'kampot';

-- Koh Rong
UPDATE cities SET
  positioning_line = 'Undeveloped island with bioluminescent waters and jungle',
  budget_tier = 'budget',
  vibe = 'Wild, remote, bioluminescent',
  walkability = 'somewhat_walkable',
  transit_ease = 'minimal',
  women_should_know = $$["Koh Rong is party-focused; Koh Rong Sanloem is much quieter", "Bioluminescent plankton is visible at night  - truly magical", "Infrastructure is very basic  - limited electricity and internet", "Long Beach on Koh Rong is one of the longest beaches in the country", "Ferry from Sihanoukville takes about 1 hour"]$$::jsonb,
  experience_pillars = $$[{"title": "Bioluminescence", "descriptor": "Glowing plankton at night"}, {"title": "Beaches", "descriptor": "Long Beach and Sok San"}, {"title": "Jungle", "descriptor": "Interior hiking trails"}, {"title": "Snorkeling", "descriptor": "Coral reefs and marine life"}]$$::jsonb,
  how_women_use = $${"summary": "Koh Rong is for women who want genuine remoteness. Sanloem (the smaller island) is the solo-women pick  - quieter, more intimate, and the bioluminescent plankton at night is otherworldly.", "bullets": ["Koh Rong Sanloem for peace and beauty", "Koh Rong main island only if you want the party", "2-3 nights maximum  - amenities are limited"]}$$::jsonb,
  awareness = $${"summary": "Remote island with basic infrastructure.", "bullets": ["Very limited medical facilities  - Sihanoukville is the nearest hospital", "Electricity can be generator-only (limited hours)", "Internet is unreliable at best", "Sandflies are aggressive  - bring strong repellent"]}$$::jsonb
WHERE slug = 'koh-rong';

-- =========================================================================
-- LAOS
-- =========================================================================

-- Luang Prabang
UPDATE cities SET
  positioning_line = 'UNESCO town where monks, mountains, and the Mekong converge',
  budget_tier = 'budget',
  vibe = 'Serene, sacred, timeless',
  walkability = 'very_walkable',
  transit_ease = 'limited',
  women_should_know = $$["The morning alms-giving ceremony is sacred  - observe silently from a distance", "The entire town center is a UNESCO World Heritage Site", "Kuang Si Falls is the most beautiful waterfall in Southeast Asia", "The night market has beautiful Hmong textiles", "Laos is the most laid-back country in Southeast Asia"]$$::jsonb,
  experience_pillars = $$[{"title": "Alms ceremony", "descriptor": "Dawn monk procession"}, {"title": "Kuang Si Falls", "descriptor": "Turquoise cascading pools"}, {"title": "Mekong River", "descriptor": "Sunset cruises and Pak Ou Caves"}, {"title": "Night market", "descriptor": "Hmong textiles and crafts"}]$$::jsonb,
  how_women_use = $${"summary": "Luang Prabang is meditation in city form. Women come here for the alms ceremony at dawn, the waterfalls by day, and the night market at dusk  - all at a pace that feels restorative.", "bullets": ["3-4 nights to absorb the pace", "Kuang Si Falls is a must-do day trip", "Mekong sunset cruise for the experience"]}$$::jsonb,
  awareness = $${"summary": "Extremely safe and peaceful.", "bullets": ["Alms ceremony tourists can be disrespectful  - observe from a distance, do not flash photography", "The Mekong can flood in rainy season (Jul-Sep)", "Limited ATMs  - bring USD or Thai Baht as backup", "Some guided treks are not well-organized  - choose reputable operators"]}$$::jsonb
WHERE slug = 'luang-prabang';

-- Vientiane
UPDATE cities SET
  positioning_line = 'The world most relaxed capital city',
  budget_tier = 'budget',
  vibe = 'Sleepy, French-influenced, Mekong-facing',
  walkability = 'walkable',
  transit_ease = 'limited',
  women_should_know = $$["Possibly the quietest capital city in Asia", "The Mekong riverfront is perfect for sunset walks", "French baguette sandwiches (khao jii) are a Lao staple", "Buddha Park (Xieng Khuan) is beautifully bizarre", "Easy border crossing to Thailand at Friendship Bridge"]$$::jsonb,
  experience_pillars = $$[{"title": "That Luang", "descriptor": "Golden stupa national symbol"}, {"title": "Mekong sunset", "descriptor": "Riverside promenade"}, {"title": "French influence", "descriptor": "Baguettes and colonial architecture"}, {"title": "Buddha Park", "descriptor": "Surreal sculpture garden"}]$$::jsonb,
  how_women_use = $${"summary": "Vientiane is a 1-2 day stop, usually on the way to or from Luang Prabang. Women appreciate its calm, the Mekong sunsets, and the surprisingly good cafe scene.", "bullets": ["Mekong riverfront for sunset and beer", "That Luang and Patuxay monument by day", "Border hop to Nong Khai, Thailand for the day"]}$$::jsonb,
  awareness = $${"summary": "Very safe and calm.", "bullets": ["Not much to do beyond 1-2 days", "Tuk-tuks are the main transport  - negotiate prices", "Crossing the Mekong current is extremely dangerous  - never swim", "UXO (unexploded ordnance) is a concern in rural Laos  - stick to paths"]}$$::jsonb
WHERE slug = 'vientiane';

-- Vang Vieng
UPDATE cities SET
  positioning_line = 'Karst mountains and river life between two Lao capitals',
  budget_tier = 'budget',
  vibe = 'Scenic, adventurous, transformed',
  walkability = 'walkable',
  transit_ease = 'minimal',
  women_should_know = $$["Once a party town, now reinvented as an adventure destination", "The karst mountain scenery is genuinely spectacular", "Tubing still exists but is much calmer than it used to be", "The Blue Lagoon and Tham Phu Kham cave are worth the visit", "The new high-speed rail connects to Luang Prabang and Vientiane"]$$::jsonb,
  experience_pillars = $$[{"title": "Karst mountains", "descriptor": "Dramatic limestone landscape"}, {"title": "Kayaking", "descriptor": "Nam Song River adventures"}, {"title": "Blue Lagoon", "descriptor": "Swimming and cave exploring"}, {"title": "Hot air balloon", "descriptor": "Sunrise flights over karsts"}]$$::jsonb,
  how_women_use = $${"summary": "Vang Vieng has grown up. Women now come here for the spectacular scenery, the kayaking, and the hot air balloon rides  - not the party. It makes an excellent stop between Vientiane and Luang Prabang.", "bullets": ["1-2 nights as a stopover", "Kayaking the Nam Song River", "Hot air balloon at sunrise for the views"]}$$::jsonb,
  awareness = $${"summary": "Much safer than its reputation suggests.", "bullets": ["The party culture has largely moved on", "River activities have safety risks  - use reputable operators", "Some cave systems are unmanaged  - go with a guide", "The road from Vientiane is winding but scenic"]}$$::jsonb
WHERE slug = 'vang-vieng';

-- =========================================================================
-- MYANMAR
-- =========================================================================

-- Bagan
UPDATE cities SET
  positioning_line = 'Thousands of ancient temples across a vast golden plain',
  budget_tier = 'budget',
  vibe = 'Ancient, vast, spiritual',
  walkability = 'car_needed',
  transit_ease = 'minimal',
  women_should_know = $$["Over 2,000 temples and pagodas spread across the plain", "E-bikes are the best way to explore  - easy to rent", "Sunrise and sunset from elevated temples are extraordinary", "Remove shoes and socks at every temple", "The lacquerware workshops in Old Bagan are fascinating"]$$::jsonb,
  experience_pillars = $$[{"title": "Temple plain", "descriptor": "2,000+ ancient temples"}, {"title": "Hot air balloon", "descriptor": "Sunrise flights over pagodas"}, {"title": "Lacquerware", "descriptor": "Traditional Burmese craft"}, {"title": "Irrawaddy River", "descriptor": "Sunset boat cruises"}]$$::jsonb,
  how_women_use = $${"summary": "Bagan is bucket-list territory. Women come for 2-3 days of e-biking between temples, watching sunrise and sunset from ancient pagodas, and experiencing a landscape unlike anywhere else on earth.", "bullets": ["E-bike rental for independent temple exploration", "Sunrise at Shwesandaw or designated viewing mounds", "Hot air balloon flight if budget allows"]}$$::jsonb,
  awareness = $${"summary": "Safe heritage site with practical considerations.", "bullets": ["Myanmar political situation is complex  - research current conditions before visiting", "Climbing most temples is now restricted for preservation", "Heat is extreme in summer (Mar-May)", "Limited ATMs  - bring USD cash as backup"]}$$::jsonb
WHERE slug = 'bagan';

-- Yangon
UPDATE cities SET
  positioning_line = 'Colonial grandeur, golden pagodas, and a city finding its future',
  budget_tier = 'budget',
  vibe = 'Layered, colonial, resilient',
  walkability = 'walkable',
  transit_ease = 'good',
  women_should_know = $$["Shwedagon Pagoda is genuinely breathtaking  - visit at sunset", "The colonial architecture in downtown is stunning but crumbling", "Longyi (traditional sarong) dress is common  - you can buy and wear one too", "The circular train is a 3-hour local experience around the city", "Bogyoke Market (Scott Market) is the best shopping"]$$::jsonb,
  experience_pillars = $$[{"title": "Shwedagon Pagoda", "descriptor": "Golden stupa visible citywide"}, {"title": "Colonial downtown", "descriptor": "Crumbling British-era grandeur"}, {"title": "Circular train", "descriptor": "3-hour journey around the city"}, {"title": "Street food", "descriptor": "Mohinga and tea shops"}]$$::jsonb,
  how_women_use = $${"summary": "Yangon is the entry point to Myanmar. Women spend 2-3 days exploring the golden pagodas, walking the colonial downtown, and eating in the tea shops before heading to Bagan or Inle Lake.", "bullets": ["Shwedagon Pagoda at sunset is unmissable", "Downtown walking tour of colonial buildings", "Circular train for a local perspective"]}$$::jsonb,
  awareness = $${"summary": "Research current political conditions before visiting.", "bullets": ["Myanmar has been in political crisis since 2021  - check current advisories", "Internet restrictions and VPN use may be needed", "Carry cash  - many ATMs may be unreliable", "Avoid political discussions in public"]}$$::jsonb
WHERE slug = 'yangon';

-- Inle Lake
UPDATE cities SET
  positioning_line = 'Floating gardens and one-legged fishermen on a serene highland lake',
  budget_tier = 'budget',
  vibe = 'Serene, unique, floating',
  walkability = 'car_needed',
  transit_ease = 'minimal',
  women_should_know = $$["The leg-rowing fishermen are an iconic sight unique to this lake", "Boat tours are the only way to experience the lake properly", "Floating gardens, markets, and workshops are spread across the water", "Nyaungshwe is the gateway town  - small and walkable", "The lake is at altitude  - mornings can be chilly"]$$::jsonb,
  experience_pillars = $$[{"title": "Boat tours", "descriptor": "Floating villages and markets"}, {"title": "Leg-rowing fishermen", "descriptor": "Unique Intha fishing technique"}, {"title": "Floating gardens", "descriptor": "Tomatoes grown on the water"}, {"title": "Silk weaving", "descriptor": "Traditional lotus-silk looms"}]$$::jsonb,
  how_women_use = $${"summary": "Inle Lake is a highlight of any Myanmar trip. Women spend 2-3 days in Nyaungshwe, taking boat tours to floating villages, watching silk weaving, and cycling around the lake shore.", "bullets": ["Full-day boat tour of the lake is essential", "Cycling around the lake shore villages", "Red Mountain winery for sunset views"]}$$::jsonb,
  awareness = $${"summary": "Safe and peaceful with practical notes.", "bullets": ["Check Myanmar political situation before visiting", "The lake is at altitude  - bring warm layers for mornings", "Some boat tours rush through stops  - ask for a slower pace", "Workshops on the boat tour may pressure purchases"]}$$::jsonb
WHERE slug = 'inle-lake';

-- =========================================================================
-- JAPAN
-- =========================================================================

-- Tokyo (already seeded above, but included for completeness  - this is idempotent)
-- Skipping Tokyo as it was already handled above

-- Kyoto
UPDATE cities SET
  positioning_line = 'Ancient imperial capital where tradition breathes in every street',
  budget_tier = 'premium',
  vibe = 'Traditional, refined, contemplative',
  walkability = 'very_walkable',
  transit_ease = 'excellent',
  women_should_know = $$["Over 2,000 temples and shrines  - you cannot see them all", "The bamboo grove in Arashiyama is magical at dawn before crowds arrive", "Geisha (geiko) sightings in Gion are real  - never grab or block them", "Rent a kimono for a day  - it is a genuine cultural experience, not costume", "The bus system covers all major sites efficiently"]$$::jsonb,
  experience_pillars = $$[{"title": "Temples", "descriptor": "Kinkaku-ji, Fushimi Inari, Kiyomizu-dera"}, {"title": "Tea ceremony", "descriptor": "Traditional matcha experiences"}, {"title": "Bamboo grove", "descriptor": "Arashiyama forest walk"}, {"title": "Kaiseki cuisine", "descriptor": "Multi-course Japanese fine dining"}]$$::jsonb,
  how_women_use = $${"summary": "Kyoto is where Japan reveals its soul. Women come for the temples, the tea, and the experience of walking streets that have been beautiful for a thousand years.", "bullets": ["3-5 days to see the major sites without rushing", "Arashiyama early morning to avoid crowds", "Day trip to Nara for the friendly deer and Great Buddha"]}$$::jsonb,
  awareness = $${"summary": "Extremely safe with cultural etiquette to observe.", "bullets": ["Geiko and maiko should not be touched or chased for photos", "Many temples close by 5pm  - plan accordingly", "Peak cherry blossom (late March-April) and autumn (November) are extremely crowded", "Some traditional restaurants do not accept foreigners  - check in advance"]}$$::jsonb
WHERE slug = 'kyoto';

-- Osaka
UPDATE cities SET
  positioning_line = 'Japan street food capital with big personality and bigger portions',
  budget_tier = 'moderate',
  vibe = 'Lively, delicious, unpretentious',
  walkability = 'very_walkable',
  transit_ease = 'excellent',
  women_should_know = $$["Osaka is Japan kitchen  - the food is extraordinary and generous", "Dotonbori is the neon-lit food street everyone photographs", "Osakans are known as the friendliest people in Japan", "The city is more casual and less formal than Tokyo or Kyoto", "Osaka Castle is impressive but the park around it is equally beautiful"]$$::jsonb,
  experience_pillars = $$[{"title": "Street food", "descriptor": "Takoyaki, okonomiyaki, kushikatsu"}, {"title": "Dotonbori", "descriptor": "Neon-lit food district"}, {"title": "Osaka Castle", "descriptor": "Historic fortress and park"}, {"title": "Nightlife", "descriptor": "Namba and Shinsekai districts"}]$$::jsonb,
  how_women_use = $${"summary": "Osaka is the fun one. Women come here to eat (a lot), experience the outgoing Osakan personality, and enjoy a Japanese city that does not take itself too seriously.", "bullets": ["Dotonbori for the food and atmosphere", "Day trip to Nara (45 min) or Kyoto (30 min)", "Shinsekai for retro neighborhood vibes"]}$$::jsonb,
  awareness = $${"summary": "Extremely safe and welcoming.", "bullets": ["Shinsekai area can feel rougher at night but is safe", "Osaka can feel less refined than Tokyo or Kyoto  - that is the charm", "Universal Studios Japan draws crowds  - book ahead", "Summer heat and humidity (Jul-Aug) are intense"]}$$::jsonb
WHERE slug = 'osaka';

-- =========================================================================
-- PORTUGAL
-- =========================================================================

-- Lisbon (already seeded above  - this is idempotent, will overwrite)

-- Porto
UPDATE cities SET
  positioning_line = 'Port wine, azulejo tiles, and riverside charm',
  budget_tier = 'moderate',
  vibe = 'Authentic, creative, romantic',
  walkability = 'very_walkable',
  transit_ease = 'excellent',
  women_should_know = $$["Smaller and more authentic than Lisbon  - many prefer it", "Port wine cellars in Vila Nova de Gaia are a must-do tasting experience", "The Ribeira district along the Douro is UNESCO-listed", "Francesinha (meat sandwich) is the local specialty  - it is enormous", "The Livraria Lello bookshop inspired Harry Potter but the queue is long"]$$::jsonb,
  experience_pillars = $$[{"title": "Port wine", "descriptor": "Cellar tastings in Vila Nova de Gaia"}, {"title": "Azulejo tiles", "descriptor": "Blue-and-white tile art everywhere"}, {"title": "Douro Valley", "descriptor": "Wine country day trips"}, {"title": "Ribeira", "descriptor": "UNESCO riverside quarter"}]$$::jsonb,
  how_women_use = $${"summary": "Porto is Lisbon without the crowds. Women come here for the port wine, the tile-covered streets, and a city that feels authentically Portuguese rather than tourist-polished.", "bullets": ["Ribeira district for atmosphere and river views", "Port wine tasting in Vila Nova de Gaia", "Day trip to the Douro Valley by train or boat"]}$$::jsonb,
  awareness = $${"summary": "Very safe European city.", "bullets": ["Hills are steep  - comfortable shoes essential", "Some areas near Sao Bento station have petty theft", "Francesinha portions are enormous  - consider sharing", "Winter (Nov-Feb) is rainy  - pack waterproofs"]}$$::jsonb
WHERE slug = 'porto';

-- =========================================================================
-- MOROCCO
-- =========================================================================

-- Marrakech
UPDATE cities SET
  positioning_line = 'Sensory overload in the best possible way  - souks, riads, and mountains',
  budget_tier = 'moderate',
  vibe = 'Intense, colorful, magnetic',
  walkability = 'walkable',
  transit_ease = 'limited',
  women_should_know = $$["Solo women will get attention  - a firm but polite no is effective", "Hire a local guide for the souks on your first day", "Riads (traditional courtyard hotels) are the best accommodation option", "Bargaining is expected in souks  - start at 30% of the asking price", "Jemaa el-Fnaa square transforms completely from day to night"]$$::jsonb,
  experience_pillars = $$[{"title": "Souks", "descriptor": "Labyrinthine market streets"}, {"title": "Riads", "descriptor": "Traditional courtyard architecture"}, {"title": "Jemaa el-Fnaa", "descriptor": "The world most famous square"}, {"title": "Atlas Mountains", "descriptor": "Day trips to Berber villages"}]$$::jsonb,
  how_women_use = $${"summary": "Marrakech is an initiation. Women who embrace the chaos  - the calls from shopkeepers, the maze of the medina, the sensory intensity  - discover a city that rewards boldness with beauty.", "bullets": ["Stay in a riad inside the medina for the full experience", "Hire a guide for day one in the souks", "Day trip to Ourika Valley or Ouzoud Falls"]}$$::jsonb,
  awareness = $${"summary": "Safe with street smarts required.", "bullets": ["Unsolicited guides will approach  - decline firmly or agree on a price upfront", "Medina alleys can be disorienting  - save your riad on GPS", "Taxi meters are often not used  - agree price before getting in", "Dress modestly outside tourist areas  - shoulders and knees covered"]}$$::jsonb
WHERE slug = 'marrakech';

-- Fes
UPDATE cities SET
  positioning_line = 'The world largest car-free urban area  - medieval and magnificent',
  budget_tier = 'budget',
  vibe = 'Medieval, artisan, immersive',
  walkability = 'walkable',
  transit_ease = 'limited',
  women_should_know = $$["The medina is a UNESCO site and genuinely the most complex maze you will ever walk", "Hiring a guide for the first day is strongly recommended", "The tanneries are fascinating but the smell is intense  - take the mint they offer", "Less touristy than Marrakech but more overwhelming to navigate", "Fez is known for its crafts  - ceramics, leather, brass"]$$::jsonb,
  experience_pillars = $$[{"title": "Medina", "descriptor": "World largest car-free urban zone"}, {"title": "Tanneries", "descriptor": "Centuries-old leather dyeing"}, {"title": "Ceramics", "descriptor": "Hand-painted Fassi pottery"}, {"title": "Madrasas", "descriptor": "Bou Inania and Al-Attarine"}]$$::jsonb,
  how_women_use = $${"summary": "Fes is the deeper Morocco experience. Women who have done Marrakech come here for the craft tradition, the medieval architecture, and a medina that feels like time travel.", "bullets": ["Hire a guide for day one  - the medina is impossible alone", "Visit the tanneries in the morning for the best light", "Ceramics workshops in Fes el-Bali"]}$$::jsonb,
  awareness = $${"summary": "Safe within the medina with standard Morocco awareness.", "bullets": ["The medina is genuinely confusing  - GPS helps but is not always reliable", "False guides will insist on leading you  - decline or agree on a price", "Less tourist infrastructure than Marrakech", "Summers are extremely hot  - visit spring or autumn"]}$$::jsonb
WHERE slug = 'fes';

-- Chefchaouen
UPDATE cities SET
  positioning_line = 'The Blue Pearl  - Instagram-famous and genuinely enchanting',
  budget_tier = 'budget',
  vibe = 'Blue, photogenic, tranquil',
  walkability = 'very_walkable',
  transit_ease = 'minimal',
  women_should_know = $$["Every building is painted blue  - it is genuinely as beautiful as photos suggest", "The town is small and very safe  - less hassle than Marrakech or Fes", "Hiking in the Rif Mountains is the underrated activity here", "The Spanish Mosque hike at sunset is the best viewpoint", "Goat cheese and olive oil are local specialties"]$$::jsonb,
  experience_pillars = $$[{"title": "Blue streets", "descriptor": "Photogenic at every turn"}, {"title": "Rif Mountains", "descriptor": "Day hikes from town"}, {"title": "Spanish Mosque", "descriptor": "Sunset viewpoint hike"}, {"title": "Local crafts", "descriptor": "Woven blankets and leather"}]$$::jsonb,
  how_women_use = $${"summary": "Chefchaouen is the Morocco exhale. After the intensity of Marrakech or Fes, women come here for the blue streets, the mountain air, and a pace that finally lets them slow down.", "bullets": ["2-3 nights is perfect", "Spanish Mosque hike at sunset", "Wander the blue medina without a guide  - it is small enough"]}$$::jsonb,
  awareness = $${"summary": "Very safe and relaxed.", "bullets": ["Cannabis is offered openly in the Rif region  - decline politely", "The town is small  - you will see everything in 2 days", "Limited nightlife and dining compared to larger cities", "Bus connections are infrequent  - plan transport in advance"]}$$::jsonb
WHERE slug = 'chefchaouen';

-- =========================================================================
-- SOUTH KOREA
-- =========================================================================

-- Seoul
UPDATE cities SET
  positioning_line = 'Ancient palaces meet K-culture in a city that never stops',
  budget_tier = 'moderate',
  vibe = 'Dynamic, stylish, tech-forward',
  walkability = 'very_walkable',
  transit_ease = 'excellent',
  women_should_know = $$["Extremely safe for solo women  - even late at night", "The subway system is one of the best in the world", "Korean BBQ is a social experience  - solo dining is normal at many restaurants", "Hanbok rental for palace visits is popular and respected", "Convenience stores (CU, GS25) are as useful as in Japan"]$$::jsonb,
  experience_pillars = $$[{"title": "K-culture", "descriptor": "K-pop, K-beauty, K-drama locations"}, {"title": "Palaces", "descriptor": "Gyeongbokgung and Changdeokgung"}, {"title": "Food", "descriptor": "Korean BBQ, bibimbap, street food"}, {"title": "Neighborhoods", "descriptor": "Hongdae, Itaewon, Bukchon"}]$$::jsonb,
  how_women_use = $${"summary": "Seoul rewards the explorer. Women come for the K-culture, stay for the food, and discover a city where ancient palaces share space with neon-lit streets and world-class skincare shops.", "bullets": ["Hongdae for nightlife and creative energy", "Bukchon Hanok Village for traditional architecture", "Myeongdong for K-beauty shopping"]}$$::jsonb,
  awareness = $${"summary": "One of the safest cities in the world.", "bullets": ["Some restaurants and bars are designed for groups  - solo dining is fine at most places but check", "Spy camera crime (molka) is an awareness issue  - public restrooms are monitored", "Air quality can be poor in spring (yellow dust season)", "Winter is very cold  - layer up (Dec-Feb below freezing)"]}$$::jsonb
WHERE slug = 'seoul';

-- Busan
UPDATE cities SET
  positioning_line = 'Coastal city with beaches, temples, and film-festival energy',
  budget_tier = 'moderate',
  vibe = 'Coastal, cinematic, spirited',
  walkability = 'walkable',
  transit_ease = 'excellent',
  women_should_know = $$["Much more relaxed than Seoul with better beaches", "Gamcheon Culture Village is the colorful hillside neighborhood", "Haeundae Beach is the famous beach  - Gwangalli is less crowded", "The Busan International Film Festival (BIFF) is in October", "Jjimjilbang (Korean bathhouse) culture is a must-try experience"]$$::jsonb,
  experience_pillars = $$[{"title": "Beaches", "descriptor": "Haeundae and Gwangalli"}, {"title": "Gamcheon Village", "descriptor": "Colorful hillside art village"}, {"title": "Haedong Yonggungsa", "descriptor": "Seaside cliff temple"}, {"title": "Seafood", "descriptor": "Jagalchi fish market"}]$$::jsonb,
  how_women_use = $${"summary": "Busan is Seoul with sea air. Women come here for the coastal energy, the spectacular cliff-side temples, and a food market culture that is more relaxed and approachable than the capital.", "bullets": ["KTX from Seoul takes under 3 hours", "Gamcheon Village for photos and cafes", "Jagalchi Market for the freshest seafood"]}$$::jsonb,
  awareness = $${"summary": "Very safe coastal city.", "bullets": ["Summer (Jul-Aug) beaches are extremely crowded", "Typhoon season (Aug-Sep) can affect travel", "Some areas around the train station are less polished", "Beach jellyfish warnings should be heeded"]}$$::jsonb
WHERE slug = 'busan';

-- =========================================================================
-- TAIWAN
-- =========================================================================

-- Taipei
UPDATE cities SET
  positioning_line = 'Night market capital with hot springs and mountain trails',
  budget_tier = 'moderate',
  vibe = 'Friendly, food-obsessed, lush',
  walkability = 'very_walkable',
  transit_ease = 'excellent',
  women_should_know = $$["Consistently rated one of Asia safest cities for women", "Night markets are the main dining experience  - Shilin is the biggest", "The MRT is clean, efficient, and easy to navigate", "Beitou Hot Springs are accessible by metro", "The people are exceptionally friendly and helpful"]$$::jsonb,
  experience_pillars = $$[{"title": "Night markets", "descriptor": "Shilin, Raohe, Ningxia"}, {"title": "Hot springs", "descriptor": "Beitou natural thermal baths"}, {"title": "Hiking", "descriptor": "Elephant Mountain and Yangmingshan"}, {"title": "Temples", "descriptor": "Longshan and Dalongdong Baoan"}]$$::jsonb,
  how_women_use = $${"summary": "Taipei is the underrated gem of Asia. Women who visit discover a city with extraordinary food, genuine warmth, and a combination of nature and urban life that is hard to find elsewhere.", "bullets": ["Night markets for dinner every night", "Elephant Mountain hike for Taipei 101 sunset views", "Day trip to Jiufen (Spirited Away village)"]}$$::jsonb,
  awareness = $${"summary": "Extremely safe and welcoming.", "bullets": ["Typhoon season (Jul-Oct) can disrupt plans", "Summer humidity is intense  - carry water and a fan", "Some older buildings have steep, narrow stairs", "Scooter traffic is intense  - watch when crossing"]}$$::jsonb
WHERE slug = 'taipei';

-- Tainan
UPDATE cities SET
  positioning_line = 'Taiwan oldest city  - temples, street food, and Southern warmth',
  budget_tier = 'budget',
  vibe = 'Historic, culinary, warm',
  walkability = 'walkable',
  transit_ease = 'good',
  women_should_know = $$["The food capital of Taiwan  - locals from Taipei make pilgrimages here", "Over 1,600 temples in the city", "The old lanes and alleys are the real attraction", "Anping district has beautiful Dutch colonial heritage", "Slower and warmer than Taipei  - in temperature and personality"]$$::jsonb,
  experience_pillars = $$[{"title": "Street food", "descriptor": "Taiwan culinary capital"}, {"title": "Temples", "descriptor": "1,600+ temples across the city"}, {"title": "Anping", "descriptor": "Dutch colonial fort and old streets"}, {"title": "Night markets", "descriptor": "Garden Night Market and Dadong"}]$$::jsonb,
  how_women_use = $${"summary": "Tainan is for food-obsessed travelers. Women come here because locals told them Tainan has the best food in Taiwan  - and they are right. The temples and old streets are the bonus.", "bullets": ["2-3 days of dedicated eating", "Anping district for historical walks", "Hayashi Department Store for retro shopping"]}$$::jsonb,
  awareness = $${"summary": "Very safe and friendly.", "bullets": ["Less English spoken than Taipei  - learn basic Mandarin phrases", "The city is spread out  - rent a bike or use buses", "Summer heat is more intense than Taipei", "Some attractions close early  - check hours"]}$$::jsonb
WHERE slug = 'tainan';

-- =========================================================================
-- POPULATE IMAGE CACHE
-- =========================================================================

-- Populate image_url_cached from existing place_media for faster queries
UPDATE places p
SET image_url_cached = (
  SELECT pm.url
  FROM place_media pm
  WHERE pm.place_id = p.id
    AND pm.media_type = 'image'
  ORDER BY pm.order_index
  LIMIT 1
)
WHERE p.image_url_cached IS NULL
  AND p.is_active = true;
