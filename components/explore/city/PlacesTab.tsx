import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { useData } from '@/hooks/useData';
import { getPlacesByCity } from '@/data/api';
import { getPlaceTagsBatch } from '@/data/city/cityApi';
import { PLACE_CATEGORIES, PLACE_TYPE_TO_CATEGORY, PLACE_TYPE_LABELS } from '@/data/city/types';
import type { PlaceCategoryKey, CategoryCount } from '@/data/city/types';
import type { Place, CityArea, Tag } from '@/data/types';
import { CompactPlaceCard } from './CompactPlaceCard';

// ---------------------------------------------------------------------------
// Women-first Stay Filters
// ---------------------------------------------------------------------------

interface StayFilter {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  test: (p: Place) => boolean;
}

const STAY_FILTERS: StayFilter[] = [
  {
    key: 'women_only',
    label: 'Women Only',
    icon: 'shield-checkmark',
    color: colors.greenSoft,
    bg: colors.greenFill,
    test: (p) => p.womenOnly === true,
  },
  {
    key: 'verified',
    label: 'Sola Verified',
    icon: 'checkmark-circle',
    color: colors.orange,
    bg: colors.orangeFill,
    test: (p) =>
      p.verificationStatus === 'sola_checked' ||
      p.verificationStatus === 'baseline_passed',
  },
  {
    key: 'solo_reviewed',
    label: 'Solo Reviews',
    icon: 'chatbubble-ellipses',
    color: colors.blueSoft,
    bg: colors.blueFill,
    test: (p) => p.soloFemaleReviews != null && p.soloFemaleReviews.length > 0,
  },
  {
    key: 'budget',
    label: 'Budget',
    icon: 'wallet-outline',
    color: colors.textSecondary,
    bg: colors.neutralFill,
    test: (p) => p.priceLevel === 1,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface PlacesTabProps {
  cityId: string;
  areas: CityArea[];
}

function buildCategoryCounts(places: Place[]): CategoryCount[] {
  const countMap = new Map<PlaceCategoryKey, number>();
  for (const p of places) {
    const catKey = PLACE_TYPE_TO_CATEGORY[p.placeType];
    if (catKey) countMap.set(catKey, (countMap.get(catKey) ?? 0) + 1);
  }
  return PLACE_CATEGORIES
    .filter((cat) => (countMap.get(cat.key) ?? 0) > 0)
    .map((cat) => ({
      key: cat.key,
      label: cat.label,
      emoji: cat.emoji,
      count: countMap.get(cat.key) ?? 0,
    }));
}

function buildSubTypeCounts(
  places: Place[],
  placeTypes: Place['placeType'][],
): { type: Place['placeType']; label: string; count: number }[] {
  const countMap = new Map<string, number>();
  for (const p of places) {
    if (placeTypes.includes(p.placeType))
      countMap.set(p.placeType, (countMap.get(p.placeType) ?? 0) + 1);
  }
  return placeTypes
    .filter((t) => (countMap.get(t) ?? 0) > 0)
    .map((t) => ({ type: t, label: PLACE_TYPE_LABELS[t], count: countMap.get(t) ?? 0 }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PlacesTab({ cityId, areas }: PlacesTabProps) {
  const { data: allPlaces, loading } = useData(
    () => getPlacesByCity(cityId),
    ['placesByCity', cityId],
  );

  const categoryCounts = useMemo(
    () => buildCategoryCounts(allPlaces ?? []),
    [allPlaces],
  );

  const [activeCategory, setActiveCategory] = useState<PlaceCategoryKey | null>(null);
  const [activeSubType, setActiveSubType] = useState<Place['placeType'] | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<'type' | 'area' | null>(null);
  const [activeStayFilters, setActiveStayFilters] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (categoryCounts.length > 0 && !activeCategory)
      setActiveCategory(categoryCounts[0].key);
  }, [categoryCounts, activeCategory]);

  const isStayCategory = activeCategory === 'accommodation';

  const toggleStayFilter = (key: string) => {
    setActiveStayFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const activePlaceTypes = useMemo(() => {
    if (!activeCategory) return [];
    return PLACE_CATEGORIES.find((c) => c.key === activeCategory)?.placeTypes ?? [];
  }, [activeCategory]);

  // Base set: places in the active category
  const categoryPlaces = useMemo(() => {
    if (!allPlaces || activePlaceTypes.length === 0) return [];
    return allPlaces.filter((p) => activePlaceTypes.includes(p.placeType));
  }, [allPlaces, activePlaceTypes]);

  // Count how many accommodation places match each stay filter
  const stayFilterCounts = useMemo(() => {
    if (!isStayCategory) return {};
    const counts: Record<string, number> = {};
    for (const f of STAY_FILTERS) {
      counts[f.key] = categoryPlaces.filter(f.test).length;
    }
    return counts;
  }, [isStayCategory, categoryPlaces]);

  // Sub-type counts cross-filtered by area
  const subTypeCounts = useMemo(() => {
    const pool = selectedAreaId
      ? categoryPlaces.filter((p) => p.cityAreaId === selectedAreaId)
      : categoryPlaces;
    return buildSubTypeCounts(pool, activePlaceTypes);
  }, [categoryPlaces, activePlaceTypes, selectedAreaId]);

  // Area options cross-filtered by sub-type, only areas with places
  const areaOptions = useMemo(() => {
    const pool = activeSubType
      ? categoryPlaces.filter((p) => p.placeType === activeSubType)
      : categoryPlaces;
    const countMap = new Map<string, number>();
    for (const p of pool) {
      if (p.cityAreaId) countMap.set(p.cityAreaId, (countMap.get(p.cityAreaId) ?? 0) + 1);
    }
    return areas
      .filter((a) => (countMap.get(a.id) ?? 0) > 0)
      .map((a) => ({ id: a.id, name: a.name, count: countMap.get(a.id) ?? 0 }));
  }, [categoryPlaces, activeSubType, areas]);

  // Reset area if it no longer has places after sub-type change
  useEffect(() => {
    if (selectedAreaId && areaOptions.length > 0 && !areaOptions.find((a) => a.id === selectedAreaId)) {
      setSelectedAreaId(null);
    }
  }, [areaOptions, selectedAreaId]);

  // Reset sub-type if it no longer has places after area change
  useEffect(() => {
    if (activeSubType && subTypeCounts.length > 0 && !subTypeCounts.find((s) => s.type === activeSubType)) {
      setActiveSubType(null);
    }
  }, [subTypeCounts, activeSubType]);

  const filteredPlaces = useMemo(() => {
    const types = activeSubType ? [activeSubType] : activePlaceTypes;
    let result = categoryPlaces.filter((p) => types.includes(p.placeType));
    if (selectedAreaId) result = result.filter((p) => p.cityAreaId === selectedAreaId);
    // Apply stay filters (AND logic — place must match ALL active filters)
    if (isStayCategory && activeStayFilters.size > 0) {
      const activeFilterDefs = STAY_FILTERS.filter((f) => activeStayFilters.has(f.key));
      result = result.filter((p) => activeFilterDefs.every((f) => f.test(p)));
    }
    return [...result].sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [categoryPlaces, activePlaceTypes, activeSubType, selectedAreaId, isStayCategory, activeStayFilters]);

  const placeIds = useMemo(() => filteredPlaces.map((p) => p.id), [filteredPlaces]);
  const tagCacheKey = placeIds.length > 0 ? placeIds.slice(0, 3).join(',') : 'none';
  const { data: tagMap } = useData(
    () => placeIds.length > 0
      ? getPlaceTagsBatch(placeIds)
      : Promise.resolve(new Map<string, Tag[]>()),
    ['cityPlaceTags', cityId, activeCategory, tagCacheKey],
  );

  const areaNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of areas) map.set(a.id, a.name);
    return map;
  }, [areas]);

  const renderItem = useCallback(({ item }: { item: Place }) => {
    const tags = tagMap?.get(item.id) ?? [];
    const areaName = item.cityAreaId ? areaNameMap.get(item.cityAreaId) ?? null : null;
    return (
      <CompactPlaceCard
        place={{ ...item, imageUrl: item.imageUrlCached ?? null, areaName }}
        tags={tags}
      />
    );
  }, [tagMap, areaNameMap]);

  const keyExtractor = useCallback((item: Place) => item.id, []);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator color={colors.orange} /></View>;
  }
  if (categoryCounts.length === 0) {
    return <View style={styles.centered}><Text style={styles.emptyText}>No places added yet</Text></View>;
  }

  const showSubTypes = subTypeCounts.length > 1;
  const showAreaFilter = areas.length > 1;
  const activeSubLabel = activeSubType
    ? PLACE_TYPE_LABELS[activeSubType]
    : 'All types';
  const activeAreaLabel = selectedAreaId
    ? areaNameMap.get(selectedAreaId) ?? 'Area'
    : 'All areas';

  // -------------------------------------------------------------------------
  // Header
  // -------------------------------------------------------------------------

  const ListHeader = (
    <View>
      {/* ── Category bar ── */}
      <View style={styles.catBar}>
        {categoryCounts.map((cat) => {
          const active = cat.key === activeCategory;
          return (
            <Pressable
              key={cat.key}
              onPress={() => {
                setActiveCategory(cat.key);
                setActiveSubType(null);
                setSelectedAreaId(null);
                setOpenDropdown(null);
                if (cat.key !== 'accommodation') setActiveStayFilters(new Set());
              }}
              style={styles.catItem}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text
                style={[styles.catLabel, active && styles.catLabelActive]}
                numberOfLines={1}
              >
                {cat.label}
              </Text>
              {active && <View style={styles.catUnderline} />}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.catBorder} />

      {/* ── Dropdown buttons row ── */}
      {(showSubTypes || showAreaFilter) && (
        <View style={styles.dropdownRow}>
          {showSubTypes && (
            <Pressable
              onPress={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
              style={[styles.dropdownBtn, openDropdown === 'type' && styles.dropdownBtnOpen]}
            >
              <Text
                style={[styles.dropdownBtnText, activeSubType && styles.dropdownBtnTextActive]}
                numberOfLines={1}
              >
                {activeSubLabel}
              </Text>
              <Text style={styles.dropdownChevron}>
                {openDropdown === 'type' ? '▲' : '▼'}
              </Text>
            </Pressable>
          )}
          {showAreaFilter && (
            <Pressable
              onPress={() => setOpenDropdown(openDropdown === 'area' ? null : 'area')}
              style={[styles.dropdownBtn, openDropdown === 'area' && styles.dropdownBtnOpen]}
            >
              <Text
                style={[styles.dropdownBtnText, selectedAreaId && styles.dropdownBtnTextActive]}
                numberOfLines={1}
              >
                {activeAreaLabel}
              </Text>
              <Text style={styles.dropdownChevron}>
                {openDropdown === 'area' ? '▲' : '▼'}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* ── Type dropdown panel ── */}
      {openDropdown === 'type' && (
        <View style={styles.dropdownPanel}>
          <Pressable
            onPress={() => { setActiveSubType(null); setOpenDropdown(null); }}
            style={[styles.dropdownOption, !activeSubType && styles.dropdownOptionActive]}
          >
            <Text style={[styles.dropdownOptionText, !activeSubType && styles.dropdownOptionTextActive]}>
              All types
            </Text>
          </Pressable>
          {subTypeCounts.map((st) => {
            const active = activeSubType === st.type;
            return (
              <Pressable
                key={st.type}
                onPress={() => { setActiveSubType(active ? null : st.type); setOpenDropdown(null); }}
                style={[styles.dropdownOption, active && styles.dropdownOptionActive]}
              >
                <Text style={[styles.dropdownOptionText, active && styles.dropdownOptionTextActive]}>
                  {st.label}
                </Text>
                <Text style={styles.dropdownOptionCount}>{st.count}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* ── Area dropdown panel ── */}
      {openDropdown === 'area' && (
        <View style={styles.dropdownPanel}>
          <Pressable
            onPress={() => { setSelectedAreaId(null); setOpenDropdown(null); }}
            style={[styles.dropdownOption, !selectedAreaId && styles.dropdownOptionActive]}
          >
            <Text style={[styles.dropdownOptionText, !selectedAreaId && styles.dropdownOptionTextActive]}>
              All areas
            </Text>
          </Pressable>
          {areaOptions.length > 0
            ? areaOptions.map((area) => {
                const active = area.id === selectedAreaId;
                return (
                  <Pressable
                    key={area.id}
                    onPress={() => { setSelectedAreaId(active ? null : area.id); setOpenDropdown(null); }}
                    style={[styles.dropdownOption, active && styles.dropdownOptionActive]}
                  >
                    <Text style={[styles.dropdownOptionText, active && styles.dropdownOptionTextActive]}>
                      {area.name}
                    </Text>
                    <Text style={styles.dropdownOptionCount}>{area.count}</Text>
                  </Pressable>
                );
              })
            : areas.map((area) => {
                const active = area.id === selectedAreaId;
                return (
                  <Pressable
                    key={area.id}
                    onPress={() => { setSelectedAreaId(active ? null : area.id); setOpenDropdown(null); }}
                    style={[styles.dropdownOption, active && styles.dropdownOptionActive]}
                  >
                    <Text style={[styles.dropdownOptionText, active && styles.dropdownOptionTextActive]}>
                      {area.name}
                    </Text>
                  </Pressable>
                );
              })
          }
        </View>
      )}

      {/* ── Stay filter pills — only when accommodation is active ── */}
      {isStayCategory && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stayFilterRow}
          style={styles.stayFilterScroll}
        >
          {STAY_FILTERS.map((f) => {
            const count = stayFilterCounts[f.key] ?? 0;
            if (count === 0) return null;
            const isActive = activeStayFilters.has(f.key);
            return (
              <Pressable
                key={f.key}
                onPress={() => toggleStayFilter(f.key)}
                style={[
                  styles.stayPill,
                  isActive && { backgroundColor: f.bg, borderColor: f.color },
                ]}
              >
                <Ionicons
                  name={f.icon as any}
                  size={14}
                  color={isActive ? f.color : colors.textMuted}
                />
                <Text
                  style={[
                    styles.stayPillText,
                    isActive && { color: f.color },
                  ]}
                >
                  {f.label}
                </Text>
                <Text
                  style={[
                    styles.stayPillCount,
                    isActive && { color: f.color },
                  ]}
                >
                  {count}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* ── Result count ── */}
      <View style={styles.resultRow}>
        <Text style={styles.resultCount}>
          {filteredPlaces.length} {filteredPlaces.length === 1 ? 'place' : 'places'}
        </Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={filteredPlaces}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeader}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.centered}>
          <Ionicons
            name={isStayCategory ? 'bed-outline' : 'search-outline'}
            size={28}
            color={colors.textMuted}
          />
          <Text style={styles.emptyText}>
            {activeStayFilters.size > 0
              ? 'No stays match these filters'
              : 'No places match your filters'}
          </Text>
          {activeStayFilters.size > 0 && (
            <Pressable onPress={() => setActiveStayFilters(new Set())}>
              <Text style={styles.clearFiltersText}>Clear filters</Text>
            </Pressable>
          )}
        </View>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // ── Category bar ──
  catBar: {
    flexDirection: 'row',
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  catItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  catEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  catLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
  catLabelActive: {
    color: colors.orange,
    fontFamily: fonts.semiBold,
  },
  catUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: colors.orange,
    borderRadius: 1,
  },
  catBorder: {
    height: 1,
    backgroundColor: colors.borderSubtle,
  },

  // ── Dropdown buttons ──
  dropdownRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
    gap: 6,
  },
  dropdownBtnOpen: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  dropdownBtnText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  dropdownBtnTextActive: {
    color: colors.orange,
  },
  dropdownChevron: {
    fontSize: 8,
    color: colors.textMuted,
  },

  // ── Dropdown panel ──
  dropdownPanel: {
    marginHorizontal: spacing.screenX,
    marginTop: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  dropdownOptionActive: {
    backgroundColor: colors.orangeFill,
  },
  dropdownOptionText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  dropdownOptionTextActive: {
    color: colors.orange,
    fontFamily: fonts.semiBold,
  },
  dropdownOptionCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },

  // ── Stay filter pills ──
  stayFilterScroll: {
    flexGrow: 0,
    marginTop: spacing.md,
  },
  stayFilterRow: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.sm,
  },
  stayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  stayPillText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  stayPillCount: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },

  // ── Result count ──
  resultRow: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  resultCount: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },

  // ── List ──
  listContent: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.xxxxl,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxxl,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  clearFiltersText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
    marginTop: spacing.sm,
  },
});
