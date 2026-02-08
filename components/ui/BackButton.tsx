import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/design';

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
      hitSlop={12}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={variant === 'close' ? 'Close' : 'Go back'}
    >
      <Ionicons
        name={variant === 'close' ? 'close' : 'chevron-back'}
        size={22}
        color={colors.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
});
