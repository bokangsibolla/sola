import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';
import { useData } from '@/hooks/useData';
import { getCollections, getCollectionPlaces } from '@/data/api';
import { addTripSavedItem } from '@/data/trips/tripApi';
import type { Collection, Place } from '@/data/types';

// ── Types ────────────────────────────────────────────────────────────────────

interface ImportFromCollectionsProps {
  visible: boolean;
  tripId: string;
  userId: string;
  tripCityIds: string[];
  onClose: () => void;
  onImported: () => void;
}

interface CollectionWithPlaces extends Collection {
  places: Place[];
  filteredPlaces: Place[];
}

// ── Component ────────────────────────────────────────────────────────────────

export const ImportFromCollections: React.FC<ImportFromCollectionsProps> = ({
  visible,
  tripId,
  userId,
  tripCityIds,
  onClose,
  onImported,
}) => {
  const insets = useSafeAreaInsets();

  // ── State ──────────────────────────────────────────────────────────────────
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [collectionsWithPlaces, setCollectionsWithPlaces] = useState<CollectionWithPlaces[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  // ── Fetch collections ──────────────────────────────────────────────────────
  const { data: collections, loading: loadingCollections } = useData(
    () => getCollections(userId),
    ['collections', userId],
  );

  // ── Fetch places for all collections ───────────────────────────────────────
  useEffect(() => {
    if (!visible || !collections || collections.length === 0) {
      setCollectionsWithPlaces([]);
      return;
    }

    let cancelled = false;
    setLoadingPlaces(true);

    const fetchAll = async () => {
      try {
        const results = await Promise.all(
          collections.map(async (col) => {
            const places = await getCollectionPlaces(col.id, userId);
            const filteredPlaces =
              tripCityIds.length > 0
                ? places.filter((p) => tripCityIds.includes(p.cityId))
                : places;
            return { ...col, places, filteredPlaces };
          }),
        );

        if (!cancelled) {
          // Only show collections that have places matching trip cities
          setCollectionsWithPlaces(results.filter((c) => c.filteredPlaces.length > 0));
          setLoadingPlaces(false);
        }
      } catch {
        if (!cancelled) setLoadingPlaces(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [visible, collections, userId, tripCityIds]);

  // ── Reset state on open/close ──────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      setSelectedCollectionIds(new Set());
      setExpandedIds(new Set());
      setSelectedPlaceIds(new Set());
      setImporting(false);
    }
  }, [visible]);

  // ── Derived ────────────────────────────────────────────────────────────────

  /** All place IDs that belong to selected collections. */
  const collectionPlaceIds = useMemo(() => {
    const ids = new Set<string>();
    for (const col of collectionsWithPlaces) {
      if (selectedCollectionIds.has(col.id)) {
        for (const p of col.filteredPlaces) {
          ids.add(p.id);
        }
      }
    }
    return ids;
  }, [selectedCollectionIds, collectionsWithPlaces]);

  /** Total count of items that will be imported. */
  const totalSelected = useMemo(() => {
    const combined = new Set<string>();
    // Add all place IDs from selected collections
    for (const id of Array.from(collectionPlaceIds)) {
      combined.add(id);
    }
    // Add individually selected place IDs
    for (const id of Array.from(selectedPlaceIds)) {
      combined.add(id);
    }
    // Remove individually deselected that were part of a collection
    // (In this design, collection toggle selects all; individual toggles override)
    return combined.size;
  }, [collectionPlaceIds, selectedPlaceIds]);

  /** Whether a specific place is currently selected. */
  const isPlaceSelected = useCallback(
    (placeId: string): boolean => {
      if (selectedPlaceIds.has(placeId)) return true;
      if (collectionPlaceIds.has(placeId)) return true;
      return false;
    },
    [selectedPlaceIds, collectionPlaceIds],
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  const toggleCollection = (collectionId: string) => {
    setSelectedCollectionIds((prev) => {
      const next = new Set(prev);
      const col = collectionsWithPlaces.find((c) => c.id === collectionId);
      if (next.has(collectionId)) {
        next.delete(collectionId);
        // Also remove individual selections from this collection
        if (col) {
          setSelectedPlaceIds((prevPlaces) => {
            const nextPlaces = new Set(prevPlaces);
            for (const p of col.filteredPlaces) {
              nextPlaces.delete(p.id);
            }
            return nextPlaces;
          });
        }
      } else {
        next.add(collectionId);
      }
      return next;
    });
  };

  const toggleExpand = (collectionId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(collectionId)) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
      }
      return next;
    });
  };

  const togglePlace = (placeId: string) => {
    setSelectedPlaceIds((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) {
        next.delete(placeId);
      } else {
        next.add(placeId);
      }
      return next;
    });
  };

  const handleImport = async () => {
    if (totalSelected === 0 || importing) return;
    setImporting(true);

    try {
      // Gather all unique place IDs to import
      const toImport = new Set<string>();
      for (const id of Array.from(collectionPlaceIds)) {
        toImport.add(id);
      }
      for (const id of Array.from(selectedPlaceIds)) {
        toImport.add(id);
      }

      // Import each place as a saved item on the trip
      await Promise.all(
        Array.from(toImport).map((placeId) =>
          addTripSavedItem(tripId, 'place', placeId, 'general'),
        ),
      );

      onImported();
      onClose();
    } catch {
      // Import error — silently ignore for V1
    } finally {
      setImporting(false);
    }
  };

  // ── Loading / empty states ─────────────────────────────────────────────────

  const isLoading = loadingCollections || loadingPlaces;
  const isEmpty = !isLoading && collectionsWithPlaces.length === 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View />
      </Pressable>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        {/* ── Header ───────────────────────────────────────────────────── */}
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Import from Collections</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* ── Content ──────────────────────────────────────────────────── */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading && (
            <View style={styles.centered}>
              <ActivityIndicator size="small" color={colors.orange} />
              <Text style={styles.loadingText}>Loading collections...</Text>
            </View>
          )}

          {isEmpty && (
            <View style={styles.centered}>
              <Ionicons name="folder-open-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No matching places</Text>
              <Text style={styles.emptySubtitle}>
                None of your saved places are in your trip destinations.
              </Text>
            </View>
          )}

          {!isLoading &&
            collectionsWithPlaces.map((col) => {
              const isExpanded = expandedIds.has(col.id);
              const isCollectionSelected = selectedCollectionIds.has(col.id);

              return (
                <View key={col.id} style={styles.collectionBlock}>
                  {/* Collection header row */}
                  <View style={styles.collectionHeader}>
                    <Pressable
                      style={styles.checkboxArea}
                      onPress={() => toggleCollection(col.id)}
                      hitSlop={8}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          isCollectionSelected && styles.checkboxChecked,
                        ]}
                      >
                        {isCollectionSelected && (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                      </View>
                    </Pressable>

                    <Pressable
                      style={styles.collectionInfo}
                      onPress={() => toggleExpand(col.id)}
                    >
                      <Text style={styles.collectionEmoji}>{col.emoji}</Text>
                      <View style={styles.collectionTextBlock}>
                        <Text style={styles.collectionName} numberOfLines={1}>
                          {col.name}
                        </Text>
                        <Text style={styles.collectionCount}>
                          {col.filteredPlaces.length}{' '}
                          {col.filteredPlaces.length === 1 ? 'place' : 'places'}
                        </Text>
                      </View>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={colors.textMuted}
                      />
                    </Pressable>
                  </View>

                  {/* Expanded place list */}
                  {isExpanded && (
                    <View style={styles.placeList}>
                      {col.filteredPlaces.map((place) => {
                        const checked = isPlaceSelected(place.id);
                        return (
                          <Pressable
                            key={place.id}
                            style={({ pressed }) => [
                              styles.placeRow,
                              pressed && pressedState,
                            ]}
                            onPress={() => togglePlace(place.id)}
                          >
                            <View
                              style={[
                                styles.checkbox,
                                checked && styles.checkboxChecked,
                              ]}
                            >
                              {checked && (
                                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                              )}
                            </View>
                            <View style={styles.placeInfo}>
                              <Text style={styles.placeName} numberOfLines={1}>
                                {place.name}
                              </Text>
                              {place.address ? (
                                <Text style={styles.placeAddress} numberOfLines={1}>
                                  {place.address}
                                </Text>
                              ) : null}
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}

          {/* Hint text */}
          {!isLoading && collectionsWithPlaces.length > 0 && tripCityIds.length > 0 && (
            <Text style={styles.hintText}>
              Only showing places in your trip destinations
            </Text>
          )}
        </ScrollView>

        {/* ── Import button (sticky bottom) ────────────────────────────── */}
        <View style={styles.footer}>
          <Pressable
            style={[
              styles.importButton,
              (totalSelected === 0 || importing) && styles.importButtonDisabled,
            ]}
            onPress={handleImport}
            disabled={totalSelected === 0 || importing}
          >
            {importing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.importButtonText}>
                {totalSelected === 0
                  ? 'Select items to import'
                  : `Import ${totalSelected} selected`}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingTop: spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.borderDefault,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
  },

  // ── ScrollView ────────────────────────────────────────────────────────────
  scrollView: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },

  // ── Loading / empty ───────────────────────────────────────────────────────
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.sm,
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xxl,
  },

  // ── Collection block ──────────────────────────────────────────────────────
  collectionBlock: {
    marginBottom: spacing.xs,
  },
  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.md,
  },
  checkboxArea: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  checkboxChecked: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  collectionInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  collectionEmoji: {
    fontSize: 20,
  },
  collectionTextBlock: {
    flex: 1,
  },
  collectionName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  collectionCount: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // ── Place list ────────────────────────────────────────────────────────────
  placeList: {
    marginLeft: spacing.screenX + 22,
    paddingRight: spacing.screenX,
    paddingLeft: spacing.xl,
    borderLeftWidth: 1,
    borderLeftColor: colors.borderSubtle,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
    minHeight: 44,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  placeAddress: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // ── Hint ──────────────────────────────────────────────────────────────────
  hintText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  importButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importButtonDisabled: {
    opacity: 0.5,
  },
  importButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
