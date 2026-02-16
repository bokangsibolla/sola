/**
 * Lightweight hook for the notification dot indicator.
 * Uses Supabase Realtime to stay in sync without polling.
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import { hasUnreadNotifications } from './notificationsApi';

const QUERY_KEY = 'notifications-unread';

export function useUnreadIndicator(): boolean {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const { data: hasUnread } = useData(
    () => (userId ? hasUnreadNotifications(userId) : Promise.resolve(false)),
    [QUERY_KEY, userId],
  );

  // Subscribe to Realtime inserts on the notifications table
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // New notification arrived — invalidate the unread check
          queryClient.invalidateQueries({ queryKey: ['useData', QUERY_KEY, userId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return hasUnread ?? false;
}
