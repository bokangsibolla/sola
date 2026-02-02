import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, fonts, radius } from '@/constants/design';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PillProps {
  label: string;
  subtitle?: string | null;
  selected: boolean;
  onPress: () => void;
}

const SPRING = { damping: 14, stiffness: 200 };

export default function Pill({ label, subtitle, selected, onPress }: PillProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (selected) {
      scale.value = withSpring(1.05, SPRING, () => {
        scale.value = withSpring(1, SPRING);
      });
    }
  }, [selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.pill, selected && styles.pillSelected, animatedStyle]}
      onPress={onPress}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  pillSelected: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.orange,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
});
