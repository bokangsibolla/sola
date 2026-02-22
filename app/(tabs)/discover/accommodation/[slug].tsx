// app/(tabs)/discover/accommodation/[slug].tsx
import { useCallback, useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import { eventTracker } from '@/data/events/eventTracker';
import { colors, spacing } from '@/constants/design';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import {
  getAccommodationWithDetails,
  isPlaceSaved,
} from '@/data/api';
import { SaveSheet } from '@/components/trips/SaveSheet/SaveSheet';
import ErrorScreen from '@/components/ErrorScreen';
import NavigationHeader from '@/components/NavigationHeader';
import { useNavContext } from '@/hooks/useNavContext';
import { AccommodationHero } from '@/components/explore/accommodation/AccommodationHero';
import { PositioningSummary } from '@/components/explore/accommodation/PositioningSummary';
import { QuickTags } from '@/components/explore/accommodation/QuickTags';
import { WhyWomenChoose } from '@/components/explore/accommodation/WhyWomenChoose';
import { WhatStandsOut } from '@/components/explore/activity/WhatStandsOut';
import { GoodToKnow } from '@/components/explore/activity/GoodToKnow';
import { AccommodationPractical } from '@/components/explore/accommodation/AccommodationPractical';
import { LocationContext } from '@/components/explore/accommodation/LocationContext';
import { StickyBottomCTA } from '@/components/explore/accommodation/StickyBottomCTA';
import { AccommodationSkeleton } from '@/components/explore/accommodation/AccommodationSkeleton';

export default function AccommodationDetailScreen() {
  const posthog = usePostHog();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { userId } = useAuth();
  const insets = useSafeAreaInsets();

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const { data, loading, error, refetch } = useData(
    () => (slug ? getAccommodationWithDetails(slug) : Promise.resolve(undefined)),
    ['accommodationDetail', slug ?? ''],
  );

  const accommodation = data?.accommodation;
  const media = data?.media ?? [];
  const tags = data?.tags ?? [];
  const city = data?.city;
  const country = data?.country;

  // Save state
  const { data: isSavedFromDb } = useData(
    () =>
      userId && accommodation?.id
        ? isPlaceSaved(userId, accommodation.id)
        : Promise.resolve(false),
    ['accommodationSaved', userId, accommodation?.id],
  );
  const [saved, setSaved] = useState(false);
  const [showSaveSheet, setShowSaveSheet] = useState(false);

  useEffect(() => {
    if (isSavedFromDb != null) setSaved(isSavedFromDb);
  }, [isSavedFromDb]);

  // ---------------------------------------------------------------------------
  // Analytics
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (accommodation?.id) {
      posthog.capture('accommodation_detail_viewed', {
        accommodation_id: accommodation.id,
        accommodation_name: accommodation.name,
        place_type: accommodation.placeType,
        city: city?.name ?? null,
        country: country?.name ?? null,
      });
      eventTracker.track('viewed_place', 'place', accommodation.id);
    }
  }, [accommodation?.id]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const canSave = Boolean(userId && accommodation?.id);

  const handleSave = useCallback(() => {
    if (!userId || !accommodation?.id) return;
    posthog.capture('accommodation_save_sheet_opened', { accommodation_id: accommodation.id });
    setShowSaveSheet(true);
  }, [userId, accommodation?.id, posthog]);

  const handleOpenMaps = useCallback(() => {
    if (!accommodation) return;
    const url =
      accommodation.googleMapsUrl ||
      (accommodation.lat && accommodation.lng
        ? `https://www.google.com/maps/search/?api=1&query=${accommodation.lat},${accommodation.lng}`
        : accommodation.googlePlaceId
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(accommodation.name)}&query_place_id=${accommodation.googlePlaceId}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(accommodation.name + ' ' + (accommodation.address || ''))}`);

    posthog.capture('accommodation_maps_opened', {
      accommodation_id: accommodation.id,
      accommodation_name: accommodation.name,
    });
    Linking.openURL(url);
  }, [accommodation, posthog]);

  // ---------------------------------------------------------------------------
  // Navigation context
  // ---------------------------------------------------------------------------

  const fallbackCrumbs = [
    { label: 'Discover', path: '/(tabs)/discover' },
    ...(country ? [{ label: country.name, path: `/(tabs)/discover/country/${country.slug}` }] : []),
    ...(city ? [{ label: city.name, path: `/(tabs)/discover/city/${city.slug}` }] : []),
  ];

  const { parentTitle, ancestors, handleBack } = useNavContext({
    title: accommodation?.name ?? 'Accommodation',
    path: `/(tabs)/discover/accommodation/${slug}`,
    fallbackCrumbs,
  });

  // ---------------------------------------------------------------------------
  // Render states
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <NavigationHeader title="Loading\u2026" parentTitle={parentTitle ?? 'Discover'} onBack={handleBack} />
        <AccommodationSkeleton />
      </SafeAreaView>
    );
  }

  if (error) {
    return <ErrorScreen message={error.message} onRetry={refetch} />;
  }

  if (!accommodation) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <NavigationHeader title="Accommodation" parentTitle={parentTitle ?? 'Discover'} onBack={handleBack} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Accommodation not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Bottom CTA height for spacer
  const CTA_HEIGHT = 70 + insets.bottom + spacing.sm;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <NavigationHeader
        title={accommodation.name}
        parentTitle={parentTitle ?? city?.name ?? 'Discover'}
        ancestors={ancestors}
        onBack={handleBack}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 1. Hero: Carousel + gradient overlay + identity */}
        <AccommodationHero
          accommodation={accommodation}
          media={media}
          cityName={city?.name}
          countryName={country?.name}
          saved={saved}
          onSave={handleSave}
          canSave={canSave}
        />

        {/* Sections with padding */}
        <View style={styles.content}>
          {/* 2. Positioning Summary */}
          <PositioningSummary text={accommodation.positioningSummary} />

          {/* 3. Quick Tags — animated pill selector */}
          <QuickTags tags={tags} />

          {/* 4. Why Women Choose This */}
          <WhyWomenChoose text={accommodation.whyWomenChoose} />

          {/* 5. What Stands Out (reused from activity) */}
          <WhatStandsOut highlights={accommodation.highlights ?? []} />

          {/* 6. Good to Know (reused from activity) */}
          <GoodToKnow considerations={accommodation.considerations ?? []} />

          {/* 7. Practical Details + Map */}
          <AccommodationPractical
            accommodation={accommodation}
            onOpenMaps={handleOpenMaps}
          />

          {/* 8. Neighborhood */}
          <LocationContext text={accommodation.locationContext} />
        </View>

        {/* Bottom spacer for sticky CTA */}
        <View style={{ height: CTA_HEIGHT + spacing.xl }} />
      </ScrollView>

      {/* Sticky bottom CTA — outside ScrollView */}
      <StickyBottomCTA
        saved={saved}
        canSave={canSave}
        onSave={handleSave}
        onOpenMaps={handleOpenMaps}
      />

      {/* Save to trip / collection sheet */}
      {userId && accommodation?.id && (
        <SaveSheet
          visible={showSaveSheet}
          onClose={() => setShowSaveSheet(false)}
          entityType="place"
          entityId={accommodation.id}
          entityName={accommodation.name}
          userId={userId}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.screenX,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    color: colors.textMuted,
  },
});
