-- ---------------------------------------------------------------------------
-- Conversations: insert + update policies
-- ---------------------------------------------------------------------------

-- Users can create conversations they are a participant of
create policy "Users can create conversations"
  on conversations for insert
  with check (auth.uid() = any(participant_ids));

-- Participants can update their conversations (last_message, unread_count)
create policy "Users can update own conversations"
  on conversations for update
  using (auth.uid() = any(participant_ids));

-- ---------------------------------------------------------------------------
-- Messages: update policy for read receipts
-- ---------------------------------------------------------------------------

-- Recipients can mark messages as read (update read_at)
create policy "Users can update messages in their conversations"
  on messages for update
  using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and auth.uid() = any(conversations.participant_ids)
    )
  );

-- ---------------------------------------------------------------------------
-- Place signals: create table (missing from initial schema) + RLS
-- ---------------------------------------------------------------------------

create table if not exists place_signals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  place_id uuid references places(id) on delete cascade not null,
  signal_type text not null check (signal_type in ('liked', 'disliked', 'visited', 'rated', 'hidden')),
  rating int,
  note text,
  created_at timestamptz default now()
);

create index if not exists idx_place_signals_user on place_signals(user_id);
create index if not exists idx_place_signals_place on place_signals(place_id);

alter table place_signals enable row level security;

create policy "Users can view own signals"
  on place_signals for select
  using (auth.uid() = user_id);

create policy "Users can create signals"
  on place_signals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own signals"
  on place_signals for update
  using (auth.uid() = user_id);

create policy "Users can delete own signals"
  on place_signals for delete
  using (auth.uid() = user_id);
