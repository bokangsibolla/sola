import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import NavigationHeader from '@/components/NavigationHeader';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { DayTimelineCard } from '@/components/trips/DayTimelineCard';
import { NoteBlock } from '@/components/trips/NoteBlock';
import { SmartSearchSheet } from '@/components/trips/SmartSearchSheet';
import { TodayBadge } from '@/components/trips/TripMode/TodayBadge';
import { AccommodationBanner } from '@/components/trips/AccommodationBanner';
import { useDayTimeline } from '@/data/trips/useItinerary';
import { createBlock } from '@/data/trips/itineraryApi';
import { getTripWithStops } from '@/data/trips/tripApi';
import { useData } from '@/hooks/useData';
import { getCityIdForDay } from '@/data/trips/helpers';
import type { TripStop } from '@/data/trips/types';
import type { ItineraryBlockWithTags } from '@/data/trips/itineraryTypes';
import { colors, fonts, spacing, radius } from '@/constants/design';

type BlockProgressStatus = 'completed' | 'current' | 'upcoming' | undefined;

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

  const durationMin = block.durationMin ?? 60;
  const endMinutes = startMinutes + durationMin;
  if (currentMinutes >= endMinutes) return 'completed';
  if (currentMinutes >= startMinutes) return 'current';
  return 'upcoming';
}

// ── URL detection helper ──────────────────────────────────────────────────

const URL_REGEX = /https?:\/\/[^\s]+/i;

function extractUrl(text: string): string | null {
  const match = text.match(URL_REGEX);
  return match ? match[0] : null;
}

// ── Screen ────────────────────────────────────────────────────────────────

