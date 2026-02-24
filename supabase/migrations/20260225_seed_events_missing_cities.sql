-- =============================================================================
-- Migration: Seed city_events for 31 cities with zero events
-- =============================================================================
-- Covers 10 countries:
--   Cambodia (4 cities), Laos (3), Lesotho (2), Malaysia (5),
--   Mozambique (3), Myanmar (3), Namibia (3), Singapore (1),
--   South Africa (4), Zimbabwe (3)
--
-- 3 events per city = 93 total events.
-- Uses ON CONFLICT (slug) DO NOTHING so this migration is safe to re-run.
-- City IDs resolved via subquery on cities.slug.
-- =============================================================================

INSERT INTO city_events (id, city_id, name, slug, event_type, description, solo_tip, start_month, end_month, specific_dates, recurrence, year, is_free, crowd_level, order_index)
VALUES

-- =============================================
-- CAMBODIA
-- =============================================

-- Kampot
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'kampot' LIMIT 1),
 'Bon Om Touk (Water Festival)', 'kampot-bon-om-touk', 'festival',
 'Cambodia''s most beloved festival marks the reversal of the Tonlé Sap River with three days of illuminated boat races, fireworks, and floating lanterns. In Kampot, the riverside promenade fills with food stalls, live music, and families celebrating late into the night. The atmosphere is intimate compared to Phnom Penh''s massive event, giving you a more authentic, local experience.',
 'The Kampot riverside gets crowded after dark, so claim a spot at one of the waterfront restaurants by 5pm. Stick to well-lit areas along the main promenade and arrange transport back to your guesthouse in advance, as tuk-tuk drivers become scarce after midnight.',
 11, 11, 'Full moon of Kadeuk (usually early November)', 'annual',
 NULL, true, 'high', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'kampot' LIMIT 1),
 'Kampot Pepper Festival', 'kampot-pepper-festival', 'festival',
 'This annual celebration of Kampot''s world-famous pepper — a product with Protected Geographical Indication status — draws food lovers and chefs from across the region. Pepper farms open their gates for tours, tastings, and cooking demonstrations while the town hosts chef competitions, agricultural exhibitions, and live entertainment. It is a rare chance to meet the farming families behind one of the world''s most prized spices.',
 'Book a pepper farm tour in advance through your guesthouse, as the popular farms fill up quickly. Wear closed-toe shoes and sunscreen for plantation visits. The festival is family-friendly and very safe, making it one of the most relaxed events in Cambodia.',
 2, 2, 'Mid-February (varies yearly)', 'annual',
 NULL, false, 'moderate', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'kampot' LIMIT 1),
 'Khmer New Year (Choul Chnam Thmey)', 'kampot-khmer-new-year', 'holiday',
 'Cambodia empties its cities for this three-day celebration as families return to ancestral homes, but Kampot''s relaxed coastal vibe makes it a wonderful place to experience the festivities. Pagodas overflow with offerings, traditional games take over public spaces, and the quiet town buzzes with music and dancing. Expect generous hospitality from locals eager to share food and blessings with visitors.',
 'Many restaurants and shops close for the full three days, so stock up on supplies beforehand. Temples welcome respectful visitors — dress modestly with shoulders and knees covered. Transport options become very limited, so arrange any travel plans well before the holiday begins.',
 4, 4, 'April 14-16', 'annual',
 NULL, true, 'moderate', 3),

-- Koh Rong
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'koh-rong' LIMIT 1),
 'Bioluminescent Plankton Season', 'koh-rong-bioluminescence', 'seasonal',
 'From October through April, Koh Rong''s sheltered bays light up with bioluminescent plankton, turning nighttime swims into a surreal, glowing experience. The phenomenon is most vivid on moonless nights in calm waters around Long Set Beach and the quieter eastern bays. Wade into the warm shallows and watch blue-green light trail from every movement of your hands and feet.',
 'Book accommodation on Long Set Beach for the best access to bioluminescence spots. Go on nights with no moon and minimal cloud cover for the brightest display. Swim close to shore in shallow water, and bring a waterproof bag for your phone — photos rarely capture the magic, but the memory will stay with you.',
 10, 4, 'Best on moonless nights, October to April', 'annual',
 NULL, true, 'low', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'koh-rong' LIMIT 1),
 'Koh Rong Full Moon Parties', 'koh-rong-full-moon-party', 'festival',
 'Each full moon, the beaches of Koh Rong host laid-back parties that feel more bohemian than the frenetic Thai island scene. Fire dancers, DJs playing from bamboo shacks, and a crowd of backpackers and long-term travelers create a festive but manageable atmosphere on the white sand. The vibe is far more chill than Koh Phangan — think craft cocktails, drum circles, and conversations under the stars.',
 'Stay on the same beach as the party to avoid dark jungle paths at night. Pre-arrange your accommodation before heading over, as the island books out on full moon weekends. Keep your drinks in sight at all times and buddy up with other travelers you trust.',
 1, 12, 'Monthly, on the full moon', 'annual',
 NULL, false, 'moderate', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'koh-rong' LIMIT 1),
 'Khmer New Year Beach Festival', 'koh-rong-khmer-new-year', 'holiday',
 'When Cambodians flood the coast for their New Year holiday, Koh Rong transforms with beach games, barbecues, and a joyful mix of local and international celebration. Guesthouses and restaurants put on special menus, and impromptu volleyball tournaments and music sessions spring up along the shoreline. It is one of the few times you will see large numbers of young Cambodians vacationing on the island.',
 'Book ferries and accommodation at least two weeks in advance — this is the island''s busiest period and boats sell out. Prices spike during this week, so budget accordingly. The festive atmosphere is very safe, but the extra crowds mean the island''s limited ATMs may run out of cash, so bring enough riel or dollars.',
 4, 4, 'April 14-16', 'annual',
 NULL, true, 'high', 3),

-- Phnom Penh
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'phnom-penh' LIMIT 1),
 'Bon Om Touk (Water Festival)', 'phnom-penh-bon-om-touk', 'festival',
 'Cambodia''s grandest festival draws up to two million people to the Phnom Penh riverfront for three days of spectacular longboat races on the Tonlé Sap River. Over 400 ornately decorated boats compete in heats while the Riverside promenade becomes a carnival of food stalls, concerts, and fireworks. The final night''s illuminated float parade and massive pyrotechnics display over the Royal Palace is genuinely unforgettable.',
 'The Riverside area becomes dangerously packed on the final night — stay near the edges of the crowd and identify exit routes in advance. Book a rooftop restaurant along Sisowath Quay weeks ahead for the safest and most comfortable viewing experience. Avoid the stampede-prone bridges and overpasses identified in past incidents.',
 11, 11, 'Three days around the full moon of Kadeuk (November)', 'annual',
 NULL, true, 'high', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'phnom-penh' LIMIT 1),
 'Pchum Ben (Ancestors'' Day)', 'phnom-penh-pchum-ben', 'holiday',
 'For fifteen days, Cambodians honor deceased relatives by bringing food offerings to pagodas in one of the most spiritually significant festivals in the Khmer calendar. Phnom Penh''s Wat Phnom and Wat Ounalom become hubs of solemn ceremony, with families arriving before dawn to offer sticky rice balls to monks. The final three days are public holidays when the city quiets as families gather at ancestral pagodas across the country.',
 'Visit pagodas early in the morning (4-6am) to witness the most meaningful ceremonies. Dress conservatively in white or muted colors, not black. Many businesses close for the final three days, so plan your meals and transport accordingly. This is a deeply respectful time — observe quietly and ask before photographing rituals.',
 9, 10, 'Fifteen days ending on the 15th day of the 10th Khmer month (September/October)', 'annual',
 NULL, true, 'low', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'phnom-penh' LIMIT 1),
 'Angkor Sangkran (Khmer New Year)', 'phnom-penh-khmer-new-year', 'holiday',
 'Phnom Penh celebrates Khmer New Year with traditional games in public parks, dance performances at the National Museum, and water splashing in the streets around the Riverside area. While many locals leave the capital for their home provinces, the city takes on a relaxed carnival atmosphere with pop-up stages, amusement parks, and traditional music blaring from every corner. Street food vendors pull out special New Year sweets and treats found only during this celebration.',
 'The city empties significantly, making it a quieter and more manageable time to visit major sites. Stock up on cash and essentials before the holiday as most banks and many shops close. Tuk-tuk prices increase, so negotiate firmly or use ride-hailing apps like PassApp.',
 4, 4, 'April 14-16', 'annual',
 NULL, true, 'moderate', 3),

-- Siem Reap
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'siem-reap' LIMIT 1),
 'Angkor Wat International Half Marathon', 'siem-reap-angkor-marathon', 'sports',
 'One of Southeast Asia''s most iconic running events takes you through the ancient temple complex of Angkor at sunrise, with routes winding past Angkor Wat, Bayon, and Ta Prohm. The half marathon, 10K, and 3K courses are open to runners of all levels, with proceeds supporting local landmine-clearing charities and children''s hospitals. Running through 900-year-old temple corridors as golden light filters through the jungle canopy is an experience that transcends sport.',
 'Register online months in advance as the event sells out. Start line assembly begins at 4:30am, so stay near the temple area the night before. The humidity is punishing even in December, so train in heat if possible and hydrate aggressively the day before. Solo women runners report feeling very safe throughout the well-organized event.',
 12, 12, 'First Sunday of December', 'annual',
 NULL, false, 'high', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'siem-reap' LIMIT 1),
 'Giant Puppet Parade', 'siem-reap-giant-puppet-parade', 'parade',
 'Enormous handcrafted puppets depicting characters from Khmer mythology process through the streets of Siem Reap in this uniquely Cambodian arts event organized by local NGO Giant Puppet Project. Communities spend months building the towering figures from bamboo and recycled materials, culminating in a colorful parade with traditional musicians, dancers, and hundreds of excited children. The event supports local arts education and cultural preservation.',
 'The parade route is published a few days before on the Giant Puppet Project''s Facebook page — follow for updates. Position yourself along Sivatha Boulevard for the best views. The event is extremely family-friendly and one of the safest large gatherings in Siem Reap.',
 11, 11, 'Mid-November (varies yearly)', 'annual',
 NULL, true, 'moderate', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'siem-reap' LIMIT 1),
 'Bon Om Touk in Siem Reap', 'siem-reap-bon-om-touk', 'festival',
 'While smaller than Phnom Penh''s celebrations, Siem Reap''s Water Festival offers boat races on the Siem Reap River along with evening fireworks, traditional performances at the Royal Gardens, and a festive atmosphere along Pub Street and the Night Market. The temple complex often offers special evening access with atmospheric lighting during the festival period. It is a wonderful time to experience both ancient and modern Cambodia in a single destination.',
 'Combine festival activities with quieter temple visits in the early morning before the day''s festivities begin. Book your Angkor pass before the festival rush. The Night Market and Pub Street areas are safe but very crowded — use a crossbody bag and keep valuables minimal.',
 11, 11, 'Three days around the full moon of Kadeuk (November)', 'annual',
 NULL, true, 'high', 3),

