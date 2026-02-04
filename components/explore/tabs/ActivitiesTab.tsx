// components/explore/tabs/ActivitiesTab.tsx
import { ScrollView, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FeaturedCard, GridCard, SectionHeader, WelcomeHeader, GRID_GAP } from '@/components/explore';
import { supabase } from '@/lib/supabase';
import { toCamel } from '@/data/api';
import { useData } from '@/hooks/useData';
import type { Place } from '@/data/types';
import { colors, fonts, spacing } from '@/constants/design';

interface ActivitiesTabProps {
  onNavigateToSeeAll: (category: string, title: string) => void;
}

type ActivityWithDetails = Place & {
  cityName?: string;
  imageUrl?: string | null;
};

// Fetch activities and tours from Supabase with city names and images
async function getActivities(): Promise<ActivityWithDetails[]> {
  const { data, error } = await supabase
    .from('places')
    .select(`
      *,
      cities!inner(name),
      place_media(url)
    `)
    .eq('is_active', true)
    .in('place_type', ['activity', 'tour', 'landmark'])
    .limit(12);

  if (error) throw error;
  if (!data || data.length === 0) return [];

  return data.map((row: any): ActivityWithDetails => {
    const place = toCamel<Place>(row);
    return {
      ...place,
      cityName: row.cities?.name || '',
      imageUrl: row.place_media?.[0]?.url || null,
    };
  });
}

export default function ActivitiesTab({ onNavigateToSeeAll }: ActivitiesTabProps) {
  const router = useRouter();
  const { data: activities, loading, error } = useData(() => getActivities(), []);

  const handleActivityPress = useCallback((activity: ActivityWithDetails) => {
    router.push(`/(tabs)/explore/place-detail/${activity.id}` as any);
  }, [router]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    );
  }

  if (error || !activities || activities.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No activities available</Text>
      </View>
    );
  }

  // Helper to get blurb text
  const getBlurb = (activity: ActivityWithDetails): string | null => {
    if (activity.whySelected) {
      return activity.whySelected.length > 60
        ? activity.whySelected.slice(0, 57) + '...'
        : activity.whySelected;
    }
    if (activity.description) {
      return activity.description.length > 60
        ? activity.description.slice(0, 57) + '...'
        : activity.description;
    }
    return activity.cityName || null;
  };

  // First activity is featured, rest are in grid
  const featured = activities[0];
  const gridActivities = activities.slice(1, 5);
  const moreActivities = activities.slice(5, 9);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Editorial welcome */}
      <WelcomeHeader
        title="Things to do"
        subtitle="Experiences curated for solo adventurers"
      />

      {/* Featured activity */}
      <FeaturedCard
        imageUrl={featured.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
        title={featured.name}
        blurb={getBlurb(featured)}
        badge={featured.badgeLabel}
        badgeVariant={featured.isFeatured ? 'highlight' : 'default'}
        onPress={() => handleActivityPress(featured)}
      />

      {/* Grid activities */}
      {gridActivities.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Things to do"
            onSeeAll={() => onNavigateToSeeAll('all-activities', 'All Activities')}
          />
          <View style={styles.grid}>
            {gridActivities.map((activity) => (
              <GridCard
                key={activity.id}
                imageUrl={activity.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400'}
                title={activity.name}
                blurb={getBlurb(activity)}
                badge={activity.badgeLabel}
                onPress={() => handleActivityPress(activity)}
                showFavorite={true}
              />
            ))}
          </View>
        </View>
      )}

      {/* More activities */}
      {moreActivities.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="More experiences"
            onSeeAll={() => onNavigateToSeeAll('all-activities', 'All Activities')}
          />
          <View style={styles.grid}>
            {moreActivities.map((activity) => (
              <GridCard
                key={activity.id}
                imageUrl={activity.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400'}
                title={activity.name}
                blurb={getBlurb(activity)}
                badge={activity.badgeLabel}
                onPress={() => handleActivityPress(activity)}
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
