# Trips Tab Reactivation — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reactivate the trips tab with a simplified, intuitive flow — no FABs, no save-for-later bucket, notes as timeline blocks.

**Architecture:** Replace the placeholder tab root with a real trip list screen (useTrips → grouped list). Simplify trip detail to day-card layout. Clean up day timeline by removing FABs and adding a single "+" row. Add NoteBlock component for inline notes with link previews. Replace SaveSheet with lightweight AddToTripSheet for cross-tab place adding.

**Tech Stack:** React Native, Expo Router, Supabase (existing itinerary_blocks table with blockType='note'), React Query via useData hook.

---

### Task 1: Wire up trips tab root with real trip list

**Files:**
- Modify: `app/(tabs)/trips/index.tsx`

**What to do:**
Replace the "coming soon" placeholder with a real trip list screen. Use `useTrips()` hook to fetch grouped trips (current/upcoming/past). Show `TripsEmptyStateV2` when no trips exist, otherwise render `TripListCard` for each trip grouped by section.

**Step 1: Rewrite `trips/index.tsx`**

Replace the entire file with:

```tsx
import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import AvatarButton from '@/components/AvatarButton';
import TripListCard from '@/components/trips/TripListCard';
import { TripsEmptyStateV2 } from '@/components/trips/TripsEmptyStateV2';
import { useTrips } from '@/data/trips/useTrips';
import { deleteTrip } from '@/data/trips/tripApi';
import { colors, fonts, spacing } from '@/constants/design';
import type { TripWithStops } from '@/data/trips/types';

type SectionItem =
  | { type: 'section-header'; key: string; title: string }
  | { type: 'trip-card'; key: string; trip: TripWithStops };

export default function TripsScreen() {
  const router = useRouter();
  const { trips, loading, refetch } = useTrips();

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const hasTrips = !!(trips.current || trips.upcoming.length > 0 || trips.past.length > 0);

  const handleCreateTrip = () => router.push('/(tabs)/trips/new');

  const handleDeleteTrip = async (tripId: string) => {
    await deleteTrip(tripId);
    refetch();
  };

  // Build flat list of section headers + trip cards
  const items: SectionItem[] = [];
  if (trips.current) {
    items.push({ type: 'section-header', key: 'h-current', title: 'Current trip' });
    items.push({ type: 'trip-card', key: trips.current.id, trip: trips.current });
  }
  if (trips.upcoming.length > 0) {
    items.push({ type: 'section-header', key: 'h-upcoming', title: 'Upcoming' });
    for (const t of trips.upcoming) {
      items.push({ type: 'trip-card', key: t.id, trip: t });
    }
  }
  if (trips.past.length > 0) {
    items.push({ type: 'section-header', key: 'h-past', title: 'Past' });
    for (const t of trips.past) {
      items.push({ type: 'trip-card', key: t.id, trip: t });
    }
  }

  const renderItem = ({ item }: { item: SectionItem }) => {
    if (item.type === 'section-header') {
      return <Text style={styles.sectionTitle}>{item.title}</Text>;
    }
    return <TripListCard trip={item.trip} onDelete={handleDeleteTrip} />;
  };

  return (
    <AppScreen>
      <NavigationHeader title="Trips" rightActions={<AvatarButton />} />
      {!hasTrips && !loading ? (
        <TripsEmptyStateV2 onCreateTrip={handleCreateTrip} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            hasTrips ? (
              <Pressable
                style={({ pressed }) => [styles.newTripRow, pressed && { opacity: 0.7 }]}
                onPress={handleCreateTrip}
              >
                <Text style={styles.newTripText}>Plan a new trip</Text>
              </Pressable>
            ) : null
          }
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  newTripRow: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  newTripText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.orange,
  },
});
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -20`

**Step 3: Commit**

```bash
git add app/\(tabs\)/trips/index.tsx
git commit -m "feat(trips): wire up tab root with real trip list and empty state"
```

---

### Task 2: Simplify trip detail to day-card layout

