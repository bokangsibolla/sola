import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';
import { useData } from '@/hooks/useData';
import { getTripsGrouped } from '@/data/trips/tripApi';
import { addTripSavedItem } from '@/data/trips/tripApi';
import { getTripItinerary } from '@/data/trips/itineraryApi';
import { createBlock } from '@/data/trips/itineraryApi';
import {
  getCollections,
  toggleSavePlace,
  createCollection,
} from '@/data/api';
import { getFlag, formatDateShort, formatDayDate } from '@/data/trips/helpers';
import type { TripWithStops, GroupedTrips } from '@/data/trips/types';
import type { Collection } from '@/data/types';
import type { TripItinerary, TripDayWithBlocks } from '@/data/trips/itineraryTypes';

// ── Constants ────────────────────────────────────────────────────────────────

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.7;

const PRESET_EMOJIS = ['\u{1F4CC}', '\u{2708}\u{FE0F}', '\u{1F37D}', '\u{1F3E8}', '\u{1F3AF}', '\u{2764}\u{FE0F}'];

type SheetView = 'main' | 'dayPicker' | 'newCollection';
type SaveResult = 'idle' | 'saving' | 'saved' | 'error';

// ── Props ────────────────────────────────────────────────────────────────────

interface SaveSheetProps {
  visible: boolean;
  onClose: () => void;
  entityType: 'place' | 'activity' | 'city' | 'country';
  entityId: string;
  entityName: string;
  userId: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export const SaveSheet: React.FC<SaveSheetProps> = ({
  visible,
  onClose,
  entityType,
  entityId,
  entityName,
  userId,
}) => {
  const insets = useSafeAreaInsets();

  // ── View state ────────────────────────────────────────────────────────────
  const [view, setView] = useState<SheetView>('main');
  const [selectedTrip, setSelectedTrip] = useState<TripWithStops | null>(null);
  const [saveResult, setSaveResult] = useState<SaveResult>('idle');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── New collection state ──────────────────────────────────────────────────
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState(PRESET_EMOJIS[0]);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { data: groupedTrips, loading: tripsLoading } = useData(
    () => getTripsGrouped(userId),
    ['tripsGrouped', userId],
  );

  const { data: collections, loading: collectionsLoading, refetch: refetchCollections } = useData(
    () => getCollections(userId),
    ['collections', userId],
  );

  const { data: itinerary, loading: itineraryLoading } = useData(
    () => (selectedTrip ? getTripItinerary(selectedTrip.id) : Promise.resolve(null)),
    ['tripItinerary', selectedTrip?.id ?? '__none__'],
  );

  // ── Derived data ──────────────────────────────────────────────────────────
  const activeTrips = useMemo<TripWithStops[]>(() => {
    if (!groupedTrips) return [];
    const trips: TripWithStops[] = [];
    if (groupedTrips.current) trips.push(groupedTrips.current);
    trips.push(...groupedTrips.upcoming);
    return trips;
  }, [groupedTrips]);

  /** Group itinerary days by stop (city). */
  const daysByStop = useMemo(() => {
    if (!itinerary || !selectedTrip) return [];
    const stops = selectedTrip.stops;
    if (stops.length === 0) return [];

    const groups: { stopLabel: string; days: TripDayWithBlocks[] }[] = [];
    const groupMap = new Map<string, TripDayWithBlocks[]>();
    const labelMap = new Map<string, string>();

    for (const day of itinerary.days) {
      // Find which stop this day belongs to
      let matchedStopKey = 'unsorted';
      let matchedLabel = selectedTrip.title ?? 'Trip';

      for (const stop of stops) {
        if (stop.startDate && stop.endDate && day.date) {
          if (day.date >= stop.startDate && day.date <= stop.endDate) {
            matchedStopKey = stop.id;
            matchedLabel = `${getFlag(stop.countryIso2)} ${stop.cityName ?? 'Stop'}`;
            break;
          }
        }
      }

      if (!groupMap.has(matchedStopKey)) {
        groupMap.set(matchedStopKey, []);
        labelMap.set(matchedStopKey, matchedLabel);
      }
      groupMap.get(matchedStopKey)!.push(day);
    }

    // Maintain order from stops
    const usedKeys = new Set<string>();
    for (const stop of stops) {
      if (groupMap.has(stop.id)) {
        groups.push({ stopLabel: labelMap.get(stop.id)!, days: groupMap.get(stop.id)! });
        usedKeys.add(stop.id);
      }
    }
    // Add unsorted if any
    if (groupMap.has('unsorted') && !usedKeys.has('unsorted')) {
      groups.push({ stopLabel: labelMap.get('unsorted')!, days: groupMap.get('unsorted')! });
    }

    return groups;
  }, [itinerary, selectedTrip]);

  // ── Reset on open/close ───────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      setView('main');
      setSelectedTrip(null);
      setSaveResult('idle');
      setNewName('');
      setNewEmoji(PRESET_EMOJIS[0]);
    }
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [visible]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const showSuccess = useCallback(() => {
    setSaveResult('saved');
    closeTimerRef.current = setTimeout(() => {
      onClose();
    }, 600);
  }, [onClose]);

