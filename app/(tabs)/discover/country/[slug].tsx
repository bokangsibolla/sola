import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import {
  getCountryBySlug,
  getCountryById,
  getCitiesByCountry,
  getPlacesByCountryAndType,
} from '@/data/api';
import type { PlaceWithCity } from '@/data/types';
import { getEmergencyNumbers } from '@/data/safety';
import { getCountryThreadPreviews } from '@/data/community/communityApi';
import { CountryTabBar } from '@/components/explore/country/CountryTabBar';
import { CountryOverviewTab } from '@/components/explore/country/CountryOverviewTab';
import { CountryGuideTab } from '@/components/explore/country/CountryGuideTab';
import { CountryBudgetTab } from '@/components/explore/country/CountryBudgetTab';
import { DestinationsTab } from '@/components/explore/country/DestinationsTab';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TABS = [
  { label: 'Overview' },
  { label: 'Destinations' },
  { label: 'Guide' },
  { label: 'Budget' },
];

const HERO_HEIGHT = 260;
const COMPACT_BAR_HEIGHT = 44;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert ISO-3166-1 alpha-2 code to flag emoji (e.g. "TH" → "🇹🇭") */
function flagEmoji(iso2: string): string {
  const codePoints = Array.from(iso2.toUpperCase()).map(
    (char) => 0x1F1E6 - 65 + char.charCodeAt(0),
  );
  return String.fromCodePoint(...codePoints);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CountryGuideScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();
  const [activeTab, setActiveTab] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue(0);

  useEffect(() => {
    if (slug) posthog.capture('country_guide_viewed', { country_slug: slug });
  }, [slug, posthog]);

  const isUuid = slug ? /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(slug) : false;

  const { data: country, loading: countryLoading, error, refetch } = useData(
    () => slug
      ? isUuid ? getCountryById(slug) : getCountryBySlug(slug)
      : Promise.resolve(null),
    [slug],
  );

  useEffect(() => {
    if (country?.id) eventTracker.track('viewed_country', 'country', country.id);
  }, [country?.id]);

  const { data: cities } = useData(
    () => country?.id ? getCitiesByCountry(country.id) : Promise.resolve([]),
    ['citiesByCountry', country?.id],
  );

  const { data: healthPlaces } = useData(
    () => country?.id ? getPlacesByCountryAndType(country.id, ['hospital', 'clinic', 'pharmacy']) : Promise.resolve([]),
    ['healthPlaces', country?.id],
  );

  const { data: communityData } = useData(
    () => country?.id ? getCountryThreadPreviews(country.id, 3) : Promise.resolve({ threads: [], totalCount: 0 }),
    ['countryThreads', country?.id],
  );

  const { handleBack } = useNavContext({
    title: country?.name ?? 'Country',
    path: `/(tabs)/discover/country/${slug}`,
    fallbackCrumbs: [{ label: 'Discover', path: '/(tabs)/discover' }],
  });

  // ── Scroll-driven animations ─────────────────────────────────────────

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const compactBarTotalHeight = COMPACT_BAR_HEIGHT + insets.top;

  // Compact bar height: grows from 0 to make space for title + safe area
  const compactBarHeightStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [HERO_HEIGHT * 0.45, HERO_HEIGHT],
      [0, compactBarTotalHeight],
      Extrapolation.CLAMP,
    );
    return { height };
  });

  // Compact content: slides up + fades in (micro-animation)
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

  // Hero overlay text: fades + drifts up as user scrolls
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

  // Sticky section shadow: appears when pinned
  const stickyShadowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [HERO_HEIGHT - 10, HERO_HEIGHT + 20],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  // ── Tab switching ────────────────────────────────────────────────────

  const handleTabPress = useCallback((index: number) => {
    setActiveTab(index);
    // If scrolled past hero, reset to show tab content from the top
    if (scrollY.value > HERO_HEIGHT) {
      scrollViewRef.current?.scrollTo({ y: HERO_HEIGHT, animated: false });
    }
  }, [scrollY]);

  // ── Loading / error states ───────────────────────────────────────────

  if (countryLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;
  if (!country) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>Country not found</Text>
      </View>
    );
  }

  const emergency = getEmergencyNumbers(country.iso2);
  const subtitle = country.vibeSummary ?? country.subtitle ?? undefined;
  const flag = country.iso2 ? flagEmoji(country.iso2) : '';

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollViewRef as React.RefObject<Animated.ScrollView>}
        stickyHeaderIndices={[1]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Child 0: Hero image (scrolls away) ──────────────────── */}
        <View style={styles.hero}>
          {country.heroImageUrl ? (
            <Image
              source={{ uri: country.heroImageUrl }}
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
            <Text style={styles.heroTitle} numberOfLines={2}>
              {country.name}
            </Text>
            {subtitle && (
              <Text style={styles.heroSubtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            )}
          </Animated.View>
        </View>

        {/* ── Child 1: Sticky header (compact bar + tabs) ─────────── */}
        <View style={styles.stickySection}>
          <Animated.View style={[styles.compactBar, compactBarHeightStyle]}>
            <View style={{ height: insets.top }} />
            <Animated.View style={[styles.compactContent, compactContentStyle]}>
              <View style={styles.compactSpacer} />
              {flag ? <Text style={styles.flag}>{flag}</Text> : null}
              <Text style={styles.compactTitle} numberOfLines={1}>
                {country.name}
              </Text>
              <View style={styles.compactSpacer} />
            </Animated.View>
          </Animated.View>
          <CountryTabBar
            tabs={TABS}
            activeIndex={activeTab}
            onTabPress={handleTabPress}
          />
          <Animated.View style={[styles.stickyShadow, stickyShadowStyle]} />
        </View>

        {/* ── Child 2: Tab content ────────────────────────────────── */}
        <View style={styles.tabContent}>
          {activeTab === 0 && (
            <CountryOverviewTab
              country={country}
              cities={cities ?? []}
              communityData={communityData}
              onSwitchTab={handleTabPress}
            />
          )}

          {activeTab === 1 && (
            <DestinationsTab
              cities={cities ?? []}
              countryName={country.name}
            />
          )}

          {activeTab === 2 && (
            <CountryGuideTab
              country={country}
              healthPlaces={(healthPlaces ?? []) as PlaceWithCity[]}
            />
          )}

          {activeTab === 3 && (
            <CountryBudgetTab
              country={country}
              emergency={emergency}
            />
          )}
        </View>
      </Animated.ScrollView>

      {/* ── Persistent back button (always visible) ───────────────── */}
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
  flag: {
    fontSize: 20,
    lineHeight: 24,
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
