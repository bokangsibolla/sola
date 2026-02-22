import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  colors,
  fonts,
  radius,
  spacing,
  pressedState,
} from '@/constants/design';
import { SectionHeader } from './SectionHeader';
import type { CommunityHighlightThreadVisual } from '@/data/home/types';

interface CommunityPeekProps {
  threads: CommunityHighlightThreadVisual[];
  title?: string;
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function getInitial(name: string): string {
  return (name.charAt(0) || '?').toUpperCase();
}

export function CommunityPeek({ threads, title }: CommunityPeekProps) {
  const router = useRouter();

  if (threads.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <SectionHeader
        title={title ?? 'From the community'}
        onSeeAll={() => router.push('/(tabs)/connect' as any)}
      />
      <View style={styles.list}>
        {threads.map((thread, index) => (
          <React.Fragment key={thread.id}>
            {index > 0 && <View style={styles.divider} />}
            <Pressable
              style={({ pressed }) => [
                styles.row,
                pressed && { opacity: pressedState.opacity },
              ]}
              onPress={() => router.push(`/(tabs)/connect/thread/${thread.id}` as any)}
            >
              {/* Avatar */}
              {thread.author.avatarUrl ? (
                <Image
                  source={{ uri: thread.author.avatarUrl }}
                  style={styles.avatar}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <SolaText style={styles.avatarInitial}>
                    {getInitial(thread.author.firstName)}
                  </SolaText>
                </View>
              )}

              {/* Middle content */}
              <View style={styles.content}>
                <SolaText style={styles.title} numberOfLines={2}>
                  {thread.title}
                </SolaText>
                <View style={styles.meta}>
                  {thread.cityName && (
                    <View style={styles.cityPill}>
                      <SolaText style={styles.cityText}>{thread.cityName}</SolaText>
                    </View>
                  )}
                  {thread.cityName && <SolaText style={styles.dot}>{'\u00B7'}</SolaText>}
                  <SolaText style={styles.timeText}>
                    {getRelativeTime(thread.createdAt)}
                  </SolaText>
                </View>
              </View>

              {/* Reply count */}
              <SolaText style={styles.replyCount}>
                {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
              </SolaText>
            </Pressable>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const AVATAR_SIZE = 32;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.xxl,
  },
  list: {
    paddingHorizontal: spacing.screenX,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarFallback: {
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.orange,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  cityPill: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  cityText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  dot: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  timeText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },
  replyCount: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