  const handleSaveToTrip = useCallback((trip: TripWithStops) => {
    setSelectedTrip(trip);
    setView('dayPicker');
  }, []);

  const handleSaveForLater = useCallback(async () => {
    if (!selectedTrip || saveResult === 'saving') return;
    setSaveResult('saving');
    try {
      await addTripSavedItem(selectedTrip.id, entityType, entityId);
      showSuccess();
    } catch {
      setSaveResult('error');
    }
  }, [selectedTrip, entityType, entityId, saveResult, showSuccess]);

  const handleSaveToDay = useCallback(async (day: TripDayWithBlocks) => {
    if (!selectedTrip || saveResult === 'saving') return;
    setSaveResult('saving');
    try {
      await createBlock({
        tripId: selectedTrip.id,
        tripDayId: day.id,
        blockType: entityType === 'activity' ? 'activity' : 'place',
        placeId: entityId,
        orderIndex: day.blocks.length,
      });
      showSuccess();
    } catch {
      setSaveResult('error');
    }
  }, [selectedTrip, entityType, entityId, saveResult, showSuccess]);

  const handleSaveToCollection = useCallback(async (collection: Collection) => {
    if (saveResult === 'saving') return;
    setSaveResult('saving');
    try {
      await toggleSavePlace(userId, entityId, collection.id);
      showSuccess();
    } catch {
      setSaveResult('error');
    }
  }, [userId, entityId, saveResult, showSuccess]);

  const handleCreateCollection = useCallback(async () => {
    if (!newName.trim() || saveResult === 'saving') return;
    setSaveResult('saving');
    try {
      const collection = await createCollection(userId, {
        name: newName.trim(),
        emoji: newEmoji,
      });
      // Save entity to the new collection
      await toggleSavePlace(userId, entityId, collection.id);
      refetchCollections();
      showSuccess();
    } catch {
      setSaveResult('error');
    }
  }, [newName, newEmoji, userId, entityId, saveResult, showSuccess, refetchCollections]);

  const handleBack = useCallback(() => {
    setView('main');
    setSelectedTrip(null);
    setSaveResult('idle');
  }, []);

  // ── Success overlay ───────────────────────────────────────────────────────
  if (saveResult === 'saved') {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={32} color={colors.greenSoft} />
            </View>
            <Text style={styles.successText}>Saved!</Text>
          </View>
        </View>
      </Modal>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg, maxHeight: SHEET_MAX_HEIGHT }]}>
        {/* Drag handle */}
        <View style={styles.handle} />

        {view === 'main' && (
          <MainView
            entityName={entityName}
            trips={activeTrips}
            tripsLoading={tripsLoading}
            collections={collections ?? []}
            collectionsLoading={collectionsLoading}
            saving={saveResult === 'saving'}
            onSelectTrip={handleSaveToTrip}
            onSelectCollection={handleSaveToCollection}
            onNewCollection={() => setView('newCollection')}
          />
        )}

        {view === 'dayPicker' && selectedTrip && (
          <DayPickerView
            trip={selectedTrip}
            daysByStop={daysByStop}
            loading={itineraryLoading}
            saving={saveResult === 'saving'}
            onBack={handleBack}
            onSaveForLater={handleSaveForLater}
            onSelectDay={handleSaveToDay}
          />
        )}

        {view === 'newCollection' && (
          <NewCollectionView
            name={newName}
            emoji={newEmoji}
            saving={saveResult === 'saving'}
            onChangeName={setNewName}
            onChangeEmoji={setNewEmoji}
            onBack={handleBack}
            onCreate={handleCreateCollection}
          />
        )}
      </View>
    </Modal>
  );
};

// ── View 1: Main ────────────────────────────────────────────────────────────

interface MainViewProps {
  entityName: string;
  trips: TripWithStops[];
  tripsLoading: boolean;
  collections: Collection[];
  collectionsLoading: boolean;
  saving: boolean;
  onSelectTrip: (trip: TripWithStops) => void;
  onSelectCollection: (collection: Collection) => void;
  onNewCollection: () => void;
}

