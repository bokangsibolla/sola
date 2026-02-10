import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '@/constants/design';

interface ExploreModesCardProps {
  onDismiss: () => void;
}

export function ExploreModesCard({ onDismiss }: ExploreModesCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Two ways to explore</Text>

      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <Feather name="compass" size={18} color={colors.textSecondary} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.modeName}>Discover</Text>
          <Text style={styles.modeDescription}>
            Browse cities and places around the world
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <Feather name="navigation" size={18} color={colors.orange} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.modeName}>Travelling</Text>
          <Text style={styles.modeDescription}>
            Switch to a city you're visiting for local tips, saved places, and community
          </Text>
        </View>
      </View>

      <Pressable onPress={onDismiss} hitSlop={8} style={styles.dismissButton}>
        <Text style={styles.dismissText}>Got it</Text>
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
