import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TripDayWithBlocks } from '@/data/trips/itineraryTypes';
import { formatDayDate } from '@/data/trips/helpers';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, spacing, pressedState } from '@/constants/design';

interface TripDayRowProps {
  day: TripDayWithBlocks;
  isToday: boolean;
  onPress: () => void;
}

export const TripDayRow: React.FC<TripDayRowProps> = ({ day, isToday, onPress }) => {
  const blockCount = day.blocks.length;
  const stopsLabel = `${blockCount} ${blockCount === 1 ? 'stop' : 'stops'}`;

  const names = day.blocks
    .slice(0, 3)
    .map((b) => b.titleOverride ?? b.place?.name ?? b.blockType)
    .join(' \u00B7 ');
  const extra = Math.max(0, day.blocks.length - 3);
  const preview = names
    ? extra > 0
      ? `${names} + ${extra} more`
      : names
    : 'No stops yet';

  const dateLabel = formatDayDate(day.date);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && pressedState]}
      accessibilityRole="button"
    >
      <View style={styles.accentBar} />

      <View style={styles.content}>
        {/* Row 1: Day label, date, today pill, stop count, chevron */}
        <View style={styles.row1}>
          <SolaText style={styles.dayLabel}>Day {day.dayIndex}</SolaText>
          {dateLabel != null && (
            <SolaText style={styles.dateText}>{dateLabel}</SolaText>
          )}
          {isToday && (
            <View style={styles.todayPill}>
              <SolaText variant="pillLabel" color={colors.orange} uppercase letterSpacing={0.5} style={styles.todayText}>TODAY</SolaText>
            </View>
          )}
          <View style={styles.row1Right}>
            <SolaText style={styles.stopsText}>{stopsLabel}</SolaText>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </View>
        </View>

        {/* Row 2: Place name preview */}
        <SolaText
          style={[styles.previewText, blockCount === 0 && styles.previewEmpty]}
          numberOfLines={1}
        >
          {preview}
        </SolaText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  accentBar: {
    width: 3,
    backgroundColor: colors.orange,
    marginLeft: spacing.screenX,
  },
  content: {
    flex: 1,
    paddingLeft: spacing.md,
    paddingRight: spacing.screenX,
    paddingVertical: spacing.md,
    justifyContent: 'center',
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  dateText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginRight: spacing.sm,
  },
  todayPill: {
    backgroundColor: colors.orangeFill,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: spacing.sm,
  },
  todayText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  row1Right: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  stopsText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  previewText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  previewEmpty: {
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
