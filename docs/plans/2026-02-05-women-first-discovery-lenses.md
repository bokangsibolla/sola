# Women-First Discovery Lenses Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the generic QuickActionsRow with women-first discovery lenses that surface safety, comfort, and solo-travel intelligence as the primary entry points on the Explore screen — making Sola feel like it was built specifically for women traveling alone.

**Architecture:** Add a `discovery_lenses` table in Supabase with lens metadata + tag mappings. Create a `DiscoveryLensesSection` component that renders premium lens cards in the feed. Each lens navigates to a lens results screen that shows a filtered, editorial-style collection of cities/countries. The existing `explore_collections` + `destination_tags` infrastructure is reused — lenses are a semantic layer on top of the same tag-based resolution engine. New women-specific tag categories (`accommodation_type`, `safety_context`, `social_comfort`, `energy_level`) are added to `destination_tags`.

**Tech Stack:** React Native (Expo Router), Supabase (Postgres), TypeScript, expo-image, Feather icons

---

## Design Rationale

### Why Lenses, Not Filters

Filters require knowledge. A woman opening Sola for the first time doesn't know which tags exist, which cities have female-only dorms, or how to combine "walkable at night" with "easy transport." Lenses invert that — the app knows what matters and presents it upfront.

### The 7 Launch Lenses

| # | Lens Slug | Title | Helper Text | Why It Matters |
|---|-----------|-------|-------------|----------------|
| 1 | `solo_friendly_first_trip` | First solo trip | Places that make your first time easy | Most common anxiety for women solo travelers. Removes the "where do I even start" paralysis. |
| 2 | `female_only_stays` | Female-only stays | Dorms and hostels with women-only options | Direct safety concern. Women search for this but most apps bury it in filters. |
| 3 | `walkable_well_lit` | Walkable & well-lit | Neighborhoods safe to explore on foot | "Can I walk home at night?" is the #1 unspoken question. |
| 4 | `calm_recharge` | Calm places to recharge | Quiet spots when you need a reset | Solo travel fatigue is real. Women specifically need spaces where being alone feels intentional, not isolating. |
| 5 | `easy_transport` | Easy to get around | Reliable transport, low friction | Women need to know they can get home safely. Transport confidence = freedom. |
| 6 | `strong_women_community` | Women traveler hotspots | Where solo women already go | Social proof. "Other women go here" is the strongest trust signal. |
| 7 | `wellness_retreat` | Wellness & retreat | Yoga, spa, meditation | Top intent for women solo travelers. Not generic — specifically curated for women. |

### How Lenses Map to Backend Data

Each lens maps to one or more tag slugs across tag categories:

```
Lens: solo_friendly_first_trip
  → destination_tags where tag_slug IN ('first_solo_trip', 'easy_to_navigate', 'english_widely_spoken')
  → Shows: Countries + Cities tagged with these

Lens: female_only_stays
  → destination_tags where tag_slug IN ('female_only_stays', 'women_only_options')
  → Also: place_tags where tag_slug IN ('female_only', 'women_only', 'female_dorm')
  → Shows: Cities first (that have tagged places), then specific places

Lens: walkable_well_lit
  → destination_tags where tag_slug IN ('walkable_night', 'walkable_day', 'well_lit')
  → Shows: Cities + Neighborhoods

Lens: calm_recharge
  → destination_tags where tag_slug IN ('quiet', 'slow_travel', 'relaxed')
  → Exclude: tags ('nightlife_social', 'lively', 'fast_paced')
  → Shows: Cities

Lens: easy_transport
  → destination_tags where tag_slug IN ('great_public_transport', 'reliable_transport', 'easy_to_navigate')
  → Shows: Cities

Lens: strong_women_community
  → destination_tags where tag_slug IN ('strong_solo_community', 'strong_women_community')
  → Shows: Cities + Countries

Lens: wellness_retreat
  → destination_tags where tag_slug IN ('wellness_retreat', 'spiritual', 'yoga')
  → Shows: Cities
```

### Tag Rollup Strategy

**Entity → Tag Flow:**
- **Places** get the most granular tags: `female_only`, `women_run`, `well_lit_area`, `yoga_studio`
- **Cities** get aggregated tags: if 3+ places in a city have `female_only`, the city gets `female_only_stays`
- **Countries** get broad tags: `first_solo_trip`, `strong_women_community`

**For launch:** Tags are applied manually via Supabase. Later, automated rollup can be added (a scheduled function that counts tagged places per city and auto-tags cities that pass a threshold).

### How the Explore Feed Changes When a Lens is Active

When a user taps a lens:
1. Navigate to `/explore/lens/[slug]`
2. This screen:
   - Shows a short editorial intro (why this matters for women)
   - Fetches entities matching the lens's tag rules (reusing `getExploreCollectionItems` logic)
   - Renders results as premium cards (cities with images, countries with images)
   - Shows a "Refine" button that opens a bottom sheet with optional narrowing (by country, by city)
3. The main Explore feed is NOT modified — the lens opens a dedicated results view

### Scaling & Monetization

