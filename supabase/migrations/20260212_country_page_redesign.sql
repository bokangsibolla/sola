-- 20260212_country_page_redesign.sql
-- Adds structured fields for the redesigned country page:
--   budget_breakdown (JSONB), vibe_summary, social_vibe, cultural_note,
--   transport_summary, intro_md
-- Then populates content for all 12 active countries.

-- ---------------------------------------------------------------------------
-- 1. Schema: add new columns
-- ---------------------------------------------------------------------------

ALTER TABLE countries ADD COLUMN IF NOT EXISTS budget_breakdown JSONB DEFAULT NULL;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS vibe_summary TEXT DEFAULT NULL;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS social_vibe TEXT DEFAULT NULL;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS cultural_note TEXT DEFAULT NULL;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS transport_summary TEXT DEFAULT NULL;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS intro_md TEXT DEFAULT NULL;

-- ---------------------------------------------------------------------------
-- 2. Content: populate all 12 countries
-- ---------------------------------------------------------------------------

-- THAILAND
UPDATE countries SET
  budget_breakdown = '{"accommodation":{"low":8,"high":30,"currency":"USD","note":"Dorm bed to private fan room"},"food":{"low":3,"high":12,"currency":"USD","note":"Street stall to sit-down restaurant"},"transport":{"low":1,"high":8,"currency":"USD","note":"Songthaew to Grab taxi"},"activities":{"low":0,"high":25,"currency":"USD","note":"Temple entry to cooking class"}}'::jsonb,
  vibe_summary = 'Warm, easy-going, welcoming',
  social_vibe = 'Effortless to meet other travelers, especially in hostels and island towns',
  cultural_note = 'Cover shoulders and knees at temples, remove shoes before entering homes',
  transport_summary = 'Cheap and efficient: overnight trains, domestic flights, ride-hailing apps',
  intro_md = E'Thailand has been the starting point for more solo women travelers than probably any other country. There is a reason for that. The infrastructure is forgiving, the costs are low, the food is extraordinary, and the culture is genuinely warm without being overwhelming. You can move through the country at your own pace without ever feeling stuck or stranded.\n\nWhat keeps women coming back is the range. Within a single trip you can meditate at a forest monastery in Chiang Mai, eat your way through Bangkok''s Chinatown, learn to freedive on Koh Tao, and sleep in a treehouse in Khao Sok. The country scales to your confidence level: easy enough for your first trip, deep enough for your tenth.'
WHERE slug = 'thailand';

-- VIETNAM
UPDATE countries SET
  budget_breakdown = '{"accommodation":{"low":6,"high":25,"currency":"USD","note":"Dorm bed to boutique guesthouse"},"food":{"low":2,"high":10,"currency":"USD","note":"Pho cart to full restaurant meal"},"transport":{"low":1,"high":15,"currency":"USD","note":"City bus to domestic flight"},"activities":{"low":0,"high":30,"currency":"USD","note":"Museum entry to Ha Long Bay cruise"}}'::jsonb,
  vibe_summary = 'Energetic, intense, rewarding',
  social_vibe = 'Backpacker scene in the south, quieter connections in the north',
  cultural_note = 'Dress modestly at pagodas, accept business cards with both hands',
  transport_summary = 'Sleeper buses connect major cities, Grab works everywhere, trains along the coast',
  intro_md = E'Vietnam moves fast. The motorbikes, the street vendors, the pace of daily life: it can feel like a lot in the first hour and completely natural by the second day. Women who travel here tend to describe it as the trip that made them feel capable. The country rewards those who lean in rather than hanging back.\n\nThe geography alone makes it worth the visit. You can ride a motorbike through terraced rice fields in Ha Giang, kayak through limestone karsts in Lan Ha Bay, and drink egg coffee in a narrow Hanoi alleyway, all within a week. Costs are remarkably low, the food is among the best in Southeast Asia, and the country''s north-to-south shape makes route planning straightforward.'
