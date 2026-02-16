// app/(tabs)/discover/continent/[key].tsx
// Continent detail — country list with search + sort
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { useBrowseData } from '@/data/discover/useBrowseData';
import {
  CONTINENT_LABELS,
} from '@/data/discover/types';
import type {
  ContinentKey,
  BrowseCountryWithMeta,
  CountrySortOption,
} from '@/data/discover/types';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';

// ── Sort chips ──────────────────────────────────────────────

const SORT_OPTIONS: { key: CountrySortOption; label: string }[] = [
  { key: 'popular', label: 'Most popular' },
  { key: 'discussed', label: 'Most discussed' },
  { key: 'alphabetical', label: 'Alphabetical' },
];

function SortChips({
  active,
  onChange,
}: {
  active: CountrySortOption;
  onChange: (s: CountrySortOption) => void;
}) {
  return (
    <View style={styles.chipsRow}>
      {SORT_OPTIONS.map((opt) => {
        const isActive = active === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Country row ─────────────────────────────────────────────

function CountryRow({
  country,
  onPress,
}: {
  country: BrowseCountryWithMeta;
  onPress: () => void;
}) {
  const cityCount = country.cities.length;
  const postCount = country.communityPostCount;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.countryRow, pressed && styles.pressed]}
    >
      <Image
        source={{ uri: country.heroImageUrl ?? undefined }}
        style={styles.countryImage}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.countryBody}>
        <Text style={styles.countryName} numberOfLines={1}>{country.name}</Text>
        <Text style={styles.countryMeta} numberOfLines={1}>
          {cityCount} {cityCount === 1 ? 'city' : 'cities'}
          {postCount > 0 && ` · ${postCount} community ${postCount === 1 ? 'post' : 'posts'}`}
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

// ── Main screen ──────────────────────────────────────────────

export default function ContinentDetailScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const router = useRouter();
  const { countriesByContinent, isLoading, error, refresh } = useBrowseData();

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<CountrySortOption>('popular');

  const continentKey = key as ContinentKey;
  const label = CONTINENT_LABELS[continentKey] ?? key;
  const countries = countriesByContinent[continentKey] ?? [];

  const filtered = useMemo(() => {
    let list = [...countries];

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }

    // Sort
    switch (sort) {
      case 'discussed':
        list.sort((a, b) => b.communityPostCount - a.communityPostCount);
        break;
      case 'alphabetical':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popular':
      default:
        // Keep editorial order (already sorted by orderIndex from API)
        break;
    }

    return list;
  }, [countries, search, sort]);

  const backButton = (
    <Pressable onPress={() => router.back()} hitSlop={8}>
      <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
    </Pressable>
  );

  if (isLoading && countries.length === 0) {
    return (
      <AppScreen>
        <AppHeader title="" leftComponent={backButton} />
        <LoadingScreen />
      </AppScreen>
    );
  }

  if (error && countries.length === 0) {
    return (
      <AppScreen>
        <AppHeader title="" leftComponent={backButton} />
        <ErrorScreen message="Could not load countries" onRetry={refresh} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <AppHeader title="" leftComponent={backButton} />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.pageTitle}>{label}</Text>

            {/* Search bar */}
            <View style={styles.searchBar}>
              <Feather name="search" size={16} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search countries"
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')} hitSlop={8}>
                  <Feather name="x" size={16} color={colors.textMuted} />
                </Pressable>
              )}
            </View>

            {/* Sort chips */}
            <SortChips active={sort} onChange={setSort} />
          </View>
        }
        renderItem={({ item }) => (
          <CountryRow
            country={item}
            onPress={() => router.push(`/(tabs)/discover/country/${item.slug}` as any)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {search ? 'No countries match your search' : 'No countries found'}
          </Text>
        }
      />
    </AppScreen>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  pageTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
    padding: 0,
  },

  // Sort chips
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.orange,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },

  // List
  listContent: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.xxxxl,
  },

  // Country row
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },
  countryImage: {
    width: 80,
    height: 80,
    backgroundColor: colors.neutralFill,
  },
  countryBody: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  countryName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  countryMeta: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
});
