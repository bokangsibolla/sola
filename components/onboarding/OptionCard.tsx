import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '@/constants/design';
import { SolaText } from '@/components/ui/SolaText';

interface OptionCardProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
}

export default function OptionCard({ title, subtitle, selected, onPress }: OptionCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <SolaText style={[styles.title, selected && styles.titleSelected]}>{title}</SolaText>
      {subtitle ? <SolaText style={styles.subtitle}>{subtitle}</SolaText> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 64,
    paddingVertical: 14,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  titleSelected: {
    color: colors.orange,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
});
