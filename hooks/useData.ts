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
  // Build a stable query key from the deps array.
  const queryKey = ['useData', ...deps];

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<T | null, Error>({
    queryKey,
    queryFn: async () => {
      try {
        const result = fetcher();
        if (result instanceof Promise) {
          const resolved = await result;
          // React Query doesn't allow undefined, convert to null
          return resolved === undefined ? null : resolved;
        }
        return result === undefined ? null : result;
      } catch (err) {
        // Re-throw as Error for React Query to handle
        throw err instanceof Error ? err : new Error(String(err));
      }
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
