import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { TogetherFeed } from '@/components/together/TogetherFeed';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { usePostHog } from 'posthog-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { colors, fonts, spacing, radius } from '@/constants/design';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import { HamburgerButton } from '@/components/home/HamburgerButton';
import ErrorScreen from '@/components/ErrorScreen';
import TravelerCard from '@/components/TravelerCard';
import PendingConnectionsBanner from '@/components/travelers/PendingConnectionsBanner';
import { useTravelersFeedV2 } from '@/data/travelers/useTravelersFeedV2';
import type { TravelerSection } from '@/data/travelers/useTravelersFeedV2';
import { useTravelerSearch } from '@/data/travelers/useTravelerSearch';
import { getConnectionContext, getSharedInterests } from '@/data/travelers/connectionContext';
import { sendConnectionRequest, getConnectionStatus, getUserVisitedCountries } from '@/data/api';
import { getImageUrl } from '@/lib/image';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import { getFlag } from '@/data/trips/helpers';
import { FLOATING_TAB_BAR_HEIGHT } from '@/components/TabBar';
import { markFeatureSeen } from '@/data/home/useNewUserFeed';
import type { Profile, ConnectionStatus } from '@/data/types';

const CARD_WIDTH = 260;

// ---------------------------------------------------------------------------
// Section Context Labels
// ---------------------------------------------------------------------------

function getSectionContextLabel(
  section: TravelerSection,
  profile: Profile,
  userProfile: Profile | null,
): string | undefined {
  switch (section.contextType) {
    case 'near-you':
      if (profile.homeCountryName) {
        return `Visiting from ${profile.homeCountryName}`;
      }
      return undefined;

    case 'same-country-location':
      return profile.locationCityName ? `In ${profile.locationCityName}` : undefined;

    case 'trip-overlap':
      return 'Overlapping dates';

    case 'shared-countries': {
      const names = section.meta?.get(profile.id) ?? [];
      if (names.length === 0) return undefined;
      if (names.length <= 2) return `Also visited ${names.join(', ')}`;
      return `Also visited ${names[0]}, ${names[1]} +${names.length - 2}`;
    }

    case 'home-country':
      return profile.locationCityName ?? profile.currentCityName ?? undefined;

    case 'shared-interests': {
      const shared = (userProfile?.interests ?? []).filter((i) =>
        (profile.interests ?? []).includes(i),
      );
      if (shared.length === 0) return undefined;
      return shared.slice(0, 3).join(', ');
    }

    default:
      return undefined;
  }
}

// ---------------------------------------------------------------------------
// Traveler Card Wrapper — handles connection state
// ---------------------------------------------------------------------------

