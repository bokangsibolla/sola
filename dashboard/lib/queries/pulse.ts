import { supabase } from '../supabase';

export interface PulseMetric {
  value: number;
  previousValue: number;
}

/** Total users -- count of profiles */
export async function getTotalUsers(): Promise<PulseMetric> {
  const { count: total } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const { count: previousTotal } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .lt('created_at', yesterday.toISOString());

  return { value: total ?? 0, previousValue: previousTotal ?? 0 };
}

/** DAU -- distinct user_ids in user_events today */
export async function getDAU(): Promise<PulseMetric> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const { data: todayData } = await supabase
    .from('user_events')
    .select('user_id')
    .gte('created_at', today.toISOString());

  const todayUsers = new Set(todayData?.map((e) => e.user_id) ?? []);

  const { data: yesterdayData } = await supabase
    .from('user_events')
    .select('user_id')
    .gte('created_at', yesterday.toISOString())
    .lt('created_at', today.toISOString());

  const yesterdayUsers = new Set(yesterdayData?.map((e) => e.user_id) ?? []);

  return { value: todayUsers.size, previousValue: yesterdayUsers.size };
}

/** WAU -- distinct user_ids last 7 days */
export async function getWAU(): Promise<PulseMetric> {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const { data: thisWeek } = await supabase
    .from('user_events')
    .select('user_id')
    .gte('created_at', sevenDaysAgo.toISOString());

  const thisWeekUsers = new Set(thisWeek?.map((e) => e.user_id) ?? []);

  const { data: lastWeek } = await supabase
    .from('user_events')
    .select('user_id')
    .gte('created_at', fourteenDaysAgo.toISOString())
    .lt('created_at', sevenDaysAgo.toISOString());

  const lastWeekUsers = new Set(lastWeek?.map((e) => e.user_id) ?? []);

  return { value: thisWeekUsers.size, previousValue: lastWeekUsers.size };
}

/** New signups today */
export async function getNewSignupsToday(): Promise<PulseMetric> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const { count: todayCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  const { count: yesterdayCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', yesterday.toISOString())
    .lt('created_at', today.toISOString());

  return { value: todayCount ?? 0, previousValue: yesterdayCount ?? 0 };
}

/** Events today (total activity volume) */
export async function getEventsToday(): Promise<PulseMetric> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const { count: todayCount } = await supabase
    .from('user_events')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  const { count: yesterdayCount } = await supabase
    .from('user_events')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', yesterday.toISOString())
    .lt('created_at', today.toISOString());

  return { value: todayCount ?? 0, previousValue: yesterdayCount ?? 0 };
}
