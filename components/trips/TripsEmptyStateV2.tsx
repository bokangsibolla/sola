import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useData } from '@/hooks/useData';
import { getPopularCitiesWithCountry } from '@/data/api';
import { getFlag } from '@/data/trips/helpers';
import { colors, fonts, spacing, radius } from '@/constants/design';

interface TripsEmptyStateV2Props {
  onCreateTrip: () => void;
}

const CARD_HEIGHT = 140;

export const TripsEmptyStateV2: React.FC<TripsEmptyStateV2Props> = ({
  onCreateTrip,
}) => {
  const { data: cities } = useData(
    () => getPopularCitiesWithCountry(6),
    ['tripsEmptyCities'],
  );

  const topCities = cities?.slice(0, 3) ?? [];

  return (
    <View style={styles.container}>
      {/* Headline */}
      <Text style={styles.headline}>Where to next?</Text>
      <Text style={styles.subheadline}>
        Save destinations, plan trips, and build day-by-day itineraries.
      </Text>

      {/* City cards */}
      {topCities.length > 0 && (
        <View style={styles.cardsStack}>
          {topCities.map((city) => (
            <Pressable
              key={city.id}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
              onPress={() =>
                router.push(`/(tabs)/discover/city/${city.slug}` as any)
              }
            >
              <Image
                source={{ uri: city.heroImageUrl ?? undefined }}
                style={styles.cardImage}
                contentFit="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.25)']}
                style={styles.cardGradient}
              />
              <View style={styles.cardLabel}>
                <Text style={styles.cardCityName}>
                  {city.countryIso2 ? getFlag(city.countryIso2) + ' ' : ''}
                  {city.name}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* CTA button */}
      <Pressable
        style={({ pressed }) => [
          styles.ctaButton,
          pressed && styles.ctaPressed,
        ]}
        onPress={onCreateTrip}
      >
        <Text style={styles.ctaText}>Plan a new trip</Text>
      </Pressable>

      {/* Subtle link */}
      <Pressable onPress={onCreateTrip}>
        <Text style={styles.subtleLink}>Currently traveling? Log your trip</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.screenX,
  },

  // Headline
  headline: {
    fontFamily: fonts.semiBold,
    fontSize: 28,
    color: colors.textPrimary,
    lineHeight: 36,
  },
  subheadline: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },

  // City cards
  cardsStack: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: radius.cardLg,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  cardLabel: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
  },
  cardCityName: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 24,
  },

  // CTA button
  ctaButton: {
    backgroundColor: colors.orange,
    paddingVertical: spacing.lg,
    borderRadius: radius.button,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  ctaPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  ctaText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },

  // Subtle link
  subtleLink: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
