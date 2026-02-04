# Explore Page Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the tab-based Explore page with a unified, editorial-style feed that mixes content types with visual rhythm.

**Architecture:** FlatList-based feed with typed FeedItem union. feedBuilder function assembles rhythm pattern from raw data. Cards are content-type specific with distinct sizing.

**Tech Stack:** React Native, Expo Router, Supabase, TypeScript, expo-image

---

## Phase 1: Data Layer Foundation

### Task 1: Define FeedItem Types

**Files:**
- Create: `data/explore/types.ts`

**Step 1: Create the types file**

```typescript
// data/explore/types.ts
import type { Country, City, Place } from '../types';

export interface EditorialCollection {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  heroImageUrl: string;
  destinations: EditorialDestination[];
  isSponsored: boolean;
  sponsorName: string | null;
  orderIndex: number;
}

export interface EditorialDestination {
  type: 'country' | 'city';
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface CityWithCountry extends City {
  countryName: string;
  countrySlug: string;
}

export interface ActivityWithCity extends Place {
  cityName: string;
  imageUrl: string | null;
}

export type FeedItem =
  | { type: 'editorial-collection'; data: EditorialCollection }
  | { type: 'country-pair'; data: [Country, Country] }
  | { type: 'city-spotlight'; data: CityWithCountry; activities: ActivityWithCity[] }
  | { type: 'activity-cluster'; data: ActivityWithCity[]; cityName: string; citySlug: string }
  | { type: 'end-card' };

export type FeedItemType = FeedItem['type'];
```

**Step 2: Commit**

```bash
git add data/explore/types.ts
git commit -m "feat(explore): add FeedItem types for unified feed"
```

---

### Task 2: Create feedBuilder Logic

**Files:**
- Create: `data/explore/feedBuilder.ts`

**Step 1: Create the feed builder**

```typescript
// data/explore/feedBuilder.ts
import type { Country, City, Place } from '../types';
import type {
  FeedItem,
  EditorialCollection,
  CityWithCountry,
  ActivityWithCity,
} from './types';

/**
 * Build the Explore feed with rhythmic content interleaving.
 * Pattern: Editorial → Country pair → City spotlight → Activities → Editorial...
 */
export function buildFeed(
  editorials: EditorialCollection[],
  countries: Country[],
  citiesWithActivities: { city: CityWithCountry; activities: ActivityWithCity[] }[]
): FeedItem[] {
  const feed: FeedItem[] = [];

  let editorialIndex = 0;
  let countryIndex = 0;
  let cityIndex = 0;

  // Build ~15-20 items following the rhythm
  const maxItems = 18;

  while (feed.length < maxItems) {
    const beatPosition = feed.length % 5;

    switch (beatPosition) {
      case 0: // Editorial collection
        if (editorialIndex < editorials.length) {
          feed.push({
            type: 'editorial-collection',
            data: editorials[editorialIndex++],
          });
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

      case 3: // Activity cluster (from next city)
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

      case 4: // Another editorial or skip
        if (editorialIndex < editorials.length) {
          feed.push({
            type: 'editorial-collection',
            data: editorials[editorialIndex++],
          });
        }
        break;
    }

    // Safety: if we can't add anything, break
    if (
      editorialIndex >= editorials.length &&
      countryIndex >= countries.length &&
      cityIndex >= citiesWithActivities.length
    ) {
      break;
    }
  }

  // Add end card
  feed.push({ type: 'end-card' });

  return feed;
}
```

**Step 2: Commit**

```bash
git add data/explore/feedBuilder.ts
git commit -m "feat(explore): add feedBuilder with rhythm pattern"
```

---

### Task 3: Create useFeedItems Hook

**Files:**
- Create: `data/explore/useFeedItems.ts`
- Create: `data/explore/index.ts`

**Step 1: Create the hook**

