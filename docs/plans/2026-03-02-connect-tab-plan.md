# Connect Tab Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the Travelers tab into a unified "Connect" feed mixing activity cards and people rows, anchored to a smart hybrid location check-in system.

**Architecture:** Replace the segmented Travelers/Activities toggle with a single FlatList feed. Add a city check-in system (GPS + trip fallback + manual). Redesign activity cards, people rows, the quick-post sheet, and profile screen. Keep all existing DB schemas and API functions.

**Tech Stack:** React Native, Expo Router, Supabase, React Query, expo-location, Modal-based bottom sheets, Ionicons, PlusJakartaSans

---

## Task 1: DB Migration — Add check-in columns to profiles

**Files:**
- Create: `supabase/migrations/20260302_profile_checkin.sql`

**Step 1: Write the migration**

```sql
-- Add city check-in columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS checkin_city_id uuid REFERENCES cities(id),
  ADD COLUMN IF NOT EXISTS checked_in_at timestamptz;

-- Index for feed queries: find users checked into a city
CREATE INDEX IF NOT EXISTS idx_profiles_checkin_city
  ON profiles (checkin_city_id)
  WHERE checkin_city_id IS NOT NULL;

-- RLS: users can update their own check-in
CREATE POLICY profiles_update_own_checkin ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

Note: The `profiles_update_own_checkin` policy may conflict with an existing update policy. Check existing policies first with `\dp profiles` and skip if a general update-own policy already exists.

**Step 2: Apply the migration**

```bash
PSQL=/opt/homebrew/Cellar/libpq/18.2/bin/psql
source .env
DB_URL="postgresql://postgres.bfyewxgdfkmkviajmfzp:${SUPABASE_DB_PASSWORD}@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
$PSQL "$DB_URL" -f supabase/migrations/20260302_profile_checkin.sql
```

Expected: `ALTER TABLE`, `CREATE INDEX` (or notices if already exist)

**Step 3: Add API functions for check-in**

Modify: `data/api.ts` — add these functions near the existing `updateUserLocation` function:

```typescript
/** Check into a city. Sets checkin_city_id + checked_in_at on the profile. */
export async function checkIntoCity(userId: string, cityId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ checkin_city_id: cityId, checked_in_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}

/** Clear check-in (go invisible). */
export async function clearCheckIn(userId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ checkin_city_id: null, checked_in_at: null })
    .eq('id', userId);
  if (error) throw error;
}

