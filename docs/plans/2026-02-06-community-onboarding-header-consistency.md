# Community Onboarding & Header Consistency Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a first-time Community experience (intro banner, Sola Team seed posts, guided composer) and make the header consistent across all 5 tabs with unified inbox access.

**Architecture:** Two parallel workstreams — (1) header centralization using `AppHeader` + a new `InboxButton` component across all tabs, and (2) community onboarding via Supabase profile flags + AsyncStorage cache + a `useCommunityOnboarding` hook. The Sola Team identity is a dedicated system profile row.

**Tech Stack:** React Native, Expo Router, Supabase (migrations + RLS), AsyncStorage, existing design system (`constants/design.ts`)

---

### Task 1: Create the InboxButton shared component

**Files:**
- Create: `components/InboxButton.tsx`

**Step 1: Create InboxButton component**

```tsx
// components/InboxButton.tsx
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/design';

export default function InboxButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/home/dm')}
      hitSlop={12}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel="Messages"
    >
      <Image
        source={require('@/assets/images/icons/icon-inbox.png')}
        style={styles.icon}
        contentFit="contain"
        tintColor={colors.orange}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 22,
    height: 22,
  },
});
```

**Step 2: Commit**

```bash
git add components/InboxButton.tsx
git commit -m "feat: add shared InboxButton component"
```

---

### Task 2: Update Explore tab header to use InboxButton

**Files:**
- Modify: `app/(tabs)/explore/index.tsx`

**Step 1: Replace the 3 inline inbox pressables with InboxButton**

In `app/(tabs)/explore/index.tsx`, the inbox icon is duplicated in 3 places (loading state line ~293, error state line ~329, main state line ~362). Replace all 3 `rightComponent` blocks with:

```tsx
import InboxButton from '@/components/InboxButton';

// In all 3 AppHeader usages:
rightComponent={<InboxButton />}
```

Remove the now-unused `headerAction` and `headerIcon` styles from this file's StyleSheet.

**Step 2: Commit**

```bash
git add app/(tabs)/explore/index.tsx
git commit -m "refactor: use shared InboxButton in Explore tab"
```

---

### Task 3: Update Travelers (home) tab header — remove logo, add title, use InboxButton

**Files:**
- Modify: `app/(tabs)/home/index.tsx`

**Step 1: Replace logo+inbox header with title+InboxButton**

Change the AppHeader from:
```tsx
<AppHeader
  title=""
  leftComponent={
    <Image
      source={require('@/assets/images/sola-logo.png')}
      style={styles.headerLogo}
      contentFit="contain"
    />
  }
  rightComponent={
    <Pressable
      onPress={() => {
        posthog.capture('inbox_opened');
        router.push('/home/dm');
      }}
      hitSlop={12}
      style={styles.headerAction}
      accessibilityRole="button"
      accessibilityLabel="Messages"
    >
      <Image
        source={require('@/assets/images/icons/icon-inbox.png')}
        style={styles.headerIcon}
        contentFit="contain"
        tintColor={colors.orange}
      />
    </Pressable>
  }
/>
```

To:
```tsx
<AppHeader
  title="Travelers"
  rightComponent={<InboxButton />}
/>
```

