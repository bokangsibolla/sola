# Homepage Dashboard Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Sola's homepage from an 11-section content feed into a 6-module premium travel dashboard with soft elevation, warm off-white background, and focused content hierarchy.

**Architecture:** Replace the existing ScrollView of flat components with elevated white modules on a `#FAFAF8` page background. Introduce an elevation system (4 shadow levels), new radius tokens, and a `surfacePage` color. Reduce from 11 sections to 6 focused modules: DashboardHeader, HeroModule, SavedShortlist, DestinationCarousel, CommunityPeek, QuickActionsGrid. Each module is a self-contained component. No data layer changes — existing `useHomeData()` provides all data.

**Tech Stack:** React Native, Expo Router, expo-image, expo-linear-gradient, Feather/Ionicons, existing Supabase hooks

**Key files to understand before starting:**
- `constants/design.ts` — design tokens (colors, spacing, radius, typography, fonts)
- `app/(tabs)/home/index.tsx` — current homepage screen
- `data/home/useHomeData.ts` — data hook (unchanged)
- `data/home/types.ts` — TypeScript types (unchanged)
- `components/AppScreen.tsx` — screen wrapper
- All files in `components/home/` — existing components being replaced

---

## Task 1: Update Design Tokens

**Files:**
- Modify: `constants/design.ts`

**Step 1: Add new color tokens**

Add after the existing `floatingNavIconInactive` line (~line 33) in the `colors` object:

```typescript
// Dashboard surfaces
surfacePage: '#FAFAF8',
surfaceCard: '#FFFFFF',
```

**Step 2: Add elevation system**

Add after the `pressedState` export (~line 69):

```typescript
export const elevation = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    shadowOpacity: 0.06,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 0.08,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    shadowOpacity: 0.10,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    shadowOpacity: 0.12,
    elevation: 10,
  },
} as const;
```

**Step 3: Add new radius tokens**

Add to the `radius` object:

```typescript
module: 16,
cardLg: 12,
```

**Step 4: Add new spacing token**

Add to the `spacing` object:

```typescript
moduleInset: 20,
```

**Step 5: Add new typography tokens**

Add to the `typography` object:

```typescript
greeting: { fontFamily: fonts.semiBold, fontSize: 24, lineHeight: 32 },
sectionTitle: { fontFamily: fonts.semiBold, fontSize: 18, lineHeight: 24 },
```

**Step 6: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | grep -E '(constants/design)' | head -20`
Expected: No errors from design.ts

**Step 7: Commit**

```bash
git add constants/design.ts
git commit -m "feat(design): add elevation system, surface colors, and dashboard tokens"
```

---

## Task 2: Create SectionHeader Component

**Files:**
- Create: `components/home/SectionHeader.tsx`

**Step 1: Create the component**

This is a reusable row: left-aligned title + optional right "See all" link.

```typescript
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/constants/design';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

export function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
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
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
  },
  seeAll: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.orange,
  },
});
```

**Step 2: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | grep -E '(components/home/SectionHeader)' | head -10`
Expected: No errors

**Step 3: Commit**

```bash
git add components/home/SectionHeader.tsx
git commit -m "feat(home): add SectionHeader reusable component"
```

---

## Task 3: Create DashboardHeader Component

**Files:**
- Create: `components/home/DashboardHeader.tsx`

**Context:** This replaces SearchPill. It renders a time-aware greeting, a contextual subtitle, and an elevated search input. It lives on `surfacePage` (no card container).

**Step 1: Create the component**

