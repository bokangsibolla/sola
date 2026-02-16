# Simplified Onboarding + Passive Tracking Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the 8-screen onboarding with a 4-screen flow (welcome → create-account → profile → youre-in), add passive event tracking via `user_events` table with client-side batching, and build tag affinity scoring for personalisation.

**Architecture:** Minimal onboarding captures only name, country, and birthday. All preference inference happens through passive behavioral tracking — events are queued in-memory and batch-flushed to a `user_events` Supabase table every 10s. A Postgres function scores tag affinities from events into `user_tag_affinity`. Personalisation queries join affinity scores with `destination_tags` to rank content, falling back to global popularity for cold-start users.

**Tech Stack:** React Native (Expo), Supabase (Postgres, RLS), React Query, PostHog (existing analytics).

---

## Task 1: Database Migration — Add `date_of_birth` to profiles

**Files:**
- Create: `supabase/migrations/20260216_add_date_of_birth.sql`
- Modify: `data/types.ts:284-311` (add `dateOfBirth` to Profile interface)

**Step 1: Write migration**

```sql
-- Add date_of_birth column for demographics/BI reporting
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth date;
```

**Step 2: Update Profile TypeScript interface**

In `data/types.ts`, add `dateOfBirth: string | null;` to the Profile interface (after line 304, before `nationality`).

**Step 3: Commit**

```bash
git add supabase/migrations/20260216_add_date_of_birth.sql data/types.ts
git commit -m "feat: add date_of_birth column to profiles"
```

---

## Task 2: Database Migration — Create `user_events` table

**Files:**
- Create: `supabase/migrations/20260216_user_events.sql`

**Step 1: Write migration**

```sql
-- Passive behavioral event tracking
CREATE TABLE user_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type  text NOT NULL,
  entity_type text,
  entity_id   uuid,
  metadata    jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- Index for user-specific queries (dashboard, affinity computation)
CREATE INDEX idx_user_events_user_id ON user_events(user_id);
-- Index for user + event type filtering
CREATE INDEX idx_user_events_user_type ON user_events(user_id, event_type);
-- Index for time-range queries (cleanup, time decay)
CREATE INDEX idx_user_events_created_at ON user_events(created_at);
-- Index for entity-level aggregation
CREATE INDEX idx_user_events_entity ON user_events(entity_type, entity_id);

-- RLS: users insert and read only their own events
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own events"
  ON user_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own events"
  ON user_events FOR SELECT
  USING (auth.uid() = user_id);
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260216_user_events.sql
git commit -m "feat: add user_events table for passive behavioral tracking"
```

---

## Task 3: Database Migration — Create `user_tag_affinity` table + scoring function

**Files:**
- Create: `supabase/migrations/20260216_user_tag_affinity.sql`

**Step 1: Write migration**

