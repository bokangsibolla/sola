# Explore Collection Framework Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Design and implement a scalable, data-driven collection system for the Explore page that dynamically generates curated content groupings for solo women travelers launching in Southeast Asia.

**Architecture:** Introduce a `collections` table with tag-based filtering rules, extend destination tags to support collection membership, and build a collection resolution engine that generates editorial-style collection pages from structured data.

**Tech Stack:** React Native (Expo Router), Supabase (Postgres), TypeScript

---

## Executive Summary

### The Problem
The current Explore feed uses hardcoded mock editorial collections and a rigid feed rhythm. This doesn't scale, requires manual curation, and can't adapt to user preferences or new regions.

### The Solution
A **tag-powered collection system** where:
1. Collections are defined by **filter rules** (tag combinations)
2. Countries, cities, and areas are **tagged** with consistent vocabularies
3. Collections are **resolved dynamically** at query time
4. Collection pages display **editorial intros** stored as data, not hardcoded

---

## Part 1: Conceptual Framework

### 1.1 Collection Types

| Type | Purpose | Content | Example |
|------|---------|---------|---------|
| **Country Collection** | Showcase countries by theme | 2-4 countries matching tags | "Beach & Island Escapes" |
| **City Spotlight** | Highlight specific cities | 1-3 cities with activities | "Cultural Capitals" |
| **Editorial Collection** | Curated themed journeys | Mix of countries + cities | "Best First Solo Trips" |
| **Activity Collection** | Experience-based grouping | Activities across destinations | "Wellness & Retreat" |

### 1.2 Collection Resolution Rules

Each collection defines:
- **include_tags**: Array of tag slugs — entities must have ANY of these
- **exclude_tags**: Array of tag slugs — entities must have NONE of these
- **entity_types**: Which entities to include (`country`, `city`, `neighborhood`)
- **min_items / max_items**: Result bounds
- **sort_by**: `order_index`, `name`, `random`, `featured_first`

Example: "Calm Beach Towns for Slow Travel"
```json
{
  "include_tags": ["beach_islands", "slow_travel", "relaxed"],
  "exclude_tags": ["fast_paced", "nightlife_social"],
  "entity_types": ["city"],
  "min_items": 3,
  "max_items": 8,
  "sort_by": "featured_first"
}
```

### 1.3 Tag Inheritance Model

Tags flow **upward** for filtering, **downward** for display:

```
Country (tagged: beach_islands, budget_friendly)
  └── City (tagged: surfing, wellness)
        └── Area (tagged: quiet, walkable)
```

When filtering for `beach_islands`:
- Country matches directly
- City inherits country's `beach_islands` for collection inclusion
- Area inherits through city

This avoids redundant tagging while enabling granular filtering.

### 1.4 Editorial Content Structure

Each collection has:
- `title` (required): "Best First Solo Trips in Southeast Asia"
- `subtitle` (optional): "For first-timers who want ease and charm"
- `intro_md` (optional): 2-3 paragraphs of editorial narrative
- `hero_image_url`: Cover image
- `badge_label` (optional): "New", "Editor's Pick", "Trending"

The intro_md renders as the opening "article feel" when the collection page opens, but the content below is dynamically resolved from tagged entities.

---

## Part 2: Southeast Asia Launch Logic

### 2.1 Priority Countries

| Rank | Country | Why First |
|------|---------|-----------|
| 1 | **Thailand** | Most accessible for first-time solo travelers; established infrastructure |
| 2 | **Indonesia** | Strong solo community in Bali; wellness/digital nomad draw |
| 3 | **Philippines** | English spoken; world-class beaches; adventurous feel |
| 4 | **Vietnam** | Authentic SE Asia experience; incredible food; affordable |

### 2.2 Recommended Explore Flow (Launch)

```
1. Hero: Featured Editorial Collection
   "Best destinations for your first solo trip"
   → Opens to collection page with tagged first_solo_trip countries

2. Country Pair: Thailand + Indonesia
   Reason: Both beginner-friendly, different vibes (budget vs wellness)

3. City Spotlight: Ubud, Bali
   Why: Iconic solo travel hub, wellness/yoga, easy to navigate
   With: 4 activities (yoga, cooking class, rice terrace walk, temple visit)

4. Editorial Collection: "Calm beach towns for slow travel"
   → Resolves to cities tagged: beach_islands + slow_travel

5. Country Pair: Philippines + Vietnam
   Reason: Adventure + Food anchors; slightly more experienced

6. Activity Cluster: "Wellness & Retreat"
   → Top 4 wellness activities across all launch countries

7. Editorial Collection: "Cultural capitals worth exploring"
   → Cities tagged: city_culture + walkable

8. End Card
```

### 2.3 Why This Ordering Works

1. **Inspiration first**: Opens with editorial collection (magazine feel)
2. **Easy entry**: Thailand + Indonesia are beginner-friendly — reduces overwhelm
3. **Depth signal**: City spotlight shows "we go deep" (not just country lists)
4. **Theme discovery**: Editorial collections teach users how to browse by interest
5. **Adventure escalation**: Philippines/Vietnam come after — slightly more experienced
6. **Cross-cutting interests**: Activity collection shows experience-based browsing

---

## Part 3: Tagging System Design

