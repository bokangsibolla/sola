import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';
import { formatTimeAgo } from '@/utils/timeAgo';
import type { Notification } from '@/data/notifications/types';

interface NotificationRowProps {
  notification: Notification;
}

function getActorInitial(notification: Notification): string {
  if (notification.type === 'admin_announcement') return 'S';
  return notification.actor?.firstName?.charAt(0).toUpperCase() ?? '?';
}

export function NotificationRow({ notification }: NotificationRowProps) {
  const router = useRouter();
  const isAdmin = notification.type === 'admin_announcement';
  const actorName = isAdmin ? 'Sola' : (notification.actor?.firstName ?? 'Someone');

  const handlePress = () => {
    if (!notification.targetType || !notification.targetId) return;

    switch (notification.targetType) {
      case 'thread':
        router.push(`/(tabs)/connect/thread/${notification.targetId}` as any);
        break;
      case 'conversation':
        router.push(`/(tabs)/connect/dm/${notification.targetId}` as any);
        break;
      case 'profile':
        router.push(`/connect/user/${notification.targetId}` as any);
        break;
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        !notification.isRead && styles.unread,
        pressed && { opacity: pressedState.opacity },
      ]}
    >
      {/* Avatar */}
      {isAdmin ? (
        <View style={[styles.avatar, styles.avatarAdmin]}>
          <SolaText style={styles.avatarAdminText}>S</SolaText>
        </View>
      ) : notification.actor?.avatarUrl ? (
        <Image
          source={{ uri: notification.actor.avatarUrl }}
          style={styles.avatar}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <SolaText style={styles.avatarFallbackText}>
            {getActorInitial(notification)}
          </SolaText>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <SolaText style={styles.title} numberOfLines={2}>
          <SolaText style={styles.actorName}>{actorName}</SolaText>
          {' '}
          {notification.title}
        </SolaText>
        {notification.body && (
          <SolaText variant="caption" numberOfLines={1} style={styles.bodySpacing}>
            {notification.body}
          </SolaText>
        )}
        <SolaText style={styles.time}>{formatTimeAgo(notification.createdAt)}</SolaText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.screenX,
    gap: spacing.md,
  },
  unread: {
    backgroundColor: colors.orangeFill,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.neutralFill,
  },
  avatarAdmin: {
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarAdminText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.orangeFill,
  },
  avatarFallbackText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.orange,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  actorName: {
    fontFamily: fonts.semiBold,
  },
  bodySpacing: {
    marginTop: 2,
  },
  time: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
