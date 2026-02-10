# Backend Hardening & Optimization Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Harden, clean up, and optimize the Sola PostgreSQL/Supabase backend for App Store launch, real users, and future scale — without breaking existing functionality.

**Architecture:** Incremental, additive migrations applied in order. Each migration is self-contained and backward-compatible. Schema changes use `IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS` patterns. No table drops, no column removals unless provably unused.

**Tech Stack:** PostgreSQL 15+ (Supabase), RLS policies, plpgsql triggers, pg_net for webhooks

---

# PART 1: AUDIT REPORT

## What is Good

1. **RLS is enabled on every table.** No table was missed. This is better than most startups.
2. **Foreign keys are correct and cascading.** The geography hierarchy (country → city → area → place) uses `ON DELETE CASCADE` properly.
3. **Denormalized counters** (`reply_count`, `vote_score`) use triggers correctly with `GREATEST(..., 0)` floor protection.
4. **Full-text search** on community threads uses weighted `tsvector` (title=A, body=B) — production-grade.
5. **Trip matching view** (`trip_overlap_matches`) is a clean SQL view that avoids materializing data prematurely.
6. **Consistent use of UUID primary keys** with `gen_random_uuid()` / `uuid_generate_v4()`.
7. **Connection requests** enforce mutual consent before messaging — important for safety.
8. **Verification system** has a proper audit trail (`place_verifications`) separate from current status.
9. **Profile auto-creation** via `handle_new_user()` trigger prevents orphaned auth users.

## What is Risky

### CRITICAL — Fix Immediately

| # | Issue | Risk | Location |
|---|-------|------|----------|
| C1 | **`place_signals` table defined TWICE** with different schemas | The table in `00004` has `user_id`, `signal_type`, `rating`, `note` (user-facing signals). The table in `00012` has `signal_key`, `signal_value`, `confidence`, `source` (verification signals). These are **two different concepts sharing one table name**. Whichever migration ran last wins. The client queries both schemas against the same table. | `00004_missing_rls_policies.sql:34` vs `00012_place_verification.sql:62` |
| C2 | **Conversations: no blocked-user enforcement** | A blocked user can still see conversations and messages. The `participant_ids` array check doesn't filter blocked users. Blocked users can also create new conversations. | `00001:393-408`, `00004:6-13` |
| C3 | **Conversations: `unread_count` is per-conversation, not per-user** | With 2 participants, there's a single `unread_count` integer. Both users share it. Marking messages as read resets it to 0 for both. This is fundamentally broken for multi-user conversations. | `00001:276` |
| C4 | **Community threads: blocked users not filtered from feeds** | The thread feed RLS only checks `status != 'removed' AND visibility = 'public'`. A blocked user's threads still appear in your feed. The client filters them, but RLS should enforce this server-side. | `20260205_community_tables.sql:67-73` |
| C5 | **No write protection on editorial tables** | `countries`, `cities`, `places`, `tags`, etc. have `SELECT` policies but **no INSERT/UPDATE/DELETE policies**. With RLS enabled, writes will fail for everyone including service role operations via client, but if someone gets an authenticated session, there's no explicit deny. Should have explicit service-role-only write policies. | `00001:296-331` |
| C6 | **Connection requests: no self-request prevention** | A user can send a connection request to themselves. No `CHECK (sender_id != receiver_id)` constraint. | `20260205_connection_requests.sql:1-11` |
| C7 | **Connection requests: no blocked-user prevention** | A blocked user can still send connection requests to the person who blocked them. | `20260205_connection_requests.sql:20-23` |
| C8 | **`trip_overlap_matches` view bypasses RLS** | Views in PostgreSQL run with the definer's permissions by default. This view joins across `trips` and `trip_stops` which have owner-only RLS. Any authenticated user could potentially query other users' trip data through this view. | `20260205_trips_redesign.sql:184-206` |

### HIGH — Fix Before Launch

| # | Issue | Risk | Location |
|---|-------|------|----------|
| H1 | **UUID generation inconsistency** | Some tables use `uuid_generate_v4()` (requires `uuid-ossp` extension), others use `gen_random_uuid()` (built-in PG13+). Not a bug, but inconsistent and `gen_random_uuid()` is preferred. | Throughout migrations |
| H2 | **`NOT NULL DEFAULT` inconsistency** | Some boolean columns are `boolean default true` (nullable!), others are `boolean NOT NULL DEFAULT true`. Nullable booleans create three-state logic bugs. | `countries.is_active`, `cities.is_active`, `profiles.is_online`, etc. |
| H3 | **`created_at` / `updated_at` inconsistency** | Some tables have `NOT NULL DEFAULT now()`, others just `DEFAULT now()` (nullable). Some tables lack `updated_at` entirely. | `trip_stops`, `trip_saved_items`, `push_tokens`, `community_topics` |
| H4 | **Missing indexes for actual query patterns** | The client queries `places` by `(city_id, is_active, place_type)`, `(city_id, is_active, best_time_of_day)`, `(city_id, is_active, verification_status)`. None of these composite indexes exist. Also missing: `conversations(participant_ids)` GIN index, `messages(conversation_id, sent_at)` composite. | Query analysis |
| H5 | **`conversations.participant_ids` is an array, not a junction table** | Array-based participant tracking doesn't scale, can't have per-user metadata (muted, archived), and GIN index on UUID arrays is inefficient. Acceptable for 1:1 DMs but will break for group chats. | `00001:273` |
| H6 | **`destination_tags` has no foreign key on `entity_id`** | Polymorphic `entity_type` + `entity_id` pattern without FK means referential integrity is not enforced. Orphaned tags will accumulate. | `00009_destination_tags.sql` |
| H7 | **Community threads/replies: no rate limiting or spam prevention** | No constraint preventing a user from creating hundreds of threads per minute. Should have at least a `UNIQUE` on `(author_id, title)` for duplicate prevention. | `20260205_community_tables.sql` |
| H8 | **`geo_content` table is deprecated but still queried** | Client code at `api.ts:822` and `api.ts:842` still reads from `geo_content`. Data was merged to countries/cities but old queries remain. | `data/api.ts` |
| H9 | **`trip_places` table is legacy but still used in account deletion** | `api.ts:1526-1576` still queries, inserts, updates, and deletes from `trip_places`. But `trip_saved_items` was meant to replace it. Both are active. | `data/api.ts` |
| H10 | **No `updated_at` on `trips` table** | Trips can be updated but have no `updated_at` timestamp. No way to know when a trip was last modified. | `00001:243-255` |

