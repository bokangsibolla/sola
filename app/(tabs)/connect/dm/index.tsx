import { useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import AppScreen from '@/components/AppScreen';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { getConversationsPaginated, getProfileById, getBlockedUserIds } from '@/data/api';
import { useData } from '@/hooks/useData';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { useAuth } from '@/state/AuthContext';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import type { Conversation } from '@/data/types';
import { getImageUrl } from '@/lib/image';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function DMListScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const posthog = usePostHog();
  const { data: allConvos, loading, error, fetchMore, hasMore, isFetchingMore, refetch } = usePaginatedData({
    queryKey: ['conversations'],
    fetcher: (page) => getConversationsPaginated(page),
  });
  const { data: blockedIds } = useData(
    () => (userId ? getBlockedUserIds(userId) : Promise.resolve([])),
    [userId],
  );

  useEffect(() => {
    posthog.capture('messages_screen_viewed');
  }, [posthog]);

  const visibleConversations = allConvos.filter(
    (c) => !c.participantIds.some((pid) => (blockedIds ?? []).includes(pid)),
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;

  return (
    <AppScreen>
      <ScreenHeader title="Messages" />

      {visibleConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          {/* Warm photo with soft overlay */}
          <View style={styles.emptyImageWrapper}>
            <Image
              source={require('@/assets/images/solo-canyon-relax.jpg')}
              style={styles.emptyImage}
              contentFit="cover"
              transition={300}
            />
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.4)']}
              style={styles.emptyImageOverlay}
            />
          </View>

          {/* Warm copy */}
          <Text style={styles.emptyHeadline}>Your travel conversations</Text>
          <Text style={styles.emptySubtext}>
            Connect with fellow travelers heading your way
          </Text>

          {/* CTA to find travelers */}
          <Pressable
            style={styles.ctaButton}
            onPress={() => router.back()}
          >
            <Text style={styles.ctaText}>Find travelers</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={visibleConversations}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ConversationRow convo={item} userId={userId} />}
          onEndReached={() => { if (hasMore) fetchMore(); }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingMore ? <ActivityIndicator style={{ padding: 16 }} /> : null}
        />
      )}
    </AppScreen>
  );
}

function ConversationRow({ convo, userId }: { convo: Conversation; userId: string | null }) {
  const router = useRouter();
  const posthog = usePostHog();
  const otherId = convo.participantIds.find((pid) => pid !== userId);
  const { data: other } = useData(
    () => (otherId ? getProfileById(otherId) : Promise.resolve(null)),
    [otherId],
  );

  if (!other) return null;

  return (
    <Pressable
      style={styles.row}
      onPress={() => {
        posthog.capture('conversation_opened', { conversation_id: convo.id });
        router.push(`/connect/dm/${convo.id}`);
      }}
    >
      {other.avatarUrl ? (
        <Image source={{ uri: getImageUrl(other.avatarUrl, { width: 104, height: 104 }) ?? undefined }} style={styles.avatar} contentFit="cover" transition={200} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Ionicons name="person" size={20} color={colors.textMuted} />
        </View>
      )}
      <View style={styles.rowText}>
        <View style={styles.rowTop}>
          <Text style={styles.rowName}>{other.firstName}</Text>
          <Text style={styles.rowTime}>{timeAgo(convo.lastMessageAt)}</Text>
        </View>
        <Text
          style={[styles.rowMessage, convo.unreadCount > 0 && styles.rowMessageUnread]}
          numberOfLines={1}
        >
          {convo.lastMessage}
        </Text>
      </View>
      {convo.unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{convo.unreadCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  /* ── Empty state ── */
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyImageWrapper: {
    width: 200,
    height: 200,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  emptyImage: {
    width: '100%',
    height: '100%',
  },
  emptyImageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  emptyHeadline: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  ctaButton: {
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
  },
  ctaText: {
    ...typography.button,
    color: colors.background,
  },

  /* ── Conversation rows ── */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  rowName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  rowTime: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  rowMessage: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  rowMessageUnread: {
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  badge: {
    backgroundColor: colors.orange,
    borderRadius: radius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    paddingHorizontal: 6,
  },
  badgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.background,
  },
});
