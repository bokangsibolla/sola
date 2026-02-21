# Trip Itinerary Feature — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a premium day-by-day itinerary planner that replaces the current trip detail screen, with structured timeline, dynamic ordering, contextual tags, and a client-side AI suggestion engine.

**Architecture:** Additive Supabase tables (`trip_days`, `itinerary_blocks`, `itinerary_block_tags`, `itinerary_suggestions`) + 4 nullable columns on `trips`. Single `place_id` FK to the unified `places` table. Client-side suggestion engine analyzes blocks for time conflicts, gap detection, missing meals, pace mismatches, and proximity reordering. The existing `[id].tsx` trip detail screen is rewritten as a Trip Home with day cards; a new `day/[dayId].tsx` screen renders the full timeline.

**Tech Stack:** React Native (Expo Router), Supabase (Postgres), React Query (TanStack), expo-linear-gradient, @gorhom/bottom-sheet, Ionicons

---

## Task 1: SQL Migration — New Tables + Trips Columns

**Files:**
- Create: `supabase/migrations/20260222_itinerary_tables.sql`

**Step 1: Write the migration**

```sql
-- ═══════════════════════════════════════════════════════
-- Trip Itinerary Tables (additive, non-breaking)
-- ═══════════════════════════════════════════════════════

-- 1. Add itinerary columns to trips (all nullable)
ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS budget_total numeric,
  ADD COLUMN IF NOT EXISTS pace text;  -- 'relaxed' | 'balanced' | 'packed'

-- 2. trip_days
CREATE TABLE IF NOT EXISTS trip_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_index integer NOT NULL,
  date date,
  title text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (trip_id, day_index)
);

CREATE INDEX idx_trip_days_trip ON trip_days(trip_id);

ALTER TABLE trip_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trip_days_owner" ON trip_days
  FOR ALL USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- 3. itinerary_blocks
CREATE TABLE IF NOT EXISTS itinerary_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  trip_day_id uuid NOT NULL REFERENCES trip_days(id) ON DELETE CASCADE,
  block_type text NOT NULL DEFAULT 'place',
    -- 'place' | 'accommodation' | 'activity' | 'transport'
    -- 'meal' | 'free_time' | 'note' | 'safety_check'
  title_override text,
  start_time time,
  end_time time,
  duration_min integer,
  order_index integer NOT NULL DEFAULT 0,
  place_id uuid REFERENCES places(id) ON DELETE SET NULL,
  location_lat numeric,
  location_lng numeric,
  cost_estimate numeric,
  booking_url text,
  status text NOT NULL DEFAULT 'planned',
    -- 'planned' | 'booked' | 'done' | 'skipped'
  meta jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_blocks_day_order ON itinerary_blocks(trip_day_id, order_index);
CREATE INDEX idx_blocks_day_time ON itinerary_blocks(trip_day_id, start_time);
CREATE INDEX idx_blocks_trip ON itinerary_blocks(trip_id);

ALTER TABLE itinerary_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blocks_owner" ON itinerary_blocks
  FOR ALL USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- 4. itinerary_block_tags
CREATE TABLE IF NOT EXISTS itinerary_block_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid NOT NULL REFERENCES itinerary_blocks(id) ON DELETE CASCADE,
  tag_type text NOT NULL,  -- 'vibe' | 'accessibility' | 'women_note' | 'logistics'
  label text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_block_tags_block ON itinerary_block_tags(block_id);

ALTER TABLE itinerary_block_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "block_tags_owner" ON itinerary_block_tags
  FOR ALL USING (
    block_id IN (
      SELECT ib.id FROM itinerary_blocks ib
      JOIN trips t ON ib.trip_id = t.id
      WHERE t.user_id = auth.uid()
    )
  );

-- 5. itinerary_suggestions
CREATE TABLE IF NOT EXISTS itinerary_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  trip_day_id uuid REFERENCES trip_days(id) ON DELETE CASCADE,
  block_id uuid REFERENCES itinerary_blocks(id) ON DELETE CASCADE,
  suggestion_type text NOT NULL,
    -- 'reorder' | 'swap' | 'insert' | 'remove' | 'time_shift'
  reason text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
    -- 'pending' | 'applied' | 'dismissed'
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_suggestions_trip ON itinerary_suggestions(trip_id);
CREATE INDEX idx_suggestions_day ON itinerary_suggestions(trip_day_id);

ALTER TABLE itinerary_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suggestions_owner" ON itinerary_suggestions
  FOR ALL USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260222_itinerary_tables.sql
git commit -m "feat(db): add itinerary tables — trip_days, itinerary_blocks, block_tags, suggestions"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `data/trips/itineraryTypes.ts`

**Step 1: Write types**

```typescript
// data/trips/itineraryTypes.ts

