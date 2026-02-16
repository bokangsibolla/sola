import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import MenuButton from '@/components/MenuButton';
import { eventTracker } from '@/data/events/eventTracker';
import {
  getCountryBySlug,
  getCitiesByCountry,
  getExperiencesByCountry,
  getPlacesByCountryAndType,
} from '@/data/api';
import type { PlaceWithCity } from '@/data/types';
import { getEmergencyNumbers } from '@/data/safety';
import { useData } from '@/hooks/useData';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { AtAGlanceGrid } from '@/components/explore/country/AtAGlanceGrid';
import { WhyWomenLoveIt } from '@/components/explore/country/WhyWomenLoveIt';
import { TravelFitSection } from '@/components/explore/country/TravelFitSection';
import { PlanYourTripAccordion } from '@/components/explore/country/PlanYourTripAccordion';
import { QuickReference } from '@/components/explore/country/QuickReference';
import { FinalNote } from '@/components/explore/country/FinalNote';
import { CityHorizontalCard } from '@/components/explore/country/CityHorizontalCard';
import { PlaceHorizontalCard } from '@/components/explore/country/PlaceHorizontalCard';
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
  const healthList = (healthPlaces ?? []) as PlaceWithCity[];

  return (
    <AppScreen>
      <AppHeader title="" leftComponent={headerLeft} rightComponent={<MenuButton />} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Breadcrumb */}
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

        {/* 1. Hero (200px) */}
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

        {/* 2. At a Glance grid */}
        <AtAGlanceGrid country={country} />

        {/* 3. Explore cities — images first for visual appeal */}
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

        {/* 4. Things to do — image cards */}
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

        {/* 5. Why Women Love It */}
        <WhyWomenLoveIt country={country} />

        <Divider />

        {/* 6. Travel Fit */}
        <TravelFitSection country={country} />

        <Divider />

        {/* 7. Plan Your Trip */}
        <PlanYourTripAccordion country={country} healthPlaces={healthList} />

        <Divider />

        {/* 8. Quick Reference */}
        <View style={styles.content}>
          <QuickReference country={country} emergency={emergency} />
        </View>

        {/* 9. Final Note */}
        <FinalNote country={country} />

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

  // Hero (200px — compact)
  heroContainer: {
    position: 'relative',
    height: 200,
  },
  heroImage: {
    width: '100%',
    height: 200,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.screenX,
    right: spacing.screenX,
  },
  heroName: {
    fontFamily: fonts.semiBold,
    fontSize: 32,
    color: '#FFFFFF',
    lineHeight: 36,
  },
  heroTagline: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
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
