// app/(tabs)/discover/all-activities.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NavigationHeader from '@/components/NavigationHeader';
import * as Sentry from '@sentry/react-native';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { getAllActivities, getCityById } from '@/data/api';
import type { Place } from '@/data/types';

interface ActivityRow extends Place {
  cityName: string;
  imageUrl: string | null;
}

export default function AllActivitiesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const allActivities = await getAllActivities(100);
        const cityIds = allActivities.map((a) => a.cityId).filter((v, i, arr) => arr.indexOf(v) === i);
        const cityResults = await Promise.all(
          cityIds.map((id) => getCityById(id))
        );
        const cityMap = new Map(
          cityResults.filter(Boolean).map((c) => [c!.id, c!.name])
        );

        setActivities(
          allActivities.map((activity) => ({
            ...activity,
            cityName: cityMap.get(activity.cityId) ?? '',
            imageUrl: activity.imageUrl ?? null,
          }))
        );
      } catch (err) {
        Sentry.captureException(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return activities;
    const q = search.toLowerCase();
    return activities.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.cityName.toLowerCase().includes(q)
    );
  }, [activities, search]);

  const renderActivity = useCallback(
    ({ item }: { item: ActivityRow }) => (
      <Pressable
        style={styles.listItem}
        onPress={() => router.push(`/discover/activity/${item.slug}`)}
      >
        <View style={styles.listImageContainer}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.listImage}
              contentFit="cover"
              transition={200}
            />
          ) : null}
          {item.highlights && item.highlights.length > 0 && (
            <View style={styles.highlightBadge}>
              <Text style={styles.highlightText} numberOfLines={1}>
                {item.highlights[0]}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.listContent}>
          <Text style={styles.listTitle} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.listSubtitle}>{item.cityName}</Text>
          {item.placeType && (
            <Text style={styles.listType}>
              {item.placeType.charAt(0).toUpperCase() + item.placeType.slice(1)}
            </Text>
          )}
          {item.estimatedDuration && (
            <Text style={styles.listDuration}>{item.estimatedDuration}</Text>
          )}
        </View>
      </Pressable>
    ),
    [router]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <NavigationHeader title="All Activities" parentTitle="Discover" />

      {/* Search */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search activities"
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Feather name="x" size={16} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No activities found</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.screenX,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
  },
  list: {
    padding: spacing.screenX,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  listItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  listImageContainer: {
    width: 100,
    height: 100,
    borderRadius: radius.card,
    backgroundColor: colors.neutralFill,
    overflow: 'hidden',
  },
  listImage: {
    width: 100,
    height: 100,
  },
  highlightBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  highlightText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: '#FFFFFF',
  },
  listContent: {
    flex: 1,
    justifyContent: 'center',
  },
  listTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  listSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listType: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  listDuration: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
});
