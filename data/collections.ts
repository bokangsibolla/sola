import { supabase } from '@/lib/supabase';
import { rowsToCamel } from './api';
import type { ExploreCollection, ExploreCollectionItem, ExploreCollectionWithItems } from './types';

export async function getExploreCollections(): Promise<ExploreCollection[]> {
  const { data, error } = await supabase
    .from('explore_collections')
    .select('*')
    .eq('is_active', true)
    .order('order_index');

  if (error) throw error;
  return rowsToCamel<ExploreCollection>(data ?? []);
}

export async function getExploreCollectionBySlug(slug: string): Promise<ExploreCollection | null> {
  const { data, error } = await supabase
    .from('explore_collections')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return rowsToCamel<ExploreCollection>(data ? [data] : [])[0] ?? null;
}

export async function getExploreCollectionItems(
  collection: ExploreCollection
): Promise<ExploreCollectionItem[]> {
  // Get entities matching include_tags
  const { data: matches, error: matchError } = await supabase
    .from('destination_tags')
    .select('entity_type, entity_id')
    .in('tag_slug', collection.includeTags)
    .in('entity_type', collection.entityTypes);

  if (matchError) throw matchError;
  if (!matches || matches.length === 0) return [];

  // Deduplicate
  const uniqueEntities = Array.from(
    new Map(matches.map(m => [`${m.entity_type}:${m.entity_id}`, m])).values()
  );

  // Filter out entities with exclude_tags
  let filtered = uniqueEntities;
  if (collection.excludeTags.length > 0) {
    const { data: excluded } = await supabase
      .from('destination_tags')
      .select('entity_type, entity_id')
      .in('tag_slug', collection.excludeTags);

    const excludeSet = new Set(
      (excluded ?? []).map(e => `${e.entity_type}:${e.entity_id}`)
    );
    filtered = uniqueEntities.filter(
      e => !excludeSet.has(`${e.entity_type}:${e.entity_id}`)
    );
  }

  // Fetch entity details
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
          .select('id, name, slug, hero_image_url, is_featured, order_index')
          .in('id', countryIds)
          .eq('is_active', true)
      : { data: [] },
    cityIds.length > 0
      ? supabase
          .from('cities')
          .select('id, name, slug, hero_image_url, is_featured, order_index')
          .in('id', cityIds)
          .eq('is_active', true)
      : { data: [] },
  ]);

  // Build items
  const items: ExploreCollectionItem[] = [];

  for (const country of countries.data ?? []) {
    items.push({
      collectionId: collection.id,
      collectionSlug: collection.slug,
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
      collectionId: collection.id,
      collectionSlug: collection.slug,
      entityType: 'city',
      entityId: city.id,
      entityName: city.name,
      entitySlug: city.slug,
      entityImageUrl: city.hero_image_url,
      isFeatured: city.is_featured ?? false,
      orderIndex: city.order_index ?? 0,
    });
  }

  // Sort
  if (collection.sortBy === 'featured_first') {
    items.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
    });
  } else if (collection.sortBy === 'name') {
    items.sort((a, b) => a.entityName.localeCompare(b.entityName));
  } else if (collection.sortBy === 'random') {
    items.sort(() => Math.random() - 0.5);
  } else {
    items.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }

  // Limit
  return items.slice(0, collection.maxItems);
}

export async function getExploreCollectionWithItems(
  slug: string
): Promise<ExploreCollectionWithItems | null> {
  const collection = await getExploreCollectionBySlug(slug);
  if (!collection) return null;

  const items = await getExploreCollectionItems(collection);

  // Check min_items
  if (items.length < collection.minItems) {
    return null; // Collection doesn't meet minimum
  }

  return { ...collection, items };
}

export async function getFeaturedExploreCollections(): Promise<ExploreCollection[]> {
  const { data, error } = await supabase
    .from('explore_collections')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('order_index');

  if (error) throw error;
  return rowsToCamel<ExploreCollection>(data ?? []);
}
