# Trips Redesign — Journey Timeline, Journal & Safe Connections

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the Trips tab from a basic trip list into a personal travel journey space with timeline journaling, light itinerary planning, and safe traveler matching — all with women-first safety principles embedded into the product behavior.

**Architecture:** New Supabase tables (`trips` evolves, + `trip_stops`, `trip_entries`, `trip_saved_items`, `trip_matching_preferences`) with RLS. React Native screens using Expo Router file-based routing with a segmented-control Trip Detail view (Journey / Plan / People). Mock seed data wired to the production schema. Reuses existing design system, connection request model, and location consent patterns.

**Tech Stack:** React Native, Expo Router, Supabase (PostgreSQL + RLS), PostHog analytics, expo-image, expo-linear-gradient, @react-native-community/datetimepicker

---

## Current State Audit

### What Trips currently is
- **Trips Home** (`app/(tabs)/trips/index.tsx`): Flat list of trips with flag emoji + destination + dates + status badge. No grouping (current/upcoming/past). No hero images. No quick actions.
- **Create Trip** (`app/(tabs)/trips/new.tsx`): Destination search → date pickers → notes → save. Single-city only. No privacy controls. No travel style tags. No multi-stop.
- **Trip Detail** (`app/(tabs)/trips/[id].tsx`): Hero image + destination header + date chips + notes + 4 place cards + emergency numbers. No journaling. No timeline. No people. "Add a place" button is non-functional.

### Why it's not useful
1. No way to journal or track experiences during a trip
2. No distinction between past/current/upcoming trips
3. Single destination per trip (no multi-stop)
4. No privacy controls or matching opt-in
5. No connection to the Travelers system
6. No safety/comfort tracking
7. Trip detail is read-only — no way to add entries or manage the trip
8. Design doesn't match the premium editorial quality of Explore

### What we keep
- `searchDestinations()` API — reuse for destination search in Create Trip
- `getEmergencyNumbers()` — keep in Trip Detail
- `useData` hook pattern — reuse everywhere
- `AppScreen`, `AppHeader`, `LoadingScreen`, `ErrorScreen` — reuse
- Design system tokens (colors, spacing, typography, radius)
- PostHog analytics pattern
- `toCamel`/`rowsToCamel` conversion pattern
- Date formatting helpers (extract to shared util)

### What we delete/replace
- Current `trips/index.tsx` — replace entirely (new grouped layout)
- Current `trips/new.tsx` — replace entirely (new multi-step flow)
- Current `trips/[id].tsx` — replace entirely (new Journey/Plan/People detail)
- Current `trips` DB table — migrate to expanded schema
- Current `trip_places` DB table — replaced by `trip_saved_items`

---

## Information Architecture

```
Trips Tab
├── Trips Home (index.tsx)
│   ├── Current Trip card (hero, prominent)
│   ├── Upcoming Trips section
│   └── Past Trips section (collapsed by default)
│
├── Create Trip (new.tsx) — 2-step flow
│   ├── Step 1: Destination + dates
│   └── Step 2: Style tags + privacy settings
│
└── Trip Detail ([id].tsx)
    ├── Trip Header (hero image, destination, dates)
    └── Segmented Control:
        ├── Journey — chronological timeline of entries
        ├── Plan — saved places + notes
        └── People — overlapping travelers (opt-in)
```

---

## Supabase Schema

### Migration: `20260205_trips_redesign.sql`

```sql
-- ============================================================
-- TRIPS REDESIGN MIGRATION
-- Evolves trips from simple records to journey containers
-- ============================================================

-- 1. Add new columns to existing trips table
ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS privacy_level text NOT NULL DEFAULT 'private'
    CHECK (privacy_level IN ('private', 'friends', 'public')),
  ADD COLUMN IF NOT EXISTS matching_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS travel_style_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS flexible_dates boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Make arriving/leaving nullable (support "exploring ideas" mode)
ALTER TABLE trips ALTER COLUMN arriving DROP NOT NULL;
ALTER TABLE trips ALTER COLUMN leaving DROP NOT NULL;

-- Drop the NOT NULL on destination_city_id (support country-only trips)
ALTER TABLE trips ALTER COLUMN destination_city_id DROP NOT NULL;

-- Update status enum to include 'draft'
ALTER TABLE trips DROP CONSTRAINT IF EXISTS trips_status_check;
ALTER TABLE trips ADD CONSTRAINT trips_status_check
  CHECK (status IN ('draft', 'planned', 'active', 'completed'));

-- 2. Trip stops (multi-stop support)
CREATE TABLE IF NOT EXISTS trip_stops (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  stop_order int NOT NULL DEFAULT 0,
  country_iso2 char(2) NOT NULL,
  city_id uuid REFERENCES cities(id),
  city_name text,
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_trip_stops_trip ON trip_stops(trip_id);

-- 3. Trip entries (journal timeline)
CREATE TABLE IF NOT EXISTS trip_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_type text NOT NULL DEFAULT 'note'
    CHECK (entry_type IN ('note', 'arrival', 'departure', 'stay', 'tip', 'comfort_check', 'highlight')),
  title text,
  body text,
  location_name text,
  mood_tag text CHECK (mood_tag IN ('calm', 'happy', 'uneasy', 'unsafe', NULL)),
  visibility text NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'shared', 'public')),
  is_shareable_tip boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_trip_entries_trip ON trip_entries(trip_id);
CREATE INDEX idx_trip_entries_user ON trip_entries(user_id);
CREATE INDEX idx_trip_entries_type ON trip_entries(entry_type);

-- Auto-update updated_at
CREATE TRIGGER trip_entries_updated_at
  BEFORE UPDATE ON trip_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Trip saved items (replaces trip_places with a more flexible model)
CREATE TABLE IF NOT EXISTS trip_saved_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN ('place', 'city', 'country', 'activity')),
  entity_id uuid NOT NULL,
  category text DEFAULT 'general'
    CHECK (category IN ('general', 'accommodation', 'food', 'activity', 'transport', 'other')),
  notes text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_trip_saved_items_trip ON trip_saved_items(trip_id);
CREATE UNIQUE INDEX idx_trip_saved_items_unique ON trip_saved_items(trip_id, entity_type, entity_id);

-- 5. Trip matching preferences
CREATE TABLE IF NOT EXISTS trip_matching_preferences (
  trip_id uuid PRIMARY KEY REFERENCES trips(id) ON DELETE CASCADE,
  style_tags text[] DEFAULT '{}',
  match_radius_km int DEFAULT 50,
  show_profile boolean NOT NULL DEFAULT true,
  show_dates boolean NOT NULL DEFAULT true,
  show_stops boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-update updated_at
CREATE TRIGGER trip_matching_prefs_updated_at
  BEFORE UPDATE ON trip_matching_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Trip stops: owner only
ALTER TABLE trip_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trip stops"
  ON trip_stops FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own trip stops"
  ON trip_stops FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own trip stops"
  ON trip_stops FOR UPDATE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own trip stops"
  ON trip_stops FOR DELETE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

-- Trip entries: owner only (visibility column is for future sharing features)
ALTER TABLE trip_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trip entries"
  ON trip_entries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own trip entries"
  ON trip_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own trip entries"
  ON trip_entries FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own trip entries"
  ON trip_entries FOR DELETE
  USING (user_id = auth.uid());

-- Trip saved items: owner only
ALTER TABLE trip_saved_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trip saved items"
  ON trip_saved_items FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own trip saved items"
  ON trip_saved_items FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own trip saved items"
  ON trip_saved_items FOR UPDATE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own trip saved items"
  ON trip_saved_items FOR DELETE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

-- Trip matching preferences: owner only
ALTER TABLE trip_matching_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matching prefs"
  ON trip_matching_preferences FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can upsert own matching prefs"
  ON trip_matching_preferences FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own matching prefs"
  ON trip_matching_preferences FOR UPDATE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

-- ============================================================
-- MATCHING QUERY (for People tab)
-- Only shows travelers who:
--   1. Have opted in to matching on their trip
--   2. Have date+location overlap with the viewing user's trip
--   3. Are not blocked
-- Exposes limited fields only.
-- ============================================================

-- View for safe matching (no direct table access needed from client)
CREATE OR REPLACE VIEW trip_overlap_matches AS
SELECT
  t1.id AS my_trip_id,
  t1.user_id AS my_user_id,
  t2.id AS their_trip_id,
  t2.user_id AS their_user_id,
  ts2.city_name AS overlap_city,
  ts2.country_iso2 AS overlap_country,
  GREATEST(ts1.start_date, ts2.start_date) AS overlap_start,
  LEAST(ts1.end_date, ts2.end_date) AS overlap_end,
  t2.travel_style_tags AS their_style_tags
FROM trips t1
JOIN trip_stops ts1 ON ts1.trip_id = t1.id
JOIN trip_stops ts2 ON ts2.country_iso2 = ts1.country_iso2
  AND (ts2.city_id = ts1.city_id OR ts1.city_id IS NULL OR ts2.city_id IS NULL)
  AND ts2.start_date <= ts1.end_date
  AND ts2.end_date >= ts1.start_date
JOIN trips t2 ON t2.id = ts2.trip_id
  AND t2.user_id != t1.user_id
  AND t2.matching_opt_in = true
  AND t2.status IN ('planned', 'active')
WHERE t1.matching_opt_in = true
  AND t1.status IN ('planned', 'active');
```

