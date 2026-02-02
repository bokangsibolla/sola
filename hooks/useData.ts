import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Drop-in replacement for the old useData hook, now backed by React Query.
 *
 * - Results are cached and shared across components using the same fetcher+deps.
 * - Stale data is shown instantly while refetching in the background.
 * - The return shape { data, loading, error, refetch } is unchanged.
 */
export function useData<T>(
  fetcher: () => T | Promise<T>,
  deps: any[] = [],
): { data: T | null; loading: boolean; error: Error | null; refetch: () => void } {
  // Build a stable query key from the stringified deps.
  // We also include the fetcher's toString() as a rough identity when no deps differ.
  const queryKey = ['useData', fetcher.toString().slice(0, 80), ...deps];

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<T, Error>({
    queryKey,
    queryFn: async () => {
      const result = fetcher();
      if (result instanceof Promise) {
        return await result;
      }
      return result;
    },
    // Show stale data while refetching
    staleTime: 30_000,
  });

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, ...deps]);

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ?? null,
    refetch,
  };
}
