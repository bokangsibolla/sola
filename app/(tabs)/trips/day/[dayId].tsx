import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import NavigationHeader from '@/components/NavigationHeader';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { TimelineBlockCard } from '@/components/trips/TimelineBlockCard';
import type { BlockProgressStatus } from '@/components/trips/TimelineBlockCard';
import { TodayBadge } from '@/components/trips/TripMode/TodayBadge';
import { SuggestionCard } from '@/components/trips/SuggestionCard';
import { AddStopSheet } from '@/components/trips/AddStopSheet';
import { TripDaySuggestions, ACCOMMODATION_TYPES, placeRoute } from '@/components/trips/TripDaySuggestions';
import { PlacePreviewSheet } from '@/components/trips/PlacePreviewSheet';
import { AccommodationBanner } from '@/components/trips/AccommodationBanner';
import { AddToDaysSheet } from '@/components/trips/AddToDaysSheet';
import type { DayOption } from '@/components/trips/AddToDaysSheet';
import { useDayTimeline, useDaySuggestions, useTripItinerary } from '@/data/trips/useItinerary';
import { getTripWithStops } from '@/data/trips/tripApi';
import { useData } from '@/hooks/useData';
import { getCityIdForDay, formatDayDate as formatDayDateShort } from '@/data/trips/helpers';
import type { TripStop } from '@/data/trips/types';
import type { Place } from '@/data/types';
import type { ItineraryBlockWithTags } from '@/data/trips/itineraryTypes';
import {
  applySuggestion,
  dismissSuggestion,
  updateBlock,
  deleteBlock,
  reorderBlocks,
  createBlock,
} from '@/data/trips/itineraryApi';
import type {
  ItinerarySuggestion,
  TimeShiftPayload,
  ReorderPayload,
  InsertPayload,
  RemovePayload,
} from '@/data/trips/itineraryTypes';
import { colors, fonts, spacing, radius } from '@/constants/design';

// ── Inline insert button ──────────────────────────────────────────────────

const InsertButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <Pressable onPress={onPress} style={styles.insertButton}>
    <Ionicons name="add-circle-outline" size={20} color={colors.textMuted} />
  </Pressable>
);

// ── Date formatting ───────────────────────────────────────────────────────

const formatDayDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T12:00:00');
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' });
  const day = date.getDate();
  const month = date.toLocaleDateString('en-GB', { month: 'long' });
  const year = date.getFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
};

// ── Progress status helper ────────────────────────────────────────────────

/**
 * Compute the progress status for a block based on current time.
 * Only applies when the day is today and the block has a start_time.
 * Returns undefined if progress tracking doesn't apply.
 */
function getBlockProgressStatus(
  block: ItineraryBlockWithTags,
  isToday: boolean,
): BlockProgressStatus {
  if (!isToday || !block.startTime) return undefined;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const startParts = block.startTime.split(':');
  const startMinutes = parseInt(startParts[0], 10) * 60 + parseInt(startParts[1], 10);

  if (block.endTime) {
    const endParts = block.endTime.split(':');
    const endMinutes = parseInt(endParts[0], 10) * 60 + parseInt(endParts[1], 10);

    if (currentMinutes >= endMinutes) return 'completed';
    if (currentMinutes >= startMinutes) return 'current';
    return 'upcoming';
  }

  // No end time: use duration or default 60 min window
  const durationMin = block.durationMin ?? 60;
  const endMinutes = startMinutes + durationMin;

  if (currentMinutes >= endMinutes) return 'completed';
  if (currentMinutes >= startMinutes) return 'current';
  return 'upcoming';
}

// ── Screen ────────────────────────────────────────────────────────────────

