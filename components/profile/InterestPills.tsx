import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { INTEREST_GROUPS } from '@/constants/interests';
import type { ProfileTag } from '@/data/types';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface InterestPillsProps {
  tags: ProfileTag[];
  /** Slugs of the viewer's interests — shared ones get highlighted */
  viewerTagSlugs?: string[];
}

export function InterestPills({ tags, viewerTagSlugs }: InterestPillsProps) {
  if (tags.length === 0) return null;

  // Group tags by their group key, preserving INTEREST_GROUPS order
  const grouped = INTEREST_GROUPS
    .map((group) => ({
      ...group,
      tags: tags.filter((t) => t.tagGroup === group.key),
    }))
    .filter((g) => g.tags.length > 0);

  return (
    <View style={styles.container}>
      {grouped.map((group) => (
        <View key={group.key} style={styles.group}>
          <Text style={styles.groupLabel}>{group.question.replace('?', '')}</Text>
          <View style={styles.pillRow}>
            {group.tags.map((tag) => {
              const isShared = viewerTagSlugs?.includes(tag.tagSlug);
              return (
                <View
                  key={tag.tagSlug}
                  style={[styles.pill, isShared && styles.pillShared]}
                >
                  <Text style={[styles.pillText, isShared && styles.pillTextShared]}>
                    {tag.tagLabel}
                  </Text>
                </View>
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
    gap: spacing.lg,
  },
  group: {
    gap: spacing.xs,
  },
  groupLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.neutralFill,
  },
  pillShared: {
    backgroundColor: colors.orangeFill,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  pillTextShared: {
    color: colors.orange,
  },
});
