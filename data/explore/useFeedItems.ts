// data/explore/useFeedItems.ts
import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { getPopularCitiesWithCountry, getCountries, getSavedPlaces, getPlacesByCity, getSavedPlacesWithDetails } from '../api';
import type { Place } from '../types';
import { getExploreCollections, getExploreCollectionItems } from '../collections';
import { buildFeed, buildTravellingFeed } from './feedBuilder';
import type { PersonalFeedContext } from './feedBuilder';
import { useAppMode } from '@/state/AppModeContext';
import { useAuth } from '@/state/AuthContext';
import { getRecentCity } from './recentBrowsing';
import { getCommunityLastVisit } from '../community/lastVisit';
import { getNewCommunityActivity } from '../community/communityApi';
import { getTripsGrouped } from '../trips/tripApi';
import type { ExploreCollectionWithItems } from '../types';
import type { FeedItem } from './types';

const INITIAL_FEED: FeedItem[] = [];

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
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
  const { mode, activeTripInfo } = useAppMode();
  const { userId } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function loadFeed() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch countries and cities in parallel (critical path)
        const [countriesResult, citiesResult] = await Promise.all([
          withTimeout(getCountries(), 5000, 'getCountries'),
          withTimeout(getPopularCitiesWithCountry(20), 5000, 'getCities'),
        ]);

        if (cancelled) return;

        // Fetch all active collections (optional — failure doesn't break feed)
        let collectionsWithItems: ExploreCollectionWithItems[] = [];
        try {
          const collections = await withTimeout(
            getExploreCollections(),
            5000,
            'getCollections'
          );

          // Resolve items for each collection in parallel
          const resolved = await Promise.all(
            collections.map(async (col) => {
              try {
                const items = await getExploreCollectionItems(col);
                if (items.length < col.minItems) return null;
                return { ...col, items } as ExploreCollectionWithItems;
              } catch {
                return null;
              }
            })
          );

          collectionsWithItems = resolved.filter(
            (c): c is ExploreCollectionWithItems => c !== null
          );
        } catch (e) {
          Sentry.addBreadcrumb({ message: 'Collections fetch failed', data: { error: e } });
        }

        if (cancelled) return;

        let feed: FeedItem[];

        if (mode === 'travelling' && activeTripInfo?.city.id && userId) {
          // Fetch city-specific data for travelling mode
          let savedInCity: Place[] = [];
          let placesInCity: Place[] = [];

          try {
            const [allSaved, allCityPlaces] = await Promise.all([
              withTimeout(getSavedPlaces(userId), 5000, 'getSavedPlaces'),
              withTimeout(getPlacesByCity(activeTripInfo.city.id), 5000, 'getPlacesByCity'),
            ]);

            // Filter saved places to those in the trip city
            const cityPlaceIds = new Set(allCityPlaces.map((p) => p.id));
            savedInCity = allSaved
              .filter((sp) => cityPlaceIds.has(sp.placeId))
              .map((sp) => allCityPlaces.find((p) => p.id === sp.placeId))
              .filter((p): p is Place => p !== undefined);

            placesInCity = allCityPlaces;
          } catch {
            // Non-critical — continue with empty city data
          }

          feed = buildTravellingFeed(
            savedInCity,
            placesInCity,
            activeTripInfo.city.countryIso2,
            activeTripInfo.city.name,
            collectionsWithItems,
            citiesResult,
            countriesResult,
          );
        } else {
          // Fetch personal context in parallel (all non-critical)
          let personal: PersonalFeedContext | undefined;

          if (userId) {
            const personalResults = await Promise.allSettled([
              getSavedPlacesWithDetails(userId, 10),
              getTripsGrouped(userId),
              getRecentCity(),
              getCommunityLastVisit().then(async (lastVisit) => {
                if (!lastVisit) return null;
                return getNewCommunityActivity(userId, lastVisit);
              }),
            ]);

            if (cancelled) return;

            personal = {};

            // Saved places
            if (personalResults[0].status === 'fulfilled' && personalResults[0].value.length > 0) {
              const savedWithDetails = personalResults[0].value;
              personal.savedPlaces = {
                places: savedWithDetails,
                totalCount: savedWithDetails.length,
              };
            }

            // Upcoming trip
            if (personalResults[1].status === 'fulfilled') {
              const grouped = personalResults[1].value;
              const nextUpcoming = grouped.upcoming[0];
              if (nextUpcoming && nextUpcoming.arriving) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const arriving = new Date(nextUpcoming.arriving);
                arriving.setHours(0, 0, 0, 0);
                const daysUntil = Math.max(0, Math.ceil((arriving.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

                if (daysUntil > 0 && daysUntil <= 30) {
                  personal.upcomingTrip = {
                    tripId: nextUpcoming.id,
                    destinationName: nextUpcoming.destinationName,
                    citySlug: null, // Trip card navigates by trip ID
                    countryIso2: nextUpcoming.countryIso2,
                    daysUntil,
                  };
                }
              }
            }

            // Recent city
            if (personalResults[2].status === 'fulfilled' && personalResults[2].value) {
              personal.recentCity = personalResults[2].value;
            }

            // Community activity
            if (personalResults[3].status === 'fulfilled' && personalResults[3].value) {
              personal.communityActivity = personalResults[3].value;
            }

            // If nothing personal was found, don't pass context
            const hasPersonal = personal.savedPlaces || personal.upcomingTrip ||
              personal.recentCity || personal.communityActivity;
            if (!hasPersonal) personal = undefined;
          }

          feed = buildFeed(collectionsWithItems, citiesResult, countriesResult, personal);
        }

        setFeedItems(feed);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error('Failed to load feed'));
          Sentry.captureException(e);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadFeed();
    return () => { cancelled = true; };
  }, [refreshKey, mode, activeTripInfo?.city?.id, userId]);

  return {
    feedItems,
    isLoading,
    error,
    refresh: () => setRefreshKey(k => k + 1),
  };
}
