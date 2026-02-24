import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useData } from '@/hooks/useData';
import { getCityById } from '@/data/api';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';
import { formatDateShort, getFlag, STATUS_COLORS } from '@/data/trips/helpers';
import type { TripWithStops } from '@/data/trips/types';

const CARD_HEIGHT = 200;

interface ProfileTripCardProps {
  trip: TripWithStops;
  overlapLabel?: string;
  isOwn?: boolean;
}

export default function ProfileTripCard({
  trip,
  overlapLabel,
  isOwn,
}: ProfileTripCardProps) {
  const router = useRouter();
  const stops = trip.stops ?? [];
  const firstStop = stops[0];

  const { data: city } = useData(
    () =>
      firstStop?.cityId
        ? getCityById(firstStop.cityId)
        : Promise.resolve(null),
    [firstStop?.cityId],
  );

  // Image fallback chain: user cover -> city hero -> null (placeholder)
  const imageUrl = trip.coverImageUrl ?? city?.heroImageUrl ?? null;
  const flag = getFlag(trip.countryIso2);
  const statusStyle = STATUS_COLORS[trip.status] ?? STATUS_COLORS.draft;
  const showStatus = trip.status !== 'completed';

  const dateText =
    trip.arriving && trip.leaving
      ? `${formatDateShort(trip.arriving)} \u2014 ${formatDateShort(trip.leaving)}`
      : 'Flexible dates';

  const handlePress = () => {
    if (isOwn) {
      router.push(`/trips/${trip.id}`);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isOwn && pressed && styles.pressed,
      ]}
      onPress={handlePress}
      disabled={!isOwn}
    >
      {/* Background image or placeholder */}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, styles.placeholder]}>
          <Text style={styles.placeholderFlag}>{flag}</Text>
          <Text style={styles.placeholderName} numberOfLines={1}>
            {trip.destinationName}
          </Text>
        </View>
      )}

      {/* Gradient overlay (only when image present) */}
      {imageUrl && (
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      {/* Top-left: overlap badge */}
      {overlapLabel ? (
        <View style={styles.overlapBadge}>
          <Text style={styles.overlapText}>{overlapLabel}</Text>
        </View>
      ) : null}

      {/* Top-right: status pill (hidden for completed) */}
      {showStatus ? (
        <View
          style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
        >
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {statusStyle.label}
          </Text>
        </View>
      ) : null}

      {/* Bottom-left: title + dates */}
      <View style={styles.overlay}>
        <Text
          style={[styles.title, !imageUrl && styles.titleDark]}
          numberOfLines={1}
        >
          {trip.title || trip.destinationName}
        </Text>
        <Text
          style={[styles.dateText, !imageUrl && styles.dateTextDark]}
          numberOfLines={1}
        >
          {dateText}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    borderRadius: radius.cardLg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  pressed: pressedState,

  // Placeholder (no image)
  placeholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderFlag: {
    fontSize: 48,
    opacity: 0.5,
  },
  placeholderName: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    opacity: 0.7,
  },

  // Top-left overlap badge
  overlapBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.orangeFill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  overlapText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.orange,
  },

  // Top-right status pill
  statusBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  statusText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },

  // Bottom content
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  titleDark: {
    color: colors.textPrimary,
  },
  dateText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  dateTextDark: {
    color: colors.textSecondary,
  },
});
