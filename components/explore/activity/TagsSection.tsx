import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { Tag } from '@/data/types';

interface TagsSectionProps {
  tags: Tag[];
}

const TAG_GROUP_LABELS: Record<string, string> = {
  vibe: 'VIBE',
  safety: 'SAFETY',
  good_for: 'GOOD FOR',
  amenity: 'AMENITIES',
  cuisine: 'CUISINE',
  style: 'STYLE',
  music: 'MUSIC',
  physical_level: 'PHYSICAL LEVEL',
  diet: 'DIET',
};

function tagColors(filterGroup: Tag['filterGroup']): { bg: string; fg: string } {
  switch (filterGroup) {
    case 'vibe':
      return { bg: colors.orangeFill, fg: colors.orange };
    case 'safety':
      return { bg: colors.greenFill, fg: colors.greenSoft };
    case 'good_for':
      return { bg: colors.blueFill, fg: colors.blueSoft };
    default:
      return { bg: colors.borderSubtle, fg: colors.textSecondary };
  }
}

const TagsSection: React.FC<TagsSectionProps> = ({ tags }) => {
  const grouped = useMemo(() => {
    const groups: Record<string, Tag[]> = {};
    for (const tag of tags) {
      const key = tag.filterGroup;
      if (!groups[key]) groups[key] = [];
      groups[key].push(tag);
    }
    return groups;
  }, [tags]);

  const groupKeys = Object.keys(grouped);
  if (groupKeys.length === 0) return null;

  return (
    <View style={styles.container}>
      {groupKeys.map((group) => {
        const groupTags = grouped[group];
        const tc = tagColors(group as Tag['filterGroup']);
        return (
          <View key={group} style={styles.group}>
            <SolaText style={styles.groupLabel}>
              {TAG_GROUP_LABELS[group] ?? group.toUpperCase()}
            </SolaText>
            <View style={styles.tagRow}>
              {groupTags.map((tag) => (
                <View
                  key={tag.id}
                  style={[styles.pill, { backgroundColor: tc.bg }]}
                >
                  <SolaText style={[styles.pillText, { color: tc.fg }]}>
                    {tag.label}
                  </SolaText>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export { TagsSection };

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xxl,
    gap: spacing.lg,
  },
  group: {
    gap: spacing.xs,
  },
  groupLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textMuted,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.xs,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },
});
