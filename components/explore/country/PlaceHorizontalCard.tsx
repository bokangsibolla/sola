import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import type { PlaceWithCity } from '@/data/types';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';
import { BookmarkButton } from '@/components/ui/BookmarkButton';

const CARD_WIDTH = Dimensions.get('window').width * 0.6;
const COMPACT_WIDTH = Dimensions.get('window').width * 0.5;
const IMAGE_HEIGHT = 180;
const COMPACT_IMAGE_HEIGHT = 140;

interface Props {
  place: PlaceWithCity;
  compact?: boolean;
}

const ACCOMMODATION_TYPES = ['hotel', 'hostel', 'homestay'];
const ACTIVITY_TYPES = ['activity', 'tour'];

function placeRoute(place: PlaceWithCity): string {
  if (ACCOMMODATION_TYPES.includes(place.placeType)) {
    return `/(tabs)/discover/accommodation/${place.slug}`;
  }
  if (ACTIVITY_TYPES.includes(place.placeType)) {
    return `/(tabs)/discover/activity/${place.slug}`;
  }
  return `/(tabs)/discover/place-detail/${place.id}`;
}

export function PlaceHorizontalCard({ place, compact }: Props) {
  const router = useRouter();
  const posthog = usePostHog();

  return (
    <Pressable
      onPress={() => {
        posthog.capture('place_tapped', { place_id: place.id, place_name: place.name });
        router.push(placeRoute(place) as any);
      }}
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.imageContainer, compact && styles.imageContainerCompact]}>
        {place.imageUrl ? (
          <Image
            source={{ uri: place.imageUrl }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            transition={200}
            pointerEvents="none"
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.neutralFill }]} pointerEvents="none" />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)']}
          style={styles.gradient}
          pointerEvents="none"
        />
        <BookmarkButton
          entityType="place"
          entityId={place.id}
          style={styles.bookmark}
        />
        {place.badgeLabel && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{place.badgeLabel}</Text>
          </View>
        )}
        <View style={styles.imageOverlay}>
          <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
          <Text style={styles.cityName}>in {place.cityName}</Text>
        </View>
      </View>
      {place.whySelected && (
        <View style={styles.body}>
          <Text style={styles.whySelected} numberOfLines={2}>{place.whySelected}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  cardCompact: {
    width: COMPACT_WIDTH,
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  imageContainerCompact: {
    height: COMPACT_IMAGE_HEIGHT,
  },
  bookmark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 1,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  badgeContainer: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#FFFFFF',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  cityName: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  body: {
    padding: spacing.md,
  },
  whySelected: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
