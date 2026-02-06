// data/explore/useFeedItems.ts
import { useState, useEffect } from 'react';
import { getPopularCitiesWithCountry } from '../api';
import { getFeaturedExploreCollections, getExploreCollectionItems } from '../collections';
import { getDiscoveryLenses } from '../lenses';
import { buildFeed } from './feedBuilder';
import type { ExploreCollectionWithItems } from '../types';
import type { FeedItem, CityWithCountry } from './types';

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
        // Fetch more cities to ensure priority cities (Siargao, Ubud) are included
        const cities = await withTimeout(
          getPopularCitiesWithCountry(20),
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

        // Prioritize specific cities for "Popular with Solo Women"
        // Fallback data for cities that may not be in DB yet
        const FALLBACK_CITIES: Record<string, CityWithCountry> = {
          siargao: {
            id: 'fallback-siargao',
            countryId: 'country-ph',
            slug: 'siargao',
            name: 'Siargao',
            timezone: 'Asia/Manila',
            centerLat: 9.8482,
            centerLng: 126.0458,
            isActive: true,
            orderIndex: 1,
            heroImageUrl: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800',
            shortBlurb: 'Surf capital of the Philippines',
            badgeLabel: null,
            isFeatured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // Content fields
            title: 'Siargao',
            subtitle: 'Philippines\' surf paradise',
            summary: null,
            summaryMd: null,
            contentMd: null,
            whyWeLoveMd: null,
            safetyRating: 'generally_safe',
            soloFriendly: true,
            soloLevel: 'beginner',
            bestMonths: null,
            bestTimeToVisit: null,
            currency: 'PHP',
            language: 'Filipino, English',
            visaNote: null,
            highlights: null,
            avgDailyBudgetUsd: null,
            internetQuality: 'good',
            englishFriendliness: 'high',
            goodForInterests: null,
            bestFor: null,
            cultureEtiquetteMd: null,
            safetyWomenMd: null,
            portraitMd: null,
            publishedAt: null,
            transportMd: null,
            topThingsToDo: null,
            // CityWithCountry extensions
            countryName: 'Philippines',
            countrySlug: 'philippines',
          },
        };

        const PRIORITY_SLUGS = ['siargao', 'ubud'];
        const priorityCities: CityWithCountry[] = [];

        for (const slug of PRIORITY_SLUGS) {
          const found = cities.find(c => c.slug === slug);
          if (found) {
            priorityCities.push(found);
          } else if (FALLBACK_CITIES[slug]) {
            priorityCities.push(FALLBACK_CITIES[slug]);
          }
        }

        const otherCities = cities.filter(c => !PRIORITY_SLUGS.includes(c.slug));
        // Put priority cities first, then others, limit to 12 total for the feed
        const prioritized = [...priorityCities, ...otherCities].slice(0, 12);

        const feed = buildFeed(collectionsWithItems, prioritized, lenses);
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
