-- =============================================================================
-- Migration: Expand city_events with additional events for cities that need them
-- =============================================================================
-- This EXPANSION migration adds more events on top of the base coverage.
-- A companion migration (20260225_seed_events_missing_cities.sql) handles the
-- 31 cities that previously had zero events (3 events each).
--
-- Priority 1: South Africa (4-5 additional events per city)
-- Priority 2: Southeast Asia thin cities (1-4 events each)
-- Priority 3: Interesting additions to already-covered cities (Japan, Morocco,
--             Portugal, South Korea)
--
-- Uses ON CONFLICT (slug) DO NOTHING so this migration is safe to re-run.
-- City IDs resolved via subquery on cities.slug.
-- =============================================================================

INSERT INTO city_events (id, city_id, name, slug, event_type, description, solo_tip, start_month, end_month, specific_dates, recurrence, year, is_free, crowd_level, order_index)
VALUES

-- =============================================
-- PRIORITY 1: SOUTH AFRICA
-- =============================================

-- Cape Town — additional events (base migration adds Jazz Fest, Klopse, Whale Season at order 1-3)
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'cape-town' LIMIT 1),
 'Open Book Festival', 'cape-town-open-book-festival', 'festival',
 'Africa''s premier literary festival transforms the Company''s Garden precinct into a haven for readers, writers, and thinkers over five days every September. Panel discussions, author readings, and workshops draw Nobel laureates, Booker winners, and rising African voices to intimate venues where audiences sit close enough to ask real questions. The programming ranges from investigative journalism to poetry slams to children''s storytelling, and the festival''s commitment to featuring African women writers makes it particularly resonant for intellectual solo travelers.',
 'Most events are held at the Fugard Theatre and City Hall, both walkable from the Company''s Garden. Book individual event tickets online — the popular headliners sell out, but you can often walk into panel discussions. The festival bar between sessions is where the best conversations happen. Use Uber after evening events.',
 9, 9, 'Five days in mid-September', 'annual',
 NULL, false, 'moderate', 4),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'cape-town' LIMIT 1),
 'Kirstenbosch Summer Concerts', 'cape-town-kirstenbosch-concerts', 'seasonal',
 'Every Sunday from November through March, the sloping lawns of Kirstenbosch National Botanical Garden fill with picnickers and music lovers for sunset concerts backed by the dramatic eastern slopes of Table Mountain. The lineup spans local jazz, Afro-pop, indie, and international acts, but the setting is the real star — watching the sun slip behind the mountain as music drifts across one of the world''s great botanical gardens is a quintessential Cape Town experience. Arrive early with a blanket, a bottle of local wine, and something from the food stalls.',
 'Gates open at 4pm for the 5:30pm concerts — arrive by 4:30pm for the best lawn spots on the upper terrace. The concerts are incredibly safe and family-friendly. Bring a jacket as temperatures drop sharply once the sun sets behind the mountain. Parking fills quickly, so Uber is the stress-free option. Solo concert-goers are common and the vibe is welcoming.',
 11, 3, 'Sundays, November through March', 'annual',
 NULL, false, 'moderate', 5),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'cape-town' LIMIT 1),
 'Cape Town Carnival', 'cape-town-carnival', 'parade',
 'Tens of thousands line Green Point''s Fan Walk for this spectacular street parade that has grown into one of Africa''s largest carnival events. Over 30 floats and 2,000 performers — from dance troupes to stilt walkers to giant puppets — celebrate Cape Town''s multicultural identity with costumes, live music, and choreography that rival Carnival in Trinidad. The event is distinctly Cape Townian: a joyful fusion of Cape Malay, Xhosa, Afrikaner, and contemporary cultures set against the backdrop of the illuminated Cape Town Stadium.',
 'The parade runs along the Fan Walk near the Stadium — positions near the start of the route give you the best views before the crowds thicken. The event is well-policed and family-friendly. Dress in layers as the evening sea breeze can be cold. Use MyCiTi bus or Uber to and from Green Point. Street food vendors line the route, so come hungry.',
 3, 3, 'A Saturday evening in mid-March', 'annual',
 NULL, true, 'high', 6),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'cape-town' LIMIT 1),
 'Two Oceans Marathon', 'cape-town-two-oceans', 'sports',
 'Regarded as one of the most beautiful road races on Earth, this 56km ultra-marathon traces a breathtaking route from Newlands past the vineyards of Constantia, along the False Bay coast, over Chapman''s Peak Drive, and back through Hout Bay and the Atlantic seaboard. Even if you are not running, the spectator experience — cheering runners through some of the most spectacular coastal scenery on the planet — is an event in itself. The associated half marathon (21km) draws 16,000 runners and is more accessible for recreational athletes.',
 'The half marathon is open to international entries — register early on the Two Oceans website as it sells out. Spectators should head to Chapman''s Peak (around the 35km mark) for the most dramatic viewing point. The race expo at the CTICC is free and great for picking up local running gear. Race day transport is well-organized with shuttle buses from the city centre.',
 4, 4, 'Easter Saturday (March or April)', 'annual',
 NULL, false, 'high', 7),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'cape-town' LIMIT 1),
 'Franschhoek Cap Classique & Champagne Festival', 'cape-town-franschhoek-cap-classique', 'festival',
 'The exquisite Franschhoek Valley — 45 minutes from Cape Town — hosts South Africa''s premier celebration of Méthode Cap Classique, the country''s answer to Champagne. Twenty-plus estates open their tasting rooms for a weekend of sparkling wine paired with artisanal food, live jazz, and vineyard picnics framed by the Hottentots Holland mountains. The quality of South African bubbly consistently stuns international critics, and this festival is the most elegant way to discover it.',
 'Book the hop-on, hop-off Franschhoek Wine Tram for the most relaxed way to visit multiple estates without driving. Saturday is busier but has more energy; Sunday is quieter and more indulgent. Most estates offer individual tasting flights (R80-150) beyond the festival pass. Spend the night at a Franschhoek guesthouse to fully enjoy the evening wine dinners. Uber does not reliably serve Franschhoek, so pre-arrange transport or drive.',
 12, 12, 'First weekend of December', 'annual',
 NULL, false, 'moderate', 8),

-- Durban — additional events (base migration adds Durban July, Diwali, Sardine Run at order 1-3)
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'durban' LIMIT 1),
 'Essence Festival Durban', 'durban-essence-festival', 'festival',
 'This Afrofuturist celebration on the Durban beachfront merges live music, fashion, art installations, and cultural discourse into a multi-day experience that pulses with Black creativity and innovation. International headliners share stages with South Africa''s hottest acts, while the conference track features panels on entrepreneurship, wellness, and identity. The energy is electric — Durban''s warm Indian Ocean air, its diverse population, and the festival''s intentional celebration of Black women''s voices create an atmosphere unlike any other music festival on the continent.',
 'Stay at a beachfront hotel on the Golden Mile for walking access to festival venues. The festival is well-secured with visible private security. Book VIP or premium tickets for the best sightlines and lounge access. The daytime panels and workshops are less crowded and often more rewarding than the headline concerts. Use Uber for transport after dark — do not walk along the beachfront late at night.',
 11, 11, 'Three days in early November', 'annual',
 NULL, false, 'high', 4),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'durban' LIMIT 1),
 'Durban International Film Festival', 'durban-film-festival', 'festival',
 'Africa''s oldest and most prestigious film festival screens over 200 films across ten days at the Durban ICC and independent cinemas, with a fierce focus on African storytelling, documentary, and emerging talent. The industry programme draws filmmakers and distributors from across the continent, while public screenings offer audiences rare access to films that may never see wide release. The Talent Campus, modeled on the Berlinale programme, nurtures the next generation of African filmmakers and welcomes observers.',
 'Festival passes offer the best value — check the DIFF website for early-bird pricing. The ICC screenings are comfortable and centrally located. The filmmaker Q&As are intimate and genuinely interesting — sit near the front and do not be shy about asking questions. The festival crowd is intellectual, progressive, and welcoming to solo attendees. Evening social events at the Suncoast precinct are safe within the venue.',
 7, 7, 'Ten days in mid-July', 'annual',
 NULL, false, 'moderate', 5),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'durban' LIMIT 1),
 'Umhlanga Reed Dance', 'durban-umhlanga-reed-dance', 'seasonal',
 'Each September, tens of thousands of young Zulu women gather at the eNyokeni Royal Palace in Nongoma (three hours from Durban) for the annual Reed Dance ceremony honoring the Zulu King and celebrating feminine virtue. The spectacle of participants in traditional beadwork carrying tall reeds across the valley to the royal kraal is one of Southern Africa''s most visually stunning cultural events. As a respectful spectator, you witness living heritage that connects directly to centuries of Zulu tradition.',
 'This is a deeply sacred ceremony — respectful observation is welcomed, but intrusive photography and inappropriate clothing are not. Wear modest clothing and always ask before photographing individuals. Arrange transport through a reputable Durban tour operator who understands the protocol. The ceremony takes place over several days; the main reed presentation is typically on Saturday. Bring water and sun protection as shade is limited.',
 9, 9, 'A weekend in mid-September', 'annual',
 NULL, true, 'high', 6),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'durban' LIMIT 1),
 'Midmar Mile', 'durban-midmar-mile', 'sports',
 'The world''s largest open-water swimming event draws over 16,000 swimmers to Midmar Dam in the KwaZulu-Natal Midlands for a one-mile race across the dam. The event is remarkably inclusive — from Olympic swimmers to first-timers — and the festive atmosphere around the dam, with braais, music, and spectators on the grassy banks, makes it a genuine community celebration. The Midlands setting, with rolling green hills and misty mornings, adds a pastoral beauty to the sporting spectacle.',
 'Enter online well in advance — the race fills its 16,000 spots quickly. The Midlands are an easy 90-minute drive from Durban. Arrive early on race day for parking and warmup. The water temperature in February is comfortable but a swim cap is mandatory. The post-race atmosphere on the dam banks is friendly and celebratory. Combine the trip with a drive along the Midlands Meander for artisan food and craft stops.',
 2, 2, 'A weekend in mid-February', 'annual',
 NULL, false, 'high', 7),

