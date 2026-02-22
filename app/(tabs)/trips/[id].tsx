import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { useTripDetail } from '@/data/trips/useTripDetail';
import { useTripItinerary } from '@/data/trips/useItinerary';
import { deleteTrip } from '@/data/trips/tripApi';
import { generateDaysFromTrip } from '@/data/trips/itineraryApi';
import { getFlag, getCityIdForDay } from '@/data/trips/helpers';
import type { TripDayWithBlocks } from '@/data/trips/itineraryTypes';

import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import NavigationHeader from '@/components/NavigationHeader';
import { TripStatPills } from '@/components/trips/TripStatPills';
import { TripDayRow } from '@/components/trips/TripDayRow';
import { TripStopHeader } from '@/components/trips/TripStopHeader';

import { colors, elevation, fonts, spacing } from '@/constants/design';
import { FLOATING_TAB_BAR_HEIGHT } from '@/components/TabBar';

// ── Types ────────────────────────────────────────────────────────────────────

type DayListItem =
  | { type: 'stop-header'; key: string; cityName: string; startDate: string | null; endDate: string | null }
  | { type: 'day-row'; key: string; day: TripDayWithBlocks; isToday: boolean };

const RESTAURANT_TYPES = new Set(['restaurant', 'cafe', 'bar']);

