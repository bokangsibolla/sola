// components/explore/ContinentFilter.tsx
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
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
      <SolaText variant="filterLabel" color={isActive ? colors.textPrimary : colors.textMuted}>
        {label}
      </SolaText>
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
