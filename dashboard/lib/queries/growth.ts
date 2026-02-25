import { supabase } from '../supabase';

// 1. Signups per day — profiles grouped by created_at date
export async function getSignupsOverTime(
  days: number
): Promise<{ date: string; count: number }[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true });

  // Group by date string (YYYY-MM-DD)
  const grouped = new Map<string, number>();

  // Fill in all dates in range so chart has no gaps
  for (
    let d = new Date(since);
    d <= new Date();
    d.setDate(d.getDate() + 1)
  ) {
    grouped.set(d.toISOString().split('T')[0], 0);
  }

  data?.forEach((row) => {
    const date = new Date(row.created_at).toISOString().split('T')[0];
    grouped.set(date, (grouped.get(date) ?? 0) + 1);
  });

  return Array.from(grouped.entries()).map(([date, count]) => ({
    date,
    count,
  }));
}

// 2. Retention cohort — for each signup week, what % returned on Day 1, 3, 7, 14, 30
export interface RetentionCohortRow {
  cohort: string; // "Week of Jan 6"
  users: number;
  day1: number; // percentage
  day3: number;
  day7: number;
  day14: number;
  day30: number;
}

export async function getRetentionCohort(): Promise<RetentionCohortRow[]> {
  // Get all profiles with their signup dates
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, created_at')
    .order('created_at', { ascending: true });

  if (!profiles?.length) return [];

  // Get all user events
  const { data: events } = await supabase
    .from('user_events')
    .select('user_id, created_at');

  // Build event map: userId -> Set of days since signup they were active
  const eventsByUser = new Map<string, Set<number>>();
  const signupDates = new Map<string, Date>();

  profiles.forEach((p) => {
    signupDates.set(p.id, new Date(p.created_at));
  });

  events?.forEach((e) => {
    const signup = signupDates.get(e.user_id);
    if (!signup) return;
    const daysSinceSignup = Math.floor(
      (new Date(e.created_at).getTime() - signup.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (!eventsByUser.has(e.user_id))
      eventsByUser.set(e.user_id, new Set());
    eventsByUser.get(e.user_id)!.add(daysSinceSignup);
  });

  // Group profiles into weekly cohorts
  const cohorts = new Map<string, string[]>(); // weekLabel -> userId[]
  profiles.forEach((p) => {
    const d = new Date(p.created_at);
    // Get Monday of that week
    const monday = new Date(d);
    monday.setDate(d.getDate() - d.getDay() + 1);
    const label = monday.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    if (!cohorts.has(label)) cohorts.set(label, []);
    cohorts.get(label)!.push(p.id);
  });

  const milestones = [1, 3, 7, 14, 30] as const;
  const result: RetentionCohortRow[] = [];

  // Only show last 8 cohorts
  const cohortEntries = Array.from(cohorts.entries()).slice(-8);

  for (const [label, userIds] of cohortEntries) {
    const row: RetentionCohortRow = {
      cohort: `Week of ${label}`,
      users: userIds.length,
      day1: 0,
      day3: 0,
      day7: 0,
      day14: 0,
      day30: 0,
    };

    for (const day of milestones) {
      const retained = userIds.filter((id) => {
        const days = eventsByUser.get(id);
        if (!days) return false;
        // User returned on or after day N
        return Array.from(days).some((d) => d >= day);
      });
      const key = `day${day}` as keyof Pick<
        RetentionCohortRow,
        'day1' | 'day3' | 'day7' | 'day14' | 'day30'
      >;
      row[key] =
        userIds.length > 0
          ? Math.round((retained.length / userIds.length) * 100)
          : 0;
    }

    result.push(row);
  }

  return result;
}

// 3. DAU/MAU stickiness ratio
export async function getStickiness(): Promise<{
  ratio: number;
  dau: number;
  mau: number;
}> {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: todayData } = await supabase
    .from('user_events')
    .select('user_id')
    .gte('created_at', today.toISOString());
  const dau = new Set(todayData?.map((e) => e.user_id) ?? []).size;

  const { data: monthData } = await supabase
    .from('user_events')
    .select('user_id')
    .gte('created_at', thirtyDaysAgo.toISOString());
  const mau = new Set(monthData?.map((e) => e.user_id) ?? []).size;

  return {
    ratio: mau > 0 ? Math.round((dau / mau) * 100) : 0,
    dau,
    mau,
  };
}

// 4. Activation rate — % of users who within 24h of signup did a meaningful action
// (3+ place views, or 1 save, or 1 thread open)
export async function getActivationRate(
  days: number
): Promise<{ rate: number; activated: number; total: number }> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: recentProfiles } = await supabase
    .from('profiles')
    .select('id, created_at')
    .gte('created_at', since.toISOString());

  if (!recentProfiles?.length)
    return { rate: 0, activated: 0, total: 0 };

  let activated = 0;

  for (const profile of recentProfiles) {
    const signupTime = new Date(profile.created_at);
    const twentyFourHoursLater = new Date(
      signupTime.getTime() + 24 * 60 * 60 * 1000
    );

    const { data: userEvents } = await supabase
      .from('user_events')
      .select('event_type')
      .eq('user_id', profile.id)
      .gte('created_at', signupTime.toISOString())
      .lte('created_at', twentyFourHoursLater.toISOString());

    if (!userEvents) continue;

    const placeViews = userEvents.filter(
      (e) => e.event_type === 'viewed_place'
    ).length;
    const saves = userEvents.filter(
      (e) => e.event_type === 'saved_place'
    ).length;
    const threads = userEvents.filter(
      (e) => e.event_type === 'opened_thread'
    ).length;

    if (placeViews >= 3 || saves >= 1 || threads >= 1) {
      activated++;
    }
  }

  return {
    rate:
      recentProfiles.length > 0
        ? Math.round((activated / recentProfiles.length) * 100)
        : 0,
    activated,
    total: recentProfiles.length,
  };
}

