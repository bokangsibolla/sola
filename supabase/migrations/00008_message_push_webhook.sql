-- Trigger to call the push-on-message Edge Function when a new message is inserted.
-- NOTE: This uses pg_net (available on Supabase) to make an async HTTP call.
-- You must deploy the Edge Function first, then update the URL below.

-- After deploying with `supabase functions deploy push-on-message`,
-- your function URL will be:
--   https://<project-ref>.supabase.co/functions/v1/push-on-message

create or replace function notify_push_on_message()
returns trigger as $$
declare
  func_url text := current_setting('app.settings.supabase_url', true)
    || '/functions/v1/push-on-message';
  service_key text := current_setting('app.settings.service_role_key', true);
begin
  perform net.http_post(
    url := func_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'messages',
      'record', jsonb_build_object(
        'id', NEW.id,
        'conversation_id', NEW.conversation_id,
        'sender_id', NEW.sender_id,
        'text', NEW.text,
        'sent_at', NEW.sent_at
      )
    )
  );
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_message_insert_push
  after insert on messages
  for each row
  execute function notify_push_on_message();
