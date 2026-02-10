import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import { useQueryClient } from '@tanstack/react-query';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import InboxButton from '@/components/InboxButton';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import TravelerCard from '@/components/TravelerCard';
import LocationConsentBanner from '@/components/travelers/LocationConsentBanner';
import PendingConnectionsBanner from '@/components/travelers/PendingConnectionsBanner';
import SectionHeader from '@/components/travelers/SectionHeader';
import { useTravelersFeed } from '@/data/travelers/useTravelersFeed';
import { useTravelerSearch } from '@/data/travelers/useTravelerSearch';
import { getImageUrl } from '@/lib/image';
import { getConnectionContext, getSharedInterests } from '@/data/travelers/connectionContext';
import { sendConnectionRequest, getConnectionStatus } from '@/data/api';
import { useLocationConsent } from '@/hooks/useLocationConsent';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import { useAppMode } from '@/state/AppModeContext';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import type { Profile, ConnectionStatus } from '@/data/types';

export default function HomeScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const posthog = usePostHog();
  const queryClient = useQueryClient();
  const { mode } = useAppMode();
  const [locationDismissed, setLocationDismissed] = useState(false);
  const { query, setQuery, results: searchResults, isSearching } = useTravelerSearch(userId ?? undefined);
  const isSearchActive = query.length > 0;

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

  // Build sections with mode-dependent ordering
  const sections: { key: string; title: string; subtitle?: string; data: Profile[] }[] = [];

  if (mode === 'travelling') {
    // Travelling: nearby first (on-the-ground orientation)
    if (nearby.length > 0) {
      sections.push({
        key: 'nearby',
        title: 'Women near you right now',
        subtitle: userProfile?.locationCityName
          ? `In ${userProfile.locationCityName}`
          : 'Exploring nearby',
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
        title: 'More travelers',
        data: suggested,
      });
    }
  } else {
    // Discover: suggested first (browse-oriented)
    if (suggested.length > 0) {
      sections.push({
        key: 'suggested',
        title: 'Suggested for you',
        subtitle: 'Discover more travelers',
        data: suggested,
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
  }

  const handleLocationEnable = useCallback(async () => {
    const result = await requestLocation();
    if (result) {
      posthog.capture('location_enabled', { city: result.cityName });
      queryClient.invalidateQueries({ queryKey: ['travelers'] });
    }
  }, [requestLocation, posthog, queryClient]);

  if (isLoading) return <LoadingScreen />;
  if (error) {
    return <ErrorScreen message="Something went wrong loading travelers. Pull to retry." onRetry={refetch} />;
  }

  return (
    <AppScreen>
      <AppHeader
        title="Travelers"
        rightComponent={<InboxButton />}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search travelers by username..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => { setQuery(''); Keyboard.dismiss(); }} hitSlop={8}>
            <Feather name="x" size={16} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {isSearchActive ? (
        <View style={styles.searchResults}>
          {isSearching && (
            <ActivityIndicator size="small" color={colors.orange} style={{ marginTop: spacing.xl }} />
          )}
          {!isSearching && searchResults.length === 0 && query.length >= 2 && (
            <Text style={styles.emptySearch}>No travelers found for "@{query}"</Text>
          )}
          {searchResults.map((result) => (
            <Pressable
              key={result.id}
              style={styles.searchResultRow}
              onPress={() => {
                posthog.capture('traveler_search_result_tapped', { target_id: result.id });
                router.push(`/home/user/${result.id}`);
              }}
            >
              {result.avatarUrl ? (
                <Image
                  source={{ uri: getImageUrl(result.avatarUrl, { width: 80, height: 80 }) ?? undefined }}
                  style={styles.searchAvatar}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.searchAvatar, styles.searchAvatarPlaceholder]}>
                  <Feather name="user" size={18} color={colors.textMuted} />
                </View>
              )}
              <View style={styles.searchResultText}>
                <Text style={styles.searchResultName}>{result.firstName}</Text>
                <Text style={styles.searchResultUsername}>@{result.username}</Text>
              </View>
              {result.homeCountryIso2 && (
                <Text style={styles.searchResultFlag}>
                  {[...result.homeCountryIso2.toUpperCase()].map((c) =>
                    String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0))
                  ).join('')}
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      ) : (
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
      )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.screenX,
    marginBottom: spacing.md,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: spacing.screenX,
  },
  emptySearch: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  searchAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    marginRight: spacing.md,
  },
  searchAvatarPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultText: {
    flex: 1,
  },
  searchResultName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  searchResultUsername: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 1,
  },
  searchResultFlag: {
    fontSize: 20,
  },
});
