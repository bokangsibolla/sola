// app/(tabs)/discover/accommodation/[slug].tsx
import { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import { eventTracker } from '@/data/events/eventTracker';
import { colors, fonts, radius, spacing } from '@/constants/design';
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
import { OurTake } from '@/components/explore/activity/OurTake';
import { WomenRecommend } from '@/components/explore/activity/WomenRecommend';
import { WhatStandsOut } from '@/components/explore/activity/WhatStandsOut';
import { GoodToKnow } from '@/components/explore/activity/GoodToKnow';
import { AccommodationPractical } from '@/components/explore/accommodation/AccommodationPractical';
import { LocationContext } from '@/components/explore/accommodation/LocationContext';
import { AccommodationSkeleton } from '@/components/explore/accommodation/AccommodationSkeleton';

export default function AccommodationDetailScreen() {
  const posthog = usePostHog();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { userId } = useAuth();

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
          tags={tags}
          cityName={city?.name}
          countryName={country?.name}
          saved={saved}
          onSave={handleSave}
          canSave={canSave}
        />

        {/* Sections with padding */}
        <View style={styles.content}>
          {/* 2. About / Positioning — fall back to description */}
          <PositioningSummary text={accommodation.positioningSummary ?? accommodation.description} />

          {/* 3. Quick Tags — animated pill selector (hidden if < 3 tags) */}
          <QuickTags tags={tags} />

          {/* 4. Our Take — editorial why_selected */}
          <OurTake bullets={[]} fallbackText={accommodation.whySelected} label="OUR TAKE" />

          {/* 5. Why Women Choose This — fall back to solo_female_reviews */}
          <WhyWomenChoose text={accommodation.whyWomenChoose} />

          {/* 5b. Women's Reviews — if whyWomenChoose is empty, show solo_female_reviews */}
          {!accommodation.whyWomenChoose && (
            <WomenRecommend
              text={accommodation.soloFemaleReviews}
              label="FROM WOMEN WHO'VE STAYED HERE"
            />
          )}

          {/* 6. What Stands Out */}
          <WhatStandsOut highlights={accommodation.highlights ?? []} />

          {/* 7. Good to Know */}
          <GoodToKnow considerations={accommodation.considerations ?? []} />

          {/* 8. Practical Details + Map */}
          <AccommodationPractical
            accommodation={accommodation}
            onOpenMaps={handleOpenMaps}
          />

          {/* 9. Neighborhood */}
          <LocationContext text={accommodation.locationContext} />

          {/* 10. Action buttons — inline at bottom */}
          <View style={styles.actionRow}>
            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              style={[
                styles.actionBtn,
                styles.saveBtn,
                saved && styles.saveBtnSaved,
                !canSave && styles.actionBtnDisabled,
              ]}
            >
              <Ionicons
                name={saved ? 'checkmark-circle' : 'add-circle-outline'}
                size={18}
                color={colors.background}
              />
              <Text style={styles.saveBtnText}>
                {!canSave ? 'Sign in' : saved ? 'Saved' : 'Add to Trip'}
              </Text>
            </Pressable>

            <Pressable onPress={handleOpenMaps} style={[styles.actionBtn, styles.mapsBtn]}>
              <Ionicons name="map-outline" size={18} color={colors.textPrimary} />
              <Text style={styles.mapsBtnText}>Maps</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: spacing.xxxxl }} />
      </ScrollView>

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
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  saveBtn: {
    backgroundColor: colors.orange,
  },
  saveBtnSaved: {
    backgroundColor: colors.greenSoft,
  },
  actionBtnDisabled: {
    backgroundColor: colors.textMuted,
  },
  saveBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.background,
  },
  mapsBtn: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  mapsBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
