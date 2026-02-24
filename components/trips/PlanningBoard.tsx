import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { SavedPlaceCard } from './SavedPlaceCard';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.screenX * 2 - spacing.md) / 2;

interface PlaceDisplay {
  id: string;
  entityId: string;
  name: string;
  placeType: string;
  imageUrl: string | null;
}

interface PlanningBoardProps {
  places: PlaceDisplay[];
  onRemovePlace: (entityId: string) => void;
  onPlacePress: (entityId: string) => void;
  onAddMore: () => void;
  onBuildItinerary: () => void;
  building: boolean;
}

export const PlanningBoard: React.FC<PlanningBoardProps> = ({
  places,
  onRemovePlace,
  onPlacePress,
  onAddMore,
  onBuildItinerary,
  building,
}) => {
  // Build 2-column rows from flat list
  const rows: PlaceDisplay[][] = [];
  for (let i = 0; i < places.length; i += 2) {
    rows.push(places.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>SAVED PLACES</Text>
      <Text style={styles.subtitle}>
        {places.length} {places.length === 1 ? 'place' : 'places'} saved. Add
        more or build your itinerary.
      </Text>

      {/* 2-column grid */}
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.gridRow}>
          {row.map((place) => (
            <View key={place.id} style={{ width: CARD_WIDTH }}>
              <SavedPlaceCard
                name={place.name}
                placeType={place.placeType}
                imageUrl={place.imageUrl}
                onRemove={() => onRemovePlace(place.entityId)}
                onPress={() => onPlacePress(place.entityId)}
              />
            </View>
          ))}
        </View>
      ))}

      {/* Add more button */}
      <Pressable
        onPress={onAddMore}
        style={({ pressed }) => [
          styles.addMoreButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name="add" size={20} color={colors.orange} />
        <Text style={styles.addMoreText}>Add more places</Text>
      </Pressable>

      {/* Build itinerary CTA */}
      {places.length >= 2 && (
        <Pressable
          onPress={onBuildItinerary}
          disabled={building}
          style={({ pressed }) => [
            styles.buildButton,
            building && styles.buildButtonDisabled,
            pressed && !building && styles.pressed,
          ]}
        >
          <Ionicons
            name="sparkles-outline"
            size={18}
            color={colors.background}
            style={styles.buildIcon}
          />
          <Text style={styles.buildText}>
            {building ? 'Building...' : 'Build my itinerary'}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.orange,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  addMoreText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
    marginLeft: spacing.sm,
  },
  buildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
  },
  buildButtonDisabled: {
    opacity: 0.5,
  },
  buildIcon: {
    marginRight: spacing.sm,
  },
  buildText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.background,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
