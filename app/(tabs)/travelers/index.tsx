import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius } from '@/constants/design';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import { ActivityCard } from '@/components/connect/ActivityCard';
import { PeopleRow } from '@/components/connect/PeopleRow';
import { QuickPostSheet } from '@/components/connect/QuickPostSheet';
import { CheckInPrompt } from '@/components/connect/CheckInPrompt';
import { useCheckIn } from '@/hooks/useCheckIn';
import { useConnectFeed } from '@/data/connect/useConnectFeed';
import type { ConnectFeedItem } from '@/data/connect/useConnectFeed';
import { useTrips } from '@/data/trips/useTrips';
import { FLOATING_TAB_BAR_HEIGHT } from '@/components/TabBar';

// ---------------------------------------------------------------------------
// Location Pill (inline sub-component)
// ---------------------------------------------------------------------------

const LocationPill: React.FC<{ cityName: string; onPress: () => void }> = ({
  cityName,
  onPress,
}) => (
  <Pressable style={styles.locationPill} onPress={onPress}>
    <Ionicons name="location" size={14} color={colors.orange} />
    <Text style={styles.locationText}>{cityName}</Text>
    <Text style={styles.locationChange}>Change</Text>
  </Pressable>
);

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function ConnectScreen() {
  const router = useRouter();
  const [showPostSheet, setShowPostSheet] = useState(false);

  // Check-in state
  const {
    currentCheckIn,
    gpsSuggestion,
    gpsLoading,
    detectCity,
    checkIn,
    restoring,
  } = useCheckIn();

  // Extract trip cities for check-in prompt
  const { trips } = useTrips();

  const tripCities = useMemo(() => {
    const allTrips = [
      ...(trips.current ? [trips.current] : []),
      ...trips.upcoming,
    ];
    const seen = new Set<string>();
    const cities: Array<{
      cityId: string;
      cityName: string;
      countryName: string | null;
    }> = [];

    for (const trip of allTrips) {
      for (const stop of trip.stops) {
        if (stop.cityId && stop.cityName && !seen.has(stop.cityId)) {
          seen.add(stop.cityId);
          cities.push({
            cityId: stop.cityId,
            cityName: stop.cityName,
            countryName: null,
          });
        }
      }
    }

    return cities;
  }, [trips]);

  // Detect GPS on mount if not checked in
  useEffect(() => {
    if (!currentCheckIn && !restoring) {
      detectCity();
    }
  }, [currentCheckIn, restoring, detectCity]);

  // Feed data (only fetched when checked in)
  const { items, isLoading, refresh } = useConnectFeed(
    currentCheckIn?.cityId ?? null,
  );

  // Render feed items
  const renderItem = useCallback(
    ({ item }: { item: ConnectFeedItem }) => {
      switch (item.type) {
        case 'activity':
          return (
            <View style={styles.activityCardWrapper}>
              <ActivityCard
                post={item.data}
                onPress={() =>
                  router.push(
                    `/(tabs)/travelers/together/${item.data.id}` as any,
                  )
                }
                onAuthorPress={() =>
                  router.push(
                    `/(tabs)/travelers/user/${item.data.userId}` as any,
                  )
                }
              />
            </View>
          );
        case 'people_row':
          return (
            <PeopleRow
              title={`Women in ${currentCheckIn?.cityName ?? 'this city'} right now`}
              travelers={item.data}
              onTravelerPress={(id) =>
                router.push(`/(tabs)/travelers/user/${id}` as any)
              }
            />
          );
        default:
          return null;
      }
    },
    [currentCheckIn, router],
  );

  // ---------------------------------------------------------------------------
  // Loading saved check-in
  // ---------------------------------------------------------------------------
  if (restoring) {
    return (
      <AppScreen>
        <NavigationHeader title="Connect" showLogo />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.orange} />
        </View>
      </AppScreen>
    );
  }

  // ---------------------------------------------------------------------------
  // Not checked in — show prompt
  // ---------------------------------------------------------------------------
  if (!currentCheckIn) {
    return (
      <AppScreen>
        <NavigationHeader title="Connect" showLogo />
        <CheckInPrompt
          gpsSuggestion={gpsSuggestion}
          gpsLoading={gpsLoading}
          tripCities={tripCities}
          onCheckIn={async (cityId, cityName, countryName) => {
            await checkIn(cityId, cityName, countryName);
          }}
        />
      </AppScreen>
    );
  }

  // ---------------------------------------------------------------------------
  // Checked in — show feed
  // ---------------------------------------------------------------------------
  return (
    <AppScreen>
      <NavigationHeader title="Connect" showLogo />

      <LocationPill
        cityName={currentCheckIn.cityName}
        onPress={() => {
          // CityPicker integration is Task 11
        }}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.orange} />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.feedContent}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refresh}
              tintColor={colors.orange}
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No activity yet in {currentCheckIn.cityName}. Be the first to
                post something.
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { bottom: FLOATING_TAB_BAR_HEIGHT + spacing.lg },
          pressed && styles.fabPressed,
        ]}
        onPress={() => setShowPostSheet(true)}
      >
        <Ionicons name="add" size={28} color={colors.background} />
      </Pressable>

      {/* Quick post sheet */}
      <QuickPostSheet
        visible={showPostSheet}
        onClose={() => setShowPostSheet(false)}
        defaultCityId={currentCheckIn.cityId}
        defaultCityName={currentCheckIn.cityName}
        onPostCreated={() => {
          setShowPostSheet(false);
          refresh();
        }}
      />
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Location pill
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.sm,
  },
  locationText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  locationChange: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.orange,
  },

  // Feed
  feedContent: {
    paddingTop: spacing.sm,
    paddingBottom: FLOATING_TAB_BAR_HEIGHT + spacing.xxl,
    gap: spacing.md,
  },
  activityCardWrapper: {
    paddingHorizontal: spacing.screenX,
  },

  // Empty state (simple placeholder — Task 12 will enhance)
  emptyContainer: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: spacing.screenX,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
});
