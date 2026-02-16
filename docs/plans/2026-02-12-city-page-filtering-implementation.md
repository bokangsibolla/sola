# City Page Filtering & Navigation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add sticky section navigation, place category/price filters, and accommodation type/price/feature filters to the city page — making it easy to find specific places without breaking the existing editorial design.

**Architecture:** All changes are in a single file (`app/(tabs)/discover/city/[slug].tsx`) plus one new reusable component (`components/explore/FilterChips.tsx`). Filter state is local React state. Scroll navigation uses `useRef` + `Animated` for the sticky bar. No database changes needed — all filtering uses existing `placeType`, `priceLevel`, and `highlights` fields.

**Tech Stack:** React Native `Animated`, `ScrollView` with `onScroll`, `useRef` for section anchors, existing design tokens from `constants/design.ts`.

---

### Task 1: Create Reusable FilterChips Component

**Files:**
- Create: `components/explore/FilterChips.tsx`

**Step 1: Create the FilterChips component**

This is a horizontal scrollable row of pressable pill chips. Reused by both place filters and accommodation filters.

```tsx
// components/explore/FilterChips.tsx
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/design';

export interface FilterChip {
  key: string;
  label: string;
}

type ColorVariant = 'orange' | 'green' | 'blue';

const VARIANT_COLORS: Record<ColorVariant, { bg: string; border: string; text: string }> = {
  orange: { bg: colors.orangeFill, border: colors.orange, text: colors.orange },
  green: { bg: colors.greenFill, border: colors.greenSoft, text: colors.greenSoft },
  blue: { bg: colors.blueFill, border: colors.blueSoft, text: colors.blueSoft },
};

interface FilterChipsProps {
  chips: FilterChip[];
  selected: string[];
  onToggle: (key: string) => void;
  variant?: ColorVariant;
  /** If true, include an "All" chip at the start that clears selection */
  showAll?: boolean;
}

export function FilterChips({
  chips,
  selected,
  onToggle,
  variant = 'orange',
  showAll = false,
}: FilterChipsProps) {
  const variantColors = VARIANT_COLORS[variant];
  const noneSelected = selected.length === 0;

  // Don't render if no chips to show
  if (chips.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={chipStyles.row}
    >
      {showAll && (
        <Pressable
          onPress={() => onToggle('__all__')}
          style={[
            chipStyles.chip,
            noneSelected && {
              backgroundColor: variantColors.bg,
              borderColor: variantColors.border,
            },
          ]}
        >
          <Text
            style={[
              chipStyles.chipText,
              noneSelected && { color: variantColors.text },
            ]}
          >
            All
          </Text>
        </Pressable>
      )}
      {chips.map((chip) => {
        const active = selected.includes(chip.key);
        return (
          <Pressable
            key={chip.key}
            onPress={() => onToggle(chip.key)}
            style={[
              chipStyles.chip,
              active && {
                backgroundColor: variantColors.bg,
                borderColor: variantColors.border,
              },
            ]}
          >
            <Text
              style={[
                chipStyles.chipText,
                active && { color: variantColors.text },
              ]}
            >
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const chipStyles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
```

**Step 2: Verify the component compiles**

Run: `npx tsc --noEmit 2>&1 | grep -E '(components/explore/FilterChips)'`
Expected: No errors

**Step 3: Commit**

```bash
git add components/explore/FilterChips.tsx
git commit -m "feat: add reusable FilterChips component for city page filters"
```

---

### Task 2: Add Place Category & Price Filters

**Files:**
- Modify: `app/(tabs)/discover/city/[slug].tsx`

**Step 1: Add imports and filter configuration constants**

At the top of the file, add the import for FilterChips and define the category-to-placeType mapping:

After the existing import of `MonthPicker` (line 46), add:
```tsx
import { FilterChips, type FilterChip } from '@/components/explore/FilterChips';
```

