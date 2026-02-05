# Travelers Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a women-first, safety-conscious social discovery page where solo women travelers can find each other, connect with mutual consent, and chat only after acceptance — all within Sola's premium, calm design language.

**Architecture:** Replace the existing flat profile list in `app/(tabs)/home/index.tsx` with a sectioned feed (Nearby → Shared Interests → Suggested). Add a `connection_requests` table to enforce mutual consent before chat. Extend the existing `profiles` table with location consent fields. Reuse the existing `blocked_users`, `user_reports`, `conversations`, and `messages` tables. Seed 5 realistic demo profiles for the SEA region.

**Tech Stack:** React Native, Expo Router, Supabase (Postgres + RLS + Realtime), React Query, expo-location (optional consent), expo-linear-gradient

---

## Current State Assessment

### What exists now
- **`app/(tabs)/home/index.tsx`** — Flat FlatList of all profiles, no sections, no connection model. Has "Travelers near you" title but no actual location filtering. Direct `Message` button on profile page opens DM immediately.
- **`app/(tabs)/home/user/[id].tsx`** — User profile detail page with bio, interests, saved places, and a "Message" button that creates a conversation immediately (no consent gate).
- **`app/(tabs)/home/dm/index.tsx`** — Conversation list (already works, keep as-is).
- **`app/(tabs)/home/dm/[id].tsx`** — Chat thread with block/report (already works, keep as-is).
- **`data/types.ts`** — `Profile` interface with `interests: string[]`, `travelStyle`, `currentCityId`, `currentCityName`, `homeCountryIso2`.
- **`data/api.ts`** — `getProfilesPaginated`, `blockUser`, `reportUser`, `getOrCreateConversation`.
- **`supabase/migrations/00005_blocks_and_reports.sql`** — `blocked_users` and `user_reports` tables already exist with RLS.
- **DB schema** — `conversations` uses `participant_ids uuid[]`, `messages` has sender/text/read. No connection request model exists.

### What needs to change
1. **New table: `connection_requests`** — mutual consent before chat
2. **New columns on `profiles`**: `location_sharing_enabled`, `location_lat`, `location_lng`, `location_city_name`, `location_updated_at`, `nationality` (optional)
3. **New API functions**: connection CRUD, location-aware profile queries, demo seed data
4. **Rewrite `home/index.tsx`**: sectioned feed with Nearby / Shared Interests / Suggested
5. **Rewrite `home/user/[id].tsx`**: replace "Message" with "Connect" button, show connection status
6. **New screen: `home/connections.tsx`**: pending requests inbox
7. **Gate chat**: only allow `getOrCreateConversation` between connected users

---

## Task 1: Database Migration — Connection Requests Table

**Files:**
- Create: `supabase/migrations/20260205_connection_requests.sql`

**Step 1: Write the migration**

```sql
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
```

**Step 2: Verify SQL is valid by reading it back**

Read the file, confirm syntax.

**Step 3: Commit**

```bash
git add supabase/migrations/20260205_connection_requests.sql
git commit -m "feat: add connection_requests table with mutual consent model"
```

---

## Task 2: Database Migration — Profile Location & Nationality Fields

**Files:**
- Create: `supabase/migrations/20260205_profile_location_fields.sql`

**Step 1: Write the migration**

```sql
-- Add optional location sharing and nationality to profiles
alter table profiles
  add column if not exists location_sharing_enabled boolean default false,
  add column if not exists location_lat double precision,
  add column if not exists location_lng double precision,
  add column if not exists location_city_name text,
  add column if not exists location_country_name text,
  add column if not exists location_updated_at timestamptz,
  add column if not exists nationality text,
  add column if not exists is_discoverable boolean default true;

-- Index for location-based queries (coarse, city-level)
create index if not exists idx_profiles_location
  on profiles(location_city_name)
  where location_sharing_enabled = true and is_discoverable = true;

-- Index for interest-based matching
create index if not exists idx_profiles_interests
  on profiles using gin(interests)
  where is_discoverable = true;
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260205_profile_location_fields.sql
git commit -m "feat: add location sharing and nationality fields to profiles"
```

---

## Task 3: Database Migration — Seed Demo Traveler Profiles

**Files:**
- Create: `supabase/migrations/20260205_seed_demo_travelers.sql`

**Step 1: Write the seed migration**

