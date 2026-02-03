-- =====================================================================
-- Migration 00013: Seed Verification Criteria
-- Internal baseline criteria for the Sola verification system.
-- These define what we check - proprietary, not shown to users.
-- =====================================================================

INSERT INTO verification_criteria (criteria_key, criteria_label, category, weight, applies_to, is_required) VALUES

-- ---------------------------------------------------------------------------
-- ROOM CLARITY - Can traveler understand what they're booking?
-- ---------------------------------------------------------------------------
('room_type_stated', 'Room type clearly stated (private/shared)', 'room_clarity', 1.00, '{hotel,hostel,homestay}', true),
('bathroom_type_stated', 'Bathroom type stated (private/shared)', 'room_clarity', 0.90, '{hotel,hostel,homestay}', false),
('female_only_option_clear', 'Female-only dorm clearly marked if available', 'room_clarity', 1.00, '{hostel}', true),
('mixed_dorm_disclosed', 'Mixed dorm clearly disclosed', 'room_clarity', 1.00, '{hostel}', true),
('bed_type_stated', 'Bed configuration stated', 'room_clarity', 0.60, '{hotel,hostel,homestay}', false),
('room_size_indicated', 'Room size or capacity indicated', 'room_clarity', 0.50, '{hotel,hostel,homestay}', false),

-- ---------------------------------------------------------------------------
-- SECURITY - Signals from reviews and listings about safety/locks
-- ---------------------------------------------------------------------------
('lock_mentioned_positive', 'Reviews mention working locks/security', 'security', 0.90, '{hotel,hostel,homestay}', false),
('no_lock_complaints', 'No complaints about locks/security in reviews', 'security', 1.00, '{hotel,hostel,homestay}', true),
('locker_available', 'Lockers available for guests', 'security', 0.80, '{hostel}', false),
('safe_in_room', 'In-room safe available', 'security', 0.50, '{hotel}', false),
('reception_hours_clear', 'Reception/staff availability hours clear', 'security', 0.70, '{hotel,hostel,homestay}', false),
('key_card_or_code', 'Modern key access (card/code) vs traditional key', 'security', 0.40, '{hotel,hostel,homestay}', false),

-- ---------------------------------------------------------------------------
-- SURROUNDINGS - Neighborhood context and walkability
-- ---------------------------------------------------------------------------
('neighborhood_walkable', 'Neighborhood described as walkable', 'surroundings', 0.70, '{hotel,hostel,homestay}', false),
('transport_proximity', 'Distance to public transport stated or inferable', 'surroundings', 0.80, '{hotel,hostel,homestay}', false),
('no_area_safety_concerns', 'No safety concerns mentioned about area in reviews', 'surroundings', 1.00, '{hotel,hostel,homestay}', true),
('lighting_mentioned', 'Street lighting or area safety mentioned positively', 'surroundings', 0.60, '{hotel,hostel,homestay}', false),
('nearby_amenities', 'Nearby food/shops mentioned', 'surroundings', 0.50, '{hotel,hostel,homestay}', false),
('taxi_uber_accessible', 'Taxi/rideshare accessibility mentioned', 'surroundings', 0.40, '{hotel,hostel,homestay}', false),

-- ---------------------------------------------------------------------------
-- OPERATIONS - Policies, check-in, transparency
-- ---------------------------------------------------------------------------
('checkin_hours_stated', 'Check-in hours or process clearly stated', 'operations', 1.00, '{hotel,hostel,homestay}', true),
('24h_checkin_available', '24h check-in or late arrival option available', 'operations', 0.70, '{hotel,hostel,homestay}', false),
('self_checkin_option', 'Self check-in option available', 'operations', 0.60, '{hotel,hostel,homestay}', false),
('guest_policy_stated', 'Guest/visitor policy stated', 'operations', 0.80, '{hostel,homestay}', false),
('pricing_transparent', 'No hidden fees mentioned in reviews', 'operations', 0.90, '{hotel,hostel,homestay}', true),
('cancellation_stated', 'Cancellation policy stated', 'operations', 0.70, '{hotel,hostel,homestay}', false),
('quiet_hours_stated', 'Quiet hours or noise policy stated', 'operations', 0.50, '{hostel}', false),
('curfew_disclosed', 'Curfew disclosed if exists', 'operations', 0.80, '{hostel}', false),

-- ---------------------------------------------------------------------------
-- ACCURACY - Does listing match reality?
-- ---------------------------------------------------------------------------
('photos_match_reviews', 'Photos described as accurate in reviews', 'accuracy', 0.80, '{hotel,hostel,homestay}', false),
('no_photo_complaints', 'No complaints about misleading photos', 'accuracy', 1.00, '{hotel,hostel,homestay}', true),
('location_accurate', 'Location/map pin described as accurate', 'accuracy', 0.90, '{hotel,hostel,homestay}', false),
('no_bait_switch', 'No bait-and-switch complaints (different room than booked)', 'accuracy', 1.00, '{hotel,hostel,homestay}', true),
('description_matches', 'Description matches reality per reviews', 'accuracy', 0.80, '{hotel,hostel,homestay}', false),
('cleanliness_as_expected', 'Cleanliness matches expectations from listing', 'accuracy', 0.70, '{hotel,hostel,homestay}', false),

-- ---------------------------------------------------------------------------
-- SOLO TRAVELER SPECIFIC - Things that matter for solo female travelers
-- ---------------------------------------------------------------------------
('solo_friendly_reviews', 'Reviews from solo travelers are positive', 'solo_specific', 0.80, '{hotel,hostel,homestay}', false),
('female_traveler_mentions', 'Female travelers mention feeling comfortable', 'solo_specific', 0.90, '{hotel,hostel,homestay}', false),
('social_common_areas', 'Common areas for meeting other travelers', 'solo_specific', 0.50, '{hostel}', false),
('staff_helpful_solo', 'Staff described as helpful for solo travelers', 'solo_specific', 0.60, '{hotel,hostel,homestay}', false),
('no_harassment_mentions', 'No mentions of harassment or unwanted attention', 'solo_specific', 1.00, '{hotel,hostel,homestay}', true)

ON CONFLICT (criteria_key) DO UPDATE SET
  criteria_label = EXCLUDED.criteria_label,
  category = EXCLUDED.category,
  weight = EXCLUDED.weight,
  applies_to = EXCLUDED.applies_to,
  is_required = EXCLUDED.is_required;
