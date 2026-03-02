# Connect Tab Redesign — Design Document

**Date:** 2026-03-02
**Status:** Approved
**Branch:** TBD

## Problem

The current Travelers tab has unclear UX:
- Segmented toggle between "Travelers" and "Activities" feels disconnected
- Activity posting flow is too complex (long form with many fields)
- Not clear how activities reach the right people
- Profiles emphasize stats over personality
- Location mechanism isn't intuitive

## Design Decisions

| Decision | Choice |
|----------|--------|
| Core action | Both discovery + posting equally important |
| Location | Smart hybrid: GPS suggests, user confirms, trip fallback |
| Notifications | Feed-first + daily digest (not per-activity spam) |
| Page structure | Unified feed mixing people and activity cards |
| Profiles | Vibe-first (travel style, personality, current plans) |
| Posting flow | Quick & casual — one bottom sheet, smart defaults |

---

## 1. Tab Rename

"Travelers" → **"Connect"**

Tab icon remains `people` (Ionicons). The tab is about connecting with women where you are right now.

## 2. Unified Feed

One scrollable feed anchored to your current city. No tabs, no segments, no toggles.

### Feed composition:
- **Activity cards** — full-width, text-forward event listings
- **People rows** — horizontal avatar rows, interspersed every 3-4 activity cards
- **FAB** — floating "+" button, bottom right, opens quick-post sheet

### Feed ordering:
- Activities: upcoming first (by activity date), then recency of post
- Stale activities auto-removed (past date = gone, flexible = 7-day TTL)
- People rows: women currently checked into the same city

### Location pill:
- Fixed at top of feed: "📍 Ubud, Bali · [Change]"
- Tapping opens city picker

## 3. Activity Card

Full-width, no images. Text-forward design.

```
┌─────────────────────────────────────┐
│  [avatar] Sarah · 🇦🇺                │
│                                     │
│  Cooking class in Ubud              │
│  Traditional Balinese, found a      │
│  great local spot near the market   │
│                                     │
│  🍳 Food · Tuesday 2pm · 2 spots   │
└─────────────────────────────────────┘
```

- Author: avatar + name + flag (tappable → profile)
- Title: semiBold
- Description: regular weight, 2 lines max
- Bottom row: category pill, when, spots remaining
- Tap card → activity detail screen
- No inline "Join" button — must tap through to details

### Card states:
- **Open**: default, shows spots remaining
- **Full**: all spots taken, shows "Full" pill (stays visible until date passes)
- **Own post**: shows "Your post" indicator

## 4. People Row

Horizontal break between activity cards. Section title: "Women in [City] right now"

```
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ [ava]  │ │ [ava]  │ │ [ava]  │ │ +8     │
│ Emma   │ │ Mia    │ │ Priya  │ │ more   │
│🇩🇪 Foodie│ │🇳🇱 Hiker│ │🇮🇳 Slow │ │        │
└────────┘ └────────┘ └────────┘ └────────┘
```

- Small avatar (48px), first name, flag, one travel style tag
- Horizontal FlatList with snap scroll
- Tap → profile screen
- Last card: "+N more" if overflow
- Appears roughly every 3-4 activity cards in the feed

## 5. Quick Post Flow

Bottom sheet triggered by FAB. One screen, minimal fields.

```
┌─────────────────────────────────────┐
│  What are you up to?           [X]  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ [free text input]           │    │
│  └─────────────────────────────┘    │
│                                     │
│  📍 Ubud           (from check-in)  │
│  📅 Flexible       (or detected)    │
│  👥 Up to 3                         │
│                                     │
│  Food · Culture · Adventure         │
│  Nightlife · Day trip · Wellness    │
│  Shopping · Other                   │
│                                     │
│          [ Post ]                   │
└─────────────────────────────────────┘
```

### Smart defaults:
- **Location**: auto-filled from current check-in city
- **Date/time**: parsed from text ("tomorrow", "tonight", "Tuesday 2pm"). If nothing detected → "Flexible"
- **Companions**: defaults to 3, stepper to adjust (1-5)
- **Category**: auto-suggested from text keywords, user confirms. Required field.

### Text parsing keywords:
- Food: cooking, dinner, lunch, breakfast, restaurant, eat, food, brunch, cafe
- Adventure: hike, surf, dive, climb, kayak, trek, snorkel, bike
- Culture: temple, museum, gallery, market, workshop, class
- Nightlife: drinks, bar, club, rooftop, sunset drinks, party, night out
- Day trip: day trip, excursion, island hop, road trip, waterfall
- Wellness: yoga, spa, massage, meditation, retreat
- Shopping: shopping, market, thrift, vintage, souvenir

All defaults tappable to override.

## 6. Location Check-In System

### First-time flow (on first Connect tab open):

Full-screen prompt:

1. **GPS suggestion** — if available and resolves to a city: "📍 Ubud, Bali — Based on your location"
2. **Trip suggestions** — cities from active/upcoming trips: "✈️ Chiang Mai — From your upcoming trip"
3. **Manual search** — type any city name
4. Reassurance copy: "This helps other women find you for activities and meetups. You can change it anytime."

User taps one → checked in → feed loads.

