# Sola Connect Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Sola Connect — a trip-aware, permission-based discovery and messaging system where travelers find each other through shared destinations, dates, proximity, and interests.

**Architecture:** Rewrite the existing Travelers tab discovery to be trip-gated with tiered matching. Gate profile visibility behind connection status. Add message deletion, block cascade cleanup, and 12-month retention. Enhance discussions with required tags, post types, and trip-aware ranking.

**Tech Stack:** React Native (Expo Router), Supabase (Postgres + RLS + pg_cron), React Query, TypeScript

**Design Doc:** `docs/plans/2026-02-22-sola-connect-design.md`

---

## Phase 1: Foundation (Database + Safety)

### Task 1: Migration — Add columns to existing tables

**Files:**
- Create: `supabase/migrations/20260222_connect_policy_columns.sql`

**Step 1: Write the migration**

```sql
-- Sola Connect policy: new columns for connection messages, message deletion, post types

-- 1. Optional message on connection requests
ALTER TABLE connection_requests ADD COLUMN IF NOT EXISTS message text;

-- 2. Soft-delete for messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;

-- 3. Post type on community threads
ALTER TABLE community_threads ADD COLUMN IF NOT EXISTS post_type text
  CHECK (post_type IS NULL OR post_type IN ('question', 'tip', 'experience', 'safety_alert'));

-- 4. RLS: only sender can mark own messages as deleted
CREATE POLICY "Senders can soft-delete own messages"
  ON messages FOR UPDATE
  USING (auth.uid() = sender_id)
  WITH CHECK (is_deleted = true);
```

**Step 2: Apply the migration**

```bash
PSQL=/opt/homebrew/Cellar/libpq/18.2/bin/psql
source .env
DB_URL="postgresql://postgres.bfyewxgdfkmkviajmfzp:${SUPABASE_DB_PASSWORD}@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
$PSQL "$DB_URL" -f supabase/migrations/20260222_connect_policy_columns.sql
```

Expected: All ALTER/CREATE statements succeed (or "already exists" for re-runs).

**Step 3: Commit**

```bash
git add supabase/migrations/20260222_connect_policy_columns.sql
git commit -m "feat(db): add columns for connect policy — message on requests, soft-delete, post types"
```

---

### Task 2: Migration — block_user_full() RPC function

**Files:**
- Create: `supabase/migrations/20260222_block_user_full.sql`

**Step 1: Write the function**

```sql
-- block_user_full: transactional block + conversation cleanup
-- Per Connect policy: blocking removes connection, deletes conversation + messages immediately

CREATE OR REPLACE FUNCTION block_user_full(
  p_blocker_id uuid,
  p_blocked_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_convo_id uuid;
BEGIN
  -- 1. Insert block (ignore duplicate)
  INSERT INTO blocked_users (blocker_id, blocked_id)
  VALUES (p_blocker_id, p_blocked_id)
  ON CONFLICT (blocker_id, blocked_id) DO NOTHING;

  -- 2. Delete connection requests in both directions
  DELETE FROM connection_requests
  WHERE (sender_id = p_blocker_id AND receiver_id = p_blocked_id)
     OR (sender_id = p_blocked_id AND receiver_id = p_blocker_id);

  -- 3. Find shared conversation
  SELECT id INTO v_convo_id
  FROM conversations
  WHERE participant_ids @> ARRAY[p_blocker_id]
    AND participant_ids @> ARRAY[p_blocked_id]
  LIMIT 1;

  -- 4. Delete conversation data if exists
  IF v_convo_id IS NOT NULL THEN
    DELETE FROM messages WHERE conversation_id = v_convo_id;
    DELETE FROM conversation_read_state WHERE conversation_id = v_convo_id;
    DELETE FROM conversations WHERE id = v_convo_id;
  END IF;
END;
$$;
```

**Step 2: Apply the migration**

```bash
$PSQL "$DB_URL" -f supabase/migrations/20260222_block_user_full.sql
```

Expected: `CREATE FUNCTION` success.

**Step 3: Commit**

```bash
git add supabase/migrations/20260222_block_user_full.sql
git commit -m "feat(db): add block_user_full() RPC for transactional block + conversation cleanup"
```

---

### Task 3: Migration — remove_connection() function

**Files:**
- Create: `supabase/migrations/20260222_remove_connection.sql`

**Step 1: Write the function**

```sql
-- remove_connection: silent connection removal
-- Deletes the accepted connection_request. Conversation stays but becomes
-- inaccessible (getOrCreateConversationGuarded checks connection status).

CREATE OR REPLACE FUNCTION remove_connection(
  p_user_id uuid,
  p_other_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM connection_requests
  WHERE status = 'accepted'
    AND (
      (sender_id = p_user_id AND receiver_id = p_other_id)
      OR (sender_id = p_other_id AND receiver_id = p_user_id)
    );
END;
$$;
```

**Step 2: Apply the migration**

```bash
$PSQL "$DB_URL" -f supabase/migrations/20260222_remove_connection.sql
```

**Step 3: Commit**

```bash
git add supabase/migrations/20260222_remove_connection.sql
git commit -m "feat(db): add remove_connection() RPC for silent connection removal"
```

---

### Task 4: Migration — message retention cron job

**Files:**
- Create: `supabase/migrations/20260222_message_retention_cron.sql`

**Step 1: Write the cron job**

```sql
-- 12-month message retention policy
-- Runs weekly, deletes conversations with no messages for 12+ months
-- Connections remain intact per policy

-- Enable pg_cron if not already (Supabase has it pre-installed)
SELECT cron.schedule(
  'cleanup-stale-conversations',
  '0 3 * * 0',  -- Sunday 3am UTC
  $$
    WITH stale_convos AS (
      SELECT id FROM conversations
      WHERE last_message_at < now() - interval '12 months'
    )
    DELETE FROM messages WHERE conversation_id IN (SELECT id FROM stale_convos);

    WITH stale_convos AS (
      SELECT id FROM conversations
      WHERE last_message_at < now() - interval '12 months'
    )
    DELETE FROM conversation_read_state WHERE conversation_id IN (SELECT id FROM stale_convos);

    DELETE FROM conversations
    WHERE last_message_at < now() - interval '12 months';
  $$
);
```

