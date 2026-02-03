-- Destination-level tags for countries, cities, and neighborhoods
create type destination_entity_type as enum ('country', 'city', 'neighborhood');

create table destination_tags (
  id uuid primary key default gen_random_uuid(),
  entity_type destination_entity_type not null,
  entity_id uuid not null,
  tag_category text not null,
  tag_slug text not null,
  tag_label text not null,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  unique (entity_type, entity_id, tag_slug)
);

create index idx_destination_tags_entity on destination_tags (entity_type, entity_id);
create index idx_destination_tags_category on destination_tags (tag_category);

-- Enable RLS
alter table destination_tags enable row level security;
create policy "Anyone can read destination_tags"
  on destination_tags for select using (true);

-- Add portrait_md to geo_content for rich editorial narratives
alter table geo_content add column if not exists portrait_md text;

-- Add best_for line to geo_content
alter table geo_content add column if not exists best_for text;
