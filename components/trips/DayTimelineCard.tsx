import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { ItineraryBlockWithTags } from '@/data/trips/itineraryTypes';

interface DayTimelineCardProps {
  block: ItineraryBlockWithTags;
  onPress: () => void;
  onLongPress?: () => void;
  isDone?: boolean;
  isCurrent?: boolean;
}

const THUMB_SIZE = 60;

function formatTimeSlot(time: string | null): string | null {
  if (!time) return null;
  const parts = time.split(':');
  const h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return m === '00' ? `${h12} ${ampm}` : `${h12}:${m} ${ampm}`;
}

function formatCost(cost: number | null): string | null {
  if (cost == null || cost === 0) return null;
  return `~$${Math.round(cost)}`;
}

export const DayTimelineCard: React.FC<DayTimelineCardProps> = ({
  block,
  onPress,
  onLongPress,
  isDone = false,
  isCurrent = false,
}) => {
  const title = block.titleOverride ?? block.place?.name ?? 'Stop';
  const photoUrl = block.place?.imageUrlCached ?? null;
  const placeType = block.place?.placeType ?? block.blockType;
  const address = block.place?.address ?? null;

  const timeStr = formatTimeSlot(block.startTime);
  const costStr = formatCost(block.costEstimate);

  // Build meta parts: "9 AM . ~$15"
  const metaParts: string[] = [];
  if (timeStr) metaParts.push(timeStr);
  if (costStr) metaParts.push(costStr);
  const metaText = metaParts.join(' \u00B7 ');

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={({ pressed }) => [
        styles.card,
        isCurrent && styles.cardCurrent,
        isDone && styles.cardDone,
        pressed && styles.pressed,
      ]}
    >
      {/* Thumbnail */}
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={styles.thumb}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]}>
          <Ionicons name="location-outline" size={20} color={colors.textMuted} />
        </View>
      )}

      {/* Body */}
      <View style={styles.body}>
        {/* Name row */}
        <View style={styles.nameRow}>
          <Text
            style={[styles.name, isDone && styles.nameDone]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {isDone && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.greenSoft}
              style={styles.checkIcon}
            />
          )}
        </View>

        {/* Type pill */}
        <Text style={styles.typePill} numberOfLines={1}>
          {placeType}
        </Text>

        {/* Address */}
        {address && (
          <Text style={styles.address} numberOfLines={1}>
            {address}
          </Text>
        )}

        {/* Meta row */}
        {metaText.length > 0 && (
          <Text style={styles.meta} numberOfLines={1}>
            {metaText}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
    padding: spacing.md,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  cardCurrent: {
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,
  },
  cardDone: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  // Thumbnail
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.sm,
  },
  thumbPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Body
  body: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  nameDone: {
    textDecorationLine: 'line-through',
  },
  checkIcon: {
    marginLeft: spacing.xs,
  },
  typePill: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  address: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
