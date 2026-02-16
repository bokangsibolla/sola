import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/design';

function SkeletonBar({ width, height = 14, style }: { width: string | number; height?: number; style?: object }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.bar,
        { width: width as any, height, opacity },
        style,
      ]}
    />
  );
}

const ActivitySkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Hero placeholder */}
      <SkeletonBar width="100%" height={300} style={styles.hero} />

      {/* Identity block */}
      <View style={styles.content}>
        <SkeletonBar width="30%" height={10} style={styles.mb8} />
        <SkeletonBar width="70%" height={24} style={styles.mb8} />
        <SkeletonBar width="50%" height={14} style={styles.mb24} />

        {/* Signal pills */}
        <View style={styles.pillRow}>
          <SkeletonBar width={80} height={28} style={styles.pill} />
          <SkeletonBar width={60} height={28} style={styles.pill} />
          <SkeletonBar width={90} height={28} style={styles.pill} />
        </View>

        {/* At a Glance card */}
        <SkeletonBar width="100%" height={140} style={styles.card} />

        {/* Content sections */}
        <SkeletonBar width="40%" height={10} style={[styles.mb8, styles.mt24]} />
        <SkeletonBar width="90%" height={14} style={styles.mb8} />
        <SkeletonBar width="75%" height={14} style={styles.mb8} />
        <SkeletonBar width="85%" height={14} style={styles.mb24} />

        <SkeletonBar width="35%" height={10} style={styles.mb8} />
        <SkeletonBar width="60%" height={14} style={styles.mb8} />
        <SkeletonBar width="80%" height={14} />
      </View>
    </View>
  );
};

export { ActivitySkeleton };

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
  bar: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.sm,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  pill: {
    borderRadius: radius.sm,
  },
  card: {
    borderRadius: radius.card,
    marginBottom: spacing.xxl,
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
