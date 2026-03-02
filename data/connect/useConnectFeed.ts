/**
 * Unified Connect feed hook — fetches activities and travelers for a city,
 * interleaves them into a single feed list for the Connect tab.
 */

import { useMemo, useCallback } from 'react';
import { useAuth } from '@/state/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getBlockedUserIds, getTravelersInCityByCheckIn } from '@/data/api';
import { getTogetherFeed } from '@/data/together/togetherApi';
import type { TogetherPostWithAuthor } from '@/data/together/types';
import type { Profile } from '@/data/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ConnectFeedItem =
  | { type: 'activity'; data: TogetherPostWithAuthor; key: string }
  | { type: 'people_row'; data: Profile[]; key: string };

export interface UseConnectFeedReturn {
  items: ConnectFeedItem[];
  travelers: Profile[];
  isLoading: boolean;
  refresh: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PEOPLE_INTERVAL = 4;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useConnectFeed(cityId: string | null): UseConnectFeedReturn {
  const { userId } = useAuth();

  // 1. Blocked user IDs
  const { data: blockedIds = [] } = useQuery({
    queryKey: ['blocked-users', userId],
    queryFn: () => getBlockedUserIds(userId!),
    enabled: !!userId,
  });

  // 2. Activities for the city
  const {
    data: activities = [],
    isLoading: activitiesLoading,
    refetch: refetchActivities,
  } = useQuery({
    queryKey: ['connect-activities', userId, cityId, blockedIds],
    queryFn: () =>
      getTogetherFeed(
        userId!,
        { cityId: cityId!, page: 0, pageSize: 20 },
        blockedIds,
      ),
    enabled: !!userId && !!cityId,
  });

  // 3. Travelers checked into the city
  const {
    data: travelers = [],
    isLoading: travelersLoading,
    refetch: refetchTravelers,
  } = useQuery({
    queryKey: ['connect-travelers', userId, cityId, blockedIds],
    queryFn: () =>
      getTravelersInCityByCheckIn(cityId!, userId!, blockedIds),
    enabled: !!userId && !!cityId,
  });

  // 4. Interleave activities and people rows
  const items = useMemo(() => {
    const result: ConnectFeedItem[] = [];

    for (let i = 0; i < activities.length; i++) {
      if (i > 0 && i % PEOPLE_INTERVAL === 0 && travelers.length > 0) {
        result.push({ type: 'people_row', data: travelers, key: `people-${i}` });
      }
      result.push({ type: 'activity', data: activities[i], key: activities[i].id });
    }

    // If no activities but there are travelers, show people row
    if (activities.length === 0 && travelers.length > 0) {
      result.push({ type: 'people_row', data: travelers, key: 'people-only' });
    }

    return result;
  }, [activities, travelers]);

  // 5. Refresh handler
  const refresh = useCallback(() => {
    refetchActivities();
    refetchTravelers();
  }, [refetchActivities, refetchTravelers]);

  return {
    items,
    travelers,
    isLoading: activitiesLoading || travelersLoading,
    refresh,
  };
}
