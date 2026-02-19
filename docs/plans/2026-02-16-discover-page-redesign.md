# Discover Page Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the Discover page from a static browse page into an intelligent, personalised discovery experience with three clear sections: Browse Destinations (continent entry point), Recommended For You (personalised carousel), and Collections (premium redesign).

**Architecture:** Replace the current FlatList-of-feed-items pattern with a simpler ScrollView rendering 3 fixed sections. Create a new `get_recommended_cities` Postgres function that blends personal tag affinity with global popularity signals (materialized views). Rewrite the Browse page (`all-destinations.tsx`) as a single-page continent→country→city hierarchy driven by a new `continent` column on the `countries` table.

**Tech Stack:** React Native (Expo Router), Supabase (Postgres functions, materialized views), React Query, existing design system tokens from `constants/design.ts`.

---

## Task 1: Add `continent` column to countries table

**Files:**
- Create: `supabase/migrations/20260216_add_continent_to_countries.sql`
- Modify: `data/types.ts` (add `continent` to Country interface)
- Modify: `data/api.ts` (add `continent` to mapCountry)

**Step 1: Create migration**

```sql
-- Add continent column to countries table
ALTER TABLE countries ADD COLUMN IF NOT EXISTS continent text;

-- Update existing countries with continent values based on ISO2
UPDATE countries SET continent = CASE
  WHEN iso2 IN ('TH','VN','ID','PH','KH','MM','LA','MY','SG','BN','TL','IN','LK','NP','BT','BD','MV','JP','KR','CN','TW','HK','MO','MN','UZ','KZ','KG','TJ','GE','AM','AZ') THEN 'asia'
  WHEN iso2 IN ('TR','JO','IL','LB','OM','AE','QA','BH','KW','SA','IR','IQ','YE','SY','PS') THEN 'middle_east'
  WHEN iso2 IN ('FR','DE','IT','ES','PT','GB','IE','NL','BE','CH','AT','GR','HR','ME','AL','MK','RS','BA','SI','CZ','SK','PL','HU','RO','BG','DK','SE','NO','FI','IS','EE','LV','LT','MT','CY','LU','MC','AD') THEN 'europe'
  WHEN iso2 IN ('ZA','KE','TZ','MA','EG','GH','NG','SN','ET','RW','UG','MZ','MG','MU','SC','CV','NA','BW','ZM','ZW','TN','DZ','CM','CI') THEN 'africa'
  WHEN iso2 IN ('US','CA','MX','GT','BZ','HN','SV','NI','CR','PA','CU','JM','HT','DO','TT','BS','BB','AG','DM','GD','KN','LC','VC','CO','VE','GY','SR','EC','PE','BO','BR','PY','UY','AR','CL') THEN 'latin_america'
  WHEN iso2 IN ('AU','NZ','FJ','PG','WS','TO','VU','SB','KI','MH','FM','PW','NR','TV') THEN 'oceania'
  ELSE NULL
END;

-- Add NOT NULL constraint after populating
ALTER TABLE countries ALTER COLUMN continent SET NOT NULL;

-- Index for efficient continent queries
CREATE INDEX idx_countries_continent ON countries(continent);
```

**Step 2: Add `continent` to Country type in `data/types.ts`**

Add after `slug` field:
```typescript
continent: 'africa' | 'asia' | 'europe' | 'latin_america' | 'middle_east' | 'oceania';
```

**Step 3: Add `continent` to `mapCountry()` in `data/api.ts`**

Add to the mapCountry return object:
```typescript
continent: row.continent,
```

**Step 4: Add new query `getCountriesWithCities()` in `data/api.ts`**

```typescript
export async function getCountriesWithCities(): Promise<
  (Country & { cities: { id: string; name: string; slug: string }[] })[]
> {
  const { data, error } = await supabase
    .from('countries')
    .select('*, cities!inner(id, name, slug)')
    .eq('is_active', true)
    .eq('cities.is_active', true)
    .order('order_index');
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...mapCountry(row),
    cities: (row.cities ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    })),
  }));
}
```

**Step 5: Commit**

```
feat: add continent column to countries table
```

---

## Task 2: Create `get_recommended_cities` Postgres function

