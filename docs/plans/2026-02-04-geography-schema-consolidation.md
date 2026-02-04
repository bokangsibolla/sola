# Geography Schema Consolidation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Consolidate the geography data model to achieve canonical, minimal tables while properly connecting onboarding to the geography system.

**Architecture:** The current schema has 6 geography-related tables: `countries`, `cities`, `city_areas`, `geo_content`, `destination_tags`, and `places`. The Content Graph document defines a clear hierarchy: Country → Place (city/island/region) → Area (neighborhood/town) → Stays/Activities. Currently, some data is split across tables (geo_content duplicates country/city metadata) and onboarding doesn't persist trip destination to geography tables. We'll consolidate by merging geo_content columns into their parent tables and ensuring onboarding creates proper trip records linked to city_id.

**Tech Stack:** Supabase (Postgres), TypeScript, React Native/Expo

---

## Current State Analysis

### Tables Involved

| Table | Records | Purpose | Issues |
|-------|---------|---------|--------|
| `countries` | 12 | Country master data | Missing rich content fields, duplicated in geo_content |
| `cities` | 44 | City master data | Missing rich content fields, duplicated in geo_content |
| `city_areas` | 146 | Neighborhoods within cities | ✓ Clean, well-structured |
| `geo_content` | 66 | Editorial content for countries/cities | **REDUNDANT** - scope-based FK is awkward, content should live on parent |
| `destination_tags` | ~200 | Entity-agnostic tagging | Polymorphic FK is awkward but functional |
| `places` | 575 | Points of interest | ✓ Clean, links to city/city_area |

### Content Graph Document Requirements

The Content Graph defines:
1. **Country Guide** - "Should I go to this country?" → visa, money, connectivity, culture, safety
2. **Place Guide** - "What is this place like?" → orientation, areas, things to do
3. **Area/Neighborhood Guide** - "Where should I stay?" → who it suits, what's nearby
4. **Stay/Activity Pages** - "Should I book this?" → details, booking

**Key rule:** "A thing should live once, then appear everywhere via links."

### Onboarding Gaps

Currently collected but NOT persisted:
- `tripDestination` (string) → Should become `trips.destination_city_id`
- `tripArriving` (date) → Should become `trips.arriving`
- `tripLeaving` (date) → Should become `trips.leaving`

---

## Consolidation Strategy

### Option A: Merge geo_content INTO countries/cities (RECOMMENDED)

**Pros:**
- One table per entity = canonical
- No scope-based polymorphic FK
- Simpler queries (no JOIN to get country content)
- Aligns with Content Graph's "thing lives once" principle

**Cons:**
- Wide tables (~20 columns for content)
- Migration requires data transfer

### Option B: Keep geo_content, add proper FK constraints

**Pros:**
- Separates "master data" from "editorial content"
- Less migration work

**Cons:**
- Still 2 tables per concept (country + country_content)
- Scope-based FK remains awkward
- Doesn't reduce table count

**Decision: Option A** - Merge content into parent tables.

---

## Task 1: Audit geo_content columns to merge

**Files:**
- Read: `supabase/migrations/00001_initial_schema.sql`
- Read: `supabase/migrations/00002_schema_v2.sql`

**Step 1: List all geo_content columns**

Current geo_content columns:
```
id, scope, country_id, city_id, updated_by,
title, subtitle, summary, content_md, hero_image_url,
safety_rating, solo_friendly, best_months, currency, language, visa_note,
internet_quality, english_friendliness, solo_level, good_for_interests, highlights,
getting_there_md, visa_entry_md, sim_connectivity_md, money_md,
culture_etiquette_md, safety_women_md, transport_md, top_things_to_do,
portrait_md, best_for, badge_label,
published_at, created_at, updated_at
```

**Step 2: Determine which columns apply to countries vs cities**

