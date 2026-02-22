# Sola Trip System — Complete Redesign

> Product Architecture & Implementation Plan
> February 22, 2026

---

## Part 1: Mental Model

### What is a Trip?

A **Trip** is the central container for a travel experience. It represents a single journey — past, present, or future — to one or more destinations.

A trip has four phases:

```
Dreaming → Planning → Traveling → Remembering
(draft)    (planned)   (active)    (completed)
```

**A trip is NOT** a booking system. It's a personal travel companion — part planner, part journal, part pocket guide. It holds everything about a journey in one place: where you're going, where you're staying, what you're doing, and how it felt.

**The key insight**: A trip is the gravity well that pulls all Sola content together. Every destination, activity, accommodation, and restaurant in the app connects back to a trip. This makes the trip the reason someone opens Sola every day.

### What is a Collection?

A **Collection** is an inspiration bucket — a loose, personal grouping of places with no dates, no structure, no commitment. Think Pinterest boards for travel.

Collections are for:
- "Places I want to visit someday"
- "Best rooftop bars I've found"
- "Recommendations from friends"
- "Cafés that look incredible"

**Collection ≠ Trip.** A collection is "I like this." A trip is "I'm going here." Items can move from collections into trips when they become real plans.

### What is a Day?

A **Day** is a 24-hour container within a trip. It holds an ordered sequence of stops — everything you plan to do from morning to night. Days are generated automatically from trip dates, or created manually for flexible trips.

Days belong to destinations. When a trip spans multiple cities, each day is assigned to the city you're in that day (derived from stop date ranges).

### What is a Stop?

A **Stop** is a single activity, visit, or event within a day. It's the atomic unit of an itinerary. A stop can be:

| Type | Example |
|------|---------|
| Place | Chatuchak Market, Sagrada Familia |
| Activity | Cooking class, walking tour |
| Meal | Breakfast at hotel, dinner at Gaggan |
| Transport | Flight BKK→CNX, train to Sintra |
| Free time | Morning to explore, rest at hotel |
| Note | "Buy SIM card at airport" |

Stops can be timed (10:00–12:00) or untimed (just ordered). They can link to places in the Sola database or be custom entries.

### What is an Accommodation?

An **Accommodation** is where you sleep. It attaches to **nights**, not days. "Night of Feb 26" means where you sleep after that day ends. A 3-night hotel stay is one accommodation record with a check-in and check-out date — NOT three separate day entries.

This is a critical distinction. Accommodations live alongside the itinerary but are not itinerary blocks. They appear as a persistent card at the top of each day they cover.

### How Saved Items relate to Trips

There are two independent save paths:

```
┌─────────────────────────────────────────────┐
│              Any Entity Page                │
│  (place, activity, accommodation, city)     │
│                                             │
│         ┌─── Save to Trip ───┐              │
│         │  → Choose trip     │              │
│         │  → Choose day      │              │
│         │  (structured plan) │              │
│         └────────────────────┘              │
│                                             │
│         ┌─── Save to Collection ──┐         │
│         │  → Choose collection    │         │
│         │  (inspiration bucket)   │         │
│         └─────────────────────────┘         │
└─────────────────────────────────────────────┘
```

- Items in a collection can be imported into a trip later
- Items in a trip can also exist in a collection (independent systems)
- The save sheet presents both options in a single, fast interaction

### The Architecture — One Sentence

> A trip holds destinations, each destination spans days, each day holds ordered stops, accommodations bridge nights across days, and any entity in Sola can be saved to a trip or a collection in 2 taps.

---

## Part 2: Trip Creation Flow

### The Flow

