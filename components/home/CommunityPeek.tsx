import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  colors,
  elevation,
  fonts,
  radius,
  spacing,
  pressedState,
} from '@/constants/design';
import { SectionHeader } from './SectionHeader';
import type { CommunityHighlightThreadVisual } from '@/data/home/types';

interface CommunityPeekProps {
  threads: CommunityHighlightThreadVisual[];
}

export function CommunityPeek({ threads }: CommunityPeekProps) {
  const router = useRouter();

  if (threads.length === 0) return null;

  // Show max 2 threads
  const visibleThreads = threads.slice(0, 2);

  return (
    <View style={styles.container}>
      <SectionHeader
        title="From the Community"
        onSeeAll={() => router.push('/(tabs)/connect' as any)}
      />

      <View style={styles.cards}>
        {visibleThreads.map((thread) => (
          <Pressable
            key={thread.id}
            style={({ pressed }) => [
              styles.card,
              pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
            ]}
            onPress={() => router.push(`/(tabs)/connect/thread/${thread.id}` as any)}
          >
            <Text style={styles.threadTitle} numberOfLines={2}>
              {thread.title}
            </Text>
            <View style={styles.metaRow}>
              {thread.cityName && (
                <>
                  <View style={styles.destinationTag}>
                    <Text style={styles.destinationTagText}>{thread.cityName}</Text>
                  </View>
                  <Text style={styles.dot}>&middot;</Text>
                </>
              )}
              <Text style={styles.replyCount}>
                {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  cards: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.module,
    padding: spacing.moduleInset,
    ...elevation.sm,
  },
  threadTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  destinationTag: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  destinationTagText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  dot: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  replyCount: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});