WHERE slug = 'vietnam';

-- PORTUGAL
UPDATE countries SET
  budget_breakdown = '{"accommodation":{"low":20,"high":60,"currency":"USD","note":"Hostel dorm to guesthouse"},"food":{"low":8,"high":25,"currency":"USD","note":"Local tasca to wine bar dinner"},"transport":{"low":2,"high":15,"currency":"USD","note":"Metro ride to intercity train"},"activities":{"low":0,"high":30,"currency":"USD","note":"Beach day to Sintra palace tour"}}'::jsonb,
  vibe_summary = 'Relaxed, soulful, understated',
  social_vibe = 'Growing digital nomad community, coworking cafes make meeting people easy',
  cultural_note = 'Punctuality is relaxed, greet shopkeepers when entering, tipping is modest',
  transport_summary = 'Excellent train network, affordable Uber, walkable historic centers',
  intro_md = E'Portugal is the kind of place that feels sophisticated without trying. Lisbon''s tiled facades and rooftop bars sit alongside Michelin-starred restaurants that cost half what they would in Paris. Porto is quieter, sharper, built on port wine and bookshops. The Algarve offers coastline that rivals anything in the Mediterranean at a fraction of the price.\n\nFor solo women, the appeal is practical as much as aesthetic. Portugal is one of the safest countries in Europe, English is widely spoken, the public transit works well, and the locals tend toward a polite reserve that feels respectful rather than cold. It is an easy country to move through alone without ever feeling conspicuous.'
WHERE slug = 'portugal';

-- JAPAN
UPDATE countries SET
  budget_breakdown = '{"accommodation":{"low":25,"high":80,"currency":"USD","note":"Capsule hotel to ryokan"},"food":{"low":6,"high":30,"currency":"USD","note":"Convenience store meal to sushi counter"},"transport":{"low":5,"high":20,"currency":"USD","note":"Metro day pass to shinkansen segment"},"activities":{"low":0,"high":40,"currency":"USD","note":"Temple visit to tea ceremony"}}'::jsonb,
  vibe_summary = 'Precise, calm, deeply considered',
  social_vibe = 'Quieter social scene, meaningful one-on-one connections over group socializing',
  cultural_note = 'Bow when greeting, remove shoes indoors, keep voices low on trains',
  transport_summary = 'World-class rail system, IC cards work everywhere, everything runs on time',
  intro_md = E'Japan operates at a level of precision and care that can feel almost surreal. The trains arrive on time to the second. The food, even at a convenience store, is genuinely good. The cities are clean, the signage is clear, and violent crime is vanishingly rare. For a solo woman, this translates into a rare kind of freedom: the freedom to stop thinking about logistics and just be present.\n\nWhat surprises most first-time visitors is the range of experiences packed into a small geography. You can soak in an outdoor onsen surrounded by snow-covered mountains, eat ramen at a tiny eight-seat counter in Tokyo, walk through thousand-year-old bamboo groves in Kyoto, and sleep on a futon in a traditional inn, all connected by a rail network that makes the whole country feel accessible.'
WHERE slug = 'japan';

-- COLOMBIA
UPDATE countries SET
  budget_breakdown = '{"accommodation":{"low":8,"high":35,"currency":"USD","note":"Hostel dorm to boutique posada"},"food":{"low":3,"high":15,"currency":"USD","note":"Menu del dia to upscale restaurant"},"transport":{"low":1,"high":12,"currency":"USD","note":"TransMilenio to domestic flight"},"activities":{"low":5,"high":40,"currency":"USD","note":"Walking tour to multi-day trek"}}'::jsonb,
  vibe_summary = 'Vibrant, warm, full of rhythm',
  social_vibe = 'Colombians are genuinely social; expect to be invited to dance, eat, or talk',
  cultural_note = 'Greet everyone when entering a room, personal space is closer than in Europe',
  transport_summary = 'Domestic flights are cheap, Uber works in cities, intercity buses are comfortable',
  intro_md = E'Colombia has spent the last decade rewriting its own story, and the country you arrive in today bears little resemblance to the one your parents warned you about. Medellin has become a hub for remote workers and creatives. Cartagena''s walled city is one of the most beautiful urban spaces in the Americas. The coffee region is lush, quiet, and perfect for slow travel.\n\nWomen who travel here talk about the warmth. Not just the weather, but the culture. Colombians are genuinely hospitable in a way that goes beyond tourism industry politeness. You will be invited to share meals, join salsa classes, and hear life stories from strangers who feel like friends within minutes. The country asks you to be present and open, and it gives back generously.'
