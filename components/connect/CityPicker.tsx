import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, fonts } from '@/constants/design';
import { searchDestinations, DestinationResult } from '@/data/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CityPickerProps {
  visible: boolean;
  onClose: () => void;
  onCitySelect: (cityId: string, cityName: string, countryName: string | null) => void;
  onCheckOut?: () => void;
  currentCityName?: string | null;
  tripCities?: Array<{ cityId: string; cityName: string; countryName: string | null }>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CityPicker({
  visible,
  onClose,
  onCitySelect,
  onCheckOut,
  currentCityName,
  tripCities,
}: CityPickerProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DestinationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state when sheet closes
  useEffect(() => {
    if (!visible) {
      setQuery('');
      setResults([]);
      setLoading(false);
    }
  }, [visible]);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = text.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const allResults = await searchDestinations(trimmed);
        const cityResults = allResults.filter((r) => r.type === 'city');
        setResults(cityResults);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const handleCitySelect = useCallback(
    (cityId: string, cityName: string, countryName: string | null) => {
      onCitySelect(cityId, cityName, countryName);
      onClose();
    },
    [onCitySelect, onClose],
  );

  const renderResult = useCallback(
    ({ item, index }: { item: DestinationResult; index: number }) => (
      <Pressable
        style={({ pressed }) => [styles.resultRow, pressed && styles.resultRowPressed]}
        onPress={() => handleCitySelect(item.id, item.name, item.parentName)}
      >
        <Text style={styles.resultName}>{item.name}</Text>
        {item.parentName && <Text style={styles.resultCountry}>{item.parentName}</Text>}
        {index < results.length - 1 && <View style={styles.resultDivider} />}
      </Pressable>
    ),
    [handleCitySelect, results.length],
  );

  const hasTripCities = tripCities && tripCities.length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.container, { paddingBottom: insets.bottom + spacing.lg }]}>
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Change location</Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              style={({ pressed }) => pressed && styles.closePressed}
            >
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </View>

          {/* Trip city pills */}
          {hasTripCities && (
            <View style={styles.tripSection}>
              <Text style={styles.tripLabel}>FROM YOUR TRIPS</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillRow}
              >
                {tripCities.map((city) => {
                  const isCurrent =
                    currentCityName != null &&
                    city.cityName.toLowerCase() === currentCityName.toLowerCase();
                  return (
                    <Pressable
                      key={city.cityId}
                      style={[styles.pill, isCurrent && styles.pillActive]}
                      onPress={() =>
                        handleCitySelect(city.cityId, city.cityName, city.countryName)
                      }
                    >
                      <Text style={styles.pillText}>{city.cityName}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Search input */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={18}
              color={colors.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search a city..."
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={handleSearch}
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>

          {/* Search results */}
          {loading && (
            <ActivityIndicator
              size="small"
              color={colors.orange}
              style={styles.loader}
            />
          )}

          {!loading && results.length > 0 && (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={renderResult}
              style={styles.resultsList}
              keyboardShouldPersistTaps="handled"
            />
          )}

          {!loading && query.trim().length > 0 && results.length === 0 && (
            <Text style={styles.emptyText}>No cities found</Text>
          )}

          {/* Check out option */}
          {onCheckOut && currentCityName && (
            <Pressable
              style={({ pressed }) => [styles.checkOutRow, pressed && styles.resultRowPressed]}
              onPress={() => {
                onCheckOut();
                onClose();
              }}
            >
              <Ionicons name="log-out-outline" size={18} color={colors.textMuted} />
              <Text style={styles.checkOutText}>Clear location</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.xl,
    borderTopRightRadius: spacing.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.screenX,
    maxHeight: '80%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: radius.xs,
    backgroundColor: colors.borderDefault,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  closePressed: {
    opacity: 0.5,
  },
  tripSection: {
    marginBottom: spacing.lg,
  },
  tripLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 0.5,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  pillRow: {
    gap: spacing.sm,
  },
  pill: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pillActive: {
    backgroundColor: colors.orangeFill,
    borderColor: colors.orange,
    borderWidth: 1,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  searchIcon: {
    position: 'absolute',
    left: spacing.md,
    top: 14,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.input,
    padding: spacing.md,
    paddingLeft: spacing.xl + spacing.md,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  loader: {
    marginTop: spacing.lg,
  },
  resultsList: {
    maxHeight: 300,
  },
  resultRow: {
    paddingVertical: spacing.md,
  },
  resultRowPressed: {
    opacity: 0.7,
  },
  resultName: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  resultCountry: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  resultDivider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginTop: spacing.md,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  checkOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  checkOutText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textMuted,
  },
});
