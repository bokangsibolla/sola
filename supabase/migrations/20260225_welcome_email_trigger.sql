-- Trigger to send a welcome email when a new user signs up.
-- Uses pg_net to async POST to the send-welcome-email Edge Function via Resend.

create or replace function notify_welcome_email()
returns trigger as $$
declare
  func_url text := current_setting('app.settings.supabase_url', true)
    || '/functions/v1/send-welcome-email';
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
      'table', 'auth.users',
      'record', jsonb_build_object(
        'id', NEW.id,
        'email', NEW.email,
        'first_name', coalesce(NEW.raw_user_meta_data->>'first_name', '')
      )
    )
  );
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_welcome_email on auth.users;
create trigger on_auth_user_welcome_email
  after insert on auth.users
  for each row execute function notify_welcome_email();
