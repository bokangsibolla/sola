import { useCallback, useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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


export default function AreaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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

      {/* Summary section */}
      <View style={styles.summarySection}>
        {area.whoItSuits && (
          <View style={styles.whoItSuitsCard}>
            <Text style={styles.whoItSuitsLabel}>BEST FOR</Text>
            <Text style={styles.whoItSuitsText}>{area.whoItSuits}</Text>
          </View>
        )}

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{places?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Places</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{grouped.length}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{area.areaKind}</Text>
            <Text style={styles.statLabel}>Type</Text>
          </View>
        </View>
      </View>

      {/* Section headers for grouped places */}
      {grouped.length > 0 && (
        <View style={styles.placesHeader}>
          <Text style={styles.sectionTitle}>Places in {area.name}</Text>
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
  // Summary
  summarySection: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  whoItSuitsCard: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  whoItSuitsLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.orange,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  whoItSuitsText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.borderSubtle,
  },
  // Places
  placesHeader: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
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
