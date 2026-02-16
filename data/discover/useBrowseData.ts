import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchBrowseData, fetchCommunityCountsByCountry } from './discoverApi';
import {
  CONTINENT_LABELS,
  CONTINENT_ORDER,
} from './types';
import type {
  ContinentKey,
  ContinentSummary,
  BrowseCountryWithMeta,
} from './types';

// Use Record instead of Map — React Query's structural sharing can break Map objects.
type CountriesByContinentRecord = Partial<Record<ContinentKey, BrowseCountryWithMeta[]>>;

interface BrowseDataResult {
  continents: ContinentSummary[];
  countriesByContinent: CountriesByContinentRecord;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useBrowseData(): BrowseDataResult {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['browseData'],
    queryFn: async () => {
      const [browseMap, communityCounts] = await Promise.all([
        fetchBrowseData(),
        fetchCommunityCountsByCountry(),
      ]);

      const continents: ContinentSummary[] = [];
      const countriesByContinent: CountriesByContinentRecord = {};

      for (const key of CONTINENT_ORDER) {
        const countries = browseMap.get(key) ?? [];
        if (countries.length === 0) continue;

        const cityCount = countries.reduce((sum, c) => sum + c.cities.length, 0);

        continents.push({
          key,
          label: CONTINENT_LABELS[key],
          countryCount: countries.length,
          cityCount,
          imageUrl: countries[0]?.heroImageUrl ?? null,
        });

        const withMeta: BrowseCountryWithMeta[] = countries.map((c) => ({
          ...c,
          communityPostCount: communityCounts.get(c.id) ?? 0,
        }));

        countriesByContinent[key] = withMeta;
      }

      return { continents, countriesByContinent };
    },
    staleTime: 60_000,
  });

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['browseData'] });
  }, [queryClient]);

  return {
    continents: data?.continents ?? [],
    countriesByContinent: data?.countriesByContinent ?? {},
    isLoading,
    error: error ?? null,
    refresh,
  };
}
