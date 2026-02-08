# Explore Above-the-Fold Pillars Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the Explore screen's above-the-fold layout so a new user instantly understands Sola's three core pillars — Guides, Travelers, Community — with search at the very top.

**Architecture:** Replace the current hero-grid-first layout with: SearchBar → PillarsRow → one editorial collection → existing feed. The feed builder (`feedBuilder.ts`) gets a new layout that emits `search-bar`, `pillars-row`, `featured-collection`, then the rest of the existing feed minus hero-grid. The PillarsRow is a new static component with three tiles linking to existing tab routes. No new data fetching required for pillars; one collection is fetched from the existing collections system.

**Tech Stack:** React Native, Expo Router, TypeScript, existing design system (`constants/design.ts`)

---

## Why This Hierarchy Works

**Search at the top:** Search is the most universal entry point. A new user's first instinct is "I want to go to X" — placing search at the top immediately validates that this app can help. It also signals comprehensiveness: this app knows about destinations, people, and discussions. Burying it mid-feed (current design) makes it feel like an afterthought.

**Pillars before content:** Content is meaningless without orientation. If the first screen is a collection card, the user thinks "pretty travel app" but doesn't know what else exists. Three clear tiles answer "What can I do here?" before any content appears. This is the difference between a magazine (browse and hope) and a tool (understand and act).

**Why this reduces confusion:** The current feed leads with a hero-grid (collection + cities) which signals "this is a destination browser." It doesn't surface Travelers or Community at all above the fold — those are buried in the tab bar. A first-time user may never discover them. The pillars row makes all three capabilities equally visible at the same hierarchy level, and the tab bar reinforces rather than introduces.

**Calm, not cluttered:** SearchBar (~60px) + PillarsRow (~110px) + one collection card (~240px) = ~410px total above the fold. This fits comfortably on any device while leaving room for the collection card to peek below. No noise, no badges, no engagement farming.

---

## Current Feed Layout (What Changes)

**Before:**
1. Hero grid (collection + 2 city cards) ← **REMOVED from above-fold**
2. Search bar ← **MOVED to position 1**
3. City pair "POPULAR WITH SOLO WOMEN"
4. Interleaved spotlights + collections
5. Quick actions row
6. Meet travellers card
7. End card

**After:**
1. **Search bar** (moved to top)
2. **Pillars row** (NEW — Guides / Travelers / Community)
3. **Featured collection** (ONE editorial collection, data-driven)
4. City pair "POPULAR WITH SOLO WOMEN" (existing)
5. Interleaved spotlights + collections (existing, hero-grid cities redistributed)
6. Quick actions row (existing)
7. Meet travellers card (existing)
8. End card (existing)

---

## Files Overview

| Action | File | Purpose |
|--------|------|---------|
| Create | `components/explore/PillarsRow.tsx` | Three-tile navigation row |
| Modify | `data/explore/types.ts` | Add `pillars-row` and `featured-collection` feed item types |
| Modify | `data/explore/feedBuilder.ts` | New above-the-fold layout logic |
| Modify | `app/(tabs)/explore/index.tsx` | Render new feed item types |
| Modify | `data/explore/useFeedItems.ts` | Pass first collection separately to builder |

---

### Task 1: Add New Feed Item Types

**Files:**
- Modify: `data/explore/types.ts:14-26`

**Step 1: Add the new feed item type variants**

In `data/explore/types.ts`, add `pillars-row` and `featured-collection` to the `FeedItem` union type.

```typescript
// data/explore/types.ts
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
  | { type: 'search-bar' }
  | { type: 'pillars-row' }
  | { type: 'featured-collection'; data: ExploreCollectionWithItems }
  | { type: 'hero-grid'; data: { collection: ExploreCollectionWithItems | null; city1: CityWithCountry; city2: CityWithCountry | null } }
  | { type: 'editorial-collection'; data: ExploreCollectionWithItems }
  | { type: 'discovery-lenses'; data: DiscoveryLens[] }
  | { type: 'quick-actions' }
  | { type: 'city-pair'; data: [CityWithCountry, CityWithCountry]; sectionLabel?: string }
  | { type: 'city-spotlight'; data: CityWithCountry; activities: ActivityWithCity[] }
  | { type: 'activity-cluster'; data: ActivityWithCity[]; cityName: string; citySlug: string }
  | { type: 'meet-travellers' }
  | { type: 'end-card' };

export type FeedItemType = FeedItem['type'];
```

