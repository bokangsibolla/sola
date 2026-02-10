import React, { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import {
  getCollectionById,
  getCollectionPlaces,
  getPlaceFirstImage,
  getPlaceTags,
  getCategory,
  toggleSavePlace,
  isPlaceSaved,
} from '@/data/api';
import { useData } from '@/hooks/useData';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { useAuth } from '@/state/AuthContext';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import { Place } from '@/data/types';

function PlaceRow({ place, userId, collectionId }: { place: Place; userId: string; collectionId: string }) {
  const router = useRouter();
  const { data: imageUrl } = useData(() => getPlaceFirstImage(place.id), [place.id]);
  const { data: tags } = useData(() => getPlaceTags(place.id), [place.id]);
  const { data: category } = useData(
    () => place.primaryCategoryId ? getCategory(place.primaryCategoryId) : Promise.resolve(null),
    [place.primaryCategoryId],
  );
  const { data: isSaved } = useData(() => isPlaceSaved(userId, place.id), [userId, place.id]);
  const [saved, setSaved] = useState(isSaved ?? false);

  useEffect(() => {
    if (isSaved !== null && isSaved !== undefined) setSaved(isSaved);
  }, [isSaved]);

  return (
    <Pressable
      style={styles.placeCard}
      onPress={() => router.push(`/explore/place-detail/${place.id}`)}
    >
      {imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.placeImage} contentFit="cover" transition={200} />
      )}
      <View style={styles.placeInfo}>
        <View style={styles.placeHeader}>
          <Text style={styles.placeName} numberOfLines={1}>
            {place.name}
          </Text>
          <Pressable
            hitSlop={8}
            onPress={(e) => {
              e.stopPropagation?.();
              setSaved(!saved);
              toggleSavePlace(userId, place.id, collectionId);
            }}
          >
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={saved ? colors.orange : colors.textMuted}
            />
          </Pressable>
        </View>
        {category && (
          <Text style={styles.placeCategory}>{category.name}</Text>
        )}
        {tags && tags.length > 0 && (
          <View style={styles.tagRow}>
            {tags.slice(0, 3).map((tag) => (
              <View key={tag.id} style={styles.tag}>
                <Text style={styles.tagText}>{tag.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();

  useEffect(() => {
    if (id) {
      posthog.capture('collection_detail_viewed', { collection_id: id });
    }
  }, [id, posthog]);

  const { userId } = useAuth();
  const { data: collection, loading, error, refetch } = useData(() => getCollectionById(id ?? ''), [id]);
  const { data: places } = useData(
    () => collection?.id && userId ? getCollectionPlaces(collection.id, userId) : Promise.resolve([]),
    [collection?.id, userId],
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;

  if (!collection) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
        <Text style={styles.emptyText}>Collection not found</Text>
      </View>
    );
  }
  const placeList = places ?? [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.emoji}>{collection.emoji}</Text>
        <Text style={styles.title}>{collection.name}</Text>
        <Text style={styles.count}>
          {placeList.length} {placeList.length === 1 ? 'place' : 'places'}
        </Text>

        {placeList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No places in this collection yet.</Text>
          </View>
        ) : (
          userId && placeList.map((place) => (
            <PlaceRow key={place.id} place={place} userId={userId} collectionId={collection.id} />
          ))
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  nav: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  count: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  placeCard: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  placeImage: {
    width: '100%',
    height: 160,
    backgroundColor: colors.borderDefault,
  },
  placeInfo: {
    padding: spacing.lg,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  placeCategory: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
  },
});