- **New regions:** Tag new cities/countries → they appear in matching lenses automatically
- **Sponsored lenses:** A brand could sponsor "Wellness & retreat" → `is_sponsored` flag, same as collections
- **Personalization:** User's past lens taps inform feed ordering (PostHog events → future recommendation engine)
- **Trust:** Lenses never mix sponsored content with safety-critical lenses (female_only_stays, walkable_well_lit)

---

## Task 1: Add women-specific destination tags

**Files:**
- Create: `supabase/migrations/20260205_women_first_tags.sql`

This migration adds new tag categories and tags to the `destination_tags` table for the women-first lenses. It does NOT create new tables — it extends the existing tag system.

**Step 1: Write the migration**

```sql
-- supabase/migrations/20260205_women_first_tags.sql
-- Add women-first tag categories to existing destination_tags

-- New tag categories: accommodation_type, safety_context, social_comfort, energy_level
-- These extend the existing categories: travel_style, solo_context, vibe, budget, pace, environment, safety

-- ====================================================================
-- CITY-LEVEL TAGS: safety_context
-- ====================================================================

-- Chiang Mai - walkable, well-lit, easy transport
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('safety_context', 'reliable_transport', 'Reliable transport', 2),
  ('social_comfort', 'strong_women_community', 'Strong women community', 1),
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 2),
  ('energy_level', 'calm', 'Calm', 1),
  ('accommodation_type', 'female_only_stays', 'Female-only stays available', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'chiang-mai'
ON CONFLICT DO NOTHING;

-- Ubud - calm, wellness, female-only options
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('social_comfort', 'strong_women_community', 'Strong women community', 1),
  ('energy_level', 'calm', 'Calm', 1),
  ('accommodation_type', 'female_only_stays', 'Female-only stays available', 1),
  ('accommodation_type', 'women_run', 'Women-run stays', 2)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'ubud'
ON CONFLICT DO NOTHING;

-- Hoi An - walkable, calm, solo friendly
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('safety_context', 'well_lit', 'Well-lit streets', 1),
  ('safety_context', 'reliable_transport', 'Reliable transport', 2),
  ('energy_level', 'calm', 'Calm', 1),
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'hoi-an'
ON CONFLICT DO NOTHING;

-- El Nido - women community, social
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('social_comfort', 'strong_women_community', 'Strong women community', 1),
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 2),
  ('energy_level', 'social', 'Social', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'el-nido'
ON CONFLICT DO NOTHING;

-- Siargao - women community, social, active
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'city', id, tag_category, tag_slug, tag_label, tag_order
FROM cities, (VALUES
  ('social_comfort', 'strong_women_community', 'Strong women community', 1),
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 2),
  ('energy_level', 'social', 'Social', 1),
  ('accommodation_type', 'female_only_stays', 'Female-only stays available', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE cities.slug = 'siargao'
ON CONFLICT DO NOTHING;

-- ====================================================================
-- COUNTRY-LEVEL TAGS: solo_context reinforcement
-- ====================================================================

-- Thailand - easy transport, first solo
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'country', id, tag_category, tag_slug, tag_label, tag_order
FROM countries, (VALUES
  ('safety_context', 'reliable_transport', 'Reliable transport', 1),
  ('social_comfort', 'strong_women_community', 'Strong women community', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE countries.slug = 'thailand'
ON CONFLICT DO NOTHING;

-- Indonesia
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'country', id, tag_category, tag_slug, tag_label, tag_order
FROM countries, (VALUES
  ('social_comfort', 'strong_women_community', 'Strong women community', 1),
  ('energy_level', 'mixed', 'Mixed energy', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE countries.slug = 'indonesia'
ON CONFLICT DO NOTHING;

-- Philippines
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'country', id, tag_category, tag_slug, tag_label, tag_order
FROM countries, (VALUES
  ('social_comfort', 'strong_women_community', 'Strong women community', 1),
  ('social_comfort', 'easy_to_meet_people', 'Easy to meet people', 2)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE countries.slug = 'philippines'
ON CONFLICT DO NOTHING;

-- Vietnam
INSERT INTO destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
SELECT 'country', id, tag_category, tag_slug, tag_label, tag_order
FROM countries, (VALUES
  ('safety_context', 'reliable_transport', 'Reliable transport', 1)
) AS t(tag_category, tag_slug, tag_label, tag_order)
WHERE countries.slug = 'vietnam'
ON CONFLICT DO NOTHING;
```

**Step 2: Run the migration**

Run: `npx supabase db push` or apply via Supabase dashboard.

**Step 3: Commit**

```bash
git add supabase/migrations/20260205_women_first_tags.sql
git commit -m "feat: add women-first destination tags for safety, comfort, and accommodation"
```

---

## Task 2: Create `discovery_lenses` table

**Files:**
- Create: `supabase/migrations/20260205_discovery_lenses_table.sql`

**Step 1: Write the migration**

