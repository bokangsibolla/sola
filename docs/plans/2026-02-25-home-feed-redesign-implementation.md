# Home Feed Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the sparse new-user home feed with a rich "notice board" mixing curated places and feature-advertising cards.

**Architecture:** New feed components + data hook that activate for `new` and `idle`-with-no-trips users. The existing card engine (`cardEngine.ts`, `useCardFeed`) stays untouched for active users. Home screen conditionally renders the new feed or old feed based on user state.

**Tech Stack:** React Native, Expo Router, Supabase, expo-image, expo-linear-gradient, AsyncStorage, Ionicons

---

### Task 1: API Queries — `getPopularPlacesWithCity` and `getPlacesByCategoryWithCity`

**Files:**
- Modify: `data/api.ts` (append after line ~920)

**Step 1: Add `getPopularPlacesWithCity` query**

This fetches random popular places with images, across different cities, for hero cards.

```typescript
/**
 * Get popular places with city info and images for the home feed hero cards.
 * Returns places ordered by curation_score, limited to those with images.
 */
export async function getPopularPlacesWithCity(
  limit = 6,
): Promise<PlaceWithCity[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*, cities!inner(name, country_id, countries!inner(name)), place_media!inner(url)')
    .eq('is_active', true)
    .order('curation_score', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...toCamel<Place>(row),
    cityName: row.cities?.name ?? '',
    countryName: row.cities?.countries?.name ?? '',
    imageUrl: row.place_media?.[0]?.url ?? null,
  }));
}
```

**Step 2: Add `getPlacesByCategoryWithCity` query**

This fetches places by category group with city names and images.

```typescript
/**
 * Get places by a set of place_types, with city name and first image.
 * Used by home feed horizontal rows.
 */
export async function getPlacesByCategoryWithCity(
  placeTypes: string[],
  limit = 5,
): Promise<PlaceWithCity[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*, cities!inner(name, country_id), place_media!inner(url)')
    .in('place_type', placeTypes)
    .eq('is_active', true)
    .order('curation_score', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...toCamel<Place>(row),
    cityName: row.cities?.name ?? '',
    imageUrl: row.place_media?.[0]?.url ?? null,
  }));
}
```

**Step 3: Update `PlaceWithCity` type to include optional `countryName`**

In `data/types.ts`, the `PlaceWithCity` interface needs `countryName`:

```typescript
export interface PlaceWithCity extends Place {
  cityName: string;
  imageUrl: string | null;
  countryName?: string;
}
```

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(api\.ts|types\.ts)' | head -20`
Expected: No new errors.

**Step 5: Commit**

```bash
git add data/api.ts data/types.ts
git commit -m "feat(home): add place queries for home feed hero cards and category rows"
```

---

### Task 2: Data Hook — `useNewUserFeed`

**Files:**
- Create: `data/home/useNewUserFeed.ts`

**Step 1: Create the hook**

