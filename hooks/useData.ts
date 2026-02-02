import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Generic data-fetching hook that works with both sync and async fetchers.
 * Returns { data, loading, error, refetch }.
 */
export function useData<T>(
  fetcher: () => T | Promise<T>,
  deps: any[] = [],
): { data: T | null; loading: boolean; error: Error | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const run = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const result = fetcher();
      if (result instanceof Promise) {
        result
          .then((value) => {
            if (mountedRef.current) {
              setData(value);
              setLoading(false);
            }
          })
          .catch((err) => {
            if (mountedRef.current) {
              setError(err instanceof Error ? err : new Error(String(err)));
              setLoading(false);
            }
          });
      } else {
        setData(result);
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    run();
    return () => {
      mountedRef.current = false;
    };
  }, [run]);

  return { data, loading, error, refetch: run };
}