-- =============================================
-- LAOS
-- =============================================

-- Luang Prabang
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'luang-prabang' LIMIT 1),
 'Pi Mai Lao (Lao New Year)', 'luang-prabang-pi-mai', 'festival',
 'Luang Prabang hosts the most spectacular Lao New Year celebration in the country, combining sacred water-blessing ceremonies at its UNESCO-listed temples with joyful street-wide water fights. Monks receive elaborate processions, sand stupas are built along the Mekong riverbank, and a Miss New Year beauty pageant parades through the old town. The three-day festival seamlessly blends deep Buddhist devotion with uninhibited celebration.',
 'The old town becomes one giant water zone — protect electronics in dry bags and wear clothes you do not mind getting soaked. Temple ceremonies in the early morning (5-7am) are the most meaningful and least crowded. Guesthouse prices double during this period, so book at least a month in advance.',
 4, 4, 'April 14-16', 'annual',
 NULL, true, 'high', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'luang-prabang' LIMIT 1),
 'Boun Ok Phansa (End of Buddhist Lent)', 'luang-prabang-ok-phansa', 'holiday',
 'The end of the three-month Buddhist rains retreat is marked by illuminated boat races on the Mekong, elaborate temple offerings, and the launch of hundreds of decorated fire boats carrying candles downstream at dusk. Monks emerge from their meditation retreat to receive gifts from the community, and the Night Market expands with special festival food and handicrafts. The fire boat procession at sunset, with the Mekong reflecting hundreds of flickering flames, is hauntingly beautiful.',
 'Secure a spot on the Mekong riverbank near the old town boat landing by late afternoon for the best fire boat views. The morning alms-giving ceremony is particularly significant on this day — observe from a respectful distance and never touch the monks. Dress modestly for temple visits.',
 10, 10, 'Full moon of the 11th lunar month (October)', 'annual',
 NULL, true, 'moderate', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'luang-prabang' LIMIT 1),
 'That Luang Festival', 'luang-prabang-that-luang', 'festival',
 'While the main That Luang Festival takes place in Vientiane, Luang Prabang holds its own vibrant celebrations at local temples featuring candlelit processions (Wien Thien), traditional music, and elaborate merit-making ceremonies. Monks lead the processions carrying offerings around temple grounds while lay people follow with candles, creating rivers of golden light through the old town. The surrounding temple fairs sell traditional Lao handicrafts, textiles, and street food.',
 'Follow the candlelit processions at Wat Xieng Thong for the most atmospheric experience. Wear long sleeves and a skirt or trousers that cover your knees, as you may be invited into temple courtyards. The celebrations are deeply spiritual — this is not a party atmosphere, but rather a contemplative, beautiful event.',
 11, 11, 'Full moon of the 12th lunar month (November)', 'annual',
 NULL, true, 'low', 3),

-- Vang Vieng
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'vang-vieng' LIMIT 1),
 'Pi Mai Lao (Lao New Year)', 'vang-vieng-pi-mai', 'festival',
 'Vang Vieng''s Lao New Year celebrations mix traditional merit-making at the town''s temples with exuberant water fights along the main strip and down by the Nam Song River. The backpacker town takes on a carnival atmosphere with live music stages, traditional Lao dance performances, and beauty pageants. The stunning karst limestone backdrop gives the celebrations a uniquely photogenic quality found nowhere else in the country.',
 'The tubing operators shut down during the festival, so plan river activities before or after. Water fights on the main street can be intense — safeguard your passport and phone in waterproof pouches. The town is small and walkable, making it easy to navigate even in the festive chaos.',
 4, 4, 'April 14-16', 'annual',
 NULL, true, 'high', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'vang-vieng' LIMIT 1),
 'Hot Air Balloon Season', 'vang-vieng-balloon-season', 'seasonal',
 'During the dry season, hot air balloon operators offer sunrise flights over Vang Vieng''s extraordinary landscape of jagged karst mountains, emerald rice paddies, and the winding Nam Song River. The still morning air and clear skies of November through February provide the most stable and visually stunning conditions. Floating silently above the mist-filled valleys at dawn, with limestone peaks piercing through the clouds, is one of Laos''s most magical experiences.',
 'Book your balloon flight for the first morning of a clear weather window, as flights cancel in wind or rain. Operators pick up from hotels around 5:30am. Wear layers as it is chilly at altitude before the sun warms up. Solo travelers can join group baskets, which is a great way to meet other travelers.',
 11, 2, 'Daily during dry season, weather permitting', 'annual',
 NULL, false, 'low', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'vang-vieng' LIMIT 1),
 'Boun Bang Fai (Rocket Festival)', 'vang-vieng-rocket-festival', 'festival',
 'This pre-Buddhist rain-making festival sees homemade bamboo rockets launched into the sky to encourage the rain gods to send a good monsoon season. In Vang Vieng, the festival features parades with elaborate floats, traditional Lao music and dance, and competitive rocket launches from the surrounding fields. When a rocket fails to launch, the builder is playfully thrown into a mud pit — the crowd''s favorite spectacle.',
 'Stay well behind the designated safety lines during rocket launches, as misfires are common and part of the entertainment. The festival involves significant alcohol consumption by participants, so keep your wits about you. The best viewing spots are on higher ground overlooking the launch fields.',
 5, 5, 'Mid-May (sixth lunar month)', 'annual',
 NULL, true, 'moderate', 3),

-- Vientiane
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'vientiane' LIMIT 1),
 'Boun That Luang (That Luang Festival)', 'vientiane-that-luang', 'festival',
 'Laos''s most important religious festival takes place around the iconic golden stupa of Pha That Luang, the national symbol. A week of celebrations includes a massive trade fair, traditional sports competitions, live music, and the spectacular Wien Thien candlelit procession where thousands circle the stupa carrying flowers and incense. The festival culminates with an early morning alms-giving ceremony where thousands of monks gather in saffron robes — a sight unique to Vientiane.',
 'Arrive at That Luang before 5am on the final morning for the mass alms-giving — it is one of the most powerful spiritual experiences in Southeast Asia. The trade fair surrounding the stupa runs all week and is safe to explore solo in the evenings. Dress conservatively as this is a deeply religious event.',
 11, 11, 'Full moon of the 12th lunar month (November)', 'annual',
 NULL, true, 'high', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'vientiane' LIMIT 1),
 'Pi Mai Lao (Lao New Year)', 'vientiane-pi-mai', 'holiday',
 'Vientiane''s New Year celebrations center around the boulevard leading to Patuxai monument and the Mekong riverside, where elaborate sand stupas are built and the city''s most sacred Buddha images are paraded through the streets for ritual cleansing. Government buildings and temples host formal ceremonies while the streets erupt in water fights. The capital''s celebration is more organized and slightly more restrained than upcountry versions, with concerts, cultural shows, and fireworks along the river.',
 'The Mekong riverside area is the safest and most festive zone for solo travelers. Many restaurants and shops close for at least two days, so ensure you have cash and supplies. The water fighting is less aggressive here than in Luang Prabang, making it comfortable for those who prefer a gentler experience.',
 4, 4, 'April 14-16', 'annual',
 NULL, true, 'high', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'vientiane' LIMIT 1),
 'Vientiane Boat Racing Festival', 'vientiane-boat-racing', 'sports',
 'At the end of Buddhist Lent, longboat racing teams from across Laos converge on the Mekong riverfront in Vientiane for fiercely competitive races that draw enormous crowds. Teams of up to 50 rowers power ornately decorated boats through the brown river waters while spectators cheer from the banks. The surrounding festival includes live concerts, food fairs, and a carnival atmosphere that takes over the entire riverside promenade for three days.',
 'The riverbank gets extremely crowded, so arrive early to secure a shaded viewing spot. The area near Chao Anouvong Park offers good sightlines with more space. Evening concerts attract large crowds — stay in well-lit areas and keep valuables secure. This is one of the best times to experience Lao community spirit.',
 10, 10, 'End of October, coinciding with Ok Phansa', 'annual',
 NULL, true, 'high', 3),

-- =============================================
-- LESOTHO
-- =============================================

-- Maseru
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'maseru' LIMIT 1),
 'Morija Arts & Cultural Festival', 'maseru-morija-festival', 'festival',
 'Lesotho''s premier cultural event takes place in Morija, a short drive from Maseru, featuring traditional Basotho music, dance, poetry, and theater alongside contemporary arts and crafts. The festival celebrates the Mountain Kingdom''s rich heritage with performances by Famo music groups, traditional blanket-wearing ceremonies, and horse riding displays. International artists join local performers, creating a cross-cultural exchange that has become one of Southern Africa''s most authentic arts festivals.',
 'Arrange a day trip from Maseru or stay in Morija''s limited guesthouses, which book out quickly. The festival grounds are safe and family-oriented, with a strong community atmosphere. Bring warm layers as Lesotho evenings get cold even in October. A Basotho blanket purchased at the festival makes a meaningful souvenir.',
 10, 10, 'First week of October', 'annual',
 NULL, false, 'moderate', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'maseru' LIMIT 1),
 'Moshoeshoe Day', 'maseru-moshoeshoe-day', 'holiday',
 'This national holiday honors the founder of the Basotho nation, King Moshoeshoe I, with ceremonies at the Maseru royal palace grounds, traditional horse racing, and cultural performances throughout the capital. Government officials lay wreaths, choirs perform traditional songs, and the city takes on a patriotic, festive atmosphere. It is the best day of the year to witness Basotho cultural pride and learn about the fascinating history of Africa''s mountain kingdom.',
 'The main ceremonies at the palace grounds are open to respectful visitors — dress neatly and arrive by 9am. Public transport is limited on the holiday, so arrange a taxi in advance. The celebrations are peaceful and locals are typically welcoming to visitors showing genuine interest in their heritage.',
 3, 3, 'March 11', 'annual',
 NULL, true, 'moderate', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'maseru' LIMIT 1),
 'Independence Day Celebrations', 'maseru-independence-day', 'holiday',
 'Lesotho''s Independence Day marks the country''s 1966 freedom from British colonial rule with parades, military displays, traditional dance performances, and speeches at the national stadium in Maseru. Schools and community groups rehearse for weeks to present choreographed displays of Basotho culture, and the streets fill with vendors selling flags, traditional food, and celebratory goods. The evening brings fireworks over the capital and impromptu street parties.',
 'The stadium events require arriving early for good seats. Maseru is generally safe during daytime celebrations, but take normal precautions after dark. Restaurants fill up quickly for lunch, so eat early or book ahead. This is a public holiday, so banks and government offices will be closed.',
 10, 10, 'October 4', 'annual',
 NULL, true, 'moderate', 3),