**Files:**
- Create: `supabase/migrations/20260216_recommended_cities_function.sql`

**Step 1: Create the migration**

```sql
-- Recommended cities function
-- Blends personal affinity signals with global popularity for the Discover feed.
--
-- Ranking logic:
-- 1. Determine user segment from trip/save/visit counts:
--    - beginner (0 trips, <3 saves, <5 events): 0.1 personal, 0.9 global
--    - intermediate (1-2 trips OR 3-10 saves): 0.5 personal, 0.5 global
--    - experienced (3+ trips OR 10+ saves OR 5+ countries): 0.8 personal, 0.2 global
--
-- 2. Personal score (0-100):
--    - Tag affinity match (max 60): sum of shared tag scores between user and city
--    - Recent country views in 30 days (max 15): viewed the city's country recently
--    - Saves in city (max 15): user has saved places in this city
--
-- 3. Global score (0-100):
--    - 30-day save count from mv_city_planning_count (max 40, normalized)
--    - 30-day community activity from mv_city_community_activity (max 30, normalized)
--    - is_featured flag (+20)
--    - safety_rating >= 'generally_safe' (+10)
--
-- 4. Blended: final = (weight * personal) + ((1 - weight) * global)
--
-- 5. Exclusions: visited countries, max 2 per country, must have hero_image_url

CREATE OR REPLACE FUNCTION get_recommended_cities(
  p_user_id uuid,
  p_limit int DEFAULT 12
)
RETURNS TABLE (
  city_id uuid,
  city_name text,
  city_slug text,
  country_name text,
  country_slug text,
  hero_image_url text,
  solo_level text,
  safety_rating text,
  planning_count bigint,
  final_score numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_trip_count int;
  v_save_count int;
  v_country_count int;
  v_personal_weight numeric;
  v_max_planning bigint;
  v_max_activity bigint;
BEGIN
  -- Determine user segment
  SELECT COUNT(*) INTO v_trip_count FROM trips WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_save_count FROM saved_places WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_country_count FROM user_visited_countries WHERE user_id = p_user_id;

  IF v_trip_count >= 3 OR v_save_count >= 10 OR v_country_count >= 5 THEN
    v_personal_weight := 0.8;  -- experienced
  ELSIF v_trip_count >= 1 OR v_save_count >= 3 THEN
    v_personal_weight := 0.5;  -- intermediate
  ELSE
    v_personal_weight := 0.1;  -- beginner
  END IF;

  -- Get normalization max values for global scores
  SELECT COALESCE(MAX(planning_count), 1) INTO v_max_planning FROM mv_city_planning_count;
  SELECT COALESCE(MAX(activity_count), 1) INTO v_max_activity FROM mv_city_community_activity;

  RETURN QUERY
  WITH personal_scores AS (
    -- Tag affinity: sum of matching tag scores, capped at 60
    SELECT
      c.id AS cid,
      LEAST(COALESCE(SUM(uta.score), 0), 60) AS tag_score
    FROM cities c
    LEFT JOIN destination_tags dt ON dt.entity_type = 'city' AND dt.entity_id = c.id
    LEFT JOIN user_tag_affinity uta ON uta.tag_id = dt.id AND uta.user_id = p_user_id
    WHERE c.is_active = true AND c.hero_image_url IS NOT NULL
    GROUP BY c.id
  ),
  recent_views AS (
    -- Did user view this city's country in last 30 days?
    SELECT DISTINCT c.id AS cid, 15 AS view_boost
    FROM cities c
    JOIN countries co ON co.id = c.country_id
    JOIN user_events ue ON ue.entity_type = 'country'
      AND ue.entity_id = co.id
      AND ue.user_id = p_user_id
      AND ue.event_type = 'viewed_country'
      AND ue.created_at > now() - interval '30 days'
    WHERE c.is_active = true
  ),
  city_saves AS (
    -- Does user have saves in this city?
    SELECT DISTINCT p.city_id AS cid, 15 AS save_boost
    FROM saved_places sp
    JOIN places p ON p.id = sp.place_id
    WHERE sp.user_id = p_user_id AND p.city_id IS NOT NULL
  ),
  global_scores AS (
    SELECT
      c.id AS cid,
      -- Planning popularity (max 40)
      (COALESCE(mpc.planning_count, 0)::numeric / v_max_planning * 40) AS planning_score,
      -- Community activity (max 30)
      (COALESCE(mca.activity_count, 0)::numeric / v_max_activity * 30) AS activity_score,
      -- Featured bonus (+20)
      CASE WHEN c.is_featured THEN 20 ELSE 0 END AS featured_score,
      -- Safety bonus (+10)
      CASE WHEN c.safety_rating IN ('very_safe', 'generally_safe') THEN 10 ELSE 0 END AS safety_score,
      mpc.planning_count AS raw_planning
    FROM cities c
    LEFT JOIN mv_city_planning_count mpc ON mpc.city_id = c.id
    LEFT JOIN mv_city_community_activity mca ON mca.city_id = c.id
    WHERE c.is_active = true AND c.hero_image_url IS NOT NULL
  ),
  scored AS (
    SELECT
      c.id,
      c.name,
      c.slug,
      co.name AS co_name,
      co.slug AS co_slug,
      c.hero_image_url,
      c.solo_level,
      c.safety_rating,
      COALESCE(gs.raw_planning, 0) AS raw_planning,
      -- Personal score (0-100)
      (COALESCE(ps.tag_score, 0) + COALESCE(rv.view_boost, 0) + COALESCE(cs.save_boost, 0)) AS p_score,
      -- Global score (0-100)
      (gs.planning_score + gs.activity_score + gs.featured_score + gs.safety_score) AS g_score,
      co.id AS country_pk,
      ROW_NUMBER() OVER (PARTITION BY co.id ORDER BY
        (v_personal_weight * (COALESCE(ps.tag_score, 0) + COALESCE(rv.view_boost, 0) + COALESCE(cs.save_boost, 0))
        + (1 - v_personal_weight) * (gs.planning_score + gs.activity_score + gs.featured_score + gs.safety_score))
        DESC
      ) AS country_rank
    FROM cities c
    JOIN countries co ON co.id = c.country_id AND co.is_active = true
    JOIN global_scores gs ON gs.cid = c.id
    LEFT JOIN personal_scores ps ON ps.cid = c.id
    LEFT JOIN recent_views rv ON rv.cid = c.id
    LEFT JOIN city_saves cs ON cs.cid = c.id
    -- Exclude visited countries
    LEFT JOIN user_visited_countries uvc ON uvc.country_id = co.id AND uvc.user_id = p_user_id
    WHERE uvc.country_id IS NULL
      AND c.is_active = true
      AND c.hero_image_url IS NOT NULL
  )
  SELECT
    scored.id,
    scored.name,
    scored.slug,
    scored.co_name,
    scored.co_slug,
    scored.hero_image_url,
    scored.solo_level,
    scored.safety_rating,
    scored.raw_planning,
    (v_personal_weight * scored.p_score + (1 - v_personal_weight) * scored.g_score) AS blended
  FROM scored
  WHERE scored.country_rank <= 2  -- max 2 cities per country
  ORDER BY blended DESC
  LIMIT p_limit;
END;
$$;
```