```
┌─────────────────────────────────┐
│  ① What kind of trip?           │
│                                 │
│  ○ Planning a future trip       │
│  ○ Currently traveling          │
│  ○ Logging a past trip          │
└───────────────┬─────────────────┘
                ▼
┌─────────────────────────────────┐
│  ② Where are you going?        │
│                                 │
│  [Search cities...]             │
│                                 │
│  🇹🇭 Bangkok                    │
│  🇹🇭 Chiang Mai                 │
│  🇱🇦 Luang Prabang              │
│                                 │
│  + Add another destination      │
└───────────────┬─────────────────┘
                ▼
┌─────────────────────────────────┐
│  ③ When?                        │
│                                 │
│  Bangkok: Mar 1 → Mar 5        │
│  Chiang Mai: Mar 5 → Mar 10    │
│  Luang Prabang: Mar 10 → Mar 15│
│                                 │
│  ☐ I don't have dates yet      │
└───────────────┬─────────────────┘
                ▼
┌─────────────────────────────────┐
│  ④ Trip name                    │
│                                 │
│  [Thailand & Laos         ]     │
│  Auto-suggested from stops      │
│                                 │
│  ┌─────────────────────────┐    │
│  │     Create Trip         │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

### Design Decisions

**Trip Kind selection**: Presented as the first modal sheet before anything else. This sets the context for the entire flow — date validation rules, default status, and UI hints all depend on this choice. One tap, then it collapses into a subtle badge.

**Destination search**: No artificial cap. Users add as many destinations as they need. After 8+ stops, show a gentle hint: "That's an ambitious route! You can always add more later." The search queries cities, countries, and areas from the existing `searchDestinations()` API.

**Multi-country trips**: Work naturally. Each stop carries its own `country_iso2`. The trip title is user-chosen, cover image is user-chosen. Route display shows flags inline.

**Date assignment**: Dates are optional. For users who have dates, each stop gets a start/end date with auto-chaining (end of stop N = start of stop N+1). For flexible trips, skip dates entirely — days can be added manually later.

**When do we ask for location access?** Only when the user selects "Currently traveling." In that case, we can pre-fill the destination search with their current city. Never during future/past trip creation.

**When do we require dates?** Never. Dates are always optional. A trip without dates is a `draft`. The moment dates are added, it becomes `planned`. This lets users start vague and add structure over time.

**Status assignment from kind**:

| Kind | Has dates | Status |
|------|-----------|--------|
| Plan future | Yes | `planned` |
| Plan future | No | `draft` |
| Currently traveling | Yes/No | `active` |
| Log past trip | Yes/No | `completed` |

### Changes from Current Implementation

The current `new.tsx` (1091 lines) handles all of this but has grown unwieldy. The redesign:

1. **Keep the 4-step flow** — it already works well
2. **Remove the 5-stop cap** — replace with soft UX hint
3. **Remove cover photo from creation** — move to trip settings (reduces friction)
4. **Remove buddy selection from creation** — move to trip settings
5. **Remove privacy/matching from creation** — defaults to private, changeable later

The creation flow should be fast. Get the user into their trip in under 30 seconds. Everything else (cover photo, buddies, privacy, matching) lives in trip settings.

---

## Part 3: Trip Overview Screen

This is the command center. The user sees this after creating a trip and every time they open an existing trip.

### Layout

```
┌─────────────────────────────────────────┐
│ ← Back                    ⚙️  ···       │  ← NavigationHeader (back + settings + menu)
├─────────────────────────────────────────┤
│                                         │
│  Thailand & Laos                        │  ← Trip title (22px semiBold)
│  Mar 1 – 15, 2026 · 14 nights          │  ← Date range + nights
│                                         │
│  🇹🇭 Bangkok → Chiang Mai → 🇱🇦 Luang P.│  ← Route strip (scrollable if long)
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ 14   │ │ 3    │ │ 2/3  │ │ 12   │   │
│  │ days │ │cities│ │stays │ │stops │   │
│  └──────┘ └──────┘ └──────┘ └──────┘   │
│                                         │  ← Quick stats row (pill cards)
├─────────────────────────────────────────┤
│                                         │
│  ITINERARY                              │  ← Section header
│                                         │
│  🇹🇭 Bangkok · Mar 1–5                  │  ← Destination header
│  ┌─────────────────────────────────┐    │
│  │ Day 1 · Sat, Mar 1             │    │
│  │ 3 stops · Novotel Bangkok      │    │
│  ├─────────────────────────────────┤    │
│  │ Day 2 · Sun, Mar 2             │    │
│  │ 4 stops · Novotel Bangkok      │    │
│  ├─────────────────────────────────┤    │
│  │ Day 3 · Mon, Mar 3             │    │
│  │ 2 stops · Novotel Bangkok      │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ✈️ Bangkok → Chiang Mai · Mar 5        │  ← Transport card (between destinations)
│                                         │
│  🇹🇭 Chiang Mai · Mar 5–10             │  ← Next destination header
│  ┌─────────────────────────────────┐    │
│  │ Day 5 · Wed, Mar 5             │    │
│  │ Arrival day · no stops yet      │    │
│  ├─────────────────────────────────┤    │
│  │ ...                             │    │
│  └─────────────────────────────────┘    │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ACCOMMODATION                          │  ← Section header
│  ┌─────────────────────────────────┐    │
│  │ 🏨 Novotel Bangkok              │    │
│  │ Mar 1–5 · 4 nights · Booked    │    │
│  ├─────────────────────────────────┤    │
│  │ 🏨 Hostel Chiang Mai            │    │
│  │ Mar 5–10 · 5 nights · Planned  │    │
│  ├─────────────────────────────────┤    │
│  │ 🏨 ? Luang Prabang              │    │
│  │ Mar 10–15 · 5 nights · Not set │    │
│  └─────────────────────────────────┘    │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  SAVED FOR THIS TRIP                    │  ← Section header
│  Horizontal scroll of saved items       │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │img │ │img │ │img │ │ +  │           │
│  │name│ │name│ │name│ │add │           │
│  └────┘ └────┘ └────┘ └────┘           │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  JOURNAL                    View all →  │  ← Collapsed (3 latest entries)
│  ┌─────────────────────────────────┐    │
│  │ 📝 "The night market was..."    │    │
│  │ Mar 3 · Chiang Mai · 😊 happy   │    │
│  └─────────────────────────────────┘    │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  PEOPLE                                 │  ← Buddy section
│  2 travel buddies · 3 matches nearby    │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  + Add to itinerary                     │  ← Sticky bottom bar
└─────────────────────────────────────────┘
```

### Section Behavior

**Itinerary**: Days grouped under destination headers. Each day row shows: day number, date, stop count, and accommodation name (if set for that night). Tapping a day opens the Day Detail screen. Empty days show "No stops yet" with a subtle add prompt.

**Transport cards**: Appear between destination groups when the trip transitions from one city to another. Shows transport type, departure/arrival times if set, and booking reference if available. Tapping opens an edit sheet.

**Accommodation**: Shows all stays for the trip. Each card shows name, date range, night count, and booking status (planned/booked/not set). Missing accommodations show as placeholder cards ("Where are you staying in Luang Prabang?"). Tapping opens accommodation detail/edit.

**Saved Items**: Horizontal scroll of places/activities saved specifically to this trip (from `trip_saved_items`). These are items the user wants to do but hasn't assigned to a specific day yet. They serve as an "unscheduled" bucket. The "+ add" card opens the save sheet.

**Journal**: Collapsed view showing latest 3 entries. "View all" expands to the full journal timeline.

**People**: Shows trip buddies and nearby matches. Compact — just avatars and counts.

### Actions from this Screen

| Action | Trigger |
|--------|---------|
| Add day | Auto-generated from dates, or "+" button for flexible trips |
| Add stop to day | Tap day row → Day Detail → add stop |
| Add accommodation | Tap accommodation section → add/edit sheet |
| Add transport | Tap transport card or "+" between destinations |
| Import from collection | "Add to itinerary" → "From collections" |
| Add saved item | "Add to itinerary" → search → "Save for later" |
| Open in Maps | Overflow menu → "View route on map" |
| Export to Calendar | Overflow menu → "Add to calendar" |
| Edit trip details | Settings gear → title, dates, stops, privacy |
| Journal entry | Journal section → "+" or "View all" → add |
| Trip settings | Gear icon → privacy, matching, buddies, cover photo |

### Active Trip Enhancements

When today falls within the trip's date range (status = `active`):

- **Today badge**: The current day row is highlighted with an orange left border and "TODAY" badge
- **Auto-scroll**: FlatList scrolls to today's day on mount
- **Quick actions**: "What's next" card appears at the top showing the next upcoming stop
- **Day progress**: Completed stops show checkmarks, current stop is highlighted

---

## Part 4: Day Detail Screen — Daily Itinerary

This is the core planning surface. Each day gets its own screen with a full timeline of stops.

### Layout

```
┌─────────────────────────────────────────┐
│ ← Back            Day 3               🗺│  ← Header with map button
├─────────────────────────────────────────┤
│                                         │
│  Monday, March 3                        │  ← Full date
│  🇹🇭 Bangkok                             │  ← City context
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  🏨 Novotel Bangkok Siam               │  ← Accommodation card (persistent)
│  Night 3 of 4 · Check-out Mar 5        │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ── 9:00 AM ──────────────────────────  │  ← Time marker (if timed)
│  ┌─────────────────────────────────┐    │
│  │ ☕ Breakfast at hotel            │    │  ← Meal block
│  │ 9:00 – 9:45 · Planned          │    │
│  │                          ≡ ··· │    │  ← Drag handle + menu
│  └─────────────────────────────────┘    │
│                                         │
│         + ─────────────────────         │  ← Insert button (between stops)
│                                         │
│  ── 10:00 AM ─────────────────────────  │
│  ┌─────────────────────────────────┐    │
│  │ 🏛 Grand Palace                 │    │  ← Place block (linked to Sola place)
│  │ 10:00 – 12:30 · 2.5h           │    │
│  │ ■■■ img                         │    │  ← Place thumbnail if available
│  │                          ≡ ··· │    │
│  └─────────────────────────────────┘    │
│                                         │
│         + ─────────────────────         │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🍜 Lunch                        │    │  ← Untimed block (just ordered)
│  │ Near Grand Palace area          │    │
│  │                          ≡ ··· │    │
│  └─────────────────────────────────┘    │
│                                         │
│         + ─────────────────────         │
│                                         │
│  ── 2:00 PM ──────────────────────────  │
│  ┌─────────────────────────────────┐    │
│  │ 🛶 Long-tail boat tour          │    │  ← Activity block
│  │ 2:00 – 4:30 · Booked           │    │
│  │ Booking ref: BK-2847           │    │
│  │                          ≡ ··· │    │
│  └─────────────────────────────────┘    │
│                                         │
│         + ─────────────────────         │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ☁ Free time                     │    │  ← Free time block
│  │ Explore Khao San Road area      │    │
│  │                          ≡ ··· │    │
│  └─────────────────────────────────┘    │
│                                         │
│         + ─────────────────────         │
│                                         │
│  ── 7:00 PM ──────────────────────────  │
│  ┌─────────────────────────────────┐    │
│  │ 🍽 Gaggan Anand                  │    │  ← Dinner block
│  │ 7:00 – 9:00 · Booked           │    │
│  │ ★ Highlight of the trip!        │    │  ← Note
│  │                          ≡ ··· │    │
│  └─────────────────────────────────┘    │
│                                         │
├─────────────────────────────────────────┤
│  💡 Suggestion: Add lunch break         │  ← Suggestion card (if any)
│  You have a 3-hour gap. Want to add     │
│  a meal or free time?                   │
│  [Apply]  [Dismiss]                     │
├─────────────────────────────────────────┤
│                                         │
│  NOTES                                  │
│  "Don't forget to bring sunscreen       │
│   and comfortable shoes for the         │
│   palace. No shorts allowed."           │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  + Add stop                             │  ← Sticky bottom bar
└─────────────────────────────────────────┘
```

### Stop Block Interactions

| Gesture | Action |
|---------|--------|
| Tap block | Expand details (place info, booking URL, notes) |
| Long press / drag handle | Reorder within the day |
| Swipe left | Delete with confirmation |
| Tap "···" menu | Edit time, add note, mark done, open in maps, delete |
| Tap "+" insert button | Add new stop between existing ones |

### Adding a Stop — the "Add Stop" Sheet

When the user taps "+" or the bottom bar:

```
┌─────────────────────────────────────────┐
│  Add to Day 3                           │
│                                         │
│  [Search places, activities...]         │  ← Search bar
│                                         │
│  FROM YOUR SAVED ITEMS        View all →│
│  ┌────┐ ┌────┐ ┌────┐                  │  ← Items saved to this trip
│  │img │ │img │ │img │                  │     but not yet on a day
│  │name│ │name│ │name│                  │
│  └────┘ └────┘ └────┘                  │
│                                         │
│  QUICK ADD                              │
│  ┌──────────┐ ┌──────────┐             │
│  │ 🍽 Meal   │ │ ☁ Free   │             │
│  │          │ │  time    │             │
│  ├──────────┤ ├──────────┤             │
│  │ 🚕 Trans │ │ 📝 Note  │             │
│  │  port    │ │          │             │
│  └──────────┘ └──────────┘             │
│                                         │
│  NEARBY IN BANGKOK              See all │  ← Context-aware suggestions
│  ┌─────────────────────────────┐        │
│  │ Chatuchak Market            │        │
│  │ Market · 4.5★ · Open today  │        │
│  ├─────────────────────────────┤        │
│  │ Wat Pho                     │        │
│  │ Temple · 4.8★ · 15 min away │        │
│  └─────────────────────────────┘        │
│                                         │
└─────────────────────────────────────────┘
```

The "Nearby" section uses the day's city context to suggest relevant places from the Sola database. This makes trip planning feel effortless — the app knows where you'll be and suggests what's nearby.

### Accommodation Attachment Logic

Accommodations attach to nights, displayed on the day they cover:

```
Day 1 (Mar 1): 🏨 Novotel Bangkok (Night 1 of 4)
Day 2 (Mar 2): 🏨 Novotel Bangkok (Night 2 of 4)
Day 3 (Mar 3): 🏨 Novotel Bangkok (Night 3 of 4)
Day 4 (Mar 4): 🏨 Novotel Bangkok (Night 4 of 4, Check-out tomorrow)
Day 5 (Mar 5): ✈️ Travel to Chiang Mai | 🏨 Huen Phen Hostel (Night 1 of 5)
```

The accommodation card at the top of each day shows which night of the stay it is and when checkout happens. This gives context without duplicating data.

### Transport Between Cities

When the trip transitions between destinations, a transport block appears between the day groups on the Trip Overview. On the Day Detail, it appears as a special block:

```
┌─────────────────────────────────────────┐
│  ✈️ Bangkok → Chiang Mai                 │
│  Thai Airways TG 104                    │
│  Departs 11:30 · Arrives 13:00          │
│  Booking: BK-2847                       │
│  [Open in Maps]  [Edit]                 │
└─────────────────────────────────────────┘
```

Users can add transport from the Trip Overview (between destinations) or from within a day. Both create the same `trip_transports` record.

### Multi-destination Day Handling

Days are assigned to destinations based on `trip_stops` date ranges:

```
Stop 1: Bangkok, Mar 1–5
Stop 2: Chiang Mai, Mar 5–10
Stop 3: Luang Prabang, Mar 10–15