-- Johannesburg — additional events (base migration adds Arts Alive, Joburg Open, Heritage Day at order 1-3)
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'johannesburg' LIMIT 1),
 'Joy of Jazz Festival', 'johannesburg-joy-of-jazz', 'festival',
 'South Africa''s premier jazz festival takes over the Sandton Convention Centre for three nights of world-class performances spanning classic jazz, Afro-jazz, neo-soul, and contemporary improvisation. The festival consistently books legends — past lineups have included Herbie Hancock, Cassandra Wilson, and Hugh Masekela — alongside South Africa''s extraordinary jazz talent. The venue''s multiple stages allow you to curate your own journey through the program, and the late-night jam sessions in the festival bar often produce the most memorable moments.',
 'Three-day passes offer the best value and sell out — book through Computicket or the festival website. Sandton is one of Johannesburg''s safest areas, with hotels, restaurants, and the Gautrain station all within walking distance of the venue. Dress up — the Joy of Jazz crowd takes style seriously. Solo jazz lovers will find kindred spirits at every turn; the festival attracts a sophisticated, friendly audience.',
 9, 9, 'Last weekend of September', 'annual',
 NULL, false, 'high', 4),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'johannesburg' LIMIT 1),
 'Design Indaba', 'johannesburg-design-indaba', 'conference',
 'While headquartered in Cape Town, Design Indaba''s influence radiates through Johannesburg''s creative districts with satellite events, exhibitions, and the annual Most Beautiful Object in South Africa award. This world-class design and creativity conference brings together architects, industrial designers, graphic artists, and social innovators from across Africa and beyond. The programming challenges conventional thinking about African design, showcasing everything from sustainable fashion to urban planning to interactive technology with a distinctly Pan-African lens.',
 'The main conference in Cape Town streams to satellite venues in Johannesburg — check the Design Indaba website for Joburg-specific programming. Braamfontein galleries and studios often host fringe events during conference week. The Neighbourgoods Market in Braamfontein on Saturday morning is a natural gathering point for the creative community. Stick to Braamfontein, Maboneng, and Rosebank for safe solo exploration of the design scene.',
 2, 3, 'Late February to early March', 'annual',
 NULL, false, 'moderate', 5),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'johannesburg' LIMIT 1),
 'Maboneng First Thursdays', 'johannesburg-first-thursdays', 'festival',
 'On the first Thursday of every month, Johannesburg''s regenerated Maboneng Precinct throws open its gallery doors for a free art walk that has become the city''s most vibrant regular cultural event. Studios, pop-up exhibitions, street food vendors, and live music spill onto Fox Street and the surrounding blocks, drawing a young, diverse, creative crowd that embodies the optimism of new Johannesburg. The energy peaks from October through March when warm evenings keep the streets buzzing until late.',
 'Arrive by 5pm to explore galleries in daylight before the evening atmosphere builds. Stick to the main Fox Street corridor between Arts on Main and the Hallmark Building — this area is well-patrolled by Maboneng security. Do not wander into surrounding streets after dark. Park in the Arts on Main garage or use Uber. The rooftop bar at Living Room offers a safe perch with views over the precinct.',
 1, 12, 'First Thursday of every month', 'annual',
 NULL, true, 'moderate', 6),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'johannesburg' LIMIT 1),
 'Constitution Hill Heritage Day Experience', 'johannesburg-constitution-hill-heritage', 'holiday',
 'On September 24, Constitution Hill — the powerful complex that housed Mandela, Gandhi, and thousands of political prisoners — opens its doors for free guided tours, cultural performances, and exhibitions that confront South Africa''s painful past while celebrating its democratic present. The Old Fort, Women''s Jail, and Number Four prison blocks tell stories of resistance and resilience, while the Constitutional Court building represents the country''s commitment to human rights. The programming on Heritage Day is particularly moving, with former inmates and activists sharing testimony.',
 'Arrive early for the free guided tours, which are offered every 30 minutes and fill quickly on Heritage Day. The Women''s Jail section is especially powerful for women visitors. Wear comfortable walking shoes as the complex covers a large area. Constitution Hill is in Braamfontein, which is safe during the day with visible security. Use Uber for arrival and departure. Allow at least three hours for a thorough visit.',
 9, 9, 'September 24', 'annual',
 NULL, true, 'moderate', 7),

-- Kruger National Park — additional events (base migration adds Dry Season, Birding, Wildflower at order 1-3)
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'kruger-national-park' LIMIT 1),
 'Calving Season', 'kruger-calving-season', 'seasonal',
 'From November through January, the Kruger bushveld comes alive with newborn impala, wildebeest, zebra, and kudu as the summer rains trigger a synchronized birthing season that has evolved to overwhelm predators with sheer numbers. The abundance of vulnerable young animals draws lions, leopards, cheetahs, and wild dogs into a frenzy of hunting activity, making this the most dramatic period for predator-prey interactions in the park. Waterholes become natural theaters where the cycle of life plays out in real time against a backdrop of lush green savanna.',
 'Self-drive visitors should focus on open grasslands near Satara and Lower Sabie camps, where predator activity peaks during calving season. Early morning drives (gates open at 4:30am in summer) offer the best chances of witnessing hunts. The summer heat is intense by midday, so plan a camp siesta and head out again for the golden afternoon light. Book rest camps 6+ months ahead as this is peak domestic holiday season.',
 11, 1, 'November to January', 'annual',
 NULL, false, 'moderate', 4),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'kruger-national-park' LIMIT 1),
 'Bird Migration Arrival', 'kruger-bird-migration-arrival', 'seasonal',
 'October marks the dramatic arrival of over 200 migratory species from Europe, Central Asia, and northern Africa, transforming Kruger into one of the most biodiverse birding destinations on Earth. European rollers, woodland kingfishers, and white storks appear alongside spectacular breeding displays from resident species — weavers build elaborate nests, paradise flycatchers trail their impossibly long tails, and martial eagles perform aerial courtship dances. The dawn chorus in the riverside camps reaches a volume and complexity that has to be heard to be believed.',
 'The birding hides at Lower Sabie, Satara, and Punda Maria are excellent for close-range observation without disturbing the birds. Bring binoculars and the Roberts Bird Guide app for identification. The guided morning bush walks with armed rangers include expert birding commentary and access to areas off-limits to vehicles. Camp reception desks maintain sighting boards that include notable bird observations.',
 10, 3, 'October to March, peak arrival in October-November', 'annual',
 NULL, false, 'low', 5),

-- =============================================
-- PRIORITY 2: SOUTHEAST ASIA — THIN CITIES
-- =============================================

-- Thailand

-- Koh Tao (has 1 event: Songkran) — add from order_index 2
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'koh-tao' LIMIT 1),
 'Koh Tao Freediving Championship', 'koh-tao-freediving-championship', 'sports',
 'This tiny island punches far above its weight in the freediving world, hosting competitive events that draw breath-hold athletes from across Asia and Europe to its crystal-clear waters. The competition takes place off the island''s deeper western coast, with spectators watching from boats as divers descend to extraordinary depths on a single breath. Koh Tao''s status as the world''s cheapest place to learn diving means the island buzzes with an infectious energy around all things underwater, and the championship weekend amplifies that tenfold.',
 'If you are interested in freediving, book an introductory course with Apnea Total or Blue Immersion before the event — many schools offer championship spectator packages that include boat access. The competition viewing boats fill quickly, so register early. The after-parties at the beach bars are lively and welcoming. Koh Tao is small and walkable, but bring a headlamp for the unlit paths at night.',
 10, 10, 'A weekend in October (dates vary)', 'annual',
 NULL, false, 'moderate', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'koh-tao' LIMIT 1),
 'Muay Thai Beach Festival', 'koh-tao-muay-thai-festival', 'festival',
 'Koh Tao''s growing reputation as a Muay Thai training destination culminates in this beach-side festival where fighters from the island''s gyms compete in bouts staged on sand rings overlooking the Gulf of Thailand. Between fights, there are pad-work demonstrations, clinch workshops, and the kind of cross-cultural camaraderie that emerges when people from thirty countries share the intensity of combat sport training. The atmosphere is equal parts athletic spectacle and island party.',
 'Several gyms on Koh Tao welcome female drop-in students — try a session at Monsoon Gym or Kobra Muay Thai to experience the culture before the festival. The fights are on the beach and free to watch. Position yourself near the judges for the best view. The festival crowd is friendly and inclusive. Bring mosquito repellent for the evening beach events.',
 3, 3, 'Varies (typically March or April)', 'annual',
 NULL, true, 'moderate', 3),

-- Koh Phangan (has 2 events: Full Moon Party, Loy Krathong) — add from order_index 3
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'koh-phangan' LIMIT 1),
 'Wonderfruit Festival', 'koh-phangan-wonderfruit', 'festival',
 'Often described as the Burning Man of Asia, Wonderfruit is a four-day arts, music, and sustainability festival held on the Siam Country Club fields near Pattaya — but Koh Phangan''s community of long-term creative residents means the island buzzes with pre- and post-Wonderfruit energy every December. The island hosts its own satellite gatherings, sound healings, and conscious community events that channel the festival''s ethos of blending electronic music with environmental activism, farm-to-table dining, and immersive art installations.',
 'While the main Wonderfruit festival is near Pattaya, the Koh Phangan satellite events are more intimate and affordable. Check community boards at Orion Healing Centre and The Yoga Retreat for satellite event listings. December is peak season on the island, so book accommodation well in advance. The conscious community gatherings are genuinely welcoming to solo women travelers.',
 12, 12, 'Mid-December (satellite events)', 'annual',
 NULL, false, 'moderate', 3),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'koh-phangan' LIMIT 1),
 'Thong Nai Pan Full Moon Yoga Retreat', 'koh-phangan-full-moon-yoga', 'seasonal',
 'Koh Phangan''s quieter northeast coast hosts monthly full moon yoga and meditation retreats that offer a profound alternative to the notorious beach parties on the other side of the island. The Thong Nai Pan bay setting — jungle-backed, calm-watered, accessible only by boat or a winding mountain road — creates a natural sanctuary. Multi-day programs combine yoga, breathwork, sound healing, and community meals under the full moon, attracting a thoughtful international crowd seeking depth over debauchery.',
 'Book at least a week ahead through retreat centers like Orion or Wonderland — the monthly full moon programs are popular. The mountain road to Thong Nai Pan is steep and unpaved — take a songthaew (shared taxi) rather than riding a scooter at night. The retreats typically include meals and are excellent value. Solo women make up the majority of participants, so you will be in good company.',
 1, 12, 'Monthly, around the full moon', 'annual',
 NULL, false, 'low', 4),

