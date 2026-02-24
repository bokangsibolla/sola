import { useMemo, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import {
  getPopularPlacesWithCity,
  getPlacesByCategoryWithCity,
} from '@/data/api';
import { fetchCommunityHighlightsVisual } from '@/data/home/homeApi';
import type { PlaceWithCity } from '@/data/types';
import type { CommunityHighlightThreadVisual } from '@/data/home/types';

const FEATURE_SEEN_KEY = 'home_feature_seen';

export interface FeatureSeenState {
  buddies_seen: boolean;
  trip_created: boolean;
  community_visited: boolean;
}

const DEFAULT_FEATURE_SEEN: FeatureSeenState = {
  buddies_seen: false,
  trip_created: false,
  community_visited: false,
};

// Category groups for horizontal rows
const STAY_TYPES = ['hostel', 'hotel', 'homestay'];
const CAFE_TYPES = ['cafe', 'coworking', 'restaurant'];
const NIGHTLIFE_TYPES = ['bar', 'club', 'rooftop'];
const EXPERIENCE_TYPES = ['tour', 'activity', 'landmark'];

export function useNewUserFeed() {
  const { userId } = useAuth();
  const [featureSeen, setFeatureSeen] = useState<FeatureSeenState>(DEFAULT_FEATURE_SEEN);

  // Load feature-seen state from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(FEATURE_SEEN_KEY).then((raw) => {
      if (raw) {
        try {
          setFeatureSeen({ ...DEFAULT_FEATURE_SEEN, ...JSON.parse(raw) });
        } catch {
          // ignore parse errors
        }
      }
    });
  }, []);

  // Hero places (popular, with images)
  const {
    data: heroPlaces,
    loading: heroLoading,
    refetch: refetchHero,
  } = useData<PlaceWithCity[]>(
    () => getPopularPlacesWithCity(6),
    ['new-user-hero-places'],
  );

  // Row 1: Where to stay
  const {
    data: stayPlaces,
    loading: stayLoading,
    refetch: refetchStay,
  } = useData<PlaceWithCity[]>(
    () => getPlacesByCategoryWithCity(STAY_TYPES, 5),
    ['new-user-stay-places'],
  );

  // Row 2: Cafes & coworking
  const {
    data: cafePlaces,
    loading: cafeLoading,
    refetch: refetchCafe,
  } = useData<PlaceWithCity[]>(
    () => getPlacesByCategoryWithCity(CAFE_TYPES, 5),
    ['new-user-cafe-places'],
  );

  // Replacement row: Nightlife (replaces buddies feature card)
  const {
    data: nightlifePlaces,
    refetch: refetchNightlife,
  } = useData<PlaceWithCity[]>(
    () => featureSeen.buddies_seen ? getPlacesByCategoryWithCity(NIGHTLIFE_TYPES, 5) : Promise.resolve([]),
    ['new-user-nightlife-places', featureSeen.buddies_seen],
  );

  // Replacement row: Experiences (replaces trip feature card)
  const {
    data: experiencePlaces,
    refetch: refetchExperience,
  } = useData<PlaceWithCity[]>(
    () => featureSeen.trip_created ? getPlacesByCategoryWithCity(EXPERIENCE_TYPES, 5) : Promise.resolve([]),
    ['new-user-experience-places', featureSeen.trip_created],
  );

  // Community thread
  const {
    data: communityThread,
    refetch: refetchCommunity,
  } = useData<CommunityHighlightThreadVisual | null>(
    () =>
      userId
        ? fetchCommunityHighlightsVisual(userId, 1).then((t) => t[0] ?? null)
        : Promise.resolve(null),
    ['new-user-community', userId ?? ''],
  );

  const loading = heroLoading || stayLoading || cafeLoading;

  const refetch = useCallback(() => {
    refetchHero();
    refetchStay();
    refetchCafe();
    refetchNightlife();
    refetchExperience();
    refetchCommunity();
  }, [refetchHero, refetchStay, refetchCafe, refetchNightlife, refetchExperience, refetchCommunity]);

  // Pick 2-3 hero places from different cities
  const heroes = useMemo(() => {
    if (!heroPlaces || heroPlaces.length === 0) return [];
    const first = heroPlaces[0];
    const second = heroPlaces.find((p) => p.cityId !== first.cityId) ?? heroPlaces[1];
    const third = heroPlaces.find(
      (p) => p.cityId !== first.cityId && p.id !== second?.id,
    ) ?? heroPlaces[2];
    return [first, second, third].filter(Boolean) as PlaceWithCity[];
  }, [heroPlaces]);

  return {
    heroes,
    stayPlaces: stayPlaces ?? [],
    cafePlaces: cafePlaces ?? [],
    nightlifePlaces: nightlifePlaces ?? [],
    experiencePlaces: experiencePlaces ?? [],
    communityThread,
    featureSeen,
    loading,
    refetch,
  };
}

/** Call this from tab screens to mark a feature as seen */
export async function markFeatureSeen(key: keyof FeatureSeenState): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(FEATURE_SEEN_KEY);
    const state: FeatureSeenState = raw
      ? { ...DEFAULT_FEATURE_SEEN, ...JSON.parse(raw) }
      : { ...DEFAULT_FEATURE_SEEN };
    state[key] = true;
    await AsyncStorage.setItem(FEATURE_SEEN_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}
