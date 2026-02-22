import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTopPlacesByCountry } from '@/data/api';
import type { PlaceWithCity } from '@/data/types';
import { useData } from '@/hooks/useData';
import LoadingScreen from '@/components/LoadingScreen';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Stay Filters — women-first, uses existing data only
// ---------------------------------------------------------------------------

interface StayFilter {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  test: (p: PlaceWithCity) => boolean;
}

const STAY_FILTERS: StayFilter[] = [
  {
    key: 'women_only',
    label: 'Women Only',
    icon: 'shield-checkmark',
    color: colors.greenSoft,
    bg: colors.greenFill,
    test: (p) => p.womenOnly === true,
  },
  {
    key: 'verified',
    label: 'Sola Verified',
    icon: 'checkmark-circle',
    color: colors.orange,
    bg: colors.orangeFill,
    test: (p) =>
      p.verificationStatus === 'sola_checked' ||
      p.verificationStatus === 'baseline_passed',
  },
  {
    key: 'solo_reviewed',
    label: 'Solo Reviews',
    icon: 'chatbubble-ellipses',
    color: colors.blueSoft,
    bg: colors.blueFill,
    test: (p) => p.soloFemaleReviews != null && p.soloFemaleReviews.length > 0,
  },
  {
    key: 'budget',
    label: 'Budget',
    icon: 'wallet-outline',
    color: colors.textSecondary,
    bg: colors.neutralFill,
    test: (p) => p.priceLevel === 1,
  },
  {
    key: 'hostel',
    label: 'Hostels',
    icon: 'people-outline',
    color: colors.textSecondary,
    bg: colors.neutralFill,
    test: (p) => p.placeType === 'hostel',
  },
  {
    key: 'homestay',
    label: 'Homestays',
    icon: 'home-outline',
    color: colors.textSecondary,
    bg: colors.neutralFill,
    test: (p) => p.placeType === 'homestay',
  },
];

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------

const ACCOMMODATION_TYPES = ['hotel', 'hostel', 'homestay'];
const ACTIVITY_TYPES = ['activity', 'tour'];

function placeDetailRoute(place: PlaceWithCity): string {
  if (ACCOMMODATION_TYPES.includes(place.placeType)) {
    return `/(tabs)/discover/accommodation/${place.slug}`;
  }
  if (ACTIVITY_TYPES.includes(place.placeType)) {
    return `/(tabs)/discover/activity/${place.slug}`;
  }
  return `/(tabs)/discover/place-detail/${place.id}`;
}

// ---------------------------------------------------------------------------
// Place List Card — enhanced for stays
// ---------------------------------------------------------------------------

