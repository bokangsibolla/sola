import { useCallback, useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import LoadingScreen from '@/components/LoadingScreen';
import NavigationHero from '@/components/NavigationHero';
import { useNavContext } from '@/hooks/useNavContext';
import { useData } from '@/hooks/useData';
import {
  getAreaById,
  getPlacesByArea,
  getCityById,
} from '@/data/api';
import type { Place } from '@/data/types';
import { CompactPlaceCard } from '@/components/explore/city/CompactPlaceCard';

/** Maps practical_info keys to display labels and icons */
const practicalKeyMeta: Record<string, { label: string; icon: string }> = {
  getting_around: { label: 'Getting around', icon: 'walk-outline' },
  wifi: { label: 'WiFi', icon: 'wifi-outline' },
  atms: { label: 'ATMs', icon: 'card-outline' },
  sim_cards: { label: 'SIM cards', icon: 'phone-portrait-outline' },
  budget_note: { label: 'Budget', icon: 'cash-outline' },
  nearest_hospital: { label: 'Nearest hospital', icon: 'medkit-outline' },
};

/** Ordered keys for consistent display */
const practicalKeyOrder = [
  'getting_around',
  'wifi',
  'atms',
  'sim_cards',
  'budget_note',
  'nearest_hospital',
];

export default function AreaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  // Fetch area
  const { data: area, loading: areaLoading } = useData(
    () => getAreaById(id ?? ''),
    ['areaById', id],
  );

  // Fetch city name
  const { data: city } = useData(
    () => area?.cityId ? getCityById(area.cityId) : Promise.resolve(null),
    ['cityById', area?.cityId],
  );

  const { parentTitle, ancestors, handleBack } = useNavContext({
    title: area?.name ?? 'Area',
    path: `/(tabs)/discover/area/${id}`,
    fallbackCrumbs: [
      { label: 'Discover', path: '/(tabs)/discover' },
      ...(city ? [{ label: city.name, path: `/(tabs)/discover/city/${city.slug}` }] : []),
    ],
  });

  // Fetch places in this area
  const { data: places, loading: placesLoading } = useData(
    () => id ? getPlacesByArea(id) : Promise.resolve([]),
    ['placesByArea', id],
  );

  // Group places by type
  const grouped = useMemo(() => {
    if (!places || places.length === 0) return [];

    const groupMap = new Map<string, Place[]>();
    for (const p of places) {
      const existing = groupMap.get(p.placeType) ?? [];
      existing.push(p);
      groupMap.set(p.placeType, existing);
    }

    const typeLabels: Record<string, string> = {
      restaurant: 'Restaurants',
      cafe: 'Cafes',
      bar: 'Bars',
      club: 'Clubs',
      rooftop: 'Rooftops',
      hotel: 'Hotels',
      hostel: 'Hostels',
      homestay: 'Homestays',
      activity: 'Activities',
      landmark: 'Landmarks',
      tour: 'Tours',
      wellness: 'Wellness',
      spa: 'Spas',
      salon: 'Salons',
      gym: 'Gyms',
      coworking: 'Coworking',
      bakery: 'Bakeries',
      shop: 'Shops',
      transport: 'Transport',
      pharmacy: 'Pharmacies',
    };

    return Array.from(groupMap.entries()).map(([type, items]) => ({
      type,
      label: typeLabels[type] ?? type,
      places: items,
    }));
  }, [places]);

  // Practical info rows (only show keys that have values)
  const practicalRows = useMemo(() => {
    if (!area?.practicalInfo) return [];
    return practicalKeyOrder
      .filter((key) => area.practicalInfo?.[key])
      .map((key) => ({
        key,
        label: practicalKeyMeta[key]?.label ?? key,
        icon: practicalKeyMeta[key]?.icon ?? 'information-circle-outline',
        value: area.practicalInfo![key],
      }));
  }, [area?.practicalInfo]);

  const renderItem = useCallback(({ item }: { item: Place }) => {
    return (
      <CompactPlaceCard
        place={{ ...item, imageUrl: item.imageUrlCached ?? null, areaName: null }}
      />
    );
  }, []);

  const keyExtractor = useCallback((item: Place) => item.id, []);

  if (areaLoading) return <LoadingScreen />;
  if (!area) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>Area not found</Text>
      </View>
    );
  }

  const ListHeader = (
    <View>
      {/* Hero */}
      <NavigationHero
        imageUrl={area.heroImageUrl}
        title={area.name}
        label={city?.name}
        subtitle={area.positioningLine ?? undefined}
        parentTitle={parentTitle}
        ancestors={ancestors}
        onBack={handleBack}
        height={240}
      />

      {/* Best for pill */}
      {area.whoItSuits && (
        <View style={styles.bestForSection}>
          <View style={styles.bestForPill}>
            <Text style={styles.bestForLabel}>BEST FOR</Text>
            <Text style={styles.bestForText}>{area.whoItSuits}</Text>
          </View>
        </View>
      )}

      {/* Vibe description */}
      {area.vibeDescription && (
        <View style={styles.vibeSection}>
          <Text style={styles.vibeText}>{area.vibeDescription}</Text>
        </View>
      )}

      {/* Crowd vibe */}
      {area.crowdVibe && (
        <View style={styles.crowdSection}>
          <Text style={styles.crowdLabel}>Who you'll find here</Text>
          <Text style={styles.crowdText}>{area.crowdVibe}</Text>
        </View>
      )}

      {/* Practical info */}
      {practicalRows.length > 0 && (
        <View style={styles.practicalSection}>
          <Text style={styles.practicalTitle}>Practical info</Text>
          {practicalRows.map((row, i) => (
            <View
              key={row.key}
              style={[
                styles.practicalRow,
                i < practicalRows.length - 1 && styles.practicalRowBorder,
              ]}
            >
              <View style={styles.practicalIconCol}>
                <Ionicons
                  name={row.icon as any}
                  size={18}
                  color={colors.textSecondary}
                />
              </View>
              <View style={styles.practicalContent}>
                <Text style={styles.practicalLabel}>{row.label}</Text>
                <Text style={styles.practicalValue}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Places header */}
      {grouped.length > 0 && (
        <View style={styles.placesHeader}>
          <Text style={styles.sectionTitle}>
            Places in {area.name}
          </Text>
          <Text style={styles.placesCount}>
            {places?.length ?? 0} places
          </Text>
        </View>
      )}

      {/* Render grouped place sections */}
      {grouped.map((group) => (
        <View key={group.type} style={styles.groupSection}>
          <Text style={styles.groupLabel}>{group.label}</Text>
          {group.places.map((place) => (
            <View key={place.id} style={styles.placeCardWrapper}>
              <CompactPlaceCard
                place={{ ...place, imageUrl: place.imageUrlCached ?? null, areaName: null }}
              />
            </View>
          ))}
        </View>
      ))}

      {/* Empty state */}
      {(!places || places.length === 0) && !placesLoading && (
        <View style={styles.emptySection}>
          <Text style={styles.emptyText}>No places added to this area yet</Text>
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      data={[]}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeader}
      style={styles.container}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: spacing.xxxxl,
  },
  notFound: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },

  // Best for pill
  bestForSection: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
  },
  bestForPill: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  bestForLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.orange,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bestForText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },

  // Vibe description
  vibeSection: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
  },
  vibeText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 26,
    color: colors.textPrimary,
  },

  // Crowd vibe
  crowdSection: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
  },
  crowdLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  crowdText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },

  // Practical info
  practicalSection: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  practicalTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  practicalRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
  },
  practicalRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  practicalIconCol: {
    width: 28,
    paddingTop: 2,
  },
  practicalContent: {
    flex: 1,
  },
  practicalLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  practicalValue: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  // Places
  placesHeader: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.xxl,
    marginTop: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  placesCount: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  groupSection: {
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.lg,
  },
  groupLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  placeCardWrapper: {
    marginBottom: 0,
  },
  emptySection: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
});