```typescript
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  colors,
  elevation,
  fonts,
  radius,
  spacing,
  typography,
  pressedState,
} from '@/constants/design';
import type { HeroState } from '@/data/home/types';

interface DashboardHeaderProps {
  firstName: string | null;
  heroState: HeroState;
  savedCount: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getContextualLine(hero: HeroState, savedCount: number): string {
  if (hero.kind === 'active') {
    const city = hero.trip.destinationName;
    const arriving = hero.trip.arriving;
    const leaving = hero.trip.leaving;
    if (arriving && leaving) {
      const now = new Date();
      const start = new Date(arriving);
      const end = new Date(leaving);
      const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      const currentDay = Math.min(totalDays, Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))));
      return `You're in ${city} \u2014 Day ${currentDay} of ${totalDays}`;
    }
    return `You're in ${city}`;
  }

  if (hero.kind === 'upcoming') {
    const city = hero.trip.destinationName;
    const arriving = hero.trip.arriving;
    if (arriving) {
      const days = Math.ceil((new Date(arriving).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (days > 0) return `Your trip to ${city} starts in ${days} ${days === 1 ? 'day' : 'days'}`;
    }
    return `Your trip to ${city} is coming up`;
  }

  if (savedCount > 0) {
    return `${savedCount} ${savedCount === 1 ? 'place' : 'places'} on your shortlist`;
  }

  return 'Ready to plan your next escape?';
}

export function DashboardHeader({ firstName, heroState, savedCount }: DashboardHeaderProps) {
  const router = useRouter();
  const greeting = getGreeting();
  const greetingText = firstName ? `${greeting}, ${firstName}` : greeting;
  const contextual = getContextualLine(heroState, savedCount);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{greetingText}</Text>
      <Text style={styles.contextual}>{contextual}</Text>

      <Pressable
        style={({ pressed }) => [
          styles.searchInput,
          pressed && styles.searchPressed,
        ]}
        onPress={() => router.push('/discover/search')}
        accessibilityRole="button"
        accessibilityLabel="Search destinations"
      >
        <Feather name="search" size={16} color={colors.textMuted} />
        <Text style={styles.searchPlaceholder}>Where to next?</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.greeting,
    color: colors.textPrimary,
  },
  contextual: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.sm,
    ...elevation.md,
  },
  searchPlaceholder: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  searchPressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },
});
```

**Step 2: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | grep -E '(components/home/DashboardHeader)' | head -10`
Expected: No errors

**Step 3: Commit**

```bash
git add components/home/DashboardHeader.tsx
git commit -m "feat(home): add DashboardHeader with greeting, context line, and elevated search"
```

---

## Task 4: Create HeroModule Component

**Files:**
- Create: `components/home/HeroModule.tsx`

**Context:** Replaces HeroCard. A white elevated container holding a full-width image card with structured data below. Three states: active, upcoming, featured. Travel advisory folded into active state.

**Step 1: Create the component**

