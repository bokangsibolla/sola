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
  getTravelersInCountry,
  getTravelersWithSharedInterests,
  getTravelersWithSharedCountries,
  getTravelersFromHomeCountry,
  getConnectionRequests,
  getConnectedUserIds,
  getUserVisitedCountries,
  rowsToCamel,
} from '@/data/api';
import { supabase } from '@/lib/supabase';
import type { Profile, ConnectionRequest } from '@/data/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SectionContextType =
  | 'near-you'
  | 'same-country-location'
  | 'trip-overlap'
  | 'shared-countries'
  | 'home-country'
  | 'shared-interests';

export interface TravelerSection {
  key: string;
  title: string;
  subtitle?: string;
  contextType: SectionContextType;
  data: Profile[];
  /** Extra metadata for context labels (e.g. shared country names per user) */
  meta?: Map<string, string[]>;
}

export interface TravelersFeedV2Data {
  sections: TravelerSection[];
  connectedProfiles: Profile[];
  pendingReceived: ConnectionRequest[];
  userProfile: Profile | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTravelersFeedV2(): TravelersFeedV2Data {
  const { userId } = useAuth();

  // ─── Base data (always fetched) ──────────────────────────────
  const { data: userProfile } = useData(
    () => (userId ? getProfileById(userId) : Promise.resolve(null)),
    [userId],
  );

  const { data: blockedIds } = useData(
    () => (userId ? getBlockedUserIds(userId) : Promise.resolve([])),
    [userId],
  );

  const blocked = blockedIds ?? [];
  const locationCity = userProfile?.locationCityName;
  const locationCountry = userProfile?.locationCountryName;
  const homeCountryIso2 = userProfile?.homeCountryIso2;
  const interests = userProfile?.interests ?? [];
  const locationEnabled = userProfile?.locationSharingEnabled ?? false;

  // Determine if user is actively traveling:
  // - Location sharing on AND in a different city from home, OR
  // - Has an active/planned trip with matching enabled
  const homeCityName = userProfile?.currentCityName;
  const isAwayFromHome = locationEnabled && !!locationCity && locationCity !== homeCityName;
  // hasQualifyingTrip is computed below, so isTraveling is refined after that query
  // For now, use location-based detection; trip-based is handled in section building

  // ─── Check qualifying trips (for trip overlap sections) ──────
  const qualifyingQuery = useQuery({
    queryKey: ['travelers', 'qualifying', userId],
    queryFn: () => getQualifyingTrips(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });
  const hasQualifyingTrip = (qualifyingQuery.data?.trips?.length ?? 0) > 0;
  const isTraveling = isAwayFromHome || hasQualifyingTrip;

  // ─── Section 1a: Near You (same city — when traveling) ───────
  const nearbyQuery = useQuery({
    queryKey: ['travelers', 'v2', 'nearby', userId, locationCity],
    queryFn: () => getNearbyTravelers(userId!, locationCity!, blocked),
    enabled: !!userId && !!locationCity && locationEnabled,
    staleTime: 60_000,
  });

  // ─── Section 1b: Travelers in your home city (when at home) ──
  const homeCityQuery = useQuery({
    queryKey: ['travelers', 'v2', 'homeCity', userId, homeCityName],
    queryFn: () => getNearbyTravelers(userId!, homeCityName!, blocked),
    enabled: !!userId && !!homeCityName && !isTraveling,
    staleTime: 60_000,
  });

  // ─── Section 2: Also in [Country] (same country, different city) ──
  const sameCountryQuery = useQuery({
    queryKey: ['travelers', 'v2', 'sameCountry', userId, locationCountry],
    queryFn: () => getTravelersInCountry(userId!, locationCountry!, blocked),
    enabled: !!userId && !!locationCountry && locationEnabled,
    staleTime: 60_000,
  });

  // ─── Section 3: Trip Overlap ─────────────────────────────────
  const cityMatchQuery = useQuery({
    queryKey: ['travelers', 'v2', 'tripCity', userId],
    queryFn: () => getTripCityMatches(userId!, blocked),
    enabled: !!userId && hasQualifyingTrip,
    staleTime: 60_000,
  });

  const cityMatchIds = (cityMatchQuery.data ?? []).map((p) => p.id);
  const countryMatchQuery = useQuery({
    queryKey: ['travelers', 'v2', 'tripCountry', userId, cityMatchIds.join(',')],
    queryFn: () => getTripCountryMatches(userId!, cityMatchIds, blocked),
    enabled: !!userId && hasQualifyingTrip && !cityMatchQuery.isLoading,
    staleTime: 60_000,
  });

  // ─── Section 4: Been Where You've Been ───────────────────────
  const visitedCountriesQuery = useQuery({
    queryKey: ['travelers', 'v2', 'myCountries', userId],
    queryFn: () => getUserVisitedCountries(userId!),
    enabled: !!userId,
    staleTime: 5 * 60_000,
  });

  const visitedCountryIds = (visitedCountriesQuery.data ?? []).map((vc) => vc.countryId);
  const sharedCountriesQuery = useQuery({
    queryKey: ['travelers', 'v2', 'sharedCountries', userId, visitedCountryIds.join(',')],
    queryFn: () => getTravelersWithSharedCountries(userId!, visitedCountryIds, blocked),
    enabled: !!userId && visitedCountryIds.length > 0,
    staleTime: 60_000,
  });

  // ─── Section 5: From Your Country ────────────────────────────
  const homeCountryQuery = useQuery({
    queryKey: ['travelers', 'v2', 'homeCountry', userId, homeCountryIso2],
    queryFn: () => getTravelersFromHomeCountry(userId!, homeCountryIso2!, blocked),
    enabled: !!userId && !!homeCountryIso2,
    staleTime: 60_000,
  });

  // ─── Section 6: Shared Interests ─────────────────────────────
  const interestsQuery = useQuery({
    queryKey: ['travelers', 'v2', 'interests', userId, interests.join(',')],
    queryFn: () => getTravelersWithSharedInterests(userId!, interests, blocked),
    enabled: !!userId && interests.length > 0,
    staleTime: 60_000,
  });

  // ─── Always: Pending + Connected ─────────────────────────────
  const pendingQuery = useQuery({
    queryKey: ['travelers', 'pending', userId],
    queryFn: () => getConnectionRequests(userId!, 'received'),
    enabled: !!userId,
    staleTime: 30_000,
  });

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
    enabled: !!userId,
    staleTime: 60_000,
  });

