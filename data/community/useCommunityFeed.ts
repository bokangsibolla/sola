/**
 * Hook for the community thread feed with place-based filtering.
 * Manages pagination, filters, and blocked-user exclusion.
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import { getThreadFeed } from './communityApi';
import { getBlockedUserIds } from '@/data/api';
import { getTripsGrouped } from '@/data/trips/tripApi';
import { supabase } from '@/lib/supabase';
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

  // Fetch active trip context for trip-aware ranking
  const { data: tripContext } = useData(
    async () => {
      if (!userId) return null;
      const grouped = await getTripsGrouped(userId);
      const activeTrip = grouped.current;
      if (!activeTrip || activeTrip.stops.length === 0) return null;

      // Collect city IDs directly (already UUIDs)
      const cityIds = activeTrip.stops
        .map((s) => s.cityId)
        .filter(Boolean) as string[];

      // Resolve country ISO2 codes to country UUIDs for matching against threads
      const iso2Codes = Array.from(
        new Set(activeTrip.stops.map((s) => s.countryIso2).filter(Boolean))
      ) as string[];
      let countryIds: string[] = [];
      if (iso2Codes.length > 0) {
        const { data: countries } = await supabase
          .from('countries')
          .select('id')
          .in('iso2', iso2Codes);
        countryIds = (countries ?? []).map((c: { id: string }) => c.id);
      }

      return { cityIds, countryIds };
    },
    [userId],
  );

  const fetchThreads = useCallback(async (pageNum: number, isRefresh: boolean, attempt = 0) => {
    if (!userId) return;
    try {
      if (isRefresh) setRefreshing(true);
      else if (pageNum === 0) setLoading(true);

      const result = await getThreadFeed(userId, {
        ...filters,
        page: pageNum,
        pageSize: PAGE_SIZE,
      }, blockedIds, {
        tripCityIds: tripContext?.cityIds,
        tripCountryIds: tripContext?.countryIds,
      });

      if (pageNum === 0) {
        setThreads(result);
      } else {
        setThreads((prev) => [...prev, ...result]);
      }
      setHasMore(result.length === PAGE_SIZE);
      setError(null);
    } catch (err) {
      // Retry up to 2 times — Android TLS provider can cause transient failures
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        return fetchThreads(pageNum, isRefresh, attempt + 1);
      }
      setError(err instanceof Error ? err : new Error('Failed to load threads'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, filters, blockedIds, tripContext]);

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
