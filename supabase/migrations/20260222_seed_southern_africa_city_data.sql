-- Comprehensive seed: city page structured data for Southern Africa cities
-- Uses $$ dollar-quoting for JSONB to avoid escaping issues
-- Run AFTER 20260218_city_page_redesign.sql (schema migration)

-- =========================================================================
-- SOUTH AFRICA
-- =========================================================================

-- Cape Town
UPDATE cities SET
  positioning_line = 'Where mountains meet ocean with world-class wine nearby',
  budget_tier = 'moderate',
  vibe = 'Dramatic, cosmopolitan, outdoorsy',
  walkability = 'somewhat_walkable',
  transit_ease = 'limited',
  women_should_know = $$["Uber is the standard way to get around and works reliably citywide", "Table Mountain weather changes fast — check conditions before hiking and bring layers", "Load shedding (rolling power cuts) still affects businesses — download the EskomSePush app", "Sea Point promenade is safe and popular for running and walking", "Bo-Kaap is a residential neighborhood — visit respectfully, not just for Instagram"]$$::jsonb,
  experience_pillars = $$[{"title": "Nature", "descriptor": "Table Mountain, Chapman''s Peak, Cape Point"}, {"title": "Wine", "descriptor": "Stellenbosch and Franschhoek within an hour"}, {"title": "Food", "descriptor": "Africa''s best restaurant scene"}, {"title": "Coast", "descriptor": "Clifton, Camps Bay, Muizenberg"}]$$::jsonb,
  how_women_use = $${"summary": "Cape Town is where solo women come to do it all — hike Table Mountain in the morning, wine taste in the afternoon, and eat world-class food at night. Most stay in the City Bowl or Sea Point and use Uber to cover the spread.", "bullets": ["Base in Sea Point or City Bowl for walkability and restaurants", "Join a group hike for Table Mountain or Lion''s Head — safer and more social", "Day trip to Stellenbosch or Franschhoek wine farms by organized tour or Uber"]}$$::jsonb,
  awareness = $${"summary": "Cape Town is a world-class destination but has real safety considerations that require street awareness.", "bullets": ["Don''t walk alone after dark in most areas — Uber is cheap and reliable", "Car break-ins happen — never leave anything visible in a vehicle", "Be cautious at ATMs — use machines inside malls or banks", "Some townships are best visited with a local guide rather than independently"]}$$::jsonb
WHERE slug = 'cape-town';

-- Johannesburg
UPDATE cities SET
  positioning_line = 'Cultural engine of South Africa with guided experiences worth seeking',
  budget_tier = 'moderate',
  vibe = 'Gritty, creative, resilient',
  walkability = 'car_needed',
  transit_ease = 'limited',
  women_should_know = $$["Uber is essential — this is not a walking city for visitors", "Sandton and Rosebank are the safest and most comfortable bases", "Guided tours of Soweto are highly recommended over self-guided visits", "Gautrain connects OR Tambo airport to Sandton in 15 minutes", "Don''t display expensive jewelry, phones, or cameras openly on the street"]$$::jsonb,
  experience_pillars = $$[{"title": "History", "descriptor": "Apartheid Museum, Constitution Hill, Soweto"}, {"title": "Art", "descriptor": "Maboneng, Keyes Art Mile, Norval Foundation"}, {"title": "Food", "descriptor": "Emerging fine dining and street food scene"}, {"title": "Culture", "descriptor": "Live music, markets, township jazz"}]$$::jsonb,
  how_women_use = $${"summary": "Women use Johannesburg as a cultural deep-dive rather than a leisure destination. The city rewards those who come with a plan — book guided tours, eat at recommended restaurants, and let the creative energy of Africa''s biggest city surprise you.", "bullets": ["Stay in Rosebank or Sandton for safety and easy Gautrain access", "Book a guided Soweto tour for context and connection", "Neighbourgoods Market on Saturday for Joburg''s creative scene"]}$$::jsonb,
  awareness = $${"summary": "Johannesburg requires more situational awareness than most cities on the continent, but smart planning makes it very manageable.", "bullets": ["Carjacking is a risk — keep windows up and doors locked, especially at traffic lights after dark", "Avoid walking between areas — Uber between every destination", "ATM safety: use indoor machines only, never at night", "Load shedding affects traffic lights — intersections become four-way stops"]}$$::jsonb