WHERE slug = 'colombia';

-- MEXICO
UPDATE countries SET
  budget_breakdown = '{"accommodation":{"low":10,"high":40,"currency":"USD","note":"Hostel dorm to boutique hotel"},"food":{"low":3,"high":15,"currency":"USD","note":"Taco stand to mezcal restaurant"},"transport":{"low":1,"high":10,"currency":"USD","note":"Metro to ADO intercity bus"},"activities":{"low":5,"high":35,"currency":"USD","note":"Museum entry to cenote snorkeling"}}'::jsonb,
  vibe_summary = 'Creative, layered, endlessly varied',
  social_vibe = 'Strong expat and digital nomad communities, especially in CDMX and Oaxaca',
  cultural_note = 'Greetings involve a cheek kiss among women, mealtime is social and unhurried',
  transport_summary = 'ADO buses are comfortable for long distances, Uber in cities, colectivos locally',
  intro_md = E'Mexico is not one country so much as it is dozens of them layered on top of each other. Mexico City alone could fill a month: world-class museums, street food that rivals any fine dining, neighborhoods that each feel like distinct cities. Oaxaca offers mezcal, textiles, and one of the most compelling food cultures on the planet. The Yucatan has ruins, cenotes, and Caribbean coastline.\n\nFor solo women, Mexico rewards those who do a little research and trust their instincts. The well-traveled routes are well-traveled for good reason: they are safe, well-connected, and full of other independent travelers. The culture is warm and family-oriented, which means solo women are generally treated with a kind of protective respect rather than suspicion.'
WHERE slug = 'mexico';

-- INDONESIA
UPDATE countries SET
  budget_breakdown = '{"accommodation":{"low":6,"high":30,"currency":"USD","note":"Guesthouse to private villa"},"food":{"low":2,"high":10,"currency":"USD","note":"Warung to beachfront restaurant"},"transport":{"low":1,"high":15,"currency":"USD","note":"Scooter rental to domestic flight"},"activities":{"low":5,"high":40,"currency":"USD","note":"Temple visit to dive certification"}}'::jsonb,
  vibe_summary = 'Spiritual, lush, deeply relaxed',
  social_vibe = 'Bali has a massive solo traveler community; outer islands are more solitary',
  cultural_note = 'Cover up at temples, use your right hand for giving and receiving, respect ceremonies',
  transport_summary = 'Grab in cities, scooter rentals on islands, domestic flights between regions',
  intro_md = E'Indonesia is the country that keeps expanding the longer you stay. Most people arrive in Bali and discover it is just the beginning. Ubud''s rice terraces and yoga studios are the well-known entry point, but beyond that lies an archipelago of 17,000 islands with volcanic peaks, coral reefs, animist villages, and some of the most biodiverse marine environments on earth.\n\nThe solo women who come here tend to split into two groups: those who find their community in Bali''s well-established wellness and coworking scene, and those who push further out to places like Flores, Sulawesi, or Raja Ampat. Both paths are valid. Bali makes solo travel effortless with its infrastructure and social scene. The outer islands reward more experienced travelers with experiences that feel genuinely remote.'
WHERE slug = 'indonesia';

