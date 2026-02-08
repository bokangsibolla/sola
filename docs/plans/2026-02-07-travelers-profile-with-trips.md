# Travelers Profile with Trips — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the Travelers screen crash and build a traveler profile that uses trips as the center of social context — safety-first credibility layer + serendipity-driven trip overlap discovery.

**Architecture:** The profile screen (`app/(tabs)/home/user/[id].tsx`) gets expanded with trips, visited countries, and credibility stats. All trip data reads from the existing `trips` + `trip_stops` tables with new RLS policies for cross-user visibility. A new `useTravelerProfile` hook orchestrates all data fetching. No new database tables — everything derives from existing schema.

**Tech Stack:** React Native / Expo Router, Supabase (RLS policies), React Query, existing design system (`constants/design.ts`)

---

## Task 1: Fix the "iterator method is not callable" crash

**Files:**
- Modify: `app/(tabs)/home/user/[id].tsx:195-207`

**What's broken:** Two `useData` hooks (lines 203, 207) are called *after* a conditional early return (`if (!profile) return` at line 195). This violates React's Rules of Hooks — React requires hooks to execute in the same order on every render. When `profile` is null on first render, those hooks don't run; when profile loads, React sees a different hook count and the internal hook state array gets out of sync, crashing with "iterator method is not callable." Additionally, the `countryFlag()` function (line 380) uses `[...iso2.toUpperCase()]` which crashes if `iso2` is null/undefined.

**Step 1: Move conditional hooks above all early returns**

In `app/(tabs)/home/user/[id].tsx`, find the hooks at lines 203-207 that are after the early return:

```tsx
// BEFORE (broken — hooks after conditional return)
if (!profile) {
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.notFound}>User not found</Text>
    </View>
  );
}

const { data: currentCity } = useData(
  () => profile.currentCityId ? getCityById(profile.currentCityId) : Promise.resolve(null),
  [profile.currentCityId],
);
const { data: savedPlaces } = useData(() => getSavedPlaces(profile.id), [profile.id]);
```

Move them above the `if (!profile)` check, next to the other hooks (after line 67), using conditional fetchers:

```tsx
// AFTER (hooks always called in same order)
const { data: currentCity } = useData(
  () => (profile?.currentCityId ? getCityById(profile.currentCityId) : Promise.resolve(null)),
  [profile?.currentCityId],
);
const { data: savedPlaces } = useData(
  () => (profile ? getSavedPlaces(profile.id) : Promise.resolve([])),
  [profile?.id],
);

if (loading) return <LoadingScreen />;
if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;
if (!profile) {
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.notFound}>User not found</Text>
    </View>
  );
}
```

**Step 2: Fix countryFlag to handle null/undefined**

In the same file, find the `countryFlag` function (line 379):

```tsx
// BEFORE
function countryFlag(iso2: string): string {
  return [...iso2.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('');
}
```

Replace with the existing `getFlag` from helpers (already handles the same logic, and we should reuse it):

```tsx
// AFTER — import getFlag from helpers at the top of the file
import { getFlag } from '@/data/trips/helpers';
```

Then replace all calls to `countryFlag(...)` with `getFlag(...)` in the JSX. Also guard where it's called:

```tsx
{profile.homeCountryIso2 ? getFlag(profile.homeCountryIso2) + ' ' : ''}
```

**Step 3: Add array safety guards in data layer**

In `data/travelers/connectionContext.ts`, the `getSharedInterests` function already guards with `?? []`. Verify this is consistent. In `data/travelers/useTravelersFeed.ts`, verify line 42:

```tsx
const interests = userProfile?.interests ?? [];
```

This is already safe. No changes needed here.