### Seed Migration: `20260205_seed_trips.sql`

```sql
-- ============================================================
-- SEED: Demo trips for development
-- Uses the same demo user UUIDs from seed_demo_travelers
-- ============================================================

-- Aisha's trip (active, in Chiang Mai now)
INSERT INTO trips (id, user_id, destination_city_id, destination_name, country_iso2, title, arriving, leaving, nights, status, privacy_level, matching_opt_in, travel_style_tags, notes)
VALUES (
  '11111111-aaaa-1111-aaaa-111111111111',
  '00000000-0000-0000-0000-000000000001', -- Aisha
  (SELECT id FROM cities WHERE slug = 'chiang-mai' LIMIT 1),
  'Chiang Mai',
  'TH',
  'Northern Thailand Solo',
  '2026-01-28',
  '2026-02-15',
  18,
  'active',
  'private',
  true,
  ARRAY['calm', 'nature', 'cultural'],
  'Documenting hill tribe communities for my next project'
);

-- Aisha's trip stop
INSERT INTO trip_stops (trip_id, stop_order, country_iso2, city_id, city_name, start_date, end_date)
VALUES (
  '11111111-aaaa-1111-aaaa-111111111111',
  0,
  'TH',
  (SELECT id FROM cities WHERE slug = 'chiang-mai' LIMIT 1),
  'Chiang Mai',
  '2026-01-28',
  '2026-02-15'
);

-- Aisha's journal entries
INSERT INTO trip_entries (trip_id, user_id, entry_type, title, body, location_name, mood_tag, visibility, created_at)
VALUES
  ('11111111-aaaa-1111-aaaa-111111111111', '00000000-0000-0000-0000-000000000001', 'arrival', 'Arrived in Chiang Mai', 'The old city is beautiful at night. Found a great guesthouse near Tha Phae Gate.', 'Chiang Mai Old City', 'happy', 'private', '2026-01-28T14:00:00Z'),
  ('11111111-aaaa-1111-aaaa-111111111111', '00000000-0000-0000-0000-000000000001', 'note', 'Sunday Walking Street', 'Incredible market along Ratchadamnoen Road. Felt completely safe walking solo. Great street food and handmade jewelry.', 'Ratchadamnoen Road', 'happy', 'private', '2026-02-02T18:00:00Z'),
  ('11111111-aaaa-1111-aaaa-111111111111', '00000000-0000-0000-0000-000000000001', 'comfort_check', NULL, NULL, 'Chiang Mai Old City', 'calm', 'private', '2026-02-03T09:00:00Z'),
  ('11111111-aaaa-1111-aaaa-111111111111', '00000000-0000-0000-0000-000000000001', 'tip', 'Songthaew tip', 'Red trucks (songthaews) cost 30 baht per person inside the old city. Always agree on the price before getting in. Solo women — stick to the red ones, not the private ones at night.', 'Chiang Mai', NULL, 'private', '2026-02-04T10:00:00Z'),
  ('11111111-aaaa-1111-aaaa-111111111111', '00000000-0000-0000-0000-000000000001', 'highlight', 'Doi Suthep sunrise', 'Woke up at 5am to catch the sunrise from Doi Suthep temple. Worth every sleepy minute. The monks were doing morning prayers.', 'Doi Suthep', 'happy', 'private', '2026-02-05T06:30:00Z');

-- Mei's trip (planned, upcoming to Hanoi)
INSERT INTO trips (id, user_id, destination_city_id, destination_name, country_iso2, title, arriving, leaving, nights, status, privacy_level, matching_opt_in, travel_style_tags)
VALUES (
  '22222222-bbbb-2222-bbbb-222222222222',
  '00000000-0000-0000-0000-000000000002', -- Mei
  (SELECT id FROM cities WHERE slug = 'hanoi' LIMIT 1),
  'Hanoi',
  'VN',
  'Vietnam Food Journey',
  '2026-02-20',
  '2026-03-05',
  13,
  'planned',
  'private',
  true,
  ARRAY['social', 'food', 'cultural']
);

INSERT INTO trip_stops (trip_id, stop_order, country_iso2, city_id, city_name, start_date, end_date)
VALUES
  ('22222222-bbbb-2222-bbbb-222222222222', 0, 'VN', (SELECT id FROM cities WHERE slug = 'hanoi' LIMIT 1), 'Hanoi', '2026-02-20', '2026-02-27'),
  ('22222222-bbbb-2222-bbbb-222222222222', 1, 'VN', (SELECT id FROM cities WHERE slug = 'hoi-an' LIMIT 1), 'Hoi An', '2026-02-27', '2026-03-05');

-- Sofia's trip (completed, past)
INSERT INTO trips (id, user_id, destination_city_id, destination_name, country_iso2, title, arriving, leaving, nights, status, privacy_level, matching_opt_in, travel_style_tags, notes)
VALUES (
  '33333333-cccc-3333-cccc-333333333333',
  '00000000-0000-0000-0000-000000000003', -- Sofia
  (SELECT id FROM cities WHERE slug = 'ubud' LIMIT 1),
  'Ubud',
  'ID',
  'Bali Wellness Retreat',
  '2026-01-05',
  '2026-01-20',
  15,
  'completed',
  'private',
  false,
  ARRAY['calm', 'wellness', 'nature'],
  'Best two weeks of the year. The rice terraces changed something in me.'
);

INSERT INTO trip_stops (trip_id, stop_order, country_iso2, city_id, city_name, start_date, end_date)
VALUES (
  '33333333-cccc-3333-cccc-333333333333',
  0,
  'ID',
  (SELECT id FROM cities WHERE slug = 'ubud' LIMIT 1),
  'Ubud',
  '2026-01-05',
  '2026-01-20'
);

-- Sofia's completed journal
INSERT INTO trip_entries (trip_id, user_id, entry_type, title, body, location_name, mood_tag, visibility, created_at)
VALUES
  ('33333333-cccc-3333-cccc-333333333333', '00000000-0000-0000-0000-000000000003', 'arrival', 'Hello Bali', 'The humidity hit me like a wall but the smell of incense and frangipani made up for it.', 'Ubud', 'happy', 'private', '2026-01-05T11:00:00Z'),
  ('33333333-cccc-3333-cccc-333333333333', '00000000-0000-0000-0000-000000000003', 'stay', 'Bamboo Indah', 'Staying in one of the bamboo houses. It feels like sleeping in a treehouse. The river sounds lull you to sleep.', 'Bamboo Indah, Ubud', 'calm', 'private', '2026-01-06T08:00:00Z'),
  ('33333333-cccc-3333-cccc-333333333333', '00000000-0000-0000-0000-000000000003', 'highlight', 'Tegallalang Rice Terraces', 'Walked through the terraces at golden hour. No words needed.', 'Tegallalang', 'happy', 'private', '2026-01-10T16:30:00Z'),
  ('33333333-cccc-3333-cccc-333333333333', '00000000-0000-0000-0000-000000000003', 'comfort_check', NULL, NULL, 'Ubud', 'calm', 'private', '2026-01-12T20:00:00Z'),
  ('33333333-cccc-3333-cccc-333333333333', '00000000-0000-0000-0000-000000000003', 'tip', 'Scooter rental', 'Rent from your guesthouse, not the street guys. Women traveling solo — avoid riding at night on the monkey forest road, it gets very dark and there are no lights.', 'Ubud', NULL, 'private', '2026-01-15T11:00:00Z');
```

### RLS Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `trips` | Owner (existing) | Owner (existing) | Owner (existing) | Owner (existing) |
| `trip_stops` | Owner via trip | Owner via trip | Owner via trip | Owner via trip |
| `trip_entries` | Owner (user_id) | Owner (user_id) | Owner (user_id) | Owner (user_id) |
| `trip_saved_items` | Owner via trip | Owner via trip | Owner via trip | Owner via trip |
| `trip_matching_preferences` | Owner via trip | Owner via trip | Owner via trip | — |
| `trip_overlap_matches` | View (inherits trip RLS) | — | — | — |

**Matching safety**: The `trip_overlap_matches` view only returns rows where BOTH users have `matching_opt_in = true`. Client code further filters out blocked users. Only profile avatar, name, nationality, and travel style tags are shown — never exact location or entry details.

---

## Screen Specifications

### 1. Trips Home (`app/(tabs)/trips/index.tsx`)