Day 5 (Mar 5) = Travel day → listed under "Bangkok → Chiang Mai"
```

Travel days (where the destination changes) get a special visual treatment — the destination header shows both cities with an arrow, and transport blocks appear at the top.

---

## Part 5: Save System Redesign

### The Unified Save Sheet

Every entity page in Sola (place, activity, accommodation, restaurant, city) gets a **save button** — a bookmark icon in the header or a floating action.

Tapping it opens the **Save Sheet**:

```
┌─────────────────────────────────────────┐
│                                         │
│  Save "Chatuchak Market"               │
│                                         │
│  ─── ADD TO TRIP ─────────────────────  │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🇹🇭 Thailand & Laos             │    │
│  │ Mar 1–15 · 3 cities            → │    │
│  ├─────────────────────────────────┤    │
│  │ 🇵🇹 Portugal Solo               │    │
│  │ Apr 5–12 · 2 cities            → │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ─── SAVE TO COLLECTION ─────────────  │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 📌 Want to Visit                │    │
│  │ 23 places                      → │    │
│  ├─────────────────────────────────┤    │
│  │ 🍽 Best Restaurants             │    │
│  │ 8 places                       → │    │
│  ├─────────────────────────────────┤    │
│  │ + New Collection                │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### "Add to Trip" Sub-flow

