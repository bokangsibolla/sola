import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius } from '@/constants/design';

interface PillProps {
  label: string;
  subtitle?: string | null;
  selected: boolean;
  onPress: () => void;
}

export default function Pill({ label, subtitle, selected, onPress }: PillProps) {
  return (
    <Pressable
      style={[styles.pill, selected && styles.pillSelected]}
      onPress={onPress}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  pillSelected: {
    borderWidth: 2,
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
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