**Step 2: Commit**

```
feat: add get_recommended_cities Postgres function with blended ranking
```

---

## Task 3: Create data layer for Discover feed

**Files:**
- Create: `data/discover/discoverApi.ts`
- Create: `data/discover/types.ts`
- Create: `data/discover/useDiscoverData.ts`

**Step 1: Create types**

`data/discover/types.ts`:
```typescript
export type ContinentKey = 'africa' | 'asia' | 'europe' | 'latin_america' | 'middle_east' | 'oceania';

export interface RecommendedCity {
  cityId: string;
  cityName: string;
  citySlug: string;
  countryName: string;
  countrySlug: string;
  heroImageUrl: string;
  soloLevel: string | null;
  safetyRating: string | null;
  planningCount: number;
  finalScore: number;
}

export interface BrowseCountry {
  id: string;
  name: string;
  slug: string;
  continent: ContinentKey;
  heroImageUrl: string | null;
  cities: { id: string; name: string; slug: string }[];
}

export const CONTINENT_LABELS: Record<ContinentKey, string> = {
  africa: 'Africa',
  asia: 'Asia',
  europe: 'Europe',
  latin_america: 'Latin America',
  middle_east: 'Middle East',
  oceania: 'Oceania',
};

export const CONTINENT_ORDER: ContinentKey[] = [
  'africa', 'asia', 'europe', 'latin_america', 'middle_east', 'oceania',
];
```