// 5. Signup-to-value time — median minutes from signup to first save/trip/post
export async function getSignupToValueTime(): Promise<{
  medianMinutes: number | null;
  sampleSize: number;
}> {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, created_at');

  if (!profiles?.length) return { medianMinutes: null, sampleSize: 0 };

  const valueTimes: number[] = [];

  for (const profile of profiles) {
    const { data: firstValueEvent } = await supabase
      .from('user_events')
      .select('created_at')
      .eq('user_id', profile.id)
      .in('event_type', ['saved_place', 'created_trip', 'replied_thread'])
      .order('created_at', { ascending: true })
      .limit(1);

    if (firstValueEvent?.length) {
      const minutes =
        (new Date(firstValueEvent[0].created_at).getTime() -
          new Date(profile.created_at).getTime()) /
        (1000 * 60);
      if (minutes >= 0) valueTimes.push(minutes);
    }
  }

  if (valueTimes.length === 0)
    return { medianMinutes: null, sampleSize: 0 };

  valueTimes.sort((a, b) => a - b);
  const mid = Math.floor(valueTimes.length / 2);
  const median =
    valueTimes.length % 2 !== 0
      ? valueTimes[mid]
      : (valueTimes[mid - 1] + valueTimes[mid]) / 2;

  return { medianMinutes: Math.round(median), sampleSize: valueTimes.length };
}

// 6. Resurrection rate — users inactive 14+ days who came back this week
export async function getResurrectionRate(): Promise<{
  count: number;
  examples: { userId: string; daysSinceLastSeen: number }[];
}> {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Get users active this week
  const { data: thisWeekEvents } = await supabase
    .from('user_events')
    .select('user_id, created_at')
    .gte('created_at', sevenDaysAgo.toISOString());

  const thisWeekUsers = new Set(
    thisWeekEvents?.map((e) => e.user_id) ?? []
  );

  const resurrected: { userId: string; daysSinceLastSeen: number }[] = [];

  for (const userId of thisWeekUsers) {
    // Find their most recent event BEFORE this week
    const { data: priorEvents } = await supabase
      .from('user_events')
      .select('created_at')
      .eq('user_id', userId)
      .lt('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (priorEvents?.length) {
      const lastSeen = new Date(priorEvents[0].created_at);
      const daysSince = Math.floor(
        (sevenDaysAgo.getTime() - lastSeen.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysSince >= 14) {
        resurrected.push({ userId, daysSinceLastSeen: daysSince });
      }
    }
  }

  return { count: resurrected.length, examples: resurrected.slice(0, 5) };
}
