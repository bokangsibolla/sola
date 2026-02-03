// components/explore/tabs/CountriesTab.tsx
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ExploreCard, SectionHeader, HorizontalCarousel } from '@/components/explore';
import {
  mockCountries,
  getCountriesByContinent,
  continentLabels,
  MockCountry,
} from '@/data/exploreMockData';
import { spacing } from '@/constants/design';

// Order continents by number of countries (most first)
function getContinentOrder(): MockCountry['continent'][] {
  const counts: Record<string, number> = {};
  mockCountries.forEach(c => {
    counts[c.continent] = (counts[c.continent] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([continent]) => continent as MockCountry['continent']);
}

interface CountriesTabProps {
  onNavigateToSeeAll: (category: string, title: string) => void;
}

export default function CountriesTab({ onNavigateToSeeAll }: CountriesTabProps) {
  const router = useRouter();
  const continentOrder = useMemo(() => getContinentOrder(), []);

  const handleCountryPress = useCallback((country: MockCountry) => {
    router.push(`/(tabs)/explore/country/${country.slug}` as any);
  }, [router]);

  const renderCountryCard = useCallback(
    ({ item }: { item: MockCountry }) => (
      <ExploreCard
        imageUrl={item.heroImageUrl}
        title={item.name}
        subtitle={item.subtitle}
        rating={item.rating}
        reviewCount={item.reviewCount}
        onPress={() => handleCountryPress(item)}
        width={280}
      />
    ),
    [handleCountryPress]
  );

  const topCountries = useMemo(
    () => [...mockCountries].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 8),
    []
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Top Countries */}
      <SectionHeader
        title="Top countries"
        subtitle="Most loved destinations"
        onSeeAll={() => onNavigateToSeeAll('all-countries', 'All Countries')}
      />
      <HorizontalCarousel
        data={topCountries}
        renderItem={renderCountryCard}
        keyExtractor={(item) => item.id}
      />

      {/* Continent Sections */}
      {continentOrder.map((continent) => {
        const countries = getCountriesByContinent(continent);
        if (countries.length === 0) return null;

        return (
          <View key={continent} style={styles.section}>
            <SectionHeader
              title={continentLabels[continent]}
              onSeeAll={() => onNavigateToSeeAll(`continent-${continent}`, continentLabels[continent])}
            />
            <HorizontalCarousel
              data={countries}
              renderItem={renderCountryCard}
              keyExtractor={(item) => item.id}
            />
          </View>
        );
      })}
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
});
