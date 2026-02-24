import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { getFlag } from '@/data/trips/helpers';

interface FlagGridProps {
  countries: string[];
  maxVisible?: number;
}

export function FlagGrid({ countries, maxVisible = 15 }: FlagGridProps) {
  const [expanded, setExpanded] = useState(false);

  if (countries.length === 0) return null;

  const hasOverflow = countries.length > maxVisible;
  const visible = expanded || !hasOverflow ? countries : countries.slice(0, maxVisible);
  const hiddenCount = countries.length - maxVisible;

  return (
    <View>
      <View style={styles.grid}>
        {visible.map((iso) => (
          <Text key={iso} style={styles.flag}>
            {getFlag(iso)}
          </Text>
        ))}
        {hasOverflow && !expanded && (
          <Pressable
            onPress={() => setExpanded(true)}
            style={styles.morePill}
            accessibilityRole="button"
            accessibilityLabel={`Show ${hiddenCount} more countries`}
          >
            <Text style={styles.moreText}>+{hiddenCount}</Text>
          </Pressable>
        )}
      </View>
      {hasOverflow && expanded && (
        <Pressable
          onPress={() => setExpanded(false)}
          accessibilityRole="button"
          accessibilityLabel="Show less"
        >
          <Text style={styles.showLess}>Show less</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center',
  },
  flag: {
    fontSize: 28,
  },
  morePill: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  showLess: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
    marginTop: spacing.sm,
  },
});
