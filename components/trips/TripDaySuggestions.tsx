import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SolaText } from '@/components/ui/SolaText';

import { getPlacesGroupedByTime } from '@/data/api';
import { createBlock } from '@/data/trips/itineraryApi';
import { useData } from '@/hooks/useData';
import type { Place } from '@/data/types';
import type { BlockType } from '@/data/trips/itineraryTypes';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

// ── Props ────────────────────────────────────────────────────────

interface TripDaySuggestionsProps {
  cityId: string;
  tripId?: string;
  dayId?: string;
  addedPlaceIds: Set<string>;
  onAdded: () => void;
  onAddPlace?: (place: Place) => void;
}

// ── Categories ──────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'stay', label: 'Stay' },
  { key: 'activities', label: 'Things to do' },
  { key: 'food', label: 'Eat & drink' },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]['key'];

// ── Labels & mapping ─────────────────────────────────────────────

export const ACCOMMODATION_TYPES = new Set(['hotel', 'hostel', 'homestay']);
const MEAL_TYPES = new Set(['restaurant', 'cafe', 'bakery', 'bar', 'club', 'rooftop']);
const ACTIVITY_TYPES = new Set(['activity', 'tour', 'landmark']);

function mapPlaceTypeToBlockType(placeType: string): BlockType {
  if (ACCOMMODATION_TYPES.has(placeType)) return 'accommodation';
  if (MEAL_TYPES.has(placeType)) return 'meal';
  if (ACTIVITY_TYPES.has(placeType)) return 'activity';
  return 'activity';
}

const PLACE_TYPE_LABELS: Record<string, string> = {
  hotel: 'Hotel',
  hostel: 'Hostel',
  homestay: 'Homestay',
  restaurant: 'Restaurant',
  cafe: 'Cafe',
  bakery: 'Bakery',
  bar: 'Bar',
  club: 'Nightlife',
  rooftop: 'Rooftop bar',
  activity: 'Activity',
  tour: 'Guided tour',
  landmark: 'Landmark',
  coworking: 'Coworking',
  wellness: 'Wellness',
  spa: 'Spa',
  salon: 'Salon',
  gym: 'Fitness',
  shop: 'Shopping',
  transport: 'Transport',
  laundry: 'Laundry',
  pharmacy: 'Pharmacy',
  clinic: 'Clinic',
  hospital: 'Hospital',
  atm: 'ATM',
  police: 'Police',
};

export function friendlyLabel(placeType: string): string {
  return PLACE_TYPE_LABELS[placeType] ?? placeType.charAt(0).toUpperCase() + placeType.slice(1);
}

// ── Route helper (mirrors PlaceHorizontalCard) ───────────────────

export function placeRoute(place: Place): string {
  if (ACCOMMODATION_TYPES.has(place.placeType)) {
    return `/(tabs)/discover/accommodation/${place.slug}`;
  }
  if (place.placeType === 'activity' || place.placeType === 'tour') {
    return `/(tabs)/discover/activity/${place.slug}`;
  }
  return `/(tabs)/discover/place-detail/${place.id}`;
}

// ── Grid dimensions ──────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = spacing.md;
const GRID_CARD_WIDTH = (SCREEN_WIDTH - spacing.screenX * 2 - GRID_GAP) / 2;
const GRID_IMAGE_HEIGHT = 100;

// ── Section component (horizontal scroll — used in "All" view) ───

interface SectionProps {
  title: string;
  places: Place[];
  tripId?: string;
  dayId?: string;
  onAdded: () => void;
  onAddPlace?: (place: Place) => void;
}