After the `TIME_SECTIONS` array (after line 90), add:
```tsx
// ---------------------------------------------------------------------------
// Place category filter configuration
// ---------------------------------------------------------------------------

interface PlaceCategoryFilter {
  key: string;
  label: string;
  types: Place['placeType'][];
}

const PLACE_CATEGORIES: PlaceCategoryFilter[] = [
  { key: 'cafes', label: 'Cafes', types: ['cafe', 'bakery'] },
  { key: 'restaurants', label: 'Restaurants', types: ['restaurant'] },
  { key: 'activities', label: 'Activities', types: ['activity', 'tour', 'landmark'] },
  { key: 'bars', label: 'Bars', types: ['bar', 'club', 'rooftop'] },
  { key: 'wellness', label: 'Wellness', types: ['wellness', 'spa', 'salon', 'gym'] },
  { key: 'coworking', label: 'Coworking', types: ['coworking'] },
];

const PRICE_LEVELS: FilterChip[] = [
  { key: '1', label: '$' },
  { key: '2', label: '$$' },
  { key: '3', label: '$$$' },
  { key: '4', label: '$$$$' },
];
```

**Step 2: Add filter state to PlaceScreen component**

Inside the `PlaceScreen` component, after the `selectedAreaId` state (line 859), add:
```tsx
// Place category & price filter state
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
const [selectedPriceLevel, setSelectedPriceLevel] = useState<string | null>(null);
```

**Step 3: Add filter logic — compute available chips and filtered places**

After the `hasPlaces` check (after line 926), add:
```tsx
// -----------------------------------------------------------------------
// Place filter logic
// -----------------------------------------------------------------------

// Get all non-accommodation places for filtering
const allNonAccommodationPlaces = groupedPlaces
  ? [
      ...groupedPlaces.morning,
      ...groupedPlaces.afternoon,
      ...groupedPlaces.evening,
      ...groupedPlaces.fullDay,
    ]
  : [];

// Only show category chips that have matching places
const availableCategoryChips: FilterChip[] = PLACE_CATEGORIES
  .filter((cat) => allNonAccommodationPlaces.some((p) => cat.types.includes(p.placeType)))
  .map((cat) => ({ key: cat.key, label: cat.label }));

// Only show price levels that exist in the data
const availablePlacePrices: FilterChip[] = PRICE_LEVELS
  .filter((pl) => allNonAccommodationPlaces.some((p) => p.priceLevel === Number(pl.key)));

// Filter places when a category or price is selected
const isPlaceFilterActive = selectedCategory !== null || selectedPriceLevel !== null;

const filteredPlaces = isPlaceFilterActive
  ? allNonAccommodationPlaces.filter((place) => {
      if (selectedCategory) {
        const cat = PLACE_CATEGORIES.find((c) => c.key === selectedCategory);
        if (cat && !cat.types.includes(place.placeType)) return false;
      }
      if (selectedPriceLevel) {
        if (place.priceLevel !== Number(selectedPriceLevel)) return false;
      }
      return true;
    }).sort((a, b) => (b.curationScore ?? 0) - (a.curationScore ?? 0))
  : [];

// Build filter result label
const filterResultLabel = isPlaceFilterActive
  ? `Showing ${filteredPlaces.length} ${
      selectedCategory
        ? PLACE_CATEGORIES.find((c) => c.key === selectedCategory)?.label.toLowerCase() ?? 'places'
        : 'places'
    }${selectedPriceLevel ? ` at ${'$'.repeat(Number(selectedPriceLevel))}` : ''}`
  : null;

// Handlers
const handleCategoryToggle = useCallback((key: string) => {
  if (key === '__all__') {
    setSelectedCategory(null);
  } else {
    setSelectedCategory((prev) => (prev === key ? null : key));
  }
}, []);

const handlePlacePriceToggle = useCallback((key: string) => {
  if (key === '__all__') {
    setSelectedPriceLevel(null);
  } else {
    setSelectedPriceLevel((prev) => (prev === key ? null : key));
  }
}, []);
```

**Step 4: Update the places section in the JSX**

Replace the time-based sections block (lines 1091-1107) with the new filtered version. Find this block:
```tsx
{hasPlaces && (
  <>
    <View style={styles.planHeader}>
      <Text style={styles.planTitle}>Your day in {city.name}</Text>
      <Text style={styles.planSubtitle}>
        Curated places, organized by time of day
      </Text>
    </View>
    {TIME_SECTIONS.map((section) => (
      <TimeBasedSection
        key={section.key}
        section={section}
        places={groupedPlaces?.[section.key] ?? []}
      />
    ))}
  </>
)}
```

