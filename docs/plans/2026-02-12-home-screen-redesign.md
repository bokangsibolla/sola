# Home Screen Redesign — Travel Dashboard

**Date:** 2026-02-12
**Status:** Approved design
**Goal:** Transform Home from a content feed into a lightweight travel dashboard that adapts to user state.

---

## Critique of Current Home Screen

The current home (`app/(tabs)/home/index.tsx`) is a "moodboard" — six hardcoded vibe sections (Wake Up to the Ocean, Eat Your Way Through, etc.) pulling cities by tags, plus a community banner and a small saved places strip.

**Problems:**

1. **No trip awareness.** Home has zero knowledge of whether you have an active trip tomorrow or no trips at all. Same content either way.
2. **It's a content feed, not a dashboard.** Scrolling through "Adventure Awaits" belongs in Explore/Discover, not Home.
3. **No personalization.** The 6 `VIBE_SECTIONS` are identical for every user. Static config with fixed tags.
4. **No inbox presence.** Messages are buried behind hamburger menu → bottom sheet → "Messages" row.
5. **Saved places are an afterthought.** A 10-item horizontal strip at the bottom.
6. **Community is a banner ad.** A static image card linking to the tab. Promotional, not integrated.
7. **Menu system is indirect.** Profile, Settings, Saved Places — all behind hamburger → sheet.

---

## Design Principles

- **Control panel, not content feed** — structured, actionable, at-a-glance. NOT a Pinterest board.
- **Typography-driven** — text hierarchy and spacing do the work, not big images.
- **Status indicators** — counts, countdowns, badges. Show the state of your travel life.
- **Quick actions** — every major feature is one tap away from home.
- **State-driven** — two distinct layouts based on whether the user has trips.
- **Personal first** — greeting by name, saved items before suggestions.
- **No hardcoding** — everything driven by real backend data.

---

## Screen Structure (V2 — Dashboard Redesign)

### Header

Logo left, hamburger menu right (existing `MenuButton`). Unchanged for now.

### Two States

**A) No trips:**

```
Header (logo + hamburger)
─────────────────────────
"Good morning, [Name]"   ← personalized greeting
─────────────────────────
Plan Trip Card            ← structured card with text CTA + small thumbnail
─────────────────────────
Quick Actions Grid        ← Explore | Saved (3) | Messages (2) | Community
─────────────────────────
Saved Collections         ← collection cards (if any saved places)
─────────────────────────
From the Community        ← 2 text-based thread rows
─────────────────────────
You might like            ← text-driven destination suggestions
```

**B) Has trip(s):**

```
Header (logo + hamburger)
─────────────────────────
"Good afternoon, [Name]"  ← personalized greeting
─────────────────────────
Trip Status Card           ← "12 days away" badge + destination + quick action pills
─────────────────────────
Quick Actions Grid         ← Explore | Saved (7) | Messages (2) | Community
─────────────────────────
While in [City]            ← saved items + suggestion rows
─────────────────────────
Saved Collections          ← collection cards with smart "For [City]" filter
─────────────────────────
Messages                   ← latest conversation row
─────────────────────────
From the Community         ← 2 destination-relevant thread rows
─────────────────────────
You might like             ← text-driven suggestions
```

---

## Section Details

### 1. Hero Banner

**Same slot, two states.** Full-width image card, ~200px tall, gradient overlay, content at bottom-left.

**No-trip state:**
- Pulls a bright destination image from the database (random popular city hero image)
- Small destination name text up top
- **"Plan your first solo trip"** in serif display
- "Start planning" in small sans-serif below
- Tap → opens `trips/new.tsx`
- Image refreshes on each visit

**Has-trip state:**
- Pulls trip destination image from city/country hero image in DB
- **Trip title** in serif, dates below in sans-serif, city/country name
- Multi-stop: "Lisbon → Porto → Faro" format
- Tap → opens `trips/[id].tsx`
- Priority: active trip > soonest upcoming trip