| Column | Countries | Cities | Notes |
|--------|-----------|--------|-------|
| title, subtitle, summary | ✓ | ✓ | Move to both |
| hero_image_url | Already exists | Already exists | Skip |
| safety_rating, solo_friendly | ✓ | ✓ | Move to both |
| best_months | ✓ | ✓ | Move to both |
| currency, language | ✓ | ✗ | Country-only (city inherits) |
| visa_note, visa_entry_md | ✓ | ✗ | Country-only |
| internet_quality, english_friendliness | ✓ | ✓ | Move to both |
| solo_level | ✓ | ✓ | Move to both |
| good_for_interests, highlights | ✓ | ✓ | Move to both |
| getting_there_md | ✓ | ✗ | Country-only |
| sim_connectivity_md, money_md | ✓ | ✗ | Country-only (city inherits) |
| culture_etiquette_md, safety_women_md | ✓ | ✓ | Both (city can override) |
| transport_md, top_things_to_do | ✗ | ✓ | City-only |
| portrait_md, best_for | ✓ | ✓ | Move to both |

**Step 3: Verify no production data loss**

Run in Supabase SQL Editor:
```sql
SELECT scope, count(*) FROM geo_content GROUP BY scope;
-- Should show: country=12, city=54
```

**Step 4: Commit plan confirmation**

No code changes yet - this is analysis only.

---

## Task 2: Create migration to add content columns to countries table

**Files:**
- Create: `supabase/migrations/00020_merge_geocontent_to_countries.sql`

**Step 1: Write the migration**

```sql
-- =====================================================================
-- Migration 00020: Merge geo_content columns into countries table
-- =====================================================================

-- Add content columns to countries
ALTER TABLE countries
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS subtitle text,
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS content_md text,
  ADD COLUMN IF NOT EXISTS safety_rating text CHECK (safety_rating IN ('very_safe', 'generally_safe', 'use_caution', 'exercise_caution')),
  ADD COLUMN IF NOT EXISTS solo_friendly boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS best_months text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS language text,
  ADD COLUMN IF NOT EXISTS visa_note text,
  ADD COLUMN IF NOT EXISTS internet_quality text CHECK (internet_quality IN ('excellent', 'good', 'fair', 'poor')),
  ADD COLUMN IF NOT EXISTS english_friendliness text CHECK (english_friendliness IN ('high', 'moderate', 'low')),
  ADD COLUMN IF NOT EXISTS solo_level text CHECK (solo_level IN ('beginner', 'intermediate', 'expert')),
  ADD COLUMN IF NOT EXISTS good_for_interests text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS highlights text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS getting_there_md text,
  ADD COLUMN IF NOT EXISTS visa_entry_md text,
  ADD COLUMN IF NOT EXISTS sim_connectivity_md text,
  ADD COLUMN IF NOT EXISTS money_md text,
  ADD COLUMN IF NOT EXISTS culture_etiquette_md text,
  ADD COLUMN IF NOT EXISTS safety_women_md text,
  ADD COLUMN IF NOT EXISTS portrait_md text,
  ADD COLUMN IF NOT EXISTS best_for text,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- Migrate data from geo_content where scope = 'country'
UPDATE countries c
SET
  title = gc.title,
  subtitle = gc.subtitle,
  summary = gc.summary,
  content_md = gc.content_md,
  safety_rating = gc.safety_rating,
  solo_friendly = gc.solo_friendly,
  best_months = gc.best_months,
  language = gc.language,
  visa_note = gc.visa_note,
  internet_quality = gc.internet_quality,
  english_friendliness = gc.english_friendliness,
  solo_level = gc.solo_level,
  good_for_interests = gc.good_for_interests,
  highlights = gc.highlights,
  getting_there_md = gc.getting_there_md,
  visa_entry_md = gc.visa_entry_md,
  sim_connectivity_md = gc.sim_connectivity_md,
  money_md = gc.money_md,
  culture_etiquette_md = gc.culture_etiquette_md,
  safety_women_md = gc.safety_women_md,
  portrait_md = gc.portrait_md,
  best_for = gc.best_for,
  published_at = gc.published_at
FROM geo_content gc
WHERE gc.scope = 'country' AND gc.country_id = c.id;
```

