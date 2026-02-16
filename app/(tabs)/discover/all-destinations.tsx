// app/(tabs)/discover/all-destinations.tsx
// Unified Browse Destinations — continent tabs → country rows → city chips
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import ScreenHeader from '@/components/ui/ScreenHeader';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { fetchBrowseData } from '@/data/discover/discoverApi';
import { CONTINENT_LABELS, CONTINENT_ORDER } from '@/data/discover/types';
import type { BrowseCountry, ContinentKey } from '@/data/discover/types';
import { colors, fonts, spacing, pressedState } from '@/constants/design';

// ── Screen ──────────────────────────────────────────────────

export default function AllDestinationsScreen() {
  const router = useRouter();
  const listRef = useRef<FlatList>(null);

  const [browseData, setBrowseData] = useState<Map<ContinentKey, BrowseCountry[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContinent, setSelectedContinent] = useState<ContinentKey | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBrowseData();
      setBrowseData(data);

      // Select the first continent that has data
      const firstWithData = CONTINENT_ORDER.find((key) => data.has(key)) ?? null;
      setSelectedContinent(firstWithData);
    } catch {
      setError('Could not load destinations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Continents that actually have data, in display order
  const availableContinents = useMemo(() => {
    if (!browseData) return [];
    return CONTINENT_ORDER.filter((key) => browseData.has(key));
  }, [browseData]);

  // Countries for the selected continent
  const countries = useMemo(() => {
    if (!browseData || !selectedContinent) return [];
    return browseData.get(selectedContinent) ?? [];
  }, [browseData, selectedContinent]);

  const handleContinentPress = useCallback(
    (continent: ContinentKey) => {
      setSelectedContinent(continent);
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    },
    [],
  );

  // ── Loading / error states ──────────────────────────────────

  if (loading) {
    return (
      <AppScreen>
        <View style={styles.headerWrap}>
          <ScreenHeader title="Browse destinations" />
        </View>
        <LoadingScreen />
      </AppScreen>
    );
  }

  if (error || !browseData) {
    return (
      <AppScreen>
        <View style={styles.headerWrap}>
          <ScreenHeader title="Browse destinations" />
        </View>
        <ErrorScreen message={error ?? 'Something went wrong'} onRetry={load} />
      </AppScreen>
    );
  }

  // ── Main content ────────────────────────────────────────────

  return (
    <AppScreen>
      <View style={styles.headerWrap}>
        <ScreenHeader title="Browse destinations" />
      </View>

      {/* Continent tabs */}
      <View style={styles.tabBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          {availableContinents.map((key) => {
            const isSelected = key === selectedContinent;
            return (
              <Pressable
                key={key}
                onPress={() => handleContinentPress(key)}
                style={styles.tab}
              >
                <Text
                  style={[
                    styles.tabText,
                    isSelected && styles.tabTextSelected,
                  ]}
                >
                  {CONTINENT_LABELS[key]}
                </Text>
                {isSelected && <View style={styles.tabUnderline} />}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Country list */}
      <FlatList
        ref={listRef}
        data={countries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CountryRow country={item} router={router} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No destinations yet</Text>
          </View>
        }
      />
    </AppScreen>
  );
}

// ── Country row ─────────────────────────────────────────────

interface CountryRowProps {
  country: BrowseCountry;
  router: ReturnType<typeof useRouter>;
}

function CountryRow({ country, router }: CountryRowProps) {
  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/discover/country/${country.slug}`)}
      style={({ pressed }) => [styles.countryRow, pressed && styles.pressed]}
    >
      <View style={styles.countryContent}>
        <View style={styles.countryNameRow}>
          <Text style={styles.countryName}>{country.name}</Text>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </View>
        {country.cities.length > 0 && (
          <View style={styles.cityChips}>
            {country.cities.map((city, index) => (
              <React.Fragment key={city.id}>
                {index > 0 && (
                  <Text style={styles.citySeparator}>{' \u00B7 '}</Text>
                )}
                <Pressable
                  onPress={() =>
                    router.push(`/(tabs)/discover/city/${city.slug}`)
                  }
                  hitSlop={4}
                >
                  <Text style={styles.cityName}>{city.name}</Text>
                </Pressable>
              </React.Fragment>
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  headerWrap: {
    paddingHorizontal: spacing.screenX,
  },

  // Tab bar
  tabBarContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  tabBar: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.xl,
  },
  tab: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  tabTextSelected: {
    color: colors.textPrimary,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.orange,
  },

  // Country list
  listContent: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.xxxxl,
  },
  countryRow: {
    minHeight: 44,
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    paddingVertical: spacing.lg,
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },
  countryContent: {
    gap: spacing.xs,
  },
  countryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countryName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  cityChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  citySeparator: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  cityName: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Empty state
  emptyContainer: {
    paddingTop: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
});
