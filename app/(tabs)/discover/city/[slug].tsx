import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import { eventTracker } from '@/data/events/eventTracker';
import { colors, fonts, spacing, typography } from '@/constants/design';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import NavigationHero from '@/components/NavigationHero';
import BackButton from '@/components/ui/BackButton';
import { useNavContext } from '@/hooks/useNavContext';
import { useData } from '@/hooks/useData';
import {
  getCityBySlug,
  getCityById,
  getAreasByCity,
  getCountryById,
  getUpcomingTripForCity,
} from '@/data/api';
import { useAuth } from '@/state/AuthContext';
import { setRecentCity } from '@/data/explore/recentBrowsing';
import { CountryTabBar } from '@/components/explore/country/CountryTabBar';
import { OverviewTab } from '@/components/explore/city/OverviewTab';
import { PlacesTab } from '@/components/explore/city/PlacesTab';
import { EventsTab } from '@/components/explore/city/EventsTab';

const TABS = [{ label: 'Overview' }, { label: 'Places' }, { label: 'Events' }];

export default function CityScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [showStickySegmented, setShowStickySegmented] = useState(false);

  // ---------------------------------------------------------------------------
  // Data fetching (screen-level, passed as props)
  // ---------------------------------------------------------------------------

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug ?? '');

  const { data: city, loading, error, refetch } = useData(
    () => isUuid ? getCityById(slug ?? '') : getCityBySlug(slug ?? ''),
    ['city', slug],
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

  // Reset sticky header when switching away from Places tab
  useEffect(() => {
    if (activeTab !== 1) setShowStickySegmented(false);
  }, [activeTab]);

  // ---------------------------------------------------------------------------
  // Loading & error states
  // ---------------------------------------------------------------------------

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;
  if (!city) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>City not found</Text>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const isPlacesTab = activeTab === 1;

  return (
    <View style={styles.container}>
      {/* Hero + Segmented — only rendered here for non-Places tabs */}
      {!isPlacesTab && (
        <>
          <NavigationHero
            imageUrl={city.heroImageUrl}
            title={city.name}
            label={country?.name}
            subtitle={city.positioningLine ?? undefined}
            parentTitle={parentTitle}
            ancestors={ancestors}
            onBack={handleBack}
          />
          <CountryTabBar
            tabs={TABS}
            activeIndex={activeTab}
            onTabPress={setActiveTab}
          />
        </>
      )}

      {/* Sticky header — appears when Places hero scrolls away */}
      {isPlacesTab && showStickySegmented && (
        <View style={[styles.stickyHeader, { paddingTop: insets.top }]}>
          <View style={styles.stickyBackRow}>
            <BackButton onPress={handleBack} />
          </View>
          <CountryTabBar
            tabs={TABS}
            activeIndex={activeTab}
            onTabPress={setActiveTab}
          />
        </View>
      )}

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
          heroProps={{
            imageUrl: city.heroImageUrl,
            title: city.name,
            label: country?.name,
            subtitle: city.positioningLine ?? undefined,
            onBack: handleBack,
          }}
          tabs={TABS}
          activeTabIndex={activeTab}
          onTabPress={setActiveTab}
          onScrollPastHero={setShowStickySegmented}
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
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  stickyBackRow: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.sm,
  },
});
