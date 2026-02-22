import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import NavigationHeader from '@/components/NavigationHeader';
import LoadingScreen from '@/components/LoadingScreen';
import { TripDaySuggestions, ACCOMMODATION_TYPES } from '@/components/trips/TripDaySuggestions';
import { AddToDaysSheet } from '@/components/trips/AddToDaysSheet';
import { TYPE_DOT_COLOR, TYPE_LABEL } from '@/components/trips/blockTypeColors';
import { useData } from '@/hooks/useData';
import { getPopularCitiesWithCountry } from '@/data/api';
import type { Place } from '@/data/types';
import type { CityWithCountry } from '@/data/explore/types';
import type { DayOption } from '@/components/trips/AddToDaysSheet';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { FLOATING_TAB_BAR_HEIGHT } from '@/components/TabBar';

// ── Helpers ──────────────────────────────────────────────────────────────────

const SLUG_TO_ISO: Record<string, string> = {
  japan: 'JP', thailand: 'TH', indonesia: 'ID', vietnam: 'VN',
  portugal: 'PT', spain: 'ES', italy: 'IT', france: 'FR', greece: 'GR',
  morocco: 'MA', mexico: 'MX', colombia: 'CO', peru: 'PE', brazil: 'BR',
  turkey: 'TR', india: 'IN', 'south-korea': 'KR', 'sri-lanka': 'LK',
  australia: 'AU', 'new-zealand': 'NZ', croatia: 'HR', georgia: 'GE',
  argentina: 'AR', chile: 'CL', 'costa-rica': 'CR', guatemala: 'GT',
  kenya: 'KE', tanzania: 'TZ', 'south-africa': 'ZA', egypt: 'EG',
  jordan: 'JO', oman: 'OM', 'united-kingdom': 'GB', germany: 'DE',
  netherlands: 'NL', czech: 'CZ', hungary: 'HU', poland: 'PL',
  romania: 'RO', montenegro: 'ME', albania: 'AL', cambodia: 'KH',
  myanmar: 'MM', philippines: 'PH', malaysia: 'MY', nepal: 'NP',
  namibia: 'NA', mozambique: 'MZ', zimbabwe: 'ZW', lesotho: 'LS',
  singapore: 'SG',
};

function getIso2(city: CityWithCountry): string {
  return SLUG_TO_ISO[city.countrySlug] ?? city.countrySlug.slice(0, 2).toUpperCase();
}

function getFlag(iso2: string): string {
  return iso2
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');
}

function formatMockDate(dayOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + 30 + dayOffset);
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
  return `${weekday}, ${month} ${d.getDate()}`;
}

function pickCities(allCities: CityWithCountry[], targetNames: string[]): CityWithCountry[] {
  // If names passed from empty state, match those exact cities
  if (targetNames.length > 0) {
    const matched: CityWithCountry[] = [];
    for (const name of targetNames) {
      const city = allCities.find((c) => c.name === name);
      if (city) matched.push(city);
    }
    if (matched.length > 0) return matched.slice(0, 2);
  }

  // Fallback: pick 2 popular cities with hero images from different countries
  const withHero = allCities.filter((c) => c.heroImageUrl);
  const pool = withHero.length >= 2 ? withHero : allCities;
  if (pool.length === 0) return [];
  if (pool.length === 1) return [pool[0]];
  const first = pool[0];
  const second = pool.find((c) => c.countryName !== first.countryName) ?? pool[1];
  return [first, second];
}

// ── Screen ───────────────────────────────────────────────────────────────────

