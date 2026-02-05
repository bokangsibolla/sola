import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/constants/design';

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
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      {!hasTitle && leftComponent && <View style={styles.spacer} pointerEvents="none" />}
      {rightComponent && <View style={styles.rightContainer}>{rightComponent}</View>}
      {!rightComponent && rightAction && (
        <Pressable onPress={rightAction.onPress}>
          <Text style={styles.actionText}>{rightAction.label}</Text>
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
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: 0,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionText: {
    ...typography.body,
    color: colors.orange,
    fontWeight: '500',
  },
});
