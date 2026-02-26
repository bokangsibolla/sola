# Travelers Feed Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the trip gate from the Travelers tab and build a social discovery feed with proximity-first sections that works whether the user is traveling or at home.

**Architecture:** Replace the trip-gated `useTravelersFeed` hook with a new `useTravelersFeedV2` that runs parallel queries for 6 section types (near you, same country, trip overlap, shared visited countries, same home country, shared interests), deduplicates across sections, and adapts section ordering based on whether the user is traveling or at home. No schema changes — uses existing DB columns and tables.

**Tech Stack:** React Native, React Query (TanStack), Supabase JS client, TypeScript

**Design doc:** `docs/plans/2026-02-25-travelers-feed-redesign.md`

---

### Task 1: Add `getTravelersWithSharedCountries` API function

Add a new query to `data/api.ts` that finds discoverable users who have visited the same countries as the current user, sorted by overlap count.

**Files:**
- Modify: `data/api.ts` (after `getTravelersWithSharedInterests` around line 3105)

**Step 1: Add the function**

Insert after the `getTravelersWithSharedInterests` function (around line 3105):

```typescript
/**
 * Find travelers who have visited the same countries as the user.
 * Returns profiles with an attached `sharedCountryNames` array for context labels.
 * Sorted by overlap count (most shared countries first).
 */
export async function getTravelersWithSharedCountries(
  userId: string,
  userCountryIds: string[],
  blockedIds: string[],
  limit: number = 15,
): Promise<Array<Profile & { sharedCountryNames: string[] }>> {
  if (userCountryIds.length === 0) return [];
  const excluded = [userId].concat(Array.isArray(blockedIds) ? blockedIds : []).filter(Boolean);

  // Find other users who visited any of the same countries
  const { data: matches, error } = await supabase
    .from('user_visited_countries')
    .select('user_id, country_id, countries(name)')
    .in('country_id', userCountryIds)
    .not('user_id', 'in', `(${excluded})`);

  if (error) throw error;
  if (!matches || matches.length === 0) return [];

  // Group by user_id, count overlaps, collect country names
  const userMap = new Map<string, string[]>();
  for (const row of matches as any[]) {
    const uid = row.user_id as string;
    const name = row.countries?.name as string;
    if (!userMap.has(uid)) userMap.set(uid, []);
    if (name) userMap.get(uid)!.push(name);
  }

  // Sort by overlap count descending, take top N
  const sorted = Array.from(userMap.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, limit);

  const userIds = sorted.map(([uid]) => uid);
  if (userIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds)
    .eq('is_discoverable', true);

  if (!profiles) return [];

  // Attach shared country names to each profile
  const countryMap = new Map(sorted);
  return rowsToCamel<Profile>(profiles).map((p) => ({
    ...p,
    sharedCountryNames: countryMap.get(p.id) ?? [],
  }));
}
```

**Step 2: Add `getTravelersFromHomeCountry` function**

Insert right after the previous function:

```typescript
/**
 * Find discoverable travelers from the same home country.
 */
export async function getTravelersFromHomeCountry(
  userId: string,
  countryIso2: string,
  blockedIds: string[],
  limit: number = 15,
): Promise<Profile[]> {
  if (!countryIso2) return [];
  const excluded = [userId].concat(Array.isArray(blockedIds) ? blockedIds : []).filter(Boolean);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('home_country_iso2', countryIso2)
    .eq('is_discoverable', true)
    .not('id', 'in', `(${excluded})`)
    .limit(limit);
  if (error) throw error;
  return rowsToCamel<Profile>(data ?? []);
}
```

