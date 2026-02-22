import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, pressedState, radius, spacing } from '@/constants/design';
import type { ItineraryBlockWithTags } from '@/data/trips/itineraryTypes';

interface TimelineBlockCardProps {
  block: ItineraryBlockWithTags;
  isLast: boolean;
  onPress: () => void;
}

const GUTTER_WIDTH = 48;
const PHOTO_HEIGHT = 140;

const BLOCK_TYPE_LABELS: Record<string, string> = {
  accommodation: 'Stay',
  activity: 'Activity',
  transport: 'Getting there',
  meal: 'Meal',
  free_time: 'Free time',
  note: 'Note',
  safety_check: 'Check-in',
};

/** Friendly label for the place's actual type, used when blockType is generic. */
const PLACE_TYPE_LABELS: Record<string, string> = {
  hotel: 'Hotel',
  hostel: 'Hostel',
  homestay: 'Homestay',
  restaurant: 'Restaurant',
  cafe: 'Cafe',
  bakery: 'Bakery',
  bar: 'Bar',
  club: 'Nightlife',
  rooftop: 'Rooftop bar',
  activity: 'Activity',
  tour: 'Guided tour',
  landmark: 'Landmark',
  coworking: 'Coworking',
  wellness: 'Wellness',
  spa: 'Spa',
  salon: 'Salon',
  gym: 'Fitness',
  shop: 'Shopping',
};

function getBlockLabel(block: ItineraryBlockWithTags): string {
  // Prefer specific block type label
  if (block.blockType !== 'place') {
    return BLOCK_TYPE_LABELS[block.blockType] ?? block.blockType;
  }
  // For generic 'place' blocks, use the actual place type
  if (block.place?.placeType) {
    return PLACE_TYPE_LABELS[block.place.placeType] ?? block.place.placeType;
  }
  return 'Stop';
}

/** Format "HH:MM:SS" → "08:00" */
const formatTime = (time: string): string => time.slice(0, 5);

/** Format "HH:MM:SS" → "8 AM" (short label for gutter) */
const formatTimeShort = (time: string): string => {
  const h = parseInt(time.slice(0, 2), 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12} ${ampm}`;
};

export const TimelineBlockCard: React.FC<TimelineBlockCardProps> = ({
  block,
  isLast,
  onPress,
}) => {
  const title =
    block.titleOverride ?? block.place?.name ?? getBlockLabel(block);
  const photoUrl = block.place?.imageUrlCached ?? null;
  const typeLabel = getBlockLabel(block);

  // Build meta line: "08:00 - 11:00 · 123 Main St"
  const metaParts: string[] = [];
  if (block.startTime) {
    let timeStr = formatTime(block.startTime);
    if (block.endTime) timeStr += ` - ${formatTime(block.endTime)}`;
    metaParts.push(timeStr);
  }
  if (block.place?.address) {
    metaParts.push(block.place.address);
  }
  const metaText = metaParts.join(' \u00B7 ');

  // Description: first tag label or notes
  const descriptionText =
    block.tags.length > 0
      ? block.tags[0].label
      : block.meta?.notes
        ? String(block.meta.notes)
        : null;

  return (
    <View style={styles.row}>
      {/* Left gutter: time label or dot */}
      <View style={styles.gutter}>
        {block.startTime != null ? (
          <SolaText style={styles.timeLabel}>{formatTimeShort(block.startTime)}</SolaText>
        ) : (
          <View style={styles.gutterDot} />
        )}
      </View>

      {/* Dashed line */}
      <View style={styles.lineContainer}>
        <View style={[styles.dashedLine, isLast && styles.dashedLineHidden]} />
      </View>

      {/* Card */}
      <Pressable
        style={({ pressed }) => [styles.card, pressed && pressedState]}
        onPress={onPress}
      >
        {photoUrl != null && (
          <Image
            source={{ uri: photoUrl }}
            style={styles.photo}
            contentFit="cover"
            transition={200}
          />
        )}
        <View style={styles.cardBody}>
          <SolaText variant="pillLabel" color={colors.textMuted} uppercase letterSpacing={0.5} style={styles.typePill}>{typeLabel}</SolaText>
          <SolaText style={styles.title} numberOfLines={2}>
            {title}
          </SolaText>
          {metaText.length > 0 && (
            <SolaText style={styles.meta} numberOfLines={1}>
              {metaText}
            </SolaText>
          )}
          {descriptionText != null && (
            <SolaText style={styles.description} numberOfLines={2}>
              {descriptionText}
            </SolaText>
          )}
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingLeft: spacing.screenX,
    paddingRight: spacing.screenX,
    marginBottom: spacing.lg,
  },

  // Left gutter
  gutter: {
    width: GUTTER_WIDTH,
    paddingTop: spacing.md,
    alignItems: 'flex-start',
  },
  timeLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  gutterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderDefault,
    marginTop: spacing.xs,
    marginLeft: spacing.md,
  },

  // Dashed line column
  lineContainer: {
    width: spacing.md,
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  dashedLine: {
    flex: 1,
    width: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  dashedLineHidden: {
    opacity: 0,
  },

  // Card
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginLeft: spacing.md,
  },
  photo: {
    width: '100%',
    height: PHOTO_HEIGHT,
  },
  cardBody: {
    padding: spacing.md,
  },
  typePill: {
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