### 3.1 Tag Categories

| Category | Purpose | Example Tags |
|----------|---------|--------------|
| `travel_style` | What kind of travel | beach_islands, city_culture, nature_outdoors, wellness_retreat, nightlife_social, foodie, adventure |
| `solo_context` | Solo travel suitability | first_solo_trip, easy_to_navigate, english_widely_spoken, strong_solo_community, great_public_transport |
| `vibe` | Feeling/atmosphere | relaxed, lively, adventurous, spiritual, trendy, quiet |
| `budget` | Cost level | budget_friendly, mid_range, splurge_worthy |
| `pace` | Travel tempo | slow_travel, fast_paced, mix_of_both |
| `environment` | Physical setting | beach, island, city, mountain, jungle, rural |
| `safety` | Safety attributes | well_lit, walkable_day, walkable_night, reliable_transport |

### 3.2 Entity Tag Mapping

| Entity | Tag Categories Applied |
|--------|----------------------|
| Country | travel_style, solo_context, vibe, budget, pace |
| City | travel_style, solo_context, vibe, environment, pace, safety |
| City Area | vibe, environment, safety |
| Place | Uses existing place_tags system (filter_group: vibe, good_for, safety, amenity) |

### 3.3 Tag Rollup Rules

```sql
-- City inherits country's solo_context tags
-- (city appears in "first_solo_trip" collection if country has that tag)

-- Area does NOT inherit — must be explicitly tagged
-- (neighborhoods are too granular for broad themes)

-- Places use separate tag system (place_tags table)
-- but can be filtered by city's environment tags
```

### 3.4 Why This Approach Beats Hardcoding

1. **No ID references**: Collections resolve by tag, not country_id
2. **Self-updating**: Add Vietnam → automatically appears in matching collections
3. **Operator-friendly**: Tag a new city → it flows into all relevant collections
4. **Sponsor-ready**: Sponsored collections are just collections with is_sponsored=true
5. **Personalization-ready**: User preferences become tag filters

---

## Part 4: Database Schema

### 4.1 New Table: `collections`

```sql
create table collections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  intro_md text,
  hero_image_url text,
  badge_label text,

  -- Filter rules (JSONB for flexibility)
  include_tags text[] not null default '{}',
  exclude_tags text[] not null default '{}',
  entity_types text[] not null default '{country,city}',

  -- Display settings
  min_items int not null default 2,
  max_items int not null default 8,
  sort_by text not null default 'featured_first',

  -- Ordering and visibility
  order_index int not null default 0,
  is_active boolean not null default true,
  is_featured boolean not null default false,

  -- Sponsorship
  is_sponsored boolean not null default false,
  sponsor_name text,
  sponsor_logo_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 4.2 Extend `destination_tags`

The existing `destination_tags` table already supports:
- `entity_type`: 'country', 'city', 'neighborhood'
- `entity_id`: UUID reference
- `tag_category`, `tag_slug`, `tag_label`

We'll add more tags to cover the new categories.

### 4.3 New View: `collection_items`

A view that resolves collections to their matching entities:

```sql
create view collection_items as
select
  c.id as collection_id,
  c.slug as collection_slug,
  dt.entity_type,
  dt.entity_id,
  case
    when dt.entity_type = 'country' then co.name
    when dt.entity_type = 'city' then ci.name
    else null
  end as entity_name,
  case
    when dt.entity_type = 'country' then co.slug
    when dt.entity_type = 'city' then ci.slug
    else null
  end as entity_slug,
  case
    when dt.entity_type = 'country' then co.hero_image_url
    when dt.entity_type = 'city' then ci.hero_image_url
    else null
  end as entity_image_url,
  case
    when dt.entity_type = 'country' then co.is_featured
    when dt.entity_type = 'city' then ci.is_featured
    else false
  end as is_featured
from collections c
cross join lateral (
  select distinct entity_type, entity_id
  from destination_tags
  where tag_slug = any(c.include_tags)
    and entity_type = any(c.entity_types)
) dt
left join countries co on dt.entity_type = 'country' and dt.entity_id = co.id
left join cities ci on dt.entity_type = 'city' and dt.entity_id = ci.id
where c.is_active = true
  and not exists (
    select 1 from destination_tags exc
    where exc.entity_type = dt.entity_type
      and exc.entity_id = dt.entity_id
      and exc.tag_slug = any(c.exclude_tags)
  );
```

---

## Part 5: API Design

### 5.1 Collection Queries

```typescript
// Get all active collections (for Explore feed)
async function getCollections(): Promise<Collection[]>

// Get single collection with resolved items
async function getCollectionBySlug(slug: string): Promise<CollectionWithItems>