**Layout:**
```
┌──────────────────────────────┐
│ [AppHeader: "Trips"    (+)]  │  ← serif "Trips" title, orange add button
│                              │
│ ┌──────────────────────────┐ │
│ │ CURRENT TRIP (hero card) │ │  ← If active trip exists, full-width
│ │ [Hero image gradient]    │ │    hero image card with overlay text
│ │ 🟢 Active · Day 9       │ │
│ │ "Northern Thailand Solo" │ │
│ │ Chiang Mai → 18 nights   │ │
│ │ [Journal] [Plan] [People]│ │  ← 3 quick-action pill buttons
│ └──────────────────────────┘ │
│                              │
│ UPCOMING                     │  ← Section header, muted caps
│ ┌──────────────────────────┐ │
│ │ 🇻🇳 Vietnam Food Journey │ │  ← Compact card: flag + title + dates
│ │    Feb 20 - Mar 5 · 13n  │ │    + nights badge
│ │    Hanoi → Hoi An        │ │  ← Multi-stop shown
│ └──────────────────────────┘ │
│                              │
│ PAST                         │  ← Collapsed by default, "Show past trips"
│ ▼ Show past trips            │
│ ┌──────────────────────────┐ │
│ │ 🇮🇩 Bali Wellness Retreat│ │
│ │    Jan 5 - Jan 20        │ │
│ │    Ubud                  │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

**Behavior:**
- Trips are grouped by status: active first, then planned (sorted by arriving date), then completed (most recent first)
- Current trip card is a premium hero card with gradient overlay, similar to Explore feed cards
- If no current trip, upcoming trips fill the space
- Past trips are collapsed by default with a "Show past trips" toggle
- Empty state: editorial illustration + "Plan your first journey" CTA
- Pull-to-refresh via `useFocusEffect` refetch

**Components:**
- `CurrentTripCard` — hero image + gradient + overlay text + quick action pills
- `TripListCard` — compact card for upcoming/past trips
- `TripEmptyState` — editorial empty state

---

### 2. Create Trip (`app/(tabs)/trips/new.tsx`)

**2-step flow, single scrollable screen with progressive disclosure:**

**Step 1 — Where & When:**
```
┌──────────────────────────────┐
│ [←]  New Journey             │
│                              │
│ Where are you headed?        │
│ ┌──────────────────────────┐ │
│ │ 🔍 Search cities...      │ │  ← Existing search, but now supports
│ └──────────────────────────┘ │    multi-stop via "+ Add another stop"
│                              │
│ 🇹🇭 Chiang Mai, Thailand    │  ← Selected stop (removable)
│ 🇻🇳 Hanoi, Vietnam          │
│ [+ Add another stop]        │  ← Optional, max 5 stops
│                              │
│ When?                        │
│ ┌────────────┐┌────────────┐ │
│ │ Arriving   ││ Leaving    │ │  ← Same date picker pattern
│ │ Pick date  ││ Pick date  │ │
│ └────────────┘└────────────┘ │
│ [I'm flexible with dates]   │  ← Toggle, allows saving without dates
│                              │
│ Trip name (optional)         │
│ ┌──────────────────────────┐ │
│ │ e.g. "Northern Thailand" │ │  ← Auto-generates from first stop if empty
│ └──────────────────────────┘ │
│                              │
│ [Continue →]                 │  ← Requires at least 1 stop
└──────────────────────────────┘
```

**Step 2 — Style & Privacy (revealed on Continue):**
```
┌──────────────────────────────┐
│                              │
│ How do you like to travel?   │  ← Optional, skip-able
│ ○ Calm  ○ Social  ○ Nature  │  ← Selectable tag pills (multi-select)
│ ○ Cultural ○ Food ○ Wellness│
│ ○ Adventure ○ Budget        │
│                              │
│ Privacy                      │  ← Clear, upfront
│ ┌──────────────────────────┐ │
│ │ 🔒 Keep trip private     │ │  ← Toggle (default: ON)
│ │ Your trip is only visible │ │
│ │ to you                   │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ 👥 Traveler matching     │ │  ← Toggle (default: OFF)
│ │ Allow Sola to recommend  │ │
│ │ travelers on your route  │ │
│ │                          │ │
│ │ When enabled, travelers  │ │
│ │ with overlapping dates & │ │
│ │ cities can see your name │ │
│ │ and travel style — never │ │
│ │ your exact location or   │ │
│ │ journal entries.         │ │  ← Explicit consent copy
│ └──────────────────────────┘ │
│                              │
│ [Save journey]               │
│ [Skip for now]               │  ← Saves as draft with defaults
└──────────────────────────────┘
```

**Behavior:**
- At least one destination stop is required
- Dates are encouraged but optional (saves as `draft` status if no dates)
- With dates, saves as `planned` status
- Trip name auto-generates from first destination if left blank (e.g., "Chiang Mai")
- Privacy defaults to private, matching defaults to OFF
- "Skip for now" saves with all defaults (private, no matching, no tags)
- Multi-stop: each stop gets country_iso2 + optional city_id resolved from search

---

### 3. Trip Detail (`app/(tabs)/trips/[id].tsx`)

**Header (always visible):**
```
┌──────────────────────────────┐
│ [←]                    [···] │  ← Back + overflow menu (edit, delete)
│                              │
│ [Hero image with gradient]   │  ← City hero image or trip cover
│ Northern Thailand Solo       │  ← Trip title in serif font
│ 🇹🇭 Chiang Mai · 18 nights  │
│ Jan 28 — Feb 15             │
│ 🟢 Day 9                    │  ← Status + day counter if active
│                              │
│ [Journey]  [Plan]  [People]  │  ← Segmented control
└──────────────────────────────┘
```

#### 3A. Journey Tab (Timeline)

```
┌──────────────────────────────┐
│ [+ Add entry]                │  ← Floating action, bottom-right
│                              │
│ TODAY                        │
│ ┌──────────────────────────┐ │
│ │ ✨ Doi Suthep sunrise    │ │  ← Entry card: icon + title
│ │ Woke up at 5am to catch  │ │    + body preview (2 lines)
│ │ the sunrise from...      │ │    + location tag + time
│ │ 📍 Doi Suthep · 6:30 AM │ │
│ └──────────────────────────┘ │
│                              │
│ YESTERDAY                    │
│ ┌──────────────────────────┐ │
│ │ 💡 Songthaew tip         │ │  ← Tip entry type
│ │ Red trucks cost 30 baht  │ │
│ │ per person inside...     │ │
│ │ 📍 Chiang Mai · 10:00 AM │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ 🟢 Feeling calm          │ │  ← Comfort check (minimal card)
│ │ 📍 Old City · 9:00 AM   │ │
│ └──────────────────────────┘ │
│                              │
│ FEB 2                        │
│ ┌──────────────────────────┐ │
│ │ 📝 Sunday Walking Street │ │
│ │ Incredible market along  │ │
│ │ Ratchadamnoen Road...    │ │
│ │ 📍 Ratchadamnoen · 6 PM │ │
│ └──────────────────────────┘ │
│                              │
│ JAN 28                       │
│ ┌──────────────────────────┐ │
│ │ ✈️ Arrived in Chiang Mai │ │  ← Arrival entry
│ │ The old city is beautiful │ │
│ │ at night...              │ │
│ │ 📍 Old City · 2:00 PM   │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

**Add Entry Bottom Sheet:**
```
┌──────────────────────────────┐
│ What happened?               │
│                              │
│ ○ Note         📝           │  ← Entry type selector (pill buttons)
│ ○ Arrived at   ✈️           │
│ ○ Staying at   🏠           │
│ ○ Tip          💡           │
│ ○ Highlight    ✨           │
│ ○ How I feel   🫧           │  ← Comfort check
│                              │
│ [Title — optional]           │
│ [What's on your mind?]       │  ← Multiline text input
│                              │
│ 📍 Location (optional)       │  ← Free text, not geocoded
│                              │
│ [Comfort check row — if type │
│  is "How I feel"]            │
│ ○ Calm  ○ Happy  ○ Uneasy  │  ← Mood selector pills
│ ○ Unsafe                    │
│                              │
│ 🔒 Private (only you can see)│ ← Default, shown as reassurance
│                              │
│ [Save entry]                 │
└──────────────────────────────┘
```

**Entry type icons (used in timeline):**
| Type | Icon | Label |
|------|------|-------|
| `note` | 📝 | Note |
| `arrival` | ✈️ | Arrived |
| `departure` | 🛫 | Departed |
| `stay` | 🏠 | Staying at |
| `tip` | 💡 | Tip |
| `comfort_check` | 🫧 | Comfort |
| `highlight` | ✨ | Highlight |

**Comfort check mood colors:**
| Mood | Color | Icon |
|------|-------|------|
| `calm` | greenSoft/greenFill | 🟢 |
| `happy` | blueSoft/blueFill | 🔵 |
| `uneasy` | warning/warningFill | 🟡 |
| `unsafe` | emergency/emergencyFill | 🔴 |

#### 3B. Plan Tab

```
┌──────────────────────────────┐
│                              │
│ Saved places                 │  ← From trip_saved_items
│ ┌──────────────────────────┐ │
│ │ [PlaceCard — same as     │ │  ← Reuses existing PlaceCard pattern
│ │  current trip detail]    │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ [PlaceCard]              │ │
│ └──────────────────────────┘ │
│ [+ Add a place]             │  ← Links to city explore page
│                              │
│ Notes                        │
│ ┌──────────────────────────┐ │
│ │ Things to remember...    │ │  ← From trip.notes field
│ │                          │ │    Editable in-place
│ └──────────────────────────┘ │
│                              │
│ Emergency numbers            │  ← Same emergency card as before
│ ┌──────────────────────────┐ │
│ │ Police     191           │ │
│ │ Ambulance  1669          │ │
│ │ Fire       199           │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

#### 3C. People Tab

```
┌──────────────────────────────┐  (if matching_opt_in = false)
│                              │
│ 🔒 Traveler matching is off  │
│                              │
│ When you turn on matching,   │
│ Sola will recommend travelers│
│ who overlap your route.      │
│                              │
│ Only your name, photo, and   │
│ travel style are shared —    │
│ never your journal or exact  │
│ location.                    │
│                              │
│ [Turn on matching]           │
└──────────────────────────────┘

┌──────────────────────────────┐  (if matching_opt_in = true, has matches)
│                              │
│ Travelers on your route      │
│                              │
│ ┌──────────────────────────┐ │
│ │ [TravelerCard]           │ │  ← Reuses existing TravelerCard
│ │ Aisha · Chiang Mai       │ │    with overlap context
│ │ "You'll both be in       │ │
│ │  Chiang Mai, Feb 20-27"  │ │
│ │ [Connect]                │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ [TravelerCard]           │ │
│ │ Priya · Chiang Mai       │ │
│ │ "Similar style: calm,    │ │
│ │  cultural"               │ │
│ │ [Connect]                │ │
│ └──────────────────────────┘ │
│                              │
│ ℹ️ Only showing travelers    │  ← Reassurance footer
│ who also opted in            │
└──────────────────────────────┘

┌──────────────────────────────┐  (if matching_opt_in = true, no matches)
│                              │
│ No travelers on your route   │
│ yet                          │
│                              │
│ We'll notify you when        │
│ someone with overlapping     │
│ dates and cities appears.    │
└──────────────────────────────┘
```

---

## Women-First Features (Behavioral, Not Just Copy)

1. **Comfort checks are private by default** — mood_tag and comfort entries never leave the device unless explicitly shared later. The UI shows 🔒 icon next to "Only you can see this".

2. **Matching is opt-in, not opt-out** — Default is OFF. The consent copy explains exactly what is shared (name, photo, travel style) and what is NOT shared (journal, exact location, dates beyond overlap window).

3. **Tip entries have a "share with other women" flag** — `is_shareable_tip` boolean. MVP: just captures the intent. Future: feeds into a women's tip network.

4. **Emergency numbers are always accessible** — Available in the Plan tab for every trip, pulled from the first stop's country.

5. **"Unsafe" mood triggers no action** — This is intentional. It's a private journal. No alerts, no notifications. The user is in control. Future: optional trusted contact sharing.

6. **Privacy controls are upfront and reversible** — Set during trip creation, changeable anytime from trip settings. Clear language about what each toggle means.

---

## Onboarding Integration

**No changes to onboarding flow length.** Instead:

1. After onboarding completes, if the user has not yet created a trip, show a gentle prompt on the Trips tab:
   - Not a modal — just an enhanced empty state
   - "Planning something? Start a journey to organize your ideas."
   - Dismissable, never returns after dismissed

2. If a trip is created (during onboarding or after), use `travel_style_tags` to influence:
   - Explore feed ordering (future — just capture the data now)
   - Traveler matching context (immediate — used in People tab)

3. No trip creation step added to onboarding. The Trips tab IS the entry point.

---

## File Structure (New/Modified)

```
app/(tabs)/trips/
  _layout.tsx              ← Keep (Stack, headerShown: false)
  index.tsx                ← REWRITE — Trips Home with grouped sections
  new.tsx                  ← REWRITE — 2-step create flow
  [id].tsx                 ← REWRITE — Trip Detail with segmented tabs

components/trips/
  CurrentTripCard.tsx      ← NEW — Hero card for active trip
  TripListCard.tsx         ← NEW — Compact card for upcoming/past
  TripEmptyState.tsx       ← NEW — Premium empty state
  JourneyTimeline.tsx      ← NEW — Timeline feed of entries
  JourneyEntryCard.tsx     ← NEW — Single entry card in timeline
  AddEntrySheet.tsx        ← NEW — Bottom sheet for adding entries
  PlanTab.tsx              ← NEW — Saved places + notes + emergency
  PeopleTab.tsx            ← NEW — Traveler matching (opt-in)
  SegmentedControl.tsx     ← NEW — Reusable segmented tab control
  TripPrivacyCard.tsx      ← NEW — Privacy toggle card (reused in create + settings)
  StyleTagPicker.tsx       ← NEW — Travel style tag multi-selector

data/
  trips/
    useTrips.ts            ← NEW — Hook for trips list (grouped by status)
    useTripDetail.ts       ← NEW — Hook for single trip + stops + entries
    useTripMatches.ts      ← NEW — Hook for People tab matching
    tripApi.ts             ← NEW — All trip CRUD operations
    types.ts               ← NEW — Trip-specific types
    helpers.ts             ← NEW — Date formatting, status helpers, entry icons

supabase/migrations/
  20260205_trips_redesign.sql      ← NEW — Schema migration
  20260205_seed_trips.sql          ← NEW — Demo seed data
```

---

## Implementation Tasks

### Task 1: Supabase Schema Migration

**Files:**
- Create: `supabase/migrations/20260205_trips_redesign.sql`
- Create: `supabase/migrations/20260205_seed_trips.sql`

**Step 1: Write the trips redesign migration**

Create the migration file with the full SQL from the schema section above. This includes:
- ALTER trips table (add title, privacy_level, matching_opt_in, travel_style_tags, flexible_dates, cover_image_url; make arriving/leaving nullable; update status check)
- CREATE trip_stops table
- CREATE trip_entries table with trigger
- CREATE trip_saved_items table
- CREATE trip_matching_preferences table
- All RLS policies
- trip_overlap_matches view

Use the exact SQL from the "Migration: `20260205_trips_redesign.sql`" section above.

**Step 2: Write the seed data migration**

Create the seed file with demo trips for Aisha (active), Mei (planned), and Sofia (completed). Use the exact SQL from the "Seed Migration" section above.

**Step 3: Commit**

```bash
git add supabase/migrations/20260205_trips_redesign.sql supabase/migrations/20260205_seed_trips.sql
git commit -m "feat(trips): add redesign schema migration and seed data

New tables: trip_stops, trip_entries, trip_saved_items, trip_matching_preferences
Evolves trips table with title, privacy, matching, style tags
RLS policies for all new tables
Demo seed data for 3 travelers with journal entries"
```

---

### Task 2: Trip Types & Helpers

**Files:**
- Create: `data/trips/types.ts`
- Create: `data/trips/helpers.ts`

**Step 1: Create trip types**

```typescript
// data/trips/types.ts

export type TripStatus = 'draft' | 'planned' | 'active' | 'completed';
export type PrivacyLevel = 'private' | 'friends' | 'public';
export type EntryType = 'note' | 'arrival' | 'departure' | 'stay' | 'tip' | 'comfort_check' | 'highlight';
export type MoodTag = 'calm' | 'happy' | 'uneasy' | 'unsafe';
export type EntryVisibility = 'private' | 'shared' | 'public';
export type SavedItemCategory = 'general' | 'accommodation' | 'food' | 'activity' | 'transport' | 'other';

export interface TripStop {
  id: string;
  tripId: string;
  stopOrder: number;
  countryIso2: string;
  cityId: string | null;
  cityName: string | null;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  createdAt: string;
}

export interface TripEntry {
  id: string;
  tripId: string;
  userId: string;
  entryType: EntryType;
  title: string | null;
  body: string | null;
  locationName: string | null;
  moodTag: MoodTag | null;
  visibility: EntryVisibility;
  isShareableTip: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TripSavedItem {
  id: string;
  tripId: string;
  entityType: 'place' | 'city' | 'country' | 'activity';
  entityId: string;
  category: SavedItemCategory;
  notes: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface TripMatchingPrefs {
  tripId: string;
  styleTags: string[];
  matchRadiusKm: number;
  showProfile: boolean;
  showDates: boolean;
  showStops: boolean;
}

export interface TripOverlapMatch {
  myTripId: string;
  myUserId: string;
  theirTripId: string;
  theirUserId: string;
  overlapCity: string | null;
  overlapCountry: string;
  overlapStart: string;
  overlapEnd: string;
  theirStyleTags: string[];
}

/** Extended Trip type for the redesign (superset of existing Trip) */
export interface TripFull {
  id: string;
  userId: string;
  destinationCityId: string | null;
  destinationName: string;
  countryIso2: string;
  title: string | null;
  arriving: string | null;
  leaving: string | null;
  nights: number;
  status: TripStatus;
  privacyLevel: PrivacyLevel;
  matchingOptIn: boolean;
  travelStyleTags: string[];
  flexibleDates: boolean;
  coverImageUrl: string | null;
  notes: string | null;
  createdAt: string;
}

/** Trip with its stops preloaded */
export interface TripWithStops extends TripFull {
  stops: TripStop[];
}

/** Grouped trips for the home screen */
export interface GroupedTrips {
  current: TripWithStops | null;
  upcoming: TripWithStops[];
  past: TripWithStops[];
}

/** Input for creating a new trip */
export interface CreateTripInput {
  title?: string;
  stops: {
    countryIso2: string;
    cityId?: string;
    cityName?: string;
    startDate?: string;
    endDate?: string;
  }[];
  arriving?: string;
  leaving?: string;
  flexibleDates?: boolean;
  travelStyleTags?: string[];
  privacyLevel?: PrivacyLevel;
  matchingOptIn?: boolean;
  notes?: string;
}

/** Input for creating a trip entry */
export interface CreateEntryInput {
  tripId: string;
  entryType: EntryType;
  title?: string;
  body?: string;
  locationName?: string;
  moodTag?: MoodTag;
  visibility?: EntryVisibility;
  isShareableTip?: boolean;
}
```

**Step 2: Create helpers**

```typescript
// data/trips/helpers.ts

import { colors } from '@/constants/design';
import type { EntryType, MoodTag, TripStatus, TripFull } from './types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_MS = 86_400_000;

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatDateRelative(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const entryDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today.getTime() - entryDay.getTime()) / DAY_MS);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function nightsBetween(a: string, b: string): number {
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / DAY_MS));
}

