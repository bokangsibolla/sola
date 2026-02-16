import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';
import type { CommunityHighlightThreadVisual } from '@/data/home/types';

interface CommunityCardsProps {
  threads: CommunityHighlightThreadVisual[];
}

const CARD_WIDTH = 280;
const IMAGE_HEIGHT = 160;

export function CommunityCards({ threads }: CommunityCardsProps) {
  const router = useRouter();

  if (threads.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>From the community</Text>
        <Pressable onPress={() => router.push('/(tabs)/connect' as any)} hitSlop={8}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {threads.map((thread) =>
          thread.cityImageUrl ? (
            <Pressable
              key={thread.id}
              style={({ pressed }) => [
                styles.imageCard,
                pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
              ]}
              onPress={() => router.push(`/(tabs)/connect/thread/${thread.id}` as any)}
            >
              <Image
                source={{ uri: thread.cityImageUrl }}
                style={styles.image}
                contentFit="cover"
                transition={200}
              />
              <LinearGradient
                colors={['transparent', colors.overlayMedium]}
                style={styles.gradient}
              />
              <View style={styles.imageOverlay}>
                <Text style={styles.imageTitle} numberOfLines={2}>
                  {thread.title}
                </Text>
                <View style={styles.imageMetaRow}>
                  <Feather name="message-circle" size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.imageReplyCount}>
                    {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
                  </Text>
                </View>
              </View>
            </Pressable>
          ) : (
            <Pressable
              key={thread.id}
              style={({ pressed }) => [
                styles.textCard,
                pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
              ]}
              onPress={() => router.push(`/(tabs)/connect/thread/${thread.id}` as any)}
            >
              <Text style={styles.textTitle} numberOfLines={3}>
                {thread.title}
              </Text>
              <View style={styles.textMetaRow}>
                <Text style={styles.textAuthor} numberOfLines={1}>
                  {thread.author.firstName}
                </Text>
                <Text style={styles.textDot}>&middot;</Text>
                <Feather name="message-circle" size={12} color={colors.textMuted} />
                <Text style={styles.textReplyCount}>{thread.replyCount}</Text>
              </View>
            </Pressable>
          ),
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
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
  scrollContent: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.md,
  },

  // ── Image card ─────────────────────────────────────────────────────────
  imageCard: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.neutralFill,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  imageTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.background,
    marginBottom: spacing.xs,
  },
  imageMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  imageReplyCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.8)',
  },

  // ── Text card (no image) ──────────────────────────────────────────────
  textCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  textTitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  textMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  textAuthor: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
    maxWidth: 100,
  },
  textDot: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },
  textReplyCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },
});
