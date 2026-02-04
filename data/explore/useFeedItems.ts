// data/explore/useFeedItems.ts
import { useState, useEffect } from 'react';
import {
  getCountries,
  getPopularCities,
  getCountryById,
} from '../api';
import { buildFeed } from './feedBuilder';
import type { FeedItem, EditorialCollection, CityWithCountry, ActivityWithCity } from './types';

// Mock editorial collections
const MOCK_EDITORIALS: EditorialCollection[] = [
  {
    id: '1',
    slug: 'first-solo-trips',
    title: 'Best destinations for your first solo trip',
    subtitle: 'For first-timers who want ease and charm',
    heroImageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
    destinations: [],
    isSponsored: false,
    sponsorName: null,
    orderIndex: 0,
  },
  {
    id: '2',
    slug: 'calm-beach-towns',
    title: 'Calm beach towns for slow travel',
    subtitle: 'Where the pace is gentle and the views are endless',
    heroImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    destinations: [],
    isSponsored: false,
    sponsorName: null,
    orderIndex: 1,
  },
  {
    id: '3',
    slug: 'cultural-capitals',
    title: 'Cultural capitals worth exploring',
    subtitle: 'Art, history, and unforgettable experiences',
    heroImageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
    destinations: [],
    isSponsored: false,
    sponsorName: null,
    orderIndex: 2,
  },
];

// Initial feed shown immediately while real data loads
const INITIAL_FEED: FeedItem[] = [
  { type: 'editorial-collection', data: MOCK_EDITORIALS[0] },
  { type: 'editorial-collection', data: MOCK_EDITORIALS[1] },
  { type: 'editorial-collection', data: MOCK_EDITORIALS[2] },
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
  // Start with initial feed immediately - no loading state
  const [feedItems, setFeedItems] = useState<FeedItem[]>(INITIAL_FEED);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadRealData() {
      try {
        // Fetch countries and cities with 5 second timeout
        const [countries, cities] = await withTimeout(
          Promise.all([
            getCountries(),
            getPopularCities(4),
          ]),
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
        const feed = buildFeed(MOCK_EDITORIALS, countries, citiesWithActivities);
        setFeedItems(feed);
      } catch (err) {
        // On error/timeout, keep showing initial feed - don't block UI
        console.log('Feed API error (using cached data):', err);
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load'));
        }
      }
    }

    // Load real data in background (don't block UI)
    loadRealData();

    return () => { cancelled = true; };
  }, [refreshKey]);

  const refresh = () => {
    setIsLoading(true);
    setError(null);
    setRefreshKey((k) => k + 1);
    // Brief loading indicator then reset
    setTimeout(() => setIsLoading(false), 500);
  };

  return { feedItems, isLoading, error, refresh };
}
