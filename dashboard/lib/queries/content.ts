import { supabase } from '../supabase';

// 1. Top content leaderboard
export async function getTopContent(
  entityType: 'country' | 'city' | 'place' | 'collection' | 'thread',
  days: number
): Promise<
  {
    id: string;
    name: string;
    views: number;
    conversions: number;
    conversionRate: number;
  }[]
> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const viewEvent = `viewed_${entityType}`;
  const conversionEvents: Record<string, string[]> = {
    country: ['viewed_city'],
    city: ['viewed_place'],
    place: ['saved_place'],
    collection: ['viewed_place'],
    thread: ['replied_thread'],
  };

  const { data: views } = await supabase
    .from('user_events')
    .select('entity_id')
    .eq('event_type', viewEvent)
    .eq('entity_type', entityType)
    .gte('created_at', since.toISOString());

  const viewCounts = new Map<string, number>();
  views?.forEach((e) => {
    if (e.entity_id)
      viewCounts.set(e.entity_id, (viewCounts.get(e.entity_id) ?? 0) + 1);
  });

  const convEvents = conversionEvents[entityType] ?? [];
  const conversionCounts = new Map<string, number>();

  if (convEvents.length > 0) {
    const { data: conversions } = await supabase
      .from('user_events')
      .select('entity_id')
      .in('event_type', convEvents)
      .gte('created_at', since.toISOString());

    conversions?.forEach((e) => {
      if (e.entity_id)
        conversionCounts.set(
          e.entity_id,
          (conversionCounts.get(e.entity_id) ?? 0) + 1
        );
    });
  }

  const topIds = Array.from(viewCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([id]) => id);

  if (topIds.length === 0) return [];

  const tableName =
    entityType === 'thread'
      ? 'community_threads'
      : entityType === 'collection'
        ? 'collections'
        : entityType === 'country'
          ? 'countries'
          : entityType === 'city'
            ? 'cities'
            : 'places';

  const nameField = entityType === 'thread' ? 'title' : 'name';

  const { data: entities } = await supabase
    .from(tableName)
    .select(`id, ${nameField}`)
    .in('id', topIds);

  const nameMap = new Map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entities?.map((e: any) => [e.id, e[nameField] ?? 'Unknown']) ?? []
  );

  return topIds.map((id) => {
    const v = viewCounts.get(id) ?? 0;
    const c = conversionCounts.get(id) ?? 0;
    return {
      id,
      name: nameMap.get(id) ?? id.slice(0, 8),
      views: v,
      conversions: c,
      conversionRate: v > 0 ? Math.round((c / v) * 100) : 0,
    };
  });
}

// 2. Search terms
export async function getSearchTerms(
  days: number
): Promise<{ term: string; count: number }[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from('user_events')
    .select('metadata')
    .eq('event_type', 'searched')
    .gte('created_at', since.toISOString());

  if (!data?.length) return [];

  const terms = new Map<string, number>();
  data.forEach((e) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = (e.metadata as any)?.query as string | undefined;
    if (query && query.trim()) {
      const normalized = query.trim().toLowerCase();
      terms.set(normalized, (terms.get(normalized) ?? 0) + 1);
    }
  });

  return Array.from(terms.entries())
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);
}

// 3. Community health
export interface CommunityHealthData {
  postsPerDay: number;
  avgRepliesPerThread: number;
  medianTimeToFirstReply: number | null;
  ghostThreadRate: number;
  totalThreads: number;
  totalReplies: number;
}

