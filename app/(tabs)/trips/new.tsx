import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { usePostHog } from 'posthog-react-native';
import { searchDestinations } from '@/data/api';
import type { DestinationResult } from '@/data/api';
import { createTrip } from '@/data/trips/tripApi';
import { getFlag } from '@/data/trips/helpers';
import type { TripKind } from '@/data/trips/types';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import { colors, fonts, radius, spacing } from '@/constants/design';
import NavigationHeader from '@/components/NavigationHeader';

const DAY_MS = 86_400_000;
const NAME_MAX = 50;

interface SelectedStop {
  countryIso2: string;
  cityId?: string;
  cityName: string;
  type: 'city' | 'country' | 'area';
  startDate: Date | null;
  endDate: Date | null;
}

/** Which date field the picker is editing. */
interface PickerTarget {
  stopIndex: number;
  field: 'start' | 'end';
}

const TRIP_KINDS: { key: TripKind; title: string; detail: string }[] = [
  {
    key: 'plan_future',
    title: 'Plan a future trip',
    detail: 'Set dates and build your itinerary',
  },
  {
    key: 'currently_traveling',
    title: 'Currently traveling',
    detail: 'Track your trip in real time',
  },
  {
    key: 'past_trip',
    title: 'Log a past trip',
    detail: 'Record a trip you already took',
  },
];

const KIND_LABELS: Record<TripKind, string> = {
  plan_future: 'Planning ahead',
  currently_traveling: 'Traveling now',
  past_trip: 'Past trip',
};

function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function nightsBetween(a: Date, b: Date): number {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / DAY_MS));
}

