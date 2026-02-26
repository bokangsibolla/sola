import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { eventTracker } from '@/data/events/eventTracker';
import { colors, fonts, spacing } from '@/constants/design';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import BackButton, { BACK_BUTTON_SIZE } from '@/components/ui/BackButton';
import { useNavContext } from '@/hooks/useNavContext';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import { setRecentCity } from '@/data/explore/recentBrowsing';
import {
  getCityBySlug,
  getCityById,
  getAreasByCity,
  getCountryById,
  getUpcomingTripForCity,
  getPlacesByCity,
} from '@/data/api';
import { buildCategoryCounts, PLACE_CATEGORIES } from '@/data/city/types';
import type { PlaceCategoryKey, CategoryCount } from '@/data/city/types';
import { CountryTabBar } from '@/components/explore/country/CountryTabBar';
import { OverviewTab } from '@/components/explore/city/OverviewTab';
import { PlacesTab } from '@/components/explore/city/PlacesTab';
import { EventsTab } from '@/components/explore/city/EventsTab';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TABS = [{ label: 'Overview' }, { label: 'Places' }, { label: 'Events' }];

const HERO_HEIGHT = 260;
const COMPACT_BAR_HEIGHT = 44;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CityScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [activeCategory, setActiveCategory] = useState<PlaceCategoryKey | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue(0);

  // ── Data fetching ─────────────────────────────────────────────────────

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug ?? '');

  const { data: city, loading, error, refetch } = useData(
    () => isUuid ? getCityById(slug ?? '') : getCityBySlug(slug ?? ''),
    ['city', slug],
  );

  const { data: country } = useData(
    () => city?.countryId ? getCountryById(city.countryId) : Promise.resolve(null),
    ['country', city?.countryId],
  );

  const { handleBack } = useNavContext({
    title: city?.name ?? 'City',
    path: `/(tabs)/discover/city/${slug}`,
    fallbackCrumbs: [
      { label: 'Discover', path: '/(tabs)/discover' },
      ...(country ? [{ label: country.name, path: `/(tabs)/discover/country/${country.slug}` }] : []),
    ],
  });

  const { data: areas } = useData(
    () => city?.id ? getAreasByCity(city.id) : Promise.resolve([]),
    ['cityAreas', city?.id],
  );

  const { data: allPlaces, loading: placesLoading } = useData(
    () => city?.id ? getPlacesByCity(city.id) : Promise.resolve([]),
    ['placesByCity', city?.id],
  );

  const { data: upcomingTrip } = useData(
    () => (userId && city?.id) ? getUpcomingTripForCity(userId, city.id) : Promise.resolve(null),
    ['upcomingTripForCity', userId, city?.id],
  );

  const defaultEventMonth = upcomingTrip?.arriving
    ? new Date(upcomingTrip.arriving).getMonth() + 1
    : undefined;

  // Category counts for Places tab
  const categoryCounts = useMemo(
    () => buildCategoryCounts(allPlaces ?? []),
    [allPlaces],
  );

  // Auto-select first category
  useEffect(() => {
    if (categoryCounts.length > 0 && !activeCategory)
      setActiveCategory(categoryCounts[0].key);
  }, [categoryCounts, activeCategory]);

  // ── Analytics & recent browsing ───────────────────────────────────────

  useEffect(() => {
    if (slug) posthog.capture('city_page_viewed', { city_slug: slug });
  }, [slug, posthog]);

  useEffect(() => {
    if (city?.id) eventTracker.track('viewed_city', 'city', city.id);
  }, [city?.id]);

  useEffect(() => {
    if (city) {
      setRecentCity({
        citySlug: city.slug,
        cityName: city.name,
        heroImageUrl: city.heroImageUrl ?? null,
        viewedAt: Date.now(),
      });
    }
  }, [city?.id]);

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

  // ── Tab switching ─────────────────────────────────────────────────────

  const handleTabPress = useCallback((index: number) => {
    setActiveTab(index);
    if (scrollY.value > HERO_HEIGHT) {
      scrollViewRef.current?.scrollTo({ y: HERO_HEIGHT, animated: false });
    }
  }, [scrollY]);

  const handleCategoryChange = useCallback((key: PlaceCategoryKey) => {
    setActiveCategory(key);
    if (scrollY.value > HERO_HEIGHT) {
      scrollViewRef.current?.scrollTo({ y: HERO_HEIGHT, animated: false });
    }
  }, [scrollY]);

  // ── Loading / error states ────────────────────────────────────────────

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;
  if (!city) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>City not found</Text>
      </View>
    );
  }

  const isPlacesTab = activeTab === 1;

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
          {city.heroImageUrl ? (
            <Image
              source={{ uri: city.heroImageUrl }}
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
            {country?.name && (
              <Text style={styles.heroLabel}>{country.name.toUpperCase()}</Text>
            )}
            <Text style={styles.heroTitle} numberOfLines={2}>
              {city.name}
            </Text>
            {city.positioningLine && (
              <Text style={styles.heroSubtitle} numberOfLines={2}>
                {city.positioningLine}
              </Text>
            )}
          </Animated.View>
        </View>

        {/* ── Child 1: Sticky — compact bar + page tabs + category bar ── */}
        <View style={styles.stickySection}>
          <Animated.View style={[styles.compactBar, compactBarHeightStyle]}>
            <View style={{ height: insets.top }} />
            <Animated.View style={[styles.compactContent, compactContentStyle]}>
              <View style={styles.compactSpacer} />
              <Text style={styles.compactTitle} numberOfLines={1}>
                {city.name}
              </Text>
              <View style={styles.compactSpacer} />
            </Animated.View>
          </Animated.View>
          <CountryTabBar
            tabs={TABS}
            activeIndex={activeTab}
            onTabPress={handleTabPress}
          />
          {/* Category sub-tabs — inside sticky section so they don't overflow */}
          {isPlacesTab && categoryCounts.length > 0 && (
            <View style={styles.catBar}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.catBarContent}
              >
                {categoryCounts.map((cat) => {
                  const active = cat.key === activeCategory;
                  return (
                    <Pressable
                      key={cat.key}
                      onPress={() => handleCategoryChange(cat.key)}
                      style={styles.catTab}
                    >
                      <Text style={[styles.catLabel, active && styles.catLabelActive]}>
                        {cat.label}
                      </Text>
                      {active && <View style={styles.catUnderline} />}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}
          <Animated.View style={[styles.stickyShadow, stickyShadowStyle]} />
        </View>

        {/* ── Child 2: Tab content ─────────────────────────────────── */}
        <View style={styles.tabContent}>
          {activeTab === 0 && (
            <OverviewTab city={city} areas={areas ?? []} />
          )}
          {activeTab === 2 && city.id && (
            <EventsTab cityId={city.id} defaultMonth={defaultEventMonth} />
          )}
          {isPlacesTab && city.id && (
            <PlacesTab
              allPlaces={allPlaces ?? []}
              activeCategory={activeCategory}
              areas={areas ?? []}
              loading={placesLoading}
            />
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
    fontSize: 30,
    color: '#FFFFFF',
    lineHeight: 36,
  },
  heroSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginTop: spacing.xs,
  },

  // Sticky section
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

  // Category tabs (Places tab only)
  catBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  catBarContent: {
    paddingLeft: spacing.screenX,
    paddingRight: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  catTab: {
    alignItems: 'center',
    paddingBottom: spacing.md,
  },
  catLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  catLabelActive: {
    color: colors.orange,
    fontFamily: fonts.semiBold,
  },
  catUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.orange,
    borderRadius: 1,
  },

  // Tab content
  tabContent: {
    minHeight: SCREEN_HEIGHT,
  },

  // Persistent back button
  backButton: {
    position: 'absolute',
    left: spacing.screenX,
    zIndex: 100,
  },

  // Error state
  notFound: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
