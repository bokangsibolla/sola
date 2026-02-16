import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { useAuth } from '@/state/AuthContext';
import { fetchRecommendedCities, fetchDiscoverCollections } from './discoverApi';
import type { RecommendedCity } from './types';
import type { ExploreCollectionWithItems } from '../types';

interface DiscoverData {
  recommended: RecommendedCity[];
  isPersonalized: boolean;
  collections: ExploreCollectionWithItems[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useDiscoverData(): DiscoverData {
  const { userId } = useAuth();
  const [recommended, setRecommended] = useState<RecommendedCity[]>([]);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [collections, setCollections] = useState<ExploreCollectionWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        const [recResult, colResult] = await Promise.allSettled([
          fetchRecommendedCities(userId, 12),
          fetchDiscoverCollections(),
        ]);

        if (cancelled) return;

        if (recResult.status === 'fulfilled') {
          setRecommended(recResult.value.cities);
          setIsPersonalized(recResult.value.isPersonalized);
        } else {
          Sentry.captureException(recResult.reason);
        }

        if (colResult.status === 'fulfilled') {
          setCollections(colResult.value);
        } else {
          Sentry.captureException(colResult.reason);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error('Failed to load discover'));
          Sentry.captureException(e);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [userId, refreshKey]);

  return {
    recommended,
    isPersonalized,
    collections,
    isLoading,
    error,
    refresh: () => setRefreshKey((k) => k + 1),
  };
}
