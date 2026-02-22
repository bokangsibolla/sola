-- Migration: Seed destination highlights, budget tips, and enriched content for all 19 countries
-- All content written from a women-first solo traveler perspective
-- Safe to re-run (UPDATE only, no schema changes)

BEGIN;

----------------------------------------------------------------------
-- THAILAND
----------------------------------------------------------------------
UPDATE countries SET
  destination_highlights = '[
    {"type": "city", "id": "19aa31e1-c413-5b05-8901-0b00ebafa230", "label": "Bangkok", "tagline": "Where most women take their first solo trip", "image_url": null},
    {"type": "city", "id": "ba437e7c-cb67-5276-92c8-34e4809f0c14", "label": "Chiang Mai", "tagline": "The unofficial solo female traveler capital", "image_url": null},
    {"type": "city", "id": "e4c3f2d1-c9b7-5d99-aaf6-c0c42c0a4b7e", "label": "Krabi", "tagline": "Island-hopping without needing a group", "image_url": null}
  ]'::jsonb,
  budget_tips = '[
    {"category": "transport", "tip": "Grab is your best friend — safer than tuk-tuks for solo women, especially at night. Always screenshot the driver''s name and plate number before getting in.", "type": "save", "level": "essential"},
    {"category": "accommodation", "tip": "Hostels like Loftel and Chao are specifically popular with solo women. Female-only dorms run 200-400 THB/night and you''ll meet travel partners within hours.", "type": "save", "level": "insider"},
    {"category": "food", "tip": "7-Eleven is genuinely a lifeline — toasties, rice bowls, and yogurt drinks at 2am when you don''t want to navigate street food alone after dark.", "type": "save", "level": "essential"},
    {"category": "activities", "tip": "Skip the overpriced \"tourist\" cooking classes near Khao San Road. Book directly with smaller operations in Chiang Mai — half the price, twice the experience.", "type": "save", "level": "insider"},
    {"category": "accommodation", "tip": "Don''t cheap out on location. Being walking distance to BTS stations in Bangkok or within the Old City walls in Chiang Mai matters more than saving 200 THB/night.", "type": "dont_skimp", "level": "essential"},
    {"category": "transport", "tip": "The overnight trains (sleeper class) between Bangkok and Chiang Mai are safe, comfortable, and save you a night''s accommodation. Book a lower berth — it has a curtain for privacy.", "type": "save", "level": "insider"},
    {"category": "general", "tip": "Thai SIM cards from AIS or TrueMove at the airport cost 300 THB for 15 days of unlimited data. Having maps and Grab always available is non-negotiable when you''re solo.", "type": "dont_skimp", "level": "essential"}
  ]'::jsonb
WHERE slug = 'thailand';

----------------------------------------------------------------------
-- VIETNAM
----------------------------------------------------------------------
UPDATE countries SET
  destination_highlights = '[
    {"type": "city", "id": "39b2e031-bc56-5e43-9415-7b026d8d8e03", "label": "Hoi An", "tagline": "Lantern-lit streets made for wandering alone", "image_url": null},
    {"type": "city", "id": "c3b16617-37de-5b65-b7aa-1eff660955ad", "label": "Hanoi", "tagline": "Controlled chaos that rewards the curious", "image_url": null},
    {"type": "city", "id": "80529793-1f29-5f6b-8b01-e58f4385e956", "label": "Ho Chi Minh City", "tagline": "Rooftop bars, street food, and relentless energy", "image_url": null}
  ]'::jsonb,
  budget_tips = '[
    {"category": "transport", "tip": "Grab bikes are half the price of Grab cars and get you through traffic faster. Wear the helmet provided and hold your bag in front of you, not behind.", "type": "save", "level": "essential"},
    {"category": "food", "tip": "Eat where the local women eat — look for plastic-stool spots with female owners. A bowl of pho from a street vendor costs 30,000-50,000 VND and is often better than restaurant versions.", "type": "save", "level": "insider"},
    {"category": "accommodation", "tip": "Don''t book the cheapest hostel in the Old Quarter of Hanoi — noise levels are brutal. Spend slightly more for a place on a side street with double-glazed windows. Sleep matters when you''re navigating alone.", "type": "dont_skimp", "level": "essential"},
    {"category": "activities", "tip": "Ha Long Bay tours marketed to backpackers can be party-heavy. Book a mid-range junk boat (around $120-150) that attracts couples and solo travelers over gap-year groups.", "type": "dont_skimp", "level": "insider"},
    {"category": "general", "tip": "Vietnamobile SIM cards are the cheapest, but Viettel has far better coverage outside cities. For solo travel into Sa Pa or the Mekong Delta, reliable signal matters.", "type": "save", "level": "essential"},
    {"category": "transport", "tip": "The Reunification Express train between Hanoi and Hoi An (Da Nang) is scenic and safe. Book a 4-berth soft sleeper — you''ll often share with Vietnamese families.", "type": "save", "level": "insider"},
    {"category": "accommodation", "tip": "Homestays in Hoi An and Sa Pa are excellent value (150,000-300,000 VND) and you''ll eat home-cooked meals with the family. It''s the safest, most connected way to travel in rural Vietnam.", "type": "save", "level": "insider"}
  ]'::jsonb
WHERE slug = 'vietnam';

----------------------------------------------------------------------
-- JAPAN
----------------------------------------------------------------------
UPDATE countries SET
  destination_highlights = '[
    {"type": "city", "id": "28465f19-461e-55f2-a896-aff14062116a", "label": "Kyoto", "tagline": "Temple mornings and izakaya nights, all at your pace", "image_url": null},
    {"type": "city", "id": "a68427ee-da7f-5bad-8399-0e01e5b96b8d", "label": "Tokyo", "tagline": "A city designed for people who like being alone", "image_url": null},
    {"type": "city", "id": "9e15b3a1-f927-5009-a808-aa4ae94f9be5", "label": "Osaka", "tagline": "Japan''s friendliest city and its best street food", "image_url": null}
  ]'::jsonb,
  budget_tips = '[
    {"category": "transport", "tip": "The Japan Rail Pass pays for itself if you''re doing Tokyo-Kyoto-Osaka. Buy the 7-day pass — it covers bullet trains, local JR lines, and some ferries.", "type": "save", "level": "essential"},
    {"category": "food", "tip": "Konbini (convenience store) meals are genuinely excellent — onigiri, bento boxes, and egg sandwiches from 7-Eleven, Lawson, or FamilyMart will save you thousands of yen without sacrificing quality.", "type": "save", "level": "essential"},
    {"category": "accommodation", "tip": "Capsule hotels with women-only floors (like 9h or First Cabin) are clean, safe, and run 3,000-4,500 JPY/night. They''re a distinctly Japanese experience worth trying at least once.", "type": "save", "level": "insider"},
    {"category": "activities", "tip": "Temples in Kyoto charge 400-600 JPY each — it adds up fast. Pick 2-3 that matter to you rather than rushing through all of them. Fushimi Inari is free and best at dawn before crowds.", "type": "save", "level": "insider"},
    {"category": "general", "tip": "Japan is cash-heavy outside Tokyo. Withdraw from 7-Eleven ATMs (they accept international cards) and carry at least 10,000 JPY. Nothing is worse than being stuck without cash in a rural town.", "type": "dont_skimp", "level": "essential"},
    {"category": "transport", "tip": "Women-only train carriages exist during rush hour in Tokyo and Osaka. Look for the pink signs on the platform — they''re there for a reason, and using them is completely normal.", "type": "save", "level": "essential"},
    {"category": "accommodation", "tip": "Ryokan (traditional inns) can run 15,000-30,000 JPY but often include kaiseki dinner and breakfast. For a splurge night, it''s actually decent value when you factor in two meals.", "type": "dont_skimp", "level": "insider"}
  ]'::jsonb
WHERE slug = 'japan';