-- Semonkong
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'semonkong' LIMIT 1),
 'Basotho Pony Trekking Season', 'semonkong-pony-season', 'seasonal',
 'The dry winter months bring ideal conditions for pony trekking through Semonkong''s dramatic highlands on sure-footed Basotho ponies, the hardy breed developed over centuries in Lesotho''s mountains. Multi-day rides take you through remote villages, across rushing streams, and along vertiginous mountain passes where the only sounds are hooves on stone and wind through the grass. The Semonkong Lodge organizes guided rides ranging from two hours to five days.',
 'Book through Semonkong Lodge, which has the most experienced guides and well-cared-for ponies. No riding experience is necessary — the ponies are extraordinarily calm and sure-footed on mountain terrain. Pack warm layers, sunscreen, and a rain jacket as mountain weather changes rapidly. The lodge is safe and welcoming for solo women travelers.',
 5, 9, 'May to September (dry season)', 'annual',
 NULL, false, 'low', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'semonkong' LIMIT 1),
 'Maletsunyane Falls Winter Spectacle', 'semonkong-falls-winter', 'seasonal',
 'Africa''s highest single-drop waterfall (192 meters) reaches its most dramatic flow during the late summer rains, with the gorge filling with thundering mist and rainbows. The Maletsunyane Falls viewing platform offers heart-stopping perspectives of the cascade plunging into the gorge below. Adventurous visitors can abseil down the cliff face beside the falls — one of the longest commercial abseils in the world at 204 meters.',
 'The 45-minute walk to the falls viewpoint is straightforward but can be muddy after rain — wear proper hiking shoes. The abseil is professionally operated with excellent safety equipment, and solo women regularly participate. Bring warm clothing even in summer as the gorge creates its own cool microclimate.',
 1, 3, 'January to March (peak flow)', 'annual',
 NULL, true, 'low', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'semonkong' LIMIT 1),
 'Village Cultural Visits', 'semonkong-village-visits', 'seasonal',
 'Throughout the year, organized visits to remote highland villages around Semonkong offer an intimate window into traditional Basotho life that has changed little in centuries. You will see women weaving grass hats, men herding livestock on horseback, and children playing traditional games in stone-walled kraals. Semonkong Lodge coordinates these visits with local village chiefs to ensure respectful, mutually beneficial cultural exchange.',
 'Always visit through an organized tour with a local guide who can translate and provide cultural context. Bring small gifts for the chief (sugar and tea are traditional) rather than handing out sweets to children. Dress warmly and prepare for a moderate hike to reach some villages. Ask before photographing people.',
 4, 10, 'April to October (dry season preferred)', 'annual',
 NULL, false, 'low', 3),

-- =============================================
-- MALAYSIA
-- =============================================

-- Kota Kinabalu
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'kota-kinabalu' LIMIT 1),
 'Kaamatan (Harvest Festival)', 'kota-kinabalu-kaamatan', 'festival',
 'Sabah''s most important cultural celebration honors the rice harvest with a month of traditional Kadazandusun rituals, culminating in two days of spectacular pageantry at the KDCA grounds in Penampang, just outside Kota Kinabalu. The Unduk Ngadau beauty pageant crowns the festival queen, while traditional games, tapai (rice wine) drinking, and performances of the Sumazau dance fill the grounds. It is the most authentic immersion into Borneo indigenous culture available anywhere.',
 'The final two days (May 30-31) at KDCA grounds are the must-see events — arrive early for parking and good viewing positions. Try tapai (rice wine) but pace yourself as it is deceptively strong. The event is safe, welcoming to visitors, and a wonderful place to meet local women who are proud to share their heritage.',
 5, 5, 'Month of May, main events May 30-31', 'annual',
 NULL, true, 'high', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'kota-kinabalu' LIMIT 1),
 'Sabah Fest', 'kota-kinabalu-sabah-fest', 'festival',
 'This week-long celebration of Sabah''s extraordinary ethnic diversity brings together performers from over 30 indigenous groups in a showcase of dance, music, martial arts, and traditional crafts at the Sabah Cultural Village on the slopes of Mount Kinabalu. Evening performances feature fire dancing, traditional instruments, and stories passed down through generations. The cultural village setting, nestled in tropical gardens with Mount Kinabalu as the backdrop, is spectacular.',
 'Book the Sabah Cultural Village entry and evening performance tickets online in advance. The venue is about 30 minutes from Kota Kinabalu — arrange return transport before the show ends at 9pm, as taxis are scarce in the area after dark. Bring a light jacket as the mountain elevation makes evenings cool.',
 10, 10, 'Mid-October (varies yearly)', 'annual',
 NULL, false, 'moderate', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'kota-kinabalu' LIMIT 1),
 'Mount Kinabalu Climbathon', 'kota-kinabalu-climbathon', 'sports',
 'One of the toughest mountain races in the world, the Climbathon sends elite runners up and down Southeast Asia''s highest peak (4,095m) in a single day, while a parallel event welcomes amateur climbers for a supported ascent. The spectacle of watching trail runners sprint up near-vertical granite slopes is humbling, and the mountain''s biodiversity — from tropical rainforest to alpine meadow — makes even spectating a memorable nature experience.',
 'Register months ahead if you want to participate in the amateur category. Even spectators should bring warm layers and rain gear to the mountain park. If you plan to climb Kinabalu independently around the event, book your permit and lodge well in advance as availability drops significantly during Climbathon week.',
 10, 10, 'Mid-October (coincides with Sabah Fest)', 'annual',
 NULL, false, 'moderate', 3),

-- Kuala Lumpur
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'kuala-lumpur' LIMIT 1),
 'Thaipusam', 'kuala-lumpur-thaipusam', 'festival',
 'One of the most visually extraordinary religious festivals in the world, Thaipusam draws over a million devotees to the Batu Caves as Hindu worshippers fulfill vows through acts of devotion including body piercings with hooks and skewers, carrying elaborate kavadi structures, and climbing the famous 272 rainbow steps to the cave temple. The night-long procession from KL''s Sri Mahamariamman Temple to Batu Caves, lit by thousands of oil lamps, is a sensory overload of drumming, chanting, and devotion.',
 'Take the KTM Komuter train to Batu Caves station to avoid the impossible traffic and parking situation. Arrive before dawn for the most intense spiritual atmosphere. Wear comfortable shoes and modest clothing. The crowds are enormous but peaceful — stay hydrated and bring a hat. Solo women are completely safe among the devout family crowds.',
 1, 2, 'Full moon of Tamil month Thai (January/February)', 'annual',
 NULL, true, 'high', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'kuala-lumpur' LIMIT 1),
 'Hari Raya Aidilfitri', 'kuala-lumpur-hari-raya', 'holiday',
 'The end of Ramadan transforms Kuala Lumpur with weeks of open-house celebrations where Malay families invite friends, neighbors, and even strangers to feast on rendang, ketupat, and dozens of traditional kuih (sweets). The streets of Kampung Baru, KL''s oldest Malay neighborhood, come alive with food bazaars, traditional performances, and the warm glow of oil lamps. Shopping malls compete with spectacular Raya decorations, and the entire city radiates generosity and hospitality.',
 'Many Malay families genuinely welcome visitors to their open houses — accept invitations graciously, remove your shoes at the door, and bring a small gift. Dress modestly with sleeves and long skirts or trousers. The Kampung Baru Raya bazaar is the best place to experience the festive food and atmosphere. Public transport runs a reduced schedule.',
 4, 5, 'Varies by Islamic calendar (shifts 11 days earlier each year)', 'annual',
 NULL, true, 'moderate', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'kuala-lumpur' LIMIT 1),
 'KL International Arts Festival', 'kuala-lumpur-arts-festival', 'festival',
 'Kuala Lumpur''s premier arts event brings together Malaysian and international performers across dance, theater, music, and visual arts in venues ranging from the Petronas Philharmonic Hall to independent galleries in the creative district of Zhongshan. The program champions Southeast Asian contemporary artists while hosting world-class international acts. Fringe events, workshops, and artist talks make this a participatory cultural experience rather than a passive one.',
 'Book tickets for headline shows early as popular performances sell out. The festival hub at KLPAC (KL Performing Arts Centre) in Sentul West is easily reached by KTM train. Evening shows in the arts district are safe — the area is well-lit and frequented by the creative community. Check the festival app for free fringe events and workshops.',
 9, 9, 'September (varies yearly)', 'annual',
 NULL, false, 'moderate', 3),

-- Langkawi
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'langkawi' LIMIT 1),
 'Langkawi International Maritime & Aerospace Exhibition (LIMA)', 'langkawi-lima', 'conference',
 'Every two years, this major defense and aerospace exhibition draws military hardware displays, aerobatic teams, and maritime vessels from dozens of countries to Langkawi''s MIEC convention center and Mahsuri International Exhibition Centre. The public days feature thrilling aerial displays by fighter jets and stunt planes over the Andaman Sea, with the mountainous island providing a dramatic backdrop. Even if military hardware is not your thing, the air show component is genuinely spectacular.',
 'Public access days are typically the final two days of the exhibition — check the LIMA website for dates and ticket prices. The air shows are best viewed from Pantai Cenang beach for a free, uncrowded perspective. Langkawi accommodation prices spike during LIMA weeks, so book early or visit on the periphery days.',
 3, 3, 'Biennial, usually March (odd years)', 'annual',
 NULL, false, 'high', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'langkawi' LIMIT 1),
 'Eagle Feeding Season', 'langkawi-eagle-season', 'seasonal',
 'Langkawi takes its name from the Brahminy Kite (helang in Malay), and these magnificent raptors are most visible during the drier months when daily eagle-feeding boat tours from Kuah jetty draw dozens of the rust-and-white birds swooping dramatically over the water. The experience of watching eagles dive for fish just meters from your boat, framed by limestone sea stacks and mangrove islands, is breathtaking. Several operators combine eagle watching with mangrove kayaking and island hopping.',
 'Book a morning tour for the best light and calmest seas. The smaller boat operators (6-8 people) offer a more intimate experience than the large tourist boats. Bring binoculars for the best views and a waterproof camera case. Reef-safe sunscreen is important as tours include snorkeling stops at island beaches.',
 11, 3, 'November to March (dry season)', 'annual',
 NULL, false, 'low', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'langkawi' LIMIT 1),
 'Ironman Langkawi', 'langkawi-ironman', 'sports',
 'This Olympic-distance triathlon takes athletes through a 1.5km ocean swim in the crystal-clear Andaman Sea, a 40km cycle through Langkawi''s lush interior roads past rice paddies and rainforest, and a 10km run along the coastline. The relatively flat course and warm waters make it popular with first-time triathlon competitors, and the island setting makes it feel more like a tropical holiday than a grueling race. Spectators enjoy a festival atmosphere at the finish line at Dataran Lang.',
 'If participating, register early as spots fill fast for this popular race. The race expo at the finish area is free and fun for spectators. Book accommodation in Kuah town near the start/finish for the most convenient experience. The event attracts a strong community of women athletes and is a great way to meet other active solo travelers.',
 11, 11, 'November (varies yearly)', 'annual',
 NULL, false, 'moderate', 3),

