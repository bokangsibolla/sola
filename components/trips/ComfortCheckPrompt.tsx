import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, radius, fonts } from '@/constants/design';
import { createTripEntry } from '@/data/trips/tripApi';
import { useAuth } from '@/state/AuthContext';
import type { MoodTag } from '@/data/trips/types';

const MOODS: { tag: MoodTag; emoji: string; label: string }[] = [
  { tag: 'calm', emoji: '\u{1F60C}', label: 'Calm' },
  { tag: 'happy', emoji: '\u{1F60A}', label: 'Happy' },
  { tag: 'uneasy', emoji: '\u{1F61F}', label: 'Uneasy' },
  { tag: 'unsafe', emoji: '\u{1F630}', label: 'Unsafe' },
];

interface ComfortCheckPromptProps {
  tripId: string;
  onLogged: () => void;
}

export const ComfortCheckPrompt: React.FC<ComfortCheckPromptProps> = ({
  tripId,
  onLogged,
}) => {
  const { userId } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [logging, setLogging] = useState(false);

  if (dismissed || !userId) return null;

  const handleMood = async (mood: MoodTag) => {
    if (logging) return;
    setLogging(true);
    try {
      await createTripEntry(userId, {
        tripId,
        entryType: 'comfort_check',
        moodTag: mood,
        title: `Feeling ${mood}`,
        visibility: 'private',
      });
      setDismissed(true);
      onLogged();
    } finally {
      setLogging(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>How are you feeling?</Text>
      <View style={styles.moodRow}>
        {MOODS.map(({ tag, emoji, label }) => (
          <Pressable
            key={tag}
            onPress={() => handleMood(tag)}
            style={({ pressed }) => [
              styles.moodButton,
              pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
            ]}
            disabled={logging}
          >
            <Text style={styles.moodEmoji}>{emoji}</Text>
            <Text style={styles.moodLabel}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={() => setDismissed(true)} hitSlop={12}>
        <Text style={styles.dismiss}>Not now</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.screenX,
    marginVertical: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.orangeFill,
    borderRadius: radius.module,
    alignItems: 'center',
  },
  question: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  moodRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  moodButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.card,
    backgroundColor: colors.background,
    minWidth: 64,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  moodLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  dismiss: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
});