```sql
-- Tag affinity scores derived from user behavior
CREATE TABLE user_tag_affinity (
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_id     uuid NOT NULL REFERENCES destination_tags(id) ON DELETE CASCADE,
  score      numeric(6,2) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, tag_id)
);

CREATE INDEX idx_user_tag_affinity_user ON user_tag_affinity(user_id);
CREATE INDEX idx_user_tag_affinity_score ON user_tag_affinity(user_id, score DESC);

ALTER TABLE user_tag_affinity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own affinity"
  ON user_tag_affinity FOR SELECT
  USING (auth.uid() = user_id);

-- Track which events have been processed for affinity scoring
ALTER TABLE user_events ADD COLUMN IF NOT EXISTS processed_for_affinity boolean DEFAULT false;
CREATE INDEX idx_user_events_unprocessed ON user_events(processed_for_affinity) WHERE processed_for_affinity = false;

-- Scoring function: processes unprocessed events → updates affinity scores
CREATE OR REPLACE FUNCTION compute_tag_affinity()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  batch_size int := 1000;
  decay_factor numeric := 0.95;
BEGIN
  -- Step 1: Process unprocessed events and update affinity scores
  WITH event_batch AS (
    SELECT id, user_id, event_type, entity_type, entity_id
    FROM user_events
    WHERE processed_for_affinity = false
    ORDER BY created_at
    LIMIT batch_size
  ),
  event_weights AS (
    SELECT
      eb.id AS event_id,
      eb.user_id,
      dt.id AS tag_id,
      CASE eb.event_type
        WHEN 'viewed_country' THEN 1
        WHEN 'viewed_city' THEN 1
        WHEN 'viewed_place' THEN 2
        WHEN 'saved_place' THEN 5
        WHEN 'opened_collection' THEN 2
        WHEN 'created_trip' THEN 10
        WHEN 'added_place_to_trip' THEN 5
        WHEN 'unsaved_place' THEN -3
        ELSE 0
      END AS weight
    FROM event_batch eb
    JOIN destination_tags dt ON (
      (eb.entity_type = 'country' AND dt.entity_type = 'country' AND dt.entity_id = eb.entity_id)
      OR (eb.entity_type = 'city' AND dt.entity_type = 'city' AND dt.entity_id = eb.entity_id)
      -- For places, look up tags on the place's city
      OR (eb.entity_type = 'place' AND dt.entity_type = 'city' AND dt.entity_id = (
        SELECT city_id FROM places WHERE id = eb.entity_id LIMIT 1
      ))
    )
    WHERE eb.event_type IN (
      'viewed_country', 'viewed_city', 'viewed_place',
      'saved_place', 'unsaved_place', 'opened_collection',
      'created_trip', 'added_place_to_trip'
    )
  ),
  aggregated AS (
    SELECT user_id, tag_id, SUM(weight) AS total_weight
    FROM event_weights
    GROUP BY user_id, tag_id
  )
  INSERT INTO user_tag_affinity (user_id, tag_id, score, updated_at)
  SELECT user_id, tag_id, total_weight, now()
  FROM aggregated
  ON CONFLICT (user_id, tag_id)
  DO UPDATE SET
    score = user_tag_affinity.score + EXCLUDED.score,
    updated_at = now();

  -- Step 2: Mark events as processed
  UPDATE user_events
  SET processed_for_affinity = true
  WHERE id IN (
    SELECT id FROM user_events
    WHERE processed_for_affinity = false
    ORDER BY created_at
    LIMIT batch_size
  );

  -- Step 3: Apply daily time decay (only if not already decayed today)
  -- Decay all scores by 0.95, remove scores below 0.5
  UPDATE user_tag_affinity
  SET score = score * decay_factor,
      updated_at = now()
  WHERE updated_at < now() - interval '23 hours';

  DELETE FROM user_tag_affinity WHERE score < 0.5;
END;
$$;

-- Personalised city recommendations function
CREATE OR REPLACE FUNCTION get_personalized_cities(p_user_id uuid, p_limit int DEFAULT 10)
RETURNS TABLE (
  city_id uuid,
  city_name text,
  country_name text,
  affinity_score numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT DISTINCT
    c.id AS city_id,
    c.name AS city_name,
    co.name AS country_name,
    MAX(uta.score) AS affinity_score
  FROM cities c
  JOIN countries co ON co.id = c.country_id
  JOIN destination_tags dt ON dt.entity_type = 'city' AND dt.entity_id = c.id
  JOIN user_tag_affinity uta ON uta.tag_id = dt.id AND uta.user_id = p_user_id
  WHERE uta.score > 2
  GROUP BY c.id, c.name, co.name
  ORDER BY affinity_score DESC
  LIMIT p_limit;
$$;
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260216_user_tag_affinity.sql
git commit -m "feat: add user_tag_affinity table and scoring function"
```

---

## Task 4: Build EventTracker client module

**Files:**
- Create: `data/events/eventTracker.ts`
- Create: `data/events/types.ts`

**Step 1: Create types file**

Create `data/events/types.ts`:

```typescript
export type EventType =
  | 'viewed_country'
  | 'viewed_city'
  | 'viewed_place'
  | 'saved_place'
  | 'unsaved_place'
  | 'opened_collection'
  | 'searched'
  | 'opened_thread'
  | 'replied_thread'
  | 'created_trip'
  | 'added_place_to_trip'
  | 'viewed_traveler';

export type EntityType =
  | 'country'
  | 'city'
  | 'place'
  | 'collection'
  | 'thread'
  | 'trip'
  | 'profile';

export interface UserEvent {
  user_id: string;
  event_type: EventType;
  entity_type: EntityType | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
```

**Step 2: Create EventTracker class**

Create `data/events/eventTracker.ts`:

```typescript
import { AppState, type AppStateStatus } from 'react-native';
import { supabase } from '@/lib/supabase';
import type { EventType, EntityType, UserEvent } from './types';

const FLUSH_INTERVAL_MS = 10_000;
const MAX_QUEUE_SIZE = 20;

class EventTracker {
  private queue: UserEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private userId: string | null = null;
  private appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

  /** Call once after auth to start tracking */
  init(userId: string) {
    this.userId = userId;
    this.startFlushTimer();
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  /** Call on sign-out to stop tracking and flush remaining */
  destroy() {
    this.flush();
    this.userId = null;
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }

  /** Track a user event */
  track(
    eventType: EventType,
    entityType?: EntityType | null,
    entityId?: string | null,
    metadata?: Record<string, unknown>,
  ) {
    if (!this.userId) return;

    this.queue.push({
      user_id: this.userId,
      event_type: eventType,
      entity_type: entityType ?? null,
      entity_id: entityId ?? null,
      metadata: metadata ?? {},
      created_at: new Date().toISOString(),
    });

    if (this.queue.length >= MAX_QUEUE_SIZE) {
      this.flush();
    }
  }

  /** Flush queued events to Supabase */
  flush() {
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0);

    // Fire and forget — don't block the UI
    supabase
      .from('user_events')
      .insert(batch)
      .then(({ error }) => {
        if (error) {
          // Put events back at front of queue for retry
          this.queue.unshift(...batch);
        }
      });
  }

  private startFlushTimer() {
    if (this.flushTimer) return;
    this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);
  }

  private handleAppStateChange = (state: AppStateStatus) => {
    if (state === 'background' || state === 'inactive') {
      this.flush();
    }
  };
}

/** Singleton instance — import and use everywhere */
export const eventTracker = new EventTracker();
```

