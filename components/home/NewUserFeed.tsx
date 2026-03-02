import React from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { ImageFeatureCard } from './cards/ImageFeatureCard';
import { HeroPlaceCard } from './cards/HeroPlaceCard';
import { PlaceRow } from './cards/PlaceRow';
import { CityRow } from './cards/CityRow';
import { CommunityCard } from './cards/CommunityCard';
import { VerificationNudge } from './VerificationNudge';
import { useNewUserFeed } from '@/data/home/useNewUserFeed';
import { colors, spacing } from '@/constants/design';

const travelBuddiesImage = require('@/assets/images/pexels-women-travel-together.jpg');
const planTripImage = require('@/assets/images/pexels-plan-trip-map.jpg');

export function NewUserFeed() {
  const {
    heroes,
    experiencePlaces,
    trendingCities,
    featureSeen,
    loading,
    refetch,
  } = useNewUserFeed();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refetch}
          tintColor={colors.orange}
        />
      }
    >
      <VerificationNudge />

      {/* 1. Hero place card */}
      {heroes[0] && <HeroPlaceCard place={heroes[0]} />}

      {/* 2. Experiences & activities */}
      <PlaceRow title="Experiences & activities" places={experiencePlaces} />

      {/* 3. Travel with other women */}
      <ImageFeatureCard
        imageSource={travelBuddiesImage}
        headline="Travel with other women"
        description="See who's heading to the same places"
        route="/(tabs)/travelers"
      />

      {/* 4. Trending destinations */}
      <CityRow title="Trending destinations" cities={trendingCities} />

      {/* 5. Plan your first trip */}
      <ImageFeatureCard
        imageSource={planTripImage}
        headline="Plan your first trip"
        description="Build your itinerary, day by day"
        route="/(tabs)/trips"
      />

      {/* 6. Second hero place card */}
      {heroes[1] && <HeroPlaceCard place={heroes[1]} />}

      {/* 7. Community thread */}
      <CommunityCard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
});