/** Get travelers checked into a specific city. */
export async function getTravelersInCity(
  cityId: string,
  currentUserId: string,
  blockedIds: string[],
  limit = 30,
): Promise<Profile[]> {
  const excludeIds = [currentUserId, ...blockedIds];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('checkin_city_id', cityId)
    .eq('is_discoverable', true)
    .not('id', 'in', `(${excludeIds.join(',')})`)
    .order('checked_in_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapProfile);
}
```

Also add `checkin_city_id` and `checked_in_at` to the `mapProfile` function's mapping (follow the existing pattern for mapping snake_case to camelCase).

**Step 4: Update Profile type**

Modify: `data/types.ts` — add to the `Profile` interface (around line 368-400):

```typescript
  checkinCityId: string | null;
  checkedInAt: string | null;
```

**Step 5: Commit**

```bash
git add supabase/migrations/20260302_profile_checkin.sql data/api.ts data/types.ts
git commit -m "feat(connect): add city check-in columns and API functions"
```

---

## Task 2: Location Check-In Hook

**Files:**
- Create: `hooks/useCheckIn.ts`

**Step 1: Create the hook**

This hook manages the check-in state: reads current check-in from profile, provides methods to check in via GPS suggestion, trip city, or manual search. It wraps the API calls from Task 1.

```typescript
import { useState, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import { useAuth } from '@/state/AuthContext';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { checkIntoCity, clearCheckIn, getProfileById, searchDestinations } from '@/data/api';

interface CheckInCity {
  cityId: string;
  cityName: string;
  countryName: string | null;
}

interface GpsSuggestion {
  cityName: string;
  countryName: string | null;
}

export function useCheckIn() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const [gpsSuggestion, setGpsSuggestion] = useState<GpsSuggestion | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Read current check-in from profile cache
  // (Profile is likely already cached from other screens)
  const { data: profile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getProfileById(userId!),
    enabled: !!userId,
  });

  const currentCheckIn: CheckInCity | null = profile?.checkinCityId
    ? { cityId: profile.checkinCityId, cityName: /* resolved from city query */ '', countryName: null }
    : null;
  // NOTE: We'll need to join city name — see implementation note below

  /** Try GPS to suggest a city */
  const detectCity = useCallback(async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (geo?.city) {
        setGpsSuggestion({
          cityName: geo.city,
          countryName: geo.country ?? null,
        });
      }
    } catch {
      // GPS unavailable — that's fine
    } finally {
      setGpsLoading(false);
    }
  }, []);

  /** Check into a city by ID */
  const checkIn = useCallback(async (cityId: string) => {
    if (!userId) return;
    await checkIntoCity(userId, cityId);
    queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    queryClient.invalidateQueries({ queryKey: ['connect-feed'] });
  }, [userId, queryClient]);

  /** Clear check-in */
  const checkOut = useCallback(async () => {
    if (!userId) return;
    await clearCheckIn(userId);
    queryClient.invalidateQueries({ queryKey: ['profile', userId] });
  }, [userId, queryClient]);

  return {
    currentCheckIn, // null if not checked in
    gpsSuggestion,  // city detected by GPS
    gpsLoading,
    detectCity,     // trigger GPS detection
    checkIn,        // check into a city by ID
    checkOut,       // clear check-in
    profile,
  };
}
```

Implementation note: The profile stores `checkin_city_id` (a UUID). To display the city name, either:
- Join in the profile query (preferred — modify `getProfileById` to join `cities`)
- Or do a separate city lookup

Prefer the join approach: modify `getProfileById` to `.select('*, cities!checkin_city_id(name, countries(name))')` and map `checkinCityName` + `checkinCountryName` onto the Profile type.

**Step 2: Commit**

```bash
git add hooks/useCheckIn.ts
git commit -m "feat(connect): add useCheckIn hook for city check-in system"
```

---

## Task 3: Check-In Prompt Screen

**Files:**
- Create: `components/connect/CheckInPrompt.tsx`

This is the full-screen prompt shown when a user opens Connect for the first time without a check-in. It shows GPS suggestion (if available), trip city quick-picks, and manual search.

**Step 1: Build the component**

Key implementation details:
- Uses `useCheckIn().detectCity` on mount to trigger GPS
- Fetches trip cities from `useTrips()` (existing hook in `data/trips/useTrips.ts`)
- Manual search uses `searchDestinations()` from `data/api.ts`, filtered to `type === 'city'`
- On city selection, calls `useCheckIn().checkIn(cityId)` and invokes `onComplete` callback
- Follows bottom sheet styling pattern from `MenuSheet.tsx` (but this is a full View, not a Modal)

Design tokens to use:
- `spacing.screenX` (24px) for horizontal padding
- `typography.h2` for "Where are you right now?" heading
- `colors.neutralFill` for option card backgrounds
- `colors.orange` for the GPS icon accent
- `radius.card` for option cards
- `fonts.medium` for option labels
- `colors.textMuted` for subtitle text ("Based on your location", "From your upcoming trip")
- Search input: `radius.input`, `colors.neutralFill` background, `spacing.md` padding

Props:
```typescript
interface CheckInPromptProps {
  onComplete: () => void;  // Called after successful check-in
  tripCities: Array<{ cityId: string; cityName: string; countryName: string | null }>;
  gpsSuggestion: { cityName: string; countryName: string | null } | null;
  gpsLoading: boolean;
  onCheckIn: (cityId: string) => Promise<void>;
}
```

The GPS suggestion needs to be resolved to a city ID. Use `searchDestinations(gpsSuggestion.cityName)` and match the first city result. If no match in our DB, don't show the GPS option.

**Step 2: Commit**

```bash
git add components/connect/CheckInPrompt.tsx
git commit -m "feat(connect): add check-in prompt component"
```

---

## Task 4: Activity Card Component

**Files:**
- Create: `components/connect/ActivityCard.tsx`

This replaces `TogetherCard.tsx` with the new text-forward design.

**Step 1: Build the component**

```
┌─────────────────────────────────────┐
│  [avatar 32px] Sarah · 🇦🇺          │
│                                     │
│  Cooking class in Ubud              │  ← semiBold, textPrimary
│  Traditional Balinese, found a      │  ← regular, textSecondary, 2 lines max
│  great local spot near the market   │
│                                     │
│  [🍳 Food]  Tuesday 2pm  2 spots   │  ← category pill + when + spots
└─────────────────────────────────────┘
```

Props:
```typescript
interface ActivityCardProps {
  post: TogetherPostWithAuthor;
  onPress: () => void;
  onAuthorPress: () => void;
}
```

Design tokens:
- Card: `backgroundColor: colors.background`, `borderWidth: 1`, `borderColor: colors.borderDefault`, `borderRadius: radius.card`, `padding: spacing.lg`
- Author row: `flexDirection: 'row'`, `alignItems: 'center'`, `gap: spacing.sm`, avatar 32x32
- Author name: `fonts.medium`, 14px, `colors.textPrimary`
- Flag: from `getFlag(post.author nationality)` — but author doesn't have nationality currently. Use country from post's `countryIso2` as fallback, or fetch from profile. Simplest: show nothing if not available.
- Title: `typography.cardTitle` (semiBold 17px)
- Description: `fonts.regular`, 15px, `colors.textSecondary`, `numberOfLines: 2`
- Bottom row: `flexDirection: 'row'`, `alignItems: 'center'`, `gap: spacing.sm`
- Category pill: `backgroundColor: colors.orangeFill`, `color: colors.orange`, `fontSize: typography.pillLabel.fontSize`, `borderRadius: radius.pill`, `paddingHorizontal: spacing.sm`, `paddingVertical: spacing.xs`
- When: `fonts.regular`, 13px, `colors.textMuted` — use existing `formatActivityDate()` from `TogetherCard.tsx`
- Spots: `fonts.regular`, 13px, `colors.textMuted` — e.g., "2 spots" or "Full"
- Pressed state: `pressedState` from design tokens

Card states:
- Own post: show "Your post" text in textMuted instead of author row
- Full: show "Full" pill (greenFill bg, greenSoft text) instead of spots count

**Step 2: Commit**

```bash
git add components/connect/ActivityCard.tsx
git commit -m "feat(connect): add ActivityCard component for unified feed"
```

---

## Task 5: People Row Component

**Files:**
- Create: `components/connect/PeopleRow.tsx`

Horizontal scrollable row of traveler avatars. Appears between activity cards.

**Step 1: Build the component**

```
WOMEN IN UBUD RIGHT NOW
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ [ava]  │ │ [ava]  │ │ [ava]  │ │ +8     │
│ Emma   │ │ Mia    │ │ Priya  │ │ more   │
│🇩🇪 Foodie│ │🇳🇱 Hiker│ │🇮🇳 Slow │ │        │
└────────┘ └────────┘ └────────┘ └────────┘
```

Props:
```typescript
interface PeopleRowProps {
  title: string;           // "Women in Ubud right now"
  travelers: Profile[];    // Full list
  onTravelerPress: (id: string) => void;
  maxVisible?: number;     // Default 8
}
```

Sub-component — `MiniProfileCard`:
- Width: ~90px (enough for avatar + name + one tag)
- Avatar: 48x48, `borderRadius: radius.full`
- Name: `fonts.medium`, 13px, `colors.textPrimary`, `numberOfLines: 1`
- Flag + tag: `fonts.regular`, 11px, `colors.textMuted`, one line — e.g., "🇩🇪 Foodie"
- Tag comes from `profile.travelStyle` or first `profileTag` if available
- Pressed state: `pressedState`

Overflow card ("+N more"):
- Same dimensions, `backgroundColor: colors.neutralFill`
- Text: `fonts.semiBold`, 16px, `colors.textSecondary`, centered

Container:
- Section title: `typography.pillLabel` style, uppercase, `letterSpacing: 0.5`, `colors.textMuted`, `marginBottom: spacing.sm`
- FlatList: `horizontal`, `showsHorizontalScrollIndicator: false`, `contentContainerStyle: { paddingHorizontal: spacing.screenX, gap: spacing.sm }`

**Step 2: Commit**

```bash
git add components/connect/PeopleRow.tsx
git commit -m "feat(connect): add PeopleRow horizontal avatar component"
```

---

## Task 6: Quick Post Bottom Sheet

**Files:**
- Create: `components/connect/QuickPostSheet.tsx`

Replaces the full-screen `together/new.tsx` form with a lightweight bottom sheet.

**Step 1: Build the component**

Follow the Modal pattern from `MenuSheet.tsx`:
- `Modal` with `transparent` + `animationType="slide"`
- Overlay with backdrop press to close
- Handle bar at top
- Safe area inset padding at bottom

Props:
```typescript
interface QuickPostSheetProps {
  visible: boolean;
  onClose: () => void;
  defaultCityId: string | null;     // From current check-in
  defaultCityName: string | null;
  onPostCreated: () => void;        // Refresh feed after posting
}
```

Layout:
```
[Handle]
"What are you up to?"               ← typography.sectionTitle (semiBold 18px)

