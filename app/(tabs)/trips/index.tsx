import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import { HamburgerButton } from '@/components/home/HamburgerButton';
import TripListCard from '@/components/trips/TripListCard';
import { TripsEmptyStateV2 } from '@/components/trips/TripsEmptyStateV2';
import { useTrips } from '@/data/trips/useTrips';
import { deleteTrip } from '@/data/trips/tripApi';
import { colors, fonts, spacing } from '@/constants/design';
import type { TripWithStops } from '@/data/trips/types';

type SectionItem =
  | { type: 'section-header'; key: string; title: string }
  | { type: 'trip-card'; key: string; trip: TripWithStops };

export default function TripsScreen() {
  const router = useRouter();
  const { trips, loading, refetch } = useTrips();

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const hasTrips = !!(trips.current || trips.upcoming.length > 0 || trips.past.length > 0);

  const handleCreateTrip = () => router.push('/(tabs)/trips/new');

  const handleDeleteTrip = async (tripId: string) => {
    await deleteTrip(tripId);
    refetch();
  };

  const items: SectionItem[] = [];
  if (trips.current) {
    items.push({ type: 'section-header', key: 'h-current', title: 'Current trip' });
    items.push({ type: 'trip-card', key: trips.current.id, trip: trips.current });
  }
  if (trips.upcoming.length > 0) {
    items.push({ type: 'section-header', key: 'h-upcoming', title: 'Upcoming' });
    for (const t of trips.upcoming) {
      items.push({ type: 'trip-card', key: t.id, trip: t });
    }
  }
  if (trips.past.length > 0) {
    items.push({ type: 'section-header', key: 'h-past', title: 'Past' });
    for (const t of trips.past) {
      items.push({ type: 'trip-card', key: t.id, trip: t });
    }
  }

  const renderItem = ({ item }: { item: SectionItem }) => {
    if (item.type === 'section-header') {
      return <Text style={styles.sectionTitle}>{item.title}</Text>;
    }
    return <TripListCard trip={item.trip} onDelete={handleDeleteTrip} />;
  };

  return (
    <AppScreen>
      <NavigationHeader title="Trips" rightActions={<HamburgerButton />} />
      {!hasTrips && !loading ? (
        <TripsEmptyStateV2 onCreateTrip={handleCreateTrip} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            hasTrips ? (
              <Pressable
                style={({ pressed }) => [styles.newTripRow, pressed && { opacity: 0.7 }]}
                onPress={handleCreateTrip}
              >
                <Text style={styles.newTripText}>Plan a new trip</Text>
              </Pressable>
            ) : null
          }
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  newTripRow: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  newTripText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.orange,
  },
});