**Step 3: Commit**

```bash
git add data/events/types.ts data/events/eventTracker.ts
git commit -m "feat: add EventTracker with in-memory queue and batch flush"
```

---

## Task 5: Simplify onboarding layout and navigation

**Files:**
- Modify: `app/(onboarding)/_layout.tsx` — remove screens: intent, trip-details, day-style, stay-preference
- Modify: `state/onboardingStore.ts` — add `dateOfBirth` field, simplify defaults
- Modify: `lib/onboardingConfig.ts` — simplify default config and screen order
- Modify: `hooks/useOnboardingNavigation.ts` — simplify screen type

**Step 1: Update layout**

In `app/(onboarding)/_layout.tsx`, remove the Stack.Screen entries for `intent`, `trip-details`, `day-style`, `stay-preference`. Keep: welcome, login, create-account, profile, youre-in.

**Step 2: Add `dateOfBirth` to onboardingStore**

In `state/onboardingStore.ts`:
- Add `dateOfBirth: string;` to `OnboardingData` interface
- Add `dateOfBirth: '',` to `defaults`
- Keep all existing fields (don't remove — existing users may have data in AsyncStorage)

**Step 3: Simplify onboarding config defaults**

In `lib/onboardingConfig.ts`:
- Update `DEFAULT_CONFIG` to only include: first_name, country, date_of_birth, photo (all on profile screen)
- Update `SCREEN_ORDER` to: `['profile', 'youre-in']`

**Step 4: Simplify navigation hook screen type**

In `hooks/useOnboardingNavigation.ts`:
- Keep the type as-is (old screen names won't break anything, just unused)
- The navigation will still work because `getNextScreen` uses `screensToShow` array

**Step 5: Commit**

```bash
git add app/(onboarding)/_layout.tsx state/onboardingStore.ts lib/onboardingConfig.ts hooks/useOnboardingNavigation.ts
git commit -m "feat: simplify onboarding to 4 screens (welcome, create-account, profile, youre-in)"
```

---

## Task 6: Add birthday picker to profile screen

**Files:**
- Modify: `app/(onboarding)/profile.tsx`

**Step 1: Add birthday state and date picker**

Add to profile.tsx:
- New state: `const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);`
- A birthday section below the country picker:
  - Section label: "When's your birthday?"
  - Subtitle: "This helps us personalise your experience"
  - A `Pressable` that shows the selected date or placeholder text
  - On press, show a date picker (use `@react-native-community/datetimepicker` — check if already installed, if not use a simple modal with month/year/day pickers)
- Update `canContinue` to require `dateOfBirth` is set
- Update `handleContinue` to store `dateOfBirth` in onboardingStore:
  ```typescript
  onboardingStore.set('dateOfBirth', dateOfBirth.toISOString().split('T')[0]);
  ```
- Remove bio section entirely (no longer needed in simplified onboarding)
- Keep photo as optional (controlled by A/B config)

**Step 2: Check for date picker dependency**

Run: `grep -r "datetimepicker" package.json` to check if already installed.
If not installed, use a simple pressable that opens a modal-style date selector, or install `@react-native-community/datetimepicker`.

**Step 3: Commit**

```bash
git add app/(onboarding)/profile.tsx
git commit -m "feat: add birthday picker to onboarding profile screen"
```

---

## Task 7: Update youre-in screen to write new fields

**Files:**
- Modify: `app/(onboarding)/youre-in.tsx`

**Step 1: Update profile upsert**

In `youre-in.tsx`, modify the `handleFinish` function:
- Remove `travel_style` and `interests` from `profileData` (no longer collected)
- Add `date_of_birth: data.dateOfBirth || null`
- Remove trip creation block (trips are no longer created during onboarding)

The profileData should become:
```typescript
const profileData = {
  id: userId,
  first_name: data.firstName,
  avatar_url: avatarUrl,
  home_country_iso2: data.countryIso2 || null,
  home_country_name: data.countryName || null,
  date_of_birth: data.dateOfBirth || null,
  onboarding_completed_at: new Date().toISOString(),
};
```

**Step 2: Remove the onboarding_completed_at fallback check**

The column definitely exists now (was added in migration 20260206_114). Remove the try/fallback pattern and just do the single upsert.

**Step 3: Commit**

```bash
git add app/(onboarding)/youre-in.tsx
git commit -m "feat: update youre-in to write date_of_birth, remove preference fields"
```

---

## Task 8: Initialize EventTracker in app lifecycle

**Files:**
- Modify: `app/_layout.tsx` — initialize/destroy EventTracker based on auth state

**Step 1: Import and wire up EventTracker**

In `app/_layout.tsx`, in the auth effect (or wherever userId changes):
```typescript
import { eventTracker } from '@/data/events/eventTracker';

// In the auth effect:
useEffect(() => {
  if (userId) {
    eventTracker.init(userId);
  } else {
    eventTracker.destroy();
  }
  return () => eventTracker.destroy();
}, [userId]);
```

**Step 2: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: initialize EventTracker on auth state change"
```

---

## Task 9: Add event tracking to existing screens

**Files:**
- Modify: `app/(tabs)/explore/country/[id].tsx` (or equivalent country page) — track `viewed_country`
- Modify: `app/(tabs)/explore/city/[id].tsx` (or equivalent city page) — track `viewed_city`
- Modify: Place detail screen — track `viewed_place`
- Modify: Save/unsave handlers — track `saved_place` / `unsaved_place`
- Modify: Collection screen — track `opened_collection`
- Modify: Search screen — track `searched`
- Modify: Community thread screen — track `opened_thread`, `replied_thread`
- Modify: Trip creation — track `created_trip`, `added_place_to_trip`

**Step 1: Add tracking calls**

Each screen gets a single `eventTracker.track()` call. Example pattern:

```typescript
import { eventTracker } from '@/data/events/eventTracker';

// In a useEffect that fires on mount:
useEffect(() => {
  if (countryId) {
    eventTracker.track('viewed_country', 'country', countryId);
  }
}, [countryId]);
```

For saves:
```typescript
const handleSave = async (placeId: string) => {
  // ... existing save logic ...
  eventTracker.track('saved_place', 'place', placeId);
};
```

For search:
```typescript
eventTracker.track('searched', null, null, { query: searchText, result_count: results.length });
```

**Important:** Find the exact file paths by searching the codebase. The paths above are approximate.

**Step 2: Commit (one per surface area, or all at once)**

```bash
git add -A
git commit -m "feat: add passive event tracking to explore, community, and trip screens"
```

---

## Task 10: TypeScript validation

**Step 1: Run type checker**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|state/|hooks/|lib/)'
```

Expected: No new errors from our changes.

**Step 2: Fix any type errors**

If there are errors in our new/modified files, fix them.

**Step 3: Commit fixes if needed**

```bash
git add -A
git commit -m "fix: resolve TypeScript errors in onboarding and event tracking"
```

---

## Task 11: Verify and test

**Manual test checklist:**

1. **Google login → new user:**
   - Welcome → Create Account → tap Google → Profile screen
   - Fill name, country, birthday → You're In → Home tab
   - Verify `profiles` row has `first_name`, `home_country_iso2`, `date_of_birth`, `onboarding_completed_at`

2. **Email login → new user:**
   - Welcome → Create Account → enter email + password → Profile screen
   - Same flow, verify same DB writes

3. **Google login → existing user:**
   - Welcome → Create Account → tap Google → straight to Home
   - No onboarding screens shown

4. **Email login → existing user:**
   - Welcome → Login → enter credentials → straight to Home

5. **User skips photo:**
   - Complete onboarding without photo → `avatar_url` is null → no crash

6. **Event tracking:**
   - Browse a country page → check `user_events` table for `viewed_country` row
   - Save a place → check for `saved_place` row
   - Events appear in batches (not one-by-one)

7. **Returning user not affected:**
   - User with existing `onboarding_completed_at` → goes straight to home
   - Their existing `interests` and `travel_style` data is untouched

---

## Summary of all deliverables

| Deliverable | Location |
|-------------|----------|
| Design doc | `docs/plans/2026-02-16-simplified-onboarding-design.md` |
| Migration: date_of_birth | `supabase/migrations/20260216_add_date_of_birth.sql` |
| Migration: user_events | `supabase/migrations/20260216_user_events.sql` |
| Migration: user_tag_affinity + scoring | `supabase/migrations/20260216_user_tag_affinity.sql` |
| EventTracker module | `data/events/eventTracker.ts`, `data/events/types.ts` |
| Simplified onboarding | Modified: _layout.tsx, profile.tsx, youre-in.tsx, onboardingStore.ts, onboardingConfig.ts |
| Event tracking integration | Modified: country/city/place/search/community/trip screens |
