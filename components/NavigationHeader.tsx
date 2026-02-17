import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { NavCrumb } from '@/hooks/useNavContext';
import { colors, fonts, spacing } from '@/constants/design';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NavigationHeaderProps {
  /** Page title — shown centered on push/modal screens, hidden on tab roots */
  title: string;

  /** Presence of parentTitle triggers back arrow. Omit for tab roots. */
  parentTitle?: string;

  /** Back handler — defaults to router.back() */
  onBack?: () => void;

  /** Kept for useNavContext compatibility — not rendered visually */
  ancestors?: NavCrumb[];

  /** 'standard' (default) | 'modal' (close button, no back arrow) */
  variant?: 'standard' | 'modal';

  /** Right-side action buttons (notification bell, menu, etc.) */
  rightActions?: React.ReactNode;

  /** @deprecated No longer rendered — kept for API compat */
  showContext?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  title,
  parentTitle,
  onBack,
  variant = 'standard',
  rightActions,
}) => {
  const router = useRouter();

  const isRoot = !parentTitle && variant === 'standard';
  const isModal = variant === 'modal';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  // ── Tab root: Logo ... [actions] ──────────────────────────────
  if (isRoot) {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <Image
            source={require('@/assets/images/sola-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <View style={styles.actionsRight}>{rightActions}</View>
        </View>
      </View>
    );
  }

  // ── Push / Modal: [←] ... centered title ... [actions] ────────
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Left: back or close */}
        {isModal ? (
          <Pressable
            onPress={handleBack}
            style={styles.navButton}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={22} color={colors.textPrimary} />
          </Pressable>
        ) : (
          <Pressable
            onPress={handleBack}
            style={styles.navButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
        )}

        {/* Center: title (absolutely positioned for true centering) */}
        <View style={styles.titleContainer} pointerEvents="none">
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Right: actions */}
        <View style={styles.actionsRight}>{rightActions}</View>
      </View>
    </View>
  );
};

export default React.memo(NavigationHeader);

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  logo: {
    height: 22,
    width: 76,
  },

  // ── Nav button (back / close) ──────────────────────────────
  navButton: {
    width: 36,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  // ── Centered title ─────────────────────────────────────────
  titleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 56,
    zIndex: 1,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 17,
    lineHeight: 22,
    color: colors.textPrimary,
  },

  // ── Right actions ──────────────────────────────────────────
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    zIndex: 2,
  },
});
