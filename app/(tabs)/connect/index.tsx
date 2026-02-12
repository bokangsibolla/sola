import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  SectionList,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { Router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { usePostHog } from 'posthog-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { colors, fonts, spacing, radius, typography } from '@/constants/design';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import MenuButton from '@/components/MenuButton';
import ErrorScreen from '@/components/ErrorScreen';
import TravelerCard from '@/components/TravelerCard';
import LocationConsentBanner from '@/components/travelers/LocationConsentBanner';
import PendingConnectionsBanner from '@/components/travelers/PendingConnectionsBanner';
import SectionHeader from '@/components/travelers/SectionHeader';
import { useCommunityFeed } from '@/data/community/useCommunityFeed';
import { useCommunityOnboarding } from '@/data/community/useCommunityOnboarding';
import { castVote } from '@/data/community/communityApi';
import PlaceFilterChips from '@/components/community/PlaceFilterChips';
import { getCommunityLastVisit, setCommunityLastVisit } from '@/data/community/lastVisit';
import { useTravelersFeed } from '@/data/travelers/useTravelersFeed';
import { useTravelerSearch } from '@/data/travelers/useTravelerSearch';
import { getConnectionContext, getSharedInterests } from '@/data/travelers/connectionContext';
import { sendConnectionRequest, getConnectionStatus } from '@/data/api';
import { getImageUrl } from '@/lib/image';
import { useLocationConsent } from '@/hooks/useLocationConsent';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import { useAppMode } from '@/state/AppModeContext';
import { formatTimeAgo } from '@/utils/timeAgo';
import type { ThreadWithAuthor } from '@/data/community/types';
import type { Profile, ConnectionStatus } from '@/data/types';

// ---------------------------------------------------------------------------
// Segment type
// ---------------------------------------------------------------------------

type Segment = 'discussions' | 'travelers';

// ---------------------------------------------------------------------------
// Featured Hero Card — visual header for top Sola Team thread
// ---------------------------------------------------------------------------

function FeaturedHeroCard({
  thread,
  onPress,
}: {
  thread: ThreadWithAuthor;
  onPress: () => void;
}) {
  const placeName = thread.cityName ?? thread.countryName;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.heroCard, pressed && styles.pressed]}
    >
      {thread.cityImageUrl ? (
        <Image
          source={{ uri: thread.cityImageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          pointerEvents="none"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.heroCardPlaceholder]} />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.65)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* "FROM SOLA" type label */}
      <View style={styles.heroTypeLabel}>
        <Text style={styles.heroTypeLabelText}>FROM SOLA</Text>
      </View>

      <View style={styles.heroContent} pointerEvents="none">
        {placeName && (
          <View style={styles.heroPlacePill}>
            <Feather name="map-pin" size={10} color="rgba(255,255,255,0.9)" />
            <Text style={styles.heroPlaceText}>{placeName}</Text>
          </View>
        )}
        <Text style={styles.heroTitle} numberOfLines={2}>
          {thread.title}
        </Text>
        <View style={styles.heroMeta}>
          <Text style={styles.heroMetaText}>
            {thread.replyCount} {thread.replyCount === 1 ? 'answer' : 'answers'}
          </Text>
          <Text style={styles.heroMetaDot}>&middot;</Text>
          <Text style={styles.heroMetaText}>{formatTimeAgo(thread.createdAt)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Thread Card — redesigned with visual warmth
// ---------------------------------------------------------------------------

function ThreadCard({
  thread,
  onPress,
  onVote,
  router,
}: {
  thread: ThreadWithAuthor;
  onPress: () => void;
  onVote: (threadId: string) => void;
  router: Router;
}) {
  const helpfulColor = thread.userVote === 'up' ? colors.orange : colors.textMuted;

  const isSystem = thread.authorType === 'system';
  const authorName = isSystem
    ? 'Sola Team'
    : thread.author.username
      ? `${thread.author.firstName} @${thread.author.username}`
      : thread.author.firstName;
  const placeName = thread.cityName ?? thread.countryName;
  const hasImage = !!thread.cityImageUrl;

  // Build subtitle: "Safety & comfort · Hoi An"
  const subtitleParts: string[] = [];
  if (thread.topicLabel) subtitleParts.push(thread.topicLabel);
  if (placeName) subtitleParts.push(placeName);
  const subtitle = subtitleParts.join(' \u00b7 ');

  const avatarContent = isSystem ? (
    <View style={[styles.avatar, styles.avatarSystem]}>
      <Text style={styles.avatarSystemText}>S</Text>
    </View>
  ) : thread.author.avatarUrl ? (
    <Image
      source={{ uri: thread.author.avatarUrl }}
      style={styles.avatar}
      contentFit="cover"
    />
  ) : (
    <View style={[styles.avatar, styles.avatarFallback]}>
      <Text style={styles.avatarFallbackText}>
        {authorName.charAt(0).toUpperCase()}
      </Text>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.threadCard, pressed && styles.pressed]}
    >
      <View style={styles.threadCardInner}>
        {/* Left content area */}
        <View style={styles.threadCardLeft}>
          {/* Author row */}
          <View style={styles.authorRow}>
            {!isSystem ? (
              <Pressable
                onPress={() => router.push(`/connect/user/${thread.author.id}` as any)}
                style={styles.authorPressable}
              >
                {avatarContent}
                <Text style={styles.authorName}>{authorName}</Text>
              </Pressable>
            ) : (
              <View style={styles.authorPressable}>
                {avatarContent}
                <Text style={styles.authorName}>{authorName}</Text>
                <View style={styles.teamBadge}>
                  <Text style={styles.teamBadgeText}>TEAM</Text>
                </View>
              </View>
            )}
            <Text style={styles.authorTime}>{formatTimeAgo(thread.createdAt)}</Text>
          </View>

          {/* Title */}
          <Text style={styles.threadTitle} numberOfLines={2}>
            {thread.title}
          </Text>

          {/* Subtitle: topic · place */}
          {subtitle.length > 0 && (
            <Text style={styles.threadSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}

          {/* Footer: helpful + answers */}
          <View style={styles.threadFooter}>
            <Pressable
              onPress={() => onVote(thread.id)}
              hitSlop={6}
              style={styles.helpfulButton}
            >
              <Feather name="arrow-up" size={14} color={helpfulColor} />
              <Text style={[styles.footerText, { color: helpfulColor }]}>
                {thread.voteScore} helpful
              </Text>
            </Pressable>

            <View style={styles.replyStatRow}>
              <Feather
                name="message-circle"
                size={13}
                color={thread.replyCount > 0 ? colors.orange : colors.textMuted}
              />
              <Text
                style={[
                  styles.footerText,
                  { color: thread.replyCount > 0 ? colors.orange : colors.textMuted },
                ]}
              >
                {thread.replyCount} {thread.replyCount === 1 ? 'answer' : 'answers'}
              </Text>
            </View>
          </View>
        </View>

        {/* Right: destination thumbnail */}
        {hasImage && (
          <Image
            source={{ uri: thread.cityImageUrl! }}
            style={styles.threadThumbnail}
            contentFit="cover"
            transition={200}
          />
        )}
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Intro Banner — shown only on first Community visit
// ---------------------------------------------------------------------------

function IntroBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <View style={styles.introBanner}>
      <View style={styles.introBannerContent}>
        <Text style={styles.introBannerTitle}>Real questions from women traveling solo.</Text>
        <Text style={styles.introBannerSubtitle}>Ask anything — safety, stays, transport, experiences.</Text>
      </View>
      <Pressable onPress={onDismiss} hitSlop={8} style={styles.introBannerClose}>
        <Feather name="x" size={16} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Traveler Card Wrapper — handles connection state
// ---------------------------------------------------------------------------

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
      setLocalStatus(null);
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
        router.push(`/connect/user/${profile.id}` as any);
      }}
      onConnect={handleConnect}
    />
  );
}