When the user taps a trip:

```
┌─────────────────────────────────────────┐
│  ← Back                                │
│                                         │
│  Add to Thailand & Laos                │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 📋 Save for later               │    │  ← Adds to trip_saved_items (unscheduled)
│  │ Add to your trip without        │    │
│  │ assigning a specific day        │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ─── OR PICK A DAY ──────────────────  │
│                                         │
│  🇹🇭 Bangkok                            │
│  ┌─────────────────────────────────┐    │
│  │ Day 1 · Sat, Mar 1 · 3 stops   │    │
│  │ Day 2 · Sun, Mar 2 · 4 stops   │    │
│  │ Day 3 · Mon, Mar 3 · 2 stops   │    │
│  │ Day 4 · Tue, Mar 4 · 0 stops   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  🇹🇭 Chiang Mai                         │
│  ┌─────────────────────────────────┐    │
│  │ Day 5 · Wed, Mar 5 · 1 stop    │    │
│  │ ...                             │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

**Tap count analysis:**
- Save to collection: 2 taps (save button → collection)
- Save to trip (unscheduled): 2 taps (save button → trip → "Save for later")
- Save to trip + specific day: 3 taps (save button → trip → day)
- New collection: 3 taps (save button → "New Collection" → name → create)

This is fast. The most common action (save to collection) is 2 taps.

### Replacing the Current Save System

Currently, place/activity/accommodation pages have a simple heart toggle (`toggleSavePlace`) that adds to `saved_places` with no context. The redesign replaces this with the unified save sheet.

**Migration path:**
1. Replace `toggleSavePlace` calls with `openSaveSheet` on all entity pages
2. Keep `saved_places` table as-is (for collection saves)
3. Use `trip_saved_items` for trip saves (already exists)
4. The heart icon becomes a bookmark icon — filled when the item is saved anywhere (collection OR trip)

### Import from Collections

On the Trip Overview → "Add to itinerary" → "From collections":

```
┌─────────────────────────────────────────┐
│  Import from Collections               │
│                                         │
│  📌 Want to Visit (23 places)           │
│  ┌─────────────────────────────────┐    │
│  │ ☐ Chatuchak Market · Bangkok    │    │
│  │ ☐ Wat Pho · Bangkok             │    │
│  │ ☐ Gaggan Anand · Bangkok        │    │
│  │ ☐ Sunday Night Market · CM      │    │
│  └─────────────────────────────────┘    │
│                                         │
│  🍽 Best Restaurants (8 places)         │
│  ┌─────────────────────────────────┐    │
│  │ ☐ Gaggan Anand · Bangkok        │    │
│  │ ☐ Khao Soi Mae Sai · CM        │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Only showing places in your trip       │
│  destinations                           │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Import 4 selected              │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

Smart filtering: Only shows collection items that match the trip's destination cities. This prevents importing irrelevant items and makes the connection between collections and trips feel magical.

---

## Part 6: Maps Integration

### Philosophy

No API keys. No complex integrations. Link-based. Every map interaction opens the user's preferred maps app with the right data pre-loaded.

### Per-Stop: "Open in Maps"

Every stop that has coordinates (from linked `places` record or manual lat/lng) gets an "Open in Maps" action.

**Implementation:**
```typescript
// Google Maps
`https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${googlePlaceId}`

// Apple Maps
`maps://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(name)}`
```

Use `Linking.openURL()`. On iOS, offer both options. On Android, Google Maps opens directly.

### Per-Day: "View Day on Map"

The map icon in the Day Detail header generates a multi-stop directions URL:

```typescript
// Google Maps directions with waypoints
const stops = day.blocks.filter(b => b.locationLat && b.locationLng);
const origin = `${stops[0].locationLat},${stops[0].locationLng}`;
const dest = `${stops[stops.length-1].locationLat},${stops[stops.length-1].locationLng}`;
const waypoints = stops.slice(1, -1).map(s => `${s.locationLat},${s.locationLng}`).join('|');

`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&waypoints=${waypoints}&travelmode=walking`
```

This opens Google Maps with the full day's route plotted — no API key needed.

### Per-Trip: "View Route"

From the Trip Overview overflow menu → "View route on map":

Generates a multi-destination URL using trip stops:
```typescript
const destinations = trip.stops.map(s => encodeURIComponent(s.cityName));
`https://www.google.com/maps/dir/${destinations.join('/')}`
```

### Where Coordinates Come From

The `places` table has `latitude` and `longitude` columns (already populated for most places via Google Places enrichment). When a user adds a Sola place to their itinerary, the block inherits the place's coordinates.

For custom stops (not linked to a Sola place), users can optionally add coordinates via a map picker or by pasting a Google Maps link (extract coords from URL).

---

## Part 7: Calendar Integration

### Approach: Native Calendar via expo-calendar

Use `expo-calendar` to create events directly in the device's default calendar. No .ics files (clunky), no Google Calendar API (requires OAuth).

### Export Options

**Export entire trip:**
From Trip Overview → overflow menu → "Add to calendar"

Creates:
1. One all-day event spanning the trip dates (title: trip name)
2. Individual timed events for each stop that has start/end times
3. Accommodation check-in/check-out events

**Export single day:**
From Day Detail → overflow menu → "Add this day to calendar"

Creates timed events for all stops in that day.

**Export single stop:**
From stop block → "···" menu → "Add to calendar"

Creates one event with the stop's time, title, and location.

### Implementation

```typescript
import * as Calendar from 'expo-calendar';

