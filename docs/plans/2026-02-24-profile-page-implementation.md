# Profile Page & Travel Identity — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the traveler profile page with full-bleed trip cards, flag grid, own-profile mode, and upgrade TravelerCard with country flags.

**Architecture:** The existing `app/(tabs)/travelers/user/[id].tsx` (687 lines) already has connection logic, blocking, reporting, and messaging. We'll rewrite its render to match the new design, extract visual components into `components/profile/`, and add own-profile detection. `useTravelerProfile` hook already fetches all needed data.

**Tech Stack:** React Native, Expo Router, expo-image, expo-linear-gradient, Supabase, React Query

**Design doc:** `docs/plans/2026-02-24-profile-page-design.md`

---

### Task 1: Create FlagGrid component

**Files:**
- Create: `components/profile/FlagGrid.tsx`

**Step 1: Create the component**

```tsx
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { getFlag } from '@/data/trips/helpers';

interface FlagGridProps {
  /** Array of ISO2 country codes */
  countries: string[];
  /** Max flags before showing "+X more" */
  maxVisible?: number;
}

const FLAG_SIZE = 28;
const FLAG_GAP = 8;
const DEFAULT_MAX = 15;

export default function FlagGrid({ countries, maxVisible = DEFAULT_MAX }: FlagGridProps) {
  const [expanded, setExpanded] = useState(false);

  if (countries.length === 0) return null;

  const visible = expanded ? countries : countries.slice(0, maxVisible);
  const remaining = countries.length - maxVisible;
  const showMore = !expanded && remaining > 0;

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {visible.map((iso2) => (
          <Text key={iso2} style={styles.flag}>
            {getFlag(iso2)}
          </Text>
        ))}
        {showMore && (
          <Pressable
            style={styles.morePill}
            onPress={() => setExpanded(true)}
            hitSlop={8}
          >
            <Text style={styles.moreText}>+{remaining}</Text>
          </Pressable>
        )}
      </View>
      {expanded && countries.length > maxVisible && (
        <Pressable onPress={() => setExpanded(false)} hitSlop={8}>
          <Text style={styles.collapseText}>Show less</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: FLAG_GAP,
  },
  flag: {
    fontSize: FLAG_SIZE,
    lineHeight: FLAG_SIZE + 4,
  },
  morePill: {
    height: FLAG_SIZE + 4,
    paddingHorizontal: 10,
    justifyContent: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.pill,
  },
  moreText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  collapseText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
    marginTop: spacing.sm,
  },
});
```

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1 | grep 'components/profile/FlagGrid'`
Expected: No errors

**Step 3: Commit**

```bash
git add components/profile/FlagGrid.tsx
git commit -m "feat: add FlagGrid component for country flag display"
```

---

### Task 2: Create full-bleed ProfileTripCard component

This replaces the existing text-based `ProfileTripCard` with a Polarsteps-style image card.

**Files:**
- Create: `components/profile/ProfileTripCard.tsx`

**Context:**
- `TripWithStops` type from `data/trips/types.ts` — has `coverImageUrl`, `title`, `destinationName`, `countryIso2`, `arriving`, `leaving`, `status`
- `TripListCard` at `components/trips/TripListCard.tsx` uses the same image+gradient pattern — reference it for style consistency
- `getFlag` from `data/trips/helpers.ts`, `formatDateShort` for dates
- `STATUS_COLORS` from `data/trips/helpers.ts` for status pill colors
- Use `getCityById` from `data/api.ts` to get fallback hero image when no `coverImageUrl`
- Use `expo-image` for Image, `expo-linear-gradient` for gradient overlay

**Step 1: Create the component**

```tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useData } from '@/hooks/useData';
import { getCityById } from '@/data/api';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';
import { formatDateShort, getFlag, STATUS_COLORS } from '@/data/trips/helpers';
import type { TripWithStops } from '@/data/trips/types';

interface ProfileTripCardProps {
  trip: TripWithStops;
  overlapLabel?: string;
  /** If true, tapping navigates to trip detail */
  isOwn?: boolean;
}

const CARD_HEIGHT = 200;

