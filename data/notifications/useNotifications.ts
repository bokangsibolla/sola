/**
 * Hook for the notification center screen.
 * Fetches all notifications, groups them, and provides mark-as-read.
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import { getNotifications, markAllNotificationsRead } from './notificationsApi';
import type { Notification, GroupedNotifications } from './types';

const QUERY_KEY = 'notifications-list';

function groupNotifications(notifications: Notification[]): GroupedNotifications {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups: GroupedNotifications = { today: [], thisWeek: [], earlier: [] };

  for (const n of notifications) {
    const created = new Date(n.createdAt);
    if (created >= startOfToday) {
      groups.today.push(n);
    } else if (created >= sevenDaysAgo) {
      groups.thisWeek.push(n);
    } else {
      groups.earlier.push(n);
    }
  }

  return groups;
}

export function useNotifications() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications, loading, error, refetch } = useData(
    () => (userId ? getNotifications(userId) : Promise.resolve([])),
    [QUERY_KEY, userId],
  );

  const grouped = groupNotifications(notifications ?? []);

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    await markAllNotificationsRead(userId);
    // Invalidate both the list and the unread indicator
    queryClient.invalidateQueries({ queryKey: ['useData', QUERY_KEY, userId] });
    queryClient.invalidateQueries({ queryKey: ['useData', 'notifications-unread', userId] });
  }, [userId, queryClient]);

  return {
    notifications: notifications ?? [],
    grouped,
    loading,
    error,
    refetch,
    markAllRead,
  };
}
