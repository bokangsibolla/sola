import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { mockConversations, mockUsers } from '@/data/mock';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function DMListScreen() {
  const router = useRouter();

  return (
    <AppScreen>
      <AppHeader title="Messages" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {mockConversations.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={32} color={colors.textMuted} />
            <Text style={styles.emptyText}>
              No conversations yet. Say hi to a fellow traveler.
            </Text>
          </View>
        ) : (
          mockConversations.map((convo) => {
            const user = mockUsers.find((u) => u.id === convo.withUserId);
            if (!user) return null;
            return (
              <Pressable
                key={convo.id}
                style={styles.row}
                onPress={() => router.push(`/home/dm/${convo.withUserId}`)}
              >
                {user.photoUrl ? (
                  <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Ionicons name="person" size={18} color={colors.textMuted} />
                  </View>
                )}
                <View style={styles.rowText}>
                  <View style={styles.rowTop}>
                    <Text style={styles.rowName}>{user.firstName}</Text>
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
          })
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: colors.borderDefault,
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
    borderRadius: 10,
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
