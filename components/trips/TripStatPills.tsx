import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface TripStatPillsProps {
  dayCount: number;
  spotCount: number;
  restaurantCount: number;
}

export const TripStatPills: React.FC<TripStatPillsProps> = ({
  dayCount,
  spotCount,
  restaurantCount,
}) => (
  <View style={styles.row}>
    <View style={[styles.pill, styles.orangePill]}>
      <Text style={[styles.pillText, styles.orangeText]}>
        {dayCount} {dayCount === 1 ? 'Day' : 'Days'}
      </Text>
    </View>
    <View style={[styles.pill, styles.greenPill]}>
      <Text style={[styles.pillText, styles.greenText]}>
        {spotCount} {spotCount === 1 ? 'Spot' : 'Spots'}
      </Text>
    </View>
    <View style={[styles.pill, styles.bluePill]}>
      <Text style={[styles.pillText, styles.blueText]}>
        {restaurantCount} {restaurantCount === 1 ? 'Restaurant' : 'Restaurants'}
      </Text>
    </View>
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
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  orangePill: {
    borderColor: colors.orange,
  },
  orangeText: {
    color: colors.orange,
  },
  greenPill: {
    borderColor: '#2D8A4E',
  },
  greenText: {
    color: '#2D8A4E',
  },
  bluePill: {
    borderColor: '#3B82F6',
  },
  blueText: {
    color: '#3B82F6',
  },
});
