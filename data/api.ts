/**
 * API query layer — the single import point for all screens.
 * All functions query Supabase. Types match data/types.ts.
 */

import { supabase } from '@/lib/supabase';
import type {
  Country,
  City,
  CityArea,
  Place,
  PlaceMedia,
  PlaceCategory,
  Tag,
  Profile,
  SavedPlace,
  Collection,
  Trip,
  TripPlace,
  CityEvent,
  CityEventWithLocation,
  Conversation,
  Message,
  DestinationTag,
  PaginatedResult,
  PlaceSignal,
  PlaceVerificationSignal,
  PlaceSolaNote,
  PlaceVerificationStatus,
  PlaceWithCity,
  ConnectionRequest,
  ConnectionStatus,
  PendingVerification,
  ProfileTag,
} from './types';
import type { CityWithCountry } from './explore/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Escape special characters for Postgres ILIKE patterns. */
export function escapeIlike(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&');
}

/** Convert snake_case row to camelCase type. Supabase returns snake_case. */
export function toCamel<T>(row: Record<string, any>): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = v;
  }
  return out as T;
}

export function rowsToCamel<T>(rows: Record<string, any>[]): T[] {
  return rows.map((r) => toCamel<T>(r));
}

/**
 * Map a country database row to Country type.
 * Handles all content fields from the consolidated schema:
 * - title, subtitle, summary, summary_md → summaryMd, content_md → contentMd
 * - why_we_love_md → whyWeLoveMd, safety_rating → safetyRating
 * - solo_friendly → soloFriendly, solo_level → soloLevel
 * - best_months → bestMonths, best_time_to_visit → bestTimeToVisit
 * - currency, language, visa_note → visaNote
 * - highlights, avg_daily_budget_usd → avgDailyBudgetUsd
 * - internet_quality → internetQuality, english_friendliness → englishFriendliness
 * - good_for_interests → goodForInterests, best_for → bestFor
 * - getting_there_md → gettingThereMd, visa_entry_md → visaEntryMd
 * - sim_connectivity_md → simConnectivityMd, money_md → moneyMd
 * - culture_etiquette_md → cultureEtiquetteMd, safety_women_md → safetyWomenMd
 * - portrait_md → portraitMd, published_at → publishedAt
 */
export function mapCountry(row: Record<string, any>): Country {
  return {
    id: row.id,
    slug: row.slug,
    continent: row.continent,
    name: row.name,
    iso2: row.iso2,
    iso3: row.iso3,
    currencyCode: row.currency_code,
    isActive: row.is_active,
    orderIndex: row.order_index,
    heroImageUrl: row.hero_image_url,
    shortBlurb: row.short_blurb,
    badgeLabel: row.badge_label,
    isFeatured: row.is_featured,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    imageSource: row.image_source,
    imageAttribution: row.image_attribution,
    imageCachedAt: row.image_cached_at,
    // Content fields (merged from geo_content)
    title: row.title,
    subtitle: row.subtitle,
    summary: row.summary,
    summaryMd: row.summary_md,
    contentMd: row.content_md,
    whyWeLoveMd: row.why_we_love_md,
    safetyRating: row.safety_rating,
    soloFriendly: row.solo_friendly,
    soloLevel: row.solo_level,
    bestMonths: row.best_months,
    bestTimeToVisit: row.best_time_to_visit,
    currency: row.currency,
    language: row.language,
    visaNote: row.visa_note,
    highlights: row.highlights,
    avgDailyBudgetUsd: row.avg_daily_budget_usd,
    internetQuality: row.internet_quality,
    englishFriendliness: row.english_friendliness,
    goodForInterests: row.good_for_interests,
    bestFor: row.best_for,
    gettingThereMd: row.getting_there_md,
    visaEntryMd: row.visa_entry_md,
    simConnectivityMd: row.sim_connectivity_md,
    moneyMd: row.money_md,
    cultureEtiquetteMd: row.culture_etiquette_md,
    safetyWomenMd: row.safety_women_md,
    portraitMd: row.portrait_md,
    // Dimension content (markdown)
    sovereigntyMd: row.sovereignty_md ?? null,
    soloInfrastructureMd: row.solo_infrastructure_md ?? null,
    healthAccessMd: row.health_access_md ?? null,
    experienceDensityMd: row.experience_density_md ?? null,
    communityConnectionMd: row.community_connection_md ?? null,
    costRealityMd: row.cost_reality_md ?? null,
    // Practical links
    immigrationUrl: row.immigration_url ?? null,
    arrivalCardUrl: row.arrival_card_url ?? null,
    simProviders: row.sim_providers ?? null,
    healthSearchTerms: row.health_search_terms ?? null,
    // Structured fields (country page redesign)
    budgetBreakdown: row.budget_breakdown ?? null,
    destinationHighlights: row.destination_highlights ?? null,
    budgetTips: row.budget_tips ?? null,
    vibeSummary: row.vibe_summary ?? null,
    socialVibe: row.social_vibe ?? null,
    culturalNote: row.cultural_note ?? null,
    transportSummary: row.transport_summary ?? null,
    introMd: row.intro_md ?? null,
    // Country guide v2 fields
    bestForMd: row.best_for_md ?? null,
    mightStruggleMd: row.might_struggle_md ?? null,
    legalContextMd: row.legal_context_md ?? null,
    finalNoteMd: row.final_note_md ?? null,
    cashVsCard: row.cash_vs_card ?? null,
    plugType: row.plug_type ?? null,
    publishedAt: row.published_at,
  };
}

/**
 * Map a city database row to City type.
 * Handles all content fields from the consolidated schema plus city-specific fields:
 * - All country content fields (see mapCountry)
 * - transport_md → transportMd
 * - top_things_to_do → topThingsToDo
 */
export function mapCity(row: Record<string, any>): City {
  return {
    id: row.id,
    countryId: row.country_id,
    slug: row.slug,
    name: row.name,
    timezone: row.timezone,
    centerLat: row.center_lat,
    centerLng: row.center_lng,
    isActive: row.is_active,
    orderIndex: row.order_index,
    heroImageUrl: row.hero_image_url,
    shortBlurb: row.short_blurb,
    badgeLabel: row.badge_label,
    isFeatured: row.is_featured,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    imageSource: row.image_source,
    imageAttribution: row.image_attribution,
    imageCachedAt: row.image_cached_at,
    // Content fields (merged from geo_content)
    title: row.title,
    subtitle: row.subtitle,
    summary: row.summary,
    summaryMd: row.summary_md,
    contentMd: row.content_md,
    whyWeLoveMd: row.why_we_love_md,
    safetyRating: row.safety_rating,
    soloFriendly: row.solo_friendly,
    soloLevel: row.solo_level,
    bestMonths: row.best_months,
    bestTimeToVisit: row.best_time_to_visit,
    currency: row.currency,
    language: row.language,
    visaNote: row.visa_note,
    highlights: row.highlights,
    avgDailyBudgetUsd: row.avg_daily_budget_usd,
    internetQuality: row.internet_quality,
    englishFriendliness: row.english_friendliness,
    goodForInterests: row.good_for_interests,
    bestFor: row.best_for,
    cultureEtiquetteMd: row.culture_etiquette_md,
    safetyWomenMd: row.safety_women_md,
    portraitMd: row.portrait_md,
    publishedAt: row.published_at,
    // City-specific content fields
    transportMd: row.transport_md,
    topThingsToDo: row.top_things_to_do,
    // City page redesign — structured content
    positioningLine: row.positioning_line ?? null,
    budgetTier: row.budget_tier ?? null,
    vibe: row.vibe ?? null,
    walkability: row.walkability ?? null,
    transitEase: row.transit_ease ?? null,
    womenShouldKnow: row.women_should_know ?? null,
    experiencePillars: row.experience_pillars ?? null,
    howWomenUse: row.how_women_use ?? null,
    awareness: row.awareness ?? null,
    // Place kind (country destinations grouping)
    placeKind: row.place_kind ?? 'city',
    placeKindDescriptor: row.place_kind_descriptor ?? null,
  };
}

/** Map multiple country rows to Country[] */
export function mapCountries(rows: Record<string, any>[]): Country[] {
  return rows.map(mapCountry);
}

/** Map multiple city rows to City[] */
export function mapCities(rows: Record<string, any>[]): City[] {
  return rows.map(mapCity);
}

// ---------------------------------------------------------------------------
// Geography
// ---------------------------------------------------------------------------

export async function getCountries(): Promise<Country[]> {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('is_active', true)
    .order('order_index');
  if (error) throw error;
  return mapCountries(data ?? []);
}

export async function getCountriesWithCities(): Promise<
  (Country & { cities: { id: string; name: string; slug: string }[] })[]
> {
  const { data, error } = await supabase
    .from('countries')
    .select('*, cities(id, name, slug, is_active)')
    .eq('is_active', true)
    .order('order_index');
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...mapCountry(row),
    cities: (row.cities ?? [])
      .filter((c: any) => c.is_active)
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })),
  }));
}

export async function getCountryBySlug(slug: string): Promise<Country | undefined> {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCountry(data) : undefined;
}

export async function getCountryByIso2(iso2: string): Promise<Country | undefined> {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('iso2', iso2)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCountry(data) : undefined;
}

export async function getCountryById(id: string): Promise<Country | undefined> {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCountry(data) : undefined;
}

export async function getCitiesByCountry(countryId: string): Promise<City[]> {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('country_id', countryId)
    .eq('is_active', true)
    .order('order_index');
  if (error) throw error;
  return mapCities(data ?? []);
}

export async function getPopularCities(limit = 12): Promise<City[]> {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('is_active', true)
    .order('order_index')
    .limit(limit);
  if (error) throw error;
  return mapCities(data ?? []);
}

export async function getPopularCitiesWithCountry(
  limit: number = 12
): Promise<CityWithCountry[]> {
  const { data, error } = await supabase
    .from('cities')
    .select('*, countries(name, slug)')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('order_index')
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row: any) => {
    const city = mapCity(row);
    return {
      ...city,
      countryName: row.countries?.name ?? '',
      countrySlug: row.countries?.slug ?? '',
    };
  });
}