**Step 2: Apply the migration**

```bash
$PSQL "$DB_URL" -f supabase/migrations/20260222_message_retention_cron.sql
```

Expected: `cron.schedule` returns a job ID.

**Step 3: Commit**

```bash
git add supabase/migrations/20260222_message_retention_cron.sql
git commit -m "feat(db): add 12-month message retention cron job"
```

---

### Task 5: Update API layer — blockUserFull, removeConnection, deleteOwnMessage

**Files:**
- Modify: `data/api.ts` (add 3 new functions near existing block/connection functions)

**Step 1: Add blockUserFull RPC call**

Find the existing `blockUser()` function at ~line 1479. Add the new function AFTER it:

```typescript
/** Block user + delete conversation + remove connection atomically via DB function */
export async function blockUserFull(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await supabase.rpc('block_user_full', {
    p_blocker_id: blockerId,
    p_blocked_id: blockedId,
  });
  if (error) throw error;
}
```

**Step 2: Add removeConnection RPC call**

Find the existing `withdrawConnectionRequest()` function at ~line 2743. Add after it:

```typescript
/** Silently remove an accepted connection. No notification to other user. */
export async function removeConnection(userId: string, otherId: string): Promise<void> {
  const { error } = await supabase.rpc('remove_connection', {
    p_user_id: userId,
    p_other_id: otherId,
  });
  if (error) throw error;
}
```

**Step 3: Add deleteOwnMessage function**

Find the existing `sendMessage()` function at ~line 1447. Add after it:

```typescript
/** Soft-delete own message. Shows "[Message deleted]" placeholder. */
export async function deleteOwnMessage(messageId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ is_deleted: true })
    .eq('id', messageId)
    .eq('sender_id', userId);
  if (error) throw error;
}
```

**Step 4: Add sendConnectionRequestWithMessage — update existing function**

Find `sendConnectionRequest()` at ~line 2718. Add `message` parameter:

Current signature: `sendConnectionRequest(senderId, receiverId, context?)`

Update to accept optional message:

```typescript
export async function sendConnectionRequest(
  senderId: string,
  receiverId: string,
  context?: string,
  message?: string,
): Promise<any> {
  const { data, error } = await supabase
    .from('connection_requests')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      context: context ?? null,
      message: message ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
```

**Step 5: Run type check**

```bash
cd /Users/bokangsibolla/sola_backup/sola && npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)'
```

Expected: No new errors from our changes.

**Step 6: Commit**

```bash
git add data/api.ts
git commit -m "feat(api): add blockUserFull, removeConnection, deleteOwnMessage, message on connect request"
```

---

### Task 6: Update blockUser calls to use blockUserFull

**Files:**
- Modify: `app/(tabs)/travelers/user/[id].tsx` (~line 123-150, handleMoreMenu)
- Modify: `app/(tabs)/travelers/dm/[id].tsx` (~line 105-124, handleBlock)

**Step 1: Update traveler profile block handler**

In `travelers/user/[id].tsx`, find the block handler (inside `handleMoreMenu`). Replace the `blockUser()` call with `blockUserFull()`:

```typescript
// Change import: add blockUserFull
import { blockUserFull } from '@/data/api';

// In handleMoreMenu block case, replace:
//   await blockUser(userId, id);
// With:
    await blockUserFull(userId!, id);
```

**Step 2: Update DM thread block handler**

In `travelers/dm/[id].tsx`, find `handleBlock`. Replace `blockUser()` with `blockUserFull()`:

```typescript
import { blockUserFull } from '@/data/api';

// In handleBlock, replace:
//   await blockUser(userId, otherUserId);
// With:
    await blockUserFull(userId!, otherUserId);
```

**Step 3: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)'
```

**Step 4: Commit**

```bash
git add app/(tabs)/travelers/user/[id].tsx app/(tabs)/travelers/dm/[id].tsx
git commit -m "feat(safety): use blockUserFull for atomic block + conversation cleanup"
```

---

### Task 7: Message deletion UI in DM thread

**Files:**
- Modify: `app/(tabs)/travelers/dm/[id].tsx` (message bubble render + long-press handler)

**Step 1: Add deleteOwnMessage import and handler**

Add to imports:
```typescript
import { deleteOwnMessage } from '@/data/api';
```

Add handler function inside the component:
```typescript
const handleDeleteMessage = useCallback(async (messageId: string) => {
  Alert.alert(
    'Delete message',
    'This message will be replaced with "Message deleted" for both of you.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteOwnMessage(messageId, userId!);
            queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          } catch (err) {
            Alert.alert('Error', 'Could not delete message');
          }
        },
      },
    ],
  );
}, [userId, conversationId, queryClient]);
```

**Step 2: Update message bubble render**

In the message render function, add long-press on own messages and handle `is_deleted`:

```typescript
// In the renderItem for messages FlatList:
const isMe = msg.senderId === userId;
const isDeleted = (msg as any).isDeleted;

// Render deleted placeholder:
if (isDeleted) {
  return (
    <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage, { opacity: 0.5 }]}>
      <Text style={[styles.messageText, { fontStyle: 'italic', color: colors.textSecondary }]}>
        Message deleted
      </Text>
    </View>
  );
}

// For own messages, add onLongPress:
<Pressable
  onLongPress={isMe ? () => handleDeleteMessage(msg.id) : undefined}
  delayLongPress={500}
>
  {/* existing bubble content */}
