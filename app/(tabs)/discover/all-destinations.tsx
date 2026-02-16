// app/(tabs)/discover/all-destinations.tsx
// Browse all destinations — flat list of countries with city chips
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Sentry from '@sentry/react-native';
import AppScreen from '@/components/AppScreen';
import ScreenHeader from '@/components/ui/ScreenHeader';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { getCountries, getCitiesByCountry } from '@/data/api';
import type { Country, City } from '@/data/types';
import { colors, fonts, spacing, pressedState } from '@/constants/design';

interface CountryWithCities {
  country: Country;
  cities: City[];
}

export default function AllDestinationsScreen() {
  const router = useRouter();
  const [data, setData] = useState<CountryWithCities[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const countries = await getCountries();

      // Fetch cities for each country in parallel
      const results = await Promise.all(
        countries.map(async (country) => {
          try {
            const cities = await getCitiesByCountry(country.id);
            return { country, cities };
          } catch {
            return { country, cities: [] as City[] };
          }
        }),
      );

      setData(results);
    } catch (e) {
      setError('Could not load destinations. Please try again.');
      Sentry.captureException(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  if (error || data.length === 0) {
    return (
      <AppScreen>
        <View style={styles.headerWrap}>
          <ScreenHeader title="Browse destinations" />
        </View>
        <ErrorScreen message={error ?? 'No destinations found'} onRetry={load} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View style={styles.headerWrap}>
        <ScreenHeader title="Browse destinations" />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.country.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CountryRow item={item} router={router} />
        )}
      />
    </AppScreen>
  );
}

// ── Country row ─────────────────────────────────────────────

function CountryRow({
  item,
  router,
}: {
  item: CountryWithCities;
  router: ReturnType<typeof useRouter>;
}) {
  const { country, cities } = item;

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
        {cities.length > 0 && (
          <Text style={styles.cityList} numberOfLines={2}>
            {cities.map((c) => c.name).join(' · ')}
          </Text>
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
  listContent: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
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
  cityList: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
