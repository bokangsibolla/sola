import { useState, useCallback } from 'react';
import * as Sentry from '@sentry/react-native';
import { searchTravelersByUsername } from '@/data/api';
import type { TravelerSearchResult } from '@/data/api';

interface UseTravelerSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: TravelerSearchResult[];
  isSearching: boolean;
  search: () => void;
  clear: () => void;
}

export function useTravelerSearch(currentUserId: string | undefined): UseTravelerSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TravelerSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim() || !currentUserId) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const data = await searchTravelersByUsername(query, currentUserId);
      setResults(data);
    } catch (err) {
      Sentry.captureException(err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, currentUserId]);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  return { query, setQuery, results, isSearching, search, clear };
}