**Step 3: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | grep -E '(data/api\.ts)' | head -20`
Expected: No new errors from these additions.

**Step 4: Commit**

```bash
git add data/api.ts
git commit -m "feat(travelers): add shared-countries and home-country API queries"
```

---

### Task 2: Create `useTravelersFeedV2` hook

Create a new feed hook that removes the trip gate and builds context-aware sections.

**Files:**
- Create: `data/travelers/useTravelersFeedV2.ts`

**Step 1: Create the new hook file**

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
  getTravelersInCountry,
  getTravelersWithSharedInterests,
  getTravelersWithSharedCountries,
  getTravelersFromHomeCountry,
  getConnectionRequests,
  getConnectedUserIds,
  getUserVisitedCountries,
  rowsToCamel,
} from '@/data/api';
import { supabase } from '@/lib/supabase';
import type { Profile, ConnectionRequest } from '@/data/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SectionContextType =
  | 'near-you'
  | 'same-country-location'
  | 'trip-overlap'
  | 'shared-countries'
  | 'home-country'
  | 'shared-interests';

export interface TravelerSection {
  key: string;
  title: string;
  subtitle?: string;
  contextType: SectionContextType;
  data: Profile[];
  /** Extra metadata for context labels (e.g. shared country names per user) */
  meta?: Map<string, string[]>;
}

export interface TravelersFeedV2Data {
  sections: TravelerSection[];
  connectedProfiles: Profile[];
  pendingReceived: ConnectionRequest[];
  userProfile: Profile | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTravelersFeedV2(): TravelersFeedV2Data {
  const { userId } = useAuth();

  // ─── Base data (always fetched) ──────────────────────────────
  const { data: userProfile } = useData(
    () => (userId ? getProfileById(userId) : Promise.resolve(null)),
    [userId],
  );

  const { data: blockedIds } = useData(
    () => (userId ? getBlockedUserIds(userId) : Promise.resolve([])),
    [userId],
  );

  const blocked = blockedIds ?? [];
  const locationCity = userProfile?.locationCityName;
  const locationCountry = userProfile?.locationCountryName;
  const homeCountryIso2 = userProfile?.homeCountryIso2;
  const interests = userProfile?.interests ?? [];
  const locationEnabled = userProfile?.locationSharingEnabled ?? false;

  // Determine if user is actively traveling (has location sharing on)
  const isTraveling = locationEnabled && !!locationCity;

  // ─── Check qualifying trips (for trip overlap sections) ──────
  const qualifyingQuery = useQuery({
    queryKey: ['travelers', 'qualifying', userId],
    queryFn: () => getQualifyingTrips(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });
  const hasQualifyingTrip = (qualifyingQuery.data?.trips?.length ?? 0) > 0;

  // ─── Section 1: Near You (same city) ─────────────────────────
  const nearbyQuery = useQuery({
    queryKey: ['travelers', 'v2', 'nearby', userId, locationCity],
    queryFn: () => getNearbyTravelers(userId!, locationCity!, blocked),
    enabled: !!userId && !!locationCity && locationEnabled,
    staleTime: 60_000,
  });

  // ─── Section 2: Also in [Country] (same country, different city) ──
  const sameCountryQuery = useQuery({
    queryKey: ['travelers', 'v2', 'sameCountry', userId, locationCountry],
    queryFn: () => getTravelersInCountry(userId!, locationCountry!, blocked),
    enabled: !!userId && !!locationCountry && locationEnabled,
    staleTime: 60_000,
  });

  // ─── Section 3: Trip Overlap ─────────────────────────────────
  const cityMatchQuery = useQuery({
    queryKey: ['travelers', 'v2', 'tripCity', userId],
    queryFn: () => getTripCityMatches(userId!, blocked),
    enabled: !!userId && hasQualifyingTrip,
    staleTime: 60_000,
  });

  const cityMatchIds = (cityMatchQuery.data ?? []).map((p) => p.id);
  const countryMatchQuery = useQuery({
    queryKey: ['travelers', 'v2', 'tripCountry', userId, cityMatchIds.join(',')],
    queryFn: () => getTripCountryMatches(userId!, cityMatchIds, blocked),
    enabled: !!userId && hasQualifyingTrip && !cityMatchQuery.isLoading,
    staleTime: 60_000,
  });

  // ─── Section 4: Been Where You've Been ───────────────────────
  const { data: visitedCountries } = useQuery({
    queryKey: ['travelers', 'v2', 'myCountries', userId],
    queryFn: () => getUserVisitedCountries(userId!),
    enabled: !!userId,
    staleTime: 5 * 60_000,
  });

  const visitedCountryIds = (visitedCountries ?? []).map((vc) => vc.countryId);
  const sharedCountriesQuery = useQuery({
    queryKey: ['travelers', 'v2', 'sharedCountries', userId, visitedCountryIds.join(',')],
    queryFn: () => getTravelersWithSharedCountries(userId!, visitedCountryIds, blocked),
    enabled: !!userId && visitedCountryIds.length > 0,
    staleTime: 60_000,
  });

  // ─── Section 5: From Your Country ────────────────────────────
  const homeCountryQuery = useQuery({
    queryKey: ['travelers', 'v2', 'homeCountry', userId, homeCountryIso2],
    queryFn: () => getTravelersFromHomeCountry(userId!, homeCountryIso2!, blocked),
    enabled: !!userId && !!homeCountryIso2,
    staleTime: 60_000,
  });

  // ─── Section 6: Shared Interests ─────────────────────────────
  const interestsQuery = useQuery({
    queryKey: ['travelers', 'v2', 'interests', userId, interests.join(',')],
    queryFn: () => getTravelersWithSharedInterests(userId!, interests, blocked),
    enabled: !!userId && interests.length > 0,
    staleTime: 60_000,
  });

  // ─── Always: Pending + Connected ─────────────────────────────
  const pendingQuery = useQuery({
    queryKey: ['travelers', 'pending', userId],
    queryFn: () => getConnectionRequests(userId!, 'received'),
    enabled: !!userId,
    staleTime: 30_000,
  });

  const connectedQuery = useQuery({
    queryKey: ['travelers', 'connected', userId],
    queryFn: async () => {
      const ids = await getConnectedUserIds(userId!);
      if (ids.length === 0) return [];
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('id', ids);
      return rowsToCamel<Profile>(data ?? []);
    },
    enabled: !!userId,
    staleTime: 60_000,
  });

  // ─── Build sections with deduplication ───────────────────────
  const sections: TravelerSection[] = [];
  const shownIds = new Set<string>();

  const dedup = (profiles: Profile[]): Profile[] =>
    profiles.filter((p) => !shownIds.has(p.id));

  const markShown = (profiles: Profile[]) =>
    profiles.forEach((p) => shownIds.add(p.id));

  if (isTraveling) {
    // ── Traveling: proximity-first ordering ──

    // 1. Near You
    const nearby = dedup(nearbyQuery.data ?? []);
    if (nearby.length > 0) {
      sections.push({
        key: 'near-you',
        title: `Near you in ${locationCity}`,
        contextType: 'near-you',
        data: nearby,
      });
      markShown(nearby);
    }

    // 2. Also in [Country]
    // Filter out people already in "Near You" (same city)
    const sameCountry = dedup(sameCountryQuery.data ?? []);
    if (sameCountry.length > 0) {
      sections.push({
        key: 'same-country',
        title: `Also in ${locationCountry}`,
        contextType: 'same-country-location',
        data: sameCountry,
      });
      markShown(sameCountry);
    }

    // 3. Trip Overlap
    const tripCity = dedup(cityMatchQuery.data ?? []);
    const tripCountry = dedup(countryMatchQuery.data ?? []);
    const tripOverlap = [...tripCity, ...tripCountry];
    if (tripOverlap.length > 0) {
      sections.push({
        key: 'trip-overlap',
        title: 'Trip overlap',
        subtitle: 'Same dates, same places',
        contextType: 'trip-overlap',
        data: tripOverlap,
      });
      markShown(tripOverlap);
    }
  } else {
    // ── At home: travelers-in-your-city first ──

    // For "at home" mode, use the user's currentCityName or locationCityName
    // to find travelers passing through
    const homeCityName = userProfile?.currentCityName ?? locationCity;

    if (homeCityName) {
      // Query nearby travelers even without location sharing — use home city
      const nearbyData = nearbyQuery.data ?? [];
      const nearby = dedup(nearbyData);
      if (nearby.length > 0) {
        sections.push({
          key: 'travelers-in-city',
          title: `Travelers in ${homeCityName}`,
          contextType: 'near-you',
          data: nearby,
        });
        markShown(nearby);
      }
    }

    // Trip overlap still works if user has trips
    if (hasQualifyingTrip) {
      const tripCity = dedup(cityMatchQuery.data ?? []);
      const tripCountry = dedup(countryMatchQuery.data ?? []);
      const tripOverlap = [...tripCity, ...tripCountry];
      if (tripOverlap.length > 0) {
        sections.push({
          key: 'trip-overlap',
          title: 'Trip overlap',
          subtitle: 'Same dates, same places',
          contextType: 'trip-overlap',
          data: tripOverlap,
        });
        markShown(tripOverlap);
      }
    }
  }

  // ── Affinity sections (always shown) ──

  // 4. Been Where You've Been
  const sharedCountriesData = sharedCountriesQuery.data ?? [];
  const sharedCountries = dedup(sharedCountriesData);
  if (sharedCountries.length > 0) {
    // Build meta map for context labels
    const meta = new Map<string, string[]>();
    for (const p of sharedCountriesData as Array<Profile & { sharedCountryNames: string[] }>) {
      meta.set(p.id, p.sharedCountryNames ?? []);
    }
    sections.push({
      key: 'shared-countries',
      title: 'Been where you\'ve been',
      contextType: 'shared-countries',
      data: sharedCountries,
      meta,
    });
    markShown(sharedCountries);
  }

  // 5. From Your Country
  const homeCountry = dedup(homeCountryQuery.data ?? []);
  if (homeCountry.length > 0) {
    sections.push({
      key: 'home-country',
      title: `From ${userProfile?.homeCountryName ?? 'your country'}`,
      contextType: 'home-country',
      data: homeCountry,
    });
    markShown(homeCountry);
  }

  // 6. Shared Interests
  const shared = dedup(interestsQuery.data ?? []);
  if (shared.length > 0) {
    sections.push({
      key: 'shared-interests',
      title: 'Similar interests',
      contextType: 'shared-interests',
      data: shared,
    });
  }

  // ─── Loading / Error ─────────────────────────────────────────
  const isLoading =
    qualifyingQuery.isLoading ||
    nearbyQuery.isLoading ||
    sharedCountriesQuery.isLoading ||
    homeCountryQuery.isLoading ||
    interestsQuery.isLoading;

  const error =
    nearbyQuery.error ??
    sameCountryQuery.error ??
    sharedCountriesQuery.error ??
    homeCountryQuery.error ??
    interestsQuery.error ??
    null;

  return {
    sections,
    connectedProfiles: connectedQuery.data ?? [],
    pendingReceived: pendingQuery.data ?? [],
    userProfile: userProfile ?? null,
    isLoading,
    error: error as Error | null,
    refetch: () => {
      qualifyingQuery.refetch();
      nearbyQuery.refetch();
      sameCountryQuery.refetch();
      cityMatchQuery.refetch();
      countryMatchQuery.refetch();
      sharedCountriesQuery.refetch();
      homeCountryQuery.refetch();
      interestsQuery.refetch();
      pendingQuery.refetch();
      connectedQuery.refetch();
    },
  };
}
```

