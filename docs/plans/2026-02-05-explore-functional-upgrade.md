# Explore Functional Upgrade Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Explore actionable for intentional travelers by adding quick actions, "Browse All" screens, and enhanced search — while keeping the existing premium editorial design intact.

**Architecture:** Add a compact quick-actions row after the first editorial card in the feed. Create three new "All" screens (countries, destinations, activities) powered by Supabase with search + tag filtering. Upgrade the existing search to query across countries, cities, areas, and activities with grouped results. Replace the mock-data `see-all.tsx` screen. All data from Supabase — zero hardcoded lists.

**Tech Stack:** React Native (Expo Router), Supabase (Postgres), TypeScript, expo-image, Feather icons

---

## Current State Summary

- **Explore feed** (`app/(tabs)/explore/index.tsx`): FlatList rendering `FeedItem[]` from `useFeedItems()` hook. Items: editorial collections, country pairs, city spotlights, end card.
- **Search** (`app/(tabs)/explore/search.tsx`): Queries countries + cities only via `searchDestinations()` in `data/api.ts`. No areas or activities. Flat results, not grouped.
- **See-all** (`app/(tabs)/explore/see-all.tsx`): Uses `exploreMockData.ts` — completely hardcoded mock data. Not connected to Supabase.
- **Navigation** (`app/(tabs)/explore/_layout.tsx`): Stack with screens for index, search, see-all, country/[slug], city/[slug], collection/[slug], activity/[slug], place-detail/[id].
- **API layer** (`data/api.ts`): Has `getCountries()`, `getPopularCities()`, `getCitiesByCountry()`, `getActivitiesByCity()`, `getAreasByCity()`, `searchDestinations()`, `getDestinationTags()`, `getCountriesByTag()`.
- **Design tokens** (`constants/design.ts`): colors (orange `#E5653A`, neutralFill `#F3F3F3`), fonts (PlusJakartaSans), spacing (screenX: 24), radius (pill: 12, card: 14, full: 999).

---

## Task 1: Add new feed item type for quick actions

**Files:**
- Modify: `data/explore/types.ts`
- Modify: `data/explore/feedBuilder.ts`

**Step 1: Add `quick-actions` type to FeedItem union**

In `data/explore/types.ts`, add a new variant to the `FeedItem` union:

```typescript
// data/explore/types.ts
import type { Country, City, Place, ExploreCollectionWithItems } from '../types';

export interface CityWithCountry extends City {
  countryName: string;
  countrySlug: string;
}

export interface ActivityWithCity extends Place {
  cityName: string;
  imageUrl: string | null;
}

export type FeedItem =
  | { type: 'editorial-collection'; data: ExploreCollectionWithItems }
  | { type: 'quick-actions' }
  | { type: 'country-pair'; data: [Country, Country] }
  | { type: 'city-spotlight'; data: CityWithCountry; activities: ActivityWithCity[] }
  | { type: 'activity-cluster'; data: ActivityWithCity[]; cityName: string; citySlug: string }
  | { type: 'end-card' };

export type FeedItemType = FeedItem['type'];
```

**Step 2: Insert quick-actions after the first editorial card in feedBuilder**

In `data/explore/feedBuilder.ts`, insert a `quick-actions` item right after the first editorial collection (beat 0):

