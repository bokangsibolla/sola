import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BackButton from './BackButton';
import { colors, spacing, typography } from '@/constants/design';

interface ScreenHeaderProps {
  /** Screen title displayed next to back button */
  title?: string;
  /** 'back' for push navigation, 'close' for modals */
  variant?: 'back' | 'close';
  /** Custom back handler (defaults to router.back) */
  onBack?: () => void;
  /** Right-side content (menu dots, action buttons, etc.) */
  rightComponent?: React.ReactNode;
}

export default function ScreenHeader({
  title,
  variant = 'back',
  onBack,
  rightComponent,
}: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <BackButton variant={variant} onPress={onBack} />
      {title ? (
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      ) : (
        <View style={styles.spacer} />
      )}
      <View style={styles.right}>
        {rightComponent ?? <View style={styles.rightPlaceholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    minHeight: 44,
  },
  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    flex: 1,
    marginLeft: spacing.xs,
  },
  spacer: {
    flex: 1,
  },
  right: {
    marginLeft: spacing.sm,
  },
  rightPlaceholder: {
    width: 36,
  },
});
