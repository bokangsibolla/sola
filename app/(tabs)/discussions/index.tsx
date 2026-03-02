import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { usePostHog } from 'posthog-react-native';
import { colors, fonts, spacing, radius } from '@/constants/design';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import { HamburgerButton } from '@/components/home/HamburgerButton';
import ErrorScreen from '@/components/ErrorScreen';
import FilterSheet from '@/components/community/FilterSheet';
import { useCommunityFeed } from '@/data/community/useCommunityFeed';
import { useCommunityOnboarding } from '@/data/community/useCommunityOnboarding';
import { castVote, getCommunityTopics } from '@/data/community/communityApi';
import { getCommunityLastVisit, setCommunityLastVisit } from '@/data/community/lastVisit';
import { useAuth } from '@/state/AuthContext';
import { useAppMode } from '@/state/AppModeContext';
import { useData } from '@/hooks/useData';
import { getProfileById } from '@/data/api';
import { getImageUrl } from '@/lib/image';
import { formatTimeAgo } from '@/utils/timeAgo';
import { markFeatureSeen } from '@/data/home/useNewUserFeed';
import type { ThreadWithAuthor, CommunityTopic } from '@/data/community/types';

// ---------------------------------------------------------------------------
// Sort types
// ---------------------------------------------------------------------------

type SortKey = 'relevant' | 'new' | 'top';
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'top', label: 'Top' },
  { key: 'relevant', label: 'Relevant' },
];

// ---------------------------------------------------------------------------
// Thread Card — Reddit-clean, text-only with vote column
// ---------------------------------------------------------------------------

function ThreadCard({
  thread,
  onPress,
  onVote,
}: {
  thread: ThreadWithAuthor;
  onPress: () => void;
  onVote: (threadId: string) => void;
}) {
  const voted = thread.userVote === 'up';
  const voteColor = voted ? colors.orange : colors.textMuted;

  const isSystem = thread.authorType === 'system';
  const isSeed = thread.authorType === 'seed';
  const authorName = isSystem
    ? 'Sola Team'
    : isSeed && thread.seedProfile
      ? thread.seedProfile.displayName
      : thread.author.firstName;
  const placeName = thread.cityName ?? thread.countryName;

  // Build meta: "Safety · Colombia · 8 answers"
  const metaParts: string[] = [];
  if (thread.topicLabel) metaParts.push(thread.topicLabel);
  if (placeName) metaParts.push(placeName);
  metaParts.push(`${thread.replyCount} ${thread.replyCount === 1 ? 'answer' : 'answers'}`);
  const meta = metaParts.join(' \u00b7 ');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.threadCard, pressed && styles.pressed]}
    >
      {/* Vote column */}
      <View style={styles.voteColumn}>
        <Pressable onPress={() => onVote(thread.id)} hitSlop={8}>
          <Feather
            name="chevron-up"
            size={18}
            color={voteColor}
          />
        </Pressable>
        <Text style={[styles.voteCount, voted && styles.voteCountActive]}>
          {thread.voteScore}
        </Text>
        <Feather name="chevron-down" size={18} color={colors.textMuted} />
      </View>

      {/* Content column */}
      <View style={styles.threadContent}>
        <Text style={styles.threadTitle} numberOfLines={2}>
          {thread.title}
        </Text>
        <Text style={styles.threadMeta} numberOfLines={1}>
          {meta}
        </Text>
        <View style={styles.threadAuthorRow}>
          {isSystem && (
            <View style={styles.teamBadge}>
              <Text style={styles.teamBadgeText}>TEAM</Text>
            </View>
          )}
          <Text style={styles.threadAuthor}>{authorName}</Text>
          <Text style={styles.threadTime}>{formatTimeAgo(thread.createdAt)}</Text>
        </View>
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
// Compose Bar — clean input-style prompt
// ---------------------------------------------------------------------------