// ── Screen ───────────────────────────────────────────────────────────────────

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Trip + itinerary data
  const { trip, loading: tripLoading, error: tripError, refetchAll } = useTripDetail(id);
  const { itinerary, loading: itinLoading, refetch: refetchItinerary } = useTripItinerary(id);

  const [showMenu, setShowMenu] = useState(false);
  const [generating, setGenerating] = useState(false);

  const didAutoGenerate = useRef(false);
  const flatListRef = useRef<FlatList>(null);

  useFocusEffect(
    useCallback(() => {
      refetchAll();
      refetchItinerary();
    }, [refetchAll, refetchItinerary]),
  );

  const days: TripDayWithBlocks[] = itinerary?.days ?? [];

  // Auto-generate days when trip has dates but no days yet
  useEffect(() => {
    if (!trip || generating || didAutoGenerate.current) return;
    if (!trip.arriving || !trip.leaving) return;
    if (days.length > 0) return;
    if (itinLoading) return;

    didAutoGenerate.current = true;
    setGenerating(true);
    generateDaysFromTrip(trip.id)
      .then(() => refetchItinerary())
      .finally(() => setGenerating(false));
  }, [trip, days.length, generating, itinLoading, refetchItinerary]);

  // Computed stats
  const stats = useMemo(() => {
    let spotCount = 0;
    let restaurantCount = 0;
    for (const day of days) {
      for (const block of day.blocks) {
        if (block.placeId) spotCount++;
        if (block.place?.placeType && RESTAURANT_TYPES.has(block.place.placeType)) {
          restaurantCount++;
        }
      }
    }
    return { dayCount: days.length, spotCount, restaurantCount };
  }, [days]);

  // Build grouped list items
  const tripStops = trip?.stops ?? [];
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const listItems = useMemo((): DayListItem[] => {
    const items: DayListItem[] = [];
    const isMultiCity = tripStops.length > 1;
    let lastCityId: string | null = null;

    for (const day of days) {
      if (isMultiCity) {
        const cityId = getCityIdForDay(day, tripStops);
        if (cityId !== lastCityId) {
          const stop = tripStops.find((s) => s.cityId === cityId);
          items.push({
            type: 'stop-header',
            key: `header-${cityId}`,
            cityName: stop?.cityName ?? 'Unknown',
            startDate: stop?.startDate ?? null,
            endDate: stop?.endDate ?? null,
          });
          lastCityId = cityId;
        }
      }
      items.push({
        type: 'day-row',
        key: `day-${day.id}`,
        day,
        isToday: day.date === todayStr,
      });
    }
    return items;
  }, [days, tripStops, todayStr]);

  // Auto-scroll to today
  useEffect(() => {
    if (listItems.length === 0) return;
    const todayIdx = listItems.findIndex(
      (item) => item.type === 'day-row' && item.isToday,
    );
    if (todayIdx > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: todayIdx, animated: true, viewOffset: 80 });
      }, 300);
    }
  }, [listItems]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleDayPress = (dayId: string) => {
    router.push(`/trips/day/${dayId}`);
  };

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

  // ── Loading / Error ──────────────────────────────────────────────────────────

  if (tripLoading || itinLoading) return <LoadingScreen />;
  if (tripError) return <ErrorScreen message={tripError.message} onRetry={refetchAll} />;

  if (!trip) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <NavigationHeader title="Trip" parentTitle="Trips" />
        <SolaText style={styles.notFound}>Trip not found</SolaText>
      </View>
    );
  }

  // Computed values
  const flag = getFlag(trip.countryIso2);
  const routeText =
    tripStops.length > 1
      ? tripStops.map((s) => s.cityName || s.countryIso2).join(' \u2192 ')
      : trip.destinationName;
  const hasDays = days.length > 0;
  const hasDates = !!(trip.arriving && trip.leaving);

  // ── List header (route + stats) ──────────────────────────────────────────────

  const ListHeader = (
    <>
      {/* Route display */}
      <View style={styles.routeSection}>
        <SolaText style={styles.routeText}>
          {flag} {routeText}
        </SolaText>
      </View>

      {/* Stat pills */}
      {hasDays && (
        <TripStatPills
          dayCount={stats.dayCount}
          spotCount={stats.spotCount}
          restaurantCount={stats.restaurantCount}
        />
      )}
    </>
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  const renderItem = ({ item }: { item: DayListItem }) => {
    if (item.type === 'stop-header') {
      return (
        <TripStopHeader
          cityName={item.cityName}
          startDate={item.startDate}
          endDate={item.endDate}
        />
      );
    }
    return (
      <TripDayRow
        day={item.day}
        isToday={item.isToday}
        onPress={() => handleDayPress(item.day.id)}
      />
    );
  };

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

      {/* Overflow menu + backdrop */}
      {showMenu && (
        <>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowMenu(false)}
          />
          <View style={[styles.menu, elevation.sm]}>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                handleDelete();
              }}
            >
              <Ionicons name="trash-outline" size={18} color={colors.emergency} />
              <SolaText style={[styles.menuItemText, { color: colors.emergency }]}>Delete trip</SolaText>
            </Pressable>
          </View>
        </>
      )}

      {hasDays ? (
        <FlatList
          ref={flatListRef}
          data={listItems}
          keyExtractor={(item) => item.key}
          ListHeaderComponent={ListHeader}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: FLOATING_TAB_BAR_HEIGHT + spacing.xxl }}
          showsVerticalScrollIndicator={false}
          onScrollToIndexFailed={() => {}}
        />
      ) : (
        <View style={styles.emptyContainer}>
          {ListHeader}

          {/* Auto-generating days indicator */}
          {hasDates && generating && (
            <View style={styles.generatingState}>
              <ActivityIndicator size="small" color={colors.orange} />
              <SolaText style={styles.generatingText}>Setting up your itinerary...</SolaText>
            </View>
          )}

          {/* Empty state when no days and no dates */}
          {!hasDates && (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
              <SolaText style={styles.emptyTitle}>No itinerary yet</SolaText>
              <SolaText style={styles.emptySubtitle}>
                Add trip dates to generate your day-by-day plan
              </SolaText>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

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
    borderRadius: 8,
    padding: spacing.sm,
    zIndex: 100,
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

  // Route
  routeSection: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
  },
  routeText: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },

  // Empty / generating
  emptyContainer: {
    flex: 1,
  },
  generatingState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxxxl,
  },
  generatingText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textMuted,
  },
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
