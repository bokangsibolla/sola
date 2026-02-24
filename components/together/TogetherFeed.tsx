/**
 * Together Feed -- FlatList-based feed for finding activity companions.
 * Renders TogetherCard items with filter pills, pull-to-refresh,
 * infinite scroll, and a floating "create post" FAB.
 */

import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, elevation } from '@/constants/design';
import { FLOATING_TAB_BAR_HEIGHT } from '@/components/TabBar';
import { useTogetherFeed } from '@/data/together/useTogetherFeed';
import { TogetherCard } from '@/components/together/TogetherCard';
import { TogetherFilterPills } from '@/components/together/TogetherFilterPills';
import { TogetherEmptyState } from '@/components/together/TogetherEmptyState';
import type { TogetherPostWithAuthor } from '@/data/together/types';

// ---------------------------------------------------------------------------
// Feed Component
// ---------------------------------------------------------------------------

export const TogetherFeed: React.FC = () => {
  const router = useRouter();
  const {
    posts,
    loading,
    refreshing,
    filters,
    setFilters,
    loadMore,
    refresh,
  } = useTogetherFeed();

  // Refresh data when the tab comes into focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  // -- Render helpers -------------------------------------------------------

  const renderItem = useCallback(
    ({ item }: { item: TogetherPostWithAuthor }) => (
      <View style={styles.cardContainer}>
        <TogetherCard
          post={item}
          onPress={() =>
            router.push(`/travelers/together/${item.id}` as never)
          }
        />
      </View>
    ),
    [router],
  );

  const keyExtractor = useCallback(
    (item: TogetherPostWithAuthor) => item.id,
    [],
  );

  const ListHeader = useCallback(
    () => (
      <View style={styles.filterContainer}>
        <TogetherFilterPills
          selectedCategory={filters.category}
          selectedTimeframe={filters.timeframe}
          onCategoryChange={(cat) => setFilters({ category: cat })}
          onTimeframeChange={(tf) => setFilters({ timeframe: tf })}
        />
      </View>
    ),
    [filters.category, filters.timeframe, setFilters],
  );

  const ListEmpty = useCallback(() => {
    if (loading) return null;
    return (
      <TogetherEmptyState
        onCreatePost={() => router.push('/travelers/together/new' as never)}
      />
    );
  }, [loading, router]);

  // -- Main render ----------------------------------------------------------

  return (
    <View style={styles.root}>
      <FlatList
        data={posts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        refreshing={refreshing}
        onRefresh={refresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Floating Action Button */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push('/travelers/together/new' as never)}
        accessibilityLabel="Create a new Together post"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={28} color={colors.background} />
      </Pressable>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const FAB_SIZE = 56;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  listContent: {
    paddingBottom: FLOATING_TAB_BAR_HEIGHT + spacing.xl,
  },
  filterContainer: {
    paddingVertical: spacing.md,
  },
  cardContainer: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.md,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: FLOATING_TAB_BAR_HEIGHT + spacing.lg,
    right: spacing.screenX,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.md,
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
});