-- Malacca
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'malacca' LIMIT 1),
 'Jonker Walk Night Market', 'malacca-jonker-night-market', 'seasonal',
 'Every Friday and Saturday night, Jonker Street in Malacca''s UNESCO-listed Chinatown transforms into a vibrant night market with hundreds of stalls selling antiques, local crafts, traditional kuih, and the city''s famous chicken rice balls. Live music stages feature everything from Chinese opera to modern bands, and the lantern-lit street creates an atmosphere that captures Malacca''s unique blend of Chinese, Malay, Portuguese, and Dutch heritage. The market has operated continuously since 2000 and is an essential Malacca experience.',
 'Arrive before 7pm to beat the crowds and secure a table at the food stalls near the river end of the street. The market is extremely safe and well-lit, making it comfortable for solo women even late at night. Wear comfortable shoes as the cobblestoned street gets packed. The best food stalls are the ones with the longest local queues.',
 1, 12, 'Every Friday and Saturday, 6pm-midnight', 'annual',
 NULL, true, 'high', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'malacca' LIMIT 1),
 'Festa San Pedro (St. Peter''s Feast)', 'malacca-festa-san-pedro', 'festival',
 'Malacca''s Portuguese-Eurasian community, descended from 16th-century colonizers, celebrates their patron saint with a unique festival at the Portuguese Settlement (Medan Portugis). Decorated fishing boats parade along the coast, traditional Cristang folk dances are performed, and a feast of devil curry, vindaloo, and other Kristang dishes is shared with visitors. The festival is a living reminder of Malacca''s extraordinary layered history and one of the few places in Asia where a 500-year-old European community still thrives.',
 'Take a Grab to the Portuguese Settlement, which is a 10-minute ride from the UNESCO zone. The community is small and welcoming — introduce yourself to the organizers and you will likely be invited to join the celebrations. The food is outstanding and unlike anything else in Malaysia. Evenings are safe within the settlement compound.',
 6, 6, 'June 29 and surrounding weekend', 'annual',
 NULL, true, 'moderate', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'malacca' LIMIT 1),
 'Malacca River Festival of Lights', 'malacca-river-lights', 'festival',
 'The historic Malacca River comes alive with illuminated art installations, projection mapping on heritage buildings, and floating lantern displays during this annual celebration of the city''s maritime heritage. Boat cruises offer a unique perspective on the light installations reflected in the water, while riverside cafes and restaurants extend their terraces for special festival dining. The combination of 500-year-old Dutch and Portuguese architecture bathed in contemporary light art creates a genuinely enchanting atmosphere.',
 'Book a river cruise ticket in advance for the best experience — the evening cruises sell out during the festival. Walking the riverside path is free and offers excellent views of the installations. The historic center is very safe at night during the festival with heavy foot traffic and good lighting. Wear mosquito repellent near the river.',
 12, 12, 'December (varies yearly)', 'annual',
 NULL, true, 'moderate', 3),

-- Penang
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'penang' LIMIT 1),
 'George Town Festival', 'penang-george-town-festival', 'festival',
 'Southeast Asia''s leading arts festival transforms Penang''s UNESCO-listed George Town into a month-long celebration of contemporary and traditional arts, with performances, exhibitions, and installations occupying heritage shophouses, temples, street corners, and purpose-built venues. The program ranges from avant-garde theater and experimental music to traditional Chinese puppet shows and Malay dance. Many events are free, and the festival''s commitment to site-specific art means the city itself becomes the gallery.',
 'Download the festival app for the daily schedule and map of events. Many of the best performances are free but require advance registration. Stay in the heritage zone for walking access to most venues. George Town is one of Southeast Asia''s safest cities for solo women, and the festival atmosphere makes it even more welcoming.',
 7, 7, 'Throughout July', 'annual',
 NULL, false, 'moderate', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'penang' LIMIT 1),
 'Thaipusam at Waterfall Hilltop Temple', 'penang-thaipusam', 'festival',
 'Penang''s Thaipusam procession is considered the most intense and visually stunning in Malaysia, with devotees carrying massive kavadi structures up the 513 steps to the Arulmigu Balathandayuthapani Hilltop Temple. The procession begins at midnight from the Kovil Veedu temple on the waterfront, winding through George Town''s streets before the grueling ascent at dawn. The combination of devotion, physical endurance, and the dramatic hilltop setting makes this one of the most powerful religious spectacles in Asia.',
 'Position yourself along Jalan Waterfall for the best views of the procession without climbing the steps yourself. The crowds are massive but respectful — arrive by 4am for the most intense period. Wear modest clothing and comfortable shoes. The Hindu community is welcoming to respectful observers. Bring water and snacks as vendors get overwhelmed.',
 1, 2, 'Full moon of Tamil month Thai (January/February)', 'annual',
 NULL, true, 'high', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'penang' LIMIT 1),
 'Penang International Food Festival', 'penang-food-festival', 'festival',
 'Penang''s legendary street food culture takes center stage during this festival celebrating the island''s status as Southeast Asia''s unofficial food capital. Hawker legends demonstrate their craft, pop-up dining experiences pair local cooks with international chefs, and food trails guide visitors through the best char kway teow, assam laksa, and cendol stalls across the island. The festival also includes cooking classes, farm visits, and heritage food storytelling sessions that explore the multicultural origins of Penang cuisine.',
 'Join the organized food walks for the best insider access to hawker legends — these book out quickly, so register early. The festival''s self-guided food trails are free and work well for solo exploration. Penang''s hawker centers are safe well into the evening. Pace yourself — the portions are generous and the temptation to try everything is real.',
 4, 4, 'Mid-April (varies yearly)', 'annual',
 NULL, false, 'moderate', 3),

-- =============================================
-- MOZAMBIQUE
-- =============================================

-- Bazaruto Archipelago
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'bazaruto-archipelago' LIMIT 1),
 'Whale Shark Season', 'bazaruto-whale-shark-season', 'seasonal',
 'From October to March, the warm Mozambique Channel currents bring whale sharks — the world''s largest fish — to the nutrient-rich waters around the Bazaruto Archipelago. Snorkeling alongside these gentle giants, which can reach 12 meters in length, is one of Africa''s most extraordinary marine wildlife experiences. The archipelago''s crystal-clear waters and pristine coral reefs make every encounter feel like swimming inside a nature documentary.',
 'Book a whale shark excursion through your lodge, as only licensed operators are permitted in the marine reserve. Swimming ability and comfort in open water are essential. Snorkeling experience is recommended but not required — guides provide thorough briefings. The boats can be rough in choppy conditions, so take seasickness medication if prone.',
 10, 3, 'October to March', 'annual',
 NULL, false, 'low', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'bazaruto-archipelago' LIMIT 1),
 'Dugong Viewing Season', 'bazaruto-dugong-season', 'seasonal',
 'The Bazaruto Archipelago shelters the last viable population of dugongs in the western Indian Ocean, and the calmer winter waters of June through September offer the best visibility for spotting these elusive, endangered marine mammals grazing on seagrass beds. Marine biologists estimate fewer than 300 individuals remain in these waters, making any sighting an extraordinary privilege. Boat-based viewing from a respectful distance protects these shy creatures while giving you a glimpse of a species most people will never see.',
 'Only a handful of licensed operators offer dugong-focused excursions — book well in advance through your lodge. Sightings are not guaranteed, so manage expectations. The same trips often include manta ray and turtle encounters as consolation. Bring polarized sunglasses to cut glare and improve your chances of spotting dugongs in the shallows.',
 6, 9, 'June to September (calm season)', 'annual',
 NULL, false, 'low', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'bazaruto-archipelago' LIMIT 1),
 'Coral Spawning Season', 'bazaruto-coral-spawning', 'seasonal',
 'In the weeks following the full moon in late spring, the coral reefs of Bazaruto undergo their annual spawning event — a synchronized release of eggs and sperm that transforms the underwater world into a blizzard of color and activity. Predatory fish, manta rays, and whale sharks gather to feed on the bounty, creating some of the most spectacular diving conditions of the year. For experienced divers, witnessing a coral spawn is one of the ocean''s great natural phenomena.',
 'You need at least Advanced Open Water certification for the coral spawning dives. Book with a dive operator who specifically tracks spawning predictions — the timing shifts yearly. Night dives during spawning offer the most dramatic experience. Bring an underwater camera with a macro lens. The water temperature is warm but a 3mm wetsuit adds comfort on longer dives.',
 10, 11, 'October to November (post full moon)', 'annual',
 NULL, false, 'low', 3),

-- Maputo
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'maputo' LIMIT 1),
 'Marrabenta Music Festival', 'maputo-marrabenta-festival', 'festival',
 'Maputo''s signature music genre — a soulful blend of Portuguese fado, traditional Mozambican rhythms, and South African jazz — takes center stage at this annual celebration of the country''s musical heritage. Held at venues across the capital, the festival features both legendary marrabenta artists and emerging musicians, with the main concerts drawing thousands to the waterfront stages. Dancing is inevitable — marrabenta rhythms are physically impossible to resist, and the crowd is always welcoming to newcomers finding their feet.',
 'The main waterfront concerts are safe and well-attended by local families. Stick with the crowd and avoid wandering into poorly lit side streets after the shows. Grab taxis from the official ranks rather than accepting rides from unofficial vehicles. The festival is a wonderful way to connect with Maputo''s creative community.',
 8, 8, 'August (varies yearly)', 'annual',
 NULL, false, 'high', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'maputo' LIMIT 1),
 'Independence Day', 'maputo-independence-day', 'holiday',
 'Mozambique''s Independence Day marks the 1975 liberation from Portuguese colonial rule with military parades, cultural performances, and public celebrations centered on Praça da Independência in central Maputo. The avenue fills with marching bands, traditional dance groups from all provinces, and displays of national pride. Evening brings concerts and fireworks over Maputo Bay, with the city''s famous seafood restaurants hosting special celebration menus.',
 'The parade route along Avenida Eduardo Mondlane is the best viewing area — arrive by 8am for a good position. The atmosphere is patriotic and joyful, and visitors are welcomed warmly. Avoid taking photographs of military installations or personnel. Many businesses close for the day, so plan meals at restaurants that announce holiday hours.',
 6, 6, 'June 25', 'annual',
 NULL, true, 'high', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'maputo' LIMIT 1),
 'AZGO Festival', 'maputo-azgo-festival', 'festival',
 'Maputo''s contemporary music and arts festival showcases Mozambique''s thriving creative scene alongside international acts from across Africa and the Portuguese-speaking world. Held at the Praça de Touros (former bullring), the festival blends electronic music, hip-hop, marrabenta, and experimental art in a venue that captures Maputo''s unique Afro-Mediterranean character. Film screenings, art exhibitions, and panel discussions complement the music program, making it the cultural highlight of the Maputo calendar.',
 'Buy tickets online in advance as the festival regularly sells out. The Praça de Touros venue is centrally located and well-secured. Use official taxi services to return to your accommodation after evening shows. The festival crowd is young, cosmopolitan, and welcoming — it is an excellent place to meet creative Mozambicans and fellow travelers.',
 9, 9, 'September (varies yearly)', 'annual',
 NULL, false, 'moderate', 3),

