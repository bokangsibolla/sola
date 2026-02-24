import React, { useCallback, useRef } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { TripDay } from '@/data/trips/itineraryTypes';

interface DaySelectorProps {
  days: TripDay[];
  selectedDayId: string;
  onSelectDay: (dayId: string) => void;
  todayDayId?: string | null;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDayName(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr + 'T00:00:00');
  return DAY_NAMES[date.getDay()];
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  days,
  selectedDayId,
  onSelectDay,
  todayDayId,
}) => {
  const listRef = useRef<FlatList<TripDay>>(null);

  const scrollToSelected = useCallback(() => {
    const idx = days.findIndex((d) => d.id === selectedDayId);
    if (idx >= 0 && listRef.current) {
      listRef.current.scrollToIndex({
        index: idx,
        animated: true,
        viewPosition: 0.3,
      });
    }
  }, [days, selectedDayId]);

  const renderPill = useCallback(
    ({ item }: { item: TripDay }) => {
      const selected = item.id === selectedDayId;
      const isToday = item.id === todayDayId;
      const dayName = getDayName(item.date);

      return (
        <Pressable
          onPress={() => onSelectDay(item.id)}
          style={[
            styles.pill,
            selected ? styles.pillSelected : styles.pillUnselected,
          ]}
        >
          <Text
            style={[
              styles.dayLabel,
              selected && styles.dayLabelSelected,
            ]}
          >
            Day {item.dayIndex + 1}
          </Text>
          {dayName && (
            <Text
              style={[
                styles.dayName,
                selected && styles.dayNameSelected,
              ]}
            >
              {dayName}
            </Text>
          )}
          {isToday && <View style={styles.todayDot} />}
        </Pressable>
      );
    },
    [selectedDayId, todayDayId, onSelectDay],
  );

  return (
    <FlatList
      ref={listRef}
      data={days}
      keyExtractor={(item) => item.id}
      renderItem={renderPill}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      onLayout={scrollToSelected}
      onScrollToIndexFailed={() => {
        // Silently handle — list not yet measured
      }}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  pill: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  pillSelected: {
    backgroundColor: colors.orangeFill,
    borderColor: colors.orange,
  },
  pillUnselected: {
    backgroundColor: colors.background,
    borderColor: colors.borderDefault,
  },
  dayLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  dayLabelSelected: {
    color: colors.orange,
  },
  dayName: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  dayNameSelected: {
    color: colors.orange,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.orange,
    marginTop: spacing.xs,
  },
});
