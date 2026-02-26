# Trips Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Trips tab from a demo-driven experience into an intelligent, unified planning companion with wishlist saving, smart auto-fill itinerary building, and seamless Discover integration.

**Architecture:** Wishlist DB table + API layer provides save-from-anywhere. Streamlined trip creation (2 steps, date-inferred status). Auto-fill engine distributes saved places across days intelligently. Trip detail becomes a command center with planning board → day-by-day view transition. Discover integration via BookmarkButton and TripContextPill.

**Tech Stack:** React Native, Expo Router, Supabase (Postgres + RLS), React Query via `useData()` hook, StyleSheet with design tokens from `constants/design.ts`.

---

## Phase 1: Foundation — Wishlist & Streamlined Creation

### Task 1: Create Wishlists Database Table

**Files:**
- Create: `supabase/migrations/20260225_wishlist_schema.sql`

**Step 1: Write the migration**

```sql
-- Wishlist: save cities, countries, and places for future travel
CREATE TABLE IF NOT EXISTS wishlists (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('city', 'country', 'place')),
  entity_id   text NOT NULL,
  notes       text,
  saved_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, entity_type, entity_id)
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist"
  ON wishlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist items"
  ON wishlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items"
  ON wishlists FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_wishlists_user ON wishlists (user_id);
CREATE INDEX idx_wishlists_user_entity ON wishlists (user_id, entity_type, entity_id);
```

**Step 2: Apply the migration**

```bash
PSQL=/opt/homebrew/Cellar/libpq/18.2/bin/psql
source .env
DB_URL="postgresql://postgres.bfyewxgdfkmkviajmfzp:${SUPABASE_DB_PASSWORD}@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
$PSQL "$DB_URL" -f supabase/migrations/20260225_wishlist_schema.sql
```

Expected: `CREATE TABLE`, `ALTER TABLE`, `CREATE POLICY` (×3), `CREATE INDEX` (×2) — all succeed.

**Step 3: Commit**

```bash
git add supabase/migrations/20260225_wishlist_schema.sql
git commit -m "feat(trips): add wishlists table for destination saving"
```

---

### Task 2: Wishlist API Layer

**Files:**
- Create: `data/wishlist/wishlistApi.ts`
- Create: `data/wishlist/types.ts`

**Step 1: Create wishlist types**

Create `data/wishlist/types.ts`:

```typescript
export type WishlistEntityType = 'city' | 'country' | 'place';

export interface WishlistItem {
  id: string;
  userId: string;
  entityType: WishlistEntityType;
  entityId: string;
  notes: string | null;
  savedAt: string;
}

/** Enriched wishlist item with display data (joined from cities/countries/places). */
export interface WishlistItemWithData extends WishlistItem {
  name: string;
  imageUrl: string | null;
  countryIso2: string | null;
  slug: string | null;
}
```

**Step 2: Create wishlist API**

Create `data/wishlist/wishlistApi.ts`:

```typescript
import { supabase } from '@/lib/supabase';
import { toCamel, rowsToCamel } from '@/data/api';
import type { WishlistItem, WishlistItemWithData, WishlistEntityType } from './types';

export async function getWishlistItems(userId: string): Promise<WishlistItemWithData[]> {
  const { data, error } = await supabase
    .from('wishlists')
    .select('*')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const items = rowsToCamel<WishlistItem>(data);

  // Enrich each item with display data
  const enriched: WishlistItemWithData[] = [];

  // Group by entity type for batch queries
  const cityIds = items.filter(i => i.entityType === 'city').map(i => i.entityId);
  const countryIds = items.filter(i => i.entityType === 'country').map(i => i.entityId);
  const placeIds = items.filter(i => i.entityType === 'place').map(i => i.entityId);

  // Batch fetch cities
  const cityMap = new Map<string, { name: string; heroImageUrl: string | null; countryIso2: string; slug: string }>();
  if (cityIds.length > 0) {
    const { data: cities } = await supabase
      .from('cities')
      .select('id, name, hero_image_url, country_iso2, slug')
      .in('id', cityIds);
    if (cities) {
      for (const c of cities) {
        cityMap.set(c.id, { name: c.name, heroImageUrl: c.hero_image_url, countryIso2: c.country_iso2, slug: c.slug });
      }
    }
  }

  // Batch fetch countries
  const countryMap = new Map<string, { name: string; imageUrl: string | null; iso2: string; slug: string }>();
  if (countryIds.length > 0) {
    const { data: countries } = await supabase
      .from('countries')
      .select('iso2, name, image_url, slug')
      .in('iso2', countryIds);
    if (countries) {
      for (const c of countries) {
        countryMap.set(c.iso2, { name: c.name, imageUrl: c.image_url, iso2: c.iso2, slug: c.slug });
      }
    }
  }

  // Batch fetch places
  const placeMap = new Map<string, { name: string; imageUrl: string | null; countryIso2: string | null; slug: string }>();
  if (placeIds.length > 0) {
    const { data: places } = await supabase
      .from('places')
      .select('id, name, image_url_cached, slug, cities!inner(country_iso2)')
      .in('id', placeIds);
    if (places) {
      for (const p of places) {
        const countryIso2 = (p.cities as any)?.country_iso2 ?? null;
        placeMap.set(p.id, { name: p.name, imageUrl: p.image_url_cached, countryIso2, slug: p.slug });
      }
    }
  }

  // Assemble enriched items
  for (const item of items) {
    let name = '';
    let imageUrl: string | null = null;
    let countryIso2: string | null = null;
    let slug: string | null = null;

    if (item.entityType === 'city') {
      const city = cityMap.get(item.entityId);
      if (!city) continue; // City deleted, skip
      name = city.name;
      imageUrl = city.heroImageUrl;
      countryIso2 = city.countryIso2;
      slug = city.slug;
    } else if (item.entityType === 'country') {
      const country = countryMap.get(item.entityId);
      if (!country) continue;
      name = country.name;
      imageUrl = country.imageUrl;
      countryIso2 = country.iso2;
      slug = country.slug;
    } else if (item.entityType === 'place') {
      const place = placeMap.get(item.entityId);
      if (!place) continue;
      name = place.name;
      imageUrl = place.imageUrl;
      countryIso2 = place.countryIso2;
      slug = place.slug;
    }

    enriched.push({ ...item, name, imageUrl, countryIso2, slug });
  }

  return enriched;
}

export async function addToWishlist(
  userId: string,
  entityType: WishlistEntityType,
  entityId: string,
): Promise<void> {
  const { error } = await supabase
    .from('wishlists')
    .upsert(
      { user_id: userId, entity_type: entityType, entity_id: entityId },
      { onConflict: 'user_id,entity_type,entity_id' }
    );
  if (error) throw error;
}

export async function removeFromWishlist(
  userId: string,
  entityType: WishlistEntityType,
  entityId: string,
): Promise<void> {
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);
  if (error) throw error;
}

export async function isWishlisted(
  userId: string,
  entityType: WishlistEntityType,
  entityId: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from('wishlists')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);
  if (error) throw error;
  return (count ?? 0) > 0;
}

/** Get all wishlisted places for a specific city (for trip conversion). */
export async function getWishlistPlacesForCity(
  userId: string,
  cityId: string,
): Promise<string[]> {
  // Get places in this city that are wishlisted
  const { data: cityPlaces } = await supabase
    .from('places')
    .select('id')
    .eq('city_id', cityId)
    .eq('is_active', true);

  if (!cityPlaces || cityPlaces.length === 0) return [];

  const placeIds = cityPlaces.map(p => p.id);

  const { data: wishlisted } = await supabase
    .from('wishlists')
    .select('entity_id')
    .eq('user_id', userId)
    .eq('entity_type', 'place')
    .in('entity_id', placeIds);

  return wishlisted?.map(w => w.entity_id) ?? [];
}
```

**Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(data/wishlist/)' | head -20
```

Expected: No errors from `data/wishlist/`.

**Step 4: Commit**

```bash
git add data/wishlist/
git commit -m "feat(trips): add wishlist API layer and types"
```

---

### Task 3: Wishlist React Hook

**Files:**
- Create: `data/wishlist/useWishlist.ts`

**Step 1: Create the hook**

Create `data/wishlist/useWishlist.ts`:

```typescript
import { useCallback, useMemo } from 'react';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import {
  getWishlistItems,
  addToWishlist,
  removeFromWishlist,
  isWishlisted,
} from './wishlistApi';
import type { WishlistItemWithData, WishlistEntityType } from './types';

export function useWishlist() {
  const { userId } = useAuth();

  const { data, loading, error, refetch } = useData(
    () => (userId ? getWishlistItems(userId) : Promise.resolve([])),
    ['wishlist', userId],
  );

  const items: WishlistItemWithData[] = data ?? [];

  const cities = useMemo(() => items.filter(i => i.entityType === 'city'), [items]);
  const countries = useMemo(() => items.filter(i => i.entityType === 'country'), [items]);
  const places = useMemo(() => items.filter(i => i.entityType === 'place'), [items]);

  const add = useCallback(
    async (entityType: WishlistEntityType, entityId: string) => {
      if (!userId) return;
      await addToWishlist(userId, entityType, entityId);
      refetch();
    },
    [userId, refetch],
  );

  const remove = useCallback(
    async (entityType: WishlistEntityType, entityId: string) => {
      if (!userId) return;
      await removeFromWishlist(userId, entityType, entityId);
      refetch();
    },
    [userId, refetch],
  );

  return { items, cities, countries, places, loading, error, refetch, add, remove };
}

/** Check if a specific entity is wishlisted. Uses the full wishlist for efficient lookups. */
export function useIsWishlisted(entityType: WishlistEntityType, entityId: string): {
  wishlisted: boolean;
  toggle: () => Promise<void>;
  loading: boolean;
} {
  const { items, add, remove, loading } = useWishlist();

  const wishlisted = useMemo(
    () => items.some(i => i.entityType === entityType && i.entityId === entityId),
    [items, entityType, entityId],
  );

  const toggle = useCallback(async () => {
    if (wishlisted) {
      await remove(entityType, entityId);
    } else {
      await add(entityType, entityId);
    }
  }, [wishlisted, entityType, entityId, add, remove]);

  return { wishlisted, toggle, loading };
}
```

**Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(data/wishlist/)' | head -20
```

Expected: No errors.

**Step 3: Commit**

```bash
git add data/wishlist/useWishlist.ts
git commit -m "feat(trips): add useWishlist and useIsWishlisted hooks"
```

---

### Task 4: BookmarkButton Component

**Files:**
- Create: `components/ui/BookmarkButton.tsx`

**Step 1: Create the BookmarkButton**

This component renders a bookmark icon that toggles wishlist state. When the user has a matching trip, it shows a sheet with trip + wishlist options.

Create `components/ui/BookmarkButton.tsx`:

```typescript
import React, { useState } from 'react';
import {
  Pressable,
  View,
  Text,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, fonts } from '@/constants/design';
import { useIsWishlisted } from '@/data/wishlist/useWishlist';
import type { WishlistEntityType } from '@/data/wishlist/types';

interface BookmarkButtonProps {
  entityType: WishlistEntityType;
  entityId: string;
  size?: number;
  /** Optional style override for the wrapper */
  style?: object;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  entityType,
  entityId,
  size = 22,
  style,
}) => {
  const { wishlisted, toggle, loading } = useIsWishlisted(entityType, entityId);
  const [saving, setSaving] = useState(false);

  const handlePress = async () => {
    if (saving || loading) return;
    setSaving(true);
    try {
      await toggle();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={12}
      style={[styles.wrapper, style]}
      disabled={saving}
    >
      <Ionicons
        name={wishlisted ? 'bookmark' : 'bookmark-outline'}
        size={size}
        color={wishlisted ? colors.orange : colors.textSecondary}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    padding: spacing.xs,
  },
});
```

**Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(components/ui/BookmarkButton)' | head -10
```

Expected: No errors.

**Step 3: Commit**

```bash
git add components/ui/BookmarkButton.tsx
git commit -m "feat(trips): add BookmarkButton component for wishlist saving"
```

---

### Task 5: Streamline Trip Creation — Remove Kind Modal

**Files:**
- Modify: `app/(tabs)/trips/new.tsx`
- Modify: `data/trips/tripApi.ts`

**Step 1: Update `createTrip` to infer status from dates**

In `data/trips/tripApi.ts`, find the `createTrip` function. Replace the `statusFromKind` call with date-based inference. Add a helper function:

```typescript
/** Infer trip status from dates instead of TripKind. */
function inferStatusFromDates(stops: Array<{ startDate?: string; endDate?: string }>): string {
  const today = new Date().toISOString().slice(0, 10);

  // Find earliest start and latest end across all stops
  const starts = stops.map(s => s.startDate).filter(Boolean) as string[];
  const ends = stops.map(s => s.endDate).filter(Boolean) as string[];

  if (starts.length === 0 && ends.length === 0) return 'draft';

  const earliest = starts.length > 0 ? starts.sort()[0] : null;
  const latest = ends.length > 0 ? ends.sort().reverse()[0] : null;

  if (latest && latest < today) return 'completed';
  if (earliest && earliest <= today && (!latest || latest >= today)) return 'active';
  return 'planned';
}
```

Then in `createTrip`, replace the status logic to use `inferStatusFromDates(input.stops)` instead of `statusFromKind(input.tripKind, ...)`. Keep backward compatibility — if `tripKind` is provided and no dates, fall back to the old logic.

**Step 2: Simplify `new.tsx`**

Remove from `new.tsx`:
- The `showKindSheet` state and the bottom sheet Modal for trip kind selection
- The `TRIP_KINDS` array and `KIND_LABELS` constant
- The `handleSelectKind` function
- The `tripKind` state variable
- Remove `tripKind` from the validation check (`canCreate` should only require `stops.length > 0`)
- Remove the PostHog event for `create_trip_kind_selected`

Keep:
- Destination search (step 1)
- Date pickers with flexible toggle (step 2)
- Trip name (auto-generated from destinations)
- Create button

Change the page title from any current title to "New Trip".

Auto-generate trip name from stops:
```typescript
const autoName = useMemo(() => {
  if (stops.length === 0) return '';
  if (stops.length === 1) return stops[0].cityName ?? '';
  // Check if all stops are in same country
  const countries = Array.from(new Set(stops.map(s => s.countryIso2)));
  if (countries.length === 1) {
    return stops.map(s => s.cityName).filter(Boolean).join(' · ');
  }
  return stops.map(s => s.cityName ?? getFlag(s.countryIso2)).join(' · ');
}, [stops]);
```

Use `autoName` as placeholder in the trip name input. If user hasn't typed a name, use `autoName` when creating.

**Step 3: Update createTrip call**

In the `handleCreate` function, remove `tripKind` from the `CreateTripInput`. The status will be inferred server-side from dates.

**Step 4: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/\(tabs\)/trips/new|data/trips/tripApi)' | head -20
```

Expected: No errors.

**Step 5: Commit**

```bash
git add app/\(tabs\)/trips/new.tsx data/trips/tripApi.ts
git commit -m "feat(trips): streamline trip creation — remove kind modal, infer status from dates"
```

---

### Task 6: New Trips Empty State

