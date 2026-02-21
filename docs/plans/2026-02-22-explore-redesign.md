# Explore Page Editorial Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current Discover feed (collections grid + recommended cities carousel) with a cinematic editorial discovery surface: hero → continent filter → 2-column country grid.

**Architecture:** Single ScrollView with three new components (EditorialHero, ContinentFilter, CountryShowcaseCard) powered by one Supabase query (`getCountries()`). No feed builder, no FeedItem union, no collections. Continent filtering is client-side from already-loaded data.

**Tech Stack:** React Native, Expo Router, Supabase, expo-image, expo-linear-gradient

---

## Task 1: Add Design Tokens

**Files:**
- Modify: `constants/design.ts`

**Step 1: Add new color tokens**

Add these to the `colors` object:

```typescript
// Editorial overlay system
heroGradientEnd: 'rgba(0,0,0,0.55)',
cardGradientEnd: 'rgba(0,0,0,0.5)',
frostedPillBg: 'rgba(255,255,255,0.15)',
frostedPillBorder: 'rgba(255,255,255,0.25)',
textOnImage: '#FFFFFF',
textOnImageMuted: 'rgba(255,255,255,0.7)',
```

**Step 2: Add new typography tokens**

Add these to the `typography` object:

```typescript
heroTitle: { fontFamily: fonts.semiBold, fontSize: 28, lineHeight: 34 },
heroSubtitle: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
cardTitle: { fontFamily: fonts.semiBold, fontSize: 17, lineHeight: 22 },
cardSubtitle: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
filterLabel: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 20 },
pillLabel: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 14 },
```

**Step 3: Add new cardHeight tokens**

Add these to the `cardHeight` object:

```typescript
hero: 280,
```

**Step 4: Run TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|constants/)' | head -20`
Expected: No new errors in constants/design.ts

**Step 5: Commit**

```bash
git add constants/design.ts
git commit -m "feat(design): add editorial explore tokens — hero, card, filter, pill typography + overlay colors"
```

---

## Task 2: Create useExploreData Hook

**Files:**
- Create: `data/discover/useExploreData.ts`

**Step 1: Create the hook file**

```typescript
// data/discover/useExploreData.ts
import { useState, useEffect, useMemo } from 'react';
import * as Sentry from '@sentry/react-native';
import { getCountries } from '../api';
import type { Country } from '../types';
import type { ContinentKey } from './types';
import { CONTINENT_LABELS, CONTINENT_ORDER } from './types';

interface ExploreData {
  featuredCountry: Country | null;
  countries: Country[];
  continents: { key: ContinentKey; label: string }[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

/**
 * Pick a featured country using date-seeded rotation.
 * If multiple countries have is_featured=true, rotates daily.
 * Returns null if none are featured.
 */
function pickFeaturedCountry(countries: Country[]): Country | null {
  const featured = countries.filter((c) => c.isFeatured);
  if (featured.length === 0) return null;
  if (featured.length === 1) return featured[0];
  // Rotate daily using date as seed
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  return featured[dayOfYear % featured.length];
}

/**
 * Extract unique continents from country list, in canonical order.
 * Only includes continents that have at least one country.
 */
function extractContinents(
  countries: Country[],
): { key: ContinentKey; label: string }[] {
  const present = new Set(
    countries
      .map((c) => c.continent)
      .filter((c): c is ContinentKey => c != null),
  );
  return CONTINENT_ORDER.filter((k) => present.has(k)).map((k) => ({
    key: k,
    label: CONTINENT_LABELS[k],
  }));
}

export function useExploreData(): ExploreData {
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const countries = await getCountries();
        if (!cancelled) setAllCountries(countries);
      } catch (e) {
        if (!cancelled) {
          const err = e instanceof Error ? e : new Error('Failed to load countries');
          setError(err);
          Sentry.captureException(e);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const featuredCountry = useMemo(
    () => pickFeaturedCountry(allCountries),
    [allCountries],
  );

  // Exclude featured country from grid to avoid duplication
  const countries = useMemo(
    () =>
      featuredCountry
        ? allCountries.filter((c) => c.id !== featuredCountry.id)
        : allCountries,
    [allCountries, featuredCountry],
  );

  const continents = useMemo(() => extractContinents(countries), [countries]);

  return {
    featuredCountry,
    countries,
    continents,
    isLoading,
    error,
    refresh: () => setRefreshKey((k) => k + 1),
  };
}
```

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|constants/)' | head -20`
Expected: No new errors in data/discover/useExploreData.ts

**Step 3: Commit**

