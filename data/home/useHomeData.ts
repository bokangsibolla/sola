import { useMemo } from 'react';
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
import { fetchHomeSections, fetchSearchChips } from './sectionApi';
import { buildHomeSections } from './buildHomeSections';
import type {
  HeroState,
  PersonalizedCity,
  TravelUpdate,
  CommunityHighlightThreadVisual,
  SavedPlacePreview,
} from './types';
import type { HomeSectionRow, SearchChip, HomeSection } from './sectionTypes';

interface HomeData {
  firstName: string | null;
  heroState: HeroState;
  personalizedCities: PersonalizedCity[];
  travelUpdate: TravelUpdate | null;
  communityHighlights: CommunityHighlightThreadVisual[];
  savedPlaces: SavedPlacePreview[];
  homeSections: HomeSection[];
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

  // Section builder data
  const {
    data: sectionRows,
    loading: sectionsLoading,
    refetch: refetchSections,
  } = useData<HomeSectionRow[]>(
    () => fetchHomeSections(),
    ['home-sections'],
  );

  const {
    data: searchChips,
    refetch: refetchChips,
  } = useData<SearchChip[]>(
    () => fetchSearchChips('home'),
    ['home-chips'],
  );

  const loading = heroLoading || citiesLoading || updateLoading || communityLoading || sectionsLoading;

  const refetch = () => {
    refetchHero();
    refetchCities();
    refetchUpdate();
    refetchCommunity();
    refetchSaved();
    refetchSections();
    refetchChips();
  };

  // Build ordered sections from DB rows + data
  const homeSections = useMemo(
    () =>
      buildHomeSections({
        rows: sectionRows ?? [],
        chips: searchChips ?? [],
        heroState: heroState ?? DEFAULT_HERO,
        travelUpdate: travelUpdate ?? null,
        savedPlaces: savedPlaces ?? [],
        personalizedCities: personalizedCities ?? [],
        communityHighlights: communityHighlights ?? [],
      }),
    [sectionRows, searchChips, heroState, travelUpdate, savedPlaces, personalizedCities, communityHighlights],
  );

  return {
    firstName: firstName ?? null,
    heroState: heroState ?? DEFAULT_HERO,
    personalizedCities: personalizedCities ?? [],
    travelUpdate: travelUpdate ?? null,
    communityHighlights: communityHighlights ?? [],
    savedPlaces: savedPlaces ?? [],
    homeSections,
    loading,
    refetch,
  };
}
