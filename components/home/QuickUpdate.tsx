import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { TravelUpdate } from '@/data/home/types';

interface QuickUpdateProps {
  update: TravelUpdate | null;
}

const SEVERITY_CONFIG = {
  info: {
    bg: colors.blueFill,
    accent: colors.blueSoft,
    icon: 'info' as const,
  },
  advisory: {
    bg: colors.warningFill,
    accent: colors.warning,
    icon: 'alert-triangle' as const,
  },
  alert: {
    bg: colors.emergencyFill,
    accent: colors.emergency,
    icon: 'alert-circle' as const,
  },
};

export function QuickUpdate({ update }: QuickUpdateProps) {
  if (!update) return null;

  const config = SEVERITY_CONFIG[update.severity];

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: config.bg }]}>
        <Feather name={config.icon} size={18} color={config.accent} style={styles.icon} />
        <View style={styles.content}>
          <SolaText style={[styles.title, { color: config.accent }]}>{update.title}</SolaText>
          <SolaText style={styles.body} numberOfLines={2}>
            {update.body}
          </SolaText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.xl,
  },
  card: {
    flexDirection: 'row',
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  icon: {
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});
