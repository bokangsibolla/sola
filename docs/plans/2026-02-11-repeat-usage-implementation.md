# Repeat Usage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the Explore feed context-aware for return users and add quiet return signals to Community, using only existing data.

**Architecture:** Add a personal "you" layer to the feed by extending `buildFeed()` with optional user context (saved places, trips, recent browsing, community activity). Add a community activity badge to `TabBar`. All data comes from existing Supabase tables and AsyncStorage. No new screens.

**Tech Stack:** React Native, Expo Router, Supabase, AsyncStorage, existing design tokens from `constants/design.ts`

---

## Task 1: Add Personal Feed Item Types

**Files:**
- Modify: `data/explore/types.ts`

**Step 1: Add new FeedItem union members**

Add these types to the `FeedItem` union in `data/explore/types.ts` after the travelling mode items (line 28):

```typescript
  // Personal "you" layer — only shown when data exists
  | { type: 'your-saves'; data: { places: SavedPlaceWithDetails[]; totalCount: number } }
  | { type: 'upcoming-trip'; data: { tripId: string; destinationName: string; citySlug: string | null; countryIso2: string; daysUntil: number } }
  | { type: 'continue-exploring'; data: { cityName: string; citySlug: string; heroImageUrl: string | null } }
  | { type: 'community-activity'; data: { newReplyCount: number; threads: { id: string; title: string }[] } };
```

Also add the `SavedPlaceWithDetails` interface at the top of the file:

```typescript
export interface SavedPlaceWithDetails {
  placeId: string;
  placeName: string;
  imageUrl: string | null;
  cityName: string | null;
}
```

Add import for `SavedPlace` if needed. No need to import from `../types` since `Place` is already there.

**Step 2: Commit**

```
git add data/explore/types.ts
git commit -m "feat: add personal feed item types for repeat-usage layer"
```

---

## Task 2: Create Recent Browsing Storage Utility

**Files:**
- Create: `data/explore/recentBrowsing.ts`

**Step 1: Write the utility**

```typescript
// data/explore/recentBrowsing.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@sola:last_viewed_city';

export interface RecentCity {
  citySlug: string;
  cityName: string;
  heroImageUrl: string | null;
  viewedAt: number; // epoch ms
}

export async function getRecentCity(): Promise<RecentCity | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: RecentCity = JSON.parse(raw);
    // Expire after 14 days
    if (Date.now() - parsed.viewedAt > 14 * 24 * 60 * 60 * 1000) {
      await AsyncStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function setRecentCity(city: RecentCity): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(city));
  } catch {
    // Non-critical
  }
}
```

**Step 2: Commit**

```
git add data/explore/recentBrowsing.ts
git commit -m "feat: add AsyncStorage utility for recent city browsing"
```

---

## Task 3: Create Community Activity Query

**Files:**
- Modify: `data/community/communityApi.ts`

**Step 1: Add the query function**

Add at the end of `data/community/communityApi.ts`:

```typescript
// ---------------------------------------------------------------------------
// New Reply Activity — for tab badge + feed zone
// ---------------------------------------------------------------------------

/**
 * Count threads the user participated in that have new replies since a timestamp.
 * "Participated" = authored OR replied to.
 * Returns thread IDs + titles for display, plus total new reply count.
 */
export async function getNewCommunityActivity(
  userId: string,
  sinceTimestamp: string,
): Promise<{ newReplyCount: number; threads: { id: string; title: string }[] }> {
  // 1. Get thread IDs where user is author
  const { data: authoredThreads } = await supabase
    .from('community_threads')
    .select('id, title, updated_at')
    .eq('author_id', userId)
    .eq('status', 'active')
    .gt('updated_at', sinceTimestamp)
    .order('updated_at', { ascending: false })
    .limit(10);

  // 2. Get thread IDs where user has replied
  const { data: repliedThreadIds } = await supabase
    .from('community_replies')
    .select('thread_id')
    .eq('author_id', userId)
    .eq('status', 'active');

  const repliedIds = Array.from(
    new Set((repliedThreadIds ?? []).map((r: { thread_id: string }) => r.thread_id))
  );

  // 3. Get threads user replied to that have new activity
  let repliedThreadsWithActivity: { id: string; title: string }[] = [];
  if (repliedIds.length > 0) {
    const { data } = await supabase
      .from('community_threads')
      .select('id, title, updated_at')
      .in('id', repliedIds)
      .eq('status', 'active')
      .gt('updated_at', sinceTimestamp)
      .order('updated_at', { ascending: false })
      .limit(10);
    repliedThreadsWithActivity = (data ?? []).map((t: { id: string; title: string }) => ({
      id: t.id,
      title: t.title,
    }));
  }

  // 4. Merge and deduplicate
  const threadMap = new Map<string, { id: string; title: string }>();
  for (const t of (authoredThreads ?? [])) {
    threadMap.set(t.id, { id: t.id, title: t.title });
  }
  for (const t of repliedThreadsWithActivity) {
    if (!threadMap.has(t.id)) {
      threadMap.set(t.id, t);
    }
  }

  const threads = Array.from(threadMap.values());
  return {
    newReplyCount: threads.length,
    threads: threads.slice(0, 3),
  };
}
```

**Step 2: Commit**

```
git add data/community/communityApi.ts
git commit -m "feat: add community activity query for new replies since timestamp"
```

---

## Task 4: Create Community Last-Visit Storage

**Files:**
- Create: `data/community/lastVisit.ts`

**Step 1: Write the utility**

```typescript
// data/community/lastVisit.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@sola:community_last_visited_at';

export async function getCommunityLastVisit(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export async function setCommunityLastVisit(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, new Date().toISOString());
  } catch {
    // Non-critical
  }
}
```

**Step 2: Commit**

```
git add data/community/lastVisit.ts
git commit -m "feat: add AsyncStorage utility for community last-visit timestamp"
```

---

## Task 5: Create Saved Places With Details Query

**Files:**
- Modify: `data/api.ts`

**Step 1: Add the query**

Add this function near the existing `getSavedPlaces` function (around line 871) in `data/api.ts`:

```typescript
/**
 * Get saved places with name, image, and city for feed display.
 * Returns most recent saves first, limited to 10.
 */
export async function getSavedPlacesWithDetails(
  userId: string,
  limit = 10,
): Promise<{ placeId: string; placeName: string; imageUrl: string | null; cityName: string | null }[]> {
  const { data, error } = await supabase
    .from('saved_places')
    .select(`
      place_id,
      places!inner(name, city_id, cities(name)),
      created_at
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const results: { placeId: string; placeName: string; imageUrl: string | null; cityName: string | null }[] = [];

  for (const row of data ?? []) {
    const place = (row as any).places;
    if (!place) continue;

    // Get first image for the place
    let imageUrl: string | null = null;
    try {
      const { data: media } = await supabase
        .from('place_media')
        .select('url')
        .eq('place_id', row.place_id)
        .order('order_index')
        .limit(1)
        .maybeSingle();
      imageUrl = media?.url ?? null;
    } catch {
      // Non-critical
    }

    results.push({
      placeId: row.place_id,
      placeName: place.name,
      imageUrl,
      cityName: place.cities?.name ?? null,
    });
  }

  return results;
}
```

**Step 2: Commit**

```
git add data/api.ts
git commit -m "feat: add getSavedPlacesWithDetails query for feed display"
```

---

## Task 6: Extend Feed Builder With Personal Context

**Files:**
- Modify: `data/explore/feedBuilder.ts`

**Step 1: Add personal context interface and update buildFeed**

Replace the entire file content:

```typescript
// data/explore/feedBuilder.ts
import type { ExploreCollectionWithItems, Place } from '../types';
import type { Country } from '../types';
import type { FeedItem, CityWithCountry, SavedPlaceWithDetails } from './types';