export function getFlag(iso2: string): string {
  return iso2
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');
}

export function tripDayNumber(trip: TripFull): number | null {
  if (trip.status !== 'active' || !trip.arriving) return null;
  const start = new Date(trip.arriving);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / DAY_MS) + 1;
}

export const STATUS_COLORS: Record<TripStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: colors.neutralFill, text: colors.textSecondary, label: 'Draft' },
  planned: { bg: colors.blueFill, text: colors.blueSoft, label: 'Upcoming' },
  active: { bg: colors.greenFill, text: colors.greenSoft, label: 'Active' },
  completed: { bg: colors.neutralFill, text: colors.textSecondary, label: 'Completed' },
};

export const ENTRY_ICONS: Record<EntryType, string> = {
  note: '📝',
  arrival: '✈️',
  departure: '🛫',
  stay: '🏠',
  tip: '💡',
  comfort_check: '🫧',
  highlight: '✨',
};

export const ENTRY_LABELS: Record<EntryType, string> = {
  note: 'Note',
  arrival: 'Arrived',
  departure: 'Departed',
  stay: 'Staying at',
  tip: 'Tip',
  comfort_check: 'How I feel',
  highlight: 'Highlight',
};

export const MOOD_COLORS: Record<MoodTag, { bg: string; text: string; label: string }> = {
  calm: { bg: colors.greenFill, text: colors.greenSoft, label: 'Calm' },
  happy: { bg: colors.blueFill, text: colors.blueSoft, label: 'Happy' },
  uneasy: { bg: colors.warningFill, text: colors.warning, label: 'Uneasy' },
  unsafe: { bg: colors.emergencyFill, text: colors.emergency, label: 'Unsafe' },
};