-- Tofo
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'tofo' LIMIT 1),
 'Whale Shark Season', 'tofo-whale-shark-season', 'seasonal',
 'Tofo Beach is one of the world''s most reliable locations for swimming with whale sharks, with these gentle giants cruising through the warm Indian Ocean waters from October to March. The shallow continental shelf means encounters often happen surprisingly close to shore, and the visibility in Tofo''s waters is consistently excellent. Multiple dive operators run daily ocean safaris where the chances of encountering whale sharks, manta rays, and humpback whales border on guaranteed during peak season.',
 'Book with an established operator like Peri Peri Divers or Liquid Dive Adventures, who follow responsible wildlife interaction guidelines. No diving certification is needed — encounters are snorkel-based. The boat rides to the whale shark areas can be rough, so take motion sickness precautions. Morning departures offer calmer seas and better visibility.',
 10, 3, 'October to March', 'annual',
 NULL, false, 'moderate', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'tofo' LIMIT 1),
 'Manta Ray Migration', 'tofo-manta-migration', 'seasonal',
 'Tofo''s cleaning stations attract massive aggregations of reef manta rays year-round, but the largest gatherings — sometimes numbering over 40 individuals — occur from May to November when nutrient-rich upwellings bring plankton blooms. Diving at Manta Reef, just offshore from Tofo, means sharing the water with mantas whose wingspans exceed five meters as they glide through cleaning stations and feeding areas. Marine biologists from the Marine Megafauna Foundation in Tofo can identify individual mantas and share their life stories.',
 'You need an Open Water certification for the best manta dive sites, though some shallower encounters are possible while snorkeling. The Marine Megafauna Foundation welcomes volunteers and offers fascinating briefings on their research. Water temperatures drop to 22C in winter — a 5mm wetsuit is recommended. Book multi-dive packages for the best rates.',
 5, 11, 'May to November (peak aggregation)', 'annual',
 NULL, false, 'low', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'tofo' LIMIT 1),
 'Humpback Whale Season', 'tofo-humpback-season', 'seasonal',
 'From June to October, humpback whales migrate through the warm Mozambican waters on their journey from Antarctic feeding grounds to tropical breeding areas, and Tofo sits directly on their path. Boat-based whale watching excursions reveal breaching, tail slapping, and mother-calf pairs in waters so clear you can often see the whales beneath the surface. Some operators offer in-water encounters where snorkelers can observe humpbacks from a respectful distance — a profoundly moving wildlife experience.',
 'Whale watching trips depart early morning for the calmest conditions. In-water encounters are weather-dependent and not guaranteed, so book a boat-based trip first and add snorkel encounters if conditions allow. The ocean can be cold and rough in July-August, so bring a wetsuit top even for boat-only trips. Tofo''s small-town vibe makes it very safe for solo women.',
 6, 10, 'June to October', 'annual',
 NULL, false, 'low', 3),

-- =============================================
-- MYANMAR
-- =============================================

-- Bagan
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'bagan' LIMIT 1),
 'Thingyan (Water Festival)', 'bagan-thingyan', 'festival',
 'Myanmar''s most exuberant celebration marks the Buddhist New Year with four days of water throwing, merit-making, and temple visits across the ancient plain of Bagan. While Yangon and Mandalay host the wildest water fights, Bagan''s version centers on the temples themselves, with devotees washing sacred Buddha images in purification rituals and monks leading prayer ceremonies in pagodas scattered across the archaeological zone. The juxtaposition of 2,000 ancient temples with joyful modern celebration is uniquely powerful.',
 'The temple area is respectful and calm compared to the cities, but the main road through Nyaung-U village gets wild with water splashing. E-bikes are the best way to navigate between temples but get very slippery — ride cautiously. Wrap your camera gear in waterproof bags. Many restaurants close, so stock up at the market beforehand.',
 4, 4, 'April 13-16', 'annual',
 NULL, true, 'moderate', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'bagan' LIMIT 1),
 'Thadingyut Festival of Lights', 'bagan-thadingyut', 'festival',
 'For three days at the end of Buddhist Lent, Bagan''s thousands of temples and pagodas are illuminated with candles, oil lamps, and electric lights, creating a breathtaking panorama across the ancient plain. The festival celebrates Buddha''s descent from heaven, and devotees light every available surface — temple steps, compound walls, and pathways — with flickering flames. Watching the plain transform into a sea of golden light from an elevated viewpoint at dusk is one of Myanmar''s most magical visual experiences.',
 'Head to one of the permitted viewing mounds (Bagan authorities have closed most temple climbing) before 5pm to secure a viewpoint. The Bagan Viewing Tower, while controversial, offers 360-degree views of the illuminated plain. Bring a flashlight for navigating unpaved paths after dark. The atmosphere is peaceful and deeply spiritual — this is not a party event.',
 10, 10, 'Full moon of Thadingyut (October)', 'annual',
 NULL, true, 'moderate', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'bagan' LIMIT 1),
 'Hot Air Balloon Season', 'bagan-balloon-season', 'seasonal',
 'From October to March, hot air balloon flights over the temple-studded Bagan plain offer one of the most iconic travel experiences in Asia. Rising with the dawn mist, you float silently over 2,000 ancient stupas and pagodas as the sun paints the Irrawaddy River valley in shades of gold and amber. The flights, operated since 1999, have become synonymous with Bagan and regularly feature on lists of the world''s greatest bucket-list experiences.',
 'Book at least two months in advance with Balloons Over Bagan, the original and most experienced operator. Flights are weather-dependent, so schedule your balloon ride for the first possible morning and keep subsequent mornings free as backup. The 5am pickup is early but the sunrise views are worth every lost minute of sleep. Dress in warm layers as altitude and morning air are chilly.',
 10, 3, 'October to March', 'annual',
 NULL, false, 'low', 3),

-- Inle Lake
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'inle-lake' LIMIT 1),
 'Phaung Daw Oo Pagoda Festival', 'inle-lake-phaung-daw-oo', 'festival',
 'Inle Lake''s most important festival sees five sacred Buddha images transported across the lake on a spectacular golden barge shaped like a hintha (mythical bird), visiting lakeside villages over 18 days. Leg-rowing fishermen in traditional dress escort the barge while longboat races, traditional Shan performances, and merit-making ceremonies take place at each stop. The sight of the golden barge gliding across the mirror-calm lake surrounded by floating gardens and stilt villages is extraordinarily photogenic.',
 'Stay in Nyaungshwe or at one of the lake''s floating hotels and hire a boat for the day to follow the barge procession. Your hotel can help coordinate timing with the barge''s published route. The festival is deeply respectful and safe — dress modestly for temple visits. Bring sun protection as you will be on the water for hours.',
 9, 10, 'Eighteen days around the full moon of Thadingyut (September/October)', 'annual',
 NULL, true, 'moderate', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'inle-lake' LIMIT 1),
 'Thadingyut Festival of Lights', 'inle-lake-thadingyut', 'festival',
 'The end of Buddhist Lent on Inle Lake takes on a special beauty as thousands of candles and oil lamps illuminate the floating villages, monasteries, and stilt houses reflected in the lake''s still waters. Floating temples glow with offerings while families in longboats release fire lanterns into the night sky. The combination of flames reflected on water and floating lights ascending into the darkness creates one of Myanmar''s most serene and moving festival experiences.',
 'Arrange an evening boat ride through your hotel to experience the illuminations from the water. The lake gets cold after sunset, so bring warm layers and a blanket. Photography is challenging in low light, so bring a tripod or enjoy the moment without a screen. The floating villages are safe to visit during the festival.',
 10, 10, 'Full moon of Thadingyut (October)', 'annual',
 NULL, true, 'low', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'inle-lake' LIMIT 1),
 'Five-Day Rotating Market', 'inle-lake-rotating-market', 'seasonal',
 'One of Myanmar''s most fascinating cultural traditions, the five-day rotating market circuit around Inle Lake brings together Intha, Shan, Pa-O, and other ethnic groups who travel from surrounding hills to trade at a different lakeside village each day. The markets overflow with fresh produce, handwoven textiles, lacquerware, and traditional medicine, with vendors in distinctive ethnic dress creating a living ethnographic display. Following the market rotation gives you intimate access to communities rarely visited by tourists.',
 'Ask your hotel which village hosts the market on which day — the rotation follows a traditional calendar. Hire a boat to reach floating market villages, which are more authentic than the tourist-oriented Ywama floating market. Bring small bills as vendors rarely have change. The Pa-O women in their distinctive black turbans are happy to be photographed if you ask politely first.',
 1, 12, 'Every five days, year-round, rotating between villages', 'annual',
 NULL, true, 'moderate', 3),

-- Yangon
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'yangon' LIMIT 1),
 'Thingyan Water Festival', 'yangon-thingyan', 'festival',
 'Myanmar''s biggest party transforms Yangon into a citywide water fight for four days of New Year celebrations. Massive stages (mandats) pump music and blast high-pressure hoses at dancing crowds, while temple compounds host solemn water-pouring ceremonies on sacred Buddha images. The energy is extraordinary — millions of people fill the streets, and the combination of spiritual devotion and uninhibited celebration captures the dual nature of Myanmar culture. The atmosphere is joyful, inclusive, and unlike any other water festival in Asia.',
 'Stick to the organized mandat stages on Kaba Aye Pagoda Road and Inya Road for the safest and most fun experience. Avoid the stages with very loud music and heavy alcohol consumption. Waterproof everything — your phone, camera, passport, and cash. The streets can be chaotic, so keep your group small and maintain awareness of your surroundings.',
 4, 4, 'April 13-16', 'annual',
 NULL, true, 'high', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'yangon' LIMIT 1),
 'Thadingyut Festival of Lights', 'yangon-thadingyut', 'festival',
 'For three days, Yangon''s golden Shwedagon Pagoda and streets citywide blaze with candles, paper lanterns, and electric displays marking the end of Buddhist Lent and Buddha''s descent from heaven. The Shwedagon''s marble terraces overflow with devotees lighting thousands of candles while families release fire lanterns from the surrounding hills. The festival also marks the beginning of the kathina robe-offering season, with colorful processions carrying donations to monasteries across the city.',
 'Visit Shwedagon Pagoda at sunset on the first evening for the most spectacular illumination. The pagoda is safe and crowded with families — dress modestly with shoulders and knees covered, and remove shoes at the entrance. Taxis become scarce during the festival, so use Grab or arrange return transport in advance.',
 10, 10, 'Full moon of Thadingyut (October)', 'annual',
 NULL, true, 'high', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'yangon' LIMIT 1),
 'Shwedagon Pagoda Festival', 'yangon-shwedagon-festival', 'festival',
 'The annual festival at Yangon''s most sacred site transforms the Shwedagon Pagoda compound into a week-long celebration with traditional pwè (theatrical performances), fortune-telling, and an elaborate market selling religious artifacts, traditional medicine, and Burmese handicrafts. Monks from across the country gather for special prayers, and the pagoda''s gold-plated stupa — visible from almost anywhere in Yangon — shimmers with special lighting. The week-long event is the spiritual highlight of Yangon''s calendar.',
 'The pagoda compound is one of the safest public spaces in Yangon at any hour. Visit in the late afternoon for golden hour photography and stay through sunset when the compound is at its most atmospheric. The surrounding market stalls offer fair prices on lacquerware and gemstones, but compare prices at Bogyoke Market before buying.',
 3, 3, 'Full moon of Tabaung (March)', 'annual',
 NULL, true, 'high', 3),

