// app/(tabs)/discover/activity/[slug].tsx
import { useCallback, useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import * as Sentry from '@sentry/react-native';
import { eventTracker } from '@/data/events/eventTracker';
import { colors, spacing } from '@/constants/design';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import {
  getActivityWithDetails,
  isPlaceSaved,
  toggleSavePlace,
} from '@/data/api';
import ErrorScreen from '@/components/ErrorScreen';
import NavigationHeader from '@/components/NavigationHeader';
import { useNavContext } from '@/hooks/useNavContext';
import { ActivityHero } from '@/components/explore/activity/ActivityHero';
import { AtAGlance } from '@/components/explore/activity/AtAGlance';
import { WomenRecommend } from '@/components/explore/activity/WomenRecommend';
import { OurTake } from '@/components/explore/activity/OurTake';
import { WhatStandsOut } from '@/components/explore/activity/WhatStandsOut';
import { GoodToKnow } from '@/components/explore/activity/GoodToKnow';
import { TagsSection } from '@/components/explore/activity/TagsSection';
import { PracticalDetails } from '@/components/explore/activity/PracticalDetails';
import { ActivitySkeleton } from '@/components/explore/activity/ActivitySkeleton';

export default function ActivityDetailScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { userId } = useAuth();

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const { data, loading, error, refetch } = useData(
    () => (slug ? getActivityWithDetails(slug) : Promise.resolve(undefined)),
    ['activityDetail', slug ?? ''],
  );

  const activity = data?.activity;
  const media = data?.media ?? [];
  const tags = data?.tags ?? [];
  const city = data?.city;
  const country = data?.country;

  // Save state
  const { data: isSavedFromDb } = useData(
    () =>
      userId && activity?.id
        ? isPlaceSaved(userId, activity.id)
        : Promise.resolve(false),
    ['activitySaved', userId, activity?.id],
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isSavedFromDb != null) setSaved(isSavedFromDb);
  }, [isSavedFromDb]);

  // ---------------------------------------------------------------------------
  // Analytics
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (activity?.id) {
      posthog.capture('activity_detail_viewed', {
        activity_id: activity.id,
        activity_name: activity.name,
        city: city?.name ?? null,
        country: country?.name ?? null,
      });
      eventTracker.track('viewed_place', 'place', activity.id);
    }
  }, [activity?.id]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const canSave = Boolean(userId && activity?.id);

  const handleSave = useCallback(async () => {
    if (!userId || !activity?.id) return;
    const newSaved = !saved;
    setSaved(newSaved);
    posthog.capture(newSaved ? 'activity_saved' : 'activity_unsaved', {
      activity_id: activity.id,
    });
    try {
      await toggleSavePlace(userId, activity.id);
    } catch (err) {
      setSaved(saved);
      Sentry.captureException(err);
    }
  }, [userId, activity?.id, saved, posthog]);

  const handleOpenMaps = useCallback(() => {
    if (!activity) return;
    const url =
      activity.googleMapsUrl ||
      (activity.lat && activity.lng
        ? `https://www.google.com/maps/search/?api=1&query=${activity.lat},${activity.lng}`
        : activity.googlePlaceId
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.name)}&query_place_id=${activity.googlePlaceId}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.name + ' ' + (activity.address || ''))}`);

    posthog.capture('activity_maps_opened', {
      activity_id: activity.id,
      activity_name: activity.name,
    });
    Linking.openURL(url);
  }, [activity, posthog]);

  // ---------------------------------------------------------------------------
  // Navigation context
  // ---------------------------------------------------------------------------

  const fallbackCrumbs = [
    { label: 'Discover', path: '/(tabs)/discover' },
    ...(country ? [{ label: country.name, path: `/(tabs)/discover/country/${country.slug}` }] : []),
    ...(city ? [{ label: city.name, path: `/(tabs)/discover/city/${city.slug}` }] : []),
  ];

  const { parentTitle, ancestors, handleBack } = useNavContext({
    title: activity?.name ?? 'Activity',
    path: `/(tabs)/discover/activity/${slug}`,
    fallbackCrumbs,
  });

  // ---------------------------------------------------------------------------
  // Render states
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <NavigationHeader title="Loading…" parentTitle={parentTitle ?? 'Discover'} onBack={handleBack} />
        <ActivitySkeleton />
      </SafeAreaView>
    );
  }

  if (error) {
    return <ErrorScreen message={error.message} onRetry={refetch} />;
  }

  if (!activity) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <NavigationHeader title="Activity" parentTitle={parentTitle ?? 'Discover'} onBack={handleBack} />
        <View style={styles.emptyState}>
          <SolaText variant="body" color={colors.textMuted}>Activity not found</SolaText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <NavigationHeader
        title={activity.name}
        parentTitle={parentTitle ?? city?.name ?? 'Discover'}
        ancestors={ancestors}
        onBack={handleBack}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 1. Hero: Carousel + identity + signal tags */}
        <ActivityHero
          activity={activity}
          media={media}
          cityName={city?.name}
          countryName={country?.name}
          tags={tags}
        />

        {/* Sections with padding */}
        <View style={styles.content}>
          {/* 2. At a Glance */}
          <AtAGlance activity={activity} />

          {/* 3. From Women Who've Done This */}
          <WomenRecommend text={activity.soloFemaleReviews} />

          {/* 4. Why We Include This */}
          <OurTake
            bullets={activity.ourTakeBullets ?? []}
            fallbackText={activity.whySelected}
          />

          {/* 5. What Stands Out */}
          <WhatStandsOut highlights={activity.highlights ?? []} />

          {/* 6. Good to Know */}
          <GoodToKnow considerations={activity.considerations ?? []} />

          {/* 7. Tags (grouped + color-coded) */}
          <TagsSection tags={tags} />

          {/* 8. Practical Details + Actions */}
          <PracticalDetails
            activity={activity}
            onSave={handleSave}
            onOpenMaps={handleOpenMaps}
            saved={saved}
            canSave={canSave}
          />
        </View>

        {/* Bottom spacing */}
        <View style={{ height: spacing.xxxxl }} />
      </ScrollView>
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
  emptyText: {},
});
