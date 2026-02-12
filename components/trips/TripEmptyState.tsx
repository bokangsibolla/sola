import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';

interface TripEmptyStateProps {
  onPress: () => void;
}

const DASHBOARD_SECTIONS = [
  {
    label: 'ACTIVE TRIP',
    hint: 'Your current trip appears here while you travel',
  },
  {
    label: 'JOURNAL',
    hint: 'A private log of moments, moods, and tips from the road',
  },
  {
    label: 'PAST TRIPS',
    hint: 'Every trip you\'ve taken, kept in one place',
  },
];

export default function TripEmptyState({ onPress }: TripEmptyStateProps) {
  return (
    <View style={styles.container}>
      {/* Hero card */}
      <Pressable
        style={({ pressed }) => [styles.card, pressed && { opacity: pressedState.opacity }]}
        onPress={onPress}
      >
        <Image
          source={require('@/assets/images/pexels-driving.png')}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)']}
          style={styles.gradient}
        />
        <View style={styles.content}>
          <Text style={styles.heading}>Plan your first trip</Text>
          <View style={styles.action}>
            <Text style={styles.actionText}>Start planning</Text>
            <Feather name="arrow-right" size={14} color={colors.orange} />
          </View>
        </View>
      </Pressable>

      {/* Dashboard preview — shows the structure of what this page becomes */}
      {DASHBOARD_SECTIONS.map((section) => (
        <Pressable
          key={section.label}
          style={({ pressed }) => [styles.section, pressed && { opacity: pressedState.opacity }]}
          onPress={onPress}
        >
          <Text style={styles.sectionLabel}>{section.label}</Text>
          <Text style={styles.sectionHint}>{section.hint}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── Hero card ──
  card: {
    height: 220,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  heading: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.orange,
  },

  // ── Dashboard section previews ──
  section: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.5,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  sectionHint: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});