```bash
git add data/discover/useExploreData.ts
git commit -m "feat(data): add useExploreData hook — single query, client-side continent filtering"
```

---

## Task 3: Create EditorialHero Component

**Files:**
- Create: `components/explore/EditorialHero.tsx`

**Context:**
- Uses `expo-image` (Image) for the country hero image
- Uses `expo-linear-gradient` (LinearGradient) for dark overlay
- Badge pill shows `badgeLabel` field, fallback "Featured"
- Tapping navigates to country detail via `router.push`
- Design: 280px tall, 16px radius, bottom gradient, frosted pill, white text

**Step 1: Create the component**

```typescript
// components/explore/EditorialHero.tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type { Country } from '@/data/types';
import { CONTINENT_LABELS } from '@/data/discover/types';
import type { ContinentKey } from '@/data/discover/types';
import {
  colors,
  fonts,
  spacing,
  radius,
  typography,
  cardHeight,
  pressedState,
} from '@/constants/design';

interface EditorialHeroProps {
  country: Country;
}

export function EditorialHero({ country }: EditorialHeroProps) {
  const router = useRouter();
  const continentLabel = country.continent
    ? CONTINENT_LABELS[country.continent as ContinentKey]
    : null;

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/discover/${country.slug}`)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Featured: ${country.name}`}
    >
      <Image
        source={{ uri: country.heroImageUrl ?? undefined }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={['transparent', 'transparent', colors.heroGradientEnd]}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.content}>
        <View style={styles.pillContainer}>
          <Text style={styles.pillText}>
            {country.badgeLabel ?? 'Featured'}
          </Text>
        </View>
        <Text style={styles.title}>{country.name}</Text>
        {continentLabel && (
          <Text style={styles.subtitle}>{continentLabel}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: cardHeight.hero,
    borderRadius: radius.module,
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
    padding: spacing.moduleInset,
  },
  pillContainer: {
    alignSelf: 'flex-start',
    backgroundColor: colors.frostedPillBg,
    borderWidth: 1,
    borderColor: colors.frostedPillBorder,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  pillText: {
    ...typography.pillLabel,
    color: colors.textOnImage,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    ...typography.heroTitle,
    color: colors.textOnImage,
  },
  subtitle: {
    ...typography.heroSubtitle,
    color: colors.textOnImageMuted,
    marginTop: spacing.xs,
  },
});
```

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|constants/)' | head -20`
Expected: No new errors

**Step 3: Commit**

```bash
git add components/explore/EditorialHero.tsx
git commit -m "feat(explore): add EditorialHero — cinematic featured country card"
```

---

## Task 4: Create ContinentFilter Component

**Files:**
- Create: `components/explore/ContinentFilter.tsx`

**Context:**
- Horizontal ScrollView, no scroll indicators
- Items: "All" + each continent present in data
- Active state: textPrimary + 2px orange underline
- Inactive state: textMuted, no underline
- 44px touch targets
- First item aligns to 24px screen padding

**Step 1: Create the component**

```typescript
// components/explore/ContinentFilter.tsx
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ContinentKey } from '@/data/discover/types';
import { colors, fonts, spacing, typography } from '@/constants/design';

interface ContinentFilterProps {
  continents: { key: ContinentKey; label: string }[];
  selected: ContinentKey | null; // null = "All"
  onSelect: (continent: ContinentKey | null) => void;
}

export function ContinentFilter({
  continents,
  selected,
  onSelect,
}: ContinentFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <FilterItem
        label="All"
        isActive={selected === null}
        onPress={() => onSelect(null)}
      />
      {continents.map((c) => (
        <FilterItem
          key={c.key}
          label={c.label}
          isActive={selected === c.key}
          onPress={() => onSelect(c.key)}
        />
      ))}
    </ScrollView>
  );
}

function FilterItem({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.item}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <Text style={[styles.label, isActive && styles.labelActive]}>
        {label}
      </Text>
      {isActive && <View style={styles.underline} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.xl,
  },
  item: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  label: {
    ...typography.filterLabel,
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.textPrimary,
  },
  underline: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.orange,
    borderRadius: 1,
  },
});
```

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|constants/)' | head -20`
Expected: No new errors

**Step 3: Commit**

```bash
git add components/explore/ContinentFilter.tsx
git commit -m "feat(explore): add ContinentFilter — minimal underline-style continent selector"
```

---

## Task 5: Create CountryShowcaseCard Component

**Files:**
- Create: `components/explore/CountryShowcaseCard.tsx`

