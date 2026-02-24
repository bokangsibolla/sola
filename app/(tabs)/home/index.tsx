import { useEffect, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { usePostHog } from 'posthog-react-native';
import { useRouter } from 'expo-router';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import { HamburgerButton } from '@/components/home/HamburgerButton';
import { HeroModule } from '@/components/home/HeroModule';
import { ForYouRow } from '@/components/home/ForYouRow';
import { CommunityBannerCard } from '@/components/home/CommunityBannerCard';
import { HomeSkeleton } from '@/components/home/HomeSkeleton';
import { TripModeCard } from '@/components/trips/TripMode/TripModeCard';
import { VerificationNudge } from '@/components/home/VerificationNudge';
import { AvatarNudge } from '@/components/home/AvatarNudge';
import { useHomeData } from '@/data/home/useHomeData';
import { useAuth } from '@/state/AuthContext';
import { getTripsGrouped } from '@/data/trips/tripApi';
import { useData } from '@/hooks/useData';
import { colors, spacing } from '@/constants/design';

export default function HomeScreen() {
  const posthog = usePostHog();
  const router = useRouter();
  const { userId } = useAuth();

  useEffect(() => {
    posthog.capture('home_viewed');
  }, [posthog]);

  const {
    heroState,
    savedPlaces,
    personalizedCities,
    loading,
    refetch,
  } = useHomeData();

  // Fetch grouped trips to detect an active (current) trip
  const { data: grouped } = useData(
    () => (userId ? getTripsGrouped(userId) : Promise.resolve(null)),
    [userId],
  );

  // Determine active trip — must have arriving/leaving dates spanning today
  const activeTrip = useMemo(() => {
    if (!grouped?.current) return null;
    const trip = grouped.current;
    if (!trip.arriving || !trip.leaving) return null;

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    if (todayStr >= trip.arriving && todayStr <= trip.leaving) {
      return trip;
    }
    return null;
  }, [grouped]);

  return (
    <AppScreen>
      <NavigationHeader
        title="Home"
        showLogo
        rightActions={<HamburgerButton />}
      />

      {loading && !heroState ? (
        <HomeSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              tintColor={colors.orange}
            />
          }
        >
          {activeTrip != null && (
            <View style={styles.tripModeSection}>
              <TripModeCard
                tripId={activeTrip.id}
                tripTitle={activeTrip.title ?? activeTrip.destinationName}
                arriving={activeTrip.arriving!}
                leaving={activeTrip.leaving!}
                destinationName={activeTrip.destinationName}
                onPress={() =>
                  router.push(`/(tabs)/trips/${activeTrip.id}` as any)
                }
              />
            </View>
          )}

          <VerificationNudge />
          <AvatarNudge />

          <View style={styles.heroSection}>
            <HeroModule hero={heroState} />
          </View>

          <ForYouRow
            heroState={heroState}
            savedPlaces={savedPlaces}
            personalizedCities={personalizedCities}
          />

          <CommunityBannerCard />
        </ScrollView>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.md,
  },
  tripModeSection: {
    marginTop: spacing.lg,
  },
  heroSection: {
    marginTop: spacing.lg,
  },
});