```typescript
// data/explore/useFeedItems.ts
import { useState, useEffect } from 'react';
import {
  getCountries,
  getPopularCities,
  getCityById,
  getCountryById,
  getActivitiesByCity,
  getPlaceFirstImage,
} from '../api';
import { buildFeed } from './feedBuilder';
import type { FeedItem, EditorialCollection, CityWithCountry, ActivityWithCity } from './types';

// Mock editorial collections until database table exists
const MOCK_EDITORIALS: EditorialCollection[] = [
  {
    id: '1',
    slug: 'first-solo-trips',
    title: 'Best destinations for your first solo trip',
    subtitle: 'For first-timers who want ease and charm',
    heroImageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
    destinations: [],
    isSponsored: false,
    sponsorName: null,
    orderIndex: 0,
  },
  {
    id: '2',
    slug: 'calm-beach-towns',
    title: 'Calm beach towns for slow travel',
    subtitle: 'Where the pace is gentle and the views are endless',
    heroImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    destinations: [],
    isSponsored: false,
    sponsorName: null,
    orderIndex: 1,
  },
  {
    id: '3',
    slug: 'cultural-capitals',
    title: 'Cultural capitals worth exploring',
    subtitle: 'Art, history, and unforgettable experiences',
    heroImageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
    destinations: [],
    isSponsored: false,
    sponsorName: null,
    orderIndex: 2,
  },
];

interface UseFeedItemsResult {
  feedItems: FeedItem[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useFeedItems(): UseFeedItemsResult {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadFeed() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch countries
        const countries = await getCountries();

        // Fetch popular cities and enrich with country info
        const cities = await getPopularCities(8);
        const citiesWithActivities: { city: CityWithCountry; activities: ActivityWithCity[] }[] = [];

        for (const city of cities) {
          if (cancelled) return;

          const country = await getCountryById(city.countryId);
          const activities = await getActivitiesByCity(city.id);

          // Get images for activities
          const activitiesWithImages: ActivityWithCity[] = await Promise.all(
            activities.slice(0, 4).map(async (activity) => {
              const imageUrl = await getPlaceFirstImage(activity.id);
              return {
                ...activity,
                cityName: city.name,
                imageUrl,
              };
            })
          );

          citiesWithActivities.push({
            city: {
              ...city,
              countryName: country?.name ?? '',
              countrySlug: country?.slug ?? '',
            },
            activities: activitiesWithImages,
          });
        }

        if (cancelled) return;

        const feed = buildFeed(MOCK_EDITORIALS, countries, citiesWithActivities);
        setFeedItems(feed);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load feed'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadFeed();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  return { feedItems, isLoading, error, refresh };
}
```

**Step 2: Create index barrel**

```typescript
// data/explore/index.ts
export * from './types';
export * from './feedBuilder';
export * from './useFeedItems';
```

**Step 3: Commit**

```bash
git add data/explore/
git commit -m "feat(explore): add useFeedItems hook with data fetching"
```

---

## Phase 2: Card Components

### Task 4: Create SectionLabel Component

**Files:**
- Create: `components/explore/sections/SectionLabel.tsx`

**Step 1: Create the component**

```typescript
// components/explore/sections/SectionLabel.tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/design';

interface SectionLabelProps {
  label: string;
  onSeeAll?: () => void;
}

export function SectionLabel({ label, onSeeAll }: SectionLabelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    letterSpacing: 1,
    color: colors.textSecondary,
  },
  seeAll: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
});
```

**Step 2: Commit**

```bash
git add components/explore/sections/SectionLabel.tsx
git commit -m "feat(explore): add SectionLabel component"
```

---

### Task 5: Create EditorialCollectionCard

**Files:**
- Create: `components/explore/cards/EditorialCollectionCard.tsx`

**Step 1: Create the component**

```typescript
// components/explore/cards/EditorialCollectionCard.tsx
import { Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, fonts, spacing, radius } from '@/constants/design';
import type { EditorialCollection } from '@/data/explore/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - spacing.screenX * 2;
const CARD_HEIGHT = 300;

interface EditorialCollectionCardProps {
  collection: EditorialCollection;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function EditorialCollectionCard({ collection, onPress }: EditorialCollectionCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <Image
        source={{ uri: collection.heroImageUrl }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.gradient}
      />
      <View style={styles.content}>
        {collection.isSponsored && (
          <Text style={styles.sponsored}>Sponsored</Text>
        )}
        <Text style={styles.title}>{collection.title}</Text>
        {collection.subtitle && (
          <Text style={styles.subtitle}>{collection.subtitle}</Text>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: spacing.screenX,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
  },
  sponsored: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
});
```

**Step 2: Commit**

```bash
git add components/explore/cards/EditorialCollectionCard.tsx
git commit -m "feat(explore): add EditorialCollectionCard component"
```

