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
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, spacing, radius } from '@/constants/design';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import InboxButton from '@/components/InboxButton';
import ErrorScreen from '@/components/ErrorScreen';
import { useCommunityFeed } from '@/data/community/useCommunityFeed';
import { useCommunityOnboarding } from '@/data/community/useCommunityOnboarding';
import { searchCommunityCountries, getCitiesForCountry, castVote } from '@/data/community/communityApi';
import { useAuth } from '@/state/AuthContext';
import { useAppMode } from '@/state/AppModeContext';
import { formatTimeAgo } from '@/utils/timeAgo';
import type { ThreadWithAuthor } from '@/data/community/types';

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
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.neutralFill }]} />
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
  const subtitle = subtitleParts.join(' · ');

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
          {/* Author row — who's asking */}
          <View style={styles.authorRow}>
            {!isSystem ? (
              <Pressable
                onPress={() => router.push(`/home/user/${thread.author.id}` as any)}
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

          {/* Title — the star */}
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
// Place Selector Bottom Sheet (preserved from original)
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
              <View style={styles.sheetSearchRow}>
                <Feather name="search" size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.sheetSearchInput}
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
// Helpers
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
  const { mode, activeTripInfo } = useAppMode();
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

  // Featured hero thread: first Sola Team thread with an image
  const featuredThread = useMemo(
    () => threads.find((t) => t.authorType === 'system' && t.cityImageUrl),
    [threads],
  );

  // All remaining threads (excluding the featured one), boosted by destination in travelling mode
  const displayThreads = useMemo(() => {
    const remaining = featuredThread ? threads.filter((t) => t.id !== featuredThread.id) : threads;

    // Travelling mode: boost threads matching current trip destination to top
    if (mode === 'travelling' && activeTripInfo) {
      const tripCityName = activeTripInfo.city.name.toLowerCase();

      return [...remaining].sort((a, b) => {
        const aMatch = (a.cityName?.toLowerCase() === tripCityName) || (a.countryName?.toLowerCase().includes(tripCityName));
        const bMatch = (b.cityName?.toLowerCase() === tripCityName) || (b.countryName?.toLowerCase().includes(tripCityName));
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0; // preserve existing order within groups
      });
    }

    return remaining;
  }, [threads, featuredThread, mode, activeTripInfo]);

  const [showPlaceSelector, setShowPlaceSelector] = useState(false);
  const [placeLabel, setPlaceLabel] = useState('All places');
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // -------------------------------------------------------------------------
  // Vote handler with optimistic update (single upvote toggle)
  // -------------------------------------------------------------------------
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

  const isFiltered = !!(filters.topicId || filters.searchQuery || filters.countryId);

  const ListHeader = (
    <View>
      {/* First-time intro banner */}
      {showIntroBanner && <IntroBanner onDismiss={dismissIntro} />}

      {/* Featured hero card — only when no filters active */}
      {featuredThread && !isFiltered && (
        <FeaturedHeroCard
          thread={featuredThread}
          onPress={() => router.push(`/(tabs)/community/thread/${featuredThread.id}`)}
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
          <Pressable onPress={() => { setIsSearching(false); setSearchText(''); setFilters({ searchQuery: undefined }); }}>
            <Feather name="x" size={16} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={() => setIsSearching(true)} style={styles.searchPill}>
          <Feather name="search" size={16} color={colors.textMuted} />
          <Text style={styles.searchPillText}>Search discussions...</Text>
        </Pressable>
      )}

      {/* Section label */}
      <Text style={styles.sectionLabel}>RECENT DISCUSSIONS</Text>
    </View>
  );

  return (
    <AppScreen>
      <AppHeader
        title="Community"
        rightComponent={<InboxButton />}
      />

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

      {/* FAB — circle icon only */}
      <Pressable
        onPress={() => router.push('/(tabs)/community/new')}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Feather name="edit-3" size={22} color="#FFFFFF" />
      </Pressable>

      {/* Place Selector Sheet (kept for programmatic use) */}
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

const HERO_HEIGHT = 200;
const THUMBNAIL_SIZE = 56;

const styles = StyleSheet.create({
  feedContent: { paddingHorizontal: spacing.screenX, paddingBottom: 100 },
  loader: { marginTop: 60 },
  emptyState: { alignItems: 'center' as const, paddingTop: 80, gap: spacing.md },
  emptyText: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },

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
  // Search Pill
  // ---------------------------------------------------------------------------
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    height: 44,
    gap: spacing.sm,
    marginBottom: spacing.xl,
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
    marginBottom: spacing.xl,
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

  // Author row
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

  // Title
  threadTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
    lineHeight: 23,
    marginBottom: spacing.xs,
  },

  // Subtitle (topic · place)
  threadSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },

  // Destination thumbnail
  threadThumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: radius.sm,
    backgroundColor: colors.neutralFill,
  },

  // Footer
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

  // ---------------------------------------------------------------------------
  // FAB — circle icon
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
  fabPressed: { opacity: 0.92, transform: [{ scale: 0.95 }] },

  // ---------------------------------------------------------------------------
  // Bottom Sheet (shared)
  // ---------------------------------------------------------------------------
  sheetOverlay: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.xl,
    borderTopRightRadius: spacing.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.screenX,
  },
  sheetHandle: { width: 36, height: 4, borderRadius: radius.xs, backgroundColor: colors.borderDefault, alignSelf: 'center', marginBottom: spacing.xl },
  sheetTitle: { fontFamily: fonts.semiBold, fontSize: 20, color: colors.textPrimary, marginBottom: spacing.lg },

  // Place selector sheet
  placeSelectorSheet: { maxHeight: '70%' },
  sheetSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    height: 44,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sheetSearchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
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