**Step 2: Commit**

```bash
git add supabase/migrations/00020_merge_geocontent_to_countries.sql
git commit -m "feat: add content columns to countries table, migrate from geo_content"
```

---

## Task 3: Create migration to add content columns to cities table

**Files:**
- Create: `supabase/migrations/00021_merge_geocontent_to_cities.sql`

**Step 1: Write the migration**

```sql
-- =====================================================================
-- Migration 00021: Merge geo_content columns into cities table
-- =====================================================================

-- Add content columns to cities
ALTER TABLE cities
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS subtitle text,
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS content_md text,
  ADD COLUMN IF NOT EXISTS safety_rating text CHECK (safety_rating IN ('very_safe', 'generally_safe', 'use_caution', 'exercise_caution')),
  ADD COLUMN IF NOT EXISTS solo_friendly boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS best_months text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS internet_quality text CHECK (internet_quality IN ('excellent', 'good', 'fair', 'poor')),
  ADD COLUMN IF NOT EXISTS english_friendliness text CHECK (english_friendliness IN ('high', 'moderate', 'low')),
  ADD COLUMN IF NOT EXISTS solo_level text CHECK (solo_level IN ('beginner', 'intermediate', 'expert')),
  ADD COLUMN IF NOT EXISTS good_for_interests text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS highlights text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS culture_etiquette_md text,
  ADD COLUMN IF NOT EXISTS safety_women_md text,
  ADD COLUMN IF NOT EXISTS transport_md text,
  ADD COLUMN IF NOT EXISTS top_things_to_do text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS portrait_md text,
  ADD COLUMN IF NOT EXISTS best_for text,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- Migrate data from geo_content where scope = 'city'
UPDATE cities c
SET
  title = gc.title,
  subtitle = gc.subtitle,
  summary = gc.summary,
  content_md = gc.content_md,
  safety_rating = gc.safety_rating,
  solo_friendly = gc.solo_friendly,
  best_months = gc.best_months,
  internet_quality = gc.internet_quality,
  english_friendliness = gc.english_friendliness,
  solo_level = gc.solo_level,
  good_for_interests = gc.good_for_interests,
  highlights = gc.highlights,
  culture_etiquette_md = gc.culture_etiquette_md,
  safety_women_md = gc.safety_women_md,
  transport_md = gc.transport_md,
  top_things_to_do = gc.top_things_to_do,
  portrait_md = gc.portrait_md,
  best_for = gc.best_for,
  published_at = gc.published_at
FROM geo_content gc
WHERE gc.scope = 'city' AND gc.city_id = c.id;
```

**Step 2: Commit**

```bash
git add supabase/migrations/00021_merge_geocontent_to_cities.sql
git commit -m "feat: add content columns to cities table, migrate from geo_content"
```

---

## Task 4: Update TypeScript types for consolidated schema

**Files:**
- Modify: `data/types.ts`

**Step 1: Add content fields to Country interface**

Find the `Country` interface and add after `updatedAt`:

```typescript
export interface Country {
  id: string;
  slug: string;
  name: string;
  iso2: string;
  iso3: string | null;
  currencyCode: string | null;
  isActive: boolean;
  orderIndex: number;
  heroImageUrl: string | null;
  shortBlurb: string | null;
  badgeLabel: string | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  // Content fields (merged from geo_content)
  title: string | null;
  subtitle: string | null;
  summary: string | null;
  contentMd: string | null;
  safetyRating: 'very_safe' | 'generally_safe' | 'use_caution' | 'exercise_caution' | null;
  soloFriendly: boolean;
  bestMonths: string[];
  language: string | null;
  visaNote: string | null;
  internetQuality: 'excellent' | 'good' | 'fair' | 'poor' | null;
  englishFriendliness: 'high' | 'moderate' | 'low' | null;
  soloLevel: 'beginner' | 'intermediate' | 'expert' | null;
  goodForInterests: string[];
  highlights: string[];
  gettingThereMd: string | null;
  visaEntryMd: string | null;
  simConnectivityMd: string | null;
  moneyMd: string | null;
  cultureEtiquetteMd: string | null;
  safetyWomenMd: string | null;
  portraitMd: string | null;
  bestFor: string | null;
  publishedAt: string | null;
}
```

