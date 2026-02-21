import { useData } from '@/hooks/useData';
import { getTripItinerary, getDayWithBlocks, getDaySuggestions } from './itineraryApi';

export function useTripItinerary(tripId: string | undefined) {
  const { data: itinerary, loading, error, refetch } = useData(
    () => (tripId ? getTripItinerary(tripId) : Promise.resolve(null)),
    ['tripItinerary', tripId],
  );
  return { itinerary, loading, error, refetch };
}

export function useDayTimeline(dayId: string | undefined) {
  const { data: day, loading, error, refetch } = useData(
    () => (dayId ? getDayWithBlocks(dayId) : Promise.resolve(null)),
    ['dayTimeline', dayId],
  );
  return { day, loading, error, refetch };
}

export function useDaySuggestions(dayId: string | undefined) {
  const { data: suggestions, loading, error, refetch } = useData(
    () => (dayId ? getDaySuggestions(dayId) : Promise.resolve([])),
    ['daySuggestions', dayId],
  );
  return { suggestions: suggestions ?? [], loading, error, refetch };
}
