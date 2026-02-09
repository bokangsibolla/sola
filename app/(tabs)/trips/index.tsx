import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import InboxButton from '@/components/InboxButton';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import CurrentTripCard from '@/components/trips/CurrentTripCard';
import TripListCard from '@/components/trips/TripListCard';
import TripEmptyState from '@/components/trips/TripEmptyState';
import { useTrips } from '@/data/trips/useTrips';
import { colors, fonts, spacing, radius } from '@/constants/design';

export default function TripsScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const { trips, loading, error, refetch } = useTrips();
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    posthog.capture('trips_screen_viewed');
  }, [posthog]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;

  const upcoming = trips.upcoming ?? [];
  const past = trips.past ?? [];
  const isEmpty = !trips.current && upcoming.length === 0 && past.length === 0;

  return (
    <AppScreen>
      <AppHeader
        title="Trips"
        rightComponent={
          <View style={styles.headerRight}>
            <InboxButton />
            <Pressable
              style={styles.addButton}
              onPress={() => {
                posthog.capture('add_trip_tapped');
                router.push('/trips/new');
              }}
            >
              <Ionicons name="add" size={22} color={colors.orange} />
            </Pressable>
          </View>
        }
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
                <Text style={styles.sectionLabel}>UPCOMING</Text>
                {upcoming.map((trip) => (
                  <TripListCard key={trip.id} trip={trip} />
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
                  <Text style={styles.sectionLabel}>PAST TRIPS</Text>
                  <Ionicons
                    name={showPast ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.textSecondary}
                  />
                </Pressable>
                {showPast &&
                  past.map((trip) => (
                    <TripListCard key={trip.id} trip={trip} />
                  ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingBottom: spacing.xxl,
  },
  section: {
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
});