WHERE slug = 'johannesburg';

-- Durban
UPDATE cities SET
  positioning_line = 'Warm waters and curry mile on the Indian Ocean',
  budget_tier = 'budget',
  vibe = 'Tropical, multicultural, relaxed',
  walkability = 'somewhat_walkable',
  transit_ease = 'limited',
  women_should_know = $$["The Golden Mile beachfront is patrolled and generally safe during the day", "Durban has the largest Indian diaspora in Africa — the curry is legendary", "Uber is available and recommended over metered taxis", "Humidity is intense year-round — pack accordingly", "Umhlanga is the upscale area north of the city with safer beaches"]$$::jsonb,
  experience_pillars = $$[{"title": "Food", "descriptor": "Bunny chow and curry mile"}, {"title": "Beaches", "descriptor": "Warm Indian Ocean surf year-round"}, {"title": "Markets", "descriptor": "Victoria Street Market, Warwick Junction"}, {"title": "Culture", "descriptor": "Zulu heritage meets Indian influence"}]$$::jsonb,
  how_women_use = $${"summary": "Durban is the warm, affordable alternative to Cape Town. Solo women come for the food, the surf, and the multicultural energy. Most base in Umhlanga or along the beachfront and explore the city''s unique fusion culture.", "bullets": ["Umhlanga for a safe, resort-like base with beach access", "Florida Road for restaurants and nightlife in a walkable strip", "Day trip to Valley of a Thousand Hills for Zulu cultural experiences"]}$$::jsonb,
  awareness = $${"summary": "Durban is generally relaxed but requires basic urban awareness.", "bullets": ["Avoid the beachfront after dark — it empties out quickly", "Petty crime (phone snatching) is common in busy areas — keep belongings close", "Rip currents are strong at some beaches — swim between the flags", "Public transport is limited — Uber is the safest option for getting around"]}$$::jsonb
WHERE slug = 'durban';

-- Kruger National Park
UPDATE cities SET
  positioning_line = 'Big Five safari without leaving South Africa',
  budget_tier = 'moderate',
  vibe = 'Wild, awe-inspiring, grounding',
  walkability = 'car_needed',
  transit_ease = 'minimal',
  women_should_know = $$["Self-drive safari is possible and deeply rewarding — you don''t need a guided vehicle", "Stay on paved and gravel roads at all times — never exit your vehicle in the park", "Book rest camps well in advance, especially for school holidays and dry season (May-Oct)", "Dawn and dusk are the best times for animal sightings — plan your drives around golden hours", "Malaria prophylaxis is recommended for northern Kruger — consult your doctor before travel"]$$::jsonb,
  experience_pillars = $$[{"title": "Big Five", "descriptor": "Lion, leopard, elephant, rhino, buffalo"}, {"title": "Self-drive", "descriptor": "900+ km of roads to explore at your own pace"}, {"title": "Birding", "descriptor": "500+ species for serious birders"}, {"title": "Stargazing", "descriptor": "Zero light pollution in rest camps"}]$$::jsonb,
  how_women_use = $${"summary": "Solo women love Kruger because self-drive makes it accessible and affordable. You set your own pace, wake before dawn for game drives, and return to fenced rest camps with restaurants and shared braai areas where you meet other travelers.", "bullets": ["Book a lower camp like Satara or Skukuza for central Big Five territory", "Join a guided night drive from camp — animals you won''t see by day", "Download the Kruger Sightings app to find where animals were spotted"]}$$::jsonb,
  awareness = $${"summary": "The park itself is exceptionally safe — the biggest risks are wildlife-related, not human.", "bullets": ["Never exit your vehicle except at designated rest areas and picnic spots", "Gate times are strict — if you arrive after closing, you get fined", "Keep windows up when near elephants and big cats — they are wild animals", "Fuel up at every rest camp — distances between camps can be 100+ km"]}$$::jsonb