```typescript
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  colors,
  elevation,
  fonts,
  radius,
  spacing,
  pressedState,
} from '@/constants/design';
import type { HeroState, TravelUpdate } from '@/data/home/types';

const FALLBACK_IMAGE = require('@/assets/images/solo-bali-palms.jpg');

interface HeroModuleProps {
  hero: HeroState;
  travelUpdate: TravelUpdate | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getImageSource(hero: HeroState) {
  let uri: string | null = null;
  if (hero.kind === 'active' || hero.kind === 'upcoming') {
    uri = hero.cityImageUrl || null;
  } else {
    uri = hero.city.heroImageUrl || null;
  }
  return uri ? { uri } : FALLBACK_IMAGE;
}

function formatLocalTime(timezone: string | null): string | null {
  if (!timezone) return null;
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
    }).format(new Date());
  } catch {
    return null;
  }
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

function getDayProgress(arriving: string | null, leaving: string | null): string | null {
  if (!arriving || !leaving) return null;
  const now = new Date();
  const start = new Date(arriving);
  const end = new Date(leaving);
  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = now.getTime() - start.getTime();
  if (totalMs <= 0) return null;
  const totalDays = Math.max(1, Math.ceil(totalMs / (1000 * 60 * 60 * 24)));
  const currentDay = Math.min(totalDays, Math.max(1, Math.ceil(elapsedMs / (1000 * 60 * 60 * 24))));
  return `Day ${currentDay} of ${totalDays}`;
}

function getDaysUntil(arriving: string | null): string | null {
  if (!arriving) return null;
  const days = Math.ceil((new Date(arriving).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return null;
  return `In ${days} ${days === 1 ? 'day' : 'days'}`;
}

// ── Severity styling ──────────────────────────────────────────────────────

const SEVERITY_STYLES = {
  info: { bg: colors.blueFill, color: colors.blueSoft, icon: 'info' as const },
  advisory: { bg: colors.warningFill, color: colors.warning, icon: 'alert-triangle' as const },
  alert: { bg: colors.emergencyFill, color: colors.emergency, icon: 'alert-circle' as const },
};

// ── Component ────────────────────────────────────────────────────────────────

export function HeroModule({ hero, travelUpdate }: HeroModuleProps) {
  const router = useRouter();

  // Tick local time every minute for active trip
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

  return (
    <View style={styles.module}>
      {/* Image card */}
      <Pressable
        style={({ pressed }) => [
          styles.imageContainer,
          pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
        ]}
        onPress={handlePress}
      >
        <Image
          source={imageSource}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.gradient}
        />

        {/* Status pill */}
        <View style={styles.pillContainer}>
          {hero.kind === 'active' && (
            <View style={[styles.pill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={[styles.pillText, { color: colors.greenFill }]}>
                CURRENTLY TRAVELING
              </Text>
            </View>
          )}
          {hero.kind === 'upcoming' && (
            <View style={[styles.pill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={[styles.pillText, { color: colors.orangeFill }]}>UPCOMING</Text>
            </View>
          )}
          {hero.kind === 'featured' && (
            <View style={[styles.pill, { backgroundColor: 'rgba(0,0,0,0.35)' }]}>
              <Text style={[styles.pillText, { color: '#FFFFFF' }]}>FEATURED</Text>
            </View>
          )}
        </View>

        {/* Overlay text */}
        <View style={styles.overlay}>
          {hero.kind === 'active' && (
            <>
              <Text style={styles.cityName} numberOfLines={1}>
                {hero.trip.destinationName}
              </Text>
              {(() => {
                const progress = getDayProgress(hero.trip.arriving, hero.trip.leaving);
                return progress ? <Text style={styles.metaText}>{progress}</Text> : null;
              })()}
            </>
          )}
          {hero.kind === 'upcoming' && (
            <>
              <Text style={styles.cityName} numberOfLines={1}>
                {hero.trip.destinationName}
              </Text>
              {(() => {
                const countdown = getDaysUntil(hero.trip.arriving);
                return countdown ? <Text style={styles.metaText}>{countdown}</Text> : null;
              })()}
            </>
          )}
          {hero.kind === 'featured' && (
            <>
              <Text style={styles.cityName} numberOfLines={1}>
                {hero.city.name}, {hero.city.countryName}
              </Text>
              {hero.city.shortBlurb && (
                <Text style={styles.blurbText} numberOfLines={2}>
                  {hero.city.shortBlurb}
                </Text>
              )}
            </>
          )}
        </View>
      </Pressable>

      {/* Below-image content */}
      <View style={styles.belowImage}>
        {/* Active: data chips */}
        {hero.kind === 'active' && (
          <View style={styles.chipRow}>
            {(() => {
              const localTime = formatLocalTime(hero.cityTimezone);
              return localTime ? (
                <View style={styles.dataChip}>
                  <Feather name="clock" size={12} color={colors.textSecondary} />
                  <Text style={styles.chipText}>{localTime}</Text>
                </View>
              ) : null;
            })()}
          </View>
        )}

        {/* Upcoming: meta row + CTA */}
        {hero.kind === 'upcoming' && (
          <>
            <Text style={styles.dateRange}>
              {formatDateRange(hero.trip.arriving, hero.trip.leaving)}
              {hero.savedItemCount > 0 &&
                `  \u00B7  ${hero.savedItemCount} ${hero.savedItemCount === 1 ? 'place' : 'places'} saved`}
            </Text>
            <Pressable
              onPress={handlePress}
              hitSlop={8}
              style={styles.ctaRow}
            >
              <Text style={styles.ctaText}>Continue planning</Text>
              <Feather name="arrow-right" size={14} color={colors.orange} />
            </Pressable>
          </>
        )}

        {/* Featured: signal chips + CTA */}
        {hero.kind === 'featured' && (
          <>
            <View style={styles.chipRow}>
              <View style={styles.signalChip}>
                <Text style={styles.signalChipText}>Solo-friendly</Text>
              </View>
            </View>
            <Pressable
              onPress={handlePress}
              hitSlop={8}
              style={styles.ctaRow}
            >
              <Text style={styles.ctaText}>Start planning</Text>
              <Feather name="arrow-right" size={14} color={colors.orange} />
            </Pressable>
          </>
        )}

        {/* Travel advisory (active trip only) */}
        {hero.kind === 'active' && travelUpdate && (
          <View
            style={[
              styles.advisory,
              { backgroundColor: SEVERITY_STYLES[travelUpdate.severity].bg },
            ]}
          >
            <Feather
              name={SEVERITY_STYLES[travelUpdate.severity].icon}
              size={14}
              color={SEVERITY_STYLES[travelUpdate.severity].color}
            />
            <Text
              style={[
                styles.advisoryText,
                { color: SEVERITY_STYLES[travelUpdate.severity].color },
              ]}
              numberOfLines={1}
            >
              {travelUpdate.title}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const IMAGE_HEIGHT_TRIP = 200;
const IMAGE_HEIGHT_FEATURED = 220;

const styles = StyleSheet.create({
  module: {
    marginHorizontal: spacing.screenX,
    marginBottom: spacing.xl,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.module,
    overflow: 'hidden',
    ...elevation.lg,
  },
  imageContainer: {
    // Height is set dynamically per state, but we use a default
    // The image fills the container, so height comes from the image style
  },
  image: {
    width: '100%',
    height: IMAGE_HEIGHT_TRIP,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },

  // Status pill
  pillContainer: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.lg,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  pillText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Overlay text
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  cityName: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    lineHeight: 28,
    color: '#FFFFFF',
  },
  metaText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
  },
  blurbText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
  },

  // Below image area
  belowImage: {
    padding: spacing.moduleInset,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dataChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  signalChip: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  signalChipText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  dateRange: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  ctaText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.orange,
  },

  // Advisory
  advisory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.cardLg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  advisoryText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});
```

