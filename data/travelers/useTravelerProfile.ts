import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import {
  getProfileById,
  getConnectionStatus,
  getConnectionRequests,
  getUserVisitedCountries,
  getProfileTags,
} from '@/data/api';
import type { UserVisitedCountry } from '@/data/api';
import {
  getPublicTripsGrouped,
  getVisitedCountries,
  getTripsGrouped,
} from '@/data/trips/tripApi';
import { formatDateShort } from '@/data/trips/helpers';
import type { VisitedCountry } from '@/data/trips/tripApi';
import { getConnectionContext, getSharedInterests } from './connectionContext';
import type { Profile, ConnectionStatus, ConnectionRequest, ProfileTag } from '@/data/types';
import type { GroupedTrips } from '@/data/trips/types';

export interface TravelerProfileData {
  profile: Profile | null;
  userProfile: Profile | null;
  connectionStatus: ConnectionStatus;
  incomingRequest: ConnectionRequest | undefined;
  sharedInterests: string[];
  contextLabel: string | undefined;
  trips: GroupedTrips;
  visitedCountries: VisitedCountry[];
  userManagedCountries: UserVisitedCountry[];
  profileTags: ProfileTag[];
  tripOverlaps: Map<string, string>;
  totalTripCount: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTravelerProfile(targetUserId: string | undefined): TravelerProfileData {
  const { userId } = useAuth();

  const { data: profile, loading: profileLoading, error: profileError, refetch: refetchProfile } = useData(
    () => (targetUserId ? getProfileById(targetUserId) : Promise.resolve(null)),
    [targetUserId],
  );

  const { data: userProfile } = useData(
    () => (userId ? getProfileById(userId) : Promise.resolve(null)),
    [userId],
  );

  const { data: fetchedStatus, refetch: refetchStatus } = useData(
    () => (userId && targetUserId
      ? getConnectionStatus(userId, targetUserId)
      : Promise.resolve('none' as ConnectionStatus)),
    [userId, targetUserId],
  );

  const { data: pendingRequests } = useData(
    () => (userId ? getConnectionRequests(userId, 'received') : Promise.resolve([])),
    [userId],
  );

  const connectionStatus = fetchedStatus ?? 'none';
  const pendingList = Array.isArray(pendingRequests) ? pendingRequests : [];
  const incomingRequest = pendingList.find((r) => r.senderId === targetUserId);

  const tripsQuery = useQuery({
    queryKey: ['travelerProfile', 'trips', targetUserId],
    queryFn: () => getPublicTripsGrouped(targetUserId!),
    enabled: !!targetUserId,
    staleTime: 60_000,
  });

  const countriesQuery = useQuery({
    queryKey: ['travelerProfile', 'countries', targetUserId],
    queryFn: () => getVisitedCountries(targetUserId!),
    enabled: !!targetUserId,
    staleTime: 60_000,
  });

  const userManagedCountriesQuery = useQuery({
    queryKey: ['travelerProfile', 'userVisitedCountries', targetUserId],
    queryFn: () => getUserVisitedCountries(targetUserId!),
    enabled: !!targetUserId,
    staleTime: 60_000,
  });

  const { data: profileTags } = useData(
    () => (targetUserId ? getProfileTags(targetUserId) : Promise.resolve([])),
    [targetUserId, 'profile-tags'],
  );

  const viewerTripsQuery = useQuery({
    queryKey: ['travelerProfile', 'viewerTrips', userId],
    queryFn: () => getTripsGrouped(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });

  const tripOverlaps = useMemo(() => {
    const map = new Map<string, string>();
    if (!viewerTripsQuery.data || !tripsQuery.data) return map;

    const viewerTrips = (viewerTripsQuery.data.current ? [viewerTripsQuery.data.current] : [])
      .concat(Array.isArray(viewerTripsQuery.data.upcoming) ? viewerTripsQuery.data.upcoming : []);
    const targetTrips = (tripsQuery.data.current ? [tripsQuery.data.current] : [])
      .concat(Array.isArray(tripsQuery.data.upcoming) ? tripsQuery.data.upcoming : []);

    for (const vt of viewerTrips) {
      for (const tt of targetTrips) {
        const vStops = vt.stops ?? [];
        const tStops = tt.stops ?? [];
        for (const vs of vStops) {
          for (const ts of tStops) {
            if (vs.countryIso2 === ts.countryIso2 && vs.startDate && vs.endDate && ts.startDate && ts.endDate) {
              const overlapStart = vs.startDate > ts.startDate ? vs.startDate : ts.startDate;
              const overlapEnd = vs.endDate < ts.endDate ? vs.endDate : ts.endDate;
              if (overlapStart <= overlapEnd) {
                const label = `You overlap ${formatDateShort(overlapStart)}\u2013${formatDateShort(overlapEnd)}`;
                map.set(tt.id, label);
              }
            }
          }
        }
      }
    }
    return map;
  }, [viewerTripsQuery.data, tripsQuery.data]);

  const sharedInterests = profile && userProfile
    ? getSharedInterests(userProfile, profile)
    : [];
  const contextLabel = profile && userProfile
    ? getConnectionContext(userProfile, profile)
    : undefined;

  const trips = tripsQuery.data ?? { current: null, upcoming: [], past: [] };
  const totalTripCount =
    (trips.current ? 1 : 0) + trips.upcoming.length + trips.past.length;

  const isLoading = profileLoading || tripsQuery.isLoading;
  const error = profileError ?? (tripsQuery.error as Error | null);

  return {
    profile: profile ?? null,
    userProfile: userProfile ?? null,
    connectionStatus,
    incomingRequest,
    sharedInterests,
    contextLabel,
    trips,
    tripOverlaps,
    visitedCountries: countriesQuery.data ?? [],
    userManagedCountries: userManagedCountriesQuery.data ?? [],
    profileTags: profileTags ?? [],
    totalTripCount,
    isLoading,
    error,
    refetch: () => {
      refetchProfile();
      refetchStatus();
      tripsQuery.refetch();
      countriesQuery.refetch();
      userManagedCountriesQuery.refetch();
    },
  };
}
