import { useData } from '@/hooks/useData';
import {
  getCitiesByTags,
  getCountriesByTags,
  getSavedPlacesWithDetails,
  getActivitiesByCity,
  getPlaceFirstImage,
} from '@/data/api';
import { useAuth } from '@/state/AuthContext';
import type { CityWithCountry } from '@/data/explore/types';
import type { Country } from '@/data/types';

// ---------------------------------------------------------------------------
// Vibe Section Config
// ---------------------------------------------------------------------------

export interface VibeSectionConfig {
  id: string;
  title: string;
  tags: string[];
  tagMode: 'all' | 'any';
  entityType: 'city' | 'country';
  minResults: number;
}

export const VIBE_SECTIONS: VibeSectionConfig[] = [
  {
    id: 'ocean',
    title: 'Wake Up to the Ocean',
    tags: ['beach', 'island'],
    tagMode: 'any',
    entityType: 'city',
    minResults: 2,
  },
  {
    id: 'foodie',
    title: 'Eat Your Way Through',
    tags: ['foodie'],
    tagMode: 'all',
    entityType: 'city',
    minResults: 2,
  },
  {
    id: 'adventure',
    title: 'Adventure Awaits',
    tags: ['adventure', 'nature_outdoors'],
    tagMode: 'any',
    entityType: 'city',
    minResults: 2,
  },
  {
    id: 'slow-down',
    title: 'Slow Down Somewhere Beautiful',
    tags: ['relaxed', 'slow_travel'],
    tagMode: 'all',
    entityType: 'city',
    minResults: 2,
  },
  {
    id: 'culture',
    title: 'Where the Culture Runs Deep',
    tags: ['city_culture', 'aesthetic'],
    tagMode: 'all',
    entityType: 'city',
    minResults: 2,
  },
  {
    id: 'first-solo',
    title: 'Great for First Timers',
    tags: ['first_solo_trip'],
    tagMode: 'all',
    entityType: 'country',
    minResults: 2,
  },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ActivityItem {
  id: string;
  name: string;
  slug: string;
  cityName: string;
  imageUrl: string | null;
}

export interface VibeSectionData {
  config: VibeSectionConfig;
  cities?: CityWithCountry[];
  countries?: Country[];
  activities: ActivityItem[];
}

export interface SavedPlaceItem {
  placeId: string;
  placeName: string;
  imageUrl: string | null;
  cityName: string | null;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useHomeMoodboard() {
  const { userId } = useAuth();

  const { data: sections, loading: sectionsLoading, refetch } = useData<VibeSectionData[]>(
    async () => {
      // First, fetch all sections in parallel
      const rawResults = await Promise.allSettled(
        VIBE_SECTIONS.map(async (config) => {
          if (config.entityType === 'city') {
            const cities = await getCitiesByTags(config.tags, config.tagMode);
            return { config, cities, activities: [] as ActivityItem[] } as VibeSectionData;
          } else {
            const countries = await getCountriesByTags(config.tags);
            return { config, countries, activities: [] as ActivityItem[] } as VibeSectionData;
          }
        }),
      );

      const fulfilled = rawResults
        .filter((r): r is PromiseFulfilledResult<VibeSectionData> => r.status === 'fulfilled')
        .map((r) => r.value);

      // Deduplicate cities across sections — first section wins
      const usedCityIds = new Set<string>();
      for (const section of fulfilled) {
        if (section.cities) {
          section.cities = section.cities.filter((c) => {
            if (usedCityIds.has(c.id)) return false;
            usedCityIds.add(c.id);
            return true;
          });
        }
      }

      // Filter out sections that now have too few results
      const validSections = fulfilled.filter((section) => {
        const count = (section.cities?.length ?? 0) + (section.countries?.length ?? 0);
        return count >= section.config.minResults;
      });

      // Fetch activities for city-based sections (top 3 cities per section)
      await Promise.allSettled(
        validSections.map(async (section) => {
          if (!section.cities || section.cities.length === 0) return;

          const citySlice = section.cities.slice(0, 3);
          const activityResults = await Promise.allSettled(
            citySlice.map((city) => getActivitiesByCity(city.id)),
          );

          const rawActivities: { id: string; name: string; slug: string; cityName: string }[] = [];
          activityResults.forEach((result, idx) => {
            if (result.status !== 'fulfilled') return;
            const cityName = citySlice[idx].name;
            for (const place of result.value.slice(0, 2)) {
              rawActivities.push({
                id: place.id,
                name: place.name,
                slug: place.slug,
                cityName,
              });
            }
          });

          const sliced = rawActivities.slice(0, 4);

          // Fetch first image for each activity in parallel
          const imageResults = await Promise.allSettled(
            sliced.map((a) => getPlaceFirstImage(a.id)),
          );

          section.activities = sliced.map((a, i) => ({
            ...a,
            imageUrl: imageResults[i].status === 'fulfilled' ? imageResults[i].value : null,
          }));
        }),
      );

      return validSections;
    },
    ['home-moodboard'],
  );

  // Fetch saved places for shortlist
  const { data: savedPlaces } = useData<SavedPlaceItem[]>(
    () => (userId ? getSavedPlacesWithDetails(userId, 10) : Promise.resolve([])),
    ['home-shortlist', userId ?? ''],
  );

  return {
    sections: sections ?? [],
    savedPlaces: savedPlaces ?? [],
    loading: sectionsLoading,
    refetch,
  };
}
