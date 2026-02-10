/**
 * Hook for the community thread feed with place-based filtering.
 * Manages pagination, filters, and blocked-user exclusion.
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/state/AuthContext';
import { getThreadFeed } from './communityApi';
import { getBlockedUserIds } from '@/data/api';
import type { ThreadWithAuthor, ThreadFeedParams } from './types';

interface UseCommunityFeedReturn {
  threads: ThreadWithAuthor[];
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  setFilters: (newFilters: Partial<Pick<ThreadFeedParams, 'countryId' | 'cityId' | 'topicId' | 'searchQuery' | 'sort'>>) => void;
  filters: Pick<ThreadFeedParams, 'countryId' | 'cityId' | 'topicId' | 'searchQuery' | 'sort'>;
}

const PAGE_SIZE = 15;

export function useCommunityFeed(): UseCommunityFeedReturn {
  const { userId } = useAuth();
  const [threads, setThreads] = useState<ThreadWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [filters, setFiltersState] = useState<Pick<ThreadFeedParams, 'countryId' | 'cityId' | 'topicId' | 'searchQuery' | 'sort'>>({
    sort: 'relevant',
  });

  // Fetch blocked users once
  useEffect(() => {
    if (!userId) return;
    getBlockedUserIds(userId).then(setBlockedIds).catch(() => setBlockedIds([]));
  }, [userId]);

  const fetchThreads = useCallback(async (pageNum: number, isRefresh: boolean) => {
    if (!userId) return;
    try {
      if (isRefresh) setRefreshing(true);
      else if (pageNum === 0) setLoading(true);

      const result = await getThreadFeed(userId, {
        ...filters,
        page: pageNum,
        pageSize: PAGE_SIZE,
      }, blockedIds);

      if (pageNum === 0) {
        setThreads(result);
      } else {
        setThreads((prev) => [...prev, ...result]);
      }
      setHasMore(result.length === PAGE_SIZE);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load threads'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, filters, blockedIds]);

  // Fetch on mount and when filters change
  useEffect(() => {
    setPage(0);
    fetchThreads(0, false);
  }, [fetchThreads]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchThreads(nextPage, false);
  }, [hasMore, loading, page, fetchThreads]);

  const refresh = useCallback(() => {
    setPage(0);
    fetchThreads(0, true);
  }, [fetchThreads]);

  const setFilters = useCallback((newFilters: Partial<Pick<ThreadFeedParams, 'countryId' | 'cityId' | 'topicId' | 'searchQuery' | 'sort'>>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return { threads, loading, refreshing, error, hasMore, loadMore, refresh, setFilters, filters };
}