---

### Task 6: Create CountryCard

**Files:**
- Create: `components/explore/cards/CountryCard.tsx`

**Step 1: Create the component**

```typescript
// components/explore/cards/CountryCard.tsx
import { Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, fonts, spacing, radius } from '@/constants/design';
import type { Country } from '@/data/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GAP = spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.screenX * 2 - GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.1;

interface CountryCardProps {
  country: Country;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CountryCard({ country, onPress }: CountryCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const imageUrl = country.heroImageUrl ?? 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400';

  return (
    <View style={styles.wrapper}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, animatedStyle]}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.gradient}
        />
        <Text style={styles.name}>{country.name}</Text>
      </AnimatedPressable>
      {country.shortBlurb && (
        <Text style={styles.blurb} numberOfLines={1}>{country.shortBlurb}</Text>
      )}
    </View>
  );
}

export { CARD_WIDTH as COUNTRY_CARD_WIDTH, GAP as COUNTRY_CARD_GAP };

const styles = StyleSheet.create({
  wrapper: {
    width: CARD_WIDTH,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  name: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  blurb: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
});
```

**Step 2: Commit**

```bash
git add components/explore/cards/CountryCard.tsx
git commit -m "feat(explore): add CountryCard component"
```

---

### Task 7: Create CitySpotlightCard

**Files:**
- Create: `components/explore/cards/CitySpotlightCard.tsx`

**Step 1: Create the component**

```typescript
// components/explore/cards/CitySpotlightCard.tsx
import { Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, fonts, spacing, radius } from '@/constants/design';
import type { CityWithCountry } from '@/data/explore/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - spacing.screenX * 2;
const CARD_HEIGHT = CARD_WIDTH * (9 / 16); // 16:9 aspect ratio

interface CitySpotlightCardProps {
  city: CityWithCountry;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CitySpotlightCard({ city, onPress }: CitySpotlightCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const imageUrl = city.heroImageUrl ?? 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800';

  return (
    <View style={styles.container}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, animatedStyle]}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      </AnimatedPressable>
      <View style={styles.info}>
        <Text style={styles.name}>{city.name}</Text>
        <Text style={styles.country}>{city.countryName}</Text>
      </View>
      {city.shortBlurb && (
        <Text style={styles.blurb} numberOfLines={2}>{city.shortBlurb}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  country: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  blurb: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
```

**Step 2: Commit**

```bash
git add components/explore/cards/CitySpotlightCard.tsx
git commit -m "feat(explore): add CitySpotlightCard component"
```

---

### Task 8: Create ActivityCard

**Files:**
- Create: `components/explore/cards/ActivityCard.tsx`

**Step 1: Create the component**

```typescript
// components/explore/cards/ActivityCard.tsx
import { Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, fonts, spacing, radius } from '@/constants/design';
import type { ActivityWithCity } from '@/data/explore/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const VISIBLE_CARDS = 3.3;
const CARD_GAP = spacing.md;
const CARD_SIZE = (SCREEN_WIDTH - spacing.screenX * 2 - CARD_GAP * 2) / VISIBLE_CARDS;

interface ActivityCardProps {
  activity: ActivityWithCity;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ActivityCard({ activity, onPress }: ActivityCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const imageUrl = activity.imageUrl ?? 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      </View>
      <Text style={styles.name} numberOfLines={2}>{activity.name}</Text>
    </AnimatedPressable>
  );
}

export { CARD_SIZE as ACTIVITY_CARD_SIZE, CARD_GAP as ACTIVITY_CARD_GAP };

const styles = StyleSheet.create({
  container: {
    width: CARD_SIZE,
  },
  imageContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  name: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
});
```

**Step 2: Commit**

```bash
git add components/explore/cards/ActivityCard.tsx
git commit -m "feat(explore): add ActivityCard component"
```

---

### Task 9: Create cards barrel export

**Files:**
- Create: `components/explore/cards/index.ts`

**Step 1: Create the index file**

```typescript
// components/explore/cards/index.ts
export { EditorialCollectionCard } from './EditorialCollectionCard';
export { CountryCard, COUNTRY_CARD_WIDTH, COUNTRY_CARD_GAP } from './CountryCard';
export { CitySpotlightCard } from './CitySpotlightCard';
export { ActivityCard, ACTIVITY_CARD_SIZE, ACTIVITY_CARD_GAP } from './ActivityCard';
```