  // ─── Build sections with deduplication ───────────────────────
  const sections: TravelerSection[] = [];
  const shownIds = new Set<string>();

  const dedup = (profiles: Profile[]): Profile[] =>
    profiles.filter((p) => !shownIds.has(p.id));

  const markShown = (profiles: Profile[]) =>
    profiles.forEach((p) => shownIds.add(p.id));

  if (isTraveling) {
    // ── Traveling: proximity-first ordering ──

    // 1. Near You
    const nearby = dedup(nearbyQuery.data ?? []);
    if (nearby.length > 0) {
      sections.push({
        key: 'near-you',
        title: `Near you in ${locationCity}`,
        contextType: 'near-you',
        data: nearby,
      });
      markShown(nearby);
    }

    // 2. Also in [Country]
    const sameCountry = dedup(sameCountryQuery.data ?? []);
    if (sameCountry.length > 0) {
      sections.push({
        key: 'same-country',
        title: `Also in ${locationCountry}`,
        contextType: 'same-country-location',
        data: sameCountry,
      });
      markShown(sameCountry);
    }

    // 3. Trip Overlap
    const tripCity = dedup(cityMatchQuery.data ?? []);
    const tripCountry = dedup(countryMatchQuery.data ?? []);
    const tripOverlap = [...tripCity, ...tripCountry];
    if (tripOverlap.length > 0) {
      sections.push({
        key: 'trip-overlap',
        title: 'Trip overlap',
        subtitle: 'Same dates, same places',
        contextType: 'trip-overlap',
        data: tripOverlap,
      });
      markShown(tripOverlap);
    }
  } else {
    // ── At home: travelers-in-your-city first ──

    if (homeCityName) {
      const homeCityTravelers = dedup(homeCityQuery.data ?? []);
      if (homeCityTravelers.length > 0) {
        sections.push({
          key: 'travelers-in-city',
          title: `Travelers in ${homeCityName}`,
          contextType: 'near-you',
          data: homeCityTravelers,
        });
        markShown(homeCityTravelers);
      }
    }

    // Trip overlap still works if user has trips
    if (hasQualifyingTrip) {
      const tripCity = dedup(cityMatchQuery.data ?? []);
      const tripCountry = dedup(countryMatchQuery.data ?? []);
      const tripOverlap = [...tripCity, ...tripCountry];
      if (tripOverlap.length > 0) {
        sections.push({
          key: 'trip-overlap',
          title: 'Trip overlap',
          subtitle: 'Same dates, same places',
          contextType: 'trip-overlap',
          data: tripOverlap,
        });
        markShown(tripOverlap);
      }
    }
  }