**Files:**
- Create: `components/trips/TripsEmptyStateV2.tsx`
- Modify: `app/(tabs)/trips/index.tsx` — swap old empty state for new one

**Step 1: Create `TripsEmptyStateV2`**

This component shows "Where to next?" with popular city cards and a CTA.

Create `components/trips/TripsEmptyStateV2.tsx`:

```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { colors, spacing, radius, fonts } from '@/constants/design';
import { useData } from '@/hooks/useData';
import { getPopularCitiesWithCountry } from '@/data/api';
import { getFlag } from '@/data/trips/helpers';

interface TripsEmptyStateV2Props {
  onCreateTrip: () => void;
}

export const TripsEmptyStateV2: React.FC<TripsEmptyStateV2Props> = ({ onCreateTrip }) => {
  const { data: cities } = useData(
    () => getPopularCitiesWithCountry(6),
    ['popular-cities-trips'],
  );

  const displayCities = cities?.slice(0, 3) ?? [];

  return (
    <View style={styles.container}>
      <Text style={styles.headline}>Where to next?</Text>
      <Text style={styles.subheadline}>
        Save destinations, plan trips, and build day-by-day itineraries.
      </Text>

      <View style={styles.grid}>
        {displayCities.map((city) => (
          <Pressable
            key={city.id}
            style={({ pressed }) => [
              styles.cityCard,
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
            onPress={() => router.push(`/(tabs)/discover/place-detail/${city.id}`)}
          >
            <Image
              source={{ uri: city.heroImageUrl }}
              style={styles.cityImage}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.cityOverlay}>
              <Text style={styles.cityName}>
                {getFlag(city.countryIso2)} {city.name}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.createButton,
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
        ]}
        onPress={onCreateTrip}
      >
        <Text style={styles.createButtonText}>Plan a new trip</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          // Navigate to new trip with today's date hint
          onCreateTrip();
        }}
        hitSlop={12}
      >
        <Text style={styles.travelingLink}>Currently traveling? Log your trip</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xxxl,
  },
  headline: {
    fontFamily: fonts.semiBold,
    fontSize: 28,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subheadline: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  grid: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  cityCard: {
    height: 140,
    borderRadius: radius.cardLg,
    overflow: 'hidden',
  },
  cityImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cityOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  cityName: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  createButton: {
    backgroundColor: colors.orange,
    paddingVertical: spacing.lg,
    borderRadius: radius.button,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  createButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  travelingLink: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
```

**Step 2: Swap empty state in `app/(tabs)/trips/index.tsx`**

Replace the import of `TripEmptyState` with `TripsEmptyStateV2`. Replace the usage:

Old:
```tsx
<TripEmptyState onPress={() => router.push('/(tabs)/trips/new')} />
```

New:
```tsx
<TripsEmptyStateV2 onCreateTrip={() => router.push('/(tabs)/trips/new')} />
```

**Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(components/trips/TripsEmptyState|app/\(tabs\)/trips/index)' | head -10
```

**Step 4: Commit**

```bash
git add components/trips/TripsEmptyStateV2.tsx app/\(tabs\)/trips/index.tsx
git commit -m "feat(trips): replace demo empty state with inspiration-based TripsEmptyStateV2"
```

---

### Task 7: Wishlist Grid Components

**Files:**
- Create: `components/trips/WishlistCard.tsx`
- Create: `components/trips/WishlistGrid.tsx`

**Step 1: Create `WishlistCard`**

Create `components/trips/WishlistCard.tsx`:

```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { colors, spacing, radius, fonts } from '@/constants/design';
import { getFlag } from '@/data/trips/helpers';
import type { WishlistItemWithData } from '@/data/wishlist/types';

interface WishlistCardProps {
  item: WishlistItemWithData;
  onPlanTrip: (item: WishlistItemWithData) => void;
  width: number;
}

export const WishlistCard: React.FC<WishlistCardProps> = ({ item, onPlanTrip, width }) => {
  const handlePress = () => {
    if (item.entityType === 'city' && item.slug) {
      router.push(`/(tabs)/discover/place-detail/${item.entityId}`);
    } else if (item.entityType === 'country' && item.slug) {
      router.push(`/(tabs)/discover/place-detail/${item.entityId}`);
    }
  };

  return (
    <View style={[styles.card, { width }]}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.imageWrapper,
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
        ]}
      >
        <Image
          source={{ uri: item.imageUrl ?? undefined }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      </Pressable>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.countryIso2 ? getFlag(item.countryIso2) + ' ' : ''}
          {item.name}
        </Text>
        <Pressable onPress={() => onPlanTrip(item)} hitSlop={8}>
          <Text style={styles.planAction}>Plan a trip</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  imageWrapper: {
    height: 120,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  info: {
    paddingTop: spacing.sm,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  planAction: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
});
```

**Step 2: Create `WishlistGrid`**

Create `components/trips/WishlistGrid.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, fonts } from '@/constants/design';
import { useWishlist } from '@/data/wishlist/useWishlist';
import { WishlistCard } from './WishlistCard';
import type { WishlistItemWithData } from '@/data/wishlist/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.screenX * 2 - GRID_GAP) / 2;

