import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '@/constants/design';
import type { ItineraryBlockWithTags } from '@/data/trips/itineraryTypes';

// ── Types ────────────────────────────────────────────────────────────────────

interface AccommodationBannerProps {
  blocks: ItineraryBlockWithTags[];
  onPress?: (blockId: string) => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export function AccommodationBanner({ blocks, onPress }: AccommodationBannerProps) {
  return (
    <View style={styles.wrapper}>
      {blocks.map((block) => {
        const place = block.place;
        const name = block.titleOverride ?? place?.name ?? 'Accommodation';
        const address = place?.address ?? null;
        const imageUri = place?.imageUrlCached ?? null;

        return (
          <Pressable
            key={block.id}
            style={styles.card}
            onPress={() => onPress?.(block.id)}
          >
            {/* Left: image */}
            <View style={styles.imageBox}>
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={StyleSheet.absoluteFillObject}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={[StyleSheet.absoluteFillObject, styles.imagePlaceholder]}>
                  <Ionicons name="bed-outline" size={20} color={colors.textMuted} />
                </View>
              )}
            </View>

            {/* Middle: info */}
            <View style={styles.info}>
              <Text style={styles.stayLabel}>STAY</Text>
              <Text style={styles.name} numberOfLines={1}>{name}</Text>
              {address != null && (
                <Text style={styles.address} numberOfLines={1}>{address}</Text>
              )}
            </View>

            {/* Right: icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="bed-outline" size={16} color={colors.orange} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.screenX,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    overflow: 'hidden',
    alignItems: 'center',
  },

  // Image
  imageBox: {
    width: 56,
    height: 56,
    backgroundColor: colors.neutralFill,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutralFill,
  },

  // Info
  info: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  stayLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginTop: 1,
  },
  address: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 1,
  },

  // Icon
  iconContainer: {
    paddingRight: spacing.md,
  },
});
