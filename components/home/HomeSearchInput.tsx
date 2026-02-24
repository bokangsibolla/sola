import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  colors,
  fonts,
  radius,
  spacing,
  typography,
  pressedState,
} from '@/constants/design';
import type { HeroState } from '@/data/home/types';
import type { SearchChip } from '@/data/home/sectionTypes';

interface HomeSearchInputProps {
  chips: SearchChip[];
  firstName: string | null;
  heroState: HeroState;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getSubline(hero: HeroState): string | null {
  if (hero.kind === 'active') {
    return `You\u2019re in ${hero.trip.destinationName}`;
  }
  if (hero.kind === 'upcoming') {
    return `${hero.trip.destinationName} is waiting for you`;
  }
  return null;
}

export function HomeSearchInput({ chips, firstName, heroState }: HomeSearchInputProps) {
  const router = useRouter();
  const greeting = getGreeting();
  const greetingText = firstName ? `${greeting}, ${firstName}` : greeting;
  const subline = getSubline(heroState);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{greetingText}</Text>
      {subline && <Text style={styles.subline}>{subline}</Text>}

      <Pressable
        style={({ pressed }) => [styles.searchPill, pressed && styles.searchPressed]}
        onPress={() => router.push('/(tabs)/discover/search' as any)}
        accessibilityRole="button"
        accessibilityLabel="Search destinations"
      >
        <Feather name="search" size={16} color={colors.textMuted} />
        <Text style={styles.searchPlaceholder}>Where to next?</Text>
      </Pressable>

      {chips.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContent}
          style={styles.chipsRow}
        >
          {chips.map((chip) => (
            <Pressable
              key={chip.id}
              style={({ pressed }) => [
                styles.chip,
                pressed && { opacity: pressedState.opacity },
              ]}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/discover/search',
                  params: { tag: chip.value },
                } as any)
              }
            >
              <Text style={styles.chipText}>{chip.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.greeting,
    color: colors.textPrimary,
  },
  subline: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
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
  chipsRow: {
    marginTop: spacing.md,
    marginHorizontal: -spacing.screenX,
  },
  chipsContent: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});
