import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { TripAccommodation, TripStop } from '@/data/trips/types';
import { AccommodationCard, AccommodationPlaceholder } from './AccommodationCard';
import { colors, fonts, spacing } from '@/constants/design';

interface AccommodationSectionProps {
  accommodations: TripAccommodation[];
  stops: TripStop[];
  onAccommodationPress: (accommodation: TripAccommodation) => void;
  onAddPress: (cityName: string) => void;
}

export const AccommodationSection: React.FC<AccommodationSectionProps> = ({
  accommodations,
  stops,
  onAccommodationPress,
  onAddPress,
}) => {
  // Determine which stops lack accommodation
  const coveredCities = new Set<string>();
  for (const accom of accommodations) {
    // Find which stop this accommodation covers
    for (const stop of stops) {
      if (
        stop.startDate &&
        stop.endDate &&
        accom.checkIn < stop.endDate &&
        accom.checkOut > stop.startDate
      ) {
        coveredCities.add(stop.cityName ?? stop.countryIso2);
      }
    }
  }

  const uncoveredStops = stops.filter(
    (s) => s.startDate && !coveredCities.has(s.cityName ?? s.countryIso2),
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>ACCOMMODATION</Text>

      {accommodations.map((accom) => (
        <AccommodationCard
          key={accom.id}
          accommodation={accom}
          onPress={() => onAccommodationPress(accom)}
        />
      ))}

      {uncoveredStops.map((stop) => (
        <AccommodationPlaceholder
          key={`placeholder-${stop.id}`}
          cityName={stop.cityName ?? 'this destination'}
          onPress={() => onAddPress(stop.cityName ?? '')}
        />
      ))}

      {accommodations.length === 0 && uncoveredStops.length === 0 && (
        <AccommodationPlaceholder
          cityName="your trip"
          onPress={() => onAddPress('')}
        />
      )}
    </View>
  );
};

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
});
