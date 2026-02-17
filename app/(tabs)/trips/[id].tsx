import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { usePostHog } from 'posthog-react-native';
import { getCityById } from '@/data/api';
import { useTripDetail } from '@/data/trips/useTripDetail';
import { updateTrip, deleteTrip } from '@/data/trips/tripApi';
import { formatDateShort, getFlag, tripDayNumber, STATUS_COLORS } from '@/data/trips/helpers';
import { useData } from '@/hooks/useData';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import SegmentedControl from '@/components/trips/SegmentedControl';
import JourneyTimeline from '@/components/trips/JourneyTimeline';
import AddEntrySheet from '@/components/trips/AddEntrySheet';
import PlanTab from '@/components/trips/PlanTab';
import PeopleTab from '@/components/trips/PeopleTab';
import { colors, fonts, spacing, radius } from '@/constants/design';
import NavigationHeader from '@/components/NavigationHeader';

const TABS = ['Journey', 'Plan', 'People'];

export default function TripDetailScreen() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();

  const { trip, entries, savedItems, loading, error, refetchAll, refetchEntries, refetchSaved } =
    useTripDetail(id);

  const [activeTab, setActiveTab] = useState(tab ? parseInt(tab, 10) || 0 : 0);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const tripStops = trip?.stops ?? [];
  const firstStop = tripStops[0];
  const { data: city } = useData(
    () => (firstStop?.cityId ? getCityById(firstStop.cityId) : Promise.resolve(null)),
    [firstStop?.cityId]
  );
  const heroUrl = city?.heroImageUrl ?? trip?.coverImageUrl ?? null;

  useEffect(() => {
    if (id) posthog.capture('trip_detail_viewed', { trip_id: id, tab: TABS[activeTab] });
  }, [id, posthog]);

  useFocusEffect(
    useCallback(() => {
      refetchAll();
    }, [refetchAll]),
  );

  const handleToggleMatching = async () => {
    if (!trip) return;
    const newValue = !trip.matchingOptIn;
    await updateTrip(trip.id, { matchingOptIn: newValue });
    refetchAll();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete trip',
      'This will permanently delete this trip and all its entries. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!trip) return;
            await deleteTrip(trip.id);
            router.back();
          },
        },
      ]
    );
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetchAll} />;

  if (!trip) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <NavigationHeader title="Trip" parentTitle="Trips" />
        <Text style={styles.notFound}>Trip not found</Text>
      </View>
    );
  }

  const flag = getFlag(trip.countryIso2);
  const dayNum = tripDayNumber(trip);
  const stops = trip.stops ?? [];
  const stopsText = stops.length > 1
    ? stops.map((s) => s.cityName || s.countryIso2).join(' → ')
    : trip.destinationName;
  const dateText = trip.arriving && trip.leaving
    ? `${formatDateShort(trip.arriving)} — ${formatDateShort(trip.leaving)}`
    : 'Flexible dates';
  const statusStyle = STATUS_COLORS[trip.status] ?? STATUS_COLORS.draft;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Nav bar */}
      <NavigationHeader
        title="Trip"
        parentTitle="Trips"
        rightActions={
          <Pressable onPress={() => setShowMenu(!showMenu)} hitSlop={12}>
            <Ionicons name="ellipsis-horizontal" size={24} color={colors.textPrimary} />
          </Pressable>
        }
      />

      {/* Overflow menu */}
      {showMenu && (
        <View style={styles.menu}>
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              handleDelete();
            }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.emergency} />
            <Text style={[styles.menuItemText, { color: colors.emergency }]}>Delete trip</Text>
          </Pressable>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero header */}
        <View style={styles.heroContainer}>
          {heroUrl ? (
            <Image source={{ uri: heroUrl }} style={styles.heroImage} contentFit="cover" transition={200} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]} />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.65)']}
            style={styles.gradient}
          />
          <View style={styles.overlay}>
            <View style={styles.statusRow}>
              <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                  {statusStyle.label}{dayNum ? ` · Day ${dayNum}` : ''}
                </Text>
              </View>
            </View>
            <Text style={styles.heroTitle} numberOfLines={1}>
              {trip.title || trip.destinationName}
            </Text>
            <Text style={styles.heroSubtitle} numberOfLines={1}>
              {flag} {stopsText} · {trip.nights} {trip.nights === 1 ? 'night' : 'nights'}
            </Text>
            <Text style={styles.heroDates}>{dateText}</Text>
          </View>
        </View>

        {/* Segmented control */}
        <SegmentedControl
          tabs={TABS}
          activeIndex={activeTab}
          onTabPress={setActiveTab}
        />

        {/* Tab content */}
        <View style={styles.tabContent}>
          {activeTab === 0 && (
            <JourneyTimeline entries={entries} />
          )}
          {activeTab === 1 && (
            <PlanTab
              trip={trip}
              savedItems={savedItems}
              onRefresh={refetchSaved}
            />
          )}
          {activeTab === 2 && (
            <PeopleTab
              tripId={trip.id}
              matchingOptIn={trip.matchingOptIn}
              onToggleMatching={handleToggleMatching}
            />
          )}
        </View>
      </ScrollView>

      {/* Floating add entry button (Journey tab only) */}
      {activeTab === 0 && (
        <Pressable
          style={[styles.fab, { bottom: insets.bottom + spacing.lg }]}
          onPress={() => setShowAddEntry(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </Pressable>
      )}

      {/* Add entry sheet */}
      <AddEntrySheet
        tripId={trip.id}
        visible={showAddEntry}
        onClose={() => setShowAddEntry(false)}
        onSaved={refetchEntries}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  menu: {
    position: 'absolute',
    top: 80,
    right: spacing.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.sm,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  menuItemText: {
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  // Hero header
  heroContainer: {
    height: 220,
    position: 'relative',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroPlaceholder: {
    backgroundColor: colors.neutralFill,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  statusText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  heroTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  heroDates: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  // Tab content
  tabContent: {
    paddingHorizontal: spacing.lg,
    minHeight: 400,
  },
  // FAB
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
});
