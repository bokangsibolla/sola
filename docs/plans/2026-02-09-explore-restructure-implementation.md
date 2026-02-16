# Explore Page Restructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the Explore page from an interleaved feed into six clear zones: search, editorial, countries grid, popular cities, collections, community signal.

**Architecture:** Replace the current `buildFeed()` interleaving algorithm with a zone-based feed builder that emits distinct section types. The FlatList remains the rendering engine but with new feed item types. Search bar moves above the FlatList. Data fetching adds `getCountries()` alongside existing queries.

**Tech Stack:** React Native, Expo Router, Supabase, existing design system tokens from `constants/design.ts`

---

### Task 1: Add new feed item types

**Files:**
- Modify: `data/explore/types.ts`

**Step 1: Update the FeedItem union type**

Replace the current union with a cleaner set that matches the six zones. Keep backward-compatible types that are still used (`featured-collection`, `editorial-collection`) and add new ones.

```typescript
import type { Country, City, Place, ExploreCollectionWithItems, DiscoveryLens } from '../types';

export interface CityWithCountry extends City {
  countryName: string;
  countrySlug: string;
}

export interface ActivityWithCity extends Place {
  cityName: string;
  imageUrl: string | null;
}

export type FeedItem =
  | { type: 'featured-collection'; data: ExploreCollectionWithItems }
  | { type: 'countries-grid'; data: Country[] }
  | { type: 'popular-cities'; data: CityWithCountry[] }
  | { type: 'collections-section'; data: ExploreCollectionWithItems[] }
  | { type: 'community-signal' }
  // Keep these for potential future use but they won't be emitted by the new builder:
  | { type: 'section-header'; data: { title: string; subtitle?: string; variant: 'default' | 'editorial' } }
  | { type: 'editorial-collection'; data: ExploreCollectionWithItems }
  | { type: 'city-pair'; data: [CityWithCountry, CityWithCountry]; sectionLabel?: string }
  | { type: 'city-spotlight'; data: CityWithCountry; activities: ActivityWithCity[] };

export type FeedItemType = FeedItem['type'];
```

**Step 2: Commit**
```bash
git add data/explore/types.ts
git commit -m "feat(explore): add zone-based feed item types for restructure"
```

---

### Task 2: Rewrite feed builder for zone-based layout

**Files:**
- Modify: `data/explore/feedBuilder.ts`

**Step 1: Replace buildFeed with zone-based builder**

The new builder takes countries, collections with items, and cities, and emits one feed item per zone. The search bar is no longer a feed item (it moves above the FlatList in Task 5).

