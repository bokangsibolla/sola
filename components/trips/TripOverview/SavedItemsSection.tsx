import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TripSavedItem } from '@/data/trips/types';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

interface SavedItemsSectionProps {
  items: TripSavedItem[];
  onItemPress: (item: TripSavedItem) => void;
  onAddPress: () => void;
}

export const SavedItemsSection: React.FC<SavedItemsSectionProps> = ({
  items,
  onItemPress,
  onAddPress,
}) => {
  if (items.length === 0) return null;

  const data = [...items, { id: '__add__' } as TripSavedItem & { id: string }];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>SAVED FOR THIS TRIP</Text>

      <FlatList
        horizontal
        data={data}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          if (item.id === '__add__') {
            return (
              <Pressable
                onPress={onAddPress}
                style={({ pressed }) => [styles.addCard, pressed && pressedState]}
              >
                <Ionicons name="add" size={24} color={colors.orange} />
                <Text style={styles.addText}>Add</Text>
              </Pressable>
            );
          }

          const categoryLabel = item.category === 'general' ? item.entityType : item.category;

          return (
            <Pressable
              onPress={() => onItemPress(item)}
              style={({ pressed }) => [styles.itemCard, pressed && pressedState]}
            >
              <View style={styles.itemIcon}>
                <Ionicons
                  name={getCategoryIcon(item.category)}
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
              <Text style={styles.itemLabel} numberOfLines={2}>
                {item.notes || categoryLabel}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
};

function getCategoryIcon(category: string): keyof typeof Ionicons.glyphMap {
  switch (category) {
    case 'accommodation': return 'bed-outline';
    case 'food': return 'restaurant-outline';
    case 'activity': return 'bicycle-outline';
    case 'transport': return 'car-outline';
    default: return 'bookmark-outline';
  }
}

const styles = StyleSheet.create({
  section: {
    paddingTop: spacing.xl,
  },
  sectionHeader: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 0.5,
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.sm,
  },
  itemCard: {
    width: 100,
    height: 88,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.md,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  addCard: {
    width: 100,
    height: 88,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
  },
});
