import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, elevation, radius } from '@/constants/design';

export const BACK_BUTTON_SIZE = 40;

interface BackButtonProps {
  /** Use 'close' for modal/creation screens (new trip, new post) */
  variant?: 'back' | 'close';
  onPress?: () => void;
}

export default function BackButton({ variant = 'back', onPress }: BackButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      hitSlop={8}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={variant === 'close' ? 'Close' : 'Go back'}
    >
      <Ionicons
        name={variant === 'close' ? 'close' : 'chevron-back'}
        size={20}
        color={colors.textPrimary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: BACK_BUTTON_SIZE,
    height: BACK_BUTTON_SIZE,
    borderRadius: radius.input,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.sm,
  },
});