// Get collection items (paginated)
async function getCollectionItems(
  collectionId: string,
  limit?: number,
  offset?: number
): Promise<CollectionItem[]>
```

### 5.2 Collection Resolution Function (Supabase Edge Function)

For complex resolution logic, a Supabase Edge Function:

```typescript
// supabase/functions/resolve-collection/index.ts
export async function resolveCollection(collectionSlug: string) {
  const collection = await getCollectionBySlug(collectionSlug);

  // Get entities matching include_tags
  const candidates = await getEntitiesByTags(
    collection.includeTags,
    collection.entityTypes
  );

  // Filter out entities with exclude_tags
  const filtered = await filterByExcludeTags(
    candidates,
    collection.excludeTags
  );

  // Sort and limit
  const sorted = sortEntities(filtered, collection.sortBy);
  const limited = sorted.slice(0, collection.maxItems);

  return {
    ...collection,
    items: limited
  };
}
```

---

## Part 6: Collection Page Behavior

### 6.1 Page Structure

```
┌─────────────────────────────────────┐
│ Hero Image (full width)             │
│                                     │
│ Collection Title                    │
│ Subtitle                            │
│ Badge (if any)                      │
├─────────────────────────────────────┤
│ Editorial Intro (Markdown)          │
│ 2-3 paragraphs of narrative text    │
│ Sets the tone, explains the theme   │
├─────────────────────────────────────┤
│ Item Cards (vertical list)          │
│ ┌───────────────────────────────┐   │
│ │ [Image] Country/City Name     │   │
│ │         Short blurb           │   │
│ │         [Badge]               │   │
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │ [Image] Country/City Name     │   │
│ │         Short blurb           │   │
│ └───────────────────────────────┘   │
│ ...                                 │
├─────────────────────────────────────┤
│ Related Collections (horizontal)    │
│ [Card] [Card] [Card]               │
└─────────────────────────────────────┘
```

### 6.2 Consistent Card Rendering

Regardless of entity type (country, city, area), cards render uniformly:
- Image (left or top)
- Name
- Short blurb (from entity's `short_blurb` field)
- Badge (optional)
- Tap → navigates to entity detail page

### 6.3 Empty States

If a collection resolves to < min_items, it's hidden from the Explore feed.
If viewed directly (via deep link), show: "This collection is being updated."

---

## Part 7: Scalability & Safety

### 7.1 Adding New Regions

1. Add countries to `countries` table
2. Add cities to `cities` table
3. Tag them in `destination_tags`
4. They automatically appear in matching collections
5. Create region-specific collections if needed

No code changes. No Explore redesign.

### 7.2 Avoiding Brittle Logic

| Anti-pattern | Our Approach |
|--------------|--------------|
| Hardcoded country IDs | Tag-based resolution |
| Ordered arrays in code | Database `order_index` |
| Manual "featured" lists | `is_featured` flag + sort_by |
| If/else for regions | Region as a tag category |

### 7.3 Sponsored Collections

Sponsored collections work identically:
- `is_sponsored: true`
- `sponsor_name`, `sponsor_logo_url` populated
- Displayed with sponsor disclosure badge
- Same resolution engine, just different display treatment

---

## Part 8: Implementation Tasks

### Task 1: Create `collections` table

**Files:**
- Create: `supabase/migrations/00022_collections_table.sql`
- Modify: `data/types.ts`

**Step 1: Write the migration**

```sql
-- Collections table for Explore
create table collections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  intro_md text,
  hero_image_url text,
  badge_label text,

  include_tags text[] not null default '{}',
  exclude_tags text[] not null default '{}',
  entity_types text[] not null default '{country,city}',

  min_items int not null default 2,
  max_items int not null default 8,
  sort_by text not null default 'featured_first',

  order_index int not null default 0,
  is_active boolean not null default true,
  is_featured boolean not null default false,

  is_sponsored boolean not null default false,
  sponsor_name text,
  sponsor_logo_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_collections_order on collections (order_index) where is_active = true;
create index idx_collections_slug on collections (slug);

alter table collections enable row level security;
create policy "Anyone can read collections"
  on collections for select using (true);
```

**Step 2: Add TypeScript types**

Add to `data/types.ts`:

```typescript
export interface Collection {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  introMd: string | null;
  heroImageUrl: string | null;
  badgeLabel: string | null;
  includeTags: string[];
  excludeTags: string[];
  entityTypes: ('country' | 'city' | 'neighborhood')[];
  minItems: number;
  maxItems: number;
  sortBy: 'order_index' | 'name' | 'random' | 'featured_first';
  orderIndex: number;
  isActive: boolean;
  isFeatured: boolean;
  isSponsored: boolean;
  sponsorName: string | null;
  sponsorLogoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionItem {
  collectionId: string;
  collectionSlug: string;
  entityType: 'country' | 'city' | 'neighborhood';
  entityId: string;
  entityName: string;
  entitySlug: string;
  entityImageUrl: string | null;
  isFeatured: boolean;
}

export interface CollectionWithItems extends Collection {
  items: CollectionItem[];
}
```

**Step 3: Commit**

```bash
git add supabase/migrations/00022_collections_table.sql data/types.ts
git commit -m "feat: add collections table for Explore"
```

---

### Task 2: Extend destination tags for launch countries

**Files:**
- Create: `supabase/migrations/00023_extend_destination_tags.sql`

**Step 1: Write the migration**

```sql
-- Add additional tags for Southeast Asia launch countries
-- This extends the existing tags from migration 00010

-- Thailand - add environment and safety tags
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'country', id, tag_category, tag_slug, tag_label, tag_order
from countries, (values
  ('environment', 'beach', 'Beach', 1),
  ('environment', 'island', 'Island', 2),
  ('environment', 'city', 'City', 3)
) as t(tag_category, tag_slug, tag_label, tag_order)
where countries.slug = 'thailand'
on conflict do nothing;

-- Indonesia - add environment tags
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'country', id, tag_category, tag_slug, tag_label, tag_order
from countries, (values
  ('environment', 'beach', 'Beach', 1),
  ('environment', 'island', 'Island', 2),
  ('environment', 'jungle', 'Jungle', 3)
) as t(tag_category, tag_slug, tag_label, tag_order)
where countries.slug = 'indonesia'
on conflict do nothing;

-- Philippines - add environment tags
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'country', id, tag_category, tag_slug, tag_label, tag_order
from countries, (values
  ('environment', 'beach', 'Beach', 1),
  ('environment', 'island', 'Island', 2)
) as t(tag_category, tag_slug, tag_label, tag_order)
where countries.slug = 'philippines'
on conflict do nothing;

-- Vietnam - add missing solo_context and environment tags
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'country', id, tag_category, tag_slug, tag_label, tag_order
from countries, (values
  ('travel_style', 'foodie', 'Food lover', 1),
  ('travel_style', 'city_culture', 'City & culture', 2),
  ('travel_style', 'adventure', 'Adventure', 3),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 1),
  ('vibe', 'adventurous', 'Adventurous', 1),
  ('budget', 'budget_friendly', 'Budget-friendly', 1),
  ('pace', 'mix_of_both', 'Mix of both', 1),
  ('environment', 'beach', 'Beach', 1),
  ('environment', 'city', 'City', 2),
  ('environment', 'mountain', 'Mountain', 3)
) as t(tag_category, tag_slug, tag_label, tag_order)
where countries.slug = 'vietnam'
on conflict do nothing;