/** Optional personal context injected by useFeedItems */
export interface PersonalFeedContext {
  savedPlaces?: { places: SavedPlaceWithDetails[]; totalCount: number };
  upcomingTrip?: {
    tripId: string;
    destinationName: string;
    citySlug: string | null;
    countryIso2: string;
    daysUntil: number;
  };
  recentCity?: { cityName: string; citySlug: string; heroImageUrl: string | null };
  communityActivity?: { newReplyCount: number; threads: { id: string; title: string }[] };
}

const MAX_PERSONAL_ZONES = 2;

/**
 * Build the explore feed as distinct zones.
 *
 * The IntentHero component now handles above-the-fold orientation,
 * so the feed starts with browse content, not a featured collection.
 *
 * When personal context is provided, up to 2 personal zones are
 * prepended before the generic browse content.
 *
 * Order:
 * 1. [Personal zones — max 2, priority-ranked]
 * 2. Countries grid (destination browsing)
 * 3. Popular cities (horizontal scroll)
 * 4. Collections section (all active collections together)
 * 5. Community signal
 */
export function buildFeed(
  collections: ExploreCollectionWithItems[],
  cities: CityWithCountry[],
  countries: Country[],
  personal?: PersonalFeedContext,
): FeedItem[] {
  const feed: FeedItem[] = [];

  // Personal "you" layer — priority ranked, max 2
  if (personal) {
    const personalZones: FeedItem[] = [];

    // Priority 1: Upcoming trip
    if (personal.upcomingTrip) {
      personalZones.push({ type: 'upcoming-trip', data: personal.upcomingTrip });
    }

    // Priority 2: Community activity
    if (personal.communityActivity && personal.communityActivity.newReplyCount > 0) {
      personalZones.push({ type: 'community-activity', data: personal.communityActivity });
    }

    // Priority 3: Saved places
    if (personal.savedPlaces && personal.savedPlaces.totalCount > 0) {
      personalZones.push({ type: 'your-saves', data: personal.savedPlaces });
    }

    // Priority 4: Continue exploring
    if (personal.recentCity) {
      personalZones.push({ type: 'continue-exploring', data: personal.recentCity });
    }

    feed.push(...personalZones.slice(0, MAX_PERSONAL_ZONES));
  }

  // Zone: Countries grid — primary browse entry
  if (countries.length > 0) {
    feed.push({ type: 'countries-grid', data: countries });
  }

  // Zone: Popular cities — date-seeded shuffle within featured
  if (cities.length > 0) {
    const shuffled = shuffleCitiesByDate(cities);
    feed.push({ type: 'popular-cities', data: shuffled });
  }

  // Zone: All collections together — shown after intent is established
  if (collections.length > 0) {
    feed.push({ type: 'collections-section', data: collections });
  }

  // Zone: Community signal
  feed.push({ type: 'community-signal' });

  return feed;
}

/**
 * Build the explore feed for travelling mode.
 * Prepends city-specific content (saved places, all places, safety info)
 * before the normal discover feed.
 */
export function buildTravellingFeed(
  savedPlacesInCity: Place[],
  allPlacesInCity: Place[],
  countryIso2: string,
  cityName: string,
  collections: ExploreCollectionWithItems[],
  cities: CityWithCountry[],
  countries: Country[],
): FeedItem[] {
  const feed: FeedItem[] = [];

  if (savedPlacesInCity.length > 0) {
    feed.push({ type: 'saved-in-city', data: { cityName, places: savedPlacesInCity } });
  }

  if (allPlacesInCity.length > 0) {
    const savedIds = new Set(savedPlacesInCity.map((p) => p.id));
    const unsaved = allPlacesInCity.filter((p) => !savedIds.has(p.id));
    if (unsaved.length > 0) {
      feed.push({ type: 'places-in-city', data: { cityName, places: unsaved } });
    }
  }

  if (countryIso2) {
    feed.push({ type: 'know-before-you-go', data: { countryIso2 } });
  }

  // Append the normal discover feed below (no personal zones in travelling mode)
  const normalFeed = buildFeed(collections, cities, countries);
  feed.push(...normalFeed);

  return feed;
}