export default function ProfileTripCard({ trip, overlapLabel, isOwn }: ProfileTripCardProps) {
  const router = useRouter();
  const firstStop = (trip.stops ?? [])[0];

  const { data: city } = useData(
    () => (firstStop?.cityId ? getCityById(firstStop.cityId) : Promise.resolve(null)),
    [firstStop?.cityId],
  );

  const imageUrl = trip.coverImageUrl ?? city?.heroImageUrl ?? null;
  const flag = getFlag(trip.countryIso2);
  const statusStyle = STATUS_COLORS[trip.status] ?? STATUS_COLORS.draft;
  const showStatusPill = trip.status !== 'completed';

  const dateText = trip.arriving && trip.leaving
    ? `${formatDateShort(trip.arriving)} — ${formatDateShort(trip.leaving)}`
    : 'Flexible dates';

  const handlePress = () => {
    if (isOwn) {
      router.push(`/trips/${trip.id}`);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && isOwn && pressedState]}
      onPress={handlePress}
      disabled={!isOwn}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, styles.placeholder]}>
          <Text style={styles.placeholderFlag}>{flag}</Text>
          <Text style={styles.placeholderName}>{trip.destinationName}</Text>
        </View>
      )}

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Status pill — top right */}
      {showStatusPill && (
        <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {statusStyle.label}
          </Text>
        </View>
      )}

      {/* Overlap badge — top left */}
      {overlapLabel && (
        <View style={styles.overlapBadge}>
          <Text style={styles.overlapText}>{overlapLabel}</Text>
        </View>
      )}

      {/* Bottom text */}
      <View style={styles.bottomContent}>
        <Text style={styles.title} numberOfLines={1}>
          {trip.title || `${flag} ${trip.destinationName}`}
        </Text>
        <Text style={styles.dateText}>{dateText}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    borderRadius: radius.cardLg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  placeholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderFlag: {
    fontSize: 48,
    opacity: 0.5,
  },
  placeholderName: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  statusPill: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  statusText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  overlapBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  overlapText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.orange,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  dateText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});
```

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1 | grep 'components/profile/ProfileTripCard'`
Expected: No errors

**Step 3: Commit**

```bash
git add components/profile/ProfileTripCard.tsx
git commit -m "feat: add full-bleed ProfileTripCard with cover image support"
```

---

### Task 3: Redesign the profile screen (`user/[id].tsx`)

This is the main task. We rewrite the render of the existing profile screen to match the new design while preserving all connection/blocking/reporting/messaging logic.

**Files:**
- Modify: `app/(tabs)/travelers/user/[id].tsx`

**Key changes:**
1. Add `isOwn` detection (`id === userId`)
2. When `isOwn`, show all sections (no locked state), replace "Connect" with "Edit profile"
3. Replace `CredibilityStats` with inline stats row (no icons, number + label)
4. Replace old `ProfileTripCard` import with new `components/profile/ProfileTripCard`
5. Add `FlagGrid` for countries visited (merge trip-derived + user-managed countries into one unique ISO2 list)
6. Show bio always (not gated behind connection status)
7. Move interests above trips
8. For `isOwn` with no trips: show "Plan your first trip" CTA
9. When `isOwn`: header right action = "Settings" gear icon. When viewing others: keep existing overflow menu (block/report)

**Step 1: Rewrite the component render**

Read the existing file at `app/(tabs)/travelers/user/[id].tsx` to understand the full current structure. Keep ALL existing logic (callbacks: `doConnect`, `handleConnect`, `handleAccept`, `handleDecline`, `handleMessage`, `handleMoreMenu`) — only change the JSX return and styles.

Key pattern for `isOwn` detection:
```tsx
const isOwn = !!userId && userId === id;
```

Stats row (replace `CredibilityStats`):
```tsx
// Merge visited countries: trip-derived + user-managed, deduplicated by ISO2
const allCountryIso2s = useMemo(() => {
  const set = new Set<string>();
  for (const vc of visitedCountries) set.add(vc.countryIso2);
  for (const umc of userManagedCountries) {
    if (umc.countryIso2) set.add(umc.countryIso2);
  }
  return Array.from(set);
}, [visitedCountries, userManagedCountries]);

const countriesCount = allCountryIso2s.length;
const joinedDate = profile ? new Date(profile.createdAt) : null;
const joinedLabel = joinedDate
  ? `Joined ${MONTHS[joinedDate.getMonth()]} ${joinedDate.getFullYear()}`
  : '';
```

