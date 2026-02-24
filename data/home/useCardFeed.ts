import { useMemo } from 'react';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import { getProfileById, getProfileTags } from '@/data/api';
import { getTripsGrouped } from '@/data/trips/tripApi';
import type { Profile, ProfileTag } from '@/data/types';
import type { GroupedTrips, TripWithStops } from '@/data/trips/types';
import {
  getUserState,
  assembleCards,
  type FeedCard,
  type UserState,
} from './cardEngine';

export function useCardFeed() {
  const { userId } = useAuth();

  const {
    data: profile,
    loading: profileLoading,
    refetch: refetchProfile,
  } = useData<Profile | undefined>(
    () => (userId ? getProfileById(userId) : Promise.resolve(undefined)),
    ['card-feed-profile', userId ?? ''],
  );

  const {
    data: grouped,
    loading: tripsLoading,
    refetch: refetchTrips,
  } = useData<GroupedTrips | null>(
    () => (userId ? getTripsGrouped(userId) : Promise.resolve(null)),
    ['card-feed-trips', userId ?? ''],
  );

  const { data: profileTags, refetch: refetchTags } = useData<ProfileTag[]>(
    () => (userId ? getProfileTags(userId) : Promise.resolve([])),
    ['card-feed-tags', userId ?? ''],
  );

  const allTrips: TripWithStops[] = useMemo(() => {
    if (!grouped) return [];
    const trips: TripWithStops[] = [];
    if (grouped.current) trips.push(grouped.current);
    trips.push(...grouped.upcoming);
    trips.push(...grouped.past);
    return trips;
  }, [grouped]);

  const userState: UserState = useMemo(
    () => (profile ? getUserState(profile, allTrips) : 'new'),
    [profile, allTrips],
  );

  const cards: FeedCard[] = useMemo(() => {
    if (!profile || !grouped) return [];
    return assembleCards({
      state: userState,
      profile,
      allTrips,
      grouped,
      profileTags: profileTags ?? [],
    });
  }, [userState, profile, allTrips, grouped, profileTags]);

  const loading = profileLoading || tripsLoading;

  const refetch = () => {
    refetchProfile();
    refetchTrips();
    refetchTags();
  };

  return { cards, userState, profile: profile ?? null, loading, refetch };
}