```sql
-- Seed 5 realistic demo traveler profiles for testing
-- These use fixed UUIDs so they can be referenced and cleaned up
-- Marked with travel_style = 'demo_seed' for easy identification

-- Note: These profiles reference auth.users, so in dev we insert placeholder auth rows.
-- In production, these would be created through the app's signup flow.

-- First, insert placeholder auth users (dev only — safe to skip in prod)
-- We use the profiles table directly since it already has the trigger relationship

insert into profiles (id, first_name, bio, avatar_url, home_country_iso2, home_country_name, nationality, interests, travel_style, current_city_name, location_city_name, location_country_name, location_sharing_enabled, is_discoverable, is_online)
values
  (
    '00000000-0000-0000-0000-000000000d01',
    'Aisha',
    'Documentary filmmaker exploring stories across Southeast Asia. Love early mornings at temples and late-night street food.',
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop',
    'KE', 'Kenya', 'Kenyan',
    ARRAY['photography', 'street food', 'temples', 'filmmaking'],
    'demo_seed',
    'Chiang Mai', 'Chiang Mai', 'Thailand', true, true, false
  ),
  (
    '00000000-0000-0000-0000-000000000d02',
    'Mei',
    'Software engineer on a sabbatical. Working from cafes, learning to surf, and reading too many books.',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    'TW', 'Taiwan', 'Taiwanese',
    ARRAY['coworking', 'surfing', 'reading', 'yoga'],
    'demo_seed',
    'Canggu', 'Canggu', 'Indonesia', true, true, false
  ),
  (
    '00000000-0000-0000-0000-000000000d03',
    'Sofia',
    'Architect who trades blueprints for backpacks every few months. Obsessed with local ceramics and quiet cafes.',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    'CO', 'Colombia', 'Colombian',
    ARRAY['architecture', 'ceramics', 'cafes', 'hiking'],
    'demo_seed',
    'Hanoi', 'Hanoi', 'Vietnam', true, true, false
  ),
  (
    '00000000-0000-0000-0000-000000000d04',
    'Priya',
    'Medical researcher taking a gap year. Interested in traditional medicine, night markets, and making friends over chai.',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
    'IN', 'India', 'Indian',
    ARRAY['wellness', 'night markets', 'cooking', 'meditation'],
    'demo_seed',
    'Chiang Mai', 'Chiang Mai', 'Thailand', true, true, false
  ),
  (
    '00000000-0000-0000-0000-000000000d05',
    'Emma',
    'Former teacher, now a full-time traveler. Writing a book about women-owned businesses in Asia.',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    'NZ', 'New Zealand', 'New Zealander',
    ARRAY['writing', 'social impact', 'street food', 'diving'],
    'demo_seed',
    'Siargao', 'Siargao', 'Philippines', true, true, false
  )
on conflict (id) do nothing;
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260205_seed_demo_travelers.sql
git commit -m "feat: seed 5 realistic demo traveler profiles for testing"
```

---

## Task 4: TypeScript Types — Connection Request & Profile Extensions

**Files:**
- Modify: `data/types.ts`

**Step 1: Add ConnectionRequest type and extend Profile**

Add after the `Profile` interface:

```typescript
export interface ConnectionRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  context: string | null;
  createdAt: string;
  respondedAt: string | null;
}

export type ConnectionStatus = 'none' | 'pending_sent' | 'pending_received' | 'connected';
```

Extend the `Profile` interface with the new fields:

```typescript
  // Add these fields to the existing Profile interface:
  locationSharingEnabled: boolean;
  locationLat: number | null;
  locationLng: number | null;
  locationCityName: string | null;
  locationCountryName: string | null;
  locationUpdatedAt: string | null;
  nationality: string | null;
  isDiscoverable: boolean;
```

**Step 2: Commit**

```bash
git add data/types.ts
git commit -m "feat: add ConnectionRequest type and location fields to Profile"
```

---

## Task 5: API Layer — Connection Request Functions

**Files:**
- Modify: `data/api.ts`

**Step 1: Add connection request API functions**

Add these functions to `data/api.ts`:

```typescript
// ---------------------------------------------------------------------------
// Connection Requests
// ---------------------------------------------------------------------------

export async function sendConnectionRequest(
  senderId: string,
  receiverId: string,
  context?: string
): Promise<ConnectionRequest> {
  const { data, error } = await supabase
    .from('connection_requests')
    .insert({ sender_id: senderId, receiver_id: receiverId, context })
    .select()
    .single();
  if (error) throw error;
  return mapConnectionRequest(data);
}

export async function respondToConnectionRequest(
  requestId: string,
  status: 'accepted' | 'declined'
): Promise<void> {
  const { error } = await supabase
    .from('connection_requests')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', requestId);
  if (error) throw error;
}

export async function withdrawConnectionRequest(requestId: string): Promise<void> {
  const { error } = await supabase
    .from('connection_requests')
    .delete()
    .eq('id', requestId);
  if (error) throw error;
}

export async function getConnectionRequests(
  userId: string,
  direction: 'received' | 'sent'
): Promise<ConnectionRequest[]> {
  const column = direction === 'received' ? 'receiver_id' : 'sender_id';
  const { data, error } = await supabase
    .from('connection_requests')
    .select('*')
    .eq(column, userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapConnectionRequest);
}

export async function getConnectedUserIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('connection_requests')
    .select('sender_id, receiver_id')
    .eq('status', 'accepted')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
  if (error) throw error;
  return (data ?? []).map((r) =>
    r.sender_id === userId ? r.receiver_id : r.sender_id
  );
}

export async function getConnectionStatus(
  userId: string,
  otherUserId: string
): Promise<ConnectionStatus> {
  const { data, error } = await supabase
    .from('connection_requests')
    .select('*')
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
    )
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return 'none';
  if (data.status === 'accepted') return 'connected';
  if (data.status === 'pending' && data.sender_id === userId) return 'pending_sent';
  if (data.status === 'pending' && data.receiver_id === userId) return 'pending_received';
  return 'none';
}

function mapConnectionRequest(row: any): ConnectionRequest {
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    status: row.status,
    context: row.context,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
  };
}
```

