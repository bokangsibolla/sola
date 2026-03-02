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
import { CityPicker } from '@/components/connect/CityPicker';
import { CheckInPrompt } from '@/components/connect/CheckInPrompt';
import { CityChangeBanner } from '@/components/connect/CityChangeBanner';
import { ConnectEmptyState } from '@/components/connect/ConnectEmptyState';
import { useCheckIn } from '@/hooks/useCheckIn';
import { useConnectFeed } from '@/data/connect/useConnectFeed';
import type { ConnectFeedItem } from '@/data/connect/useConnectFeed';
import { useTrips } from '@/data/trips/useTrips';
import { FLOATING_TAB_BAR_HEIGHT } from '@/components/TabBar';
import { HamburgerButton } from '@/components/home/HamburgerButton';

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
// Compose Prompt (inline sub-component)
// ---------------------------------------------------------------------------

const ComposePrompt: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <Pressable
    style={({ pressed }) => [
      styles.composeCard,
      pressed && styles.composeCardPressed,
    ]}
    onPress={onPress}
  >
    <View style={styles.composeAvatarPlaceholder}>
      <Ionicons name="person" size={16} color={colors.textMuted} />
    </View>
    <Text style={styles.composeText}>What are you up to?</Text>
    <View style={styles.composeAction}>
      <Text style={styles.composeActionText}>Post</Text>
    </View>
  </Pressable>
);

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function ConnectScreen() {
  const router = useRouter();
  const [showPostSheet, setShowPostSheet] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Check-in state
  const {
    currentCheckIn,
    gpsSuggestion,
    gpsLoading,
    detectCity,
    checkIn,
    checkOut,
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

  // Detect GPS on mount (whether checked in or not, so we can suggest changes)
  useEffect(() => {
    if (!restoring) {
      detectCity();
    }
  }, [restoring, detectCity]);

  // Reset banner dismissed state when the check-in city changes
  useEffect(() => {
    setBannerDismissed(false);
  }, [currentCheckIn?.cityId]);

  // Determine whether to show the city change banner
  const showCityBanner =
    gpsSuggestion &&
    currentCheckIn &&
    gpsSuggestion.cityName.toLowerCase() !== currentCheckIn.cityName.toLowerCase() &&
    !bannerDismissed;

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
        <NavigationHeader title="Connect" rightActions={<HamburgerButton />} />
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
        <NavigationHeader title="Connect" rightActions={<HamburgerButton />} />
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
      <NavigationHeader
        title={currentCheckIn.cityName}
        parentTitle="Connect"
        onBack={async () => {
          await checkOut();
        }}
        rightActions={<HamburgerButton />}
      />

      <LocationPill
        cityName={currentCheckIn.cityName}
        onPress={() => setShowCityPicker(true)}
      />

      {showCityBanner && (
        <CityChangeBanner
          suggestedCity={gpsSuggestion!.cityName}
          onUpdate={() => {
            setShowCityPicker(true);
            setBannerDismissed(true);
          }}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

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
          ListHeaderComponent={
            <ComposePrompt onPress={() => setShowPostSheet(true)} />
          }
          ListEmptyComponent={
            <ConnectEmptyState
              cityName={currentCheckIn.cityName}
              onPost={() => setShowPostSheet(true)}
            />
          }
        />
      )}

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

      {/* City picker */}
      <CityPicker
        visible={showCityPicker}
        onClose={() => setShowCityPicker(false)}
        currentCityName={currentCheckIn.cityName}
        tripCities={tripCities}
        onCitySelect={async (cityId, cityName, countryName) => {
          await checkIn(cityId, cityName, countryName);
          setShowCityPicker(false);
        }}
        onCheckOut={async () => {
          await checkOut();
          setShowCityPicker(false);
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

  // Compose prompt
  composeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.screenX,
    marginBottom: spacing.sm,
  },
  composeCardPressed: {
    opacity: 0.7,
  },
  composeAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composeText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
  composeAction: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  composeActionText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.orange,
  },
});
