import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, spacing, radius } from '@/constants/design';

const TRAVEL_STYLE_OPTIONS = [
  { key: 'calm', label: 'Calm' },
  { key: 'social', label: 'Social' },
  { key: 'nature', label: 'Nature' },
  { key: 'cultural', label: 'Cultural' },
  { key: 'food', label: 'Food' },
  { key: 'wellness', label: 'Wellness' },
  { key: 'adventure', label: 'Adventure' },
  { key: 'budget', label: 'Budget' },
] as const;

interface StyleTagPickerProps {
  selected: string[];
  onToggle: (tag: string) => void;
}

export default function StyleTagPicker({ selected, onToggle }: StyleTagPickerProps) {
  return (
    <View style={styles.container}>
      {TRAVEL_STYLE_OPTIONS.map((option) => {
        const isSelected = selected.includes(option.key);
        return (
          <Pressable
            key={option.key}
            style={[styles.pill, isSelected && styles.pillSelected]}
            onPress={() => onToggle(option.key)}
          >
            <SolaText style={[styles.pillText, isSelected && styles.pillTextSelected]}>
              {option.label}
            </SolaText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  pillSelected: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  pillTextSelected: {
    color: colors.orange,
  },
});
