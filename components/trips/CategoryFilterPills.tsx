import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/design';

export type PlaceCategory =
  | 'all'
  | 'eat'
  | 'see'
  | 'do'
  | 'stay'
  | 'nightlife'
  | 'wellness';

export const CATEGORY_PLACE_TYPES: Record<PlaceCategory, string[]> = {
  all: [],
  eat: ['restaurant', 'cafe', 'bar', 'rooftop'],
  see: ['landmark', 'temple', 'museum', 'gallery'],
  do: ['activity', 'tour', 'market', 'neighborhood'],
  stay: ['hotel', 'hostel', 'homestay', 'guesthouse', 'resort', 'villa', 'airbnb'],
  nightlife: ['bar', 'club', 'rooftop'],
  wellness: ['wellness', 'spa'],
};

const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  all: 'All',
  eat: 'Eat',
  see: 'See',
  do: 'Do',
  stay: 'Stay',
  nightlife: 'Nightlife',
  wellness: 'Wellness',
};

const CATEGORIES: PlaceCategory[] = [
  'all',
  'eat',
  'see',
  'do',
  'stay',
  'nightlife',
  'wellness',
];

interface CategoryFilterPillsProps {
  selected: PlaceCategory;
  onSelect: (category: PlaceCategory) => void;
}

export const CategoryFilterPills: React.FC<CategoryFilterPillsProps> = ({
  selected,
  onSelect,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.list}
  >
    {CATEGORIES.map((cat) => {
      const active = cat === selected;
      return (
        <Pressable
          key={cat}
          onPress={() => onSelect(cat)}
          style={[
            styles.pill,
            active ? styles.pillActive : styles.pillInactive,
          ]}
        >
          <Text
            style={[
              styles.label,
              active ? styles.labelActive : styles.labelInactive,
            ]}
          >
            {CATEGORY_LABELS[cat]}
          </Text>
        </Pressable>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  pill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: colors.orangeFill,
    borderColor: colors.orange,
  },
  pillInactive: {
    backgroundColor: colors.background,
    borderColor: colors.borderDefault,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  labelActive: {
    color: colors.orange,
  },
  labelInactive: {
    color: colors.textPrimary,
  },
});
