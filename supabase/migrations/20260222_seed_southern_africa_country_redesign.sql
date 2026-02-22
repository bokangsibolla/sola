-- 20260222_seed_southern_africa_country_redesign.sql
-- Populates the country page redesign fields for 5 Southern African countries:
--   budget_breakdown, vibe_summary, social_vibe, cultural_note,
--   transport_summary, intro_md
-- UPDATE-only: columns already exist from 20260212_country_page_redesign.sql

-- SOUTH AFRICA
UPDATE countries SET
  budget_breakdown = '{"accommodation":{"low":10,"high":60,"currency":"USD","note":"Hostel dorm to boutique guesthouse"},"food":{"low":3,"high":15,"currency":"USD","note":"Street braai to wine farm lunch"},"transport":{"low":2,"high":15,"currency":"USD","note":"Uber in metros to intercity bus"},"activities":{"low":5,"high":40,"currency":"USD","note":"Beach day to safari game drive"}}'::jsonb,
  vibe_summary = 'Diverse, dramatic, raw beauty',
  social_vibe = 'Cape Town has a strong hostel and backpacker scene; Johannesburg is more local-driven and rewards effort',
  cultural_note = 'Greet warmly, tipping 10-15% is standard, be thoughtful about socioeconomic context',
  transport_summary = 'Rental cars recommended outside cities, Uber works in metros, intercity buses are reliable',
  intro_md = E'South Africa is not a country that deals in subtlety. The landscapes are enormous and varied: Table Mountain dropping into the Atlantic, the Winelands stretching out in ordered rows, Kruger''s bushveld teeming with wildlife you have only ever seen on screens. Within a single trip you can surf in Muizenberg, taste pinotage in Stellenbosch, track the Big Five, and walk the markets of Maboneng. Few countries offer this kind of range.\n\nSafety is the question every solo woman asks, and it deserves an honest answer. South Africa requires awareness. You will need to research neighborhoods, avoid walking alone at night in certain areas, and use ride-hailing apps rather than hailing taxis on the street. But women who travel here with intention consistently describe it as one of the most rewarding destinations on the continent. The people are genuinely warm, the creative scene in Cape Town and Joburg is world-class, and the country''s complexity, its history and its ongoing reinvention, gives it a depth that more comfortable destinations simply cannot match.'
WHERE slug = 'south-africa';

-- ZIMBABWE
UPDATE countries SET
  budget_breakdown = '{"accommodation":{"low":10,"high":50,"currency":"USD","note":"Backpacker lodge to safari camp"},"food":{"low":5,"high":15,"currency":"USD","note":"Local sadza plate to lodge restaurant"},"transport":{"low":3,"high":20,"currency":"USD","note":"Intercity bus to organized transfer"},"activities":{"low":10,"high":50,"currency":"USD","note":"Walking tour to gorge swing at Victoria Falls"}}'::jsonb,
  vibe_summary = 'Resilient, warm, awe-inspiring',
  social_vibe = 'Victoria Falls has an established traveler community; elsewhere connections are more local and personal',
  cultural_note = 'Respectful greetings are important, handshake with the right hand, always ask before photographing people',
  transport_summary = 'Domestic flights are limited, intercity buses between cities, organized transfers for tourist routes',
  intro_md = E'Zimbabwe leads with one of the great spectacles on earth. Victoria Falls is the kind of place that makes the journey worth it before you have even unpacked. The spray, the sound, the sheer volume of water crashing into the Batoka Gorge: it is genuinely humbling. But Zimbabwe is more than its headline attraction. Great Zimbabwe''s stone ruins predate European contact and challenge assumptions about the history of southern Africa. Matobo Hills holds ancient San rock art and rhino tracking on foot.\n\nThe country has been through difficult years, and the economic situation remains complicated. Prices can be inconsistent and infrastructure outside main tourist corridors is basic. But the people here are among the warmest you will encounter anywhere in the region. Zimbabweans are proud, well-educated, and genuinely interested in sharing their country with visitors. Tourism is rebuilding steadily, and women who visit now describe a place that feels authentic in a way that more polished destinations do not. You will not find luxury at every turn, but you will find honesty, resilience, and landscapes that stay with you.'
WHERE slug = 'zimbabwe';

