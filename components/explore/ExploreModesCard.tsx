import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '@/constants/design';

interface ExploreModesCardProps {
  onDismiss: () => void;
}

export function ExploreModesCard({ onDismiss }: ExploreModesCardProps) {
  return (
    <View style={styles.card}>
      <SolaText style={styles.title}>Two ways to explore</SolaText>

      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <Feather name="compass" size={18} color={colors.textSecondary} />
        </View>
        <View style={styles.rowText}>
          <SolaText style={styles.modeName}>Discover</SolaText>
          <SolaText style={styles.modeDescription}>
            Browse cities and places around the world
          </SolaText>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <Feather name="navigation" size={18} color={colors.orange} />
        </View>
        <View style={styles.rowText}>
          <SolaText style={styles.modeName}>Travelling</SolaText>
          <SolaText style={styles.modeDescription}>
            Switch to a city you're visiting for local tips, saved places, and community
          </SolaText>
        </View>
      </View>

      <Pressable onPress={onDismiss} hitSlop={8} style={styles.dismissButton}>
        <SolaText style={styles.dismissText}>Got it</SolaText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginHorizontal: spacing.screenX,
    marginTop: spacing.lg,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rowText: {
    flex: 1,
    paddingTop: spacing.xs,
  },
  modeName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  modeDescription: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 2,
  },
  dismissButton: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
  },
  dismissText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
});