```typescript
import { useMemo, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import {
  getPopularPlacesWithCity,
  getPlacesByCategoryWithCity,
} from '@/data/api';
import { fetchCommunityHighlightsVisual } from '@/data/home/homeApi';
import type { PlaceWithCity } from '@/data/types';
import type { CommunityHighlightThreadVisual } from '@/data/home/homeApi';

const FEATURE_SEEN_KEY = 'home_feature_seen';

export interface FeatureSeenState {
  buddies_seen: boolean;
  trip_created: boolean;
  community_visited: boolean;
}

const DEFAULT_FEATURE_SEEN: FeatureSeenState = {
  buddies_seen: false,
  trip_created: false,
  community_visited: false,
};

// Category groups for horizontal rows
const STAY_TYPES = ['hostel', 'hotel', 'homestay'];
const CAFE_TYPES = ['cafe', 'coworking', 'restaurant'];
const NIGHTLIFE_TYPES = ['bar', 'club', 'rooftop'];
const EXPERIENCE_TYPES = ['tour', 'activity', 'landmark'];

export function useNewUserFeed() {
  const { userId } = useAuth();
  const [featureSeen, setFeatureSeen] = useState<FeatureSeenState>(DEFAULT_FEATURE_SEEN);

  // Load feature-seen state from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(FEATURE_SEEN_KEY).then((raw) => {
      if (raw) {
        try {
          setFeatureSeen({ ...DEFAULT_FEATURE_SEEN, ...JSON.parse(raw) });
        } catch {
          // ignore parse errors
        }
      }
    });
  }, []);

  // Hero places (popular, with images)
  const {
    data: heroPlaces,
    loading: heroLoading,
    refetch: refetchHero,
  } = useData<PlaceWithCity[]>(
    () => getPopularPlacesWithCity(6),
    ['new-user-hero-places'],
  );

  // Row 1: Where to stay
  const {
    data: stayPlaces,
    loading: stayLoading,
    refetch: refetchStay,
  } = useData<PlaceWithCity[]>(
    () => getPlacesByCategoryWithCity(STAY_TYPES, 5),
    ['new-user-stay-places'],
  );

  // Row 2: Cafes & coworking
  const {
    data: cafePlaces,
    loading: cafeLoading,
    refetch: refetchCafe,
  } = useData<PlaceWithCity[]>(
    () => getPlacesByCategoryWithCity(CAFE_TYPES, 5),
    ['new-user-cafe-places'],
  );

  // Replacement row: Nightlife (replaces buddies feature card)
  const {
    data: nightlifePlaces,
    loading: nightlifeLoading,
    refetch: refetchNightlife,
  } = useData<PlaceWithCity[]>(
    () => featureSeen.buddies_seen ? getPlacesByCategoryWithCity(NIGHTLIFE_TYPES, 5) : Promise.resolve([]),
    ['new-user-nightlife-places', featureSeen.buddies_seen],
  );

  // Replacement row: Experiences (replaces trip feature card)
  const {
    data: experiencePlaces,
    loading: experienceLoading,
    refetch: refetchExperience,
  } = useData<PlaceWithCity[]>(
    () => featureSeen.trip_created ? getPlacesByCategoryWithCity(EXPERIENCE_TYPES, 5) : Promise.resolve([]),
    ['new-user-experience-places', featureSeen.trip_created],
  );

  // Community thread
  const {
    data: communityThread,
    refetch: refetchCommunity,
  } = useData<CommunityHighlightThreadVisual | null>(
    () =>
      userId
        ? fetchCommunityHighlightsVisual(userId, 1).then((t) => t[0] ?? null)
        : Promise.resolve(null),
    ['new-user-community', userId ?? ''],
  );

  const loading = heroLoading || stayLoading || cafeLoading;

  const refetch = useCallback(() => {
    refetchHero();
    refetchStay();
    refetchCafe();
    refetchNightlife();
    refetchExperience();
    refetchCommunity();
  }, [refetchHero, refetchStay, refetchCafe, refetchNightlife, refetchExperience, refetchCommunity]);

  // Pick 2 hero places from different cities
  const heroes = useMemo(() => {
    if (!heroPlaces || heroPlaces.length === 0) return [];
    const first = heroPlaces[0];
    const second = heroPlaces.find((p) => p.cityId !== first.cityId) ?? heroPlaces[1];
    const third = heroPlaces.find(
      (p) => p.cityId !== first.cityId && p.id !== second?.id,
    ) ?? heroPlaces[2];
    return [first, second, third].filter(Boolean) as PlaceWithCity[];
  }, [heroPlaces]);

  return {
    heroes,
    stayPlaces: stayPlaces ?? [],
    cafePlaces: cafePlaces ?? [],
    nightlifePlaces: nightlifePlaces ?? [],
    experiencePlaces: experiencePlaces ?? [],
    communityThread,
    featureSeen,
    loading,
    refetch,
  };
}

/** Call this from tab screens to mark a feature as seen */
export async function markFeatureSeen(key: keyof FeatureSeenState): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(FEATURE_SEEN_KEY);
    const state: FeatureSeenState = raw
      ? { ...DEFAULT_FEATURE_SEEN, ...JSON.parse(raw) }
      : { ...DEFAULT_FEATURE_SEEN };
    state[key] = true;
    await AsyncStorage.setItem(FEATURE_SEEN_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E 'useNewUserFeed' | head -10`