// Request permission
const { status } = await Calendar.requestCalendarPermissionsAsync();

// Get default calendar
const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
const defaultCalendar = calendars.find(c => c.allowsModifications);

// Create event
await Calendar.createEventAsync(defaultCalendar.id, {
  title: stop.title,
  startDate: new Date(`${day.date}T${stop.startTime}`),
  endDate: new Date(`${day.date}T${stop.endTime}`),
  location: stop.locationName,
  notes: stop.notes,
});
```

### UX

- Calendar export is opt-in (user taps "Add to calendar")
- Requires calendar permission (requested on first use only)
- Shows confirmation: "Added 12 events to your calendar"
- No auto-sync. No background updates. User controls when to export.
- If dates change in the trip, user re-exports (we don't track synced events)

This keeps it simple. No sync complexity, no background processes, no state management for calendar events.

---

## Part 8: Smart Daily Mode (Trip Mode)

### When It Activates

Trip Mode activates when:
- Today's date falls within any trip's `arriving` to `leaving` range
- AND the trip's status is `active`

Only one trip can be active at a time. If a user has overlapping active trips (unlikely but possible), the most recently updated one takes priority.

### Home Tab: Trip Mode Card

When Trip Mode is active, the Home tab shows a prominent card at the top:

```
┌─────────────────────────────────────────┐
│                                         │
│  🟢 Traveling · Day 5                   │
│  Thailand & Laos                        │
│                                         │
│  ── NEXT UP ──────────────────────────  │
│  🛶 Long-tail boat tour                 │
│  In 45 minutes · 2:00 PM               │
│                                         │
│  ── LATER TODAY ──────────────────────  │
│  ☁ Free time · Khao San Road           │
│  🍽 Dinner at Gaggan Anand · 7:00 PM    │
│                                         │
│  [Open today's plan →]                  │
│                                         │
└─────────────────────────────────────────┘
```

### Trip Hub: Today Highlighted

The Trip Overview screen auto-scrolls to today's day and highlights it:

```
│  Day 4 · Tue, Mar 4 · 3 stops          │  ← Normal
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  🟠 Day 5 · TODAY · Wed, Mar 5          │  ← Orange left border, "TODAY" badge
│  │ 4 stops · Next: Boat tour at 2 PM   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Day 6 · Thu, Mar 6 · 2 stops          │  ← Normal
```

### Day Detail: Live Progress

When viewing today's day, blocks show real-time progress:

```
┌─────────────────────────────────────────┐
│ ✅ Breakfast at hotel                    │  ← Completed (dimmed, checkmark)
│ 9:00 – 9:45 · Done                     │
├─────────────────────────────────────────┤
│ ✅ Grand Palace                          │  ← Completed
│ 10:00 – 12:30 · Done                   │
├─────────────────────────────────────────┤
│ 🟠 Long-tail boat tour                  │  ← CURRENT (highlighted, orange dot)
│ 2:00 – 4:30 · Starting soon            │
├─────────────────────────────────────────┤
│ ○ Free time                              │  ← Upcoming (normal)
│ Explore Khao San Road                   │
├─────────────────────────────────────────┤
│ ○ Dinner at Gaggan Anand                │  ← Upcoming
│ 7:00 – 9:00                             │
└─────────────────────────────────────────┘
```

Completion is manual (tap the block → "Mark as done"). The app doesn't auto-complete based on time — that would feel presumptuous.

### Notifications (Optional, Subtle)

All notifications are opt-in. The user enables them per-trip from trip settings.

| When | Message | Purpose |
|------|---------|---------|
| Morning (8 AM local) | "Good morning from Bangkok. You have 4 stops planned today." | Daily overview |
| 30 min before timed stop | "Your boat tour starts in 30 minutes" | Gentle reminder |
| Evening (8 PM local) | "How was your day in Bangkok?" | Journal prompt |
| Day before departure | "Last day in Bangkok! Chiang Mai tomorrow." | Transition awareness |

**Implementation**: Use `expo-notifications` with scheduled local notifications. No push server needed — everything is local, calculated from trip data.

**Key principle**: No spam. No marketing. Only helpful, contextual nudges that the traveler opted into.

---

## Part 9: Profile Display

### How Trips Show on User Profiles

Public and friends-visible trips appear on the user's profile:

```
┌─────────────────────────────────────────┐
│  TRIPS                                  │
│                                         │
│  🟢 Currently in Thailand               │  ← Active trip badge
│  Thailand & Laos · Day 5 of 14         │
│                                         │
│  ── PAST TRIPS ──────────────────────── │
│  ┌────────┐ ┌────────┐ ┌────────┐      │
│  │ 🇲🇦     │ │ 🇯🇵     │ │ 🇬🇷     │      │
│  │Morocco │ │ Japan  │ │Greece │      │
│  │Dec '25 │ │Oct '25 │ │Jul '25│      │
│  └────────┘ └────────┘ └────────┘      │
│                                         │
│  12 countries visited                   │
│                                         │
└─────────────────────────────────────────┘
```

**Visited countries** are derived from completed trips (already implemented via `getVisitedCountries()`).

**Active trip** shows as a live badge — other users can see where someone is traveling, which feeds into buddy matching and social connection.

**Privacy controls** remain — only public trips show to strangers, friends-visible trips show to connections.

---

## Part 10: Supabase Schema Changes

### Current State Assessment

The existing schema is well-designed. The core tables (`trips`, `trip_stops`, `trip_days`, `itinerary_blocks`, `trip_entries`, `trip_saved_items`, `trip_buddies`) handle most of the redesign requirements.

**What's missing:**
1. Accommodations are modeled as `itinerary_blocks` with `block_type='accommodation'` — this doesn't properly handle multi-night stays
2. Inter-city transport is also an `itinerary_block` — but transport between destinations spans days, not hours
3. No notification preferences per trip
4. No calendar export tracking

### New Table: `trip_accommodations`

Separates accommodation from daily itinerary blocks. Accommodations span nights and need their own entity.

```sql
CREATE TABLE IF NOT EXISTS trip_accommodations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  place_id      uuid REFERENCES places(id),          -- optional link to Sola place
  name          text NOT NULL,
  check_in      date NOT NULL,
  check_out     date NOT NULL,
  address       text,
  location_lat  numeric(10, 7),
  location_lng  numeric(10, 7),
  booking_url   text,
  booking_ref   text,
  cost          numeric(10, 2),
  currency      text DEFAULT 'USD',
  status        text NOT NULL DEFAULT 'planned'
                CHECK (status IN ('planned', 'booked', 'confirmed')),
  notes         text,
  sort_order    int DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_trip_accommodations_trip ON trip_accommodations(trip_id);

-- RLS: owner access via trip
ALTER TABLE trip_accommodations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage trip accommodations"
  ON trip_accommodations FOR ALL
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()))
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));
```

### New Table: `trip_transports`

Models inter-city travel separately from daily itinerary blocks.

```sql
CREATE TABLE IF NOT EXISTS trip_transports (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id         uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  from_stop_order int,                                  -- references trip_stops.stop_order
  to_stop_order   int,                                  -- references trip_stops.stop_order
  transport_type  text NOT NULL DEFAULT 'other'
                  CHECK (transport_type IN ('flight', 'train', 'bus', 'car', 'ferry', 'other')),
  carrier         text,                                 -- airline/train company name
  reference       text,                                 -- booking reference
  departure_at    timestamptz,
  arrival_at      timestamptz,
  departure_location text,                              -- airport/station name
  arrival_location   text,
  booking_url     text,
  cost            numeric(10, 2),
  currency        text DEFAULT 'USD',
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_trip_transports_trip ON trip_transports(trip_id);

-- RLS: owner access via trip
ALTER TABLE trip_transports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage trip transports"
  ON trip_transports FOR ALL
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()))
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));
```

### New Table: `trip_notification_settings`

Per-trip notification preferences.

```sql
CREATE TABLE IF NOT EXISTS trip_notification_settings (
  trip_id           uuid PRIMARY KEY REFERENCES trips(id) ON DELETE CASCADE,
  morning_summary   boolean DEFAULT false,
  stop_reminders    boolean DEFAULT false,
  evening_journal   boolean DEFAULT false,
  departure_alerts  boolean DEFAULT false,
  reminder_minutes  int DEFAULT 30,                    -- how far before stop to remind
  morning_hour      int DEFAULT 8,                     -- local hour for morning summary
  evening_hour      int DEFAULT 20,                    -- local hour for journal prompt
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- RLS: owner access via trip
ALTER TABLE trip_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage notification settings"
  ON trip_notification_settings FOR ALL
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()))
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));
```

### Modifications to Existing Tables

**`trips` table** — add column:
```sql
ALTER TABLE trips ADD COLUMN IF NOT EXISTS
  is_template boolean DEFAULT false;
  -- Allows marking a completed trip as a shareable template