-- Add city-level tags for spotlight cities

-- Ubud, Bali
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'city', id, tag_category, tag_slug, tag_label, tag_order
from cities, (values
  ('travel_style', 'wellness_retreat', 'Wellness', 1),
  ('travel_style', 'city_culture', 'Culture', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'strong_solo_community', 'Strong solo community', 2),
  ('vibe', 'spiritual', 'Spiritual', 1),
  ('vibe', 'quiet', 'Quiet', 2),
  ('environment', 'jungle', 'Jungle', 1),
  ('pace', 'slow_travel', 'Slow travel', 1)
) as t(tag_category, tag_slug, tag_label, tag_order)
where cities.slug = 'ubud'
on conflict do nothing;

-- Chiang Mai
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'city', id, tag_category, tag_slug, tag_label, tag_order
from cities, (values
  ('travel_style', 'city_culture', 'Culture', 1),
  ('travel_style', 'foodie', 'Food lover', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('solo_context', 'easy_to_navigate', 'Easy to navigate', 2),
  ('vibe', 'relaxed', 'Relaxed', 1),
  ('environment', 'city', 'City', 1),
  ('environment', 'mountain', 'Mountain', 2),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('safety', 'walkable_night', 'Walkable at night', 2)
) as t(tag_category, tag_slug, tag_label, tag_order)
where cities.slug = 'chiang-mai'
on conflict do nothing;

-- Hoi An
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'city', id, tag_category, tag_slug, tag_label, tag_order
from cities, (values
  ('travel_style', 'city_culture', 'Culture', 1),
  ('travel_style', 'foodie', 'Food lover', 2),
  ('solo_context', 'first_solo_trip', 'Great first solo trip', 1),
  ('vibe', 'quiet', 'Quiet', 1),
  ('vibe', 'aesthetic', 'Aesthetic', 2),
  ('environment', 'city', 'City', 1),
  ('environment', 'beach', 'Beach', 2),
  ('pace', 'slow_travel', 'Slow travel', 1),
  ('safety', 'walkable_day', 'Walkable during day', 1),
  ('safety', 'walkable_night', 'Walkable at night', 2)
) as t(tag_category, tag_slug, tag_label, tag_order)
where cities.slug = 'hoi-an'
on conflict do nothing;

-- El Nido
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'city', id, tag_category, tag_slug, tag_label, tag_order
from cities, (values
  ('travel_style', 'beach_islands', 'Beach & islands', 1),
  ('travel_style', 'adventure', 'Adventure', 2),
  ('solo_context', 'strong_solo_community', 'Strong solo community', 1),
  ('vibe', 'adventurous', 'Adventurous', 1),
  ('vibe', 'relaxed', 'Relaxed', 2),
  ('environment', 'beach', 'Beach', 1),
  ('environment', 'island', 'Island', 2),
  ('pace', 'slow_travel', 'Slow travel', 1)
) as t(tag_category, tag_slug, tag_label, tag_order)
where cities.slug = 'el-nido'
on conflict do nothing;

-- Siargao
insert into destination_tags (entity_type, entity_id, tag_category, tag_slug, tag_label, order_index)
select 'city', id, tag_category, tag_slug, tag_label, tag_order
from cities, (values
  ('travel_style', 'beach_islands', 'Beach & islands', 1),
  ('travel_style', 'adventure', 'Adventure', 2),
  ('solo_context', 'strong_solo_community', 'Strong solo community', 1),
  ('vibe', 'lively', 'Lively', 1),
  ('vibe', 'adventurous', 'Adventurous', 2),
  ('environment', 'beach', 'Beach', 1),
  ('environment', 'island', 'Island', 2),
  ('pace', 'slow_travel', 'Slow travel', 1)
) as t(tag_category, tag_slug, tag_label, tag_order)
where cities.slug = 'siargao'
on conflict do nothing;
```

**Step 2: Commit**

```bash
git add supabase/migrations/00023_extend_destination_tags.sql
git commit -m "feat: add destination tags for SE Asia launch cities"
```

---

### Task 3: Seed launch collections

**Files:**
- Create: `supabase/migrations/00024_seed_collections.sql`

**Step 1: Write the seed migration**

```sql
-- Seed editorial collections for Southeast Asia launch

insert into collections (slug, title, subtitle, intro_md, hero_image_url, include_tags, exclude_tags, entity_types, order_index, is_featured)
values
-- 1. First Solo Trips (Countries)
(
  'first-solo-trips',
  'Best destinations for your first solo trip',
  'For first-timers who want ease and charm',
  E'Planning your first solo adventure can feel overwhelming, but these destinations make it easy. Each one combines welcoming locals, safe streets, and enough fellow travelers that you''ll never feel truly alone.\n\nWhether you''re drawn to temples, beaches, or bustling cities, these countries offer the perfect training wheels for independent travel. English is widely understood, transport is straightforward, and the solo travel community is strong.',
  'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200',
  '{first_solo_trip,easy_to_navigate}',
  '{}',
  '{country}',
  1,
  true
),

-- 2. Calm Beach Towns (Cities)
(
  'calm-beach-towns',
  'Calm beach towns for slow travel',
  'Where the pace is gentle and the views are endless',
  E'Sometimes you need a destination that asks nothing of you. These beach towns are built for lingering — morning coffee watching the waves, afternoon naps, sunset drinks with new friends.\n\nPerfect for solo travelers seeking rest over adventure, each of these spots offers calm waters, walkable streets, and the kind of easy rhythm that makes you extend your stay.',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
  '{beach_islands,slow_travel,quiet}',
  '{fast_paced,nightlife_social}',
  '{city}',
  2,
  false
),

-- 3. Cultural Capitals (Cities)
(
  'cultural-capitals',
  'Cultural capitals worth exploring',
  'Art, history, and unforgettable experiences',
  E'Some cities are defined by their culture — the temples you wander, the museums you discover, the neighborhoods that tell stories. These cultural capitals reward the curious traveler.\n\nEach destination offers walkable historic centers, world-class food scenes, and the kind of depth that reveals itself over multiple visits. Perfect for solo travelers who want substance over sun.',
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200',
  '{city_culture,walkable_day}',
  '{}',
  '{city}',
  3,
  false
),

-- 4. Wellness Retreats (Mix)
(
  'wellness-retreats',
  'Wellness & retreat destinations',
  'Recharge your body and mind',
  E'Solo travel is the perfect time to prioritize yourself. These destinations are built around wellness — yoga studios, meditation centers, spa treatments, and healthy food that actually tastes good.\n\nWhether you want a structured retreat or just a place where self-care is the default, these spots attract like-minded travelers and make healthy living effortless.',
  'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200',
  '{wellness_retreat,spiritual}',
  '{}',
  '{country,city}',
  4,
  false
),

-- 5. Adventure & Outdoors
(
  'adventure-outdoors',
  'For the adventurous spirit',
  'Hiking, diving, surfing, and more',
  E'If sitting still isn''t your style, these destinations deliver. From world-class surf breaks to jungle treks, from diving spots to mountain peaks — each offers adventures that push your limits.\n\nSolo adventure travel might sound intimidating, but these places have strong communities of like-minded travelers. You''ll find tours, guides, and new friends at every turn.',
  'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=1200',
  '{adventure,nature_outdoors}',
  '{}',
  '{country,city}',
  5,
  false
),

-- 6. Budget-Friendly Escapes
(
  'budget-friendly',
  'Travel more, spend less',
  'Incredible value without compromise',
  E'Your budget shouldn''t limit your adventures. These destinations offer remarkable value — comfortable stays under $30/night, delicious meals for a few dollars, and experiences that rival destinations costing three times as much.\n\nEach place maintains quality while respecting your wallet. Perfect for extended trips or anyone who wants to make their travel fund stretch further.',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
  '{budget_friendly}',
  '{splurge_worthy}',
  '{country}',
  6,
  false
);
```

**Step 2: Commit**

```bash
git add supabase/migrations/00024_seed_collections.sql
git commit -m "feat: seed editorial collections for SE Asia launch"
```

---

### Task 4: Add collection API functions

**Files:**
- Modify: `data/api.ts`
- Create: `data/collections.ts`

**Step 1: Create collection queries**

Create `data/collections.ts`:

```typescript
import { supabase } from './supabase';
import { rowsToCamel } from './api';
import type { Collection, CollectionItem, CollectionWithItems } from './types';

export async function getCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('is_active', true)
    .order('order_index');

  if (error) throw error;
  return rowsToCamel<Collection>(data ?? []);
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return rowsToCamel<Collection>(data ? [data] : [])[0] ?? null;
}