----------------------------------------------------------------------
-- INDONESIA
----------------------------------------------------------------------
UPDATE countries SET
  destination_highlights = '[
    {"type": "city", "id": "45667a9e-c10d-51aa-a5a1-b3f260d725fa", "label": "Ubud", "tagline": "Where solo women come to reset", "image_url": null},
    {"type": "city", "id": "cf0acfb1-d56d-54cf-a249-2dc074b6fce0", "label": "Canggu", "tagline": "Laptop, surfboard, and a smoothie bowl life", "image_url": null},
    {"type": "city", "id": "a307e2eb-d3ee-5244-b55d-6dab9ba185b5", "label": "Gili Islands", "tagline": "No cars, no stress, no agenda", "image_url": null}
  ]'::jsonb,
  budget_tips = '[
    {"category": "transport", "tip": "Rent a scooter only if you''re genuinely comfortable riding one — Bali traffic is chaotic and medical bills from accidents are the #1 unexpected cost. Grab or a private driver for a day (300,000-400,000 IDR) is safer.", "type": "dont_skimp", "level": "essential"},
    {"category": "accommodation", "tip": "Ubud and Canggu have beautiful private rooms in guesthouses for 200,000-400,000 IDR/night. You don''t need a villa — save that budget for experiences.", "type": "save", "level": "insider"},
    {"category": "food", "tip": "Warungs (local restaurants) serve nasi goreng or mie goreng for 15,000-30,000 IDR. The ones without English menus are usually better and cheaper.", "type": "save", "level": "essential"},
    {"category": "activities", "tip": "Skip the Instagram-famous swing parks (overpriced, long queues). The Tegallalang rice terraces themselves are free to walk — just ignore the \"donation\" pressure at the bottom.", "type": "save", "level": "insider"},
    {"category": "general", "tip": "Get travel insurance that covers scooter accidents specifically (most basic policies don''t). World Nomads or SafetyWing are popular choices among solo women in Bali.", "type": "dont_skimp", "level": "essential"},
    {"category": "accommodation", "tip": "In the Gili Islands, book accommodation near the main strip on Gili T, or on the quieter east side of Gili Air. The paths between beaches are unlit at night — location matters.", "type": "dont_skimp", "level": "essential"},
    {"category": "transport", "tip": "Fast boats between Bali and the Gilis vary wildly in safety. Book with established operators (Bluewater Express, Eka Jaya) even if they cost 50,000 IDR more. Check that life jackets are available.", "type": "dont_skimp", "level": "insider"}
  ]'::jsonb
WHERE slug = 'indonesia';

----------------------------------------------------------------------
-- PORTUGAL
----------------------------------------------------------------------
UPDATE countries SET
  destination_highlights = '[
    {"type": "city", "id": "0e444e8e-1ca9-54a2-bd58-54265e0fa2d1", "label": "Lisbon", "tagline": "Tram rides, pastéis, and rooftop sunsets for one", "image_url": null},
    {"type": "city", "id": "8fb61a1b-48bf-5eb1-b98a-3db329bd26fb", "label": "Porto", "tagline": "Port wine tastings are better when you set the pace", "image_url": null},
    {"type": "city", "id": "0e444e8e-1ca9-54a2-bd58-54265e0fa2d1", "label": "Sintra", "tagline": "A fairy-tale day trip from Lisbon", "image_url": null}
  ]'::jsonb,
  budget_tips = '[
    {"category": "food", "tip": "Lunch menus (menu do dia) at local tascas run 7-10 EUR for soup, main, drink, and coffee. This is how Portuguese people actually eat — and it''s the best deal in Western Europe.", "type": "save", "level": "essential"},
    {"category": "transport", "tip": "Get a Viva Viagem card in Lisbon and load it with zapping credit — it works on metro, trams, buses, and ferries. Way cheaper than buying individual tickets.", "type": "save", "level": "essential"},
    {"category": "accommodation", "tip": "Lisbon hostels with female-only dorms (like Yes! Lisbon or Living Lounge) are social hubs for solo women. Budget 15-25 EUR/night and you''ll have instant travel companions.", "type": "save", "level": "insider"},
    {"category": "activities", "tip": "Most museums are free on the first Sunday of each month. The Museu Nacional do Azulejo and Berardo Collection are both worth timing your trip around.", "type": "save", "level": "insider"},
    {"category": "accommodation", "tip": "In Lisbon, stay in Príncipe Real or Santos rather than Alfama or Bairro Alto. Less noise at night, better value, and still walkable to everything.", "type": "dont_skimp", "level": "insider"},
    {"category": "general", "tip": "Portugal is one of the safest countries in Europe, but pickpocketing on Tram 28 and in Baixa is real. Use a crossbody bag you can keep in front of you.", "type": "dont_skimp", "level": "essential"}
  ]'::jsonb
WHERE slug = 'portugal';

----------------------------------------------------------------------
-- MOROCCO
----------------------------------------------------------------------
UPDATE countries SET
  destination_highlights = '[
    {"type": "city", "id": "61ca2d6b-a85c-5035-a24d-c8bb0c9347b0", "label": "Marrakech", "tagline": "Sensory overload in the best possible way", "image_url": null},
    {"type": "city", "id": "8307eeef-6d09-5b57-bf1d-2d0f7d3d78ed", "label": "Chefchaouen", "tagline": "The blue city where solo women feel at ease", "image_url": null},
    {"type": "city", "id": "835bbdfc-12fa-553d-858a-0b6a952c820d", "label": "Fes", "tagline": "The medina that rewards those who get lost", "image_url": null}
  ]'::jsonb,
  budget_tips = '[
    {"category": "accommodation", "tip": "Riads (traditional guesthouses) are the way to go — 300-600 MAD/night gets you a courtyard, breakfast, and a host who''ll help you navigate. They''re safer and more pleasant than hotels for solo women.", "type": "dont_skimp", "level": "essential"},
    {"category": "transport", "tip": "Agree on taxi prices BEFORE getting in — insist on the meter or negotiate firmly. In Marrakech, a petit taxi anywhere in the medina should be 15-30 MAD. Walk away if they quote more.", "type": "save", "level": "essential"},
    {"category": "food", "tip": "Skip Jemaa el-Fnaa food stalls (tourist-priced and pushy). Walk two blocks into any side street and find a hole-in-the-wall where tagine costs 30-40 MAD instead of 80-120 MAD.", "type": "save", "level": "insider"},
    {"category": "general", "tip": "Dress modestly not because you have to, but because it genuinely reduces unwanted attention. Loose linen pants and covered shoulders let you blend in and move through the medina more comfortably.", "type": "dont_skimp", "level": "essential"},
    {"category": "activities", "tip": "Official guides at medina entrances (with badges) are worth the 200-300 MAD for your first walk through Fes. They keep touts away and you''ll learn the layout faster than stumbling through alone.", "type": "dont_skimp", "level": "insider"},
    {"category": "transport", "tip": "CTM and Supratours buses between cities are comfortable, air-conditioned, and very safe. Book online — they''re half the price of private transfers and more reliable than grand taxis.", "type": "save", "level": "essential"},
    {"category": "accommodation", "tip": "In Chefchaouen, book a riad inside the blue medina rather than on the outskirts. The medina is tiny and pedestrian-only — you can walk everywhere and it feels extremely safe, even at night.", "type": "save", "level": "insider"}
  ]'::jsonb
WHERE slug = 'morocco';