```

**`itinerary_blocks` table** — no changes needed. Keep using it for daily stops. Remove `accommodation` from `block_type` once `trip_accommodations` is active. Actually, keep it for backwards compatibility during migration.

**`trip_saved_items` table** — add column:
```sql
ALTER TABLE trip_saved_items ADD COLUMN IF NOT EXISTS
  source text DEFAULT 'manual'
  CHECK (source IN ('manual', 'collection_import', 'suggestion'));
  -- Tracks how the item was added for analytics
```

### No Changes Needed

These tables work as-is:
- `trip_stops` — multi-destination support is solid
- `trip_days` — day containers work well
- `trip_entries` — journal system is complete
- `trip_buddies` — buddy linking works
- `trip_matching_preferences` — matching config is good
- `trip_overlap_matches` — view for buddy discovery works
- `itinerary_block_tags` — semantic labels work
- `itinerary_suggestions` — suggestion engine works

### Complete Entity Relationship

```
trips (1)
  ├── trip_stops (N)          — where you're going
  ├── trip_days (N)           — day-by-day structure
  │     └── itinerary_blocks (N)  — stops within each day
  │           └── itinerary_block_tags (N)
  │           └── itinerary_suggestions (N)
  ├── trip_accommodations (N) — where you're sleeping (NEW)
  ├── trip_transports (N)     — how you're getting there (NEW)
  ├── trip_entries (N)        — journal entries
  ├── trip_saved_items (N)    — unscheduled saved items
  ├── trip_buddies (N)        — travel companions
  ├── trip_matching_preferences (1) — matching config
  └── trip_notification_settings (1) — notification prefs (NEW)

collections (independent)
  └── saved_places (N)        — collection items (unchanged)