-- NAMIBIA
UPDATE countries SET
  budget_breakdown = '{"accommodation":{"low":15,"high":80,"currency":"USD","note":"Campsite to desert lodge"},"food":{"low":5,"high":20,"currency":"USD","note":"Grocery self-catering to lodge dinner"},"transport":{"low":5,"high":30,"currency":"USD","note":"Fuel and car rental to domestic flight"},"activities":{"low":10,"high":60,"currency":"USD","note":"National park entry to scenic flight over dunes"}}'::jsonb,
  vibe_summary = 'Vast, silent, otherworldly',
  social_vibe = 'Smaller traveler scene; connections happen at campsites and lodges, often around a fire',
  cultural_note = 'San heritage is sacred and not a performance, ask permission before visiting communities, conservation is deeply valued',
  transport_summary = 'Self-drive is essential and distances are vast, 4x4 required for some routes, flights connect main hubs',
  intro_md = E'Namibia is the country that makes you understand what empty really means. The distances between towns are measured in hours, not kilometers. The Namib Desert is the oldest on earth, and Sossusvlei''s red dunes against white clay pans produce landscapes that look digitally altered but are not. Etosha''s salt pan draws wildlife to waterholes where you can sit in your car and watch elephants, lions, and giraffes arrive on their own schedule. The Skeleton Coast is as stark and beautiful as its name suggests.\n\nFor solo women, Namibia offers something unusual: it is one of the safest countries in the region, and the self-drive culture means you set your own pace entirely. You will need to be comfortable with solitude and long stretches of gravel road. There are no hostels on every corner, and cell service disappears for hours at a time. But women who are drawn to that kind of travel, the kind where the silence is the point, consistently rank Namibia among their most powerful experiences. The night skies alone are worth the trip.'
WHERE slug = 'namibia';

-- MOZAMBIQUE
UPDATE countries SET
  budget_breakdown = '{"accommodation":{"low":8,"high":60,"currency":"USD","note":"Beach backpackers to island eco-lodge"},"food":{"low":3,"high":15,"currency":"USD","note":"Market stall to seafood restaurant"},"transport":{"low":2,"high":15,"currency":"USD","note":"Chapa minibus to domestic flight"},"activities":{"low":10,"high":50,"currency":"USD","note":"Snorkeling to whale shark dive"}}'::jsonb,
  vibe_summary = 'Tropical, unhurried, frontier-feeling',
  social_vibe = 'Tofo has a small but genuine backpacker community; elsewhere you will likely be the only traveler around',
  cultural_note = 'Portuguese influences run deep, warm greetings matter, learn basic Portuguese phrases, dress modestly outside beach areas',
  transport_summary = 'Roads are improving but travel is slow, domestic flights connect main hubs, chapas run local routes',
  intro_md = E'Mozambique is the destination you recommend to someone who has already been everywhere else. The 2,500-kilometer Indian Ocean coastline is staggeringly beautiful: white sand, warm turquoise water, dhow sails on the horizon. Tofo is one of the best places on earth to swim with whale sharks. The Bazaruto Archipelago feels like it belongs in a nature documentary. And the food, a fusion of Portuguese, East African, and Indian influences, is unlike anything you will find in neighboring countries.\n\nThis is not a polished destination. Roads between cities can take longer than expected. Power cuts happen. Communication requires patience and some Portuguese or at least a willingness to gesture. But that is part of what makes Mozambique compelling. It is an emerging destination in the truest sense: the infrastructure is catching up to the beauty. Women who travel here tend to be experienced and self-reliant, and they describe a country where the rewards are proportional to the effort. The coast alone makes the case, but the warmth of Mozambicans and the frontier atmosphere give it something harder to find elsewhere.'
WHERE slug = 'mozambique';

-- LESOTHO
UPDATE countries SET
  budget_breakdown = '{"accommodation":{"low":10,"high":40,"currency":"USD","note":"Community guesthouse to mountain lodge"},"food":{"low":3,"high":10,"currency":"USD","note":"Local meal to lodge dinner"},"transport":{"low":2,"high":10,"currency":"USD","note":"Minibus taxi to 4x4 rental"},"activities":{"low":5,"high":25,"currency":"USD","note":"Village visit to pony trekking"}}'::jsonb,
  vibe_summary = 'Remote, rugged, quietly profound',
  social_vibe = 'Very few solo travelers; your connections will be with locals and lodge staff, and they will be genuine',
  cultural_note = 'Basotho blankets are cultural heritage, not costume; respectful greetings are essential, rural communities deeply value manners',
  transport_summary = '4x4 recommended for the highlands, road conditions are variable and seasonal, minibus taxis connect major towns',
  intro_md = E'Lesotho exists entirely above 1,400 meters, making it the highest low point of any country on earth. They call it the Mountain Kingdom, and the name is not poetic license. The Maluti Mountains dominate everything: the landscape, the culture, the pace of life. Maletsunyane Falls drops 192 meters into a gorge that you might have entirely to yourself. Sani Pass connects to South Africa via one of the most dramatic mountain roads on the continent. Pony trekking through highland villages is not a tourist activity here; it is simply how people get around.\n\nThis is one of the least-touristed countries in southern Africa, and that is precisely its appeal. There are no crowds, no tourist infrastructure beyond a handful of lodges, and no other travelers competing for the same viewpoint. What there is: shepherds in traditional blankets tending livestock on mountain passes, stone-walled villages where visitors are greeted with genuine curiosity and warmth, and a silence so complete it recalibrates your sense of what quiet means. Lesotho is not for everyone. But for women who want a destination that has not been flattened by tourism, it is extraordinary.'
WHERE slug = 'lesotho';
