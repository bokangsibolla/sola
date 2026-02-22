import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface TripStatsRowProps {
  dayCount: number;
  cityCount: number;
  accommodationCount: number;
  accommodationTotal: number;
  stopCount: number;
}

export const TripStatsRow: React.FC<TripStatsRowProps> = ({
  dayCount,
  cityCount,
  accommodationCount,
  accommodationTotal,
  stopCount,
}) => (
  <View style={styles.row}>
    <StatPill label={dayCount === 1 ? 'day' : 'days'} value={dayCount} />
    <StatPill label={cityCount === 1 ? 'city' : 'cities'} value={cityCount} />
    <StatPill
      label={accommodationTotal === 1 ? 'stay' : 'stays'}
      value={`${accommodationCount}/${accommodationTotal}`}
    />
    <StatPill label={stopCount === 1 ? 'stop' : 'stops'} value={stopCount} />
  </View>
);

interface StatPillProps {
  value: number | string;
  label: string;
}

const StatPill: React.FC<StatPillProps> = ({ value, label }) => (
  <View style={styles.pill}>
    <Text style={styles.pillValue}>{value}</Text>
    <Text style={styles.pillLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
  },
  pill: {
    flex: 1,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  pillValue: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  pillLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
});