Expected: No errors.

**Step 3: Commit**

```bash
git add data/home/useNewUserFeed.ts
git commit -m "feat(home): add useNewUserFeed data hook with feature dismissal tracking"
```

---

### Task 3: Component — `FeatureCard`

**Files:**
- Create: `components/home/cards/FeatureCard.tsx`

**Step 1: Build the component**

```typescript
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

interface FeatureCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  headline: string;
  description: string;
  route: string;
}

export function FeatureCard({ icon, headline, description, route }: FeatureCardProps) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && pressedState]}
      onPress={() => router.push(route as any)}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color={colors.orange} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.description} numberOfLines={1}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.cardLg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  headline: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep 'FeatureCard' | head -5`
Expected: No errors.

**Step 3: Commit**

```bash
git add components/home/cards/FeatureCard.tsx
git commit -m "feat(home): add FeatureCard component for feature advertising"
```

---

### Task 4: Component — `HeroPlaceCard`

**Files:**
- Create: `components/home/cards/HeroPlaceCard.tsx`

**Step 1: Build the component**

```typescript
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';
import type { PlaceWithCity } from '@/data/types';

interface HeroPlaceCardProps {
  place: PlaceWithCity;
}

export function HeroPlaceCard({ place }: HeroPlaceCardProps) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && pressedState]}
      onPress={() => router.push(`/(tabs)/discover/place-detail/${place.id}` as any)}
    >
      {place.imageUrl ? (
        <Image
          source={{ uri: place.imageUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={200}
          pointerEvents="none"
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, styles.placeholder]}>
          <Ionicons name="image-outline" size={32} color={colors.textMuted} />
        </View>
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <View style={styles.label}>
        <Text style={styles.labelText}>POPULAR WITH SOLO WOMEN</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
        <Text style={styles.location} numberOfLines={1}>
          {place.cityName}{place.countryName ? ` · ${place.countryName}` : ''}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 200,
    borderRadius: radius.cardLg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  placeholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.card,
  },
  labelText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  content: {
    padding: spacing.lg,
    gap: 2,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  location: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.8)',
  },
});
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep 'HeroPlaceCard' | head -5`
Expected: No errors.

**Step 3: Commit**

```bash
git add components/home/cards/HeroPlaceCard.tsx
git commit -m "feat(home): add HeroPlaceCard component for full-width place heroes"
```

---

### Task 5: Components — `PlaceRowCard` and `PlaceRow`

**Files:**
- Create: `components/home/cards/PlaceRowCard.tsx`
- Create: `components/home/cards/PlaceRow.tsx`

**Step 1: Build PlaceRowCard**

```typescript
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';
import type { PlaceWithCity } from '@/data/types';

interface PlaceRowCardProps {
  place: PlaceWithCity;
}

export function PlaceRowCard({ place }: PlaceRowCardProps) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && pressedState]}
      onPress={() => router.push(`/(tabs)/discover/place-detail/${place.id}` as any)}
    >
      {place.imageUrl ? (
        <Image
          source={{ uri: place.imageUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={200}
          pointerEvents="none"
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, styles.placeholder]}>
          <Ionicons name="image-outline" size={20} color={colors.textMuted} />
        </View>
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)']}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{place.name}</Text>
        <Text style={styles.city} numberOfLines={1}>{place.cityName}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    height: 160,
    borderRadius: radius.cardLg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  placeholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.sm,
    gap: 1,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 17,
    color: '#FFFFFF',
  },
  city: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(255,255,255,0.7)',
  },
});
```

