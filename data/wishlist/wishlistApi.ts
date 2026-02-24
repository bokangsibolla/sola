/**
 * Wishlist API layer — CRUD operations for saved cities, countries, and places.
 * Follows the same pattern as data/community/communityApi.ts.
 */

import { supabase } from '@/lib/supabase';
import { rowsToCamel } from '@/data/api';
import type {
  WishlistEntityType,
  WishlistItem,
  WishlistItemWithData,
} from './types';

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Fetch all wishlist items for a user, enriched with display data
 * (name, image, country ISO2, slug) from the referenced entity tables.
 */
export async function getWishlistItems(
  userId: string,
): Promise<WishlistItemWithData[]> {
  const { data, error } = await supabase
    .from('wishlists')
    .select('*')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const items = rowsToCamel<WishlistItem>(data);

  // Group entity IDs by type for batch enrichment
  const cityIds: string[] = [];
  const countryIds: string[] = [];
  const placeIds: string[] = [];

  for (const item of items) {
    if (item.entityType === 'city') cityIds.push(item.entityId);
    else if (item.entityType === 'country') countryIds.push(item.entityId);
    else if (item.entityType === 'place') placeIds.push(item.entityId);
  }

  // Batch-fetch display data for each entity type
  const cityMap = new Map<
    string,
    { name: string; imageUrl: string | null; countryIso2: string | null; slug: string | null }
  >();
  const countryMap = new Map<
    string,
    { name: string; imageUrl: string | null; iso2: string | null; slug: string | null }
  >();
  const placeMap = new Map<
    string,
    { name: string; imageUrl: string | null; countryIso2: string | null; slug: string | null }
  >();

  if (cityIds.length > 0) {
    const { data: cities } = await supabase
      .from('cities')
      .select('id, name, hero_image_url, slug, countries(iso2)')
      .in('id', cityIds);

    for (const c of cities ?? []) {
      // Supabase returns the joined row as an object (single FK), but TS types it as array
      const countryData = c.countries as unknown as { iso2: string } | null;
      cityMap.set(c.id, {
        name: c.name,
        imageUrl: c.hero_image_url,
        countryIso2: countryData?.iso2 ?? null,
        slug: c.slug,
      });
    }
  }

  if (countryIds.length > 0) {
    const { data: countries } = await supabase
      .from('countries')
      .select('id, name, hero_image_url, iso2, slug')
      .in('id', countryIds);

    for (const c of countries ?? []) {
      countryMap.set(c.id, {
        name: c.name,
        imageUrl: c.hero_image_url,
        iso2: c.iso2,
        slug: c.slug,
      });
    }
  }

  if (placeIds.length > 0) {
    const { data: places } = await supabase
      .from('places')
      .select('id, name, image_url_cached, slug, cities(countries(iso2))')
      .in('id', placeIds);

    for (const p of places ?? []) {
      // Supabase returns joined rows as objects (single FK), but TS types them as arrays
      const cityData = p.cities as unknown as { countries: { iso2: string } | null } | null;
      placeMap.set(p.id, {
        name: p.name,
        imageUrl: p.image_url_cached,
        countryIso2: cityData?.countries?.iso2 ?? null,
        slug: p.slug,
      });
    }
  }

  // Assemble enriched items
  return items.map((item) => {
    let name = 'Unknown';
    let imageUrl: string | null = null;
    let countryIso2: string | null = null;
    let slug: string | null = null;

    if (item.entityType === 'city') {
      const city = cityMap.get(item.entityId);
      if (city) {
        name = city.name;
        imageUrl = city.imageUrl;
        countryIso2 = city.countryIso2;
        slug = city.slug;
      }
    } else if (item.entityType === 'country') {
      const country = countryMap.get(item.entityId);
      if (country) {
        name = country.name;
        imageUrl = country.imageUrl;
        countryIso2 = country.iso2;
        slug = country.slug;
      }
    } else if (item.entityType === 'place') {
      const place = placeMap.get(item.entityId);
      if (place) {
        name = place.name;
        imageUrl = place.imageUrl;
        countryIso2 = place.countryIso2;
        slug = place.slug;
      }
    }

    return { ...item, name, imageUrl, countryIso2, slug };
  });
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

/** Add an entity to the user's wishlist. Upserts to avoid duplicates. */
export async function addToWishlist(
  userId: string,
  entityType: WishlistEntityType,
  entityId: string,
): Promise<void> {
  const { error } = await supabase.from('wishlists').upsert(
    {
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
    },
    { onConflict: 'user_id,entity_type,entity_id' },
  );
  if (error) throw error;
}

/** Remove an entity from the user's wishlist. */
export async function removeFromWishlist(
  userId: string,
  entityType: WishlistEntityType,
  entityId: string,
): Promise<void> {
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Check
// ---------------------------------------------------------------------------

/** Check whether a specific entity is in the user's wishlist. */
export async function isWishlisted(
  userId: string,
  entityType: WishlistEntityType,
  entityId: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from('wishlists')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);
  if (error) throw error;
  return (count ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// Trip helpers
// ---------------------------------------------------------------------------

/**
 * Get IDs of wishlisted places within a specific city.
 * Useful for trip conversion — pre-fill itinerary with saved places.
 */
export async function getWishlistPlacesForCity(
  userId: string,
  cityId: string,
): Promise<string[]> {
  // First get all wishlisted place IDs
  const { data: wishlistRows, error: wishlistError } = await supabase
    .from('wishlists')
    .select('entity_id')
    .eq('user_id', userId)
    .eq('entity_type', 'place');

  if (wishlistError) throw wishlistError;
  if (!wishlistRows || wishlistRows.length === 0) return [];

  const placeIds = wishlistRows.map((r) => r.entity_id);

  // Filter to only places in the target city
  const { data: places, error: placesError } = await supabase
    .from('places')
    .select('id')
    .in('id', placeIds)
    .eq('city_id', cityId);

  if (placesError) throw placesError;
  return (places ?? []).map((p) => p.id);
}