```sql
-- supabase/migrations/20260205_discovery_lenses_table.sql
-- Discovery Lenses: women-first entry points for Explore

CREATE TABLE discovery_lenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  helper_text text,
  icon_name text NOT NULL DEFAULT 'compass',

  -- Editorial content for the lens results page
  intro_md text,

  -- Tag-based resolution (same pattern as explore_collections)
  include_tags text[] NOT NULL DEFAULT '{}',
  exclude_tags text[] NOT NULL DEFAULT '{}',
  entity_types text[] NOT NULL DEFAULT '{city}',

  -- Display settings
  sort_by text NOT NULL DEFAULT 'featured_first',
  max_items int NOT NULL DEFAULT 20,

  -- Ordering and visibility
  order_index int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,

  -- Monetization
  is_sponsored boolean NOT NULL DEFAULT false,
  sponsor_name text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_discovery_lenses_order ON discovery_lenses (order_index) WHERE is_active = true;

ALTER TABLE discovery_lenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read discovery lenses"
  ON discovery_lenses FOR SELECT USING (true);
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260205_discovery_lenses_table.sql
git commit -m "feat: create discovery_lenses table"
```

---

## Task 3: Seed the 7 launch lenses

**Files:**
- Create: `supabase/migrations/20260205_seed_discovery_lenses.sql`

**Step 1: Write the seed migration**

```sql
-- supabase/migrations/20260205_seed_discovery_lenses.sql

INSERT INTO discovery_lenses (slug, title, helper_text, icon_name, intro_md, include_tags, exclude_tags, entity_types, order_index)
VALUES
(
  'solo-friendly-first-trip',
  'First solo trip',
  'Places that make your first time easy',
  'sunrise',
  E'Your first solo trip is a big deal — and where you go matters more than you think. These destinations are chosen specifically because they''re easy to navigate alone, have strong communities of solo women travelers, and offer the kind of welcoming infrastructure that lets you focus on the experience rather than the logistics.\n\nEvery city and country here has been vetted for English accessibility, reliable transport, and a proven track record with first-time solo women.',
  '{first_solo_trip,easy_to_navigate,english_widely_spoken}',
  '{}',
  '{country,city}',
  1
),
(
  'female-only-stays',
  'Female-only stays',
  'Dorms and hostels with women-only options',
  'home',
  E'Where you sleep shapes how safe you feel. These destinations have verified female-only accommodation options — from women-only dorm rooms to entire hostels designed for women.\n\nWe check for real female-only policies, not just marketing. Each stay listed here has been confirmed to offer dedicated women-only spaces with proper security measures.',
  '{female_only_stays,women_only_options,women_run}',
  '{}',
  '{city}',
  2
),
(
  'walkable-well-lit',
  'Walkable & well-lit',
  'Neighborhoods safe to explore on foot',
  'sun',
  E'Being able to walk freely — day and night — changes how you experience a place. These neighborhoods and cities are chosen for their well-lit streets, active evening scenes, and the kind of pedestrian infrastructure that means you never feel stuck.\n\nWe look at street lighting, foot traffic patterns, sidewalk quality, and how comfortable solo women report feeling walking after dark.',
  '{walkable_night,walkable_day,well_lit}',
  '{}',
  '{city}',
  3
),
(
  'calm-recharge',
  'Calm places to recharge',
  'Quiet spots when you need a reset',
  'cloud',
  E'Solo travel is exhilarating, but it''s also exhausting. Sometimes you need a place that asks nothing of you — where the pace is gentle, the noise is low, and being alone feels like a luxury, not loneliness.\n\nThese destinations are specifically chosen for their calm energy. Think morning yoga with no schedule, afternoons reading by water, and evenings where silence is the soundtrack.',
  '{quiet,slow_travel,relaxed}',
  '{nightlife_social,lively,fast_paced}',
  '{city}',
  4
),
(
  'easy-transport',
  'Easy to get around',
  'Reliable transport, low friction cities',
  'navigation',
  E'Transportation anxiety is real — especially when you''re alone in a new place. These cities have reliable, safe, and easy-to-use transport systems that work for solo women at any hour.\n\nWe evaluate public transit coverage, ride-sharing availability, walkability, and how easy it is to get from airport to accommodation without stress.',
  '{great_public_transport,reliable_transport,easy_to_navigate}',
  '{}',
  '{city}',
  5
),
(
  'women-traveler-hotspots',
  'Women traveler hotspots',
  'Where solo women already go',
  'users',
  E'There''s something powerful about going where other women have gone before you. These destinations have the strongest concentration of solo women travelers — meaning you''ll find communities, events, and spaces designed with women in mind.\n\nFrom women-run hostels to female-focused group activities, these places make it easy to connect with like-minded travelers.',
  '{strong_solo_community,strong_women_community}',
  '{}',
  '{city,country}',
  6
),
(
  'wellness-retreat',
  'Wellness & retreat',
  'Yoga, spa, meditation destinations',
  'heart',
  E'Solo travel and self-care aren''t separate things — they''re the same thing. These destinations are built around wellness: yoga studios on every corner, meditation retreats that welcome solo women, spa experiences that don''t require a couple''s booking.\n\nEach destination here is vetted for quality wellness offerings, solo-friendly pricing, and the kind of environment where taking care of yourself is the whole point.',
  '{wellness_retreat,spiritual}',
  '{}',
  '{city}',
  7
);
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260205_seed_discovery_lenses.sql
git commit -m "feat: seed 7 women-first discovery lenses"
```

---

## Task 4: Add TypeScript types and API functions for lenses

