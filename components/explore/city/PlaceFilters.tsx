import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { CityArea } from '@/data/types';

export type SortOption = 'default' | 'rating' | 'price';

interface Props {
  areas: CityArea[];
  selectedAreaId: string | null;
  onAreaSelect: (areaId: string | null) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'default', label: 'Featured' },
  { key: 'rating', label: 'Top rated' },
  { key: 'price', label: 'Price' },
];

export function PlaceFilters({ areas, selectedAreaId, onAreaSelect, sortBy, onSortChange }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {/* Area filter */}
        {areas.length > 0 && (
          <>
            <Pressable
              onPress={() => onAreaSelect(null)}
              style={[styles.chip, !selectedAreaId && styles.chipActive]}
            >
              <Text style={[styles.chipText, !selectedAreaId && styles.chipTextActive]}>All areas</Text>
            </Pressable>
            {areas.map((area) => {
              const active = area.id === selectedAreaId;
              return (
                <Pressable
                  key={area.id}
                  onPress={() => onAreaSelect(active ? null : area.id)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{area.name}</Text>
                </Pressable>
              );
            })}
          </>
        )}

        {/* Sort divider */}
        {areas.length > 0 && <View style={styles.divider} />}

        {/* Sort options */}
        {SORT_OPTIONS.map((opt) => {
          const active = sortBy === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => onSortChange(opt.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              {opt.key !== 'default' && (
                <Ionicons
                  name={opt.key === 'rating' ? 'star-outline' : 'cash-outline'}
                  size={12}
                  color={active ? colors.orange : colors.textMuted}
                />
              )}
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.sm,
  },
  row: {
    gap: spacing.sm,
    paddingHorizontal: spacing.screenX,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  chipActive: {
    backgroundColor: colors.orangeFill,
    borderColor: colors.orange,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.orange,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.borderDefault,
    alignSelf: 'center',
  },
});
