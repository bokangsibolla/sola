import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SkeletonBar } from '@/components/ui/SkeletonBar';
import { colors, radius, spacing } from '@/constants/design';

export function HomeSkeleton() {
  return (
    <View style={styles.container}>
      {/* Greeting */}
      <View style={styles.section}>
        <SkeletonBar width="55%" height={24} style={styles.mb8} />
        <SkeletonBar width="40%" height={16} />
      </View>

      {/* Search bar */}
      <View style={styles.section}>
        <SkeletonBar width="100%" height={48} style={styles.pill} />
      </View>

      {/* Chips row */}
      <View style={styles.chipsRow}>
        <SkeletonBar width={100} height={32} style={styles.chip} />
        <SkeletonBar width={80} height={32} style={styles.chip} />
        <SkeletonBar width={90} height={32} style={styles.chip} />
        <SkeletonBar width={110} height={32} style={styles.chip} />
      </View>

      {/* Saved row */}
      <View style={styles.section}>
        <SkeletonBar width="60%" height={32} style={styles.pill} />
      </View>

      {/* Hero block */}
      <View style={styles.heroSection}>
        <SkeletonBar width="100%" height={240} style={styles.heroBlock} />
      </View>

      {/* Section title */}
      <View style={styles.section}>
        <SkeletonBar width="35%" height={18} style={styles.mb16} />
      </View>

      {/* Destination cards */}
      <View style={styles.cardsRow}>
        <SkeletonBar width={160} height={180} style={styles.card} />
        <SkeletonBar width={160} height={180} style={styles.card} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.lg,
  },
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenX,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  heroSection: {
    marginBottom: spacing.xxl,
  },
  cardsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenX,
    gap: spacing.md,
  },
  mb8: {
    marginBottom: spacing.sm,
  },
  mb16: {
    marginBottom: spacing.lg,
  },
  pill: {
    borderRadius: radius.full,
  },
  chip: {
    borderRadius: radius.full,
  },
  heroBlock: {
    borderBottomLeftRadius: radius.module,
    borderBottomRightRadius: radius.module,
  },
  card: {
    borderRadius: radius.module,
  },
});