export type BlockType =
  | 'place'
  | 'accommodation'
  | 'activity'
  | 'transport'
  | 'meal'
  | 'free_time'
  | 'note'
  | 'safety_check';

export type BlockStatus = 'planned' | 'booked' | 'done' | 'skipped';
export type TripPace = 'relaxed' | 'balanced' | 'packed';
export type BlockTagType = 'vibe' | 'accessibility' | 'women_note' | 'logistics';
export type SuggestionType = 'reorder' | 'swap' | 'insert' | 'remove' | 'time_shift';
export type SuggestionStatus = 'pending' | 'applied' | 'dismissed';

export interface TripDay {
  id: string;
  tripId: string;
  dayIndex: number;
  date: string | null;
  title: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryBlock {
  id: string;
  tripId: string;
  tripDayId: string;
  blockType: BlockType;
  titleOverride: string | null;
  startTime: string | null;   // "HH:MM:SS" from Postgres time
  endTime: string | null;
  durationMin: number | null;
  orderIndex: number;
  placeId: string | null;
  locationLat: number | null;
  locationLng: number | null;
  costEstimate: number | null;
  bookingUrl: string | null;
  status: BlockStatus;
  meta: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface BlockTag {
  id: string;
  blockId: string;
  tagType: BlockTagType;
  label: string;
  createdAt: string;
}

export interface ItinerarySuggestion {
  id: string;
  tripId: string;
  tripDayId: string | null;
  blockId: string | null;
  suggestionType: SuggestionType;
  reason: string;
  payload: Record<string, unknown>;
  status: SuggestionStatus;
  createdAt: string;
}

// Enriched block with tags and optional place data
export interface ItineraryBlockWithTags extends ItineraryBlock {
  tags: BlockTag[];
  place?: {
    name: string;
    placeType: string;
    address: string | null;
    cityAreaId: string | null;
  } | null;
}

// Full day with ordered blocks
export interface TripDayWithBlocks extends TripDay {
  blocks: ItineraryBlockWithTags[];
}

// Trip itinerary overview (for Trip Home)
export interface TripItinerary {
  days: TripDayWithBlocks[];
  totalPlaces: number;
  totalCost: number;
}

// Input types for mutations
export interface CreateBlockInput {
  tripId: string;
  tripDayId: string;
  blockType: BlockType;
  titleOverride?: string;
  startTime?: string;
  endTime?: string;
  durationMin?: number;
  orderIndex: number;
  placeId?: string;
  locationLat?: number;
  locationLng?: number;
  costEstimate?: number;
  bookingUrl?: string;
  meta?: Record<string, unknown>;
}

export interface UpdateBlockInput {
  titleOverride?: string;
  startTime?: string | null;
  endTime?: string | null;
  durationMin?: number | null;
  orderIndex?: number;
  status?: BlockStatus;
  costEstimate?: number | null;
  bookingUrl?: string | null;
  meta?: Record<string, unknown>;
}

// Suggestion payload shapes
export interface ReorderPayload {
  moves: { blockId: string; newOrderIndex: number }[];
}

export interface InsertPayload {
  afterBlockId: string | null;
  block: Omit<CreateBlockInput, 'tripId' | 'tripDayId' | 'orderIndex'>;
}

export interface TimeShiftPayload {
  blockId: string;
  newStartTime: string;
  newEndTime?: string;
}

export interface RemovePayload {
  blockId: string;
  reason: string;
}
```

**Step 2: Add TripPace to TripFull in `data/trips/types.ts`**

Add to the `TripFull` interface (after `notes` field on line 93):

```typescript
  timezone: string | null;
  currency: string | null;
  budgetTotal: number | null;
  pace: string | null;
```

**Step 3: Commit**

```bash
git add data/trips/itineraryTypes.ts data/trips/types.ts
git commit -m "feat(types): add itinerary type definitions — blocks, days, tags, suggestions"
```

---

## Task 3: Itinerary API — CRUD Functions

**Files:**
- Create: `data/trips/itineraryApi.ts`

**Step 1: Write API functions**

The file should contain these functions (all following the existing `tripApi.ts` pattern — use `toCamel`/`rowsToCamel` from `@/data/api`, Supabase client from `@/lib/supabase`):

**Read functions:**
- `getTripDays(tripId)` → fetches `trip_days` ordered by `day_index`, returns `TripDay[]`
- `getDayWithBlocks(dayId)` → fetches a single `trip_days` row + its `itinerary_blocks` (ordered by `start_time NULLS LAST, order_index`) + their `itinerary_block_tags` + place data via join. Returns `TripDayWithBlocks`
- `getTripItinerary(tripId)` → fetches all days + all blocks + all tags for a trip. Assembles `TripItinerary` with computed `totalPlaces` and `totalCost`
- `getDaySuggestions(dayId)` → fetches `itinerary_suggestions` where `trip_day_id = dayId` and `status = 'pending'`, ordered by `created_at desc`. Returns `ItinerarySuggestion[]`

**Write functions:**
- `createTripDay(tripId, dayIndex, date?, title?)` → inserts into `trip_days`, returns `TripDay`
- `createBlock(input: CreateBlockInput)` → inserts into `itinerary_blocks`, returns `ItineraryBlock`
- `updateBlock(blockId, updates: UpdateBlockInput)` → updates `itinerary_blocks`, maps camelCase keys to snake_case
- `deleteBlock(blockId)` → deletes from `itinerary_blocks`
- `reorderBlocks(dayId, orderedBlockIds: string[])` → batch-updates `order_index` for all blocks in a day
- `addBlockTag(blockId, tagType, label)` → inserts into `itinerary_block_tags`
- `removeBlockTag(tagId)` → deletes from `itinerary_block_tags`
- `createSuggestion(tripId, dayId, type, reason, payload)` → inserts into `itinerary_suggestions`
- `applySuggestion(suggestionId)` → sets `status = 'applied'`
- `dismissSuggestion(suggestionId)` → sets `status = 'dismissed'`
- `generateDaysFromTrip(tripId)` → reads trip `arriving`/`leaving` dates, generates `trip_days` rows with correct `day_index` and `date` values. Returns `TripDay[]`. Does nothing if days already exist.

**Key implementation notes:**
- For `getDayWithBlocks`: fetch blocks with `.select('*, places(name, place_type, address, city_area_id)')` to get place data in one query, then fetch tags separately with `itinerary_block_tags` where `block_id IN blocksIds`
- Block ordering: sort blocks by `start_time` (nulls last), then by `order_index`
- `toCamel`/`rowsToCamel` from `@/data/api` for all DB row → TS mapping
- All snake_case → camelCase mapping in write functions via manual object construction (same pattern as existing `updateTrip`)

**Step 2: Commit**

```bash
git add data/trips/itineraryApi.ts
git commit -m "feat(data): add itinerary API — CRUD for days, blocks, tags, suggestions"
```

---

## Task 4: React Query Hooks

**Files:**
- Create: `data/trips/useItinerary.ts`

**Step 1: Write hooks**

Using the existing `useData` hook pattern from `@/hooks/useData`:

```typescript
// data/trips/useItinerary.ts
import { useData } from '@/hooks/useData';
import {
  getTripItinerary,
  getDayWithBlocks,
  getDaySuggestions,
} from './itineraryApi';

export function useTripItinerary(tripId: string | undefined) {
  const {
    data: itinerary,
    loading,
    error,
    refetch,
  } = useData(
    () => (tripId ? getTripItinerary(tripId) : Promise.resolve(null)),
    ['tripItinerary', tripId],
  );

  return { itinerary, loading, error, refetch };
}

export function useDayTimeline(dayId: string | undefined) {
  const {
    data: day,
    loading,
    error,
    refetch,
  } = useData(
    () => (dayId ? getDayWithBlocks(dayId) : Promise.resolve(null)),
    ['dayTimeline', dayId],
  );

  return { day, loading, error, refetch };
}

export function useDaySuggestions(dayId: string | undefined) {
  const {
    data: suggestions,
    loading,
    error,
    refetch,
  } = useData(
    () => (dayId ? getDaySuggestions(dayId) : Promise.resolve([])),
    ['daySuggestions', dayId],
  );

  return { suggestions: suggestions ?? [], loading, error, refetch };
}
```

**Step 2: Commit**

```bash
git add data/trips/useItinerary.ts
git commit -m "feat(hooks): add useItinerary hooks — trip overview, day timeline, suggestions"
```

---

## Task 5: Suggestion Engine

**Files:**
- Create: `data/trips/suggestionEngine.ts`

**Step 1: Write the engine**

The suggestion engine analyzes a day's blocks and produces `ItinerarySuggestion` candidates. It runs client-side.

**Functions to implement:**

1. `analyzeDaySuggestions(day: TripDayWithBlocks, pace: TripPace | null): SuggestionCandidate[]`
   - Main entry point. Calls all analyzers below, returns merged results.

2. `detectTimeConflicts(blocks: ItineraryBlockWithTags[]): SuggestionCandidate[]`
   - If two blocks have `start_time` and their times overlap (block A end > block B start), produce a `time_shift` suggestion.
   - Payload: shift the later block to start after the earlier one ends.

3. `detectLongGaps(blocks: ItineraryBlockWithTags[]): SuggestionCandidate[]`
   - If gap between consecutive timed blocks is > 180 minutes, suggest inserting a `free_time` or `meal` block.
   - Payload: `insert` type with `afterBlockId` set to the earlier block.

4. `detectMissingMeals(blocks: ItineraryBlockWithTags[]): SuggestionCandidate[]`
   - If the day has > 3 timed blocks spanning > 5 hours and no `meal` block type, suggest adding lunch.
   - Only suggest if blocks span the 11:00–14:00 window.

5. `detectPaceMismatch(blocks: ItineraryBlockWithTags[], pace: TripPace | null): SuggestionCandidate[]`
   - `relaxed`: > 4 non-note blocks → suggest removing the lowest-priority one
   - `packed`: < 3 non-note blocks and the day has a date set → suggest "This day has room for more stops"
   - `balanced`: no suggestions

6. `detectProximityReorder(blocks: ItineraryBlockWithTags[]): SuggestionCandidate[]`
   - Only runs if ≥ 3 blocks have `locationLat`/`locationLng`.
   - Uses Haversine distance to compute total travel distance.
   - If a simple nearest-neighbor reorder reduces total distance by > 20%, suggest a `reorder`.
   - Payload: `ReorderPayload` with new order.

**Helper:**
- `haversineKm(lat1, lng1, lat2, lng2): number` — standard Haversine formula
- `parseTime(timeStr: string): number` — parses "HH:MM:SS" to minutes since midnight
- `timeToStr(minutes: number): string` — converts minutes back to "HH:MM:SS"

**Type:**
```typescript
interface SuggestionCandidate {
  tripDayId: string;
  blockId: string | null;
  suggestionType: SuggestionType;
  reason: string;
  payload: Record<string, unknown>;
}
```

The `syncSuggestions(tripId, dayId, candidates)` function:
- Fetches existing pending suggestions for the day
- Dismisses any that are no longer relevant (not in new candidates)
- Creates new ones that don't already exist (match by `suggestion_type` + `block_id`)

**Step 2: Commit**

```bash
git add data/trips/suggestionEngine.ts
git commit -m "feat(engine): add client-side suggestion engine — conflicts, gaps, meals, pace, proximity"
```

---

## Task 6: TripMetaPills Component

**Files:**
- Create: `components/trips/TripMetaPills.tsx`

**Step 1: Write component**

A horizontal row of info pills showing trip metadata. Each pill has an Ionicons icon + text.

**Props:**
```typescript
interface TripMetaPillsProps {
  dateRange: string;      // "23–26 Jul"
  dayCount: number;       // 4
  placeCount: number;     // 4
  budget: number | null;  // 1500
  currency: string;       // "USD"
}
```

**Design:**
- Horizontal `ScrollView` with `showsHorizontalScrollIndicator={false}`
- Each pill: `View` with `flexDirection: 'row'`, `alignItems: 'center'`, `gap: spacing.xs`
- Background: `colors.neutralFill`, `borderRadius: radius.full`, `paddingHorizontal: spacing.md`, `paddingVertical: spacing.xs`
- Icon: Ionicons, size 14, color `colors.textSecondary`
- Text: `fonts.medium`, fontSize 13, color `colors.textSecondary`
- Pills: calendar-outline (dates), layers-outline (days), location-outline (places), wallet-outline (budget)
- Budget pill only renders if `budget` is non-null

**Step 2: Commit**

```bash
git add components/trips/TripMetaPills.tsx
git commit -m "feat(ui): add TripMetaPills — date, days, places, budget info pills"
```

---

## Task 7: DayOverviewCard Component

**Files:**
- Create: `components/trips/DayOverviewCard.tsx`

**Step 1: Write component**

A card representing one day in the Trip Home list.

**Props:**
```typescript
interface DayOverviewCardProps {
  day: TripDayWithBlocks;
  onPress: () => void;
}
```

**Design (reference the screenshot):**
- `Pressable` with `pressedState` from design tokens
- Left accent bar: 3px wide, `colors.orange`, full height, `borderRadius: radius.xs`
- Content area: `paddingVertical: spacing.md`, `paddingHorizontal: spacing.lg`
- Header row: "Day {dayIndex}" in `fonts.semiBold` 15px `colors.textPrimary` + date in `fonts.regular` 13px `colors.textMuted`
- Day title (if set): `fonts.medium` 14px `colors.textSecondary`, marginTop `spacing.xs`
- Block preview chips: horizontal row (max 4), each chip showing block title (truncated), separated by small dots
  - Chip: `backgroundColor: colors.neutralFill`, `borderRadius: radius.full`, `paddingHorizontal: spacing.sm`, `paddingVertical: 2`
  - Text: `fonts.regular` 12px `colors.textSecondary`
- Bottom border: 1px `colors.borderSubtle` (not on last item — parent handles this)
- Right arrow: Ionicons `chevron-forward` size 16 `colors.textMuted`

**Step 2: Commit**

```bash
git add components/trips/DayOverviewCard.tsx
git commit -m "feat(ui): add DayOverviewCard — day summary with block preview chips"
```

---

## Task 8: ItineraryBlock Component

**Files:**
- Create: `components/trips/ItineraryBlock.tsx`

**Step 1: Write component**

A single row in the Day Timeline. This is the core visual element.

**Props:**
```typescript
interface ItineraryBlockProps {
  block: ItineraryBlockWithTags;
  isFirst: boolean;
  isLast: boolean;
  onPress: () => void;
}
```

**Design (from reference screenshot):**
- Horizontal layout with 3 columns:
  - **Left (time column):** width 56px, aligned right
    - If `start_time`: display formatted time ("08:00") in `fonts.medium` 13px `colors.textMuted`
    - If no `start_time`: display bullet dot (6px circle, `colors.borderDefault`)
  - **Center (timeline connector):** width 24px
    - Vertical line: 1px wide, `colors.borderDefault`, from top to bottom
    - Circle node: 10px diameter, centered on the line
      - Color varies by `block_type`: place→`colors.orange`, accommodation→`colors.blueSoft`, activity→`colors.greenSoft`, meal→`colors.warning`, transport→`colors.textMuted`, free_time/note→`colors.borderDefault`, safety_check→`colors.emergency`
    - First block: line starts from circle center (no line above)
    - Last block: line ends at circle center (no line below)
  - **Right (content):** flex 1
    - Title: `fonts.semiBold` 15px `colors.textPrimary` — uses `titleOverride ?? block.place?.name ?? blockTypeLabel(blockType)`
    - Subtitle: `fonts.regular` 13px `colors.textMuted` — place type or block type label
    - Tags row: horizontal chips from `block.tags` — same style as DayOverviewCard chips
    - Status badge (if not 'planned'): small pill with status color

**Block type labels map:**
```typescript
const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  place: 'Place',
  accommodation: 'Stay',
  activity: 'Activity',
  transport: 'Getting there',
  meal: 'Meal',
  free_time: 'Free time',
  note: 'Note',
  safety_check: 'Safety check-in',
};
```

**Block type icons map (Ionicons):**
```typescript
const BLOCK_TYPE_ICONS: Record<BlockType, string> = {
  place: 'location',
  accommodation: 'bed',
  activity: 'bicycle',
  transport: 'car',
  meal: 'restaurant',
  free_time: 'sunny',
  note: 'document-text',
  safety_check: 'shield-checkmark',
};
```

**Step 2: Commit**

```bash
git add components/trips/ItineraryBlock.tsx
git commit -m "feat(ui): add ItineraryBlock — timeline stop row with connector, time, content"
```

---

## Task 9: SuggestionCard Component

**Files:**
- Create: `components/trips/SuggestionCard.tsx`

**Step 1: Write component**

Sticky suggestion card at the bottom of the Day Timeline.

**Props:**
```typescript
interface SuggestionCardProps {
  suggestion: ItinerarySuggestion;
  onApply: () => void;
  onDismiss: () => void;
}
```

**Design (from reference screenshot — the dark card at bottom):**
- Container: `backgroundColor: colors.textPrimary` (#0E0E0E), `borderRadius: radius.cardLg`, `padding: spacing.lg`
- Position: at the bottom of the day timeline scroll, NOT sticky/floating (just the last item)
- Left icon: Ionicons `sparkles` size 18, `colors.orange`
- Reason text: `fonts.regular` 14px, color `#FFFFFF`
- Action row: two buttons
  - "Apply": `backgroundColor: colors.orange`, `borderRadius: radius.button`, `paddingHorizontal: spacing.lg`, `paddingVertical: spacing.sm`
    - Text: `fonts.semiBold` 14px, color `#FFFFFF`
  - "Dismiss": no background, just text
    - Text: `fonts.medium` 14px, color `colors.textMuted`
- If no pending suggestions, render nothing (return null)

**Step 2: Commit**

```bash
git add components/trips/SuggestionCard.tsx
git commit -m "feat(ui): add SuggestionCard — AI suggestion with apply/dismiss actions"
```

---

## Task 10: AddStopSheet Component

**Files:**
- Create: `components/trips/AddStopSheet.tsx`

**Step 1: Write component**

Bottom sheet for adding a new itinerary block to a day.

**Props:**
```typescript
interface AddStopSheetProps {
  visible: boolean;
  tripId: string;
  dayId: string;
  insertAfterIndex: number;  // order_index to insert after
  destinationCityId: string | null;
  onClose: () => void;
  onAdded: () => void;  // callback to refetch
}
```

**Design:**
- Use `Modal` with `animationType="slide"` and `presentationStyle="pageSheet"` (same pattern as other sheets in the app)
- Header: "Add stop" title + close X button
- Block type picker: horizontal row of selectable chips
  - Types: place, activity, accommodation, meal, transport, note, free time
  - Each chip: icon + label, `colors.neutralFill` bg, `colors.orange` bg when selected
- Search field (shown for place/activity/accommodation/meal types):
  - `TextInput` with `borderWidth: 1`, `borderColor: colors.borderDefault`, `borderRadius: radius.input`
  - Placeholder: "Search places..."
  - Queries `places` table filtered by `city_id = destinationCityId` and `place_type` matching selected block type
  - Results as a `FlatList` of simple rows (name + place type + address)
  - Tap a result → fills in `place_id`, `titleOverride`
- Title field (shown for transport/note/free_time/safety_check):
  - `TextInput` for custom title
- Time picker (optional):
  - Two fields: start time, end time (simple text inputs with HH:MM format)
  - Or skip (use order_index only)
- "Add to day" button:
  - `backgroundColor: colors.orange`, full width, `borderRadius: radius.button`
  - `onPress`: calls `createBlock()` with correct `orderIndex = insertAfterIndex + 1`, then `onAdded()`

**Place search implementation:**
```typescript
const searchPlaces = async (query: string, cityId: string, placeType?: string) => {
  let q = supabase
    .from('places')
    .select('id, name, place_type, address')
    .eq('is_active', true)
    .ilike('name', `%${query}%`)
    .limit(10);
  if (cityId) q = q.eq('city_id', cityId);
  if (placeType) q = q.eq('place_type', placeType);
  const { data } = await q;
  return rowsToCamel(data ?? []);
};
```

**Step 2: Commit**

```bash
git add components/trips/AddStopSheet.tsx
git commit -m "feat(ui): add AddStopSheet — bottom sheet with type picker, place search, time input"
```

---

## Task 11: Day Timeline Screen

**Files:**
- Create: `app/(tabs)/trips/day/[dayId].tsx`

**Step 1: Create the _layout for the day directory**

Create `app/(tabs)/trips/day/_layout.tsx`:
```typescript
import { Stack } from 'expo-router';
export default function DayLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

**Step 2: Write the Day Timeline screen**

This is the full day view with the vertical timeline.

**Structure:**
- `NavigationHeader` with title "Day {dayIndex}" and parentTitle as trip title
- `ScrollView` containing:
  - Day header: date + title (if set)
  - List of `ItineraryBlock` components with "+" insert buttons between each
  - `SuggestionCard` at the bottom (if pending suggestions exist)
- FAB: "+" button (bottom right) to add a stop at the end

**Data flow:**
```typescript
const { dayId } = useLocalSearchParams<{ dayId: string }>();
const { day, loading, error, refetch } = useDayTimeline(dayId);
const { suggestions, refetch: refetchSuggestions } = useDaySuggestions(dayId);
```

**Add stop flow:**
- "+" between blocks: opens `AddStopSheet` with `insertAfterIndex` = block's `orderIndex`
- FAB: opens `AddStopSheet` with `insertAfterIndex` = last block's `orderIndex` (or 0 if empty)

**Apply suggestion flow:**
1. Call `applySuggestion(suggestion.id)`
2. Execute the suggestion payload:
   - `time_shift`: call `updateBlock(payload.blockId, { startTime: payload.newStartTime })`
   - `reorder`: call `reorderBlocks(dayId, payload.moves)`
   - `insert`: call `createBlock(payload.block)`
   - `remove`: call `deleteBlock(payload.blockId)`
3. Call `refetch()` + `refetchSuggestions()`
4. Re-run suggestion engine: `syncSuggestions(tripId, dayId, analyzeDaySuggestions(day, pace))`

**Step 3: Commit**

```bash
git add app/(tabs)/trips/day/_layout.tsx app/(tabs)/trips/day/\[dayId\].tsx
git commit -m "feat(screen): add Day Timeline — vertical timeline with blocks, suggestions, add-stop"
```

---

## Task 12: Trip Home Screen — Rewrite [id].tsx

**Files:**
- Modify: `app/(tabs)/trips/[id].tsx` (full rewrite)

**Step 1: Rewrite the screen**

The new Trip Home replaces Journey/Plan/People tabs with a day-by-day itinerary overview.

**Structure:**
- `NavigationHeader` with title "Trip" and overflow menu (delete, edit)
- Hero section (keep existing hero with gradient overlay — reuse hero pattern)
  - Trip title + status pill
  - `TripMetaPills` row below the hero
- "ITINERARY" section header
- If no days exist yet:
  - "Generate itinerary" button that calls `generateDaysFromTrip(tripId)` and refetches
- If days exist:
  - `FlatList` of `DayOverviewCard` components
  - Each card `onPress` → `router.push(\`/(tabs)/trips/day/${day.id}\`)`
- Keep the overflow menu with delete trip

**Data flow:**
```typescript
const { id } = useLocalSearchParams<{ id: string }>();
const { trip, loading: tripLoading, error: tripError, refetchTrip } = /* keep existing trip fetch */;
const { itinerary, loading: itinLoading, refetch: refetchItinerary } = useTripItinerary(id);
```

**Key: Preserve existing data/features:**
- Keep `useTripDetail` for the trip metadata (hero, title, status)
- Add `useTripItinerary` for the day/block data
- The hero section stays nearly identical
- The segmented control + Journey/Plan/People tabs are removed
- The FAB changes from "add entry" to "add day" (if needed)

**"Generate itinerary" logic:**
When a trip has `arriving`/`leaving` dates but no `trip_days`, show a CTA button that calls `generateDaysFromTrip(tripId)`. This auto-creates day rows.

**Step 2: Commit**

```bash
git add app/(tabs)/trips/\[id\].tsx
git commit -m "feat(screen): rewrite Trip Home — day-by-day itinerary overview replacing old tabs"
```

---

## Task 13: Seed Data Migration

**Files:**
- Create: `supabase/migrations/20260222_seed_itinerary.sql`

**Step 1: Write seed data**

Create demo itinerary data attached to the existing seed trip (Aisha's Chiang Mai trip). Look up the trip ID from the seed data.

```sql
-- Seed itinerary for Aisha's Chiang Mai trip
-- NOTE: Uses the trip created in 20260205_seed_trips.sql

DO $$
DECLARE
  v_trip_id uuid;
  v_day1_id uuid;
  v_day2_id uuid;
  v_day3_id uuid;
  v_block1 uuid;
  v_block2 uuid;
  v_block3 uuid;
  v_block4 uuid;
  v_block5 uuid;
  v_block6 uuid;
BEGIN
  -- Find Aisha's active Chiang Mai trip
  SELECT id INTO v_trip_id FROM trips
    WHERE destination_name = 'Chiang Mai' AND status = 'active'
    LIMIT 1;

  IF v_trip_id IS NULL THEN
    RAISE NOTICE 'No Chiang Mai trip found, skipping itinerary seed';
    RETURN;
  END IF;

  -- Update trip with itinerary columns
  UPDATE trips SET
    timezone = 'Asia/Bangkok',
    currency = 'THB',
    budget_total = 45000,
    pace = 'balanced'
  WHERE id = v_trip_id;

  -- Day 1
  v_day1_id := gen_random_uuid();
  INSERT INTO trip_days (id, trip_id, day_index, date, title)
  VALUES (v_day1_id, v_trip_id, 1, CURRENT_DATE, 'Old City & Temples');

  -- Day 2
  v_day2_id := gen_random_uuid();
  INSERT INTO trip_days (id, trip_id, day_index, date, title)
  VALUES (v_day2_id, v_trip_id, 2, CURRENT_DATE + 1, 'Doi Suthep & Night Market');

  -- Day 3
  v_day3_id := gen_random_uuid();
  INSERT INTO trip_days (id, trip_id, day_index, date, title)
  VALUES (v_day3_id, v_trip_id, 3, CURRENT_DATE + 2, 'Café Hopping & Nimmanhaemin');

  -- Day 1 blocks
  v_block1 := gen_random_uuid();
  INSERT INTO itinerary_blocks (id, trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_block1, v_trip_id, v_day1_id, 'meal', 'Breakfast at Rustic & Blue', '08:00', 60, 1, 'planned');

  v_block2 := gen_random_uuid();
  INSERT INTO itinerary_blocks (id, trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_block2, v_trip_id, v_day1_id, 'place', 'Wat Chedi Luang', '09:30', 90, 2, 'planned');

  v_block3 := gen_random_uuid();
  INSERT INTO itinerary_blocks (id, trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_block3, v_trip_id, v_day1_id, 'free_time', 'Wander the Old City', '11:30', 60, 3, 'planned');

  v_block4 := gen_random_uuid();
  INSERT INTO itinerary_blocks (id, trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_block4, v_trip_id, v_day1_id, 'meal', 'Lunch at Khao Soi Mae Sai', '12:30', 60, 4, 'planned');

  INSERT INTO itinerary_blocks (trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_trip_id, v_day1_id, 'activity', 'Thai Cooking Class', '15:00', 180, 5, 'booked');

  INSERT INTO itinerary_blocks (trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_trip_id, v_day1_id, 'safety_check', 'Evening check-in', '20:00', null, 6, 'planned');

  -- Day 2 blocks
  INSERT INTO itinerary_blocks (trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_trip_id, v_day2_id, 'transport', 'Songthaew to Doi Suthep', '08:30', 30, 1, 'planned');

  v_block5 := gen_random_uuid();
  INSERT INTO itinerary_blocks (id, trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_block5, v_trip_id, v_day2_id, 'place', 'Wat Phra That Doi Suthep', '09:00', 120, 2, 'planned');

  INSERT INTO itinerary_blocks (trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_trip_id, v_day2_id, 'meal', 'Mountain-view lunch', '12:00', 60, 3, 'planned');

  INSERT INTO itinerary_blocks (trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_trip_id, v_day2_id, 'free_time', 'Rest at hotel', '14:00', 120, 4, 'planned');

  INSERT INTO itinerary_blocks (trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_trip_id, v_day2_id, 'activity', 'Sunday Night Market', '18:00', 180, 5, 'planned');

  -- Day 3 blocks
  INSERT INTO itinerary_blocks (trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_trip_id, v_day3_id, 'meal', 'Coffee at Ristr8to Lab', '09:00', 45, 1, 'planned');

  v_block6 := gen_random_uuid();
  INSERT INTO itinerary_blocks (id, trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_block6, v_trip_id, v_day3_id, 'place', 'MAIIAM Contemporary Art Museum', '10:30', 90, 2, 'planned');

  INSERT INTO itinerary_blocks (trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_trip_id, v_day3_id, 'meal', 'Lunch at Dash!', '12:30', 60, 3, 'planned');

  INSERT INTO itinerary_blocks (trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_trip_id, v_day3_id, 'activity', 'Nimmanhaemin Walk & Shopping', '14:00', 120, 4, 'planned');

  INSERT INTO itinerary_blocks (trip_id, trip_day_id, block_type, title_override, start_time, duration_min, order_index, status)
  VALUES (v_trip_id, v_day3_id, 'note', 'Pack for early checkout tomorrow', null, null, 5, 'planned');

  -- Block tags
  INSERT INTO itinerary_block_tags (block_id, tag_type, label) VALUES
    (v_block2, 'vibe', 'Peaceful'),
    (v_block2, 'women_note', 'Dress modestly — shoulders and knees covered'),
    (v_block3, 'vibe', 'Walkable'),
    (v_block4, 'logistics', 'Cash only'),
    (v_block5, 'vibe', 'Panoramic views'),
    (v_block5, 'logistics', 'Wear comfortable shoes — 306 steps'),
    (v_block6, 'vibe', 'Contemporary');

  -- Seed one suggestion
  INSERT INTO itinerary_suggestions (trip_id, trip_day_id, suggestion_type, reason, payload)
  VALUES (
    v_trip_id,
    v_day1_id,
    'time_shift',
    'Wat Chedi Luang is less crowded before 9 AM — consider starting at 08:30 instead?',
    jsonb_build_object(
      'blockId', v_block2::text,
      'newStartTime', '08:30:00',
      'newEndTime', '10:00:00'
    )
  );
END $$;
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260222_seed_itinerary.sql
git commit -m "feat(seed): add demo itinerary — 3-day Chiang Mai trip with blocks, tags, suggestion"
```

---

## Task 14: Type Check & Final Verification

**Step 1: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -30
```

Fix any type errors in the new files.

**Step 2: Verify file structure**

Confirm all new files exist:
```
data/trips/itineraryTypes.ts
data/trips/itineraryApi.ts
data/trips/useItinerary.ts
data/trips/suggestionEngine.ts
components/trips/TripMetaPills.tsx
components/trips/DayOverviewCard.tsx
components/trips/ItineraryBlock.tsx
components/trips/SuggestionCard.tsx
components/trips/AddStopSheet.tsx
app/(tabs)/trips/day/_layout.tsx
app/(tabs)/trips/day/[dayId].tsx
app/(tabs)/trips/[id].tsx (modified)
supabase/migrations/20260222_itinerary_tables.sql
supabase/migrations/20260222_seed_itinerary.sql
```

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: fix type errors from itinerary feature"
```
