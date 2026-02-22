import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, pressedState, radius, spacing } from '@/constants/design';
import type { ItineraryBlockWithTags } from '@/data/trips/itineraryTypes';

interface ItineraryBlockProps {
  block: ItineraryBlockWithTags;
  isFirst: boolean;
  isLast: boolean;
  onPress: () => void;
}

const BLOCK_TYPE_LABELS: Record<string, string> = {
  place: 'Place',
  accommodation: 'Stay',
  activity: 'Activity',
  transport: 'Getting there',
  meal: 'Meal',
  free_time: 'Free time',
  note: 'Note',
  safety_check: 'Check-in',
};

const BLOCK_COLORS: Record<string, string> = {
  place: colors.orange,
  accommodation: colors.blueSoft,
  activity: colors.greenSoft,
  transport: colors.textSecondary,
  meal: colors.warning,
  free_time: colors.borderDefault,
  note: colors.textMuted,
  safety_check: colors.emergency,
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  booked: { bg: colors.greenFill, text: colors.greenSoft, label: 'Booked' },
  done: { bg: colors.neutralFill, text: colors.textSecondary, label: 'Done' },
  skipped: { bg: colors.neutralFill, text: colors.textMuted, label: 'Skipped' },
};

const formatTime = (time: string): string => {
  // time comes as "HH:MM:SS" — drop the seconds
  return time.slice(0, 5);
};

const capitalize = (str: string): string => {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const CIRCLE_SIZE = 10;
const CIRCLE_BORDER = 2;
const LEFT_COL_WIDTH = 52;
const CENTER_COL_WIDTH = 24;
const MIN_ROW_HEIGHT = 64;

export const ItineraryBlock: React.FC<ItineraryBlockProps> = ({
  block,
  isFirst,
  isLast,
  onPress,
}) => {
  const nodeColor = BLOCK_COLORS[block.blockType] ?? colors.textMuted;
  const title =
    block.titleOverride ?? block.place?.name ?? BLOCK_TYPE_LABELS[block.blockType];
  const subtitle = block.place?.placeType
    ? capitalize(block.place.placeType)
    : BLOCK_TYPE_LABELS[block.blockType];
  const statusStyle = block.status !== 'planned' ? STATUS_STYLES[block.status] : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && pressedState]}
    >
      {/* Left column — time */}
      <View style={styles.leftCol}>
        {block.startTime != null && (
          <SolaText style={styles.timeText}>{formatTime(block.startTime)}</SolaText>
        )}
      </View>

      {/* Center column — timeline */}
      <View style={styles.centerCol}>
        <View style={[styles.lineSegment, isFirst && styles.lineHidden]} />
        <View
          style={[
            styles.circle,
            { backgroundColor: nodeColor, borderColor: nodeColor },
          ]}
        />
        <View style={[styles.lineSegment, isLast && styles.lineHidden]} />
      </View>

      {/* Right column — content */}
      <View style={styles.rightCol}>
        <SolaText style={styles.title} numberOfLines={2}>
          {title}
        </SolaText>
        <SolaText style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </SolaText>

        {block.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {block.tags.map((tag) => (
              <View key={tag.id} style={styles.tagChip}>
                <SolaText style={styles.tagText}>{tag.label}</SolaText>
              </View>
            ))}
          </View>
        )}

        {statusStyle != null && (
          <View
            style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
          >
            <SolaText style={[styles.statusText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </SolaText>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    minHeight: MIN_ROW_HEIGHT,
  },
  leftCol: {
    width: LEFT_COL_WIDTH,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: spacing.sm,
  },
  timeText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  centerCol: {
    width: CENTER_COL_WIDTH,
    alignItems: 'center',
  },
  lineSegment: {
    flex: 1,
    width: 1,
    backgroundColor: colors.borderDefault,
  },
  lineHidden: {
    opacity: 0,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: CIRCLE_BORDER,
  },
  rightCol: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingRight: spacing.screenX,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tagChip: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tagText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: spacing.xs,
  },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
});
