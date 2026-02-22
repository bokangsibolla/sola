import React, { useEffect, useState, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationHeader from '@/components/NavigationHeader';
import { useNavContext } from '@/hooks/useNavContext';
import { eventTracker } from '@/data/events/eventTracker';
import {
  getCountryBySlug,
  getCitiesByCountry,
  getPlacesByCountryAndType,
} from '@/data/api';
import type { PlaceWithCity } from '@/data/types';
import { getEmergencyNumbers } from '@/data/safety';
import { getCountryThreadPreviews } from '@/data/community/communityApi';
import { useData } from '@/hooks/useData';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { CountryHeroCard } from '@/components/explore/country/CountryHeroCard';
import { HighlightCards } from '@/components/explore/country/HighlightCards';
import { CountryTabBar, CountryTab } from '@/components/explore/country/CountryTabBar';
import { WhyWomenLoveIt } from '@/components/explore/country/WhyWomenLoveIt';
import { TravelFitSection } from '@/components/explore/country/TravelFitSection';
import { KnowBeforeYouGoAccordion } from '@/components/explore/country/KnowBeforeYouGoAccordion';
import { BudgetBreakdown } from '@/components/explore/country/BudgetBreakdown';
import { BudgetTips } from '@/components/explore/country/BudgetTips';
import { QuickReference } from '@/components/explore/country/QuickReference';
import { CommunityThreadRows } from '@/components/explore/country/CommunityThreadRows';
import { CityHorizontalCard } from '@/components/explore/country/CityHorizontalCard';
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
  const { slug } = useLocalSearchParams<{
    slug: string;
  }>();
  const router = useRouter();
  const posthog = usePostHog();
  const [activeTab, setActiveTab] = useState<CountryTab>('overview');

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

  const { parentTitle, ancestors, handleBack } = useNavContext({
    title: country?.name ?? 'Country',
    path: `/(tabs)/discover/country/${slug}`,
    fallbackCrumbs: [
      { label: 'Discover', path: '/(tabs)/discover' },
    ],
  });

  // Build image map for HighlightCards (city id -> hero image)
  const imageMap = useMemo(() => {
    const map: Record<string, string | null> = {};
    (cities ?? []).forEach(c => { map[c.id] = c.heroImageUrl; });
    return map;
  }, [cities]);

  if (countryLoading || (country && citiesLoading)) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <NavigationHeader title="Loading\u2026" parentTitle={parentTitle ?? 'Discover'} onBack={handleBack} />
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
        <Text style={styles.notFound}>Guide not found</Text>
      </SafeAreaView>
    );
  }

  const emergency = getEmergencyNumbers(country.iso2);
  const cityList = cities ?? [];
  const healthList = (healthPlaces ?? []) as PlaceWithCity[];

  // Show all paragraphs from introMd (strip markdown headings & bold markers)
  const introText = country.introMd
    ? country.introMd.replace(/^#+\s.*/gm, '').replace(/\*\*/g, '').trim()
    : country.summaryMd
      ? country.summaryMd.trim()
      : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <NavigationHeader
        title={country.name}
        parentTitle={parentTitle ?? 'Discover'}
        ancestors={ancestors}
        onBack={handleBack}
      />

      {/* Tab bar — sticky between header and scroll content */}
      <CountryTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView key={activeTab} showsVerticalScrollIndicator={false}>

        {/* ============================================================= */}
        {/* OVERVIEW TAB                                                   */}
        {/* ============================================================= */}
        {activeTab === 'overview' && (
          <>
            {/* Hero card */}
            <View style={{ marginTop: spacing.lg }}>
              <CountryHeroCard
                name={country.name}
                heroImageUrl={country.heroImageUrl}
                soloLevel={country.soloLevel}
                avgDailyBudgetUsd={country.avgDailyBudgetUsd}
                bestMonths={country.bestMonths}
              />
            </View>

            {/* Highlight cards */}
            {country.destinationHighlights && country.destinationHighlights.length > 0 && (
              <HighlightCards
                highlights={country.destinationHighlights}
                imageMap={imageMap}
              />
            )}

            {/* Intro text */}
            {introText ? (
              <View style={[styles.content, { marginTop: spacing.xl }]}>
                <Text style={styles.introText}>{introText}</Text>
              </View>
            ) : null}

            {/* Explore cities */}
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

            {/* Community threads */}
            {communityData && communityData.threads.length > 0 && (
              <View style={styles.content}>
                <Divider />
                <CommunityThreadRows
                  threads={communityData.threads}
                  totalCount={communityData.totalCount}
                  countryId={country.id}
                  countryName={country.name}
                />
              </View>
            )}
          </>
        )}

        {/* ============================================================= */}
        {/* GUIDE TAB                                                      */}
        {/* ============================================================= */}
        {activeTab === 'guide' && (
          <>
            {/* Why women love it */}
            <WhyWomenLoveIt country={country} />

            <Divider />

            {/* Travel fit — both sections visible */}
            <TravelFitSection country={country} />

            <Divider />

            {/* Know before you go */}
            <KnowBeforeYouGoAccordion country={country} healthPlaces={healthList} />
          </>
        )}

        {/* ============================================================= */}
        {/* BUDGET TAB                                                     */}
        {/* ============================================================= */}
        {activeTab === 'budget' && (
          <>
            {/* Budget breakdown */}
            {country.budgetBreakdown && (
              <View style={styles.content}>
                <BudgetBreakdown
                  budget={country.budgetBreakdown}
                  moneyMd={country.moneyMd}
                  cashVsCard={country.cashVsCard}
                />
              </View>
            )}

            {/* Budget tips */}
            {country.budgetTips && country.budgetTips.length > 0 && (
              <View style={styles.content}>
                <BudgetTips tips={country.budgetTips} />
              </View>
            )}

            <Divider />

            {/* Quick reference */}
            <View style={styles.content}>
              <QuickReference country={country} emergency={emergency} />
            </View>
          </>
        )}

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
