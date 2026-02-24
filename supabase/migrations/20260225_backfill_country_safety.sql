-- Backfill safety_women_md, solo_level, solo_infrastructure_md, culture_etiquette_md
-- for 7 countries missing this content.
-- Safe to re-run (UPDATE only, no schema changes).

-- ══════════════════════════════════════════════════
-- SOUTH KOREA
-- ══════════════════════════════════════════════════
UPDATE countries SET
  solo_level = 'beginner',
  safety_women_md = 'South Korea is one of the safest countries in Asia for solo women. Violent crime is rare and cities feel safe to walk around at night. Public transport runs late and is well-lit with CCTV coverage. Subway cars have women-only sections during rush hour in Seoul. The main nuisances are minor — upskirt filming (molka) has prompted widespread crackdown and reporting mechanisms in public restrooms. Taxis are metered and safe; the Kakao T app provides a tracked ride-hailing option. Bars in Itaewon and Hongdae get rowdy on weekends — standard drink-awareness applies.',
  solo_infrastructure_md = 'South Korea is built for independent travel. Seoul''s subway system is world-class with English signage, real-time apps, and runs until midnight. KTX high-speed trains connect Seoul to Busan in under 3 hours. T-money cards work on all public transport nationwide. 5G coverage is near-universal and free WiFi is available in most cafes, stations, and even buses. Tourist SIM cards with unlimited data cost around $20-30 for a week at Incheon Airport. Naver Maps is more accurate than Google Maps here. English is widely understood in Seoul and tourist areas; outside major cities, Papago (Korean translation app) fills the gap.',
  culture_etiquette_md = 'Remove shoes when entering homes and some traditional restaurants. Bowing slightly is a common greeting. When receiving or giving items, use two hands as a sign of respect. Pouring your own drink is considered impolite — pour for others and let them pour for you. Age hierarchy matters in social settings. Tipping is not expected and can cause confusion. Dress is generally modern and casual, but modest clothing is appreciated at temples and traditional sites.'
WHERE slug = 'south-korea';

-- ══════════════════════════════════════════════════
-- TAIWAN
-- ══════════════════════════════════════════════════
UPDATE countries SET
  solo_level = 'beginner',
  vibe_summary = 'Night markets, hot springs, temple culture, and some of Asia''s best hiking — in a compact, safe, welcoming package',
  safety_women_md = 'Taiwan consistently ranks among the safest places in Asia for solo women travelers. Violent crime is extremely rare and locals are genuinely helpful. Taipei''s MRT runs until midnight and stations are well-lit with security cameras. Convenience stores (7-Eleven, FamilyMart) are on every block and serve as safe, 24-hour waypoints. The YouBike system is safe for daytime cycling. Night markets are crowded but generally safe — keep belongings close in the busiest lanes. Taxi drivers use meters and are trustworthy; Uber and LINE Taxi offer tracked rides.',
  solo_infrastructure_md = 'Taiwan is exceptionally easy to navigate solo. Taipei''s MRT is clean, efficient, and has clear English signage. The Taiwan High Speed Rail (THSR) connects Taipei to Kaohsiung in 90 minutes. EasyCard works on all transit, bikes, and many stores. 4G coverage is excellent islandwide; tourist SIM cards with unlimited data cost around $15-20 at the airport. Google Maps works well here. English signage exists throughout Taipei and tourist areas. Outside cities, a few Mandarin phrases or Google Translate with the camera function handle most situations.',
  culture_etiquette_md = 'Taiwanese culture is warm and polite. Remove shoes when entering homes. Avoid sticking chopsticks upright in rice (associated with funerals). Tipping is not expected. Recycling is taken seriously — sort your trash at public bins. When visiting temples, dress modestly and follow the incense and prayer customs posted at entrances. Taiwanese people appreciate politeness and patience; a simple "xie xie" (thank you) goes a long way.'
WHERE slug = 'taiwan';

