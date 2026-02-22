# Homepage Dashboard Redesign v2 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current section-builder home screen with a clean, visual dashboard inspired by the warm travel app reference: large hero trip card, 3 personalized "For you" cards, a community image banner, and a creative hamburger menu icon.

**Architecture:** Replace the dynamic section renderer with a fixed 4-block layout. Keep `useHomeData` for data fetching but render components directly. Create 3 new components (`HamburgerButton`, `ForYouRow`, `CommunityBannerCard`), restyle `HeroModule`, and simplify the home screen render.

**Tech Stack:** React Native, Expo Image, expo-linear-gradient, Expo Router, existing design tokens from `constants/design.ts`

**Key files to understand before starting:**
- `constants/design.ts` — design tokens (colors, spacing, radius, typography, fonts)
- `app/(tabs)/home/index.tsx` — current homepage screen
- `data/home/useHomeData.ts` — data hook (provides heroState, personalizedCities, savedPlaces, etc.)
- `data/home/types.ts` — HeroState, PersonalizedCity, SavedPlacePreview, etc.
- `components/home/HeroModule.tsx` — current hero card (being restyled)
- `components/NavigationHeader.tsx` — header component (accepts rightActions prop)
- `components/AvatarButton.tsx` — current right-side header button (being replaced on home only)
- `data/trips/types.ts` — TripWithStops type (needed for ForYouRow stop fields)

---

### Task 1: Create HamburgerButton component

Creative 3-line hamburger icon: top line (20px, black), middle line (14px, orange, shorter), bottom line (20px, black). Opens the existing MenuSheet. Shows unread dot when new activity exists.

**Files:**
- Create: `components/home/HamburgerButton.tsx`

**Step 1: Create the component**

```tsx
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/constants/design';
import { useUnreadIndicator } from '@/data/notifications/useUnreadIndicator';
import { MenuSheet } from '@/components/MenuSheet';

const TOUCH_TARGET = 44;

export function HamburgerButton() {
  const [menuVisible, setMenuVisible] = useState(false);
  const hasUnread = useUnreadIndicator();

  return (
    <>
      <Pressable
        onPress={() => setMenuVisible(true)}
        hitSlop={spacing.sm}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel={hasUnread ? 'Menu, new activity' : 'Menu'}
      >
        <View style={styles.lines}>
          <View style={styles.lineTop} />
          <View style={styles.lineMiddle} />
          <View style={styles.lineBottom} />
        </View>
        {hasUnread && <View style={styles.dot} />}
      </Pressable>

      <MenuSheet visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </>
  );
}

const LINE_THICKNESS = 2;
const LINE_GAP = 5;

const styles = StyleSheet.create({
  button: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lines: {
    width: 22,
    gap: LINE_GAP,
  },
  lineTop: {
    width: 20,
    height: LINE_THICKNESS,
    borderRadius: 1,
    backgroundColor: colors.textPrimary,
  },
  lineMiddle: {
    width: 14,
    height: LINE_THICKNESS,
    borderRadius: 1,
    backgroundColor: colors.orange,
  },
  lineBottom: {
    width: 20,
    height: LINE_THICKNESS,
    borderRadius: 1,
    backgroundColor: colors.textPrimary,
  },
  dot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: spacing.xs,
    backgroundColor: colors.orange,
    borderWidth: 2,
    borderColor: colors.background,
  },
});
```

