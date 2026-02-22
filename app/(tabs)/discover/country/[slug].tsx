import { useEffect, useState, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import { eventTracker } from '@/data/events/eventTracker';
import { colors, fonts, spacing } from '@/constants/design';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import NavigationHero from '@/components/NavigationHero';
import { useNavContext } from '@/hooks/useNavContext';
import { useData } from '@/hooks/useData';
import {
  getCountryBySlug,
  getCitiesByCountry,
  getPlacesByCountryAndType,
} from '@/data/api';
import type { PlaceWithCity } from '@/data/types';
import { getEmergencyNumbers } from '@/data/safety';
import { getCountryThreadPreviews } from '@/data/community/communityApi';
import SegmentedControl from '@/components/trips/SegmentedControl';
import { CountryOverviewTab } from '@/components/explore/country/CountryOverviewTab';
import { CountryGuideTab } from '@/components/explore/country/CountryGuideTab';
import { CountryBudgetTab } from '@/components/explore/country/CountryBudgetTab';

const TABS = ['Overview', 'Travel Guide', 'Budget'];

export default function CountryGuideScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (slug) posthog.capture('country_guide_viewed', { country_slug: slug });
  }, [slug, posthog]);

  const { data: country, loading: countryLoading, error, refetch } = useData(
    () => slug ? getCountryBySlug(slug) : Promise.resolve(null),
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

  const { parentTitle, ancestors, handleBack } = useNavContext({
    title: country?.name ?? 'Country',
    path: `/(tabs)/discover/country/${slug}`,
    fallbackCrumbs: [{ label: 'Discover', path: '/(tabs)/discover' }],
  });

  // Build image map for HighlightCards
  const imageMap = useMemo(() => {
    const map: Record<string, string | null> = {};
    (cities ?? []).forEach(c => { map[c.id] = c.heroImageUrl; });
    return map;
  }, [cities]);

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

  return (
    <View style={styles.container}>
      <NavigationHero
        imageUrl={country.heroImageUrl}
        title={country.name}
        subtitle={country.vibeSummary ?? country.subtitle ?? undefined}
        parentTitle={parentTitle}
        ancestors={ancestors}
        onBack={handleBack}
      />

      <SegmentedControl
        tabs={TABS}
        activeIndex={activeTab}
        onTabPress={setActiveTab}
      />

      {activeTab === 0 && (
        <CountryOverviewTab
          country={country}
          cities={cities ?? []}
          communityData={communityData}
          imageMap={imageMap}
        />
      )}

      {activeTab === 1 && (
        <CountryGuideTab
          country={country}
          healthPlaces={(healthPlaces ?? []) as PlaceWithCity[]}
        />
      )}

      {activeTab === 2 && (
        <CountryBudgetTab
          country={country}
          emergency={emergency}
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
  notFound: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
