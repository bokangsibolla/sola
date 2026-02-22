import React from 'react';
import { StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '@/constants/design';
import { SolaText } from '@/components/ui/SolaText';

interface NotificationSectionHeaderProps {
  title: string;
}

export function NotificationSectionHeader({ title }: NotificationSectionHeaderProps) {
  return <SolaText style={styles.header}>{title}</SolaText>;
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