**Step 2: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -E '(components/home/HamburgerButton)'`
Expected: No errors

**Step 3: Commit**

```bash
git add components/home/HamburgerButton.tsx
git commit -m "feat(home): add HamburgerButton — creative 3-line icon with orange accent"
```

---

### Task 2: Restyle HeroModule for dashboard layout

Restyle from full-bleed edge-to-edge card to a padded, rounded card within `spacing.screenX` (24px) margins. 220px tall, `borderRadius: 16` on all corners, seasonal subtitle for no-trip state, white action circle top-right.

**Files:**
- Modify: `components/home/HeroModule.tsx` (full rewrite)

**Step 1: Replace the entire file**

Key changes from current:
- Remove `wrapper.marginHorizontal: -spacing.lg` (was breaking out of AppScreen padding for full-bleed)
- Add `wrapper.paddingHorizontal: spacing.screenX` (card within screen padding)
- Card height: 220px fixed
- All corners rounded with `radius.module` (16px)
- Add white circle action button (top-right): arrow-forward for trips, bookmark for featured
- Simplify pill styling (keep frosted glass)
- Add `getSeasonalSubtitle()` helper for featured state (e.g., "Perfect for February")
- Remove travel advisory overlay (simplify — advisory was cluttering the card)
- Remove below-image belowImage area (keep it purely an image card)
- Title: 24px semiBold (down from 28px for better fit in padded card)

```tsx
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  colors,
  fonts,
  radius,
  spacing,
  pressedState,
} from '@/constants/design';
import type { HeroState, TravelUpdate } from '@/data/home/types';

const FALLBACK_IMAGE = require('@/assets/images/solo-bali-palms.jpg');
const HERO_HEIGHT = 220;

interface HeroModuleProps {
  hero: HeroState;
  travelUpdate?: TravelUpdate | null;
}

function getImageSource(hero: HeroState) {
  let uri: string | null = null;
  if (hero.kind === 'active' || hero.kind === 'upcoming') {
    uri = hero.cityImageUrl || null;
  } else {
    uri = hero.city.heroImageUrl || null;
  }
  return uri ? { uri } : FALLBACK_IMAGE;
}

function formatDateRange(arriving: string | null, leaving: string | null): string | null {
  if (!arriving) return null;
  const fmt = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  if (leaving) return `${fmt(arriving)} \u2013 ${fmt(leaving)}`;
  return fmt(arriving);
}

function getSeasonalSubtitle(): string {
  const month = new Date().getMonth();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `Perfect for ${monthNames[month]}`;
}

export function HeroModule({ hero }: HeroModuleProps) {
  const router = useRouter();

  const [, setTick] = useState(0);
  useEffect(() => {
    if (hero.kind !== 'active') return;
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, [hero.kind]);

  const handlePress = () => {
    if (hero.kind === 'active' || hero.kind === 'upcoming') {
      router.push(`/trips/${hero.trip.id}` as any);
    } else {
      router.push(`/discover/city/${hero.city.slug}` as any);
    }
  };

  const imageSource = getImageSource(hero);

  let pillText = 'RECOMMENDED';
  if (hero.kind === 'active') pillText = 'NOW TRAVELING';
  else if (hero.kind === 'upcoming') pillText = 'UPCOMING';

  let title = '';
  let subtitle: string | null = null;
  if (hero.kind === 'active') {
    title = hero.trip.destinationName;
    subtitle = formatDateRange(hero.trip.arriving, hero.trip.leaving);
  } else if (hero.kind === 'upcoming') {
    title = hero.trip.destinationName;
    subtitle = formatDateRange(hero.trip.arriving, hero.trip.leaving);
  } else {
    title = `${hero.city.name}, ${hero.city.countryName}`;
    subtitle = getSeasonalSubtitle();
  }

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
        ]}
        onPress={handlePress}
      >
        <Image
          source={imageSource}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.05)', colors.overlayMedium]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Status pill — top left */}
        <View style={styles.pillContainer}>
          <View style={styles.pill}>
            {hero.kind === 'active' && <View style={styles.liveDot} />}
            <Text style={styles.pillText}>{pillText}</Text>
          </View>
        </View>

        {/* Action circle — top right */}
        <View style={styles.actionContainer}>
          <View style={styles.actionCircle}>
            <Ionicons
              name={hero.kind === 'featured' ? 'bookmark-outline' : 'arrow-forward'}
              size={16}
              color={colors.textPrimary}
            />
          </View>
        </View>

        {/* Bottom content */}
        <View style={styles.overlay}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.screenX,
  },
  card: {
    height: HERO_HEIGHT,
    borderRadius: radius.module,
    overflow: 'hidden',
  },
  pillContainer: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.frostedPillBg,
    borderWidth: 1,
    borderColor: colors.frostedPillBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.greenSoft,
  },
  pillText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
    color: colors.textOnImage,
  },
  actionContainer: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
  },
  actionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.textOnImage,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textOnImageMuted,
    marginTop: spacing.xs,
  },
});
```

**Step 2: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -E '(components/home/HeroModule)'`
Expected: No errors