/**
 * Shuffle cities with a date-based seed so order changes daily
 * but stays stable within a single day.
 */
function shuffleCitiesByDate(cities: CityWithCountry[]): CityWithCountry[] {
  const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const seed = hashString(dateStr);

  // Separate featured from non-featured
  const featured = cities.filter(c => c.isFeatured);
  const rest = cities.filter(c => !c.isFeatured);

  // Shuffle featured cities with date seed
  const shuffledFeatured = seededShuffle(featured, seed);

  return [...shuffledFeatured, ...rest];
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit int
  }
  return Math.abs(hash);
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

**Step 2: Commit**

```
git add data/explore/feedBuilder.ts
git commit -m "feat: extend feed builder with optional personal context zones"
```

---

## Task 7: Extend useFeedItems to Fetch Personal Context

**Files:**
- Modify: `data/explore/useFeedItems.ts`

**Step 1: Update the hook to fetch and pass personal context**

Replace the entire file:

```typescript
// data/explore/useFeedItems.ts
import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { getPopularCitiesWithCountry, getCountries, getSavedPlaces, getPlacesByCity, getSavedPlacesWithDetails } from '../api';
import type { Place } from '../types';
import { getExploreCollections, getExploreCollectionItems } from '../collections';
import { buildFeed, buildTravellingFeed } from './feedBuilder';
import type { PersonalFeedContext } from './feedBuilder';
import { useAppMode } from '@/state/AppModeContext';
import { useAuth } from '@/state/AuthContext';
import { getRecentCity } from './recentBrowsing';
import { getCommunityLastVisit } from '../community/lastVisit';
import { getNewCommunityActivity } from '../community/communityApi';
import { getTripsGrouped } from '../trips/tripApi';
import type { ExploreCollectionWithItems } from '../types';
import type { FeedItem } from './types';

const INITIAL_FEED: FeedItem[] = [];

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

interface UseFeedItemsResult {
  feedItems: FeedItem[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useFeedItems(): UseFeedItemsResult {
  const [feedItems, setFeedItems] = useState<FeedItem[]>(INITIAL_FEED);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { mode, activeTripInfo } = useAppMode();
  const { userId } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function loadFeed() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch countries and cities in parallel (critical path)
        const [countriesResult, citiesResult] = await Promise.all([
          withTimeout(getCountries(), 5000, 'getCountries'),
          withTimeout(getPopularCitiesWithCountry(20), 5000, 'getCities'),
        ]);

        if (cancelled) return;

        // Fetch all active collections (optional — failure doesn't break feed)
        let collectionsWithItems: ExploreCollectionWithItems[] = [];
        try {
          const collections = await withTimeout(
            getExploreCollections(),
            5000,
            'getCollections'
          );

          // Resolve items for each collection in parallel
          const resolved = await Promise.all(
            collections.map(async (col) => {
              try {
                const items = await getExploreCollectionItems(col);
                if (items.length < col.minItems) return null;
                return { ...col, items } as ExploreCollectionWithItems;
              } catch {
                return null;
              }
            })
          );

          collectionsWithItems = resolved.filter(
            (c): c is ExploreCollectionWithItems => c !== null
          );
        } catch (e) {
          Sentry.addBreadcrumb({ message: 'Collections fetch failed', data: { error: e } });
        }

        if (cancelled) return;

        let feed: FeedItem[];

        if (mode === 'travelling' && activeTripInfo?.city.id && userId) {
          // Fetch city-specific data for travelling mode
          let savedInCity: Place[] = [];
          let placesInCity: Place[] = [];

          try {
            const [allSaved, allCityPlaces] = await Promise.all([
              withTimeout(getSavedPlaces(userId), 5000, 'getSavedPlaces'),
              withTimeout(getPlacesByCity(activeTripInfo.city.id), 5000, 'getPlacesByCity'),
            ]);

            // Filter saved places to those in the trip city
            const cityPlaceIds = new Set(allCityPlaces.map((p) => p.id));
            savedInCity = allSaved
              .filter((sp) => cityPlaceIds.has(sp.placeId))
              .map((sp) => allCityPlaces.find((p) => p.id === sp.placeId))
              .filter((p): p is Place => p !== undefined);

            placesInCity = allCityPlaces;
          } catch {
            // Non-critical — continue with empty city data
          }

          feed = buildTravellingFeed(
            savedInCity,
            placesInCity,
            activeTripInfo.city.countryIso2,
            activeTripInfo.city.name,
            collectionsWithItems,
            citiesResult,
            countriesResult,
          );
        } else {
          // Fetch personal context in parallel (all non-critical)
          let personal: PersonalFeedContext | undefined;

          if (userId) {
            const personalResults = await Promise.allSettled([
              getSavedPlacesWithDetails(userId, 10),
              getTripsGrouped(userId),
              getRecentCity(),
              getCommunityLastVisit().then(async (lastVisit) => {
                if (!lastVisit) return null;
                return getNewCommunityActivity(userId, lastVisit);
              }),
            ]);

            if (cancelled) return;

            personal = {};

            // Saved places
            if (personalResults[0].status === 'fulfilled' && personalResults[0].value.length > 0) {
              const savedWithDetails = personalResults[0].value;
              personal.savedPlaces = {
                places: savedWithDetails,
                totalCount: savedWithDetails.length,
              };
            }

            // Upcoming trip
            if (personalResults[1].status === 'fulfilled') {
              const grouped = personalResults[1].value;
              const upcoming = grouped.upcoming[0];
              if (upcoming && upcoming.arriving) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const arriving = new Date(upcoming.arriving);
                arriving.setHours(0, 0, 0, 0);
                const daysUntil = Math.max(0, Math.ceil((arriving.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

                if (daysUntil > 0 && daysUntil <= 30) {
                  // Look up city slug if we have a destination city
                  let citySlug: string | null = null;
                  if (upcoming.destinationCityId) {
                    const stop = upcoming.stops.find(s => s.cityId === upcoming.destinationCityId);
                    // We don't have slug in stops, so pass null — the card can navigate by trip ID
                    citySlug = null;
                  }

                  personal.upcomingTrip = {
                    tripId: upcoming.id,
                    destinationName: upcoming.destinationName,
                    citySlug,
                    countryIso2: upcoming.countryIso2,
                    daysUntil,
                  };
                }
              }
            }

            // Recent city
            if (personalResults[2].status === 'fulfilled' && personalResults[2].value) {
              personal.recentCity = personalResults[2].value;
            }

            // Community activity
            if (personalResults[3].status === 'fulfilled' && personalResults[3].value) {
              personal.communityActivity = personalResults[3].value;
            }

            // If nothing personal was found, don't pass context
            const hasPersonal = personal.savedPlaces || personal.upcomingTrip ||
              personal.recentCity || personal.communityActivity;
            if (!hasPersonal) personal = undefined;
          }

          feed = buildFeed(collectionsWithItems, citiesResult, countriesResult, personal);
        }

        setFeedItems(feed);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error('Failed to load feed'));
          Sentry.captureException(e);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadFeed();
    return () => { cancelled = true; };
  }, [refreshKey, mode, activeTripInfo?.city?.id, userId]);

  return {
    feedItems,
    isLoading,
    error,
    refresh: () => setRefreshKey(k => k + 1),
  };
}
```