**Step 2: Commit**

```bash
git add components/explore/cards/index.ts
git commit -m "feat(explore): add cards barrel export"
```

---

## Phase 3: Section Components

### Task 10: Create CountryPairSection

**Files:**
- Create: `components/explore/sections/CountryPairSection.tsx`

**Step 1: Create the component**

```typescript
// components/explore/sections/CountryPairSection.tsx
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { spacing } from '@/constants/design';
import { CountryCard, COUNTRY_CARD_GAP } from '../cards';
import type { Country } from '@/data/types';

interface CountryPairSectionProps {
  countries: [Country, Country];
}

export function CountryPairSection({ countries }: CountryPairSectionProps) {
  const router = useRouter();

  const handlePress = (country: Country) => {
    router.push(`/(tabs)/explore/country/${country.slug}`);
  };

  return (
    <View style={styles.container}>
      <CountryCard country={countries[0]} onPress={() => handlePress(countries[0])} />
      <CountryCard country={countries[1]} onPress={() => handlePress(countries[1])} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenX,
    gap: COUNTRY_CARD_GAP,
  },
});
```

**Step 2: Commit**

```bash
git add components/explore/sections/CountryPairSection.tsx
git commit -m "feat(explore): add CountryPairSection component"
```

---

### Task 11: Create CitySpotlightSection

**Files:**
- Create: `components/explore/sections/CitySpotlightSection.tsx`

**Step 1: Create the component**

```typescript
// components/explore/sections/CitySpotlightSection.tsx
import { StyleSheet, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { spacing } from '@/constants/design';
import { CitySpotlightCard } from '../cards/CitySpotlightCard';
import { ActivityCard, ACTIVITY_CARD_SIZE, ACTIVITY_CARD_GAP } from '../cards';
import { SectionLabel } from './SectionLabel';
import type { CityWithCountry, ActivityWithCity } from '@/data/explore/types';

interface CitySpotlightSectionProps {
  city: CityWithCountry;
  activities: ActivityWithCity[];
}

export function CitySpotlightSection({ city, activities }: CitySpotlightSectionProps) {
  const router = useRouter();

  const handleCityPress = () => {
    router.push(`/(tabs)/explore/city/${city.slug}`);
  };

  const handleActivityPress = (activity: ActivityWithCity) => {
    router.push(`/(tabs)/explore/activity/${activity.slug}`);
  };

  return (
    <View style={styles.container}>
      <CitySpotlightCard city={city} onPress={handleCityPress} />

      {activities.length > 0 && (
        <View style={styles.activitiesSection}>
          <SectionLabel label={`Things to do in ${city.name}`} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activitiesScroll}
          >
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onPress={() => handleActivityPress(activity)}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  activitiesSection: {
    gap: spacing.sm,
  },
  activitiesScroll: {
    paddingHorizontal: spacing.screenX,
    gap: ACTIVITY_CARD_GAP,
  },
});
```

**Step 2: Commit**

```bash
git add components/explore/sections/CitySpotlightSection.tsx
git commit -m "feat(explore): add CitySpotlightSection component"
```

---

### Task 12: Create ActivityClusterSection

**Files:**
- Create: `components/explore/sections/ActivityClusterSection.tsx`

**Step 1: Create the component**

```typescript
// components/explore/sections/ActivityClusterSection.tsx
import { StyleSheet, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { spacing } from '@/constants/design';
import { ActivityCard, ACTIVITY_CARD_GAP } from '../cards';
import { SectionLabel } from './SectionLabel';
import type { ActivityWithCity } from '@/data/explore/types';

interface ActivityClusterSectionProps {
  activities: ActivityWithCity[];
  cityName: string;
  citySlug: string;
}

export function ActivityClusterSection({ activities, cityName, citySlug }: ActivityClusterSectionProps) {
  const router = useRouter();

  const handleActivityPress = (activity: ActivityWithCity) => {
    router.push(`/(tabs)/explore/activity/${activity.slug}`);
  };

  const handleSeeAll = () => {
    router.push({
      pathname: '/(tabs)/explore/city/[slug]',
      params: { slug: citySlug },
    });
  };

  if (activities.length === 0) return null;

  return (
    <View style={styles.container}>
      <SectionLabel
        label={`Things to do in ${cityName}`}
        onSeeAll={handleSeeAll}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onPress={() => handleActivityPress(activity)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  scroll: {
    paddingHorizontal: spacing.screenX,
    gap: ACTIVITY_CARD_GAP,
  },
});
```

