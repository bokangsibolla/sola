import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';

import { useTripDetail } from '@/data/trips/useTripDetail';
import { useTripItinerary } from '@/data/trips/useItinerary';
import { useTripBuddies } from '@/data/trips/useTripBuddies';
import { deleteTrip } from '@/data/trips/tripApi';
import { generateDaysFromTrip } from '@/data/trips/itineraryApi';
import { getFlag, getCityIdForDay } from '@/data/trips/helpers';
import { openTripRoute } from '@/data/trips/mapsLinks';
import type { TripDayWithBlocks } from '@/data/trips/itineraryTypes';
import type { TripTransport } from '@/data/trips/types';

import { haptics } from '@/lib/haptics';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import NavigationHeader from '@/components/NavigationHeader';
import { TripDayRow } from '@/components/trips/TripDayRow';
import { TripStopHeader } from '@/components/trips/TripStopHeader';
import { TripHeader } from '@/components/trips/TripOverview/TripHeader';
import { TripStatsRow } from '@/components/trips/TripOverview/TripStatsRow';
import { TransportCard } from '@/components/trips/TripOverview/TransportCard';

import { colors, elevation, fonts, spacing } from '@/constants/design';

// ── Types ────────────────────────────────────────────────────────────────────

type ListItem =
  | { type: 'header'; key: string }
  | { type: 'stats'; key: string }
  | { type: 'buddies'; key: string }
  | { type: 'stop-header'; key: string; cityName: string; startDate: string | null; endDate: string | null }
  | { type: 'transport-card'; key: string; transport: TripTransport }
  | { type: 'day-row'; key: string; day: TripDayWithBlocks; isToday: boolean };

