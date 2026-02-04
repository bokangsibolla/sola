// components/explore/tabs/PlacesTab.tsx
import { ScrollView, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FeaturedCard, GridCard, SectionHeader, WelcomeHeader, GRID_GAP } from '@/components/explore';
import { supabase } from '@/lib/supabase';
import { toCamel } from '@/data/api';
import { useData } from '@/hooks/useData';
import type { City } from '@/data/types';
import { colors, fonts, spacing } from '@/constants/design';

interface PlacesTabProps {
  onNavigateToSeeAll: (category: string, title: string) => void;
}

type CityWithContent = City & {
  countryName?: string;
  blurb?: string | null;
};

// Fetch cities with their geo_content for blurbs and country names
async function getCitiesWithContent(): Promise<CityWithContent[]> {
  const { data: cities, error: citiesError } = await supabase
    .from('cities')
    .select(`
      *,
      countries!inner(name)
    `)
    .eq('is_active', true)
    .order('order_index')
    .limit(12);

  if (citiesError) throw citiesError;
  if (!cities || cities.length === 0) return [];

  // Get geo_content for all cities to get blurbs
  const cityIds = cities.map((c: any) => c.id);
  const { data: geoContent, error: geoError } = await supabase
    .from('geo_content')
    .select('city_id, best_for, subtitle, badge_label')
    .eq('scope', 'city')
    .in('city_id', cityIds);

  const contentMap = new Map<string, any>();
  if (!geoError && geoContent) {
    geoContent.forEach((gc: any) => {
      contentMap.set(gc.city_id, gc);
    });
  }

  return cities.map((c: any): CityWithContent => {
    const city = toCamel<City>(c);
    const content = contentMap.get(c.id);
    return {
      ...city,
      countryName: c.countries?.name || '',
      blurb: content?.best_for || content?.subtitle || city.shortBlurb || null,
      badgeLabel: content?.badge_label || city.badgeLabel || null,
    };
  });
}

export default function PlacesTab({ onNavigateToSeeAll }: PlacesTabProps) {
  const router = useRouter();
  const { data: cities, loading, error } = useData(() => getCitiesWithContent(), []);

  const handleCityPress = useCallback((city: CityWithContent) => {
    router.push(`/(tabs)/explore/city/${city.slug}` as any);
  }, [router]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    );
  }

  if (error || !cities || cities.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No destinations available</Text>
      </View>
    );
  }

  // First city is featured, rest are in grid
  const featured = cities[0];
  const gridCities = cities.slice(1, 5);
  const moreCities = cities.slice(5, 9);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Editorial welcome */}
      <WelcomeHeader
        title="Discover places"
        subtitle="Cities, islands, and hidden gems waiting for you"
      />

      {/* Featured destination */}
      <FeaturedCard
        imageUrl={featured.heroImageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
        title={featured.name}
        blurb={featured.blurb || featured.countryName}
        badge={featured.badgeLabel}
        badgeVariant={featured.isFeatured ? 'highlight' : 'default'}
        onPress={() => handleCityPress(featured)}
      />

      {/* Grid cities */}
      {gridCities.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Popular destinations"
            onSeeAll={() => onNavigateToSeeAll('all-places', 'All Destinations')}
          />
          <View style={styles.grid}>
            {gridCities.map((city) => (
              <GridCard
                key={city.id}
                imageUrl={city.heroImageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400'}
                title={city.name}
                blurb={city.blurb || city.countryName}
                badge={city.badgeLabel}
                onPress={() => handleCityPress(city)}
                showFavorite={true}
              />
            ))}
          </View>
        </View>
      )}

      {/* More destinations */}
      {moreCities.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="More destinations"
            onSeeAll={() => onNavigateToSeeAll('all-places', 'All Destinations')}
          />
          <View style={styles.grid}>
            {moreCities.map((city) => (
              <GridCard
                key={city.id}
                imageUrl={city.heroImageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400'}
                title={city.name}
                blurb={city.blurb || city.countryName}
                badge={city.badgeLabel}
                onPress={() => handleCityPress(city)}
                showFavorite={true}
              />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxxl,
  },
  section: {
    marginTop: spacing.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.screenX,
    gap: GRID_GAP,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
  },
});
