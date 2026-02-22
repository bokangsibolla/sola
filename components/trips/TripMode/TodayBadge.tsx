import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/design';

export const TodayBadge: React.FC = () => (
  <View style={styles.badge}>
    <Text style={styles.text}>TODAY</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: colors.orange,
    letterSpacing: 0.5,
  },
});
