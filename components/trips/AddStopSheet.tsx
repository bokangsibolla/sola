import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { supabase } from '@/lib/supabase';
import { rowsToCamel } from '@/data/api';
import { createBlock } from '@/data/trips/itineraryApi';
import type { BlockType, CreateBlockInput } from '@/data/trips/itineraryTypes';
import { TimePickerField, dateToTimeString } from '@/components/trips/TimePickerField';

// ── Types ────────────────────────────────────────────────────────────────────

interface AddStopSheetProps {
  visible: boolean;
  tripId: string;
  dayId: string;
  insertAfterIndex: number;
  destinationCityId: string | null;
  onClose: () => void;
  onAdded: () => void;
}

interface PlaceResult {
  id: string;
  name: string;
  placeType: string;
  address: string | null;
}

// ── Constants ────────────────────────────────────────────────────────────────

const BLOCK_TYPE_OPTIONS: { type: BlockType; label: string }[] = [
  { type: 'place', label: 'Place' },
  { type: 'activity', label: 'Activity' },
  { type: 'accommodation', label: 'Stay' },
  { type: 'meal', label: 'Meal' },
  { type: 'transport', label: 'Transport' },
  { type: 'note', label: 'Note' },
  { type: 'free_time', label: 'Free time' },
];

const PLACE_TYPE_FILTER: Record<string, string[] | null> = {
  place: null,
  activity: ['activity'],
  accommodation: ['hotel', 'hostel'],
  meal: ['restaurant', 'cafe', 'bar'],
};

const SEARCH_PLACEHOLDERS: Record<string, string> = {
  place: 'Search places...',
  activity: 'Search activities...',
  accommodation: 'Search stays...',
  meal: 'Search restaurants...',
};

/** Block types that use place search (vs. free-text title input). */
const SEARCHABLE_TYPES = new Set(['place', 'activity', 'accommodation', 'meal']);

// ── Component ────────────────────────────────────────────────────────────────