-- MOROCCO
UPDATE countries SET
  budget_breakdown = '{"accommodation":{"low":10,"high":40,"currency":"USD","note":"Basic riad to restored courtyard house"},"food":{"low":3,"high":12,"currency":"USD","note":"Street food to rooftop tagine"},"transport":{"low":1,"high":15,"currency":"USD","note":"Local bus to private transfer"},"activities":{"low":5,"high":50,"currency":"USD","note":"Medina tour to desert overnight"}}'::jsonb,
  vibe_summary = 'Intense, beautiful, demands engagement',
  social_vibe = 'Harder to meet other solo women; riads and organized tours create connection points',
  cultural_note = 'Dress modestly outside tourist zones, learn basic French or Arabic greetings, bargain respectfully',
  transport_summary = 'Trains between major cities, CTM buses elsewhere, petits taxis within towns',
  intro_md = E'Morocco does not ease you in gently. The medinas are loud and labyrinthine. The colors, smells, and sounds arrive all at once. Shopkeepers will call out to you. Touts will offer directions. It can feel overwhelming on day one and completely intoxicating by day three. This is a country that rewards travelers who stay long enough to find their own rhythm.\n\nFor solo women, Morocco requires a bit more intentionality than Southeast Asia or Europe. The attention can be persistent, particularly in Marrakech and Fez. But women who travel here consistently describe it as one of their most memorable trips. The architecture is staggering, the food is complex and generous, and the landscape shifts from Atlantic coastline to Atlas mountains to Sahara desert within a few hours of driving.'
WHERE slug = 'morocco';

-- GREECE
UPDATE countries SET
  budget_breakdown = '{"accommodation":{"low":15,"high":50,"currency":"USD","note":"Hostel to island guesthouse"},"food":{"low":8,"high":20,"currency":"USD","note":"Gyro to taverna dinner"},"transport":{"low":2,"high":20,"currency":"USD","note":"Metro to island ferry"},"activities":{"low":0,"high":30,"currency":"USD","note":"Beach day to sailing trip"}}'::jsonb,
  vibe_summary = 'Sunlit, unhurried, generous',
  social_vibe = 'Island-hopping creates natural social circles; Athens has a strong local scene',
  cultural_note = 'Greeks eat late, expect dinner at 9pm or later, hospitality is deeply cultural',
  transport_summary = 'Ferries connect the islands, Athens metro is excellent, buses for the mainland',
  intro_md = E'Greece is the country where you slow down whether you planned to or not. The pace of life, particularly on the islands, operates on its own clock. Meals take two hours. Afternoons are for swimming and reading. Sunsets are a daily event that people actually stop to watch. For a solo woman used to optimizing every hour, this enforced slowness can feel like a gift.\n\nThe practical appeal is strong. Greece is safe, affordable by European standards, and easy to navigate. The ferry system connects hundreds of islands, each with its own character: Naxos for hiking and local cheese, Milos for volcanic beaches, Crete for gorges and Minoan ruins, Hydra for car-free quiet. You can build an itinerary that feels completely your own without any of the logistical stress that comes with more complex destinations.'
WHERE slug = 'greece';

-- SOUTH KOREA
UPDATE countries SET
  budget_breakdown = '{"accommodation":{"low":15,"high":50,"currency":"USD","note":"Guesthouse to hanok stay"},"food":{"low":5,"high":20,"currency":"USD","note":"Kimbap shop to BBQ restaurant"},"transport":{"low":2,"high":10,"currency":"USD","note":"Metro to KTX high-speed train"},"activities":{"low":0,"high":30,"currency":"USD","note":"Palace visit to DMZ tour"}}'::jsonb,
  vibe_summary = 'Modern, stylish, quietly welcoming',
  social_vibe = 'Korean social culture is group-oriented; language exchange meetups are a good entry point',
  cultural_note = 'Pour drinks for others before yourself, remove shoes indoors, age hierarchy matters',
  transport_summary = 'Exceptional metro and KTX rail system, T-money card works on everything',
  intro_md = E'South Korea delivers a version of Asia that is hyper-modern, impeccably clean, and surprisingly easy to navigate alone. Seoul is a city where you can get a Michelin-star meal for twelve dollars, soak in a jjimjilbang at 2am, hike a mountain inside city limits before breakfast, and tap a single transit card to get everywhere. The efficiency of daily life here is hard to overstate.\n\nBeyond Seoul, the country opens up into temple stays in the mountains, fishing villages on the south coast, and the volcanic island of Jeju, which has become a destination in its own right. Korea rewards the curious: the food culture runs deep, the hiking is world-class, and the design sensibility, from cafe interiors to train stations, reflects a culture that cares about how things look and feel.'
