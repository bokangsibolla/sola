// app/(tabs)/explore/all-destinations.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { CountryCard } from '@/components/explore/cards/CountryCard';
import * as Sentry from '@sentry/react-native';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';
import { getCountries, getAllCities } from '@/data/api';
import type { Country, City } from '@/data/types';

interface CityRow extends City {
  countryName: string;
  countrySlug: string;
}

interface Section {
  title: string;
  data: CityRow[];
}

export default function AllDestinationsScreen() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [allCountries, allCities] = await Promise.all([
          getCountries(),
          getAllCities(),
        ]);

        setCountries(allCountries);

        // Build country lookup
        const countryMap = new Map<string, Country>();
        for (const c of allCountries) {
          countryMap.set(c.id, c);
        }

        // Group cities by country
        const grouped = new Map<string, CityRow[]>();
        for (const city of allCities) {
          const country = countryMap.get(city.countryId);
          if (!country) continue;
          const row: CityRow = {
            ...city,
            countryName: country.name,
            countrySlug: country.slug,
          };
          const existing = grouped.get(country.name);
          if (existing) {
            existing.push(row);
          } else {
            grouped.set(country.name, [row]);
          }
        }

        // Sort by country order then build sections
        const sortedCountryNames = allCountries.map((c) => c.name);
        const sectionList: Section[] = [];
        for (const name of sortedCountryNames) {
          const cities = grouped.get(name);
          if (cities && cities.length > 0) {
            sectionList.push({ title: name, data: cities });
          }
        }
        setSections(sectionList);
      } catch (err) {
        Sentry.captureException(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredSections = useMemo(() => {
    if (!search.trim()) return sections;
    const q = search.toLowerCase();
    return sections
      .map((section) => ({
        ...section,
        data: section.data.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.countryName.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.data.length > 0);
  }, [sections, search]);

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return countries;
    const q = search.toLowerCase();
    return countries.filter((c) => c.name.toLowerCase().includes(q));
  }, [countries, search]);

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
        <Text style={styles.sectionHeaderCount}>
          {section.data.length} {section.data.length === 1 ? 'city' : 'cities'}
        </Text>
      </View>
    ),
    []
  );

  const renderCity = useCallback(
    ({ item }: { item: CityRow }) => (
      <Pressable
        style={({ pressed }) => [styles.cityItem, pressed && styles.pressed]}
        onPress={() => router.push(`/(tabs)/explore/city/${item.slug}`)}
      >
        <Image
          source={{ uri: item.heroImageUrl ?? undefined }}
          style={styles.cityImage}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.cityContent}>
          <Text style={styles.cityName}>{item.name}</Text>
          {item.shortBlurb && (
            <Text style={styles.cityBlurb} numberOfLines={2}>
              {item.shortBlurb}
            </Text>
          )}
        </View>
      </Pressable>
    ),
    [router]
  );

  const countriesHeader = useCallback(
    () => (
      <View style={styles.countriesSection}>
        <Text style={styles.pageTitle}>Where do you want to go?</Text>
        <Text style={styles.pageSubtitle}>
          Countries, cities, and places across Southeast Asia and beyond
        </Text>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search destinations"
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Feather name="x" size={16} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Countries grid */}
        {filteredCountries.length > 0 && (
          <>
            <Text style={styles.countriesSectionTitle}>Countries</Text>
            <View style={styles.countriesGrid}>
              {filteredCountries.map((country, index) => (
                <CountryCard
                  key={country.id}
                  country={country}
                  index={index}
                  onPress={() =>
                    router.push(`/(tabs)/explore/country/${country.slug}`)
                  }
                />
              ))}
            </View>
          </>
        )}

        {/* Cities divider */}
        {filteredSections.length > 0 && (
          <Text style={styles.countriesSectionTitle}>Cities</Text>
        )}
      </View>
    ),
    [filteredCountries, filteredSections.length, search, router]
  );

  return (
    <AppScreen>
      <AppHeader title="Destinations" />
      <SectionList
        sections={filteredSections}
        renderItem={renderCity}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={countriesHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No destinations found</Text>
            </View>
          )
        }
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: spacing.xxxxl,
  },
  countriesSection: {
    paddingHorizontal: spacing.screenX,
  },
  pageTitle: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  pageSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
  },
  countriesSectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  countriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },

  // Section headers (country names in city list)
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  sectionHeaderText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  sectionHeaderCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },

  // City items
  cityItem: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.sm,
  },
  cityImage: {
    width: 72,
    height: 72,
    borderRadius: radius.card,
    backgroundColor: colors.neutralFill,
  },
  cityContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cityName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  cityBlurb: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
});
