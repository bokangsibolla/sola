# Together Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the Together feature — a social activity companion discovery system where solo travelers can find people for activities via an "Open Plan" (share from itinerary) or "Looking For" (standalone post) mechanic.

**Architecture:** New data domain at `data/together/` following the established pattern (types → API → hooks). New components at `components/together/`. Together feed lives as a segmented control toggle on the existing `travelers` tab. Detail and creation screens are pushed routes under `app/(tabs)/travelers/together/`. Database tables `together_posts` and `together_requests` with RLS.

**Tech Stack:** React Native, Expo Router, Supabase (Postgres + RLS), React Query via `useData` hook, StyleSheet with design tokens from `constants/design.ts`.

**Design doc:** `docs/plans/2026-02-25-together-feature-design.md`

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260225_together_schema.sql`

**Step 1: Write the migration**

```sql
-- Together: activity companion discovery
-- Two tables: together_posts (the activity listing) and together_requests (join requests)

-- ============================================================
-- together_posts
-- ============================================================
CREATE TABLE IF NOT EXISTS together_posts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id       uuid REFERENCES trips(id) ON DELETE SET NULL,
  post_type     text NOT NULL CHECK (post_type IN ('open_plan', 'looking_for')),
  itinerary_block_id uuid REFERENCES itinerary_blocks(id) ON DELETE SET NULL,
  title         text NOT NULL,
  description   text,
  city_id       bigint REFERENCES cities(id),
  country_iso2  text,
  activity_date date,
  start_time    time,
  end_time      time,
  is_flexible   boolean NOT NULL DEFAULT false,
  activity_category text NOT NULL DEFAULT 'other'
    CHECK (activity_category IN ('food','culture','adventure','nightlife','day_trip','wellness','shopping','other')),
  max_companions int NOT NULL DEFAULT 2 CHECK (max_companions BETWEEN 1 AND 5),
  status        text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','cancelled')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE together_posts ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read open posts
CREATE POLICY "anyone can read open posts"
  ON together_posts FOR SELECT
  USING (
    status = 'open'
    OR user_id = auth.uid()
  );

-- Owner can insert
CREATE POLICY "owner can insert posts"
  ON together_posts FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Owner can update own posts
CREATE POLICY "owner can update own posts"
  ON together_posts FOR UPDATE
  USING (user_id = auth.uid());

-- Owner can delete own posts
CREATE POLICY "owner can delete own posts"
  ON together_posts FOR DELETE
  USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_together_posts_feed
  ON together_posts (city_id, activity_date, status)
  WHERE status = 'open';

CREATE INDEX idx_together_posts_user
  ON together_posts (user_id, status);

-- ============================================================
-- together_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS together_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       uuid NOT NULL REFERENCES together_posts(id) ON DELETE CASCADE,
  requester_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note          text,
  status        text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','declined','cancelled')),
  responded_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, requester_id)
);

ALTER TABLE together_requests ENABLE ROW LEVEL SECURITY;

-- Requester can read own requests; post owner can read requests on their posts
CREATE POLICY "read own requests or requests on own posts"
  ON together_requests FOR SELECT
  USING (
    requester_id = auth.uid()
    OR post_id IN (SELECT id FROM together_posts WHERE user_id = auth.uid())
  );

-- Requester can insert
CREATE POLICY "requester can insert"
  ON together_requests FOR INSERT
  WITH CHECK (requester_id = auth.uid());

-- Requester can cancel own; post owner can accept/decline
CREATE POLICY "requester or post owner can update"
  ON together_requests FOR UPDATE
  USING (
    requester_id = auth.uid()
    OR post_id IN (SELECT id FROM together_posts WHERE user_id = auth.uid())
  );

-- Indexes
CREATE INDEX idx_together_requests_post
  ON together_requests (post_id, status);

CREATE INDEX idx_together_requests_requester
  ON together_requests (requester_id, status);
```

**Step 2: Apply the migration**

```bash
PSQL=/opt/homebrew/Cellar/libpq/18.2/bin/psql
source .env
DB_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.bfyewxgdfkmkviajmfzp.supabase.co:5432/postgres"
$PSQL "$DB_URL" -f supabase/migrations/20260225_together_schema.sql
```

Expected: `CREATE TABLE`, `ALTER TABLE`, `CREATE POLICY`, `CREATE INDEX` — no errors.

**Step 3: Commit**

```bash
git add supabase/migrations/20260225_together_schema.sql
git commit -m "feat(together): add together_posts and together_requests schema"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `data/together/types.ts`

