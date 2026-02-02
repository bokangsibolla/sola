# Schema Cleanup, Tag Expansion & Scalable Content Seeding

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix schema gaps, expand tags/place_types to match the full Explore page vision (from the Structure doc), delete dead mock data, add unique constraints to prevent duplicates, then build a TypeScript seed script that can populate all Southeast Asian countries with 5-10 curated places per city -- scalably and idempotently.

**Architecture:** Schema migration adds missing columns, constraints, place types, and tags. A new `scripts/seed.ts` reads structured content from `scripts/content/*.ts` data files, generates deterministic UUIDs client-side, and upserts into Supabase via the JS client. Deterministic UUIDs (`uuid5(namespace, key)`) guarantee re-runs never duplicate. `ON CONFLICT` upserts on every insert.

**Tech Stack:** Supabase (Postgres), TypeScript, `uuid` npm package, `tsx` runner, Supabase JS client.

---

## Summary of Changes

### What the Structure doc tells us we need but don't have:

**Place types missing from schema CHECK constraint:**
- `club`, `rooftop`, `spa`, `salon`, `gym`, `laundry`, `pharmacy`, `clinic`, `atm`, `police`, `tour`

**Place categories missing:**
- Nightlife subcategories (bar-cocktail, club, rooftop)
- Practical & Daily Life (laundry, clinic, pharmacy, coworking, ATM, police)
- Wellness & Beauty (massage, spa, hair-salon, nails, facial, gym, fitness)
- Tourism & Activities (sightseeing, culture-history, nature, city-tour, adventure)