Stats row JSX:
```tsx
<View style={styles.statsRow}>
  {countriesCount > 0 && (
    <View style={styles.statItem}>
      <Text style={styles.statNumber}>{countriesCount}</Text>
      <Text style={styles.statLabel}>{countriesCount === 1 ? 'country' : 'countries'}</Text>
    </View>
  )}
  {totalTripCount > 0 && (
    <View style={styles.statItem}>
      <Text style={styles.statNumber}>{totalTripCount}</Text>
      <Text style={styles.statLabel}>{totalTripCount === 1 ? 'trip' : 'trips'}</Text>
    </View>
  )}
  <View style={styles.statItem}>
    <Text style={styles.statLabel}>{joinedLabel}</Text>
  </View>
</View>
```

For `isOwn` action button:
```tsx
{isOwn ? (
  <Pressable
    style={styles.editButton}
    onPress={() => router.push('/(tabs)/home/edit-profile')}
  >
    <Feather name="edit-2" size={16} color={colors.textPrimary} />
    <Text style={styles.editButtonText}>Edit profile</Text>
  </Pressable>
) : (
  /* existing connection bottom bar content */
)}
```

Section ordering in ScrollView:
1. Profile header (avatar 88px, name + flag, verified badge, bio)
2. Stats row
3. Action button (edit for self, connection for others)
4. Flag grid (if countries > 0)
5. Trips (full-bleed cards)
6. Interests

Visibility rules:
- `isOwn`: show everything, no locked state
- Viewing others: bio always visible, interests visible if connected or `isOwn`, trips visible if connected or `isOwn`, countries visible to all (they're public data per RLS)
- Locked section only shown when NOT `isOwn` AND NOT `showExtended`

**Step 2: Add MONTHS constant at top of file**

```tsx
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
```

**Step 3: Update imports**

Replace:
```tsx
import ProfileTripCard from '@/components/travelers/ProfileTripCard';
```
With:
```tsx
import ProfileTripCard from '@/components/profile/ProfileTripCard';
import FlagGrid from '@/components/profile/FlagGrid';
```

Remove `CredibilityStats` import.

**Step 4: Update styles**

New styles needed:
```tsx
// Stats row
statsRow: {
  flexDirection: 'row',
  justifyContent: 'center',
  gap: spacing.xxl,
  paddingVertical: spacing.lg,
  marginBottom: spacing.md,
},
statItem: {
  alignItems: 'center',
},
statNumber: {
  fontFamily: fonts.semiBold,
  fontSize: 17,
  color: colors.textPrimary,
},
statLabel: {
  fontFamily: fonts.regular,
  fontSize: 13,
  color: colors.textMuted,
  marginTop: 1,
},

// Edit button
editButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  borderWidth: 1,
  borderColor: colors.borderDefault,
  borderRadius: radius.button,
  paddingVertical: spacing.md,
  marginBottom: spacing.xl,
},
editButtonText: {
  fontFamily: fonts.semiBold,
  fontSize: 15,
  color: colors.textPrimary,
},

// Flag grid section
flagSection: {
  marginBottom: spacing.xl,
},

// Trips empty state (own profile)
tripsCta: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: spacing.sm,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.xl,
  borderWidth: 1,
  borderColor: colors.orange,
  borderRadius: radius.button,
  alignSelf: 'center',
  marginTop: spacing.md,
  marginBottom: spacing.xl,
},
tripsCtaText: {
  fontFamily: fonts.semiBold,
  fontSize: 15,
  color: colors.orange,
},
noTripsText: {
  fontFamily: fonts.regular,
  fontSize: 14,
  color: colors.textMuted,
  textAlign: 'center',
  marginTop: spacing.md,
},
```

Update existing avatar style to 88px:
```tsx
avatar: {
  width: 88,
  height: 88,
  borderRadius: radius.full,
  marginBottom: spacing.md,
},
```

**Step 5: Move bottom bar logic for `isOwn`**

When `isOwn`, don't render the bottom bar at all — the "Edit profile" button is inline in the scroll content. When viewing others, keep the existing bottom bar with connection/message buttons.

**Step 6: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/)' | head -20`
Expected: No new errors

**Step 7: Commit**