export async function getCityWithCountryBySlug(
  slug: string
): Promise<CityWithCountry | undefined> {
  const { data, error } = await supabase
    .from('cities')
    .select('*, countries(name, slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .limit(1)
    .single();

  if (error || !data) return undefined;

  const city = mapCity(data);
  return {
    ...city,
    countryName: (data as any).countries?.name ?? '',
    countrySlug: (data as any).countries?.slug ?? '',
  };
}

export async function getAllCities(): Promise<City[]> {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('is_active', true)
    .order('order_index');
  if (error) throw error;
  return mapCities(data ?? []);
}

export async function getCityBySlug(slug: string): Promise<City | undefined> {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCity(data) : undefined;
}

export async function getCityById(id: string): Promise<City | undefined> {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCity(data) : undefined;
}

/**
 * Look up a city by name (case-insensitive).
 * Returns the first matching city or null if not found.
 */
export async function getCityByName(name: string): Promise<City | null> {
  if (!name?.trim()) return null;

  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .ilike('name', escapeIlike(name.trim()))
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return mapCity(data);
}

export async function getAreaById(areaId: string): Promise<CityArea | null> {
  const { data, error } = await supabase
    .from('city_areas')
    .select('*')
    .eq('id', areaId)
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel<CityArea>(data) : null;
}

export async function getAreasByCity(cityId: string): Promise<CityArea[]> {
  const { data, error } = await supabase
    .from('city_areas')
    .select('*')
    .eq('city_id', cityId)
    .eq('is_active', true)
    .order('order_index');
  if (error) throw error;
  return rowsToCamel<CityArea>(data ?? []);
}

// ---------------------------------------------------------------------------
// Destination Tags
// ---------------------------------------------------------------------------

export async function getDestinationTags(
  entityType: 'country' | 'city' | 'neighborhood',
  entityId: string,
): Promise<DestinationTag[]> {
  const { data, error } = await supabase
    .from('destination_tags')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('order_index');
  if (error) throw error;
  return rowsToCamel<DestinationTag>(data ?? []);
}

export async function getCountriesByTag(tagSlug: string): Promise<Country[]> {
  const { data, error } = await supabase
    .from('destination_tags')
    .select('entity_id')
    .eq('entity_type', 'country')
    .eq('tag_slug', tagSlug);
  if (error) throw error;
  const ids = (data ?? []).map((r) => r.entity_id);
  if (ids.length === 0) return [];
  const { data: countries, error: cError } = await supabase
    .from('countries')
    .select('*')
    .in('id', ids)
    .eq('is_active', true)
    .order('order_index');
  if (cError) throw cError;
  return mapCountries(countries ?? []);
}

export async function getCountriesByTags(tagSlugs: string[]): Promise<Country[]> {
  if (tagSlugs.length === 0) return getCountries();
  const { data, error } = await supabase
    .from('destination_tags')
    .select('entity_id')
    .eq('entity_type', 'country')
    .in('tag_slug', tagSlugs);
  if (error) throw error;
  const ids = (data ?? []).map((r) => r.entity_id).filter((v, i, arr) => arr.indexOf(v) === i);
  if (ids.length === 0) return [];
  const { data: countries, error: cError } = await supabase
    .from('countries')
    .select('*')
    .in('id', ids)
    .eq('is_active', true)
    .order('order_index');
  if (cError) throw cError;
  return mapCountries(countries ?? []);
}

/**
 * Get cities matching a set of tag slugs.
 * @param tagSlugs - Tag slugs to match
 * @param mode - 'all' requires every tag, 'any' requires at least one
 */
export async function getCitiesByTags(
  tagSlugs: string[],
  mode: 'all' | 'any' = 'all',
): Promise<CityWithCountry[]> {
  if (tagSlugs.length === 0) return [];

  const { data, error } = await supabase
    .from('destination_tags')
    .select('entity_id')
    .eq('entity_type', 'city')
    .in('tag_slug', tagSlugs);
  if (error) throw error;

  let ids: string[];
  if (mode === 'any') {
    // Union — any matching tag
    ids = (data ?? []).map((r) => r.entity_id).filter((v, i, arr) => arr.indexOf(v) === i);
  } else {
    // Intersection — must have ALL tags
    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      counts.set(row.entity_id, (counts.get(row.entity_id) ?? 0) + 1);
    }
    ids = Array.from(counts.entries())
      .filter(([, count]) => count >= tagSlugs.length)
      .map(([id]) => id);
  }

  if (ids.length === 0) return [];

  const { data: cities, error: cError } = await supabase
    .from('cities')
    .select('*, countries(name, slug)')
    .in('id', ids)
    .eq('is_active', true)
    .order('order_index');
  if (cError) throw cError;

  return (cities ?? []).map((row: any) => {
    const city = mapCity(row);
    return {
      ...city,
      countryName: row.countries?.name ?? '',
      countrySlug: row.countries?.slug ?? '',
    };
  });
}

export async function getUniqueDestinationTagSlugs(
  entityType: 'country' | 'city' | 'neighborhood',
  tagCategory?: string,
): Promise<{ tagSlug: string; tagLabel: string }[]> {
  let query = supabase
    .from('destination_tags')
    .select('tag_slug, tag_label')
    .eq('entity_type', entityType);

  if (tagCategory) {
    query = query.eq('tag_category', tagCategory);
  }

  const { data, error } = await query;
  if (error) throw error;

  const seen = new Set<string>();
  const result: { tagSlug: string; tagLabel: string }[] = [];
  for (const row of data ?? []) {
    if (!seen.has(row.tag_slug)) {
      seen.add(row.tag_slug);
      result.push({ tagSlug: row.tag_slug, tagLabel: row.tag_label });
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Places
// ---------------------------------------------------------------------------

export async function getPlacesByCity(cityId: string): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('city_id', cityId)
    .eq('is_active', true);
  if (error) throw error;
  return rowsToCamel<Place>(data ?? []);
}

export async function getPlacesByCityAndType(
  cityId: string,
  placeType: Place['placeType'],
): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('city_id', cityId)
    .eq('place_type', placeType)
    .eq('is_active', true);
  if (error) throw error;
  return rowsToCamel<Place>(data ?? []);
}

export async function getPlacesByArea(cityAreaId: string): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('city_area_id', cityAreaId)
    .eq('is_active', true);
  if (error) throw error;
  return rowsToCamel<Place>(data ?? []);
}

export async function getPlaceById(id: string): Promise<Place | undefined> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel<Place>(data) : undefined;
}

export async function getPlaceBySlug(slug: string): Promise<Place | undefined> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel<Place>(data) : undefined;
}

/**
 * Get an activity (tour/activity place) by slug
 */
export async function getActivityBySlug(slug: string): Promise<Place | undefined> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('slug', slug)
    .in('place_type', ['activity', 'tour'])
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel<Place>(data) : undefined;
}

/**
 * Get activity with its media, tags, and breadcrumb context (city + country)
 */
export async function getActivityWithDetails(slug: string): Promise<{
  activity: Place;
  media: PlaceMedia[];
  tags: Tag[];
  city?: City;
  country?: Country;
} | undefined> {
  const activity = await getActivityBySlug(slug);
  if (!activity) return undefined;

  const [media, tags, city] = await Promise.all([
    getPlaceMedia(activity.id),
    getPlaceTags(activity.id),
    activity.cityId ? getCityById(activity.cityId) : Promise.resolve(undefined),
  ]);

  const country = city?.countryId
    ? await getCountryById(city.countryId)
    : undefined;

  return { activity, media, tags, city, country };
}

// ---------------------------------------------------------------------------
// Accommodation Detail
// ---------------------------------------------------------------------------

/**
 * Get an accommodation (hotel/hostel/homestay) by slug
 */
export async function getAccommodationBySlug(slug: string): Promise<Place | undefined> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('slug', slug)
    .in('place_type', ['hotel', 'hostel', 'homestay'])
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel<Place>(data) : undefined;
}

/**
 * Get accommodation with its media, tags, and breadcrumb context (city + country)
 */
export async function getAccommodationWithDetails(slug: string): Promise<{
  accommodation: Place;
  media: PlaceMedia[];
  tags: Tag[];
  city?: City;
  country?: Country;
} | undefined> {
  const accommodation = await getAccommodationBySlug(slug);
  if (!accommodation) return undefined;

  const [media, tags, city] = await Promise.all([
    getPlaceMedia(accommodation.id),
    getPlaceTags(accommodation.id),
    accommodation.cityId ? getCityById(accommodation.cityId) : Promise.resolve(undefined),
  ]);

  const country = city?.countryId
    ? await getCountryById(city.countryId)
    : undefined;

  return { accommodation, media, tags, city, country };
}

export async function getPlaceMedia(placeId: string): Promise<PlaceMedia[]> {
  const { data, error } = await supabase
    .from('place_media')
    .select('*')
    .eq('place_id', placeId)
    .order('order_index');
  if (error) throw error;
  return rowsToCamel<PlaceMedia>(data ?? []);
}

export async function getPlaceFirstImage(placeId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('place_media')
    .select('url')
    .eq('place_id', placeId)
    .eq('media_type', 'image')
    .order('order_index')
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.url ?? null;
}

export async function getPlaceTags(placeId: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('place_tags')
    .select('tag_id, tags(*)')
    .eq('place_id', placeId);
  if (error) throw error;
  return (data ?? [])
    .map((row: any) => row.tags)
    .filter(Boolean)
    .map((t: any) => toCamel<Tag>(t));
}

export async function getCategory(categoryId: string): Promise<PlaceCategory | undefined> {
  const { data, error } = await supabase
    .from('place_categories')
    .select('*')
    .eq('id', categoryId)
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel<PlaceCategory>(data) : undefined;
}

export async function getCategories(): Promise<PlaceCategory[]> {
  const { data, error } = await supabase
    .from('place_categories')
    .select('*')
    .eq('is_active', true)
    .order('order_index');
  if (error) throw error;
  return rowsToCamel<PlaceCategory>(data ?? []);
}

// ---------------------------------------------------------------------------
// Time-Based Place Queries (for city page redesign)
// ---------------------------------------------------------------------------

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'any';

/**
 * Get places by time of day for a city.
 * Used for time-based sections on city pages.
 */
export async function getPlacesByTimeOfDay(
  cityId: string,
  timeOfDay: TimeOfDay,
): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('city_id', cityId)
    .eq('is_active', true)
    .eq('best_time_of_day', timeOfDay)
    .order('curation_score', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return rowsToCamel<Place>(data ?? []);
}

/**
 * Get activities and tours for a city (for "If you have a full day" section).
 * Includes tours, activities, and landmarks with bestTimeOfDay = 'any' or longer durations.
 */
