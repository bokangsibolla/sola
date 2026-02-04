# Explore Page Redesign

## Overview

A complete redesign of the Explore page for the Sola mobile app. The new design replaces the tab-based navigation with a unified, editorial-style feed that mixes content types intentionally.

**Design positioning:** Imagine Lonely Planet launched a modern, mobile-first app in 2026. Editorial, calm, informative, inspiring. Not playful or marketplace-first.

**Target audience:** Women-first solo travel app. The design communicates quality and trust.

## Core Principles

1. **Content-type driven sizing** — Card format indicates content type (editorial, country, city, activity)
2. **No tabs** — Single unified feed that interleaves content types
3. **Rhythmic scrolling** — Alternates between inspiration (wide, emotional) and specificity (scannable, actionable)
4. **Search as first-class** — Full-screen search experience, not an afterthought
5. **Editorial anchors** — Curated collections create breathing room and signal human curation
6. **Monetization-ready** — Sponsored content designed in from the start

## Typography Rules

- Do NOT use decorative/serif fonts for headings
- Use PlusJakartaSans throughout (Regular, Medium, SemiBold)
- Clear hierarchy: section label > item title > supporting text

---

## Page Structure

### Header

Minimal. Logo left, search icon right. No "Explore" title text.

### Feed Opening

Content begins immediately — no welcome message, no personalization. First content visible within top 60% of screen.

### Feed Rhythm Pattern

```
BEAT 1: Editorial Collection (inspiration)
BEAT 2: Country Pair (options)
BEAT 3: City Spotlight (zoom in)
BEAT 4: Activity Cluster (action)
BEAT 5: Editorial Collection (breathe)
...repeat with variation
```

### Feed End

Soft ending after ~15-20 content blocks:

```
"Looking for somewhere specific?"
[Search] [All countries]
```

---

## Card Designs

### Editorial Collection Cards

- **Size:** Full-width, 280-320px height
- **Layout:** Large background image, gradient overlay, white text
- **Typography:** Title 24px SemiBold, subtitle 14px Regular
- **Detail:** 3-4 small destination thumbnails at bottom
- **Feel:** Magazine cover

### Country Cards

- **Size:** Half-width (2-column), 1:1.1 aspect ratio
- **Layout:** Image fills card, name overlaid bottom-left
- **Typography:** Name 18px SemiBold white, subtitle below card 14px Regular textSecondary
- **Feel:** Clean, image-forward

### City Spotlight Cards

- **Size:** Full-width, 16:9 cinematic aspect ratio
- **Layout:** Wide image, title and country below
- **Typography:** City 20px SemiBold, country 14px Regular textSecondary
- **Feel:** Destination focus

### City Cards (in scroll)

- **Size:** Compact, horizontal scroll (3 visible + peek)
- **Layout:** 3:4 aspect ratio image, title below
- **Typography:** Name 16px Medium
- **Context:** Under country pages or editorial collections

### Activity Cards

- **Size:** Square 1:1, horizontal scroll clusters
- **Layout:** Image, title below (2 lines max)
- **Typography:** Name 14px Medium
- **Context:** Always grouped under a city ("Things to do in Lisbon")
- **Feel:** Scannable, utilitarian but beautiful

---

## Section Headers

Minimal, wayfinding only.

- **Typography:** 14px Medium, uppercase, letterspaced, textSecondary
- **Example:** `THINGS TO DO IN LISBON`
- **"See all":** Right-aligned, orange, tappable

---

## Search Experience

### Entry

Search icon in header. Tap opens full-screen search.

### Search Screen Layout

```
[Back arrow]                    [X clear]

[Search input - autofocused]
"Search countries, cities, or activities"

[Recent searches]
Lisbon · Japan · "hiking tours"

[Quick filters - chips]
[Countries] [Cities] [Things to do]

[Results as you type]
```

### Search Behavior

- Instant results (debounced 200ms)
- Unified search across all content types
- Results grouped by type with small labels
- Each row: **Name · Context**

### Empty State

```
No results for "xyzabc"

Try searching for a country, city, or activity name.
```

---

## Information Architecture

### Three User Modes

| Mode | Behavior | Support |
|------|----------|---------|
| Wandering | "Show me something" | Feed starts immediately, visual variety |
| Narrowing | "I'm thinking about Portugal" | Country → cities → activities drill-down |
| Hunting | "Hiking in Lisbon" | Search → direct result → detail page |

### Navigation Hierarchy

