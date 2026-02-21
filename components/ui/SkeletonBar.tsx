import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { colors, radius } from '@/constants/design';

interface SkeletonBarProps {
  width: string | number;
  height?: number;
  style?: object;
}

export function SkeletonBar({ width, height = 14, style }: SkeletonBarProps) {
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

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.sm,
  },
});