**Context:**
- 4:5 aspect ratio portrait card
- Image fills card with bottom gradient
- Country name (17px semiBold white) + continent subtitle (13px regular white 70%)
- Optional badge_label as frosted pill above name
- 16px border radius, overflow hidden
- Standard press state

**Step 1: Create the component**

```typescript
// components/explore/CountryShowcaseCard.tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type { Country } from '@/data/types';
import { CONTINENT_LABELS } from '@/data/discover/types';
import type { ContinentKey } from '@/data/discover/types';
import {
  colors,
  fonts,
  spacing,
  radius,
  typography,
  pressedState,
} from '@/constants/design';

interface CountryShowcaseCardProps {
  country: Country;
}

const ASPECT_RATIO = 4 / 5;

export function CountryShowcaseCard({ country }: CountryShowcaseCardProps) {
  const router = useRouter();
  const continentLabel = country.continent
    ? CONTINENT_LABELS[country.continent as ContinentKey]
    : null;

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/discover/${country.slug}`)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={country.name}
    >
      <Image
        source={{ uri: country.heroImageUrl ?? undefined }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={['transparent', 'transparent', colors.cardGradientEnd]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.content}>
        {country.badgeLabel && (
          <View style={styles.pillContainer}>
            <Text style={styles.pillText}>{country.badgeLabel}</Text>
          </View>
        )}
        <Text style={styles.title} numberOfLines={1}>
          {country.name}
        </Text>
        {continentLabel && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {continentLabel}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: ASPECT_RATIO,
    borderRadius: radius.module,
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
  pillContainer: {
    alignSelf: 'flex-start',
    backgroundColor: colors.frostedPillBg,
    borderWidth: 1,
    borderColor: colors.frostedPillBorder,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginBottom: spacing.xs,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 13,
    color: colors.textOnImage,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    ...typography.cardTitle,
    color: colors.textOnImage,
  },
  subtitle: {
    ...typography.cardSubtitle,
    color: colors.textOnImageMuted,
    marginTop: 2,
  },
});
```

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|constants/)' | head -20`
Expected: No new errors

**Step 3: Commit**

```bash
git add components/explore/CountryShowcaseCard.tsx
git commit -m "feat(explore): add CountryShowcaseCard — 4:5 portrait country grid card"
```

---

## Task 6: Rewrite Discover Screen

**Files:**
- Modify: `app/(tabs)/discover/index.tsx` (full rewrite)

**Context:**
- Replace entire file contents
- Uses: useExploreData (new hook), EditorialHero, ContinentFilter, CountryShowcaseCard
- Layout: NavigationHeader → SearchTrigger → EditorialHero → ContinentFilter → CountryGrid
- Local state: selectedContinent (ContinentKey | null)
- Countries filtered client-side by selected continent
- Grid: manual 2-per-row pairing (no flexWrap — consistent with existing pattern, see old gridRows logic)
- Empty state when filter yields 0 countries

**Step 1: Rewrite the screen**

