import React, { useState } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MenuSheet } from '@/components/MenuSheet';
import { colors, radius } from '@/constants/design';

interface MenuButtonProps {
  unreadCount?: number;
}

export default function MenuButton({ unreadCount }: MenuButtonProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        hitSlop={12}
        style={styles.container}
        accessibilityRole="button"
        accessibilityLabel="Menu"
      >
        <Feather name="menu" size={22} color={colors.textPrimary} />
        {(unreadCount ?? 0) > 0 && <View style={styles.badge} />}
      </Pressable>
      <MenuSheet
        visible={visible}
        onClose={() => setVisible(false)}
        unreadCount={unreadCount}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.orange,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
});
