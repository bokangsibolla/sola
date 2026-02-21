import { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { usePostHog } from 'posthog-react-native';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import AvatarButton from '@/components/AvatarButton';
import { DashboardHeader } from '@/components/home/DashboardHeader';
import { HeroModule } from '@/components/home/HeroModule';
import { SavedShortlist } from '@/components/home/SavedShortlist';
import { DestinationCarousel } from '@/components/home/DestinationCarousel';
import { CommunityPeek } from '@/components/home/CommunityPeek';
import { QuickActionsGrid } from '@/components/home/QuickActionsGrid';
import { useHomeData } from '@/data/home/useHomeData';
import { colors, spacing } from '@/constants/design';
import { FLOATING_TAB_BAR_HEIGHT } from '@/components/TabBar';

export default function HomeScreen() {
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture('home_viewed');
  }, [posthog]);

  const {
    firstName,
    heroState,
    personalizedCities,
    travelUpdate,
    communityHighlights,
    savedPlaces,
    loading,
    refetch,
  } = useHomeData();

  const activeTripId =
    heroState.kind === 'active' || heroState.kind === 'upcoming'
      ? heroState.trip.id
      : null;

  return (
    <AppScreen style={styles.screen}>
      <NavigationHeader
        title="Home"
        showLogo
        rightActions={<AvatarButton />}
      />

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
        {/* 1. Dashboard Header — greeting + contextual line + search */}
        <DashboardHeader
          firstName={firstName}
          heroState={heroState}
          savedCount={savedPlaces.length}
        />

        {/* 2. Hero Module — trip state or featured destination */}
        <HeroModule hero={heroState} travelUpdate={travelUpdate} />

        {/* 3. Saved Shortlist — conditional */}
        <SavedShortlist places={savedPlaces} />

        {/* 4. Destinations — horizontal carousel */}
        <DestinationCarousel cities={personalizedCities} />

        {/* 5. Community Peek — 2 text-only thread cards */}
        <CommunityPeek threads={communityHighlights} />

        {/* 6. Quick Actions — 2x2 grid */}
        <QuickActionsGrid activeTripId={activeTripId} />

        {/* Bottom spacing for floating tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surfacePage,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  bottomSpacer: {
    height: FLOATING_TAB_BAR_HEIGHT,
  },
});