export async function getActivitiesByCity(cityId: string): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('city_id', cityId)
    .eq('is_active', true)
    .in('place_type', ['tour', 'activity', 'landmark'])
    .order('curation_score', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return rowsToCamel<Place>(data ?? []);
}

/**
 * Get top places for a country, ordered by featured status and curation score.
 * Joins through cities to resolve country, and includes first media image.
 */
export async function getTopPlacesByCountry(
  countryId: string,
  limit = 8,
): Promise<PlaceWithCity[]> {
  const { data, error } = await supabase
    .from('places')
    .select(`
      *,
      cities!inner(name, country_id),
      place_media(url)
    `)
    .eq('cities.country_id', countryId)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('curation_score', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...toCamel<Place>(row),
    cityName: row.cities?.name ?? '',
    imageUrl: row.place_media?.[0]?.url ?? null,
  }));
}

/**
 * Get places for a country filtered by place type(s).
 * Joins through cities to resolve country, includes city name.
 */
export async function getPlacesByCountryAndType(
  countryId: string,
  placeTypes: string[],
  limit = 8,
): Promise<PlaceWithCity[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*, cities!inner(name, country_id), place_media(url)')
    .eq('cities.country_id', countryId)
    .in('place_type', placeTypes)
    .eq('is_active', true)
    .order('curation_score', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...toCamel<Place>(row),
    cityName: row.cities?.name ?? '',
    imageUrl: row.place_media?.[0]?.url ?? null,
  }));
}

/**
 * Get experiences (tours, activities, landmarks) for a country.
 * Only things you actually DO — never accommodations, spas, or services.
 */
export async function getExperiencesByCountry(
  countryId: string,
  limit = 10,
): Promise<PlaceWithCity[]> {
  const experienceTypes = ['tour', 'activity', 'landmark'];
  return getPlacesByCountryAndType(countryId, experienceTypes, limit);
}

/**
 * Get social spots (bars, cafes, clubs, rooftops, restaurants) for a country.
 * Meeting-people places only.
 */
export async function getSocialSpotsByCountry(
  countryId: string,
  limit = 8,
): Promise<PlaceWithCity[]> {
  const socialTypes = ['bar', 'club', 'rooftop', 'cafe', 'restaurant'];
  return getPlacesByCountryAndType(countryId, socialTypes, limit);
}

/**
 * Get volunteer orgs for a specific city.
 */
export async function getVolunteersByCity(cityId: string): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*, place_media(url)')
    .eq('city_id', cityId)
    .eq('place_type', 'volunteer')
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...toCamel<Place>(row),
    imageUrl: row.image_url_cached ?? row.place_media?.[0]?.url ?? null,
  }));
}

/**
 * Get volunteer orgs across a country (joins city name + image).
 */
export async function getVolunteersByCountry(
  countryId: string,
  limit = 10,
): Promise<PlaceWithCity[]> {
  return getPlacesByCountryAndType(countryId, ['volunteer'], limit);
}

/**
 * Get all volunteer orgs across all countries (for dedicated listing).
 */
export interface VolunteerWithLocation extends Place {
  cityName: string;
  countryName: string;
  countryId: string;
  imageUrl: string | null;
}

export async function getAllVolunteers(limit = 200): Promise<VolunteerWithLocation[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*, cities!inner(name, country_id, countries(name)), place_media(url)')
    .eq('place_type', 'volunteer')
    .eq('is_active', true)
    .order('name')
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...toCamel<Place>(row),
    cityName: row.cities?.name ?? '',
    countryName: row.cities?.countries?.name ?? '',
    countryId: row.cities?.country_id ?? '',
    imageUrl: row.image_url_cached ?? row.place_media?.[0]?.url ?? null,
  }));
}

export async function getAllActivities(limit = 50): Promise<(Place & { imageUrl: string | null })[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*, place_media(url)')
    .eq('is_active', true)
    .in('place_type', ['tour', 'activity', 'landmark'])
    .order('curation_score', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...rowsToCamel<Place>([row])[0],
    imageUrl: row.image_url_cached ?? row.place_media?.[0]?.url ?? null,
  }));
}

/**
 * Get accommodations for a city (for "Where to Stay" section).
 */
export async function getAccommodationsByCity(cityId: string): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('city_id', cityId)
    .eq('is_active', true)
    .in('place_type', ['hotel', 'hostel', 'homestay'])
    .order('curation_score', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return rowsToCamel<Place>(data ?? []);
}

/**
 * Result type for getPlacesGroupedByTime
 */
export interface PlacesGroupedByTime {
  morning: Place[];
  afternoon: Place[];
  evening: Place[];
  fullDay: Place[];
  accommodations: Place[];
}

/**
 * Get all places for a city grouped by time of day.
 * This is the main query for the new time-based city page architecture.
 *
 * Sections:
 * - morning: Places with best_time_of_day = 'morning' (cafés, coworking, breakfast spots)
 * - afternoon: Places with best_time_of_day = 'afternoon' (lunch, walks, attractions)
 * - evening: Places with best_time_of_day = 'evening' (dinner, bars, nightlife)
 * - fullDay: Tours and activities (place_type = 'tour' or 'activity') + any with best_time_of_day = 'any'
 * - accommodations: Hotels, hostels, homestays
 */
export async function getPlacesGroupedByTime(cityId: string): Promise<PlacesGroupedByTime> {
  // Fetch all active places for this city in one query
  // Note: We don't order by curation_score to avoid errors if column is null
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('city_id', cityId)
    .eq('is_active', true);

  if (error) throw error;

  const places = rowsToCamel<Place>(data ?? []);

  // Group places by their intended use
  const accommodationTypes = ['hotel', 'hostel', 'homestay'];
  const activityTypes = ['tour', 'activity'];

  const result: PlacesGroupedByTime = {
    morning: [],
    afternoon: [],
    evening: [],
    fullDay: [],
    accommodations: [],
  };

  for (const place of places) {
    // Accommodations go to their own section
    if (accommodationTypes.includes(place.placeType)) {
      result.accommodations.push(place);
      continue;
    }

    // Tours and activities go to fullDay section
    if (activityTypes.includes(place.placeType)) {
      result.fullDay.push(place);
      continue;
    }

    // Landmarks without specific time go to fullDay
    if (place.placeType === 'landmark' && (!place.bestTimeOfDay || place.bestTimeOfDay === 'any')) {
      result.fullDay.push(place);
      continue;
    }

    // Group by time of day
    switch (place.bestTimeOfDay) {
      case 'morning':
        result.morning.push(place);
        break;
      case 'afternoon':
        result.afternoon.push(place);
        break;
      case 'evening':
        result.evening.push(place);
        break;
      case 'any':
        // Places with 'any' time that aren't tours/activities go to fullDay
        result.fullDay.push(place);
        break;
      default:
        // Places without bestTimeOfDay - use place type heuristics
        if (['cafe', 'bakery', 'coworking'].includes(place.placeType)) {
          result.morning.push(place);
        } else if (['restaurant'].includes(place.placeType)) {
          // Restaurants could be lunch or dinner - put in afternoon by default
          result.afternoon.push(place);
        } else if (['bar', 'club', 'rooftop'].includes(place.placeType)) {
          result.evening.push(place);
        } else {
          // Default to fullDay for unclassified places
          result.fullDay.push(place);
        }
    }
  }

  return result;
}

/**
 * Get places for a specific neighborhood/area grouped by time.
 * Same grouping logic as getPlacesGroupedByTime but filtered by city_area_id.
 */
export async function getPlacesGroupedByTimeForArea(
  cityAreaId: string,
): Promise<PlacesGroupedByTime> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('city_area_id', cityAreaId)
    .eq('is_active', true);

  if (error) throw error;

  const places = rowsToCamel<Place>(data ?? []);

  const accommodationTypes = ['hotel', 'hostel', 'homestay'];
  const activityTypes = ['tour', 'activity'];

  const result: PlacesGroupedByTime = {
    morning: [],
    afternoon: [],
    evening: [],
    fullDay: [],
    accommodations: [],
  };

  for (const place of places) {
    if (accommodationTypes.includes(place.placeType)) {
      result.accommodations.push(place);
      continue;
    }

    if (activityTypes.includes(place.placeType)) {
      result.fullDay.push(place);
      continue;
    }

    if (place.placeType === 'landmark' && (!place.bestTimeOfDay || place.bestTimeOfDay === 'any')) {
      result.fullDay.push(place);
      continue;
    }

    switch (place.bestTimeOfDay) {
      case 'morning':
        result.morning.push(place);
        break;
      case 'afternoon':
        result.afternoon.push(place);
        break;
      case 'evening':
        result.evening.push(place);
        break;
      case 'any':
        result.fullDay.push(place);
        break;
      default:
        if (['cafe', 'bakery', 'coworking'].includes(place.placeType)) {
          result.morning.push(place);
        } else if (['restaurant'].includes(place.placeType)) {
          result.afternoon.push(place);
        } else if (['bar', 'club', 'rooftop'].includes(place.placeType)) {
          result.evening.push(place);
        } else {
          result.fullDay.push(place);
        }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw error;
  return rowsToCamel<Profile>(data ?? []);
}

export async function getProfileById(id: string): Promise<Profile | undefined> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel<Profile>(data) : undefined;
}

// ---------------------------------------------------------------------------
// Saved Places
// ---------------------------------------------------------------------------

export async function getSavedPlaces(userId: string): Promise<SavedPlace[]> {
  const { data, error } = await supabase
    .from('saved_places')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return rowsToCamel<SavedPlace>(data ?? []);
}

