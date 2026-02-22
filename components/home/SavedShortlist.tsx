import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';
import type { SavedPlacePreview } from '@/data/home/types';

interface SavedShortlistProps {
  places: SavedPlacePreview[];
  totalCount?: number;
}

const THUMB_SIZE = 32;
const OVERLAP = 8;

export function SavedShortlist({ places, totalCount }: SavedShortlistProps) {
  const router = useRouter();

  if (places.length === 0) return null;

  const visiblePlaces = places.slice(0, 4);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.strip,
        pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
      ]}
      onPress={() => router.push('/home/saved')}
      accessibilityRole="button"
      accessibilityLabel="View saved places"
    >
      <View style={styles.thumbStack}>
        {visiblePlaces.map((place, index) => (
          <View
            key={place.placeId}
            style={[
              styles.thumbWrap,
              { marginLeft: index === 0 ? 0 : -OVERLAP, zIndex: visiblePlaces.length - index },
            ]}
          >
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
      </View>
      <SolaText style={styles.label}>
        {totalCount != null
          ? `${totalCount} saved ${totalCount === 1 ? 'place' : 'places'}`
          : 'Saved places waiting'}
      </SolaText>
      <Feather name="chevron-right" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.xxl,
    gap: spacing.md,
  },
  thumbStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbWrap: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.background,
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
  label: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
});