----------------------------------------------------------------------
-- SOUTH AFRICA
----------------------------------------------------------------------
UPDATE countries SET
  destination_highlights = '[
    {"type": "city", "id": "a2bdbda7-bb8d-55fe-b170-8f1bea4b0481", "label": "Cape Town", "tagline": "Mountain, ocean, wine — all in one city", "image_url": null},
    {"type": "city", "id": "14d46d18-b28f-568b-8692-35fb68be553d", "label": "Kruger", "tagline": "Self-drive safari that works solo", "image_url": null},
    {"type": "city", "id": "82b18abc-1e48-5300-a2c2-844cdcf6116f", "label": "Durban", "tagline": "Surf, curry, and a coastline to yourself", "image_url": null}
  ]'::jsonb,
  budget_tips = '[
    {"category": "transport", "tip": "Use Uber or Bolt exclusively — they''re cheap, reliable, and the driver''s name and plate are tracked in the app. Minibus taxis are not recommended for solo visitors unfamiliar with the routes.", "type": "dont_skimp", "level": "essential"},
    {"category": "food", "tip": "Woolworths ready meals are genuinely good — perfect for nights when you don''t want to eat out alone. A meal and a bottle of wine for under 150 ZAR.", "type": "save", "level": "insider"},
    {"category": "accommodation", "tip": "In Cape Town, stay in the City Bowl, Gardens, or Sea Point — these neighborhoods are walkable during the day and well-connected by Uber at night. Avoid isolated Airbnbs no matter how beautiful the photos.", "type": "dont_skimp", "level": "essential"},
    {"category": "activities", "tip": "SANParks Wild Cards cost 655 ZAR for 30 days of unlimited national park access. If you''re doing Kruger and Table Mountain, it pays for itself immediately.", "type": "save", "level": "insider"},
    {"category": "general", "tip": "Don''t walk with your phone out or wear visible jewelry — this is standard advice for everyone in SA, not just solo women. Keep valuables in your accommodation safe.", "type": "dont_skimp", "level": "essential"},
    {"category": "accommodation", "tip": "Kruger rest camps (Skukuza, Lower Sabie) have affordable self-catering bungalows from 900 ZAR/night. You''ll meet other travelers at the communal braai areas — it''s social without being forced.", "type": "save", "level": "insider"},
    {"category": "transport", "tip": "Renting a car for Kruger is easy and affordable (from 300 ZAR/day). Self-driving through the park at dawn is one of the most powerful solo experiences in Africa — completely safe inside the park.", "type": "save", "level": "essential"},
    {"category": "food", "tip": "The Neighbourgoods Market (Saturday) and Oranjezicht Market (Sunday) in Cape Town are excellent for solo meals — sit at communal tables, try everything, and nobody bats an eye at a woman eating alone.", "type": "save", "level": "insider"}
  ]'::jsonb,
  why_we_love_md = '- One of the few African countries with infrastructure that makes solo travel genuinely easy — Uber works everywhere, English is widely spoken, and card payments are the norm
- Cape Town''s food and wine scene rivals European capitals at a fraction of the cost
- Self-drive safari in Kruger means you set your own pace, your own route, and your own wake-up time
- The solo female travel community here is strong — you''ll meet women from across the continent and the world
- Natural beauty that makes you stop and stare: Table Mountain at sunset, the Garden Route coastline, Blyde River Canyon'
WHERE slug = 'south-africa';

----------------------------------------------------------------------
-- NAMIBIA
----------------------------------------------------------------------
UPDATE countries SET
  destination_highlights = '[
    {"type": "city", "id": "aae8c3b9-e062-56f8-8aef-f82e9256a692", "label": "Swakopmund", "tagline": "Adventure town where solo travelers converge", "image_url": null},
    {"type": "city", "id": "b2e04c93-9b67-57c4-aa77-9efacba855e5", "label": "Sossusvlei", "tagline": "Climbing the world''s tallest dunes at sunrise", "image_url": null},
    {"type": "city", "id": "97eb2542-061b-5bc7-afe9-d17670c86f92", "label": "Windhoek", "tagline": "Africa''s cleanest, calmest capital city", "image_url": null}
  ]'::jsonb,
  budget_tips = '[
    {"category": "transport", "tip": "Car rental is essential in Namibia — distances are huge and public transport barely exists. Budget 400-600 NAD/day for a reliable 4x4 with insurance. Don''t skimp on the vehicle — gravel roads are unforgiving.", "type": "dont_skimp", "level": "essential"},
    {"category": "accommodation", "tip": "NWR (Namibia Wildlife Resorts) camps inside national parks are affordable and safe — from 800 NAD/night. Book well in advance for Sossusvlei and Etosha, especially June-October.", "type": "save", "level": "essential"},
    {"category": "food", "tip": "Stock up at Shoprite or Checkers in Windhoek before heading into the desert. Many lodges are hours from the nearest shop. A cooler box with cold meats, bread, and fruit will save you hundreds.", "type": "save", "level": "insider"},
    {"category": "activities", "tip": "Etosha park entry is 80 NAD/day — an absolute bargain for self-drive safari. Waterholes are mapped and you can spend an entire day watching wildlife come to drink.", "type": "save", "level": "insider"},
    {"category": "general", "tip": "Namibia is one of the safest countries in Africa for solo women travelers. The crime rate is low outside Windhoek''s Katutura township, roads are empty, and people are genuinely friendly.", "type": "save", "level": "essential"},
    {"category": "transport", "tip": "Fill your tank at EVERY fuel station you pass — the next one might be 300 km away. Running out of fuel on a deserted gravel road is not a risk worth taking.", "type": "dont_skimp", "level": "essential"}
  ]'::jsonb,
  why_we_love_md = '- Driving alone through landscapes so vast and empty they reset something in your brain
- One of the safest African countries for solo women — low crime, friendly people, well-maintained roads
- Sossusvlei at sunrise is a spiritual experience that costs almost nothing to access
- The solitude is the point here — days can pass without seeing another car, and that silence is rare and precious
- Swakopmund brings you back to civilization with German-colonial architecture, fresh oysters, and other travelers to swap stories with'
WHERE slug = 'namibia';

----------------------------------------------------------------------
-- MOZAMBIQUE
----------------------------------------------------------------------
UPDATE countries SET
  destination_highlights = '[
    {"type": "city", "id": "62369421-7313-5287-aba9-45639bd426f3", "label": "Maputo", "tagline": "Portuguese-African fusion with a jazz soul", "image_url": null},
    {"type": "city", "id": "b151d7fb-c797-5696-9b08-e75718b744dd", "label": "Tofo", "tagline": "Whale sharks, diving, and barefoot beach life", "image_url": null},
    {"type": "city", "id": "30dcdca7-27f3-5e84-a0db-aa1547889dec", "label": "Bazaruto", "tagline": "Untouched archipelago for serious escapists", "image_url": null}
  ]'::jsonb,
  budget_tips = '[
    {"category": "accommodation", "tip": "Tofo has backpacker lodges from 500-800 MZN/night with a strong solo traveler community. Fatima''s Nest and Bamboozi are known gathering spots where you''ll meet other women traveling alone.", "type": "save", "level": "insider"},
    {"category": "transport", "tip": "Chapas (minibuses) are how locals get around but can be uncomfortable and crowded. For the Maputo-to-Tofo journey, book a shuttle transfer (~2,000 MZN) — it''s worth the peace of mind and fixed schedule.", "type": "dont_skimp", "level": "essential"},
    {"category": "food", "tip": "Maputo''s mercado central has the freshest, cheapest seafood — peri-peri prawns for 150-250 MZN. Eat where the market workers eat.", "type": "save", "level": "insider"},
    {"category": "activities", "tip": "Whale shark diving in Tofo costs around 2,500-3,500 MZN per dive. It''s one of the cheapest places in the world for this experience — don''t skip it.", "type": "dont_skimp", "level": "essential"},
    {"category": "general", "tip": "Portuguese is the official language and English isn''t widely spoken outside tourist areas. Learn basic Portuguese phrases — locals respond warmly when you try, and it makes navigating solo much easier.", "type": "dont_skimp", "level": "essential"},
    {"category": "accommodation", "tip": "Bazaruto is a splurge destination — lodges start at $150/night. If it''s not in your budget, Tofo gives you a similar beach experience for a tenth of the price.", "type": "save", "level": "insider"}
  ]'::jsonb,
  why_we_love_md = '- One of Africa''s last genuinely undiscovered coastlines — you''ll have stretches of beach entirely to yourself
- The diving and snorkeling (whale sharks, manta rays, dugongs) rivals the best in the world at a fraction of the cost
- Maputo has a cultural richness — live jazz, contemporary art, peri-peri cuisine — that most travelers never discover
- The pace of life here forces you to slow down in a way that feels therapeutic, not frustrating
- Portuguese-African fusion culture creates a warmth and expressiveness that makes solo travelers feel welcomed, not observed'
WHERE slug = 'mozambique';