-- ══════════════════════════════════════════════════
-- SOUTH AFRICA
-- ══════════════════════════════════════════════════
UPDATE countries SET
  solo_level = 'intermediate',
  safety_women_md = 'South Africa requires more situational awareness than most Southeast Asian destinations but rewards careful travelers. In Cape Town, stick to well-trafficked areas like the V&A Waterfront, Camps Bay, and the City Bowl during the day. After dark, use Uber rather than walking — even in popular areas. Johannesburg requires more caution; Sandton, Rosebank, and Maboneng are the safer neighborhoods. Keep valuables out of sight and avoid using your phone visibly on the street. Avoid isolated beaches and hiking trails alone. Township tours should always be with reputable, local-led operators. Car hijacking is a known risk — keep doors locked and windows up at traffic lights in cities.',
  solo_infrastructure_md = 'South Africa''s tourism infrastructure is well-developed. Uber works reliably in Cape Town, Johannesburg, and Durban. Domestic flights between major cities are frequent and affordable (FlySafair, Kulula). Intercity bus services (Greyhound, Intercape) connect major routes. Renting a car is common for the Garden Route and Kruger area — drive on the left. 4G coverage is good in cities and along major routes; Vodacom and MTN offer affordable tourist SIMs at the airport. English is widely spoken throughout the country. Google Maps is reliable for navigation.',
  culture_etiquette_md = 'South Africa has 11 official languages and diverse cultural traditions. A friendly greeting goes a long way — "Howzit" is the universal South African hello. Tipping 10-15% at restaurants is expected. When visiting rural communities or cultural villages, ask permission before photographing people. Braai (barbecue) is a social institution — if invited, it''s a genuine compliment. South Africans are proud of their post-apartheid progress; approach conversations about race and history with respect and curiosity rather than assumptions.'
WHERE slug = 'south-africa';

-- ══════════════════════════════════════════════════
-- NAMIBIA
-- ══════════════════════════════════════════════════
UPDATE countries SET
  solo_level = 'intermediate',
  safety_women_md = 'Namibia is one of the safer countries in Southern Africa, with low rates of violent crime against tourists. Windhoek is generally safe during the day but avoid walking alone after dark — use taxis or your accommodation''s transport. The main safety consideration is the driving: distances are vast, roads are often gravel, and wildlife can appear unexpectedly. Always travel with a full tank and plenty of water. In remote areas like Sossusvlei and Etosha, staying in established camps and lodges is the safest approach. Petty theft can occur at popular tourist stops — don''t leave valuables visible in your car.',
  solo_infrastructure_md = 'Namibia is a self-drive destination — renting a 4x4 is the most practical way to explore. Roads between major towns are paved; secondary routes are gravel but well-maintained. Fuel stations can be 200+ km apart, so plan accordingly. MTC and TN Mobile offer SIM cards with reasonable data coverage along main routes, though signal drops in remote desert areas. Accommodation ranges from campsites to luxury lodges and should be booked in advance during peak season (Jul-Oct). English is the official language and widely spoken. Google Maps works but download offline maps for remote areas.',
  culture_etiquette_md = 'Namibia''s population includes diverse groups including Himba, Herero, San, and Ovambo peoples. Always ask permission before photographing people, especially in traditional communities. A respectful greeting is appreciated everywhere. When visiting Himba villages, go with a local guide and bring practical gifts rather than money if you wish to contribute. Tipping 10% at restaurants is customary. Namibians are generally reserved but warm once a connection is made.'
WHERE slug = 'namibia';

-- ══════════════════════════════════════════════════
-- MOZAMBIQUE
-- ══════════════════════════════════════════════════
UPDATE countries SET
  solo_level = 'expert',
  safety_women_md = 'Mozambique is a rewarding but less-traveled destination that requires more preparation. Maputo is generally safe in central areas during the day — the Polana and Sommerschield neighborhoods are well-established. Avoid walking alone after dark and use trusted taxis. In beach areas like Tofo and Vilankulo, the main risks are petty theft on the beach and at markets — don''t leave belongings unattended. Northern Mozambique (Cabo Delgado province) has an active security situation and should be avoided entirely. Road travel outside main highways can be challenging, especially in the rainy season. Carry copies of your passport and keep originals secured.',
  solo_infrastructure_md = 'Mozambique''s infrastructure is developing. Domestic flights (LAM airline) connect Maputo to Vilankulo, Inhambane, and the north. Road quality varies dramatically — the EN1 highway is paved but side roads can be rough. Chapas (minibus taxis) are the local transport but can be crowded and unpredictable. Vodacom Mozambique offers the best mobile coverage; buy a SIM in Maputo. WiFi is available in hotels and some cafes in tourist areas but is unreliable. Portuguese is the official language — learning basic phrases is essential outside tourist zones. English is limited to hotels and tour operators.',
  culture_etiquette_md = 'Mozambique''s culture blends Portuguese colonial heritage with diverse African traditions. Greetings are important — take time to say hello before any transaction. Photography of government buildings, military, and police is prohibited. In Muslim-majority areas along the northern coast, dress more conservatively. Seafood is central to the cuisine — peri-peri prawns are a national treasure. Tipping 10% at restaurants is appreciated but not always expected. Mozambicans are warm and sociable; accepting an invitation for a meal is a meaningful gesture.'
