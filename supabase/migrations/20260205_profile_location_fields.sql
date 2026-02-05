-- Add optional location sharing and nationality to profiles
alter table profiles
  add column if not exists location_sharing_enabled boolean default false,
  add column if not exists location_lat double precision,
  add column if not exists location_lng double precision,
  add column if not exists location_city_name text,
  add column if not exists location_country_name text,
  add column if not exists location_updated_at timestamptz,
  add column if not exists nationality text,
  add column if not exists is_discoverable boolean default true;

-- Index for location-based queries (coarse, city-level)
create index if not exists idx_profiles_location
  on profiles(location_city_name)
  where location_sharing_enabled = true and is_discoverable = true;

-- Index for interest-based matching
create index if not exists idx_profiles_interests
  on profiles using gin(interests)
  where is_discoverable = true;