----------------------------------------------------------------------
-- LESOTHO
----------------------------------------------------------------------
UPDATE countries SET
  destination_highlights = '[
    {"type": "city", "id": "259cf412-d6fd-5278-872e-63ae97cbfed3", "label": "Maseru", "tagline": "Gateway to Africa''s mountain kingdom", "image_url": null},
    {"type": "city", "id": "11617b47-5b53-5927-93de-f0fcb8b2d0ce", "label": "Semonkong", "tagline": "Pony trekking and the 192m Maletsunyane Falls", "image_url": null},
    {"type": "city", "id": "259cf412-d6fd-5278-872e-63ae97cbfed3", "label": "Malealea", "tagline": "Village homestays in the Highlands", "image_url": null}
  ]'::jsonb,
  budget_tips = '[
    {"category": "transport", "tip": "4x4 is essential if you''re driving yourself — Lesotho''s mountain passes are unpaved and steep. Rent from South Africa (Maseru is a short drive from Bloemfontein) for better rates and vehicle quality.", "type": "dont_skimp", "level": "essential"},
    {"category": "accommodation", "tip": "Lodge stays at Semonkong and Malealea run 300-600 ZAR/night and include meals. These are the social hubs where solo travelers naturally congregate — you won''t be alone for long.", "type": "save", "level": "insider"},
    {"category": "activities", "tip": "Pony trekking through the Highlands costs 200-400 ZAR/day and is the quintessential Lesotho experience. The Basotho ponies are sure-footed on mountain paths — no riding experience needed.", "type": "save", "level": "essential"},
    {"category": "food", "tip": "Eat at your lodge — most include meals in the rate, and options outside lodges are extremely limited in the Highlands. Stock up on snacks in Maseru before heading into the mountains.", "type": "save", "level": "essential"},
    {"category": "general", "tip": "Lesotho uses South African Rand alongside the Loti (pegged 1:1). Bring cash — card machines are rare outside Maseru. ATMs exist in Maseru but not in the Highlands.", "type": "dont_skimp", "level": "essential"}
  ]'::jsonb,
  why_we_love_md = '- The only country in the world that''s entirely above 1,000 meters — the air, the light, the silence are unlike anywhere else
- Basotho culture is deeply welcoming to travelers, with homestays that feel like genuine cultural exchange, not performance
- Pony trekking through mountain villages is the kind of slow, grounding adventure that solo travel is made for
- Almost zero tourist infrastructure means zero tourist crowds — you''re traveling, not touring
- Crossing the border from South Africa feels like entering a different world, yet it''s just hours from Johannesburg'
WHERE slug = 'lesotho';

----------------------------------------------------------------------
-- ZIMBABWE
----------------------------------------------------------------------
UPDATE countries SET
  destination_highlights = '[
    {"type": "city", "id": "54d583c8-f0d7-58ee-84d9-3f73621f2b9b", "label": "Victoria Falls", "tagline": "The smoke that thunders — worth every cliché", "image_url": null},
    {"type": "city", "id": "17c5dbc9-c445-5ac7-9f8c-a23dd9164a41", "label": "Harare", "tagline": "A creative capital most travelers skip", "image_url": null},
    {"type": "city", "id": "2d43fb37-bf4f-557b-b59f-f668e9855b80", "label": "Masvingo", "tagline": "Great Zimbabwe ruins — Africa''s lost city", "image_url": null}
  ]'::jsonb,
  budget_tips = '[
    {"category": "accommodation", "tip": "Victoria Falls town has backpacker lodges from $15-25/night (Shoestrings, Victoria Falls Backpackers) with pools, bars, and a reliable solo traveler community year-round.", "type": "save", "level": "essential"},
    {"category": "activities", "tip": "The Victoria Falls park entry is $30 — steep for Zimbabwe, but it''s a once-in-a-lifetime experience. Go early morning when the spray creates rainbows and the crowds haven''t arrived.", "type": "dont_skimp", "level": "essential"},
    {"category": "transport", "tip": "Cross the border to Livingstone (Zambia) for a different angle of the falls and cheaper activities. The border crossing is straightforward — bring $50 cash for the Zambia visa.", "type": "save", "level": "insider"},
    {"category": "food", "tip": "The Lookout Café at Victoria Falls has the best view of the gorge and surprisingly reasonable prices for lunch. Pack snacks for game drives — lodge shops charge double.", "type": "save", "level": "insider"},
    {"category": "general", "tip": "Zimbabwe operates largely in USD. Bring clean, recent US bills (post-2009) — older or damaged notes are often rejected. Small denominations ($1, $5, $10) are essential for tips and markets.", "type": "dont_skimp", "level": "essential"},
    {"category": "accommodation", "tip": "If you can afford it, one night at a safari lodge near Hwange National Park is transformative. Guided walks and night drives reveal a different Africa than self-drive — and the guides ensure your safety.", "type": "dont_skimp", "level": "insider"}
  ]'::jsonb,
  why_we_love_md = '- Victoria Falls is one of those rare natural wonders that actually exceeds the hype — the sound, the spray, the scale
- Zimbabweans are among the warmest, most educated people on the continent — conversations here go deep
- Great Zimbabwe ruins near Masvingo are a powerful reminder of pre-colonial African civilization that most travelers never see
- The creative scene in Harare (art galleries, craft markets, live music) offers a side of Zimbabwe the headlines never show
- Safari in Hwange and Mana Pools is world-class but a fraction of the price of Botswana or Kenya'
WHERE slug = 'zimbabwe';

----------------------------------------------------------------------
-- SOUTH KOREA
----------------------------------------------------------------------
UPDATE countries SET
  destination_highlights = '[
    {"type": "city", "id": "9220ca93-f240-5cfb-807c-af07ad211521", "label": "Seoul", "tagline": "A city that never makes you feel alone", "image_url": null},
    {"type": "city", "id": "33af0601-73b1-54e9-87b3-0455b62e0048", "label": "Busan", "tagline": "Beach temples, fish markets, and hot springs", "image_url": null},
    {"type": "city", "id": "9220ca93-f240-5cfb-807c-af07ad211521", "label": "Jeonju", "tagline": "Korea''s food capital and hanok village charm", "image_url": null}
  ]'::jsonb,
  budget_tips = '[
    {"category": "transport", "tip": "Get a T-money card at any convenience store — it works on all Seoul metro, buses, and even taxis. The subway system is immaculate, safe at all hours, and has English signage everywhere.", "type": "save", "level": "essential"},
    {"category": "food", "tip": "Korean solo dining culture is the best in Asia. Kimbap shops, convenience stores with hot food bars, and honbap (eating alone) restaurants are everywhere — zero stigma, zero awkwardness.", "type": "save", "level": "essential"},
    {"category": "accommodation", "tip": "Guesthouses in Hongdae, Mapo, and Jongno run 25,000-45,000 KRW/night with female-only dorms. Jjimjilbangs (bathhouses with sleeping areas) are 12,000-15,000 KRW and perfectly safe for women — they have women-only floors.", "type": "save", "level": "insider"},
    {"category": "activities", "tip": "Most palaces in Seoul cost just 3,000 KRW entry, and if you wear hanbok (rentable for 15,000-20,000 KRW near Gyeongbokgung), palace entry is free.", "type": "save", "level": "insider"},
    {"category": "general", "tip": "Korea is one of the safest countries in the world for solo women — violent crime against tourists is extremely rare. The main annoyance is being stared at in rural areas, not feeling unsafe.", "type": "save", "level": "essential"},
    {"category": "accommodation", "tip": "Love motels (now rebranded as boutique motels) are legitimate accommodation in Korea — clean, private rooms with huge TVs and fancy bathrooms from 40,000-60,000 KRW. They''re an excellent solo option.", "type": "save", "level": "insider"},
    {"category": "transport", "tip": "The KTX high-speed train between Seoul and Busan takes 2.5 hours and costs 59,800 KRW. Book early for window seats — the countryside views are stunning.", "type": "save", "level": "essential"}
  ]'::jsonb,
  why_we_love_md = '- The solo dining and solo activity culture is deeply embedded — Korea normalizes doing things alone in a way few countries do
- One of the safest countries on earth for women, with excellent public transport that runs late and is well-lit
- K-beauty, jjimjilbangs, and temple stays offer self-care experiences you genuinely cannot find elsewhere
- The food alone is worth the trip — and it''s astonishingly affordable for the quality
- Seoul is a city where you can be completely anonymous one moment and making friends at a pojangmacha (street tent bar) the next'
WHERE slug = 'south-korea';