export const WishlistGrid: React.FC = () => {
  const { items, loading } = useWishlist();

  // Only show cities and countries in the grid (places show inside trips)
  const destinations = items.filter(i => i.entityType === 'city' || i.entityType === 'country');

  if (loading || destinations.length === 0) return null;

  const handlePlanTrip = (item: WishlistItemWithData) => {
    // Navigate to trip creation with destination pre-filled
    // Pass entity info as query params
    router.push({
      pathname: '/(tabs)/trips/new',
      params: {
        prefillType: item.entityType,
        prefillId: item.entityId,
        prefillName: item.name,
        prefillCountry: item.countryIso2 ?? '',
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>PLACES I WANT TO GO</Text>

      <View style={styles.grid}>
        {destinations.map((item) => (
          <WishlistCard
            key={item.id}
            item={item}
            onPlanTrip={handlePlanTrip}
            width={CARD_WIDTH}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
});
```

**Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(components/trips/Wishlist)' | head -10
```

**Step 4: Commit**

```bash
git add components/trips/WishlistCard.tsx components/trips/WishlistGrid.tsx
git commit -m "feat(trips): add WishlistCard and WishlistGrid components"
```

---

### Task 8: Unified Trips Tab — Integrate Wishlist

**Files:**
- Modify: `app/(tabs)/trips/index.tsx`

**Step 1: Restructure the Trips tab**

The Trips tab becomes a single `ScrollView` with sections:

1. Active trip hero (if exists) — using existing `CurrentTripCard`
2. Upcoming trips — using existing `TripListCard`
3. Wishlist grid — using new `WishlistGrid`
4. Past trips (collapsible) — using existing `TripListCard`
5. Bottom CTA — "Plan a new trip" button

Import `WishlistGrid` and add it between upcoming and past sections.

Key changes to `app/(tabs)/trips/index.tsx`:
- Add `import { WishlistGrid } from '@/components/trips/WishlistGrid';`
- In the main ScrollView/FlatList, insert `<WishlistGrid />` after the upcoming section
- Keep the collapsible past trips section
- Keep the bottom "Plan a new trip" button

**Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/\(tabs\)/trips/index)' | head -10
```

**Step 3: Commit**

```bash
git add app/\(tabs\)/trips/index.tsx
git commit -m "feat(trips): add wishlist section to unified trips tab"
```

---

### Task 9: Remove Demo Trip

**Files:**
- Delete: `app/(tabs)/trips/demo.tsx`
- Delete: `components/trips/TripEmptyState.tsx`

**Step 1: Check for references to demo.tsx**

Search the codebase for any imports or routes to `demo` or `TripEmptyState`:

```bash
npx tsc --noEmit 2>&1 | grep -E '(demo|TripEmptyState)' | head -20
```

Also search for any navigation to the demo screen:

Use Grep to find: `demo` in `app/(tabs)/trips/` files and `TripEmptyState` across the codebase.

**Step 2: Remove the files**

```bash
rm app/\(tabs\)/trips/demo.tsx
rm components/trips/TripEmptyState.tsx
```

**Step 3: Remove any remaining imports or references**

Clean up any files that import `TripEmptyState` or navigate to `demo`.

**Step 4: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -20
```

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor(trips): remove demo trip screen and old empty state"
```

---

## Phase 2: Smart Planning — Auto-Fill & Day View

### Task 10: Auto-Fill Engine

**Files:**
- Create: `data/trips/autoFillEngine.ts`

**Step 1: Create the auto-fill engine**

This is a pure function that takes saved places + trip metadata and returns `CreateBlockInput[]` grouped by day.

Create `data/trips/autoFillEngine.ts`:

Key logic:
1. Classify places by time-of-day fit (morning/afternoon/evening types)
2. Cluster by `cityAreaId` proximity
3. Distribute across days respecting: type diversity (max 2 same type), pace (3-5 for balanced), time slots
4. Return `CreateBlockInput[]` per day

```typescript
import type { CreateBlockInput } from './itineraryTypes';

// Place data we need for auto-fill (subset of full Place)
export interface AutoFillPlace {
  id: string;
  name: string;
  placeType: string;
  cityAreaId: string | null;
  locationLat: number | null;
  locationLng: number | null;
  costEstimate: number | null;
}

// Time slot definitions by place type
const TIME_SLOTS: Record<string, { start: string; end: string }> = {
  cafe:        { start: '08:00:00', end: '09:30:00' },
  landmark:    { start: '09:30:00', end: '11:30:00' },
  temple:      { start: '09:30:00', end: '11:30:00' },
  museum:      { start: '10:00:00', end: '12:00:00' },
  gallery:     { start: '10:00:00', end: '12:00:00' },
  activity:    { start: '10:00:00', end: '12:00:00' },
  tour:        { start: '09:00:00', end: '12:00:00' },
  market:      { start: '14:00:00', end: '16:00:00' },
  wellness:    { start: '14:00:00', end: '16:00:00' },
  spa:         { start: '14:00:00', end: '16:00:00' },
  neighborhood:{ start: '14:00:00', end: '17:00:00' },
  restaurant:  { start: '19:00:00', end: '21:00:00' },
  bar:         { start: '20:00:00', end: '22:00:00' },
  rooftop:     { start: '17:00:00', end: '19:00:00' },
  club:        { start: '21:00:00', end: '23:00:00' },
  beach:       { start: '10:00:00', end: '15:00:00' },
};

// Pace targets (blocks per day)
const PACE_TARGETS: Record<string, { min: number; max: number }> = {
  relaxed:  { min: 2, max: 3 },
  balanced: { min: 3, max: 5 },
  packed:   { min: 5, max: 7 },
};

interface AutoFillResult {
  /** Blocks grouped by day index (0-based). */
  dayBlocks: Map<number, CreateBlockInput[]>;
  /** Places that couldn't fit in any day. */
  overflow: AutoFillPlace[];
}

export function buildAutoFillItinerary(
  places: AutoFillPlace[],
  dayCount: number,
  tripId: string,
  dayIds: string[],
  pace: 'relaxed' | 'balanced' | 'packed' = 'balanced',
): AutoFillResult {
  const target = PACE_TARGETS[pace];
  const dayBlocks = new Map<number, CreateBlockInput[]>();
  const overflow: AutoFillPlace[] = [];

  // Initialize day buckets
  for (let i = 0; i < dayCount; i++) {
    dayBlocks.set(i, []);
  }

  // Sort places by time-of-day: morning types first, then afternoon, then evening
  const timeOrder = (placeType: string): number => {
    const slot = TIME_SLOTS[placeType];
    if (!slot) return 12; // Default to midday
    return parseInt(slot.start.split(':')[0], 10);
  };

  const sorted = places.slice().sort((a, b) => timeOrder(a.placeType) - timeOrder(b.placeType));

  // Cluster by area (group places in same neighborhood)
  const areaGroups = new Map<string, AutoFillPlace[]>();
  const noArea: AutoFillPlace[] = [];

  for (const place of sorted) {
    if (place.cityAreaId) {
      const group = areaGroups.get(place.cityAreaId) ?? [];
      group.push(place);
      areaGroups.set(place.cityAreaId, group);
    } else {
      noArea.push(place);
    }
  }

  // Flatten: area clusters first (keep same-area places together), then ungrouped
  const ordered: AutoFillPlace[] = [];
  for (const group of Array.from(areaGroups.values())) {
    ordered.push(...group);
  }
  ordered.push(...noArea);

  // Distribute across days
  const typeCounts = new Map<number, Map<string, number>>(); // day -> type -> count

  for (const place of ordered) {
    let assigned = false;

    for (let dayIdx = 0; dayIdx < dayCount; dayIdx++) {
      const blocks = dayBlocks.get(dayIdx)!;
      if (blocks.length >= target.max) continue;

      // Type diversity: max 2 same type per day
      const dayTypes = typeCounts.get(dayIdx) ?? new Map<string, number>();
      const typeCount = dayTypes.get(place.placeType) ?? 0;
      if (typeCount >= 2) continue;

      // Get time slot
      const slot = TIME_SLOTS[place.placeType] ?? { start: '12:00:00', end: '14:00:00' };

      const block: CreateBlockInput = {
        tripId,
        tripDayId: dayIds[dayIdx],
        blockType: getBlockType(place.placeType),
        titleOverride: place.name,
        startTime: slot.start,
        endTime: slot.end,
        orderIndex: blocks.length,
        placeId: place.id,
        locationLat: place.locationLat ?? undefined,
        locationLng: place.locationLng ?? undefined,
        costEstimate: place.costEstimate ?? undefined,
      };

      blocks.push(block);
      dayTypes.set(place.placeType, typeCount + 1);
      typeCounts.set(dayIdx, dayTypes);
      assigned = true;
      break;
    }

    if (!assigned) {
      overflow.push(place);
    }
  }

  return { dayBlocks, overflow };
}

/** Map place_type to block_type. */
function getBlockType(placeType: string): 'place' | 'accommodation' | 'activity' | 'meal' {
  const MEAL_TYPES = ['restaurant', 'cafe', 'bar', 'rooftop'];
  const ACCOMMODATION_TYPES = ['hotel', 'hostel', 'homestay', 'guesthouse', 'resort', 'villa', 'airbnb'];
  const ACTIVITY_TYPES = ['activity', 'tour', 'wellness', 'spa'];

  if (MEAL_TYPES.includes(placeType)) return 'meal';
  if (ACCOMMODATION_TYPES.includes(placeType)) return 'accommodation';
  if (ACTIVITY_TYPES.includes(placeType)) return 'activity';
  return 'place';
}
```

**Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(data/trips/autoFillEngine)' | head -10
```

**Step 3: Commit**

```bash
git add data/trips/autoFillEngine.ts
git commit -m "feat(trips): add auto-fill itinerary engine"
```

---

### Task 11: Planning Board Component

**Files:**
- Create: `components/trips/SavedPlaceCard.tsx`
- Create: `components/trips/PlanningBoard.tsx`

**Step 1: Create `SavedPlaceCard`**

A rich card showing a saved place with photo, name, type pill, and remove action.

Create `components/trips/SavedPlaceCard.tsx`:

```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, fonts } from '@/constants/design';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.screenX * 2 - GRID_GAP) / 2;

interface SavedPlaceCardProps {
  name: string;
  placeType: string;
  imageUrl: string | null;
  onRemove: () => void;
  onPress: () => void;
}

export const SavedPlaceCard: React.FC<SavedPlaceCardProps> = ({
  name,
  placeType,
  imageUrl,
  onRemove,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={styles.imageWrapper}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="location-outline" size={24} color={colors.textMuted} />
          </View>
        )}
        <Pressable onPress={onRemove} style={styles.removeButton} hitSlop={8}>
          <Ionicons name="close-circle" size={20} color="rgba(0,0,0,0.6)" />
        </Pressable>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{name}</Text>
        <Text style={styles.type}>{placeType.toUpperCase()}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
  },
  imageWrapper: {
    height: 100,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
  info: {
    paddingTop: spacing.sm,
  },
  name: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  type: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
});
```

**Step 2: Create `PlanningBoard`**

Create `components/trips/PlanningBoard.tsx`:

```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, fonts } from '@/constants/design';
import { SavedPlaceCard } from './SavedPlaceCard';
import type { TripSavedItem } from '@/data/trips/types';

interface PlaceDisplay {
  id: string;
  entityId: string;
  name: string;
  placeType: string;
  imageUrl: string | null;
}

interface PlanningBoardProps {
  places: PlaceDisplay[];
  onRemovePlace: (entityId: string) => void;
  onPlacePress: (entityId: string) => void;
  onAddMore: () => void;
  onBuildItinerary: () => void;
  building: boolean;
}

export const PlanningBoard: React.FC<PlanningBoardProps> = ({
  places,
  onRemovePlace,
  onPlacePress,
  onAddMore,
  onBuildItinerary,
  building,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>SAVED PLACES</Text>
      <Text style={styles.subtitle}>
        {places.length} {places.length === 1 ? 'place' : 'places'} saved. Add more or build your itinerary.
      </Text>

      <View style={styles.grid}>
        {places.map((place) => (
          <SavedPlaceCard
            key={place.id}
            name={place.name}
            placeType={place.placeType}
            imageUrl={place.imageUrl}
            onRemove={() => onRemovePlace(place.entityId)}
            onPress={() => onPlacePress(place.entityId)}
          />
        ))}
      </View>

      <Pressable
        onPress={onAddMore}
        style={({ pressed }) => [
          styles.addMoreButton,
          pressed && { opacity: 0.9 },
        ]}
      >
        <Ionicons name="add" size={18} color={colors.orange} />
        <Text style={styles.addMoreText}>Add more places</Text>
      </Pressable>

      {places.length >= 2 && (
        <Pressable
          onPress={onBuildItinerary}
          disabled={building}
          style={({ pressed }) => [
            styles.buildButton,
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            building && { opacity: 0.5 },
          ]}
        >
          <Ionicons name="sparkles-outline" size={18} color="#FFFFFF" />
          <Text style={styles.buildButtonText}>
            {building ? 'Building...' : 'Build my itinerary'}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderStyle: 'dashed',
    borderRadius: radius.button,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  addMoreText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
  buildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.orange,
    paddingVertical: spacing.lg,
    borderRadius: radius.button,
  },
  buildButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
```

**Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(components/trips/(SavedPlaceCard|PlanningBoard))' | head -10
```

**Step 4: Commit**

```bash
git add components/trips/SavedPlaceCard.tsx components/trips/PlanningBoard.tsx
git commit -m "feat(trips): add PlanningBoard and SavedPlaceCard components"
```

---

### Task 12: Day Selector Component

**Files:**
- Create: `components/trips/DaySelector.tsx`

**Step 1: Create `DaySelector`**

Horizontal scrollable day pills. Active day highlighted in `orangeFill`.

Create `components/trips/DaySelector.tsx`:

```typescript
import React, { useRef, useEffect } from 'react';
import { FlatList, Pressable, Text, StyleSheet, View } from 'react-native';
import { colors, spacing, radius, fonts } from '@/constants/design';
import type { TripDay } from '@/data/trips/itineraryTypes';

interface DaySelectorProps {
  days: TripDay[];
  selectedDayId: string;
  onSelectDay: (dayId: string) => void;
  todayDayId?: string | null;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DaySelector: React.FC<DaySelectorProps> = ({
  days,
  selectedDayId,
  onSelectDay,
  todayDayId,
}) => {
  const listRef = useRef<FlatList>(null);

  // Auto-scroll to selected day
  useEffect(() => {
    const index = days.findIndex(d => d.id === selectedDayId);
    if (index >= 0 && listRef.current) {
      listRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.3 });
    }
  }, [selectedDayId, days]);

  const renderDay = ({ item }: { item: TripDay }) => {
    const isSelected = item.id === selectedDayId;
    const isToday = item.id === todayDayId;
    const dayLabel = `Day ${item.dayIndex + 1}`;
    const dateLabel = item.date
      ? DAYS_OF_WEEK[new Date(item.date + 'T12:00:00').getDay()]
      : '';

    return (
      <Pressable
        onPress={() => onSelectDay(item.id)}
        style={[
          styles.pill,
          isSelected && styles.pillSelected,
        ]}
      >
        <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
          {dayLabel}
        </Text>
        {dateLabel ? (
          <Text style={[styles.dateLabel, isSelected && styles.dateLabelSelected]}>
            {dateLabel}
          </Text>
        ) : null}
        {isToday && <View style={styles.todayDot} />}
      </Pressable>
    );
  };

  return (
    <FlatList
      ref={listRef}
      data={days}
      keyExtractor={(item) => item.id}
      renderItem={renderDay}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      onScrollToIndexFailed={() => {}}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  pillSelected: {
    backgroundColor: colors.orangeFill,
    borderColor: colors.orange,
  },
  dayLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  dayLabelSelected: {
    color: colors.orange,
  },
  dateLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  dateLabelSelected: {
    color: colors.orange,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.orange,
    marginTop: spacing.xs,
  },
});
```

**Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(components/trips/DaySelector)' | head -10
```

**Step 3: Commit**

```bash
git add components/trips/DaySelector.tsx
git commit -m "feat(trips): add DaySelector horizontal pill component"
```

---

### Task 13: Day Timeline Rich Card

**Files:**
- Create: `components/trips/DayTimelineCard.tsx`

**Step 1: Create `DayTimelineCard`**

Rich card for a single place in the day timeline. Shows photo thumbnail, name, type pill, area, time, cost.

Create `components/trips/DayTimelineCard.tsx`:

```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, fonts } from '@/constants/design';
import type { ItineraryBlockWithTags } from '@/data/trips/itineraryTypes';

const PHOTO_SIZE = 60;

interface DayTimelineCardProps {
  block: ItineraryBlockWithTags;
  onPress: () => void;
  isDone?: boolean;
  isCurrent?: boolean;
}

/** Format "HH:MM:SS" to "9:00 AM". */
function formatTimeSlot(time: string | null): string | null {
  if (!time) return null;
  const parts = time.split(':');
  const h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return m === '00' ? `${h12} ${ampm}` : `${h12}:${m} ${ampm}`;
}

export const DayTimelineCard: React.FC<DayTimelineCardProps> = ({
  block,
  onPress,
  isDone = false,
  isCurrent = false,
}) => {
  const name = block.titleOverride ?? block.place?.name ?? 'Untitled';
  const type = block.place?.placeType ?? block.blockType;
  const area = block.place?.address ?? null;
  const imageUrl = block.place?.imageUrlCached ?? null;
  const time = formatTimeSlot(block.startTime);
  const cost = block.costEstimate ? `~$${block.costEstimate}` : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isDone && styles.cardDone,
        isCurrent && styles.cardCurrent,
        pressed && { opacity: 0.9 },
      ]}
    >
      <View style={styles.photoWrapper}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.photo}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="location-outline" size={20} color={colors.textMuted} />
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={[styles.name, isDone && styles.nameDone]} numberOfLines={1}>
            {name}
          </Text>
          {isDone && <Ionicons name="checkmark-circle" size={16} color={colors.greenSoft} />}
        </View>

        <Text style={styles.typePill}>{type.toUpperCase()}</Text>

        {area && <Text style={styles.area} numberOfLines={1}>{area}</Text>}

        <View style={styles.metaRow}>
          {time && <Text style={styles.meta}>{time}</Text>}
          {time && cost && <Text style={styles.metaDot}>·</Text>}
          {cost && <Text style={styles.meta}>{cost}</Text>}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  cardDone: {
    opacity: 0.5,
  },
  cardCurrent: {
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,
  },
  photoWrapper: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
  },
  photoPlaceholder: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
  },
  nameDone: {
    textDecorationLine: 'line-through',
  },
  typePill: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  area: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  metaDot: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginHorizontal: spacing.xs,
  },
});
```

**Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(components/trips/DayTimelineCard)' | head -10
```

**Step 3: Commit**

```bash
git add components/trips/DayTimelineCard.tsx
git commit -m "feat(trips): add DayTimelineCard rich card component"
```

---

### Task 14: Category Filter Pills

**Files:**
- Create: `components/trips/CategoryFilterPills.tsx`

**Step 1: Create `CategoryFilterPills`**

Horizontal filter pills: All, Eat, See, Do, Stay, Nightlife, Wellness.

Create `components/trips/CategoryFilterPills.tsx`:

```typescript
import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, fonts } from '@/constants/design';

export type PlaceCategory = 'all' | 'eat' | 'see' | 'do' | 'stay' | 'nightlife' | 'wellness';

export const CATEGORY_PLACE_TYPES: Record<PlaceCategory, string[]> = {
  all: [],
  eat: ['restaurant', 'cafe', 'bar', 'rooftop'],
  see: ['landmark', 'temple', 'museum', 'gallery'],
  do: ['activity', 'tour', 'market', 'neighborhood'],
  stay: ['hotel', 'hostel', 'homestay', 'guesthouse', 'resort', 'villa', 'airbnb'],
  nightlife: ['bar', 'club', 'rooftop'],
  wellness: ['wellness', 'spa'],
};

const CATEGORIES: { key: PlaceCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'eat', label: 'Eat' },
  { key: 'see', label: 'See' },
  { key: 'do', label: 'Do' },
  { key: 'stay', label: 'Stay' },
  { key: 'nightlife', label: 'Nightlife' },
  { key: 'wellness', label: 'Wellness' },
];

interface CategoryFilterPillsProps {
  selected: PlaceCategory;
  onSelect: (category: PlaceCategory) => void;
}

export const CategoryFilterPills: React.FC<CategoryFilterPillsProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map(({ key, label }) => {
        const isActive = key === selected;
        return (
          <Pressable
            key={key}
            onPress={() => onSelect(key)}
            style={[
              styles.pill,
              isActive && styles.pillActive,
            ]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
    minHeight: 36,
    justifyContent: 'center',
  },
  pillActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  labelActive: {
    color: colors.orange,
  },
});
```

**Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(components/trips/CategoryFilterPills)' | head -10
```

**Step 3: Commit**

```bash
git add components/trips/CategoryFilterPills.tsx
git commit -m "feat(trips): add CategoryFilterPills for trip place search"
```

---

### Task 15: Smart Search Sheet

**Files:**
- Create: `components/trips/SmartSearchSheet.tsx`

**Step 1: Create `SmartSearchSheet`**

Bottom sheet with context-aware suggestions + category filters + search.

Create `components/trips/SmartSearchSheet.tsx`. This is a modal sheet that:
1. Accepts `cityId`, `dayBlocks` (current day's blocks), and callbacks
2. Analyzes what's missing from the day (morning/lunch/dinner/afternoon)
3. Shows suggestion rows at top
4. Shows category filter pills below
5. Shows place search results
6. Each result has a "+" add button

Key props:
```typescript
interface SmartSearchSheetProps {
  visible: boolean;
  onClose: () => void;
  cityId: string;
  tripId: string;
  dayId: string;
  existingBlockTypes: string[]; // block types already on this day
  insertAfterIndex: number;
  onPlaceAdded: () => void;
}
```

Uses `getPlacesByCategoryForCity()` from `data/city/cityApi.ts` or `getPlacesGroupedByTime()` from `data/api.ts` for fetching place data filtered by category.

Includes:
- Search input at top
- Context-aware suggestion row (reads `existingBlockTypes` to identify gaps)
- `CategoryFilterPills` for browsing
- Place result cards with photo, name, type, "+" button
- On "+" tap: calls `createBlock()` and triggers `onPlaceAdded()` callback

**Implementation guidance**: Model after the existing `AddStopSheet.tsx` for Modal + sheet patterns, but with the category filter and suggestion additions. Use `getPlacesByCategoryForCity(cityId, placeTypes)` for filtered results.

**Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(components/trips/SmartSearchSheet)' | head -10
```

**Step 3: Commit**

```bash
git add components/trips/SmartSearchSheet.tsx
git commit -m "feat(trips): add SmartSearchSheet with context-aware suggestions"
```

---

### Task 16: Wire Auto-Fill Into Trip Detail

**Files:**
- Modify: `app/(tabs)/trips/[id]/index.tsx`

**Step 1: Add planning board state**

In the trip detail screen, check if the trip has itinerary days built yet (`itinerary.days.length > 0`). If not, show the `PlanningBoard` component instead of the day list.

Add imports:
```typescript
import { PlanningBoard } from '@/components/trips/PlanningBoard';
import { DaySelector } from '@/components/trips/DaySelector';
import { DayTimelineCard } from '@/components/trips/DayTimelineCard';
import { buildAutoFillItinerary, AutoFillPlace } from '@/data/trips/autoFillEngine';
import { generateDaysFromTrip, createBlock } from '@/data/trips/itineraryApi';
```

Add state:
```typescript
const [building, setBuilding] = useState(false);
const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
```

Add the auto-fill handler:
```typescript
const handleBuildItinerary = async () => {
  if (!trip || building) return;
  setBuilding(true);
  try {
    // 1. Generate days if not yet created
    const days = await generateDaysFromTrip(trip.id);

    // 2. Convert saved items to AutoFillPlace format
    const places: AutoFillPlace[] = savedItems
      .filter(item => item.entityType === 'place')
      .map(item => ({
        id: item.entityId,
        name: item.notes ?? '',  // Will be overridden by block title
        placeType: 'place',      // Default, will be enriched
        cityAreaId: null,
        locationLat: null,
        locationLng: null,
        costEstimate: null,
      }));

    // 3. Run auto-fill
    const result = buildAutoFillItinerary(
      places,
      days.length,
      trip.id,
      days.map(d => d.id),
    );

    // 4. Create blocks in DB
    for (const [dayIdx, blocks] of Array.from(result.dayBlocks.entries())) {
      for (const block of blocks) {
        await createBlock(block);
      }
    }

    // 5. Refetch itinerary
    refetchAll();
  } finally {
    setBuilding(false);
  }
};
```

**Step 2: Render planning board or day view**

In the FlatList/ScrollView, add conditional rendering:

```tsx
{itinerary && itinerary.days.length > 0 ? (
  <>
    <DaySelector
      days={itinerary.days}
      selectedDayId={selectedDayId ?? itinerary.days[0]?.id}
      onSelectDay={setSelectedDayId}
    />
    {/* Render selected day's blocks as DayTimelineCard */}
  </>
) : (
  <PlanningBoard
    places={enrichedSavedPlaces}
    onRemovePlace={handleRemoveSavedItem}
    onPlacePress={handlePlacePress}
    onAddMore={handleAddMore}
    onBuildItinerary={handleBuildItinerary}
    building={building}
  />
)}
```

**Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/\(tabs\)/trips/\[id\])' | head -20
```

**Step 4: Commit**

```bash
git add app/\(tabs\)/trips/\[id\]/index.tsx
git commit -m "feat(trips): wire auto-fill and planning board into trip detail"
```

---

## Phase 3: Discover Integration

### Task 17: Add BookmarkButton to Place Cards

**Files:**
- Modify: Place card components in `components/explore/` — add `BookmarkButton` to place cards shown on city pages
- Identify the exact components by searching for place card rendering in city/country detail pages

**Step 1: Identify place card components**

Search for place card components used in city detail and country detail pages. Look for components rendering place data with images and names (likely in `components/explore/city/` and `components/explore/country/`).

**Step 2: Add BookmarkButton**

For each place card component, add:
```tsx
import { BookmarkButton } from '@/components/ui/BookmarkButton';

// In the card's render, add to top-right corner:
<BookmarkButton
  entityType="place"
  entityId={place.id}
  style={{ position: 'absolute', top: spacing.sm, right: spacing.sm }}
/>
```

For city page heroes:
```tsx
<BookmarkButton entityType="city" entityId={city.id} />
```

For country page heroes:
```tsx
<BookmarkButton entityType="country" entityId={country.iso2} />
```

**Step 3: Type-check and commit**

```bash
npx tsc --noEmit 2>&1 | grep -E '(components/explore/)' | head -20
git add components/explore/
git commit -m "feat(trips): add bookmark buttons to place, city, and country cards"
```

---

### Task 18: Trip Context Pill

**Files:**
- Create: `components/explore/TripContextPill.tsx`
- Create: `data/trips/useTripForCity.ts`

**Step 1: Create `useTripForCity` hook**

Create `data/trips/useTripForCity.ts`:

```typescript
import { useMemo } from 'react';
import { useTrips } from './useTrips';
import type { TripWithStops } from './types';

/** Find an active or planned trip that includes a specific city. */
export function useTripForCity(cityId: string | undefined): TripWithStops | null {
  const { trips } = useTrips();

  return useMemo(() => {
    if (!cityId) return null;

    // Check current trip
    if (trips.current) {
      const hasCity = trips.current.stops.some(s => s.cityId === cityId);
      if (hasCity) return trips.current;
    }

    // Check upcoming trips
    for (const trip of trips.upcoming) {
      const hasCity = trip.stops.some(s => s.cityId === cityId);
      if (hasCity) return trip;
    }

    return null;
  }, [cityId, trips]);
}
```

**Step 2: Create `TripContextPill`**

Create `components/explore/TripContextPill.tsx`:

```typescript
import React, { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, fonts } from '@/constants/design';
import { useTripForCity } from '@/data/trips/useTripForCity';
import { FLOATING_TAB_BAR_HEIGHT } from '@/components/TabBar';

interface TripContextPillProps {
  cityId: string;
  cityName: string;
  savedCount?: number;
}

export const TripContextPill: React.FC<TripContextPillProps> = ({
  cityId,
  cityName,
  savedCount = 0,
}) => {
  const trip = useTripForCity(cityId);
  const [dismissed, setDismissed] = useState(false);

  if (!trip || dismissed) return null;

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => router.push(`/(tabs)/trips/${trip.id}`)}
        style={({ pressed }) => [
          styles.pill,
          pressed && { opacity: 0.9 },
        ]}
      >
        <Ionicons name="airplane" size={14} color={colors.orange} />
        <Text style={styles.text} numberOfLines={1}>
          Planning {cityName}
          {savedCount > 0 ? ` · ${savedCount} places saved` : ''}
        </Text>
        <Pressable onPress={() => setDismissed(true)} hitSlop={12}>
          <Ionicons name="close" size={14} color={colors.textMuted} />
        </Pressable>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: FLOATING_TAB_BAR_HEIGHT + spacing.lg,
    left: spacing.screenX,
    right: spacing.screenX,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
});
```

**Step 3: Add TripContextPill to city detail pages**

Add the pill to the city detail screen (likely `app/(tabs)/discover/place-detail/[id].tsx` or similar city page). Render it at the bottom of the screen, above the tab bar.

**Step 4: Type-check and commit**

```bash
npx tsc --noEmit 2>&1 | grep -E '(components/explore/TripContextPill|data/trips/useTripForCity)' | head -10
git add components/explore/TripContextPill.tsx data/trips/useTripForCity.ts
git commit -m "feat(trips): add trip-aware context pill for Discover city pages"
```

---

## Phase 4: Live Mode

### Task 19: Comfort Check Prompt

**Files:**
- Create: `components/trips/ComfortCheckPrompt.tsx`

**Step 1: Create `ComfortCheckPrompt`**

A mid-day "How are you feeling?" prompt that logs comfort checks to the journal.

Create `components/trips/ComfortCheckPrompt.tsx`:

```typescript
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, radius, fonts } from '@/constants/design';
import { createTripEntry } from '@/data/trips/tripApi';
import { useAuth } from '@/state/AuthContext';
import type { MoodTag } from '@/data/trips/types';

const MOODS: { tag: MoodTag; emoji: string; label: string }[] = [
  { tag: 'calm', emoji: '😌', label: 'Calm' },
  { tag: 'happy', emoji: '😊', label: 'Happy' },
  { tag: 'uneasy', emoji: '😟', label: 'Uneasy' },
  { tag: 'unsafe', emoji: '😰', label: 'Unsafe' },
];

interface ComfortCheckPromptProps {
  tripId: string;
  onLogged: () => void;
}

export const ComfortCheckPrompt: React.FC<ComfortCheckPromptProps> = ({
  tripId,
  onLogged,
}) => {
  const { userId } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [logging, setLogging] = useState(false);

  if (dismissed || !userId) return null;

  const handleMood = async (mood: MoodTag) => {
    if (logging) return;
    setLogging(true);
    try {
      await createTripEntry(userId, {
        tripId,
        entryType: 'comfort_check',
        moodTag: mood,
        title: `Feeling ${mood}`,
        visibility: 'private',
      });
      setDismissed(true);
      onLogged();
    } finally {
      setLogging(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>How are you feeling?</Text>
      <View style={styles.moodRow}>
        {MOODS.map(({ tag, emoji, label }) => (
          <Pressable
            key={tag}
            onPress={() => handleMood(tag)}
            style={({ pressed }) => [
              styles.moodButton,
              pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
            ]}
            disabled={logging}
          >
            <Text style={styles.moodEmoji}>{emoji}</Text>
            <Text style={styles.moodLabel}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={() => setDismissed(true)} hitSlop={12}>
        <Text style={styles.dismiss}>Not now</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.screenX,
    marginVertical: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.orangeFill,
    borderRadius: radius.module,
    alignItems: 'center',
  },
  question: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  moodRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  moodButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.card,
    backgroundColor: colors.background,
    minWidth: 64,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  moodLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  dismiss: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
});
```

**Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(components/trips/ComfortCheckPrompt)' | head -10
```

**Step 3: Commit**

```bash
git add components/trips/ComfortCheckPrompt.tsx
git commit -m "feat(trips): add ComfortCheckPrompt for live mode mood tracking"
```

---

### Task 20: Quick Add FAB for Live Mode

**Files:**
- Create: `components/trips/QuickAddFAB.tsx`

**Step 1: Create `QuickAddFAB`**

A floating action button for spontaneous journal entries during active travel.

Create `components/trips/QuickAddFAB.tsx`:

```typescript
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, fonts } from '@/constants/design';
import { createTripEntry } from '@/data/trips/tripApi';
import { useAuth } from '@/state/AuthContext';
import type { EntryType } from '@/data/trips/types';

const QUICK_ACTIONS: { type: EntryType; icon: string; label: string }[] = [
  { type: 'tip', icon: 'bulb-outline', label: 'Travel tip' },
  { type: 'highlight', icon: 'sparkles-outline', label: 'Highlight' },
  { type: 'note', icon: 'create-outline', label: 'Note' },
];

interface QuickAddFABProps {
  tripId: string;
  onEntryAdded: () => void;
}

export const QuickAddFAB: React.FC<QuickAddFABProps> = ({ tripId, onEntryAdded }) => {
  const { userId } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAction = async (type: EntryType) => {
    if (!userId || saving) return;
    setSaving(true);
    try {
      await createTripEntry(userId, {
        tripId,
        entryType: type,
        title: '',
        visibility: 'private',
      });
      setExpanded(false);
      onEntryAdded();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      {expanded && (
        <View style={styles.menu}>
          {QUICK_ACTIONS.map(({ type, icon, label }) => (
            <Pressable
              key={type}
              onPress={() => handleAction(type)}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Ionicons name={icon as any} size={18} color={colors.textPrimary} />
              <Text style={styles.menuLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={({ pressed }) => [
          styles.fab,
          pressed && { transform: [{ scale: 0.95 }] },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Quick add entry"
      >
        <Ionicons
          name={expanded ? 'close' : 'add'}
          size={24}
          color="#FFFFFF"
        />
      </Pressable>
    </View>
  );
};

const FAB_SIZE = 56;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.screenX,
    alignItems: 'flex-end',
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  menu: {
    backgroundColor: colors.background,
    borderRadius: radius.module,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  menuLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
```

**Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(components/trips/QuickAddFAB)' | head -10
```

**Step 3: Commit**

```bash
git add components/trips/QuickAddFAB.tsx
git commit -m "feat(trips): add QuickAddFAB for live mode spontaneous entries"
```

---

### Task 21: Integrate Live Mode Into Day View

**Files:**
- Modify: `app/(tabs)/trips/day/[dayId].tsx`

**Step 1: Add live mode components**

In the day view screen, check if the trip is active and the day is today:

```typescript
const isToday = day?.date === new Date().toISOString().slice(0, 10);
const isActive = trip?.status === 'active';
const isLiveMode = isToday && isActive;
```

Add imports:
```typescript
import { ComfortCheckPrompt } from '@/components/trips/ComfortCheckPrompt';
import { QuickAddFAB } from '@/components/trips/QuickAddFAB';
```

Add to the day view:
1. After 2+ blocks are marked done, show `<ComfortCheckPrompt>` inline
2. In live mode, add `<QuickAddFAB>` positioned at bottom-right
3. Use the existing `getBlockProgressStatus()` to determine completed/current/upcoming state for each block
4. Pass `isDone` and `isCurrent` props to `DayTimelineCard` (or existing `TimelineBlockCard`)

**Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/\(tabs\)/trips/day/)' | head -10
```

**Step 3: Commit**

```bash
git add app/\(tabs\)/trips/day/\[dayId\].tsx
git commit -m "feat(trips): integrate live mode with comfort checks and quick-add FAB"
```

---

## Phase 5: Final Polish

### Task 22: Enhanced Day View With Rich Cards

**Files:**
- Modify: `app/(tabs)/trips/day/[dayId].tsx`

**Step 1: Replace timeline blocks with rich cards**

Swap the existing `TimelineBlockCard` usage in the day view with the new `DayTimelineCard` component for non-accommodation blocks. Keep `AccommodationBanner` for accommodation blocks at the top.

Add connector lines between cards:
```tsx
{index < blocks.length - 1 && (
  <View style={styles.connector}>
    <View style={styles.connectorLine} />
    <Pressable
      onPress={() => handleInsertAfter(index)}
      style={styles.connectorPlus}
      hitSlop={12}
    >
      <Ionicons name="add-circle-outline" size={20} color={colors.textMuted} />
    </Pressable>
    <View style={styles.connectorLine} />
  </View>
)}
```

**Step 2: Add "Add to this day" button at bottom**

```tsx
<Pressable onPress={handleAddToDay} style={styles.addToDayButton}>
  <Ionicons name="add" size={18} color={colors.orange} />
  <Text style={styles.addToDayText}>Add to this day</Text>
</Pressable>
```

When tapped, opens the `SmartSearchSheet`.

**Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/\(tabs\)/trips/day/)' | head -10
```

**Step 4: Commit**

```bash
git add app/\(tabs\)/trips/day/\[dayId\].tsx
git commit -m "feat(trips): enhance day view with rich cards, connectors, and smart search"
```

---

### Task 23: Final Type-Check and Cleanup

**Step 1: Full type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -30
```

Fix any type errors introduced by the changes.

**Step 2: Verify no references to deleted files**

```bash
grep -r "TripEmptyState" app/ components/ data/ --include="*.tsx" --include="*.ts" | head -10
grep -r "demo" app/\(tabs\)/trips/ --include="*.tsx" --include="*.ts" | head -10
```

Clean up any remaining references.

**Step 3: Commit cleanup**

```bash
git add -A
git commit -m "chore(trips): cleanup type errors and stale references"
```

---

## Implementation Reference

### Key existing functions to reuse:
- `getPopularCitiesWithCountry(limit)` — `data/api.ts`
- `getPlacesGroupedByTime(cityId)` — `data/api.ts`
- `getPlacesByCategoryForCity(cityId, types)` — `data/city/cityApi.ts`
- `searchDestinations(query)` — `data/api.ts`
- `generateDaysFromTrip(tripId)` — `data/trips/itineraryApi.ts`
- `createBlock(input)` — `data/trips/itineraryApi.ts`
- `addTripSavedItem(tripId, ...)` — `data/trips/tripApi.ts`
- `removeTripSavedItem(tripId, ...)` — `data/trips/tripApi.ts`
- `createTripEntry(userId, input)` — `data/trips/tripApi.ts`
- `analyzeDaySuggestions(day, pace)` — `data/trips/suggestionEngine.ts`
- `haversineKm(lat1, lng1, lat2, lng2)` — `data/trips/suggestionEngine.ts`
- `getFlag(iso2)` — `data/trips/helpers.ts`
- `formatDate()`, `formatDateShort()`, `formatDayDate()` — `data/trips/helpers.ts`
- `useData()` — `hooks/useData.ts` (React Query wrapper)
- `useAuth()` — `state/AuthContext.ts`
- `toCamel()`, `rowsToCamel()` — `data/api.ts`

### Design tokens to use:
- `spacing.screenX` (24px) — all horizontal padding
- `colors.orange` (#E5653A) — primary action
- `colors.orangeFill` (#FFF5F1) — selected state backgrounds
- `colors.neutralFill` (#F3F3F3) — placeholder backgrounds
- `colors.borderDefault` (#E8E8E8) — card borders
- `fonts.semiBold` — headings, button text
- `fonts.medium` — labels, secondary text
- `fonts.regular` — body text
- `radius.card` (8) — card corners
- `radius.full` (999) — pills

### Pattern reminders:
- **Hermes**: Always `Array.from(new Set(...))`, never `[...new Set()]`
- **Press state**: `opacity: 0.9, transform: [{ scale: 0.98 }]`
- **DB queries**: All go in `data/` directory, use `toCamel()` / `rowsToCamel()`
- **Navigation**: `router.push()` for forward, `router.back()` for back
- **Components**: `const Foo: React.FC<Props>`, styles at bottom with `StyleSheet.create()`