**Step 2: Add import for ConnectionRequest and ConnectionStatus types at top of file**

**Step 3: Commit**

```bash
git add data/api.ts
git commit -m "feat: add connection request API functions"
```

---

## Task 6: API Layer — Discovery Query Functions

**Files:**
- Modify: `data/api.ts`

**Step 1: Add discovery-oriented profile query functions**

```typescript
// ---------------------------------------------------------------------------
// Traveler Discovery
// ---------------------------------------------------------------------------

/** Travelers in the same city (location_city_name match), excluding self, blocked, non-discoverable */
export async function getNearbyTravelers(
  userId: string,
  cityName: string,
  blockedIds: string[],
  limit: number = 10
): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('location_city_name', cityName)
    .eq('location_sharing_enabled', true)
    .eq('is_discoverable', true)
    .not('id', 'in', `(${[userId, ...blockedIds].join(',')})`)
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapProfile);
}

/** Travelers in the same country */
export async function getTravelersInCountry(
  userId: string,
  countryName: string,
  blockedIds: string[],
  limit: number = 10
): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('location_country_name', countryName)
    .eq('location_sharing_enabled', true)
    .eq('is_discoverable', true)
    .not('id', 'in', `(${[userId, ...blockedIds].join(',')})`)
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapProfile);
}

/** Travelers who share at least one interest with the user */
export async function getTravelersWithSharedInterests(
  userId: string,
  userInterests: string[],
  blockedIds: string[],
  limit: number = 10
): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_discoverable', true)
    .overlaps('interests', userInterests)
    .not('id', 'in', `(${[userId, ...blockedIds].join(',')})`)
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapProfile);
}

/** Suggested travelers — editorially weighted: has location, has interests, not in other sections */
export async function getSuggestedTravelers(
  userId: string,
  excludeIds: string[],
  blockedIds: string[],
  limit: number = 6
): Promise<Profile[]> {
  const allExcluded = [...new Set([userId, ...excludeIds, ...blockedIds])];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_discoverable', true)
    .not('id', 'in', `(${allExcluded.join(',')})`)
    .not('interests', 'eq', '{}')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapProfile);
}

/** Update user's location (called when they grant permission or manually set) */
export async function updateUserLocation(
  userId: string,
  location: {
    lat?: number;
    lng?: number;
    cityName?: string;
    countryName?: string;
    sharingEnabled: boolean;
  }
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      location_lat: location.lat ?? null,
      location_lng: location.lng ?? null,
      location_city_name: location.cityName ?? null,
      location_country_name: location.countryName ?? null,
      location_sharing_enabled: location.sharingEnabled,
      location_updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
  if (error) throw error;
}
```

**Step 2: Ensure `mapProfile` maps the new fields**

Update the existing `mapProfile` function (or the profile select mapping) to include:

```typescript
locationSharingEnabled: row.location_sharing_enabled ?? false,
locationLat: row.location_lat ?? null,
locationLng: row.location_lng ?? null,
locationCityName: row.location_city_name ?? null,
locationCountryName: row.location_country_name ?? null,
locationUpdatedAt: row.location_updated_at ?? null,
nationality: row.nationality ?? null,
isDiscoverable: row.is_discoverable ?? true,
```

**Step 3: Commit**

```bash
git add data/api.ts
git commit -m "feat: add traveler discovery query functions"
```

---

## Task 7: Location Consent Hook

**Files:**
- Create: `hooks/useLocationConsent.ts`

**Step 1: Write the hook**

```typescript
import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { updateUserLocation } from '@/data/api';

interface LocationResult {
  lat: number;
  lng: number;
  cityName: string | null;
  countryName: string | null;
}

export function useLocationConsent(userId: string | null) {
  const [locationGranted, setLocationGranted] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(async (): Promise<LocationResult | null> => {
    if (!userId) return null;
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationGranted(false);
        setLoading(false);
        return null;
      }
      setLocationGranted(true);
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low, // City-level only
      });

      // Reverse geocode to get city name
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      const result: LocationResult = {
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        cityName: geo?.city ?? geo?.subregion ?? null,
        countryName: geo?.country ?? null,
      };

      // Persist to profile
      await updateUserLocation(userId, {
        lat: result.lat,
        lng: result.lng,
        cityName: result.cityName ?? undefined,
        countryName: result.countryName ?? undefined,
        sharingEnabled: true,
      });

      return result;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const disableLocation = useCallback(async () => {
    if (!userId) return;
    await updateUserLocation(userId, { sharingEnabled: false });
    setLocationGranted(false);
  }, [userId]);

  return { locationGranted, loading, requestLocation, disableLocation };
}
```

