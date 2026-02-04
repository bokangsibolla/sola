// components/explore/tabs/CountriesTab.tsx
import { ScrollView, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FeaturedCard, GridCard, SectionHeader, WelcomeHeader, GRID_GAP } from '@/components/explore';
import { supabase } from '@/lib/supabase';
import { toCamel } from '@/data/api';
import { useData } from '@/hooks/useData';
import type { Country } from '@/data/types';
import { colors, fonts, spacing } from '@/constants/design';

interface CountriesTabProps {
  onNavigateToSeeAll: (category: string, title: string) => void;
}

type CountryWithContent = Country & {
  blurb?: string | null;
};

// Fetch countries with their geo_content for blurbs
async function getCountriesWithContent(): Promise<CountryWithContent[]> {
  const { data: countries, error: countriesError } = await supabase
    .from('countries')
    .select('*')
    .eq('is_active', true)
    .order('order_index');

  if (countriesError) throw countriesError;
  if (!countries || countries.length === 0) return [];

  // Get geo_content for all countries to get blurbs
  const countryIds = countries.map((c: any) => c.id);
  const { data: geoContent, error: geoError } = await supabase
    .from('geo_content')
    .select('country_id, best_for, subtitle, badge_label')
    .eq('scope', 'country')
    .in('country_id', countryIds);

  if (geoError) {
    console.warn('Failed to fetch geo_content:', geoError);
    return countries.map((c: any) => toCamel<CountryWithContent>(c));
  }

  const contentMap = new Map<string, any>();
  (geoContent || []).forEach((gc: any) => {
    contentMap.set(gc.country_id, gc);
  });

  return countries.map((c: any): CountryWithContent => {
    const country = toCamel<Country>(c);
    const content = contentMap.get(c.id);
    return {
      ...country,
      blurb: content?.best_for || content?.subtitle || country.shortBlurb || null,
      badgeLabel: content?.badge_label || country.badgeLabel || null,
    };
  });
}

export default function CountriesTab({ onNavigateToSeeAll }: CountriesTabProps) {
  const router = useRouter();
  const { data: countries, loading, error } = useData(() => getCountriesWithContent(), []);

  const handleCountryPress = useCallback((country: CountryWithContent) => {
    router.push(`/(tabs)/explore/country/${country.slug}` as any);
  }, [router]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    );
  }

  if (error || !countries || countries.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No countries available</Text>
      </View>
    );
  }

  // First country is featured, rest are in grid
  const featured = countries[0];
  const gridCountries = countries.slice(1, 5);
  const moreCountries = countries.slice(5, 9);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Editorial welcome */}
      <WelcomeHeader
        title="Where to next?"
        subtitle="Curated destinations for solo women travelers"
      />

      {/* Featured country */}
      <FeaturedCard
        imageUrl={featured.heroImageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
        title={featured.name}
        blurb={featured.blurb}
        badge={featured.badgeLabel}
        badgeVariant={featured.isFeatured ? 'highlight' : 'default'}
        onPress={() => handleCountryPress(featured)}
      />

      {/* Grid countries */}
      {gridCountries.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Explore countries"
            onSeeAll={() => onNavigateToSeeAll('all-countries', 'All Countries')}
          />
          <View style={styles.grid}>
            {gridCountries.map((country) => (
              <GridCard
                key={country.id}
                imageUrl={country.heroImageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400'}
                title={country.name}
                blurb={country.blurb}
                badge={country.badgeLabel}
                onPress={() => handleCountryPress(country)}
                showFavorite={true}
              />
            ))}
          </View>
        </View>
      )}

      {/* More countries */}
      {moreCountries.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="More to discover"
            onSeeAll={() => onNavigateToSeeAll('all-countries', 'All Countries')}
          />
          <View style={styles.grid}>
            {moreCountries.map((country) => (
              <GridCard
                key={country.id}
                imageUrl={country.heroImageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400'}
                title={country.name}
                blurb={country.blurb}
                badge={country.badgeLabel}
                onPress={() => handleCountryPress(country)}
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
