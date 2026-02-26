import { useMemo, useRef } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import LoadingScreen from '@/components/LoadingScreen';
import BackButton, { BACK_BUTTON_SIZE } from '@/components/ui/BackButton';
import { useNavContext } from '@/hooks/useNavContext';
import { useData } from '@/hooks/useData';
import {
  getAreaById,
  getPlacesByArea,
  getCityById,
} from '@/data/api';
import type { Place } from '@/data/types';
import { CompactPlaceCard } from '@/components/explore/city/CompactPlaceCard';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HERO_HEIGHT = 240;
const COMPACT_BAR_HEIGHT = 44;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Maps practical_info keys to display labels */
const practicalKeyMeta: Record<string, { label: string }> = {
  getting_around: { label: 'Getting around' },
  wifi: { label: 'WiFi' },
  atms: { label: 'ATMs' },
  sim_cards: { label: 'SIM cards' },
  budget_note: { label: 'Budget' },
  nearest_hospital: { label: 'Nearest hospital' },
};

/** Ordered keys for consistent display */
const practicalKeyOrder = [
  'getting_around',
  'wifi',
  'atms',
  'sim_cards',
  'budget_note',
  'nearest_hospital',
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AreaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue(0);

  // ── Data fetching ─────────────────────────────────────────────────────

  const { data: area, loading: areaLoading } = useData(
    () => getAreaById(id ?? ''),
    ['areaById', id],
  );

  const { data: city } = useData(
    () => area?.cityId ? getCityById(area.cityId) : Promise.resolve(null),
    ['cityById', area?.cityId],
  );

  const { handleBack } = useNavContext({
    title: area?.name ?? 'Area',
    path: `/(tabs)/discover/area/${id}`,
    fallbackCrumbs: [
      { label: 'Discover', path: '/(tabs)/discover' },
      ...(city ? [{ label: city.name, path: `/(tabs)/discover/city/${city.slug}` }] : []),
    ],
  });

  const { data: places, loading: placesLoading } = useData(
    () => id ? getPlacesByArea(id) : Promise.resolve([]),
    ['placesByArea', id],
  );

  // Group places by type
  const grouped = useMemo(() => {
    if (!places || places.length === 0) return [];

    const groupMap = new Map<string, Place[]>();
    for (const p of places) {
      const existing = groupMap.get(p.placeType) ?? [];
      existing.push(p);
      groupMap.set(p.placeType, existing);
    }

    const typeLabels: Record<string, string> = {
      restaurant: 'Restaurants',
      cafe: 'Cafes',
      bar: 'Bars',
      club: 'Clubs',
      rooftop: 'Rooftops',
      hotel: 'Hotels',
      hostel: 'Hostels',
      homestay: 'Homestays',
      activity: 'Activities',
      landmark: 'Landmarks',
      tour: 'Tours',
      wellness: 'Wellness',
      spa: 'Spas',
      salon: 'Salons',
      gym: 'Gyms',
      coworking: 'Coworking',
      bakery: 'Bakeries',
      shop: 'Shops',
      transport: 'Transport',
      pharmacy: 'Pharmacies',
    };

    return Array.from(groupMap.entries()).map(([type, items]) => ({
      type,
      label: typeLabels[type] ?? type,
      places: items,
    }));
  }, [places]);

  // Practical info rows
  const practicalRows = useMemo(() => {
    if (!area?.practicalInfo) return [];
    return practicalKeyOrder
      .filter((key) => area.practicalInfo?.[key])
      .map((key) => ({
        key,
        label: practicalKeyMeta[key]?.label ?? key,
        value: area.practicalInfo![key],
      }));
  }, [area?.practicalInfo]);

  // ── Scroll-driven animations ──────────────────────────────────────────

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const compactBarTotalHeight = COMPACT_BAR_HEIGHT + insets.top;

  const compactBarHeightStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [HERO_HEIGHT * 0.45, HERO_HEIGHT],
      [0, compactBarTotalHeight],
      Extrapolation.CLAMP,
    );
    return { height };
  });

  const compactContentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [HERO_HEIGHT * 0.65, HERO_HEIGHT],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [HERO_HEIGHT * 0.65, HERO_HEIGHT],
      [10, 0],
      Extrapolation.CLAMP,
    );
    const scale = interpolate(
      scrollY.value,
      [HERO_HEIGHT * 0.65, HERO_HEIGHT],
      [0.96, 1],
      Extrapolation.CLAMP,
    );
    return { opacity, transform: [{ translateY }, { scale }] };
  });

  const heroTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HERO_HEIGHT * 0.35],
      [1, 0],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [0, HERO_HEIGHT * 0.35],
      [0, -16],
      Extrapolation.CLAMP,
    );
    return { opacity, transform: [{ translateY }] };
  });

  const stickyShadowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [HERO_HEIGHT - 10, HERO_HEIGHT + 20],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  // ── Loading / error states ────────────────────────────────────────────

  if (areaLoading) return <LoadingScreen />;
  if (!area) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>Area not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollViewRef as React.RefObject<Animated.ScrollView>}
        stickyHeaderIndices={[1]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Child 0: Hero ──────────────────────────────────────── */}
        <View style={styles.hero}>
          {area.heroImageUrl ? (
            <Image
              source={{ uri: area.heroImageUrl }}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.heroPlaceholder]} />
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.6)']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <Animated.View style={[styles.heroOverlay, heroTextStyle]}>
            {city?.name && (
              <Text style={styles.heroLabel}>{city.name.toUpperCase()}</Text>
            )}
            <Text style={styles.heroTitle} numberOfLines={2}>
              {area.name}
            </Text>
            {area.positioningLine && (
              <Text style={styles.heroSubtitle} numberOfLines={2}>
                {area.positioningLine}
              </Text>
            )}
          </Animated.View>
        </View>

        {/* ── Child 1: Sticky — compact bar ──────────────────────── */}
        <View style={styles.stickySection}>
          <Animated.View style={[styles.compactBar, compactBarHeightStyle]}>
            <View style={{ height: insets.top }} />
            <Animated.View style={[styles.compactContent, compactContentStyle]}>
              <View style={styles.compactSpacer} />
              <Text style={styles.compactTitle} numberOfLines={1}>
                {area.name}
              </Text>
              <View style={styles.compactSpacer} />
            </Animated.View>
          </Animated.View>
          <Animated.View style={[styles.stickyShadow, stickyShadowStyle]} />
        </View>

        {/* ── Child 2: Content ───────────────────────────────────── */}
        <View style={styles.content}>
          {/* Best for pill */}
          {area.whoItSuits && (
            <View style={styles.bestForSection}>
              <View style={styles.bestForPill}>
                <Text style={styles.bestForLabel}>BEST FOR</Text>
                <Text style={styles.bestForText}>{area.whoItSuits}</Text>
              </View>
            </View>
          )}

          {/* Vibe description */}
          {area.vibeDescription && (
            <View style={styles.vibeSection}>
              <View style={styles.vibeCard}>
                <View style={styles.vibeAccent} />
                <View style={styles.vibeBody}>
                  <Text style={styles.vibeText}>{area.vibeDescription}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Crowd vibe */}
          {area.crowdVibe && (
            <View style={styles.crowdSection}>
              <View style={styles.crowdCard}>
                <Text style={styles.crowdLabel}>Who you'll find here</Text>
                <Text style={styles.crowdText}>{area.crowdVibe}</Text>
              </View>
            </View>
          )}

          {/* Practical info */}
          {practicalRows.length > 0 && (
            <View style={styles.practicalSection}>
              <Text style={styles.practicalTitle}>Practical info</Text>
              <View style={styles.practicalCard}>
                {practicalRows.map((row, i) => (
                  <View
                    key={row.key}
                    style={[
                      styles.practicalRow,
                      i < practicalRows.length - 1 && styles.practicalRowBorder,
                    ]}
                  >
                    <Text style={styles.practicalLabel}>{row.label}</Text>
                    <Text style={styles.practicalValue}>{row.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Places header */}
          {grouped.length > 0 && (
            <View style={styles.placesHeader}>
              <Text style={styles.sectionTitle}>
                Places in {area.name}
              </Text>
              <Text style={styles.placesCount}>
                {places?.length ?? 0} places
              </Text>
            </View>
          )}

          {/* Grouped place sections */}
          {grouped.map((group) => (
            <View key={group.type} style={styles.groupSection}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              {group.places.map((place) => (
                <View key={place.id} style={styles.placeCardWrapper}>
                  <CompactPlaceCard
                    place={{ ...place, imageUrl: place.imageUrlCached ?? null, areaName: null }}
                  />
                </View>
              ))}
            </View>
          ))}

          {/* Empty state */}
          {(!places || places.length === 0) && !placesLoading && (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>No places added to this area yet</Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* ── Persistent back button ───────────────────────────────── */}
      <View style={[styles.backButton, { top: insets.top + spacing.sm }]}>
        <BackButton onPress={handleBack} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Hero
  hero: {
    height: HERO_HEIGHT,
    width: '100%',
  },
  heroPlaceholder: {
    backgroundColor: colors.neutralFill,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.screenX,
    right: spacing.screenX,
  },
  heroLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 34,
  },
  heroSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginTop: spacing.xs,
  },

  // Sticky compact bar
  stickySection: {
    backgroundColor: colors.background,
  },
  compactBar: {
    overflow: 'hidden',
    backgroundColor: colors.background,
    justifyContent: 'flex-end',
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: COMPACT_BAR_HEIGHT,
    paddingHorizontal: spacing.screenX,
    gap: spacing.sm,
  },
  compactTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
    lineHeight: 22,
    flexShrink: 1,
  },
  compactSpacer: {
    width: BACK_BUTTON_SIZE,
  },
  stickyShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.borderSubtle,
  },

  // Content area
  content: {
    minHeight: SCREEN_HEIGHT,
    paddingBottom: spacing.xxxxl,
  },

  // Persistent back button
  backButton: {
    position: 'absolute',
    left: spacing.screenX,
    zIndex: 100,
  },

  // Error state
  notFound: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },

  // Best for pill
  bestForSection: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
  },
  bestForPill: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  bestForLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.orange,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bestForText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },

  // Vibe description
  vibeSection: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
  },
  vibeCard: {
    flexDirection: 'row',
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  vibeAccent: {
    width: 3,
    backgroundColor: colors.orange,
  },
  vibeBody: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  vibeText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
  },

  // Crowd vibe
  crowdSection: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
  },
  crowdCard: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  crowdLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.orange,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  crowdText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
  },

  // Practical info
  practicalSection: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  practicalTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  practicalCard: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  practicalRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  practicalRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229,101,58,0.08)',
  },
  practicalLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.orange,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  practicalValue: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },

  // Places
  placesHeader: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.xxl,
    marginTop: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  placesCount: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  groupSection: {
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.lg,
  },
  groupLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  placeCardWrapper: {
    marginBottom: 0,
  },
  emptySection: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
});