WHERE slug = 'mozambique';

-- ══════════════════════════════════════════════════
-- ZIMBABWE
-- ══════════════════════════════════════════════════
UPDATE countries SET
  solo_level = 'intermediate',
  safety_women_md = 'Zimbabwe is generally safe for solo women travelers in tourist areas. Victoria Falls town is compact, walkable, and well-policed. Harare requires more awareness — stick to northern suburbs like Borrowdale and Avondale during the day, and use taxis after dark. The main risks are petty theft and currency scams — always agree on prices beforehand and carry small USD bills. Safari camps and lodges in Hwange and Mana Pools are secure and well-run. Avoid political gatherings and demonstrations. Road conditions outside main highways can be poor — a 4x4 is recommended for national parks.',
  solo_infrastructure_md = 'Zimbabwe''s tourist infrastructure is concentrated around Victoria Falls and major safari destinations. FastJet and local airlines connect Harare, Victoria Falls, and Bulawayo. Taxis and hotel transfers are the main transport in cities. Self-driving is possible but roads vary in quality. Econet is the main mobile provider; buy a SIM at the airport for data. WiFi is available in hotels but can be slow. The US dollar is widely accepted — carry small bills as change is often scarce. English is widely spoken throughout the country, making navigation straightforward for English speakers.',
  culture_etiquette_md = 'Zimbabweans are known for their friendliness and hospitality. A handshake with eye contact is the standard greeting. Photography of government buildings and officials is not permitted. When visiting rural communities, greeting the chief or village leader first is respectful. Tipping safari guides ($10-20/day) and lodge staff is customary and appreciated. Zimbabweans take pride in their resilience and history — conversations about the country''s challenges are welcome when approached with genuine interest and respect.'
WHERE slug = 'zimbabwe';

-- ══════════════════════════════════════════════════
-- LESOTHO
-- ══════════════════════════════════════════════════
UPDATE countries SET
  solo_level = 'expert',
  safety_women_md = 'Lesotho is a small, mountainous country best visited as part of a Southern Africa itinerary. Maseru, the capital, is generally safe during the day in central areas. After dark, use taxis from your accommodation. The main challenge is the terrain — mountain roads are steep, unpaved, and can be dangerous in bad weather. A 4x4 is essential outside Maseru. Stock theft (livestock rustling) is a rural issue that occasionally affects hikers on remote trails. Stick to established routes or hire a local guide for mountain treks. Mobile signal is limited in the highlands — tell someone your plans before heading into remote areas.',
  solo_infrastructure_md = 'Lesotho is a rugged, off-the-beaten-path destination. Access is typically by road from South Africa — the Sani Pass from KwaZulu-Natal is the most dramatic entry point (4x4 required). Public transport consists of minibus taxis between towns. Vodacom Lesotho offers the best mobile coverage, though signal is patchy in the highlands. Accommodation ranges from basic guesthouses to a few mountain lodges. ATMs exist in Maseru and larger towns; carry South African rand as backup. English and Sesotho are both official languages — English is understood in tourist-facing contexts.',
  culture_etiquette_md = 'Basotho culture is rich and traditional. The Basotho blanket is a national symbol — you''ll see locals wearing them as everyday clothing in the highlands. Greetings are important: "Lumela" (hello) to one person, "Lumelang" to a group. When visiting rural villages, greet the chief first. Horseback riding is a way of life in the mountains. Basotho people are generally reserved but welcoming. Modest dress is appreciated, especially in rural areas. Remove hats when greeting elders as a sign of respect.'
WHERE slug = 'lesotho';
