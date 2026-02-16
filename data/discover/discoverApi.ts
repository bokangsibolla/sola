import { supabase } from '@/lib/supabase';
import { getPopularCitiesWithCountry, getCountriesWithCities } from '../api';
import { getExploreCollections, getExploreCollectionItems } from '../collections';
import type { ExploreCollectionWithItems } from '../types';
import type { RecommendedCity, BrowseCountry, ContinentKey } from './types';

/**
 * Fetch recommended cities for the Discover carousel.
 * Uses get_recommended_cities RPC which blends personal affinity with global popularity.
 * Falls back to popular cities if personalized results are insufficient (<3).
 */
export async function fetchRecommendedCities(
  userId: string | null,
  limit: number = 12,
): Promise<{ cities: RecommendedCity[]; isPersonalized: boolean }> {
  // Try personalized first if user is logged in
  if (userId) {
    const { data, error } = await supabase.rpc('get_recommended_cities', {
      p_user_id: userId,
      p_limit: limit,
    });

    if (!error && data && data.length >= 3) {
      return {
        cities: data.map((row: Record<string, unknown>) => ({
          cityId: row.city_id as string,
          cityName: row.city_name as string,
          citySlug: row.city_slug as string,
          countryName: row.country_name as string,
          countrySlug: row.country_slug as string,
          heroImageUrl: row.hero_image_url as string,
          soloLevel: (row.solo_level as string) || null,
          safetyRating: (row.safety_rating as string) || null,
          planningCount: Number(row.planning_count) || 0,
          finalScore: Number(row.final_score) || 0,
        })),
        isPersonalized: true,
      };
    }
  }

  // Fallback: popular cities (global, not personalized)
  const popular = await getPopularCitiesWithCountry(limit);
  return {
    cities: popular.map((c) => ({
      cityId: c.id,
      cityName: c.name,
      citySlug: c.slug,
      countryName: c.countryName,
      countrySlug: c.countrySlug,
      heroImageUrl: c.heroImageUrl ?? '',
      soloLevel: c.soloLevel,
      safetyRating: c.safetyRating,
      planningCount: 0,
      finalScore: 0,
    })),
    isPersonalized: false,
  };
}

/**
 * Fetch countries grouped by continent for the Browse page.
 * Each country includes its active cities.
 */
export async function fetchBrowseData(): Promise<Map<ContinentKey, BrowseCountry[]>> {
  const countriesWithCities = await getCountriesWithCities();

  const grouped = new Map<ContinentKey, BrowseCountry[]>();
  for (const country of countriesWithCities) {
    const continent = country.continent as ContinentKey | null;
    // Skip countries without a continent (migration may not be applied yet)
    if (!continent) continue;
    if (!grouped.has(continent)) {
      grouped.set(continent, []);
    }
    grouped.get(continent)!.push({
      id: country.id,
      name: country.name,
      slug: country.slug,
      continent,
      heroImageUrl: country.heroImageUrl,
      cities: country.cities,
    });
  }

  return grouped;
}

/**
 * Fetch community thread counts grouped by country.
 * Returns a Map of countryId → threadCount for active threads.
 */
export async function fetchCommunityCountsByCountry(): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from('community_threads')
    .select('country_id')
    .eq('status', 'active')
    .not('country_id', 'is', null);

  if (error || !data) return new Map();

  const counts = new Map<string, number>();
  for (const row of data) {
    const id = row.country_id as string;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

/**
 * Fetch collections for the Discover page.
 * Returns only collections that meet their minimum item threshold.
 */
export async function fetchDiscoverCollections(): Promise<ExploreCollectionWithItems[]> {
  const collections = await getExploreCollections();

  const resolved = await Promise.all(
    collections.map(async (col) => {
      try {
        const items = await getExploreCollectionItems(col);
        if (items.length < col.minItems) return null;
        return { ...col, items } as ExploreCollectionWithItems;
      } catch {
        return null;
      }
    }),
  );

  return resolved.filter((c): c is ExploreCollectionWithItems => c !== null);
}
