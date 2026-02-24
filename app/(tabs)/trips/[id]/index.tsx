import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
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
import { deleteTrip, removeTripSavedItem } from '@/data/trips/tripApi';
import { generateDaysFromTrip, createBlock } from '@/data/trips/itineraryApi';
import { getFlag, getCityIdForDay } from '@/data/trips/helpers';
import { openTripRoute } from '@/data/trips/mapsLinks';
import { buildAutoFillItinerary } from '@/data/trips/autoFillEngine';
import type { AutoFillPlace } from '@/data/trips/autoFillEngine';
import { getPlaceById } from '@/data/api';
import type { TripDayWithBlocks } from '@/data/trips/itineraryTypes';
import type { TripAccommodation, TripTransport, TripSavedItem, TripEntry } from '@/data/trips/types';

import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import NavigationHeader from '@/components/NavigationHeader';
import { PlanningBoard } from '@/components/trips/PlanningBoard';
import { DaySelector } from '@/components/trips/DaySelector';
import { DayTimelineCard } from '@/components/trips/DayTimelineCard';
import { SmartSearchSheet } from '@/components/trips/SmartSearchSheet';
import { TripDayRow } from '@/components/trips/TripDayRow';
import { TripStopHeader } from '@/components/trips/TripStopHeader';
import { TripHeader } from '@/components/trips/TripOverview/TripHeader';
import { TripStatsRow } from '@/components/trips/TripOverview/TripStatsRow';
import { AccommodationSection } from '@/components/trips/TripOverview/AccommodationSection';
import { TransportCard, TransportPlaceholder } from '@/components/trips/TripOverview/TransportCard';
import { SavedItemsSection } from '@/components/trips/TripOverview/SavedItemsSection';
import { JournalSection } from '@/components/trips/TripOverview/JournalSection';

import { colors, elevation, fonts, spacing } from '@/constants/design';

// ── Types ────────────────────────────────────────────────────────────────────

interface PlaceDisplay {
  id: string;
  entityId: string;
  name: string;
  placeType: string;
  imageUrl: string | null;
}

type ListItem =
  | { type: 'header'; key: string }
  | { type: 'stats'; key: string }
  | { type: 'buddies'; key: string }
  | { type: 'planning-board'; key: string }
  | { type: 'day-selector'; key: string }
  | { type: 'day-timeline-card'; key: string; block: TripDayWithBlocks['blocks'][number]; isDone: boolean; isCurrent: boolean }
  | { type: 'stop-header'; key: string; cityName: string; startDate: string | null; endDate: string | null }
  | { type: 'transport-card'; key: string; transport: TripTransport }
  | { type: 'transport-placeholder'; key: string; fromCity: string; toCity: string; fromOrder: number; toOrder: number }
  | { type: 'day-row'; key: string; day: TripDayWithBlocks; isToday: boolean }
  | { type: 'accommodation-section'; key: string }
  | { type: 'saved-items-section'; key: string }
  | { type: 'journal-section'; key: string };

const RESTAURANT_TYPES = new Set(['restaurant', 'cafe', 'bar']);

