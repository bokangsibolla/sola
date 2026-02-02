import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import { onboardingStore } from '@/state/onboardingStore';
import { searchDestinations } from '@/data/cities';
import { countries } from '@/data/geo';
import { colors, fonts, radius } from '@/constants/design';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const currentYear = new Date().getFullYear();
const YEARS = [currentYear, currentYear + 1, currentYear + 2];

export default function TripDetailsScreen() {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const results = useMemo(() => {
    if (search.length < 2) return [];
    const cityResults = searchDestinations(search);

    // Also search countries as fallback
    const q = search.toLowerCase();
    const countryResults = countries
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 4)
      .map((c) => ({ name: c.name, detail: `${c.flag ?? ''} Country` }));

    // Merge: cities first, then countries not already covered
    const seen = new Set(cityResults.map((r) => r.name.toLowerCase()));
    const merged = [
      ...cityResults,
      ...countryResults.filter((r) => !seen.has(r.name.toLowerCase())),
    ];
    return merged.slice(0, 8);
  }, [search]);

  const handleSelect = (name: string) => {
    setDestination(name);
    setSearch('');
  };

  const handleContinue = () => {
    onboardingStore.set('tripDestination', destination || search.trim());
    const dateStr = selectedMonth ? `${selectedMonth} ${selectedYear}` : '';
    onboardingStore.set('tripDates', dateStr);
    router.push('/(onboarding)/day-style');
  };

  // Can continue even without filling anything (it's optional)
  const hasDestination = destination.length > 0 || search.trim().length > 0;

  return (
    <OnboardingScreen
      stage={3}
      headline="Where are you headed?"
      subtitle="Optional — you can always add this later"
      ctaLabel={hasDestination ? 'Continue' : 'Skip'}
      onCtaPress={handleContinue}
    >
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

      {/* No results message */}
      {search.length >= 2 && results.length === 0 && !destination && (
        <Text style={styles.noResults}>
          No matches — just type your destination and continue
        </Text>
      )}

      {/* Month picker */}
      {(destination || search.trim()) ? (
        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>When are you going?</Text>
          <View style={styles.monthGrid}>
            {MONTHS.map((m) => (
              <Pressable
                key={m}
                style={[styles.monthPill, selectedMonth === m && styles.monthPillSelected]}
                onPress={() => setSelectedMonth(selectedMonth === m ? '' : m)}
              >
                <Text style={[styles.monthText, selectedMonth === m && styles.monthTextSelected]}>
                  {m}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.yearRow}>
            {YEARS.map((y) => (
              <Pressable
                key={y}
                style={[styles.yearPill, selectedYear === y && styles.yearPillSelected]}
                onPress={() => setSelectedYear(y)}
              >
                <Text style={[styles.yearText, selectedYear === y && styles.yearTextSelected]}>
                  {y}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
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
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  monthPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  monthPillSelected: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  monthText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  monthTextSelected: {
    color: colors.orange,
  },
  yearRow: {
    flexDirection: 'row',
    gap: 8,
  },
  yearPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  yearPillSelected: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  yearText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  yearTextSelected: {
    color: colors.orange,
  },
});