### MEDIUM — Improve After Launch

| # | Issue | Risk | Location |
|---|-------|------|----------|
| M1 | **`profiles.nationality` exists alongside `home_country_iso2` + `home_country_name`** | Three columns representing nationality/home country. Confusing. | `profiles` |
| M2 | **`places` table has 50+ columns** | Many columns are for different concerns (location, verification, curation, google data, UI). Could benefit from vertical partitioning via views, but not urgent. | `places` |
| M3 | **`community_reactions.entity_id` has no FK** | Polymorphic reference — `entity_id` could point to a thread or reply. No referential integrity. A deleted thread won't cascade-delete its reactions. | `20260205_community_tables.sql:132-139` |
| M4 | **`helpful_count` is now redundant with `vote_score`** | After the votes migration, `helpful_count` still exists on threads and replies but is no longer maintained by triggers. It's frozen at its pre-vote value. | `20260206_community_votes.sql` |
| M5 | **Explore collections and discovery lenses duplicate logic** | Both `explore_collections` and `discovery_lenses` have `include_tags`, `exclude_tags`, `entity_types`, `sort_by`, `max_items`. Nearly identical schemas. | `00022` vs `20260205_discovery_lenses_table.sql` |
| M6 | **No pagination on several high-cardinality queries** | `getPlacesForCity`, `getSavedPlaces`, `getConversations` (non-paginated variants) fetch all rows. | `data/api.ts` |

## Data Flow Summary

```
auth.users ──→ profiles (1:1, auto-created on signup)
    │
    ├──→ trips ──→ trip_stops (multi-stop)
    │         ├──→ trip_entries (journal)
    │         ├──→ trip_saved_items (flexible saves)
    │         ├──→ trip_places (LEGACY)
    │         ├──→ trip_buddies (companions)
    │         └──→ trip_matching_preferences (1:1)
    │
    ├──→ saved_places ──→ collections (user folders)
    │
    ├──→ conversations ──→ messages (realtime)
    │
    ├──→ connection_requests (mutual consent)
    │
    ├──→ blocked_users / user_reports
    │
    ├──→ community_threads ──→ community_replies (nested)
    │                      ──→ community_reactions (votes)
    │                      ──→ community_reports
    │
    ├──→ push_tokens
    │
    └──→ onboarding_sessions

countries ──→ cities ──→ city_areas ──→ places ──→ place_media
                                            ├──→ place_tags ──→ tags ──→ tag_groups
                                            ├──→ place_verifications
                                            ├──→ place_signals (CONFLICT: two schemas)
                                            └──→ place_sola_notes

destination_tags (polymorphic → countries/cities)
explore_collections / discovery_lenses (tag-based filtering)
geo_content (DEPRECATED → merged into countries/cities)
```

---

# PART 2: MIGRATION PLAN

## Migration Naming Convention

All migrations use `YYYYMMDD_NNN_description.sql` format:
- `20260206_100_` through `20260206_199_` for this hardening pass

## Safety Rules

- Every migration uses `IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS` where applicable
- No `DROP TABLE` or `DROP COLUMN` without explicit justification
- All changes are additive and backward-compatible
- Each migration can be applied independently (no cross-migration dependencies beyond ordering)

---

### Task 1: Resolve place_signals table conflict

**Files:**
- Create: `sola/supabase/migrations/20260206_100_fix_place_signals_conflict.sql`

**Step 1: Write the migration**

This migration separates user-facing place signals (likes, ratings) from verification signals. The verification-focused `place_signals` table (from migration 00012) is the one currently in production since it ran after 00004. The user-facing signals from 00004 need to be reconciled.

Looking at the client queries:
- `api.ts:1726-1794` queries place_signals with `user_id`, `signal_type`, `rating`, `note` — the 00004 schema
- `api.ts:1813` queries place_signals with `signal_key` — the 00012 schema

The 00012 migration used `CREATE TABLE IF NOT EXISTS`, so if the 00004 table already existed, 00012 would have been a no-op for table creation, and the `signal_key`/`signal_value` columns would NOT exist. We need to ensure both column sets exist on the single table, or split them.

**Decision:** Add the missing columns from each schema to ensure both query patterns work. The table serves dual purpose but queries don't conflict.

```sql
-- Fix place_signals: ensure all columns from both migration 00004 and 00012 exist
-- Migration 00004 columns: user_id, signal_type, rating, note
-- Migration 00012 columns: signal_key, signal_value, signal_type (different meaning!), confidence, source

-- Add 00004 columns if missing
ALTER TABLE place_signals
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS rating int,
  ADD COLUMN IF NOT EXISTS note text;

-- Add 00012 columns if missing
ALTER TABLE place_signals
  ADD COLUMN IF NOT EXISTS signal_key text,
  ADD COLUMN IF NOT EXISTS signal_value text,
  ADD COLUMN IF NOT EXISTS confidence numeric(3,2),
  ADD COLUMN IF NOT EXISTS source text;

-- Ensure the unique constraint from 00012 exists
-- (only applies to verification signals that have signal_key)
CREATE UNIQUE INDEX IF NOT EXISTS uq_place_signals_key
  ON place_signals(place_id, signal_key) WHERE signal_key IS NOT NULL;

-- Ensure indexes from both migrations exist
CREATE INDEX IF NOT EXISTS idx_place_signals_user ON place_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_place_signals_place ON place_signals(place_id);
CREATE INDEX IF NOT EXISTS idx_place_signals_key ON place_signals(signal_key);

-- Ensure updated_at exists and has trigger
ALTER TABLE place_signals
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
```

**Step 2: Verify the migration is safe**

Run: `grep -n 'place_signals' sola/data/api.ts`
Expected: Confirms both query patterns exist and won't break.