**Step 2: Handle featured image height**

The featured state needs a taller image (220px). The cleanest approach: make image height dynamic. In the image style, override height inline:

In the `<Image>` component, change the style to:
```typescript
style={[
  styles.image,
  hero.kind === 'featured' && { height: IMAGE_HEIGHT_FEATURED },
]}
```

This is already handled in the code above — the `IMAGE_HEIGHT_FEATURED` constant exists. Just add the conditional style to the Image component in the JSX.

**Step 3: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | grep -E '(components/home/HeroModule)' | head -10`
Expected: No errors

**Step 4: Commit**

```bash
git add components/home/HeroModule.tsx
git commit -m "feat(home): add HeroModule with elevation, 3 states, and inline advisory"
```

---

## Task 5: Create SavedShortlist Component

**Files:**
- Create: `components/home/SavedShortlist.tsx`

**Context:** Replaces SavedPreview. Elevated white card with square thumbnails (not circular). Only renders if user has saved places.

**Step 1: Create the component**

```typescript
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  colors,
  elevation,
  fonts,
  radius,
  spacing,
  pressedState,
} from '@/constants/design';
import type { SavedPlacePreview } from '@/data/home/types';

interface SavedShortlistProps {
  places: SavedPlacePreview[];
}

export function SavedShortlist({ places }: SavedShortlistProps) {
  const router = useRouter();

  if (places.length === 0) return null;

  const totalCount = places.length;
  const visiblePlaces = places.slice(0, 3);
  const overflowCount = totalCount - 3;

  // Count unique cities
  const cityNames = new Set<string>();
  places.forEach((p) => {
    if (p.cityName) cityNames.add(p.cityName);
  });
  const cityCount = cityNames.size;

  const summaryParts: string[] = [];
  summaryParts.push(`${totalCount} ${totalCount === 1 ? 'place' : 'places'}`);
  if (cityCount > 0) summaryParts.push(`${cityCount} ${cityCount === 1 ? 'city' : 'cities'}`);
  const summaryText = summaryParts.join(' \u00B7 ');

  return (
    <Pressable
      style={({ pressed }) => [
        styles.module,
        pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
      ]}
      onPress={() => router.push('/home/saved')}
      accessibilityRole="button"
      accessibilityLabel="View saved places"
    >
      <View style={styles.titleRow}>
        <Text style={styles.title}>Your Shortlist</Text>
        <Feather name="chevron-right" size={18} color={colors.textSecondary} />
      </View>

      <View style={styles.thumbRow}>
        {visiblePlaces.map((place) => (
          <View key={place.placeId} style={styles.thumbWrap}>
            {place.imageUrl ? (
              <Image
                source={{ uri: place.imageUrl }}
                style={styles.thumbImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.thumbImage, styles.thumbPlaceholder]} />
            )}
          </View>
        ))}
        {overflowCount > 0 && (
          <View style={[styles.thumbWrap, styles.overflowThumb]}>
            <Text style={styles.overflowText}>+{overflowCount}</Text>
          </View>
        )}
      </View>

      <Text style={styles.summary}>{summaryText}</Text>
    </Pressable>
  );
}

const THUMB_SIZE = 56;

