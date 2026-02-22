import React from 'react';
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, fonts } from '@/constants/design';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MenuSheetProps {
  visible: boolean;
  onClose: () => void;
  unreadCount?: number;
}

interface MenuItem {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  route: string;
  showDot?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MenuSheet({ visible, onClose, unreadCount = 0 }: MenuSheetProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const menuItems: MenuItem[] = [
    {
      label: 'Messages',
      icon: 'message-circle',
      route: '/connect/dm',
      showDot: unreadCount > 0,
    },
    { label: 'Profile', icon: 'user', route: '/home/profile' },
    { label: 'Saved Places', icon: 'bookmark', route: '/home/profile' },
    { label: 'Safety Info', icon: 'shield', route: '/home/sos' },
    { label: 'Settings', icon: 'settings', route: '/home/settings' },
  ];

  const handlePress = (route: string) => {
    onClose();
    router.push(route as any);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.container, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />

          {menuItems.map((item) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => handlePress(item.route)}
            >
              <View style={styles.iconCircle}>
                <Feather name={item.icon} size={18} color={colors.textPrimary} />
                {item.showDot && <View style={styles.dot} />}
              </View>
              <SolaText style={styles.rowLabel}>{item.label}</SolaText>
              <Feather name="chevron-right" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}
// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.xl,
    borderTopRightRadius: spacing.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.screenX,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: radius.xs,
    backgroundColor: colors.borderDefault,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  rowPressed: {
    opacity: 0.7,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.orange,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textPrimary,
  },
});
