-- Add summary field to trips
alter table trips add column if not exists summary text;

-- Trip buddies: travel companions linked to connected profiles
create table trip_buddies (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  added_at timestamptz default now(),
  unique (trip_id, user_id)
);

alter table trip_buddies enable row level security;

-- Trip owner can manage buddies
create policy "Trip owner can view buddies"
  on trip_buddies for select
  using (
    exists (select 1 from trips where trips.id = trip_buddies.trip_id and trips.user_id = auth.uid())
    or auth.uid() = user_id
  );

create policy "Trip owner can add buddies"
  on trip_buddies for insert
  with check (
    exists (select 1 from trips where trips.id = trip_buddies.trip_id and trips.user_id = auth.uid())
  );

create policy "Trip owner can remove buddies"
  on trip_buddies for delete
  using (
    exists (select 1 from trips where trips.id = trip_buddies.trip_id and trips.user_id = auth.uid())
  );

-- Indexes
create index idx_trip_buddies_trip on trip_buddies(trip_id);
create index idx_trip_buddies_user on trip_buddies(user_id);