Replace with:
```tsx
{hasPlaces && (
  <>
    <View style={styles.planHeader}>
      <Text style={styles.planTitle}>Your day in {city.name}</Text>
      <Text style={styles.planSubtitle}>
        Curated places, organized by time of day
      </Text>
    </View>

    {/* Category & price filter chips */}
    {(availableCategoryChips.length > 0 || availablePlacePrices.length > 0) && (
      <View style={styles.placeFilterSection}>
        {availableCategoryChips.length > 0 && (
          <FilterChips
            chips={availableCategoryChips}
            selected={selectedCategory ? [selectedCategory] : []}
            onToggle={handleCategoryToggle}
            variant="orange"
            showAll
          />
        )}
        {availablePlacePrices.length > 1 && (
          <View style={styles.placeFilterPriceRow}>
            <FilterChips
              chips={availablePlacePrices}
              selected={selectedPriceLevel ? [selectedPriceLevel] : []}
              onToggle={handlePlacePriceToggle}
              variant="green"
            />
          </View>
        )}
        {filterResultLabel && (
          <Text style={styles.filterResultLabel}>{filterResultLabel}</Text>
        )}
      </View>
    )}

    {/* Show time-based sections OR flat filtered list */}
    {isPlaceFilterActive ? (
      filteredPlaces.length > 0 ? (
        filteredPlaces.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))
      ) : (
        <View style={styles.filterEmpty}>
          <Text style={styles.filterEmptyText}>No places match these filters</Text>
          <Pressable
            onPress={() => {
              setSelectedCategory(null);
              setSelectedPriceLevel(null);
            }}
            hitSlop={8}
          >
            <Text style={styles.filterClearText}>Clear filters</Text>
          </Pressable>
        </View>
      )
    ) : (
      TIME_SECTIONS.filter((s) => s.key !== 'accommodations').map((section) => (
        <TimeBasedSection
          key={section.key}
          section={section}
          places={groupedPlaces?.[section.key] ?? []}
        />
      ))
    )}
  </>
)}
```

**Step 5: Add new styles**

Add these to the `StyleSheet.create()` block:
```tsx
// Place filter section
placeFilterSection: {
  marginBottom: spacing.lg,
  gap: spacing.sm,
},
placeFilterPriceRow: {
  marginTop: spacing.xs,
},
filterResultLabel: {
  fontFamily: fonts.regular,
  fontSize: 13,
  color: colors.textMuted,
  marginTop: spacing.xs,
},
filterEmpty: {
  alignItems: 'center',
  paddingVertical: spacing.xxl,
  gap: spacing.sm,
},
filterEmptyText: {
  fontFamily: fonts.regular,
  fontSize: 14,
  color: colors.textMuted,
},
filterClearText: {
  fontFamily: fonts.medium,
  fontSize: 14,
  color: colors.orange,
},
```

**Step 6: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/)' | head -20`
Expected: No new errors related to city/[slug].tsx or FilterChips.tsx

**Step 7: Commit**

```bash
git add app/(tabs)/discover/city/[slug].tsx
git commit -m "feat: add category & price filter chips to city places section"
```

---

### Task 3: Add Accommodation Section Filters

**Files:**
- Modify: `app/(tabs)/discover/city/[slug].tsx`

**Step 1: Add accommodation filter configuration**

After the `PRICE_LEVELS` constant (added in Task 2), add:
```tsx
// ---------------------------------------------------------------------------
// Accommodation type filter configuration
// ---------------------------------------------------------------------------

const ACCOMMODATION_TYPES: FilterChip[] = [
  { key: 'hostel', label: 'Hostel' },
  { key: 'hotel', label: 'Hotel' },
  { key: 'homestay', label: 'Homestay' },
];
```

**Step 2: Add accommodation filter state**

After the place filter state (added in Task 2), add:
```tsx
// Accommodation filter state
const [selectedAccomType, setSelectedAccomType] = useState<string | null>(null);
const [selectedAccomPrice, setSelectedAccomPrice] = useState<string | null>(null);
const [selectedAccomFeatures, setSelectedAccomFeatures] = useState<string[]>([]);
```

**Step 3: Add accommodation filter logic**