**Step 2: Create API functions**

`data/discover/discoverApi.ts`:
```typescript
import { supabase } from '@/lib/supabase';
import { getPopularCitiesWithCountry, getCountriesWithCities } from '../api';
import { getExploreCollections, getExploreCollectionItems } from '../collections';
import type { ExploreCollectionWithItems } from '../types';
import type { RecommendedCity, BrowseCountry, ContinentKey } from './types';

/**
 * Fetch recommended cities for the Discover carousel.
 * Uses get_recommended_cities RPC which blends personal affinity with global popularity.
 * Falls back to popular cities if personalized results are insufficient (<3).
 */
export async function fetchRecommendedCities(
  userId: string | null,
  limit: number = 12,
): Promise<{ cities: RecommendedCity[]; isPersonalized: boolean }> {
  // Try personalized first if user is logged in
  if (userId) {
    const { data, error } = await supabase.rpc('get_recommended_cities', {
      p_user_id: userId,
      p_limit: limit,
    });

    if (!error && data && data.length >= 3) {
      return {
        cities: data.map((row: Record<string, unknown>) => ({
          cityId: row.city_id as string,
          cityName: row.city_name as string,
          citySlug: row.city_slug as string,
          countryName: row.country_name as string,
          countrySlug: row.country_slug as string,
          heroImageUrl: row.hero_image_url as string,
          soloLevel: (row.solo_level as string) || null,
          safetyRating: (row.safety_rating as string) || null,
          planningCount: Number(row.planning_count) || 0,
          finalScore: Number(row.final_score) || 0,
        })),
        isPersonalized: true,
      };
    }
  }

  // Fallback: popular cities (global, not personalized)
  const popular = await getPopularCitiesWithCountry(limit);
  return {
    cities: popular.map((c) => ({
      cityId: c.id,
      cityName: c.name,
      citySlug: c.slug,
      countryName: c.countryName,
      countrySlug: c.countrySlug,
      heroImageUrl: c.heroImageUrl ?? '',
      soloLevel: c.soloLevel,
      safetyRating: c.safetyRating,
      planningCount: 0,
      finalScore: 0,
    })),
    isPersonalized: false,
  };
}

/**
 * Fetch countries grouped by continent for the Browse page.
 * Each country includes its active cities.
 */
export async function fetchBrowseData(): Promise<Map<ContinentKey, BrowseCountry[]>> {
  const countriesWithCities = await getCountriesWithCities();

  const grouped = new Map<ContinentKey, BrowseCountry[]>();
  for (const country of countriesWithCities) {
    const continent = country.continent as ContinentKey;
    if (!grouped.has(continent)) {
      grouped.set(continent, []);
    }
    grouped.get(continent)!.push({
      id: country.id,
      name: country.name,
      slug: country.slug,
      continent,
      heroImageUrl: country.heroImageUrl,
      cities: country.cities,
    });
  }

  return grouped;
}

/**
 * Fetch collections for the Discover page.
 * Returns only collections that meet their minimum item threshold.
 */
export async function fetchDiscoverCollections(): Promise<ExploreCollectionWithItems[]> {
  const collections = await getExploreCollections();

  const resolved = await Promise.all(
    collections.map(async (col) => {
      try {
        const items = await getExploreCollectionItems(col);
        if (items.length < col.minItems) return null;
        return { ...col, items } as ExploreCollectionWithItems;
      } catch {
        return null;
      }
    }),
  );

  return resolved.filter((c): c is ExploreCollectionWithItems => c !== null);
}
```

**Step 3: Create data hook**