**Step 2: Verify expo-location is already in package.json**

Check `package.json` — if not present, install with `npx expo install expo-location`.

**Step 3: Commit**

```bash
git add hooks/useLocationConsent.ts
git commit -m "feat: add useLocationConsent hook with city-level precision"
```

---

## Task 8: Travelers Feed Hook

**Files:**
- Create: `data/travelers/useTravelersFeed.ts`

**Step 1: Write the feed data hook**

```typescript
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import {
  getBlockedUserIds,
  getProfileById,
  getNearbyTravelers,
  getTravelersInCountry,
  getTravelersWithSharedInterests,
  getSuggestedTravelers,
  getConnectionRequests,
} from '@/data/api';
import type { Profile, ConnectionRequest } from '@/data/types';

export interface TravelersFeedData {
  nearby: Profile[];
  sharedInterests: Profile[];
  suggested: Profile[];
  pendingReceived: ConnectionRequest[];
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
  const countryName = userProfile?.locationCountryName;
  const interests = userProfile?.interests ?? [];

  const nearbyQuery = useQuery({
    queryKey: ['travelers', 'nearby', userId, cityName],
    queryFn: () => getNearbyTravelers(userId!, cityName!, blocked),
    enabled: !!userId && !!cityName,
    staleTime: 60_000,
  });

  const countryQuery = useQuery({
    queryKey: ['travelers', 'country', userId, countryName],
    queryFn: () => getTravelersInCountry(userId!, countryName!, blocked),
    enabled: !!userId && !!countryName && !cityName, // Fallback when no city
    staleTime: 60_000,
  });

  const interestsQuery = useQuery({
    queryKey: ['travelers', 'interests', userId, interests.join(',')],
    queryFn: () => getTravelersWithSharedInterests(userId!, interests, blocked),
    enabled: !!userId && interests.length > 0,
    staleTime: 60_000,
  });

  const nearbyIds = (nearbyQuery.data ?? countryQuery.data ?? []).map((p) => p.id);
  const interestsIds = (interestsQuery.data ?? []).map((p) => p.id);
  const excludeFromSuggested = [...nearbyIds, ...interestsIds];

  const suggestedQuery = useQuery({
    queryKey: ['travelers', 'suggested', userId, excludeFromSuggested.join(',')],
    queryFn: () => getSuggestedTravelers(userId!, excludeFromSuggested, blocked),
    enabled: !!userId,
    staleTime: 60_000,
  });

  const pendingQuery = useQuery({
    queryKey: ['travelers', 'pending', userId],
    queryFn: () => getConnectionRequests(userId!, 'received'),
    enabled: !!userId,
    staleTime: 30_000,
  });

  const isLoading = nearbyQuery.isLoading || interestsQuery.isLoading || suggestedQuery.isLoading;
  const error = nearbyQuery.error ?? interestsQuery.error ?? suggestedQuery.error ?? null;

  return {
    nearby: nearbyQuery.data ?? countryQuery.data ?? [],
    sharedInterests: interestsQuery.data ?? [],
    suggested: suggestedQuery.data ?? [],
    pendingReceived: pendingQuery.data ?? [],
    userProfile,
    isLoading,
    error: error as Error | null,
    refetch: () => {
      nearbyQuery.refetch();
      countryQuery.refetch();
      interestsQuery.refetch();
      suggestedQuery.refetch();
      pendingQuery.refetch();
    },
  };
}
```

**Step 2: Commit**

```bash
git add data/travelers/useTravelersFeed.ts
git commit -m "feat: add useTravelersFeed hook for sectioned discovery"
```

---

## Task 9: Traveler Card Component (Redesign)

**Files:**
- Modify: `components/TravelerCard.tsx` (rewrite)

**Step 1: Rewrite TravelerCard with calm, premium design**

Replace the full content of `components/TravelerCard.tsx`:

```tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import { getImageUrl } from '@/lib/image';
import type { Profile, ConnectionStatus } from '@/data/types';

interface TravelerCardProps {
  profile: Profile;
  connectionStatus: ConnectionStatus;
  sharedInterests?: string[];
  contextLabel?: string; // e.g. "Same city", "Both in Hanoi"
  onPress: () => void;
  onConnect: () => void;
}

export default function TravelerCard({
  profile,
  connectionStatus,
  sharedInterests = [],
  contextLabel,
  onPress,
  onConnect,
}: TravelerCardProps) {
  const displayInterests = sharedInterests.length > 0
    ? sharedInterests.slice(0, 4)
    : profile.interests.slice(0, 4);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {profile.avatarUrl ? (
            <Image
              source={{ uri: getImageUrl(profile.avatarUrl, { width: 112, height: 112 }) ?? undefined }}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Feather name="user" size={22} color={colors.textMuted} />
            </View>
          )}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{profile.firstName}</Text>
          {(profile.locationCityName || profile.nationality) && (
            <Text style={styles.location}>
              {profile.locationCityName
                ? profile.locationCityName
                : profile.homeCountryName}
              {profile.nationality ? ` · ${profile.nationality}` : ''}
            </Text>
          )}
          {contextLabel && (
            <Text style={styles.contextLabel}>{contextLabel}</Text>
          )}
        </View>
      </View>

      {profile.bio && (
        <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>
      )}

      {displayInterests.length > 0 && (
        <View style={styles.tags}>
          {displayInterests.map((interest) => (
            <View
              key={interest}
              style={[
                styles.tag,
                sharedInterests.includes(interest) && styles.tagShared,
              ]}
            >
              <Text
                style={[
                  styles.tagText,
                  sharedInterests.includes(interest) && styles.tagTextShared,
                ]}
              >
                {interest}
              </Text>
            </View>
          ))}
        </View>
      )}

      {connectionStatus === 'none' && (
        <Pressable
          style={styles.connectButton}
          onPress={(e) => {
            e.stopPropagation();
            onConnect();
          }}
        >
          <Feather name="user-plus" size={14} color={colors.orange} />
          <Text style={styles.connectButtonText}>Connect</Text>
        </Pressable>
      )}
      {connectionStatus === 'pending_sent' && (
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>Request sent</Text>
        </View>
      )}
      {connectionStatus === 'connected' && (
        <View style={[styles.statusPill, styles.statusPillConnected]}>
          <Feather name="check" size={12} color={colors.greenSoft} />
          <Text style={[styles.statusPillText, styles.statusPillTextConnected]}>Connected</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  location: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  contextLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
    marginTop: 2,
  },
  bio: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.md,
  },
  tag: {
    backgroundColor: colors.neutralFill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  tagShared: {
    backgroundColor: colors.orangeFill,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  tagTextShared: {
    color: colors.orange,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: radius.button,
  },
  connectButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.orange,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.neutralFill,
  },
  statusPillConnected: {
    backgroundColor: colors.greenFill,
  },
  statusPillText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  statusPillTextConnected: {
    color: colors.greenSoft,
  },
});
```

**Step 2: Commit**

```bash
git add components/TravelerCard.tsx
git commit -m "feat: redesign TravelerCard with connection status and shared interests"
```

---

## Task 10: Location Consent Banner Component

**Files:**
- Create: `components/travelers/LocationConsentBanner.tsx`

**Step 1: Write the component**

```tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

interface LocationConsentBannerProps {
  onEnable: () => void;
  onDismiss: () => void;
  loading: boolean;
}

export default function LocationConsentBanner({
  onEnable,
  onDismiss,
  loading,
}: LocationConsentBannerProps) {
  return (
    <View style={styles.banner}>
      <View style={styles.iconWrap}>
        <Feather name="map-pin" size={20} color={colors.orange} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>Find travelers near you</Text>
        <Text style={styles.description}>
          Share your approximate location to see women in your area. Only your city is shown — never your exact position.
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={[styles.enableButton, loading && { opacity: 0.6 }]}
          onPress={onEnable}
          disabled={loading}
        >
          <Text style={styles.enableButtonText}>
            {loading ? 'Finding...' : 'Enable'}
          </Text>
        </Pressable>
        <Pressable onPress={onDismiss} hitSlop={8}>
          <Text style={styles.dismissText}>Not now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  textWrap: {
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  enableButton: {
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.button,
  },
  enableButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.background,
  },
  dismissText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
});
```

**Step 2: Commit**

```bash
git add components/travelers/LocationConsentBanner.tsx
git commit -m "feat: add LocationConsentBanner with gentle location permission request"
```

---

## Task 11: Pending Connections Banner Component

**Files:**
- Create: `components/travelers/PendingConnectionsBanner.tsx`

**Step 1: Write the component**

```tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface PendingConnectionsBannerProps {
  count: number;
  onPress: () => void;
}

export default function PendingConnectionsBanner({ count, onPress }: PendingConnectionsBannerProps) {
  if (count === 0) return null;

  return (
    <Pressable style={styles.banner} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Feather name="users" size={16} color={colors.orange} />
      </View>
      <Text style={styles.text}>
        {count === 1
          ? '1 traveler wants to connect'
          : `${count} travelers want to connect`}
      </Text>
      <Feather name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
```

**Step 2: Commit**

```bash
git add components/travelers/PendingConnectionsBanner.tsx
git commit -m "feat: add PendingConnectionsBanner component"
```