export const TRAVEL_STYLE_OPTIONS = [
  { key: 'calm', label: 'Calm' },
  { key: 'social', label: 'Social' },
  { key: 'nature', label: 'Nature' },
  { key: 'cultural', label: 'Cultural' },
  { key: 'food', label: 'Food' },
  { key: 'wellness', label: 'Wellness' },
  { key: 'adventure', label: 'Adventure' },
  { key: 'budget', label: 'Budget' },
] as const;

/** Group entries by date for timeline display */
export function groupEntriesByDate(entries: { createdAt: string }[]): Map<string, typeof entries> {
  const groups = new Map<string, typeof entries>();
  for (const entry of entries) {
    const key = formatDateRelative(entry.createdAt);
    const group = groups.get(key) || [];
    group.push(entry);
    groups.set(key, group);
  }
  return groups;
}
```

**Step 3: Commit**

```bash
git add data/trips/types.ts data/trips/helpers.ts
git commit -m "feat(trips): add TypeScript types and helper utilities

Types for TripFull, TripStop, TripEntry, TripSavedItem, matching
Helpers for date formatting, status colors, entry icons, mood colors
Travel style options and timeline grouping utility"
```

---

### Task 3: Trip API Layer

**Files:**
- Create: `data/trips/tripApi.ts`

**Step 1: Create the API module**

```typescript
// data/trips/tripApi.ts

import { supabase } from '@/lib/supabase';
import { toCamel, rowsToCamel } from '@/data/api';
import type {
  TripFull,
  TripStop,
  TripEntry,
  TripSavedItem,
  TripWithStops,
  GroupedTrips,
  CreateTripInput,
  CreateEntryInput,
  TripOverlapMatch,
} from './types';
import { nightsBetween } from './helpers';

// ── Read ─────────────────────────────────────────────────────────

export async function getTripsGrouped(userId: string): Promise<GroupedTrips> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('arriving', { ascending: true, nullsFirst: false });
  if (error) throw error;

  const trips = rowsToCamel<TripFull>(data ?? []);

  // Fetch stops for all trips in one query
  const tripIds = trips.map((t) => t.id);
  const { data: stopsData } = await supabase
    .from('trip_stops')
    .select('*')
    .in('trip_id', tripIds)
    .order('stop_order', { ascending: true });
  const allStops = rowsToCamel<TripStop>(stopsData ?? []);

  const stopsMap = new Map<string, TripStop[]>();
  for (const stop of allStops) {
    const arr = stopsMap.get(stop.tripId) || [];
    arr.push(stop);
    stopsMap.set(stop.tripId, arr);
  }

  const withStops: TripWithStops[] = trips.map((t) => ({
    ...t,
    stops: stopsMap.get(t.id) || [],
  }));

  const now = new Date().toISOString().split('T')[0];
  let current: TripWithStops | null = null;
  const upcoming: TripWithStops[] = [];
  const past: TripWithStops[] = [];

  for (const trip of withStops) {
    if (trip.status === 'active') {
      current = trip;
    } else if (trip.status === 'completed') {
      past.push(trip);
    } else {
      // draft or planned
      upcoming.push(trip);
    }
  }

  // Sort past trips most recent first
  past.sort((a, b) => (b.leaving ?? '').localeCompare(a.leaving ?? ''));

  return { current, upcoming, past };
}

export async function getTripWithStops(tripId: string): Promise<TripWithStops | null> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single();
  if (error) return null;
  const trip = toCamel<TripFull>(data);

  const { data: stopsData } = await supabase
    .from('trip_stops')
    .select('*')
    .eq('trip_id', tripId)
    .order('stop_order', { ascending: true });
  const stops = rowsToCamel<TripStop>(stopsData ?? []);

  return { ...trip, stops };
}

export async function getTripEntries(tripId: string): Promise<TripEntry[]> {
  const { data, error } = await supabase
    .from('trip_entries')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return rowsToCamel<TripEntry>(data ?? []);
}