-- =============================================
-- NAMIBIA
-- =============================================

-- Sossusvlei
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'sossusvlei' LIMIT 1),
 'Dawn Photography Season', 'sossusvlei-dawn-photography', 'seasonal',
 'The cooler months bring the clearest skies and most dramatic light conditions to the world''s highest sand dunes, with the famous Dune 45 and Big Daddy casting extraordinary shadows across the desert floor at sunrise. Photographers time their visits for the winter solstice period when the low-angle sun creates the sharpest contrast between the dunes'' orange-lit faces and blue-shadowed valleys. The iconic Deadvlei — a white clay pan dotted with 900-year-old dead camelthorn trees — becomes almost surreal in the long golden light.',
 'Enter the Sesriem gate at first light (gates open at sunrise, which is around 6:30am in winter). Drive the 60km to Sossusvlei or arrange a 4x4 shuttle. The NamibRand Nature Reserve lodges on the park boundary offer the earliest access. Bring warm layers as desert mornings can be near freezing, plus plenty of water for the dune climbs.',
 5, 8, 'May to August (dry winter season)', 'annual',
 NULL, false, 'low', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'sossusvlei' LIMIT 1),
 'Oryx Calving Season', 'sossusvlei-oryx-calving', 'seasonal',
 'Following the brief summer rains, the Namib Desert around Sossusvlei experiences a surge of life as gemsbok (oryx) calve in the sparse grasslands between the dunes. The sight of these magnificent antelope with their distinctive black-and-white masks and rapier-straight horns nursing young against the backdrop of rust-red dunes is quintessentially Namibian. The rains also bring brief green flushes to the desert floor, creating a striking contrast with the permanent orange sands.',
 'A self-drive 4x4 is the best way to explore the calving areas at your own pace. The gravel roads between Sesriem and Sossusvlei are well-maintained but carry extra water, fuel, and a spare tire. Wildlife viewing is best in the early morning and late afternoon. Namibia is one of Africa''s safest countries for solo women drivers.',
 1, 3, 'January to March (after summer rains)', 'annual',
 NULL, false, 'low', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'sossusvlei' LIMIT 1),
 'Dark Sky Stargazing', 'sossusvlei-dark-sky', 'seasonal',
 'The NamibRand Nature Reserve adjacent to Sossusvlei holds a Gold Tier International Dark Sky Reserve certification — one of only a handful on Earth — and the winter months offer the darkest skies and best views of the Milky Way core arching over the ancient desert. The Southern Hemisphere sky reveals celestial wonders invisible from the north: the Magellanic Clouds, the Southern Cross, and Omega Centauri globular cluster. Several lodges offer guided astronomy sessions with powerful telescopes.',
 'Book a lodge within NamibRand Nature Reserve (Wolwedans or Sossusvlei Desert Lodge) for the best stargazing, as they enforce strict light pollution controls. New moon periods offer the darkest skies. Bring binoculars at minimum — even basic ones reveal stunning detail. Winter nights drop below 5C, so pack warm layers for extended outdoor viewing sessions.',
 5, 9, 'May to September (dry winter, clearest skies)', 'annual',
 NULL, false, 'low', 3),

-- Swakopmund
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'swakopmund' LIMIT 1),
 'Küstenkarneval (Coastal Carnival)', 'swakopmund-kustenkarneval', 'festival',
 'Swakopmund''s German colonial heritage comes alive during this boisterous carnival featuring parades, costume competitions, live oompah bands, and traditional German food and beer in the heart of the Namibian desert. The main parade through the town''s art nouveau streets features elaborate floats, while the Mole (the old pier) hosts the carnival ball. It is a surreal and uniquely Namibian experience — lederhosen and bratwurst on the edge of the world''s oldest desert.',
 'The carnival atmosphere is family-friendly during the day and shifts to adult-oriented in the evening. Book a centrally located guesthouse to walk to all events. Swakopmund is one of Namibia''s safest towns, comfortable for solo exploration at any hour. Bring warm clothes — the Benguela Current keeps the coast surprisingly cold year-round.',
 4, 4, 'Late April (varies yearly)', 'annual',
 NULL, false, 'moderate', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'swakopmund' LIMIT 1),
 'Cape Fur Seal Pupping Season', 'swakopmund-seal-season', 'seasonal',
 'The massive Cape Cross seal colony, an hour north of Swakopmund, swells to over 200,000 animals during the November to January pupping season, creating one of the most extraordinary wildlife spectacles in Southern Africa. The beach becomes a chaotic nursery of mothers, pups, and territorial bulls, with the sounds and smells creating an overwhelming sensory experience. Kayak tours from Walvis Bay also offer close encounters with smaller seal groups in the harbor and along the coast.',
 'Visit Cape Cross early in the morning for cooler temperatures and more active seal behavior. The smell is powerful — some visitors find it overwhelming, so bring a scarf to cover your nose if sensitive. The boardwalk keeps you safely above the colony. Kayak tours from Walvis Bay are a gentler alternative with seals swimming alongside your boat.',
 11, 1, 'November to January', 'annual',
 NULL, false, 'moderate', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'swakopmund' LIMIT 1),
 'Flamingo Season at Walvis Bay', 'swakopmund-flamingo-season', 'seasonal',
 'The Walvis Bay lagoon, a 30-minute drive south of Swakopmund, hosts up to 50,000 greater and lesser flamingos during the peak season, turning the shallow waters into a shimmering pink carpet. The salt pans and mudflats also attract pelicans, terns, and migrating waders from the Northern Hemisphere, making this one of Southern Africa''s premier birding destinations. Guided kayak trips paddle through the flamingo flocks for an intimate, non-intrusive wildlife encounter.',
 'Kayak trips depart from Walvis Bay waterfront early morning for the calmest conditions and best light. The flamingo lagoon viewpoint on the road between Swakopmund and Walvis Bay is free and accessible by car. Bring binoculars and a telephoto lens. The lagoon area is safe during daylight but avoid walking alone on the beach after dark.',
 9, 4, 'September to April (peak December to February)', 'annual',
 NULL, true, 'moderate', 3),

-- Windhoek
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'windhoek' LIMIT 1),
 'Windhoek Karneval (WIKA)', 'windhoek-wika', 'festival',
 'Namibia''s premier cultural event celebrates the country''s German heritage with a week of parades, balls, concerts, and the famous Prince and Princess selection at the SKW (Sports Club Windhoek). The main street parade features elaborate floats, marching bands, and dance troupes from across the country, while the evening balls at the Windhoek Country Club are formal affairs with live orchestras. WIKA has evolved to include elements from all of Namibia''s diverse cultures, making it a genuine celebration of national identity.',
 'Book WIKA ball tickets well in advance as they sell out — formal dress is required. The daytime parade is free and family-friendly, best viewed from the veranda of Joe''s Beerhouse or the Craft Centre. Windhoek''s central area is safe during festival days with extra security present. Use registered taxis for transport to and from evening events.',
 4, 4, 'Late April (varies yearly)', 'annual',
 NULL, false, 'moderate', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'windhoek' LIMIT 1),
 'Namibia Annual Music Awards (NAMAs)', 'windhoek-namas', 'festival',
 'Namibia''s biggest night in music brings the country''s top artists together for a gala awards ceremony and concert series that showcases the extraordinary diversity of Namibian music — from Damara punch to Oshiwambo hip-hop to Afrikaans rock. The week surrounding the NAMAs features free outdoor concerts at the Independence Memorial Museum, club showcases across the city, and industry panels. It is the best window into Namibia''s vibrant contemporary music scene, which remains largely unknown outside the country.',
 'The awards ceremony requires tickets — check the NAMAs social media for sales. The free outdoor concerts at the Independence Memorial Museum are safe, well-organized, and a fantastic way to discover Namibian music. Stick to registered venues and taxis in the evening. The music community is welcoming and you will likely be invited to after-parties.',
 5, 5, 'May (varies yearly)', 'annual',
 NULL, false, 'moderate', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'windhoek' LIMIT 1),
 'Windhoek Oktoberfest', 'windhoek-oktoberfest', 'festival',
 'Namibia''s German-influenced brewing tradition — anchored by the beloved Windhoek Lager — comes alive during this celebration at the SKW grounds, complete with imported German bands, traditional food stalls, and flowing Namibian craft beer. The event has grown beyond its German roots to include Namibian braai culture, live local music, and family entertainment. The fusion of German beer garden tradition with Southern African warmth and hospitality creates something genuinely unique.',
 'The Oktoberfest grounds are well-secured and safe. Pace yourself with the beer — Namibian Lagers are stronger than they taste. Eat throughout the event at the excellent food stalls. Pre-book a taxi for your return journey as the taxi queue gets long after 10pm. The daytime sessions are more relaxed and family-friendly.',
 10, 10, 'Late October (varies yearly)', 'annual',
 NULL, false, 'moderate', 3),

-- =============================================
-- SINGAPORE
-- =============================================

-- Singapore
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'singapore' LIMIT 1),
 'Chinese New Year Celebrations', 'singapore-chinese-new-year', 'holiday',
 'Singapore''s Chinatown and the entire city-state transform during Chinese New Year with weeks of spectacular decorations, the famous Chingay Parade (Southeast Asia''s largest street performance), lion dances in every shopping mall, and the River Hongbao festival along Marina Bay. The light-up along Eu Tong Sen Street and New Bridge Road features enormous illuminated installations, while the Chingay Parade brings together 8,000 performers from dozens of countries in a multicultural extravaganza of floats, fireworks, and choreographed performances.',
 'Chinatown''s main streets become pedestrian-only zones during the festival — visit in the evening for the full light-up experience. The Chingay Parade along the F1 Pit Building requires tickets for grandstand seating but can be viewed for free from surrounding streets. Singapore is extremely safe at all hours, making solo evening exploration comfortable. MRT trains run later during the festival period.',
 1, 2, 'Two weeks around Chinese New Year (January/February)', 'annual',
 NULL, true, 'high', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'singapore' LIMIT 1),
 'National Day', 'singapore-national-day', 'holiday',
 'Singapore''s birthday celebration on August 9 is a spectacular display of national pride featuring a military parade, fighter jet flyovers, helicopter flag displays, and a massive fireworks show over Marina Bay. The National Day Parade (NDP) — whether at the Padang, National Stadium, or Marina Bay floating platform — is the most sought-after ticket in Singapore, with rehearsal shows in the preceding weekends nearly as impressive as the main event. The entire nation tunes in and the atmosphere of multicultural unity is genuinely moving.',
 'Free tickets to NDP and preview shows are distributed by ballot — register on the official NDP website months in advance. If you miss the ballot, the preview shows on preceding Saturdays are nearly identical. Marina Bay Sands area and the Esplanade offer free viewing of the fireworks. Public transport runs extended hours. Expect road closures around the ceremony area.',
 8, 8, 'August 9 (previews on preceding Saturdays)', 'annual',
 NULL, true, 'high', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'singapore' LIMIT 1),
 'Mid-Autumn Festival (Lantern Festival)', 'singapore-mid-autumn', 'festival',
 'Gardens by the Bay and the Chinese Garden light up with thousands of elaborate lantern installations during the Mid-Autumn Festival, while Chinatown''s streets host mooncake-making workshops, cultural performances, and a massive lantern-lit bazaar. The festival celebrates the harvest moon with traditional storytelling, tea ceremonies, and the sharing of mooncakes — richly filled pastries that are Singapore''s most gifted seasonal food. The Gardens by the Bay''s massive themed lantern walk, with installations reflecting on both tradition and innovation, is world-class.',
 'Visit Gardens by the Bay on a weekday evening to avoid weekend crowds at the lantern installations. The Chinatown bazaar is best experienced after 7pm when the lanterns are fully lit and the atmosphere peaks. Try mooncakes from traditional bakeries like Tai Chong Kok rather than hotel-branded versions — they are more authentic and less expensive. MRT to Chinatown station puts you right in the heart of festivities.',
 9, 9, 'Mid-Autumn Festival date varies (September/October)', 'annual',
 NULL, true, 'high', 3),

