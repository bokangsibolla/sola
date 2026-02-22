import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TripDayWithBlocks } from '@/data/trips/itineraryTypes';
import { formatDayDate } from '@/data/trips/helpers';
import { TodayBadge } from '@/components/trips/TripMode/TodayBadge';
import { colors, fonts, spacing, pressedState } from '@/constants/design';

interface TripDayRowProps {
  day: TripDayWithBlocks;
  isToday: boolean;
  onPress: () => void;
}

/** Format "HH:MM:SS" to "2 PM" or "10 AM" */
const formatTimeShort = (time: string): string => {
  const h = parseInt(time.slice(0, 2), 10);
  const m = parseInt(time.slice(3, 5), 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  if (m > 0) return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  return `${h12} ${ampm}`;
};

/** Find the next upcoming block based on current time. */
function getNextBlock(day: TripDayWithBlocks): { name: string; time: string } | null {
  const now = new Date();
  const currentHHMM = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;

  for (const block of day.blocks) {
    if (!block.startTime) continue;
    // Find the first block whose start time hasn't passed yet
    if (block.startTime >= currentHHMM) {
      const name = block.titleOverride ?? block.place?.name ?? block.blockType;
      return { name, time: formatTimeShort(block.startTime) };
    }
  }
  return null;
}

export const TripDayRow: React.FC<TripDayRowProps> = ({ day, isToday, onPress }) => {
  const blockCount = day.blocks.length;
  const stopsLabel = `${blockCount} ${blockCount === 1 ? 'stop' : 'stops'}`;

  const names = day.blocks
    .slice(0, 3)
    .map((b) => b.titleOverride ?? b.place?.name ?? b.blockType)
    .join(' \u00B7 ');
  const extra = Math.max(0, day.blocks.length - 3);
  const defaultPreview = names
    ? extra > 0
      ? `${names} + ${extra} more`
      : names
    : 'No stops yet';

  // For today's row, show "Next: [name] at [time]" if available
  const nextBlock = isToday ? getNextBlock(day) : null;
  const preview = isToday && nextBlock
    ? `${stopsLabel} \u00B7 Next: ${nextBlock.name} at ${nextBlock.time}`
    : defaultPreview;

  const dateLabel = formatDayDate(day.date);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        isToday && styles.containerToday,
        pressed && pressedState,
      ]}
      accessibilityRole="button"
    >
      {isToday && <View style={styles.accentBar} />}

      <View style={[styles.content, !isToday && styles.contentNoBar]}>
        {/* Row 1: Day label, date, today badge, stop count, chevron */}
        <View style={styles.row1}>
          <Text style={styles.dayLabel}>Day {day.dayIndex}</Text>
          {isToday ? (
            <TodayBadge />
          ) : (
            dateLabel != null && (
              <Text style={styles.dateText}>{dateLabel}</Text>
            )
          )}
          <View style={styles.row1Right}>
            {!isToday && <Text style={styles.stopsText}>{stopsLabel}</Text>}
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </View>
        </View>

        {/* Row 2: Preview line */}
        <Text
          style={[
            styles.previewText,
            blockCount === 0 && !isToday && styles.previewEmpty,
            isToday && styles.previewToday,
          ]}
          numberOfLines={1}
        >
          {isToday && dateLabel ? `${dateLabel} \u00B7 ${preview}` : preview}
        </Text>
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
  containerToday: {
    backgroundColor: colors.orangeFill,
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
  contentNoBar: {
    paddingLeft: spacing.screenX + 3 + spacing.md,
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  previewToday: {
    color: colors.textPrimary,
  },
});
