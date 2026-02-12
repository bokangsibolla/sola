import React, { useState, useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import {
  getSavedPlacesWithDetails,
  toggleSavePlace,
} from '@/data/api';
import LoadingScreen from '@/components/LoadingScreen';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SavedPlaceItem {
  placeId: string;
  placeName: string;
  imageUrl: string | null;
  cityName: string | null;
}

// ---------------------------------------------------------------------------
// Place Row
// ---------------------------------------------------------------------------

function PlaceRow({
  place,
  userId,
  onRemoved,
}: {
  place: SavedPlaceItem;
  userId: string;
  onRemoved: (placeId: string) => void;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(true);

  const handleUnsave = async () => {
    setSaved(false);
    await toggleSavePlace(userId, place.placeId);
    onRemoved(place.placeId);
  };

  if (!saved) return null;

  return (
    <Pressable
      style={({ pressed }) => [styles.placeRow, pressed && { opacity: pressedState.opacity }]}
      onPress={() => router.push(`/discover/place-detail/${place.placeId}`)}
    >
      {place.imageUrl ? (
        <Image
          source={{ uri: place.imageUrl }}
          style={styles.placeImage}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.placeImage, styles.placeImagePlaceholder]}>
          <Feather name="map-pin" size={18} color={colors.textMuted} />
        </View>
      )}
      <View style={styles.placeContent}>
        <Text style={styles.placeName} numberOfLines={1}>
          {place.placeName}
        </Text>
        {place.cityName && (
          <Text style={styles.placeCity} numberOfLines={1}>
            {place.cityName}
          </Text>
        )}
      </View>
      <Pressable
        onPress={handleUnsave}
        hitSlop={12}
        style={styles.unsaveButton}
        accessibilityLabel="Remove from shortlist"
      >
        <Ionicons name="bookmark" size={20} color={colors.orange} />
      </Pressable>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function SavedPlacesScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture('saved_places_screen_viewed');
  }, [posthog]);

  const { data: places, loading, refetch } = useData<SavedPlaceItem[]>(
    () => (userId ? getSavedPlacesWithDetails(userId, 100) : Promise.resolve([])),
    ['saved-places-all', userId ?? ''],
  );

  const [removedIds, setRemovedIds] = useState<string[]>([]);

  const handleRemoved = (placeId: string) => {
    setRemovedIds((prev) => [...prev, placeId]);
  };

  const visiblePlaces = (places ?? []).filter(
    (p) => !removedIds.includes(p.placeId),
  );

  if (loading) return <LoadingScreen />;

  return (
    <AppScreen>
      <AppHeader
        title="Your Shortlist"
        leftComponent={
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={22} color={colors.textPrimary} />
          </Pressable>
        }
      />

      {visiblePlaces.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="bookmark" size={32} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No saved places yet</Text>
          <Text style={styles.emptyHint}>
            Tap the bookmark icon on any place to save it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={visiblePlaces}
          keyExtractor={(item) => item.placeId}
          renderItem={({ item }) => (
            <PlaceRow
              place={item}
              userId={userId!}
              onRemoved={handleRemoved}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // Back button
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // List
  listContent: {
    paddingBottom: spacing.xxl,
  },

  // Place row
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  placeImage: {
    width: 56,
    height: 56,
    borderRadius: radius.card,
    backgroundColor: colors.neutralFill,
  },
  placeImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeContent: {
    flex: 1,
  },
  placeName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  placeCity: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 2,
  },
  unsaveButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderSubtle,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    lineHeight: 22,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptyHint: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