WHERE slug = 'south-korea';

-- COSTA RICA
UPDATE countries SET
  budget_breakdown = '{"accommodation":{"low":12,"high":45,"currency":"USD","note":"Hostel dorm to eco-lodge"},"food":{"low":5,"high":18,"currency":"USD","note":"Soda to farm-to-table restaurant"},"transport":{"low":2,"high":15,"currency":"USD","note":"Public bus to private shuttle"},"activities":{"low":10,"high":50,"currency":"USD","note":"Hiking to zip-lining to surf lesson"}}'::jsonb,
  vibe_summary = 'Green, active, laid-back',
  social_vibe = 'Surf and yoga communities create quick connections, especially on the Pacific coast',
  cultural_note = 'Ticos are friendly and informal, pura vida is a real ethos not just a slogan',
  transport_summary = 'Shuttle services between towns, rental cars for remote areas, buses are slow but cheap',
  intro_md = E'Costa Rica is the country where the nature does most of the talking. Cloud forests, active volcanoes, both Caribbean and Pacific coastline, howler monkeys at breakfast, and some of the best surfing in Central America. It is a place that pulls you outdoors and keeps you there. The biodiversity is staggering for a country roughly the size of West Virginia.\n\nFor solo women, the draw is both the environment and the infrastructure. Costa Rica has a long history with ecotourism, which means the logistics of independent travel are well-established. Shuttles run between major destinations. Eco-lodges cater to solo travelers. Surf camps and yoga retreats create instant communities. The country feels safe, the locals are relaxed and genuine, and the pura vida ethos is less a tourist branding exercise and more a real reflection of how people live.'
WHERE slug = 'costa-rica';

-- PERU
UPDATE countries SET
  budget_breakdown = '{"accommodation":{"low":8,"high":35,"currency":"USD","note":"Hostel dorm to converted colonial house"},"food":{"low":3,"high":15,"currency":"USD","note":"Menu del dia to cevicheria"},"transport":{"low":1,"high":15,"currency":"USD","note":"Combi to domestic flight"},"activities":{"low":5,"high":60,"currency":"USD","note":"Museum to multi-day Inca Trail"}}'::jsonb,
  vibe_summary = 'Ancient, dramatic, humbling',
  social_vibe = 'Strong backpacker circuit in Cusco and the Sacred Valley, quieter in the north',
  cultural_note = 'Greet with a kiss on the cheek, altitude sickness is real: take the first day slow',
  transport_summary = 'Cruz del Sur buses for long routes, colectivos locally, flights to save time',
  intro_md = E'Peru is the country that makes you feel small in the best possible way. The Andes are vast. The Amazon is dense. Machu Picchu, even when crowded, retains a presence that photographs never fully capture. The landscape here operates at a scale that recalibrates your sense of what is possible, and the civilizations that built on it were extraordinary.\n\nBut Peru is more than its headline attraction. Lima has become one of the great food cities of the world, with ceviche and causa that will ruin you for lesser versions. Cusco''s cobblestone streets and Inca stonework are worth days of slow exploration. The Sacred Valley offers hiking, weaving communities, and salt terraces that predate the Spanish by centuries. The country is affordable, the backpacker infrastructure is mature, and the women who travel here tend to describe it as the trip that expanded what they thought they could do.'
WHERE slug = 'peru';