-- Koh Lanta (has 2 events: Lanta Lanta, Songkran) — add from order_index 3
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'koh-lanta' LIMIT 1),
 'Old Town Chinese New Year', 'koh-lanta-chinese-new-year', 'holiday',
 'Koh Lanta''s charming Old Town — a stilted fishing village built by Chinese and Malay settlers — celebrates Lunar New Year with a warmth and authenticity that larger Thai cities cannot match. Red lanterns string between the weathered wooden shophouses, dragon dances weave through the narrow streets, and families set out offerings and feast tables that spill onto the waterfront. The Old Town''s mixed Chinese-Muslim heritage gives the celebration a unique local character, with halal and Chinese dishes served side by side.',
 'Stay in or near Old Town for the full experience — the Mango House and Sriraya are excellent guesthouses within walking distance. The celebrations are family-oriented and extremely safe. Try the homemade Chinese pastries from the Old Town bakeries, which produce special batches for the holiday. The festivities wind down by 10pm, making it a lovely early evening experience.',
 1, 2, 'Varies by lunar calendar, late January to mid-February', 'annual',
 NULL, true, 'moderate', 3),

-- Koh Samui (has 2 events: Songkran, Buffalo Fighting) — add from order_index 3
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'koh-samui' LIMIT 1),
 'Samui Regatta', 'koh-samui-regatta', 'sports',
 'One of Asia''s most prestigious yacht races, the Samui Regatta draws sleek racing keelboats and classic wooden vessels from across the region for a week of competitive sailing off the island''s northeast coast. The races run each morning while the afternoons and evenings shift to beachfront parties, awards dinners, and the convivial social scene that defines Asian sailing culture. Even non-sailors find the spectacle of dozens of yachts rounding marks against the backdrop of Koh Samui''s coconut palms utterly compelling.',
 'Spectators can watch races from the beach at Chaweng Noi or book a spectator boat through the regatta office. The nightly parties at the host resort are open to the public with ticket purchase. The regatta attracts a sophisticated, international crowd and is one of the safer social environments on the island. May is shoulder season, so accommodation is significantly cheaper than peak months.',
 5, 5, 'Five days in late May', 'annual',
 NULL, false, 'moderate', 3),

-- Chiang Rai (has 2 events: Songkran, Flower Festival) — add from order_index 3
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'chiang-rai' LIMIT 1),
 'Doi Tung Flower Festival', 'chiang-rai-doi-tung-flower', 'festival',
 'The Mae Fah Luang Garden on Doi Tung mountain erupts into color during this annual flower festival, with over a million winter-blooming plants arranged in elaborate displays across the hillside gardens that were once the personal project of the late Princess Mother. The festival showcases temperate flowers — cherry blossoms, poinsettias, and salvias — that thrive in Chiang Rai''s cooler highland climate, set against sweeping views of the Myanmar and Laos borders. The botanical precision and artistic arrangement of the displays rival anything in Japan or Europe.',
 'The Mae Fah Luang Garden is a 45-minute drive from Chiang Rai city — rent a car or arrange a driver through your hotel. Weekday mornings offer the best light and fewest crowds. The garden''s Doi Tung Lodge serves excellent Northern Thai food with mountain views. Combine the visit with a stop at the Doi Tung Development Project coffee shop, which sells outstanding single-origin coffee from the surrounding hillside farms.',
 12, 1, 'December to late January', 'annual',
 NULL, false, 'moderate', 3),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'chiang-rai' LIMIT 1),
 'Akha Swing Festival', 'chiang-rai-akha-swing', 'festival',
 'High in the mountains around Chiang Rai, the Akha hill tribe communities celebrate their annual Swing Festival with four days of rituals centered on a towering bamboo swing constructed in the village center. Young women in elaborate silver headdresses and embroidered jackets take turns on the swing while elders perform blessing ceremonies, musicians play traditional instruments, and the entire village shares feasts of mountain rice and forest foods. The festival marks the end of the rice-planting season and is one of the most visually striking cultural events in northern Thailand.',
 'Visit with a responsible guide who has genuine relationships with the Akha community — ask your hotel to recommend someone from the village itself, not a city-based operator. Dress modestly and ask permission before photographing anyone. Bring a small gift for the village (school supplies are always appreciated). The mountain roads require a 4x4 or experienced motorbike rider. The festival atmosphere is warm and visitors who show genuine respect are welcomed.',
 8, 8, 'Four days in late August (exact dates follow the Akha calendar)', 'annual',
 NULL, true, 'low', 4),

-- Pai (has 2 events: Jazz & Blues, Loy Krathong) — add from order_index 3
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'pai' LIMIT 1),
 'Love Strawberry Festival', 'pai-love-strawberry', 'festival',
 'This delightfully quirky small-town celebration transforms Pai''s walking street into a strawberry wonderland every February, with stalls selling strawberry smoothies, strawberry ice cream, strawberry wine, and increasingly creative strawberry-themed everything. Local farms open for picking, there are strawberry-decorated parade floats, and the whole affair has a charming, slightly absurd energy that perfectly captures Pai''s laid-back personality. The festival coincides with the peak of the cool season when the surrounding mountains are at their greenest and the air is crisp.',
 'The walking street festivities run from late afternoon through the evening. Pai is small enough to walk everywhere during the festival. The strawberry farms on the outskirts of town (particularly Love Strawberry Pai) offer picking experiences in the morning — arrive before 10am when the fruit is freshest. February nights in Pai are genuinely cold, so bring a warm layer for the evening market browsing.',
 2, 2, 'A weekend in mid-February', 'annual',
 NULL, true, 'moderate', 3),

-- Krabi (has 2 events: Songkran, Loy Krathong) — add from order_index 3
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'krabi' LIMIT 1),
 'Krabi Andaman Festival', 'krabi-andaman-festival', 'festival',
 'Krabi''s biggest annual celebration fills the town''s beachfront promenade with cultural performances, traditional southern Thai cuisine, longtail boat races, and a beauty pageant that the entire province takes extremely seriously. The festival showcases the unique culture of Thailand''s Andaman coast — the blend of Thai, Chinese, and sea gypsy (Chao Ley) heritage that gives the region its distinctive character. Evening concerts featuring Thai country music (luk thung) and southern rock bands keep the waterfront buzzing until late.',
 'The festival is held on Krabi''s mainland waterfront, not on the islands — stay in Krabi Town or Ao Nang. The food stalls are the highlight: look for fresh Andaman seafood, khanom jeen (rice noodle curry), and roti from the Muslim vendors. The atmosphere is family-friendly and very safe. Take a longtail boat to the islands during the day and return for the evening festivities.',
 11, 11, 'Three to five days in mid-November', 'annual',
 NULL, true, 'high', 3),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'krabi' LIMIT 1),
 'Rock Climbing Festival', 'krabi-rock-climbing-festival', 'sports',
 'Railay Beach and Tonsai — home to some of the most spectacular limestone sport climbing in the world — host an annual climbing festival that draws athletes from across Asia for competitions, workshops, and the sheer joy of pulling on perfect limestone above turquoise water. The festival includes categories for all levels, deep-water soloing demonstrations (climbing above the sea with no ropes), and evening film screenings on the beach. The climbing community in Krabi is notably inclusive, with strong female representation.',
 'Book accommodation at Railay or Tonsai well ahead of the festival — these small beach communities fill quickly. Basecamp Tonsai and Wee''s Climbing School offer introductory courses if you want to try climbing before the event. The deep-water soloing demonstrations are free to watch from the beach. Bring water shoes for the rocky paths between Railay and Tonsai at low tide.',
 11, 12, 'A weekend in late November or early December', 'annual',
 NULL, false, 'moderate', 4),

-- Phuket (has 3 events: Vegetarian Festival, Songkran, Loy Krathong) — add from order_index 4
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'phuket' LIMIT 1),
 'King''s Cup Regatta', 'phuket-kings-cup-regatta', 'sports',
 'Asia''s most prestigious sailing event fills the waters off Kata Beach with over 100 yachts from 30 countries, competing in classes from high-performance racing boats to traditional Thai longtails. Founded in 1987 to honor the King of Thailand''s birthday, the regatta has grown into a week-long celebration of sailing culture that includes daily races, beach parties, and the legendary awards ceremonies. The sight of spinnakers blooming against Phuket''s limestone karsts is one of the most photogenic sporting spectacles in Asia.',
 'Watch races from the headland between Kata and Kata Noi beaches for the best panoramic views. The nightly parties at the host hotel (typically Kata Beach Resort) are open to non-sailors with ticket purchase. December is Phuket''s best weather month — clear skies, calm seas, and lower humidity. The regatta crowd is international and sociable. Kata Beach is one of Phuket''s safest areas for solo travelers.',
 12, 12, 'Five days in early December', 'annual',
 NULL, false, 'moderate', 4),

-- Bangkok (has 4 events: Songkran, Loy Krathong, Chinese New Year, King's Birthday) — add from order_index 5
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'bangkok' LIMIT 1),
 'Bangkok Design Week', 'bangkok-design-week', 'festival',
 'For ten days every January, Bangkok''s historic Charoenkrung district transforms into an open-air design exhibition as architects, artists, and creatives take over warehouses, shophouses, and street corners with installations, workshops, and pop-up galleries. The festival has catalyzed the regeneration of this centuries-old riverside neighborhood, and the programming — spanning industrial design, fashion, urban planning, and social innovation — reflects Thailand''s emergence as a serious creative economy. Walking the festival route is like peeling back layers of Bangkok''s history while glimpsing its future.',
 'The Charoenkrung district is walkable but sprawling — wear comfortable shoes and use the festival map app. Many installations are free. The neighborhood''s heritage shophouse cafes and restaurants are worth exploring beyond the festival sites. The area is well-patrolled during Design Week and safe for solo exploration during the day. Take the BTS to Saphan Taksin and walk or grab a short taxi ride to the main festival area.',
 1, 2, 'Ten days in late January to early February', 'annual',
 NULL, true, 'moderate', 5),