**Step 2: Commit**

```bash
git add components/explore/sections/ActivityClusterSection.tsx
git commit -m "feat(explore): add ActivityClusterSection component"
```

---

### Task 13: Create FeedEndCard

**Files:**
- Create: `components/explore/FeedEndCard.tsx`

**Step 1: Create the component**

```typescript
// components/explore/FeedEndCard.tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '@/constants/design';

export function FeedEndCard() {
  const router = useRouter();

  const handleSearch = () => {
    router.push('/(tabs)/explore/search');
  };

  const handleAllCountries = () => {
    router.push({
      pathname: '/(tabs)/explore/see-all',
      params: { category: 'countries', title: 'All countries' },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Looking for somewhere specific?</Text>
      <View style={styles.buttons}>
        <Pressable style={styles.button} onPress={handleSearch}>
          <Feather name="search" size={18} color={colors.textPrimary} />
          <Text style={styles.buttonText}>Search</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleAllCountries}>
          <Feather name="globe" size={18} color={colors.textPrimary} />
          <Text style={styles.buttonText}>All countries</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
    gap: spacing.xl,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textSecondary,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  buttonText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
```

**Step 2: Commit**

```bash
git add components/explore/FeedEndCard.tsx
git commit -m "feat(explore): add FeedEndCard component"
```

---

### Task 14: Create sections barrel export

**Files:**
- Create: `components/explore/sections/index.ts`

**Step 1: Create the index file**

```typescript
// components/explore/sections/index.ts
export { SectionLabel } from './SectionLabel';
export { CountryPairSection } from './CountryPairSection';
export { CitySpotlightSection } from './CitySpotlightSection';
export { ActivityClusterSection } from './ActivityClusterSection';
```

**Step 2: Commit**

```bash
git add components/explore/sections/index.ts
git commit -m "feat(explore): add sections barrel export"
```

---

## Phase 4: Feed Components

### Task 15: Create FeedItem Renderer

**Files:**
- Create: `components/explore/FeedItem.tsx`

**Step 1: Create the component**

```typescript
// components/explore/FeedItem.tsx
import { useRouter } from 'expo-router';
import { EditorialCollectionCard } from './cards';
import {
  CountryPairSection,
  CitySpotlightSection,
  ActivityClusterSection
} from './sections';
import { FeedEndCard } from './FeedEndCard';
import type { FeedItem as FeedItemType } from '@/data/explore/types';

interface FeedItemProps {
  item: FeedItemType;
}

export function FeedItem({ item }: FeedItemProps) {
  const router = useRouter();

  switch (item.type) {
    case 'editorial-collection':
      return (
        <EditorialCollectionCard
          collection={item.data}
          onPress={() => {
            router.push({
              pathname: '/(tabs)/explore/collection/[slug]',
              params: { slug: item.data.slug },
            });
          }}
        />
      );

    case 'country-pair':
      return <CountryPairSection countries={item.data} />;

    case 'city-spotlight':
      return (
        <CitySpotlightSection
          city={item.data}
          activities={item.activities}
        />
      );

    case 'activity-cluster':
      return (
        <ActivityClusterSection
          activities={item.data}
          cityName={item.cityName}
          citySlug={item.citySlug}
        />
      );

    case 'end-card':
      return <FeedEndCard />;

    default:
      return null;
  }
}
```

**Step 2: Commit**

```bash
git add components/explore/FeedItem.tsx
git commit -m "feat(explore): add FeedItem renderer component"
```

---

### Task 16: Create ExploreFeed

**Files:**
- Create: `components/explore/ExploreFeed.tsx`

**Step 1: Create the component**