**Design:**
- Full bleed to screen edges horizontally (respects safe area top)
- `LinearGradient` from transparent to `rgba(0,0,0,0.5)`
- No rounded corners on this card — editorial, premium feel

**Data sources:**
- `useTrips()` → `trips.current[0]` or `trips.upcoming[0]`
- `getCityById(trip.destinationCityId)` → hero image
- Fallback: `getPopularCitiesWithCountry()` → random hero image

---

### 2. Saved Places & Collections

**Shows when:** User has any saved places. Hidden if empty.

**Section title:** **"Saved"** (20px semiBold) + "See all" link → full saved screen.

**Layout:** Horizontal scroll of collection cards + "All Saved" card at start:

```
[ All Saved (12) ] [ Beach Vibes (4) ] [ Lisbon Trip (7) ] [ + New ]
```

**Card spec:**
- ~110px wide, ~140px tall
- Top: 2x2 image grid from first 4 places in collection (placeholder if fewer)
- Bottom: collection name (14px medium) + count (12px gray)
- 1px `neutralFill` border, `radius.card` corners

**Special cards:**
- **"All Saved"** always first — shows all saved places regardless of collection
- **"+ New"** at end — dotted-border card, opens "Create Collection" flow

**Smart collection (trip state):** When user has an active trip, insert a **"For [City Name]"** card at the front — auto-filtered saved places matching the trip's city. Not a persisted collection, just a filtered view.

**Data sources:**
- `getCollections(userId)` → collection list
- `getCollectionPlaces(collectionId, userId)` → place images per collection
- `getSavedPlacesWithDetails(userId)` → "All Saved" count + images
- Trip city match: filter saved places by `cityId` matching trip destination

---

### 3. Things to Do (Trip State Only)

**Shows when:** User has an active or upcoming trip. Hidden in no-trip state.

**Section title:** **"While in [City Name]"** (20px semiBold). Multi-stop: uses current or next stop's city.

**Layer 1 — Saved items for this destination:**
- Horizontal scroll of compact cards: 160px wide, ~100px tall
- Image + place name + category tag
- Source: `trip_saved_items` + general saved places matching trip city
- Max 6, then "See all" card → trip Plan tab
- **Skipped entirely** if user has no saved items for this destination (no empty state)

**Layer 2 — Destination suggestions:**
- Title: **"Discover more"** (16px medium, gray)
- 3-4 rows in vertical compact list
- Each row: 56px square image + place name + category + bookmark icon (right)
- Excludes anything already saved
- Tapping row → place detail
- Tapping bookmark → instant save with toast (see Save Flow below)

**Data sources:**
- `getTripSavedItems(tripId)` → layer 1
- `getSavedPlacesWithDetails(userId)` filtered by city → layer 1 supplement
- `getExperiencesByCountry(countryId)` → layer 2
- `getSocialSpotsByCountry(countryId)` → layer 2
- Filter out saved place IDs from suggestions

---

### 4. Inbox Preview

**Shows when:** User has at least one conversation. Hidden if no messages (no empty state).

**Section title:** **"Messages"** (20px semiBold) + "See all" → `/connect/dm`.

**Layout:** Single most recent conversation as one row:
- Left: avatar (40px circle)
- Center: sender name (14px semiBold) + message preview truncated to 1 line (14px regular, gray)
- Right: timestamp (12px gray) + unread dot (8px orange circle) if unread

If more than one unread: subtle line below — **"2 more unread"** (13px medium, orange). Tap → full inbox.

**Design:** No card wrapper. Row with `neutralFill` hairline dividers above and below section. Avatar and text do the work.

**Data sources:**
- `getConversations()` → sorted by most recent, take first
- Unread count from existing conversation data

---

### 5. Community Highlights

**Shows when:** Always.

**Section title:** **"From the Community"** (20px semiBold) + "See all" → Community tab.

