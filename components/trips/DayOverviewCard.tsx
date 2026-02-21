import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, pressedState, radius, spacing } from '@/constants/design';
import type { TripDayWithBlocks } from '@/data/trips/itineraryTypes';

interface DayOverviewCardProps {
  day: TripDayWithBlocks;
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

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const dayName = SHORT_DAYS[date.getUTCDay()];
  const dayNum = date.getUTCDate();
  const month = SHORT_MONTHS[date.getUTCMonth()];
  return `${dayName}, ${dayNum} ${month}`;
};

const MAX_PREVIEW_BLOCKS = 4;

export const DayOverviewCard: React.FC<DayOverviewCardProps> = ({ day, onPress }) => {
  const visibleBlocks = day.blocks.slice(0, MAX_PREVIEW_BLOCKS);
  const extraCount = day.blocks.length - MAX_PREVIEW_BLOCKS;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && pressedState]}
    >
      <View style={styles.accentBar} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.dayLabel}>Day {day.dayIndex}</Text>
          {day.date != null && (
            <Text style={styles.dateText}>{formatDate(day.date)}</Text>
          )}
        </View>

        {day.title != null && (
          <Text style={styles.title} numberOfLines={1}>
            {day.title}
          </Text>
        )}

        {day.blocks.length > 0 && (
          <View style={styles.chipsRow}>
            {visibleBlocks.map((block) => (
              <View key={block.id} style={styles.chip}>
                <Text style={styles.chipText} numberOfLines={1}>
                  {block.titleOverride ?? block.place?.name ?? BLOCK_TYPE_LABELS[block.blockType]}
                </Text>
              </View>
            ))}
            {extraCount > 0 && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>+{extraCount} more</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.chevronContainer}>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  accentBar: {
    width: 3,
    backgroundColor: colors.orange,
    borderRadius: radius.xs,
    alignSelf: 'stretch',
  },
  content: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  dateText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  chip: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  chipText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
  },
  chevronContainer: {
    alignSelf: 'center',
    paddingRight: spacing.md,
  },
});