export async function getTripSavedItems(tripId: string): Promise<TripSavedItem[]> {
  const { data, error } = await supabase
    .from('trip_saved_items')
    .select('*')
    .eq('trip_id', tripId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return rowsToCamel<TripSavedItem>(data ?? []);
}

export async function getTripOverlapMatches(tripId: string, userId: string): Promise<TripOverlapMatch[]> {
  const { data, error } = await supabase
    .from('trip_overlap_matches')
    .select('*')
    .eq('my_trip_id', tripId)
    .eq('my_user_id', userId);
  if (error) throw error;

  // Filter out blocked users
  const { data: blocked } = await supabase
    .from('blocked_users')
    .select('blocked_id')
    .eq('blocker_id', userId);
  const blockedIds = new Set((blocked ?? []).map((b: { blocked_id: string }) => b.blocked_id));

  return rowsToCamel<TripOverlapMatch>(data ?? []).filter(
    (m) => !blockedIds.has(m.theirUserId)
  );
}

// ── Write ────────────────────────────────────────────────────────

export async function createTrip(userId: string, input: CreateTripInput): Promise<string> {
  const firstStop = input.stops[0];
  const destinationName = firstStop?.cityName || '';
  const countryIso2 = firstStop?.countryIso2 || '';
  const cityId = firstStop?.cityId || null;

  const nights = input.arriving && input.leaving
    ? nightsBetween(input.arriving, input.leaving)
    : 0;

  const status = input.arriving && input.leaving ? 'planned' : 'draft';

  const { data, error } = await supabase
    .from('trips')
    .insert({
      user_id: userId,
      destination_city_id: cityId,
      destination_name: destinationName,
      country_iso2: countryIso2,
      title: input.title || destinationName || 'New Journey',
      arriving: input.arriving || null,
      leaving: input.leaving || null,
      nights,
      status,
      privacy_level: input.privacyLevel || 'private',
      matching_opt_in: input.matchingOptIn ?? false,
      travel_style_tags: input.travelStyleTags || [],
      flexible_dates: input.flexibleDates ?? false,
      notes: input.notes || null,
    })
    .select('id')
    .single();
  if (error) throw error;

  const tripId = data.id;

  // Insert stops
  if (input.stops.length > 0) {
    const stopRows = input.stops.map((s, i) => ({
      trip_id: tripId,
      stop_order: i,
      country_iso2: s.countryIso2,
      city_id: s.cityId || null,
      city_name: s.cityName || null,
      start_date: s.startDate || null,
      end_date: s.endDate || null,
    }));
    const { error: stopsError } = await supabase.from('trip_stops').insert(stopRows);
    if (stopsError) throw stopsError;
  }

  // Create matching prefs if opted in
  if (input.matchingOptIn) {
    await supabase.from('trip_matching_preferences').insert({
      trip_id: tripId,
      style_tags: input.travelStyleTags || [],
    });
  }

  return tripId;
}

export async function updateTrip(
  tripId: string,
  updates: Partial<{
    title: string;
    arriving: string | null;
    leaving: string | null;
    status: string;
    privacyLevel: string;
    matchingOptIn: boolean;
    travelStyleTags: string[];
    notes: string | null;
  }>
): Promise<void> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.arriving !== undefined) dbUpdates.arriving = updates.arriving;
  if (updates.leaving !== undefined) dbUpdates.leaving = updates.leaving;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.privacyLevel !== undefined) dbUpdates.privacy_level = updates.privacyLevel;
  if (updates.matchingOptIn !== undefined) dbUpdates.matching_opt_in = updates.matchingOptIn;
  if (updates.travelStyleTags !== undefined) dbUpdates.travel_style_tags = updates.travelStyleTags;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

  if (updates.arriving && updates.leaving) {
    dbUpdates.nights = nightsBetween(updates.arriving, updates.leaving);
  }

  const { error } = await supabase.from('trips').update(dbUpdates).eq('id', tripId);
  if (error) throw error;
}

export async function deleteTrip(tripId: string): Promise<void> {
  const { error } = await supabase.from('trips').delete().eq('id', tripId);
  if (error) throw error;
}

export async function createTripEntry(userId: string, input: CreateEntryInput): Promise<TripEntry> {
  const { data, error } = await supabase
    .from('trip_entries')
    .insert({
      trip_id: input.tripId,
      user_id: userId,
      entry_type: input.entryType,
      title: input.title || null,
      body: input.body || null,
      location_name: input.locationName || null,
      mood_tag: input.moodTag || null,
      visibility: input.visibility || 'private',
      is_shareable_tip: input.isShareableTip ?? false,
    })
    .select()
    .single();
  if (error) throw error;
  return toCamel<TripEntry>(data);
}

export async function deleteTripEntry(entryId: string): Promise<void> {
  const { error } = await supabase.from('trip_entries').delete().eq('id', entryId);
  if (error) throw error;
}

export async function addTripSavedItem(
  tripId: string,
  entityType: string,
  entityId: string,
  category?: string,
  notes?: string
): Promise<void> {
  const { error } = await supabase.from('trip_saved_items').upsert({
    trip_id: tripId,
    entity_type: entityType,
    entity_id: entityId,
    category: category || 'general',
    notes: notes || null,
  });
  if (error) throw error;
}

export async function removeTripSavedItem(tripId: string, entityType: string, entityId: string): Promise<void> {
  const { error } = await supabase
    .from('trip_saved_items')
    .delete()
    .eq('trip_id', tripId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);
  if (error) throw error;
}
```

**Step 2: Commit**

```bash
git add data/trips/tripApi.ts
git commit -m "feat(trips): add Supabase API layer for trips redesign

CRUD for trips, stops, entries, saved items
Grouped trips query (current/upcoming/past)
Overlap matching query with blocked user filtering
All operations use snake_case/camelCase conversion"
```

---

### Task 4: Data Hooks

**Files:**
- Create: `data/trips/useTrips.ts`
- Create: `data/trips/useTripDetail.ts`
- Create: `data/trips/useTripMatches.ts`

**Step 1: Create useTrips hook**

```typescript
// data/trips/useTrips.ts

import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import { getTripsGrouped } from './tripApi';
import type { GroupedTrips } from './types';

const EMPTY: GroupedTrips = { current: null, upcoming: [], past: [] };

export function useTrips() {
  const { userId } = useAuth();
  const { data, loading, error, refetch } = useData(
    () => (userId ? getTripsGrouped(userId) : Promise.resolve(EMPTY)),
    [userId]
  );
  return { trips: data ?? EMPTY, loading, error, refetch };
}
```

**Step 2: Create useTripDetail hook**

```typescript
// data/trips/useTripDetail.ts

import { useData } from '@/hooks/useData';
import { getTripWithStops, getTripEntries, getTripSavedItems } from './tripApi';
import type { TripWithStops, TripEntry, TripSavedItem } from './types';

export function useTripDetail(tripId: string | undefined) {
  const { data: trip, loading: tripLoading, error: tripError, refetch: refetchTrip } = useData(
    () => (tripId ? getTripWithStops(tripId) : Promise.resolve(null)),
    [tripId]
  );

  const { data: entries, loading: entriesLoading, refetch: refetchEntries } = useData(
    () => (tripId ? getTripEntries(tripId) : Promise.resolve([])),
    [tripId]
  );

  const { data: savedItems, loading: savedLoading, refetch: refetchSaved } = useData(
    () => (tripId ? getTripSavedItems(tripId) : Promise.resolve([])),
    [tripId]
  );

  return {
    trip: trip ?? null,
    entries: entries ?? [],
    savedItems: savedItems ?? [],
    loading: tripLoading || entriesLoading || savedLoading,
    error: tripError,
    refetchTrip,
    refetchEntries,
    refetchSaved,
    refetchAll: () => {
      refetchTrip();
      refetchEntries();
      refetchSaved();
    },
  };
}
```

**Step 3: Create useTripMatches hook**

```typescript
// data/trips/useTripMatches.ts

import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import { supabase } from '@/lib/supabase';
import { getTripOverlapMatches } from './tripApi';
import { toCamel } from '@/data/api';
import type { TripOverlapMatch } from './types';
import type { Profile } from '@/data/types';

export interface TripMatchWithProfile extends TripOverlapMatch {
  profile: Profile;
}