```typescript
// components/explore/ExploreFeed.tsx
import { useCallback } from 'react';
import { FlatList, StyleSheet, View, ActivityIndicator, Text, RefreshControl } from 'react-native';
import { colors, fonts, spacing } from '@/constants/design';
import { FeedItem } from './FeedItem';
import { useFeedItems } from '@/data/explore';
import type { FeedItem as FeedItemType } from '@/data/explore/types';

export function ExploreFeed() {
  const { feedItems, isLoading, error, refresh } = useFeedItems();

  const renderItem = useCallback(({ item }: { item: FeedItemType }) => {
    return (
      <View style={styles.itemContainer}>
        <FeedItem item={item} />
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: FeedItemType, index: number) => {
    switch (item.type) {
      case 'editorial-collection':
        return `editorial-${item.data.id}`;
      case 'country-pair':
        return `country-pair-${item.data[0].id}-${item.data[1].id}`;
      case 'city-spotlight':
        return `city-${item.data.id}`;
      case 'activity-cluster':
        return `activities-${item.citySlug}-${index}`;
      case 'end-card':
        return 'end-card';
      default:
        return `item-${index}`;
    }
  }, []);

  if (isLoading && feedItems.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Something went wrong</Text>
        <Text style={styles.errorSubtext}>{error.message}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={feedItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refresh}
          tintColor={colors.orange}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxxl,
  },
  itemContainer: {
    marginBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  errorSubtext: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
```

**Step 2: Commit**

```bash
git add components/explore/ExploreFeed.tsx
git commit -m "feat(explore): add ExploreFeed component"
```

---

## Phase 5: Main Page Rewrite

### Task 17: Rewrite Explore index.tsx

**Files:**
- Modify: `app/(tabs)/explore/index.tsx`

**Step 1: Replace the entire file**

```typescript
// app/(tabs)/explore/index.tsx
import { Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { Feather } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { ExploreFeed } from '@/components/explore/ExploreFeed';
import { colors, spacing } from '@/constants/design';

export default function ExploreScreen() {
  const router = useRouter();
  const posthog = usePostHog();

  const handleSearchPress = () => {
    posthog.capture('explore_search_opened');
    router.push('/(tabs)/explore/search');
  };

  return (
    <AppScreen style={styles.screen}>
      <AppHeader
        title=""
        leftComponent={
          <Image
            source={require('@/assets/images/sola-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        }
        rightComponent={
          <Pressable
            onPress={handleSearchPress}
            hitSlop={12}
            style={styles.searchBtn}
          >
            <Feather name="search" size={20} color={colors.textPrimary} />
          </Pressable>
        }
      />
      <ExploreFeed />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
  },
  logo: {
    height: 30,
    width: 90,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
});
```

**Step 2: Commit**

```bash
git add app/\(tabs\)/explore/index.tsx
git commit -m "feat(explore): replace tab-based UI with unified feed"
```

---

## Phase 6: Search Enhancement

### Task 18: Create useSearch Hook

**Files:**
- Create: `data/explore/useSearch.ts`

**Step 1: Create the hook**

```typescript
// data/explore/useSearch.ts
import { useState, useEffect, useCallback } from 'react';
import { searchDestinations } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = 'explore_recent_searches';
const MAX_RECENT = 5;

export interface SearchResult {
  id: string;
  name: string;
  type: 'country' | 'city' | 'place';
  context: string;
  slug: string;
}

interface UseSearchResult {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  isSearching: boolean;
  recentSearches: string[];
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
}

export function useSearch(): UseSearchResult {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    AsyncStorage.getItem(RECENT_SEARCHES_KEY).then((data) => {
      if (data) {
        setRecentSearches(JSON.parse(data));
      }
    });
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await searchDestinations(query);
        setResults(
          data.map((d) => ({
            id: d.id,
            name: d.name,
            type: d.type,
            context: d.type === 'country' ? 'Country' : d.countryName ?? '',
            slug: d.slug,
          }))
        );
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const addRecentSearch = useCallback(async (term: string) => {
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  const clearRecentSearches = useCallback(async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
}
```

**Step 2: Update data/explore/index.ts**

```typescript
// data/explore/index.ts
export * from './types';
export * from './feedBuilder';
export * from './useFeedItems';
export * from './useSearch';
```

**Step 3: Commit**

```bash
git add data/explore/useSearch.ts data/explore/index.ts
git commit -m "feat(explore): add useSearch hook with debounce and history"
```

---

### Task 19: Rewrite Search Screen

**Files:**
- Modify: `app/(tabs)/explore/search.tsx`

**Step 1: Replace the entire file**

