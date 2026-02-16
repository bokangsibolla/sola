import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '@/constants/design';

interface NotificationSectionHeaderProps {
  title: string;
}

export function NotificationSectionHeader({ title }: NotificationSectionHeaderProps) {
  return <Text style={styles.header}>{title}</Text>;
}

const styles = StyleSheet.create({
  header: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
});