```typescript
import type { ExploreCollectionWithItems } from '../types';
import type { Country } from '../types';
import type { FeedItem, CityWithCountry } from './types';

/**
 * Build the explore feed as distinct zones:
 * 1. Featured editorial (one rotating collection)
 * 2. Countries grid (all countries)
 * 3. Popular cities (horizontal scroll)
 * 4. Collections section (all active collections)
 * 5. Community signal
 */
export function buildFeed(
  collections: ExploreCollectionWithItems[],
  cities: CityWithCountry[],
  countries: Country[],
): FeedItem[] {
  const feed: FeedItem[] = [];

  // Zone 2: Featured editorial — rotate by day of week
  if (collections.length > 0) {
    const dayIndex = new Date().getDay(); // 0-6
    const featured = collections[dayIndex % collections.length];
    feed.push({ type: 'featured-collection', data: featured });
  }

  // Zone 3: Countries grid
  if (countries.length > 0) {
    feed.push({ type: 'countries-grid', data: countries });
  }

  // Zone 4: Popular cities — date-seeded shuffle within featured
  if (cities.length > 0) {
    const shuffled = shuffleCitiesByDate(cities);
    feed.push({ type: 'popular-cities', data: shuffled });
  }

  // Zone 5: Collections section (all collections, not just the featured one)
  if (collections.length > 1) {
    // Exclude the one already shown as featured
    const dayIndex = new Date().getDay();
    const featuredIndex = dayIndex % collections.length;
    const remaining = collections.filter((_, i) => i !== featuredIndex);
    feed.push({ type: 'collections-section', data: remaining });
  } else if (collections.length === 1) {
    // Only one collection — it's already shown as featured, skip section
  }

  // Zone 6: Community signal
  feed.push({ type: 'community-signal' });

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
```bash
git add data/explore/feedBuilder.ts
git commit -m "feat(explore): zone-based feed builder with rotation and shuffle"
```

---

### Task 3: Update data fetching hook

**Files:**
- Modify: `data/explore/useFeedItems.ts`

**Step 1: Rewrite useFeedItems to fetch countries and remove hardcoded priorities**

Key changes:
- Add `getCountries()` call
- Remove `PRIORITY_SLUGS` and `FALLBACK_CITIES`
- Fetch ALL active collections (not just featured) for the collections section
- Pass countries to `buildFeed()`

```typescript
import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { getPopularCitiesWithCountry, getCountries } from '../api';
import { getExploreCollections, getExploreCollectionItems } from '../collections';
import { buildFeed } from './feedBuilder';
import type { ExploreCollectionWithItems, Country } from '../types';
import type { FeedItem, CityWithCountry } from './types';

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

        const feed = buildFeed(collectionsWithItems, citiesResult, countriesResult);
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
  }, [refreshKey]);

  return {
    feedItems,
    isLoading,
    error,
    refresh: () => setRefreshKey(k => k + 1),
  };
}
```

Key changes from current:
- `getExploreCollections()` instead of `getFeaturedExploreCollections()` — fetches ALL active collections, not just featured
- `getCountries()` added as critical path (parallel with cities)
- Removed: `PRIORITY_SLUGS`, `FALLBACK_CITIES`, discovery lenses fetch
- `INITIAL_FEED` is now empty `[]` (search bar moves above FlatList)

**Step 2: Commit**
```bash
git add data/explore/useFeedItems.ts
git commit -m "feat(explore): fetch countries, all collections, remove hardcoded priorities"
```

---

### Task 4: Create CountryCard component

**Files:**
- Create: `components/explore/cards/CountryCard.tsx`

**Step 1: Build the country card**

A compact card for the countries grid — hero image with country name overlaid. Shows a one-line signal (badgeLabel, bestFor, or soloLevel). Simpler than the city cards since countries are a navigation layer, not a destination card.

```typescript
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';
import type { Country } from '@/data/types';

interface CountryCardProps {
  country: Country;
  onPress: () => void;
}

