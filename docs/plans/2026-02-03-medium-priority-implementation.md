# Medium Priority Tooling Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add image CDN transforms, API pagination with infinite scroll, and PostHog analytics before launch.

**Architecture:** Utility-first — small helpers (`lib/image.ts`, `hooks/usePaginatedData.ts`) consumed by existing screens. PostHog wraps the app at the provider level. All changes are additive — no breaking changes to existing APIs (pagination params are optional with defaults).

**Tech Stack:** Supabase Storage Transforms, React Query `useInfiniteQuery`, `posthog-react-native`

---

## Task 1: Image CDN Helper

**Files:**
- Create: `lib/image.ts`
- Test: `__tests__/image.test.ts`

**Step 1: Write the failing test**

```typescript
// __tests__/image.test.ts
import { getImageUrl } from '../lib/image';

describe('getImageUrl', () => {
  it('appends width and height to a supabase storage URL', () => {
    const url = 'https://xyz.supabase.co/storage/v1/object/public/avatars/123/avatar.jpg';
    const result = getImageUrl(url, { width: 96, height: 96 });
    expect(result).toBe(
      'https://xyz.supabase.co/storage/v1/render/image/public/avatars/123/avatar.jpg?width=96&height=96'
    );
  });

  it('appends only width when height is omitted', () => {
    const url = 'https://xyz.supabase.co/storage/v1/object/public/avatars/123/avatar.jpg';
    const result = getImageUrl(url, { width: 200 });
    expect(result).toBe(
      'https://xyz.supabase.co/storage/v1/render/image/public/avatars/123/avatar.jpg?width=200'
    );
  });

  it('returns the original URL if not a supabase storage URL', () => {
    const url = 'https://example.com/photo.jpg';
    const result = getImageUrl(url, { width: 96 });
    expect(result).toBe('https://example.com/photo.jpg');
  });

  it('returns the original URL if null or empty', () => {
    expect(getImageUrl(null, { width: 96 })).toBeNull();
    expect(getImageUrl('', { width: 96 })).toBe('');
  });

  it('preserves existing query params like cache busters', () => {
    const url = 'https://xyz.supabase.co/storage/v1/object/public/avatars/123/avatar.jpg?t=1234';
    const result = getImageUrl(url, { width: 96, height: 96 });
    expect(result).toBe(
      'https://xyz.supabase.co/storage/v1/render/image/public/avatars/123/avatar.jpg?t=1234&width=96&height=96'
    );
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx jest __tests__/image.test.ts --no-coverage`
Expected: FAIL — `Cannot find module '../lib/image'`

**Step 3: Write minimal implementation**

```typescript
// lib/image.ts

/**
 * Convert a Supabase Storage object URL to a render/image URL with transforms.
 * Supabase image transforms require swapping /object/ for /render/image/ in the path.
 * Non-Supabase URLs are returned unchanged.
 */
export function getImageUrl(
  url: string | null | undefined,
  opts: { width?: number; height?: number }
): string | null | undefined {
  if (!url) return url as null | undefined;

  const OBJECT_PATH = '/storage/v1/object/public/';
  const RENDER_PATH = '/storage/v1/render/image/public/';

  if (!url.includes(OBJECT_PATH)) return url;

  // Swap object → render/image
  const [base, query] = url.split('?');
  const transformed = base.replace(OBJECT_PATH, RENDER_PATH);

  const params = new URLSearchParams(query || '');
  if (opts.width) params.set('width', String(opts.width));
  if (opts.height) params.set('height', String(opts.height));

  return `${transformed}?${params.toString()}`;
}
```

**Step 4: Run test to verify it passes**

Run: `npx jest __tests__/image.test.ts --no-coverage`
Expected: PASS (5/5)

**Step 5: Commit**

```bash
git add lib/image.ts __tests__/image.test.ts
git commit -m "feat: add image CDN helper for Supabase Storage transforms"
```

---

## Task 2: Wire Image CDN into Avatar Rendering

**Files:**
- Modify: `app/(tabs)/home/index.tsx` (line 82)
- Modify: `app/(tabs)/home/dm/index.tsx` (line 86)
- Modify: `app/(tabs)/home/user/[id].tsx` (line 63-64)
- Modify: `app/(tabs)/profile/index.tsx` (line 56-62)

**Step 1: Update home screen avatars (48px)**

In `app/(tabs)/home/index.tsx`, add import and change avatar Image:

```typescript
// Add import at top
import { getImageUrl } from '@/lib/image';

// Change line 82 from:
//   <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
// To:
<Image source={{ uri: getImageUrl(profile.avatarUrl, { width: 96, height: 96 })! }} style={styles.avatar} />
```