export default function NewTripScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const posthog = usePostHog();
  const scrollRef = useRef<ScrollView>(null);

  // Trip kind bottom sheet
  const [showKindSheet, setShowKindSheet] = useState(true);
  const [tripKind, setTripKind] = useState<TripKind | null>(null);

  // Destinations (each stop carries its own dates)
  const [stops, setStops] = useState<SelectedStop[]>([]);
  const [search, setSearch] = useState('');

  // Flexible dates — user doesn't have exact dates yet
  const [flexibleDates, setFlexibleDates] = useState(false);

  // Date picker target
  const today = new Date();
  const tomorrow = new Date(Date.now() + DAY_MS);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);

  // Trip name
  const [tripName, setTripName] = useState('');

  // Save state
  const [saving, setSaving] = useState(false);

  // Search destinations — cities, countries, and neighborhoods only
  const DESTINATION_TYPES = new Set(['city', 'country', 'area']);
  const { data: destResults } = useData(
    () => search.length < 2
      ? Promise.resolve([])
      : searchDestinations(search).then((r) =>
          r.filter((d) => DESTINATION_TYPES.has(d.type)).slice(0, 6),
        ),
    [search],
  );

  // Derived trip-level dates from stops
  const tripDates = useMemo(() => {
    let earliest: Date | null = null;
    let latest: Date | null = null;
    let totalNights = 0;
    for (const stop of stops) {
      if (stop.startDate && (!earliest || stop.startDate < earliest)) {
        earliest = stop.startDate;
      }
      if (stop.endDate && (!latest || stop.endDate > latest)) {
        latest = stop.endDate;
      }
      if (stop.startDate && stop.endDate) {
        totalNights += nightsBetween(stop.startDate, stop.endDate);
      }
    }
    return { arriving: earliest, leaving: latest, totalNights };
  }, [stops]);

  const isMultiStop = stops.length > 1;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleSelectKind = (kind: TripKind) => {
    setTripKind(kind);
    setShowKindSheet(false);
    posthog.capture('create_trip_kind_selected', { kind });
  };

  const handleSelectStop = (result: DestinationResult) => {
    if (!result.countryIso2) return;
    // Auto-chain: new stop starts when previous stop ends (or after its start if no end)
    const prevStop = stops[stops.length - 1];
    const prevDate = prevStop?.endDate ?? prevStop?.startDate ?? null;
    const autoStart = !flexibleDates && prevDate ? prevDate : null;
    // For areas (neighborhoods), use the parent city's ID
    const cityId = result.type === 'area'
      ? result.cityId
      : result.type === 'city'
        ? result.id
        : undefined;
    setStops([...stops, {
      countryIso2: result.countryIso2,
      cityId,
      cityName: result.name,
      type: result.type as 'city' | 'country' | 'area',
      startDate: autoStart,
      endDate: null,
    }]);
    setSearch('');
  };

  const handleRemoveStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
    // Close picker if it was targeting the removed stop
    if (pickerTarget && pickerTarget.stopIndex === index) {
      setPickerTarget(null);
    }
  };

  const openPicker = (stopIndex: number, field: 'start' | 'end') => {
    // For single-stop end date: ensure start is set first
    if (field === 'end' && !stops[stopIndex]?.startDate) {
      setPickerTarget({ stopIndex, field: 'start' });
      return;
    }
    setPickerTarget({ stopIndex, field });
  };

  const getMinDate = useCallback(() => {
    if (tripKind === 'past_trip') return undefined;
    if (tripKind === 'currently_traveling') return undefined;
    return tomorrow;
  }, [tripKind, tomorrow]);

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setPickerTarget(null);
    if (event.type === 'dismissed') {
      setPickerTarget(null);
      return;
    }
    if (!date || !pickerTarget) return;

    const { stopIndex, field } = pickerTarget;
    const updated = [...stops];
    const stop = { ...updated[stopIndex] };

    if (field === 'start') {
      stop.startDate = date;
      // If end is now before start, clear it
      if (stop.endDate && date >= stop.endDate) stop.endDate = null;
      updated[stopIndex] = stop;
      setStops(updated);
      // Auto-advance to end picker on Android
      if (Platform.OS === 'android') {
        setTimeout(() => setPickerTarget({ stopIndex, field: 'end' }), 300);
      }
    } else {
      stop.endDate = date;
      updated[stopIndex] = stop;
      // Auto-chain: set next stop's start date to this end date
      if (stopIndex + 1 < updated.length) {
        const nextStop = { ...updated[stopIndex + 1] };
        nextStop.startDate = date;
        // Clear next stop's end date if it's now before the new start
        if (nextStop.endDate && date >= nextStop.endDate) nextStop.endDate = null;
        updated[stopIndex + 1] = nextStop;
      }
      setStops(updated);
      if (Platform.OS === 'android') setPickerTarget(null);
    }
  };

  const handlePickerDone = () => {
    if (!pickerTarget) return;
    const { stopIndex, field } = pickerTarget;
    const stop = stops[stopIndex];
    // Auto-advance from start → end if end not set
    if (field === 'start' && stop?.startDate && !stop?.endDate) {
      setPickerTarget({ stopIndex, field: 'end' });
    } else {
      setPickerTarget(null);
    }
  };

  const handleCreate = async () => {
    if (!userId || stops.length === 0) return;
    if (!tripKind) return;

    setSaving(true);
    try {
      const tripId = await createTrip(userId, {
        title: tripName.trim() || undefined,
        tripKind,
        stops: stops.map((s) => ({
          countryIso2: s.countryIso2,
          cityId: s.cityId,
          cityName: s.cityName,
          startDate: !flexibleDates && s.startDate ? s.startDate.toISOString().split('T')[0] : undefined,
          endDate: !flexibleDates && s.endDate ? s.endDate.toISOString().split('T')[0] : undefined,
        })),
        arriving: !flexibleDates && tripDates.arriving ? tripDates.arriving.toISOString().split('T')[0] : undefined,
        leaving: !flexibleDates && tripDates.leaving ? tripDates.leaving.toISOString().split('T')[0] : undefined,
        privacyLevel: 'private',
        matchingOptIn: false,
        buddyUserIds: [],
      });
      posthog.capture('create_trip_completed', {
        kind: tripKind,
        stops_count: stops.length,
        has_dates: !flexibleDates && !!tripDates.arriving,
        flexible_dates: flexibleDates,
      });
      router.replace(`/(tabs)/trips/${tripId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      Alert.alert('Save failed', message);
    } finally {
      setSaving(false);
    }
  };

  const canCreate = stops.length > 0 && tripKind !== null;

  // Current picker values
  const pickerStop = pickerTarget ? stops[pickerTarget.stopIndex] : null;
  const pickerValue = (() => {
    if (!pickerTarget || !pickerStop) return tomorrow;
    if (pickerTarget.field === 'start') {
      if (pickerStop.startDate) return pickerStop.startDate;
      // Default to previous stop's end/start date for chained stops
      if (pickerTarget.stopIndex > 0) {
        const prev = stops[pickerTarget.stopIndex - 1];
        const prevDate = prev?.endDate ?? prev?.startDate;
        if (prevDate) return prevDate;
      }
      return tripKind === 'past_trip' ? today : tomorrow;
    }
    return pickerStop.endDate || new Date((pickerStop.startDate?.getTime() || Date.now()) + DAY_MS);
  })();
  const pickerMinDate = (() => {
    if (!pickerTarget || !pickerStop) return undefined;
    if (pickerTarget.field === 'start') {
      const baseMin = getMinDate();
      // Chain: start date of stop N must be >= end date (or start date) of stop N-1
      if (pickerTarget.stopIndex > 0) {
        const prev = stops[pickerTarget.stopIndex - 1];
        const prevDate = prev?.endDate ?? prev?.startDate;
        if (prevDate && (!baseMin || prevDate > baseMin)) return prevDate;
      }
      return baseMin;
    }
    return pickerStop.startDate ? new Date(pickerStop.startDate.getTime() + DAY_MS) : undefined;
  })();

  // ── Render ───────────────────────────────────────────────────────────────────

  /** Render a start/end date row for a stop. */
  const renderDateRow = (stopIndex: number) => {
    const stop = stops[stopIndex];
    const stopNights = stop.startDate && stop.endDate ? nightsBetween(stop.startDate, stop.endDate) : 0;

    return (
      <View key={`dates-${stopIndex}`}>
        {isMultiStop && (
          <View style={styles.stopDateLabel}>
            <Text style={styles.stopDateLabelFlag}>{getFlag(stop.countryIso2)}</Text>
            <Text style={styles.stopDateLabelText}>{stop.cityName}</Text>
          </View>
        )}
        <View style={styles.dateRow}>
          <Pressable
            style={[styles.dateCard, stop.startDate && styles.dateCardFilled]}
            onPress={() => openPicker(stopIndex, 'start')}
          >
            <Text style={styles.dateLabel}>Start date</Text>
            <Text style={[styles.dateValue, stop.startDate && styles.dateValueFilled]}>
              {stop.startDate ? formatDate(stop.startDate) : 'Select'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.dateCard, stop.endDate && styles.dateCardFilled]}
            onPress={() => openPicker(stopIndex, 'end')}
          >
            <Text style={styles.dateLabel}>End date</Text>
            <Text style={[styles.dateValue, stop.endDate && styles.dateValueFilled]}>
              {stop.endDate ? formatDate(stop.endDate) : 'Open'}
            </Text>
          </Pressable>
        </View>

        {stopNights > 0 && (
          <View style={styles.stopNightsBadge}>
            <Text style={styles.nightsText}>
              {stopNights} {stopNights === 1 ? 'night' : 'nights'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Nav bar */}
      <NavigationHeader title="New trip" variant="modal" />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── Trip Kind Badge ────────────────────────────────── */}
        {tripKind && (
          <View style={styles.kindBadgeRow}>
            <View style={styles.kindBadgeInline}>
              <Text style={styles.kindBadgeInlineText}>{KIND_LABELS[tripKind]}</Text>
            </View>
          </View>
        )}

        {/* ── Destinations ────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Where are you going?</Text>
            <View style={styles.inputRow}>
              <Ionicons name="search-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Search a city or country..."
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </Pressable>
              )}
            </View>

            {(destResults ?? []).length > 0 && search.length > 0 && (
              <View style={styles.results}>
                {(destResults ?? []).map((r, i) => (
                  <Pressable
                    key={`${r.id}-${i}`}
                    style={styles.resultRow}
                    onPress={() => handleSelectStop(r)}
                  >
                    <Text style={styles.resultName}>{r.name}</Text>
                    <Text style={styles.resultDetail}>
                      {r.type === 'area'
                        ? r.parentName ?? 'Neighborhood'
                        : r.type === 'city'
                          ? r.parentName ?? 'City'
                          : 'Country'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {stops.length > 0 && (
              <View style={styles.stopsContainer}>
                {stops.map((stop, index) => (
                  <View key={`${stop.cityName}-${index}`} style={styles.stopChip}>
                    <Text style={styles.stopFlag}>{getFlag(stop.countryIso2)}</Text>
                    <Text style={styles.stopName}>{stop.cityName}</Text>
                    <Pressable onPress={() => handleRemoveStop(index)} hitSlop={8}>
                      <Ionicons name="close" size={16} color={colors.textMuted} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {stops.length === 0 && search.length === 0 && (
              <View style={styles.emptyHint}>
                <Text style={styles.emptyHintText}>Add your destinations</Text>
              </View>
            )}

            {stops.length > 8 && (
              <Text style={styles.ambitiousHint}>That's an ambitious route!</Text>
            )}
          </View>
        </View>

        {/* ── Trip Dates ──────────────────────────────────────── */}
        {stops.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionCard}>
              <View style={styles.datesSectionHeader}>
                <Text style={styles.datesSectionTitle}>
                  {isMultiStop ? 'Dates per destination' : 'Trip dates'}
                </Text>
                <Pressable
                  style={[styles.flexibleToggle, flexibleDates && styles.flexibleToggleActive]}
                  onPress={() => {
                    setFlexibleDates(!flexibleDates);
                    if (!flexibleDates) setPickerTarget(null);
                  }}
                >
                  <Text style={[styles.flexibleToggleText, flexibleDates && styles.flexibleToggleTextActive]}>
                    {flexibleDates ? 'Flexible' : 'Set dates'}
                  </Text>
                </Pressable>
              </View>

              {flexibleDates ? (
                <View style={styles.flexibleHint}>
                  <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
                  <Text style={styles.flexibleHintText}>No fixed dates — you can add them later</Text>
                </View>
              ) : (
                <>
                  {stops.map((_, index) => renderDateRow(index))}

                  {/* Total nights for multi-stop */}
                  {isMultiStop && tripDates.totalNights > 0 && (
                    <View style={styles.totalNightsBadge}>
                      <Text style={styles.nightsText}>
                        {tripDates.totalNights} {tripDates.totalNights === 1 ? 'night' : 'nights'} total
                      </Text>
                    </View>
                  )}

                  {/* iOS inline picker */}
                  {Platform.OS === 'ios' && pickerTarget && (
                    <View style={styles.pickerContainer}>
                      <View style={styles.pickerHeader}>
                        <Text style={styles.pickerTitle}>
                          {pickerTarget.field === 'start' ? 'Start date' : 'End date'}
                          {isMultiStop && pickerStop
                            ? ` — ${pickerStop.cityName}`
                            : ''}
                        </Text>
                        <Pressable onPress={handlePickerDone}>
                          <Text style={styles.pickerDone}>
                            {pickerTarget.field === 'start' &&
                              pickerStop?.startDate &&
                              !pickerStop?.endDate
                              ? 'Next'
                              : 'Done'}
                          </Text>
                        </Pressable>
                      </View>
                      <DateTimePicker
                        value={pickerValue}
                        mode="date"
                        display="inline"
                        minimumDate={pickerMinDate}
                        maximumDate={tripKind === 'past_trip' ? today : undefined}
                        onChange={handleDateChange}
                        accentColor={colors.orange}
                      />
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        )}

        {/* ── Trip Name ──────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Trip name</Text>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Name (optional)</Text>
                <Text style={styles.charCount}>{tripName.length}/{NAME_MAX}</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder={stops[0]?.cityName || 'Give your trip a name'}
                placeholderTextColor={colors.textMuted}
                value={tripName}
                onChangeText={(text) => setTripName(text.slice(0, NAME_MAX))}
                maxLength={NAME_MAX}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Fixed Create Button ───────────────────────────────── */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + spacing.sm },
        ]}
      >
        <Pressable
          style={[styles.createButton, (!canCreate || saving) && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!canCreate || saving}
        >
          <Text style={styles.createButtonText}>
            {saving ? 'Creating...' : 'Create trip'}
          </Text>
        </Pressable>
      </View>

      {/* ── Trip Kind Bottom Sheet ─────────────────────────── */}
      <Modal visible={showKindSheet} transparent animationType="slide">
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetBackdrop} onPress={() => router.back()} />
          <View style={[styles.sheetContainer, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>What kind of trip?</Text>

            {TRIP_KINDS.map((kind, idx) => (
              <Pressable
                key={kind.key}
                style={({ pressed }) => [
                  styles.kindOption,
                  idx === TRIP_KINDS.length - 1 && styles.kindOptionLast,
                  pressed && styles.kindOptionPressed,
                ]}
                onPress={() => handleSelectKind(kind.key)}
              >
                <Text style={styles.kindTitle}>{kind.title}</Text>
                <Text style={styles.kindDetail}>{kind.detail}</Text>
              </Pressable>
            ))}

            <Pressable
              style={({ pressed }) => [styles.sheetCancel, pressed && { opacity: 0.6 }]}
              onPress={() => router.back()}
            >
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Android date picker modal */}
      {Platform.OS === 'android' && pickerTarget && (
        <DateTimePicker
          value={pickerValue}
          mode="date"
          display="default"
          minimumDate={pickerMinDate}
          maximumDate={tripKind === 'past_trip' ? today : undefined}
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },

  // ── Kind Badge ──
  kindBadgeRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  kindBadgeInline: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.orangeFill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  kindBadgeInlineText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
  },

  // ── Sections ──
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  charCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  emptyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.sm,
  },
  emptyHintText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  ambitiousHint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  // ── Inputs ──
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    height: 48,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  // ── Search results ──
  results: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    overflow: 'hidden',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  resultName: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  resultDetail: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },

  // ── Stops ──
  stopsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  stopChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  stopFlag: {
    fontSize: 16,
  },
  stopName: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },

  // ── Dates ──
  datesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  datesSectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  flexibleToggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  flexibleToggleActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  flexibleToggleText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  flexibleToggleTextActive: {
    color: colors.orange,
  },
  flexibleHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.sm,
  },
  flexibleHintText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  stopDateLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  stopDateLabelFlag: {
    fontSize: 14,
  },
  stopDateLabelText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateCard: {
    flex: 1,
    height: 64,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  dateCardFilled: {
    borderWidth: 2,
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  dateLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  dateValue: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textMuted,
  },
  dateValueFilled: {
    color: colors.textPrimary,
  },
  stopNightsBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.neutralFill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.button,
    marginTop: spacing.sm,
  },
  totalNightsBadge: {
    alignSelf: 'center',
    backgroundColor: colors.orangeFill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.button,
    marginTop: spacing.lg,
  },
  nightsText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.orange,
  },
  pickerContainer: {
    marginTop: spacing.lg,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pickerTitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
  },
  pickerDone: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.orange,
  },

  // ── Bottom Bar ──
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  createButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.4,
  },
  createButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },

  // ── Trip Kind Sheet ──
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.screenX,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderDefault,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  sheetTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  kindOption: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  kindOptionLast: {
    borderBottomWidth: 0,
  },
  kindOptionPressed: {
    opacity: 0.6,
  },
  kindTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  kindDetail: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 3,
  },
  sheetCancel: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginTop: spacing.sm,
  },
  sheetCancelText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textMuted,
  },
});
