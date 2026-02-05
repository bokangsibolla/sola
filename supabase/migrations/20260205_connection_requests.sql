-- Connection requests: mutual consent before chat
create table connection_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  context text, -- e.g. "You're both in Hanoi", "Shared interest: hiking"
  created_at timestamptz default now(),
  responded_at timestamptz,
  unique (sender_id, receiver_id)
);

alter table connection_requests enable row level security;

-- Users can see requests they sent or received
create policy "Users can view own connection requests"
  on connection_requests for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Users can send connection requests
create policy "Users can send connection requests"
  on connection_requests for insert
  with check (auth.uid() = sender_id);

-- Users can update requests they received (accept/decline)
create policy "Receivers can respond to connection requests"
  on connection_requests for update
  using (auth.uid() = receiver_id);

-- Users can delete their own sent requests (withdraw)
create policy "Senders can withdraw requests"
  on connection_requests for delete
  using (auth.uid() = sender_id);

-- Indexes
create index idx_connection_requests_sender on connection_requests(sender_id);
create index idx_connection_requests_receiver on connection_requests(receiver_id);
create index idx_connection_requests_status on connection_requests(status);
