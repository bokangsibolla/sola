import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  colors,
  fonts,
  radius,
  spacing,
  pressedState,
} from '@/constants/design';
import { SectionHeader } from './SectionHeader';
import type { PersonalizedCity, SavedPlacePreview, HeroState } from '@/data/home/types';

interface ForYouItem {
  id: string;
  name: string;
  imageUrl: string | null;
  route: string;
}

interface ForYouRowProps {
  heroState: HeroState;
  savedPlaces: SavedPlacePreview[];
  personalizedCities: PersonalizedCity[];
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = spacing.sm;
const HORIZONTAL_PADDING = spacing.screenX * 2;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - HORIZONTAL_PADDING - CARD_GAP * 2) / 3);
const CARD_HEIGHT = 130;

function buildForYouItems(
  heroState: HeroState,
  savedPlaces: SavedPlacePreview[],
  personalizedCities: PersonalizedCity[],
): ForYouItem[] {
  // Priority 1: Trip stops (if active or upcoming trip with 3+ stops)
  // TripStop has cityId and cityName but no image URL or slug —
  // we navigate to trip detail and show placeholder images
  if (heroState.kind === 'active' || heroState.kind === 'upcoming') {
    const stops = heroState.trip.stops ?? [];
    if (stops.length >= 3) {
      return stops.slice(0, 3).map((stop) => ({
        id: stop.id,
        name: stop.cityName ?? 'Stop',
        imageUrl: null, // TripStop has no image field
        route: `/trips/${heroState.trip.id}`,
      }));
    }
  }

  // Priority 2: Saved places (if 3+)
  if (savedPlaces.length >= 3) {
    return savedPlaces.slice(0, 3).map((place) => ({
      id: place.placeId,
      name: place.placeName,
      imageUrl: place.imageUrl,
      route: `/discover/place/${place.placeId}`,
    }));
  }

  // Priority 3: Personalized cities (always available as fallback)
  return personalizedCities.slice(0, 3).map((city) => ({
    id: city.cityId,
    name: city.cityName,
    imageUrl: city.heroImageUrl,
    route: `/discover/city/${city.slug}`,
  }));
}

function getSeeAllRoute(): string {
  return '/(tabs)/discover';
}

export function ForYouRow({ heroState, savedPlaces, personalizedCities }: ForYouRowProps) {
  const router = useRouter();
  const items = buildForYouItems(heroState, savedPlaces, personalizedCities);

  if (items.length === 0) return null;

  const seeAllRoute = getSeeAllRoute();

  return (
    <View style={styles.container}>
      <SectionHeader
        title="For you"
        onSeeAll={() => router.push(seeAllRoute as any)}
      />
      <View style={styles.row}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.card,
              pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
            ]}
            onPress={() => router.push(item.route as any)}
          >
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[StyleSheet.absoluteFillObject, styles.placeholder]} />
            )}
            <LinearGradient
              colors={['transparent', colors.cardGradientEnd]}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.textOverlay}>
              <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenX,
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.cardLg,
    overflow: 'hidden',
  },
  placeholder: {
    backgroundColor: colors.neutralFill,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 17,
    color: colors.textOnImage,
  },
});
