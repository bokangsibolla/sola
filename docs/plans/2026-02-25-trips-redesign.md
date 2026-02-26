# Trips Redesign — Seamless Planning

> Design Document | February 25, 2026
>
> Transforms the Trips tab from a confusing demo-driven experience into an intelligent, unified planning companion that serves browsers, planners, and active travelers equally well.

---

## Problem Statement

The current Trips experience has three issues:

1. **The demo trip is confusing.** `TripEmptyState.tsx` fetches Bangkok and Kyoto data to build a fake "EXAMPLE TRIP" card that links to `demo.tsx`. Nobody wants a pretend trip playground. It creates friction and communicates "this feature isn't ready."
2. **Trip creation has too many steps.** The `new.tsx` wizard opens with a "What kind of trip?" modal (`plan_future | currently_traveling | past_trip`), then destination search, then dates, then name. Four decisions before the user touches what matters — building days.
3. **Adding places is disconnected from Discover.** A user browses a city page, finds a great restaurant, but has no way to save it to their trip without leaving the browsing context and navigating to the Trips tab.

## Core Insight — Three User Types

| User Type | Intent | Current Experience | Target Experience |
|-----------|--------|--------------------|-------------------|
| **The Browser** | Dreaming, not committed | Hits empty state with fake demo trip | Sees personalized inspiration from browsing history |
| **The Planner** | Has destination and rough dates | 4-step wizard before they can build days | 2-step flow (where + when) with saved places pre-loaded |
| **The Traveler** | On a trip right now, needs today's plan | Active trip card mixed with upcoming list | Hero card with today's plan, one tap to current day |

---

## Section 1: The Trips Tab — Unified Scroll

### 1.1 Empty State (First-Time User)

**Headline:** "Where to next?"

**Hybrid cards based on signals:**

- If the user has browsed cities in Discover (tracked via PostHog or a lightweight `recently_viewed_cities` table), show personalized cards:
  - "You've been exploring Chiang Mai" with the city's hero image and a "Start planning" CTA
  - Up to 2 recently browsed cities, each tappable
- If no browsing signals exist, show 3 popular-with-solo-women city cards from the database (reuse `getPopularCitiesWithCountry()` from `data/api.ts`)
- Below the inspiration cards: a subtle text link "Currently traveling? Log your trip" — opens the streamlined trip creation with today's date pre-filled

**What gets removed:** The `TripEmptyState.tsx` component with its mock Bangkok/Kyoto data, `fetchExampleTrip()`, the "EXAMPLE TRIP" badge, and the link to `demo.tsx`.

### 1.2 Active User — Unified Scrollable Feed

The Trips tab becomes a single `ScrollView` with these sections in order:

1. **Active trip hero card** (if traveling now)
   - Full-width card with cover photo, trip title, "Day 4 of 10"
   - Shows today's first upcoming activity with thumbnail
   - Single tap opens the trip day view for today
   - Uses the existing `CurrentTripCard` component as a starting point, enhanced with today's plan summary

2. **Upcoming trips**
   - Section header: "UPCOMING"
   - Cards with cover photo, dates, stop count, country flags
   - Tap opens trip detail
   - Reuses existing `TripListCard` component

3. **Wishlist section**
   - Section header: "Places I want to go"
   - Grid layout (2 columns) of saved countries/cities with hero photos and flag emoji
   - Each card has a subtle "Plan a trip" text action
   - Tap the card itself navigates to the country/city page in Discover
   - New component: `WishlistGrid`

4. **Past trips** (collapsible, same as current)

5. **Bottom CTA**
   - "Plan a new trip" button, dashed border, always accessible
   - Same pattern as current `newTripButton` style

---

## Section 2: Saving — The Wishlist & Trip Pipeline

### 2.1 Saving From Anywhere in the App

Every place card, city page hero, and country page hero gets a **bookmark icon** (top-right corner, `bookmark-outline` Ionicon). Behavior on tap:

