-- ============================================================
-- RESEED: Community Threads & Replies for SEA Launch
-- Idempotent: deletes old seed content, inserts fresh.
-- 12 threads, 3-6 replies each, zero em dashes.
-- ============================================================

DO $$
DECLARE
  demo_author uuid;
  -- Seed profile IDs
  sp_mei uuid;
  sp_sarah uuid;
  sp_priya uuid;
  sp_anna uuid;
  sp_lucia uuid;
  -- Country IDs
  ph_country uuid;
  vn_country uuid;
  th_country uuid;
  id_country uuid;
  -- City IDs
  manila_city uuid;
  cebu_city uuid;
  siargao_city uuid;
  hanoi_city uuid;
  hcmc_city uuid;
  bangkok_city uuid;
  chiangmai_city uuid;
  bali_city uuid;
  yogya_city uuid;
  -- Topic IDs
  topic_safety uuid;
  topic_stays uuid;
  topic_getting_around uuid;
  topic_culture uuid;
  topic_meeting uuid;
  topic_itinerary uuid;
  -- Thread IDs
  t1 uuid; t2 uuid; t3 uuid; t4 uuid; t5 uuid; t6 uuid;
  t7 uuid; t8 uuid; t9 uuid; t10 uuid; t11 uuid; t12 uuid;
