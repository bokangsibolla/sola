import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { NavCrumb } from '@/hooks/useNavContext';
import { colors, fonts, spacing } from '@/constants/design';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NavigationHeaderProps {
  /** Page title — shown on tab roots (left-aligned) and push screens (centered) */
  title: string;

  /** When true, show Sola logo instead of title on root screens (Home tab) */
  showLogo?: boolean;

  /** Presence of parentTitle triggers back arrow. Omit for tab roots. */
  parentTitle?: string;

  /** Back handler — defaults to router.back() */
  onBack?: () => void;

  /** Kept for useNavContext compatibility — not rendered visually */
  ancestors?: NavCrumb[];

  /** 'standard' (default) | 'modal' (close button, no back arrow) */
  variant?: 'standard' | 'modal';

  /** Right-side action buttons (AvatarButton, etc.) */
  rightActions?: React.ReactNode;

  /** @deprecated No longer rendered — kept for API compat */
  showContext?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  title,
  showLogo,
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

  // ── Tab root ────────────────────────────────────────────────────
  // showLogo: [Logo] ........... [rightActions]
  // no logo:  [Title]  ........  [rightActions]
  if (isRoot) {
    return (
      <View style={styles.container}>
        <View style={styles.rootRow}>
          {showLogo ? (
            <Image
              source={require('@/assets/images/sola-logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
          ) : (
            <SolaText variant="tabRootTitle">{title}</SolaText>
          )}
          <View style={styles.actionsRight}>{rightActions}</View>
        </View>
      </View>
    );
  }

  // ── Push / Modal: [←] ... centered title ... [actions] ────────
  return (
    <View style={styles.container}>
      <View style={styles.pushRow}>
        {/* Left: back or close */}
        {isModal ? (
          <Pressable
            onPress={handleBack}
            style={styles.navButton}
            hitSlop={spacing.md}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={NAV_ICON_SM} color={colors.textPrimary} />
          </Pressable>
        ) : (
          <Pressable
            onPress={handleBack}
            style={styles.navButton}
            hitSlop={spacing.sm}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={NAV_ICON_MD} color={colors.textPrimary} />
          </Pressable>
        )}

        {/* Center: title (absolutely positioned for true centering) */}
        <View style={styles.titleContainer} pointerEvents="none">
          <SolaText style={styles.pushTitle} numberOfLines={1}>
            {title}
          </SolaText>
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

const HEADER_HEIGHT = 48;
const LOGO_HEIGHT = 22;
const LOGO_WIDTH = 76;
const NAV_BUTTON_WIDTH = 36;
const TITLE_SIDE_CLEARANCE = 60;
const NAV_ICON_SM = 22;
const NAV_ICON_MD = 24;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    backgroundColor: colors.background,
  },

  // ── Tab root row ────────────────────────────────────────────────
  rootRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: HEADER_HEIGHT,
  },
  logo: {
    height: LOGO_HEIGHT,
    width: LOGO_WIDTH,
  },

  // ── Push / detail row ───────────────────────────────────────────
  pushRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: HEADER_HEIGHT,
  },

  // ── Nav button (back / close) ──────────────────────────────────
  navButton: {
    width: NAV_BUTTON_WIDTH,
    height: HEADER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  // ── Centered title (push screens) ──────────────────────────────
  titleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: TITLE_SIDE_CLEARANCE,
    zIndex: 1,
  },
  pushTitle: {
    fontFamily: fonts.medium,
    fontSize: 17,
    lineHeight: 22,
    color: colors.textPrimary,
  },

  // ── Right actions ──────────────────────────────────────────────
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    zIndex: 2,
  },
});