**Files:**
- Modify: `data/types.ts` (add `DiscoveryLens` type)
- Create: `data/lenses.ts` (lens API functions)

**Step 1: Add `DiscoveryLens` interface to `data/types.ts`**

Add at the bottom of `data/types.ts`, before the closing of the Explore Collections section:

```typescript
// ---------------------------------------------------------------------------
// Discovery Lenses (Women-First)
// ---------------------------------------------------------------------------

export interface DiscoveryLens {
  id: string;
  slug: string;
  title: string;
  helperText: string | null;
  iconName: string;
  introMd: string | null;
  includeTags: string[];
  excludeTags: string[];
  entityTypes: ('country' | 'city' | 'neighborhood')[];
  sortBy: string;
  maxItems: number;
  orderIndex: number;
  isActive: boolean;
  isSponsored: boolean;
  sponsorName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DiscoveryLensWithResults extends DiscoveryLens {
  results: ExploreCollectionItem[];
}
```

**Step 2: Create `data/lenses.ts`**

```typescript
// data/lenses.ts
import { supabase } from '@/lib/supabase';
import { rowsToCamel } from './api';
import type { DiscoveryLens, DiscoveryLensWithResults, ExploreCollectionItem } from './types';

export async function getDiscoveryLenses(): Promise<DiscoveryLens[]> {
  const { data, error } = await supabase
    .from('discovery_lenses')
    .select('*')
    .eq('is_active', true)
    .order('order_index');

  if (error) throw error;
  return rowsToCamel<DiscoveryLens>(data ?? []);
}

export async function getDiscoveryLensBySlug(slug: string): Promise<DiscoveryLens | null> {
  const { data, error } = await supabase
    .from('discovery_lenses')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return rowsToCamel<DiscoveryLens>(data ? [data] : [])[0] ?? null;
}

/**
 * Resolve a lens to its matching entities.
 * Reuses the same tag-based resolution logic as explore_collections.
 */
export async function resolveLensResults(
  lens: DiscoveryLens
): Promise<ExploreCollectionItem[]> {
  // Get entities matching include_tags
  const { data: matches, error: matchError } = await supabase
    .from('destination_tags')
    .select('entity_type, entity_id')
    .in('tag_slug', lens.includeTags)
    .in('entity_type', lens.entityTypes);

  if (matchError) throw matchError;
  if (!matches || matches.length === 0) return [];

  // Deduplicate
  const uniqueEntities = Array.from(
    new Map(matches.map(m => [`${m.entity_type}:${m.entity_id}`, m])).values()
  );

  // Filter out entities with exclude_tags
  let filtered = uniqueEntities;
  if (lens.excludeTags.length > 0) {
    const { data: excluded } = await supabase
      .from('destination_tags')
      .select('entity_type, entity_id')
      .in('tag_slug', lens.excludeTags);

    const excludeSet = new Set(
      (excluded ?? []).map(e => `${e.entity_type}:${e.entity_id}`)
    );
    filtered = uniqueEntities.filter(
      e => !excludeSet.has(`${e.entity_type}:${e.entity_id}`)
    );
  }

  // Fetch entity details
  const countryIds = filtered
    .filter(e => e.entity_type === 'country')
    .map(e => e.entity_id);
  const cityIds = filtered
    .filter(e => e.entity_type === 'city')
    .map(e => e.entity_id);

  const [countries, cities] = await Promise.all([
    countryIds.length > 0
      ? supabase
          .from('countries')
          .select('id, name, slug, hero_image_url, short_blurb, is_featured, order_index, solo_level, safety_rating')
          .in('id', countryIds)
          .eq('is_active', true)
      : { data: [] },
    cityIds.length > 0
      ? supabase
          .from('cities')
          .select('id, name, slug, hero_image_url, short_blurb, is_featured, order_index, country_id')
          .in('id', cityIds)
          .eq('is_active', true)
      : { data: [] },
  ]);

  // Build items
  const items: ExploreCollectionItem[] = [];

  for (const country of countries.data ?? []) {
    items.push({
      collectionId: lens.id,
      collectionSlug: lens.slug,
      entityType: 'country',
      entityId: country.id,
      entityName: country.name,
      entitySlug: country.slug,
      entityImageUrl: country.hero_image_url,
      isFeatured: country.is_featured ?? false,
      orderIndex: country.order_index ?? 0,
    });
  }

  for (const city of cities.data ?? []) {
    items.push({
      collectionId: lens.id,
      collectionSlug: lens.slug,
      entityType: 'city',
      entityId: city.id,
      entityName: city.name,
      entitySlug: city.slug,
      entityImageUrl: city.hero_image_url,
      isFeatured: city.is_featured ?? false,
      orderIndex: city.order_index ?? 0,
    });
  }

  // Sort: featured first, then by order_index
  items.sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
    return a.orderIndex - b.orderIndex;
  });

  return items.slice(0, lens.maxItems);
}

export async function getDiscoveryLensWithResults(
  slug: string
): Promise<DiscoveryLensWithResults | null> {
  const lens = await getDiscoveryLensBySlug(slug);
  if (!lens) return null;

  const results = await resolveLensResults(lens);
  return { ...lens, results };
}
```

