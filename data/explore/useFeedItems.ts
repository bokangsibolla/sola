// data/explore/useFeedItems.ts
import { useState, useEffect } from 'react';
import {
  getCountries,
  getPopularCities,
  getCountryById,
  getActivitiesByCity,
  getPlaceFirstImage,
} from '../api';
import { buildFeed } from './feedBuilder';
import type { FeedItem, EditorialCollection, CityWithCountry, ActivityWithCity } from './types';

// Mock editorial collections until database table exists
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

interface UseFeedItemsResult {
  feedItems: FeedItem[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useFeedItems(): UseFeedItemsResult {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadFeed() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch countries
        const countries = await getCountries();

        // Fetch popular cities and enrich with country info (in parallel)
        const cities = await getPopularCities(8);

        if (cancelled) return;

        const citiesWithActivities = await Promise.all(
          cities.map(async (city) => {
            const [country, activities] = await Promise.all([
              getCountryById(city.countryId),
              getActivitiesByCity(city.id),
            ]);

            // Get images for activities (in parallel)
            const activitiesWithImages: ActivityWithCity[] = await Promise.all(
              activities.slice(0, 4).map(async (activity) => {
                const imageUrl = await getPlaceFirstImage(activity.id);
                return {
                  ...activity,
                  cityName: city.name,
                  imageUrl,
                };
              })
            );

            return {
              city: {
                ...city,
                countryName: country?.name ?? '',
                countrySlug: country?.slug ?? '',
              } as CityWithCountry,
              activities: activitiesWithImages,
            };
          })
        );

        if (cancelled) return;

        const feed = buildFeed(MOCK_EDITORIALS, countries, citiesWithActivities);
        setFeedItems(feed);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load feed'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadFeed();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  return { feedItems, isLoading, error, refresh };
}