----------------------------------------------------------------------
-- CAMBODIA (thin country — needs intro_md, budget_breakdown, best_for_md, might_struggle_md)
----------------------------------------------------------------------
UPDATE countries SET
  destination_highlights = '[
    {"type": "city", "id": "bdc3914c-9d78-5896-8714-a2cb60263df5", "label": "Siem Reap", "tagline": "Angkor Wat and the backpacker trail''s friendliest stop", "image_url": null},
    {"type": "city", "id": "f176a087-8256-55c6-9d5d-b95660d5bedf", "label": "Phnom Penh", "tagline": "History, night markets, and riverside resilience", "image_url": null},
    {"type": "city", "id": "c6b0cb74-7d63-5b34-b15f-31f4ff9c32ac", "label": "Kampot", "tagline": "Sleepy riverside town where travelers linger", "image_url": null}
  ]'::jsonb,
  budget_tips = '[
    {"category": "accommodation", "tip": "Siem Reap has some of Southeast Asia''s best-value hostels — female dorms at Mad Monkey or Onederz run $3-6/night with pools and social events designed for solo travelers.", "type": "save", "level": "essential"},
    {"category": "transport", "tip": "Use PassApp or Grab for tuk-tuks — the fare is fixed in advance and the driver''s details are tracked. Negotiating on the street is fine for daytime but use apps after dark.", "type": "save", "level": "essential"},
    {"category": "food", "tip": "Eat at the old markets (Psar Chas in Siem Reap, Central Market in Phnom Penh) — a full Khmer meal costs $1.50-3.00. The stalls run by women are consistently the best.", "type": "save", "level": "insider"},
    {"category": "activities", "tip": "The Angkor pass is $37/day or $62 for three days. Three days lets you go at a pace that doesn''t leave you exhausted — watch sunrise at Angkor Wat and skip the midday heat.", "type": "dont_skimp", "level": "essential"},
    {"category": "general", "tip": "Cambodia runs on USD — bring clean US bills. Riel (the local currency) is used for change under $1. ATMs charge $5 fees, so withdraw larger amounts less frequently.", "type": "dont_skimp", "level": "essential"},
    {"category": "accommodation", "tip": "Kampot''s riverside guesthouses ($8-15/night) are where solo women settle in for longer stays — hammocks, river views, and a community of people who came for two days and stayed two weeks.", "type": "save", "level": "insider"}
  ]'::jsonb,
  budget_breakdown = '{
    "accommodation": {"low": 3, "high": 40, "currency": "USD", "note": "Dorm bed to boutique guesthouse"},
    "food": {"low": 1.50, "high": 15, "currency": "USD", "note": "Market stall to restaurant with drinks"},
    "transport": {"low": 1, "high": 12, "currency": "USD", "note": "Tuk-tuk ride to private car transfer"},
    "activities": {"low": 0, "high": 37, "currency": "USD", "note": "Free temple grounds to Angkor day pass"}
  }'::jsonb,
  intro_md = 'Cambodia is Southeast Asia stripped back to its essentials — ancient temples, generous people, and a cost of living so low that budget anxiety melts away within hours of arriving. For solo women, Siem Reap in particular functions as a natural gathering point: the hostels are social, the tuk-tuk drivers are familiar with solo travelers, and the backpacker trail here is so well-worn that you''ll never feel like you''re figuring it out alone.

The country carries a heavy history. Visiting the Killing Fields and Tuol Sleng in Phnom Penh is sobering and important — many solo women find it easier to process these experiences at their own pace rather than in a group. Cambodians themselves are remarkably warm and forward-looking, and the contrast between the country''s past and its present energy is part of what makes traveling here so affecting.

Beyond the temples and the history, there''s Kampot — a sleepy riverside town where solo travelers come for two nights and stay for two weeks. Pepper farms, sunset boat rides, and cheap guesthouses with hammock-lined balconies create the kind of slow travel that solo trips are made for. Cambodia rewards the unhurried.',
  best_for_md = '- First-time solo travelers — the infrastructure and backpacker community make it very approachable
- Budget-conscious women who want their money to stretch furthest
- History and culture enthusiasts drawn to Angkor Wat and the Khmer Empire
- Women who prefer slow, unstructured travel with room to linger',
  might_struggle_md = '- The heat (35-40C from March to May) is genuinely oppressive and limits what you can do midday
- Persistent tuk-tuk touts in Siem Reap and Phnom Penh can wear you down — a firm "no" works, but it takes energy
- Infrastructure outside main tourist towns is basic — expect bumpy roads, power cuts, and limited English'
WHERE slug = 'cambodia';

----------------------------------------------------------------------
-- LAOS (thin country — needs intro_md, budget_breakdown, best_for_md, might_struggle_md)
----------------------------------------------------------------------
UPDATE countries SET
  destination_highlights = '[
    {"type": "city", "id": "a89f43d9-b8e4-53f5-a641-0c2739982827", "label": "Luang Prabang", "tagline": "Monks, mountains, and the Mekong at dawn", "image_url": null},
    {"type": "city", "id": "ab5d4dfa-70b5-5f7c-9286-ca77c6b5fa09", "label": "Vang Vieng", "tagline": "Reformed party town turned adventure hub", "image_url": null},
    {"type": "city", "id": "7411addf-c299-5eb7-8465-8fe50dc9473e", "label": "Vientiane", "tagline": "The world''s most low-key capital city", "image_url": null}
  ]'::jsonb,
  budget_tips = '[
    {"category": "accommodation", "tip": "Luang Prabang guesthouses run $8-15/night for a clean private room with fan. The ones on the peninsula (between the rivers) are walkable to everything and safer than outlying areas.", "type": "save", "level": "essential"},
    {"category": "food", "tip": "The Luang Prabang night market has a vegetarian buffet where you fill a plate for 15,000 LAK ($0.75). It''s fresh, filling, and the communal tables are where solo travelers naturally find each other.", "type": "save", "level": "insider"},
    {"category": "transport", "tip": "The new Laos-China high-speed railway connects Vientiane to Luang Prabang in 2 hours for 167,000 LAK ($8.50). It''s comfortable, punctual, and far safer than the winding mountain roads.", "type": "save", "level": "essential"},
    {"category": "activities", "tip": "Kuang Si Falls outside Luang Prabang costs 20,000 LAK ($1) entry. Share a tuk-tuk with other travelers (ask your hostel to organize) — it''s a natural meeting point.", "type": "save", "level": "essential"},
    {"category": "general", "tip": "Laos is a cash economy — bring USD or Thai Baht to exchange. ATMs exist but charge 20,000 LAK ($1) per withdrawal and have low limits. BCEL ATMs are the most reliable.", "type": "dont_skimp", "level": "essential"},
    {"category": "accommodation", "tip": "In Vang Vieng, stay in town rather than the party-oriented riverside bungalows. The town center has quiet guesthouses from $6-10/night and you can choose your level of social interaction.", "type": "save", "level": "insider"}
  ]'::jsonb,
  budget_breakdown = '{
    "accommodation": {"low": 5, "high": 30, "currency": "USD", "note": "Fan room to boutique guesthouse"},
    "food": {"low": 0.75, "high": 12, "currency": "USD", "note": "Night market buffet to restaurant"},
    "transport": {"low": 1, "high": 15, "currency": "USD", "note": "Shared tuk-tuk to private minivan"},
    "activities": {"low": 1, "high": 25, "currency": "USD", "note": "Waterfall entry to guided kayaking"}
  }'::jsonb,
  intro_md = 'Laos is the quietest country on the Southeast Asian trail — and that''s exactly the point. Where Thailand buzzes and Vietnam hustles, Laos moves at the pace of the Mekong: slow, steady, and deeply calming. Solo women who find the energy of Bangkok or Hanoi overwhelming often discover that Laos is where they can finally breathe.

Luang Prabang is the anchor. A UNESCO-protected town of saffron-robed monks, French-colonial architecture, and the best night market food in the region, it''s small enough to feel safe and beautiful enough to hold your attention for days. The morning alms-giving ceremony — hundreds of monks walking silently through dawn-lit streets — is one of Southeast Asia''s most powerful moments to witness alone.

Laos demands less of you than neighboring countries, and gives back something different: stillness, genuinely kind people, and a landscape of karst mountains and river valleys that makes you understand why travelers keep coming back. The infrastructure is basic, the WiFi is slow, and that''s part of the deal you make when you come here.',
  best_for_md = '- Women who want Southeast Asia at a gentler pace — less hustle, less heat, less pressure
- Outdoor enthusiasts drawn to kayaking, trekking, and cave exploration
- Budget travelers who want to stretch every dollar as far as it goes
- Travelers looking for genuine cultural experiences without the tourism machinery',
  might_struggle_md = '- Very limited nightlife and social infrastructure — evenings are quiet, even in Luang Prabang
