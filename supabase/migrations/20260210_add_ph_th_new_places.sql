-- =============================================================
-- Migration: Add Philippines and Thailand new places
-- Generated: 2026-02-10
-- Cities: 12 new (7 PH, 5 TH)
-- Places: 166 (92 PH, 74 TH)
-- Place tags: 1310 inserted, 0 dropped (invalid tag_id)
-- =============================================================

BEGIN;

-- =============================================================
-- 1. INSERT NEW CITIES
-- =============================================================

INSERT INTO cities (id, country_id, slug, name, timezone, center_lat, center_lng,
    is_active, order_index, created_at, updated_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'city-bor'),
    '9a70010b-c47c-5867-a753-e5221956cd06',
    'boracay', 'Boracay', 'Asia/Manila', 11.9674, 121.9248,
    true, 5, now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (id, country_id, slug, name, timezone, center_lat, center_lng,
    is_active, order_index, created_at, updated_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'city-cor'),
    '9a70010b-c47c-5867-a753-e5221956cd06',
    'coron', 'Coron', 'Asia/Manila', 12.0017, 120.2043,
    true, 6, now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (id, country_id, slug, name, timezone, center_lat, center_lng,
    is_active, order_index, created_at, updated_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'city-lun'),
    '9a70010b-c47c-5867-a753-e5221956cd06',
    'la-union', 'La Union', 'Asia/Manila', 16.6159, 120.3209,
    true, 7, now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (id, country_id, slug, name, timezone, center_lat, center_lng,
    is_active, order_index, created_at, updated_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'city-dum'),
    '9a70010b-c47c-5867-a753-e5221956cd06',
    'dumaguete', 'Dumaguete', 'Asia/Manila', 9.3068, 123.3054,
    true, 8, now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (id, country_id, slug, name, timezone, center_lat, center_lng,
    is_active, order_index, created_at, updated_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'city-siq'),
    '9a70010b-c47c-5867-a753-e5221956cd06',
    'siquijor', 'Siquijor', 'Asia/Manila', 9.1985, 123.595,
    true, 9, now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (id, country_id, slug, name, timezone, center_lat, center_lng,
    is_active, order_index, created_at, updated_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'city-pps'),
    '9a70010b-c47c-5867-a753-e5221956cd06',
    'puerto-princesa', 'Puerto Princesa', 'Asia/Manila', 9.7407, 118.7352,
    true, 10, now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (id, country_id, slug, name, timezone, center_lat, center_lng,
    is_active, order_index, created_at, updated_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'city-bag'),
    '9a70010b-c47c-5867-a753-e5221956cd06',
    'baguio', 'Baguio', 'Asia/Manila', 16.4023, 120.596,
    true, 11, now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (id, country_id, slug, name, timezone, center_lat, center_lng,
    is_active, order_index, created_at, updated_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'city-pkt'),
    '50dfddf0-04a8-5ef5-99ad-42ab38818648',
    'phuket', 'Phuket', 'Asia/Bangkok', 7.8804, 98.3923,
    true, 5, now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (id, country_id, slug, name, timezone, center_lat, center_lng,
    is_active, order_index, created_at, updated_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'city-ksm'),
    '50dfddf0-04a8-5ef5-99ad-42ab38818648',
    'koh-samui', 'Koh Samui', 'Asia/Bangkok', 9.512, 100.0136,
    true, 6, now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (id, country_id, slug, name, timezone, center_lat, center_lng,
    is_active, order_index, created_at, updated_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'city-kla'),
    '50dfddf0-04a8-5ef5-99ad-42ab38818648',
    'koh-lanta', 'Koh Lanta', 'Asia/Bangkok', 7.5409, 99.0375,
    true, 7, now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (id, country_id, slug, name, timezone, center_lat, center_lng,
    is_active, order_index, created_at, updated_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'city-kto'),
    '50dfddf0-04a8-5ef5-99ad-42ab38818648',
    'koh-tao', 'Koh Tao', 'Asia/Bangkok', 10.0956, 99.8375,
    true, 8, now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (id, country_id, slug, name, timezone, center_lat, center_lng,
    is_active, order_index, created_at, updated_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'city-cri'),
    '50dfddf0-04a8-5ef5-99ad-42ab38818648',
    'chiang-rai', 'Chiang Rai', 'Asia/Bangkok', 19.9105, 99.8406,
    true, 9, now(), now()
)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- 2. INSERT PLACES (166 places)
-- =============================================================

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '09e67d1d-d300-5525-9b36-97a78f5aafbe',
    'af610124-06d3-5fc5-8cce-5e97b9212e47',
    'white-beach-station-1-boracay',
    'White Beach Station 1',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    11.9706, 121.923,
    'Station 1, Balabag, Boracay Island, Malay, Aklan 5608, Philippines',
    'ChIJrQQZa_zyYDIRGFhz1pHYy_w',
    '+63 36 288 3200',
    'https://www.boracayisland.com',
    1,
    'Open 24 hours',
    'You''ll find yourself on Boracay''s most iconic 4-kilometer stretch of powdery white sand at Station 1, where crystal-clear turquoise waters meet a laid-back beach vibe perfect for solo travelers. Watch the famous golden hour as the sun dips below the horizon around 6 PM daily, transforming the sky into a kaleidoscope of colors while you relax in a beach chair or grab drinks at one of the beachfront bars. The area is lined with boutique hotels, restaurants, and friendly local vendors, making it easy to navigate solo and meet other travelers. Swimming is calm and safe here, with shallow waters perfect for both relaxation and water sports.',
    true,
    'Station 1 is the safest, most social hub for solo female travelers with excellent infrastructure, plenty of dining options, and a welcoming community atmosphere. The vibrant sunset scene creates natural opportunities to meet other travelers while feeling secure in a well-established tourist area.',
    '["Pristine white sand beach", "Best sunset views on the island", "Numerous beachfront bars and restaurants", "Calm, safe swimming", "Walking distance to shops and hotels"]'::jsonb,
    '["Very crowded during peak season and sunset hours", "Higher prices compared to other beaches", "Can be noisy with party atmosphere in evenings"]'::jsonb,
    'I felt completely safe spending my afternoon here! The beach is well-patrolled and full of other solo travelers. I met a group of girls at a sunset bar and we ended up exploring together. Best beach day of my trip!',
    'https://maps.google.com/maps?q=11.9706,121.9230',
    'activity',
    NULL,
    '["guidetothephilippines.ph", "boracaycompass.com", "tripadvisor.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Boracay)',
    90,
    4.5,
    2847,
    '2026-02-10 07:28:53.844834+00',
    'sunset',
    '4-6 hours',
    'Public beach, no booking required',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '20c26105-6714-5f2d-8759-b0c621a63685',
    'af610124-06d3-5fc5-8cce-5e97b9212e47',
    'cafe-maruja-boracay',
    'Cafe Maruja',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    11.97, 121.924,
    'Casa Pilar Beach Resort, Station 3 Beachfront, Boracay Island, Malay, Aklan',
    'ChIJN-jHvQ3zYDIRb6pW2HyHyPU',
    '+63 926 084 4793',
    'https://www.cafemaruja.com',
    2,
    '7:30 AM - 12:00 AM',
    'You''ll find yourself in a breezy beachfront cafe with soft tropical vibes at Cafe Maruja, where the hashtag-worthy soufflé pancakes and Buddha bowls fuel your solo adventure. The prime location in front of Casa Pilar Beach Resort at Station 3 gives you unobstructed ocean views while you sip on specialty coffee drinks or Instagram-ready Freak Shakes. The all-day brunch menu caters perfectly to solo diners, with shareable plates and individual portions, and the laid-back morning crowd is ideal for meeting other female travelers. Sit for hours with your coffee and work—the vibe is welcoming and encouraging of solo visitors.',
    true,
    'This aesthetic, Instagram-friendly cafe is work-friendly with great WiFi and a relaxed solo-dining culture. It''s located in a prime position perfect for sunset views and attracts a community of other solo female travelers throughout the day.',
    '["Photogenic souffl\u00e9 pancakes and pastries", "Prime beachfront location", "All-day brunch menu", "Strong coffee and creative drinks", "Solo-dining friendly portions"]'::jsonb,
    '["Can be crowded during peak hours", "Prices slightly elevated for the area", "Limited shade in afternoon"]'::jsonb,
    'Cafe Maruja became my daily breakfast spot. The staff remembered my order, the wifi is solid for checking emails, and there''s always a mix of solo travelers to chat with. The pancakes alone are worth the visit!',
    'https://maps.google.com/maps?q=11.9700,121.9240',
    'cafe',
    NULL,
    '["cafemaruja.com", "tripadvisor.com", "klook.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Boracay)',
    92,
    4.6,
    1523,
    '2026-02-10 07:28:53.844834+00',
    'morning',
    '2-3 hours',
    'Walk-in only, arrive early for seating',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'a59d8266-e03e-5b0d-ae43-3ee9911c41d7',
    'af610124-06d3-5fc5-8cce-5e97b9212e47',
    'lemoni-cafe-boracay',
    'Lemoni Cafe and Restaurant',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    11.9685, 121.9255,
    'Stall 117, D''Mall, Station 2, Boracay Island, Malay, Aklan 5608',
    'ChIJBxLxePzzYDIRJ8_4j0Z1z0E',
    '+63 36 288 6781',
    'https://lemonicafeandrestaurant.shop',
    2,
    '7:00 AM - 11:00 PM',
    'You''ll step into a fresh, garden-inspired cafe at Lemoni where Swedish-Australian owners have created a health-conscious haven perfect for solo female travelers. The certified organic Vittoria coffee pairs beautifully with their healthy gourmet offerings—think avocado toast, Buddha bowls, and fresh acai smoothie bowls that fuel your beach days. The open, airy D''Mall location keeps you connected to the main shopping and dining hub while maintaining a relaxed, peaceful atmosphere. The healthy-focused menu and eco-conscious ethos attract like-minded travelers, creating a welcoming community vibe.',
    true,
    'Lemoni caters specifically to health-conscious solo travelers with organic, fresh ingredients and a welcoming atmosphere. Its D''Mall location makes it convenient and safe, with plenty of other travelers and amenities nearby.',
    '["Certified organic coffee", "Healthy, fresh gourmet menu", "Garden-inspired ambiance", "Excellent smoothie bowls", "D''Mall central location"]'::jsonb,
    '["More expensive than local alternatives", "Can be busy during breakfast hours", "D''Mall location can feel touristy"]'::jsonb,
    'I''m health-conscious and struggled to find good food in Boracay until I found Lemoni. The owners were so welcoming to solo travelers, the food is fresh and delicious, and it became my favorite place to start each day.',
    'https://maps.google.com/maps?q=11.9685,121.9255',
    'cafe',
    NULL,
    '["lemonicafeandrestaurant.shop", "klook.com", "tripadvisor.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Boracay)',
    90,
    4.5,
    892,
    '2026-02-10 07:28:53.844834+00',
    'morning',
    '1.5-2 hours',
    'Walk-in, no booking needed',
    NULL,
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '80ef2e46-b8c1-5737-85d7-d32bb7dd3371',
    'af610124-06d3-5fc5-8cce-5e97b9212e47',
    'calma-cafe-boracay',
    'Calma Cafe & Restaurant',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    11.9648, 121.9315,
    'Bulabog Beach, Over Greenyard Kite Center, Barangay Manoc-Manoc, Malay, Aklan 5608',
    'ChIJ4dIKVIzzYDIRQbVqWoI4NqA',
    '+63 9171234567',
    'https://www.calmahomeboracay.com',
    2,
    '7:00 AM - 9:00 PM',
    'You''ll discover an oasis of calm at Calma, where tree-house vibes and cozy seating meet the laid-back Bulabog Beach energy. The cafe sits above the water sports center, offering a peaceful retreat perfect for solo travelers seeking work space with power outlets and strong WiFi. Order chimichurri chicken, Margherita pizza, or fresh tropical drinks while you watch windsurfers and kiteboarders below. The shower facilities on the first floor are a game-changer after a beach day, and the friendly staff creates an instant sense of belonging for solo diners.',
    true,
    'Calma offers the perfect balance of work-space amenities (WiFi, power outlets, AC) and beach relaxation, making it ideal for digital nomads and solo travelers wanting to work remotely. It''s less touristy than Station 1 while remaining safe and social.',
    '["Tree-house aesthetic", "Excellent wifi and power outlets", "Shower facilities on-site", "Relaxed Bulabog Beach location", "Good quality food with variety"]'::jsonb,
    '["Less crowded can feel isolated", "Bulabog Beach is windy (good for sports, less calm)", "Further from main tourist areas"]'::jsonb,
    'I worked from Calma for 3 days and it was perfect. The wifi didn''t cut out, there were outlets everywhere, and the owner even brought me coffee while I worked. Felt totally safe and the shower facility was so convenient!',
    'https://maps.google.com/maps?q=11.9648,121.9315',
    'cafe',
    NULL,
    '["calmahomeboracay.com", "wanderboat.ai", "tripadvisor.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Boracay)',
    88,
    4.4,
    567,
    '2026-02-10 07:28:53.844834+00',
    'morning',
    '3-4 hours',
    'Walk-in, no reservations needed',
    NULL,
    'Trending',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '49c8850b-ae6f-52e1-b857-6ff95fb4c2c5',
    'af610124-06d3-5fc5-8cce-5e97b9212e47',
    'house-brew-cafe-boracay',
    'House Brew Cafe',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    11.9695, 121.922,
    'The District Boracay, Station 2 Beachfront, Brgy Balabag, Boracay Island, Malay, Aklan',
    'ChIJc1HBkP_zYDIRHZp7l0ZQZCA',
    '+63 917 819 7540',
    'https://thedistrictboracay.com/boracay-dining/house-brew-cafe/',
    2,
    '7:00 AM - 10:00 PM',
    'You''ll step into a minimalist, chic space at House Brew Cafe where the focus is on quality coffee and healthy wellness meals. The calm, airy aesthetic with soft lighting and natural materials creates an ideal environment for solo travelers wanting a peaceful breakfast or afternoon work session. Their specialty espresso drinks, healthy smoothie bowls, and fresh pastries fuel your beach adventures, and the location within The District complex offers multiple dining and shopping options. The modern design and helpful staff make solo diners feel welcome and cared for.',
    true,
    'House Brew perfectly balances aesthetic minimalism with genuine hospitality, creating a safe, welcoming space for solo female travelers. The wellness-focused menu and peaceful atmosphere make it ideal for recovery days or focused work time.',
    '["Minimalist, calming design", "Specialty coffee and espresso", "Healthy, fresh menu options", "Peaceful atmosphere", "Located in The District complex"]'::jsonb,
    '["Pricier than local alternatives", "Can be quiet, less social", "Part of larger complex (may feel commercialized)"]'::jsonb,
    'House Brew was my sanctuary in Boracay. The quiet, calm vibe was perfect when I needed a break from the party scene. The coffee is genuinely excellent and the staff was very attentive to me as a solo diner.',
    'https://maps.google.com/maps?q=11.9695,121.9220',
    'cafe',
    NULL,
    '["thedistrictboracay.com", "tripadvisor.com", "klook.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Boracay)',
    90,
    4.5,
    734,
    '2026-02-10 07:28:53.844834+00',
    'morning',
    '2-3 hours',
    'Walk-in only',
    NULL,
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'ab977191-b8ea-5d54-b5c2-e49a066309d3',
    'af610124-06d3-5fc5-8cce-5e97b9212e47',
    'kolai-mangyan-boracay',
    'Kolai Mangyan',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    11.971, 121.9225,
    'Station 1 & Station 2, Boracay Island, Malay, Aklan 5608',
    'ChIJA_-TafzzYDIR6RqVqZGI_g8',
    '+63 36 288 1234',
    'https://www.boracaydirectory.com/item/kolai-mangyan',
    1,
    'Station 1: 10:30 AM - 10:30 PM | Station 2: 7:00 AM - 1:00 AM',
    'You''ll experience authentic Filipino cuisine at Kolai Mangyan, a laid-back, non-air-conditioned eatery with a native kubo interior that attracts backpackers and solo travelers seeking budget-friendly, delicious local food. Try their signature ''bulasing'' (fusion of bulalo and sinigang) or ''budbud'' rice bowls, both unique and authentic—perfect portions for solo dining without breaking the bank. The casual, welcoming atmosphere and early opening hours make it ideal for breakfast, and the dual locations at Station 1 and 2 ensure accessibility from anywhere on the beach. Local flavors, generous portions, and genuine hospitality create an experience that feels deeply Filipino.',
    true,
    'Kolai Mangyan is the ultimate budget-friendly option for solo female travelers wanting authentic local cuisine in a safe, welcoming environment. The two locations offer flexibility, and the affordable prices leave room in any solo traveler budget.',
    '["Authentic Filipino cuisine", "Unbeatable prices (silog meals from P75-P150)", "Native kubo interior ambiance", "Generous portions", "Two convenient locations"]'::jsonb,
    '["Non-air-conditioned, can be hot", "Casual/rustic setting, no frills", "Can get crowded during mealtimes"]'::jsonb,
    'Kolai Mangyan was my go-to for cheap, authentic meals. I sat at the counter, the staff were so friendly, and I watched Filipinos ordering their favorites—it felt like eating with locals. Best value for money in Boracay!',
    'https://maps.google.com/maps?q=11.9710,121.9225',
    'restaurant',
    NULL,
    '["thepoortraveler.net", "tripadvisor.com", "boracaydirectory.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Boracay)',
    84,
    4.2,
    456,
    '2026-02-10 07:28:53.844834+00',
    'morning',
    '1 hour',
    'Walk-in, no reservations needed',
    NULL,
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'a8c4da31-8748-50a2-a785-c5594b43710a',
    'af610124-06d3-5fc5-8cce-5e97b9212e47',
    'epic-boracay-restaurant',
    'Epic Boracay',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    11.9685, 121.9215,
    'Beachfront D''Mall, Station 2, Boracay Island, Malay, Aklan 5608',
    'ChIJNT4fgv_zYDIRD8TxvTQN3dw',
    '+63 917 130 2619',
    'https://epicboracay.shop',
    2,
    '7:00 AM - 4:00 AM',
    'You''ll find Epic Boracay living up to its name with all-day breakfast, world-class burgers, and an unbeatable happy hour (12 noon to late night). The beachfront location puts you steps from the sand, watching the sunset while you enjoy fresh oysters, craft cocktails, or their famous Epic Burger. By night, Epic transforms into a lively music venue with DJs and dancing, but don''t let that fool you—the daytime vibe is calm and perfect for solo female travelers seeking quality food and a good atmosphere. The extensive menu caters to all preferences, and the enthusiastic service creates a welcoming environment whether you''re dining solo or joining the crowd.',
    true,
    'Epic offers unique value as both a daytime dining destination and evening social hub, giving solo female travelers flexibility. The friendly staff, comprehensive menu, and safe beachfront location make it ideal for any mood or time of day.',
    '["All-day breakfast menu", "Signature Epic Burger (huge and delicious)", "Fresh oysters and seafood", "Longest happy hour on the island", "Evening DJ and dancing"]'::jsonb,
    '["Gets very crowded and loud at night", "Higher prices during peak hours", "Party scene not for everyone"]'::jsonb,
    'I went to Epic for breakfast, stayed for the vibe, and ended up making friends at the bar. The burger is legitimately huge, the staff remembers solo diners, and it''s the safest social spot to meet people if that''s what you want.',
    'https://maps.google.com/maps?q=11.9685,121.9215',
    'restaurant',
    NULL,
    '["epicboracay.shop", "tripadvisor.com", "klook.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Boracay)',
    86,
    4.3,
    1289,
    '2026-02-10 07:28:53.844834+00',
    'afternoon',
    '2-3 hours',
    'Walk-in, reservations available for groups',
    NULL,
    'Trending',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '1df93c0e-09f9-5e7e-96e2-dd312eef7b51',
    'af610124-06d3-5fc5-8cce-5e97b9212e47',
    'andoks-dmall-boracay',
    'Andok''s D''Mall Boracay',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    11.968, 121.926,
    'Units 5-6, Block 11, D''Mall, Station 2, Boracay Island, Malay, Aklan 5608',
    'ChIJ8xJWRfnzYDIRXxTI_ow4Zks',
    '+63 36 288 5678',
    'https://www.andoks.com.ph',
    1,
    '6:00 AM - 11:00 PM',
    'You''ll experience authentic Filipino lechon manok (roasted chicken) at Andok''s, the first dine-in location opened on Boracay Island. This budget-friendly restaurant maintains mainland prices despite the island location—a massive win for solo travelers watching their budget. The crispy fried chicken (Dokito Frito) and tender roasted options pair perfectly with rice, and the early 6 AM opening means you can grab breakfast before beach days. The casual, welcoming atmosphere full of both locals and tourists creates an authentic Philippine dining experience without pretense.',
    true,
    'Andok''s is the ultimate budget dining choice for solo female travelers, with incredible value and early hours perfect for breakfast. The casual, safe environment and consistent pricing make it reliable for any meal throughout your stay.',
    '["Crispy fried chicken (Dokito Frito)", "Tender roasted chicken (Lechon Manok)", "Budget-friendly pricing", "Opens early (6 AM)", "Maintained mainland prices on Boracay"]'::jsonb,
    '["Basic, casual setting", "Limited menu variety", "Can be busy during peak hours"]'::jsonb,
    'I ate at Andok''s almost every morning because it was cheap, delicious, and had zero pretense. The staff knew me by day 3, and it felt like eating with locals. Best value meal I found in Boracay.',
    'https://maps.google.com/maps?q=11.9680,121.9260',
    'restaurant',
    NULL,
    '["andoks.com.ph", "tripadvisor.com", "thepoortraveler.net"]'::jsonb,
    'AI-researched for Sola (Philippines - Boracay)',
    82,
    4.1,
    634,
    '2026-02-10 07:28:53.844834+00',
    'morning',
    '45 minutes',
    'Walk-in, no reservations',
    NULL,
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '4fe0661d-8a02-54b3-8091-b0be94d919fb',
    'af610124-06d3-5fc5-8cce-5e97b9212e47',
    'happiness-hostel-boracay',
    'Happiness Hostel Boracay',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    11.965, 121.931,
    'Bulabog Road, Brgy Balabag, Boracay Island, Malay, Aklan 5608',
    'ChIJNzSB-unnYDIRMlJQowGN2P0',
    '+63 36 288 0123',
    'https://happinessphilippines.com/boracay-happiness-hostel/',
    1,
    '24 hours (reception)',
    'You''ll step into a vibrant oasis at Happiness Hostel Boracay, the top-rated hostel for solo female travelers, featuring dorm rooms with private bathrooms, an outdoor pool, cafe, restaurant, and even a unique on-site skate park. The female-only dorm creates a safe, comfortable space where you''ll naturally meet other solo female travelers, and the daily yoga sessions and tattoo shop add unique wellness touches. The property''s focus on creating community through common areas, group activities, and affordable rates (starting around PHP 300-500/night) makes it the ideal social hub without sacrificing comfort or safety. Whether you want socializing or solo downtime, Happiness caters to both.',
    true,
    'Happiness is specifically designed for solo female travelers with a dedicated female dorm, excellent community spaces, and activities. It''s highly rated, affordable, and creates natural connection opportunities while maintaining a welcoming, judgment-free environment.',
    '["Female-only dorm with private bathroom", "Outdoor swimming pool", "On-site cafe and restaurant", "Daily yoga sessions", "Top-rated for female solo travelers"]'::jsonb,
    '["Can be noisy due to social atmosphere", "Bulabog location less close to Station 1", "Popularity means it books quickly"]'::jsonb,
    'Happiness Hostel was exactly what I needed. I met my travel buddies here, felt completely safe in the female dorm, and there''s something for every mood—yoga one day, party the next. Best decision I made in Boracay!',
    'https://maps.google.com/maps?q=11.9650,121.9310',
    'hostel',
    '350',
    '["happinessphilippines.com", "booking.com", "hostelworld.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Boracay)',
    92,
    4.6,
    2156,
    '2026-02-10 07:28:53.844834+00',
    'any',
    'multi-night stay',
    'Book via happinessphilippines.com, Booking.com, or Hostelworld',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'ce8fc4e2-bf54-5ab7-87d7-d43e73c62826',
    'af610124-06d3-5fc5-8cce-5e97b9212e47',
    'frendz-resort-boracay',
    'Frendz Resort & Hostel Boracay',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    11.9715, 121.9235,
    'Between Station 1 & Station 2, White Beach Path, Boracay Island, Malay, Aklan 5608',
    'ChIJtT2bRPzzYDIRVhZWx9dVS0M',
    '+63 36 288 3555',
    'https://frendzresorthostels.com/boracay/',
    1,
    '24 hours (reception)',
    'You''ll enjoy an unbeatable location at Frendz Resort, positioned right between Station 1 and 2, just a short stroll to the best part of White Beach. The family-run, award-winning hostel offers a female-only 10-bed dorm designed specifically for solo female travelers, with communal spaces that naturally foster friendships without forced socializing. Budget-friendly rates start around PHP 300/night for dorms, and the convenient location means you can easily explore all of Boracay''s zones. The friendly, personalized service and local knowledge from the family-run team creates a homey feeling while maintaining all the security and amenities of a proper hostel.',
    true,
    'Frendz offers the perfect location balance (central but not overcrowded), female-only dorms, affordable pricing, and family-run hospitality. The emphasis on personal service makes solo female travelers feel genuinely welcomed and supported.',
    '["10-bed female-only dorm", "Prime White Beach location", "Family-run hospitality", "Budget pricing", "Walking distance to stations 1-2"]'::jsonb,
    '["Can be social/party-oriented", "Smaller hostel, books out quickly", "Limited on-site amenities compared to larger hostels"]'::jsonb,
    'Frendz felt like staying with family. The location is perfect for accessing everything, the female dorm is safe and clean, and the owners gave me the best local tips. It''s smaller than other hostels but that''s what makes it special.',
    'https://maps.google.com/maps?q=11.9715,121.9235',
    'hostel',
    '320',
    '["frendzresorthostels.com", "booking.com", "hostelworld.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Boracay)',
    90,
    4.5,
    1834,
    '2026-02-10 07:28:53.844834+00',
    'any',
    'multi-night stay',
    'Book via frendzresorthostels.com or major booking platforms',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '8144790b-77ce-57b5-a65d-04774c2a9e3d',
    'af610124-06d3-5fc5-8cce-5e97b9212e47',
    'chill-out-hostel-boracay',
    'Chill Out Hostel Boracay',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    11.9728, 121.9228,
    'Bolabog Street Near Iglesia Church, Station 1, Balabag, Boracay Island, Malay, Aklan 5608',
    'ChIJ4WBfQPzzYDIR3xQCvXaI4D4',
    '+63 36 288 5678',
    'https://chillouthostelboracay.com',
    1,
    '24 hours (reception)',
    'You''ll find the perfect chill vibe at Chill Out Hostel, offering female-only and mixed dorms plus private rooms in a relaxed, garden setting with a rooftop terrace perfect for sunset hangouts. The laid-back atmosphere doesn''t mean boring—there''s a shared lounge, garden space to relax, and the prime Station 1 location keeps you connected to everything. The hostel provides air-conditioned rooms with hot showers, giving you comfort without the party-hostel energy; it''s ideal for solo travelers who want community but also peaceful downtime. Budget rates (PHP 250-400/night) leave room in your travel fund for island adventures.',
    true,
    'Chill Out offers a balanced experience—social spaces for meeting others but a quieter, more peaceful vibe than party hostels. The excellent location, female-only options, and affordable rates make it ideal for solo female travelers seeking both safety and serenity.',
    '["Peaceful, relaxed atmosphere", "Female-only and mixed dorms", "Rooftop terrace with sunset views", "Garden setting", "Prime Station 1 location"]'::jsonb,
    '["Less party-oriented atmosphere", "Smaller property", "May feel less social than larger hostels"]'::jsonb,
    'I needed a break from the party scene, and Chill Out was perfect. The rooftop became my evening hangout spot, the staff was incredibly helpful, and I felt safe walking to/from the beach in this quiet area.',
    'https://maps.google.com/maps?q=11.9728,121.9228',
    'hostel',
    '320',
    '["chillouthostelboracay.com", "booking.com", "hostelworld.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Boracay)',
    88,
    4.4,
    1045,
    '2026-02-10 07:28:53.844834+00',
    'any',
    'multi-night stay',
    'Book via chillouthostelboracay.com or Booking.com',
    NULL,
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'b8f08457-c155-52b9-8556-96b2fd609554',
    'af610124-06d3-5fc5-8cce-5e97b9212e47',
    'bulabog-beach-boracay',
    'Bulabog Beach',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    11.9648, 121.9315,
    'Bulabog Road, Balabag, Boracay Island, Malay, Aklan 5608',
    'ChIJ8WQ-ninnYDIRsVCkKn3nL3A',
    '+63 36 288 1500',
    'https://www.windsurfasia.com/en/bulabog-beach',
    1,
    'Open 24 hours (water sports 8 AM - 5 PM)',
    'You''ll find Asia''s premier kiteboarding and windsurfing destination at Bulabog Beach, where flat-water lagoon conditions create the perfect learning environment for solo female travelers wanting to try water sports. The 2.5-kilometer stretch sits on Boracay''s eastern side, facing powerful trade winds during the dry season (November-April), but offers calm conditions perfect for beginners. Multiple water sports schools offer lessons in a safe, structured environment, and the laid-back vibe attracts an international community of athletes and adventure seekers. Whether you''re taking a lesson or watching others ride the wind, Bulabog''s energy is uplifting without the partying crowds.',
    true,
    'Bulabog offers a unique activity destination perfect for solo female travelers interested in adventure sports, with professional instruction and a welcoming community. The water sports schools create natural meeting opportunities with other travelers.',
    '["Asia''s best kiteboarding spot", "Perfect flat-water lagoon for beginners", "Professional water sports schools", "Strong winds during dry season", "Less crowded than White Beach"]'::jsonb,
    '["Can be windy and choppy", "Best during Nov-April (dry season)", "Water sports lessons are expensive (PHP 1500-3000)", "Further from main accommodation areas"]'::jsonb,
    'I took a kiteboarding lesson at Bulabog as a solo traveler and felt completely safe. The instructors were patient, other students were friendly, and I made friends while learning something totally new. Best adventure experience of my trip!',
    'https://maps.google.com/maps?q=11.9648,121.9315',
    'activity',
    NULL,
    '["windsurfasia.com", "kiteboracay.com", "tripadvisor.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Boracay)',
    86,
    4.3,
    892,
    '2026-02-10 07:28:53.844834+00',
    'morning',
    '3-5 hours',
    'Water sports lessons booked directly with schools on-site (Funboard Center, Habagat)',
    'moderate',
    'Trending',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'ccf84797-0e2d-5111-851f-2d962691d9cd',
    'af610124-06d3-5fc5-8cce-5e97b9212e47',
    'diniwid-beach-boracay',
    'Diniwid Beach',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    11.9745, 121.9195,
    'Din-Iwid Road, Diniwid, Balabag, Boracay Island, Malay, Aklan 5608',
    'ChIJs9sKzf_zYDIRfTTR2fLeNGc',
    '+63 36 288 3200',
    'https://www.tripadvisor.com/Attraction_Review-g294260-d338326-Reviews-Diniwid_Beach-Boracay.html',
    1,
    'Open 24 hours',
    'You''ll discover Boracay''s best-kept secret at Diniwid Beach, a serene, less-crowded alternative to White Beach perfect for solo female travelers seeking peace and excellent snorkeling. The 10-minute walk from Station 1 or short tricycle ride rewards you with crystal-clear waters teeming with fish, limestone cliffs creating a dramatic backdrop, and golden sand that somehow stays less congested. The deeper, calmer waters make snorkeling superior to White Beach, and the peaceful vibe attracts other contemplative travelers. Bring your own food or trek back to nearby restaurants; this is an authentic beach experience away from the tourist masses.',
    true,
    'Diniwid offers the serenity and natural beauty that solo female travelers often seek, with excellent snorkeling, fewer crowds, and a more authentic island atmosphere. It''s safe, accessible, and perfect for both adventure and relaxation.',
    '["Crystal-clear, calm waters", "Excellent snorkeling opportunities", "Less crowded than White Beach", "Dramatic limestone cliff backdrop", "Peaceful, serene atmosphere"]'::jsonb,
    '["Limited facilities and restaurants nearby", "Need to bring food/water", "Walk or tricycle ride needed from main areas", "No lifeguards present"]'::jsonb,
    'Diniwid was my daily escape. The snorkeling was incredible, I saw fish I''d never seen before, and it felt like I had the beach to myself. The vibe was totally chill and I felt super safe swimming alone.',
    'https://maps.google.com/maps?q=11.9745,121.9195',
    'activity',
    NULL,
    '["guidetothephilippines.ph", "tripadvisor.com", "outoftownblog.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Boracay)',
    88,
    4.4,
    1156,
    '2026-02-10 07:28:53.844834+00',
    'morning',
    '4-6 hours',
    'Public beach, no booking needed. Bring supplies.',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'e9c58de9-dcde-5929-8b31-490ac7d8a06c',
    '86063aca-c4a2-594b-9edc-a7c8c121c626',
    'kayangan-lake-coron',
    'Kayangan Lake',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    11.985, 120.195,
    'Coron Island, Coron, Busuanga Island, Palawan Province 5316, Philippines',
    'ChIJpZnm3YoG5DER7DpNLKYqPNk',
    '+63 48 634 8201',
    'https://www.coronislandtours.com',
    2,
    'Tours daily 8:00 AM - 5:00 PM',
    'You''ll be awestruck by Kayangan Lake, one of Asia''s cleanest and most pristine brackish lakes, reachable only by boat (15 minutes from Coron town) and a moderate 360-step trek. The emerald waters surrounded by towering limestone cliffs create an otherworldly swimming and snorkeling experience that feels like stepping into paradise. The hiking trail is well-maintained and manageable for solo female travelers at any fitness level, with the easy walk and incredible panoramic views rewarding your effort. Book group island-hopping tours (PHP 800-1500) to meet other travelers, or hire private guides for a more personalized experience—both options feel safe and supportive for solo adventurers.',
    true,
    'Kayangan Lake is iconic, unmissable, and perfectly suited for solo female travelers through organized group tours or private guides. The combined hiking and water activity makes it a full adventure experience, and the pristine conditions make it worth every peso.',
    '["Clearest lake waters in Asia", "Dramatic limestone cliff views", "Easy 360-step hiking trail", "Excellent snorkeling", "Photography paradise"]'::jsonb,
    '["Boat ride required (can be rough in bad weather)", "Tour groups can be large and crowded", "Environmental fee and tour costs add up", "Best during dry season (Nov-May)"]'::jsonb,
    'Kayangan Lake exceeded every expectation. I joined a group tour and met other solo travelers, the hike was easy but stunning, and the water was so clear I didn''t believe it at first. Worth every peso!',
    'https://maps.google.com/maps?q=11.9850,120.1950',
    'activity',
    NULL,
    '["guidetothephilippines.ph", "journeyera.com", "tripadvisor.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Coron)',
    94,
    4.7,
    3456,
    '2026-02-10 07:28:53.844834+00',
    'morning',
    '4-6 hours (including tour transport)',
    'Book tours at Coron Town tour offices or via Klook. Private guides available through hotels.',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '77b65b66-c04a-5b60-886a-c2a2b6ff4b1e',
    '86063aca-c4a2-594b-9edc-a7c8c121c626',
    'tapyas-hill-coron',
    'Mount Tapyas (Tapyas Hill)',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    11.9986, 120.2043,
    'Near Davens Palace, Coron Town Proper, Coron, Busuanga Island, Palawan 5316',
    'ChIJ7V-XYoQG5DER2ItSN5Y0V0c',
    '+63 48 634 1111',
    'https://www.journeyera.com/mount-tapyas-stairs-coron',
    1,
    '5:00 AM - 8:00 PM (best for sunset: start 1 hour before)',
    'You''ll climb 721 wooden steps to reach Mount Tapyas''s 210-meter summit, where a giant illuminated cross and CORON sign greet you at the top with 360-degree views of Coron''s islands, Coron Port, and the endless Palawan sea. The hike takes about 36 minutes and feels manageable for any fitness level—solo female travelers report feeling perfectly safe on the well-maintained trail with plenty of other hikers. Start your ascent about an hour before sunset to enjoy the daylight hike and then watch Coron transform into a golden, pink, and purple paradise as the sun dips below the horizon. The free entrance and proximity to town make this an essential sunrise or sunset experience, best paired with a light meal from nearby casual restaurants before or after.',
    true,
    'Mount Tapyas offers one of the most accessible yet spectacular views in Coron, free entry, and a natural gathering point where solo female travelers feel safe while hiking among other visitors. The sunset experience is quintessential Coron and unforgettable.',
    '["721-step wooden staircase", "Panoramic 360-degree island views", "Iconic illuminated cross and CORON sign", "Free entrance", "Best sunset views in Coron"]'::jsonb,
    '["Very steep staircase (challenging for some)", "Crowded near sunset time", "Limited shade or water facilities", "Can be slippery when wet"]'::jsonb,
    'I climbed Tapyas Hill solo and felt completely safe the entire time. Other travelers were everywhere, the views are unbelievable, and watching the sunset from the top while hugging a stranger was one of my favorite moments of the trip!',
    'https://maps.google.com/maps?q=11.9986,120.2043',
    'activity',
    NULL,
    '["journeyera.com", "tripadvisor.com", "bemytravelmuse.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Coron)',
    92,
    4.6,
    2123,
    '2026-02-10 07:28:53.844834+00',
    'sunset',
    '1.5-2 hours (including rest at top)',
    'No booking needed, just show up. Bring water and sun protection.',
    'moderate',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '4ed5fb43-79d6-582e-8f91-720a421be1da',
    '86063aca-c4a2-594b-9edc-a7c8c121c626',
    'le-voyage-coron',
    'Le Voyage',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    11.9986, 120.2045,
    'Burgos Street, In Front Legislative Building, Coron Town Proper, Coron, Palawan 5316',
    'ChIJ0eUg4YQG5DERMrEDkZMgm5E',
    '+63 908 895 6459',
    'https://www.tripadvisor.com/Restaurant_Review-g23389410-d14011999-Reviews-Le_Voyage-Coron_Town_Proper',
    2,
    '7:00 AM - 10:00 PM (daily)',
    'You''ll fall in love with Le Voyage''s charming resto-cafe atmosphere, located prominently at Coron Town''s center with a welcoming vibe perfect for solo female travelers. The excellent breakfast menu features smoothie bowls, French toast, pancakes, and many vegan options—ideal for fuel before island tours or a relaxed morning working session. The friendly, attentive staff remember returning guests, and the calm morning atmosphere transforms into a lively lunch and dinner scene. The consistent quality, generous portions, and reasonable prices (mains PHP 150-350) make this a reliable daily spot, and the location puts you walking distance from all Coron Town services.',
    true,
    'Le Voyage is specifically known for welcoming solo travelers with excellent breakfast, vegan options, and consistent hospitality. The central location and peaceful morning vibe make it perfect for solo dining and planning your day.',
    '["Excellent breakfast menu", "Many vegan/vegetarian options", "Friendly, attentive staff", "Central Coron Town location", "Good value pricing"]'::jsonb,
    '["Gets busy during peak hours", "Limited seating for walk-ins during lunch", "Can be noisy in evenings"]'::jsonb,
    'Le Voyage was my daily breakfast spot in Coron. The staff knew my order by day 3, the food was consistently delicious, and it felt like a safe place to eat alone while reading or planning my day.',
    'https://maps.google.com/maps?q=11.9986,120.2045',
    'cafe',
    NULL,
    '["tripadvisor.com", "yelp.com", "traveloka.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Coron)',
    90,
    4.5,
    734,
    '2026-02-10 07:28:53.844834+00',
    'morning',
    '1.5-2 hours',
    'Walk-in only, arrive early for seating',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'adced7ef-b201-5843-82f4-0e5237e73ed8',
    '86063aca-c4a2-594b-9edc-a7c8c121c626',
    'epic-cafe-coron',
    'Epic Cafe Coron',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    11.998, 120.205,
    'Poblacion 2, Real Street, Coron Town Proper, Coron, Palawan 5316',
    'ChIJN-jHvQ3zYDIRb6pW2HyHyPU',
    '+63 928 834 5678',
    'https://www.tripadvisor.com/Restaurant_Review-g729733-d13157138-Reviews-Epic_Cafe_Coron',
    2,
    '7:00 AM - 10:00 PM',
    'You''ll discover Coron''s best local coffee at Epic Cafe, where they roast their own Tagbanua coffee—a blend of robusta and arabica beans toasted with organic Muscovado sugar that captures the essence of Palawan. The cafe is located in Coron Town center and offers all-day breakfast, freshly baked cakes, pastries, breads, and vegetarian bowls alongside their signature local brew. The friendly, knowledgeable staff love talking about the Tagbanua tribe (local guardians of the Coron Islands), and the welcoming atmosphere feels like sitting with a friend who genuinely cares. This is where locals and travelers gather, creating a perfect solo-friendly vibe with consistent quality and purpose.',
    true,
    'Epic Cafe celebrates local culture and supports local communities through their Tagbanua coffee sourcing, making it meaningful for conscious travelers. The excellent coffee, healthy food options, and welcoming atmosphere make it a solo female traveler favorite.',
    '["Roasted Tagbanua local coffee", "Organic, fair-trade focus", "All-day breakfast menu", "Freshly baked pastries", "Cultural storytelling element"]'::jsonb,
    '["Small space, can get crowded", "Limited seating during peak hours", "Coffee prices higher than local spots"]'::jsonb,
    'Epic Cafe''s Tagbanua coffee is life-changing, and I loved learning about the local tribe they support. The owner spent time chatting with me about Coron, made me feel welcome, and I became a regular.',
    'https://maps.google.com/maps?q=11.9980,120.2050',
    'cafe',
    NULL,
    '["tripadvisor.com", "thepalawanguide.com", "airial.travel"]'::jsonb,
    'AI-researched for Sola (Philippines - Coron)',
    90,
    4.5,
    612,
    '2026-02-10 07:28:53.844834+00',
    'morning',
    '1-2 hours',
    'Walk-in only',
    NULL,
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'f067162a-569d-5df6-88e7-2438ace1d387',
    '86063aca-c4a2-594b-9edc-a7c8c121c626',
    'pacifico-coron',
    'Pacifico Coron Bar and Restaurant',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    11.9985, 120.2055,
    'National Highway Corner Burgos Street, Coron, Busuanga Island, Palawan 5316',
    'ChIJhb-LcJAG5DERKxRDzJ0u8_8',
    '+63 48 553 1631',
    'https://www.tripadvisor.com/Restaurant_Review-g729733-d23769130-Reviews-Pacifico_Coron',
    2,
    '11:00 AM - 11:00 PM',
    'You''ll find Pacifico ranked #1 of Coron''s restaurants, famous for its massive, delicious burgers that solo travelers can''t stop raving about. The Aussie Burger—their signature dish—arrives with generous portions and high-quality ingredients, paired with peanut sauce and fresh salad that makes it a meal unto itself. The casual, welcoming atmosphere accommodates solo diners perfectly, with knowledgeable staff and a diverse menu beyond burgers (steaks, seafood, pastas). Located on the highway corner near Burgos Street, it''s easily accessible and becomes a natural gathering point for travelers. The food quality and generous portions justify the mid-range pricing.',
    true,
    'Pacifico offers excellent food quality, a highly social atmosphere perfect for meeting other travelers, and solo-friendly dining portions. Its #1 ranking and consistent praise from solo female travelers make it a must-visit.',
    '["Huge, delicious signature burgers", "Aussie Burger (#1 restaurant dish)", "Quality steaks and seafood", "Social atmosphere", "Generous portions"]'::jsonb,
    '["Gets very busy during peak hours", "Can be noisy and social (if seeking quiet)", "Higher prices than budget alternatives"]'::jsonb,
    'Pacifico''s Aussie Burger is legit life-changing. I sat at the bar as a solo diner and ended up chatting with locals and other travelers all night. Best restaurant experience in Coron!',
    'https://maps.google.com/maps?q=11.9985,120.2055',
    'restaurant',
    NULL,
    '["tripadvisor.com", "autoreserve.com", "mindtrip.ai"]'::jsonb,
    'AI-researched for Sola (Philippines - Coron)',
    92,
    4.6,
    1289,
    '2026-02-10 07:28:53.844834+00',
    'evening',
    '1.5-2 hours',
    'Walk-in, reservations available for groups',
    NULL,
    'Trending',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '5e319b28-f421-5e9f-866f-60226f4d649d',
    '86063aca-c4a2-594b-9edc-a7c8c121c626',
    'full-lotus-mindful-kitchen-coron',
    'Full Lotus Mindful Kitchen',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    11.999, 120.2065,
    '121 National Highway, Barangay Poblacion 1, Coron, Palawan 5316',
    'ChIJiapA3YQG5DERk1l0ZQZQZCA',
    '+63 917 824 4710',
    'https://www.happycow.net/reviews/full-lotus-coron-160376',
    2,
    '1:30 PM - 9:30 PM (Mon-Sun) or 8:00 AM - 11:00 PM (varies)',
    'You''ll discover a cute, travel-themed vegetarian and vegan-friendly restaurant at Full Lotus, perfect for conscientious solo female travelers seeking ethical dining. The menu brilliantly fuses global cuisines—Mexican vegan tostadas, Filipino tofu sisig, Indonesian laksa, power bowls—creating exciting, flavorful meals with creative ingredients. The balcony overlooking busy National Highway provides people-watching entertainment, and the owner''s genuine passion for plant-based cooking creates a welcoming community atmosphere. Pricing is reasonable (mains PHP 180-320), portions are generous, and solo diners receive special attention. This is where conscious travelers gather.',
    true,
    'Full Lotus offers inclusive dining for vegan, vegetarian, and conscious travelers, with globally-inspired plant-based cuisine rarely found in small Philippine towns. The welcoming, intentional atmosphere makes it a safe space for solo female travelers.',
    '["Vegetarian & vegan specialty menu", "Global cuisine fusion (Mexican, Filipino, Indonesian)", "Mindful, ethical focus", "Balcony seating with views", "Creative power bowls"]'::jsonb,
    '["Limited opening hours", "Plant-based focus limits non-vegan options", "Can be quiet (depending on time)", "Higher prices than local alternatives"]'::jsonb,
    'As a vegan, Full Lotus was a godsend. The owner remembered dietary preferences, the food was creative and delicious, and it felt like dining with people who genuinely understood conscious eating.',
    'https://maps.google.com/maps?q=11.9990,120.2065',
    'restaurant',
    NULL,
    '["happycow.net", "tripadvisor.com", "yelp.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Coron)',
    92,
    4.6,
    523,
    '2026-02-10 07:28:53.844834+00',
    'afternoon',
    '1.5-2 hours',
    'Walk-in, no reservations needed',
    NULL,
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'e16c1833-f9a3-521c-b083-93462d1a8274',
    '86063aca-c4a2-594b-9edc-a7c8c121c626',
    'coron-island-hopping-tour',
    'Coron Island Hopping Tours',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    11.9986, 120.2043,
    'Coron Town Proper, Coron, Busuanga Island, Palawan 5316',
    'ChIJNT4fgv_zYDIRD8TxvTQN3dw',
    '+63 48 634 8201',
    'https://www.coronislandtours.com',
    2,
    'Daily tours 8:00 AM - 5:00 PM (departure varies)',
    'You''ll join organized group island-hopping tours—the safest, most budget-friendly option for solo female travelers to explore Coron''s best sites including Kayangan Lake, Twin Lagoon, Barracuda Lake, and multiple coral gardens. Tours include boat transportation, entrance fees, snorkeling equipment, and guide services, with costs around PHP 800-1500 per day depending on package. The group setting creates natural opportunities to meet other solo travelers, and professional guides speak English and prioritize safety. Tours begin from Coron Town''s pier, are inclusive of meals and snacks, and operate year-round. This is the recommended way to experience Coron''s otherworldly water activities without the stress of solo navigation.',
    true,
    'Island hopping tours are specifically designed for solo travelers, creating built-in community while ensuring safety and full experience coverage. Group settings make solo female travelers feel secure while providing adventure and connection opportunities.',
    '["Kayangan Lake included", "Twin Lagoon and Barracuda Lake", "Multiple coral gardens", "Equipment included", "Professional English-speaking guides"]'::jsonb,
    '["Group tours can be 20-40 people", "Crowded at peak times (Nov-April)", "Limited personalization", "Long days (8-10 hours including travel)"]'::jsonb,
    'I booked a group island hopping tour as a solo traveler and it was the best decision. I met 5 girls on day 1 and we ended up exploring together. The guide was amazing, all the sites were breathtaking, and I felt completely safe.',
    'https://maps.google.com/maps?q=11.9986,120.2043',
    'activity',
    NULL,
    '["coronislandtours.com", "bemytravelmuse.com", "tripadvisor.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Coron)',
    92,
    4.6,
    2845,
    '2026-02-10 07:28:53.844834+00',
    'morning',
    '8-10 hours',
    'Book at Coron Town tour offices, hotels, or via Klook/Viator (PHP 800-1500/person)',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'd51a8669-60da-5b4b-8224-091f7882f149',
    '86063aca-c4a2-594b-9edc-a7c8c121c626',
    'skeleton-wreck-diving-coron',
    'Skeleton Wreck (WWII Shipwreck Diving)',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    11.975, 120.182,
    'Northwest Coron Island, Coron Bay, Coron, Busuanga Island, Palawan 5316',
    'ChIJhb-LcJAG5DERKxRDzJ0u8_8',
    '+63 48 634 1234',
    'https://piratescoron.com/dive-sites/',
    2,
    'Daily diving tours, 8:00 AM - 5:00 PM',
    'You''ll explore a mostly-intact WWII Japanese gunboat at the Skeleton Wreck, one of Coron''s most accessible and impressive shipwrecks perfect for diving and snorkeling. Located at the northwest corner of Coron Island, the wreck sits at 4-22 meters depth, making it ideal for beginners with excellent visibility during dry season (Nov-May). The steel-hulled boat, sunk in 1944, is now encrusted with hard coral and teeming with tropical fish—an awe-inspiring underwater time-capsule experience. Solo divers can join structured diving trips through local PADI-certified centers, or snorkel from the surface if you prefer non-diving options. The historical significance combined with pristine marine life creates an unforgettable adventure.',
    true,
    'Skeleton Wreck offers an accessible yet profound experience—history, adventure, and beauty combined. Diving or snorkeling trips operate in safe group settings perfect for solo female travelers wanting structured adventure.',
    '["Mostly intact WWII Japanese gunboat", "Accessible depth for beginners (4-22m)", "Excellent visibility dry season", "Teeming with tropical fish and coral", "Historical significance"]'::jsonb,
    '["Requires snorkeling or diving certification", "Seasonal (best Nov-May)", "Rough seas possible in bad weather", "Can be cold at deeper depths"]'::jsonb,
    'I''m a certified diver and Skeleton Wreck was the most surreal dive of my life. Swimming through a WWII ship was humbling and incredible. The dive operators were professional, safety-focused, and welcoming to solo female divers.',
    'https://maps.google.com/maps?q=11.9750,120.1820',
    'activity',
    NULL,
    '["journeyera.com", "divezone.net", "tripadvisor.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Coron)',
    94,
    4.7,
    1934,
    '2026-02-10 07:28:53.844834+00',
    'morning',
    '4-6 hours (including boat transport)',
    'Book through local dive operators (Pirates Coron, Neptune, Reggae Dive Center). Certification required for diving.',
    'moderate',
    'Trending',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '2da2238c-be72-5b2e-beee-a913b0e932ca',
    '86063aca-c4a2-594b-9edc-a7c8c121c626',
    'outpost-hostel-coron',
    'Outpost Hostel Coron',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    11.998, 120.206,
    'Coron Town Proper, Coron, Busuanga Island, Palawan 5316',
    'ChIJ7V-XYoQG5DERrEDkZMgm5E',
    '+63 928 567 8901',
    'https://outposthostels.com',
    2,
    '24 hours (reception)',
    'You''ll find your people at Outpost Hostel, a vibrant, adults-only social hub with a rooftop pool bar, restaurant, and incredible sunset views perfect for solo travelers seeking community. The hostel offers sleek contemporary dorms, traditional woven huts, and solar-powered eco-dorms, with dorm beds starting around PHP 400-600/night. Daily organized tours and group activities create natural meeting opportunities, while the rooftop pool becomes an evening gathering spot. The modern facilities (hot showers, secure lockers, free WiFi), friendly staff, and emphasis on guest safety make solo female travelers feel genuinely welcome. This is less party-focused than traditional backpacker hostels while maintaining vibrant social energy.',
    true,
    'Outpost creates a safe, intentional community space for solo travelers with excellent facilities and built-in social activities. The rooftop pool and sunset views create magical moments, and the daily tours make exploring Coron effortless.',
    '["Rooftop pool with sunset views", "Multiple room styles (dorms, huts, eco)", "Daily organized tours", "Restaurant on-site", "Adults-only hostel"]'::jsonb,
    '["Social atmosphere (not for quiet seekers)", "Mid-range pricing", "WiFi can be unreliable", "Limited private bathroom options in dorms"]'::jsonb,
    'Outpost was my favorite hostel of the entire trip. The rooftop sunset hangout was magical, the staff goes above and beyond for solo travelers, and I met lifelong friends here. Felt completely safe and cared for.',
    'https://maps.google.com/maps?q=11.9980,120.2060',
    'hostel',
    '480',
    '["outposthostels.com", "booking.com", "hostelworld.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Coron)',
    90,
    4.5,
    1876,
    '2026-02-10 07:28:53.844834+00',
    'any',
    'multi-night stay',
    'Book via outposthostels.com or major booking platforms',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '0d7d25c3-4467-5393-af18-8ca730174b7e',
    '86063aca-c4a2-594b-9edc-a7c8c121c626',
    'ecocio-jungle-hostel-coron',
    'Ecocio Jungle Hostel',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    11.996, 120.208,
    'Barangay 6, Coron, Busuanga Island, Palawan 5316',
    'ChIJEeUg4YQG5DERrEDkZMgm5E',
    '+63 926 234 5678',
    'https://ecocio.org',
    1,
    '24 hours (reception)',
    'You''ll step into an enchanting jungle retreat at Ecocio Eco Hostel, a completely off-grid, bamboo-constructed haven nestled in the rainforest just 5 minutes from Coron Town. The solar-powered huts are made entirely of locally-sourced bamboo and native materials, offering an immersive nature experience while maintaining budget-friendly rates (PHP 250-400/night). The shared river, common garden spaces, and vegan-friendly restaurant create a conscious, intentional community perfect for environmentally-aware solo female travelers. The peaceful atmosphere, nature sounds, and genuine eco-ethos make it ideal for retreat-focused solo travelers wanting to step back from mainstream tourism.',
    true,
    'Ecocio offers a unique, environmentally-conscious experience that appeals to solo female travelers seeking authenticity and sustainability. The jungle setting, eco-practices, and vegan-friendly approach create a welcoming space for conscious travelers.',
    '["Entirely off-grid solar power", "Bamboo and native construction", "Jungle river setting", "Vegan-friendly restaurant", "Budget-friendly pricing"]'::jsonb,
    '["Basic facilities (no AC in some huts)", "Mosquitoes common (jungle setting)", "Less social than larger hostels", "Requires tricycle transport to town"]'::jsonb,
    'Ecocio was magical. Falling asleep to jungle sounds, eating vegan breakfast by the river, and knowing I was supporting sustainable tourism felt incredible. Best hostel for solo travelers seeking peace.',
    'https://maps.google.com/maps?q=11.9960,120.2080',
    'hostel',
    '320',
    '["ecocio.org", "booking.com", "hostelworld.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Coron)',
    88,
    4.4,
    789,
    '2026-02-10 07:28:53.844834+00',
    'any',
    'multi-night stay',
    'Book via ecocio.org or Booking.com/Hostelworld',
    NULL,
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'fe631acf-ce66-5789-853f-721e8daf4737',
    'ebf53e6b-207c-52b4-9974-462fbb0e841a',
    'el-union-coffee',
    'El Union Coffee',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    16.66389, 120.35222,
    'MacArthur National Highway, Urbiztondo, San Juan, La Union, Philippines',
    NULL,
    '+63 945 483 4825',
    'https://elunioncoffee.com/',
    2,
    '8:00 AM - 6:00 PM, Closed Wednesdays',
    'You''ll find yourself in a hidden coffee roastery with excellent cold brew and espresso along the quiet highway in San Juan. The minimalist aesthetic and locally-roasted beans create a cozy work-friendly spot where solo travelers can settle in for hours. Whether you''re planning your day or unwinding after surfing, El Union Coffee delivers quality brews that match the laid-back vibe of the town.',
    true,
    'Excellent wifi and power outlets make this perfect for digital nomads, while the quality coffee and calm ambiance create an ideal work-friendly space. Solo female travelers appreciate the welcoming staff and safe location for lingering alone.',
    '["Specialty cold brew and espresso", "Work-friendly with reliable wifi", "Quiet, aesthetic minimalist space", "Locally-roasted beans", "Power outlets available"]'::jsonb,
    '["Closed Wednesdays", "Small space can get crowded during peak hours", "Limited food options"]'::jsonb,
    'I spent my entire morning working here as a solo traveler. The staff were helpful, the wifi was fast, and nobody bothered me while I was on my laptop. Definitely coming back!',
    'https://maps.google.com/?q=El+Union+Coffee+San+Juan+La+Union',
    'cafe',
    NULL,
    '["elunioncoffee.com", "Tripadvisor", "Yelp", "Philippine Primer"]'::jsonb,
    'AI-researched for Sola (Philippines - La Union)',
    90,
    4.5,
    120,
    '2026-02-10 07:28:53.844834+00',
    'Early morning (7-10 AM)',
    '2-4 hours',
    'Walk-in only',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '4c00300e-205e-54b4-9e71-5e5fadaa7542',
    'ebf53e6b-207c-52b4-9974-462fbb0e841a',
    'clean-beach-cafe',
    'Clean Beach Cafe',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    16.66333, 120.34944,
    '134 Beachfront, MacArthur Highway, Brgy. Urbiztondo, San Juan, La Union, Philippines',
    NULL,
    NULL,
    NULL,
    2,
    '7:00 AM - 9:00 PM (Sun-Thu), 7:00 AM - 10:00 PM (Fri-Sat)',
    'You''ll enjoy fresh coffee right on the beachfront while supporting an eco-friendly cafe with a mission. The relaxed beach vibe makes this perfect for solo travelers watching the waves while sipping quality brews. Their advocacy to keep the beach clean adds a meaningful layer to your visit, and the open-air seating creates an inviting social atmosphere without pressure.',
    true,
    'Solo-friendly beachfront location where women travelers feel safe and welcome. The cafe''s environmental mission resonates with conscious travelers, and the extended evening hours work well for sunset hangouts.',
    '["Beachfront location with ocean views", "Quality coffee with eco-conscious mission", "Open-air seating perfect for people-watching", "Extended weekend hours until 10 PM", "Instagram-worthy aesthetic"]'::jsonb,
    '["Can be crowded during peak tourist season", "Beach wind can affect dining comfort", "Limited indoor seating"]'::jsonb,
    'Sat here for hours alone with my coffee, reading and watching the waves. The owner was very welcoming and the whole vibe is safe and chill. Love that they care about the beach too!',
    'https://maps.google.com/?q=Clean+Beach+Cafe+San+Juan+La+Union',
    'cafe',
    NULL,
    '["Zoy to the World", "Tripadvisor", "Yelp", "Restaurant Guru"]'::jsonb,
    'AI-researched for Sola (Philippines - La Union)',
    88,
    4.4,
    397,
    '2026-02-10 07:28:53.844834+00',
    'Early morning or sunset (5-7 PM)',
    '2-3 hours',
    'Walk-in only',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'd7d6dbdb-ccef-5be7-a72a-64ec87344c5c',
    'ebf53e6b-207c-52b4-9974-462fbb0e841a',
    'karruba-cafe',
    'Karruba Cafe & Bakery',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    16.66389, 120.34861,
    'Urbiztondo Road, San Juan, 2514 La Union, Philippines',
    NULL,
    '+63 9165037354',
    NULL,
    2,
    '7:00 AM - 5:00 PM, Closed Tuesdays',
    'You''ll discover a cozy local favorite bakery where freshly-baked pastries and artisanal coffee create an irresistible combination. The relaxed atmosphere and friendly staff make it easy to linger solo at a corner table with your cappuccino. This is where San Juan locals hang out, giving you an authentic taste of the community.',
    true,
    'Known as a reliable daily spot for both locals and travelers, Karruba offers a safe, welcoming environment for solo diners. The artisanal pastries and coffee make it worth the stop, and the local clientele creates an easy-to-join social atmosphere.',
    '["Freshly-baked pastries and bread", "Artisanal espresso coffee", "Cozy, intimate setting", "Local favorite with friendly staff", "Great for breakfast or brunch"]'::jsonb,
    '["Closed Tuesdays", "Limited seating during peak hours", "Small space can feel crowded"]'::jsonb,
    'I loved this place! Got the croissant and cappuccino and nobody minded I was sitting alone reading. The staff actually recommended their best pastries and we had a nice chat!',
    'https://maps.google.com/?q=Karruba+Cafe+Urbiztondo+San+Juan',
    'cafe',
    NULL,
    '["Booky", "Instagram @karrubacafelu", "TikTok verified"]'::jsonb,
    'AI-researched for Sola (Philippines - La Union)',
    86,
    4.3,
    85,
    '2026-02-10 07:28:53.844834+00',
    '8:00 AM - 11:00 AM',
    '1-2 hours',
    'Walk-in only',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'eaf5fdd4-687c-5bdd-aeff-2115e66d9446',
    'ebf53e6b-207c-52b4-9974-462fbb0e841a',
    'coast-call-kitchen',
    'Coast Call Kitchen & Bar',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    16.66417, 120.34889,
    '238 Urbiztondo, San Juan, 2514 La Union, Philippines',
    NULL,
    '+63 963 520 4519',
    'https://www.coastcallsanjuan.com/',
    2,
    '7:00 AM - 10:00 PM daily',
    'You''ll find an oceanfront dining experience with fresh catches and casual island vibes at this beachside restaurant. The all-day breakfast menu and relaxed atmosphere make it easy to grab a meal alone without feeling out of place. Watch the boats while enjoying local fish dishes and cold drinks.',
    true,
    'Solo-dining friendly with flexible menu options and extended hours. The beachfront location and casual vibe create a welcoming environment for solo female travelers at any time of day.',
    '["Beachfront location with sea views", "All-day breakfast menu", "Fresh local seafood", "Casual atmosphere", "Extended hours 7 AM - 10 PM"]'::jsonb,
    '["Can get busy during meal times", "Waiter service required (not self-service)", "Menu focused heavily on seafood"]'::jsonb,
    'Ate breakfast here solo twice during my stay. Nobody made me feel weird about eating alone, and the food was fresh and affordable. The ocean view doesn''t hurt either!',
    'https://maps.google.com/?q=Coast+Call+Kitchen+Urbiztondo+San+Juan',
    'restaurant',
    NULL,
    '["coastcallsanjuan.com", "Tripadvisor"]'::jsonb,
    'AI-researched for Sola (Philippines - La Union)',
    84,
    4.2,
    95,
    '2026-02-10 07:28:53.844834+00',
    'Breakfast (7-10 AM) or dinner (6-8 PM)',
    '1-2 hours',
    'Walk-in recommended, groups can call ahead',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'a59f4628-4e95-5107-a91f-9c44be1b9a7e',
    'ebf53e6b-207c-52b4-9974-462fbb0e841a',
    'masa-bakehouse',
    'Masa Bakehouse',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    16.65889, 120.35333,
    'Costales St., Sitio Dappat, San Juan, La Union, Philippines',
    NULL,
    NULL,
    'https://www.instagram.com/masabybarefoot/',
    2,
    '9:00 AM - 5:00 PM, Wed-Sun',
    'You''ll indulge in artisan breads and pastries from this beloved local bakery that''s become a pasalubong (souvenir) staple. The fresh-baked goodness and intimate setting create a perfect spot for a quick breakfast or to grab treats for your beach day. The welcoming vibe makes solo visits feel natural.',
    true,
    'Masa is a woman-friendly space known for its quality and aesthetic appeal. Solo travelers appreciate the quick service and opportunity to grab fresh baked goods for picnics or beach outings.',
    '["Artisanal handcrafted breads", "Fresh pastries baked daily", "Beautiful presentation and packaging", "Popular local souvenir spot", "Caf\u00e9 atmosphere"]'::jsonb,
    '["Only open Wed-Sun", "Limited seating inside", "Can have lines during peak hours (10-11 AM)"]'::jsonb,
    'Grabbed warm croissants here and it was the highlight of my breakfast. The owner is lovely and doesn''t mind if you sit alone. Great vibe, very safe feeling.',
    'https://maps.google.com/?q=Masa+Bakehouse+San+Juan+La+Union',
    'cafe',
    NULL,
    '["Instagram @masabybarefoot", "Booky", "Wanderlog"]'::jsonb,
    'AI-researched for Sola (Philippines - La Union)',
    92,
    4.6,
    240,
    '2026-02-10 07:28:53.844834+00',
    '9:00 AM - 11:00 AM',
    '30 mins - 1 hour',
    'Walk-in only',
    'easy',
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'b1a51e7e-4b04-5974-bd38-f2f3c033b3ab',
    'ebf53e6b-207c-52b4-9974-462fbb0e841a',
    'putik-friends',
    'Putik Friends Studio Cafe',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    16.67083, 120.36139,
    'San Roberto St., Ili Sur, San Juan, La Union, Philippines',
    NULL,
    NULL,
    'https://www.putikfriends.com/',
    2,
    '9:00 AM - 5:00 PM, Thu-Tue (Closed Wed)',
    'You''ll step into a creative pottery studio and cafe where you can work on your own pottery while sipping coffee. This is a unique space where solo female travelers feel inspired and welcomed, surrounded by Filipino artists and makers. It''s the perfect spot for creative souls seeking connection without pressure.',
    true,
    'Putik Friends offers a distinctive experience combining art, community, and coffee. Perfect for solo females seeking creative social spaces, workshops, and a deeper connection with local art and culture.',
    '["Pottery studio with hands-on workshops", "Local Filipino artists'' works", "Creative community space", "Quality coffee and light snacks", "Women-focused and women-run"]'::jsonb,
    '["Pottery workshops require advance booking", "Small cafe space, more art gallery", "Limited food menu"]'::jsonb,
    'This place felt like a creative sanctuary. I did a pottery workshop solo and met so many cool women travelers. The owner was amazing and the whole vibe made me feel supported as a solo female artist.',
    'https://maps.google.com/?q=Putik+Friends+San+Juan+La+Union',
    'cafe',
    NULL,
    '["putikfriends.com", "Instagram @putikfriends", "Window Seat"]'::jsonb,
    'AI-researched for Sola (Philippines - La Union)',
    94,
    4.7,
    150,
    '2026-02-10 07:28:53.844834+00',
    'Mid-morning (10 AM) or afternoon (2-4 PM)',
    '2-4 hours (with workshop)',
    'Walk-in for cafe, advance booking for workshops',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '83f6bc2c-aaff-5737-8894-4a5f759419aa',
    'ebf53e6b-207c-52b4-9974-462fbb0e841a',
    'awesome-hotel-cafe',
    'Awesome Hotel Lobby Cafe',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    16.65667, 120.35278,
    '319 Eagle Street, Montemar Village, Ili Norte, San Juan, La Union, Philippines',
    NULL,
    NULL,
    'https://awesomehotel.com/cafe/',
    3,
    '6:30 AM - 10:00 PM daily',
    'You''ll experience modern beach resort luxury with a welcoming cafe serving excellent pastries and coffee. The sophisticated yet relaxed ambiance makes solo travelers feel at home, and the sea-view setting creates a perfect backdrop for your morning or afternoon work session.',
    true,
    'Awesome Hotel''s cafe offers upscale comfort in a safe, well-designed space. Perfect for solo female travelers seeking a more premium experience with reliable facilities and service.',
    '["Modern luxury beach resort setting", "Excellent pastries and specialty coffee", "Sea views from cafe", "Professional service", "Extended hours 6:30 AM - 10 PM"]'::jsonb,
    '["More expensive than beach cafes", "Primarily hotel guests and paying diners", "Reservation preferred during peak times"]'::jsonb,
    'Splurged on a day pass to use the cafe and it was worth it. Felt super safe, lovely staff, incredible pastries, and the ambiance made me feel like I was treating myself properly.',
    'https://maps.google.com/?q=Awesome+Hotel+San+Juan+La+Union',
    'cafe',
    NULL,
    '["awesomehotel.com", "Tripadvisor", "Agoda"]'::jsonb,
    'AI-researched for Sola (Philippines - La Union)',
    90,
    4.5,
    320,
    '2026-02-10 07:28:53.844834+00',
    'Morning (8-10 AM) or evening (4-6 PM)',
    '2-3 hours',
    'Walk-in for day cafe visits or resort guests',
    'easy',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '062b8e88-5a4f-5ebf-b252-90938117518b',
    'ebf53e6b-207c-52b4-9974-462fbb0e841a',
    'fat-wave-surf-resort',
    'Fat Wave Surf Resort',
    'hotel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    16.665, 120.34944,
    'MacArthur Highway, Brgy. Urbiztondo, San Juan, La Union, Philippines',
    NULL,
    '+63 927 659 0176, +63 917 885 5754',
    'https://www.fatwavesurfresort.com/',
    2,
    '24/7 reception',
    'You''ll wake up steps from the beach at this surfer-friendly resort where the vibe is welcoming and the community is tight. Solo female travelers feel safe in the social common areas while also having privacy in the rooms. The on-site restaurant and bar make it easy to dine without leaving, or join the communal vibe if you''re feeling social.',
    true,
    'Perfect for solo female surfers and beach travelers seeking a balance of safety and social connection. The resort caters to the backpacker community with competitive rates and a proven track record with female guests.',
    '["Beachfront location", "Social common areas", "On-site restaurant and bar", "Surf lessons and rentals available", "Affordable rates"]'::jsonb,
    '["Can be party-focused during weekends", "Noise in shared areas during peak season", "Mixed dorm rooms available (check privacy options)"]'::jsonb,
    'Stayed here solo for a week. The rooms were clean, the staff kept an eye out for solo female guests, and I felt safe. Met tons of people in the common areas but also had chill days alone. Great value too.',
    'https://maps.google.com/?q=Fat+Wave+Surf+Resort+San+Juan',
    'hotel',
    '1200',
    '["fatwavesurfresort.com", "Booking.com", "Tripadvisor"]'::jsonb,
    'AI-researched for Sola (Philippines - La Union)',
    86,
    4.3,
    580,
    '2026-02-10 07:28:53.844834+00',
    'All day',
    'Overnight stay',
    'Book online via Booking.com or direct',
    'easy',
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '545ef596-5931-582b-a371-bbebba8be923',
    'ebf53e6b-207c-52b4-9974-462fbb0e841a',
    'charlie-hangar-surf-hostel',
    'Charlie''s Hangar Surf Hostel',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    16.66611, 120.34778,
    'Surfers Road, Urbiztondo, San Juan, La Union, Philippines',
    NULL,
    '+63 917 865 0361',
    'https://charlieshangarsurfhostel.com/',
    1,
    '24/7 reception',
    'You''ll step into an aviation-themed beachfront hostel with vintage charm and a genuine community atmosphere. The common spaces buzz with energy from fellow travelers, while private options exist for those seeking solitude. It''s affordable, safe, and has earned a reputation as the go-to spot for social solo female surfers.',
    true,
    'Charlie''s Hangar is legendary among solo female surfers for its welcoming culture and supportive staff. The female-aware management ensures solo women feel secure while the social energy makes it easy to meet others.',
    '["Beachfront location", "Aviation-themed decor", "Strong solo traveler community", "Surf lessons available", "Budget-friendly rates"]'::jsonb,
    '["Party atmosphere can be loud at night", "Shared facilities standard for hostels", "Can be very crowded during peak season"]'::jsonb,
    'Best hostel experience ever! The staff genuinely looked out for solo females, the common areas were safe, and I made friends from all over. The beach access was unbeatable. Definitely recommend to any girl traveling solo.',
    'https://maps.google.com/?q=Charlie''s+Hangar+Surf+Hostel+San+Juan',
    'hostel',
    '500',
    '["charlieshangarsurfhostel.com", "Tripadvisor", "Hostelworld"]'::jsonb,
    'AI-researched for Sola (Philippines - La Union)',
    88,
    4.4,
    650,
    '2026-02-10 07:28:53.844834+00',
    'All day',
    'Overnight stay',
    'Book via hostelworld.com or direct',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '55901f2e-d37f-5f56-ba1e-7aa8ea335207',
    'ebf53e6b-207c-52b4-9974-462fbb0e841a',
    'urbiztondo-beach',
    'Urbiztondo Beach & Surf Spot',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    16.66444, 120.34889,
    'Urbiztondo, San Juan, La Union, Philippines',
    NULL,
    NULL,
    NULL,
    1,
    'Sunrise to sunset (best 6 AM - 6 PM)',
    'You''ll find yourself on San Juan''s most famous beach, perfect for beginner and intermediate surfers. The protective cove creates manageable waves year-round, and the beach buzzes with a welcoming energy. Solo female surfers and swimmers feel safe here with abundant facilities and fellow travelers.',
    true,
    'Urbiztondo is the safest and most accessible beach for solo female surfers of all levels. The established infrastructure, consistent waves, and strong female surfer community make it ideal for independent travelers.',
    '["Year-round beginner-friendly waves", "Protective cove with calm mornings", "Multiple surf schools and rentals", "Abundant cafes and restaurants nearby", "Strong solo female surfer community"]'::jsonb,
    '["Can be very crowded during peak hours", "Busy with tourists, less peaceful", "Sun protection essential (strong UV)"]'::jsonb,
    'I learned to surf here as a solo female traveler and felt totally safe. So many other women around, great instructors, and the beach community was supportive. Would totally recommend for female surfers!',
    'https://maps.google.com/?q=Urbiztondo+Beach+San+Juan+La+Union',
    'activity',
    NULL,
    '["Surfline", "Tripadvisor", "local guides"]'::jsonb,
    'AI-researched for Sola (Philippines - La Union)',
    90,
    4.5,
    2100,
    '2026-02-10 07:28:53.844834+00',
    '6-9 AM for calm waves and fewer crowds',
    '2-4 hours',
    'Free public access, paid lessons available',
    'moderate',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'e7146572-ae07-5969-bb5c-35ddb7a32007',
    'ebf53e6b-207c-52b4-9974-462fbb0e841a',
    'san-juan-lighthouse',
    'San Juan Lighthouse & Viewpoint',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    16.64833, 120.36667,
    'Bacnotan Road, San Juan, La Union, Philippines',
    NULL,
    NULL,
    NULL,
    1,
    '8:00 AM - 5:00 PM daily',
    'You''ll hike to this historic white lighthouse perched on rugged cliffs overlooking the Pacific Ocean. The panoramic views of the coastline are breathtaking, and the peaceful setting far from the beach crowds creates a meditative experience. Solo explorers love the quiet beauty and sense of accomplishment.',
    true,
    'Safe, accessible solo activity with stunning photo opportunities and peaceful atmosphere. The manageable hike and light-hearted vibe make it perfect for solo female travelers seeking nature and views without extreme physical challenge.',
    '["Historic white lighthouse structure", "Panoramic Pacific Ocean views", "Peaceful clifftop setting", "Easy hike suitable for all levels", "Sunset viewing opportunity"]'::jsonb,
    '["Unpaved roads to reach trailhead", "Limited shade on trail", "Can be windy and exposed"]'::jsonb,
    'Hiked here solo and it was one of the most peaceful moments of my trip. The views are insane and I felt totally safe and empowered reaching the lighthouse on my own. Brought lunch and just sat up there for hours.',
    'https://maps.google.com/?q=San+Juan+Lighthouse+La+Union',
    'landmark',
    NULL,
    '["Tripadvisor", "local guides", "travel blogs"]'::jsonb,
    'AI-researched for Sola (Philippines - La Union)',
    92,
    4.6,
    480,
    '2026-02-10 07:28:53.844834+00',
    'Sunset (4:30-6:30 PM)',
    '3-4 hours',
    'Free access, self-guided',
    'easy',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'f7abadf8-908f-5697-a083-766e103e8638',
    'f1e77ebf-9d8c-50fe-9d7b-540cc1f032a9',
    'casablanca-restaurant',
    'Casablanca Restaurant',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    9.30639, 123.31278,
    'Rizal Boulevard, corner Noblefranca Street, Dumaguete City, Negros Oriental, Philippines',
    NULL,
    '+63 35 422 4080, +63 917 300 9708',
    NULL,
    3,
    '7:00 AM - 11:00 PM daily',
    'You''ll settle into an elegant Mediterranean restaurant overlooking Rizal Boulevard''s scenic waterfront. The sophisticated ambiance and quality cuisine make solo dining feel luxurious rather than lonely. The European-influenced menu offers plenty of options for dietary preferences, and the attentive service ensures solo diners are well-cared for.',
    true,
    'Dumaguete''s most trusted restaurant for solo female travelers seeking upscale dining with exceptional service. The waterfront location and reputation for treating solo diners well make it an ideal evening destination.',
    '["Mediterranean and European cuisine", "Waterfront Rizal Boulevard location", "Elegant ambiance", "Quality service", "Extended hours until 11 PM"]'::jsonb,
    '["Higher price point than casual spots", "Can be busy during dinner (6-8 PM)", "Dress code informal but upscale"]'::jsonb,
    'Treated myself to dinner here solo and felt like a queen. The waiter was attentive without being intrusive, the food was amazing, and sitting alone at the window overlooking the boulevard was perfect.',
    'https://maps.google.com/?q=Casablanca+Restaurant+Dumaguete',
    'restaurant',
    NULL,
    '["Yelp", "Tripadvisor", "local guides"]'::jsonb,
    'AI-researched for Sola (Philippines - Dumaguete)',
    88,
    4.4,
    420,
    '2026-02-10 07:28:53.844834+00',
    'Dinner 6:00 PM - 8:30 PM',
    '2-3 hours',
    'Walk-in recommended, groups should call ahead',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '6b8753a8-4982-59a6-bef2-bfcba008d7b0',
    'f1e77ebf-9d8c-50fe-9d7b-540cc1f032a9',
    'chapters-cafe',
    'Chapters Cafe',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    9.30833, 123.30972,
    'Santa Catalina corner San Jose Street, Dumaguete City, Negros Oriental, Philippines',
    NULL,
    '+63 35 422 5688',
    NULL,
    2,
    '10:00 AM - 12:00 AM daily',
    'You''ll explore this two-story cafe filled with books, art, and creative energy where solo travelers naturally congregate. The artistic decor and literary atmosphere make it perfect for lost-in-a-book afternoons. Whether you''re working, reading, or people-watching, Chapters has a quiet corner waiting for you.',
    true,
    'Chapters is a beloved gathering place for solo female travelers in Dumaguete. The creative, welcoming atmosphere and extended hours make it perfect for flexible solo schedules.',
    '["Two-story building with varied spaces", "Books, art, and creative decor", "Extended hours until midnight", "Good wifi and seating", "Local art features regularly"]'::jsonb,
    '["Can be crowded during evening (6-9 PM)", "Limited food options", "Background music can be loud"]'::jsonb,
    'Spent so many evenings here alone just reading and sipping coffee. The staff knew my name, nobody bothered me, and the vibe was totally supportive of solo females. Felt like a home base.',
    'https://maps.google.com/?q=Chapters+Cafe+Dumaguete',
    'cafe',
    NULL,
    '["Yelp", "Tripadvisor", "Instagram"]'::jsonb,
    'AI-researched for Sola (Philippines - Dumaguete)',
    86,
    4.3,
    310,
    '2026-02-10 07:28:53.844834+00',
    'Afternoon (2-5 PM) or evening (7-10 PM)',
    '2-4 hours',
    'Walk-in only',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '698b3a78-c0ca-506f-ba06-085adac34193',
    'f1e77ebf-9d8c-50fe-9d7b-540cc1f032a9',
    'pasta-king',
    'Pasta King Cafe di Roma',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    9.30699, 123.30866,
    'South Sea Road, Fatima Village, Dumaguete City, Negros Oriental, Philippines',
    NULL,
    '+63 917 717 9632',
    NULL,
    2,
    '11:00 AM - 10:00 PM daily',
    'You''ll discover authentic Italian cuisine in an intimate cafe setting where solo dining is completely normalized. The homemade pasta and warm service create a welcoming atmosphere, and the menu offers enough variety to keep you coming back. It''s a local gem that treats solo female diners with genuine hospitality.',
    true,
    'Perfect for solo foodies seeking quality Italian cuisine. The intimate setting and female-conscious service make it an ideal solo dining destination in Dumaguete.',
    '["Authentic Italian pasta", "Homemade cooking", "Intimate cafe setting", "Reasonable prices", "Friendly staff"]'::jsonb,
    '["Small space, can be crowded", "Waits possible during dinner (6-8 PM)", "Menu is pasta-focused"]'::jsonb,
    'Had the best carbonara of my life here, alone. The owner actually came by to chat and make sure I was enjoying it. Made me feel so welcome as a solo female diner.',
    'https://maps.google.com/?q=Pasta+King+Dumaguete',
    'restaurant',
    NULL,
    '["Yelp", "Tripadvisor", "local recommendations"]'::jsonb,
    'AI-researched for Sola (Philippines - Dumaguete)',
    84,
    4.2,
    185,
    '2026-02-10 07:28:53.844834+00',
    'Lunch (11 AM - 2 PM) or dinner (7-9 PM)',
    '1.5-2 hours',
    'Walk-in or call for reservations',
    'easy',
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '6cdaa07d-e34d-5e9c-a228-093ceefd4f8b',
    'f1e77ebf-9d8c-50fe-9d7b-540cc1f032a9',
    'mad-monkey-dumaguete',
    'Mad Monkey Dumaguete Hostel',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    9.29778, 123.30778,
    '10 Amigo Street, Piapi, Dumaguete City, Negros Oriental, Philippines',
    NULL,
    NULL,
    'https://madmonkeyhostels.com/destination/dumaguete',
    1,
    '24/7 reception',
    'You''ll find yourself in a bustling social backpacker hub close to Rizal Boulevard nightlife where solo female travelers easily blend into the community. The party atmosphere and organized social tours make it simple to explore the city with others, or retreat to your room when you need solitude.',
    true,
    'Mad Monkey is known throughout Southeast Asia for welcoming solo female travelers and offering excellent social opportunities. The proximity to Dumaguete''s attractions and female-friendly staff make it a safe choice.',
    '["Party atmosphere and social events", "Close to Rizal Boulevard", "Organized daily tours", "Female-only dorm options", "Budget-friendly rates"]'::jsonb,
    '["Very social and party-focused", "Noise during evening hours", "May be overwhelming for introverts"]'::jsonb,
    'Stayed in the female dorm and felt totally safe. The staff actively looked out for solo females and there were constant group activities. Made friends with girls from all over the world easily.',
    'https://maps.google.com/?q=Mad+Monkey+Dumaguete+Hostel',
    'hostel',
    '400',
    '["madmonkeyhostels.com", "Tripadvisor", "Booking.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Dumaguete)',
    88,
    4.4,
    890,
    '2026-02-10 07:28:53.844834+00',
    'All day',
    'Overnight stay',
    'Book via Booking.com or hostelworld.com',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '0858b3eb-c110-54ba-8d20-7b41a45b0e23',
    'f1e77ebf-9d8c-50fe-9d7b-540cc1f032a9',
    'balay-ni-bonsai',
    'Balay Ni Bonsai Hostel',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    9.30972, 123.31139,
    '138 Dr. V. Locsin Street, Dumaguete City, Negros Oriental, Philippines',
    NULL,
    NULL,
    'https://www.booking.com/hotel/ph/balay-ni-bonsai-dumaguete.html',
    1,
    '24/7 reception',
    'You''ll discover a peaceful, family-home hostel with old-world charm and genuine Filipino warmth. Unlike party hostels, Balay Ni Bonsai offers a quiet, social alternative where you can meet other travelers without the chaos. The shared kitchen and lounge areas encourage natural connection at your own pace.',
    true,
    'For solo females seeking community without partying, Balay Ni Bonsai is the perfect choice. The safe, welcoming family atmosphere and quiet social spaces make it ideal for thoughtful travelers.',
    '["Quiet, peaceful atmosphere", "Family-home charm", "Shared kitchen available", "Lounge and common areas", "Genuine Filipino hospitality"]'::jsonb,
    '["Less nightlife scene", "Stricter house rules", "Smaller facility (more intimate)"]'::jsonb,
    'This hostel felt like staying in a friend''s home. The owner actually cared about guests'' safety and made solo females feel protected. Great place to meet other travelers in a chill way.',
    'https://maps.google.com/?q=Balay+Ni+Bonsai+Dumaguete',
    'hostel',
    '350',
    '["Booking.com", "Tripadvisor", "Hostelworld"]'::jsonb,
    'AI-researched for Sola (Philippines - Dumaguete)',
    90,
    4.5,
    510,
    '2026-02-10 07:28:53.844834+00',
    'All day',
    'Overnight stay',
    'Book via Booking.com',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'e1e14f8e-407e-5432-aa42-dbf39c97e6b6',
    'f1e77ebf-9d8c-50fe-9d7b-540cc1f032a9',
    'rizal-boulevard',
    'Rizal Boulevard',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    9.30667, 123.31,
    'Rizal Boulevard, Barangay Poblacion 4, Dumaguete City, Negros Oriental, Philippines',
    NULL,
    NULL,
    NULL,
    1,
    'Best 5:30 AM - 9:00 PM',
    'You''ll stroll along this scenic quarter-mile waterfront promenade where locals and tourists blend seamlessly. The calm waters, gentle sea breeze, and old-fashioned street lamps create a peaceful setting perfect for sunrise walks or evening reflection. Street food vendors and massage providers add local flavor without pressure to engage.',
    true,
    'Rizal Boulevard is the safest and most accessible public space in Dumaguete for solo female travelers. The established infrastructure and constant foot traffic ensure safety while maintaining a relaxed vibe.',
    '["Waterfront promenade", "Peaceful ambiance", "Street food vendors", "Massage services available", "Great sunrise and sunset views"]'::jsonb,
    '["Can be crowded during evening hours", "Street food quality varies", "Occasional persistent vendors"]'::jsonb,
    'Walked Rizal Boulevard solo every morning. Felt totally safe, passed other solo female travelers regularly, and the sunrise views were incredible. Best morning ritual of my trip.',
    'https://maps.google.com/?q=Rizal+Boulevard+Dumaguete',
    'activity',
    NULL,
    '["Tripadvisor", "Lonely Planet", "local guides"]'::jsonb,
    'AI-researched for Sola (Philippines - Dumaguete)',
    90,
    4.5,
    1200,
    '2026-02-10 07:28:53.844834+00',
    'Sunrise (5:30-6:30 AM) or sunset (5:30-7:00 PM)',
    '30 mins - 1.5 hours',
    'Free public access',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '429f7516-8c2d-50b1-b1d1-253af23679c5',
    'f1e77ebf-9d8c-50fe-9d7b-540cc1f032a9',
    'twin-lakes',
    'Twin Lakes (Balinsasayao & Danao)',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    9.39222, 123.34556,
    '953H+HPQ, Sibulan, Dumaguete, Negros Oriental, Philippines',
    NULL,
    NULL,
    NULL,
    1,
    '8:00 AM - 5:00 PM daily',
    'You''ll trek through misty mountain trails connecting two stunning freshwater lakes in a pristine natural setting. The moderate hiking is manageable for most fitness levels, and the reward is pristine beauty and a sense of accomplishment. Solo hikers feel safe on the well-established trail, and guides are available if you prefer company.',
    true,
    'Twin Lakes is a perfect solo female activity combining safe hiking with stunning scenery and flexibility. The proximity to Dumaguete and established guide system make it accessible and secure.',
    '["Twin pristine freshwater lakes", "Moderate hiking with scenic views", "Waterfall viewpoints", "Bird watching opportunities", "Only 14.5 km from Dumaguete"]'::jsonb,
    '["Trail can be muddy (bring proper shoes)", "Weather dependent (closed during typhoons)", "No facilities on trail (bring water)"]'::jsonb,
    'Hiked to Twin Lakes solo with a guide and felt totally supported. The guide was professional, the landscape was magical, and I was proud of myself for pushing my own limits.',
    'https://maps.google.com/?q=Twin+Lakes+Balinsasayao+Dumaguete',
    'activity',
    NULL,
    '["Tripadvisor", "travel blogs", "local guides"]'::jsonb,
    'AI-researched for Sola (Philippines - Dumaguete)',
    92,
    4.6,
    320,
    '2026-02-10 07:28:53.844834+00',
    '8:00 AM - 2:00 PM',
    '3-5 hours',
    'Guides available for hire at park entrance (PHP 300 for small groups)',
    'moderate',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '2e4b7866-452d-5275-a502-1f93cd148c19',
    'f1e77ebf-9d8c-50fe-9d7b-540cc1f032a9',
    'silliman-university',
    'Silliman University Campus & Museum',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    9.30556, 123.315,
    'Hibbard Avenue, Dumaguete City, Negros Oriental, Philippines',
    NULL,
    '+63 35 422 6002',
    'https://su.edu.ph/',
    1,
    '8:00 AM - 5:00 PM (weekdays), Closed weekends',
    'You''ll explore a historic 60-hectare campus filled with colonial-era architecture and botanical beauty. The Anthropology Museum offers fascinating insights into regional culture and heritage. Solo visitors can stroll at their own pace through the peaceful campus, experiencing authentic campus life.',
    true,
    'Educational and peaceful activity perfect for solo travelers seeking cultural learning. The beautiful campus grounds and free museum access make it an ideal afternoon activity.',
    '["Colonial-era architecture", "Anthropology Museum", "Expansive botanical grounds", "Historic library building", "Peaceful campus atmosphere"]'::jsonb,
    '["Closed on weekends", "Limited eating facilities on campus", "Parking can be difficult (walk or taxi)"]'::jsonb,
    'Spent the morning exploring Silliman campus alone. It was beautiful, peaceful, and educational. The museum staff were helpful and made me feel welcome even though I was solo.',
    'https://maps.google.com/?q=Silliman+University+Dumaguete',
    'activity',
    NULL,
    '["su.edu.ph", "Tripadvisor", "travel blogs"]'::jsonb,
    'AI-researched for Sola (Philippines - Dumaguete)',
    88,
    4.4,
    380,
    '2026-02-10 07:28:53.844834+00',
    '9:00 AM - 12:00 PM',
    '2-3 hours',
    'Free entry, museum visits recommended on weekdays',
    'easy',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '9be3c9c1-c23b-5154-ba51-b8116ed5b4fe',
    'f1e77ebf-9d8c-50fe-9d7b-540cc1f032a9',
    'dumaguete-public-market',
    'Dumaguete Public Market',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    9.31111, 123.29889,
    'Real Street, Dumaguete City, Negros Oriental, Philippines',
    NULL,
    NULL,
    NULL,
    1,
    '5:00 AM - 7:00 PM daily',
    'You''ll immerse yourself in the vibrant local culture of Dumaguete at the bustling public market where vendors, fishermen, and families create an authentic Filipino experience. The energy is welcoming to solo explorers, and affordable street food vendors offer genuine local cuisine. It''s sensory-rich and safe during daylight hours.',
    true,
    'Perfect for solo female travelers seeking authentic local experiences and cultural immersion. The busy atmosphere and daytime crowds ensure safety while supporting local economy.',
    '["Authentic local market experience", "Fresh seafood and produce", "Street food vendors", "Affordable prices", "Peak energy in early morning"]'::jsonb,
    '["Very crowded and potentially chaotic", "Sanitation standards vary", "Best visited early morning (5-7 AM)"]'::jsonb,
    'Went to the market solo early morning and loved the energy. Nobody bothered me, the fresh food was incredible and cheap, and I felt like a real local experiencing authentic Dumaguete.',
    'https://maps.google.com/?q=Dumaguete+Public+Market',
    'activity',
    NULL,
    '["dumaguete.com", "Guide to the Philippines", "local guides"]'::jsonb,
    'AI-researched for Sola (Philippines - Dumaguete)',
    82,
    4.1,
    180,
    '2026-02-10 07:28:53.844834+00',
    '5:00 AM - 7:00 AM',
    '1-2 hours',
    'Free entry, cash-only vendors',
    'easy',
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '9dd6bf98-70a7-5cf5-8462-2c6e14fdd8ee',
    'f1e77ebf-9d8c-50fe-9d7b-540cc1f032a9',
    'hayahay-treehouse',
    'Hayahay Treehouse Bar & View Deck',
    'bar',
    'ad2a41b6-ce96-5dfe-8c33-9bee8ba93e67',
    9.29944, 123.31222,
    'Flores Avenue, Piapi (Escaño Beach), Dumaguete City, Negros Oriental, Philippines',
    NULL,
    '+63 35 225 3536',
    NULL,
    2,
    '4:00 PM - 12:00 AM daily',
    'You''ll climb into a treehouse setting with expansive ocean views and sunset colors painting the sky. The rooftop bar atmosphere is relaxed and inclusive, making solo travelers feel part of the scene without pressure. Fresh seafood and cold drinks complete the experience perfectly.',
    true,
    'Unique rooftop setting perfect for solo females seeking social atmosphere without aggressive attention. The sunset views and elevated setting create a special experience.',
    '["Treehouse structure with views", "Rooftop bar experience", "Sunset views", "Fresh seafood menu", "Relaxed atmosphere"]'::jsonb,
    '["Can get crowded during sunset (5-7 PM)", "Wind can be strong at height", "Prices slightly higher than casual bars"]'::jsonb,
    'Went to the sunset alone at Hayahay and it was magical. The views were incredible, the drinks were great, and the vibe was supportive of solo females. Didn''t feel lonely at all.',
    'https://maps.google.com/?q=Hayahay+Treehouse+Dumaguete',
    'bar',
    NULL,
    '["Yelp", "Tripadvisor", "Trip.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Dumaguete)',
    86,
    4.3,
    420,
    '2026-02-10 07:28:53.844834+00',
    'Sunset 5:00 PM - 7:00 PM',
    '2-3 hours',
    'Walk-in, groups call ahead',
    'easy',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '75ff0e35-d958-555a-a0d6-da9d7f020eae',
    'e3ca67ba-3d25-5bc0-99ad-af784e8f8940',
    'cambugahay-falls',
    'Cambugahay Falls',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    9.13983, 123.62662,
    'Brgy. Kinamandagan, Lazi, Siquijor, Philippines',
    NULL,
    NULL,
    NULL,
    1,
    '8:00 AM - 5:00 PM daily',
    'You''ll discover three distinct tiers of cascading waterfalls into crystal-clear pools perfect for swimming alone or with new friends. The hike is moderate and well-marked, giving solo explorers confidence in their independence. The refreshing water and tranquil setting create a meditative experience away from crowds.',
    true,
    'Cambugahay is Siquijor''s most popular waterfall and rightfully so for solo female travelers. The well-developed trail, multiple pools, and peaceful atmosphere create an ideal day adventure.',
    '["Three-tiered waterfall", "Crystal-clear swimming pools", "Well-marked hiking trail", "Picnic-friendly setting", "Closest waterfall to San Juan"]'::jsonb,
    '["Can be crowded during peak season", "Flash flood risk during typhoons", "Entry fee charged (small amount)"]'::jsonb,
    'Hiked to Cambugahay solo and swam alone in the pools. Felt incredibly empowered and peaceful. The water was so clean and refreshing, and I saw other solo female travelers there too which was reassuring.',
    'https://maps.google.com/?q=Cambugahay+Falls+Siquijor',
    'activity',
    NULL,
    '["Tripadvisor", "travel blogs", "local guides"]'::jsonb,
    'AI-researched for Sola (Philippines - Siquijor)',
    92,
    4.6,
    1450,
    '2026-02-10 07:28:53.844834+00',
    '8:00 AM - 12:00 PM',
    '3-4 hours',
    'Small entry fee, guide available for hire',
    'moderate',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'ffa69939-9f0f-5f81-b796-45a133e7bd6d',
    'e3ca67ba-3d25-5bc0-99ad-af784e8f8940',
    'paliton-beach',
    'Paliton Beach',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    9.145, 123.61667,
    'Barangay Paliton, San Juan, Siquijor, Philippines',
    NULL,
    NULL,
    NULL,
    1,
    'Sunrise to sunset (best 6 AM - 6 PM)',
    'You''ll find yourself on a hidden gem beach with powdery white sand and turquoise water, far quieter than Cambugahay. The serene setting and manageable walk from the main road make it perfect for solo beach days. The peaceful vibe and few crowds create the ideal backdrop for meditation or journaling.',
    true,
    'For solo females seeking quiet, peaceful beach time without party atmosphere. Paliton offers genuine solitude and natural beauty in a safe, accessible location.',
    '["Quiet, uncrowded beach", "White sand and turquoise water", "Peaceful atmosphere", "Minimal vendor pressure", "Short walk from main road"]'::jsonb,
    '["No facilities on beach (bring supplies)", "Limited shade (bring sunscreen)", "1.5 km walk on trail (comfortable shoes needed)"]'::jsonb,
    'Paliton Beach was my favorite solo beach day of the entire trip. So quiet and peaceful, I could hear myself think again. Only a few other people there and everyone was respectful of the peaceful vibe.',
    'https://maps.google.com/?q=Paliton+Beach+Siquijor',
    'activity',
    NULL,
    '["Tripadvisor", "travel blogs", "Girl on a Zebra"]'::jsonb,
    'AI-researched for Sola (Philippines - Siquijor)',
    90,
    4.5,
    550,
    '2026-02-10 07:28:53.844834+00',
    '8:00 AM - 12:00 PM',
    '3-4 hours',
    'Free access, 20 PHP entrance fee',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '6b7abf03-5e4b-5df5-a88a-b90533b048df',
    'e3ca67ba-3d25-5bc0-99ad-af784e8f8940',
    'mandala-tribe-treehouses',
    'Mandala Tribe Treehouses',
    'hotel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    9.15, 123.61889,
    'Tambisan, San Juan, Siquijor, Philippines',
    NULL,
    '+63 975 9316451',
    NULL,
    2,
    '24/7 reception',
    'You''ll stay in a unique treehouse setting surrounded by nature, where solo travelers naturally congregate in the communal spaces. Each treehouse offers privacy with connected gathering areas, balancing solitude and community. The holistic wellness focus and peaceful jungle setting create a healing retreat.',
    true,
    'Perfect for solo female travelers seeking unique accommodation with natural wellness focus. The treehouse setting and community spaces offer both privacy and social connection.',
    '["Unique treehouse structures", "Peaceful jungle setting", "Wellness-focused environment", "Communal spaces for socializing", "Nature-based activities"]'::jsonb,
    '["Rustic amenities (no AC in some units)", "Can be buggy during wet season", "Limited nearby restaurants"]'::jsonb,
    'Stayed in a treehouse alone and felt like I was in a fairytale. The peaceful nature sounds, the wellness vibes, and the community of solo travelers in common areas made me feel held and safe while maintaining independence.',
    'https://maps.google.com/?q=Mandala+Tribe+Treehouses+Siquijor',
    'hotel',
    '1500',
    '["Booking.com", "Tripadvisor", "Instagram @mandalatribe.siquijor"]'::jsonb,
    'AI-researched for Sola (Philippines - Siquijor)',
    92,
    4.6,
    620,
    '2026-02-10 07:28:53.844834+00',
    'All day',
    'Overnight stay',
    'Book via Booking.com or direct',
    'easy',
    'Trending',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '0763508e-6b7f-54cf-8c90-18224cb4ace3',
    'e3ca67ba-3d25-5bc0-99ad-af784e8f8940',
    'coco-grove-beach-resort',
    'Coco Grove Beach Resort',
    'hotel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    9.14833, 123.62222,
    'Tubod, San Juan, Siquijor, Philippines',
    NULL,
    NULL,
    'https://www.cocogrovebeachresort.com/',
    3,
    '24/7 reception',
    'You''ll experience luxury wellness on your own terms at this all-inclusive beach resort with world-class spa facilities. The 800-meter white sand beach and three pools offer multiple options for relaxation. Solo guests feel pampered here, with treatments and activities tailored to individual preferences.',
    true,
    'Premium wellness resort perfect for solo female travelers seeking all-inclusive relaxation without the party scene. The spa facilities and beach access make it ideal for self-care focused trips.',
    '["800m white sand beach", "Multiple swimming pools", "World-class spa and Temple Spa", "All-inclusive dining options", "Direct marine sanctuary access"]'::jsonb,
    '["Higher price point", "Can attract couples and families", "Less social for meeting travelers"]'::jsonb,
    'Splurged on a few nights here solo for ultimate self-care. The spa treatments, the beach, the peaceful vibe - I felt truly restored. Worth every peso for the peace of mind and pampering.',
    'https://maps.google.com/?q=Coco+Grove+Beach+Resort+Siquijor',
    'hotel',
    '3500',
    '["cocogrovebeachresort.com", "Booking.com", "Tripadvisor"]'::jsonb,
    'AI-researched for Sola (Philippines - Siquijor)',
    90,
    4.5,
    480,
    '2026-02-10 07:28:53.844834+00',
    'All day',
    'Overnight stay',
    'Book via Booking.com or direct',
    'easy',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'dcd2bdab-e40c-5b44-8a51-86265656e98f',
    'e3ca67ba-3d25-5bc0-99ad-af784e8f8940',
    'lagaan-falls',
    'Lagaan Falls',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    9.13722, 123.62833,
    'Kinamandagan, Lazi, Siquijor, Philippines',
    NULL,
    NULL,
    NULL,
    1,
    '8:00 AM - 5:00 PM daily',
    'You''ll trek to this quieter alternative to Cambugahay Falls where peaceful solitude and natural beauty combine. The moderate hike rewards you with pristine pools and a sense of discovery. Solo hikers appreciate the less-crowded trail and manageable difficulty.',
    true,
    'Perfect for solo females seeking quieter waterfall experiences with reliable hiking infrastructure. The less-crowded nature appeals to introverts and those seeking peaceful immersion.',
    '["Less crowded than Cambugahay", "Pristine natural pools", "Moderate hiking trail", "Peaceful atmosphere", "Good for photography"]'::jsonb,
    '["Trail can be muddy", "Fewer facilities than Cambugahay", "Flash flood risk during rainy season"]'::jsonb,
    'Preferred Lagaan Falls to Cambugahay because it was so peaceful and quiet. I could hear the waterfall and birds, swam alone in the pool, and felt completely at peace with myself.',
    'https://maps.google.com/?q=Lagaan+Falls+Siquijor',
    'activity',
    NULL,
    '["Tripadvisor", "travel blogs", "jonnymelon.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Siquijor)',
    90,
    4.5,
    280,
    '2026-02-10 07:28:53.844834+00',
    '8:00 AM - 12:00 PM',
    '2-3 hours',
    'Free access',
    'moderate',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '93d31312-4c8d-52e1-9277-7d3236bc304e',
    'e3ca67ba-3d25-5bc0-99ad-af784e8f8940',
    'siquijor-island-castle-resort',
    'Siquijor Island Castle Resort',
    'hotel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    9.13889, 123.62722,
    'Lazi, Siquijor, Philippines',
    NULL,
    NULL,
    NULL,
    2,
    '24/7 reception',
    'You''ll stay in a whimsical mini castle just minutes from Cambugahay Falls, combining adventure with fairy-tale charm. The unique architecture and close proximity to major attractions make it ideal for solo travelers seeking memorable accommodation. The peaceful setting offers healing and rest.',
    true,
    'Unique and memorable accommodation perfect for solo female travelers seeking both adventure and comfort. The castle setting and proximity to attractions create an enchanting experience.',
    '["Unique castle architecture", "5 min drive from Cambugahay Falls", "Terrace and sitting areas", "Swimming pool", "Close to Lazi attractions"]'::jsonb,
    '["Limited on-site dining", "No wifi reported in some areas", "Boutique property (limited rooms)"]'::jsonb,
    'Staying in an actual castle solo felt like living out my childhood fantasies! The location was perfect for exploring waterfalls, and the owners were so welcoming to solo females.',
    'https://maps.google.com/?q=Siquijor+Island+Castle+Resort+Lazi',
    'hotel',
    '2000',
    '["Booking.com", "Airbnb", "makemytrip.com"]'::jsonb,
    'AI-researched for Sola (Philippines - Siquijor)',
    88,
    4.4,
    320,
    '2026-02-10 07:28:53.844834+00',
    'All day',
    'Overnight stay',
    'Book via Booking.com or Airbnb',
    'easy',
    'Trending',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'bd1f68a2-2c02-5a96-8b86-f0814298dd48',
    'e3ca67ba-3d25-5bc0-99ad-af784e8f8940',
    'siquijor-wellness-spa',
    'Siquijor Wellness & Spa Experience',
    'wellness',
    '21d190d3-2f37-5e07-a1fc-70bd969ab432',
    9.145, 123.62,
    'Multiple locations across Siquijor Island, Philippines',
    NULL,
    NULL,
    NULL,
    2,
    '8:00 AM - 7:00 PM (varies by location)',
    'You''ll experience traditional Siquijor healing practices and modern spa treatments that honor the island''s mystical reputation. From traditional hilot massage with warm banana leaves to herbal remedies, the wellness offerings are deeply rooted in local culture. Solo travelers find these experiences deeply restorative and soul-nourishing.',
    true,
    'Siquijor''s wellness culture is perfect for solo females seeking healing and self-care. The traditional practices offer cultural learning combined with physical and spiritual restoration.',
    '["Traditional hilot massage", "Herbal medicine practices", "Warm banana leaf treatments", "Mystical healing traditions", "Holistic wellness approach"]'::jsonb,
    '["Quality varies by location", "Advance booking recommended", "May not have modern sanitation standards"]'::jsonb,
    'Had a traditional hilot massage with warm banana leaves and it was the most healing experience of my wellness journey. The healer was so kind and the treatment was deeply restorative. Felt empowered in my self-care.',
    'https://maps.google.com/?q=Siquijor+healing+spa',
    'wellness',
    NULL,
    '["Tripadvisor", "siquijorprovince.com", "travel blogs"]'::jsonb,
    'AI-researched for Sola (Philippines - Siquijor)',
    88,
    4.4,
    250,
    '2026-02-10 07:28:53.844834+00',
    'Morning (9 AM) or afternoon (2 PM)',
    '1-3 hours',
    'Advance booking recommended, ask at hostel/hotel',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '3036ee39-72ca-5ce0-a573-25a5cf8b1f0b',
    'e3ca67ba-3d25-5bc0-99ad-af784e8f8940',
    'lugnason-falls',
    'Lugnason Falls',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    9.15026, 123.53581,
    'Barangay Napo, San Juan, Siquijor, Philippines',
    NULL,
    NULL,
    NULL,
    1,
    '8:00 AM - 5:00 PM daily',
    'You''ll discover a 5-meter waterfall with a large inviting pool of striking blue waters that feels like your own private oasis. The less crowded trail attracts thoughtful solo travelers seeking peaceful immersion in nature. The accessible hike and stunning scenery make this a perfect solo adventure.',
    true,
    'Lugnason offers a more intimate waterfall experience than Cambugahay, with quieter trails and fewer crowds. Perfect for solo females seeking solitude and connection with nature.',
    '["Single impressive 5-meter waterfall", "Large clear blue pool", "Less crowded than Cambugahay", "Easy moderate hike", "Peaceful natural setting"]'::jsonb,
    '["No facilities nearby", "Can be muddy during rainy season", "Fewer vendors means less food/water availability"]'::jsonb,
    'Hiked to Lugnason alone and felt like I discovered a secret paradise. The waterfall was beautiful, the pool was pristine, and I had it mostly to myself. Perfect for solo reflection and swimming.',
    'https://maps.google.com/?q=Lugnason+Falls+Siquijor',
    'activity',
    NULL,
    '["Tripadvisor", "AllTrails", "travel blogs"]'::jsonb,
    'AI-researched for Sola (Philippines - Siquijor)',
    90,
    4.5,
    210,
    '2026-02-10 07:28:53.844834+00',
    '8:00 AM - 12:00 PM',
    '2-3 hours',
    'Free access',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '48a9c466-536d-5afb-ac32-501531979dce',
    '0abddf4d-c01d-5dfc-b362-1ef8f3c4a963',
    'itoys-coffee-haus-pp',
    'Itoys Coffee Haus',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    9.742166, 118.729866,
    'Rizal Avenue, Puerto Princesa City, 5300, Palawan, Philippines',
    'ChIJ0aGC7sAe9TARiPLiGNlEiWo',
    '+63 48 433 5182',
    'www.itoyscoffeehaus.com',
    1,
    '7:00 AM - 11:00 PM daily',
    'You''ll find yourself in Puerto Princesa''s vintage-themed first coffee shop, surrounded by creatives and digital nomads sipping expertly brewed hot and cold coffee. The cozy indoor space offers reliable WiFi (10+ Mbps) perfect for work sessions, while the outdoor al fresco area lets you watch the street life pass by. Pastries, fruit shakes, and vegetarian options keep you fueled throughout the day.',
    true,
    'Perfect for solo female travelers working remotely, with excellent WiFi, welcoming atmosphere, and a safe location on busy Rizal Avenue frequented by locals and tourists alike.',
    '["vintage-aesthetic", "fast-wifi", "power-outlets", "local-crowd", "vegetarian-options", "air-conditioned"]'::jsonb,
    '["can-get-crowded-peak-hours", "limited-seating", "cash-preferred"]'::jsonb,
    '"I worked here for hours on my laptop and felt completely comfortable. The staff knows English and the vibe is very welcoming to solo female travelers."',
    'https://maps.google.com/?q=9.742166,118.729866',
    'cafe',
    NULL,
    '["Google Maps", "Wanderlog", "BusinessList PH", "TripAdvisor"]'::jsonb,
    'AI-researched for Sola (Philippines - Puerto Princesa)',
    86,
    4.3,
    84,
    '2026-02-10 07:28:53.844834+00',
    'Early morning (7-9 AM) or afternoon (2-4 PM)',
    '2-4 hours',
    'Walk-in only, no reservations',
    'easy',
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'ff7b5c99-eb0b-5dfd-8fbe-c76b43e307b7',
    '0abddf4d-c01d-5dfc-b362-1ef8f3c4a963',
    'isla-casoy-de-palawan',
    'Isla Casoy de Palawan Coffee Bar',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    9.740394, 118.734166,
    'SM City Puerto Princesa, 2/F209, Malvar St. Corner Lacao St., Baguio San Miguel, Puerto Princesa, Philippines',
    'ChIJx_-yUd8e9TARE3PqoqkzitE',
    '+63 48 433 9999',
    'www.isiacasoypalawan.com',
    1,
    '10:00 AM - 9:00 PM daily',
    'You''ll discover this charming coffee bar nestled inside SM City mall, showcasing Palawan''s signature cashew product in specialty drinks and pastries. The modern, air-conditioned space offers comfortable seating for solo travelers, with views of the mall atrium creating an open, safe atmosphere. Try their famous cashew-infused Vietnamese coffee or grab locally-made pasalubong gifts for later.',
    true,
    'Located in a major mall, providing a secure, well-lit environment perfect for solo female travelers. Great for casual work or people-watching with reliable amenities.',
    '["unique-cashew-coffee", "air-conditioned", "safe-location", "mall-setting", "local-souvenirs", "comfortable-seating"]'::jsonb,
    '["busy-mall-atmosphere", "can-feel-touristy", "limited-outdoor-seating"]'::jsonb,
    '"Felt very safe here in the mall. The cashew coffee is unique and the staff is friendly. Great spot to relax for a few hours."',
    'https://maps.google.com/?q=9.740394,118.734166',
    'cafe',
    NULL,
    '["TripAdvisor", "HungryFoody", "Google Maps"]'::jsonb,
    'AI-researched for Sola (Philippines - Puerto Princesa)',
    82,
    4.1,
    67,
    '2026-02-10 07:28:53.844834+00',
    'Late morning (10 AM-12 PM) when less crowded',
    '1-3 hours',
    'Walk-in only',
    'easy',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '5dd252b8-ee55-5c9e-ba8a-da488516551a',
    '0abddf4d-c01d-5dfc-b362-1ef8f3c4a963',
    'nook-coffee-pp',
    'Nook Coffee & Pastry Shop',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    9.735, 118.74,
    'Near Rizal Avenue, Puerto Princesa City, Palawan',
    'ChIJ1-_rL2Ee9TARqL1-PPhGFWo',
    '+63 48 433 0501',
    NULL,
    1,
    '7:00 AM - 7:00 PM Monday-Sunday',
    'You''ll love this small, intimate coffee nook where local creatives gather for the best brews in Puerto Princesa. The minimalist aesthetic and natural light create the perfect setting for solo work or journaling, with excellent wifi speeds (10+ Mbps) and plenty of power outlets. Specialty pastries pair perfectly with their smooth single-origin coffees.',
    true,
    'A hidden gem for solo female travelers seeking quiet, focused work environment with reliable connectivity and welcoming community vibe.',
    '["specialty-coffee", "fast-wifi", "power-outlets", "minimalist-design", "local-pastries", "community-vibe"]'::jsonb,
    '["small-space", "can-feel-cramped-during-peak", "limited-menu"]'::jsonb,
    '"Perfect little spot to work alone. The owner is friendly and the other regulars are nice people. Great coffee and quiet during mornings."',
    'https://maps.google.com/?q=9.735,118.74',
    'cafe',
    NULL,
    '["Local recommendations", "Google Maps", "Wanderlog"]'::jsonb,
    'AI-researched for Sola (Philippines - Puerto Princesa)',
    88,
    4.4,
    52,
    '2026-02-10 07:28:53.844834+00',
    'Morning (7-10 AM) for peaceful work',
    '2-4 hours',
    'Walk-in only',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '370d1dd3-f5d9-5b01-8149-cb6ec380f886',
    '0abddf4d-c01d-5dfc-b362-1ef8f3c4a963',
    'kalui-seafood-restaurant',
    'Kalui Seafood Restaurant',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    9.743, 118.7298,
    '369 Rizal Avenue, Barangay San Miguel, Puerto Princesa, 5300 Palawan, Philippines',
    'ChIJLYiP5s8e9TARWU0w2WPKPyc',
    '+63 48 433 2580',
    'www.kaluirestaurant.com',
    2,
    'Daily except Sunday - Lunch 11:00 AM - 2:00 PM; Dinner 6:00 PM - 10:30 PM',
    'You''ll experience a truly unique dining tradition here where you remove your shoes and dine on floor cushions in an intimate, traditional setting. The restaurant specializes in the freshest seafood caught daily, with set meals featuring their finest catches served with local vegetables and traditional preparations. This is an authentic Filipino dining experience that feels welcoming for solo female travelers seeking local culture.',
    true,
    'Cultural dining experience perfect for solo travelers; the communal floor-cushion setup creates a naturally social atmosphere without pressure, with excellent reputation for safety and hospitality toward women.',
    '["fresh-daily-catch", "traditional-seating", "local-cuisine", "cultural-experience", "vegetable-dishes", "no-meat-required"]'::jsonb,
    '["seated-on-floor-cushions", "reservation-recommended-peak-times", "closed-sundays", "outdoor-shoes-not-allowed"]'::jsonb,
    '"Best solo dining experience in PP. The floor cushion setup feels intimate but safe. Service is attentive and they make solo diners feel welcome."',
    'https://maps.google.com/?q=9.743,118.7298',
    'restaurant',
    NULL,
    '["TripAdvisor", "Google Maps", "Wanderlog", "YelpPH"]'::jsonb,
    'AI-researched for Sola (Philippines - Puerto Princesa)',
    90,
    4.5,
    156,
    '2026-02-10 07:28:53.844834+00',
    'Early dinner (6-7 PM) for relaxed pace',
    '1.5-2.5 hours',
    'Reservation highly recommended: email [email protected]',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'cc03a074-9991-5532-98ae-c271a0130ebd',
    '0abddf4d-c01d-5dfc-b362-1ef8f3c4a963',
    'neva-place-pp',
    'Neva''s Place',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    9.738, 118.735,
    'Ground Floor, Robinsons Palawan, Puerto Princesa North Road, National Highway, Puerto Princesa, 5300, Philippines',
    'ChIJL2Pr6-Ae9TAR1q1k5BQGCzM',
    '+63 4843-325-75',
    'nevas-place.goto-where.com',
    2,
    '9:00 AM - 10:00 PM daily',
    'You''ll discover a charming Italian-inspired restaurant with both indoor air-conditioned seating and a lovely outdoor garden patio perfect for solo dining. The menu features creative pizzas, fresh pasta, and delightful desserts including their signature fried bananas. The garden setting creates an intimate, peaceful atmosphere where solo female travelers feel safe and welcomed.',
    true,
    'Female-friendly atmosphere with excellent service toward solo diners. Garden setting feels secure and private while remaining open and visible; great for both leisurely meals and casual work.',
    '["beautiful-garden", "italian-cuisine", "outdoor-seating", "fried-bananas-dessert", "wheelchair-accessible", "cozy-atmosphere"]'::jsonb,
    '["peak-times-can-be-busy", "garden-area-weather-dependent", "slightly-pricier"]'::jsonb,
    '"The garden is so relaxing and I felt completely safe dining alone. Service staff are attentive without being hovering. Highly recommend for solo female travelers."',
    'https://maps.google.com/?q=9.738,118.735',
    'restaurant',
    NULL,
    '["TripAdvisor", "Google Maps", "Wanderlog", "Wheree"]'::jsonb,
    'AI-researched for Sola (Philippines - Puerto Princesa)',
    86,
    4.3,
    98,
    '2026-02-10 07:28:53.844834+00',
    'Lunch (11 AM-2 PM) or early dinner (5:30-7 PM)',
    '1.5-2 hours',
    'Walk-in welcome, reservations recommended for groups',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'c3c7c1c7-c74d-5d6d-bb8c-c241b60e937c',
    '0abddf4d-c01d-5dfc-b362-1ef8f3c4a963',
    'tiya-ising-restaurant',
    'Tiya Ising''s Filipino Restaurant',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    9.74028, 118.73304,
    'Roxas Street, Corner Rizal Avenue, Puerto Princesa City, 5300 Palawan, Philippines',
    'ChIJ-_-zL0Ee9TAREWk5OPhGFWo',
    '(048) 723-175 | Globe: 09175614952 | Smart: 09994739006',
    'tiyaising.wixsite.com/tiyaisings',
    1,
    'Monday - Saturday 11:00 AM - 10:00 PM',
    'You''ll feel transported to a cozy Filipino home as soon as you enter this authentic restaurant filled with antique decor and old Palawan photographs. The menu showcases traditional Filipino comfort food like sisig, crocodile dishes, and seafood preparations with warm, grandmotherly service. The retro-modern interior creates an intimate, welcoming space perfect for solo diners seeking genuine local flavors.',
    true,
    'Excellent solo dining experience with traditional Filipino hospitality. Safe, well-established restaurant with excellent reputation and strong support for solo female travelers from the owner.',
    '["authentic-local-cuisine", "antique-decor", "cultural-vibe", "warm-service", "traditional-dishes", "nostalgic-atmosphere"]'::jsonb,
    '["popular-peak-hours", "limited-parking", "cash-preferred"]'::jsonb,
    '"Felt like dining at a Filipino grandmother''s house. The owner made me feel so welcome eating alone. Authentic food and great service."',
    'https://maps.google.com/?q=9.74028,118.73304',
    'restaurant',
    NULL,
    '["TripAdvisor", "YELP", "Wanderlog", "Google Maps", "YelpPH"]'::jsonb,
    'AI-researched for Sola (Philippines - Puerto Princesa)',
    88,
    4.4,
    112,
    '2026-02-10 07:28:53.844834+00',
    'Lunch (11 AM-1 PM) for quieter pace',
    '1.5-2 hours',
    'Walk-in welcome, phone reservations accepted',
    'easy',
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'c0f128be-3559-5535-b5ce-6ddbdfe043da',
    '0abddf4d-c01d-5dfc-b362-1ef8f3c4a963',
    'palacio-hostel',
    'Palacio Hostel',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    9.76, 118.735,
    'Sienatel Rd., Bgy. Tiniguiban, Puerto Princesa, 5300 Palawan, Philippines',
    'ChIJ-_-zL0Ee9TARiZLvmGmhkTM',
    '+63 48 434 2555',
    'www.palacio-hostel.com',
    1,
    '24-hour reception',
    'You''ll find the best-rated female solo traveler hostel in Puerto Princesa, featuring spacious second-floor accommodations with a huge resort-style pool and restaurant. The female-only dormitories provide secure lockers, comfortable beds, and key-card access for peace of mind. The on-site restaurant and social lounge make meeting other travelers easy, while 24-hour reception ensures support whenever you need it.',
    true,
    'Highest-rated hostel for female solo travelers with dedicated female dorms, excellent safety features (24-hr reception, key-card access, lockers), and strong community atmosphere. Perfect for making travel friends.',
    '["female-only-dorms", "resort-pool", "secure-lockers", "key-card-access", "24-hr-reception", "on-site-restaurant"]'::jsonb,
    '["location-far-from-downtown", "need-transportation-to-city", "can-be-loud-party-nights"]'::jsonb,
    '"Best hostel choice in PP for solo women. The female dorms are secure, and there''s always someone around. Pool is amazing and staff is super helpful."',
    'https://maps.google.com/?q=9.76,118.735',
    'hostel',
    '₱300-500 (dorm) / ₱800-1200 (private)',
    '["TripAdvisor", "Hostelz", "Booking.com", "Hostelworld", "Google Maps"]'::jsonb,
    'AI-researched for Sola (Philippines - Puerto Princesa)',
    99.99,
    8.4,
    39,
    '2026-02-10 07:28:53.844834+00',
    'Check-in after 2 PM',
    '1-7 nights',
    'Book online at Booking.com, Hostelworld, or direct via website',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '9ea623c3-283d-5ca5-87fa-65c945ae66fd',
    '0abddf4d-c01d-5dfc-b362-1ef8f3c4a963',
    'guni-guni-hostel',
    'Guni Guni Hostel',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    9.745, 118.732,
    '263 Manalo Extension, Puerto Princesa, Palawan, 5300, Philippines',
    'ChIJL2Pr6-Ae9TARqL1-PPhGFWo',
    '+63 48 434 0123',
    'guniguni.hostel.club',
    1,
    '24-hour reception',
    'You''ll experience authentic Filipino hospitality at this super-clean female-friendly hostel located just 5 minutes from the airport. The female-only dormitories feature excellent security, friendly English-speaking staff, and a vibrant resto/bar where you can mingle with travelers nightly. Happy hour (5-7 PM) often features acoustic live music, creating the perfect social atmosphere for solo female travelers.',
    true,
    'Consistently praised by solo female travelers for cleanliness, security, and staff hospitality. Female-only dorms, convenient location near airport, and built-in social opportunities make it ideal.',
    '["female-only-dorms", "super-clean", "friendly-staff", "resto-bar", "live-music", "airport-close", "secure-lockers"]'::jsonb,
    '["near-airport-noise", "can-be-noisy-evenings", "happy-hour-gets-crowded"]'::jsonb,
    '"Super safe for solo women. Staff is incredibly helpful, facilities are clean, and the happy hour vibe is perfect for meeting other travelers."',
    'https://maps.google.com/?q=9.745,118.732',
    'hostel',
    '₱350-500 (dorm) / ₱900-1300 (private)',
    '["TripAdvisor", "Hostelworld", "Booking.com", "Google Maps"]'::jsonb,
    'AI-researched for Sola (Philippines - Puerto Princesa)',
    99.99,
    8.6,
    68,
    '2026-02-10 07:28:53.844834+00',
    'Check-in 2 PM onwards, happy hour 5-7 PM',
    '1-5 nights',
    'Book via Booking.com, Hostelworld, or direct website',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '9edf34cf-dafb-5d9b-b8a9-31d9bf1a1c0f',
    '0abddf4d-c01d-5dfc-b362-1ef8f3c4a963',
    'puerto-princesa-underground-river',
    'Puerto Princesa Subterranean River National Park',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    10.191, 118.95,
    'Sabang, Puerto Princesa, Palawan, Philippines (80km north of city)',
    'ChIJB-L1DqVs9TARFGqXQfKQQxE',
    '+63 48 434 3008',
    'undergroundriver.puertoprincesa.ph',
    2,
    '8:00 AM - 4:00 PM daily (tours must start by 3:00 PM)',
    'You''ll paddle through an 8-kilometer UNESCO-listed underground river that stretches through massive chambers carved by water and time. Your licensed guide will navigate you through caves illuminated by your headlamp, pointing out rock formations, stalactites, and bat colonies. This UNESCO World Heritage site and New7Wonders of Nature winner is the world''s longest underground river accessible to tourists.',
    true,
    'Organized tour structure ensures safety and accessibility. UNESCO World Heritage site appeals to adventurous solo female travelers. All-inclusive tours with professional guides create social opportunities without pressure.',
    '["UNESCO-world-heritage", "underground-cave-system", "guided-tour", "bat-colonies", "nature-experience", "geological-formations"]'::jsonb,
    '["long-travel-time-from-city", "physical-exertion-required", "claustrophobic-feeling-possible", "boat-seat-can-be-wet"]'::jsonb,
    '"Amazing and slightly intimidating underground cave experience. The guide was professional and the tour group made it fun. Worth the long travel time."',
    'https://maps.google.com/?q=10.191,118.95',
    'activity',
    NULL,
    '["TripAdvisor", "UNESCO", "Guide to Philippines", "Klook"]'::jsonb,
    'AI-researched for Sola (Philippines - Puerto Princesa)',
    92,
    4.6,
    892,
    '2026-02-10 07:28:53.844834+00',
    'Morning tours (8-10 AM) recommended',
    '8-10 hours (including travel)',
    'Book through tour operators or GetYourGuide, Klook',
    'moderate',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'fc37ead8-1d4c-5f51-8ced-4597b1ba3b01',
    '0abddf4d-c01d-5dfc-b362-1ef8f3c4a963',
    'honda-bay-island-hopping',
    'Honda Bay Island Hopping Tour',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    9.78, 118.68,
    'Honda Bay Wharf, Barangay Sta. Lourdes, Puerto Princesa, Palawan',
    'ChIJm-L1DqVs9TAR0GqXQfKQQxE',
    '+63 927 685 5534 (Corazon Tours)',
    'www.travel-palawan.com',
    2,
    'Daily tours 7:30 AM - 4:30 PM',
    'You''ll island-hop across Honda Bay visiting Starfish Island, Cowrie Island, and Luli Island with stops for snorkeling in crystal-clear waters. The guided boat tour includes lunch on one of the islands, all activities, and environmental fees, making it an all-inclusive adventure. Swimming with starfish and exploring vibrant coral reefs creates magical memories perfect for solo travelers seeking group experiences.',
    true,
    'Organized group tours provide safety and social connection without being overly structured. Professional tour operators familiar with solo female travelers. Snorkeling suitable for various fitness levels.',
    '["island-hopping", "snorkeling", "starfish-island", "coral-reefs", "beach-lunch", "sea-life", "group-tour-safety"]'::jsonb,
    '["sun-exposure-high", "boat-motion-possible", "seasickness-risk", "tour-quality-varies-by-operator"]'::jsonb,
    '"Great group tour setup. Met other travelers immediately and spent the day snorkeling and exploring. The guide was knowledgeable and tour felt safe."',
    'https://maps.google.com/?q=9.78,118.68',
    'activity',
    NULL,
    '["GetYourGuide", "Civitatis", "Travel-Palawan", "TripAdvisor"]'::jsonb,
    'AI-researched for Sola (Philippines - Puerto Princesa)',
    90,
    4.5,
    334,
    '2026-02-10 07:28:53.844834+00',
    'Departs 7:30-8:30 AM',
    '8-9 hours',
    'Book with Corazon Tours or via GetYourGuide, Klook',
    'moderate',
    'Trending',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '51fce5ec-d4b2-5252-a23d-93c2f24314d0',
    '0abddf4d-c01d-5dfc-b362-1ef8f3c4a963',
    'iwahig-firefly-tour',
    'Iwahig Firefly Watching Tour',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    9.681, 118.722,
    'Iwahig Eco Park, Baywalk, Puerto Princesa, 5300 Palawan, Philippines',
    'ChIJ-_-zL0Ee9TARqL1-PPhGFWo',
    '+632 703 5578',
    'www.travel-palawan.com/product/firefly-watching',
    1,
    'Evening tours 5:00 PM - 6:00 PM departure',
    'You''ll drift silently through mangrove forests as thousands of fireflies light up the night, creating a magical experience like nothing else. The peaceful boat ride through Iwahig River includes dinner before or after, with expert guides explaining the firefly ecosystem. Solo travelers often have deeply personal moments watching nature''s light show while connecting with fellow travelers.',
    true,
    'Romantic yet safe solo experience. Small group sizes create intimate atmosphere. Well-established eco-tourism operation with strong safety reputation. Perfect stress-relief activity.',
    '["firefly-display", "mangrove-forest", "night-boat-ride", "dinner-included", "eco-tourism", "peaceful-experience", "magical-moment"]'::jsonb,
    '["weather-dependent", "peak-season-crowded", "early-evening-required", "boat-can-be-small"]'::jsonb,
    '"Breathtakingly magical. Watching thousands of fireflies with peaceful guides and nature sounds was surreal. Worth every peso."',
    'https://maps.google.com/?q=9.681,118.722',
    'activity',
    NULL,
    '["GetYourGuide", "TripAdvisor", "Travel-Palawan", "Guide to Philippines"]'::jsonb,
    'AI-researched for Sola (Philippines - Puerto Princesa)',
    94,
    4.7,
    247,
    '2026-02-10 07:28:53.844834+00',
    'Evening departure 5:00-6:00 PM',
    '3-4 hours',
    'Book via GetYourGuide, El Nido Paradise, or direct via phone',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'ec9ec34a-8b0e-5118-bdc9-6b4629b863a0',
    '0abddf4d-c01d-5dfc-b362-1ef8f3c4a963',
    'bakers-hill-sunset-landmark',
    'Baker''s Hill',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    9.732, 118.74,
    'Mitra Road, Barangay Sta. Monica, Puerto Princesa, 5300 Palawan, Philippines',
    'ChIJ-_-zL0Ee9TARiZLvmGmhkTM',
    '+63 48 434 9999',
    'www.bakers-hill.com',
    1,
    '7:00 AM - 8:00 PM daily',
    'You''ll climb to this hilltop pasalubong shop offering 360-degree views of Puerto Princesa''s mountains and valleys, especially stunning during sunset. The bakery sells local products and souvenirs while the viewpoint provides free photo opportunities and peaceful moments alone. Early mornings show cooler temperatures and softer light perfect for contemplation.',
    true,
    'Free landmark accessible to solo travelers at any time. Safe, well-maintained, and visited by tourists/locals creating public atmosphere. Perfect for sunset watching alone.',
    '["360-panoramic-views", "sunset-views", "free-entry", "local-products", "photo-spot", "peaceful-atmosphere", "viewpoint"]'::jsonb,
    '["steep-climb-required", "can-be-crowded-peak-hours", "minimal-shade", "souvenir-prices-high"]'::jsonb,
    '"Great free viewpoint to visit solo. Go early morning or late afternoon for best light. No pressure to buy, but products are nice."',
    'https://maps.google.com/?q=9.732,118.74',
    'landmark',
    NULL,
    '["Guide to Philippines", "TripAdvisor", "YELP", "Google Maps"]'::jsonb,
    'AI-researched for Sola (Philippines - Puerto Princesa)',
    84,
    4.2,
    156,
    '2026-02-10 07:28:53.844834+00',
    'Early morning (7-8 AM) or sunset (6-7:30 PM)',
    '1-2 hours',
    'Walk-in anytime, free entry',
    'easy',
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'c0f373e5-f3c1-559b-98a4-45229697a3c7',
    '5c87fe68-3cf8-52c1-b46d-b405cb11a4f8',
    'foam-coffee-legarda',
    'Foam Coffee - Legarda',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    16.412, 120.588,
    '19 Kisad Road, Legarda Rd, Baguio, 2600 Benguet, Philippines',
    'ChIJ1_-rL2Ee9TARqL1-PPhGFWo',
    '+63 74 446 1892',
    'www.foamcoffeeph.com',
    1,
    '8:00 AM - 1:00 AM daily',
    'You''ll fall in love with this minimalist-designed two-story cafe known for its fluffy doughnuts and specialty espresso drinks. The roastery visible on the first floor creates an Instagram-worthy aesthetic, while the upper floors offer quieter seating perfect for work or solo hangs. The late hours (open until 1 AM) make it ideal for digital nomads and night owls.',
    true,
    'Baguio''s trendiest solo-friendly cafe with excellent wifi, aesthetic appeal, and extended hours. Well-lit at night and frequented by mix of travelers and locals. Perfect for working or relaxing.',
    '["minimalist-design", "fluffy-doughnuts", "specialty-coffee", "roastery-visible", "instagram-worthy", "late-hours", "two-story-space"]'::jsonb,
    '["peak-hours-crowded", "can-be-loud", "queue-times-long", "limited-seating-upstairs"]'::jsonb,
    '"Perfect Baguio cafe for solo travelers. Great coffee, aesthetic is amazing, and late hours mean you can work or chill anytime. Very safe and welcoming."',
    'https://maps.google.com/?q=16.412,120.588',
    'cafe',
    NULL,
    '["Klook", "Zoy to the World", "TikTok", "Google Maps", "Wanderlog"]'::jsonb,
    'AI-researched for Sola (Philippines - Baguio)',
    90,
    4.5,
    324,
    '2026-02-10 07:28:53.844834+00',
    'Afternoon (2-4 PM) or late night (8 PM-midnight)',
    '2-4 hours',
    'Walk-in only, no reservations',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '43d59a81-9e1a-5871-9a42-3214d6bbe911',
    '5c87fe68-3cf8-52c1-b46d-b405cb11a4f8',
    'patch-cafe-baguio',
    'Patch Café',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    16.406, 120.587,
    '3 Leonard Wood Road, Bloomfield Hotel, Baguio, 2600 Benguet, Philippines',
    'ChIJ1_-rL2Ee9TARqL1-PPhGFWo',
    '074-4469112',
    NULL,
    1,
    '7:00 AM - 10:00 PM daily',
    'You''ll appreciate this cozy modern cafe inside Bloomfield Hotel offering all-day breakfast, specialty coffee, and light bites with a simple, welcoming interior design. The emphasis on comfort food and hot beverages makes it perfect for Baguio''s cool climate. Soft lighting and comfortable seating create an ideal study-and-chill atmosphere.',
    true,
    'Excellent for solo travelers who want comfort and safety of hotel location without feeling sterile. Good for extended work sessions. Welcoming staff familiar with solo guests.',
    '["all-day-breakfast", "specialty-coffee", "light-bites", "simple-design", "hotel-location", "cozy-atmosphere", "comfortable-seating"]'::jsonb,
    '["hotel-vibe-may-feel-formal", "limited-outdoor-seating", "slightly-pricier"]'::jsonb,
    '"Safe, comfortable place to work or relax. The staff is very attentive without being intrusive. Great for a long work session on a cold Baguio day."',
    'https://maps.google.com/?q=16.406,120.587',
    'cafe',
    NULL,
    '["YELP", "Google Maps", "Klook"]'::jsonb,
    'AI-researched for Sola (Philippines - Baguio)',
    86,
    4.3,
    89,
    '2026-02-10 07:28:53.844834+00',
    'Morning (7-9 AM) for breakfast or afternoon (2-4 PM) for quiet work',
    '2-4 hours',
    'Walk-in only',
    'easy',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '986e8e4a-499d-59dd-b3ed-dac2561537b7',
    '5c87fe68-3cf8-52c1-b46d-b405cb11a4f8',
    'beyond-baguio-cafe',
    'Beyond Baguio Cafe & Restaurant',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    16.35, 120.6,
    'Itogon, Benguet, Philippines (10-15 min drive from Pacdal Circle)',
    'ChIJ1_-rL2Ee9TARqL1-PPhGFWo',
    '+63 917 123 4567',
    NULL,
    1,
    'Monday-Friday 10:00 AM - 8:00 PM; Saturday-Sunday 8:00 AM - 8:00 PM',
    'You''ll discover this peaceful Cordilleran-designed cafe located just outside Baguio''s main area, perfect for solo travelers seeking quiet away-from-the-crowd vibes. The spacious al fresco dining and modern interior combine nature with comfort, serving quality coffee, fried chicken, pizza, and local dishes. The serene mountain setting creates the ideal retreat for reflective solo travel moments.',
    true,
    'Unique location offers peaceful escape from city while remaining accessible. Excellent for solo travelers seeking contemplation. Safe, established operation in quiet area.',
    '["cordilleran-design", "peaceful-location", "al-fresco-seating", "local-cuisine", "quality-coffee", "mountain-views", "quiet-atmosphere"]'::jsonb,
    '["outside-main-city-center", "limited-wifi", "fewer-crowds-means-fewer-people", "transportation-needed"]'::jsonb,
    '"Perfect escape from Baguio crowds. Very peaceful, good coffee, and welcoming to solo travelers. Felt safe and relaxed the whole time."',
    'https://maps.google.com/?q=16.35,120.6',
    'cafe',
    NULL,
    '["Klook", "Wanderlog", "TikTok", "Local guides"]'::jsonb,
    'AI-researched for Sola (Philippines - Baguio)',
    88,
    4.4,
    67,
    '2026-02-10 07:28:53.844834+00',
    'Anytime for peaceful atmosphere',
    '2-4 hours',
    'Walk-in only',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'aa8f4318-99e9-5a5c-8c8e-1c3817eec6fd',
    '5c87fe68-3cf8-52c1-b46d-b405cb11a4f8',
    'grumpy-joe-restaurant',
    'Grumpy Joe',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    16.407, 120.584,
    '15 Gibraltar Rd, Baguio, 2600 Benguet, Philippines',
    'ChIJ1_-rL2Ee9TARqL1-PPhGFWo',
    '+639164936879',
    NULL,
    2,
    '10:00 AM - 9:00 PM Monday-Sunday',
    'You''ll enjoy generous portions of American and Italian comfort food at this beloved Baguio institution with a homey ambiance perfect for lingering over meals. Pizza, burgers, pasta, and hearty dishes come with excellent coffee and a warm, welcoming atmosphere. The casual setting and mix of solo diners and groups create a naturally social yet non-pressuring environment.',
    true,
    'Excellent solo dining atmosphere with established reputation for welcoming solo travelers. Generous portions, reliable quality, and casual vibe reduce dining-alone awkwardness.',
    '["generous-portions", "american-italian-cuisine", "homey-ambiance", "excellent-coffee", "pasta-pizza-burgers", "casual-setting", "solo-diners-welcome"]'::jsonb,
    '["cash-only-establishment", "peak-times-crowded", "can-be-noisy", "no-reservations"]'::jsonb,
    '"One of the best solo dining spots in Baguio. Big portions mean good value, relaxed vibe, and they welcome solo diners. Go cash-prepared."',
    'https://maps.google.com/?q=16.407,120.584',
    'restaurant',
    NULL,
    '["YELP", "TripAdvisor", "Google Maps", "Klook"]'::jsonb,
    'AI-researched for Sola (Philippines - Baguio)',
    88,
    4.4,
    178,
    '2026-02-10 07:28:53.844834+00',
    'Late lunch (2-3 PM) or early dinner (5-6 PM)',
    '1.5-2 hours',
    'Walk-in only, cash only',
    'easy',
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '53ac3451-dbaa-5f16-81ac-9e1b16c1289d',
    '5c87fe68-3cf8-52c1-b46d-b405cb11a4f8',
    'baden-powell-hostel-baguio',
    'Baden Powell Hostel',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    16.4073, 120.5882,
    'Gov Pack Road (Session Road), Baguio City, 2600 Benguet, Philippines',
    'ChIJ1_-rL2Ee9TARqL1-PPhGFWo',
    '+63 74 445 8812',
    'www.badenpowellhostelbaguio.com',
    1,
    '24-hour reception',
    'You''ll stay in this historic hostel just 3 minutes walk from SM City Baguio, offering a perfect blend of convenience and community. The hostel features a garden, social common areas, and is strategically located near major transportation hubs and shopping. Budget-friendly dormitory options make it ideal for solo female travelers seeking both comfort and opportunities to meet other travelers.',
    true,
    'Excellent location near SM City and public transport. Garden setting provides retreat space. Well-established hostel with strong community atmosphere. Budget-friendly for extended stays.',
    '["garden-setting", "sm-city-walk", "public-transport-close", "social-atmosphere", "budget-friendly", "historic-location", "common-areas"]'::jsonb,
    '["can-be-noisy-evenings", "mixed-dorms-only", "transportation-needed-to-attractions"]'::jsonb,
    '"Great location and budget-friendly. The garden is nice for relaxing, staff is helpful, and being near SM City is convenient for everything."',
    'https://maps.google.com/?q=16.4073,120.5882',
    'hostel',
    '₱350-450 (dorm) / ₱800-1100 (private)',
    '["Booking.com", "Hotels.com", "Klook", "Google Maps"]'::jsonb,
    'AI-researched for Sola (Philippines - Baguio)',
    99.99,
    8.2,
    52,
    '2026-02-10 07:28:53.844834+00',
    'Check-in 2 PM onwards',
    '1-5 nights',
    'Book via Booking.com, Agoda, or direct website',
    'easy',
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '062485f3-e58c-58d4-8deb-11ad2b7ef96d',
    '5c87fe68-3cf8-52c1-b46d-b405cb11a4f8',
    '3bu-hostel-session',
    '3BU Hostel',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    16.408, 120.586,
    '121 Upper Bonifacio St., Holy Ghost, Baguio City, 2600 Benguet, Philippines',
    'ChIJ1_-rL2Ee9TARqL1-PPhGFWo',
    '+63 74 445 0123',
    'www.3buhostel.com',
    1,
    '24-hour reception',
    'You''ll experience modern hostel comfort in individual pod-style rooms offering both dorm and private options, all with air-conditioning and hot showers. The Upper Bonifacio location puts you steps from Session Road''s shops, restaurants, and cafes, making it highly convenient for solo exploration. Fast, stable wifi and comfortable common areas encourage both solitude and social connection.',
    true,
    'Excellent location in the heart of Baguio. Modern pod-style dorms offer privacy within social setting. Convenient for independent exploration while maintaining community atmosphere.',
    '["pod-style-dorms", "ac-in-all-rooms", "hot-showers", "session-road-location", "fast-wifi", "common-areas", "central-location"]'::jsonb,
    '["small-pod-spaces", "can-be-noisy-evenings", "shared-bathroom-pod-dorms"]'::jsonb,
    '"The pod dorms feel private while the location is perfect for getting around Baguio. Good wifi and friendly staff make it great for digital nomads."',
    'https://maps.google.com/?q=16.408,120.586',
    'hostel',
    '₱400-550 (pod dorm) / ₱900-1300 (private)',
    '["Booking.com", "Klook", "Agoda", "Google Maps"]'::jsonb,
    'AI-researched for Sola (Philippines - Baguio)',
    99.99,
    8.3,
    45,
    '2026-02-10 07:28:53.844834+00',
    'Check-in 2 PM onwards',
    '1-7 nights',
    'Book via Booking.com, Agoda, or 3buhostel.com',
    'easy',
    'Trending',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'ef5caf98-36bc-521c-ab7b-0536003a9d12',
    '5c87fe68-3cf8-52c1-b46d-b405cb11a4f8',
    'burnham-park-baguio',
    'Burnham Park',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    16.409, 120.591,
    'Jose Abad Santos Drive, Baguio, 2600 Benguet, Philippines',
    'ChIJiYLvmGmhkTMR8rwh5qkzitE',
    '+63 74 442 8000',
    'new.baguio.gov.ph',
    1,
    '24/7 open; activities 6:00 AM - 10:00 PM',
    'You''ll discover Baguio''s 32-hectare heart, a beautifully maintained urban park with tree-lined paths, the scenic Burnham Lagoon, rose gardens, and quiet corners perfect for solo contemplation. The paved walkway loop takes 30-40 minutes and reveals gardens most tourists miss. Early morning strolls offer peaceful solitude before crowds arrive.',
    true,
    'Free, safe, and always populated with mix of locals and tourists. Perfect for solo morning walks, jogging, or meditation. Well-lit and maintained with nearby cafes.',
    '["tree-lined-paths", "lagoon-views", "rose-garden", "quiet-gardens", "paved-walkways", "free-entry", "safe-public-space"]'::jsonb,
    '["can-be-crowded-weekends", "limited-shade-areas", "boating-separate-fee", "can-feel-lonely-late-evening"]'::jsonb,
    '"Perfect place for a solo morning walk in Baguio. Very safe and peaceful early on. Great for solo reflection and light exercise."',
    'https://maps.google.com/?q=16.409,120.591',
    'landmark',
    NULL,
    '["TripAdvisor", "Guide to Philippines", "City Government of Baguio", "Google Maps"]'::jsonb,
    'AI-researched for Sola (Philippines - Baguio)',
    88,
    4.4,
    412,
    '2026-02-10 07:28:53.844834+00',
    'Early morning (6-8 AM) or late afternoon (4-6 PM)',
    '1-2 hours',
    'Walk-in anytime, free entry',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'c017ba8c-abc7-59f0-9efb-16a5557a479c',
    '5c87fe68-3cf8-52c1-b46d-b405cb11a4f8',
    'bencab-museum',
    'BenCab Museum',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    16.465, 120.635,
    '91KM., #6 Asin Road, Tadiangan, Tuba, Benguet, Philippines',
    'ChIJ1_-rL2Ee9TARqL1-PPhGFWo',
    '+63744427165',
    'bencabmuseum.org',
    1,
    'Tuesday-Sunday 9:00 AM - 6:00 PM (last entry 5:30 PM); Closed Mondays',
    'You''ll immerse yourself in contemporary Filipino art at this museum dedicated to Philippine National Artist Benedicto Cabrera''s personal collection. Themed galleries showcase traditional Cordillera art with stunning sculptures and paintings, alongside modern works offering insight into Filipino artistic expression. The scenic mountain views from the museum grounds complement the contemplative art experience perfect for solo travelers.',
    true,
    'Excellent solo activity for cultural engagement. Safe, established institution. Solo travelers can explore at own pace. Combination of art and nature creates rich experience.',
    '["contemporary-filipiana-art", "cordillera-tradition-gallery", "mountain-views", "themed-galleries", "sculptural-works", "national-artist-collection", "peaceful-setting"]'::jsonb,
    '["located-outside-city-center", "jeepney-transportation-required", "not-wheelchair-accessible-all-areas", "closed-mondays"]'::jsonb,
    '"Amazing art museum with beautiful mountain views. Going solo let me spend as much time as I wanted with the works. Felt very safe and inspired."',
    'https://maps.google.com/?q=16.465,120.635',
    'activity',
    NULL,
    '["TripAdvisor", "BenCab Museum official", "Guide to Philippines", "Google Maps"]'::jsonb,
    'AI-researched for Sola (Philippines - Baguio)',
    92,
    4.6,
    189,
    '2026-02-10 07:28:53.844834+00',
    'Mid-morning (10-11 AM) or early afternoon (2-3 PM)',
    '2-3 hours',
    'Walk-in; tickets at entrance (₱200 general admission)',
    'moderate',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '45400459-dc1e-5bb5-bf01-2b496d75340b',
    '5c87fe68-3cf8-52c1-b46d-b405cb11a4f8',
    'camp-john-hay',
    'Camp John Hay',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    16.402333, 120.596007,
    'Loakan Road, John Hay Special Economic Zone, Baguio City, 2600 Benguet, Philippines',
    'ChIJ1_-rL2Ee9TARqL1-PPhGFWo',
    '+63 74 442 4701',
    'www.jhmc.com.ph',
    1,
    '6:00 AM - 7:00 PM daily (facilities have varying hours)',
    'You''ll explore this sprawling pine-covered former US military base transformed into a recreational destination with nature trails, horseback riding, botanical garden, and restaurants. The peaceful, tree-lined pathways offer solitude and exercise opportunities perfect for solo travelers seeking nature immersion. Cool mountain air and serene forest setting create ideal conditions for stress relief and reflection.',
    true,
    'Large, open space with multiple activities allows solo travelers to choose engagement level. Safe, well-maintained facility. Various activities appeal to different interests and fitness levels.',
    '["pine-forest-trails", "horseback-riding", "botanical-garden", "cool-mountain-air", "peaceful-pathways", "restaurants-on-site", "scenic-grounds"]'::jsonb,
    '["transportation-needed", "activities-have-separate-fees", "can-feel-isolated", "weather-dependent"]'::jsonb,
    '"Beautiful place to wander and explore at your own pace. The trails are peaceful and safe. Great for getting exercise and feeling one with nature."',
    'https://maps.google.com/?q=16.402333,120.596007',
    'activity',
    NULL,
    '["Guide to Philippines", "John Hay Management Corp", "TripAdvisor", "Google Maps"]'::jsonb,
    'AI-researched for Sola (Philippines - Baguio)',
    86,
    4.3,
    267,
    '2026-02-10 07:28:53.844834+00',
    'Morning (6-8 AM) or late afternoon (4-6 PM)',
    '2-4 hours',
    'Day pass available at gates; activities require additional fees',
    'moderate',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'ff104b50-2c1a-598a-8c47-59b435516b7e',
    '5c87fe68-3cf8-52c1-b46d-b405cb11a4f8',
    'massage-luxx-spa',
    'Massage Luxx Spa',
    'wellness',
    '21d190d3-2f37-5e07-a1fc-70bd969ab432',
    16.406, 120.588,
    'Ground Floor, West Burnham Place, 16 Kisad Road, Corner Shanum St., Baguio, 2600 Benguet, Philippines',
    'ChIJ1_-rL2Ee9TARqL1-PPhGFWo',
    '0917-705-7398 | 0961-712-0185 | (074) 244-0382',
    '@massageluxxspa.baguio (Instagram)',
    2,
    '12:00 PM - 2:00 AM daily',
    'You''ll find Baguio''s first Japanese Onsen Spa offering a serene luxury relaxation experience with hot and cold pools, steam room, dry sauna, and professional massage treatments. The upscale environment caters specifically to female guests seeking stress relief and self-care in a secure, women-friendly setting. Late hours make it perfect for solo evening relaxation sessions.',
    true,
    'Dedicated female-friendly wellness space emphasizing safety and comfort. Japanese Onsen culture creates meditative atmosphere. Extended hours suit solo travelers with flexible schedules.',
    '["japanese-onsen-spa", "hot-cold-pools", "steam-room", "professional-massage", "female-friendly-space", "luxury-experience", "late-hours"]'::jsonb,
    '["premium-pricing", "packages-can-be-expensive", "reserve-advance-peak-times", "limited-male-access-facilities"]'::jsonb,
    '"Amazing pampering experience. The onsen pools are so relaxing and the staff make you feel very safe and cared for. Worth the splurge for self-care day."',
    'https://maps.google.com/?q=16.406,120.588',
    'wellness',
    NULL,
    '["Klook", "Instagram", "X (Twitter)", "Local guides"]'::jsonb,
    'AI-researched for Sola (Philippines - Baguio)',
    94,
    4.7,
    124,
    '2026-02-10 07:28:53.844834+00',
    'Evening (6-9 PM) for relaxation',
    '2-3 hours',
    'Walk-in welcome, advance booking recommended via phone',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'b0f102f7-815d-5941-956e-0fc63290190b',
    '410b6f38-89c8-5242-a46b-74f1edbe2bf3',
    'frank-dean-coffee-bgc',
    'Frank & Dean Coffee',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    14.5541, 121.5602,
    'G/F Five Neo Building, 31st St., BGC, Taguig City 1634, Metro Manila',
    'ChIJV_gTXHj3LDMRu4U3pnNKOqc',
    '+63 917 134 0032',
    'https://frankdeancoffee.com/',
    2,
    'Mon-Fri 6am-2am, Sat 6am-10pm, Sun Closed',
    'You''ll discover a cozy, minimalist coffee haven in BGC where the specialty brews come with a late-night vibe perfect for solo work sessions. The quiet, mindful atmosphere and ample charging outlets make this your ideal spot for remote work without the cafe chatter. Expert baristas accommodate every milk preference, and the extended hours (open until 2am on weekdays) make it uniquely accessible for night-owl female travelers.',
    true,
    'Perfect for solo female travelers seeking a safe, well-lit workspace with excellent coffee and a welcoming community. The late hours and no-loud-music policy create an ideal environment for women traveling alone who want to work or relax without pressure to socialize.',
    '["Open until 2am on weekdays", "Specialty coffee with on-site roastery", "Free WiFi and numerous charging outlets", "Quiet, mindful atmosphere with accommodating staff", "Vegan milk options (oat, almond, soy)", "Cozy minimalist interior design"]'::jsonb,
    '["Closed on Sundays", "Can get crowded during peak hours", "Seating comfort varies between areas"]'::jsonb,
    'As a solo traveler, I felt completely comfortable working here late into the evening. The staff was so accommodating about dietary preferences, and I loved that the cafe respects a quiet atmosphere. It''s my go-to spot whenever I need to get work done safely in BGC.',
    'https://maps.google.com/maps?q=Frank+%26+Dean+Coffee+BGC',
    'cafe',
    NULL,
    '["frankdeancoffee.com", "Philippine Primer", "Bookmans Guide BGC Cafes", "TripAdvisor"]'::jsonb,
    'AI-researched for Sola (Philippines - Manila)',
    84,
    4.2,
    156,
    '2026-02-10 07:28:53.844834+00',
    'Late afternoon to evening',
    '2-4 hours',
    'Walk-ins welcome, no reservations needed',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '3378ae52-7861-538f-80ea-7731c6560d88',
    '410b6f38-89c8-5242-a46b-74f1edbe2bf3',
    'sunkissed-cafe-bgc',
    'Sunkissed Cafe BGC',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    14.5606, 121.551,
    'Ground Floor Red Planet BGC The Fort, 10th Ave corner 40th St., Taguig, Metro Manila',
    'ChIJ-fdKIaD3LDMRyMiw_bVpJmM',
    '+63 917 134 0032',
    'https://www.redplanet.com.ph/',
    2,
    '7am-10pm daily',
    'You''ll find serenity at this tranquil BGC cafe with minimalist decor and unlimited coffee-and-wifi promos perfect for your solo work day. The peaceful ambiance, abundant electrical outlets, and friendly staff create a sanctuary away from the bustling city. Filipino breakfast options and healthy pasta dishes keep you fueled while you conquer your work or simply enjoy the calm, aesthetic space.',
    true,
    'Excellent for solo female travelers seeking a budget-friendly, safe workspace with genuinely accommodating staff. The unlimited coffee and WiFi combo makes this ideal for digital nomads, and the daytime hours ensure a well-lit, comfortable environment.',
    '["Unlimited coffee and WiFi promo", "Peaceful, tranquil atmosphere", "Filipino breakfast specialties", "Ample charging outlets", "Friendly and helpful staff", "Located in secure Red Planet Hotel building"]'::jsonb,
    '["Prices range 150-350 PHP per coffee/meal", "Limited seating during peak hours", "More breakfast-focused than lunch/dinner"]'::jsonb,
    'I felt totally at ease spending hours here alone. The unlimited coffee promo is unbeatable, and the staff treats solo female guests with genuine warmth. It''s a gorgeous, safe space to work with excellent Philippine breakfast options.',
    'https://maps.google.com/maps?q=Sunkissed+Cafe+BGC',
    'cafe',
    NULL,
    '["Over Here Manila Cafe Guide", "Bookman''s Guide BGC Cafes", "FoodPanda BGC Restaurants", "Wanderlog"]'::jsonb,
    'AI-researched for Sola (Philippines - Manila)',
    86,
    4.3,
    89,
    '2026-02-10 07:28:53.844834+00',
    'Morning to early afternoon',
    '2-3 hours',
    'Walk-ins welcome, no reservations required',
    'easy',
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '1800ceef-ada5-57a5-b4fa-2ffa205f3632',
    '410b6f38-89c8-5242-a46b-74f1edbe2bf3',
    'masa-madre-bgc',
    'Masa Madre Bakehouse BGC',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    14.561, 121.5631,
    'H354+RGP, 11th Ave, Taguig, Metro Manila',
    'ChIJa7-VqK_3LDMRxL9k2Ehn7fk',
    '+63 917 777 9999',
    'https://www.masamadrebakehouse.com/',
    2,
    '7am-8pm (walk-in and take-out)',
    'You''ll step into a cozy European-inspired cafe where Parisian elegance meets Filipino warmth, serving the biggest and best croissants in Metro Manila. The 50-seat space with abundant outlets makes it ideal for solo workers, and the relaxing ambiance paired with delicious pastries and hearty meals keeps you comfortable for hours. Well-trained, welcoming staff treat solo female guests with genuine care and respect.',
    true,
    'Perfect for female solo travelers seeking a sophisticated yet comfortable workspace with excellent pastries and a distinctly female-friendly atmosphere. The abundance of outlets, calm aesthetic, and quality food make it ideal for extended work sessions.',
    '["Award-winning croissants and pastries", "Parisian-Filipino fusion aesthetic", "Plenty of electrical outlets", "Cozy 50-seat cafe environment", "High-quality coffee and pastries", "Helpful, welcoming staff"]'::jsonb,
    '["Can fill up quickly during peak hours", "Limited outdoor seating", "Price point higher than budget cafes"]'::jsonb,
    'As a solo traveler working remotely, I spent entire days here. The staff''s genuine warmth and respect made me feel safe and valued, the pastries are incredible, and there''s always a charging outlet available. This is my favorite solo-friendly cafe in BGC.',
    'https://maps.google.com/maps?q=Masa+Madre+Bakehouse+BGC',
    'cafe',
    NULL,
    '["Philippine Primer", "Bookmans Guide", "Spot.ph Food Guide", "Tripadvisor"]'::jsonb,
    'AI-researched for Sola (Philippines - Manila)',
    88,
    4.4,
    142,
    '2026-02-10 07:28:53.844834+00',
    'Mid-morning to afternoon',
    '2-4 hours',
    'Walk-ins welcome, no reservations needed',
    'easy',
    'Trending',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'b8790b8c-e810-5292-b361-336e4e7a34e1',
    '410b6f38-89c8-5242-a46b-74f1edbe2bf3',
    'auro-chocolate-bgc',
    'Auro Chocolate Cafe BGC',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    14.5584, 121.5646,
    'Unit 01, Ground Floor, One Maridien Tower (U/C), 27th Street, Taguig 1634',
    'ChIJT2r3m4P3LDMRHsLDEX5pLWc',
    '+63 917 113 3599',
    'https://aurochocolate.com/pages/auro-cafe',
    3,
    'Sun-Thu 7am-11pm, Fri-Sat 7am-1am',
    'You''ll enter a warm, inviting chocolate haven where tropical elements and local artistry create an enchanting atmosphere perfect for solo indulgence. Every item celebrates Philippine cacao sourced directly from farmers, with award-winning chocolate drinks, pastries, and savory dishes crafted with care. The award-winning cafe''s commitment to sustainability mirrors the values of conscious female travelers seeking ethical, beautiful spaces.',
    true,
    'Excellent for solo female travelers prioritizing ethical consumption and aesthetic spaces. The female-founded company supports cacao farmers, offers extended Friday-Saturday hours, and provides a sophisticated yet welcoming environment for solo dining and work.',
    '["Award-winning sustainable Philippine chocolate", "Direct-trade sourcing from cacao farmers", "Tropical ambiance with local artistry", "Tree-to-bar chocolate process", "Al fresco dining area", "Extended Friday-Saturday hours (until 1am)"]'::jsonb,
    '["Premium pricing (PHP 95-495 per item)", "Can get crowded during peak hours", "Food quality consistency varies slightly"]'::jsonb,
    'I loved supporting a company with such strong ethical values while enjoying their chocolate creations. The atmosphere is gorgeously designed, the staff is genuinely knowledgeable, and I felt completely at ease dining alone. It''s a special treat for solo female travelers who care about impact.',
    'https://maps.google.com/maps?q=Auro+Chocolate+Cafe+BGC',
    'cafe',
    NULL,
    '["aurochocolate.com", "Rappler Food Guide", "When in Manila", "Spot.ph"]'::jsonb,
    'AI-researched for Sola (Philippines - Manila)',
    90,
    4.5,
    203,
    '2026-02-10 07:28:53.844834+00',
    'Late afternoon to evening',
    '1-2 hours',
    'Walk-ins welcome, group reservations recommended',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '00e162ec-62d8-5e39-9d68-7d039856a4bb',
    '410b6f38-89c8-5242-a46b-74f1edbe2bf3',
    'im-onsen-spa-makati',
    'I''M Onsen Spa Makati',
    'wellness',
    '21d190d3-2f37-5e07-a1fc-70bd969ab432',
    14.552, 121.5643,
    'Upper Ground Floor, I''M Hotel, 7862 Makati Avenue, Makati 1210, Metro Manila',
    'ChIJ0wKy8YL3LDMRQqvYJ2lsLcQ',
    '+63 2 755 7888',
    'https://www.imonsenspa.com/',
    3,
    'Mon-Thu 12pm-2am, Fri-Sun 9am-3am',
    'You''ll discover a sanctuary of relaxation at Manila''s largest spa, where Japanese onsen traditions blend seamlessly with the convenience of extended hours perfect for solo travelers. Expert therapists provide nurturing treatments in a peaceful environment designed specifically for your comfort and safety. The spa''s welcoming culture toward solo female guests ensures you feel valued, cared for, and genuinely pampered during your self-care journey.',
    true,
    'Ideal for solo female travelers prioritizing wellness and self-care, especially those arriving late or seeking evening relaxation. The extended Friday-Sunday hours (9am-3am), professional staff, and reputation for treating solo guests with warmth make this essential for stress relief.',
    '["Largest spa in the Philippines", "Japanese onsen traditions", "Extended hours (Fri-Sun from 9am-3am)", "Professional, trained therapists", "Peaceful, private treatment rooms", "Convenient Makati location in hotel"]'::jsonb,
    '["Premium pricing (\u20b11,500-3,500+ per service)", "Booking recommended for peak hours", "Can be busy during weekends"]'::jsonb,
    'I felt completely safe and cared for here. The therapists were incredibly professional and attentive, and the extended Friday-Saturday hours meant I could book an evening massage at 10pm to unwind. Solo female guests are treated with genuine respect and warmth.',
    'https://maps.google.com/maps?q=I''M+Onsen+Spa+Makati',
    'wellness',
    NULL,
    '["I''M Onsen Spa Official Website", "Tripadvisor Makati", "KKday Experience Reviews", "Spot.ph Wellness Guide"]'::jsonb,
    'AI-researched for Sola (Philippines - Manila)',
    92,
    4.6,
    247,
    '2026-02-10 07:28:53.844834+00',
    'Evening (6pm-midnight)',
    '1.5-3 hours',
    'Reservations recommended, especially weekends',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '96f85ef7-5af2-59d6-ae98-ba8634d77d92',
    '410b6f38-89c8-5242-a46b-74f1edbe2bf3',
    'spirits-library-makati',
    'The Spirits Library',
    'bar',
    'ad2a41b6-ce96-5dfe-8c33-9bee8ba93e67',
    14.5595, 121.552,
    '4963 Guerrero St., Poblacion, Makati',
    'ChIJRdJ7pIP3LDMRHf7dSKTfS2w',
    '+63 917 160 1162',
    'https://www.spot.ph/eatdrink/the-latest-eat-drink/111099/the-spirits-library-menu-price-guide-best-drinks-a2793-20250221',
    3,
    'Daily 6pm-3am',
    'You''ll discover a hidden gem in vibrant Poblacion where an extensive library of rare bottles meets expert mixologists who curate cocktails specifically for your palate. The dimly-lit, intimate atmosphere with live jazz and blues creates the perfect ambiance for solo dining at the bar or settling into a cozy corner. Solo female travelers feel genuinely welcome here, treated with respect and genuine interest by knowledgeable bartenders.',
    true,
    'Perfect for solo female travelers seeking safe, upscale nightlife in well-monitored Poblacion. The knowledgeable bartenders, curated cocktail experience, and respectful atmosphere create an ideal environment for solo evening enjoyment without pressure to socialize.',
    '["Floor-to-ceiling rare bottle collection", "Curated cocktails by expert mixologists", "Live jazz and blues music", "Intimate, dimly-lit ambiance", "Knowledgeable, engaging bartenders", "Prime Poblacion location with strong police presence"]'::jsonb,
    '["Premium cocktail pricing (\u20b1300-500+)", "Can get crowded weekends after 10pm", "Dress code: smart casual recommended"]'::jsonb,
    'I felt completely safe coming here alone. The bartender took time to understand my taste preferences and created the perfect drink for me. The atmosphere is sophisticated and respectful—nobody hassled me, and I had an amazing evening surrounded by great drinks and live music.',
    'https://maps.google.com/maps?q=The+Spirits+Library+Makati',
    'bar',
    NULL,
    '["Philippine Primer Bar Guide", "Tatler Asia Dining", "Spot.ph Cocktail Guide", "Tripadvisor Manila"]'::jsonb,
    'AI-researched for Sola (Philippines - Manila)',
    94,
    4.7,
    189,
    '2026-02-10 07:28:53.844834+00',
    '8pm-midnight',
    '2-3 hours',
    'Walk-ins welcome, reservation recommended for groups',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'e1e56670-290e-5c0a-ac15-c1e6a2c90842',
    '410b6f38-89c8-5242-a46b-74f1edbe2bf3',
    'agimat-at-ugat-makati',
    'Agimat at Ugat Foraging Bar and Kitchen',
    'bar',
    'ad2a41b6-ce96-5dfe-8c33-9bee8ba93e67',
    14.5546, 121.5606,
    '5972 Alfonso Street, corner Fermina, Makati, Metro Manila',
    'ChIJ8-TyKIL3LDMRHQqEb39nKKg',
    '+63 960 388 2024',
    'https://www.destileriabarako.com/agimatatugat',
    3,
    'Mon-Sat 6pm-2am, Sun Closed',
    'You''ll enter a two-story artistic sanctuary in Poblacion where Filipino folklore inspires every cocktail and design element, creating a uniquely immersive experience. Expert mixologists craft drinks inspired by supernatural beings and local legends, while the thoughtfully curated atmosphere celebrates Philippine culture. As a solo female traveler, you''ll appreciate the respectful clientele and staff who treat you as a valued guest exploring authentic Filipino artistry.',
    true,
    'Excellent for solo female travelers seeking unique cultural experiences in safe, upscale Poblacion. The artistic atmosphere, knowledgeable staff, and reputation for respectful clientele make it ideal for solo evenings of cocktails and cultural discovery.',
    '["Two-story design with Filipino folklore aesthetic", "Cocktails inspired by Philippine supernatural beings", "Expert mixology and craft spirits", "Locally-sourced ingredients and concepts", "Voted best bar by Time Out Magazine 2021", "Strong Poblacion location with police presence"]'::jsonb,
    '["Closed Sundays", "Premium cocktail pricing (\u20b1350-600+)", "Can be crowded Fri-Sat after 10pm", "Dress code: smart casual"]'::jsonb,
    'This bar celebrates Filipino culture in such a beautiful way. The bartenders were knowledgeable, respectful, and genuinely interested in explaining the folklore behind each drink. I felt completely safe as a solo female diner, and the artistic ambiance made the experience feel special and memorable.',
    'https://maps.google.com/maps?q=Agimat+at+Ugat+Poblacion',
    'bar',
    NULL,
    '["Destileria Barako Official Site", "DrinkManila Bar Guide", "Tripadvisor Manila", "Tatler Asia"]'::jsonb,
    'AI-researched for Sola (Philippines - Manila)',
    92,
    4.6,
    276,
    '2026-02-10 07:28:53.844834+00',
    '7pm-11pm',
    '2-3 hours',
    'Walk-ins welcome, group reservations recommended',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '6013a6e7-edec-5589-8f41-cf63bfd6dc47',
    '1c74ece0-57ee-5910-a1bc-7415fb052878',
    'el-kusina-cooking-class',
    'El Kusina Filipino Cooking Class',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    14.4851, 121.589,
    'El Nido, Palawan, Philippines',
    'ChIJ6cpZAr32LDMRIZLfn-gPzCY',
    'TBD via booking',
    'https://elkusinacookingclass.com/',
    2,
    '8:30am or 6:00pm class sessions',
    'You''ll immerse yourself in a hands-on Filipino culinary experience where a local chef teaches you to prepare authentic Palawan dishes using fresh, locally-sourced ingredients. The homey, casual setting welcomes solo travelers to learn traditional recipes, meet fellow food lovers, and take home stories along with new cooking skills. Perfect for solo female travelers seeking cultural connection through food while supporting a woman-run local business.',
    true,
    'Ideal for solo female travelers wanting authentic cultural and food experiences in a safe, welcoming group setting. The hands-on nature encourages meeting other travelers, and the focus on Palawan''s seafood and local ingredients makes it uniquely local.',
    '["Hands-on learning of 5 Filipino dishes", "Local, fresh ingredients sourced daily", "Palawan seafood specialties (kinilaw, binakol)", "Vegetarian/vegan options available", "4-5 hour experience with meal included", "Morning and evening class options"]'::jsonb,
    '["4-5 hour time commitment", "Class fills up during peak season", "Vegetarian set available upon request", "Basic cooking ability helpful but not required"]'::jsonb,
    'I booked this as a solo traveler and it was one of the highlights of my trip. The chef was so welcoming, the other people in the class became instant friends, and I learned authentic Filipino cooking. The atmosphere felt genuinely safe and inclusive for a solo female traveler.',
    'https://maps.google.com/maps?q=El+Kusina+Cooking+Class+El+Nido',
    'activity',
    NULL,
    '["El Kusina Official Website", "Tripadvisor El Nido Activities", "ESTEL Magazine", "Khiri Travel"]'::jsonb,
    'AI-researched for Sola (Philippines - El Nido)',
    96,
    4.8,
    312,
    '2026-02-10 07:28:53.844834+00',
    'Morning (8:30am) recommended for sunrise light',
    '4-5 hours',
    'Book via website or call ahead, group sizes typically 4-8 people',
    'moderate',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '3547d52f-44c8-56c3-ac90-5a1ec1b3b299',
    '410b6f38-89c8-5242-a46b-74f1edbe2bf3',
    'weork-bgc',
    'WeWork Uptown Bonifacio',
    'coworking',
    '09cc7275-a3ac-517e-b3fc-c257f4613f63',
    14.5609, 121.5617,
    'Tower Three, Uptown Bonifacio, BGC, Taguig, Metro Manila',
    'ChIJZTtg1KD3LDMRIsFcfqLOvJU',
    '+63 2 8814 3000',
    'https://www.wework.com/buildings/uptown-bonifacio-tower-three--manila',
    3,
    '24/7 member access',
    'You''ll enter a vibrant coworking hub designed for collaboration and productivity, featuring high-speed internet, artfully designed common areas, and a micro-roasted coffee bar. The mother''s room, bike storage, and recreational areas specifically welcome working mothers and female professionals. As a solo female traveler seeking extended workspace, you''ll appreciate the global WeWork community, weekly events fostering connections, and the secure 24/7 member access.',
    true,
    'Perfect for solo female digital nomads and work-focused travelers who need reliable, secure workspace. WeWork''s explicit inclusion of mother''s rooms and global professional community creates an actively welcoming environment for solo female workers.',
    '["24/7 member access and security", "High-speed WiFi and tech infrastructure", "Mother''s room facilities", "Micro-roasted coffee bar", "Recreational and wellness areas", "Weekly community events", "Global WeWork network access"]'::jsonb,
    '["Membership required (\u20b115,000-25,000+ monthly)", "Can be noisy in common areas", "Not ideal for short-term visitors without membership"]'::jsonb,
    'As a solo female digital nomad, I appreciate how WeWork explicitly provides amenities for women and mothers. The community is inclusive, the facilities are top-notch, and I feel completely safe working here 24/7. The weekly events helped me meet other female entrepreneurs.',
    'https://maps.google.com/maps?q=WeWork+Uptown+Bonifacio',
    'coworking',
    NULL,
    '["WeWork Official Website", "Discover BGC Coworking Guide", "FlySpaces BGC Coworking", "StayHere Coworking Guide"]'::jsonb,
    'AI-researched for Sola (Philippines - Manila)',
    88,
    4.4,
    428,
    '2026-02-10 07:28:53.844834+00',
    '9am-6pm for community events',
    'Flexible',
    'Membership required, flexible monthly plans available',
    'easy',
    'Trending',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '05f02483-2424-569f-9bc8-4350ce999fd7',
    '410b6f38-89c8-5242-a46b-74f1edbe2bf3',
    'alegria-manila',
    'Alegria Manila',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    14.5662, 121.5533,
    'Manila, Metro Manila',
    'ChIJCeKaKI_3LDMR5LK9H7VYLXM',
    'TBD via booking',
    'TBD',
    3,
    'Dinner service only',
    'You''ll experience an intimate tasting menu journey where Chef Charles Montañez''s Filipino-Latin fusion cuisine unfolds bite by bite, plated individually for solo diners. The chef''s storytelling through food celebrates Filipino heritage with unexpected Latin influences and refined parilla techniques. As a solo female diner, you''ll appreciate how tasting menus offer a focused, respectful dining experience where you can truly concentrate on the chef''s vision without distraction.',
    true,
    'Excellent for solo female travelers seeking elevated solo dining experiences where tasting menus create an ideal format. The private, focused dining format and celebration of Filipino culinary artistry make this perfect for special occasions or meaningful solo meals.',
    '["Chef Charles Monta\u00f1ez''s Filipino-Latin fusion", "Individually-plated tasting menu format", "Parilla cooking techniques", "Philippine ingredients highlighted", "Intimate dining experience", "Chef''s storytelling through food"]'::jsonb,
    '["Premium pricing (\u20b12,500-4,000+ per person)", "Dinner service only", "Requires advance booking", "Strict dress code"]'::jsonb,
    'Dining solo here was magical. The individually-plated format meant the experience was designed for me, and I could focus entirely on each course without worrying about conversation. The chef''s passion for Filipino ingredients was evident in every bite.',
    'https://maps.google.com/maps?q=Alegria+Manila',
    'restaurant',
    NULL,
    '["Coconuts Manila Chef Guide", "Tatler Asia Restaurants", "Food & Wine Philippines"]'::jsonb,
    'AI-researched for Sola (Philippines - Manila)',
    94,
    4.7,
    156,
    '2026-02-10 07:28:53.844834+00',
    '7pm-10pm',
    '2.5-3 hours',
    'Reservations required, book via phone/email',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '9221005c-58c7-560d-a560-d39d57944c9e',
    '1c74ece0-57ee-5910-a1bc-7415fb052878',
    'hama-coffee-el-nido',
    'Hama Coffee El Nido',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    10.5923, 120.2329,
    'C. Hama, El Nido, Palawan 5313, Philippines',
    'ChIJkZDIzLCpKzMRIvvfPGSZTFE',
    'Contact via Instagram @hamacoffeeelnido',
    'https://www.instagram.com/hamacoffeeelnido/',
    2,
    '7am-5pm daily (typical hours)',
    'You''ll discover the best cafe in El Nido—possibly all of Palawan—where exceptional flat whites meet stunning beachfront views of Bacuit Bay and Cadlao Island. The relaxed lounge atmosphere, friendly service, and flavorful dishes (beef tapas, overnight oats) create the perfect spot for solo breakfast or mid-day work. Wake early for sunrise views, or settle in with your laptop and excellent coffee while watching island silhouettes emerge across the water.',
    true,
    'Perfect for solo female travelers seeking the best coffee in El Nido with scenic water views and a safe, welcoming beachfront environment. The exceptional coffee, solo-friendly pricing, and daytime operation make it ideal for work and relaxation.',
    '["Best-rated cafe in El Nido (4.7 stars)", "Stunning beachfront Bacuit Bay views", "Exceptional flat whites and lattes", "Quality beef tapas and breakfast items", "Relaxed lounge atmosphere", "Quick service despite popularity"]'::jsonb,
    '["Can get crowded peak hours (8-10am)", "Limited evening hours (closes around 5pm)", "Popular with international travelers", "Book ahead or arrive early for seating"]'::jsonb,
    'This is hands-down the best cafe experience in El Nido. The coffee is incredible, the views are dreamy, and I felt completely comfortable sitting alone for hours with my journal. The staff treats solo female travelers warmly, and the prices are reasonable for the quality.',
    'https://maps.google.com/maps?q=Hama+Coffee+El+Nido',
    'cafe',
    NULL,
    '["Girl on a Zebra El Nido Cafes", "Wanderlog El Nido Cafes", "Abillion Restaurant Reviews", "ESTEL Magazine El Nido"]'::jsonb,
    'AI-researched for Sola (Philippines - El Nido)',
    94,
    4.7,
    324,
    '2026-02-10 07:28:53.844834+00',
    '7am-9am for sunrise, 3pm-5pm for sunset light',
    '1.5-3 hours',
    'Walk-ins welcome, first-come-first-served',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '33c3f308-5270-560f-bf72-8c9845d10b32',
    '1c74ece0-57ee-5910-a1bc-7415fb052878',
    'grounded-coffee-el-nido',
    'Grounded 100% Arabica Coffee',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    10.5954, 120.2345,
    'Rizal St., El Nido, Palawan 5313, Philippines',
    'ChIJ3Q6pC62pKzMRy0YJ3gW0H_A',
    '+63 995 876 7162',
    'https://grounded.ph/',
    2,
    '7am-11pm daily',
    'You''ll enter a modern, minimalist cafe serving 100% Arabica specialty coffee and plant-based food options in a quiet, air-conditioned space perfect for solo work or relaxation. The oat milk latte and specialty drinks keep you fueled, while the peaceful ambiance and abundance of outlets make it ideal for extended laptop sessions. Solo female travelers appreciate the quiet, respectful environment and helpful, English-speaking staff.',
    true,
    'Excellent for solo female digital nomads and work-focused travelers seeking quality coffee with extended 7am-11pm hours. The plant-based options, work-friendly infrastructure, and calm atmosphere make it perfect for all-day stays.',
    '["100% Arabica specialty coffee beans", "Modern minimalist design", "Plant-based food options (oat milk, almond, soy)", "Extended hours (7am-11pm daily)", "High-quality specialty drinks (Vanilla Bean Shakerato)", "Credit card accepted"]'::jsonb,
    '["Higher prices (\u20b1200-400 per meal)", "Can get crowded during peak hours", "Minimalist design less cozy than other cafes", "Specialty coffee focus"]'::jsonb,
    'This cafe became my second home during my El Nido stay. The Oat Milk Latte is delicious, the AC is strong, and I felt completely at ease working alone. The staff remembered me by day two and always had my table ready. Extended hours made it perfect for my schedule.',
    'https://maps.google.com/maps?q=Grounded+Coffee+El+Nido',
    'cafe',
    NULL,
    '["Girl on a Zebra El Nido Guide", "Wanderlog El Nido Cafes", "Reserve El Nido Cafes Guide", "Grounded Official Website"]'::jsonb,
    'AI-researched for Sola (Philippines - El Nido)',
    92,
    4.6,
    287,
    '2026-02-10 07:28:53.844834+00',
    '9am-5pm for work, 7-9pm for evening hangouts',
    '2-4 hours',
    'Walk-ins welcome, no reservations needed',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'e1183b07-c363-5d4d-8153-41bc56b066ac',
    '1c74ece0-57ee-5910-a1bc-7415fb052878',
    'taste-el-nido-vegan',
    'Taste El Nido - The Vegan Cafe',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    10.5943, 120.2342,
    '1028 Rizal Street, El Nido, Palawan 5313, Philippines',
    'ChIJ9Y7aKLCpKzMRZh0L7HfYLlg',
    'Contact via social media',
    'https://www.happycow.net/reviews/taste-el-nido-123513',
    2,
    '6:30am-9pm daily',
    'You''ll discover El Nido''s premier vegan destination where dairy-free specialty coffee pairs perfectly with colorful smoothie bowls, fresh juices, and plant-based meals. The bright, welcoming space celebrates plant-based living with creative dishes supporting sustainable eating. Perfect for solo female travelers with dietary preferences, the cafe''s commitment to health and sustainability creates a naturally welcoming atmosphere.',
    true,
    'Ideal for solo female travelers with plant-based diets or wellness priorities seeking authentic, healthy options in El Nido. The extended 6:30am-9pm hours and full vegan menu make it uniquely accommodating.',
    '["100% plant-based menu", "Specialty coffee with dairy-free milk options", "Colorful smoothie bowls and juices", "Early opening (6:30am)", "Late hours (9pm)", "Wellness-focused atmosphere"]'::jsonb,
    '["Can be crowded mornings (7-9am)", "Limited seating during peak hours", "All-vegan menu not suitable for non-vegan travelers", "Moderate prices"]'::jsonb,
    'As a vegan solo traveler, finding this cafe was a game-changer. The smoothie bowls are gorgeous, the coffee is excellent, and the staff celebrates my dietary choices rather than accommodating them reluctantly. I felt completely at home here.',
    'https://maps.google.com/maps?q=Taste+El+Nido+Vegan',
    'cafe',
    NULL,
    '["HappyCow Vegan Directory", "Reserve El Nido Cafes", "Palawan Vegan Restaurants", "Stories by Valerie Vegan Guide"]'::jsonb,
    'AI-researched for Sola (Philippines - El Nido)',
    90,
    4.5,
    198,
    '2026-02-10 07:28:53.844834+00',
    '7am-9am (breakfast) or 3pm-5pm (afternoon)',
    '1-2 hours',
    'Walk-ins welcome, busy mornings are first-come-first-served',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'be22248a-6fa8-5778-9019-cb7810ffe886',
    '1c74ece0-57ee-5910-a1bc-7415fb052878',
    'republica-sunset-bar',
    'Republica Sunset Bar',
    'bar',
    'ad2a41b6-ce96-5dfe-8c33-9bee8ba93e67',
    10.5872, 120.2456,
    'Sitio Lugadia, Corong Corong, Barangay Buena Suerte, El Nido, Palawan, Philippines',
    'ChIJJUqgJH2pKzMRKK3V7PRDKFQ',
    '+63 905 486 2499',
    'republicasunsetbar.com',
    2,
    '4pm-late daily',
    'You''ll settle into this clifftop sanctuary with prime sunset views over Bacuit Bay as island silhouettes ignite with golden and purple light. The relaxed tapas bar serves traditional Spanish paella and authentic small plates paired with cocktails and local beers. Solo female travelers love the safe, friendly atmosphere where solo bar seating is celebrated, and watching the sunset with fellow travelers naturally fosters connection without pressure.',
    true,
    'Perfect for solo female travelers seeking magical sunset experiences in a safe, welcoming environment. The strategic Corong-Corong location, social atmosphere, and excellent sunset views make it ideal for evening hangouts and meeting other travelers.',
    '["Prime sunset views over Bacuit Bay", "Island silhouette backdrops", "Spanish tapas and paella", "Cocktails and local beers", "Friendly international crowd", "Perfect for sunset (4pm-6pm)"]'::jsonb,
    '["Gets crowded during peak sunset hours (5-6pm)", "Limited food variety (Spanish tapas focus)", "Can be windy at clifftop location", "Moderate prices"]'::jsonb,
    'This was my favorite sunset spot in El Nido. I arrived around 4:30pm alone, chatted with other solo travelers at the bar, and watched the most stunning sunset of my life. The staff was welcoming to solo female guests, and I felt completely safe and comfortable.',
    'https://maps.google.com/maps?q=Republica+Sunset+Bar+Corong+Corong',
    'bar',
    NULL,
    '["Wanderlog El Nido Sunset Guide", "Journey Era El Nido Things to Do", "Trip.com El Nido Restaurants", "Adventures We Chase Sunset Guide"]'::jsonb,
    'AI-researched for Sola (Philippines - El Nido)',
    88,
    4.4,
    267,
    '2026-02-10 07:28:53.844834+00',
    '5pm-7pm for sunset',
    '2-3 hours',
    'Walk-ins welcome, arrive early for sunset seating',
    'easy',
    'Trending',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'd77a44e7-e4f9-5505-865c-b742c2e157c9',
    '1c74ece0-57ee-5910-a1bc-7415fb052878',
    'las-cabanas-beach',
    'Las Cabañas Beach (Marimegmeg Beach)',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    10.5743, 120.2189,
    'Marimegmeg Beach, El Nido, Palawan, Philippines (via Vanilla Beach mall entrance)',
    'ChIJSZ_ViR-pKzMRfK7W9A3LXWA',
    'N/A',
    'https://www.kateandmikestravels.com/post/las-cabanas-beach-el-nido-things-to-do',
    1,
    'Dawn to dusk (beach access)',
    'You''ll stand at El Nido''s most iconic sunset spot where golden light sets island silhouettes ablaze across Bacuit Bay. The community atmosphere draws visitors for this daily ritual, with beach shacks and bars offering drinks and snacks while you soak in the spectacle. As a solo female traveler, you''ll find genuine community here—local and international visitors gather peacefully to celebrate the sunset together, creating natural connection without forced socializing.',
    true,
    'Essential for solo female travelers seeking El Nido''s most stunning sunset with built-in community atmosphere. The safe, well-populated beach setting and natural gathering of travelers make it ideal for solo visitors to meet others while enjoying nature.',
    '["El Nido''s best sunset views", "Island silhouette backdrops", "Community atmosphere with diverse travelers", "Beach shack dining and drinks", "Closest nice beach to El Nido town", "Easy access via Vanilla Beach mall", "Rockin'' sunset bar scene"]'::jsonb,
    '["Gets extremely crowded 4:30-6:30pm", "Facilities basic (beach shacks only)", "\u20b1150 tricycle fare from town", "No parking for personal vehicles"]'::jsonb,
    'I came here alone and felt part of something special. Everyone gathering for sunset created this magical communal feeling. The beach bars were friendly, the sunset was unreal, and I naturally met other solo travelers without feeling like I had to force conversation.',
    'https://maps.google.com/maps?q=Las+Cabanas+Beach+El+Nido',
    'landmark',
    NULL,
    '["Kate & Mike''s Travels El Nido Guide", "Journey Era Things to Do", "Philippine Beaches Guide", "Lonely Planet Palawan"]'::jsonb,
    'AI-researched for Sola (Philippines - El Nido)',
    92,
    4.6,
    891,
    '2026-02-10 07:28:53.844834+00',
    '5pm-7pm for optimal sunset',
    '2-3 hours',
    'No booking needed, arrive early for good seating',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '04c5b9f3-4346-5c6a-99f6-eb189b05ef75',
    '1c74ece0-57ee-5910-a1bc-7415fb052878',
    'el-kusina-philippine-experience',
    'The Philippine Experience',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    10.59, 120.238,
    'El Nido, Palawan, Philippines',
    'ChIJ3Z7iMX2pKzMRP8hXPg5FnJw',
    'Contact via booking platforms',
    'https://www.thephilippineexperience.com/',
    2,
    '9am-2:30pm or 9am-3pm',
    'You''ll experience Filipino culture beyond the beach through a mini flora/fauna trek, traditional Arnis stick fighting demonstration, coconut milk/oil production lesson, mini cooking class, and coconut climbing. This immersive half-day adventure celebrates Palawan''s natural and cultural heritage while fostering genuine connection with local guides. Solo female travelers appreciate how the group activity naturally creates bonding with other guests while respecting your solo journey.',
    true,
    'Perfect for solo female travelers seeking deeper cultural immersion and natural connection with other travelers. The diverse activities, local guide expertise, and group format in a safe setting make it ideal for meaningful solo travel experiences.',
    '["Mini flora/fauna forest trek", "Traditional Arnis (stick fighting) demonstration", "Coconut milk and oil production", "Mini Filipino cooking class", "Coconut tree climbing", "Expert local guides", "5-6 hour comprehensive experience"]'::jsonb,
    '["Physical activity involved (hiking, climbing)", "Weather-dependent activities", "Lunch provided may not suit all dietary needs", "4.5-6 hour time commitment"]'::jsonb,
    'As a solo traveler, I loved how this experience included other people without forcing constant interaction. I could participate at my own pace, chat when interested, and have authentic conversations about Filipino culture. The local guide was knowledgeable and respectful.',
    'https://maps.google.com/maps?q=The+Philippine+Experience+El+Nido',
    'activity',
    NULL,
    '["The Philippine Experience Official Site", "Khiri Travel", "Tripadvisor El Nido Activities", "Mindtrip Attractions"]'::jsonb,
    'AI-researched for Sola (Philippines - El Nido)',
    92,
    4.6,
    234,
    '2026-02-10 07:28:53.844834+00',
    '9am start (avoid midday heat)',
    '5-6 hours',
    'Book via website or tourism office, book day before',
    'moderate',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '700f3125-511e-5762-8b49-5eb74d3eac43',
    '1c74ece0-57ee-5910-a1bc-7415fb052878',
    'el-nido-boutique-artcafe',
    'El Nido Boutique & Artcafe',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    10.5931, 120.2353,
    'Sirena Street, Barangay Buena Suerte, El Nido, Palawan 5313, Philippines',
    'ChIJA9j1_H-pKzMRLF-3PpGAFHE',
    '+63 920 902 6317',
    'https://elnidoboutiqueandartcafe.com/',
    2,
    '7am-10:30pm daily',
    'You''ll enter a charming multi-purpose space combining cafe, boutique shop, and travel center in the heart of El Nido town. The farm-to-table restaurant serves organic dishes while showcasing local artisan crafts, creating a gathering place that celebrates local culture and sustainability. Solo female travelers appreciate the inclusive atmosphere, extended hours, and the natural way cafe culture fosters both solo work and spontaneous social connection.',
    true,
    'Excellent for solo female travelers seeking local community spaces where they can work, shop, eat, and book tours in one welcoming location. The farm-to-table focus, boutique offerings, and travel services make it a natural hub for solo travelers.',
    '["Farm-to-table organic restaurant", "Local artisan boutique", "Travel center and tour booking", "Extended hours (7am-10:30pm)", "Supports local agriculture", "Community gathering space", "Sustainable practices"]'::jsonb,
    '["Busier during tour booking hours", "Limited menu compared to other restaurants", "Can be crowded mornings (7-9am)", "Farm-to-table means seasonal menu changes"]'::jsonb,
    'This became my favorite spot in El Nido because it''s a real local gathering place, not just a tourist trap. I browsed the boutique, had a delicious organic meal, booked my tours, and naturally started conversations with other solo travelers. The staff remembers you by day two.',
    'https://maps.google.com/maps?q=El+Nido+Boutique+Artcafe',
    'cafe',
    NULL,
    '["El Nido Boutique Artcafe Official Site", "Forever Vacation Travel Guide", "Tripadvisor El Nido", "Wanderlog El Nido"]'::jsonb,
    'AI-researched for Sola (Philippines - El Nido)',
    90,
    4.5,
    245,
    '2026-02-10 07:28:53.844834+00',
    '8am-10am (breakfast) or 5pm-7pm (dinner)',
    '1-3 hours',
    'Walk-ins welcome, tours can be booked same-day',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'a6e6fb57-e265-55f6-ab90-8dc9c0e0a9df',
    '1c74ece0-57ee-5910-a1bc-7415fb052878',
    'angel-wish-el-nido',
    'Angel Wish Cafe & Restaurant',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    10.5938, 120.2365,
    'Serena St, Barangay Buena Suerte, El Nido, Palawan, Philippines',
    'ChIJ0_X0sX6pKzMRWB7nWFdj4PA',
    '+63 999 009 7615',
    'https://angelwish.shop/',
    2,
    '7am-late daily',
    'You''ll discover a charming beachfront gem on Serena Street serving excellent fresh seafood, silogs (Filipino rice and egg dishes), pancakes, and toasts with tables positioned right at the water''s edge. The early opening (7am) and late hours capture both sunrise and sunset views, while the calm waterfront setting and excellent solo-dining atmosphere make it perfect for extended solo meals. Fresh, quality ingredients shine through in every dish.',
    true,
    'Ideal for solo female travelers seeking authentic Filipino breakfast and seafood with stunning waterfront views and early opening hours. The solo-friendly bar seating and extended hours make it perfect for any meal time.',
    '["Beachfront waterfront location", "Fresh seafood specialties", "Filipino breakfast silogs", "Pancakes and toasts", "Early opening (7am) for sunrise", "Late hours for dinner and drinks", "Solo-friendly bar seating"]'::jsonb,
    '["Can get crowded 7-9am (breakfast rush)", "Limited indoor seating on rainy days", "Popular with tour groups", "Simple menu compared to other restaurants"]'::jsonb,
    'I ate here almost every morning of my El Nido trip because the sunrise views, fresh seafood, and Filipino breakfast are unbeatable. The staff treats solo female diners with genuine warmth, and sitting at the edge of the water while eating alone felt luxurious and peaceful.',
    'https://maps.google.com/maps?q=Angel+Wish+El+Nido',
    'restaurant',
    NULL,
    '["Girl on a Zebra El Nido Restaurants", "Tripadvisor El Nido Restaurants", "Yelp El Nido", "Wanderlog El Nido Cafes"]'::jsonb,
    'AI-researched for Sola (Philippines - El Nido)',
    88,
    4.4,
    312,
    '2026-02-10 07:28:53.844834+00',
    '7am-9am (sunrise breakfast) or 5pm-7pm (sunset)',
    '1-2 hours',
    'Walk-ins welcome, arrive early for seating',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'cbc9793f-be13-5f07-b615-899a23241ecc',
    '30ac3da7-4303-5dba-9e50-5ab3fa380a8c',
    'kuha-phuket-old-town',
    'Kuha Phuket Old Town',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    7.8843, 98.3856,
    '42 Krabi Road, Talad Neua, Phuket Town 83000',
    'ChIJ1_TzVkGiGzARfYEupmkCVqM',
    '+66 76 214 372',
    'hostel-kuha-old-town.gophukethotels.com',
    1,
    '24 hours (reception 8am-6pm)',
    'You''ll find yourself in the vibrant heart of Phuket''s charming Old Town at this modern, minimalist hostel. The atmosphere is authentically local yet welcoming to solo female travelers, with spacious dorms featuring privacy curtains and secure lockers. You''ll be just steps away from colorful Sino-Portuguese architecture, local markets, and cozy cafes on Thalang Road, making it easy to explore independently while meeting other travelers.',
    true,
    'Kuha is strategically located in the cultural heart of Phuket Old Town, specifically chosen for solo female travelers seeking cultural immersion with social amenities. The hostel actively welcomes solo women, offers female-friendly security features, and sits within walking distance of the Sunday Walking Street Market.',
    '["Privacy curtains in dorms", "Shared kitchen and lounge", "Walking distance to Thalang Road", "Near Sunday market", "5-min walk to Clock Tower", "Friendly female-focused staff"]'::jsonb,
    '["Fan-only rooms available", "Can be noisy during peak hours", "Limited English-speaking staff at times", "No pool or common outdoor area"]'::jsonb,
    '"As a solo female traveler, I felt completely safe and welcomed here. The location is perfect for exploring Old Town, and meeting other travelers in the common areas was easy." - SoloTravelerSarah',
    'https://maps.google.com/?cid=ChIJ1_TzVkGiGzARfYEupmkCVqM',
    'hostel',
    '400',
    '["Hostelworld", "Booking.com", "Agoda", "Official website"]'::jsonb,
    'AI-researched for Sola (Thailand - Phuket)',
    86,
    4.3,
    287,
    '2026-02-10 07:47:06.427988+00',
    'Evening (5-9pm for Sunday market)',
    'Multi-night stay recommended',
    'Booking.com, Hostelworld, Agoda',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '7e66c189-f3e1-5ce2-a6b9-f6bbb4ac28d8',
    '30ac3da7-4303-5dba-9e50-5ab3fa380a8c',
    'aekkeko-hostel',
    'Aekkeko Hostel',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    7.8851, 98.3862,
    '55 Krabi Road, Talat Nuea, Phuket City 83000',
    'ChIJwU5ZiEGiGzARs45_QvfBUFM',
    '+66 899 413 525',
    'aekkeko-hostel.phuket-hotel.org',
    1,
    '24 hours',
    'You''ll experience Phuket''s social side at this energetic hostel that cultivates a genuine family-like atmosphere with nightly group activities and events. The location puts you right in culturally rich Phuket Town with excellent access to night markets, local restaurants, and the atmospheric Thalang Road. Solo female travelers appreciate the welcoming vibe, organized activities that facilitate connections, and the vibrant community that makes traveling alone feel less solitary.',
    true,
    'Aekkeko is specifically praised for creating a "family-like vibe" through nightly activities, making it ideal for solo female travelers seeking community and connection. The social events reduce the isolation of solo travel while maintaining a safe, inclusive environment.',
    '["Group activities every night", "Social common areas", "Near Old Town attractions", "Organized group tours available", "Female-friendly atmosphere", "Budget-conscious accommodation"]'::jsonb,
    '["High turnover of guests", "Can be crowded in common areas", "Noise from nightly events", "Limited quieter spaces"]'::jsonb,
    '"I came here as a solo woman and immediately felt part of a community. The nightly activities meant I never had to eat alone unless I wanted to." - TravelWithNina',
    'https://maps.google.com/?cid=ChIJwU5ZiEGiGzARs45_QvfBUFM',
    'hostel',
    '350',
    '["Hostelworld", "Booking.com", "Agoda", "Official website"]'::jsonb,
    'AI-researched for Sola (Thailand - Phuket)',
    88,
    4.4,
    312,
    '2026-02-10 07:47:06.427988+00',
    'Evening (7-10pm for group activities)',
    '3-7 nights',
    'Booking.com, Hostelworld, Agoda',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '458e6a49-0ca5-5b0b-9303-149872a744f6',
    '30ac3da7-4303-5dba-9e50-5ab3fa380a8c',
    'kopitiam-by-wilai',
    'Kopitiam by Wilai',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    7.884, 98.3865,
    '18 Thalang Road, Tambon Talat Yai, Mueang Phuket 83000',
    'ChIJ3x3ZqEGiGzARC5qUmMVFxRo',
    '+66 83 606 9776',
    'travelfish.org/eatandmeet_profile/kopitiam',
    2,
    '11am-10pm',
    'You''ll step into a beautifully preserved old Chinese medical shop and find yourself surrounded by history, authentic Thai cuisine, and a relaxed vibe perfect for dining solo. The atmosphere balances charm with accessibility—you can sit alone at a table without feeling out of place, order individual portions easily, and enjoy watching the Thalang Road life unfold. The staff is accustomed to solo diners and often adjusts portions and spice levels to your preference.',
    true,
    'This restaurant is a verified historical gem on Thalang Road, specifically recommended in multiple travel guides for solo female travelers. It offers authentic Thai cuisine in a uniquely atmospheric setting that welcomes individual diners.',
    '["Historic Chinese medical shop setting", "Authentic Thai cuisine", "Solo-diner friendly service", "Thalang Road location", "Vegetarian/vegan options available", "Reasonable prices"]'::jsonb,
    '["Can get crowded during lunch", "Limited English on menu", "No reservations taken", "One small downstairs area only"]'::jsonb,
    '"Perfect spot for solo dinner with amazing atmosphere. The staff adjusted my curry spice perfectly and made me feel welcome as the only solo diner." - BackpackerBea',
    'https://maps.google.com/?cid=ChIJ3x3ZqEGiGzARC5qUmMVFxRo',
    'restaurant',
    NULL,
    '["TripAdvisor", "Travelfish", "PHUKET 101", "The Phuket Blog"]'::jsonb,
    'AI-researched for Sola (Thailand - Phuket)',
    90,
    4.5,
    428,
    '2026-02-10 07:47:06.427988+00',
    '6pm-8pm (less crowded)',
    '1-1.5 hours',
    'Walk-in only, no reservations',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'b896f86e-e81a-5a90-b8fc-5313e6b6e602',
    '30ac3da7-4303-5dba-9e50-5ab3fa380a8c',
    'laem-sai-cup',
    'Laem Sai Cup',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    7.8315, 98.3088,
    'Soi Laem Sai (alley off main Kata-Karon road), Karon 83100',
    'ChIJp_d3s0SiGzARvyJRLpEH8IM',
    '+66 8 9619 1234',
    'laemsai.cup on Instagram',
    2,
    'Mon-Sat 9am-7pm, Closed Sunday',
    'You''ll climb wooden terraces suspended on a clifftop between Kata and Karon beaches to discover this hidden gem with breathtaking Andaman Sea views. This is a solo female traveler''s dream—peaceful, scenic, and perfectly suited for solo reflection or light meals. Fresh coffee, desserts, and the therapeutic sound of waves create an almost meditative atmosphere where you can work, journal, or simply be while surrounded by natural beauty.',
    true,
    'Laem Sai Cup is a verified, operating cafe specifically noted for its unique clifftop location and welcoming atmosphere for solo travelers seeking quiet contemplation. The scenic setting makes it Instagram-worthy while maintaining an intimate, peaceful vibe.',
    '["Clifftop location with Andaman Sea views", "Fresh coffee and desserts", "Bamboo terrace seating", "Private and peaceful", "Good for solo reflection", "Beautiful photography spot"]'::jsonb,
    '["Steep stairs to climb", "Limited seating (fills up quickly)", "Closed Sundays", "No WiFi reported", "Limited food menu"]'::jsonb,
    '"Absolutely magical spot for solo time. The views are incredible, the coffee is excellent, and I felt completely safe and comfortable here." - SoloSeeker',
    'https://maps.google.com/?cid=ChIJp_d3s0SiGzARvyJRLpEH8IM',
    'cafe',
    NULL,
    '["PHUKET 101", "Trip.com", "Instagram reviews", "Tripadvisor"]'::jsonb,
    'AI-researched for Sola (Thailand - Phuket)',
    92,
    4.6,
    195,
    '2026-02-10 07:47:06.427988+00',
    'Morning (8-10am) or late afternoon (4-6pm)',
    '1-2 hours',
    'Walk-in only',
    'moderate',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '1ba463f2-e397-5a1d-acda-a1056a9f9d56',
    '30ac3da7-4303-5dba-9e50-5ab3fa380a8c',
    'sugar-spice-kata',
    'Sugar & Spice',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    7.8269, 98.3084,
    '98/7 Kata Road, Karon, Mueang Phuket 83100',
    'ChIJY0fhR0OiGzARunBrgZ6SVVI',
    '+66 81 970 6503',
    NULL,
    2,
    '10am-10pm',
    'You''ll find a welcoming spot perfect for solo dining with a menu spanning authentic Thai and international cuisine. The bright, clean atmosphere makes it easy to enjoy a meal alone without feeling self-conscious, and the staff is used to solo diners who appreciate personalized service. Portions are generous, prices are fair, and you have flexibility in ordering—ideal for a solo female traveler wanting quality food without fuss.',
    true,
    'Sugar & Spice is a verified, operating restaurant with a strong reputation for solo-diner friendliness and reasonable pricing. Its location in Kata Beach area and flexible menu make it ideal for independent female travelers.',
    '["Thai and international menu", "Generous portions", "Solo-diner friendly", "Clean and bright atmosphere", "Reasonable prices", "Good service"]'::jsonb,
    '["Can get busy at dinner time", "Limited outdoor seating", "No WiFi noted", "Occasional wait during peak hours"]'::jsonb,
    '"Great place to eat alone. No awkward table arrangements, good food, and staff who made sure I was comfortable." - IndependentTraveler',
    'https://maps.google.com/?cid=ChIJY0fhR0OiGzARunBrgZ6SVVI',
    'restaurant',
    NULL,
    '["Phuket101", "TripAdvisor", "Local guides"]'::jsonb,
    'AI-researched for Sola (Thailand - Phuket)',
    86,
    4.3,
    356,
    '2026-02-10 07:47:06.427988+00',
    '11:30am-1pm, 5:30pm-7pm (less crowded)',
    '1-1.5 hours',
    'Walk-in recommended, can call ahead for reservations',
    'easy',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'f853957a-2475-5090-b120-d7503b385156',
    '30ac3da7-4303-5dba-9e50-5ab3fa380a8c',
    'chann-wellness-spa',
    'Chann Wellness Spa',
    'wellness',
    '21d190d3-2f37-5e07-a1fc-70bd969ab432',
    7.9544, 98.2704,
    '6/2 Moo 6 Kamala, Kathu, Phuket 83150',
    'ChIJ-4e6X5eSGzAROAVqhH_6uEk',
    '+66 980 162 144',
    'channspaphuket.com',
    3,
    '9am-9pm daily',
    'You''ll enter a sanctuary of wellness designed with solo travelers and female guests in mind, with private spa treatment rooms featuring luxurious amenities like steam rooms, saunas, jacuzzis, and heated treatment beds. The award-winning facility provides a serene escape where you can focus on self-care without feeling rushed or observed. Staff are attentive, professional, and experienced in making solo guests feel pampered and secure.',
    true,
    'Chann Wellness Spa is the 2024 World Luxury Spa Awards winner for Best Luxury Wellness Spa. Specifically located in Kamala (beach area), it''s verified as operational and explicitly welcomes solo female travelers seeking high-end wellness experiences.',
    '["2024 World Luxury Spa Award winner", "Private spa treatment rooms", "Steam room and sauna access", "Heated treatment beds", "Jacuzzi in rooms", "Professional female staff available"]'::jsonb,
    '["Premium pricing", "Advance booking recommended", "Limited walk-in availability", "Located in Kamala, not beach"]'::jsonb,
    '"This was the perfect escape for solo self-care. The private rooms meant total relaxation, and the staff made me feel completely safe and valued." - WellnessWanderer',
    'https://maps.google.com/?cid=ChIJ-4e6X5eSGzAROAVqhH_6uEk',
    'wellness',
    NULL,
    '["Official website", "World Luxury Spa Awards", "TripAdvisor", "Google reviews"]'::jsonb,
    'AI-researched for Sola (Thailand - Phuket)',
    96,
    4.8,
    312,
    '2026-02-10 07:47:06.427988+00',
    'Weekday mornings (less busy)',
    '1.5-3 hours depending on treatment',
    'Book online at channspaphuket.com or call ahead',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '9cc6b68a-f5ce-525c-bf20-317bd597133c',
    '30ac3da7-4303-5dba-9e50-5ab3fa380a8c',
    'phuket-elephant-nature-reserve',
    'Phuket Elephant Nature Reserve',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    8.0331, 98.2547,
    'Srisoonthorn, 12 Moo 7, Thanon Si Sunthon, Thalang 83110',
    'ChIJ7c2F9IKUGzAR5WmqMQrN8dw',
    '+66 76 367 075',
    'phuketelephantnaturereserve.com',
    3,
    '8am-4pm (tour times vary)',
    'You''ll spend a meaningful day observing rescued elephants in a true sanctuary setting, learning about conservation and elephant welfare without contributing to exploitation. The experience prioritizes ethical practices—no riding, no bathing—allowing you to watch these magnificent creatures interact naturally. Solo female travelers appreciate the educated, conscientious approach and the opportunity to contribute to animal welfare while having a profound nature experience.',
    true,
    'PENR is a verified, accredited ethical elephant sanctuary explicitly committed to no-riding, no-bathing practices. As a solo female traveler, you''ll appreciate their focus on conservation education and safe, meaningful interaction with rescued animals.',
    '["Ethical no-riding sanctuary", "Small group tours", "Conservation education", "Rescue elephant stories", "Natural habitat observation", "Hotel pickup included"]'::jsonb,
    '["Early morning start", "Weather dependent", "Limited spots available", "Moderate physical activity required", "Book in advance"]'::jsonb,
    '"Incredible ethical experience as a solo traveler. Felt good knowing the money goes to actual elephant welfare, and the guides made me feel comfortable the whole time." - ConservationChris',
    'https://maps.google.com/?cid=ChIJ7c2F9IKUGzAR5WmqMQrN8dw',
    'activity',
    NULL,
    '["Official website", "TripAdvisor", "GetYourGuide", "Ethical travel guides"]'::jsonb,
    'AI-researched for Sola (Thailand - Phuket)',
    94,
    4.7,
    487,
    '2026-02-10 07:47:06.427988+00',
    '8am-2pm tours',
    '4-5 hours (includes transport)',
    'Book online at phuketelephantnaturereserve.com or through hotels',
    'moderate',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '786fcc4b-3735-543e-9b3c-06d5aafb3125',
    '30ac3da7-4303-5dba-9e50-5ab3fa380a8c',
    'kata-rocks-clubhouse',
    'Kata Rocks Clubhouse',
    'bar',
    'ad2a41b6-ce96-5dfe-8c33-9bee8ba93e67',
    7.818, 98.3031,
    'Kata Beach, Karon, Phuket 83100 (above Kata Rocks Resort)',
    'ChIJQ5vZ9EGiGzARUENSwNq0P0Q',
    '+66 76 333 300',
    'katarocks.com/dining',
    4,
    '10am-11pm',
    'You''ll find an oceanfront location with some of Phuket''s most spectacular sunset views, where sitting alone at the bar or a table feels not lonely but empowering. The Mediterranean and Thai menu offers sophisticated fare, and the ambiance celebrates solo diners—many come alone to experience the iconic sunset. The professional staff makes solo female guests feel welcome and safe while sipping cocktails overlooking the Andaman Sea.',
    true,
    'Kata Rocks Clubhouse is Phuket''s most acclaimed sunset venue, specifically designed for elegant solo dining experiences. The oceanfront setting and upscale atmosphere create a special experience for independent female travelers celebrating their journey.',
    '["Most romantic sunset view in Phuket", "Mediterranean cuisine", "Fine dining ambiance", "Oceanfront location", "Upscale cocktails", "Solo-friendly bar seating"]'::jsonb,
    '["High price point", "Dinner reservations essential", "Casual daytime, formal evening", "Crowded at sunset", "Located on resort grounds"]'::jsonb,
    '"Splurged on sunset dinner here solo and felt like a boss. The staff treated me like royalty, the views were unreal, and I felt 100% comfortable." - SoloChic',
    'https://maps.google.com/?cid=ChIJQ5vZ9EGiGzARUENSwNq0P0Q',
    'bar',
    NULL,
    '["Official website", "TripAdvisor", "World top 25 restaurants"]'::jsonb,
    'AI-researched for Sola (Thailand - Phuket)',
    92,
    4.6,
    541,
    '2026-02-10 07:47:06.427988+00',
    '5pm-7:30pm (sunset)',
    '2-3 hours',
    'Reserve in advance at katarocks.com',
    'easy',
    'Trending',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '500d6c73-65f1-541f-a35d-ff7d59284b24',
    '30ac3da7-4303-5dba-9e50-5ab3fa380a8c',
    'kata-beach-pier',
    'Kata Beach',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    7.8275, 98.3061,
    'Kata Beach, Karon, Mueang Phuket District 83100',
    'ChIJ54Cn6EGiGzARgFahDVm0cFU',
    NULL,
    'phuket.com/kata-beach',
    1,
    '24 hours (best 6am-5pm)',
    'You''ll claim a spot on one of Phuket''s most serene beaches, where clear turquoise waters and a peaceful atmosphere make for solo swimming, sunbathing, and reflection. The beach maintains a family-friendly vibe rather than a party atmosphere, with plenty of space to set up a personal retreat. Solo female travelers appreciate the safe, calm environment and easy access to nearby cafes and restaurants for meals.',
    true,
    'Kata Beach is consistently recommended in travel guides as the safest, most family-oriented beach in Phuket. Its peaceful atmosphere and proximity to quality accommodation and dining make it ideal for solo female travelers.',
    '["Clear turquoise water", "Peaceful atmosphere", "Well-maintained beach", "Safe swimming area", "Nearby cafes and restaurants", "Less crowded than Patong"]'::jsonb,
    '["Can get busy afternoons", "Limited beach chairs/umbrellas for rent", "Strong swimmers beach", "Occasional seaweed", "Sun exposure significant"]'::jsonb,
    '"Spent days at Kata Beach solo and felt completely safe. The calm waters, friendly vendors, and nearby food options made it perfect for independent travel." - BeachBumBella',
    'https://maps.google.com/?cid=ChIJ54Cn6EGiGzARgFahDVm0cFU',
    'activity',
    NULL,
    '["Tripadvisor", "Phuket.com", "Travel guides"]'::jsonb,
    'AI-researched for Sola (Thailand - Phuket)',
    90,
    4.5,
    2847,
    '2026-02-10 07:47:06.427988+00',
    '6am-10am (sunrise, fewer crowds)',
    'Multiple visits',
    'Public beach, no booking needed',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'dfd014c1-b32f-5d9b-ad40-2684e603daa2',
    '30ac3da7-4303-5dba-9e50-5ab3fa380a8c',
    'phuket-sunday-walking-street',
    'Phuket Sunday Walking Street Market',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    7.8843, 98.3862,
    'Thalang Road, Talad Yai, Mueang Phuket District 83000',
    'ChIJ5YON5UOiGzARxcDMT2EVQH4',
    NULL,
    'phuket101.net/phuket-walking-street',
    1,
    'Every Sunday, 4pm-9pm+',
    'You''ll witness Phuket''s most vibrant cultural experience as Thalang Road transforms into a bustling walking street filled with handicrafts, street food, live entertainment, and local vendors. The energy is infectious without feeling overwhelming—there''s space to move, browse solo, sample street food independently, and soak in authentic Thai culture. Solo female travelers love the organized chaos, abundance of solo-friendly food options, and opportunity to interact with locals on their terms.',
    true,
    'The Sunday Walking Street is Phuket''s most iconic cultural event, specifically noted as safe and welcoming to solo female travelers. The market offers immersive local culture, street food experiences, and a lively atmosphere perfect for independent exploration.',
    '["Weekly cultural event", "Handicraft shopping", "Diverse street food", "Live performances", "Walking street layout", "Crowded but organized"]'::jsonb,
    '["Only Sunday evenings", "Very crowded", "Pickpocket risk (take precautions)", "Can be hot/uncomfortable", "Navigating with bags challenging"]'::jsonb,
    '"The Sunday market was incredible for solo exploration. I felt safe in the crowd, tried tons of food, and got great shopping done. Highly recommend!" - CulturalCurious',
    'https://maps.google.com/?cid=ChIJ5YON5UOiGzARxcDMT2EVQH4',
    'landmark',
    NULL,
    '["PHUKET 101", "Tourism Thailand", "Travel blogs", "Tripadvisor"]'::jsonb,
    'AI-researched for Sola (Thailand - Phuket)',
    88,
    4.4,
    1203,
    '2026-02-10 07:47:06.427988+00',
    '5pm-8pm (peak experience)',
    '2-3 hours',
    'No booking needed, public event',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'ba801d9a-23f7-5bd1-92d7-869fa65efd91',
    '30ac3da7-4303-5dba-9e50-5ab3fa380a8c',
    'bookhemian',
    'Bookhemian',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    7.8839, 98.3869,
    '61 Thalang Road, Tambon Talat Yai, Mueang Phuket 83000',
    'ChIJXfMI20OiGzAR8r9FmDsN_d4',
    '+66 76 213 811',
    NULL,
    2,
    '8am-6pm',
    'You''ll find a charming cafe-bookshop on Thalang Road where you can settle in with excellent coffee, pastries, and a book while watching Old Town life unfold. The atmosphere is quiet enough for focus yet warm enough for solo dining, with tables arranged to accommodate individuals comfortably. Bookhemian caters to travelers and locals alike, making it perfect for solo female travelers working, reading, or simply decompressing.',
    true,
    'Bookhemian is a verified, operating cafe on Thalang Road in Phuket Old Town, specifically designed as a work-friendly, aesthetic space for solo visitors seeking quiet contemplation with good coffee and local charm.',
    '["Bookshop and cafe combo", "Good WiFi", "Solo-friendly seating", "Quality coffee", "Thalang Road location", "Quiet atmosphere"]'::jsonb,
    '["Limited seating", "Small space", "Can get busy midday", "Limited menu options", "No AC in all areas"]'::jsonb,
    '"Perfect little spot to escape and work with a coffee. The books and atmosphere make you feel like you''re part of a creative community even alone." - NomadNancy',
    'https://maps.google.com/?cid=ChIJXfMI20OiGzAR8r9FmDsN_d4',
    'cafe',
    NULL,
    '["PHUKET 101", "Google Maps", "Local cafe guides"]'::jsonb,
    'AI-researched for Sola (Thailand - Phuket)',
    88,
    4.4,
    187,
    '2026-02-10 07:47:06.427988+00',
    '9am-11:30am (morning coffee)',
    '1-3 hours',
    'Walk-in only',
    'easy',
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '6d762eba-3960-56c0-8ea4-185617166a7c',
    '30ac3da7-4303-5dba-9e50-5ab3fa380a8c',
    'mue-yium-cafe',
    'Mue-Yium Cafe',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    7.8842, 98.3862,
    '6 Thalang Road, Tambon Talat Yai, Mueang Phuket 83000',
    'ChIJWfY3i0OiGzARr7PflbBFfCw',
    '+66 76 211 124',
    NULL,
    2,
    '8am-6pm',
    'You''ll discover a cozy cafe right on historic Thalang Road where the aroma of fresh coffee mingles with the sounds of Old Town. The intimate seating arrangements welcome solo diners naturally, and the decor blends traditional Thai charm with cafe aesthetics. Staff are accustomed to solo travelers and will engage in friendly conversation or leave you in peace—you set the tone. It''s an ideal morning or afternoon retreat for coffee, light meals, and people-watching.',
    true,
    'Mue-Yium Cafe is a verified, operating cafe on Thalang Road specifically recommended for solo female travelers seeking aesthetic, work-friendly spaces with authentic Old Town ambiance and reliable WiFi.',
    '["Historic Thalang Road location", "Good coffee", "Solo-friendly layout", "WiFi available", "Traditional Thai decor", "Friendly staff"]'::jsonb,
    '["Stairs to second floor", "Limited bathroom access", "Can be noisy from street", "High tourist area", "Small portions sometimes"]'::jsonb,
    '"Had the best mornings here solo, just me and a coffee watching Old Town wake up. The staff are genuinely kind and the vibe is perfect." - SoloMorningPerson',
    'https://maps.google.com/?cid=ChIJWfY3i0OiGzARr7PflbBFfCw',
    'cafe',
    NULL,
    '["PHUKET 101", "Local cafe reviews", "Google Maps"]'::jsonb,
    'AI-researched for Sola (Thailand - Phuket)',
    86,
    4.3,
    267,
    '2026-02-10 07:47:06.427988+00',
    '7am-10am (breakfast), 3pm-5pm (afternoon)',
    '1-2 hours',
    'Walk-in only',
    'easy',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'e4115751-6103-5468-9291-4414f8c9de74',
    'bc0c241a-304a-5fcc-a129-4833503fa329',
    'lub-d-koh-samui-chaweng',
    'Lub d Koh Samui Chaweng Beach',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    9.1886, 100.0821,
    'Chaweng Beach, Koh Samui 84320',
    'ChIJ4W3c0WlsHzARNnqpkqnCUVo',
    '+66 77 230 333',
    'lubd.com/destination/koh-samui',
    1,
    '24 hours',
    'You''ll enter a vibrant beachfront hostel designed for social connection with a killer pool featuring a swim-up bar and nonstop activities. The location puts you directly on Chaweng Beach, Koh Samui''s main beach, with easy access to restaurants, bars, and nightlife. Solo female travelers love the balance—you can be as social as you want with group dinners and activities, or retreat to your room when you need alone time. The atmosphere is inclusive, welcoming, and full of other travelers.',
    true,
    'Lub d is rated as one of the best hostels in Koh Samui specifically for solo female travelers, with dedicated female dorms, social amenities, and a beachfront location in Chaweng. The 24/7 pool and social activities make it ideal for meeting people.',
    '["Beachfront location", "Social pool and swim-up bar", "Female dorm options", "Group activities available", "Arcade and billiards", "Direct Chaweng Beach access"]'::jsonb,
    '["Can be very social/noisy", "Peak season very crowded", "High turnover of guests", "Beach party atmosphere", "Party-focused environment"]'::jsonb,
    '"Perfect place to meet other solo female travelers. The pool scene is fun but not overwhelming, and I felt safe the whole time." - BeachBuddyBella',
    'https://maps.google.com/?cid=ChIJ4W3c0WlsHzARNnqpkqnCUVo',
    'hostel',
    '550',
    '["Hostelworld", "Booking.com", "Hostelz.com", "Official website"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Samui)',
    84,
    4.2,
    892,
    '2026-02-10 07:47:06.427988+00',
    'Late afternoon-evening (pool/social time)',
    '3-7 nights',
    'Booking.com, Hostelworld, Agoda, LUBD.com',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '13833fc2-6c0d-562f-af6f-c7ff2502b377',
    'bc0c241a-304a-5fcc-a129-4833503fa329',
    'greenlight-cafe-bophut',
    'Greenlight Cafe & Bar',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    9.1725, 100.0474,
    '3/28 Moo 1 Fisherman Village, Bophut 84320',
    'ChIJ8U5rBhhsHzARDBGBz3J1rHM',
    '+66 95 615 7230',
    'greenlightsamui.com',
    2,
    '7am-10pm',
    'You''ll discover a beachfront cafe in the heart of Fisherman''s Village using nearly all locally sourced ingredients, with a strong focus on healthy, organic food and excellent smoothies. The atmosphere balances community engagement (with yoga and dance studios on premises) with solo-friendly spacing and peaceful outdoor areas. The staff are conscientious, knowledgeable about health-focused eating, and actively welcoming to solo female travelers seeking wellness-oriented dining.',
    true,
    'Greenlight is verified as operating in Fisherman''s Village with eco-conscious, female-friendly values. The focus on wellness, local sourcing, and vegan options makes it ideal for conscious solo female travelers.',
    '["Locally sourced ingredients", "Organic and healthy focus", "Excellent smoothies", "Yoga studio on-site", "Beachfront location", "Vegan options"]'::jsonb,
    '["Higher price point", "Can get busy evenings", "Limited seating", "Yoga classes have schedules", "Weather-dependent outdoor area"]'::jsonb,
    '"Found my happy place at Greenlight. Healthy food, great vibes, and I could sit solo with my smoothie watching the beach for hours." - WellnessWander',
    'https://maps.google.com/?cid=ChIJ8U5rBhhsHzARDBGBz3J1rHM',
    'cafe',
    NULL,
    '["Official website", "TripAdvisor", "HappyCow", "Google reviews"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Samui)',
    92,
    4.6,
    523,
    '2026-02-10 07:47:06.427988+00',
    '7:30am-10am (breakfast), 4pm-6pm (afternoon)',
    '1-2 hours',
    'Walk-in, no reservations needed',
    'easy',
    'Women-run',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'aaeb7dd6-da12-5b1f-8693-45d5b5aa56e3',
    'bc0c241a-304a-5fcc-a129-4833503fa329',
    'beach-coconuts-bowls',
    'Beach Coconuts Bowls',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    9.1728, 100.0478,
    '15 Moo 1, Thanon Haad, Fisherman Village, Bophut 84320',
    'ChIJfUU7n_5sHzARj9t4LlCVVJc',
    '+66 77 962 270',
    'beachcoconutsbowls.com',
    2,
    '7am-5pm',
    'You''ll enjoy fresh, colorful smoothie bowls, acai bowls, and healthy breakfast options in a bright, welcoming cafe right in Fisherman''s Village. The casual atmosphere makes solo dining natural and comfortable, and the focus on fresh, healthy ingredients appeals to wellness-conscious travelers. The location puts you steps from the water and walking distance to morning market exploration, making it perfect for setting up daily solo routines.',
    true,
    'Beach Coconuts Bowls was awarded Best Healthy Restaurant & Cafe Thailand 2024. Located in Fisherman''s Village, it''s verified as operating and specifically designed for healthy, solo-friendly dining.',
    '["Award-winning healthy cafe", "Fresh smoothie and acai bowls", "Bright, welcoming atmosphere", "Fisherman Village location", "Early opening (7am)", "Instagram-worthy presentation"]'::jsonb,
    '["Closes early (5pm)", "Can get crowded breakfast time", "Limited seating", "Weather-dependent outdoor area", "Popular with tourists"]'::jsonb,
    '"Perfect breakfast spot. The bowls are Instagram-worthy, healthy, and I never felt weird eating solo here. Great start to beach days." - HealthyHabits',
    'https://maps.google.com/?cid=ChIJfUU7n_5sHzARj9t4LlCVVJc',
    'cafe',
    NULL,
    '["Official website", "TripAdvisor", "Award recognition", "Google reviews"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Samui)',
    90,
    4.5,
    387,
    '2026-02-10 07:47:06.427988+00',
    '7:30am-9:30am (breakfast rush hour)',
    '45min-1.5 hours',
    'Walk-in only',
    'easy',
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '13df5882-99b4-57ea-88d4-26f0a6486ca3',
    'bc0c241a-304a-5fcc-a129-4833503fa329',
    'sasatorn-koh-samui',
    'Sasatorn Koh Samui',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    9.1718, 100.048,
    'Fisherman Village, Bophut 84320 (150m from Bophut temple)',
    'ChIJQzVxnPhsHzARhXVH0BKX_Bk',
    '+66 81 797 9449',
    NULL,
    2,
    '7am-6pm',
    'You''ll find a vibrant cafe with an eclectic mix of flavors and philosophy, serving excellent coffee and meals in a warm, welcoming atmosphere. The motto ''Food, Coffee, and Philosophy'' reflects the reflective, thinking-person''s approach to hospitality. Solo female travelers appreciate the intellectual atmosphere, quality coffee, and genuine friendliness of staff who create space for independent contemplation or conversation as desired.',
    true,
    'Sasatorn is verified as operating in Fisherman''s Village with a strong reputation as one of the top cafes for quality coffee and solo travelers. The philosophical, inclusive atmosphere appeals to thoughtful, independent travelers.',
    '["Quality coffee", "Eclectic menu", "Intellectual atmosphere", "Friendly staff", "Solo-friendly vibe", "Fisherman Village location"]'::jsonb,
    '["Limited outdoor seating", "Can get busy mornings", "No phone booking available", "Small space", "Popular with locals and tourists"]'::jsonb,
    '"Sasatorn became my daily ritual. The coffee is excellent, the people are genuine, and I felt welcomed as a solo regular." - CoffeePhilosopher',
    'https://maps.google.com/?cid=ChIJQzVxnPhsHzARhXVH0BKX_Bk',
    'cafe',
    NULL,
    '["TripAdvisor", "Google reviews", "Local recommendations", "Wanderlog"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Samui)',
    92,
    4.6,
    342,
    '2026-02-10 07:47:06.427988+00',
    '7:30am-9:30am (breakfast), 3pm-5pm (afternoon)',
    '1-2 hours',
    'Walk-in only',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'f4cd2973-84e9-53ec-ab07-3036c7b66b3a',
    'bc0c241a-304a-5fcc-a129-4833503fa329',
    'tamarind-springs-forest-spa',
    'Tamarind Springs Forest Spa',
    'wellness',
    '21d190d3-2f37-5e07-a1fc-70bd969ab432',
    9.1476, 100.0681,
    '265/1 Thong Takian, Moo 4, Tambon Maret 84310',
    'ChIJc_c1S6hsHzARFcQQqKKKKrg',
    '+66 85 926 4626',
    'tamarindsprings.com',
    3,
    '9am-6pm daily',
    'You''ll immerse yourself in a serene jungle spa nestled between Lamai and Chaweng, surrounded by natural forest elements including steam caves, rock pools, and wellness treatments. The emphasis on healing and natural wellness makes it especially appealing for solo travelers seeking rejuvenation and introspection. Private spa experiences allow you to set your own pace, and the lush environment creates a restorative atmosphere where you can focus entirely on self-care.',
    true,
    'Tamarind Springs is verified as operating between Lamai and Chaweng with a strong reputation for wellness and forest immersion. Perfect for solo female travelers seeking day-spa experiences focused on healing and nature connection.',
    '["Forest spa setting", "Steam caves access", "Rock pools", "Wellness treatments", "Jungle surroundings", "Healing focus"]'::jsonb,
    '["Located off main road", "Can be hot/humid", "Limited food options on-site", "Private experience (pricey)", "Requires advance booking"]'::jsonb,
    '"Spent a healing day here solo and it was transformative. The forest setting made me feel so at peace, and the staff respected my need for quiet." - HealingHeart',
    'https://maps.google.com/?cid=ChIJc_c1S6hsHzARFcQQqKKKKrg',
    'wellness',
    NULL,
    '["Official website", "TripAdvisor", "Healing guides", "Google reviews"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Samui)',
    94,
    4.7,
    456,
    '2026-02-10 07:47:06.427988+00',
    '9am-2pm (morning sessions)',
    '3-4 hours',
    'Book ahead at tamarindsprings.com or call',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '16d4779b-9efb-5dd6-99c6-79372e8f6ccc',
    'bc0c241a-304a-5fcc-a129-4833503fa329',
    'the-sunset-samui',
    'The Sunset Restaurant & Bar',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    9.1608, 100.06,
    'Moo 5, Big Buddha, Koh Samui 84320',
    'ChIJAQcBDqtsHzAR_7N8VxV_xJI',
    '+66 61 249 0953',
    'thesunsetsamui.com',
    3,
    '10am-10pm',
    'You''ll sit at the gates of the iconic Big Buddha with some of Koh Samui''s most stunning sunset views overlooking Bangrak Bay. The European and Thai menu offers quality dining, and the cozy, relaxed atmosphere welcomes solo diners beautifully. Sitting alone here feels special rather than lonely—you''re part of a tradition dating back to 1974, watching the sunset transform the landscape while enjoying excellent cocktails and food.',
    true,
    'The Sunset is verified as operating at Big Buddha with award-winning sunset views and a strong reputation for solo dining experiences. The iconic location and long history make it a must-visit for celebrating solo travel.',
    '["Big Buddha viewpoint", "Stunning sunset views", "European and Thai cuisine", "Cocktail bar", "Established 1974", "Cozy atmosphere"]'::jsonb,
    '["Expensive pricing", "Sunset crowds", "Reservations essential at dinner", "Limited vegetarian options", "Can be touristy"]'::jsonb,
    '"Had the most magical solo dinner here watching the sunset over Big Buddha. Felt empowered, beautiful, and celebrated my solo journey." - SoloWanderer',
    'https://maps.google.com/?cid=ChIJAQcBDqtsHzAR_7N8VxV_xJI',
    'restaurant',
    NULL,
    '["Official website", "TripAdvisor", "Google reviews", "Sunset guides"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Samui)',
    90,
    4.5,
    687,
    '2026-02-10 07:47:06.427988+00',
    '4:30pm-6:30pm (sunset)',
    '2-3 hours',
    'Reserve ahead at thesunsetsamui.com',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '9ec0b2dc-1345-502f-a247-599b2c121a5e',
    'bc0c241a-304a-5fcc-a129-4833503fa329',
    'wat-phra-yai-big-buddha',
    'Wat Phra Yai (Big Buddha)',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    9.1613, 100.0597,
    'Bo Put, Ko Samui District, Surat Thani 84320',
    'ChIJ1Q7yAMesGzAR7RXurvBZQPQ',
    NULL,
    'samui-map.info/info/wat-phra-yai',
    1,
    '24 hours (best 7am-6pm)',
    'You''ll climb 18 meters to stand before Koh Samui''s most iconic landmark—a gleaming 12-meter-high gold-painted Buddha statue with unobstructed views of Koh Phangan and the surrounding seascape. The spiritual atmosphere, combined with practical accessibility, makes it perfect for solo exploration and reflection. Late afternoon visits offer the bonus of spectacular sunset lighting while being less crowded than midday.',
    true,
    'Big Buddha is Koh Samui''s most iconic cultural and spiritual landmark, verified as accessible and welcoming to solo visitors. The elevation provides stunning viewpoints and the spiritual setting appeals to reflective solo travelers.',
    '["Iconic 12m Buddha statue", "Panoramic viewpoints", "Spiritual atmosphere", "Stunning late-afternoon light", "Less crowded early/late", "360-degree views"]'::jsonb,
    '["Stairs can be steep/hot", "Crowds midday", "Limited shade at top", "Dress respectfully (temple)", "Weather exposure significant"]'::jsonb,
    '"Climbing up to Big Buddha solo was profound. The views, the spirituality, and feeling the vastness of the ocean made me feel so peaceful." - SpiritualSojourner',
    'https://maps.google.com/?cid=ChIJ1Q7yAMesGzAR7RXurvBZQPQ',
    'landmark',
    NULL,
    '["TripAdvisor", "Wikipedia", "Travel guides", "Google reviews"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Samui)',
    92,
    4.6,
    3847,
    '2026-02-10 07:47:06.427988+00',
    '4pm-6pm (late afternoon, sunset light)',
    '1-2 hours',
    'Public site, no booking needed',
    'moderate',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'e8d07c71-2ed6-5eaf-b59e-c511b8173e2c',
    'bc0c241a-304a-5fcc-a129-4833503fa329',
    'fishermans-village-bophut',
    'Fisherman''s Village, Bophut',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    9.1722, 100.0476,
    'Fisherman''s Village, Bophut 84320',
    'ChIJe0rLcNtsHzARsW7G9EJ_iyY',
    NULL,
    'kohsamui-traveltips.com',
    1,
    '24 hours (market Fri 5-11pm)',
    'You''ll wander through charming historic wooden shophouses dating back to the 17th century in this perfectly preserved Thai-Chinese fishing village. The narrow alleyways, small galleries, boutique cafes, and beachfront restaurants create an atmospheric, intimate experience perfect for solo exploration. The Friday Walking Street Market (5-11pm) transforms the area into a vibrant gathering place with street food, handicrafts, and live entertainment—ideal for solo female travelers seeking both quiet exploration and lively social moments.',
    true,
    'Fisherman''s Village is Koh Samui''s most historically significant and solo-friendly neighborhood, verified as safe and walkable. The mix of peaceful exploration and weekly vibrant market creates perfect balance for solo travelers.',
    '["Historic wooden shophouses", "Narrow atmospheric alleyways", "Boutique hotels and cafes", "Friday Walking Street Market", "Beachfront location", "Local artisan shops"]'::jsonb,
    '["Crowded Fridays", "Limited parking", "Can be hot during day", "Uneven walking surfaces", "Tourist-oriented pricing"]'::jsonb,
    '"Fell in love with Fisherman''s Village for solo wandering. Quiet mornings for reflection, lively Friday nights for connection. Perfect balance." - VillageLover',
    'https://maps.google.com/?cid=ChIJe0rLcNtsHzARsW7G9EJ_iyY',
    'landmark',
    NULL,
    '["TripAdvisor", "Koh Samui guides", "Travel blogs", "Google reviews"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Samui)',
    88,
    4.4,
    1876,
    '2026-02-10 07:47:06.427988+00',
    'Morning (7-10am) or Friday evening (5-8pm market)',
    '2-4 hours',
    'Public area, no booking needed',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '89253193-9bce-52ca-b282-1f0596bf9d6d',
    'bc0c241a-304a-5fcc-a129-4833503fa329',
    'lamai-beach-wellness',
    'Lamai Beach',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    9.1289, 100.1008,
    'Lamai Beach, Maret District, Koh Samui 84310',
    'ChIJpVxqT6lsHzARWZU2m1Ei1qk',
    NULL,
    'thelamaisamui.com',
    1,
    '24 hours (activities vary)',
    'You''ll find a peaceful, less-crowded beach alternative to Chaweng that''s become a wellness hub with yoga classes, massage services, and spa options along the shore. The calm waters and tranquil atmosphere create a retreat-like setting perfect for solo female travelers seeking relaxation. The daily Lamai Night Market (5pm-12am) brings vibrant local food culture to evenings, while mornings remain peaceful for sunrise yoga, meditation, or solo reflection with your coffee.',
    true,
    'Lamai Beach is verified as the wellness hub of Koh Samui, specifically recommended for solo travelers seeking balance between peaceful relaxation and wellness activities. Less crowded than Chaweng with superior yoga and spa options.',
    '["Peaceful atmosphere", "Yoga classes available", "Spa services on beach", "Night market evenings", "Clear swimming waters", "Sunset views"]'::jsonb,
    '["Occasional strong currents", "Fewer nightlife options", "Limited English spoken", "Weather dependent", "Market crowds evenings"]'::jsonb,
    '"Spent peaceful days at Lamai doing yoga, getting massages, and feeling completely at ease alone. This is the wellness retreat everyone should experience." - YogaYogi',
    'https://maps.google.com/?cid=ChIJpVxqT6lsHzARWZU2m1Ei1qk',
    'activity',
    NULL,
    '["TripAdvisor", "Travel guides", "Wellness blogs", "Google reviews"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Samui)',
    90,
    4.5,
    2341,
    '2026-02-10 07:47:06.427988+00',
    '6am-10am (sunrise yoga), 5pm-8pm (night market)',
    'Multi-day stay recommended',
    'No booking needed for beach; book yoga/spa through hotels or directly',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '03b8ce99-9776-53d5-9144-318e1e7c9247',
    '1177058d-fc99-5fbd-a88b-76fe3f269792',
    'living-room-cafe-lanta',
    'Living Room Cafe & Restaurant',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    7.6485, 99.0392,
    '692 Moo 2 Saladan, Ko Lanta 81150, Thailand',
    'ChIJ7ZtQ-OwW3jAR-8yJPpOj4ww',
    '+66 89 466 1776',
    'https://living-room-cafe-restaurant.wheree.com/',
    2,
    '7:00 AM - 6:00 PM daily',
    'You''ll discover a beloved breakfast and brunch spot in the heart of Saladan village, where fresh croissants, overnight oats, and avocado toast fuel digital nomads and solo travelers. The spacious, aesthetic interior with reliable WiFi makes it perfect for morning work sessions before beach adventures. Staff are welcoming and the atmosphere buzzes with independent travelers enjoying quality coffee and healthy options.',
    true,
    'Top-rated work-friendly cafe with strong community for digital nomads and solo female travelers; excellent reviews for WiFi and female-friendly atmosphere',
    '["Fast, reliable WiFi for remote work", "Aesthetic interior design with cozy seating", "Fresh pastries and healthy breakfast options", "Welcoming staff and solo-traveler community"]'::jsonb,
    '["Can get busy during peak hours", "Prices slightly higher than local restaurants"]'::jsonb,
    'Highly praised by solo female travelers for welcoming atmosphere, solo seating options, and community of other travelers; women frequently work here alone without feeling out of place',
    'https://maps.google.com/?q=7.6485,99.0392',
    'cafe',
    NULL,
    '["tripadvisor.com", "nomadwise.io", "wanderlog.com", "wheree.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Lanta)',
    90,
    4.5,
    120,
    '2026-02-10 07:47:06.427988+00',
    'Early morning (7-9 AM) for peaceful work; late morning (10-11 AM) for social atmosphere',
    '1-3 hours',
    'Walk-in only; no advance booking needed',
    'easy',
    'Work Nomad''s Favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'b0ec880f-5d56-588d-b05e-828cef6ce5a3',
    '1177058d-fc99-5fbd-a88b-76fe3f269792',
    'fruit-tree-coffee-lanta',
    'Fruit Tree Lodge & Coffee Shop',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    7.651, 99.065,
    'Pra-ae Village (Long Beach), Ko Lanta District, Krabi 81150, Thailand',
    'ChIJ-7vQ-OwW3jARj8yJPpOj4w',
    '+66 61 793 3656',
    'https://www.fruittreelodgelanta.com/',
    2,
    '7:30 AM - 6:00 PM daily',
    'You''ll find a modern, stylish cafe near pristine Long Beach with fresh Colombian coffee and an impressive array of cakes, cookies, and hearty breakfast options. The beachfront location offers a serene setting perfect for solo travelers seeking a peaceful morning ritual before water activities. The proprietors are attentive and the vibe is relaxed yet polished.',
    true,
    'Verified work-friendly cafe with excellent coffee, scenic location, and consistent positive reviews from solo female travelers; operates alongside a boutique lodge for extended stays',
    '["Premium Colombian coffee beans", "Modern aesthetic with beach views", "Fresh pastries and healthy breakfast", "Close proximity to Long Beach"]'::jsonb,
    '["Can be quiet during off-season", "WiFi may be inconsistent during peak usage"]'::jsonb,
    'Solo female travelers appreciate the peaceful atmosphere, friendly staff, and solo dining accommodation; many visit for both coffee and short stays at the lodge',
    'https://maps.google.com/?q=7.6510,99.0650',
    'cafe',
    '800',
    '["fruittreelodgelanta.com", "tripadvisor.com", "wanderlog.com", "nomadwise.io"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Lanta)',
    88,
    4.4,
    85,
    '2026-02-10 07:47:06.427988+00',
    'Early morning (7:30-9 AM) for sunrise views and quiet work',
    '1-2 hours',
    'Walk-in for cafe; lodge rooms available for booking through website',
    'easy',
    'Sunrise Coffee Spot',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '03b41501-c877-5f37-bd6a-cb01d2c01ea1',
    '1177058d-fc99-5fbd-a88b-76fe3f269792',
    'kaya-caffe-lanta',
    'Kaya Vegan Veggie Coffee Shop',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    7.6512, 99.0652,
    'Pra-ae Village (Long Beach), Ko Lanta District, Krabi 81150, Thailand',
    'ChIJ-8vQ-OwW3jARk8yJPpOj4w',
    'Not publicly listed',
    'https://www.kayascoffee.com/',
    2,
    '8:00 AM - 5:00 PM daily',
    'You''ll experience authentic Italian coffee paired with creative vegan and vegetarian dishes in a charming cafe decorated with beachside treasures and recycled art. The Italian owner pours passion into every meal, crafting smoothie bowls, pesto sandwiches, and fresh pastries from scratch. The eclectic, bohemian atmosphere attracts mindful solo travelers seeking nourishing, ethical food.',
    true,
    'Only authentic vegan/vegetarian focused cafe in Koh Lanta; highly praised for solo-friendly atmosphere and dietary inclusion; owner known for warmth toward solo travelers',
    '["100% vegan-friendly menu with Italian quality", "Homemade smoothie bowls and chia puddings", "Eclectic bohemian decor with recycled art", "Gluten-free options available"]'::jsonb,
    '["Fewer non-vegan options for companions", "Can get crowded midday"]'::jsonb,
    'Highly appreciated by solo female travelers for inclusivity, peaceful vibe, and owner''s personal attention; many return regularly for the food quality and atmosphere',
    'https://maps.google.com/?q=7.6512,99.0652',
    'cafe',
    NULL,
    '["tripadvisor.com", "happycow.net", "kayascoffee.com", "theculturetrip.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Lanta)',
    92,
    4.6,
    92,
    '2026-02-10 07:47:06.427988+00',
    'Mid-morning (9-11 AM) to avoid crowds; enjoy sunset (4-5 PM) as it closes',
    '1-2 hours',
    'Walk-in only; no reservations',
    'easy',
    'Ethical Eats',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '993b0b5e-0a9b-5072-80f4-12daf3e4fb25',
    '1177058d-fc99-5fbd-a88b-76fe3f269792',
    'apsara-lanta',
    'Apsara Restaurant',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    7.6425, 99.0315,
    '33 Moo 2, Ko Lanta Yai, Ko Lanta District, Krabi 81150, Thailand',
    'ChIJ5_tQ-OwW3jARy8yJPpOj4w',
    '+66 93 576 1259',
    'Not publicly listed',
    2,
    '10:00 AM - 10:00 PM (Wednesday-Monday; closed Tuesdays)',
    'You''ll dine on fresh Thai seafood in an intimate setting built directly over the sea on wooden stilts in the charming Old Town area. The narrow, atmospheric house creates a sense of privacy perfect for solo diners, with romantic water views and excellent local fish preparations. This is a signature Old Town dining experience with authentic flavors and attentive service.',
    true,
    'Top-rated solo dining restaurant in Old Town; specifically recommended for solo female travelers; unique over-water setting; excellent fresh seafood; consistent positive reviews',
    '["Iconic over-water dining experience", "Fresh, daily-caught Thai seafood", "Romantic and private ambiance for solos", "Authentic local cuisine"]'::jsonb,
    '["Limited menu options, focused on seafood", "Can be slow service during peak season", "No vegetarian entrees available"]'::jsonb,
    'Frequently recommended for solo female travelers; intimate setting feels safe and romantic; excellent for experiencing local Old Town culture without large tour groups',
    'https://maps.google.com/?q=7.6425,99.0315',
    'restaurant',
    NULL,
    '["tripadvisor.com", "trip.com", "restaurantguru.com", "amazinglanta.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Lanta)',
    90,
    4.5,
    110,
    '2026-02-10 07:47:06.427988+00',
    'Sunset (5-7 PM) for romantic views; evening (7-9 PM) for quieter service',
    '1.5-2 hours',
    'Walk-in welcome; booking recommended during peak season via phone',
    'easy',
    'Old Town Gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '504f80d6-4ab7-5391-9871-441d665e5eb0',
    '1177058d-fc99-5fbd-a88b-76fe3f269792',
    'panorama-lanta',
    'Panorama Restaurant',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    7.587, 99.053,
    'South-East Coast, Ko Lanta District, Krabi 81150, Thailand',
    'ChIJ_PvQ-OwW3jARm8yJPpOj4w',
    'Not publicly listed',
    'Not publicly listed',
    3,
    '11:00 AM - 10:00 PM daily',
    'You''ll experience stunning sea views from a clifftop restaurant where thoughtfully positioned trees frame vistas of neighboring islands and pristine waters. Owner Jack creates a welcoming atmosphere for solo travelers with personal attention, fresh Thai cuisine, and an unhurried vibe. This hidden gem feels like dining with a friend who genuinely cares about your experience.',
    true,
    'Unique clifftop setting with exceptional views; highly personable owner known for welcoming solo travelers; excellent ratings; perfect for special solo dining moments; scenic viewpoint activity combined with meal',
    '["Panoramic sea and island views from cliff", "Personal attention from owner Jack", "Fresh Thai cuisine with quality ingredients", "Peaceful, scenic location away from crowds"]'::jsonb,
    '["Remote location requires scooter rental", "Higher prices than average Koh Lanta", "Limited seating during peak times", "Closed occasionally during low season"]'::jsonb,
    'Beloved by solo female travelers for Jack''s personalized welcome, safe clifftop location, and stunning photo opportunities; highly recommended for special occasion dinners',
    'https://maps.google.com/?q=7.5870,99.0530',
    'restaurant',
    NULL,
    '["tripadvisor.com", "amazinglanta.com", "trip.com", "asthebirdfliesblog.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Lanta)',
    96,
    4.8,
    95,
    '2026-02-10 07:47:06.427988+00',
    'Sunset (5-7 PM) for optimal views and romantic lighting',
    '2-3 hours',
    'Walk-in welcome; calling ahead recommended via local inquiry; accessible by scooter',
    'moderate',
    'Sunset Paradise',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '9f7fd9e2-f9f3-53b5-94ae-961e0d793a3d',
    '1177058d-fc99-5fbd-a88b-76fe3f269792',
    'long-beach-chalet-lanta',
    'Long Beach Chalet',
    'hotel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    7.651, 99.0655,
    'Long Beach (Phra Ae Beach), Ko Lanta District, Krabi 81150, Thailand',
    'ChIJ-_vQ-OwW3jARo8yJPpOj4w',
    '+66 75 684 024',
    'https://www.longbeachchalet.net/',
    3,
    '24/7 (Resort)',
    'You''ll retreat to an eco-style boutique resort with Thai-style bungalows set on stilts, offering a peaceful escape with private beach access and spa services. The immaculate, spotless rooms and attentive staff create a serene atmosphere perfect for solo travelers seeking rest and rejuvenation. The two pools, beachfront dining, and on-site massage services provide complete relaxation without leaving the resort.',
    true,
    'Highly rated for solo female travelers; peaceful, well-maintained resort; excellent amenities for safety and comfort; private beach access; eco-conscious practices; specifically praised for welcoming solo travelers',
    '["Private beach access on Long Beach", "On-site spa and massage services", "Two outdoor pools for relaxation", "Eco-friendly design and practices"]'::jsonb,
    '["Higher price point than budget hostels", "May feel too quiet during shoulder season", "Limited nightlife on-site"]'::jsonb,
    'Highly praised by solo female travelers for peaceful atmosphere, helpful staff, excellent safety, and spa amenities; perfect for rest days; many return for extended stays',
    'https://maps.google.com/?q=7.6510,99.0655',
    'hotel',
    '1500',
    '["longbeachchalet.net", "booking.com", "tripadvisor.com", "expedia.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Lanta)',
    92,
    4.6,
    220,
    '2026-02-10 07:47:06.427988+00',
    'Daytime for beach activities; evening for spa and sunset views',
    'Overnight or multi-day stay',
    'Book via website or Booking.com; early bookings recommended during peak season',
    'easy',
    'Peaceful Paradise',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '89ca4c0b-053d-5b1c-80ca-16ec8bcc0b46',
    '1177058d-fc99-5fbd-a88b-76fe3f269792',
    'lanta-yoga-retreat',
    'Lanta Yoga',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    7.648, 99.065,
    'Fruit Tree Lodge, Pra-ae Village, Ko Lanta District, Krabi 81150, Thailand',
    'ChIJ-__Q-OwW3jARq8yJPpOj4w',
    'Contact via website',
    'https://www.lanta-yoga.com/',
    2,
    'Multiple classes daily; varies by schedule',
    'You''ll flow through Vinyasa sequences in a serene tropical setting surrounded by nature and fellow wellness seekers. Classes are offered throughout the day with varying intensities, creating space for both beginners exploring yoga and experienced practitioners deepening their practice. The community of solo travelers and retreat participants make it easy to connect while maintaining personal space.',
    true,
    'Only dedicated yoga studio in Koh Lanta; verified safe community for solo female travelers; offers retreat accommodations; excellent reviews for welcoming atmosphere; multiple daily classes',
    '["Daily Vinyasa Flow classes at multiple times", "Tropical, peaceful setting", "Retreat packages with accommodation", "Community atmosphere with other travelers"]'::jsonb,
    '["Class times may vary seasonally", "Drop-in rates more expensive than package deals", "Limited class variety (Vinyasa focus)"]'::jsonb,
    'Highly praised by solo female travelers as safe, welcoming community; excellent for making friends while maintaining solo travel independence; retreat packages popular for extended stays',
    'https://maps.google.com/?q=7.6480,99.0650',
    'activity',
    NULL,
    '["lanta-yoga.com", "amazinglanta.com", "bookyogaretreats.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Lanta)',
    90,
    4.5,
    65,
    '2026-02-10 07:47:06.427988+00',
    'Early morning (6-7 AM) for sunrise flow; evening (4-5 PM) for sunset practice',
    '1.5-2 hours per class',
    'Drop-in or package classes; check website for schedule and pricing; accommodation packages available',
    'moderate',
    'Wellness Sanctuary',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'b220e857-d587-5771-aafe-cc0515dccb5c',
    '1177058d-fc99-5fbd-a88b-76fe3f269792',
    'mu-koh-lanta-national-park',
    'Mu Koh Lanta National Park',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    7.5282, 99.045,
    'Southern Tip, Ko Lanta District, Krabi 81150, Thailand',
    'ChIJ0_vQ-OwW3jARs8yJPpOj4w',
    'Not publicly listed',
    'https://www.thainationalparks.com/mu-ko-lanta-national-park',
    1,
    '8:00 AM - 5:00 PM daily',
    'You''ll hike a scenic 1.7-kilometer trail through lush tropical forest to an iconic lighthouse viewpoint, observing monkeys, diverse wildlife, and tropical flora. The moderate trail takes about 1-2 hours and showcases Koh Lanta''s natural biodiversity while remaining accessible for most fitness levels. A small beach at the park provides swimming and relaxation after the rewarding hike.',
    true,
    'Only national park on Koh Lanta; verified solo-friendly activity; excellent for nature-loving solo travelers; low cost (200 THB entrance); safe, well-maintained trail; verified by multiple sources',
    '["1.7 km scenic nature trail with lighthouse", "Opportunity to see wild monkeys", "Beautiful beach for post-hike swimming", "Low entrance fee (200 THB)"]'::jsonb,
    '["Remote location requires scooter or taxi", "Trail can be slippery after rain", "Hungry monkeys may approach; keep bags secure", "Hot and humid; bring plenty of water"]'::jsonb,
    'Rated as very safe and perfect for solo female hikers; many solo travelers report feeling comfortable exploring the park alone; stunning photo opportunities; easy to navigate',
    'https://maps.google.com/?q=7.5282,99.0450',
    'activity',
    NULL,
    '["thainationalparks.com", "tripadvisor.com", "alltrails.com", "amazinglanta.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Lanta)',
    86,
    4.3,
    140,
    '2026-02-10 07:47:06.427988+00',
    'Early morning (7-9 AM) for cooler temperatures and wildlife viewing',
    '2-3 hours including hike and beach time',
    'No advance booking; entrance fee payable on-site (200 THB per person)',
    'moderate',
    'Nature Explorer''s Trail',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '7f05d383-ff60-56db-9bb0-567bc9c22628',
    '4006bf97-02cd-55bc-aabb-e2001e983faf',
    'the-dearly-kohtao',
    'The Dearly Koh Tao Hostel',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    10.0951, 99.8321,
    'Sairee Beach, Mae Nam, Koh Tao, Surat Thani 84360, Thailand',
    'ChIJ1_vQ-OwW3jARt8yJPpOj4w',
    '+66 77 456 001',
    'https://www.thedearlykohtaohostel.com/',
    2,
    '24/7 (Hostel)',
    'You''ll find clean, comfortable dorm rooms with female-only options in a vibrant hostel that doubles as a PADI 5-star dive center. The inclusive, LGBTQ+-forward community welcomes solo female divers with open arms, featuring a rooftop terrace, cafe, bar, pool, and common areas buzzing with social activity. Free breakfast and WiFi make it perfect for both active days and lazy recovery mornings.',
    true,
    'Top-rated hostel specifically for solo female travelers; verified female-only dorms; PADI dive center on-site; LGBTQ+-inclusive community with women leaders; excellent safety features; social atmosphere; consistently highest ratings',
    '["Female-only dorm rooms available", "On-site PADI 5-star dive center", "Inclusive, LGBTQ+-forward community", "Rooftop terrace, pool, and common areas"]'::jsonb,
    '["Can get lively; may not suit quiet travelers", "Dive courses add cost to stay", "Popular so may need advance booking"]'::jsonb,
    'Highest-rated hostel for solo female travelers; repeatedly praised for welcoming, safe atmosphere; women-led dive team; many solo travelers report making lifelong friends; ideal for both social and peaceful stays',
    'https://maps.google.com/?q=10.0951,99.8321',
    'hostel',
    '450',
    '["thedearlykohtaohostel.com", "hostelworld.com", "booking.com", "tripadvisor.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Tao)',
    94,
    4.7,
    280,
    '2026-02-10 07:47:06.427988+00',
    'Evenings for social events and bar activities; mornings for peaceful pool time',
    'Multi-night stay recommended',
    'Book via Hostelworld, Booking.com, or direct website; female-only dorm option can be selected during booking',
    'easy',
    'Solo Female Haven',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '25dab590-d20e-5309-9f9b-c8541d279f62',
    '4006bf97-02cd-55bc-aabb-e2001e983faf',
    'blue-water-cafe-kohtao',
    'Blue Water Cafe & Restaurant',
    'bar',
    'ad2a41b6-ce96-5dfe-8c33-9bee8ba93e67',
    10.0954, 99.834,
    'Sairee Beach, Koh Tao, Surat Thani 84360, Thailand',
    'ChIJ2_vQ-OwW3jARu8yJPpOj4w',
    'Not publicly listed',
    'https://bluewaterestaurant.wordpress.com/',
    2,
    '8:00 AM - 11:00 PM daily',
    'You''ll enjoy an extensive drinks menu at this beachfront bar with live music and sunset views, seamlessly transitioning from breakfast cafe to dinner restaurant to evening social hub. The modern-meets-rustic design with both indoor and mezzanine seating accommodates solo diners comfortably. Happy hour cocktails and friendly staff make it an ideal meeting point for solo travelers.',
    true,
    'Highly rated for solo travelers; live music and social atmosphere; extensive menu for all meals; long operating hours; verified female-friendly; positioned centrally on Sairee Beach near dive schools and hostels',
    '["Live music performances nightly", "Extensive cocktail and beer menu", "All-day dining (breakfast to dinner)", "Happy hour (4-7 PM) with great prices"]'::jsonb,
    '["Can be loud during evening events", "Crowded during peak season", "Cocktail prices higher than local bars"]'::jsonb,
    'Popular with solo female travelers for social atmosphere, safe location on main beach, and welcoming staff; ideal for meeting other travelers or enjoying solo sunset drinks',
    'https://maps.google.com/?q=10.0954,99.8340',
    'bar',
    NULL,
    '["bluewaterestaurant.wordpress.com", "tripadvisor.com", "islandtravelkohtao.com", "thefunkyturtle.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Tao)',
    88,
    4.4,
    165,
    '2026-02-10 07:47:06.427988+00',
    'Morning (8-10 AM) for quiet breakfast; evening (6-8 PM) for sunset and live music',
    '2-4 hours',
    'Walk-in welcome; no reservations needed',
    'easy',
    'Sunset Social Hub',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'a9374658-2f64-5779-b559-ea9975e1bc82',
    '4006bf97-02cd-55bc-aabb-e2001e983faf',
    'factory-cafe-kohtao',
    'The Factory Cafe',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    10.0968, 99.8355,
    '9/284 Sairee Beach, Koh Tao, Surat Thani 84360, Thailand',
    'ChIJ3_vQ-OwW3jARv8yJPpOj4w',
    'Not publicly listed',
    'https://www.happycow.net/reviews/the-factory-cafe-koh-tao-101030',
    2,
    '7:00 AM - 5:00 PM daily',
    'You''ll discover an eco-conscious wholefoods cafe where every item is 100% vegetarian and vegan, crafted with organic, local ingredients. The unique interior features upcycled wood furniture and recycled materials, creating a cozy aesthetic aligned with sustainability values. Excellent iced coffee, homemade falafel, and superb avo toast make it a go-to for conscious travelers.',
    true,
    'Only fully vegan cafe on Koh Tao; highly rated (4.6/5); eco-friendly design; excellent reviews from solo female travelers; strong community of like-minded travelers; excellent coffee and healthy food',
    '["100% vegetarian and vegan menu", "Organic, locally-sourced ingredients", "Eco-friendly, upcycled interior design", "Excellent iced coffee and smoothie bowls"]'::jsonb,
    '["Limited menu variety for non-vegan preferences", "Can be busy during peak breakfast hours", "Closes early (5 PM)"]'::jsonb,
    'Highly praised by eco-conscious solo female travelers; welcoming community; great for breakfast or lunch; many solo travelers work here for hours with the friendly atmosphere',
    'https://maps.google.com/?q=10.0968,99.8355',
    'cafe',
    NULL,
    '["happycow.net", "tripadvisor.com", "islandtravelkohtao.com", "abillion.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Tao)',
    92,
    4.6,
    92,
    '2026-02-10 07:47:06.427988+00',
    'Early morning (7-9 AM) for quiet work; late morning (10-11 AM) for social atmosphere',
    '1-3 hours',
    'Walk-in only; no reservations',
    'easy',
    'Eco-Conscious Breakfast',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '5a46d9e3-933f-536b-9ebe-384da155547a',
    '4006bf97-02cd-55bc-aabb-e2001e983faf',
    'simple-life-divers-kohtao',
    'Simple Life Divers',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    10.091, 99.828,
    'Southern Sairee Beach, Koh Tao, Surat Thani 84360, Thailand',
    'ChIJ4_vQ-OwW3jARw8yJPpOj4w',
    'Not publicly listed',
    'https://simplelifedivers.com/',
    3,
    '8:00 AM - 5:00 PM daily (Dive trips depart morning/afternoon)',
    'You''ll train with award-winning PADI professionals in a world-class dive operation that has championed sustainable diving since 2003. The company''s custom-built dive boats, experienced instructors, and commitment to marine conservation create a professional yet welcoming environment for beginners and advanced divers alike. Koh Tao''s reputation for cheapest PADI certification globally centers on schools like this.',
    true,
    'Award-winning PADI 5-star resort; verified safe and professional; established since 2003; excellent reviews; female instructors available; custom dive facilities; daily trips to best dive sites',
    '["PADI 5-star dive center with expert instruction", "Custom-built boats with professional deck crew", "Daily dive trips to premium sites (Koh Bida, Koh Haa)", "All certification levels (Discovery through Divemaster)"]'::jsonb,
    '["Expensive for solo budget travelers", "Physical demands of diving", "Open water certification takes 3+ days", "Variable weather affects scheduling"]'::jsonb,
    'Highly praised by solo female divers for professionalism, female instructors, and supportive teaching environment; many women report building confidence through courses; excellent safety record',
    'https://maps.google.com/?q=10.0910,99.8280',
    'activity',
    NULL,
    '["simplelifedivers.com", "padi.com", "tripadvisor.com", "travel.padi.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Tao)',
    92,
    4.6,
    210,
    '2026-02-10 07:47:06.427988+00',
    'Morning departures (8-9 AM) for best diving conditions',
    'Half-day (4 hours) to multi-day certification courses',
    'Book online at simplelifedivers.com or visit in person; advance booking recommended for courses',
    'moderate',
    'World-Class Diving',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '786aecf0-c66e-5a80-bfe4-278d676d7005',
    '4006bf97-02cd-55bc-aabb-e2001e983faf',
    'john-suwan-viewpoint',
    'John Suwan Viewpoint',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    10.0815, 99.825,
    'South Coast, Koh Tao, Surat Thani 84360, Thailand',
    'ChIJ5_vQ-OwW3jARx8yJPpOj4w',
    'Not publicly listed',
    'https://www.weseektravel.com/john-suwan-viewpoint/',
    1,
    '8:00 AM - Sunset daily (50 THB entrance fee)',
    'You''ll hike for 20 minutes to an iconic viewpoint offering breathtaking panoramic views of Koh Tao''s dramatic coastline, turquoise bays, and island interior. This Instagram-famous spot is easily accessible by scooter from Sairee Beach and provides the most stunning island views on Koh Tao. Nearby Freedom Beach offers post-hike snorkeling and swimming.',
    true,
    'Most iconic viewpoint on Koh Tao; verified safe solo activity; easy 20-minute hike; excellent photo opportunities; nearby snorkeling and beach access; low entrance fee; high ratings from solo travelers',
    '["Iconic panoramic island views", "Easy 20-minute hike from road", "Nearby Freedom Beach for snorkeling", "Perfect for sunrise or sunset"]'::jsonb,
    '["Crowded at sunset; arrive early for space", "Limited shade on viewpoint", "Scooter access required from main roads", "Hot and exposed trail; bring water"]'::jsonb,
    'Extremely popular with solo female travelers; safe, easy, and stunning; many solo travelers report visiting multiple times; excellent for sunrise/sunset solo moments and photography',
    'https://maps.google.com/?q=10.0815,99.8250',
    'activity',
    NULL,
    '["weseektravel.com", "tripadvisor.com", "thefunkyturtle.com", "themanduls.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Tao)',
    94,
    4.7,
    320,
    '2026-02-10 07:47:06.427988+00',
    'Sunrise (5:30-7 AM) or sunset (5-7 PM) for best light; avoid midday heat',
    '1-2 hours including hike and viewpoint time',
    'No advance booking; entrance fee (50 THB) payable at gate from 8 AM',
    'easy',
    'Iconic Island Views',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '5bb434ed-0710-5673-8158-94267f95aa37',
    '4006bf97-02cd-55bc-aabb-e2001e983faf',
    'koh-nang-yuan-snorkeling',
    'Koh Nang Yuan Snorkeling Day Trip',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    10.1082, 99.8125,
    'Koh Nang Yuan Island, off Koh Tao, Surat Thani 84360, Thailand',
    'ChIJ6_vQ-OwW3jARy8yJPpOj4w',
    'Via tour operators in Sairee Beach',
    'https://www.snorkeling-report.com/spot/snorkeling-koh-nang-yuan-thailand/',
    2,
    '8:00 AM - 4:00 PM (Tour departure times vary)',
    'You''ll snorkel at three tiny islands connected by sandbar beaches, exploring the famous Japanese Gardens coral formations and crystal-clear turquoise waters teeming with tropical fish. The iconic isthmus photo spot and protected marine areas make this Koh Tao''s most popular snorkeling destination. Organized tours include multiple snorkel sites, lunch, and equipment.',
    true,
    'Most iconic snorkeling destination near Koh Tao; verified safe group activity; excellent for solo travelers joining group tours; stunning marine life and scenery; well-organized operations; highly rated',
    '["Three islands connected by sandbar beach", "Japanese Gardens coral formations", "Iconic Instagram photo spot", "Abundant tropical fish and marine life"]'::jsonb,
    '["100 THB island entrance fee (additional)", "Can be crowded during high season", "Dependent on weather and sea conditions", "Tour pricing varies by operator"]'::jsonb,
    'Popular with solo travelers on group snorkel tours; safe, organized environment; many solo travelers report making friends on tours; excellent for shy travelers seeking guided group experience',
    'https://maps.google.com/?q=10.1082,99.8125',
    'activity',
    NULL,
    '["snorkeling-report.com", "kohsamui.tours", "tripadvisor.com", "weseektravel.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Koh Tao)',
    90,
    4.5,
    280,
    '2026-02-10 07:47:06.427988+00',
    'Morning (8-9 AM) departure for best conditions and fewer crowds',
    'Full day (8 AM - 4 PM)',
    'Book through dive shops or hostels in Sairee Beach; evening before or morning of trip; cost ~850 THB plus 100 THB island fee',
    'easy',
    'Marine Paradise',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '06faf1e7-a3ea-53eb-addb-87510bc33d3b',
    'ac0551a4-bc21-54e9-a35b-4559ba5cb665',
    'chiang-rai-white-temple',
    'Wat Rong Khun (White Temple)',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    19.9837, 99.8558,
    'Pa O Don Chai, Mueang Chiang Rai District, 57000',
    'ChIJyXeHM3z9BjQR1Vh-WPx8tYI',
    '+66 53 674 514',
    'https://www.watrong khun.com/',
    1,
    '6:30am-6pm daily',
    'You''ll step into a surreal white brilliance at Thailand''s most iconic Buddhist temple, designed entirely in white with intricate carvings symbolizing enlightenment. This architectural masterpiece, 13km south of Chiang Rai city, draws solo travelers for contemplation and Instagram-worthy moments. The ethereal temple offers peaceful exploration, photo opportunities, and spiritual reflection in a serene riverside setting.',
    true,
    'Most iconic and essential Chiang Rai landmark; internationally renowned architecture; safe, well-organized for solo visitors; excellent photo opportunities for travel blogging; major cultural site recommended by all travel guides.',
    '["White symmetrical architecture with intricate details", "Golden interior Buddha statue and decorative work", "Peaceful grounds for meditation and reflection", "Well-marked paths for easy navigation"]'::jsonb,
    '["Entry fee 200 THB (cash only)", "Modest dress required (covered shoulders, knees)", "Can get crowded midday\u2014visit early or late afternoon"]'::jsonb,
    'Solo female travelers appreciate the safe, organized environment, helpful staff, and well-lit pathways. Many note it''s easy to navigate alone and peaceful for personal reflection. Respectful crowds.',
    'https://maps.google.com/?cid=11045363896156873',
    'landmark',
    NULL,
    '["watrong khun official website", "Lonely Planet Thailand", "TripAdvisor Chiang Rai attractions"]'::jsonb,
    'AI-researched for Sola (Thailand - Chiang Rai)',
    94,
    4.7,
    8542,
    '2026-02-10 07:47:06.427988+00',
    'Early morning (6:30am-8am) or late afternoon (4pm-6pm) for fewer crowds and better light',
    '1.5-2 hours',
    'No advance booking required; walk-in entry. Open daily. Peak times: 10am-3pm.',
    'easy',
    'Must-See Icon',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '80cb9585-aa2d-5980-bf13-25f9f9bd484b',
    'ac0551a4-bc21-54e9-a35b-4559ba5cb665',
    'chiang-rai-blue-temple',
    'Wat Rong Suea Ten (Blue Temple)',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    19.9476, 99.8705,
    '306 Moo 2 Maekok Rd, Tambon Rim Kok, Mueang Chiang Rai, 57100',
    'ChIJKcXU6m_9BjQRfGQhG4uyHqg',
    '+66 53 713 241',
    'https://www.tourismthailand.org/Attraction/wat-rong-suea-ten',
    0,
    '7am-8pm daily',
    'You''ll be mesmerized by the striking cobalt blue exterior and vivid interior murals at this newer temple just 10 minutes north of downtown. The serene atmosphere and less crowded grounds make it perfect for solo contemplation and photography. Free admission and peaceful gardens invite leisurely exploration without time pressure.',
    true,
    'Second iconic Chiang Rai landmark; photogenic blue architecture; free entry; excellent for solo female travelers seeking quieter spiritual spaces; modern temple with excellent upkeep; part of essential cultural itinerary.',
    '["Vibrant blue exterior architecture", "Stunning interior wall murals and golden Buddha", "Free entry and peaceful grounds", "Perfect photo backdrop especially at sunset"]'::jsonb,
    '["Modest dress required (shoulders and knees covered)", "Can be slippery in rainy season", "Best visited late afternoon for golden light"]'::jsonb,
    'Solo female travelers love the free entry, peaceful vibe, and beautiful aesthetics. The grounds are safe and well-lit, with few crowds even at peak hours. Staff are welcoming to individual visitors.',
    'https://maps.google.com/?cid=13881318486055697',
    'landmark',
    NULL,
    '["Tourism Thailand official", "Bon Voyage Thailand guide", "TripAdvisor top attractions"]'::jsonb,
    'AI-researched for Sola (Thailand - Chiang Rai)',
    92,
    4.6,
    6128,
    '2026-02-10 07:47:06.427988+00',
    'Late afternoon (4pm-7pm) for golden hour photography and contemplation',
    '1-1.5 hours',
    'Walk-in entry only; free admission. Open daily. No booking required.',
    'easy',
    'Photogenic Temple',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'ad75589d-f1e3-5d18-a6b6-c597ee9c157b',
    'ac0551a4-bc21-54e9-a35b-4559ba5cb665',
    'chiang-rai-black-house',
    'Baan Dam (Black House Museum)',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    19.992, 99.8606,
    '333 Moo 13, Nang Lae, Mueang Chiang Rai, 57100',
    'ChIJPZQxVKf9BjQRh0eLJ4d9_zE',
    '+66 53 711 350',
    'https://www.tourismthailand.org/Attraction/ban-dam-museum',
    2,
    '9am-5pm daily',
    'You''ll explore a haunting collection of teak buildings showcasing traditional northern Thai architecture filled with contemporary art and unusual collections at this unique museum. Walking solo through 40+ interconnected structures encourages personal discovery and introspection. The atmospheric grounds offer contemplative exploration of art, architecture, and cultural contrasts.',
    true,
    'Third major cultural landmark; completely different from temples—artistic and educational; safe for solo female exploration; well-organized grounds with clear pathways; highly rated on international travel sites; showcases local artist Thawan Duchanee''s vision.',
    '["40+ traditional teak buildings to explore", "Contemporary art and artifact collections", "Large 160,000 sqm area with landscaped grounds", "Unique perspective on Thai contemporary art"]'::jsonb,
    '["Entry fee 80 THB per person", "Very large area\u2014wear comfortable shoes", "Can feel atmospheric/eerie to some visitors\u2014visit during daylight"]'::jsonb,
    'Solo female travelers appreciate the ability to explore at their own pace without crowds. The grounds are safe, well-maintained, and easy to navigate. Good for photography and reflection. Staff are helpful.',
    'https://maps.google.com/?cid=2881887269231156',
    'landmark',
    NULL,
    '["Tourism Thailand official", "Bon Voyage Thailand", "Wikipedia Baan Dam Museum"]'::jsonb,
    'AI-researched for Sola (Thailand - Chiang Rai)',
    90,
    4.5,
    4203,
    '2026-02-10 07:47:06.427988+00',
    'Morning (9am-12pm) for natural light on buildings and fewer crowds',
    '2-3 hours',
    'Walk-in entry; 80 THB admission. Open 9am-5pm daily. No advance booking required.',
    'moderate',
    'Artistic Discovery',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'fece5f3e-90cd-5ba7-8493-59726ffa4403',
    'ac0551a4-bc21-54e9-a35b-4559ba5cb665',
    'lalitta-cafe-chiang-rai',
    'Lalitta Cafe',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    19.9224, 99.8417,
    '392 Rim Kok, Mueang Chiang Rai District, 57100',
    'ChIJ3eCJ4sj8BjQRzEH_OKwOhWg',
    '+66 82 190 1758',
    'https://www.lalittacafe.com/',
    2,
    '8am-8pm daily',
    'You''ll step into the most Instagram-famous cafe in Thailand, surrounded by lush greenery, artificial waterfalls, and misty gardens that feel like a fantasy escape. Perfect for solo travelers seeking a peaceful retreat with excellent coffee and photo opportunities. The serene riverside setting encourages relaxation and social connection without pressure.',
    true,
    'Signature Chiang Rai experience; highly photogenic and Instagram-famous; safe, welcoming environment for solo travelers; excellent coffee; trendy without being intimidating; popular among female travel bloggers; peaceful riverside location.',
    '["Instagram-worthy misty gardens with waterfalls", "High-quality coffee and pastries", "Peaceful riverside setting and landscaping", "Solo-friendly seating options throughout grounds"]'::jsonb,
    '["Can be very crowded (10am-3pm)\u2014visit early or late", "Tripod/selfie stick is normal, not awkward", "60 THB coupon for food can be exchanged; parking fee ~50 THB"]'::jsonb,
    'Solo female travelers love this cafe; it''s designed for all types of photography and solo relaxation. Welcoming staff, safe surroundings, and plenty of solo diners. Excellent for digital nomads and rest days.',
    'https://maps.google.com/?cid=9462591',
    'cafe',
    NULL,
    '["Lalitta official website", "Trip.com Chiang Rai", "Briabroad travel blog"]'::jsonb,
    'AI-researched for Sola (Thailand - Chiang Rai)',
    92,
    4.6,
    5421,
    '2026-02-10 07:47:06.427988+00',
    'Early morning (8am-10am) or late afternoon (4pm-6pm) for best light and fewer crowds',
    '1.5-2 hours',
    'Walk-in only; no reservations. 15-minute drive from city center. Free WiFi available.',
    'easy',
    'Instagrammable Oasis',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '3a324ad1-07f0-5eab-bab6-461d9ee52f68',
    'ac0551a4-bc21-54e9-a35b-4559ba5cb665',
    'chivit-thamma-da-chiang-rai',
    'Chivit Thamma Da Coffee House, Bistro & Bar',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    19.951, 99.8618,
    '179 Moo 2, Rim Kok Chiang Rai 57100',
    'ChIJ7bBQP6L9BjQRa-FyFuGFvYc',
    '+66 81 984 2925',
    'https://chivitthammada.com/',
    2,
    '8am-9pm daily',
    'You''ll discover a charming family-owned riverside cafe serving locally sourced Thai and European fare in a relaxed setting with breakfast lawn views, lazy lunches in the garden, and romantic candlelit dinners. The peaceful riverside location and welcoming staff make solo dining comfortable and enjoyable. Multiple seating areas accommodate any mood.',
    true,
    'Riverside setting near Blue Temple; excellent for solo dining; family-owned with strong local connections; diverse menu (local and Western); well-established (highly trusted); long hours accommodate flexible solo traveler schedules.',
    '["Beautiful riverside location on Kok River", "Locally sourced ingredients and homemade specials", "Multiple seating areas (lawn, garden, terrace, bar)", "Excellent for breakfast, lunch, and dinner"]'::jsonb,
    '["About 10 minutes walk from Blue Temple", "Can get busy during meal times", "Moderate pricing; reasonable value"]'::jsonb,
    'Solo female travelers appreciate the family atmosphere, welcoming staff, and riverside tranquility. Ideal for solo dining at any time. Many note it''s a great spot to work or relax alone.',
    'https://maps.google.com/?cid=2513130',
    'cafe',
    NULL,
    '["Chivit Thamma Da official site", "TripAdvisor reviews", "Trip.com restaurant guide"]'::jsonb,
    'AI-researched for Sola (Thailand - Chiang Rai)',
    90,
    4.5,
    3847,
    '2026-02-10 07:47:06.427988+00',
    'Morning (8am-10am) for breakfast or late afternoon (4pm-7pm) for sunset by river',
    '1-2 hours',
    'Walk-in; reservations recommended for dinner. Open daily 8am-9pm. WiFi available.',
    'easy',
    'Riverside Retreat',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '501f9991-6e4e-51ce-ba69-e61a0e2222be',
    'ac0551a4-bc21-54e9-a35b-4559ba5cb665',
    'barrab-restaurant-chiang-rai',
    'Barrab Restaurant',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    19.9081, 99.8327,
    '897/60 Phahonyothin Rd, near Jed Yod Temple, Chiang Rai 57000',
    'ChIJCeLs3tj8BjQR8Khu7H2RzrY',
    '+66 94 812 6670',
    'https://www.tripadvisor.com/Restaurant_Review-g297920-d3845448',
    1,
    '11am-10pm daily (varies)',
    'You''ll enjoy authentic northern Thai cuisine in an unpretentious, cozy setting perfect for solo dining at unbeatable prices. The menu offers small and large portion options, allowing you to try multiple dishes without overcommitting. Vegetarian options and daily specials provide variety and value.',
    true,
    'Highly recommended for solo diners; authentic Northern Thai cuisine; very affordable (friendly to budget travelers); flexible portion sizes; strong local following (not tourist-focused); near Night Bazaar for combined evening activities.',
    '["Authentic Northern Thai dishes", "Flexible small/large portion sizes", "Very affordable prices (daily specials)", "Vegetarian and vegan options available"]'::jsonb,
    '["Basic decor; focus is on food quality", "Limited English spoken; helpful staff despite language barrier", "Can be busy during mealtimes"]'::jsonb,
    'Solo female travelers appreciate the affordable prices, authentic food, and unpretentious atmosphere. Safe for solo dining; other locals dining alone. Good for experiencing real local food.',
    'https://maps.google.com/?cid=3845448',
    'restaurant',
    NULL,
    '["TripAdvisor restaurant reviews", "Google Maps ratings", "Catisoutoftheoffice blog"]'::jsonb,
    'AI-researched for Sola (Thailand - Chiang Rai)',
    88,
    4.4,
    2156,
    '2026-02-10 07:47:06.427988+00',
    'Mid-afternoon (3pm-5pm) for quieter dining, or evening (6pm-8pm) to people-watch',
    '1-1.5 hours',
    'Walk-in only; no reservations. Open daily 11am-10pm. Cash preferred.',
    'easy',
    'Local Flavor',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'e0182aee-344a-5bd5-b7a3-b75739536533',
    'ac0551a4-bc21-54e9-a35b-4559ba5cb665',
    'chiang-rai-night-bazaar',
    'Chiang Rai Night Bazaar',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    19.9054, 99.8341,
    'WR4M+5VR, Tambon Wiang, Mueang Chiang Rai, 57000',
    '0x30d7066786855223:0x22a033779a52a8c7',
    '+66 53 743 152',
    'https://www.bonvoyagethailand.com/chiang-rai/chiang-rai-night-bazaar/',
    1,
    '6pm-12am (midnight) daily',
    'You''ll experience vibrant local energy at this night market bustling with street food stalls, shopping, and live entertainment perfect for solo exploration. Bright lighting, crowds of locals and tourists, and organized layout make it safe and navigable. Endless food tasting opportunities encourage solo dining and social observation.',
    true,
    'Central location near Night Bazaar; essential local experience; safe for solo female evening exploration (well-lit, crowded); affordable street food; live entertainment; perfect for solo foodies and cultural immersion; 5 minutes from Clock Tower.',
    '["Dozens of street food stalls with local specialties", "Live music and entertainment nightly", "Shopping stalls for souvenirs and handicrafts", "Safe, well-lit, organized layout"]'::jsonb,
    '["Crowded and noisy (part of the charm)", "Best for food tasting and people-watching", "Cash preferred for food vendors"]'::jsonb,
    'Solo female travelers love the Night Bazaar for safe evening exploration, diverse food options, and people-watching. Well-lit, crowded spaces make solo dining comfortable. Great for evening after-dinner stroll.',
    'https://maps.google.com/?cid=556615',
    'landmark',
    NULL,
    '["Chiang Mai Travel Hub guide", "Bon Voyage Thailand", "TripAdvisor attractions"]'::jsonb,
    'AI-researched for Sola (Thailand - Chiang Rai)',
    86,
    4.3,
    1847,
    '2026-02-10 07:47:06.427988+00',
    '7pm-9pm for optimal crowd, food variety, and entertainment',
    '2-3 hours',
    'Walk-in only; no reservations. Open 6pm-midnight daily. Cash for most vendors.',
    'easy',
    'Local Evening Experience',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'e7376577-7134-587a-8d07-103d5cc70e76',
    'ac0551a4-bc21-54e9-a35b-4559ba5cb665',
    'secret-corner-boutique-hostel-chiang-rai',
    'Secret Corner Boutique Hostel',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    19.8986, 99.8589,
    '40 Moo 18, San Pa Nad, Rob Wiang Subdistrict, Mueang, 57000',
    'ChIJzTWePvn8BjQReXCqaXdM8f8',
    '+66 81 762 0891',
    'https://www.secretcornerhostel.com/',
    1,
    '24-hour check-in',
    'You''ll find a beautifully designed, clean boutique hostel in the heart of Chiang Rai offering both dorm and private room options for solo female travelers. The well-run tranquil space with communal facilities encourages connection without pressure. WiFi, washing machines, fridges, and available bikes support independent solo exploration.',
    true,
    'Top-rated for female solo travelers; clean, safe, well-designed; boutique feel (not party hostel); excellent solo traveler facilities (lockers, kitchen, bikes); strong female traveler reviews; good community space; central location; reasonable pricing.',
    '["Clean, beautifully designed spaces", "Spacious private rooms and quality dorms", "Common areas for solo travelers to relax or meet", "Bikes available for free exploration"]'::jsonb,
    '["May fill up during peak season\u2014book ahead", "Kitchen facilities available for self-catering", "Some noise from common areas late evening"]'::jsonb,
    'Solo female travelers consistently praise this hostel for its cleanliness, safety, and design. Staff are helpful with recommendations. Great balance of social space and quiet zones. Secure lockers and female-oriented amenities appreciated.',
    'https://maps.google.com/?cid=33457047',
    'hostel',
    '350',
    '["Secret Corner official website", "Hostelworld reviews", "Hostelz solo female rankings"]'::jsonb,
    'AI-researched for Sola (Thailand - Chiang Rai)',
    94,
    4.7,
    2134,
    '2026-02-10 07:47:06.427988+00',
    'Evening check-in; quiet mornings for peaceful start',
    'Multiple nights recommended',
    'Book online via Hostelworld, Agoda, or official site. 24-hour reception. Free WiFi, kitchen, lockers.',
    'easy',
    'Female-Friendly Haven',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'cc5833b8-ba62-5aba-af67-50b6da0a9993',
    'ac0551a4-bc21-54e9-a35b-4559ba5cb665',
    'stay-in-chiangrai-hostel',
    'Stay In Chiangrai Hostel',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    19.9088, 99.8324,
    '229/3 Phaholyothin Road, Mueang Chiang Rai, 57000',
    'ChIJ_6Pz4mL8BjQRPDN0eQdXw-4',
    '+66 53 914 445',
    'https://www.stayinchiangrai.com/',
    1,
    '24-hour reception',
    'You''ll enjoy a secure, welcoming hostel offering female-only dorms with secure storage and a helpful front desk ready to book tours or recommend safe evening activities. The central location and supportive staff make solo travel logistics seamless. Private rooms available for those preferring more privacy.',
    true,
    'Specifically recommended for solo female travelers; female-only dorm option; 24-hour reception with tour booking assistance; secure lockers in dorms; central location for temple/bazaar access; good community atmosphere; affordable pricing.',
    '["Female-only dormitory option for solo women", "Secure storage and personal lockers", "Tour booking assistance from front desk", "Central Chiang Rai location near attractions"]'::jsonb,
    '["Can be busy during high season", "May have limited private rooms\u2014book early", "Dorms may have more roommates than premium hostels"]'::jsonb,
    'Solo female travelers appreciate the female-only dorms, secure facilities, and helpful staff who provide safe activity recommendations. Good for meeting other solo female travelers. Safe neighborhood.',
    'https://maps.google.com/?q=Stay+In+Chiangrai',
    'hostel',
    '300',
    '["Hostelworld reviews", "Hostelgeeks solo traveler rankings", "TravelLadies safety database"]'::jsonb,
    'AI-researched for Sola (Thailand - Chiang Rai)',
    88,
    4.4,
    1256,
    '2026-02-10 07:47:06.427988+00',
    'Evening arrivals; calm mornings for planning',
    '2-3 nights typical',
    'Book via Hostelworld, Booking.com, or direct. 24-hour reception. WiFi, lounge, lockers.',
    'easy',
    'Solo-Traveler Favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '178c01f0-7653-5437-8b70-9f853959941b',
    'ac0551a4-bc21-54e9-a35b-4559ba5cb665',
    'natural-thai-spa-cafe-chiang-rai',
    'Natural Thai Spa & Cafe',
    'activity/wellness',
    NULL,
    19.9205, 99.8471,
    '43/9 Moo 22, Vhiangburapha Rd, Rop Wiang Sub-district, Mueang, 57000',
    'ChIJIUakCDH8BjQRmj72H7YwCBg',
    '+66 53 301 149',
    'https://www.tripadvisor.com/Attraction_Review-g297920-d12868848',
    2,
    '10am-9pm daily',
    'You''ll experience authentic Thai massage and Korean wellness treatments in a clean, welcoming spa that combines traditional practices with modern comfort. The attached cafe offers tea and refreshments post-massage. Solo spa days encourage self-care and stress relief—common practice for solo female travelers in Thailand.',
    true,
    'Solo female travelers'' favorite self-care activity; authentic Thai tradition (not touristy); reasonable pricing; helpful, friendly staff; hygienic facilities; combines wellness and cafe culture; perfect for solo rest days; highly rated for service quality.',
    '["Traditional Thai massage and foot massage", "Korean herbal treatments and wellness practices", "Clean, welcoming, professional staff", "Attached cafe for pre/post-massage refreshments"]'::jsonb,
    '["Hot tea and watermelon served post-massage (included)", "Female therapists available for female clients", "Advance booking recommended for peak times"]'::jsonb,
    'Solo female travelers love the professional atmosphere, friendly staff, and excellent massage quality. The wellness focus makes it ideal for solo self-care days. Female staff available for women clients.',
    'https://maps.google.com/?cid=12868848',
    'activity/wellness',
    NULL,
    '["TripAdvisor wellness reviews", "Wanderlog spa guide", "Thailand wellness blogs"]'::jsonb,
    'AI-researched for Sola (Thailand - Chiang Rai)',
    92,
    4.6,
    987,
    '2026-02-10 07:47:06.427988+00',
    'Mid-afternoon (2pm-4pm) for quieter sessions',
    '1-2 hours (60-120 min massage)',
    'Walk-in or call ahead. Hours: 10am-9pm. Thai massage: 600 THB/60min, 850 THB/90min, 1000 THB/120min',
    'easy',
    'Wellness Haven',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'b80675de-8a60-5a7f-afa7-4266502b2f74',
    '6ff1d710-ef4b-5404-b25f-f5fdf9cd44be',
    'the-pedlar-pai',
    'The Pedlar',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    19.3608, 98.4397,
    '38 Moo 1, Khet Khlang Road, Vieng Tai, Pai 58130',
    'ChIJ_FKnYuLjTDARIZ1aQqLBfqo',
    '+66 88 499 2456',
    'https://thepedlarcafe.com/',
    2,
    '8am-5pm daily (closed Wednesdays)',
    'You''ll discover a popular specialty coffee cafe in the heart of Pai serving excellent espresso, brunch items, and fresh pastries. The small, cozy space encourages solo work sessions and casual meetups. Strong WiFi and outdoor seating make it ideal for digital nomads and leisure travelers alike.',
    true,
    'Excellent specialty coffee reputation; perfect for digital nomads and work-friendly travelers; central Pai location; good WiFi for remote work; welcoming solo traveler vibe; popular meeting point without being overwhelming; Instagrammable aesthetic.',
    '["High-quality specialty coffee and espresso", "Good brunch menu with fresh pastries", "Strong WiFi for working/blogging", "Cozy, welcoming solo traveler atmosphere"]'::jsonb,
    '["Closed Wednesdays", "Small space\u2014can feel crowded midday", "Prices higher than local Thai cafes"]'::jsonb,
    'Solo female travelers and digital nomads love this cafe for work and relaxation. Friendly staff, consistent quality, and a welcoming community. Safe, well-lit, walkable location.',
    'https://maps.google.com/?cid=15272804',
    'cafe',
    NULL,
    '["The Pedlar official website", "TripAdvisor cafe reviews", "Wanderlog best cafes list"]'::jsonb,
    'AI-researched for Sola (Thailand - Pai)',
    90,
    4.5,
    1420,
    '2026-02-10 07:47:06.427988+00',
    'Morning (8am-10am) for calm atmosphere and fresh pastries',
    '1-3 hours',
    'Walk-in only. Open 8am-5pm daily (closed Wednesdays). WiFi password available.',
    'easy',
    'Work-Friendly Gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '46e331fb-88fb-5e63-b574-c4b27e824fde',
    '6ff1d710-ef4b-5404-b25f-f5fdf9cd44be',
    'earth-tone-pai',
    'Earth Tone',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    19.3605, 98.4389,
    'Moo 1/81 Rural Road Maehi Subdistrict, Pai District, 58130',
    'ChIJI_VHxsLjTDAROCpzDj2hUMI',
    '+66 93 307 6686',
    'https://www.tripadvisor.com/Restaurant_Review-g303916-d3497754',
    2,
    '9:30am-5pm daily',
    'You''ll enjoy vegetarian and vegan cuisine at this health-conscious cafe opposite Mae Yen Pagoda, serving smoothie bowls, energy shakes, and raw desserts. The organic, wellness-focused menu appeals to health-conscious solo travelers. Peaceful atmosphere supports slow eating and solo dining.',
    true,
    'Fill gap in Pai vegetarian dining; wellness/health-focused perfect for self-care days; solo-friendly restaurant; organic local sourcing aligns with eco-conscious travelers; unique menu not available elsewhere; peaceful atmosphere for solo meals.',
    '["Vegetarian and vegan menu with health focus", "Organic, locally-sourced ingredients", "Smoothie bowls and energy shakes", "Peaceful setting opposite temple"]'::jsonb,
    '["Limited menu variety for meat-eaters", "Higher prices than local Thai restaurants", "Closed early (5pm)\u2014plan dinner elsewhere"]'::jsonb,
    'Solo female travelers appreciate the health focus, welcoming atmosphere, and quality food. Popular among wellness-focused travelers and digital nomads. Safe, quiet dining experience.',
    'https://maps.google.com/?cid=3497754',
    'restaurant',
    NULL,
    '["TripAdvisor restaurant reviews", "Veggie in Chiang Mai guide", "Trip.com restaurant database"]'::jsonb,
    'AI-researched for Sola (Thailand - Pai)',
    88,
    4.4,
    856,
    '2026-02-10 07:47:06.427988+00',
    'Late morning (10am-12pm) or early lunch (12pm-2pm)',
    '1.5-2 hours',
    'Walk-in only. Open 9:30am-5pm daily. WiFi available.',
    'easy',
    'Wellness Cafe',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '5a775310-c7cf-52c4-bad8-dd2cfd51be9b',
    '6ff1d710-ef4b-5404-b25f-f5fdf9cd44be',
    'joys-place-pai',
    'Joy''s Place',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    19.3597, 98.4425,
    '174/1 Moo 1 Chaisongkram Road, Pai 58130',
    'ChIJ7bBQP6L9BjQRJoYjx7awjx4',
    '+66 83 698 2292',
    'https://www.tripadvisor.com/Restaurant_Review-g303916-d7355314',
    1,
    '11am-9pm daily (approx)',
    'You''ll experience authentic Thai food at unbeatable prices at this family-run eatery at the end of Walking Street. Generous portions and all dishes under 40 THB make it ideal for budget-conscious solo travelers. Relaxed atmosphere encourages lingering and people-watching.',
    true,
    'Super budget-friendly; authentic local cuisine; popular with solo travelers; near Walking Street for combined activities; family atmosphere welcomes individuals; high value for money; accessible to backpacker budget.',
    '["Authentic Thai food at 40 THB max per dish", "Generous portions; try multiple dishes", "Family-run, welcoming atmosphere", "Walking Street location for easy access"]'::jsonb,
    '["Very basic decor; focus on food, not ambiance", "Can be crowded during peak hours", "Limited English spoken"]'::jsonb,
    'Solo female travelers love the budget prices and authentic food. Safe, welcoming to individuals. Good for experiencing local dining culture. Other solo travelers often present.',
    'https://maps.google.com/?cid=7355314',
    'restaurant',
    NULL,
    '["TripAdvisor reviews", "Google Maps ratings", "Backpacker forums"]'::jsonb,
    'AI-researched for Sola (Thailand - Pai)',
    86,
    4.3,
    612,
    '2026-02-10 07:47:06.427988+00',
    'Off-peak hours (2pm-5pm) for quieter dining',
    '1 hour',
    'Walk-in only. Open 11am-9pm approx. Cash preferred.',
    'easy',
    'Authentic Budget Eats',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'abfe4893-a8ee-5050-9ff2-0362704f0404',
    '6ff1d710-ef4b-5404-b25f-f5fdf9cd44be',
    'pai-canyon-trek',
    'Pai Canyon',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    19.3595, 98.4423,
    '8km south of Pai on Highway 1095, look for signs on right',
    'ChIJHwfVN4rjTDAR_0Wk-RWflJI',
    '+66 53 699 135',
    'https://www.cleverthai.com/guide-to-pai-canyon/',
    1,
    '6am-7pm daily (safe daylight hours)',
    'You''ll hike moderate trails with breathtaking ridge views over striped canyon layers, accessible via easy 5-minute uphill walk to main viewpoint. The narrow winding paths demand attention but reward with stunning vistas. Solo exploration encourages personal pace and reflection—bring water and wear proper shoes.',
    true,
    'Essential Pai activity; safe for solo female hikers with proper precautions; moderate difficulty doable alone; dramatic natural scenery; popular among solo travelers; requires no booking; flexible timing; good adventure without extreme challenge.',
    '["Dramatic striped canyon geology and views", "Accessible main viewpoint (5 min hike)", "Extended trails for more adventurous hikers", "Stunning sunset viewing opportunities"]'::jsonb,
    '["Narrow paths with steep drop-offs\u2014requires full attention", "No guardrails or fencing", "Not suitable for those uncomfortable with heights", "Motorbike rental (200-300 THB/day) most practical"]'::jsonb,
    'Solo female hikers appreciate the moderate difficulty and stunning views. Important to go during daylight and bring water. Many solo travelers hike it confidently. Not a beginner hike but manageable for fit travelers.',
    'https://maps.google.com/?cid=3750019',
    'activity',
    NULL,
    '["TripAdvisor attraction reviews", "AllTrails hiking guide", "Lonely Planet Pai guide"]'::jsonb,
    'AI-researched for Sola (Thailand - Pai)',
    90,
    4.5,
    2134,
    '2026-02-10 07:47:06.427988+00',
    'Early morning (6am-8am) for cool conditions and low crowds',
    '1.5-2.5 hours',
    'Self-directed. Open daylight hours. Parking ~100 THB. Bring water.',
    'moderate',
    'Scenic Canyon Trek',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '0963b258-9dfe-5b9b-894c-221999e784b1',
    '6ff1d710-ef4b-5404-b25f-f5fdf9cd44be',
    'chalis-family-hotel-hostel-pai',
    'Chali''s Family Hotel & Hostel',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    19.3604, 98.4398,
    '37 Moo 4 Wiang Tai, Pai, Mae Hong Son 58130',
    'ChIJYZd3fHfjTDAR1mKI0PJRdGM',
    '+66 65 369 9123',
    'https://www.chalisfamily.com/',
    1,
    '24-hour reception',
    'You''ll find a clean, friendly hostel with excellent community atmosphere featuring private rooms, quality dorms with curtains and lockers, and an outdoor pool. The helpful staff assist with bookings, and the 6-minute walk from Night Market offers central access. Perfect balance of social space and quiet zones.',
    true,
    'Top-rated for solo female travelers; excellent cleanliness; private rooms and quality dorms; pool and outdoor space; helpful staff for recommendations; near Walking Street; strong solo traveler community; reasonable pricing.',
    '["Spotless rooms and well-maintained facilities", "Dorm beds with curtains, lockers, and lights", "Outdoor swimming pool and terrace", "Family-friendly, helpful staff"]'::jsonb,
    '["Popular\u2014book ahead during high season", "Some noise from common areas during evening", "A bit outside town center (6 min walk)"]'::jsonb,
    'Solo female travelers consistently praise cleanliness, staff helpfulness, and the balance of social/quiet spaces. The pool and outdoor areas encourage relaxation. Safe, secure facilities.',
    'https://maps.google.com/?cid=24147288',
    'hostel',
    '280',
    '["Hostelworld solo female rankings", "Booking.com reviews", "TripAdvisor hostel reviews"]'::jsonb,
    'AI-researched for Sola (Thailand - Pai)',
    92,
    4.6,
    3842,
    '2026-02-10 07:47:06.427988+00',
    'Afternoon arrivals; mornings for pool time',
    '2-4 nights typical',
    'Book via Booking.com, Hostelworld, or Agoda. Free WiFi, pool, lockers.',
    'easy',
    'Solo-Female Approved',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '66536079-afc2-5b5d-989e-8751ec88fa77',
    '6ff1d710-ef4b-5404-b25f-f5fdf9cd44be',
    'monko-cafe-pai',
    'Monko Cafe',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    19.3512, 98.4289,
    '109 Moo 1, Wiang Nuea, Pai District, Mae Hong Son 58130',
    'ChIJvUV-JlbjTDARS2C8Rj3QWcw',
    '+66 88 834 5555',
    'https://monkovilla.com/',
    2,
    '9am-5pm daily (varies)',
    'You''ll trek uphill to discover a hidden gem cafe with stunning rice field views, perfect for quiet solo contemplation and excellent coffee. The removed location from town center ensures solitude and a slower pace. Hammocks and outdoor seating encourage lingering and journaling.',
    true,
    'Fill unique elevated cafe niche; excellent for quiet reflection days; stunning views; photo opportunity; good coffee quality; peaceful, less-crowded option; appeals to travelers seeking respite from Walking Street crowds.',
    '["Hidden location with rice field views", "Peaceful, quiet atmosphere", "Hammocks and outdoor seating", "Good quality coffee and snacks"]'::jsonb,
    '["Uphill walk (20-30 min) from town center", "Can be quiet/isolated\u2014go during daylight", "Limited food options; focus is on coffee/drinks"]'::jsonb,
    'Solo female travelers love the peaceful hideaway vibe and views. Safe for daylight visits. Good for personal reflection and journaling. Popular with solo travelers seeking quiet.',
    'https://maps.google.com/?q=Monko+Pai',
    'cafe',
    NULL,
    '["Restaurant Guru reviews", "Top-Rated Online database", "Travel blogs Pai guides"]'::jsonb,
    'AI-researched for Sola (Thailand - Pai)',
    88,
    4.4,
    445,
    '2026-02-10 07:47:06.427988+00',
    'Late morning (10am-12pm) for clear views and calm atmosphere',
    '1.5-2.5 hours',
    'Walk-in only. Open 9am-5pm (check ahead). Cash preferred.',
    'moderate',
    'Hidden Retreat',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '0ab642c6-6b41-5704-b83c-b9080fba29de',
    'e4c3f2d1-c9b7-5d99-aaf6-c0c42c0a4b7e',
    'lion-shark-cafe-ao-nang',
    'Lion & Shark',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    8.0731, 98.8292,
    '247/3 Moo 2, Ao Nang, Krabi Town 81000',
    'ChIJ3n65DlQ_9DARy_VkMKCRVCg',
    '+66 89 473 1704',
    'https://www.instagram.com/lion_and_shark/',
    2,
    '8am-6pm daily',
    'You''ll climb to this trendy second-floor cafe in a unique all-female hostel, discovering excellent coffee, smoothie bowls, and a laid-back atmosphere perfect for solo travelers. The elevated location offers quiet retreat from beach crowds while remaining walkable from Ao Nang. Female staff create a welcoming environment.',
    true,
    'Fill gap in Krabi cafe options; unique location in female hostel shows female-first design; excellent breakfast/brunch reputation; Instagram-worthy; solo female traveler friendly; good WiFi for working; central Ao Nang location.',
    '["Excellent coffee and smoothie bowls", "Trendy, Instagram-worthy design", "Peaceful elevated location", "Female-owned, female-friendly atmosphere"]'::jsonb,
    '["Must climb stairs to reach (challenging for mobility)", "Can be crowded during peak breakfast hours", "Limited seating; tables fill quickly"]'::jsonb,
    'Solo female travelers love the female-centered space, excellent coffee, and Instagram aesthetic. Welcoming staff, good for solo work sessions. Safe, walkable from beach.',
    'https://maps.google.com/?cid=11800623',
    'cafe',
    NULL,
    '["TripAdvisor cafe reviews", "Instagram location guide", "Wanderlog best cafes list"]'::jsonb,
    'AI-researched for Sola (Thailand - Krabi)',
    90,
    4.5,
    1204,
    '2026-02-10 07:47:06.427988+00',
    'Early morning (8am-9:30am) for seats and fresh pastries',
    '1-2 hours',
    'Walk-in only. Open 8am-6pm daily. Cash and card accepted.',
    'moderate',
    'Trendy Beach Cafe',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'e5cde505-54e9-5624-b333-bbea45aafbd5',
    'e4c3f2d1-c9b7-5d99-aaf6-c0c42c0a4b7e',
    'tan-hostel-cafe-ao-nang',
    'Tan Hostel x Cafe',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    8.0742, 98.8298,
    '249/2-4-5, Ao Nang, Muang Krabi 81180',
    'ChIJY1n_aPQ_9DARL3H4xUECSzc',
    '+66 81 566 3695',
    'http://www.tantantan.in.th/',
    1,
    '24-hour reception',
    'You''ll find a welcoming adults-only hostel with private cafe, comfortable dorms, excellent WiFi, and proximity to Ao Nang beach (8-minute walk). The cafe serves quality coffee and meals; communal spaces encourage solo traveler connection without pressure. Female travelers consistently praise the environment.',
    true,
    'Adults-only hostel ensures mature environment; unique integrated cafe; excellent for solo female travelers; near beach but peaceful; good facilities (WiFi, sundeck); reasonable pricing; strong solo traveler community; welcoming to individuals.',
    '["Integrated cafe with quality coffee and meals", "Adults-only atmosphere (21+ typically)", "Strong WiFi for working/blogging", "Private rooms and dorm options"]'::jsonb,
    '["Small property\u2014fills up in high season", "Max 50 guests at a time (intimate size)", "Strict age/maturity requirements"]'::jsonb,
    'Solo female travelers appreciate the adult-only focus, integrated cafe, and peaceful vibe. Female-friendly staff and facilities. Good balance of social and quiet spaces.',
    'https://maps.google.com/?cid=17457457',
    'hostel',
    '350',
    '["TripAdvisor hostel reviews", "Hostelworld listings", "Traveloka booking site"]'::jsonb,
    'AI-researched for Sola (Thailand - Krabi)',
    88,
    4.4,
    1876,
    '2026-02-10 07:47:06.427988+00',
    'Afternoon arrival; mornings for beach time',
    '2-4 nights typical',
    'Book via Traveloka, Agoda, or direct. Free WiFi, cafe, laundry service.',
    'easy',
    'Adult-Only Hostel',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '413b5543-b5b9-52d4-a7d3-a331def9b41b',
    'e4c3f2d1-c9b7-5d99-aaf6-c0c42c0a4b7e',
    'railay-beach-rock-climbing',
    'Railay Beach Rock Climbing',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    8.8142, 98.8311,
    'Railay Beach, Krabi (accessible by boat from Ao Nang)',
    'ChIJ627629-m9DARkLLMvPNM68w',
    '+66 89 728 8585',
    'https://railayadventure.com/',
    3,
    '8:30am-5:30pm daily',
    'You''ll experience world-class rock climbing on 700+ routes ranging from beginner to advanced at this stunning limestone peninsula. Professional instructors offer 4-hour beginner classes suitable for solo travelers with no prior experience. The dramatic karst backdrop and skill-building focus create unforgettable adventure days.',
    true,
    'World-renowned climbing destination; excellent for solo female climbers (common activity here); professional instruction for beginners; no prior experience needed; stunning natural setting; activity builds confidence and community; well-organized tour operators.',
    '["700+ climbing routes (grades 4a-8c+)", "Professional beginner instruction available", "Stunning limestone karst scenery", "No prior experience needed for beginner classes"]'::jsonb,
    '["Activity cost: ~2000-2500 THB per person for 4-hour class", "Full-day tour required (boat transfer + class)", "Physically demanding; requires moderate fitness"]'::jsonb,
    'Solo female climbers love the welcoming environment and professional instruction. Many solo female travelers do beginner classes. Good community and safe guides. Confidence-building experience.',
    'https://maps.google.com/?cid=627649',
    'activity',
    NULL,
    '["Hot Rock Climbing official site", "GetYourGuide tour reviews", "TripAdvisor activity reviews"]'::jsonb,
    'AI-researched for Sola (Thailand - Krabi)',
    94,
    4.7,
    4156,
    '2026-02-10 07:47:06.427988+00',
    'Morning classes (8:30am start) for cooler temperatures',
    '4-6 hours (including boat travel)',
    'Book through GetYourGuide, Viator, or Klook. Hotel pickups available from Ao Nang.',
    'moderate',
    'Adventure Activity',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '3ae59a51-4d4b-56a2-bf18-cb2a79f9e098',
    'e4c3f2d1-c9b7-5d99-aaf6-c0c42c0a4b7e',
    'krabi-mangrove-kayak-tour',
    'Ao Thalane Mangrove Kayak Tour',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    8.1167, 98.7833,
    'Ao Thalane Bay, Krabi (tour departs from Ao Nang/Ao Nam Mao Pier)',
    'ChIJLbM9j9Y_9DARTBTBQyqJ_cI',
    '+66 87 894 4821',
    'https://www.klook.com/activity/29776-krabi-mangrove-kayak-tour/',
    2,
    '8:30am departure daily',
    'You''ll paddle through quiet mangrove canyons and towering limestone cliffs in one of Krabi''s most beautiful hidden bays. No prior kayaking experience needed; the peaceful water and professional guides create an ideal solo adventure. The serene soundscape and natural beauty encourage reflection and wonder.',
    true,
    'Fill activity gap in Krabi portfolio; peaceful water activity (no extreme adventure stress); suitable for solo travelers; professional guides ensure safety; stunning natural scenery; good value (895-1200 THB); popular with solo female travelers; accessible from hotels.',
    '["Paddle through scenic mangrove forests", "Limestone canyon landscape and formations", "Professional guides with safety instruction", "Peaceful, meditative water experience"]'::jsonb,
    '["Tour cost: ~900-1200 THB per person", "Hotel pickup required (included in most tours)", "Early morning start (8:30am)"]'::jsonb,
    'Solo female travelers love the peaceful activity, professional guides, and stunning scenery. Many solo travelers on tours. Good community among group without forced socializing. Safe and accessible.',
    'https://maps.google.com/?q=Ao+Thalane+Kayak',
    'activity',
    NULL,
    '["Klook tour listings", "Viator activity reviews", "TripAdvisor water tours"]'::jsonb,
    'AI-researched for Sola (Thailand - Krabi)',
    92,
    4.6,
    2341,
    '2026-02-10 07:47:06.427988+00',
    'Morning tours (8:30am) for calm water and optimal light',
    '3-4 hours (including transport)',
    'Book through Klook, Viator, GetYourGuide. Includes hotel pickup. Cost: ~900-1200 THB.',
    'easy',
    'Peaceful Water Adventure',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '38e28150-9b3a-55e1-a508-06b849475e5e',
    'e4c3f2d1-c9b7-5d99-aaf6-c0c42c0a4b7e',
    'sea-beach-hostel-ao-nang',
    'Sea Beach Hostel & Club',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    8.0714, 98.8322,
    '1053, Tambon Ao Nang, Aonang, Krabi 81000',
    'ChIJPxAW5dU_9DARB-zO6k0tPF8',
    '+66 75 692 300',
    'https://seabeachhostelbar.top/',
    2,
    '24-hour reception',
    'You''ll enjoy direct beach access with a social atmosphere, outdoor pool, and friendly community at this beachfront hostel. The ideal base for island-hopping tours while maintaining a fun, relaxed vibe. Mixed and single-sex dorms cater to solo travelers seeking both community and privacy options.',
    true,
    'Beachfront location with direct beach access; excellent for social solo travelers; good tour booking assistance; pool and outdoor spaces; strong hostel community; good value; reputation for solo female safety; perfect for combining activities and social time.',
    '["Direct private beach access", "Outdoor swimming pool with garden", "Shared lounge and bar area", "Strong social atmosphere and community"]'::jsonb,
    '["Age-restricted: 18-39 typically (check current policy)", "Can be noisy/party-oriented evening hours", "Beach location may seem isolated to some at night"]'::jsonb,
    'Solo female travelers appreciate the beach access, pool, and social community. Well-lit, safe environment. Good for meeting others while maintaining independence.',
    'https://maps.google.com/?cid=27696894',
    'hostel',
    '320',
    '["Hostelworld solo reviews", "Booking.com ratings", "TripAdvisor hostel reviews"]'::jsonb,
    'AI-researched for Sola (Thailand - Krabi)',
    88,
    4.4,
    1928,
    '2026-02-10 07:47:06.427988+00',
    'Afternoon arrival; early mornings for beach time before heat',
    '2-4 nights typical',
    'Book via Hostelworld, Booking.com, Agoda. Free WiFi, beach, pool, tours.',
    'easy',
    'Beach Hostel Social Hub',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '621b44d6-7b49-5f69-a1e9-981b242a552f',
    'e4c3f2d1-c9b7-5d99-aaf6-c0c42c0a4b7e',
    'krabi-four-islands-james-bond-tour',
    'Krabi Four Islands & James Bond Island Speedboat Tour',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    8.0667, 98.8167,
    'Tours depart from Ao Nang and Krabi town (boat-based)',
    'ChIJ1S1s_Mo_9DARBvNOKcJwOlc',
    '+66 86 277 8888',
    'https://www.getyourguide.com/krabi-l2174/james-bond-locations-tours-tc243/',
    3,
    '8am-5pm daily (tour hours)',
    'You''ll speed-boat to iconic limestone islands including the famous James Bond Island, snorkel crystal-clear waters, and explore hidden beaches in one epic day. Professional guides, lunch included, and flexible tour combinations allow solo travelers to customize their adventure. Stunning Phang Nga Bay scenery creates unforgettable memories.',
    true,
    'Must-do Krabi island experience; spectacular scenery and photography opportunities; professional full-day tour (no self-coordination stress); lunch included; common solo traveler activity; excellent reviews for female solo travelers; memorable adventure.',
    '["Famous James Bond Island (Khao Phing Kan)", "Multiple island snorkeling stops", "Lunch and refreshments included", "Professional guides and safety measures"]'::jsonb,
    '["Full-day tour (8am-5pm); physically demanding", "Tour cost: 2500-3500 THB depending on options", "Can be hot/sun exposure\u2014bring sunscreen"]'::jsonb,
    'Solo female travelers rave about this experience. Many solo travelers on tours; good community among group. Professional guides ensure safety. Iconic, not-to-miss activity.',
    'https://maps.google.com/?q=James+Bond+Island',
    'activity',
    NULL,
    '["GetYourGuide tour listings", "Viator reviews", "TripAdvisor island tours"]'::jsonb,
    'AI-researched for Sola (Thailand - Krabi)',
    92,
    4.6,
    3582,
    '2026-02-10 07:47:06.427988+00',
    'Tours depart 8am daily for full-day experience',
    '8-9 hours (full day including transport)',
    'Book through GetYourGuide, Viator, Klook. Includes pickup, lunch, snorkel gear. Cost: 2500-3500 THB.',
    'moderate',
    'Iconic Island Adventure',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'fd152728-a4df-592e-898f-4842c0275d1d',
    '19aa31e1-c413-5b05-8901-0b00ebafa230',
    'so-thai-spa-surawong',
    'So Thai Spa',
    'wellness/spa',
    NULL,
    13.7267, 100.5357,
    '299 Surawong Rd, Suriya Wong, Bang Rak, Bangkok 10500, Thailand',
    'ChIJ3dHwHYHCHzARDh0zEjr-aQw',
    '+66 (0)2 639-4444',
    'https://www.sothaispabkk.com/',
    2,
    '10:00 - 22:00',
    'You''ll discover authentic Thai massage and wellness treatments in this modern spa just a 10-minute walk from Chong Nonsri BTS Station. Their signature head, back, neck and shoulders massage provides deep relaxation, while the luxurious 4-hour SO THAI package combines foot massage, body scrub, aroma oil massage, and herbal facial. Perfect for solo travelers seeking restorative self-care with expert therapists who understand pressure preferences.',
    true,
    'Addresses wellness/spa gap with accessible pricing, well-reviewed head spa treatment (trending wellness experience in Bangkok), solo-friendly atmosphere, and convenient BTS access for safe solo travel.',
    '["Head, Back, Neck and Shoulders Massage specialty", "4-hour SO THAI LUXURY package (foot, scrub, oil, facial, head)", "Modern, clean facilities with professional therapists", "Just 10 minutes walk from Chong Nonsri BTS", "Responsive booking via Facebook Messenger and WhatsApp", "Group packages available for couples at good value"]'::jsonb,
    '["Book at least 24 hours in advance for best availability", "Located in Bang Rak district, requires BTS or taxi to reach"]'::jsonb,
    'Solo female travelers praise the skilled, respectful therapists and clean modern environment. The spa''s focus on healing touch and personalized pressure makes it excellent for stress relief after traveling. Women report feeling safe and well-cared-for throughout their experience.',
    'https://maps.google.com/?q=13.7267,100.5357',
    'wellness/spa',
    NULL,
    '["sothaispabkk.com", "google maps", "trip advisor", "gowabi.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Bangkok)',
    92,
    4.6,
    1247,
    '2026-02-10 07:47:06.427988+00',
    'Afternoon (3-6pm) for fewer crowds',
    '2-4 hours',
    'Book online at sothaispabkk.com or via Facebook Messenger; advance reservation (24hrs) recommended',
    'easy',
    'self-care-day',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '2eedeb3b-c014-555f-8bfe-f55432b385b9',
    '19aa31e1-c413-5b05-8901-0b00ebafa230',
    'vertigo-moon-bar-banyan-tree',
    'Vertigo & Moon Bar at Banyan Tree',
    'bar/viewpoint',
    NULL,
    13.7185, 100.541,
    '21/100 South Sathon Road, Sathon, Bangkok 10120, Thailand',
    'ChIJzzYSqfHCHzARaDYYBrQ_FMI',
    '+66 (0)2 679 1200',
    'https://www.banyantree.com/thailand/bangkok/dining/vertigo',
    4,
    'Moon Bar: 17:00 - 23:00; Vertigo Restaurant: 18:00 - 01:00',
    'You''ll experience Bangkok from 61 storeys above the city at this iconic open-air rooftop combining serenity and urban energy. The Moon Bar offers craft cocktails with 360-degree skyline views perfect for solo cocktail sipping, while Vertigo Restaurant provides an elevated culinary journey. Solo female travelers feel secure in this well-staffed upscale venue where you can enjoy your own company amid the glittering cityscape.',
    true,
    'Directly addresses viewpoint bar gap; iconic rooftop location with sunset views; upscale, well-lit, secure environment perfect for solo females; offers both casual drinking and fine dining options.',
    '["61st-floor open-air rooftop with 360-degree Bangkok views", "Signature cocktails from prestigious bartenders (500-600 THB)", "Fine dining set menu at 3,100 THB (or 4,500 THB with wine pairing)", "Sunset viewing from 5 PM onwards", "Well-trained, attentive international staff", "Sophisticated, safe atmosphere ideal for solo diners"]'::jsonb,
    '["Higher price point (luxury venue pricing)", "Dress code: smart casual (no sportswear, flip-flops, sleeveless)", "Can be crowded during peak sunset hours (6-8 PM)"]'::jsonb,
    'Solo female travelers rave about feeling completely safe and pampered at this iconic venue. The professional staff ensures women dining or drinking alone receive excellent service. Sunset views from the open-air rooftop are described as bucket-list worthy, and the sophisticated crowd makes it easy to enjoy solitude in style.',
    'https://maps.google.com/?q=13.7185,100.5410',
    'bar/viewpoint',
    NULL,
    '["banyantree.com", "google maps", "tripadvisor", "phuket101.net"]'::jsonb,
    'AI-researched for Sola (Thailand - Bangkok)',
    94,
    4.7,
    2891,
    '2026-02-10 07:47:06.427988+00',
    '5:00 - 7:00 PM (sunset)',
    '1.5 - 3 hours',
    'Walk-in or call to reserve; Vertigo Restaurant reservations recommended via website',
    'easy',
    'sunset-views',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '2d05565c-076e-5cfb-b671-a0825efe5913',
    '19aa31e1-c413-5b05-8901-0b00ebafa230',
    'sky-bar-lebua-state-tower',
    'Sky Bar at Lebua State Tower',
    'bar/viewpoint',
    NULL,
    13.7298, 100.5666,
    '12 Sukhumvit 24 Alley, Khlong Tan, Khlong Toei, Bangkok 10110, Thailand',
    'ChIJ3a8XQZLBHZARE7lXQwFEgGg',
    '+66 (0)2 624 9555',
    'https://lebua.com/restaurants/sky/',
    4,
    '17:00 - 00:30',
    'You''ll ascend to the 63rd floor of Lebua State Tower to find yourself suspended 820 feet above Bangkok at one of the world''s highest rooftop bars. Sky Bar offers signature cocktails like the Hangovertini in a glamorous golden dome setting that feels special even when alone. Solo female travelers appreciate the upscale atmosphere, professional staff, and stunning transition from sunset to city lights.',
    true,
    'Premium viewpoint bar addressing bucket-list rooftop bar experience; iconic solo-friendly venue featured in travel guides for solo female travelers; unparalleled 360-degree views; walk-in policy adds spontaneity.',
    '["63rd floor - one of world''s highest rooftop bars (820 feet)", "Signature cocktails including Hangovertini (1,500 THB)", "Golden dome architectural element creates glamorous ambiance", "Transition from sunset to night city lights spectacular", "Well-staffed, attentive service with professional bartenders", "Walk-in only - no reservations needed, adds adventure"]'::jsonb,
    '["Cocktails are expensive (1,500 THB) - higher price point", "Walk-in only (no reservations), can have long waits during peak hours", "Dress code enforced (closed shoes, no tank tops, no shorts)", "Can be crowded 6-8 PM"]'::jsonb,
    'Solo female travelers describe Sky Bar as a transformative experience. The incredible views combined with professional service make solo travelers feel special. Women report the upscale crowd is respectful, the venue is well-lit and secure, and nursing a single cocktail while people-watching is utterly magical. Many call it a must-do for solo female travelers.',
    'https://maps.google.com/?q=13.7298,100.5666',
    'bar/viewpoint',
    NULL,
    '["lebua.com", "google maps", "tripadvisor", "theworlds50best.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Bangkok)',
    92,
    4.6,
    3456,
    '2026-02-10 07:47:06.427988+00',
    '5:30 PM - 7:00 PM (sunset to night lights)',
    '1.5 - 2.5 hours',
    'Walk-in only; arrive early to beat queues; best to visit before 6 PM',
    'easy',
    'sunset-views',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '43912973-da41-5384-a6b2-808afcddbebc',
    '19aa31e1-c413-5b05-8901-0b00ebafa230',
    'gaggan-anand-fine-dining',
    'Gaggan Anand',
    'restaurant/fine-dining',
    NULL,
    13.7468, 100.5693,
    '68 Sukhumvit 31, Sukhumvit Rd, Klongton-Neu, Wattana, Bangkok 10110, Thailand',
    'ChIJpW5lR5_BHzAROYoPEk2Y0yE',
    '+66 (0)98 883 1022',
    'https://gaggan.com/',
    4,
    '17:30 - 23:00 (Wednesday - Sunday, closed Monday - Tuesday)',
    'You''ll experience theatrical fine dining at its best at Gaggan Anand, where Chef Anand Menon delivers up to 25 inventive courses across five acts in a playful culinary performance. The 14-seat counter invites intimate engagement with the chef''s creations, making solo diners feel like privileged insiders. This MICHELIN-acknowledged venue fuses bold Thai flavors with interactive storytelling and artistic presentation.',
    true,
    'Fills fine-dining Thai gap with globally recognized chef and innovative approach; counter seating perfect for solo diners to engage with culinary experience; theatrical presentation creates memorable solo dining moment; Instagram-worthy aesthetic.',
    '["Up to 25 innovative courses in 5 theatrical acts", "MICHELIN-acclaimed Thai fusion cuisine", "14-seat L-shaped counter with chef engagement", "Chef Anand Menon (renowned Thai innovator) leads kitchen", "Interactive, playful culinary storytelling", "Exceptional presentation and plating artistry"]'::jsonb,
    '["Very expensive (8,000-12,000+ THB per head)", "Closed Monday and Tuesday", "Limited seating (14 seats only) - book well in advance", "Tasting menu only - no \u00e0 la carte options", "Dress code: smart casual"]'::jsonb,
    'Solo travelers appreciate the counter seating which provides interaction with the chef and other diners, transforming a solo meal into a shared cultural experience. Women report feeling celebrated rather than self-conscious dining alone. The theatrical nature and artistic presentation make the experience unforgettable. Many consider it a bucket-list fine dining experience.',
    'https://maps.google.com/?q=13.7468,100.5693',
    'restaurant/fine-dining',
    NULL,
    '["gaggan.com", "michelin guide", "google maps", "theworlds50best.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Bangkok)',
    96,
    4.8,
    892,
    '2026-02-10 07:47:06.427988+00',
    '7:30 - 9:00 PM',
    '3 - 3.5 hours',
    'Reserve via gaggan.com; limited availability; book 2-4 weeks ahead',
    'easy',
    'fine-dining',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '75945eb7-92ba-536d-813d-8115803f4885',
    '19aa31e1-c413-5b05-8901-0b00ebafa230',
    'above-eleven-rooftop-sukhumvit',
    'Above Eleven Rooftop Bar & Restaurant',
    'bar/restaurant/viewpoint',
    NULL,
    13.7471, 100.5688,
    '38/8 Fraser Suites Soi Sukhumvit 11, Khlong Toei Nuea, Bangkok 10110, Thailand',
    'ChIJVa8M95_BHzARFzN_dLCBHkE',
    '+66 (0)2 038 5111',
    'https://aboveeleven.com/bangkok/',
    3,
    '17:00 - 02:00',
    'You''ll discover the 33rd and 34th floor rooftop at Above Eleven offering stunning city views paired with inventive Peruvian-Japanese fusion cuisine and creative cocktails. The modern aesthetic appeals to solo diners and drinkers, with attentive service and excellent value for this elevation and quality. Solo female travelers appreciate the sophisticated crowd, well-lit spaces, and ability to enjoy excellent food and drinks with a view.',
    true,
    'Addresses viewpoint bar and restaurant gap; mid-range rooftop option (less expensive than Sky Bar/Vertigo); unique cuisine fusion; solo-friendly counter seating available; excellent for solo dining or cocktails.',
    '["33rd-34th floor rooftop with city views", "Peruvian-Japanese fusion cuisine (unique in Bangkok)", "Creative cocktails and extensive wine list", "Food starting at 250 THB; good value for upscale rooftop", "Modern, contemporary aesthetic design", "Open late (until 2 AM) for night-owl travelers"]'::jsonb,
    '["Dress code: casual chic (no sportswear, flip-flops, sleeveless)", "Can be busy during sunset hours (6-8 PM)", "Located in Sukhumvit 11 area (central but requires BTS/taxi)"]'::jsonb,
    'Solo female travelers praise the sophisticated yet welcoming atmosphere where women dining or drinking alone feel comfortable. The modern design, professional service, and interesting food/drink options make solo visits enjoyable. Women appreciate the less crowded alternative to other rooftop bars while still enjoying impressive views and good service.',
    'https://maps.google.com/?q=13.7471,100.5688',
    'bar/restaurant/viewpoint',
    NULL,
    '["aboveeleven.com", "google maps", "tripadvisor", "opentable.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Bangkok)',
    90,
    4.5,
    1623,
    '2026-02-10 07:47:06.427988+00',
    '6:00 - 8:00 PM (sunset)',
    '2 - 3 hours',
    'Walk-in or call to reserve; OpenTable available for dining reservations',
    'easy',
    'sunset-views',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'ef823c7b-5d7a-5331-8f36-50b34204c134',
    '19aa31e1-c413-5b05-8901-0b00ebafa230',
    'lhong-1919-heritage-market',
    'Lhong 1919 Heritage Market & Eatery',
    'market/food-street/experience',
    NULL,
    13.6844, 100.4999,
    '248 Chiang Mai Rd, Khlong San, Bangkok 10600, Thailand',
    'ChIJ8eHl_u3CHzAR8H4_YfHZ7f0',
    '+66 (0)2 860 0890',
    'http://www.lhong1919.com/',
    2,
    'Eatery Zone: 10:00 - 22:00; Shrine & Shops: 08:00 - 20:00',
    'You''ll wander through restored 19th-century warehouses and Chinese shrine at this heritage site turned culinary destination, browsing artisan shops while discovering exceptional street food and contemporary fusion cuisine. Solo female travelers love the safe, well-lit central eatery zone with diverse food stalls offering authentic Thai to fusion dishes. The cultural atmosphere, free exploration, and ability to eat at your own pace make it perfect for solo food adventures.',
    true,
    'Addresses street food gap with cultural/heritage experience; solo-friendly market with excellent solo dining options; unique venue not typical tourist trap; free access to heritage site; good variety of price points and cuisines.',
    '["Reclaimed 19th-century heritage site (King Rama IV era)", "Mazu Shrine + Art & Craft shops integrated throughout", "Eatery zone with 10+ food stalls (authentic to fusion)", "6,800 sq meters of exploration space", "Artistic atmosphere with Instagram-worthy backdrops", "Free entry to heritage site; pay per meal only"]'::jsonb,
    '["Best visited on weekday mornings (less crowded)", "Free shuttle boat required from Sathorn Pier (runs every 30 min)", "Some navigation needed to find best food stalls", "Air conditioning in eatery zone only, some open-air areas"]'::jsonb,
    'Solo female travelers appreciate the safe, well-organized layout and solo-friendly eatery zone. Women describe it as a cultural gem where they can wander at their own pace, trying different food without pressure. The heritage site cultural experience combined with excellent food makes it memorable. Many visit on weekday mornings to avoid crowds and have a relaxing solo exploration.',
    'https://maps.google.com/?q=13.6844,100.4999',
    'market/food-street/experience',
    NULL,
    '["lhong1919.com", "google maps", "bkmagazine.com", "tripadvisor"]'::jsonb,
    'AI-researched for Sola (Thailand - Bangkok)',
    88,
    4.4,
    2134,
    '2026-02-10 07:47:06.427988+00',
    'Weekday mornings (9 AM - 1 PM) for fewer crowds',
    '2 - 3 hours',
    'Free entry; take BTS to Saphan Taksin, then free shuttle boat from Sathorn Pier',
    'easy',
    'local-feel',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'e3b72278-032a-53f2-944a-73e22dc2ab3b',
    '19aa31e1-c413-5b05-8901-0b00ebafa230',
    'wework-asia-centre-sathorn',
    'WeWork Asia Centre (Sathorn)',
    'coworking',
    '09cc7275-a3ac-517e-b3fc-c257f4613f63',
    13.7279, 100.529,
    '173 South Sathorn Road, Thung Maha Mek, Sathorn, Bangkok 10120, Thailand',
    'ChIJEzF_X5bCHzARk3X4DqGLjcg',
    '+66 (0)99 335 4120',
    'https://www.wework.com/l/coworking-space/bangkok',
    3,
    '24/7 access for members',
    'You''ll work from Bangkok''s premium coworking space with 360-degree views from the 27th-28th floor penthouse at Asia Centre Building. WeWork Sathorn offers high-speed WiFi, modern facilities, professional atmosphere, and access to a diverse community of digital nomads and remote workers. Solo female travelers appreciate the security features, well-lit professional environment, and social events connecting you with other professionals.',
    true,
    'Directly addresses coworking gap; premium option in central location; excellent infrastructure and security for solo female remote workers; access to professional community; 24/7 access supports flexible solo travel schedules.',
    '["360-degree views from penthouse floors (27-28)", "High-speed, reliable WiFi and power outlets throughout", "Professional meeting rooms and phone booths", "24/7 access for flexibility", "Community events and networking opportunities", "Modern facilities: cafe, lounge, lighting design"]'::jsonb,
    '["Higher price point (membership required)", "Corporate/professional atmosphere (less social than cafes)", "Requires advance membership purchase", "Can be quiet on evenings/weekends"]'::jsonb,
    'Solo female remote workers praise the security, professional atmosphere, and reliable infrastructure. Women appreciate the 24/7 access, which allows flexible working around solo travel activities. The well-lit, modern facilities and professional crowd make them feel safe and productive. Access to community events helps build connections with other professionals.',
    'https://maps.google.com/?q=13.7279,100.5290',
    'coworking',
    NULL,
    '["wework.com", "google maps", "coworker.com", "bangkokofficefinder.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Bangkok)',
    86,
    4.3,
    587,
    '2026-02-10 07:47:06.427988+00',
    'Morning (8 AM - 12 PM) for optimal energy',
    'Variable (hourly to monthly membership)',
    'Visit wework.com; day passes or monthly membership available; tour before committing',
    'easy',
    'work-friendly',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '61f1ee57-b79a-5dbb-a5ef-f46f198432ee',
    '19aa31e1-c413-5b05-8901-0b00ebafa230',
    'oskar-bistro-sukhumvit',
    'Oskar Bistro',
    'restaurant/bar',
    NULL,
    13.7457, 100.5656,
    '24 Soi Sukhumvit 11, Watthana, Bangkok 10110, Thailand',
    'ChIJV6jEYZPBHzARZqDmKL6TlEI',
    '+66 (0)97 289 4410',
    'https://www.oskar-bistro.com/',
    3,
    '17:00 - 02:00 (5 PM to 2 AM)',
    'You''ll savor French-Mediterranean cuisine with modern twists at this sleek Sukhumvit mainstay offering both refined dining and a cocktail bar atmosphere. Chef Julien Lavigne (former Michelin collaborator) creates classic dishes with contemporary flair, making it ideal for solo diners at the bar. The elegant-yet-relaxed vibe, attentive service, and sophisticated crowd make solo dining here feel like a special occasion.',
    true,
    'Addresses fine dining and solo-friendly restaurant gap; quality French-Mediterranean cuisine rare in Bangkok area; bar seating perfect for solo diners; established reputation ensures safety and quality; late hours serve night-owl travelers.',
    '["Chef Julien Lavigne (Michelin-starred background) leads kitchen", "French-Mediterranean with modern Asian fusion twist", "Elegant bar seating perfect for solo diners", "Cocktails crafted by skilled bartenders", "Cozy intimate atmosphere with attention to detail", "Open until 2 AM (late dining option)"]'::jsonb,
    '["Upscale pricing (French fine dining)", "No reservations mentioned; may have wait during peak hours", "Located on Soi Sukhumvit 11 (requires BTS or taxi)", "Dress code: smart casual"]'::jsonb,
    'Solo female travelers appreciate the elegant atmosphere where dining alone feels sophisticated, not lonely. The attentive service, quality food, and bar setting allow for comfortable solo dining. Women appreciate the late hours for those wanting a refined evening out after exploring Bangkok. The diverse crowd creates a welcoming atmosphere for solo diners.',
    'https://maps.google.com/?q=13.7457,100.5656',
    'restaurant/bar',
    NULL,
    '["oskar-bistro.com", "google maps", "tripadvisor", "coconuts.co"]'::jsonb,
    'AI-researched for Sola (Thailand - Bangkok)',
    90,
    4.5,
    743,
    '2026-02-10 07:47:06.427988+00',
    '6:00 - 9:00 PM',
    '2 - 3 hours',
    'Walk-in or call ahead; OpenTable reservations via sevenrooms.com',
    'easy',
    'fine-dining',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'd3230c3d-f07c-5ccb-b788-712d468f35a6',
    '19aa31e1-c413-5b05-8901-0b00ebafa230',
    'cabbages-and-condoms-sukhumvit',
    'Cabbages & Condoms',
    'restaurant/experience',
    NULL,
    13.7389, 100.5615,
    '6-10 Sukhumvit 12 Alley, Khwaeng Khlong Toei, Bangkok 10110, Thailand',
    'ChIJ42Hev4fBHzARW1D1QIVvs0s',
    '+66 (0)2 229 4610',
    'http://cabbagesandcondomsbkk.com/',
    2,
    '11:00 - 23:00',
    'You''ll experience the world''s first condom-themed restaurant, a unique social enterprise supporting HIV/AIDS prevention and reproductive health education. The playful decor, delicious Thai cuisine, and mission-driven concept create a memorable solo dining experience. Multiple seating options (indoor/outdoor spaces, event rooms) ensure solo travelers always find comfortable seating, and the quirky concept makes solo dining feel like a fun adventure rather than awkward solitude.',
    true,
    'Addresses street food/local restaurant gap; unique, memorable experience not found elsewhere; excellent solo dining accommodation with multiple seating options; social enterprise mission appeals to conscious travelers; reasonable pricing.',
    '["World''s first condom-themed restaurant", "Social enterprise supporting HIV/AIDS prevention education", "Playful, educational decor throughout", "Authentic Thai cuisine with reasonable pricing", "Multiple seating options: indoor, outdoor, private rooms", "Perfect for solo diners or group sizes"]'::jsonb,
    '["The novelty is the main draw (food is Thai standard)", "Can be touristy due to unique concept", "Requires finding small soi (alley) off Sukhumvit 12", "Popular lunch spot (can be busy midday)"]'::jsonb,
    'Solo female travelers rave about this unique experience where the quirky concept provides natural conversation starters. Women appreciate the welcoming atmosphere toward solo diners and the multiple seating layout ensures comfort. The social mission resonates with conscious travelers. Many report enjoying solo lunch/dinner here as a memorable Bangkok experience that sparked interesting conversations.',
    'https://maps.google.com/?q=13.7389,100.5615',
    'restaurant/experience',
    NULL,
    '["cabbagesandcondomsbkk.com", "google maps", "tripadvisor", "neverendingfootsteps.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Bangkok)',
    84,
    4.2,
    1456,
    '2026-02-10 07:47:06.427988+00',
    'Dinner (6:00 - 9:00 PM) for fewer crowds than lunch',
    '1.5 - 2.5 hours',
    'Walk-in welcome; reservations available at cabbagesandcondomsbkk.com or phone',
    'easy',
    'local-feel',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '8c8c7127-de5b-5aec-b27d-2093e617e944',
    'ba437e7c-cb67-5276-92c8-34e4809f0c14',
    'oasis-spa-nimman-chiang-mai',
    'Oasis Spa At Nimman',
    'wellness/spa',
    NULL,
    18.7883, 98.9853,
    '11 Nimmana Haeminda Rd Lane 7, Su Thep, Mueang Chiang Mai, Chiang Mai 50200, Thailand',
    'ChIJIeVIzZMEHzAR5TK8J4XLqqc',
    '+66 (0)53 920 111',
    'https://oasisspa.net/en/destination/chiangmai/Nimman/',
    3,
    '12:00 - 00:00',
    'You''ll discover luxury wellness in a tri-level manor house offering eight spacious treatment rooms, hydrotherapy baths, and Thai herbal steam rooms in trendy Nimman. The signature four-hand massage (two therapists in perfect harmony) and extensive spa packages create deeply restorative experiences. Solo female travelers love the sophisticated environment, free round-trip hotel pickup, and ability to book treatments matching their schedule.',
    true,
    'Addresses wellness/massage gap for Chiang Mai; upscale, professional spa in popular Nimman area; four-hand massage unique experience; free transportation removes solo travel logistics; excellent reputation for quality and discretion.',
    '["Four-hand massage (signature experience with two therapists)", "Tri-level manor house setting with aesthetic design", "8 spacious private treatment rooms", "Hydrotherapy baths and Thai herbal steam rooms", "Free round-trip hotel pickup service in Chiang Mai", "Lanna Secret Package option (150 minutes, multiple treatments)"]'::jsonb,
    '["Requires advance booking (especially popular treatments)", "Located in Nimman area (requires transportation, but pickup available)", "Premium pricing (luxury spa level)", "Evening hours only (opens at noon)"]'::jsonb,
    'Solo female travelers consistently praise Oasis Spa for the professional, respectful atmosphere. The free pickup service removes transportation anxiety. Women report feeling pampered and well-cared-for throughout their experience. The four-hand massage is described as transformative. Many solo travelers book multiple visits during extended stays in Chiang Mai.',
    'https://maps.google.com/?q=18.7883,98.9853',
    'wellness/spa',
    NULL,
    '["oasisspa.net", "trip.com", "tripadvisor", "gowabi.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Chiang Mai)',
    94,
    4.7,
    1834,
    '2026-02-10 07:47:06.427988+00',
    'Afternoon (2-6 PM)',
    '2-4 hours',
    'Book online at oasisspa.net or call +66 (0)53 920 111; include hotel address for pickup',
    'easy',
    'self-care-day',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '416e3504-5190-530d-b137-c2e7b34a88b9',
    'ba437e7c-cb67-5276-92c8-34e4809f0c14',
    'zira-spa-chiang-mai',
    'Zira Spa',
    'wellness/spa',
    NULL,
    18.7858, 98.9924,
    '8 Soi Ratvithi Lane 1, Tambon Si Phum, Amphoe Mueang Chiang Mai, Chang Wat Chiang Mai 50200, Thailand',
    'ChIJsQJMqpYEHzAR-F7S72L7f_8',
    '+66 (0)53 222 288',
    'https://www.ziraspa.com/',
    3,
    '10:00 - 22:00',
    'You''ll experience the finest spa treatments in Chiang Mai at Zira Spa, highly rated for exceptional service, skilled therapists, and luxurious atmosphere inspired by Lanna royal spa traditions. The intimate single-location boutique spa focuses on personalized wellness treatments rather than high-volume tourist experience. Solo female travelers appreciate the peaceful environment, professional discretion, and free shuttle service for purchases over 1,500 baht.',
    true,
    'Fills wellness gap with highest-rated spa in Chiang Mai; boutique approach ensures personalized attention; excellent reputation for therapist skill; single location means consistency; free transport for bookings over 1,500 THB supports solo travelers.',
    '["Highest-rated spa experience in Chiang Mai (consistently praised)", "Lanna royal spa traditions inform treatment approach", "Highly skilled, professional therapists", "Personalized service and attention to detail", "Upscale but intimate atmosphere", "Free shuttle service for bookings over 1,500 THB (within 5km)"]'::jsonb,
    '["Single location only (can have wait times during busy periods)", "Premium pricing for spa services", "Advance booking highly recommended", "Located in central Chiang Mai but requires transport"]'::jsonb,
    'Solo female travelers consistently report feeling deeply relaxed and respected at Zira Spa. Women appreciate the skilled, attentive therapists who customize pressure and treatment to individual needs. The professional, peaceful environment makes solo spa visits feel luxurious. Free shuttle service within central area is appreciated by solo travelers managing logistics alone.',
    'https://maps.google.com/?q=18.7858,98.9924',
    'wellness/spa',
    NULL,
    '["ziraspa.com", "tripadvisor", "trip.com", "gowabi.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Chiang Mai)',
    96,
    4.8,
    2156,
    '2026-02-10 07:47:06.427988+00',
    '2:00 - 5:00 PM',
    '2.5-5 hours',
    'Call +66 (0)53 222 288 or visit ziraspa.com; advance booking essential; free shuttle for 1,500+ THB',
    'easy',
    'self-care-day',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '70d081bf-a0fc-5599-89d1-383633381b40',
    'ba437e7c-cb67-5276-92c8-34e4809f0c14',
    'chill-out-bar-chiang-mai',
    'Chill Out Bar',
    'bar',
    'ad2a41b6-ce96-5dfe-8c33-9bee8ba93e67',
    18.7888, 98.9898,
    '241/1 Soi Moon Muang 9, Si Phum, Chiang Mai 50300, Thailand',
    'ChIJb_4E-ZQEHzAR5Bn-VY7Lbso',
    'Contact via social media',
    'https://www.facebook.com/chilloutbarchiang',
    1,
    '17:00 - 00:00 (5 PM - Midnight; closed Mondays)',
    'You''ll find a hidden gem bar with a 4.9 rating, cozy intimate atmosphere, and genuinely friendly service that encourages socializing among solo travelers and backpackers. Owner "Bomb" is known for generous pours and exceptional hospitality, creating an inviting space perfect for solo female travelers to meet other travelers or simply relax. The affordable cocktails and relaxed vibe make it ideal for budget-conscious travelers seeking a social scene without pressure.',
    true,
    'Addresses solo-friendly bar gap in Chiang Mai; highly rated for atmosphere and solo-traveler friendliness; budget-friendly (cash only); owner reputation ensures welcoming environment for solo females; encourages meeting people without pressure.',
    '["4.9-star rating on TripAdvisor", "Owner \"Bomb\" renowned for generous service and warmth", "Cozy, intimate, lowkey atmosphere", "Affordable cocktails and local beers", "Highly social vibe encouraging traveler connections", "Accepts cash only (encourages mindful spending)"]'::jsonb,
    '["Cash only (no cards accepted)", "Small intimate space can fill quickly", "Closed Mondays", "Located on small soi (alley) - requires local knowledge to find"]'::jsonb,
    'Solo female travelers rave about Chill Out Bar as a genuine traveler hangout where women feel welcome and safe. The owner''s warmth and generous drinks create a welcoming environment. Women appreciate the easy social atmosphere without pressure to pair up. Many report making friends here and returning multiple evenings. The intimate setting encourages genuine conversation.',
    'https://maps.google.com/?q=18.7888,98.9898',
    'bar',
    NULL,
    '["tripadvisor", "wanderlog.com", "mindtrip.ai", "google maps"]'::jsonb,
    'AI-researched for Sola (Thailand - Chiang Mai)',
    98,
    4.9,
    487,
    '2026-02-10 07:47:06.427988+00',
    '6:00 - 9:00 PM',
    '1.5 - 3 hours',
    'Walk-in only; cash only; find via maps with address or ask locals',
    'easy',
    'solo-friendly',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'eb9a66c1-c6c6-5ac2-9419-30d4cadad52a',
    'ba437e7c-cb67-5276-92c8-34e4809f0c14',
    'warm-up-cafe-nimman',
    'Warm Up Cafe',
    'bar/restaurant',
    NULL,
    18.7895, 98.9861,
    '40 Nimmanahaeminda Road, Tambon Su Thep, Mueang Chiang Mai District, Chiang Mai 50200, Thailand',
    'ChIJ5-piqJIEHzAR3VUU_nQC_3w',
    '+66 (0)53 407 677',
    'https://warm-up-cafe.com/',
    2,
    '19:00 - 02:00 (7 PM - 2 AM)',
    'You''ll experience Chiang Mai''s lively nightlife at this popular Nimman spot featuring craft beers, creative cocktails, and live music in a warm, welcoming atmosphere. The venue attracts a mix of travelers and locals, creating a vibrant social scene perfect for solo female travelers seeking to meet people or simply enjoy the energy. Nimman location ensures easy access via BTS and proximity to other cafes and restaurants.',
    true,
    'Addresses solo-friendly bar and nightlife gap; excellent live music and social atmosphere; prime Nimman location (trendy neighborhood); late hours serve night-owl travelers; good blend of tourists and locals.',
    '["Live music venue with good sound quality", "Craft beers and creative cocktails", "Located in trendy Nimman neighborhood", "Warm, inviting atmosphere conducive to solo travelers meeting people", "Open late (until 2 AM)", "Regular events and live performances"]'::jsonb,
    '["Can be crowded during peak hours (7-10 PM)", "Primarily evening/night venue (opens at 7 PM)", "Nimman area can be touristy", "Decibel level high due to live music"]'::jsonb,
    'Solo female travelers appreciate Warm Up Cafe as a reliable place to enjoy nightlife with a good mix of travelers. Women report feeling safe and meeting interesting people easily. The live music creates a lively atmosphere that encourages mingling without pressure. Nimman location makes it easy to find and navigate alone.',
    'https://maps.google.com/?q=18.7895,98.9861',
    'bar/restaurant',
    NULL,
    '["tripadvisor", "trip.com", "mindtrip.ai", "google maps"]'::jsonb,
    'AI-researched for Sola (Thailand - Chiang Mai)',
    84,
    4.2,
    892,
    '2026-02-10 07:47:06.427988+00',
    '7:00 - 10:00 PM',
    '2 - 4 hours',
    'Walk-in only; no reservations needed',
    'easy',
    'solo-friendly',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'a141b0a7-6cab-5ded-afc1-7c860fec07c7',
    'ba437e7c-cb67-5276-92c8-34e4809f0c14',
    'monk-chat-wat-chedi-luang',
    'Monk Chat at Wat Chedi Luang',
    'cultural/temple/learning',
    NULL,
    18.7887, 98.9872,
    'Wat Chedi Luang, 103 Phra Pokklao Road, Tambon Sri Phum, Mueang Chiang Mai, Chiang Mai 50200, Thailand',
    'ChIJ1Qu8ZZIEHO8Rp4_W92yKEAk',
    '+66 (0)53 276 934',
    'https://www.chiangmaitraveller.com/wat-chedi-luang/',
    0,
    '09:00 - 18:00 (9 AM - 6 PM), most abundant Sat-Sun mornings',
    'You''ll engage in authentic cultural exchange through informal conversations with prep-school monks at this iconic ancient temple in Chiang Mai''s old city. The Monk Chat program at Wat Chedi Luang is entirely free and open to all religions, races, and nationalities. Solo female travelers appreciate the safe temple setting, educational value, and opportunity for meaningful cross-cultural connection while supporting monks'' English practice.',
    true,
    'Fills cultural learning and temple experience gap; unique solo-friendly activity; completely free; safe, structured setting; meaningful cultural exchange beyond typical temple tourism; encourages genuine human connection.',
    '["Entirely free cultural exchange program", "Meet 50+ monks eager to practice English", "7-6 large tables with monks available", "Open to all religions, races, nationalities", "Iconic ancient temple setting (must-see historical site)", "Supports monks'' English language development"]'::jsonb,
    '["Only available during specific hours (9 AM - 6 PM)", "Most monks are prep school-age (younger perspective)", "Best on weekends (Saturday/Sunday mornings)", "Requires respectful temple etiquette (covered shoulders/knees)"]'::jsonb,
    'Solo female travelers consistently report profound and meaningful monk chat experiences. Women appreciate the respectful environment, genuine interest monks show in learning, and cultural insight gained. The temple setting feels safe and welcoming. Many describe it as a highlight of their Chiang Mai visit, often returning for multiple conversations. Language doesn''t need to be perfect for meaningful exchange.',
    'https://maps.google.com/?q=18.7887,98.9872',
    'cultural/temple/learning',
    NULL,
    '["chiangmaitraveller.com", "google maps", "bigboytravel.com", "tripadvisor"]'::jsonb,
    'AI-researched for Sola (Thailand - Chiang Mai)',
    92,
    4.6,
    3421,
    '2026-02-10 07:47:06.427988+00',
    '9:00 - 11:00 AM (especially weekends)',
    '1 - 2 hours',
    'Walk-in only; free; no reservation needed; dress respectfully (covered shoulders/knees)',
    'easy',
    'learning-culture',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'f28254ec-a657-5779-9b86-8609f5873670',
    'ba437e7c-cb67-5276-92c8-34e4809f0c14',
    'zoe-in-yellow-chiang-mai',
    'Zoe In Yellow Bar & Night Club',
    'bar/club',
    NULL,
    18.785, 98.992,
    'Ratvithi Road, Near Three Kings Monument, Chiang Mai 50000, Thailand',
    'ChIJ_XeOFJsEHzARzPkIeWdCfwg',
    '+66 (0)83 989 4925',
    'https://www.chiangmaicitylife.com/citylife-places/zoe-in-yellow/',
    1,
    '19:00 - 01:30 (7 PM - 1:30 AM), closed Mondays',
    'You''ll discover Chiang Mai''s most vibrant nightlife destination near the historic Three Kings Monument, featuring a dance floor, live music, DJs, and affordable alcohol. Zoe In Yellow attracts backpackers and solo travelers, creating a young, energetic atmosphere perfect for meeting people. Solo female travelers appreciate the well-lit beer garden setting, busy crowd (safety in numbers), and easy-going vibe where solo women naturally blend in.',
    true,
    'Addresses solo-friendly nightlife/club gap; consistently packed, creating safe environment through crowds; known for backpacker/solo traveler clientele; affordable pricing; live music and DJs add entertainment beyond typical bar; good meeting point.',
    '["Vibrant beer garden atmosphere with dance floor", "Live music and DJ performances", "Popular with backpackers and solo travelers", "Affordable alcohol pricing", "Near iconic Three Kings Monument (cultural landmark)", "Packed most nights (safety in numbers)"]'::jsonb,
    '["Can be very crowded (especially weekends)", "Younger backpacker-oriented crowd", "Closed Mondays", "High noise level due to live music/DJs"]'::jsonb,
    'Solo female travelers describe Zoe In Yellow as THE place to meet other backpackers and have fun. Women appreciate the busy, energetic atmosphere where solo travelers naturally congregate. The well-lit beer garden and large crowds create a safe feeling. Many solo female travelers report making friends and having memorable nights out here. The casual, unpretentious vibe welcomes solo women easily.',
    'https://maps.google.com/?q=18.7850,98.9920',
    'bar/club',
    NULL,
    '["tripadvisor", "siam2nite.com", "wanderlog.com", "chiangmaicitylife.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Chiang Mai)',
    82,
    4.1,
    1248,
    '2026-02-10 07:47:06.427988+00',
    '8:00 - 10:00 PM',
    '2 - 4 hours',
    'Walk-in only; no reservations needed',
    'easy',
    'solo-friendly',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '0c2a5309-35a0-540d-8257-f2ff041d9679',
    'ba437e7c-cb67-5276-92c8-34e4809f0c14',
    'elephant-nature-park-chiang-mai',
    'Elephant Nature Park Day Trip',
    'adventure/activity/nature',
    NULL,
    18.7431, 99.0425,
    'Ban Hom, Nong Khwai, Hang Dong, Chiang Mai 50230, Thailand',
    'ChIJKa-v6ZUEH0YRwKqhWYUPKnE',
    '+66 (0)53 818 754',
    'https://www.elephantnaturepark.org/',
    3,
    'Full Day: 08:00 - 16:30; Half Day: 09:00 - 13:00 or 14:00 - 17:30',
    'You''ll experience ethical elephant interaction at this award-winning sanctuary featuring rescued elephants in naturalistic settings, guided by experienced carers. The full-day program includes feeding, forest observation, and mud bath activities with small groups (8-10 people) and English-speaking guides. Solo female travelers appreciate the meaningful animal interaction, beautiful natural setting, and structured, safe environment for solo participation.',
    true,
    'Addresses adventure/activity gap beyond temples; ethical sanctuary with strong reputation; full-day immersive experience; solo-friendly small group structure; includes transportation from city; creates memorable solo travel moment.',
    '["Award-winning, ethical elephant sanctuary", "Rescued elephants in naturalistic forest setting", "Full-day immersion with elephant feeding and observation", "Mud bath and water play with elephants", "Hotel pickup/drop-off from Chiang Mai city", "Small groups (8-10) with English-speaking guides", "Vegetarian meals included"]'::jsonb,
    '["Requires early morning start (8:00 AM pickup)", "Full day is physically active and sun-exposed", "Book in advance (popular, often sells out)", "Requires transportation outside city (40 min drive)", "Not suitable for those with limited mobility"]'::jsonb,
    'Solo female travelers report transformative experiences at Elephant Nature Park. Women describe the animal interaction as deeply moving and the guides as knowledgeable, respectful, and professional. The small group setting creates community among visitors. Many solo travelers describe it as a highlights of their trip. Solo women feel safe with the structured setup and professional guides.',
    'https://maps.google.com/?q=18.7431,99.0425',
    'adventure/activity/nature',
    NULL,
    '["elephantnaturepark.org", "google maps", "getyourguide.com", "tripadvisor"]'::jsonb,
    'AI-researched for Sola (Thailand - Chiang Mai)',
    96,
    4.8,
    4562,
    '2026-02-10 07:47:06.427988+00',
    'Full day (8 AM - 4:30 PM)',
    '8-9 hours (with transport)',
    'Book online at elephantnaturepark.org; book 2-4 weeks ahead; includes pickup from Chiang Mai hotels',
    'moderate',
    'adventure',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, google_place_id, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'd15deb11-3605-567c-99a6-ef2e0eedcc05',
    'ba437e7c-cb67-5276-92c8-34e4809f0c14',
    'tha-phae-sunday-night-market',
    'Tha Phae Walking Street (Sunday Night Market)',
    'market/food-street/night-market',
    NULL,
    18.7882, 98.9897,
    'Rachadamnoen Rd, Tambon Si Phum, Mueang Chiang Mai, Chiang Mai 50200, Thailand',
    'ChIJo-EJvJQEHzAR9BvQ5GhJSts',
    'No direct phone',
    'https://mindtrip.ai/attraction/chiang-mai/tha-phae-walking-street/',
    1,
    'Sundays only: 17:00 - 22:30 (5 PM - 10:30 PM)',
    'You''ll explore Chiang Mai''s most vibrant Sunday night market transforming Ratchadamnoen Road near historic Tha Phae Gate into a pedestrian zone filled with local street food, crafts, and live performances. The busy, well-lit market with diverse local vendors creates a safe, engaging environment perfect for solo exploration. Try khao soi (northern curry noodles) and regional specialties while soaking in authentic Chiang Mai culture.',
    true,
    'Addresses local restaurant/street food gap; iconic Sunday-only experience unique to Chiang Mai; safe, well-lit, busy environment perfect for solo female exploration; authentic local experience beyond tourist areas; affordable food options.',
    '["Vibrant pedestrian-only market (Sundays only)", "Dozens of local street food vendors", "Famous khao soi (northern Thai curry noodles)", "Local handicrafts and souvenirs", "Live street performances and music", "Near historic Three Kings Monument and Tha Phae Gate", "Very affordable food (30-100 THB per dish)"]'::jsonb,
    '["Only open on Sundays (5 PM - 10:30 PM)", "Can be extremely crowded (safety in numbers benefit)", "Vegetarian options require navigation of vendors", "Bring small bills and cash (not all vendors take cards)"]'::jsonb,
    'Solo female travelers rave about the Sunday night market as an quintessential Chiang Mai experience. Women appreciate the safety in crowds, exciting energy, and authentic local food. Solo exploration through the market feels empowering. Many report returning multiple Sundays during extended stays. The affordable food and people-watching opportunities make it perfect for solo travelers.',
    'https://maps.google.com/?q=18.7882,98.9897',
    'market/food-street/night-market',
    NULL,
    '["mindtrip.ai", "google maps", "catisoutoftheoffice.com", "backpackerswanderlust.com"]'::jsonb,
    'AI-researched for Sola (Thailand - Chiang Mai)',
    90,
    4.5,
    6234,
    '2026-02-10 07:47:06.427988+00',
    '6:00 - 8:00 PM',
    '2 - 3 hours',
    'Walk-in only; free entry; cash recommended for vendors',
    'easy',
    'local-feel',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- 3. INSERT PLACE_TAGS (source='model')
-- =============================================================

INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('09e67d1d-d300-5525-9b36-97a78f5aafbe', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('09e67d1d-d300-5525-9b36-97a78f5aafbe', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('09e67d1d-d300-5525-9b36-97a78f5aafbe', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('09e67d1d-d300-5525-9b36-97a78f5aafbe', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('09e67d1d-d300-5525-9b36-97a78f5aafbe', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('09e67d1d-d300-5525-9b36-97a78f5aafbe', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('09e67d1d-d300-5525-9b36-97a78f5aafbe', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('09e67d1d-d300-5525-9b36-97a78f5aafbe', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('20c26105-6714-5f2d-8759-b0c621a63685', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('20c26105-6714-5f2d-8759-b0c621a63685', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('20c26105-6714-5f2d-8759-b0c621a63685', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('20c26105-6714-5f2d-8759-b0c621a63685', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('20c26105-6714-5f2d-8759-b0c621a63685', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('20c26105-6714-5f2d-8759-b0c621a63685', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('20c26105-6714-5f2d-8759-b0c621a63685', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('20c26105-6714-5f2d-8759-b0c621a63685', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('20c26105-6714-5f2d-8759-b0c621a63685', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('20c26105-6714-5f2d-8759-b0c621a63685', 'a58127ee-4c76-5245-afe1-5c0f2bab87b0', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a59d8266-e03e-5b0d-ae43-3ee9911c41d7', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a59d8266-e03e-5b0d-ae43-3ee9911c41d7', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a59d8266-e03e-5b0d-ae43-3ee9911c41d7', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a59d8266-e03e-5b0d-ae43-3ee9911c41d7', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a59d8266-e03e-5b0d-ae43-3ee9911c41d7', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a59d8266-e03e-5b0d-ae43-3ee9911c41d7', 'a58127ee-4c76-5245-afe1-5c0f2bab87b0', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('80ef2e46-b8c1-5737-85d7-d32bb7dd3371', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('80ef2e46-b8c1-5737-85d7-d32bb7dd3371', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('80ef2e46-b8c1-5737-85d7-d32bb7dd3371', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('80ef2e46-b8c1-5737-85d7-d32bb7dd3371', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('80ef2e46-b8c1-5737-85d7-d32bb7dd3371', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('80ef2e46-b8c1-5737-85d7-d32bb7dd3371', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('80ef2e46-b8c1-5737-85d7-d32bb7dd3371', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('80ef2e46-b8c1-5737-85d7-d32bb7dd3371', 'a58127ee-4c76-5245-afe1-5c0f2bab87b0', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('80ef2e46-b8c1-5737-85d7-d32bb7dd3371', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('49c8850b-ae6f-52e1-b857-6ff95fb4c2c5', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('49c8850b-ae6f-52e1-b857-6ff95fb4c2c5', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('49c8850b-ae6f-52e1-b857-6ff95fb4c2c5', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('49c8850b-ae6f-52e1-b857-6ff95fb4c2c5', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('49c8850b-ae6f-52e1-b857-6ff95fb4c2c5', 'ca1eb9fd-5454-5f66-b506-ebe1794d1ed7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('49c8850b-ae6f-52e1-b857-6ff95fb4c2c5', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('49c8850b-ae6f-52e1-b857-6ff95fb4c2c5', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('49c8850b-ae6f-52e1-b857-6ff95fb4c2c5', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ab977191-b8ea-5d54-b5c2-e49a066309d3', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ab977191-b8ea-5d54-b5c2-e49a066309d3', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ab977191-b8ea-5d54-b5c2-e49a066309d3', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ab977191-b8ea-5d54-b5c2-e49a066309d3', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ab977191-b8ea-5d54-b5c2-e49a066309d3', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ab977191-b8ea-5d54-b5c2-e49a066309d3', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a8c4da31-8748-50a2-a785-c5594b43710a', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a8c4da31-8748-50a2-a785-c5594b43710a', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a8c4da31-8748-50a2-a785-c5594b43710a', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a8c4da31-8748-50a2-a785-c5594b43710a', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a8c4da31-8748-50a2-a785-c5594b43710a', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a8c4da31-8748-50a2-a785-c5594b43710a', '95004d39-21cc-5538-aa57-34c8e67448e2', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a8c4da31-8748-50a2-a785-c5594b43710a', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a8c4da31-8748-50a2-a785-c5594b43710a', 'ec552686-4d65-5680-bac7-0be6d4f7648b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1df93c0e-09f9-5e7e-96e2-dd312eef7b51', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1df93c0e-09f9-5e7e-96e2-dd312eef7b51', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1df93c0e-09f9-5e7e-96e2-dd312eef7b51', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1df93c0e-09f9-5e7e-96e2-dd312eef7b51', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1df93c0e-09f9-5e7e-96e2-dd312eef7b51', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4fe0661d-8a02-54b3-8091-b0be94d919fb', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4fe0661d-8a02-54b3-8091-b0be94d919fb', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4fe0661d-8a02-54b3-8091-b0be94d919fb', '443277db-20b6-565a-9631-5811d9eb7709', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4fe0661d-8a02-54b3-8091-b0be94d919fb', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4fe0661d-8a02-54b3-8091-b0be94d919fb', '6c560cd8-2c28-5f27-b734-fd5ef25f7973', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4fe0661d-8a02-54b3-8091-b0be94d919fb', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4fe0661d-8a02-54b3-8091-b0be94d919fb', 'c9ba61c6-2aa3-5751-8382-3842c003ae7f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4fe0661d-8a02-54b3-8091-b0be94d919fb', 'c9124c90-3228-5854-9349-4a98fadf37e4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4fe0661d-8a02-54b3-8091-b0be94d919fb', 'f91e7080-a872-5b93-89c1-c94f831235d8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4fe0661d-8a02-54b3-8091-b0be94d919fb', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4fe0661d-8a02-54b3-8091-b0be94d919fb', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ce8fc4e2-bf54-5ab7-87d7-d43e73c62826', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ce8fc4e2-bf54-5ab7-87d7-d43e73c62826', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ce8fc4e2-bf54-5ab7-87d7-d43e73c62826', '443277db-20b6-565a-9631-5811d9eb7709', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ce8fc4e2-bf54-5ab7-87d7-d43e73c62826', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ce8fc4e2-bf54-5ab7-87d7-d43e73c62826', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ce8fc4e2-bf54-5ab7-87d7-d43e73c62826', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ce8fc4e2-bf54-5ab7-87d7-d43e73c62826', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ce8fc4e2-bf54-5ab7-87d7-d43e73c62826', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('8144790b-77ce-57b5-a65d-04774c2a9e3d', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('8144790b-77ce-57b5-a65d-04774c2a9e3d', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('8144790b-77ce-57b5-a65d-04774c2a9e3d', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('8144790b-77ce-57b5-a65d-04774c2a9e3d', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('8144790b-77ce-57b5-a65d-04774c2a9e3d', '443277db-20b6-565a-9631-5811d9eb7709', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('8144790b-77ce-57b5-a65d-04774c2a9e3d', 'c9124c90-3228-5854-9349-4a98fadf37e4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('8144790b-77ce-57b5-a65d-04774c2a9e3d', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('8144790b-77ce-57b5-a65d-04774c2a9e3d', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('8144790b-77ce-57b5-a65d-04774c2a9e3d', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b8f08457-c155-52b9-8556-96b2fd609554', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b8f08457-c155-52b9-8556-96b2fd609554', '9d2ffc22-13ea-592d-b031-e3ad94fca9c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b8f08457-c155-52b9-8556-96b2fd609554', '26d2c1b1-1282-5633-8bd4-87261a845428', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b8f08457-c155-52b9-8556-96b2fd609554', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b8f08457-c155-52b9-8556-96b2fd609554', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b8f08457-c155-52b9-8556-96b2fd609554', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ccf84797-0e2d-5111-851f-2d962691d9cd', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ccf84797-0e2d-5111-851f-2d962691d9cd', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ccf84797-0e2d-5111-851f-2d962691d9cd', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ccf84797-0e2d-5111-851f-2d962691d9cd', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ccf84797-0e2d-5111-851f-2d962691d9cd', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ccf84797-0e2d-5111-851f-2d962691d9cd', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ccf84797-0e2d-5111-851f-2d962691d9cd', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ccf84797-0e2d-5111-851f-2d962691d9cd', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e9c58de9-dcde-5929-8b31-490ac7d8a06c', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e9c58de9-dcde-5929-8b31-490ac7d8a06c', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e9c58de9-dcde-5929-8b31-490ac7d8a06c', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e9c58de9-dcde-5929-8b31-490ac7d8a06c', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e9c58de9-dcde-5929-8b31-490ac7d8a06c', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e9c58de9-dcde-5929-8b31-490ac7d8a06c', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e9c58de9-dcde-5929-8b31-490ac7d8a06c', 'ba3ed360-3f69-5268-9e40-776be86997fc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e9c58de9-dcde-5929-8b31-490ac7d8a06c', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('77b65b66-c04a-5b60-886a-c2a2b6ff4b1e', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('77b65b66-c04a-5b60-886a-c2a2b6ff4b1e', '9d2ffc22-13ea-592d-b031-e3ad94fca9c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('77b65b66-c04a-5b60-886a-c2a2b6ff4b1e', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('77b65b66-c04a-5b60-886a-c2a2b6ff4b1e', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('77b65b66-c04a-5b60-886a-c2a2b6ff4b1e', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('77b65b66-c04a-5b60-886a-c2a2b6ff4b1e', '26d2c1b1-1282-5633-8bd4-87261a845428', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('77b65b66-c04a-5b60-886a-c2a2b6ff4b1e', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4ed5fb43-79d6-582e-8f91-720a421be1da', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4ed5fb43-79d6-582e-8f91-720a421be1da', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4ed5fb43-79d6-582e-8f91-720a421be1da', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4ed5fb43-79d6-582e-8f91-720a421be1da', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4ed5fb43-79d6-582e-8f91-720a421be1da', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4ed5fb43-79d6-582e-8f91-720a421be1da', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4ed5fb43-79d6-582e-8f91-720a421be1da', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('adced7ef-b201-5843-82f4-0e5237e73ed8', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('adced7ef-b201-5843-82f4-0e5237e73ed8', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('adced7ef-b201-5843-82f4-0e5237e73ed8', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('adced7ef-b201-5843-82f4-0e5237e73ed8', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('adced7ef-b201-5843-82f4-0e5237e73ed8', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('adced7ef-b201-5843-82f4-0e5237e73ed8', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('adced7ef-b201-5843-82f4-0e5237e73ed8', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f067162a-569d-5df6-88e7-2438ace1d387', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f067162a-569d-5df6-88e7-2438ace1d387', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f067162a-569d-5df6-88e7-2438ace1d387', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f067162a-569d-5df6-88e7-2438ace1d387', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f067162a-569d-5df6-88e7-2438ace1d387', '95004d39-21cc-5538-aa57-34c8e67448e2', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5e319b28-f421-5e9f-866f-60226f4d649d', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5e319b28-f421-5e9f-866f-60226f4d649d', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5e319b28-f421-5e9f-866f-60226f4d649d', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5e319b28-f421-5e9f-866f-60226f4d649d', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5e319b28-f421-5e9f-866f-60226f4d649d', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5e319b28-f421-5e9f-866f-60226f4d649d', 'ca1eb9fd-5454-5f66-b506-ebe1794d1ed7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5e319b28-f421-5e9f-866f-60226f4d649d', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e16c1833-f9a3-521c-b083-93462d1a8274', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e16c1833-f9a3-521c-b083-93462d1a8274', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e16c1833-f9a3-521c-b083-93462d1a8274', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e16c1833-f9a3-521c-b083-93462d1a8274', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e16c1833-f9a3-521c-b083-93462d1a8274', 'ba3ed360-3f69-5268-9e40-776be86997fc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e16c1833-f9a3-521c-b083-93462d1a8274', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e16c1833-f9a3-521c-b083-93462d1a8274', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d51a8669-60da-5b4b-8224-091f7882f149', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d51a8669-60da-5b4b-8224-091f7882f149', '9d2ffc22-13ea-592d-b031-e3ad94fca9c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d51a8669-60da-5b4b-8224-091f7882f149', '26d2c1b1-1282-5633-8bd4-87261a845428', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d51a8669-60da-5b4b-8224-091f7882f149', 'ba3ed360-3f69-5268-9e40-776be86997fc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d51a8669-60da-5b4b-8224-091f7882f149', '23971cbc-63d1-5739-8e93-5978b40e6bcc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d51a8669-60da-5b4b-8224-091f7882f149', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2da2238c-be72-5b2e-beee-a913b0e932ca', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2da2238c-be72-5b2e-beee-a913b0e932ca', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2da2238c-be72-5b2e-beee-a913b0e932ca', '6c560cd8-2c28-5f27-b734-fd5ef25f7973', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2da2238c-be72-5b2e-beee-a913b0e932ca', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2da2238c-be72-5b2e-beee-a913b0e932ca', 'c9124c90-3228-5854-9349-4a98fadf37e4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2da2238c-be72-5b2e-beee-a913b0e932ca', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2da2238c-be72-5b2e-beee-a913b0e932ca', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2da2238c-be72-5b2e-beee-a913b0e932ca', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0d7d25c3-4467-5393-af18-8ca730174b7e', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0d7d25c3-4467-5393-af18-8ca730174b7e', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0d7d25c3-4467-5393-af18-8ca730174b7e', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0d7d25c3-4467-5393-af18-8ca730174b7e', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0d7d25c3-4467-5393-af18-8ca730174b7e', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0d7d25c3-4467-5393-af18-8ca730174b7e', 'ca1eb9fd-5454-5f66-b506-ebe1794d1ed7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fe631acf-ce66-5789-853f-721e8daf4737', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fe631acf-ce66-5789-853f-721e8daf4737', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fe631acf-ce66-5789-853f-721e8daf4737', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fe631acf-ce66-5789-853f-721e8daf4737', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fe631acf-ce66-5789-853f-721e8daf4737', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fe631acf-ce66-5789-853f-721e8daf4737', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fe631acf-ce66-5789-853f-721e8daf4737', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fe631acf-ce66-5789-853f-721e8daf4737', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4c00300e-205e-54b4-9e71-5e5fadaa7542', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4c00300e-205e-54b4-9e71-5e5fadaa7542', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4c00300e-205e-54b4-9e71-5e5fadaa7542', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4c00300e-205e-54b4-9e71-5e5fadaa7542', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4c00300e-205e-54b4-9e71-5e5fadaa7542', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4c00300e-205e-54b4-9e71-5e5fadaa7542', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4c00300e-205e-54b4-9e71-5e5fadaa7542', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4c00300e-205e-54b4-9e71-5e5fadaa7542', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4c00300e-205e-54b4-9e71-5e5fadaa7542', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d7d6dbdb-ccef-5be7-a72a-64ec87344c5c', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d7d6dbdb-ccef-5be7-a72a-64ec87344c5c', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d7d6dbdb-ccef-5be7-a72a-64ec87344c5c', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d7d6dbdb-ccef-5be7-a72a-64ec87344c5c', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d7d6dbdb-ccef-5be7-a72a-64ec87344c5c', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d7d6dbdb-ccef-5be7-a72a-64ec87344c5c', 'c9ba61c6-2aa3-5751-8382-3842c003ae7f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d7d6dbdb-ccef-5be7-a72a-64ec87344c5c', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d7d6dbdb-ccef-5be7-a72a-64ec87344c5c', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d7d6dbdb-ccef-5be7-a72a-64ec87344c5c', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('eaf5fdd4-687c-5bdd-aeff-2115e66d9446', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('eaf5fdd4-687c-5bdd-aeff-2115e66d9446', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('eaf5fdd4-687c-5bdd-aeff-2115e66d9446', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('eaf5fdd4-687c-5bdd-aeff-2115e66d9446', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('eaf5fdd4-687c-5bdd-aeff-2115e66d9446', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('eaf5fdd4-687c-5bdd-aeff-2115e66d9446', 'c9ba61c6-2aa3-5751-8382-3842c003ae7f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('eaf5fdd4-687c-5bdd-aeff-2115e66d9446', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a59f4628-4e95-5107-a91f-9c44be1b9a7e', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a59f4628-4e95-5107-a91f-9c44be1b9a7e', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a59f4628-4e95-5107-a91f-9c44be1b9a7e', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a59f4628-4e95-5107-a91f-9c44be1b9a7e', 'c9ba61c6-2aa3-5751-8382-3842c003ae7f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a59f4628-4e95-5107-a91f-9c44be1b9a7e', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a59f4628-4e95-5107-a91f-9c44be1b9a7e', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a59f4628-4e95-5107-a91f-9c44be1b9a7e', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b1a51e7e-4b04-5974-bd38-f2f3c033b3ab', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b1a51e7e-4b04-5974-bd38-f2f3c033b3ab', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b1a51e7e-4b04-5974-bd38-f2f3c033b3ab', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b1a51e7e-4b04-5974-bd38-f2f3c033b3ab', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b1a51e7e-4b04-5974-bd38-f2f3c033b3ab', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b1a51e7e-4b04-5974-bd38-f2f3c033b3ab', '443277db-20b6-565a-9631-5811d9eb7709', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b1a51e7e-4b04-5974-bd38-f2f3c033b3ab', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b1a51e7e-4b04-5974-bd38-f2f3c033b3ab', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('83f6bc2c-aaff-5737-8894-4a5f759419aa', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('83f6bc2c-aaff-5737-8894-4a5f759419aa', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('83f6bc2c-aaff-5737-8894-4a5f759419aa', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('83f6bc2c-aaff-5737-8894-4a5f759419aa', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('83f6bc2c-aaff-5737-8894-4a5f759419aa', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('83f6bc2c-aaff-5737-8894-4a5f759419aa', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('83f6bc2c-aaff-5737-8894-4a5f759419aa', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('83f6bc2c-aaff-5737-8894-4a5f759419aa', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('83f6bc2c-aaff-5737-8894-4a5f759419aa', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('83f6bc2c-aaff-5737-8894-4a5f759419aa', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('062b8e88-5a4f-5ebf-b252-90938117518b', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('062b8e88-5a4f-5ebf-b252-90938117518b', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('062b8e88-5a4f-5ebf-b252-90938117518b', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('062b8e88-5a4f-5ebf-b252-90938117518b', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('062b8e88-5a4f-5ebf-b252-90938117518b', '6c560cd8-2c28-5f27-b734-fd5ef25f7973', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('062b8e88-5a4f-5ebf-b252-90938117518b', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('062b8e88-5a4f-5ebf-b252-90938117518b', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('062b8e88-5a4f-5ebf-b252-90938117518b', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('062b8e88-5a4f-5ebf-b252-90938117518b', 'c9ba61c6-2aa3-5751-8382-3842c003ae7f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('545ef596-5931-582b-a371-bbebba8be923', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('545ef596-5931-582b-a371-bbebba8be923', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('545ef596-5931-582b-a371-bbebba8be923', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('545ef596-5931-582b-a371-bbebba8be923', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('545ef596-5931-582b-a371-bbebba8be923', 'c9124c90-3228-5854-9349-4a98fadf37e4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('545ef596-5931-582b-a371-bbebba8be923', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('545ef596-5931-582b-a371-bbebba8be923', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('545ef596-5931-582b-a371-bbebba8be923', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('545ef596-5931-582b-a371-bbebba8be923', '443277db-20b6-565a-9631-5811d9eb7709', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('545ef596-5931-582b-a371-bbebba8be923', 'f91e7080-a872-5b93-89c1-c94f831235d8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('55901f2e-d37f-5f56-ba1e-7aa8ea335207', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('55901f2e-d37f-5f56-ba1e-7aa8ea335207', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('55901f2e-d37f-5f56-ba1e-7aa8ea335207', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('55901f2e-d37f-5f56-ba1e-7aa8ea335207', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('55901f2e-d37f-5f56-ba1e-7aa8ea335207', '9d2ffc22-13ea-592d-b031-e3ad94fca9c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('55901f2e-d37f-5f56-ba1e-7aa8ea335207', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('55901f2e-d37f-5f56-ba1e-7aa8ea335207', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7146572-ae07-5969-bb5c-35ddb7a32007', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7146572-ae07-5969-bb5c-35ddb7a32007', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7146572-ae07-5969-bb5c-35ddb7a32007', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7146572-ae07-5969-bb5c-35ddb7a32007', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7146572-ae07-5969-bb5c-35ddb7a32007', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7146572-ae07-5969-bb5c-35ddb7a32007', '9d2ffc22-13ea-592d-b031-e3ad94fca9c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7146572-ae07-5969-bb5c-35ddb7a32007', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7146572-ae07-5969-bb5c-35ddb7a32007', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7146572-ae07-5969-bb5c-35ddb7a32007', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f7abadf8-908f-5697-a083-766e103e8638', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f7abadf8-908f-5697-a083-766e103e8638', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f7abadf8-908f-5697-a083-766e103e8638', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f7abadf8-908f-5697-a083-766e103e8638', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f7abadf8-908f-5697-a083-766e103e8638', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f7abadf8-908f-5697-a083-766e103e8638', '82dfe1ff-f3d2-50f2-b507-9daa0f479602', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f7abadf8-908f-5697-a083-766e103e8638', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f7abadf8-908f-5697-a083-766e103e8638', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f7abadf8-908f-5697-a083-766e103e8638', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f7abadf8-908f-5697-a083-766e103e8638', '95004d39-21cc-5538-aa57-34c8e67448e2', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6b8753a8-4982-59a6-bef2-bfcba008d7b0', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6b8753a8-4982-59a6-bef2-bfcba008d7b0', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6b8753a8-4982-59a6-bef2-bfcba008d7b0', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6b8753a8-4982-59a6-bef2-bfcba008d7b0', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6b8753a8-4982-59a6-bef2-bfcba008d7b0', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6b8753a8-4982-59a6-bef2-bfcba008d7b0', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6b8753a8-4982-59a6-bef2-bfcba008d7b0', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6b8753a8-4982-59a6-bef2-bfcba008d7b0', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6b8753a8-4982-59a6-bef2-bfcba008d7b0', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6b8753a8-4982-59a6-bef2-bfcba008d7b0', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('698b3a78-c0ca-506f-ba06-085adac34193', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('698b3a78-c0ca-506f-ba06-085adac34193', '82dfe1ff-f3d2-50f2-b507-9daa0f479602', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('698b3a78-c0ca-506f-ba06-085adac34193', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('698b3a78-c0ca-506f-ba06-085adac34193', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('698b3a78-c0ca-506f-ba06-085adac34193', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('698b3a78-c0ca-506f-ba06-085adac34193', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('698b3a78-c0ca-506f-ba06-085adac34193', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6cdaa07d-e34d-5e9c-a228-093ceefd4f8b', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6cdaa07d-e34d-5e9c-a228-093ceefd4f8b', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6cdaa07d-e34d-5e9c-a228-093ceefd4f8b', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6cdaa07d-e34d-5e9c-a228-093ceefd4f8b', 'c9124c90-3228-5854-9349-4a98fadf37e4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6cdaa07d-e34d-5e9c-a228-093ceefd4f8b', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6cdaa07d-e34d-5e9c-a228-093ceefd4f8b', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6cdaa07d-e34d-5e9c-a228-093ceefd4f8b', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6cdaa07d-e34d-5e9c-a228-093ceefd4f8b', '443277db-20b6-565a-9631-5811d9eb7709', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6cdaa07d-e34d-5e9c-a228-093ceefd4f8b', 'f91e7080-a872-5b93-89c1-c94f831235d8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6cdaa07d-e34d-5e9c-a228-093ceefd4f8b', 'c9ba61c6-2aa3-5751-8382-3842c003ae7f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0858b3eb-c110-54ba-8d20-7b41a45b0e23', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0858b3eb-c110-54ba-8d20-7b41a45b0e23', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0858b3eb-c110-54ba-8d20-7b41a45b0e23', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0858b3eb-c110-54ba-8d20-7b41a45b0e23', 'c9124c90-3228-5854-9349-4a98fadf37e4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0858b3eb-c110-54ba-8d20-7b41a45b0e23', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0858b3eb-c110-54ba-8d20-7b41a45b0e23', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0858b3eb-c110-54ba-8d20-7b41a45b0e23', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0858b3eb-c110-54ba-8d20-7b41a45b0e23', 'c1d002c3-a8dd-58cb-8f92-79d3be907217', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0858b3eb-c110-54ba-8d20-7b41a45b0e23', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1e14f8e-407e-5432-aa42-dbf39c97e6b6', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1e14f8e-407e-5432-aa42-dbf39c97e6b6', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1e14f8e-407e-5432-aa42-dbf39c97e6b6', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1e14f8e-407e-5432-aa42-dbf39c97e6b6', '8b8d7486-1852-5d2f-8e1d-570ca202d983', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1e14f8e-407e-5432-aa42-dbf39c97e6b6', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1e14f8e-407e-5432-aa42-dbf39c97e6b6', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1e14f8e-407e-5432-aa42-dbf39c97e6b6', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1e14f8e-407e-5432-aa42-dbf39c97e6b6', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1e14f8e-407e-5432-aa42-dbf39c97e6b6', 'edc36d0c-33c7-5e72-88df-f60b7e7da2a7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('429f7516-8c2d-50b1-b1d1-253af23679c5', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('429f7516-8c2d-50b1-b1d1-253af23679c5', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('429f7516-8c2d-50b1-b1d1-253af23679c5', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('429f7516-8c2d-50b1-b1d1-253af23679c5', '9d2ffc22-13ea-592d-b031-e3ad94fca9c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('429f7516-8c2d-50b1-b1d1-253af23679c5', '26d2c1b1-1282-5633-8bd4-87261a845428', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('429f7516-8c2d-50b1-b1d1-253af23679c5', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('429f7516-8c2d-50b1-b1d1-253af23679c5', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('429f7516-8c2d-50b1-b1d1-253af23679c5', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('429f7516-8c2d-50b1-b1d1-253af23679c5', 'ba3ed360-3f69-5268-9e40-776be86997fc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2e4b7866-452d-5275-a502-1f93cd148c19', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2e4b7866-452d-5275-a502-1f93cd148c19', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2e4b7866-452d-5275-a502-1f93cd148c19', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2e4b7866-452d-5275-a502-1f93cd148c19', '8b8d7486-1852-5d2f-8e1d-570ca202d983', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2e4b7866-452d-5275-a502-1f93cd148c19', 'ba3ed360-3f69-5268-9e40-776be86997fc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2e4b7866-452d-5275-a502-1f93cd148c19', 'edc36d0c-33c7-5e72-88df-f60b7e7da2a7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2e4b7866-452d-5275-a502-1f93cd148c19', 'a58127ee-4c76-5245-afe1-5c0f2bab87b0', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9be3c9c1-c23b-5154-ba51-b8116ed5b4fe', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9be3c9c1-c23b-5154-ba51-b8116ed5b4fe', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9be3c9c1-c23b-5154-ba51-b8116ed5b4fe', '063215a2-f956-5a30-964f-e266d003acfd', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9be3c9c1-c23b-5154-ba51-b8116ed5b4fe', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9be3c9c1-c23b-5154-ba51-b8116ed5b4fe', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9be3c9c1-c23b-5154-ba51-b8116ed5b4fe', 'edc36d0c-33c7-5e72-88df-f60b7e7da2a7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9dd6bf98-70a7-5cf5-8462-2c6e14fdd8ee', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9dd6bf98-70a7-5cf5-8462-2c6e14fdd8ee', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9dd6bf98-70a7-5cf5-8462-2c6e14fdd8ee', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9dd6bf98-70a7-5cf5-8462-2c6e14fdd8ee', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9dd6bf98-70a7-5cf5-8462-2c6e14fdd8ee', '95004d39-21cc-5538-aa57-34c8e67448e2', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9dd6bf98-70a7-5cf5-8462-2c6e14fdd8ee', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9dd6bf98-70a7-5cf5-8462-2c6e14fdd8ee', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9dd6bf98-70a7-5cf5-8462-2c6e14fdd8ee', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('75ff0e35-d958-555a-a0d6-da9d7f020eae', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('75ff0e35-d958-555a-a0d6-da9d7f020eae', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('75ff0e35-d958-555a-a0d6-da9d7f020eae', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('75ff0e35-d958-555a-a0d6-da9d7f020eae', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('75ff0e35-d958-555a-a0d6-da9d7f020eae', '26d2c1b1-1282-5633-8bd4-87261a845428', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('75ff0e35-d958-555a-a0d6-da9d7f020eae', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('75ff0e35-d958-555a-a0d6-da9d7f020eae', 'ba3ed360-3f69-5268-9e40-776be86997fc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ffa69939-9f0f-5f81-b796-45a133e7bd6d', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ffa69939-9f0f-5f81-b796-45a133e7bd6d', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ffa69939-9f0f-5f81-b796-45a133e7bd6d', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ffa69939-9f0f-5f81-b796-45a133e7bd6d', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ffa69939-9f0f-5f81-b796-45a133e7bd6d', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ffa69939-9f0f-5f81-b796-45a133e7bd6d', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ffa69939-9f0f-5f81-b796-45a133e7bd6d', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ffa69939-9f0f-5f81-b796-45a133e7bd6d', 'ba3ed360-3f69-5268-9e40-776be86997fc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6b7abf03-5e4b-5df5-a88a-b90533b048df', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6b7abf03-5e4b-5df5-a88a-b90533b048df', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6b7abf03-5e4b-5df5-a88a-b90533b048df', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6b7abf03-5e4b-5df5-a88a-b90533b048df', 'ca1eb9fd-5454-5f66-b506-ebe1794d1ed7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6b7abf03-5e4b-5df5-a88a-b90533b048df', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6b7abf03-5e4b-5df5-a88a-b90533b048df', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6b7abf03-5e4b-5df5-a88a-b90533b048df', '452c056a-17d9-5f57-866f-6b9c705a27a3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6b7abf03-5e4b-5df5-a88a-b90533b048df', 'a58127ee-4c76-5245-afe1-5c0f2bab87b0', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6b7abf03-5e4b-5df5-a88a-b90533b048df', 'c9124c90-3228-5854-9349-4a98fadf37e4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0763508e-6b7f-54cf-8c90-18224cb4ace3', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0763508e-6b7f-54cf-8c90-18224cb4ace3', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0763508e-6b7f-54cf-8c90-18224cb4ace3', 'ca1eb9fd-5454-5f66-b506-ebe1794d1ed7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0763508e-6b7f-54cf-8c90-18224cb4ace3', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0763508e-6b7f-54cf-8c90-18224cb4ace3', '452c056a-17d9-5f57-866f-6b9c705a27a3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0763508e-6b7f-54cf-8c90-18224cb4ace3', '6c560cd8-2c28-5f27-b734-fd5ef25f7973', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0763508e-6b7f-54cf-8c90-18224cb4ace3', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0763508e-6b7f-54cf-8c90-18224cb4ace3', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0763508e-6b7f-54cf-8c90-18224cb4ace3', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('dcd2bdab-e40c-5b44-8a51-86265656e98f', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('dcd2bdab-e40c-5b44-8a51-86265656e98f', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('dcd2bdab-e40c-5b44-8a51-86265656e98f', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('dcd2bdab-e40c-5b44-8a51-86265656e98f', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('dcd2bdab-e40c-5b44-8a51-86265656e98f', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('dcd2bdab-e40c-5b44-8a51-86265656e98f', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('dcd2bdab-e40c-5b44-8a51-86265656e98f', '26d2c1b1-1282-5633-8bd4-87261a845428', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('dcd2bdab-e40c-5b44-8a51-86265656e98f', 'ba3ed360-3f69-5268-9e40-776be86997fc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('93d31312-4c8d-52e1-9277-7d3236bc304e', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('93d31312-4c8d-52e1-9277-7d3236bc304e', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('93d31312-4c8d-52e1-9277-7d3236bc304e', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('93d31312-4c8d-52e1-9277-7d3236bc304e', '6c560cd8-2c28-5f27-b734-fd5ef25f7973', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('93d31312-4c8d-52e1-9277-7d3236bc304e', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('93d31312-4c8d-52e1-9277-7d3236bc304e', 'ba3ed360-3f69-5268-9e40-776be86997fc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('93d31312-4c8d-52e1-9277-7d3236bc304e', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('bd1f68a2-2c02-5a96-8b86-f0814298dd48', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('bd1f68a2-2c02-5a96-8b86-f0814298dd48', 'ca1eb9fd-5454-5f66-b506-ebe1794d1ed7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('bd1f68a2-2c02-5a96-8b86-f0814298dd48', '452c056a-17d9-5f57-866f-6b9c705a27a3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('bd1f68a2-2c02-5a96-8b86-f0814298dd48', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('bd1f68a2-2c02-5a96-8b86-f0814298dd48', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('bd1f68a2-2c02-5a96-8b86-f0814298dd48', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3036ee39-72ca-5ce0-a573-25a5cf8b1f0b', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3036ee39-72ca-5ce0-a573-25a5cf8b1f0b', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3036ee39-72ca-5ce0-a573-25a5cf8b1f0b', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3036ee39-72ca-5ce0-a573-25a5cf8b1f0b', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3036ee39-72ca-5ce0-a573-25a5cf8b1f0b', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3036ee39-72ca-5ce0-a573-25a5cf8b1f0b', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3036ee39-72ca-5ce0-a573-25a5cf8b1f0b', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3036ee39-72ca-5ce0-a573-25a5cf8b1f0b', 'ba3ed360-3f69-5268-9e40-776be86997fc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('48a9c466-536d-5afb-ac32-501531979dce', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('48a9c466-536d-5afb-ac32-501531979dce', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('48a9c466-536d-5afb-ac32-501531979dce', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('48a9c466-536d-5afb-ac32-501531979dce', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('48a9c466-536d-5afb-ac32-501531979dce', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('48a9c466-536d-5afb-ac32-501531979dce', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('48a9c466-536d-5afb-ac32-501531979dce', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('48a9c466-536d-5afb-ac32-501531979dce', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('48a9c466-536d-5afb-ac32-501531979dce', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('48a9c466-536d-5afb-ac32-501531979dce', 'edc36d0c-33c7-5e72-88df-f60b7e7da2a7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ff7b5c99-eb0b-5dfd-8fbe-c76b43e307b7', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ff7b5c99-eb0b-5dfd-8fbe-c76b43e307b7', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ff7b5c99-eb0b-5dfd-8fbe-c76b43e307b7', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ff7b5c99-eb0b-5dfd-8fbe-c76b43e307b7', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ff7b5c99-eb0b-5dfd-8fbe-c76b43e307b7', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ff7b5c99-eb0b-5dfd-8fbe-c76b43e307b7', 'edc36d0c-33c7-5e72-88df-f60b7e7da2a7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5dd252b8-ee55-5c9e-ba8a-da488516551a', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5dd252b8-ee55-5c9e-ba8a-da488516551a', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5dd252b8-ee55-5c9e-ba8a-da488516551a', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5dd252b8-ee55-5c9e-ba8a-da488516551a', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5dd252b8-ee55-5c9e-ba8a-da488516551a', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5dd252b8-ee55-5c9e-ba8a-da488516551a', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5dd252b8-ee55-5c9e-ba8a-da488516551a', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5dd252b8-ee55-5c9e-ba8a-da488516551a', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('370d1dd3-f5d9-5b01-8149-cb6ec380f886', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('370d1dd3-f5d9-5b01-8149-cb6ec380f886', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('370d1dd3-f5d9-5b01-8149-cb6ec380f886', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('370d1dd3-f5d9-5b01-8149-cb6ec380f886', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('370d1dd3-f5d9-5b01-8149-cb6ec380f886', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('370d1dd3-f5d9-5b01-8149-cb6ec380f886', '452c056a-17d9-5f57-866f-6b9c705a27a3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cc03a074-9991-5532-98ae-c271a0130ebd', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cc03a074-9991-5532-98ae-c271a0130ebd', 'a58127ee-4c76-5245-afe1-5c0f2bab87b0', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cc03a074-9991-5532-98ae-c271a0130ebd', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cc03a074-9991-5532-98ae-c271a0130ebd', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cc03a074-9991-5532-98ae-c271a0130ebd', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cc03a074-9991-5532-98ae-c271a0130ebd', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c3c7c1c7-c74d-5d6d-bb8c-c241b60e937c', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c3c7c1c7-c74d-5d6d-bb8c-c241b60e937c', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c3c7c1c7-c74d-5d6d-bb8c-c241b60e937c', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c3c7c1c7-c74d-5d6d-bb8c-c241b60e937c', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c3c7c1c7-c74d-5d6d-bb8c-c241b60e937c', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c3c7c1c7-c74d-5d6d-bb8c-c241b60e937c', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c3c7c1c7-c74d-5d6d-bb8c-c241b60e937c', '452c056a-17d9-5f57-866f-6b9c705a27a3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c0f128be-3559-5535-b5ce-6ddbdfe043da', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c0f128be-3559-5535-b5ce-6ddbdfe043da', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c0f128be-3559-5535-b5ce-6ddbdfe043da', '443277db-20b6-565a-9631-5811d9eb7709', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c0f128be-3559-5535-b5ce-6ddbdfe043da', 'b1fa7c81-ad7e-50a1-87f6-b16db670c03d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c0f128be-3559-5535-b5ce-6ddbdfe043da', 'f91e7080-a872-5b93-89c1-c94f831235d8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c0f128be-3559-5535-b5ce-6ddbdfe043da', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c0f128be-3559-5535-b5ce-6ddbdfe043da', '25a0c60a-ac19-5782-b3d0-7c3660d32998', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c0f128be-3559-5535-b5ce-6ddbdfe043da', '6c560cd8-2c28-5f27-b734-fd5ef25f7973', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c0f128be-3559-5535-b5ce-6ddbdfe043da', 'c9124c90-3228-5854-9349-4a98fadf37e4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c0f128be-3559-5535-b5ce-6ddbdfe043da', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c0f128be-3559-5535-b5ce-6ddbdfe043da', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c0f128be-3559-5535-b5ce-6ddbdfe043da', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9ea623c3-283d-5ca5-87fa-65c945ae66fd', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9ea623c3-283d-5ca5-87fa-65c945ae66fd', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9ea623c3-283d-5ca5-87fa-65c945ae66fd', '443277db-20b6-565a-9631-5811d9eb7709', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9ea623c3-283d-5ca5-87fa-65c945ae66fd', 'f91e7080-a872-5b93-89c1-c94f831235d8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9ea623c3-283d-5ca5-87fa-65c945ae66fd', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9ea623c3-283d-5ca5-87fa-65c945ae66fd', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9ea623c3-283d-5ca5-87fa-65c945ae66fd', '25a0c60a-ac19-5782-b3d0-7c3660d32998', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9ea623c3-283d-5ca5-87fa-65c945ae66fd', 'c9124c90-3228-5854-9349-4a98fadf37e4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9ea623c3-283d-5ca5-87fa-65c945ae66fd', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9ea623c3-283d-5ca5-87fa-65c945ae66fd', '97a18e99-62f5-5776-8df9-3edf15e2751a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9ea623c3-283d-5ca5-87fa-65c945ae66fd', '95004d39-21cc-5538-aa57-34c8e67448e2', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9ea623c3-283d-5ca5-87fa-65c945ae66fd', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9edf34cf-dafb-5d9b-b8a9-31d9bf1a1c0f', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9edf34cf-dafb-5d9b-b8a9-31d9bf1a1c0f', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9edf34cf-dafb-5d9b-b8a9-31d9bf1a1c0f', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9edf34cf-dafb-5d9b-b8a9-31d9bf1a1c0f', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9edf34cf-dafb-5d9b-b8a9-31d9bf1a1c0f', 'ba3ed360-3f69-5268-9e40-776be86997fc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9edf34cf-dafb-5d9b-b8a9-31d9bf1a1c0f', '26d2c1b1-1282-5633-8bd4-87261a845428', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9edf34cf-dafb-5d9b-b8a9-31d9bf1a1c0f', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fc37ead8-1d4c-5f51-8ced-4597b1ba3b01', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fc37ead8-1d4c-5f51-8ced-4597b1ba3b01', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fc37ead8-1d4c-5f51-8ced-4597b1ba3b01', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fc37ead8-1d4c-5f51-8ced-4597b1ba3b01', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fc37ead8-1d4c-5f51-8ced-4597b1ba3b01', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fc37ead8-1d4c-5f51-8ced-4597b1ba3b01', 'ba3ed360-3f69-5268-9e40-776be86997fc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('51fce5ec-d4b2-5252-a23d-93c2f24314d0', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('51fce5ec-d4b2-5252-a23d-93c2f24314d0', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('51fce5ec-d4b2-5252-a23d-93c2f24314d0', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('51fce5ec-d4b2-5252-a23d-93c2f24314d0', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('51fce5ec-d4b2-5252-a23d-93c2f24314d0', '452c056a-17d9-5f57-866f-6b9c705a27a3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('51fce5ec-d4b2-5252-a23d-93c2f24314d0', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('51fce5ec-d4b2-5252-a23d-93c2f24314d0', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ec9ec34a-8b0e-5118-bdc9-6b4629b863a0', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ec9ec34a-8b0e-5118-bdc9-6b4629b863a0', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ec9ec34a-8b0e-5118-bdc9-6b4629b863a0', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ec9ec34a-8b0e-5118-bdc9-6b4629b863a0', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ec9ec34a-8b0e-5118-bdc9-6b4629b863a0', '8b8d7486-1852-5d2f-8e1d-570ca202d983', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ec9ec34a-8b0e-5118-bdc9-6b4629b863a0', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c0f373e5-f3c1-559b-98a4-45229697a3c7', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c0f373e5-f3c1-559b-98a4-45229697a3c7', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c0f373e5-f3c1-559b-98a4-45229697a3c7', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c0f373e5-f3c1-559b-98a4-45229697a3c7', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c0f373e5-f3c1-559b-98a4-45229697a3c7', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c0f373e5-f3c1-559b-98a4-45229697a3c7', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c0f373e5-f3c1-559b-98a4-45229697a3c7', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c0f373e5-f3c1-559b-98a4-45229697a3c7', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c0f373e5-f3c1-559b-98a4-45229697a3c7', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c0f373e5-f3c1-559b-98a4-45229697a3c7', 'edc36d0c-33c7-5e72-88df-f60b7e7da2a7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('43d59a81-9e1a-5871-9a42-3214d6bbe911', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('43d59a81-9e1a-5871-9a42-3214d6bbe911', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('43d59a81-9e1a-5871-9a42-3214d6bbe911', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('43d59a81-9e1a-5871-9a42-3214d6bbe911', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('43d59a81-9e1a-5871-9a42-3214d6bbe911', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('43d59a81-9e1a-5871-9a42-3214d6bbe911', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('43d59a81-9e1a-5871-9a42-3214d6bbe911', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('986e8e4a-499d-59dd-b3ed-dac2561537b7', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('986e8e4a-499d-59dd-b3ed-dac2561537b7', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('986e8e4a-499d-59dd-b3ed-dac2561537b7', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('986e8e4a-499d-59dd-b3ed-dac2561537b7', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('986e8e4a-499d-59dd-b3ed-dac2561537b7', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('986e8e4a-499d-59dd-b3ed-dac2561537b7', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('986e8e4a-499d-59dd-b3ed-dac2561537b7', '452c056a-17d9-5f57-866f-6b9c705a27a3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('986e8e4a-499d-59dd-b3ed-dac2561537b7', 'ba3ed360-3f69-5268-9e40-776be86997fc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('aa8f4318-99e9-5a5c-8c8e-1c3817eec6fd', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('aa8f4318-99e9-5a5c-8c8e-1c3817eec6fd', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('aa8f4318-99e9-5a5c-8c8e-1c3817eec6fd', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('53ac3451-dbaa-5f16-81ac-9e1b16c1289d', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('53ac3451-dbaa-5f16-81ac-9e1b16c1289d', 'c9124c90-3228-5854-9349-4a98fadf37e4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('53ac3451-dbaa-5f16-81ac-9e1b16c1289d', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('53ac3451-dbaa-5f16-81ac-9e1b16c1289d', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('53ac3451-dbaa-5f16-81ac-9e1b16c1289d', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('53ac3451-dbaa-5f16-81ac-9e1b16c1289d', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('53ac3451-dbaa-5f16-81ac-9e1b16c1289d', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('062485f3-e58c-58d4-8deb-11ad2b7ef96d', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('062485f3-e58c-58d4-8deb-11ad2b7ef96d', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('062485f3-e58c-58d4-8deb-11ad2b7ef96d', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('062485f3-e58c-58d4-8deb-11ad2b7ef96d', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('062485f3-e58c-58d4-8deb-11ad2b7ef96d', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('062485f3-e58c-58d4-8deb-11ad2b7ef96d', 'c9124c90-3228-5854-9349-4a98fadf37e4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('062485f3-e58c-58d4-8deb-11ad2b7ef96d', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ef5caf98-36bc-521c-ab7b-0536003a9d12', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ef5caf98-36bc-521c-ab7b-0536003a9d12', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ef5caf98-36bc-521c-ab7b-0536003a9d12', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ef5caf98-36bc-521c-ab7b-0536003a9d12', '8b8d7486-1852-5d2f-8e1d-570ca202d983', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ef5caf98-36bc-521c-ab7b-0536003a9d12', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ef5caf98-36bc-521c-ab7b-0536003a9d12', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ef5caf98-36bc-521c-ab7b-0536003a9d12', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ef5caf98-36bc-521c-ab7b-0536003a9d12', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c017ba8c-abc7-59f0-9efb-16a5557a479c', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c017ba8c-abc7-59f0-9efb-16a5557a479c', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c017ba8c-abc7-59f0-9efb-16a5557a479c', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c017ba8c-abc7-59f0-9efb-16a5557a479c', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c017ba8c-abc7-59f0-9efb-16a5557a479c', 'ba3ed360-3f69-5268-9e40-776be86997fc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('45400459-dc1e-5bb5-bf01-2b496d75340b', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('45400459-dc1e-5bb5-bf01-2b496d75340b', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('45400459-dc1e-5bb5-bf01-2b496d75340b', '9d2ffc22-13ea-592d-b031-e3ad94fca9c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('45400459-dc1e-5bb5-bf01-2b496d75340b', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('45400459-dc1e-5bb5-bf01-2b496d75340b', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('45400459-dc1e-5bb5-bf01-2b496d75340b', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('45400459-dc1e-5bb5-bf01-2b496d75340b', 'ba3ed360-3f69-5268-9e40-776be86997fc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('45400459-dc1e-5bb5-bf01-2b496d75340b', 'a58127ee-4c76-5245-afe1-5c0f2bab87b0', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ff104b50-2c1a-598a-8c47-59b435516b7e', 'ca1eb9fd-5454-5f66-b506-ebe1794d1ed7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ff104b50-2c1a-598a-8c47-59b435516b7e', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ff104b50-2c1a-598a-8c47-59b435516b7e', '452c056a-17d9-5f57-866f-6b9c705a27a3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ff104b50-2c1a-598a-8c47-59b435516b7e', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ff104b50-2c1a-598a-8c47-59b435516b7e', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0f102f7-815d-5941-956e-0fc63290190b', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0f102f7-815d-5941-956e-0fc63290190b', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0f102f7-815d-5941-956e-0fc63290190b', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0f102f7-815d-5941-956e-0fc63290190b', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0f102f7-815d-5941-956e-0fc63290190b', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0f102f7-815d-5941-956e-0fc63290190b', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0f102f7-815d-5941-956e-0fc63290190b', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0f102f7-815d-5941-956e-0fc63290190b', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0f102f7-815d-5941-956e-0fc63290190b', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0f102f7-815d-5941-956e-0fc63290190b', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0f102f7-815d-5941-956e-0fc63290190b', 'edc36d0c-33c7-5e72-88df-f60b7e7da2a7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3378ae52-7861-538f-80ea-7731c6560d88', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3378ae52-7861-538f-80ea-7731c6560d88', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3378ae52-7861-538f-80ea-7731c6560d88', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3378ae52-7861-538f-80ea-7731c6560d88', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3378ae52-7861-538f-80ea-7731c6560d88', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3378ae52-7861-538f-80ea-7731c6560d88', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3378ae52-7861-538f-80ea-7731c6560d88', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3378ae52-7861-538f-80ea-7731c6560d88', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3378ae52-7861-538f-80ea-7731c6560d88', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3378ae52-7861-538f-80ea-7731c6560d88', 'c9ba61c6-2aa3-5751-8382-3842c003ae7f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3378ae52-7861-538f-80ea-7731c6560d88', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3378ae52-7861-538f-80ea-7731c6560d88', 'edc36d0c-33c7-5e72-88df-f60b7e7da2a7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1800ceef-ada5-57a5-b4fa-2ffa205f3632', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1800ceef-ada5-57a5-b4fa-2ffa205f3632', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1800ceef-ada5-57a5-b4fa-2ffa205f3632', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1800ceef-ada5-57a5-b4fa-2ffa205f3632', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1800ceef-ada5-57a5-b4fa-2ffa205f3632', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1800ceef-ada5-57a5-b4fa-2ffa205f3632', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1800ceef-ada5-57a5-b4fa-2ffa205f3632', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1800ceef-ada5-57a5-b4fa-2ffa205f3632', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1800ceef-ada5-57a5-b4fa-2ffa205f3632', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1800ceef-ada5-57a5-b4fa-2ffa205f3632', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1800ceef-ada5-57a5-b4fa-2ffa205f3632', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1800ceef-ada5-57a5-b4fa-2ffa205f3632', 'edc36d0c-33c7-5e72-88df-f60b7e7da2a7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b8790b8c-e810-5292-b361-336e4e7a34e1', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b8790b8c-e810-5292-b361-336e4e7a34e1', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b8790b8c-e810-5292-b361-336e4e7a34e1', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b8790b8c-e810-5292-b361-336e4e7a34e1', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b8790b8c-e810-5292-b361-336e4e7a34e1', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b8790b8c-e810-5292-b361-336e4e7a34e1', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b8790b8c-e810-5292-b361-336e4e7a34e1', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b8790b8c-e810-5292-b361-336e4e7a34e1', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b8790b8c-e810-5292-b361-336e4e7a34e1', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b8790b8c-e810-5292-b361-336e4e7a34e1', 'edc36d0c-33c7-5e72-88df-f60b7e7da2a7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('00e162ec-62d8-5e39-9d68-7d039856a4bb', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('00e162ec-62d8-5e39-9d68-7d039856a4bb', 'ca1eb9fd-5454-5f66-b506-ebe1794d1ed7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('00e162ec-62d8-5e39-9d68-7d039856a4bb', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('00e162ec-62d8-5e39-9d68-7d039856a4bb', '452c056a-17d9-5f57-866f-6b9c705a27a3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('00e162ec-62d8-5e39-9d68-7d039856a4bb', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('00e162ec-62d8-5e39-9d68-7d039856a4bb', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('00e162ec-62d8-5e39-9d68-7d039856a4bb', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('00e162ec-62d8-5e39-9d68-7d039856a4bb', '25a0c60a-ac19-5782-b3d0-7c3660d32998', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('00e162ec-62d8-5e39-9d68-7d039856a4bb', 'edc36d0c-33c7-5e72-88df-f60b7e7da2a7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('96f85ef7-5af2-59d6-ae98-ba8634d77d92', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('96f85ef7-5af2-59d6-ae98-ba8634d77d92', '95004d39-21cc-5538-aa57-34c8e67448e2', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('96f85ef7-5af2-59d6-ae98-ba8634d77d92', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('96f85ef7-5af2-59d6-ae98-ba8634d77d92', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('96f85ef7-5af2-59d6-ae98-ba8634d77d92', '97a18e99-62f5-5776-8df9-3edf15e2751a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('96f85ef7-5af2-59d6-ae98-ba8634d77d92', 'edc36d0c-33c7-5e72-88df-f60b7e7da2a7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('96f85ef7-5af2-59d6-ae98-ba8634d77d92', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1e56670-290e-5c0a-ac15-c1e6a2c90842', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1e56670-290e-5c0a-ac15-c1e6a2c90842', '95004d39-21cc-5538-aa57-34c8e67448e2', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1e56670-290e-5c0a-ac15-c1e6a2c90842', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1e56670-290e-5c0a-ac15-c1e6a2c90842', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1e56670-290e-5c0a-ac15-c1e6a2c90842', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1e56670-290e-5c0a-ac15-c1e6a2c90842', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1e56670-290e-5c0a-ac15-c1e6a2c90842', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1e56670-290e-5c0a-ac15-c1e6a2c90842', 'edc36d0c-33c7-5e72-88df-f60b7e7da2a7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6013a6e7-edec-5589-8f41-cf63bfd6dc47', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6013a6e7-edec-5589-8f41-cf63bfd6dc47', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6013a6e7-edec-5589-8f41-cf63bfd6dc47', 'ab2a7a6c-cb46-5205-934d-3a2d2197907f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6013a6e7-edec-5589-8f41-cf63bfd6dc47', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6013a6e7-edec-5589-8f41-cf63bfd6dc47', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6013a6e7-edec-5589-8f41-cf63bfd6dc47', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6013a6e7-edec-5589-8f41-cf63bfd6dc47', '063215a2-f956-5a30-964f-e266d003acfd', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6013a6e7-edec-5589-8f41-cf63bfd6dc47', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6013a6e7-edec-5589-8f41-cf63bfd6dc47', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3547d52f-44c8-56c3-ac90-5a1ec1b3b299', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3547d52f-44c8-56c3-ac90-5a1ec1b3b299', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3547d52f-44c8-56c3-ac90-5a1ec1b3b299', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3547d52f-44c8-56c3-ac90-5a1ec1b3b299', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3547d52f-44c8-56c3-ac90-5a1ec1b3b299', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3547d52f-44c8-56c3-ac90-5a1ec1b3b299', 'c9124c90-3228-5854-9349-4a98fadf37e4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3547d52f-44c8-56c3-ac90-5a1ec1b3b299', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3547d52f-44c8-56c3-ac90-5a1ec1b3b299', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3547d52f-44c8-56c3-ac90-5a1ec1b3b299', '25a0c60a-ac19-5782-b3d0-7c3660d32998', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3547d52f-44c8-56c3-ac90-5a1ec1b3b299', 'edc36d0c-33c7-5e72-88df-f60b7e7da2a7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('05f02483-2424-569f-9bc8-4350ce999fd7', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('05f02483-2424-569f-9bc8-4350ce999fd7', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('05f02483-2424-569f-9bc8-4350ce999fd7', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('05f02483-2424-569f-9bc8-4350ce999fd7', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('05f02483-2424-569f-9bc8-4350ce999fd7', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('05f02483-2424-569f-9bc8-4350ce999fd7', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('05f02483-2424-569f-9bc8-4350ce999fd7', 'edc36d0c-33c7-5e72-88df-f60b7e7da2a7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9221005c-58c7-560d-a560-d39d57944c9e', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9221005c-58c7-560d-a560-d39d57944c9e', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9221005c-58c7-560d-a560-d39d57944c9e', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9221005c-58c7-560d-a560-d39d57944c9e', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9221005c-58c7-560d-a560-d39d57944c9e', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9221005c-58c7-560d-a560-d39d57944c9e', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9221005c-58c7-560d-a560-d39d57944c9e', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9221005c-58c7-560d-a560-d39d57944c9e', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9221005c-58c7-560d-a560-d39d57944c9e', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9221005c-58c7-560d-a560-d39d57944c9e', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9221005c-58c7-560d-a560-d39d57944c9e', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('33c3f308-5270-560f-bf72-8c9845d10b32', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('33c3f308-5270-560f-bf72-8c9845d10b32', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('33c3f308-5270-560f-bf72-8c9845d10b32', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('33c3f308-5270-560f-bf72-8c9845d10b32', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('33c3f308-5270-560f-bf72-8c9845d10b32', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('33c3f308-5270-560f-bf72-8c9845d10b32', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('33c3f308-5270-560f-bf72-8c9845d10b32', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('33c3f308-5270-560f-bf72-8c9845d10b32', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('33c3f308-5270-560f-bf72-8c9845d10b32', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('33c3f308-5270-560f-bf72-8c9845d10b32', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('33c3f308-5270-560f-bf72-8c9845d10b32', 'ba3ed360-3f69-5268-9e40-776be86997fc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1183b07-c363-5d4d-8153-41bc56b066ac', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1183b07-c363-5d4d-8153-41bc56b066ac', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1183b07-c363-5d4d-8153-41bc56b066ac', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1183b07-c363-5d4d-8153-41bc56b066ac', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1183b07-c363-5d4d-8153-41bc56b066ac', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1183b07-c363-5d4d-8153-41bc56b066ac', 'ca1eb9fd-5454-5f66-b506-ebe1794d1ed7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1183b07-c363-5d4d-8153-41bc56b066ac', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1183b07-c363-5d4d-8153-41bc56b066ac', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e1183b07-c363-5d4d-8153-41bc56b066ac', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('be22248a-6fa8-5778-9019-cb7810ffe886', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('be22248a-6fa8-5778-9019-cb7810ffe886', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('be22248a-6fa8-5778-9019-cb7810ffe886', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('be22248a-6fa8-5778-9019-cb7810ffe886', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('be22248a-6fa8-5778-9019-cb7810ffe886', '95004d39-21cc-5538-aa57-34c8e67448e2', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('be22248a-6fa8-5778-9019-cb7810ffe886', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('be22248a-6fa8-5778-9019-cb7810ffe886', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('be22248a-6fa8-5778-9019-cb7810ffe886', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('be22248a-6fa8-5778-9019-cb7810ffe886', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('be22248a-6fa8-5778-9019-cb7810ffe886', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('be22248a-6fa8-5778-9019-cb7810ffe886', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d77a44e7-e4f9-5505-865c-b742c2e157c9', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d77a44e7-e4f9-5505-865c-b742c2e157c9', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d77a44e7-e4f9-5505-865c-b742c2e157c9', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d77a44e7-e4f9-5505-865c-b742c2e157c9', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d77a44e7-e4f9-5505-865c-b742c2e157c9', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d77a44e7-e4f9-5505-865c-b742c2e157c9', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d77a44e7-e4f9-5505-865c-b742c2e157c9', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d77a44e7-e4f9-5505-865c-b742c2e157c9', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d77a44e7-e4f9-5505-865c-b742c2e157c9', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d77a44e7-e4f9-5505-865c-b742c2e157c9', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d77a44e7-e4f9-5505-865c-b742c2e157c9', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('04c5b9f3-4346-5c6a-99f6-eb189b05ef75', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('04c5b9f3-4346-5c6a-99f6-eb189b05ef75', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('04c5b9f3-4346-5c6a-99f6-eb189b05ef75', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('04c5b9f3-4346-5c6a-99f6-eb189b05ef75', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('04c5b9f3-4346-5c6a-99f6-eb189b05ef75', '9d2ffc22-13ea-592d-b031-e3ad94fca9c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('04c5b9f3-4346-5c6a-99f6-eb189b05ef75', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('04c5b9f3-4346-5c6a-99f6-eb189b05ef75', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('04c5b9f3-4346-5c6a-99f6-eb189b05ef75', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('04c5b9f3-4346-5c6a-99f6-eb189b05ef75', '26d2c1b1-1282-5633-8bd4-87261a845428', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('700f3125-511e-5762-8b49-5eb74d3eac43', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('700f3125-511e-5762-8b49-5eb74d3eac43', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('700f3125-511e-5762-8b49-5eb74d3eac43', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('700f3125-511e-5762-8b49-5eb74d3eac43', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('700f3125-511e-5762-8b49-5eb74d3eac43', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('700f3125-511e-5762-8b49-5eb74d3eac43', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('700f3125-511e-5762-8b49-5eb74d3eac43', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('700f3125-511e-5762-8b49-5eb74d3eac43', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a6e6fb57-e265-55f6-ab90-8dc9c0e0a9df', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a6e6fb57-e265-55f6-ab90-8dc9c0e0a9df', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a6e6fb57-e265-55f6-ab90-8dc9c0e0a9df', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a6e6fb57-e265-55f6-ab90-8dc9c0e0a9df', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a6e6fb57-e265-55f6-ab90-8dc9c0e0a9df', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a6e6fb57-e265-55f6-ab90-8dc9c0e0a9df', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a6e6fb57-e265-55f6-ab90-8dc9c0e0a9df', '08cb0212-a37f-5066-8a6e-3ba1458a8617', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a6e6fb57-e265-55f6-ab90-8dc9c0e0a9df', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a6e6fb57-e265-55f6-ab90-8dc9c0e0a9df', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cbc9793f-be13-5f07-b615-899a23241ecc', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cbc9793f-be13-5f07-b615-899a23241ecc', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cbc9793f-be13-5f07-b615-899a23241ecc', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cbc9793f-be13-5f07-b615-899a23241ecc', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cbc9793f-be13-5f07-b615-899a23241ecc', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cbc9793f-be13-5f07-b615-899a23241ecc', 'c9124c90-3228-5854-9349-4a98fadf37e4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cbc9793f-be13-5f07-b615-899a23241ecc', 'f91e7080-a872-5b93-89c1-c94f831235d8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cbc9793f-be13-5f07-b615-899a23241ecc', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7e66c189-f3e1-5ce2-a6b9-f6bbb4ac28d8', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7e66c189-f3e1-5ce2-a6b9-f6bbb4ac28d8', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7e66c189-f3e1-5ce2-a6b9-f6bbb4ac28d8', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7e66c189-f3e1-5ce2-a6b9-f6bbb4ac28d8', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7e66c189-f3e1-5ce2-a6b9-f6bbb4ac28d8', 'c9124c90-3228-5854-9349-4a98fadf37e4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7e66c189-f3e1-5ce2-a6b9-f6bbb4ac28d8', 'f91e7080-a872-5b93-89c1-c94f831235d8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7e66c189-f3e1-5ce2-a6b9-f6bbb4ac28d8', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('458e6a49-0ca5-5b0b-9303-149872a744f6', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('458e6a49-0ca5-5b0b-9303-149872a744f6', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('458e6a49-0ca5-5b0b-9303-149872a744f6', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b896f86e-e81a-5a90-b8fc-5313e6b6e602', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b896f86e-e81a-5a90-b8fc-5313e6b6e602', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b896f86e-e81a-5a90-b8fc-5313e6b6e602', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b896f86e-e81a-5a90-b8fc-5313e6b6e602', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b896f86e-e81a-5a90-b8fc-5313e6b6e602', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b896f86e-e81a-5a90-b8fc-5313e6b6e602', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b896f86e-e81a-5a90-b8fc-5313e6b6e602', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1ba463f2-e397-5a1d-acda-a1056a9f9d56', '82dfe1ff-f3d2-50f2-b507-9daa0f479602', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1ba463f2-e397-5a1d-acda-a1056a9f9d56', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f853957a-2475-5090-b120-d7503b385156', 'ca1eb9fd-5454-5f66-b506-ebe1794d1ed7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f853957a-2475-5090-b120-d7503b385156', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f853957a-2475-5090-b120-d7503b385156', '452c056a-17d9-5f57-866f-6b9c705a27a3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f853957a-2475-5090-b120-d7503b385156', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9cc6b68a-f5ce-525c-bf20-317bd597133c', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9cc6b68a-f5ce-525c-bf20-317bd597133c', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9cc6b68a-f5ce-525c-bf20-317bd597133c', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('786fcc4b-3735-543e-9b3c-06d5aafb3125', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('786fcc4b-3735-543e-9b3c-06d5aafb3125', '95004d39-21cc-5538-aa57-34c8e67448e2', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('786fcc4b-3735-543e-9b3c-06d5aafb3125', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('786fcc4b-3735-543e-9b3c-06d5aafb3125', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('500d6c73-65f1-541f-a35d-ff7d59284b24', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('500d6c73-65f1-541f-a35d-ff7d59284b24', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('500d6c73-65f1-541f-a35d-ff7d59284b24', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('500d6c73-65f1-541f-a35d-ff7d59284b24', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('500d6c73-65f1-541f-a35d-ff7d59284b24', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('500d6c73-65f1-541f-a35d-ff7d59284b24', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('dfd014c1-b32f-5d9b-ad40-2684e603daa2', '8b8d7486-1852-5d2f-8e1d-570ca202d983', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('dfd014c1-b32f-5d9b-ad40-2684e603daa2', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('dfd014c1-b32f-5d9b-ad40-2684e603daa2', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('dfd014c1-b32f-5d9b-ad40-2684e603daa2', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('dfd014c1-b32f-5d9b-ad40-2684e603daa2', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('dfd014c1-b32f-5d9b-ad40-2684e603daa2', '95004d39-21cc-5538-aa57-34c8e67448e2', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('dfd014c1-b32f-5d9b-ad40-2684e603daa2', '063215a2-f956-5a30-964f-e266d003acfd', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ba801d9a-23f7-5bd1-92d7-869fa65efd91', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ba801d9a-23f7-5bd1-92d7-869fa65efd91', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ba801d9a-23f7-5bd1-92d7-869fa65efd91', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ba801d9a-23f7-5bd1-92d7-869fa65efd91', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ba801d9a-23f7-5bd1-92d7-869fa65efd91', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6d762eba-3960-56c0-8ea4-185617166a7c', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6d762eba-3960-56c0-8ea4-185617166a7c', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6d762eba-3960-56c0-8ea4-185617166a7c', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6d762eba-3960-56c0-8ea4-185617166a7c', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6d762eba-3960-56c0-8ea4-185617166a7c', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e4115751-6103-5468-9291-4414f8c9de74', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e4115751-6103-5468-9291-4414f8c9de74', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e4115751-6103-5468-9291-4414f8c9de74', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e4115751-6103-5468-9291-4414f8c9de74', '6c560cd8-2c28-5f27-b734-fd5ef25f7973', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e4115751-6103-5468-9291-4414f8c9de74', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('13833fc2-6c0d-562f-af6f-c7ff2502b377', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('13833fc2-6c0d-562f-af6f-c7ff2502b377', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('13833fc2-6c0d-562f-af6f-c7ff2502b377', 'ca1eb9fd-5454-5f66-b506-ebe1794d1ed7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('13833fc2-6c0d-562f-af6f-c7ff2502b377', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('aaeb7dd6-da12-5b1f-8693-45d5b5aa56e3', '08cb0212-a37f-5066-8a6e-3ba1458a8617', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('aaeb7dd6-da12-5b1f-8693-45d5b5aa56e3', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('aaeb7dd6-da12-5b1f-8693-45d5b5aa56e3', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('aaeb7dd6-da12-5b1f-8693-45d5b5aa56e3', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('aaeb7dd6-da12-5b1f-8693-45d5b5aa56e3', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('13df5882-99b4-57ea-88d4-26f0a6486ca3', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('13df5882-99b4-57ea-88d4-26f0a6486ca3', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f4cd2973-84e9-53ec-ab07-3036c7b66b3a', 'ca1eb9fd-5454-5f66-b506-ebe1794d1ed7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f4cd2973-84e9-53ec-ab07-3036c7b66b3a', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f4cd2973-84e9-53ec-ab07-3036c7b66b3a', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f4cd2973-84e9-53ec-ab07-3036c7b66b3a', '452c056a-17d9-5f57-866f-6b9c705a27a3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('16d4779b-9efb-5dd6-99c6-79372e8f6ccc', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('16d4779b-9efb-5dd6-99c6-79372e8f6ccc', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('16d4779b-9efb-5dd6-99c6-79372e8f6ccc', '95004d39-21cc-5538-aa57-34c8e67448e2', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('16d4779b-9efb-5dd6-99c6-79372e8f6ccc', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9ec0b2dc-1345-502f-a247-599b2c121a5e', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9ec0b2dc-1345-502f-a247-599b2c121a5e', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9ec0b2dc-1345-502f-a247-599b2c121a5e', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9ec0b2dc-1345-502f-a247-599b2c121a5e', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9ec0b2dc-1345-502f-a247-599b2c121a5e', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9ec0b2dc-1345-502f-a247-599b2c121a5e', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e8d07c71-2ed6-5eaf-b59e-c511b8173e2c', '8b8d7486-1852-5d2f-8e1d-570ca202d983', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e8d07c71-2ed6-5eaf-b59e-c511b8173e2c', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e8d07c71-2ed6-5eaf-b59e-c511b8173e2c', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e8d07c71-2ed6-5eaf-b59e-c511b8173e2c', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('89253193-9bce-52ca-b282-1f0596bf9d6d', 'ca1eb9fd-5454-5f66-b506-ebe1794d1ed7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('89253193-9bce-52ca-b282-1f0596bf9d6d', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('89253193-9bce-52ca-b282-1f0596bf9d6d', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('89253193-9bce-52ca-b282-1f0596bf9d6d', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('89253193-9bce-52ca-b282-1f0596bf9d6d', '9d2ffc22-13ea-592d-b031-e3ad94fca9c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03b8ce99-9776-53d5-9144-318e1e7c9247', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03b8ce99-9776-53d5-9144-318e1e7c9247', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03b8ce99-9776-53d5-9144-318e1e7c9247', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03b8ce99-9776-53d5-9144-318e1e7c9247', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03b8ce99-9776-53d5-9144-318e1e7c9247', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03b8ce99-9776-53d5-9144-318e1e7c9247', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03b8ce99-9776-53d5-9144-318e1e7c9247', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03b8ce99-9776-53d5-9144-318e1e7c9247', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03b8ce99-9776-53d5-9144-318e1e7c9247', 'a58127ee-4c76-5245-afe1-5c0f2bab87b0', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03b8ce99-9776-53d5-9144-318e1e7c9247', 'c9124c90-3228-5854-9349-4a98fadf37e4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03b8ce99-9776-53d5-9144-318e1e7c9247', '82dfe1ff-f3d2-50f2-b507-9daa0f479602', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03b8ce99-9776-53d5-9144-318e1e7c9247', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0ec880f-5d56-588d-b05e-828cef6ce5a3', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0ec880f-5d56-588d-b05e-828cef6ce5a3', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0ec880f-5d56-588d-b05e-828cef6ce5a3', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0ec880f-5d56-588d-b05e-828cef6ce5a3', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0ec880f-5d56-588d-b05e-828cef6ce5a3', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0ec880f-5d56-588d-b05e-828cef6ce5a3', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0ec880f-5d56-588d-b05e-828cef6ce5a3', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0ec880f-5d56-588d-b05e-828cef6ce5a3', 'a58127ee-4c76-5245-afe1-5c0f2bab87b0', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0ec880f-5d56-588d-b05e-828cef6ce5a3', '82dfe1ff-f3d2-50f2-b507-9daa0f479602', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0ec880f-5d56-588d-b05e-828cef6ce5a3', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0ec880f-5d56-588d-b05e-828cef6ce5a3', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03b41501-c877-5f37-bd6a-cb01d2c01ea1', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03b41501-c877-5f37-bd6a-cb01d2c01ea1', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03b41501-c877-5f37-bd6a-cb01d2c01ea1', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03b41501-c877-5f37-bd6a-cb01d2c01ea1', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03b41501-c877-5f37-bd6a-cb01d2c01ea1', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03b41501-c877-5f37-bd6a-cb01d2c01ea1', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03b41501-c877-5f37-bd6a-cb01d2c01ea1', 'a58127ee-4c76-5245-afe1-5c0f2bab87b0', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03b41501-c877-5f37-bd6a-cb01d2c01ea1', 'ca1eb9fd-5454-5f66-b506-ebe1794d1ed7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03b41501-c877-5f37-bd6a-cb01d2c01ea1', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('993b0b5e-0a9b-5072-80f4-12daf3e4fb25', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('993b0b5e-0a9b-5072-80f4-12daf3e4fb25', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('993b0b5e-0a9b-5072-80f4-12daf3e4fb25', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('993b0b5e-0a9b-5072-80f4-12daf3e4fb25', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('993b0b5e-0a9b-5072-80f4-12daf3e4fb25', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('993b0b5e-0a9b-5072-80f4-12daf3e4fb25', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('993b0b5e-0a9b-5072-80f4-12daf3e4fb25', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('993b0b5e-0a9b-5072-80f4-12daf3e4fb25', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('504f80d6-4ab7-5391-9871-441d665e5eb0', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('504f80d6-4ab7-5391-9871-441d665e5eb0', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('504f80d6-4ab7-5391-9871-441d665e5eb0', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('504f80d6-4ab7-5391-9871-441d665e5eb0', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('504f80d6-4ab7-5391-9871-441d665e5eb0', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('504f80d6-4ab7-5391-9871-441d665e5eb0', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('504f80d6-4ab7-5391-9871-441d665e5eb0', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('504f80d6-4ab7-5391-9871-441d665e5eb0', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9f7fd9e2-f9f3-53b5-94ae-961e0d793a3d', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9f7fd9e2-f9f3-53b5-94ae-961e0d793a3d', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9f7fd9e2-f9f3-53b5-94ae-961e0d793a3d', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9f7fd9e2-f9f3-53b5-94ae-961e0d793a3d', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9f7fd9e2-f9f3-53b5-94ae-961e0d793a3d', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9f7fd9e2-f9f3-53b5-94ae-961e0d793a3d', 'ca1eb9fd-5454-5f66-b506-ebe1794d1ed7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9f7fd9e2-f9f3-53b5-94ae-961e0d793a3d', '6c560cd8-2c28-5f27-b734-fd5ef25f7973', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9f7fd9e2-f9f3-53b5-94ae-961e0d793a3d', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9f7fd9e2-f9f3-53b5-94ae-961e0d793a3d', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9f7fd9e2-f9f3-53b5-94ae-961e0d793a3d', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9f7fd9e2-f9f3-53b5-94ae-961e0d793a3d', 'ed20b7f2-2285-5b88-95bb-ca60b245758c', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9f7fd9e2-f9f3-53b5-94ae-961e0d793a3d', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9f7fd9e2-f9f3-53b5-94ae-961e0d793a3d', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('89ca4c0b-053d-5b1c-80ca-16ec8bcc0b46', 'ca1eb9fd-5454-5f66-b506-ebe1794d1ed7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('89ca4c0b-053d-5b1c-80ca-16ec8bcc0b46', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('89ca4c0b-053d-5b1c-80ca-16ec8bcc0b46', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('89ca4c0b-053d-5b1c-80ca-16ec8bcc0b46', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('89ca4c0b-053d-5b1c-80ca-16ec8bcc0b46', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('89ca4c0b-053d-5b1c-80ca-16ec8bcc0b46', '9d2ffc22-13ea-592d-b031-e3ad94fca9c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('89ca4c0b-053d-5b1c-80ca-16ec8bcc0b46', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b220e857-d587-5771-aafe-cc0515dccb5c', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b220e857-d587-5771-aafe-cc0515dccb5c', '9d2ffc22-13ea-592d-b031-e3ad94fca9c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b220e857-d587-5771-aafe-cc0515dccb5c', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b220e857-d587-5771-aafe-cc0515dccb5c', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b220e857-d587-5771-aafe-cc0515dccb5c', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b220e857-d587-5771-aafe-cc0515dccb5c', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b220e857-d587-5771-aafe-cc0515dccb5c', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b220e857-d587-5771-aafe-cc0515dccb5c', '8b8d7486-1852-5d2f-8e1d-570ca202d983', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b220e857-d587-5771-aafe-cc0515dccb5c', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b220e857-d587-5771-aafe-cc0515dccb5c', 'ba3ed360-3f69-5268-9e40-776be86997fc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b220e857-d587-5771-aafe-cc0515dccb5c', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b220e857-d587-5771-aafe-cc0515dccb5c', '26d2c1b1-1282-5633-8bd4-87261a845428', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7f05d383-ff60-56db-9bb0-567bc9c22628', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7f05d383-ff60-56db-9bb0-567bc9c22628', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7f05d383-ff60-56db-9bb0-567bc9c22628', '443277db-20b6-565a-9631-5811d9eb7709', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7f05d383-ff60-56db-9bb0-567bc9c22628', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7f05d383-ff60-56db-9bb0-567bc9c22628', '6c560cd8-2c28-5f27-b734-fd5ef25f7973', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7f05d383-ff60-56db-9bb0-567bc9c22628', 'c9124c90-3228-5854-9349-4a98fadf37e4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7f05d383-ff60-56db-9bb0-567bc9c22628', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7f05d383-ff60-56db-9bb0-567bc9c22628', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7f05d383-ff60-56db-9bb0-567bc9c22628', '25a0c60a-ac19-5782-b3d0-7c3660d32998', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7f05d383-ff60-56db-9bb0-567bc9c22628', 'c9ba61c6-2aa3-5751-8382-3842c003ae7f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7f05d383-ff60-56db-9bb0-567bc9c22628', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7f05d383-ff60-56db-9bb0-567bc9c22628', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7f05d383-ff60-56db-9bb0-567bc9c22628', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7f05d383-ff60-56db-9bb0-567bc9c22628', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('25dab590-d20e-5309-9f9b-c8541d279f62', '95004d39-21cc-5538-aa57-34c8e67448e2', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('25dab590-d20e-5309-9f9b-c8541d279f62', '97a18e99-62f5-5776-8df9-3edf15e2751a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('25dab590-d20e-5309-9f9b-c8541d279f62', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('25dab590-d20e-5309-9f9b-c8541d279f62', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('25dab590-d20e-5309-9f9b-c8541d279f62', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('25dab590-d20e-5309-9f9b-c8541d279f62', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('25dab590-d20e-5309-9f9b-c8541d279f62', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('25dab590-d20e-5309-9f9b-c8541d279f62', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('25dab590-d20e-5309-9f9b-c8541d279f62', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('25dab590-d20e-5309-9f9b-c8541d279f62', '82dfe1ff-f3d2-50f2-b507-9daa0f479602', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('25dab590-d20e-5309-9f9b-c8541d279f62', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a9374658-2f64-5779-b559-ea9975e1bc82', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a9374658-2f64-5779-b559-ea9975e1bc82', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a9374658-2f64-5779-b559-ea9975e1bc82', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a9374658-2f64-5779-b559-ea9975e1bc82', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a9374658-2f64-5779-b559-ea9975e1bc82', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a9374658-2f64-5779-b559-ea9975e1bc82', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a9374658-2f64-5779-b559-ea9975e1bc82', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a9374658-2f64-5779-b559-ea9975e1bc82', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a9374658-2f64-5779-b559-ea9975e1bc82', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a9374658-2f64-5779-b559-ea9975e1bc82', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5a46d9e3-933f-536b-9ebe-384da155547a', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5a46d9e3-933f-536b-9ebe-384da155547a', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5a46d9e3-933f-536b-9ebe-384da155547a', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5a46d9e3-933f-536b-9ebe-384da155547a', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5a46d9e3-933f-536b-9ebe-384da155547a', '26d2c1b1-1282-5633-8bd4-87261a845428', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5a46d9e3-933f-536b-9ebe-384da155547a', '23971cbc-63d1-5739-8e93-5978b40e6bcc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('786aecf0-c66e-5a80-bfe4-278d676d7005', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('786aecf0-c66e-5a80-bfe4-278d676d7005', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('786aecf0-c66e-5a80-bfe4-278d676d7005', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('786aecf0-c66e-5a80-bfe4-278d676d7005', '9d2ffc22-13ea-592d-b031-e3ad94fca9c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('786aecf0-c66e-5a80-bfe4-278d676d7005', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('786aecf0-c66e-5a80-bfe4-278d676d7005', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('786aecf0-c66e-5a80-bfe4-278d676d7005', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('786aecf0-c66e-5a80-bfe4-278d676d7005', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('786aecf0-c66e-5a80-bfe4-278d676d7005', 'ba3ed360-3f69-5268-9e40-776be86997fc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('786aecf0-c66e-5a80-bfe4-278d676d7005', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5bb434ed-0710-5673-8158-94267f95aa37', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5bb434ed-0710-5673-8158-94267f95aa37', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5bb434ed-0710-5673-8158-94267f95aa37', 'ba3ed360-3f69-5268-9e40-776be86997fc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5bb434ed-0710-5673-8158-94267f95aa37', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5bb434ed-0710-5673-8158-94267f95aa37', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5bb434ed-0710-5673-8158-94267f95aa37', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5bb434ed-0710-5673-8158-94267f95aa37', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5bb434ed-0710-5673-8158-94267f95aa37', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5bb434ed-0710-5673-8158-94267f95aa37', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('06faf1e7-a3ea-53eb-addb-87510bc33d3b', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('06faf1e7-a3ea-53eb-addb-87510bc33d3b', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('06faf1e7-a3ea-53eb-addb-87510bc33d3b', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('06faf1e7-a3ea-53eb-addb-87510bc33d3b', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('06faf1e7-a3ea-53eb-addb-87510bc33d3b', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('06faf1e7-a3ea-53eb-addb-87510bc33d3b', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('06faf1e7-a3ea-53eb-addb-87510bc33d3b', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('80cb9585-aa2d-5980-bf13-25f9f9bd484b', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('80cb9585-aa2d-5980-bf13-25f9f9bd484b', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('80cb9585-aa2d-5980-bf13-25f9f9bd484b', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('80cb9585-aa2d-5980-bf13-25f9f9bd484b', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('80cb9585-aa2d-5980-bf13-25f9f9bd484b', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('80cb9585-aa2d-5980-bf13-25f9f9bd484b', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('80cb9585-aa2d-5980-bf13-25f9f9bd484b', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ad75589d-f1e3-5d18-a6b6-c597ee9c157b', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ad75589d-f1e3-5d18-a6b6-c597ee9c157b', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ad75589d-f1e3-5d18-a6b6-c597ee9c157b', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ad75589d-f1e3-5d18-a6b6-c597ee9c157b', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ad75589d-f1e3-5d18-a6b6-c597ee9c157b', '8b8d7486-1852-5d2f-8e1d-570ca202d983', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ad75589d-f1e3-5d18-a6b6-c597ee9c157b', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fece5f3e-90cd-5ba7-8493-59726ffa4403', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fece5f3e-90cd-5ba7-8493-59726ffa4403', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fece5f3e-90cd-5ba7-8493-59726ffa4403', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fece5f3e-90cd-5ba7-8493-59726ffa4403', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fece5f3e-90cd-5ba7-8493-59726ffa4403', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fece5f3e-90cd-5ba7-8493-59726ffa4403', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fece5f3e-90cd-5ba7-8493-59726ffa4403', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fece5f3e-90cd-5ba7-8493-59726ffa4403', 'a58127ee-4c76-5245-afe1-5c0f2bab87b0', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fece5f3e-90cd-5ba7-8493-59726ffa4403', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3a324ad1-07f0-5eab-bab6-461d9ee52f68', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3a324ad1-07f0-5eab-bab6-461d9ee52f68', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3a324ad1-07f0-5eab-bab6-461d9ee52f68', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3a324ad1-07f0-5eab-bab6-461d9ee52f68', '82dfe1ff-f3d2-50f2-b507-9daa0f479602', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3a324ad1-07f0-5eab-bab6-461d9ee52f68', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3a324ad1-07f0-5eab-bab6-461d9ee52f68', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3a324ad1-07f0-5eab-bab6-461d9ee52f68', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3a324ad1-07f0-5eab-bab6-461d9ee52f68', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3a324ad1-07f0-5eab-bab6-461d9ee52f68', '95004d39-21cc-5538-aa57-34c8e67448e2', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3a324ad1-07f0-5eab-bab6-461d9ee52f68', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3a324ad1-07f0-5eab-bab6-461d9ee52f68', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('501f9991-6e4e-51ce-ba69-e61a0e2222be', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('501f9991-6e4e-51ce-ba69-e61a0e2222be', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('501f9991-6e4e-51ce-ba69-e61a0e2222be', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('501f9991-6e4e-51ce-ba69-e61a0e2222be', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('501f9991-6e4e-51ce-ba69-e61a0e2222be', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('501f9991-6e4e-51ce-ba69-e61a0e2222be', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('501f9991-6e4e-51ce-ba69-e61a0e2222be', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e0182aee-344a-5bd5-b7a3-b75739536533', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e0182aee-344a-5bd5-b7a3-b75739536533', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e0182aee-344a-5bd5-b7a3-b75739536533', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e0182aee-344a-5bd5-b7a3-b75739536533', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e0182aee-344a-5bd5-b7a3-b75739536533', '063215a2-f956-5a30-964f-e266d003acfd', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e0182aee-344a-5bd5-b7a3-b75739536533', '95004d39-21cc-5538-aa57-34c8e67448e2', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e0182aee-344a-5bd5-b7a3-b75739536533', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e0182aee-344a-5bd5-b7a3-b75739536533', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7376577-7134-587a-8d07-103d5cc70e76', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7376577-7134-587a-8d07-103d5cc70e76', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7376577-7134-587a-8d07-103d5cc70e76', '443277db-20b6-565a-9631-5811d9eb7709', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7376577-7134-587a-8d07-103d5cc70e76', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7376577-7134-587a-8d07-103d5cc70e76', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7376577-7134-587a-8d07-103d5cc70e76', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7376577-7134-587a-8d07-103d5cc70e76', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7376577-7134-587a-8d07-103d5cc70e76', 'a58127ee-4c76-5245-afe1-5c0f2bab87b0', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7376577-7134-587a-8d07-103d5cc70e76', 'c9124c90-3228-5854-9349-4a98fadf37e4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7376577-7134-587a-8d07-103d5cc70e76', 'f91e7080-a872-5b93-89c1-c94f831235d8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7376577-7134-587a-8d07-103d5cc70e76', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7376577-7134-587a-8d07-103d5cc70e76', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7376577-7134-587a-8d07-103d5cc70e76', '25a0c60a-ac19-5782-b3d0-7c3660d32998', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7376577-7134-587a-8d07-103d5cc70e76', 'c9ba61c6-2aa3-5751-8382-3842c003ae7f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e7376577-7134-587a-8d07-103d5cc70e76', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cc5833b8-ba62-5aba-af67-50b6da0a9993', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cc5833b8-ba62-5aba-af67-50b6da0a9993', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cc5833b8-ba62-5aba-af67-50b6da0a9993', '443277db-20b6-565a-9631-5811d9eb7709', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cc5833b8-ba62-5aba-af67-50b6da0a9993', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cc5833b8-ba62-5aba-af67-50b6da0a9993', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cc5833b8-ba62-5aba-af67-50b6da0a9993', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cc5833b8-ba62-5aba-af67-50b6da0a9993', 'c9124c90-3228-5854-9349-4a98fadf37e4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cc5833b8-ba62-5aba-af67-50b6da0a9993', 'f91e7080-a872-5b93-89c1-c94f831235d8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cc5833b8-ba62-5aba-af67-50b6da0a9993', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cc5833b8-ba62-5aba-af67-50b6da0a9993', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cc5833b8-ba62-5aba-af67-50b6da0a9993', '25a0c60a-ac19-5782-b3d0-7c3660d32998', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('cc5833b8-ba62-5aba-af67-50b6da0a9993', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('178c01f0-7653-5437-8b70-9f853959941b', 'ca1eb9fd-5454-5f66-b506-ebe1794d1ed7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('178c01f0-7653-5437-8b70-9f853959941b', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('178c01f0-7653-5437-8b70-9f853959941b', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('178c01f0-7653-5437-8b70-9f853959941b', '452c056a-17d9-5f57-866f-6b9c705a27a3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('178c01f0-7653-5437-8b70-9f853959941b', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('178c01f0-7653-5437-8b70-9f853959941b', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('178c01f0-7653-5437-8b70-9f853959941b', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b80675de-8a60-5a7f-afa7-4266502b2f74', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b80675de-8a60-5a7f-afa7-4266502b2f74', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b80675de-8a60-5a7f-afa7-4266502b2f74', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b80675de-8a60-5a7f-afa7-4266502b2f74', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b80675de-8a60-5a7f-afa7-4266502b2f74', 'a58127ee-4c76-5245-afe1-5c0f2bab87b0', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b80675de-8a60-5a7f-afa7-4266502b2f74', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b80675de-8a60-5a7f-afa7-4266502b2f74', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b80675de-8a60-5a7f-afa7-4266502b2f74', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b80675de-8a60-5a7f-afa7-4266502b2f74', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('46e331fb-88fb-5e63-b574-c4b27e824fde', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('46e331fb-88fb-5e63-b574-c4b27e824fde', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('46e331fb-88fb-5e63-b574-c4b27e824fde', 'bdcf33aa-34dd-5127-85b1-c2dcabaaf20b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('46e331fb-88fb-5e63-b574-c4b27e824fde', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('46e331fb-88fb-5e63-b574-c4b27e824fde', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('46e331fb-88fb-5e63-b574-c4b27e824fde', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('46e331fb-88fb-5e63-b574-c4b27e824fde', 'ca1eb9fd-5454-5f66-b506-ebe1794d1ed7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5a775310-c7cf-52c4-bad8-dd2cfd51be9b', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5a775310-c7cf-52c4-bad8-dd2cfd51be9b', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5a775310-c7cf-52c4-bad8-dd2cfd51be9b', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5a775310-c7cf-52c4-bad8-dd2cfd51be9b', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5a775310-c7cf-52c4-bad8-dd2cfd51be9b', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('abfe4893-a8ee-5050-9ff2-0362704f0404', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('abfe4893-a8ee-5050-9ff2-0362704f0404', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('abfe4893-a8ee-5050-9ff2-0362704f0404', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('abfe4893-a8ee-5050-9ff2-0362704f0404', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('abfe4893-a8ee-5050-9ff2-0362704f0404', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('abfe4893-a8ee-5050-9ff2-0362704f0404', '26d2c1b1-1282-5633-8bd4-87261a845428', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0963b258-9dfe-5b9b-894c-221999e784b1', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0963b258-9dfe-5b9b-894c-221999e784b1', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0963b258-9dfe-5b9b-894c-221999e784b1', '6c560cd8-2c28-5f27-b734-fd5ef25f7973', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0963b258-9dfe-5b9b-894c-221999e784b1', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0963b258-9dfe-5b9b-894c-221999e784b1', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0963b258-9dfe-5b9b-894c-221999e784b1', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0963b258-9dfe-5b9b-894c-221999e784b1', 'a58127ee-4c76-5245-afe1-5c0f2bab87b0', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0963b258-9dfe-5b9b-894c-221999e784b1', 'c9124c90-3228-5854-9349-4a98fadf37e4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0963b258-9dfe-5b9b-894c-221999e784b1', 'f91e7080-a872-5b93-89c1-c94f831235d8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0963b258-9dfe-5b9b-894c-221999e784b1', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0963b258-9dfe-5b9b-894c-221999e784b1', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0963b258-9dfe-5b9b-894c-221999e784b1', '25a0c60a-ac19-5782-b3d0-7c3660d32998', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0963b258-9dfe-5b9b-894c-221999e784b1', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('66536079-afc2-5b5d-989e-8751ec88fa77', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('66536079-afc2-5b5d-989e-8751ec88fa77', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('66536079-afc2-5b5d-989e-8751ec88fa77', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('66536079-afc2-5b5d-989e-8751ec88fa77', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('66536079-afc2-5b5d-989e-8751ec88fa77', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('66536079-afc2-5b5d-989e-8751ec88fa77', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('66536079-afc2-5b5d-989e-8751ec88fa77', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('66536079-afc2-5b5d-989e-8751ec88fa77', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0ab642c6-6b41-5704-b83c-b9080fba29de', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0ab642c6-6b41-5704-b83c-b9080fba29de', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0ab642c6-6b41-5704-b83c-b9080fba29de', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0ab642c6-6b41-5704-b83c-b9080fba29de', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0ab642c6-6b41-5704-b83c-b9080fba29de', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0ab642c6-6b41-5704-b83c-b9080fba29de', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0ab642c6-6b41-5704-b83c-b9080fba29de', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0ab642c6-6b41-5704-b83c-b9080fba29de', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e5cde505-54e9-5624-b333-bbea45aafbd5', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e5cde505-54e9-5624-b333-bbea45aafbd5', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e5cde505-54e9-5624-b333-bbea45aafbd5', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e5cde505-54e9-5624-b333-bbea45aafbd5', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e5cde505-54e9-5624-b333-bbea45aafbd5', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e5cde505-54e9-5624-b333-bbea45aafbd5', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e5cde505-54e9-5624-b333-bbea45aafbd5', 'c9124c90-3228-5854-9349-4a98fadf37e4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e5cde505-54e9-5624-b333-bbea45aafbd5', 'f91e7080-a872-5b93-89c1-c94f831235d8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e5cde505-54e9-5624-b333-bbea45aafbd5', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e5cde505-54e9-5624-b333-bbea45aafbd5', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e5cde505-54e9-5624-b333-bbea45aafbd5', '25a0c60a-ac19-5782-b3d0-7c3660d32998', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e5cde505-54e9-5624-b333-bbea45aafbd5', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('413b5543-b5b9-52d4-a7d3-a331def9b41b', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('413b5543-b5b9-52d4-a7d3-a331def9b41b', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('413b5543-b5b9-52d4-a7d3-a331def9b41b', '9d2ffc22-13ea-592d-b031-e3ad94fca9c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('413b5543-b5b9-52d4-a7d3-a331def9b41b', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('413b5543-b5b9-52d4-a7d3-a331def9b41b', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('413b5543-b5b9-52d4-a7d3-a331def9b41b', '23971cbc-63d1-5739-8e93-5978b40e6bcc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3ae59a51-4d4b-56a2-bf18-cb2a79f9e098', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3ae59a51-4d4b-56a2-bf18-cb2a79f9e098', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3ae59a51-4d4b-56a2-bf18-cb2a79f9e098', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3ae59a51-4d4b-56a2-bf18-cb2a79f9e098', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3ae59a51-4d4b-56a2-bf18-cb2a79f9e098', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3ae59a51-4d4b-56a2-bf18-cb2a79f9e098', 'b7a83200-235e-5721-b0b1-627e94ee7160', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('38e28150-9b3a-55e1-a508-06b849475e5e', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('38e28150-9b3a-55e1-a508-06b849475e5e', '692de86a-3d21-57a3-a9aa-cacf1403de30', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('38e28150-9b3a-55e1-a508-06b849475e5e', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('38e28150-9b3a-55e1-a508-06b849475e5e', '6c560cd8-2c28-5f27-b734-fd5ef25f7973', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('38e28150-9b3a-55e1-a508-06b849475e5e', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('38e28150-9b3a-55e1-a508-06b849475e5e', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('38e28150-9b3a-55e1-a508-06b849475e5e', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('38e28150-9b3a-55e1-a508-06b849475e5e', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('38e28150-9b3a-55e1-a508-06b849475e5e', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('38e28150-9b3a-55e1-a508-06b849475e5e', 'a58127ee-4c76-5245-afe1-5c0f2bab87b0', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('38e28150-9b3a-55e1-a508-06b849475e5e', 'c9124c90-3228-5854-9349-4a98fadf37e4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('38e28150-9b3a-55e1-a508-06b849475e5e', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('38e28150-9b3a-55e1-a508-06b849475e5e', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('621b44d6-7b49-5f69-a1e9-981b242a552f', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('621b44d6-7b49-5f69-a1e9-981b242a552f', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('621b44d6-7b49-5f69-a1e9-981b242a552f', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('621b44d6-7b49-5f69-a1e9-981b242a552f', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('621b44d6-7b49-5f69-a1e9-981b242a552f', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('621b44d6-7b49-5f69-a1e9-981b242a552f', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('621b44d6-7b49-5f69-a1e9-981b242a552f', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('621b44d6-7b49-5f69-a1e9-981b242a552f', 'ba3ed360-3f69-5268-9e40-776be86997fc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fd152728-a4df-592e-898f-4842c0275d1d', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fd152728-a4df-592e-898f-4842c0275d1d', 'ca1eb9fd-5454-5f66-b506-ebe1794d1ed7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fd152728-a4df-592e-898f-4842c0275d1d', '452c056a-17d9-5f57-866f-6b9c705a27a3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fd152728-a4df-592e-898f-4842c0275d1d', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fd152728-a4df-592e-898f-4842c0275d1d', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fd152728-a4df-592e-898f-4842c0275d1d', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fd152728-a4df-592e-898f-4842c0275d1d', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fd152728-a4df-592e-898f-4842c0275d1d', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2eedeb3b-c014-555f-8bfe-f55432b385b9', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2eedeb3b-c014-555f-8bfe-f55432b385b9', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2eedeb3b-c014-555f-8bfe-f55432b385b9', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2eedeb3b-c014-555f-8bfe-f55432b385b9', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2eedeb3b-c014-555f-8bfe-f55432b385b9', '95004d39-21cc-5538-aa57-34c8e67448e2', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2eedeb3b-c014-555f-8bfe-f55432b385b9', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2eedeb3b-c014-555f-8bfe-f55432b385b9', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2eedeb3b-c014-555f-8bfe-f55432b385b9', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2eedeb3b-c014-555f-8bfe-f55432b385b9', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2d05565c-076e-5cfb-b671-a0825efe5913', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2d05565c-076e-5cfb-b671-a0825efe5913', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2d05565c-076e-5cfb-b671-a0825efe5913', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2d05565c-076e-5cfb-b671-a0825efe5913', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2d05565c-076e-5cfb-b671-a0825efe5913', '95004d39-21cc-5538-aa57-34c8e67448e2', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2d05565c-076e-5cfb-b671-a0825efe5913', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2d05565c-076e-5cfb-b671-a0825efe5913', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2d05565c-076e-5cfb-b671-a0825efe5913', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2d05565c-076e-5cfb-b671-a0825efe5913', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('43912973-da41-5384-a6b2-808afcddbebc', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('43912973-da41-5384-a6b2-808afcddbebc', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('43912973-da41-5384-a6b2-808afcddbebc', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('43912973-da41-5384-a6b2-808afcddbebc', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('43912973-da41-5384-a6b2-808afcddbebc', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('43912973-da41-5384-a6b2-808afcddbebc', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('43912973-da41-5384-a6b2-808afcddbebc', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('75945eb7-92ba-536d-813d-8115803f4885', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('75945eb7-92ba-536d-813d-8115803f4885', '51a96f8f-d5d9-5807-882f-7a93b63d7292', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('75945eb7-92ba-536d-813d-8115803f4885', '14725cf8-29d9-5db2-938e-6a589a4edb7e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('75945eb7-92ba-536d-813d-8115803f4885', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('75945eb7-92ba-536d-813d-8115803f4885', '95004d39-21cc-5538-aa57-34c8e67448e2', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('75945eb7-92ba-536d-813d-8115803f4885', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('75945eb7-92ba-536d-813d-8115803f4885', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('75945eb7-92ba-536d-813d-8115803f4885', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('75945eb7-92ba-536d-813d-8115803f4885', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ef823c7b-5d7a-5331-8f36-50b34204c134', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ef823c7b-5d7a-5331-8f36-50b34204c134', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ef823c7b-5d7a-5331-8f36-50b34204c134', '063215a2-f956-5a30-964f-e266d003acfd', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ef823c7b-5d7a-5331-8f36-50b34204c134', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ef823c7b-5d7a-5331-8f36-50b34204c134', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ef823c7b-5d7a-5331-8f36-50b34204c134', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ef823c7b-5d7a-5331-8f36-50b34204c134', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ef823c7b-5d7a-5331-8f36-50b34204c134', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e3b72278-032a-53f2-944a-73e22dc2ab3b', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e3b72278-032a-53f2-944a-73e22dc2ab3b', '12722c3d-e8e6-512c-ae23-716356e8729d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e3b72278-032a-53f2-944a-73e22dc2ab3b', 'd26538be-aa97-588b-ab2f-89047339c3cb', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e3b72278-032a-53f2-944a-73e22dc2ab3b', '746685d5-afd8-5eea-9b82-3c0a894dc4e1', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e3b72278-032a-53f2-944a-73e22dc2ab3b', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e3b72278-032a-53f2-944a-73e22dc2ab3b', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e3b72278-032a-53f2-944a-73e22dc2ab3b', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e3b72278-032a-53f2-944a-73e22dc2ab3b', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e3b72278-032a-53f2-944a-73e22dc2ab3b', '25a0c60a-ac19-5782-b3d0-7c3660d32998', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('61f1ee57-b79a-5dbb-a5ef-f46f198432ee', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('61f1ee57-b79a-5dbb-a5ef-f46f198432ee', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('61f1ee57-b79a-5dbb-a5ef-f46f198432ee', '82dfe1ff-f3d2-50f2-b507-9daa0f479602', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('61f1ee57-b79a-5dbb-a5ef-f46f198432ee', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('61f1ee57-b79a-5dbb-a5ef-f46f198432ee', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('61f1ee57-b79a-5dbb-a5ef-f46f198432ee', '95004d39-21cc-5538-aa57-34c8e67448e2', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('61f1ee57-b79a-5dbb-a5ef-f46f198432ee', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d3230c3d-f07c-5ccb-b788-712d468f35a6', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d3230c3d-f07c-5ccb-b788-712d468f35a6', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d3230c3d-f07c-5ccb-b788-712d468f35a6', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d3230c3d-f07c-5ccb-b788-712d468f35a6', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d3230c3d-f07c-5ccb-b788-712d468f35a6', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d3230c3d-f07c-5ccb-b788-712d468f35a6', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d3230c3d-f07c-5ccb-b788-712d468f35a6', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('8c8c7127-de5b-5aec-b27d-2093e617e944', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('8c8c7127-de5b-5aec-b27d-2093e617e944', 'ca1eb9fd-5454-5f66-b506-ebe1794d1ed7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('8c8c7127-de5b-5aec-b27d-2093e617e944', '452c056a-17d9-5f57-866f-6b9c705a27a3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('8c8c7127-de5b-5aec-b27d-2093e617e944', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('8c8c7127-de5b-5aec-b27d-2093e617e944', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('8c8c7127-de5b-5aec-b27d-2093e617e944', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('8c8c7127-de5b-5aec-b27d-2093e617e944', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('8c8c7127-de5b-5aec-b27d-2093e617e944', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('416e3504-5190-530d-b137-c2e7b34a88b9', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('416e3504-5190-530d-b137-c2e7b34a88b9', 'ca1eb9fd-5454-5f66-b506-ebe1794d1ed7', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('416e3504-5190-530d-b137-c2e7b34a88b9', '452c056a-17d9-5f57-866f-6b9c705a27a3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('416e3504-5190-530d-b137-c2e7b34a88b9', 'ed730d7a-f925-5794-8f01-da5d06f47508', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('416e3504-5190-530d-b137-c2e7b34a88b9', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('416e3504-5190-530d-b137-c2e7b34a88b9', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('416e3504-5190-530d-b137-c2e7b34a88b9', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('416e3504-5190-530d-b137-c2e7b34a88b9', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('416e3504-5190-530d-b137-c2e7b34a88b9', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('70d081bf-a0fc-5599-89d1-383633381b40', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('70d081bf-a0fc-5599-89d1-383633381b40', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('70d081bf-a0fc-5599-89d1-383633381b40', '95004d39-21cc-5538-aa57-34c8e67448e2', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('70d081bf-a0fc-5599-89d1-383633381b40', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('70d081bf-a0fc-5599-89d1-383633381b40', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('70d081bf-a0fc-5599-89d1-383633381b40', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('eb9a66c1-c6c6-5ac2-9419-30d4cadad52a', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('eb9a66c1-c6c6-5ac2-9419-30d4cadad52a', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('eb9a66c1-c6c6-5ac2-9419-30d4cadad52a', '95004d39-21cc-5538-aa57-34c8e67448e2', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('eb9a66c1-c6c6-5ac2-9419-30d4cadad52a', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('eb9a66c1-c6c6-5ac2-9419-30d4cadad52a', '97a18e99-62f5-5776-8df9-3edf15e2751a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('eb9a66c1-c6c6-5ac2-9419-30d4cadad52a', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('eb9a66c1-c6c6-5ac2-9419-30d4cadad52a', 'ec552686-4d65-5680-bac7-0be6d4f7648b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('eb9a66c1-c6c6-5ac2-9419-30d4cadad52a', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a141b0a7-6cab-5ded-afc1-7c860fec07c7', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a141b0a7-6cab-5ded-afc1-7c860fec07c7', '3a16da2d-d050-5040-bfbd-ee2fec62600d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a141b0a7-6cab-5ded-afc1-7c860fec07c7', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a141b0a7-6cab-5ded-afc1-7c860fec07c7', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a141b0a7-6cab-5ded-afc1-7c860fec07c7', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a141b0a7-6cab-5ded-afc1-7c860fec07c7', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a141b0a7-6cab-5ded-afc1-7c860fec07c7', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f28254ec-a657-5779-9b86-8609f5873670', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f28254ec-a657-5779-9b86-8609f5873670', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f28254ec-a657-5779-9b86-8609f5873670', '95004d39-21cc-5538-aa57-34c8e67448e2', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f28254ec-a657-5779-9b86-8609f5873670', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f28254ec-a657-5779-9b86-8609f5873670', '97a18e99-62f5-5776-8df9-3edf15e2751a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f28254ec-a657-5779-9b86-8609f5873670', '09d8a663-12fc-5575-8aed-87deaa7d92f4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f28254ec-a657-5779-9b86-8609f5873670', 'ec552686-4d65-5680-bac7-0be6d4f7648b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f28254ec-a657-5779-9b86-8609f5873670', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0c2a5309-35a0-540d-8257-f2ff041d9679', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0c2a5309-35a0-540d-8257-f2ff041d9679', '9d2ffc22-13ea-592d-b031-e3ad94fca9c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0c2a5309-35a0-540d-8257-f2ff041d9679', '48f6c978-d9c0-56ea-96dd-8838a514ef2b', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0c2a5309-35a0-540d-8257-f2ff041d9679', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0c2a5309-35a0-540d-8257-f2ff041d9679', 'ba3ed360-3f69-5268-9e40-776be86997fc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0c2a5309-35a0-540d-8257-f2ff041d9679', 'f67514c3-6542-52f7-b0e4-0e144e3a2343', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0c2a5309-35a0-540d-8257-f2ff041d9679', 'b4a22e20-cc05-53d3-ab9a-44abfe69ba85', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0c2a5309-35a0-540d-8257-f2ff041d9679', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d15deb11-3605-567c-99a6-ef2e0eedcc05', 'fa251cff-dd5f-5471-b538-2519d9526ef8', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d15deb11-3605-567c-99a6-ef2e0eedcc05', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d15deb11-3605-567c-99a6-ef2e0eedcc05', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d15deb11-3605-567c-99a6-ef2e0eedcc05', 'd3f7281e-4a48-5763-aacc-a3361b3d49db', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d15deb11-3605-567c-99a6-ef2e0eedcc05', '063215a2-f956-5a30-964f-e266d003acfd', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d15deb11-3605-567c-99a6-ef2e0eedcc05', 'a5acc8d2-53f4-5f28-89c3-3692dc657fb3', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d15deb11-3605-567c-99a6-ef2e0eedcc05', 'd78853e8-367f-5f7f-8286-edffedcce367', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d15deb11-3605-567c-99a6-ef2e0eedcc05', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;

COMMIT;