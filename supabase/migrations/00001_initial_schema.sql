-- =====================================================================
-- Sola initial schema — matches data/types.ts exactly
-- Run this in Supabase SQL Editor or via supabase db push
-- =====================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Countries
-- ---------------------------------------------------------------------------
create table countries (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  iso2 char(2) unique not null,
  iso3 char(3),
  currency_code text,
  is_active boolean default true,
  order_index int default 0,
  hero_image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Cities
-- ---------------------------------------------------------------------------
create table cities (
  id uuid primary key default uuid_generate_v4(),
  country_id uuid references countries(id) on delete cascade not null,
  slug text unique not null,
  name text not null,
  timezone text not null default 'UTC',
  center_lat double precision,
  center_lng double precision,
  is_active boolean default true,
  order_index int default 0,
  hero_image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- City Areas
-- ---------------------------------------------------------------------------
create table city_areas (
  id uuid primary key default uuid_generate_v4(),
  city_id uuid references cities(id) on delete cascade not null,
  slug text unique not null,
  name text not null,
  area_kind text not null check (area_kind in ('neighborhood', 'beach', 'island', 'district')),
  is_primary boolean default false,
  is_active boolean default true,
  order_index int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Place Categories
-- ---------------------------------------------------------------------------
create table place_categories (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  parent_id uuid references place_categories(id),
  icon text,
  order_index int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Places
-- ---------------------------------------------------------------------------
create table places (
  id uuid primary key default uuid_generate_v4(),
  city_id uuid references cities(id) on delete cascade not null,
  city_area_id uuid references city_areas(id),
  slug text unique not null,
  name text not null,
  place_type text not null check (place_type in (
    'hotel', 'hostel', 'restaurant', 'cafe', 'bar',
    'activity', 'coworking', 'landmark', 'transport', 'shop', 'wellness'
  )),
  primary_category_id uuid references place_categories(id),
  lat double precision,
  lng double precision,
  address text,
  google_place_id text,
  phone text,
  website text,
  price_level int,
  hours_text text,
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Place Media
-- ---------------------------------------------------------------------------
create table place_media (
  id uuid primary key default uuid_generate_v4(),
  place_id uuid references places(id) on delete cascade not null,
  url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  caption text,
  source text not null check (source in ('editorial', 'google', 'user')) default 'editorial',
  order_index int default 0,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Tag Groups
-- ---------------------------------------------------------------------------
create table tag_groups (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  label text not null,
  scope text not null check (scope in ('global', 'city', 'country')) default 'global',
  order_index int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Tags
-- ---------------------------------------------------------------------------
create table tags (
  id uuid primary key default uuid_generate_v4(),
  tag_group_id uuid references tag_groups(id),
  slug text unique not null,
  label text not null,
  filter_group text not null check (filter_group in (
    'vibe', 'good_for', 'amenity', 'safety', 'cuisine', 'style'
  )),
  scope text not null default 'global',
  tag_type text not null check (tag_type in ('place', 'profile')) default 'place',
  icon text,
  order_index int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Place Tags (junction)
-- ---------------------------------------------------------------------------
create table place_tags (
  place_id uuid references places(id) on delete cascade not null,
  tag_id uuid references tags(id) on delete cascade not null,
  weight int default 1,
  source text not null check (source in ('editorial', 'model', 'user')) default 'editorial',
  created_at timestamptz default now(),
  primary key (place_id, tag_id)
);

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  first_name text not null default '',
  bio text,
  avatar_url text,
  home_country_iso2 char(2),
  home_country_name text,
  home_city_id uuid references cities(id),
  current_city_id uuid references cities(id),
  current_city_name text,
  interests text[] default '{}',
  travel_style text,
  is_online boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Saved Places
-- ---------------------------------------------------------------------------
create table saved_places (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  place_id uuid references places(id) on delete cascade not null,
  collection_id uuid,
  created_at timestamptz default now(),
  unique (user_id, place_id)
);

-- ---------------------------------------------------------------------------
-- Collections
-- ---------------------------------------------------------------------------
create table collections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  emoji text not null default '📌',
  is_public boolean default false,
  created_at timestamptz default now()
);

-- Add FK now that collections table exists
alter table saved_places
  add constraint saved_places_collection_id_fkey
  foreign key (collection_id) references collections(id) on delete set null;

-- ---------------------------------------------------------------------------
-- Geo Content
-- ---------------------------------------------------------------------------
create table geo_content (
  id uuid primary key default uuid_generate_v4(),
  scope text not null check (scope in ('country', 'city')),
  country_id uuid references countries(id),
  city_id uuid references cities(id),
  title text not null,
  subtitle text,
  summary text,
  content_md text,
  hero_image_url text,
  safety_rating text not null check (safety_rating in (
    'very_safe', 'generally_safe', 'use_caution', 'exercise_caution'
  )) default 'generally_safe',
  solo_friendly boolean default true,
  best_months text,
  currency text,
  language text,
  visa_note text,
  highlights text[] default '{}',
  updated_by uuid references auth.users(id),
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Trips
-- ---------------------------------------------------------------------------
create table trips (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  destination_city_id uuid references cities(id) not null,
  destination_name text not null,
  country_iso2 char(2) not null,
  arriving date not null,
  leaving date not null,
  nights int not null default 0,
  status text not null check (status in ('planned', 'active', 'completed')) default 'planned',
  notes text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Trip Places (junction)
-- ---------------------------------------------------------------------------
create table trip_places (
  trip_id uuid references trips(id) on delete cascade not null,
  place_id uuid references places(id) on delete cascade not null,
  day_number int,
  notes text,
  primary key (trip_id, place_id)
);

-- ---------------------------------------------------------------------------
-- Conversations
-- ---------------------------------------------------------------------------
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  participant_ids uuid[] not null default '{}',
  last_message text,
  last_message_at timestamptz default now(),
  unread_count int default 0
);

-- ---------------------------------------------------------------------------
-- Messages
-- ---------------------------------------------------------------------------
create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  text text not null,
  sent_at timestamptz default now(),
  read_at timestamptz
);

-- =====================================================================
-- Row Level Security
-- =====================================================================

-- Public read tables (editorial content)
alter table countries enable row level security;
create policy "Countries are publicly readable"
  on countries for select using (true);

alter table cities enable row level security;
create policy "Cities are publicly readable"
  on cities for select using (true);

alter table city_areas enable row level security;
create policy "City areas are publicly readable"
  on city_areas for select using (true);

alter table place_categories enable row level security;
create policy "Categories are publicly readable"
  on place_categories for select using (true);

alter table places enable row level security;
create policy "Places are publicly readable"
  on places for select using (true);

alter table place_media enable row level security;
create policy "Place media is publicly readable"
  on place_media for select using (true);

alter table tag_groups enable row level security;
create policy "Tag groups are publicly readable"
  on tag_groups for select using (true);

alter table tags enable row level security;
create policy "Tags are publicly readable"
  on tags for select using (true);

alter table place_tags enable row level security;
create policy "Place tags are publicly readable"
  on place_tags for select using (true);

alter table geo_content enable row level security;
create policy "Geo content is publicly readable"
  on geo_content for select using (true);

-- Profiles: public read, owner write
alter table profiles enable row level security;
create policy "Profiles are publicly readable"
  on profiles for select using (true);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Saved Places: owner only
alter table saved_places enable row level security;
create policy "Users can view own saved places"
  on saved_places for select using (auth.uid() = user_id);
create policy "Users can save places"
  on saved_places for insert with check (auth.uid() = user_id);
create policy "Users can unsave places"
  on saved_places for delete using (auth.uid() = user_id);

-- Collections: owner can CRUD, public collections readable by all
alter table collections enable row level security;
create policy "Users can view own collections"
  on collections for select using (auth.uid() = user_id);
create policy "Public collections are readable"
  on collections for select using (is_public = true);
create policy "Users can create collections"
  on collections for insert with check (auth.uid() = user_id);
create policy "Users can update own collections"
  on collections for update using (auth.uid() = user_id);
create policy "Users can delete own collections"
  on collections for delete using (auth.uid() = user_id);

-- Trips: owner only
alter table trips enable row level security;
create policy "Users can view own trips"
  on trips for select using (auth.uid() = user_id);
create policy "Users can create trips"
  on trips for insert with check (auth.uid() = user_id);
create policy "Users can update own trips"
  on trips for update using (auth.uid() = user_id);
create policy "Users can delete own trips"
  on trips for delete using (auth.uid() = user_id);

alter table trip_places enable row level security;
create policy "Users can view own trip places"
  on trip_places for select using (
    exists (select 1 from trips where trips.id = trip_places.trip_id and trips.user_id = auth.uid())
  );
create policy "Users can add trip places"
  on trip_places for insert with check (
    exists (select 1 from trips where trips.id = trip_places.trip_id and trips.user_id = auth.uid())
  );
create policy "Users can remove trip places"
  on trip_places for delete using (
    exists (select 1 from trips where trips.id = trip_places.trip_id and trips.user_id = auth.uid())
  );

-- Conversations: participants only
alter table conversations enable row level security;
create policy "Users can view own conversations"
  on conversations for select using (auth.uid() = any(participant_ids));

alter table messages enable row level security;
create policy "Users can view messages in their conversations"
  on messages for select using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and auth.uid() = any(conversations.participant_ids)
    )
  );
create policy "Users can send messages"
  on messages for insert with check (auth.uid() = sender_id);

-- =====================================================================
-- Auto-create profile on signup
-- =====================================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, first_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'first_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =====================================================================
-- Indexes
-- =====================================================================
create index idx_cities_country on cities(country_id);
create index idx_city_areas_city on city_areas(city_id);
create index idx_places_city on places(city_id);
create index idx_places_area on places(city_area_id);
create index idx_place_media_place on place_media(place_id);
create index idx_place_tags_place on place_tags(place_id);
create index idx_place_tags_tag on place_tags(tag_id);
create index idx_saved_places_user on saved_places(user_id);
create index idx_collections_user on collections(user_id);
create index idx_trips_user on trips(user_id);
create index idx_trip_places_trip on trip_places(trip_id);
create index idx_messages_conversation on messages(conversation_id);
create index idx_geo_content_country on geo_content(country_id);
create index idx_geo_content_city on geo_content(city_id);