export function useTripMatches(tripId: string | undefined, matchingOptIn: boolean) {
  const { userId } = useAuth();

  const { data, loading, error, refetch } = useData(
    async () => {
      if (!tripId || !userId || !matchingOptIn) return [];

      const matches = await getTripOverlapMatches(tripId, userId);
      if (matches.length === 0) return [];

      // Fetch profiles for matched users
      const userIds = [...new Set(matches.map((m) => m.theirUserId))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      const profileMap = new Map<string, Profile>();
      for (const row of profiles ?? []) {
        profileMap.set(row.id, toCamel<Profile>(row));
      }

      return matches
        .filter((m) => profileMap.has(m.theirUserId))
        .map((m) => ({
          ...m,
          profile: profileMap.get(m.theirUserId)!,
        }));
    },
    [tripId, userId, matchingOptIn]
  );

  return { matches: data ?? [], loading, error, refetch };
}
```

**Step 4: Commit**

```bash
git add data/trips/useTrips.ts data/trips/useTripDetail.ts data/trips/useTripMatches.ts
git commit -m "feat(trips): add React hooks for trips data

useTrips: grouped trips (current/upcoming/past) for home screen
useTripDetail: trip + entries + saved items for detail view
useTripMatches: overlap matching with profile resolution"
```

---

### Task 5: Shared Components (SegmentedControl, StyleTagPicker, TripPrivacyCard)

**Files:**
- Create: `components/trips/SegmentedControl.tsx`
- Create: `components/trips/StyleTagPicker.tsx`
- Create: `components/trips/TripPrivacyCard.tsx`

**Step 1: Create SegmentedControl**

A clean, premium segmented control with animated indicator. Three tabs: Journey, Plan, People. Uses PlusJakartaSans-Medium for tab labels, orange underline for active tab, textMuted for inactive. Height 44px, bottom border 1px borderDefault. Active indicator: 2px orange bottom border with smooth transition.

Reference the design system: `colors.orange` for active, `colors.textMuted` for inactive, `fonts.medium` for labels, `spacing.lg` for horizontal padding.

**Step 2: Create StyleTagPicker**

Multi-select tag picker using `TRAVEL_STYLE_OPTIONS` from helpers. Each tag is a pill: neutral border by default, orange fill + orange border when selected. Uses the same pill style as existing tag patterns (radius.sm, fonts.medium fontSize 13). Wrapping row layout with `gap: spacing.sm`.

**Step 3: Create TripPrivacyCard**

Reusable privacy toggle card with icon, title, description, and Switch control. Two variants:
- "Keep trip private" (lock icon, default ON)
- "Traveler matching" (people icon, default OFF, includes explicit consent description)

Uses card style: 1px borderDefault, radius.card, padding spacing.lg. Switch uses orange track/thumb when active.

**Step 4: Commit**

```bash
git add components/trips/SegmentedControl.tsx components/trips/StyleTagPicker.tsx components/trips/TripPrivacyCard.tsx
git commit -m "feat(trips): add shared trip components

SegmentedControl: premium 3-tab control for trip detail
StyleTagPicker: multi-select travel style tag pills
TripPrivacyCard: privacy toggle with consent copy"
```

---

### Task 6: Trip Cards (CurrentTripCard, TripListCard, TripEmptyState)

**Files:**
- Create: `components/trips/CurrentTripCard.tsx`
- Create: `components/trips/TripListCard.tsx`
- Create: `components/trips/TripEmptyState.tsx`

**Step 1: Create CurrentTripCard**

Premium hero card for the active trip. Structure:
- Full-width image (200px height) with LinearGradient overlay (transparent → rgba(0,0,0,0.65))
- Overlay content at bottom:
  - Status pill: "Active · Day 9" in green pill
  - Trip title in white, fonts.semiBold, fontSize 20
  - Destination + nights in white, fonts.regular, fontSize 14
- Below image: 3 quick-action pill buttons ("Journal", "Plan", "People") in a row
  - Each pill: borderWidth 1, borderColor borderDefault, radius.pill, paddingH 16, paddingV 8
  - Icon + label, orange text
- Press state: opacity 0.9, scale 0.98
- borderRadius: radius.card, overflow hidden

Use expo-image for the city hero image, expo-linear-gradient for the overlay. Get hero image from the first stop's city if available.

**Step 2: Create TripListCard**

Compact card for upcoming/past trips. Structure:
- Row layout: flag emoji (28px) + text content + status badge
- Text content: trip title (semiBold 16) + date range (caption) + stops summary (captionSmall)
- Stops summary: "Chiang Mai" for single stop, "Hanoi → Hoi An" for multi-stop
- Status badge: uses STATUS_COLORS from helpers
- Card style: 1px borderDefault, radius.card, padding spacing.lg
- Press state: opacity 0.9, scale 0.98

**Step 3: Create TripEmptyState**

Premium empty state. No cheesy airplane icon. Instead:
- InstrumentSerif heading: "Your journeys"
- Body text: "Plan a trip, journal along the way, and meet travelers on your route."
- Orange CTA button: "Start planning"
- Clean, generous spacing (xxl vertical padding)

**Step 4: Commit**

```bash
git add components/trips/CurrentTripCard.tsx components/trips/TripListCard.tsx components/trips/TripEmptyState.tsx
git commit -m "feat(trips): add trip card components for home screen

CurrentTripCard: premium hero card with gradient overlay and quick actions
TripListCard: compact card with multi-stop support
TripEmptyState: editorial empty state with serif typography"
```

---

### Task 7: Journey Timeline Components

**Files:**
- Create: `components/trips/JourneyTimeline.tsx`
- Create: `components/trips/JourneyEntryCard.tsx`
- Create: `components/trips/AddEntrySheet.tsx`

**Step 1: Create JourneyEntryCard**

Single entry in the timeline. Structure varies by entry_type:

**Standard entry (note, arrival, departure, stay, tip, highlight):**
- Card: 1px borderDefault, radius.card, padding spacing.lg
- Top row: entry icon (from ENTRY_ICONS) + title (or entry type label if no title), semiBold 15
- Body: 2 lines max, regular 14, textPrimary
- Bottom row: pin icon + location name (textMuted 13) + time (textMuted 13, right-aligned)
- If tip entry and is_shareable_tip: small orange "Shareable" badge

**Comfort check entry:**
- Compact card: mood color background (from MOOD_COLORS .bg)
- Single row: mood icon (colored circle) + "Feeling [mood]" text + location + time
- No title/body fields shown

**Step 2: Create JourneyTimeline**

Takes entries array, groups by date using `groupEntriesByDate()`. Renders:
- Date header (semiBold 14, textSecondary, uppercase) for each group
- JourneyEntryCard for each entry within the group
- Entries are in reverse chronological order (newest first)
- If no entries: "Your journey starts here. Add your first entry." with illustration

**Step 3: Create AddEntrySheet**

Bottom sheet (Modal with slide-from-bottom animation) for adding new entries:
- Entry type selector: horizontal scroll of pill buttons, each with icon + label
  - Default selection: "note"
  - When "comfort_check" selected, show mood selector instead of text inputs
- Title input (optional): single line, placeholder "Give it a title"
- Body input: multiline, placeholder "What's on your mind?"
- Location input (optional): single line, placeholder "Where are you?", pin icon
- Mood selector (only for comfort_check): 4 mood pills using MOOD_COLORS
- Privacy reassurance: 🔒 icon + "Private — only you can see this" (textMuted)
- Save button: orange, full width

The sheet takes `tripId` and `onSave` callback. Calls `createTripEntry()` on save, then calls `onSave` to trigger refetch in parent.

**Step 4: Commit**

```bash
git add components/trips/JourneyTimeline.tsx components/trips/JourneyEntryCard.tsx components/trips/AddEntrySheet.tsx
git commit -m "feat(trips): add journey timeline and entry components

JourneyEntryCard: renders entries with type-specific styling
JourneyTimeline: groups entries by date, reverse chronological
AddEntrySheet: bottom sheet for creating new journal entries"
```

---

### Task 8: Plan Tab & People Tab Components

**Files:**
- Create: `components/trips/PlanTab.tsx`
- Create: `components/trips/PeopleTab.tsx`

**Step 1: Create PlanTab**

Takes `tripId`, `savedItems`, `trip` (for notes + country). Renders:
- "Saved places" section header
  - List of saved place cards (reuse PlaceCard pattern from existing [id].tsx — extract to shared component)
  - If no saved items: "Save places from Explore to add them to your trip"
  - "+ Add a place" dashed button → navigates to city explore page
- "Notes" section
  - Editable TextInput pre-filled with trip.notes
  - Auto-saves on blur via `updateTrip(tripId, { notes })`
  - Character count: X/500
- "Emergency numbers" section
  - Same emergency card pattern from current [id].tsx
  - Uses `getEmergencyNumbers(trip.countryIso2)`

**Step 2: Create PeopleTab**

Takes `tripId`, `matchingOptIn`, `onToggleMatching` callback. Three states:

**State 1: Matching OFF**
- Lock icon + "Traveler matching is off" heading
- Explanation text about what matching does
- Explicit consent copy: what IS shared vs what is NOT shared
- "Turn on matching" button (orange)
- On press: calls `onToggleMatching()` which updates trip matching_opt_in

**State 2: Matching ON, no matches**
- "No travelers on your route yet" heading
- Reassurance: "We'll let you know when someone appears"

**State 3: Matching ON, has matches**
- "Travelers on your route" section header
- List of TravelerCard components (reuse from existing `components/TravelerCard.tsx`)
- Each card shows overlap context: "You'll both be in [city], [dateRange]"
- Connect button follows existing connection flow
- Footer reassurance: "Only showing travelers who also opted in"

Uses `useTripMatches` hook.

**Step 3: Commit**

```bash
git add components/trips/PlanTab.tsx components/trips/PeopleTab.tsx
git commit -m "feat(trips): add Plan and People tab components

PlanTab: saved places, editable notes, emergency numbers
PeopleTab: opt-in matching with explicit consent, traveler cards"
```

---

### Task 9: Trips Home Screen (Rewrite index.tsx)

**Files:**
- Modify: `app/(tabs)/trips/index.tsx` (full rewrite)

**Step 1: Rewrite the Trips Home screen**

Replace the entire content of `index.tsx` with the new implementation:

- Uses `useTrips()` hook to get `{ current, upcoming, past }`
- Uses `useFocusEffect` for refetch on tab focus
- PostHog: `trips_screen_viewed` event

**Layout:**
- `AppScreen` wrapper
- `AppHeader` with title "Trips" (no subtitle — let the content speak), orange "+" add button
- ScrollView:
  - If `current`: `<CurrentTripCard trip={current} />` — taps navigate to `/trips/{id}`
  - If `upcoming.length > 0`: Section header "UPCOMING" (muted, uppercase, semiBold 12) + `TripListCard` for each
  - If `past.length > 0`: "PAST TRIPS" section with show/hide toggle
    - Default collapsed. "Show past trips" text button with chevron
    - When expanded: `TripListCard` for each past trip
  - If everything empty: `<TripEmptyState onPress={() => router.push('/trips/new')} />`

**Navigation:**
- CurrentTripCard tap → `/trips/{id}`
- CurrentTripCard quick actions → `/trips/{id}` with tab param (Journey/Plan/People)
- TripListCard tap → `/trips/{id}`
- "+" button → `/trips/new`
- Empty state CTA → `/trips/new`

**Step 2: Commit**

```bash
git add app/(tabs)/trips/index.tsx
git commit -m "feat(trips): rewrite Trips Home with grouped sections

Current trip hero card, upcoming list, collapsible past section
Premium empty state, pull-to-refresh on focus"
```

---

### Task 10: Create Trip Screen (Rewrite new.tsx)

**Files:**
- Modify: `app/(tabs)/trips/new.tsx` (full rewrite)

**Step 1: Rewrite the Create Trip screen**

Replace entire content with 2-step progressive disclosure flow:

**Step 1 area (always visible):**
- Nav bar: back arrow + "New Journey" title
- "Where are you headed?" label
- Search input using existing `searchDestinations` API
- Selected stops list (flag + city name + remove button). Max 5 stops.
- "+ Add another stop" button (appears after first stop selected)
- "When?" label + date picker row (reuse existing date picker pattern)
- "I'm flexible with dates" toggle
- Trip name input (optional, with auto-default from first stop)
- "Continue" button

**Step 2 area (revealed on Continue press):**
- Smooth ScrollView scroll to step 2
- "How do you like to travel?" + `<StyleTagPicker />`
- `<TripPrivacyCard variant="privacy" />` — keep trip private toggle
- `<TripPrivacyCard variant="matching" />` — traveler matching toggle
- "Save journey" button (orange, full width)
- "Skip for now" text button (saves with defaults)

**State management:**
- `stops: { countryIso2, cityId?, cityName, searchResult }[]`
- `arriving: Date | null`, `leaving: Date | null`
- `flexibleDates: boolean`
- `title: string`
- `step: 1 | 2`
- `styleTags: string[]`
- `isPrivate: boolean` (default true)
- `matchingOptIn: boolean` (default false)
- `saving: boolean`

**Save logic:**
- Calls `createTrip(userId, { ... })` from tripApi
- On success: `router.back()`
- PostHog events: `create_trip_started`, `create_trip_completed`

**Step 2: Commit**

```bash
git add app/(tabs)/trips/new.tsx
git commit -m "feat(trips): rewrite Create Trip with multi-stop and privacy

2-step progressive disclosure flow
Multi-stop destination support (up to 5)
Travel style tags, privacy controls, matching opt-in
Flexible dates support, auto-generated trip names"
```

---

### Task 11: Trip Detail Screen (Rewrite [id].tsx)

**Files:**
- Modify: `app/(tabs)/trips/[id].tsx` (full rewrite)

**Step 1: Rewrite the Trip Detail screen**

Replace entire content with the new Journey/Plan/People segmented view:

**Header section (always visible):**
- Back button + overflow menu (edit trip, delete trip)
- Hero image (city heroImageUrl from first stop, or fallback to neutral gradient)
- Trip title (serif font, white on gradient overlay)
- Flag + destination summary + nights badge
- Date range
- Status + day counter (if active)
- `<SegmentedControl tabs={['Journey', 'Plan', 'People']} />`

**Tab content (switches based on selectedTab):**
- Journey: `<JourneyTimeline entries={entries} />` + floating "+" button → `<AddEntrySheet />`
- Plan: `<PlanTab tripId={id} savedItems={savedItems} trip={trip} />`
- People: `<PeopleTab tripId={id} matchingOptIn={trip.matchingOptIn} onToggleMatching={handleToggle} />`

**Data:**
- Uses `useTripDetail(id)` hook
- Uses `useFocusEffect` for refetch
- PostHog: `trip_detail_viewed` with trip_id and tab name

**Overflow menu (3-dot icon):**
- "Edit trip" → future (not implemented, just design placeholder)
- "Delete trip" → confirmation alert → `deleteTrip(id)` → `router.back()`

**Tab param support:**
- Accept optional `tab` search param: `?tab=journey|plan|people`
- Used by CurrentTripCard quick actions to deep-link to specific tab

**Step 2: Commit**

```bash
git add app/(tabs)/trips/[id].tsx
git commit -m "feat(trips): rewrite Trip Detail with Journey/Plan/People tabs

Segmented control with three sub-sections
Journey timeline with add entry sheet
Plan tab with saved places and editable notes
People tab with opt-in matching and traveler cards
Delete trip with confirmation, overflow menu"
```

---

### Task 12: Navigation & Integration

**Files:**
- Modify: `app/(tabs)/trips/_layout.tsx` (verify stack config)
- Verify: `app/(tabs)/_layout.tsx` (tab config unchanged)

**Step 1: Verify trips layout**

Ensure `_layout.tsx` has `<Stack screenOptions={{ headerShown: false }} />` — this should already be correct.

**Step 2: Test navigation end-to-end**

Verify these navigation paths work:
- Tab bar → Trips Home (index.tsx)
- Trips Home → "+" → Create Trip (new.tsx) → back to Trips Home
- Trips Home → trip card → Trip Detail ([id].tsx) → back to Trips Home
- Trip Detail → segmented control switches between Journey/Plan/People
- CurrentTripCard quick actions → Trip Detail with correct tab
- Trip Detail → delete → back to Trips Home

**Step 3: Commit (if any changes needed)**

```bash
git add app/(tabs)/trips/_layout.tsx
git commit -m "chore(trips): verify navigation layout configuration"
```

---

### Task 13: Polish & Visual QA

**Files:**
- All trip component files

**Step 1: Visual consistency check**

Ensure all components use:
- Design system tokens (no hardcoded colors/fonts/spacing)
- Consistent press states (opacity 0.9, scale 0.98) on all tappable elements
- Proper safe area insets where needed
- expo-image for all images (not React Native Image)
- Consistent card styling (1px borderDefault, radius.card)

**Step 2: Empty states check**

Verify all empty states look premium:
- Trips Home empty state
- Journey timeline empty state (no entries)
- Plan tab empty state (no saved items)
- People tab states (matching off, no matches, has matches)

**Step 3: Loading states check**

Verify LoadingScreen shows during initial data fetch for:
- Trips Home
- Trip Detail

**Step 4: Commit**

```bash
git add -A app/(tabs)/trips/ components/trips/
git commit -m "polish(trips): visual consistency and empty states

Consistent design tokens, press states, loading states
Premium empty states for all sections"
```

---

### Task 14: Final Integration Test

**Step 1: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/trips/|data/trips/)' | head -30
```

Expected: No errors in trip-related files. Pre-existing errors in `scripts/` and `supabase/functions/` are acceptable.

**Step 2: Test with Expo**

```bash
npx expo start
```

Verify on device/simulator:
- Trips tab loads with grouped trips (from seed data or empty state)
- Create trip flow works end-to-end
- Trip detail shows all three tabs
- Add entry sheet opens and saves
- No crashes, no layout breaks

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat(trips): complete Trips redesign

Journey timeline, light itinerary planning, safe traveler matching
Women-first safety features: comfort checks, privacy controls, consent
Supabase schema with RLS, seed data, overlap matching view
Premium editorial design consistent with Explore and Travelers"
```

---

## Summary of Deliverables

| Deliverable | Status |
|-------------|--------|
| Trips Home with grouped sections | Task 9 |
| Create Trip flow (multi-stop, privacy) | Task 10 |
| Trip Detail with Journey/Plan/People | Task 11 |
| Journey timeline with entries | Task 7 |
| Comfort check system | Task 7 (AddEntrySheet) |
| Plan tab (saved places, notes, emergency) | Task 8 |
| People tab (opt-in matching) | Task 8 |
| Privacy + consent moments | Tasks 5, 8, 10 |
| Supabase schema + RLS | Task 1 |
| Seed data | Task 1 |
| TypeScript types | Task 2 |
| API layer | Task 3 |
| Data hooks | Task 4 |
| Navigation integration | Task 12 |
| Visual polish | Task 13 |

## Dependencies Between Tasks

```
Task 1 (Schema) → Task 2 (Types) → Task 3 (API) → Task 4 (Hooks)
                                                          ↓
Task 5 (Shared components) ────────────────────→ Task 6 (Cards)
                                                          ↓
Task 7 (Journey components) ──→ Task 8 (Plan + People) → Task 9 (Home)
                                                          ↓
                                                    Task 10 (Create)
                                                          ↓
                                                    Task 11 (Detail)
                                                          ↓
                                                    Task 12 (Nav)
                                                          ↓
                                                    Task 13 (Polish)
                                                          ↓
                                                    Task 14 (Final)
```
