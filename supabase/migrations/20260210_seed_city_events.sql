-- Sample city events for testing (Bangkok + Chiang Mai)

INSERT INTO city_events (id, city_id, name, slug, event_type, description, solo_tip, start_month, end_month, specific_dates, recurrence, hero_image_url, is_free, crowd_level, order_index)
VALUES
-- Bangkok events
(uuid_generate_v5(uuid_ns_url(), 'event-bkk-songkran'),
 uuid_generate_v5(uuid_ns_url(), 'city-bkk'),
 'Songkran Water Festival', 'songkran-water-festival', 'festival',
 'Thailand''s most celebrated holiday marks the traditional New Year. The entire city turns into a massive water fight — expect to get soaked. Streets are closed, music plays, and the energy is electric.',
 'Silom Road and Khao San Road have the biggest celebrations. Silom tends to feel safer for solo women — it''s well-lit and heavily policed. Wear quick-dry clothes and a waterproof phone pouch.',
 4, 4, 'April 13–15', 'annual', NULL, true, 'high', 1),

(uuid_generate_v5(uuid_ns_url(), 'event-bkk-loy-krathong'),
 uuid_generate_v5(uuid_ns_url(), 'city-bkk'),
 'Loy Krathong', 'loy-krathong-bangkok', 'festival',
 'The Festival of Lights. Thousands of decorated lotus-shaped floats (krathongs) are released onto rivers and canals. One of the most visually stunning events in Southeast Asia.',
 'Asiatique The Riverfront hosts a beautiful, safe celebration with great food stalls. Go early to grab a good spot along the river.',
 11, 11, 'Full moon night in November', 'annual', NULL, true, 'moderate', 2),

(uuid_generate_v5(uuid_ns_url(), 'event-bkk-chinese-ny'),
 uuid_generate_v5(uuid_ns_url(), 'city-bkk'),
 'Chinese New Year in Chinatown', 'chinese-new-year-bangkok', 'holiday',
 'Bangkok''s Yaowarat Road (Chinatown) comes alive with dragon dances, firecrackers, street food, and red lanterns. One of the largest Chinese New Year celebrations outside China.',
 'The main stretch of Yaowarat gets extremely crowded. Arrive before 5pm to explore comfortably. Street food here is incredible — this is a must for food lovers.',
 1, 2, 'Late January or February', 'annual', NULL, true, 'high', 3),

-- Chiang Mai events
(uuid_generate_v5(uuid_ns_url(), 'event-cnx-flower-fest'),
 uuid_generate_v5(uuid_ns_url(), 'city-cnx'),
 'Chiang Mai Flower Festival', 'chiang-mai-flower-festival', 'festival',
 'A three-day celebration of Chiang Mai''s floral heritage. The highlight is a spectacular float parade through the Old City, covered in intricate flower arrangements.',
 'The parade route along Tha Phae Road is the best viewing spot. Saturday morning has the main procession — arrive early for shade and a front-row view.',
 2, 2, 'First weekend of February', 'annual', NULL, true, 'moderate', 1),

(uuid_generate_v5(uuid_ns_url(), 'event-cnx-yi-peng'),
 uuid_generate_v5(uuid_ns_url(), 'city-cnx'),
 'Yi Peng Lantern Festival', 'yi-peng-lantern-festival', 'festival',
 'Thousands of glowing paper lanterns are released into the night sky over Chiang Mai. An unforgettable, spiritual experience that coincides with Loy Krathong.',
 'The main mass release events require tickets (book weeks in advance). The free public celebration along the Ping River is equally magical and feels safe for solo travelers.',
 11, 11, 'Full moon in November', 'annual', NULL, false, 'high', 2),

(uuid_generate_v5(uuid_ns_url(), 'event-cnx-songkran'),
 uuid_generate_v5(uuid_ns_url(), 'city-cnx'),
 'Songkran in Chiang Mai', 'songkran-chiang-mai', 'festival',
 'Chiang Mai''s Songkran is arguably even more intense than Bangkok''s. The moat around the Old City becomes the epicenter — circling it with water guns is a rite of passage.',
 'The Old City moat area is the main celebration zone. It''s chaotic but friendly. Keep valuables in a waterproof bag. The east side near Tha Phae Gate has the most energy.',
 4, 4, 'April 13–15', 'annual', NULL, true, 'high', 3)

ON CONFLICT (slug) DO NOTHING;
