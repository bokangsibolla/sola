import React from 'react';
import { Platform, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, fonts, radius } from '@/constants/design';

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
  disabled = false,
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
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.orange,
    height: 52,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.background,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  buttonTextDisabled: {
    opacity: 0.9,
  },
});