-- Chiang Mai (has 4 events: Songkran, Flower Festival, Yi Peng, Loy Krathong) — add from order_index 5
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'chiang-mai' LIMIT 1),
 'Chiang Mai Design Week', 'chiang-mai-design-week', 'festival',
 'This emerging festival positions Chiang Mai as Southeast Asia''s creative capital, with exhibitions, talks, and workshops scattered across the Old City''s temples, galleries, and co-working spaces. The programming focuses on craft-meets-technology: traditional Northern Thai lacquerware alongside 3D printing, centuries-old weaving techniques reimagined through digital design, and sustainable architecture that draws on Lanna building traditions. The intimate scale means you can attend a talk by a world-class designer in the morning and workshop with a master ceramicist in the afternoon.',
 'Most events are concentrated in the Old City and Nimmanhaemin area, both easily navigable by bicycle or on foot. Check the festival website for the programme — many workshops require advance registration. The TCDC (Thailand Creative & Design Center) is the festival hub with free exhibitions. The co-working cafes around Nimman become informal networking spaces during the festival. December is Chiang Mai''s best weather month — cool, dry, and clear.',
 12, 12, 'A week in early December', 'annual',
 NULL, true, 'moderate', 5),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'chiang-mai' LIMIT 1),
 'Bo Sang Umbrella Festival', 'chiang-mai-bo-sang-umbrella', 'festival',
 'The village of Bo Sang, twenty minutes east of Chiang Mai, has produced handpainted paper umbrellas for over 200 years, and this annual festival celebrates the craft with parades of elaborately decorated parasols, live painting demonstrations, a beauty contest featuring contestants in traditional Lanna dress sheltered by the signature umbrellas, and a market selling the artisans'' work at village prices. The sight of hundreds of hand-painted umbrellas lining the village road creates a tunnel of color that is uniquely photogenic.',
 'Hire a songthaew (red truck taxi) from Chiang Mai''s Old City to Bo Sang — the journey takes about 20 minutes and costs minimal fare. The parade is best on Saturday morning, but the workshops and market run all weekend. Watch the artisans paint in real time and commission a custom design on a full-size umbrella for a fraction of what it would cost in the city. The festival is family-friendly and very safe.',
 1, 1, 'Third weekend of January', 'annual',
 NULL, true, 'moderate', 6),

-- Vietnam

-- Da Lat (has 2 events: Flower Festival, Tet) — add from order_index 3
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'da-lat' LIMIT 1),
 'Da Lat Coffee Festival', 'da-lat-coffee-festival', 'festival',
 'Vietnam''s Central Highlands are responsible for making the country the world''s second-largest coffee producer, and Da Lat sits at the heart of this booming specialty coffee scene. The annual festival celebrates the region''s shift from commodity robusta to world-class arabica with cupping sessions, barista competitions, farm tours, and talks by the farmers and roasters driving Vietnam''s third-wave coffee revolution. The cool mountain air, French colonial architecture, and misty pine forests make Da Lat feel more like a European hill station than a Southeast Asian city.',
 'The main festival events are held in Xuan Huong Lake park and the surrounding streets. Visit the specialty roasters year-round — La Viet Coffee, The Married Beans, and K''Ho Coffee (which sources from indigenous K''Ho farmers) are must-visits. The farm tours are the highlight: book through your hotel or directly with roasters. Da Lat''s compact size makes walking or cycling the best way to explore. Bring a light jacket — mornings and evenings are genuinely cool.',
 3, 3, 'Three to four days in March (dates vary)', 'annual',
 NULL, false, 'moderate', 3),

-- Da Nang (has 2 events: Fireworks Festival, Tet) — add from order_index 3
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'da-nang' LIMIT 1),
 'Ba Na Hills Beer Festival', 'da-nang-ba-na-beer-festival', 'festival',
 'The fantastical Ba Na Hills resort, perched 1,400 meters above Da Nang and accessed by the world''s longest single-track cable car, hosts an annual beer festival that combines German-style Oktoberfest revelry with the surreal setting of a French colonial village in the Vietnamese clouds. Craft breweries from across Vietnam pour alongside international brands, with live music, traditional dance performances, and the kind of mist-wreathed mountain scenery that makes every photo look like a fantasy film set. The Golden Bridge — held aloft by giant stone hands — is the backdrop to it all.',
 'Buy the Ba Na Hills day pass which includes the cable car, beer festival entry, and access to all attractions. The cable car queues are shortest before 9am. Wear layers — the mountain summit is significantly cooler than the coast. The last cable car down leaves at 9pm during festival nights. Book accommodation in Da Nang''s My Khe beach area for easy access to the cable car station at the base.',
 10, 10, 'A weekend in late October', 'annual',
 NULL, false, 'high', 3),

-- Hoi An (has 3 events: Lantern Festival, Tet, Mid-Autumn) — add from order_index 4
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'hoi-an' LIMIT 1),
 'Full Moon Night Market', 'hoi-an-full-moon-night-market', 'festival',
 'On the 14th day of every lunar month, Hoi An''s ancient town turns off its electric lights and illuminates entirely by silk lanterns and candles, creating what may be the most magical regular evening event in all of Southeast Asia. The Thu Bon River fills with floating candles released by locals and visitors making wishes, the Japanese Covered Bridge glows amber in the lamplight, and the night market stalls sell handmade crafts and street food in the soft luminescence. It is an experience that transcends tourism — the town has been doing this for centuries.',
 'The ancient town is pedestrian-only on full moon nights — arrive before sunset to watch the transition from daylight to lantern-glow, which is genuinely breathtaking. Buy a paper lantern (VND 10,000) from the bridge and release it into the river with a wish. The restaurants along Bach Dang Street offer front-row river views but charge premium prices — the side-street eateries are cheaper and often better. Walk slowly and soak it in.',
 1, 12, 'Monthly, on the 14th of each lunar month', 'annual',
 NULL, true, 'high', 4),

-- Hanoi (has 3 events: Tet, Mid-Autumn, Food Festival) — add from order_index 4
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'hanoi' LIMIT 1),
 'Water Puppet Season', 'hanoi-water-puppet-season', 'seasonal',
 'Hanoi''s Thang Long Water Puppet Theatre performs this centuries-old Vietnamese art form year-round, but the experience peaks from October through March when cooler weather fills the 300-seat lakeside theater to capacity every evening. The puppeteers stand waist-deep behind a bamboo screen, manipulating elaborate wooden figures that dance, battle dragons, and harvest rice on the surface of a pool, accompanied by live traditional musicians. The art form originated in the Red River Delta when farmers performed on flooded rice paddies, and its survival in modern Hanoi is a testament to Vietnamese cultural resilience.',
 'Book tickets at the theater box office on Dinh Tien Hoang Street (next to Hoan Kiem Lake) in the morning for the same evening''s performance — online booking is unreliable. The 50-minute shows run at 4pm, 5pm, 6:30pm, and 8pm daily. The 6:30pm show is the most atmospheric as the lake outside darkens during the performance. Combine with an evening stroll around Hoan Kiem Lake and dinner in the Old Quarter.',
 10, 3, 'Year-round, best October to March', 'annual',
 NULL, false, 'moderate', 4),

-- Indonesia

-- Canggu (has 2 events: Nyepi, Galungan) — add from order_index 3
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'canggu' LIMIT 1),
 'Ogoh-Ogoh Parade', 'canggu-ogoh-ogoh', 'parade',
 'The night before Nyepi (Bali''s Day of Silence), communities across the island construct and parade giant papier-mache demon effigies called ogoh-ogoh through the streets in a spectacular display of artistic creativity and spiritual catharsis. In Canggu, the main parade route runs along Jalan Batu Bolong and the surrounding streets, with each banjar (neighborhood council) competing to create the most elaborate and terrifying monster. The effigies are carried on bamboo platforms by teams of young men, spun at intersections to confuse evil spirits, and finally burned in a dramatic climax.',
 'The parades begin after dark (around 7pm) and the Batu Bolong road gets extremely crowded. Position yourself near a major intersection where the ogoh-ogoh are spun — this is the most dramatic moment. The atmosphere is joyful despite the demonic imagery. Keep belongings secure in the crowd. After the parade, eat early — by 6am the next morning, the entire island goes silent for 24 hours during Nyepi. No one may leave their accommodation, lights must be off, and the airport closes.',
 3, 3, 'Night before Nyepi (typically March)', 'annual',
 NULL, true, 'high', 3),

-- Ubud (has 3 events: Nyepi, Writers Festival, Galungan) — add from order_index 4
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'ubud' LIMIT 1),
 'Saraswati Day', 'ubud-saraswati-day', 'holiday',
 'On this sacred day honoring the Hindu goddess of knowledge, wisdom, and the arts, every book, manuscript, and written object in Bali receives offerings of flowers and incense. In Ubud — the island''s cultural capital — the celebration is particularly vibrant: temple ceremonies overflow with devotees in ceremonial white, traditional dance performances fill the palace courtyard, and the town''s many libraries and bookshops set out offerings on their shelves. The Saraswati Water Temple in Ubud center becomes a sea of flowers and prayer.',
 'Dress modestly in white or light colors if visiting temples — a sarong and sash are required and can be borrowed at temple entrances. The main ceremony at Pura Taman Saraswati (the Ubud Water Palace) is open to respectful visitors. Photography is permitted but be discreet during prayers. The day before Saraswati, locals traditionally abstain from reading and writing — a lovely forced digital detox if you choose to observe it.',
 1, 12, 'Every 210 days on the Balinese calendar (roughly twice yearly)', 'annual',
 NULL, true, 'moderate', 4),

