import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, elevation, fonts, radius, spacing } from '@/constants/design';
import type { Tag } from '@/data/types';

interface QuickTagsProps {
  tags: Tag[];
}

type FilterGroup = 'vibe' | 'good_for' | 'amenity' | 'safety';

const TAB_ORDER: FilterGroup[] = ['vibe', 'good_for', 'amenity', 'safety'];
const TAB_LABELS: Record<FilterGroup, string> = {
  vibe: 'Vibe',
  good_for: 'Good For',
  amenity: 'Amenities',
  safety: 'Safety',
};

const TAG_COLORS: Record<FilterGroup, { bg: string; text: string }> = {
  vibe: { bg: colors.orangeFill, text: colors.orange },
  safety: { bg: colors.greenFill, text: colors.greenSoft },
  good_for: { bg: colors.blueFill, text: colors.blueSoft },
  amenity: { bg: colors.neutralFill, text: colors.textSecondary },
};

const MAX_TAGS_PER_GROUP = 8;

const QuickTags: React.FC<QuickTagsProps> = ({ tags }) => {
  // Group tags by filterGroup — Hermes-safe (no spread on iterators)
  const grouped = useMemo(() => {
    const map: Partial<Record<FilterGroup, Tag[]>> = {};
    for (const tag of tags) {
      const group = tag.filterGroup as FilterGroup;
      if (!TAB_ORDER.includes(group)) continue;
      if (!map[group]) map[group] = [];
      if (map[group]!.length < MAX_TAGS_PER_GROUP) {
        map[group]!.push(tag);
      }
    }
    return map;
  }, [tags]);

  // Only show tabs that have data
  const availableTabs = useMemo(
    () => TAB_ORDER.filter((g) => grouped[g] && grouped[g]!.length > 0),
    [grouped],
  );

  const [activeTab, setActiveTab] = useState<FilterGroup>(
    availableTabs[0] ?? 'vibe',
  );

  // Animated indicator position
  const indicatorLeft = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const tabLayouts = useMemo(() => new Map<string, { x: number; width: number }>(), []);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: withTiming(indicatorLeft.value, { duration: 250 }),
    width: withTiming(indicatorWidth.value, { duration: 250 }),
  }));

  if (availableTabs.length === 0) return null;

  const activeTags = grouped[activeTab] ?? [];
  const tagColor = TAG_COLORS[activeTab] ?? TAG_COLORS.amenity;

  const handleTabPress = (tab: FilterGroup) => {
    setActiveTab(tab);
    const layout = tabLayouts.get(tab);
    if (layout) {
      indicatorLeft.value = layout.x;
      indicatorWidth.value = layout.width;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tab selector */}
      <View style={styles.tabRow}>
        <Animated.View style={[styles.indicator, indicatorStyle]} />
        {availableTabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <Pressable
              key={tab}
              onPress={() => handleTabPress(tab)}
              onLayout={(e) => {
                const { x, width } = e.nativeEvent.layout;
                tabLayouts.set(tab, { x, width });
                if (tab === activeTab) {
                  indicatorLeft.value = x;
                  indicatorWidth.value = width;
                }
              }}
              style={styles.tab}
            >
              <SolaText
                style={[
                  styles.tabText,
                  isActive && styles.tabTextActive,
                ]}
              >
                {TAB_LABELS[tab]}
              </SolaText>
            </Pressable>
          );
        })}
      </View>

      {/* Tag pills with animated swap */}
      <Animated.View
        key={activeTab}
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(100)}
        style={styles.tagGrid}
      >
        {activeTags.map((tag) => (
          <View
            key={tag.id}
            style={[styles.tagPill, { backgroundColor: tagColor.bg }]}
          >
            <SolaText style={[styles.tagText, { color: tagColor.text }]}>
              {tag.label}
            </SolaText>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

export { QuickTags };

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xxl,
    backgroundColor: colors.background,
    borderRadius: radius.module,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.xl,
    ...elevation.sm,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.orangeFill,
    borderRadius: radius.full,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  tabText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.orange,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
});
