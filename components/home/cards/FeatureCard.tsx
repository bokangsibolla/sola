import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

interface FeatureCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  headline: string;
  description: string;
  route: string;
}

export function FeatureCard({ icon, headline, description, route }: FeatureCardProps) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(route as any)}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color={colors.orange} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.description} numberOfLines={1}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.cardLg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  pressed: pressedState,
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  headline: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
