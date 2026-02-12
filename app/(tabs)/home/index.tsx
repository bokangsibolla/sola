import { useEffect, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { usePostHog } from 'posthog-react-native';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import MenuButton from '@/components/MenuButton';
import { PlanTripCard, TripStatusCard } from '@/components/home/HeroBanner';
import SavedCollectionsRow from '@/components/home/SavedCollectionsRow';
import WhileInSection from '@/components/home/WhileInSection';
import CommunityHighlights from '@/components/home/CommunityHighlights';
import InspirationSection from '@/components/home/InspirationSection';
import { useHomeDashboard } from '@/data/home/useHomeDashboard';
import { formatDateShort } from '@/data/trips/helpers';
import { colors, spacing } from '@/constants/design';

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function HomeScreen() {
  const posthog = usePostHog();
  const {
    hasTrip,
    activeTrip,
    daysAway,
    heroCityImage,
    savedPlaces,
    collections,
    totalSavedCount,
    tripSavedItems,
    destinationSuggestions,
    totalUnread,
    communityHighlights,
    inspirationItems,
    inspirationReason,
    loading,
    refetchAll,
  } = useHomeDashboard();

  useEffect(() => {
    posthog.capture('home_dashboard_viewed', { has_trip: hasTrip });
  }, [posthog, hasTrip]);

  // Build trip dates string
  const tripDates = useMemo(() => {
    if (!activeTrip?.arriving) return undefined;
    const start = formatDateShort(activeTrip.arriving);
    const end = activeTrip.leaving ? formatDateShort(activeTrip.leaving) : '';
    return end ? `${start} – ${end}` : start;
  }, [activeTrip?.arriving, activeTrip?.leaving]);

  // Build trip destination string (multi-stop aware)
  const tripDestination = useMemo(() => {
    if (!activeTrip) return '';
    const stops = activeTrip.stops;
    if (stops.length > 1) {
      return stops
        .map((s) => s.cityName || '')
        .filter(Boolean)
        .join(' \u2192 ');
    }
    return activeTrip.destinationName || stops[0]?.cityName || '';
  }, [activeTrip]);

  // Extract saved place image URLs for collection grid
  const savedPlaceImages = useMemo(
    () => savedPlaces.slice(0, 4).map((p) => p.imageUrl).filter(Boolean) as string[],
    [savedPlaces],
  );

  return (
    <AppScreen>
      <AppHeader
        title=""
        leftComponent={
          <Image
            source={require('@/assets/images/sola-logo.png')}
            style={styles.headerLogo}
            contentFit="contain"
          />
        }
        rightComponent={<MenuButton unreadCount={totalUnread} />}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetchAll} tintColor={colors.orange} />
        }
      >
        {/* Hero — Trip status or Plan CTA */}
        {hasTrip && activeTrip ? (
          <TripStatusCard
            tripId={activeTrip.id}
            tripTitle={activeTrip.title ?? tripDestination}
            destination={tripDestination}
            dates={tripDates}
            daysAway={daysAway}
            isActive={activeTrip.status === 'active'}
            imageUrl={heroCityImage?.imageUrl}
          />
        ) : (
          <PlanTripCard cityImageUrl={heroCityImage?.imageUrl} />
        )}

        {/* Things to Do — trip state only */}
        {hasTrip && activeTrip && (tripSavedItems.length > 0 || destinationSuggestions.length > 0) && (
          <View style={styles.section}>
            <WhileInSection
              cityName={activeTrip.destinationName || activeTrip.stops[0]?.cityName || ''}
              tripId={activeTrip.id}
              savedItems={tripSavedItems}
              suggestions={destinationSuggestions}
            />
          </View>
        )}

        {/* You might like — destination suggestions with images */}
        {inspirationItems.length > 0 && (
          <View style={styles.section}>
            <InspirationSection items={inspirationItems} reason={inspirationReason} />
          </View>
        )}

        {/* Saved Collections */}
        {totalSavedCount > 0 && (
          <View style={styles.section}>
            <SavedCollectionsRow
              totalSaved={totalSavedCount}
              collections={collections}
              savedPlaceImages={savedPlaceImages}
              tripCityName={
                hasTrip
                  ? activeTrip?.destinationName || activeTrip?.stops[0]?.cityName || null
                  : null
              }
            />
          </View>
        )}

        {/* Community — 2 posts with body preview */}
        {communityHighlights.length > 0 && (
          <View style={styles.section}>
            <CommunityHighlights highlights={communityHighlights} />
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl,
  },

  headerLogo: {
    height: 22,
    width: 76,
  },

  section: {
    marginTop: spacing.xl,
  },

  bottomSpacer: {
    height: spacing.xxl,
  },
});