</Pressable>
```

**Step 3: Update Message type**

In `data/types.ts`, add `isDeleted` to Message interface:

```typescript
// Find the Message interface and add:
isDeleted?: boolean;
```

**Step 4: Update getMessages to include is_deleted**

In `data/api.ts`, the `getMessages()` and `getMessagesPaginated()` functions select `*` from messages, so `is_deleted` is already returned. The `toCamel` utility will convert `is_deleted` → `isDeleted` automatically.

Verify this is the case by checking the select statement.

**Step 5: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)'
```

**Step 6: Commit**

```bash
git add app/(tabs)/travelers/dm/[id].tsx data/types.ts
git commit -m "feat(messaging): add message deletion with soft-delete and [Message deleted] placeholder"
```

---

## Phase 2: Discovery Rewrite

### Task 8: New API functions — trip-aware matching queries

**Files:**
- Modify: `data/api.ts` (add new matching functions)
- Modify: `data/trips/tripApi.ts` (enhance getTripOverlapMatches)

**Step 1: Add getQualifyingTrips function to data/api.ts**

This function checks if the current user has any trip that qualifies for discovery (active/planned with matching_opt_in + is_discoverable profile).

```typescript
/** Get user's trips that qualify for Connect discovery (active/planned + opt-in) */
export async function getQualifyingTrips(userId: string): Promise<{
  trips: any[];
  isDiscoverable: boolean;
}> {
  // Check profile discoverability
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_discoverable')
    .eq('id', userId)
    .single();

  if (!profile?.is_discoverable) {
    return { trips: [], isDiscoverable: false };
  }

  // Get matching-opt-in trips with stops
  const { data: trips } = await supabase
    .from('trips')
    .select('id, status, matching_opt_in, title, destination_name')
    .eq('user_id', userId)
    .eq('matching_opt_in', true)
    .in('status', ['active', 'planned'])
    .order('arriving', { ascending: true });

  return { trips: trips ?? [], isDiscoverable: true };
}
```

**Step 2: Add getTripCityMatches — Tier 1 (same city + overlapping dates)**

```typescript
/** Tier 1: Travelers heading to the same CITY with overlapping dates */
export async function getTripCityMatches(
  userId: string,
  blockedIds: string[],
): Promise<Array<Profile & { overlapCity: string; overlapStart: string; overlapEnd: string }>> {
  const { data, error } = await supabase
    .from('trip_overlap_matches')
    .select('*')
    .eq('my_user_id', userId)
    .not('overlap_city', 'is', null);  // city-level match

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const excluded = new Set([userId, ...blockedIds]);
  const uniqueUserIds = Array.from(
    new Set((data as any[]).filter((m) => !excluded.has(m.their_user_id)).map((m) => m.their_user_id))
  );
  if (uniqueUserIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', uniqueUserIds)
    .eq('is_discoverable', true);

  const profileMap = new Map<string, any>();
  for (const row of profiles ?? []) {
    profileMap.set(row.id, row);
  }

  // Dedupe by user, pick best overlap
  const userBestMatch = new Map<string, any>();
  for (const match of data as any[]) {
    if (!profileMap.has(match.their_user_id)) continue;
    if (!userBestMatch.has(match.their_user_id)) {
      userBestMatch.set(match.their_user_id, match);
    }
  }

  return Array.from(userBestMatch.entries()).map(([uid, match]) => ({
    ...rowToCamel<Profile>(profileMap.get(uid)),
    overlapCity: match.overlap_city,
    overlapStart: match.overlap_start,
    overlapEnd: match.overlap_end,
  }));
}
```

**Step 3: Add getTripCountryMatches — Tier 2 (same country, different city)**

```typescript
/** Tier 2: Travelers in the same COUNTRY with overlapping dates (but different city) */
export async function getTripCountryMatches(
  userId: string,
  cityMatchUserIds: string[],
  blockedIds: string[],
): Promise<Array<Profile & { overlapCountry: string; overlapStart: string; overlapEnd: string }>> {
  const { data, error } = await supabase
    .from('trip_overlap_matches')
    .select('*')
    .eq('my_user_id', userId);

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const excluded = new Set([userId, ...blockedIds, ...cityMatchUserIds]);
  const countryOnlyMatches = (data as any[]).filter(
    (m) => !excluded.has(m.their_user_id)
  );

  const uniqueUserIds = Array.from(
    new Set(countryOnlyMatches.map((m) => m.their_user_id))
  );
  if (uniqueUserIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', uniqueUserIds)
    .eq('is_discoverable', true);

  const profileMap = new Map<string, any>();
  for (const row of profiles ?? []) {
    profileMap.set(row.id, row);
  }

  const userBestMatch = new Map<string, any>();
  for (const match of countryOnlyMatches) {
    if (!profileMap.has(match.their_user_id)) continue;
    if (!userBestMatch.has(match.their_user_id)) {
      userBestMatch.set(match.their_user_id, match);
    }
  }

  return Array.from(userBestMatch.entries()).map(([uid, match]) => ({
    ...rowToCamel<Profile>(profileMap.get(uid)),
    overlapCountry: match.overlap_country,
    overlapStart: match.overlap_start,
    overlapEnd: match.overlap_end,
  }));
}
```

**Step 4: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)'
```

**Step 5: Commit**

```bash
git add data/api.ts
git commit -m "feat(api): add trip-aware matching queries for tiered discovery"
```

---

### Task 9: Rewrite useTravelersFeed hook — trip-gated, tiered matching

**Files:**
- Modify: `data/travelers/useTravelersFeed.ts` (full rewrite)

**Step 1: Rewrite the hook**

Replace the entire contents of `data/travelers/useTravelersFeed.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import {
  getBlockedUserIds,
  getProfileById,
  getQualifyingTrips,
  getTripCityMatches,
  getTripCountryMatches,
  getNearbyTravelers,
  getTravelersWithSharedInterests,
  getConnectionRequests,
  getConnectedUserIds,
} from '@/data/api';
import type { Profile, ConnectionRequest } from '@/data/types';

