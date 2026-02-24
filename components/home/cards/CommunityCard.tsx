import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import { fetchCommunityHighlightsVisual } from '@/data/home/homeApi';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

export function CommunityCard() {
  const router = useRouter();
  const { userId } = useAuth();

  const { data: threads } = useData(
    () =>
      userId
        ? fetchCommunityHighlightsVisual(userId, 1)
        : Promise.resolve([]),
    [userId, 'home-community-card'],
  );

  const thread = threads?.[0];
  if (!thread) return null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() =>
        router.push(`/(tabs)/discussions/thread/${thread.id}` as any)
      }
    >
      <Text style={styles.label}>From the community</Text>
      <Text style={styles.title} numberOfLines={2}>
        {thread.title}
      </Text>
      <View style={styles.meta}>
        <Text style={styles.metaText}>
          {thread.replyCount ?? 0}{' '}
          {(thread.replyCount ?? 0) === 1 ? 'reply' : 'replies'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.cardLg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  pressed: pressedState,
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  meta: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  metaText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
});
