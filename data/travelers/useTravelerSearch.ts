import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { searchTravelersByUsername } from '@/data/api';
import type { TravelerSearchResult } from '@/data/api';

interface UseTravelerSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: TravelerSearchResult[];
  isSearching: boolean;
}

export function useTravelerSearch(currentUserId: string | undefined): UseTravelerSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TravelerSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim() || !currentUserId) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
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
    }, 300);

    return () => clearTimeout(timer);
  }, [query, currentUserId]);

  return { query, setQuery, results, isSearching };
}
