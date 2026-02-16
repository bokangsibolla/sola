# Explore Page UX Restructure

## Problem Statement

The Explore page is visually polished but conceptually unclear. Collections feel random, the feed treats all content as equal-weight cards, and there is no structural difference between a first visit and a daily visit. Countries, cities, collections, and content blur into one interleaved stream with no hierarchy of intent.

## Design Principles

1. **Geography first.** Countries are the primary organizing unit. Users think "where" before "what."
2. **No hardcoding.** Everything resolves from existing data: `is_featured`, `order_index`, `include_tags`, `destination_tags`.
3. **Confidence over inspiration.** Solo women need to feel "I can go here" — not just "this looks nice."
4. **Structured rotation over randomness.** Fixed zones, rotating content within zones.
5. **Tag-driven collections.** Collections are dynamic queries against `destination_tags`, never manually curated lists.

## Target Users

| User | Need | Current Friction |
|------|------|-----------------|
| First-time visitor | Understand scope, find starting point | No "start here" signal, unclear depth |
| Returning daily user | See something new, resume research | Feed is 100% deterministic, same every visit |
| Intent-driven user | Get to Thailand fast | Search scrolls away, no country listing |
| Browser | Daydream, explore themes | Collections feel disconnected, no progression |

## Page Structure: Six Zones

### Zone 1: Search (fixed, top)
- Moves from FlatList item to fixed position below AppHeader
- Always accessible, never scrolls off screen
- Uses existing `SearchBar` component and search screen

### Zone 2: Featured Editorial (one rotating card)
- Single prominent editorial collection card
- Rotates daily via day-of-week modulo against `order_index`-sorted featured collections
- Uses existing `EditorialCollectionCard` component
- Data: `getFeaturedExploreCollections()` with client-side rotation

### Zone 3: Countries Grid (primary navigation)
- All active countries in a 2-column grid
- Each card: hero image, name, one-line signal (badge_label/best_for/city count)
- Stable order (never shuffled) — users build spatial memory
- Data: `getCountries()` (existing)
- Navigates to existing `/explore/country/[slug]`

### Zone 4: Popular Cities (horizontal scroll)
- Featured cities across all countries
- Shows city name + country name for geographic context
- Date-seeded shuffle within featured set for daily variance
- Data: `getPopularCitiesWithCountry()` (existing, minus hardcoded priority slugs)
- Navigates to existing `/explore/city/[slug]`

### Zone 5: Collections/Themes (secondary discovery)
- Clearly labeled section ("Explore by theme" or similar)
- Shows all active collections (not just is_featured=true)
- Each card shows title + resolved item count ("5 destinations")
- Separated from destination cards — users understand these are lists, not places
- Data: `getFeaturedExploreCollections()` expanded to all active collections

### Zone 6: Community Signal (end of scroll)
- 1-2 community thread previews as social proof
- Links to Community tab (not DMs)
- Data: existing community thread queries

## Repeat Usage Strategy

| Mechanism | Zone | Method | Backend Change |
|-----------|------|--------|---------------|
| Editorial rotation | Zone 2 | Day-of-week modulo on collections array | None |
| City order shuffle | Zone 4 | Date-seeded sort within featured cities | None |
| Show all collections | Zone 5 | Remove is_featured filter, show all active | None |
| "NEW" badge | Zone 3/4 | Compare created_at to current date (14-day window) | None |
| Seasonal collections (future) | Zone 2/5 | valid_from/valid_to columns on explore_collections | 2 columns |

## Collections System Rules

1. Every collection answers a question a solo woman would ask
2. Minimum 3-4 resolved entities before a collection goes featured
3. Collections are typed by category: travel style / practical / women-first
4. Collections link down (to destinations), never sideways (to other collections)
5. Collections are reusable across contexts (explore, country pages, city pages)
6. Tag matching is OR — include_tags finds entities with ANY matching tag
7. exclude_tags removes unwanted matches
8. No hardcoded entity lists — always tag-resolved

## Women-First Integration

### Implicit (everywhere, unlabeled)
- Safety ratings visible on country cards
- Solo level on city cards
- Sort order favoring safer destinations for new users
- Community thread previews showing women's real questions
- Editorial copy with women-first voice

### Explicit (dedicated spaces)
- Women-first collections in themes section (female-only stays, walkable & well-lit)
- Women's Insights section on city pages (existing)
- Safety sections on country pages (existing)

### Never
- "SAFE FOR WOMEN" labels on every card
- Separate "women's section" within an app that's already for women
- Safety warnings as the primary signal

## Implementation Phases

### Phase 1: Tag Coverage
- Tag all 49 cities and 12 countries across 11 tag categories
- ~400-500 INSERT rows into destination_tags
- Script-assisted derivation from existing editorial content
- **Dependency: everything else**

### Phase 2: Explore Page Restructure
- 2a: Fix search bar position (above FlatList)
- 2b: Featured editorial slot with rotation
- 2c: Countries grid (new feed item type)
- 2d: Popular cities row (refactored from current city pairs/spotlights)
- 2e: Collections section (dedicated zone)
- 2f: Community signal (replace Meet Travellers card)
- 2g: Clean up dead code (unused components, duplicate rendering paths)

### Phase 3: Collection Expansion
- 3a: Convert 7 discovery lenses to explore_collections (consolidate systems)
- 3b: Add new collections as tag coverage allows
- 3c: Surface collections on country/city pages (reverse tag lookup)

### Phase 4: Freshness Mechanisms
- 4a: Date-based editorial rotation
- 4b: City order date-seeded shuffle
- 4c: "NEW" badge on recently added content
- 4d (future): Seasonal date-range collections

### Phase 5: Content Pipeline
- 5a: Tagging script (AI-assisted tag derivation from editorial content)
- 5b: Expand SEA destinations
- 5c: Populate sparse metadata fields (best_for, badge_label, short_blurb)

## What Gets Removed
- Hardcoded PRIORITY_SLUGS (Siargao/Ubud always first)
- Hardcoded Siargao fallback object
- Interleaved city pairs/spotlights/collections feed layout
- "Meet Travellers" card linking to DMs
- Unused feed item types (hero-grid, discovery-lenses, activity-cluster)
- Duplicate inline components in explore index
- Parallel unused rendering pipeline (ExploreFeed.tsx, FeedItem.tsx)
- Unused components (QuickActionsRow, PillarsRow, FeedEndCard, SegmentedControl)

## Files Affected

### Modified
- `data/explore/feedBuilder.ts` — new zone-based build logic
- `data/explore/useFeedItems.ts` — add countries fetch, remove hardcoded priority, add rotation
- `data/explore/types.ts` — new feed item types (countries-grid, popular-cities), remove dead types
- `app/(tabs)/explore/index.tsx` — restructured rendering, search bar repositioned
- `data/collections.ts` — potentially expand query to all active (not just featured)

### New
- `supabase/migrations/YYYYMMDD_expand_destination_tags.sql` — tag coverage migration
- Country grid card component (in `components/explore/cards/`)

### Removed (candidates)
- `components/explore/ExploreFeed.tsx`
- `components/explore/FeedItem.tsx`
- `components/explore/FeedEndCard.tsx`
- `components/explore/QuickActionsRow.tsx`
- `components/explore/PillarsRow.tsx`
- `components/explore/SegmentedControl.tsx`
- `components/explore/HorizontalCarousel.tsx`
