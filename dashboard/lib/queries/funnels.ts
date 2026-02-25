import { supabase } from '../supabase';

export interface FunnelStep {
  label: string;
  eventType: string;
}

export interface FunnelResult {
  label: string;
  count: number;
  percentage: number; // % of first step
  dropoff: number; // % drop from previous step
}

// Generic funnel — count distinct users at each step in order
export async function getFunnelData(
  steps: FunnelStep[],
  days: number
): Promise<FunnelResult[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Get all relevant events
  const eventTypes = steps.map((s) => s.eventType);
  const { data } = await supabase
    .from('user_events')
    .select('user_id, event_type, created_at')
    .in('event_type', eventTypes)
    .gte('created_at', since.toISOString())
    .order('created_at');

  if (!data?.length) {
    return steps.map((s) => ({
      label: s.label,
      count: 0,
      percentage: 0,
      dropoff: 0,
    }));
  }

  // Build user event timeline
  const userEvents = new Map<string, Set<string>>();
  data.forEach((e) => {
    if (!userEvents.has(e.user_id)) userEvents.set(e.user_id, new Set());
    userEvents.get(e.user_id)!.add(e.event_type);
  });

  // Count users who completed each step (and all prior steps)
  const results: FunnelResult[] = [];
  let firstCount = 0;

  for (let i = 0; i < steps.length; i++) {
    const requiredEvents = steps.slice(0, i + 1).map((s) => s.eventType);
    const count = Array.from(userEvents.values()).filter((events) =>
      requiredEvents.every((e) => events.has(e))
    ).length;

    if (i === 0) firstCount = count;
    const prevCount = i > 0 ? results[i - 1].count : count;

    results.push({
      label: steps[i].label,
      count,
      percentage: firstCount > 0 ? Math.round((count / firstCount) * 100) : 0,
      dropoff:
        prevCount > 0
          ? Math.round(((prevCount - count) / prevCount) * 100)
          : 0,
    });
  }

  return results;
}

// Pre-defined funnels
export const ONBOARDING_FUNNEL: FunnelStep[] = [
  { label: 'Welcome', eventType: 'viewed_country' }, // Proxy: first content view
  { label: 'Explore', eventType: 'viewed_city' },
  { label: 'View Place', eventType: 'viewed_place' },
  { label: 'Save', eventType: 'saved_place' },
  { label: 'Create Trip', eventType: 'created_trip' },
];

export const DISCOVERY_FUNNEL: FunnelStep[] = [
  { label: 'Browse Countries', eventType: 'viewed_country' },
  { label: 'Explore City', eventType: 'viewed_city' },
  { label: 'View Place', eventType: 'viewed_place' },
  { label: 'Save Place', eventType: 'saved_place' },
];

export const COMMUNITY_FUNNEL: FunnelStep[] = [
  { label: 'View Thread', eventType: 'opened_thread' },
  { label: 'Reply', eventType: 'replied_thread' },
];

export const TRIP_FUNNEL: FunnelStep[] = [
  { label: 'View Place', eventType: 'viewed_place' },
  { label: 'Save Place', eventType: 'saved_place' },
  { label: 'Create Trip', eventType: 'created_trip' },
  { label: 'Add to Trip', eventType: 'added_place_to_trip' },
];