[TextInput - multiline, 3 lines]    ← Main text input, placeholder: "Cooking class tomorrow, who's in?"

📍 Ubud        (from check-in)      ← Tappable row, shows city picker if tapped
📅 Flexible    (or auto-detected)   ← Tappable row, shows date picker if tapped
👥 Up to 3                          ← Tappable row with +/- stepper

[Category pills - horizontal wrap]  ← 8 pills, one selected (orangeFill), rest neutralFill

[Post button]                       ← Full width, orange bg, white text, 48px height
```

**Text parsing logic** (simple keyword matching):

```typescript
const CATEGORY_KEYWORDS: Record<ActivityCategory, string[]> = {
  food: ['cooking', 'dinner', 'lunch', 'breakfast', 'restaurant', 'eat', 'food', 'brunch', 'cafe', 'coffee'],
  culture: ['temple', 'museum', 'gallery', 'market', 'workshop', 'class', 'art'],
  adventure: ['hike', 'surf', 'dive', 'climb', 'kayak', 'trek', 'snorkel', 'bike', 'sunrise'],
  nightlife: ['drinks', 'bar', 'club', 'rooftop', 'sunset drinks', 'party', 'night out'],
  day_trip: ['day trip', 'excursion', 'island', 'road trip', 'waterfall'],
  wellness: ['yoga', 'spa', 'massage', 'meditation', 'retreat'],
  shopping: ['shopping', 'market', 'thrift', 'vintage', 'souvenir'],
  other: [],
};