export interface TravelerMatchSection {
  key: string;
  title: string;
  subtitle?: string;
  data: Profile[];
}

export interface TravelersFeedData {
  /** Whether user has qualifying trips for discovery */
  hasQualifyingTrip: boolean;
  /** Whether user's profile is discoverable */
  isDiscoverable: boolean;
  /** Tiered match sections (only populated when hasQualifyingTrip=true) */
  sections: TravelerMatchSection[];
  /** Connected users for quick messaging in empty state */
  connectedProfiles: Profile[];
  /** Incoming connection requests */
  pendingReceived: ConnectionRequest[];
  /** Current user's profile */
  userProfile: Profile | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTravelersFeed(): TravelersFeedData {
  const { userId } = useAuth();

  const { data: userProfile } = useData(
    () => (userId ? getProfileById(userId) : Promise.resolve(null)),
    [userId],
  );

  const { data: blockedIds } = useData(
    () => (userId ? getBlockedUserIds(userId) : Promise.resolve([])),
    [userId],
  );

  const blocked = blockedIds ?? [];
  const cityName = userProfile?.locationCityName;
  const interests = userProfile?.interests ?? [];

  // Check if user has qualifying trips
  const qualifyingQuery = useQuery({
    queryKey: ['travelers', 'qualifying', userId],
    queryFn: () => getQualifyingTrips(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });

  const hasQualifyingTrip = (qualifyingQuery.data?.trips?.length ?? 0) > 0;
  const isDiscoverable = qualifyingQuery.data?.isDiscoverable ?? false;

  // Tier 1: Same city + overlapping dates
  const cityMatchQuery = useQuery({
    queryKey: ['travelers', 'cityMatch', userId],
    queryFn: () => getTripCityMatches(userId!, blocked),
    enabled: !!userId && hasQualifyingTrip,
    staleTime: 60_000,
  });

  // Tier 2: Same country + overlapping dates (excludes city matches)
  const cityMatchIds = (cityMatchQuery.data ?? []).map((p) => p.id);
  const countryMatchQuery = useQuery({
    queryKey: ['travelers', 'countryMatch', userId, cityMatchIds.join(',')],
    queryFn: () => getTripCountryMatches(userId!, cityMatchIds, blocked),
    enabled: !!userId && hasQualifyingTrip && !cityMatchQuery.isLoading,
    staleTime: 60_000,
  });

  // Tier 3: Nearby right now (only when has qualifying trip)
  const nearbyQuery = useQuery({
    queryKey: ['travelers', 'nearby', userId, cityName],
    queryFn: () => getNearbyTravelers(userId!, cityName!, blocked),
    enabled: !!userId && !!cityName && hasQualifyingTrip,
    staleTime: 60_000,
  });

  // Tier 4: Shared interests (only when has qualifying trip)
  const interestsQuery = useQuery({
    queryKey: ['travelers', 'interests', userId, interests.join(',')],
    queryFn: () => getTravelersWithSharedInterests(userId!, interests, blocked),
    enabled: !!userId && interests.length > 0 && hasQualifyingTrip,
    staleTime: 60_000,
  });

  // Pending connection requests (always)
  const pendingQuery = useQuery({
    queryKey: ['travelers', 'pending', userId],
    queryFn: () => getConnectionRequests(userId!, 'received'),
    enabled: !!userId,
    staleTime: 30_000,
  });

  // Connected users for empty state quick-messaging
  const connectedQuery = useQuery({
    queryKey: ['travelers', 'connected', userId],
    queryFn: async () => {
      const ids = await getConnectedUserIds(userId!);
      if (ids.length === 0) return [];
      const { data } = await (await import('@/lib/supabase')).supabase
        .from('profiles')
        .select('*')
        .in('id', ids);
      const { rowsToCamel } = await import('@/data/api');
      return rowsToCamel<Profile>(data ?? []);
    },
    enabled: !!userId && !hasQualifyingTrip,
    staleTime: 60_000,
  });

  // Build tiered sections
  const sections: TravelerMatchSection[] = [];

  // Deduplicate: track shown user IDs across tiers
  const shownIds = new Set<string>();

  const cityMatches = (cityMatchQuery.data ?? []).filter((p) => !shownIds.has(p.id));
  if (cityMatches.length > 0) {
    const firstCity = (cityMatches[0] as any).overlapCity;
    sections.push({
      key: 'city-match',
      title: `Heading to ${firstCity} too`,
      subtitle: 'Same city, overlapping dates',
      data: cityMatches,
    });
    cityMatches.forEach((p) => shownIds.add(p.id));
  }

  const countryMatches = (countryMatchQuery.data ?? []).filter((p) => !shownIds.has(p.id));
  if (countryMatches.length > 0) {
    const firstCountry = (countryMatches[0] as any).overlapCountry;
    sections.push({
      key: 'country-match',
      title: `Also traveling in ${firstCountry}`,
      subtitle: 'Same country, overlapping dates',
      data: countryMatches,
    });
    countryMatches.forEach((p) => shownIds.add(p.id));
  }

  const nearby = (nearbyQuery.data ?? []).filter((p) => !shownIds.has(p.id));
  if (nearby.length > 0) {
    sections.push({
      key: 'nearby',
      title: 'Nearby right now',
      subtitle: cityName ? `In ${cityName}` : undefined,
      data: nearby,
    });
    nearby.forEach((p) => shownIds.add(p.id));
  }

  const shared = (interestsQuery.data ?? []).filter((p) => !shownIds.has(p.id));
  if (shared.length > 0) {
    sections.push({
      key: 'shared-interests',
      title: 'Similar travel style',
      subtitle: 'Shared interests with date overlap',
      data: shared,
    });
  }

  const isLoading =
    qualifyingQuery.isLoading ||
    (hasQualifyingTrip && (cityMatchQuery.isLoading || nearbyQuery.isLoading || interestsQuery.isLoading));
  const error = qualifyingQuery.error ?? cityMatchQuery.error ?? countryMatchQuery.error ?? nearbyQuery.error ?? interestsQuery.error ?? null;

  return {
    hasQualifyingTrip,
    isDiscoverable,
    sections,
    connectedProfiles: connectedQuery.data ?? [],
    pendingReceived: pendingQuery.data ?? [],
    userProfile: userProfile ?? null,
    isLoading,
    error: error as Error | null,
    refetch: () => {
      qualifyingQuery.refetch();
      cityMatchQuery.refetch();
      countryMatchQuery.refetch();
      nearbyQuery.refetch();
      interestsQuery.refetch();
      pendingQuery.refetch();
      connectedQuery.refetch();
    },
  };
}
```

**Step 2: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)'
```

**Step 3: Commit**

```bash
git add data/travelers/useTravelersFeed.ts
git commit -m "feat(travelers): rewrite feed hook with trip-gated tiered matching"
```

---

### Task 10: Rewrite useTravelerSearch — exact username match only

**Files:**
- Modify: `data/travelers/useTravelerSearch.ts`
- Modify: `data/api.ts` (update `searchTravelersByUsername`)

**Step 1: Update searchTravelersByUsername in api.ts**

Find `searchTravelersByUsername` at ~line 1986. Change `ilike('%${normalized}%')` to exact match:

```typescript
export async function searchTravelersByUsername(
  query: string,
  currentUserId: string,
): Promise<TravelerSearchResult[]> {
  const normalized = query.toLowerCase().trim().replace(/^@/, '');
  if (normalized.length < 1) return [];

  const blockedIds = await getBlockedUserIds(currentUserId);

  let dbQuery = supabase
    .from('profiles')
    .select('id, username, first_name, avatar_url, home_country_name, home_country_iso2, verification_status')
    .neq('id', currentUserId)
    .not('username', 'is', null)
    .eq('username', normalized)  // exact match only
    .limit(1);

  if (blockedIds.length > 0) {
    dbQuery = dbQuery.not('id', 'in', `(${blockedIds.join(',')})`);
  }

  const { data, error } = await dbQuery;
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    username: row.username,
    firstName: row.first_name,
    avatarUrl: row.avatar_url,
    homeCountryName: row.home_country_name,
    homeCountryIso2: row.home_country_iso2,
    verificationStatus: row.verification_status ?? 'unverified',
  }));
}
```

**Step 2: Update useTravelerSearch to use submit-on-enter**

Replace `data/travelers/useTravelerSearch.ts`:

```typescript
import { useState, useCallback } from 'react';
import * as Sentry from '@sentry/react-native';
import { searchTravelersByUsername } from '@/data/api';
import type { TravelerSearchResult } from '@/data/api';

interface UseTravelerSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: TravelerSearchResult[];
  isSearching: boolean;
  search: () => void;  // explicit trigger
  clear: () => void;
}

export function useTravelerSearch(currentUserId: string | undefined): UseTravelerSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TravelerSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim() || !currentUserId) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const data = await searchTravelersByUsername(query, currentUserId);
      setResults(data);
    } catch (err) {
      Sentry.captureException(err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, currentUserId]);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  return { query, setQuery, results, isSearching, search, clear };
}
```

**Step 3: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)'
```

**Step 4: Commit**

```bash
git add data/travelers/useTravelerSearch.ts data/api.ts
git commit -m "feat(search): change traveler search to exact username match only"
```

---

### Task 11: Rewrite Travelers tab UI — trip-gated with tiered sections

**Files:**
- Modify: `app/(tabs)/travelers/index.tsx` (significant rewrite)

**Step 1: Rewrite the screen**

This is the main UI rewrite. The screen now has two modes:

**No qualifying trip**: Search bar + empty state CTA + connected users list
**Has qualifying trip**: Search bar + tiered horizontal sections

Key changes to `app/(tabs)/travelers/index.tsx`:
- Remove the old SectionList with mode-dependent ordering
- Replace with trip-gated rendering
- Update search to use submit-on-enter (no autocomplete)
- Add empty state with "Plan a trip" CTA
- Add connected users quick-message list in empty state
- Render tiered sections as horizontal ScrollViews

The TravelerCardWrapper component stays the same. The section rendering changes to horizontal scrolls per tier.

See design doc Section 2 for the exact UX. Key implementation notes:

- Import new `useTravelersFeed` return shape: `{ hasQualifyingTrip, isDiscoverable, sections, connectedProfiles, pendingReceived, userProfile }`
- Import new `useTravelerSearch` return shape: `{ query, setQuery, results, isSearching, search, clear }`
- Search TextInput uses `onSubmitEditing={search}` and `returnKeyType="search"` instead of debounce
- Remove debounced autocomplete results list
- Render sections from `sections` array (each is a horizontal FlatList of TravelerCards)
- Empty state when `!hasQualifyingTrip`:
  - Image: use existing `solo-canyon-relax.jpg` or similar
  - Title: "Plan a trip to discover travelers heading your way"
  - CTA: "Plan a trip" → `router.push('/(tabs)/trips/new')`
  - Below: connected users as a compact list for quick messaging

**Step 2: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)'
```

**Step 3: Commit**

```bash
git add app/(tabs)/travelers/index.tsx
git commit -m "feat(travelers): rewrite tab with trip-gated discovery and tiered sections"
```

---

## Phase 3: Profile Gating

### Task 12: Gate extended profile behind connection status

**Files:**
- Modify: `app/(tabs)/travelers/user/[id].tsx`

**Step 1: Add visibility gating**

In the profile screen, wrap extended sections based on `connectionStatus`:

```typescript
// After the header section (name, avatar, destination), add gating:
const showExtended = connectionStatus === 'connected';
const showBio = connectionStatus !== 'none'; // bio visible to pending + connected
```

Wrap the following sections in conditionals:

```typescript
{/* Bio — visible to pending + connected */}
{showBio && profile.bio && (
  <Text style={styles.bio}>{profile.bio}</Text>
)}

{/* Interests — visible to connected only */}
{showExtended ? (
  <View style={styles.interestsSection}>
    {/* existing interests rendering */}
  </View>
) : null}

{/* Trips — visible to connected only */}
{showExtended ? (
  <View style={styles.tripsSection}>
    {/* existing trips rendering */}
  </View>
) : null}

{/* Visited Countries — visible to connected only */}
{showExtended ? (
  <View style={styles.countriesSection}>
    {/* existing countries rendering */}
  </View>
) : null}

{/* Locked section prompt for non-connected */}
{!showExtended && (
  <View style={styles.lockedSection}>
    <Ionicons name="lock-closed-outline" size={24} color={colors.textTertiary} />
    <Text style={styles.lockedText}>Connect to see full profile</Text>
  </View>
)}
```

**Step 2: Add lockedSection styles**

```typescript
lockedSection: {
  alignItems: 'center',
  paddingVertical: spacing.xxxl,
  gap: spacing.sm,
},
lockedText: {
  ...fonts.body,
  color: colors.textTertiary,
},
```

**Step 3: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)'
```

**Step 4: Commit**

```bash
git add app/(tabs)/travelers/user/[id].tsx
git commit -m "feat(profile): gate extended profile sections behind mutual connection"
```

---

### Task 13: Add optional message to connection request UI

**Files:**
- Modify: `app/(tabs)/travelers/user/[id].tsx` (connect button handler)
- Modify: `app/(tabs)/travelers/index.tsx` (TravelerCardWrapper connect handler)
- Modify: `app/(tabs)/travelers/connections.tsx` (show message in request card)

**Step 1: Add message modal to profile connect action**

In `travelers/user/[id].tsx`, modify `handleConnect` to show an Alert with text input for optional message:

```typescript
const handleConnect = useCallback(async () => {
  if (!userId) return;
  const verified = await requireVerification();
  if (!verified) return;

  // Show optional message prompt
  Alert.prompt(
    'Send connection request',
    contextLabel ? `${contextLabel}. Add an optional message?` : 'Add an optional message?',
    [
      { text: 'Skip', onPress: () => doConnect(undefined) },
      { text: 'Send', onPress: (msg) => doConnect(msg) },
    ],
    'plain-text',
    '',
    'default',
  );
}, [userId, contextLabel]);

