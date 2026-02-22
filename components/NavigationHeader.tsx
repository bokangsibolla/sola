import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import type { NavCrumb } from '@/hooks/useNavContext';
import BackButton, { BACK_BUTTON_SIZE } from '@/components/ui/BackButton';
import { colors, fonts, spacing, typography } from '@/constants/design';

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

  /** Explicit back destination — ensures back stays within the current tab.
   *  When set, overrides router.back() with router.navigate(backHref). */
  backHref?: string;

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
  backHref,
  variant = 'standard',
  rightActions,
}) => {
  const router = useRouter();

  const isRoot = !parentTitle && variant === 'standard';
  const isModal = variant === 'modal';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      router.navigate(backHref as any);
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
            <Text style={styles.rootTitle}>{title}</Text>
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
        <BackButton
          variant={isModal ? 'close' : 'back'}
          onPress={handleBack}
        />

        {/* Center: title (absolutely positioned for true centering) */}
        <View style={styles.titleContainer} pointerEvents="none">
          <Text style={styles.pushTitle} numberOfLines={1}>
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

const HEADER_HEIGHT = 48;
const LOGO_HEIGHT = 22;
const LOGO_WIDTH = 76;
const TITLE_SIDE_CLEARANCE = 60;

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
  rootTitle: {
    ...typography.tabRootTitle,
    color: colors.textPrimary,
  },

  // ── Push / detail row ───────────────────────────────────────────
  pushRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: HEADER_HEIGHT,
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
