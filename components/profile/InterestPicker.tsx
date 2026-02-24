import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { INTEREST_GROUPS } from '@/constants/interests';
import { colors, fonts, radius, spacing } from '@/constants/design';

const GROUP_EMOJI: Record<string, string> = {
  travel_draw: '\u{1F30D}',   // globe
  cuisine_pref: '\u{1F372}',  // pot of food
  travel_vibe: '\u{2728}',    // sparkles
};

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
      {INTEREST_GROUPS.map((group) => {
        const selectedCount = group.options.filter((o) => selected.includes(o.slug)).length;
        return (
          <View key={group.key} style={styles.groupCard}>
            {!compact && (
              <View style={styles.questionRow}>
                <Text style={styles.emoji}>{GROUP_EMOJI[group.key] ?? ''}</Text>
                <View style={styles.questionContent}>
                  <Text style={styles.question}>{group.question}</Text>
                  {selectedCount > 0 && (
                    <Text style={styles.selectedCount}>
                      {selectedCount} selected
                    </Text>
                  )}
                </View>
              </View>
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
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  groupCard: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.cardLg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emoji: {
    fontSize: 24,
  },
  questionContent: {
    flex: 1,
    gap: 2,
  },
  question: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  selectedCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
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
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.orange,
  },
});