After the place filter logic block (added in Task 2), add:
```tsx
// -----------------------------------------------------------------------
// Accommodation filter logic
// -----------------------------------------------------------------------

const allAccommodations = groupedPlaces?.accommodations ?? [];

// Available accommodation type chips (only types that exist)
const availableAccomTypes: FilterChip[] = ACCOMMODATION_TYPES
  .filter((at) => allAccommodations.some((p) => p.placeType === at.key));

// Available price levels for accommodations
const availableAccomPrices: FilterChip[] = PRICE_LEVELS
  .filter((pl) => allAccommodations.some((p) => p.priceLevel === Number(pl.key)));

// Extract feature chips from highlights — count frequency, take top 5
const accomFeatureChips: FilterChip[] = (() => {
  const freq: Record<string, number> = {};
  for (const place of allAccommodations) {
    for (const h of place.highlights ?? []) {
      const normalized = h.trim();
      if (normalized.length > 0 && normalized.length <= 25) {
        freq[normalized] = (freq[normalized] ?? 0) + 1;
      }
    }
  }
  return Object.entries(freq)
    .filter(([, count]) => count >= 2) // Only show features mentioned 2+ times
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([label]) => ({ key: label, label }));
})();

const isAccomFilterActive =
  selectedAccomType !== null ||
  selectedAccomPrice !== null ||
  selectedAccomFeatures.length > 0;

const filteredAccommodations = isAccomFilterActive
  ? allAccommodations.filter((place) => {
      if (selectedAccomType && place.placeType !== selectedAccomType) return false;
      if (selectedAccomPrice && place.priceLevel !== Number(selectedAccomPrice)) return false;
      if (selectedAccomFeatures.length > 0) {
        const placeHighlights = (place.highlights ?? []).map((h) => h.trim());
        if (!selectedAccomFeatures.every((f) => placeHighlights.includes(f))) return false;
      }
      return true;
    }).sort((a, b) => (b.curationScore ?? 0) - (a.curationScore ?? 0))
  : allAccommodations;

const accomResultLabel = isAccomFilterActive
  ? `${filteredAccommodations.length} ${
      selectedAccomType ?? 'stays'
    }${filteredAccommodations.length === 1 ? '' : selectedAccomType ? 's' : ''} found`
  : `Showing all ${allAccommodations.length} stays`;

// Handlers
const handleAccomTypeToggle = useCallback((key: string) => {
  if (key === '__all__') {
    setSelectedAccomType(null);
  } else {
    setSelectedAccomType((prev) => (prev === key ? null : key));
  }
}, []);

const handleAccomPriceToggle = useCallback((key: string) => {
  if (key === '__all__') {
    setSelectedAccomPrice(null);
  } else {
    setSelectedAccomPrice((prev) => (prev === key ? null : key));
  }
}, []);

const handleAccomFeatureToggle = useCallback((key: string) => {
  setSelectedAccomFeatures((prev) =>
    prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key],
  );
}, []);

const clearAccomFilters = useCallback(() => {
  setSelectedAccomType(null);
  setSelectedAccomPrice(null);
  setSelectedAccomFeatures([]);
}, []);
```

**Step 4: Create AccommodationSection component**

Replace the current rendering of the accommodations time section. The accommodations currently render via the `TIME_SECTIONS.map()` loop. Since we split time sections (Task 2 already filters out accommodations from the loop), we need to add a dedicated accommodations section.

After the time sections / filtered list block in the JSX but before the events section, add:
```tsx
{/* Accommodations section with filters */}
{allAccommodations.length > 0 && (
  <View style={styles.timeSection}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{'\uD83C\uDFE8'}</Text>
      <View style={styles.sectionTitleGroup}>
        <Text style={styles.sectionTitle}>Where to Stay</Text>
        <Text style={styles.sectionSubtitle}>Sola-verified places to rest</Text>
      </View>
    </View>

    {/* Accommodation filter chips */}
    <View style={styles.accomFilterSection}>
      {availableAccomTypes.length > 1 && (
        <FilterChips
          chips={availableAccomTypes}
          selected={selectedAccomType ? [selectedAccomType] : []}
          onToggle={handleAccomTypeToggle}
          variant="orange"
          showAll
        />
      )}
      {availableAccomPrices.length > 1 && (
        <FilterChips
          chips={availableAccomPrices}
          selected={selectedAccomPrice ? [selectedAccomPrice] : []}
          onToggle={handleAccomPriceToggle}
          variant="green"
        />
      )}
      {accomFeatureChips.length > 0 && (
        <FilterChips
          chips={accomFeatureChips}
          selected={selectedAccomFeatures}
          onToggle={handleAccomFeatureToggle}
          variant="blue"
        />
      )}
      {isAccomFilterActive && (
        <View style={styles.accomResultRow}>
          <Text style={styles.filterResultLabel}>{accomResultLabel}</Text>
          <Pressable onPress={clearAccomFilters} hitSlop={8}>
            <Text style={styles.filterClearText}>Clear</Text>
          </Pressable>
        </View>
      )}
    </View>

    {/* Accommodation cards */}
    {filteredAccommodations.length > 0 ? (
      filteredAccommodations.map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))
    ) : (
      <View style={styles.filterEmpty}>
        <Text style={styles.filterEmptyText}>No stays match these filters</Text>
        <Pressable onPress={clearAccomFilters} hitSlop={8}>
          <Text style={styles.filterClearText}>Clear all filters</Text>
        </Pressable>
      </View>
    )}
  </View>
)}
```

