import React from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { FeatureCard } from './cards/FeatureCard';
import { HeroPlaceCard } from './cards/HeroPlaceCard';
import { PlaceRow } from './cards/PlaceRow';
import { CommunityCard } from './cards/CommunityCard';
import { VerificationNudge } from './VerificationNudge';
import { useNewUserFeed } from '@/data/home/useNewUserFeed';
import { colors, spacing } from '@/constants/design';

export function NewUserFeed() {
  const {
    heroes,
    stayPlaces,
    cafePlaces,
    nightlifePlaces,
    experiencePlaces,
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

      {/* 2. Feature: Travel buddies OR replacement row */}
      {featureSeen.buddies_seen ? (
        <PlaceRow title="Rooftop bars & nightlife" places={nightlifePlaces} />
      ) : (
        <FeatureCard
          icon="people-outline"
          headline="Find people to explore with"
          description="See who's traveling to the same places as you"
          route="/(tabs)/travelers"
        />
      )}

      {/* 3. Horizontal row: Where to stay */}
      <PlaceRow title="Where to stay" places={stayPlaces} />

      {/* 4. Feature: Plan trip OR replacement row */}
      {featureSeen.trip_created ? (
        <PlaceRow title="Experiences & tours" places={experiencePlaces} />
      ) : (
        <FeatureCard
          icon="airplane-outline"
          headline="Plan your first trip"
          description="Build your itinerary, day by day"
          route="/(tabs)/trips"
        />
      )}

      {/* 5. Horizontal row: Cafes & coworking */}
      <PlaceRow title="Cafes & coworking" places={cafePlaces} />

      {/* 6. Feature: Community OR replacement hero */}
      {featureSeen.community_visited ? (
        heroes[2] ? <HeroPlaceCard place={heroes[2]} /> : null
      ) : (
        <FeatureCard
          icon="chatbubbles-outline"
          headline="Ask solo women travelers"
          description="Real answers from women who've been there"
          route="/(tabs)/discussions"
        />
      )}

      {/* 7. Second hero place card */}
      {heroes[1] && <HeroPlaceCard place={heroes[1]} />}

      {/* 8. Community thread */}
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
