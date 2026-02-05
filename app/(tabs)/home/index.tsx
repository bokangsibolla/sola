import { useCallback, useEffect, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import { useQueryClient } from '@tanstack/react-query';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import TravelerCard from '@/components/TravelerCard';
import LocationConsentBanner from '@/components/travelers/LocationConsentBanner';
import PendingConnectionsBanner from '@/components/travelers/PendingConnectionsBanner';
import SectionHeader from '@/components/travelers/SectionHeader';
import { useTravelersFeed } from '@/data/travelers/useTravelersFeed';
import { getConnectionContext, getSharedInterests } from '@/data/travelers/connectionContext';
import { sendConnectionRequest, getConnectionStatus } from '@/data/api';
import { useLocationConsent } from '@/hooks/useLocationConsent';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import { colors, fonts, spacing, typography } from '@/constants/design';
import type { Profile, ConnectionStatus } from '@/data/types';

export default function HomeScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const posthog = usePostHog();
  const queryClient = useQueryClient();
  const [locationDismissed, setLocationDismissed] = useState(false);

  const {
    nearby,
    sharedInterests,
    suggested,
    pendingReceived,
    userProfile,
    isLoading,
    error,
    refetch,
  } = useTravelersFeed();

  const { locationGranted, loading: locationLoading, requestLocation } = useLocationConsent(userId);
  const showLocationBanner =
    !locationDismissed && !locationGranted && !userProfile?.locationSharingEnabled;

  useEffect(() => {
    posthog.capture('home_screen_viewed');
  }, [posthog]);

  // Build sections, only include non-empty ones
  const sections: { key: string; title: string; subtitle?: string; data: Profile[] }[] = [];
  if (nearby.length > 0) {
    sections.push({
      key: 'nearby',
      title: 'Travelers near you',
      subtitle: userProfile?.locationCityName
        ? `Women in ${userProfile.locationCityName}`
        : 'Women exploring nearby',
      data: nearby,
    });
  }
  if (sharedInterests.length > 0) {
    sections.push({
      key: 'interests',
      title: 'Shared interests',
      subtitle: 'Women who enjoy similar things',
      data: sharedInterests,
    });
  }
  if (suggested.length > 0) {
    sections.push({
      key: 'suggested',
      title: 'Suggested for you',
      subtitle: 'Discover more travelers',
      data: suggested,
    });
  }

  const handleLocationEnable = useCallback(async () => {
    const result = await requestLocation();
    if (result) {
      posthog.capture('location_enabled', { city: result.cityName });
      queryClient.invalidateQueries({ queryKey: ['travelers'] });
    }
  }, [requestLocation, posthog, queryClient]);

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;

  return (
    <AppScreen>
      <AppHeader
        title=""
        leftComponent={
          <Image
            source={require('@/assets/images/sola-logo.png')}
            style={styles.headerLogo}
            contentFit="contain"
          />
        }
        rightComponent={
          <Pressable
            onPress={() => {
              posthog.capture('inbox_opened');
              router.push('/home/dm');
            }}
            hitSlop={12}
            style={styles.headerAction}
            accessibilityRole="button"
            accessibilityLabel="Messages"
          >
            <Image
              source={require('@/assets/images/icons/icon-inbox.png')}
              style={styles.headerIcon}
              contentFit="contain"
              tintColor={colors.orange}
            />
          </Pressable>
        }
      />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.feed}
        ListHeaderComponent={
          <>
            {showLocationBanner && (
              <LocationConsentBanner
                onEnable={handleLocationEnable}
                onDismiss={() => setLocationDismissed(true)}
                loading={locationLoading}
              />
            )}
            <PendingConnectionsBanner
              count={pendingReceived.length}
              onPress={() => router.push('/home/connections')}
            />
          </>
        }
        renderSectionHeader={({ section }) => (
          <SectionHeader title={section.title} subtitle={section.subtitle} />
        )}
        renderItem={({ item }) => (
          <TravelerCardWrapper
            profile={item}
            userProfile={userProfile}
            onRefresh={refetch}
          />
        )}
        SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="users" size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No travelers nearby yet</Text>
            <Text style={styles.emptySubtitle}>
              Enable location sharing to find women in your area, or check back soon
            </Text>
          </View>
        }
      />
    </AppScreen>
  );
}

function TravelerCardWrapper({
  profile,
  userProfile,
  onRefresh,
}: {
  profile: Profile;
  userProfile: Profile | null;
  onRefresh: () => void;
}) {
  const router = useRouter();
  const posthog = usePostHog();
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const [localStatus, setLocalStatus] = useState<ConnectionStatus | null>(null);

  const { data: fetchedStatus } = useData(
    () => (userId ? getConnectionStatus(userId, profile.id) : Promise.resolve('none' as ConnectionStatus)),
    [userId, profile.id],
  );

  const status = localStatus ?? fetchedStatus ?? 'none';
  const shared = userProfile ? getSharedInterests(userProfile, profile) : [];
  const contextLabel = userProfile ? getConnectionContext(userProfile, profile) : undefined;

  const handleConnect = useCallback(async () => {
    if (!userId) return;
    posthog.capture('connection_request_sent', { recipient_id: profile.id });
    setLocalStatus('pending_sent');
    try {
      await sendConnectionRequest(userId, profile.id, contextLabel);
      queryClient.invalidateQueries({ queryKey: ['travelers'] });
    } catch {
      setLocalStatus(null); // Revert on failure
    }
  }, [userId, profile.id, contextLabel, posthog, queryClient]);

  return (
    <TravelerCard
      profile={profile}
      connectionStatus={status}
      sharedInterests={shared}
      contextLabel={contextLabel}
      onPress={() => {
        posthog.capture('traveler_profile_tapped', { profile_id: profile.id });
        router.push(`/home/user/${profile.id}`);
      }}
      onConnect={handleConnect}
    />
  );
}

const styles = StyleSheet.create({
  headerLogo: {
    height: 22,
    width: 76,
  },
  headerAction: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 22,
    height: 22,
  },
  feed: {
    paddingBottom: spacing.xxl,
  },
  sectionSeparator: {
    height: spacing.sm,
  },
  itemSeparator: {
    height: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    gap: spacing.md,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
