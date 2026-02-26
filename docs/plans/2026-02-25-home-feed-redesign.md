# Home Feed Redesign — New User Notice Board

**Date**: 2026-02-25
**Status**: Approved

## Problem

The home feed for new users is sparse — a few profile nudges, one city card, one collection, a community thread, and a "plan your first trip" nudge. With 658 places, 75 cities, and active community threads in the DB, the app should feel alive from the first scroll.

## Design

A "notice board" home feed that mixes curated place content with feature-advertising cards. Busy, visual, useful from day one. Gradually transitions to the existing trip-focused feed as the user engages.

## Feed Layout (New User)

| Position | Card Type | Content |
|----------|-----------|---------|
| 1 | Hero Place Card | Full-width popular place, different city each load |
| 2 | Feature Card | "Find people to explore with" → Activities tab |
| 3 | Horizontal Place Row | "Where to stay" — hostels, hotels, guesthouses |
| 4 | Feature Card | "Plan your first trip" → Trip creation |
| 5 | Horizontal Place Row | "Cafes & coworking" — cafes, coworking, restaurants |
| 6 | Feature Card | "Ask solo women travelers" → Community tab |
| 7 | Hero Place Card | Second full-width place, different city from #1 |
| 8 | Community Thread | Trending thread from CommunityCard |

## Card Designs

### Feature Cards (Icon + Text)
- Row layout: 48px circular icon container (orangeFill bg, orange Ionicon) on left
- Headline: 16px semiBold
- Description: 13px regular, muted, one line
- Background: white, 1px border (neutralFill), radius.cardLg
- Right: subtle chevron-right icon
- Whole card pressable → navigates to feature

| Card | Icon | Headline | Description | Target |
|------|------|----------|-------------|--------|
| Buddies | people-outline | Find people to explore with | See who's traveling to the same places as you | Activities tab |
| Trips | airplane-outline | Plan your first trip | Build your itinerary, day by day | Trip creation |
| Community | chatbubbles-outline | Ask solo women travelers | Real answers from women who've been there | Community tab |

### Hero Place Card (Full-width)
- Height: 200px, full-width image + dark gradient overlay
- Bottom-left: place name (18px semiBold white), city + country (13px white, 0.8 opacity)
- Top-left: frosted pill label — "POPULAR WITH SOLO WOMEN" or place type
- Data: places with good images (place_media), different cities for variety
- Taps → place detail screen

### Horizontal Place Row
- Section header: 17px semiBold, left-aligned, no icons
- Horizontal FlatList, 4-5 cards, no scroll indicator
- Cards: 140px wide, 160px tall, image + gradient overlay
- Bottom: place name (13px semiBold white), city (11px white, 0.7 opacity)
- Gap: spacing.sm (8px), row padding: spacing.screenX (24px)
- Cards peek off-screen right to invite scrolling
- Taps → place detail screen

**Row categories**:
- "Where to stay" → hostel, hotel, guesthouse
- "Cafes & coworking" → cafe, coworking, restaurant

## Data Layer

### New Hook: `useHomeFeedV2()`
Located in `data/home/useHomeFeedV2.ts`:
- Fetches 2 hero places: random popular places with images, from different cities
- Fetches row places: 4-5 per category using place_types filter
- Reads feature card dismissal state from AsyncStorage
- Reuses existing hooks for community thread

### Feature Card Dismissal
AsyncStorage key: `home_feature_seen`
- `buddies_seen` → set true when user visits Activities/Travelers tab
- `trip_created` → set true when user creates first trip
- `community_visited` → set true when user visits Community tab

### Replacement When Dismissed
- `buddies_seen` → horizontal row: "Rooftop bars & nightlife" (bars, clubs, rooftops)
- `trip_created` → horizontal row: "Experiences & tours" (tours, activities, landmarks)
- `community_visited` → 3rd hero place card (new city)

## Transition to Existing Feed

Once the user has any trip (planning/active/returned state from current card engine), the feed switches entirely to the existing system — trip cards, stats, travel map, etc. The new notice board layout only applies to `new` and `idle-with-no-trips` states.

The existing `cardEngine.ts` and `useCardFeed()` remain untouched for active users. The home screen checks user state first and renders either the new feed or the existing one.

## Files to Create/Modify

### New Files
- `data/home/useHomeFeedV2.ts` — data hook for new user feed
- `components/home/cards/FeatureCard.tsx` — icon + text feature card
- `components/home/cards/HeroPlaceCard.tsx` — full-width place hero
- `components/home/cards/PlaceRow.tsx` — horizontal scroll row of places
- `components/home/cards/PlaceRowCard.tsx` — individual card in horizontal row

### Modified Files
- `app/(tabs)/home/index.tsx` — conditional render: new feed vs existing feed
- `data/api.ts` — new queries: `getHeroPlaces()`, `getPlacesByCategory()`

## Constraints
- Max 8 cards in feed (maintained)
- All design tokens from constants/design.ts
- 44pt minimum touch targets
- No shadows, 1px borders
- PlusJakartaSans only
