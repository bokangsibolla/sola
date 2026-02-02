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
  Conversation,
  Message,
} from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Escape special characters for Postgres ILIKE patterns. */
function escapeIlike(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&');
}

/** Convert snake_case row to camelCase type. Supabase returns snake_case. */
function toCamel<T>(row: Record<string, any>): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = v;
  }
  return out as T;
}

function rowsToCamel<T>(rows: Record<string, any>[]): T[] {
  return rows.map((r) => toCamel<T>(r));
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
  return rowsToCamel<Country>(data ?? []);
}

export async function getCountryBySlug(slug: string): Promise<Country | undefined> {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel<Country>(data) : undefined;
}

export async function getCountryByIso2(iso2: string): Promise<Country | undefined> {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('iso2', iso2)
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel<Country>(data) : undefined;
}

export async function getCitiesByCountry(countryId: string): Promise<City[]> {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('country_id', countryId)
    .eq('is_active', true)
    .order('order_index');
  if (error) throw error;
  return rowsToCamel<City>(data ?? []);
}

export async function getCityBySlug(slug: string): Promise<City | undefined> {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel<City>(data) : undefined;
}

export async function getCityById(id: string): Promise<City | undefined> {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel<City>(data) : undefined;
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
// Geo Content
// ---------------------------------------------------------------------------

export async function getCountryContent(countryId: string): Promise<GeoContent | undefined> {
  const { data, error } = await supabase
    .from('geo_content')
    .select('*')
    .eq('scope', 'country')
    .eq('country_id', countryId)
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel<GeoContent>(data) : undefined;
}

export async function getCityContent(cityId: string): Promise<GeoContent | undefined> {
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

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

interface DestinationResult {
  type: 'country' | 'city';
  id: string;
  name: string;
  slug: string;
  parentName: string | null;
}

export async function searchDestinations(query: string): Promise<DestinationResult[]> {
  const q = escapeIlike(query.toLowerCase().trim());
  if (!q) return [];

  const results: DestinationResult[] = [];

  const { data: countries } = await supabase
    .from('countries')
    .select('id, name, slug')
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
    });
  }

  const { data: cities } = await supabase
    .from('cities')
    .select('id, name, slug, country_id, countries(name)')
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
    });
  }

  return results.slice(0, 10);
}

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