**Step 3: Commit**

```bash
git add components/home/HeroModule.tsx
git commit -m "feat(home): restyle HeroModule — 220px rounded card with seasonal subtitle"
```

---

### Task 3: Create ForYouRow component

3 equal-width mini image cards. Content waterfall: trip stops > saved places > personalized cities > trending.

**Files:**
- Create: `components/home/ForYouRow.tsx`
- Read first: `data/trips/types.ts` to check `TripWithStops.stops` field names

**Step 1: Check TripWithStops type**

Read `data/trips/types.ts` and find the stop type fields. We need: an ID, a display name, an image URL, and a navigation slug. The field names may be camelCase or snake_case. Adjust the mapping in step 2 accordingly.

**Step 2: Create the component**

```tsx
import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  colors,
  fonts,
  radius,
  spacing,
  pressedState,
} from '@/constants/design';
import { SectionHeader } from './SectionHeader';
import type { PersonalizedCity, SavedPlacePreview, HeroState } from '@/data/home/types';

interface ForYouItem {
  id: string;
  name: string;
  imageUrl: string | null;
  route: string;
}

interface ForYouRowProps {
  heroState: HeroState;
  savedPlaces: SavedPlacePreview[];
  personalizedCities: PersonalizedCity[];
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = spacing.sm;
const HORIZONTAL_PADDING = spacing.screenX * 2;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - HORIZONTAL_PADDING - CARD_GAP * 2) / 3);
const CARD_HEIGHT = 130;

function buildForYouItems(
  heroState: HeroState,
  savedPlaces: SavedPlacePreview[],
  personalizedCities: PersonalizedCity[],
): ForYouItem[] {
  // Priority 1: Trip stops (if active or upcoming trip with enough stops)
  // NOTE: Adjust field names below based on actual TripWithStops.stops type
  if (heroState.kind === 'active' || heroState.kind === 'upcoming') {
    const stops = (heroState.trip as any).stops ?? [];
    if (stops.length >= 3) {
      return stops.slice(0, 3).map((stop: any) => ({
        id: stop.cityId ?? stop.city_id ?? stop.id,
        name: stop.cityName ?? stop.city_name ?? stop.name ?? 'Stop',
        imageUrl: stop.cityImageUrl ?? stop.city_image_url ?? stop.heroImageUrl ?? null,
        route: stop.citySlug ?? stop.slug
          ? `/discover/city/${stop.citySlug ?? stop.slug}`
          : `/trips/${heroState.trip.id}`,
      }));
    }
  }

  // Priority 2: Saved places (if 3+)
  if (savedPlaces.length >= 3) {
    return savedPlaces.slice(0, 3).map((place) => ({
      id: place.placeId,
      name: place.placeName,
      imageUrl: place.imageUrl,
      route: `/discover/place/${place.placeId}`,
    }));
  }

  // Priority 3: Personalized cities
  return personalizedCities.slice(0, 3).map((city) => ({
    id: city.cityId,
    name: city.cityName,
    imageUrl: city.heroImageUrl,
    route: `/discover/city/${city.slug}`,
  }));
}

function getSeeAllRoute(heroState: HeroState, savedPlaces: SavedPlacePreview[]): string {
  if (heroState.kind === 'active' || heroState.kind === 'upcoming') {
    const stops = (heroState.trip as any).stops ?? [];
    if (stops.length >= 3) return `/trips/${heroState.trip.id}`;
  }
  if (savedPlaces.length >= 3) return '/(tabs)/home/saved';
  return '/discover/browse';
}

export function ForYouRow({ heroState, savedPlaces, personalizedCities }: ForYouRowProps) {
  const router = useRouter();
  const items = buildForYouItems(heroState, savedPlaces, personalizedCities);

  if (items.length === 0) return null;

  const seeAllRoute = getSeeAllRoute(heroState, savedPlaces);

  return (
    <View style={styles.container}>
      <SectionHeader
        title="For you"
        onSeeAll={() => router.push(seeAllRoute as any)}
      />
      <View style={styles.row}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.card,
              pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
            ]}
            onPress={() => router.push(item.route as any)}
          >
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[StyleSheet.absoluteFillObject, styles.placeholder]} />
            )}
            <LinearGradient
              colors={['transparent', colors.cardGradientEnd]}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.textOverlay}>
              <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenX,
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.cardLg,
    overflow: 'hidden',
  },
  placeholder: {
    backgroundColor: colors.neutralFill,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 17,
    color: colors.textOnImage,
  },
});
```