function TravelerCardWrapper({
  profile,
  userProfile,
  section,
}: {
  profile: Profile;
  userProfile: Profile | null;
  section?: TravelerSection;
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

  const { data: visitedCountries } = useQuery({
    queryKey: ['travelerCard', 'countries', profile.id],
    queryFn: () => getUserVisitedCountries(profile.id),
    staleTime: 5 * 60_000,
  });

  const countryIso2s = (visitedCountries ?? []).map((vc) => vc.countryIso2);

  const status = localStatus ?? fetchedStatus ?? 'none';
  const shared = userProfile ? getSharedInterests(userProfile, profile) : [];
  const contextLabel = section
    ? getSectionContextLabel(section, profile, userProfile)
    : userProfile
      ? getConnectionContext(userProfile, profile)
      : undefined;

  const handleConnect = useCallback(async () => {
    if (!userId) return;
    posthog.capture('connection_request_sent', { recipient_id: profile.id });
    setLocalStatus('pending_sent');
    try {
      await sendConnectionRequest(userId, profile.id, contextLabel);
      queryClient.invalidateQueries({ queryKey: ['travelers'] });
    } catch {
      setLocalStatus(null);
    }
  }, [userId, profile.id, contextLabel, posthog, queryClient]);

  return (
    <View style={styles.cardWrapper}>
      <TravelerCard
        profile={profile}
        connectionStatus={status}
        sharedInterests={shared}
        contextLabel={contextLabel}
        visitedCountryIso2s={countryIso2s}
        onPress={() => {
          posthog.capture('traveler_profile_tapped', { profile_id: profile.id });
          router.push(`/travelers/user/${profile.id}` as any);
        }}
        onConnect={handleConnect}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Horizontal Section — renders a tiered match section
// ---------------------------------------------------------------------------

function HorizontalSection({
  section,
  userProfile,
}: {
  section: TravelerSection;
  userProfile: Profile | null;
}) {
  const renderItem = useCallback(
    ({ item }: { item: Profile }) => (
      <TravelerCardWrapper profile={item} userProfile={userProfile} section={section} />
    ),
    [userProfile, section],
  );

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        {section.subtitle && (
          <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
        )}
      </View>
      <FlatList
        data={section.data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + spacing.md}
        decelerationRate="fast"
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Profile Incomplete State — encourages profile completion
// ---------------------------------------------------------------------------

function ProfileIncompleteState() {
  const router = useRouter();

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIllustration}>
        <Feather name="users" size={48} color={colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>Discover solo women travelers</Text>
      <Text style={styles.emptySubtitle}>
        Complete your profile to get matched with travelers who share your interests and destinations
      </Text>
      <Pressable
        style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
        onPress={() => router.push('/(tabs)/home/profile' as any)}
      >
        <Feather name="edit-3" size={16} color={colors.background} />
        <Text style={styles.ctaButtonText}>Complete profile</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

type ActiveTab = 'travelers' | 'together';

export default function TravelersScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const posthog = usePostHog();
  const [activeTab, setActiveTab] = useState<ActiveTab>('travelers');

  const { query, setQuery, results: searchResults, isSearching, search, clear } =
    useTravelerSearch(userId ?? undefined);
  const hasSearchQuery = query.length > 0;
  const [searchTriggered, setSearchTriggered] = useState(false);

  const {
    sections,
    connectedProfiles,
    pendingReceived,
    userProfile,
    isLoading,
    error,
    refetch,
  } = useTravelersFeedV2();

  useEffect(() => {
    posthog.capture('travelers_screen_viewed');
  }, [posthog]);

  useEffect(() => {
    markFeatureSeen('buddies_seen');
  }, []);

  // Reset search triggered state when query is cleared
  useEffect(() => {
    if (query.length === 0) {
      setSearchTriggered(false);
    }
  }, [query]);

  const handleSearch = useCallback(() => {
    setSearchTriggered(true);
    search();
  }, [search]);

  const handleClearSearch = useCallback(() => {
    clear();
    setSearchTriggered(false);
    Keyboard.dismiss();
  }, [clear]);

  // ─── Segmented Control ──────────────────────────────────────
  const renderSegmentedControl = () => (
    <View style={styles.segmentedContainer}>
      <Pressable
        style={[styles.segment, activeTab === 'travelers' && styles.segmentActive]}
        onPress={() => setActiveTab('travelers')}
      >
        <Text style={[styles.segmentText, activeTab === 'travelers' && styles.segmentTextActive]}>
          Travelers
        </Text>
      </Pressable>
      <Pressable
        style={[styles.segment, activeTab === 'together' && styles.segmentActive]}
        onPress={() => setActiveTab('together')}
      >
        <Text style={[styles.segmentText, activeTab === 'together' && styles.segmentTextActive]}>
          Activities
        </Text>
      </Pressable>
    </View>
  );

  // ─── Together tab ──────────────────────────────────────────
  if (activeTab === 'together') {
    return (
      <AppScreen>
        <NavigationHeader
          title="Travelers"
          rightActions={<HamburgerButton />}
        />
        {renderSegmentedControl()}
        <TogetherFeed />
      </AppScreen>
    );
  }

  // ─── Travelers tab (original) ──────────────────────────────
  if (isLoading) {
    return (
      <AppScreen>
        <NavigationHeader
          title="Travelers"
          rightActions={<HamburgerButton />}
        />
        {renderSegmentedControl()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.orange} />
        </View>
      </AppScreen>
    );
  }

  if (error) {
    return (
      <AppScreen>
        <NavigationHeader
          title="Travelers"
          rightActions={<HamburgerButton />}
        />
        {renderSegmentedControl()}
        <ErrorScreen message="Something went wrong loading travelers. Pull to retry." onRetry={refetch} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <NavigationHeader
        title="Travelers"
        rightActions={<HamburgerButton />}
      />
      {renderSegmentedControl()}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by username..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {hasSearchQuery && (
          <Pressable onPress={handleClearSearch} hitSlop={8}>
            <Feather name="x" size={16} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Search Results */}
      {hasSearchQuery && searchTriggered ? (
        <View style={styles.searchResults}>
          {isSearching && (
            <ActivityIndicator
              size="small"
              color={colors.orange}
              style={styles.searchSpinner}
            />
          )}
          {!isSearching && searchResults.length === 0 && (
            <View style={styles.noResultContainer}>
              <Feather name="user-x" size={28} color={colors.textMuted} />
              <Text style={styles.noResultText}>No user found</Text>
            </View>
          )}
          {!isSearching && searchResults.map((result) => (
            <Pressable
              key={result.id}
              style={styles.searchResultRow}
              onPress={() => {
                posthog.capture('traveler_search_result_tapped', { target_id: result.id });
                router.push(`/travelers/user/${result.id}` as any);
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
                  {getFlag(result.homeCountryIso2)}
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Pending Connections Banner */}
          <PendingConnectionsBanner
            count={pendingReceived.length}
            onPress={() => router.push('/travelers/connections' as any)}
          />

          {/* Discovery sections */}
          {sections.length > 0 ? (
            sections.map((section) => (
              <HorizontalSection
                key={section.key}
                section={section}
                userProfile={userProfile}
              />
            ))
          ) : (
            <ProfileIncompleteState />
          )}
        </ScrollView>
      )}
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // Segmented Control
  segmentedContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.screenX,
    marginBottom: spacing.md,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    padding: 3,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    borderRadius: radius.full,
  },
  segmentActive: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  segmentText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  segmentTextActive: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: FLOATING_TAB_BAR_HEIGHT + spacing.xl,
  },

  // Search
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
    gap: spacing.sm,
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
  searchSpinner: {
    marginTop: spacing.xl,
  },
  noResultContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
    gap: spacing.md,
  },
  noResultText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
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
    marginLeft: spacing.sm,
  },

  // Sections
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  horizontalList: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.md,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },

  // Empty State (no qualifying trip)
  emptyContainer: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  emptyIllustration: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.orange,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.button,
    minHeight: 44,
  },
  ctaButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  ctaButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.background,
  },

});
