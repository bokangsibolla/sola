import React, { useState, useCallback } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { useCommunityFeed } from '@/data/community/useCommunityFeed';
import { getCommunityTopics, searchCommunityCountries, getCitiesForCountry } from '@/data/community/communityApi';
import type { ThreadWithAuthor, CommunityTopic } from '@/data/community/types';

// ---------------------------------------------------------------------------
// Thread Card Component (inline — keep it close to the feed)
// ---------------------------------------------------------------------------

function ThreadCard({ thread, onPress }: { thread: ThreadWithAuthor; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.threadCard, pressed && styles.pressed]}
    >
      {/* Topic + Place badge row */}
      <View style={styles.threadMeta}>
        {thread.topicLabel && (
          <Text style={styles.topicBadge}>{thread.topicLabel}</Text>
        )}
        {(thread.cityName || thread.countryName) && (
          <Text style={styles.placeBadge}>
            {thread.cityName ?? thread.countryName}
          </Text>
        )}
      </View>

      {/* Title */}
      <Text style={styles.threadTitle} numberOfLines={2}>
        {thread.title}
      </Text>

      {/* Body preview */}
      <Text style={styles.threadBody} numberOfLines={2}>
        {thread.body}
      </Text>

      {/* Footer: author + stats */}
      <View style={styles.threadFooter}>
        <Text style={styles.threadAuthor}>
          {thread.author.firstName}
        </Text>
        <View style={styles.threadStats}>
          {thread.replyCount > 0 && (
            <View style={styles.statItem}>
              <Feather name="message-circle" size={13} color={colors.textMuted} />
              <Text style={styles.statText}>{thread.replyCount}</Text>
            </View>
          )}
          {thread.helpfulCount > 0 && (
            <View style={styles.statItem}>
              <Feather name="heart" size={13} color={colors.textMuted} />
              <Text style={styles.statText}>{thread.helpfulCount}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Refine Bottom Sheet
// ---------------------------------------------------------------------------

function RefineSheet({
  visible,
  onClose,
  topics,
  selectedTopicId,
  onSelectTopic,
  sort,
  onSelectSort,
}: {
  visible: boolean;
  onClose: () => void;
  topics: CommunityTopic[];
  selectedTopicId: string | undefined;
  onSelectTopic: (id: string | undefined) => void;
  sort: 'relevant' | 'new' | 'helpful';
  onSelectSort: (sort: 'relevant' | 'new' | 'helpful') => void;
}) {
  const insets = useSafeAreaInsets();
  const sortOptions: { value: 'relevant' | 'new' | 'helpful'; label: string }[] = [
    { value: 'relevant', label: 'Relevant' },
    { value: 'new', label: 'New' },
    { value: 'helpful', label: 'Most helpful' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <View style={[styles.sheetContainer, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Refine</Text>

          {/* Sort */}
          <Text style={styles.sheetSectionLabel}>Sort by</Text>
          <View style={styles.pillRow}>
            {sortOptions.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => onSelectSort(opt.value)}
                style={[styles.pill, sort === opt.value && styles.pillActive]}
              >
                <Text style={[styles.pillText, sort === opt.value && styles.pillTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Topic */}
          <Text style={styles.sheetSectionLabel}>Topic</Text>
          <View style={styles.pillRow}>
            <Pressable
              onPress={() => onSelectTopic(undefined)}
              style={[styles.pill, !selectedTopicId && styles.pillActive]}
            >
              <Text style={[styles.pillText, !selectedTopicId && styles.pillTextActive]}>All</Text>
            </Pressable>
            {topics.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => onSelectTopic(t.id)}
                style={[styles.pill, selectedTopicId === t.id && styles.pillActive]}
              >
                <Text style={[styles.pillText, selectedTopicId === t.id && styles.pillTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={onClose} style={styles.sheetDone}>
            <Text style={styles.sheetDoneText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

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
// Main Screen
// ---------------------------------------------------------------------------

export default function CommunityHome() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { threads, loading, refreshing, hasMore, loadMore, refresh, setFilters, filters } = useCommunityFeed();

  const [topics, setTopics] = useState<CommunityTopic[]>([]);
  const [showRefine, setShowRefine] = useState(false);
  const [showPlaceSelector, setShowPlaceSelector] = useState(false);
  const [placeLabel, setPlaceLabel] = useState('All places');
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Load topics once
  React.useEffect(() => {
    getCommunityTopics().then(setTopics).catch(() => {});
  }, []);

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
    />
  ), [router]);

  const ListHeader = (
    <View>
      {/* Search bar */}
      {isSearching ? (
        <View style={styles.searchInputRow}>
          <Feather name="search" size={18} color={colors.textMuted} />
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
            <Feather name="x" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={() => setIsSearching(true)} style={styles.searchBar}>
          <Feather name="search" size={18} color={colors.textMuted} />
          <Text style={styles.searchBarText}>Search discussions...</Text>
        </Pressable>
      )}

      {/* Place selector + Refine row */}
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setShowPlaceSelector(true)}
          style={({ pressed }) => [styles.placeButton, pressed && styles.pressed]}
        >
          <Feather name="map-pin" size={15} color={colors.orange} />
          <Text style={styles.placeButtonText} numberOfLines={1}>{placeLabel}</Text>
          <Feather name="chevron-down" size={14} color={colors.textMuted} />
        </Pressable>

        <Pressable
          onPress={() => setShowRefine(true)}
          style={({ pressed }) => [styles.refineButton, pressed && styles.pressed]}
        >
          <Feather name="sliders" size={15} color={colors.textSecondary} />
          <Text style={styles.refineButtonText}>Refine</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Text style={styles.screenTitle}>Community</Text>

      {/* Thread Feed */}
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        renderItem={renderThread}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={styles.loader} color={colors.orange} />
          ) : (
            <View style={styles.emptyState}>
              <Feather name="message-circle" size={32} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No discussions yet</Text>
              <Text style={styles.emptySubtitle}>Be the first to ask a question</Text>
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

      {/* Bottom Sheets */}
      <RefineSheet
        visible={showRefine}
        onClose={() => setShowRefine(false)}
        topics={topics}
        selectedTopicId={filters.topicId}
        onSelectTopic={(id) => setFilters({ topicId: id })}
        sort={filters.sort}
        onSelectSort={(s) => setFilters({ sort: s })}
      />

      <PlaceSelectorSheet
        visible={showPlaceSelector}
        onClose={() => setShowPlaceSelector(false)}
        onSelectPlace={handleSelectPlace}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  screenTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 28,
    color: colors.textPrimary,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  feedContent: { paddingHorizontal: spacing.screenX, paddingBottom: 100 },
  loader: { marginTop: 60 },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    height: 44,
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
    height: 44,
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
    backgroundColor: colors.orangeFill,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 6,
  },
  placeButtonText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
  refineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 6,
  },
  refineButtonText: {
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
  threadMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  topicBadge: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.orange,
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  placeBadge: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textSecondary,
    backgroundColor: colors.neutralFill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  threadTitle: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.textPrimary, marginBottom: 4 },
  threadBody: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.sm },
  threadFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  threadAuthor: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },
  threadStats: { flexDirection: 'row', gap: spacing.md },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 80, gap: spacing.sm },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: 18, color: colors.textPrimary },
  emptySubtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },

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
  sheetSectionLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.md },

  // Pills
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  pillActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  pillText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  pillTextActive: { color: colors.orange },

  sheetDone: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
  },
  sheetDoneText: { fontFamily: fonts.semiBold, fontSize: 16, color: '#FFFFFF' },

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