const DATE_KEYWORDS: Record<string, () => string> = {
  'today': () => formatDate(new Date()),
  'tonight': () => formatDate(new Date()),
  'tomorrow': () => formatDate(addDays(new Date(), 1)),
  // Simple patterns only — don't over-engineer
};
```

Auto-detection runs on text change (debounced 500ms). Only auto-selects category if no category is manually selected. Only auto-fills date if "Flexible" is still the default.

On submit: calls `createTogetherPost()` from `data/together/togetherApi.ts` with the collected data, then calls `onPostCreated()`.

Validation: title text required (> 0 trimmed chars) + category required.

**Step 2: Commit**

```bash
git add components/connect/QuickPostSheet.tsx
git commit -m "feat(connect): add QuickPostSheet bottom sheet for fast activity posting"
```

---

## Task 7: Unified Connect Feed Hook

**Files:**
- Create: `data/connect/useConnectFeed.ts`

This hook fetches both activities and people for the current check-in city, then interleaves them into a single feed.

**Step 1: Build the hook**

```typescript
import { useMemo } from 'react';
import { useAuth } from '@/state/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getBlockedUserIds, getTravelersInCity } from '@/data/api';
import { getTogetherFeed } from '@/data/together/togetherApi';
import type { TogetherPostWithAuthor } from '@/data/together/types';
import type { Profile } from '@/data/types';

type FeedItem =
  | { type: 'activity'; data: TogetherPostWithAuthor }
  | { type: 'people_row'; data: Profile[] }
  | { type: 'my_posts_cta' };

