-- Collections table for Explore
create table explore_collections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  intro_md text,
  hero_image_url text,
  badge_label text,

  include_tags text[] not null default '{}',
  exclude_tags text[] not null default '{}',
  entity_types text[] not null default '{country,city}',

  min_items int not null default 2,
  max_items int not null default 8,
  sort_by text not null default 'featured_first',

  order_index int not null default 0,
  is_active boolean not null default true,
  is_featured boolean not null default false,

  is_sponsored boolean not null default false,
  sponsor_name text,
  sponsor_logo_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_explore_collections_order on explore_collections (order_index) where is_active = true;
create index idx_explore_collections_slug on explore_collections (slug);

alter table explore_collections enable row level security;
create policy "Anyone can read explore_collections"
  on explore_collections for select using (true);

-- Auto-update updated_at timestamp
create trigger trg_explore_collections_updated_at
  before update on explore_collections
  for each row execute function update_updated_at();
