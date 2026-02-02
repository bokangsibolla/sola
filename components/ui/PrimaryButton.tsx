import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '@/constants/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export default function PrimaryButton({ 
  label, 
  onPress, 
  style,
  disabled = false 
}: PrimaryButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.brand,
    height: 52,
    borderRadius: theme.radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.screenX,
    width: '100%',
  },
  buttonPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    backgroundColor: theme.colors.brand,
    opacity: 0.6, // Subtle opacity, not full blur
  },
  buttonText: {
    ...theme.typography.button,
    color: theme.colors.card,
  },
  buttonTextDisabled: {
    color: theme.colors.card,
    opacity: 0.8,
  },
});
