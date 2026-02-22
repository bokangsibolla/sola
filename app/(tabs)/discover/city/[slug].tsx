import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import { eventTracker } from '@/data/events/eventTracker';
import { colors, spacing } from '@/constants/design';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import NavigationHero from '@/components/NavigationHero';
import { useNavContext } from '@/hooks/useNavContext';
import { useData } from '@/hooks/useData';
import {
  getCityBySlug,
  getAreasByCity,
  getCountryById,
  getUpcomingTripForCity,
} from '@/data/api';
import { useAuth } from '@/state/AuthContext';
import { setRecentCity } from '@/data/explore/recentBrowsing';
import SegmentedControl from '@/components/trips/SegmentedControl';
import { OverviewTab } from '@/components/explore/city/OverviewTab';
import { PlacesTab } from '@/components/explore/city/PlacesTab';
import { EventsTab } from '@/components/explore/city/EventsTab';

const TABS = ['Overview', 'Places', 'Events'];

export default function CityScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  // ---------------------------------------------------------------------------
  // Data fetching (screen-level, passed as props)
  // ---------------------------------------------------------------------------

  const { data: city, loading, error, refetch } = useData(
    () => getCityBySlug(slug ?? ''),
    ['cityBySlug', slug],
  );

  const { data: country } = useData(
    () => city?.countryId ? getCountryById(city.countryId) : Promise.resolve(null),
    ['country', city?.countryId],
  );

  const { parentTitle, ancestors, handleBack, childNavParams } = useNavContext({
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

  // Smart default month for Events tab (from upcoming trip)
  const { data: upcomingTrip } = useData(
    () => (userId && city?.id) ? getUpcomingTripForCity(userId, city.id) : Promise.resolve(null),
    ['upcomingTripForCity', userId, city?.id],
  );

  const defaultEventMonth = upcomingTrip?.arriving
    ? new Date(upcomingTrip.arriving).getMonth() + 1
    : undefined;

  // ---------------------------------------------------------------------------
  // Analytics & recent browsing
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (slug) {
      posthog.capture('city_page_viewed', { city_slug: slug });
    }
  }, [slug, posthog]);

  useEffect(() => {
    if (city?.id) {
      eventTracker.track('viewed_city', 'city', city.id);
    }
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

  // ---------------------------------------------------------------------------
  // Loading & error states
  // ---------------------------------------------------------------------------

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;
  if (!city) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <SolaText variant="body" color={colors.textMuted} style={styles.notFound}>City not found</SolaText>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <View style={styles.container}>
      {/* Hero — shared above tabs */}
      <NavigationHero
        imageUrl={city.heroImageUrl}
        title={city.name}
        label={country?.name}
        subtitle={city.positioningLine ?? undefined}
        parentTitle={parentTitle}
        ancestors={ancestors}
        onBack={handleBack}
      />

      {/* Tab bar */}
      <SegmentedControl
        tabs={TABS}
        activeIndex={activeTab}
        onTabPress={setActiveTab}
      />

      {/* Tab content */}
      {activeTab === 0 && (
        <OverviewTab
          city={city}
          areas={areas ?? []}
        />
      )}

      {activeTab === 1 && city.id && (
        <PlacesTab
          cityId={city.id}
          areas={areas ?? []}
        />
      )}

      {activeTab === 2 && city.id && (
        <EventsTab
          cityId={city.id}
          defaultMonth={defaultEventMonth}
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
    textAlign: 'center' as const,
    marginTop: spacing.xxl,
  },
});
