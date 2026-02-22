import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/constants/design';
import { useUnreadIndicator } from '@/data/notifications/useUnreadIndicator';
import { MenuSheet } from '@/components/MenuSheet';

const TOUCH_TARGET = 44;
const ICON_SIZE = 24;
const DOT_SIZE = 8;

export function HamburgerButton() {
  const [menuVisible, setMenuVisible] = useState(false);
  const hasUnread = useUnreadIndicator();

  return (
    <>
      <Pressable
        onPress={() => setMenuVisible(true)}
        hitSlop={spacing.sm}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel={hasUnread ? 'Menu, new activity' : 'Menu'}
      >
        <Ionicons name="menu" size={ICON_SIZE} color={colors.textPrimary} />
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
  dot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.orange,
    borderWidth: 2,
    borderColor: colors.background,
  },
});
