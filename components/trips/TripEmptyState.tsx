import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useData } from '@/hooks/useData';
import { getCityWithCountryBySlug } from '@/data/api';
import { getPlacesByCategoryForCity } from '@/data/city/cityApi';
import type { CityWithCountry } from '@/data/explore/types';
import type { PlaceWithImage } from '@/data/city/types';
import { TYPE_DOT_COLOR, TYPE_LABEL } from '@/components/trips/blockTypeColors';
import { getFlag } from '@/data/trips/helpers';
import { colors, fonts, spacing, radius, elevation } from '@/constants/design';

interface TripEmptyStateProps {
  onPress: () => void;
}

// ── Mock cost hints by place type ──────────────────────────────────────────────

const MOCK_COST: Partial<Record<string, string>> = {
  landmark: '$15',
  activity: '$25',
  tour: '$40',
  restaurant: '$20',
  cafe: '$8',
  hotel: '$85/night',
  hostel: '$30/night',
  homestay: '$45/night',
  wellness: '$50',
  spa: '$60',
  bar: '$12',
  rooftop: '$18',
};

// ── Data fetching ────────────────────────────────────────────────────────────

interface ExampleCity {
  name: string;
  countryName: string;
  iso2: string;
  heroImage: string | null;
  places: PlaceWithImage[];
}