-- Seminyak (has 2 events: Nyepi, Bali Arts Festival) — add from order_index 3
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'seminyak' LIMIT 1),
 'Kuta Karnival', 'seminyak-kuta-karnival', 'festival',
 'This beach festival spanning the Kuta-Seminyak-Legian coastline celebrates Bali''s surf culture with kite-flying competitions, sand sculpture contests, beach volleyball tournaments, traditional boat races, and live music stages set up directly on the sand. The kite competition is the visual highlight — Balinese kite-making is a serious art form, with teams constructing and flying enormous traditional bebean (fish), janggan (dragon), and pecukan (leaf) kites that can reach 10 meters in length. The festival brings together Bali''s expatriate and local communities in a rare shared celebration.',
 'The kite competition takes place on Kuta Beach in the morning when winds are strongest — arrive by 9am for the best displays. The beach stages have free entry. The Seminyak end of the festival is more sophisticated (cocktail bars, boutique stalls) while the Kuta end is more raucous. Wear sunscreen, a hat, and reef-safe sunblock if swimming. The festival area is busy but well-patrolled by beach security.',
 10, 10, 'A long weekend in October', 'annual',
 NULL, true, 'high', 3),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'seminyak' LIMIT 1),
 'Galungan & Kuningan', 'seminyak-galungan-kuningan', 'holiday',
 'This ten-day Balinese Hindu celebration — marking the victory of dharma (good) over adharma (evil) — transforms all of Bali with tall bamboo penjor poles arching over every road, elaborate temple offerings, and families dressed in ceremonial finery processing to their neighborhood temples. In Seminyak, the otherwise hedonistic beach strip takes on a spiritual dimension as villa staff, restaurant workers, and shopkeepers pause their tourist-facing roles to participate in one of their most important religious observances. The contrast between the sacred and the secular is fascinating.',
 'Galungan and Kuningan occur every 210 days on the Balinese calendar, so dates shift. Check a Balinese calendar for exact dates during your visit. Be respectful of ceremonies blocking roads — delays are part of the experience. Many restaurants and shops reduce hours during Galungan, so plan meals accordingly. Visiting a family temple ceremony is possible if invited — dress modestly in a sarong and accept any offerings of food graciously.',
 1, 12, 'Every 210 days on the Balinese calendar (roughly twice yearly)', 'annual',
 NULL, true, 'moderate', 4),

-- Gili Islands (has 1 event: Nyepi) — add from order_index 2
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'gili-islands' LIMIT 1),
 'Gili Eco Trust Beach Cleanup & Festival', 'gili-eco-trust-cleanup', 'festival',
 'The Gili Eco Trust organizes monthly beach cleanups that have evolved into genuine community events, drawing together dive instructors, long-term travelers, local business owners, and visiting volunteers for a morning of environmental action followed by afternoon festivities. The cleanups focus on different beaches each month, with data collection contributing to marine debris research. The post-cleanup gathering at a rotating beach bar features live music, donated food and drinks, and presentations on the islands'' conservation successes — including the biorock coral restoration program visible while snorkeling.',
 'Check the Gili Eco Trust Instagram for monthly cleanup dates and meeting points. Bring gloves if you have them, though supplies are provided. The cleanups start at 9am and finish by noon. The social gathering afterward is one of the best ways to meet the islands'' community. The Eco Trust also offers coral gardening volunteer sessions and turtle hatchery visits that are excellent solo activities.',
 1, 12, 'Monthly (typically first or second Friday)', 'annual',
 NULL, true, 'low', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'gili-islands' LIMIT 1),
 'Gili Full Moon Parties', 'gili-full-moon-parties', 'seasonal',
 'Each full moon, the bars on Gili Trawangan''s strip stage coordinated parties with fire dancers, guest DJs, and themed decorations that draw revelers from across the three islands. The vibe is more intimate and less chaotic than Koh Phangan — the island is tiny, everyone ends up barefoot on the same beach, and the absence of motorized vehicles means you can walk (or wobble) safely anywhere at any hour. The smaller Gili Air offers mellower full moon gatherings with acoustic music and beach bonfires for those seeking celebration without excess.',
 'Gili Trawangan''s main strip is safe and well-lit during full moon parties. Stay on Gili T if you want the party; stay on Gili Air for a calmer alternative with easy boat access. Keep your drinks in sight at all times. The islands have no police presence, so use common sense. Pre-book your return boat to Lombok or Bali, as boats fill quickly on the mornings after full moon.',
 1, 12, 'Monthly, on the full moon', 'annual',
 NULL, false, 'high', 3),

-- Yogyakarta (has 3 events: Sekaten, Waisak, Ramayana Ballet) — add from order_index 4
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'yogyakarta' LIMIT 1),
 'Sekaten Fair at the Sultan''s Palace', 'yogyakarta-sekaten-fair', 'festival',
 'For a week surrounding the Prophet Muhammad''s birthday, the alun-alun (main square) outside the Kraton (Sultan''s Palace) fills with a traditional fair featuring food stalls, carnival rides, puppet shows, and the ceremonial serving of gunungan — elaborate cone-shaped rice offerings that the public scrambles to collect for their blessing power. The fair is one of Java''s oldest continuously held celebrations, blending Islamic devotion with Javanese court tradition in a way that exists nowhere else in the Muslim world.',
 'The fair runs from late afternoon into the night — arrive by 4pm to explore in daylight before the evening energy builds. The gunungan ceremony at the Kraton is the spiritual highlight — ask at your hotel for the exact time. The food stalls around the alun-alun serve excellent Yogyanese street food: try gudeg, bakpia, and wedang ronde. The area is crowded but safe. Wear comfortable shoes as you will be walking on packed earth.',
 1, 12, 'Week surrounding Maulid Nabi (Islamic calendar, dates shift yearly)', 'annual',
 NULL, true, 'high', 4),

-- Philippines

-- El Nido (has 1 event: Pista) — add from order_index 2
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'el-nido' LIMIT 1),
 'El Nido Beach Volleyball Tournament', 'el-nido-beach-volleyball', 'sports',
 'The pristine white sand beaches of El Nido host an annual beach volleyball tournament that draws teams from across the Philippines and visiting athletes from the regional backpacker circuit. The competition runs on the main beach in town, with amateur and open divisions ensuring everyone from weekend players to semi-professionals can compete. Between matches, the beach transforms into a social hub with music, food stalls, and the relaxed energy that makes El Nido one of the most welcoming communities in Palawan.',
 'Registration is typically open to walk-in teams if you can find a partner — check with your hostel or the El Nido tourism office for details. Spectating is free from the beach. The tournament coincides with peak season, so book accommodation well in advance. The after-tournament parties at the beachfront bars are lively but manageable. El Nido town beach is safe for solo evening strolls.',
 4, 4, 'A weekend in April (dates vary)', 'annual',
 NULL, true, 'moderate', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'el-nido' LIMIT 1),
 'Pista ng El Nido', 'el-nido-pista-ng-el-nido', 'festival',
 'El Nido''s town fiesta is a week-long celebration culminating in a street-dancing competition where barangays (neighborhoods) compete with elaborately choreographed performances telling the story of El Nido''s relationship with the sea. Costumes made from natural materials — shells, dried seaweed, coconut husks — transform dancers into marine creatures against the backdrop of the limestone karst cliffs. The fiesta includes boat races, beauty pageants, and a palpable sense of community pride that welcomes visitors into the celebration.',
 'The street-dancing competition on the final Saturday is the highlight — secure a spot along Rizal Street by early morning. The fiesta is extremely family-friendly and safe. Bring cash as ATM availability in El Nido is limited during peak events. Join the evening barangay parties for an authentic local experience — Filipino hospitality means solo visitors are inevitably adopted by a group. Try the fresh seafood at the beachfront boodles (communal banana-leaf feasts).',
 5, 5, 'A week in May, culminating in the final Saturday', 'annual',
 NULL, true, 'high', 3),

-- Coron (has 1 event: Town Fiesta) — add from order_index 2
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'coron' LIMIT 1),
 'Coron Firefly Watching Season', 'coron-firefly-season', 'seasonal',
 'From March through May, the mangrove-lined estuaries around Coron come alive with thousands of synchronous fireflies that pulse in unison, turning entire trees into living Christmas decorations. The boat tours depart at dusk and glide silently through narrow waterways where the bioluminescent display is reflected in the still water, creating an effect like floating through a galaxy of green stars. This natural phenomenon occurs when male fireflies synchronize their flashing to attract mates, and the Coron mangroves host one of the densest populations in the Philippines.',
 'Book a firefly tour through your resort or a local operator — the smaller boats (6-8 people) offer a more intimate experience than the larger groups. Tours depart around 6:30pm and last about an hour. Turn off all lights and phones during the viewing — artificial light disrupts the synchronization. The experience is best on moonless nights. Wear long sleeves as mosquitoes are active in the mangroves.',
 3, 5, 'March to May (best on moonless nights)', 'annual',
 NULL, false, 'low', 2),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'coron' LIMIT 1),
 'Calamian Festival', 'coron-calamian-festival', 'festival',
 'This vibrant celebration of the indigenous Tagbanwa people and the broader Calamian Islands culture features traditional boat races, indigenous dance performances, a fluvial parade of decorated bancas (outrigger boats) through Coron Bay, and a week of street festivities. The festival honors the Tagbanwa''s deep connection to the sea and their role as the original guardians of Coron''s extraordinary marine environment, including the sacred Kayangan Lake. It is a rare opportunity to witness indigenous Filipino culture celebrated on its own terms.',
 'The fluvial parade across Coron Bay on the final day is the visual highlight — watch from the public pier or book a boat through your hotel. The street-dancing competition runs through Coron town and is free to watch. Engage respectfully with the Tagbanwa cultural presentations — these are a source of deep pride. Coron town is safe and walkable during the festival. The week-long timing means you can combine the festival with island-hopping tours on quieter days.',
 6, 6, 'A week in June (dates vary)', 'annual',
 NULL, true, 'high', 3),

-- Siquijor (has 1 event: Healing Festival) — add from order_index 2
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'siquijor' LIMIT 1),
 'Siquijor Day', 'siquijor-siquijor-day', 'festival',
 'September 17 marks the anniversary of Siquijor becoming its own province, and this small island celebrates with a week of activities including a beauty pageant, sports tournaments, a street-dancing competition, and the kind of community-wide partying that only a tight-knit island of 100,000 people can produce. Each of the six municipalities hosts events, and motorbike-touring between them reveals the island''s waterfalls, centuries-old balete trees, and turquoise coves. The celebration radiates genuine pride in the island''s identity — mystical, independent, and unapologetically different.',
 'Rent a motorbike to island-hop between municipal events — Siquijor is small enough to circuit in a few hours. The main events in Siquijor town (the capital) include the street-dancing and evening concerts. The island is extremely safe, but the roads are dark at night, so drive carefully after dark. Stay in San Juan for the best beach access and restaurant options. The locals are exceptionally warm and will eagerly explain the significance of each celebration.',
 9, 9, 'Week surrounding September 17', 'annual',
 NULL, true, 'moderate', 2),