function SuggestionSection({ title, places, tripId, dayId, onAdded, onAddPlace }: SectionProps) {
  const router = useRouter();
  const [addingId, setAddingId] = useState<string | null>(null);
  const nextOrder = useRef(Date.now());

  const handleAdd = async (place: Place) => {
    if (onAddPlace) {
      onAddPlace(place);
      return;
    }
    if (!tripId || !dayId || addingId) return;
    setAddingId(place.id);
    try {
      await createBlock({
        tripId,
        tripDayId: dayId,
        blockType: mapPlaceTypeToBlockType(place.placeType),
        placeId: place.id,
        orderIndex: nextOrder.current++,
      });
      onAdded();
    } finally {
      setAddingId(null);
    }
  };

  return (
    <View style={styles.section}>
      <SolaText style={styles.sectionTitle}>{title}</SolaText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {places.map((place) => (
          <View key={place.id} style={styles.card}>
            <Pressable
              style={({ pressed }) => [pressed && styles.cardPressed]}
              onPress={() => router.push(placeRoute(place) as any)}
            >
              <View style={styles.imageContainer}>
                {place.imageUrlCached ? (
                  <Image
                    source={{ uri: place.imageUrlCached }}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <View style={[StyleSheet.absoluteFillObject, styles.imagePlaceholder]} />
                )}
              </View>
              <View style={styles.cardInfo}>
                <SolaText style={styles.placeName} numberOfLines={1}>{place.name}</SolaText>
                <SolaText style={styles.placeType} numberOfLines={1}>
                  {friendlyLabel(place.placeType)}
                </SolaText>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.addRow, pressed && styles.addRowPressed]}
              onPress={() => handleAdd(place)}
            >
              {addingId === place.id ? (
                <ActivityIndicator size="small" color={colors.orange} />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={16} color={colors.orange} />
                  <SolaText style={styles.addText}>Add</SolaText>
                </>
              )}
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ── Grid view (used in filtered category views) ──────────────────

interface GridProps {
  places: Place[];
  tripId?: string;
  dayId?: string;
  onAdded: () => void;
  onAddPlace?: (place: Place) => void;
}

function SuggestionGrid({ places, tripId, dayId, onAdded, onAddPlace }: GridProps) {
  const router = useRouter();
  const [addingId, setAddingId] = useState<string | null>(null);
  const nextOrder = useRef(Date.now());

  const handleAdd = async (place: Place) => {
    if (onAddPlace) {
      onAddPlace(place);
      return;
    }
    if (!tripId || !dayId || addingId) return;
    setAddingId(place.id);
    try {
      await createBlock({
        tripId,
        tripDayId: dayId,
        blockType: mapPlaceTypeToBlockType(place.placeType),
        placeId: place.id,
        orderIndex: nextOrder.current++,
      });
      onAdded();
    } finally {
      setAddingId(null);
    }
  };

  return (
    <View style={styles.grid}>
      {places.map((place) => (
        <View key={place.id} style={styles.gridCard}>
          <Pressable
            style={({ pressed }) => [pressed && styles.cardPressed]}
            onPress={() => router.push(placeRoute(place) as any)}
          >
            <View style={styles.gridImageContainer}>
              {place.imageUrlCached ? (
                <Image
                  source={{ uri: place.imageUrlCached }}
                  style={StyleSheet.absoluteFillObject}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={[StyleSheet.absoluteFillObject, styles.imagePlaceholder]} />
              )}
            </View>
            <View style={styles.cardInfo}>
              <SolaText style={styles.placeName} numberOfLines={1}>{place.name}</SolaText>
              <SolaText style={styles.placeType} numberOfLines={1}>
                {friendlyLabel(place.placeType)}
              </SolaText>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.addRow, pressed && styles.addRowPressed]}
            onPress={() => handleAdd(place)}
          >
            {addingId === place.id ? (
              <ActivityIndicator size="small" color={colors.orange} />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={16} color={colors.orange} />
                <SolaText style={styles.addText}>Add</SolaText>
              </>
            )}
          </Pressable>
        </View>
      ))}
    </View>
  );
}

// ── Main component ───────────────────────────────────────────────

export function TripDaySuggestions({ cityId, tripId, dayId, addedPlaceIds, onAdded, onAddPlace }: TripDaySuggestionsProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');

  const { data, loading } = useData(
    () => getPlacesGroupedByTime(cityId),
    [cityId],
  );

  if (loading || !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.textMuted} />
      </View>
    );
  }

  // Build category data — filter out already-added places
  const accommodations = data.accommodations.filter(p => !addedPlaceIds.has(p.id));
  const thingsToDo = [...data.morning, ...data.afternoon, ...data.fullDay].filter(p => !addedPlaceIds.has(p.id));
  const eatDrink = data.evening.filter(p => !addedPlaceIds.has(p.id));

  const hasAny = accommodations.length > 0 || thingsToDo.length > 0 || eatDrink.length > 0;

  if (!hasAny) {
    return (
      <View style={styles.emptyFallback}>
        <SolaText style={styles.emptyFallbackText}>No suggestions available for this destination yet</SolaText>
      </View>
    );
  }

  // Filtered places for category views
  const filteredPlaces =
    activeCategory === 'stay' ? accommodations :
    activeCategory === 'activities' ? thingsToDo :
    activeCategory === 'food' ? eatDrink :
    [];

  // Only show chips for categories that have data
  const visibleCategories = CATEGORIES.filter((cat) => {
    if (cat.key === 'all') return true;
    if (cat.key === 'stay') return accommodations.length > 0;
    if (cat.key === 'activities') return thingsToDo.length > 0;
    if (cat.key === 'food') return eatDrink.length > 0;
    return false;
  });

  return (
    <View style={styles.container}>
      {/* Category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {visibleCategories.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <Pressable
              key={cat.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveCategory(cat.key)}
            >
              <SolaText style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {cat.label}
              </SolaText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* "All" view — 3 horizontal scroll sections */}
      {activeCategory === 'all' && (
        <>
          {accommodations.length > 0 && (
            <SuggestionSection
              title="Where to stay"
              places={accommodations.slice(0, 8)}
              tripId={tripId}
              dayId={dayId}
              onAdded={onAdded}
              onAddPlace={onAddPlace}
            />
          )}
          {thingsToDo.length > 0 && (
            <SuggestionSection
              title="Things to do"
              places={thingsToDo.slice(0, 8)}
              tripId={tripId}
              dayId={dayId}
              onAdded={onAdded}
              onAddPlace={onAddPlace}
            />
          )}
          {eatDrink.length > 0 && (
            <SuggestionSection
              title="Where to eat & drink"
              places={eatDrink.slice(0, 8)}
              tripId={tripId}
              dayId={dayId}
              onAdded={onAdded}
              onAddPlace={onAddPlace}
            />
          )}
        </>
      )}

      {/* Filtered category view — 2-column grid */}
      {activeCategory !== 'all' && filteredPlaces.length > 0 && (
        <SuggestionGrid
          places={filteredPlaces}
          tripId={tripId}
          dayId={dayId}
          onAdded={onAdded}
          onAddPlace={onAddPlace}
        />
      )}

      {activeCategory !== 'all' && filteredPlaces.length === 0 && (
        <View style={styles.emptyFallback}>
          <SolaText style={styles.emptyFallbackText}>
            No suggestions in this category yet
          </SolaText>
        </View>
      )}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────

const CARD_WIDTH = 160;
const IMAGE_HEIGHT = 100;

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
  },
  loadingContainer: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  emptyFallback: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.screenX,
  },
  emptyFallbackText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Filter chips
  filterRow: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  filterChipActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  filterChipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  filterChipTextActive: {
    color: colors.orange,
  },

  // Section (horizontal scroll)
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.md,
  },

  // Horizontal scroll card
  card: {
    width: CARD_WIDTH,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: pressedState.opacity,
  },
  imageContainer: {
    height: IMAGE_HEIGHT,
  },
  imagePlaceholder: {
    backgroundColor: colors.neutralFill,
  },
  cardInfo: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  placeName: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  placeType: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },

  // Add button row (shared by both card and gridCard)
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    marginTop: spacing.sm,
    minHeight: 36,
  },
  addRowPressed: {
    backgroundColor: colors.orangeFill,
  },
  addText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },

  // Grid (filtered category view)
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.screenX,
    gap: GRID_GAP,
  },
  gridCard: {
    width: GRID_CARD_WIDTH,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  gridImageContainer: {
    height: GRID_IMAGE_HEIGHT,
  },
});
