import { useData } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/state/AuthContext';
import { getSavedPlaces, getPopularCitiesWithCountry } from '@/data/api';
import type { City } from '@/data/types';

export type InspirationReason = 'personalized' | 'popular';

export interface InspirationItem {
  id: string;
  name: string;
  slug: string;
  heroImageUrl: string | null;
  vibeSummary: string | null;
  entityType: 'city' | 'country';
  countryName?: string;
}

interface InspirationResult {
  items: InspirationItem[];
  reason: InspirationReason;
}

/**
 * Fetches 2-3 personalized destination cards for the home screen's "For You" section.
 *
 * Personalization logic:
 * 1. Get user's saved places → extract city IDs → get tags for those cities
 * 2. Find OTHER cities with similar tags (exclude already saved cities)
 * 3. Fallback: popular destinations for new users with no saves
 */
export function usePersonalizedInspiration(excludeCityIds?: string[]) {
  const { userId } = useAuth();

  const popularFallback = async (): Promise<InspirationResult> => {
    const popularCities = await getPopularCitiesWithCountry(6);
    return { items: mapCitiesToInspirationItems(popularCities.slice(0, 3)), reason: 'popular' };
  };

  const { data, loading, error, refetch } = useData<InspirationResult>(
    async () => {
      if (!userId) return popularFallback();

      try {
        // Step 1: Get user's saved places
        const savedPlaces = await getSavedPlaces(userId);
        const placeIds = savedPlaces.map(sp => sp.placeId);
        if (placeIds.length === 0) return popularFallback();

        // Get city IDs for saved places
        const { data: places, error: placesError } = await supabase
          .from('places')
          .select('city_id')
          .in('id', placeIds);

        if (placesError) throw placesError;

        const savedCityIds = Array.from(
          new Set(places?.map(p => p.city_id).filter(Boolean) ?? [])
        );

        if (savedCityIds.length === 0) return popularFallback();

        // Step 2: Get tags for those cities
        const { data: tagsData, error: tagsError } = await supabase
          .from('destination_tags')
          .select('tag_slug')
          .eq('entity_type', 'city')
          .in('entity_id', savedCityIds);

        if (tagsError) throw tagsError;

        const userTags = Array.from(
          new Set(tagsData?.map(t => t.tag_slug) ?? [])
        );

        if (userTags.length === 0) return popularFallback();

        // Step 3: Find other cities with those tags (exclude saved cities + excludeCityIds)
        const excludeIds = Array.from(
          new Set([...savedCityIds, ...(excludeCityIds ?? [])])
        );

        const { data: matchingTagsData, error: matchingTagsError } = await supabase
          .from('destination_tags')
          .select('entity_id')
          .eq('entity_type', 'city')
          .in('tag_slug', userTags)
          .not('entity_id', 'in', `(${excludeIds.join(',')})`);

        if (matchingTagsError) throw matchingTagsError;

        const matchingCityIds = Array.from(
          new Set(matchingTagsData?.map(t => t.entity_id) ?? [])
        );

        if (matchingCityIds.length === 0) return popularFallback();

        // Step 4: Fetch full city data with country info
        const { data: citiesData, error: citiesError } = await supabase
          .from('cities')
          .select('*, countries(name, slug)')
          .eq('is_active', true)
          .in('id', matchingCityIds)
          .order('order_index')
          .limit(3);

        if (citiesError) throw citiesError;

        if (!citiesData || citiesData.length === 0) return popularFallback();

        // Map to InspirationItem format
        const items = citiesData.map((row: any) => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          heroImageUrl: row.hero_image_url,
          vibeSummary: row.short_blurb,
          entityType: 'city' as const,
          countryName: row.countries?.name ?? undefined,
        }));

        return { items, reason: 'personalized' as const };
      } catch (err) {
        console.error('Error fetching personalized inspiration:', err);
        return popularFallback();
      }
    },
    [userId, excludeCityIds?.join(',') ?? '']
  );

  return {
    items: data?.items ?? [],
    reason: data?.reason ?? 'popular',
    loading,
    error,
    refetch,
  };
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function mapCitiesToInspirationItems(
  cities: Array<City & { countryName?: string; countrySlug?: string }>
): InspirationItem[] {
  return cities.map(city => ({
    id: city.id,
    name: city.name,
    slug: city.slug,
    heroImageUrl: city.heroImageUrl,
    vibeSummary: city.shortBlurb,
    entityType: 'city' as const,
    countryName: city.countryName,
  }));
}