**If user has no active/upcoming trips for that destination:**
- Save to wishlist instantly
- Small toast confirmation: "Saved to wishlist"
- No sheet, no friction

**If user has a matching trip (active or upcoming trip with a stop in the same city/country):**
- Quick bottom sheet slides up with two options:
  - "Save to wishlist" — saves the entity to the global wishlist
  - "Add to [Trip Name]" — adds to `trip_saved_items` for that trip
- Sheet auto-dismisses after selection with toast confirmation

**Component:** `BookmarkButton` — reusable pressable that encapsulates the save logic. Props: `entityType`, `entityId`, `cityId?`, `countryIso2?`.

**Component:** `SaveSheet` — extends the existing `components/trips/SaveSheet/SaveSheet.tsx` with wishlist option.

### 2.2 Trip-Aware Browsing in Discover

When the user has a trip being planned for a specific city and they're browsing that city's page in Discover:

- A **floating pill** appears at the bottom of the city page (above the tab bar):
  - "Planning Chiang Mai -- 12 places saved"
  - Tapping it navigates to the trip detail screen
  - Dismissible with a small "X"
- Individual place cards on that city page show a **"+" icon** instead of the bookmark — one tap adds directly to the trip's saved places via `addTripSavedItem()`

**Component:** `TripContextPill` — positioned absolute, bottom of city page. Uses `useTripForCity(cityId)` hook to check if a matching trip exists.

**Hook:** `useTripForCity(cityId: string)` — queries `trip_stops` for any planned/active trip with `city_id = cityId`. Returns the trip if found, null otherwise.

### 2.3 Wishlist to Trip Conversion

On the wishlist grid, each destination card has a "Plan a trip" action. Tapping it:

1. Creates a new trip pre-filled with that destination (city or country)
2. Pulls in any places the user has already saved to their wishlist for that city/country and inserts them as `trip_saved_items`
3. Navigates to the streamlined trip creation flow with destination pre-filled, skipping straight to the date picker (Step 2)

This means saved places become the starting inventory for the itinerary. No re-searching things you already found.

---

## Section 3: Trip Creation — Streamlined

### 3.1 Current Flow (Being Replaced)

```
Step 1: "What kind of trip?" modal (plan_future | currently_traveling | past_trip)
Step 2: Destination search + stop chips
Step 3: Date pickers per stop
Step 4: Trip name (optional)
```

### 3.2 New Flow

```
Step 1: "Where are you going?" — full-screen search
Step 2: "When?" — date pickers (optional)
→ Create → lands on trip detail
```

**Step 1: Where?**

- Full-screen search. Headline: "Where are you going?"
- Uses existing `searchDestinations()` from `data/api.ts`
- Search results: cities and countries from the Sola database
- Add multiple stops — chips stack below the search bar (same chip pattern as current `new.tsx`)
- If coming from a wishlist card, destination is pre-filled — skip straight to Step 2

**Step 2: When?**

- Date pickers per stop (reuse the existing date chaining logic from `new.tsx`)
- "I don't have dates yet" toggle — skips dates entirely, creates a draft trip
- Trip name auto-generates from destinations:
  - Single stop: "Chiang Mai"
  - Multi-stop same country: "Thailand"
  - Multi-stop different countries: "Thailand -- Vietnam"
  - Always editable but not required

**Trip kind inference (replaces the modal):**

| Condition | Inferred Status |
|-----------|----------------|
| No dates set | `draft` |
| Future dates | `planned` |
| Current dates (arriving <= today <= leaving) | `active` |
| Past dates (leaving < today) | `completed` |

The `TripKind` type and `statusFromKind()` function in `tripApi.ts` get replaced with date-based inference in `createTrip()`.

**On "Create" tap:** navigates to trip detail with saved places ready to organize.

### 3.3 Files Changed

