import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getCollectionById,
  getCollectionPlaces,
  getPlaceFirstImage,
  getPlaceTags,
  getCategory,
  toggleSavePlace,
  isPlaceSaved,
} from '@/data/api';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const collection = getCollectionById(id ?? '');

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

  const places = getCollectionPlaces(collection.id, 'me');

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
          {places.length} {places.length === 1 ? 'place' : 'places'}
        </Text>

        {places.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No places in this collection yet.</Text>
          </View>
        ) : (
          places.map((place) => {
            const imageUrl = getPlaceFirstImage(place.id);
            const tags = getPlaceTags(place.id);
            const category = place.primaryCategoryId ? getCategory(place.primaryCategoryId) : null;
            const saved = isPlaceSaved('me', place.id);

            return (
              <Pressable
                key={place.id}
                style={styles.placeCard}
                onPress={() => router.push(`/explore/place-detail/${place.id}`)}
              >
                {imageUrl && (
                  <Image source={{ uri: imageUrl }} style={styles.placeImage} />
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
                        toggleSavePlace('me', place.id, collection.id);
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
                  {tags.length > 0 && (
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
          })
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
    borderRadius: 10,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
  },
});