-- =============================================
-- SOUTH AFRICA
-- =============================================

-- Cape Town
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'cape-town' LIMIT 1),
 'Cape Town Jazz Festival', 'cape-town-jazz-festival', 'festival',
 'Africa''s grandest jazz festival brings together 40+ artists across five stages at the Cape Town International Convention Centre for two nights of world-class music spanning jazz, Afrobeat, soul, and contemporary African sounds. The festival attracts a sophisticated, diverse crowd and has hosted legends from Hugh Masekela to Gregory Porter. The surrounding fringe program fills the city''s clubs and restaurants with free performances throughout the week, making the entire Mother City feel like it is swinging.',
 'Book festival tickets early as they sell out months in advance. Stay in the City Bowl or Waterfront area for walking access to the CTICC venue. Use Uber or Bolt for transport after the shows — do not walk alone at night in the CBD. The festival crowd is friendly and welcoming, and the multi-stage format means you will naturally meet other music lovers between sets.',
 3, 3, 'Last weekend of March', 'annual',
 NULL, false, 'high', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'cape-town' LIMIT 1),
 'Kaapse Klopse (Cape Minstrel Carnival)', 'cape-town-klopse', 'parade',
 'On January 2 (Tweede Nuwe Jaar), thousands of minstrels in brilliantly colored satin suits parade through the streets of central Cape Town playing banjos, guitars, and ghoema drums in a tradition dating back to the emancipation of enslaved people in the 1800s. The troupes — many representing multigenerational Cape Coloured families — compete in singing, marching, and costume competitions over several weekends. The Klopse is uniquely Cape Town: joyful, defiant, and deeply rooted in the city''s complex history.',
 'The main parade on January 2 runs along Darling Street to the Bo-Kaap — arrive before 10am for the best viewing near City Hall. Stay with the crowd and keep valuables minimal. The atmosphere is overwhelmingly friendly and festive. Subsequent competition weekends at Athlone Stadium are accessible by MyCiTi bus and offer a more organized viewing experience.',
 1, 2, 'January 2 (main parade); competitions through February', 'annual',
 NULL, true, 'high', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'cape-town' LIMIT 1),
 'Whale Season in False Bay', 'cape-town-whale-season', 'seasonal',
 'From June to November, southern right whales migrate into the sheltered waters of False Bay and Walker Bay to calve and nurse, making Cape Town one of the world''s best land-based whale watching destinations. The cliff paths at Hermanus (90 minutes from the city) offer grandstand views of breaching whales, while closer locations like Simon''s Town and Kalk Bay provide occasional sightings from coastal restaurants. A dedicated whale crier in Hermanus blows a kelp horn to alert the town when whales are spotted.',
 'Hermanus is an easy day trip from Cape Town — rent a car or join an organized tour. The cliff path is free, safe, and well-maintained. September and October are peak months for breaching behavior. Bring binoculars for the best experience. The coastal drive via Chapman''s Peak is stunning but do not stop in isolated pulloffs alone — use busy, populated viewpoints.',
 6, 11, 'June to November (peak September-October)', 'annual',
 NULL, true, 'moderate', 3),

-- Durban
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'durban' LIMIT 1),
 'Durban July (Vodacom Durban July)', 'durban-durban-july', 'sports',
 'Africa''s greatest horse racing event at Hollywoodpark Greyville Racecourse is as much about fashion as it is about thoroughbreds. South Africa''s most glamorous spectators compete in best-dressed competitions while world-class horses thunder down the track in the country''s richest race. The surrounding Durban July season fills the city with parties, fashion shows, and cultural events for the entire week. If you attend one social event in South Africa, this should be it.',
 'Book grandstand tickets months in advance — the event sells out. Dress code is strictly enforced: think dramatic statement hat, cocktail dress, and heels. Arrive by noon for the best atmosphere, though the main race runs in the afternoon. Use Uber for transport as parking is chaotic and drinking is inevitable. The venue is well-secured with visible security throughout.',
 7, 7, 'First Saturday of July', 'annual',
 NULL, false, 'high', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'durban' LIMIT 1),
 'Diwali Festival of Lights', 'durban-diwali', 'holiday',
 'Durban is home to the largest Indian diaspora community in Africa, and the city''s Diwali celebrations rival those in parts of India. The suburb of Chatsworth and the city center light up with spectacular displays while temples throughout the city host prayer ceremonies, cultural performances, and community feasts. The Hare Krishna Temple of Understanding in Chatsworth hosts the largest celebrations, with fireworks, traditional dance, and vegetarian feasts welcoming visitors of all faiths.',
 'The Temple of Understanding celebrations are open to all and provide a genuinely immersive Diwali experience. Dress modestly and remove shoes when entering temple spaces. The Victoria Street Market (Durban''s Indian quarter) is excellent for Diwali sweets and sari shopping. Use Uber rather than walking between venues after dark in the CBD.',
 10, 11, 'Varies by Hindu calendar (October/November)', 'annual',
 NULL, true, 'moderate', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'durban' LIMIT 1),
 'Sardine Run', 'durban-sardine-run', 'seasonal',
 'Every winter, billions of sardines migrate along the KwaZulu-Natal coast in one of nature''s greatest wildlife spectacles, attracting feeding frenzies of dolphins, sharks, whales, and diving seabirds visible from Durban''s beaches and by boat. The predator action — pods of hundreds of dolphins corralling bait balls while Bryde''s whales lunge through them — is genuinely jaw-dropping. Dive operators run sardine run trips from Durban and the South Coast for those wanting to witness the action underwater.',
 'The sardine run timing is unpredictable — the best strategy is to book a flexible trip with a reputable dive operator like Blue Wilderness who follow the shoals daily. Shark encounters are common during sardine run dives, so discuss your comfort level with the operator. Land-based viewing from uMdloti and Ballito beaches north of Durban is free and often spectacular during peak runs.',
 6, 7, 'June to July (timing varies)', 'annual',
 NULL, false, 'moderate', 3),

-- Johannesburg
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'johannesburg' LIMIT 1),
 'Arts Alive International Festival', 'johannesburg-arts-alive', 'festival',
 'Johannesburg''s premier arts festival takes over venues across the city for ten days of music, theater, dance, visual arts, and spoken word that reflect the energy and creativity of Africa''s largest city. The festival has launched careers of numerous South African artists and its commitment to free outdoor events makes world-class culture accessible to all. The Inner City stages, particularly at Newtown Junction and Mary Fitzgerald Square, pulse with the sounds of jazz, kwaito, and contemporary African music late into the night.',
 'Stick to organized festival venues in Newtown, Braamfontein, and Maboneng, which have additional security during the event. Do not walk between venues after dark — use Uber or Bolt between locations. The daytime visual arts trails in Maboneng are safe for solo exploration. The Neighbourgoods Market on Saturday morning is a great pre-festival warming up spot.',
 9, 9, 'September (varies yearly)', 'annual',
 NULL, false, 'high', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'johannesburg' LIMIT 1),
 'Joburg Open (Golf)', 'johannesburg-joburg-open', 'sports',
 'The European Tour co-sanctioned Joburg Open brings international golf to the Randpark Golf Club, offering spectators the chance to watch world-class players navigate one of South Africa''s premier courses. The tournament atmosphere is relaxed and sociable compared to the stuffier European events, with excellent food and drink options around the course. The event also serves as a gateway to the South African golf season, with many international players arriving early to acclimatize to the Highveld altitude.',
 'Daily tickets are reasonably priced and available at the gate. The Randpark club area is safe and well-organized, with Uber pickup and drop-off zones. Bring sunscreen, a hat, and water — the Johannesburg sun at altitude is deceptively strong. Walking shoes are essential as the course covers hilly terrain. The clubhouse restaurant is a good spot to watch play on the 18th green.',
 11, 11, 'November (varies yearly)', 'annual',
 NULL, false, 'low', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'johannesburg' LIMIT 1),
 'Heritage Day (National Braai Day)', 'johannesburg-heritage-day', 'holiday',
 'September 24 celebrates South Africa''s cultural diversity, and Johannesburg marks it with braais (barbecues) in every park, neighborhood events featuring traditional dress from all 11 official language groups, and cultural performances at Constitution Hill and the Apartheid Museum. The day has been informally adopted as National Braai Day, uniting all South Africans around the shared love of cooking meat over coals. The combination of earnest cultural programming and jubilant outdoor socializing captures Joburg''s spirit perfectly.',
 'Join an organized Heritage Day event at Constitution Hill or Melrose Arch for a safe, curated experience. The public braai gatherings at Zoo Lake and Delta Park are friendly and welcoming to visitors, but attend with someone you know rather than alone. Dress casually and bring a contribution if joining a group braai — a pack of boerewors (sausage) from Woolworths is always appreciated.',
 9, 9, 'September 24', 'annual',
 NULL, true, 'moderate', 3),

