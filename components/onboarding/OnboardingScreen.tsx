import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from './ProgressIndicator';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { colors, spacing, typography } from '@/constants/design';

interface OnboardingScreenProps {
  stage: number;
  headline: string;
  subtitle?: string;
  ctaLabel: string;
  ctaDisabled?: boolean;
  onCtaPress: () => void;
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
  showBack = true,
  children,
}: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        {showBack ? (
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <ProgressBar stage={stage} />
        <View style={styles.backPlaceholder} />
      </View>

      <View style={styles.headlineBlock}>
        <Text style={styles.headline}>{headline}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.content}>{children}</View>

      <View style={[styles.ctaContainer, { paddingBottom: insets.bottom + 24 }]}>
        <PrimaryButton label={ctaLabel} onPress={onCtaPress} disabled={ctaDisabled} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingTop: 8,
  },
  backButton: {
    width: 32,
    alignItems: 'flex-start',
  },
  backPlaceholder: {
    width: 32,
  },
  headlineBlock: {
    paddingHorizontal: spacing.screenX,
    paddingTop: 32,
    alignItems: 'center',
  },
  headline: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenX,
    paddingTop: 32,
  },
  ctaContainer: {
    paddingHorizontal: spacing.screenX,
  },
});
