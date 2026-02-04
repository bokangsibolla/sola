// components/explore/ExploreFeed.tsx
import { useCallback } from 'react';
import { FlatList, StyleSheet, View, ActivityIndicator, Text, RefreshControl } from 'react-native';
import { colors, fonts, spacing } from '@/constants/design';
import { FeedItem } from './FeedItem';
import { useFeedItems } from '@/data/explore';
import type { FeedItem as FeedItemType } from '@/data/explore/types';

export function ExploreFeed() {
  const { feedItems, isLoading, error, refresh } = useFeedItems();

  const renderItem = useCallback(({ item }: { item: FeedItemType }) => {
    return (
      <View style={styles.itemContainer}>
        <FeedItem item={item} />
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: FeedItemType, index: number) => {
    switch (item.type) {
      case 'editorial-collection':
        return `editorial-${item.data.id}`;
      case 'country-pair':
        return `country-pair-${item.data[0].id}-${item.data[1].id}`;
      case 'city-spotlight':
        return `city-${item.data.id}`;
      case 'activity-cluster':
        return `activities-${item.citySlug}-${index}`;
      case 'end-card':
        return 'end-card';
      default:
        return `item-${index}`;
    }
  }, []);

  if (isLoading && feedItems.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Something went wrong</Text>
        <Text style={styles.errorSubtext}>{error.message}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={feedItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refresh}
          tintColor={colors.orange}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxxl,
  },
  itemContainer: {
    marginBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  errorSubtext: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