export async function getCommunityHealth(
  days: number
): Promise<CommunityHealthData> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: threads, count: threadCount } = await supabase
    .from('community_threads')
    .select('id, created_at', { count: 'exact' })
    .gte('created_at', since.toISOString());

  const { data: replies } = await supabase
    .from('community_replies')
    .select('thread_id, created_at')
    .gte('created_at', since.toISOString());

  const totalThreads = threadCount ?? 0;
  const totalReplies = replies?.length ?? 0;
  const postsPerDay =
    days > 0 ? Math.round((totalThreads / days) * 10) / 10 : 0;

  const repliesByThread = new Map<string, number>();
  replies?.forEach((r) => {
    repliesByThread.set(
      r.thread_id,
      (repliesByThread.get(r.thread_id) ?? 0) + 1
    );
  });

  const threadIds = threads?.map((t) => t.id) ?? [];
  const threadsWithReplies = threadIds.filter(
    (id) => (repliesByThread.get(id) ?? 0) > 0
  ).length;
  const ghostThreadRate =
    totalThreads > 0
      ? Math.round(
          ((totalThreads - threadsWithReplies) / totalThreads) * 100
        )
      : 0;
  const avgRepliesPerThread =
    totalThreads > 0
      ? Math.round((totalReplies / totalThreads) * 10) / 10
      : 0;

  const firstReplyTimes: number[] = [];
  if (threads?.length && replies?.length) {
    const threadCreatedMap = new Map(
      threads.map((t) => [t.id, new Date(t.created_at)])
    );
    const earliestReply = new Map<string, Date>();
    replies.forEach((r) => {
      const replyTime = new Date(r.created_at);
      const existing = earliestReply.get(r.thread_id);
      if (!existing || replyTime < existing) {
        earliestReply.set(r.thread_id, replyTime);
      }
    });

    earliestReply.forEach((replyTime, threadId) => {
      const threadTime = threadCreatedMap.get(threadId);
      if (threadTime) {
        const minutes =
          (replyTime.getTime() - threadTime.getTime()) / (1000 * 60);
        if (minutes >= 0) firstReplyTimes.push(minutes);
      }
    });
  }

  let medianTimeToFirstReply: number | null = null;
  if (firstReplyTimes.length > 0) {
    firstReplyTimes.sort((a, b) => a - b);
    const mid = Math.floor(firstReplyTimes.length / 2);
    medianTimeToFirstReply = Math.round(
      firstReplyTimes.length % 2 !== 0
        ? firstReplyTimes[mid]
        : (firstReplyTimes[mid - 1] + firstReplyTimes[mid]) / 2
    );
  }

  return {
    postsPerDay,
    avgRepliesPerThread,
    medianTimeToFirstReply,
    ghostThreadRate,
    totalThreads,
    totalReplies,
  };
}

// 4. Geographic demand
export async function getGeoDemand(
  days: number
): Promise<
  {
    name: string;
    events: number;
    contentCount: number;
    demandRatio: number;
  }[]
> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: countryEvents } = await supabase
    .from('user_events')
    .select('entity_id')
    .eq('entity_type', 'country')
    .gte('created_at', since.toISOString());

  const { data: cityEvents } = await supabase
    .from('user_events')
    .select('entity_id')
    .eq('entity_type', 'city')
    .gte('created_at', since.toISOString());

  const { data: countries } = await supabase
    .from('countries')
    .select('id, name');

  const { data: cities } = await supabase
    .from('cities')
    .select('id, country_id');

  if (!countries?.length) return [];

  const citiesPerCountry = new Map<string, number>();
  cities?.forEach((c) => {
    citiesPerCountry.set(
      c.country_id,
      (citiesPerCountry.get(c.country_id) ?? 0) + 1
    );
  });

  const cityToCountry = new Map(
    cities?.map((c) => [c.id, c.country_id]) ?? []
  );

  const eventsPerCountry = new Map<string, number>();
  countryEvents?.forEach((e) => {
    if (e.entity_id)
      eventsPerCountry.set(
        e.entity_id,
        (eventsPerCountry.get(e.entity_id) ?? 0) + 1
      );
  });
  cityEvents?.forEach((e) => {
    if (e.entity_id) {
      const countryId = cityToCountry.get(e.entity_id);
      if (countryId)
        eventsPerCountry.set(
          countryId,
          (eventsPerCountry.get(countryId) ?? 0) + 1
        );
    }
  });

  const countryNameMap = new Map(countries.map((c) => [c.id, c.name]));

  return Array.from(eventsPerCountry.entries())
    .map(([countryId, events]) => {
      const contentCount = citiesPerCountry.get(countryId) ?? 0;
      return {
        name: countryNameMap.get(countryId) ?? 'Unknown',
        events,
        contentCount,
        demandRatio:
          contentCount > 0
            ? Math.round((events / contentCount) * 10) / 10
            : events,
      };
    })
    .sort((a, b) => b.demandRatio - a.demandRatio);
}

// 5. Affiliate performance
export async function getAffiliatePerformance(
  days: number
): Promise<{ placeName: string; clicks: number; linkType: string }[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from('affiliate_clicks')
    .select('place_id, link_type')
    .gte('created_at', since.toISOString());

  if (!data?.length) return [];

  const byPlace = new Map<string, { clicks: number; linkType: string }>();
  data.forEach((row) => {
    if (!row.place_id) return;
    const existing = byPlace.get(row.place_id);
    if (existing) {
      existing.clicks++;
    } else {
      byPlace.set(row.place_id, { clicks: 1, linkType: row.link_type });
    }
  });

  const placeIds = Array.from(byPlace.keys());
  const { data: places } = await supabase
    .from('places')
    .select('id, name')
    .in('id', placeIds);

  const nameMap = new Map(places?.map((p) => [p.id, p.name]) ?? []);

  return Array.from(byPlace.entries())
    .map(([placeId, info]) => ({
      placeName: nameMap.get(placeId) ?? 'Unknown',
      clicks: info.clicks,
      linkType: info.linkType,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 20);
}