- **`app/(tabs)/trips/new.tsx`** — rewrite. Remove `showKindSheet` modal, remove `TRIP_KINDS` array, remove `KIND_LABELS`. Keep destination search, date pickers, stop chip logic.
- **`data/trips/tripApi.ts`** — update `createTrip()` to infer status from dates instead of `tripKind` param.
- **`data/trips/types.ts`** — deprecate `TripKind` type. Keep for backward compatibility but stop using it in creation flow.

---

## Section 4: Itinerary Building — Smart Auto-Fill

### 4.1 Trip Detail Screen — Command Center

**Route:** `app/(tabs)/trips/[id]/index.tsx` (existing, restructured)

**Top section:** Cover photo, trip title, date range, stop flags. Reuse `TripOverview/TripHeader.tsx`.

### 4.2 State A: Pre-Itinerary (No Days Built Yet)

Saved places shown as rich cards in a 2-column grid — photos, names, type pills. This is the **planning board**.

- Each card shows: place photo, name, type pill (using `blockTypeColors.ts` for color)
- "Add more" search button opens the smart search sheet (Section 5)
- Can remove saved places with swipe-left or long-press menu

When ready, prominent button: **"Build my itinerary"**

**Component:** `PlanningBoard` — grid of `SavedPlaceCard` components with add/remove actions.

### 4.3 Smart Auto-Fill Algorithm

Tapping "Build my itinerary" triggers the auto-fill engine:

**Input:** List of saved places (with `place_type`, `lat/lng`, `city_area_id`), trip date range, number of days.

**Algorithm steps:**

1. **Generate trip days** — create `trip_days` records for each date in the range
2. **Classify places by time-of-day fit:**
   - Morning: `cafe`, `landmark`, `activity`, `tour`
   - Afternoon: `activity`, `landmark`, `tour`, `market`, `wellness`, `spa`
   - Evening: `restaurant`, `bar`, `rooftop`, `club`
   - All-day: `beach`, `neighborhood`
3. **Cluster by proximity** — group places by `city_area_id` first, then by haversine distance (reuse `haversineKm()` from `suggestionEngine.ts`). Places within 1km of each other cluster together.
4. **Distribute across days:**
   - Target 3-5 activity blocks per day (`balanced` pace)
   - Keep same-cluster places on the same day
   - Don't put 3+ places of the same type on one day (type diversity)
   - Slot restaurants at meal times (12:00, 19:00)
   - Slot nightlife in the evening (20:00+)
   - Slot landmarks/activities in morning and afternoon
5. **Assign accommodations** — `trip_accommodations` auto-span their check-in/check-out dates, appear as banners (using existing `AccommodationBanner.tsx`)
6. **Insert transport blocks** — if trip has multiple stops with different cities, insert transport blocks between destination changes

**Output:** Creates `trip_days` and `itinerary_blocks` records in the database.

**UX:** Brief building animation (progress indicator with "Building your itinerary..." text), then day-by-day plan appears.

**Module:** `data/trips/autoFillEngine.ts` — pure function that takes saved items + trip metadata, returns `CreateBlockInput[]` grouped by day.

### 4.4 State B: Itinerary Built — Day-by-Day View

**Horizontal day selector** at top — scrollable pills: "Day 1 -- Mon", "Day 2 -- Tue", etc. Active day highlighted with `orangeFill` background and `orange` text.

**Component:** `DaySelector` — horizontal `FlatList` of day pills.

**Selected day shows rich cards in order:**

Each card shows:
- Place photo thumbnail (60x60), left side
- Place name (bold) + type pill (subtle)
- Neighborhood/area name
- Time slot if set (e.g., "10:00 AM")
- Estimated cost if available
- One-line note if user added one

Accommodation banner at top of each day (reuse `AccommodationBanner.tsx`).

Gaps between items show context-aware suggestions: "You need dinner -- 3 picks nearby" (powered by the existing `suggestionEngine.ts` analyzers).

