import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TripDaySuggestions } from '@/components/trips/TripDaySuggestions';
import type { Place } from '@/data/types';
import { colors, fonts, spacing } from '@/constants/design';

interface BrowsePlacesSheetProps {
  visible: boolean;
  onClose: () => void;
  dayIndex: number;
  cityId: string;
  tripId: string;
  dayId: string;
  addedPlaceIds: Set<string>;
  onAdded: () => void;
  onAddPlace: (place: Place) => void;
}

export const BrowsePlacesSheet: React.FC<BrowsePlacesSheetProps> = ({
  visible,
  onClose,
  dayIndex,
  cityId,
  tripId,
  dayId,
  addedPlaceIds,
  onAdded,
  onAddPlace,
}) => {
  const insets = useSafeAreaInsets();

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
          <Text style={styles.title}>Add to Day {dayIndex}</Text>
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

        {/* Body */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        >
          <TripDaySuggestions
            cityId={cityId}
            tripId={tripId}
            dayId={dayId}
            addedPlaceIds={addedPlaceIds}
            onAdded={onAdded}
            onAddPlace={onAddPlace}
          />
        </ScrollView>
      </View>
    </Modal>
  );
};

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
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutralFill,
  },
});
