import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import MenuButton from '@/components/MenuButton';
import { getCountryBySlug, getCitiesByCountry, getTopPlacesByCountry, getPlacesByCountryAndType } from '@/data/api';
import type { PlaceWithCity } from '@/data/types';
import { getCountryThreadPreviews } from '@/data/community/communityApi';
import { getEmergencyNumbers } from '@/data/safety';
import { useData } from '@/hooks/useData';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { CityHorizontalCard } from '@/components/explore/country/CityHorizontalCard';
import { CommunityThreadRows } from '@/components/explore/country/CommunityThreadRows';
import { SovereigntySection } from '@/components/explore/country/SovereigntySection';
import { InfrastructureSection } from '@/components/explore/country/InfrastructureSection';
import { HealthAccessSection } from '@/components/explore/country/HealthAccessSection';
import { ExperienceSection } from '@/components/explore/country/ExperienceSection';
import { CommunitySection } from '@/components/explore/country/CommunitySection';
import { CostRealitySection } from '@/components/explore/country/CostRealitySection';
import { QuickReference } from '@/components/explore/country/QuickReference';
import { colors, fonts, spacing } from '@/constants/design';

// ---------------------------------------------------------------------------
// Breadcrumb
// ---------------------------------------------------------------------------

function Breadcrumb({
  countryName,
  fromCollection,
  fromCollectionSlug,
  onDiscover,
  onCollection,
}: {
  countryName: string;
  fromCollection?: string;
  fromCollectionSlug?: string;
  onDiscover: () => void;
  onCollection?: () => void;
}) {
  return (
    <View style={styles.breadcrumb}>
      <Pressable onPress={onDiscover} hitSlop={8}>
        <Text style={styles.breadcrumbLink}>Discover</Text>
      </Pressable>
      {fromCollection && onCollection ? (
        <>
          <Text style={styles.breadcrumbSep}>/</Text>
          <Pressable onPress={onCollection} hitSlop={8}>
            <Text style={styles.breadcrumbLink} numberOfLines={1}>
              {fromCollection}
            </Text>
          </Pressable>
        </>
      ) : null}
      <Text style={styles.breadcrumbSep}>/</Text>
      <Text style={styles.breadcrumbCurrent} numberOfLines={1}>
        {countryName}
      </Text>
    </View>
  );
}

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
  const { slug, fromCollection, fromCollectionSlug } = useLocalSearchParams<{
    slug: string;
    fromCollection?: string;
    fromCollectionSlug?: string;
  }>();
  const router = useRouter();
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

  // Fetch health facilities
  const { data: healthPlaces } = useData(
    () => country?.id ? getPlacesByCountryAndType(country.id, ['hospital', 'clinic', 'pharmacy']) : Promise.resolve([]),
    ['healthPlaces', country?.id],
  );

  // Fetch social places
  const { data: socialPlaces } = useData(
    () => country?.id ? getPlacesByCountryAndType(country.id, ['hostel', 'coworking', 'cafe']) : Promise.resolve([]),
    ['socialPlaces', country?.id],
  );

  // Fetch community threads
  const { data: threadData } = useData(
    () => country?.id ? getCountryThreadPreviews(country.id, 3) : Promise.resolve(null),
    ['countryThreadPreviews', country?.id],
  );

  const headerLeft = (
    <Image
      source={require('@/assets/images/sola-logo.png')}
      style={styles.headerLogo}
      contentFit="contain"
    />
  );

  if (countryLoading || (country && citiesLoading)) {
    return (
      <AppScreen>
        <AppHeader title="" leftComponent={headerLeft} rightComponent={<MenuButton />} />
        <LoadingScreen />
      </AppScreen>
    );
  }
  if (error) {
    return (
      <AppScreen>
        <AppHeader title="" leftComponent={headerLeft} rightComponent={<MenuButton />} />
        <ErrorScreen message={error.message} onRetry={refetch} />
      </AppScreen>
    );
  }
  if (!country) {
    return (
      <AppScreen>
        <AppHeader title="" leftComponent={headerLeft} rightComponent={<MenuButton />} />
        <Text style={styles.notFound}>Guide not found</Text>
      </AppScreen>
    );
  }

  const emergency = getEmergencyNumbers(country.iso2);
  const editorialText = country.whyWeLoveMd || country.summaryMd || country.portraitMd;
  const cityList = cities ?? [];
  const placeList = (topPlaces ?? []) as PlaceWithCity[];

  return (
    <AppScreen>
      <AppHeader title="" leftComponent={headerLeft} rightComponent={<MenuButton />} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Breadcrumb
          countryName={country.name}
          fromCollection={fromCollection}
          fromCollectionSlug={fromCollectionSlug}
          onDiscover={() => router.push('/(tabs)/discover')}
          onCollection={
            fromCollectionSlug
              ? () => router.push(`/(tabs)/discover/collection/${fromCollectionSlug}`)
              : undefined
          }
        />
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
          {/* Opening editorial line */}
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

          {/* Dimension 1: How it feels to be here */}
          <SovereigntySection country={country} />

          {/* Dimension 2: Getting around on your own */}
          <InfrastructureSection country={country} />

          {/* Dimension 3: Your health here */}
          <HealthAccessSection country={country} places={(healthPlaces ?? []) as PlaceWithCity[]} />

          {/* Dimension 4: What you'll do here */}
          <ExperienceSection country={country} places={placeList} />

          {/* Where to Go (Cities) - kept from original */}
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

          {/* Dimension 5: Meeting people */}
          <CommunitySection country={country} places={(socialPlaces ?? []) as PlaceWithCity[]} />

          {/* Dimension 6: What it costs (really) */}
          <CostRealitySection country={country} />

          {/* Quick Reference */}
          <QuickReference country={country} emergency={emergency} />

          {/* Community Threads - kept from original */}
          {threadData && threadData.threads.length > 0 && (
            <CommunityThreadRows
              threads={threadData.threads}
              totalCount={threadData.totalCount}
              countryId={country.id}
              countryName={country.name}
            />
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  headerLogo: {
    height: 22,
    width: 76,
  },
  notFound: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
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
    flexShrink: 1,
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