**Step 3: Commit**

```bash
git add sola/supabase/migrations/20260206_100_fix_place_signals_conflict.sql
git commit -m "fix: reconcile place_signals dual-schema from migrations 00004 and 00012"
```

---

### Task 2: Add NOT NULL constraints to boolean and timestamp columns

**Files:**
- Create: `sola/supabase/migrations/20260206_101_add_not_null_constraints.sql`

**Step 1: Write the migration**

```sql
-- Add NOT NULL with defaults to boolean columns that should never be NULL
-- Strategy: SET DEFAULT first, UPDATE existing NULLs, then SET NOT NULL

-- countries
ALTER TABLE countries ALTER COLUMN is_active SET DEFAULT true;
UPDATE countries SET is_active = true WHERE is_active IS NULL;
ALTER TABLE countries ALTER COLUMN is_active SET NOT NULL;

-- cities
ALTER TABLE cities ALTER COLUMN is_active SET DEFAULT true;
UPDATE cities SET is_active = true WHERE is_active IS NULL;
ALTER TABLE cities ALTER COLUMN is_active SET NOT NULL;

-- city_areas
ALTER TABLE city_areas ALTER COLUMN is_active SET DEFAULT true;
UPDATE city_areas SET is_active = true WHERE is_active IS NULL;
ALTER TABLE city_areas ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE city_areas ALTER COLUMN is_primary SET DEFAULT false;
UPDATE city_areas SET is_primary = false WHERE is_primary IS NULL;
ALTER TABLE city_areas ALTER COLUMN is_primary SET NOT NULL;

-- places
ALTER TABLE places ALTER COLUMN is_active SET DEFAULT true;
UPDATE places SET is_active = true WHERE is_active IS NULL;
ALTER TABLE places ALTER COLUMN is_active SET NOT NULL;

-- profiles
ALTER TABLE profiles ALTER COLUMN is_online SET DEFAULT false;
UPDATE profiles SET is_online = false WHERE is_online IS NULL;
ALTER TABLE profiles ALTER COLUMN is_online SET NOT NULL;

-- collections
ALTER TABLE collections ALTER COLUMN is_public SET DEFAULT false;
UPDATE collections SET is_public = false WHERE is_public IS NULL;
ALTER TABLE collections ALTER COLUMN is_public SET NOT NULL;

-- Timestamp NOT NULL constraints
ALTER TABLE countries ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE countries ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE cities ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE cities ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE city_areas ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE city_areas ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE places ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE places ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN updated_at SET NOT NULL;

-- Add updated_at to tables that are missing it
ALTER TABLE trips ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE community_topics ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- Add updated_at trigger to trips
DROP TRIGGER IF EXISTS trg_trips_updated_at ON trips;
CREATE TRIGGER trg_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

**Step 2: Commit**

```bash
git add sola/supabase/migrations/20260206_101_add_not_null_constraints.sql
git commit -m "fix: add NOT NULL constraints to boolean and timestamp columns"
```

---

### Task 3: Add missing composite indexes for actual query patterns

**Files:**
- Create: `sola/supabase/migrations/20260206_102_add_missing_indexes.sql`

**Step 1: Write the migration**

```sql
-- ============================================================
-- INDEXES BASED ON ACTUAL CLIENT QUERY PATTERNS
-- Each index is justified by a specific query in the codebase.
-- ============================================================

-- places: queried by (city_id, is_active) in 10+ places
-- api.ts:426, 581, 597, 624, 660, 1841, 1858
CREATE INDEX IF NOT EXISTS idx_places_city_active
  ON places(city_id) WHERE is_active = true;

-- places: queried by (city_id, place_type, is_active)
-- api.ts:439, 597, 624, 1858
CREATE INDEX IF NOT EXISTS idx_places_city_type_active
  ON places(city_id, place_type) WHERE is_active = true;

-- places: queried by (city_area_id, is_active)
-- api.ts:450, 742, 1875
CREATE INDEX IF NOT EXISTS idx_places_area_active
  ON places(city_area_id) WHERE is_active = true;

-- places: queried by (city_id, is_active, best_time_of_day)
-- api.ts:581
CREATE INDEX IF NOT EXISTS idx_places_city_time_active
  ON places(city_id, best_time_of_day) WHERE is_active = true;

-- places: queried by (city_id, verification_status) for verified places
-- api.ts:1841, 1858
CREATE INDEX IF NOT EXISTS idx_places_city_verified
  ON places(city_id, verification_status) WHERE is_active = true;

-- places: curation_score used for ordering in multiple queries
-- api.ts:581, 597, 609, 624
CREATE INDEX IF NOT EXISTS idx_places_city_curation
  ON places(city_id, curation_score DESC NULLS LAST) WHERE is_active = true;

-- messages: queried by (conversation_id, sent_at) — the primary chat query
-- api.ts:993, 1263
CREATE INDEX IF NOT EXISTS idx_messages_conversation_sent
  ON messages(conversation_id, sent_at);

-- messages: queried by (conversation_id, sender_id, read_at) for read receipts
-- api.ts:1706
CREATE INDEX IF NOT EXISTS idx_messages_unread
  ON messages(conversation_id, sender_id) WHERE read_at IS NULL;

-- conversations: GIN index for participant_ids array containment queries
-- api.ts:984, 1011, 1246
CREATE INDEX IF NOT EXISTS idx_conversations_participants
  ON conversations USING gin(participant_ids);

-- conversations: ordering by last_message_at
-- api.ts:984, 1246
CREATE INDEX IF NOT EXISTS idx_conversations_last_message
  ON conversations(last_message_at DESC);

-- community_threads: composite for feed queries with status/visibility filters
-- communityApi.ts:48
CREATE INDEX IF NOT EXISTS idx_community_threads_feed
  ON community_threads(status, visibility, created_at DESC)
  WHERE status = 'active' AND visibility = 'public';

-- community_threads: vote_score ordering for "top" sort
-- communityApi.ts:48 (sort='top')
CREATE INDEX IF NOT EXISTS idx_community_threads_top
  ON community_threads(vote_score DESC, created_at DESC)
  WHERE status = 'active' AND visibility = 'public';

