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
  GeoContent,
  Profile,
  SavedPlace,
  Collection,
  Trip,
  TripPlace,
  Conversation,
  Message,
  DestinationTag,
  PaginatedResult,
  PlaceSignal,
  PlaceVerificationSignal,
  PlaceSolaNote,
  PlaceVerificationStatus,
} from './types';

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
  const ids = [...new Set((data ?? []).map((r) => r.entity_id))];
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
 * Get activity with its media and tags
 */
export async function getActivityWithDetails(slug: string): Promise<{
  activity: Place;
  media: PlaceMedia[];
  tags: Tag[];
} | undefined> {
  const activity = await getActivityBySlug(slug);
  if (!activity) return undefined;

  const [media, tags] = await Promise.all([
    getPlaceMedia(activity.id),
    getPlaceTags(activity.id),
  ]);

  return { activity, media, tags };
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
// Geo Content (DEPRECATED - content now in countries/cities tables)
// ---------------------------------------------------------------------------

/**
 * @deprecated Content fields have been merged into the countries table.
 * Use getCountryById() or getCountryBySlug() instead, which now includes all content fields.
 * This function will be removed once the geo_content table is dropped.
 */
export async function getCountryContent(countryId: string): Promise<GeoContent | undefined> {
  console.warn(
    'DEPRECATED: getCountryContent() is deprecated. ' +
    'Use getCountryById() instead - content fields are now on the Country type.'
  );
  const { data, error } = await supabase
    .from('geo_content')
    .select('*')
    .eq('scope', 'country')
    .eq('country_id', countryId)
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel<GeoContent>(data) : undefined;
}

/**
 * @deprecated Content fields have been merged into the cities table.
 * Use getCityById() or getCityBySlug() instead, which now includes all content fields.
 * This function will be removed once the geo_content table is dropped.
 */
export async function getCityContent(cityId: string): Promise<GeoContent | undefined> {
  console.warn(
    'DEPRECATED: getCityContent() is deprecated. ' +
    'Use getCityById() instead - content fields are now on the City type.'
  );
  const { data, error } = await supabase
    .from('geo_content')
    .select('*')
    .eq('scope', 'city')
    .eq('city_id', cityId)
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel<GeoContent>(data) : undefined;
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
// Messages
// ---------------------------------------------------------------------------

export async function getConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('last_message_at', { ascending: false });
  if (error) throw error;
  return rowsToCamel<Conversation>(data ?? []);
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
      unread_count: 0,
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

// ---------------------------------------------------------------------------
// Block & Report
// ---------------------------------------------------------------------------

export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await supabase
    .from('blocked_users')
    .insert({ blocker_id: blockerId, blocked_id: blockedId });
  if (error && error.code !== '23505') throw error; // ignore duplicate
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
// Search
// ---------------------------------------------------------------------------

export interface DestinationResult {
  type: 'country' | 'city';
  id: string;
  name: string;
  slug: string;
  parentName: string | null;
  countryIso2: string | null;
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

  return results.slice(0, 10);
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
  return { data: rowsToCamel<Conversation>(rows), hasMore };
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

  // Reset unread count on conversation
  await supabase
    .from('conversations')
    .update({ unread_count: 0 })
    .eq('id', conversationId);
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
