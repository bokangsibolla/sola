import { supabase } from '@/lib/supabase';
import { toCamel, getPopularCitiesWithCountry } from '@/data/api';
import { getTripsGrouped, getTripSavedItems } from '@/data/trips/tripApi';
import { getThreadFeed } from '@/data/community/communityApi';
import type { PersonalizedCity, TripBlockState, TravelUpdate, CommunityHighlightThread } from './types';

// ── Trip Block ──────────────────────────────────────────────────────────

export async function fetchTripBlock(userId: string): Promise<TripBlockState> {
  const grouped = await getTripsGrouped(userId);

  if (grouped.current) {
    const items = await getTripSavedItems(grouped.current.id);
    return { kind: 'active', trip: grouped.current, savedItemCount: items.length };
  }

  if (grouped.upcoming.length > 0) {
    const trip = grouped.upcoming[0];
    const items = await getTripSavedItems(trip.id);
    return { kind: 'upcoming', trip, savedItemCount: items.length };
  }

  return { kind: 'none' };
}

// ── Personalized Cities ─────────────────────────────────────────────────

export async function fetchPersonalizedCities(
  userId: string,
  limit: number = 10,
): Promise<PersonalizedCity[]> {
  // Try personalized recommendations first
  const { data: rpcData } = await supabase.rpc('get_personalized_cities', {
    p_user_id: userId,
    p_limit: limit,
  });

  let cities: PersonalizedCity[] = [];

  if (rpcData && rpcData.length >= 3) {
    cities = rpcData.map((row: Record<string, unknown>) => ({
      cityId: row.city_id as string,
      cityName: row.city_name as string,
      countryName: row.country_name as string,
      heroImageUrl: (row.hero_image_url as string) || null,
      slug: row.slug as string,
      affinityScore: (row.affinity_score as number) || 0,
      planningCount: 0,
      activityCount: 0,
    }));
  } else {
    // Fallback: popular cities
    const popular = await getPopularCitiesWithCountry(limit);
    cities = popular.map((c) => ({
      cityId: c.id,
      cityName: c.name,
      countryName: c.countryName,
      heroImageUrl: c.heroImageUrl,
      slug: c.slug,
      affinityScore: 0,
      planningCount: 0,
      activityCount: 0,
    }));
  }

  if (cities.length === 0) return [];

  // Enrich with planning + community counts
  const cityIds = cities.map((c) => c.cityId);

  const [planningRes, activityRes] = await Promise.allSettled([
    supabase.rpc('get_city_planning_count', { p_city_ids: cityIds }),
    supabase.rpc('get_city_community_activity', { p_city_ids: cityIds }),
  ]);

  const planningMap = new Map<string, number>();
  if (planningRes.status === 'fulfilled' && planningRes.value.data) {
    for (const row of planningRes.value.data) {
      planningMap.set(row.city_id, row.planning_count);
    }
  }

  const activityMap = new Map<string, number>();
  if (activityRes.status === 'fulfilled' && activityRes.value.data) {
    for (const row of activityRes.value.data) {
      activityMap.set(row.city_id, row.activity_count);
    }
  }

  return cities.map((c) => ({
    ...c,
    planningCount: planningMap.get(c.cityId) ?? 0,
    activityCount: activityMap.get(c.cityId) ?? 0,
  }));
}

// ── Travel Updates ──────────────────────────────────────────────────────

export async function fetchActiveTravelUpdate(
  tripCountryIds?: string[],
): Promise<TravelUpdate | null> {
  let query = supabase
    .from('travel_updates')
    .select('id, title, body, severity, country_id')
    .eq('is_active', true)
    .or('expires_at.is.null,expires_at.gt.now()')
    .order('created_at', { ascending: false })
    .limit(10);

  const { data, error } = await query;
  if (error || !data || data.length === 0) return null;

  // Prefer updates matching trip's country
  if (tripCountryIds && tripCountryIds.length > 0) {
    const matched = data.find((u: Record<string, unknown>) =>
      u.country_id && tripCountryIds.includes(u.country_id as string),
    );
    if (matched) {
      return {
        id: matched.id,
        title: matched.title,
        body: matched.body,
        severity: matched.severity as TravelUpdate['severity'],
      };
    }
  }

  // Return most recent
  const first = data[0];
  return {
    id: first.id,
    title: first.title,
    body: first.body,
    severity: first.severity as TravelUpdate['severity'],
  };
}

// ── Community Highlights ────────────────────────────────────────────────

export async function fetchCommunityHighlights(
  userId: string,
  limit: number = 2,
): Promise<CommunityHighlightThread[]> {
  // Fetch top threads as highlights
  const threads = await getThreadFeed(userId, {
    sort: 'top',
    page: 0,
    pageSize: limit,
  });

  return threads.map((t) => ({
    id: t.id,
    title: t.title,
    replyCount: t.replyCount,
    topicLabel: t.topicLabel,
    cityName: t.cityName,
    author: {
      firstName: t.author.firstName,
      avatarUrl: t.author.avatarUrl,
    },
  }));
}