**Step 2: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | grep -E '(data/travelers/useTravelersFeedV2)' | head -20`
Expected: No errors.

**Step 3: Commit**

```bash
git add data/travelers/useTravelersFeedV2.ts
git commit -m "feat(travelers): add useTravelersFeedV2 hook with trip-gate-free discovery"
```

---

### Task 3: Update screen to use new hook and add section-aware context labels

Replace the trip-gated logic in `app/(tabs)/travelers/index.tsx` with the new V2 hook. Update `TravelerCardWrapper` to generate section-specific context labels. Replace the empty state.

**Files:**
- Modify: `app/(tabs)/travelers/index.tsx`

**Step 1: Update imports**

Replace the old hook import:
```typescript
// Remove:
import { useTravelersFeed } from '@/data/travelers/useTravelersFeed';
import type { TravelerMatchSection } from '@/data/travelers/useTravelersFeed';

// Add:
import { useTravelersFeedV2 } from '@/data/travelers/useTravelersFeedV2';
import type { TravelerSection, SectionContextType } from '@/data/travelers/useTravelersFeedV2';
```

**Step 2: Add context label helper**

Add a helper function above `TravelerCardWrapper` that generates context labels based on section type:

```typescript
function getSectionContextLabel(
  section: TravelerSection,
  profile: Profile,
  userProfile: Profile | null,
): string | undefined {
  switch (section.contextType) {
    case 'near-you':
      // If they have a home country, show "Visiting from [country]"
      // Otherwise just show the city
      if (profile.homeCountryName) {
        return `Visiting from ${profile.homeCountryName}`;
      }
      return undefined;

    case 'same-country-location':
      return profile.locationCityName ? `In ${profile.locationCityName}` : undefined;

    case 'trip-overlap':
      return 'Overlapping dates';

    case 'shared-countries': {
      const names = section.meta?.get(profile.id) ?? [];
      if (names.length === 0) return undefined;
      if (names.length <= 2) return `Also visited ${names.join(', ')}`;
      return `Also visited ${names[0]}, ${names[1]} +${names.length - 2}`;
    }

    case 'home-country':
      return profile.locationCityName ?? profile.currentCityName ?? undefined;

    case 'shared-interests': {
      const shared = (userProfile?.interests ?? []).filter((i) =>
        (profile.interests ?? []).includes(i),
      );
      if (shared.length === 0) return undefined;
      return shared.slice(0, 3).join(', ');
    }

    default:
      return undefined;
  }
}
```

**Step 3: Update TravelerCardWrapper to accept section**

Update the `TravelerCardWrapper` component to accept an optional `section` prop and use it for context labels:

```typescript
function TravelerCardWrapper({
  profile,
  userProfile,
  section,
}: {
  profile: Profile;
  userProfile: Profile | null;
  section?: TravelerSection;
}) {
  // ... (keep existing state, hooks, handleConnect)

  // Replace context label logic:
  const contextLabel = section
    ? getSectionContextLabel(section, profile, userProfile)
    : userProfile
      ? getConnectionContext(userProfile, profile)
      : undefined;

  // ... rest stays the same
}
```

**Step 4: Update HorizontalSection to pass section to card wrapper**

```typescript
function HorizontalSection({
  section,
  userProfile,
}: {
  section: TravelerSection;
  userProfile: Profile | null;
}) {
  const renderItem = useCallback(
    ({ item }: { item: Profile }) => (
      <TravelerCardWrapper profile={item} userProfile={userProfile} section={section} />
    ),
    [userProfile, section],
  );

  // ... rest stays the same
}
```

**Step 5: Replace EmptyState with ProfileIncompleteState**

Replace the old `EmptyState` component with a new one that encourages profile completion instead of trip creation:

```typescript
function ProfileIncompleteState() {
  const router = useRouter();

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIllustration}>
        <Feather name="users" size={48} color={colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>Discover solo women travelers</Text>
      <Text style={styles.emptySubtitle}>
        Complete your profile to get matched with travelers who share your interests and destinations
      </Text>
      <Pressable
        style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
        onPress={() => router.push('/(tabs)/profile')}
      >
        <Feather name="edit-3" size={16} color={colors.background} />
        <Text style={styles.ctaButtonText}>Complete profile</Text>
      </Pressable>
    </View>
  );
}
```

**Step 6: Update main screen to use V2 hook and remove trip gate**

In `TravelersScreen`, replace the old hook call and remove the `hasQualifyingTrip` gate:

```typescript
// Replace old useTravelersFeed() call with:
const {
  sections,
  connectedProfiles,
  pendingReceived,
  userProfile,
  isLoading,
  error,
  refetch,
} = useTravelersFeedV2();