```

---

## Part 11: Example User Journeys

### Journey 1: Future Trip (Planning)

**Sarah wants to plan 2 weeks in Thailand and Laos.**

1. Opens Trips tab → taps "Plan a new trip"
2. Selects "Planning a future trip"
3. Searches "Bangkok" → adds as stop 1
4. Searches "Chiang Mai" → adds as stop 2
5. Searches "Luang Prabang" → adds as stop 3
6. Sets dates:
   - Bangkok: Mar 1–5 (4 nights)
   - Chiang Mai: Mar 5–10 (5 nights)
   - Luang Prabang: Mar 10–15 (5 nights)
7. Title auto-suggests "Thailand & Laos" — she keeps it
8. Taps "Create Trip" → lands on Trip Overview

**Over the next few weeks, Sarah plans:**
- Browses Bangkok on Sola → finds "Chatuchak Market" → taps save → "Add to Trip" → Thailand & Laos → Day 2
- Finds "Gaggan Anand" on the app → saves to trip → Day 4 (dinner)
- Opens her "Want to Visit" collection → imports 3 Bangkok items to the trip
- Adds accommodation: types "Novotel Bangkok Siam", Mar 1–5, pastes booking.com link
- Adds flight: Bangkok → Chiang Mai, Mar 5, Thai Airways
- Opens Day 3 → adds "Grand Palace" at 10 AM, "Boat tour" at 2 PM, meal blocks
- Exports the trip to her calendar

**On March 1:**
- Trip Mode activates → Home tab shows "Day 1 of your Thailand trip"
- She enabled morning notifications → gets "Good morning from Bangkok! 3 stops planned today."
- Opens Day 1 → checks off stops as she completes them
- In the evening, adds a journal entry: "The street food in Yaowarat was unbelievable" with mood: happy
- Before bed, taps "What's next" → sees tomorrow's plan

### Journey 2: Currently Traveling

**Maria is already in Lisbon. She didn't plan ahead.**

1. Opens Trips tab → taps "Plan a new trip"
2. Selects "Currently traveling"
3. App requests location → auto-suggests "Lisbon"
4. Adds Lisbon as her destination
5. Sets dates: Feb 20–28
6. Creates trip → status = `active` → Trip Mode activates immediately

**As she explores Lisbon:**
- Discovers a viewpoint on Sola → saves to trip → Day 3
- Walks past a café → adds a custom note stop: "Amazing pastel de nata at Manteigaria"
- At the end of each day, adds journal entries with photos and moods
- Uses "Open in Maps" on tomorrow's stops to get directions
- Marks stops as done throughout the day

**Maria's trip is spontaneous.** She adds stops as she goes. The itinerary grows organically from experience rather than planning. The trip becomes a living record of her journey.

### Journey 3: Past Trip (Logging)

**Emma wants to log her December trip to Morocco.**

1. Opens Trips tab → taps "Plan a new trip"
2. Selects "Log a past trip"
3. Adds Marrakech (Dec 15–20), Fez (Dec 20–24), Sahara (Dec 24–28)
4. Creates trip → status = `completed`

**She fills in memories:**
- Adds accommodations: riad in Marrakech, guesthouse in Fez, camp in Sahara
- Adds journal entries: highlights, tips, comfort checks
- Marks key stops: "The tanneries in Fez" as a highlight
- Sets trip to public → it appears on her profile
- Other women browsing Morocco on Sola can see her trip for inspiration

### Journey 4: Casual Saving (No Trip Yet)

**Priya isn't planning a trip, but she's browsing Sola.**

- Sees an amazing temple in Bali → taps save → "Save to Collection" → "Dream Destinations"
- Finds a cooking class in Chiang Mai → saves to "Want to Visit" collection
- Discovers a boutique hotel in Porto → saves to "Best Hotels" collection

**Weeks later, when she decides to plan:**
- Creates a trip to Thailand
- Opens "Import from collections" → sees her "Want to Visit" items filtered to Thailand
- Imports the Chiang Mai cooking class into her trip → assigns to Day 3

**The collection was the seed. The trip is the plan.** They complement each other perfectly.

---

## Part 12: Component Architecture

### New Components Needed

```
components/trips/
  ├── TripOverview/
  │   ├── TripHeader.tsx           — Title, dates, route strip
  │   ├── TripStatsRow.tsx         — Quick stat pills (days, cities, stays, stops)
  │   ├── ItinerarySection.tsx     — Day list grouped by destination
  │   ├── AccommodationSection.tsx — Accommodation cards
  │   ├── SavedItemsSection.tsx    — Horizontal scroll of unsorted items
  │   ├── JournalSection.tsx       — Latest 3 entries
  │   └── TransportCard.tsx        — Inter-city transport card
  │
  ├── DayDetail/
  │   ├── DayHeader.tsx            — Date, city, accommodation banner
  │   ├── StopBlock.tsx            — Individual stop in timeline
  │   ├── InsertButton.tsx         — "+" between stops
  │   ├── AddStopSheet.tsx         — REDESIGNED: search + saved items + quick add + nearby
  │   └── DayMapButton.tsx         — Opens day route in maps
  │
  ├── SaveSheet/
  │   ├── SaveSheet.tsx            — NEW: Unified save bottom sheet
  │   ├── TripPicker.tsx           — Trip selection within save sheet
  │   ├── DayPicker.tsx            — Day selection within trip picker
  │   ├── CollectionPicker.tsx     — Collection selection
  │   └── NewCollectionSheet.tsx   — Create collection inline
  │
  ├── Accommodation/
  │   ├── AccommodationCard.tsx    — Display card (name, dates, status)
  │   ├── AddAccommodationSheet.tsx — Add/edit accommodation
  │   └── AccommodationBanner.tsx  — EXISTING: Day-level accommodation display
  │
  ├── Transport/
  │   ├── TransportCard.tsx        — Display card (type, times, carrier)
  │   └── AddTransportSheet.tsx    — Add/edit transport
  │
  ├── TripMode/
  │   ├── TripModeCard.tsx         — Home tab: "Traveling" card with next-up
  │   ├── TodayBadge.tsx           — Orange "TODAY" badge on day rows
  │   └── LiveProgress.tsx         — Done/current/upcoming state on blocks
  │
  ├── Calendar/
  │   └── CalendarExport.tsx       — Calendar export logic + confirmation
  │
  ├── Import/
  │   └── ImportFromCollections.tsx — Collection → Trip import sheet
  │
  └── (existing components — keep as-is)
      ├── CurrentTripCard.tsx
      ├── TripListCard.tsx
      ├── TripEmptyState.tsx
      ├── TripDayRow.tsx
      ├── TimelineBlockCard.tsx
      ├── JourneyEntryCard.tsx
      ├── SuggestionCard.tsx
      ├── PeopleTab.tsx
      └── ...
```

### New Screens

```
app/(tabs)/trips/
  ├── index.tsx                    — Trip hub (KEEP, enhance with Trip Mode)
  ├── new.tsx                      — Creation flow (REFACTOR, simplify)
  ├── [id].tsx                     — Trip Overview (REDESIGN)
  ├── [id]/settings.tsx            — Trip settings (NEW: privacy, notifications, cover, delete)
  ├── [id]/journal.tsx             — Full journal view (NEW)
  ├── [id]/accommodation.tsx       — Accommodation management (NEW)
  ├── day/[dayId].tsx              — Day detail (KEEP, enhance)
  └── day/[dayId]/map.tsx          — Day map view (NEW, opens external maps)