`data/discover/useDiscoverData.ts`:
```typescript
import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { useAuth } from '@/state/AuthContext';
import { fetchRecommendedCities, fetchDiscoverCollections } from './discoverApi';
import type { RecommendedCity } from './types';
import type { ExploreCollectionWithItems } from '../types';

interface DiscoverData {
  recommended: RecommendedCity[];
  isPersonalized: boolean;
  collections: ExploreCollectionWithItems[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useDiscoverData(): DiscoverData {
  const { userId } = useAuth();
  const [recommended, setRecommended] = useState<RecommendedCity[]>([]);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [collections, setCollections] = useState<ExploreCollectionWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        const [recResult, colResult] = await Promise.allSettled([
          fetchRecommendedCities(userId, 12),
          fetchDiscoverCollections(),
        ]);

        if (cancelled) return;

        if (recResult.status === 'fulfilled') {
          setRecommended(recResult.value.cities);
          setIsPersonalized(recResult.value.isPersonalized);
        } else {
          Sentry.captureException(recResult.reason);
        }

        if (colResult.status === 'fulfilled') {
          setCollections(colResult.value);
        } else {
          Sentry.captureException(colResult.reason);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error('Failed to load discover'));
          Sentry.captureException(e);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [userId, refreshKey]);

  return {
    recommended,
    isPersonalized,
    collections,
    isLoading,
    error,
    refresh: () => setRefreshKey((k) => k + 1),
  };
}
```

**Step 4: Commit**

```
feat: add discover data layer with recommendation engine and browse API
```

---

## Task 4: Rewrite the Browse Destinations page

Replace the current `all-destinations.tsx` (hardcoded continent cards) with a single-page structured index: continent tabs → country rows → city chips.

**Files:**
- Rewrite: `app/(tabs)/discover/all-destinations.tsx`
- Delete: `app/(tabs)/discover/continent/[name].tsx` (no longer needed — everything on one page)

**Step 1: Rewrite `all-destinations.tsx`**

The new page has:
- Back button + "Browse destinations" title via AppHeader
- Horizontal continent tabs (ScrollView with underline on selected)
- For selected continent: list of countries, each with name and city chips below
- Tapping country → `/(tabs)/discover/country/[slug]`
- Tapping city chip → `/(tabs)/discover/city/[slug]`
- No images — pure typography. Clean structured index.
- Uses `fetchBrowseData()` from the new discover API

Key design:
- Continent tabs: `fonts.medium` 14px, selected = `colors.textPrimary` + orange underline 2px, unselected = `colors.textMuted`
- Country names: `fonts.semiBold` 16px, `colors.textPrimary`, 44pt min touch target, right chevron
- City chips below each country: `fonts.regular` 13px, `colors.textSecondary`, separated by " · "
- Section dividers: `borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSubtle`
- First continent tab selected by default (Africa, alphabetically)

**Step 2: Remove continent detail page**

Delete `app/(tabs)/discover/continent/[name].tsx` — the Browse page now handles all continents inline.

**Step 3: Commit**

```
feat: replace continent pages with unified Browse Destinations page
```

---

## Task 5: Rewrite the Discover main screen

Replace the current FlatList approach (which filters out most feed items) with a clean ScrollView rendering 3 sections.

**Files:**
- Rewrite: `app/(tabs)/discover/index.tsx`

**Step 1: Rewrite the screen**

Structure:
```
ScrollView
  ├── CompactSearchBar (keep existing)
  ├── BrowseDestinationsCard (new — single card entry point)
  ├── RecommendedSection (new — horizontal carousel)
  └── CollectionsSection (new — featured hero + 2-col grid)
```

**BrowseDestinationsCard:**
- Full width, `paddingHorizontal: spacing.screenX`
- Background: `colors.neutralFill` (subtle, not an image)
- Height: ~80px, `borderRadius: radius.card`
- Left side: title "Browse destinations" (`fonts.semiBold` 17px) + subtitle "Explore by continent" (`fonts.regular` 13px, `colors.textSecondary`)
- Right side: chevron-right icon (`Feather` "chevron-right", `colors.textMuted`)
- Press: `router.push('/(tabs)/discover/all-destinations')`

**RecommendedSection:**
- Section header: `SectionHeader` with title that adapts:
  - `isPersonalized` true → "Recommended for you"
  - `isPersonalized` false → "Popular with solo women"