interface UseConnectFeedReturn {
  items: FeedItem[];
  travelers: Profile[];
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: () => void;
  loadMore: () => void;
  hasMore: boolean;
}

export function useConnectFeed(cityId: string | null): UseConnectFeedReturn {
  const { userId } = useAuth();

  // Blocked users
  const { data: blockedIds = [] } = useQuery({
    queryKey: ['blocked-users', userId],
    queryFn: () => getBlockedUserIds(userId!),
    enabled: !!userId,
  });

  // Activities in this city
  const {
    data: activities = [],
    isLoading: activitiesLoading,
    refetch: refetchActivities,
  } = useQuery({
    queryKey: ['connect-feed', 'activities', cityId, userId],
    queryFn: () => getTogetherFeed(userId!, {
      cityId: cityId!,
      page: 0,
      pageSize: 20,
    }, blockedIds),
    enabled: !!userId && !!cityId,
  });

  // People checked into this city
  const {
    data: travelers = [],
    isLoading: travelersLoading,
    refetch: refetchTravelers,
  } = useQuery({
    queryKey: ['connect-feed', 'travelers', cityId, userId],
    queryFn: () => getTravelersInCity(cityId!, userId!, blockedIds),
    enabled: !!userId && !!cityId,
  });

  // Interleave: activity, activity, activity, [people_row], activity, activity, activity, ...
  const items = useMemo(() => {
    const result: FeedItem[] = [];
    const PEOPLE_INTERVAL = 4; // Insert people row every N activities

    for (let i = 0; i < activities.length; i++) {
      // Insert people row after every PEOPLE_INTERVAL activities
      if (i > 0 && i % PEOPLE_INTERVAL === 0 && travelers.length > 0) {
        result.push({ type: 'people_row', data: travelers });
      }
      result.push({ type: 'activity', data: activities[i] });
    }

    // If no activities but there are travelers, show people row first
    if (activities.length === 0 && travelers.length > 0) {
      result.push({ type: 'people_row', data: travelers });
    }

    return result;
  }, [activities, travelers]);

  const refresh = () => {
    refetchActivities();
    refetchTravelers();
  };

  return {
    items,
    travelers,
    isLoading: activitiesLoading || travelersLoading,
    isRefreshing: false,
    refresh,
    loadMore: () => {}, // Phase 2: pagination
    hasMore: false,
  };
}
```

**Step 2: Commit**

```bash
git add data/connect/useConnectFeed.ts
git commit -m "feat(connect): add useConnectFeed hook for unified feed"
```

---

## Task 8: Rewrite Connect Tab Main Screen

**Files:**
- Modify: `app/(tabs)/travelers/index.tsx` — full rewrite

This is the biggest task. The entire screen is replaced with:
1. Location pill at top (current check-in + change button)
2. Unified FlatList feed (activity cards + people rows)
3. FAB for quick posting
4. Check-in prompt (if no check-in yet)

**Step 1: Rewrite the screen**

Key structure:

```typescript
export default function ConnectScreen() {
  const { userId } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showPostSheet, setShowPostSheet] = useState(false);

  // Check-in state
  const { currentCheckIn, gpsSuggestion, gpsLoading, detectCity, checkIn } = useCheckIn();

  // Feed (only active when checked in)
  const { items, isLoading, refresh } = useConnectFeed(currentCheckIn?.cityId ?? null);

  // Trip cities for check-in prompt
  const { current, upcoming } = useTrips();
  const tripCities = /* extract unique cities from trips */;

  // Detect GPS on first mount if no check-in
  useEffect(() => {
    if (!currentCheckIn) detectCity();
  }, []);

  // If not checked in, show prompt
  if (!currentCheckIn) {
    return (
      <AppScreen>
        <NavigationHeader showLogo />
        <CheckInPrompt
          tripCities={tripCities}
          gpsSuggestion={gpsSuggestion}
          gpsLoading={gpsLoading}
          onCheckIn={checkIn}
          onComplete={() => {}} // Check-in triggers feed via query invalidation
        />
      </AppScreen>
    );
  }

  const renderItem = ({ item }: { item: FeedItem }) => {
    switch (item.type) {
      case 'activity':
        return (
          <View style={{ paddingHorizontal: spacing.screenX }}>
            <ActivityCard
              post={item.data}
              onPress={() => router.push(`/(tabs)/travelers/together/${item.data.id}`)}
              onAuthorPress={() => router.push(`/(tabs)/travelers/user/${item.data.userId}`)}
            />
          </View>
        );
      case 'people_row':
        return (
          <PeopleRow
            title={`Women in ${currentCheckIn.cityName} right now`}
            travelers={item.data}
            onTravelerPress={(id) => router.push(`/(tabs)/travelers/user/${id}`)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AppScreen>
      <NavigationHeader showLogo />

      {/* Location pill */}
      <LocationPill
        cityName={currentCheckIn.cityName}
        onPress={() => {/* open city picker */}}
      />

      {/* Feed */}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, i) => item.type === 'activity' ? item.data.id : `people-${i}`}
        contentContainerStyle={{
          paddingBottom: FLOATING_TAB_BAR_HEIGHT + spacing.xxl,
          gap: spacing.md,
        }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
        ListEmptyComponent={/* empty state */}
      />

      {/* FAB */}
      <Pressable
        style={[fabStyles.button, { bottom: FLOATING_TAB_BAR_HEIGHT + spacing.lg }]}
        onPress={() => setShowPostSheet(true)}
      >
        <Ionicons name="add" size={28} color={colors.background} />
      </Pressable>

      {/* Quick post sheet */}
      <QuickPostSheet
        visible={showPostSheet}
        onClose={() => setShowPostSheet(false)}
        defaultCityId={currentCheckIn.cityId}
        defaultCityName={currentCheckIn.cityName}
        onPostCreated={() => { setShowPostSheet(false); refresh(); }}
      />
    </AppScreen>
  );
}
```

**LocationPill** — inline sub-component:
- `flexDirection: 'row'`, `alignItems: 'center'`, `gap: spacing.sm`
- Ionicons `location` icon (14px, orange)
- City name: `fonts.medium`, 14px, `colors.textPrimary`
- "Change" text: `fonts.regular`, 13px, `colors.orange`
- `paddingHorizontal: spacing.screenX`, `paddingVertical: spacing.sm`

**FAB styles:**
- `position: 'absolute'`, `right: spacing.screenX`
- `width: 56`, `height: 56`, `borderRadius: 28`
- `backgroundColor: colors.orange`
- `alignItems: 'center'`, `justifyContent: 'center'`
- Elevation: `elevation.md`

**Step 2: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|hooks/)'
```

**Step 3: Commit**

```bash
git add app/(tabs)/travelers/index.tsx
git commit -m "feat(connect): rewrite main screen with unified feed + check-in"
```

---

## Task 9: Profile Screen — Vibe-First Redesign

**Files:**
- Modify: `app/(tabs)/travelers/user/[id].tsx`

Reorder sections to be vibe-first. Don't rewrite the entire file — just restructure the ScrollView content order and add the "Her Plans" section.

**Step 1: Add "Her Plans" query**

Add a query for the user's open activities in the current city:

```typescript
import { getMyTogetherPosts } from '@/data/together/togetherApi';

// Inside the component, after existing hooks:
const { data: userActivities = [] } = useQuery({
  queryKey: ['user-activities', id],
  queryFn: () => getMyTogetherPosts(id!),
  enabled: !!id && !isOwn,
});
const openActivities = userActivities.filter(a => a.status === 'open');
```

**Step 2: Reorder ScrollView sections**

Current order: Header → Stats → Edit → Countries Map → Interests → Trips → Locked

New order: Header → Bio → Travel Style Tags → Her Trip → Her Plans → Footer Stats → (Connected: Map + Full Trips)

Changes:
1. Move bio into the header area (right under name/location) — it may already be there, just ensure it's prominent
2. Move travel style tags (InterestPills) up to position 3, right after bio
3. Add "Her Trip" section — show current/upcoming trip route inline (e.g., "Ubud → Canggu → Gili T · Here for 2 more weeks")
4. Add "Her Plans" section — list open activities as simple rows (title + category pill + date)
5. Move stats to footer (small, secondary — countries count + joined date in one line)
6. Countries map + full trip history become "connected" gated content at the bottom

**Step 3: Build HerPlans sub-component (inline)**

```typescript
const HerPlans: React.FC<{ activities: TogetherPostWithAuthor[] }> = ({ activities }) => {
  if (activities.length === 0) return null;
  return (
    <View style={{ marginTop: spacing.xl }}>
      <Text style={[typography.sectionTitle, { marginBottom: spacing.md, paddingHorizontal: spacing.screenX }]}>
        Her plans
      </Text>
      {activities.map(a => (
        <Pressable
          key={a.id}
          style={({ pressed }) => [planRowStyles.row, pressed && pressedState]}
          onPress={() => router.push(`/(tabs)/travelers/together/${a.id}`)}
        >
          <Text style={planRowStyles.title}>{a.title}</Text>
          <View style={planRowStyles.meta}>
            <View style={planRowStyles.categoryPill}>
              <Text style={planRowStyles.categoryText}>{a.activityCategory}</Text>
            </View>
            <Text style={planRowStyles.date}>
              {a.isFlexible ? 'Flexible' : formatActivityDate(a.activityDate)}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
};
```

**Step 4: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|hooks/)'
```

**Step 5: Commit**

```bash
git add app/(tabs)/travelers/user/[id].tsx
git commit -m "feat(connect): redesign profile to vibe-first layout with Her Plans"
```

---

## Task 10: City Change Picker

**Files:**
- Create: `components/connect/CityPicker.tsx`

A bottom sheet for changing your check-in city. Reused in both the location pill "Change" action and the check-in prompt's manual search.

**Step 1: Build the component**

Modal-based bottom sheet (same pattern as MenuSheet). Contents:
1. Handle bar
2. "Change location" title
3. Current check-in shown (if any) with "Check out" option
4. Trip city quick picks (horizontal pills)
5. Search input with debounced `searchDestinations()` results
6. City result rows (city name + country name)

Props:
```typescript
interface CityPickerProps {
  visible: boolean;
  onClose: () => void;
  onCitySelect: (cityId: string, cityName: string, countryName: string | null) => void;
  currentCityName?: string | null;
  tripCities?: Array<{ cityId: string; cityName: string; countryName: string | null }>;
}
```

Search implementation: same debounced pattern as `together/new.tsx` lines ~580-620 (300ms debounce, `searchDestinations()`, filter `type === 'city'`).

**Step 2: Commit**

```bash
git add components/connect/CityPicker.tsx
git commit -m "feat(connect): add CityPicker bottom sheet for location changes"
```

---

## Task 11: Wire City Picker into Main Screen

**Files:**
- Modify: `app/(tabs)/travelers/index.tsx`

**Step 1: Add city picker state and integration**

```typescript
const [showCityPicker, setShowCityPicker] = useState(false);

