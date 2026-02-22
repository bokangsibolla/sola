import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { colors, spacing } from '@/constants/design';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
}

export default function AppHeader({ title, subtitle, rightAction, rightComponent, leftComponent }: AppHeaderProps) {
  const hasTitle = title && title.trim().length > 0;
  
  return (
    <View style={styles.container}>
      {leftComponent && <View style={styles.leftContainer}>{leftComponent}</View>}
      {hasTitle && (
        <View style={[styles.textContainer, !!leftComponent && styles.textContainerWithLeft]}>
          <SolaText variant="h1" style={styles.title}>{title}</SolaText>
          {subtitle && <SolaText variant="caption" color={colors.textSecondary} style={styles.subtitle}>{subtitle}</SolaText>}
        </View>
      )}
      {!hasTitle && leftComponent && <View style={styles.spacer} pointerEvents="none" />}
      {rightComponent && <View style={styles.rightContainer}>{rightComponent}</View>}
      {!rightComponent && rightAction && (
        <Pressable onPress={rightAction.onPress}>
          <SolaText variant="body" color={colors.orange} style={styles.actionText}>{rightAction.label}</SolaText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    minHeight: 44,
  },
  leftContainer: {
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  textContainerWithLeft: {
    marginLeft: 0,
  },
  rightContainer: {},
  spacer: {
    flex: 1,
  },
  title: {
    marginBottom: 0,
  },
  subtitle: {
    marginTop: 2,
  },
  actionText: {
    fontWeight: '500',
  },
});
