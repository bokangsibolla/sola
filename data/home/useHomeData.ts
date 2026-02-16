import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import {
  fetchHeroState,
  fetchPersonalizedCities,
  fetchActiveTravelUpdate,
  fetchCommunityHighlightsVisual,
  fetchUserFirstName,
  fetchSavedPlacesPreview,
} from './homeApi';
import type {
  HeroState,
  PersonalizedCity,
  TravelUpdate,
  CommunityHighlightThreadVisual,
  SavedPlacePreview,
} from './types';

interface HomeData {
  firstName: string | null;
  heroState: HeroState;
  personalizedCities: PersonalizedCity[];
  travelUpdate: TravelUpdate | null;
  communityHighlights: CommunityHighlightThreadVisual[];
  savedPlaces: SavedPlacePreview[];
  loading: boolean;
  refetch: () => void;
}

const DEFAULT_HERO: HeroState = {
  kind: 'featured',
  city: {
    id: '',
    name: 'Bangkok',
    countryName: 'Thailand',
    heroImageUrl: '',
    slug: 'bangkok',
    shortBlurb: 'Temples, street food, and a solo traveler favorite',
    timezone: 'Asia/Bangkok',
  },
  upcomingTrip: null,
  upcomingCityImageUrl: null,
};

export function useHomeData(): HomeData {
  const { userId } = useAuth();

  const {
    data: firstName,
  } = useData<string | null>(
    () => (userId ? fetchUserFirstName(userId) : Promise.resolve(null)),
    ['home-first-name', userId ?? ''],
  );

  const {
    data: heroState,
    loading: heroLoading,
    refetch: refetchHero,
  } = useData<HeroState>(
    () => (userId ? fetchHeroState(userId) : Promise.resolve(DEFAULT_HERO)),
    ['home-hero', userId ?? ''],
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
      if (!heroState || heroState.kind === 'featured') {
        return fetchActiveTravelUpdate();
      }
      const countryIds = heroState.trip.stops
        .map((s) => s.countryIso2)
        .filter(Boolean);
      return fetchActiveTravelUpdate(countryIds.length > 0 ? countryIds : undefined);
    },
    ['home-update', userId ?? '', heroState?.kind ?? ''],
  );

  const {
    data: communityHighlights,
    loading: communityLoading,
    refetch: refetchCommunity,
  } = useData<CommunityHighlightThreadVisual[]>(
    () => (userId ? fetchCommunityHighlightsVisual(userId, 3) : Promise.resolve([])),
    ['home-community', userId ?? ''],
  );

  const {
    data: savedPlaces,
    refetch: refetchSaved,
  } = useData<SavedPlacePreview[]>(
    () => (userId ? fetchSavedPlacesPreview(userId, 4) : Promise.resolve([])),
    ['home-saved-preview', userId ?? ''],
  );

  const loading = heroLoading || citiesLoading || updateLoading || communityLoading;

  const refetch = () => {
    refetchHero();
    refetchCities();
    refetchUpdate();
    refetchCommunity();
    refetchSaved();
  };

  return {
    firstName: firstName ?? null,
    heroState: heroState ?? DEFAULT_HERO,
    personalizedCities: personalizedCities ?? [],
    travelUpdate: travelUpdate ?? null,
    communityHighlights: communityHighlights ?? [],
    savedPlaces: savedPlaces ?? [],
    loading,
    refetch,
  };
}