**Step 1: Write types**

Define all TypeScript interfaces for Together. Follow the pattern in `data/trips/types.ts` and `data/community/types.ts`.

```typescript
/* data/together/types.ts */

export type TogetherPostType = 'open_plan' | 'looking_for';
export type TogetherPostStatus = 'open' | 'closed' | 'cancelled';
export type TogetherRequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';
export type ActivityCategory =
  | 'food'
  | 'culture'
  | 'adventure'
  | 'nightlife'
  | 'day_trip'
  | 'wellness'
  | 'shopping'
  | 'other';

export interface TogetherPost {
  id: string;
  userId: string;
  tripId: string | null;
  postType: TogetherPostType;
  itineraryBlockId: string | null;
  title: string;
  description: string | null;
  cityId: number | null;
  countryIso2: string | null;
  activityDate: string | null;    // "YYYY-MM-DD"
  startTime: string | null;       // "HH:MM:SS"
  endTime: string | null;
  isFlexible: boolean;
  activityCategory: ActivityCategory;
  maxCompanions: number;
  status: TogetherPostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TogetherPostWithAuthor extends TogetherPost {
  author: {
    id: string;
    firstName: string;
    avatarUrl: string | null;
    bio: string | null;
    travelStyleTags: string[];
  };
  cityName: string | null;
  countryName: string | null;
  requestCount: number;       // number of pending requests
  acceptedCount: number;      // number of accepted requests
  /** Set when the current user has a pending/accepted request on this post */
  userRequestStatus: TogetherRequestStatus | null;
  userRequestId: string | null;
}

export interface TogetherRequest {
  id: string;
  postId: string;
  requesterId: string;
  note: string | null;
  status: TogetherRequestStatus;
  respondedAt: string | null;
  createdAt: string;
}

export interface TogetherRequestWithProfile extends TogetherRequest {
  requester: {
    id: string;
    firstName: string;
    avatarUrl: string | null;
    bio: string | null;
    travelStyleTags: string[];
  };
}

export interface CreateTogetherPostInput {
  postType: TogetherPostType;
  title: string;
  description?: string;
  tripId?: string;
  itineraryBlockId?: string;
  cityId?: number;
  countryIso2?: string;
  activityDate?: string;
  startTime?: string;
  endTime?: string;
  isFlexible?: boolean;
  activityCategory: ActivityCategory;
  maxCompanions?: number;
}

export interface TogetherFeedParams {
  cityId?: number;
  countryIso2?: string;
  category?: ActivityCategory;
  timeframe?: 'today' | 'this_week' | 'flexible' | 'all';
  page: number;
  pageSize: number;
}
```

**Step 2: Verify**

```bash
npx tsc --noEmit 2>&1 | grep -E '(data/together/)' | head -20
```

Expected: No errors from `data/together/types.ts`.

**Step 3: Commit**

```bash
git add data/together/types.ts
git commit -m "feat(together): add TypeScript types"
```

---

## Task 3: API Layer

**Files:**
- Create: `data/together/togetherApi.ts`

**Step 1: Write the API functions**

Follow the pattern in `data/community/communityApi.ts`. All queries use `supabase.from()`, all results wrapped with `toCamel()`.