// In LocationPill's onPress:
onPress={() => setShowCityPicker(true)}

// Add CityPicker component:
<CityPicker
  visible={showCityPicker}
  onClose={() => setShowCityPicker(false)}
  currentCityName={currentCheckIn?.cityName}
  tripCities={tripCities}
  onCitySelect={async (cityId) => {
    await checkIn(cityId);
    setShowCityPicker(false);
  }}
/>
```

**Step 2: Commit**

```bash
git add app/(tabs)/travelers/index.tsx
git commit -m "feat(connect): wire city picker into connect screen"
```

---

## Task 12: Empty States and Polish

**Files:**
- Modify: `app/(tabs)/travelers/index.tsx`
- Create: `components/connect/ConnectEmptyState.tsx`

**Step 1: Build empty state**

Two scenarios:
1. **Checked in but no activities/people** — "Be the first! Post an activity and other women in [City] will see it."
2. **No activities match** — "Nothing happening in [City] yet. Post something!"

Both show:
- Illustration or icon (Ionicons `people-outline`, 48px, `colors.textMuted`)
- Message text (`fonts.regular`, 16px, `colors.textSecondary`, centered)
- "Post an activity" button (orange outline, tappable → opens post sheet)

**Step 2: Wire into FlatList**

```typescript
ListEmptyComponent={
  !isLoading ? (
    <ConnectEmptyState
      cityName={currentCheckIn.cityName}
      onPost={() => setShowPostSheet(true)}
    />
  ) : null
}
```

**Step 3: Run type check + commit**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|hooks/)'
git add components/connect/ConnectEmptyState.tsx app/(tabs)/travelers/index.tsx
git commit -m "feat(connect): add empty states for connect feed"
```