---

## Task 12: Connection Requests Screen

**Files:**
- Create: `app/(tabs)/home/connections.tsx`

**Step 1: Write the pending connections screen**

This screen shows incoming connection requests with Accept/Decline actions. Each request card shows the sender's name, shared interests, and the connection context (e.g. "You're both in Hanoi").

```tsx
import { useCallback } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import { useQueryClient } from '@tanstack/react-query';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import {
  getConnectionRequests,
  getProfileById,
  respondToConnectionRequest,
} from '@/data/api';
import { getImageUrl } from '@/lib/image';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import type { ConnectionRequest } from '@/data/types';

export default function ConnectionsScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const posthog = usePostHog();
  const queryClient = useQueryClient();

  const { data: requests, loading, refetch } = useData(
    () => (userId ? getConnectionRequests(userId, 'received') : Promise.resolve([])),
    [userId],
  );

  const handleRespond = useCallback(
    async (requestId: string, status: 'accepted' | 'declined') => {
      try {
        await respondToConnectionRequest(requestId, status);
        posthog.capture('connection_responded', { request_id: requestId, status });
        queryClient.invalidateQueries({ queryKey: ['travelers'] });
        refetch();
      } catch {
        Alert.alert('Error', 'Could not respond. Please try again.');
      }
    },
    [posthog, queryClient, refetch],
  );

  return (
    <AppScreen>
      <AppHeader
        title="Connection requests"
        leftComponent={
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </Pressable>
        }
      />
      <FlatList
        data={requests ?? []}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="inbox" size={36} color={colors.textMuted} />
            <Text style={styles.emptyText}>No pending requests</Text>
          </View>
        }
        renderItem={({ item }) => (
          <RequestCard
            request={item}
            onAccept={() => handleRespond(item.id, 'accepted')}
            onDecline={() => handleRespond(item.id, 'declined')}
          />
        )}
      />
    </AppScreen>
  );
}

function RequestCard({
  request,
  onAccept,
  onDecline,
}: {
  request: ConnectionRequest;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const { data: sender } = useData(
    () => getProfileById(request.senderId),
    [request.senderId],
  );
  const router = useRouter();

  if (!sender) return null;

  return (
    <View style={styles.card}>
      <Pressable
        style={styles.cardTop}
        onPress={() => router.push(`/home/user/${sender.id}`)}
      >
        {sender.avatarUrl ? (
          <Image
            source={{ uri: getImageUrl(sender.avatarUrl, { width: 96, height: 96 }) ?? undefined }}
            style={styles.avatar}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Feather name="user" size={20} color={colors.textMuted} />
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.name}>{sender.firstName}</Text>
          {request.context && (
            <Text style={styles.context}>{request.context}</Text>
          )}
          {sender.interests.length > 0 && (
            <View style={styles.tags}>
              {sender.interests.slice(0, 3).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Pressable>
      <View style={styles.actions}>
        <Pressable style={styles.acceptButton} onPress={onAccept}>
          <Text style={styles.acceptText}>Accept</Text>
        </Pressable>
        <Pressable style={styles.declineButton} onPress={onDecline}>
          <Text style={styles.declineText}>Decline</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  context: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
    marginTop: 2,
  },
  tags: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  tag: {
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.orange,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  acceptButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.orange,
    borderRadius: radius.button,
  },
  acceptText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.background,
  },
  declineButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.button,
  },
  declineText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
});
```

**Step 2: Commit**

```bash
git add app/(tabs)/home/connections.tsx
git commit -m "feat: add connection requests screen with accept/decline flow"
```

---

## Task 13: Rewrite Travelers Page (Home Index)

**Files:**
- Modify: `app/(tabs)/home/index.tsx` (full rewrite)

**Step 1: Rewrite the travelers feed with sections**

Replace the entire content of `app/(tabs)/home/index.tsx` with a sectioned SectionList that renders:
1. Location consent banner (if location not yet shared)
2. Pending connections banner (if any)
3. "Travelers near you" section (or "Travelers in [country]" fallback)
4. "Shared interests" section
5. "Suggested connections" section
6. Empty state per section

Key implementation details:
- Use `useTravelersFeed()` hook for data
- Use `useLocationConsent()` for location flow
- Use `SectionList` with section headers for the 3 discovery sections
- Each card uses the redesigned `TravelerCard` with `connectionStatus`
- Track connection status per card using `getConnectionStatus` called within the card
- "Connect" button calls `sendConnectionRequest` with appropriate context
- PostHog analytics for section views, connect taps, location consent

The screen should maintain the existing header pattern (Sola logo left, inbox icon right).

