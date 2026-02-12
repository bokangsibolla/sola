import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius } from '@/constants/design';

interface InboxPreviewProps {
  conversationId: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  participantIds: string[];
  totalUnread: number;
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

const InboxPreview: React.FC<InboxPreviewProps> = ({
  conversationId,
  lastMessage,
  lastMessageAt,
  unreadCount,
  participantIds,
  totalUnread,
}) => {
  const router = useRouter();
  const handleSeeAll = () => {
    router.push('/connect/dm' as any);
  };

  const handleTapRow = () => {
    router.push('/connect/dm' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.divider} />

      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Messages</Text>
        <Pressable onPress={handleSeeAll} hitSlop={8}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>

      <Pressable onPress={handleTapRow} style={styles.row}>
        <View style={styles.avatar}>
          <Feather name="user" size={18} color={colors.textMuted} />
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.newMessage}>New message</Text>
            <View style={styles.rightContent}>
              <Text style={styles.time}>{timeAgo(lastMessageAt)}</Text>
              {unreadCount > 0 && <View style={styles.unreadDot} />}
            </View>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMessage}
          </Text>
        </View>
      </Pressable>

      {totalUnread > 1 && (
        <View style={styles.moreUnreadContainer}>
          <Text style={styles.moreUnread}>
            {totalUnread - 1} more unread
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutralFill,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.screenX,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  newMessage: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.orange,
    marginLeft: spacing.xs,
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  moreUnreadContainer: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.xs,
  },
  moreUnread: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.orange,
  },
});

export default InboxPreview;