---

## Task 13: GPS City Change Banner

**Files:**
- Create: `components/connect/CityChangeBanner.tsx`
- Modify: `app/(tabs)/travelers/index.tsx`

**Step 1: Build the banner**

A dismissible banner that appears when GPS detects you're in a different city than your check-in.

```
┌─────────────────────────────────────────┐
│ Looks like you're in Canggu — update?   │
│                              [Update] [✕]│
└─────────────────────────────────────────┘
```

Props:
```typescript
interface CityChangeBannerProps {
  suggestedCity: string;
  onUpdate: () => void;
  onDismiss: () => void;
}
```

Design:
- `backgroundColor: colors.orangeFill`
- `borderRadius: radius.card`
- `marginHorizontal: spacing.screenX`
- Text: `fonts.regular`, 14px, `colors.textPrimary`
- "Update" link: `fonts.semiBold`, 14px, `colors.orange`
- Close X: Ionicons `close`, 16px, `colors.textMuted`

**Step 2: Wire into main screen**

Add logic to periodically check GPS (on app foreground, not on a timer) and compare with current check-in city. If different, show banner. User can update (triggers city search → check-in) or dismiss (hides for this session).

**Step 3: Commit**

```bash
git add components/connect/CityChangeBanner.tsx app/(tabs)/travelers/index.tsx
git commit -m "feat(connect): add GPS city change detection banner"
```

