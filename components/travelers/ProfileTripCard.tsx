import { StyleSheet, View } from 'react-native';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { SolaText } from '@/components/ui/SolaText';
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
      <SolaText style={styles.flag}>{flag}</SolaText>
      <View style={styles.textContent}>
        <SolaText style={styles.title} numberOfLines={1}>
          {trip.title || trip.destinationName}
        </SolaText>
        <SolaText style={styles.dates}>{dateText}</SolaText>
        {stops.length > 1 && (
          <SolaText style={styles.stops} numberOfLines={1}>{stopsText}</SolaText>
        )}
        {overlapLabel && (
          <View style={styles.overlapBadge}>
            <SolaText style={styles.overlapText}>{overlapLabel}</SolaText>
          </View>
        )}
      </View>
      <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
        <SolaText style={[styles.statusText, { color: statusStyle.text }]}>
          {statusStyle.label}
        </SolaText>
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
