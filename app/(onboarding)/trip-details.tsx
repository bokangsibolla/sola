import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import { onboardingStore } from '@/state/onboardingStore';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { searchDestinations } from '@/data/cities';
import { countries } from '@/data/geo';
import { colors, fonts, radius } from '@/constants/design';

const DAY_MS = 86_400_000;

function durationLabel(nights: number): string {
  if (nights <= 0) return '';
  if (nights <= 2) return 'A quick getaway';
  if (nights <= 4) return 'A long weekend';
  if (nights <= 8) return 'About a week';
  if (nights <= 14) return 'A couple of weeks';
  if (nights <= 21) return 'About three weeks';
  return 'A proper adventure';
}

function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function nightsBetween(a: Date, b: Date): number {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / DAY_MS));
}

export default function TripDetailsScreen() {
  const router = useRouter();
  const { navigateToNextScreen, skipCurrentScreen, checkScreenAccess, trackScreenView } =
    useOnboardingNavigation();
  const [destination, setDestination] = useState('');
  const [search, setSearch] = useState('');

  // Check if this screen should be shown (A/B testing)
  useEffect(() => {
    const shouldShow = checkScreenAccess('trip-details');
    if (shouldShow) {
      trackScreenView('trip-details');
    }
  }, [checkScreenAccess, trackScreenView]);

  const tomorrow = new Date(Date.now() + DAY_MS);
  const [arriving, setArriving] = useState<Date | null>(null);
  const [leaving, setLeaving] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState<'arriving' | 'leaving' | null>(null);
  const [flexible, setFlexible] = useState(false);

  const nights = arriving && leaving ? nightsBetween(arriving, leaving) : 0;

  const results = useMemo(() => {
    if (search.length < 2) return [];
    const cityResults = searchDestinations(search);
    const q = search.toLowerCase();
    const countryResults = countries
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 4)
      .map((c) => ({ name: c.name, detail: `${c.flag ?? ''} Country` }));
    const seen = new Set(cityResults.map((r) => r.name.toLowerCase()));
    const merged = [
      ...cityResults,
      ...countryResults.filter((r) => !seen.has(r.name.toLowerCase())),
    ];
    return merged.slice(0, 6);
  }, [search]);

  const handleSelect = (name: string) => {
    setDestination(name);
    setSearch('');
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(null);
    if (event.type === 'dismissed') {
      setShowPicker(null);
      return;
    }
    if (!date) return;

    if (showPicker === 'arriving') {
      setArriving(date);
      // Auto-clear leaving if it's before the new arrival
      if (leaving && date >= leaving) setLeaving(null);
      if (Platform.OS === 'ios') return;
      // On Android, auto-open leaving picker after arriving
      setTimeout(() => setShowPicker('leaving'), 300);
    } else {
      setLeaving(date);
      if (Platform.OS === 'android') setShowPicker(null);
    }
  };

  const handleContinue = () => {
    onboardingStore.set('tripDestination', destination || search.trim());
    onboardingStore.set('tripArriving', arriving ? arriving.toISOString() : '');
    onboardingStore.set('tripLeaving', leaving ? leaving.toISOString() : '');
    onboardingStore.set('tripNights', nights);
    onboardingStore.set('tripDates', arriving ? formatDate(arriving) : '');
    onboardingStore.set('tripFlexibleDates', flexible);

    const answered: string[] = [];
    const skipped: string[] = [];

    if (destination || search.trim()) {
      answered.push('trip_destination');
    } else {
      skipped.push('trip_destination');
    }

    if (arriving && leaving) {
      answered.push('trip_dates');
    } else {
      skipped.push('trip_dates');
    }

    navigateToNextScreen('trip-details', {
      answeredQuestions: answered,
      skippedQuestions: skipped,
    });
  };

  const handleSkip = () => {
    skipCurrentScreen('trip-details', ['trip_destination', 'trip_dates']);
  };

  const hasDestination = destination.length > 0 || search.trim().length > 0;

  return (
    <OnboardingScreen
      stage={3}
      screenName="trip-details"
      headline="Where to next?"
      subtitle="You can always change this later"
      ctaLabel={hasDestination ? 'Continue' : 'Skip'}
      onCtaPress={handleContinue}
      onSkip={handleSkip}
    >
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Destination search */}
        <View style={styles.searchContainer}>
          <Ionicons name="location-outline" size={18} color={colors.textMuted} style={styles.icon} />
          <TextInput
            style={styles.searchInput}
            placeholder="City or country..."
            placeholderTextColor={colors.textMuted}
            value={destination || search}
            onChangeText={(text) => {
              setDestination('');
              setSearch(text);
            }}
            autoFocus={false}
          />
          {(destination || search).length > 0 && (
            <Pressable onPress={() => { setDestination(''); setSearch(''); }} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Search results */}
        {results.length > 0 && !destination && (
          <View style={styles.results}>
            {results.map((r, i) => (
              <Pressable
                key={`${r.name}-${i}`}
                style={styles.resultItem}
                onPress={() => handleSelect(r.name)}
              >
                <Text style={styles.resultName}>{r.name}</Text>
                <Text style={styles.resultDetail}>{r.detail}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {search.length >= 2 && results.length === 0 && !destination && (
          <Text style={styles.noResults}>
            No matches found. Type your destination and continue.
          </Text>
        )}

        {/* Date section — appears after destination is picked */}
        {(destination || search.trim()) ? (
          <View style={styles.dateSection}>
            <Text style={styles.dateLabel}>When are you going?</Text>

            <View style={styles.dateRow}>
              <Pressable
                style={[styles.dateCard, arriving && styles.dateCardFilled]}
                onPress={() => setShowPicker('arriving')}
              >
                <Text style={styles.dateCardLabel}>Arriving</Text>
                <Text style={[styles.dateCardValue, arriving && styles.dateCardValueFilled]}>
                  {arriving ? formatDate(arriving) : 'Pick a date'}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.dateCard, leaving && styles.dateCardFilled]}
                onPress={() => {
                  if (!arriving) {
                    setShowPicker('arriving');
                    return;
                  }
                  setShowPicker('leaving');
                }}
              >
                <Text style={styles.dateCardLabel}>Leaving</Text>
                <Text style={[styles.dateCardValue, leaving && styles.dateCardValueFilled]}>
                  {leaving ? formatDate(leaving) : 'Pick a date'}
                </Text>
              </Pressable>
            </View>

            {/* Nights badge + duration */}
            {nights > 0 && (
              <View style={styles.nightsGroup}>
                <View style={styles.nightsBadge}>
                  <Text style={styles.nightsText}>
                    {nights} {nights === 1 ? 'night' : 'nights'}
                  </Text>
                </View>
                <Text style={styles.durationLabel}>{durationLabel(nights)}</Text>
              </View>
            )}

            {/* Flexible dates */}
            <Pressable
              style={[styles.flexibleRow, flexible && styles.flexibleRowActive]}
              onPress={() => setFlexible((f) => !f)}
            >
              <Ionicons
                name={flexible ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={flexible ? colors.orange : colors.textMuted}
              />
              <Text style={[styles.flexibleText, flexible && styles.flexibleTextActive]}>
                I'm flexible on dates
              </Text>
            </Pressable>

            {/* iOS inline picker */}
            {Platform.OS === 'ios' && showPicker && (
              <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>
                    {showPicker === 'arriving' ? 'Arriving' : 'Leaving'}
                  </Text>
                  <Pressable
                    onPress={() => {
                      if (showPicker === 'arriving' && arriving && !leaving) {
                        setShowPicker('leaving');
                      } else {
                        setShowPicker(null);
                      }
                    }}
                  >
                    <Text style={styles.pickerDone}>
                      {showPicker === 'arriving' && arriving && !leaving ? 'Next' : 'Done'}
                    </Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={
                    showPicker === 'arriving'
                      ? arriving || tomorrow
                      : leaving || new Date((arriving?.getTime() || Date.now()) + DAY_MS)
                  }
                  mode="date"
                  display="inline"
                  minimumDate={
                    showPicker === 'arriving'
                      ? tomorrow
                      : new Date((arriving?.getTime() || Date.now()) + DAY_MS)
                  }
                  onChange={handleDateChange}
                  accentColor={colors.orange}
                />
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>

      {/* Android picker modal */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={
            showPicker === 'arriving'
              ? arriving || tomorrow
              : leaving || new Date((arriving?.getTime() || Date.now()) + DAY_MS)
          }
          mode="date"
          display="default"
          minimumDate={
            showPicker === 'arriving'
              ? tomorrow
              : new Date((arriving?.getTime() || Date.now()) + DAY_MS)
          }
          onChange={handleDateChange}
        />
      )}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
  },
  results: {
    marginTop: 8,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  noResults: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
  },
  dateSection: {
    marginTop: 24,
  },
  dateLabel: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateCard: {
    flex: 1,
    height: 64,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  dateCardFilled: {
    borderWidth: 2,
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  dateCardLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  dateCardValue: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textMuted,
  },
  dateCardValueFilled: {
    color: colors.textPrimary,
  },
  nightsGroup: {
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  nightsBadge: {
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  nightsText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.orange,
  },
  durationLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  flexibleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  flexibleRowActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  flexibleText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  flexibleTextActive: {
    color: colors.textPrimary,
  },
  pickerContainer: {
    marginTop: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerTitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  pickerDone: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.orange,
  },
});