Note: `width: 96` = 2x for 48px display (retina).

**Step 2: Update DM list avatars (40px)**

In `app/(tabs)/home/dm/index.tsx`, add import and change avatar Image:

```typescript
import { getImageUrl } from '@/lib/image';

// Change line 86 from:
//   <Image source={{ uri: other.avatarUrl }} style={styles.avatar} />
// To:
<Image source={{ uri: getImageUrl(other.avatarUrl, { width: 80, height: 80 })! }} style={styles.avatar} />
```

**Step 3: Update user profile screen avatar**

In `app/(tabs)/home/user/[id].tsx`, add import and change avatar Image:

```typescript
import { getImageUrl } from '@/lib/image';

// Change the avatar Image source from profile.avatarUrl to:
getImageUrl(profile.avatarUrl, { width: 160, height: 160 })!
```

**Step 4: Update own profile screen avatar**

In `app/(tabs)/profile/index.tsx`, add import and change avatar Image:

```typescript
import { getImageUrl } from '@/lib/image';

// Change the avatar Image source from profile.avatarUrl to:
getImageUrl(profile.avatarUrl, { width: 160, height: 160 })!
```

**Step 5: Commit**

```bash
git add app/(tabs)/home/index.tsx app/(tabs)/home/dm/index.tsx app/(tabs)/home/user/[id].tsx app/(tabs)/profile/index.tsx
git commit -m "feat: serve avatars via Supabase image CDN at correct sizes"
```

---

## Task 3: Paginated API Functions

**Files:**
- Modify: `data/types.ts` — add `PaginatedResult` type
- Modify: `data/api.ts` — add paginated variants of 4 functions
- Test: `__tests__/pagination.test.ts`

**Step 1: Write the failing test**

```typescript
// __tests__/pagination.test.ts
import { buildRange } from '../data/api';

describe('buildRange', () => {
  it('returns correct from/to for page 0', () => {
    expect(buildRange(0, 20)).toEqual({ from: 0, to: 19 });
  });

  it('returns correct from/to for page 2', () => {
    expect(buildRange(2, 20)).toEqual({ from: 40, to: 59 });
  });

  it('uses custom page size', () => {
    expect(buildRange(1, 10)).toEqual({ from: 10, to: 19 });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx jest __tests__/pagination.test.ts --no-coverage`
Expected: FAIL — `buildRange` not found

**Step 3: Add PaginatedResult type and buildRange helper**

In `data/types.ts`, append at bottom:

```typescript
export interface PaginatedResult<T> {
  data: T[];
  hasMore: boolean;
}
```

In `data/api.ts`, add and export the helper:

```typescript
export function buildRange(page: number, pageSize: number) {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}
```

**Step 4: Run test to verify it passes**

Run: `npx jest __tests__/pagination.test.ts --no-coverage`
Expected: PASS (3/3)

**Step 5: Add paginated API functions**

In `data/api.ts`, add these new functions (keep the old unpaginated ones intact for backwards compat):

```typescript
const DEFAULT_PAGE_SIZE = 20;

export async function getProfilesPaginated(
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<Profile>> {
  const { from, to } = buildRange(page, pageSize);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .range(from, to + 1); // fetch 1 extra to detect hasMore
  if (error) throw error;
  const hasMore = (data?.length ?? 0) > pageSize;
  const rows = (data || []).slice(0, pageSize);
  return { data: rowsToCamel<Profile>(rows), hasMore };
}

export async function getConversationsPaginated(
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<Conversation>> {
  const { from, to } = buildRange(page, pageSize);
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false })
    .range(from, to + 1);
  if (error) throw error;
  const hasMore = (data?.length ?? 0) > pageSize;
  const rows = (data || []).slice(0, pageSize);
  return { data: rowsToCamel<Conversation>(rows), hasMore };
}

export async function getMessagesPaginated(
  conversationId: string,
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<Message>> {
  const { from, to } = buildRange(page, pageSize);
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(from, to + 1);
  if (error) throw error;
  const hasMore = (data?.length ?? 0) > pageSize;
  const rows = (data || []).slice(0, pageSize);
  return { data: rowsToCamel<Message>(rows), hasMore };
}

export async function getPlacesByCityPaginated(
  cityId: string,
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<Place>> {
  const { from, to } = buildRange(page, pageSize);
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('city_id', cityId)
    .range(from, to + 1);
  if (error) throw error;
  const hasMore = (data?.length ?? 0) > pageSize;
  const rows = (data || []).slice(0, pageSize);
  return { data: rowsToCamel<Place>(rows), hasMore };
}
```

Add the `PaginatedResult` import at the top of `data/api.ts`:

```typescript
import type { ..., PaginatedResult } from './types';
```

**Step 6: Commit**

```bash
git add data/types.ts data/api.ts __tests__/pagination.test.ts
git commit -m "feat: add paginated API functions with buildRange helper"
```

---

## Task 4: usePaginatedData Hook

**Files:**
- Create: `hooks/usePaginatedData.ts`

**Step 1: Write the hook**

```typescript
// hooks/usePaginatedData.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import type { PaginatedResult } from '@/data/types';

interface UsePaginatedDataOptions<T> {
  queryKey: string[];
  fetcher: (page: number) => Promise<PaginatedResult<T>>;
  enabled?: boolean;
}

export function usePaginatedData<T>({ queryKey, fetcher, enabled = true }: UsePaginatedDataOptions<T>) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 0 }) => fetcher(pageParam),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length : undefined,
    initialPageParam: 0,
    enabled,
    staleTime: 30_000,
  });

  const data = query.data?.pages.flatMap((p) => p.data) ?? [];

  return {
    data,
    loading: query.isLoading,
    error: query.error,
    fetchMore: query.fetchNextPage,
    hasMore: query.hasNextPage ?? false,
    isFetchingMore: query.isFetchingNextPage,
    refetch: query.refetch,
  };
}
```

**Step 2: Commit**

```bash
git add hooks/usePaginatedData.ts
git commit -m "feat: add usePaginatedData hook wrapping useInfiniteQuery"
```

---

## Task 5: Wire Pagination into Home Screen (Traveler Feed)

**Files:**
- Modify: `app/(tabs)/home/index.tsx`

**Step 1: Replace useData + getProfiles with usePaginatedData + getProfilesPaginated**

```typescript
// Replace:
import { getProfiles, ... } from '@/data/api';
import { useData } from '@/hooks/useData';

// With:
import { getProfilesPaginated, ... } from '@/data/api';
import { usePaginatedData } from '@/hooks/usePaginatedData';
```

Replace the data fetching (around lines 22-30):

```typescript
// Replace the useData call with:
const { data: allProfiles, loading, error, fetchMore, hasMore, isFetchingMore } = usePaginatedData({
  queryKey: ['profiles'],
  fetcher: (page) => getProfilesPaginated(page),
});

const profiles = allProfiles.filter(
  (p) => p.id !== userId && !blockedIds.includes(p.id)
);
```

Replace the `ScrollView` mapping with `FlatList`:

```typescript
<FlatList
  data={profiles}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <ProfileCard profile={item} />}
  onEndReached={() => { if (hasMore) fetchMore(); }}
  onEndReachedThreshold={0.5}
  ListFooterComponent={isFetchingMore ? <ActivityIndicator style={{ padding: 16 }} /> : null}
/>
```

Add `import { FlatList, ActivityIndicator } from 'react-native';` if not already imported.

**Step 2: Verify app compiles**

Run: `npx expo start` and visually check the home screen loads profiles.

**Step 3: Commit**

```bash
git add app/(tabs)/home/index.tsx
git commit -m "feat: paginate traveler feed with infinite scroll"
```

---

## Task 6: Wire Pagination into DM List

**Files:**
- Modify: `app/(tabs)/home/dm/index.tsx`

**Step 1: Replace useData + getConversations with paginated version**

```typescript
import { getConversationsPaginated, ... } from '@/data/api';
import { usePaginatedData } from '@/hooks/usePaginatedData';

const { data: allConvos, loading, error, fetchMore, hasMore, isFetchingMore } = usePaginatedData({
  queryKey: ['conversations'],
  fetcher: (page) => getConversationsPaginated(page),
});

const conversations = allConvos.filter(
  (c) => !blockedIds.includes(c.user1Id) && !blockedIds.includes(c.user2Id)
);
```

Replace `ScrollView` / `map` with `FlatList` + `onEndReached`, same pattern as Task 5.

**Step 2: Commit**

```bash
git add app/(tabs)/home/dm/index.tsx
git commit -m "feat: paginate DM conversation list with infinite scroll"
```

---

## Task 7: Wire Pagination into Message Thread

**Files:**
- Modify: `app/(tabs)/home/dm/[id].tsx`

**Step 1: Replace getMessages with paginated version**

This is an inverted list (newest at bottom, scroll up for older). The existing FlatList already exists — add pagination:

```typescript
import { getMessagesPaginated, ... } from '@/data/api';
import { usePaginatedData } from '@/hooks/usePaginatedData';

const { data: olderMessages, fetchMore, hasMore, isFetchingMore } = usePaginatedData({
  queryKey: ['messages', conversationId],
  fetcher: (page) => getMessagesPaginated(conversationId, page),
  enabled: !!conversationId,
});
```

