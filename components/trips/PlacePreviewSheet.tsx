import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { friendlyLabel } from '@/components/trips/TripDaySuggestions';
import type { Place } from '@/data/types';

// ── Types ────────────────────────────────────────────────────────────────────

interface PlacePreviewSheetProps {
  visible: boolean;
  place: Place | null;
  onAddToDay: (place: Place) => void;
  onViewDetails: (place: Place) => void;
  onClose: () => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export function PlacePreviewSheet({
  visible,
  place,
  onAddToDay,
  onViewDetails,
  onClose,
}: PlacePreviewSheetProps) {
  const insets = useSafeAreaInsets();

  if (!place) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Image */}
        <View style={styles.imageContainer}>
          {place.imageUrlCached ? (
            <Image
              source={{ uri: place.imageUrlCached }}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.imagePlaceholder]}>
              <Ionicons name="image-outline" size={32} color={colors.textMuted} />
            </View>
          )}
        </View>

        {/* Type label */}
        <SolaText variant="pillLabel" color={colors.textMuted} uppercase letterSpacing={0.5} style={styles.typeLabel}>{friendlyLabel(place.placeType)}</SolaText>

        {/* Place name */}
        <SolaText style={styles.placeName}>{place.name}</SolaText>

        {/* Address */}
        {place.address != null && (
          <SolaText style={styles.address} numberOfLines={2}>{place.address}</SolaText>
        )}

        {/* Action buttons */}
        <View style={styles.buttonRow}>
          <Pressable
            style={styles.outlineButton}
            onPress={() => onViewDetails(place)}
          >
            <SolaText style={styles.outlineButtonText}>View details</SolaText>
          </Pressable>
          <Pressable
            style={styles.filledButton}
            onPress={() => onAddToDay(place)}
          >
            <SolaText style={styles.filledButtonText}>Add to day</SolaText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.module,
    borderTopRightRadius: radius.module,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.screenX,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderDefault,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },

  // Image
  imageContainer: {
    height: 180,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  imagePlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content
  typeLabel: {
    marginTop: spacing.lg,
  },
  placeName: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  address: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  outlineButton: {
    flex: 1,
    height: 48,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  filledButton: {
    flex: 1,
    height: 48,
    borderRadius: radius.button,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
