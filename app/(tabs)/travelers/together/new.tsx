import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '@/constants/design';
import NavigationHeader from '@/components/NavigationHeader';
import { useAuth } from '@/state/AuthContext';
import { useTrips } from '@/data/trips/useTrips';
import { searchDestinations } from '@/data/api';
import { createTogetherPost } from '@/data/together/togetherApi';
import type { ActivityCategory, CreateTogetherPostInput } from '@/data/together/types';
import type { DestinationResult } from '@/data/api';

// ---------------------------------------------------------------------------
// Category options
// ---------------------------------------------------------------------------

const CATEGORIES: { key: ActivityCategory; label: string }[] = [
  { key: 'food', label: 'Food' },
  { key: 'culture', label: 'Culture' },
  { key: 'adventure', label: 'Adventure' },
  { key: 'nightlife', label: 'Nightlife' },
  { key: 'day_trip', label: 'Day trip' },
  { key: 'wellness', label: 'Wellness' },
  { key: 'shopping', label: 'Shopping' },
  { key: 'other', label: 'Other' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Deduplicate trip stop cities — unique by cityId. */
function getUniqueTripCities(
  trips: { current: any; upcoming: any[]; past: any[] },
): { cityId: string; cityName: string; countryIso2: string }[] {
  const seen = new Set<string>();
  const result: { cityId: string; cityName: string; countryIso2: string }[] = [];

  const allTrips = [
    ...(trips.current ? [trips.current] : []),
    ...trips.upcoming,
  ];

  for (const trip of allTrips) {
    for (const stop of trip.stops ?? []) {
      if (stop.cityId && stop.cityName && !seen.has(stop.cityId)) {
        seen.add(stop.cityId);
        result.push({
          cityId: stop.cityId,
          cityName: stop.cityName,
          countryIso2: stop.countryIso2,
        });
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function NewTogetherPost() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const { trips } = useTrips();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('other');
  const [cityId, setCityId] = useState<string | null>(null);
  const [countryIso2, setCountryIso2] = useState<string | null>(null);
  const [cityLabel, setCityLabel] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isFlexible, setIsFlexible] = useState(false);
  const [maxCompanions, setMaxCompanions] = useState(2);
  const [submitting, setSubmitting] = useState(false);

  // City search state
  const [citySearch, setCitySearch] = useState('');
  const [cityResults, setCityResults] = useState<DestinationResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trip cities for quick-pick
  const tripCities = getUniqueTripCities(trips);

  // Debounced city search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (citySearch.trim().length < 2) {
      setCityResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchDestinations(citySearch.trim());
        // Only show cities (not countries or areas)
        setCityResults(results.filter((r) => r.type === 'city'));
      } catch {
        setCityResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [citySearch]);

  // Select a city (from search or quick-pick)
  const handleSelectCity = useCallback(
    (id: string, name: string, iso2: string) => {
      setCityId(id);
      setCountryIso2(iso2);
      setCityLabel(name);
      setCitySearch('');
      setCityResults([]);
    },
    [],
  );

  const clearCity = useCallback(() => {
    setCityId(null);
    setCountryIso2(null);
    setCityLabel('');
  }, []);

  // Validation
  const canSubmit =
    title.trim().length > 0 &&
    category !== undefined &&
    cityId !== null &&
    !submitting;

  // Submit
  const handleSubmit = useCallback(async () => {
    if (!userId || !canSubmit || !cityId) return;
    setSubmitting(true);
    try {
      const input: CreateTogetherPostInput = {
        postType: 'looking_for',
        title: title.trim(),
        activityCategory: category,
        cityId,
        countryIso2: countryIso2 ?? undefined,
        maxCompanions,
        isFlexible,
      };

      if (description.trim()) {
        input.description = description.trim();
      }

      if (!isFlexible && activityDate.trim()) {
        input.activityDate = activityDate.trim();
      }
      if (!isFlexible && startTime.trim()) {
        input.startTime = startTime.trim();
      }
      if (!isFlexible && endTime.trim()) {
        input.endTime = endTime.trim();
      }

      await createTogetherPost(userId, input);
      router.back();
    } catch {
      Alert.alert('Error', 'Could not create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [
    userId,
    canSubmit,
    title,
    description,
    category,
    cityId,
    countryIso2,
    activityDate,
    startTime,
    endTime,
    isFlexible,
    maxCompanions,
    router,
  ]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <NavigationHeader title="New Activity" parentTitle="Activities" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Title ────────────────────────────────────────────────── */}
        <Text style={styles.label}>What do you want to do?</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Cooking class, sunset hike, dinner..."
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
          maxLength={120}
          returnKeyType="next"
        />

        {/* ── Description ──────────────────────────────────────────── */}
        <Text style={styles.label}>Add some context</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Tell people what you have in mind..."
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
          maxLength={500}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* ── Category ─────────────────────────────────────────────── */}
        <Text style={styles.label}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScroll}
          contentContainerStyle={styles.pillRow}
        >
          {CATEGORIES.map((c) => {
            const active = category === c.key;
            return (
              <Pressable
                key={c.key}
                onPress={() => setCategory(c.key)}
                style={[styles.pill, active && styles.pillActive]}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── City ─────────────────────────────────────────────────── */}
        <Text style={styles.label}>Where?</Text>

        {/* Selected city display */}
        {cityId && cityLabel ? (
          <View style={styles.selectedCity}>
            <Ionicons name="location-outline" size={18} color={colors.orange} />
            <Text style={styles.selectedCityText}>{cityLabel}</Text>
            <Pressable onPress={clearCity} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
        ) : (
          <>
            {/* Quick-pick from trips */}
            {tripCities.length > 0 && (
              <View style={styles.tripCitiesSection}>
                <Text style={styles.subLabel}>From your trips</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pillRow}
                >
                  {tripCities.map((tc) => (
                    <Pressable
                      key={tc.cityId}
                      onPress={() =>
                        handleSelectCity(tc.cityId, tc.cityName, tc.countryIso2)
                      }
                      style={styles.tripCityPill}
                    >
                      <Ionicons
                        name="airplane-outline"
                        size={14}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.tripCityPillText}>{tc.cityName}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Search input */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a city..."
                placeholderTextColor={colors.textMuted}
                value={citySearch}
                onChangeText={setCitySearch}
              />
              {searching && (
                <ActivityIndicator size="small" color={colors.textMuted} />
              )}
            </View>

            {/* Search results */}
            {cityResults.length > 0 && (
              <View style={styles.searchResults}>
                {cityResults.map((r) => (
                  <Pressable
                    key={r.id}
                    onPress={() =>
                      handleSelectCity(r.id, r.name, r.countryIso2 ?? '')
                    }
                    style={({ pressed }) => [
                      styles.searchResultRow,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.searchResultText}>
                      {r.name}
                      {r.parentName ? `, ${r.parentName}` : ''}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        )}

        {/* ── Date & Time ──────────────────────────────────────────── */}
        <Text style={[styles.label, { marginTop: spacing.xl }]}>When?</Text>

        <View style={styles.flexibleRow}>
          <Text style={styles.flexibleLabel}>I'm flexible</Text>
          <Switch
            value={isFlexible}
            onValueChange={setIsFlexible}
            trackColor={{ false: colors.borderDefault, true: colors.orange }}
            thumbColor="#FFFFFF"
          />
        </View>

        {!isFlexible && (
          <View style={styles.dateTimeSection}>
            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeField}>
                <Text style={styles.subLabel}>Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  value={activityDate}
                  onChangeText={setActivityDate}
                  maxLength={10}
                />
              </View>
            </View>
            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeField}>
                <Text style={styles.subLabel}>Start time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textMuted}
                  value={startTime}
                  onChangeText={setStartTime}
                  maxLength={5}
                />
              </View>
              <View style={styles.dateTimeField}>
                <Text style={styles.subLabel}>End time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textMuted}
                  value={endTime}
                  onChangeText={setEndTime}
                  maxLength={5}
                />
              </View>
            </View>
          </View>
        )}

        {/* ── Max Companions ───────────────────────────────────────── */}
        <Text style={styles.label}>How many people?</Text>
        <View style={styles.stepper}>
          <Pressable
            onPress={() => setMaxCompanions((v) => Math.max(1, v - 1))}
            style={[
              styles.stepperButton,
              maxCompanions <= 1 && styles.stepperButtonDisabled,
            ]}
            disabled={maxCompanions <= 1}
          >
            <Ionicons
              name="remove"
              size={20}
              color={maxCompanions <= 1 ? colors.textMuted : colors.textPrimary}
            />
          </Pressable>
          <Text style={styles.stepperValue}>{maxCompanions}</Text>
          <Pressable
            onPress={() => setMaxCompanions((v) => Math.min(5, v + 1))}
            style={[
              styles.stepperButton,
              maxCompanions >= 5 && styles.stepperButtonDisabled,
            ]}
            disabled={maxCompanions >= 5}
          >
            <Ionicons
              name="add"
              size={20}
              color={maxCompanions >= 5 ? colors.textMuted : colors.textPrimary}
            />
          </Pressable>
        </View>

        {/* ── Submit ───────────────────────────────────────────────── */}
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Post Activity</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
  },

  // ── Labels ──────────────────────────────────────────────────
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },

  // ── Text inputs ─────────────────────────────────────────────
  input: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // ── Category pills ──────────────────────────────────────────
  pillScroll: {
    marginBottom: spacing.xl,
    marginHorizontal: -spacing.screenX,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.screenX,
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.neutralFill,
  },
  pillActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.orange,
  },

  // ── City selector ───────────────────────────────────────────
  selectedCity: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orangeFill,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.orange,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  selectedCityText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.orange,
  },

  tripCitiesSection: {
    marginBottom: spacing.md,
  },
  tripCityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.neutralFill,
  },
  tripCityPillText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  searchResults: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  searchResultText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.9,
    backgroundColor: colors.neutralFill,
  },

  // ── Date & Time ─────────────────────────────────────────────
  flexibleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  flexibleLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  dateTimeSection: {
    marginBottom: spacing.sm,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateTimeField: {
    flex: 1,
  },

  // ── Stepper ─────────────────────────────────────────────────
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    alignSelf: 'flex-start',
    marginBottom: spacing.xxl,
  },
  stepperButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonDisabled: {
    opacity: 0.4,
  },
  stepperValue: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    minWidth: 40,
    textAlign: 'center',
  },

  // ── Submit ──────────────────────────────────────────────────
  submitButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