WHERE slug = 'kruger-national-park';

-- =========================================================================
-- LESOTHO
-- =========================================================================

-- Maseru
UPDATE cities SET
  positioning_line = 'Gateway to the mountain kingdom',
  budget_tier = 'budget',
  vibe = 'Quiet, functional, transitional',
  walkability = 'somewhat_walkable',
  transit_ease = 'minimal',
  women_should_know = $$["Maseru is a transit stop, not a destination — plan to move into the highlands quickly", "The Maseru Bridge border crossing from South Africa can be slow — arrive early", "ATMs exist but are unreliable — bring South African Rand as backup", "Minibus taxis are the main public transport and can be crowded", "Basotho blankets make beautiful, meaningful souvenirs — buy from local shops, not border stalls"]$$::jsonb,
  experience_pillars = $$[{"title": "Culture", "descriptor": "National Museum and Basotho hat craft"}, {"title": "Gateway", "descriptor": "Staging point for highland adventures"}, {"title": "Markets", "descriptor": "Maseru Market for local crafts and textiles"}, {"title": "History", "descriptor": "Thaba Bosiu — King Moshoeshoe I''s mountain fortress"}]$$::jsonb,
  how_women_use = $${"summary": "Solo women pass through Maseru to reach Lesotho''s mountains. The city itself offers a night or two of orientation — stock up on supplies, visit Thaba Bosiu, and arrange transport to the highlands.", "bullets": ["One night is enough — use it to organize highland logistics", "Visit Thaba Bosiu cultural village for historical context", "Stock up on cash and supplies before heading into the mountains"]}$$::jsonb,
  awareness = $${"summary": "Maseru is a small, manageable capital but has limited tourist infrastructure.", "bullets": ["Walking after dark is not recommended — roads are poorly lit", "Limited accommodation options — book ahead rather than arriving on spec", "Healthcare facilities are basic — carry a first aid kit and any medications you need", "Cell coverage is decent in Maseru but drops off rapidly in the highlands"]}$$::jsonb
WHERE slug = 'maseru';

-- Semonkong
UPDATE cities SET
  positioning_line = 'Mountain village with Africa''s highest single-drop waterfall',
  budget_tier = 'budget',
  vibe = 'Remote, raw, breathtaking',
  walkability = 'car_needed',
  transit_ease = 'minimal',
  women_should_know = $$["The road from Maseru is rough and takes 3-4 hours — 4WD is strongly recommended", "Maletsunyane Falls (192m) is the main attraction and requires a hike to the base", "Semonkong Lodge is the only real accommodation — book ahead", "There are no ATMs, pharmacies, or shops beyond basics — bring everything you need", "Pony trekking with local Basotho guides is the iconic way to explore the area"]$$::jsonb,
  experience_pillars = $$[{"title": "Waterfalls", "descriptor": "Maletsunyane Falls — 192m single drop"}, {"title": "Pony trekking", "descriptor": "Basotho-guided highland rides"}, {"title": "Hiking", "descriptor": "Gorge trails and village walks"}, {"title": "Community", "descriptor": "Genuine rural Basotho village life"}]$$::jsonb,
  how_women_use = $${"summary": "Women who come to Semonkong are looking to disconnect entirely. It is one of the most remote places you can easily reach in southern Africa — a place for hiking, pony trekking, and sitting at the edge of a 192-meter waterfall in silence.", "bullets": ["Stay at Semonkong Lodge for 2-3 nights minimum", "Book a pony trek to the falls for the full experience", "Bring a book, a journal, and warm layers — evenings are cold even in summer"]}$$::jsonb,
  awareness = $${"summary": "Semonkong is safe but extremely remote — preparation is everything.", "bullets": ["No medical facilities — the nearest hospital is back in Maseru", "Altitude is 2,275m — nights are cold year-round, bring proper layers", "The road floods in heavy rains (Nov-Feb) — check conditions before driving", "No cell service in the valley — notify someone of your plans before arriving"]}$$::jsonb