export async function getSavedPlacesCountForCity(userId: string, cityId: string): Promise<number> {
  const { count, error } = await supabase
    .from('saved_places')
    .select('id, places!inner(city_id)', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('places.city_id', cityId);
  if (error) throw error;
  return count ?? 0;
}

/**
 * Get saved places with name, image, and city for feed display.
 * Returns most recent saves first, limited to 10.
 */
export async function getSavedPlacesWithDetails(
  userId: string,
  limit = 10,
): Promise<{ placeId: string; placeName: string; imageUrl: string | null; cityName: string | null }[]> {
  const { data, error } = await supabase
    .from('saved_places')
    .select(`
      place_id,
      places!inner(name, city_id, cities(name)),
      created_at
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const results: { placeId: string; placeName: string; imageUrl: string | null; cityName: string | null }[] = [];

  for (const row of data ?? []) {
    const place = (row as any).places;
    if (!place) continue;

    // Get first image for the place
    let imageUrl: string | null = null;
    try {
      const { data: media } = await supabase
        .from('place_media')
        .select('url')
        .eq('place_id', row.place_id)
        .order('order_index')
        .limit(1)
        .maybeSingle();
      imageUrl = media?.url ?? null;
    } catch {
      // Non-critical
    }

    results.push({
      placeId: row.place_id,
      placeName: place.name,
      imageUrl,
      cityName: place.cities?.name ?? null,
    });
  }

  return results;
}

export async function isPlaceSaved(userId: string, placeId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('saved_places')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('place_id', placeId);
  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function toggleSavePlace(
  userId: string,
  placeId: string,
  collectionId?: string,
): Promise<boolean> {
  const alreadySaved = await isPlaceSaved(userId, placeId);
  if (alreadySaved) {
    await supabase
      .from('saved_places')
      .delete()
      .eq('user_id', userId)
      .eq('place_id', placeId);
    return false; // unsaved
  }
  await supabase.from('saved_places').insert({
    user_id: userId,
    place_id: placeId,
    collection_id: collectionId ?? null,
  });
  return true; // saved
}

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export async function getCollections(userId: string): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return rowsToCamel<Collection>(data ?? []);
}

export async function getCollectionById(id: string): Promise<Collection | undefined> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel<Collection>(data) : undefined;
}

export async function getCollectionPlaces(
  collectionId: string,
  userId: string,
): Promise<Place[]> {
  const { data, error } = await supabase
    .from('saved_places')
    .select('place_id, places(*)')
    .eq('user_id', userId)
    .eq('collection_id', collectionId);
  if (error) throw error;
  return (data ?? [])
    .map((row: any) => row.places)
    .filter(Boolean)
    .map((p: any) => toCamel<Place>(p));
}

// ---------------------------------------------------------------------------
// Trips
// ---------------------------------------------------------------------------

export async function getTrips(userId: string): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return rowsToCamel<Trip>(data ?? []);
}

export async function getTripById(id: string): Promise<Trip | undefined> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel<Trip>(data) : undefined;
}

// ---------------------------------------------------------------------------
// City Events
// ---------------------------------------------------------------------------

export function mapCityEvent(row: Record<string, any>): CityEvent {
  return {
    id: row.id,
    cityId: row.city_id,
    name: row.name,
    slug: row.slug,
    eventType: row.event_type,
    description: row.description,
    soloTip: row.solo_tip,
    startMonth: row.start_month,
    endMonth: row.end_month,
    specificDates: row.specific_dates,
    recurrence: row.recurrence,
    year: row.year,
    heroImageUrl: row.hero_image_url,
    websiteUrl: row.website_url,
    isFree: row.is_free,
    crowdLevel: row.crowd_level,
    isActive: row.is_active,
    orderIndex: row.order_index,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Get events for a city, optionally filtered by month.
 * Handles events spanning multiple months (e.g., start_month=11, end_month=2 wraps around year).
 * Filters out expired one_time events (year < current year).
 */
export async function getEventsByCity(
  cityId: string,
  month?: number,
): Promise<CityEvent[]> {
  const { data, error } = await supabase
    .from('city_events')
    .select('*')
    .eq('city_id', cityId)
    .eq('is_active', true)
    .order('order_index');

  if (error) throw error;

  let events = (data ?? []).map(mapCityEvent);

  // Filter out expired one-time events
  const currentYear = new Date().getFullYear();
  events = events.filter(
    (e) => e.recurrence === 'annual' || (e.year != null && e.year >= currentYear),
  );

  // Filter by month if provided
  if (month != null) {
    events = events.filter((e) => {
      if (e.startMonth <= e.endMonth) {
        // Normal range: e.g., March(3) to May(5)
        return month >= e.startMonth && month <= e.endMonth;
      }
      // Wrapping range: e.g., November(11) to February(2)
      return month >= e.startMonth || month <= e.endMonth;
    });
  }

  return events;
}

/**
 * Get a single event by slug, including city and country info.
 */
export async function getEventBySlug(
  slug: string,
): Promise<CityEventWithLocation | null> {
  const { data, error } = await supabase
    .from('city_events')
    .select('*, cities!inner(name, slug, country_id, countries!inner(name, slug))')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw error;
  }
  if (!data) return null;

  const city = (data as any).cities;
  const country = city?.countries;
  const base = mapCityEvent(data);

  return {
    ...base,
    cityName: city?.name ?? '',
    citySlug: city?.slug ?? '',
    countryName: country?.name ?? '',
    countrySlug: country?.slug ?? '',
    countryId: city?.country_id ?? '',
  };
}

/**
 * Get more events in the same city (excludes one event by ID).
 */
export async function getMoreEventsInCity(
  cityId: string,
  excludeEventId: string,
  limit = 4,
): Promise<CityEvent[]> {
  const { data, error } = await supabase
    .from('city_events')
    .select('*')
    .eq('city_id', cityId)
    .eq('is_active', true)
    .neq('id', excludeEventId)
    .order('order_index')
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapCityEvent);
}

/**
 * Get the user's next upcoming trip to a specific city.
 * Used for smart month default on the events section.
 */
export async function getUpcomingTripForCity(
  userId: string,
  cityId: string,
): Promise<Trip | null> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .eq('destination_city_id', cityId)
    .gte('arriving', today)
    .order('arriving', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel<Trip>(data) : null;
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export async function getConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('last_message_at', { ascending: false });
  if (error) throw error;

  // Per-user unread counts from read-state table (RLS filters to current user)
  const { data: readStates } = await supabase
    .from('conversation_read_state')
    .select('conversation_id, unread_count');

  const unreadMap = new Map(
    (readStates ?? []).map((rs: any) => [rs.conversation_id, rs.unread_count])
  );

  return (data ?? []).map((row: any) => ({
    ...toCamel<Conversation>(row),
    unreadCount: unreadMap.get(row.id) ?? 0,
  }));
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('sent_at');
  if (error) throw error;
  return rowsToCamel<Message>(data ?? []);
}

/**
 * Find an existing conversation between two users, or create one.
 * Returns the conversation ID.
 */
export async function getOrCreateConversation(
  userId: string,
  otherId: string,
): Promise<string> {
  // Look for an existing conversation containing both participants
  const { data: existing, error: fetchError } = await supabase
    .from('conversations')
    .select('id, participant_ids')
    .contains('participant_ids', [userId, otherId]);
  if (fetchError) throw fetchError;

  // Filter to conversations with exactly these two participants
  const match = (existing ?? []).find(
    (c: any) =>
      c.participant_ids.length === 2 &&
      c.participant_ids.includes(userId) &&
      c.participant_ids.includes(otherId),
  );
  if (match) return match.id;

  // Create a new conversation
  const { data: created, error: insertError } = await supabase
    .from('conversations')
    .insert({
      participant_ids: [userId, otherId],
      last_message: null,
      last_message_at: new Date().toISOString(),
    })
    .select('id')
    .single();
  if (insertError) throw insertError;
  return created.id;
}

/**
 * Send a message in a conversation.
 * Also updates the conversation's last_message and last_message_at.
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string,
): Promise<Message> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      text,
      sent_at: now,
    })
    .select('*')
    .single();
  if (error) throw error;

  // Update conversation metadata (best-effort)
  await supabase
    .from('conversations')
    .update({ last_message: text, last_message_at: now })
    .eq('id', conversationId);

  return toCamel<Message>(data);
}

/** Soft-delete own message. Shows "[Message deleted]" placeholder. */
export async function deleteOwnMessage(messageId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ is_deleted: true })
    .eq('id', messageId)
    .eq('sender_id', userId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Block & Report
// ---------------------------------------------------------------------------

export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await supabase
    .from('blocked_users')
    .insert({ blocker_id: blockerId, blocked_id: blockedId });
  if (error && error.code !== '23505') throw error; // ignore duplicate
}

/** Block user + delete conversation + remove connection atomically via DB function */
export async function blockUserFull(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await supabase.rpc('block_user_full', {
    p_blocker_id: blockerId,
    p_blocked_id: blockedId,
  });
  if (error) throw error;
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await supabase
    .from('blocked_users')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);
  if (error) throw error;
}

export async function getBlockedUserIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('blocked_users')
    .select('blocked_id')
    .eq('blocker_id', userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.blocked_id);
}

export async function reportUser(
  reporterId: string,
  reportedId: string,
  reason: string,
  details?: string,
): Promise<void> {
  const { error } = await supabase
    .from('user_reports')
    .insert({
      reporter_id: reporterId,
      reported_id: reportedId,
      reason,
      details: details ?? null,
    });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Affiliate Click Tracking (server-side truth)
// ---------------------------------------------------------------------------

export type AffiliateLinkType = 'booking' | 'maps' | 'website' | 'outbound';

export interface TrackClickInput {
  url: string;
  partner: string;
  linkType: AffiliateLinkType;
  placeId?: string;
  cityId?: string;
  countryId?: string;
}

/**
 * Log an outbound/affiliate click to Supabase.
 * This is the server-side source of truth for monetization tracking.
 * Fire-and-forget: errors are swallowed to avoid blocking the user.
 */
export async function trackAffiliateClick(
  userId: string | null,
  input: TrackClickInput,
): Promise<void> {
  try {
    await supabase
      .from('affiliate_clicks')
      .insert({
        user_id: userId,
        url: input.url,
        partner: input.partner,
        link_type: input.linkType,
        place_id: input.placeId ?? null,
        city_id: input.cityId ?? null,
        country_id: input.countryId ?? null,
      });
  } catch {
    // Silent fail — click tracking must never block the user
  }
}

// ---------------------------------------------------------------------------
// Content Reports
// ---------------------------------------------------------------------------

export type ContentTargetType = 'community_post' | 'community_reply' | 'place_review';
export type ContentReportReason = 'spam' | 'harassment' | 'misinformation' | 'inappropriate' | 'safety_concern' | 'other';

export async function reportContent(
  reporterId: string,
  targetType: ContentTargetType,
  targetId: string,
  reason: ContentReportReason,
  details?: string,
): Promise<void> {
  const { error } = await supabase
    .from('content_reports')
    .insert({
      reporter_id: reporterId,
      target_type: targetType,
      target_id: targetId,
      reason,
      details: details ?? null,
    });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface DestinationResult {
  type: 'country' | 'city' | 'area' | 'activity' | 'volunteer';
  id: string;
  name: string;
  slug: string;
  parentName: string | null;
  countryIso2: string | null;
  /** For areas: the parent city's ID so a trip stop can reference the city. */
  cityId?: string;
}

export async function searchDestinations(query: string): Promise<DestinationResult[]> {
  const q = escapeIlike(query.toLowerCase().trim());
  if (!q) return [];

  const results: DestinationResult[] = [];

  const { data: countries } = await supabase
    .from('countries')
    .select('id, name, slug, iso2')
    .eq('is_active', true)
    .ilike('name', `%${q}%`)
    .limit(5);

  for (const c of countries ?? []) {
    results.push({
      type: 'country',
      id: c.id,
      name: c.name,
      slug: c.slug,
      parentName: null,
      countryIso2: c.iso2,
    });
  }

  const { data: cities } = await supabase
    .from('cities')
    .select('id, name, slug, country_id, countries(name, iso2)')
    .eq('is_active', true)
    .ilike('name', `%${q}%`)
    .limit(5);

  for (const c of cities ?? []) {
    results.push({
      type: 'city',
      id: c.id,
      name: c.name,
      slug: c.slug,
      parentName: (c as any).countries?.name ?? null,
      countryIso2: (c as any).countries?.iso2 ?? null,
    });
  }

  const { data: areas } = await supabase
    .from('city_areas')
    .select('id, name, slug, city_id, cities(id, name, slug, countries(iso2))')
    .eq('is_active', true)
    .ilike('name', `%${q}%`)
    .limit(5);

  for (const a of areas ?? []) {
    const city = (a as any).cities;
    results.push({
      type: 'area',
      id: a.id,
      name: a.name,
      slug: city?.slug ?? a.slug,
      parentName: city?.name ?? null,
      countryIso2: city?.countries?.iso2 ?? null,
      cityId: city?.id ?? a.city_id,
    });
  }

  const { data: activities } = await supabase
    .from('places')
    .select('id, name, slug, city_id, cities(name)')
    .eq('is_active', true)
    .in('place_type', ['tour', 'activity', 'landmark'])
    .ilike('name', `%${q}%`)
    .limit(5);

  for (const a of activities ?? []) {
    results.push({
      type: 'activity',
      id: a.id,
      name: a.name,
      slug: a.slug,
      parentName: (a as any).cities?.name ?? null,
      countryIso2: null,
    });
  }

  // Volunteer orgs
  const { data: volunteers } = await supabase
    .from('places')
    .select('id, name, slug, city_id, cities(name)')
    .eq('is_active', true)
    .eq('place_type', 'volunteer')
    .ilike('name', `%${q}%`)
    .limit(5);

  for (const v of volunteers ?? []) {
    results.push({
      type: 'volunteer',
      id: v.id,
      name: v.name,
      slug: v.slug,
      parentName: (v as any).cities?.name ?? null,
      countryIso2: null,
    });
  }

  return results.slice(0, 20);
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export function buildRange(page: number, pageSize: number) {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

const DEFAULT_PAGE_SIZE = 20;

export async function getProfilesPaginated(
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<Profile>> {
  const { from, to } = buildRange(page, pageSize);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .range(from, to + 1);
  if (error) throw error;
  const hasMore = (data?.length ?? 0) > pageSize;
  const rows = (data || []).slice(0, pageSize);
  return { data: rowsToCamel<Profile>(rows), hasMore };
}

export async function getConversationsPaginated(
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<Conversation>> {
  const { from, to } = buildRange(page, pageSize);
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('last_message_at', { ascending: false })
    .range(from, to + 1);
  if (error) throw error;
  const hasMore = (data?.length ?? 0) > pageSize;
  const rows = (data || []).slice(0, pageSize);

  // Per-user unread counts from read-state table (RLS filters to current user)
  const { data: readStates } = await supabase
    .from('conversation_read_state')
    .select('conversation_id, unread_count');

  const unreadMap = new Map(
    (readStates ?? []).map((rs: any) => [rs.conversation_id, rs.unread_count])
  );

  return {
    data: rows.map((row: any) => ({
      ...toCamel<Conversation>(row),
      unreadCount: unreadMap.get(row.id) ?? 0,
    })),
    hasMore,
  };
}

export async function getMessagesPaginated(
  conversationId: string,
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<Message>> {
  const { from, to } = buildRange(page, pageSize);
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('sent_at', { ascending: false })
    .range(from, to + 1);
  if (error) throw error;
  const hasMore = (data?.length ?? 0) > pageSize;
  const rows = (data || []).slice(0, pageSize);
  return { data: rowsToCamel<Message>(rows), hasMore };
}

export async function getPlacesByCityPaginated(
  cityId: string,
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<Place>> {
  const { from, to } = buildRange(page, pageSize);
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('city_id', cityId)
    .range(from, to + 1);
  if (error) throw error;
  const hasMore = (data?.length ?? 0) > pageSize;
  const rows = (data || []).slice(0, pageSize);
  return { data: rowsToCamel<Place>(rows), hasMore };
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export async function searchPlaces(query: string, cityId?: string): Promise<Place[]> {
  const q = escapeIlike(query.toLowerCase().trim());
  if (!q) return [];

  let qb = supabase
    .from('places')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${q}%,description.ilike.%${q}%`);

  if (cityId) {
    qb = qb.eq('city_id', cityId);
  }

  const { data, error } = await qb;
  if (error) throw error;
  return rowsToCamel<Place>(data ?? []);
}

// ---------------------------------------------------------------------------
// Profile Management
// ---------------------------------------------------------------------------

export interface UpdateProfileInput {
  username?: string;
  firstName?: string;
  bio?: string;
  homeCountryIso2?: string;
  homeCountryName?: string;
  homeCityId?: string | null;
  currentCityId?: string | null;
  currentCityName?: string | null;
  interests?: string[];
  travelStyle?: string | null;
  preferredCurrency?: string;
  preferredLanguage?: string;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelationship?: string | null;
}

export async function updateProfile(
  userId: string,
  updates: UpdateProfileInput,
): Promise<Profile> {
  // Convert camelCase to snake_case for Supabase
  const payload: Record<string, any> = {};
  if (updates.username !== undefined) payload.username = updates.username;
  if (updates.firstName !== undefined) payload.first_name = updates.firstName;
  if (updates.bio !== undefined) payload.bio = updates.bio;
  if (updates.homeCountryIso2 !== undefined) payload.home_country_iso2 = updates.homeCountryIso2;
  if (updates.homeCountryName !== undefined) payload.home_country_name = updates.homeCountryName;
  if (updates.homeCityId !== undefined) payload.home_city_id = updates.homeCityId;
  if (updates.currentCityId !== undefined) payload.current_city_id = updates.currentCityId;
  if (updates.currentCityName !== undefined) payload.current_city_name = updates.currentCityName;
  if (updates.interests !== undefined) payload.interests = updates.interests;
  if (updates.travelStyle !== undefined) payload.travel_style = updates.travelStyle;
  if (updates.preferredCurrency !== undefined) payload.preferred_currency = updates.preferredCurrency;
  if (updates.preferredLanguage !== undefined) payload.preferred_language = updates.preferredLanguage;
  if (updates.emergencyContactName !== undefined) payload.emergency_contact_name = updates.emergencyContactName;
  if (updates.emergencyContactPhone !== undefined) payload.emergency_contact_phone = updates.emergencyContactPhone;
  if (updates.emergencyContactRelationship !== undefined) payload.emergency_contact_relationship = updates.emergencyContactRelationship;

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return toCamel<Profile>(data);
}

export async function updateProfileAvatar(
  userId: string,
  avatarUrl: string,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return toCamel<Profile>(data);
}

/**
 * Upload an avatar image to Supabase Storage and update the profile.
 * @param userId - The user's ID (used as folder name)
 * @param fileUri - Local file URI (from image picker)
 * @param fileName - Original file name with extension
 * @returns The new avatar URL
 */
export async function uploadAvatar(
  userId: string,
  fileUri: string,
  fileName: string,
): Promise<string> {
  // Fetch the file as a blob
  const response = await fetch(fileUri);
  const blob = await response.blob();

  // Determine content type from extension
  const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
  const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

  // Upload to avatars bucket under user's folder
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, blob, {
      contentType,
      upsert: true,
    });
  if (uploadError) throw uploadError;

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(path);

  const avatarUrl = urlData.publicUrl;

  // Update the profile with the new URL
  await updateProfileAvatar(userId, avatarUrl);

  return avatarUrl;
}

