import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import AvatarButton from '@/components/AvatarButton';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import CurrentTripCard from '@/components/trips/CurrentTripCard';
import TripListCard from '@/components/trips/TripListCard';
import TripEmptyState from '@/components/trips/TripEmptyState';
import { useTrips } from '@/data/trips/useTrips';
import { deleteTrip } from '@/data/trips/tripApi';
import { useAppMode } from '@/state/AppModeContext';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { FLOATING_TAB_BAR_HEIGHT } from '@/components/TabBar';

export default function TripsScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const { trips, loading, error, refetch } = useTrips();
  const { mode } = useAppMode();
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    posthog.capture('trips_screen_viewed');
  }, [posthog]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handleDelete = async (tripId: string) => {
    await deleteTrip(tripId);
    refetch();
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;

  const upcoming = trips.upcoming ?? [];
  const past = trips.past ?? [];
  const isEmpty = !trips.current && upcoming.length === 0 && past.length === 0;

  // Travelling Mode: active trip takes over the screen
  if (mode === 'travelling' && trips.current) {
    return (
      <AppScreen>
        <NavigationHeader
          title="Trips"
          rightActions={<AvatarButton />}
        />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <CurrentTripCard trip={trips.current} />
          {upcoming.length > 0 && (
            <View style={styles.section}>
              <SolaText style={styles.sectionLabel}>UPCOMING</SolaText>
              {upcoming.map((trip) => (
                <TripListCard key={trip.id} trip={trip} onDelete={handleDelete} />
              ))}
            </View>
          )}
          <Pressable
            style={({ pressed }) => [styles.newTripButton, pressed && styles.newTripPressed]}
            onPress={() => router.push('/trips/new')}
          >
            <Ionicons name="add" size={20} color={colors.orange} />
            <SolaText style={styles.newTripText}>Plan a new trip</SolaText>
          </Pressable>
        </ScrollView>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <NavigationHeader
        title="Trips"
        rightActions={<AvatarButton />}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {isEmpty ? (
          <TripEmptyState onPress={() => router.push('/trips/new')} />
        ) : (
          <>
            {/* Current trip */}
            {trips.current && <CurrentTripCard trip={trips.current} />}

            {/* Upcoming trips */}
            {upcoming.length > 0 && (
              <View style={styles.section}>
                <SolaText style={styles.sectionLabel}>UPCOMING</SolaText>
                {upcoming.map((trip) => (
                  <TripListCard key={trip.id} trip={trip} onDelete={handleDelete} />
                ))}
              </View>
            )}

            {/* Past trips */}
            {past.length > 0 && (
              <View style={styles.section}>
                <Pressable
                  style={styles.pastToggle}
                  onPress={() => setShowPast(!showPast)}
                >
                  <SolaText style={styles.sectionLabel}>PAST TRIPS</SolaText>
                  <Ionicons
                    name={showPast ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.textSecondary}
                  />
                </Pressable>
                {showPast &&
                  past.map((trip) => (
                    <TripListCard key={trip.id} trip={trip} onDelete={handleDelete} />
                  ))}
              </View>
            )}

            {/* New trip button */}
            <Pressable
              style={({ pressed }) => [styles.newTripButton, pressed && styles.newTripPressed]}
              onPress={() => router.push('/trips/new')}
            >
              <Ionicons name="add" size={20} color={colors.orange} />
              <SolaText style={styles.newTripText}>Plan a new trip</SolaText>
            </Pressable>
          </>
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: FLOATING_TAB_BAR_HEIGHT,
  },
  section: {
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  pastToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  newTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.screenX,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    borderStyle: 'dashed',
  },
  newTripPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  newTripText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.orange,
  },
});