**Step 2: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | grep -E '(data/explore/types)' | head -5`
Expected: No errors from this file (pre-existing errors from other files are fine).

**Step 3: Commit**

```bash
git add data/explore/types.ts
git commit -m "feat(explore): add pillars-row and featured-collection feed item types"
```

---

### Task 2: Create PillarsRow Component

**Files:**
- Create: `components/explore/PillarsRow.tsx`

**Step 1: Create the PillarsRow component**

This is a horizontal row of three equal-width tiles. Each tile has a title and one-line helper text. Tapping navigates to the corresponding tab. Uses the design system colors, fonts, spacing. No icons — just clean typography on soft rectangular cards.

```typescript
// components/explore/PillarsRow.tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius } from '@/constants/design';

const PILLARS = [
  {
    title: 'Guides',
    helper: 'Places & planning',
    route: '/(tabs)/explore/all-destinations' as const,
  },
  {
    title: 'Travelers',
    helper: 'Meet women nearby',
    route: '/(tabs)/home' as const,
  },
  {
    title: 'Community',
    helper: 'Ask & learn',
    route: '/(tabs)/community' as const,
  },
] as const;

export function PillarsRow() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {PILLARS.map((pillar) => (
        <Pressable
          key={pillar.title}
          style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
          onPress={() => router.push(pillar.route)}
          accessibilityRole="button"
          accessibilityLabel={`${pillar.title}: ${pillar.helper}`}
        >
          <Text style={styles.title}>{pillar.title}</Text>
          <Text style={styles.helper}>{pillar.helper}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tile: {
    flex: 1,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  helper: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
```

**Step 2: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | grep -E '(components/explore/PillarsRow)' | head -5`
Expected: No errors.

**Step 3: Commit**

```bash
git add components/explore/PillarsRow.tsx
git commit -m "feat(explore): add PillarsRow component with three pillar tiles"
```

---

### Task 3: Update Feed Builder for New Layout

**Files:**
- Modify: `data/explore/feedBuilder.ts`

The key change: instead of leading with `hero-grid`, the feed now leads with `search-bar` → `pillars-row` → one `featured-collection` → then the rest. The hero-grid is removed. Cities that were consumed by the hero-grid (2 cities) are now available for the regular feed, meaning we get one extra city pair or spotlight.

**Step 1: Rewrite buildFeed with new above-the-fold layout**

```typescript
// data/explore/feedBuilder.ts
import type { ExploreCollectionWithItems, DiscoveryLens } from '../types';
import type {
  FeedItem,
  CityWithCountry,
} from './types';

/**
 * Build the Explore feed with pillars-first, women-first structure.
 *
 * Layout:
 *   1. Search bar (always first — primary entry point)
 *   2. Pillars row (Guides / Travelers / Community)
 *   3. Featured collection (one editorial, data-driven)
 *   4. City pair — first pair gets "POPULAR WITH SOLO WOMEN" label
 *   5. Interleaved: spotlights, collections, city pairs (no label)
 *   6. Remaining collections
 *   7. Remaining city spotlights
 *   8. Quick actions
 *   9. Meet travellers
 *   10. End card
 *
 * Max 4 city pairs shown. Rest as spotlights.
 */
export function buildFeed(
  collections: ExploreCollectionWithItems[],
  cities: CityWithCountry[],
  _lenses: DiscoveryLens[] = [],
): FeedItem[] {
  const feed: FeedItem[] = [];
  let ci = 0; // collection index
  let si = 0; // city index
  const MAX_CITY_PAIRS = 4;
  let pairsShown = 0;

  // --- Search bar (always first) ---
  feed.push({ type: 'search-bar' });

  // --- Pillars row (static orientation) ---
  feed.push({ type: 'pillars-row' });

  // --- Featured collection (one editorial above the fold) ---
  if (ci < collections.length) {
    feed.push({ type: 'featured-collection', data: collections[ci++] });
  }

  // --- First city pair with women-first label ---
  if (si + 1 < cities.length && pairsShown < MAX_CITY_PAIRS) {
    feed.push({
      type: 'city-pair',
      data: [cities[si], cities[si + 1]],
      sectionLabel: 'POPULAR WITH SOLO WOMEN',
    });
    si += 2;
    pairsShown++;
  }

  // --- Interleave: spotlight, collection, city pair ---
  while (
    pairsShown < MAX_CITY_PAIRS &&
    (ci < collections.length || si + 1 < cities.length)
  ) {
    // City spotlight
    if (si < cities.length) {
      feed.push({ type: 'city-spotlight', data: cities[si++], activities: [] });
    }

    // Editorial collection (sponsorship slot)
    if (ci < collections.length) {
      feed.push({ type: 'editorial-collection', data: collections[ci++] });
    }

    // City pair (no label after first)
    if (si + 1 < cities.length && pairsShown < MAX_CITY_PAIRS) {
      feed.push({
        type: 'city-pair',
        data: [cities[si], cities[si + 1]],
      });
      si += 2;
      pairsShown++;
    }
  }

  // --- Remaining editorial collections ---
  while (ci < collections.length) {
    feed.push({ type: 'editorial-collection', data: collections[ci++] });
  }

  // --- Remaining city spotlights ---
  while (si < cities.length) {
    feed.push({ type: 'city-spotlight', data: cities[si++], activities: [] });
  }

  // --- Quick actions (bottom) ---
  feed.push({ type: 'quick-actions' });

  // --- Meet travellers ---
  feed.push({ type: 'meet-travellers' });

  // --- End card ---
  feed.push({ type: 'end-card' });

  return feed;
}
```

**Step 2: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | grep -E '(data/explore/feedBuilder)' | head -5`
Expected: No errors.

**Step 3: Commit**

```bash
git add data/explore/feedBuilder.ts
git commit -m "feat(explore): restructure feed builder with search-first, pillars-second layout"
```

---

### Task 4: Render New Feed Items in Explore Screen

**Files:**
- Modify: `app/(tabs)/explore/index.tsx`

Add rendering for `pillars-row` and `featured-collection` in the `renderItem` switch. Also add key extraction for them. The `hero-grid` case stays for backwards compatibility but won't be emitted by the new feed builder. Import `PillarsRow` and `EditorialCollectionCard` (already imported).

**Step 1: Add PillarsRow import and render cases**

At the top of `app/(tabs)/explore/index.tsx`, add the import:

```typescript
import { PillarsRow } from '@/components/explore/PillarsRow';
```

**Step 2: Add render cases in the `renderItem` switch**

Inside the `renderItem` function, after the `search-bar` case and before the `hero-grid` case, add:

```typescript
      case 'pillars-row':
        return <PillarsRow />;

      case 'featured-collection':
        return (
          <EditorialCollectionCard
            collection={item.data}
            onPress={() => router.push(`/explore/collection/${item.data.slug}`)}
          />
        );
```

**Step 3: Add key extraction cases**

In the `keyExtractor` function, add:

```typescript
      case 'pillars-row':
        return 'pillars-row';
      case 'featured-collection':
        return `featured-${item.data.slug}`;
```

**Step 4: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | grep -E '(app/.*explore/index)' | head -5`
Expected: No errors.

**Step 5: Commit**

```bash
git add app/(tabs)/explore/index.tsx
git commit -m "feat(explore): render pillars row and featured collection in explore feed"
```

---

### Task 5: Update SearchBar Subtitle Text

**Files:**
- Modify: `components/explore/SearchBar.tsx:22`

The search bar subtitle should reflect that search spans all three pillars, not just destinations.

**Step 1: Update subtitle text**

Change line 22 from:
```typescript
        <Text style={styles.subtitle}>Destinations · Stays · Experiences</Text>
```
To:
```typescript
        <Text style={styles.subtitle}>Guides · Travelers · Discussions</Text>
```

**Step 2: Commit**

```bash
git add components/explore/SearchBar.tsx
git commit -m "feat(explore): update search bar subtitle to reflect three pillars"
```

---

### Task 6: Add Horizontal Padding to Feed Items

**Files:**
- Modify: `app/(tabs)/explore/index.tsx`

Currently the search bar and some items handle their own padding. The new `pillars-row` and `featured-collection` need horizontal padding from the feed container to match the existing `screenX` (24px) pattern used by other feed items like city pairs and spotlights.

Looking at the current code, `search-bar`, `city-pair`, and `city-spotlight` items are rendered without wrapper padding — the individual components handle it or the parent `content` style does. We need to ensure consistent horizontal margins.

**Step 1: Wrap `pillars-row` and `featured-collection` renders in padding View**

Update the render cases to include horizontal padding:

For `pillars-row`:
```typescript
      case 'pillars-row':
        return (
          <View style={{ paddingHorizontal: spacing.screenX }}>
            <PillarsRow />
          </View>
        );
```

For `featured-collection`:
```typescript
      case 'featured-collection':
        return (
          <View style={{ paddingHorizontal: spacing.screenX }}>
            <EditorialCollectionCard
              collection={item.data}
              onPress={() => router.push(`/explore/collection/${item.data.slug}`)}
            />
          </View>
        );
```

**Step 2: Verify alignment matches existing items visually**

Run the app: `npx expo start`

Check that:
- Search bar, pillars row, featured collection, and city pairs all align with 24px left/right margins
- No horizontal overflow or misalignment

**Step 3: Commit**

```bash
git add app/(tabs)/explore/index.tsx
git commit -m "feat(explore): add consistent horizontal padding to new feed items"
```

---

### Task 7: Visual QA and Polish

**Files:**
- Possibly modify: `components/explore/PillarsRow.tsx`, `app/(tabs)/explore/index.tsx`

**Step 1: Run the app and verify above-the-fold layout**

Run: `npx expo start`

Check these criteria on-device or simulator:
1. Search bar is the very first element below the header
2. Pillars row is directly below search, three equal tiles
3. One editorial collection card appears below pillars
4. City pair "POPULAR WITH SOLO WOMEN" appears next
5. Rest of the feed continues below
6. No hero-grid appears (removed from above-fold)
7. All cities (12) are still present in the feed (none consumed by hero-grid)
8. Tapping "Guides" tile navigates to all-destinations
9. Tapping "Travelers" tile switches to Travelers tab
10. Tapping "Community" tile switches to Community tab
11. Tapping search bar opens search screen
12. Tapping featured collection opens collection detail

**Step 2: Verify gap/spacing between items is consistent**

The FlatList `contentContainerStyle` has `gap: spacing.xl` (24px). This should create even spacing between search bar, pillars, collection, and city pair. If anything looks too tight or too loose, adjust in the FlatList styles.

**Step 3: Commit any polish fixes**

```bash
git add -A
git commit -m "fix(explore): visual polish for above-the-fold pillars layout"
```

---

### Task 8: Final Type Check and Cleanup

**Files:**
- All modified files

**Step 1: Run full type check**

Run: `npx tsc --noEmit --pretty 2>&1 | grep -E '(app/|components/|data/)' | grep -v 'scripts/content' | grep -v 'supabase/functions' | head -20`

Expected: No new errors from our changed files.

**Step 2: Verify HeroGrid import is still valid**

The `HeroGrid` component and its import in `app/(tabs)/explore/index.tsx` can stay — the feed builder simply won't emit `hero-grid` items anymore. No dead code removal needed now (YAGNI — we may want it back later).

**Step 3: Final commit if any cleanup needed**

```bash
git add -A
git commit -m "chore(explore): type check cleanup for pillars layout"
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `data/explore/types.ts` | +2 feed item types: `pillars-row`, `featured-collection` |
| `components/explore/PillarsRow.tsx` | New component: three equal tiles linking to pillar routes |
| `data/explore/feedBuilder.ts` | New layout: search → pillars → 1 collection → cities/rest |
| `app/(tabs)/explore/index.tsx` | Render new feed items, import PillarsRow |
| `components/explore/SearchBar.tsx` | Subtitle text update to "Guides · Travelers · Discussions" |

**What is NOT changed:**
- Tab bar structure (still has all tabs)
- Community or Travelers screens (untouched)
- Search screen functionality (untouched)
- Collection detail pages (untouched)
- Data fetching logic in `useFeedItems.ts` (same queries, same data)
- Any backend/Supabase queries
