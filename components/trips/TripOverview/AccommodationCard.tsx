import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TripAccommodation } from '@/data/trips/types';
import {
  formatDateRange,
  nightsCount,
  ACCOMMODATION_STATUS_COLORS,
} from '@/data/trips/helpers';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

interface AccommodationCardProps {
  accommodation: TripAccommodation;
  onPress: () => void;
}

export const AccommodationCard: React.FC<AccommodationCardProps> = ({
  accommodation,
  onPress,
}) => {
  const nights = nightsCount(accommodation.checkIn, accommodation.checkOut);
  const dateRange = formatDateRange(accommodation.checkIn, accommodation.checkOut);
  const statusStyle = ACCOMMODATION_STATUS_COLORS[accommodation.status];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && pressedState]}
      accessibilityRole="button"
    >
      <View style={styles.iconContainer}>
        <Ionicons name="bed-outline" size={20} color={colors.textSecondary} />
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {accommodation.name}
        </Text>
        <Text style={styles.meta}>
          {dateRange} · {nights} {nights === 1 ? 'night' : 'nights'}
        </Text>
      </View>

      <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
        <Text style={[styles.statusText, { color: statusStyle.text }]}>
          {statusStyle.label}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
};

interface AccommodationPlaceholderProps {
  cityName: string;
  onPress: () => void;
}

export const AccommodationPlaceholder: React.FC<AccommodationPlaceholderProps> = ({
  cityName,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.placeholder, pressed && pressedState]}
    accessibilityRole="button"
  >
    <Ionicons name="add-circle-outline" size={20} color={colors.textMuted} />
    <Text style={styles.placeholderText}>
      Where are you staying in {cityName}?
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.screenX,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    minHeight: 44,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusPill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginRight: spacing.sm,
  },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  placeholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.screenX,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    marginHorizontal: spacing.screenX,
    marginVertical: spacing.xs,
  },
  placeholderText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
});
