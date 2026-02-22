import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { Router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { usePostHog } from 'posthog-react-native';
import { colors, fonts, spacing, radius, typography } from '@/constants/design';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import AvatarButton from '@/components/AvatarButton';
import ErrorScreen from '@/components/ErrorScreen';
import { useCommunityFeed } from '@/data/community/useCommunityFeed';
import { useCommunityOnboarding } from '@/data/community/useCommunityOnboarding';
import { castVote, getCommunityTopics } from '@/data/community/communityApi';
import { getCommunityLastVisit, setCommunityLastVisit } from '@/data/community/lastVisit';
import { useAuth } from '@/state/AuthContext';
import { useAppMode } from '@/state/AppModeContext';
import { useData } from '@/hooks/useData';
import { getCountriesList, getProfileById } from '@/data/api';
import { getImageUrl } from '@/lib/image';
import { formatTimeAgo } from '@/utils/timeAgo';
import { getFlag } from '@/data/trips/helpers';
import type { ThreadWithAuthor, CommunityTopic } from '@/data/community/types';

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
  const isSeed = thread.authorType === 'seed';
  const authorName = isSystem
    ? 'Sola Team'
    : isSeed && thread.seedProfile
      ? thread.seedProfile.displayName
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
  ) : isSeed ? (
    <View style={[styles.avatar, styles.avatarFallback]}>
      <Text style={styles.avatarFallbackText}>
        {authorName.charAt(0).toUpperCase()}
      </Text>
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
            {isSystem ? (
              <View style={styles.authorPressable}>
                {avatarContent}
                <Text style={styles.authorName}>{authorName}</Text>
                <View style={styles.teamBadge}>
                  <Text style={styles.teamBadgeText}>TEAM</Text>
                </View>
              </View>
            ) : isSeed ? (
              <View style={styles.authorPressable}>
                {avatarContent}
                <Text style={styles.authorName}>{authorName}</Text>
              </View>
            ) : (
              <Pressable
                onPress={() => router.push(`/travelers/user/${thread.author.id}` as any)}
                style={styles.authorPressable}
              >
                {avatarContent}
                <Text style={styles.authorName}>{authorName}</Text>
                {thread.author.homeCountryIso2 && (
                  <Text style={styles.authorFlag}>{getFlag(thread.author.homeCountryIso2)}</Text>
                )}
              </Pressable>
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
// Sort config
// ---------------------------------------------------------------------------

type SortKey = 'relevant' | 'new' | 'top';
const SORT_CYCLE: SortKey[] = ['relevant', 'new', 'top'];
const SORT_META: Record<SortKey, { icon: string; label: string }> = {
  relevant: { icon: 'sliders', label: 'Relevant' },
  new: { icon: 'clock', label: 'New' },
  top: { icon: 'trending-up', label: 'Top' },
};

// ---------------------------------------------------------------------------
// FilterBar — collapsed bar with expandable filter panel
// ---------------------------------------------------------------------------

function FilterBar({
  topics,
  activeTopicId,
  onTopicSelect,
  countries,
  activeCountryId,
  onCountrySelect,
  sort,
  onSortCycle,
  isSearchExpanded,
  searchText,
  onSearchTextChange,
  onSearchSubmit,
  onSearchOpen,
  onSearchClose,
  filterCount,
}: {
  topics: CommunityTopic[];
  activeTopicId: string | undefined;
  onTopicSelect: (id: string | undefined) => void;
  countries: { id: string; iso2: string; name: string }[];
  activeCountryId: string | undefined;
  onCountrySelect: (id: string | undefined) => void;
  sort: SortKey;
  onSortCycle: () => void;
  isSearchExpanded: boolean;
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onSearchSubmit: () => void;
  onSearchOpen: () => void;
  onSearchClose: () => void;
  filterCount: number;
}) {
  const [expanded, setExpanded] = useState(false);

  // Search expanded state replaces the entire bar
  if (isSearchExpanded) {
    return (
      <View style={styles.filterSearchRow}>
        <Feather name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.filterSearchInput}
          placeholder="Search discussions..."
          placeholderTextColor={colors.textMuted}
          value={searchText}
          onChangeText={onSearchTextChange}
          onSubmitEditing={onSearchSubmit}
          returnKeyType="search"
          autoFocus
        />
        <Pressable onPress={onSearchClose} hitSlop={8}>
          <Feather name="x" size={16} color={colors.textMuted} />
        </Pressable>
      </View>
    );
  }

  const sortMeta = SORT_META[sort];
  const sortActive = sort !== 'relevant';
  const hasFilters = filterCount > 0;

  return (
    <View style={styles.filterBarContainer}>
      {/* Collapsed bar: Search | Filters | Sort */}
      <View style={styles.filterBar}>
        <Pressable onPress={onSearchOpen} style={styles.chip}>
          <Feather name="search" size={14} color={colors.textSecondary} />
          <Text style={styles.chipText}>Search</Text>
        </Pressable>

        <Pressable
          onPress={() => setExpanded((v) => !v)}
          style={[styles.chip, hasFilters && styles.chipActive]}
        >
          <Feather
            name={expanded ? 'chevron-up' : 'sliders'}
            size={14}
            color={hasFilters ? colors.orange : colors.textSecondary}
          />
          <Text style={[styles.chipText, hasFilters && styles.chipTextActive]}>
            Filters{hasFilters ? ` (${filterCount})` : ''}
          </Text>
        </Pressable>

        <Pressable
          onPress={onSortCycle}
          style={[styles.chip, sortActive && styles.chipActive]}
        >
          <Feather
            name={sortMeta.icon as any}
            size={14}
            color={sortActive ? colors.orange : colors.textSecondary}
          />
          <Text style={[styles.chipText, sortActive && styles.chipTextActive]}>
            {sortMeta.label}
          </Text>
        </Pressable>
      </View>

      {/* Expanded panel: Topic + Country rows */}
      {expanded && (
        <View style={styles.filterPanel}>
          {/* Topic chips */}
          <View style={styles.filterPanelSection}>
            <Text style={styles.filterPanelLabel}>TOPIC</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterPanelChips}
            >
              <Pressable
                onPress={() => onTopicSelect(undefined)}
                style={[styles.chipSm, !activeTopicId && styles.chipActive]}
              >
                <Text style={[styles.chipText, !activeTopicId && styles.chipTextActive]}>All</Text>
              </Pressable>
              {topics.map((topic) => {
                const active = topic.id === activeTopicId;
                return (
                  <Pressable
                    key={topic.id}
                    onPress={() => onTopicSelect(active ? undefined : topic.id)}
                    style={[styles.chipSm, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {topic.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Country chips */}
          {countries.length > 0 && (
            <View style={styles.filterPanelSection}>
              <Text style={styles.filterPanelLabel}>DESTINATION</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterPanelChips}
              >
                <Pressable
                  onPress={() => onCountrySelect(undefined)}
                  style={[styles.chipSm, !activeCountryId && styles.chipActive]}
                >
                  <Text style={[styles.chipText, !activeCountryId && styles.chipTextActive]}>
                    All
                  </Text>
                </Pressable>
                {countries.map((country) => {
                  const active = country.id === activeCountryId;
                  return (
                    <Pressable
                      key={country.id}
                      onPress={() => onCountrySelect(active ? undefined : country.id)}
                      style={[styles.chipSm, active && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {getFlag(country.iso2)} {country.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// FilterSummaryLabel — dynamic section label + clear button
// ---------------------------------------------------------------------------

function FilterSummaryLabel({
  filters,
  topics,
  countries,
  travellingCityName,
  onClear,
}: {
  filters: { topicId?: string; countryId?: string; searchQuery?: string };
  topics: CommunityTopic[];
  countries: { id: string; iso2: string; name: string }[];
  travellingCityName: string | undefined;
  onClear: () => void;
}) {
  const isFiltered = !!(filters.topicId || filters.countryId || filters.searchQuery);

  let label: string;
  if (filters.searchQuery) {
    label = `RESULTS FOR \u201C${filters.searchQuery}\u201D`;
  } else if (filters.topicId && filters.countryId) {
    const topicLabel = topics.find((t) => t.id === filters.topicId)?.label?.toUpperCase() ?? '';
    const countryName = countries.find((c) => c.id === filters.countryId)?.name?.toUpperCase() ?? '';
    label = `${topicLabel} IN ${countryName}`;
  } else if (filters.countryId) {
    const countryName = countries.find((c) => c.id === filters.countryId)?.name?.toUpperCase() ?? '';
    label = `IN ${countryName}`;
  } else if (filters.topicId) {
    label = topics.find((t) => t.id === filters.topicId)?.label?.toUpperCase() ?? '';
  } else if (travellingCityName) {
    label = `${travellingCityName.toUpperCase()} & MORE`;
  } else {
    label = 'RECENT DISCUSSIONS';
  }

  return (
    <View style={styles.sectionLabelRow}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {isFiltered && (
        <Pressable onPress={onClear} hitSlop={8}>
          <Text style={styles.clearButton}>Clear</Text>
        </Pressable>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Compose Card — Reddit-style compose bar with user avatar
// ---------------------------------------------------------------------------

function ComposeCard({
  avatarUrl,
  firstName,
  onPress,
}: {
  avatarUrl: string | null;
  firstName: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.composeCard, pressed && styles.composeCardPressed]}
    >
      {avatarUrl ? (
        <Image
          source={{ uri: getImageUrl(avatarUrl, { width: 56, height: 56 }) ?? undefined }}
          style={styles.composeAvatar}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.composeAvatar, styles.composeAvatarFallback]}>
          <Text style={styles.composeAvatarText}>
            {firstName ? firstName.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
      )}
      <Text style={styles.composeText}>What would you like to ask?</Text>
      <View style={styles.composePostButton}>
        <Text style={styles.composePostText}>Post</Text>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function DiscussionsScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const posthog = usePostHog();
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

  // User profile for compose card avatar
  const { data: userProfile } = useData(
    () => (userId ? getProfileById(userId) : Promise.resolve(null)),
    ['profile', userId],
  );

  // Topics + countries for filter rows
  const [topics, setTopics] = useState<CommunityTopic[]>([]);
  const [countries, setCountries] = useState<{ id: string; iso2: string; name: string }[]>([]);

  useEffect(() => {
    getCommunityTopics().then(setTopics).catch(() => {});
    getCountriesList().then(setCountries).catch(() => {});
  }, []);

  useEffect(() => {
    posthog.capture('discussions_screen_viewed');
  }, [posthog]);

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
    if (!searchText.trim()) setIsSearching(false);
  }, [searchText, setFilters]);

  const handleSortCycle = useCallback(() => {
    const currentIndex = SORT_CYCLE.indexOf(filters.sort ?? 'relevant');
    const nextSort = SORT_CYCLE[(currentIndex + 1) % SORT_CYCLE.length];
    setFilters({ sort: nextSort });
  }, [filters.sort, setFilters]);

  const handleClearFilters = useCallback(() => {
    setSearchText('');
    setIsSearching(false);
    setFilters({ topicId: undefined, countryId: undefined, searchQuery: undefined, sort: 'relevant' });
  }, [setFilters]);

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
            onPress={() => router.push(`/(tabs)/discussions/thread/${item.id}`)}
            onVote={handleVote}
            router={router}
          />
        </View>
      );
    },
    [router, handleVote, lastVisitTimestamp],
  );

  const isFiltered = !!(filters.topicId || filters.searchQuery || filters.countryId);

  const travellingCityName =
    mode === 'travelling' && activeTripInfo ? activeTripInfo.city.name : undefined;

  const ListHeader = (
    <View>
      {/* 1. Reddit-style compose card */}
      <ComposeCard
        avatarUrl={userProfile?.avatarUrl ?? null}
        firstName={userProfile?.firstName ?? ''}
        onPress={() => router.push('/(tabs)/discussions/new')}
      />

      {/* 2. FilterBar — collapsed bar with expandable panel */}
      <FilterBar
        topics={topics}
        activeTopicId={filters.topicId}
        onTopicSelect={(id) => setFilters({ topicId: id })}
        countries={countries}
        activeCountryId={filters.countryId}
        onCountrySelect={(id) => setFilters({ countryId: id })}
        sort={(filters.sort ?? 'relevant') as SortKey}
        onSortCycle={handleSortCycle}
        isSearchExpanded={isSearching}
        searchText={searchText}
        onSearchTextChange={setSearchText}
        onSearchSubmit={handleSearch}
        onSearchOpen={() => setIsSearching(true)}
        onSearchClose={() => {
          setIsSearching(false);
          setSearchText('');
          setFilters({ searchQuery: undefined });
        }}
        filterCount={
          (filters.topicId ? 1 : 0) + (filters.countryId ? 1 : 0)
        }
      />

      {/* 4. Section label — filter-aware */}
      <FilterSummaryLabel
        filters={filters}
        topics={topics}
        countries={countries}
        travellingCityName={travellingCityName}
        onClear={handleClearFilters}
      />

      {/* 5. First-time intro banner */}
      {showIntroBanner && <IntroBanner onDismiss={dismissIntro} />}

      {/* 6. Featured hero card — only when no filters active */}
      {featuredThread && !isFiltered && (
        <FeaturedHeroCard
          thread={featuredThread}
          onPress={() => router.push(`/(tabs)/discussions/thread/${featuredThread.id}`)}
        />
      )}
    </View>
  );

  return (
    <AppScreen>
      <NavigationHeader
        title="Discussions"
        rightActions={<AvatarButton />}
      />

      <FlatList
        data={displayThreads}
        keyExtractor={(item) => item.id}
        renderItem={renderThread}
        ListHeaderComponent={ListHeader}
        ItemSeparatorComponent={() => <View style={styles.threadSeparator} />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={styles.loader} color={colors.orange} />
          ) : feedError ? (
            <ErrorScreen message="Could not load threads" onRetry={refresh} />
          ) : isFiltered ? (
            <View style={styles.emptyState}>
              <Feather name="search" size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No discussions found</Text>
              <Text style={styles.emptyText}>Try different filters or ask the first question</Text>
              <Pressable onPress={() => router.push('/(tabs)/discussions/new')}>
                <Text style={styles.emptyAction}>Ask a question</Text>
              </Pressable>
            </View>
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
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HERO_HEIGHT = 200;
const THUMBNAIL_SIZE = 56;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // ---------------------------------------------------------------------------
  // Layout
  // ---------------------------------------------------------------------------
  feedContent: {
    paddingBottom: spacing.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  loader: {
    marginTop: 60,
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
  // FilterBar — collapsed bar + expandable panel
  // ---------------------------------------------------------------------------
  filterBarContainer: {
    marginBottom: spacing.sm,
  },
  filterBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  chipSm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  chipActive: {
    backgroundColor: colors.orangeFill,
    borderColor: colors.orange,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.orange,
  },
  filterPanel: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  filterPanelSection: {
    gap: spacing.sm,
  },
  filterPanelLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  filterPanelChips: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  filterSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    height: 44,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterSearchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },

  // ---------------------------------------------------------------------------
  // Section Label + Clear
  // ---------------------------------------------------------------------------
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  clearButton: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },

  // ---------------------------------------------------------------------------
  // Thread Separator
  // ---------------------------------------------------------------------------
  threadSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
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
  authorFlag: {
    fontSize: 12,
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
  // Compose Card (Reddit-style)
  // ---------------------------------------------------------------------------
  composeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    gap: spacing.sm,
  },
  composeCardPressed: {
    opacity: 0.7,
  },
  composeAvatar: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.neutralFill,
  },
  composeAvatarFallback: {
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composeAvatarText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.orange,
  },
  composeText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
  composePostButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.orange,
    borderRadius: radius.full,
  },
  composePostText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#FFFFFF',
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
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
  emptyAction: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.orange,
    marginTop: spacing.sm,
  },
});