export function CountryCard({ country, onPress }: CountryCardProps) {
  const signal = country.badgeLabel
    || country.bestFor
    || (country.soloLevel === 'beginner' ? 'Great for first-timers' : null);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <Image
        source={{ uri: country.heroImageUrl ?? undefined }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{country.name}</Text>
        {signal ? (
          <Text style={styles.signal} numberOfLines={1}>{signal}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  signal: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});
```

**Step 2: Export from barrel**

Add to `components/explore/cards/index.ts`:
```typescript
export { CountryCard } from './CountryCard';
```

**Step 3: Commit**
```bash
git add components/explore/cards/CountryCard.tsx components/explore/cards/index.ts
git commit -m "feat(explore): add CountryCard component for countries grid"
```

---

### Task 5: Rewrite the Explore screen

**Files:**
- Modify: `app/(tabs)/explore/index.tsx`

This is the main task. The screen changes from rendering 10 feed item types to rendering 5 zone types, with the search bar moved above the FlatList.

**Step 1: Rewrite the explore screen**

Key changes:
- Search bar moves out of FlatList into a fixed position below AppHeader
- Remove all inline card components (CitySmallCard, CityPairCard, CitySpotlightCard, getCityTag, TypeLabel)
- New `renderItem` handles: `featured-collection`, `countries-grid`, `popular-cities`, `collections-section`, `community-signal`
- Countries grid renders as a 2-column layout using nested Views (not a nested FlatList)
- Popular cities renders as a horizontal ScrollView
- Collections section renders all collections in a vertical list with item counts

The full file should look like:

```typescript
import React from 'react';
import { FlatList, ScrollView, StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import InboxButton from '@/components/InboxButton';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import SearchBar from '@/components/explore/SearchBar';
import SectionHeader from '@/components/explore/SectionHeader';
import { EditorialCollectionCard } from '@/components/explore/cards/EditorialCollectionCard';
import { CountryCard } from '@/components/explore/cards/CountryCard';
import { useFeedItems } from '@/data/explore/useFeedItems';
import type { FeedItem, CityWithCountry } from '@/data/explore/types';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';

const SCREEN_WIDTH = Dimensions.get('window').width;

// ── Inline components for zones ──────────────────────────────

function CityCard({ city, onPress }: { city: CityWithCountry; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.cityCard, pressed && styles.pressed]}
    >
      <Image
        source={{ uri: city.heroImageUrl ?? undefined }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.cityCardContent}>
        <Text style={styles.cityCardName} numberOfLines={1}>{city.name}</Text>
        <Text style={styles.cityCardCountry} numberOfLines={1}>{city.countryName}</Text>
      </View>
    </Pressable>
  );
}

function CollectionRow({
  collection,
  onPress
}: {
  collection: { title: string; heroImageUrl: string | null; items: { length: number } };
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.collectionRow, pressed && styles.collectionRowPressed]}
    >
      <Image
        source={{ uri: collection.heroImageUrl ?? undefined }}
        style={styles.collectionRowImage}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.collectionRowText}>
        <Text style={styles.collectionRowTitle} numberOfLines={2}>{collection.title}</Text>
        <Text style={styles.collectionRowCount}>
          {collection.items.length} {collection.items.length === 1 ? 'destination' : 'destinations'}
        </Text>
      </View>
    </Pressable>
  );
}

// ── Main screen ──────────────────────────────────────────────