**Step 3: Commit**

```bash
git add data/types.ts data/lenses.ts
git commit -m "feat: add DiscoveryLens types and API functions"
```

---

## Task 5: Add `discovery-lenses` feed item type

**Files:**
- Modify: `data/explore/types.ts`
- Modify: `data/explore/feedBuilder.ts`
- Modify: `data/explore/useFeedItems.ts`

**Step 1: Add `discovery-lenses` variant to FeedItem union in `data/explore/types.ts`**

Replace the existing FeedItem type:

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
  | { type: 'editorial-collection'; data: ExploreCollectionWithItems }
  | { type: 'discovery-lenses'; data: DiscoveryLens[] }
  | { type: 'quick-actions' }
  | { type: 'country-pair'; data: [Country, Country] }
  | { type: 'city-spotlight'; data: CityWithCountry; activities: ActivityWithCity[] }
  | { type: 'activity-cluster'; data: ActivityWithCity[]; cityName: string; citySlug: string }
  | { type: 'end-card' };

export type FeedItemType = FeedItem['type'];
```

**Step 2: Update `data/explore/feedBuilder.ts` to insert lenses after the first editorial card (replacing quick-actions position)**

Replace the full feedBuilder content:

```typescript
// data/explore/feedBuilder.ts
import type { Country, ExploreCollectionWithItems, DiscoveryLens } from '../types';
import type {
  FeedItem,
  CityWithCountry,
  ActivityWithCity,
} from './types';

/**
 * Build the Explore feed with rhythmic content interleaving.
 * Pattern: Editorial → Lenses → Quick Actions → Country pair → City spotlight → ...
 */
export function buildFeed(
  collections: ExploreCollectionWithItems[],
  countries: Country[],
  citiesWithActivities: { city: CityWithCountry; activities: ActivityWithCity[] }[],
  lenses: DiscoveryLens[] = [],
): FeedItem[] {
  const feed: FeedItem[] = [];

  let collectionIndex = 0;
  let countryIndex = 0;
  let cityIndex = 0;
  let beat = 0;
  let lensesInserted = false;
  let quickActionsInserted = false;

  // Build ~15-20 items following the rhythm
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
          // Insert discovery lenses after the FIRST editorial card
          if (!lensesInserted && lenses.length > 0) {
            feed.push({ type: 'discovery-lenses', data: lenses });
            lensesInserted = true;
          }
          // Insert quick actions after lenses (or after first editorial if no lenses)
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
        if (collectionIndex < collections.length) {
          feed.push({
            type: 'editorial-collection',
            data: collections[collectionIndex++],
          });
        }
        break;
    }

    // Safety: if we can't add anything, break
    if (
      collectionIndex >= collections.length &&
      countryIndex >= countries.length &&
      cityIndex >= citiesWithActivities.length
    ) {
      break;
    }
  }

  // Fallback: if no editorial was emitted, still insert lenses + quick actions at the top
  if (!lensesInserted && lenses.length > 0) {
    feed.unshift({ type: 'discovery-lenses', data: lenses });
  }
  if (!quickActionsInserted) {
    feed.unshift({ type: 'quick-actions' });
  }

  // Add end card
  feed.push({ type: 'end-card' });

  return feed;
}
```

**Step 3: Update `data/explore/useFeedItems.ts` to fetch lenses**

Replace the full useFeedItems content:

```typescript
// data/explore/useFeedItems.ts
import { useState, useEffect } from 'react';
import {
  getCountries,
  getPopularCities,
  getCountryById,
} from '../api';
import { getFeaturedExploreCollections, getExploreCollectionItems } from '../collections';
import { getDiscoveryLenses } from '../lenses';
import { buildFeed } from './feedBuilder';
import type { ExploreCollectionWithItems, DiscoveryLens } from '../types';
import type { FeedItem, CityWithCountry, ActivityWithCity } from './types';

// Initial feed shown while real data loads (loading placeholder)
const INITIAL_FEED: FeedItem[] = [
  { type: 'end-card' },
];

