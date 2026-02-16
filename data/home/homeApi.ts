import { supabase } from '@/lib/supabase';
import { getPopularCitiesWithCountry, getCityById, getSavedPlacesWithDetails } from '@/data/api';
import { getTripsGrouped, getTripSavedItems } from '@/data/trips/tripApi';
import { getThreadFeed } from '@/data/community/communityApi';
import type {
  PersonalizedCity,
  TripBlockState,
  TravelUpdate,
  CommunityHighlightThread,
  CommunityHighlightThreadVisual,
  HeroState,
  FeaturedCity,
  SavedPlacePreview,
} from './types';

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

// ── Hero State ──────────────────────────────────────────────────────────

async function getCityImageForTrip(
  trip: { destinationCityId: string | null },
): Promise<{ imageUrl: string | null; timezone: string | null }> {
  if (!trip.destinationCityId) return { imageUrl: null, timezone: null };
  const city = await getCityById(trip.destinationCityId);
  return {
    imageUrl: city?.heroImageUrl ?? null,
    timezone: city?.timezone ?? null,
  };
}

export async function fetchHeroState(userId: string): Promise<HeroState> {
  const grouped = await getTripsGrouped(userId);

  if (grouped.current) {
    const [items, cityInfo] = await Promise.all([
      getTripSavedItems(grouped.current.id),
      getCityImageForTrip(grouped.current),
    ]);

    let nextUpcoming = null;
    if (grouped.upcoming.length > 0) {
      nextUpcoming = grouped.upcoming[0];
    }

    return {
      kind: 'active',
      trip: grouped.current,
      savedItemCount: items.length,
      cityImageUrl: cityInfo.imageUrl,
      cityTimezone: cityInfo.timezone,
      nextUpcoming,
    };
  }

  if (grouped.upcoming.length > 0) {
    const trip = grouped.upcoming[0];
    const [items, cityInfo] = await Promise.all([
      getTripSavedItems(trip.id),
      getCityImageForTrip(trip),
    ]);

    return {
      kind: 'upcoming',
      trip,
      savedItemCount: items.length,
      cityImageUrl: cityInfo.imageUrl,
    };
  }

  // No trips — show featured city
  const city = await fetchFeaturedCity();

  return {
    kind: 'featured',
    city,
    upcomingTrip: null,
    upcomingCityImageUrl: null,
  };
}

// ── Featured City ───────────────────────────────────────────────────────

export async function fetchFeaturedCity(): Promise<FeaturedCity> {
  // Rotate weekly: pick a featured city based on week-of-year
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekOfYear = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000),
  );

  const { data, error } = await supabase
    .from('cities')
    .select('id, name, slug, short_blurb, hero_image_url, timezone, countries(name)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .not('hero_image_url', 'is', null)
    .order('order_index');

  if (!error && data && data.length > 0) {
    const idx = weekOfYear % data.length;
    const row = data[idx] as Record<string, any>;
    return {
      id: row.id,
      name: row.name,
      countryName: (row.countries as any)?.name ?? '',
      heroImageUrl: row.hero_image_url,
      slug: row.slug,
      shortBlurb: row.short_blurb ?? null,
      timezone: row.timezone ?? 'UTC',
    };
  }

  // No featured cities — pull a real city from the DB by slug so we get its actual image
  const { data: fallbackCity } = await supabase
    .from('cities')
    .select('id, name, slug, short_blurb, hero_image_url, timezone, countries(name)')
    .eq('is_active', true)
    .not('hero_image_url', 'is', null)
    .order('order_index')
    .limit(1)
    .maybeSingle();

  if (fallbackCity) {
    return {
      id: fallbackCity.id,
      name: fallbackCity.name,
      countryName: (fallbackCity.countries as any)?.name ?? '',
      heroImageUrl: fallbackCity.hero_image_url,
      slug: fallbackCity.slug,
      shortBlurb: fallbackCity.short_blurb ?? null,
      timezone: fallbackCity.timezone ?? 'UTC',
    };
  }

  // Ultimate hardcoded fallback — should never reach here if DB has any cities
  return {
    id: '',
    name: 'Bangkok',
    countryName: 'Thailand',
    heroImageUrl: '',
    slug: 'bangkok',
    shortBlurb: 'Temples, street food, and a solo traveler favorite',
    timezone: 'Asia/Bangkok',
  };
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
      soloLevel: (row.solo_level as string) || null,
      avgDailyBudgetUsd: (row.avg_daily_budget_usd as number) || null,
      bestFor: (row.best_for as string) || null,
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
      soloLevel: c.soloLevel ?? null,
      avgDailyBudgetUsd: c.avgDailyBudgetUsd ?? null,
      bestFor: c.bestFor ?? null,
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

export async function fetchCommunityHighlightsVisual(
  userId: string,
  limit: number = 3,
): Promise<CommunityHighlightThreadVisual[]> {
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
    cityImageUrl: t.cityImageUrl ?? null,
    author: {
      firstName: t.author.firstName,
      avatarUrl: t.author.avatarUrl,
    },
  }));
}

// ── User First Name ─────────────────────────────────────────────────────

export async function fetchUserFirstName(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('first_name')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return data.first_name ?? null;
}

// ── Saved Places Preview ────────────────────────────────────────────────

export async function fetchSavedPlacesPreview(
  userId: string,
  limit: number = 4,
): Promise<SavedPlacePreview[]> {
  const places = await getSavedPlacesWithDetails(userId, limit);
  return places;
}