- The road network is poor and journeys are long — getting between towns requires patience
- English is less widely spoken than in Thailand or Vietnam, which can make solo logistics harder'
WHERE slug = 'laos';

----------------------------------------------------------------------
-- MALAYSIA (thin country — needs intro_md, budget_breakdown, best_for_md, might_struggle_md)
----------------------------------------------------------------------
UPDATE countries SET
  destination_highlights = '[
    {"type": "city", "id": "e2acde6f-cd08-5650-957d-9215aeccd593", "label": "Kuala Lumpur", "tagline": "Where Malay, Chinese, and Indian cultures collide beautifully", "image_url": null},
    {"type": "city", "id": "6a9685f6-613d-5426-ab3a-8347b3554ba2", "label": "Penang", "tagline": "Street art, street food, and zero pretension", "image_url": null},
    {"type": "city", "id": "b1b9fef3-e475-5d4b-a223-0610d6da3b8e", "label": "Langkawi", "tagline": "Duty-free island with mangroves and quiet beaches", "image_url": null}
  ]'::jsonb,
  budget_tips = '[
    {"category": "food", "tip": "Malaysian food is the best in Southeast Asia — fight me. Hawker centres serve laksa, char kway teow, and roti canai for 5-12 MYR. Eat where the queue is longest.", "type": "save", "level": "essential"},
    {"category": "transport", "tip": "Grab works perfectly in KL, Penang, and most cities. For longer distances, KLIA Ekspres (airport) and ETS trains (intercity) are modern, punctual, and women-friendly.", "type": "save", "level": "essential"},
    {"category": "accommodation", "tip": "KL has excellent hostels in Chinatown and Bukit Bintang from 30-50 MYR/night. Many have female-only floors and rooftop spaces with Petronas Tower views.", "type": "save", "level": "insider"},
    {"category": "general", "tip": "Malaysia is a Muslim-majority country — dress modestly when visiting mosques (scarves provided at entrance). In KL and Penang, Western dress is completely fine in most neighborhoods.", "type": "dont_skimp", "level": "essential"},
    {"category": "activities", "tip": "The Batu Caves are free to visit and the 272-step climb is worth it. Go early morning to beat the heat and the tour groups. Watch your bags — monkeys are bold.", "type": "save", "level": "insider"},
    {"category": "accommodation", "tip": "In Penang, stay in George Town (the UNESCO zone) rather than the beach areas. The heritage district is walkable, photogenic, and has the best food in the country within a few blocks.", "type": "save", "level": "insider"},
    {"category": "transport", "tip": "AirAsia flights within Malaysia cost 60-150 MYR if booked in advance. KL to Langkawi or Penang takes one hour — time is worth more than the bus savings.", "type": "save", "level": "essential"}
  ]'::jsonb,
  budget_breakdown = '{
    "accommodation": {"low": 8, "high": 50, "currency": "USD", "note": "Hostel dorm to mid-range hotel"},
    "food": {"low": 1.50, "high": 12, "currency": "USD", "note": "Hawker stall to restaurant"},
    "transport": {"low": 0.50, "high": 15, "currency": "USD", "note": "Local bus to Grab cross-city"},
    "activities": {"low": 0, "high": 20, "currency": "USD", "note": "Free temples to island tours"}
  }'::jsonb,
  intro_md = 'Malaysia is the Southeast Asian country that does everything well without shouting about it. The food is extraordinary — a three-way collision of Malay, Chinese, and Indian cuisines that produces some of the best street food on earth. The infrastructure is modern and reliable. English is widely spoken. And for solo women, the combination of safety, affordability, and cultural richness makes it one of the most underrated destinations in the region.

Kuala Lumpur is a city of contrasts: gleaming towers next to colonial buildings, designer malls next to hawker centres where a life-changing plate of nasi lemak costs less than $2. Penang is where food obsessives go on pilgrimage — George Town''s street art and heritage architecture make it easy to spend days wandering. And Langkawi offers duty-free island life with mangrove kayaking and empty beaches.

What sets Malaysia apart for solo women is the ease of it. Grab works everywhere. The train system is clean and efficient. People are helpful without being overbearing. It''s the kind of country where you can be adventurous without ever feeling like you''re roughing it — and where being a woman alone is met with curiosity rather than concern.',
  best_for_md = '- Food-obsessed travelers who want to eat their way through a country
- Women who want Southeast Asian culture with modern infrastructure and high English proficiency
- Solo travelers looking for an easy, affordable base for island-hopping
- First-time Asia visitors who want variety without complexity',
  might_struggle_md = '- The heat and humidity are intense year-round (30-35C, 80%+ humidity) — it shapes your entire day
- Peninsular Malaysia and Malaysian Borneo feel like different countries — getting between them requires flying
- Some conservative areas expect modest dress, which can feel restrictive coming from Thailand or Bali'
WHERE slug = 'malaysia';

----------------------------------------------------------------------
-- MYANMAR (thin country — needs intro_md, budget_breakdown, best_for_md, might_struggle_md)
----------------------------------------------------------------------
UPDATE countries SET
  destination_highlights = '[
    {"type": "city", "id": "7fda35f3-c2f2-52c2-9a11-a18f73db5f1e", "label": "Bagan", "tagline": "2,000 temples on a misty plain — no crowds", "image_url": null},
    {"type": "city", "id": "62058212-d05c-5299-a19e-b8762615884a", "label": "Inle Lake", "tagline": "Floating gardens and one-legged fishermen", "image_url": null},
    {"type": "city", "id": "959233a5-0225-5c5a-ba17-3fc853c00a43", "label": "Yangon", "tagline": "Shwedagon Pagoda and a city finding its voice", "image_url": null}
  ]'::jsonb,
  budget_tips = '[
    {"category": "accommodation", "tip": "Myanmar requires foreigners to stay in licensed accommodation — you can''t just show up anywhere. Budget guesthouses in Bagan and Inle Lake run $10-20/night and are generally clean and safe.", "type": "save", "level": "essential"},
    {"category": "transport", "tip": "Domestic flights (Air KBZ, Myanmar National Airlines) are affordable ($40-80) and save you brutal overland journeys. The Yangon-to-Bagan bus takes 10 hours on rough roads — fly if you can.", "type": "dont_skimp", "level": "essential"},
    {"category": "food", "tip": "Tea shops are the heart of Myanmar social life — sit down, order lahpet thoke (fermented tea leaf salad) and a pot of tea for 1,000-2,000 MMK. Women are welcome and it''s a great way to observe daily life.", "type": "save", "level": "insider"},
    {"category": "activities", "tip": "Rent an e-bike in Bagan for 8,000-10,000 MMK/day to explore the temples at your own pace. Dawn and dusk are magical — the light through the temple plains is unlike anywhere else.", "type": "save", "level": "essential"},
    {"category": "general", "tip": "Myanmar''s political situation is complex and changing. Check current travel advisories before booking, and register with your embassy. Solo travel is possible but requires more planning than neighboring countries.", "type": "dont_skimp", "level": "essential"},
    {"category": "general", "tip": "Bring USD cash in pristine condition — no folds, no marks, no old bills. Many places still don''t accept cards. Exchange at official KBZ or CB bank branches, never with street changers.", "type": "dont_skimp", "level": "essential"}
  ]'::jsonb,
  budget_breakdown = '{
    "accommodation": {"low": 8, "high": 45, "currency": "USD", "note": "Basic guesthouse to mid-range hotel"},
    "food": {"low": 1, "high": 10, "currency": "USD", "note": "Tea shop snack to restaurant meal"},
    "transport": {"low": 2, "high": 80, "currency": "USD", "note": "Local bus to domestic flight"},
    "activities": {"low": 0, "high": 25, "currency": "USD", "note": "Temple visits to boat tour"}
  }'::jsonb,
  intro_md = 'Myanmar is one of the most visually extraordinary countries in Southeast Asia — and one of the most complex to visit. The temple plains of Bagan, the floating gardens of Inle Lake, and the gold-encrusted magnificence of Shwedagon Pagoda are experiences that stay with you permanently. For solo women, the Burmese people''s genuine warmth and the country''s deep Buddhist culture create an atmosphere that feels surprisingly safe and welcoming.