// ---------------------------------------------------------------------------
// Segment Control
// ---------------------------------------------------------------------------

function SegmentControl({
  activeSegment,
  onChangeSegment,
}: {
  activeSegment: Segment;
  onChangeSegment: (segment: Segment) => void;
}) {
  return (
    <View style={styles.segmentContainer}>
      <Pressable
        style={[
          styles.segmentButton,
          activeSegment === 'discussions' && styles.segmentButtonActive,
        ]}
        onPress={() => onChangeSegment('discussions')}
      >
        <Text
          style={[
            styles.segmentText,
            activeSegment === 'discussions' && styles.segmentTextActive,
          ]}
        >
          Discussions
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.segmentButton,
          activeSegment === 'travelers' && styles.segmentButtonActive,
        ]}
        onPress={() => onChangeSegment('travelers')}
      >
        <Text
          style={[
            styles.segmentText,
            activeSegment === 'travelers' && styles.segmentTextActive,
          ]}
        >
          Travelers
        </Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Discussions View
// ---------------------------------------------------------------------------

function DiscussionsView() {
  const router = useRouter();
  const { userId } = useAuth();
  const { mode, activeTripInfo } = useAppMode();
  const {
    threads: feedThreads,
    loading,
    refreshing,
    error: feedError,
    hasMore,
    loadMore,
    refresh,
    setFilters,
    filters,
  } = useCommunityFeed();
  const { showIntroBanner, dismissIntro } = useCommunityOnboarding();

  // Last visit timestamp for "Earlier" divider
  const [lastVisitTimestamp, setLastVisitTimestamp] = useState<string | null>(null);
  const dividerShownRef = useRef(false);

  useEffect(() => {
    getCommunityLastVisit().then((ts) => {
      setLastVisitTimestamp(ts);
      setCommunityLastVisit();
    });
  }, []);

  // Local copy of threads for optimistic vote updates
  const [threads, setThreads] = useState<ThreadWithAuthor[]>([]);
  const prevFeedRef = useRef(feedThreads);

  useEffect(() => {
    if (feedThreads !== prevFeedRef.current) {
      setThreads(feedThreads);
      prevFeedRef.current = feedThreads;
    }
  }, [feedThreads]);

  // Featured hero thread: first Sola Team thread with an image
  const featuredThread = useMemo(
    () => threads.find((t) => t.authorType === 'system' && t.cityImageUrl),
    [threads],
  );

  // All remaining threads (excluding the featured one), boosted by destination in travelling mode
  const displayThreads = useMemo(() => {
    const remaining = featuredThread
      ? threads.filter((t) => t.id !== featuredThread.id)
      : threads;

    if (mode === 'travelling' && activeTripInfo) {
      const tripCityName = activeTripInfo.city.name.toLowerCase();
      const tripCityId = activeTripInfo.city.id;

      return [...remaining].sort((a, b) => {
        const aMatch =
          (tripCityId && a.cityId === tripCityId) ||
          a.cityName?.toLowerCase() === tripCityName;
        const bMatch =
          (tripCityId && b.cityId === tripCityId) ||
          b.cityName?.toLowerCase() === tripCityName;
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    }

    return remaining;
  }, [threads, featuredThread, mode, activeTripInfo]);

  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Vote handler with optimistic update (single upvote toggle)
  const handleVote = useCallback(
    async (threadId: string) => {
      if (!userId) return;

      const prevThreads = threads;

      setThreads((current) =>
        current.map((t) => {
          if (t.id !== threadId) return t;
          let newVote: 'up' | null;
          let scoreDelta: number;

          if (t.userVote === 'up') {
            newVote = null;
            scoreDelta = -1;
          } else {
            newVote = 'up';
            scoreDelta = 1;
          }

          return { ...t, userVote: newVote, voteScore: t.voteScore + scoreDelta };
        }),
      );

      try {
        await castVote(userId, 'thread', threadId, 'up');
      } catch {
        setThreads(prevThreads);
      }
    },
    [userId, threads],
  );

  const handleSearch = useCallback(() => {
    setFilters({ searchQuery: searchText.trim() || undefined });
    setIsSearching(false);
  }, [searchText, setFilters]);

  const handlePlaceFilter = useCallback(
    (countryId: string | undefined, cityId: string | undefined) => {
      setFilters({ countryId, cityId });
    },
    [setFilters],
  );

  // Reset divider tracking when threads change
  useEffect(() => {
    dividerShownRef.current = false;
  }, [displayThreads]);

  const renderThread = useCallback(
    ({ item, index }: { item: ThreadWithAuthor; index: number }) => {
      let showDivider = false;
      if (lastVisitTimestamp && !dividerShownRef.current && index > 0) {
        const isOld = new Date(item.updatedAt) <= new Date(lastVisitTimestamp);
        if (isOld) {
          showDivider = true;
          dividerShownRef.current = true;
        }
      }

      return (
        <View>
          {showDivider && (
            <View style={styles.newActivityDivider}>
              <View style={styles.newActivityLine} />
              <Text style={styles.newActivityText}>Earlier</Text>
              <View style={styles.newActivityLine} />
            </View>
          )}
          <ThreadCard
            thread={item}
            onPress={() => router.push(`/(tabs)/connect/thread/${item.id}`)}
            onVote={handleVote}
            router={router}
          />
        </View>
      );
    },
    [router, handleVote, lastVisitTimestamp],
  );

  const isFiltered = !!(filters.topicId || filters.searchQuery || filters.countryId || filters.cityId);

  const ListHeader = (
    <View>
      {/* First-time intro banner */}
      {showIntroBanner && <IntroBanner onDismiss={dismissIntro} />}

      {/* Featured hero card — only when no filters active */}
      {featuredThread && !isFiltered && (
        <FeaturedHeroCard
          thread={featuredThread}
          onPress={() => router.push(`/(tabs)/connect/thread/${featuredThread.id}`)}
        />
      )}

      {/* Search pill */}
      {isSearching ? (
        <View style={styles.searchInputRow}>
          <Feather name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search discussions..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          <Pressable
            onPress={() => {
              setIsSearching(false);
              setSearchText('');
              setFilters({ searchQuery: undefined });
            }}
          >
            <Feather name="x" size={16} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={() => setIsSearching(true)} style={styles.searchPill}>
          <Feather name="search" size={16} color={colors.textMuted} />
          <Text style={styles.searchPillText}>Search discussions...</Text>
        </Pressable>
      )}

      {/* Place filter chips */}
      <PlaceFilterChips
        selectedCountryId={filters.countryId}
        selectedCityId={filters.cityId}
        onFilterChange={handlePlaceFilter}
      />

      {/* Section label */}
      <Text style={styles.sectionLabel}>
        {mode === 'travelling' && activeTripInfo
          ? `${activeTripInfo.city.name.toUpperCase()} & MORE`
          : 'RECENT DISCUSSIONS'}
      </Text>
    </View>
  );

  return (
    <View style={styles.discussionsContainer}>
      <FlatList
        data={displayThreads}
        keyExtractor={(item) => item.id}
        renderItem={renderThread}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={styles.loader} color={colors.orange} />
          ) : feedError ? (
            <ErrorScreen message="Could not load threads" onRetry={refresh} />
          ) : (
            <View style={styles.emptyState}>
              <Feather name="message-circle" size={40} color={colors.textMuted} />
              <Text style={styles.emptyText}>No conversations yet</Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.orange} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Travelers View
// ---------------------------------------------------------------------------

function TravelersView() {
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
    posthog.capture('travelers_segment_viewed');
  }, [posthog]);

  // Build sections with mode-dependent ordering
  const sections: { key: string; title: string; subtitle?: string; data: Profile[] }[] = [];

  if (mode === 'travelling') {
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

  if (isLoading) {
    return (
      <View style={styles.travelersLoadingContainer}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    );
  }

  if (error) {
    return <ErrorScreen message="Something went wrong loading travelers. Pull to retry." onRetry={refetch} />;
  }

  return (
    <View style={styles.travelersContainer}>
      {/* Search Bar */}
      <View style={styles.travelerSearchContainer}>
        <Feather name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.travelerSearchInput}
          placeholder="Search travelers by username..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => {
              setQuery('');
              Keyboard.dismiss();
            }}
            hitSlop={8}
          >
            <Feather name="x" size={16} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {isSearchActive ? (
        <View style={styles.searchResults}>
          {isSearching && (
            <ActivityIndicator
              size="small"
              color={colors.orange}
              style={styles.searchSpinner}
            />
          )}
          {!isSearching && searchResults.length === 0 && query.length >= 2 && (
            <Text style={styles.emptySearch}>No travelers found for &quot;@{query}&quot;</Text>
          )}
          {searchResults.map((result) => (
            <Pressable
              key={result.id}
              style={styles.searchResultRow}
              onPress={() => {
                posthog.capture('traveler_search_result_tapped', { target_id: result.id });
                router.push(`/connect/user/${result.id}` as any);
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
                  {Array.from(result.homeCountryIso2.toUpperCase()).map((c) =>
                    String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)),
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
          contentContainerStyle={styles.travelerFeed}
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
                onPress={() => router.push('/connect/connections' as any)}
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
            <View style={styles.emptyStateTravelers}>
              <Feather name="users" size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitleTravelers}>No travelers nearby yet</Text>
              <Text style={styles.emptySubtitleTravelers}>
                Enable location sharing to find women in your area, or check back soon
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function ConnectScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const [activeSegment, setActiveSegment] = useState<Segment>('discussions');

  useEffect(() => {
    posthog.capture('connect_screen_viewed');
  }, [posthog]);

  const handleChangeSegment = useCallback(
    (segment: Segment) => {
      setActiveSegment(segment);
      posthog.capture('connect_segment_changed', { segment });
    },
    [posthog],
  );

  return (
    <AppScreen>
      <AppHeader
        title=""
        leftComponent={
          <Image
            source={require('@/assets/images/sola-logo.png')}
            style={{ height: 22, width: 76 }}
            contentFit="contain"
          />
        }
        rightComponent={<MenuButton />}
      />

      <SegmentControl
        activeSegment={activeSegment}
        onChangeSegment={handleChangeSegment}
      />

      {activeSegment === 'discussions' ? <DiscussionsView /> : <TravelersView />}

      {/* FAB — only show when Discussions segment is active */}
      {activeSegment === 'discussions' && (
        <Pressable
          onPress={() => router.push('/(tabs)/connect/new')}
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        >
          <Feather name="edit-3" size={22} color="#FFFFFF" />
        </Pressable>
      )}
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HERO_HEIGHT = 200;
const THUMBNAIL_SIZE = 56;
const SEGMENT_HEIGHT = 36;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // ---------------------------------------------------------------------------
  // Layout
  // ---------------------------------------------------------------------------
  discussionsContainer: {
    flex: 1,
  },
  travelersContainer: {
    flex: 1,
  },
  travelersLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedContent: {
    paddingBottom: 100,
  },
  travelerFeed: {
    paddingBottom: spacing.xxl,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  loader: {
    marginTop: 60,
  },

  // ---------------------------------------------------------------------------
  // Segment Control
  // ---------------------------------------------------------------------------
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    height: SEGMENT_HEIGHT,
    padding: 2,
    marginBottom: spacing.lg,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  segmentButtonActive: {
    backgroundColor: colors.background,
  },
  segmentText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },

  // ---------------------------------------------------------------------------
  // Featured Hero Card
  // ---------------------------------------------------------------------------
  heroCard: {
    height: HERO_HEIGHT,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
    justifyContent: 'flex-end',
    marginBottom: spacing.lg,
  },
  heroCardPlaceholder: {
    backgroundColor: colors.neutralFill,
  },
  heroTypeLabel: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    zIndex: 1,
    backgroundColor: colors.overlaySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  heroTypeLabelText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.8,
  },
  heroContent: {
    padding: spacing.lg,
  },
  heroPlacePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  heroPlaceText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: '#FFFFFF',
    lineHeight: 26,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  heroMetaText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  heroMetaDot: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },

  // ---------------------------------------------------------------------------
  // Search Pill (Discussions)
  // ---------------------------------------------------------------------------
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    height: 44,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchPillText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    height: 44,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },

  // ---------------------------------------------------------------------------
  // Section Label
  // ---------------------------------------------------------------------------
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },

  // ---------------------------------------------------------------------------
  // Thread Card
  // ---------------------------------------------------------------------------
  threadCard: {
    paddingVertical: spacing.lg,
  },
  threadCardInner: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  threadCardLeft: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  authorPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: colors.neutralFill,
  },
  avatarSystem: {
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSystemText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.orangeFill,
  },
  avatarFallbackText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: colors.orange,
  },
  authorName: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  teamBadge: {
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.sm,
  },
  teamBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 9,
    color: colors.orange,
    letterSpacing: 0.5,
  },
  authorTime: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  threadTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
    lineHeight: 23,
    marginBottom: spacing.xs,
  },
  threadSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  threadThumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: radius.sm,
    backgroundColor: colors.neutralFill,
  },
  threadFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 2,
  },
  footerText: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  replyStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // ---------------------------------------------------------------------------
  // Intro Banner
  // ---------------------------------------------------------------------------
  introBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  introBannerContent: {
    flex: 1,
  },
  introBannerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  introBannerSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  introBannerClose: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ---------------------------------------------------------------------------
  // FAB
  // ---------------------------------------------------------------------------
  fab: {
    position: 'absolute',
    bottom: 24,
    right: spacing.screenX,
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  fabPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.95 }],
  },

  // ---------------------------------------------------------------------------
  // New Activity Divider
  // ---------------------------------------------------------------------------
  newActivityDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  newActivityLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderDefault,
  },
  newActivityText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // ---------------------------------------------------------------------------
  // Empty States
  // ---------------------------------------------------------------------------
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: spacing.md,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
  emptyStateTravelers: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    gap: spacing.md,
  },
  emptyTitleTravelers: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitleTravelers: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },

  // ---------------------------------------------------------------------------
  // Traveler Search
  // ---------------------------------------------------------------------------
  travelerSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  travelerSearchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  searchResults: {
    flex: 1,
  },
  searchSpinner: {
    marginTop: spacing.xl,
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

  // ---------------------------------------------------------------------------
  // Section / Item Separators (Travelers)
  // ---------------------------------------------------------------------------
  sectionSeparator: {
    height: spacing.sm,
  },
  itemSeparator: {
    height: spacing.md,
  },
});