// Timeout wrapper for API calls
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), ms)
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
  // Start with loading state until we have data
  const [feedItems, setFeedItems] = useState<FeedItem[]>(INITIAL_FEED);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadRealData() {
      setIsLoading(true);
      try {
        // Fetch countries and cities (core feed data)
        const [allCountries, cities] = await withTimeout(
          Promise.all([
            getCountries(),
            getPopularCities(4),
          ]),
          5000
        );

        // Prioritize featured countries (SE Asia) first
        const countries = [...allCountries].sort((a, b) => {
          if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
          return a.orderIndex - b.orderIndex;
        });

        if (cancelled) return;

        // Fetch collections and lenses separately so failures don't break the feed
        let collectionsWithItems: ExploreCollectionWithItems[] = [];
        let lenses: DiscoveryLens[] = [];

        try {
          const featuredCollections = await withTimeout(
            getFeaturedExploreCollections(),
            5000
          );
          if (!cancelled && featuredCollections.length > 0) {
            collectionsWithItems = await withTimeout(
              Promise.all(
                featuredCollections.map(async (collection) => {
                  const items = await getExploreCollectionItems(collection);
                  return { ...collection, items };
                })
              ),
              5000
            );
          }
        } catch (collectionErr) {
          console.log('Collections unavailable:', collectionErr);
        }

        try {
          lenses = await withTimeout(getDiscoveryLenses(), 3000);
        } catch (lensErr) {
          console.log('Discovery lenses unavailable:', lensErr);
        }

        if (cancelled) return;

        // Get unique country IDs and fetch country details
        const countryIds = [...new Set(cities.map(c => c.countryId))];
        const countryResults = await withTimeout(
          Promise.all(countryIds.map(id => getCountryById(id))),
          3000
        );

        if (cancelled) return;

        const countryMap = new Map(
          countryResults.filter(Boolean).map(c => [c!.id, c!])
        );

        // Build cities with country info
        const citiesWithActivities = cities.map((city) => {
          const country = countryMap.get(city.countryId);
          return {
            city: {
              ...city,
              countryName: country?.name ?? '',
              countrySlug: country?.slug ?? '',
            } as CityWithCountry,
            activities: [] as ActivityWithCity[],
          };
        });

        if (cancelled) return;

        // Build full feed with real data
        const feed = buildFeed(collectionsWithItems, countries, citiesWithActivities, lenses);
        setFeedItems(feed);
        if (!cancelled) {
          setIsLoading(false);
        }
      } catch (err) {
        // Core feed data failed — show error
        console.log('Feed API error:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load'));
          setIsLoading(false);
        }
      }
    }

    // Load real data in background (don't block UI)
    loadRealData();

    return () => { cancelled = true; };
  }, [refreshKey]);

  const refresh = () => {
    setError(null);
    setRefreshKey((k) => k + 1);
  };

  return { feedItems, isLoading, error, refresh };
}
```

**Step 4: Commit**

```bash
git add data/explore/types.ts data/explore/feedBuilder.ts data/explore/useFeedItems.ts
git commit -m "feat: add discovery-lenses feed item type and fetch lenses in feed"
```

---

## Task 6: Create DiscoveryLensesSection component

**Files:**
- Create: `components/explore/DiscoveryLensesSection.tsx`

This is the core visual component — premium, calm, confident lens cards that feel like helpful shortcuts, not filter chips.

**Step 1: Write the component**

```typescript
// components/explore/DiscoveryLensesSection.tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius } from '@/constants/design';
import type { DiscoveryLens } from '@/data/types';

const ICON_MAP: Record<string, keyof typeof Feather.glyphMap> = {
  sunrise: 'sunrise',
  home: 'home',
  sun: 'sun',
  cloud: 'cloud',
  navigation: 'navigation',
  users: 'users',
  heart: 'heart',
  compass: 'compass',
};

