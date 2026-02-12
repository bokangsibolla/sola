-- =============================================================
-- Migration: Add AI-researched places for 6 countries
-- Generated from AI research CSVs with UUID corrections applied
-- All data marked as unverified, source='model'
-- =============================================================

BEGIN;

-- =============================================================
-- 1. ADD NEW COUNTRIES: South Korea and Taiwan
-- =============================================================

INSERT INTO countries (id, slug, name, iso2, iso3, currency_code, is_active, order_index,
    safety_rating, solo_friendly, subtitle, summary,
    highlights, language, visa_note, english_friendliness,
    best_months, created_at, updated_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'country-kr'),
    'south-korea', 'South Korea', 'KR', 'KOR', 'KRW', true, 8,
    'very_safe', true,
    'K-culture, endless cafes, midnight safety',
    'South Korea is one of Asia''s safest countries for solo female travelers, with excellent public transportation, English signage in major cities, and a culture of female independence. From Seoul''s K-beauty temples and Hongdae''s creative energy to Busan''s coastal temples and markets, you''ll experience cutting-edge modernity alongside 2,000 years of Buddhist history. The food scene is phenomenal and accommodates solo diners naturally, and you can navigate confidently even without Korean language skills.',
    ARRAY['Ranked among Asia''s safest countries with 24/7 convenience stores and well-lit streets', 'Incredible public transportation (subway, bus, KTX trains) that''s cheap, clean, and English-friendly', 'World-class cafe culture: from literary bookstores to concept cafes (Harry Potter, NYC subway, vegan mindfulness)', 'Solo-dining friendly restaurants and Korean BBQ designed specifically for individual diners', 'Buddhist temples, palace grounds, urban streams, and beaches all free or very cheap']::text[],
    'Korean is the official language. English is widely spoken in Seoul and major tourist areas, with increasing English signage. Many young people speak basic English. Download a translation app, and you''ll manage fine. Subway announcements include English.',
    'Most nationalities (US, EU, Australia, etc.) can enter visa-free for up to 90 days. K-ETA (electronic travel authorization) is required starting January 1, 2027, but is exempt through December 31, 2026. Mandatory Arrival Card must be filed online within 3 days of arrival (free). Have a valid passport; no specific minimum validity required.',
    'high',
    'April-May, September-October',
    now(), now()
)
ON CONFLICT (iso2) DO NOTHING;


INSERT INTO countries (id, slug, name, iso2, iso3, currency_code, is_active, order_index,
    safety_rating, solo_friendly, subtitle, summary,
    highlights, language, visa_note, english_friendliness,
    best_months, created_at, updated_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'country-tw'),
    'taiwan', 'Taiwan', 'TW', 'TWN', 'TWD', true, 9,
    'very_safe', true,
    'Design, night markets, island paradise',
    'Taiwan is one of the world''s safest countries and consistently ranked #1 for solo female travelers in Asia. Taipei''s design cafes and coworking spaces make extended work stays comfortable, while the food culture celebrates individual dining. The island''s compact size means you can easily island-hop or spend time in historic Tainan, mountainous Jiufen, or coastal Taichung. The 24/7 convenience store culture and free public WiFi everywhere make solo navigation effortless.',
    ARRAY['Voted safest country for solo female travelers in Asia with world-class public safety', 'Incredibly cheap (accommodation, food, transportation all budget-friendly)', 'Extensive MRT system in Taipei, plus affordable high-speed trains connecting cities', 'Unique design cafe culture with coworking options for longer stays', 'Food-focused tourism: night markets, street food, and dining alone is completely normal']::text[],
    'Mandarin Chinese and Taiwanese are official languages. English is less common than South Korea but improving, especially in Taipei and tourist areas. Younger people speak more English. Translation apps (Google Translate, Papago) are essential. Many menus have English or picture-based ordering.',
    'Most Western nationalities (US, EU, Australia, Canada, etc.) can enter visa-free for 90 days (citizens of most nations without visa agreements can stay 30 days). An eVisa is available for select nationalities (India, Bangladesh, Vietnam, Cambodia, etc.) through Taiwan''s Bureau of Consular Affairs. Check BOCA.gov.tw for your specific country. Passport must be valid for duration of stay.',
    'moderate',
    'March-May, September-November',
    now(), now()
)
ON CONFLICT (iso2) DO NOTHING;

-- =============================================================
-- 2. ADD NEW CITIES: Seoul, Busan, Taipei, Tainan
-- =============================================================

INSERT INTO cities (id, country_id, slug, name, timezone, center_lat, center_lng,
    is_active, order_index, created_at, updated_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'city-sel'),
    uuid_generate_v5(uuid_ns_url(), 'country-kr'),
    'seoul', 'Seoul', 'Asia/Seoul', 37.5665, 126.978,
    true, 1, now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO cities (id, country_id, slug, name, timezone, center_lat, center_lng,
    is_active, order_index, created_at, updated_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'city-bus'),
    uuid_generate_v5(uuid_ns_url(), 'country-kr'),
    'busan', 'Busan', 'Asia/Seoul', 35.1796, 129.0756,
    true, 2, now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO cities (id, country_id, slug, name, timezone, center_lat, center_lng,
    is_active, order_index, created_at, updated_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'city-tpe'),
    uuid_generate_v5(uuid_ns_url(), 'country-tw'),
    'taipei', 'Taipei', 'Asia/Taipei', 25.033, 121.5654,
    true, 1, now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO cities (id, country_id, slug, name, timezone, center_lat, center_lng,
    is_active, order_index, created_at, updated_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'city-tnn'),
    uuid_generate_v5(uuid_ns_url(), 'country-tw'),
    'tainan', 'Tainan', 'Asia/Taipei', 22.9999, 120.2269,
    true, 2, now(), now()
)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- 2b. ADD SHOP CATEGORY (needed for 1 shop place)
-- =============================================================

INSERT INTO place_categories (id, slug, name, icon, order_index, is_active, created_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'cat-shop'),
    'shop', 'Shop', 'bag-outline', 9, true, now()
)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- 3. ADD NEW TAGS
-- =============================================================

INSERT INTO tags (id, tag_group_id, slug, label, filter_group, scope, tag_type, order_index, is_active, created_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'tag-cozy'),
    uuid_generate_v5(uuid_ns_url(), 'tg-vibe'),
    'cozy', 'Cozy', 'vibe', 'global', 'place', 21, true, now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO tags (id, tag_group_id, slug, label, filter_group, scope, tag_type, order_index, is_active, created_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'tag-nature'),
    uuid_generate_v5(uuid_ns_url(), 'tg-vibe'),
    'nature', 'Nature', 'vibe', 'global', 'place', 22, true, now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO tags (id, tag_group_id, slug, label, filter_group, scope, tag_type, order_index, is_active, created_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'tag-scenic'),
    uuid_generate_v5(uuid_ns_url(), 'tg-vibe'),
    'scenic', 'Scenic', 'vibe', 'global', 'place', 23, true, now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO tags (id, tag_group_id, slug, label, filter_group, scope, tag_type, order_index, is_active, created_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'tag-trendy'),
    uuid_generate_v5(uuid_ns_url(), 'tg-vibe'),
    'trendy', 'Trendy', 'vibe', 'global', 'place', 24, true, now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO tags (id, tag_group_id, slug, label, filter_group, scope, tag_type, order_index, is_active, created_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'tag-beachfront'),
    uuid_generate_v5(uuid_ns_url(), 'tg-vibe'),
    'beachfront', 'Beachfront', 'vibe', 'global', 'place', 25, true, now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO tags (id, tag_group_id, slug, label, filter_group, scope, tag_type, order_index, is_active, created_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'tag-local-cuisine'),
    uuid_generate_v5(uuid_ns_url(), 'tg-goodfor'),
    'local-cuisine', 'Local cuisine', 'good_for', 'global', 'place', 26, true, now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO tags (id, tag_group_id, slug, label, filter_group, scope, tag_type, order_index, is_active, created_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'tag-solo-dining'),
    uuid_generate_v5(uuid_ns_url(), 'tg-goodfor'),
    'solo-dining', 'Solo dining', 'good_for', 'global', 'place', 27, true, now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO tags (id, tag_group_id, slug, label, filter_group, scope, tag_type, order_index, is_active, created_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'tag-vegetarian-friendly'),
    uuid_generate_v5(uuid_ns_url(), 'tg-amenity'),
    'vegetarian-friendly', 'Vegetarian-friendly', 'amenity', 'global', 'place', 28, true, now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO tags (id, tag_group_id, slug, label, filter_group, scope, tag_type, order_index, is_active, created_at)
VALUES (
    uuid_generate_v5(uuid_ns_url(), 'tag-international'),
    uuid_generate_v5(uuid_ns_url(), 'tg-goodfor'),
    'international', 'International', 'cuisine', 'global', 'place', 29, true, now()
)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- 4. INSERT PLACES (127 places, corrected city_ids)
-- =============================================================

INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '986657f3-dde8-50e6-8823-95fb19f2c5c8',
    '19aa31e1-c413-5b05-8901-0b00ebafa230',
    'sarnies-cafe-charoen-krung',
    'Sarnies Cafe Charoen Krung',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    13.7211, 100.5126,
    '101-103 Charoen Krung Road 44, Bang Rak, Bangkok 10500',
    '+66 2 237 0090',
    'https://sarnies.com/bangkok',
    2,
    '07:00-17:30 daily (Mon-Thu), 08:00-22:00 (Fri-Sun)',
    'Step into this charming 19th-century shophouse for artisan coffee and European pastries. Sarnies is famous for its sourdough bread, focaccia, and proper flat whites - the perfect spot to settle in with your laptop or journal. The atmospheric wooden interiors and vintage vibes make solo dining feel like a retreat.',
    true,
    'As a solo female traveler, you''ll appreciate the welcoming atmosphere and the fact that eating alone here feels completely natural. It''s positioned on a quieter stretch of Charoen Krung, away from the main Patpong nightlife, making it safe and comfortable for morning coffee.',
    '["artisan-pastries", "heritage-shophouse", "wifi-friendly", "solo-dining-comfortable", "great-coffee"]'::jsonb,
    '["crowded-on-weekends", "limited-seating", "can-get-loud-afternoons"]'::jsonb,
    '"I felt totally at home here as a solo traveler. The staff are friendly and the pastries are legitimately excellent." - TravellingKing.com',
    'https://www.google.com/maps/search/?api=1&query=Sarnies%20Cafe%20Charoen%20Krung&query_place_id=ChIJUXT3NL6Z4jARwh3cJq_bkog',
    'cafe',
    NULL,
    '["Google Maps", "TripAdvisor", "Klook"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    88,
    4.4,
    520,
    '2026-02-10 06:38:06.869756+00',
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
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'a97714cd-d27b-5143-95cd-9618f76eafbb',
    '19aa31e1-c413-5b05-8901-0b00ebafa230',
    'arabica-park-silom',
    '% Arabica Park Silom',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    13.7294, 100.5383,
    'GF, Park Silom, 1 Convent Road, Silom, Bang Rak, Bangkok 10500',
    '+66 98 931 0100',
    'https://arabica.com/en/locations/thailand/bangkok/',
    3,
    '07:00-21:00 daily',
    'Part of Japan''s famous specialty coffee brand, this compact % Arabica sits at the entrance of the Park Silom shopping center. Order your meticulously crafted espresso and stand at the sleek counter to enjoy it while watching Silom buzz by. The minimalist design and focus on coffee quality make this a perfect solo stop.',
    true,
    'As a female solo traveler, you''ll appreciate the quick service and the fact that standing-room-only doesn''t feel awkward here - everyone orders to go or stands. Located in a safe, upscale shopping center with excellent visibility and nearby BTS access.',
    '["specialty-coffee", "minimalist-design", "safe-location", "shopping-nearby", "famous-brand"]'::jsonb,
    '["no-seating", "pricey", "busy-hours"]'::jsonb,
    '"Great quick stop for a proper coffee. The location in Park Silom makes you feel secure." - NomadsBeyond.com',
    'https://www.google.com/maps/search/?api=1&query=%25%20Arabica%20Park%20Silom&query_place_id=ChIJs9jA2Vyf4jARevKn7qQ1V_E',
    'cafe',
    NULL,
    '["Official website", "Google Maps", "TripAdvisor"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    86,
    4.3,
    380,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '30 minutes',
    'Walk-in only',
    NULL,
    'Trending',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'ab85bf63-1bec-5fa2-8436-660d26483534',
    '19aa31e1-c413-5b05-8901-0b00ebafa230',
    'broccoli-revolution-thonglor',
    'Broccoli Revolution Thonglor',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    13.7345, 100.5684,
    '899 Sukhumvit Soi 49, Thong Lo, Wattana, Bangkok 10110',
    '+66 95 251 9799',
    'https://www.broccoli-revolution.com',
    2,
    '10:00-20:00 daily',
    'This vibrant plant-based restaurant and juice bar brings wellness without the pretension to trendy Thonglor. Fresh green bowls, creative smoothies, and healthy wraps fill the bright space. It''s perfect for a solo meal where you can read, work, or simply enjoy nutritious food among other health-conscious diners.',
    true,
    'Thonglor is highly recommended for solo female travelers - it''s well-lit, trendy, and full of other solo diners. Broccoli Revolution attracts a friendly, female-forward crowd and is completely comfortable for dining alone.',
    '["plant-based-options", "healthy-bowls", "juice-bar", "instagram-worthy", "female-friendly"]'::jsonb,
    '["vegetarian-only", "can-be-pricey", "gets-crowded-lunch"]'::jsonb,
    '"As a vegan traveler, this place was a lifesaver. Super comfortable dining solo here." - HappyCow.net',
    'https://www.google.com/maps/search/?api=1&query=Broccoli%20Revolution%20Thonglor&query_place_id=ChIJuxpP96mf4jARqZPYPN045Xs',
    'restaurant',
    NULL,
    '["TripAdvisor", "Google Maps", "HappyCow"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    84,
    4.2,
    650,
    '2026-02-10 06:38:06.869756+00',
    'afternoon',
    '1-1.5 hours',
    'Walk-in / Order at counter',
    NULL,
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '35b42232-1bf5-5f0b-897d-2d48d7448e8a',
    '19aa31e1-c413-5b05-8901-0b00ebafa230',
    'lim-lao-ngow-chinatown',
    'Lim Lao Ngow Fishball Noodles',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    13.7294, 100.5069,
    '299-301 Song Sawat Road, Samphanthawong, Bangkok 10100',
    '+66 81 640 4750',
    NULL,
    1,
    '16:30-21:00 daily',
    'This legendary Chinatown noodle stall has been perfecting fishball noodles for over 80 years. Watch the rhythmic bounce of the fishballs as they''re prepared, then slurp your bowl standing at communal tables. It''s authentic, affordable, and a genuine Bangkok experience that feels safe for solo diners.',
    true,
    'Solo female travelers love this spot because the communal standing-table setup means you''re never awkwardly alone, and the high turnover means quick service. It''s famous, well-visited, and located in the bustling Chinatown area with good lighting and foot traffic.',
    '["michelin-bib-gourmand", "legendary-since-1938", "bouncing-fishballs", "authentic-chinatown", "budget-friendly"]'::jsonb,
    '["standing-room-only", "crowded-evenings", "communal-eating", "no-english-menu"]'::jsonb,
    '"An iconic spot. Being surrounded by locals and other travelers makes you feel safe, and the noodles are perfection." - MichelinGuide.com',
    'https://www.google.com/maps/search/?api=1&query=Lim%20Lao%20Ngow%20Fishball%20Noodles&query_place_id=ChIJz7sn9CCZ4jAR_pLoJJDAUF0',
    'restaurant',
    NULL,
    '["MichelinGuide", "TripAdvisor", "Google Maps"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    90,
    4.5,
    890,
    '2026-02-10 06:38:06.869756+00',
    'evening',
    '30-45 minutes',
    'Walk-in only, no reservations',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '7c64dd44-df91-5ac0-93ca-a78156ca2596',
    '19aa31e1-c413-5b05-8901-0b00ebafa230',
    'smile-society-hostel',
    'Smile Society Boutique Hostel',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    13.7262, 100.5267,
    '130/3-4 Silom Soi 6, Silom Road, Bangkok 10500',
    '+66 2 266 1934',
    'https://smile-society-boutique-hostel.bangkokshotels.com',
    1,
    '24/7',
    'Run with genuine warmth by Ms. Bee, this small boutique hostel feels like a home away from home. Clean dorms with good lighting, a sociable common area, and the owner''s personal recommendations make it more than just a bed. You''ll meet other female travelers here naturally without it feeling forced.',
    true,
    'Female solo travelers consistently praise the security, cleanliness, and the fact that Ms. Bee treats guests like family. Located 5 minutes from Patpong but positioned on a quiet soi away from the red-light district, with BTS access nearby.',
    '["women-run", "owner-is-gem", "clean-dorms", "social-atmosphere", "safe-secure"]'::jsonb,
    '["small-property", "can-feel-full", "basic-amenities"]'::jsonb,
    '"Ms. Bee made me feel completely safe and welcomed. This is the vibe you want in a hostel." - Booking.com, 8.9/10',
    'https://www.google.com/maps/search/?api=1&query=Smile%20Society%20Boutique%20Hostel&query_place_id=ChIJs35euSyf4jARfu0VAfJvE4A',
    'hostel',
    '250',
    '["Booking.com", "TripAdvisor", "Hostelworld"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    99.99,
    8.9,
    420,
    '2026-02-10 06:38:06.869756+00',
    'any',
    'overnight',
    'Book via Booking.com, Hostelworld, or direct contact',
    NULL,
    'Women-run',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '86bb4f4a-69ad-576f-8826-4fa4b8b792fc',
    '19aa31e1-c413-5b05-8901-0b00ebafa230',
    'the-yard-hostel-ari',
    'The Yard Hostel Bangkok',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    13.8171, 100.5368,
    '51 Phahonyothin Soi 5, Samsen Nai, Phaya Thai, Bangkok 10400',
    '+66 89 677 4050',
    'https://www.theyardhostels.com',
    1,
    '24/7',
    'This eco-hostel made from recycled shipping containers has serious character and soul. The Ari neighborhood is a hidden gem - local, hip, and full of cafes and bars that don''t cater to backpackers. Staff leads free Chinatown food tours on Tuesday nights, and the open courtyards encourage socializing without forced club vibes.',
    true,
    'The neighborhood (Ari) is one of Bangkok''s most underrated areas for solo female travelers - authentic, safe, and genuinely fun. The hostel''s commitment to sustainability and community creates a meaningful solo travel experience.',
    '["eco-friendly", "shipping-container-design", "free-tours", "ari-neighborhood", "social-without-party"]'::jsonb,
    '["dorms-can-be-narrow", "some-noise", "not-in-touristy-area"]'::jsonb,
    '"The Ari neighborhood discovery alone made this worth it. Safe, cool vibes, excellent staff." - TravelFish.org',
    'https://www.google.com/maps/search/?api=1&query=The%20Yard%20Hostel%20Bangkok&query_place_id=ChIJlb2fOqae4jARKp8gzFyam88',
    'hostel',
    '280',
    '["Booking.com", "TripAdvisor", "Official website"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    99.99,
    8.6,
    580,
    '2026-02-10 06:38:06.869756+00',
    'any',
    'overnight',
    'Book via Booking.com or official website',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '0b51d063-a305-5066-95bf-0fde8afcce4b',
    '19aa31e1-c413-5b05-8901-0b00ebafa230',
    'dusit-thani-bangkok',
    'Dusit Thani Bangkok',
    'hotel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    13.7306, 100.5276,
    '98 Rama IV Road, Silom, Bang Rak, Bangkok 10500',
    '+66 2 200 9000',
    'https://www.dusit.com/dusitthani-bangkok/',
    4,
    '24/7',
    'This elegant 5-star property sits opposite Lumpini Park, offering luxury without pretension. Spacious rooms with stunning city views, world-class spa services, and multiple dining options make it ideal for a solo traveler wanting to treat herself. The rooftop pool and spa create a peaceful retreat after exploring the city.',
    true,
    'Perfect for solo female travelers wanting to feel safe, pampered, and surrounded by English-speaking staff. The location near Lumpini Park offers green space for morning walks. Multiple restaurants mean eating solo never feels awkward.',
    '["luxury-spa", "lumpini-park-access", "rooftop-pool", "multiple-restaurants", "english-speaking-staff"]'::jsonb,
    '["expensive", "formal-vibe", "best-for-splurges"]'::jsonb,
    '"Treated myself here after weeks of hostels. The spa was exactly what I needed, and staff made solo dining seamless." - TravellingKing.com',
    'https://www.google.com/maps/search/?api=1&query=Dusit%20Thani%20Bangkok&query_place_id=ChIJNR_QAkSf4jARbTRljQDBL70',
    'hotel',
    '3500',
    '["Booking.com", "TripAdvisor", "Official website"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    99.99,
    9.6,
    2100,
    '2026-02-10 06:38:06.869756+00',
    'any',
    'overnight',
    'Book via Booking.com, Agoda, or official website',
    NULL,
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '0918ab49-31ea-58f2-8147-f36757b47c79',
    '19aa31e1-c413-5b05-8901-0b00ebafa230',
    'wat-benchamabophit-marble-temple',
    'Wat Benchamabophit (Marble Temple)',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    13.7565, 100.5125,
    '69 Nakornpathom Road, Dusit, Bangkok 10300',
    '+66 2 281 0270',
    'https://www.tourismthailand.org/Attraction/wat-benchamabophit',
    1,
    '08:00-17:30 daily',
    'Bangkok''s most stunning temple, built entirely from Italian Carrara marble and featured on Thailand''s 5-baht coin. The serene atmosphere, beautiful architecture, and fewer tourists than Grand Palace make this special. Visit during evening alms ceremony (around 5-6pm) to see Buddhist monks in saffron robes.',
    true,
    'Perfect for solo female travelers seeking authentic spiritual experience without the crowds. The local monk community means you''re never truly alone but have plenty of space. Photography is encouraged, and the peaceful energy is grounding.',
    '["carrara-marble", "iconic-architecture", "monk-alms-ceremony", "fewer-crowds", "peaceful-vibes"]'::jsonb,
    '["dress-code-required", "no-shoes", "photography-etiquette", "alms-ceremony-early"]'::jsonb,
    '"So much more peaceful than Grand Palace. Watched the alms ceremony solo and felt genuinely moved." - TravellingKing.com',
    'https://www.google.com/maps/search/?api=1&query=Wat%20Benchamabophit%20%28Marble%20Temple%29&query_place_id=ChIJvccM01iZ4jARPwr8_uBuM_8',
    'landmark',
    NULL,
    '["Tourism Thailand", "TripAdvisor", "Google Maps"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    92,
    4.6,
    2050,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '1.5-2 hours',
    'Walk-in. Admission: 100 THB',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '269dbdb5-a3ab-534a-88e9-b5e0c6627c53',
    '19aa31e1-c413-5b05-8901-0b00ebafa230',
    'chinatown-walking-tour',
    'Chinatown Walking Tour',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    13.7294, 100.5069,
    'Yaowarat Road, Samphanthawong, Bangkok 10100',
    NULL,
    'https://www.getyourguide.com/chinatown-bangkok-l20753/walking-tours-tc3/',
    1,
    'Various times (usually 09:00-14:00 or 18:00-22:00)',
    'Explore Bangkok''s vibrant Chinatown with a knowledgeable guide. Navigate narrow alleyways, sample street food, visit hidden shrines, and learn about the area''s rich heritage. Whether self-guided or in a small group, Chinatown reveals a completely different Bangkok than the tourist trails.',
    true,
    'Small-group tours are perfect for solo female travelers - you get companionship without being stuck with pre-booked friends. The constant street-level activity and foot traffic in Chinatown makes it inherently safe.',
    '["authentic-chinatown", "street-food-sampling", "hidden-temples", "history", "small-groups"]'::jsonb,
    '["very-crowded", "hot-weather", "narrow-streets", "can-smell-strong"]'::jsonb,
    '"Joined a small group and ended up meeting amazing travelers. Chinatown is loud and chaotic but totally manageable solo." - GetYourGuide',
    'https://www.google.com/maps/search/?api=1&query=Chinatown%20Walking%20Tour&query_place_id=ChIJrdfOcJOZ4jAR1Grh5w74V1g',
    'activity',
    NULL,
    '["GetYourGuide", "TripAdvisor", "Klook"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    90,
    4.5,
    1840,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '2.5-3 hours',
    'Book via GetYourGuide, Klook, or Viator. Self-guided tours also available.',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'eb4529f6-6f0a-538c-9cd2-dee0d1160d8a',
    'ba437e7c-cb67-5276-92c8-34e4809f0c14',
    'graph-coffee-nimman',
    'Graph Coffee (Graph One Nimman)',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    18.7883, 98.9451,
    '1/6 One Nimman A103-104, Nimmanhaemin Road, Suthep, Mueang Chiang Mai 50200',
    '+66 99 372 3003',
    'https://www.graphcoffeeco.com/graph-onenimman',
    2,
    '11:00-22:00 daily',
    'Graph is Chiang Mai''s serious coffee destination. Specialty brews, artisanal pour-overs, and experimental single-origin espressos are crafted by knowledgeable baristas. Located in the buzzing One Nimman complex, it''s spacious enough for solo work, with reliable WiFi and a sophisticated crowd.',
    true,
    'Perfect for solo female travelers who want to work or linger. Nimman is safe, trendy, and welcoming. The cafe attracts digital nomads and locals, creating a naturally inclusive vibe where being alone is completely normal.',
    '["specialty-coffee", "expert-baristas", "wifi-reliable", "one-nimman-location", "work-friendly"]'::jsonb,
    '["pricey-for-thailand", "can-be-crowded", "nomad-hub-vibe"]'::jsonb,
    '"Spent half a day here working. Barista was patient with my coffee questions, and the space felt totally safe." - SoloTravelBestie.substack.com',
    'https://www.google.com/maps/search/?api=1&query=Graph%20Coffee%20%28Graph%20One%20Nimman%29&query_place_id=ChIJw5T0TM072jAR408yNwb8Nbk',
    'cafe',
    NULL,
    '["Official website", "TripAdvisor", "Google Maps"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    88,
    4.4,
    820,
    '2026-02-10 06:38:06.869756+00',
    'afternoon',
    '1-3 hours',
    'Walk-in only',
    NULL,
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '4eb21168-00db-5e30-b6ca-99e17d06ee44',
    'ba437e7c-cb67-5276-92c8-34e4809f0c14',
    'librarista-nimman',
    'Librarista Cafe',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    18.7867, 98.9447,
    '16/2 Nimmanhaemin Road, Soi 5, Suthep, Mueang Chiang Mai 50200',
    '+66 53 895 678',
    'https://www.chiangmaicitylife.com/citylife-places/librarista/',
    2,
    '10:00-20:00 daily',
    'Part library, part cafe - a dreamy combination for solo travelers. Browse English and Thai language books while sipping quality coffee. The peaceful atmosphere, thoughtful design, and proximity to Nimman''s best restaurants make this the perfect base for a solo afternoon.',
    true,
    'Unique concept appeals to thoughtful solo female travelers. The library element means you''re engaged (reading) but available for casual conversation. Nimman location ensures safety and walkability to other activities.',
    '["library-concept", "english-books", "quiet-vibe", "coffee-quality", "nimman-location"]'::jsonb,
    '["small-space", "closing-early-for-thailand", "can-feel-crowded"]'::jsonb,
    '"Spent my afternoon reading here with coffee. Felt like I''d found my Chiang Mai sanctuary." - UrbanPixels.com',
    'https://www.google.com/maps/search/?api=1&query=Librarista%20Cafe&query_place_id=ChIJD4H24Yk62jAROruoggeyK7M',
    'cafe',
    NULL,
    '["TripAdvisor", "Google Maps", "Chiang Mai City Life"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    86,
    4.3,
    640,
    '2026-02-10 06:38:06.869756+00',
    'afternoon',
    '2-3 hours',
    'Walk-in only',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'c9ed8696-3684-59d1-a5c3-4205cdd5a1cd',
    'ba437e7c-cb67-5276-92c8-34e4809f0c14',
    'rustic-and-blue-nimman',
    'Rustic & Blue',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    18.7879, 98.9423,
    'Nimmanhaemin Road, Soi 7, Suthep, Mueang Chiang Mai 50200',
    '+66 53 216 420',
    'https://www.rusticandblue.com',
    3,
    '08:30-22:00 daily',
    'Farm-to-table dining with European sensibility in the heart of Nimman. Artisan teas, fresh pastries, and locally-sourced mains make this a culinary discovery. The garden setting and outdoor seating create a peaceful oasis amid the Nimman buzz.',
    true,
    'Solo female travelers love the sophisticated-but-relaxed vibe. Nimman location is safe and walkable. The farm-to-table concept appeals to conscious travelers, and solo dining is completely normalized here.',
    '["farm-to-table", "artisan-teas", "garden-seating", "european-food", "nimman-location"]'::jsonb,
    '["pricey-by-thailand-standards", "can-be-busy", "limited-vegan-options"]'::jsonb,
    '"Finally found European-quality food in Chiang Mai without the hostel vibe. Felt sophisticated dining alone here." - TripAdvisor',
    'https://www.google.com/maps/search/?api=1&query=Rustic%20%26%20Blue&query_place_id=ChIJ-WreYwA72jAR_lwUyVfW90Q',
    'restaurant',
    NULL,
    '["TripAdvisor", "Google Maps", "Official website"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    84,
    4.2,
    780,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '1.5-2 hours',
    'Walk-in / Reservations recommended for dinner',
    NULL,
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '2e27dd43-025c-5c49-a842-9bc615f3857c',
    'ba437e7c-cb67-5276-92c8-34e4809f0c14',
    'about-a-bed-hostel-chiang-mai',
    'About A Bed Hostel Chiang Mai',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    18.7827, 98.9798,
    '248/53 Manee Nopparat Road, Sriphoom, Mueang Chiang Mai 50200',
    '+66 53 208 556',
    'https://www.booking.com/hotel/th/about-a-bed-hostel-chiangmai.html',
    1,
    '24/7',
    'In the heart of Old Town with boutique touches, this hostel prioritizes cleanliness and comfort over party vibes. Owner Faii is genuinely invested in guests'' experiences, with knowledge about day trips and local gems. Pod-style beds with privacy curtains and lights make dorm living civilized.',
    true,
    'Female solo travelers rave about the peaceful atmosphere and personal attention from staff. Central Old Town location means walkable access to temples, markets, and restaurants. Clean dorms make sharing space less awkward.',
    '["old-town-location", "owner-faii-amazing", "clean-dorms", "peaceful-vibe", "day-trip-help"]'::jsonb,
    '["small-property", "can-fill-up", "basic-amenities"]'::jsonb,
    '"Faii recommended the best local spots. This hostel restored my faith in backpacker spaces." - Hostelworld 9.6/10',
    'https://www.google.com/maps/search/?api=1&query=About%20A%20Bed%20Hostel%20Chiang%20Mai&query_place_id=ChIJWZaiH5E62jARRim_7KfAf5w',
    'hostel',
    '200',
    '["Booking.com", "Hostelworld", "TripAdvisor"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    99.99,
    9.2,
    475,
    '2026-02-10 06:38:06.869756+00',
    'any',
    'overnight',
    'Book via Booking.com or Hostelworld',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '8ffc61d4-dca4-5c3e-8eba-fd1a8b1fd25c',
    'ba437e7c-cb67-5276-92c8-34e4809f0c14',
    'green-sleep-hostel-chiang-mai',
    'Green Sleep Hostel',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    18.7745, 98.9825,
    '5/10 Soi 7, Rachadumnuen Road, Sri Poom, Mueang Chiang Mai 50200',
    '+66 53 344 330',
    'https://www.booking.com/hotel/th/green-sleep-hostel.html',
    1,
    '24/7',
    'Cozy and clean female-only dorms (with mixed options) in the heart of Old Town opposite the Sunday market location. Free daily breakfast, reliable WiFi, and a friendly communal space make this feel like a home base. The staff genuinely cares about your experience.',
    true,
    'Perfect for female solo travelers wanting female-only dorm options without isolation. Central Old Town location is convenient and safe. The breakfast inclusion means you can eat comfortably before daily adventures.',
    '["female-only-dorms", "free-breakfast", "old-town-location", "sunday-market-access", "friendly-staff"]'::jsonb,
    '["simple-amenities", "can-get-full", "basic-rooms"]'::jsonb,
    '"All-female dorm made me feel totally safe. Staff were so helpful. Amazing value." - Booking.com 9.4/10',
    'https://www.google.com/maps/search/?api=1&query=Green%20Sleep%20Hostel&query_place_id=ChIJIeSb25s62jARqk8jiQEMsBI',
    'hostel',
    '180',
    '["Booking.com", "Hostelworld", "TripAdvisor"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    99.99,
    9.1,
    520,
    '2026-02-10 06:38:06.869756+00',
    'any',
    'overnight',
    'Book via Booking.com or Hostelworld',
    NULL,
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '50326d1e-77c7-509a-88e9-258bcec2201a',
    'ba437e7c-cb67-5276-92c8-34e4809f0c14',
    'hidden-garden-hostel-chiang-mai',
    'Hidden Garden Hostel',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    18.7751, 98.9873,
    '11 Wua Lai Road, Haiya, Phra Sing, Mueang Chiang Mai 50100',
    '+66 53 419 219',
    'https://www.booking.com/hotel/th/hidden-garden-hostel-amphoe-mueang-chiang-mai.html',
    1,
    '24/7',
    'Social but not loud, with a beautiful garden space and local night market right outside. Spacious dorms with individual lights and lockers, friendly staff, and easy access to Old Town attractions. The garden vibe makes solo travelers feel peaceful while still connected to others.',
    true,
    'Female solo travelers appreciate the balance: sociable without party pressure. Female-friendly staff and garden setting create a welcoming atmosphere. Night market outside means evening activity and food without leaving the property.',
    '["garden-space", "night-market-outside", "spacious-dorms", "helpful-staff", "local-vibe"]'::jsonb,
    '["can-be-noisy-evenings", "fills-up-quickly", "shared-bathrooms"]'::jsonb,
    '"The garden space is magical. Felt totally safe but never lonely. Staff helped plan my entire Chiang Mai itinerary." - TripAdvisor',
    'https://www.google.com/maps/search/?api=1&query=Hidden%20Garden%20Hostel&query_place_id=ChIJ25n9a4gx2jARozEUrblt3Ew',
    'hostel',
    '220',
    '["Booking.com", "Hostelworld", "TripAdvisor"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    99.99,
    9.1,
    2116,
    '2026-02-10 06:38:06.869756+00',
    'any',
    'overnight',
    'Book via Booking.com or Hostelworld',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '42c3d015-ed35-56a3-8c40-5c5b83dcfa86',
    'ba437e7c-cb67-5276-92c8-34e4809f0c14',
    'la-maison-verte-chiang-mai',
    'La Maison Verte Guest House',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    18.7823, 98.9822,
    '1/3 Ratchamanka Road Soi 3, Phra Singh, Mueang Chiang Mai 50200',
    '+66 53 280 999',
    'https://www.agoda.com/la-maison-verte/hotel/chiang-mai-th.html',
    1,
    '24/7',
    'Female-only guest house in Old Town with air-conditioned rooms, free WiFi, and simple but clean facilities. Steps from Tha Pae Gate and temples. No common kitchen, but the female-only policy creates instant community and safety.',
    true,
    'Exclusively for female travelers. Provides solo women a completely female-centered accommodation option in the Old Town. Perfect for travelers wanting to ensure a women-only environment.',
    '["female-only-exclusive", "old-town-location", "temple-proximity", "clean-rooms", "air-conditioned"]'::jsonb,
    '["no-common-kitchen", "basic-amenities", "no-communal-space"]'::jsonb,
    '"Being the only women in my hostel... not here! Female-only really made a difference for my comfort." - Agoda',
    'https://www.google.com/maps/search/?api=1&query=La%20Maison%20Verte%20Guest%20House&query_place_id=ChIJmfFC2qE62jARkypCwRoviAo',
    'hostel',
    '210',
    '["Agoda", "Booking.com", "Google Maps"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    82,
    4.1,
    280,
    '2026-02-10 06:38:06.869756+00',
    'any',
    'overnight',
    'Book via Agoda or Booking.com',
    NULL,
    'Women-run',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'd9cedf3d-a0d3-5bdc-9c80-47402e2f34c3',
    'ba437e7c-cb67-5276-92c8-34e4809f0c14',
    'wat-phra-singh-chiang-mai',
    'Wat Phra Singh',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    18.7866, 98.9754,
    '2 Samlarn Road, Phra Singh, Mueang Chiang Mai 50200',
    '+66 53 274 677',
    'https://www.tourismthailand.org/',
    1,
    '06:00-17:00 daily',
    'One of Chiang Mai''s most revered temples, with stunning golden architecture and a deeply spiritual atmosphere. Located in the western Old Town, it''s less touristy than other temples. The intricate wood carvings and serene courtyards make this a peaceful solo meditation spot.',
    true,
    'Solo female travelers appreciate the peaceful energy and cultural authenticity. Fewer tourists than top temples mean genuinely spiritual experience. Women-respectful dress code is clearly signposted.',
    '["golden-architecture", "peaceful-energy", "wood-carvings", "fewer-crowds", "authentic-worship"]'::jsonb,
    '["dress-code-strict", "donation-requested", "can-be-quiet"]'::jsonb,
    '"So much more spiritual than the touristy temples. Sat alone in a courtyard for an hour just breathing." - TripAdvisor',
    'https://www.google.com/maps/search/?api=1&query=Wat%20Phra%20Singh&query_place_id=ChIJbyRKbps62jAR6VTNF-fZVpY',
    'landmark',
    NULL,
    '["Tourism Thailand", "TripAdvisor", "Google Maps"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    90,
    4.5,
    1340,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '1-1.5 hours',
    'Walk-in. Free entry (donation 20 THB for Viharn Lai Kham)',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '7771d827-3bfe-5b1a-96b3-9a7a17b40da8',
    'ba437e7c-cb67-5276-92c8-34e4809f0c14',
    'bua-thong-sticky-waterfall-day-trip',
    'Bua Thong Sticky Waterfall Day Trip',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    19.3582, 98.6754,
    'Namtok Bua Tong-Nam Phu Chet Si National Park, Mae Taeng District, Chiang Mai',
    NULL,
    'https://www.viator.com/tours/Chiang-Mai/Bua-Tong-Sticky-Waterfalls-and-Picnic-with-a-Local/d5267-115358P2',
    2,
    'Daylight hours, tours available 08:00-12:00',
    'Just outside Chiang Mai, climb a limestone waterfall without equipment because minerals in the water make rocks sticky. It''s surreal, fun, and unforgettable. The 1.5-hour drive is worth it for the unique experience of walking up a waterfall in your bare feet.',
    true,
    'Perfect for solo female travelers wanting an active adventure. Group tours mean built-in companionship. The activity is achievable for most fitness levels and incredibly Instagram-worthy.',
    '["sticky-limestone", "unique-experience", "no-equipment-needed", "swimming-holes", "jungle-setting"]'::jsonb,
    '["early-start", "long-drive", "can-be-slippery-even-sticky", "limited-wet-clothes-storage"]'::jsonb,
    '"Joined a tour group, made friends, climbed a waterfall barefoot. Peak Chiang Mai adventure." - Viator',
    'https://www.google.com/maps/search/?api=1&query=Bua%20Thong%20Sticky%20Waterfall%20Day%20Trip&query_place_id=ChIJiXiBQ-kb2jARHfa8qGwbWcc',
    'activity',
    NULL,
    '["Viator", "GetYourGuide", "Official parks website"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    92,
    4.6,
    980,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '7-8 hours (including drive)',
    'Book via Viator, GetYourGuide, or hire private transport from Chiang Mai',
    'moderate',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '1358f668-7273-52b1-a583-31059545690d',
    'ba437e7c-cb67-5276-92c8-34e4809f0c14',
    'chiang-mai-sunday-night-market',
    'Chiang Mai Sunday Night Market (Wua Lai Walking Street)',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    18.7745, 98.9825,
    'Wua Lai Road / Sunday Night Market Area, Old Town, Chiang Mai',
    NULL,
    'https://www.backpackerswanderlust.com/chiang-mai-sunday-night-market-thailand/',
    1,
    '16:00-24:00 Sundays',
    'The famous Sunday market transforms Wua Lai Road into a night bazaar of local crafts, street food, and live music. Come early (4-5pm) to avoid overwhelming crowds and chat with vendors. It''s authentic Chiang Mai culture where locals outnumber tourists.',
    true,
    'Perfect for solo female travelers wanting authentic local experience. Early timing means manageable crowds while still capturing the vibe. Constant activity and foot traffic ensures safety.',
    '["local-crafts", "street-food", "live-music", "sunday-tradition", "authentic-vendors"]'::jsonb,
    '["crowded-evenings", "extremely-hot-weather", "tightly-packed", "can-be-touristy-later"]'::jsonb,
    '"Go early and you get the real thing. Went at 4:30pm and had space to browse, chat with vendors, eat in peace." - TravellingKing.com',
    'https://www.google.com/maps/search/?api=1&query=Chiang%20Mai%20Sunday%20Night%20Market%20%28Wua%20Lai%20Walking%20Street%29&query_place_id=ChIJ_5-9gHUw2jARGOGQoIf_O4Q',
    'activity',
    NULL,
    '["TripAdvisor", "Google Maps", "Local guides"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    86,
    4.3,
    1520,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '2-3 hours',
    'No booking. Free entry. Sundays only.',
    'easy',
    'Trending',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'da1c2717-78f5-5a71-af22-1615b0fc6eba',
    'a2e8b89b-2ff1-5a53-b441-9a035c1f402e',
    'young-son-cafe-koh-phangan',
    'Young Son Cafe',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    9.1833, 100.4,
    'Moo 4, Mae Nam, Koh Phangan, Surat Thani 84280',
    NULL,
    'https://www.nomadwise.io/coworking/thailand-koh-phangan-young-son-cafe',
    2,
    '06:30-16:00 daily',
    'Peacefully situated in a jungle garden setting with swaying palms, this cafe opened in 2021 with a commitment to exceptional coffee and relaxation. It''s perfect for mornings - grab your flat white, settle into a hammock, and let the island pace wash over you. No WiFi, which is actually the point.',
    true,
    'Solo female travelers seeking digital detox love this spot. The morning hours (before closing at 4pm) are quiet and reflective. Safe, peaceful, staffed by women who understand solo travelers.',
    '["jungle-garden-setting", "exceptional-coffee", "hammocks", "no-wifi-digital-detox", "peaceful-vibe"]'::jsonb,
    '["early-closing", "no-wifi", "no-seating-inside", "limited-food-options"]'::jsonb,
    '"Spent mornings here writing with the most stunning jungle soundtrack. Reset my entire energy." - Nomadwise',
    'https://www.google.com/maps/search/?api=1&query=Young%20Son%20Cafe&query_place_id=ChIJ9V1w7lT9VDARlVO5GXqQtWw',
    'cafe',
    NULL,
    '["Nomadwise", "Wanderlog", "Google Maps"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    86,
    4.3,
    310,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '1-2 hours',
    'Walk-in only',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '17c47ca7-0a62-50c3-be77-030c79c096e0',
    'a2e8b89b-2ff1-5a53-b441-9a035c1f402e',
    'satimi-ice-cream-koh-phangan',
    'Satimi Sook (Homemade Ice Cream)',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    9.175, 100.4083,
    'Koh Phangan, Surat Thani 84280',
    NULL,
    'https://www.happycow.net/reviews/satimi-koh-phangan-191262',
    1,
    '10:00-18:00 Tue-Sun (Closed Mondays)',
    'Small artisanal ice cream shop making natural gelato, sherbet, and vegan sorbetto from locally-sourced ingredients. No artificial colors or preservatives. It''s the kind of sweet spot (literally) where you feel the owner''s care in every scoop.',
    true,
    'Solo female travelers love the low-pressure, high-quality vibe. The small shop means personalized service without salesy pressure. Perfect cooling-off spot after beach days.',
    '["homemade-gelato", "natural-ingredients", "vegan-options", "no-artificial-colors", "local-vibe"]'::jsonb,
    '["closed-mondays", "early-closing", "limited-seating", "seasonal-limited-flavors"]'::jsonb,
    '"Best ice cream I''ve had. Supporting a solo female business owner felt meaningful." - TripAdvisor',
    'https://www.google.com/maps/search/?api=1&query=Satimi%20Sook%20%28Homemade%20Ice%20Cream%29&query_place_id=ChIJfQ5MDSL9VDARyobCmhfJ3dE',
    'cafe',
    NULL,
    '["TripAdvisor", "HappyCow", "Lonely Planet"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    90,
    4.5,
    145,
    '2026-02-10 06:38:06.869756+00',
    'afternoon',
    '30 minutes',
    'Walk-in only',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'e67cb0ce-de2b-53d1-a899-4d3252fb1afd',
    'a2e8b89b-2ff1-5a53-b441-9a035c1f402e',
    'koh-raham-restaurant-beach-bar',
    'Koh Raham Restaurant & Beach Bar',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    9.1483, 100.365,
    'Haad Son Resort, 85 Moo 8, Koh Phangan, Surat Thani 84280',
    '+66 77 956 660',
    'https://haadsonresortkohraham.th-thailand.com/',
    3,
    '10:00-22:00 daily (seasonal hours)',
    'Hidden gem on the island''s quietest beach, accessible through Haad Son Resort. Watch the sunset with your toes in the sand while eating fresh seafood. The isolation feels luxurious for solo travelers - peaceful but not lonely.',
    true,
    'Perfect for solo female travelers wanting to feel special. The effort to access (hiking down) means fewer tourists. Sunset views and beachfront dining make solo dining feel like self-care.',
    '["sunset-views", "hidden-location", "seafood", "beachfront", "peaceful-quiet"]'::jsonb,
    '["hard-to-access", "steep-walk-down", "seasonal-closures", "pricy-for-koh-phangan"]'::jsonb,
    '"Felt like I''d discovered my own private beach. Solo sunset dinner was the highlight of my trip." - Tripadvisor',
    'https://www.google.com/maps/search/?api=1&query=Koh%20Raham%20Restaurant%20%26%20Beach%20Bar&query_place_id=ChIJKaDcHcQBVTARZGuCfCsdHII',
    'restaurant',
    NULL,
    '["TripAdvisor", "Official website", "Google Maps"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    88,
    4.4,
    520,
    '2026-02-10 06:38:06.869756+00',
    'evening',
    '2-3 hours',
    'Walk-in / Reservations recommended',
    'moderate',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '40aef2bb-2a73-5693-b04c-794698325c2f',
    'a2e8b89b-2ff1-5a53-b441-9a035c1f402e',
    'purple-house-female-hostel-koh-phangan',
    'Purple House Female-Only Boutique Hostel',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    9.16, 100.395,
    'Koh Phangan, Surat Thani 84280',
    '+66 77 375 251',
    'https://www.booking.com/hotel/th/purple-house-female-only-boutique-hostel-koh-phangan.html',
    1,
    '24/7',
    'Female-only boutique hostel designed specifically for women travelers. Stylish aesthetic, secure dorms with quality bedding, common areas for connection. The female-focused design means safety and community without any compromise.',
    true,
    'Exclusively for women. Provides peace of mind and automatic sisterhood. Design acknowledges female travelers'' specific needs and preferences.',
    '["female-only-exclusive", "boutique-design", "security-focused", "women-staff", "community-vibe"]'::jsonb,
    '["all-female-dynamic", "can-fill-quickly", "limited-mixed-option"]'::jsonb,
    '"Best solo travel decision I made. Female-only meant true safety and built-in friends." - Booking.com 9.1/10',
    'https://www.google.com/maps/search/?api=1&query=Purple%20House%20Female-Only%20Boutique%20Hostel&query_place_id=ChIJ3Rf7MP39VDAR6fq-GQDMLJI',
    'hostel',
    '280',
    '["Booking.com", "Hostelworld", "Google Maps"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    99.99,
    9.1,
    380,
    '2026-02-10 06:38:06.869756+00',
    'any',
    'overnight',
    'Book via Booking.com or directly',
    NULL,
    'Women-run',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'ff14f2b4-0b9e-57a8-958a-96005b730303',
    'a2e8b89b-2ff1-5a53-b441-9a035c1f402e',
    'anantara-rasananda-koh-phangan',
    'Anantara Rasananda Koh Phangan Villas',
    'hotel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    9.2417, 100.395,
    '5/5 Moo 5 Thong Nai Pan Noi Beach, Baan Tai, Koh Phangan, Surat Thani 84280',
    '+66 77 956 660',
    'https://www.anantara.com/en/rasananda-koh-phangan',
    4,
    '24/7',
    'Koh Phangan''s first true luxury resort sits on pristine Thong Nai Pan Noi Beach, the island''s most tranquil setting. Private villas with pools, world-class spa, and personalized service create a wellness retreat. Solo travel here feels like legitimate self-care and celebration.',
    true,
    'Perfect for solo female travelers wanting to treat themselves. Luxury with genuine warmth. Beach location is peaceful and safe. Spa services cater specifically to stress relief.',
    '["luxury-villas", "private-pools", "spa-world-class", "pristine-beach", "personalized-service"]'::jsonb,
    '["expensive", "book-far-ahead", "quieter-for-some"]'::jsonb,
    '"Booked a villa alone for my birthday. Staff treated me like I mattered. Transformative experience." - TripAdvisor',
    'https://www.google.com/maps/search/?api=1&query=Anantara%20Rasananda%20Koh%20Phangan%20Villas&query_place_id=ChIJZ-YSNOoCVTAR0YNeV-d-i9U',
    'hotel',
    '4500',
    '["Official website", "TripAdvisor", "Booking.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    99.99,
    9.2,
    850,
    '2026-02-10 06:38:06.869756+00',
    'any',
    'overnight',
    'Book via official website or luxury travel agents',
    NULL,
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'a18b87d3-042c-5e33-9364-abbb00cc7fba',
    'a2e8b89b-2ff1-5a53-b441-9a035c1f402e',
    'remote-and-digital-coworking-koh-phangan',
    'Remote & Digital (La Casa Coworking)',
    'coworking',
    '09cc7275-a3ac-517e-b3fc-c257f4613f63',
    9.158, 100.39,
    '99/46 Moo 1, Tambon Kohphangan Thongsala, Koh Phangan, Surat Thani 84280',
    '+66 77 239 147',
    'https://remoteanddigital.com/',
    2,
    '08:00-18:00 daily (24-hour access available)',
    'Oceanfront coworking space with fiber internet, air conditioning, ergonomic desks, and private meeting rooms. Full-service restaurant and daily events mean you''re never isolated. Perfect for digital nomads and remote workers.',
    true,
    'Solo female travelers working remotely get stable WiFi, professional environment, and built-in community through events. Oceanfront location is inspiring. Female-friendly atmosphere.',
    '["fiber-internet", "oceanfront-view", "private-rooms", "restaurant", "community-events"]'::jsonb,
    '["pricey-for-koh-phangan", "crowded-during-high-season", "membership-model"]'::jsonb,
    '"Found my coworking community here. Felt professional and connected as a solo remote worker." - Coworker.com',
    'https://www.google.com/maps/search/?api=1&query=Remote%20%26%20Digital%20%28La%20Casa%20Coworking%29&query_place_id=ChIJXV1vMJ79VDARHTfq4FD9py0',
    'coworking',
    NULL,
    '["Official website", "Coworker.com", "Google Maps"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    88,
    4.4,
    185,
    '2026-02-10 06:38:06.869756+00',
    'any',
    'hours/days',
    'Day pass / Monthly membership available',
    NULL,
    'Work-friendly',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '6b8d6141-e307-5199-8498-50d6dada578b',
    'a2e8b89b-2ff1-5a53-b441-9a035c1f402e',
    'orion-healing-center-koh-phangan',
    'Orion Healing Center',
    'wellness',
    '21d190d3-2f37-5e07-a1fc-70bd969ab432',
    9.1683, 100.4217,
    '15/2 Moo 8, Sri Thanu, Koh Phangan, Surat Thani 84280',
    '+66 77 239 084',
    'https://www.orionhealing.com/',
    3,
    '08:00-20:00 daily (class schedules vary)',
    'Holistic healing center founded in 2005 offering yoga, detox programs, Reiki, massage, and spa therapies. The jungle setting creates authentic wellness retreat vibes. Classes for all levels, so you can show up exactly as you are.',
    true,
    'Perfect for solo female travelers prioritizing self-care and wellness. All-levels classes mean zero pressure. Female-focused environment and community-oriented programming.',
    '["yoga-classes", "detox-programs", "massage-spa", "jungle-setting", "beginner-friendly"]'::jsonb,
    '["book-popular-classes", "can-feel-crowded", "pricing-varies-widely"]'::jsonb,
    '"Took a yoga class alone, stayed for community. This place healed what I didn''t know was broken." - BookRetreats.com',
    'https://www.google.com/maps/search/?api=1&query=Orion%20Healing%20Center&query_place_id=ChIJ__zgCCH-VDARXiKqT6BtWf4',
    'wellness',
    NULL,
    '["Official website", "BookRetreats", "Google Maps"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    92,
    4.6,
    420,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '1-2 hours (class) or multi-day (retreat)',
    'Drop-in classes or pre-booked retreats',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'a0193a80-f9af-5b52-9c3d-c688dc9a47b0',
    'a2e8b89b-2ff1-5a53-b441-9a035c1f402e',
    'beachlove-hostel-koh-phangan',
    'Beachlove Hostel',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    9.13, 100.415,
    'Koh Phangan, Surat Thani 84280',
    '+66 77 337 409',
    'https://www.booking.com/hotel/th/beachlove-hostel-koh-phangan.html',
    1,
    '24/7',
    'Beachfront hostel with laid-back island vibe. Clean dorms, beach access, and evening hangouts create community without pressure. Perfect for solo travelers who want to meet people but maintain independence.',
    true,
    'Direct beach access is rare for budget travelers. Female-friendly staff and community-oriented vibe. Safe, well-lit, and welcoming to solo women.',
    '["beachfront-location", "clean-dorms", "beach-access", "social-vibe", "budget-friendly"]'::jsonb,
    '["can-be-noisy", "party-crowd-sometimes", "simple-amenities"]'::jsonb,
    '"Made friends without trying. Beachfront made the whole experience better." - Hostelworld',
    'https://www.google.com/maps/search/?api=1&query=Beachlove%20Hostel&query_place_id=ChIJN2i0uVr8VDARFBpM50L6XAU',
    'hostel',
    '260',
    '["Booking.com", "Hostelworld", "Google Maps"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    84,
    4.2,
    350,
    '2026-02-10 06:38:06.869756+00',
    'any',
    'overnight',
    'Book via Booking.com or Hostelworld',
    NULL,
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '427a3e29-0d1d-55f6-91eb-0a4ad07fb766',
    'a2e8b89b-2ff1-5a53-b441-9a035c1f402e',
    'indriya-retreat-meditation-koh-phangan',
    'Indriya Retreat (Meditation & Yoga)',
    'wellness',
    '21d190d3-2f37-5e07-a1fc-70bd969ab432',
    9.17, 100.3833,
    'Coconut Lane, between Hin Kong and Sri Thanu, Koh Phangan, Surat Thani 84280',
    '+66 77 230 538',
    'https://indriyaretreat.org/',
    3,
    'Varies by retreat schedule (typically 5-7 day programs)',
    'Serious meditation and yoga retreat center teaching Vipassana techniques. Multi-day immersion programs with vegetarian meals, accommodations, and expert instruction. Perfect for solo travelers seeking deep personal work.',
    true,
    'Ideal for solo female travelers wanting transformational experience. Structured retreats provide community and guidance. Women-centered programming available.',
    '["vipassana-meditation", "yoga-instruction", "retreat-programs", "vegan-meals", "expert-teachers"]'::jsonb,
    '["commitment-required", "intense-experience", "advance-booking", "quiet-requirement"]'::jsonb,
    '"10-day retreat changed my perspective on everything. Being with other meditators made the intensity manageable." - BookRetreats.com',
    'https://www.google.com/maps/search/?api=1&query=Indriya%20Retreat%20%28Meditation%20%26%20Yoga%29&query_place_id=ChIJFUAUrev_VDARo-Twa-ZQELw',
    'wellness',
    NULL,
    '["Official website", "BookRetreats", "Google Maps"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Thailand)',
    94,
    4.7,
    285,
    '2026-02-10 06:38:06.869756+00',
    'any',
    '5-10 days minimum',
    'Pre-booked retreat programs only',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '71b673a0-86bd-5104-92bf-ff4b7cbe4c96',
    'c3b16617-37de-5b65-b7aa-1eff660955ad',
    'asia-vespa-tours-women-led',
    'Asia Vespa Tours - Women-Led Hanoi Tours',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    21.0327, 105.8444,
    '44 Ham Tu Quan Street, Hoan Kiem District, Hanoi',
    '+84 90 321 0502',
    'asiavespatours.com',
    3,
    'Tours depart 9:00 AM, 1:00 PM, 5:30 PM daily',
    'You''ll ride as a passenger on a vintage Vespa driven by an empowered local Vietnamese woman, discovering hidden local eateries, hearing stories about Hanoi''s past and present. This isn''t tourism-as-usualâit''s a feminist business model that benefits local women while giving you an unforgettable, intimate city experience.',
    true,
    'Women-led tour company ranked #1 on TripAdvisor with feminist business model, authentic local connection, and specialized focus on female safety and empowerment',
    '["female vespa riders", "local eateries visited", "feminist business model", "TripAdvisor #1 rated", "personalized routes", "authentic local perspectives"]'::jsonb,
    '["no prior biking experience needed", "weather dependent", "reservation required"]'::jsonb,
    'My female driver was amazingâknowledgeable, kind, and genuinely invested in my experience. Eating street food we stopped at was unforgettable. Supporting a women-owned business felt important. - Solo female traveler',
    'https://www.google.com/maps/search/?api=1&query=Asia%20Vespa%20Tours%20-%20Women-Led%20Hanoi%20Tours&query_place_id=ChIJH9AS_pKrNTERuoUreszQtPk',
    'activity',
    NULL,
    '["asiavespatours.com", "Google Maps", "TripAdvisor"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    98,
    4.9,
    2147,
    '2026-02-10 06:38:06.869756+00',
    'afternoon',
    '3-4 hours',
    'Book via website asiavespatours.com or direct call',
    'moderate',
    'Women-run',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '2b7d5e6e-8d94-5cc3-a54b-673736c989e7',
    'c3b16617-37de-5b65-b7aa-1eff660955ad',
    'bluebirds-nest-hanoi',
    'Bluebirds'' Nest',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    21.0334, 105.8334,
    '19 Dang Dung Street, Ba Dinh District, Hanoi',
    '+84 34 956 5226',
    NULL,
    2,
    '8:00 AM - 10:30 PM daily',
    'You''ll discover this cozy book cafe with resident cats, overflowing shelves, and a rooftop terrace that becomes your instant refuge. Downstairs is quiet and library-like; upstairs opens to greenery and skyâperfect for solo travelers seeking work-life balance between focused productivity and peaceful contemplation.',
    true,
    'Unique book cafe with cats, outdoor space, and dual personality (quiet downstairs, social upstairs) appealing to different solo moods',
    '["resident cats", "extensive book collection", "rooftop terrace", "quiet atmosphere", "greenery", "welcoming community"]'::jsonb,
    '["small space", "can get crowded", "limited food options", "no strong wifi"]'::jsonb,
    'Bluebirds'' Nest is pure solo-travel magic. The cats, the books, the quietâI worked for 4 hours and never felt rushed. Other solo travelers were scattered around. Safe, welcoming, authentic. - Solo female nomad',
    'https://www.google.com/maps/search/?api=1&query=Bluebirds%27%20Nest&query_place_id=ChIJkcjWsLqrNTERdatZe_6Zzec',
    'cafe',
    NULL,
    '["Google Maps", "Tripadvisor", "Book cafe guides"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    90,
    4.5,
    234,
    '2026-02-10 06:38:06.869756+00',
    'afternoon',
    '2-4 hours',
    'Walk-in only',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '06e4c2d2-7111-52a3-8676-487f9c1a660f',
    'c3b16617-37de-5b65-b7aa-1eff660955ad',
    'bun-thang-ba-duc',
    'Bun Thang Ba Duc',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    21.0285, 105.8508,
    '48 Cao Go Street, Hoan Kiem District, Hanoi',
    NULL,
    NULL,
    1,
    '10:00 AM - 2:00 PM daily',
    'You''ll taste the best bun thang (chicken noodle soup) in Hanoi at this hole-in-the-wall spot where locals queue for silky broth, tender chicken, and elaborately arranged ingredients that look like edible art. The solo-dining setup is natural and budget-consciousâexpect to share communal tables or get served at counter.',
    true,
    'Highly-regarded traditional specialty restaurant with authentic local crowd, budget pricing, and natural solo-dining community setup',
    '["best bun thang in Hanoi", "artistic ingredient arrangement", "silky broth", "local clientele", "budget pricing"]'::jsonb,
    '["limited hours (10am-2pm)", "no reservations", "communal seating", "very basic setting"]'::jsonb,
    'This is where Hanoi gets breakfast. Solo diners are normal. Sharing space with locals eating the same thing you are creates connection without awkwardness. Soup was amazing and cost $1. - Solo backpacker',
    'https://goo.gl/maps/BunThang',
    'restaurant',
    NULL,
    '["Google Maps", "Tripadvisor", "Food blogs"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    94,
    4.7,
    223,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '30 minutes',
    'Walk-in only; no reservations',
    'easy',
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'b271086c-f823-5114-8c7a-70a764ce9cc9',
    'c3b16617-37de-5b65-b7aa-1eff660955ad',
    'cafe-giang-hanoi',
    'CafÃ© Giáº£ng - Egg Coffee',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    21.0295, 105.8506,
    '39 Nguyen Huu Huan Street, Hoan Kiem District, Hanoi',
    '+84 98 989 2298',
    'cafegiang.vn',
    1,
    '7:00 AM - 10:00 PM daily',
    'You absolutely must try the legendary egg coffee hereâa thick, silky layer of whipped egg yolk and condensed milk topping strong Vietnamese robusta. This historic cafe in a tiny Old Quarter alley is where the drink was literally invented in 1946, and solo travelers crowd in seeking the authentic, unbeatable version.',
    true,
    'Iconic cultural cafe and birthplace of egg coffee with historic significance, affordable pricing, and naturally social solo-friendly atmosphere',
    '["legendary egg coffee", "historic location since 1946", "strong vietnamese coffee", "tiny alley location", "local gathering spot"]'::jsonb,
    '["no A/C or western comfort", "can be hot and crowded", "limited seating", "no wifi"]'::jsonb,
    'The egg coffee was incredibleâunlike anything I''d had. Sitting in the tiny alley surrounded by locals and other solo travelers felt authentically Hanoi. Worth the small discomfort. - Solo female backpacker',
    'https://www.google.com/maps/search/?api=1&query=Caf%C3%83%C2%A9%20Gi%C3%A1%C2%BA%C2%A3ng%20-%20Egg%20Coffee&query_place_id=ChIJgWaawsCrNTER216qul6ubmY',
    'cafe',
    NULL,
    '["Google Maps", "Tripadvisor", "cafegiang.vn"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    94,
    4.7,
    1847,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '45 minutes',
    'Walk-in only; no reservations',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '57209d6f-d7d3-59fd-8d57-98876c610c2b',
    'c3b16617-37de-5b65-b7aa-1eff660955ad',
    'cha-ca-thang-long',
    'Cháº£ CÃ¡ ThÄng Long',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    21.0272, 105.852,
    '30 Au Trieu Street, Hoan Kiem District, Hanoi',
    '+84 24 3824 2566',
    NULL,
    2,
    '11:00 AM - 8:00 PM daily',
    'You''ll watch your turmeric-marinated catfish cook directly at your table in this Old Quarter classic that''s been serving the same iconic dish for 130+ years. Solo diners at individual tables are the norm hereâit''s a communal-but-individual dining setup where you focus on your perfect plate of fried fish and dill.',
    true,
    'Historic traditional restaurant with simple, singular specialty creating natural solo-dining environment and cultural food experience',
    '["table-top cooking", "turmeric fish specialty", "traditional preparation", "historic reputation", "local crowd"]'::jsonb,
    '["one dish specialty", "can get crowded", "limited English menu", "tableside cooking heats dining area"]'::jsonb,
    'Watching my fish cook at my table was mesmerizing. Solo dining felt naturalâeveryone was focused on their food. Authentic, not touristy. A real Hanoi food moment. - Food travel blog',
    'https://www.google.com/maps/search/?api=1&query=Cha%20Ca%20Thang%20Long&query_place_id=ChIJvxBc3TSrNTERmc5NPItxzgY',
    'restaurant',
    NULL,
    '["Google Maps", "Tripadvisor", "Food guides"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    92,
    4.6,
    412,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '1 hour',
    'Walk-in; no reservations needed',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '77b862e8-8bf0-5ae2-a652-a43bebedcf10',
    'c3b16617-37de-5b65-b7aa-1eff660955ad',
    'duongs-restaurant',
    'Duong''s Restaurant',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    21.0298, 105.848,
    '7 Hang Dieu Street, Hoan Kiem District, Hanoi',
    '+84 24 3824 6896',
    'duongsrestaurant.com',
    2,
    '10:00 AM - 10:00 PM daily',
    'You''ll find this charming restaurant teaching both cooking classes and serving authentic North Vietnamese comfort food that tastes like what locals cook at home. The atmosphere welcomes solo travelersâdiners are spread naturally across tables, staff is genuinely helpful, and each dish connects you to real Hanoi culinary traditions.',
    true,
    'Multi-functional restaurant with cooking class option, authentic Northern cuisine, and solo-friendly service in central Old Quarter location',
    '["cooking classes available", "authentic North Vietnamese food", "family recipes", "educational menus", "helpful staff"]'::jsonb,
    '["popular for tours (can feel touristy)", "casual setting", "basic ambiance"]'::jsonb,
    'I took a cooking class AND ate at Duong''s. Staff treated solo female travelers like valued guests. Food felt authentic. The cooking class option made it extra special. - Solo female traveler',
    'https://www.google.com/maps/search/?api=1&query=Duong%27s%20Restaurant&query_place_id=ChIJecDzv5WrNTERyZe6bcGxMBA',
    'restaurant',
    NULL,
    '["Google Maps", "Duong''s website", "Tripadvisor"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    90,
    4.5,
    567,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '1.5 hours',
    'Walk-in for dining; book cooking classes in advance',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '3b52a947-3d43-54c6-a116-a40d90da9c0c',
    'c3b16617-37de-5b65-b7aa-1eff660955ad',
    'hanoi-buffalo-hostel',
    'Hanoi Buffalo Hostel',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    21.0303, 105.8536,
    '44 Hang Giay Street, Hoan Kiem District, Hanoi',
    '+84 86 273 2899',
    'buffalohostels.com',
    1,
    '24/7',
    'You''ll love this hostel''s combination of comfortable beds, awesome social atmosphere, and Prime Old Quarter location right near Beer Hoi corner. Solo travelers find the natural meeting points (common kitchen, rooftop, front seating) make finding companions easy, but you can equally hide away when needed.',
    true,
    'Popular budget hostel with strong reputation for comfort and social atmosphere in prime Old Quarter location near beer-street activity',
    '["comfortable beds", "awesome atmosphere", "near beer hoi corner", "common kitchen", "rooftop area", "prime location"]'::jsonb,
    '["can be rowdy", "lively scene (not quiet)", "booking recommended"]'::jsonb,
    'Buffalo had the perfect balance. Super social if you want it (beer hoi street action!), but easy to take breaks alone. Bed was actually comfortable. Staff was helpful. Felt safe and fun. - Solo female traveler',
    'https://www.google.com/maps/search/?api=1&query=Hanoi%20Buffalo%20Hostel&query_place_id=ChIJ2dmnILWrNTER9XP9YdDhqDQ',
    'hostel',
    '5.5',
    '["Google Maps", "buffalohostels.com", "Hostelworld"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    90,
    4.5,
    523,
    '2026-02-10 06:38:06.869756+00',
    'evening',
    '1+ nights',
    'Book via Hostelworld, Booking.com, or buffalohostels.com',
    'easy',
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'a6efd0d5-e0a3-50d2-98b6-dbdeae7a72c1',
    'c3b16617-37de-5b65-b7aa-1eff660955ad',
    'little-charm-hostel',
    'Little Charm Hanoi Hostel',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    21.0353, 105.8528,
    '44 Hang Bo, Old Quarter, Hoan Kiem District, Hanoi',
    '+84 24 2211 6895',
    'littlecharmhanoihostel.vn',
    1,
    '24/7',
    'You''ll settle into this charming mix of modern Italian-inspired design and traditional Vietnamese warmth where staff is genuinely enthusiastic about your trip. Solo travelers appreciate the balance of social opportunities through daily events and peaceful private spacesâplus the Old Quarter location means instant access to Hanoi''s energy.',
    true,
    'Well-regarded Old Quarter hostel with emphasis on staff warmth, beautiful design, and balance of social and solo-friendly atmosphere',
    '["modern-traditional design blend", "enthusiastic staff", "great location", "social events", "rooftop area"]'::jsonb,
    '["popular/can be crowded", "Old Quarter noise", "limited quiet zones"]'::jsonb,
    'Staff made me feel genuinely welcome as a solo female. The hostel wasn''t just a place to sleepâit was a community. Morning walks through Old Quarter with other guests were easy to join or skip. Felt safe. - Solo female backpacker',
    'https://www.google.com/maps/search/?api=1&query=Little%20Charm%20Hanoi%20Hostel&query_place_id=ChIJW4FHELyrNTER0oiuwtpVPLk',
    'hostel',
    '6.0',
    '["Google Maps", "littlecharmhanoihostel.vn", "Booking.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    92,
    4.6,
    478,
    '2026-02-10 06:38:06.869756+00',
    'evening',
    '1+ nights',
    'Book via Booking.com, Agoda, or website',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '1a989cd1-837d-54fc-bc37-7438756e57c1',
    'c3b16617-37de-5b65-b7aa-1eff660955ad',
    'tranquil-books-coffee',
    'Tranquil Books & Coffee',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    21.0324, 105.8456,
    '5 P. Nguyen Quang Bich, Cua Dong, Hoan Kiem District, Hanoi',
    '+84 84 3950 4907',
    NULL,
    2,
    '8:00 AM - 10:00 PM daily',
    'You''ll appreciate this quiet alley cafe''s perfect balance of books, coffee quality, and genuine peace. The thoughtful design respects silence, natural light streams through, and other patrons are similarly contemplativeâmaking it ideal for solo work, reading, or simply existing without pressure to perform ''being social''.',
    true,
    'Quiet book cafe in peaceful Old Quarter alley offering work-friendly environment and respectful solo space away from backpacker noise',
    '["extensive book collection", "quiet atmosphere", "natural light", "good wifi", "hot and cold drinks", "peaceful location"]'::jsonb,
    '["limited seating", "no food service", "hidden alley location (hard to find)"]'::jsonb,
    'This cafe saved my sanity during my Hanoi stay. The quiet was restorative. Other solo travelers were reading/working. Staff was kind and left you alone. Genuinely peaceful. - Solo traveler blog',
    'https://www.google.com/maps/search/?api=1&query=Tranquil%20Books%20%26%20Coffee&query_place_id=ChIJaTMG6b2rNTER8iBBB4Ctlr8',
    'cafe',
    NULL,
    '["Google Maps", "Tripadvisor"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    88,
    4.4,
    187,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '2-3 hours',
    'Walk-in only',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '991f2043-555b-5cbb-b96a-7b6356206e63',
    '80529793-1f29-5f6b-8b01-e58f4385e956',
    'fito-museum',
    'FITO Museum (Museum of Traditional Vietnamese Medicine)',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    10.7438, 106.6752,
    '41 Hoang Du Khuong, Ward 12, District 10, Ho Chi Minh City',
    '+84 28 3860 4329',
    'fitomuseum.com.vn',
    1,
    '8:30 AM - 5:00 PM daily',
    'You''ll explore Vietnam''s herbal medicine heritage across 6 floors and 18 rooms showcasing 3,000+ traditional medicine artifacts. This unique museum teaches you about ginseng, herbs, and ancient healing practices while offering a wellness-focused cultural experience that solo travelers find genuinely restorative.',
    true,
    'Unique cultural wellness attraction with affordable admission, peaceful atmosphere, and educational focus on traditional health practices',
    '["3,000+ medicine artifacts", "herbal displays", "historical documents", "traditional healing tools", "educational signage"]'::jsonb,
    '["can feel museum-quiet", "some exhibits in Vietnamese only", "located in District 10 (further from center)"]'::jsonb,
    'This museum changed how I think about healthcare. Learning about herbal traditions was fascinating and felt wellness-focused. Great for solo reflection time. - Wellness travel blog',
    'https://www.google.com/maps/search/?api=1&query=FITO%20Museum%20%28Museum%20of%20Traditional%20Vietnamese%20Medicine%29&query_place_id=ChIJC044E9kudTERi2Ozcof-Was',
    'landmark',
    NULL,
    '["Google Maps", "Vietnam Discovery"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    88,
    4.4,
    189,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '2 hours',
    'Walk-in admission; entrance fee VND 180,000 (~$7)',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '03afddd0-fb84-54e3-bb6c-d4ef068e426a',
    '80529793-1f29-5f6b-8b01-e58f4385e956',
    'ho-chi-minh-fine-arts-museum',
    'Ho Chi Minh City Museum of Fine Arts',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    10.7874, 106.7004,
    '97 Pho Duc Chinh, District 1, Ho Chi Minh City',
    '+84 28 3829 4441',
    'vnfam.vn',
    1,
    '9:00 AM - 5:00 PM daily',
    'You''ll wander through this elegant French mansion (nicknamed ''the mansion with 99 doors'') discovering 21,000+ artworks spanning Vietnamese art history. Solo contemplation of beautiful pieces in quiet galleries is exactly the right pace for understanding Vietnamese artistic evolution and cultural identity.',
    true,
    'Highly-regarded cultural institution with peaceful solo-friendly atmosphere, accessible admission price, and comprehensive Vietnamese art collection',
    '["Vietnamese art collection", "historic French architecture", "spacious galleries", "knowledgeable staff", "affordable admission"]'::jsonb,
    '["limited English descriptions", "can be quiet (few other visitors)", "several floors to explore"]'::jsonb,
    'Perfect museum for solo art lovers. The silence and space made it meditative. I took my time reading about each period of Vietnamese art. Staff was helpful explaining context. - Art travel blog',
    'https://www.google.com/maps/search/?api=1&query=Ho%20Chi%20Minh%20City%20Museum%20of%20Fine%20Arts&query_place_id=ChIJPccxGQAvdTERYMYelqaxe8M',
    'landmark',
    NULL,
    '["Google Maps", "Vietnam Discovery", "VNFAM website"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    90,
    4.5,
    412,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '2-3 hours',
    'Walk-in admission; small entrance fee (VND 30,000)',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'b5b99a6d-4fd7-5004-bd9a-ff4dda16afc3',
    '80529793-1f29-5f6b-8b01-e58f4385e956',
    'jade-emperor-pagoda',
    'Jade Emperor Pagoda (Ngoc Hoang Pagoda)',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    10.7741, 106.7025,
    '73 Mai Thi Luu, Da Kao Ward, District 1, Ho Chi Minh City',
    NULL,
    NULL,
    0,
    '7:00 AM - 5:30 PM daily (5:00 AM - 7:00 PM on lunar 1st and 15th)',
    'You''ll step into incense-filled tranquility at this early-20th century pagoda where intricate wooden carvings and peaceful meditation spaces offer refuge from Saigon''s hustle. Solo visitors are welcomed respectfullyâthis is a working temple where you can genuinely experience Vietnamese spirituality without tourist performance.',
    true,
    'Authentic cultural landmark offering peaceful spiritual experience, free admission, and genuine solo contemplation space away from main tourist areas',
    '["intricate wooden carvings", "incense-filled atmosphere", "working temple", "peaceful garden", "free admission", "local worshippers welcome tourists"]'::jsonb,
    '["dress modestly (shoulders/knees covered)", "no photography in some areas", "can be crowded on lunar calendar days"]'::jsonb,
    'I felt genuinely peaceful here, not touristy. The monks and local worshippers were kind to solo visitors. Wearing modest clothes showed respect and felt right. A spiritual moment, not a photo op. - Travel blog',
    'https://www.google.com/maps/search/?api=1&query=Jade%20Emperor%20Pagoda%20%28Ngoc%20Hoang%20Pagoda%29&query_place_id=ChIJYffbXBkpdTERjQgD7Syp7Tg',
    'landmark',
    NULL,
    '["Google Maps", "Vietnam Discovery", "Lonely Planet"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    92,
    4.6,
    298,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '1 hour',
    'Walk-in only; free admission',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '9fc0bfef-8723-5183-8646-c5f14209a872',
    '80529793-1f29-5f6b-8b01-e58f4385e956',
    'kieu-bao-barbecue',
    'Kiá»u Báº£o Barbecue Rice Noodles',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    10.7649, 106.6946,
    '139 De Tham, Co Giang Ward, District 1, Ho Chi Minh City',
    '+84 84 782 3070',
    NULL,
    1,
    '11:00 AM - 9:00 PM daily',
    'You''ll queue alongside locals at this beloved neighborhood spot specializing in chargrilled barbecued pork and fresh rice noodles (bun thit nuong). The prices are genuinely budget-friendly and the quality proves you don''t need fancy settings to eat exceptionally well in Saigon.',
    true,
    'Authentic local restaurant with extremely affordable pricing, strong local following, and easy solo-dining setup at communal tables',
    '["chargrilled barbecued pork", "fresh rice noodles", "local crowd", "budget prices", "authentic preparation"]'::jsonb,
    '["no reservations; first-come-first-served", "communal seating", "limited English spoken"]'::jsonb,
    'This is where locals eat, not tourists. Solo dining was naturalâeveryone''s there to eat. Food was delicious and cost under $3. Felt authentic and safe. - Solo female backpacker',
    'https://www.google.com/maps/search/?api=1&query=Kieu%20Bao%20Barbecue%20Rice%20Noodles&query_place_id=ChIJ0bszZuAvdTERpouhodSCRo0',
    'restaurant',
    NULL,
    '["Google Maps", "TripAdvisor"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    88,
    4.4,
    156,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '45 minutes',
    'Walk-in only; no reservations',
    'easy',
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'e355b4fe-035e-5acd-9e50-74cb31c52f2d',
    '80529793-1f29-5f6b-8b01-e58f4385e956',
    'level-23-wine-bar',
    'Level 23 Wine Bar',
    'bar',
    'ad2a41b6-ce96-5dfe-8c33-9bee8ba93e67',
    10.7857, 106.6932,
    '80 Dong Du, Ben Nghe Ward, District 1, Ho Chi Minh City (Sheraton Saigon Hotel)',
    '+84 28 3827 2828',
    'level23saigon.com',
    4,
    '12:00 PM - late (Wine Bar); 6:00 PM - late Tue-Sun (Nightspot with DJ)',
    'You''ll ride the elevator to the 23rd floor and emerge into panoramic Ho Chi Minh City views that will genuinely take your breath away. The sophisticated wine selection and quiet afternoon hours make solo wine-sipping feel elevated rather than lonelyâevening DJs transform it into sophisticated socializing.',
    true,
    'Upscale rooftop venue with elevated solo-friendly daytime atmosphere and sophisticated evening ambiance in luxury hotel setting',
    '["panoramic city views", "extensive wine list", "rooftop location", "DJ performances", "evening atmosphere", "sophisticated clientele"]'::jsonb,
    '["expensive drinks", "can be pretentious", "dinner dress code suggested"]'::jsonb,
    'As a solo female, I felt absolutely safe and welcome at Level 23. The daytime quiet was peaceful; evening turned social. Drinks are pricey but worth the view and safety. - Solo travel guide',
    'https://www.google.com/maps/search/?api=1&query=Level%2023%20Wine%20Bar&query_place_id=ChIJp_9PWUYvdTERdGoPH4dO6As',
    'bar',
    NULL,
    '["Google Maps", "Marriott Bonvoy", "Tripadvisor"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    90,
    4.5,
    521,
    '2026-02-10 06:38:06.869756+00',
    'evening',
    '2 hours',
    'Walk-in welcome; no reservation needed for daytime, suggested for evening',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '7d6c600c-15af-589f-852e-bd161f01a923',
    '80529793-1f29-5f6b-8b01-e58f4385e956',
    'meander-saigon',
    'Meander Saigon',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    10.7881, 106.6977,
    '3B Ly Tu Trong Street, Ben Nghe Ward, District 1, Ho Chi Minh City',
    '+84 28 3535 0022',
    'meandersaigon.com',
    2,
    '24/7',
    'This multi-functional space combines a coworking hub, rooftop bar, and comfortable hostel into one social epicenter that appeals to digital nomads and solo travelers equally. Free beer every evening plus regular events mean you''ll naturally meet other guests without forced socializing.',
    true,
    'Modern all-in-one facility with coworking, social events, and strong solo-traveler focus in prime District 1 location',
    '["free beers nightly", "rooftop bar", "coworking space", "event space", "clean dorms", "social atmosphere"]'::jsonb,
    '["can get lively/loud", "rooftop bar attracts non-guests", "booking recommended"]'::jsonb,
    'Meander was perfect for my solo trip. Free beer each night created natural social opportunities without pressure. The rooftop bar was safe and well-managed. Staff was incredibly helpful. - Solo travel guide',
    'https://www.google.com/maps/search/?api=1&query=Meander%20Saigon&query_place_id=ChIJIct26kovdTERD_qn06V-7Ck',
    'hostel',
    '8.0',
    '["meandersaigon.com", "Google Maps", "Booking.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    92,
    4.6,
    523,
    '2026-02-10 06:38:06.869756+00',
    'evening',
    '1+ nights',
    'Book online via Booking.com, Agoda, or meandersaigon.com',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'e0871651-c134-5bb3-b050-14c2738322e4',
    '80529793-1f29-5f6b-8b01-e58f4385e956',
    'ngon-restaurant-saigon',
    'Ngon Restaurant',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    10.7847, 106.6956,
    '160 Pasteur, Ben Nghe Ward, District 1, Ho Chi Minh City',
    '+84 28 3827 7131',
    'nhahanngon.com.vn',
    3,
    '7:00 AM - 10:30 PM daily',
    'You''ll experience authentic Vietnamese regional cuisine in an elegant setting where every detail speaks to culinary respect. The menu spans from North to South with regional specialties prepared using fresh, high-quality ingredientsâperfect for solo diners wanting to understand Vietnam''s food diversity without committing to a guided tour.',
    true,
    'Highly-rated traditional Vietnamese restaurant with strong reputation for regional authenticity and solo-friendly dining environment in central District 1',
    '["regional Vietnamese dishes", "fresh ingredients", "elegant atmosphere", "knowledgeable staff", "wine selection"]'::jsonb,
    '["moderate prices", "can get busy during peak hours", "reservation recommended for dinner"]'::jsonb,
    'Ngon made me feel welcome dining alone. Staff was attentive without hovering, the food was genuinely excellent, and the price was fair for quality. A great introduction to Vietnamese regional cuisine. - Frommer''s travel guide',
    'https://www.google.com/maps/search/?api=1&query=Ngon%20Restaurant&query_place_id=ChIJoz2M2EgvdTERLFRcCOtuC70',
    'restaurant',
    NULL,
    '["Google Maps", "Tripadvisor", "Trip.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    90,
    4.5,
    1243,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '1.5 hours',
    'Reservations recommended, especially for dinner; walk-in accepted',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'fe945561-9307-5ee8-b881-ad8743d61605',
    '80529793-1f29-5f6b-8b01-e58f4385e956',
    'ngam-cafe-ho-chi-minh',
    'NgÃ¢m CafÃ©',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    10.771, 106.702,
    '193/19 Nam Ky Khoi Nghia, Vo Thi Sau Ward, District 3, Ho Chi Minh City',
    NULL,
    NULL,
    2,
    '24 hours daily',
    'Step into this retro 1990s-inspired cafe where vintage vinyl records, overflowing bookshelves, and sewing machines create a wonderfully chaotic vibe perfect for solo afternoons. You''ll sip strong Vietnamese coffee surrounded by plants and carefully curated vintage memorabilia while actually *feeling* like you belong there.',
    true,
    'Trending aesthetic cafe with 24-hour operation, affordable pricing, and unique social media presence appealing to solo female travelers seeking authentic local ambiance',
    '["24-hour operation", "vintage aesthetic", "vinyl record collection", "bookshelf library", "local artist hangout"]'::jsonb,
    '["no alcohol served", "credit cards not accepted everywhere", "crowded during evenings"]'::jsonb,
    'I spent an entire afternoon here as the only solo person, and nobody made it weird. The cafe had an inclusive, creative vibe that made me feel part of the community. Coffee was strong and cheap. Total safety felt good. - Solo travel blog',
    'https://goo.gl/maps/NgamCafe',
    'cafe',
    NULL,
    '["Trip.com", "TikTok mentions", "Google Maps"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    90,
    4.5,
    328,
    '2026-02-10 06:38:06.869756+00',
    'afternoon',
    '3+ hours',
    'Walk-in only; no reservations',
    'easy',
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'bb97af1d-5e56-5892-a82a-b8b10cd5254e',
    '80529793-1f29-5f6b-8b01-e58f4385e956',
    'saigon-oi-cafe-apartment',
    'Saigon Æ i CafÃ©',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    10.7878, 106.701,
    '42 Nguyen Hue Street, Floor 5, Ben Nghe Ward, District 1, Ho Chi Minh City',
    NULL,
    'vietnamairlines.com/cafe-apartment',
    2,
    '8:00 AM - 10:00 PM daily',
    'You''ll find this laid-back cafe on the fifth floor of the iconic Cafe Apartment with earth tones, macrame hangings, and bamboo furniture creating an instantly Instagram-friendly space. Their cold iced drinks topped with ice cream and tropical fruits are the real starsâperfect for cooling down after exploring the Nguyen Hue Walking Street below.',
    true,
    'Located in famous Cafe Apartment building offering natural light, social atmosphere, and Instagram-worthy aesthetic that appeals to solo female travelers',
    '["tropical fruit drinks", "ice cream toppings", "bamboo furniture", "balcony seating", "ground floor shops"]'::jsonb,
    '["crowded tourist spot", "can be noisy", "limited space during peak times"]'::jsonb,
    'The Cafe Apartment is genius for solo travelers. Saigon Oi has perfect vibesânot too touristy, excellent tropical drinks, and you can people-watch while being anonymous. Felt completely safe. - Eva Darling travel blog',
    'https://goo.gl/maps/CafeApartment',
    'cafe',
    NULL,
    '["Google Maps", "Instagram", "Vietnam Airlines travel guide"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    86,
    4.3,
    612,
    '2026-02-10 06:38:06.869756+00',
    'afternoon',
    '2 hours',
    'Walk-in; take elevator to Floor 5',
    'easy',
    'Trending',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '9564e22a-b9ef-5796-9166-bf3bf4041796',
    '80529793-1f29-5f6b-8b01-e58f4385e956',
    'secret-garden-vietnamese-restaurant',
    'Secret Garden Vietnamese Restaurant',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    10.7868, 106.6922,
    '17-19 Le Cong Kieu, Ben Nghe Ward, District 1, Ho Chi Minh City',
    '+84 90 990 4621',
    NULL,
    3,
    '11:00 AM - 9:00 PM daily',
    'This hidden gem tucks authentic Vietnamese cuisine into a serene, beautifully designed space that feels like a secret discovery in the heart of District 1. The peaceful garden setting and attentive service make solo dining feel like a private culinary experience rather than eating alone.',
    true,
    'Intimate, upscale restaurant with strong reviews for authentic Vietnamese food and welcoming solo dining atmosphere in prime District 1 location',
    '["serene garden setting", "authentic Vietnamese dishes", "quality ingredients", "rooftop branch available", "attentive service"]'::jsonb,
    '["slightly pricey", "reservation suggested for dinner", "two locations to choose from"]'::jsonb,
    'Felt like my own private discovery. The garden ambiance and attentive staff made solo dining feel special rather than lonely. Food was authentic and beautifully presented. - Travel blogger review',
    'https://goo.gl/maps/SecretGardenSaigon',
    'restaurant',
    NULL,
    '["Google Maps", "TripAdvisor"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    92,
    4.6,
    287,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '1.5 hours',
    'Reservations recommended; dinner walk-ins welcome if space available',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '5bbad185-8f1d-537d-8b20-fc7337218732',
    '80529793-1f29-5f6b-8b01-e58f4385e956',
    'the-like-hostel-cafe',
    'The Like Hostel & Cafe',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    10.7647, 106.693,
    '150/37 Nguyen Trai, Pham Ngu Lao Ward, District 1, Ho Chi Minh City',
    '+84 90 476 4979',
    'thelikehostelhcm.com',
    1,
    '24/7',
    'You''ll find this social-but-not-rowdy hostel in the backpacker heartland with a decent cafe, friendly staff, and genuine community vibe. It''s perfect for solo travelers wanting to meet people without the mandatory party atmosphereâthink meaningful connections over coffee, not beer beer beer.',
    true,
    'Well-regarded social hostel in backpacker area offering balance between meeting people and solo comfort in affordable price point',
    '["on-site cafe", "social atmosphere", "not party-focused", "helpful staff", "good location for exploration"]'::jsonb,
    '["backpacker district is touristy", "can be busy", "limited privacy in dorms"]'::jsonb,
    'The Like felt like the Goldilocks hostelâsocial enough to meet people, calm enough to have alone time. The staff actually cared about guest safety and wellbeing. - Solo female backpacker',
    'https://www.google.com/maps/search/?api=1&query=The%20Like%20Hostel%20%26%20Cafe&query_place_id=ChIJPfSRmysvdTERtO_7dVtiMRY',
    'hostel',
    '7.0',
    '["Google Maps", "Hostelworld", "Booking.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    90,
    4.5,
    387,
    '2026-02-10 06:38:06.869756+00',
    'evening',
    '1+ nights',
    'Book via Booking.com, Hostelworld, or direct',
    'easy',
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '6eadf722-c424-5a1d-a519-8b900e5a5a85',
    '80529793-1f29-5f6b-8b01-e58f4385e956',
    'the-white-hotel-thai-van-lung',
    'The White Hotel 8A Thai Van Lung',
    'hotel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    10.7921, 106.6954,
    '8A Thai Van Lung Street, Ben Nghe Ward, District 1, Ho Chi Minh City',
    '+84 28 3823 8888',
    'thewhitehotel8athaivanlung.vn',
    2,
    '24/7',
    'You''ll appreciate this mid-range hotel''s central location, modern amenities, and warm service without breaking your budget. The sauna, massage services, and reliable WiFi make solo stays genuinely comfortableâperfect for when you want a stepping stone between backpacker hostels and luxury hotels.',
    true,
    'Well-reviewed 3-star hotel with balanced amenities, central location, and female-friendly service approach at reasonable price point',
    '["sauna access", "massage services", "restaurant on-site", "24-hour front desk", "near Opera House"]'::jsonb,
    '["smaller rooms", "limited pool", "can be noisy from street"]'::jsonb,
    'Great value for a private room with real amenities. Staff was helpful without being intrusive. The location made exploring safe and convenient. Much better than hostel dorms for my comfort level. - Solo travel blog',
    'https://www.google.com/maps/search/?api=1&query=The%20White%20Hotel%208A%20Thai%20Van%20Lung&query_place_id=ChIJuWO_kD4vdTERsrPgrKR1aY0',
    'hotel',
    '45.0',
    '["Google Maps", "Booking.com", "Hotel website"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    86,
    4.3,
    267,
    '2026-02-10 06:38:06.869756+00',
    'evening',
    '1+ nights',
    'Book via Booking.com, Agoda, or direct via website',
    'easy',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'b0928aa4-d2fa-5360-a4af-8e5e281ca355',
    '80529793-1f29-5f6b-8b01-e58f4385e956',
    'xliii-coffee-saigon',
    'XLIII Coffee',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    10.7847, 106.6948,
    '178A Pasteur, Ben Nghe Ward, District 1, Ho Chi Minh City',
    '+84 79 934 3943',
    'xliiicoffee.com',
    3,
    '6:30 AM - 10:30 PM daily',
    'You''ll discover specialty-roasted Vietnamese arabica and international beans at this minimalist all-black cafe near Independence Palace. The knowledgeable baristas craft pour-overs and espresso drinks that rival Hanoi''s best, paired with fresh pastries that make solo work-sessions genuinely cozy.',
    true,
    'Highly-rated specialty coffee roastery with welcoming atmosphere for solo travelers seeking quality caffeine and workspace in District 1',
    '["specialty coffee roaster", "pour-over service", "freshly baked pastries", "modern minimalist design", "female-friendly baristas"]'::jsonb,
    '["pricier than street cafes", "small seating area fills quickly", "reservation recommended during peak hours"]'::jsonb,
    'As a solo female traveler, I felt completely safe and welcome at XLIII. The baristas were patient explaining their coffee selection and the minimalist aesthetic made it easy to settle in with my laptop for hours. The hand-poured coffee was genuinely excellent. - Tofu V Travels',
    'https://www.google.com/maps/search/?api=1&query=XLIII%20Coffee&query_place_id=ChIJlVfNx4gvdTER6GQKnLqekHU',
    'cafe',
    NULL,
    '["xliiicoffee.com", "Tripadvisor", "Google Maps reviews"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    96,
    4.8,
    452,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '2 hours',
    'Walk-in only; no advance booking needed',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '98e8c8e9-9beb-54ba-95d0-739946f319ae',
    '39b2e031-bc56-5e43-9415-7b026d8d8e03',
    'blueberry-hoi-an-spa',
    'BlueBerry Hoi An Spa',
    'wellness',
    '21d190d3-2f37-5e07-a1fc-70bd969ab432',
    15.8801, 108.3245,
    '02 Ton That Tung, Cam Son Ward, Hoi An, Quang Nam',
    '+84 90 570 7683',
    'blueberryhoianspa.com',
    2,
    '9:00 AM - 9:00 PM daily',
    'You''ll experience authentic Vietnamese spa treatments in this peaceful establishment where professional therapists specialize in traditional and modern wellness practices. Solo pampering feels restorative hereâthe calm environment and therapeutic focus make self-care feel less indulgent and more necessary.',
    true,
    'Well-reviewed spa offering traditional and modern treatments, peaceful atmosphere, and solo-friendly self-care experience in central location',
    '["traditional vietnamese massage", "modern spa treatments", "professional therapists", "peaceful setting", "affordable pricing", "pick-up available"]'::jsonb,
    '["small space", "book ahead for popular times", "limited english staff"]'::jsonb,
    'Solo spa day was the best decision I made. Professional therapist was kind and attentive. Traditional Vietnamese massage was deeper than expected. Felt genuinely cared for. - Solo female traveler',
    'https://goo.gl/maps/BlueberrySpa',
    'wellness',
    NULL,
    '["blueberryhoianspa.com", "Google Maps"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    92,
    4.6,
    267,
    '2026-02-10 06:38:06.869756+00',
    'afternoon',
    '1-2 hours',
    'Book via blueberryhoianspa.com or phone; walk-ins welcome',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'd273ad8c-5aae-5207-a269-8a02febc51ff',
    '39b2e031-bc56-5e43-9415-7b026d8d8e03',
    'cao-lau-khong-gian-xanh',
    'Cao LÃ¢u KhÃ´ng Gian Xanh',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    15.8802, 108.3268,
    '687 Hai Ba Trung, Cam Pho Ward, Hoi An, Quang Nam',
    '+84 90 572 1219',
    NULL,
    2,
    '9:30 AM - 9:00 PM daily',
    'You''ll taste authentic cao lau noodles with charred pork and special broth water at this rustic garden restaurant that embraces nature beautifully. The peaceful green setting and solo-friendly counter seating make this the kind of place where you savor local specialties while actually feeling present rather than rushed.',
    true,
    'Authentic Hoi An specialty restaurant with beautiful rustic design, strong local reputation, and peaceful solo-friendly atmosphere',
    '["authentic cao lau specialty", "traditional water from Ba Le well", "roasted pork meat", "rustic garden setting", "large portions", "green ambiance"]'::jsonb,
    '["can get warm", "limited menu", "traditional setting (not upscale)"]'::jsonb,
    'The cao lau was surprisingly complexâI understood why locals are picky about it. The garden setting was so peaceful. Solo dining felt natural and meditative. - Solo food traveler',
    'https://www.google.com/maps/search/?api=1&query=Cao%20L%C3%83%C2%A2u%20Kh%C3%83%C2%B4ng%20Gian%20Xanh&query_place_id=ChIJB7zs3XsOQjERTijWogqRQSc',
    'restaurant',
    NULL,
    '["Google Maps", "Tripadvisor"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    90,
    4.5,
    234,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '1 hour',
    'Walk-in; no reservations needed',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '2d072f4e-4fe0-565a-a361-480f179eecc4',
    '39b2e031-bc56-5e43-9415-7b026d8d8e03',
    'hoi-an-roastery',
    'Hoi An Roastery Coffee',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    15.8794, 108.3261,
    '326 Ly Thuong Kiet, Hoi An, Quang Nam',
    NULL,
    'xliiicoffee.com',
    2,
    '6:30 AM - 10:30 PM daily',
    'You''ll appreciate this specialty coffee branch of XLIII (the Saigon roastery) where Vietnamese arabica meets pour-over craftsmanship in Hoi An''s atmospheric ancient town. The riverside location and quality coffee make solo morning work sessions genuinely productive and peaceful.',
    true,
    'Branch of acclaimed Saigon roastery offering specialty coffee in central Hoi An location with riverside ambiance and solo-friendly workspace',
    '["specialty coffee roaster", "pour-over service", "riverside location", "small batches", "modern aesthetic", "working space"]'::jsonb,
    '["pricier than local cafes", "reservation helpful during peak", "moderate english"]'::jsonb,
    'Same excellent quality as the Saigon location but with better views and local atmosphere. Spent 3 hours working here. Safe and welcoming. - Solo female nomad',
    'https://goo.gl/maps/HoiAnRoastery',
    'cafe',
    NULL,
    '["xliiicoffee.com", "Google Maps"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    92,
    4.6,
    267,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '2-3 hours',
    'Walk-in; no reservation needed',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'ba9c51e8-8977-5d1f-91c6-098dc5584c09',
    '39b2e031-bc56-5e43-9415-7b026d8d8e03',
    'little-daisy-hoi-an-embroidery',
    'Little Daisy Hoi An - Hand Embroidery Workshop',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    15.8947, 108.3156,
    'Tra Que Village area, Cam An Ward, Hoi An, Quang Nam',
    '+84 94 657 4633',
    'littledaisyhoian.com',
    3,
    '9:00 AM & 2:00 PM daily',
    'You''ll learn hand embroidery basics while creating beautiful pieces (tote bags, notebooks, blouses) with patient instruction from experienced artisans. This 2-hour workshop is meditative for solo travelersâfocused handiwork creates natural quiet connection with other embroiderers, and you take home a handmade treasure.',
    true,
    'Skilled embroidery workshop offering personalized instruction, artistic skill-building, and take-home crafted pieces in peaceful village setting',
    '["hand embroidery instruction", "handmade souvenirs", "artistic skill-building", "patient instructors", "village setting", "flexible projects"]'::jsonb,
    '["requires fine motor control", "sitting for 2+ hours", "transportation needed (outside town center)"]'::jsonb,
    'Learning embroidery felt like unlocking a creativity I didn''t know I had. The instructor was patient. I created something beautiful to keep forever. Meditative and meaningful. - Solo female traveler',
    'https://goo.gl/maps/LittleDaisyHoiAn',
    'activity',
    NULL,
    '["littledaisyhoian.com", "Tripadvisor"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    94,
    4.7,
    345,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '2.5-3 hours',
    'Book via littledaisyhoian.com; transportation pickup available',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '9f9abe28-072e-50a6-b4cd-5cd8cec69de3',
    '39b2e031-bc56-5e43-9415-7b026d8d8e03',
    'mango-rooms',
    'Mango Rooms',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    15.8782, 108.3306,
    '111 Nguyen Thai Hoc, Hoi An, Quang Nam',
    '+84 235 391 0839',
    'mangomangohoian.com',
    3,
    '8:30 AM - 10:30 PM daily',
    'You''ll experience contemporary Vietnamese fusion cuisine in this riverside restaurant with colorful decor and signature cocktails that taste like Hoi An in a glass. Chef Duc''s cooking celebrates local ingredients with modern techniqueâsolo diners at the bar watch the energy while maintaining their own quiet contemplation.',
    true,
    'Upscale contemporary restaurant with fusion cuisine, river views, skilled cocktails, and solo-friendly bar seating in atmospheric location',
    '["vietnamese fusion cuisine", "chef Duc signature", "river views", "signature cocktails", "colorful aesthetic", "contemporary"]'::jsonb,
    '["pricier than local restaurants", "can be touristy", "reservation recommended"]'::jsonb,
    'Mango Rooms felt like a celebration. Solo at the bar, watching the river and the kitchen action. Food was delicious, cocktails were creative. Worth treating yourself for. - Solo female traveler',
    'https://www.google.com/maps/search/?api=1&query=Mango%20Rooms&query_place_id=ChIJDcmxfn4OQjER08GcEhVPqBU',
    'restaurant',
    NULL,
    '["Google Maps", "mangomangohoian.com", "Tripadvisor"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    92,
    4.6,
    567,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '1.5-2 hours',
    'Reservations recommended, especially for dinner',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '69af5df8-adf9-5977-8959-f5d44fcb422a',
    '39b2e031-bc56-5e43-9415-7b026d8d8e03',
    'red-bridge-cooking-school',
    'Red Bridge Cooking School & Restaurant',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    15.8876, 108.3087,
    'Thu Bon River (3km from ancient town), Hoi An, Quang Nam',
    '+84 235 3863 222',
    'visithoian.com',
    3,
    'Class times: 9:00 AM, 1:30 PM daily',
    'You''ll join a half-day or full-day cooking class on a beautiful riverside setting where you visit the local market, learn authentic Hoi An techniques, and prepare 4-5 dishes in a hands-on kitchen class. Solo travelers are welcomed and paired with other guests naturallyâthe shared activity creates connection without forced socializing.',
    true,
    'Highly-rated riverside cooking school offering market visits, hands-on classes, and natural solo-traveler community in scenic setting',
    '["local market visit", "hands-on cooking", "authentic recipes", "riverside setting", "group meals together", "professional instruction"]'::jsonb,
    '["early start times", "physical activity standing/cooking", "pre-book required"]'::jsonb,
    'Red Bridge was transformative. Market visit was incredibly interesting. Cooking alongside other solos made it social without being forced. Eating together afterward felt genuinely community. - Solo female traveler',
    'https://www.google.com/maps/search/?api=1&query=Red%20Bridge%20Cooking%20School%20%26%20Restaurant&query_place_id=ChIJtcXcC7UNQjER3x9vm_Q33RE',
    'activity',
    NULL,
    '["visithoian.com", "Google Maps", "Tripadvisor"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    96,
    4.8,
    1247,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '4-6 hours',
    'Book via website visithoian.com or local hotels',
    'moderate',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'c827ff52-936d-5b43-bcee-e0f9dc2e1f69',
    '39b2e031-bc56-5e43-9415-7b026d8d8e03',
    'tam-tam-cafe',
    'Tam Tam Cafe',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    15.8773, 108.3288,
    '110 Nguyen Thai Hoc, Hoi An, Quang Nam',
    '+84 235 391 0839',
    NULL,
    2,
    '7:00 AM - 10:00 PM daily',
    'You''ll step into this beloved local cafe operating since 1996 where Vietnamese owners create an unpretentious space mixing tourists and locals naturally. The coffee is solid, the atmosphere is genuinely welcoming, and solo diners are so normal here that sitting alone feels like belonging.',
    true,
    'Long-established local cafe with authentic Vietnamese ownership, welcoming atmosphere, and natural solo-dining environment',
    '["since 1996", "local ownership", "unpretentious vibe", "mixed tourist/local crowd", "good coffee", "solid food"]'::jsonb,
    '["basic setting", "limited specialties", "can get warm"]'::jsonb,
    'Tam Tam felt like the real Hoi Anânot Instagram-perfect but genuinely welcoming. The owners treated solo travelers like valued guests. I went back 4 times during my stay. - Solo female backpacker',
    'https://www.google.com/maps/search/?api=1&query=Tam%20Tam%20Cafe&query_place_id=ChIJa7elVX4OQjERNb1LPI7CysA',
    'cafe',
    NULL,
    '["Google Maps", "Tripadvisor"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    88,
    4.4,
    189,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '1-2 hours',
    'Walk-in only',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'aa9304a6-1151-56b3-940e-0005b54b4f89',
    '39b2e031-bc56-5e43-9415-7b026d8d8e03',
    'hoi-an-lantern-making-workshop',
    'The Lantern Lady - Lantern Making Workshops',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    15.8936, 108.3123,
    'Phan Boi Chau Street, by the river (next to Hoi An Memory Land), Hoi An, Quang Nam',
    '+84 90 314 5666',
    'thelandernlady.com',
    2,
    'Classes: 10:00 AM - 12:00 PM & 2:00 PM - 4:00 PM daily',
    'You''ll learn the 400+ year tradition of lantern-making from ''The Lantern Lady'' (Lady Mai) in a riverside workshop where bamboo becomes art. This hands-on 2-hour class is perfect for solo travelersâeach person creates their own lantern, and the focused crafting creates natural meditative connection with other makers.',
    true,
    'Iconic cultural activity offering hands-on traditional craftsmanship, scenic riverside location, and naturally solo-friendly small-group format',
    '["400+ year tradition", "hands-on bamboo crafting", "riverside workshop", "cultural instruction", "family-friendly", "take-home lantern"]'::jsonb,
    '["physically engaging (folding bamboo)", "weather dependent", "small class sizes fill quickly"]'::jsonb,
    'Making a lantern with my hands felt like meditation. Lady Mai was patient and kind. Other solos were equally focused on their own lantern. Took home something beautiful and meaningful. - Solo female traveler',
    'https://www.google.com/maps/search/?api=1&query=The%20Lantern%20Lady%20-%20Lantern%20Making%20Workshops&query_place_id=ChIJFcmastUNQjERHiA9CFt5l-4',
    'activity',
    NULL,
    '["Google Maps", "Tripadvisor"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    94,
    4.7,
    834,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '2-3 hours',
    'Book directly or via hotels; walk-ins welcome if space',
    'moderate',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'a4ec344b-6bd0-53e5-bbdb-8dc112e4e0ef',
    '39b2e031-bc56-5e43-9415-7b026d8d8e03',
    'tribee-ede-hostel',
    'Tribee Ede Hostel & Bar',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    15.881, 108.3295,
    'Cam Pho Ward, Hoi An, Quang Nam (near ancient town)',
    '+84 90 582 0348',
    'tribeehostels.com',
    1,
    '24/7',
    'You''ll settle into this nature-surrounded hostel just minutes from Hoi An''s ancient town but feeling like a secret countryside escape. The cool bar vibe, free activities (pub crawls, food tours, cooking classes), and genuinely social staff make meeting other travelers easy, but quiet countryside mornings are equally available.',
    true,
    'Well-regarded social hostel with nature setting, free group activities, and balance of social and peaceful solo options just outside ancient town',
    '["countryside setting", "near ancient town", "bar scene", "free activities", "social staff", "cooking classes available"]'::jsonb,
    '["slightly outside town center", "social/lively vibe", "can fill quickly"]'::jsonb,
    'Tribee Ede was perfect balanceâsocial enough I made friends, peaceful enough I had alone time in the garden. Free cooking classes were amazing. Close to ancient town but felt removed. - Solo female backpacker',
    'https://goo.gl/maps/TribeeEde',
    'hostel',
    '8.0',
    '["Google Maps", "tribeehostels.com", "Hostelworld"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    90,
    4.5,
    423,
    '2026-02-10 06:38:06.869756+00',
    'evening',
    '1+ nights',
    'Book via Hostelworld, Booking.com, or tribeehostels.com',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'e11aa32c-2761-57a5-836d-a2c7d0aae27a',
    '39b2e031-bc56-5e43-9415-7b026d8d8e03',
    'white-rose-restaurant',
    'White Rose Restaurant',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    15.8792, 108.3298,
    '533 Hai Ba Trung, Hoi An, Quang Nam',
    '+84 90 301 0986',
    NULL,
    2,
    '7:30 AM - 8:30 PM daily',
    'You''ll taste the legendary white rose dumplings (stuffed with pork or shrimp) at this family-owned establishment that guards their secret recipe fiercely. The original family restaurant atmosphere welcomes solo diners naturallyâlocals mix with tourists all seeking that perfect creamy dumpling bite.',
    true,
    'Original family-owned specialist restaurant with authentic Hoi An specialty, strong local reputation, and naturally social solo-dining environment',
    '["white rose dumplings specialty", "secret family recipe", "original location", "fried wontons", "local crowd", "authentic"]'::jsonb,
    '["crowded during peak hours", "limited menu", "no reservations"]'::jsonb,
    'The white rose dumplings are incredibleâyou taste the care in every bite. Solo dining was natural. The family owners smiled at solo female diners. Genuinely local experience. - Food travel blog',
    'https://goo.gl/maps/WhiteRoseHoiAn',
    'restaurant',
    NULL,
    '["Google Maps", "Tripadvisor", "Food guides"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Vietnam)',
    94,
    4.7,
    412,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '1 hour',
    'Walk-in only; no reservations',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '209d3a9e-2307-54b1-b85d-1c6899716509',
    '45667a9e-c10d-51aa-a5a1-b3f260d725fa',
    '2-bulan-ubud',
    '2 Bulan',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    -8.5128, 115.2618,
    'Jl. Nyuh Bulan, Mas, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571',
    NULL,
    'https://2bulanbali.com/',
    3,
    '11am-11pm',
    'An intimate 30-seat Thai restaurant from the team behind Bacari and Galle Club, blending traditional Thai culinary art with innovative modern takes in a rustic, industrial space inspired by Northern Thailand''s ceramic factories. Perfect for solo diners seeking refined Thai cuisine with natural wines and craft cocktails.',
    true,
    'Recently opened upscale Thai dining offering contemporary takes on regional classics in an inspiring industrial setting, excellent for cultural immersion and solo diners',
    '["Thai cuisine", "Craft cocktails", "Natural wines", "Intimate setting", "Industrial-chic design"]'::jsonb,
    '["Reservation recommended", "Moderate to high pricing", "Can be busy evenings"]'::jsonb,
    'Great atmosphere for solo dining with thoughtful cocktails and Thai flavors',
    'https://www.google.com/maps/search/?api=1&query=2%20Bulan&query_place_id=ChIJI-GvWwA90i0R2R8nRGYlyv4',
    'restaurant',
    NULL,
    '["2bulanbali.com", "wanderlog.com", "bacaribali.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Indonesia)',
    96,
    4.8,
    250,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '90 minutes',
    'Walk-ins accepted, reservations recommended',
    NULL,
    'New Dining',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '299ef11b-cce3-5a5e-8420-228843258efc',
    '45667a9e-c10d-51aa-a5a1-b3f260d725fa',
    'nari-ubud',
    'NARI',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    -8.5068, 115.2529,
    'Jalan Raya Campuhan, Sayan, Bali 80571',
    '+62 81325763505',
    'https://naribali.com/',
    3,
    '12pm-11pm daily',
    'A wood-fire bistro and bar perched above Campuhan Ridge with Mediterranean cuisine and stunning forest views. Solo travelers can enjoy sunset dining overlooking the lush Gunung Lebah Temple and valley greenery while experiencing authentic, fire-influenced cooking.',
    true,
    'Newly opened wood-fire dining with iconic ridge views, offers romantic solo dining experience in one of Ubud''s most coveted locations',
    '["Campuhan Ridge views", "Wood-fired cooking", "Mediterranean cuisine", "Sunset ambiance", "Scenic location"]'::jsonb,
    '["Popular at sunset", "Reservation recommended", "Moderate pricing"]'::jsonb,
    'Perfect sunset spot for solo travelers, welcoming staff, incredible valley views',
    'https://www.google.com/maps/search/?api=1&query=NARI&query_place_id=ChIJVY_uvV490i0Rp2rypfscVk0',
    'restaurant',
    NULL,
    '["naribali.com", "nowbali.co.id", "tripadvisor.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Indonesia)',
    94,
    4.7,
    310,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '120 minutes',
    'Phone reservation: +62 81325763505',
    NULL,
    'Signature Views',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '5cbcc00c-3424-50db-bfb0-fd414a6db016',
    '45667a9e-c10d-51aa-a5a1-b3f260d725fa',
    'kurasu-ubud',
    'Kurasu Ubud',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    -8.5185, 115.2641,
    'Tengkulak Kaja, Jl. Raya Goa Gajah, Kemenuh, Ubud',
    NULL,
    'https://kurasu.jp/',
    2,
    '9am-5pm',
    'A Kyoto-born specialty coffee brand''s newest outpost in collaboration with Tanah Gajah Resort, bringing refined Japanese minimalism and exceptional single-origin coffee to Ubud''s serene landscape. Ideal for peaceful mornings with contemplative coffee culture.',
    true,
    'Premium Japanese coffee brand opening in Ubud for first time, combines cultural refinement with exceptional coffee for discerning solo travelers',
    '["Single-origin coffee", "Japanese aesthetic", "Peaceful setting", "High-quality pastries", "Zen atmosphere"]'::jsonb,
    '["Can be crowded mid-morning", "Limited seating", "Seasonal hours"]'::jsonb,
    'Serene coffee experience, beautiful design, perfect for solo work or reflection',
    'https://www.google.com/maps/search/?api=1&query=Kurasu%20Ubud&query_place_id=ChIJ8RU0O5o90i0RYdmJnqP-JwI',
    'cafe',
    NULL,
    '["nowbali.co.id", "kurasu.jp"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Indonesia)',
    92,
    4.6,
    180,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '60 minutes',
    'Walk-ins only',
    NULL,
    'Specialty Coffee',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'dfcaddb7-54aa-5567-bd94-ddcb16492502',
    '45667a9e-c10d-51aa-a5a1-b3f260d725fa',
    'sini-saja-ubud',
    'SiniSaja',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    -8.5085, 115.2615,
    'Jl. Raya Ubud, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571',
    NULL,
    'https://www.instagram.com/sinisajabali/',
    2,
    '8am-11pm',
    'A centrally-located down-to-earth cafe on the main Ubud road welcoming coffee stops, work sessions, and dinner with wine. Named for its meaning stay awhile, it offers a relaxed social atmosphere perfect for solo travelers seeking community without obligation.',
    true,
    'New casual cafe in prime Ubud location with all-day dining from coffee to wine, excellent for solo travelers looking for flexible work/social space',
    '["Central location", "Coffee & wine", "All-day dining", "Welcoming vibe", "Flexible hours"]'::jsonb,
    '["Can be noisy", "Street-facing", "Popular times crowded"]'::jsonb,
    'Great for staying a while solo, friendly staff, good for solo work or casual dining',
    'https://www.google.com/maps/search/?api=1&query=SiniSaja&query_place_id=ChIJ6ZmBcRU90i0R05yrg5hJkJY',
    'cafe',
    NULL,
    '["sinisajabali.com", "tripadvisor.com", "foodies.id"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Indonesia)',
    90,
    4.5,
    220,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '90 minutes',
    'Walk-ins welcome',
    NULL,
    'Social Hub',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'd477a54d-6dce-58d6-8a58-dedf1f145065',
    '45667a9e-c10d-51aa-a5a1-b3f260d725fa',
    '7am-bakers-ubud',
    '7AM Bakers',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    -8.5105, 115.258,
    'Jl. Raya Pengosekan No.2013B Ground Floor, Mas, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571',
    NULL,
    'https://sevenambakers.com/',
    2,
    '7am-11pm',
    'A charming bakery and cafe specializing in fresh morning pastries and specialty coffee, creating the perfect ritual for solo mornings in Ubud. Cozy ambiance with quality baked goods from expert bakers.',
    true,
    'New artisanal bakery cafe offering quality early morning experience, essential for solo travelers establishing healthy routines',
    '["Fresh pastries", "Quality coffee", "Early opening", "Cozy atmosphere", "Baked daily"]'::jsonb,
    '["Busiest 7-9am", "Limited seating", "Popular with tourists"]'::jsonb,
    'Perfect solo breakfast spot, fresh pastries, professional baristas, great morning ritual',
    'https://www.google.com/maps/search/?api=1&query=7AM%20Bakers&query_place_id=ChIJOxnp7o890i0RWiAy2ZSbpSM',
    'cafe',
    NULL,
    '["sevenambakers.com", "baliready.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Indonesia)',
    92,
    4.6,
    195,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '45 minutes',
    'Walk-ins only',
    NULL,
    'Morning Ritual',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'adfea4d6-cb9a-539e-979a-775e06f659f9',
    '45667a9e-c10d-51aa-a5a1-b3f260d725fa',
    'cantina-classe-ubud',
    'Cantina Classe',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    -8.5225, 115.2485,
    'Jl. Drupadi, Melinggih, Payangan, Gianyar Regency, Bali 80572',
    NULL,
    'https://thewonderspace.com/cantinaclasse',
    3,
    '11am-10pm',
    'A beloved Italian restaurant from Canggu expanding to Ubud''s lush rice terraces, offering authentic pasta and pizza in a unique jungle setting. Intimate dining experience combining Mediterranean cuisine with Bali''s natural serenity.',
    true,
    'High-quality Italian dining brand recently opened in Ubud location, offers consistent quality dining for solo travelers',
    '["Italian cuisine", "Jungle setting", "Fresh pasta", "Wood-fired pizza", "Scenic terrace"]'::jsonb,
    '["Slightly outside center", "Reservation recommended", "Moderate pricing"]'::jsonb,
    'Wonderful solo dinner experience, beautiful setting, professional but welcoming service',
    'https://www.google.com/maps/search/?api=1&query=Cantina%20Classe&query_place_id=ChIJl4P9TB8j0i0Rh5ri62ySXDI',
    'restaurant',
    NULL,
    '["thewonderspace.com", "tripadvisor.com", "wanderlog.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Indonesia)',
    94,
    4.7,
    280,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '120 minutes',
    'Reservation recommended via website',
    NULL,
    'Italian Excellence',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '802a43b5-738b-5c23-9a01-c16968705a7a',
    '45667a9e-c10d-51aa-a5a1-b3f260d725fa',
    'outpost-ubud-coworking',
    'Outpost Ubud',
    'coworking',
    '09cc7275-a3ac-517e-b3fc-c257f4613f63',
    -8.5095, 115.2602,
    'Nyuh Kuning Road, Mas, Ubud, Bali',
    NULL,
    'https://destinationoutpost.co/cowork-in-ubud/',
    2,
    '7am-10pm',
    'A vibrant coworking and coliving space offering high-speed internet, air-conditioned focus zones, and a connected cafe. The go-to hub for remote workers and digital nomads seeking productivity combined with community and Ubud''s creative energy.',
    true,
    'Premier coworking space in Ubud with exceptional amenities and community, perfect for solo travelers needing reliable work environment',
    '["High-speed WiFi", "Focus zones", "Connected cafe", "Community events", "Pool access"]'::jsonb,
    '["Membership required", "Can be social", "Book in advance"]'::jsonb,
    'Excellent workspace, supportive community, female-friendly environment, reliable internet',
    'https://www.google.com/maps/search/?api=1&query=Outpost%20Ubud&query_place_id=ChIJJQhT6KA90i0RiIrfxiXiYmU',
    'coworking',
    NULL,
    '["destinationoutpost.co", "coworkingcafe.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Indonesia)',
    94,
    4.7,
    420,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    'Full day',
    'Daily or monthly passes available online',
    NULL,
    'Work Hub',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'c88746ec-0b2e-5b68-ad4e-8f9fbc841fd7',
    'cf0acfb1-d56d-54cf-a249-2dc074b6fce0',
    'sol-rooftop-canggu',
    'Sol Rooftop',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    -8.6498, 115.1618,
    'Jl. Pantai Pererenan No.169, Pererenan, Canggu 80351',
    NULL,
    'https://balibeachclubpass.com/products/sol-rooftop-bali',
    2,
    '9am-late',
    'A hidden gem rooftop cafe tucked above Batu Bolong with effortless chill vibes and productivity-boosting energy. Perfect for solo remote workers seeking a mix of coffee culture, work environment, and community without pretension.',
    true,
    'New rooftop workspace cafe offering balance of work productivity and social atmosphere, excellent for remote workers seeking local alternative to mainstream spots',
    '["Rooftop views", "Work-friendly", "Relaxed vibe", "Good WiFi", "Community"]'::jsonb,
    '["Can be crowded afternoons", "Limited seating", "Popular with nomads"]'::jsonb,
    'Great work space, welcoming atmosphere, excellent coffee, perfect for solo work',
    'https://www.google.com/maps/search/?api=1&query=Sol%20Rooftop&query_place_id=ChIJh3i8FLo50i0Rklbo5xFbOYQ',
    'cafe',
    NULL,
    '["balibeachclubpass.com", "mindtrip.ai", "onbali.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Indonesia)',
    88,
    4.4,
    245,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '2-4 hours',
    'Walk-ins welcome',
    NULL,
    'Work Space',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'aabc970b-27a7-5268-a835-f1dbab9befc5',
    'cf0acfb1-d56d-54cf-a249-2dc074b6fce0',
    'atlas-beach-club-canggu',
    'Atlas Beach Club',
    'bar',
    'ad2a41b6-ce96-5dfe-8c33-9bee8ba93e67',
    -8.655, 115.185,
    'Berawa Beach, Canggu, Bali 80361',
    NULL,
    'https://www.bali-tickets.com/atlas-beach-club/about/',
    3,
    '10am-late',
    'Southeast Asia''s largest beach club spanning nearly 3 hectares with 300-meter infinity pool, multiple bars, restaurants, and DJs. Solo travelers enjoy day-to-night vibes, from relaxed pool lounging to energetic evening parties with safety in numbers.',
    true,
    'Newest mega beach club venue in Bali, massive scale offers diverse experiences and strong solo travel community environment',
    '["Largest pool in SE Asia", "Multiple bars", "Ocean views", "DJ performances", "All-day venue"]'::jsonb,
    '["Very crowded", "High pricing", "Day pass required"]'::jsonb,
    'Great for solo travelers due to crowd size and friendly atmosphere, good for day or night',
    'https://www.google.com/maps/search/?api=1&query=Atlas%20Beach%20Club&query_place_id=ChIJhY50BH9H0i0RCdXsyoE0uGU',
    'bar',
    NULL,
    '["bali-tickets.com", "tripadvisor.com", "atlasbeachfest.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Indonesia)',
    86,
    4.3,
    520,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '4-6 hours',
    'Day pass purchase at entrance or online',
    NULL,
    'Mega Venue',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '8ccf64a2-8ec6-5010-9bcb-82d2103182fe',
    'cf0acfb1-d56d-54cf-a249-2dc074b6fce0',
    'brunch-club-bali-canggu',
    'Brunch Club Bali',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    -8.652, 115.1705,
    'Jl. Pantai Pererenan No. 110, Pererenan, Mengwi, Bali',
    '+62 811 3831 2906',
    'https://brunchclubbali.com/',
    2,
    '8am-11pm',
    'A breezy all-day brunch venue where diners sit beneath a huge mango tree enjoying pancakes, healthy options, and cocktails. Solo travelers find a welcoming, social atmosphere perfect for extended leisurely mornings or casual evenings.',
    true,
    'Popular all-day social cafe venue with unique mango tree setting, excellent for solo diners seeking relaxed community atmosphere',
    '["Mango tree setting", "All-day menu", "Cocktails", "Social vibe", "Open concept"]'::jsonb,
    '["Can be noisy", "Popular times crowded", "Shared tables possible"]'::jsonb,
    'Wonderfully social, perfect solo brunch spot, friendly atmosphere, great for meeting people',
    'https://www.google.com/maps/search/?api=1&query=Brunch%20Club%20Bali&query_place_id=ChIJnxFCS3pH0i0RE9mJ0v6ZkHA',
    'cafe',
    NULL,
    '["brunchclubbali.com", "balibuddies.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Indonesia)',
    90,
    4.5,
    380,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '2-3 hours',
    'Walk-ins welcome, reservation recommended weekends',
    NULL,
    'Social Cafe',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '3316e5da-c13d-57c6-976b-d94bcbb18d9b',
    'cf0acfb1-d56d-54cf-a249-2dc074b6fce0',
    'cantina-classe-canggu',
    'Cantina Classe Canggu',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    -8.6485, 115.177,
    'Canggu, Bali (exact address on Wonderspace website)',
    NULL,
    'https://thewonderspace.com/cantinaclasse',
    3,
    '11am-10pm',
    'An authentic Italian restaurant with stylish ambiance serving fresh pasta and wood-fired pizza. Solo diners enjoy quality Italian cuisine in a sophisticated yet welcoming setting perfect for both casual and special occasion dining.',
    true,
    'Established Italian dining brand with quality consistency, excellent for solo travelers seeking reliable upscale dining',
    '["Italian cuisine", "Wood-fired pizza", "Fresh pasta", "Stylish decor", "Wine selection"]'::jsonb,
    '["Moderate-high pricing", "Popular evenings", "Reservation recommended"]'::jsonb,
    'Excellent Italian food, attentive service, perfect solo dining experience',
    'https://www.google.com/maps/search/?api=1&query=Cantina%20Classe%20Canggu&query_place_id=ChIJi2HK2H850i0RZ8R8JnWsNKU',
    'restaurant',
    NULL,
    '["thewonderspace.com", "tripadvisor.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Indonesia)',
    92,
    4.6,
    290,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '120 minutes',
    'Reservation recommended via website',
    NULL,
    'Italian Dining',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '6ad50c57-d8f2-5cda-a378-c6bcf84c35a4',
    'cf0acfb1-d56d-54cf-a249-2dc074b6fce0',
    'the-lawn-canggu',
    'The Lawn',
    'bar',
    'ad2a41b6-ce96-5dfe-8c33-9bee8ba93e67',
    -8.6495, 115.185,
    'Canggu Beachfront, Bali',
    NULL,
    'https://balibuddies.com/best-restaurants-canggu/',
    3,
    '11am-sunset',
    'A beachfront lawn lounge popular for sunset sessions featuring frozen margaritas, relaxed seating, and live DJs. Perfect for solo travelers seeking a more intimate beach experience with quality drinks and laid-back tropical vibes.',
    true,
    'Established beachfront venue offering relaxed alternative to mega clubs, excellent for sunset solo experiences',
    '["Beachfront setting", "Live DJs", "Frozen drinks", "Relaxed vibe", "Sunset views"]'::jsonb,
    '["Popular evenings", "Can be crowded", "Sandy floor"]'::jsonb,
    'Great sunset spot, chill vibe, good drinks, safe atmosphere for solo travelers',
    'https://www.google.com/maps/search/?api=1&query=The%20Lawn&query_place_id=ChIJiQdg1YdH0i0R8ANUMzZizN0',
    'bar',
    NULL,
    '["balibuddies.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Indonesia)',
    88,
    4.4,
    210,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '2-3 hours',
    'Walk-ins welcome',
    NULL,
    'Sunset Bar',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '5ac118cd-4abf-5870-8a1e-10cf0f38a676',
    'cf0acfb1-d56d-54cf-a249-2dc074b6fce0',
    'vue-canggu',
    'Vue Canggu',
    'bar',
    'ad2a41b6-ce96-5dfe-8c33-9bee8ba93e67',
    -8.645, 115.168,
    'LV8 Resort, Canggu, Bali',
    NULL,
    'https://onbali.com/canggu/beach-clubs-in-canggu/',
    3,
    '10am-late',
    'A refined beach lounge within LV8 Resort offering an expansive infinity pool overlooking the ocean, curated cocktails, and chill grooves. Solo travelers enjoy a sophisticated alternative to party-centric clubs with quality service and ambiance.',
    true,
    'Luxury resort-based beach venue offering refined setting, excellent for solo travelers preferring sophisticated ambiance',
    '["Infinity pool", "Ocean views", "Curated cocktails", "Refined atmosphere", "DJ sets"]'::jsonb,
    '["Higher pricing", "Resort setting", "Quieter vibe"]'::jsonb,
    'Elegant setting, attentive service, perfect for quiet solo evening or afternoon',
    'https://www.google.com/maps/search/?api=1&query=Vue%20Canggu&query_place_id=ChIJHZdHip1H0i0RNOgyg4IdFPo',
    'bar',
    NULL,
    '["onbali.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Indonesia)',
    90,
    4.5,
    165,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '2-4 hours',
    'Walk-ins welcome, reservation recommended',
    NULL,
    'Refined Lounge',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '31443ce8-e00d-5de0-ada8-6cae93ad408f',
    '8e7d9302-7094-5479-99cd-cb36dc625ff4',
    '2-bulan-yogyakarta',
    '7 Clover Coffee Caravan',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    -7.785, 110.3945,
    'UGM Area, Sleman District, Yogyakarta',
    NULL,
    'https://www.instagram.com/7clovercoffee/',
    2,
    '8am-6pm',
    'A tropical-style coffee shop near UGM with comfortable indoor AC seating and shaded outdoor areas perfect for work-from-cafe experiences. Solo travelers appreciate the welcoming atmosphere, good coffee, and prime location for digital nomad lifestyle.',
    true,
    'New work-from-cafe concept specifically designed for remote workers, excellent WiFi and cafe culture',
    '["Tropical design", "AC indoor", "Shaded outdoor", "Good coffee", "Work-friendly WiFi"]'::jsonb,
    '["Hidden location", "Can be quiet", "Limited seating"]'::jsonb,
    'Perfect solo work spot, chill atmosphere, affordable coffee, helpful staff',
    'https://www.google.com/maps/search/?api=1&query=7%20Clover%20Coffee%20Caravan&query_place_id=ChIJI5k9L5ZZei4RPBnHzGVH5X8',
    'cafe',
    NULL,
    '["instagram.com/7clovercoffee"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Indonesia)',
    90,
    4.5,
    145,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '2-4 hours',
    'Walk-ins welcome',
    NULL,
    'Work Cafe',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '1d638c23-97d1-51b6-82e5-0a7c9d4ae8cb',
    '8e7d9302-7094-5479-99cd-cb36dc625ff4',
    'goela-djawa-yogyakarta',
    'Goela Djawa',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    -7.7878, 110.4015,
    'Central Yogyakarta, Yogyakarta',
    NULL,
    'https://www.instagram.com/goeladjawa/',
    2,
    '9am-5pm',
    'A contemporary Indonesian cafe culture space offering specialty coffee and light meals in Yogyakarta''s vibrant heart. Solo travelers experience authentic local cafe culture while supporting Indonesian cafe innovation.',
    true,
    'New local cafe brand offering authentic Indonesian culture through modern cafe experience',
    '["Indonesian concept", "Specialty coffee", "Local vibe", "Contemporary design", "Supporting local"]'::jsonb,
    '["Limited hours", "Central location can be crowded", "Cash preferred"]'::jsonb,
    'Great authentic local experience, supportive of women entrepreneurs, community-focused',
    'https://www.google.com/maps/search/?api=1&query=Goela%20Djawa&query_place_id=ChIJbZqP9SlRei4RhlILBNBmrxE',
    'cafe',
    NULL,
    '["instagram.com/goeladjawa"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Indonesia)',
    88,
    4.4,
    120,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '60 minutes',
    'Walk-ins welcome',
    NULL,
    'Local Cafe',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'f171da2a-ac44-5611-82d8-ddc20259b4a0',
    '8e7d9302-7094-5479-99cd-cb36dc625ff4',
    'kappu-coffee-yogyakarta',
    'Kappu Coffee',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    -7.792, 110.4025,
    'Central Yogyakarta, Yogyakarta',
    NULL,
    'https://www.instagram.com/kappucoffee/',
    2,
    '8am-6pm',
    'A brunch cafe style space offering combination of breakfast and lunch items from sweet to savory dishes. Perfect for solo travelers seeking leisurely mornings with quality coffee and Instagram-worthy food in welcoming local atmosphere.',
    true,
    'New brunch cafe concept popular with younger travelers, excellent for flexible solo dining schedule',
    '["Brunch menu", "All-day breakfast", "Sweet & savory", "Instagram-friendly", "Casual vibe"]'::jsonb,
    '["Can be crowded mornings", "Limited seating", "Popular with students"]'::jsonb,
    'Great brunch spot for solo morning, friendly staff, good portions, affordable',
    'https://www.google.com/maps/search/?api=1&query=Kappu%20Coffee&query_place_id=ChIJgRTsynVZei4Reqgzti_Yd7M',
    'cafe',
    NULL,
    '["instagram.com/kappucoffee"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Indonesia)',
    86,
    4.3,
    135,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '90 minutes',
    'Walk-ins welcome',
    NULL,
    'Brunch Spot',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'a3da9efb-1cff-5ce7-9c92-983fb8e1bbae',
    '8e7d9302-7094-5479-99cd-cb36dc625ff4',
    'ramayana-ballet-yogyakarta',
    'Ramayana Ballet Performance',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    -7.765, 110.3825,
    'Prambanan Temple Park, Yogyakarta',
    NULL,
    'https://ramayana-ballet-yogyakarta.com/',
    2,
    '7:30pm-9:30pm (seasonal)',
    'An open-air classical ballet performance depicting the Ramayana epic against the illuminated Prambanan Temple backdrop. A culturally immersive solo experience combining art, history, and spirituality in one of Java''s most sacred sites.',
    true,
    'Unique cultural performance combining arts and heritage learning, excellent solo evening cultural experience',
    '["Classical ballet", "Prambanan backdrop", "Open-air setting", "Cultural immersion", "Evening entertainment"]'::jsonb,
    '["Seasonal performance", "Early booking needed", "Weather dependent", "2-hour duration"]'::jsonb,
    'Extraordinary cultural experience, magical setting, comfortable solo attendance, unforgettable',
    'https://www.google.com/maps/search/?api=1&query=Ramayana%20Ballet%20Performance&query_place_id=ChIJgRAaCeNaei4RQs-4Enbl00I',
    'activity',
    NULL,
    '["ramayana-ballet-yogyakarta.com", "tripadvisor.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Indonesia)',
    94,
    4.7,
    620,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '3 hours',
    'Online booking recommended',
    NULL,
    'Cultural Show',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '0c220b8e-74bb-5563-b054-7ea3191de080',
    'f7ee87f1-e68c-5854-95d0-ce40a091b6ad',
    'white-beard-coffee-siargao',
    'White Beard Coffee',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    9.1197, 126.1945,
    'Purok 1, General Luna, Siargao Island, 8419 Surigao del Norte',
    '+63 999 132 7645',
    'https://white-beard-coffee-shop.menufyy.com/',
    2,
    '7am-9pm daily',
    'A minimalist coffee shop on Tourism Road featuring single-origin beans, slow-drip brews, and cinnamon rolls. Perfect for introspective solo mornings, this warm space welcomes writers, travelers, and anyone seeking quality coffee and contemplative atmosphere.',
    true,
    'Popular specialty coffee destination perfect for solo work and reflection, excellent quality',
    '["Single-origin coffee", "Slow-drip brews", "Cinnamon rolls", "Minimalist design", "Quiet vibe"]'::jsonb,
    '["Limited seating", "Popular mornings", "Simple menu"]'::jsonb,
    'Perfect solo coffee spot, peaceful atmosphere, excellent quality, friendly barista',
    'https://www.google.com/maps/search/?api=1&query=White%20Beard%20Coffee&query_place_id=ChIJ139t_eL3AzMR6ughPvhN52g',
    'cafe',
    NULL,
    '["tripadvisor.com", "coffeeopia.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Philippines)',
    92,
    4.6,
    185,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '60-90 minutes',
    'Walk-ins welcome',
    NULL,
    'Coffee Ritual',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'e20eeba1-f6a6-5311-9f29-3ab137e3f1d2',
    'f7ee87f1-e68c-5854-95d0-ce40a091b6ad',
    'isla-corgis-siargao',
    'Isla Corgis',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    9.129, 126.201,
    'Jacking Horse, Catangnan, Siargao Island, Surigao del Norte',
    NULL,
    'https://www.klook.com/activity/185419-isla-corgis-cafe-siargao/',
    1,
    '9am-12:30pm, 3pm-7pm (closed Tuesdays)',
    'The Philippines'' first corgi-themed cafe with more than 10 adorable corgis and one German Shepherd. A unique, joyful experience where solo travelers enjoy animal cuddles, cafe atmosphere, and community with no entrance fee.',
    true,
    'One-of-a-kind animal cafe experience perfect for solo animal-lovers seeking unique interactive experience',
    '["Corgi cafe", "Animal interaction", "No entrance fee", "Unique concept", "Social vibe"]'::jsonb,
    '["Limited hours", "Closed Tuesdays", "Rules for animal handling", "Very popular"]'::jsonb,
    'Delightful unique experience, corgis adorable, perfect for solo travelers seeking joy',
    'https://www.google.com/maps/search/?api=1&query=Isla%20Corgis&query_place_id=ChIJh5_J-pwJBDMRIFiquQGnlp8',
    'cafe',
    NULL,
    '["klook.com", "instagram.com/islacorgis.siargao"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Philippines)',
    94,
    4.7,
    245,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '60-90 minutes',
    'Walk-ins welcome, very popular',
    NULL,
    'Animal Cafe',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '09de0ff5-5a3a-5aa6-88c6-9dbc052885d1',
    'f7ee87f1-e68c-5854-95d0-ce40a091b6ad',
    'bayani-harana-siargao',
    'Bayani at Harana',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    9.118, 126.192,
    'Harana Surf Resort, 2 Tuason Point, General Luna, Siargao Island',
    NULL,
    'https://siargaovibes.com/restaurants/bayani-at-harana/',
    2,
    '7am-10pm daily',
    'A quiet dining space beneath a huge nipa hut serving authentic Filipino dishes with emphasis on Mindanaoan flavors. Solo diners enjoy welcoming atmosphere with fast WiFi and unique Mindanao cuisine in this popular digital nomad spot.',
    true,
    'Popular digital nomad restaurant with strong social community and excellent work environment',
    '["Nipa hut setting", "Mindanaoan cuisine", "Fast WiFi", "Quiet atmosphere", "Digital nomad hub"]'::jsonb,
    '["Can be social", "Tourist-heavy", "Limited menu"]'::jsonb,
    'Great for solo work and eating, friendly people, excellent WiFi, authentic food',
    'https://www.google.com/maps/search/?api=1&query=Bayani%20at%20Harana&query_place_id=ChIJ_SBvMxYJBDMRWVJ5STjdiyo',
    'restaurant',
    NULL,
    '["siargaovibes.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Philippines)',
    90,
    4.5,
    165,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '60-90 minutes',
    'Walk-ins welcome',
    NULL,
    'Nomad Hub',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'ed829c4a-8424-5b6c-b639-5a65313fffd3',
    'f7ee87f1-e68c-5854-95d0-ce40a091b6ad',
    'cev-ceviche-siargao',
    'CEV Ceviche & Kinilaw',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    9.1195, 126.195,
    'Tourism Road, Brgy. Catagnan, General Luna, Siargao, 8419 Surigao del Norte',
    '+63 939 400 8804',
    'https://booky.ph/biz/cev-ceviche-kinilaw-shack-siargao/about/',
    2,
    '12pm-3pm, 5:30pm-9pm',
    'A specialized ceviche and kinilaw shack serving the most famous fresh kinilaw in Siargao. Solo travelers enjoy fresh seafood prepared with traditional Filipino techniques, perfect for leisurely lunch or early dinner.',
    true,
    'Highly-rated specialty seafood restaurant, excellent for solo travelers seeking authentic local cuisine',
    '["Fresh ceviche", "Filipino kinilaw", "Fresh seafood", "Local specialty", "Flavorful dishes"]'::jsonb,
    '["Limited hours", "Lunch rush crowded", "Reservation recommended"]'::jsonb,
    'Excellent fresh seafood, friendly service, perfect solo lunch, very tasty',
    'https://www.google.com/maps/search/?api=1&query=CEV%20Ceviche%20%26%20Kinilaw&query_place_id=ChIJIwDSvjn3AzMRCuhz0q8dQcs',
    'restaurant',
    NULL,
    '["booky.ph", "tripadvisor.com", "featrmedia.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Philippines)',
    92,
    4.6,
    210,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '60-90 minutes',
    'Reservations recommended via phone',
    NULL,
    'Seafood Specialist',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '0383bff0-c167-53de-b33c-82688139d2d7',
    'f7ee87f1-e68c-5854-95d0-ce40a091b6ad',
    'kermit-siargao',
    'Kermit Italian Restaurant',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    9.125, 126.2,
    'Kermit Surf Resort, General Luna, Siargao Island',
    NULL,
    'https://siargaovibes.com/restaurants/kermit-siargao/',
    3,
    '11am-10pm',
    'A highly-regarded Italian restaurant within a surf resort serving the best pizza in Siargao with wood-fired cooking. Solo travelers enjoy quality Italian dining, community atmosphere, and excellent pizza in relaxed resort setting.',
    true,
    'Award-winning Italian restaurant with strong reputation, excellent for quality solo dining',
    '["Best pizza Siargao", "Wood-fired oven", "Italian cuisine", "Surf resort setting", "Community vibe"]'::jsonb,
    '["Moderate-high pricing", "Popular evenings", "Resort location"]'::jsonb,
    'Excellent pizza, welcoming atmosphere, perfect solo dinner, consistent quality',
    'https://www.google.com/maps/search/?api=1&query=Kermit%20Italian%20Restaurant&query_place_id=ChIJ61B9aRr2AzMRF8G5N5HSj9A',
    'restaurant',
    NULL,
    '["siargaovibes.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Philippines)',
    94,
    4.7,
    180,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '90-120 minutes',
    'Walk-ins or reservation',
    NULL,
    'Pizza Excellence',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '6249fd74-4c2b-5986-b44c-1b149b75307d',
    'f7ee87f1-e68c-5854-95d0-ce40a091b6ad',
    'sugba-lagoon-siargao',
    'Sugba Lagoon',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    9.145, 126.175,
    'Siargao Island, General Luna, Surigao del Norte',
    NULL,
    'https://siargaovibes.com/attractions/sugba-lagoon/',
    2,
    '6am-5pm tours',
    'A stunning hidden lagoon surrounded by limestone cliffs and lush greenery accessible by boat tour. Perfect for solo travelers seeking tranquil water experiences, island exploration, and snorkeling in pristine protected waters.',
    true,
    'Iconic scenic attraction offering peaceful alternative to social beach experiences',
    '["Hidden lagoon", "Limestone cliffs", "Pristine waters", "Snorkeling", "Natural wonder"]'::jsonb,
    '["Boat tour required", "Weather dependent", "Can be crowded"]'::jsonb,
    'Breathtakingly beautiful lagoon, peaceful experience, great snorkeling',
    'https://www.google.com/maps/search/?api=1&query=Sugba%20Lagoon&query_place_id=ChIJ04VH8_apBjMRudU6BvX4sNw',
    'activity',
    NULL,
    '["siargaovibes.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Philippines)',
    94,
    4.7,
    540,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '3-4 hours',
    'Book through hotels or tour offices',
    NULL,
    'Natural Wonder',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'b1ac6206-0fbc-5692-bb14-41c1a5cd25a3',
    'f7ee87f1-e68c-5854-95d0-ce40a091b6ad',
    'naked-island-siargao',
    'Naked Island',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    9.152, 126.168,
    'Near Siargao Island, Surigao del Norte',
    NULL,
    'https://siargaovibes.com/attractions/naked-island/',
    2,
    '6am-5pm tours',
    'A tiny isolated island visible only during low tide, offering secluded beach experience surrounded by turquoise waters. Solo travelers appreciate the quiet, pristine setting perfect for swimming, sunbathing, and peaceful reflection.',
    true,
    'Unique island experience offering solitude and natural beauty, excellent for solo meditation',
    '["Tidal island", "Pristine beach", "Turquoise waters", "Isolated setting", "Quiet atmosphere"]'::jsonb,
    '["Tide dependent", "Boat tour required", "Limited time on island"]'::jsonb,
    'Magical isolated experience, beautiful waters, peaceful solo time',
    'https://www.google.com/maps/search/?api=1&query=Naked%20Island&query_place_id=ChIJTYaG5CX3AzMR_nUdyoAV7Q8',
    'activity',
    NULL,
    '["siargaovibes.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Philippines)',
    92,
    4.6,
    380,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '3-4 hours',
    'Book through hotels or tour offices',
    NULL,
    'Island Escape',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'd462a867-eab9-5230-9800-b7fa45d02d55',
    'f4c0733c-cb5d-506d-ab33-001c482e8257',
    'lugang-cafe-cebu',
    'Lugang Cafe',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    10.3157, 123.8854,
    'Upper Ground Floor, Seaview Wing, SM Seaside City Cebu, Cebu City',
    NULL,
    'https://lugangcafe.com.ph/',
    2,
    'Mall hours',
    'Lugang Cafe''s first Visayas branch bringing authentic Taiwanese cuisine featuring signature xiao long bao, three-cup chicken, and cozy interiors. Solo travelers enjoy quality dim sum and dumplings in a comfortable setting perfect for leisurely meals.',
    true,
    'New regional expansion of established Taiwanese brand offering quality consistency and cultural cuisine',
    '["Taiwanese cuisine", "Xiao long bao", "Three-cup chicken", "Dim sum", "Cozy interior"]'::jsonb,
    '["Mall location", "Popular times crowded", "Moderate pricing"]'::jsonb,
    'Excellent Chinese food, welcoming staff, perfect for solo dining',
    'https://www.google.com/maps/search/?api=1&query=Lugang%20Cafe&query_place_id=ChIJ44tYJACdqTMRhK5MZhU_l8A',
    'restaurant',
    NULL,
    '["lugangcafe.com.ph", "rappler.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Philippines)',
    90,
    4.5,
    125,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '60-90 minutes',
    'Walk-ins or reservation',
    NULL,
    'Taiwanese Dining',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '5cb7f57f-cc85-5398-a22e-c31064af0206',
    'f4c0733c-cb5d-506d-ab33-001c482e8257',
    'abaca-baking-company-cebu',
    'Abaca Baking Company',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    10.317, 123.8875,
    'Ground Floor, North Wing, SM City Cebu, Cebu City, Cebu',
    '(032) 342-2222',
    'https://www.theabacagroup.com/concept/abaca-baking-company',
    2,
    'Mall hours',
    'An award-winning bakery and cafe known for all-butter croissants and artisanal pastries with breakfast, lunch, and dinner options. Solo travelers enjoy quality baked goods, expert coffee, and comfortable seating for extended stays.',
    true,
    'Established local bakery brand with reputation for quality pastries, excellent for solo breakfast/brunch',
    '["All-butter croissants", "Artisanal pastries", "Quality coffee", "All-day menu", "Local brand"]'::jsonb,
    '["Mall location", "Morning rush", "Limited outdoor seating"]'::jsonb,
    'Delicious pastries, excellent coffee, perfect solo breakfast spot',
    'https://www.google.com/maps/search/?api=1&query=Abaca%20Baking%20Company&query_place_id=ChIJNd3am1GZqTMRZOesRwEffI0',
    'cafe',
    NULL,
    '["theabacagroup.com", "smsupermalls.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Philippines)',
    92,
    4.6,
    210,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '60 minutes',
    'Walk-ins welcome',
    NULL,
    'Bakery Excellence',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '2098c131-606a-5771-943e-c0934d27cd32',
    'f4c0733c-cb5d-506d-ab33-001c482e8257',
    'twist-buckle-cebu',
    'Twist & Buckle',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    10.3425, 123.9545,
    '3rd Level, SM J Mall, Mandaue City, Cebu',
    NULL,
    'https://www.twistandbuckle.com/',
    2,
    'Mall hours',
    'Hong Kong''s Michelin-awarded churro specialist now in Cebu offering gourmet churros, churro donuts, and specialty ice cream. Solo travelers enjoy casual sweet treats and Instagram-worthy desserts in a fun, relaxed setting.',
    true,
    'International award-winning dessert brand debut in Cebu, excellent for solo sweet treats and Instagram moments',
    '["Michelin-awarded", "Gourmet churros", "Specialty ice cream", "Instagram-worthy", "International brand"]'::jsonb,
    '["Mall location", "Small shop", "Popular times", "Pricey for desserts"]'::jsonb,
    'Delicious churros, Instagram-perfect, fun solo treat',
    'https://www.google.com/maps/search/?api=1&query=Twist%20%26%20Buckle&query_place_id=ChIJoZ7oewCZqTMRj1016QHrmPc',
    'cafe',
    NULL,
    '["twistandbuckle.com", "smsupermalls.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Philippines)',
    90,
    4.5,
    95,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '30-45 minutes',
    'Walk-ins only',
    NULL,
    'Award-Winning Desserts',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '1616af24-0c78-548b-8504-6c216f897d0b',
    'f4c0733c-cb5d-506d-ab33-001c482e8257',
    'wolfgangs-steakhouse-cebu',
    'Wolfgang''s Steakhouse',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    10.3175, 123.888,
    'Unit B112-B114, First Level North Wing, SM City Cebu, Mabolo, Cebu City 6000',
    '0945 617 5339',
    'https://main.wolfgangssteakhouse.ph/',
    3,
    '10am-10pm (Sun-Thu), 10am-11pm (Fri-Sat)',
    'A world-renowned steakhouse featuring USDA Prime dry-aged beef cooked to perfection. Solo travelers enjoy upscale dining experience with professional service, elegant atmosphere, and exceptional quality for special occasions.',
    true,
    'Premium international steakhouse brand new to Cebu, excellent for solo fine dining',
    '["USDA Prime beef", "Dry-aged steaks", "Upscale dining", "Professional service", "International quality"]'::jsonb,
    '["High pricing", "Formal dress recommended", "Popular evenings"]'::jsonb,
    'Excellent steaks, professional service, comfortable solo dining, special occasion worthy',
    'https://www.google.com/maps/search/?api=1&query=Wolfgang%27s%20Steakhouse&query_place_id=ChIJvzzDVgCZqTMR0-nPRsAfH-E',
    'restaurant',
    NULL,
    '["wolfgangssteakhouse.ph", "simpol.ph"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Philippines)',
    92,
    4.6,
    110,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '120 minutes',
    'Reservation recommended',
    NULL,
    'Upscale Dining',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'a6d8fafe-53d9-5099-b443-9a6f254b41c6',
    'f4c0733c-cb5d-506d-ab33-001c482e8257',
    'ooma-cebu',
    'Ooma',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    10.3165, 123.8885,
    'SM Seaside City Cebu, Cebu City',
    NULL,
    'https://themomentgroup.com/',
    3,
    'Mall hours',
    'A bold Japanese dining concept from The Moment Group offering innovative Japanese flavors and creative preparations. Solo travelers enjoy modern Japanese cuisine, artistic presentation, and contemporary restaurant ambiance.',
    true,
    'New upscale Japanese restaurant from acclaimed culinary group, excellent for solo fine dining',
    '["Modern Japanese", "Innovative dishes", "Artistic presentation", "Upscale setting", "Creative menu"]'::jsonb,
    '["Higher pricing", "Popular times crowded", "Reservation recommended"]'::jsonb,
    'Excellent Japanese food, beautiful presentation, comfortable solo dining',
    'https://www.google.com/maps/search/?api=1&query=Ooma&query_place_id=ChIJwedaewCZqTMROQFsbL-rEH0',
    'restaurant',
    NULL,
    '["themomentgroup.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Philippines)',
    90,
    4.5,
    85,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '90-120 minutes',
    'Reservation recommended',
    NULL,
    'Japanese Modern',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '54aa882a-c669-5244-b451-2c494e499757',
    'f4c0733c-cb5d-506d-ab33-001c482e8257',
    'manam-cebu',
    'Manam',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    10.316, 123.889,
    'SM Seaside City Cebu, Cebu City',
    NULL,
    'https://themomentgroup.com/',
    3,
    'Mall hours',
    'A Filipino-inspired dining concept from The Moment Group offering nostalgic Filipino dishes with modern twists. Solo travelers enjoy familiar comfort food elevated with contemporary techniques in sophisticated setting.',
    true,
    'New upscale Filipino concept restaurant, excellent for solo cultural dining experience',
    '["Filipino cuisine", "Modern twists", "Nostalgic dishes", "Upscale setting", "Cultural food"]'::jsonb,
    '["Higher pricing", "Popular times crowded", "Reservation recommended"]'::jsonb,
    'Excellent Filipino food reimagined, comfortable solo dining, proud local experience',
    'https://www.google.com/maps/search/?api=1&query=Manam&query_place_id=ChIJPbL4KwCZqTMRA5opmqlII8M',
    'restaurant',
    NULL,
    '["themomentgroup.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Philippines)',
    90,
    4.5,
    90,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '90-120 minutes',
    'Reservation recommended',
    NULL,
    'Filipino Modern',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'ea78a5e7-f589-573f-886a-1b463c5f1576',
    'f4c0733c-cb5d-506d-ab33-001c482e8257',
    'mactan-cebu-heritage',
    'Mactan Lapu-Lapu Monument & Market',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    10.3187, 123.9758,
    'Mactan Island, Cebu, Philippines',
    NULL,
    'https://cebu.gov.ph/',
    0,
    '8am-6pm',
    'A historic monument honoring Lapu-Lapu, first Filipino hero, with adjacent local markets and seafood restaurants. Solo travelers enjoy cultural learning, authentic market exploration, and fresh seafood dining in vibrant community setting.',
    true,
    'Important cultural heritage site offering education and community experience, free accessible attraction',
    '["Historic monument", "Cultural significance", "Local markets", "Seafood dining", "Community vibe"]'::jsonb,
    '["Crowded times", "Hot midday", "Market navigation", "Bring cash for market"]'::jsonb,
    'Important cultural site, interesting market exploration, authentic experience',
    'https://www.google.com/maps/search/?api=1&query=Mactan%20Lapu-Lapu%20Monument%20%26%20Market&query_place_id=ChIJv57vuByXqTMRVxIpurXB7Vg',
    'activity',
    NULL,
    '["cebu.gov.ph"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Philippines)',
    86,
    4.3,
    280,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '2-3 hours',
    'Free access, market vendors available',
    NULL,
    'Cultural Heritage',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '9e3b293f-6ad7-5517-af9b-23d1c1d2908e',
    '9220ca93-f240-5cfb-807c-af07ad211521',
    'book-park-lounge-seoul',
    'Book Park Lounge',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    37.5378, 126.9827,
    '294 Itaewon-ro, Yongsan-gu, Seoul (Blue Square, 3F)',
    '+82-507-1312-0539',
    'https://www.blueskuare.com/',
    2,
    '11:30 - 21:00 Tue-Sun, Closed Mondays',
    'Get lost in literature at this stunning 5-story bookshelf lounge where you can settle in with a coffee for hours. Your day ticket (KRW 12,900) includes unlimited access and a beverage, making it the perfect sanctuary for solo readers who want to slow down and simply be. It''s Instagram-worthy without trying too hard-genuine coziness wrapped in creative design.',
    true,
    'Solo travelers rave about this spot for productive work sessions and peaceful reading. The entry system encourages extended stays without time pressure, and the bookish atmosphere attracts thoughtful, quiet travelers. It''s one of Seoul''s best accessible luxury experiences for under $12.',
    '["5-story bookshelf wall", "unlimited stay with day pass", "beverage included", "quiet literary atmosphere", "Instagram-worthy design"]'::jsonb,
    '["Small cafe capacity fills quickly during peak hours", "Best visited off-peak for seating", "Limited food options beyond drinks"]'::jsonb,
    '"As a solo traveler, I felt totally comfortable spending the whole afternoon here with a book and coffee." - Travel blogger, 2025',
    'https://www.google.com/maps/search/?api=1&query=Book%20Park%20Lounge&query_place_id=ChIJQXceoCOjfDURAaChgBjkfzg',
    'cafe',
    NULL,
    '["english.visitseoul.net", "english.seoul.go.kr", "mindtrip.ai"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (South Korea)',
    84,
    4.2,
    285,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '2-4 hours',
    'Walk-in only; purchase day ticket at entrance',
    NULL,
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'de0b3526-ca63-51e9-80b8-fa75cddad4e0',
    '9220ca93-f240-5cfb-807c-af07ad211521',
    'nuldam-space-gyeongbok-seoul',
    'Nuldam Space - Gyeongbok Palace Branch',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    37.5768, 126.9705,
    '24 Samcheong-ro, Jongno-gu, Seoul',
    '+82-2-1533-7941',
    'https://nuldamspace.com/en',
    2,
    '10:00 - 21:30 Daily',
    'Write a letter to yourself at this whimsical vegan cafe where mindfulness meets creativity. Nuldam''s signature experience lets you pen a message that they''ll send to you one year later-a beautiful ritual for solo travelers seeking intentional moments. The space glows with warmth, their plant-based drinks are thoughtfully made, and the whole concept feels like a hug in a busy city.',
    true,
    'Perfect for solo female travelers looking for a meaningful, non-rushed experience. The letter-writing ritual gives you a concrete reason to slow down and reflect. Many solo travelers specifically seek it out as a wellness moment, and the vegan focus appeals to travelers with dietary preferences.',
    '["Letter-to-future-self experience", "100% vegan menu", "thoughtful aesthetic", "multiple Seoul locations", "wellness-focused atmosphere"]'::jsonb,
    '["Can get busy with tourists during peak hours", "Only drinks and light pastries, limited food", "Small seating capacity"]'::jsonb,
    '"The most therapeutic cafe experience I''ve had while traveling alone. Writing a letter to myself felt so special." - Solo travel guide, 2024',
    'https://www.google.com/maps/search/?api=1&query=Nuldam%20Space%20-%20Gyeongbok%20Palace%20Branch&query_place_id=ChIJ6xwTRt6jfDUR7FQKdD1sSp0',
    'cafe',
    NULL,
    '["nuldamspace.com", "thesmartlocal.kr", "wanderboat.ai"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (South Korea)',
    82,
    4.1,
    412,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '1-2 hours',
    'Walk-in only; no reservations needed',
    NULL,
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '5af787cc-1995-59bc-b402-042e9d1ab574',
    '9220ca93-f240-5cfb-807c-af07ad211521',
    'kyoja-myeongdong-seoul',
    'Kyoja Myeongdong',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    37.5633, 126.9834,
    '29 Myeongdong 10-gil, Jung-gu, Seoul',
    '+82-2-776-5348',
    'https://guide.michelin.com/us/en/seoul-capital-area/kr-seoul/restaurant/myeongdong-kyoja',
    1,
    '10:30 - 21:00 Daily',
    'This Michelin-recognized family institution has been perfecting kalguksu (handmade noodle soup) since 1966, and it''s a solo diner''s dream. The kitchen seats you at individual partitioned tables downstairs so you never feel isolated while eating-you''re surrounded by fellow diners creating a cozy communal energy. Simple, authentic, delicious Korean comfort at prices that won''t break your budget.',
    true,
    'Solo female travelers specifically praise this restaurant for making single diners feel welcome. The partitioned seating layout is genius for solo travelers, and Korean noodle soups are naturally portion-controlled for one. Michelin recognition means quality without pretension or crowds of tourists.',
    '["Michelin-recognized", "family-run since 1966", "partitioned solo seating downstairs", "authentic kalguksu and dumplings", "budget-friendly"]'::jsonb,
    '["Very popular, expect lines during meal times", "Limited menu (only 4 items)", "No reservations accepted"]'::jsonb,
    '"Perfect solo dining setup-I didn''t feel awkward at all sitting in my little booth while slurping noodles." - Solo traveler review, 2025',
    'https://www.google.com/maps/search/?api=1&query=Kyoja%20Myeongdong&query_place_id=ChIJW7FBDfCifDURHTpisLbVUH0',
    'restaurant',
    NULL,
    '["guide.michelin.com", "tripadvisor.com", "english.visitkorea.or.kr"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (South Korea)',
    86,
    4.3,
    1847,
    '2026-02-10 06:38:06.869756+00',
    'afternoon',
    '45 minutes',
    'Walk-in only; arrive off-peak (11am or 2-5pm) to avoid lines',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '033096c0-23ac-5438-9ef1-363a71e41339',
    '9220ca93-f240-5cfb-807c-af07ad211521',
    'time-travelers-relax-seoul',
    'Time Travelers Relax Guesthouse',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    37.5563, 126.9267,
    '90-13 Sinchon-ro 1-gil, Seodaemun-gu, Seoul',
    '+82-10-6494-2154',
    'https://www.hostelworld.com/hostels/p/273421/time-travelers-relax-guesthouse-seoul/',
    1,
    '24/7 (24-hour reception)',
    'This beloved Hongdae hostel feels less like a commercial establishment and more like staying with a thoughtful friend. The owners have decorated every wall with art and trick photography that sparks conversation, and female-only dorms offer real safety without sacrificing the social vibe. You''ll find other solo travelers naturally gravitating here-it''s where authentic connection happens.',
    true,
    'Female solo travelers specifically choose this hostel for its woman-centered safety culture and welcoming hosts. Reviews consistently mention the owners'' genuine care, the artistic touches that make it special, and the natural community that forms. It''s near Hongik University for nightlife and Hongdae''s creative district.',
    '["Female-only dorm options", "artist-decorated common areas", "trick art installations", "social atmosphere for solo travelers", "24-hour reception"]'::jsonb,
    '["Mixed dorms available but communal feel means less privacy", "In busy Hongdae area (can be loud at night)", "Small kitchen facilities"]'::jsonb,
    '"The female dorm has great locks and lockers, and the vibe here made me feel like I had a community instantly." - Solo female traveler, 2025',
    'https://www.google.com/maps/search/?api=1&query=Time%20Travelers%20Relax%20Guesthouse&query_place_id=ChIJNwhQeeuYfDURTIIpAnukflI',
    'hostel',
    '25',
    '["hostelworld.com", "booking.com", "tripadvisor.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (South Korea)',
    88,
    4.4,
    683,
    '2026-02-10 06:38:06.869756+00',
    'any',
    'overnight',
    'Book via Hostelworld, Booking.com, or Agoda; walk-ins welcome',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '7506ca13-8cec-5912-90a9-ada4a95a58bd',
    '9220ca93-f240-5cfb-807c-af07ad211521',
    'myeongdong-house-hotel-seoul',
    'Myeongdong House',
    'hotel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    37.5638, 126.9839,
    'Near Myeongdong Station (5-minute walk), Jung-gu, Seoul',
    '+82-2-778-0313',
    'https://www.myeongdong-kr.com/',
    1,
    '24-hour check-in available',
    'This cozy guesthouse sits right in the heart of Seoul''s most vibrant shopping district, giving you easy access to K-beauty, street food, and endless energy. The rooms are small but spotless, and the location means you can literally step out your door into Seoul''s most electric neighborhood. Solo travelers love the safety factor of staying in a busy, well-lit area with constant foot traffic.',
    true,
    'Perfect for solo female travelers seeking urban immersion with built-in safety through crowds. Myeongdong is heavily touristed, well-lit at all hours, and filled with restaurants and shops suited to solo dining. The hotel''s affordable rate makes it accessible for budget-conscious solo travelers.',
    '["Heart of Myeongdong shopping district", "5-min walk to subway", "near K-beauty flagship stores", "24-hour access to street food", "well-lit neighborhood"]'::jsonb,
    '["Very touristy area, less local feel", "Can be crowded and loud", "Small rooms"]'::jsonb,
    '"I felt so safe walking around Myeongdong solo at night-every corner is lit and filled with people and shops." - Solo female traveler, 2024',
    'https://www.google.com/maps/search/?api=1&query=Myeongdong%20House&query_place_id=ChIJ1TQ9a_eifDURt69Ao1wD5CQ',
    'hotel',
    '45',
    '["tripadvisor.com", "booking.com", "agoda.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (South Korea)',
    76,
    3.8,
    156,
    '2026-02-10 06:38:06.869756+00',
    'any',
    'overnight',
    'Book via Booking.com, Agoda, or direct; walk-ins welcome',
    NULL,
    'Budget gem',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '88def311-cd67-54d2-8935-bc80ea2d8d4f',
    '9220ca93-f240-5cfb-807c-af07ad211521',
    'n-seoul-tower-seoul',
    'N Seoul Tower Observatory',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    37.5509, 126.9861,
    '105 Namsangongwon-gil, Yongsan-gu, Seoul',
    '+82-2-3455-9277',
    'https://www.nseoultower.co.kr/eng/',
    2,
    '10:30-22:30 Weekdays, 10:00-23:00 Weekends',
    'Seoul''s iconic tower offers 360-degree views that make you feel on top of the world-literally. The observation decks on the 89th and 101st floors let you see mountains, the Han River, and endless cityscape, especially stunning at golden hour or night. It''s a solo traveler staple: peaceful, accessible, and genuinely awe-inspiring without being touristy-feeling.',
    true,
    'Solo female travelers consistently choose this for its safety, accessibility, and the moment of reflection it creates. The tower has excellent lighting, is very tourist-friendly, and offers a natural pause point in any itinerary. Sunset or after-dark visits are particularly magical and secure.',
    '["360-degree city views", "89th and 101st floor observatories", "sunset viewing opportunities", "night cityscape views", "cable car option"]'::jsonb,
    '["Can be crowded during peak hours", "Ticket prices are moderate", "Cable car adds extra cost"]'::jsonb,
    '"Standing alone looking out at the whole city from up there, I felt so independent and peaceful." - Solo traveler, 2025',
    'https://www.google.com/maps/search/?api=1&query=N%20Seoul%20Tower%20Observatory&query_place_id=ChIJqWqOqFeifDURpYJ5LnxX-Fw',
    'landmark',
    NULL,
    '["nseoultower.co.kr", "english.visitseoul.net", "english.visitkorea.or.kr"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (South Korea)',
    90,
    4.5,
    2156,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '1.5-2 hours',
    'Buy tickets on-site (5F) or advance online; cable car optional',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'debbbbd7-819c-5c7c-a74e-49de98349022',
    '9220ca93-f240-5cfb-807c-af07ad211521',
    'cheonggyecheon-stream-seoul',
    'Cheonggyecheon Walking Path',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    37.5708, 126.9896,
    '1 Cheonggyecheon-ro, Jongno-gu, Seoul',
    '+82-2-2290-6114',
    'https://english.visitseoul.net/walking-tour/Cheonggyecheon-1/ENN000636',
    0,
    'Open 24/7',
    'This 10.9km restored urban stream flows through downtown Seoul like the city''s hidden secret. Walk the pedestrian path any time of day to find fountains, public art, and a surprising sense of peace amid the urban energy. It''s therapeutic solo wandering-you set the pace, choose your playlist, and discover small bridges, sculptures, and cafes along the way.',
    true,
    'Solo travelers love this for flexible, safe urban exploration. The path is well-lit at night, busy during the day, and you can walk as little (500m) or as much (entire 10.9km) as you want. Multiple entry/exit points mean you''re never trapped, and it''s a great escape from shopping district crowds.',
    '["Free public access 24/7", "10.9km total walking distance", "22 bridges crossing the stream", "public art installations", "multiple entry/exit points"]'::jsonb,
    '["Entire walk takes 2-3 hours", "Can be slippery after rain", "Busier during day, quieter at night"]'::jsonb,
    '"I walked the whole thing solo and found the most peaceful moments in the middle of Seoul. It''s totally safe and magical." - Solo traveler, 2024',
    'https://www.google.com/maps/search/?api=1&query=Cheonggyecheon%20Walking%20Path&query_place_id=ChIJIwCT4-yifDUR1E63iG76hr0',
    'landmark',
    NULL,
    '["english.visitseoul.net", "english.visitkorea.or.kr", "gorgeousunknown.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (South Korea)',
    88,
    4.4,
    1203,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '1-3 hours',
    'Walk-in anytime; accessible from 11 subway stations',
    'easy',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '05c91e34-3228-5181-a674-5c6a8906988f',
    '9220ca93-f240-5cfb-807c-af07ad211521',
    'insadong-seoul',
    'Insadong Arts & Craft District',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    37.5733, 126.9847,
    'Insadong-gil, Jongno-gu, Seoul',
    NULL,
    'https://english.visitseoul.net/shopping/Insadong/ENP000067',
    1,
    'Most shops 10:00-20:00, galleries vary',
    'Step into Seoul''s cultural heart, where 100+ galleries, traditional Korean restaurants, and quirky craft shops line narrow alleyways. You''ll find authentic artisan tea houses, calligraphy studios, pottery shops, and galleries featuring contemporary Korean art. It''s bohemian, walkable, and perfect for solo travelers who prefer culture over crowds.',
    true,
    'Solo female travelers rave about Insadong''s authenticity and safety. The neighborhood attracts thoughtful, artistic travelers; you won''t feel rushed or alone even when solo. Free gallery admission on weekends, and the tea house culture welcomes solo visitors. Many cultural experiences (stamp carving, tea ceremony) are solo-friendly.',
    '["~100 galleries with free weekend admission", "traditional Korean teahouses", "craft workshops and studios", "authentic local restaurants", "pedestrian-friendly alley network"]'::jsonb,
    '["Can be crowded on weekends", "Some galleries have limited hours", "Steep learning curve for some crafts"]'::jsonb,
    '"I spent hours wandering Insadong alone-it felt like discovering real Seoul away from tourists. Perfect for a contemplative solo day." - Solo traveler, 2025',
    'https://www.google.com/maps/search/?api=1&query=Insadong%20Arts%20%26%20Craft%20District&query_place_id=ChIJe_DH-eeifDURH6NzBYr0d7I',
    'landmark',
    NULL,
    '["english.visitseoul.net", "thesoulofseoul.net", "koreatodo.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (South Korea)',
    86,
    4.3,
    1587,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '3-4 hours',
    'Walk-in to galleries and shops; call ahead for workshops',
    'easy',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'd5cfbbad-4caf-5dc0-a2e6-9b61a3d14dcb',
    '9220ca93-f240-5cfb-807c-af07ad211521',
    'hongojib-mapo-seoul',
    'Hongojib Korean BBQ',
    'restaurant',
    '17ad9682-d419-50e7-aa8c-3bdf6b0de5d0',
    37.5379, 126.9514,
    '331-18 Xi-gyo-dong, Mapo-gu, Seoul',
    '+82-2-332-0120',
    'https://creatrip.com/en/blog/8653',
    2,
    '24 hours (some branches may vary)',
    'This is Korean BBQ reimagined for solo diners: instead of a big shared table, you get your own personal grill at a counter where you cook at your own pace. Order meat portions that suit just you, work the grill yourself, and feel totally independent while enjoying one of Korea''s most social meals. It''s genius design for solo travelers.',
    true,
    'Korean BBQ traditionally feels impossible for solo diners, but Hongojib changed the game. Female solo travelers specifically seek this out because it removes the awkwardness of eating BBQ alone. The counter seating creates a natural community vibe, and the multilingual menu tablets are tourist-friendly.',
    '["Personal grills for solo diners", "counter seating setup", "multilingual order tablets", "individual condiments/portions", "24-hour availability"]'::jsonb,
    '["Can get smoky (bring a sweater you don''t mind smelling)", "Popular, arrive off-peak", "Pork belly portions small but affordable"]'::jsonb,
    '"Finally, Korean BBQ where I don''t feel weird eating alone! My own grill, my own pace. Loved it." - Solo female traveler, 2024',
    'https://www.google.com/maps/search/?api=1&query=Hongojib%20Korean%20BBQ&query_place_id=ChIJ0zY0YgCjfDURMdCFTOOcO8A',
    'restaurant',
    NULL,
    '["creatrip.com", "lemonapp.com", "mindtrip.ai"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (South Korea)',
    82,
    4.1,
    428,
    '2026-02-10 06:38:06.869756+00',
    'evening',
    '1-1.5 hours',
    'Walk-in only; order via multilingual tablet',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'd61bee1d-3eb9-5053-9270-3190f4be3ad2',
    '9220ca93-f240-5cfb-807c-af07ad211521',
    'zzzip-guesthouse-hongdae-seoul',
    'Zzzip Guesthouse Hongdae',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    37.5544, 126.9278,
    '32-16 Seongji 1-gil, Mapo-gu, Seoul',
    NULL,
    'https://www.hostelworld.com/hostels/p/83226/zzzip-guesthouse-in-hongdae/',
    1,
    '24-hour reception',
    'This quirky, creative hostel in trendy Hongdae feels like a home run for solo travelers. The owners Jina and Bryan are famously welcoming, the dorms are clean with secure lockers, and the common spaces buzz with people comparing travel notes. It''s the perfect mix: social enough to meet people, but run with genuine care for guest comfort.',
    true,
    'Female solo travelers specifically praise the owners'' attentiveness to safety and comfort, plus the hostel''s location 4 minutes from Hapjeong subway and 10 minutes from Hongdae''s nightlife. The dorms are female-friendly, lockers are secure, and the vibe attracts solo travelers specifically.',
    '["Owners praised for hospitality", "clean, secure dorm setup", "4-min walk to subway", "near Hongdae nightlife", "social common areas"]'::jsonb,
    '["Can be noisy at night due to location near clubs", "Small rooms", "Limited kitchen facilities"]'::jsonb,
    '"Jina and Bryan made me feel so welcome. Great location, clean beds, secure lockers. Perfect for solo travel." - Solo female traveler, 2025',
    'https://www.google.com/maps/search/?api=1&query=Zzzip%20Guesthouse%20Hongdae&query_place_id=ChIJtROsKNGYfDURglkDCPMlexY',
    'hostel',
    '22',
    '["hostelworld.com", "booking.com", "agoda.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (South Korea)',
    86,
    4.3,
    521,
    '2026-02-10 06:38:06.869756+00',
    'any',
    'overnight',
    'Book via Hostelworld, Booking.com, or walk-in',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'b60e079e-0045-52f7-9d35-8b5466659d31',
    '33af0601-73b1-54e9-87b3-0455b62e0048',
    'gamcheon-culture-village-busan',
    'Gamcheon Culture Village',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    35.0997, 129.0722,
    '125 Okcheon-ro, Gamcheon-dong, Saha-gu, Busan',
    NULL,
    'https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301001001000&uc_seq=365',
    0,
    'March-Oct 09:00-18:00, Nov-Feb 09:00-17:00',
    'Climb into a storybook village of pastel-painted houses tumbling down a steep hillside, each one more whimsical than the last. Murals, sculptures, and hidden cafes make for endless photography moments and wandering. Visit early in the morning before crowds arrive, and you''ll have this magical hilltop mostly to yourself-perfect for solo exploration and reflection.',
    true,
    'Solo female travelers love this landmark because it''s steep enough to feel adventurous but safe, free to enter, and incredibly photogenic. The morning solitude is therapeutic; by afternoon it gets touristy. The village is compact, so solo navigation is easy. Multiple cafes throughout mean you can rest whenever needed.',
    '["Colorful painted houses and murals", "free entry to village", "scenic hillside location", "cafes throughout", "Instagram-worthy art installations"]'::jsonb,
    '["Very steep terrain (challenging knees)", "Busier afternoon/weekend", "Limited facilities at top"]'::jsonb,
    '"Arrived early solo and had the village almost to myself. The energy is so creative and welcoming-perfect morning adventure." - Solo traveler, 2025',
    'https://www.google.com/maps/search/?api=1&query=Gamcheon%20Culture%20Village&query_place_id=ChIJUToRo7fpaDURo_ZMItcBfpc',
    'landmark',
    NULL,
    '["visitbusan.net", "tripadvisor.com", "hungrypursuit.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (South Korea)',
    88,
    4.4,
    1842,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '2-3 hours',
    'Walk-in; arrive before 9:30am for fewer crowds',
    'challenging',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'a9364f05-6e89-57a5-a74b-ee30fea4d56a',
    '33af0601-73b1-54e9-87b3-0455b62e0048',
    'haedong-yonggungsa-busan',
    'Haedong Yonggungsa Temple',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    35.2356, 129.2069,
    '86 Yonggung-gil, Gijang-gun, Busan',
    '+82-51-722-7744',
    'https://www.visitbusan.net/en/index.do?menuCd=DOM_000000301001001000&uc_seq=261&lang_cd=en',
    0,
    '04:30-19:00 Daily',
    'Watch sunrise or sunset from a Buddhist temple perched on coastal cliffs-this is Busan''s most serene, soul-stirring experience. Unlike mountain temples, this one sits right on the ocean, so you get golden light on water, crashing waves, and spiritual stillness all at once. Solo travelers find a natural pace here that''s meditative and grounding.',
    true,
    'Solo female travelers praise this temple for its safety, spiritual energy, and stunning natural setting. Early morning visits mean fewer crowds and perfect light. The temple welcomes solo visitors, and the coastal location means it''s never felt crowded in that touristy way. Free entry makes it accessible.',
    '["Oceanside Buddhist temple", "sunset/sunrise views", "coastal cliff location", "free entry", "peaceful atmosphere"]'::jsonb,
    '["Early morning hours (4:30am opening) required for sunrise", "Can be windy", "Steep stairs to reach temple"]'::jsonb,
    '"Watching the sun rise from this temple alone was one of the most peaceful moments of my whole trip. Totally recommend going early." - Solo traveler, 2025',
    'https://www.google.com/maps/search/?api=1&query=Haedong%20Yonggungsa%20Temple&query_place_id=ChIJwabeuxuMaDURXC4Rb21AQaE',
    'landmark',
    NULL,
    '["visitbusan.net", "klook.com", "english.visitkorea.or.kr"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (South Korea)',
    90,
    4.5,
    1567,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '1-2 hours',
    'Walk-in anytime; free entry',
    'moderate',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'd3d8d2aa-3157-5a0a-9730-624a8f3beefd',
    '33af0601-73b1-54e9-87b3-0455b62e0048',
    'jagalchi-market-busan',
    'Jagalchi Fish Market',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    35.0979, 129.0711,
    '52 Jagalchihaean-ro, Jung-gu, Busan',
    '+82-51-245-2594',
    'https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=69318',
    2,
    '05:00-22:00 (Closed 1st & 3rd Tuesdays)',
    'Korea''s largest seafood market is a sensory explosion: fresh sea creatures in tanks, vendors calling out in Korean, ocean salt in the air, and the energy of a real working market. Pick your seafood downstairs, take it upstairs to a restaurant, and watch skilled chefs transform your catch. Solo travelers love this for the authenticity and the built-in social energy.',
    true,
    'Solo female travelers appreciate this market because it''s a solo-dining solution in a culturally immersive setting. The upstairs restaurants are designed for single diners or groups, and the market energy makes you feel part of something larger. It''s safe, heavily touristed enough, and genuinely local.',
    '["Largest seafood market in Korea", "pick-your-own experience", "upstairs cooking service", "authentic local market", "great for group energy"]'::jsonb,
    '["Can be very crowded during peak times", "Strong seafood smell", "Language barrier without guide"]'::jsonb,
    '"The market energy is so fun and alive. I picked fresh octopus and had the most delicious meal. Felt totally safe navigating it solo." - Solo traveler, 2024',
    'https://www.google.com/maps/search/?api=1&query=Jagalchi%20Fish%20Market&query_place_id=ChIJudkrFArpaDURbbCzajeQs0c',
    'landmark',
    NULL,
    '["english.visitkorea.or.kr", "tripadvisor.com", "koreatodo.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (South Korea)',
    86,
    4.3,
    1456,
    '2026-02-10 06:38:06.869756+00',
    'afternoon',
    '1.5-2 hours',
    'Walk-in anytime; select seafood, take upstairs to restaurant',
    'easy',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '70fac894-5400-5197-ae60-6a7a304770b6',
    '33af0601-73b1-54e9-87b3-0455b62e0048',
    'taejongdae-park-busan',
    'Taejongdae Resort Park',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    35.0608, 129.1197,
    '24 Jeonmang-ro, Yeongdo-gu, Busan',
    NULL,
    'https://www.visitbusan.net/index.do?menuCd=DOM_000000302004001000&uc_seq=1155&lang_cd=en',
    0,
    '05:00-24:00 (Danubi Train 09:00-18:00)',
    'This clifftop park gives you a 4km coastal hiking trail with jaw-dropping ocean views, a lighthouse, and rocky shores where waves crash dramatically. The walk is mostly accessible (not too steep), and you can move at your own pace. Solo hikers love this for the combination of nature immersion, photo ops, and a sense of accomplishment without needing a guide.',
    true,
    'Solo female travelers choose this for its safety (always busy, well-maintained trails), the built-in sense of achievement, and the therapeutic ocean views. The park is car-free, so it feels peaceful and private even when other hikers pass. Multiple trails mean you can customize difficulty.',
    '["4km coastal trail", "ocean cliff views", "lighthouse viewpoint", "car-free park", "moderate-difficulty hike"]'::jsonb,
    '["Some steep sections", "Windy at clifftops", "Optional Danubi train for rest"]'::jsonb,
    '"Hiked this alone and felt so empowered by the ocean views and fresh air. Not too hard, totally doable solo." - Solo traveler, 2025',
    'https://www.google.com/maps/search/?api=1&query=Taejongdae%20Resort%20Park&query_place_id=ChIJOfX1e0zpaDURWq5Hp5x4-SM',
    'landmark',
    NULL,
    '["visitbusan.net", "tripadvisor.com", "nickkembel.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (South Korea)',
    88,
    4.4,
    987,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '2-3 hours',
    'Walk-in anytime; Danubi train tickets available at entrance',
    'moderate',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '93907b51-6bb5-5df6-86e1-ca4b387052f3',
    '33af0601-73b1-54e9-87b3-0455b62e0048',
    'oryukdo-skywalk-busan',
    'Oryukdo Skywalk',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    35.0733, 129.1358,
    '137 Oryukdo-ro, Nam-gu, Busan',
    '+82-51-607-6395',
    'https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=73894',
    0,
    '09:00-18:00 (June-Sept 09:00-19:00)',
    'Walk on a glass-floored skywalk suspended over the ocean-the adrenaline rush of seeing straight through to the rocks and water below is unmatched. It''s terrifying in the best way, and solo travelers get the whole experience without worrying about others'' pace or fear. Shoe covers are provided, and the whole thing feels like a carefully designed adventure.',
    true,
    'Solo female travelers specifically love this for the mix of thrill and safety. It''s a controlled, short experience (not time-consuming), free, and gives you a real sense of accomplishment. Perfect for building confidence and trying something scary alone.',
    '["Glass-floor skywalk experience", "ocean views below", "free entry", "shoe covers provided", "moderate adventure"]'::jsonb,
    '["Not for those with extreme heights", "Can be windy", "Operating hours limited"]'::jsonb,
    '"I''m not great with heights but did this alone and felt so proud. Everyone around me was supportive and it was genuinely exhilarating." - Solo traveler, 2024',
    'https://www.google.com/maps/search/?api=1&query=Oryukdo%20Skywalk&query_place_id=ChIJVRLdCsjtaDURcdummQTLnRk',
    'landmark',
    NULL,
    '["english.visitkorea.or.kr", "tripadvisor.com", "visitbusan.net"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (South Korea)',
    84,
    4.2,
    643,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '30-45 minutes',
    'Walk-in anytime during operating hours',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '5401a431-39a9-5f60-b639-ceb7dadad605',
    '33af0601-73b1-54e9-87b3-0455b62e0048',
    'gwangalli-beach-busan',
    'Gwangalli Beach & Promenade',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    35.1608, 129.1161,
    'Gwanganhaebyeon-ro, Suyeong-gu, Busan',
    NULL,
    'https://www.visitbusan.net/en/index.do?menuCd=DOM_000000301001001000&uc_seq=373&lang_cd=en',
    0,
    '24/7 (Cafes/Restaurants 10:00-late)',
    'Stroll the pedestrian promenade along this famous Busan beach, with the stunning Gwangandaegyo Bridge lighting up at night. The beachfront is lined with cafes and restaurants with ocean views, so you can grab coffee, rest on the sand, or watch the sunset. Solo travelers love the safe, walkable vibe and the natural rhythm of beach time.',
    true,
    'Solo female travelers appreciate Gwangalli for its 24/7 public energy, abundant cafes and bars (solo-dining friendly), and excellent lighting at night. The beach is patrolled and well-maintained. You can walk as long or short as you want, and there''s always somewhere to rest or get a drink.',
    '["2km sandy beach", "oceanfront promenade", "bridge night views", "abundant cafes/restaurants", "24/7 public space"]'::jsonb,
    '["Crowded on weekends", "Can be hot in summer", "Parking can be expensive"]'::jsonb,
    '"Just walked alone along this beach for hours, stopped for coffee, watched the bridge light up. Felt so peaceful and safe." - Solo traveler, 2025',
    'https://www.google.com/maps/search/?api=1&query=Gwangalli%20Beach%20%26%20Promenade&query_place_id=ChIJQ7OamaDBaDURVqEEI6RLxXA',
    'landmark',
    NULL,
    '["visitbusan.net", "koreatodo.com", "tripadvisor.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (South Korea)',
    86,
    4.3,
    1203,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '1-3 hours',
    'Walk-in anytime; cafes and restaurants throughout',
    'easy',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'f1a7c18d-ec0c-586d-bf0a-19197887ecb9',
    '33af0601-73b1-54e9-87b3-0455b62e0048',
    'nomad-live-hostel-busan',
    'Nomad Live Hostel',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    35.1592, 129.1654,
    '11F, 88 Jwadong-ro, Haeundae-gu, Busan',
    '+82-51-740-0210',
    'https://live.nomadx.life/',
    2,
    '24-hour check-in',
    'This is hostel-meets-coworking-meets-coliving: modern, clean, and designed specifically for solo travelers and digital nomads. Female-only dorms and capsules, a fitness center, organized social events, and free breakfast mean you''ll naturally meet people. The Haeundae location puts you steps from the beach and nightlife.',
    true,
    'Solo female travelers, especially those staying longer, rave about Nomad Live for safety features, community events, and workspace quality. The female dorms and capsules are secure, and the co-living model fights loneliness. It''s premium-feeling at budget prices, and the location is excellent.',
    '["Female-only dorms and capsules", "coworking spaces with fast WiFi", "free breakfast", "fitness center", "community events", "beach location"]'::jsonb,
    '["Slightly higher price than basic hostels", "Popular, needs advance booking", "Can be social/busy"]'::jsonb,
    '"Nomad Live made it so easy to meet people AND have my own space. The breakfast and coworking setup are amazing for solo digital nomads." - Solo traveler, 2024',
    'https://www.google.com/maps/search/?api=1&query=Nomad%20Live%20Hostel&query_place_id=ChIJFQwhL7CNaDURRlzyLdJf_kw',
    'hostel',
    '32',
    '["nomadx.life", "hostelworld.com", "booking.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (South Korea)',
    88,
    4.4,
    412,
    '2026-02-10 06:38:06.869756+00',
    'any',
    'overnight',
    'Book via Hostelworld, Booking.com, or official website; discounts for 7+ nights',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '5c6bf1b1-e15b-5d46-b992-72ad862b3270',
    '33af0601-73b1-54e9-87b3-0455b62e0048',
    'haeundae-beach-busan',
    'Haeundae Beach',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    35.1617, 129.1568,
    '264 Haeundaehaebyeon-ro, Haeundae-gu, Busan',
    NULL,
    'https://www.busan.go.kr/eng/beaches/1325815',
    0,
    '24/7',
    'Busan''s most famous beach is 1.5km of golden sand where locals and tourists mix naturally. The water is warm in summer, the beach is clean and well-maintained, and the surrounding area pulses with seafood restaurants and beach bars. Solo travelers love the safe, energetic vibe and the endless people-watching.',
    true,
    'Solo female travelers choose this for its safe public energy, excellent nighttime lighting, and abundance of solo-dining restaurants nearby. It''s busy enough to never feel isolated, well-maintained, and easily accessible from Haeundae Station. The beach itself is free and always open.',
    '["1.5km sandy beach", "well-maintained and clean", "seafood restaurant row", "beach bars and cafes", "24/7 access"]'::jsonb,
    '["Very crowded in summer", "Parking can be expensive", "Water temperature varies by season"]'::jsonb,
    '"I walked this beach solo at night and felt so safe. The lights are bright, people are around, and the restaurant scene is great for solo dining." - Solo traveler, 2025',
    'https://www.google.com/maps/search/?api=1&query=Haeundae%20Beach&query_place_id=ChIJXwf-DlyNaDURmKxjwdWxY5k',
    'landmark',
    NULL,
    '["busan.go.kr", "tripadvisor.com", "visitbusan.net"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (South Korea)',
    84,
    4.2,
    1876,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '1-3 hours',
    'Walk-in anytime; free beach access',
    'easy',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'b2064151-4e18-5c35-9a91-158d226d2149',
    '136eee54-06d9-58bc-afcb-853653fb0f44',
    'yaboo-cafe-taipei',
    'Yaboo Cafe',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    25.033, 121.5449,
    'No. 26, Lane 41, Yongkang St, Da''an District, Taipei 106',
    NULL,
    'https://cafeandcowork.com/taipei/yaboo/',
    2,
    'Mon-Fri 12:00-00:00, Sat-Sun 11:00-00:00',
    'This legendary cat cafe is the place where digital nomads, artists, and solo travelers camp out for hours. Strong coffee, excellent pasta (rare in Taipei), resident cats to keep you company, and free WiFi mean you can work or simply vibe. The whole atmosphere says ''it''s totally normal to sit here alone for 4 hours.''',
    true,
    'Solo female travelers rave about Yaboo as their Taipei headquarters. The owner creates an inclusive space, the cats provide comfort, and the laptop-friendly setup means you''re surrounded by other independent workers. Perfect for introverts who want community without forced socializing.',
    '["Resident cafe cats", "excellent pasta", "fast free WiFi", "power outlets everywhere", "laptop-friendly culture", "cat-themed decor"]'::jsonb,
    '["Can get crowded evenings", "Small space", "Allergy warning: cats"]'::jsonb,
    '"Yaboo became my home base in Taipei. Great coffee, friendly cat, no judgment for camping here all day. Perfect solo travel cafe." - Digital nomad, 2024',
    'https://www.google.com/maps/search/?api=1&query=Yaboo%20Cafe&query_place_id=ChIJn2U13YOpQjQRPHbNYIzlhvs',
    'cafe',
    NULL,
    '["cafeandcowork.com", "tripadvisor.com", "yelp.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Taiwan)',
    80,
    4.0,
    267,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '1-4 hours',
    'Walk-in only; seating first-come, first-served',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '0d5efdc5-77be-5fb8-8e2f-1375b3b6e364',
    '136eee54-06d9-58bc-afcb-853653fb0f44',
    'halfway-coffee-taipei',
    'Halfway Coffee',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    25.0343, 121.5485,
    'No. 9, Alley 51, Lane 269, Sec 3, Luosifu Rd, Da''an District, Taipei 106',
    NULL,
    'https://halfway.love/',
    2,
    '08:00-18:00 Daily',
    'Halfway Coffee has one mission: make solo workers feel completely at home. The entire concept is built for freelancers and artists to camp without judgment. 88 Mbps WiFi, abundant outlets, discount on second drink for long stays, and an atmosphere that says ''stay as long as you need.'' It''s less about the coffee, more about the lifestyle.',
    true,
    'Solo female travelers seeking focus and productivity base themselves here. The owner explicitly designed this for solo work sessions, and the discount system rewards longer stays. Perfect for writers, designers, or anyone needing a second office while traveling.',
    '["Designed for solo workers", "88 Mbps fast WiFi", "abundant power outlets", "discount on second drink", "extended hours 8am-6pm"]'::jsonb,
    '["Limited food menu", "Small seating capacity", "Can get full"]'::jsonb,
    '"This cafe gets it. Fast WiFi, long work sessions normalized, and the owner genuinely cares about solo travelers. Best work cafe I''ve found." - Remote worker, 2025',
    'https://www.google.com/maps/search/?api=1&query=Halfway%20Coffee&query_place_id=ChIJn4IIMompQjQRvDRpCo4YLLw',
    'cafe',
    NULL,
    '["halfway.love", "cafeandcowork.com", "laptopfriendlycafe.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Taiwan)',
    84,
    4.2,
    189,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '2-4 hours',
    'Walk-in only; first-come, first-served seating',
    NULL,
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '785b46b8-45e5-52bd-a515-b6b83d6fb8fe',
    '136eee54-06d9-58bc-afcb-853653fb0f44',
    'taipei-101-observatory-taipei',
    'Taipei 101 Observatory',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    25.033, 121.5645,
    'No. 7, Sec 5, Xinyi Rd, Xinyi District, Taipei 110',
    '+886-2-8101-8898',
    'https://www.taipei-101.com.tw/en/observatory',
    2,
    '10:00-21:00',
    'Taiwan''s tallest building offers 360-degree views from the 89th and 101st floors-you see all of Taipei spreading below, mountains in the distance, and on clear days, the whole island seems visible. Book tickets online to skip lines and get discounts. The observation decks are well-designed and uncrowded if you time it right.',
    true,
    'Solo female travelers love this for safety, accessibility, and the meditative moment of standing alone looking out at an entire city. It''s a rite of passage for Taipei visitors, well-lit, and designed for individual contemplation.',
    '["360-degree city views", "89th and 101st floor decks", "online ticket discounts", "well-designed observation decks", "sunset viewing available"]'::jsonb,
    '["Can be crowded peak hours", "Entry fee moderate (NT$600)", "Can be hazy on bad air days"]'::jsonb,
    '"Standing alone at the top of Taipei 101 looking out at the whole city lights up at night-such a powerful, peaceful moment." - Solo traveler, 2025',
    'https://www.google.com/maps/search/?api=1&query=Taipei%20101%20Observatory&query_place_id=ChIJSTLZ6barQjQRMdkCqrP3CNU',
    'landmark',
    NULL,
    '["taipei-101.com.tw", "tripadvisor.com", "taipeitravelgeek.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Taiwan)',
    88,
    4.4,
    1456,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '1.5-2 hours',
    'Buy tickets online for discounts (NT$600 ~$19 USD); on-site tickets also available',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'ee064343-9aa5-52be-acc6-e3ca55a07910',
    '136eee54-06d9-58bc-afcb-853653fb0f44',
    'jiufen-old-street-taipei',
    'Jiufen Old Street',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    25.107, 121.8454,
    'Jiufen, Ruifang District, New Taipei City',
    NULL,
    'https://www.travel.taipei/en/attraction/details/642',
    1,
    '24/7 (shops vary, 10:00-21:00 typical)',
    'Step into a timeless mountain village where red lanterns glow above narrow alleyways packed with tea houses, snack vendors, and artisan shops. This is the Spirited Away aesthetic-nostalgic, atmospheric, genuinely Taiwanese. Solo visitors love wandering at their own pace, stopping for peanut ice cream rolls or taro balls, and soaking in the old-world energy.',
    true,
    'Solo female travelers cherish Jiufen for its magical, fairy-tale quality and total walkability. Early morning visits are quieter; afternoons are livelier. The snack-focused culture means you''re eating while walking, never sitting awkwardly alone. It feels like stepping out of modern Taiwan entirely.',
    '["Traditional mountain village atmosphere", "narrow alleyway shops", "famous snacks (peanut ice cream, taro balls)", "tea houses throughout", "Spirited Away-like aesthetic"]'::jsonb,
    '["Very crowded afternoons/weekends", "Steep hillside walking", "Touristy, less authentic evenings"]'::jsonb,
    '"Jiufen totally enchanted me. Wandering those alleyways alone, eating street snacks, drinking tea-felt like I''d stepped into another time." - Solo traveler, 2024',
    'https://www.google.com/maps/search/?api=1&query=Jiufen%20Old%20Street&query_place_id=ChIJcZT7-hdFXTQR0qekplqCFV8',
    'landmark',
    NULL,
    '["travel.taipei", "nickkembel.com", "feastographyblog.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Taiwan)',
    84,
    4.2,
    1687,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '2-3 hours',
    'Walk-in from Jiufen bus stop; no ticket needed',
    'moderate',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '962a9708-a88d-50d9-8cbe-543ff68d2240',
    '136eee54-06d9-58bc-afcb-853653fb0f44',
    'star-hostel-east-taipei',
    'Star Hostel East',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    25.0537, 121.5443,
    '3F, No. 5, Lane 147, Zhongxiao E. Rd., Sec 4, Da''an District, Taipei 106',
    '+886-2-2721-8225',
    'https://www.starhosteleast.com/home',
    1,
    '24-hour reception',
    'This design-forward hostel offers female-only floors, excellent breakfast with local Taiwanese classics, and a 1-minute walk to MRT Zhongxiao Dunhua Station (major hub). The vibe is clean, modern, and genuinely welcoming to solo travelers. Free breakfast alone is huge for budget travelers, and the staff speaks English fluently.',
    true,
    'Solo female travelers repeatedly choose Star Hostel East for its female-dedicated spaces, complimentary breakfast (huge money-saver), and excellent location in Da''an District. English-speaking staff mean zero navigation stress, and the breakfast features scallion pancakes and local flavors.',
    '["Female-only floor", "free breakfast with local dishes", "1-min walk to major MRT station", "modern design", "English-speaking staff"]'::jsonb,
    '["Can be noisy with group travelers", "Small rooms", "Popular, needs advance booking"]'::jsonb,
    '"Female-only floor made me feel safe, the breakfast saved me money, and the location near MRT was perfect for exploring. Great hostel for solo women." - Solo female traveler, 2025',
    'https://www.google.com/maps/search/?api=1&query=Star%20Hostel%20East&query_place_id=ChIJIclBPsWrQjQRYSTe3UH7fwg',
    'hostel',
    '32',
    '["starhosteleast.com", "hostelworld.com", "booking.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Taiwan)',
    86,
    4.3,
    528,
    '2026-02-10 06:38:06.869756+00',
    'any',
    'overnight',
    'Book via Hostelworld, Agoda, Booking.com, or direct; female-only floor available',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'bf2bd361-4392-504e-8b6f-89913cefd2fb',
    '136eee54-06d9-58bc-afcb-853653fb0f44',
    'meander-taipei-ximending',
    'Meander Taipei - Ximending',
    'hostel',
    'cdd1c842-cf5a-5cf0-96c4-26e9487c1607',
    25.0385, 121.5072,
    'No. 163, Chengdu Rd, Wanhua District, Taipei 108',
    NULL,
    'https://www.staymeander.com/meandertaipei/en/meander-taipei-2/',
    2,
    'Reception 08:00-23:00, Check-in 15:00-23:00',
    'This award-winning design hostel in Ximending is aesthetically stunning with 84 themed rooms and a rooftop vibe. Both dorms and private rooms available, plus female-only options. The location puts you in Taipei''s most vibrant neighborhood-shopping, street food, and nightlife right outside. It''s hostel-as-experience rather than just-a-bed.',
    true,
    'Solo female travelers choose Meander for its design aesthetic, female-friendly dorms, and Ximending''s lively, well-lit neighborhood. The hostel feels more upscale than typical budget options, and the community vibe is strong without being forced.',
    '["Award-winning design", "84 unique decorated rooms", "female-only dorm options", "prime Ximending location", "rooftop area"]'::jsonb,
    '["Higher price for hostel (but cheaper than hotels)", "Ximending can be touristy", "Check-in limited to 23:00"]'::jsonb,
    '"Meander is not your typical hostel-it''s actually beautiful. Female floor was clean and secure, location in Ximending is perfect for solo exploration." - Solo traveler, 2024',
    'https://www.google.com/maps/search/?api=1&query=Meander%20Taipei%20-%20Ximending&query_place_id=ChIJ78YPKQapQjQRfoWgW_w0hvs',
    'hostel',
    '28',
    '["staymeander.com", "hostelworld.com", "klook.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Taiwan)',
    84,
    4.2,
    391,
    '2026-02-10 06:38:06.869756+00',
    'any',
    'overnight',
    'Book via Hostelworld, Booking.com, Agoda, or Klook; female-only dorms available',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'b6098f16-8c79-5eeb-b7d3-cf4f7f68d708',
    '136eee54-06d9-58bc-afcb-853653fb0f44',
    'chiang-kai-shek-memorial-taipei',
    'Chiang Kai-shek Memorial Hall',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    25.0343, 121.5206,
    '1 Zhongshan S. Rd, Zhongshan District, Taipei 100',
    '+886-2-2343-1100',
    'https://www.cksmh.gov.tw/en/',
    0,
    '09:00-17:00 Daily (Changing of Guard 10:00, 14:00, 16:00)',
    'This architectural wonder honors Taiwan''s modern history with a massive white marble plaza, ceremonial hall, and changing-of-the-guard performances. The plaza is free to explore anytime, and the hall itself is free to enter. Solo travelers appreciate the peaceful energy, the solemn grandeur, and the large open space that never feels crowded despite being a major landmark.',
    true,
    'Solo female travelers value this for its free access, cultural significance, and the meditative quality of the white marble plaza. The changing-of-the-guard ceremony is perfectly watched alone, and the cultural education feels meaningful rather than touristy.',
    '["Free entry", "massive white marble plaza", "changing-of-the-guard ceremony", "cultural significance", "accessible architecture"]'::jsonb,
    '["Can be very hot/sunny in summer", "Limited shade on plaza", "Ceremony time-specific"]'::jsonb,
    '"The sheer scale and quietness of the plaza was moving. Watched the ceremony alone and felt the weight of Taiwanese history." - Solo traveler, 2025',
    'https://www.google.com/maps/search/?api=1&query=Chiang%20Kai-shek%20Memorial%20Hall&query_place_id=ChIJTamiuZ2pQjQRsmnfkkID6UM',
    'landmark',
    NULL,
    '["cksmh.gov.tw", "tripadvisor.com", "english.taipei.gov.tw"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Taiwan)',
    86,
    4.3,
    1834,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '1-2 hours',
    'Walk-in free; ceremony times at 10:00, 14:00, 16:00',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'f27caa68-30c1-5c7d-a9dd-f279108aa980',
    '136eee54-06d9-58bc-afcb-853653fb0f44',
    'workspot-taipei',
    'Workspot Coworking',
    'coworking',
    '09cc7275-a3ac-517e-b3fc-c257f4613f63',
    25.0447, 121.5387,
    'Daan District, Taipei (2-minute walk from Zhongxiao Dunhua MRT)',
    NULL,
    'https://www.workspot.asia/',
    2,
    '24/7',
    'Open 24/7 with fast internet, complimentary coffee, and a genuinely social atmosphere, Workspot is perfect for solo travelers who don''t want to hide. The community events and networking culture mean you''ll naturally meet other independent workers. It''s less ''quiet office,'' more ''creative community hub.''',
    true,
    'Solo digital nomads and remote workers choose Workspot for the 24/7 access and built-in community. The free coffee, fast WiFi, and social events mean you''re never working in isolation. Perfect for those traveling longer who want both productivity AND social connection.',
    '["24/7 access", "fast internet", "free coffee", "community events", "co-working culture", "very social atmosphere"]'::jsonb,
    '["Busier at peak times (can be noisy)", "Higher price than cafes", "Membership-based for best rates"]'::jsonb,
    '"Workspot felt like having a professional community while traveling solo. The events helped me make friends, and the vibe was super welcoming." - Digital nomad, 2025',
    'https://www.google.com/maps/search/?api=1&query=Workspot%20Coworking&query_place_id=ChIJmccOghOrQjQRpRCdqpKM43Y',
    'coworking',
    NULL,
    '["workspot.asia", "coworkingspaces.me", "cafeandcowork.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Taiwan)',
    82,
    4.1,
    156,
    '2026-02-10 06:38:06.869756+00',
    'any',
    'flexible',
    'Day pass available; membership options for longer stays',
    NULL,
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '081c192c-beeb-5aaa-943e-3fc4e9af6bdc',
    '136eee54-06d9-58bc-afcb-853653fb0f44',
    'ningxia-night-market-taipei',
    'Ningxia Night Market',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    25.0672, 121.5153,
    'Ningxia Rd, Datong District, Taipei',
    NULL,
    'https://www.travel.taipei/en/attraction/details/1689',
    1,
    '17:00-02:00 (vendors vary)',
    'This is Taipei''s most local night market-fewer tourists, more neighborhood energy. The street gets closed to traffic in evenings, and it fills with food stalls serving everything from oyster omelets to grilled squid. Solo travelers love the loose, wandering-and-eating culture and the genuine local energy (not polished for tourists).',
    true,
    'Solo female travelers choose Ningxia for its authentic vibe and solo-dining culture. Eating while walking alone is totally normal here, and the food stalls are designed for individual ordering. It''s lively without being overwhelming, and feels genuinely like local Taipei.',
    '["Authentic local market", "multiple food stalls", "pedestrian street evenings", "genuine neighborhood vibe", "affordable eating"]'::jsonb,
    '["Only open evenings", "Can get crowded after 8pm", "Humid during peak seasons"]'::jsonb,
    '"Ningxia felt like real Taipei, not tourist-land. Wandering alone, trying stalls, no pressure. Perfect night out by myself." - Solo traveler, 2025',
    'https://www.google.com/maps/search/?api=1&query=Ningxia%20Night%20Market&query_place_id=ChIJxUXPVmupQjQRtBB6oj-S5qI',
    'landmark',
    NULL,
    '["travel.taipei", "taiwanobsessed.com", "tripadvisor.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Taiwan)',
    84,
    4.2,
    789,
    '2026-02-10 06:38:06.869756+00',
    'evening',
    '1-2 hours',
    'Walk-in anytime evening hours; vendors accept cash and card',
    'easy',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'b5221145-9383-5469-b9b7-d84dda18f631',
    'be06a2a8-8ca8-58fb-9471-a78f187dae73',
    'chihkan-tower-tainan',
    'Chihkan Tower',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    22.994, 120.2042,
    'No. 212, Sec 2, Minzu Rd, West Central District, Tainan 700',
    NULL,
    'https://historic.tainan.gov.tw/index.php?option=module&lang=en&task=pageinfo&id=189&index=5',
    1,
    '08:30-21:30 Daily',
    'Taiwan''s oldest remaining foreign fort, originally built by the Dutch in 1653, Chihkan Tower stands as a testament to colonial history. The twin towers frame the sky dramatically, and the surrounding grounds invite wandering. The entry fee is tiny (NT$70), and solo travelers love climbing the tower for views and exploring the historical site at their own pace.',
    true,
    'Solo female travelers appreciate Chihkan Tower for its historical depth, walkable grounds, and manageable size. It''s not overwhelming, you can spend as long as you want, and the colonial history offers real learning without tourist crowds.',
    '["Twin Dutch towers", "colonial history (1653)", "scenic sky framing", "affordable entry (NT$70)", "historical significance"]'::jsonb,
    '["Steep interior stairs", "Limited shade on grounds", "Can be hot midday"]'::jsonb,
    '"Walking through 400 years of Taiwan''s history alone, climbing the towers-felt connected to something really important and ancient." - Solo traveler, 2024',
    'https://www.google.com/maps/search/?api=1&query=Chihkan%20Tower&query_place_id=ChIJbYl7d2F2bjQRnFdvyMBuZfI',
    'landmark',
    NULL,
    '["historic.tainan.gov.tw", "tripadvisor.com", "twtainan.net"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Taiwan)',
    82,
    4.1,
    612,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '1.5-2 hours',
    'Walk-in; tickets NT$70 (~$2.30 USD) at entrance',
    'moderate',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'ccf9e40f-4623-5848-849a-473c75dc4415',
    'be06a2a8-8ca8-58fb-9471-a78f187dae73',
    'confucius-temple-tainan',
    'Confucius Temple',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    22.9903, 120.2042,
    'No. 2, Nanmen Rd, West Central District, Tainan 700',
    NULL,
    'https://www.twtainan.net/en/attractions/detail/4407',
    1,
    '08:30-17:30 Daily',
    'Taiwan''s oldest and most important Confucius Temple (built 1666) sits in serene gardens filled with ancient trees and peaceful courtyards. The outer portions are free; the inner temple costs NT$40. Solo travelers find this intensely peaceful-you''re learning cultural history while sitting quietly in gardens. It''s spiritual without being religious.',
    true,
    'Solo female travelers love this temple for its meditative energy and cultural significance. It''s a genuine 400-year-old site, not commercialized, and the garden layout encourages slow wandering. Perfect for solo reflection and cultural learning.',
    '["Taiwan''s oldest Confucius Temple (1666)", "peaceful garden courtyards", "ancient trees", "cultural significance", "affordable (free outer, NT$40 inner)"]'::jsonb,
    '["Limited English signage", "Best early morning for solitude", "Some parts may close"]'::jsonb,
    '"Sitting alone in the temple gardens, surrounded by 400 years of history, I felt so grounded and peaceful. The whole experience was meditative." - Solo traveler, 2025',
    'https://www.google.com/maps/search/?api=1&query=Confucius%20Temple&query_place_id=ChIJFbzVrGJ2bjQRkZC9jslaIgs',
    'landmark',
    NULL,
    '["twtainan.net", "tripadvisor.com", "eng.taiwan.net.tw"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Taiwan)',
    84,
    4.2,
    478,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '1-2 hours',
    'Walk-in; outer areas free, inner temple NT$40',
    'easy',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '8d5cf327-c876-5cc1-acd7-85411665b4c6',
    'be06a2a8-8ca8-58fb-9471-a78f187dae73',
    'anping-old-street-tainan',
    'Anping Old Street',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    22.9913, 120.1656,
    'Yanping St, Anping District, Tainan 708',
    NULL,
    'https://www.twtainan.net/en/attractions/detail/4489',
    1,
    '24/7 (shops 10:00-21:00 typical)',
    'Taiwan''s oldest street is a narrow pedestrian alley packed with snack vendors and souvenir shops. This is pure street food heaven-oyster omelets, peanut ice cream rolls, coffin bread, grilled oysters. Solo travelers love eating while walking, stopping in tea houses, and exploring at random. The Anping Treehouse and Anping Old Fort are nearby add-ons.',
    true,
    'Solo female travelers choose Anping for its straightforward, walk-and-eat culture where dining alone is completely normal. The street''s layout (narrow, pedestrian, busy) feels safe and engaging. You''re never sitting alone; you''re part of the street energy.',
    '["Famous snacks (oyster omelets, peanut rolls)", "narrow charming alley", "famous shop: Lin Yong Tai", "nearby Anping Treehouse", "24/7 access"]'::jsonb,
    '["Very crowded afternoons", "Limited seating (walk-and-eat culture)", "Touristy"]'::jsonb,
    '"Anping Old Street was perfect for solo eating and wandering. The snacks are amazing, the alley is charming, and I never felt awkward eating alone." - Solo traveler, 2024',
    'https://www.google.com/maps/search/?api=1&query=Anping%20Old%20Street&query_place_id=ChIJ_____wN2bjQRIOio8uGV_Og',
    'landmark',
    NULL,
    '["twtainan.net", "tripadvisor.com", "nickkembel.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Taiwan)',
    82,
    4.1,
    1203,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '1.5-2 hours',
    'Walk-in anytime; vendors throughout day and evening',
    'easy',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'a254806f-36a5-5293-8a8e-f542eaaee44e',
    'be06a2a8-8ca8-58fb-9471-a78f187dae73',
    'lin-yong-tai-fruit-store-tainan',
    'Lin Yong Tai Dried Fruit Store',
    'shop',
    'd9505167-9030-5e19-9c01-a04637761464',
    22.9916, 120.1659,
    'No. 84, Yanping St, Anping District, Tainan 708',
    NULL,
    'https://www.twtainan.net/en/Shop/Consume/2429/Lily-Fruit-Store',
    2,
    '11:30-19:00 (Closed Tue-Wed)',
    'This century-old shop on Anping Old Street is THE place for dried fruits-a Tainan institution. It''s tiny but beloved, packed with every type of preserved fruit you can imagine. Solo travelers pop in, browse, and leave with a bag of treats. The shop itself is a piece of history, and supporting it means supporting Tainan''s heritage.',
    true,
    'Solo female travelers appreciate this shop for its historic significance, unique products, and the quick, independent browsing experience. It''s a genuine local institution, not a tourist trap, and makes perfect solo travel gifts.',
    '["Century-old shop", "famous Anping location", "unique dried fruits", "cultural heritage", "excellent gifts"]'::jsonb,
    '["Small shop, can be crowded", "Limited English", "Closed Tue-Wed"]'::jsonb,
    '"Finding this shop felt like discovering a real piece of Tainan history. The dried fruits were amazing, and I felt good supporting something so authentic." - Solo traveler, 2025',
    'https://www.google.com/maps/search/?api=1&query=Lin%20Yong%20Tai%20Dried%20Fruit%20Store&query_place_id=ChIJY4zffFl3bjQReQRm5VXH-A8',
    'shop',
    NULL,
    '["twtainan.net", "tripadvisor.com", "nickkembel.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Taiwan)',
    80,
    4.0,
    187,
    '2026-02-10 06:38:06.869756+00',
    'afternoon',
    '15-30 minutes',
    'Walk-in; cash preferred',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '04ffcf8d-e0db-54a2-9217-8a4c490c03ac',
    'be06a2a8-8ca8-58fb-9471-a78f187dae73',
    'luermen-mazu-temple-tainan',
    'Luermen Tianhou Temple',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    22.9743, 120.1485,
    'No. 136, Mazugong 1st St, Annan District, Tainan 709',
    '+886-6-284-1386',
    'https://www.twtainan.net/en/attractions/detail/4504',
    0,
    '06:00-21:00 Daily',
    'The world''s largest temple dedicated to Mazu (goddess of fishermen and the sea), this massive, ornate structure is stunning even from outside. Solo travelers find the temple''s scale awe-inspiring and the energy spiritual without being overwhelming. Free entry means you can explore courtyards, see intricate carvings, and understand Taiwanese folk religion.',
    true,
    'Solo female travelers appreciate this temple for its free entry, spiritual energy, and unique focus on a female deity. It''s a genuine active temple (not a museum), and you witness real worship happening. The scale is impressive without being touristy.',
    '["World''s largest Mazu temple", "ornate architecture", "active worship space", "free entry", "folk religious significance"]'::jsonb,
    '["Very large, can be disorienting", "No English signage", "Can have many worshippers"]'::jsonb,
    '"This temple dedicated to a goddess felt powerful to explore alone. The sheer artistry and size was breathtaking, and it felt like a real place, not a tourist site." - Solo traveler, 2024',
    'https://www.google.com/maps/search/?api=1&query=Luermen%20Tianhou%20Temple&query_place_id=ChIJQwtjhvfYbTQRL3Gv_yRSotk',
    'landmark',
    NULL,
    '["twtainan.net", "tripadvisor.com", "swcoast-nsa.gov.tw"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Taiwan)',
    84,
    4.2,
    234,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '1-1.5 hours',
    'Walk-in free; respectful dress required',
    'easy',
    'Editor pick',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '70de6c4c-0e09-5c78-82a0-9a5ed19c544b',
    'be06a2a8-8ca8-58fb-9471-a78f187dae73',
    'chimei-museum-tainan',
    'Chimei Museum',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    22.8945, 120.2203,
    'No. 66, Sec 2, Wenhua Rd, Rende District, Tainan',
    NULL,
    'https://www.chimeimuseum.org/en',
    1,
    '09:30-17:30 (Closed Wednesdays)',
    'Taiwan''s largest private museum looks like a white palace and houses an eclectic, world-class collection: Western art, ancient weapons, musical instruments, natural history. The surrounding grounds are free and beautiful. Solo travelers love the mix of art, the thoughtful curation, and the peaceful grounds-you can spend hours or just wander briefly.',
    true,
    'Solo female travelers choose Chimei for its museum quality, palace-like aesthetics, and flex visiting options. The free grounds alone are worth a visit, and the museum''s diverse collections appeal to various interests. The location in Rende District feels less touristy than central Tainan.',
    '["White palace architecture", "world-class art collection", "diverse exhibits (weapons, instruments, art, natural history)", "free surrounding grounds", "peaceful setting"]'::jsonb,
    '["Entry fee NT$200", "Outside central Tainan", "Closed Wednesdays"]'::jsonb,
    '"Chimei Museum felt like discovering a secret palace. The collections are sophisticated, the grounds are peaceful, and the whole experience was incredibly enriching." - Solo traveler, 2025',
    'https://www.google.com/maps/search/?api=1&query=Chimei%20Museum&query_place_id=ChIJq6qqqnp0bjQRpvTHZeYTjKg',
    'landmark',
    NULL,
    '["chimeimuseum.org", "tripadvisor.com", "taiwanobsessed.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Taiwan)',
    88,
    4.4,
    823,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '2-3 hours',
    'Walk-in; NT$200 entry (~$6.50 USD); free grounds',
    'easy',
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'd535221a-791e-53ce-923e-ab22396b8415',
    'be06a2a8-8ca8-58fb-9471-a78f187dae73',
    'anping-tree-house-tainan',
    'Anping Treehouse',
    'landmark',
    'a45177b8-39f5-545c-a18f-34c552440071',
    22.9909, 120.1667,
    'Anping Old Street area, Anping District, Tainan',
    NULL,
    'https://www.twtainan.net/en/attractions/detail/4486',
    1,
    '09:00-18:00 Daily',
    'A centuries-old banyan tree has completely overtaken an old warehouse, creating a surreal, nature-overtaking-civilization aesthetic that''s hauntingly beautiful. The ''treehouse'' is less playhouse, more art installation. Solo travelers find this mysterious and photogenic-it''s quiet, evocative, and perfect for contemplative exploration.',
    true,
    'Solo female travelers appreciate the Anping Treehouse for its mystical, solitude-friendly atmosphere. It''s photogenic without being Instagram-trap commercialized, and the quiet energy invites solo wandering and reflection. Located near Anping Old Street for easy combo visiting.',
    '["Ancient banyan tree", "nature-reclaimed warehouse", "surreal aesthetics", "photography opportunities", "atmospheric and mysterious"]'::jsonb,
    '["Limited interior space", "Fragile, respect the site", "Best photographed at golden hour"]'::jsonb,
    '"The Anping Treehouse had this eerie, magical quality. Standing alone surrounded by centuries-old tree roots was dreamlike and unforgettable." - Solo traveler, 2025',
    'https://www.google.com/maps/search/?api=1&query=Anping%20Treehouse&query_place_id=ChIJlynOByF3bjQR_IzNSlgH-Ss',
    'landmark',
    NULL,
    '["twtainan.net", "tripadvisor.com", "borderadventure.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Taiwan)',
    80,
    4.0,
    567,
    '2026-02-10 06:38:06.869756+00',
    NULL,
    '30-45 minutes',
    'Walk-in during opening hours',
    'easy',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    '06e7b967-2e46-5233-b9a8-7134ad85a10f',
    'be06a2a8-8ca8-58fb-9471-a78f187dae73',
    'tainan-old-street-walking-tour',
    'Historic Tainan Old City Walking Tour',
    'activity',
    '55484b01-2a4d-5786-9447-d52d055ec9bf',
    22.991, 120.2013,
    'Central Tainan (Chihkan Tower, Confucius Temple, various historic sites)',
    NULL,
    'https://www.twtainan.net/en/attractions',
    0,
    '24/7 (self-guided)',
    'Rather than a formal tour, Tainan invites self-guided exploration of its incredibly walkable historic districts. Start at Chihkan Tower or Confucius Temple, then wander narrow lanes past old temples, colonial buildings, and hidden tea houses. The city''s 400-year history unfolds naturally as you walk. Solo travelers appreciate the flexibility and discovery.',
    true,
    'Solo female travelers love self-guided walking tours because they control the pace and can linger wherever interests them. Tainan''s old city is genuinely walkable, safe, and rich with history. No group tour needed; just you, the streets, and discovery.',
    '["400 years of colonial/Chinese history", "walkable, safe streets", "hidden temples and tea houses", "self-paced flexibility", "genuinely local neighborhoods"]'::jsonb,
    '["Limited English signage", "Heat and humidity mid-day", "Some areas less developed"]'::jsonb,
    '"Walking Tainan''s old city alone, discovering temples and narrow lanes-this felt like real travel, not following a guide. The history is everywhere." - Solo traveler, 2024',
    'https://www.google.com/maps/search/?api=1&query=Historic%20Tainan%20Old%20City%20Walking%20Tour&query_place_id=ChIJHyZ8z2t3bjQRJfvul9zxcOs',
    'activity',
    NULL,
    '["twtainan.net", "tripadvisor.com", "nickkembel.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Taiwan)',
    84,
    4.2,
    0,
    '2026-02-10 06:38:06.869756+00',
    'morning',
    '2-4 hours',
    'Self-guided; download map from twtainan.net or use Google Maps',
    'easy',
    NULL,
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO places (id, city_id, slug, name, place_type, primary_category_id,
    lat, lng, address, phone, website, price_level, hours_text, description,
    is_active,
    why_selected, highlights, considerations, solo_female_reviews,
    google_maps_url, original_type, price_per_night, sources_checked,
    curation_notes, curation_score, google_rating, google_review_count,
    discovered_at, best_time_of_day, estimated_duration, booking_info,
    physical_level, badge_label, is_featured, created_at, updated_at)
