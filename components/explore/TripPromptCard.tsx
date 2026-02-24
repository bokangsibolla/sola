import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius } from '@/constants/design';

interface TripPromptCardProps {
  onDismiss: () => void;
}

export function TripPromptCard({ onDismiss }: TripPromptCardProps) {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Travelling soon?</Text>
        <Pressable onPress={onDismiss} hitSlop={8} style={styles.closeButton}>
          <Feather name="x" size={16} color={colors.textMuted} />
        </Pressable>
      </View>

      <Text style={styles.body}>
        Log your trip to unlock Travelling Mode — your feed adapts to show local tips, saved
        places, and community for wherever you're headed.
      </Text>

      <Pressable
        onPress={() => router.push('/(tabs)/trips/new' as any)}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
      >
        <Text style={styles.ctaText}>Log a trip</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginHorizontal: spacing.screenX,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  cta: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: radius.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  ctaPressed: {
    opacity: 0.9,
  },
  ctaText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.orange,
  },
});