export async function setUserOnlineStatus(
  userId: string,
  isOnline: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_online: isOnline })
    .eq('id', userId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Username
// ---------------------------------------------------------------------------

const RESERVED_USERNAMES = [
  'admin', 'support', 'sola', 'moderator', 'mod', 'help',
  'official', 'staff', 'system', 'null', 'undefined',
  'deleted', 'anonymous', 'test', 'root', 'superuser',
];

const USERNAME_REGEX = /^[a-z0-9_]{3,30}$/;

export interface UsernameValidation {
  valid: boolean;
  available: boolean;
  error?: string;
}

export function validateUsernameFormat(username: string): { valid: boolean; error?: string } {
  const normalized = username.toLowerCase();
  if (normalized.length < 3) return { valid: false, error: 'Must be at least 3 characters' };
  if (normalized.length > 30) return { valid: false, error: 'Must be 30 characters or less' };
  if (!USERNAME_REGEX.test(normalized)) return { valid: false, error: 'Only lowercase letters, numbers, and underscores' };
  if (RESERVED_USERNAMES.includes(normalized)) return { valid: false, error: 'This username is not available' };
  return { valid: true };
}

export async function checkUsernameAvailability(
  username: string,
  currentUserId?: string,
): Promise<UsernameValidation> {
  const formatCheck = validateUsernameFormat(username);
  if (!formatCheck.valid) return { valid: false, available: false, error: formatCheck.error };

  const normalized = username.toLowerCase();
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', normalized)
    .maybeSingle();

  if (error) throw error;
  const available = !data || data.id === currentUserId;
  return { valid: true, available, error: available ? undefined : 'Username is already taken' };
}

// ---------------------------------------------------------------------------
// Search Travelers by Username
// ---------------------------------------------------------------------------

export interface TravelerSearchResult {
  id: string;
  username: string;
  firstName: string;
  avatarUrl: string | null;
  homeCountryName: string | null;
  homeCountryIso2: string | null;
  verificationStatus: string;
}

export async function searchTravelersByUsername(
  query: string,
  currentUserId: string,
): Promise<TravelerSearchResult[]> {
  const normalized = query.toLowerCase().trim().replace(/^@/, '');
  if (normalized.length < 1) return [];

  const blockedIds = await getBlockedUserIds(currentUserId);

  let dbQuery = supabase
    .from('profiles')
    .select('id, username, first_name, avatar_url, home_country_name, home_country_iso2, verification_status')
    .neq('id', currentUserId)
    .not('username', 'is', null)
    .eq('username', normalized)
    .eq('is_discoverable', true)
    .limit(1);

  if (blockedIds.length > 0) {
    dbQuery = dbQuery.not('id', 'in', `(${blockedIds.join(',')})`);
  }

  const { data, error } = await dbQuery;
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    username: row.username,
    firstName: row.first_name,
    avatarUrl: row.avatar_url,
    homeCountryName: row.home_country_name,
    homeCountryIso2: row.home_country_iso2,
    verificationStatus: row.verification_status ?? 'unverified',
  }));
}

