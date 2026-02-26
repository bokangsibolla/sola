import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { useData } from '@/hooks/useData';
import { getPlaceTagsBatch } from '@/data/city/cityApi';
import { PLACE_CATEGORIES, PLACE_TYPE_TO_CATEGORY, PLACE_TYPE_LABELS } from '@/data/city/types';
import type { PlaceCategoryKey } from '@/data/city/types';
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
    key: 'sola_verified',
    label: 'Sola Verified',
    icon: 'checkmark-circle',
    color: colors.blueSoft,
    bg: colors.blueFill,
    test: (p) => p.verificationStatus === 'sola_checked',
  },
  {
    key: 'cross_checked',
    label: 'Cross-checked',
    icon: 'checkmark-circle-outline',
    color: colors.textSecondary,
    bg: colors.neutralFill,
    test: (p) => p.verificationStatus === 'baseline_passed',
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
// Types
// ---------------------------------------------------------------------------

interface PlacesTabProps {
  allPlaces: Place[];
  activeCategory: PlaceCategoryKey | null;
  areas: CityArea[];
  loading?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

export function PlacesTab({
  allPlaces,
  activeCategory,
  areas,
  loading,
}: PlacesTabProps) {
  const [activeSubType, setActiveSubType] = useState<Place['placeType'] | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<'type' | 'area' | 'stay' | null>(null);
  const [activeStayFilters, setActiveStayFilters] = useState<Set<string>>(new Set());

  // Reset sub-filters when category changes
  useEffect(() => {
    setActiveSubType(null);
    setSelectedAreaId(null);
    setOpenDropdown(null);
    setActiveStayFilters(new Set());
  }, [activeCategory]);

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

  const categoryPlaces = useMemo(() => {
    if (!allPlaces || activePlaceTypes.length === 0) return [];
    return allPlaces.filter((p) => activePlaceTypes.includes(p.placeType));
  }, [allPlaces, activePlaceTypes]);

  const stayFilterCounts = useMemo(() => {
    if (!isStayCategory) return {};
    const counts: Record<string, number> = {};
    for (const f of STAY_FILTERS) {
      counts[f.key] = categoryPlaces.filter(f.test).length;
    }
    return counts;
  }, [isStayCategory, categoryPlaces]);

  const subTypeCounts = useMemo(() => {
    const pool = selectedAreaId
      ? categoryPlaces.filter((p) => p.cityAreaId === selectedAreaId || !p.cityAreaId)
      : categoryPlaces;
    return buildSubTypeCounts(pool, activePlaceTypes);
  }, [categoryPlaces, activePlaceTypes, selectedAreaId]);

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

  useEffect(() => {
    if (selectedAreaId && areaOptions.length > 0 && !areaOptions.find((a) => a.id === selectedAreaId)) {
      setSelectedAreaId(null);
    }
  }, [areaOptions, selectedAreaId]);

  useEffect(() => {
    if (activeSubType && subTypeCounts.length > 0 && !subTypeCounts.find((s) => s.type === activeSubType)) {
      setActiveSubType(null);
    }
  }, [subTypeCounts, activeSubType]);

  const filteredPlaces = useMemo(() => {
    const types = activeSubType ? [activeSubType] : activePlaceTypes;
    let result = categoryPlaces.filter((p) => types.includes(p.placeType));
    if (selectedAreaId) result = result.filter((p) => p.cityAreaId === selectedAreaId || !p.cityAreaId);
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
    ['cityPlaceTags', activeCategory, tagCacheKey],
  );

  const areaNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of areas) map.set(a.id, a.name);
    return map;
  }, [areas]);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator color={colors.orange} /></View>;
  }

  const showSubTypes = subTypeCounts.length > 1;
  const showAreaFilter = areas.length > 1;
  const activeSubLabel = activeSubType
    ? PLACE_TYPE_LABELS[activeSubType]
    : 'All types';
  const activeAreaLabel = selectedAreaId
    ? areaNameMap.get(selectedAreaId) ?? 'Area'
    : 'All areas';
  const hasActiveStayFilters = activeStayFilters.size > 0;

  return (
    <View>
      {/* ── Compact filter row (type + area + funnel + count) ── */}
      <View style={styles.filterRow}>
        <View style={styles.filterLeft}>
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
          {isStayCategory && (
            <Pressable
              onPress={() => setOpenDropdown(openDropdown === 'stay' ? null : 'stay')}
              style={[styles.funnelBtn, openDropdown === 'stay' && styles.dropdownBtnOpen]}
            >
              <Ionicons
                name="funnel-outline"
                size={14}
                color={hasActiveStayFilters ? colors.orange : colors.textSecondary}
              />
              {hasActiveStayFilters && <View style={styles.funnelDot} />}
            </Pressable>
          )}
        </View>
        <Text style={styles.resultCount}>
          {filteredPlaces.length} {filteredPlaces.length === 1 ? 'place' : 'places'}
        </Text>
      </View>

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
          {(areaOptions.length > 0 ? areaOptions : areas).map((area) => {
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
                {'count' in area && <Text style={styles.dropdownOptionCount}>{(area as any).count}</Text>}
              </Pressable>
            );
          })}
        </View>
      )}

      {/* ── Stay filters dropdown panel ── */}
      {openDropdown === 'stay' && (
        <View style={styles.dropdownPanel}>
          {STAY_FILTERS.map((f) => {
            const count = stayFilterCounts[f.key] ?? 0;
            const isActive = activeStayFilters.has(f.key);
            const isEmpty = count === 0;
            return (
              <Pressable
                key={f.key}
                onPress={() => toggleStayFilter(f.key)}
                style={[styles.dropdownOption, isActive && styles.dropdownOptionActive]}
              >
                <View style={styles.stayOptionLeft}>
                  <Ionicons
                    name={f.icon as any}
                    size={14}
                    color={isActive ? f.color : isEmpty ? colors.textMuted : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      isActive && { color: f.color, fontFamily: fonts.semiBold },
                      isEmpty && !isActive && { color: colors.textMuted },
                    ]}
                  >
                    {f.label}
                  </Text>
                </View>
                <Text style={styles.dropdownOptionCount}>{count}</Text>
              </Pressable>
            );
          })}
          {hasActiveStayFilters && (
            <Pressable
              onPress={() => { setActiveStayFilters(new Set()); setOpenDropdown(null); }}
              style={styles.clearStayBtn}
            >
              <Text style={styles.clearStayText}>Clear filters</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* ── Place cards ── */}
      {filteredPlaces.length > 0 ? (
        filteredPlaces.map((item) => {
          const tags = tagMap?.get(item.id) ?? [];
          const areaName = item.cityAreaId ? areaNameMap.get(item.cityAreaId) ?? null : null;
          return (
            <View key={item.id} style={styles.cardWrapper}>
              <CompactPlaceCard
                place={{ ...item, imageUrl: item.imageUrlCached ?? null, areaName }}
                tags={tags}
              />
            </View>
          );
        })
      ) : (
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
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // ── Compact filter row ──
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  filterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },

  // ── Dropdown buttons ──
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
    gap: 4,
  },
  dropdownBtnOpen: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  dropdownBtnText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  dropdownBtnTextActive: {
    color: colors.orange,
  },
  dropdownChevron: {
    fontSize: 7,
    color: colors.textMuted,
  },

  // ── Funnel button ──
  funnelBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  funnelDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.orange,
  },

  // ── Result count ──
  resultCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: spacing.sm,
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

  // ── Stay filter dropdown extras ──
  stayOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  clearStayBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
  },
  clearStayText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },

  // ── Cards ──
  cardWrapper: {
    paddingHorizontal: spacing.screenX,
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