```typescript
// app/(tabs)/explore/search.tsx
import { useEffect, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { useSearch, SearchResult } from '@/data/explore';

export default function SearchScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const {
    query,
    setQuery,
    results,
    isSearching,
    recentSearches,
    addRecentSearch,
  } = useSearch();

  useEffect(() => {
    // Auto-focus input on mount
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleBack = () => {
    Keyboard.dismiss();
    router.back();
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

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
      case 'place':
        router.push(`/(tabs)/explore/activity/${result.slug}`);
        break;
    }
  };

  const handleRecentPress = (term: string) => {
    setQuery(term);
  };

  const renderResult = ({ item }: { item: SearchResult }) => (
    <Pressable
      style={styles.resultRow}
      onPress={() => handleResultPress(item)}
    >
      <View style={styles.resultContent}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultContext}>{item.context}</Text>
      </View>
      <Text style={styles.resultType}>{item.type}</Text>
    </Pressable>
  );

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.inputContainer}>
          <Feather name="search" size={18} color={colors.textMuted} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Search countries, cities, or activities"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={handleClear} hitSlop={8}>
              <Feather name="x" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Content */}
      {isSearching ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={colors.orange} />
        </View>
      ) : query.length === 0 ? (
        // Recent searches
        recentSearches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RECENT</Text>
            <View style={styles.recentList}>
              {recentSearches.map((term) => (
                <Pressable
                  key={term}
                  style={styles.recentChip}
                  onPress={() => handleRecentPress(term)}
                >
                  <Text style={styles.recentText}>{term}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )
      ) : results.length === 0 ? (
        // No results
        <View style={styles.centered}>
          <Text style={styles.noResults}>No results for "{query}"</Text>
          <Text style={styles.noResultsHint}>
            Try searching for a country, city, or activity name.
          </Text>
        </View>
      ) : (
        // Results grouped by type
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          contentContainerStyle={styles.results}
          keyboardShouldPersistTaps="handled"
        />
      )}
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
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  section: {
    padding: spacing.screenX,
  },
  sectionTitle: {
    fontFamily: fonts.medium,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  recentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  recentChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
  },
  recentText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  results: {
    paddingVertical: spacing.md,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.lg,
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textPrimary,
  },
  resultContext: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  resultType: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  noResults: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  noResultsHint: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
```

**Step 2: Commit**

```bash
git add app/\(tabs\)/explore/search.tsx
git commit -m "feat(explore): rewrite search with full-screen UI and history"
```

---

## Phase 7: Collection Page

### Task 20: Create Collection Detail Page

**Files:**
- Create: `app/(tabs)/explore/collection/[slug].tsx`

**Step 1: Create the page**