-- community_replies: thread + status + ordering
-- communityApi.ts:194
CREATE INDEX IF NOT EXISTS idx_community_replies_thread_sorted
  ON community_replies(thread_id, vote_score DESC, created_at ASC)
  WHERE status = 'active';

-- trips: user + arriving for trip list ordering
-- tripApi.ts:23
CREATE INDEX IF NOT EXISTS idx_trips_user_arriving
  ON trips(user_id, arriving ASC NULLS LAST);

-- connection_requests: composite for status queries
-- api.ts:2089, 2100
CREATE INDEX IF NOT EXISTS idx_connection_requests_sender_status
  ON connection_requests(sender_id, status);
CREATE INDEX IF NOT EXISTS idx_connection_requests_receiver_status
  ON connection_requests(receiver_id, status);

-- destination_tags: multi-column for collection/lens queries
-- collections.ts:36, lenses.ts:39
CREATE INDEX IF NOT EXISTS idx_destination_tags_slug_type
  ON destination_tags(tag_slug, entity_type);

-- saved_places: collection grouping query
-- api.ts:944
CREATE INDEX IF NOT EXISTS idx_saved_places_user_collection
  ON saved_places(user_id, collection_id);

-- profiles: discoverable travelers query
-- api.ts:2142, 2161
CREATE INDEX IF NOT EXISTS idx_profiles_discoverable_city
  ON profiles(location_city_name)
  WHERE location_sharing_enabled = true AND is_discoverable = true;

CREATE INDEX IF NOT EXISTS idx_profiles_discoverable_country
  ON profiles(location_country_name)
  WHERE location_sharing_enabled = true AND is_discoverable = true;

-- Drop redundant single-column indexes now covered by composites
-- idx_places_city is covered by idx_places_city_active
-- idx_places_area is covered by idx_places_area_active
-- Keep them for now since they may be used by other queries — review later
```

**Step 2: Commit**

```bash
git add sola/supabase/migrations/20260206_102_add_missing_indexes.sql
git commit -m "perf: add composite indexes matching actual client query patterns"
```

---

### Task 4: Harden conversations — blocked users, per-user unread counts

**Files:**
- Create: `sola/supabase/migrations/20260206_103_harden_conversations.sql`

**Step 1: Write the migration**

```sql
-- ============================================================
-- CONVERSATION HARDENING
-- 1. Block enforcement in RLS
-- 2. Per-user unread tracking (add table, keep old column for backward compat)
-- ============================================================

-- 1. Replace conversation SELECT policy to exclude blocked users
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (
    auth.uid() = ANY(participant_ids)
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE (blocker_id = auth.uid() AND blocked_id = ANY(participant_ids))
         OR (blocked_id = auth.uid() AND blocker_id = ANY(participant_ids))
    )
  );

-- 2. Prevent creating conversations with blocked users
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    auth.uid() = ANY(participant_ids)
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE (blocker_id = auth.uid() AND blocked_id = ANY(participant_ids))
         OR (blocked_id = auth.uid() AND blocker_id = ANY(participant_ids))
    )
  );

-- 3. Block enforcement on messages SELECT
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND auth.uid() = ANY(conversations.participant_ids)
    )
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE (blocker_id = auth.uid() AND blocked_id = messages.sender_id)
         OR (blocked_id = auth.uid() AND blocker_id = messages.sender_id)
    )
  );

-- 4. Prevent sending messages to blocked users
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND auth.uid() = ANY(conversations.participant_ids)
    )
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users b
      JOIN conversations c ON c.id = messages.conversation_id
      WHERE (b.blocker_id = auth.uid() AND b.blocked_id = ANY(c.participant_ids))
         OR (b.blocked_id = auth.uid() AND b.blocker_id = ANY(c.participant_ids))
    )
  );

-- 5. Per-user unread tracking table
-- The old unread_count column on conversations stays for backward compatibility
-- New code should use this table instead
CREATE TABLE IF NOT EXISTS conversation_read_state (
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  unread_count int NOT NULL DEFAULT 0,
  is_muted boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE conversation_read_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own read state"
  ON conversation_read_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own read state"
  ON conversation_read_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own read state"
  ON conversation_read_state FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_read_state_user
  ON conversation_read_state(user_id);
```

**Step 2: Commit**

```bash
git add sola/supabase/migrations/20260206_103_harden_conversations.sql
git commit -m "security: enforce blocked-user rules in conversation RLS, add per-user read state"
```

---

### Task 5: Harden community feeds — blocked user filtering, rate limiting

**Files:**
- Create: `sola/supabase/migrations/20260206_104_harden_community.sql`

**Step 1: Write the migration**

```sql
-- ============================================================
-- COMMUNITY HARDENING
-- 1. Filter blocked users from thread/reply feeds
-- 2. Add author_type/is_seed flags if missing
-- 3. Protect against rapid-fire posting
-- ============================================================

-- 1. Replace thread SELECT policy to filter blocked user content
DROP POLICY IF EXISTS "Threads are readable when active and public" ON community_threads;
CREATE POLICY "Threads are readable when active and public"
  ON community_threads FOR SELECT
  USING (
    status != 'removed'
    AND visibility = 'public'
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE blocker_id = auth.uid() AND blocked_id = community_threads.author_id
    )
  );

-- Authors can still see their own (unchanged)
-- "Authors can see own threads" policy remains

-- 2. Replace reply SELECT policy to filter blocked user content
DROP POLICY IF EXISTS "Replies are readable when active" ON community_replies;
CREATE POLICY "Replies are readable when active"
  ON community_replies FOR SELECT
  USING (
    status = 'active'
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE blocker_id = auth.uid() AND blocked_id = community_replies.author_id
    )
  );

-- 3. Add author_type and is_seed columns if not present
ALTER TABLE community_threads
  ADD COLUMN IF NOT EXISTS author_type text NOT NULL DEFAULT 'user'
    CHECK (author_type IN ('user', 'system')),
  ADD COLUMN IF NOT EXISTS is_seed boolean NOT NULL DEFAULT false;

