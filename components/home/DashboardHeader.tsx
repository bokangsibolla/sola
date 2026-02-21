import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  colors,
  elevation,
  fonts,
  radius,
  spacing,
  typography,
  pressedState,
} from '@/constants/design';
import type { HeroState } from '@/data/home/types';

interface DashboardHeaderProps {
  firstName: string | null;
  heroState: HeroState;
  savedCount: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getContextualLine(hero: HeroState, savedCount: number): string {
  if (hero.kind === 'active') {
    const city = hero.trip.destinationName;
    const arriving = hero.trip.arriving;
    const leaving = hero.trip.leaving;
    if (arriving && leaving) {
      const now = new Date();
      const start = new Date(arriving);
      const end = new Date(leaving);
      const totalDays = Math.max(
        1,
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
      );
      const currentDay = Math.min(
        totalDays,
        Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))),
      );
      return `You\u2019re in ${city} \u2014 Day ${currentDay} of ${totalDays}`;
    }
    return `You\u2019re in ${city}`;
  }

  if (hero.kind === 'upcoming') {
    const city = hero.trip.destinationName;
    const arriving = hero.trip.arriving;
    if (arriving) {
      const days = Math.ceil(
        (new Date(arriving).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );
      if (days > 0) {
        return `Your trip to ${city} starts in ${days} ${days === 1 ? 'day' : 'days'}`;
      }
    }
    return `Your trip to ${city} is coming up`;
  }

  if (savedCount > 0) {
    return `${savedCount} ${savedCount === 1 ? 'place' : 'places'} on your shortlist`;
  }

  return 'Ready to plan your next escape?';
}

export function DashboardHeader({ firstName, heroState, savedCount }: DashboardHeaderProps) {
  const router = useRouter();
  const greeting = getGreeting();
  const greetingText = firstName ? `${greeting}, ${firstName}` : greeting;
  const contextual = getContextualLine(heroState, savedCount);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{greetingText}</Text>
      <Text style={styles.contextual}>{contextual}</Text>

      <Pressable
        style={({ pressed }) => [styles.searchInput, pressed && styles.searchPressed]}
        onPress={() => router.push('/discover/search')}
        accessibilityRole="button"
        accessibilityLabel="Search destinations"
      >
        <Feather name="search" size={16} color={colors.textMuted} />
        <Text style={styles.searchPlaceholder}>Where to next?</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.greeting,
    color: colors.textPrimary,
  },
  contextual: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.sm,
    ...elevation.md,
  },
  searchPlaceholder: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  searchPressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },
});
