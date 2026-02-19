/**
 * City page API — optimized queries for the Places tab.
 * Eliminates N+1 by joining place_media + city_areas in a single query.
 */

import { supabase } from '@/lib/supabase';
import { rowsToCamel, toCamel } from '../api';
import type { Place, Tag } from '../types';
import type { PlaceWithImage, PlaceCategoryKey, CategoryCount } from './types';
import { PLACE_CATEGORIES, PLACE_TYPE_TO_CATEGORY } from './types';

// ---------------------------------------------------------------------------
// Places by category for a city (single optimized query)
// ---------------------------------------------------------------------------

/**
 * Fetch places for a city filtered by place types (from a category).
 * Joins the first image from place_media + area name from city_areas.
 * Uses image_url_cached when available, falls back to place_media join.
 */
export async function getPlacesByCategoryForCity(
  cityId: string,
  placeTypes: Place['placeType'][],
  opts?: { areaId?: string; sortBy?: 'name' | 'rating' | 'price' },
): Promise<PlaceWithImage[]> {
  let query = supabase
    .from('places')
    .select('*, city_areas(name)')
    .eq('city_id', cityId)
    .eq('is_active', true)
    .in('place_type', placeTypes);

  if (opts?.areaId) {
    query = query.eq('city_area_id', opts.areaId);
  }

  switch (opts?.sortBy) {
    case 'rating':
      query = query.order('google_rating', { ascending: false, nullsFirst: false });
      break;
    case 'price':
      query = query.order('price_level', { ascending: true, nullsFirst: false });
      break;
    default:
      query = query.order('is_featured', { ascending: false })
        .order('order_index', { ascending: true });
  }

  const { data, error } = await query;
  if (error) throw error;

  const places = (data ?? []).map((row: any) => {
    const place = toCamel<Place>(row);
    const areaName = row.city_areas?.name ?? null;
    return {
      ...place,
      imageUrl: place.imageUrlCached ?? null,
      areaName,
    } as PlaceWithImage;
  });

  // For places without cached image, batch-fetch from place_media
  const needImages = places.filter((p) => !p.imageUrl);
  if (needImages.length > 0) {
    const ids = needImages.map((p) => p.id);
    const { data: media } = await supabase
      .from('place_media')
      .select('place_id, url')
      .in('place_id', ids)
      .eq('media_type', 'image')
      .order('order_index', { ascending: true });

    if (media) {
      // Build map of place_id → first image URL
      const imageMap = new Map<string, string>();
      for (const m of media) {
        if (!imageMap.has(m.place_id)) {
          imageMap.set(m.place_id, m.url);
        }
      }
      for (const p of places) {
        if (!p.imageUrl) {
          p.imageUrl = imageMap.get(p.id) ?? null;
        }
      }
    }
  }

  return places;
}

// ---------------------------------------------------------------------------
// Category counts (for tab pills)
// ---------------------------------------------------------------------------

/**
 * Get the count of places per category for a city.
 * Only returns categories with count > 0.
 */
export async function getCityCategoryCounts(cityId: string): Promise<CategoryCount[]> {
  const { data, error } = await supabase
    .from('places')
    .select('place_type')
    .eq('city_id', cityId)
    .eq('is_active', true);

  if (error) throw error;

  // Count by category
  const countMap = new Map<PlaceCategoryKey, number>();
  for (const row of data ?? []) {
    const catKey = PLACE_TYPE_TO_CATEGORY[row.place_type as Place['placeType']];
    if (catKey) {
      countMap.set(catKey, (countMap.get(catKey) ?? 0) + 1);
    }
  }

  return PLACE_CATEGORIES
    .filter((cat) => (countMap.get(cat.key) ?? 0) > 0)
    .map((cat) => ({
      key: cat.key,
      label: cat.label,
      emoji: cat.emoji,
      count: countMap.get(cat.key) ?? 0,
    }));
}

// ---------------------------------------------------------------------------
// Batch tag loading (eliminates N+1)
// ---------------------------------------------------------------------------

/**
 * Load tags for a batch of place IDs in a single query.
 * Returns a map of placeId → Tag[].
 */
export async function getPlaceTagsBatch(
  placeIds: string[],
): Promise<Map<string, Tag[]>> {
  if (placeIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from('place_tags')
    .select('place_id, tags(*)')
    .in('place_id', placeIds)
    .order('weight', { ascending: false });

  if (error) throw error;

  const map = new Map<string, Tag[]>();
  for (const row of data ?? []) {
    const placeId = row.place_id;
    const tag = row.tags ? toCamel<Tag>(row.tags as Record<string, any>) : null;
    if (!tag) continue;
    const existing = map.get(placeId);
    if (existing) {
      existing.push(tag);
    } else {
      map.set(placeId, [tag]);
    }
  }

  return map;
}