export default function DayTimelineScreen() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { day, loading, error, refetch } = useDayTimeline(dayId);
  const { suggestions, refetch: refetchSuggestions } = useDaySuggestions(dayId);

  // Fetch trip to get destination city for filtering AddStopSheet
  const { data: trip } = useData(
    () => (day?.tripId ? getTripWithStops(day.tripId) : Promise.resolve(null)),
    ['tripForDay', day?.tripId],
  );

  // Fetch full itinerary for multi-day accommodation add
  const { itinerary, refetch: refetchItinerary } = useTripItinerary(day?.tripId);
  const allDays = itinerary?.days ?? [];

  const [showAddStop, setShowAddStop] = useState(false);
  const [insertAfterIndex, setInsertAfterIndex] = useState(0);
  const [previewPlace, setPreviewPlace] = useState<Place | null>(null);
  const [addDaysPlace, setAddDaysPlace] = useState<Place | null>(null);
  const [addDaysVisible, setAddDaysVisible] = useState(false);

  // Refetch on screen focus (returning from elsewhere)
  useFocusEffect(
    useCallback(() => { refetch(); }, [refetch]),
  );

  // Resolve city for this day (for suggestions + multi-day add)
  const tripStops: TripStop[] = trip?.stops ?? [];
  const dayCityId = day ? getCityIdForDay(day, tripStops) : null;

  // Check if this day is today
  const isToday = useMemo(() => {
    if (!day?.date) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return day.date === todayStr;
  }, [day?.date]);

  // Place IDs already added to this day
  const addedPlaceIds = useMemo(
    () => new Set(day?.blocks.filter((b) => b.placeId).map((b) => b.placeId!) ?? []),
    [day?.blocks],
  );

  // Split blocks: accommodation (banner) vs timeline (everything else)
  const accommodationBlocks = useMemo(
    () => day?.blocks.filter((b) => b.blockType === 'accommodation') ?? [],
    [day?.blocks],
  );
  const timelineBlocks = useMemo(
    () => day?.blocks.filter((b) => b.blockType !== 'accommodation') ?? [],
    [day?.blocks],
  );

  // Days in the same city (for multi-day accommodation add)
  const cityDayOptions = useMemo((): DayOption[] => {
    if (!dayCityId) return [];
    const opts: DayOption[] = [];
    for (let i = 0; i < allDays.length; i++) {
      const d = allDays[i];
      if (getCityIdForDay(d, tripStops) === dayCityId) {
        opts.push({
          index: i,
          id: d.id,
          label: `Day ${d.dayIndex}`,
          sublabel: formatDayDateShort(d.date) ?? undefined,
        });
      }
    }
    return opts;
  }, [allDays, tripStops, dayCityId]);

  const currentDayArrayIndex = allDays.findIndex((d) => d.id === dayId);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleBlockPress = (_blockId: string) => {
    // Block detail/edit screen — not yet implemented
  };

  const handleInsert = (afterOrderIndex: number) => {
    setInsertAfterIndex(afterOrderIndex);
    setShowAddStop(true);
  };

  const handleFabPress = () => {
    if (day && day.blocks.length > 0) {
      const lastBlock = day.blocks[day.blocks.length - 1];
      setInsertAfterIndex(lastBlock.orderIndex);
    } else {
      setInsertAfterIndex(0);
    }
    setShowAddStop(true);
  };

  const handleApplySuggestion = async (suggestion: ItinerarySuggestion) => {
    await applySuggestion(suggestion.id);

    const payload = suggestion.payload;
    switch (suggestion.suggestionType) {
      case 'time_shift': {
        const p = payload as unknown as TimeShiftPayload;
        await updateBlock(p.blockId, {
          startTime: p.newStartTime,
          ...(p.newEndTime && { endTime: p.newEndTime }),
        });
        break;
      }
      case 'reorder': {
        const p = payload as unknown as ReorderPayload;
        const ordered = p.moves
          .sort((a, b) => a.newOrderIndex - b.newOrderIndex)
          .map((m) => m.blockId);
        await reorderBlocks(dayId!, ordered);
        break;
      }
      case 'insert': {
        const p = payload as unknown as InsertPayload;
        const lastBlock = day?.blocks[day.blocks.length - 1];
        await createBlock({
          tripId: day!.tripId,
          tripDayId: dayId!,
          orderIndex: lastBlock ? lastBlock.orderIndex + 1 : 0,
          ...p.block,
        });
        break;
      }
      case 'remove': {
        const p = payload as unknown as RemovePayload;
        await deleteBlock(p.blockId);
        break;
      }
    }

    refetch();
    refetchSuggestions();
  };

  const handleDismissSuggestion = async (suggestion: ItinerarySuggestion) => {
    await dismissSuggestion(suggestion.id);
    refetchSuggestions();
  };

  // Open preview sheet instead of directly adding
  const handlePreviewPlace = (place: Place) => {
    setPreviewPlace(place);
  };

  // Called from PlacePreviewSheet "Add to day"
  const handleConfirmAdd = async (place: Place) => {
    setPreviewPlace(null);
    if (ACCOMMODATION_TYPES.has(place.placeType)) {
      setAddDaysPlace(place);
      setAddDaysVisible(true);
    } else {
      if (!day) return;
      await createBlock({
        tripId: day.tripId,
        tripDayId: day.id,
        blockType: 'activity',
        placeId: place.id,
        orderIndex: Date.now(),
      });
      refetch();
    }
  };

  // Called from PlacePreviewSheet "View details"
  const handleViewDetails = (place: Place) => {
    setPreviewPlace(null);
    router.push(placeRoute(place) as any);
  };

  const handleAddToDaysConfirm = async (selectedIndices: number[]) => {
    if (!addDaysPlace || !day) return;
    setAddDaysVisible(false);
    const place = addDaysPlace;
    setAddDaysPlace(null);
    for (const idx of selectedIndices) {
      const targetDay = allDays[idx];
      if (!targetDay) continue;
      await createBlock({
        tripId: day.tripId,
        tripDayId: targetDay.id,
        blockType: 'accommodation',
        placeId: place.id,
        orderIndex: Date.now(),
      });
    }
    refetch();
  };

  // ── Loading / Error states ────────────────────────────────────────────────

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;
  if (!day) return <ErrorScreen message="Day not found" onRetry={refetch} />;

  const topSuggestion = suggestions.length > 0 ? suggestions[0] : null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <NavigationHeader title={`Day ${day.dayIndex}`} parentTitle="Trip" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* ── Day header ──────────────────────────────────────────────── */}
        <View style={styles.dayHeader}>
          <View style={styles.dateRow}>
            {day.date != null && (
              <Text style={styles.dateText}>{formatDayDate(day.date)}</Text>
            )}
            {isToday && <TodayBadge />}
          </View>
          {day.title != null && (
            <Text style={styles.dayTitle}>{day.title}</Text>
          )}
          <View style={styles.headerDivider} />
        </View>

        {/* ── Accommodation banner ──────────────────────────────────── */}
        {accommodationBlocks.length > 0 && (
          <AccommodationBanner
            blocks={accommodationBlocks}
            onPress={(blockId) => handleBlockPress(blockId)}
          />
        )}

        {/* ── Timeline blocks (non-accommodation) ─────────────────────── */}
        {timelineBlocks.length > 0 ? (
          <View style={styles.timelineContainer}>
            {timelineBlocks.map((block, index) => (
              <React.Fragment key={block.id}>
                <TimelineBlockCard
                  block={block}
                  isLast={
                    index === timelineBlocks.length - 1 && !topSuggestion
                  }
                  onPress={() => handleBlockPress(block.id)}
                  progressStatus={getBlockProgressStatus(block, isToday)}
                />
                <InsertButton
                  onPress={() => handleInsert(block.orderIndex)}
                />
              </React.Fragment>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No stops yet</Text>
            <Pressable
              style={styles.emptyButton}
              onPress={() => {
                setInsertAfterIndex(0);
                setShowAddStop(true);
              }}
            >
              <Text style={styles.emptyButtonText}>Add your first stop</Text>
            </Pressable>
          </View>
        )}

        {/* ── Suggestion card ────────────────────────────────────────── */}
        {topSuggestion != null && (
          <SuggestionCard
            suggestion={topSuggestion}
            onApply={() => handleApplySuggestion(topSuggestion)}
            onDismiss={() => handleDismissSuggestion(topSuggestion)}
          />
        )}

        {/* ── Suggestions catalogue ───────────────────────────────────── */}
        {dayCityId != null && (
          <TripDaySuggestions
            cityId={dayCityId}
            tripId={day.tripId}
            dayId={day.id}
            addedPlaceIds={addedPlaceIds}
            onAdded={() => refetch()}
            onAddPlace={handlePreviewPlace}
          />
        )}
      </ScrollView>

      {/* ── FAB ──────────────────────────────────────────────────────── */}
      <Pressable
        style={[
          styles.fab,
          { bottom: insets.bottom + spacing.lg, right: spacing.screenX },
        ]}
        onPress={handleFabPress}
        accessibilityRole="button"
        accessibilityLabel="Add stop"
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </Pressable>

      {/* ── AddStopSheet ─────────────────────────────────────────────── */}
      <AddStopSheet
        visible={showAddStop}
        tripId={day.tripId}
        dayId={dayId!}
        insertAfterIndex={insertAfterIndex}
        destinationCityId={trip?.destinationCityId ?? null}
        onClose={() => setShowAddStop(false)}
        onAdded={() => {
          refetch();
          setShowAddStop(false);
        }}
      />

      {/* ── AddToDaysSheet for multi-day accommodation ────────────────── */}
      <AddToDaysSheet
        visible={addDaysVisible}
        placeName={addDaysPlace?.name ?? ''}
        placeType={addDaysPlace?.placeType ?? ''}
        days={cityDayOptions}
        currentDayIndex={currentDayArrayIndex}
        isAccommodation={addDaysPlace ? ACCOMMODATION_TYPES.has(addDaysPlace.placeType) : false}
        onConfirm={handleAddToDaysConfirm}
        onClose={() => {
          setAddDaysVisible(false);
          setAddDaysPlace(null);
        }}
      />

      {/* ── PlacePreviewSheet ───────────────────────────────────────── */}
      <PlacePreviewSheet
        visible={previewPlace !== null}
        place={previewPlace}
        onAddToDay={handleConfirmAdd}
        onViewDetails={handleViewDetails}
        onClose={() => setPreviewPlace(null)}
      />
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const FAB_SIZE = 56;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Day header ──────────────────────────────────────────────────────────
  dayHeader: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  dayTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  headerDivider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginTop: spacing.md,
  },

  // ── Timeline ────────────────────────────────────────────────────────────
  timelineContainer: {
    paddingTop: spacing.sm,
  },

  // ── Insert button ───────────────────────────────────────────────────────
  insertButton: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
    opacity: 0.6,
  },

  // ── Empty state ─────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.screenX,
  },
  emptyTitle: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },

  // ── FAB ─────────────────────────────────────────────────────────────────
  fab: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
});