export async function getCollectionItems(
  collection: Collection
): Promise<CollectionItem[]> {
  // Get entities matching include_tags
  const { data: matches, error: matchError } = await supabase
    .from('destination_tags')
    .select('entity_type, entity_id')
    .in('tag_slug', collection.includeTags)
    .in('entity_type', collection.entityTypes);

  if (matchError) throw matchError;
  if (!matches || matches.length === 0) return [];

  // Deduplicate
  const uniqueEntities = Array.from(
    new Map(matches.map(m => [`${m.entity_type}:${m.entity_id}`, m])).values()
  );

  // Filter out entities with exclude_tags
  let filtered = uniqueEntities;
  if (collection.excludeTags.length > 0) {
    const { data: excluded } = await supabase
      .from('destination_tags')
      .select('entity_type, entity_id')
      .in('tag_slug', collection.excludeTags);

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
          .select('id, name, slug, hero_image_url, is_featured, order_index')
          .in('id', countryIds)
          .eq('is_active', true)
      : { data: [] },
    cityIds.length > 0
      ? supabase
          .from('cities')
          .select('id, name, slug, hero_image_url, is_featured, order_index')
          .in('id', cityIds)
          .eq('is_active', true)
      : { data: [] },
  ]);

  // Build items
  const items: CollectionItem[] = [];

  for (const country of countries.data ?? []) {
    items.push({
      collectionId: collection.id,
      collectionSlug: collection.slug,
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
      collectionId: collection.id,
      collectionSlug: collection.slug,
      entityType: 'city',
      entityId: city.id,
      entityName: city.name,
      entitySlug: city.slug,
      entityImageUrl: city.hero_image_url,
      isFeatured: city.is_featured ?? false,
      orderIndex: city.order_index ?? 0,
    });
  }

  // Sort
  if (collection.sortBy === 'featured_first') {
    items.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
    });
  } else if (collection.sortBy === 'name') {
    items.sort((a, b) => a.entityName.localeCompare(b.entityName));
  } else if (collection.sortBy === 'random') {
    items.sort(() => Math.random() - 0.5);
  } else {
    items.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }

  // Limit
  return items.slice(0, collection.maxItems);
}

