-- Blocked users: prevents messaging and hides from feeds
create table blocked_users (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique (blocker_id, blocked_id)
);

alter table blocked_users enable row level security;

create policy "Users can view their own blocks"
  on blocked_users for select using (auth.uid() = blocker_id);

create policy "Users can block others"
  on blocked_users for insert with check (auth.uid() = blocker_id);

create policy "Users can unblock"
  on blocked_users for delete using (auth.uid() = blocker_id);

-- User reports: stored for admin review
create table user_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reported_id uuid not null references auth.users(id) on delete cascade,
  reason text not null default 'other',
  details text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'resolved')),
  created_at timestamptz default now()
);

alter table user_reports enable row level security;

create policy "Users can view their own reports"
  on user_reports for select using (auth.uid() = reporter_id);

create policy "Users can create reports"
  on user_reports for insert with check (auth.uid() = reporter_id);
