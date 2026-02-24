/**
 * Hook for the Together activity feed with filtering and pagination.
 * Manages blocked-user exclusion, category/location filters, and timeframe.
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/state/AuthContext';
import { getBlockedUserIds } from '@/data/api';
import { getTogetherFeed } from './togetherApi';
import type { TogetherPostWithAuthor, ActivityCategory } from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TogetherFeedFilters {
  cityId?: string;
  countryIso2?: string;
  category?: ActivityCategory;
  timeframe?: 'today' | 'this_week' | 'flexible' | 'all';
}

export interface UseTogetherFeedReturn {
  posts: TogetherPostWithAuthor[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  filters: TogetherFeedFilters;
  setFilters: (f: Partial<TogetherFeedFilters>) => void;
  loadMore: () => void;
  refresh: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 15;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTogetherFeed(): UseTogetherFeedReturn {
  const { userId } = useAuth();

  const [posts, setPosts] = useState<TogetherPostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [filters, setFiltersState] = useState<TogetherFeedFilters>({});

  // Fetch blocked users once
  useEffect(() => {
    if (!userId) return;
    getBlockedUserIds(userId).then(setBlockedIds).catch(() => setBlockedIds([]));
  }, [userId]);

  // Core fetch function
  const fetchPosts = useCallback(
    async (pageNum: number, isRefresh: boolean) => {
      if (!userId) return;

      try {
        if (isRefresh) setRefreshing(true);
        else if (pageNum === 0) setLoading(true);

        const result = await getTogetherFeed(
          userId,
          {
            ...filters,
            page: pageNum,
            pageSize: PAGE_SIZE,
          },
          blockedIds,
        );

        if (pageNum === 0) {
          setPosts(result);
        } else {
          setPosts((prev) => [...prev, ...result]);
        }
        setHasMore(result.length === PAGE_SIZE);
      } catch (_err) {
        // Silently fail -- loading states will clear, empty feed shown
        if (pageNum === 0) setPosts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId, filters, blockedIds],
  );

  // Fetch on mount and when filters/blocked list change
  useEffect(() => {
    setPage(0);
    fetchPosts(0, false);
  }, [fetchPosts]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading || refreshing) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, false);
  }, [hasMore, loading, refreshing, page, fetchPosts]);

  const refresh = useCallback(() => {
    setPage(0);
    fetchPosts(0, true);
  }, [fetchPosts]);

  const setFilters = useCallback((newFilters: Partial<TogetherFeedFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    posts,
    loading,
    refreshing,
    hasMore,
    filters,
    setFilters,
    loadMore,
    refresh,
  };
}