---

## Task 14: Cleanup Old Components

**Files:**
- Modify: `app/(tabs)/travelers/index.tsx` — remove old imports
- Old files to assess for removal:
  - `components/together/TogetherFeed.tsx` — still used by Together detail? Check if only used in travelers/index. If so, can be removed.
  - `components/together/TogetherFilterPills.tsx` — check usage
  - `components/travelers/LocationConsentBanner.tsx` — replaced by check-in system

**Step 1: Check what's still referenced**

Search for imports of old components:
```bash
grep -r "TogetherFeed" app/ components/ --include="*.tsx" --include="*.ts"
grep -r "LocationConsentBanner" app/ components/ --include="*.tsx" --include="*.ts"
```

Only remove files that are exclusively imported by travelers/index.tsx (which we've rewritten). Keep anything still used elsewhere.

**Step 2: Remove dead imports from travelers/index.tsx**

The rewritten screen no longer needs:
- `TogetherFeed` import
- `useTravelersFeedV2` import (replaced by `useConnectFeed`)
- `useTravelerSearch` import (search is removed from this screen for now)
- `TravelerCard` import (replaced by `PeopleRow`)
- `PendingConnectionsBanner` import (connections still work, but banner moves or is removed)
- `HamburgerButton` import (if not used)

**Step 3: Commit**

```bash
git add -A
git commit -m "chore(connect): remove old travelers/activities split components"
```

---

## Task 15: Final Type Check and Smoke Test

**Step 1: Run full type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/|hooks/)' | head -50
```

Fix any errors.

**Step 2: Visual smoke test**

```bash
npx expo start --dev-client
```

Test on device/simulator:
- [ ] Open Connect tab → see check-in prompt (first time)
- [ ] GPS suggests city (if permission granted)
- [ ] Tap a trip city → check in → feed loads
- [ ] See activity cards in feed
- [ ] See people row between activities
- [ ] Tap FAB → quick post sheet opens
- [ ] Type activity, category auto-detects, post it
- [ ] New activity appears in feed
- [ ] Tap activity card → detail screen works
- [ ] Tap person avatar → profile screen works
- [ ] Profile shows vibe-first layout
- [ ] Change city via location pill → feed updates
- [ ] Pull to refresh works

**Step 3: Final commit if any fixes**

```bash
git add -A
git commit -m "fix(connect): type and polish fixes from smoke test"
```