```

### Data Layer Changes

```
data/trips/
  ├── types.ts                     — ADD: TripAccommodation, TripTransport, NotificationSettings
  ├── tripApi.ts                   — ADD: accommodation CRUD, transport CRUD, notification settings
  ├── itineraryApi.ts              — KEEP as-is
  ├── useTrips.ts                  — KEEP as-is
  ├── useTripDetail.ts             — ADD: useAccommodations, useTransports
  ├── useTripMatches.ts            — KEEP as-is
  ├── useItinerary.ts              — KEEP as-is
  ├── useSaveSheet.ts              — NEW: hook for unified save sheet
  ├── calendarExport.ts            — NEW: expo-calendar integration
  ├── mapsLinks.ts                 — NEW: URL generators for maps
  ├── notifications.ts             — NEW: local notification scheduling
  ├── helpers.ts                   — KEEP, add accommodation/transport helpers
  └── suggestionEngine.ts          — KEEP as-is
```

---

## Part 13: UI Design Principles (Trip-Specific)

### Visual Language

**Cards, not tables.** Every piece of trip data lives in a card with clear boundaries. No naked text floating on screen.

**Grouped, not listed.** Days are grouped under destinations. Stops are grouped under days. Accommodations are grouped by destination. The hierarchy is always visible.

**Progressive disclosure.** Trip Overview shows summary. Tap a day to see stops. Tap a stop to see details. Each level adds depth without overwhelming.

**Color as status.**

| Color | Meaning |
|-------|---------|
| Orange (#E5653A) | Active, current, action needed |
| Green | Booked, confirmed, done |
| Neutral gray | Planned, pending |
| Dashed border | Empty, waiting to be filled |

**Typography hierarchy:**
- Trip title: 22px semiBold
- Section headers: 15px semiBold, uppercase letterSpacing: 0.5, `colors.textMuted`
- Day labels: 15px medium
- Stop titles: 16px medium
- Stop metadata: 13px regular, `colors.textSecondary`
- Timestamps: 12px medium, monospace-aligned

### Patterns to Use

1. **Sticky bottom action bar**: Every screen with an "add" action uses a sticky bottom bar. Consistent position = muscle memory.

2. **Dashed placeholder cards**: Empty states use dashed borders (1px dashed, `colors.border`) with centered prompt text. Not error states — invitations.

3. **Orange left border**: Active/today items get a 3px orange left border. This is the universal "pay attention" signal.

4. **Pill metadata**: Stats, tags, and status indicators are pills (borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4). Never bare text.

5. **Sheet-based input**: All add/edit actions happen in bottom sheets, not new screens. This keeps context — you can see the trip while adding to it.

6. **Horizontal scroll for previews**: Saved items, accommodations, and suggestions use horizontal scroll with peeking cards (show 70% of next card).

### Patterns to Avoid

1. **No full-screen modals for editing.** Sheets only. Modals break context.
2. **No color-coded categories.** One accent color (orange). Status colors only for status.
3. **No icons on section headers.** Typography only. Section headers are 15px semiBold uppercase.
4. **No toggle-heavy settings.** Use smart defaults. Settings are discoverable but not required.
5. **No empty list views.** Every empty state has a clear action prompt.
6. **No confirmation dialogs for adding.** Only for deleting. Adding should be instant.

---

## Part 14: Implementation Priority

### Phase 1: Foundation (Week 1–2)

**Database:**
1. Create `trip_accommodations` table + migration
2. Create `trip_transports` table + migration
3. Create `trip_notification_settings` table + migration
4. Add `source` column to `trip_saved_items`

**Data layer:**
5. Add accommodation CRUD to `tripApi.ts`
6. Add transport CRUD to `tripApi.ts`
7. Add `useAccommodations()` and `useTransports()` hooks
8. Create `mapsLinks.ts` utility

### Phase 2: Core UX (Week 3–4)

**Trip Overview redesign:**
9. Redesign `[id].tsx` with new sections layout
10. Build `AccommodationSection` component
11. Build `TransportCard` component
12. Build `TripStatsRow` component
13. Add "Open in Maps" links to stop blocks

**Trip Creation simplification:**
14. Simplify `new.tsx` — remove cover photo, buddies, privacy from creation flow
15. Create `[id]/settings.tsx` for moved options
16. Remove 5-stop cap

### Phase 3: Save System (Week 5–6)

**Unified Save Sheet:**
17. Build `SaveSheet.tsx` component
18. Build `TripPicker.tsx` and `DayPicker.tsx` sub-components
19. Build `CollectionPicker.tsx` sub-component
20. Replace `toggleSavePlace` calls on place/activity/accommodation pages
21. Build `ImportFromCollections.tsx` sheet

### Phase 4: Trip Mode (Week 7–8)

**Smart Daily Mode:**
22. Build `TripModeCard.tsx` for Home tab
23. Add today highlighting to Trip Overview
24. Add live progress (done/current/upcoming) to Day Detail
25. Build `calendarExport.ts` utility
26. Build `notifications.ts` for local notifications
27. Create `trip_notification_settings` UI in trip settings

### Phase 5: Polish (Week 9–10)

28. Day map view (external maps link)
29. Trip profile display enhancements
30. Import from collections flow
31. Suggestion engine improvements
32. Edge cases: timezone handling, date validation, empty states
33. PostHog analytics for all new interactions

---

## Part 15: How This Becomes the Emotional Core

The trip is not just a feature. It's the reason someone opens Sola every day.

**Before traveling:** Sola is where you dream and plan. You browse destinations, save places to collections, and slowly build your itinerary. The trip grows from a vague idea into a structured plan. Every time you open the app, you're one step closer to departure.

**While traveling:** Sola is your pocket guide. Trip Mode shows you what's next, helps you navigate, and gently nudges you to capture the moment. You check off stops, add journal entries, and discover nearby places. The app knows where you are and what you planned — it's a companion, not a tool.

**After traveling:** Sola is your travel journal. Your trip becomes a beautiful record of where you went, what you did, and how it felt. Public trips inspire other women. Your profile tells the story of every journey you've taken.

**The flywheel:**
```
Browse destinations → Save to collections → Plan a trip → Travel with Trip Mode
       ↑                                                         │
       └──── Journal inspires others ← Complete trip ←──────────┘
```

Each completed trip feeds back into the community. Sarah's Thailand journal inspires Maria to visit. Maria's Lisbon tips help Emma plan her trip. Every user's experience enriches the next traveler's journey.

**This is what makes Sola different from Google Maps, TripAdvisor, or a spreadsheet.** It's not a booking engine. It's not a review site. It's a women's travel companion that holds the entire arc of a journey — from the first spark of inspiration to the last journal entry.

The trip is the heart. Everything else orbits around it.