**Manual adjustments after auto-fill:**
- Long-press a card to drag and reorder within a day (use `react-native-draggable-flatlist`)
- Swipe left on a card: "Move to..." (pick another day) or "Remove"
- Tap "+" between any two items to add something new
- "Add more" button at bottom of each day opens smart search

---

## Section 5: Adding Places Inside a Trip — Smart Search

### 5.1 The Smart Search Sheet

When you tap "+" or "Add more," a bottom sheet slides up.

**Top section: Context-aware suggestions**

The app reads the current day's blocks and surfaces what's missing:

| Day State | Suggestion |
|-----------|------------|
| Morning empty | "Start your day" — cafes and breakfast spots nearby |
| Temple + lunch but nothing after | "Afternoon ideas" — activities, markets, neighborhoods |
| No dinner | "Evening picks" — restaurants near last afternoon activity |
| Day looks full (4+ blocks) | "Your day looks good" — no pushy suggestions |

Each suggestion row shows 3-4 rich cards (photo, name, type, cost) with quick "Add" button. One tap adds to the day in the right time slot.

**Hook:** `useDaySuggestions(tripDayId, blocks)` — analyzes the day's blocks and returns categorized suggestions using the existing `detectMissingMeals()`, `detectLongGaps()`, and `detectPaceMismatch()` from `suggestionEngine.ts`, plus a new place-fetching layer.

### 5.2 Browse by Category

Below the context-aware suggestions:

**Horizontal filter pills:** All -- Eat -- See -- Do -- Stay -- Nightlife -- Wellness

Mapping to place types:
- **Eat**: `restaurant`, `cafe`, `bar`, `rooftop`
- **See**: `landmark`, `temple`, `museum`, `gallery`
- **Do**: `activity`, `tour`, `market`, `neighborhood`
- **Stay**: `hotel`, `hostel`, `homestay`, `guesthouse`
- **Nightlife**: `bar`, `club`, `rooftop`
- **Wellness**: `wellness`, `spa`