**Tag groups / tags missing (from doc's filter system):**
- **good_for:** `solo-dining`, `recovery`, `self-care-day`, `stress-relief`, `learning-culture`, `relax-chill`, `active-day`, `dancing`, `drinks-conversation`, `sunset-views`
- **safety:** `female-friendly-crowd`, `secure-entrance`, `staff-presence`, `24-7`, `english-speaking-staff`
- **vibe:** `cozy`, `trendy`, `scenic`, `beachfront`, `nature`, `city`
- **amenity:** `private-bathroom`, `kitchen`, `common-space`, `dance-floor`, `outdoor-area`, `smoking-area`, `bed-curtains`, `rooftop`
- **cuisine (new group):** `filipino`, `international`, `breakfast-brunch`, `vegetarian-friendly`, `vegan-option`, `gluten-free`
- **music (new group):** `dj-electronic`, `live-music`, `pop-commercial`, `hiphop-rnb`
- **physical_level (new group):** `easy`, `moderate`, `challenging`

**Geo content needs new columns** for the "at a glance" section:
- `internet_quality`, `english_friendliness`, `solo_level` (beginner/intermediate/expert)
- `good_for_interests` (text[] linking to MySola profile interests)
- `getting_there_md`, `visa_entry_md`, `sim_connectivity_md`, `money_md`, `culture_etiquette_md`, `safety_women_md` (tabbed content sections for country pages)
- `transport_md`, `top_things_to_do` (for city pages)

**Missing unique constraints:**
- `geo_content(country_id)` WHERE scope = 'country'
- `geo_content(city_id)` WHERE scope = 'city'

**Missing `updated_at` auto-trigger.**

---

## Task 1: Delete mock data directory

**Files:**
- Delete: `data/mock/` (entire directory -- 16 files)

**Step 1: Verify no imports exist**

Run: `grep -r "data/mock" --include="*.ts" --include="*.tsx" app/ components/ hooks/ state/ lib/`
Expected: No matches (already confirmed)

**Step 2: Delete the directory**

```bash
rm -rf data/mock
```

**Step 3: Commit**

```bash
git add -A data/mock
git commit -m "chore: remove unused mock data directory"
```

---

## Task 2: Schema migration -- new place types, constraints, triggers, geo_content columns

**Files:**
- Create: `supabase/migrations/00002_schema_v2.sql`

**Step 1: Write the migration**

```sql
-- =====================================================================
-- Migration 00002: Schema v2
-- Expands place_type enum, adds unique constraints, updated_at trigger,
-- and new geo_content columns for the full Explore page structure.
-- =====================================================================

-- ---------------------------------------------------------------------------
-- 1. Expand place_type CHECK constraint
-- ---------------------------------------------------------------------------
ALTER TABLE places DROP CONSTRAINT IF EXISTS places_place_type_check;
ALTER TABLE places ADD CONSTRAINT places_place_type_check CHECK (place_type IN (
  'hotel', 'hostel', 'homestay', 'restaurant', 'cafe', 'bakery', 'bar', 'club', 'rooftop',
  'activity', 'coworking', 'landmark', 'transport', 'shop',
  'wellness', 'spa', 'salon', 'gym',
  'laundry', 'pharmacy', 'clinic', 'atm', 'police', 'tour'
));

-- ---------------------------------------------------------------------------
-- 2. Unique constraints on geo_content to prevent duplicates
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_geo_content_country
  ON geo_content(country_id) WHERE scope = 'country' AND country_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_geo_content_city
  ON geo_content(city_id) WHERE scope = 'city' AND city_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 3. Auto-update updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'countries','cities','city_areas','places','profiles','geo_content'
    ])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_updated_at ON %I; CREATE TRIGGER trg_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at();',
      t, t
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 4. New geo_content columns for country "at a glance" + tabbed sections
-- ---------------------------------------------------------------------------
ALTER TABLE geo_content
  ADD COLUMN IF NOT EXISTS internet_quality text CHECK (internet_quality IN ('excellent', 'good', 'fair', 'poor')),
  ADD COLUMN IF NOT EXISTS english_friendliness text CHECK (english_friendliness IN ('high', 'moderate', 'low')),
  ADD COLUMN IF NOT EXISTS solo_level text CHECK (solo_level IN ('beginner', 'intermediate', 'expert')),
  ADD COLUMN IF NOT EXISTS good_for_interests text[] DEFAULT '{}',
  -- Country tabbed sections
  ADD COLUMN IF NOT EXISTS getting_there_md text,
  ADD COLUMN IF NOT EXISTS visa_entry_md text,
  ADD COLUMN IF NOT EXISTS sim_connectivity_md text,
  ADD COLUMN IF NOT EXISTS money_md text,
  ADD COLUMN IF NOT EXISTS culture_etiquette_md text,
  ADD COLUMN IF NOT EXISTS safety_women_md text,
  -- City sections
  ADD COLUMN IF NOT EXISTS transport_md text,
  ADD COLUMN IF NOT EXISTS top_things_to_do text[] DEFAULT '{}';

-- ---------------------------------------------------------------------------
-- 5. Expand tag filter_group CHECK to include new groups
-- ---------------------------------------------------------------------------
ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_filter_group_check;
ALTER TABLE tags ADD CONSTRAINT tags_filter_group_check CHECK (filter_group IN (
  'vibe', 'good_for', 'amenity', 'safety', 'cuisine', 'style', 'music', 'physical_level', 'diet'
));
```

**Step 2: Run migration against Supabase**

Run in Supabase SQL Editor or:
```bash
supabase db push
```

**Step 3: Commit**

```bash
git add supabase/migrations/00002_schema_v2.sql
git commit -m "feat: schema v2 -- expanded place types, unique constraints, geo_content columns, updated_at trigger"
```

---

## Task 3: Update TypeScript types to match new schema

**Files:**
- Modify: `data/types.ts`

**Step 1: Update Place.placeType union**

In `data/types.ts`, update the `placeType` field on the `Place` interface:

```typescript
placeType:
  | 'hotel' | 'hostel' | 'homestay'
  | 'restaurant' | 'cafe' | 'bakery' | 'bar' | 'club' | 'rooftop'
  | 'activity' | 'coworking' | 'landmark' | 'transport' | 'shop'
  | 'wellness' | 'spa' | 'salon' | 'gym'
  | 'laundry' | 'pharmacy' | 'clinic' | 'atm' | 'police' | 'tour';
```

**Step 2: Update Tag.filterGroup union**

```typescript
filterGroup: 'vibe' | 'good_for' | 'amenity' | 'safety' | 'cuisine' | 'style' | 'music' | 'physical_level' | 'diet';
```

**Step 3: Update GeoContent interface -- add new fields**

```typescript
export interface GeoContent {
  // ... existing fields ...
  internetQuality: 'excellent' | 'good' | 'fair' | 'poor' | null;
  englishFriendliness: 'high' | 'moderate' | 'low' | null;
  soloLevel: 'beginner' | 'intermediate' | 'expert' | null;
  goodForInterests: string[];
  gettingThereMd: string | null;
  visaEntryMd: string | null;
  simConnectivityMd: string | null;
  moneyMd: string | null;
  cultureEtiquetteMd: string | null;
  safetyWomenMd: string | null;
  transportMd: string | null;
  topThingsToDo: string[];
}
```

**Step 4: Commit**

```bash
git add data/types.ts
git commit -m "feat: update types for schema v2 -- new place types, tag groups, geo_content fields"
```

---

## Task 4: Seed script infrastructure

**Files:**
- Create: `scripts/seed.ts` (main runner)
- Create: `scripts/seed-utils.ts` (UUID generation + upsert helpers)
- Create: `scripts/tsconfig.json`

**Step 1: Install dependencies**

```bash
npm install --save-dev uuid tsx dotenv
npm install --save-dev @types/uuid
```

**Step 2: Create `scripts/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "paths": { "@/*": ["../"] }
  },
  "include": ["./**/*.ts"]
}
```

**Step 3: Create `scripts/seed-utils.ts`**

```typescript
import { v5 as uuidv5 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Same namespace as PostgreSQL's uuid_ns_url() -- ensures IDs match between SQL and TS
const UUID_NS_URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

/** Generate a deterministic UUID from a key string. Matches uuid_generate_v5(uuid_ns_url(), key) in Postgres. */
export function did(key: string): string {
  return uuidv5(key, UUID_NS_URL);
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
);

/**
 * Upsert rows into a table. Uses ON CONFLICT on the specified column(s).
 * Logs progress. Chunks into batches of 500.
 */
export async function upsertBatch<T extends Record<string, unknown>>(
  table: string,
  rows: T[],
  conflictColumns: string,
): Promise<void> {
  const BATCH = 500;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from(table)
      .upsert(batch, { onConflict: conflictColumns, ignoreDuplicates: false });
    if (error) {
      console.error(`[${table}] batch ${i / BATCH + 1} FAILED:`, error.message);
      throw error;
    }
  }
  console.log(`  ✓ ${table}: ${rows.length} rows upserted`);
}
```

**Step 4: Create `scripts/seed.ts`**

```typescript
import 'dotenv/config';

async function main() {
  console.log('Seeding Sola database...\n');

  // Import content modules in dependency order
  const { seedCountries } = await import('./content/countries');
  const { seedCities } = await import('./content/cities');
  const { seedCityAreas } = await import('./content/city-areas');
  const { seedPlaceCategories } = await import('./content/place-categories');
  const { seedTagGroups } = await import('./content/tag-groups');
  const { seedTags } = await import('./content/tags');
  const { seedPlaces } = await import('./content/places');
  const { seedPlaceMedia } = await import('./content/place-media');
  const { seedPlaceTags } = await import('./content/place-tags');
  const { seedGeoContent } = await import('./content/geo-content');

  await seedCountries();
  await seedCities();
  await seedCityAreas();
  await seedPlaceCategories();
  await seedTagGroups();
  await seedTags();
  await seedPlaces();
  await seedPlaceMedia();
  await seedPlaceTags();
  await seedGeoContent();

  console.log('\nDone!');
}

main().catch((e) => { console.error(e); process.exit(1); });
```

**Step 5: Add npm script to `package.json`**

```json
"scripts": {
  "seed": "tsx scripts/seed.ts"
}
```

**Step 6: Commit**

```bash
git add scripts/ package.json package-lock.json
git commit -m "feat: add TypeScript seed script infrastructure with deterministic UUIDs and upsert helpers"
```

---

## Task 5: Content data files -- countries (all SE Asia)

**Files:**
- Create: `scripts/content/countries.ts`

**Step 1: Write the content file**

Countries to seed (all SE Asia + existing non-SE-Asia countries retained):

| Country | ISO2 | Notes |
|---------|------|-------|
| Thailand | TH | Already exists |
| Vietnam | VN | Already exists |
| Indonesia | ID | Already exists |
| Philippines | PH | Already exists |
| Malaysia | MY | NEW |
| Singapore | SG | NEW |
| Cambodia | KH | NEW |
| Laos | LA | NEW |
| Myanmar | MM | NEW |
| Japan | JP | Keep (existing) |
| Portugal | PT | Keep (existing) |
| Morocco | MA | Keep (existing) |

```typescript
import { did, upsertBatch } from '../seed-utils';

const countries = [
  { key: 'country-th', slug: 'thailand', name: 'Thailand', iso2: 'TH', iso3: 'THA', currency: 'THB', order: 1, hero: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800' },
  { key: 'country-vn', slug: 'vietnam', name: 'Vietnam', iso2: 'VN', iso3: 'VNM', currency: 'VND', order: 2, hero: 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=800' },
  { key: 'country-id', slug: 'indonesia', name: 'Indonesia', iso2: 'ID', iso3: 'IDN', currency: 'IDR', order: 3, hero: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800' },
  { key: 'country-ph', slug: 'philippines', name: 'Philippines', iso2: 'PH', iso3: 'PHL', currency: 'PHP', order: 4, hero: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800' },
  { key: 'country-my', slug: 'malaysia', name: 'Malaysia', iso2: 'MY', iso3: 'MYS', currency: 'MYR', order: 5, hero: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800' },
  { key: 'country-sg', slug: 'singapore', name: 'Singapore', iso2: 'SG', iso3: 'SGP', currency: 'SGD', order: 6, hero: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800' },
  { key: 'country-kh', slug: 'cambodia', name: 'Cambodia', iso2: 'KH', iso3: 'KHM', currency: 'USD', order: 7, hero: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800' },
  { key: 'country-la', slug: 'laos', name: 'Laos', iso2: 'LA', iso3: 'LAO', currency: 'LAK', order: 8, hero: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800' },
  { key: 'country-mm', slug: 'myanmar', name: 'Myanmar', iso2: 'MM', iso3: 'MMR', currency: 'MMK', order: 9, hero: 'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=800' },
  { key: 'country-jp', slug: 'japan', name: 'Japan', iso2: 'JP', iso3: 'JPN', currency: 'JPY', order: 10, hero: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800' },
  { key: 'country-pt', slug: 'portugal', name: 'Portugal', iso2: 'PT', iso3: 'PRT', currency: 'EUR', order: 11, hero: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800' },
  { key: 'country-ma', slug: 'morocco', name: 'Morocco', iso2: 'MA', iso3: 'MAR', currency: 'MAD', order: 12, hero: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800' },
];

export async function seedCountries() {
  const rows = countries.map((c) => ({
    id: did(c.key),
    slug: c.slug,
    name: c.name,
    iso2: c.iso2,
    iso3: c.iso3,
    currency_code: c.currency,
    is_active: true,
    order_index: c.order,
    hero_image_url: c.hero,
  }));
  await upsertBatch('countries', rows, 'id');
}
```

Each subsequent content file (cities, city-areas, places, etc.) follows this exact pattern. The key insight is: **the `did('key')` function generates the same UUID every time for the same key, matching the Postgres `uuid_generate_v5` output.** Foreign keys are just `did('parent-key')`.

**Step 2: Commit**

```bash
git add scripts/content/countries.ts
git commit -m "feat: add countries content data -- all SE Asia + existing"
```

---

## Task 6: Content data files -- cities (3-5 per new country)

**Files:**
- Create: `scripts/content/cities.ts`

Cities for the new SE Asian countries:

**Malaysia (5):** Kuala Lumpur, Penang, Langkawi, Malacca, Kota Kinabalu
**Singapore (1):** Singapore (city-state)
**Cambodia (4):** Siem Reap, Phnom Penh, Kampot, Koh Rong
**Laos (3):** Luang Prabang, Vientiane, Vang Vieng
**Myanmar (3):** Bagan, Yangon, Inle Lake

Plus all existing cities from current seed.sql (28 cities kept as-is).

Same pattern as Task 5. Each city row references `did('country-xx')` for the FK.

**Step 1: Write `scripts/content/cities.ts`**

(Same structure as countries.ts -- array of city objects with key, slug, name, countryKey, timezone, lat, lng, order, hero)

**Step 2: Commit**

---

## Task 7: Content data files -- city areas, place categories, tag groups, tags

**Files:**
- Create: `scripts/content/city-areas.ts`
- Create: `scripts/content/place-categories.ts`
- Create: `scripts/content/tag-groups.ts`
- Create: `scripts/content/tags.ts`

**Place categories to seed (expanded from doc):**

| Slug | Name | Icon |
|------|------|------|
| stay | Stay | bed-outline |
| eat-drink | Eat & Drink | restaurant-outline |
| cafe | Cafe | cafe-outline |
| nightlife | Nightlife | moon-outline |
| activity | Tourism & Activities | compass-outline |
| coworking | Coworking | laptop-outline |
| wellness | Wellness & Beauty | leaf-outline |
| landmark | Landmark | flag-outline |
| practical | Practical & Daily Life | briefcase-outline |

**Tag groups to seed (expanded):**

| Slug | Label |
|------|-------|
| vibe | Vibe |
| good-for | Good for |
| safety-comfort | Safety & Comfort |
| amenities | Amenities |
| cuisine | Cuisine & Diet |
| music | Music |
| physical-level | Physical Level |

**Tags: ~50+ tags** across all groups (full list from the doc's filter systems for stay, eat, nightlife, activities, wellness pages).

**Step 1: Write each content file following the pattern from Task 5**

**Step 2: Commit each**

---

## Task 8: Content data files -- places (5-10 per city, ~200+ total)

**Files:**
- Create: `scripts/content/places.ts` (or split by country: `scripts/content/places/thailand.ts`, etc.)

**Place selection criteria (from the Structure doc):**
- Every city gets at minimum: 1 stay, 1 eat, 1 cafe, 1 activity
- Prioritize: solo-friendly, women-safe, well-reviewed, real places
- Include a mix of budget levels (1-4)
- Include practical places for bigger cities (pharmacy, laundry, etc.)
- Each place needs: name, slug, type, category, lat/lng, address, price_level, hours, description (solo-woman perspective)

**Key per place:** `place-{city_code}-{slug}` e.g. `place-kl-reggae-mansion`

**Step 1: Write place data files**

Recommend splitting by country for maintainability:
```
scripts/content/places/
  thailand.ts
  vietnam.ts
  indonesia.ts
  philippines.ts
  malaysia.ts
  singapore.ts
  cambodia.ts
  laos.ts
  myanmar.ts
  japan.ts
  portugal.ts
  morocco.ts
  index.ts  (re-exports all)
```

**Step 2: Commit**

---

## Task 9: Content data files -- place media (1-2 images per place)

**Files:**
- Create: `scripts/content/place-media.ts`

**Image sourcing strategy:**
- Use Unsplash for editorial images (free, high quality, no attribution needed in apps)
- Each image URL uses `?w=800` for consistent sizing
- Key pattern: `pm-{place_key}-{index}` e.g. `pm-place-kl-reggae-1`
- Every place MUST have at least 1 image (hero)
- Aim for 2 images per featured place

**Step 1: Write place-media data**

**Step 2: Commit**

---

## Task 10: Content data files -- place tags (3-5 tags per place)

**Files:**
- Create: `scripts/content/place-tags.ts`

**Tagging rules:**
- Every stay: at least `solo-friendly` + 1 safety tag + 1 amenity tag
- Every cafe: at least 1 vibe tag + `fast-wifi` if applicable
- Every nightlife venue: at least 1 safety tag + 1 vibe tag
- Every activity: at least 1 `good_for` tag + 1 `physical_level` tag
- Conflict column for upsert: `place_id,tag_id` (composite PK)

**Step 1: Write place-tags data**

**Step 2: Commit**

---

## Task 11: Content data files -- geo content (all countries + all cities)

**Files:**
- Create: `scripts/content/geo-content.ts`

Every country gets: title, subtitle, summary, safety_rating, solo_friendly, best_months, currency, language, visa_note, highlights[], internet_quality, english_friendliness, solo_level, good_for_interests[], getting_there_md, visa_entry_md, sim_connectivity_md, money_md, culture_etiquette_md, safety_women_md.

Every city gets: title, subtitle, summary, safety_rating, solo_friendly, best_months, highlights[], internet_quality, english_friendliness, solo_level, good_for_interests[], transport_md, safety_women_md, top_things_to_do[].

**Step 1: Write geo-content data**

**Step 2: Commit**

---

## Task 12: Fix search SQL injection risk in api.ts

**Files:**
- Modify: `data/api.ts`

**Step 1: Escape special ilike characters in search functions**

Add helper:
```typescript
function escapeIlike(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&');
}
```

Update `searchDestinations` and `searchPlaces` to use `escapeIlike(q)` in ilike patterns.

**Step 2: Commit**

```bash
git add data/api.ts
git commit -m "fix: escape ilike special chars in search queries"
```

---

## Task 13: Run seed script end-to-end, verify

**Step 1: Run the seed**

```bash
npm run seed
```

Expected output:
```
Seeding Sola database...

  ✓ countries: 12 rows upserted
  ✓ cities: 44 rows upserted
  ✓ city_areas: 50+ rows upserted
  ✓ place_categories: 9 rows upserted
  ✓ tag_groups: 7 rows upserted
  ✓ tags: 50+ rows upserted
  ✓ places: 200+ rows upserted
  ✓ place_media: 200+ rows upserted
  ✓ place_tags: 600+ rows upserted
  ✓ geo_content: 56+ rows upserted

Done!
```

**Step 2: Run seed AGAIN to verify idempotency**

```bash
npm run seed
```

Expected: Same output, no errors, no duplicate rows.

**Step 3: Verify in Supabase dashboard**

- Check row counts match
- Spot-check FK integrity (places reference valid cities)
- Verify geo_content unique constraint works (try inserting duplicate)

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: seed all SE Asia content -- 12 countries, 44 cities, 200+ places with tags, media, and geo content"
```

---

## Execution Order Summary

| Task | Description | Depends On |
|------|-------------|------------|
| 1 | Delete mock data | None |
| 2 | Schema migration v2 | None |
| 3 | Update TS types | Task 2 |
| 4 | Seed script infrastructure | None |
| 5 | Countries content | Task 4 |
| 6 | Cities content | Task 5 |
| 7 | Areas, categories, tag groups, tags | Task 6 |
| 8 | Places content | Task 7 |
| 9 | Place media | Task 8 |
| 10 | Place tags | Task 8 |
| 11 | Geo content | Task 6 |
| 12 | Fix search injection | None |
| 13 | Run + verify | All above |

Tasks 1, 2, 4, 12 can run in parallel. Tasks 5-11 are sequential (FK dependencies).
