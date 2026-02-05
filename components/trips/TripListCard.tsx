import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { formatDateShort, getFlag, STATUS_COLORS } from '@/data/trips/helpers';
import type { TripWithStops } from '@/data/trips/types';

interface TripListCardProps {
  trip: TripWithStops;
}

export default function TripListCard({ trip }: TripListCardProps) {
  const router = useRouter();
  const flag = getFlag(trip.countryIso2);
  const statusStyle = STATUS_COLORS[trip.status] ?? STATUS_COLORS.draft;
  const stops = trip.stops ?? [];
  const stopsText = stops.length > 1
    ? stops.map((s) => s.cityName || s.countryIso2).join(' → ')
    : trip.destinationName;

  const dateText = trip.arriving && trip.leaving
    ? `${formatDateShort(trip.arriving)} — ${formatDateShort(trip.leaving)}`
    : 'Flexible dates';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(`/trips/${trip.id}`)}
    >
      <Text style={styles.flag}>{flag}</Text>
      <View style={styles.textContent}>
        <Text style={styles.title} numberOfLines={1}>
          {trip.title || trip.destinationName}
        </Text>
        <Text style={styles.dates}>{dateText} · {trip.nights}n</Text>
        {stops.length > 1 && (
          <Text style={styles.stops} numberOfLines={1}>{stopsText}</Text>
        )}
      </View>
      <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
        <Text style={[styles.statusText, { color: statusStyle.text }]}>
          {statusStyle.label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  flag: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  dates: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  stops: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    marginLeft: spacing.sm,
  },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
});
