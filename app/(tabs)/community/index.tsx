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
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { Router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { colors, fonts, spacing, radius } from '@/constants/design';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import InboxButton from '@/components/InboxButton';
import ErrorScreen from '@/components/ErrorScreen';
import { useCommunityFeed } from '@/data/community/useCommunityFeed';
import { useCommunityOnboarding } from '@/data/community/useCommunityOnboarding';
import { getCommunityTopics, searchCommunityCountries, getCitiesForCountry, castVote } from '@/data/community/communityApi';
import { useAuth } from '@/state/AuthContext';
import { formatTimeAgo } from '@/utils/timeAgo';
import type { ThreadWithAuthor, CommunityTopic } from '@/data/community/types';

// ---------------------------------------------------------------------------
// Thread Card Component (inline — keep it close to the feed)
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
  const authorName = isSystem ? 'Sola Team' : thread.author.firstName;
  const placeName = thread.cityName ?? thread.countryName;

  const avatarContent = thread.author.avatarUrl ? (
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

  const authorElement = (
    <View style={styles.authorRow}>
      {avatarContent}
      <Text style={styles.authorName}>{authorName}</Text>
      <Text style={styles.authorSeparator}>&middot;</Text>
      <Text style={styles.authorTime}>{formatTimeAgo(thread.createdAt)}</Text>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.threadCard, pressed && styles.pressed]}
    >
      {/* Pills row: topic + place */}
      {(thread.topicLabel || placeName) && (
        <View style={styles.pillRow}>
          {thread.topicLabel && (
            <View style={styles.topicPill}>
              <Text style={styles.topicPillText}>{thread.topicLabel}</Text>
            </View>
          )}
          {placeName && (
            <View style={styles.placePill}>
              <Text style={styles.placePillText}>{placeName}</Text>
            </View>
          )}
        </View>
      )}

      {/* Title */}
      <Text style={styles.threadTitle} numberOfLines={2}>
        {thread.title}
      </Text>

      {/* Author row */}
      {!isSystem ? (
        <Pressable
          onPress={() => router.push(`/home/user/${thread.author.id}` as any)}
          style={styles.authorPressable}
        >
          {authorElement}
        </Pressable>
      ) : (
        authorElement
      )}

      {/* Footer: helpful vote + answer count */}
      <View style={styles.threadFooter}>
        <Pressable
          onPress={() => onVote(thread.id)}
          hitSlop={6}
          style={styles.helpfulButton}
        >
          <Feather name="arrow-up" size={16} color={helpfulColor} />
          <Text style={[styles.helpfulText, { color: helpfulColor }]}>
            {thread.voteScore} helpful
          </Text>
        </Pressable>

        <View style={styles.replyStatRow}>
          <Feather name="message-circle" size={14} color={colors.textMuted} />
          <Text style={styles.replyStatText}>
            {thread.replyCount} {thread.replyCount === 1 ? 'answer' : 'answers'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Sort helpers
// ---------------------------------------------------------------------------

const SORT_LABELS: Record<string, string> = {
  relevant: 'Relevant',
  new: 'New',
  top: 'Top',
};
const SORT_CYCLE: Record<string, 'relevant' | 'new' | 'top'> = {
  relevant: 'new',
  new: 'top',
  top: 'relevant',
};

// ---------------------------------------------------------------------------
// Place Selector Bottom Sheet
// ---------------------------------------------------------------------------

function PlaceSelectorSheet({
  visible,
  onClose,
  onSelectPlace,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectPlace: (countryId: string | undefined, cityId: string | undefined, label: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const [countries, setCountries] = useState<{ id: string; name: string; iso2: string }[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<{ id: string; name: string; iso2: string } | null>(null);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = useCallback(async (text: string) => {
    setSearchText(text);
    if (text.trim().length < 2) {
      setCountries([]);
      return;
    }
    setSearching(true);
    try {
      const results = await searchCommunityCountries(text.trim());
      setCountries(results);
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSelectCountry = useCallback(async (country: { id: string; name: string; iso2: string }) => {
    setSelectedCountry(country);
    try {
      const citiesResult = await getCitiesForCountry(country.id);
      setCities(citiesResult);
    } catch {
      setCities([]);
    }
  }, []);

  const handleClearPlace = () => {
    onSelectPlace(undefined, undefined, 'All places');
    setSearchText('');
    setSelectedCountry(null);
    setCities([]);
    onClose();
  };

  const handleSelectCity = (city: { id: string; name: string }) => {
    onSelectPlace(selectedCountry!.id, city.id, `${city.name}, ${selectedCountry!.name}`);
    onClose();
  };

  const handleSelectCountryOnly = () => {
    if (!selectedCountry) return;
    onSelectPlace(selectedCountry.id, undefined, selectedCountry.name);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <View style={[styles.sheetContainer, styles.placeSelectorSheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Where are you going?</Text>

          {!selectedCountry ? (
            <>
              {/* Country search */}
              <View style={styles.searchInputRow}>
                <Feather name="search" size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search country..."
                  placeholderTextColor={colors.textMuted}
                  value={searchText}
                  onChangeText={handleSearch}
                  autoFocus
                />
              </View>

              <ScrollView style={styles.placeResults}>
                <Pressable onPress={handleClearPlace} style={styles.placeRow}>
                  <Feather name="globe" size={18} color={colors.textSecondary} />
                  <Text style={styles.placeRowText}>All places</Text>
                </Pressable>
                {countries.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => handleSelectCountry(c)}
                    style={styles.placeRow}
                  >
                    <Text style={styles.placeRowFlag}>{getFlag(c.iso2)}</Text>
                    <Text style={styles.placeRowText}>{c.name}</Text>
                    <Feather name="chevron-right" size={16} color={colors.textMuted} />
                  </Pressable>
                ))}
              </ScrollView>
            </>
          ) : (
            <>
              {/* City selection for chosen country */}
              <Pressable onPress={() => { setSelectedCountry(null); setCities([]); }} style={styles.backRow}>
                <Feather name="arrow-left" size={18} color={colors.orange} />
                <Text style={styles.backRowText}>{selectedCountry.name}</Text>
              </Pressable>

              <ScrollView style={styles.placeResults}>
                <Pressable onPress={handleSelectCountryOnly} style={styles.placeRow}>
                  <Feather name="map" size={18} color={colors.textSecondary} />
                  <Text style={styles.placeRowText}>All of {selectedCountry.name}</Text>
                </Pressable>
                {cities.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => handleSelectCity(c)}
                    style={styles.placeRow}
                  >
                    <Text style={styles.placeRowText}>{c.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function getFlag(iso2: string): string {
  return String.fromCodePoint(
    ...[...iso2.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
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
// Main Screen
// ---------------------------------------------------------------------------

export default function CommunityHome() {
  const router = useRouter();
  const { userId } = useAuth();
  const { threads: feedThreads, loading, refreshing, error: feedError, hasMore, loadMore, refresh, setFilters, filters } = useCommunityFeed();
  const { showIntroBanner, dismissIntro } = useCommunityOnboarding();

  // Local copy of threads for optimistic vote updates
  const [threads, setThreads] = useState<ThreadWithAuthor[]>([]);
  const prevFeedRef = useRef(feedThreads);

  // Sync local state when the feed hook delivers new data
  useEffect(() => {
    if (feedThreads !== prevFeedRef.current) {
      setThreads(feedThreads);
      prevFeedRef.current = feedThreads;
    }
  }, [feedThreads]);

  // Split threads into curated (Sola Team) and community zones
  const solaTeamThreads = useMemo(() => threads.filter((t) => t.authorType === 'system'), [threads]);
  const communityThreads = useMemo(() => threads.filter((t) => t.authorType !== 'system'), [threads]);

  const [topics, setTopics] = useState<CommunityTopic[]>([]);
  const [showPlaceSelector, setShowPlaceSelector] = useState(false);
  const [placeLabel, setPlaceLabel] = useState('All places');
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Load topics once
  React.useEffect(() => {
    getCommunityTopics().then(setTopics).catch(() => {});
  }, []);

  // -------------------------------------------------------------------------
  // Vote handler with optimistic update (single upvote toggle)
  // -------------------------------------------------------------------------
  const handleVote = useCallback(
    async (threadId: string) => {
      if (!userId) return;

      // Capture previous state for rollback
      const prevThreads = threads;

      // Compute optimistic update
      setThreads((current) =>
        current.map((t) => {
          if (t.id !== threadId) return t;
          let newVote: 'up' | null;
          let scoreDelta: number;

          if (t.userVote === 'up') {
            // Toggle off
            newVote = null;
            scoreDelta = -1;
          } else {
            // Toggle on
            newVote = 'up';
            scoreDelta = 1;
          }

          return { ...t, userVote: newVote, voteScore: t.voteScore + scoreDelta };
        }),
      );

      try {
        await castVote(userId, 'thread', threadId, 'up');
      } catch {
        // Revert on failure
        setThreads(prevThreads);
      }
    },
    [userId, threads],
  );

  const handleSearch = useCallback(() => {
    setFilters({ searchQuery: searchText.trim() || undefined });
    setIsSearching(false);
  }, [searchText, setFilters]);

  const handleSelectPlace = useCallback((countryId: string | undefined, cityId: string | undefined, label: string) => {
    setFilters({ countryId, cityId });
    setPlaceLabel(label);
  }, [setFilters]);

  const renderThread = useCallback(({ item }: { item: ThreadWithAuthor }) => (
    <ThreadCard
      thread={item}
      onPress={() => router.push(`/(tabs)/community/thread/${item.id}`)}
      onVote={handleVote}
      router={router}
    />
  ), [router, handleVote]);

  const ListHeader = (
    <View>
      {/* First-time intro banner */}
      {showIntroBanner && <IntroBanner onDismiss={dismissIntro} />}

      {/* Topic chips — quick filter by category */}
      {topics.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicChipsRow}
        >
          <Pressable
            onPress={() => setFilters({ topicId: undefined })}
            style={[
              styles.topicChip,
              !filters.topicId && styles.topicChipActive,
            ]}
          >
            <Text style={[
              styles.topicChipText,
              !filters.topicId && styles.topicChipTextActive,
            ]}>All</Text>
          </Pressable>
          {topics.map((topic) => (
            <Pressable
              key={topic.id}
              onPress={() => setFilters({ topicId: filters.topicId === topic.id ? undefined : topic.id })}
              style={[
                styles.topicChip,
                filters.topicId === topic.id && styles.topicChipActive,
              ]}
            >
              <Text style={[
                styles.topicChipText,
                filters.topicId === topic.id && styles.topicChipTextActive,
              ]}>{topic.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Search bar */}
      {isSearching ? (
        <View style={styles.searchInputRow}>
          <Feather name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="What do you want to know?"
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          <Pressable onPress={() => { setIsSearching(false); setSearchText(''); setFilters({ searchQuery: undefined }); }}>
            <Feather name="x" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={() => setIsSearching(true)} style={styles.searchBar}>
          <Feather name="search" size={18} color={colors.textMuted} />
          <Text style={styles.searchBarText}>What do you want to know?</Text>
        </Pressable>
      )}

      {/* Filter row */}
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setShowPlaceSelector(true)}
          style={[styles.placeButton, filters.countryId && styles.placeButtonActive]}
        >
          <Feather name="map-pin" size={14} color={filters.countryId ? colors.orange : colors.textMuted} />
          <Text
            style={[styles.placeButtonText, filters.countryId && styles.placeButtonTextActive]}
            numberOfLines={1}
          >
            {placeLabel}
          </Text>
          {filters.countryId ? (
            <Pressable
              onPress={() => handleSelectPlace(undefined, undefined, 'All places')}
              hitSlop={8}
            >
              <Feather name="x" size={14} color={colors.orange} />
            </Pressable>
          ) : (
            <Feather name="chevron-down" size={14} color={colors.textMuted} />
          )}
        </Pressable>

        <Pressable
          onPress={() => setFilters({ sort: SORT_CYCLE[filters.sort] })}
          style={styles.sortButton}
        >
          <Feather name="sliders" size={14} color={colors.textSecondary} />
          <Text style={styles.sortButtonText}>{SORT_LABELS[filters.sort]}</Text>
        </Pressable>
      </View>

      {/* Sola Team threads — curated content zone */}
      {solaTeamThreads.length > 0 && !filters.topicId && !filters.searchQuery && (
        <View style={styles.solaSection}>
          <Text style={styles.solaSectionTitle}>From Sola</Text>
          {solaTeamThreads.slice(0, 3).map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              onPress={() => router.push(`/(tabs)/community/thread/${thread.id}`)}
              onVote={handleVote}
              router={router}
            />
          ))}
          <View style={styles.solaSectionDivider} />
        </View>
      )}
    </View>
  );

  return (
    <AppScreen>
      <AppHeader
        title="Community"
        rightComponent={<InboxButton />}
      />

      {/* Thread Feed — community threads only (Sola Team shown in header) */}
      <FlatList
        data={communityThreads}
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

      {/* FAB — Ask a question */}
      <Pressable
        onPress={() => router.push('/(tabs)/community/new')}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Feather name="edit-3" size={20} color="#FFFFFF" />
        <Text style={styles.fabText}>Ask</Text>
      </Pressable>

      {/* Place Selector Sheet */}
      <PlaceSelectorSheet
        visible={showPlaceSelector}
        onClose={() => setShowPlaceSelector(false)}
        onSelectPlace={handleSelectPlace}
      />
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  feedContent: { paddingHorizontal: spacing.screenX, paddingBottom: 100 },
  loader: { marginTop: 60 },
  emptyState: { alignItems: 'center' as const, paddingTop: 80, gap: spacing.md },
  emptyText: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted },

  // Topic chips
  topicChipsRow: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  topicChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.neutralFill,
  },
  topicChipActive: {
    backgroundColor: colors.orangeFill,
  },
  topicChipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  topicChipTextActive: {
    color: colors.orange,
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    height: 52,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchBarText: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    height: 52,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },

  // Filter row
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  placeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
    gap: 6,
  },
  placeButtonActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  placeButtonText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  placeButtonTextActive: {
    color: colors.orange,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
    gap: 6,
  },
  sortButtonText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Thread card
  threadCard: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    paddingVertical: spacing.lg,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },

  // Pills row (topic + place)
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  topicPill: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  topicPillText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
  },
  placePill: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  placePillText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Title
  threadTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  // Author row
  authorPressable: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.neutralFill,
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
  authorSeparator: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  authorTime: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },

  // Footer: helpful vote + answer count
  threadFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 2,
  },
  helpfulText: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  replyStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyStatText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },

  // Sola Team section
  solaSection: {
    marginBottom: spacing.lg,
  },
  solaSectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: spacing.sm,
  },
  solaSectionDivider: {
    height: 1,
    backgroundColor: colors.borderDefault,
    marginTop: spacing.md,
  },

  // Intro banner
  introBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  introBannerContent: { flex: 1 },
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

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: spacing.screenX,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: radius.full,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  fabPressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  fabText: { fontFamily: fonts.semiBold, fontSize: 15, color: '#FFFFFF' },

  // Bottom sheet (shared)
  sheetOverlay: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.xl,
    borderTopRightRadius: spacing.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.screenX,
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.borderDefault, alignSelf: 'center', marginBottom: spacing.xl },
  sheetTitle: { fontFamily: fonts.semiBold, fontSize: 20, color: colors.textPrimary, marginBottom: spacing.lg },

  // Place selector sheet
  placeSelectorSheet: { maxHeight: '70%' },
  placeResults: { maxHeight: 300 },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    gap: spacing.md,
  },
  placeRowFlag: { fontSize: 18 },
  placeRowText: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.textPrimary },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  backRowText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.orange },
});
