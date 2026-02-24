import { useMemo } from 'react';
import { useTrips } from './useTrips';
import type { TripWithStops } from './types';

/** Find an active or planned trip that includes a specific city. */
export function useTripForCity(cityId: string | undefined): TripWithStops | null {
  const { trips } = useTrips();

  return useMemo(() => {
    if (!cityId) return null;

    // Check current trip
    if (trips.current) {
      const hasCity = trips.current.stops.some(s => s.cityId === cityId);
      if (hasCity) return trips.current;
    }

    // Check upcoming trips
    for (const trip of trips.upcoming) {
      const hasCity = trip.stops.some(s => s.cityId === cityId);
      if (hasCity) return trip;
    }

    return null;
  }, [cityId, trips]);
}