- Horizontal ScrollView with snap behavior
- Cards: `width = (SCREEN_WIDTH - 48 - 12) / 2.3` (show ~2.3 cards)
- Card height: `width * 1.3`
- Each card: image fill, gradient overlay, city name + country name at bottom
- One signal chip at bottom-left: planning count if > 0 ("238 women planning"), else solo level badge
- `snapToInterval`, `decelerationRate="fast"`

**CollectionsSection:**
- Section header: `SectionHeader` title "Ways to travel solo"
- First collection (`is_featured` or index 0): full-width hero card, 200px height
- Remaining: 2-column grid, 160px height each, `gap: spacing.md`
- All cards: image fill, gradient at bottom, title + count overlaid
- No "COLLECTION" type pill — removed for cleaner look
- `borderRadius: radius.card + 4` (12px for slightly rounder feel)

**Step 2: Commit**

```
feat: rewrite Discover with browse entry, recommendations, and premium collections
```

---

## Task 6: Clean up old feed infrastructure

Remove code that's no longer used by the Discover page.

**Files:**
- Modify: `data/explore/types.ts` — remove `featured-islands` from FeedItem union
- Modify: `data/explore/feedBuilder.ts` — remove islands parameter and `featured-islands` feed item
- Modify: `data/explore/useFeedItems.ts` — remove islands fetch (`getCitiesByTags(['island'])`)
- Keep: `buildFeed()` and `useFeedItems()` remain because the travelling-mode feed and other consumers may still use them

**Step 1: Remove `featured-islands` from FeedItem type**

In `data/explore/types.ts`, remove:
```typescript
| { type: 'featured-islands'; data: CityWithCountry[] }
```

**Step 2: Remove islands from feedBuilder**

In `data/explore/feedBuilder.ts`:
- Remove `islands?: CityWithCountry[]` parameter from `buildFeed()`
- Remove the `featured-islands` push block
- Remove islands parameter from `buildTravellingFeed()` as well

**Step 3: Remove islands fetch from useFeedItems**

In `data/explore/useFeedItems.ts`:
- Remove `getCitiesByTags(['island'])` from the Promise.all
- Remove `islandsResult` variable
- Remove islands from `buildFeed()` and `buildTravellingFeed()` calls

**Step 4: Commit**

```
refactor: remove featured-islands from feed infrastructure
```

---

## Task 7: TypeScript check and visual polish

**Files:**
- All modified files

**Step 1: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|constants/)'
```

Fix any errors in our files (ignore pre-existing errors in `scripts/` and `supabase/functions/`).

**Step 2: Visual review checklist**

Verify in the app:
- [ ] Search bar renders at top
- [ ] Browse Destinations card is tappable, navigates to browse page
- [ ] Browse page shows continent tabs, countries with city chips
- [ ] "Recommended for you" / "Popular with solo women" title adapts
- [ ] Carousel scrolls horizontally with snap behavior
- [ ] Collections show featured hero + 2-col grid
- [ ] Pull-to-refresh works
- [ ] Loading and error states render correctly

**Step 3: Commit**

```
chore: fix typescript errors and polish discover page
```

---

## Test Scenarios

After implementation, verify these scenarios:

### Brand new user (no events, no saves, no trips)
- Recommended section title: "Popular with solo women"
- Carousel shows: featured cities ranked by global popularity (saves + community + featured flag)
- Browse page: all continents with countries and cities

### User with saves but no trips
- Segment: beginner (0.1 personal, 0.9 global)
- Recommended section title: likely "Popular with solo women" (unless 3+ personalized results)
- Cities with user's saved tags get slight personal boost

### User with multiple trips
- Segment: intermediate or experienced depending on count
- Recommended section title: "Recommended for you"
- Carousel shows blend of personally relevant + globally popular cities
- Visited countries excluded from recommendations

### Power user (3+ trips, 10+ saves, 5+ countries)
- Segment: experienced (0.8 personal, 0.2 global)
- Recommended section title: "Recommended for you"
- Strong personal signal dominates — cities matching user's tag affinities surface first
- Max 2 cities per country enforced for diversity

---

## Dependencies

- Task 1 must complete before Tasks 2–5 (continent column needed)
- Task 2 must complete before Task 3 (Postgres function needed by API)
- Task 3 must complete before Tasks 4–5 (data hooks needed by screens)
- Task 6 can run in parallel with Task 5
- Task 7 runs last