**Step 3: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -E '(components/home/ForYouRow)'`
Expected: No errors (the `as any` casts on trip.stops handle type mismatches gracefully)

**Step 4: Commit**

```bash
git add components/home/ForYouRow.tsx
git commit -m "feat(home): add ForYouRow — contextual 3-card grid with waterfall logic"
```

---

### Task 4: Create CommunityBannerCard component

Single full-width image card (160px tall) with centered text, navigates to community tab.

**Files:**
- Create: `components/home/CommunityBannerCard.tsx`

**Step 1: Create the component**

```tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  colors,
  fonts,
  radius,
  spacing,
  pressedState,
} from '@/constants/design';

const COMMUNITY_IMAGE = require('@/assets/images/pexels-paddleboarding.png');
const CARD_HEIGHT = 160;

export function CommunityBannerCard() {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
        ]}
        onPress={() => router.push('/(tabs)/connect' as any)}
        accessibilityRole="button"
        accessibilityLabel="Go to community"
      >
        <Image
          source={COMMUNITY_IMAGE}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient
          colors={['transparent', colors.overlaySoft]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.content}>
          <Text style={styles.title}>Real stories from solo women</Text>
          <Text style={styles.subtitle}>{'Join the conversation  \u2192'}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.xxl,
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: radius.module,
    overflow: 'hidden',
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.textOnImage,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textOnImageMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
```

**Step 2: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -E '(components/home/CommunityBannerCard)'`
Expected: No errors

**Step 3: Commit**

```bash
git add components/home/CommunityBannerCard.tsx
git commit -m "feat(home): add CommunityBannerCard — full-width image card linking to community"
```

---

### Task 5: Rewrite HomeScreen with new layout

Replace the section-builder render loop with the new fixed layout: Header (logo + hamburger) → Hero card → For You row → Community banner.

**Files:**
- Modify: `app/(tabs)/home/index.tsx`

**Step 1: Replace the entire file**

```tsx
import { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { usePostHog } from 'posthog-react-native';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import { HamburgerButton } from '@/components/home/HamburgerButton';
import { HeroModule } from '@/components/home/HeroModule';
import { ForYouRow } from '@/components/home/ForYouRow';
import { CommunityBannerCard } from '@/components/home/CommunityBannerCard';
import { HomeSkeleton } from '@/components/home/HomeSkeleton';
import { useHomeData } from '@/data/home/useHomeData';
import { colors, spacing } from '@/constants/design';
import { FLOATING_TAB_BAR_HEIGHT } from '@/components/TabBar';

export default function HomeScreen() {
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture('home_viewed');
  }, [posthog]);

  const {
    heroState,
    savedPlaces,
    personalizedCities,
    loading,
    refetch,
  } = useHomeData();

  return (
    <AppScreen>
      <NavigationHeader
        title="Home"
        showLogo
        rightActions={<HamburgerButton />}
      />

      {loading && !heroState ? (
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
          <View style={styles.heroSection}>
            <HeroModule hero={heroState} />
          </View>

          <ForYouRow
            heroState={heroState}
            savedPlaces={savedPlaces}
            personalizedCities={personalizedCities}
          />

          <CommunityBannerCard />

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: FLOATING_TAB_BAR_HEIGHT + spacing.xl,
  },
  heroSection: {
    marginTop: spacing.lg,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
```