const MainView: React.FC<MainViewProps> = ({
  entityName,
  trips,
  tripsLoading,
  collections,
  collectionsLoading,
  saving,
  onSelectTrip,
  onSelectCollection,
  onNewCollection,
}) => {
  const formatTripSubline = (trip: TripWithStops): string => {
    const parts: string[] = [];
    if (trip.arriving && trip.leaving) {
      parts.push(`${formatDateShort(trip.arriving)}\u2013${formatDateShort(trip.leaving)}`);
    }
    if (trip.stops.length > 0) {
      parts.push(`${trip.stops.length} ${trip.stops.length === 1 ? 'city' : 'cities'}`);
    }
    return parts.join(' \u00B7 ');
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scrollContent}
    >
      {/* Title */}
      <Text style={styles.sheetTitle} numberOfLines={2}>
        Save \u201C{entityName}\u201D
      </Text>

      {/* Trips section */}
      <Text style={styles.sectionHeader}>ADD TO TRIP</Text>

      {tripsLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.textMuted} />
        </View>
      ) : trips.length === 0 ? (
        <Text style={styles.emptyText}>No active or upcoming trips</Text>
      ) : (
        <View style={styles.rowGroup}>
          {trips.map((trip, index) => (
            <Pressable
              key={trip.id}
              style={({ pressed }) => [
                styles.row,
                index < trips.length - 1 && styles.rowBorder,
                pressed && pressedState,
              ]}
              onPress={() => onSelectTrip(trip)}
              disabled={saving}
            >
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {getFlag(trip.countryIso2)} {trip.title || trip.destinationName}
                </Text>
                <Text style={styles.rowSubtitle} numberOfLines={1}>
                  {formatTripSubline(trip)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      )}

      {/* Collections section */}
      <Text style={[styles.sectionHeader, { marginTop: spacing.xl }]}>SAVE TO COLLECTION</Text>

      {collectionsLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.textMuted} />
        </View>
      ) : (
        <View style={styles.rowGroup}>
          {collections.map((col, index) => (
            <Pressable
              key={col.id}
              style={({ pressed }) => [
                styles.row,
                styles.rowBorder,
                pressed && pressedState,
              ]}
              onPress={() => onSelectCollection(col)}
              disabled={saving}
            >
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {col.emoji} {col.name}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}

          {/* New collection row */}
          <Pressable
            style={({ pressed }) => [
              styles.row,
              pressed && pressedState,
            ]}
            onPress={onNewCollection}
            disabled={saving}
          >
            <View style={styles.rowContent}>
              <Text style={styles.newCollectionText}>+ New Collection</Text>
            </View>
          </Pressable>
        </View>
      )}

      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="small" color={colors.orange} />
        </View>
      )}
    </ScrollView>
  );
};

// ── View 2: Day Picker ──────────────────────────────────────────────────────

interface DayPickerViewProps {
  trip: TripWithStops;
  daysByStop: { stopLabel: string; days: TripDayWithBlocks[] }[];
  loading: boolean;
  saving: boolean;
  onBack: () => void;
  onSaveForLater: () => void;
  onSelectDay: (day: TripDayWithBlocks) => void;
}