-- Siargao (has 2 events: Surfing Cup, Suroy Suroy) — add from order_index 3
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'siargao' LIMIT 1),
 'Siargao International Surfing Cup', 'siargao-cloud9-surfing-cup', 'sports',
 'Cloud 9 — Siargao''s legendary reef break — hosts the annual international surfing competition that has cemented this teardrop-shaped island''s reputation as the surfing capital of the Philippines. The contest draws elite surfers from across Asia and beyond to challenge the powerful, hollow right-hander that barrels over shallow reef. Even if you are not a surfer, watching from the iconic Cloud 9 boardwalk as athletes navigate massive swells against a backdrop of coconut palms and crystalline water is hypnotic. The event week transforms General Luna into one extended beach party.',
 'The Cloud 9 boardwalk offers the best free viewing — arrive early for a prime spot. The surf contest schedule depends on wave conditions, so stay flexible. Beginner surf lessons at the gentler beach breaks continue during competition week. The General Luna nightlife heats up during the contest — Rum Bar and Harana are the main gathering spots. Book accommodation at least a month ahead as the island fills completely.',
 9, 10, 'Nine days in late September or early October', 'annual',
 NULL, true, 'high', 3),

-- Cebu (has 3 events: Sinulog, Kadaugan, Chinese New Year) — add from order_index 4
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'cebu' LIMIT 1),
 'Sinulog Grand Parade', 'cebu-sinulog-grand-parade', 'parade',
 'The culminating event of the Sinulog Festival, the Grand Parade is one of the most spectacular street processions in the entire Philippines — a nine-hour river of color, sound, and movement as contingents from across the Visayas dance through the streets of Cebu City to honor the Santo Nino. Over two million people line the route, and the energy is staggering: thundering drums, elaborate feathered costumes, and the hypnotic two-steps-forward-one-step-back sinulog dance that gives the festival its name. It is devotion and celebration fused into pure kinetic joy.',
 'The grandstand seats along Osmena Boulevard offer the best viewing but sell out months in advance. Position yourself along the early route near the Basilica del Santo Nino for a closer, more intense experience. Bring water, sunscreen, and a hat — the parade runs from 6am to late afternoon under full sun. Keep valuables to an absolute minimum as pickpockets operate in the dense crowds. Use your hotel''s arranged transport for return — the streets are impassable during the parade.',
 1, 1, 'Third Sunday of January', 'annual',
 NULL, true, 'high', 4),

-- Cambodia

-- Siem Reap (getting 3 in missing-cities migration) — add from order_index 4
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'siem-reap' LIMIT 1),
 'Angkor Wat International Half Marathon', 'siem-reap-angkor-half-marathon', 'sports',
 'Running past the temples of Angkor at dawn is one of the most extraordinary athletic experiences on the planet, and this well-organized half marathon, 10K, and 3K charity run makes it accessible to runners of all levels. The course winds through the archaeological park as the first light catches the towers of Angkor Wat, past the enigmatic faces of the Bayon, and through the jungle-wrapped corridors of Ta Prohm. Thousands of runners from 70+ countries participate, and the funds raised support landmine clearance and children''s education in Siem Reap province.',
 'Register early on the official website — the half marathon sells out. The race starts at 6am to beat the heat, so book a hotel within cycling distance of the start line at Angkor Wat. The 10K and 3K races are excellent options for non-runners who want the temple experience. Hydrate aggressively in the days before — December is Cambodia''s cool season but the humidity is still significant. The finish-line celebration at the park entrance is jubilant.',
 12, 12, 'First Sunday of December', 'annual',
 NULL, false, 'high', 4),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'siem-reap' LIMIT 1),
 'Giant Puppet Parade', 'siem-reap-giant-puppet-parade', 'parade',
 'Created by the visionary Cambodian arts organization Giant Puppet Project, this annual parade brings enormous handcrafted puppets — some reaching five meters tall — through the streets of Siem Reap in a celebration of Cambodian mythology, folklore, and contemporary creativity. The puppets are built by local artisans and young people from vulnerable communities, and the parade is accompanied by traditional pinpeat music, classical Apsara dancers, and thousands of cheering spectators. The event has become a powerful symbol of Cambodia''s cultural renaissance after the devastation of the Khmer Rouge era.',
 'The parade route runs along the riverside and through the Old Market area — position yourself near the Siem Reap River bridge for dramatic photos as puppets cross the water. The event is family-friendly and extremely safe. The Giant Puppet workshop near the Old Market is open for visits year-round, where you can watch artisans construct the enormous figures. Arrive an hour before the published start time as Cambodian events often begin early.',
 1, 1, 'A Saturday in January (dates vary)', 'annual',
 NULL, true, 'moderate', 5),

-- Phnom Penh (getting 3 in missing-cities migration) — add from order_index 4
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'phnom-penh' LIMIT 1),
 'Phnom Penh Street Food Festival', 'phnom-penh-street-food-festival', 'festival',
 'Cambodia''s capital celebrates its extraordinary street food culture with a multi-day festival that gathers the city''s best vendors, from the legendary fish amok sellers of Central Market to the spider-frying specialists of Skuon. The festival site along the Riverside transforms into a culinary village with cooking demonstrations, eating competitions, and rare opportunities to taste regional Cambodian dishes that rarely make it to Phnom Penh''s restaurant menus. For food lovers, it is a concentrated masterclass in one of Southeast Asia''s most underrated cuisines.',
 'The festival is on the Riverside promenade near the Royal Palace — stay at a Riverside hotel for walking access. Come hungry and pace yourself — the portions are generous and the variety overwhelming. Cambodian street food is generally safe, but stick to stalls with high turnover. The evening sessions (after 5pm) have the best atmosphere with live music and cooler temperatures. Bring cash in small riel notes as many vendors do not have change for large bills.',
 12, 12, 'A weekend in December (dates vary)', 'annual',
 NULL, false, 'high', 4),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'phnom-penh' LIMIT 1),
 'Cambodian Living Arts Performances', 'phnom-penh-living-arts', 'seasonal',
 'Cambodian Living Arts — the organization dedicated to reviving classical and folk performing arts nearly destroyed during the Khmer Rouge era — presents regular performances at the National Museum that are among the most moving cultural experiences in Southeast Asia. Classical Apsara dance, shadow puppetry, folk music, and spoken word performances are staged in the museum''s candlelit courtyard, where the red sandstone architecture and ancient sculpture create an atmosphere of profound beauty. These performances represent a living act of cultural reclamation.',
 'Shows typically run on Friday and Saturday evenings at the National Museum — check the Cambodian Living Arts website for the current schedule. Book tickets in advance as the courtyard seats a limited audience. The pre-show museum visit (included in the ticket) is best experienced as the sun sets. Dress respectfully as you are in a cultural venue. The performance is about 90 minutes. A tuk-tuk from the Riverside hotels takes five minutes.',
 1, 12, 'Year-round, Friday and Saturday evenings', 'annual',
 NULL, false, 'low', 5),

-- Malaysia

-- Kuala Lumpur (getting 3 in missing-cities migration) — add from order_index 4
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'kuala-lumpur' LIMIT 1),
 'Thaipusam at Batu Caves', 'kuala-lumpur-thaipusam', 'festival',
 'Nothing prepares you for Thaipusam at Batu Caves. Over a million Hindu devotees and spectators converge on the 272-step staircase leading to the sacred limestone caves as devotees in trance states carry kavadi — elaborate, often towering metal frames pierced into their skin — while drummers and chanting crowds surge around them. The festival honors Lord Murugan and represents the most visually intense religious procession you will witness anywhere on Earth. The piercing rituals, the incense, the 42-meter gold statue presiding over the chaos — it is sensory overload of the most sacred kind.',
 'Arrive before dawn (3-4am) to witness the first devotees beginning their ascent — the atmosphere is at its most powerful in the pre-dawn darkness. Wear comfortable shoes and modest clothing. The crowd is massive but generally orderly and safe. Bring water and be prepared for very long periods of standing. The piercing rituals can be confronting — there is no obligation to watch up close. KTM Komuter trains run special services to Batu Caves station during Thaipusam.',
 1, 2, 'Full moon of Thai month (January or February)', 'annual',
 NULL, true, 'high', 4),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'kuala-lumpur' LIMIT 1),
 'KL Tower International Jump', 'kuala-lumpur-kl-tower-jump', 'sports',
 'For three extraordinary days each year, the 421-meter KL Tower opens its observation deck to approximately 100 BASE jumpers from around the world who leap from the tower''s open-air platform and freefall above the Kuala Lumpur skyline before deploying their parachutes. Spectators gather at the tower base and in the surrounding KLCC park to watch the jumpers — each with a differently colored parachute — descend against the backdrop of the Petronas Towers and the city''s dramatic skyline. It is one of the most spectacular urban extreme sports events in Asia.',
 'Spectating is free from the grounds around KL Tower and the Lake Gardens below. The jumps take place in the early morning (7-10am) when wind conditions are calmest. Bring a camera with a good zoom lens. The KL Tower observation deck is open to paying visitors during the event for a bird''s-eye perspective. Use the KL Monorail to Bukit Nanas station for easy access. The surrounding forest reserve is pleasant for a morning walk while watching jumpers descend.',
 9, 9, 'Three days in September (dates vary)', 'annual',
 NULL, true, 'moderate', 5),

-- Penang (getting 3 in missing-cities migration) — add from order_index 4
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'penang' LIMIT 1),
 'George Town Festival', 'penang-george-town-festival', 'festival',
 'For the entire month of July, George Town''s UNESCO World Heritage core transforms into a sprawling arts festival with exhibitions, performances, installations, and events occupying the colonial shophouses, temples, clan houses, and streets of this extraordinary multicultural city. The programming ranges from classical Indian dance in a Chinese clan house to contemporary art in a restored colonial warehouse to street food walking tours guided by fifth-generation hawkers. The festival celebrates the layered cultural identity that makes George Town one of the most fascinating cities in Southeast Asia.',
 'Most events are within walking distance in the compact George Town heritage zone — book a hotel or guesthouse within the UNESCO core area. Many events are free; ticketed shows are very affordable. The festival''s food programming is exceptional and goes far beyond the usual hawker recommendations. George Town is extremely safe for solo women at all hours within the heritage zone. The free festival app has daily programming updates and maps.',
 7, 7, 'Throughout July', 'annual',
 NULL, false, 'moderate', 4),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'penang' LIMIT 1),
 'Thaipusam Penang', 'penang-thaipusam', 'festival',
 'Penang hosts Malaysia''s second-largest Thaipusam celebration, with a procession from the Sri Mahamariamman Temple on Queen Street to the Nattukotai Chettiar Temple along the Waterfall Road — a route that winds through the heart of George Town''s Indian quarter. The Penang procession is more intimate than the massive Batu Caves event, allowing closer observation of the kavadi bearers, the drummers, and the deeply emotional family groups supporting their loved ones through the ordeal. The route passes through some of George Town''s most photogenic colonial streets.',
 'The procession begins before dawn and runs until mid-afternoon. Position yourself along Waterfall Road near the Botanical Gardens for the most atmospheric section. The Penang event is less overwhelming than Batu Caves, making it better for a first Thaipusam experience. Dress modestly and ask before photographing devotees in trance states. The Indian food stalls along Queen Street serve special Thaipusam fare — the vegetarian banana leaf meals are excellent.',
 1, 2, 'Full moon of Thai month (January or February)', 'annual',
 NULL, true, 'high', 5),

