import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SkeletonBar } from '@/components/ui/SkeletonBar';
import { colors, radius, spacing } from '@/constants/design';

export function ExploreSkeleton() {
  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchSection}>
        <SkeletonBar width="100%" height={48} style={styles.pill} />
      </View>

      {/* Filter chips */}
      <View style={styles.chipsRow}>
        <SkeletonBar width={100} height={32} style={styles.chip} />
        <SkeletonBar width={80} height={32} style={styles.chip} />
        <SkeletonBar width={110} height={32} style={styles.chip} />
        <SkeletonBar width={90} height={32} style={styles.chip} />
      </View>

      {/* Country cards 2x2 grid */}
      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <SkeletonBar width="48%" height={200} style={styles.card} />
          <SkeletonBar width="48%" height={200} style={styles.card} />
        </View>
        <View style={styles.gridRow}>
          <SkeletonBar width="48%" height={200} style={styles.card} />
          <SkeletonBar width="48%" height={200} style={styles.card} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchSection: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenX,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  grid: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.lg,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pill: {
    borderRadius: radius.full,
  },
  chip: {
    borderRadius: radius.full,
  },
  card: {
    borderRadius: radius.module,
  },
});