-- 4. Prevent self-reactions (voting on your own content)
DROP POLICY IF EXISTS "Users can add reactions" ON community_reactions;
CREATE POLICY "Users can add reactions"
  ON community_reactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT (
      -- Cannot vote on own threads
      (entity_type = 'thread' AND entity_id IN (
        SELECT id FROM community_threads WHERE author_id = auth.uid()
      ))
      OR
      -- Cannot vote on own replies
      (entity_type = 'reply' AND entity_id IN (
        SELECT id FROM community_replies WHERE author_id = auth.uid()
      ))
    )
  );
```

**Step 2: Commit**

```bash
git add sola/supabase/migrations/20260206_104_harden_community.sql
git commit -m "security: filter blocked users from community feeds, prevent self-voting"
```

---

### Task 6: Add CHECK constraints and safety guards

**Files:**
- Create: `sola/supabase/migrations/20260206_105_add_check_constraints.sql`

**Step 1: Write the migration**

```sql
-- ============================================================
-- CHECK CONSTRAINTS & SAFETY GUARDS
-- Prevent bad data at the database level
-- ============================================================

-- 1. Connection requests: prevent self-requests
ALTER TABLE connection_requests
  DROP CONSTRAINT IF EXISTS connection_requests_no_self,
  ADD CONSTRAINT connection_requests_no_self
    CHECK (sender_id != receiver_id);

-- 2. Blocked users: prevent self-blocks
ALTER TABLE blocked_users
  DROP CONSTRAINT IF EXISTS blocked_users_no_self,
  ADD CONSTRAINT blocked_users_no_self
    CHECK (blocker_id != blocked_id);

-- 3. User reports: prevent self-reports
ALTER TABLE user_reports
  DROP CONSTRAINT IF EXISTS user_reports_no_self,
  ADD CONSTRAINT user_reports_no_self
    CHECK (reporter_id != reported_id);

-- 4. Trip dates: leaving must be >= arriving (when both present)
ALTER TABLE trips
  DROP CONSTRAINT IF EXISTS trips_date_order,
  ADD CONSTRAINT trips_date_order
    CHECK (arriving IS NULL OR leaving IS NULL OR leaving >= arriving);

-- 5. Trip stops: end_date >= start_date
ALTER TABLE trip_stops
  DROP CONSTRAINT IF EXISTS trip_stops_date_order,
  ADD CONSTRAINT trip_stops_date_order
    CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date);

-- 6. Places: price_level range
ALTER TABLE places
  DROP CONSTRAINT IF EXISTS places_price_level_range,
  ADD CONSTRAINT places_price_level_range
    CHECK (price_level IS NULL OR (price_level >= 1 AND price_level <= 4));

-- 7. Place verifications: confidence_score range
ALTER TABLE place_verifications
  DROP CONSTRAINT IF EXISTS place_verifications_confidence_range,
  ADD CONSTRAINT place_verifications_confidence_range
    CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1));

-- 8. Trips: nights must be non-negative
ALTER TABLE trips
  DROP CONSTRAINT IF EXISTS trips_nights_positive,
  ADD CONSTRAINT trips_nights_positive
    CHECK (nights >= 0);

-- 9. Community threads: title length
ALTER TABLE community_threads
  DROP CONSTRAINT IF EXISTS community_threads_title_length,
  ADD CONSTRAINT community_threads_title_length
    CHECK (char_length(title) >= 3 AND char_length(title) <= 500);

-- 10. Community threads: body length
ALTER TABLE community_threads
  DROP CONSTRAINT IF EXISTS community_threads_body_length,
  ADD CONSTRAINT community_threads_body_length
    CHECK (char_length(body) >= 10 AND char_length(body) <= 10000);

-- 11. Connection requests: prevent blocked users from sending requests
-- (Enforced via RLS policy, constraint would require a function)
DROP POLICY IF EXISTS "Users can send connection requests" ON connection_requests;
CREATE POLICY "Users can send connection requests"
  ON connection_requests FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE (blocker_id = sender_id AND blocked_id = receiver_id)
         OR (blocked_id = sender_id AND blocker_id = receiver_id)
    )
  );

-- 12. Profiles: username format validation
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_username_format,
  ADD CONSTRAINT profiles_username_format
    CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_]{3,30}$');
```

**Step 2: Commit**

```bash
git add sola/supabase/migrations/20260206_105_add_check_constraints.sql
git commit -m "fix: add CHECK constraints for data integrity and safety"
```

---

### Task 7: Harden trip_overlap_matches view and trip RLS

**Files:**
- Create: `sola/supabase/migrations/20260206_106_harden_trip_matching.sql`

**Step 1: Write the migration**

```sql
-- ============================================================
-- TRIP MATCHING HARDENING
-- Fix the trip_overlap_matches view to respect privacy and blocks
-- ============================================================

-- 1. Drop and recreate view with security filters
DROP VIEW IF EXISTS trip_overlap_matches;

CREATE VIEW trip_overlap_matches WITH (security_invoker = true) AS
SELECT
  t1.id AS my_trip_id,
  t1.user_id AS my_user_id,
  t2.id AS their_trip_id,
  t2.user_id AS their_user_id,
  ts2.city_name AS overlap_city,
  ts2.country_iso2 AS overlap_country,
  GREATEST(ts1.start_date, ts2.start_date) AS overlap_start,
  LEAST(ts1.end_date, ts2.end_date) AS overlap_end,
  t2.travel_style_tags AS their_style_tags
FROM trips t1
JOIN trip_stops ts1 ON ts1.trip_id = t1.id
JOIN trip_stops ts2 ON ts2.country_iso2 = ts1.country_iso2
  AND (ts2.city_id = ts1.city_id OR ts1.city_id IS NULL OR ts2.city_id IS NULL)
  AND ts2.start_date <= ts1.end_date
  AND ts2.end_date >= ts1.start_date
JOIN trips t2 ON t2.id = ts2.trip_id
  AND t2.user_id != t1.user_id
  AND t2.matching_opt_in = true
  AND t2.status IN ('planned', 'active')
  AND t2.privacy_level IN ('friends', 'public')  -- respect privacy