**Step 2: Add content fields to City interface**

```typescript
export interface City {
  id: string;
  countryId: string;
  slug: string;
  name: string;
  timezone: string;
  centerLat: number | null;
  centerLng: number | null;
  isActive: boolean;
  orderIndex: number;
  heroImageUrl: string | null;
  shortBlurb: string | null;
  badgeLabel: string | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  // Content fields (merged from geo_content)
  title: string | null;
  subtitle: string | null;
  summary: string | null;
  contentMd: string | null;
  safetyRating: 'very_safe' | 'generally_safe' | 'use_caution' | 'exercise_caution' | null;
  soloFriendly: boolean;
  bestMonths: string[];
  internetQuality: 'excellent' | 'good' | 'fair' | 'poor' | null;
  englishFriendliness: 'high' | 'moderate' | 'low' | null;
  soloLevel: 'beginner' | 'intermediate' | 'expert' | null;
  goodForInterests: string[];
  highlights: string[];
  cultureEtiquetteMd: string | null;
  safetyWomenMd: string | null;
  transportMd: string | null;
  topThingsToDo: string[];
  portraitMd: string | null;
  bestFor: string | null;
  publishedAt: string | null;
}
```

**Step 3: Mark GeoContent as deprecated (keep for backward compat)**

Add comment above GeoContent interface:

```typescript
/**
 * @deprecated Use Country or City directly - content fields merged into parent tables.
 * This type remains for backward compatibility during migration.
 */
export interface GeoContent {
  // ... existing fields ...
}
```

**Step 4: Commit**

```bash
git add data/types.ts
git commit -m "feat: update types with merged content fields on Country and City"
```

---

## Task 5: Update API layer to read from consolidated tables

**Files:**
- Modify: `data/api.ts`

**Step 1: Update getCountryById to include content fields**

Find the function and update the select to include new columns:

```typescript
export async function getCountryById(id: string): Promise<Country | null> {
  const { data, error } = await supabase
    .from('countries')
    .select('*')  // Now includes content fields
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return mapCountry(data);
}
```

**Step 2: Update mapCountry helper to include new fields**

Find or create the mapping function:

```typescript
function mapCountry(row: any): Country {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    iso2: row.iso2,
    iso3: row.iso3,
    currencyCode: row.currency_code,
    isActive: row.is_active,
    orderIndex: row.order_index,
    heroImageUrl: row.hero_image_url,
    shortBlurb: row.short_blurb,
    badgeLabel: row.badge_label,
    isFeatured: row.is_featured ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Content fields
    title: row.title,
    subtitle: row.subtitle,
    summary: row.summary,
    contentMd: row.content_md,
    safetyRating: row.safety_rating,
    soloFriendly: row.solo_friendly ?? true,
    bestMonths: row.best_months ?? [],
    language: row.language,
    visaNote: row.visa_note,
    internetQuality: row.internet_quality,
    englishFriendliness: row.english_friendliness,
    soloLevel: row.solo_level,
    goodForInterests: row.good_for_interests ?? [],
    highlights: row.highlights ?? [],
    gettingThereMd: row.getting_there_md,
    visaEntryMd: row.visa_entry_md,
    simConnectivityMd: row.sim_connectivity_md,
    moneyMd: row.money_md,
    cultureEtiquetteMd: row.culture_etiquette_md,
    safetyWomenMd: row.safety_women_md,
    portraitMd: row.portrait_md,
    bestFor: row.best_for,
    publishedAt: row.published_at,
  };
}
```

**Step 3: Update mapCity helper similarly**

**Step 4: Deprecate getCountryContent and getCityContent**

Add deprecation warning:

```typescript
/**
 * @deprecated Use getCountryById instead - content now on countries table
 */
export async function getCountryContent(countryId: string): Promise<GeoContent | null> {
  console.warn('getCountryContent is deprecated. Use getCountryById instead.');
  // ... existing implementation for backward compat ...
}
```

**Step 5: Commit**

```bash
git add data/api.ts
git commit -m "feat: update API to read content from consolidated country/city tables"
```

---

## Task 6: Connect onboarding to create trip with city_id

**Files:**
- Modify: `app/(onboarding)/youre-in.tsx`
- Modify: `data/api.ts` (if createTrip needs updating)

**Step 1: Add city lookup helper**

In `data/api.ts`, ensure this function exists:

```typescript
export async function getCityByName(name: string): Promise<City | null> {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .ilike('name', name)
    .limit(1)
    .single();

  if (error || !data) return null;
  return mapCity(data);
}
```

**Step 2: Update youre-in.tsx to create trip**

In `app/(onboarding)/youre-in.tsx`, after the profile upsert:

```typescript
// After profile upsert succeeds...

// Create trip if destination was provided
const tripDestination = data.tripDestination;
const tripArriving = data.tripArriving;
const tripLeaving = data.tripLeaving;

if (tripDestination && tripArriving && tripLeaving) {
  // Lookup city by name
  const city = await getCityByName(tripDestination);

  if (city) {
    const { error: tripError } = await supabase.from('trips').insert({
      user_id: userId,
      destination_city_id: city.id,
      destination_name: city.name,
      country_iso2: city.countryId ? undefined : null, // Will get from city's country
      arriving: tripArriving,
      leaving: tripLeaving,
      nights: data.tripNights,
      status: 'planned',
    });

    if (tripError) {
      console.warn('Failed to create trip:', tripError);
      // Don't block onboarding completion
    }
  } else {
    // City not found - create trip with just the name
    const { error: tripError } = await supabase.from('trips').insert({
      user_id: userId,
      destination_name: tripDestination,
      arriving: tripArriving,
      leaving: tripLeaving,
      nights: data.tripNights,
      status: 'planned',
    });

    if (tripError) {
      console.warn('Failed to create trip:', tripError);
    }
  }
}
```

**Step 3: Commit**

```bash
git add app/(onboarding)/youre-in.tsx data/api.ts
git commit -m "feat: onboarding creates trip record with city_id lookup"
```

---

## Task 7: Update components that read geo_content

**Files:**
- Search and update all files importing/using `getCountryContent` or `getCityContent`

**Step 1: Find all usages**

Run: `grep -r "getCountryContent\|getCityContent\|geo_content" --include="*.ts" --include="*.tsx" app/ components/ hooks/`

**Step 2: Update each file to use getCountryById/getCityById**

For each file found, replace:
```typescript
const content = await getCountryContent(countryId);
```
With:
```typescript
const country = await getCountryById(countryId);
// Access content via country.summary, country.visaEntryMd, etc.
```

**Step 3: Commit**

```bash
git add -A
git commit -m "refactor: update components to use consolidated country/city content"
```

---

## Task 8: Create migration to drop geo_content table (DEFERRED)

**Files:**
- Create: `supabase/migrations/00022_drop_geocontent.sql` (DO NOT RUN YET)

**Step 1: Write the migration (keep for future)**

```sql
-- =====================================================================
-- Migration 00022: Drop geo_content table (DEFERRED)
-- Only run after all code is updated and verified in production
-- =====================================================================

-- First verify no orphaned data
DO $$
DECLARE
  orphan_count integer;
BEGIN
  SELECT count(*) INTO orphan_count FROM geo_content;
  IF orphan_count > 0 THEN
    RAISE EXCEPTION 'geo_content still has % rows. Verify all data migrated.', orphan_count;
  END IF;
END $$;

-- Drop the table
DROP TABLE IF EXISTS geo_content;
```

**Step 2: Add README note**

Do NOT run this migration until:
1. All frontend code is updated
2. Verified in production for 2+ weeks
3. No errors related to geo_content