-- Kruger National Park
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'kruger-national-park' LIMIT 1),
 'Dry Season Wildlife Viewing', 'kruger-dry-season', 'seasonal',
 'The dry winter months transform Kruger into one of Africa''s finest wildlife destinations as thinning vegetation and shrinking water sources concentrate animals around remaining waterholes and rivers. Elephant herds of 50+, lion prides, and rare wild dog packs become remarkably visible as they gather at predictable water points. The lack of rain also means fewer mosquitoes, cooler daytime temperatures, and the golden savanna light that makes African wildlife photography so iconic.',
 'Self-drive is the most flexible and affordable option — book a SANParks rest camp bungalow well in advance (6+ months for peak season). Enter the gates at opening time (6am) for the best predator sightings. Keep windows up when near large predators. Kruger''s rest camps are safe and well-fenced, with communal cooking areas where solo travelers naturally meet other visitors.',
 5, 10, 'May to October', 'annual',
 NULL, false, 'moderate', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'kruger-national-park' LIMIT 1),
 'Birding Season (Summer Migrants)', 'kruger-birding-summer', 'seasonal',
 'From October to March, Kruger''s resident 500+ bird species are joined by hundreds of migrant species from Europe, Central Asia, and northern Africa, pushing the park''s avian diversity past 500 species. Breeding plumage transforms otherwise drab birds into spectacular displays of color, and the summer rains bring insect blooms that trigger feeding frenzies visible from every rest camp. For birders, Kruger in summer offers one of the most species-rich experiences in the world, with everything from massive martial eagles to jewel-like sunbirds.',
 'Bring a field guide (Sasol Birds of Southern Africa is the standard) and binoculars. The birding hides at Lower Sabie and Satara camps are excellent for close-range photography. Early morning walks with armed rangers include expert birding commentary. The summer heat is intense, so carry water and take midday breaks at camp. The increased vegetation makes mammal sightings harder but the birding is unrivaled.',
 10, 3, 'October to March', 'annual',
 NULL, false, 'low', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'kruger-national-park' LIMIT 1),
 'Wildflower Season', 'kruger-wildflower-season', 'seasonal',
 'The first rains of October trigger an explosion of wildflowers across Kruger''s grasslands and woodlands, with over 2,000 plant species producing blooms that carpet the savanna in waves of color. The impala lily (Adenium multiflorum), Kruger''s most iconic flower, produces stunning pink-and-white blooms on bare branches, while fields of fireball lilies, wild gladioli, and flame creepers transform the landscape. Combined with the arrival of migrant butterflies and the greening of the bush, spring in Kruger is a sensory feast beyond the Big Five.',
 'Drive slowly and stop frequently — the wildflowers are best appreciated up close, and stopping for flowers often reveals interesting insects, reptiles, and small mammals. The Pretoriuskop area in the southwest has the richest floral diversity. Photography is best in the soft morning light. Rangers at rest camp reception desks can point you to the best current bloom locations.',
 10, 12, 'October to December', 'annual',
 NULL, false, 'low', 3),

-- =============================================
-- ZIMBABWE
-- =============================================

-- Harare
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'harare' LIMIT 1),
 'Harare International Festival of the Arts (HIFA)', 'harare-hifa', 'festival',
 'Zimbabwe''s flagship cultural event transforms Harare Gardens into a six-day celebration of African and international performing arts, attracting over 50,000 visitors to 200+ performances across eight stages. Theater, music, dance, circus, spoken word, and visual arts fill every corner of the park, with a strong emphasis on emerging Zimbabwean talent alongside international headliners. HIFA has become a symbol of creative resilience, maintaining world-class programming through decades of political and economic turbulence. The festival village atmosphere — with craft markets, food stalls, and bars — makes lingering between shows a pleasure.',
 'Buy a festival pass online for the best value and access. Harare Gardens is well-secured during HIFA with visible security throughout. Use registered taxis or arrange collection for evening shows. The festival crowd is cosmopolitan and friendly — it is the easiest place in Harare to meet creative, progressive Zimbabweans. Stay in the Avondale or Borrowdale suburbs for the safest accommodation options.',
 4, 5, 'Late April to early May (varies yearly)', 'annual',
 NULL, false, 'high', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'harare' LIMIT 1),
 'Zimbabwe International Film Festival (ZIFF)', 'harare-ziff', 'festival',
 'This growing film festival screens African and international independent films across venues in Harare, with a strong focus on Zimbabwean storytelling and emerging filmmakers from across the continent. Screenings at the Rainbow Towers, Alliance Française, and independent cinemas are complemented by workshops, masterclasses, and Q&A sessions with directors. The festival provides a rare window into contemporary Zimbabwean perspectives through film, a medium that captures the country''s complexity in ways that journalism often cannot.',
 'Check the festival program online and book screenings at the Alliance Française, which is the most comfortable and centrally located venue. Evening screenings are safe within the venue compound. The filmmaker Q&A sessions are intimate and welcoming — do not hesitate to ask questions. Use registered taxis or Uber between venues.',
 8, 9, 'Late August to early September (varies yearly)', 'annual',
 NULL, false, 'low', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'harare' LIMIT 1),
 'Independence Day Celebrations', 'harare-independence-day', 'holiday',
 'April 18 marks Zimbabwe''s independence from British colonial rule in 1980, with the main celebrations held at the National Sports Stadium in Harare featuring military parades, traditional dance performances from all provinces, and speeches. The streets fill with flag-waving crowds, and the atmosphere combines patriotic pride with genuine celebration. Outside the official events, neighborhoods host braais and parties, and the city''s restaurants and bars put on special menus.',
 'The National Sports Stadium events are open to the public — arrive early for seating. The atmosphere is peaceful and celebratory. Avoid political commentary with strangers, as opinions on the government vary widely. Many businesses close for the day, so plan meals at hotels or restaurants that confirm holiday hours. Stay in established tourist areas for evening celebrations.',
 4, 4, 'April 18', 'annual',
 NULL, true, 'high', 3),

-- Masvingo
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'masvingo' LIMIT 1),
 'Great Zimbabwe Cultural Festival', 'masvingo-great-zimbabwe-festival', 'festival',
 'The ruins of Great Zimbabwe — the medieval stone city that gives the country its name — host an annual cultural festival celebrating Shona heritage with traditional music, mbira (thumb piano) performances, ancestral ceremonies, and craft demonstrations within the UNESCO World Heritage walls. Walking through the Great Enclosure while mbira players perform in the acoustically perfect stone chambers is a spine-tingling experience that connects you directly to 800 years of history. The festival draws traditional healers, storytellers, and artisans from across the country.',
 'Stay at the Lodge at the Ancient City, which is adjacent to the ruins and the most convenient accommodation. The site is well-managed by National Museums and Monuments and feels safe. Bring comfortable walking shoes for the uneven stone paths. Hiring a knowledgeable local guide enhances the experience immeasurably — book through your lodge.',
 5, 5, 'May (varies yearly, sometimes September)', 'annual',
 NULL, false, 'moderate', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'masvingo' LIMIT 1),
 'Mutirikwi Fishing Season', 'masvingo-mutirikwi-fishing', 'seasonal',
 'Lake Mutirikwi (formerly Lake Kyle), just outside Masvingo, offers excellent bass and bream fishing during the warmer months when the fish are most active and the lake levels are high from summer rains. The lake''s setting — surrounded by granite hills dotted with msasa trees that turn golden in spring — is spectacular even for non-anglers. The adjacent Kyle Recreational Park is home to rhino, giraffe, and zebra, making it possible to combine fishing with a game drive in a single day.',
 'The Kyle Recreational Park chalets offer affordable lakeside accommodation. Bring your own fishing gear as rental options are limited. The park is fenced and safe for walking during daylight. Combine a fishing morning with an afternoon game drive — the park is small enough to see most wildlife in a few hours. Masvingo town has reliable Econet mobile coverage for safety.',
 10, 3, 'October to March', 'annual',
 NULL, false, 'low', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'masvingo' LIMIT 1),
 'Msasa Tree Color Change', 'masvingo-msasa-season', 'seasonal',
 'In August and September, the msasa trees that dominate Zimbabwe''s eastern highlands burst into spectacular displays of copper, gold, and wine-red new growth before the spring rains arrive. The hills around Masvingo and Great Zimbabwe become a patchwork of warm autumn-like colors that rival New England''s fall foliage. The phenomenon, caused by new leaves flushing with protective anthocyanin pigments before turning green, creates a uniquely African seasonal display that few international visitors know about.',
 'Drive the roads between Masvingo and Mutare through the eastern highlands for the most dramatic msasa displays. The color change peaks in late August to early September. Combine with a visit to Great Zimbabwe for a full day trip. The roads are in reasonable condition but a higher-clearance vehicle is recommended for side roads. Fuel up in Masvingo before heading into rural areas.',
 8, 9, 'August to September', 'annual',
 NULL, true, 'low', 3),

-- Victoria Falls
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'victoria-falls' LIMIT 1),
 'Vic Falls Carnival', 'victoria-falls-carnival', 'festival',
 'The three-day Vic Falls Carnival rings in the New Year with live music, street parties, and a carnival parade through the town of Victoria Falls, all set against the thundering backdrop of the world''s largest waterfall. International and African headlining acts perform on outdoor stages, while adventure activities — bungee jumping, white-water rafting, helicopter flights — run throughout the festival with special New Year rates. The combination of world-class natural wonder and concentrated festivity makes this one of the most spectacular New Year celebrations in Africa.',
 'Book accommodation months in advance as the town is small and fills completely for the carnival. Stay at a reputable hotel or lodge rather than Airbnb for better security. The town is compact and walkable during daylight, but use hotel transport after dark. The carnival attracts a young, party-oriented crowd — pace yourself with drinks and keep your group together at night.',
 12, 1, 'December 29-31', 'annual',
 NULL, false, 'high', 1),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'victoria-falls' LIMIT 1),
 'High Water Season', 'victoria-falls-high-water', 'seasonal',
 'From February to May, the Zambezi River reaches its peak flow and Victoria Falls becomes the largest curtain of falling water on Earth, with 500 million liters cascading over the basalt lip every minute. The spray column rises 400 meters into the air and is visible from 50 kilometers away, creating its own microclimate of permanent rain around the viewing points. The sheer power and volume of water during peak flow is almost incomprehensible — this is nature at its most overwhelming and humbling.',
 'Bring a waterproof jacket and dry bag for your camera — the spray at the main viewing points on the Zimbabwe side is like standing in a tropical rainstorm. Waterproof phone pouches are essential. The paths can be slippery, so wear shoes with good grip. March and April offer the best combination of high water and reasonable spray visibility. The Zimbabwe side offers the best panoramic views.',
 2, 5, 'February to May (peak in April)', 'annual',
 NULL, false, 'moderate', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'victoria-falls' LIMIT 1),
 'Devil''s Pool Season', 'victoria-falls-devils-pool', 'seasonal',
 'From mid-August to late December, when the Zambezi''s flow drops sufficiently, a natural rock pool forms at the very edge of the 108-meter precipice on the Zambian side of Victoria Falls. Swimming in Devil''s Pool — peering over the edge of the world''s largest waterfall with nothing but a submerged rock lip between you and the abyss — is one of Africa''s most thrilling experiences. Licensed guides lead small groups across Livingstone Island to the pool, with the low water revealing geological features hidden during the floods.',
 'Book the Livingstone Island experience through Tongabezi Lodge or the Royal Livingstone, who hold the exclusive operating license. The Zambian side requires a separate visa or day trip arrangement from Zimbabwe. The activity is professionally managed and statistically very safe, despite appearances. Morning sessions offer better light for photographs. You must be a reasonably confident swimmer.',
 8, 12, 'Mid-August to late December (water level dependent)', 'annual',
 NULL, false, 'moderate', 3)

ON CONFLICT (slug) DO NOTHING;
