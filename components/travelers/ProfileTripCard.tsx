import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { formatDateShort, getFlag, STATUS_COLORS } from '@/data/trips/helpers';
import type { TripWithStops } from '@/data/trips/types';

interface ProfileTripCardProps {
  trip: TripWithStops;
  overlapLabel?: string;
}

export default function ProfileTripCard({ trip, overlapLabel }: ProfileTripCardProps) {
  const flag = getFlag(trip.countryIso2);
  const statusStyle = STATUS_COLORS[trip.status] ?? STATUS_COLORS.draft;
  const stops = trip.stops ?? [];
  const stopsText = stops.length > 1
    ? stops.map((s) => s.cityName || s.countryIso2).join(' \u2192 ')
    : trip.destinationName;

  const dateText = trip.arriving && trip.leaving
    ? `${formatDateShort(trip.arriving)} \u2014 ${formatDateShort(trip.leaving)}`
    : 'Flexible dates';

  return (
    <View style={styles.card}>
      <Text style={styles.flag}>{flag}</Text>
      <View style={styles.textContent}>
        <Text style={styles.title} numberOfLines={1}>
          {trip.title || trip.destinationName}
        </Text>
        <Text style={styles.dates}>{dateText}</Text>
        {stops.length > 1 && (
          <Text style={styles.stops} numberOfLines={1}>{stopsText}</Text>
        )}
        {overlapLabel && (
          <View style={styles.overlapBadge}>
            <Text style={styles.overlapText}>{overlapLabel}</Text>
          </View>
        )}
      </View>
      <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
        <Text style={[styles.statusText, { color: statusStyle.text }]}>
          {statusStyle.label}
        </Text>
      </View>
    </View>
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
    marginBottom: spacing.sm,
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
    fontSize: 15,
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
  overlapBadge: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  overlapText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.orange,
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
