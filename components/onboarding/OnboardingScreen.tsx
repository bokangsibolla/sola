import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ProgressBar from './ProgressIndicator';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { colors, fonts, spacing } from '@/constants/design';

interface OnboardingScreenProps {
  stage: number;
  headline: string;
  subtitle?: string;
  ctaLabel: string;
  ctaDisabled?: boolean;
  onCtaPress: () => void;
  onSkip?: () => void;
  showBack?: boolean;
  children: React.ReactNode;
}

export default function OnboardingScreen({
  stage,
  headline,
  subtitle,
  ctaLabel,
  ctaDisabled = false,
  onCtaPress,
  onSkip,
  showBack = true,
  children,
}: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      {/* Navigation row */}
      <View style={styles.navRow}>
        {showBack ? (
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
            <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <View style={styles.progressWrapper}>
          <ProgressBar stage={stage} />
        </View>
        <View style={styles.backPlaceholder} />
      </View>

      {/* Headline */}
      <Animated.View
        entering={FadeInDown.duration(350).damping(20)}
        style={styles.headlineBlock}
      >
        <Text style={styles.headline}>{headline}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </Animated.View>

      {/* Content */}
      <Animated.View
        entering={FadeInDown.delay(80).duration(350).damping(20)}
        style={styles.content}
      >
        {children}
      </Animated.View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <PrimaryButton label={ctaLabel} onPress={onCtaPress} disabled={ctaDisabled} />
        {onSkip && (
          <Pressable onPress={onSkip} style={styles.skipButton} hitSlop={8}>
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    marginBottom: 8,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F3F3',
  },
  backPlaceholder: {
    width: 32,
  },
  progressWrapper: {
    flex: 1,
    marginHorizontal: 16,
  },
  headlineBlock: {
    paddingHorizontal: spacing.screenX,
    paddingTop: 28,
    paddingBottom: 8,
  },
  headline: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenX,
    paddingTop: 28,
  },
  footer: {
    paddingHorizontal: spacing.screenX,
    paddingTop: 16,
    alignItems: 'center',
  },
  skipButton: {
    marginTop: 14,
  },
  skipText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
});
