import { useRef, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, radius, spacing } from '@/constants/design';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface MonthPickerProps {
  selectedMonth: number; // 1-12
  onSelect: (month: number) => void;
}

export function MonthPicker({ selectedMonth, onSelect }: MonthPickerProps) {
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll to selected month when it changes (including trip-aware default)
  useEffect(() => {
    const offset = Math.max(0, (selectedMonth - 2) * 60);
    scrollRef.current?.scrollTo({ x: offset, animated: false });
  }, [selectedMonth]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {MONTHS.map((label, i) => {
        const month = i + 1;
        const active = month === selectedMonth;
        return (
          <Pressable
            key={month}
            onPress={() => onSelect(month)}
            style={[styles.pill, active && styles.pillActive]}
          >
            <SolaText style={[styles.pillText, active && styles.pillTextActive]}>
              {label}
            </SolaText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  pillActive: {
    backgroundColor: colors.orangeFill,
    borderColor: colors.orange,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.orange,
  },
});
