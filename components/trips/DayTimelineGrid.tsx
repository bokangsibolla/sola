import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, pressedState, radius, spacing } from '@/constants/design';
import type { ItineraryBlockWithTags } from '@/data/trips/itineraryTypes';
import { TYPE_DOT_COLOR } from '@/components/trips/blockTypeColors';
import { formatTimeDisplay } from '@/components/trips/TimePickerField';

// ── Layout constants ─────────────────────────────────────────────────────────

const HOUR_HEIGHT = 60;
const GUTTER_WIDTH = 48;
const MIN_BLOCK_HEIGHT = 44;

// ── Block-type → color fallback ──────────────────────────────────────────────

const BLOCK_TYPE_COLOR: Record<string, string> = {
  place: '#3B82F6',
  accommodation: '#E5653A',
  activity: '#2D8A4E',
  transport: '#6B6B6B',
  meal: '#D4940A',
  free_time: '#8B5CF6',
  note: '#9A9A9A',
  safety_check: '#D32F2F',
};

function getBlockColor(block: ItineraryBlockWithTags): string {
  // Use place type color if available, else block type color
  if (block.place?.placeType) {
    const placeColor = TYPE_DOT_COLOR[block.place.placeType as keyof typeof TYPE_DOT_COLOR];
    if (placeColor) return placeColor;
  }
  return BLOCK_TYPE_COLOR[block.blockType] ?? '#9A9A9A';
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Parse "HH:MM:SS" or "HH:MM" to total minutes since midnight. */
function timeToMinutes(time: string): number {
  const parts = time.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

/** Format hour number to "8 AM" / "12 PM" etc. */
function formatHourLabel(hour: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12} ${ampm}`;
}

// ── Types ────────────────────────────────────────────────────────────────────

interface DayTimelineGridProps {
  blocks: ItineraryBlockWithTags[];
  onBlockPress: (blockId: string) => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export const DayTimelineGrid: React.FC<DayTimelineGridProps> = ({
  blocks,
  onBlockPress,
}) => {
  // Compute hour range from data
  const { startHour, endHour, hours } = useMemo(() => {
    let minMinutes = 8 * 60; // default 8 AM
    let maxMinutes = 20 * 60; // default 8 PM

    for (const block of blocks) {
      if (block.startTime) {
        const start = timeToMinutes(block.startTime);
        minMinutes = Math.min(minMinutes, start);

        if (block.endTime) {
          maxMinutes = Math.max(maxMinutes, timeToMinutes(block.endTime));
        } else {
          // Default 60 min or durationMin
          const dur = block.durationMin ?? 60;
          maxMinutes = Math.max(maxMinutes, start + dur);
        }
      }
    }

    // Pad ±1 hour and floor/ceil to whole hours
    const sH = Math.max(0, Math.floor(minMinutes / 60) - 1);
    const eH = Math.min(24, Math.ceil(maxMinutes / 60) + 1);

    // Ensure minimum 4 hours visible
    const finalEnd = Math.max(eH, sH + 4);

    const hourList: number[] = [];
    for (let h = sH; h <= finalEnd; h++) {
      hourList.push(h);
    }

    return { startHour: sH, endHour: finalEnd, hours: hourList };
  }, [blocks]);

  const gridStartMinutes = startHour * 60;
  const gridHeight = (endHour - startHour) * HOUR_HEIGHT;

  return (
    <View style={styles.container}>
      <View style={[styles.grid, { height: gridHeight }]}>
        {/* Hour lines + labels */}
        {hours.map((hour) => {
          const top = (hour - startHour) * HOUR_HEIGHT;
          return (
            <View key={hour} style={[styles.hourRow, { top }]}>
              <SolaText style={styles.hourLabel}>{formatHourLabel(hour)}</SolaText>
              <View style={styles.hourLine} />
            </View>
          );
        })}

        {/* Blocks */}
        {blocks.map((block) => {
          if (!block.startTime) return null;

          const blockStartMin = timeToMinutes(block.startTime);
          const blockEndMin = block.endTime
            ? timeToMinutes(block.endTime)
            : blockStartMin + (block.durationMin ?? 60);

          const durationMin = blockEndMin - blockStartMin;
          const top = (blockStartMin - gridStartMinutes) * (HOUR_HEIGHT / 60);
          const height = Math.max(
            MIN_BLOCK_HEIGHT,
            durationMin * (HOUR_HEIGHT / 60),
          );

          const title =
            block.titleOverride ?? block.place?.name ?? 'Untitled';
          const timeRange = block.endTime
            ? `${formatTimeDisplay(block.startTime)} - ${formatTimeDisplay(block.endTime)}`
            : formatTimeDisplay(block.startTime);
          const borderColor = getBlockColor(block);

          return (
            <Pressable
              key={block.id}
              style={({ pressed }) => [
                styles.blockCard,
                {
                  top,
                  height,
                  left: GUTTER_WIDTH,
                  right: 0,
                  borderLeftColor: borderColor,
                },
                pressed && pressedState,
              ]}
              onPress={() => onBlockPress(block.id)}
            >
              <SolaText style={styles.blockTitle} numberOfLines={1}>
                {title}
              </SolaText>
              <SolaText style={styles.blockTime} numberOfLines={1}>
                {timeRange}
              </SolaText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
  },
  grid: {
    position: 'relative',
  },

  // Hour marks
  hourRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  hourLabel: {
    width: GUTTER_WIDTH,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -6, // center text on the line
  },
  hourLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderSubtle,
  },

  // Block cards
  blockCard: {
    position: 'absolute',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderLeftWidth: 3,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },
  blockTitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  blockTime: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
