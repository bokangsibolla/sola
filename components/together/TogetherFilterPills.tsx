import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  colors,
  fonts,
  spacing,
  radius,
  typography,
} from '@/constants/design';
import type { ActivityCategory } from '@/data/together/types';

interface TogetherFilterPillsProps {
  selectedCategory: ActivityCategory | undefined;
  selectedTimeframe: 'today' | 'this_week' | 'flexible' | 'all' | undefined;
  onCategoryChange: (cat: ActivityCategory | undefined) => void;
  onTimeframeChange: (tf: 'today' | 'this_week' | 'flexible' | 'all' | undefined) => void;
}

interface PillItem {
  key: string;
  label: string;
}

const CATEGORY_PILLS: PillItem[] = [
  { key: 'all', label: 'All' },
  { key: 'food', label: 'Food' },
  { key: 'culture', label: 'Culture' },
  { key: 'adventure', label: 'Adventure' },
  { key: 'nightlife', label: 'Nightlife' },
  { key: 'day_trip', label: 'Day trip' },
  { key: 'wellness', label: 'Wellness' },
  { key: 'shopping', label: 'Shopping' },
];

const TIMEFRAME_PILLS: PillItem[] = [
  { key: 'today', label: 'Today' },
  { key: 'this_week', label: 'This week' },
  { key: 'flexible', label: 'Flexible' },
];

export const TogetherFilterPills: React.FC<TogetherFilterPillsProps> = ({
  selectedCategory,
  selectedTimeframe,
  onCategoryChange,
  onTimeframeChange,
}) => {
  const isCategoryActive = (key: string): boolean => {
    if (key === 'all') return selectedCategory === undefined;
    return selectedCategory === key;
  };

  const isTimeframeActive = (key: string): boolean => {
    return selectedTimeframe === key;
  };

  const handleCategoryPress = (key: string) => {
    if (key === 'all') {
      onCategoryChange(undefined);
    } else {
      onCategoryChange(key as ActivityCategory);
    }
  };

  const handleTimeframePress = (key: string) => {
    const tf = key as 'today' | 'this_week' | 'flexible' | 'all';
    if (selectedTimeframe === tf) {
      onTimeframeChange(undefined);
    } else {
      onTimeframeChange(tf);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
    >
      {/* Category pills */}
      {CATEGORY_PILLS.map((pill) => {
        const active = isCategoryActive(pill.key);
        return (
          <Pressable
            key={`cat-${pill.key}`}
            style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
            onPress={() => handleCategoryPress(pill.key)}
          >
            <Text style={[styles.pillText, active ? styles.pillTextActive : styles.pillTextInactive]}>
              {pill.label}
            </Text>
          </Pressable>
        );
      })}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Timeframe pills */}
      {TIMEFRAME_PILLS.map((pill) => {
        const active = isTimeframeActive(pill.key);
        return (
          <Pressable
            key={`tf-${pill.key}`}
            style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
            onPress={() => handleTimeframePress(pill.key)}
          >
            <Text style={[styles.pillText, active ? styles.pillTextActive : styles.pillTextInactive]}>
              {pill.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.sm,
    alignItems: 'center',
  },

  // Pill base
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: colors.orangeFill,
    borderColor: colors.orange,
  },
  pillInactive: {
    backgroundColor: colors.neutralFill,
    borderColor: colors.borderDefault,
  },

  // Pill text
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  pillTextActive: {
    color: colors.orange,
  },
  pillTextInactive: {
    color: colors.textSecondary,
  },

  // Divider between categories and timeframes
  divider: {
    width: 1,
    height: 20,
    backgroundColor: colors.borderDefault,
    marginHorizontal: spacing.xs,
  },
});
