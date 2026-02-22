import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { TripWithStops } from '@/data/trips/types';
import { getFlag, formatDateShort, nightsBetween, STATUS_COLORS } from '@/data/trips/helpers';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface TripHeaderProps {
  trip: TripWithStops;
}

export const TripHeader: React.FC<TripHeaderProps> = ({ trip }) => {
  const stops = trip.stops;
  const statusStyle = STATUS_COLORS[trip.status];

  // Build date display
  let dateDisplay = 'Flexible dates';
  if (trip.arriving && trip.leaving) {
    const from = formatDateShort(trip.arriving);
    const to = formatDateShort(trip.leaving);
    const nights = nightsBetween(trip.arriving, trip.leaving);
    dateDisplay = `${from} \u2013 ${to} \u00B7 ${nights} ${nights === 1 ? 'night' : 'nights'}`;
  }

  // Build route strip
  const routeSegments = stops.map((s) => ({
    flag: getFlag(s.countryIso2),
    name: s.cityName ?? s.countryIso2,
  }));

  return (
    <View style={styles.container}>
      {/* Title row */}
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={2}>
          {trip.title || trip.destinationName}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {statusStyle.label}
          </Text>
        </View>
      </View>

      {/* Date range */}
      <Text style={styles.dateRange}>{dateDisplay}</Text>

      {/* Route strip */}
      {stops.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.routeStrip}
        >
          {routeSegments.map((seg, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Text style={styles.routeArrow}>{'\u2192'}</Text>}
              <Text style={styles.routeStop}>
                {seg.flag} {seg.name}
              </Text>
            </React.Fragment>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: colors.textPrimary,
  },
  statusBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginTop: 4,
  },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  dateRange: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  routeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  routeStop: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  routeArrow: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
});
