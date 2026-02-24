import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

interface NudgeCardProps {
  type: 'interests_nudge' | 'first_trip_nudge';
}

const NUDGE_CONFIG = {
  interests_nudge: {
    title: 'What kind of traveler are you?',
    subtitle:
      'Pick your interests so we can personalise your experience',
    cta: 'Choose interests',
    route: '/(tabs)/home/edit-profile',
    icon: 'heart-outline' as const,
    storageKey: '@sola:dismissed_interests_nudge',
  },
  first_trip_nudge: {
    title: 'Plan your first trip',
    subtitle:
      'Start dreaming — even a rough idea helps us find the right places for you',
    cta: 'Create a trip',
    route: '/(tabs)/trips',
    icon: 'airplane-outline' as const,
    storageKey: '@sola:dismissed_first_trip_nudge',
  },
};

export function NudgeCard({ type }: NudgeCardProps) {
  const router = useRouter();
  const config = NUDGE_CONFIG[type];
  const [dismissed, setDismissed] = useState(true); // Start hidden until we check

  useEffect(() => {
    AsyncStorage.getItem(config.storageKey).then((val) => {
      if (!val) {
        setDismissed(false);
        return;
      }
      const expiry = parseInt(val, 10);
      if (Date.now() > expiry) setDismissed(false);
    });
  }, [config.storageKey]);

  const dismiss = useCallback(() => {
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    AsyncStorage.setItem(config.storageKey, String(Date.now() + sevenDays));
    setDismissed(true);
  }, [config.storageKey]);

  if (dismissed) return null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(config.route as any)}
    >
      <View style={styles.header}>
        <Ionicons name={config.icon} size={20} color={colors.orange} />
        <Pressable onPress={dismiss} hitSlop={8}>
          <Ionicons name="close" size={18} color={colors.textMuted} />
        </Pressable>
      </View>
      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.subtitle}>{config.subtitle}</Text>
      <Text style={styles.cta}>{config.cta} →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.cardLg,
    padding: spacing.lg,
  },
  pressed: pressedState,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  cta: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.orange,
    marginTop: spacing.md,
  },
});