function LensCard({ lens }: { lens: DiscoveryLens }) {
  const router = useRouter();
  const iconName = ICON_MAP[lens.iconName] ?? 'compass';

  return (
    <Pressable
      style={({ pressed }) => [styles.lensCard, pressed && styles.lensCardPressed]}
      onPress={() => router.push(`/explore/lens/${lens.slug}`)}
      accessibilityRole="button"
      accessibilityLabel={`${lens.title}: ${lens.helperText}`}
    >
      <View style={styles.lensIconContainer}>
        <Feather name={iconName} size={18} color={colors.orange} />
      </View>
      <View style={styles.lensTextContainer}>
        <Text style={styles.lensTitle}>{lens.title}</Text>
        {lens.helperText && (
          <Text style={styles.lensHelper} numberOfLines={1}>{lens.helperText}</Text>
        )}
      </View>
      <Feather name="chevron-right" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

export function DiscoveryLensesSection({ lenses }: { lenses: DiscoveryLens[] }) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>DISCOVER BY WHAT MATTERS</Text>
      <View style={styles.lensesGrid}>
        {lenses.map((lens) => (
          <LensCard key={lens.slug} lens={lens} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.textMuted,
  },
  lensesGrid: {
    gap: spacing.sm,
  },
  lensCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  lensCardPressed: {
    backgroundColor: colors.neutralFill,
  },
  lensIconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lensTextContainer: {
    flex: 1,
  },
  lensTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  lensHelper: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
    lineHeight: 18,
  },
});
```

**Step 2: Commit**

```bash
git add components/explore/DiscoveryLensesSection.tsx
git commit -m "feat: create DiscoveryLensesSection component with premium lens cards"
```

---

## Task 7: Wire DiscoveryLensesSection into Explore feed

**Files:**
- Modify: `app/(tabs)/explore/index.tsx`

**Step 1: Add import for DiscoveryLensesSection**

Add at the top of `app/(tabs)/explore/index.tsx`, after the existing imports:

```typescript
import { DiscoveryLensesSection } from '@/components/explore/DiscoveryLensesSection';
```

**Step 2: Add `discovery-lenses` case to `renderItem`**

In the `renderItem` function, add a new case after `'editorial-collection'`:

```typescript
case 'discovery-lenses':
  return <DiscoveryLensesSection lenses={item.data} />;
```

**Step 3: Add `discovery-lenses` case to `keyExtractor`**

In the `keyExtractor` function:

```typescript
case 'discovery-lenses':
  return 'discovery-lenses';
```

**Step 4: Verify on device**

Run: `npx expo start` — verify discovery lenses section appears after the first editorial card, above quick actions. Each lens card should show icon, title, and helper text. Tapping a lens will navigate to a non-existent screen (we build it next).

**Step 5: Commit**

```bash
git add app/(tabs)/explore/index.tsx
git commit -m "feat: render discovery lenses in Explore feed"
```

---

## Task 8: Create lens results screen

**Files:**
- Create: `app/(tabs)/explore/lens/[slug].tsx`
- Modify: `app/(tabs)/explore/_layout.tsx` (register route)

**Step 1: Create the lens results screen**

```typescript
// app/(tabs)/explore/lens/[slug].tsx
import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { getDiscoveryLensWithResults } from '@/data/lenses';
import type { DiscoveryLensWithResults, ExploreCollectionItem } from '@/data/types';

export default function LensResultsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [lens, setLens] = useState<DiscoveryLensWithResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await getDiscoveryLensWithResults(slug ?? '');
        setLens(result);
      } catch (err) {
        console.error('Failed to load lens:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleItemPress = useCallback((item: ExploreCollectionItem) => {
    if (item.entityType === 'country') {
      router.push(`/explore/country/${item.entitySlug}`);
    } else if (item.entityType === 'city') {
      router.push(`/explore/city/${item.entitySlug}`);
    }
  }, [router]);

  const renderItem = useCallback(({ item }: { item: ExploreCollectionItem }) => (
    <Pressable
      style={({ pressed }) => [styles.resultCard, pressed && styles.resultCardPressed]}
      onPress={() => handleItemPress(item)}
    >
      <Image
        source={{ uri: item.entityImageUrl ?? undefined }}
        style={styles.resultImage}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.resultContent}>
        <Text style={styles.resultName}>{item.entityName}</Text>
        <Text style={styles.resultType}>
          {item.entityType === 'country' ? 'Country' : 'City'}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  ), [handleItemPress]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </Pressable>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!lens) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </Pressable>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>This lens is being updated.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={lens.results}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.entityType}-${item.entityId}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.introSection}>
            <Text style={styles.lensTitle}>{lens.title}</Text>
            {lens.helperText && (
              <Text style={styles.lensHelper}>{lens.helperText}</Text>
            )}
            {lens.introMd && (
              <Text style={styles.introText}>{lens.introMd}</Text>
            )}
            {lens.isSponsored && lens.sponsorName && (
              <View style={styles.sponsorBanner}>
                <Feather name="info" size={12} color={colors.textMuted} />
                <Text style={styles.sponsorText}>
                  Sponsored by {lens.sponsorName}
                </Text>
              </View>
            )}
            <Text style={styles.resultsCount}>
              {lens.results.length} destination{lens.results.length !== 1 ? 's' : ''}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No destinations match this lens yet. Check back soon.
            </Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
  listContent: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.xxxl,
  },
  // Intro section
  introSection: {
    paddingBottom: spacing.xl,
  },
  lensTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 26,
    color: colors.textPrimary,
    lineHeight: 32,
  },
  lensHelper: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  introText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  sponsorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.sm,
  },
  sponsorText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  resultsCount: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Result cards
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  resultCardPressed: {
    opacity: 0.7,
  },
  resultImage: {
    width: 72,
    height: 72,
    borderRadius: radius.card,
    backgroundColor: colors.neutralFill,
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  resultType: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
```

**Step 2: Register the lens route in `app/(tabs)/explore/_layout.tsx`**

Add after the `collection/[slug]` screen:

```typescript
<Stack.Screen name="lens/[slug]" />
```

The full layout becomes:

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
      <Stack.Screen name="lens/[slug]" />
      <Stack.Screen name="activity/[slug]" />
      <Stack.Screen name="place-detail/[id]" />
    </Stack>
  );
}
```

**Step 3: Create the directory for the lens route**

Run: `mkdir -p app/(tabs)/explore/lens`

**Step 4: Commit**

```bash
git add app/(tabs)/explore/lens/[slug].tsx app/(tabs)/explore/_layout.tsx
git commit -m "feat: add lens results screen with editorial intro and entity cards"
```

---

## Task 9: Add PostHog analytics for lens interactions

**Files:**
- Modify: `components/explore/DiscoveryLensesSection.tsx`
- Modify: `app/(tabs)/explore/lens/[slug].tsx`

**Step 1: Add PostHog capture to lens card press in `DiscoveryLensesSection.tsx`**

Import PostHog and add capture to `LensCard`:

```typescript
import { usePostHog } from 'posthog-react-native';
```

Inside `LensCard`, add PostHog:

```typescript
function LensCard({ lens }: { lens: DiscoveryLens }) {
  const router = useRouter();
  const posthog = usePostHog();
  const iconName = ICON_MAP[lens.iconName] ?? 'compass';

  const handlePress = () => {
    posthog.capture('discovery_lens_tapped', {
      lens_slug: lens.slug,
      lens_title: lens.title,
    });
    router.push(`/explore/lens/${lens.slug}`);
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.lensCard, pressed && styles.lensCardPressed]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${lens.title}: ${lens.helperText}`}
    >
      {/* ... rest of component unchanged ... */}
    </Pressable>
  );
}
```

**Step 2: Add PostHog capture to lens result press in `lens/[slug].tsx`**

Import PostHog at the top:

```typescript
import { usePostHog } from 'posthog-react-native';
```

In the component, add PostHog and update `handleItemPress`:

```typescript
const posthog = usePostHog();