const styles = StyleSheet.create({
  module: {
    marginHorizontal: spacing.screenX,
    marginBottom: spacing.xl,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.module,
    padding: spacing.moduleInset,
    ...elevation.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  thumbRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  thumbWrap: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.cardLg,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutralFill,
  },
  thumbPlaceholder: {
    backgroundColor: colors.borderDefault,
  },
  overflowThumb: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textSecondary,
  },
  summary: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
```

**Step 2: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | grep -E '(components/home/SavedShortlist)' | head -10`
Expected: No errors

**Step 3: Commit**

```bash
git add components/home/SavedShortlist.tsx
git commit -m "feat(home): add SavedShortlist elevated card with square thumbnails"
```

---

## Task 6: Create DestinationCard and DestinationCarousel Components

**Files:**
- Create: `components/home/DestinationCard.tsx`
- Create: `components/home/DestinationCarousel.tsx`

**Context:** Replaces PersonalizedCarousel. White cards with image on top, text below — no dark gradient overlay. Individual cards are elevated.

**Step 1: Create DestinationCard**

```typescript
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  colors,
  elevation,
  fonts,
  radius,
  spacing,
  pressedState,
} from '@/constants/design';
import type { PersonalizedCity } from '@/data/home/types';

interface DestinationCardProps {
  city: PersonalizedCity;
  width: number;
}

function getSignalText(city: PersonalizedCity): string | null {
  if (city.soloLevel === 'beginner') return 'Great for first-timers';
  if (city.bestFor) return city.bestFor;
  return 'Solo-friendly';
}

export function DestinationCard({ city, width }: DestinationCardProps) {
  const router = useRouter();
  const signal = getSignalText(city);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { width },
        pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
      ]}
      onPress={() => router.push(`/discover/city/${city.slug}` as any)}
    >
      {city.heroImageUrl ? (
        <Image
          source={{ uri: city.heroImageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      <View style={styles.textArea}>
        <Text style={styles.cityName} numberOfLines={1}>
          {city.cityName}
        </Text>
        <Text style={styles.countryName} numberOfLines={1}>
          {city.countryName}
        </Text>
        {signal && (
          <View style={styles.signalChip}>
            <Text style={styles.signalText} numberOfLines={1}>
              {signal}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const IMAGE_HEIGHT = 130;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.module,
    overflow: 'hidden',
    ...elevation.md,
  },
  image: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: colors.neutralFill,
  },
  placeholder: {
    backgroundColor: colors.neutralFill,
  },
  textArea: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  cityName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  countryName: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  signalChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: spacing.md,
  },
  signalText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textSecondary,
  },
});
```

**Step 2: Create DestinationCarousel**

```typescript
import React from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { spacing } from '@/constants/design';
import { SectionHeader } from './SectionHeader';
import { DestinationCard } from './DestinationCard';
import type { PersonalizedCity } from '@/data/home/types';

interface DestinationCarouselProps {
  cities: PersonalizedCity[];
  isPersonalized?: boolean;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.screenX * 2 - CARD_GAP) / 2;

export function DestinationCarousel({ cities, isPersonalized = false }: DestinationCarouselProps) {
  const router = useRouter();

  if (cities.length === 0) return null;

  const title = isPersonalized ? 'Recommended for you' : 'Popular with Solo Women';

  return (
    <View style={styles.container}>
      <SectionHeader
        title={title}
        onSeeAll={() => router.push('/discover/browse' as any)}
      />
      <FlatList
        data={cities}
        keyExtractor={(item) => item.cityId}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <DestinationCard city={item} width={CARD_WIDTH} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  listContent: {
    paddingHorizontal: spacing.screenX,
    gap: CARD_GAP,
  },
});
```

**Step 3: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | grep -E '(components/home/Destination)' | head -10`
Expected: No errors

**Step 4: Commit**

```bash
git add components/home/DestinationCard.tsx components/home/DestinationCarousel.tsx
git commit -m "feat(home): add DestinationCard and DestinationCarousel with structured layout"
```

---

## Task 7: Create CommunityPeek Component

**Files:**
- Create: `components/home/CommunityPeek.tsx`

**Context:** Replaces CommunityCards. 1-2 text-only stacked cards. No images, no carousel. Uses `CommunityHighlightThreadVisual` type but ignores `cityImageUrl`.

**Step 1: Create the component**

```typescript
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  colors,
  elevation,
  fonts,
  radius,
  spacing,
  pressedState,
} from '@/constants/design';
import { SectionHeader } from './SectionHeader';
import type { CommunityHighlightThreadVisual } from '@/data/home/types';

interface CommunityPeekProps {
  threads: CommunityHighlightThreadVisual[];
}