```typescript
// app/(tabs)/discover/index.tsx
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import AvatarButton from '@/components/AvatarButton';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { EditorialHero } from '@/components/explore/EditorialHero';
import { ContinentFilter } from '@/components/explore/ContinentFilter';
import { CountryShowcaseCard } from '@/components/explore/CountryShowcaseCard';
import { useExploreData } from '@/data/discover/useExploreData';
import type { ContinentKey } from '@/data/discover/types';
import type { Country } from '@/data/types';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';
import { FLOATING_TAB_BAR_HEIGHT } from '@/components/TabBar';

// ── Inline: search trigger ─────────────────────────────────

function SearchTrigger({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.searchBar, pressed && { opacity: pressedState.opacity }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Search destinations"
    >
      <Feather name="search" size={18} color={colors.textMuted} />
      <Text style={styles.searchText}>Find a destination</Text>
    </Pressable>
  );
}

// ── Main screen ─────────────────────────────────────────────

export default function DiscoverScreen() {
  const { featuredCountry, countries, continents, isLoading, error, refresh } =
    useExploreData();
  const router = useRouter();
  const [selectedContinent, setSelectedContinent] = useState<ContinentKey | null>(null);

  const filteredCountries = useMemo(
    () =>
      selectedContinent
        ? countries.filter((c) => c.continent === selectedContinent)
        : countries,
    [countries, selectedContinent],
  );

  // Pair countries into rows of 2
  const gridRows = useMemo(() => {
    const rows: Country[][] = [];
    for (let i = 0; i < filteredCountries.length; i += 2) {
      rows.push(filteredCountries.slice(i, i + 2));
    }
    return rows;
  }, [filteredCountries]);

  const headerActions = <AvatarButton />;

  // Loading
  if (isLoading && countries.length === 0) {
    return (
      <AppScreen>
        <NavigationHeader title="Discover" rightActions={headerActions} />
        <LoadingScreen />
      </AppScreen>
    );
  }

  // Error
  if (error && countries.length === 0) {
    return (
      <AppScreen>
        <NavigationHeader title="Discover" rightActions={headerActions} />
        <ErrorScreen message="Something went wrong" onRetry={refresh} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <NavigationHeader title="Discover" rightActions={headerActions} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} />
        }
      >
        {/* Search trigger */}
        <View style={styles.searchWrap}>
          <SearchTrigger
            onPress={() => router.push('/(tabs)/discover/search')}
          />
        </View>

        {/* Editorial hero */}
        {featuredCountry && (
          <View style={styles.heroWrap}>
            <EditorialHero country={featuredCountry} />
          </View>
        )}

        {/* Continent filter */}
        {continents.length > 0 && (
          <View style={styles.filterWrap}>
            <ContinentFilter
              continents={continents}
              selected={selectedContinent}
              onSelect={setSelectedContinent}
            />
          </View>
        )}

        {/* Country grid */}
        {filteredCountries.length > 0 ? (
          <View style={styles.gridWrap}>
            {gridRows.map((row, idx) => (
              <View key={idx} style={styles.gridRow}>
                {row.map((country) => (
                  <CountryShowcaseCard key={country.id} country={country} />
                ))}
                {row.length === 1 && <View style={styles.gridSpacer} />}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>
              No countries yet
            </Text>
          </View>
        )}
      </ScrollView>
    </AppScreen>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: FLOATING_TAB_BAR_HEIGHT + spacing.xl,
  },

  // Search
  searchWrap: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    height: 48,
    gap: spacing.sm,
  },
  searchText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },

  // Hero
  heroWrap: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.moduleInset,
  },

  // Filter
  filterWrap: {
    marginTop: spacing.moduleInset,
  },

  // Grid
  gridWrap: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.moduleInset,
    gap: spacing.lg,
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  gridSpacer: {
    flex: 1,
  },

  // Empty
  emptyWrap: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.xxxxl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
});
```

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|constants/)' | head -20`
Expected: No new errors in app/(tabs)/discover/index.tsx

**Step 3: Visual verification**

Run: `npx expo start` and verify on device/simulator:
- Search trigger visible at top
- Editorial hero shows featured country with gradient + pill + name
- Continent filter scrolls horizontally
- Country grid shows 2-column layout
- Tapping continent filters countries
- Tapping "All" shows all countries
- Tapping any card navigates to country detail
- Pull-to-refresh works
- Empty state shows when filter has no results

**Step 4: Commit**

```bash
git add app/(tabs)/discover/index.tsx
git commit -m "feat(explore): rewrite Discover as editorial surface — hero, filter, country grid"
```

---

## Task 7: Final TypeScript Verification & Cleanup

**Files:**
- Verify: all modified/created files

**Step 1: Full TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|constants/)' | head -30`
Expected: Zero errors in any files we touched

**Step 2: Verify no unused imports**

Check that the old imports removed from `index.tsx` don't leave orphaned files. The following are no longer imported by the Discover screen but may be used elsewhere — do NOT delete:
- `components/explore/SectionHeader.tsx` — may be used by other screens
- `data/discover/useDiscoverData.ts` — may be used by other screens
- `data/explore/useFeedItems.ts` — may be used by other screens
- `components/explore/IntentHero.tsx` — may be used by Home tab

Only delete files if they have zero imports across the entire codebase.

**Step 3: Commit if any cleanup was needed**

```bash
git commit -m "chore: remove unused explore imports"
```

---

## Summary

| Task | Description | New/Modify | Files |
|------|-------------|-----------|-------|
| 1 | Design tokens | Modify | `constants/design.ts` |
| 2 | Data hook | Create | `data/discover/useExploreData.ts` |
| 3 | Editorial hero | Create | `components/explore/EditorialHero.tsx` |
| 4 | Continent filter | Create | `components/explore/ContinentFilter.tsx` |
| 5 | Country card | Create | `components/explore/CountryShowcaseCard.tsx` |
| 6 | Screen rewrite | Modify | `app/(tabs)/discover/index.tsx` |
| 7 | Verification | — | All above |

**Total new files:** 4
**Total modified files:** 2
**Estimated commits:** 6-7
**Data model changes:** None (continent column + types already exist)
**Supabase queries:** 1 (getCountries — already exists)
