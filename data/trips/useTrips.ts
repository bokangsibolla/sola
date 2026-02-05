import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import { getTripsGrouped } from './tripApi';
import type { GroupedTrips } from './types';

const EMPTY: GroupedTrips = { current: null, upcoming: [], past: [] };

export function useTrips() {
  const { userId } = useAuth();
  const { data, loading, error, refetch } = useData(
    () => (userId ? getTripsGrouped(userId) : Promise.resolve(EMPTY)),
    [userId]
  );
  const raw = data ?? EMPTY;
  return {
    trips: {
      current: raw.current ?? null,
      upcoming: raw.upcoming ?? [],
      past: raw.past ?? [],
    },
    loading,
    error,
    refetch,
  };
}
