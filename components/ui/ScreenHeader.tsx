import React from 'react';
import { View, StyleSheet } from 'react-native';
import BackButton from './BackButton';
import { SolaText } from '@/components/ui/SolaText';
import { spacing } from '@/constants/design';

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
        <SolaText variant="screenTitle" numberOfLines={1} style={styles.title}>{title}</SolaText>
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