WHERE slug = 'semonkong';

-- =========================================================================
-- ZIMBABWE
-- =========================================================================

-- Victoria Falls
UPDATE cities SET
  positioning_line = 'The smoke that thunders with adrenaline on the side',
  budget_tier = 'moderate',
  vibe = 'Adventurous, spectacular, social',
  walkability = 'very_walkable',
  transit_ease = 'limited',
  women_should_know = $$["The town itself is walkable and feels safe — most things are within 20 minutes on foot", "Adventure activities (bungee, rafting, zipline) are well-regulated and have strong safety records", "US Dollars are the main currency — bring clean, undamaged bills from 2009 or later", "Both the Zimbabwe and Zambia sides of the falls are worth visiting — get a KAZA UniVisa for both", "Spray from the falls soaks everything March-May during peak flow — bring waterproof bags for electronics"]$$::jsonb,
  experience_pillars = $$[{"title": "The Falls", "descriptor": "One of the Seven Natural Wonders"}, {"title": "Adventure", "descriptor": "Bungee, white-water rafting, helicopter flights"}, {"title": "Wildlife", "descriptor": "Zambezi sunset cruises and game drives"}, {"title": "Culture", "descriptor": "Local village visits and craft markets"}]$$::jsonb,
  how_women_use = $${"summary": "Victoria Falls is one of the most social solo destinations in southern Africa. The town is compact and backpacker-friendly, adventure activities create instant bonds with other travelers, and the falls themselves are genuinely awe-inspiring every single time.", "bullets": ["Stay near the town center for walkability to the falls and restaurants", "Book a Zambezi sunset cruise — the wildlife sightings are reliable", "Cross to Livingstone (Zambia side) for a different angle on the falls"]}$$::jsonb,
  awareness = $${"summary": "Victoria Falls town is one of the safest places in Zimbabwe for solo travelers.", "bullets": ["Street vendors can be persistent — a firm but polite ''no thank you'' works", "Don''t swim near the falls outside of Devil''s Pool (Zambia side, dry season only)", "Monkeys and baboons will steal food — secure your belongings at lookout points", "Avoid unofficial money changers — use banks or hotels for currency exchange"]}$$::jsonb
WHERE slug = 'victoria-falls';

-- Harare
UPDATE cities SET
  positioning_line = 'Zimbabwe''s green capital with emerging creative energy',
  budget_tier = 'budget',
  vibe = 'Entrepreneurial, warm, understated',
  walkability = 'car_needed',
  transit_ease = 'limited',
  women_should_know = $$["Uber is not available — use established local taxi services or hotel-arranged transport", "The craft and art scene is genuinely impressive — visit First Floor Gallery and National Gallery", "US Dollars are the functional currency — carry small denominations for everyday purchases", "Zimbabweans are famously warm and will go out of their way to help visitors", "Power outages are frequent — accommodation with generators or solar is worth the premium"]$$::jsonb,
  experience_pillars = $$[{"title": "Art", "descriptor": "Stone sculpture tradition and contemporary galleries"}, {"title": "Nature", "descriptor": "Mukuvisi Woodlands and Lake Chivero"}, {"title": "Food", "descriptor": "Growing restaurant scene in Borrowdale and Avondale"}, {"title": "Markets", "descriptor": "Mbare Market for fabrics, crafts, and local life"}]$$::jsonb,
  how_women_use = $${"summary": "Harare is not on most tourist itineraries, which is precisely its appeal. Women who visit find a green, spread-out city with genuine warmth, an emerging food and art scene, and a chance to experience Zimbabwe beyond the falls.", "bullets": ["Base in Borrowdale or Avondale for restaurants and relative safety", "Visit Doon Estate and Tynwald for art galleries and weekend markets", "Use Harare as a base for day trips to Chinhoyi Caves or Lake Chivero"]}$$::jsonb,
  awareness = $${"summary": "Harare requires common-sense urban awareness but is less intimidating than it sounds.", "bullets": ["Economic instability means prices can change rapidly — confirm prices before purchasing", "Avoid walking alone after dark, especially outside main commercial areas", "Political demonstrations can arise without warning — steer clear and monitor local news", "Healthcare is limited — comprehensive travel insurance with medical evacuation is essential"]}$$::jsonb
