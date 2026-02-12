import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTopPlacesByCountry } from '@/data/api';
import type { PlaceWithCity } from '@/data/types';
import { useData } from '@/hooks/useData';
import LoadingScreen from '@/components/LoadingScreen';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'eat_drink', label: 'Eat & Drink' },
  { key: 'stay', label: 'Stay' },
  { key: 'see_do', label: 'See & Do' },
  { key: 'wellness', label: 'Wellness' },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]['key'];

const CATEGORY_TYPES: Record<Exclude<CategoryKey, 'all'>, string[]> = {
  eat_drink: ['restaurant', 'cafe', 'bakery', 'bar', 'rooftop'],
  stay: ['hotel', 'hostel', 'homestay'],
  see_do: ['activity', 'tour', 'landmark', 'coworking'],
  wellness: ['wellness', 'spa', 'salon', 'gym'],
};

function Breadcrumb({
  countryName,
  countrySlug,
  onDiscover,
  onCountry,
}: {
  countryName: string;
  countrySlug?: string;
  onDiscover: () => void;
  onCountry: () => void;
}) {
  return (
    <View style={styles.breadcrumb}>
      <Pressable onPress={onDiscover} hitSlop={8}>
        <Text style={styles.breadcrumbLink}>Discover</Text>
      </Pressable>
      <Text style={styles.breadcrumbSep}>/</Text>
      <Pressable onPress={onCountry} hitSlop={8}>
        <Text style={styles.breadcrumbLink} numberOfLines={1}>
          {countryName}
        </Text>
      </Pressable>
      <Text style={styles.breadcrumbSep}>/</Text>
      <Text style={styles.breadcrumbCurrent}>Things to Do</Text>
    </View>
  );
}

function PlaceListCard({ place }: { place: PlaceWithCity }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/discover/place-detail/${place.id}` as any)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {place.imageUrl ? (
        <Image source={{ uri: place.imageUrl }} style={styles.cardImage} contentFit="cover" transition={200} />
      ) : (
        <View style={[styles.cardImage, styles.cardPlaceholder]} />
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{place.name}</Text>
        <Text style={styles.cardCity}>in {place.cityName}</Text>
        {place.whySelected && (
          <Text style={styles.cardWhy} numberOfLines={2}>{place.whySelected}</Text>
        )}
      </View>
    </Pressable>
  );
}

export default function CountryPlacesScreen() {
  const { countryId, countryName, countrySlug } = useLocalSearchParams<{
    countryId: string;
    countryName: string;
    countrySlug: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');

  const { data: allPlaces, loading } = useData(
    () => countryId ? getTopPlacesByCountry(countryId, 50) : Promise.resolve([]),
    ['allPlacesByCountry', countryId],
  );

  if (loading) return <LoadingScreen />;

  const places = (allPlaces ?? []) as PlaceWithCity[];
  const filtered = activeCategory === 'all'
    ? places
    : places.filter((p) => CATEGORY_TYPES[activeCategory].includes(p.placeType));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Breadcrumb
        countryName={countryName || 'Country'}
        countrySlug={countrySlug}
        onDiscover={() => router.push('/(tabs)/discover')}
        onCountry={() => {
          if (countrySlug) {
            router.push(`/(tabs)/discover/country/${countrySlug}` as any);
          } else {
            router.back();
          }
        }}
      />
      <Text style={styles.screenTitle}>Things to Do</Text>

      {/* Category tabs */}
      <View style={styles.tabs}>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <Pressable
              key={cat.key}
              onPress={() => setActiveCategory(cat.key)}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{cat.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(place) => place.id}
        renderItem={({ item }) => <PlaceListCard place={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Breadcrumb
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  breadcrumbLink: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
    flexShrink: 1,
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
  screenTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: colors.textPrimary,
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.lg,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.orange,
  },
  tabText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
  list: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.xxl,
  },
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: colors.background,
  },
  cardPressed: {
    opacity: pressedState.opacity,
    transform: [...pressedState.transform],
  },
  cardImage: {
    width: 90,
    height: 90,
  },
  cardPlaceholder: {
    backgroundColor: colors.neutralFill,
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  cardName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  cardCity: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  cardWhy: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
});