const doConnect = useCallback(async (message?: string) => {
  try {
    setLocalStatus('pending_sent');
    await sendConnectionRequest(userId!, id, contextLabel, message || undefined);
    queryClient.invalidateQueries({ queryKey: ['travelers'] });
  } catch (err) {
    setLocalStatus(undefined);
    Alert.alert('Error', 'Could not send request');
  }
}, [userId, id, contextLabel, queryClient]);
```

Note: `Alert.prompt` is iOS-only. For cross-platform, use a simple modal with TextInput instead. Check if the app is iOS-only (it is per CLAUDE.md — iOS App Store v1 launch). If so, `Alert.prompt` is fine.

**Step 2: Show message in connection request card**

In `travelers/connections.tsx`, in the `RequestCard` component, add message display:

```typescript
// After the context label, add:
{request.message && (
  <Text style={styles.requestMessage} numberOfLines={3}>
    "{request.message}"
  </Text>
)}
```

Add style:
```typescript
requestMessage: {
  ...fonts.bodySmall,
  color: colors.textSecondary,
  fontStyle: 'italic',
  marginTop: spacing.xs,
},
```

**Step 3: Update ConnectionRequest type in data/types.ts**

Add `message` field:
```typescript
// In ConnectionRequest interface:
message?: string;
```

**Step 4: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)'
```

