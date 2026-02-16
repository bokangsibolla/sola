import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, radius } from '@/constants/design';
import { useUnreadIndicator } from '@/data/notifications/useUnreadIndicator';

export default function NotificationButton() {
  const router = useRouter();
  const hasUnread = useUnreadIndicator();

  return (
    <Pressable
      onPress={() => router.push('/home/notifications' as any)}
      hitSlop={12}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={hasUnread ? 'Notifications, new activity' : 'Notifications'}
    >
      <Feather name="bell" size={20} color={colors.textPrimary} />
      {hasUnread && <View style={styles.dot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.orange,
  },
});
