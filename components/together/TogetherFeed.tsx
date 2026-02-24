/**
 * TogetherFeed — the main Together activity feed with Feed / My Posts toggle.
 *
 * "Feed" shows other travelers' open posts (with filter pills).
 * "My Posts" shows the current user's own posts (no filters, no FAB).
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  fonts,
  spacing,
  radius,
  pressedState,
  typography,
} from '@/constants/design';
import { TogetherCard } from './TogetherCard';
import { TogetherFilterPills } from './TogetherFilterPills';
import { TogetherEmptyState } from './TogetherEmptyState';
import { useTogetherFeed } from '@/data/together/useTogetherFeed';
import { useMyTogetherPosts } from '@/data/together/useTogetherPost';
import { FLOATING_TAB_BAR_HEIGHT } from '@/components/TabBar';
import type { TogetherPostWithAuthor, ActivityCategory } from '@/data/together/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FeedTab = 'feed' | 'my_posts';

// ---------------------------------------------------------------------------
// Segmented Toggle
// ---------------------------------------------------------------------------

interface SegmentedToggleProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
}

const SegmentedToggle: React.FC<SegmentedToggleProps> = ({
  activeTab,
  onTabChange,
}) => (
  <View style={toggleStyles.container}>
    <Pressable
      style={[
        toggleStyles.segment,
        activeTab === 'feed' && toggleStyles.segmentActive,
      ]}
      onPress={() => onTabChange('feed')}
    >
      <Text
        style={[
          toggleStyles.segmentText,
          activeTab === 'feed' && toggleStyles.segmentTextActive,
        ]}
      >
        Feed
      </Text>
    </Pressable>
    <Pressable
      style={[
        toggleStyles.segment,
        activeTab === 'my_posts' && toggleStyles.segmentActive,
      ]}
      onPress={() => onTabChange('my_posts')}
    >
      <Text
        style={[
          toggleStyles.segmentText,
          activeTab === 'my_posts' && toggleStyles.segmentTextActive,
        ]}
      >
        My Posts
      </Text>
    </Pressable>
  </View>
);

const toggleStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    padding: spacing.xs,
    marginHorizontal: spacing.screenX,
    marginBottom: spacing.md,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
  },
  segmentActive: {
    backgroundColor: colors.background,
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
});

// ---------------------------------------------------------------------------
// FAB
// ---------------------------------------------------------------------------

const FAB_SIZE = 56;

interface FabProps {
  onPress: () => void;
  bottomInset: number;
}

const CreatePostFAB: React.FC<FabProps> = ({ onPress, bottomInset }) => (
  <Pressable
    style={[
      fabStyles.fab,
      { bottom: bottomInset + FLOATING_TAB_BAR_HEIGHT + spacing.md, right: spacing.screenX },
    ]}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel="Create activity post"
  >
    <Ionicons name="add" size={24} color="#FFFFFF" />
  </Pressable>
);

const fabStyles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
});

// ---------------------------------------------------------------------------
// My Posts Empty State
// ---------------------------------------------------------------------------

interface MyPostsEmptyProps {
  onCreatePost: () => void;
}

const MyPostsEmpty: React.FC<MyPostsEmptyProps> = ({ onCreatePost }) => (
  <View style={emptyStyles.container}>
    <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
    <Text style={emptyStyles.headline}>
      You haven't posted any activities yet
    </Text>
    <Text style={emptyStyles.subline}>
      Post an activity to find companions for your plans
    </Text>
    <Pressable
      style={({ pressed }) => [
        emptyStyles.cta,
        pressed && emptyStyles.ctaPressed,
      ]}
      onPress={onCreatePost}
    >
      <Text style={emptyStyles.ctaText}>Post an activity</Text>
    </Pressable>
  </View>
);

const emptyStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.xxxxl,
    gap: spacing.md,
  },
  headline: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  subline: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 300,
  },
  cta: {
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    marginTop: spacing.lg,
  },
  ctaPressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform as unknown as { scale: number }[],
  },
  ctaText: {
    ...typography.button,
    color: colors.background,
  },
});

// ---------------------------------------------------------------------------
// TogetherFeed (main export)
// ---------------------------------------------------------------------------

export const TogetherFeed: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<FeedTab>('feed');

  // Feed data
  const feed = useTogetherFeed();

  // My posts data
  const myPosts = useMyTogetherPosts();

  // Filter state (only for feed tab)
  const [selectedCategory, setSelectedCategory] = useState<
    ActivityCategory | undefined
  >(undefined);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    'today' | 'this_week' | 'flexible' | 'all' | undefined
  >(undefined);

  const handleCategoryChange = useCallback(
    (cat: ActivityCategory | undefined) => {
      setSelectedCategory(cat);
      feed.setFilters({ category: cat });
    },
    [feed],
  );

  const handleTimeframeChange = useCallback(
    (tf: 'today' | 'this_week' | 'flexible' | 'all' | undefined) => {
      setSelectedTimeframe(tf);
      feed.setFilters({ timeframe: tf });
    },
    [feed],
  );

  const handleCreatePost = useCallback(() => {
    router.push('/travelers/together/new' as any);
  }, [router]);

  const handlePostPress = useCallback(
    (postId: string) => {
      router.push(`/travelers/together/${postId}` as any);
    },
    [router],
  );

  // Which data source to use
  const isFeedTab = activeTab === 'feed';
  const posts = isFeedTab ? feed.posts : myPosts.posts;
  const loading = isFeedTab ? feed.loading : myPosts.loading;
  const refreshing = isFeedTab ? feed.refreshing : false;

  const handleRefresh = useCallback(() => {
    if (isFeedTab) {
      feed.refresh();
    } else {
      myPosts.refetch();
    }
  }, [isFeedTab, feed, myPosts]);

  const renderItem = useCallback(
    ({ item }: { item: TogetherPostWithAuthor }) => (
      <View style={styles.cardWrapper}>
        <TogetherCard post={item} onPress={() => handlePostPress(item.id)} />
      </View>
    ),
    [handlePostPress],
  );

  const keyExtractor = useCallback(
    (item: TogetherPostWithAuthor) => item.id,
    [],
  );

  // Header component includes the toggle + optional filter pills
  const ListHeader = useCallback(
    () => (
      <View>
        <SegmentedToggle activeTab={activeTab} onTabChange={setActiveTab} />
        {isFeedTab && (
          <TogetherFilterPills
            selectedCategory={selectedCategory}
            selectedTimeframe={selectedTimeframe}
            onCategoryChange={handleCategoryChange}
            onTimeframeChange={handleTimeframeChange}
          />
        )}
        <View style={styles.listHeaderSpacer} />
      </View>
    ),
    [
      activeTab,
      isFeedTab,
      selectedCategory,
      selectedTimeframe,
      handleCategoryChange,
      handleTimeframeChange,
    ],
  );

  // Empty component
  const ListEmpty = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.orange} />
        </View>
      );
    }
    if (isFeedTab) {
      return <TogetherEmptyState onCreatePost={handleCreatePost} />;
    }
    return <MyPostsEmpty onCreatePost={handleCreatePost} />;
  }, [loading, isFeedTab, handleCreatePost]);

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + FLOATING_TAB_BAR_HEIGHT + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={isFeedTab ? feed.loadMore : undefined}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.orange}
          />
        }
      />

      {/* FAB — only on Feed tab */}
      {isFeedTab && (
        <CreatePostFAB onPress={handleCreatePost} bottomInset={insets.bottom} />
      )}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: spacing.md,
  },
  cardWrapper: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.md,
  },
  listHeaderSpacer: {
    height: spacing.sm,
  },
  loadingContainer: {
    paddingVertical: spacing.xxxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
