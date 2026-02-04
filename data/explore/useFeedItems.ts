// data/explore/useFeedItems.ts
import { useState, useEffect } from 'react';
import {
  getCountries,
  getPopularCities,
  getCountryById,
} from '../api';
import { getFeaturedExploreCollections, getExploreCollectionItems } from '../collections';
import { buildFeed } from './feedBuilder';
import type { ExploreCollectionWithItems } from '../types';
import type { FeedItem, CityWithCountry, ActivityWithCity } from './types';

// Initial feed shown while real data loads (loading placeholder)
const INITIAL_FEED: FeedItem[] = [
  { type: 'end-card' },
];

// Timeout wrapper for API calls
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), ms)
    ),
  ]);
}

interface UseFeedItemsResult {
  feedItems: FeedItem[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useFeedItems(): UseFeedItemsResult {
  // Start with loading state until we have data
  const [feedItems, setFeedItems] = useState<FeedItem[]>(INITIAL_FEED);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadRealData() {
      setIsLoading(true);
      try {
        // Fetch countries, cities, and featured collections with 5 second timeout
        const [countries, cities, featuredCollections] = await withTimeout(
          Promise.all([
            getCountries(),
            getPopularCities(4),
            getFeaturedExploreCollections(),
          ]),
          5000
        );

        if (cancelled) return;

        // Resolve collection items for each featured collection
        const collectionsWithItems: ExploreCollectionWithItems[] = await withTimeout(
          Promise.all(
            featuredCollections.map(async (collection) => {
              const items = await getExploreCollectionItems(collection);
              return { ...collection, items };
            })
          ),
          5000
        );

        if (cancelled) return;

        // Get unique country IDs and fetch country details
        const countryIds = [...new Set(cities.map(c => c.countryId))];
        const countryResults = await withTimeout(
          Promise.all(countryIds.map(id => getCountryById(id))),
          3000
        );

        if (cancelled) return;

        const countryMap = new Map(
          countryResults.filter(Boolean).map(c => [c!.id, c!])
        );

        // Build cities with country info
        const citiesWithActivities = cities.map((city) => {
          const country = countryMap.get(city.countryId);
          return {
            city: {
              ...city,
              countryName: country?.name ?? '',
              countrySlug: country?.slug ?? '',
            } as CityWithCountry,
            activities: [] as ActivityWithCity[],
          };
        });

        if (cancelled) return;

        // Build full feed with real data
        const feed = buildFeed(collectionsWithItems, countries, citiesWithActivities);
        setFeedItems(feed);
        if (!cancelled) {
          setIsLoading(false);
        }
      } catch (err) {
        // On error/timeout, keep showing initial feed - don't block UI
        console.log('Feed API error (using cached data):', err);
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load'));
          setIsLoading(false);
        }
      }
    }

    // Load real data in background (don't block UI)
    loadRealData();

    return () => { cancelled = true; };
  }, [refreshKey]);

  const refresh = () => {
    setError(null);
    setRefreshKey((k) => k + 1);
  };

  return { feedItems, isLoading, error, refresh };
}