// ── Screen ───────────────────────────────────────────────────────────────────

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Trip + itinerary data
  const {
    trip,
    entries,
    savedItems,
    accommodations,
    transports,
    loading: tripLoading,
    error: tripError,
    refetchAll,
    refetchAccommodations,
    refetchTransports,
  } = useTripDetail(id);
  const { itinerary, loading: itinLoading, refetch: refetchItinerary } = useTripItinerary(id);
  const { buddies } = useTripBuddies(id);

  const [showMenu, setShowMenu] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [building, setBuilding] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [searchSheetVisible, setSearchSheetVisible] = useState(false);
  const [enrichedPlaces, setEnrichedPlaces] = useState<PlaceDisplay[]>([]);

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

  // Enrich saved place items with place details for PlanningBoard
  useEffect(() => {
    const placeItems = savedItems.filter((item) => item.entityType === 'place');
    if (placeItems.length === 0) {
      setEnrichedPlaces([]);
      return;
    }

    let cancelled = false;
    const fetchPlaces = async () => {
      const results: PlaceDisplay[] = [];
      for (const item of placeItems) {
        try {
          const place = await getPlaceById(item.entityId);
          if (place && !cancelled) {
            results.push({
              id: item.id,
              entityId: item.entityId,
              name: place.name,
              placeType: place.placeType,
              imageUrl: place.imageUrlCached,
            });
          }
        } catch {
          // Skip places that fail to fetch
        }
      }
      if (!cancelled) setEnrichedPlaces(results);
    };

    fetchPlaces();
    return () => { cancelled = true; };
  }, [savedItems]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Determine itinerary state
  const hasDays = !!(itinerary && itinerary.days.length > 0);
  const hasBlocks = hasDays && itinerary!.days.some((d) => d.blocks.length > 0);

  // Default selectedDayId to today's day or first day
  useEffect(() => {
    if (!hasDays || selectedDayId) return;
    const todayDay = itinerary!.days.find((d) => d.date === todayStr);
    setSelectedDayId(todayDay?.id ?? itinerary!.days[0].id);
  }, [hasDays, itinerary, todayStr, selectedDayId]);

  // Selected day's blocks for timeline view
  const selectedDayBlocks = useMemo(() => {
    if (!hasBlocks || !selectedDayId) return [];
    const day = itinerary!.days.find((d) => d.id === selectedDayId);
    return day?.blocks ?? [];
  }, [hasBlocks, selectedDayId, itinerary]);

  // Existing block place IDs for the SmartSearchSheet
  const existingBlockPlaceIds = useMemo(() => {
    if (!hasBlocks || !selectedDayId) return [];
    const day = itinerary!.days.find((d) => d.id === selectedDayId);
    return (day?.blocks ?? []).filter((b) => b.placeId).map((b) => b.placeId!);
  }, [hasBlocks, selectedDayId, itinerary]);

  // Auto-fill handler: convert saved items into itinerary blocks
  const handleBuildItinerary = async () => {
    if (!trip || building) return;
    setBuilding(true);
    try {
      // Generate days from trip dates
      const generatedDays = await generateDaysFromTrip(trip.id);
      if (generatedDays.length === 0) return;

      // Convert saved place items to AutoFillPlace format
      const placeItems = savedItems.filter((item) => item.entityType === 'place');

      if (placeItems.length > 0) {
        const places: AutoFillPlace[] = [];
        for (const item of placeItems) {
          const enriched = enrichedPlaces.find((e) => e.entityId === item.entityId);
          places.push({
            id: item.entityId,
            name: enriched?.name ?? item.notes ?? 'Place',
            placeType: enriched?.placeType ?? item.category ?? 'place',
            cityAreaId: null,
            locationLat: null,
            locationLng: null,
            costEstimate: null,
          });
        }

        const result = buildAutoFillItinerary(
          places,
          generatedDays.length,
          trip.id,
          generatedDays.map((d) => d.id),
        );

        for (const [, blocks] of Array.from(result.dayBlocks.entries())) {
          for (const block of blocks) {
            await createBlock(block);
          }
        }
      }

      // Refetch everything
      refetchAll();
      refetchItinerary();
    } catch (err) {
      console.warn('Auto-fill failed:', err);
    } finally {
      setBuilding(false);
    }
  };

  const handleRemoveSavedPlace = async (entityId: string) => {
    if (!trip) return;
    try {
      await removeTripSavedItem(trip.id, 'place', entityId);
      refetchAll();
    } catch {
      // Silently fail
    }
  };

  const handleSavedPlacePress = (entityId: string) => {
    router.push(`/discover/place-detail/${entityId}`);
  };

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
      accommodationCount: accommodations.length,
      accommodationTotal: Math.max(trip?.stops.length ?? 0, accommodations.length),
      stopCount: spotCount,
    };
  }, [days, trip, accommodations]);

  const tripStops = trip?.stops ?? [];

  // Build the unified list of items for the FlatList
  const listItems = useMemo((): ListItem[] => {
    const items: ListItem[] = [];

    // 1. Header (title, dates, route strip)
    items.push({ type: 'header', key: 'header' });

    // 2. Stats row
    if (days.length > 0 || accommodations.length > 0) {
      items.push({ type: 'stats', key: 'stats' });
    }

    // 2b. Buddy avatars
    if (buddies.length > 0) {
      items.push({ type: 'buddies', key: 'buddies' });
    }

    // 3A. Planning Board — saved items exist but no blocks yet
    if (!hasBlocks && enrichedPlaces.length > 0) {
      items.push({ type: 'planning-board', key: 'planning-board' });
    }

    // 3B. Itinerary with blocks — show day selector + timeline cards
    if (hasBlocks && selectedDayId) {
      items.push({ type: 'day-selector', key: 'day-selector' });

      for (const block of selectedDayBlocks) {
        items.push({
          type: 'day-timeline-card',
          key: `timeline-${block.id}`,
          block,
          isDone: block.status === 'done',
          isCurrent: false, // TODO: detect current time block
        });
      }
    }

    // 3C. Day rows fallback — days exist but no blocks and no saved items
    if (days.length > 0 && !hasBlocks && enrichedPlaces.length === 0) {
      const isMultiCity = tripStops.length > 1;
      let lastCityId: string | null = null;
      let lastStopOrder = -1;

      for (const day of days) {
        if (isMultiCity) {
          const cityId = getCityIdForDay(day, tripStops);
          if (cityId !== lastCityId) {
            const newStop = tripStops.find((s) => s.cityId === cityId);
            const newStopOrder = newStop?.stopOrder ?? 0;

            // Insert transport between destination groups
            if (lastCityId !== null) {
              const prevStop = tripStops.find((s) => s.cityId === lastCityId);
              const prevCity = prevStop?.cityName ?? '';
              const newCity = newStop?.cityName ?? '';
              const existingTransport = transports.find(
                (t) => t.fromStopOrder === lastStopOrder && t.toStopOrder === newStopOrder,
              );

              if (existingTransport) {
                items.push({
                  type: 'transport-card',
                  key: `transport-${existingTransport.id}`,
                  transport: existingTransport,
                });
              } else {
                items.push({
                  type: 'transport-placeholder',
                  key: `transport-ph-${lastStopOrder}-${newStopOrder}`,
                  fromCity: prevCity,
                  toCity: newCity,
                  fromOrder: lastStopOrder,
                  toOrder: newStopOrder,
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
    }

    // 4. Accommodation section
    items.push({ type: 'accommodation-section', key: 'accommodation' });

    // 5. Saved items section (only show when NOT in planning board mode)
    if (savedItems.length > 0 && hasBlocks) {
      items.push({ type: 'saved-items-section', key: 'saved-items' });
    }

    // 6. Journal section
    if (entries.length > 0) {
      items.push({ type: 'journal-section', key: 'journal' });
    }

    return items;
  }, [days, tripStops, todayStr, transports, accommodations, savedItems, entries, hasBlocks, enrichedPlaces, selectedDayId, selectedDayBlocks, buddies]);

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
            await deleteTrip(trip.id);
            router.replace('/(tabs)/trips');
          },
        },
      ],
    );
  };

  const handleAccommodationPress = (accom: TripAccommodation) => {
    if (accom.placeId) {
      router.push(`/discover/place-detail/${accom.placeId}`);
    } else if (accom.bookingUrl) {
      Linking.openURL(accom.bookingUrl);
    }
  };

  const handleAddAccommodation = (_cityName: string) => {
    setSearchSheetVisible(true);
  };

  const handleTransportPress = (transport: TripTransport) => {
    if (transport.bookingUrl) {
      Linking.openURL(transport.bookingUrl);
    }
  };

  const handleAddTransport = (_fromOrder: number, _toOrder: number) => {
    Alert.alert('Coming soon', 'Adding transport details will be available in a future update.');
  };

  const handleSavedItemPress = (item: TripSavedItem) => {
    switch (item.entityType) {
      case 'place':
      case 'activity':
        router.push(`/discover/place-detail/${item.entityId}`);
        break;
      case 'city':
        router.push(`/discover/city/${item.entityId}`);
        break;
      case 'country':
        router.push(`/discover/country/${item.entityId}`);
        break;
    }
  };

  const handleAddSavedItem = () => {
    setSearchSheetVisible(true);
  };

  const handleJournalViewAll = () => {
    if (trip) router.push(`/trips/${trip.id}/journal`);
  };

  const handleEntryPress = (_entry: TripEntry) => {
    if (trip) router.push(`/trips/${trip.id}/journal`);
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
            accommodationCount={stats.accommodationCount}
            accommodationTotal={stats.accommodationTotal}
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

      case 'planning-board':
        return (
          <PlanningBoard
            places={enrichedPlaces}
            onRemovePlace={handleRemoveSavedPlace}
            onPlacePress={handleSavedPlacePress}
            onAddMore={() => setSearchSheetVisible(true)}
            onBuildItinerary={handleBuildItinerary}
            building={building}
          />
        );

      case 'day-selector':
        return (
          <DaySelector
            days={itinerary?.days ?? []}
            selectedDayId={selectedDayId ?? ''}
            onSelectDay={setSelectedDayId}
            todayDayId={itinerary?.days.find((d) => d.date === todayStr)?.id ?? null}
          />
        );

      case 'day-timeline-card':
        return (
          <View style={styles.timelineCardWrapper}>
            <DayTimelineCard
              block={item.block}
              onPress={() => {
                if (item.block.placeId) {
                  router.push(`/discover/place-detail/${item.block.placeId}`);
                } else if (selectedDayId) {
                  router.push(`/trips/day/${selectedDayId}`);
                }
              }}
              isDone={item.isDone}
              isCurrent={item.isCurrent}
            />
          </View>
        );

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

      case 'transport-placeholder':
        return (
          <TransportPlaceholder
            fromCityName={item.fromCity}
            toCityName={item.toCity}
            onPress={() => handleAddTransport(item.fromOrder, item.toOrder)}
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

      case 'accommodation-section':
        return (
          <AccommodationSection
            accommodations={accommodations}
            stops={tripStops}
            onAccommodationPress={handleAccommodationPress}
            onAddPress={handleAddAccommodation}
          />
        );

      case 'saved-items-section':
        return (
          <SavedItemsSection
            items={savedItems}
            onItemPress={handleSavedItemPress}
            onAddPress={handleAddSavedItem}
          />
        );

      case 'journal-section':
        return (
          <JournalSection
            entries={entries}
            onViewAll={handleJournalViewAll}
            onEntryPress={handleEntryPress}
          />
        );

      default:
        return null;
    }
  };

  const hasDates = !!(trip.arriving && trip.leaving);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Navigation */}
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

      {/* Overflow menu */}
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
            <Pressable
              style={styles.menuItem}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={18} color={colors.emergency} />
              <Text style={[styles.menuItemText, { color: colors.emergency }]}>Delete trip</Text>
            </Pressable>
          </View>
        </>
      )}

      {/* Main content */}
      {generating ? (
        <View style={styles.generatingState}>
          <ActivityIndicator size="small" color={colors.orange} />
          <Text style={styles.generatingText}>Setting up your itinerary...</Text>
        </View>
      ) : days.length > 0 || accommodations.length > 0 || entries.length > 0 || enrichedPlaces.length > 0 ? (
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

      {/* Sticky bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.9 }]}
          onPress={() => setSearchSheetVisible(true)}
        >
          <Ionicons name="add" size={20} color={colors.background} />
          <Text style={styles.addButtonText}>Add to itinerary</Text>
        </Pressable>
      </View>

      {/* Smart Search Sheet */}
      <SmartSearchSheet
        visible={searchSheetVisible}
        onClose={() => setSearchSheetVisible(false)}
        cityId={trip?.destinationCityId ?? trip?.stops?.[0]?.cityId ?? ''}
        tripId={trip?.id ?? ''}
        dayId={selectedDayId ?? itinerary?.days?.[0]?.id ?? ''}
        insertAfterIndex={selectedDayBlocks.length}
        existingBlockPlaceIds={existingBlockPlaceIds}
        onPlaceAdded={() => {
          setSearchSheetVisible(false);
          refetchAll();
          refetchItinerary();
        }}
      />
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
    minHeight: 44,
  },
  menuItemText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },

  // Buddy avatars
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

  // Timeline card wrapper
  timelineCardWrapper: {
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.md,
  },

  // Empty / generating
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

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.orange,
    borderRadius: 12,
    paddingVertical: 14,
    minHeight: 44,
  },
  addButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.background,
  },
});
