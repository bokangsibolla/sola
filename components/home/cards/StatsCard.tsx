import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface StatsCardProps {
  tripCount: number;
}

export function StatsCard({ tripCount }: StatsCardProps) {
  if (tripCount === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.stat}>
        {tripCount} {tripCount === 1 ? 'trip' : 'trips'} planned
      </Text>
      <Text style={styles.subtitle}>
        Keep exploring — your next adventure awaits
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.cardLg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  stat: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
});
