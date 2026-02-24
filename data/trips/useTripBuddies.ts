import { useCallback } from 'react';
import { useData } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import { rowsToCamel } from '@/data/api';
import { getTripBuddies, addTripBuddy, removeTripBuddy } from './tripApi';
import type { Profile } from '@/data/types';

export function useTripBuddies(tripId: string | undefined) {
  const {
    data: buddies,
    loading,
    refetch,
  } = useData(
    async () => {
      if (!tripId) return [];
      const buddyRows = await getTripBuddies(tripId);
      if (buddyRows.length === 0) return [];

      const userIds = buddyRows.map((b) => b.userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      if (error) throw error;
      return rowsToCamel<Profile>(data ?? []);
    },
    ['tripBuddies', tripId],
  );

  const addBuddy = useCallback(
    async (userId: string) => {
      if (!tripId) return;
      await addTripBuddy(tripId, userId);
      refetch();
    },
    [tripId, refetch],
  );

  const removeBuddy = useCallback(
    async (userId: string) => {
      if (!tripId) return;
      await removeTripBuddy(tripId, userId);
      refetch();
    },
    [tripId, refetch],
  );

  return {
    buddies: buddies ?? [],
    loading,
    refetch,
    addBuddy,
    removeBuddy,
  };
}