**Step 5: Commit**

```bash
git add app/(tabs)/travelers/user/[id].tsx app/(tabs)/travelers/connections.tsx data/types.ts
git commit -m "feat(connect): add optional message to connection requests"
```

---

### Task 14: Add "Remove connection" option to profile menu

**Files:**
- Modify: `app/(tabs)/travelers/user/[id].tsx` (add to more menu)

**Step 1: Add removeConnection import and menu option**

```typescript
import { removeConnection } from '@/data/api';
```

In `handleMoreMenu`, add a "Remove connection" option when `connectionStatus === 'connected'`:

```typescript
const options = [];
if (connectionStatus === 'connected') {
  options.push({
    text: 'Remove connection',
    onPress: () => {
      Alert.alert(
        'Remove connection',
        'They won\'t be notified. You\'ll lose access to each other\'s full profile and messages.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              await removeConnection(userId!, id);
              queryClient.invalidateQueries({ queryKey: ['travelers'] });
              queryClient.invalidateQueries({ queryKey: ['connections'] });
              setLocalStatus('none');
            },
          },
        ],
      );
    },
  });
}
// Then existing Block and Report options...
```

**Step 2: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)'
```

**Step 3: Commit**

```bash
git add app/(tabs)/travelers/user/[id].tsx
git commit -m "feat(connect): add silent connection removal option"
```

---

## Phase 4: Discussion Enhancements

### Task 15: Required fields + post type in discussion composer

**Files:**
- Modify: `app/(tabs)/discussions/new.tsx`

**Step 1: Add post type selector**

After the topic pills section, add a post type selector. Define post types:

```typescript
const POST_TYPES = [
  { key: 'question', label: 'Question' },
  { key: 'tip', label: 'Tip' },
  { key: 'experience', label: 'Experience' },
  { key: 'safety_alert', label: 'Safety Alert' },
] as const;
```

Add state:
```typescript
const [postType, setPostType] = useState<string | null>(null);
```

Add UI (similar to existing topic pills):
```typescript
<Text style={styles.sectionLabel}>Post type</Text>
<View style={styles.pillRow}>
  {POST_TYPES.map((pt) => (
    <Pressable
      key={pt.key}
      style={[styles.pill, postType === pt.key && styles.pillActive]}
      onPress={() => setPostType(postType === pt.key ? null : pt.key)}
    >
      <Text style={[styles.pillText, postType === pt.key && styles.pillTextActive]}>
        {pt.label}
      </Text>
    </Pressable>
  ))}