```
Explore Feed
    ↓ tap country
Country Page
    → Hero + editorial intro
    → Cities in [Country]
    → Why visit
    → Practical info
    ↓ tap city
City Page
    → Hero + editorial intro
    → Things to do (grouped)
    → Neighborhoods
    → Practical info
    ↓ tap activity
Activity Detail
    → Images
    → Description, highlights
    → Map location
    → Save to trip
```

### Editorial Collection Pages

```
[Hero + title]
[Editorial intro 2-3 sentences]
[Mixed destinations: countries + cities]
```

### Cross-Linking

- City pages show "Also in [Country]"
- Activity pages show "More in [City]"

---

## Advertising & Monetization

### Principle

Sponsored content must meet the same quality bar as organic content. If it can't, it doesn't belong.

### Placement Types

**1. Sponsored Editorial Collections**
- Full editorial collection, sponsored by tourism board/brand
- "Sponsored" label in textMuted below title
- Limited to 1 per ~10 feed items

**2. Promoted Destination Cards**
- Country or city card boosted in feed
- Same design as organic, "Sponsored" label below subtitle
- Limited to 1 per feed section

**3. Featured Experience**
- One sponsored slot in activity clusters
- "Sponsored" label under activity title
- Must be real bookable experience

**4. Collection Page Sponsorship**
- "Presented by [Logo]" at bottom of hero
- Sponsor supports content, doesn't control it

### Where Ads Do NOT Appear

- Search results
- Detail pages
- First feed item
- Back-to-back (never two sponsored in sequence)

---

## Component Structure

### Page Components

```
app/(tabs)/explore/
├── index.tsx              # Main feed
├── search.tsx             # Full-screen search
├── collection/[slug].tsx  # Editorial collection
├── country/[slug].tsx     # Country detail
├── city/[slug].tsx        # City detail
└── activity/[slug].tsx    # Activity detail
```

### Feed Components

```
components/explore/
├── ExploreFeed.tsx
├── FeedItem.tsx
│
├── cards/
│   ├── EditorialCollectionCard.tsx
│   ├── CountryCard.tsx
│   ├── CitySpotlightCard.tsx
│   ├── CityCard.tsx
│   └── ActivityCard.tsx
│
├── sections/
│   ├── CountryPairSection.tsx
│   ├── CitySpotlightSection.tsx
│   ├── ActivityClusterSection.tsx
│   └── SectionLabel.tsx
│
├── search/
│   ├── SearchScreen.tsx
│   ├── SearchInput.tsx
│   ├── SearchResults.tsx
│   ├── SearchResultRow.tsx
│   └── RecentSearches.tsx
│
└── FeedEndCard.tsx
```

### Data Layer

```
data/explore/
├── useFeedItems.ts       # Fetches + assembles feed
├── useSearch.ts          # Search with debounce
├── feedBuilder.ts        # Interleaves content types
└── types.ts              # FeedItem union type
```

### FeedItem Type

```typescript
type FeedItem =
  | { type: 'editorial-collection'; data: EditorialCollection }
  | { type: 'country-pair'; data: [Country, Country] }
  | { type: 'city-spotlight'; data: City; activities: Activity[] }
  | { type: 'activity-cluster'; data: Activity[]; cityName: string }
  | { type: 'end-card' };
```

---

## Data Requirements

### New Table: editorial_collections

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | Primary key |
| slug | text | URL-safe identifier |
| title | text | "Best first solo trips" |
| subtitle | text | "For first-timers who want ease" |
| hero_image_url | text | Cover image |
| destinations | jsonb | Array of {type, id} refs |
| is_sponsored | boolean | Monetization flag |
| sponsor_name | text | Optional sponsor |
| order_index | integer | Feed positioning |
| is_active | boolean | Publish control |

### Enhanced Fields

| Table | Field | Purpose |
|-------|-------|---------|
| countries | is_sponsored, sponsor_name | Promoted placements |
| cities | is_sponsored, sponsor_name | Promoted placements |
| places | is_sponsored, sponsor_name | Featured experiences |

---

## What's Removed

- `IconTabs` component (no more tabs)
- `WelcomeHeader` (no greeting)
- Decorative serif font usage on Explore
- Generic `HorizontalCarousel`
- Decorative accent lines

## What's Preserved

- Design system (colors, spacing, radius)
- Card interactions (spring animations)
- Supabase data model
- Navigation to detail pages
- Favorites functionality
- PostHog analytics

---

## Success Criteria

1. Feed loads with mixed content types visible immediately
2. Users can scroll through varied visual rhythm without monotony
3. Search opens full-screen with instant results
4. Editorial collections feel distinct and magazine-like
5. Sponsored content is clearly labeled but visually native
6. Navigation drill-down works: feed → country → city → activity
