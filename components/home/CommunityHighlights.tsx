import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';

interface CommunityHighlightsProps {
  highlights: Array<{
    id: string;
    title: string;
    body: string;
    replyCount: number;
    createdAt: string;
    authorName: string;
    authorType: string;
    cityName: string | null;
    countryName: string | null;
    cityImageUrl: string | null;
  }>;
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

const CommunityHighlights: React.FC<CommunityHighlightsProps> = ({ highlights }) => {
  const router = useRouter();
  const handleSeeAll = () => {
    router.push('/(tabs)/connect' as any);
  };

  const handleThreadPress = (id: string) => {
    router.push(`/(tabs)/connect/thread/${id}` as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>From the Community</Text>
        <Pressable onPress={handleSeeAll} hitSlop={8}>
          <Text style={styles.seeAll}>See more</Text>
        </Pressable>
      </View>

      {highlights.map((thread, index) => (
        <View key={thread.id}>
          <Pressable
            onPress={() => handleThreadPress(thread.id)}
            style={({ pressed }) => [
              styles.threadRow,
              pressed && { opacity: pressedState.opacity },
            ]}
          >
            <View style={styles.threadContent}>
              {/* Author + time */}
              <View style={styles.meta}>
                <View style={styles.authorRow}>
                  <Text style={styles.authorName}>{thread.authorName}</Text>
                  {thread.authorType === 'system' && (
                    <View style={styles.teamBadge}>
                      <Text style={styles.teamBadgeText}>TEAM</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.time}>{timeAgo(thread.createdAt)}</Text>
              </View>

              {/* Title */}
              <Text style={styles.title} numberOfLines={2}>
                {thread.title}
              </Text>

              {/* Body preview */}
              {thread.body.length > 0 && (
                <Text style={styles.body} numberOfLines={2}>
                  {thread.body}
                </Text>
              )}

              {/* Footer: replies + location */}
              <View style={styles.footer}>
                <Feather
                  name="message-circle"
                  size={12}
                  color={thread.replyCount > 0 ? colors.orange : colors.textMuted}
                />
                <Text style={[
                  styles.replyCount,
                  thread.replyCount > 0 && { color: colors.orange },
                ]}>
                  {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
                </Text>
                {(thread.cityName || thread.countryName) && (
                  <>
                    <Text style={styles.footerDot}>&middot;</Text>
                    <Feather name="map-pin" size={11} color={colors.textMuted} />
                    <Text style={styles.locationText}>
                      {thread.cityName || thread.countryName}
                    </Text>
                  </>
                )}
              </View>
            </View>

            {/* City image thumbnail */}
            {thread.cityImageUrl && (
              <Image
                source={{ uri: thread.cityImageUrl }}
                style={styles.thumbnail}
                contentFit="cover"
                transition={200}
              />
            )}
          </Pressable>

          {index < highlights.length - 1 && <View style={styles.threadDivider} />}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.orange,
  },
  threadRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
  },
  threadContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
  },
  teamBadge: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  teamBadgeText: {
    fontSize: 9,
    fontFamily: fonts.semiBold,
    color: colors.orange,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  time: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  title: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  body: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyCount: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  footerDot: {
    fontSize: 12,
    color: colors.textMuted,
    marginHorizontal: 2,
  },
  locationText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: radius.card,
    alignSelf: 'center',
  },
  threadDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutralFill,
  },
});

export default CommunityHighlights;
