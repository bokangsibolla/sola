import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { INTEREST_GROUPS } from '@/constants/interests';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface InterestPickerProps {
  /** Currently selected tag slugs */
  selected: string[];
  /** Called when selection changes */
  onChange: (slugs: string[]) => void;
  /** If true, renders compact (no questions, just chips). Default false. */
  compact?: boolean;
}

export function InterestPicker({ selected, onChange, compact }: InterestPickerProps) {
  const toggle = (slug: string) => {
    if (selected.includes(slug)) {
      onChange(selected.filter((s) => s !== slug));
    } else {
      onChange([...selected, slug]);
    }
  };

  return (
    <View style={styles.container}>
      {INTEREST_GROUPS.map((group) => (
        <View key={group.key} style={styles.group}>
          {!compact && (
            <Text style={styles.question}>{group.question}</Text>
          )}
          <View style={styles.chipGrid}>
            {group.options.map((option) => {
              const isSelected = selected.includes(option.slug);
              return (
                <Pressable
                  key={option.slug}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => toggle(option.slug)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  group: {
    gap: spacing.sm,
  },
  question: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  chipSelected: {
    backgroundColor: colors.orangeFill,
    borderColor: colors.orange,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  chipTextSelected: {
    color: colors.orange,
  },
});
