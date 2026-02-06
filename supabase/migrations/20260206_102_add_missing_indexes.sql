-- Migration: Add composite indexes matching actual client query patterns
--
-- These indexes were identified by auditing every Supabase .select() /
-- .eq() / .order() call in the client codebase (api.ts, communityApi.ts,
-- tripApi.ts, collections.ts, lenses.ts) and creating covering indexes
-- for the most frequent filter + sort combinations.
--
-- Every index uses CREATE INDEX IF NOT EXISTS so the migration is
-- idempotent and safe to re-run.

------------------------------------------------------------------------
-- places
------------------------------------------------------------------------

-- places: queried by (city_id, is_active) — api.ts:426, 581, 597, 624, 660, 1841, 1858
CREATE INDEX IF NOT EXISTS idx_places_city_active
  ON places(city_id) WHERE is_active = true;

-- places: queried by (city_id, place_type, is_active) — api.ts:439, 597, 624, 1858
CREATE INDEX IF NOT EXISTS idx_places_city_type_active
  ON places(city_id, place_type) WHERE is_active = true;

-- places: queried by (city_area_id, is_active) — api.ts:450, 742, 1875
CREATE INDEX IF NOT EXISTS idx_places_area_active
  ON places(city_area_id) WHERE is_active = true;

-- places: queried by (city_id, best_time_of_day) — api.ts:581
CREATE INDEX IF NOT EXISTS idx_places_city_time_active
  ON places(city_id, best_time_of_day) WHERE is_active = true;

-- places: queried by (city_id, verification_status) — api.ts:1841, 1858
CREATE INDEX IF NOT EXISTS idx_places_city_verified
  ON places(city_id, verification_status) WHERE is_active = true;

-- places: curation_score ordering — api.ts:581, 597, 609, 624
CREATE INDEX IF NOT EXISTS idx_places_city_curation
  ON places(city_id, curation_score DESC NULLS LAST) WHERE is_active = true;

------------------------------------------------------------------------
-- messages
------------------------------------------------------------------------

-- messages: (conversation_id, sent_at) — api.ts:993, 1263
CREATE INDEX IF NOT EXISTS idx_messages_conversation_sent
  ON messages(conversation_id, sent_at);

-- messages: unread messages — api.ts:1706
CREATE INDEX IF NOT EXISTS idx_messages_unread
  ON messages(conversation_id, sender_id) WHERE read_at IS NULL;

------------------------------------------------------------------------
-- conversations
------------------------------------------------------------------------

-- conversations: GIN for participant_ids — api.ts:984, 1011, 1246
CREATE INDEX IF NOT EXISTS idx_conversations_participants
  ON conversations USING gin(participant_ids);

-- conversations: ordering by last_message_at — api.ts:984, 1246
CREATE INDEX IF NOT EXISTS idx_conversations_last_message
  ON conversations(last_message_at DESC);

------------------------------------------------------------------------
-- community_threads
------------------------------------------------------------------------

-- community_threads: feed queries — communityApi.ts:48
CREATE INDEX IF NOT EXISTS idx_community_threads_feed
  ON community_threads(status, visibility, created_at DESC)
  WHERE status = 'active' AND visibility = 'public';

-- community_threads: "top" sort — communityApi.ts:48
CREATE INDEX IF NOT EXISTS idx_community_threads_top
  ON community_threads(vote_score DESC, created_at DESC)
  WHERE status = 'active' AND visibility = 'public';

------------------------------------------------------------------------
-- community_replies
------------------------------------------------------------------------

-- community_replies: thread + ordering — communityApi.ts:194
CREATE INDEX IF NOT EXISTS idx_community_replies_thread_sorted
  ON community_replies(thread_id, vote_score DESC, created_at ASC)
  WHERE status = 'active';

------------------------------------------------------------------------
-- trips
------------------------------------------------------------------------

-- trips: user + arriving — tripApi.ts:23
CREATE INDEX IF NOT EXISTS idx_trips_user_arriving
  ON trips(user_id, arriving ASC NULLS LAST);

------------------------------------------------------------------------
-- connection_requests
------------------------------------------------------------------------

-- connection_requests: sender + status — api.ts:2089, 2100
CREATE INDEX IF NOT EXISTS idx_connection_requests_sender_status
  ON connection_requests(sender_id, status);

-- connection_requests: receiver + status — api.ts:2089
CREATE INDEX IF NOT EXISTS idx_connection_requests_receiver_status
  ON connection_requests(receiver_id, status);

------------------------------------------------------------------------
-- destination_tags
------------------------------------------------------------------------

-- destination_tags: tag_slug + entity_type — collections.ts:36, lenses.ts:39
CREATE INDEX IF NOT EXISTS idx_destination_tags_slug_type
  ON destination_tags(tag_slug, entity_type);

------------------------------------------------------------------------
-- saved_places
------------------------------------------------------------------------

-- saved_places: user + collection — api.ts:944
CREATE INDEX IF NOT EXISTS idx_saved_places_user_collection
  ON saved_places(user_id, collection_id);

------------------------------------------------------------------------
-- profiles
------------------------------------------------------------------------

-- profiles: discoverable by city — api.ts:2142
CREATE INDEX IF NOT EXISTS idx_profiles_discoverable_city
  ON profiles(location_city_name)
  WHERE location_sharing_enabled = true AND is_discoverable = true;

-- profiles: discoverable by country — api.ts:2161
CREATE INDEX IF NOT EXISTS idx_profiles_discoverable_country
  ON profiles(location_country_name)
  WHERE location_sharing_enabled = true AND is_discoverable = true;