export default function DayTimelineScreen() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { day, loading, error, refetch } = useDayTimeline(dayId);

  const { data: trip } = useData(
    () => (day?.tripId ? getTripWithStops(day.tripId) : Promise.resolve(null)),
    ['tripForDay', day?.tripId],
  );

  const [smartSearchVisible, setSmartSearchVisible] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const noteInputRef = useRef<TextInput>(null);

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const tripStops: TripStop[] = trip?.stops ?? [];
  const dayCityId = day ? getCityIdForDay(day, tripStops) : null;

  const isToday = useMemo(() => {
    if (!day?.date) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return day.date === todayStr;
  }, [day?.date]);

  const addedPlaceIds = useMemo(
    () => new Set((day?.blocks ?? []).filter((b) => b.placeId).map((b) => b.placeId!)),
    [day?.blocks],
  );

  const accommodationBlocks = useMemo(
    () => (day?.blocks ?? []).filter((b) => b.blockType === 'accommodation'),
    [day?.blocks],
  );
  const timelineBlocks = useMemo(
    () => (day?.blocks ?? []).filter((b) => b.blockType !== 'accommodation'),
    [day?.blocks],
  );

  const nextOrderIndex = timelineBlocks.length > 0
    ? timelineBlocks[timelineBlocks.length - 1].orderIndex + 1
    : 0;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleBlockPress = (block: ItineraryBlockWithTags) => {
    if (block.placeId) {
      router.push(`/discover/place-detail/${block.placeId}`);
    }
  };

  const handleAddStop = () => {
    setSmartSearchVisible(true);
  };

  const handleAddNote = () => {
    setShowNoteInput(true);
    setTimeout(() => noteInputRef.current?.focus(), 100);
  };

  const handleSaveNote = async () => {
    const text = noteText.trim();
    if (!text || !day || savingNote) return;

    setSavingNote(true);
    try {
      const url = extractUrl(text);
      await createBlock({
        tripId: day.tripId,
        tripDayId: day.id,
        blockType: 'note',
        titleOverride: text,
        orderIndex: nextOrderIndex,
        meta: url ? { url } : undefined,
      });
      setNoteText('');
      setShowNoteInput(false);
      Keyboard.dismiss();
      refetch();
    } catch {
      // Silently fail
    } finally {
      setSavingNote(false);
    }
  };

  const handleCancelNote = () => {
    setNoteText('');
    setShowNoteInput(false);
    Keyboard.dismiss();
  };

  // ── Loading / Error states ────────────────────────────────────────────────

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;
  if (!day) return <ErrorScreen message="Day not found" onRetry={refetch} />;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <NavigationHeader title={`Day ${day.dayIndex}`} parentTitle="Trip" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Day header */}
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

        {/* Accommodation banner */}
        {accommodationBlocks.length > 0 && (
          <AccommodationBanner
            blocks={accommodationBlocks}
            onPress={(blockId) => {
              const block = accommodationBlocks.find((b) => b.id === blockId);
              if (block?.placeId) router.push(`/discover/place-detail/${block.placeId}`);
            }}
          />
        )}

        {/* Timeline blocks */}
        {timelineBlocks.length > 0 ? (
          <View style={styles.timelineContainer}>
            {timelineBlocks.map((block) => (
              <View key={block.id} style={styles.timelineCardWrapper}>
                {block.blockType === 'note' ? (
                  <NoteBlock block={block} onPress={() => handleBlockPress(block)} />
                ) : (
                  <DayTimelineCard
                    block={block}
                    onPress={() => handleBlockPress(block)}
                    isDone={getBlockProgressStatus(block, isToday) === 'completed'}
                    isCurrent={getBlockProgressStatus(block, isToday) === 'current'}
                  />
                )}
              </View>
            ))}

            {/* Inline note input */}
            {showNoteInput && (
              <View style={styles.noteInputContainer}>
                <TextInput
                  ref={noteInputRef}
                  style={styles.noteInput}
                  placeholder="Write a note or paste a link..."
                  placeholderTextColor={colors.textMuted}
                  value={noteText}
                  onChangeText={setNoteText}
                  multiline
                  autoFocus
                  returnKeyType="done"
                  blurOnSubmit
                  onSubmitEditing={handleSaveNote}
                />
                <View style={styles.noteActions}>
                  <Pressable onPress={handleCancelNote} hitSlop={8}>
                    <Text style={styles.noteCancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSaveNote}
                    disabled={noteText.trim().length === 0 || savingNote}
                    style={({ pressed }) => [
                      styles.noteSaveButton,
                      (noteText.trim().length === 0 || savingNote) && { opacity: 0.4 },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text style={styles.noteSaveText}>Save</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Add actions */}
            <View style={styles.addActions}>
              <Pressable
                onPress={handleAddStop}
                style={({ pressed }) => [
                  styles.addRow,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons name="location-outline" size={18} color={colors.orange} />
                <Text style={styles.addRowText}>Add a place</Text>
              </Pressable>

              {!showNoteInput && (
                <Pressable
                  onPress={handleAddNote}
                  style={({ pressed }) => [
                    styles.addRow,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Ionicons name="document-text-outline" size={18} color={colors.orange} />
                  <Text style={styles.addRowText}>Add a note</Text>
                </Pressable>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="compass-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No stops yet</Text>
            <Text style={styles.emptySubtitle}>
              Start building your day by adding places or notes
            </Text>
            <View style={styles.emptyActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.emptyButton,
                  pressed && { opacity: 0.9 },
                ]}
                onPress={handleAddStop}
              >
                <Text style={styles.emptyButtonText}>Add a place</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.emptyButtonOutline,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={handleAddNote}
              >
                <Text style={styles.emptyButtonOutlineText}>Add a note</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* SmartSearchSheet */}
      {dayCityId != null && (
        <SmartSearchSheet
          visible={smartSearchVisible}
          onClose={() => setSmartSearchVisible(false)}
          cityId={dayCityId}
          tripId={day.tripId}
          dayId={day.id}
          insertAfterIndex={nextOrderIndex}
          existingBlockPlaceIds={Array.from(addedPlaceIds)}
          onPlaceAdded={() => {
            refetch();
            setSmartSearchVisible(false);
          }}
        />
      )}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  timelineContainer: {
    paddingTop: spacing.sm,
  },
  timelineCardWrapper: {
    marginHorizontal: spacing.screenX,
    marginBottom: spacing.md,
  },

  // Note input
  noteInputContainer: {
    marginHorizontal: spacing.screenX,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: radius.card,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  noteInput: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  noteActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  noteCancelText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  noteSaveButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 36,
    justifyContent: 'center',
  },
  noteSaveText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },

  // Add actions
  addActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.screenX,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  addRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
  },
  addRowText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.screenX,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: spacing.md,
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
    fontSize: 15,
    color: '#FFFFFF',
  },
  emptyButtonOutline: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.button,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyButtonOutlineText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
