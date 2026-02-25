import { supabase } from '../supabase';

// 1. Session depth distribution
export async function getSessionDepthDistribution(
  days: number
): Promise<{ bucket: string; count: number }[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from('user_events')
    .select('user_id, created_at')
    .gte('created_at', since.toISOString())
    .order('user_id')
    .order('created_at');

  if (!data?.length) return [];

  const sessionLengths: number[] = [];
  let currentUser = '';
  let sessionCount = 0;
  let lastTime = 0;
  const GAP = 30 * 60 * 1000;

  for (const event of data) {
    const time = new Date(event.created_at).getTime();
    if (event.user_id !== currentUser || time - lastTime > GAP) {
      if (sessionCount > 0) sessionLengths.push(sessionCount);
      currentUser = event.user_id;
      sessionCount = 0;
    }
    sessionCount++;
    lastTime = time;
  }
  if (sessionCount > 0) sessionLengths.push(sessionCount);

  const buckets: Record<string, number> = {
    '1-2': 0,
    '3-5': 0,
    '6-10': 0,
    '11-20': 0,
    '20+': 0,
  };
  for (const len of sessionLengths) {
    if (len <= 2) buckets['1-2']++;
    else if (len <= 5) buckets['3-5']++;
    else if (len <= 10) buckets['6-10']++;
    else if (len <= 20) buckets['11-20']++;
    else buckets['20+']++;
  }

  return Object.entries(buckets).map(([bucket, count]) => ({ bucket, count }));
}

// 2. Content engagement heatmap
export interface HeatmapData {
  entityTypes: string[];
  eventTypes: string[];
  grid: number[][];
}

export async function getContentEngagementHeatmap(
  days: number
): Promise<HeatmapData> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from('user_events')
    .select('event_type, entity_type')
    .gte('created_at', since.toISOString())
    .not('entity_type', 'is', null);

  if (!data?.length) return { entityTypes: [], eventTypes: [], grid: [] };

  const counts = new Map<string, Map<string, number>>();
  const allEventTypes = new Set<string>();
  const allEntityTypes = new Set<string>();

  for (const row of data) {
    const et = row.entity_type!;
    const ev = row.event_type;
    allEntityTypes.add(et);
    allEventTypes.add(ev);
    if (!counts.has(et)) counts.set(et, new Map());
    const inner = counts.get(et)!;
    inner.set(ev, (inner.get(ev) ?? 0) + 1);
  }

  const entityTypes = Array.from(allEntityTypes).sort();
  const eventTypes = Array.from(allEventTypes).sort();
  const grid = entityTypes.map((et) =>
    eventTypes.map((ev) => counts.get(et)?.get(ev) ?? 0)
  );

  return { entityTypes, eventTypes, grid };
}

// 3. Screen time breakdown
export interface ScreenTimeRow {
  screen: string;
  medianSeconds: number;
  views: number;
}

export async function getScreenTimeBreakdown(
  days: number
): Promise<ScreenTimeRow[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from('user_events')
    .select('user_id, event_type, created_at')
    .gte('created_at', since.toISOString())
    .order('user_id')
    .order('created_at');

  if (!data?.length) return [];

  const screenTimes = new Map<string, number[]>();
  const screenViews = new Map<string, number>();

  for (let i = 0; i < data.length - 1; i++) {
    const current = data[i];
    const next = data[i + 1];
    if (current.user_id !== next.user_id) continue;

    const duration =
      (new Date(next.created_at).getTime() -
        new Date(current.created_at).getTime()) /
      1000;

    if (duration > 1800 || duration < 1) continue;

    const screen = current.event_type;
    if (!screenTimes.has(screen)) screenTimes.set(screen, []);
    screenTimes.get(screen)!.push(duration);
    screenViews.set(screen, (screenViews.get(screen) ?? 0) + 1);
  }

  return Array.from(screenTimes.entries())
    .map(([screen, times]) => {
      times.sort((a, b) => a - b);
      const mid = Math.floor(times.length / 2);
      const median =
        times.length % 2 !== 0
          ? times[mid]
          : (times[mid - 1] + times[mid]) / 2;
      return {
        screen,
        medianSeconds: Math.round(median),
        views: screenViews.get(screen) ?? 0,
      };
    })
    .sort((a, b) => b.medianSeconds - a.medianSeconds);
}

// 4. Save-through rate
export interface SaveThroughRow {
  name: string;
  views: number;
  saves: number;
  rate: number;
}