export default function TripDemoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { names } = useLocalSearchParams<{ names?: string }>();

  const targetNames = useMemo(
    () => (names ? decodeURIComponent(names).split(',') : []),
    [names],
  );

  const { data: allCities, loading } = useData(
    () => getPopularCitiesWithCountry(8),
    [],
  );

  const cities = useMemo(
    () => (allCities ? pickCities(allCities, targetNames) : []),
    [allCities, targetNames],
  );

  const totalDays = cities.length >= 2 ? 10 : 5;
  const midpoint = Math.ceil(totalDays / 2);

  const [dayIndex, setDayIndex] = useState(0);
  const [planExpanded, setPlanExpanded] = useState(false);

  // Per-day tracking: dayIndex → Place[]
  const [addedByDay, setAddedByDay] = useState<Record<number, Place[]>>({});

  // AddToDaysSheet state
  const [sheetPlace, setSheetPlace] = useState<Place | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  // Current city for this day
  const currentCity = cities.length >= 2
    ? (dayIndex < midpoint ? cities[0] : cities[1])
    : cities[0] ?? null;

  // Current day's added places
  const currentDayPlaces = addedByDay[dayIndex] ?? [];

  const addedPlaceIds = useMemo(
    () => new Set(currentDayPlaces.map((p) => p.id)),
    [currentDayPlaces],
  );

  // Day range for current city (for the AddToDaysSheet)
  const cityDayRange = useMemo((): DayOption[] => {
    if (cities.length >= 2) {
      const start = dayIndex < midpoint ? 0 : midpoint;
      const end = dayIndex < midpoint ? midpoint : totalDays;
      const opts: DayOption[] = [];
      for (let i = start; i < end; i++) {
        opts.push({ index: i, label: `Day ${i + 1}`, sublabel: formatMockDate(i) });
      }
      return opts;
    }
    const opts: DayOption[] = [];
    for (let i = 0; i < totalDays; i++) {
      opts.push({ index: i, label: `Day ${i + 1}`, sublabel: formatMockDate(i) });
    }
    return opts;
  }, [cities.length, dayIndex, midpoint, totalDays]);

  // Total stops across all days
  const totalStops = useMemo(() => {
    let count = 0;
    for (const key of Object.keys(addedByDay)) {
      count += addedByDay[Number(key)].length;
    }
    return count;
  }, [addedByDay]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAddPlace = (place: Place) => {
    if (ACCOMMODATION_TYPES.has(place.placeType)) {
      // Accommodation → show day selection sheet
      setSheetPlace(place);
      setSheetVisible(true);
    } else {
      // Everything else → add to current day immediately
      addPlaceToDays(place, [dayIndex]);
    }
  };

  const addPlaceToDays = (place: Place, dayIndices: number[]) => {
    setAddedByDay((prev) => {
      const next = { ...prev };
      for (const d of dayIndices) {
        const existing = next[d] ?? [];
        // Don't add duplicates
        if (!existing.some((p) => p.id === place.id)) {
          next[d] = [...existing, place];
        }
      }
      return next;
    });
    if (!planExpanded && currentDayPlaces.length === 0) {
      setPlanExpanded(true);
    }
  };

  const handleSheetConfirm = (selectedIndices: number[]) => {
    if (sheetPlace) {
      addPlaceToDays(sheetPlace, selectedIndices);
    }
    setSheetVisible(false);
    setSheetPlace(null);
  };

  const handleRemovePlace = (placeId: string) => {
    setAddedByDay((prev) => {
      const next = { ...prev };
      const existing = next[dayIndex] ?? [];
      next[dayIndex] = existing.filter((p) => p.id !== placeId);
      return next;
    });
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading || cities.length === 0) return <LoadingScreen />;

  const routeText = cities.map((c) => `${getFlag(getIso2(c))} ${c.name}`).join(' \u2192 ');
  const currentCityName = currentCity?.name ?? '';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <NavigationHeader title="Example trip" parentTitle="Trips" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: FLOATING_TAB_BAR_HEIGHT + 80 }}
      >
        {/* Example badge */}
        <View style={styles.badgeRow}>
          <View style={styles.exampleBadge}>
            <SolaText style={styles.exampleBadgeText}>EXAMPLE TRIP</SolaText>
          </View>
        </View>

        {/* Route */}
        <View style={styles.routeSection}>
          <SolaText style={styles.routeText}>{routeText}</SolaText>
          <SolaText style={styles.routeMeta}>
            {totalDays} days · {cities.length} {cities.length === 1 ? 'destination' : 'destinations'}
            {totalStops > 0 ? ` · ${totalStops} stops added` : ''}
          </SolaText>
        </View>

        {/* Day navigator */}
        <View style={styles.dayNav}>
          <Pressable
            onPress={() => setDayIndex(Math.max(0, dayIndex - 1))}
            disabled={dayIndex === 0}
            hitSlop={12}
            style={styles.dayNavArrow}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={dayIndex === 0 ? colors.borderDefault : colors.textPrimary}
            />
          </Pressable>

          <View style={styles.dayNavCenter}>
            <SolaText style={styles.dayNavTitle}>
              Day {dayIndex + 1} of {totalDays}
            </SolaText>
            <SolaText style={styles.dayNavDate}>{formatMockDate(dayIndex)}</SolaText>
            {currentCity && (
              <SolaText style={styles.dayNavCity}>
                {getFlag(getIso2(currentCity))} {currentCityName}
              </SolaText>
            )}
          </View>

          <Pressable
            onPress={() => setDayIndex(Math.min(totalDays - 1, dayIndex + 1))}
            disabled={dayIndex === totalDays - 1}
            hitSlop={12}
            style={styles.dayNavArrow}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={dayIndex === totalDays - 1 ? colors.borderDefault : colors.textPrimary}
            />
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* Plan summary bar */}
        {currentDayPlaces.length > 0 && (
          <View style={styles.planBarWrapper}>
            <Pressable
              style={styles.planBar}
              onPress={() => setPlanExpanded(!planExpanded)}
            >
              <SolaText style={styles.planBarText}>
                Your plan · {currentDayPlaces.length} {currentDayPlaces.length === 1 ? 'stop' : 'stops'}
              </SolaText>
              <SolaText style={styles.planBarToggle}>
                {planExpanded ? 'Hide' : 'View'}
              </SolaText>
            </Pressable>

            {planExpanded && (
              <View style={styles.planList}>
                {currentDayPlaces.map((place) => (
                  <View key={place.id} style={styles.planItem}>
                    {place.imageUrlCached ? (
                      <Image
                        source={{ uri: place.imageUrlCached }}
                        style={styles.planItemThumb}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[styles.planItemThumb, styles.planItemThumbPlaceholder]}>
                        <View style={[
                          styles.planItemDot,
                          { backgroundColor: TYPE_DOT_COLOR[place.placeType] ?? colors.textMuted },
                        ]} />
                      </View>
                    )}
                    <View style={styles.planItemInfo}>
                      <SolaText style={styles.planItemName} numberOfLines={1}>{place.name}</SolaText>
                      <SolaText style={styles.planItemType}>
                        {TYPE_LABEL[place.placeType] ?? place.placeType}
                      </SolaText>
                    </View>
                    <Pressable
                      style={styles.planItemRemove}
                      onPress={() => handleRemovePlace(place.id)}
                      hitSlop={8}
                    >
                      <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Hint when no places added on this day */}
        {currentDayPlaces.length === 0 && (
          <View style={styles.hintBar}>
            <Ionicons name="arrow-down" size={16} color={colors.orange} />
            <SolaText style={styles.hintText}>
              Tap "Add" on any place to build your day
            </SolaText>
          </View>
        )}

        {/* Suggestions — real data from city */}
        {currentCity && (
          <TripDaySuggestions
            cityId={currentCity.id}
            addedPlaceIds={addedPlaceIds}
            onAdded={() => {}}
            onAddPlace={handleAddPlace}
          />
        )}
      </ScrollView>

      {/* CTA */}
      <View style={[styles.ctaContainer, { paddingBottom: insets.bottom + FLOATING_TAB_BAR_HEIGHT }]}>
        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}
          onPress={() => router.push('/trips/new')}
        >
          <SolaText style={styles.ctaText}>Start planning your trip</SolaText>
        </Pressable>
      </View>

      {/* AddToDaysSheet for accommodations */}
      <AddToDaysSheet
        visible={sheetVisible}
        placeName={sheetPlace?.name ?? ''}
        placeType={sheetPlace?.placeType ?? ''}
        days={cityDayRange}
        currentDayIndex={dayIndex}
        isAccommodation={sheetPlace ? ACCOMMODATION_TYPES.has(sheetPlace.placeType) : false}
        onConfirm={handleSheetConfirm}
        onClose={() => {
          setSheetVisible(false);
          setSheetPlace(null);
        }}
      />
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Badge
  badgeRow: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
  },
  exampleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.orangeFill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  exampleBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: colors.orange,
    letterSpacing: 0.8,
  },

  // Route
  routeSection: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
  },
  routeText: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  routeMeta: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Day navigator
  dayNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.lg,
  },
  dayNavArrow: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNavCenter: {
    alignItems: 'center',
  },
  dayNavTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  dayNavDate: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  dayNavCity: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginHorizontal: spacing.screenX,
  },

  // Plan bar
  planBarWrapper: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.screenX,
  },
  planBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  planBarText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  planBarToggle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },

  // Plan list (expanded)
  planList: {
    marginTop: spacing.md,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  planItemThumb: {
    width: 40,
    height: 40,
    borderRadius: radius.card,
  },
  planItemThumbPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planItemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  planItemInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  planItemName: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  planItemType: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  planItemRemove: {
    padding: spacing.xs,
  },

  // Hint
  hintBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.screenX,
    marginTop: spacing.lg,
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  hintText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },

  // CTA
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  ctaButton: {
    backgroundColor: colors.orange,
    paddingVertical: spacing.lg,
    borderRadius: radius.button,
    alignItems: 'center',
  },
  ctaPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  ctaText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