**Step 5: Add accommodation filter styles**

Add to `StyleSheet.create()`:
```tsx
// Accommodation filter section
accomFilterSection: {
  marginBottom: spacing.md,
  gap: spacing.sm,
},
accomResultRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: spacing.xs,
},
```

**Step 6: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/)' | head -20`
Expected: No new errors

**Step 7: Commit**

```bash
git add app/(tabs)/discover/city/[slug].tsx
git commit -m "feat: add type, price & feature filters to accommodation section"
```

---

### Task 4: Add Sticky Section Navigator

**Files:**
- Modify: `app/(tabs)/discover/city/[slug].tsx`

**Step 1: Add Animated import and section nav config**

Update the React import to include `useRef`:
```tsx
import { useCallback, useEffect, useRef, useState } from 'react';
```

Update the React Native import to include `Animated`, `NativeScrollEvent`, `NativeSyntheticEvent`, and `LayoutChangeEvent`:
```tsx
import {
  Animated,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
```

After the accommodation type constants (added in Task 3), add:
```tsx
// ---------------------------------------------------------------------------
// Sticky section navigator tabs
// ---------------------------------------------------------------------------

interface NavTab {
  key: string;
  label: string;
}

const NAV_TABS: NavTab[] = [
  { key: 'overview', label: 'OVERVIEW' },
  { key: 'places', label: 'PLACES' },
  { key: 'stay', label: 'STAY' },
  { key: 'events', label: 'EVENTS' },
];

const STICKY_BAR_HEIGHT = 44;
```

**Step 2: Create StickyNavBar component**

Add this component before the `PlaceScreen` component:
```tsx
// ---------------------------------------------------------------------------
// Sticky Section Navigator
// ---------------------------------------------------------------------------

function StickyNavBar({
  activeTab,
  visible,
  onTabPress,
  topInset,
}: {
  activeTab: string;
  visible: boolean;
  onTabPress: (key: string) => void;
  topInset: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  return (
    <Animated.View
      style={[
        styles.stickyNav,
        { top: topInset, opacity },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      {NAV_TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabPress(tab.key)}
            style={styles.stickyNavTab}
            hitSlop={4}
          >
            <Text
              style={[
                styles.stickyNavLabel,
                isActive && styles.stickyNavLabelActive,
              ]}
            >
              {tab.label}
            </Text>
            {isActive && <View style={styles.stickyNavIndicator} />}
          </Pressable>
        );
      })}
    </Animated.View>
  );
}
```

**Step 3: Wire up scroll tracking and section refs in PlaceScreen**

Inside the `PlaceScreen` component, after the currency line (~line 904), add:
```tsx
// Sticky nav state
const scrollRef = useRef<ScrollView>(null);
const [showStickyNav, setShowStickyNav] = useState(false);
const [activeNavTab, setActiveNavTab] = useState('overview');

// Section Y offsets for scroll spy + jump-to
const sectionOffsets = useRef<Record<string, number>>({});
const heroHeight = 240; // matches styles.heroContainer height

const handleScroll = useCallback(
  (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;

    // Show/hide sticky nav based on hero scroll
    setShowStickyNav(y > heroHeight);

    // Determine active tab based on scroll position
    const offsets = sectionOffsets.current;
    const adjusted = y + STICKY_BAR_HEIGHT + 20; // offset for sticky bar height + buffer
    if (offsets.events && adjusted >= offsets.events) {
      setActiveNavTab('events');
    } else if (offsets.stay && adjusted >= offsets.stay) {
      setActiveNavTab('stay');
    } else if (offsets.places && adjusted >= offsets.places) {
      setActiveNavTab('places');
    } else {
      setActiveNavTab('overview');
    }
  },
  [],
);

const handleNavTabPress = useCallback((key: string) => {
  const offset = sectionOffsets.current[key];
  if (offset !== undefined && scrollRef.current) {
    scrollRef.current.scrollTo({
      y: offset - STICKY_BAR_HEIGHT - 10,
      animated: true,
    });
  }
}, []);

const makeSectionLayout = useCallback(
  (sectionKey: string) => (e: LayoutChangeEvent) => {
    sectionOffsets.current[sectionKey] = e.nativeEvent.layout.y;
  },
  [],
);
```