```tsx
// Pseudocode structure — full implementation in the task
<AppScreen>
  <AppHeader logo + inbox />
  <SectionList
    ListHeaderComponent={
      <>
        {!locationEnabled && <LocationConsentBanner />}
        <PendingConnectionsBanner count={pending.length} />
      </>
    }
    sections={[
      { title: nearby.length > 0 ? 'Travelers near you' : 'Popular travelers', data: nearby },
      { title: 'Shared interests', data: sharedInterests },
      { title: 'Suggested connections', data: suggested },
    ].filter(s => s.data.length > 0)}
    renderSectionHeader={({ section }) => <SectionHeader ... />}
    renderItem={({ item }) => <TravelerCard ... />}
  />
</AppScreen>
```

**Step 2: Commit**

```bash
git add app/(tabs)/home/index.tsx
git commit -m "feat: rewrite Travelers page with sectioned discovery feed"
```

---

## Task 14: Rewrite User Profile Screen with Connection Gate

**Files:**
- Modify: `app/(tabs)/home/user/[id].tsx`

**Step 1: Add connection status and gate messaging behind it**

Changes to the existing profile screen:
- Remove direct "Message" button
- Add connection status display:
  - `none` → "Connect" button (orange outline)
  - `pending_sent` → "Request sent" (disabled, gray)
  - `pending_received` → "Accept" / "Decline" buttons
  - `connected` → "Message" button (opens DM, as before)
- Add block/report to a "..." menu on the profile screen (not just in chat)
- Remove online indicator dot
- Show shared interests highlighted in orange vs regular interests in gray

Key changes:
- Use `getConnectionStatus(userId, profileId)` to determine state
- "Connect" calls `sendConnectionRequest` with context derived from shared location or interests
- "Accept" calls `respondToConnectionRequest(requestId, 'accepted')` then enables chat
- "Message" (only for connected) calls existing `getOrCreateConversation`

**Step 2: Commit**

```bash
git add app/(tabs)/home/user/[id].tsx
git commit -m "feat: gate messaging behind mutual connection acceptance"
```

---

## Task 15: Section Header Component

**Files:**
- Create: `components/travelers/SectionHeader.tsx`

**Step 1: Write the section header**

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/design';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export default function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
});
```

**Step 2: Commit**

```bash
git add components/travelers/SectionHeader.tsx
git commit -m "feat: add SectionHeader component for travelers feed"
```

---

## Task 16: Wire Connection Context Generation

**Files:**
- Create: `data/travelers/connectionContext.ts`

**Step 1: Write context string generator**

```typescript
import type { Profile } from '@/data/types';

/**
 * Generate a human-readable context string for why two travelers might connect.
 * Used in connection requests and suggestion cards.
 */
export function getConnectionContext(
  currentUser: Profile,
  otherUser: Profile
): string | undefined {
  // Same city
  if (
    currentUser.locationCityName &&
    otherUser.locationCityName &&
    currentUser.locationCityName === otherUser.locationCityName
  ) {
    return `You're both in ${currentUser.locationCityName}`;
  }

  // Same country
  if (
    currentUser.locationCountryName &&
    otherUser.locationCountryName &&
    currentUser.locationCountryName === otherUser.locationCountryName
  ) {
    return `You're both in ${currentUser.locationCountryName}`;
  }

  // Shared interests
  const shared = currentUser.interests.filter((i) =>
    otherUser.interests.includes(i)
  );
  if (shared.length > 0) {
    return shared.length === 1
      ? `You both enjoy ${shared[0]}`
      : `You both enjoy ${shared[0]} and ${shared[1]}`;
  }

  return undefined;
}

/**
 * Find interests shared between two profiles.
 */
export function getSharedInterests(
  currentUser: Profile,
  otherUser: Profile
): string[] {
  return currentUser.interests.filter((i) => otherUser.interests.includes(i));
}
```

**Step 2: Commit**

```bash
git add data/travelers/connectionContext.ts
git commit -m "feat: add connection context generator for traveler suggestions"
```

---

## Task 17: Gate getOrCreateConversation Behind Connection Status

**Files:**
- Modify: `data/api.ts`

**Step 1: Add a guarded version of getOrCreateConversation**

Add a new function that checks connection status before creating a conversation:

```typescript
/**
 * Only create/open a conversation between connected users.
 * Throws if users are not mutually connected.
 */
export async function getOrCreateConversationGuarded(
  userId: string,
  otherUserId: string
): Promise<string> {
  const status = await getConnectionStatus(userId, otherUserId);
  if (status !== 'connected') {
    throw new Error('You must be connected to message this traveler.');
  }
  return getOrCreateConversation(userId, otherUserId);
}
```

**Step 2: Update `app/(tabs)/home/user/[id].tsx` to use guarded version**

Replace `getOrCreateConversation` with `getOrCreateConversationGuarded` in the profile screen.

**Step 3: Commit**

```bash
git add data/api.ts app/(tabs)/home/user/[id].tsx
git commit -m "feat: gate conversation creation behind mutual connection status"
```

---

## Task 18: Verify expo-location Dependency

**Files:**
- Check: `package.json`

**Step 1: Check if expo-location is installed**

Run: `grep expo-location package.json`

**Step 2: If not installed, install it**

Run: `npx expo install expo-location`

**Step 3: Commit if package.json changed**

```bash
git add package.json package-lock.json
git commit -m "chore: add expo-location dependency for traveler discovery"
```

---

## Task 19: TypeScript Compilation Check

**Files:**
- All modified files

**Step 1: Run TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|hooks/)' | head -30`