BEGIN
  -- Get a demo author (needed for FK on author_id)
  SELECT id INTO demo_author FROM profiles LIMIT 1;
  IF demo_author IS NULL THEN RETURN; END IF;

  -- -------------------------------------------------------
  -- Clean up old seed data
  -- -------------------------------------------------------
  DELETE FROM community_replies WHERE thread_id IN (
    SELECT id FROM community_threads WHERE is_seed = true
  );
  DELETE FROM community_threads WHERE is_seed = true;
  DELETE FROM community_seed_profiles;

  -- -------------------------------------------------------
  -- Insert seed profiles
  -- -------------------------------------------------------
  INSERT INTO community_seed_profiles (id, display_name, bio, home_base)
  VALUES (gen_random_uuid(), 'Mei', '3 years solo travel across Southeast Asia. UX designer.', 'Taipei, Taiwan')
  RETURNING id INTO sp_mei;

  INSERT INTO community_seed_profiles (id, display_name, bio, home_base)
  VALUES (gen_random_uuid(), 'Sarah K.', 'Teacher turned digital nomad. Slow-traveling Asia.', 'Portland, OR')
  RETURNING id INTO sp_sarah;

  INSERT INTO community_seed_profiles (id, display_name, bio, home_base)
  VALUES (gen_random_uuid(), 'Priya', 'Weekend adventurer and hostel reviewer.', 'Mumbai')
  RETURNING id INTO sp_priya;

  INSERT INTO community_seed_profiles (id, display_name, bio, home_base)
  VALUES (gen_random_uuid(), 'Anna', 'Freelance writer based in Bali. Loves quiet beaches.', 'Ubud, Indonesia')
  RETURNING id INTO sp_anna;

  INSERT INTO community_seed_profiles (id, display_name, bio, home_base)
  VALUES (gen_random_uuid(), 'Lucia', 'Backpacker at heart, now working remotely from Bangkok.', 'Bangkok')
  RETURNING id INTO sp_lucia;

  -- -------------------------------------------------------
  -- Look up countries, cities, topics
  -- -------------------------------------------------------
  SELECT id INTO ph_country FROM countries WHERE iso2 = 'PH';
  SELECT id INTO vn_country FROM countries WHERE iso2 = 'VN';
  SELECT id INTO th_country FROM countries WHERE iso2 = 'TH';
  SELECT id INTO id_country FROM countries WHERE iso2 = 'ID';

  SELECT id INTO manila_city FROM cities WHERE slug = 'manila' LIMIT 1;
  SELECT id INTO cebu_city FROM cities WHERE slug = 'cebu' LIMIT 1;
  SELECT id INTO siargao_city FROM cities WHERE slug = 'siargao' LIMIT 1;
  SELECT id INTO hanoi_city FROM cities WHERE slug = 'hanoi' LIMIT 1;
  SELECT id INTO hcmc_city FROM cities WHERE slug = 'ho-chi-minh-city' LIMIT 1;
  SELECT id INTO bangkok_city FROM cities WHERE slug = 'bangkok' LIMIT 1;
  SELECT id INTO chiangmai_city FROM cities WHERE slug = 'chiang-mai' LIMIT 1;
  SELECT id INTO bali_city FROM cities WHERE slug = 'bali' LIMIT 1;
  SELECT id INTO yogya_city FROM cities WHERE slug = 'yogyakarta' LIMIT 1;

  SELECT id INTO topic_safety FROM community_topics WHERE slug = 'safety-comfort';
  SELECT id INTO topic_stays FROM community_topics WHERE slug = 'stays';
  SELECT id INTO topic_getting_around FROM community_topics WHERE slug = 'getting-around';
  SELECT id INTO topic_culture FROM community_topics WHERE slug = 'local-culture';
  SELECT id INTO topic_meeting FROM community_topics WHERE slug = 'meeting-people';
  SELECT id INTO topic_itinerary FROM community_topics WHERE slug = 'itineraries';

  -- -------------------------------------------------------
  -- THREAD 1: Walking alone at night in Bangkok (Sarah K.)
  -- -------------------------------------------------------
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed, seed_profile_id)
  VALUES (gen_random_uuid(), demo_author,
    'Walking alone at night in Bangkok: which areas feel safe?',
    'I arrive in Bangkok next week and plan to explore street food after dark. Staying near Silom but want to wander Chinatown and Khao San Road area too. Which neighborhoods feel comfortable for a solo woman at 9 or 10pm? I usually stick to well-lit streets but would love to know the local perspective.',
    th_country, bangkok_city, topic_safety, 'seed', true, sp_sarah)
  RETURNING id INTO t1;

  -- Replies for T1
  INSERT INTO community_replies (thread_id, author_id, body, author_type, seed_profile_id) VALUES
  (t1, demo_author,
   'Silom is great at night, especially around Sala Daeng BTS. Chinatown (Yaowarat) is lively until late and feels very safe because it is always packed with locals eating. Khao San is fine too, just a different vibe. The main areas I would skip after dark are Nana and lower Sukhumvit odd-numbered sois.',
   'seed', sp_mei),
  (t1, demo_author,
   'I walked Yaowarat solo at 11pm and felt totally comfortable. So many families out eating. The BTS/MRT stations are well-lit and staffed until midnight. Grab is cheap if you ever feel unsure, usually 40 to 80 baht for short rides.',
   'system', NULL),
  (t1, demo_author,
   'Bangkok is one of the safest big cities in Southeast Asia for solo women, in my experience. I have been here three times now. Just use normal city awareness: keep your phone secure, avoid empty sois, and you will be fine. The 7-Elevens on every corner are a good landmark if you need to reorient.',
   'seed', sp_lucia);

  -- -------------------------------------------------------
  -- THREAD 2: Female-only dorms in Manila and Cebu (Priya)
  -- -------------------------------------------------------
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed, seed_profile_id)
  VALUES (gen_random_uuid(), demo_author,
    'Female-only dorms in Manila and Cebu worth booking?',
    'Planning two weeks in the Philippines, starting in Manila then flying to Cebu. I prefer female-only dorms when available. Budget is around $12 to $18 per night. Are there good options in both cities, or should I just go private room? Any hostel recommendations where you actually met other solo women?',
    ph_country, manila_city, topic_stays, 'seed', true, sp_priya)
  RETURNING id INTO t2;

  -- Replies for T2
  INSERT INTO community_replies (thread_id, author_id, body, author_type, seed_profile_id) VALUES
  (t2, demo_author,
   'In Manila, Z Hostel in Makati has a great female dorm for about $14/night. Clean, secure lockers, rooftop bar if you want to be social. In Cebu City, Mad Monkey is solid. For Cebu beaches (Moalboal), Tipsy Gypsy has female dorms around $10.',
   'seed', sp_sarah),
  (t2, demo_author,
   'I stayed at Lub d in Makati and really liked the female floor. Key card access, good AC, and the common area is a great place to meet people. Around $15/night. In Cebu, I switched to a private room at a guesthouse for $20 because the hostel options outside the city center were limited.',
   'seed', sp_mei),
  (t2, demo_author,
   'One tip: book directly on Hostelworld and filter for "female dorm" rather than relying on Booking.com. Some hostels only list their female dorms on Hostelworld. Also check reviews from the last 3 months since turnover in the Philippines is fast.',
   'system', NULL),
  (t2, demo_author,
   'I did Manila to Cebu to Siargao last year. The female dorm scene in Manila is solid, especially in Makati and BGC area. Cebu City is more limited but Moalboal makes up for it. Consider skipping Cebu City and heading straight to the coast.',
   'seed', sp_lucia);

  -- -------------------------------------------------------
  -- THREAD 3: Getting around Hanoi safely (Sola Team)
  -- -------------------------------------------------------
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed, seed_profile_id)
  VALUES (gen_random_uuid(), demo_author,
    'Getting around Hanoi safely: Grab vs motorbike vs walking',
    'Hanoi traffic looks intense in every video. We put together a quick overview of the main transport options for solo women, based on what our community has shared.' || chr(10) || chr(10) ||
    'Grab: The easiest and safest option. Rides within the Old Quarter cost 20,000 to 40,000 VND ($0.80 to $1.60). Available 24/7 and the app tracks your route.' || chr(10) || chr(10) ||
    'Motorbike rental: About $7/day. Great freedom but Hanoi traffic is aggressive even by Southeast Asian standards. Most solo women recommend waiting a few days before trying it.' || chr(10) || chr(10) ||
    'Walking: The Old Quarter is very walkable. For crossing streets, walk at a steady pace and traffic flows around you. Do not stop or run.' || chr(10) || chr(10) ||
    'What has worked best for you?',
    vn_country, hanoi_city, topic_getting_around, 'system', true, NULL)
  RETURNING id INTO t3;

  -- Replies for T3
  INSERT INTO community_replies (thread_id, author_id, body, author_type, seed_profile_id) VALUES
  (t3, demo_author,
   'Used Grab exclusively for the first two days, then rented a motorbike on day three once I understood the flow. The key is confidence: hesitation is what causes problems. If you are not comfortable on a scooter already, just stick with Grab. It is so cheap there is no reason to stress.',
   'seed', sp_mei),
  (t3, demo_author,
   'Walking the Old Quarter was my favorite part. It is chaotic but once you relax into it, the city reveals itself. I only used Grab for longer distances like getting to West Lake or the airport. Never felt unsafe.',
   'seed', sp_anna),
  (t3, demo_author,
   'I tried a motorbike on day one and regretted it immediately. Returned it and used Grab the rest of the trip. No shame in that. Hanoi is not Bali when it comes to traffic.',
   'seed', sp_priya),
  (t3, demo_author,
   'Pro tip: download the Grab app before you arrive and set up payment. Vietnamese SIM cards are about $5 at the airport and they will set it up for you. Having data immediately makes everything easier.',
   'system', NULL);

  -- -------------------------------------------------------
  -- THREAD 4: Best neighborhoods for solo women in HCMC (Mei)
  -- -------------------------------------------------------
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed, seed_profile_id)
  VALUES (gen_random_uuid(), demo_author,
    'Best neighborhoods for solo women in Ho Chi Minh City',
    'Spending a week in HCMC and trying to decide where to base myself. I want somewhere walkable with good food, not too touristy, and where I can feel comfortable coming home late. District 1 seems like the obvious choice but is it the best one? Open to less central areas if the trade-off is worth it.',
    vn_country, hcmc_city, topic_safety, 'seed', true, sp_mei)
  RETURNING id INTO t4;

  -- Replies for T4
  INSERT INTO community_replies (thread_id, author_id, body, author_type, seed_profile_id) VALUES
  (t4, demo_author,
   'District 1 is the easiest choice for a first visit. Ben Thanh area or Nguyen Hue walking street are both great bases. Well-lit, lots of food options, easy to get Grabs. If you want something more local, District 3 (around Vo Van Tan) is my favorite: quieter, cheaper, incredible banh mi and pho spots, and still only a 10-minute Grab to the center.',
   'seed', sp_sarah),
  (t4, demo_author,
   'I lived in District 2 (Thao Dien) for a month. It is the expat area with lots of cafes and western food, but it felt isolated from the real city. For a week, I would recommend District 1 or 3. You can always visit D2 for a day.',
   'seed', sp_anna),
  (t4, demo_author,
   'District 7 (Phu My Hung) is another safe option if you want something modern and quiet, but it is far from the main sights. For a week-long trip, District 1 gives you the best balance of safety, walkability, and access to everything.',
   'system', NULL);

  -- -------------------------------------------------------
  -- THREAD 5: Bali scams every solo traveler should know (Sola Team)
  -- -------------------------------------------------------
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed, seed_profile_id)
  VALUES (gen_random_uuid(), demo_author,
    'Bali scams every solo traveler should know about',
    'Bali is generally safe, but there are a few common scams that target tourists, especially solo travelers who may be less confident negotiating. Here is what our community has flagged:' || chr(10) || chr(10) ||
    'Money changers: Avoid street-side money changers with "no commission" signs. They use rigged calculators or sleight of hand. Use ATMs or authorized exchanges like BMC or Central Kuta.' || chr(10) || chr(10) ||
    'Transport: Always agree on a price before getting in, or use Grab/Gojek where available. Some drivers will quote 5 to 10x the normal fare to tourists.' || chr(10) || chr(10) ||
    'Temple "donations": At some temples, people will pressure you for large "mandatory" donations. Actual entrance fees are posted on signs, usually 30,000 to 50,000 IDR.' || chr(10) || chr(10) ||
    'Monkey Forest bags: Monkeys in Ubud will grab anything loose. Secure your belongings, take off dangling jewelry, and do not bring food.' || chr(10) || chr(10) ||
    'Have you encountered others? Share below so we can keep this list updated.',
    id_country, bali_city, topic_safety, 'system', true, NULL)
  RETURNING id INTO t5;

  -- Replies for T5
  INSERT INTO community_replies (thread_id, author_id, body, author_type, seed_profile_id) VALUES
  (t5, demo_author,
   'The motorbike rental scam: some rental shops will claim you damaged the bike when you return it and demand payment. Always take photos and video of the bike from every angle before you ride off. I also recommend using Google Maps to screenshot the condition and timestamp.',
   'seed', sp_anna),
  (t5, demo_author,
   'Adding the "ceremony blessing" scam in Ubud. Someone approaches you near a temple saying a special ceremony is happening and you need to buy offerings to participate. The offerings cost 200,000 IDR or more. Real ceremonies do not require tourist purchases. A polite "no thank you" works.',
   'seed', sp_priya),
  (t5, demo_author,
   'Grab and Gojek are the best way to avoid transport scams. In areas where they are restricted (like parts of Ubud center), negotiate firmly or ask your accommodation to arrange a driver. Most hotels and guesthouses can get you fair-price transport.',
   'seed', sp_lucia),
  (t5, demo_author,
   'One more: the "free" surf lesson. Someone on the beach offers to teach you, then demands a large payment after. Always book lessons through a reputable school. Odysseys and Rapture in Kuta/Canggu are both well-reviewed and transparent about pricing.',
   'seed', sp_sarah);

  -- -------------------------------------------------------
  -- THREAD 6: Temple etiquette for women in Thailand (Sola Team)
  -- -------------------------------------------------------
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed, seed_profile_id)
  VALUES (gen_random_uuid(), demo_author,
    'Temple etiquette for women in Thailand',
    'Thailand has over 40,000 Buddhist temples and visiting them is one of the highlights of any trip. Here is a quick guide on etiquette, especially for women:' || chr(10) || chr(10) ||
    'Dress code: Cover shoulders and knees. A lightweight scarf or sarong works perfectly and rolls up small in your bag. Some popular temples lend cover-ups but do not count on it.' || chr(10) || chr(10) ||
    'Shoes: Remove them before entering any building. Flip-flops make this easy.' || chr(10) || chr(10) ||
    'Monks: Women should not touch monks or hand them anything directly. If you need to give something to a monk, place it on a cloth or surface first.' || chr(10) || chr(10) ||
    'Sitting: Never point your feet toward a Buddha image. Tuck them underneath you or to the side.' || chr(10) || chr(10) ||
    'Photography: Ask before photographing people praying. Most exterior architecture is fine to photograph freely.' || chr(10) || chr(10) ||
    'Which temples have been your favorites?',
    th_country, bangkok_city, topic_culture, 'system', true, NULL)
  RETURNING id INTO t6;

  -- Replies for T6
  INSERT INTO community_replies (thread_id, author_id, body, author_type, seed_profile_id) VALUES
  (t6, demo_author,
   'Wat Pho is my all-time favorite. The reclining Buddha is incredible and the grounds are large enough that it never feels too crowded. Go early morning for the best experience. The on-site Thai massage school is also excellent and reasonably priced.',
   'seed', sp_mei),
  (t6, demo_author,
   'I would add Wat Arun, especially at sunset. Take the ferry across the river from Wat Pho (it costs 4 baht). The temple itself has a small entrance fee of about 100 baht. Climbing the steep stairs in the center is worth it for the view.',
   'seed', sp_sarah),
  (t6, demo_author,
   'Outside Bangkok: Wat Rong Khun (White Temple) in Chiang Rai is stunning but gets very crowded by midday. Arrive at opening time. In Chiang Mai, Wat Phra That Doi Suthep up on the mountain is beautiful and feels more spiritual than the city temples.',
   'seed', sp_lucia),
  (t6, demo_author,
   'Practical tip: I keep a lightweight cotton scarf in my daypack at all times in Thailand. Works for temples, air-conditioned buses, and sun protection. Much better than buying the overpriced cover-ups sold outside popular temples.',
   'seed', sp_anna);

  -- -------------------------------------------------------
  -- THREAD 7: Meeting other solo women in Chiang Mai (Lucia)
  -- -------------------------------------------------------
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed, seed_profile_id)
  VALUES (gen_random_uuid(), demo_author,
    'Meeting other solo women travelers in Chiang Mai',
    'I have been in Chiang Mai for a week now and finding it surprisingly easy to meet people. But most of the social scene revolves around bars and hostels, which is not really my thing. Looking for recommendations on where solo women connect in more low-key settings. Coworking spaces? Yoga studios? Cooking classes? What worked for you?',
    th_country, chiangmai_city, topic_meeting, 'seed', true, sp_lucia)
  RETURNING id INTO t7;

  -- Replies for T7
  INSERT INTO community_replies (thread_id, author_id, body, author_type, seed_profile_id) VALUES
  (t7, demo_author,
   'Punspace (Nimman) and CAMP at Maya Mall are the two most popular coworking spots. Both have a mix of locals and digital nomads. I met three solo women at Punspace in my first week just by sitting in the common area. The monthly pass is about 3,000 baht.',
   'seed', sp_sarah),
  (t7, demo_author,
   'Cooking classes are perfect for this. I did one at Thai Farm Cooking School (half-day, about 1,000 baht) and ended up spending the rest of the day with two women I met there. Yoga at Wild Rose is also great for meeting people in a calm setting.',
   'seed', sp_mei),
  (t7, demo_author,
   'The Sunday Walking Street market in the Old City is a good low-key spot. It is so long that you end up chatting with other solo travelers along the way. Also check for events on Meetup or Facebook groups like "Chiang Mai Digital Nomads" which often have women-only gatherings.',
   'system', NULL),
  (t7, demo_author,
   'I made most of my connections at my guesthouse rather than a hostel. Smaller guesthouses with shared kitchens tend to attract a calmer crowd. Stayed at Green Sleep Hostel in Nimman, very chill, met wonderful people at breakfast.',
   'seed', sp_priya);

  -- -------------------------------------------------------
  -- THREAD 8: SIM cards and connectivity across SEA (Sola Team)
  -- -------------------------------------------------------
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed, seed_profile_id)
  VALUES (gen_random_uuid(), demo_author,
    'SIM cards and connectivity across Southeast Asia',
    'Reliable data is essential for solo travel: maps, translation, Grab, and staying in touch. Here is a country-by-country overview of what works:' || chr(10) || chr(10) ||
    'Thailand: AIS or TrueMove. Available at any airport for 300 to 500 baht (about $9 to $14). Coverage is excellent nationwide. Get the tourist SIM at the airport kiosk and they will set it up for you.' || chr(10) || chr(10) ||
    'Vietnam: Viettel or Mobifone. Airport SIMs cost about 100,000 to 200,000 VND ($4 to $8). Coverage is solid in cities and decent in rural areas.' || chr(10) || chr(10) ||
    'Philippines: Globe or Smart. Airport SIMs for 300 to 500 PHP ($5 to $9). Coverage can be spotty on smaller islands. Download offline maps before heading to Siargao or Palawan.' || chr(10) || chr(10) ||
    'Indonesia: Telkomsel (best coverage). Airport SIMs for 50,000 to 150,000 IDR ($3 to $10). Registration requires passport. Coverage drops off significantly in rural Flores, Sumba, and parts of Kalimantan.' || chr(10) || chr(10) ||
    'eSIM alternative: Airalo or Holafly offer multi-country eSIMs if your phone supports it. More expensive but very convenient for multi-country trips.',
    NULL, NULL, topic_getting_around, 'system', true, NULL)
  RETURNING id INTO t8;

  -- Replies for T8
  INSERT INTO community_replies (thread_id, author_id, body, author_type, seed_profile_id) VALUES
  (t8, demo_author,
   'I used Airalo for a 3-country trip (Thailand, Vietnam, Philippines) and it worked well. The Asia regional plan was about $26 for 5GB/30 days. Not the cheapest option but the convenience of not swapping SIMs at every airport was worth it for me.',
   'seed', sp_sarah),
  (t8, demo_author,
   'One important note for Indonesia: Telkomsel requires biometric registration as of 2025. They will take your photo and scan your passport at the airport counter. It takes about 10 minutes. Do not buy from random street vendors as those SIMs may not be properly registered and can get deactivated.',
   'seed', sp_anna),
  (t8, demo_author,
   'For the Philippines, definitely download offline Google Maps for any island destinations. I lost signal for almost a full day on the boat from Cebu to Siargao. Having offline maps and my accommodation address saved was essential.',
   'seed', sp_priya);

  -- -------------------------------------------------------
  -- THREAD 9: What to wear in conservative areas of Indonesia (Anna)
  -- -------------------------------------------------------
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed, seed_profile_id)
  VALUES (gen_random_uuid(), demo_author,
    'What to wear in conservative areas of Indonesia',
    'Bali is relaxed about dress codes, but other parts of Indonesia are more conservative, especially Java and Sumatra. I spent time in Yogyakarta and Aceh and learned some things the hard way. Sharing what I wish I had known before arriving.' || chr(10) || chr(10) ||
    'In Yogyakarta and Central Java: shoulders covered and shorts to the knee is usually fine for daily life. For temples like Borobudur and Prambanan, you will be given a sarong at the entrance. Locals are warm and forgiving of tourist mistakes, but covering up shows respect.' || chr(10) || chr(10) ||
    'What has your experience been in more conservative areas?',
    id_country, yogya_city, topic_culture, 'seed', true, sp_anna)
  RETURNING id INTO t9;

  -- Replies for T9
  INSERT INTO community_replies (thread_id, author_id, body, author_type, seed_profile_id) VALUES
  (t9, demo_author,
   'I found that loose linen pants and a cotton t-shirt worked perfectly everywhere in Java. Comfortable in the heat and respectful. I packed two pairs and alternated. For mosque visits, I brought a lightweight headscarf that doubled as a sarong when needed.',
   'seed', sp_mei),
  (t9, demo_author,
   'The difference between Bali and Java was surprising to me. In Ubud I was in shorts and a tank top every day. When I flew to Yogyakarta, I noticed I was the only woman dressed that way and felt uncomfortable. A quick trip to a local shop fixed it. Lightweight cotton shirts there cost about 30,000 to 50,000 IDR ($2 to $3).',
   'seed', sp_priya),
  (t9, demo_author,
   'Good topic. For context, Indonesia is the world''s largest Muslim-majority country, but attitudes toward dress vary enormously by region. Bali (Hindu majority) is the most relaxed. Java is moderate. Aceh province in Sumatra follows Sharia law and women (including tourists) should wear headscarves and loose clothing. Most travelers do not visit Aceh, but it is worth knowing.',
   'system', NULL),
  (t9, demo_author,
   'Practical packing tip: I travel with a sarong, a lightweight long-sleeve linen shirt, and loose cotton pants that can roll up. This combination works across every level of conservatism in Southeast Asia and takes up almost no space.',
   'seed', sp_lucia);

  -- -------------------------------------------------------
  -- THREAD 10: Is Siargao worth it for solo women surfing? (Sarah K.)
  -- -------------------------------------------------------
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed, seed_profile_id)
  VALUES (gen_random_uuid(), demo_author,
    'Is Siargao worth it for solo women who want to learn surfing?',
    'I keep seeing Siargao on every "best islands" list. I have never surfed before but want to try. A few questions for anyone who has been:' || chr(10) || chr(10) ||
    'Is it beginner-friendly or mostly for experienced surfers? Are the surf instructors professional and respectful? What is the vibe like for solo women, is it social or more couples/groups? And honestly, is it worth the effort to get there (I know flights are limited)?',
    ph_country, siargao_city, topic_itinerary, 'seed', true, sp_sarah)
  RETURNING id INTO t10;

  -- Replies for T10
  INSERT INTO community_replies (thread_id, author_id, body, author_type, seed_profile_id) VALUES
  (t10, demo_author,
   'Siargao is very beginner-friendly. Cloud 9 gets the attention but there are gentler breaks nearby that are perfect for learning. I took lessons at Kermit Surf (about 500 PHP/hour with board) and my instructor was patient and professional. The vibe is young and social. I met other solo women within hours of arriving.',
   'seed', sp_priya),
  (t10, demo_author,
   'Getting there: fly Manila to Siargao (Cebu Pacific, about 2 hours). Flights sell out fast so book 2 to 3 weeks ahead. The island itself is small and easy to navigate by motorbike. I felt very safe the entire time.',
   'seed', sp_lucia),
  (t10, demo_author,
   'I went as a complete beginner and stood up on my second lesson. The water is warm, the breaks are forgiving, and the community of solo women travelers there was one of the best I have found anywhere in Southeast Asia. Stay in General Luna for the most social atmosphere. Pacifico is quieter if you want to escape the scene.',
   'seed', sp_mei),
  (t10, demo_author,
   'Worth noting: the surf season runs roughly September to November for the best waves, but beginners can surf year-round. Avoid typhoon season (December to February) as conditions can be unpredictable. Budget about $25 to $35 per day for accommodation, food, and a surf lesson.',
   'system', NULL);

  -- -------------------------------------------------------
  -- THREAD 11: Day trips from Hanoi safe to do alone (Mei)
  -- -------------------------------------------------------
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed, seed_profile_id)
  VALUES (gen_random_uuid(), demo_author,
    'Day trips from Hanoi that feel safe to do alone',
    'I have 5 days in Hanoi and want to spend 2 of them on day trips outside the city. Ninh Binh, Halong Bay, Perfume Pagoda, and Bat Trang pottery village are all on my radar. Which ones are doable and safe as a solo woman without joining a big group tour? I prefer to go at my own pace but also want to feel comfortable.',
    vn_country, hanoi_city, topic_itinerary, 'seed', true, sp_mei)
  RETURNING id INTO t11;

  -- Replies for T11
  INSERT INTO community_replies (thread_id, author_id, body, author_type, seed_profile_id) VALUES
  (t11, demo_author,
   'Ninh Binh is my top recommendation. Take the bus from Giap Bat station (about 80,000 VND, 2 hours). Rent a bicycle at Tam Coc and explore the rice paddies and caves at your own pace. I did it completely solo and felt safe the entire time. The boat rides are run by local women and very peaceful.',
   'seed', sp_sarah),
  (t11, demo_author,
   'For Halong Bay, a solo day trip is possible but honestly not worth it. The drive is 3 to 4 hours each way and you barely get time on the water. If you want to do Halong Bay properly, book an overnight cruise. Alternatively, Lan Ha Bay (Cat Ba Island) is less touristy and easier to arrange independently.',
   'seed', sp_anna),
  (t11, demo_author,
   'Bat Trang pottery village is an easy solo trip. Take bus 47 from Long Bien station (about 30 minutes, 7,000 VND). The village is small and safe. You can do a pottery class for about 50,000 to 100,000 VND. Great for a half-day trip and you get to bring home something you made.',
   'seed', sp_priya),
  (t11, demo_author,
   'If you want the best balance of independence and safety, Ninh Binh and Bat Trang are the easiest solo day trips. Both have straightforward public transport, English signage, and a steady flow of other tourists so you never feel isolated.',
   'system', NULL),
  (t11, demo_author,
   'Perfume Pagoda is beautiful but involves a long boat ride and a cable car or steep hike. I did it solo and it was fine, but the hawkers at the base can be intense. Go on a weekday if possible and be firm with people trying to sell you things. The pagoda itself is spectacular.',
   'seed', sp_lucia);

  -- -------------------------------------------------------
  -- THREAD 12: Honest take on Ubud (Anna)
  -- -------------------------------------------------------
  INSERT INTO community_threads (id, author_id, title, body, country_id, city_id, topic_id, author_type, is_seed, seed_profile_id)
  VALUES (gen_random_uuid(), demo_author,
    'Honest take on Ubud: still worth it or too crowded?',
    'I have been living in Ubud for six months and get this question constantly. Here is my honest take for solo women planning a visit.' || chr(10) || chr(10) ||
    'Central Ubud (Monkey Forest Road, Jalan Raya) is very tourist-heavy. Cafes are designed for Instagram, prices are inflated, and it can feel more like a wellness theme park than a Balinese town. But walk 10 minutes in any direction and you are in rice fields with almost nobody around.' || chr(10) || chr(10) ||
    'My recommendation: stay outside the center. Penestanan, Campuhan, or Keliki are all within a 10-minute scooter ride and feel completely different. Cheaper too. A private room in Penestanan costs 200,000 to 350,000 IDR ($13 to $23) per night.' || chr(10) || chr(10) ||
    'For solo women specifically: Ubud is very safe, the yoga and wellness community means there are always other women traveling alone, and the food scene is exceptional. It is still worth visiting, just manage your expectations about the center.',
    id_country, bali_city, topic_itinerary, 'seed', true, sp_anna)
  RETURNING id INTO t12;

  -- Replies for T12
  INSERT INTO community_replies (thread_id, author_id, body, author_type, seed_profile_id) VALUES
  (t12, demo_author,
   'This matches my experience exactly. I stayed in Penestanan for two weeks and loved it. The Campuhan Ridge Walk at sunrise is magical and free. Tegallalang rice terraces are overcrowded, but Jatiluwih (a 45-minute drive) is the same beauty with a fraction of the visitors.',
   'seed', sp_mei),
  (t12, demo_author,
   'I would add Sidemen to the list of alternatives. About an hour east of Ubud, it has the rice terrace views, the volcanoes in the background, and a fraction of the tourists. Accommodation is even cheaper. If you have a week in Bali, split it between Ubud (3 days) and Sidemen (4 days).',
   'seed', sp_sarah),
  (t12, demo_author,
   'For anyone visiting Ubud, here are a few places worth your time: Yoga Barn (classes from 130,000 IDR), Locavore restaurant (splurge but incredible), Tirta Empul water temple (go early), and the Ubud Palace dance performance (60,000 IDR, every evening). Skip the Monkey Forest if crowds bother you.',
   'system', NULL),
  (t12, demo_author,
   'Honest question: is the "digital nomad cafe" culture in Ubud as annoying as people say? I am planning to work remotely there for a month and want to know if the coworking options are actually productive or just vibes.',
   'seed', sp_lucia),
  (t12, demo_author,
   'Responding to the coworking question: Outpost and Hubud are both solid for actual work. Good wifi, quiet zones, and monthly passes around 2,000,000 IDR ($130). The cafes along Jalan Raya are fine for a morning session but get loud by noon. I got more done at the coworking spaces.',
   'seed', sp_anna);

END $$;