```typescript
/* data/together/togetherApi.ts */

import { supabase } from '@/lib/supabase';
import { toCamel, rowsToCamel } from '@/data/api';
import type {
  TogetherPost,
  TogetherPostWithAuthor,
  TogetherRequest,
  TogetherRequestWithProfile,
  CreateTogetherPostInput,
  TogetherFeedParams,
  TogetherRequestStatus,
} from './types';

const PAGE_SIZE = 15;

// ─── Feed ────────────────────────────────────────────────────

export async function getTogetherFeed(
  userId: string,
  params: TogetherFeedParams,
  blockedIds: string[] = [],
): Promise<TogetherPostWithAuthor[]> {
  const { page, pageSize = PAGE_SIZE, cityId, countryIso2, category, timeframe } = params;

  let query = supabase
    .from('together_posts')
    .select(`
      *,
      author:profiles!together_posts_user_id_fkey(id, first_name, avatar_url, bio, travel_style_tags),
      city:cities!together_posts_city_id_fkey(name),
      country:countries!together_posts_country_iso2_fkey(name),
      requests:together_requests(id, status, requester_id)
    `)
    .eq('status', 'open')
    .neq('user_id', userId);

  // Exclude blocked users
  if (blockedIds.length > 0) {
    query = query.not('user_id', 'in', `(${blockedIds.join(',')})`);
  }

  // Filters
  if (cityId) query = query.eq('city_id', cityId);
  if (countryIso2) query = query.eq('country_iso2', countryIso2);
  if (category) query = query.eq('activity_category', category);

  // Timeframe
  const today = new Date().toISOString().split('T')[0];
  if (timeframe === 'today') {
    query = query.eq('activity_date', today);
  } else if (timeframe === 'this_week') {
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    query = query.gte('activity_date', today).lte('activity_date', weekEnd.toISOString().split('T')[0]);
  } else if (timeframe === 'flexible') {
    query = query.eq('is_flexible', true);
  }

  // Sort: soonest first, flexible at end
  query = query
    .order('activity_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  const { data, error } = await query;
  if (error) throw error;
  if (!data) return [];

  return data.map((row: any) => {
    const post = toCamel<TogetherPost>(row);
    const requests = (row.requests ?? []) as any[];
    const pendingRequests = requests.filter((r: any) => r.status === 'pending');
    const acceptedRequests = requests.filter((r: any) => r.status === 'accepted');
    const userRequest = requests.find((r: any) => r.requester_id === userId);

    return {
      ...post,
      author: {
        id: row.author?.id ?? '',
        firstName: row.author?.first_name ?? '',
        avatarUrl: row.author?.avatar_url ?? null,
        bio: row.author?.bio ?? null,
        travelStyleTags: row.author?.travel_style_tags ?? [],
      },
      cityName: row.city?.name ?? null,
      countryName: row.country?.name ?? null,
      requestCount: pendingRequests.length,
      acceptedCount: acceptedRequests.length,
      userRequestStatus: userRequest ? userRequest.status : null,
      userRequestId: userRequest ? userRequest.id : null,
    } as TogetherPostWithAuthor;
  });
}

// ─── Single Post Detail ──────────────────────────────────────

export async function getTogetherPost(
  userId: string,
  postId: string,
): Promise<TogetherPostWithAuthor | null> {
  const { data, error } = await supabase
    .from('together_posts')
    .select(`
      *,
      author:profiles!together_posts_user_id_fkey(id, first_name, avatar_url, bio, travel_style_tags),
      city:cities!together_posts_city_id_fkey(name),
      country:countries!together_posts_country_iso2_fkey(name),
      requests:together_requests(id, status, requester_id)
    `)
    .eq('id', postId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const requests = (data.requests ?? []) as any[];
  const post = toCamel<TogetherPost>(data);

  return {
    ...post,
    author: {
      id: data.author?.id ?? '',
      firstName: data.author?.first_name ?? '',
      avatarUrl: data.author?.avatar_url ?? null,
      bio: data.author?.bio ?? null,
      travelStyleTags: data.author?.travel_style_tags ?? [],
    },
    cityName: data.city?.name ?? null,
    countryName: data.country?.name ?? null,
    requestCount: requests.filter((r: any) => r.status === 'pending').length,
    acceptedCount: requests.filter((r: any) => r.status === 'accepted').length,
    userRequestStatus: requests.find((r: any) => r.requester_id === userId)?.status ?? null,
    userRequestId: requests.find((r: any) => r.requester_id === userId)?.id ?? null,
  } as TogetherPostWithAuthor;
}

// ─── My Posts ────────────────────────────────────────────────

export async function getMyTogetherPosts(userId: string): Promise<TogetherPostWithAuthor[]> {
  const { data, error } = await supabase
    .from('together_posts')
    .select(`
      *,
      author:profiles!together_posts_user_id_fkey(id, first_name, avatar_url, bio, travel_style_tags),
      city:cities!together_posts_city_id_fkey(name),
      country:countries!together_posts_country_iso2_fkey(name),
      requests:together_requests(id, status, requester_id)
    `)
    .eq('user_id', userId)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((row: any) => {
    const post = toCamel<TogetherPost>(row);
    const requests = (row.requests ?? []) as any[];
    return {
      ...post,
      author: {
        id: row.author?.id ?? '',
        firstName: row.author?.first_name ?? '',
        avatarUrl: row.author?.avatar_url ?? null,
        bio: row.author?.bio ?? null,
        travelStyleTags: row.author?.travel_style_tags ?? [],
      },
      cityName: row.city?.name ?? null,
      countryName: row.country?.name ?? null,
      requestCount: requests.filter((r: any) => r.status === 'pending').length,
      acceptedCount: requests.filter((r: any) => r.status === 'accepted').length,
      userRequestStatus: null,
      userRequestId: null,
    } as TogetherPostWithAuthor;
  });
}

// ─── Create / Update / Close ─────────────────────────────────

export async function createTogetherPost(
  userId: string,
  input: CreateTogetherPostInput,
): Promise<string> {
  const { data, error } = await supabase
    .from('together_posts')
    .insert({
      user_id: userId,
      post_type: input.postType,
      title: input.title,
      description: input.description ?? null,
      trip_id: input.tripId ?? null,
      itinerary_block_id: input.itineraryBlockId ?? null,
      city_id: input.cityId ?? null,
      country_iso2: input.countryIso2 ?? null,
      activity_date: input.activityDate ?? null,
      start_time: input.startTime ?? null,
      end_time: input.endTime ?? null,
      is_flexible: input.isFlexible ?? false,
      activity_category: input.activityCategory,
      max_companions: input.maxCompanions ?? 2,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function closeTogetherPost(postId: string): Promise<void> {
  const { error } = await supabase
    .from('together_posts')
    .update({ status: 'closed', updated_at: new Date().toISOString() })
    .eq('id', postId);
  if (error) throw error;
}

export async function cancelTogetherPost(postId: string): Promise<void> {
  const { error } = await supabase
    .from('together_posts')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', postId);
  if (error) throw error;
}

export async function deleteTogetherPost(postId: string): Promise<void> {
  const { error } = await supabase
    .from('together_posts')
    .delete()
    .eq('id', postId);
  if (error) throw error;
}

// ─── Requests ────────────────────────────────────────────────

export async function getPostRequests(postId: string): Promise<TogetherRequestWithProfile[]> {
  const { data, error } = await supabase
    .from('together_requests')
    .select(`
      *,
      requester:profiles!together_requests_requester_id_fkey(id, first_name, avatar_url, bio, travel_style_tags)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  if (!data) return [];

  return data.map((row: any) => ({
    ...toCamel<TogetherRequest>(row),
    requester: {
      id: row.requester?.id ?? '',
      firstName: row.requester?.first_name ?? '',
      avatarUrl: row.requester?.avatar_url ?? null,
      bio: row.requester?.bio ?? null,
      travelStyleTags: row.requester?.travel_style_tags ?? [],
    },
  })) as TogetherRequestWithProfile[];
}

