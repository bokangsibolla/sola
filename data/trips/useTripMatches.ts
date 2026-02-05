import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import { supabase } from '@/lib/supabase';
import { getTripOverlapMatches } from './tripApi';
import { toCamel } from '@/data/api';
import type { TripOverlapMatch } from './types';
import type { Profile } from '@/data/types';

export interface TripMatchWithProfile extends TripOverlapMatch {
  profile: Profile;
}

export function useTripMatches(tripId: string | undefined, matchingOptIn: boolean) {
  const { userId } = useAuth();

  const { data, loading, error, refetch } = useData(
    async () => {
      if (!tripId || !userId || !matchingOptIn) return [];

      const matches = await getTripOverlapMatches(tripId, userId);
      if (matches.length === 0) return [];

      const userIds = [...new Set(matches.map((m) => m.theirUserId))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      const profileMap = new Map<string, Profile>();
      for (const row of profiles ?? []) {
        profileMap.set(row.id, toCamel<Profile>(row));
      }

      return matches
        .filter((m) => profileMap.has(m.theirUserId))
        .map((m) => ({
          ...m,
          profile: profileMap.get(m.theirUserId)!,
        }));
    },
    [tripId, userId, matchingOptIn]
  );

  return { matches: (data ?? []) as TripMatchWithProfile[], loading, error, refetch };
}
