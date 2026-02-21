// components/explore/ContinentFilter.tsx
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ContinentKey } from '@/data/discover/types';
import { colors, fonts, spacing, typography } from '@/constants/design';

interface ContinentFilterProps {
  continents: { key: ContinentKey; label: string }[];
  selected: ContinentKey | null; // null = "All"
  onSelect: (continent: ContinentKey | null) => void;
}

export function ContinentFilter({
  continents,
  selected,
  onSelect,
}: ContinentFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <FilterItem
        label="All"
        isActive={selected === null}
        onPress={() => onSelect(null)}
      />
      {continents.map((c) => (
        <FilterItem
          key={c.key}
          label={c.label}
          isActive={selected === c.key}
          onPress={() => onSelect(c.key)}
        />
      ))}
    </ScrollView>
  );
}

function FilterItem({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.item}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <Text style={[styles.label, isActive && styles.labelActive]}>
        {label}
      </Text>
      {isActive && <View style={styles.underline} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.xl,
  },
  item: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  label: {
    ...typography.filterLabel,
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.textPrimary,
  },
  underline: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.orange,
    borderRadius: 1,
  },
});