export default function ExploreScreen() {
  const { feedItems, isLoading, error, refresh } = useFeedItems();
  const router = useRouter();

  const renderItem = ({ item }: { item: FeedItem }) => {
    switch (item.type) {
      case 'featured-collection':
        return (
          <View style={styles.zone}>
            <EditorialCollectionCard
              collection={item.data}
              onPress={() => router.push(`/(tabs)/explore/collection/${item.data.slug}`)}
            />
          </View>
        );

      case 'countries-grid':
        return (
          <View style={styles.zone}>
            <SectionHeader title="Where do you want to go?" />
            <View style={styles.countriesGrid}>
              {item.data.map((country, index) => (
                <View key={country.id} style={styles.countriesGridItem}>
                  <CountryCard
                    country={country}
                    onPress={() => router.push(`/(tabs)/explore/country/${country.slug}`)}
                  />
                </View>
              ))}
            </View>
          </View>
        );

      case 'popular-cities':
        return (
          <View style={styles.zoneNoPadding}>
            <View style={styles.zonePaddedHeader}>
              <SectionHeader title="Popular destinations" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.citiesScroll}
            >
              {item.data.map((city) => (
                <CityCard
                  key={city.id}
                  city={city}
                  onPress={() => router.push(`/(tabs)/explore/city/${city.slug}`)}
                />
              ))}
            </ScrollView>
          </View>
        );

      case 'collections-section':
        return (
          <View style={styles.zone}>
            <SectionHeader title="Explore by theme" />
            <View style={styles.collectionsListGap}>
              {item.data.map((collection) => (
                <CollectionRow
                  key={collection.id}
                  collection={collection}
                  onPress={() => router.push(`/(tabs)/explore/collection/${collection.slug}`)}
                />
              ))}
            </View>
          </View>
        );

      case 'community-signal':
        return (
          <View style={styles.zone}>
            <Pressable
              onPress={() => router.push('/(tabs)/community')}
              style={({ pressed }) => [styles.communityCard, pressed && styles.pressed]}
            >
              <View style={styles.communityContent}>
                <Text style={styles.communityLabel}>FROM THE COMMUNITY</Text>
                <Text style={styles.communityTitle}>
                  Real questions from women traveling solo
                </Text>
                <Text style={styles.communityAction}>Join the conversation</Text>
              </View>
            </Pressable>
          </View>
        );

      default:
        return null;
    }
  };

  const keyExtractor = (item: FeedItem, index: number) => `${item.type}-${index}`;

  if (isLoading && feedItems.length === 0) {
    return (
      <AppScreen>
        <AppHeader
          title=""
          leftComponent={
            <Image
              source={require('@/assets/images/sola-logo.png')}
              style={{ width: 76, height: 22 }}
              contentFit="contain"
            />
          }
          rightComponent={<InboxButton />}
        />
        <LoadingScreen />
      </AppScreen>
    );
  }

  if (error && feedItems.length === 0) {
    return (
      <AppScreen>
        <AppHeader
          title=""
          leftComponent={
            <Image
              source={require('@/assets/images/sola-logo.png')}
              style={{ width: 76, height: 22 }}
              contentFit="contain"
            />
          }
          rightComponent={<InboxButton />}
        />
        <ErrorScreen message="Something went wrong" onRetry={refresh} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <AppHeader
        title=""
        leftComponent={
          <Image
            source={require('@/assets/images/sola-logo.png')}
            style={{ width: 76, height: 22 }}
            contentFit="contain"
          />
        }
        rightComponent={<InboxButton />}
      />
      <SearchBar onPress={() => router.push('/(tabs)/explore/search')} />
      <FlatList
        data={feedItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onRefresh={refresh}
        refreshing={isLoading}
      />
    </AppScreen>
  );
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  list: {
    paddingBottom: spacing.xxxxl,
  },
  zone: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.xl,
  },
  zoneNoPadding: {
    marginTop: spacing.xl,
  },
  zonePaddedHeader: {
    paddingHorizontal: spacing.screenX,
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },

  // Countries grid
  countriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  countriesGridItem: {
    width: (SCREEN_WIDTH - spacing.screenX * 2 - spacing.md) / 2,
  },

  // Popular cities horizontal scroll
  citiesScroll: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cityCard: {
    width: 160,
    height: 200,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  cityCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  cityCardName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  cityCardCountry: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  // Collections list
  collectionsListGap: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    overflow: 'hidden',
    height: 80,
  },
  collectionRowPressed: {
    opacity: pressedState.opacity,
  },
  collectionRowImage: {
    width: 80,
    height: 80,
  },
  collectionRowText: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  collectionRowTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  collectionRowCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Community signal
  communityCard: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    padding: spacing.xl,
  },
  communityContent: {},
  communityLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.orange,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  communityTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  communityAction: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
});
```

**Step 2: Verify TypeScript compiles**
```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -20
```

**Step 3: Commit**
```bash
git add app/(tabs)/explore/index.tsx
git commit -m "feat(explore): restructure into six-zone layout"
```

---

### Task 6: Fix SearchBar positioning

**Files:**
- Modify: `components/explore/SearchBar.tsx`

**Step 1: Add margin for standalone use**

The SearchBar now sits outside the FlatList, directly under the AppHeader. It needs horizontal padding since it's no longer inside the FlatList's contentContainer padding.

```typescript
// Add to the container style:
marginHorizontal: spacing.screenX,
marginBottom: spacing.sm,
```

This is a small edit to the existing `container` style in `SearchBar.tsx`. The component already works standalone — it just needs the margin since it's no longer wrapped by the FlatList content padding.

**Step 2: Commit**
```bash
git add components/explore/SearchBar.tsx
git commit -m "fix(explore): add margin to SearchBar for standalone positioning"
```

---

### Task 7: Fix SectionHeader padding

**Files:**
- Modify: `components/explore/SectionHeader.tsx`

**Step 1: Remove built-in horizontal padding**

The SectionHeader currently has `paddingHorizontal: spacing.screenX` baked in. Since it's now rendered inside zones that already provide padding, this creates double padding. Remove it.

In the `container` style, change:
```
paddingHorizontal: spacing.screenX,  →  (remove this line)
```

Also change `marginBottom: spacing.lg` to `marginBottom: spacing.sm` since the zone's `marginTop` already provides vertical spacing.

**Step 2: Commit**
```bash
git add components/explore/SectionHeader.tsx
git commit -m "fix(explore): remove double padding from SectionHeader"
```

---

### Task 8: Update getExploreCollections to return all active

**Files:**
- Modify: `data/collections.ts`

**Step 1: Ensure getExploreCollections returns all active collections**

Check that `getExploreCollections()` returns ALL active collections (not just featured). Looking at the current code, it already does — it queries `is_active = true` without filtering by `is_featured`. Good — no change needed here.

However, `useFeedItems` was previously calling `getFeaturedExploreCollections()` which filters to `is_featured = true`. The new hook (Task 3) calls `getExploreCollections()` instead, which returns all 6 active collections. This is correct.

**No code change needed** — just verify this is working by checking the feed loads with all collections.

---

### Task 9: Clean up dead code

**Files:**
- Modify: `data/explore/types.ts` (optional — remove old types if comfortable)
- Delete candidates (verify unused first):
  - `components/explore/ExploreFeed.tsx`
  - `components/explore/FeedItem.tsx`
  - `components/explore/FeedEndCard.tsx`
  - `components/explore/QuickActionsRow.tsx`
  - `components/explore/PillarsRow.tsx`
  - `components/explore/HorizontalCarousel.tsx`
  - `components/explore/SegmentedControl.tsx`

**Step 1: Verify no imports reference these files**

For each file, search for imports:
```bash
npx grep -r "ExploreFeed" --include="*.tsx" --include="*.ts" app/ components/ data/
npx grep -r "FeedItem" --include="*.tsx" --include="*.ts" app/ components/ data/
npx grep -r "FeedEndCard" --include="*.tsx" --include="*.ts" app/ components/ data/
npx grep -r "QuickActionsRow" --include="*.tsx" --include="*.ts" app/ components/ data/
npx grep -r "PillarsRow" --include="*.tsx" --include="*.ts" app/ components/ data/
npx grep -r "HorizontalCarousel" --include="*.tsx" --include="*.ts" app/ components/ data/
npx grep -r "SegmentedControl" --include="*.tsx" --include="*.ts" app/ components/ data/
```

**Step 2: Delete confirmed unused files**

Only delete files that have zero imports from active code.

**Step 3: Remove unused imports from explore/index.tsx**

After the rewrite, these imports are no longer needed:
- `HeroGrid`
- `DiscoveryLensesSection`

**Step 4: Commit**
```bash
git add -A
git commit -m "chore(explore): remove unused feed components and dead code"
```

---

### Task 10: Verify and test

**Step 1: TypeScript check**
```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -30
```
Fix any type errors.

**Step 2: Visual verification**
Start the dev server and check the Explore page:
```bash
npx expo start
```

Verify:
- [ ] Search bar appears fixed above the scroll
- [ ] Featured collection card rotates (check different days by mocking date)
- [ ] Countries grid shows all 12 countries in 2 columns
- [ ] Popular cities horizontal scroll works
- [ ] Collections section shows remaining collections with item counts
- [ ] Community signal card links to community tab
- [ ] Pull-to-refresh works
- [ ] Loading and error states still work
- [ ] Tapping a country navigates to country page
- [ ] Tapping a city navigates to city page
- [ ] Tapping a collection navigates to collection page

**Step 3: Final commit**
```bash
git add -A
git commit -m "feat(explore): complete six-zone restructure with tag-driven collections"
```

---

## Summary of Changes

| File | Action | Purpose |
|------|--------|---------|
| `data/explore/types.ts` | Modify | Add zone-based feed item types |
| `data/explore/feedBuilder.ts` | Rewrite | Zone-based builder with rotation + shuffle |
| `data/explore/useFeedItems.ts` | Rewrite | Fetch countries, all collections, remove hardcoding |
| `components/explore/cards/CountryCard.tsx` | Create | Country card for grid |
| `app/(tabs)/explore/index.tsx` | Rewrite | Six-zone rendering |
| `components/explore/SearchBar.tsx` | Modify | Standalone positioning |
| `components/explore/SectionHeader.tsx` | Modify | Remove double padding |
| Dead code files | Delete | Clean up unused components |
