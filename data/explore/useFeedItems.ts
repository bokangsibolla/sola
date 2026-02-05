// data/explore/useFeedItems.ts
import { useState, useEffect } from 'react';
import { getPopularCitiesWithCountry } from '../api';
import { getFeaturedExploreCollections, getExploreCollectionItems } from '../collections';
import { getDiscoveryLenses } from '../lenses';
import { buildFeed } from './feedBuilder';
import type { ExploreCollectionWithItems } from '../types';
import type { FeedItem } from './types';

const INITIAL_FEED: FeedItem[] = [
  { type: 'end-card' },
];

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
  const [feedItems, setFeedItems] = useState<FeedItem[]>(INITIAL_FEED);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadFeed() {
      setIsLoading(true);
      try {
        // Single optimized query: 12 cities with country data joined
        const cities = await withTimeout(
          getPopularCitiesWithCountry(12),
          5000
        );

        if (cancelled) return;

        // Collections (optional — failures don't break feed)
        let collectionsWithItems: ExploreCollectionWithItems[] = [];
        try {
          const featuredCollections = await withTimeout(
            getFeaturedExploreCollections(),
            5000
          );
          if (!cancelled && featuredCollections.length > 0) {
            collectionsWithItems = await withTimeout(
              Promise.all(
                featuredCollections.map(async (collection) => {
                  const items = await getExploreCollectionItems(collection);
                  return { ...collection, items };
                })
              ),
              5000
            );
          }
        } catch (collectionErr) {
          console.log('Collections unavailable:', collectionErr);
        }

        // Lenses (optional — returns [] if DB table doesn't exist)
        let lenses: any[] = [];
        try {
          lenses = await withTimeout(getDiscoveryLenses(), 3000);
        } catch {
          console.log('Lenses unavailable');
        }

        if (cancelled) return;

        const feed = buildFeed(collectionsWithItems, cities, lenses);
        setFeedItems(feed);
        if (!cancelled) {
          setIsLoading(false);
        }
      } catch (err) {
        console.log('Feed API error:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load'));
          setIsLoading(false);
        }
      }
    }

    loadFeed();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const refresh = () => {
    setError(null);
    setRefreshKey((k) => k + 1);
  };

  return { feedItems, isLoading, error, refresh };
}
