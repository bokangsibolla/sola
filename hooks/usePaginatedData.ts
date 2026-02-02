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
