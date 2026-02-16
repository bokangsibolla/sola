import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import {
  fetchTripBlock,
  fetchPersonalizedCities,
  fetchActiveTravelUpdate,
  fetchCommunityHighlights,
} from './homeApi';
import type {
  TripBlockState,
  PersonalizedCity,
  TravelUpdate,
  CommunityHighlightThread,
} from './types';

interface HomeData {
  tripBlock: TripBlockState;
  personalizedCities: PersonalizedCity[];
  travelUpdate: TravelUpdate | null;
  communityHighlights: CommunityHighlightThread[];
  loading: boolean;
  refetch: () => void;
}

export function useHomeData(): HomeData {
  const { userId } = useAuth();

  const {
    data: tripBlock,
    loading: tripLoading,
    refetch: refetchTrip,
  } = useData<TripBlockState>(
    () => (userId ? fetchTripBlock(userId) : Promise.resolve({ kind: 'none' as const })),
    ['home-trip', userId ?? ''],
  );

  const {
    data: personalizedCities,
    loading: citiesLoading,
    refetch: refetchCities,
  } = useData<PersonalizedCity[]>(
    () => (userId ? fetchPersonalizedCities(userId, 10) : Promise.resolve([])),
    ['home-cities', userId ?? ''],
  );

  const {
    data: travelUpdate,
    loading: updateLoading,
    refetch: refetchUpdate,
  } = useData<TravelUpdate | null>(
    () => {
      if (!tripBlock || tripBlock.kind === 'none') {
        return fetchActiveTravelUpdate();
      }
      // Extract country IDs from trip stops
      const countryIds = tripBlock.trip.stops
        .map((s) => s.countryIso2)
        .filter(Boolean);
      return fetchActiveTravelUpdate(countryIds.length > 0 ? countryIds : undefined);
    },
    ['home-update', userId ?? '', tripBlock?.kind ?? ''],
  );

  const {
    data: communityHighlights,
    loading: communityLoading,
    refetch: refetchCommunity,
  } = useData<CommunityHighlightThread[]>(
    () => (userId ? fetchCommunityHighlights(userId, 2) : Promise.resolve([])),
    ['home-community', userId ?? ''],
  );

  const loading = tripLoading || citiesLoading || updateLoading || communityLoading;

  const refetch = () => {
    refetchTrip();
    refetchCities();
    refetchUpdate();
    refetchCommunity();
  };

  return {
    tripBlock: tripBlock ?? { kind: 'none' },
    personalizedCities: personalizedCities ?? [],
    travelUpdate: travelUpdate ?? null,
    communityHighlights: communityHighlights ?? [],
    loading,
    refetch,
  };
}