**Files:**
- Modify: `app/(tabs)/trips/[id]/index.tsx`

**What to do:**
Rebuild the trip detail screen around day cards. Remove PlanningBoard, SavedItemsSection, JournalSection, DaySelector with inline timeline, and the sticky bottom "Add to itinerary" bar. Keep: TripHeader, TripStatsRow (simplified), buddies row, day rows (TripDayRow), stop headers for multi-city, transport cards. The screen becomes a simple scrollable list of days.

Key changes:
- Remove imports: PlanningBoard, DaySelector, DayTimelineCard, SavedItemsSection, JournalSection, SmartSearchSheet
- Remove state: enrichedPlaces, selectedDayId, searchSheetVisible, building
- Remove from ListItem union: 'planning-board', 'day-selector', 'day-timeline-card', 'saved-items-section', 'journal-section'
- Remove the enrichedPlaces useEffect
- Remove handleBuildItinerary, handleRemoveSavedPlace, handleSavedPlacePress, handleAddSavedItem, handleJournalViewAll, handleEntryPress
- Remove the sticky bottom bar and SmartSearchSheet from JSX
- Always show day rows (not just when hasBlocks is false) — day cards are the primary content now
- Remove `accommodationCount` and `accommodationTotal` from stats — simplify to days/cities/stops
- Remove the accommodation section as a separate list item

**Step 1: Rewrite trip detail**

Strip down to: header → stats → buddies → day rows (with stop headers for multi-city) → "Plan a new trip" footer if no days.

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -20`

**Step 3: Commit**

```bash
git add app/\(tabs\)/trips/\[id\]/index.tsx
git commit -m "feat(trips): simplify trip detail to day-card layout"
```

---

### Task 3: Clean up day timeline — remove FABs and clutter

**Files:**
- Modify: `app/(tabs)/trips/day/[dayId].tsx`

**What to do:**
Remove both FABs, ConnectorWithAdd circles between items, dashed "Add to this day" button, SuggestionCard, TripDaySuggestions catalogue, ComfortCheckPrompt. Replace with a single clean "Add a stop" row at the bottom of the timeline that opens SmartSearchSheet. Keep: day header, accommodation banner, timeline blocks (DayTimelineCard), SmartSearchSheet.

Key removals:
- `ConnectorWithAdd` component
- `QuickAddFAB` import and usage
- `SuggestionCard` import and usage
- `TripDaySuggestions` import and usage
- `ComfortCheckPrompt` import and usage
- `AddStopSheet` import and usage (replaced by SmartSearchSheet)
- `PlacePreviewSheet` import and usage
- `AddToDaysSheet` import and usage
- The FAB JSX and styles
- `showAddStop`, `insertAfterIndex`, `previewPlace`, `addDaysPlace`, `addDaysVisible` state
- Suggestion-related handlers

Keep only:
- SmartSearchSheet for the "Add a stop" action
- A single clean Pressable row at the end of the timeline to trigger it
- Empty state with a single "Add your first stop" button

**Step 1: Rewrite day timeline**

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -20`

**Step 3: Commit**

```bash
git add app/\(tabs\)/trips/day/\[dayId\].tsx
git commit -m "feat(trips): clean up day timeline, remove FABs and clutter"
```

---

### Task 4: Build NoteBlock component

**Files:**
- Create: `components/trips/NoteBlock.tsx`
- Modify: `app/(tabs)/trips/day/[dayId].tsx` (integrate NoteBlock into timeline)

**What to do:**
Create a NoteBlock component that renders inline in the day timeline for blocks with `blockType === 'note'`. The block's `titleOverride` holds the note text, and `meta.url` can hold a link.

NoteBlock displays:
- Plain text: clean card with subtle left orange border accent, text content
- With URL: rich link preview card (title, image if available, domain name)

For link preview, use a simple approach: store URL in block meta, and render a card with the URL domain + title from meta fields. Full OG fetching can come later — for now, just show the URL prettily.