**Step 3: Commit (migration file only, not applied)**

```bash
git add supabase/migrations/00022_drop_geocontent.sql
git commit -m "chore: add deferred migration to drop geo_content (do not run yet)"
```

---

## Task 9: Simplify destination_tags (Optional - evaluate)

**Current state:** `destination_tags` uses polymorphic FK (`entity_type` + `entity_id`).

**Analysis:**

The destination_tags table is actually well-designed for its purpose:
- It allows tagging countries, cities, AND neighborhoods with the same tag system
- Polymorphic FK avoids needing 3 separate junction tables

**Recommendation:** Keep destination_tags as-is. It's not redundant - it serves a different purpose than geo_content did.

**No changes needed for this task.**

---

## Task 10: Verify and test consolidated schema

**Step 1: Run migrations on staging/local**

```bash
supabase db push
```

**Step 2: Verify data migrated correctly**

```sql
-- Check countries have content
SELECT name, title, summary, visa_entry_md IS NOT NULL as has_visa
FROM countries
WHERE title IS NOT NULL
LIMIT 5;

-- Check cities have content
SELECT name, title, summary, transport_md IS NOT NULL as has_transport
FROM cities
WHERE title IS NOT NULL
LIMIT 5;

-- Verify counts match
SELECT
  (SELECT count(*) FROM countries WHERE title IS NOT NULL) as countries_with_content,
  (SELECT count(*) FROM geo_content WHERE scope = 'country') as geocontent_countries;
```

**Step 3: Test API endpoints**

In app, verify:
- Country detail page loads content from countries table
- City detail page loads content from cities table
- Onboarding creates trip with city_id

**Step 4: Commit verification notes**

```bash
git add -A
git commit -m "docs: verify schema consolidation complete"
```

---

## Execution Order Summary

| Task | Description | Depends On | Risk |
|------|-------------|------------|------|
| 1 | Audit geo_content columns | None | None |
| 2 | Add columns to countries | Task 1 | Low |
| 3 | Add columns to cities | Task 1 | Low |
| 4 | Update TypeScript types | Tasks 2-3 | Low |
| 5 | Update API layer | Task 4 | Medium |
| 6 | Connect onboarding to trips | Task 5 | Medium |
| 7 | Update consuming components | Task 5 | Medium |
| 8 | Drop geo_content (DEFERRED) | All above | High (defer) |
| 9 | Evaluate destination_tags | None | None |
| 10 | Verify and test | All above | None |

---

## Final Schema After Consolidation

```
countries (12 rows)
├── Master data: id, slug, name, iso2, iso3, currency_code, timezone
├── UI fields: hero_image_url, short_blurb, badge_label, is_featured
├── Content: title, subtitle, summary, safety_rating, solo_level, highlights[]
├── Editorial tabs: visa_entry_md, sim_connectivity_md, money_md, culture_etiquette_md, safety_women_md
└── Relations: → cities (1:N)

cities (44 rows)
├── Master data: id, country_id FK, slug, name, timezone, center_lat/lng
├── UI fields: hero_image_url, short_blurb, badge_label, is_featured
├── Content: title, subtitle, summary, safety_rating, solo_level, highlights[]
├── Editorial tabs: culture_etiquette_md, safety_women_md, transport_md, top_things_to_do[]
└── Relations: → city_areas (1:N), → places (1:N), → trips (1:N via destination_city_id)

city_areas (146 rows)
├── id, city_id FK, slug, name, area_kind (neighborhood|beach|island|district)
└── Relations: → places (1:N)

destination_tags (200+ rows) - KEEP AS-IS
├── Polymorphic: entity_type (country|city|neighborhood) + entity_id
└── tag_category, tag_slug, tag_label

places (575 rows)
├── city_id FK, city_area_id FK (optional)
└── All place data...

geo_content - DEPRECATED (drop after verification)
```

**Net result:**
- Before: 6 tables for geography
- After: 5 tables (geo_content merged into parents)
- Onboarding properly creates trips linked to cities
- Single source of truth for country/city content
