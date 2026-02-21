import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { getCityById } from '@/data/api';
import { useTripDetail } from '@/data/trips/useTripDetail';
import { useTripItinerary } from '@/data/trips/useItinerary';
import { deleteTrip } from '@/data/trips/tripApi';
import { generateDaysFromTrip } from '@/data/trips/itineraryApi';
import { formatDateShort, getFlag, tripDayNumber, STATUS_COLORS } from '@/data/trips/helpers';
import { useData } from '@/hooks/useData';
import type { TripDayWithBlocks } from '@/data/trips/itineraryTypes';

import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import NavigationHeader from '@/components/NavigationHeader';
import { TripMetaPills } from '@/components/trips/TripMetaPills';
import { DayOverviewCard } from '@/components/trips/DayOverviewCard';

import { colors, fonts, spacing, radius } from '@/constants/design';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Existing trip data
  const { trip, loading: tripLoading, error: tripError, refetchAll } = useTripDetail(id);

  // Itinerary data
  const { itinerary, loading: itinLoading, refetch: refetchItinerary } = useTripItinerary(id);

  const [showMenu, setShowMenu] = useState(false);
  const [generating, setGenerating] = useState(false);

  // City for hero image
  const tripStops = trip?.stops ?? [];
  const firstStop = tripStops[0];
  const { data: city } = useData(
    () => (firstStop?.cityId ? getCityById(firstStop.cityId) : Promise.resolve(null)),
    [firstStop?.cityId],
  );
  const heroUrl = city?.heroImageUrl ?? trip?.coverImageUrl ?? null;

  useFocusEffect(
    useCallback(() => {
      refetchAll();
      refetchItinerary();
    }, [refetchAll, refetchItinerary]),
  );

  // Delete handler
  const handleDelete = () => {
    Alert.alert(
      'Delete trip',
      'This will permanently delete this trip and all its entries. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!trip) return;
            await deleteTrip(trip.id);
            router.back();
          },
        },
      ],
    );
  };

  // Generate days handler
  const handleGenerateDays = async () => {
    if (!trip) return;
    setGenerating(true);
    try {
      await generateDaysFromTrip(trip.id);
      refetchItinerary();
    } finally {
      setGenerating(false);
    }
  };

  if (tripLoading || itinLoading) return <LoadingScreen />;
  if (tripError) return <ErrorScreen message={tripError.message} onRetry={refetchAll} />;

  if (!trip) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <NavigationHeader title="Trip" parentTitle="Trips" />
        <Text style={styles.notFound}>Trip not found</Text>
      </View>
    );
  }

  // Computed values
  const flag = getFlag(trip.countryIso2);
  const dayNum = tripDayNumber(trip);
  const stops = trip.stops ?? [];
  const stopsText =
    stops.length > 1
      ? stops.map((s) => s.cityName || s.countryIso2).join(' \u2192 ')
      : trip.destinationName;
  const dateText =
    trip.arriving && trip.leaving
      ? `${formatDateShort(trip.arriving)} \u2014 ${formatDateShort(trip.leaving)}`
      : 'Flexible dates';
  const statusStyle = STATUS_COLORS[trip.status] ?? STATUS_COLORS.draft;

  const days: TripDayWithBlocks[] = itinerary?.days ?? [];
  const hasDays = days.length > 0;
  const hasDates = !!(trip.arriving && trip.leaving);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Navigation */}
      <NavigationHeader
        title="Trip"
        parentTitle="Trips"
        rightActions={
          <Pressable onPress={() => setShowMenu(!showMenu)} hitSlop={12}>
            <Ionicons name="ellipsis-horizontal" size={24} color={colors.textPrimary} />
          </Pressable>
        }
      />

      {/* Overflow menu */}
      {showMenu && (
        <View style={styles.menu}>
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              handleDelete();
            }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.emergency} />
            <Text style={[styles.menuItemText, { color: colors.emergency }]}>Delete trip</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={days}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxxxl }}
        ListHeaderComponent={
          <>
            {/* Hero header */}
            <View style={styles.heroContainer}>
              {heroUrl ? (
                <Image
                  source={{ uri: heroUrl }}
                  style={styles.heroImage}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={[styles.heroImage, styles.heroPlaceholder]} />
              )}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.65)']}
                style={styles.gradient}
              />
              <View style={styles.overlay}>
                <View style={styles.statusRow}>
                  <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {statusStyle.label}
                      {dayNum ? ` \u00B7 Day ${dayNum}` : ''}
                    </Text>
                  </View>
                </View>
                <Text style={styles.heroTitle} numberOfLines={1}>
                  {trip.title || trip.destinationName}
                </Text>
                <Text style={styles.heroSubtitle} numberOfLines={1}>
                  {flag} {stopsText} \u00B7 {trip.nights} {trip.nights === 1 ? 'night' : 'nights'}
                </Text>
              </View>
            </View>

            {/* Meta pills */}
            <TripMetaPills
              dateRange={dateText}
              dayCount={days.length}
              placeCount={itinerary?.totalPlaces ?? 0}
              budget={trip.budgetTotal ?? null}
              currency={trip.currency ?? 'USD'}
            />

            {/* Itinerary section header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Itinerary</Text>
            </View>

            {/* Generate days CTA (when no days and trip has dates) */}
            {!hasDays && hasDates && (
              <Pressable
                style={styles.generateButton}
                onPress={handleGenerateDays}
                disabled={generating}
              >
                <Ionicons name="calendar-outline" size={20} color={colors.orange} />
                <Text style={styles.generateButtonText}>
                  {generating ? 'Generating...' : 'Generate itinerary from dates'}
                </Text>
              </Pressable>
            )}

            {/* Empty state when no days and no dates */}
            {!hasDays && !hasDates && (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No itinerary yet</Text>
                <Text style={styles.emptySubtitle}>
                  Add trip dates to generate your day-by-day plan
                </Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <DayOverviewCard
            day={item}
            onPress={() => router.push(`/(tabs)/trips/day/${item.id}`)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },

  // Menu
  menu: {
    position: 'absolute',
    top: 80,
    right: spacing.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.sm,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  menuItemText: {
    fontFamily: fonts.medium,
    fontSize: 15,
  },

  // Hero header
  heroContainer: {
    height: 220,
    position: 'relative',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroPlaceholder: {
    backgroundColor: colors.neutralFill,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  statusText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  heroTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },

  // Section header
  sectionHeader: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },

  // Generate button
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.screenX,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.orange,
  },
  generateButtonText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.orange,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxxl,
    paddingHorizontal: spacing.screenX,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