Also add "Add a note" option to the day screen's add row. When tapped, show a simple TextInput inline (or a small bottom sheet) where the user types their note. On submit, create a block with `blockType: 'note'` and `titleOverride: text`.

**Step 1: Create NoteBlock component**

```tsx
// components/trips/NoteBlock.tsx
```

Card with:
- Left border accent (3px orange)
- Note icon (document-text-outline)
- Text content
- If URL detected: show domain + link indicator

**Step 2: Add note creation to day timeline**

Modify the "Add a stop" row to become two options: "Add a place" and "Add a note". For "Add a note", show a TextInput that appears inline. On submit, call `createBlock()` with `blockType: 'note'`.

**Step 3: Integrate NoteBlock into timeline rendering**

In the day timeline, when rendering blocks, check `block.blockType === 'note'` and render NoteBlock instead of DayTimelineCard.

**Step 4: Verify it compiles**

**Step 5: Commit**

```bash
git add components/trips/NoteBlock.tsx app/\(tabs\)/trips/day/\[dayId\].tsx
git commit -m "feat(trips): add NoteBlock component with link preview support"
```

---

### Task 5: Build AddToTripSheet for cross-tab place adding

**Files:**
- Create: `components/trips/AddToTripSheet.tsx`
- Modify: `app/(tabs)/discover/place-detail/[id].tsx` (replace SaveSheet trigger)

**What to do:**
Create a lightweight bottom sheet that replaces SaveSheet for adding places to trips from the discover tab. Flow:
1. One active/upcoming trip → skip trip picker, show day picker directly
2. Multiple trips → show trip list, then day picker
3. No trips → show "Create a trip first" prompt

The day picker is a horizontal scroll of day pills. Tap one → create block → toast → close.

Uses existing hooks: `useTrips()` for trip list, `useTripItinerary()` for days, `createBlock()` for adding.

**Step 1: Create AddToTripSheet**

Modal bottom sheet with:
- Trip list (if multiple)
- Day pill picker (horizontal scroll)
- Creates block on day select
- Toast confirmation

**Step 2: Wire into place detail screen**

Replace the SaveSheet trigger button with an "Add to trip" button that opens AddToTripSheet.

**Step 3: Verify it compiles**

**Step 4: Commit**

```bash
git add components/trips/AddToTripSheet.tsx app/\(tabs\)/discover/place-detail/\[id\].tsx
git commit -m "feat(trips): add AddToTripSheet for direct place-to-trip flow"
```

---

### Task 6: Delete dead code

**Files to delete:**
- `components/trips/QuickAddFAB.tsx`
- `components/trips/PlanningBoard.tsx`
- `components/trips/SavedPlaceCard.tsx`
- `components/trips/JourneyEntryCard.tsx`
- `components/trips/JourneyTimeline.tsx`
- `components/trips/TripOverview/JournalSection.tsx`
- `components/trips/TripOverview/SavedItemsSection.tsx`
- `components/trips/SuggestionCard.tsx`
- `components/trips/TripDaySuggestions.tsx`
- `components/trips/ComfortCheckPrompt.tsx`
- `components/trips/Import/ImportFromCollections.tsx`
- `app/(tabs)/trips/[id]/journal.tsx`

**What to do:**
Delete all files listed above. Then grep for any remaining imports of these deleted files and remove those import lines. Run tsc to verify nothing breaks.

**Step 1: Delete files**
**Step 2: Clean up dangling imports**
**Step 3: Verify it compiles**
**Step 4: Commit**

```bash
git add -A
git commit -m "chore(trips): delete dead code — FABs, planning board, journal, suggestions"
```

---

### Task 7: Final type check and polish

**Files:**
- Various (any remaining issues)

**What to do:**
Run full type check, fix any remaining issues. Test the complete flow mentally: tab root → trip list → trip detail → day timeline → add place → add note. Verify all navigation paths work.

**Step 1: Type check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | head -30`

**Step 2: Fix any issues found**

**Step 3: Final commit**

```bash
git add -A
git commit -m "fix(trips): resolve remaining type errors from trips tab reactivation"
```
