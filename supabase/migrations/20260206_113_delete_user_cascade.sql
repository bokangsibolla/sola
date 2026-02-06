-- Migration: delete_user_data RPC
-- Cascading account deletion for App Store compliance.
-- Called from the client when a user confirms account deletion.

create or replace function public.delete_user_data(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Only the user themselves may delete their data
  if auth.uid() is distinct from target_user_id then
    raise exception 'Not authorized';
  end if;

  -- Communication
  delete from public.messages       where sender_id = target_user_id;
  delete from public.conversations  where target_user_id = any(participant_ids);
  delete from public.conversation_read_state where user_id = target_user_id;
  delete from public.push_tokens    where user_id = target_user_id;

  -- Trips
  delete from public.trip_matching_preferences where trip_id in (select id from public.trips where user_id = target_user_id);
  delete from public.trip_saved_items where trip_id in (select id from public.trips where user_id = target_user_id);
  delete from public.trip_entries    where user_id = target_user_id;
  delete from public.trip_buddies    where user_id = target_user_id;
  delete from public.trip_stops      where trip_id in (select id from public.trips where user_id = target_user_id);
  delete from public.trips           where user_id = target_user_id;

  -- Collections & saved places
  delete from public.saved_places    where user_id = target_user_id;
  delete from public.collections     where user_id = target_user_id;

  -- Signals
  delete from public.place_signals   where user_id = target_user_id;

  -- Community
  delete from public.community_reactions where user_id = target_user_id;
  delete from public.community_reports   where reporter_id = target_user_id;
  delete from public.community_replies   where author_id = target_user_id;
  delete from public.community_threads   where author_id = target_user_id;

  -- Social
  delete from public.connection_requests where sender_id = target_user_id or receiver_id = target_user_id;
  delete from public.blocked_users       where blocker_id = target_user_id or blocked_id = target_user_id;
  delete from public.user_reports        where reporter_id = target_user_id;

  -- Onboarding
  delete from public.onboarding_sessions where user_id = target_user_id;

  -- Anonymize profile (keep row for referential integrity, wipe PII)
  update public.profiles set
    first_name       = 'Deleted',
    username         = null,
    bio              = null,
    avatar_url       = null,
    home_country_iso2 = null,
    home_country_name = null,
    interests        = '{}',
    travel_style     = null,
    is_discoverable  = false,
    location_sharing_enabled = false,
    location_lat     = null,
    location_lng     = null,
    location_city_name    = null,
    location_country_name = null,
    updated_at       = now()
  where id = target_user_id;

  -- Delete avatar files from storage
  delete from storage.objects where bucket_id = 'avatars' and (storage.foldername(name))[1] = target_user_id::text;
end;
$$;