```typescript
// data/explore/feedBuilder.ts
import type { Country, ExploreCollectionWithItems } from '../types';
import type {
  FeedItem,
  CityWithCountry,
  ActivityWithCity,
} from './types';

export function buildFeed(
  collections: ExploreCollectionWithItems[],
  countries: Country[],
  citiesWithActivities: { city: CityWithCountry; activities: ActivityWithCity[] }[]
): FeedItem[] {
  const feed: FeedItem[] = [];

  let collectionIndex = 0;
  let countryIndex = 0;
  let cityIndex = 0;
  let beat = 0;
  let quickActionsInserted = false;

  const maxItems = 18;

  while (feed.length < maxItems) {
    const beatPosition = beat % 5;
    beat++;

    switch (beatPosition) {
      case 0: // Editorial collection
        if (collectionIndex < collections.length) {
          feed.push({
            type: 'editorial-collection',
            data: collections[collectionIndex++],
          });
          // Insert quick actions after the first editorial card
          if (!quickActionsInserted) {
            feed.push({ type: 'quick-actions' });
            quickActionsInserted = true;
          }
        }
        break;

      case 1: // Country pair
        if (countryIndex + 1 < countries.length) {
          feed.push({
            type: 'country-pair',
            data: [countries[countryIndex], countries[countryIndex + 1]],
          });
          countryIndex += 2;
        }
        break;

      case 2: // City spotlight
        if (cityIndex < citiesWithActivities.length) {
          const { city, activities } = citiesWithActivities[cityIndex];
          feed.push({
            type: 'city-spotlight',
            data: city,
            activities: activities.slice(0, 4),
          });
          cityIndex++;
        }
        break;

      case 3: // Activity cluster
        if (cityIndex < citiesWithActivities.length) {
          const { city, activities } = citiesWithActivities[cityIndex];
          if (activities.length > 0) {
            feed.push({
              type: 'activity-cluster',
              data: activities.slice(0, 4),
              cityName: city.name,
              citySlug: city.slug,
            });
          }
          cityIndex++;
        }
        break;

      case 4: // Another editorial
        if (collectionIndex < collections.length) {
          feed.push({
            type: 'editorial-collection',
            data: collections[collectionIndex++],
          });
        }
        break;
    }

    // Safety: break if we've exhausted content
    if (
      collectionIndex >= collections.length &&
      countryIndex >= countries.length &&
      cityIndex >= citiesWithActivities.length
    ) {
      break;
    }
  }

  // If no editorial was emitted, still insert quick-actions at the top
  if (!quickActionsInserted) {
    feed.unshift({ type: 'quick-actions' });
  }

  feed.push({ type: 'end-card' });

  return feed;
}
```

**Step 3: Run app to verify feed still renders (quick-actions will be `null` for now)**

Run: `npx expo start` and verify Explore tab loads without crashes.

**Step 4: Commit**

```bash
git add data/explore/types.ts data/explore/feedBuilder.ts
git commit -m "feat: add quick-actions feed item type"
```

---

## Task 2: Create QuickActionsRow component

**Files:**
- Create: `components/explore/QuickActionsRow.tsx`

This is a subtle, premium row of small pill buttons. Matches the existing design language — neutralFill background, medium font, no loud icons. Uses Feather icons (already in the project via `@expo/vector-icons`).

**Step 1: Write the component**

```typescript
// components/explore/QuickActionsRow.tsx
import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius } from '@/constants/design';

interface QuickAction {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
}

export function QuickActionsRow() {
  const router = useRouter();

  const actions: QuickAction[] = [
    {
      label: 'Countries',
      icon: 'globe',
      onPress: () => router.push('/explore/all-countries'),
    },
    {
      label: 'Destinations',
      icon: 'map-pin',
      onPress: () => router.push('/explore/all-destinations'),
    },
    {
      label: 'Activities',
      icon: 'compass',
      onPress: () => router.push('/explore/all-activities'),
    },
    {
      label: 'My trips',
      icon: 'briefcase',
      onPress: () => router.navigate('/(tabs)/trips'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {actions.map((action) => (
          <Pressable
            key={action.label}
            style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <Feather name={action.icon} size={14} color={colors.textPrimary} />
            <Text style={styles.pillLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
```

**Step 2: Add styles**

```typescript
const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
  },
  scrollContent: {
    gap: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
  },
  pillPressed: {
    opacity: 0.7,
  },
  pillLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
});
```

**Step 3: Commit**

```bash
git add components/explore/QuickActionsRow.tsx
git commit -m "feat: add QuickActionsRow component"
```

---

## Task 3: Wire QuickActionsRow into Explore feed

**Files:**
- Modify: `app/(tabs)/explore/index.tsx`

**Step 1: Import and render QuickActionsRow**

At the top of `app/(tabs)/explore/index.tsx`, add the import:

```typescript
import { QuickActionsRow } from '@/components/explore/QuickActionsRow';
```

In the `renderItem` function, add a case for `quick-actions` right after the `editorial-collection` case:

```typescript
case 'quick-actions':
  return <QuickActionsRow />;
```

