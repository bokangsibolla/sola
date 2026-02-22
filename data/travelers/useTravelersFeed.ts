import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import {
  getBlockedUserIds,
  getProfileById,
  getQualifyingTrips,
  getTripCityMatches,
  getTripCountryMatches,
  getNearbyTravelers,
  getTravelersWithSharedInterests,
  getConnectionRequests,
  getConnectedUserIds,
  rowsToCamel,
} from '@/data/api';
import { supabase } from '@/lib/supabase';
import type { Profile, ConnectionRequest } from '@/data/types';

export interface TravelerMatchSection {
  key: string;
  title: string;
  subtitle?: string;
  data: Profile[];
}

export interface TravelersFeedData {
  /** Whether user has qualifying trips for discovery */
  hasQualifyingTrip: boolean;
  /** Whether user's profile is discoverable */
  isDiscoverable: boolean;
  /** Tiered match sections (only populated when hasQualifyingTrip=true) */
  sections: TravelerMatchSection[];
  /** Connected users for quick messaging in empty state */
  connectedProfiles: Profile[];
  /** Incoming connection requests */
  pendingReceived: ConnectionRequest[];
  /** Current user's profile */
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
  const interests = userProfile?.interests ?? [];

  // Check if user has qualifying trips
  const qualifyingQuery = useQuery({
    queryKey: ['travelers', 'qualifying', userId],
    queryFn: () => getQualifyingTrips(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });

  const hasQualifyingTrip = (qualifyingQuery.data?.trips?.length ?? 0) > 0;
  const isDiscoverable = qualifyingQuery.data?.isDiscoverable ?? false;

  // Tier 1: Same city + overlapping dates
  const cityMatchQuery = useQuery({
    queryKey: ['travelers', 'cityMatch', userId],
    queryFn: () => getTripCityMatches(userId!, blocked),
    enabled: !!userId && hasQualifyingTrip,
    staleTime: 60_000,
  });

  // Tier 2: Same country + overlapping dates (excludes city matches)
  const cityMatchIds = (cityMatchQuery.data ?? []).map((p) => p.id);
  const countryMatchQuery = useQuery({
    queryKey: ['travelers', 'countryMatch', userId, cityMatchIds.join(',')],
    queryFn: () => getTripCountryMatches(userId!, cityMatchIds, blocked),
    enabled: !!userId && hasQualifyingTrip && !cityMatchQuery.isLoading,
    staleTime: 60_000,
  });

  // Tier 3: Nearby right now (only when has qualifying trip)
  const nearbyQuery = useQuery({
    queryKey: ['travelers', 'nearby', userId, cityName],
    queryFn: () => getNearbyTravelers(userId!, cityName!, blocked),
    enabled: !!userId && !!cityName && hasQualifyingTrip,
    staleTime: 60_000,
  });

  // Tier 4: Shared interests (only when has qualifying trip)
  const interestsQuery = useQuery({
    queryKey: ['travelers', 'interests', userId, interests.join(',')],
    queryFn: () => getTravelersWithSharedInterests(userId!, interests, blocked),
    enabled: !!userId && interests.length > 0 && hasQualifyingTrip,
    staleTime: 60_000,
  });

  // Pending connection requests (always)
  const pendingQuery = useQuery({
    queryKey: ['travelers', 'pending', userId],
    queryFn: () => getConnectionRequests(userId!, 'received'),
    enabled: !!userId,
    staleTime: 30_000,
  });

  // Connected users for empty state quick-messaging
  const connectedQuery = useQuery({
    queryKey: ['travelers', 'connected', userId],
    queryFn: async () => {
      const ids = await getConnectedUserIds(userId!);
      if (ids.length === 0) return [];
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('id', ids);
      return rowsToCamel<Profile>(data ?? []);
    },
    enabled: !!userId && !hasQualifyingTrip,
    staleTime: 60_000,
  });

  // Build tiered sections — deduplicate across tiers
  const sections: TravelerMatchSection[] = [];
  const shownIds = new Set<string>();

  const cityMatches = (cityMatchQuery.data ?? []).filter((p) => !shownIds.has(p.id));
  if (cityMatches.length > 0) {
    sections.push({
      key: 'city-match',
      title: 'Heading your way too',
      subtitle: 'Same city, overlapping dates',
      data: cityMatches,
    });
    cityMatches.forEach((p) => shownIds.add(p.id));
  }

  const countryMatches = (countryMatchQuery.data ?? []).filter((p) => !shownIds.has(p.id));
  if (countryMatches.length > 0) {
    sections.push({
      key: 'country-match',
      title: 'Also in the area',
      subtitle: 'Same country, overlapping dates',
      data: countryMatches,
    });
    countryMatches.forEach((p) => shownIds.add(p.id));
  }

  const nearby = (nearbyQuery.data ?? []).filter((p) => !shownIds.has(p.id));
  if (nearby.length > 0) {
    sections.push({
      key: 'nearby',
      title: 'Nearby right now',
      subtitle: cityName ? `In ${cityName}` : undefined,
      data: nearby,
    });
    nearby.forEach((p) => shownIds.add(p.id));
  }

  const shared = (interestsQuery.data ?? []).filter((p) => !shownIds.has(p.id));
  if (shared.length > 0) {
    sections.push({
      key: 'shared-interests',
      title: 'Similar travel style',
      subtitle: 'Shared interests',
      data: shared,
    });
  }

  const isLoading =
    qualifyingQuery.isLoading ||
    (hasQualifyingTrip &&
      (cityMatchQuery.isLoading || nearbyQuery.isLoading || interestsQuery.isLoading));
  const error =
    qualifyingQuery.error ??
    cityMatchQuery.error ??
    countryMatchQuery.error ??
    nearbyQuery.error ??
    interestsQuery.error ??
    null;

  return {
    hasQualifyingTrip,
    isDiscoverable,
    sections,
    connectedProfiles: connectedQuery.data ?? [],
    pendingReceived: pendingQuery.data ?? [],
    userProfile: userProfile ?? null,
    isLoading,
    error: error as Error | null,
    refetch: () => {
      qualifyingQuery.refetch();
      cityMatchQuery.refetch();
      countryMatchQuery.refetch();
      nearbyQuery.refetch();
      interestsQuery.refetch();
      pendingQuery.refetch();
      connectedQuery.refetch();
    },
  };
}
