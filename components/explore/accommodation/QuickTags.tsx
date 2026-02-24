import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { Tag } from '@/data/types';

interface QuickTagsProps {
  tags: Tag[];
}

type FilterGroup = 'vibe' | 'good_for' | 'amenity' | 'safety';

const GROUP_ORDER: FilterGroup[] = ['vibe', 'good_for', 'amenity', 'safety'];
const GROUP_LABELS: Record<FilterGroup, string> = {
  vibe: 'Vibe',
  good_for: 'Good for',
  amenity: 'Amenities',
  safety: 'Safety',
};

const TAG_COLORS: Record<FilterGroup, { bg: string; text: string }> = {
  vibe: { bg: colors.orangeFill, text: colors.orange },
  safety: { bg: colors.greenFill, text: colors.greenSoft },
  good_for: { bg: colors.blueFill, text: colors.blueSoft },
  amenity: { bg: colors.neutralFill, text: colors.textSecondary },
};

const MAX_TAGS_PER_GROUP = 6;

const QuickTags: React.FC<QuickTagsProps> = ({ tags }) => {
  const grouped = useMemo(() => {
    const map: Partial<Record<FilterGroup, Tag[]>> = {};
    for (const tag of tags) {
      const group = tag.filterGroup as FilterGroup;
      if (!GROUP_ORDER.includes(group)) continue;
      if (!map[group]) map[group] = [];
      if (map[group]!.length < MAX_TAGS_PER_GROUP) {
        map[group]!.push(tag);
      }
    }
    return map;
  }, [tags]);

  const availableGroups = useMemo(
    () => GROUP_ORDER.filter((g) => grouped[g] && grouped[g]!.length > 0),
    [grouped],
  );

  const totalTags = availableGroups.reduce(
    (sum, g) => sum + (grouped[g]?.length ?? 0),
    0,
  );

  if (availableGroups.length === 0 || totalTags < 3) return null;

  return (
    <View style={styles.container}>
      {availableGroups.map((group) => {
        const groupTags = grouped[group] ?? [];
        const tagColor = TAG_COLORS[group];
        return (
          <View key={group} style={styles.groupRow}>
            <Text style={styles.groupLabel}>{GROUP_LABELS[group]}</Text>
            <View style={styles.tagRow}>
              {groupTags.map((tag) => (
                <View
                  key={tag.id}
                  style={[styles.tagPill, { backgroundColor: tagColor.bg }]}
                >
                  <Text style={[styles.tagText, { color: tagColor.text }]}>
                    {tag.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export { QuickTags };

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xxl,
    gap: spacing.lg,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  groupLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    width: 80,
    marginTop: spacing.sm,
  },
  tagRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tagPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
});
