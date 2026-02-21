import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  colors,
  elevation,
  fonts,
  radius,
  spacing,
  pressedState,
} from '@/constants/design';
import type { SavedPlacePreview } from '@/data/home/types';

interface SavedShortlistProps {
  places: SavedPlacePreview[];
}

export function SavedShortlist({ places }: SavedShortlistProps) {
  const router = useRouter();

  if (places.length === 0) return null;

  const totalCount = places.length;
  const visiblePlaces = places.slice(0, 3);
  const overflowCount = totalCount - 3;

  // Count unique cities
  const citySet = new Set<string>();
  places.forEach((p) => {
    if (p.cityName) citySet.add(p.cityName);
  });
  const cityCount = citySet.size;

  const summaryParts: string[] = [];
  summaryParts.push(`${totalCount} ${totalCount === 1 ? 'place' : 'places'}`);
  if (cityCount > 0) {
    summaryParts.push(`${cityCount} ${cityCount === 1 ? 'city' : 'cities'}`);
  }
  const summaryText = summaryParts.join(' \u00B7 ');

  return (
    <Pressable
      style={({ pressed }) => [
        styles.module,
        pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
      ]}
      onPress={() => router.push('/home/saved')}
      accessibilityRole="button"
      accessibilityLabel="View saved places"
    >
      <View style={styles.titleRow}>
        <Text style={styles.title}>Your Shortlist</Text>
        <Feather name="chevron-right" size={18} color={colors.textSecondary} />
      </View>

      <View style={styles.thumbRow}>
        {visiblePlaces.map((place) => (
          <View key={place.placeId} style={styles.thumbWrap}>
            {place.imageUrl ? (
              <Image
                source={{ uri: place.imageUrl }}
                style={styles.thumbImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.thumbImage, styles.thumbPlaceholder]} />
            )}
          </View>
        ))}
        {overflowCount > 0 && (
          <View style={[styles.thumbWrap, styles.overflowThumb]}>
            <Text style={styles.overflowText}>+{overflowCount}</Text>
          </View>
        )}
      </View>

      <Text style={styles.summary}>{summaryText}</Text>
    </Pressable>
  );
}

const THUMB_SIZE = 56;

const styles = StyleSheet.create({
  module: {
    marginHorizontal: spacing.screenX,
    marginBottom: spacing.xl,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.module,
    padding: spacing.moduleInset,
    ...elevation.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  thumbRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  thumbWrap: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.cardLg,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutralFill,
  },
  thumbPlaceholder: {
    backgroundColor: colors.borderDefault,
  },
  overflowThumb: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textSecondary,
  },
  summary: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