In `data/api.ts`, the `.not('id', 'in', ...)` calls build a parenthesized list. If `excluded` were somehow empty (it shouldn't be — userId is always first), the PostgREST filter `()` would be malformed. Add a guard at the top of each traveler query function:

```tsx
// At the top of getNearbyTravelers, getTravelersInCountry,
// getTravelersWithSharedInterests, getSuggestedTravelers:
const excluded = [userId, ...blockedIds].filter(Boolean);
if (excluded.length === 0) return [];
```

**Step 4: Verify no "Rendered more hooks" error**

Run the app, navigate to Travelers tab, tap a profile. Confirm:
- No crash
- Profile loads with avatar, name, interests
- Back navigation works
- SectionList on Travelers tab renders without errors

**Step 5: Commit**

```bash
git add app/\(tabs\)/home/user/\[id\].tsx data/api.ts
git commit -m "fix: move hooks above conditional return in traveler profile, fix iterator crash"
```

---

## Task 2: Add RLS policies for cross-user trip and stop reads

**Files:**
- Create: `supabase/migrations/20260207_public_trip_access_rls.sql`

**Context:** Currently, trips and trip_stops have RLS policies that only allow the owner to read. The existing "Public trips are visible for matching" policy (in `20260206_106_harden_trip_matching.sql`) requires `matching_opt_in = true`. We need a broader policy for profile viewing that respects `privacy_level`.

**Step 1: Write the migration**

Create `supabase/migrations/20260207_public_trip_access_rls.sql`:

```sql
-- ============================================================
-- PUBLIC TRIP ACCESS FOR TRAVELER PROFILES
-- Allows authenticated users to view other users' non-private trips
-- for display on traveler profile screens.
--
-- Privacy model:
--   'public'  → visible to all authenticated users
--   'friends' → visible to connected users (accepted connection request)
--   'private' → visible only to trip owner (existing policy)
--
-- These policies combine with existing owner policies via OR semantics.
-- ============================================================

-- Trips: allow reading public trips
DROP POLICY IF EXISTS "Public trips visible on profiles" ON trips;
CREATE POLICY "Public trips visible on profiles"
  ON trips FOR SELECT
  USING (
    privacy_level = 'public'
    AND user_id != auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE blocker_id = auth.uid() AND blocked_id = trips.user_id
    )
  );

-- Trips: allow reading friends-level trips if connected
DROP POLICY IF EXISTS "Friends trips visible to connections" ON trips;
CREATE POLICY "Friends trips visible to connections"
  ON trips FOR SELECT
  USING (
    privacy_level = 'friends'
    AND user_id != auth.uid()
    AND EXISTS (
      SELECT 1 FROM connection_requests
      WHERE status = 'accepted'
        AND (
          (sender_id = auth.uid() AND receiver_id = trips.user_id)
          OR (sender_id = trips.user_id AND receiver_id = auth.uid())
        )
    )
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE blocker_id = auth.uid() AND blocked_id = trips.user_id
    )
  );

-- Trip stops: allow reading stops for visible trips
-- (Relies on the trips policies above — if you can see the trip, you can see its stops)
DROP POLICY IF EXISTS "Trip stops visible for accessible trips" ON trip_stops;
CREATE POLICY "Trip stops visible for accessible trips"
  ON trip_stops FOR SELECT
  USING (
    trip_id IN (
      SELECT id FROM trips
      WHERE (
        privacy_level = 'public'
        OR (
          privacy_level = 'friends'
          AND EXISTS (
            SELECT 1 FROM connection_requests
            WHERE status = 'accepted'
              AND (
                (sender_id = auth.uid() AND receiver_id = trips.user_id)
                OR (sender_id = trips.user_id AND receiver_id = auth.uid())
              )
          )
        )
      )
      AND NOT EXISTS (
        SELECT 1 FROM blocked_users
        WHERE blocker_id = auth.uid() AND blocked_id = trips.user_id
      )
    )
  );
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260207_public_trip_access_rls.sql
git commit -m "feat: add RLS policies for cross-user trip reads on traveler profiles"
```

---

## Task 3: Add API functions for public trip data

**Files:**
- Modify: `data/trips/tripApi.ts` (add 2 new exports at the bottom)
- No new files needed

**Step 1: Add `getPublicTripsGrouped` function**

Append to `data/trips/tripApi.ts`, after the existing `getConnectedProfiles` function:

```tsx
// ── Public Trip Reads (for traveler profiles) ────────────────

export async function getPublicTripsGrouped(
  targetUserId: string,
): Promise<GroupedTrips> {
  // RLS handles privacy filtering — only public/friends trips
  // that the current authenticated user is allowed to see will be returned
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', targetUserId)
    .neq('privacy_level', 'private')
    .order('arriving', { ascending: true, nullsFirst: false });
  if (error) throw error;

  const trips = rowsToCamel<TripFull>(data ?? []);

  // Fetch stops for all accessible trips
  const tripIds = trips.map((t) => t.id);
  if (tripIds.length === 0) return { current: null, upcoming: [], past: [] };

  const { data: stopsData } = await supabase
    .from('trip_stops')
    .select('*')
    .in('trip_id', tripIds)
    .order('stop_order', { ascending: true });
  const allStops = rowsToCamel<TripStop>(stopsData ?? []);

  const stopsMap = new Map<string, TripStop[]>();
  for (const stop of allStops) {
    const arr = stopsMap.get(stop.tripId) || [];
    arr.push(stop);
    stopsMap.set(stop.tripId, arr);
  }

  const withStops: TripWithStops[] = trips.map((t) => ({
    ...t,
    stops: stopsMap.get(t.id) || [],
  }));

  let current: TripWithStops | null = null;
  const upcoming: TripWithStops[] = [];
  const past: TripWithStops[] = [];

  for (const trip of withStops) {
    if (trip.status === 'active') {
      current = trip;
    } else if (trip.status === 'completed') {
      past.push(trip);
    } else if (trip.status === 'planned') {
      upcoming.push(trip);
    }
    // Skip 'draft' — drafts are never shown on profiles
  }

  past.sort((a, b) => (b.leaving ?? '').localeCompare(a.leaving ?? ''));

  return { current, upcoming, past };
}
```

**Step 2: Add `getVisitedCountries` function**

Append to `data/trips/tripApi.ts`:

```tsx
export interface VisitedCountry {
  countryIso2: string;
  countryName: string;
  tripCount: number;
}

export async function getVisitedCountries(
  targetUserId: string,
): Promise<VisitedCountry[]> {
  // Get completed, non-private trips (RLS handles privacy)
  const { data: tripsData, error } = await supabase
    .from('trips')
    .select('id')
    .eq('user_id', targetUserId)
    .eq('status', 'completed')
    .neq('privacy_level', 'private');
  if (error) throw error;

  const tripIds = (tripsData ?? []).map((t: { id: string }) => t.id);
  if (tripIds.length === 0) return [];

  // Get all stops for those trips
  const { data: stopsData } = await supabase
    .from('trip_stops')
    .select('country_iso2, trip_id')
    .in('trip_id', tripIds);

  if (!stopsData || stopsData.length === 0) return [];

  // Group by country, count unique trips
  const countryMap = new Map<string, Set<string>>();
  for (const stop of stopsData) {
    const iso = stop.country_iso2;
    const existing = countryMap.get(iso) || new Set<string>();
    existing.add(stop.trip_id);
    countryMap.set(iso, existing);
  }

  // Resolve country names from the countries table
  const iso2s = [...countryMap.keys()];
  const { data: countriesData } = await supabase
    .from('countries')
    .select('iso2, name')
    .in('iso2', iso2s);

  const nameMap = new Map<string, string>();
  for (const c of countriesData ?? []) {
    nameMap.set(c.iso2, c.name);
  }

  const result: VisitedCountry[] = iso2s.map((iso) => ({
    countryIso2: iso,
    countryName: nameMap.get(iso) ?? iso,
    tripCount: countryMap.get(iso)?.size ?? 0,
  }));

  // Sort by trip count descending (most visited first)
  result.sort((a, b) => b.tripCount - a.tripCount);
  return result;
}
```

**Step 3: Add the necessary imports at the top of tripApi.ts**

The file already imports `rowsToCamel` and `toCamel` from `@/data/api`, and the trip types. No new imports needed — `VisitedCountry` is defined inline. Export it from the file.

**Step 4: Commit**

```bash
git add data/trips/tripApi.ts
git commit -m "feat: add getPublicTripsGrouped and getVisitedCountries API functions"
```

---

## Task 4: Create the `useTravelerProfile` hook

**Files:**
- Create: `data/travelers/useTravelerProfile.ts`

**Step 1: Create the hook**

Create `data/travelers/useTravelerProfile.ts`:

```tsx
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import {
  getProfileById,
  getConnectionStatus,
  getConnectionRequests,
} from '@/data/api';
import {
  getPublicTripsGrouped,
  getVisitedCountries,
} from '@/data/trips/tripApi';
import type { VisitedCountry } from '@/data/trips/tripApi';
import { getConnectionContext, getSharedInterests } from './connectionContext';
import type { Profile, ConnectionStatus, ConnectionRequest } from '@/data/types';
import type { GroupedTrips } from '@/data/trips/types';

export interface TravelerProfileData {
  profile: Profile | null;
  userProfile: Profile | null;
  connectionStatus: ConnectionStatus;
  incomingRequest: ConnectionRequest | undefined;
  sharedInterests: string[];
  contextLabel: string | undefined;
  trips: GroupedTrips;
  visitedCountries: VisitedCountry[];
  totalTripCount: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTravelerProfile(targetUserId: string | undefined): TravelerProfileData {
  const { userId } = useAuth();

  // Profile data
  const { data: profile, loading: profileLoading, error: profileError, refetch: refetchProfile } = useData(
    () => (targetUserId ? getProfileById(targetUserId) : Promise.resolve(null)),
    [targetUserId],
  );

  const { data: userProfile } = useData(
    () => (userId ? getProfileById(userId) : Promise.resolve(null)),
    [userId],
  );

  // Connection status
  const { data: fetchedStatus, refetch: refetchStatus } = useData(
    () => (userId && targetUserId
      ? getConnectionStatus(userId, targetUserId)
      : Promise.resolve('none' as ConnectionStatus)),
    [userId, targetUserId],
  );

  // Pending requests (for accept/decline)
  const { data: pendingRequests } = useData(
    () => (userId ? getConnectionRequests(userId, 'received') : Promise.resolve([])),
    [userId],
  );

  const connectionStatus = fetchedStatus ?? 'none';
  const incomingRequest = (pendingRequests ?? []).find((r) => r.senderId === targetUserId);

  // Trips (respects RLS — only public/friends trips returned)
  const tripsQuery = useQuery({
    queryKey: ['travelerProfile', 'trips', targetUserId],
    queryFn: () => getPublicTripsGrouped(targetUserId!),
    enabled: !!targetUserId,
    staleTime: 60_000,
  });

  // Visited countries
  const countriesQuery = useQuery({
    queryKey: ['travelerProfile', 'countries', targetUserId],
    queryFn: () => getVisitedCountries(targetUserId!),
    enabled: !!targetUserId,
    staleTime: 60_000,
  });

  // Derived
  const sharedInterests = profile && userProfile
    ? getSharedInterests(userProfile, profile)
    : [];
  const contextLabel = profile && userProfile
    ? getConnectionContext(userProfile, profile)
    : undefined;

  const trips = tripsQuery.data ?? { current: null, upcoming: [], past: [] };
  const totalTripCount =
    (trips.current ? 1 : 0) + trips.upcoming.length + trips.past.length;

  const isLoading = profileLoading || tripsQuery.isLoading;
  const error = profileError ?? (tripsQuery.error as Error | null);

  return {
    profile: profile ?? null,
    userProfile: userProfile ?? null,
    connectionStatus,
    incomingRequest,
    sharedInterests,
    contextLabel,
    trips,
    visitedCountries: countriesQuery.data ?? [],
    totalTripCount,
    isLoading,
    error,
    refetch: () => {
      refetchProfile();
      refetchStatus();
      tripsQuery.refetch();
      countriesQuery.refetch();
    },
  };
}
```

**Step 2: Commit**

```bash
git add data/travelers/useTravelerProfile.ts
git commit -m "feat: add useTravelerProfile hook with trips and visited countries"
```

---

## Task 5: Create the `CredibilityStats` component

**Files:**
- Create: `components/travelers/CredibilityStats.tsx`

**Step 1: Create the component**

Create `components/travelers/CredibilityStats.tsx`:

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing } from '@/constants/design';