async function fetchExampleTrip(): Promise<ExampleCity[]> {
  try {
    const [bangkok, kyoto] = await Promise.all([
      getCityWithCountryBySlug('bangkok'),
      getCityWithCountryBySlug('kyoto'),
    ]);

    const cities = [bangkok, kyoto].filter(Boolean) as CityWithCountry[];
    if (cities.length === 0) return [];

    const results: ExampleCity[] = [];
    for (const city of cities) {
      try {
        const [sights, stays, food] = await Promise.all([
          getPlacesByCategoryForCity(city.id, ['landmark', 'activity', 'tour']).catch(() => []),
          getPlacesByCategoryForCity(city.id, ['hotel', 'hostel', 'homestay']).catch(() => []),
          getPlacesByCategoryForCity(city.id, ['restaurant', 'cafe']).catch(() => []),
        ]);

        const withImages = (arr: PlaceWithImage[]) =>
          arr.sort((a, b) => (b.imageUrl ? 1 : 0) - (a.imageUrl ? 1 : 0));

        const top = [
          ...withImages(sights).slice(0, 2),
          ...withImages(stays).slice(0, 1),
          ...withImages(food).slice(0, 1),
        ].slice(0, 3);

        results.push({
          name: city.name,
          countryName: city.countryName,
          iso2: city.countrySlug === 'thailand' ? 'TH' : 'JP',
          heroImage: city.heroImageUrl,
          places: top,
        });
      } catch {
        results.push({
          name: city.name,
          countryName: city.countryName,
          iso2: city.countrySlug === 'thailand' ? 'TH' : 'JP',
          heroImage: city.heroImageUrl,
          places: [],
        });
      }
    }

    return results;
  } catch {
    return [];
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function TripEmptyState({ onPress }: TripEmptyStateProps) {
  const router = useRouter();
  const { data: exampleCities, loading } = useData(fetchExampleTrip, ['tripExampleData']);

  const cities = exampleCities && exampleCities.length > 0
    ? exampleCities
    : null;

  const hasData = cities != null && cities.length > 0;
  const coverImages = hasData
    ? cities.filter((c) => c.heroImage).map((c) => c.heroImage!)
    : [];

  return (
    <View style={styles.container}>
      {/* ── Heading ─────────────────────────────────────────── */}
      <Text style={styles.heading}>Plan your next trip</Text>
      <Text style={styles.subheading}>
        Seamless day-by-day planning at your fingertips.
      </Text>

      {/* ── CTA (above fold) ──────────────────────────────── */}
      <Pressable
        style={({ pressed }) => [styles.ctaButton, pressed && styles.pressed]}
        onPress={onPress}
      >
        <Text style={styles.ctaText}>Create your first trip</Text>
      </Pressable>

      {/* ── Mock Trip Card (tappable — opens demo) ──────── */}
      <Pressable
        onPress={() => {
          router.push('/trips/demo?names=Bangkok,Kyoto');
        }}
        style={({ pressed }) => [
          styles.tripCard,
          elevation.sm,
          pressed && styles.pressed,
        ]}
      >
        {/* Cover images */}
        {coverImages.length >= 2 ? (
          <View style={styles.coverRow}>
            <Image source={{ uri: coverImages[0] }} style={styles.coverLeft} contentFit="cover" />
            <Image source={{ uri: coverImages[1] }} style={styles.coverRight} contentFit="cover" />
            <View style={styles.exampleBadge}>
              <Text style={styles.exampleBadgeText}>EXAMPLE TRIP</Text>
            </View>
          </View>
        ) : coverImages.length === 1 ? (
          <View style={styles.coverSingle}>
            <Image source={{ uri: coverImages[0] }} style={styles.coverFull} contentFit="cover" />
            <View style={styles.exampleBadge}>
              <Text style={styles.exampleBadgeText}>EXAMPLE TRIP</Text>
            </View>
          </View>
        ) : (
          <View style={styles.coverPlaceholder}>
            <View style={styles.exampleBadge}>
              <Text style={styles.exampleBadgeText}>EXAMPLE TRIP</Text>
            </View>
          </View>
        )}

        {/* Card body */}
        <View style={styles.cardBody}>
          {/* Trip title + meta */}
          {hasData ? (
            <>
              <Text style={styles.tripTitle}>
                {cities.map((c) => c.name).join(' & ')}
              </Text>
              <View style={styles.metaRow}>
                {cities.map((c) => (
                  <View key={c.name} style={styles.metaPill}>
                    <Text style={styles.metaFlag}>{getFlag(c.iso2)}</Text>
                    <Text style={styles.metaText}>{c.countryName}</Text>
                  </View>
                ))}
                <View style={styles.metaPill}>
                  <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                  <Text style={styles.metaText}>10 Days</Text>
                </View>
                <View style={styles.metaPill}>
                  <Ionicons name="wallet-outline" size={12} color="#2D8A4E" />
                  <Text style={[styles.metaText, { color: '#2D8A4E' }]}>~$850 est.</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.tripTitle}>Your Multi-City Adventure</Text>
              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                  <Text style={styles.metaText}>7 Days</Text>
                </View>
                <View style={styles.metaPill}>
                  <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
                  <Text style={styles.metaText}>4 Places</Text>
                </View>
                <View style={styles.metaPill}>
                  <Ionicons name="wallet-outline" size={12} color="#2D8A4E" />
                  <Text style={[styles.metaText, { color: '#2D8A4E' }]}>~$650 est.</Text>
                </View>
              </View>
            </>
          )}

          {/* Section label */}
          <Text style={styles.itineraryLabel}>ITINERARY</Text>

          {/* ── Day blocks ────────────────────────────────── */}
          {loading ? (
            <View style={styles.skeletonBlock}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.skeletonRow}>
                  <View style={styles.skeletonText} />
                  <View style={styles.skeletonThumb} />
                </View>
              ))}
            </View>
          ) : hasData ? (
            cities.map((city, cityIdx) => (
              <View key={city.name} style={styles.dayBlock}>
                <View style={[
                  styles.dayAccent,
                  cityIdx === 0 && { backgroundColor: colors.orange },
                ]} />
                <View style={styles.dayContent}>
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayLabel}>
                      {cityIdx === 0 ? 'Day 1\u20135' : 'Day 6\u201310'}
                    </Text>
                    <View style={styles.cityChip}>
                      <Text style={styles.cityChipFlag}>{getFlag(city.iso2)}</Text>
                      <Text style={styles.cityChipText}>{city.name}</Text>
                    </View>
                  </View>

                  {city.places.map((place) => (
                    <View key={place.id} style={styles.entryRow}>
                      <View style={styles.entryInfo}>
                        <Text style={styles.entryName} numberOfLines={1}>
                          {place.name}
                        </Text>
                        <View style={styles.entryTagRow}>
                          <View style={[
                            styles.tagDot,
                            { backgroundColor: TYPE_DOT_COLOR[place.placeType] ?? colors.textMuted },
                          ]} />
                          <Text style={styles.entryTagText}>
                            {TYPE_LABEL[place.placeType] ?? place.placeType}
                          </Text>
                          {MOCK_COST[place.placeType] && (
                            <Text style={styles.costHint}>
                              {MOCK_COST[place.placeType]}
                            </Text>
                          )}
                        </View>
                      </View>
                      {place.imageUrl || place.imageUrlCached ? (
                        <Image
                          source={{ uri: (place.imageUrl ?? place.imageUrlCached)! }}
                          style={styles.entryThumb}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={styles.entryThumbPlaceholder}>
                          <Ionicons name="image-outline" size={18} color={colors.textMuted} />
                        </View>
                      )}
                    </View>
                  ))}

                  {city.places.length > 0 && (
                    <Text style={styles.moreStops}>
                      +{2 + cityIdx} more stops...
                    </Text>
                  )}
                </View>
              </View>
            ))
          ) : null}

          {/* ── AI suggestion card ────────────────────── */}
          <View style={styles.suggestionCard}>
            <View style={styles.suggestionIcon}>
              <Ionicons name="sparkles" size={14} color={colors.blueSoft} />
            </View>
            <Text style={styles.suggestionText} numberOfLines={2}>
              {hasData
                ? `Move the restaurant to Day 2 evening \u2014 it's on the way back from ${cities[0]?.places[0]?.name ?? 'the temple'}.`
                : 'Reorder stops to minimize travel time between locations.'}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const THUMB_SIZE = 56;
