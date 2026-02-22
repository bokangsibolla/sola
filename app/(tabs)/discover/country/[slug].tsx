import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationHeader from '@/components/NavigationHeader';
import { useNavContext } from '@/hooks/useNavContext';
import { eventTracker } from '@/data/events/eventTracker';
import {
  getCountryBySlug,
  getCitiesByCountry,
  getExperiencesByCountry,
  getPlacesByCountryAndType,
} from '@/data/api';
import type { PlaceWithCity } from '@/data/types';
import { getEmergencyNumbers } from '@/data/safety';
import { getCountryThreadPreviews } from '@/data/community/communityApi';
import { useData } from '@/hooks/useData';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { SignalsRow } from '@/components/explore/country/SignalsRow';
import { AtAGlanceGrid } from '@/components/explore/country/AtAGlanceGrid';
import { WhyWomenLoveIt } from '@/components/explore/country/WhyWomenLoveIt';
import { TravelFitSection } from '@/components/explore/country/TravelFitSection';
import { KnowBeforeYouGoAccordion } from '@/components/explore/country/KnowBeforeYouGoAccordion';
import { BudgetBreakdown } from '@/components/explore/country/BudgetBreakdown';
import { QuickReference } from '@/components/explore/country/QuickReference';
import { CommunityThreadRows } from '@/components/explore/country/CommunityThreadRows';
import { FinalNote } from '@/components/explore/country/FinalNote';
import { CityHorizontalCard } from '@/components/explore/country/CityHorizontalCard';
import { PlaceHorizontalCard } from '@/components/explore/country/PlaceHorizontalCard';
import { colors, fonts, spacing } from '@/constants/design';

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
      <SolaText style={styles.sectionTitle}>{title}</SolaText>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} hitSlop={8}>
          <SolaText style={styles.seeAll}>{actionLabel}</SolaText>
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
  const { slug } = useLocalSearchParams<{
    slug: string;
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

  useEffect(() => {
    if (country?.id) {
      eventTracker.track('viewed_country', 'country', country.id);
    }
  }, [country?.id]);

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

  // Fetch health facilities
  const { data: healthPlaces } = useData(
    () => country?.id ? getPlacesByCountryAndType(country.id, ['hospital', 'clinic', 'pharmacy']) : Promise.resolve([]),
    ['healthPlaces', country?.id],
  );

  // Fetch community threads
  const { data: communityData } = useData(
    () => country?.id ? getCountryThreadPreviews(country.id, 3) : Promise.resolve({ threads: [], totalCount: 0 }),
    ['countryThreads', country?.id],
  );

  const { parentTitle, ancestors, handleBack, childNavParams } = useNavContext({
    title: country?.name ?? 'Country',
    path: `/(tabs)/discover/country/${slug}`,
    fallbackCrumbs: [
      { label: 'Discover', path: '/(tabs)/discover' },
    ],
  });

  if (countryLoading || (country && citiesLoading)) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <NavigationHeader title="Loading…" parentTitle={parentTitle ?? 'Discover'} onBack={handleBack} />
        <LoadingScreen />
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <NavigationHeader title="Country" parentTitle={parentTitle ?? 'Discover'} onBack={handleBack} />
        <ErrorScreen message={error.message} onRetry={refetch} />
      </SafeAreaView>
    );
  }
  if (!country) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <NavigationHeader title="Country" parentTitle={parentTitle ?? 'Discover'} onBack={handleBack} />
        <SolaText style={styles.notFound}>Guide not found</SolaText>
      </SafeAreaView>
    );
  }

  const emergency = getEmergencyNumbers(country.iso2);
  const cityList = cities ?? [];
  const experienceList = (experiences ?? []) as PlaceWithCity[];
  const healthList = (healthPlaces ?? []) as PlaceWithCity[];

  // Derive intro text from introMd or summaryMd (first paragraph, cleaned)
  const introText = country.introMd
    ? country.introMd.replace(/^#+\s.*/gm, '').replace(/\*\*/g, '').trim().split(/\n\n+/)[0]?.trim()
    : country.summaryMd
      ? country.summaryMd.split(/\n\n+/)[0]?.trim()
      : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <NavigationHeader
        title={country.name}
        parentTitle={parentTitle ?? 'Discover'}
        ancestors={ancestors}
        onBack={handleBack}
      />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* 1. Hero (240px) */}
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
            <SolaText style={styles.heroName}>{country.name}</SolaText>
            {country.subtitle && <SolaText style={styles.heroTagline}>{country.subtitle}</SolaText>}
          </View>
        </View>

        {/* 2. Signal chips */}
        <SignalsRow country={country} />

        {/* 3. Intro paragraph */}
        {introText ? (
          <View style={styles.content}>
            <SolaText style={styles.introText}>{introText}</SolaText>
          </View>
        ) : null}

        {/* 4. Explore cities */}
        {cityList.length > 0 && (
          <View style={styles.section}>
            <View style={styles.content}>
              <SectionHeader
                title="Explore cities"
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
                <CityHorizontalCard key={city.slug} city={city} compact />
              ))}
            </ScrollView>
          </View>
        )}

        {/* 5. At a Glance grid */}
        <AtAGlanceGrid country={country} />

        {/* 6. Things to do */}
        {experienceList.length > 0 && (
          <View style={styles.section}>
            <View style={styles.content}>
              <SectionHeader title="Things to do" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
              style={styles.horizontalScrollContainer}
            >
              {experienceList.map((place) => (
                <PlaceHorizontalCard key={place.id} place={place} compact />
              ))}
            </ScrollView>
          </View>
        )}

        <Divider />

        {/* 7. Budget breakdown (standalone) */}
        {country.budgetBreakdown && (
          <>
            <View style={styles.content}>
              <BudgetBreakdown
                budget={country.budgetBreakdown}
                moneyMd={country.moneyMd}
                cashVsCard={country.cashVsCard}
              />
            </View>
            <Divider />
          </>
        )}

        {/* 8. Why women love it */}
        <WhyWomenLoveIt country={country} />

        <Divider />

        {/* 9. Travel fit */}
        <TravelFitSection country={country} />

        <Divider />

        {/* 10. Know before you go (3-4 items) */}
        <KnowBeforeYouGoAccordion country={country} healthPlaces={healthList} />

        <Divider />

        {/* 11. Quick reference */}
        <View style={styles.content}>
          <QuickReference country={country} emergency={emergency} />
        </View>

        {/* 12. Community threads */}
        {communityData && communityData.threads.length > 0 && (
          <View style={styles.content}>
            <CommunityThreadRows
              threads={communityData.threads}
              totalCount={communityData.totalCount}
              countryId={country.id}
              countryName={country.name}
            />
          </View>
        )}

        {/* 13. Final note */}
        <FinalNote country={country} />

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
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

  // Hero (240px)
  heroContainer: {
    position: 'relative',
    height: 240,
  },
  heroImage: {
    width: '100%',
    height: 240,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
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

  // Intro paragraph
  introText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 23,
    marginBottom: spacing.lg,
  },

  // Content area (padded sections)
  content: {
    paddingHorizontal: spacing.screenX,
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