-- Langkawi (getting 3 in missing-cities migration) — add from order_index 4
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'langkawi' LIMIT 1),
 'LIMA (Langkawi International Maritime & Aerospace Exhibition)', 'langkawi-lima', 'conference',
 'Every two years, this remote island archipelago hosts one of Asia''s most significant defense and aerospace exhibitions, with military aircraft performing aerobatic displays over the Andaman Sea, naval vessels docking at the exhibition harbor, and aviation enthusiasts flooding in from across the region. The public days feature spectacular air shows with fighter jets, helicopters, and formation flying teams performing against the backdrop of Langkawi''s jungle-clad peaks and turquoise waters. The contrast between cutting-edge military technology and tropical island paradise is surreal.',
 'LIMA is biennial (odd years: 2027, 2029) — check dates if planning around this event. Public air show days are the most exciting, with the best viewing from the Mahsuri International Exhibition Centre and surrounding beaches. Book accommodation months in advance as the island fills completely during LIMA week. The air show is loud — bring ear protection. Langkawi is a duty-free island, so stock up on affordable chocolate and alcohol during your visit.',
 3, 3, 'Five days in March (biennial, odd years)', 'annual',
 NULL, false, 'high', 4),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'langkawi' LIMIT 1),
 'Eagle Feeding Season at Kilim Geoforest Park', 'langkawi-eagle-feeding', 'seasonal',
 'From February through April, the mangrove estuaries of Kilim Karst Geoforest Park witness the spectacular daily gathering of dozens of white-bellied sea eagles and Brahminy kites, drawn by the abundance of fish in the warming waters. Boat tours glide through the narrow channels between towering limestone karsts draped in ancient forest as eagles wheel overhead and dive for fish with breathtaking precision. The Kilim area is also home to macaques, monitor lizards, and rare dusky langurs visible from the boats, making this an immersive wildlife experience beyond the eagle spectacle.',
 'Book a morning boat tour through a Kilim-licensed operator (not the touts at the Kuah jetty). The smaller boats (4-6 people) offer better wildlife viewing than the large tour boats. Bring binoculars, sunscreen, and a hat. The eagles are most active in the early morning (8-10am) when fish surface. Some operators offer "eagle feeding" by throwing chicken skin — this practice is controversial and ecologists advise choosing operators who allow natural observation only.',
 2, 4, 'February to April (peak March)', 'annual',
 NULL, false, 'low', 5),

-- Singapore (getting 3 in missing-cities migration) — add from order_index 4
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'singapore' LIMIT 1),
 'F1 Singapore Grand Prix', 'singapore-f1-grand-prix', 'sports',
 'The only night race on the Formula 1 calendar, the Singapore Grand Prix sends twenty of the world''s fastest cars screaming through the illuminated streets of the Marina Bay district in one of the most visually spectacular sporting events on the planet. The 23-turn street circuit passes the colonial Padang, winds beneath the Esplanade, and blasts along the waterfront past Marina Bay Sands, all under the glow of 1,500 lighting projectors. The race weekend includes headline music concerts (past acts: Beyonce, Green Day, The Killers) included in the three-day grandstand tickets.',
 'Zone 4 walkabout tickets offer the best value for experiencing multiple vantage points around the circuit. Grandstand seats at Turn 1 or the Padang provide the most dramatic racing action. The Marina Bay area is incredibly safe and completely accessible by MRT. Wear comfortable shoes as you will walk extensively. The heat and humidity are intense even at night, so hydrate constantly. Earplugs are essential near the track.',
 9, 9, 'A weekend in September (Friday-Sunday)', 'annual',
 NULL, false, 'high', 4),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'singapore' LIMIT 1),
 'Singapore Food Festival', 'singapore-food-festival', 'festival',
 'This month-long celebration of Singapore''s extraordinary hawker culture and fine dining scene features pop-up restaurants, heritage food trails, cooking masterclasses with Michelin-starred chefs, and the annual crowning of Singapore''s best hawker stalls. The programming digs deep into the multicultural roots of Singaporean cuisine — Peranakan, Malay, Tamil, Hainanese, Teochew — with stories from the families who have been perfecting their recipes for generations. For food-obsessed solo travelers, it is arguably the best culinary festival in Asia.',
 'The festival hub at Singapore''s civic district hosts the main events, but the best experiences are the heritage food trails through Chinatown, Little India, and Kampong Glam. Book popular masterclasses and chef''s table dinners early. The hawker centre visits are the highlight: Maxwell Food Centre, Old Airport Road, and Tiong Bahru Market all participate with special menus. Singapore is the safest city in Asia for solo women, at any hour.',
 7, 7, 'Throughout July', 'annual',
 NULL, false, 'moderate', 5),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'singapore' LIMIT 1),
 'Deepavali on Little India', 'singapore-deepavali', 'holiday',
 'For six weeks from October through November, the streets of Little India are transformed into a blazing corridor of light as thousands of elaborate illuminated arches and installations turn Serangoon Road into Southeast Asia''s most spectacular Deepavali celebration. The festival of lights reaches its peak in the final week before Deepavali Day, when the Little India shophouses overflow with jasmine garlands, silk saris, gold jewelry, and sweets prepared for the holiday. The atmosphere — part devotional, part commercial, entirely electric — is best experienced after dark when the light-up reaches its full, dazzling power.',
 'Visit Little India after 7pm when the illuminations are at their brightest and the streets are buzzing with shoppers and families. MRT to Little India or Farrer Park stations puts you right in the heart of it. The vegetarian restaurants along Serangoon Road serve special Deepavali thali meals that are exceptional value. Tekka Centre''s wet market is open late during the festival period. Photography is welcome and encouraged.',
 10, 11, 'Six weeks from October to Deepavali Day (October/November)', 'annual',
 NULL, true, 'high', 6),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'singapore' LIMIT 1),
 'National Gallery Singapore Anniversary Exhibitions', 'singapore-national-gallery-anniversary', 'seasonal',
 'Each November, Singapore''s world-class National Gallery — housed in the former Supreme Court and City Hall buildings — launches its major annual exhibition cycle, typically debuting blockbuster shows featuring Southeast Asian and international art. The gallery houses the world''s largest public collection of Southeast Asian modern art, and the anniversary period programming includes artist talks, curator tours, and late-night openings with live performances in the spectacular Great Hall. The building itself — a masterpiece of adaptive reuse — is as compelling as the art within.',
 'The gallery is free for Singapore residents and permanent residents; tourists pay SGD 20 for the permanent collection (well worth it). The anniversary exhibitions often have separate ticketing — check the gallery website. The rooftop bar, Smoke & Mirrors, offers cocktails with panoramic views of the Padang and Marina Bay. Visit on a weekday afternoon for the quietest galleries. The gallery shop carries excellent Southeast Asian art books unavailable elsewhere.',
 11, 11, 'November (exhibition openings and special programming)', 'annual',
 NULL, false, 'low', 7),

-- =============================================
-- PRIORITY 3: INTERESTING ADDITIONS TO COVERED CITIES
-- =============================================

-- Japan

-- Tokyo (has 5 events) — add from order_index 6
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'tokyo' LIMIT 1),
 'Hanami Season Peak', 'tokyo-hanami-peak', 'seasonal',
 'For roughly two weeks from late March to early April, Tokyo transforms as over a thousand cherry trees in parks across the city burst into simultaneous bloom, draping the metropolis in clouds of pale pink. Ueno Park, Shinjuku Gyoen, and the Meguro River become rivers of blossom, and the Japanese tradition of hanami — gathering under the trees with friends, food, and sake — fills every green space from dawn to well after dark. The fleeting beauty of sakura is woven into Japanese philosophy: their brief, perfect bloom symbolizes the transience of life.',
 'Shinjuku Gyoen (200 yen entry) offers the most peaceful hanami experience, with early-morning visits nearly empty before 9am. The Meguro River walk is the most photogenic, especially at night when the blossoms are illuminated. Arrive at popular spots by 7am on weekends or they fill completely. Convenience stores (konbini) sell excellent bento boxes and drinks for impromptu picnics. Check the Japan Meteorological Corporation''s cherry blossom forecast for precise bloom dates, which shift each year.',
 3, 4, 'Late March to early April (approximately two weeks)', 'annual',
 NULL, true, 'high', 6),

