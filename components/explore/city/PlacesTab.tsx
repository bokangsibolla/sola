import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
import NavigationHero from '@/components/NavigationHero';
import SegmentedControl from '@/components/trips/SegmentedControl';
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
// Constants
// ---------------------------------------------------------------------------

const HERO_HEIGHT = 260;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HeroProps {
  imageUrl?: string | null;
  title: string;
  label?: string;
  subtitle?: string;
  onBack: () => void;
}

interface PlacesTabProps {
  cityId: string;
  areas: CityArea[];
  heroProps: HeroProps;
  tabs: string[];
  activeTabIndex: number;
  onTabPress: (index: number) => void;
  onScrollPastHero: (pastHero: boolean) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

export function PlacesTab({
  cityId,
  areas,
  heroProps,
  tabs,
  activeTabIndex,
  onTabPress,
  onScrollPastHero,
}: PlacesTabProps) {
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
  const [openDropdown, setOpenDropdown] = useState<'type' | 'area' | 'stay' | null>(null);
  const [activeStayFilters, setActiveStayFilters] = useState<Set<string>>(new Set());
  const pastHeroRef = useRef(false);

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
      <View style={styles.cardWrapper}>
        <CompactPlaceCard
          place={{ ...item, imageUrl: item.imageUrlCached ?? null, areaName }}
          tags={tags}
        />
      </View>
    );
  }, [tagMap, areaNameMap]);

  const keyExtractor = useCallback((item: Place) => item.id, []);

  // ── Scroll tracking ──
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const isPast = y >= HERO_HEIGHT;
      if (isPast !== pastHeroRef.current) {
        pastHeroRef.current = isPast;
        onScrollPastHero(isPast);
      }
    },
    [onScrollPastHero],
  );

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
  const hasActiveStayFilters = activeStayFilters.size > 0;

  // -------------------------------------------------------------------------
  // Header (hero + segmented + compact filters)
  // -------------------------------------------------------------------------

  const ListHeader = (
    <View>
      {/* ── Hero (scrolls away with content) ── */}
      <NavigationHero
        imageUrl={heroProps.imageUrl}
        title={heroProps.title}
        label={heroProps.label}
        subtitle={heroProps.subtitle}
        onBack={heroProps.onBack}
        height={HERO_HEIGHT}
      />

      {/* ── Segmented control (scrolls away — sticky clone in CityScreen) ── */}
      <SegmentedControl
        tabs={tabs}
        activeIndex={activeTabIndex}
        onTabPress={onTabPress}
      />

      {/* ── Category tabs (horizontal scroll, pure text) ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catBar}
        contentContainerStyle={styles.catBarContent}
      >
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
              style={styles.catTab}
            >
              <Text style={[styles.catLabel, active && styles.catLabelActive]}>
                {cat.label}
              </Text>
              {active && <View style={styles.catUnderline} />}
            </Pressable>
          );
        })}
      </ScrollView>

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
      onScroll={handleScroll}
      scrollEventThrottle={16}
      ListEmptyComponent={
        <View style={[styles.centered, styles.cardWrapper]}>
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
  // ── Category tabs (pure text, horizontal scroll) ──
  catBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  catBarContent: {
    paddingLeft: spacing.screenX,
    paddingRight: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  catTab: {
    alignItems: 'center',
    paddingBottom: spacing.md,
  },
  catLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  catLabelActive: {
    color: colors.orange,
    fontFamily: fonts.semiBold,
  },
  catUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.orange,
    borderRadius: 1,
  },

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

  // ── List ──
  listContent: {
    paddingBottom: spacing.xxxxl,
  },
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
