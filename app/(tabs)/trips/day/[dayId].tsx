import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NavigationHeader from '@/components/NavigationHeader';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { ItineraryBlock } from '@/components/trips/ItineraryBlock';
import { SuggestionCard } from '@/components/trips/SuggestionCard';
import { AddStopSheet } from '@/components/trips/AddStopSheet';
import { useDayTimeline, useDaySuggestions } from '@/data/trips/useItinerary';
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

// ── Screen ────────────────────────────────────────────────────────────────

export default function DayTimelineScreen() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { day, loading, error, refetch } = useDayTimeline(dayId);
  const { suggestions, refetch: refetchSuggestions } = useDaySuggestions(dayId);

  const [showAddStop, setShowAddStop] = useState(false);
  const [insertAfterIndex, setInsertAfterIndex] = useState(0);

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
          {day.date != null && (
            <Text style={styles.dateText}>{formatDayDate(day.date)}</Text>
          )}
          {day.title != null && (
            <Text style={styles.dayTitle}>{day.title}</Text>
          )}
          <View style={styles.headerDivider} />
        </View>

        {/* ── Timeline blocks ────────────────────────────────────────── */}
        {day.blocks.length > 0 ? (
          <View style={styles.timelineContainer}>
            {day.blocks.map((block, index) => (
              <React.Fragment key={block.id}>
                <ItineraryBlock
                  block={block}
                  isFirst={index === 0}
                  isLast={
                    index === day.blocks.length - 1 && !topSuggestion
                  }
                  onPress={() => handleBlockPress(block.id)}
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
        destinationCityId={null}
        onClose={() => setShowAddStop(false)}
        onAdded={() => {
          refetch();
          setShowAddStop(false);
        }}
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
