import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface WhatStandsOutProps {
  highlights: string[];
}

const WhatStandsOut: React.FC<WhatStandsOutProps> = ({ highlights }) => {
  if (!highlights || highlights.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>WHAT STANDS OUT</Text>
      <View style={styles.pillRow}>
        {highlights.map((highlight, index) => (
          <View key={index} style={styles.pill}>
            <Text style={styles.diamond}>{'\u25C7'}</Text>
            <Text style={styles.pillText}>{highlight}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export { WhatStandsOut };

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xxl,
  },
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    gap: spacing.xs,
  },
  diamond: {
    fontSize: 10,
    color: colors.textMuted,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
});
