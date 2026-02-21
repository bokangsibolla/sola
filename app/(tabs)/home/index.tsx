import { useEffect, useMemo, useRef } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { usePostHog } from 'posthog-react-native';
import { useRouter } from 'expo-router';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import AvatarButton from '@/components/AvatarButton';
import { HeroCard } from '@/components/home/HeroCard';
import { SearchPill } from '@/components/home/SearchPill';
import { TripCard } from '@/components/home/TripCard';
import { PersonalizedCarousel } from '@/components/home/PersonalizedCarousel';
import VibeSection from '@/components/home/VibeSection';
import { CommunityCards } from '@/components/home/CommunityCards';
import { QuickUpdate } from '@/components/home/QuickUpdate';
import { QuickLinksRow } from '@/components/home/QuickLinksRow';
import { SavedPreview } from '@/components/home/SavedPreview';
import { EndCard } from '@/components/home/EndCard';
import { useHomeData } from '@/data/home/useHomeData';
import { useHomeMoodboard, VIBE_SECTIONS } from '@/data/home/useHomeMoodboard';
import { colors, spacing } from '@/constants/design';
import { FLOATING_TAB_BAR_HEIGHT } from '@/components/TabBar';

// Pick 2 random vibe indices per mount — stable for the session
function pickRandomVibes(): number[] {
  const indices = VIBE_SECTIONS.map((_, i) => i);
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;
  }
  return indices.slice(0, 2);
}

export default function HomeScreen() {
  const posthog = usePostHog();
  const router = useRouter();

  useEffect(() => {
    posthog.capture('home_viewed');
  }, [posthog]);

  // Home data
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

  // Moodboard vibes
  const {
    sections: vibeSections,
    loading: vibesLoading,
    refetch: refetchVibes,
  } = useHomeMoodboard();

  // Pick 2 random vibes per mount
  const vibeIndicesRef = useRef(pickRandomVibes());
  const selectedVibes = vibeIndicesRef.current
    .map((i) => vibeSections[i])
    .filter(Boolean);

  // Determine if we need a secondary TripCard
  const secondaryTrip = useMemo(() => {
    if (heroState.kind === 'active' && heroState.nextUpcoming) {
      return {
        trip: heroState.nextUpcoming,
        savedItemCount: 0,
        cityImageUrl: null as string | null,
        status: 'upcoming' as const,
      };
    }
    return null;
  }, [heroState]);

  const handleRefresh = () => {
    refetch();
    refetchVibes();
  };

  return (
    <AppScreen>
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
            refreshing={loading || vibesLoading}
            onRefresh={handleRefresh}
            tintColor={colors.orange}
          />
        }
      >
        {/* 1. SearchPill — personalized "Where to, Name?" */}
        <View style={styles.searchWrap}>
          <SearchPill firstName={firstName} />
        </View>

        {/* 2. HeroCard — compact state-aware card */}
        <View style={styles.sectionWrap}>
          <HeroCard hero={heroState} />
        </View>

        {/* 3. TripCard — secondary trip (conditional) */}
        {secondaryTrip && (
          <TripCard
            trip={secondaryTrip.trip}
            savedItemCount={secondaryTrip.savedItemCount}
            cityImageUrl={secondaryTrip.cityImageUrl}
            status={secondaryTrip.status}
          />
        )}

        {/* 4. Saved Preview — Airbnb-style shortlist */}
        <SavedPreview places={savedPlaces} />

        {/* 5. PersonalizedCarousel — compact city cards */}
        <PersonalizedCarousel cities={personalizedCities} />

        {/* 6–7. VibeSection x2 — image grids from moodboard */}
        {selectedVibes.map((vibe) => (
          <VibeSection
            key={vibe.config.id}
            title={vibe.config.title}
            cities={vibe.cities}
            countries={vibe.countries}
            activities={vibe.activities}
          />
        ))}

        {/* 8. CommunityCards — threads with destination images */}
        <CommunityCards threads={communityHighlights} />

        {/* 9. QuickUpdate — travel advisory (conditional) */}
        <QuickUpdate update={travelUpdate} />

        {/* 10. Dashboard tiles — Safety / Browse / Community */}
        <QuickLinksRow
          activeTripId={
            heroState.kind === 'active' || heroState.kind === 'upcoming'
              ? heroState.trip.id
              : null
          }
        />

        {/* 11. EndCard — image CTA */}
        <EndCard onExplore={() => router.push('/(tabs)/discover' as any)} />

      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: FLOATING_TAB_BAR_HEIGHT,
  },
  searchWrap: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  sectionWrap: {
    marginBottom: spacing.xl,
  },
});