**Step 2: Commit**

```
git add data/explore/useFeedItems.ts
git commit -m "feat: fetch personal context in useFeedItems for repeat-usage zones"
```

---

## Task 8: Render Personal Feed Zones in Explore Screen

**Files:**
- Modify: `app/(tabs)/explore/index.tsx`

**Step 1: Add new case blocks in `renderItem`**

In the `renderItem` function inside `ExploreScreen` (around line 153), add these cases before the `default:` case:

```typescript
      case 'your-saves':
        return (
          <View style={styles.zoneWide}>
            <View style={styles.zonePaddedHeader}>
              <SectionHeader
                title="Places you saved"
                onSeeAll={() => router.push('/(tabs)/profile')}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.citiesScroll}
            >
              {item.data.places.map((place) => (
                <Pressable
                  key={place.placeId}
                  onPress={() => router.push(`/(tabs)/explore/place-detail/${place.placeId}`)}
                  style={({ pressed }) => [styles.cityCard, pressed && styles.pressed]}
                >
                  {place.imageUrl ? (
                    <Image
                      source={{ uri: place.imageUrl }}
                      style={StyleSheet.absoluteFillObject}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.neutralFill }]} />
                  )}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.55)']}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View style={styles.cityCardContent}>
                    <Text style={styles.cityCardName} numberOfLines={1}>{place.placeName}</Text>
                    {place.cityName && (
                      <Text style={styles.cityCardCountry} numberOfLines={1}>{place.cityName}</Text>
                    )}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        );

      case 'upcoming-trip': {
        const daysText = item.data.daysUntil === 1 ? 'tomorrow' : `in ${item.data.daysUntil} days`;
        return (
          <View style={styles.zone}>
            <Pressable
              onPress={() => router.push(`/(tabs)/trips/${item.data.tripId}`)}
              style={({ pressed }) => [styles.tripCountdownCard, pressed && styles.pressed]}
            >
              <View style={styles.tripCountdownLeft}>
                <Text style={styles.tripCountdownLabel}>UPCOMING TRIP</Text>
                <Text style={styles.tripCountdownTitle}>
                  {item.data.destinationName}
                </Text>
                <Text style={styles.tripCountdownDays}>{daysText}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
        );
      }

      case 'continue-exploring':
        return (
          <View style={styles.zone}>
            <Pressable
              onPress={() => router.push(`/(tabs)/explore/city/${item.data.citySlug}`)}
              style={({ pressed }) => [styles.continueCard, pressed && styles.pressed]}
            >
              {item.data.heroImageUrl && (
                <Image
                  source={{ uri: item.data.heroImageUrl }}
                  style={styles.continueCardImage}
                  contentFit="cover"
                  transition={200}
                />
              )}
              <View style={styles.continueCardText}>
                <Text style={styles.continueCardLabel}>CONTINUE EXPLORING</Text>
                <Text style={styles.continueCardCity}>{item.data.cityName}</Text>
              </View>
            </Pressable>
          </View>
        );

      case 'community-activity':
        return (
          <View style={styles.zone}>
            <Pressable
              onPress={() => router.push('/(tabs)/community')}
              style={({ pressed }) => [styles.communityCard, pressed && styles.pressed]}
            >
              <Text style={styles.communityLabel}>YOUR DISCUSSIONS</Text>
              <Text style={styles.communityTitle}>
                {item.data.newReplyCount} {item.data.newReplyCount === 1 ? 'thread has' : 'threads have'} new replies
              </Text>
              {item.data.threads[0] && (
                <Text style={styles.communityAction} numberOfLines={1}>
                  {item.data.threads[0].title}
                </Text>
              )}
            </Pressable>
          </View>
        );
```

