import { supabase } from '@/lib/supabase';
import { rowsToCamel } from './api';
import type { DiscoveryLens, DiscoveryLensWithResults, ExploreCollectionItem } from './types';

export async function getDiscoveryLenses(): Promise<DiscoveryLens[]> {
  const { data, error } = await supabase
    .from('discovery_lenses')
    .select('*')
    .eq('is_active', true)
    .order('order_index');

  if (error) throw error;
  return rowsToCamel<DiscoveryLens>(data ?? []);
}

export async function getDiscoveryLensBySlug(slug: string): Promise<DiscoveryLens | null> {
  const { data, error } = await supabase
    .from('discovery_lenses')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return rowsToCamel<DiscoveryLens>(data ? [data] : [])[0] ?? null;
}

/**
 * Resolve a lens to its matching entities.
 * Reuses the same tag-based resolution logic as explore_collections.
 */
export async function resolveLensResults(
  lens: DiscoveryLens
): Promise<ExploreCollectionItem[]> {
  const { data: matches, error: matchError } = await supabase
    .from('destination_tags')
    .select('entity_type, entity_id')
    .in('tag_slug', lens.includeTags)
    .in('entity_type', lens.entityTypes);

  if (matchError) throw matchError;
  if (!matches || matches.length === 0) return [];

  const uniqueEntities = Array.from(
    new Map(matches.map(m => [`${m.entity_type}:${m.entity_id}`, m])).values()
  );

  let filtered = uniqueEntities;
  if (lens.excludeTags.length > 0) {
    const { data: excluded } = await supabase
      .from('destination_tags')
      .select('entity_type, entity_id')
      .in('tag_slug', lens.excludeTags);

    const excludeSet = new Set(
      (excluded ?? []).map(e => `${e.entity_type}:${e.entity_id}`)
    );
    filtered = uniqueEntities.filter(
      e => !excludeSet.has(`${e.entity_type}:${e.entity_id}`)
    );
  }

  const countryIds = filtered
    .filter(e => e.entity_type === 'country')
    .map(e => e.entity_id);
  const cityIds = filtered
    .filter(e => e.entity_type === 'city')
    .map(e => e.entity_id);

  const [countries, cities] = await Promise.all([
    countryIds.length > 0
      ? supabase
          .from('countries')
          .select('id, name, slug, hero_image_url, short_blurb, is_featured, order_index, solo_level, safety_rating')
          .in('id', countryIds)
          .eq('is_active', true)
      : { data: [] },
    cityIds.length > 0
      ? supabase
          .from('cities')
          .select('id, name, slug, hero_image_url, short_blurb, is_featured, order_index, country_id')
          .in('id', cityIds)
          .eq('is_active', true)
      : { data: [] },
  ]);

  const items: ExploreCollectionItem[] = [];

  for (const country of countries.data ?? []) {
    items.push({
      collectionId: lens.id,
      collectionSlug: lens.slug,
      entityType: 'country',
      entityId: country.id,
      entityName: country.name,
      entitySlug: country.slug,
      entityImageUrl: country.hero_image_url,
      isFeatured: country.is_featured ?? false,
      orderIndex: country.order_index ?? 0,
    });
  }

  for (const city of cities.data ?? []) {
    items.push({
      collectionId: lens.id,
      collectionSlug: lens.slug,
      entityType: 'city',
      entityId: city.id,
      entityName: city.name,
      entitySlug: city.slug,
      entityImageUrl: city.hero_image_url,
      isFeatured: city.is_featured ?? false,
      orderIndex: city.order_index ?? 0,
    });
  }

  items.sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
    return a.orderIndex - b.orderIndex;
  });

  return items.slice(0, lens.maxItems);
}

export async function getDiscoveryLensWithResults(
  slug: string
): Promise<DiscoveryLensWithResults | null> {
  const lens = await getDiscoveryLensBySlug(slug);
  if (!lens) return null;

  const results = await resolveLensResults(lens);
  return { ...lens, results };
}
