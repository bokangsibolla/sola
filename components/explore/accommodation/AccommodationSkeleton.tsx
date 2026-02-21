import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { SkeletonBar } from '@/components/ui/SkeletonBar';
import { colors, radius, spacing } from '@/constants/design';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = Math.round(SCREEN_HEIGHT * 0.45);

const AccommodationSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Hero placeholder */}
      <SkeletonBar width="100%" height={HERO_HEIGHT} style={styles.hero} />

      <View style={styles.content}>
        {/* Positioning summary card */}
        <SkeletonBar width="100%" height={80} style={styles.card} />

        {/* Quick Tags card */}
        <View style={styles.tagsCard}>
          {/* Tab row */}
          <View style={styles.tabRow}>
            <SkeletonBar width={50} height={28} style={styles.pill} />
            <SkeletonBar width={65} height={28} style={styles.pill} />
            <SkeletonBar width={75} height={28} style={styles.pill} />
            <SkeletonBar width={55} height={28} style={styles.pill} />
          </View>
          {/* Tag pills */}
          <View style={styles.pillRow}>
            <SkeletonBar width={80} height={28} style={styles.pill} />
            <SkeletonBar width={60} height={28} style={styles.pill} />
            <SkeletonBar width={90} height={28} style={styles.pill} />
            <SkeletonBar width={70} height={28} style={styles.pill} />
          </View>
        </View>

        {/* Why Women Choose section */}
        <SkeletonBar width="50%" height={10} style={[styles.mb8, styles.mt24]} />
        <SkeletonBar width="90%" height={14} style={styles.mb8} />
        <SkeletonBar width="75%" height={14} style={styles.mb8} />
        <SkeletonBar width="85%" height={14} style={styles.mb24} />

        {/* What Stands Out */}
        <SkeletonBar width="40%" height={10} style={styles.mb8} />
        <View style={styles.pillRow}>
          <SkeletonBar width={80} height={28} style={styles.pill} />
          <SkeletonBar width={100} height={28} style={styles.pill} />
          <SkeletonBar width={70} height={28} style={styles.pill} />
        </View>

        {/* Details section */}
        <SkeletonBar width="30%" height={10} style={[styles.mb8, styles.mt24]} />
        <SkeletonBar width="100%" height={180} style={styles.card} />
        <SkeletonBar width="70%" height={14} style={styles.mb8} />
        <SkeletonBar width="50%" height={14} />
      </View>
    </View>
  );
};

export { AccommodationSkeleton };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    borderRadius: 0,
  },
  content: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
  },
  card: {
    borderRadius: radius.card,
    marginBottom: spacing.xl,
  },
  tagsCard: {
    borderRadius: radius.module,
    backgroundColor: colors.neutralFill,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    opacity: 0.5,
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    borderRadius: radius.sm,
  },
  mb8: {
    marginBottom: spacing.sm,
  },
  mb24: {
    marginBottom: spacing.xl,
  },
  mt24: {
    marginTop: spacing.xl,
  },
});
