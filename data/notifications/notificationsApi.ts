/**
 * Notifications API layer — Supabase queries for the notification system.
 */

import { supabase } from '@/lib/supabase';
import { toCamel } from '@/data/api';
import type { Notification } from './types';

// ---------------------------------------------------------------------------
// Fetch notifications for current user
// ---------------------------------------------------------------------------

export async function getNotifications(
  userId: string,
  limit: number = 50,
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      profiles:actor_id(first_name, avatar_url)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    ...toCamel<Notification>(row),
    actor: row.profiles
      ? {
          firstName: row.profiles.first_name ?? '',
          avatarUrl: row.profiles.avatar_url ?? null,
        }
      : null,
  }));
}

// ---------------------------------------------------------------------------
// Check if user has any unread notifications
// ---------------------------------------------------------------------------

export async function hasUnreadNotifications(userId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return (count ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// Mark all notifications as read
// ---------------------------------------------------------------------------

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
}
