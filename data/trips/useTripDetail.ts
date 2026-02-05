import { useData } from '@/hooks/useData';
import { getTripWithStops, getTripEntries, getTripSavedItems } from './tripApi';

export function useTripDetail(tripId: string | undefined) {
  const { data: trip, loading: tripLoading, error: tripError, refetch: refetchTrip } = useData(
    () => (tripId ? getTripWithStops(tripId) : Promise.resolve(null)),
    [tripId]
  );

  const { data: entries, loading: entriesLoading, refetch: refetchEntries } = useData(
    () => (tripId ? getTripEntries(tripId) : Promise.resolve([])),
    [tripId]
  );

  const { data: savedItems, loading: savedLoading, refetch: refetchSaved } = useData(
    () => (tripId ? getTripSavedItems(tripId) : Promise.resolve([])),
    [tripId]
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
