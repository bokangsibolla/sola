// app/(tabs)/discover/continent/[name].tsx
// Shows all countries in a continent as a 3-per-row grid
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sentry from '@sentry/react-native';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import MenuButton from '@/components/MenuButton';
import LoadingScreen from '@/components/LoadingScreen';
import { getCountries } from '@/data/api';
import type { Country } from '@/data/types';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';

// ── Continent → ISO2 mapping ────────────────────────────────

const CONTINENT_COUNTRIES: Record<string, string[]> = {
  asia: [
    'TH', 'VN', 'ID', 'PH', 'KH', 'MM', 'LA', 'MY', 'SG', 'BN',
    'TL', 'IN', 'LK', 'NP', 'BT', 'BD', 'MV', 'JP', 'KR', 'CN',
    'TW', 'HK', 'MO', 'MN', 'UZ', 'KZ', 'KG', 'TJ', 'GE', 'AM',
    'AZ', 'TR', 'JO', 'IL', 'LB', 'OM', 'AE', 'QA', 'BH', 'KW',
  ],
  europe: [
    'FR', 'DE', 'IT', 'ES', 'PT', 'GB', 'IE', 'NL', 'BE', 'CH',
    'AT', 'GR', 'HR', 'ME', 'AL', 'MK', 'RS', 'BA', 'SI', 'CZ',
    'SK', 'PL', 'HU', 'RO', 'BG', 'DK', 'SE', 'NO', 'FI', 'IS',
    'EE', 'LV', 'LT', 'MT', 'CY', 'LU', 'MC', 'AD',
  ],
  africa: [
    'ZA', 'KE', 'TZ', 'MA', 'EG', 'GH', 'NG', 'SN', 'ET', 'RW',
    'UG', 'MZ', 'MG', 'MU', 'SC', 'CV', 'NA', 'BW', 'ZM', 'ZW',
    'TN', 'DZ', 'CM', 'CI',
  ],
};

const CONTINENT_LABELS: Record<string, string> = {
  asia: 'Asia',
  europe: 'Europe',
  africa: 'Africa',
};

// ── Grid sizing ─────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = spacing.sm;
const CARD_SIZE = (SCREEN_WIDTH - spacing.screenX * 2 - GRID_GAP * 2) / 3;

function chunk<T>(arr: T[], n: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += n) {
    result.push(arr.slice(i, i + n));
  }
  return result;
}

// ── Breadcrumb ──────────────────────────────────────────────

function Breadcrumb({
  continentLabel,
  onDiscover,
  onContinents,
}: {
  continentLabel: string;
  onDiscover: () => void;
  onContinents: () => void;
}) {
  return (
    <View style={styles.breadcrumb}>
      <Pressable onPress={onDiscover} hitSlop={8}>
        <Text style={styles.breadcrumbLink}>Discover</Text>
      </Pressable>
      <Text style={styles.breadcrumbSep}>/</Text>
      <Pressable onPress={onContinents} hitSlop={8}>
        <Text style={styles.breadcrumbLink}>Continents</Text>
      </Pressable>
      <Text style={styles.breadcrumbSep}>/</Text>
      <Text style={styles.breadcrumbCurrent}>{continentLabel}</Text>
    </View>
  );
}

// ── Country card ────────────────────────────────────────────

function CountryGridCard({
  country,
  onPress,
}: {
  country: Country;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.countryCard, pressed && styles.pressed]}
    >
      <Image
        source={{ uri: country.heroImageUrl ?? undefined }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={['transparent', 'transparent', 'rgba(0,0,0,0.6)']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.countryCardContent}>
        <Text style={styles.countryCardName} numberOfLines={1}>
          {country.name}
        </Text>
      </View>
    </Pressable>
  );
}

// ── Screen ──────────────────────────────────────────────────

export default function ContinentScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  const continentLabel = CONTINENT_LABELS[name ?? ''] ?? name ?? '';
  const continentIso2s = CONTINENT_COUNTRIES[name ?? ''] ?? [];

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getCountries();
        setAllCountries(data);
      } catch (e) {
        Sentry.captureException(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const countries = useMemo(() => {
    const iso2Set = new Set(continentIso2s);
    return allCountries.filter((c) => iso2Set.has(c.iso2));
  }, [allCountries, continentIso2s]);

  const rows = chunk(countries, 3);

  if (loading) {
    return (
      <AppScreen>
        <AppHeader
          title=""
          leftComponent={
            <Image
              source={require('@/assets/images/sola-logo.png')}
              style={styles.headerLogo}
              contentFit="contain"
            />
          }
          rightComponent={<MenuButton />}
        />
        <LoadingScreen />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <AppHeader
        title=""
        leftComponent={
          <Image
            source={require('@/assets/images/sola-logo.png')}
            style={styles.headerLogo}
            contentFit="contain"
          />
        }
        rightComponent={<MenuButton />}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Breadcrumb
          continentLabel={continentLabel}
          onDiscover={() => router.push('/(tabs)/discover')}
          onContinents={() => router.back()}
        />
        <Text style={styles.pageTitle}>{continentLabel}</Text>
        <Text style={styles.pageSubtitle}>
          {countries.length} {countries.length === 1 ? 'country' : 'countries'}
        </Text>

        <View style={styles.grid}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              {row.map((country) => (
                <CountryGridCard
                  key={country.id}
                  country={country}
                  onPress={() =>
                    router.push(`/(tabs)/discover/country/${country.slug}`)
                  }
                />
              ))}
              {/* Fill empty slots in last row to keep alignment */}
              {row.length < 3 &&
                Array.from({ length: 3 - row.length }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.countryCardEmpty} />
                ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  headerLogo: {
    height: 22,
    width: 76,
  },
  scroll: {
    paddingBottom: spacing.xxxxl,
  },

  // Breadcrumb
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    gap: spacing.sm,
    marginBottom: spacing.lg,
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

  // Page
  pageTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: colors.textPrimary,
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.xs,
  },
  pageSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.xl,
  },

  // Grid — 3 per row
  grid: {
    paddingHorizontal: spacing.screenX,
    gap: GRID_GAP,
  },
  gridRow: {
    flexDirection: 'row',
    gap: GRID_GAP,
  },
  countryCard: {
    width: CARD_SIZE,
    height: CARD_SIZE * 1.2,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  countryCardEmpty: {
    width: CARD_SIZE,
    height: CARD_SIZE * 1.2,
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },
  countryCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  countryCardName: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