function ComposeBar({
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
      style={({ pressed }) => [styles.composeBar, pressed && styles.composeBarPressed]}
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
// Segmented Sort Control
// ---------------------------------------------------------------------------

function SegmentedSort({
  activeSort,
  onSelect,
}: {
  activeSort: SortKey;
  onSelect: (sort: SortKey) => void;
}) {
  return (
    <View style={styles.segmentedContainer}>
      {SORT_OPTIONS.map((option) => {
        const active = option.key === activeSort;
        return (
          <Pressable
            key={option.key}
            onPress={() => onSelect(option.key)}
            style={[styles.segmentedItem, active && styles.segmentedItemActive]}
          >
            <Text style={[styles.segmentedText, active && styles.segmentedTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Filter Summary Label — shows active filters context
// ---------------------------------------------------------------------------

function FilterSummaryLabel({
  filters,
  topics,
  onClear,
}: {
  filters: { topicId?: string; countryId?: string; searchQuery?: string };
  topics: CommunityTopic[];
  onClear: () => void;
}) {
  const isFiltered = !!(filters.topicId || filters.countryId || filters.searchQuery);
  if (!isFiltered) return null;

  let label: string;
  if (filters.searchQuery) {
    label = `Results for \u201C${filters.searchQuery}\u201D`;
  } else if (filters.topicId) {
    const topicLabel = topics.find((t) => t.id === filters.topicId)?.label ?? '';
    label = topicLabel;
  } else {
    label = 'Filtered';
  }

  return (
    <View style={styles.filterSummaryRow}>
      <Text style={styles.filterSummaryText} numberOfLines={1}>{label}</Text>
      <Pressable onPress={onClear} hitSlop={8}>
        <Text style={styles.filterSummaryClear}>Clear</Text>
      </Pressable>
    </View>
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

  // User profile for compose bar avatar
  const { data: userProfile } = useData(
    () => (userId ? getProfileById(userId) : Promise.resolve(null)),
    ['profile', userId],
  );

  // Topics for filter sheet
  const [topics, setTopics] = useState<CommunityTopic[]>([]);
  useEffect(() => {
    getCommunityTopics().then(setTopics).catch(() => {});
  }, []);

  useEffect(() => {
    posthog.capture('discussions_screen_viewed');
  }, [posthog]);

  useEffect(() => {
    markFeatureSeen('community_visited');
  }, []);

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

  // All threads, boosted by destination in travelling mode
  const displayThreads = useMemo(() => {
    if (mode === 'travelling' && activeTripInfo) {
      const tripCityName = activeTripInfo.city.name.toLowerCase();
      const tripCityId = activeTripInfo.city.id;

      return [...threads].sort((a, b) => {
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

    return threads;
  }, [threads, mode, activeTripInfo]);

  // Search state
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Filter sheet state
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  // Vote handler with optimistic update
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

  const handleClearFilters = useCallback(() => {
    setSearchText('');
    setIsSearching(false);
    setFilters({ topicId: undefined, countryId: undefined, searchQuery: undefined, sort: 'relevant' });
  }, [setFilters]);

  const handleFilterApply = useCallback((applied: { topicId: string | undefined; countryId: string | undefined }) => {
    setFilters({ topicId: applied.topicId, countryId: applied.countryId });
  }, [setFilters]);

  // Reset divider tracking when threads change
  useEffect(() => {
    dividerShownRef.current = false;
  }, [displayThreads]);

  const filterCount = (filters.topicId ? 1 : 0) + (filters.countryId ? 1 : 0);

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
          />
        </View>
      );
    },
    [router, handleVote, lastVisitTimestamp],
  );

  // Header search bar (inline, expands from header)
  const SearchHeader = isSearching ? (
    <View style={styles.searchBar}>
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
        hitSlop={8}
      >
        <Feather name="x" size={16} color={colors.textMuted} />
      </Pressable>
    </View>
  ) : null;

  const isFiltered = !!(filters.topicId || filters.searchQuery || filters.countryId);

  const ListHeader = (
    <View>
      {/* Compose bar */}
      <ComposeBar
        avatarUrl={userProfile?.avatarUrl ?? null}
        firstName={userProfile?.firstName ?? ''}
        onPress={() => router.push('/(tabs)/discussions/new')}
      />

      {/* First-time intro banner */}
      {showIntroBanner && <IntroBanner onDismiss={dismissIntro} />}

      {/* Sort + Filter row */}
      <View style={styles.sortFilterRow}>
        <SegmentedSort
          activeSort={(filters.sort ?? 'relevant') as SortKey}
          onSelect={(sort) => setFilters({ sort })}
        />
        <Pressable
          onPress={() => setFilterSheetVisible(true)}
          style={styles.filterIconButton}
          hitSlop={6}
        >
          <Feather name="sliders" size={18} color={filterCount > 0 ? colors.orange : colors.textSecondary} />
          {filterCount > 0 && <View style={styles.filterDot} />}
        </Pressable>
      </View>

      {/* Filter summary (only when filters active) */}
      <FilterSummaryLabel
        filters={filters}
        topics={topics}
        onClear={handleClearFilters}
      />
    </View>
  );

  // Header right actions: search icon + avatar/hamburger
  const headerRight = (
    <View style={styles.headerRight}>
      <Pressable
        onPress={() => setIsSearching(true)}
        hitSlop={8}
        style={styles.headerIconButton}
      >
        <Feather name="search" size={20} color={colors.textPrimary} />
      </Pressable>
      <HamburgerButton />
    </View>
  );

  return (
    <AppScreen>
      <NavigationHeader
        title="Discussions"
        rightActions={headerRight}
      />

      {/* Inline search bar */}
      {SearchHeader}

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
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptyText}>Be the first to ask a question</Text>
              <Pressable onPress={() => router.push('/(tabs)/discussions/new')}>
                <Text style={styles.emptyAction}>Ask a question</Text>
              </Pressable>
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

      {/* Filter bottom sheet */}
      <FilterSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        topics={topics}
        activeTopicId={filters.topicId}
        activeCountryId={filters.countryId}
        onApply={handleFilterApply}
        onClear={handleClearFilters}
      />
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // Layout
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

  // Header
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Search bar (inline below header)
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.screenX,
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

  // Compose bar
  composeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.input,
    gap: spacing.sm,
  },
  composeBarPressed: {
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.orange,
    borderRadius: radius.full,
  },
  composePostText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },

  // Sort + Filter row
  sortFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  // Segmented sort
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    padding: 3,
  },
  segmentedItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  segmentedItemActive: {
    backgroundColor: colors.orange,
  },
  segmentedText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  segmentedTextActive: {
    color: '#FFFFFF',
  },

  // Filter icon button
  filterIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.orange,
  },

  // Filter summary
  filterSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  filterSummaryText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  filterSummaryClear: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
    marginLeft: spacing.md,
  },

  // Thread separator
  threadSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
    marginHorizontal: spacing.screenX,
  },

  // Thread Card — Reddit-clean
  threadCard: {
    flexDirection: 'row',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  voteColumn: {
    alignItems: 'center',
    width: 36,
    paddingTop: 2,
  },
  voteCount: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textMuted,
    marginVertical: 1,
  },
  voteCountActive: {
    color: colors.orange,
  },
  threadContent: {
    flex: 1,
  },
  threadTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  threadMeta: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  threadAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  threadAuthor: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  threadTime: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
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

  // Intro Banner
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

  // New Activity Divider
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

  // Empty States
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