-- Kyoto (has 4 events) — add from order_index 5
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'kyoto' LIMIT 1),
 'Arashiyama Hanatoro', 'kyoto-arashiyama-hanatoro', 'festival',
 'For ten December evenings, the Arashiyama district''s bamboo grove, Togetsukyo Bridge, and surrounding temple grounds are illuminated by thousands of lanterns that transform this already ethereal landscape into something genuinely otherworldly. The famous bamboo path — dramatic enough by daylight — becomes a luminous green corridor, while the Oi River reflects the light of the illuminated bridge in long, shimmering lines. The event is Kyoto''s most atmospheric winter experience, combining traditional ikebana (flower arrangement) installations at temple entrances with the soft glow of handcrafted lanterns.',
 'The illumination runs from 5pm to 8:30pm. Arrive by 4:30pm to walk the bamboo grove in the transition from daylight to lantern-glow. The JR Saga-Arashiyama station is a 15-minute train ride from Kyoto Station. Weekday evenings are significantly less crowded than weekends. The temple illuminations are the hidden gems — Nonomiya Shrine and Jojakko-ji are particularly beautiful. Dress warmly as December evenings in Kyoto are cold and you will be outdoors for extended periods.',
 12, 12, 'Ten days in mid-December', 'annual',
 NULL, true, 'moderate', 5),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'kyoto' LIMIT 1),
 'Gion Corner Geisha Performances', 'kyoto-gion-corner', 'seasonal',
 'Gion Corner in the heart of Kyoto''s geisha district presents nightly one-hour performances that showcase seven traditional Japanese performing arts: tea ceremony, koto music, ikebana (flower arrangement), gagaku (court music), kyogen (comic theater), bunraku (puppet theater), and the mesmerizing Kyo-mai dance performed by maiko (apprentice geisha). While some dismiss this as tourist-oriented, the performers are genuine practitioners trained in Kyoto''s rigorous artistic traditions, and the intimate theater offers a structured introduction to art forms that would otherwise require years of personal connections to witness.',
 'Shows run nightly at 6pm and 7pm from March through November, with a reduced schedule in winter. Book tickets online or at the Gion Corner box office. Seats are unreserved, so arrive 20 minutes early for front-row positions. The Gion neighborhood around the theater is Kyoto''s most atmospheric for an evening stroll — walk along Hanamikoji Street after the show for a chance to spot geiko (Kyoto''s term for geisha) heading to evening engagements. Photograph from a respectful distance.',
 3, 11, 'Nightly performances, March through November', 'annual',
 NULL, false, 'low', 6),

-- Morocco

-- Marrakech (has 3 events) — add from order_index 4
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'marrakech' LIMIT 1),
 '1-54 Contemporary African Art Fair', 'marrakech-1-54-art-fair', 'festival',
 'This satellite edition of London''s prestigious 1-54 Contemporary African Art Fair brings galleries from across Africa and the diaspora to Marrakech''s La Mamounia palace hotel for three days of exhibitions, artist talks, and collector events that have positioned the Red City as a serious node in the global contemporary art network. The fair showcases painting, sculpture, photography, and mixed media from emerging and established African artists, with a curatorial programme that interrogates identity, post-colonialism, and the future of the continent through art. The La Mamounia setting — one of the world''s great hotels — adds an undeniable glamour.',
 'General admission tickets are available through the 1-54 website. The fair is intimate enough to view thoroughly in half a day. The artist talks and panel discussions are excellent and included in admission. La Mamounia''s gardens are worth a visit independent of the fair. Combine with visits to MACAAL (Museum of African Contemporary Art Al Maaden) and the Yves Saint Laurent Museum for a full Marrakech art itinerary. Dress smartly — the crowd is chic.',
 2, 2, 'Three days in late February', 'annual',
 NULL, false, 'low', 4),

(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'marrakech' LIMIT 1),
 'Rose Festival in Kelaat M''Gouna', 'marrakech-rose-festival', 'festival',
 'Each May, the small town of Kelaat M''Gouna in the Valley of Roses — a long but spectacular day trip from Marrakech through the High Atlas — celebrates the annual rose harvest with a three-day festival of music, dance, and a parade featuring the newly crowned Rose Queen. The surrounding valley is carpeted in Damask roses cultivated for the production of rose water and rose oil, and the harvest period fills the air with an almost overwhelming fragrance. Berber families open their homes and rose distilleries for visits, and the festival atmosphere is joyful and deeply welcoming.',
 'Kelaat M''Gouna is approximately 5 hours from Marrakech by car — book a driver or join an organized tour (2-3 day trips that include the Todra Gorge and Dades Valley are the best value). The rose harvest peaks in mid-May, with the festival on the final weekend. Accommodation in Kelaat M''Gouna is basic — the Kasbah Itran is the most comfortable option. Bring rose water containers home as gifts — the local product is infinitely superior to the tourist versions sold in Marrakech souks.',
 5, 5, 'Three days in mid-May', 'annual',
 NULL, true, 'moderate', 5),

-- Fes (has 3 events) — add from order_index 4
-- Note: Fes Sacred Music already exists as 'fes-sacred-music', so skip that and add something else
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'fes' LIMIT 1),
 'Fes Culinary Festival', 'fes-culinary-festival', 'festival',
 'Morocco''s spiritual capital is also its culinary heart, and this intimate festival celebrates Fassi cuisine — widely considered the most refined in the Arab world — with cooking demonstrations in restored riads, market tours through the medieval medina, and multi-course feasts prepared by matriarchs who guard family recipes passed down for centuries. The programming explores the city''s Andalusian, Berber, Jewish, and Arab culinary heritage, with particular attention to the slow-cooking traditions that produce Fes'' legendary pastilla, rfissa, and tangia. For food-loving solo travelers, it is a rare invitation behind the closed doors of Fassi kitchens.',
 'The festival operates from several riads within the medina — book through the festival website for the full programme. The market tours with local chefs are the highlight and fill quickly. Many events include hands-on cooking, so wear clothes you do not mind getting messy. The festival coincides with the cooler spring weather, making medina walking comfortable. Fes is generally safe for solo women, though a licensed guide is recommended for medina navigation.',
 4, 4, 'Four days in April (dates vary)', 'annual',
 NULL, false, 'low', 4),

-- Portugal

-- Lisbon (has 4 events) — add from order_index 5
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'lisbon' LIMIT 1),
 'Festa de Santo Antonio Night', 'lisbon-santo-antonio-night', 'festival',
 'The night of June 12-13 is Lisbon''s biggest party — the entire city pours into the streets of Alfama, Mouraria, and Graca for all-night celebrations honoring the city''s patron saint. Sardines grill on every corner, plastic cups of sangria and beer flow freely, makeshift dance floors appear in alleyways, and the narrow streets of the old neighborhoods become an open-air carnival where strangers become friends and everyone dances to pimba (cheesy Portuguese pop) without a shred of irony. By midnight, the marchas populares (costumed neighborhood parades) march down Avenida da Liberdade in a competition of song, dance, and community pride.',
 'The epicenter is Alfama and Mouraria — walk from Martim Moniz down through the old neighborhoods. There is no entry fee and no tickets — the entire city is the venue. Wear comfortable shoes as you will walk for hours on cobblestones. Keep valuables minimal as the crowds are dense. The sardines from the street grills are the must-eat (about EUR 3 for a plate with bread). The party runs until sunrise. Public transport runs all night. This is the single best night to be in Lisbon.',
 6, 6, 'Night of June 12-13', 'annual',
 NULL, true, 'high', 5),

-- Porto (has 3 events) — add from order_index 4
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'porto' LIMIT 1),
 'Sao Joao Festival', 'porto-sao-joao-festival', 'festival',
 'On the night of June 23-24, Porto celebrates its patron saint with the most delightfully absurd tradition in European festival culture: strangers hit each other on the head with plastic hammers (formerly garlic flowers, now replaced for practical reasons) while sky lanterns rise over the Douro River and the entire city stays awake until dawn grilling sardines and drinking vinho verde. The tradition is that a tap on the head from a stranger brings good luck, and the result is a citywide outbreak of joyful, consensual silliness. At midnight, the Douro River erupts in a massive fireworks display viewed from both the Porto and Gaia riverbanks.',
 'Position yourself on the Dom Luis I Bridge by 11pm for the fireworks — it is the most spectacular viewpoint in the city. Buy a plastic hammer from any street vendor (EUR 1-2) and join the gentle head-tapping tradition. The Ribeira waterfront is the most atmospheric area. Grilled sardines from street vendors are the traditional food — eaten standing, on bread, with your hands. The party runs until sunrise with the entire city participating. Porto is very safe during Sao Joao but keep valuables minimal in the dense crowds.',
 6, 6, 'Night of June 23-24', 'annual',
 NULL, true, 'high', 4),

-- South Korea

-- Seoul (has 4 events) — add from order_index 5
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'seoul' LIMIT 1),
 'Seoul Lantern Festival Extended', 'seoul-lantern-festival-extended', 'festival',
 'For three weeks in November, the Cheonggyecheon Stream — a restored urban waterway running through the heart of Seoul — is illuminated with thousands of handcrafted lanterns depicting Korean folklore, historical figures, modern pop culture, and elaborate themed installations that stretch for over a kilometer. The lanterns are reflected in the shallow stream, doubling the spectacle, and the walkway along the water creates an immersive corridor of light that is Seoul''s most photogenic autumn experience. The festival has grown into a major cultural event drawing millions of visitors who stroll the stream in the crisp November air.',
 'Walk the full length of the installation from Cheonggye Plaza to Supyo Bridge for the complete experience (about 45 minutes). Evening visits (after 6pm) offer the best lighting conditions. The stream-level walkway is less crowded than the street-level viewing on weekdays. Combine with a visit to the nearby Gwangjang Market for bindaetteok (mung bean pancakes) and yukhoe (Korean steak tartare). The Jongno 3-ga subway station exits directly onto the festival route.',
 11, 11, 'Three weeks in November', 'annual',
 NULL, true, 'high', 5),

-- Busan (has 3 events) — add from order_index 4
(gen_random_uuid(),
 (SELECT id FROM cities WHERE slug = 'busan' LIMIT 1),
 'Busan International Film Festival (BIFF)', 'busan-biff-festival', 'festival',
 'Asia''s most important film festival transforms the Centum City district for ten days in October, screening 300+ films from 70 countries across the architecturally stunning Busan Cinema Center and surrounding venues. BIFF has launched the careers of countless Asian filmmakers and its commitment to accessible pricing means ordinary film lovers can attend screenings, press conferences, and outdoor events alongside industry professionals. The Open Cinema — a massive outdoor screen at the Cinema Center — hosts free evening screenings of festival highlights under the stars, and the Busan citizens'' enthusiasm for the event creates an infectious energy.',
 'Buy a festival pass for the best value and priority booking. The Busan Cinema Center in Centum City is accessible via subway (Centum City station). The BIFF Village at Haeundae Beach has free outdoor screenings and a festival market. Korean audiences are remarkably attentive in screenings — the etiquette is impeccable. Solo film lovers will find the post-screening discussion areas natural conversation starters. The festival coincides with beautiful autumn weather on the coast.',
 10, 10, 'Ten days in early October', 'annual',
 NULL, false, 'moderate', 4)

ON CONFLICT (slug) DO NOTHING;