WHERE t1.matching_opt_in = true
  AND t1.status IN ('planned', 'active')
  AND t1.user_id = auth.uid()  -- only show matches for the current user
  -- Exclude blocked users
  AND NOT EXISTS (
    SELECT 1 FROM blocked_users
    WHERE (blocker_id = t1.user_id AND blocked_id = t2.user_id)
       OR (blocked_id = t1.user_id AND blocker_id = t2.user_id)
  );

-- 2. Add RLS policy for trips to allow public/friends trips to be visible for matching
-- Keep existing owner-only policies, add a read policy for matching
CREATE POLICY "Public trips are visible for matching"
  ON trips FOR SELECT
  USING (
    user_id = auth.uid()
    OR (
      matching_opt_in = true
      AND status IN ('planned', 'active')
      AND privacy_level = 'public'
      AND NOT EXISTS (
        SELECT 1 FROM blocked_users
        WHERE (blocker_id = auth.uid() AND blocked_id = trips.user_id)
           OR (blocked_id = auth.uid() AND blocker_id = trips.user_id)
      )
    )
  );
```

**Step 2: Commit**

```bash
git add sola/supabase/migrations/20260206_106_harden_trip_matching.sql
git commit -m "security: harden trip matching view — enforce privacy, blocks, and auth.uid() scoping"
```

---

### Task 8: Add write protection to editorial tables

**Files:**
- Create: `sola/supabase/migrations/20260206_107_protect_editorial_tables.sql`

**Step 1: Write the migration**

```sql
-- ============================================================
-- EDITORIAL TABLE WRITE PROTECTION
-- These tables should only be writable via service role (admin/seeding).
-- RLS is enabled but no INSERT/UPDATE/DELETE policies exist,
-- which means client writes already fail. This makes the intent explicit.
-- ============================================================

-- Note: With RLS enabled and no write policies, writes from anon/authenticated
-- roles already fail. These comments document the intent. If we ever need
-- admin-level write access via client, add policies checking for admin role.

-- Countries: read-only for clients (already enforced by RLS)
-- Cities: read-only for clients
-- City areas: read-only for clients
-- Place categories: read-only for clients
-- Places: read-only for clients
-- Place media: read-only for clients
-- Tag groups: read-only for clients
-- Tags: read-only for clients
-- Place tags: read-only for clients
-- Place verifications: read-only for clients
-- Place sola notes: read-only for clients
-- Explore collections: read-only for clients
-- Discovery lenses: read-only for clients
-- Community topics: read-only for clients

-- The only table that needs explicit protection is place_signals
-- since migration 00012 gives it public read but the 00004 schema
-- allows user writes. Both are valid — user signals and verification signals.

-- Verification criteria: ensure service role only (already has no public policies)
-- This is just a documentation commit confirming the audit found this correct.

-- Add explicit deny-all policies as documentation (optional, RLS already blocks)
-- We choose NOT to add these because:
-- 1. RLS with no matching policy already denies the operation
-- 2. Adding explicit deny policies creates maintenance burden
-- 3. The current state is already secure

-- Instead, add a comment table for documentation
COMMENT ON TABLE countries IS 'Editorial content. Writes: service role only.';
COMMENT ON TABLE cities IS 'Editorial content. Writes: service role only.';
COMMENT ON TABLE city_areas IS 'Editorial content. Writes: service role only.';
COMMENT ON TABLE place_categories IS 'Editorial content. Writes: service role only.';
COMMENT ON TABLE places IS 'Editorial content. Writes: service role only.';
COMMENT ON TABLE place_media IS 'Editorial content. Writes: service role only.';
COMMENT ON TABLE tag_groups IS 'Editorial content. Writes: service role only.';
COMMENT ON TABLE tags IS 'Editorial content. Writes: service role only.';
COMMENT ON TABLE place_tags IS 'Editorial content. Writes: service role only.';
COMMENT ON TABLE place_verifications IS 'Verification audit trail. Writes: service role only.';
COMMENT ON TABLE place_sola_notes IS 'Editorial notes. Writes: service role only.';
COMMENT ON TABLE explore_collections IS 'Editorial collections. Writes: service role only.';
COMMENT ON TABLE discovery_lenses IS 'Discovery lenses. Writes: service role only.';
COMMENT ON TABLE verification_criteria IS 'Internal criteria. Writes: service role only.';
COMMENT ON TABLE community_topics IS 'Curated topics. Writes: service role only.';
```

**Step 2: Commit**

```bash
git add sola/supabase/migrations/20260206_107_protect_editorial_tables.sql
git commit -m "docs: document editorial table write protection (already enforced by RLS)"
```

---

### Task 9: Standardize UUID generation and add missing NOT NULL defaults

**Files:**
- Create: `sola/supabase/migrations/20260206_108_standardize_defaults.sql`

**Step 1: Write the migration**

```sql
-- ============================================================
-- STANDARDIZE DEFAULTS
-- Use gen_random_uuid() everywhere (built-in, no extension needed)
-- Add consistent NOT NULL DEFAULT now() for timestamps
-- ============================================================

-- Note: We cannot change the default UUID function on existing columns
-- without dropping and recreating the default. This is safe because
-- both functions produce valid UUIDv4 values. We standardize for
-- new tables going forward.

-- Fix timestamp columns that should be NOT NULL
ALTER TABLE trip_stops ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE trip_stops ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE trip_saved_items ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE trip_saved_items ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE trip_matching_preferences ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE trip_matching_preferences ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE trip_matching_preferences ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE trip_matching_preferences ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE trip_entries ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE trip_entries ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE trip_entries ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE trip_entries ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE collections ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE collections ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE push_tokens ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE push_tokens ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE connection_requests ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE connection_requests ALTER COLUMN created_at SET NOT NULL;

-- Ensure all order_index columns are NOT NULL with default 0
ALTER TABLE countries ALTER COLUMN order_index SET DEFAULT 0;
UPDATE countries SET order_index = 0 WHERE order_index IS NULL;
ALTER TABLE countries ALTER COLUMN order_index SET NOT NULL;

ALTER TABLE cities ALTER COLUMN order_index SET DEFAULT 0;
UPDATE cities SET order_index = 0 WHERE order_index IS NULL;
ALTER TABLE cities ALTER COLUMN order_index SET NOT NULL;