interface CredibilityStatsProps {
  countriesCount: number;
  tripCount: number;
  memberSince: string; // ISO date string (profile.createdAt)
}

export default function CredibilityStats({
  countriesCount,
  tripCount,
  memberSince,
}: CredibilityStatsProps) {
  const year = new Date(memberSince).getFullYear();

  // Don't render if there's nothing to show
  if (countriesCount === 0 && tripCount === 0) return null;

  const stats: { icon: React.ComponentProps<typeof Feather>['name']; value: string; label: string }[] = [];

  if (countriesCount > 0) {
    stats.push({
      icon: 'globe',
      value: String(countriesCount),
      label: countriesCount === 1 ? 'country' : 'countries',
    });
  }

  if (tripCount > 0) {
    stats.push({
      icon: 'map',
      value: String(tripCount),
      label: tripCount === 1 ? 'trip' : 'trips',
    });
  }

  stats.push({
    icon: 'calendar',
    value: `Since ${year}`,
    label: '',
  });

  return (
    <View style={styles.container}>
      {stats.map((stat, i) => (
        <View key={i} style={styles.stat}>
          <Feather name={stat.icon} size={14} color={colors.textMuted} />
          <Text style={styles.value}>
            {stat.value}
            {stat.label ? <Text style={styles.label}> {stat.label}</Text> : null}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  label: {
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
});
```

**Step 2: Commit**

```bash
git add components/travelers/CredibilityStats.tsx
git commit -m "feat: add CredibilityStats component for traveler profile"
```

---

## Task 6: Create the read-only `ProfileTripCard` component

**Files:**
- Create: `components/travelers/ProfileTripCard.tsx`

**Context:** We need a read-only trip card for viewing someone else's trips. The existing `TripListCard` navigates to `/trips/${trip.id}` which assumes ownership. This component shows the same info without navigation or edit actions, and supports an optional overlap badge.

**Step 1: Create the component**

Create `components/travelers/ProfileTripCard.tsx`:

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { formatDateShort, getFlag, STATUS_COLORS } from '@/data/trips/helpers';
import type { TripStatus, TripWithStops } from '@/data/trips/types';

interface ProfileTripCardProps {
  trip: TripWithStops;
  overlapLabel?: string; // e.g. "You overlap Mar 12-18"
}

export default function ProfileTripCard({ trip, overlapLabel }: ProfileTripCardProps) {
  const flag = getFlag(trip.countryIso2);
  const statusStyle = STATUS_COLORS[trip.status] ?? STATUS_COLORS.draft;
  const stops = trip.stops ?? [];
  const stopsText = stops.length > 1
    ? stops.map((s) => s.cityName || s.countryIso2).join(' \u2192 ')
    : trip.destinationName;

  const dateText = trip.arriving && trip.leaving
    ? `${formatDateShort(trip.arriving)} \u2014 ${formatDateShort(trip.leaving)}`
    : 'Flexible dates';

  return (
    <View style={styles.card}>
      <Text style={styles.flag}>{flag}</Text>
      <View style={styles.textContent}>
        <Text style={styles.title} numberOfLines={1}>
          {trip.title || trip.destinationName}
        </Text>
        <Text style={styles.dates}>{dateText}</Text>
        {stops.length > 1 && (
          <Text style={styles.stops} numberOfLines={1}>{stopsText}</Text>
        )}
        {overlapLabel && (
          <View style={styles.overlapBadge}>
            <Text style={styles.overlapText}>{overlapLabel}</Text>
          </View>
        )}
      </View>
      <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
        <Text style={[styles.statusText, { color: statusStyle.text }]}>
          {statusStyle.label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  flag: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  dates: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  stops: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  overlapBadge: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  overlapText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.orange,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    marginLeft: spacing.sm,
  },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
});
```

**Step 2: Commit**

```bash
git add components/travelers/ProfileTripCard.tsx
git commit -m "feat: add read-only ProfileTripCard for traveler profiles"
```

---

## Task 7: Create the `VisitedCountries` component

**Files:**
- Create: `components/travelers/VisitedCountries.tsx`

**Step 1: Create the component**

Create `components/travelers/VisitedCountries.tsx`:

```tsx
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { getFlag } from '@/data/trips/helpers';
import type { VisitedCountry } from '@/data/trips/tripApi';

interface VisitedCountriesProps {
  countries: VisitedCountry[];
}

const COLLAPSED_COUNT = 5;

export default function VisitedCountries({ countries }: VisitedCountriesProps) {
  const [expanded, setExpanded] = useState(false);

  if (countries.length === 0) return null;

  const visible = expanded ? countries : countries.slice(0, COLLAPSED_COUNT);
  const hasMore = countries.length > COLLAPSED_COUNT;
  const countLabel = countries.length === 1 ? '1 country visited' : `${countries.length} countries visited`;

  return (
    <View style={styles.container}>
      <Text style={styles.headline}>{countLabel}</Text>

      {visible.map((c) => (
        <View key={c.countryIso2} style={styles.row}>
          <Text style={styles.flag}>{getFlag(c.countryIso2)}</Text>
          <Text style={styles.countryName}>{c.countryName}</Text>
          <Text style={styles.tripCount}>
            {c.tripCount} {c.tripCount === 1 ? 'trip' : 'trips'}
          </Text>
        </View>
      ))}

      {hasMore && !expanded && (
        <Pressable
          style={styles.showMore}
          onPress={() => setExpanded(true)}
          hitSlop={8}
        >
          <Text style={styles.showMoreText}>
            Show all {countries.length} countries
          </Text>
          <Feather name="chevron-down" size={14} color={colors.orange} />
        </Pressable>
      )}

      {hasMore && expanded && (
        <Pressable
          style={styles.showMore}
          onPress={() => setExpanded(false)}
          hitSlop={8}
        >
          <Text style={styles.showMoreText}>Show less</Text>
          <Feather name="chevron-up" size={14} color={colors.orange} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  headline: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  flag: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  countryName: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  tripCount: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  showMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  showMoreText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
});
```

**Step 2: Commit**

```bash
git add components/travelers/VisitedCountries.tsx
git commit -m "feat: add VisitedCountries component with count hero and expandable list"
```

---

## Task 8: Rebuild the Traveler Profile screen

**Files:**
- Modify: `app/(tabs)/home/user/[id].tsx` (major rewrite of the screen body)

**Context:** This is the biggest task. We replace the current simple profile with the full layered design: identity header, credibility stats, interests, trips (current hero + upcoming + past), visited countries, and contextual connect bar.

**Step 1: Update imports**

At the top of `app/(tabs)/home/user/[id].tsx`, replace the current imports with:

```tsx
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import { useQueryClient } from '@tanstack/react-query';
import {
  sendConnectionRequest,
  respondToConnectionRequest,
  getOrCreateConversationGuarded,
  blockUser,
  reportUser,
} from '@/data/api';
import { useTravelerProfile } from '@/data/travelers/useTravelerProfile';
import { getFlag } from '@/data/trips/helpers';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import CredibilityStats from '@/components/travelers/CredibilityStats';
import ProfileTripCard from '@/components/travelers/ProfileTripCard';
import VisitedCountries from '@/components/travelers/VisitedCountries';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import { getImageUrl } from '@/lib/image';
import type { ConnectionStatus } from '@/data/types';
```

**Step 2: Replace the component body**

Replace the `UserProfileScreen` function. The key structural changes:
- Use `useTravelerProfile(id)` instead of multiple individual `useData` calls
- All hooks are called unconditionally at the top
- Add `CredibilityStats` below the header
- Add Trips section (current hero + upcoming + past collapsible)
- Add `VisitedCountries` section
- Add contextual secondary text below Connect button
- Keep existing connection actions (connect, accept/decline, message) and more menu (block/report)

The full component body:

```tsx
export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const posthog = usePostHog();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState<ConnectionStatus | null>(null);
  const [showPastTrips, setShowPastTrips] = useState(false);

  const {
    profile,
    userProfile,
    connectionStatus: fetchedStatus,
    incomingRequest,
    sharedInterests: shared,
    contextLabel,
    trips,
    visitedCountries,
    totalTripCount,
    isLoading,
    error,
    refetch,
  } = useTravelerProfile(id);

  const status = localStatus ?? fetchedStatus;

  // --- Action handlers (same as before) ---
  // handleConnect, handleAccept, handleDecline, handleMessage, handleMoreMenu
  // (keep exactly as current implementation, no changes needed)

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;
  if (!profile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>User not found</Text>
      </View>
    );
  }

  const hasTrips = trips.current || trips.upcoming.length > 0 || trips.past.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Nav bar (unchanged) */}
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Pressable onPress={handleMoreMenu} hitSlop={12}>
          <Feather name="more-horizontal" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* ── Identity Layer ── */}
        <View style={styles.profileHeader}>
          {profile.avatarUrl ? (
            <Image
              source={{ uri: getImageUrl(profile.avatarUrl, { width: 192, height: 192 }) ?? undefined }}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Feather name="user" size={36} color={colors.textMuted} />
            </View>
          )}
          <Text style={styles.name}>{profile.firstName}</Text>
          {(profile.homeCountryName || profile.nationality) && (
            <Text style={styles.origin}>
              {profile.homeCountryIso2 ? getFlag(profile.homeCountryIso2) + ' ' : ''}
              {profile.homeCountryName}
              {profile.nationality ? ` \u00b7 ${profile.nationality}` : ''}
            </Text>
          )}
          {profile.locationSharingEnabled && profile.locationCityName && (
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={14} color={colors.orange} />
              <Text style={styles.currentCity}>
                Currently in {profile.locationCityName}
              </Text>
            </View>
          )}
          {contextLabel && (
            <View style={styles.contextBadge}>
              <Text style={styles.contextBadgeText}>{contextLabel}</Text>
            </View>
          )}
        </View>

        {/* ── Credibility Stats ── */}
        <CredibilityStats
          countriesCount={visitedCountries.length}
          tripCount={totalTripCount}
          memberSince={profile.createdAt}
        />

        {/* ── Bio ── */}
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        {/* ── Interests ── */}
        {(profile.interests ?? []).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.tags}>
              {(profile.interests ?? []).map((interest) => (
                <View
                  key={interest}
                  style={[styles.tag, shared.includes(interest) && styles.tagShared]}
                >
                  <Text
                    style={[styles.tagText, shared.includes(interest) && styles.tagTextShared]}
                  >
                    {interest}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── Trips Section ── */}
        {hasTrips && (
          <>
            <Text style={styles.sectionTitle}>Trips</Text>

            {/* Current trip hero */}
            {trips.current && (
              <ProfileTripCard trip={trips.current} />
            )}

            {/* Upcoming trips */}
            {trips.upcoming.map((trip) => (
              <ProfileTripCard key={trip.id} trip={trip} />
            ))}

            {/* Past trips (collapsible) */}
            {trips.past.length > 0 && (
              <>
                <Pressable
                  style={styles.pastHeader}
                  onPress={() => setShowPastTrips(!showPastTrips)}
                  hitSlop={8}
                >
                  <Text style={styles.pastHeaderText}>
                    Past trips ({trips.past.length})
                  </Text>
                  <Feather
                    name={showPastTrips ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.textMuted}
                  />
                </Pressable>
                {showPastTrips && trips.past.map((trip) => (
                  <ProfileTripCard key={trip.id} trip={trip} />
                ))}
              </>
            )}
          </>
        )}

        {/* ── Visited Countries ── */}
        <VisitedCountries countries={visitedCountries} />
      </ScrollView>

      {/* ── Connection Bottom Bar ── */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        {status === 'none' && (
          <View>
            <Pressable
              style={[styles.connectButton, actionLoading && { opacity: 0.6 }]}
              onPress={handleConnect}
              disabled={actionLoading}
            >
              <Feather name="user-plus" size={18} color={colors.background} />
              <Text style={styles.connectButtonText}>Connect</Text>
            </Pressable>
            {contextLabel && (
              <Text style={styles.connectContext}>{contextLabel}</Text>
            )}
          </View>
        )}
        {status === 'pending_sent' && (
          <View style={styles.pendingBar}>
            <Feather name="clock" size={16} color={colors.textMuted} />
            <Text style={styles.pendingText}>Connection request sent</Text>
          </View>
        )}
        {status === 'pending_received' && (
          <View style={styles.respondRow}>
            <Pressable
              style={[styles.acceptButton, actionLoading && { opacity: 0.6 }]}
              onPress={handleAccept}
              disabled={actionLoading}
            >
              <Feather name="check" size={16} color={colors.background} />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </Pressable>
            <Pressable
              style={[styles.declineButton, actionLoading && { opacity: 0.6 }]}
              onPress={handleDecline}
              disabled={actionLoading}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </Pressable>
          </View>
        )}
        {status === 'connected' && (
          <Pressable
            style={[styles.messageButton, actionLoading && { opacity: 0.6 }]}
            onPress={handleMessage}
            disabled={actionLoading}
          >
            <Feather name="message-circle" size={18} color={colors.background} />
            <Text style={styles.messageButtonText}>
              {actionLoading ? 'Opening...' : 'Message'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
```

**Step 3: Add new styles**

Add these to the existing StyleSheet at the bottom (keep all existing styles, add these new ones):

```tsx
  // New styles to add:
  pastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  pastHeaderText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  connectContext: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
```

**Step 4: Remove the old `SavedPlaceCard` component and `countryFlag` function**

These are no longer needed. Delete the `SavedPlaceCard` function (lines 354-377 in the original) and the `countryFlag` function (lines 379-383). Also remove the now-unused imports: `getSavedPlaces`, `getPlaceById`, `getPlaceFirstImage`, `getCityById` from `@/data/api`.

**Step 5: Verify end-to-end**

Run the app:
1. Navigate to Travelers tab
2. Tap a traveler card → profile screen opens
3. Verify: avatar, name, origin, credibility stats, interests
4. Verify: trips section shows if the traveler has public/friends trips
5. Verify: visited countries section shows count + expandable list
6. Verify: connect button has contextual text
7. Verify: back navigation works
8. Verify: no console errors, no "Rendered more hooks" warnings

**Step 6: Commit**

```bash
git add app/\(tabs\)/home/user/\[id\].tsx
git commit -m "feat: rebuild traveler profile with trips, visited countries, and credibility stats"
```

---

## Task 9: Add overlap badge detection

**Files:**
- Modify: `data/travelers/useTravelerProfile.ts` (add overlap query)
- Modify: `app/(tabs)/home/user/[id].tsx` (pass overlap labels to ProfileTripCard)

**Step 1: Add overlap detection to the hook**

In `data/travelers/useTravelerProfile.ts`, add an overlap query. Import `getTripOverlapMatches` from `@/data/trips/tripApi`:

```tsx
import { getTripsGrouped, getTripOverlapMatches } from '@/data/trips/tripApi';
```

Add a query for the viewer's trips and compute overlaps:

```tsx
// Viewer's own trips (to find overlaps)
const viewerTripsQuery = useQuery({
  queryKey: ['travelerProfile', 'viewerTrips', userId],
  queryFn: () => getTripsGrouped(userId!),
  enabled: !!userId,
  staleTime: 60_000,
});

// Compute overlaps between viewer's trips and target's trips
const overlaps = useMemo(() => {
  const map = new Map<string, string>(); // tripId → overlap label
  if (!viewerTripsQuery.data || !tripsQuery.data) return map;

  const viewerTrips = [
    ...(viewerTripsQuery.data.current ? [viewerTripsQuery.data.current] : []),
    ...viewerTripsQuery.data.upcoming,
  ];
  const targetTrips = [
    ...(tripsQuery.data.current ? [tripsQuery.data.current] : []),
    ...tripsQuery.data.upcoming,
  ];

  for (const vt of viewerTrips) {
    for (const tt of targetTrips) {
      // Check country match via stops
      const vStops = vt.stops ?? [];
      const tStops = tt.stops ?? [];
      for (const vs of vStops) {
        for (const ts of tStops) {
          if (vs.countryIso2 === ts.countryIso2 && vs.startDate && vs.endDate && ts.startDate && ts.endDate) {
            const overlapStart = vs.startDate > ts.startDate ? vs.startDate : ts.startDate;
            const overlapEnd = vs.endDate < ts.endDate ? vs.endDate : ts.endDate;
            if (overlapStart <= overlapEnd) {
              const label = `You overlap ${formatDateShort(overlapStart)}\u2013${formatDateShort(overlapEnd)}`;
              map.set(tt.id, label);
            }
          }
        }
      }
    }
  }
  return map;
}, [viewerTripsQuery.data, tripsQuery.data]);
```

Add `import { useMemo } from 'react';` at the top. Add `import { formatDateShort } from '@/data/trips/helpers';`.

Add `overlaps` to the return object:

```tsx
return {
  // ... existing fields ...
  tripOverlaps: overlaps,
};
```

Update the `TravelerProfileData` interface to include:

```tsx
tripOverlaps: Map<string, string>; // tripId → overlap label
```

**Step 2: Wire overlap labels in the profile screen**

In `app/(tabs)/home/user/[id].tsx`, destructure `tripOverlaps` from the hook, then pass to `ProfileTripCard`:

```tsx
{trips.current && (
  <ProfileTripCard
    trip={trips.current}
    overlapLabel={tripOverlaps.get(trips.current.id)}
  />
)}

{trips.upcoming.map((trip) => (
  <ProfileTripCard
    key={trip.id}
    trip={trip}
    overlapLabel={tripOverlaps.get(trip.id)}
  />
))}
```

**Step 3: Commit**

```bash
git add data/travelers/useTravelerProfile.ts app/\(tabs\)/home/user/\[id\].tsx
git commit -m "feat: add trip overlap detection with badges on traveler profile"
```

---

## Task 10: Final verification

**Step 1: TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -20`

Expected: No new errors in our files (ignore pre-existing errors in `scripts/content/geo-content.ts` and `supabase/functions/`).

**Step 2: Full navigation flow test**

1. Open app → Travelers tab loads without crash
2. Tap a traveler card → profile opens with identity header
3. Credibility stats row shows (countries, trips, member since)
4. Interests display with shared highlights
5. Trips section shows current/upcoming/past (if privacy allows)
6. Past trips section is collapsible
7. Visited countries shows bold count + expandable list
8. Connect button shows contextual label
9. Back navigation works cleanly
10. Repeat with a different profile — verify no stale data

**Step 3: Edge case checks**

- Profile with no trips → trips section hidden, visited countries hidden
- Profile with only private trips → trips section hidden (RLS filters them)
- Profile with 0 interests → interests section hidden
- Blocked user → should not appear in traveler feed at all

**Step 4: Final commit**

If any fixes were needed during verification, commit them:

```bash
git commit -m "fix: address verification findings in traveler profile"
```

---

## Summary of all files

**Modified:**
- `app/(tabs)/home/user/[id].tsx` — Fixed hooks bug, rebuilt with trips/countries
- `data/trips/tripApi.ts` — Added `getPublicTripsGrouped`, `getVisitedCountries`
- `data/api.ts` — Array safety guards in traveler queries

**Created:**
- `data/travelers/useTravelerProfile.ts` — Orchestrator hook
- `components/travelers/CredibilityStats.tsx` — Horizontal stats row
- `components/travelers/ProfileTripCard.tsx` — Read-only trip card with overlap badge
- `components/travelers/VisitedCountries.tsx` — Count hero + expandable country list
- `supabase/migrations/20260207_public_trip_access_rls.sql` — Cross-user trip read policies
