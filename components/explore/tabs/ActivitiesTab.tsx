// components/explore/tabs/ActivitiesTab.tsx
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ExploreCard, SectionHeader, HorizontalCarousel } from '@/components/explore';
import {
  getActivitiesByCategory,
  getTopRatedActivities,
  activityCategoryLabels,
  MockActivity,
} from '@/data/exploreMockData';
import { spacing } from '@/constants/design';

type ActivityCategory = MockActivity['category'];
const CATEGORY_ORDER: ActivityCategory[] = ['food-tours', 'nature', 'culture', 'wellness', 'adventure', 'nightlife'];

interface ActivitiesTabProps {
  onNavigateToSeeAll: (category: string, title: string) => void;
}

export default function ActivitiesTab({ onNavigateToSeeAll }: ActivitiesTabProps) {
  const router = useRouter();

  const handleActivityPress = useCallback((activity: MockActivity) => {
    router.push(`/(tabs)/explore/activity/${activity.slug}` as any);
  }, [router]);

  const renderActivityCard = useCallback(
    ({ item }: { item: MockActivity }) => (
      <ExploreCard
        imageUrl={item.heroImageUrl}
        title={item.name}
        subtitle={`${item.cityName}, ${item.countryName}`}
        price={{ amount: item.priceFrom, currency: item.currency, suffix: '/ person' }}
        rating={item.rating}
        reviewCount={item.reviewCount}
        onPress={() => handleActivityPress(item)}
        width={280}
      />
    ),
    [handleActivityPress]
  );

  const topRated = useMemo(() => getTopRatedActivities(8), []);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Best Rated Worldwide */}
      <SectionHeader
        title="Best rated worldwide"
        subtitle="Highest reviewed experiences"
        onSeeAll={() => onNavigateToSeeAll('activities-top', 'Best Rated Activities')}
      />
      <HorizontalCarousel
        data={topRated}
        renderItem={renderActivityCard}
        keyExtractor={(item) => item.id}
      />

      {/* Category Sections */}
      {CATEGORY_ORDER.map((category) => {
        const activities = getActivitiesByCategory(category);
        if (activities.length === 0) return null;

        return (
          <View key={category} style={styles.section}>
            <SectionHeader
              title={activityCategoryLabels[category]}
              onSeeAll={() => onNavigateToSeeAll(`activities-${category}`, activityCategoryLabels[category])}
            />
            <HorizontalCarousel
              data={activities}
              renderItem={renderActivityCard}
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