const DayPickerView: React.FC<DayPickerViewProps> = ({
  trip,
  daysByStop,
  loading,
  saving,
  onBack,
  onSaveForLater,
  onSelectDay,
}) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header with back button */}
      <View style={styles.subHeader}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.subHeaderTitle} numberOfLines={1}>
          Add to {trip.title || trip.destinationName}
        </Text>
        <View style={styles.backButton} />
      </View>

      {/* Save for later option */}
      <Pressable
        style={({ pressed }) => [
          styles.saveForLaterCard,
          pressed && pressedState,
        ]}
        onPress={onSaveForLater}
        disabled={saving}
      >
        <View style={styles.saveForLaterIcon}>
          <Ionicons name="bookmark-outline" size={20} color={colors.orange} />
        </View>
        <View style={styles.saveForLaterText}>
          <Text style={styles.saveForLaterTitle}>Save for later</Text>
          <Text style={styles.saveForLaterSub}>Add without assigning a day</Text>
        </View>
      </Pressable>

      {/* Day picker */}
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.textMuted} />
          <Text style={styles.loadingText}>Loading itinerary...</Text>
        </View>
      ) : daysByStop.length === 0 ? (
        <Text style={styles.emptyText}>No days planned yet for this trip</Text>
      ) : (
        <>
          <Text style={styles.sectionHeader}>OR PICK A DAY</Text>

          {daysByStop.map((group, groupIdx) => (
            <View key={groupIdx} style={styles.stopGroup}>
              {daysByStop.length > 1 && (
                <Text style={styles.stopLabel}>{group.stopLabel}</Text>
              )}
              <View style={styles.rowGroup}>
                {group.days.map((day, dayIdx) => {
                  const dateLabel = formatDayDate(day.date);
                  const blockCount = day.blocks.length;

                  return (
                    <Pressable
                      key={day.id}
                      style={({ pressed }) => [
                        styles.row,
                        dayIdx < group.days.length - 1 && styles.rowBorder,
                        pressed && pressedState,
                      ]}
                      onPress={() => onSelectDay(day)}
                      disabled={saving}
                    >
                      <View style={styles.rowContent}>
                        <Text style={styles.rowTitle}>
                          Day {day.dayIndex}
                          {dateLabel ? ` \u00B7 ${dateLabel}` : ''}
                          {blockCount > 0 ? ` \u00B7 ${blockCount}` : ''}
                        </Text>
                      </View>
                      <Ionicons name="add-circle-outline" size={20} color={colors.orange} />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </>
      )}

      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="small" color={colors.orange} />
        </View>
      )}
    </ScrollView>
  );
};

// ── View 3: New Collection ──────────────────────────────────────────────────

interface NewCollectionViewProps {
  name: string;
  emoji: string;
  saving: boolean;
  onChangeName: (name: string) => void;
  onChangeEmoji: (emoji: string) => void;
  onBack: () => void;
  onCreate: () => void;
}

const NewCollectionView: React.FC<NewCollectionViewProps> = ({
  name,
  emoji,
  saving,
  onChangeName,
  onChangeEmoji,
  onBack,
  onCreate,
}) => {
  const canCreate = name.trim().length > 0 && !saving;

  return (
    <View style={styles.scrollContent}>
      {/* Header with back button */}
      <View style={styles.subHeader}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.subHeaderTitle}>New Collection</Text>
        <View style={styles.backButton} />
      </View>

      {/* Name input */}
      <Text style={styles.inputLabel}>Name</Text>
      <TextInput
        style={styles.nameInput}
        value={name}
        onChangeText={onChangeName}
        placeholder="e.g. Best Restaurants"
        placeholderTextColor={colors.textMuted}
        maxLength={50}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={canCreate ? onCreate : undefined}
      />

      {/* Emoji picker */}
      <Text style={[styles.inputLabel, { marginTop: spacing.xl }]}>Icon</Text>
      <View style={styles.emojiRow}>
        {PRESET_EMOJIS.map((e) => (
          <Pressable
            key={e}
            style={[
              styles.emojiPill,
              e === emoji && styles.emojiPillSelected,
            ]}
            onPress={() => onChangeEmoji(e)}
          >
            <Text style={styles.emojiText}>{e}</Text>
          </Pressable>
        ))}
      </View>

      {/* Preview */}
      {name.trim().length > 0 && (
        <View style={styles.previewRow}>
          <Text style={styles.previewEmoji}>{emoji}</Text>
          <Text style={styles.previewName}>{name.trim()}</Text>
        </View>
      )}

      {/* Create button */}
      <Pressable
        style={[styles.createButton, !canCreate && styles.createButtonDisabled]}
        onPress={onCreate}
        disabled={!canCreate}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.createButtonText}>Create &amp; Save</Text>
        )}
      </Pressable>
    </View>
  );
};

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.screenX,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderDefault,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },

  // ── Title ─────────────────────────────────────────────────────────────────
  sheetTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },

  // ── Section headers ───────────────────────────────────────────────────────
  sectionHeader: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.5,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },

  // ── Row group ─────────────────────────────────────────────────────────────
  rowGroup: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
    backgroundColor: colors.background,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  rowContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  rowTitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  rowSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 2,
  },

  // ── New collection row ────────────────────────────────────────────────────
  newCollectionText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 20,
    color: colors.orange,
  },

  // ── Sub-header (back + title) ─────────────────────────────────────────────
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subHeaderTitle: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 17,
    lineHeight: 22,
    color: colors.textPrimary,
    textAlign: 'center',
  },

  // ── Save for later card ───────────────────────────────────────────────────
  saveForLaterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    marginBottom: spacing.xl,
    backgroundColor: colors.neutralFill,
  },
  saveForLaterIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.card,
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  saveForLaterText: {
    flex: 1,
  },
  saveForLaterTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  saveForLaterSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 2,
  },

  // ── Stop groups ───────────────────────────────────────────────────────────
  stopGroup: {
    marginBottom: spacing.lg,
  },
  stopLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  // ── Loading / empty ───────────────────────────────────────────────────────
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },

  // ── Saving overlay ────────────────────────────────────────────────────────
  savingOverlay: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },

  // ── Success ───────────────────────────────────────────────────────────────
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.greenFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  successText: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.greenSoft,
  },

  // ── New Collection form ───────────────────────────────────────────────────
  inputLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  nameInput: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    height: 48,
  },
  emojiRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  emojiPill: {
    width: 44,
    height: 44,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  emojiPillSelected: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  emojiText: {
    fontSize: 20,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.neutralFill,
    marginBottom: spacing.xl,
  },
  previewEmoji: {
    fontSize: 18,
  },
  previewName: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  createButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  createButtonDisabled: {
    opacity: 0.4,
  },
  createButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
