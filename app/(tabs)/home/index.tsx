import React, { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { usePostHog } from 'posthog-react-native';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import { HamburgerButton } from '@/components/home/HamburgerButton';
import { HomeSkeleton } from '@/components/home/HomeSkeleton';
import { VerificationNudge } from '@/components/home/VerificationNudge';
import { AvatarNudge } from '@/components/home/AvatarNudge';
import { CommunityBannerCard } from '@/components/home/CommunityBannerCard';
import { HomeTripCard } from '@/components/home/cards/HomeTripCard';
import { TravelMapCard } from '@/components/home/cards/TravelMapCard';
import { StatsCard } from '@/components/home/cards/StatsCard';
import { ProfileProgressCard } from '@/components/home/cards/ProfileProgressCard';
import { NudgeCard } from '@/components/home/cards/NudgeCard';
import { DiscoveryCard } from '@/components/home/cards/DiscoveryCard';
import { CommunityCard } from '@/components/home/cards/CommunityCard';
import { useCardFeed } from '@/data/home/useCardFeed';
import { colors, spacing } from '@/constants/design';
import type { FeedCard } from '@/data/home/cardEngine';

// Track discovery card index to show different cities
let discoveryIndex = 0;

function renderCard(card: FeedCard): React.ReactElement | null {
  switch (card.type) {
    case 'active_trip':
      return <HomeTripCard key={card.key} trip={card.data as any} variant="active" />;
    case 'upcoming_trip':
      return <HomeTripCard key={card.key} trip={card.data as any} variant="upcoming" />;
    case 'trip_recap':
      return <HomeTripCard key={card.key} trip={card.data as any} variant="recap" />;
    case 'travel_map':
      return <TravelMapCard key={card.key} />;
    case 'stats_snapshot':
      return <StatsCard key={card.key} tripCount={(card.data as any)?.tripCount ?? 0} />;
    case 'profile_progress':
      return <ProfileProgressCard key={card.key} {...(card.data as any)} />;
    case 'avatar_nudge':
      return <AvatarNudge key={card.key} />;
    case 'interests_nudge':
    case 'first_trip_nudge':
      return <NudgeCard key={card.key} type={card.type} />;
    case 'recommended_city':
      return <DiscoveryCard key={card.key} index={discoveryIndex++} />;
    case 'collection':
      return <DiscoveryCard key={card.key} index={discoveryIndex++} />;
    case 'trending_thread':
      return <CommunityCard key={card.key} />;
    case 'community_banner':
      return <CommunityBannerCard key={card.key} />;
    case 'verification_nudge':
      return <VerificationNudge key={card.key} />;
    default:
      return null;
  }
}

export default function HomeScreen() {
  const posthog = usePostHog();
  const { cards, loading, refetch } = useCardFeed();

  useEffect(() => {
    posthog.capture('home_viewed');
  }, [posthog]);

  // Reset discovery index on each render so cards stay stable
  discoveryIndex = 0;

  return (
    <AppScreen>
      <NavigationHeader
        title="Home"
        showLogo
        rightActions={<HamburgerButton />}
      />

      {loading && cards.length === 0 ? (
        <HomeSkeleton />
      ) : (
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
          {/* Always show verification nudge at top — it self-hides when not needed */}
          <VerificationNudge />

          {cards.map((card) => (
            <View key={card.key} style={styles.cardWrapper}>
              {renderCard(card)}
            </View>
          ))}
        </ScrollView>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  cardWrapper: {
    // Cards handle their own internal spacing/padding
  },
});