function PlaceListCard({ place, isStay }: { place: PlaceWithCity; isStay: boolean }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(placeDetailRoute(place) as any)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {place.imageUrl ? (
        <Image
          source={{ uri: place.imageUrl }}
          style={styles.cardImage}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.cardImage, styles.cardPlaceholder]} />
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <SolaText style={styles.cardName} numberOfLines={1}>
            {place.name}
          </SolaText>
          {isStay && place.pricePerNight && (
            <SolaText style={styles.cardPrice}>
              ${place.pricePerNight}/n
            </SolaText>
          )}
        </View>
        <SolaText style={styles.cardCity}>in {place.cityName}</SolaText>

        {/* Stay-specific badges */}
        {isStay && (
          <View style={styles.badgeRow}>
            {place.womenOnly && (
              <View style={[styles.badge, { backgroundColor: colors.greenFill }]}>
                <Ionicons name="shield-checkmark" size={10} color={colors.greenSoft} />
                <SolaText style={[styles.badgeText, { color: colors.greenSoft }]}>
                  Women Only
                </SolaText>
              </View>
            )}
            {(place.verificationStatus === 'sola_checked' ||
              place.verificationStatus === 'baseline_passed') && (
              <View style={[styles.badge, { backgroundColor: colors.orangeFill }]}>
                <Ionicons name="checkmark-circle" size={10} color={colors.orange} />
                <SolaText style={[styles.badgeText, { color: colors.orange }]}>
                  Verified
                </SolaText>
              </View>
            )}
            {place.placeType !== 'hotel' && (
              <View style={[styles.badge, { backgroundColor: colors.neutralFill }]}>
                <SolaText style={[styles.badgeText, { color: colors.textSecondary }]}>
                  {place.placeType === 'hostel' ? 'Hostel' : 'Homestay'}
                </SolaText>
              </View>
            )}
          </View>
        )}

        {place.whySelected && (
          <SolaText style={styles.cardWhy} numberOfLines={2}>
            {place.whySelected}
          </SolaText>
        )}
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function CountryPlacesScreen() {
  const { countryId, countryName } = useLocalSearchParams<{
    countryId: string;
    countryName: string;
    countrySlug: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  const { data: allPlaces, loading } = useData(
    () => (countryId ? getTopPlacesByCountry(countryId, 50) : Promise.resolve([])),
    ['allPlacesByCountry', countryId],
  );

  const toggleFilter = (key: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Clear stay filters when switching categories
  const handleCategoryChange = (key: CategoryKey) => {
    setActiveCategory(key);
    if (key !== 'stay') setActiveFilters(new Set());
  };

  const isStay = activeCategory === 'stay';

  // Count how many places match each filter (for showing counts)
  const stayPlaces = useMemo(() => {
    const places = (allPlaces ?? []) as PlaceWithCity[];
    return places.filter((p) => CATEGORY_TYPES.stay.includes(p.placeType));
  }, [allPlaces]);

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of STAY_FILTERS) {
      counts[f.key] = stayPlaces.filter(f.test).length;
    }
    return counts;
  }, [stayPlaces]);

  // Apply category + stay filters
  const filtered = useMemo(() => {
    const places = (allPlaces ?? []) as PlaceWithCity[];
    let result =
      activeCategory === 'all'
        ? places
        : places.filter((p) =>
            CATEGORY_TYPES[activeCategory].includes(p.placeType),
          );

    // Apply stay filters (AND logic — place must match ALL active filters)
    if (isStay && activeFilters.size > 0) {
      const activeFilterDefs = STAY_FILTERS.filter((f) =>
        activeFilters.has(f.key),
      );
      result = result.filter((p) => activeFilterDefs.every((f) => f.test(p)));
    }

    return result;
  }, [allPlaces, activeCategory, activeFilters, isStay]);

  if (loading) return <LoadingScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          <SolaText style={styles.backLabel}>{countryName || 'Back'}</SolaText>
        </Pressable>
      </View>
      <SolaText style={styles.screenTitle}>
        {isStay ? 'Where to Stay' : 'Things to Do'}
      </SolaText>

      {/* Category tabs */}
      <View style={styles.tabs}>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <Pressable
              key={cat.key}
              onPress={() => handleCategoryChange(cat.key)}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <SolaText
                style={[styles.tabText, isActive && styles.tabTextActive]}
              >
                {cat.label}
              </SolaText>
            </Pressable>
          );
        })}
      </View>

      {/* Stay filters — only visible when Stay is active */}
      {isStay && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterScroll}
        >
          {STAY_FILTERS.map((f) => {
            const isActive = activeFilters.has(f.key);
            const count = filterCounts[f.key] ?? 0;
            if (count === 0) return null;
            return (
              <Pressable
                key={f.key}
                onPress={() => toggleFilter(f.key)}
                style={[
                  styles.filterPill,
                  isActive && { backgroundColor: f.bg, borderColor: f.color },
                ]}
              >
                <Ionicons
                  name={f.icon as any}
                  size={14}
                  color={isActive ? f.color : colors.textMuted}
                />
                <SolaText
                  style={[
                    styles.filterText,
                    isActive && { color: f.color },
                  ]}
                >
                  {f.label}
                </SolaText>
                <SolaText
                  style={[
                    styles.filterCount,
                    isActive && { color: f.color },
                  ]}
                >
                  {count}
                </SolaText>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Empty state for filters */}
      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name={isStay ? 'bed-outline' : 'search-outline'}
            size={32}
            color={colors.textMuted}
          />
          <SolaText style={styles.emptyTitle}>
            {activeFilters.size > 0
              ? 'No matches for these filters'
              : 'No places found'}
          </SolaText>
          {activeFilters.size > 0 && (
            <Pressable onPress={() => setActiveFilters(new Set())}>
              <SolaText style={styles.clearFilters}>Clear filters</SolaText>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(place) => place.id}
          renderItem={({ item }) => (
            <PlaceListCard place={item} isStay={isStay} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  nav: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  screenTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
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

  // Stay filters
  filterScroll: {
    flexGrow: 0,
    marginBottom: spacing.md,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  filterText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  filterCount: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingBottom: spacing.xxxxl,
  },
  emptyTitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textMuted,
  },
  clearFilters: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },

  // List + cards
  list: {
    paddingHorizontal: spacing.lg,
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
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  cardPrice: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  cardCity: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.sm - 2,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  cardWhy: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
});