Add import for InboxButton. Remove the `Image` import from `expo-image` if no longer used elsewhere in this file (it IS still used for TravelerCard but that's in a separate component — check). Remove the `headerLogo`, `headerAction`, `headerIcon` styles.

**Step 2: Commit**

```bash
git add app/(tabs)/home/index.tsx
git commit -m "refactor: Travelers tab uses text title + shared InboxButton"
```

---

### Task 4: Update Community tab header — switch to AppHeader with InboxButton

**Files:**
- Modify: `app/(tabs)/community/index.tsx`

**Step 1: Replace custom header with AppHeader**

Currently Community uses a raw `<Text style={styles.screenTitle}>Community</Text>` at line 505. Replace with:

```tsx
import AppHeader from '@/components/AppHeader';
import InboxButton from '@/components/InboxButton';
```

In the JSX, replace:
```tsx
{/* Header */}
<Text style={styles.screenTitle}>Community</Text>
```

With:
```tsx
<AppHeader
  title="Community"
  rightComponent={<InboxButton />}
/>
```

Remove the `screenTitle` style from the StyleSheet. Also remove the manual `paddingTop: insets.top` on the container — AppHeader handles safe area via AppScreen. Wrap the container in `<AppScreen>` instead of a plain `<View>` with insets, matching the pattern used by Explore, Trips, and Profile. This means:

1. Import `AppScreen` from `@/components/AppScreen`
2. Replace `<View style={[styles.container, { paddingTop: insets.top }]}>` with `<AppScreen>`
3. Remove the `useSafeAreaInsets` call at the top of `CommunityHome` (still needed by bottom sheets — check if sheets use their own `useSafeAreaInsets` calls... they do, so the top-level one can go)
4. Update closing tag from `</View>` to `</AppScreen>`

**Step 2: Commit**

```bash
git add app/(tabs)/community/index.tsx
git commit -m "refactor: Community tab uses AppHeader + InboxButton for consistency"
```

---

### Task 5: Update Trips tab header — add InboxButton alongside existing add button

**Files:**
- Modify: `app/(tabs)/trips/index.tsx`

**Step 1: Add InboxButton to Trips header**

The Trips header currently has an add button as rightComponent. We need both the inbox icon and the add button. Change:

```tsx
<AppHeader
  title="Trips"
  rightComponent={
    <Pressable
      style={styles.addButton}
      onPress={() => {
        posthog.capture('add_trip_tapped');
        router.push('/trips/new');
      }}
    >
      <Ionicons name="add" size={22} color={colors.orange} />
    </Pressable>
  }
/>
```

To:
```tsx
<AppHeader
  title="Trips"
  rightComponent={
    <View style={styles.headerRight}>
      <InboxButton />
      <Pressable
        style={styles.addButton}
        onPress={() => {
          posthog.capture('add_trip_tapped');
          router.push('/trips/new');
        }}
      >
        <Ionicons name="add" size={22} color={colors.orange} />
      </Pressable>
    </View>
  }
/>
```

Add import for InboxButton and View. Add style:
```tsx
headerRight: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.xs,
},
```

**Step 2: Commit**

```bash
git add app/(tabs)/trips/index.tsx
git commit -m "feat: add InboxButton to Trips tab header"
```

---

### Task 6: Verify Profile tab (no changes needed)

**Files:**
- Read: `app/(tabs)/profile/index.tsx` (already read — confirmed)

Profile already uses `AppHeader` with title "Profile" and a settings gear as rightComponent. No inbox icon needed here per design. **No code changes.**

---

### Task 7: Supabase migration — add profile columns + Sola Team profile + is_seed column

**Files:**
- Create: `supabase/migrations/20260206_community_onboarding.sql`

**Step 1: Write the migration**

```sql
-- ============================================================
-- MIGRATION: Community onboarding flags + Sola Team profile
-- ============================================================

-- 1. Add onboarding flags to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS has_seen_community_intro boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_created_first_post boolean NOT NULL DEFAULT false;

-- 2. Add is_seed flag to community_threads
ALTER TABLE community_threads
  ADD COLUMN IF NOT EXISTS is_seed boolean NOT NULL DEFAULT false;

-- 3. Create Sola Team system profile
-- Uses a well-known UUID so seed data can reference it deterministically.
INSERT INTO profiles (id, first_name, avatar_url)
VALUES ('00000000-0000-0000-0000-000000000000', 'Sola Team', NULL)
ON CONFLICT (id) DO NOTHING;
```

Note: The `profiles` table references `auth.users(id)`. We need the Sola Team profile to exist without a corresponding auth user. Check if the FK constraint allows this — if `profiles.id` has a FK to `auth.users(id)`, this INSERT will fail. In that case, we need to either:
- Insert a dummy auth.users row (not ideal)
- Or remove the FK constraint from profiles for this row (not ideal either)
- Or use an `author_type` approach instead

**Important:** Check the profiles table definition first. If there's a FK to auth.users, the simplest workaround is to add an `author_type` column to `community_threads` instead:

```sql
-- Alternative approach if FK prevents system profile:
ALTER TABLE community_threads
  ADD COLUMN IF NOT EXISTS author_type text NOT NULL DEFAULT 'user'
    CHECK (author_type IN ('user', 'system'));
```

Then display "Sola Team" in the UI when `author_type = 'system'`. The implementer should check the profiles table FK first and choose the right approach.

**Step 2: Commit**

```bash
git add supabase/migrations/20260206_community_onboarding.sql
git commit -m "feat: migration for community onboarding flags + Sola Team identity"
```

---

### Task 8: Update seed data — Sola Team author + is_seed flag

**Files:**
- Modify: `supabase/migrations/20260205_seed_community_threads.sql`

**Step 1: Update the seed migration**

Replace `demo_author` references with the Sola Team approach. Two scenarios:

**If system profile approach works (no FK issue):**
- Replace `SELECT id INTO demo_author FROM profiles LIMIT 1;` with `demo_author := '00000000-0000-0000-0000-000000000000'::uuid;`
- Add `is_seed` to all INSERT statements: `, is_seed` in column list and `, true` in values

**If author_type approach is used:**
- Keep `demo_author` as-is (still needed for FK)
- Add `, author_type` column and `, 'system'` value to all INSERT statements
- Add `, is_seed` and `, true` as well

**Step 2: Commit**

```bash
git add supabase/migrations/20260205_seed_community_threads.sql
git commit -m "feat: update seed data with Sola Team identity and is_seed flag"
```

---

### Task 9: Update community types for Sola Team display

**Files:**
- Modify: `data/community/types.ts`

**Step 1: Add author_type to ThreadWithAuthor and ReplyWithAuthor**

In `ThreadWithAuthor.author`, add:
```typescript
authorType?: 'user' | 'system';
```

In `CommunityThread`, add:
```typescript
authorType: string;
isSeed: boolean;
```

**Step 2: Commit**

```bash
git add data/community/types.ts
git commit -m "feat: add authorType and isSeed to community types"
```

---

### Task 10: Update communityApi to return authorType

**Files:**
- Modify: `data/community/communityApi.ts`

**Step 1: Update getThreadFeed and getThread**

In the mapping function inside `getThreadFeed` (around line 96), add to the author object:
```typescript
authorType: row.author_type ?? 'user',
```

Do the same in `getThread` (around line 134).

Similarly, add `isSeed: row.is_seed ?? false` to the mapped thread object.

**Step 2: Commit**

```bash
git add data/community/communityApi.ts
git commit -m "feat: return authorType and isSeed from community API"
```

---

### Task 11: Create useCommunityOnboarding hook

**Files:**
- Create: `data/community/useCommunityOnboarding.ts`

**Step 1: Write the hook**

```typescript
/**
 * Hook to manage first-time Community experience state.
 * Reads from AsyncStorage (fast) with Supabase as source of truth.
 */

import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/state/AuthContext';

const KEYS = {
  SEEN_INTRO: '@sola:has_seen_community_intro',
  FIRST_POST: '@sola:has_created_first_post',
};

interface UseCommunityOnboardingReturn {
  showIntroBanner: boolean;
  showGuidedComposer: boolean;
  dismissIntro: () => void;
  markFirstPost: () => void;
  loading: boolean;
}

export function useCommunityOnboarding(): UseCommunityOnboardingReturn {
  const { userId } = useAuth();
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean | null>(null);
  const [hasCreatedFirstPost, setHasCreatedFirstPost] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    loadFlags(userId);
  }, [userId]);

  async function loadFlags(uid: string) {
    try {
      // Try AsyncStorage first (fast)
      const [cachedIntro, cachedPost] = await Promise.all([
        AsyncStorage.getItem(KEYS.SEEN_INTRO),
        AsyncStorage.getItem(KEYS.FIRST_POST),
      ]);

      if (cachedIntro !== null && cachedPost !== null) {
        setHasSeenIntro(cachedIntro === 'true');
        setHasCreatedFirstPost(cachedPost === 'true');
        setLoading(false);
        return;
      }

      // Fall back to Supabase
      const { data } = await supabase
        .from('profiles')
        .select('has_seen_community_intro, has_created_first_post')
        .eq('id', uid)
        .single();

      const seenIntro = data?.has_seen_community_intro ?? false;
      const firstPost = data?.has_created_first_post ?? false;

      setHasSeenIntro(seenIntro);
      setHasCreatedFirstPost(firstPost);

      // Cache locally
      await Promise.all([
        AsyncStorage.setItem(KEYS.SEEN_INTRO, String(seenIntro)),
        AsyncStorage.setItem(KEYS.FIRST_POST, String(firstPost)),
      ]);
    } catch {
      // Default to not showing onboarding if we can't determine state
      setHasSeenIntro(true);
      setHasCreatedFirstPost(true);
    } finally {
      setLoading(false);
    }
  }

  const dismissIntro = useCallback(async () => {
    setHasSeenIntro(true);
    try {
      await Promise.all([
        AsyncStorage.setItem(KEYS.SEEN_INTRO, 'true'),
        userId
          ? supabase
              .from('profiles')
              .update({ has_seen_community_intro: true })
              .eq('id', userId)
          : Promise.resolve(),
      ]);
    } catch {
      // Best-effort — local state already updated
    }
  }, [userId]);

  const markFirstPost = useCallback(async () => {
    setHasCreatedFirstPost(true);
    setHasSeenIntro(true); // Also dismiss intro on first post
    try {
      await Promise.all([
        AsyncStorage.setItem(KEYS.FIRST_POST, 'true'),
        AsyncStorage.setItem(KEYS.SEEN_INTRO, 'true'),
        userId
          ? supabase
              .from('profiles')
              .update({
                has_created_first_post: true,
                has_seen_community_intro: true,
              })
              .eq('id', userId)
          : Promise.resolve(),
      ]);
    } catch {
      // Best-effort
    }
  }, [userId]);

  return {
    showIntroBanner: loading ? false : hasSeenIntro === false,
    showGuidedComposer: loading ? false : hasCreatedFirstPost === false,
    dismissIntro,
    markFirstPost,
    loading,
  };
}
```

**Step 2: Commit**

```bash
git add data/community/useCommunityOnboarding.ts
git commit -m "feat: add useCommunityOnboarding hook with AsyncStorage + Supabase"
```

---

### Task 12: Add intro banner + Sola Team badge to Community index

**Files:**
- Modify: `app/(tabs)/community/index.tsx`

**Step 1: Add intro banner to the feed**

Import the onboarding hook:
```tsx
import { useCommunityOnboarding } from '@/data/community/useCommunityOnboarding';
```

In `CommunityHome`, add:
```tsx
const { showIntroBanner, dismissIntro } = useCommunityOnboarding();
```

Add an `IntroBanner` component above the FlatList (inside the ListHeaderComponent):

```tsx
function IntroBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <View style={styles.introBanner}>
      <View style={styles.introBannerContent}>
        <Text style={styles.introBannerTitle}>Real questions from women traveling solo.</Text>
        <Text style={styles.introBannerSubtitle}>Ask anything — safety, stays, transport, experiences.</Text>
      </View>
      <Pressable onPress={onDismiss} hitSlop={8} style={styles.introBannerClose}>
        <Feather name="x" size={16} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}
```

Styles:
```tsx
introBanner: {
  flexDirection: 'row',
  backgroundColor: colors.orangeFill,
  borderRadius: radius.card,
  padding: spacing.lg,
  marginBottom: spacing.lg,
},
introBannerContent: {
  flex: 1,
},
introBannerTitle: {
  fontFamily: fonts.medium,
  fontSize: 15,
  color: colors.textPrimary,
  lineHeight: 21,
},
introBannerSubtitle: {
  fontFamily: fonts.regular,
  fontSize: 14,
  color: colors.textSecondary,
  lineHeight: 20,
  marginTop: 4,
},
introBannerClose: {
  padding: spacing.xs,
  marginLeft: spacing.sm,
},
```

In the FlatList's `ListHeaderComponent`, prepend the banner:
```tsx
const ListHeader = (
  <View>
    {showIntroBanner && <IntroBanner onDismiss={dismissIntro} />}
    {/* existing search bar + filter row */}
    ...
  </View>
);
```

**Step 2: Update ThreadCard to show Sola Team badge**

In the `ThreadCard` component, add a "TEAM" badge next to the author name when `thread.authorType === 'system'`:

```tsx
<View style={styles.threadFooter}>
  <View style={styles.authorRow}>
    <Text style={styles.threadAuthor}>
      {thread.authorType === 'system' ? 'Sola Team' : thread.author.firstName}
    </Text>
    {thread.authorType === 'system' && (
      <Text style={styles.teamBadge}>TEAM</Text>
    )}
  </View>
  <View style={styles.threadStats}>
    {/* existing stats */}
  </View>
</View>
```

Styles:
```tsx
authorRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
},
teamBadge: {
  fontFamily: fonts.medium,
  fontSize: 10,
  color: colors.textSecondary,
  backgroundColor: colors.neutralFill,
  paddingHorizontal: 6,
  paddingVertical: 1,
  borderRadius: 6,
  overflow: 'hidden',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
},
```

**Step 3: Remove the old WelcomeState component**

Remove the entire `WelcomeState` function (lines 325-411), the `EXAMPLE_PROMPTS` array (lines 314-319), and all related styles (`welcome`, `welcomeHero`, `welcomeTitle`, `welcomeSubtitle`, `howItWorks`, `howStep`, `howIcon`, `howText`, `howStepTitle`, `howStepBody`, `promptsLabel`, `promptsGrid`, `promptCard`, `promptText`, `topicRow`, `topicChip`, `topicChipText`, `welcomeCta`, `welcomeCtaPressed`, `welcomeCtaText`).

Update the `ListEmptyComponent` to show just a loading indicator (since seeded posts should always exist):
```tsx
ListEmptyComponent={
  loading ? (
    <ActivityIndicator style={styles.loader} color={colors.orange} />
  ) : null
}
```

**Step 4: Always show the FAB**

Remove the `{hasThreads && ...}` conditional wrapper around the FAB — it should always be visible since seeded posts are always present:

```tsx
<Pressable
  onPress={() => router.push('/(tabs)/community/new')}
  style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
>
  <Feather name="edit-3" size={20} color="#FFFFFF" />
  <Text style={styles.fabText}>Ask</Text>
</Pressable>
```

Also always render the `ListHeader` (remove the `const hasThreads = threads.length > 0;` check and the `hasThreads ? (...) : null` conditional on ListHeader).

**Step 5: Commit**

```bash
git add app/(tabs)/community/index.tsx
git commit -m "feat: add intro banner, Sola Team badge, remove old welcome state"
```

---

### Task 13: Add Sola Team badge to thread detail screen

**Files:**
- Modify: `app/(tabs)/community/thread/[id].tsx`

**Step 1: Update author display in thread detail**

In the `ThreadHeader` JSX, update the author name display (around line 207):

```tsx
<Text style={styles.authorName}>
  {thread.authorType === 'system' ? 'Sola Team' : thread.author.firstName}
</Text>
{thread.authorType === 'system' && (
  <Text style={styles.teamBadge}>TEAM</Text>
)}
```

Add the `teamBadge` style (same as in Task 12).

Also update the avatar for system authors — show an orange "S" instead of the normal avatar logic:

```tsx
{thread.authorType === 'system' ? (
  <View style={[styles.avatar, styles.avatarSolaTeam]}>
    <Text style={styles.avatarSolaTeamInitial}>S</Text>
  </View>
) : thread.author.avatarUrl ? (
  <Image source={{ uri: thread.author.avatarUrl }} style={styles.avatar} />
) : (
  <View style={[styles.avatar, styles.avatarPlaceholder]}>
    <Text style={styles.avatarInitial}>{thread.author.firstName?.charAt(0) ?? '?'}</Text>
  </View>
)}
```

Add styles:
```tsx
avatarSolaTeam: {
  backgroundColor: colors.orangeFill,
  alignItems: 'center',
  justifyContent: 'center',
},
avatarSolaTeamInitial: {
  fontFamily: fonts.semiBold,
  fontSize: 12,
  color: colors.orange,
},
teamBadge: {
  fontFamily: fonts.medium,
  fontSize: 10,
  color: colors.textSecondary,
  backgroundColor: colors.neutralFill,
  paddingHorizontal: 6,
  paddingVertical: 1,
  borderRadius: 6,
  overflow: 'hidden',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
},
```

**Step 2: Do the same for reply cards**

In the `ReplyCard` component, add system author handling for replies too. Check `reply.authorType` in the same way.

Note: `ReplyWithAuthor` currently doesn't have `authorType`. Since all seed replies also come from the system account, we can check if `reply.authorId === '00000000-0000-0000-0000-000000000000'` or add `authorType` to the reply type as well. The cleaner approach is adding it to the reply type — update `communityApi.ts`'s `getThreadReplies` to include `author_type` from the thread's author or determine it from the author_id.

Actually, replies don't have `author_type` — that's on threads. For replies, check if the author ID matches the Sola Team UUID:

```tsx
const SOLA_TEAM_ID = '00000000-0000-0000-0000-000000000000';

// In ReplyCard:
const isTeam = reply.authorId === SOLA_TEAM_ID;
```

**Step 3: Commit**

```bash
git add app/(tabs)/community/thread/[id].tsx
git commit -m "feat: Sola Team badge + avatar in thread detail and replies"
```

---

### Task 14: Add guided first-post experience to new thread screen

**Files:**
- Modify: `app/(tabs)/community/new.tsx`

**Step 1: Import and use the onboarding hook**

```tsx
import { useCommunityOnboarding } from '@/data/community/useCommunityOnboarding';
```

In `NewThread`:
```tsx
const { showGuidedComposer, markFirstPost } = useCommunityOnboarding();
```

**Step 2: Update placeholders based on showGuidedComposer**

Change title input placeholder:
```tsx
placeholder={showGuidedComposer
  ? "e.g. Is it safe to walk alone at night in Medellín?"
  : "What's your question?"}
```

Change body input placeholder:
```tsx
placeholder={showGuidedComposer
  ? "Share context — where you're going, what you need help with"
  : "Add details to help others understand your question..."}
```

**Step 3: Add first-time info line below body input**

Below the body `<TextInput>`, add:
```tsx
{showGuidedComposer && (
  <Text style={styles.guidedHint}>
    Your question will be visible to women traveling to this place
  </Text>
)}
```

Style:
```tsx
guidedHint: {
  fontFamily: fonts.regular,
  fontSize: 13,
  color: colors.textMuted,
  lineHeight: 18,
  marginBottom: spacing.xl,
  marginTop: -spacing.md, // pull up closer to body input
},
```

**Step 4: Call markFirstPost on successful submission**

In `handleSubmit`, after `router.replace(...)`, call `markFirstPost()`:

```tsx
const handleSubmit = useCallback(async () => {
  if (!userId || !canSubmit) return;
  setSubmitting(true);
  try {
    const threadId = await createThread(userId, {
      title: title.trim(),
      body: body.trim(),
      countryId: selectedCountryId,
      cityId: selectedCityId,
      topicId: selectedTopicId,
    });
    markFirstPost();
    router.replace(`/(tabs)/community/thread/${threadId}`);
  } catch {
    Alert.alert('Error', 'Could not create thread. Please try again.');
  } finally {
    setSubmitting(false);
  }
}, [userId, canSubmit, title, body, selectedCountryId, selectedCityId, selectedTopicId, router, markFirstPost]);
```

**Step 5: Commit**

```bash
git add app/(tabs)/community/new.tsx
git commit -m "feat: guided first-post experience with contextual placeholders"
```

---

### Task 15: Manual verification

**Step 1: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(components/|app/|data/)' | head -30
```

Expected: No new errors from our changes.

**Step 2: Start the dev server and verify visually**

```bash
npx expo start
```

Check all 5 tabs:
- **Explore**: Logo left, InboxButton right — unchanged visually
- **Community**: "Community" title left, InboxButton right, intro banner visible (first time), seeded posts with "Sola Team" + TEAM badge
- **Trips**: "Trips" title left, InboxButton + add button right
- **Travelers**: "Travelers" title left, InboxButton right (logo removed)
- **Profile**: "Profile" title left, settings gear right (no inbox — correct)

Check Community flows:
- Tap X on intro banner → disappears, doesn't come back on re-visit
- Tap Ask FAB → guided composer with longer placeholders + hint text
- Submit a post → markFirstPost fires, subsequent posts show normal placeholders
- Seeded threads show "Sola Team" name + orange S avatar + gray TEAM badge
- Thread detail shows same Sola Team treatment for both thread author and replies

**Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: address issues found during manual verification"
```

---

### Task 16: Final commit — update MEMORY.md

**Files:**
- Modify: `/Users/bokangsibolla/.claude/projects/-Users-bokangsibolla-sola-backup-sola/memory/MEMORY.md`

Add to the memory file:

```
## Header System (Implemented)
- Explore: logo left + InboxButton right
- Community, Trips, Travelers: text title + InboxButton right
- Profile: text title + settings gear right
- InboxButton: shared component at `components/InboxButton.tsx`
- All tabs use AppHeader — no custom headers

## Community Onboarding (Implemented)
- Supabase flags: has_seen_community_intro, has_created_first_post on profiles
- AsyncStorage cache: @sola:has_seen_community_intro, @sola:has_created_first_post
- Hook: `data/community/useCommunityOnboarding.ts`
- Sola Team profile UUID: 00000000-0000-0000-0000-000000000000
- Seed threads have is_seed=true, author_type='system'
- Old WelcomeState component removed — replaced by intro banner + seeded posts
```

---

## Summary of all files changed

**New files:**
- `components/InboxButton.tsx`
- `data/community/useCommunityOnboarding.ts`
- `supabase/migrations/20260206_community_onboarding.sql`

**Modified files:**
- `app/(tabs)/explore/index.tsx` — use InboxButton
- `app/(tabs)/home/index.tsx` — text title + InboxButton, remove logo
- `app/(tabs)/community/index.tsx` — AppHeader + InboxButton, intro banner, team badge, remove WelcomeState
- `app/(tabs)/trips/index.tsx` — add InboxButton alongside add button
- `app/(tabs)/community/new.tsx` — guided first-post placeholders + hint
- `app/(tabs)/community/thread/[id].tsx` — Sola Team avatar + badge
- `data/community/types.ts` — add authorType, isSeed fields
- `data/community/communityApi.ts` — return authorType and isSeed
- `supabase/migrations/20260205_seed_community_threads.sql` — Sola Team author + is_seed flag
