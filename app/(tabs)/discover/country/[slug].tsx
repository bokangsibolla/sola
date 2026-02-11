import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import MenuButton from '@/components/MenuButton';
import {
  getCountryBySlug,
  getCitiesByCountry,
  getExperiencesByCountry,
  getSocialSpotsByCountry,
  getPlacesByCountryAndType,
} from '@/data/api';
import type { PlaceWithCity } from '@/data/types';
import { getCountryThreadPreviews } from '@/data/community/communityApi';
import { getEmergencyNumbers } from '@/data/safety';
import { useData } from '@/hooks/useData';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { SignalsRow } from '@/components/explore/country/SignalsRow';
import { BudgetBreakdown } from '@/components/explore/country/BudgetBreakdown';
import { KnowBeforeYouGoAccordion } from '@/components/explore/country/KnowBeforeYouGoAccordion';
import { QuickReference } from '@/components/explore/country/QuickReference';
import { CityHorizontalCard } from '@/components/explore/country/CityHorizontalCard';
import { PlaceHorizontalCard } from '@/components/explore/country/PlaceHorizontalCard';
import { CommunityThreadRows } from '@/components/explore/country/CommunityThreadRows';
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
// Section Header
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
// Section Divider
// ---------------------------------------------------------------------------

function Divider() {
  return <View style={styles.divider} />;
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

  // Fetch experiences (tours, activities, landmarks — NEVER accommodations)
  const { data: experiences } = useData(
    () => country?.id ? getExperiencesByCountry(country.id, 10) : Promise.resolve([]),
    ['experiencesByCountry', country?.id],
  );

  // Fetch social spots (bars, cafes, restaurants, clubs, rooftops)
  const { data: socialSpots } = useData(
    () => country?.id ? getSocialSpotsByCountry(country.id, 8) : Promise.resolve([]),
    ['socialSpotsByCountry', country?.id],
  );

  // Fetch health facilities
  const { data: healthPlaces } = useData(
    () => country?.id ? getPlacesByCountryAndType(country.id, ['hospital', 'clinic', 'pharmacy']) : Promise.resolve([]),
    ['healthPlaces', country?.id],
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
  const cityList = cities ?? [];
  const experienceList = (experiences ?? []) as PlaceWithCity[];
  const socialList = (socialSpots ?? []) as PlaceWithCity[];
  const healthList = (healthPlaces ?? []) as PlaceWithCity[];

  // Build introduction text: prefer intro_md, fall back to editorial fields
  const introText = country.introMd
    || country.summaryMd
    || country.whyWeLoveMd
    || country.portraitMd;

  // Split intro into paragraphs (max 2)
  const introParagraphs = introText
    ? introText
        .replace(/^#+\s.*/gm, '')
        .replace(/\*\*/g, '')
        .replace(/^[-*]\s+/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .split(/\n\n+/)
        .map((p: string) => p.replace(/\n/g, ' ').trim())
        .filter((p: string) => p.length > 0)
        .slice(0, 2)
    : [];

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

        {/* A. Hero */}
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

        {/* B. Signals Row */}
        <View style={styles.signalsSpacing}>
          <SignalsRow country={country} />
        </View>

        {/* C. Introduction */}
        {introParagraphs.length > 0 && (
          <View style={styles.content}>
            {introParagraphs.map((paragraph, index) => (
              <Text key={index} style={styles.introText}>{paragraph}</Text>
            ))}
          </View>
        )}

        <Divider />

        {/* D. Top Experiences (activities only, NEVER accommodations) */}
        {experienceList.length > 0 && (
          <View style={styles.section}>
            <View style={styles.content}>
              {country.experienceDensityMd && (
                <Text style={styles.sectionIntro} numberOfLines={2}>
                  {country.experienceDensityMd
                    .replace(/^#+\s.*/gm, '')
                    .replace(/\*\*/g, '')
                    .replace(/^[-*]\s+/gm, '')
                    .trim()
                    .split(/[.!?]\s/)
                    .slice(0, 1)
                    .join('. ')
                    .replace(/\s*$/, '.')}
                </Text>
              )}
              <SectionHeader title="Top experiences" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
              style={styles.horizontalScrollContainer}
            >
              {experienceList.map((place) => (
                <PlaceHorizontalCard key={place.id} place={place} />
              ))}
            </ScrollView>
          </View>
        )}

        <Divider />

        {/* E. Where to Go (Cities) */}
        {cityList.length > 0 && (
          <View style={styles.section}>
            <View style={styles.content}>
              <SectionHeader
                title="Where to go"
                actionLabel={cityList.length > 3 ? `All ${cityList.length} cities` : undefined}
                onAction={cityList.length > 3 ? () => {
                  router.push({
                    pathname: '/(tabs)/discover/country/cities' as any,
                    params: { countryId: country.id, countryName: country.name, countrySlug: country.slug },
                  });
                } : undefined}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
              style={styles.horizontalScrollContainer}
            >
              {cityList.map((city) => (
                <CityHorizontalCard key={city.slug} city={city} />
              ))}
            </ScrollView>
          </View>
        )}

        <Divider />

        {/* F. Budget Breakdown */}
        <View style={styles.content}>
          {country.budgetBreakdown && (
            <BudgetBreakdown budget={country.budgetBreakdown} />
          )}
        </View>

        {/* G. Know Before You Go (accordion) */}
        <View style={styles.content}>
          <KnowBeforeYouGoAccordion
            country={country}
            healthPlaces={healthList}
          />
        </View>

        {/* H. Social Scene */}
        {socialList.length > 0 && (
          <View style={styles.section}>
            <View style={styles.content}>
              {country.communityConnectionMd && (
                <Text style={styles.sectionIntro} numberOfLines={2}>
                  {country.communityConnectionMd
                    .replace(/^#+\s.*/gm, '')
                    .replace(/\*\*/g, '')
                    .replace(/^[-*]\s+/gm, '')
                    .trim()
                    .split(/[.!?]\s/)
                    .slice(0, 1)
                    .join('. ')
                    .replace(/\s*$/, '.')}
                </Text>
              )}
              <SectionHeader title="Social scene" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
              style={styles.horizontalScrollContainer}
            >
              {socialList.map((place) => (
                <PlaceHorizontalCard key={place.id} place={place} />
              ))}
            </ScrollView>
          </View>
        )}

        <Divider />

        {/* I. Quick Reference */}
        <View style={styles.content}>
          <QuickReference country={country} emergency={emergency} />
        </View>

        {/* J. Community */}
        {threadData && threadData.threads.length > 0 && (
          <View style={styles.content}>
            <CommunityThreadRows
              threads={threadData.threads}
              totalCount={threadData.totalCount}
              countryId={country.id}
              countryName={country.name}
            />
          </View>
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
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
    left: spacing.screenX,
    right: spacing.screenX,
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

  // Signals spacing
  signalsSpacing: {
    marginTop: spacing.xl,
  },

  // Content area (padded sections)
  content: {
    paddingHorizontal: spacing.screenX,
  },

  // Introduction
  introText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 26,
    marginBottom: spacing.lg,
  },

  // Section divider
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginHorizontal: spacing.screenX,
    marginVertical: spacing.xl,
  },

  // Section containers
  section: {
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  seeAll: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
  sectionIntro: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },

  // Horizontal scroll containers
  horizontalScrollContainer: {
    marginHorizontal: -spacing.screenX,
    paddingLeft: spacing.screenX,
  },
  horizontalScroll: {
    paddingRight: spacing.screenX,
    paddingLeft: spacing.screenX,
  },

  // Bottom spacing
  bottomSpacer: {
    height: spacing.xxxxl,
  },
});
