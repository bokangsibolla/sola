import { useData } from '@/hooks/useData';
import { getTripWithStops, getTripEntries, getTripSavedItems } from './tripApi';

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

  return {
    trip: trip ?? null,
    entries: entries ?? [],
    savedItems: savedItems ?? [],
    loading: tripLoading || entriesLoading || savedLoading,
    error: tripError,
    refetchTrip,
    refetchEntries,
    refetchSaved,
    refetchAll: () => {
      refetchTrip();
      refetchEntries();
      refetchSaved();
    },
  };
}