(Filter out pre-existing errors from `scripts/` and `supabase/functions/`)

**Step 2: Fix any type errors in our new code**

**Step 3: Commit fixes if any**

```bash
git add -A
git commit -m "fix: resolve TypeScript errors in travelers feature"
```

---

## Task 20: Integration Test — Full Flow Verification

**Step 1: Verify the app compiles**

Run: `npx expo start --no-dev --minify` (or just `npx tsc --noEmit`)

**Step 2: Manual verification checklist**

- [ ] Home tab renders with sectioned feed
- [ ] Location consent banner appears for new users
- [ ] Demo profiles appear in feed sections
- [ ] Tapping "Connect" on a card creates a connection request
- [ ] Pending connections banner shows count
- [ ] Connection requests screen shows incoming requests
- [ ] Accepting a request enables chat
- [ ] Declining a request removes it
- [ ] User profile shows correct connection status
- [ ] "Message" button only appears for connected users
- [ ] Block/report still works from chat screen

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete Travelers page with discovery, connections, and consent"
```

---

## Architecture Summary

### Page Structure (Travelers tab)
```
┌─────────────────────────────────┐
│  [Sola logo]           [inbox]  │ ← AppHeader
├─────────────────────────────────┤
│  ┌─ Location consent banner ──┐ │ ← Only if location not shared
│  │  Find travelers near you   │ │
│  │  [Enable]  Not now         │ │
│  └────────────────────────────┘ │
│                                 │
│  ┌─ Pending connections ──────┐ │ ← Only if count > 0
│  │  2 travelers want to       │ │
│  │  connect              →    │ │
│  └────────────────────────────┘ │
│                                 │
│  TRAVELERS NEAR YOU             │ ← Section 1
│  Women in your area             │
│  ┌─────────────────────────┐   │
│  │ [avatar] Aisha          │   │
│  │ Chiang Mai · Kenyan     │   │
│  │ You're both in CM       │   │
│  │ [photography] [temples] │   │
│  │      [ Connect ]        │   │
│  └─────────────────────────┘   │
│                                 │
│  SHARED INTERESTS               │ ← Section 2
│  Travelers who enjoy similar    │
│  ┌─────────────────────────┐   │
│  │ [avatar] Mei            │   │
│  │ Canggu · Taiwanese      │   │
│  │ You both enjoy surfing   │   │
│  │ [surfing] [yoga]        │   │
│  │      [ Connect ]        │   │
│  └─────────────────────────┘   │
│                                 │
│  SUGGESTED CONNECTIONS          │ ← Section 3
│  You might want to meet         │
│  ┌─────────────────────────┐   │
│  │ [avatar] Emma           │   │
│  │ Siargao · New Zealander │   │
│  │ [writing] [diving]      │   │
│  │      [ Connect ]        │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

### Connection Flow
```
User A                              User B
  │                                    │
  ├─ Taps "Connect" ─────────────────►│
  │  (status: pending_sent)           │ (status: pending_received)
  │                                    │
  │                                    ├─ Sees "1 traveler wants to connect"
  │                                    │
  │                                    ├─ Taps banner → connections screen
  │                                    │
  │                    ┌───────────────┤
  │                    │  Accept  │    │
  │                    └──────────┘    │
  │                                    │
  │◄──── Both see "Connected" ────────►│
  │                                    │
  │◄──── Chat now available ──────────►│
```

### Safety & Consent
- **Location**: City-level only, opt-in with clear explanation, dismissable
- **Discovery**: `is_discoverable` flag, blocked users filtered server-side via RLS
- **Connection**: Mutual consent required — no messaging without acceptance
- **Chat**: Text only (no media for MVP), block/report in every conversation
- **Privacy**: No last name, no exact distance, no online status on cards, no contact details
- **Blocking**: Immediate, bidirectional hiding, persists across all discovery queries
- **Reporting**: Creates server-side record, immediately hides users from each other

### Demo Profiles
| Name  | From        | Currently In | Interests                                    |
|-------|-------------|-------------|----------------------------------------------|
| Aisha | Kenya       | Chiang Mai  | photography, street food, temples, filmmaking |
| Mei   | Taiwan      | Canggu      | coworking, surfing, reading, yoga            |
| Sofia | Colombia    | Hanoi       | architecture, ceramics, cafes, hiking        |
| Priya | India       | Chiang Mai  | wellness, night markets, cooking, meditation |
| Emma  | New Zealand | Siargao     | writing, social impact, street food, diving  |
