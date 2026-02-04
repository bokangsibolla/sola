// components/explore/sections/ActivityClusterSection.tsx
import { StyleSheet, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { spacing } from '@/constants/design';
import { ActivityCard, ACTIVITY_CARD_GAP } from '../cards';
import { SectionLabel } from './SectionLabel';
import type { ActivityWithCity } from '@/data/explore/types';

interface ActivityClusterSectionProps {
  activities: ActivityWithCity[];
  cityName: string;
  citySlug: string;
}

export function ActivityClusterSection({ activities, cityName, citySlug }: ActivityClusterSectionProps) {
  const router = useRouter();

  const handleActivityPress = (activity: ActivityWithCity) => {
    router.push(`/(tabs)/explore/activity/${activity.slug}`);
  };

  const handleSeeAll = () => {
    router.push({
      pathname: '/(tabs)/explore/city/[slug]',
      params: { slug: citySlug },
    });
  };

  if (activities.length === 0) return null;

  return (
    <View style={styles.container}>
      <SectionLabel
        label={`Things to do in ${cityName}`}
        onSeeAll={handleSeeAll}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
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
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  scroll: {
    paddingHorizontal: spacing.screenX,
    gap: ACTIVITY_CARD_GAP,
  },
});