WHERE slug = 'harare';

-- Masvingo
UPDATE cities SET
  positioning_line = 'Home to Great Zimbabwe — southern Africa''s ancient stone city',
  budget_tier = 'budget',
  vibe = 'Historic, quiet, culturally rich',
  walkability = 'car_needed',
  transit_ease = 'minimal',
  women_should_know = $$["Great Zimbabwe ruins are 28 km from town — arrange transport in advance or rent a car", "The ruins are one of sub-Saharan Africa''s most important archaeological sites", "Accommodation options are limited — the lodges near the ruins are your best bet", "Bring sufficient cash in USD — card acceptance is unreliable", "A local guide at the ruins transforms the visit from interesting to unforgettable"]$$::jsonb,
  experience_pillars = $$[{"title": "Great Zimbabwe", "descriptor": "UNESCO World Heritage stone ruins"}, {"title": "History", "descriptor": "Capital of a medieval trading empire"}, {"title": "Lake Mutirikwi", "descriptor": "Scenic lake for birding and boat trips"}, {"title": "Culture", "descriptor": "Shona heritage and soapstone carving tradition"}]$$::jsonb,
  how_women_use = $${"summary": "Women visit Masvingo for Great Zimbabwe — full stop. It is one of sub-Saharan Africa''s most significant historical sites, and spending a day walking through the stone walls of a medieval civilization is a profoundly moving experience.", "bullets": ["Stay at a lodge near the ruins for easy morning access before tour groups arrive", "Hire a guide at the entrance — their knowledge brings the ruins to life", "Combine with Lake Mutirikwi for birding and a half-day boat trip"]}$$::jsonb,
  awareness = $${"summary": "Masvingo is a quiet, low-crime town but has very limited tourist infrastructure.", "bullets": ["No reliable public transport to the ruins — arrange a vehicle before arriving", "Medical facilities are basic — bring a comprehensive first aid kit", "Cell coverage is patchy around the ruins and lake", "Fuel shortages can occur — fill up whenever you see an open station"]}$$::jsonb
WHERE slug = 'masvingo';

-- =========================================================================
-- NAMIBIA
-- =========================================================================