  // ── Affinity sections (always shown) ──

  // 4. Been Where You've Been
  const sharedCountriesData = sharedCountriesQuery.data ?? [];
  const sharedCountries = dedup(sharedCountriesData);
  if (sharedCountries.length > 0) {
    const meta = new Map<string, string[]>();
    for (const p of sharedCountriesData as Array<Profile & { sharedCountryNames: string[] }>) {
      meta.set(p.id, p.sharedCountryNames ?? []);
    }
    sections.push({
      key: 'shared-countries',
      title: 'Been where you\'ve been',
      contextType: 'shared-countries',
      data: sharedCountries,
      meta,
    });
    markShown(sharedCountries);
  }

  // 5. From Your Country
  const homeCountry = dedup(homeCountryQuery.data ?? []);
  if (homeCountry.length > 0) {
    sections.push({
      key: 'home-country',
      title: `From ${userProfile?.homeCountryName ?? 'your country'}`,
      contextType: 'home-country',
      data: homeCountry,
    });
    markShown(homeCountry);
  }

  // 6. Shared Interests
  const shared = dedup(interestsQuery.data ?? []);
  if (shared.length > 0) {
    sections.push({
      key: 'shared-interests',
      title: 'Similar interests',
      contextType: 'shared-interests',
      data: shared,
    });
  }

  // ─── Loading / Error ─────────────────────────────────────────
  const isLoading =
    qualifyingQuery.isLoading ||
    nearbyQuery.isLoading ||
    homeCityQuery.isLoading ||
    sharedCountriesQuery.isLoading ||
    homeCountryQuery.isLoading ||
    interestsQuery.isLoading;

  const error =
    nearbyQuery.error ??
    sameCountryQuery.error ??
    sharedCountriesQuery.error ??
    homeCountryQuery.error ??
    interestsQuery.error ??
    null;

  return {
    sections,
    connectedProfiles: connectedQuery.data ?? [],
    pendingReceived: pendingQuery.data ?? [],
    userProfile: userProfile ?? null,
    isLoading,
    error: error as Error | null,
    refetch: () => {
      qualifyingQuery.refetch();
      nearbyQuery.refetch();
      homeCityQuery.refetch();
      sameCountryQuery.refetch();
      cityMatchQuery.refetch();
      countryMatchQuery.refetch();
      sharedCountriesQuery.refetch();
      homeCountryQuery.refetch();
      interestsQuery.refetch();
      pendingQuery.refetch();
      connectedQuery.refetch();
    },
  };
}
