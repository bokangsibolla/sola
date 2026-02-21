// app/(tabs)/discover/index.tsx
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import AvatarButton from '@/components/AvatarButton';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { EditorialHero } from '@/components/explore/EditorialHero';
import { ContinentFilter } from '@/components/explore/ContinentFilter';
import { CountryShowcaseCard } from '@/components/explore/CountryShowcaseCard';
import { useExploreData } from '@/data/discover/useExploreData';
import type { ContinentKey } from '@/data/discover/types';
import type { Country } from '@/data/types';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';
import { FLOATING_TAB_BAR_HEIGHT } from '@/components/TabBar';

// ── Inline: search trigger ─────────────────────────────────

function SearchTrigger({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.searchBar, pressed && { opacity: pressedState.opacity }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Search destinations"
    >
      <Feather name="search" size={18} color={colors.textMuted} />
      <Text style={styles.searchText}>Find a destination</Text>
    </Pressable>
  );
}

// ── Main screen ─────────────────────────────────────────────

export default function DiscoverScreen() {
  const { featuredCountry, countries, continents, isLoading, error, refresh } =
    useExploreData();
  const router = useRouter();
  const [selectedContinent, setSelectedContinent] = useState<ContinentKey | null>(null);

  const filteredCountries = useMemo(
    () =>
      selectedContinent
        ? countries.filter((c) => c.continent === selectedContinent)
        : countries,
    [countries, selectedContinent],
  );

  // Pair countries into rows of 2
  const gridRows = useMemo(() => {
    const rows: Country[][] = [];
    for (let i = 0; i < filteredCountries.length; i += 2) {
      rows.push(filteredCountries.slice(i, i + 2));
    }
    return rows;
  }, [filteredCountries]);

  const headerActions = <AvatarButton />;

  // Loading
  if (isLoading && countries.length === 0) {
    return (
      <AppScreen>
        <NavigationHeader title="Discover" rightActions={headerActions} />
        <LoadingScreen />
      </AppScreen>
    );
  }

  // Error
  if (error && countries.length === 0) {
    return (
      <AppScreen>
        <NavigationHeader title="Discover" rightActions={headerActions} />
        <ErrorScreen message="Something went wrong" onRetry={refresh} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <NavigationHeader title="Discover" rightActions={headerActions} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} />
        }
      >
        {/* Search trigger */}
        <View style={styles.searchWrap}>
          <SearchTrigger
            onPress={() => router.push('/(tabs)/discover/search')}
          />
        </View>

        {/* Editorial hero */}
        {featuredCountry && (
          <View style={styles.heroWrap}>
            <EditorialHero country={featuredCountry} />
          </View>
        )}

        {/* Continent filter */}
        {continents.length > 0 && (
          <View style={styles.filterWrap}>
            <ContinentFilter
              continents={continents}
              selected={selectedContinent}
              onSelect={setSelectedContinent}
            />
          </View>
        )}

        {/* Country grid */}
        {filteredCountries.length > 0 ? (
          <View style={styles.gridWrap}>
            {gridRows.map((row, idx) => (
              <View key={idx} style={styles.gridRow}>
                {row.map((country) => (
                  <CountryShowcaseCard key={country.id} country={country} />
                ))}
                {row.length === 1 && <View style={styles.gridSpacer} />}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>
              No countries yet
            </Text>
          </View>
        )}
      </ScrollView>
    </AppScreen>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: FLOATING_TAB_BAR_HEIGHT + spacing.xl,
  },

  // Search
  searchWrap: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    height: 48,
    gap: spacing.sm,
  },
  searchText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },

  // Hero
  heroWrap: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.moduleInset,
  },

  // Filter
  filterWrap: {
    marginTop: spacing.moduleInset,
  },

  // Grid
  gridWrap: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.moduleInset,
    gap: spacing.lg,
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  gridSpacer: {
    flex: 1,
  },

  // Empty
  emptyWrap: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.xxxxl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
});