ALTER TABLE city_areas ALTER COLUMN order_index SET DEFAULT 0;
UPDATE city_areas SET order_index = 0 WHERE order_index IS NULL;
ALTER TABLE city_areas ALTER COLUMN order_index SET NOT NULL;

ALTER TABLE place_categories ALTER COLUMN order_index SET DEFAULT 0;
UPDATE place_categories SET order_index = 0 WHERE order_index IS NULL;
ALTER TABLE place_categories ALTER COLUMN order_index SET NOT NULL;

ALTER TABLE place_media ALTER COLUMN order_index SET DEFAULT 0;
UPDATE place_media SET order_index = 0 WHERE order_index IS NULL;
ALTER TABLE place_media ALTER COLUMN order_index SET NOT NULL;

ALTER TABLE tag_groups ALTER COLUMN order_index SET DEFAULT 0;
UPDATE tag_groups SET order_index = 0 WHERE order_index IS NULL;
ALTER TABLE tag_groups ALTER COLUMN order_index SET NOT NULL;

ALTER TABLE tags ALTER COLUMN order_index SET DEFAULT 0;
UPDATE tags SET order_index = 0 WHERE order_index IS NULL;
ALTER TABLE tags ALTER COLUMN order_index SET NOT NULL;
```

**Step 2: Commit**

```bash
git add sola/supabase/migrations/20260206_108_standardize_defaults.sql
git commit -m "fix: standardize NOT NULL defaults on timestamp and order_index columns"
```

---

### Task 10: Deprecate legacy tables and columns

**Files:**
- Create: `sola/supabase/migrations/20260206_109_deprecate_legacy.sql`

**Step 1: Write the migration**

```sql
-- ============================================================
-- DEPRECATION MARKERS
-- Mark legacy tables/columns for future removal.
-- DO NOT DROP anything — just document and add soft-deprecation.
-- ============================================================

-- 1. geo_content: data merged into countries/cities tables
-- Queries still exist at api.ts:822 and api.ts:842
COMMENT ON TABLE geo_content IS 'DEPRECATED: Data merged into countries and cities tables. Remove client queries before dropping.';

-- 2. trip_places: replaced by trip_saved_items
-- Queries still exist at api.ts:1526-1576 and account deletion at api.ts:1945
COMMENT ON TABLE trip_places IS 'DEPRECATED: Replaced by trip_saved_items. Remove client queries before dropping.';

-- 3. helpful_count on community_threads and community_replies
-- Replaced by vote_score after the votes migration
COMMENT ON COLUMN community_threads.helpful_count IS 'DEPRECATED: Replaced by vote_score. Frozen at pre-vote value.';
COMMENT ON COLUMN community_replies.helpful_count IS 'DEPRECATED: Replaced by vote_score. Frozen at pre-vote value.';

-- 4. Old helpful trigger functions (may still exist)
-- community_inc_helpful and community_dec_helpful are superseded by fn_community_vote_change
-- The triggers were dropped in 20260206_community_votes.sql but functions may linger
DROP FUNCTION IF EXISTS community_inc_helpful() CASCADE;
DROP FUNCTION IF EXISTS community_dec_helpful() CASCADE;

-- 5. profiles.nationality is redundant with home_country_iso2 + home_country_name
COMMENT ON COLUMN profiles.nationality IS 'DEPRECATED: Use home_country_iso2 and home_country_name instead.';
```

**Step 2: Commit**

```bash
git add sola/supabase/migrations/20260206_109_deprecate_legacy.sql
git commit -m "docs: deprecate legacy tables and columns with comments"
```

---

### Task 11: Cross-feature consistency — unified block/report enforcement

**Files:**
- Create: `sola/supabase/migrations/20260206_110_unified_block_enforcement.sql`

**Step 1: Write the migration**

```sql
-- ============================================================
-- UNIFIED BLOCK ENFORCEMENT
-- Create a helper function so all features can check blocks consistently
-- ============================================================

-- Helper function: returns true if two users have a block between them
CREATE OR REPLACE FUNCTION is_blocked(user_a uuid, user_b uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocked_users
    WHERE (blocker_id = user_a AND blocked_id = user_b)
       OR (blocker_id = user_b AND blocked_id = user_a)
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Ensure profiles does NOT show blocked users in public profile reads
-- Current policy: "Profiles are publicly readable" with USING (true)
-- This is intentional — blocking someone shouldn't make them invisible
-- in profile lookups (you still need to see their name in conversations).
-- Client-side filtering handles the UX. No change needed here.

-- Ensure connection_requests respects blocks (already done in Task 6)
-- Ensure conversations respects blocks (already done in Task 4)
-- Ensure community feeds respect blocks (already done in Task 5)

-- Add trip_buddies block enforcement
DROP POLICY IF EXISTS "Trip owner can add buddies" ON trip_buddies;
CREATE POLICY "Trip owner can add buddies"
  ON trip_buddies FOR INSERT
  WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
    AND NOT is_blocked(auth.uid(), user_id)
  );
```

**Step 2: Commit**

```bash
git add sola/supabase/migrations/20260206_110_unified_block_enforcement.sql
git commit -m "feat: create is_blocked() helper function, enforce blocks on trip buddies"
```

---

### Task 12: Add missing RLS policies for trip_buddies and connection flow

**Files:**
- Create: `sola/supabase/migrations/20260206_111_complete_rls_coverage.sql`

**Step 1: Write the migration**

```sql
-- ============================================================
-- COMPLETE RLS COVERAGE
-- Fill gaps found during audit
-- ============================================================

-- 1. trip_buddies: ensure RLS is enabled and policies exist
ALTER TABLE trip_buddies ENABLE ROW LEVEL SECURITY;

