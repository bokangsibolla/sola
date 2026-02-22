import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';
import type { SavedPlacePreview } from '@/data/home/types';

interface SavedPreviewProps {
  places: SavedPlacePreview[];
}

export function SavedPreview({ places }: SavedPreviewProps) {
  const router = useRouter();

  const count = places.length;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={() => router.push('/home/saved')}
      accessibilityRole="button"
      accessibilityLabel="View saved places"
    >
      <View style={styles.left}>
        <View style={styles.titleRow}>
          <SolaText style={styles.title}>Saved places</SolaText>
          <Feather name="chevron-right" size={16} color={colors.textSecondary} />
        </View>
        <SolaText style={styles.subtitle}>
          {count > 0
            ? `${count} ${count === 1 ? 'place' : 'places'} on your shortlist`
            : 'Bookmark places as you explore'}
        </SolaText>
      </View>

      {count > 0 && (
        <View style={styles.thumbStack}>
          {places.slice(0, 3).map((place, i) => (
            <View
              key={place.placeId}
              style={[
                styles.thumb,
                { marginLeft: i > 0 ? -10 : 0, zIndex: 3 - i },
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
      )}
    </Pressable>
  );
}

const THUMB_SIZE = 40;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.screenX,
    marginBottom: spacing.xl,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },
  left: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
    marginTop: 2,
  },
  thumbStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.neutralFill,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.borderDefault,
  },
  thumbPlaceholder: {
    backgroundColor: colors.borderDefault,
  },
});