**Step 2: Build PlaceRow**

```typescript
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { PlaceRowCard } from './PlaceRowCard';
import { colors, fonts, spacing } from '@/constants/design';
import type { PlaceWithCity } from '@/data/types';

interface PlaceRowProps {
  title: string;
  places: PlaceWithCity[];
}

export function PlaceRow({ title, places }: PlaceRowProps) {
  if (places.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PlaceRowCard place={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  list: {
    paddingRight: spacing.screenX,
  },
  separator: {
    width: spacing.sm,
  },
});
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(PlaceRow|PlaceRowCard)' | head -10`
Expected: No errors.

**Step 4: Commit**

```bash
git add components/home/cards/PlaceRowCard.tsx components/home/cards/PlaceRow.tsx
git commit -m "feat(home): add PlaceRow and PlaceRowCard for horizontal place scrolls"
```

---

### Task 6: New User Feed View — `NewUserFeed`

**Files:**
- Create: `components/home/NewUserFeed.tsx`

**Step 1: Build the composite feed component**

This component assembles all the new cards into the correct order, handling feature card dismissal and replacement.

```typescript
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { FeatureCard } from './cards/FeatureCard';
import { HeroPlaceCard } from './cards/HeroPlaceCard';
import { PlaceRow } from './cards/PlaceRow';
import { CommunityCard } from './cards/CommunityCard';
import { VerificationNudge } from './VerificationNudge';
import { useNewUserFeed } from '@/data/home/useNewUserFeed';
import { colors, spacing } from '@/constants/design';

export function NewUserFeed() {
  const {
    heroes,
    stayPlaces,
    cafePlaces,
    nightlifePlaces,
    experiencePlaces,
    featureSeen,
    loading,
    refetch,
  } = useNewUserFeed();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refetch}
          tintColor={colors.orange}
        />
      }
    >
      <VerificationNudge />

      {/* 1. Hero place card */}
      {heroes[0] && <HeroPlaceCard place={heroes[0]} />}

      {/* 2. Feature: Travel buddies OR replacement row */}
      {featureSeen.buddies_seen ? (
        <PlaceRow title="Rooftop bars & nightlife" places={nightlifePlaces} />
      ) : (
        <FeatureCard
          icon="people-outline"
          headline="Find people to explore with"
          description="See who's traveling to the same places as you"
          route="/(tabs)/travelers"
        />
      )}

      {/* 3. Horizontal row: Where to stay */}
      <PlaceRow title="Where to stay" places={stayPlaces} />

      {/* 4. Feature: Plan trip OR replacement row */}
      {featureSeen.trip_created ? (
        <PlaceRow title="Experiences & tours" places={experiencePlaces} />
      ) : (
        <FeatureCard
          icon="airplane-outline"
          headline="Plan your first trip"
          description="Build your itinerary, day by day"
          route="/(tabs)/trips"
        />
      )}

      {/* 5. Horizontal row: Cafes & coworking */}
      <PlaceRow title="Cafes & coworking" places={cafePlaces} />

      {/* 6. Feature: Community OR replacement hero */}
      {featureSeen.community_visited ? (
        heroes[2] ? <HeroPlaceCard place={heroes[2]} /> : null
      ) : (
        <FeatureCard
          icon="chatbubbles-outline"
          headline="Ask solo women travelers"
          description="Real answers from women who've been there"
          route="/(tabs)/community"
        />
      )}

      {/* 7. Second hero place card */}
      {heroes[1] && <HeroPlaceCard place={heroes[1]} />}

      {/* 8. Community thread */}
      <CommunityCard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
});
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep 'NewUserFeed' | head -5`
Expected: No errors.

**Step 3: Commit**

