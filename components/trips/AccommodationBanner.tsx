import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SolaText } from '@/components/ui/SolaText';
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
              <SolaText variant="pillLabel" color={colors.textMuted} uppercase letterSpacing={0.5}>STAY</SolaText>
              <SolaText style={styles.name} numberOfLines={1}>{name}</SolaText>
              {address != null && (
                <SolaText style={styles.address} numberOfLines={1}>{address}</SolaText>
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
