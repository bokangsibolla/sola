import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import {
  getBlockedUserIds,
  getProfileById,
  getNearbyTravelers,
  getTravelersInCountry,
  getTravelersWithSharedInterests,
  getSuggestedTravelers,
  getConnectionRequests,
} from '@/data/api';
import type { Profile, ConnectionRequest } from '@/data/types';

export interface TravelersFeedData {
  nearby: Profile[];
  sharedInterests: Profile[];
  suggested: Profile[];
  pendingReceived: ConnectionRequest[];
  userProfile: Profile | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTravelersFeed(): TravelersFeedData {
  const { userId } = useAuth();

  const { data: userProfile } = useData(
    () => (userId ? getProfileById(userId) : Promise.resolve(null)),
    [userId],
  );

  const { data: blockedIds } = useData(
    () => (userId ? getBlockedUserIds(userId) : Promise.resolve([])),
    [userId],
  );

  const blocked = blockedIds ?? [];
  const cityName = userProfile?.locationCityName;
  const countryName = userProfile?.locationCountryName;
  const interests = userProfile?.interests ?? [];

  const nearbyQuery = useQuery({
    queryKey: ['travelers', 'nearby', userId, cityName],
    queryFn: () => getNearbyTravelers(userId!, cityName!, blocked),
    enabled: !!userId && !!cityName,
    staleTime: 60_000,
  });

  const countryQuery = useQuery({
    queryKey: ['travelers', 'country', userId, countryName],
    queryFn: () => getTravelersInCountry(userId!, countryName!, blocked),
    enabled: !!userId && !!countryName && !cityName,
    staleTime: 60_000,
  });

  const interestsQuery = useQuery({
    queryKey: ['travelers', 'interests', userId, interests.join(',')],
    queryFn: () => getTravelersWithSharedInterests(userId!, interests, blocked),
    enabled: !!userId && interests.length > 0,
    staleTime: 60_000,
  });

  const nearbyIds = (nearbyQuery.data ?? countryQuery.data ?? []).map((p) => p.id);
  const interestsIds = (interestsQuery.data ?? []).map((p) => p.id);
  const excludeFromSuggested = [...nearbyIds, ...interestsIds];

  const suggestedQuery = useQuery({
    queryKey: ['travelers', 'suggested', userId, excludeFromSuggested.join(',')],
    queryFn: () => getSuggestedTravelers(userId!, excludeFromSuggested, blocked),
    enabled: !!userId,
    staleTime: 60_000,
  });

  const pendingQuery = useQuery({
    queryKey: ['travelers', 'pending', userId],
    queryFn: () => getConnectionRequests(userId!, 'received'),
    enabled: !!userId,
    staleTime: 30_000,
  });

  const isLoading = nearbyQuery.isLoading || interestsQuery.isLoading || suggestedQuery.isLoading;
  const error = nearbyQuery.error ?? interestsQuery.error ?? suggestedQuery.error ?? null;

  return {
    nearby: nearbyQuery.data ?? countryQuery.data ?? [],
    sharedInterests: interestsQuery.data ?? [],
    suggested: suggestedQuery.data ?? [],
    pendingReceived: pendingQuery.data ?? [],
    userProfile: userProfile ?? null,
    isLoading,
    error: error as Error | null,
    refetch: () => {
      nearbyQuery.refetch();
      countryQuery.refetch();
      interestsQuery.refetch();
      suggestedQuery.refetch();
      pendingQuery.refetch();
    },
  };
}