const COVER_HEIGHT = 150;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.screenX,
  },

  // ── Heading ──
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: colors.textPrimary,
    lineHeight: 30,
  },
  subheading: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },

  // ── CTA ──
  ctaButton: {
    backgroundColor: colors.orange,
    paddingVertical: spacing.lg,
    borderRadius: radius.button,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  ctaText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },

  // ── Trip Card ──
  tripCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.cardLg,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    overflow: 'hidden',
  },

  // ── Cover images ──
  coverRow: {
    flexDirection: 'row',
    height: COVER_HEIGHT,
    gap: 2,
  },
  coverLeft: {
    flex: 1,
    height: COVER_HEIGHT,
  },
  coverRight: {
    flex: 1,
    height: COVER_HEIGHT,
  },
  coverSingle: {
    height: COVER_HEIGHT,
  },
  coverFull: {
    width: '100%',
    height: COVER_HEIGHT,
  },
  coverPlaceholder: {
    height: 80,
    backgroundColor: colors.neutralFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exampleBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  exampleBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },

  // ── Card body ──
  cardBody: {
    padding: spacing.lg,
  },
  tripTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    lineHeight: 24,
  },

  // ── Meta pills ──
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaFlag: {
    fontSize: 13,
  },
  metaText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },

  // ── Itinerary label ──
  itineraryLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },

  // ── Day blocks ──
  dayBlock: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  dayAccent: {
    width: 3,
    backgroundColor: colors.borderDefault,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  dayContent: {
    flex: 1,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  dayLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.neutralFill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  cityChipFlag: {
    fontSize: 11,
  },
  cityChipText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textSecondary,
  },

  // ── Entry rows ──
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  entryInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  entryName: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  entryTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  tagDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  entryTagText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  ratingText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  costHint: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#2D8A4E',
    marginLeft: spacing.xs,
  },
  entryThumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.card,
  },
  entryThumbPlaceholder: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.card,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreStops: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // ── Skeleton ──
  skeletonBlock: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  skeletonText: {
    flex: 1,
    height: 14,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.sm,
  },
  skeletonThumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.card,
    backgroundColor: colors.neutralFill,
  },

  // ── Suggestion card ──
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.blueFill,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  suggestionIcon: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 17,
  },
});