-- Windhoek
UPDATE cities SET
  positioning_line = 'Small capital, big adventures in every direction',
  budget_tier = 'moderate',
  vibe = 'Clean, organized, German-influenced',
  walkability = 'walkable',
  transit_ease = 'limited',
  women_should_know = $$["Windhoek is one of Africa''s cleanest and most organized capitals — it feels surprisingly easy", "The city center is walkable during the day but take a taxi after dark", "German colonial influence means excellent bread, beer, and deli meats", "Car rental is essential for Namibia — arrange it in Windhoek before heading out", "Independence Avenue is the main strip for shops, restaurants, and banks"]$$::jsonb,
  experience_pillars = $$[{"title": "Gateway", "descriptor": "Staging point for all Namibian road trips"}, {"title": "Culture", "descriptor": "Namibian Craft Centre, National Museum"}, {"title": "Food", "descriptor": "German-Namibian fusion, Joe''s Beerhouse"}, {"title": "Markets", "descriptor": "Post Street Mall and craft vendors"}]$$::jsonb,
  how_women_use = $${"summary": "Windhoek is where solo women organize their Namibian road trip. Spend a day or two stocking up, renting a 4WD, and adjusting to the altitude before heading into the vast landscapes that make Namibia unforgettable.", "bullets": ["Rent a 4WD with a rooftop tent for the ultimate Namibia experience", "Stock up on supplies at Checkers or Pick n Pay — distances between towns are enormous", "Visit the Namibian Craft Centre for high-quality local art and textiles"]}$$::jsonb,
  awareness = $${"summary": "Windhoek is one of the safest capitals in southern Africa but basic precautions apply.", "bullets": ["The Katutura township area is best visited with a local guide", "Petty crime increases after dark in the city center — take taxis at night", "Self-drive culture means you need to be road-ready — wildlife on roads at dusk is a real hazard", "Fuel up at every opportunity once you leave Windhoek — distances are vast"]}$$::jsonb
WHERE slug = 'windhoek';

-- Sossusvlei
UPDATE cities SET
  positioning_line = 'The world''s tallest sand dunes at sunrise',
  budget_tier = 'moderate',
  vibe = 'Epic, silent, otherworldly',
  walkability = 'car_needed',
  transit_ease = 'minimal',
  women_should_know = $$["You must enter the Namib-Naukluft Park gate at sunrise for the best light on the dunes", "The last 5 km to Sossusvlei is deep sand — only 4WD vehicles can manage it, otherwise take the shuttle", "Deadvlei (the white clay pan with dead trees) is the iconic photo spot — walk past Sossusvlei to reach it", "Carry at least 3 liters of water per person — the desert heat is brutal by mid-morning", "Fuel up in Solitaire or Sesriem — there is nothing else for hundreds of kilometers"]$$::jsonb,
  experience_pillars = $$[{"title": "Dunes", "descriptor": "Dune 45 and Big Daddy at sunrise"}, {"title": "Deadvlei", "descriptor": "900-year-old dead trees on white clay"}, {"title": "Stargazing", "descriptor": "Among the darkest skies on Earth"}, {"title": "Desert drives", "descriptor": "Sesriem Canyon and vast gravel plains"}]$$::jsonb,
  how_women_use = $${"summary": "Solo women drive to Sossusvlei as part of a larger Namibian road trip. The experience is primal — climbing a 300-meter dune at dawn, standing alone in Deadvlei, and sleeping under stars so bright they feel close enough to touch.", "bullets": ["Stay inside the park gate at Sesriem Camp to enter before sunrise", "Climb Dune 45 for sunrise — it is accessible and the views are extraordinary", "Allow 2 nights minimum to avoid rushing — the desert demands slowness"]}$$::jsonb,
  awareness = $${"summary": "The desert environment is the main safety consideration — there are no human threats here.", "bullets": ["Dehydration is serious — carry more water than you think you need", "The 4WD-only section traps 2WD vehicles daily — know your car''s limits or take the shuttle", "No cell coverage in the park — tell someone your plans and expected return", "Wildlife on roads at dusk includes oryx and springbok — drive slowly after 4pm"]}$$::jsonb
WHERE slug = 'sossusvlei';

