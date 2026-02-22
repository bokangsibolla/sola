import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';

interface SearchPillProps {
  firstName?: string | null;
}

export function SearchPill({ firstName }: SearchPillProps) {
  const router = useRouter();

  const placeholder = firstName
    ? `Where to, ${firstName}?`
    : 'You can go anywhere';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.pill,
        pressed && styles.pressed,
      ]}
      onPress={() => router.push('/discover/search')}
      accessibilityRole="button"
      accessibilityLabel="Search destinations"
    >
      <Feather name="search" size={16} color={colors.textMuted} />
      <SolaText style={styles.placeholder}>{placeholder}</SolaText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.screenX,
    gap: spacing.sm,
  },
  placeholder: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },
});
