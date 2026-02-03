// components/explore/tabs/PlacesTab.tsx
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ExploreCard, SectionHeader, HorizontalCarousel, DEFAULT_ITEM_WIDTH } from '@/components/explore';
import {
  getCitiesByCategory,
  cityCategoryLabels,
  MockCity,
} from '@/data/exploreMockData';
import { spacing } from '@/constants/design';

type CityCategory = MockCity['category'];
const CATEGORY_ORDER: CityCategory[] = ['beaches', 'cities', 'nature', 'culture', 'food'];

interface PlacesTabProps {
  onNavigateToSeeAll: (category: string, title: string) => void;
}

export default function PlacesTab({ onNavigateToSeeAll }: PlacesTabProps) {
  const router = useRouter();

  const handleCityPress = useCallback((city: MockCity) => {
    router.push(`/(tabs)/explore/city/${city.slug}` as any);
  }, [router]);

  const renderCityCard = useCallback(
    ({ item }: { item: MockCity }) => (
      <ExploreCard
        imageUrl={item.heroImageUrl}
        title={item.name}
        subtitle={item.countryName}
        rating={item.rating}
        reviewCount={item.reviewCount}
        onPress={() => handleCityPress(item)}
        width={DEFAULT_ITEM_WIDTH}
      />
    ),
    [handleCityPress]
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {CATEGORY_ORDER.map((category, index) => {
        const cities = getCitiesByCategory(category);
        if (cities.length === 0) return null;

        return (
          <View key={category} style={index > 0 ? styles.section : undefined}>
            <SectionHeader
              title={cityCategoryLabels[category]}
              onSeeAll={() => onNavigateToSeeAll(`cities-${category}`, cityCategoryLabels[category])}
            />
            <HorizontalCarousel
              data={cities}
              renderItem={renderCityCard}
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