-- Swakopmund
UPDATE cities SET
  positioning_line = 'German colonial town between desert and ocean',
  budget_tier = 'moderate',
  vibe = 'Quirky, adventure-ready, coastal',
  walkability = 'very_walkable',
  transit_ease = 'limited',
  women_should_know = $$["The town center is compact and very walkable — one of the easiest places to explore on foot in Namibia", "The Atlantic coast here is cold — bring warm layers even in summer", "German bakeries and cafes are genuinely excellent and a unique Namibian quirk", "Adventure activities (sandboarding, quad biking, skydiving) are well-run and safe", "Swakopmund is the adventure capital of Namibia — book activities a day ahead in peak season"]$$::jsonb,
  experience_pillars = $$[{"title": "Adventure", "descriptor": "Sandboarding, skydiving, quad biking"}, {"title": "Coast", "descriptor": "Flamingos at Walvis Bay, dolphin cruises"}, {"title": "Desert meets ocean", "descriptor": "Sandwich Harbour 4WD excursion"}, {"title": "Architecture", "descriptor": "German colonial buildings and cafes"}]$$::jsonb,
  how_women_use = $${"summary": "Swakopmund is the pit stop every solo road tripper looks forward to. After days in the desert, the town offers hot showers, real coffee, adventure activities, and other travelers to share stories with over German beer and fresh oysters.", "bullets": ["Base here for 2-3 nights to recover from desert driving and do activities", "Book the Sandwich Harbour 4WD tour — it is one of Namibia''s best experiences", "Walk the waterfront for flamingos and fresh oysters at The Tug"]}$$::jsonb,
  awareness = $${"summary": "Swakopmund is very safe and one of the most comfortable towns in Namibia.", "bullets": ["The ocean is dangerously cold with strong currents — swimming is not recommended", "Fog rolls in frequently — driving the B2 between Windhoek and Swakopmund can be low-visibility", "Wildlife on roads remains a hazard on the drive in — oryx and kudu at dusk", "Book accommodation in advance during December-January school holidays"]}$$::jsonb
WHERE slug = 'swakopmund';

-- =========================================================================
-- MOZAMBIQUE
-- =========================================================================

-- Maputo
UPDATE cities SET
  positioning_line = 'Portuguese soul on the Indian Ocean with emerging nightlife',
  budget_tier = 'budget',
  vibe = 'Lively, coastal, underrated',
  walkability = 'somewhat_walkable',
  transit_ease = 'limited',
  women_should_know = $$["Portuguese is the official language — learn a few phrases, as English is not widely spoken", "The seafood is exceptional and cheap — peri-peri prawns are the signature dish", "Chapas (minibuses) are the main transport but can be confusing — tuk-tuks and taxis are easier", "The Baixa (downtown) is walkable during the day with colonial architecture worth exploring", "Mozambican meticais are the currency but South African Rand are accepted in some places near the border"]$$::jsonb,
  experience_pillars = $$[{"title": "Food", "descriptor": "Peri-peri prawns and Portuguese-Mozambican fusion"}, {"title": "Music", "descriptor": "Marrabenta live music and vibrant nightlife"}, {"title": "Architecture", "descriptor": "Art Deco and colonial Baixa district"}, {"title": "Markets", "descriptor": "Mercado Central for spices, crafts, and local life"}]$$::jsonb,
  how_women_use = $${"summary": "Maputo is an unexpected gem. Solo women come for the food, the music, and the energy of a city that feels genuinely undiscovered. The Portuguese-African fusion culture creates something you won''t find anywhere else on the continent.", "bullets": ["Stay in the Polana or Sommerschield neighborhoods for safety and restaurant access", "Visit Mercado do Peixe (fish market) for the freshest, cheapest seafood meal of your trip", "Catch live marrabenta music on a weekend night — ask your hotel for recommendations"]}$$::jsonb,
  awareness = $${"summary": "Maputo requires awareness but is manageable with basic precautions.", "bullets": ["Street crime (phone snatching, bag grabbing) is common — keep valuables hidden and stay alert", "Avoid walking alone after dark, especially away from main roads", "Tap water is not safe to drink — stick to bottled or filtered water", "Police checkpoints exist — always carry a copy of your passport and visa"]}$$::jsonb
WHERE slug = 'maputo';

