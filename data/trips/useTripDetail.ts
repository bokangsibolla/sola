import { useData } from '@/hooks/useData';
import {
  getTripWithStops,
  getTripEntries,
  getTripSavedItems,
  getTripAccommodations,
  getTripTransports,
  getTripNotificationSettings,
} from './tripApi';

export function useTripDetail(tripId: string | undefined) {
  const { data: trip, loading: tripLoading, error: tripError, refetch: refetchTrip } = useData(
    () => (tripId ? getTripWithStops(tripId) : Promise.resolve(null)),
    ['trip', tripId]
  );

  const { data: entries, loading: entriesLoading, refetch: refetchEntries } = useData(
    () => (tripId ? getTripEntries(tripId) : Promise.resolve([])),
    ['tripEntries', tripId]
  );

  const { data: savedItems, loading: savedLoading, refetch: refetchSaved } = useData(
    () => (tripId ? getTripSavedItems(tripId) : Promise.resolve([])),
    ['tripSavedItems', tripId]
  );

  const { data: accommodations, loading: accomLoading, refetch: refetchAccommodations } = useData(
    () => (tripId ? getTripAccommodations(tripId) : Promise.resolve([])),
    ['tripAccommodations', tripId]
  );

  const { data: transports, loading: transLoading, refetch: refetchTransports } = useData(
    () => (tripId ? getTripTransports(tripId) : Promise.resolve([])),
    ['tripTransports', tripId]
  );

  return {
    trip: trip ?? null,
    entries: entries ?? [],
    savedItems: savedItems ?? [],
    accommodations: accommodations ?? [],
    transports: transports ?? [],
    loading: tripLoading || entriesLoading || savedLoading || accomLoading || transLoading,
    error: tripError,
    refetchTrip,
    refetchEntries,
    refetchSaved,
    refetchAccommodations,
    refetchTransports,
    refetchAll: () => {
      refetchTrip();
      refetchEntries();
      refetchSaved();
      refetchAccommodations();
      refetchTransports();
    },
  };
}

export function useNotificationSettings(tripId: string | undefined) {
  const { data, loading, error, refetch } = useData(
    () => (tripId ? getTripNotificationSettings(tripId) : Promise.resolve(null)),
    ['tripNotificationSettings', tripId]
  );

  return {
    settings: data ?? null,
    loading,
    error,
    refetch,
  };
}
