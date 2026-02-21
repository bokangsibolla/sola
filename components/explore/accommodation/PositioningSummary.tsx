import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, elevation, fonts, radius, spacing } from '@/constants/design';

interface PositioningSummaryProps {
  text: string | null;
}

const PositioningSummary: React.FC<PositioningSummaryProps> = ({ text }) => {
  if (!text) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

export { PositioningSummary };

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    backgroundColor: colors.background,
    borderRadius: radius.module,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.xl,
    ...elevation.sm,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
