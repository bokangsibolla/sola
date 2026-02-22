import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, pressedState, radius, spacing } from '@/constants/design';
import type { ItineraryBlockWithTags } from '@/data/trips/itineraryTypes';

export type BlockProgressStatus = 'completed' | 'current' | 'upcoming' | undefined;

interface TimelineBlockCardProps {
  block: ItineraryBlockWithTags;
  isLast: boolean;
  onPress: () => void;
  progressStatus?: BlockProgressStatus;
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

/** Format "HH:MM:SS" -> "08:00" */
const formatTime = (time: string): string => time.slice(0, 5);

/** Format "HH:MM:SS" -> "8 AM" (short label for gutter) */
const formatTimeShort = (time: string): string => {
  const h = parseInt(time.slice(0, 2), 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12} ${ampm}`;
};

/** Progress status label */
function getProgressLabel(status: BlockProgressStatus): string | null {
  switch (status) {
    case 'completed': return 'Done';
    case 'current': return 'Now';
    default: return null;
  }
}

export const TimelineBlockCard: React.FC<TimelineBlockCardProps> = ({
  block,
  isLast,
  onPress,
  progressStatus,
}) => {
  const title =
    block.titleOverride ?? block.place?.name ?? getBlockLabel(block);
  const photoUrl = block.place?.imageUrlCached ?? null;
  const typeLabel = getBlockLabel(block);
  const isCompleted = progressStatus === 'completed';
  const isCurrent = progressStatus === 'current';
  const progressLabel = getProgressLabel(progressStatus);

  // Build meta line: "08:00 - 11:00 . 123 Main St"
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
    <View style={[styles.row, isCompleted && styles.rowCompleted]}>
      {/* Left gutter: time label or dot */}
      <View style={styles.gutter}>
        {isCompleted ? (
          <Ionicons name="checkmark-circle" size={18} color={colors.greenSoft} />
        ) : isCurrent ? (
          <View style={styles.gutterDotCurrent} />
        ) : block.startTime != null ? (
          <Text style={styles.timeLabel}>{formatTimeShort(block.startTime)}</Text>
        ) : (
          <View style={styles.gutterDot} />
        )}
      </View>

      {/* Dashed line */}
      <View style={styles.lineContainer}>
        <View
          style={[
            styles.dashedLine,
            isLast && styles.dashedLineHidden,
            isCurrent && styles.dashedLineCurrent,
          ]}
        />
      </View>

      {/* Card */}
      <Pressable
        style={({ pressed }) => [
          styles.card,
          isCurrent && styles.cardCurrent,
          pressed && pressedState,
        ]}
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
          {/* Type pill row with optional progress label */}
          <View style={styles.typePillRow}>
            <Text style={[styles.typePill, isCompleted && styles.typePillCompleted]}>
              {typeLabel}
            </Text>
            {progressLabel != null && (
              <View style={[
                styles.progressBadge,
                isCompleted && styles.progressBadgeCompleted,
                isCurrent && styles.progressBadgeCurrent,
              ]}>
                {isCompleted && (
                  <Ionicons name="checkmark" size={10} color={colors.greenSoft} style={styles.progressIcon} />
                )}
                <Text style={[
                  styles.progressBadgeText,
                  isCompleted && styles.progressBadgeTextCompleted,
                  isCurrent && styles.progressBadgeTextCurrent,
                ]}>
                  {progressLabel}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[styles.title, isCompleted && styles.titleCompleted]}
            numberOfLines={2}
          >
            {title}
          </Text>
          {metaText.length > 0 && (
            <Text
              style={[styles.meta, isCompleted && styles.metaCompleted]}
              numberOfLines={1}
            >
              {metaText}
            </Text>
          )}
          {descriptionText != null && (
            <Text
              style={[styles.description, isCompleted && styles.descriptionCompleted]}
              numberOfLines={2}
            >
              {descriptionText}
            </Text>
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
  rowCompleted: {
    opacity: 0.5,
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
  gutterDotCurrent: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.orange,
    marginTop: spacing.xs,
    marginLeft: spacing.md - 2,
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
  dashedLineCurrent: {
    borderColor: colors.orange,
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
  cardCurrent: {
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,
  },
  photo: {
    width: '100%',
    height: PHOTO_HEIGHT,
  },
  cardBody: {
    padding: spacing.md,
  },

  // Type pill row
  typePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  typePill: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typePillCompleted: {
    textDecorationLine: 'line-through',
  },

  // Progress badge
  progressBadge: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  progressBadgeCompleted: {
    backgroundColor: colors.greenFill,
  },
  progressBadgeCurrent: {
    backgroundColor: colors.orangeFill,
  },
  progressIcon: {
    marginRight: 2,
  },
  progressBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  progressBadgeTextCompleted: {
    color: colors.greenSoft,
  },
  progressBadgeTextCurrent: {
    color: colors.orange,
  },

  title: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  metaCompleted: {
    textDecorationLine: 'line-through',
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  descriptionCompleted: {
    textDecorationLine: 'line-through',
  },
});
