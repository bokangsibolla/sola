import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, fonts, radius } from '@/constants/design';
import { SolaText } from '@/components/ui/SolaText';

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
      <SolaText
        style={[styles.buttonText, disabled && styles.buttonTextDisabled]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {label}
      </SolaText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.orange,
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 24,
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
    fontSize: 16,
    lineHeight: 22,
    color: colors.background,
  },
  buttonTextDisabled: {
    opacity: 0.9,
  },
});