export async function getSaveThroughRate(
  days: number
): Promise<SaveThroughRow[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: viewEvents } = await supabase
    .from('user_events')
    .select('entity_id')
    .eq('event_type', 'viewed_place')
    .gte('created_at', since.toISOString());

  const { data: saveEvents } = await supabase
    .from('user_events')
    .select('entity_id')
    .eq('event_type', 'saved_place')
    .gte('created_at', since.toISOString());

  const viewCounts = new Map<string, number>();
  viewEvents?.forEach((e) => {
    if (e.entity_id)
      viewCounts.set(e.entity_id, (viewCounts.get(e.entity_id) ?? 0) + 1);
  });

  const saveCounts = new Map<string, number>();
  saveEvents?.forEach((e) => {
    if (e.entity_id)
      saveCounts.set(e.entity_id, (saveCounts.get(e.entity_id) ?? 0) + 1);
  });

  const topPlaceIds = Array.from(viewCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([id]) => id);

  if (topPlaceIds.length === 0) return [];

  const { data: places } = await supabase
    .from('places')
    .select('id, name')
    .in('id', topPlaceIds);

  const placeNames = new Map(places?.map((p) => [p.id, p.name]) ?? []);

  return topPlaceIds.map((id) => ({
    name: placeNames.get(id) ?? id.slice(0, 8),
    views: viewCounts.get(id) ?? 0,
    saves: saveCounts.get(id) ?? 0,
    rate: viewCounts.get(id)
      ? Math.round(((saveCounts.get(id) ?? 0) / viewCounts.get(id)!) * 100)
      : 0,
  }));
}

// 5. Power users
export interface PowerUserRow {
  userId: string;
  name: string;
  sessions: number;
  saves: number;
  communityActions: number;
  totalEvents: number;
}

export async function getPowerUsers(days: number): Promise<PowerUserRow[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from('user_events')
    .select('user_id, event_type, created_at')
    .gte('created_at', since.toISOString())
    .order('user_id')
    .order('created_at');

  if (!data?.length) return [];

  const userMetrics = new Map<
    string,
    { sessions: number; saves: number; community: number; total: number }
  >();

  let currentUser = '';
  let lastTime = 0;
  const GAP = 30 * 60 * 1000;

  for (const event of data) {
    const time = new Date(event.created_at).getTime();
    if (!userMetrics.has(event.user_id)) {
      userMetrics.set(event.user_id, {
        sessions: 0,
        saves: 0,
        community: 0,
        total: 0,
      });
    }
    const m = userMetrics.get(event.user_id)!;
    m.total++;

    if (event.user_id !== currentUser || time - lastTime > GAP) {
      m.sessions++;
      currentUser = event.user_id;
    }
    lastTime = time;

    if (event.event_type === 'saved_place') m.saves++;
    if (['opened_thread', 'replied_thread'].includes(event.event_type))
      m.community++;
  }

  const powerUserIds = Array.from(userMetrics.entries())
    .filter(([, m]) => m.sessions >= 5 && m.saves >= 3 && m.community >= 1)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 20);

  if (powerUserIds.length === 0) return [];

  const ids = powerUserIds.map(([id]) => id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, first_name, username')
    .in('id', ids);

  const nameMap = new Map(
    profiles?.map((p) => [p.id, p.first_name || p.username || 'Anonymous']) ??
      []
  );

  return powerUserIds.map(([userId, m]) => ({
    userId,
    name: nameMap.get(userId) ?? 'Anonymous',
    sessions: m.sessions,
    saves: m.saves,
    communityActions: m.community,
    totalEvents: m.total,
  }));
}

// 6. Churn risk
export interface ChurnRiskRow {
  userId: string;
  name: string;
  lastEvent: string;
  lastScreen: string;
  totalEventsLastWeek: number;
}

export async function getChurnRiskUsers(): Promise<ChurnRiskRow[]> {
  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const { data: lastWeekData } = await supabase
    .from('user_events')
    .select('user_id, event_type, created_at')
    .gte('created_at', lastWeekStart.toISOString())
    .lt('created_at', thisWeekStart.toISOString())
    .order('created_at', { ascending: false });

  const { data: thisWeekData } = await supabase
    .from('user_events')
    .select('user_id')
    .gte('created_at', thisWeekStart.toISOString());

  const thisWeekUsers = new Set(thisWeekData?.map((e) => e.user_id) ?? []);

  const lastWeekByUser = new Map<
    string,
    { count: number; lastEvent: string; lastScreen: string }
  >();
  lastWeekData?.forEach((e) => {
    if (thisWeekUsers.has(e.user_id)) return;
    if (!lastWeekByUser.has(e.user_id)) {
      lastWeekByUser.set(e.user_id, {
        count: 0,
        lastEvent: e.created_at,
        lastScreen: e.event_type,
      });
    }
    lastWeekByUser.get(e.user_id)!.count++;
  });

  const churnIds = Array.from(lastWeekByUser.keys()).slice(0, 20);
  if (churnIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, first_name, username')
    .in('id', churnIds);

  const nameMap = new Map(
    profiles?.map((p) => [p.id, p.first_name || p.username || 'Anonymous']) ??
      []
  );

  return churnIds.map((id) => {
    const info = lastWeekByUser.get(id)!;
    return {
      userId: id,
      name: nameMap.get(id) ?? 'Anonymous',
      lastEvent: info.lastEvent,
      lastScreen: info.lastScreen,
      totalEventsLastWeek: info.count,
    };
  });
}
