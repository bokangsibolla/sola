import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  colors,
  fonts,
  spacing,
  radius,
  typography,
  pressedState,
} from '@/constants/design';
import { searchDestinations, type DestinationResult } from '@/data/api';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const heroImage = require('@/assets/images/pexels-women-travelers-sunny.jpg');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CheckInPromptProps {
  gpsSuggestion: { cityName: string; countryName: string | null } | null;
  gpsLoading: boolean;
  tripCities: Array<{
    cityId: string;
    cityName: string;
    countryName: string | null;
  }>;
  onCheckIn: (
    cityId: string,
    cityName: string,
    countryName: string | null,
  ) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const CheckInPrompt: React.FC<CheckInPromptProps> = ({
  gpsSuggestion,
  gpsLoading,
  tripCities,
  onCheckIn,
}) => {
  // ---- GPS resolution ----
  const [resolvedGps, setResolvedGps] = useState<DestinationResult | null>(
    null,
  );
  const [gpsResolveFailed, setGpsResolveFailed] = useState(false);

  useEffect(() => {
    if (!gpsSuggestion) return;
    let cancelled = false;

    (async () => {
      try {
        const results = await searchDestinations(gpsSuggestion.cityName);
        const city = results.find((r) => r.type === 'city');
        if (!cancelled) {
          if (city) {
            setResolvedGps(city);
          } else {
            setGpsResolveFailed(true);
          }
        }
      } catch {
        if (!cancelled) setGpsResolveFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [gpsSuggestion]);

  // ---- Search ----
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DestinationResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = text.trim();
    if (trimmed.length === 0) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchDestinations(trimmed);
        setSearchResults(results.filter((r) => r.type === 'city'));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  // ---- Press handlers ----
  const [submitting, setSubmitting] = useState(false);

  const handleGpsPress = useCallback(async () => {
    if (!resolvedGps || submitting) return;
    setSubmitting(true);
    try {
      await onCheckIn(resolvedGps.id, resolvedGps.name, resolvedGps.parentName);
    } finally {
      setSubmitting(false);
    }
  }, [resolvedGps, submitting, onCheckIn]);

  const handleTripCityPress = useCallback(
    async (cityId: string, cityName: string, countryName: string | null) => {
      if (submitting) return;
      setSubmitting(true);
      try {
        await onCheckIn(cityId, cityName, countryName);
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, onCheckIn],
  );

  const handleSearchResultPress = useCallback(
    async (result: DestinationResult) => {
      if (submitting) return;
      setSubmitting(true);
      try {
        await onCheckIn(result.id, result.name, result.parentName);
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, onCheckIn],
  );

  // ---- Render helpers ----
  const showGpsCard = !gpsLoading && gpsSuggestion && resolvedGps && !gpsResolveFailed;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Hero image */}
      <View style={styles.heroContainer}>
        <Image source={heroImage} style={styles.heroImage} contentFit="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.6)', colors.background]}
          locations={[0.3, 0.7, 1]}
          style={styles.heroGradient}
        />
      </View>

      {/* Heading */}
      <Text style={styles.heading}>Set your location</Text>
      <Text style={styles.subheading}>
        Show women nearby what city or area you're in.
      </Text>

      {/* GPS loading state */}
      {gpsLoading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.orange} />
          <Text style={styles.loadingText}>Detecting your location...</Text>
        </View>
      )}

      {/* GPS suggestion card */}
      {showGpsCard && (
        <Pressable
          style={({ pressed }) => [styles.optionCard, pressed && styles.pressed]}
          onPress={handleGpsPress}
          disabled={submitting}
        >
          <Ionicons name="location" size={20} color={colors.orange} />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle} numberOfLines={1}>
              {resolvedGps.name}
              {resolvedGps.parentName ? `, ${resolvedGps.parentName}` : ''}
            </Text>
            <Text style={styles.optionSubtitle}>Based on your location</Text>
          </View>
        </Pressable>
      )}

      {/* Trip city quick-picks */}
      {tripCities.map((city) => (
        <Pressable
          key={city.cityId}
          style={({ pressed }) => [styles.optionCard, pressed && styles.pressed]}
          onPress={() =>
            handleTripCityPress(city.cityId, city.cityName, city.countryName)
          }
          disabled={submitting}
        >
          <Ionicons name="airplane" size={20} color={colors.orange} />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle} numberOfLines={1}>
              {city.cityName}
              {city.countryName ? `, ${city.countryName}` : ''}
            </Text>
            <Text style={styles.optionSubtitle}>From your upcoming trip</Text>
          </View>
        </Pressable>
      ))}

      {/* Search input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputRow}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search a city..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={handleQueryChange}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>

        {/* Search results */}
        {searching && (
          <View style={styles.searchLoadingRow}>
            <ActivityIndicator size="small" color={colors.orange} />
          </View>
        )}
        {searchResults.map((result) => (
          <Pressable
            key={result.id}
            style={({ pressed }) => [
              styles.searchResultRow,
              pressed && styles.pressed,
            ]}
            onPress={() => handleSearchResultPress(result)}
            disabled={submitting}
          >
            <Text style={styles.searchResultText} numberOfLines={1}>
              {result.name}
              {result.parentName ? `, ${result.parentName}` : ''}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Setting note */}
      <Text style={styles.reassurance}>
        Only your city is shared. You can change or clear this anytime.
      </Text>
    </ScrollView>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxxxl,
    gap: spacing.md,
  },

  // Hero
  heroContainer: {
    height: 220,
    marginBottom: spacing.sm,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },

  // Heading
  heading: {
    ...typography.h2,
    color: colors.textPrimary,
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.xs,
  },
  subheading: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textSecondary,
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.lg,
  },

  // GPS loading
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },

  // Option cards (GPS + trip cities)
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginHorizontal: spacing.screenX,
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform as unknown as { scale: number }[],
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  optionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Search
  searchContainer: {
    gap: 0,
    paddingHorizontal: spacing.screenX,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
    padding: 0,
  },
  searchLoadingRow: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  searchResultRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  searchResultText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },

  // Reassurance
  reassurance: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.screenX,
  },
});