**Step 4: Update the ScrollView to use ref and onScroll**

Change the `<ScrollView>` opening tag:
```tsx
<ScrollView
  ref={scrollRef}
  showsVerticalScrollIndicator={false}
  onScroll={handleScroll}
  scrollEventThrottle={16}
>
```

**Step 5: Add StickyNavBar to the JSX**

Right after the breadcrumb `</View>` (line 948) and before the `<ScrollView>`, add:
```tsx
{/* Sticky section navigator */}
<StickyNavBar
  activeTab={activeNavTab}
  visible={showStickyNav}
  onTabPress={handleNavTabPress}
  topInset={insets.top}
/>
```

**Step 6: Add onLayout props to anchor sections**

Add `onLayout` to the relevant section containers for scroll spy:

a) On the Women's Insights section (the overview anchor). Wrap or add to the existing `WomenInsights` parent:
```tsx
<View onLayout={makeSectionLayout('overview')}>
  <WomenInsights ... />
</View>
```

b) On the plan header (places anchor):
```tsx
<View style={styles.planHeader} onLayout={makeSectionLayout('places')}>
```

c) On the accommodations section (stay anchor):
```tsx
<View style={styles.timeSection} onLayout={makeSectionLayout('stay')}>
```
(This is the accommodations `<View>` added in Task 3)

d) On the events section (events anchor). The `EventsSection` component needs wrapping:
```tsx
<View onLayout={makeSectionLayout('events')}>
  {city?.id && (
    <EventsSection cityId={city.id} userId={userId} />
  )}
</View>
```

**Step 7: Add sticky nav styles**

Add to `StyleSheet.create()`:
```tsx
// Sticky section navigator
stickyNav: {
  position: 'absolute',
  left: 0,
  right: 0,
  height: STICKY_BAR_HEIGHT,
  backgroundColor: colors.background,
  borderBottomWidth: 1,
  borderBottomColor: colors.borderDefault,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: spacing.screenX,
  zIndex: 10,
},
stickyNavTab: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  height: STICKY_BAR_HEIGHT,
},
stickyNavLabel: {
  fontFamily: fonts.medium,
  fontSize: 11,
  letterSpacing: 1.5,
  color: colors.textMuted,
},
stickyNavLabelActive: {
  color: colors.orange,
},
stickyNavIndicator: {
  position: 'absolute',
  bottom: 0,
  left: '20%',
  right: '20%',
  height: 2,
  backgroundColor: colors.orange,
  borderRadius: 1,
},
```

**Step 8: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/)' | head -20`
Expected: No new errors

**Step 9: Commit**

```bash
git add app/(tabs)/discover/city/[slug].tsx
git commit -m "feat: add sticky section navigator with scroll spy to city page"
```

---

### Task 5: Visual Testing & Polish

**Files:**
- Modify: `app/(tabs)/discover/city/[slug].tsx` (if needed)

**Step 1: Run full TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -E '(app/|components/)' | head -30`
Expected: No errors in city/[slug].tsx or FilterChips.tsx

**Step 2: Start the development server and test visually**

Run: `npx expo start`

Test on a city page (e.g., El Nido) by verifying:
- [ ] Sticky nav appears when scrolling past hero
- [ ] Sticky nav tabs highlight correctly as you scroll through sections
- [ ] Tapping a nav tab scrolls to the correct section
- [ ] Place filter chips render below "Your day in..." header
- [ ] Tapping a category chip shows a flat filtered list
- [ ] Tapping the price filter narrows results further
- [ ] "Clear filters" works and restores time-of-day view
- [ ] Accommodation filters render below "Where to Stay" header
- [ ] Type, price, and feature chips all filter correctly
- [ ] Multi-select works on accommodation features
- [ ] Empty state shows when no places match
- [ ] Area filter (neighborhood pills) still works alongside new filters
- [ ] Existing page layout is preserved when no filters are active

**Step 3: Fix any visual issues found**

Address spacing, alignment, or interaction issues discovered during testing.

**Step 4: Final commit**

```bash
git add -A
git commit -m "fix: polish city page filter spacing and interactions"
```