export async function sendJoinRequest(
  postId: string,
  requesterId: string,
  note?: string,
): Promise<string> {
  const { data, error } = await supabase
    .from('together_requests')
    .insert({
      post_id: postId,
      requester_id: requesterId,
      note: note ?? null,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function cancelJoinRequest(requestId: string): Promise<void> {
  const { error } = await supabase
    .from('together_requests')
    .update({ status: 'cancelled' })
    .eq('id', requestId);
  if (error) throw error;
}

export async function respondToRequest(
  requestId: string,
  decision: 'accepted' | 'declined',
): Promise<void> {
  const { error } = await supabase
    .from('together_requests')
    .update({
      status: decision,
      responded_at: new Date().toISOString(),
    })
    .eq('id', requestId);
  if (error) throw error;
}
```

**Note on Supabase joins:** The FK join syntax (`profiles!together_posts_user_id_fkey`) requires the FK constraint name to match. If Supabase auto-generates a different name, the agent should check and adjust. An alternative is to use a two-step query (fetch post, then fetch profile by `user_id`). The agent should try the join first and fall back if it errors.

**Step 2: Verify**

```bash
npx tsc --noEmit 2>&1 | grep -E '(data/together/)' | head -20
```

Expected: No errors (or only warnings about unused imports that will be consumed later).

**Step 3: Commit**

```bash
git add data/together/togetherApi.ts
git commit -m "feat(together): add API layer for posts and requests"
```

---

## Task 4: Feed Hook

**Files:**
- Create: `data/together/useTogetherFeed.ts`

**Step 1: Write the feed hook**

Follow the pagination pattern from `data/community/useCommunityFeed.ts`. The hook should:
- Load posts filtered by the user's trip cities/dates
- Support category and timeframe filtering
- Paginate with `loadMore`
- Auto-refresh on tab focus
- Exclude blocked users

```typescript
/* data/together/useTogetherFeed.ts */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import { getTogetherFeed } from './togetherApi';
import { getBlockedUserIds } from '@/data/api';
import type {
  TogetherPostWithAuthor,
  TogetherFeedParams,
  ActivityCategory,
} from './types';

const PAGE_SIZE = 15;

interface UseTogetherFeedReturn {
  posts: TogetherPostWithAuthor[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  filters: {
    cityId?: number;
    countryIso2?: string;
    category?: ActivityCategory;
    timeframe?: 'today' | 'this_week' | 'flexible' | 'all';
  };
  setFilters: (f: Partial<UseTogetherFeedReturn['filters']>) => void;
  loadMore: () => void;
  refresh: () => void;
}

export function useTogetherFeed(): UseTogetherFeedReturn {
  const { userId } = useAuth();
  const [posts, setPosts] = useState<TogetherPostWithAuthor[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFiltersState] = useState<UseTogetherFeedReturn['filters']>({});

  const { data: blockedIds } = useData(
    () => (userId ? getBlockedUserIds(userId) : Promise.resolve([])),
    [userId],
  );

  const fetchPage = useCallback(
    async (pageNum: number, isRefresh = false) => {
      if (!userId) return;
      if (isRefresh) setRefreshing(true);
      else if (pageNum === 0) setLoading(true);

      try {
        const params: TogetherFeedParams = {
          ...filters,
          page: pageNum,
          pageSize: PAGE_SIZE,
        };
        const result = await getTogetherFeed(userId, params, blockedIds ?? []);
        if (pageNum === 0) {
          setPosts(result);
        } else {
          setPosts((prev) => [...prev, ...result]);
        }
        setHasMore(result.length === PAGE_SIZE);
      } catch (err) {
        console.error('[useTogetherFeed]', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId, filters, blockedIds],
  );

  useEffect(() => {
    setPage(0);
    fetchPage(0);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage);
  }, [hasMore, loading, page, fetchPage]);

  const refresh = useCallback(() => {
    setPage(0);
    fetchPage(0, true);
  }, [fetchPage]);

  const setFilters = useCallback((f: Partial<UseTogetherFeedReturn['filters']>) => {
    setFiltersState((prev) => ({ ...prev, ...f }));
  }, []);

  return { posts, loading, refreshing, hasMore, filters, setFilters, loadMore, refresh };
}
```

**Note:** `getBlockedUserIds` should already exist in `data/api.ts`. If not, the agent should check — it may be called `getBlockedIds` or similar. Search for `blocked` in `data/api.ts`.

**Step 2: Verify**

```bash
npx tsc --noEmit 2>&1 | grep -E '(data/together/)' | head -20
```

**Step 3: Commit**

```bash
git add data/together/useTogetherFeed.ts
git commit -m "feat(together): add feed hook with pagination and filtering"
```

---

## Task 5: Post Detail & Requests Hook

**Files:**
- Create: `data/together/useTogetherPost.ts`

**Step 1: Write the hooks**

Two hooks in one file: `useTogetherPost` (single post detail + user actions) and `useMyTogetherPosts` (for "My Posts" tab).

```typescript
/* data/together/useTogetherPost.ts */

import { useCallback } from 'react';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import {
  getTogetherPost,
  getPostRequests,
  getMyTogetherPosts,
  sendJoinRequest,
  cancelJoinRequest,
  respondToRequest,
  closeTogetherPost,
  deleteTogetherPost,
} from './togetherApi';
import { getOrCreateConversation, sendMessage } from '@/data/api';
import type { TogetherPostWithAuthor, TogetherRequestWithProfile } from './types';

// ─── Single Post Detail ──────────────────────────────────────

export function useTogetherPost(postId: string) {
  const { userId } = useAuth();

  const {
    data: post,
    loading,
    error,
    refetch,
  } = useData(
    () => (userId && postId ? getTogetherPost(userId, postId) : Promise.resolve(null)),
    [userId, postId],
  );

  const isOwner = post?.userId === userId;

  // Requests (only fetched if owner)
  const { data: requests, refetch: refetchRequests } = useData(
    () => (isOwner && postId ? getPostRequests(postId) : Promise.resolve([])),
    [isOwner, postId],
  );

  const requestToJoin = useCallback(
    async (note?: string) => {
      if (!userId) return;
      await sendJoinRequest(postId, userId, note);
      refetch();
    },
    [userId, postId, refetch],
  );

  const cancelRequest = useCallback(
    async (requestId: string) => {
      await cancelJoinRequest(requestId);
      refetch();
    },
    [refetch],
  );

  const acceptRequest = useCallback(
    async (requestId: string, requesterId: string) => {
      if (!userId || !post) return;
      await respondToRequest(requestId, 'accepted');

      // Auto-create DM with activity context
      const convoId = await getOrCreateConversation(userId, requesterId);
      const contextMsg = `You're both going to ${post.title}${post.activityDate ? ` — ${post.activityDate}` : ''}${post.startTime ? `, ${post.startTime.slice(0, 5)}` : ''}`;
      await sendMessage(convoId, userId, contextMsg);

      refetchRequests();
      refetch();
    },
    [userId, post, refetch, refetchRequests],
  );

  const declineRequest = useCallback(
    async (requestId: string) => {
      await respondToRequest(requestId, 'declined');
      refetchRequests();
      refetch();
    },
    [refetch, refetchRequests],
  );

  const closePost = useCallback(async () => {
    await closeTogetherPost(postId);
    refetch();
  }, [postId, refetch]);

  const deletePost = useCallback(async () => {
    await deleteTogetherPost(postId);
  }, [postId]);

  return {
    post,
    loading,
    error,
    isOwner,
    requests: requests ?? [],
    refetch,
    requestToJoin,
    cancelRequest,
    acceptRequest,
    declineRequest,
    closePost,
    deletePost,
  };
}

// ─── My Posts ────────────────────────────────────────────────

export function useMyTogetherPosts() {
  const { userId } = useAuth();

  const { data, loading, error, refetch } = useData(
    () => (userId ? getMyTogetherPosts(userId) : Promise.resolve([])),
    [userId],
  );

  return {
    posts: data ?? [],
    loading,
    error,
    refetch,
  };
}
```

**Step 2: Verify**

```bash
npx tsc --noEmit 2>&1 | grep -E '(data/together/)' | head -20
```

**Step 3: Commit**

```bash
git add data/together/useTogetherPost.ts
git commit -m "feat(together): add post detail and my-posts hooks with DM on accept"
```

---

## Task 6: TogetherCard Component

**Files:**
- Create: `components/together/TogetherCard.tsx`

**Step 1: Write the component**

A feed card showing: author avatar + name, activity title, date/time, city, category pill, spots available, and request status. Follow the card pattern from `components/trips/TripListCard.tsx`.

Design rules:
- Use `colors`, `fonts`, `spacing`, `radius`, `typography` from `constants/design.ts`
- Flat design — 1px border, no shadows
- White background
- 44pt minimum touch target
- Press state: `opacity: 0.9, transform: [{ scale: 0.98 }]`
- Activity category as a small pill (orangeFill bg for active)
- "Flexible" or date shown clearly
- Spots: "2 spots left" or "Full"
- User request status: "Requested" in muted text if already requested

The component should accept an `onPress` callback and a `TogetherPostWithAuthor` object.

**Step 2: Verify**

```bash
npx tsc --noEmit 2>&1 | grep -E '(components/together/)' | head -20
```

**Step 3: Commit**

```bash
git add components/together/TogetherCard.tsx
git commit -m "feat(together): add TogetherCard feed component"
```

---

## Task 7: Category Filter Pills

**Files:**
- Create: `components/together/TogetherFilterPills.tsx`

**Step 1: Write the component**

Horizontal ScrollView of pills for filtering by activity category and timeframe. Two rows:
1. **Category**: All, Food, Culture, Adventure, Nightlife, Day trip, Wellness, Shopping
2. **Timeframe**: All, Today, This week, Flexible

Follow the pill/chip pattern from `components/explore/SearchBar.tsx` or community filter pills. Active pill uses `orangeFill` bg + `orange` border. Inactive uses `neutralFill` bg + `borderDefault`.

Props:
```typescript
interface TogetherFilterPillsProps {
  selectedCategory: ActivityCategory | undefined;
  selectedTimeframe: 'today' | 'this_week' | 'flexible' | 'all' | undefined;
  onCategoryChange: (cat: ActivityCategory | undefined) => void;
  onTimeframeChange: (tf: 'today' | 'this_week' | 'flexible' | 'all' | undefined) => void;
}
```

**Step 2: Verify**

```bash
npx tsc --noEmit 2>&1 | grep -E '(components/together/)' | head -20
```

**Step 3: Commit**

```bash
git add components/together/TogetherFilterPills.tsx
git commit -m "feat(together): add category and timeframe filter pills"
```

---

## Task 8: Together Empty State

**Files:**
- Create: `components/together/TogetherEmptyState.tsx`

**Step 1: Write the component**

Simple empty state for when no posts match the current filters. Shows:
- An Ionicons icon (e.g., `people-outline`) in muted color
- A headline like "No activities posted yet"
- A subline contextual to filters, e.g., "Be the first — open up a plan or post what you're looking for"
- A CTA button: "Post an activity" (orange, rounded)

Props:
```typescript
interface TogetherEmptyStateProps {
  cityName?: string;
  onCreatePost: () => void;
}
```

Follow the empty state pattern from other screens (check `components/trips/TripsEmptyStateV2.tsx` for reference).

**Step 2: Verify & Commit**

```bash
git add components/together/TogetherEmptyState.tsx
git commit -m "feat(together): add empty state component"
```

---

## Task 9: Together Feed Screen

**Files:**
- Modify: `app/(tabs)/travelers/index.tsx` — add segmented control at top ("Travelers" | "Together")
- Create: `components/together/TogetherFeed.tsx` — the feed content extracted as a component

**Step 1: Create TogetherFeed component**

A FlatList-based feed component that:
- Uses `useTogetherFeed()` hook
- Renders `TogetherFilterPills` as ListHeaderComponent
- Renders `TogetherCard` items
- Shows `TogetherEmptyState` when empty
- Supports pull-to-refresh and infinite scroll (`onEndReached`)
- Has a floating "+" FAB button (orange, bottom-right) to create a new post
- Bottom padding for `FLOATING_TAB_BAR_HEIGHT`

**Step 2: Modify travelers/index.tsx**

Add a segmented control at the top of the screen (below NavigationHeader). Two segments: "Travelers" and "Together". When "Together" is selected, render `<TogetherFeed />` instead of the existing travelers content.

Use a simple `useState<'travelers' | 'together'>` toggle. The segmented control should use the same style as other toggles in the app — two pills side by side, active one has `orangeFill` bg.

Important: Do NOT break the existing travelers feed. Wrap the current content in a conditional render.

**Step 3: Register route for Together post detail**

Add to `app/(tabs)/travelers/_layout.tsx`:
```typescript
<Stack.Screen name="together/[postId]" />
<Stack.Screen name="together/new" />
```

**Step 4: Verify**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/\(tabs\)/travelers|components/together/)' | head -20
```

**Step 5: Commit**

```bash
git add components/together/TogetherFeed.tsx app/(tabs)/travelers/index.tsx app/(tabs)/travelers/_layout.tsx
git commit -m "feat(together): add Together feed with segmented control on travelers tab"
```

---

## Task 10: Together Post Detail Screen

**Files:**
- Create: `app/(tabs)/travelers/together/[postId].tsx`

**Step 1: Write the detail screen**

A push screen showing the full Together post. Uses `useTogetherPost(postId)`.

**For viewers (not owner):**
- Hero section: activity title, category pill, date/time, city
- Author mini-profile: avatar, name, bio snippet, travel style tags
- Description text
- Spots info: "2 of 3 spots filled" progress indicator
- Bottom sticky bar:
  - If no request: "Request to Join" orange button → opens a bottom sheet with optional note input + "Send Request" button
  - If pending: "Requested" muted button + "Cancel Request" text link
  - If accepted: "You're going!" success message + link to DM

**For owner:**
- Same hero section
- Pending requests section: list of `TogetherRequestWithProfile` cards
  - Each shows: avatar, name, bio, travel style tags, their note
  - Accept (green) and Decline (muted) buttons
- Accepted companions list
- "Close Post" and "Delete Post" actions in a menu

**Step 2: Create the request sheet**

Build inline as a `<Modal>` bottom sheet within the detail screen (follow `ReportSheet.tsx` pattern):
- Handle bar
- "Send a note (optional)" label
- TextInput (multiline, 3 lines max)
- "Send Request" orange button
- "Cancel" text link

**Step 3: Verify**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/\(tabs\)/travelers/together)' | head -20
```

**Step 4: Commit**

```bash
git add app/(tabs)/travelers/together/[postId].tsx
git commit -m "feat(together): add post detail screen with request flow"
```

---

## Task 11: Create Together Post Screen

**Files:**
- Create: `app/(tabs)/travelers/together/new.tsx`

**Step 1: Write the creation screen**

A push screen for creating a "Looking For" post. Multi-step form in a single ScrollView (not a wizard — all fields visible, scrollable):

1. **Title** — TextInput, placeholder "What do you want to do?"
2. **Description** — TextInput multiline, placeholder "Add some context..."
3. **Category** — Horizontal pill selector (same pills as filter, but single-select required)
4. **City** — Search input that queries `searchDestinations()` from `data/trips/tripApi.ts` (or `data/api.ts`). Pre-suggest cities from user's upcoming trips.
5. **Date & Time** — Date picker + optional time pickers. Toggle for "Flexible" (hides date/time fields).
6. **Max companions** — Stepper (1-5), default 2
7. **Post** button — orange, full-width, bottom

On submit: call `createTogetherPost()`, then `router.back()`.

Use `useTrips()` to get the user's upcoming trips for city suggestions.

**Step 2: Verify**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/\(tabs\)/travelers/together)' | head -20
```

**Step 3: Commit**

```bash
git add app/(tabs)/travelers/together/new.tsx
git commit -m "feat(together): add create post screen for Looking For posts"
```

---

## Task 12: My Posts Tab

**Files:**
- Modify: `components/together/TogetherFeed.tsx` — add "Feed" | "My Posts" toggle

**Step 1: Add segmented control within TogetherFeed**

Below the filter pills, add a second toggle: "Feed" | "My Posts".

When "My Posts" is selected:
- Use `useMyTogetherPosts()` hook
- Render the same `TogetherCard` but with a request count badge
- Tapping a card navigates to the detail screen (where owner sees requests)
- Show empty state: "You haven't posted any activities yet"

**Step 2: Verify & Commit**

```bash
git add components/together/TogetherFeed.tsx
git commit -m "feat(together): add My Posts toggle to Together feed"
```

---

## Task 13: Open Plan — Itinerary Block Integration

**Files:**
- Modify: the itinerary day detail screen (`app/(tabs)/trips/day/[dayId].tsx` or wherever blocks are rendered)
- Create: `components/together/OpenPlanSheet.tsx`

**Step 1: Add "Open to Together" action on itinerary blocks**

In the block card or block menu, add an action: "Open to Together" (with a people-outline icon). This opens the `OpenPlanSheet`.

**Step 2: Write OpenPlanSheet**

A bottom sheet pre-filled from the itinerary block:
- Title: block title (read-only, from block)
- Date: from the trip day (read-only)
- Time: from block start/end time (read-only)
- City: from trip stop (read-only)
- **Editable fields:**
  - Description — TextInput, "Add a note for potential companions..."
  - Category — pill selector, pre-selected based on block type mapping:
    - `meal` → `food`
    - `activity` → `adventure`
    - `place` → `culture`
    - default → `other`
  - Max companions — stepper 1-5
- "Post to Together" orange button

On submit: call `createTogetherPost()` with `postType: 'open_plan'`, `itineraryBlockId`, `tripId`, and the block's city/date info. Then close the sheet.

**Step 3: Verify**

```bash
npx tsc --noEmit 2>&1 | grep -E '(components/together/|app/\(tabs\)/trips/)' | head -20
```

**Step 4: Commit**

```bash
git add components/together/OpenPlanSheet.tsx app/(tabs)/trips/day/[dayId].tsx
git commit -m "feat(together): add Open Plan sheet for itinerary blocks"
```

---

## Task 14: Final Wiring & Type Check

**Files:**
- All files from previous tasks

**Step 1: Full type check**

```bash
npx tsc --noEmit 2>&1 | grep -E '(app/|components/|data/)' | grep -v scripts | grep -v supabase/functions | head -40
```

Fix any TypeScript errors. Common issues:
- FK join names may differ from what Supabase auto-generated (check and adjust)
- Missing imports
- Type mismatches between API response shape and interface

**Step 2: Verify navigation works**

Ensure all routes are registered in `_layout.tsx` files and that `router.push()` paths match file paths.

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat(together): fix type errors and finalize wiring"
```

---

## Summary of Files Created/Modified

**New files:**
- `supabase/migrations/20260225_together_schema.sql`
- `data/together/types.ts`
- `data/together/togetherApi.ts`
- `data/together/useTogetherFeed.ts`
- `data/together/useTogetherPost.ts`
- `components/together/TogetherCard.tsx`
- `components/together/TogetherFilterPills.tsx`
- `components/together/TogetherEmptyState.tsx`
- `components/together/TogetherFeed.tsx`
- `components/together/OpenPlanSheet.tsx`
- `app/(tabs)/travelers/together/[postId].tsx`
- `app/(tabs)/travelers/together/new.tsx`

**Modified files:**
- `app/(tabs)/travelers/index.tsx` — segmented control
- `app/(tabs)/travelers/_layout.tsx` — new routes
- `app/(tabs)/trips/day/[dayId].tsx` — Open Plan action on blocks

**Total: 12 new files, 3 modified files, 14 tasks**
