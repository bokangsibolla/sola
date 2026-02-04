// components/explore/sections/CitySpotlightSection.tsx
import { StyleSheet, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { spacing } from '@/constants/design';
import { CitySpotlightCard } from '../cards/CitySpotlightCard';
import { ActivityCard, ACTIVITY_CARD_GAP } from '../cards';
import { SectionLabel } from './SectionLabel';
import type { CityWithCountry, ActivityWithCity } from '@/data/explore/types';

interface CitySpotlightSectionProps {
  city: CityWithCountry;
  activities: ActivityWithCity[];
}

export function CitySpotlightSection({ city, activities }: CitySpotlightSectionProps) {
  const router = useRouter();

  const handleCityPress = () => {
    router.push(`/(tabs)/explore/city/${city.slug}`);
  };

  const handleActivityPress = (activity: ActivityWithCity) => {
    router.push(`/(tabs)/explore/activity/${activity.slug}`);
  };

  return (
    <View style={styles.container}>
      <CitySpotlightCard city={city} onPress={handleCityPress} />

      {activities.length > 0 && (
        <View style={styles.activitiesSection}>
          <SectionLabel label={`Things to do in ${city.name}`} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activitiesScroll}
          >
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onPress={() => handleActivityPress(activity)}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  activitiesSection: {
    gap: spacing.sm,
  },
  activitiesScroll: {
    paddingHorizontal: spacing.screenX,
    gap: ACTIVITY_CARD_GAP,
  },
});