// ---------------------------------------------------------------------------
// User Visited Countries
// ---------------------------------------------------------------------------

export interface UserVisitedCountry {
  countryId: string;
  countryIso2: string;
  countryName: string;
  createdAt: string;
}

export async function getUserVisitedCountries(userId: string): Promise<UserVisitedCountry[]> {
  const { data, error } = await supabase
    .from('user_visited_countries')
    .select('country_id, created_at, countries(iso2, name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    countryId: row.country_id,
    countryIso2: row.countries?.iso2 ?? '',
    countryName: row.countries?.name ?? '',
    createdAt: row.created_at,
  }));
}

export async function setVisitedCountries(
  userId: string,
  countryIds: string[],
): Promise<void> {
  const { error: deleteError } = await supabase
    .from('user_visited_countries')
    .delete()
    .eq('user_id', userId);
  if (deleteError) throw deleteError;

  if (countryIds.length === 0) return;

  const rows = countryIds.map((cid) => ({ user_id: userId, country_id: cid }));
  const { error: insertError } = await supabase
    .from('user_visited_countries')
    .insert(rows);
  if (insertError) throw insertError;
}

export async function getCountriesList(): Promise<{ id: string; iso2: string; name: string }[]> {
  const { data, error } = await supabase
    .from('countries')
    .select('id, iso2, name')
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Profile Tags (Interests)
// ---------------------------------------------------------------------------

/** Fetch all profile tags for a user */
export async function getProfileTags(userId: string): Promise<ProfileTag[]> {
  const { data, error } = await supabase
    .from('profile_tags')
    .select('profile_id, tag_slug, tag_label, tag_group, created_at')
    .eq('profile_id', userId)
    .order('tag_group')
    .order('created_at');

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    profileId: row.profile_id,
    tagSlug: row.tag_slug,
    tagLabel: row.tag_label,
    tagGroup: row.tag_group,
    createdAt: row.created_at,
  }));
}

/** Replace all profile tags for the current user */
export async function setProfileTags(
  userId: string,
  tags: { tagSlug: string; tagLabel: string; tagGroup: string }[],
): Promise<void> {
  // Delete existing tags
  const { error: deleteError } = await supabase
    .from('profile_tags')
    .delete()
    .eq('profile_id', userId);

  if (deleteError) throw deleteError;

  if (tags.length === 0) return;

  // Insert new tags
  const rows = tags.map((t) => ({
    profile_id: userId,
    tag_slug: t.tagSlug,
    tag_label: t.tagLabel,
    tag_group: t.tagGroup,
  }));

  const { error: insertError } = await supabase
    .from('profile_tags')
    .insert(rows);

  if (insertError) throw insertError;
}

// ---------------------------------------------------------------------------
// Trip CRUD
// ---------------------------------------------------------------------------

export interface CreateTripInput {
  destinationCityId: string;
  destinationName: string;
  countryIso2: string;
  arriving: string; // ISO date string
  leaving: string; // ISO date string
  notes?: string;
}

export async function createTrip(
  userId: string,
  input: CreateTripInput,
): Promise<Trip> {
  const arriving = new Date(input.arriving);
  const leaving = new Date(input.leaving);
  const nights = Math.max(0, Math.ceil((leaving.getTime() - arriving.getTime()) / (1000 * 60 * 60 * 24)));

  const { data, error } = await supabase
    .from('trips')
    .insert({
      user_id: userId,
      destination_city_id: input.destinationCityId,
      destination_name: input.destinationName,
      country_iso2: input.countryIso2,
      arriving: input.arriving,
      leaving: input.leaving,
      nights,
      status: 'planned',
      notes: input.notes ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return toCamel<Trip>(data);
}

export interface UpdateTripInput {
  destinationCityId?: string;
  destinationName?: string;
  countryIso2?: string;
  arriving?: string;
  leaving?: string;
  status?: 'planned' | 'active' | 'completed';
  notes?: string | null;
}

export async function updateTrip(
  tripId: string,
  updates: UpdateTripInput,
): Promise<Trip> {
  const payload: Record<string, any> = {};
  if (updates.destinationCityId !== undefined) payload.destination_city_id = updates.destinationCityId;
  if (updates.destinationName !== undefined) payload.destination_name = updates.destinationName;
  if (updates.countryIso2 !== undefined) payload.country_iso2 = updates.countryIso2;
  if (updates.arriving !== undefined) payload.arriving = updates.arriving;
  if (updates.leaving !== undefined) payload.leaving = updates.leaving;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.notes !== undefined) payload.notes = updates.notes;

  // Recalculate nights if dates changed
  if (updates.arriving || updates.leaving) {
    const { data: current } = await supabase
      .from('trips')
      .select('arriving, leaving')
      .eq('id', tripId)
      .single();

    const arriving = new Date(updates.arriving ?? current?.arriving);
    const leaving = new Date(updates.leaving ?? current?.leaving);
    payload.nights = Math.max(0, Math.ceil((leaving.getTime() - arriving.getTime()) / (1000 * 60 * 60 * 24)));
  }

  const { data, error } = await supabase
    .from('trips')
    .update(payload)
    .eq('id', tripId)
    .select('*')
    .single();
  if (error) throw error;
  return toCamel<Trip>(data);
}

export async function deleteTrip(tripId: string): Promise<void> {
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId);
  if (error) throw error;
}

/**
 * Count how many trips have this city as a destination.
 * Used on city detail page for credibility sourcing.
 */
export async function getCityTripCount(cityId: string): Promise<number> {
  const { count, error } = await supabase
    .from('trips')
    .select('id', { count: 'exact', head: true })
    .eq('destination_city_id', cityId);
  if (error) throw error;
  return count ?? 0;
}

// ---------------------------------------------------------------------------
// Trip Places
// ---------------------------------------------------------------------------

export async function getTripPlaces(tripId: string): Promise<(TripPlace & { place: Place })[]> {
  const { data, error } = await supabase
    .from('trip_places')
    .select('*, places(*)')
    .eq('trip_id', tripId)
    .order('day_number', { nullsFirst: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    tripId: row.trip_id,
    placeId: row.place_id,
    dayNumber: row.day_number,
    notes: row.notes,
    place: toCamel<Place>(row.places),
  }));
}

export async function addTripPlace(
  tripId: string,
  placeId: string,
  dayNumber?: number,
  notes?: string,
): Promise<void> {
  const { error } = await supabase
    .from('trip_places')
    .insert({
      trip_id: tripId,
      place_id: placeId,
      day_number: dayNumber ?? null,
      notes: notes ?? null,
    });
  if (error && error.code !== '23505') throw error; // ignore duplicate
}

export async function updateTripPlace(
  tripId: string,
  placeId: string,
  updates: { dayNumber?: number | null; notes?: string | null },
): Promise<void> {
  const payload: Record<string, any> = {};
  if (updates.dayNumber !== undefined) payload.day_number = updates.dayNumber;
  if (updates.notes !== undefined) payload.notes = updates.notes;

  const { error } = await supabase
    .from('trip_places')
    .update(payload)
    .eq('trip_id', tripId)
    .eq('place_id', placeId);
  if (error) throw error;
}

