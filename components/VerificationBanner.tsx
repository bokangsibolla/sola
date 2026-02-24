import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface VerificationBannerProps {
  verificationStatus: string;
  featureLabel: string;
}

const CONFIG: Record<
  string,
  {
    background: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    title: string;
    subtitle: (featureLabel: string) => string;
    actionLabel?: string;
  }
> = {
  unverified: {
    background: colors.orangeFill,
    icon: 'shield-outline',
    iconColor: colors.orange,
    title: 'Verify your identity',
    subtitle: (label) =>
      `Verification is required to ${label}. It helps keep our community safe.`,
    actionLabel: 'Verify Now',
  },
  pending: {
    background: colors.neutralFill,
    icon: 'time-outline',
    iconColor: colors.textSecondary,
    title: 'Verification in progress',
    subtitle: () =>
      'Your identity is being reviewed. This usually takes 24\u201348 hours.',
  },
  rejected: {
    background: colors.emergencyFill,
    icon: 'alert-circle-outline',
    iconColor: colors.emergency,
    title: 'Verification not approved',
    subtitle: () => 'Please try again with a clearer photo.',
    actionLabel: 'Try Again',
  },
};

export function VerificationBanner({
  verificationStatus,
  featureLabel,
}: VerificationBannerProps) {
  const router = useRouter();

  if (verificationStatus === 'verified') {
    return null;
  }

  const config = CONFIG[verificationStatus];
  if (!config) {
    return null;
  }

  const goToVerify = () => router.push('/(tabs)/home/verify' as any);

  return (
    <View style={[styles.container, { backgroundColor: config.background }]}>
      <Ionicons
        name={config.icon}
        size={20}
        color={config.iconColor}
        style={styles.icon}
      />

      <View style={styles.textContainer}>
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.subtitle}>{config.subtitle(featureLabel)}</Text>
      </View>

      {config.actionLabel ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={goToVerify}
          activeOpacity={0.8}
        >
          <Text style={styles.actionLabel}>{config.actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderRadius: radius.card,
    gap: spacing.md,
  },
  icon: {
    marginTop: 1,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionButton: {
    alignSelf: 'center',
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  actionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.background,
  },
});