export function CommunityPeek({ threads }: CommunityPeekProps) {
  const router = useRouter();

  if (threads.length === 0) return null;

  // Show max 2 threads
  const visibleThreads = threads.slice(0, 2);

  return (
    <View style={styles.container}>
      <SectionHeader
        title="From the Community"
        onSeeAll={() => router.push('/(tabs)/connect' as any)}
      />

      <View style={styles.cards}>
        {visibleThreads.map((thread) => (
          <Pressable
            key={thread.id}
            style={({ pressed }) => [
              styles.card,
              pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
            ]}
            onPress={() => router.push(`/(tabs)/connect/thread/${thread.id}` as any)}
          >
            <Text style={styles.threadTitle} numberOfLines={2}>
              {thread.title}
            </Text>
            <View style={styles.metaRow}>
              {thread.cityName && (
                <>
                  <View style={styles.destinationTag}>
                    <Text style={styles.destinationTagText}>{thread.cityName}</Text>
                  </View>
                  <Text style={styles.dot}>&middot;</Text>
                </>
              )}
              <Text style={styles.replyCount}>
                {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  cards: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.module,
    padding: spacing.moduleInset,
    ...elevation.sm,
  },
  threadTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  destinationTag: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  destinationTagText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  dot: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  replyCount: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});
```

**Step 2: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | grep -E '(components/home/CommunityPeek)' | head -10`
Expected: No errors

**Step 3: Commit**

```bash
git add components/home/CommunityPeek.tsx
git commit -m "feat(home): add CommunityPeek with text-only stacked thread cards"
```

---

## Task 8: Create QuickActionsGrid Component

**Files:**
- Create: `components/home/QuickActionsGrid.tsx`

**Context:** Replaces QuickLinksRow. 2x2 grid of tiles with icon circles.

**Step 1: Create the component**

```typescript
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  colors,
  elevation,
  fonts,
  radius,
  spacing,
  pressedState,
} from '@/constants/design';

interface QuickActionsGridProps {
  activeTripId?: string | null;
}

interface ActionItem {
  label: string;
  subtitle: string;
  route: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
}

export function QuickActionsGrid({ activeTripId }: QuickActionsGridProps) {
  const router = useRouter();

  const items: ActionItem[] = [
    {
      label: 'Safety Info',
      subtitle: 'Emergency help\n& local numbers',
      route: activeTripId
        ? `/(tabs)/home/trips/${activeTripId}`
        : '/(tabs)/trips',
      iconName: 'shield-checkmark-outline',
      iconColor: colors.greenSoft,
      iconBg: colors.greenFill,
    },
    {
      label: 'Browse',
      subtitle: 'Explore cities\n& destinations',
      route: '/(tabs)/discover',
      iconName: 'compass-outline',
      iconColor: colors.blueSoft,
      iconBg: colors.blueFill,
    },
    {
      label: 'Community',
      subtitle: 'Questions from\nsolo travelers',
      route: '/(tabs)/connect',
      iconName: 'chatbubbles-outline',
      iconColor: colors.orange,
      iconBg: colors.orangeFill,
    },
    {
      label: 'My Trips',
      subtitle: 'Plan & organize\nyour travels',
      route: '/(tabs)/trips',
      iconName: 'airplane-outline',
      iconColor: colors.textSecondary,
      iconBg: colors.neutralFill,
    },
  ];

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            styles.tile,
            pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
          ]}
          onPress={() => router.push(item.route as any)}
        >
          <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
            <Ionicons name={item.iconName} size={18} color={item.iconColor} />
          </View>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const ICON_SIZE = 32;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.screenX,
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  tile: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.module,
    padding: spacing.moduleInset,
    minHeight: 100,
    ...elevation.sm,
  },
  iconCircle: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
```

**Step 2: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | grep -E '(components/home/QuickActionsGrid)' | head -10`
Expected: No errors

**Step 3: Commit**

```bash
git add components/home/QuickActionsGrid.tsx
git commit -m "feat(home): add QuickActionsGrid 2x2 dashboard tiles"
```

---

## Task 9: Assemble New Homepage

**Files:**
- Modify: `app/(tabs)/home/index.tsx`

**Context:** Replace the current 11-section ScrollView with the new 6-module layout. Wire up all new components. Use `surfacePage` background.

**Step 1: Rewrite index.tsx**

Replace the entire file content with:

```typescript
import { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { usePostHog } from 'posthog-react-native';
import { useRouter } from 'expo-router';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import AvatarButton from '@/components/AvatarButton';
import { DashboardHeader } from '@/components/home/DashboardHeader';
import { HeroModule } from '@/components/home/HeroModule';
import { SavedShortlist } from '@/components/home/SavedShortlist';
import { DestinationCarousel } from '@/components/home/DestinationCarousel';
import { CommunityPeek } from '@/components/home/CommunityPeek';
import { QuickActionsGrid } from '@/components/home/QuickActionsGrid';
import { useHomeData } from '@/data/home/useHomeData';
import { colors, spacing } from '@/constants/design';
import { FLOATING_TAB_BAR_HEIGHT } from '@/components/TabBar';

export default function HomeScreen() {
  const posthog = usePostHog();
  const router = useRouter();

  useEffect(() => {
    posthog.capture('home_viewed');
  }, [posthog]);

  const {
    firstName,
    heroState,
    personalizedCities,
    travelUpdate,
    communityHighlights,
    savedPlaces,
    loading,
    refetch,
  } = useHomeData();

  const activeTripId =
    heroState.kind === 'active' || heroState.kind === 'upcoming'
      ? heroState.trip.id
      : null;

  return (
    <AppScreen style={styles.screen}>
      <NavigationHeader
        title="Home"
        showLogo
        rightActions={<AvatarButton />}
      />

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
        {/* 1. Dashboard Header — greeting + search */}
        <DashboardHeader
          firstName={firstName}
          heroState={heroState}
          savedCount={savedPlaces.length}
        />

        {/* 2. Hero Module — trip/featured */}
        <HeroModule hero={heroState} travelUpdate={travelUpdate} />

        {/* 3. Saved Shortlist — conditional */}
        <SavedShortlist places={savedPlaces} />

        {/* 4. Destinations */}
        <DestinationCarousel cities={personalizedCities} />

        {/* 5. Community Peek */}
        <CommunityPeek threads={communityHighlights} />

        {/* 6. Quick Actions */}
        <QuickActionsGrid activeTripId={activeTripId} />

        {/* Bottom spacing for floating tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surfacePage,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  bottomSpacer: {
    height: FLOATING_TAB_BAR_HEIGHT,
  },
});
```

**Step 2: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/home/)' | head -30`
Expected: No errors from home-related files

**Step 3: Visual check**

Run: `npx expo start` and check the homepage in the simulator. Verify:
- Off-white background visible behind white modules
- Hero card has soft shadow
- Destination cards are white with image on top
- Community cards are text-only, stacked
- Quick actions are a 2x2 grid
- Greeting shows time-aware text
- Search input is elevated

**Step 4: Commit**

```bash
git add app/(tabs)/home/index.tsx
git commit -m "feat(home): assemble new dashboard homepage with 6 focused modules"
```

---

## Task 10: Update AppScreen Background

**Files:**
- Modify: `components/AppScreen.tsx`

**Context:** AppScreen sets `backgroundColor: colors.background` (#FFFFFF). The homepage overrides this via the `style` prop, but the AppScreen's `content` View also has `paddingHorizontal: spacing.lg` (16px). Since homepage components manage their own horizontal padding via `spacing.screenX` (24px), we need to ensure the content padding doesn't double up. Check if removing AppScreen content padding or passing `backgroundColor` via style works correctly.

**Step 1: Verify the style override works**

The homepage passes `style={{ backgroundColor: colors.surfacePage }}` which merges into `[styles.container, style]` on the SafeAreaView. This overrides the container background. The content View's `paddingHorizontal: spacing.lg` is separate and won't cause issues because homepage components use `marginHorizontal: spacing.screenX` which is relative to the content View.

However, `spacing.lg` is 16px and `spacing.screenX` is 24px. Total effective padding would be 40px from screen edge. This is wrong.

**Fix:** The homepage needs `paddingHorizontal: 0` on the content wrapper, OR use `screenX - lg = 8px` for margins. Looking at the existing code, the current components already use `marginHorizontal: spacing.screenX` or `paddingHorizontal: spacing.screenX` and the page looks fine — which means AppScreen's `paddingHorizontal: spacing.lg` is **already being counteracted** by the components using the full screenX value.

Wait — looking at AppScreen more carefully, `paddingHorizontal: spacing.lg` is 16px. And HeroCard uses `marginHorizontal: spacing.screenX` which is 24px. So the total from screen edge would be 16 + 24 = 40px? That can't be right — the current app would look broken.

Let me check: `spacing.lg = 16`. The components' `marginHorizontal: 24` plus AppScreen content's `paddingHorizontal: 16` = effective 40px from edge. But the app looks fine currently, which means the components are accounting for AppScreen's padding, OR the math works differently.

Actually — `paddingHorizontal` on the content View creates internal padding. `marginHorizontal` on the child creates additional offset. So yes, total edge distance is `16 + 24 = 40px`. If the existing app doesn't look broken, then the margin values in the components must already account for this. Let me check — perhaps the components actually use a smaller margin, or AppScreen's padding serves as the base.

**Resolution:** Check how the actual rendered UI looks. If 40px is too much, we may need to either:
1. Remove `paddingHorizontal` from AppScreen's content View (risky — affects all screens)
2. Adjust homepage components to use `marginHorizontal: spacing.sm` (8px) to get 16+8=24px total

The safest path: keep AppScreen as-is and reduce homepage component margins to `spacing.sm` so the total is `16 + 8 = 24px`.

BUT — looking at existing SearchPill, it uses `marginHorizontal: spacing.screenX` (24px), and it looks fine in the current app. So either AppScreen's padding is being overridden, or the total 40px is intentional.

**Action:** Don't change AppScreen. Test visually in Task 9's step 3. If padding looks wrong, adjust component margins. This is a visual tuning step, not an architecture change.

**Step 2: No changes needed — skip this task**

If the visual check in Task 9 reveals padding issues, adjust then.

---

## Task 11: Cleanup Deprecated Components

**Files:**
- Delete: `components/home/IntentHeader.tsx` (already unused)
- Delete: `components/home/TripBlock.tsx` (already unused)
- Delete: `components/home/CommunityHighlight.tsx` (already unused)

**Do NOT delete yet** (other screens may import):
- `components/home/SearchPill.tsx`
- `components/home/HeroCard.tsx`
- `components/home/TripCard.tsx`
- `components/home/SavedPreview.tsx`
- `components/home/PersonalizedCarousel.tsx`
- `components/home/CommunityCards.tsx`
- `components/home/QuickLinksRow.tsx`
- `components/home/QuickUpdate.tsx`
- `components/home/VibeSection.tsx`
- `components/home/EndCard.tsx`

**Step 1: Check for imports of unused components**

Run:
```bash
grep -r "IntentHeader\|TripBlock\|CommunityHighlight" app/ components/ --include="*.tsx" --include="*.ts" -l
```

If only the component files themselves show up, safe to delete.

**Step 2: Delete unused files**

```bash
rm components/home/IntentHeader.tsx components/home/TripBlock.tsx components/home/CommunityHighlight.tsx
```

**Step 3: Verify build**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/)' | head -20`
Expected: No new errors

**Step 4: Commit**

```bash
git add -u components/home/
git commit -m "chore(home): remove unused IntentHeader, TripBlock, CommunityHighlight"
```

---

## Task 12: Final Type Check and Visual Verification

**Step 1: Full type check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|constants/)' | head -40`
Expected: No new errors (only pre-existing ones from scripts/ and supabase/functions/)

**Step 2: Visual verification checklist**

Open the app in iOS simulator and verify each module:

- [ ] Page background is warm off-white (#FAFAF8), not pure white
- [ ] NavigationHeader shows Sola logo + AvatarButton (unchanged)
- [ ] Greeting is time-aware ("Good morning/afternoon/evening, Name")
- [ ] Contextual subtitle matches user state
- [ ] Search input is white pill with soft shadow
- [ ] Hero module has white card container with shadow
- [ ] Hero image has rounded corners, gradient, text overlay
- [ ] Below-image area shows appropriate content per state
- [ ] Saved Shortlist card appears (if saved places exist)
- [ ] Saved thumbnails are square with rounded corners (not circular)
- [ ] Destination cards are white with image top, text bottom
- [ ] Destination cards have no dark gradient overlay
- [ ] Community cards are text-only, stacked vertically
- [ ] Quick actions are 2x2 grid with icon circles
- [ ] Floating tab bar is visible and not overlapped
- [ ] Pull-to-refresh works
- [ ] All pressable elements have press state feedback
- [ ] No visual glitches on scroll

**Step 3: Commit any fixes from visual QA**

```bash
git add -A && git commit -m "fix(home): visual QA adjustments for dashboard redesign"
```
