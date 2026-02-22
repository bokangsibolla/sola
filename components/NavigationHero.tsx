import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NavCrumb } from '@/hooks/useNavContext';
import { colors, fonts, spacing } from '@/constants/design';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NavigationHeroProps {
  /** Hero image URL */
  imageUrl?: string | null;

  /** Large title on the hero image */
  title: string;

  /** Small uppercase label above title (e.g., country name) */
  label?: string;

  /** Subtitle below title on the image */
  subtitle?: string;

  /** Back handler — defaults to router.back() */
  onBack?: () => void;

  /** Right-side action buttons (share, save, etc.) — rendered on the hero */
  rightActions?: React.ReactNode;

  /** Kept for API compat — not rendered */
  ancestors?: NavCrumb[];

  /** Kept for API compat — not rendered */
  parentTitle?: string;

  /** Hero image height (default 260) */
  height?: number;

  /** @deprecated No longer rendered */
  showContext?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_HEIGHT = 260;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const NavigationHero: React.FC<NavigationHeroProps> = ({
  imageUrl,
  title,
  label,
  subtitle,
  onBack,
  rightActions,
  parentTitle,
  height = DEFAULT_HEIGHT,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = onBack ?? (() => router.back());

  return (
    <View style={[styles.heroContainer, { height }]}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.heroImage}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.heroImage, styles.heroPlaceholder]} />
      )}

      <LinearGradient
        colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.6)']}
        locations={[0, 0.4, 1]}
        style={styles.gradient}
      />

      {/* ── Frosted back button ────────────────────────────────── */}
      <Pressable
        onPress={handleBack}
        style={[styles.heroBackButton, { top: insets.top + spacing.sm }]}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Go back to ${parentTitle ?? 'previous page'}`}
      >
        <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
      </Pressable>

      {/* ── Right actions on hero ──────────────────────────────── */}
      {rightActions && (
        <View style={[styles.heroActions, { top: insets.top + spacing.sm }]}>
          {rightActions}
        </View>
      )}

      {/* ── Title overlay ──────────────────────────────────────── */}
      <View style={styles.heroOverlay}>
        {label && (
          <SolaText style={styles.heroLabel}>{label.toUpperCase()}</SolaText>
        )}
        <SolaText style={styles.heroTitle} numberOfLines={2}>
          {title}
        </SolaText>
        {subtitle && (
          <SolaText style={styles.heroSubtitle} numberOfLines={2}>
            {subtitle}
          </SolaText>
        )}
      </View>
    </View>
  );
};

export default React.memo(NavigationHero);

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  heroContainer: {
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroPlaceholder: {
    backgroundColor: colors.neutralFill,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroBackButton: {
    position: 'absolute',
    left: spacing.screenX,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroActions: {
    position: 'absolute',
    right: spacing.screenX,
    flexDirection: 'row',
    gap: spacing.sm,
    zIndex: 10,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.screenX,
    right: spacing.screenX,
  },
  heroLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 30,
    color: '#FFFFFF',
    lineHeight: 36,
  },
  heroSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginTop: spacing.xs,
  },
});