**Step 2: Verify types**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -20`
Expected: No new errors. `useHomeData` returns `heroState: HeroState` (defaults to `DEFAULT_HERO`), so the `!heroState` check is always false after first render, but it's a safe guard for the loading state.

**Step 3: Commit**

```bash
git add app/(tabs)/home/index.tsx
git commit -m "feat(home): rewrite HomeScreen — hero card + for-you row + community banner"
```

---

### Task 6: Type-check ForYouRow against TripWithStops

The `ForYouRow` uses `(heroState.trip as any).stops` to avoid type errors. We should verify this works at runtime and clean up if possible.

**Files:**
- Read: `data/trips/types.ts` — find TripWithStops.stops field structure
- Possibly modify: `components/home/ForYouRow.tsx` — replace `as any` with proper field names

**Step 1: Read the trips types**

Check `data/trips/types.ts` for the `TripWithStops` interface and its `stops` array item type. Look for fields like:
- ID: `id` or `cityId` or `city_id`
- Name: `cityName` or `city_name` or `name`
- Image: `cityImageUrl` or `city_image_url` or `heroImageUrl`
- Slug: `citySlug` or `city_slug` or `slug`

**Step 2: Update field mappings**

Replace the `as any` casts in `buildForYouItems` with the correct typed field names from step 1. If the stops type doesn't have image URLs, the placeholder View handles this gracefully.

**Step 3: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -E '(components/home/ForYouRow)'`
Expected: No errors

**Step 4: Commit (if changes made)**

```bash
git add components/home/ForYouRow.tsx
git commit -m "fix(home): align ForYouRow stop field names with TripWithStops type"
```

---

### Task 7: Final verification and cleanup

**Step 1: Run full type check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -30`
Expected: No new errors introduced by our changes.

**Step 2: Visual review checklist**

Verify in Expo Go or simulator:
- [ ] Header shows Sola logo left, hamburger icon right
- [ ] Hamburger has 3 lines: top (20px black), middle (14px orange), bottom (20px black)
- [ ] Hamburger opens MenuSheet with all menu items
- [ ] Unread dot appears on hamburger when new activity
- [ ] Hero card is 220px tall, rounded corners, within 24px screen padding
- [ ] Hero shows trip pill (UPCOMING/NOW TRAVELING) when trip exists
- [ ] Hero shows "RECOMMENDED" pill + seasonal subtitle when no trip
- [ ] White action circle in top-right of hero (arrow or bookmark)
- [ ] "For you" section header with "See all" link
- [ ] 3 equal-width cards with images + city/place names
- [ ] Community banner card shows travel image with centered white text
- [ ] Community card navigates to connect tab on tap
- [ ] Pull-to-refresh works
- [ ] Bottom padding clears the floating tab bar
- [ ] Press states (scale 0.98, opacity 0.9) on all tappable elements

**Step 3: Commit any visual QA fixes**

```bash
git add -A
git commit -m "fix(home): visual QA adjustments for homepage dashboard redesign"
```

---

## Files Changed Summary

| Action | File | Description |
|--------|------|-------------|
| Create | `components/home/HamburgerButton.tsx` | Creative 3-line menu icon with orange accent |
| Rewrite | `components/home/HeroModule.tsx` | 220px rounded card with seasonal subtitle |
| Create | `components/home/ForYouRow.tsx` | 3-card contextual grid with waterfall logic |
| Create | `components/home/CommunityBannerCard.tsx` | Full-width image card for community |
| Rewrite | `app/(tabs)/home/index.tsx` | Simplified 4-block dashboard layout |
| Possibly modify | `components/home/ForYouRow.tsx` | Type alignment (Task 6) |

## Files NOT Modified

- `constants/design.ts` — existing tokens sufficient (already has `module`, `cardLg`, `overlayMedium`, etc.)
- `data/home/useHomeData.ts` — still provides all needed data
- `data/home/homeApi.ts` — no new API calls needed
- `data/home/types.ts` — existing `HeroState` types sufficient (featured state already has city info)
- `data/home/buildHomeSections.ts` — still exists and used by `useHomeData`, just not rendered via section switch in HomeScreen
- `components/NavigationHeader.tsx` — no changes needed, already accepts `rightActions` ReactNode
- `components/home/HomeSearchInput.tsx` — no longer imported but kept (not deleted)
- `components/home/SavedShortlist.tsx` — kept
- `components/home/DestinationCarousel.tsx` — kept
- `components/home/CommunityPeek.tsx` — kept