**Step 2: Add new styles**

Add these styles to the `StyleSheet.create()` at the bottom of the file:

```typescript
  // Trip countdown card — personal zone
  tripCountdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    padding: spacing.xl,
  },
  tripCountdownLeft: {
    flex: 1,
  },
  tripCountdownLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.orange,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  tripCountdownTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
    lineHeight: 26,
  },
  tripCountdownDays: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Continue exploring card — personal zone
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    overflow: 'hidden',
    height: 80,
  },
  continueCardImage: {
    width: 80,
    height: 80,
  },
  continueCardText: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  continueCardLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  continueCardCity: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
  },
```

**Step 3: Commit**

```
git add app/(tabs)/explore/index.tsx
git commit -m "feat: render personal feed zones in explore screen"
```

---

## Task 9: Store Recent City on City Detail View

**Files:**
- Modify: `app/(tabs)/explore/city/[slug].tsx`

**Step 1: Add import and effect**

At the top of `app/(tabs)/explore/city/[slug].tsx`, add the import:

```typescript
import { setRecentCity } from '@/data/explore/recentBrowsing';
```

Then inside the city detail component, after the data is loaded (after the `useData` hooks), add an effect that stores the viewed city:

```typescript
  // Store as recent city for "Continue Exploring" feed zone
  useEffect(() => {
    if (city) {
      setRecentCity({
        citySlug: city.slug,
        cityName: city.name,
        heroImageUrl: city.heroImageUrl ?? null,
        viewedAt: Date.now(),
      });
    }
  }, [city?.id]);
```