// ── Screen ───────────────────────────────────────────────────────────────────

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    trip,
    transports,
    loading: tripLoading,
    error: tripError,
    refetchAll,
  } = useTripDetail(id);
  const { itinerary, loading: itinLoading, refetch: refetchItinerary } = useTripItinerary(id);
  const { buddies } = useTripBuddies(id);

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

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Computed stats
  const stats = useMemo(() => {
    let spotCount = 0;
    for (const day of days) {
      for (const block of day.blocks) {
        if (block.placeId || block.titleOverride) spotCount++;
      }
    }
    return {
      dayCount: days.length,
      cityCount: trip?.stops.length ?? 0,
      stopCount: spotCount,
    };
  }, [days, trip]);

  const tripStops = trip?.stops ?? [];

  // Build the list items
  const listItems = useMemo((): ListItem[] => {
    const items: ListItem[] = [];

    items.push({ type: 'header', key: 'header' });

    if (days.length > 0) {
      items.push({ type: 'stats', key: 'stats' });
    }

    if (buddies.length > 0) {
      items.push({ type: 'buddies', key: 'buddies' });
    }

    // Day rows with stop headers for multi-city
    const isMultiCity = tripStops.length > 1;
    let lastCityId: string | null = null;
    let lastStopOrder = -1;

    for (const day of days) {
      if (isMultiCity) {
        const cityId = getCityIdForDay(day, tripStops);
        if (cityId !== lastCityId) {
          const newStop = tripStops.find((s) => s.cityId === cityId);
          const newStopOrder = newStop?.stopOrder ?? 0;

          if (lastCityId !== null) {
            const existingTransport = transports.find(
              (t) => t.fromStopOrder === lastStopOrder && t.toStopOrder === newStopOrder,
            );
            if (existingTransport) {
              items.push({
                type: 'transport-card',
                key: `transport-${existingTransport.id}`,
                transport: existingTransport,
              });
            }
          }

          items.push({
            type: 'stop-header',
            key: `header-${cityId}`,
            cityName: newStop?.cityName ?? 'Unknown',
            startDate: newStop?.startDate ?? null,
            endDate: newStop?.endDate ?? null,
          });

          lastCityId = cityId;
          lastStopOrder = newStopOrder;
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
  }, [days, tripStops, todayStr, transports, buddies]);

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

  const handleSettings = () => {
    setShowMenu(false);
    if (trip) router.push(`/trips/${trip.id}/settings`);
  };

  const handleViewRoute = () => {
    setShowMenu(false);
    if (tripStops.length > 0) {
      openTripRoute(tripStops.map((s) => s.cityName ?? s.countryIso2));
    }
  };

  const handleDelete = () => {
    setShowMenu(false);
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
            haptics.action();
            await deleteTrip(trip.id);
            router.replace('/(tabs)/trips');
          },
        },
      ],
    );
  };

  const handleTransportPress = (transport: TripTransport) => {
    if (transport.bookingUrl) {
      import('react-native').then(({ Linking }) => Linking.openURL(transport.bookingUrl!));
    }
  };

  // ── Loading / Error ──────────────────────────────────────────────────────────

  if (tripLoading || itinLoading) return <LoadingScreen />;
  if (tripError) return <ErrorScreen message={tripError.message} onRetry={refetchAll} />;

  if (!trip) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <NavigationHeader title="Trip" parentTitle="Trips" backHref="/(tabs)/trips" />
        <Text style={styles.notFound}>Trip not found</Text>
      </View>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const renderItem = ({ item }: { item: ListItem }) => {
    switch (item.type) {
      case 'header':
        return <TripHeader trip={trip} />;

      case 'stats':
        return (
          <TripStatsRow
            dayCount={stats.dayCount}
            cityCount={stats.cityCount}
            accommodationCount={0}
            accommodationTotal={0}
            stopCount={stats.stopCount}
          />
        );

      case 'buddies': {
        const maxShow = 4;
        const shown = buddies.slice(0, maxShow);
        const overflow = buddies.length - maxShow;
        return (
          <Pressable
            style={styles.buddiesRow}
            onPress={() => { if (trip) router.push(`/trips/${trip.id}/settings`); }}
          >
            <View style={styles.buddiesAvatars}>
              {shown.map((buddy, i) => (
                <View
                  key={buddy.id}
                  style={[styles.buddyAvatarWrap, i > 0 && { marginLeft: -8 }]}
                >
                  {buddy.avatarUrl ? (
                    <Image source={{ uri: buddy.avatarUrl }} style={styles.buddyAvatar} />
                  ) : (
                    <View style={[styles.buddyAvatar, styles.buddyAvatarPlaceholder]}>
                      <Ionicons name="person" size={12} color={colors.textMuted} />
                    </View>
                  )}
                </View>
              ))}
              {overflow > 0 && (
                <View style={[styles.buddyAvatarWrap, { marginLeft: -8 }]}>
                  <View style={[styles.buddyAvatar, styles.buddyOverflow]}>
                    <Text style={styles.buddyOverflowText}>+{overflow}</Text>
                  </View>
                </View>
              )}
            </View>
            <Text style={styles.buddiesLabel}>
              {buddies.length === 1
                ? `with ${buddies[0].firstName}`
                : `with ${buddies.length} companions`}
            </Text>
          </Pressable>
        );
      }

      case 'stop-header':
        return (
          <TripStopHeader
            cityName={item.cityName}
            startDate={item.startDate}
            endDate={item.endDate}
          />
        );

      case 'transport-card':
        return (
          <TransportCard
            transport={item.transport}
            stops={tripStops}
            onPress={() => handleTransportPress(item.transport)}
          />
        );

      case 'day-row':
        return (
          <TripDayRow
            day={item.day}
            isToday={item.isToday}
            onPress={() => handleDayPress(item.day.id)}
          />
        );

      default:
        return null;
    }
  };

  const hasDates = !!(trip.arriving && trip.leaving);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <NavigationHeader
        title="Trip"
        parentTitle="Trips"
        backHref="/(tabs)/trips"
        rightActions={
          <View style={styles.headerActions}>
            <Pressable onPress={handleSettings} hitSlop={12}>
              <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
            </Pressable>
            <Pressable onPress={() => setShowMenu(!showMenu)} hitSlop={12}>
              <Ionicons name="ellipsis-horizontal" size={22} color={colors.textPrimary} />
            </Pressable>
          </View>
        }
      />

      {showMenu && (
        <>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowMenu(false)}
          />
          <View style={[styles.menu, elevation.sm]}>
            {tripStops.length >= 2 && (
              <Pressable style={styles.menuItem} onPress={handleViewRoute}>
                <Ionicons name="map-outline" size={18} color={colors.textPrimary} />
                <Text style={styles.menuItemText}>View route on map</Text>
              </Pressable>
            )}
            <Pressable style={styles.menuItem} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={18} color={colors.emergency} />
              <Text style={[styles.menuItemText, { color: colors.emergency }]}>Delete trip</Text>
            </Pressable>
          </View>
        </>
      )}

      {generating ? (
        <View style={styles.generatingState}>
          <ActivityIndicator size="small" color={colors.orange} />
          <Text style={styles.generatingText}>Setting up your itinerary...</Text>
        </View>
      ) : days.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={listItems}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onScrollToIndexFailed={() => {}}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <TripHeader trip={trip} />
          {!hasDates && (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No itinerary yet</Text>
              <Text style={styles.emptySubtitle}>
                Add trip dates to generate your day-by-day plan
              </Text>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
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
    minHeight: 44,
  },
  menuItemText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  buddiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
  },
  buddiesAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buddyAvatarWrap: {
    borderWidth: 2,
    borderColor: colors.background,
    borderRadius: 16,
  },
  buddyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  buddyAvatarPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buddyOverflow: {
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buddyOverflowText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.orange,
  },
  buddiesLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
  },
  generatingState: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
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