```typescript
// app/(tabs)/explore/collection/[slug].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '@/constants/design';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HERO_HEIGHT = 300;

// Mock data - will be replaced with real API
const MOCK_COLLECTIONS: Record<string, {
  title: string;
  subtitle: string;
  heroImageUrl: string;
  intro: string;
  destinations: { type: 'country' | 'city'; name: string; slug: string; imageUrl: string }[];
}> = {
  'first-solo-trips': {
    title: 'Best destinations for your first solo trip',
    subtitle: 'For first-timers who want ease and charm',
    heroImageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
    intro: 'Starting your solo travel journey? These destinations offer the perfect blend of safety, friendliness, and unforgettable experiences.',
    destinations: [
      { type: 'country', name: 'Portugal', slug: 'portugal', imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400' },
      { type: 'city', name: 'Lisbon', slug: 'lisbon', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
      { type: 'country', name: 'Japan', slug: 'japan', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400' },
    ],
  },
  'calm-beach-towns': {
    title: 'Calm beach towns for slow travel',
    subtitle: 'Where the pace is gentle and the views are endless',
    heroImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    intro: 'Escape the rush and find your rhythm in these serene coastal destinations.',
    destinations: [
      { type: 'city', name: 'Cascais', slug: 'cascais', imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400' },
      { type: 'city', name: 'Hoi An', slug: 'hoi-an', imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400' },
    ],
  },
  'cultural-capitals': {
    title: 'Cultural capitals worth exploring',
    subtitle: 'Art, history, and unforgettable experiences',
    heroImageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
    intro: 'Immerse yourself in world-class museums, historic neighborhoods, and vibrant arts scenes.',
    destinations: [
      { type: 'city', name: 'Paris', slug: 'paris', imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400' },
      { type: 'city', name: 'Tokyo', slug: 'tokyo', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
    ],
  },
};

export default function CollectionScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const collection = MOCK_COLLECTIONS[slug ?? ''];

  if (!collection) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Collection not found</Text>
      </View>
    );
  }

  const handleBack = () => router.back();

  const handleDestinationPress = (dest: { type: string; slug: string }) => {
    if (dest.type === 'country') {
      router.push(`/(tabs)/explore/country/${dest.slug}`);
    } else {
      router.push(`/(tabs)/explore/city/${dest.slug}`);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <Image
          source={{ uri: collection.heroImageUrl }}
          style={styles.heroImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.7)']}
          style={styles.heroGradient}
        />
        <Pressable
          style={[styles.backButton, { top: insets.top + spacing.md }]}
          onPress={handleBack}
          hitSlop={12}
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{collection.title}</Text>
          <Text style={styles.heroSubtitle}>{collection.subtitle}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.intro}>{collection.intro}</Text>

        <View style={styles.destinations}>
          {collection.destinations.map((dest) => (
            <Pressable
              key={dest.slug}
              style={styles.destCard}
              onPress={() => handleDestinationPress(dest)}
            >
              <Image
                source={{ uri: dest.imageUrl }}
                style={styles.destImage}
                contentFit="cover"
              />
              <View style={styles.destInfo}>
                <Text style={styles.destName}>{dest.name}</Text>
                <Text style={styles.destType}>{dest.type}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: 'absolute',
    left: spacing.screenX,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
  },
  heroTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  content: {
    padding: spacing.screenX,
  },
  intro: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  destinations: {
    gap: spacing.md,
  },
  destCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    overflow: 'hidden',
  },
  destImage: {
    width: 80,
    height: 80,
  },
  destInfo: {
    flex: 1,
    padding: spacing.lg,
  },
  destName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  destType: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    marginTop: spacing.xs,
  },
});
```

**Step 2: Commit**

```bash
git add app/\(tabs\)/explore/collection/\[slug\].tsx
git commit -m "feat(explore): add editorial collection detail page"
```

---

## Phase 8: Cleanup

### Task 21: Remove Unused Components

**Files:**
- Delete: `components/explore/IconTabs.tsx`
- Delete: `components/explore/WelcomeHeader.tsx`
- Delete: `components/explore/tabs/` (entire directory)
- Modify: `components/explore/index.ts`

**Step 1: Update the barrel export**

```typescript
// components/explore/index.ts
export { ExploreFeed } from './ExploreFeed';
export { FeedItem } from './FeedItem';
export { FeedEndCard } from './FeedEndCard';
export * from './cards';
export * from './sections';
```

**Step 2: Delete old files**

```bash
rm components/explore/IconTabs.tsx
rm components/explore/WelcomeHeader.tsx
rm -rf components/explore/tabs/
```

**Step 3: Commit**

```bash
git add -A
git commit -m "chore(explore): remove unused tab components"
```

---

### Task 22: Final Verification

**Step 1: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -v "scripts/" | grep -v "supabase/" | head -20
```

Expected: No errors in app/ or components/

**Step 2: Start the app**

```bash
npx expo start
```

Expected: App launches, Explore feed shows with mixed content types

**Step 3: Test interactions**

- [ ] Feed scrolls smoothly
- [ ] Editorial cards tap to collection page
- [ ] Country cards tap to country detail
- [ ] City spotlight taps to city detail
- [ ] Activity cards tap to activity detail
- [ ] Search icon opens full-screen search
- [ ] Search returns results across types
- [ ] Feed end card buttons work

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(explore): complete unified feed redesign"
```

---

## Summary

| Phase | Tasks | Purpose |
|-------|-------|---------|
| 1 | 1-3 | Data layer: types, feedBuilder, useFeedItems |
| 2 | 4-9 | Card components: Editorial, Country, City, Activity |
| 3 | 10-14 | Section components: pairs, spotlights, clusters |
| 4 | 15-16 | Feed components: FeedItem, ExploreFeed |
| 5 | 17 | Main page rewrite |
| 6 | 18-19 | Search enhancement |
| 7 | 20 | Collection detail page |
| 8 | 21-22 | Cleanup and verification |

Total: 22 tasks, ~2-3 hours estimated implementation time.
