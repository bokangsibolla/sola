-- Enable Supabase Realtime for the messages table so clients
-- receive live INSERT events via postgres_changes subscriptions.
alter publication supabase_realtime add table messages;
