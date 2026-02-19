import { useRef, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { CategoryCount } from '@/data/city/types';

interface Props {
  categories: CategoryCount[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export function PlaceCategoryTabs({ categories, activeKey, onSelect }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll to active tab on change
  useEffect(() => {
    const idx = categories.findIndex((c) => c.key === activeKey);
    if (idx > 0) {
      const offset = Math.max(0, idx * 100 - 40);
      scrollRef.current?.scrollTo({ x: offset, animated: true });
    }
  }, [activeKey, categories]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {categories.map((cat) => {
        const active = cat.key === activeKey;
        return (
          <Pressable
            key={cat.key}
            onPress={() => onSelect(cat.key)}
            style={[styles.pill, active && styles.pillActive]}
          >
            <Text style={[styles.pillText, active && styles.pillTextActive]}>
              {cat.emoji} {cat.label}
            </Text>
            <View style={[styles.countBadge, active && styles.countBadgeActive]}>
              <Text style={[styles.countText, active && styles.countTextActive]}>
                {cat.count}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  pillActive: {
    backgroundColor: colors.orangeFill,
    borderColor: colors.orange,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.orange,
  },
  countBadge: {
    backgroundColor: colors.borderSubtle,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  countBadgeActive: {
    backgroundColor: colors.orange,
  },
  countText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
  },
  countTextActive: {
    color: '#FFFFFF',
  },
});
