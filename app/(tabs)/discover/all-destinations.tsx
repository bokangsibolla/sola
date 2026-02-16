// app/(tabs)/discover/all-destinations.tsx
// Browse all destinations — visual country cards with city chips
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Sentry from '@sentry/react-native';
import AppScreen from '@/components/AppScreen';
import ScreenHeader from '@/components/ui/ScreenHeader';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { getCountries, getCitiesByCountry } from '@/data/api';
import type { Country, City } from '@/data/types';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';

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

      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.breadcrumbLink}>Discover</Text>
        </Pressable>
        <Text style={styles.breadcrumbSep}>/</Text>
        <Text style={styles.breadcrumbCurrent}>All destinations</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.country.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CountryCard item={item} router={router} />
        )}
      />
    </AppScreen>
  );
}

// ── Country card ────────────────────────────────────────────

function CountryCard({
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
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {/* Country image */}
      <Image
        source={{ uri: country.heroImageUrl ?? undefined }}
        style={styles.cardImage}
        contentFit="cover"
        transition={200}
      />

      {/* Text content */}
      <View style={styles.cardBody}>
        <View style={styles.cardNameRow}>
          <Text style={styles.cardName} numberOfLines={1}>
            {country.name}
          </Text>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </View>
        {cities.length > 0 && (
          <Text style={styles.cardCities} numberOfLines={1}>
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

  // Breadcrumb
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  breadcrumbLink: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
  breadcrumbSep: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  breadcrumbCurrent: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },

  // List
  listContent: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.xxxxl,
    gap: spacing.md,
  },

  // Country card — image left, text right
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },
  cardImage: {
    width: 80,
    height: 80,
    backgroundColor: colors.neutralFill,
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  cardCities: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