export const AddStopSheet: React.FC<AddStopSheetProps> = ({
  visible,
  tripId,
  dayId,
  insertAfterIndex,
  destinationCityId,
  onClose,
  onAdded,
}) => {
  const insets = useSafeAreaInsets();

  // ── State ──────────────────────────────────────────────────────────────────
  const [selectedType, setSelectedType] = useState<BlockType>('place');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedPlaceName, setSelectedPlaceName] = useState<string | null>(null);
  const [titleText, setTitleText] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Reset on open ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      setSelectedType('place');
      setSearchQuery('');
      setSearchResults([]);
      setSelectedPlaceId(null);
      setSelectedPlaceName(null);
      setTitleText('');
      setStartTime(null);
      setEndTime(null);
      setSubmitting(false);
    }
  }, [visible]);

  // ── Place search ───────────────────────────────────────────────────────────
  const searchPlaces = useCallback(
    async (query: string) => {
      let q = supabase
        .from('places')
        .select('id, name, place_type, address')
        .eq('is_active', true)
        .limit(10);

      if (destinationCityId) {
        q = q.eq('city_id', destinationCityId);
      }
      if (query.length > 0) {
        q = q.ilike('name', `%${query}%`);
      }

      const typeFilter = PLACE_TYPE_FILTER[selectedType];
      if (typeFilter) {
        q = q.in('place_type', typeFilter);
      }

      const { data } = await q;
      return rowsToCamel<PlaceResult>(data ?? []);
    },
    [destinationCityId, selectedType],
  );

  useEffect(() => {
    if (!visible || !SEARCHABLE_TYPES.has(selectedType)) {
      setSearchResults([]);
      return;
    }

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchPlaces(searchQuery);
        setSearchResults(results);
      } catch {
        // Search error — silently ignore for MVP
      }
    }, 300);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [searchQuery, selectedType, visible, searchPlaces]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleTypeSelect = (type: BlockType) => {
    setSelectedType(type);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedPlaceId(null);
    setSelectedPlaceName(null);
    setTitleText('');
    if (type === 'accommodation') {
      setStartTime(null);
      setEndTime(null);
    }
  };

  const handlePlaceSelect = (place: PlaceResult) => {
    setSelectedPlaceId(place.id);
    setSelectedPlaceName(place.name);
    setSearchQuery('');
    setSearchResults([]);
  };

  const isSearchable = SEARCHABLE_TYPES.has(selectedType);
  const canSubmit = isSearchable
    ? selectedPlaceId !== null
    : titleText.trim().length > 0;

  const handleAdd = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);

    try {
      const isAccommodation = selectedType === 'accommodation';
      const input: CreateBlockInput = {
        tripId,
        tripDayId: dayId,
        blockType: selectedType,
        orderIndex: insertAfterIndex + 1,
        ...(selectedPlaceId && { placeId: selectedPlaceId }),
        ...(titleText.trim() && { titleOverride: titleText.trim() }),
        ...(!isAccommodation && startTime && { startTime: dateToTimeString(startTime) }),
        ...(!isAccommodation && endTime && { endTime: dateToTimeString(endTime) }),
      };
      await createBlock(input);
      onAdded();
      onClose();
    } catch {
      // Mutation error — silently ignore for MVP
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render helpers ─────────────────────────────────────────────────────────
  const renderPlaceResult = ({ item }: { item: PlaceResult }) => (
    <Pressable style={styles.resultRow} onPress={() => handlePlaceSelect(item)}>
      <Text style={styles.resultName} numberOfLines={1}>
        {item.name}
      </Text>
      {item.address ? (
        <Text style={styles.resultAddress} numberOfLines={1}>
          {item.address}
        </Text>
      ) : null}
    </Pressable>
  );

  const titlePlaceholder =
    selectedType === 'note' ? 'Add a note...' : "What's this stop?";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.sheet, { paddingTop: insets.top || spacing.lg }]}>
        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add stop</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* ── Block type picker ───────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.typesScroll}
          contentContainerStyle={styles.typesContainer}
        >
          {BLOCK_TYPE_OPTIONS.map(({ type, label }) => {
            const isActive = type === selectedType;
            return (
              <Pressable
                key={type}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => handleTypeSelect(type)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Content area ────────────────────────────────────────────── */}
        <View style={styles.contentArea}>
          {isSearchable ? (
            <>
              {selectedPlaceName ? (
                <View style={styles.selectedPlace}>
                  <Text style={styles.selectedPlaceText} numberOfLines={1}>
                    {selectedPlaceName}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setSelectedPlaceId(null);
                      setSelectedPlaceName(null);
                    }}
                    hitSlop={8}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                  </Pressable>
                </View>
              ) : (
                <TextInput
                  style={styles.searchInput}
                  placeholder={SEARCH_PLACEHOLDERS[selectedType] ?? 'Search...'}
                  placeholderTextColor={colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={renderPlaceResult}
                keyboardShouldPersistTaps="handled"
                style={styles.resultsList}
              />
            </>
          ) : (
            <TextInput
              style={styles.searchInput}
              placeholder={titlePlaceholder}
              placeholderTextColor={colors.textMuted}
              value={titleText}
              onChangeText={setTitleText}
              maxLength={200}
            />
          )}

          {/* ── Time fields (hidden for accommodation) ────────────── */}
          {selectedType !== 'accommodation' && (
            <>
              <Text style={styles.timeLabel}>Time (optional)</Text>
              <View style={styles.timeRow}>
                <TimePickerField
                  label="Start"
                  value={startTime}
                  placeholder="Start time"
                  onChange={setStartTime}
                  onClear={() => setStartTime(null)}
                />
                <TimePickerField
                  label="End"
                  value={endTime}
                  placeholder="End time"
                  onChange={setEndTime}
                  onClear={() => setEndTime(null)}
                  minimumDate={startTime ?? undefined}
                />
              </View>
            </>
          )}

          {/* ── Submit button ───────────────────────────────────────── */}
          <Pressable
            style={[styles.addButton, (!canSubmit || submitting) && styles.addButtonDisabled]}
            onPress={handleAdd}
            disabled={!canSubmit || submitting}
          >
            <Text style={styles.addButtonText}>
              {submitting ? 'Adding...' : 'Add to day'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
  },

  // ── Type picker ──────────────────────────────────────────────────────────
  typesScroll: {
    flexGrow: 0,
    marginTop: spacing.lg,
  },
  typesContainer: {
    paddingHorizontal: spacing.screenX,
  },
  chip: {
    backgroundColor: colors.neutralFill,
    borderColor: 'transparent',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.orangeFill,
    borderColor: colors.orange,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.orange,
  },

  // ── Content area ─────────────────────────────────────────────────────────
  contentArea: {
    flex: 1,
    paddingBottom: spacing.xxl,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    height: 44,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    marginHorizontal: spacing.screenX,
    marginTop: spacing.lg,
  },
  selectedPlace: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    height: 44,
    marginHorizontal: spacing.screenX,
    marginTop: spacing.lg,
    backgroundColor: colors.orangeFill,
  },
  selectedPlaceText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },

  // ── Search results ───────────────────────────────────────────────────────
  resultsList: {
    flex: 1,
  },
  resultRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.screenX,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  resultName: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  resultAddress: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // ── Time fields ──────────────────────────────────────────────────────────
  timeLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
    marginHorizontal: spacing.screenX,
    marginTop: spacing.lg,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.screenX,
    marginTop: spacing.sm,
  },

  // ── Submit button ────────────────────────────────────────────────────────
  addButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.screenX,
    marginTop: spacing.xl,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
