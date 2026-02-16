import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';
import type { CommunityHighlightThread } from '@/data/home/types';

interface CommunityHighlightProps {
  threads: CommunityHighlightThread[];
}

export function CommunityHighlight({ threads }: CommunityHighlightProps) {
  const router = useRouter();

  if (threads.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>From the community</Text>
        <Pressable onPress={() => router.push('/(tabs)/connect')} hitSlop={8}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>

      {threads.map((thread) => (
        <Pressable
          key={thread.id}
          style={({ pressed }) => [
            styles.threadCard,
            pressed && { opacity: pressedState.opacity },
          ]}
          onPress={() => router.push(`/(tabs)/connect/thread/${thread.id}` as any)}
        >
          <View style={styles.threadContent}>
            <Text style={styles.threadTitle} numberOfLines={2}>
              {thread.title}
            </Text>
            <View style={styles.threadMeta}>
              {thread.author.avatarUrl ? (
                <Image
                  source={{ uri: thread.author.avatarUrl }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Feather name="user" size={10} color={colors.textMuted} />
                </View>
              )}
              <Text style={styles.authorName} numberOfLines={1}>
                {thread.author.firstName}
              </Text>
              <Text style={styles.dot}>&middot;</Text>
              <Feather name="message-circle" size={12} color={colors.textMuted} />
              <Text style={styles.replyCount}>{thread.replyCount}</Text>
              {(thread.topicLabel || thread.cityName) && (
                <>
                  <Text style={styles.dot}>&middot;</Text>
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>
                      {thread.topicLabel || thread.cityName}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
    color: colors.textPrimary,
  },
  seeAll: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.orange,
  },
  threadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    gap: spacing.sm,
  },
  threadContent: {
    flex: 1,
  },
  threadTitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  threadMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  avatar: {
    width: 18,
    height: 18,
    borderRadius: radius.full,
  },
  avatarPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
    maxWidth: 80,
  },
  dot: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },
  replyCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },
  pill: {
    backgroundColor: colors.neutralFill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  pillText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textSecondary,
  },
});