export async function getCollectionWithItems(
  slug: string
): Promise<CollectionWithItems | null> {
  const collection = await getCollectionBySlug(slug);
  if (!collection) return null;

  const items = await getCollectionItems(collection);

  // Check min_items
  if (items.length < collection.minItems) {
    return null; // Collection doesn't meet minimum
  }

  return { ...collection, items };
}

export async function getFeaturedCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('order_index');

  if (error) throw error;
  return rowsToCamel<Collection>(data ?? []);
}
```

**Step 2: Export from api.ts**

Add to `data/api.ts`:

```typescript
export {
  getCollections,
  getCollectionBySlug,
  getCollectionItems,
  getCollectionWithItems,
  getFeaturedCollections,
} from './collections';
```

**Step 3: Commit**

```bash
git add data/collections.ts data/api.ts
git commit -m "feat: add collection query functions"
```

---

### Task 5: Update types for CollectionItem orderIndex

**Files:**
- Modify: `data/types.ts`

**Step 1: Add orderIndex to CollectionItem**

Update the `CollectionItem` interface:

```typescript
export interface CollectionItem {
  collectionId: string;
  collectionSlug: string;
  entityType: 'country' | 'city' | 'neighborhood';
  entityId: string;
  entityName: string;
  entitySlug: string;
  entityImageUrl: string | null;
  isFeatured: boolean;
  orderIndex?: number;
}
```

**Step 2: Commit**

```bash
git add data/types.ts
git commit -m "feat: add orderIndex to CollectionItem type"
```

---

### Task 6: Create collection page component

**Files:**
- Create: `app/(tabs)/explore/collection/[slug].tsx`

**Step 1: Write the collection page**

```typescript
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { useData } from '@/hooks/useData';
import { getCollectionWithItems } from '@/data/api';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { CollectionItem } from '@/data/types';