### Ongoing behavior:
- Check-in persists until manually changed. No daily prompts.
- If GPS detects a different city: subtle banner at top of feed — "Looks like you're in Canggu now — update?" Tappable, dismissable.
- Location pill always visible at top of Connect feed. Tap to change.
- Check-in shown on profile: "Currently in Ubud"

### Privacy:
- City-level only. No coordinates, no neighborhoods, no addresses stored.
- Users see "Currently in Ubud" — nothing more precise.
- Can turn off check-in entirely → disappear from people rows, still browse/post.

### Data model addition:

```sql
ALTER TABLE profiles ADD COLUMN current_city_id uuid REFERENCES cities(id);
ALTER TABLE profiles ADD COLUMN checked_in_at timestamptz;
```

Check-in writes `current_city_id` + `checked_in_at`. Feed queries filter by `current_city_id`.

## 7. Profile Redesign — Vibe-First

### Layout order:

1. **Identity** — large avatar (80px), name, age, nationality flag, current location
2. **Bio** — personality-forward, max 150 chars
3. **Travel style tags** — pills from `profile_tags` (e.g., "Slow traveler", "Foodie", "Budget", "Early riser", "Solo pro")
4. **Her trip** — current route (Ubud → Canggu → Gili T), duration remaining. Only if active trip exists.
5. **Her plans** — open activities in this city. Tappable → activity detail. Directly connects profiles to the activity system.
6. **Footer stats** — countries count + join date. Small, secondary.

### Connected gate:
- Before connecting: see items 1-6 above
- After connecting: additionally see full countries visited map and complete trip history
- This gives a reason to connect beyond messaging

### Header actions:
- Viewing someone else (not connected): "Connect" button top-right
- Viewing someone else (connected): "Message" button top-right
- Viewing own profile: "Edit" button top-right

## 8. Notifications

### Daily digest (max 1/day per city):
- Sent around 6pm local time
- Examples:
  - "3 new activities in Ubud this week — cooking class, sunset hike, and more"
  - "5 women just checked into Chiang Mai"
- Only sent if there's actually new content. Never empty.
- Users can mute per city or globally.

### Direct action notifications (per-event):
- "Emma wants to join your cooking class" — when someone requests to join YOUR post
- "Sarah accepted your request" — when your join request is accepted
- These are always sent (unless globally muted). They're direct responses to user actions.

### In-app signals:
- Connect tab icon: subtle dot when new content since last visit (presence, not count)
- New cards in feed: faint highlight that fades on scroll (like unread indicators)

### Activity lifecycle:
- Past-date activities: auto-removed from feed
- Flexible activities: 7-day TTL, author nudged at day 5 ("Still looking?")
- Full activities: show "Full" pill, stay visible until date passes (social proof)
- Author can manually close or delete at any time

## 9. End-to-End Flow

### Arriving in a new city:
1. Open Connect tab → GPS suggests city → confirm check-in
2. Feed loads with activities and people in that city
3. Browse, tap an activity, request to join
4. Activity author gets push notification, reviews request, accepts
5. DM auto-created with activity context
6. They coordinate and meet up

### Posting an activity:
1. Tap "+" FAB → bottom sheet opens
2. Type naturally: "Cooking class tomorrow afternoon, who's in?"
3. Smart defaults fill in: Food category, city from check-in, tomorrow from text
4. Tap Post → live in city feed instantly
5. Evening digest notifies other women in the city

### Connecting without an activity:
1. See someone interesting in the people row
2. Tap avatar → vibe-first profile
3. Tap Connect → request sent
4. They accept → DM opens, full profile unlocked (map, trip history)

---

## What Changes

### New:
- Location check-in system (DB columns + first-time flow + GPS detection + banner)
- Unified feed component (replaces segmented toggle)
- Activity card component (new design, replaces TogetherCard)
- People row component (horizontal avatars)
- Quick-post bottom sheet (replaces full-screen together/new.tsx)
- Daily digest notification system (Edge Function + cron)

### Redesigned:
- Connect tab main screen (app/(tabs)/travelers/index.tsx) — complete rewrite
- Profile screen (app/(tabs)/travelers/user/[id].tsx) — reorder sections, vibe-first
- Activity detail screen (app/(tabs)/travelers/together/[postId].tsx) — align with new card design

### Removed:
- Segmented toggle (Travelers vs Activities)
- Horizontal discovery sections (Near You, Same Country, Trip Overlap, etc.)
- Complex activity creation form (together/new.tsx full-screen form)
- TogetherFeed component with its separate filter pills

### Kept as-is:
- Connection request system (send, accept, decline)
- DM system
- Together database schema (together_posts, together_requests)
- All existing API functions in data/together/
- Traveler search (moved to feed search or kept as utility)

---

## Implementation Order

1. **DB migration** — add `current_city_id` and `checked_in_at` to profiles
2. **Location check-in** — first-time flow, GPS detection, manual picker, persistence
3. **Unified feed** — new feed component mixing activity cards + people rows
4. **Activity card** — new card design component
5. **People row** — horizontal avatar row component
6. **Quick-post sheet** — bottom sheet with smart defaults, text parsing
7. **Profile redesign** — reorder to vibe-first, add "Her plans" section
8. **Notifications** — digest Edge Function + in-app signals
9. **Cleanup** — remove old segmented toggle, old discovery sections, old form