That said, Myanmar requires more preparation than most Southeast Asian countries. The political situation since 2021 has made travel more complicated, and infrastructure outside the main tourist triangle (Yangon-Bagan-Inle Lake) is limited. WiFi is unreliable, ATMs are scarce outside cities, and you''ll need to carry USD cash in perfect condition. These aren''t dealbreakers — they''re things to plan for.

The women who love Myanmar tend to be those who appreciate travel that asks something of them. There''s no well-oiled backpacker machine here. Instead, you get unfiltered encounters with a culture that has been largely closed to the outside world for decades. The monks, the thanaka-painted faces, the longyi-wrapped figures cycling through Bagan at dawn — it''s travel at its most raw and its most beautiful.',
  best_for_md = '- Experienced solo travelers comfortable with limited infrastructure and cash-only economies
- Photography enthusiasts and culture lovers drawn to Buddhist heritage
- Women who prefer off-the-beaten-path destinations with few other tourists
- Travelers who find meaning in places that challenge them',
  might_struggle_md = '- The political situation creates uncertainty — check advisories and have flexible plans
- Infrastructure is basic: unreliable WiFi, limited ATMs, and long overland journeys
- Very few other solo women travelers compared to Thailand or Vietnam, which can feel isolating'
WHERE slug = 'myanmar';

----------------------------------------------------------------------
-- PHILIPPINES (thin country — needs intro_md, budget_breakdown, best_for_md, might_struggle_md)
----------------------------------------------------------------------
UPDATE countries SET
  destination_highlights = '[
    {"type": "city", "id": "1c74ece0-57ee-5910-a1bc-7415fb052878", "label": "El Nido", "tagline": "Limestone cliffs, turquoise water, island-hopping paradise", "image_url": null},
    {"type": "city", "id": "f7ee87f1-e68c-5854-95d0-ce40a091b6ad", "label": "Siargao", "tagline": "Surf, palm trees, and the chillest island vibe", "image_url": null},
    {"type": "city", "id": "f4c0733c-cb5d-506d-ab33-001c482e8257", "label": "Cebu", "tagline": "Waterfalls, whale sharks, and a lively city base", "image_url": null}
  ]'::jsonb,
  budget_tips = '[
    {"category": "transport", "tip": "Island-hopping boats in El Nido and Coron are best booked as group tours ($15-25/day) — you''ll be with other travelers and the cost is shared. Solo private boats are 10x the price and unnecessary.", "type": "save", "level": "essential"},
    {"category": "accommodation", "tip": "Siargao has hostels and guesthouses from 400-800 PHP/night with strong solo traveler communities. Book near General Luna — the surf break, restaurants, and nightlife are all walkable.", "type": "save", "level": "insider"},
    {"category": "food", "tip": "Filipino food is hearty and cheap — adobo, sinigang, and lechon at local eateries (carinderias) cost 60-120 PHP. Don''t miss the mango shakes — they''re the best in the world and cost 50-80 PHP.", "type": "save", "level": "essential"},
    {"category": "activities", "tip": "Canyoneering in Kawasan Falls (Cebu) costs 1,500-2,500 PHP including guide. It''s a full-day adventure and one of the best experiences in the Philippines — groups are mixed and social.", "type": "dont_skimp", "level": "insider"},
    {"category": "general", "tip": "The Philippines is English-speaking, which makes solo travel logistics dramatically easier than most of Southeast Asia. Filipinos are some of the friendliest people you''ll meet anywhere — expect genuine conversations.", "type": "save", "level": "essential"},
    {"category": "transport", "tip": "Cebu Pacific and AirAsia fly between islands for 800-2,500 PHP if booked early. Don''t waste 12 hours on a ferry when a one-hour flight costs $15-20.", "type": "save", "level": "essential"},
    {"category": "accommodation", "tip": "In El Nido, stay in town rather than the isolated beach resorts unless you have the budget. Town is walkable, has restaurants and bars, and you can join boat tours from the main beach each morning.", "type": "save", "level": "insider"}
  ]'::jsonb,
  budget_breakdown = '{
    "accommodation": {"low": 6, "high": 50, "currency": "USD", "note": "Hostel dorm to beachfront room"},
    "food": {"low": 1, "high": 12, "currency": "USD", "note": "Carinderia to restaurant"},
    "transport": {"low": 0.50, "high": 25, "currency": "USD", "note": "Jeepney to island-hopping tour"},
    "activities": {"low": 5, "high": 40, "currency": "USD", "note": "Waterfall entry to diving course"}
  }'::jsonb,
  intro_md = 'The Philippines is 7,641 islands of turquoise water, limestone cliffs, and some of the warmest people on the planet. It''s also the only country in Southeast Asia where English is an official language, which makes it remarkably easy for solo women to navigate — from negotiating boat rides to having real conversations with locals. That alone sets it apart.

El Nido and Coron in Palawan are the headline acts: lagoons so beautiful they look artificial, island-hopping tours that run daily, and a backpacker scene that''s social without being rowdy. Siargao has emerged as the Philippines'' coolest island — a surf-and-chill destination with excellent food, a young creative crowd, and the kind of energy that makes you extend your stay. Cebu anchors everything with direct flights, waterfalls, and whale shark encounters.

The logistics here are less polished than Thailand or Malaysia — flights get delayed, boats depend on weather, and plans change on island time. But Filipino culture runs on warmth and adaptability, and solo women consistently report feeling looked after rather than preyed upon. Strangers invite you to eat, families wave from the shore, and the phrase "where are you from?" is an invitation to friendship, not a sales pitch.',
  best_for_md = '- Beach and island lovers who want Southeast Asia''s most dramatic coastlines
- Women who value English fluency for easier solo navigation
- Adventure travelers drawn to diving, surfing, canyoneering, and waterfalls
- Social travelers who make friends easily — the Philippines rewards extroverts',
  might_struggle_md = '- Logistics between islands can be frustrating — delays, cancellations, and long transit days are common
- Typhoon season (July-November) can seriously disrupt travel plans, especially in the Visayas
- Solo travel infrastructure outside the main tourist islands is limited — you''ll need to be flexible'
WHERE slug = 'philippines';

----------------------------------------------------------------------
-- SINGAPORE (thin country — needs intro_md, budget_breakdown, best_for_md, might_struggle_md)
----------------------------------------------------------------------
UPDATE countries SET
  destination_highlights = '[
    {"type": "city", "id": "9ee72f23-fbb1-5edf-882e-c69ea73af58b", "label": "Singapore", "tagline": "The world''s safest city for women, bar none", "image_url": null},
    {"type": "city", "id": "9ee72f23-fbb1-5edf-882e-c69ea73af58b", "label": "Chinatown & Little India", "tagline": "Three cultures, one MRT stop apart", "image_url": null},
    {"type": "city", "id": "9ee72f23-fbb1-5edf-882e-c69ea73af58b", "label": "Gardens by the Bay", "tagline": "When a city builds a forest inside itself", "image_url": null}
  ]'::jsonb,
  budget_tips = '[
    {"category": "food", "tip": "Hawker centres are the great equalizer in Singapore — Michelin-starred chicken rice at Tian Tian costs S$5. Eat where Singaporeans eat (Maxwell, Old Airport Road, Lau Pa Sat) and your food budget drops dramatically.", "type": "save", "level": "essential"},
    {"category": "accommodation", "tip": "Singapore is expensive, but hostels in Chinatown and Lavender run S$25-40/night for female-only dorms. Hotels start at S$100+ — plan accordingly.", "type": "save", "level": "essential"},
    {"category": "transport", "tip": "The MRT is clean, safe, air-conditioned, and goes everywhere. A tourist pass (S$10/day unlimited) is cheaper than two Grab rides. Use it.", "type": "save", "level": "essential"},
    {"category": "activities", "tip": "Gardens by the Bay outdoor gardens, Marina Barrage, and MacRitchie Treetop Walk are all free. The paid conservatories (S$28) are worth it once but you don''t need both — the Cloud Forest is the better one.", "type": "save", "level": "insider"},
    {"category": "general", "tip": "Singapore is genuinely the safest city in the world for solo women. Walking alone at 3am is normal. This doesn''t mean zero awareness, but the baseline anxiety of solo travel essentially disappears here.", "type": "save", "level": "essential"},
    {"category": "food", "tip": "Alcohol is expensive everywhere (S$12-18 for a beer at most bars). If budget matters, buy from 7-Eleven before 10:30pm (alcohol sales restricted after) and drink at the Marina Bay waterfront — the view is free.", "type": "save", "level": "insider"}
  ]'::jsonb,
  budget_breakdown = '{
    "accommodation": {"low": 18, "high": 100, "currency": "USD", "note": "Hostel dorm to mid-range hotel"},
    "food": {"low": 2.50, "high": 25, "currency": "USD", "note": "Hawker centre to restaurant"},
    "transport": {"low": 1, "high": 10, "currency": "USD", "note": "Single MRT ride to Grab across town"},
    "activities": {"low": 0, "high": 25, "currency": "USD", "note": "Free gardens to paid attractions"}
  }'::jsonb,
  intro_md = 'Singapore is the city where the concept of "solo female safety" stops being a consideration and just becomes the default. You can walk anywhere at any hour without a second thought. The MRT runs like clockwork. Street food costs less than coffee in most Western cities. And the cultural density — Chinatown, Little India, Kampong Glam, all within walking distance — means you can travel through three civilizations in an afternoon.