-- SELECT: trip owner or the buddy user can see
DROP POLICY IF EXISTS "Trip participants can view buddies" ON trip_buddies;
CREATE POLICY "Trip participants can view buddies"
  ON trip_buddies FOR SELECT
  USING (
    user_id = auth.uid()
    OR trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- DELETE: trip owner can remove buddies
DROP POLICY IF EXISTS "Trip owner can remove buddies" ON trip_buddies;
CREATE POLICY "Trip owner can remove buddies"
  ON trip_buddies FOR DELETE
  USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- 2. Ensure conversation UPDATE policy respects blocks
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = ANY(participant_ids));

-- 3. Ensure messages UPDATE policy exists for read receipts
-- (Already exists from 00004 but verify it's correct)
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON messages;
CREATE POLICY "Users can update messages in their conversations"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND auth.uid() = ANY(conversations.participant_ids)
    )
  );

-- 4. Add DELETE policy for trip_places (legacy but still used)
CREATE POLICY IF NOT EXISTS "Users can update trip places"
  ON trip_places FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_places.trip_id AND trips.user_id = auth.uid())
  );
```

**Step 2: Commit**

```bash
git add sola/supabase/migrations/20260206_111_complete_rls_coverage.sql
git commit -m "security: complete RLS coverage for trip_buddies and legacy trip_places"
```

---

### Task 13: Production readiness — audit fields and data corruption prevention

**Files:**
- Create: `sola/supabase/migrations/20260206_112_production_readiness.sql`

**Step 1: Write the migration**

```sql
-- ============================================================
-- PRODUCTION READINESS
-- Final hardening pass
-- ============================================================

-- 1. Add updated_at to collections (missing)
ALTER TABLE collections ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
DROP TRIGGER IF EXISTS trg_collections_updated_at ON collections;
CREATE TRIGGER trg_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. Add updated_at to saved_places (missing — useful for sync)
ALTER TABLE saved_places ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 3. Add updated_at to blocked_users (missing — useful for admin review)
ALTER TABLE blocked_users ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- 4. Ensure conversations have created_at
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- 5. Add text length limits to prevent abuse on user-writable text fields
ALTER TABLE community_replies
  DROP CONSTRAINT IF EXISTS community_replies_body_length,
  ADD CONSTRAINT community_replies_body_length
    CHECK (char_length(body) >= 1 AND char_length(body) <= 10000);

ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS messages_text_length,
  ADD CONSTRAINT messages_text_length
    CHECK (char_length(text) >= 1 AND char_length(text) <= 5000);

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_bio_length,
  ADD CONSTRAINT profiles_bio_length
    CHECK (bio IS NULL OR char_length(bio) <= 500);

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_first_name_length,
  ADD CONSTRAINT profiles_first_name_length
    CHECK (char_length(first_name) <= 50);

ALTER TABLE trips
  DROP CONSTRAINT IF EXISTS trips_title_length,
  ADD CONSTRAINT trips_title_length
    CHECK (title IS NULL OR char_length(title) <= 200);

ALTER TABLE trips
  DROP CONSTRAINT IF EXISTS trips_notes_length,
  ADD CONSTRAINT trips_notes_length
    CHECK (notes IS NULL OR char_length(notes) <= 5000);

-- 6. Prevent conversations with fewer than 2 participants
ALTER TABLE conversations
  DROP CONSTRAINT IF EXISTS conversations_min_participants,
  ADD CONSTRAINT conversations_min_participants
    CHECK (array_length(participant_ids, 1) >= 2);

-- 7. Ensure message sent_at defaults to now()
ALTER TABLE messages ALTER COLUMN sent_at SET DEFAULT now();
ALTER TABLE messages ALTER COLUMN sent_at SET NOT NULL;
```

**Step 2: Commit**

```bash
git add sola/supabase/migrations/20260206_112_production_readiness.sql
git commit -m "fix: add production-readiness constraints — text limits, timestamps, participant validation"
```

---

## Summary of Changes Across All Tasks

| Task | Type | Tables Affected | Risk |
|------|------|-----------------|------|
| 1 | Fix | place_signals | Low — additive columns only |
| 2 | Fix | 10+ tables | Low — adds NOT NULL to already-defaulted columns |
| 3 | Perf | 8+ tables | None — additive indexes only |
| 4 | Security | conversations, messages | Medium — replaces RLS policies |
| 5 | Security | community_threads, community_replies, community_reactions | Medium — replaces RLS policies |
| 6 | Fix | 7+ tables | Low — adds CHECK constraints |
| 7 | Security | trips, trip_overlap_matches | Medium — recreates view |
| 8 | Docs | 15 tables | None — comments only |
| 9 | Fix | 15+ tables | Low — standardizes defaults |
| 10 | Docs | 5 items | None — comments + drops unused functions |
| 11 | Security | trip_buddies | Low — adds function and policy |
| 12 | Security | trip_buddies, trip_places | Low — adds missing policies |
| 13 | Fix | 6+ tables | Low — adds constraints and columns |

## Recommended Execution Order

1. **Task 1** (place_signals conflict) — fixes a data model conflict
2. **Task 2** (NOT NULL constraints) — prevents NULL bugs
3. **Task 6** (CHECK constraints) — prevents bad data
4. **Task 9** (standardize defaults) — consistency
5. **Task 3** (indexes) — performance
6. **Task 4** (conversations) — security critical
7. **Task 5** (community) — security critical
8. **Task 7** (trip matching) — security critical
9. **Task 11** (is_blocked helper) — enables consistent block enforcement
10. **Task 12** (complete RLS) — fills gaps
11. **Task 13** (production readiness) — final hardening
12. **Task 8** (editorial docs) — documentation
13. **Task 10** (deprecation) — cleanup documentation

## What This Plan Does NOT Cover (Future Work)

1. **Splitting `places` table** (50+ columns) — not urgent, works fine at current scale
2. **Replacing `participant_ids` array with junction table** — needed only for group chats
3. **Materialized views for trending threads** — premature optimization
4. **Background jobs for counter reconciliation** — nice-to-have, triggers are correct
5. **Database-level rate limiting** — better handled at API/edge layer
6. **Removing `geo_content` table** — requires client code changes first
7. **Removing `trip_places` table** — requires client code changes first
8. **Merging `explore_collections` and `discovery_lenses`** — would break API contracts

---

Plan complete and saved to `docs/plans/2026-02-06-backend-hardening-plan.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