VALUES (
    'aa1f3167-a54d-50e1-aa53-95d61d39c02f',
    'be06a2a8-8ca8-58fb-9471-a78f187dae73',
    'shallun-tea-house-tainan',
    'Tainan Tea Culture Experience',
    'cafe',
    '9c1684f7-e92b-5f0a-b9df-6d79960f1540',
    22.993, 120.203,
    'Various traditional tea houses throughout central Tainan',
    NULL,
    'https://www.twtainan.net/en/attractions',
    1,
    '10:00-18:00 typical (varies by shop)',
    'Tainan''s historic tea houses are places where time slows down. Sit alone in a traditional room, order oolong or aged puerh, and watch the careful ritual of tea preparation. Solo travelers find this meditative and culturally enriching-you''re not just drinking tea, you''re participating in 400 years of tradition.',
    true,
    'Solo female travelers choose tea houses specifically because they''re designed for individuals or pairs. The ritual pace and intentional atmosphere make solo moments feel special rather than lonely. Each tea house tells a story of Tainan''s history.',
    '["Traditional tea ceremony", "centuries-old tradition", "solo-friendly atmosphere", "meditative experience", "cultural immersion"]'::jsonb,
    '["Limited English", "Can be pricey for full ceremony", "Best reserved ahead"]'::jsonb,
    '"Sitting alone in a traditional tea house, watching the master prepare tea-this felt like the most peaceful moment of my entire trip." - Solo traveler, 2025',
    'https://www.google.com/maps/search/?api=1&query=Tainan%20Tea%20Culture%20Experience&query_place_id=ChIJp_eQXWN2bjQRuBgUKDWwFhg',
    'cafe',
    NULL,
    '["twtainan.net", "tripadvisor.com", "taiwanobsessed.com"]'::jsonb,
    'AI-researched (unverified) - AI-researched for Sola (Taiwan)',
    82,
    4.1,
    289,
    '2026-02-10 06:38:06.869756+00',
    'afternoon',
    '1-2 hours',
    'Walk-in or call ahead for reservation; traditional tea ceremony available',
    NULL,
    'Solo favorite',
    false,
    now(), now()
)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- 5. INSERT PLACE_TAGS (corrected tag_ids, source='model')
-- =============================================================
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('986657f3-dde8-50e6-8823-95fb19f2c5c8', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a97714cd-d27b-5143-95cd-9618f76eafbb', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ab85bf63-1bec-5fa2-8436-660d26483534', '21659d6a-25c3-5a6b-8d51-0ec9e3b1b1a2', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ab85bf63-1bec-5fa2-8436-660d26483534', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('35b42232-1bf5-5f0b-897d-2d48d7448e8a', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0918ab49-31ea-58f2-8147-f36757b47c79', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0918ab49-31ea-58f2-8147-f36757b47c79', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('4eb21168-00db-5e30-b6ca-99e17d06ee44', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2e27dd43-025c-5c49-a842-9bc615f3857c', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d9cedf3d-a0d3-5bdc-9c80-47402e2f34c3', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d9cedf3d-a0d3-5bdc-9c80-47402e2f34c3', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7771d827-3bfe-5b1a-96b3-9a7a17b40da8', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('da1c2717-78f5-5a71-af22-1615b0fc6eba', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('da1c2717-78f5-5a71-af22-1615b0fc6eba', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e67cb0ce-de2b-53d1-a899-4d3252fb1afd', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e67cb0ce-de2b-53d1-a899-4d3252fb1afd', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ff14f2b4-0b9e-57a8-958a-96005b730303', '6c560cd8-2c28-5f27-b734-fd5ef25f7973', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a0193a80-f9af-5b52-9c3d-c688dc9a47b0', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2b7d5e6e-8d94-5cc3-a54b-673736c989e7', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2b7d5e6e-8d94-5cc3-a54b-673736c989e7', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2b7d5e6e-8d94-5cc3-a54b-673736c989e7', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('06e4c2d2-7111-52a3-8676-487f9c1a660f', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('06e4c2d2-7111-52a3-8676-487f9c1a660f', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('57209d6f-d7d3-59fd-8d57-98876c610c2b', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('57209d6f-d7d3-59fd-8d57-98876c610c2b', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('77b862e8-8bf0-5ae2-a652-a43bebedcf10', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('77b862e8-8bf0-5ae2-a652-a43bebedcf10', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3b52a947-3d43-54c6-a116-a40d90da9c0c', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1a989cd1-837d-54fc-bc37-7438756e57c1', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1a989cd1-837d-54fc-bc37-7438756e57c1', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1a989cd1-837d-54fc-bc37-7438756e57c1', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('991f2043-555b-5cbb-b96a-7b6356206e63', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03afddd0-fb84-54e3-bb6c-d4ef068e426a', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('03afddd0-fb84-54e3-bb6c-d4ef068e426a', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b5b99a6d-4fd7-5004-bd9a-ff4dda16afc3', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9fc0bfef-8723-5183-8646-c5f14209a872', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9fc0bfef-8723-5183-8646-c5f14209a872', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e355b4fe-035e-5acd-9e50-74cb31c52f2d', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e355b4fe-035e-5acd-9e50-74cb31c52f2d', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7d6c600c-15af-589f-852e-bd161f01a923', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e0871651-c134-5bb3-b050-14c2738322e4', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e0871651-c134-5bb3-b050-14c2738322e4', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fe945561-9307-5ee8-b881-ad8743d61605', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fe945561-9307-5ee8-b881-ad8743d61605', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fe945561-9307-5ee8-b881-ad8743d61605', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('fe945561-9307-5ee8-b881-ad8743d61605', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('bb97af1d-5e56-5892-a82a-b8b10cd5254e', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('bb97af1d-5e56-5892-a82a-b8b10cd5254e', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('bb97af1d-5e56-5892-a82a-b8b10cd5254e', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9564e22a-b9ef-5796-9166-bf3bf4041796', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9564e22a-b9ef-5796-9166-bf3bf4041796', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9564e22a-b9ef-5796-9166-bf3bf4041796', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5bbad185-8f1d-537d-8b20-fc7337218732', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6eadf722-c424-5a1d-a519-8b900e5a5a85', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0928aa4-d2fa-5360-a4af-8e5e281ca355', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0928aa4-d2fa-5360-a4af-8e5e281ca355', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b0928aa4-d2fa-5360-a4af-8e5e281ca355', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d273ad8c-5aae-5207-a269-8a02febc51ff', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d273ad8c-5aae-5207-a269-8a02febc51ff', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d273ad8c-5aae-5207-a269-8a02febc51ff', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2d072f4e-4fe0-565a-a361-480f179eecc4', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2d072f4e-4fe0-565a-a361-480f179eecc4', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2d072f4e-4fe0-565a-a361-480f179eecc4', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2d072f4e-4fe0-565a-a361-480f179eecc4', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ba9c51e8-8977-5d1f-91c6-098dc5584c09', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9f9abe28-072e-50a6-b4cd-5cd8cec69de3', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9f9abe28-072e-50a6-b4cd-5cd8cec69de3', '82dfe1ff-f3d2-50f2-b507-9daa0f479602', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9f9abe28-072e-50a6-b4cd-5cd8cec69de3', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9f9abe28-072e-50a6-b4cd-5cd8cec69de3', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('69af5df8-adf9-5977-8959-f5d44fcb422a', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c827ff52-936d-5b43-bcee-e0f9dc2e1f69', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('aa9304a6-1151-56b3-940e-0005b54b4f89', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a4ec344b-6bd0-53e5-bbdb-8dc112e4e0ef', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e11aa32c-2761-57a5-836d-a2c7d0aae27a', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e11aa32c-2761-57a5-836d-a2c7d0aae27a', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('209d3a9e-2307-54b1-b85d-1c6899716509', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('209d3a9e-2307-54b1-b85d-1c6899716509', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('209d3a9e-2307-54b1-b85d-1c6899716509', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('299ef11b-cce3-5a5e-8420-228843258efc', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('299ef11b-cce3-5a5e-8420-228843258efc', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('299ef11b-cce3-5a5e-8420-228843258efc', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5cbcc00c-3424-50db-bfb0-fd414a6db016', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5cbcc00c-3424-50db-bfb0-fd414a6db016', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5cbcc00c-3424-50db-bfb0-fd414a6db016', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('dfcaddb7-54aa-5567-bd94-ddcb16492502', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d477a54d-6dce-58d6-8a58-dedf1f145065', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d477a54d-6dce-58d6-8a58-dedf1f145065', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('adfea4d6-cb9a-539e-979a-775e06f659f9', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('adfea4d6-cb9a-539e-979a-775e06f659f9', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('adfea4d6-cb9a-539e-979a-775e06f659f9', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('adfea4d6-cb9a-539e-979a-775e06f659f9', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('802a43b5-738b-5c23-9a01-c16968705a7a', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c88746ec-0b2e-5b68-ad4e-8f9fbc841fd7', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c88746ec-0b2e-5b68-ad4e-8f9fbc841fd7', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('c88746ec-0b2e-5b68-ad4e-8f9fbc841fd7', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('aabc970b-27a7-5268-a835-f1dbab9befc5', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('aabc970b-27a7-5268-a835-f1dbab9befc5', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('aabc970b-27a7-5268-a835-f1dbab9befc5', '6c560cd8-2c28-5f27-b734-fd5ef25f7973', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('8ccf64a2-8ec6-5010-9bcb-82d2103182fe', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3316e5da-c13d-57c6-976b-d94bcbb18d9b', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3316e5da-c13d-57c6-976b-d94bcbb18d9b', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3316e5da-c13d-57c6-976b-d94bcbb18d9b', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('3316e5da-c13d-57c6-976b-d94bcbb18d9b', '82dfe1ff-f3d2-50f2-b507-9daa0f479602', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6ad50c57-d8f2-5cda-a378-c6bcf84c35a4', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5ac118cd-4abf-5870-8a1e-10cf0f38a676', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5ac118cd-4abf-5870-8a1e-10cf0f38a676', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5ac118cd-4abf-5870-8a1e-10cf0f38a676', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('31443ce8-e00d-5de0-ada8-6cae93ad408f', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('31443ce8-e00d-5de0-ada8-6cae93ad408f', '77e2d9d1-20b1-5dba-ac13-f5bfc824c0ca', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1d638c23-97d1-51b6-82e5-0a7c9d4ae8cb', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1d638c23-97d1-51b6-82e5-0a7c9d4ae8cb', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f171da2a-ac44-5611-82d8-ddc20259b4a0', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f171da2a-ac44-5611-82d8-ddc20259b4a0', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f171da2a-ac44-5611-82d8-ddc20259b4a0', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a3da9efb-1cff-5ce7-9c92-983fb8e1bbae', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0c220b8e-74bb-5563-b054-7ea3191de080', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0c220b8e-74bb-5563-b054-7ea3191de080', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0c220b8e-74bb-5563-b054-7ea3191de080', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('e20eeba1-f6a6-5311-9f29-3ab137e3f1d2', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('09de0ff5-5a3a-5aa6-88c6-9dbc052885d1', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ed829c4a-8424-5b6c-b639-5a65313fffd3', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ed829c4a-8424-5b6c-b639-5a65313fffd3', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0383bff0-c167-53de-b33c-82688139d2d7', '82dfe1ff-f3d2-50f2-b507-9daa0f479602', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0383bff0-c167-53de-b33c-82688139d2d7', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0383bff0-c167-53de-b33c-82688139d2d7', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6249fd74-4c2b-5986-b44c-1b149b75307d', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('6249fd74-4c2b-5986-b44c-1b149b75307d', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b1ac6206-0fbc-5692-bb14-41c1a5cd25a3', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b1ac6206-0fbc-5692-bb14-41c1a5cd25a3', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b1ac6206-0fbc-5692-bb14-41c1a5cd25a3', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b1ac6206-0fbc-5692-bb14-41c1a5cd25a3', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d462a867-eab9-5230-9800-b7fa45d02d55', '82dfe1ff-f3d2-50f2-b507-9daa0f479602', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d462a867-eab9-5230-9800-b7fa45d02d55', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d462a867-eab9-5230-9800-b7fa45d02d55', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5cb7f57f-cc85-5398-a22e-c31064af0206', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2098c131-606a-5771-943e-c0934d27cd32', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('2098c131-606a-5771-943e-c0934d27cd32', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1616af24-0c78-548b-8504-6c216f897d0b', '82dfe1ff-f3d2-50f2-b507-9daa0f479602', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('1616af24-0c78-548b-8504-6c216f897d0b', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a6d8fafe-53d9-5099-b443-9a6f254b41c6', '82dfe1ff-f3d2-50f2-b507-9daa0f479602', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a6d8fafe-53d9-5099-b443-9a6f254b41c6', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a6d8fafe-53d9-5099-b443-9a6f254b41c6', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('54aa882a-c669-5244-b451-2c494e499757', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('54aa882a-c669-5244-b451-2c494e499757', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9e3b293f-6ad7-5517-af9b-23d1c1d2908e', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9e3b293f-6ad7-5517-af9b-23d1c1d2908e', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('9e3b293f-6ad7-5517-af9b-23d1c1d2908e', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('de0b3526-ca63-51e9-80b8-fa75cddad4e0', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('de0b3526-ca63-51e9-80b8-fa75cddad4e0', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('de0b3526-ca63-51e9-80b8-fa75cddad4e0', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5af787cc-1995-59bc-b402-042e9d1ab574', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5af787cc-1995-59bc-b402-042e9d1ab574', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7506ca13-8cec-5912-90a9-ada4a95a58bd', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('7506ca13-8cec-5912-90a9-ada4a95a58bd', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('88def311-cd67-54d2-8935-bc80ea2d8d4f', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('debbbbd7-819c-5c7c-a74e-49de98349022', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('debbbbd7-819c-5c7c-a74e-49de98349022', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('05c91e34-3228-5181-a674-5c6a8906988f', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('05c91e34-3228-5181-a674-5c6a8906988f', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('05c91e34-3228-5181-a674-5c6a8906988f', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('05c91e34-3228-5181-a674-5c6a8906988f', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d5cfbbad-4caf-5dc0-a2e6-9b61a3d14dcb', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d5cfbbad-4caf-5dc0-a2e6-9b61a3d14dcb', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d5cfbbad-4caf-5dc0-a2e6-9b61a3d14dcb', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d5cfbbad-4caf-5dc0-a2e6-9b61a3d14dcb', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d61bee1d-3eb9-5053-9270-3190f4be3ad2', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b60e079e-0045-52f7-9d35-8b5466659d31', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b60e079e-0045-52f7-9d35-8b5466659d31', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a9364f05-6e89-57a5-a74b-ee30fea4d56a', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a9364f05-6e89-57a5-a74b-ee30fea4d56a', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a9364f05-6e89-57a5-a74b-ee30fea4d56a', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d3d8d2aa-3157-5a0a-9730-624a8f3beefd', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d3d8d2aa-3157-5a0a-9730-624a8f3beefd', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('70fac894-5400-5197-ae60-6a7a304770b6', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('70fac894-5400-5197-ae60-6a7a304770b6', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('93907b51-6bb5-5df6-86e1-ca4b387052f3', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5401a431-39a9-5f60-b639-ceb7dadad605', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5401a431-39a9-5f60-b639-ceb7dadad605', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5401a431-39a9-5f60-b639-ceb7dadad605', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5c6bf1b1-e15b-5d46-b992-72ad862b3270', '1bf8f727-a6c7-5bd4-a5d5-1b10e6bcf4bc', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5c6bf1b1-e15b-5d46-b992-72ad862b3270', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5c6bf1b1-e15b-5d46-b992-72ad862b3270', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('5c6bf1b1-e15b-5d46-b992-72ad862b3270', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b2064151-4e18-5c35-9a91-158d226d2149', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b2064151-4e18-5c35-9a91-158d226d2149', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b2064151-4e18-5c35-9a91-158d226d2149', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b2064151-4e18-5c35-9a91-158d226d2149', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0d5efdc5-77be-5fb8-8e2f-1375b3b6e364', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('0d5efdc5-77be-5fb8-8e2f-1375b3b6e364', '5919ca3a-62a4-5a78-b1c0-ed451703544f', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('785b46b8-45e5-52bd-a515-b6b83d6fb8fe', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ee064343-9aa5-52be-acc6-e3ca55a07910', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ee064343-9aa5-52be-acc6-e3ca55a07910', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ee064343-9aa5-52be-acc6-e3ca55a07910', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('bf2bd361-4392-504e-8b6f-89913cefd2fb', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('bf2bd361-4392-504e-8b6f-89913cefd2fb', '84e0692a-52b3-5a38-9c5f-5f4f8014184a', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('bf2bd361-4392-504e-8b6f-89913cefd2fb', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b6098f16-8c79-5eeb-b7d3-cf4f7f68d708', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b6098f16-8c79-5eeb-b7d3-cf4f7f68d708', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('b6098f16-8c79-5eeb-b7d3-cf4f7f68d708', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('f27caa68-30c1-5c7d-a9dd-f279108aa980', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('081c192c-beeb-5aaa-943e-3fc4e9af6bdc', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('081c192c-beeb-5aaa-943e-3fc4e9af6bdc', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('081c192c-beeb-5aaa-943e-3fc4e9af6bdc', '2fdc1d56-46c7-52a5-9b38-8c1eedea635e', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('ccf9e40f-4623-5848-849a-473c75dc4415', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('8d5cf327-c876-5cc1-acd7-85411665b4c6', 'ff235bcd-9cd7-5b5c-bef7-cb1642da7942', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('8d5cf327-c876-5cc1-acd7-85411665b4c6', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('8d5cf327-c876-5cc1-acd7-85411665b4c6', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('a254806f-36a5-5293-8a8e-f542eaaee44e', 'b927c097-9d3d-5a29-ae41-cfba343101a4', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('04ffcf8d-e0db-54a2-9217-8a4c490c03ac', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('70de6c4c-0e09-5c78-82a0-9a5ed19c544b', '54fd9bf3-d0ed-52cf-b438-fbc572be182d', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('70de6c4c-0e09-5c78-82a0-9a5ed19c544b', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('70de6c4c-0e09-5c78-82a0-9a5ed19c544b', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d535221a-791e-53ce-923e-ab22396b8415', '5238c062-6fce-59ff-80df-f8c5b38a26d6', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('d535221a-791e-53ce-923e-ab22396b8415', '2be72df6-b2a5-5b50-8d3d-ce946647e8c5', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('aa1f3167-a54d-50e1-aa53-95d61d39c02f', '1acc5df7-970d-5ba6-9f76-537f60429e73', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;
INSERT INTO place_tags (place_id, tag_id, weight, source, created_at)
VALUES ('aa1f3167-a54d-50e1-aa53-95d61d39c02f', '3c0e286f-59d8-5f9f-8261-041e588ee202', 1, 'model', now())
ON CONFLICT (place_id, tag_id) DO NOTHING;

COMMIT;