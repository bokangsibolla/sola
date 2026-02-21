import React, { useState } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/constants/design';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import { getProfileById } from '@/data/api';
import { getImageUrl } from '@/lib/image';
import { useUnreadIndicator } from '@/data/notifications/useUnreadIndicator';
import { MenuSheet } from '@/components/MenuSheet';

const AVATAR_SIZE = 32;
const TOUCH_TARGET = 44; // meets 44pt minimum

export default function AvatarButton() {
  const { userId } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const hasUnread = useUnreadIndicator();

  const { data: profile } = useData(
    () => (userId ? getProfileById(userId) : Promise.resolve(null)),
    [userId],
  );

  return (
    <>
      <Pressable
        onPress={() => setMenuVisible(true)}
        hitSlop={spacing.sm}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel={hasUnread ? 'Menu, new activity' : 'Menu'}
      >
        {profile?.avatarUrl ? (
          <Image
            source={{
              uri: getImageUrl(profile.avatarUrl, { width: AVATAR_SIZE * 2, height: AVATAR_SIZE * 2 }) ?? undefined,
            }}
            style={styles.avatar}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.avatar, styles.placeholder]}>
            <Ionicons name="person" size={spacing.lg} color={colors.textMuted} />
          </View>
        )}
        {hasUnread && <View style={styles.dot} />}
      </Pressable>

      <MenuSheet visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.neutralFill,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: spacing.xs,
    backgroundColor: colors.orange,
    borderWidth: 2,
    borderColor: colors.background,
  },
});