For solo women, Singapore works as either a destination or a strategic stopover. Three to four days is enough to eat your way through the hawker centres, explore the neighborhoods, and spend a morning in Gardens by the Bay. Many women use it as a decompression stop between more intense Southeast Asian countries — a place to recharge in air-conditioned comfort, do laundry, and eat without worrying about food safety.

The knock on Singapore is that it''s sterile or boring. That''s wrong, but it''s understandable — you have to look past the gleaming malls. The real Singapore is in the kopitiam (coffee shop) uncles arguing over kopi, the Tiong Bahru market at 7am, the street art in Haji Lane, and the after-dark energy of Clarke Quay. It''s a city that reveals itself to the curious, and being solo gives you the time to actually look.',
  best_for_md = '- First-time solo travelers who want zero safety anxiety while they build confidence
- Food obsessives who want world-class cuisine at hawker centre prices
- Women who appreciate cleanliness, efficiency, and predictable infrastructure
- Travelers using Singapore as a gateway to the rest of Southeast Asia',
  might_struggle_md = '- It''s expensive compared to the rest of Southeast Asia — budget carefully for accommodation and alcohol
- The city is compact and can feel "done" in 3-4 days if you''re not a food or architecture enthusiast
- The tropical heat and humidity (32C year-round) make walking between neighborhoods sweaty work'
WHERE slug = 'singapore';

----------------------------------------------------------------------
-- TAIWAN (thin country — needs intro_md, budget_breakdown, best_for_md, might_struggle_md, why_we_love_md)
----------------------------------------------------------------------
UPDATE countries SET
  destination_highlights = '[
    {"type": "city", "id": "136eee54-06d9-58bc-afcb-853653fb0f44", "label": "Taipei", "tagline": "Night markets, hot springs, and a city that feels like home", "image_url": null},
    {"type": "city", "id": "be06a2a8-8ca8-58fb-9471-a78f187dae73", "label": "Tainan", "tagline": "Taiwan''s oldest city and its best-kept food secret", "image_url": null},
    {"type": "city", "id": "136eee54-06d9-58bc-afcb-853653fb0f44", "label": "Jiufen", "tagline": "The hillside village that inspired Spirited Away", "image_url": null}
  ]'::jsonb,
  budget_tips = '[
    {"category": "food", "tip": "Night markets are the backbone of Taiwan travel — stinky tofu, gua bao, bubble tea, and oyster omelettes for 30-80 TWD each. Shilin, Raohe, and Tainan''s Flower Night Market are the essential three.", "type": "save", "level": "essential"},
    {"category": "transport", "tip": "Get an EasyCard at any MRT station — it works on metro, buses, YouBike, and convenience stores. The Taipei metro is one of Asia''s best: clean, safe, frequent, and women-only carriages during rush hour.", "type": "save", "level": "essential"},
    {"category": "accommodation", "tip": "Taipei hostels in Zhongzheng and Daan districts run 500-800 TWD/night for dorms. For private rooms, look at Airbnb apartments in Songshan — excellent value at 1,200-2,000 TWD/night.", "type": "save", "level": "insider"},
    {"category": "activities", "tip": "Beitou Hot Springs has a free public hot spring foot bath and the paid public bath at Millennium Hot Spring costs just 40 TWD. You don''t need an expensive hotel package for the experience.", "type": "save", "level": "insider"},
    {"category": "general", "tip": "Taiwan is exceptionally safe for solo women — crime rates are among the lowest in Asia. Convenience stores (7-Eleven, FamilyMart) are everywhere, open 24/7, and function as lifelines: ATMs, hot meals, coffee, and restrooms.", "type": "save", "level": "essential"},
    {"category": "transport", "tip": "The Taiwan High Speed Rail (HSR) connects Taipei to Tainan in 1.5 hours. Early-bird tickets (up to 35% off) make it comparable to bus prices at three times the speed.", "type": "save", "level": "essential"},
    {"category": "food", "tip": "Vegetarian and vegan food is everywhere in Taiwan thanks to Buddhist culture. Look for 素食 (sùshí) signs — buffets charge 70-100 TWD for all-you-can-eat with dozens of options.", "type": "save", "level": "insider"}
  ]'::jsonb,
  budget_breakdown = '{
    "accommodation": {"low": 12, "high": 50, "currency": "USD", "note": "Hostel dorm to boutique hotel"},
    "food": {"low": 1.50, "high": 15, "currency": "USD", "note": "Night market snacks to sit-down restaurant"},
    "transport": {"low": 0.50, "high": 20, "currency": "USD", "note": "MRT ride to HSR intercity"},
    "activities": {"low": 0, "high": 20, "currency": "USD", "note": "Free temples and trails to guided tours"}
  }'::jsonb,
  intro_md = 'Taiwan is the Asian destination that solo women keep recommending to each other in hushed, almost protective tones — as if sharing it too widely might break the spell. It''s safe, it''s cheap, the food is extraordinary, and the people are disarmingly kind. It''s Japan''s organization with Southeast Asia''s affordability, and it operates at a human scale that makes solo travel feel effortless.

Taipei is a city of neighborhoods, each with its own personality: Daan for tree-lined cafes and bookshops, Ximending for neon and youth culture, Beitou for hot springs tucked into misty hillsides. The night markets aren''t just for eating (though you should eat everything) — they''re the social fabric of the city, and sitting alone at a plastic table with a plate of stinky tofu and a bubble tea is one of life''s genuine pleasures.

Beyond Taipei, Taiwan reveals itself as surprisingly diverse. Tainan is the country''s oldest city and its undisputed food capital. Taroko Gorge is a marble canyon that rivals any national park in the world. And the entire east coast — reachable by train — offers dramatic Pacific coastlines with almost no tourists. Taiwan rewards the solo traveler who arrives with time and curiosity, and it asks almost nothing in return except an open appetite.',
  best_for_md = '- Food-obsessed travelers who consider night markets a highlight, not a side activity
- Safety-conscious solo women who want to explore freely without constant vigilance
- Travelers who love Japan but not the price tag — Taiwan delivers a similar experience at half the cost
- Women interested in hiking, hot springs, and temple culture alongside urban exploration',
  might_struggle_md = '- Mandarin is the primary language and English is limited outside Taipei — Google Translate is essential
- The summer humidity (June-August) is oppressive, and typhoon season (July-October) can disrupt plans
- Taiwan is less "backpacker trail" than Thailand or Vietnam — you''ll meet fewer solo travelers, which suits some women and not others',
  why_we_love_md = '- Possibly the safest country in Asia for solo women — you can walk anywhere at any hour without a thought
- Night market culture means you never eat alone awkwardly — everyone is standing, grazing, and moving
- Hot springs, hiking trails, and temple visits create natural solo activities that don''t require a companion
- The kindness of strangers here is legendary — people will walk you to your destination rather than point
- A genuine alternative to Japan for women who want that level of order and beauty at a fraction of the cost'
WHERE slug = 'taiwan';

----------------------------------------------------------------------
-- CAMBODIA — why_we_love_md already exists, skip
-- LAOS — why_we_love_md already exists, skip
-- MALAYSIA — why_we_love_md already exists, skip
-- MYANMAR — why_we_love_md already exists, skip
-- PHILIPPINES — why_we_love_md already exists, skip
-- SINGAPORE — why_we_love_md already exists, skip
----------------------------------------------------------------------

COMMIT;
