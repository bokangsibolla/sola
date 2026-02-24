import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

interface ProfileProgressCardProps {
  hasAvatar: boolean;
  hasInterests: boolean;
  hasBio: boolean;
}

export function ProfileProgressCard({
  hasAvatar,
  hasInterests,
  hasBio,
}: ProfileProgressCardProps) {
  const router = useRouter();
  const total = 3;
  const done = [hasAvatar, hasInterests, hasBio].filter(Boolean).length;
  const remaining = total - done;

  if (remaining === 0) return null;

  const missing: string[] = [];
  if (!hasAvatar) missing.push('Profile photo');
  if (!hasBio) missing.push('Bio');
  if (!hasInterests) missing.push('Interests');

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push('/(tabs)/home/edit-profile' as any)}
    >
      <Text style={styles.title}>Complete your profile</Text>
      <Text style={styles.subtitle}>
        {remaining} {remaining === 1 ? 'thing' : 'things'} left:{' '}
        {missing.join(', ')}
      </Text>
      <Text style={styles.cta}>Edit profile →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.cardLg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  pressed: pressedState,
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  cta: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.orange,
    marginTop: spacing.xs,
  },
});