</View>
```

**Step 2: Update validation — make destination, topic, post type required**

Change `canSubmit` from:
```typescript
const canSubmit = title.trim().length > 0 && body.trim().length > 0 && !submitting;
```

To:
```typescript
const canSubmit =
  title.trim().length >= 10 &&
  body.trim().length > 0 &&
  (selectedCountryId !== null || selectedCityId !== null) &&
  selectedTopicId !== null &&
  postType !== null &&
  !submitting;
```

**Step 3: Pass post type to createThread**

Update the `createThread` call to include `postType`:

```typescript
// In communityApi.ts createThread function, add post_type to insert
// In new.tsx submit handler, pass postType
```

Update `data/community/communityApi.ts` `createThread` to accept `postType`:

```typescript
export async function createThread(
  userId: string,
  input: {
    title: string;
    body: string;
    countryId?: string;
    cityId?: string;
    topicId?: string;
    postType?: string;
  },
): Promise<string> {
  const { data, error } = await supabase
    .from('community_threads')
    .insert({
      author_id: userId,
      title: input.title,
      body: input.body,
      country_id: input.countryId ?? null,
      city_id: input.cityId ?? null,
      topic_id: input.topicId ?? null,
      post_type: input.postType ?? null,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}
```

**Step 4: Add validation hint text**

Below the Post button or as helper text:

```typescript
{!canSubmit && title.trim().length > 0 && title.trim().length < 10 && (
  <Text style={styles.hintText}>Title must be at least 10 characters</Text>
)}
{!canSubmit && !selectedCountryId && !selectedCityId && (
  <Text style={styles.hintText}>Choose a destination</Text>
)}
{!canSubmit && !selectedTopicId && (
  <Text style={styles.hintText}>Choose a topic</Text>
)}
{!canSubmit && !postType && (
  <Text style={styles.hintText}>Choose a post type</Text>
)}
```

**Step 5: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)'
```

**Step 6: Commit**

```bash
git add app/(tabs)/discussions/new.tsx data/community/communityApi.ts
git commit -m "feat(discussions): add required fields + post type selector to composer"
```

---

### Task 16: Show post type badge on thread cards

**Files:**
- Modify: `app/(tabs)/discussions/index.tsx` (ThreadCard render)

**Step 1: Add post type pill to ThreadCard**

In the thread card subtitle/meta area, add a post type badge if present:

```typescript
{thread.postType && (
  <View style={[styles.metaPill, thread.postType === 'safety_alert' && styles.safetyPill]}>
    <Text style={[styles.metaPillText, thread.postType === 'safety_alert' && styles.safetyPillText]}>
      {POST_TYPE_LABELS[thread.postType]}
    </Text>
  </View>
)}
```

Define labels:
```typescript
const POST_TYPE_LABELS: Record<string, string> = {
  question: 'Question',
  tip: 'Tip',
  experience: 'Experience',
  safety_alert: 'Safety Alert',
};
```

Style the safety alert pill differently (yellow/amber):
```typescript
safetyPill: {
  backgroundColor: colors.yellowFill ?? '#FFF8E1',
},
safetyPillText: {
  color: colors.yellow ?? '#F59E0B',
},
```

**Step 2: Update ThreadWithAuthor type**

In `data/community/communityApi.ts`, ensure `post_type` is selected and mapped to `postType` in the return.

Check if `getThreadFeed()` already selects `*` or specific columns. If specific, add `post_type`. The `toCamel()` utility will handle the mapping.

**Step 3: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)'
```

**Step 4: Commit**

```bash
git add app/(tabs)/discussions/index.tsx data/community/communityApi.ts
git commit -m "feat(discussions): show post type badge on thread cards"
```

---

### Task 17: Trip-aware ranking in discussions feed

**Files:**
- Modify: `data/community/communityApi.ts` (update getThreadFeed)
- Modify: `data/community/useCommunityFeed.ts` (pass trip context)

**Step 1: Add trip-context parameter to getThreadFeed**

Update `getThreadFeed` to accept optional trip context for relevant sort:

```typescript
export async function getThreadFeed(options: {
  sort: 'relevant' | 'new' | 'top';
  topicId?: string;
  countryId?: string;
  cityId?: string;
  searchQuery?: string;
  userId?: string;
  blockedIds?: string[];
  page?: number;
  pageSize?: number;
  // NEW: trip context for ranking
  tripCityIds?: string[];
  tripCountryIds?: string[];
}): Promise<ThreadWithAuthor[]> {
```

In the `relevant` sort branch, when trip context is available:
- First: pinned threads
- Second: threads matching trip city (city_id IN tripCityIds)
- Third: threads matching trip country (country_id IN tripCountryIds)
- Fourth: high helpful_count in last 30 days
- Fifth: recent (last 7 days)
- Sixth: everything else by recency

Implementation approach: Use Supabase's `.order()` with computed columns, or fetch in multiple passes and merge client-side.

Simplest approach for V1: fetch threads and sort client-side based on trip context:

```typescript
if (options.sort === 'relevant' && (options.tripCityIds?.length || options.tripCountryIds?.length)) {
  // Client-side re-rank after fetch
  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

  threads.sort((a, b) => {
    // Pinned always first
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;

    const aCity = options.tripCityIds?.includes(a.cityId ?? '') ? 1 : 0;
    const bCity = options.tripCityIds?.includes(b.cityId ?? '') ? 1 : 0;
    if (aCity !== bCity) return bCity - aCity;

    const aCountry = options.tripCountryIds?.includes(a.countryId ?? '') ? 1 : 0;
    const bCountry = options.tripCountryIds?.includes(b.countryId ?? '') ? 1 : 0;
    if (aCountry !== bCountry) return bCountry - aCountry;

    // Trending score: helpful / age
    const aAge = Math.max(1, (now - new Date(a.createdAt).getTime()) / 3600000);
    const bAge = Math.max(1, (now - new Date(b.createdAt).getTime()) / 3600000);
    const aScore = (a.helpfulCount ?? 0) / aAge;
    const bScore = (b.helpfulCount ?? 0) / bAge;
    return bScore - aScore;
  });
}
```

**Step 2: Update useCommunityFeed to pass trip context**

In `data/community/useCommunityFeed.ts`, fetch user's active trip stops and pass city/country IDs to getThreadFeed:

```typescript
// Get user's active trip context
const { data: tripContext } = useData(
  async () => {
    if (!userId) return null;
    const { getTripsGrouped } = await import('@/data/trips/tripApi');
    const grouped = await getTripsGrouped(userId);
    const activeTrip = grouped.current;
    if (!activeTrip) return null;
    return {
      cityIds: activeTrip.stops.map((s) => s.cityId).filter(Boolean) as string[],
      countryIds: activeTrip.stops.map((s) => s.countryIso2).filter(Boolean) as string[],
    };
  },
  [userId],
);
```

Pass to getThreadFeed:
```typescript
tripCityIds: tripContext?.cityIds,
tripCountryIds: tripContext?.countryIds,
```

**Step 3: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)'
```

**Step 4: Commit**

```bash
git add data/community/communityApi.ts data/community/useCommunityFeed.ts
git commit -m "feat(discussions): add trip-aware ranking to relevant sort"
```

---

## Phase 5: Polish

### Task 18: Export rowsToCamel and rowToCamel from api.ts

**Files:**
- Modify: `data/api.ts`

**Step 1: Check if rowsToCamel/rowToCamel are exported**

The new `useTravelersFeed.ts` dynamically imports these. Verify they're exported. If not, add `export` keyword.

Search for `function rowsToCamel` and `function rowToCamel` in api.ts. Ensure they have `export` prefix.

**Step 2: Commit if changed**

```bash
git add data/api.ts
git commit -m "chore: export rowsToCamel utility"
```

---

### Task 19: Type check full project

**Files:** None (verification only)

**Step 1: Run full type check**

```bash
cd /Users/bokangsibolla/sola_backup/sola && npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -50
```

Expected: No new errors from Connect implementation.

**Step 2: Fix any type errors**

If errors appear, fix them one by one.

**Step 3: Commit fixes**

```bash
git add -A && git commit -m "fix: resolve type errors from Connect implementation"
```

---

### Task 20: Verify all flows work together

**Step 1: Verify DB migrations applied**

```bash
$PSQL "$DB_URL" -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'connection_requests' AND column_name = 'message';"
$PSQL "$DB_URL" -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'is_deleted';"
$PSQL "$DB_URL" -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'community_threads' AND column_name = 'post_type';"
$PSQL "$DB_URL" -c "SELECT proname FROM pg_proc WHERE proname = 'block_user_full';"
$PSQL "$DB_URL" -c "SELECT proname FROM pg_proc WHERE proname = 'remove_connection';"
```

All should return 1 row each.

**Step 2: Verify cron job scheduled**

```bash
$PSQL "$DB_URL" -c "SELECT jobname, schedule FROM cron.job WHERE jobname = 'cleanup-stale-conversations';"
```

Should show the weekly schedule.

**Step 3: Test trip_overlap_matches view**

```bash
$PSQL "$DB_URL" -c "SELECT count(*) FROM trip_overlap_matches;"
```

Should return a number (even if 0 with demo data).

---

### Task 21: Final commit and summary

**Step 1: Run type check one last time**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -20
```

**Step 2: Git log review**

```bash
git log --oneline -20
```

Verify all commits are clean and focused.

---

## File Reference

| File | Action | Task |
|------|--------|------|
| `supabase/migrations/20260222_connect_policy_columns.sql` | Create | 1 |
| `supabase/migrations/20260222_block_user_full.sql` | Create | 2 |
| `supabase/migrations/20260222_remove_connection.sql` | Create | 3 |
| `supabase/migrations/20260222_message_retention_cron.sql` | Create | 4 |
| `data/api.ts` | Modify | 5, 8, 10, 18 |
| `app/(tabs)/travelers/user/[id].tsx` | Modify | 6, 12, 13, 14 |
| `app/(tabs)/travelers/dm/[id].tsx` | Modify | 6, 7 |
| `data/types.ts` | Modify | 7, 13 |
| `data/travelers/useTravelersFeed.ts` | Modify | 9 |
| `data/travelers/useTravelerSearch.ts` | Modify | 10 |
| `app/(tabs)/travelers/index.tsx` | Modify | 11, 13 |
| `app/(tabs)/travelers/connections.tsx` | Modify | 13 |
| `app/(tabs)/discussions/new.tsx` | Modify | 15 |
| `data/community/communityApi.ts` | Modify | 15, 16, 17 |
| `app/(tabs)/discussions/index.tsx` | Modify | 16 |
| `data/community/useCommunityFeed.ts` | Modify | 17 |