**Layout:** 2 thread previews, stacked vertically:
- Line 1: author name (14px semiBold) + time ago (12px gray) + TEAM badge if system
- Line 2: thread title (15px medium), max 2 lines
- Line 3: reply count + "replies" (12px gray) + destination tag as subtle text pill if present

Tap → thread detail.

**Thread priority:**
1. Threads tagged to user's active trip destination
2. Threads user has participated in with new replies
3. Most recent threads with highest engagement (fallback)

**Design:** No cards, no borders. Clean rows, 16px vertical spacing between threads. Single `neutralFill` hairline between the two.

**Data sources:**
- New query: `getCommunityHighlights(userId, destinationCityId?)` — returns 2 threads by priority logic
- Existing thread data structure from `data/community/types.ts`

---

### 6. Inspiration (For You)

**Shows when:** Always. Positioned last — "lean back" content after actionable sections.

**Section title:** **"For You"** (20px semiBold). No "See all" — intentionally finite.

**Personalization logic (priority order):**
1. Tags from saved places — if user saved beach places, surface beach destinations they haven't seen
2. Recently viewed cities/countries — from PostHog or lightweight `recently_viewed` table
3. Trip history — if they went to Bali, suggest similar-tagged destinations
4. Fallback — popular destinations with good imagery (new users)

**Layout:** 2-3 cards max. Not scrollable — a finite curated set.

**Card spec:**
- Full width (within 24px padding), ~140px tall
- Destination image + gradient overlay
- City/country name in serif (18px)
- One-line descriptor in sans-serif (13px regular, white) from `vibe_summary` or tag line
- Example: "Medellín" / "Mountain air, street art, slow mornings."

Tap → city or country detail page.

**Design:** `radius.card` corners. Subtle 4px spacing between cards.

**Data sources:**
- `getSavedPlacesWithDetails(userId)` → extract tags → `getCitiesByTags(tags)`
- `getPopularCitiesWithCountry()` → fallback
- City/country `vibe_summary` field for descriptor text

---

## Save Flow Upgrade (Instagram Pattern)

### Current State
Simple bookmark toggle — `toggleSavePlace(userId, placeId)`. No collection picker.

### New Flow

**Save icon:** Small outlined bookmark, bottom-right of all place/experience cards throughout the app. Fills solid orange when saved. Subtle but visible.

**Tap to save:**
1. Place is saved instantly (no collection assignment)
2. Toast appears at bottom: **"Saved"** with **"Add to Collection"** text link
3. Toast auto-dismisses after 3 seconds

**"Add to Collection" tap → Bottom sheet:**
- Title: **"Add to Collection"**
- List of existing collections (emoji + name + count)
- **"New Collection"** row at top with + icon
- Tap collection → place is added, sheet closes, toast updates to "Added to [Collection Name]"
- Tap "New Collection" → inline text input for name + optional emoji picker → create + add

**Unsave:** Tap filled bookmark → removes from all collections + general saved. No confirmation needed.

**Data changes needed:**
- `toggleSavePlace()` already exists — keep as quick save
- `addPlaceToCollection(placeId, collectionId)` — new
- `removePlaceFromCollection(placeId, collectionId)` — new
- `createCollection(userId, name, emoji?)` — check if exists, else create
- `getCollections(userId)` — already exists

---

## Data Dependencies Summary

| Section | Hook/Query | Exists? |
|---------|-----------|---------|
| Hero (no trip) | `getPopularCitiesWithCountry()` | Yes |
| Hero (trip) | `useTrips()`, `getCityById()` | Yes |
| Saved | `getCollections()`, `getSavedPlacesWithDetails()` | Yes |
| Smart collection | Filter saved places by trip city | New logic |
| Things to Do — saved | `getTripSavedItems()` | Yes |
| Things to Do — suggestions | `getExperiencesByCountry()`, `getSocialSpotsByCountry()` | Yes |
| Inbox | `getConversations()` | Yes |
| Community | `getCommunityHighlights()` | New query |
| Inspiration | Tag-based city query, `vibe_summary` | Partially exists |