**Step 2: Commit**

```
git add "app/(tabs)/explore/city/[slug].tsx"
git commit -m "feat: store recent city view for continue-exploring feed zone"
```

---

## Task 10: Add Community Tab Badge to TabBar

**Files:**
- Modify: `components/TabBar.tsx`

**Step 1: Add badge logic**

Update `components/TabBar.tsx` to show a dot badge on the community tab:

Add imports at the top:

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@/state/AuthContext';
import { getCommunityLastVisit } from '@/data/community/lastVisit';
import { getNewCommunityActivity } from '@/data/community/communityApi';
```

Inside `TabBar` function, before the return, add:

```typescript
  const { userId } = useAuth();
  const [communityHasNew, setCommunityHasNew] = useState(false);

  useEffect(() => {
    if (!userId) return;

    async function checkCommunity() {
      try {
        const lastVisit = await getCommunityLastVisit();
        if (!lastVisit) return;
        const activity = await getNewCommunityActivity(userId!, lastVisit);
        setCommunityHasNew(activity.newReplyCount > 0);
      } catch {
        // Non-critical
      }
    }

    checkCommunity();
  }, [userId]);
```

Inside the tab render loop, after the `<Image>` icon, add the badge dot (only for community tab):

```typescript
            {icon && (
              <View>
                <Image
                  source={icon}
                  style={[styles.icon, { tintColor }]}
                  contentFit="contain"
                />
                {route.name === 'community' && communityHasNew && !isFocused && (
                  <View style={styles.badge} />
                )}
              </View>
            )}
```

Add the badge style:

```typescript
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.orange,
  },
```

**Step 2: Clear badge when community tab is focused**

Add logic to clear the badge and update last visit when community tab gains focus:

```typescript
  // Clear badge when community tab is focused
  useEffect(() => {
    const communityRoute = state.routes.find(r => r.name === 'community');
    if (communityRoute && state.routes[state.index]?.name === 'community') {
      setCommunityHasNew(false);
      // Import at top: import { setCommunityLastVisit } from '@/data/community/lastVisit';
    }
  }, [state.index]);
```

Also add import:
```typescript
import { setCommunityLastVisit } from '@/data/community/lastVisit';
```

And update the effect:
```typescript
  useEffect(() => {
    if (state.routes[state.index]?.name === 'community') {
      setCommunityHasNew(false);
      setCommunityLastVisit();
    }
  }, [state.index]);
```

**Step 3: Commit**

```
git add components/TabBar.tsx
git commit -m "feat: add community tab badge for new reply activity"
```

---

## Task 11: Add "New Since Last Visit" Divider in Community

**Files:**
- Modify: `app/(tabs)/community/index.tsx`

**Step 1: Add import and state**

Add at top of `app/(tabs)/community/index.tsx`:

```typescript
import { getCommunityLastVisit, setCommunityLastVisit } from '@/data/community/lastVisit';
```

Inside `CommunityHome`, add state:

```typescript
  const [lastVisitTimestamp, setLastVisitTimestamp] = useState<string | null>(null);
```

Add effect to load and update the timestamp:

```typescript
  // Load last visit timestamp and update it
  useEffect(() => {
    getCommunityLastVisit().then((ts) => {
      setLastVisitTimestamp(ts);
      // Update for next visit
      setCommunityLastVisit();
    });
  }, []);
