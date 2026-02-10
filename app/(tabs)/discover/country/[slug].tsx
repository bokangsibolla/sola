import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import { getCountryBySlug, getCitiesByCountry, getTopPlacesByCountry } from '@/data/api';
import type { PlaceWithCity } from '@/data/types';
import { getCountryThreadPreviews } from '@/data/community/communityApi';
import { getEmergencyNumbers } from '@/data/safety';
import { useData } from '@/hooks/useData';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { KnowBeforeYouGo } from '@/components/explore/country/KnowBeforeYouGo';
import { CityHorizontalCard } from '@/components/explore/country/CityHorizontalCard';
import { TravelingAsAWoman } from '@/components/explore/country/TravelingAsAWoman';
import { PlaceHorizontalCard } from '@/components/explore/country/PlaceHorizontalCard';
import { PracticalGuide } from '@/components/explore/country/PracticalGuide';
import { CommunityThreadRows } from '@/components/explore/country/CommunityThreadRows';
import { colors, fonts, spacing } from '@/constants/design';

// ---------------------------------------------------------------------------
// Section Header with optional "See all" action
// ---------------------------------------------------------------------------

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.seeAll}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function CountryGuideScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();

  useEffect(() => {
    if (slug) {
      posthog.capture('country_guide_viewed', { country_slug: slug });
    }
  }, [slug, posthog]);

  // Fetch country
  const { data: country, loading: countryLoading, error, refetch } = useData(
    () => slug ? getCountryBySlug(slug) : Promise.resolve(null),
    [slug],
  );

  // Fetch cities
  const { data: cities, loading: citiesLoading } = useData(
    () => country?.id ? getCitiesByCountry(country.id) : Promise.resolve([]),
    ['citiesByCountry', country?.id],
  );

  // Fetch top places across all cities
  const { data: topPlaces } = useData(
    () => country?.id ? getTopPlacesByCountry(country.id, 8) : Promise.resolve([]),
    ['topPlacesByCountry', country?.id],
  );

  // Fetch community threads
  const { data: threadData } = useData(
    () => country?.id ? getCountryThreadPreviews(country.id, 3) : Promise.resolve(null),
    ['countryThreadPreviews', country?.id],
  );

  if (countryLoading || (country && citiesLoading)) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;
  if (!country) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>Guide not found</Text>
      </View>
    );
  }

  const emergency = getEmergencyNumbers(country.iso2);
  const editorialText = country.whyWeLoveMd || country.summaryMd || country.portraitMd;
  const cityList = cities ?? [];
  const placeList = (topPlaces ?? []) as PlaceWithCity[];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Navigation bar */}
      <View style={styles.nav}>
        <Pressable
          onPress={() => router.push('/(tabs)/explore' as any)}
          hitSlop={12}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          <Text style={styles.backLabel}>Explore</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Section 1: Hero + Editorial Overview ── */}
        <View style={styles.heroContainer}>
          {country.heroImageUrl ? (
            <Image
              source={{ uri: country.heroImageUrl }}
              style={styles.heroImage}
              contentFit="cover"
              transition={200}
              pointerEvents="none"
            />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: colors.neutralFill }]} pointerEvents="none" />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)']}
            style={styles.heroGradient}
          />
          <View style={styles.heroOverlay} pointerEvents="none">
            <Text style={styles.heroName}>{country.name}</Text>
            {country.subtitle && <Text style={styles.heroTagline}>{country.subtitle}</Text>}
          </View>
        </View>

        <View style={styles.content}>
          {/* Editorial paragraph */}
          {editorialText && (
            <Text style={styles.editorialText}>
              {editorialText
                .replace(/^#+\s.*/gm, '')
                .replace(/\*\*/g, '')
                .replace(/^[-*]\s+/gm, '')
                .replace(/\n{2,}/g, ' ')
                .trim()}
            </Text>
          )}

          {/* ── Section 2: Know Before You Go ── */}
          <KnowBeforeYouGo country={country} />

          {/* ── Section 3: Where to Go (Cities) ── */}
          {cityList.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Where to Go"
                actionLabel={cityList.length > 2 ? `All ${cityList.length} cities` : undefined}
                onAction={cityList.length > 2 ? () => {
                  router.push({
                    pathname: '/(tabs)/discover/country/cities' as any,
                    params: { countryId: country.id, countryName: country.name, countrySlug: country.slug },
                  });
                } : undefined}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {cityList.map((city) => (
                  <CityHorizontalCard key={city.slug} city={city} />
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── Section 4: Traveling Here as a Woman ── */}
          <TravelingAsAWoman country={country} />

          {/* ── Section 5: Things to Do (Top Places) ── */}
          {placeList.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Things to Do"
                actionLabel="See all"
                onAction={() => {
                  router.push({
                    pathname: '/(tabs)/discover/country/places' as any,
                    params: { countryId: country.id, countryName: country.name, countrySlug: country.slug },
                  });
                }}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {placeList.map((place) => (
                  <PlaceHorizontalCard key={place.id} place={place} />
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── Section 6: Community Threads ── */}
          {threadData && threadData.threads.length > 0 && (
            <CommunityThreadRows
              threads={threadData.threads}
              totalCount={threadData.totalCount}
              countryId={country.id}
              countryName={country.name}
            />
          )}

          {/* ── Section 7: Practical Guide ── */}
          <PracticalGuide country={country} emergency={emergency} />
        </View>
      </ScrollView>
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
  notFound: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
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

  // Hero
  heroContainer: {
    position: 'relative',
    height: 280,
  },
  heroImage: {
    width: '100%',
    height: 280,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
  },
  heroName: {
    fontFamily: fonts.semiBold,
    fontSize: 36,
    color: '#FFFFFF',
    lineHeight: 40,
  },
  heroTagline: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
  },

  // Content area
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },

  // Editorial text below hero
  editorialText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 26,
    marginBottom: spacing.xl,
  },

  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  seeAll: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },

  // Horizontal scroll containers
  horizontalScroll: {
    paddingRight: spacing.lg,
  },
});