```bash
git add app/(tabs)/travelers/user/[id].tsx
git commit -m "feat: redesign profile page with full-bleed trips, flag grid, own-profile mode"
```

---

### Task 4: Enhance TravelerCard with flag row and country count

**Files:**
- Modify: `components/TravelerCard.tsx`

**Step 1: Add visited countries prop and flag row**

Add to props interface:
```tsx
visitedCountryIso2s?: string[];
```

Add to component body (below location line in `headerText` View):
```tsx
{visitedCountryIso2s && visitedCountryIso2s.length > 0 && (
  <View style={styles.flagRow}>
    {visitedCountryIso2s.slice(0, 5).map((iso2) => (
      <Text key={iso2} style={styles.miniFlag}>{getFlag(iso2)}</Text>
    ))}
    {visitedCountryIso2s.length > 5 && (
      <Text style={styles.flagCount}>+{visitedCountryIso2s.length - 5}</Text>
    )}
  </View>
)}
```

**Step 2: Update avatar size from 56 to 64**

```tsx
avatar: {
  width: 64,
  height: 64,
  borderRadius: radius.full,
},
```

**Step 3: Add new styles**

```tsx
flagRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  marginTop: 4,
},
miniFlag: {
  fontSize: 16,
  lineHeight: 20,
},
flagCount: {
  fontFamily: fonts.regular,
  fontSize: 13,
  color: colors.textMuted,
  marginLeft: 2,
},
```

**Step 4: Add import for `getFlag`**

```tsx
import { getFlag } from '@/data/trips/helpers';
```

**Step 5: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1 | grep 'TravelerCard'`
Expected: No errors

**Step 6: Commit**

```bash
git add components/TravelerCard.tsx
git commit -m "feat: enhance TravelerCard with country flags and larger avatar"
```

---

### Task 5: Wire visited countries into TravelerCard on Travelers tab

The `TravelerCardWrapper` in `app/(tabs)/travelers/index.tsx` needs to fetch visited countries for each profile and pass them to `TravelerCard`.

**Files:**
- Modify: `app/(tabs)/travelers/index.tsx`

**Step 1: Fetch countries per profile in TravelerCardWrapper**

Add import:
```tsx
import { useQuery } from '@tanstack/react-query';
import { getUserVisitedCountries } from '@/data/api';
```

Inside `TravelerCardWrapper`, add:
```tsx
const { data: visitedCountries } = useQuery({
  queryKey: ['travelerCard', 'countries', profile.id],
  queryFn: () => getUserVisitedCountries(profile.id),
  staleTime: 5 * 60_000,
});

const countryIso2s = (visitedCountries ?? []).map((vc) => vc.countryIso2);
```

Pass to TravelerCard:
```tsx
<TravelerCard
  profile={profile}
  connectionStatus={status}
  sharedInterests={shared}
  contextLabel={contextLabel}
  visitedCountryIso2s={countryIso2s}
  onPress={...}
  onConnect={handleConnect}
/>
```

Note: `getUserVisitedCountries` returns `UserVisitedCountry[]` with `countryIso2` field. Check the type:

```tsx
export interface UserVisitedCountry {
  countryId: string;
  countryIso2: string;
  countryName: string;
}
```

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1 | grep 'travelers/index'`
Expected: No errors

**Step 3: Commit**

```bash
git add app/(tabs)/travelers/index.tsx
git commit -m "feat: wire visited countries into TravelerCard on Travelers tab"
```

---

### Task 6: Update MenuSheet to route "Profile" to own profile

**Files:**
- Modify: `components/MenuSheet.tsx`

**Step 1: Add userId import and update Profile route**

Add import:
```tsx
import { useAuth } from '@/state/AuthContext';
```

Inside `MenuSheet`, add:
```tsx
const { userId } = useAuth();
```

Change the Profile menu item route:
```tsx
{ label: 'Profile', icon: 'user', route: userId ? `/(tabs)/travelers/user/${userId}` : '/(tabs)/home/edit-profile' },
```

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1 | grep 'MenuSheet'`
Expected: No errors

**Step 3: Commit**

```bash
git add components/MenuSheet.tsx
git commit -m "feat: route Profile menu item to own profile page"
```

---

### Task 7: Add AvatarNudge component on Home tab

**Files:**
- Create: `components/home/AvatarNudge.tsx`
- Modify: `app/(tabs)/home/index.tsx`

**Step 1: Create AvatarNudge component**

Follow the exact same pattern as `VerificationNudge` (same file structure, same dismiss logic with AsyncStorage):

```tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import { getProfileById, uploadAvatar } from '@/data/api';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