// Remove: const nonEmptySections = sections.filter(...) — V2 already filters empty sections
```

Replace the trip-gated content block (`{!hasQualifyingTrip ? ... : ...}`) with:

```typescript
{/* Feed sections */}
{sections.length > 0 ? (
  sections.map((section) => (
    <HorizontalSection
      key={section.key}
      section={section}
      userProfile={userProfile}
    />
  ))
) : (
  <ProfileIncompleteState />
)}
```

Remove the old `EmptyState` and `NoMatchesYet` components (they're replaced by `ProfileIncompleteState`).

**Step 7: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/\(tabs\)/travelers/index)' | head -20`
Expected: No errors.

**Step 8: Commit**

```bash
git add app/(tabs)/travelers/index.tsx
git commit -m "feat(travelers): replace trip-gated feed with social discovery sections"
```

---

### Task 4: Verify and clean up

Remove the old hook and verify everything compiles clean.

**Files:**
- Check: `data/travelers/useTravelersFeed.ts` — verify no other imports
- Modify: `data/travelers/useTravelersFeedV2.ts` (if any type issues found)
- Modify: `app/(tabs)/travelers/index.tsx` (if any type issues found)

**Step 1: Check for other imports of old hook**

Run: `grep -r "useTravelersFeed" --include="*.ts" --include="*.tsx" .`

If the only import is from `index.tsx` (which we already updated), the old hook is safe to remove.

**Step 2: Delete old hook (if unused)**

If confirmed unused, delete `data/travelers/useTravelersFeed.ts`.

**Step 3: Full type check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -30`
Expected: No new errors (only pre-existing ones from scripts/).

**Step 4: Commit cleanup**

```bash
git add -A
git commit -m "chore(travelers): remove old trip-gated useTravelersFeed hook"
```

---

## Summary of Changes

| File | Action | What |
|------|--------|------|
| `data/api.ts` | Modify | Add `getTravelersWithSharedCountries`, `getTravelersFromHomeCountry` |
| `data/travelers/useTravelersFeedV2.ts` | Create | New feed hook with 6 section types, dedup, no trip gate |
| `data/travelers/useTravelersFeed.ts` | Delete | Old trip-gated hook (replaced by V2) |
| `app/(tabs)/travelers/index.tsx` | Modify | Use V2 hook, section-aware context labels, new empty state |

**No schema migrations.** No new dependencies. No changes to `TravelerCard.tsx` (it already supports all needed props).