-- Tofo
UPDATE cities SET
  positioning_line = 'Whale sharks and barefoot beach bars on Mozambique''s coast',
  budget_tier = 'budget',
  vibe = 'Laid-back, marine, backpacker',
  walkability = 'very_walkable',
  transit_ease = 'minimal',
  women_should_know = $$["Whale shark and manta ray diving is world-class here — October to March is best season", "The town is tiny and walkable — everything is along the beach or the main sand road", "Accommodation ranges from basic backpacker lodges to comfortable beachfront guesthouses", "Bring enough cash for your stay — the nearest reliable ATM is in Inhambane, 25 km away", "The backpacker community is tight-knit and welcoming — solo travelers make friends fast"]$$::jsonb,
  experience_pillars = $$[{"title": "Marine life", "descriptor": "Whale sharks, mantas, and reef diving"}, {"title": "Beach", "descriptor": "Long white sand with warm Indian Ocean water"}, {"title": "Community", "descriptor": "Small-town backpacker culture"}, {"title": "Seafood", "descriptor": "Fresh-caught fish cooked on the beach"}]$$::jsonb,
  how_women_use = $${"summary": "Tofo is the kind of place where you arrive for three days and stay for two weeks. Solo women come for the whale sharks and stay for the barefoot beach life, the community of travelers, and the simplicity of days spent between the ocean and a hammock.", "bullets": ["Book a whale shark ocean safari — it is a bucket-list marine encounter", "Stay at a beachfront lodge for sunrise views and easy access to dive operators", "Eat at Tofo Market for cheap, fresh seafood cooked to order"]}$$::jsonb,
  awareness = $${"summary": "Tofo is a laid-back beach town with few safety concerns beyond basic precautions.", "bullets": ["Petty theft from unlocked rooms happens — use a padlock and don''t leave valuables on the beach", "Ocean currents can be strong — listen to local advice before swimming", "Malaria is present — take prophylaxis and use insect repellent, especially at dusk", "Medical facilities are extremely limited — the nearest hospital is in Inhambane"]}$$::jsonb
WHERE slug = 'tofo';

-- Bazaruto Archipelago
UPDATE cities SET
  positioning_line = 'Indian Ocean island paradise for the adventurous',
  budget_tier = 'premium',
  vibe = 'Pristine, exclusive, remote',
  walkability = 'very_walkable',
  transit_ease = 'minimal',
  women_should_know = $$["Access is by boat from Vilankulo or charter flight — there are no roads to the islands", "Accommodation is mostly luxury lodges — budget options are extremely limited", "The marine park is protected — snorkeling and diving here is world-class with healthy reefs", "Dugongs (sea cows) live here — one of the few places in Africa to see them", "Bring everything you need — there are no shops, ATMs, or pharmacies on the islands"]$$::jsonb,
  experience_pillars = $$[{"title": "Diving", "descriptor": "Pristine coral reefs and marine megafauna"}, {"title": "Islands", "descriptor": "White sand, turquoise water, zero crowds"}, {"title": "Marine life", "descriptor": "Dugongs, dolphins, whale sharks, turtles"}, {"title": "Seclusion", "descriptor": "Complete digital and physical disconnect"}]$$::jsonb,
  how_women_use = $${"summary": "The Bazaruto Archipelago is for women who want genuine remoteness with comfort. This is not a backpacker destination — it is a place to disconnect completely, dive pristine reefs, and experience an Indian Ocean island that tourism has barely touched.", "bullets": ["Book a lodge package that includes meals, activities, and boat transfers", "Snorkel the Two Mile Reef for an accessible encounter with the marine park", "Allow at least 3 nights — getting here takes effort, so make it worth it"]}$$::jsonb,
  awareness = $${"summary": "The archipelago is extremely safe — the remoteness itself is the main consideration.", "bullets": ["No medical facilities on the islands — lodges have basic first aid but evacuation takes time", "Sun exposure is intense — reef-safe sunscreen, hats, and rash guards are essential", "Boat transfers can be rough in windy conditions (June-August) — confirm sea conditions", "Communication is limited — some lodges have WiFi but don''t rely on it"]}$$::jsonb
WHERE slug = 'bazaruto-archipelago';