const handleItemPress = useCallback((item: ExploreCollectionItem) => {
  posthog.capture('lens_result_tapped', {
    lens_slug: slug,
    entity_type: item.entityType,
    entity_name: item.entityName,
    entity_slug: item.entitySlug,
  });
  if (item.entityType === 'country') {
    router.push(`/explore/country/${item.entitySlug}`);
  } else if (item.entityType === 'city') {
    router.push(`/explore/city/${item.entitySlug}`);
  }
}, [router, posthog, slug]);
```

**Step 3: Commit**

```bash
git add components/explore/DiscoveryLensesSection.tsx app/(tabs)/explore/lens/[slug].tsx
git commit -m "feat: add PostHog analytics for lens interactions"
```

---

## Task 10: Final integration and verification

**Files:**
- Verify: All screens load without errors
- Verify: Navigation works end-to-end
- Verify: Graceful degradation when `discovery_lenses` table doesn't exist

**Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 2: Test full flow on device**

1. Open Explore tab
2. Verify first editorial card appears
3. Verify **Discovery Lenses section** appears below first editorial card with section header "DISCOVER BY WHAT MATTERS"
4. Verify 7 lens cards appear with icons, titles, and helper text
5. Verify Quick Actions row appears below the lenses
6. Tap "First solo trip" lens → lens results screen opens
7. Verify editorial intro text appears
8. Verify matching countries/cities appear as cards
9. Tap a result card → navigates to country/city detail
10. Go back → lenses still visible
11. Verify if `discovery_lenses` table doesn't exist, feed still loads (lenses section just doesn't appear)

**Step 3: Test empty state**

- If a lens has no matching entities, verify "No destinations match this lens yet" message appears
- If all lenses are deactivated, verify feed renders without lenses section

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: complete women-first discovery lenses system"
```

---

## Architecture Decisions

### Why lenses are a separate table (not explore_collections)

Lenses and collections serve different UX purposes:
- **Collections** are editorial content pieces (magazine-style cards with hero images, long intros)
- **Lenses** are functional entry points (compact cards optimized for quick scanning)
- Keeping them separate means we can evolve their schemas independently (e.g., adding lens-specific fields like `safety_level_required` later)
- The underlying resolution engine is shared (same tag-based querying)

### Why lenses don't modify the main feed

When a user taps a lens, they navigate to a dedicated results screen rather than filtering the main feed. This is intentional:
- The main feed is an infinite scroll of mixed content — filtering it would create an awkward partial-content state
- A dedicated lens results screen feels like opening a curated guide, not applying a filter
- It allows the editorial intro text to set context
- Navigation back is clean (just go back)

### Why lens resolution uses the same tag infrastructure as collections

DRY. The `destination_tags` table, the include/exclude tag logic, and the entity resolution are identical. Lenses just present the results differently. This means:
- No schema duplication
- Tags added for collections automatically benefit lenses
- Future tag management UI works for both

### Why 7 lenses (not 5 or 10)

- Fewer than 5: Not enough to cover the range of women's concerns
- More than 8: Creates decision fatigue on first screen
- 7 covers: safety (2: walkable, transport), comfort (2: calm, stays), community (2: first-timers, hotspots), wellness (1)
- Each lens addresses a distinct anxiety or intent — no overlap

### Tag categories for women-first needs

| Category | Applied To | Purpose |
|----------|-----------|---------|
| `accommodation_type` | City | female_only_stays, women_run, mixed |
| `safety_context` | City | well_lit, reliable_transport |
| `social_comfort` | City, Country | strong_women_community, easy_to_meet_people |
| `energy_level` | City | calm, social, mixed |

These categories complement (not replace) the existing ones: `travel_style`, `solo_context`, `vibe`, `budget`, `pace`, `environment`, `safety`.

---

## Summary

This plan delivers:

1. **7 women-first discovery lenses** replacing generic navigation as the primary entry point
2. **Women-specific tag categories** (accommodation_type, safety_context, social_comfort, energy_level) extending the existing tag system
3. **`discovery_lenses` table** with tag-based resolution rules (same engine as collections)
4. **`DiscoveryLensesSection` component** with premium, calm lens cards
5. **Lens results screen** with editorial intros and entity cards
6. **PostHog analytics** for lens interaction tracking
7. **Graceful degradation** — feed works fine if lenses table doesn't exist
8. **Zero hardcoded destinations** — everything is tag-driven and scalable
9. **Monetization-ready** — sponsored lens support built in from day one
10. **10 implementation tasks**, each independently committable

The system answers the three questions without the user asking:
- "Will I feel safe?" → Walkable & well-lit, Easy transport
- "Will I be comfortable alone?" → First solo trip, Calm places to recharge
- "Are there spaces for women like me?" → Female-only stays, Women traveler hotspots