```bash
git add components/home/NewUserFeed.tsx
git commit -m "feat(home): add NewUserFeed composite component with notice board layout"
```

---

### Task 7: Wire Up Home Screen — Conditional Feed Rendering

**Files:**
- Modify: `app/(tabs)/home/index.tsx`

**Step 1: Update home screen to conditionally render new vs old feed**

The home screen should use the new feed for `new` users and `idle` users with no trips. All other states use the existing card engine.

In `app/(tabs)/home/index.tsx`, import `NewUserFeed` and update the render logic:

```typescript
// Add imports at top:
import { NewUserFeed } from '@/components/home/NewUserFeed';

// The existing useCardFeed returns { cards, userState, loading, refetch }
// Use userState to decide which feed to show.
// Show NewUserFeed when: userState === 'new' OR (userState === 'idle' AND cards has no travel_map — meaning no trips)
```

Replace the body of `HomeScreen` to branch on user state:

```typescript
export default function HomeScreen() {
  const posthog = usePostHog();
  const { cards, userState, loading, refetch } = useCardFeed();

  useEffect(() => {
    posthog.capture('home_viewed');
  }, [posthog]);

  // Show the rich new-user feed for fresh/idle users without trips
  const showNewFeed =
    userState === 'new' ||
    (userState === 'idle' && !cards.some((c) => c.type === 'travel_map'));

  // Reset discovery index on each render so cards stay stable
  discoveryIndex = 0;

  return (
    <AppScreen>
      <NavigationHeader
        title="Home"
        showLogo
        rightActions={<HamburgerButton />}
      />

      {showNewFeed ? (
        <NewUserFeed />
      ) : loading && cards.length === 0 ? (
        <HomeSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              tintColor={colors.orange}
            />
          }
        >
          <VerificationNudge />
          {cards.map((card) => renderCard(card)).filter(Boolean)}
        </ScrollView>
      )}
    </AppScreen>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(home/index|NewUserFeed)' | head -10`
Expected: No errors.

**Step 3: Commit**

```bash
git add app/(tabs)/home/index.tsx
git commit -m "feat(home): wire up conditional feed — new users get notice board, active users keep existing"
```

---

### Task 8: Feature Dismissal — Mark Features Seen from Tab Screens

**Files:**
- Modify: `app/(tabs)/travelers/index.tsx` (or activities root)
- Modify: `app/(tabs)/community/index.tsx` (or connect root)

**Step 1: Add `markFeatureSeen('buddies_seen')` to the travelers/activities tab**

In the activities/travelers tab root screen, add a useEffect that fires on mount:

```typescript
import { markFeatureSeen } from '@/data/home/useNewUserFeed';

// Inside the component:
useEffect(() => {
  markFeatureSeen('buddies_seen');
}, []);
```

**Step 2: Add `markFeatureSeen('community_visited')` to the community tab**

Same pattern in the community tab root:

```typescript
import { markFeatureSeen } from '@/data/home/useNewUserFeed';

useEffect(() => {
  markFeatureSeen('community_visited');
}, []);
```

**Step 3: Add `markFeatureSeen('trip_created')` when a trip is created**

Find the trip creation flow and add the mark after successful creation. This should be in the trip creation screen or the trip API hook.

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(travelers|community|trips)' | head -20`
Expected: No new errors.

**Step 5: Commit**

```bash
git add app/(tabs)/travelers/index.tsx app/(tabs)/community/index.tsx
git commit -m "feat(home): mark features as seen when user visits each tab"
```

---

### Task 9: Final Verification

**Step 1: Full TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -30`
Expected: No new errors from our files.

**Step 2: Visual test**

Start the dev server and verify on simulator:
- New account → sees hero cards, feature cards, horizontal rows
- Tap a feature card → navigates to correct tab
- Tap a hero card → navigates to place detail
- Scroll horizontal rows → cards scroll smoothly
- Pull to refresh → data reloads

**Step 3: Final commit if any cleanup needed**
