// data/explore/useSearch.ts
import { useState, useEffect, useCallback } from 'react';
import { searchDestinations } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = 'explore_recent_searches';
const MAX_RECENT = 5;

export interface SearchResult {
  id: string;
  name: string;
  type: 'country' | 'city' | 'place';
  context: string;
  slug: string;
}

interface UseSearchResult {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  isSearching: boolean;
  recentSearches: string[];
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
}

export function useSearch(): UseSearchResult {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    AsyncStorage.getItem(RECENT_SEARCHES_KEY).then((data) => {
      if (data) {
        setRecentSearches(JSON.parse(data));
      }
    });
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await searchDestinations(query);
        setResults(
          data.map((d) => ({
            id: d.id,
            name: d.name,
            type: d.type,
            context: d.type === 'country' ? 'Country' : d.parentName ?? '',
            slug: d.slug,
          }))
        );
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const addRecentSearch = useCallback(async (term: string) => {
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  const clearRecentSearches = useCallback(async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
}