---

## Components to Build

| Component | Purpose |
|-----------|---------|
| `HomeDashboard` | Root component — state detection, section assembly |
| `HeroBanner` | Full-bleed image card, trip/no-trip variants |
| `SavedCollectionsRow` | Horizontal scroll of collection cards |
| `CollectionCard` | 2x2 image grid + name + count |
| `WhileInSection` | Trip destination — saved items + suggestions |
| `SuggestionRow` | Compact place row with bookmark icon |
| `InboxPreview` | Single conversation row |
| `CommunityHighlights` | 2 thread previews |
| `InspirationSection` | 2-3 personalized destination cards |
| `InspirationCard` | Full-width image + serif title + descriptor |
| `SaveToast` | Animated toast with "Add to Collection" |
| `CollectionPickerSheet` | Bottom sheet — collection list + create new |
| `SaveBookmarkIcon` | Outlined/filled bookmark for all cards |

## Components to Remove

| Component | Reason |
|-----------|--------|
| `VibeSection` | Replaced by personalized inspiration |
| `MoodboardCard` | No longer used |
| `CommunityBanner` | Replaced by CommunityHighlights |
| `ShortlistSection` | Replaced by SavedCollectionsRow |
| `MiniSearchBar` | Home is a dashboard, not a search surface (search lives in Discover) |

## Hooks to Build

| Hook | Purpose |
|------|---------|
| `useHomeDashboard` | Orchestrates all home data fetching — trips, saved, messages, community, inspiration |
| `useSaveFlow` | Save/unsave logic with collection picker state |
| `useCommunityHighlights` | Fetches 2 prioritized threads |
| `usePersonalizedInspiration` | Tag-based destination suggestions |

---

## Files Affected

**Delete or gut:**
- `data/home/useHomeMoodboard.ts` — replaced by `useHomeDashboard`
- `components/home/VibeSection.tsx` — removed
- `components/home/MoodboardCard.tsx` — removed (if exists)

**Rewrite:**
- `app/(tabs)/home/index.tsx` — new dashboard layout

**New files:**
- `data/home/useHomeDashboard.ts`
- `data/home/useCommunityHighlights.ts`
- `data/home/usePersonalizedInspiration.ts`
- `data/home/useSaveFlow.ts`
- `components/home/HeroBanner.tsx`
- `components/home/SavedCollectionsRow.tsx`
- `components/home/CollectionCard.tsx`
- `components/home/WhileInSection.tsx`
- `components/home/SuggestionRow.tsx`
- `components/home/InboxPreview.tsx`
- `components/home/CommunityHighlights.tsx`
- `components/home/InspirationSection.tsx`
- `components/home/InspirationCard.tsx`
- `components/ui/SaveToast.tsx`
- `components/ui/CollectionPickerSheet.tsx`
- `components/ui/SaveBookmarkIcon.tsx`

**Modify:**
- All place/experience cards across the app — add `SaveBookmarkIcon`
- `data/api.ts` — add collection mutation functions
- `app/(tabs)/home/saved.tsx` — update to work with collections

---

## Implementation Order

1. **Data layer** — `useHomeDashboard`, `useCommunityHighlights`, `usePersonalizedInspiration`, collection APIs
2. **Save flow** — `SaveBookmarkIcon`, `SaveToast`, `CollectionPickerSheet`, `useSaveFlow`
3. **Home sections** — `HeroBanner`, `SavedCollectionsRow`, `WhileInSection`, `InboxPreview`, `CommunityHighlights`, `InspirationSection`
4. **Home screen** — Rewrite `index.tsx` to assemble sections
5. **Integration** — Add `SaveBookmarkIcon` to existing cards across the app
6. **Cleanup** — Remove old moodboard components and hook
