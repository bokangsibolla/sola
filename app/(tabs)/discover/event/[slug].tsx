// app/(tabs)/discover/event/[slug].tsx
import { useEffect } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { useData } from '@/hooks/useData';
import { getEventBySlug, getMoreEventsInCity } from '@/data/api';
import ErrorScreen from '@/components/ErrorScreen';
import LoadingScreen from '@/components/LoadingScreen';
import NavigationHeader from '@/components/NavigationHeader';
import { useNavContext } from '@/hooks/useNavContext';
import { EventCard } from '@/components/explore/EventCard';
import { FLOATING_TAB_BAR_HEIGHT } from '@/components/TabBar';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const EVENT_TYPE_LABELS: Record<string, string> = {
  festival: 'Festival',
  holiday: 'Holiday',
  seasonal: 'Seasonal',
  parade: 'Parade',
  conference: 'Conference',
  sports: 'Sports',
};

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function EventDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const posthog = usePostHog();

  // ---------------------------------------------------------------------------
  // Data
  // ---------------------------------------------------------------------------

  const { data: event, loading, error, refetch } = useData(
    () => (slug ? getEventBySlug(slug) : Promise.resolve(null)),
    ['eventDetail', slug ?? ''],
  );

  const { data: moreEvents } = useData(
    () =>
      event?.id && event?.cityId
        ? getMoreEventsInCity(event.cityId, event.id, 4)
        : Promise.resolve([]),
    ['moreEventsInCity', event?.cityId ?? '', event?.id ?? ''],
  );

  // ---------------------------------------------------------------------------
  // Analytics
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (event?.id) {
      posthog.capture('event_detail_viewed', {
        event_id: event.id,
        event_name: event.name,
        event_type: event.eventType,
        city: event.cityName,
        country: event.countryName,
      });
    }
  }, [event?.id]);

  // ---------------------------------------------------------------------------
  // Navigation context
  // ---------------------------------------------------------------------------

  const fallbackCrumbs = [
    { label: 'Discover', path: '/(tabs)/discover' },
    ...(event?.countrySlug
      ? [{ label: event.countryName, path: `/(tabs)/discover/country/${event.countrySlug}` }]
      : []),
    ...(event?.citySlug
      ? [{ label: event.cityName, path: `/(tabs)/discover/city/${event.citySlug}` }]
      : []),
  ];

  const { parentTitle, ancestors, handleBack } = useNavContext({
    title: event?.name ?? 'Event',
    path: `/(tabs)/discover/event/${slug}`,
    fallbackCrumbs,
  });

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------

  const dateLabel = event
    ? event.specificDates
      ? event.specificDates
      : event.startMonth === event.endMonth
        ? MONTH_LABELS[event.startMonth - 1]
        : `${MONTH_LABELS[event.startMonth - 1]} \u2013 ${MONTH_LABELS[event.endMonth - 1]}`
    : '';

  // ---------------------------------------------------------------------------
  // Render states
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <NavigationHeader title="Loading\u2026" parentTitle={parentTitle ?? 'Discover'} onBack={handleBack} />
        <LoadingScreen />
      </SafeAreaView>
    );
  }

  if (error) {
    return <ErrorScreen message={error.message} onRetry={refetch} />;
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <NavigationHeader title="Event" parentTitle={parentTitle ?? 'Discover'} onBack={handleBack} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <NavigationHeader
        title={event.name}
        parentTitle={parentTitle ?? event.cityName ?? 'Discover'}
        ancestors={ancestors}
        onBack={handleBack}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 1. Hero image or placeholder */}
        {event.heroImageUrl ? (
          <Image
            source={{ uri: event.heroImageUrl }}
            style={styles.hero}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.hero, styles.heroPlaceholder]}>
            <Text style={styles.heroEmoji}>
              {event.eventType === 'festival' ? '\uD83C\uDF89' : event.eventType === 'holiday' ? '\uD83C\uDF1F' : '\uD83C\uDF0D'}
            </Text>
          </View>
        )}

        <View style={styles.content}>
          {/* 2. Type label */}
          <Text style={styles.typeLabel}>
            {(EVENT_TYPE_LABELS[event.eventType] ?? event.eventType).toUpperCase()}
          </Text>

          {/* 3. Event name */}
          <Text style={styles.eventName}>{event.name}</Text>

          {/* 4. City / Country link */}
          <Pressable
            onPress={() => router.push(`/(tabs)/discover/city/${event.citySlug}` as any)}
            style={styles.locationRow}
          >
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.locationText}>
              {event.cityName}, {event.countryName}
            </Text>
          </Pressable>

          {/* 5. Info pills row */}
          <View style={styles.pillsRow}>
            <View style={styles.pill}>
              <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
              <Text style={styles.pillText}>{dateLabel}</Text>
            </View>
            <View style={[styles.pill, event.isFree ? styles.pillGreen : undefined]}>
              <Text style={[styles.pillText, event.isFree ? styles.pillTextGreen : undefined]}>
                {event.isFree ? 'Free' : 'Paid'}
              </Text>
            </View>
            {event.crowdLevel && (
              <View style={styles.pill}>
                <Ionicons name="people-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.pillText}>
                  {event.crowdLevel.charAt(0).toUpperCase() + event.crowdLevel.slice(1)} crowds
                </Text>
              </View>
            )}
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {event.recurrence === 'annual' ? 'Annual' : 'One-time'}
              </Text>
            </View>
          </View>

          {/* 6. Description */}
          {event.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this event</Text>
              <Text style={styles.descriptionText}>{event.description}</Text>
            </View>
          )}

          {/* 7. Solo tip card */}
          {event.soloTip && (
            <View style={styles.soloTipCard}>
              <View style={styles.soloTipHeader}>
                <Ionicons name="shield-checkmark" size={16} color={colors.greenSoft} />
                <Text style={styles.soloTipLabel}>SOLO TIP</Text>
              </View>
              <Text style={styles.soloTipText}>{event.soloTip}</Text>
            </View>
          )}

          {/* 8. Visit website CTA */}
          {event.websiteUrl && (
            <Pressable
              onPress={() => Linking.openURL(event.websiteUrl!)}
              style={({ pressed }) => [styles.websiteCta, pressed && styles.websiteCtaPressed]}
            >
              <Ionicons name="globe-outline" size={18} color={colors.background} />
              <Text style={styles.websiteCtaText}>Visit website</Text>
            </Pressable>
          )}

          {/* 9. More events in this city */}
          {moreEvents && moreEvents.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>More events in {event.cityName}</Text>
              {moreEvents.map((e) => (
                <EventCard
                  key={e.id}
                  event={e}
                  onPress={() => router.push(`/(tabs)/discover/event/${e.slug}` as any)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Bottom spacing for floating tab bar */}
        <View style={{ height: FLOATING_TAB_BAR_HEIGHT + spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    width: '100%',
    height: 300,
  },
  heroPlaceholder: {
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 64,
  },
  content: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
  },
  typeLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.orange,
    marginBottom: spacing.xs,
  },
  eventName: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  locationText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.neutralFill,
  },
  pillGreen: {
    backgroundColor: colors.greenFill,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  pillTextGreen: {
    color: colors.greenSoft,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  descriptionText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  soloTipCard: {
    backgroundColor: colors.greenFill,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  soloTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  soloTipLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.greenSoft,
  },
  soloTipText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.greenSoft,
  },
  websiteCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.orange,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
  },
  websiteCtaPressed: {
    opacity: 0.9,
  },
  websiteCtaText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.background,
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
});
