import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppMode } from '@/state/AppModeContext';
import { colors, fonts, spacing, radius } from '@/constants/design';

interface ModeIndicatorPillProps {
  onPress: () => void;
}

export function ModeIndicatorPill({ onPress }: ModeIndicatorPillProps) {
  const { mode, activeTripInfo } = useAppMode();
  const isTravelling = mode === 'travelling' && activeTripInfo;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={[styles.pill, isTravelling ? styles.pillTravelling : styles.pillDiscover]}
    >
      <Feather
        name={isTravelling ? 'navigation' : 'compass'}
        size={14}
        color={isTravelling ? colors.orange : colors.textMuted}
      />
      <Text
        style={[styles.label, isTravelling ? styles.labelTravelling : styles.labelDiscover]}
        numberOfLines={1}
      >
        {isTravelling ? `In ${activeTripInfo.city.name}` : 'Exploring'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  pillDiscover: {
    backgroundColor: colors.neutralFill,
  },
  pillTravelling: {
    backgroundColor: colors.orangeFill,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  labelDiscover: {
    color: colors.textMuted,
  },
  labelTravelling: {
    color: colors.orange,
  },
});
