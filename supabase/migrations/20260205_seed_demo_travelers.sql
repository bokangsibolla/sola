-- Seed 5 realistic demo traveler profiles for testing
-- These use fixed UUIDs so they can be referenced and cleaned up
-- Marked with travel_style = 'demo_seed' for easy identification

insert into profiles (id, first_name, bio, avatar_url, home_country_iso2, home_country_name, nationality, interests, travel_style, current_city_name, location_city_name, location_country_name, location_sharing_enabled, is_discoverable, is_online)
values
  (
    '00000000-0000-0000-0000-000000000d01',
    'Aisha',
    'Documentary filmmaker exploring stories across Southeast Asia. Love early mornings at temples and late-night street food.',
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop',
    'KE', 'Kenya', 'Kenyan',
    ARRAY['photography', 'street food', 'temples', 'filmmaking'],
    'demo_seed',
    'Chiang Mai', 'Chiang Mai', 'Thailand', true, true, false
  ),
  (
    '00000000-0000-0000-0000-000000000d02',
    'Mei',
    'Software engineer on a sabbatical. Working from cafes, learning to surf, and reading too many books.',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    'TW', 'Taiwan', 'Taiwanese',
    ARRAY['coworking', 'surfing', 'reading', 'yoga'],
    'demo_seed',
    'Canggu', 'Canggu', 'Indonesia', true, true, false
  ),
  (
    '00000000-0000-0000-0000-000000000d03',
    'Sofia',
    'Architect who trades blueprints for backpacks every few months. Obsessed with local ceramics and quiet cafes.',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    'CO', 'Colombia', 'Colombian',
    ARRAY['architecture', 'ceramics', 'cafes', 'hiking'],
    'demo_seed',
    'Hanoi', 'Hanoi', 'Vietnam', true, true, false
  ),
  (
    '00000000-0000-0000-0000-000000000d04',
    'Priya',
    'Medical researcher taking a gap year. Interested in traditional medicine, night markets, and making friends over chai.',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
    'IN', 'India', 'Indian',
    ARRAY['wellness', 'night markets', 'cooking', 'meditation'],
    'demo_seed',
    'Chiang Mai', 'Chiang Mai', 'Thailand', true, true, false
  ),
  (
    '00000000-0000-0000-0000-000000000d05',
    'Emma',
    'Former teacher, now a full-time traveler. Writing a book about women-owned businesses in Asia.',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    'NZ', 'New Zealand', 'New Zealander',
    ARRAY['writing', 'social impact', 'street food', 'diving'],
    'demo_seed',
    'Siargao', 'Siargao', 'Philippines', true, true, false
  )
on conflict (id) do nothing;