Results sorted by:
1. Proximity to other things on the current day (haversine from day's centroid)
2. Places saved but not yet assigned to a day (highlighted with "Saved" badge)
3. Popular with solo women (from existing database quality signals)

Each result is a rich card — photo, name, type, area, cost estimate. Tap card to see full preview (`PlacePreviewSheet.tsx`), tap "+" to add.

**Search bar** at top for free-text search within the city (reuses `searchDestinations()` with city filter).

**Component:** `SmartSearchSheet` — bottom sheet with suggestion rows, filter pills, and search.

---

## Section 6: Day View — Rich Cards

### 6.1 Day Header

"Day 3 -- Wednesday, 5 March" with city name. If the day is today, an orange "TODAY" badge appears (reuse `TripMode/TodayBadge.tsx`).

### 6.2 Accommodation Banner

If a stay covers this night: "Staying at [name]" with address and check-in info. Reuses existing `AccommodationBanner.tsx`.

### 6.3 Timeline of Rich Cards

Each card in the timeline:

```
┌─────────────────────────────────────────┐
│ [Photo 60x60]  Place Name          [...]│
│                TYPE PILL                 │
│                Neighborhood              │
│                10:00 AM  ·  ~$15         │
│                "Try the mango sticky..." │
└─────────────────────────────────────────┘
        │  subtle connector line
       [+] ← tap to add between items
        │
┌─────────────────────────────────────────┐
│ [Photo 60x60]  Next Place          [...]│
│                ...                       │
└─────────────────────────────────────────┘
```

**Component:** `DayTimelineCard` — enhanced version of existing `ItineraryBlock.tsx` and `TimelineBlockCard.tsx` with photo thumbnail, type pill, area name, cost, and note.

**Between each card:** Subtle connector line (1px, `borderDefault` color) with small circular "+" button. Tapping "+" opens the smart search sheet anchored to that time gap.

**Bottom of day:**
- Context-aware suggestion row (if gaps exist, powered by `analyzeDaySuggestions()`)
- "Add to this day" button

### 6.4 Interactions

| Gesture | Action |
|---------|--------|
| Tap card | Expanded view with full description, photos, address, hours, booking link, safety notes |
| Long-press | Drag to reorder within the day |
| Swipe left | "Move to Day X" / "Remove" action buttons |
| Swipe right (live mode only) | Mark as "Done" with checkmark |

---

## Section 7: Live Mode — The Traveling User

### 7.1 Trigger

When `trip.arriving <= today && trip.leaving >= today`, the trip shifts into live mode. The existing `status: 'active'` flag continues to work, but date-based detection becomes the primary signal.

### 7.2 Trips Tab in Live Mode

Active trip becomes the hero card. Shows:
- "Day 4 of 10"
- Today's first upcoming (not yet completed) activity with photo
- Single tap opens the day view for today

Same layout as current `CurrentTripCard` but enhanced with today's activity preview.

### 7.3 Day View in Live Mode

- Completed items subtly dimmed (`opacity: 0.4`) with checkmark icon
- Current/next item highlighted with orange left border (3px, `colors.orange`)
- **"How are you feeling?"** prompt mid-day — appears after 2+ items are marked done
  - Tap to log a comfort check: calm / happy / uneasy / unsafe
  - Uses existing `MoodTag` type and `createTripEntry()` with `entryType: 'comfort_check'`
  - Feeds into the journal automatically
- **Quick-add floating button** (FAB, bottom-right) for spontaneous entries:
  - "Found a great spot" → creates a tip entry
  - "Travel tip" → creates a tip entry
  - "Photo moment" → creates a highlight entry

### 7.4 Auto-Journal

Journal entries build themselves from user actions:
- Comfort checks, arrivals, departures, tips all become `trip_entries`
- End-of-day nudge (push notification): "Day 4 done — any highlights?"
- The journal tab (`app/(tabs)/trips/[id]/journal.tsx`) becomes a trip diary without feeling like homework

Uses existing `TripEntry` types and `createTripEntry()` API. No new tables needed.

---

## What Gets Removed

| File | Reason |
|------|--------|
| `app/(tabs)/trips/demo.tsx` | Example trip playground — replaced by real content |
| `components/trips/TripEmptyState.tsx` | Fake Bangkok/Kyoto demo card — replaced by hybrid empty state |
| Trip kind modal in `new.tsx` | "What kind of trip?" selector — inferred from dates |
| `TRIP_KINDS` constant in `new.tsx` | No longer needed |
| `KIND_LABELS` constant in `new.tsx` | No longer needed |

## What Gets Added

| Feature | Key Files |
|---------|-----------|
| Wishlist system | `data/wishlist/` directory, new DB table |
| Bookmark icon on place cards, city pages, country pages | `components/ui/BookmarkButton.tsx` |
| Trip-aware floating pill in Discover | `components/explore/TripContextPill.tsx` |
| Smart auto-fill itinerary builder | `data/trips/autoFillEngine.ts` |
| Context-aware suggestion engine for day gaps | Extension of `data/trips/suggestionEngine.ts` |
| Category filter pills in trip search | `components/trips/CategoryFilterPills.tsx` |
| Live mode with comfort checks | Extension of `components/trips/TripMode/` |
| Auto-journal from actions | Extension of existing journal system |
| Unified scrollable Trips tab | Restructured `app/(tabs)/trips/index.tsx` |
| Smart search sheet | `components/trips/SmartSearchSheet.tsx` |
| Planning board grid | `components/trips/PlanningBoard.tsx` |
| Day selector pills | `components/trips/DaySelector.tsx` |
| Enhanced day timeline cards | `components/trips/DayTimelineCard.tsx` |

## Existing Infrastructure We Keep

- Multi-stop trip creation with date chaining (logic in `new.tsx`)
- `trip_days` + `itinerary_blocks` schema (from `itineraryTypes.ts`)
- `trip_accommodations` and `trip_transports` tables
- `trip_entries` / journal entries system
- Trip detail screen structure (`app/(tabs)/trips/[id]/`)
- Day timeline view (`app/(tabs)/trips/day/[dayId].tsx`) — enhanced with rich cards
- All trip API hooks: `useTrips`, `useTripDetail`, `useItinerary`
- Suggestion engine: `suggestionEngine.ts` analyzers (time conflicts, gaps, meals, pace, proximity)
- `AccommodationBanner.tsx`, `TodayBadge.tsx`, `TripModeCard.tsx`
- `blockTypeColors.ts` — type-to-color mapping for pills

---

## Technical Considerations

### New Database Tables

#### `wishlists`

```sql
CREATE TABLE wishlists (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('city', 'country', 'place')),
  entity_id   text NOT NULL,  -- city.id, country.iso2, or place.id
  notes       text,
  saved_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, entity_type, entity_id)
);

-- RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own wishlist"
  ON wishlists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_wishlists_user ON wishlists (user_id);
CREATE INDEX idx_wishlists_user_entity ON wishlists (user_id, entity_type, entity_id);
```

**Notes:**
- `entity_id` is `text` (not `uuid`) because country references use `iso2` (2-char string) while cities and places use UUIDs. The unique constraint on `(user_id, entity_type, entity_id)` prevents duplicates.
- No FK on `entity_id` because it references different tables depending on `entity_type`. Integrity is enforced at the application layer.

#### Optional: `recently_viewed_cities`

```sql
CREATE TABLE recently_viewed_cities (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city_id   uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, city_id)
);
```

This is optional — can be replaced by PostHog event queries or AsyncStorage tracking on the client. The DB approach is simpler for querying in the empty state.

### Smart Auto-Fill Algorithm — Detailed Considerations

**Time-of-day slotting rules:**

```typescript
const TIME_SLOTS: Record<string, { start: string; end: string }> = {
  // Morning activities
  cafe:        { start: '08:00', end: '09:30' },
  landmark:    { start: '09:00', end: '11:00' },
  temple:      { start: '09:00', end: '11:00' },
  activity:    { start: '10:00', end: '12:00' },
  tour:        { start: '09:00', end: '12:00' },
  // Afternoon activities
  market:      { start: '14:00', end: '16:00' },
  wellness:    { start: '14:00', end: '16:00' },
  spa:         { start: '14:00', end: '16:00' },
  museum:      { start: '13:00', end: '15:00' },
  // Evening activities
  restaurant:  { start: '19:00', end: '21:00' },
  bar:         { start: '20:00', end: '22:00' },
  rooftop:     { start: '17:00', end: '19:00' },
  club:        { start: '21:00', end: '23:00' },
};
```

**Proximity clustering:**
- Group places by `city_area_id` first (same neighborhood = same cluster)
- Within clusters, sort by haversine distance using existing `haversineKm()` from `suggestionEngine.ts`
- Assign entire clusters to the same day when possible

**Type diversity rule:**
- Max 2 places of the same `place_type` per day
- If a cluster has 3 temples, split the third to another day

**Pace management:**
- `relaxed`: 2-3 blocks per day
- `balanced` (default): 3-5 blocks per day
- `packed`: 5-7 blocks per day
- Trip pace is inferred as `balanced` unless explicitly set

**Edge cases:**
- If saved places exceed the number of days (e.g., 20 places for 3 days), distribute evenly and surface overflow as "Unscheduled" section
- If no lat/lng data is available for places, fall back to type-based distribution only (skip proximity clustering)
- If the trip has no dates (draft), create unnumbered days and skip date headers

### Components — Create vs Modify

**New components to create:**

| Component | Location | Purpose |
|-----------|----------|---------|
| `BookmarkButton` | `components/ui/BookmarkButton.tsx` | Reusable save/bookmark icon for place cards, city pages, country pages |
| `TripContextPill` | `components/explore/TripContextPill.tsx` | Floating pill on Discover city pages when user has a matching trip |
| `WishlistGrid` | `components/trips/WishlistGrid.tsx` | 2-column grid of wishlist items on Trips tab |
| `WishlistCard` | `components/trips/WishlistCard.tsx` | Individual wishlist destination card |
| `PlanningBoard` | `components/trips/PlanningBoard.tsx` | Grid of saved places before itinerary is built |
| `SavedPlaceCard` | `components/trips/SavedPlaceCard.tsx` | Rich card for a saved place on the planning board |
| `DaySelector` | `components/trips/DaySelector.tsx` | Horizontal scrollable day pills |
| `DayTimelineCard` | `components/trips/DayTimelineCard.tsx` | Rich card for a single place in the day timeline |
| `SmartSearchSheet` | `components/trips/SmartSearchSheet.tsx` | Bottom sheet with context-aware suggestions + category browse |
| `CategoryFilterPills` | `components/trips/CategoryFilterPills.tsx` | Horizontal filter pills (Eat, See, Do, Stay, etc.) |
| `TripsEmptyStateV2` | `components/trips/TripsEmptyStateV2.tsx` | New empty state with browsing history cards or popular cities |
| `ComfortCheckPrompt` | `components/trips/TripMode/ComfortCheckPrompt.tsx` | Mid-day "How are you feeling?" prompt |
| `QuickAddFAB` | `components/trips/TripMode/QuickAddFAB.tsx` | Floating action button for spontaneous entries in live mode |

**Existing components to modify:**

| Component | Changes |
|-----------|---------|
| `CurrentTripCard.tsx` | Add today's activity preview with photo |
| `TripListCard.tsx` | Minor — add stop count display |
| `AccommodationBanner.tsx` | No changes, reuse as-is |
| `TodayBadge.tsx` | No changes, reuse as-is |
| `ItineraryBlock.tsx` | Enhance with photo thumbnail, type pill, area name |
| `TimelineBlockCard.tsx` | Enhance with richer card layout |
| `AddStopSheet.tsx` | Replace with `SmartSearchSheet` |
| `SaveSheet/SaveSheet.tsx` | Add wishlist option alongside trip option |
| `TripDaySuggestions.tsx` | Connect to context-aware suggestions |
| `PlacePreviewSheet.tsx` | Add "Add to trip" and "Save to wishlist" actions |

### Data Hooks Needed

**New hooks:**

| Hook | File | Purpose |
|------|------|---------|
| `useWishlist()` | `data/wishlist/useWishlist.ts` | Fetch user's wishlist items with city/country/place data |
| `useWishlistMutations()` | `data/wishlist/useWishlist.ts` | Add/remove wishlist items with optimistic updates |
| `useIsWishlisted(entityType, entityId)` | `data/wishlist/useWishlist.ts` | Check if an entity is in the user's wishlist (for bookmark icon state) |
| `useTripForCity(cityId)` | `data/trips/useTripForCity.ts` | Find active/planned trip matching a city (for trip-aware Discover browsing) |
| `useAutoFill(tripId)` | `data/trips/useAutoFill.ts` | Trigger and track the auto-fill itinerary build |
| `useDayGapSuggestions(tripDayId)` | `data/trips/useDayGapSuggestions.ts` | Fetch context-aware place suggestions for gaps in a day |
| `useRecentlyViewedCities()` | `data/explore/useRecentlyViewedCities.ts` | Fetch recently viewed cities for empty state personalization |

**New API functions:**

| Function | File | Purpose |
|----------|------|---------|
| `getWishlistItems(userId)` | `data/wishlist/wishlistApi.ts` | Fetch all wishlist items with joined entity data |
| `addToWishlist(userId, entityType, entityId)` | `data/wishlist/wishlistApi.ts` | Upsert a wishlist item |
| `removeFromWishlist(userId, entityType, entityId)` | `data/wishlist/wishlistApi.ts` | Delete a wishlist item |
| `getWishlistForDestination(userId, entityType, entityId)` | `data/wishlist/wishlistApi.ts` | Get all wishlisted places for a specific city/country |
| `buildAutoFillItinerary(tripId, savedItems, days)` | `data/trips/autoFillEngine.ts` | Core auto-fill algorithm |
| `getPlaceSuggestionsForGap(cityId, timeSlot, excludeIds)` | `data/trips/suggestionApi.ts` | Fetch places that fit a time gap |

**Existing hooks to extend:**

| Hook | Changes |
|------|---------|
| `useTrips()` | Add wishlist section to return value |
| `useTripDetail()` | Add `hasDays` boolean to indicate if itinerary is built |
| `useItinerary()` | Add block completion tracking for live mode |

### Migration Plan

**Migration file:** `supabase/migrations/20260225_wishlist_schema.sql`

Contents: `wishlists` table creation, RLS policies, indexes (see schema above).

Safe to run: Yes (CREATE TABLE IF NOT EXISTS, no destructive operations).

### Implementation Phases

**Phase 1 — Foundation (Wishlist + Streamlined Creation)**
1. Create `wishlists` table and API layer
2. Build `BookmarkButton` component
3. Simplify `new.tsx` (remove kind modal, add date inference)
4. Build `TripsEmptyStateV2` with popular cities
5. Integrate wishlist grid into Trips tab

**Phase 2 — Smart Planning (Auto-Fill + Day View)**
1. Build `autoFillEngine.ts`
2. Build `PlanningBoard` and `SavedPlaceCard`
3. Build `DaySelector` and `DayTimelineCard`
4. Build `SmartSearchSheet` with category filters
5. Wire up "Build my itinerary" flow

**Phase 3 — Discover Integration (Trip-Aware Browsing)**
1. Build `TripContextPill` for city pages
2. Add "+" icons on place cards when trip matches
3. Connect `SaveSheet` to both wishlist and trip paths
4. Add recently viewed cities tracking

**Phase 4 — Live Mode (Active Travelers)**
1. Add completion tracking to day blocks
2. Build `ComfortCheckPrompt`
3. Build `QuickAddFAB`
4. Add auto-journal entry creation
5. End-of-day notification nudge

### Performance Considerations

- **Wishlist queries** should be lightweight. The `wishlists` table will be small per user (tens to low hundreds of rows). Index on `(user_id)` is sufficient.
- **Auto-fill** is a client-side algorithm operating on small datasets (typically 5-30 saved places). No server-side computation needed.
- **Trip-aware Discover browsing** (`useTripForCity`) should cache the result per session to avoid repeated queries on every city page navigation. Use React Query's `staleTime: 5 * 60 * 1000` (5 minutes).
- **Smart search suggestions** involve querying places by city + type. These queries already exist in `data/city/cityApi.ts` (`getPlacesByCategoryForCity`).

### Analytics Events

| Event | Properties | Trigger |
|-------|------------|---------|
| `wishlist_item_saved` | `entity_type`, `entity_id`, `source` (discover/city_page/country_page) | User saves to wishlist |
| `wishlist_trip_converted` | `entity_type`, `entity_id`, `places_count` | User converts wishlist item to trip |
| `trip_created_streamlined` | `stops_count`, `has_dates`, `from_wishlist` | Trip created via new flow |
| `itinerary_auto_filled` | `trip_id`, `places_count`, `days_count` | User triggers auto-fill |
| `itinerary_manual_adjustment` | `adjustment_type` (reorder/move/remove/add) | User manually adjusts auto-fill |
| `trip_context_pill_tapped` | `city_id`, `trip_id` | User taps floating pill on Discover |
| `comfort_check_logged` | `mood_tag`, `trip_id`, `day_index` | User logs a comfort check |
| `smart_suggestion_accepted` | `suggestion_type`, `place_type` | User adds a context-aware suggestion |