export async function removeTripPlace(tripId: string, placeId: string): Promise<void> {
  const { error } = await supabase
    .from('trip_places')
    .delete()
    .eq('trip_id', tripId)
    .eq('place_id', placeId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Collection CRUD
// ---------------------------------------------------------------------------

export interface CreateCollectionInput {
  name: string;
  emoji?: string;
  isPublic?: boolean;
}

export async function createCollection(
  userId: string,
  input: CreateCollectionInput,
): Promise<Collection> {
  const { data, error } = await supabase
    .from('collections')
    .insert({
      user_id: userId,
      name: input.name,
      emoji: input.emoji ?? '📌',
      is_public: input.isPublic ?? false,
    })
    .select('*')
    .single();
  if (error) throw error;
  return toCamel<Collection>(data);
}

export interface UpdateCollectionInput {
  name?: string;
  emoji?: string;
  isPublic?: boolean;
}

export async function updateCollection(
  collectionId: string,
  updates: UpdateCollectionInput,
): Promise<Collection> {
  const payload: Record<string, any> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.emoji !== undefined) payload.emoji = updates.emoji;
  if (updates.isPublic !== undefined) payload.is_public = updates.isPublic;

  const { data, error } = await supabase
    .from('collections')
    .update(payload)
    .eq('id', collectionId)
    .select('*')
    .single();
  if (error) throw error;
  return toCamel<Collection>(data);
}

export async function deleteCollection(collectionId: string): Promise<void> {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', collectionId);
  if (error) throw error;
}

export async function moveToCollection(
  userId: string,
  placeId: string,
  collectionId: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('saved_places')
    .update({ collection_id: collectionId })
    .eq('user_id', userId)
    .eq('place_id', placeId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Push Tokens
// ---------------------------------------------------------------------------

export async function registerPushToken(
  userId: string,
  token: string,
): Promise<void> {
  const { error } = await supabase
    .from('push_tokens')
    .upsert(
      { user_id: userId, token },
      { onConflict: 'user_id,token' }
    );
  if (error) throw error;
}

export async function removePushToken(
  userId: string,
  token: string,
): Promise<void> {
  const { error } = await supabase
    .from('push_tokens')
    .delete()
    .eq('user_id', userId)
    .eq('token', token);
  if (error) throw error;
}

export async function removeAllPushTokens(userId: string): Promise<void> {
  const { error } = await supabase
    .from('push_tokens')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Message Read Receipts
// ---------------------------------------------------------------------------

export async function markMessagesAsRead(
  conversationId: string,
  userId: string,
): Promise<void> {
  const now = new Date().toISOString();

  // Mark all unread messages from other users as read
  const { error } = await supabase
    .from('messages')
    .update({ read_at: now })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .is('read_at', null);
  if (error) throw error;

  // Reset per-user unread count in read-state table
  await supabase
    .from('conversation_read_state')
    .update({ unread_count: 0, last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);
}

// ---------------------------------------------------------------------------
// Place Signals (likes, visits, ratings)
// ---------------------------------------------------------------------------

export async function getPlaceSignals(userId: string): Promise<PlaceSignal[]> {
  const { data, error } = await supabase
    .from('place_signals')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return rowsToCamel<PlaceSignal>(data ?? []);
}

export async function getPlaceSignal(
  userId: string,
  placeId: string,
): Promise<PlaceSignal | undefined> {
  const { data, error } = await supabase
    .from('place_signals')
    .select('*')
    .eq('user_id', userId)
    .eq('place_id', placeId)
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel<PlaceSignal>(data) : undefined;
}

export async function setPlaceSignal(
  userId: string,
  placeId: string,
  signalType: PlaceSignal['signalType'],
  rating?: number,
  note?: string,
): Promise<PlaceSignal> {
  // Check if signal already exists
  const existing = await getPlaceSignal(userId, placeId);

  if (existing) {
    // Update existing signal
    const { data, error } = await supabase
      .from('place_signals')
      .update({
        signal_type: signalType,
        rating: rating ?? null,
        note: note ?? null,
      })
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error) throw error;
    return toCamel<PlaceSignal>(data);
  } else {
    // Insert new signal
    const { data, error } = await supabase
      .from('place_signals')
      .insert({
        user_id: userId,
        place_id: placeId,
        signal_type: signalType,
        rating: rating ?? null,
        note: note ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return toCamel<PlaceSignal>(data);
  }
}

export async function removePlaceSignal(
  userId: string,
  placeId: string,
): Promise<void> {
  const { error } = await supabase
    .from('place_signals')
    .delete()
    .eq('user_id', userId)
    .eq('place_id', placeId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Place Verification (Sola Baseline System)
// ---------------------------------------------------------------------------

/**
 * Get verification signals for a place.
 * These are extracted signals from AI verification (e.g., has_24h_checkin, female_dorm_available).
 */
export async function getPlaceVerificationSignals(
  placeId: string,
): Promise<PlaceVerificationSignal[]> {
  const { data, error } = await supabase
    .from('place_signals')
    .select('*')
    .eq('place_id', placeId)
    .order('signal_key');
  if (error) throw error;
  return rowsToCamel<PlaceVerificationSignal>(data ?? []);
}

/**
 * Get Sola notes for a place.
 * These are contextual notes surfaced in the UI (e.g., "Female-only dorm available").
 */
export async function getPlaceSolaNotes(placeId: string): Promise<PlaceSolaNote[]> {
  const { data, error } = await supabase
    .from('place_sola_notes')
    .select('*')
    .eq('place_id', placeId)
    .order('order_index');
  if (error) throw error;
  return rowsToCamel<PlaceSolaNote>(data ?? []);
}

/**
 * Get all verified places in a city (baseline_passed or sola_checked).
 * Sola-checked places appear first.
 */
export async function getVerifiedPlacesByCity(cityId: string): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('city_id', cityId)
    .eq('is_active', true)
    .in('verification_status', ['baseline_passed', 'sola_checked'])
    .order('verification_status', { ascending: false })
    .order('name');
  if (error) throw error;
  return rowsToCamel<Place>(data ?? []);
}

/**
 * Get verified accommodations (hotels, hostels, homestays) in a city.
 * Only places that have passed the Sola baseline are returned.
 */
export async function getVerifiedAccommodationsByCity(cityId: string): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('city_id', cityId)
    .eq('is_active', true)
    .in('place_type', ['hotel', 'hostel', 'homestay'])
    .in('verification_status', ['baseline_passed', 'sola_checked'])
    .order('verification_status', { ascending: false })
    .order('name');
  if (error) throw error;
  return rowsToCamel<Place>(data ?? []);
}

/**
 * Get verified accommodations in a specific area.
 */
export async function getVerifiedAccommodationsByArea(areaId: string): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('city_area_id', areaId)
    .eq('is_active', true)
    .in('place_type', ['hotel', 'hostel', 'homestay'])
    .in('verification_status', ['baseline_passed', 'sola_checked'])
    .order('verification_status', { ascending: false })
    .order('name');
  if (error) throw error;
  return rowsToCamel<Place>(data ?? []);
}

/**
 * Check if a place is verified (baseline_passed or sola_checked).
 */
export function isPlaceVerified(place: Place): boolean {
  return place.verificationStatus === 'baseline_passed' ||
    place.verificationStatus === 'sola_checked';
}

/**
 * Check if a place has been physically checked by Sola team.
 */
export function isSolaChecked(place: Place): boolean {
  return place.verificationStatus === 'sola_checked';
}

// ---------------------------------------------------------------------------
// Account Deletion
// ---------------------------------------------------------------------------

/**
 * Delete all user data and anonymize the account.
 * This is required for App Store compliance.
 *
 * Deletes (in order to respect foreign keys):
 * - Push tokens
 * - Messages sent by user
 * - Conversations where user is participant
 * - Trip places (via trips)
 * - Trips
 * - Saved places
 * - Collections
 * - Place signals
 * - Blocked users (both directions)
 * - User reports (as reporter)
 * - Onboarding sessions
 * - Profile (anonymized, not deleted to preserve referential integrity)
 *
 * Note: The auth.users record remains but profile is anonymized.
 * For complete deletion, use a server-side edge function with service role.
 */
export async function deleteAccount(userId: string): Promise<void> {
  // 1. Delete push tokens
  await supabase.from('push_tokens').delete().eq('user_id', userId);

  // 2. Delete messages sent by user
  await supabase.from('messages').delete().eq('sender_id', userId);

  // 3. Delete conversations where user is participant
  // (messages from others in these convos will be orphaned but that's OK)
  await supabase.from('conversations').delete().contains('participant_ids', [userId]);

  // 4. Delete trip places for user's trips
  const { data: trips } = await supabase
    .from('trips')
    .select('id')
    .eq('user_id', userId);
  if (trips && trips.length > 0) {
    const tripIds = trips.map((t) => t.id);
    await supabase.from('trip_places').delete().in('trip_id', tripIds);
  }

  // 5. Delete trips
  await supabase.from('trips').delete().eq('user_id', userId);

  // 6. Delete saved places
  await supabase.from('saved_places').delete().eq('user_id', userId);

  // 7. Delete collections
  await supabase.from('collections').delete().eq('user_id', userId);

  // 8. Delete place signals
  await supabase.from('place_signals').delete().eq('user_id', userId);

  // 9. Delete blocked users (both as blocker and blocked)
  await supabase.from('blocked_users').delete().eq('blocker_id', userId);
  await supabase.from('blocked_users').delete().eq('blocked_id', userId);

  // 10. Delete user reports (as reporter only - reports against user preserved for safety)
  await supabase.from('user_reports').delete().eq('reporter_id', userId);

  // 11. Delete onboarding sessions
  await supabase.from('onboarding_sessions').delete().eq('user_id', userId);

  // 12. Anonymize profile (preserve row for referential integrity in other users' data)
  // Username set to deleted_xxx indicates account was deleted
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      username: `deleted_${userId.slice(0, 8)}`,
      first_name: 'Deleted User',
      bio: 'This account has been deleted.',
      avatar_url: null,
      home_country_iso2: null,
      home_country_name: null,
      home_city_id: null,
      current_city_id: null,
      current_city_name: null,
      interests: null,
      travel_style: null,
      is_online: false,
      onboarding_completed_at: null,
    })
    .eq('id', userId);

  if (profileError) throw profileError;

  // 13. Delete avatar files from storage
  try {
    const { data: files } = await supabase.storage
      .from('avatars')
      .list(userId);
    if (files && files.length > 0) {
      const filePaths = files.map((f) => `${userId}/${f.name}`);
      await supabase.storage.from('avatars').remove(filePaths);
    }
  } catch {
    // Storage deletion is best-effort
  }

  // 14. Delete the auth user via RPC (SECURITY DEFINER function — auth.uid() = self only)
  const { error: rpcError } = await supabase.rpc('delete_own_auth_user');
  if (rpcError) {
    console.warn('[Sola] delete_own_auth_user RPC failed:', rpcError.message);
    // Don't throw — profile is already anonymized with onboarding_completed_at cleared,
    // so even if auth deletion fails, re-login will go through onboarding to reset profile.
  }
}

// ---------------------------------------------------------------------------
// Onboarding A/B Testing
// ---------------------------------------------------------------------------

// Re-export from onboardingConfig for API consistency
export {
  fetchOnboardingConfig,
  calculateOnboardingFlow,
  createOnboardingSession,
  updateOnboardingSession,
  completeOnboardingSession,
  type OnboardingQuestionConfig,
  type OnboardingFlowResult,
  type OnboardingSession,
} from '@/lib/onboardingConfig';

// ---------------------------------------------------------------------------
// Explore Collections (Editorial)
// ---------------------------------------------------------------------------

export {
  getExploreCollections,
  getExploreCollectionBySlug,
  getExploreCollectionItems,
  getExploreCollectionWithItems,
  getFeaturedExploreCollections,
} from './collections';

// ---------------------------------------------------------------------------
// Connection Requests
// ---------------------------------------------------------------------------

function mapConnectionRequest(row: any): ConnectionRequest {
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    status: row.status,
    context: row.context,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
  };
}

export async function sendConnectionRequest(
  senderId: string,
  receiverId: string,
  context?: string,
  message?: string,
): Promise<ConnectionRequest> {
  const { data, error } = await supabase
    .from('connection_requests')
    .insert({ sender_id: senderId, receiver_id: receiverId, context, message: message ?? null })
    .select()
    .single();
  if (error) throw error;
  return mapConnectionRequest(data);
}

export async function respondToConnectionRequest(
  requestId: string,
  status: 'accepted' | 'declined',
): Promise<void> {
  const { error } = await supabase
    .from('connection_requests')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', requestId);
  if (error) throw error;
}

export async function withdrawConnectionRequest(requestId: string): Promise<void> {
  const { error } = await supabase
    .from('connection_requests')
    .delete()
    .eq('id', requestId);
  if (error) throw error;
}

/** Silently remove an accepted connection. No notification to other user. */
export async function removeConnection(userId: string, otherId: string): Promise<void> {
  const { error } = await supabase.rpc('remove_connection', {
    p_user_id: userId,
    p_other_id: otherId,
  });
  if (error) throw error;
}

export async function getConnectionRequests(
  userId: string,
  direction: 'received' | 'sent',
): Promise<ConnectionRequest[]> {
  const column = direction === 'received' ? 'receiver_id' : 'sender_id';
  const { data, error } = await supabase
    .from('connection_requests')
    .select('*')
    .eq(column, userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapConnectionRequest);
}

export async function getConnectedUserIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('connection_requests')
    .select('sender_id, receiver_id')
    .eq('status', 'accepted')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
  if (error) throw error;
  return (data ?? []).map((r) =>
    r.sender_id === userId ? r.receiver_id : r.sender_id,
  );
}

export async function getConnectionStatus(
  userId: string,
  otherUserId: string,
): Promise<ConnectionStatus> {
  const { data, error } = await supabase
    .from('connection_requests')
    .select('*')
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`,
    )
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return 'none';
  if (data.status === 'accepted') return 'connected';
  if (data.status === 'pending' && data.sender_id === userId) return 'pending_sent';
  if (data.status === 'pending' && data.receiver_id === userId) return 'pending_received';
  return 'none';
}

// ---------------------------------------------------------------------------
// Traveler Discovery
// ---------------------------------------------------------------------------

export async function getNearbyTravelers(
  userId: string,
  cityName: string,
  blockedIds: string[],
  limit: number = 10,
): Promise<Profile[]> {
  const excluded = [userId].concat(Array.isArray(blockedIds) ? blockedIds : []).filter(Boolean);
  if (excluded.length === 0) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('location_city_name', cityName)
    .eq('location_sharing_enabled', true)
    .eq('is_discoverable', true)
    .not('id', 'in', `(${excluded})`)
    .limit(limit);
  if (error) throw error;
  return rowsToCamel<Profile>(data ?? []);
}

/**
 * Count discoverable travelers currently in a city.
 * Used on city detail page for traveler presence signal.
 */
export async function getCityTravelerCount(
  cityName: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('location_city_name', cityName)
    .eq('location_sharing_enabled', true)
    .eq('is_discoverable', true);
  if (error) throw error;
  return count ?? 0;
}

export async function getTravelersInCountry(
  userId: string,
  countryName: string,
  blockedIds: string[],
  limit: number = 10,
): Promise<Profile[]> {
  const excluded = [userId].concat(Array.isArray(blockedIds) ? blockedIds : []).filter(Boolean);
  if (excluded.length === 0) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('location_country_name', countryName)
    .eq('location_sharing_enabled', true)
    .eq('is_discoverable', true)
    .not('id', 'in', `(${excluded})`)
    .limit(limit);
  if (error) throw error;
  return rowsToCamel<Profile>(data ?? []);
}

export async function getTravelersWithSharedInterests(
  userId: string,
  userInterests: string[],
  blockedIds: string[],
  limit: number = 10,
): Promise<Profile[]> {
  const excluded = [userId].concat(Array.isArray(blockedIds) ? blockedIds : []).filter(Boolean);
  if (excluded.length === 0) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_discoverable', true)
    .overlaps('interests', userInterests)
    .not('id', 'in', `(${excluded})`)
    .limit(limit);
  if (error) throw error;
  return rowsToCamel<Profile>(data ?? []);
}

export async function getSuggestedTravelers(
  userId: string,
  excludeIds: string[],
  blockedIds: string[],
  limit: number = 6,
): Promise<Profile[]> {
  const allExcluded = [userId]
    .concat(Array.isArray(excludeIds) ? excludeIds : [])
    .concat(Array.isArray(blockedIds) ? blockedIds : [])
    .filter((v, i, arr) => Boolean(v) && arr.indexOf(v) === i);
  if (allExcluded.length === 0) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_discoverable', true)
    .not('id', 'in', `(${allExcluded})`)
    .not('interests', 'eq', '{}')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return rowsToCamel<Profile>(data ?? []);
}

// ---------------------------------------------------------------------------
// Trip-Aware Matching (Connect Policy)
// ---------------------------------------------------------------------------

/** Check if user has qualifying trips for Connect discovery */
export async function getQualifyingTrips(userId: string): Promise<{
  trips: Array<{ id: string; status: string; title: string | null; destinationName: string | null }>;
  isDiscoverable: boolean;
}> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_discoverable')
    .eq('id', userId)
    .single();

  if (!profile?.is_discoverable) {
    return { trips: [], isDiscoverable: false };
  }

  const { data: trips } = await supabase
    .from('trips')
    .select('id, status, matching_opt_in, title, destination_name')
    .eq('user_id', userId)
    .eq('matching_opt_in', true)
    .in('status', ['active', 'planned'])
    .order('arriving', { ascending: true });

  return {
    trips: (trips ?? []).map((t: any) => ({
      id: t.id,
      status: t.status,
      title: t.title,
      destinationName: t.destination_name,
    })),
    isDiscoverable: true,
  };
}

/** Tier 1: Travelers heading to the same CITY with overlapping dates */
export async function getTripCityMatches(
  userId: string,
  blockedIds: string[],
): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('trip_overlap_matches')
    .select('*')
    .eq('my_user_id', userId)
    .not('overlap_city', 'is', null);

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const excluded = new Set([userId, ...blockedIds]);
  const uniqueUserIds = Array.from(
    new Set(
      (data as any[])
        .filter((m) => !excluded.has(m.their_user_id))
        .map((m) => m.their_user_id)
    )
  );
  if (uniqueUserIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', uniqueUserIds)
    .eq('is_discoverable', true);

  return rowsToCamel<Profile>(profiles ?? []);
}

/** Tier 2: Travelers in the same COUNTRY with overlapping dates (excludes city-matched) */
export async function getTripCountryMatches(
  userId: string,
  cityMatchUserIds: string[],
  blockedIds: string[],
): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('trip_overlap_matches')
    .select('*')
    .eq('my_user_id', userId);

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const excluded = new Set([userId, ...blockedIds, ...cityMatchUserIds]);
  const uniqueUserIds = Array.from(
    new Set(
      (data as any[])
        .filter((m) => !excluded.has(m.their_user_id))
        .map((m) => m.their_user_id)
    )
  );
  if (uniqueUserIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', uniqueUserIds)
    .eq('is_discoverable', true);

  return rowsToCamel<Profile>(profiles ?? []);
}

export async function updateUserLocation(
  userId: string,
  location: {
    lat?: number;
    lng?: number;
    cityName?: string;
    countryName?: string;
    sharingEnabled: boolean;
  },
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      location_lat: location.lat ?? null,
      location_lng: location.lng ?? null,
      location_city_name: location.cityName ?? null,
      location_country_name: location.countryName ?? null,
      location_sharing_enabled: location.sharingEnabled,
      location_updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
  if (error) throw error;
}

/**
 * Only create/open a conversation between connected users.
 * Throws if users are not mutually connected.
 */
export async function getOrCreateConversationGuarded(
  userId: string,
  otherUserId: string,
): Promise<string> {
  const status = await getConnectionStatus(userId, otherUserId);
  if (status !== 'connected') {
    throw new Error('You must be connected to message this traveler.');
  }
  return getOrCreateConversation(userId, otherUserId);
}

// ---------------------------------------------------------------------------
// User Verification (Selfie)
// ---------------------------------------------------------------------------

export async function submitVerificationSelfie(
  userId: string,
  selfieUri: string,
): Promise<void> {
  const ext = selfieUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const filePath = `${userId}/selfie.${ext}`;

  // Fetch the selfie image as a blob — on React Native this can fail if the
  // URI is stale, the file was cleaned up, or permissions changed.
  let blob: Blob;
  try {
    const response = await fetch(selfieUri);
    if (!response.ok) {
      throw new Error(`Failed to read selfie image (HTTP ${response.status})`);
    }
    blob = await response.blob();
  } catch (err) {
    throw new Error(
      `Could not load your selfie photo. Please try taking a new one. (${err instanceof Error ? err.message : String(err)})`,
    );
  }

  const { error: uploadError } = await supabase.storage
    .from('verification-selfies')
    .upload(filePath, blob, {
      contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(
      `Selfie upload failed. Please check your connection and try again. (${uploadError.message})`,
    );
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      verification_status: 'pending',
      verification_selfie_url: filePath,
      verification_submitted_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (updateError) throw updateError;

  // Notify the team — fire-and-forget so a notification failure never
  // blocks the user after a successful submission.
  try {
    await supabase.functions.invoke('notify-verification', {
      body: { userId },
    });
  } catch {
    // Silently ignore — the selfie was already submitted successfully.
  }
}

export async function getVerificationStatus(
  userId: string,
): Promise<'unverified' | 'pending' | 'verified' | 'rejected'> {
  const { data, error } = await supabase
    .from('profiles')
    .select('verification_status')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data.verification_status;
}

// ---------------------------------------------------------------------------
// Admin Verification Review
// ---------------------------------------------------------------------------

export async function getPendingVerifications(): Promise<PendingVerification[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, avatar_url, verification_selfie_url, verification_submitted_at')
    .eq('verification_status', 'pending')
    .order('verification_submitted_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    firstName: row.first_name,
    avatarUrl: row.avatar_url,
    verificationSelfieUrl: row.verification_selfie_url,
    verificationSubmittedAt: row.verification_submitted_at,
  }));
}

export async function approveVerification(
  userId: string,
  adminId: string,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      verification_status: 'verified',
      verification_reviewed_at: new Date().toISOString(),
      verification_reviewed_by: adminId,
    })
    .eq('id', userId);
  if (error) throw error;
}

export async function rejectVerification(
  userId: string,
  adminId: string,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      verification_status: 'rejected',
      verification_reviewed_at: new Date().toISOString(),
      verification_reviewed_by: adminId,
    })
    .eq('id', userId);
  if (error) throw error;
}

export async function getVerificationSelfieSignedUrl(
  path: string,
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('verification-selfies')
    .createSignedUrl(path, 300);
  if (error) return null;
  return data.signedUrl;
}