const DISMISS_KEY = '@sola:dismissed_avatar_nudge';
const DISMISS_EXPIRY_KEY = '@sola:avatar_nudge_expiry';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function AvatarNudge() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState(true);
  const [uploading, setUploading] = useState(false);

  const { data: profile } = useData(
    () => (userId ? getProfileById(userId) : Promise.resolve(null)),
    ['profile', userId],
  );

  useEffect(() => {
    AsyncStorage.multiGet([DISMISS_KEY, DISMISS_EXPIRY_KEY]).then(([[, d], [, exp]]) => {
      if (d === 'true' && exp) {
        const expiry = parseInt(exp, 10);
        if (Date.now() < expiry) {
          setDismissed(true);
          return;
        }
      }
      setDismissed(false);
    });
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    const expiry = String(Date.now() + SEVEN_DAYS_MS);
    AsyncStorage.multiSet([
      [DISMISS_KEY, 'true'],
      [DISMISS_EXPIRY_KEY, expiry],
    ]);
  }, []);

  const pickImage = useCallback(async () => {
    if (!userId) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const asset = result.assets[0];
      const fileName = asset.uri.split('/').pop() || 'avatar.jpg';
      await uploadAvatar(userId, asset.uri, fileName);
      queryClient.invalidateQueries({ queryKey: ['useData', userId] });
      setDismissed(true);
      // Permanently dismiss after upload
      AsyncStorage.setItem(DISMISS_KEY, 'permanent');
    } catch {
      // Silently fail
    } finally {
      setUploading(false);
    }
  }, [userId, queryClient]);

  if (dismissed || !profile || profile.avatarUrl) return null;

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
        ]}
        onPress={pickImage}
        disabled={uploading}
        accessibilityRole="button"
        accessibilityLabel="Add a profile photo"
      >
        <View style={styles.iconContainer}>
          <Ionicons name="camera" size={24} color={colors.orange} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Add a profile photo</Text>
          <Text style={styles.subtitle}>
            Other travelers are more likely to connect when they can see who you are
          </Text>
        </View>

        <Pressable onPress={dismiss} hitSlop={12} style={styles.closeBtn}>
          <Ionicons name="close" size={16} color={colors.textMuted} />
        </Pressable>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  iconContainer: {
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
    marginTop: -spacing.xs,
    marginRight: -spacing.xs,
  },
});
```

**Step 2: Add AvatarNudge to Home screen**

In `app/(tabs)/home/index.tsx`, add import:
```tsx
import { AvatarNudge } from '@/components/home/AvatarNudge';
```

Add `<AvatarNudge />` after the `VerificationNudge` component in the render.

**Step 3: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1 | grep -E '(AvatarNudge|home/index)' | head -10`
Expected: No errors

**Step 4: Commit**

```bash
git add components/home/AvatarNudge.tsx app/(tabs)/home/index.tsx
git commit -m "feat: add profile photo nudge card on Home tab"
```

---

### Task 8: Final TypeScript check and cleanup

**Files:**
- Potentially clean up: `components/travelers/ProfileTripCard.tsx` (old component, may still be imported elsewhere)
- Potentially clean up: `components/travelers/CredibilityStats.tsx` (no longer imported)

**Step 1: Check for remaining imports of old components**

Run: `grep -r 'travelers/ProfileTripCard\|travelers/CredibilityStats' app/ components/ data/ --include='*.tsx' --include='*.ts'`

If only `user/[id].tsx` imported them (which we already changed), these files are now orphaned.

**Step 2: Full TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | grep -v 'scripts/' | grep -v 'supabase/' | head -30`

Fix any errors introduced by our changes.

**Step 3: Don't delete old components yet**

Keep `ProfileTripCard.tsx` and `CredibilityStats.tsx` in `components/travelers/` — they're small files and removing them is a separate cleanup PR.

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: fix any TypeScript errors from profile page redesign"
```