```

**Step 2: Insert divider in thread list**

Modify the `displayThreads` memo to insert a divider marker. Instead of modifying the data, render the divider conditionally in `renderThread`:

In the `renderThread` callback, wrap with a divider check:

```typescript
  // Track if we've shown the divider
  const dividerShownRef = useRef(false);

  // Reset divider tracking when threads change
  useEffect(() => {
    dividerShownRef.current = false;
  }, [displayThreads]);

  const renderThread = useCallback(({ item, index }: { item: ThreadWithAuthor; index: number }) => {
    // Show "new since last visit" divider before the first old thread
    let showDivider = false;
    if (lastVisitTimestamp && !dividerShownRef.current && index > 0) {
      const isOld = new Date(item.updatedAt) <= new Date(lastVisitTimestamp);
      if (isOld) {
        showDivider = true;
        dividerShownRef.current = true;
      }
    }

    return (
      <View>
        {showDivider && (
          <View style={styles.newActivityDivider}>
            <View style={styles.newActivityLine} />
            <Text style={styles.newActivityText}>Earlier</Text>
            <View style={styles.newActivityLine} />
          </View>
        )}
        <ThreadCard
          thread={item}
          onPress={() => router.push(`/(tabs)/community/thread/${item.id}`)}
          onVote={handleVote}
          router={router}
        />
      </View>
    );
  }, [router, handleVote, lastVisitTimestamp]);
```

Add styles:

```typescript
  newActivityDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  newActivityLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderDefault,
  },
  newActivityText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
```

**Step 3: Commit**

```
git add "app/(tabs)/community/index.tsx"
git commit -m "feat: add 'earlier' divider in community thread list"
```

---

## Task 12: TypeScript Check

**Step 1: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -40
```

Fix any type errors in the modified files. Common issues to watch for:
- `SavedPlaceWithDetails` import needed in `types.ts`
- `useRef` import needed in community/index.tsx
- `PersonalFeedContext` export from feedBuilder.ts

**Step 2: Commit fixes**

```
git add -A
git commit -m "fix: resolve TypeScript errors in repeat-usage implementation"
```

---

## Task 13: Final Verification

**Step 1: Verify no regressions**

Check these scenarios mentally against the code:

1. **New user (no userId):** `personal` is undefined → `buildFeed` gets no personal context → feed is unchanged
2. **User with saves but no trip:** `personal.savedPlaces` populated → "your-saves" zone shown as first personal zone
3. **User with upcoming trip:** `personal.upcomingTrip` populated → "upcoming-trip" zone shown first (highest priority)
4. **Travelling mode:** bypasses personal context entirely → `buildTravellingFeed` unchanged
5. **Community badge:** only shows when community tab is not focused AND there are new replies
6. **Community divider:** only shows if user has a previous visit timestamp AND threads exist with older `updatedAt`

**Step 2: Final commit**

```
git add -A
git commit -m "feat: complete repeat-usage personal feed layer and community signals"
```

---

## Summary of All Modified Files

| File | Change |
|------|--------|
| `data/explore/types.ts` | 4 new FeedItem types + SavedPlaceWithDetails interface |
| `data/explore/recentBrowsing.ts` | NEW — AsyncStorage for last viewed city |
| `data/explore/feedBuilder.ts` | PersonalFeedContext interface + personal zones in buildFeed |
| `data/explore/useFeedItems.ts` | Fetch personal context (saves, trips, recent, community) in parallel |
| `data/api.ts` | New getSavedPlacesWithDetails query |
| `data/community/communityApi.ts` | New getNewCommunityActivity query |
| `data/community/lastVisit.ts` | NEW — AsyncStorage for community last visit |
| `app/(tabs)/explore/index.tsx` | Render 4 new personal zone types |
| `app/(tabs)/explore/city/[slug].tsx` | Store recent city view |
| `components/TabBar.tsx` | Community tab badge dot |
| `app/(tabs)/community/index.tsx` | "Earlier" divider + last-visit tracking |