**Step 2: Update keyExtractor**

Add a case in `keyExtractor`:

```typescript
case 'quick-actions':
  return 'quick-actions';
```

**Step 3: Verify on device**

Run: `npx expo start` — verify the pill buttons appear below the first editorial card. Verify "My trips" navigates to the Trips tab. The other 3 buttons will not work yet (screens don't exist).

**Step 4: Commit**

```bash
git add app/(tabs)/explore/index.tsx
git commit -m "feat: render quick actions row in Explore feed"
```

---

## Task 4: Add "View all" to country pair section

**Files:**
- Modify: `app/(tabs)/explore/index.tsx`

The country pair currently just shows two country cards side by side. Add a subtle "View all" link to the right of the pair, styled as a small text link (matching existing `SectionLabel` pattern).

**Step 1: Update CountryPairCard to include section label**

Replace the existing `CountryPairCard` component in `app/(tabs)/explore/index.tsx`:

```typescript
function CountryPairCard({ countries, onCountryPress, onViewAll }: {
  countries: [Country, Country];
  onCountryPress: (slug: string) => void;
  onViewAll: () => void;
}) {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>COUNTRIES</Text>
        <Pressable onPress={onViewAll} hitSlop={8}>
          <Text style={styles.seeAllLink}>See all</Text>
        </Pressable>
      </View>
      <View style={styles.pairRow}>
        <CountryCard
          country={countries[0]}
          onPress={() => onCountryPress(countries[0].slug)}
        />
        <CountryCard
          country={countries[1]}
          onPress={() => onCountryPress(countries[1].slug)}
        />
      </View>
    </View>
  );
}
```

**Step 2: Update the renderItem country-pair case**

```typescript
case 'country-pair':
  return (
    <CountryPairCard
      countries={item.data}
      onCountryPress={(slug) => router.push(`/explore/country/${slug}`)}
      onViewAll={() => router.push('/explore/all-countries')}
    />
  );
```

**Step 3: Add section header styles**

Add to the `styles` StyleSheet:

```typescript
sectionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: spacing.md,
},
sectionLabel: {
  fontFamily: fonts.medium,
  fontSize: 12,
  letterSpacing: 1,
  color: colors.textMuted,
},
seeAllLink: {
  fontFamily: fonts.medium,
  fontSize: 13,
  color: colors.orange,
},
```

**Step 4: Commit**

```bash
git add app/(tabs)/explore/index.tsx
git commit -m "feat: add 'See all' link to country pair section"
```

---

## Task 5: Add new API functions for browse-all screens

**Files:**
- Modify: `data/api.ts`

We need a few new query functions to support the All screens with search and tag filtering.

**Step 1: Add `getAllCities` function**

Add after the existing `getPopularCities` function (around line 247 in `data/api.ts`):

```typescript
export async function getAllCities(): Promise<City[]> {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('is_active', true)
    .order('order_index');
  if (error) throw error;
  return mapCities(data ?? []);
}
```

**Step 2: Add `getAllActivities` function**

Add after `getActivitiesByCity` (around line 540):

```typescript
export async function getAllActivities(limit = 50): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('is_active', true)
    .in('place_type', ['tour', 'activity', 'landmark'])
    .order('curation_score', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return rowsToCamel<Place>(data ?? []);
}
```

**Step 3: Add `getUniqueDestinationTagSlugs` function**

Add after the destination tags section (around line 353):

```typescript
export async function getUniqueDestinationTagSlugs(
  entityType: 'country' | 'city' | 'neighborhood',
  tagCategory?: string,
): Promise<{ tagSlug: string; tagLabel: string }[]> {
  let query = supabase
    .from('destination_tags')
    .select('tag_slug, tag_label')
    .eq('entity_type', entityType);

  if (tagCategory) {
    query = query.eq('tag_category', tagCategory);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Deduplicate by tag_slug
  const seen = new Map<string, string>();
  for (const row of data ?? []) {
    if (!seen.has(row.tag_slug)) {
      seen.set(row.tag_slug, row.tag_label);
    }
  }

  return Array.from(seen.entries()).map(([tagSlug, tagLabel]) => ({
    tagSlug,
    tagLabel,
  }));
}
```

**Step 4: Enhance `searchDestinations` to include areas and activities**

Replace the existing `searchDestinations` function (lines 1054-1097 in `data/api.ts`):

```typescript
export async function searchDestinations(query: string): Promise<DestinationResult[]> {
  const q = escapeIlike(query.toLowerCase().trim());
  if (!q) return [];

  const results: DestinationResult[] = [];

  // Search countries
  const { data: countries } = await supabase
    .from('countries')
    .select('id, name, slug, iso2')
    .eq('is_active', true)
    .ilike('name', `%${q}%`)
    .limit(5);

  for (const c of countries ?? []) {
    results.push({
      type: 'country',
      id: c.id,
      name: c.name,
      slug: c.slug,
      parentName: null,
      countryIso2: c.iso2,
    });
  }

  // Search cities
  const { data: cities } = await supabase
    .from('cities')
    .select('id, name, slug, country_id, countries(name, iso2)')
    .eq('is_active', true)
    .ilike('name', `%${q}%`)
    .limit(5);

  for (const c of cities ?? []) {
    results.push({
      type: 'city',
      id: c.id,
      name: c.name,
      slug: c.slug,
      parentName: (c as any).countries?.name ?? null,
      countryIso2: (c as any).countries?.iso2 ?? null,
    });
  }

  // Search areas (neighborhoods)
  const { data: areas } = await supabase
    .from('city_areas')
    .select('id, name, slug, city_id, cities(name, slug)')
    .eq('is_active', true)
    .ilike('name', `%${q}%`)
    .limit(5);

  for (const a of areas ?? []) {
    results.push({
      type: 'area',
      id: a.id,
      name: a.name,
      slug: (a as any).cities?.slug ?? a.slug,
      parentName: (a as any).cities?.name ?? null,
      countryIso2: null,
    });
  }

  // Search activities
  const { data: activities } = await supabase
    .from('places')
    .select('id, name, slug, city_id, cities(name)')
    .eq('is_active', true)
    .in('place_type', ['tour', 'activity', 'landmark'])
    .ilike('name', `%${q}%`)
    .limit(5);

  for (const a of activities ?? []) {
    results.push({
      type: 'activity',
      id: a.id,
      name: a.name,
      slug: a.slug,
      parentName: (a as any).cities?.name ?? null,
      countryIso2: null,
    });
  }

  return results.slice(0, 20);
}
```

**Step 5: Update DestinationResult type to include new types**

Update the `DestinationResult` interface (around line 1045):

```typescript
export interface DestinationResult {
  type: 'country' | 'city' | 'area' | 'activity';
  id: string;
  name: string;
  slug: string;
  parentName: string | null;
  countryIso2: string | null;
}
```

**Step 6: Commit**

```bash
git add data/api.ts
git commit -m "feat: add browse-all API functions and enhanced search"
```

---

## Task 6: Create AllCountriesScreen

**Files:**
- Create: `app/(tabs)/explore/all-countries.tsx`

A clean FlatList screen with search input at top and optional tag filter chips. Powered entirely by Supabase.

**Step 1: Write the screen**

```typescript
// app/(tabs)/explore/all-countries.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/design';
import {
  getCountries,
  getCountriesByTags,
  getUniqueDestinationTagSlugs,
} from '@/data/api';
import type { Country } from '@/data/types';

export default function AllCountriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tags, setTags] = useState<{ tagSlug: string; tagLabel: string }[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [allCountries, availableTags] = await Promise.all([
          activeTag ? getCountriesByTags([activeTag]) : getCountries(),
          getUniqueDestinationTagSlugs('country', 'travel_style'),
        ]);
        setCountries(allCountries);
        setTags(availableTags);
      } catch (err) {
        console.error('Failed to load countries:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeTag]);

  const filtered = useMemo(() => {
    if (!search.trim()) return countries;
    const q = search.toLowerCase();
    return countries.filter((c) => c.name.toLowerCase().includes(q));
  }, [countries, search]);

  const handleTagPress = useCallback((slug: string) => {
    setActiveTag((prev) => (prev === slug ? null : slug));
  }, []);

  const renderCountry = useCallback(({ item }: { item: Country }) => (
    <Pressable
      style={styles.listItem}
      onPress={() => router.push(`/explore/country/${item.slug}`)}
    >
      <Image
        source={{ uri: item.heroImageUrl ?? undefined }}
        style={styles.listImage}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.listContent}>
        <Text style={styles.listTitle}>{item.name}</Text>
        {item.shortBlurb && (
          <Text style={styles.listSubtitle} numberOfLines={2}>
            {item.shortBlurb}
          </Text>
        )}
        {item.soloLevel && (
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>
              {item.soloLevel.charAt(0).toUpperCase() + item.soloLevel.slice(1)}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  ), [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>All Countries</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search countries"
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Feather name="x" size={16} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Tag filters */}
      {tags.length > 0 && (
        <View style={styles.tagsRow}>
          <FlatList
            horizontal
            data={tags}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsContent}
            keyExtractor={(t) => t.tagSlug}
            renderItem={({ item: tag }) => (
              <Pressable
                style={[
                  styles.tagChip,
                  activeTag === tag.tagSlug && styles.tagChipActive,
                ]}
                onPress={() => handleTagPress(tag.tagSlug)}
              >
                <Text
                  style={[
                    styles.tagText,
                    activeTag === tag.tagSlug && styles.tagTextActive,
                  ]}
                >
                  {tag.tagLabel}
                </Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* List */}
      <FlatList
        data={filtered}
        renderItem={renderCountry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No countries found</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.screenX,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
  },
  tagsRow: {
    marginTop: spacing.md,
  },
  tagsContent: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.sm,
  },
  tagChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  tagChipActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  tagTextActive: {
    color: colors.background,
  },
  list: {
    padding: spacing.screenX,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  listItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  listImage: {
    width: 100,
    height: 100,
    borderRadius: radius.card,
    backgroundColor: colors.neutralFill,
  },
  listContent: {
    flex: 1,
    justifyContent: 'center',
  },
  listTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  listSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.neutralFill,
  },
  levelText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
});
```

**Step 2: Commit**

```bash
git add app/(tabs)/explore/all-countries.tsx
git commit -m "feat: add AllCountriesScreen with search and tag filters"
```

---

## Task 7: Create AllDestinationsScreen

**Files:**
- Create: `app/(tabs)/explore/all-destinations.tsx`

Same pattern as AllCountriesScreen but for cities. Shows city name + country name.

**Step 1: Write the screen**

```typescript
// app/(tabs)/explore/all-destinations.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { getAllCities, getCountryById } from '@/data/api';
import type { City } from '@/data/types';

interface CityRow extends City {
  countryName: string;
}

export default function AllDestinationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [cities, setCities] = useState<CityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const allCities = await getAllCities();
        // Fetch country names
        const countryIds = [...new Set(allCities.map((c) => c.countryId))];
        const countryResults = await Promise.all(
          countryIds.map((id) => getCountryById(id))
        );
        const countryMap = new Map(
          countryResults.filter(Boolean).map((c) => [c!.id, c!.name])
        );

        setCities(
          allCities.map((city) => ({
            ...city,
            countryName: countryMap.get(city.countryId) ?? '',
          }))
        );
      } catch (err) {
        console.error('Failed to load cities:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return cities;
    const q = search.toLowerCase();
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.countryName.toLowerCase().includes(q)
    );
  }, [cities, search]);

  const renderCity = useCallback(
    ({ item }: { item: CityRow }) => (
      <Pressable
        style={styles.listItem}
        onPress={() => router.push(`/explore/city/${item.slug}`)}
      >
        <Image
          source={{ uri: item.heroImageUrl ?? undefined }}
          style={styles.listImage}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.listContent}>
          <Text style={styles.listTitle}>{item.name}</Text>
          <Text style={styles.listSubtitle}>{item.countryName}</Text>
          {item.shortBlurb && (
            <Text style={styles.listBlurb} numberOfLines={2}>
              {item.shortBlurb}
            </Text>
          )}
        </View>
      </Pressable>
    ),
    [router]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>All Destinations</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search destinations"
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Feather name="x" size={16} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        renderItem={renderCity}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No destinations found</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.screenX,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
  },
  list: {
    padding: spacing.screenX,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  listItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  listImage: {
    width: 100,
    height: 100,
    borderRadius: radius.card,
    backgroundColor: colors.neutralFill,
  },
  listContent: {
    flex: 1,
    justifyContent: 'center',
  },
  listTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  listSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listBlurb: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
});
```

**Step 2: Commit**

```bash
git add app/(tabs)/explore/all-destinations.tsx
git commit -m "feat: add AllDestinationsScreen with search"
```

---

## Task 8: Create AllActivitiesScreen

**Files:**
- Create: `app/(tabs)/explore/all-activities.tsx`

**Step 1: Write the screen**

```typescript
// app/(tabs)/explore/all-activities.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { getAllActivities, getCityById } from '@/data/api';
import type { Place } from '@/data/types';

interface ActivityRow extends Place {
  cityName: string;
}

export default function AllActivitiesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const allActivities = await getAllActivities(100);
        // Fetch city names
        const cityIds = [...new Set(allActivities.map((a) => a.cityId))];
        const cityResults = await Promise.all(
          cityIds.map((id) => getCityById(id))
        );
        const cityMap = new Map(
          cityResults.filter(Boolean).map((c) => [c!.id, c!.name])
        );

        setActivities(
          allActivities.map((activity) => ({
            ...activity,
            cityName: cityMap.get(activity.cityId) ?? '',
          }))
        );
      } catch (err) {
        console.error('Failed to load activities:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return activities;
    const q = search.toLowerCase();
    return activities.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.cityName.toLowerCase().includes(q)
    );
  }, [activities, search]);

  const renderActivity = useCallback(
    ({ item }: { item: ActivityRow }) => (
      <Pressable
        style={styles.listItem}
        onPress={() => router.push(`/explore/activity/${item.slug}`)}
      >
        <View style={styles.listImageContainer}>
          {item.highlights && item.highlights.length > 0 && (
            <View style={styles.highlightBadge}>
              <Text style={styles.highlightText} numberOfLines={1}>
                {item.highlights[0]}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.listContent}>
          <Text style={styles.listTitle} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.listSubtitle}>{item.cityName}</Text>
          {item.placeType && (
            <Text style={styles.listType}>
              {item.placeType.charAt(0).toUpperCase() + item.placeType.slice(1)}
            </Text>
          )}
          {item.estimatedDuration && (
            <Text style={styles.listDuration}>{item.estimatedDuration}</Text>
          )}
        </View>
      </Pressable>
    ),
    [router]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>All Activities</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search activities"
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Feather name="x" size={16} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No activities found</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.screenX,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
  },
  list: {
    padding: spacing.screenX,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  listItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  listImageContainer: {
    width: 100,
    height: 100,
    borderRadius: radius.card,
    backgroundColor: colors.neutralFill,
    overflow: 'hidden',
  },
  highlightBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  highlightText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: '#FFFFFF',
  },
  listContent: {
    flex: 1,
    justifyContent: 'center',
  },
  listTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  listSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listType: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  listDuration: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
});
```

**Step 2: Commit**

```bash
git add app/(tabs)/explore/all-activities.tsx
git commit -m "feat: add AllActivitiesScreen with search"
```

---

## Task 9: Register new screens in Explore stack navigator

**Files:**
- Modify: `app/(tabs)/explore/_layout.tsx`

**Step 1: Add the three new screen routes**

```typescript
import { Stack } from 'expo-router';

export default function ExploreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="search"
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen name="see-all" />
      <Stack.Screen name="all-countries" />
      <Stack.Screen name="all-destinations" />
      <Stack.Screen name="all-activities" />
      <Stack.Screen name="country/[slug]" />
      <Stack.Screen name="city/[slug]" />
      <Stack.Screen name="collection/[slug]" />
      <Stack.Screen name="activity/[slug]" />
      <Stack.Screen name="place-detail/[id]" />
    </Stack>
  );
}
```

**Step 2: Verify navigation**

Run: `npx expo start` — tap each quick action pill and verify:
- "Countries" → AllCountriesScreen
- "Destinations" → AllDestinationsScreen
- "Activities" → AllActivitiesScreen
- "My trips" → Trips tab
- "See all" on country pair → AllCountriesScreen

**Step 3: Commit**

```bash
git add app/(tabs)/explore/_layout.tsx
git commit -m "feat: register browse-all screens in Explore stack"
```

---

## Task 10: Upgrade search screen with grouped results

**Files:**
- Modify: `data/explore/useSearch.ts`
- Modify: `app/(tabs)/explore/search.tsx`

**Step 1: Update SearchResult type to support areas and activities**

In `data/explore/useSearch.ts`, update the `SearchResult` interface:

```typescript
export interface SearchResult {
  id: string;
  name: string;
  type: 'country' | 'city' | 'area' | 'activity';
  context: string;
  slug: string;
}
```

Update the mapping in the `useEffect` debounced search to handle new types:

```typescript
setResults(
  data.map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type,
    context:
      d.type === 'country'
        ? 'Country'
        : d.type === 'area'
        ? `Area in ${d.parentName ?? ''}`
        : d.type === 'activity'
        ? d.parentName ?? 'Activity'
        : d.parentName ?? '',
    slug: d.slug,
  }))
);
```

**Step 2: Update search screen to show grouped results**

In `app/(tabs)/explore/search.tsx`, replace the flat `FlatList` with grouped sections.

Replace the results rendering section (around lines 147-156) with:

```typescript
// Group results by type
const groupedResults = useMemo(() => {
  const groups: { title: string; type: string; data: SearchResult[] }[] = [];
  const typeLabels: Record<string, string> = {
    country: 'Countries',
    city: 'Cities',
    area: 'Areas',
    activity: 'Activities',
  };
  const order: SearchResult['type'][] = ['country', 'city', 'area', 'activity'];

  for (const type of order) {
    const items = results.filter((r) => r.type === type);
    if (items.length > 0) {
      groups.push({ title: typeLabels[type] ?? type, type, data: items });
    }
  }

  return groups;
}, [results]);
```

Add a `useMemo` import at the top of the file.

Replace the results FlatList with a SectionList rendering:

```typescript
) : (
  // Grouped Results
  <FlatList
    data={groupedResults}
    renderItem={({ item: group }) => (
      <View>
        <Text style={styles.groupTitle}>{group.title}</Text>
        {group.data.map((result) => (
          <Pressable
            key={`${result.type}-${result.id}`}
            style={styles.resultRow}
            onPress={() => handleResultPress(result)}
          >
            <View style={styles.resultContent}>
              <Text style={styles.resultName}>{result.name}</Text>
              <Text style={styles.resultContext}>{result.context}</Text>
            </View>
            <Text style={styles.resultType}>{result.type}</Text>
          </Pressable>
        ))}
      </View>
    )}
    keyExtractor={(group) => group.type}
    contentContainerStyle={styles.results}
    keyboardShouldPersistTaps="handled"
  />
)}
```

**Step 3: Update handleResultPress to handle new types**

```typescript
const handleResultPress = (result: SearchResult) => {
  posthog.capture('search_result_selected', {
    type: result.type,
    name: result.name,
    query,
  });
  addRecentSearch(result.name);

  switch (result.type) {
    case 'country':
      router.push(`/(tabs)/explore/country/${result.slug}`);
      break;
    case 'city':
      router.push(`/(tabs)/explore/city/${result.slug}`);
      break;
    case 'area':
      // Areas navigate to their parent city
      router.push(`/(tabs)/explore/city/${result.slug}`);
      break;
    case 'activity':
      router.push(`/(tabs)/explore/activity/${result.slug}`);
      break;
  }
};
```

**Step 4: Add groupTitle style**

```typescript
groupTitle: {
  fontFamily: fonts.medium,
  fontSize: 12,
  letterSpacing: 1,
  color: colors.textMuted,
  textTransform: 'uppercase',
  paddingHorizontal: spacing.screenX,
  paddingTop: spacing.lg,
  paddingBottom: spacing.sm,
},
```

**Step 5: Commit**

```bash
git add data/explore/useSearch.ts app/(tabs)/explore/search.tsx
git commit -m "feat: upgrade search with grouped results across all entity types"
```

---

## Task 11: Remove mock data dependency from see-all screen

**Files:**
- Modify: `app/(tabs)/explore/see-all.tsx`

The existing see-all screen uses `exploreMockData.ts`. Replace it with a redirect to the appropriate All screen, or simplify it to use Supabase data.

**Step 1: Rewrite see-all to delegate to the new All screens**

Replace the entire `app/(tabs)/explore/see-all.tsx`:

```typescript
// app/(tabs)/explore/see-all.tsx
// Legacy see-all screen — redirects to new browse-all screens
import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function SeeAllScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category: string; title: string }>();

  useEffect(() => {
    const category = params.category || '';

    if (category.startsWith('continent-') || category === 'all-countries') {
      router.replace('/explore/all-countries');
    } else if (category.startsWith('cities-')) {
      router.replace('/explore/all-destinations');
    } else if (category.startsWith('activities-')) {
      router.replace('/explore/all-activities');
    } else {
      router.replace('/explore/all-countries');
    }
  }, [params.category, router]);

  return null;
}
```

**Step 2: Commit**

```bash
git add app/(tabs)/explore/see-all.tsx
git commit -m "refactor: replace mock see-all with redirects to browse-all screens"
```

---

## Task 12: Final integration test and cleanup

**Files:**
- Verify: All screens load from Supabase data
- Verify: No TypeScript errors
- Verify: Navigation works end-to-end

**Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 2: Test full flow on device**

1. Open Explore tab
2. Verify hero editorial card appears
3. Verify quick actions row appears below hero
4. Tap "Countries" → AllCountriesScreen loads with real data
5. Type in search → filters countries client-side
6. Tap a tag chip → re-fetches countries by tag
7. Tap a country → navigates to country detail
8. Go back → tap "Destinations" → AllDestinationsScreen loads
9. Go back → tap "Activities" → AllActivitiesScreen loads
10. Go back → tap "My trips" → switches to Trips tab
11. Go back to Explore → verify "See all" on country section → goes to AllCountriesScreen
12. Tap search bar at top → search screen opens
13. Type "Ubud" → grouped results show with "Cities" header
14. Type "Thailand" → grouped results show with "Countries" header

**Step 3: Verify no console errors**

Check Metro bundler output for:
- No hook-order errors
- No missing key warnings
- No undefined navigation routes

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Explore functional upgrade with browse-all and enhanced search"
```

---

## Architecture Decisions

### Why quick-actions as a feed item (not a header)
- The FlatList has `paddingVertical` in its content container. Inserting quick-actions as a feed item keeps it within the scroll flow naturally.
- If it were a ListHeaderComponent, it would always be visible and feel like a permanent UI element. As a feed item, it scrolls away — consistent with the "natural extension" requirement.
- It also means we don't need to modify the FlatList configuration at all.

### Why client-side search filtering on All screens
- The data set is small (< 100 countries, < 200 cities at launch).
- Client-side filtering gives instant results with no network latency.
- The data is already fetched once on screen mount.
- Structured so server-side search can replace it later (just swap the `filtered` memo with a debounced API call).

### Why separate All screens (not a parameterized generic)
- Each entity type has different fields (countries have soloLevel, cities have countryName, activities have duration).
- Different screens allow different tag categories and filter logic.
- Easier to maintain and test independently.
- Follows Expo Router's file-based routing convention.

### Why redirect see-all instead of deleting it
- The `see-all` route may be deep-linked or cached in navigation state.
- A redirect ensures no broken navigation flows.
- `exploreMockData.ts` can be deleted separately once confirmed unused.

---

## Summary

This plan delivers:

1. **Quick actions row** — subtle pill buttons below hero (Countries, Destinations, Activities, My trips)
2. **"See all" on country section** — links to AllCountriesScreen
3. **AllCountriesScreen** — FlatList with search + tag filter chips, Supabase data
4. **AllDestinationsScreen** — FlatList with search, cities + country names, Supabase data
5. **AllActivitiesScreen** — FlatList with search, activities + city names, Supabase data
6. **Enhanced search** — queries countries, cities, areas, AND activities; groups results by type
7. **Zero hardcoded data** — all from Supabase tables
8. **Minimal design disruption** — uses existing colors, fonts, spacing, radius tokens

12 tasks, each independently committable. Feed stays intact. Design stays premium.