export default function CollectionPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  const { data: collection, loading, error, refetch } = useData(
    () => getCollectionWithItems(slug ?? ''),
    [slug]
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;
  if (!collection) {
    return (
      <AppScreen>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>This collection is being updated.</Text>
        </View>
      </AppScreen>
    );
  }

  const handleItemPress = (item: CollectionItem) => {
    if (item.entityType === 'country') {
      router.push(`/(tabs)/explore/country/${item.entitySlug}`);
    } else if (item.entityType === 'city') {
      router.push(`/(tabs)/explore/place/${item.entitySlug}`);
    }
  };

  return (
    <AppScreen>
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: true,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
          ),
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          {collection.heroImageUrl && (
            <Image
              source={{ uri: collection.heroImageUrl }}
              style={styles.heroImage}
              contentFit="cover"
              transition={200}
            />
          )}
          <View style={styles.heroOverlay}>
            {collection.badgeLabel && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{collection.badgeLabel}</Text>
              </View>
            )}
            <Text style={styles.title}>{collection.title}</Text>
            {collection.subtitle && (
              <Text style={styles.subtitle}>{collection.subtitle}</Text>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {/* Intro */}
          {collection.introMd && (
            <Text style={styles.intro}>{collection.introMd}</Text>
          )}

          {/* Sponsored disclosure */}
          {collection.isSponsored && collection.sponsorName && (
            <View style={styles.sponsorBanner}>
              <Ionicons name="megaphone-outline" size={14} color={colors.textMuted} />
              <Text style={styles.sponsorText}>
                Sponsored by {collection.sponsorName}
              </Text>
            </View>
          )}

          {/* Items */}
          <Text style={styles.sectionTitle}>
            {collection.items.length} destination{collection.items.length !== 1 ? 's' : ''}
          </Text>

          {collection.items.map((item) => (
            <Pressable
              key={`${item.entityType}-${item.entityId}`}
              style={styles.itemCard}
              onPress={() => handleItemPress(item)}
            >
              {item.entityImageUrl && (
                <Image
                  source={{ uri: item.entityImageUrl }}
                  style={styles.itemImage}
                  contentFit="cover"
                  transition={200}
                />
              )}
              <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.entityName}</Text>
                  {item.isFeatured && (
                    <View style={styles.itemBadge}>
                      <Text style={styles.itemBadgeText}>Featured</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.itemType}>
                  {item.entityType === 'country' ? 'Country' : 'City'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 280,
    backgroundColor: colors.borderSubtle,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    paddingTop: 60,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.xs,
    marginBottom: spacing.sm,
  },
  badgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 26,
    color: '#FFFFFF',
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
  },
  content: {
    padding: spacing.lg,
  },
  intro: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  sponsorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.borderSubtle,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.lg,
  },
  sponsorText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.card,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  itemImage: {
    width: 80,
    height: 80,
  },
  itemInfo: {
    flex: 1,
    padding: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  itemBadge: {
    backgroundColor: colors.borderSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  itemBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  itemType: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
```

**Step 2: Commit**

```bash
git add app/(tabs)/explore/collection/[slug].tsx
git commit -m "feat: add collection detail page"
```

---

### Task 7: Update Explore feed to use collections

**Files:**
- Modify: `data/explore/useFeedItems.ts`
- Modify: `data/explore/types.ts`
- Modify: `data/explore/feedBuilder.ts`

**Step 1: Update types**

Update `data/explore/types.ts`:

```typescript
import type { Country, City, Place, Collection, CollectionWithItems } from '../types';

// ... existing interfaces ...

export type FeedItem =
  | { type: 'editorial-collection'; data: CollectionWithItems }
  | { type: 'country-pair'; data: [Country, Country] }
  | { type: 'city-spotlight'; data: CityWithCountry; activities: ActivityWithCity[] }
  | { type: 'activity-cluster'; data: ActivityWithCity[]; cityName: string; citySlug: string }
  | { type: 'end-card' };
```

**Step 2: Update useFeedItems**

Update `data/explore/useFeedItems.ts`:

```typescript
import { useState, useEffect } from 'react';
import {
  getCountries,
  getPopularCities,
  getCountryById,
  getCollections,
  getCollectionItems,
} from '../api';
import { buildFeed } from './feedBuilder';
import type { FeedItem, CityWithCountry, ActivityWithCity } from './types';
import type { CollectionWithItems } from '../types';

// ... withTimeout function stays same ...

export function useFeedItems(): UseFeedItemsResult {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([{ type: 'end-card' }]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadFeed() {
      setIsLoading(true);
      try {
        const [countries, cities, collections] = await withTimeout(
          Promise.all([
            getCountries(),
            getPopularCities(4),
            getCollections(),
          ]),
          5000
        );

        if (cancelled) return;

        // Resolve collection items
        const collectionsWithItems: CollectionWithItems[] = [];
        for (const collection of collections.slice(0, 4)) {
          const items = await getCollectionItems(collection);
          if (items.length >= collection.minItems) {
            collectionsWithItems.push({ ...collection, items });
          }
        }

        if (cancelled) return;

        // Get country details for cities
        const countryIds = [...new Set(cities.map(c => c.countryId))];
        const countryResults = await withTimeout(
          Promise.all(countryIds.map(id => getCountryById(id))),
          3000
        );

        if (cancelled) return;

        const countryMap = new Map(
          countryResults.filter(Boolean).map(c => [c!.id, c!])
        );

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

        const feed = buildFeed(collectionsWithItems, countries, citiesWithActivities);
        setFeedItems(feed);
        setIsLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load'));
          setIsLoading(false);
        }
      }
    }

    loadFeed();

    return () => { cancelled = true; };
  }, [refreshKey]);

  const refresh = () => {
    setError(null);
    setRefreshKey((k) => k + 1);
  };

  return { feedItems, isLoading, error, refresh };
}
```

**Step 3: Update feedBuilder**

Update `data/explore/feedBuilder.ts`:

```typescript
import type { Country } from '../types';
import type { CollectionWithItems } from '../types';
import type {
  FeedItem,
  CityWithCountry,
  ActivityWithCity,
} from './types';

export function buildFeed(
  collections: CollectionWithItems[],
  countries: Country[],
  citiesWithActivities: { city: CityWithCountry; activities: ActivityWithCity[] }[]
): FeedItem[] {
  const feed: FeedItem[] = [];

  let collectionIndex = 0;
  let countryIndex = 0;
  let cityIndex = 0;

  const maxItems = 18;

  while (feed.length < maxItems) {
    const beatPosition = feed.length % 5;

    switch (beatPosition) {
      case 0: // Editorial collection
        if (collectionIndex < collections.length) {
          feed.push({
            type: 'editorial-collection',
            data: collections[collectionIndex++],
          });
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

      case 3: // Activity cluster
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

      case 4: // Another editorial
        if (collectionIndex < collections.length) {
          feed.push({
            type: 'editorial-collection',
            data: collections[collectionIndex++],
          });
        }
        break;
    }

    // Safety: break if we've exhausted content
    if (
      collectionIndex >= collections.length &&
      countryIndex >= countries.length &&
      cityIndex >= citiesWithActivities.length
    ) {
      break;
    }
  }

  feed.push({ type: 'end-card' });

  return feed;
}
```

**Step 4: Commit**

```bash
git add data/explore/types.ts data/explore/useFeedItems.ts data/explore/feedBuilder.ts
git commit -m "feat: connect Explore feed to collections system"
```

---

### Task 8: Update Explore index to render collection cards

**Files:**
- Modify: `app/(tabs)/explore/index.tsx`

**Step 1: Update collection card rendering**

Find the section that renders `editorial-collection` feed items and update:

```typescript
case 'editorial-collection':
  return (
    <Pressable
      key={item.data.id}
      style={styles.collectionCard}
      onPress={() => router.push(`/(tabs)/explore/collection/${item.data.slug}`)}
    >
      {item.data.heroImageUrl && (
        <Image
          source={{ uri: item.data.heroImageUrl }}
          style={styles.collectionImage}
          contentFit="cover"
          transition={200}
        />
      )}
      <View style={styles.collectionOverlay}>
        {item.data.badgeLabel && (
          <View style={styles.collectionBadge}>
            <Text style={styles.collectionBadgeText}>{item.data.badgeLabel}</Text>
          </View>
        )}
        <Text style={styles.collectionTitle}>{item.data.title}</Text>
        {item.data.subtitle && (
          <Text style={styles.collectionSubtitle}>{item.data.subtitle}</Text>
        )}
        <Text style={styles.collectionCount}>
          {item.data.items.length} destination{item.data.items.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </Pressable>
  );
```

Add styles:

```typescript
collectionCard: {
  borderRadius: radius.card,
  overflow: 'hidden',
  marginBottom: spacing.lg,
  height: 180,
  backgroundColor: colors.borderSubtle,
},
collectionImage: {
  width: '100%',
  height: '100%',
},
collectionOverlay: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: spacing.lg,
  backgroundColor: 'rgba(0,0,0,0.45)',
},
collectionBadge: {
  alignSelf: 'flex-start',
  backgroundColor: colors.accent,
  paddingHorizontal: spacing.sm,
  paddingVertical: 3,
  borderRadius: radius.xs,
  marginBottom: spacing.xs,
},
collectionBadgeText: {
  fontFamily: fonts.medium,
  fontSize: 10,
  color: '#FFFFFF',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
},
collectionTitle: {
  fontFamily: fonts.semiBold,
  fontSize: 18,
  color: '#FFFFFF',
  lineHeight: 22,
},
collectionSubtitle: {
  fontFamily: fonts.regular,
  fontSize: 13,
  color: 'rgba(255,255,255,0.85)',
  marginTop: 2,
},
collectionCount: {
  fontFamily: fonts.regular,
  fontSize: 12,
  color: 'rgba(255,255,255,0.7)',
  marginTop: spacing.xs,
},
```

**Step 2: Commit**

```bash
git add app/(tabs)/explore/index.tsx
git commit -m "feat: render collection cards in Explore feed"
```

---

## Test Plan

### Manual Testing

1. **Collections resolve correctly**
   - Navigate to Explore tab
   - Verify collection cards appear with correct titles
   - Tap a collection → verify items match expected tags

2. **Tag inheritance works**
   - Add a tag to a country
   - Verify cities in that country appear in matching collections
   - (This is implicit — no explicit inheritance in v1, but can be added)

3. **Empty collections hidden**
   - Create a collection with tags that match nothing
   - Verify it doesn't appear in feed

4. **Collection page renders**
   - Tap any collection card
   - Verify hero, intro, and item list render
   - Verify tapping an item navigates correctly

5. **Sponsored collections disclosed**
   - Set `is_sponsored = true` on a collection
   - Verify sponsor banner appears on collection page

6. **Sort works**
   - Verify featured items appear first when `sort_by = 'featured_first'`

### Edge Cases

- Collection with exactly `min_items` items → should appear
- Collection with `max_items - 1` items → should appear with that count
- Collection with `min_items - 1` items → should NOT appear
- Empty `include_tags` array → should match nothing

---

## Summary

This plan delivers:

1. **Clear collection framework** with types, rules, and resolution logic
2. **Southeast Asia launch logic** with prioritized countries and ordering rationale
3. **Editorial collection system** that reads like articles but is data-driven
4. **Tag system design** with categories, inheritance model, and entity mapping
5. **Collection page behavior** with consistent rendering across entity types
6. **Scalability** that supports new regions and sponsored content without redesign
7. **8 implementation tasks** with exact code, file paths, and commit points

The system avoids hardcoding, uses tags for everything, and sets up Sola for personalization and monetization later.
