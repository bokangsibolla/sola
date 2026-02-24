import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { getPlacesByCategoryForCity } from '@/data/city/cityApi';
import { createBlock } from '@/data/trips/itineraryApi';
import type { PlaceWithImage } from '@/data/city/types';
import type { Place } from '@/data/types';
import type { BlockType } from '@/data/trips/itineraryTypes';
import {
  CategoryFilterPills,
  CATEGORY_PLACE_TYPES,
} from '@/components/trips/CategoryFilterPills';
import type { PlaceCategory } from '@/components/trips/CategoryFilterPills';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SmartSearchSheetProps {
  visible: boolean;
  onClose: () => void;
  cityId: string;
  tripId: string;
  dayId: string;
  insertAfterIndex: number;
  existingBlockPlaceIds: string[];
  onPlaceAdded: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toBlockType(placeType: string): BlockType {
  const MEAL_TYPES = ['restaurant', 'cafe', 'bar', 'rooftop'];
  const ACCOMMODATION_TYPES = [
    'hotel', 'hostel', 'homestay', 'guesthouse', 'resort', 'villa', 'airbnb',
  ];
  const ACTIVITY_TYPES = ['activity', 'tour', 'wellness', 'spa'];
  if (MEAL_TYPES.includes(placeType)) return 'meal';
  if (ACCOMMODATION_TYPES.includes(placeType)) return 'accommodation';
  if (ACTIVITY_TYPES.includes(placeType)) return 'activity';
  return 'place';
}

/** Collect all place types across every category (excluding 'all' which is empty). */
function getAllPlaceTypes(): string[] {
  const allTypes = new Set<string>();
  const keys = Object.keys(CATEGORY_PLACE_TYPES) as PlaceCategory[];
  for (const key of keys) {
    if (key === 'all') continue;
    for (const t of CATEGORY_PLACE_TYPES[key]) {
      allTypes.add(t);
    }
  }
  return Array.from(allTypes);
}

const ALL_PLACE_TYPES = getAllPlaceTypes();

/** Format a placeType slug into a readable label. */
function formatPlaceType(placeType: string): string {
  return placeType.charAt(0).toUpperCase() + placeType.slice(1);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const SmartSearchSheet: React.FC<SmartSearchSheetProps> = ({
  visible,
  onClose,
  cityId,
  tripId,
  dayId,
  insertAfterIndex,
  existingBlockPlaceIds,
  onPlaceAdded,
}) => {
  const insets = useSafeAreaInsets();

  // State
  const [category, setCategory] = useState<PlaceCategory>('all');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [places, setPlaces] = useState<PlaceWithImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input (300ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchText.trim().toLowerCase());
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText]);

  // Fetch places when category or cityId changes
  useEffect(() => {
    if (!visible || !cityId) return;

    let cancelled = false;
    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const types = (
          category === 'all'
            ? ALL_PLACE_TYPES
            : CATEGORY_PLACE_TYPES[category]
        ) as Place['placeType'][];
        const result = await getPlacesByCategoryForCity(cityId, types);
        if (!cancelled) setPlaces(result);
      } catch {
        if (!cancelled) setPlaces([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPlaces();
    return () => {
      cancelled = true;
    };
  }, [visible, cityId, category]);

  // Reset state when sheet opens
  useEffect(() => {
    if (visible) {
      setCategory('all');
      setSearchText('');
      setDebouncedSearch('');
      setAddingId(null);
    }
  }, [visible]);

  // Filter places by search text (client-side)
  const filteredPlaces = useMemo(() => {
    if (!debouncedSearch) return places;
    return places.filter((p) =>
      p.name.toLowerCase().includes(debouncedSearch),
    );
  }, [places, debouncedSearch]);

  // Existing place IDs set for quick lookup
  const existingSet = useMemo(
    () => new Set(existingBlockPlaceIds),
    [existingBlockPlaceIds],
  );

  // Add a place as an itinerary block
  const handleAdd = useCallback(
    async (place: PlaceWithImage) => {
      if (addingId) return;
      setAddingId(place.id);
      try {
        await createBlock({
          tripId,
          tripDayId: dayId,
          blockType: toBlockType(place.placeType),
          orderIndex: insertAfterIndex,
          placeId: place.id,
          titleOverride: place.name,
        });
        onPlaceAdded();
      } catch {
        // Silently fail — could add error toast in the future
      } finally {
        setAddingId(null);
      }
    },
    [tripId, dayId, insertAfterIndex, addingId, onPlaceAdded],
  );

  // Render each place row
  const renderItem = useCallback(
    ({ item }: { item: PlaceWithImage }) => {
      const isAdded = existingSet.has(item.id);
      const isAdding = addingId === item.id;

      return (
        <View style={styles.row}>
          {/* Thumbnail */}
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.thumbnail}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
              <Ionicons
                name="image-outline"
                size={24}
                color={colors.textMuted}
              />
            </View>
          )}

          {/* Info */}
          <View style={styles.rowInfo}>
            <Text style={styles.placeName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.placeType} numberOfLines={1}>
              {formatPlaceType(item.placeType)}
            </Text>
            {item.address ? (
              <Text style={styles.placeAddress} numberOfLines={1}>
                {item.address}
              </Text>
            ) : null}
          </View>

          {/* Action */}
          {isAdded ? (
            <View style={styles.addedBadge}>
              <Text style={styles.addedText}>Added</Text>
            </View>
          ) : (
            <Pressable
              onPress={() => handleAdd(item)}
              style={({ pressed }) => [
                styles.addButton,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
              disabled={isAdding}
              hitSlop={8}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color={colors.orange} />
              ) : (
                <Ionicons name="add" size={24} color={colors.orange} />
              )}
            </Pressable>
          )}
        </View>
      );
    },
    [existingSet, addingId, handleAdd],
  );

  const keyExtractor = useCallback((item: PlaceWithImage) => item.id, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add a stop</Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
            hitSlop={8}
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Search input */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search places..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <Pressable
              onPress={() => setSearchText('')}
              hitSlop={8}
              style={styles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          )}
        </View>

        {/* Category pills */}
        <CategoryFilterPills selected={category} onSelect={setCategory} />

        {/* Results */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.orange} />
          </View>
        ) : (
          <FlatList
            data={filteredPlaces}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + spacing.xl },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {debouncedSearch
                    ? 'No places match your search'
                    : 'No places found for this category'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.screenX,
    marginBottom: spacing.sm,
    height: 48,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.neutralFill,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    height: 48,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: colors.neutralFill,
  },
  thumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  placeName: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  placeType: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  placeAddress: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.orangeFill,
    backgroundColor: colors.orangeFill,
  },
  addedBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.neutralFill,
  },
  addedText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxxxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