Keep the real-time messages state. Combine them:

```typescript
const allMessages = [...realtimeMessages, ...olderMessages];
```

On the FlatList, add:

```typescript
onEndReached={() => { if (hasMore) fetchMore(); }}
onEndReachedThreshold={0.3}
```

Since FlatList is `inverted`, `onEndReached` fires when scrolling UP — which is correct for loading older messages.

**Step 2: Commit**

```bash
git add "app/(tabs)/home/dm/[id].tsx"
git commit -m "feat: paginate message thread with scroll-to-load-older"
```

---

## Task 8: Install and Configure PostHog

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `app/_layout.tsx`

**Step 1: Install PostHog**

```bash
npx expo install posthog-react-native
```

**Step 2: Add PostHog provider in `app/_layout.tsx`**

```typescript
// Add import:
import { PostHogProvider } from 'posthog-react-native';

// Wrap inside QueryClientProvider (outermost after QueryClient):
<QueryClientProvider client={queryClient}>
  <PostHogProvider
    apiKey={process.env.EXPO_PUBLIC_POSTHOG_KEY || ''}
    options={{
      host: 'https://us.i.posthog.com',
      enableSessionReplay: false,
    }}
  >
    <AuthProvider>
      ...
    </AuthProvider>
  </PostHogProvider>
</QueryClientProvider>
```

**Step 3: Add env var placeholder**

Add `EXPO_PUBLIC_POSTHOG_KEY=` to `.env` (or `.env.local`). The actual key comes from the PostHog dashboard — leave blank for now, the provider handles empty keys gracefully.

**Step 4: Commit**

```bash
git add app/_layout.tsx package.json
git commit -m "feat: install and configure PostHog analytics provider"
```

---

## Task 9: Add PostHog Event Tracking

**Files:**
- Modify: `app/(tabs)/home/dm/[id].tsx` — `message_sent`
- Modify: `components/SOSButton.tsx` — `sos_tapped`
- Modify: `app/(onboarding)/create-account.tsx` or final onboarding screen — `onboarding_completed`
- Modify: `data/api.ts` — `place_saved` in `toggleSavePlace`

**Step 1: Track message_sent**

In `app/(tabs)/home/dm/[id].tsx`:

```typescript
import { usePostHog } from 'posthog-react-native';

// Inside component:
const posthog = usePostHog();

// In send handler, after successful send:
posthog.capture('message_sent', { conversation_id: conversationId });
```

**Step 2: Track sos_tapped**

In `components/SOSButton.tsx`:

```typescript
import { usePostHog } from 'posthog-react-native';

const posthog = usePostHog();

// When SOS modal opens:
posthog.capture('sos_tapped', { country: trip?.country || 'unknown' });
```

**Step 3: Track onboarding_completed**

In the final onboarding screen (where the user completes signup), add:

```typescript
import { usePostHog } from 'posthog-react-native';

const posthog = usePostHog();

// After account creation succeeds:
posthog.capture('onboarding_completed');
```

**Step 4: Track place_saved**

In `data/api.ts`, the `toggleSavePlace` function — this is trickier since it's not a React component. Instead, track from the screen that calls it. Find the screen that calls `toggleSavePlace` and add tracking there.

Alternatively, skip this one for now and track from UI later.

**Step 5: Identify user after login**

In `app/_layout.tsx` AuthGate component, after getting userId:

```typescript
import { usePostHog } from 'posthog-react-native';

const posthog = usePostHog();

useEffect(() => {
  if (userId) {
    posthog.identify(userId);
  }
}, [userId]);
```

**Step 6: Commit**

```bash
git add "app/(tabs)/home/dm/[id].tsx" components/SOSButton.tsx app/_layout.tsx
git add app/(onboarding)/create-account.tsx  # or whichever onboarding file
git commit -m "feat: add PostHog event tracking for key user actions"
```

---

## Summary

| Task | What | Commit |
|------|------|--------|
| 1 | Image CDN helper + tests | `feat: add image CDN helper` |
| 2 | Wire CDN into avatar rendering | `feat: serve avatars via CDN` |
| 3 | Paginated API functions + tests | `feat: add paginated API functions` |
| 4 | usePaginatedData hook | `feat: add usePaginatedData hook` |
| 5 | Paginate traveler feed | `feat: paginate traveler feed` |
| 6 | Paginate DM list | `feat: paginate DM list` |
| 7 | Paginate message thread | `feat: paginate message thread` |
| 8 | Install + configure PostHog | `feat: configure PostHog` |
| 9 | Add event tracking | `feat: add PostHog tracking` |

9 tasks, 9 commits. Each task is independently testable.
