import React from 'react';
import { Modal, View, Pressable, StyleSheet } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ActiveTripInfo } from '@/state/AppModeContext';
import { colors, fonts, spacing, radius } from '@/constants/design';

interface TravellingModeWelcomeSheetProps {
  visible: boolean;
  onDismiss: () => void;
  tripInfo: ActiveTripInfo;
}

export function TravellingModeWelcomeSheet({
  visible,
  onDismiss,
  tripInfo,
}: TravellingModeWelcomeSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onDismiss} />
        <View style={[styles.container, { paddingBottom: insets.bottom + spacing.xl }]}>
          <View style={styles.handle} />

          <View style={styles.iconWrapper}>
            <Feather name="navigation" size={32} color={colors.orange} />
          </View>

          <SolaText style={styles.title}>You're in {tripInfo.city.name}</SolaText>
          <SolaText style={styles.subtitle}>
            Your explore feed now shows places, tips, and community discussions for{' '}
            {tripInfo.city.name}.{' '}
            {tripInfo.daysLeft === 1
              ? '1 day left on your trip.'
              : `${tripInfo.daysLeft} days left on your trip.`}
          </SolaText>

          <View style={styles.features}>
            <View style={styles.featureRow}>
              <Feather name="map-pin" size={18} color={colors.textSecondary} />
              <SolaText style={styles.featureText}>Saved places nearby</SolaText>
            </View>
            <View style={styles.featureRow}>
              <Feather name="message-circle" size={18} color={colors.textSecondary} />
              <SolaText style={styles.featureText}>Local community discussions</SolaText>
            </View>
          </View>

          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          >
            <SolaText style={styles.ctaText}>Start exploring</SolaText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

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
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 28,
    lineHeight: 36,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  features: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  cta: {
    backgroundColor: colors.orange,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  ctaPressed: {
    opacity: 0.9,
  },
  ctaText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.background,
    lineHeight: 24,
  },
});
