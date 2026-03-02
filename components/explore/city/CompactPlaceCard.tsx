import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, pressedState, radius, spacing } from '@/constants/design';
import type { Tag } from '@/data/types';
import type { PlaceWithImage } from '@/data/city/types';

function tagColors(filterGroup: Tag['filterGroup']): { bg: string; fg: string } {
  switch (filterGroup) {
    case 'safety':
      return { bg: colors.greenFill, fg: colors.greenSoft };
    case 'good_for':
      return { bg: colors.blueFill, fg: colors.blueSoft };
    case 'vibe':
      return { bg: colors.orangeFill, fg: colors.orange };
    default:
      return { bg: colors.borderSubtle, fg: colors.textSecondary };
  }
}

interface CompactPlaceCardProps {
  place: PlaceWithImage;
  tags?: Tag[];
}

const ACCOMMODATION_TYPES = ['hotel', 'hostel', 'homestay'];
const ACTIVITY_TYPES = ['activity', 'tour'];

function placeRoute(place: PlaceWithImage): string {
  if (ACCOMMODATION_TYPES.includes(place.placeType)) {
    return `/discover/accommodation/${place.slug}`;
  }
  if (ACTIVITY_TYPES.includes(place.placeType)) {
    return `/discover/activity/${place.slug}`;
  }
  return `/discover/place-detail/${place.id}`;
}

const TYPE_LABELS: Record<string, string> = {
  hotel: 'Hotel',
  hostel: 'Hostel',
  homestay: 'Homestay',
};

export function CompactPlaceCard({ place, tags }: CompactPlaceCardProps) {
  const router = useRouter();

  const isAccommodation = ACCOMMODATION_TYPES.includes(place.placeType);
  const typeLabel = TYPE_LABELS[place.placeType] ?? null;
  const isVerified =
    place.verificationStatus === 'sola_checked' ||
    place.verificationStatus === 'baseline_passed';
  const isSolaVisited = place.verificationStatus === 'sola_checked';

  return (
    <Pressable
      onPress={() => router.push(placeRoute(place) as any)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {/* Image */}
      <View style={styles.imageWrap}>
        {place.imageUrl ? (
          <Image
            source={{ uri: place.imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={24} color={colors.textMuted} />
          </View>
        )}

        {/* Badges overlay */}
        <View style={styles.badgeOverlay}>
          {place.womenOnly && (
            <View style={[styles.overlayBadge, { backgroundColor: colors.greenFill }]}>
              <Ionicons name="shield-checkmark" size={10} color={colors.greenSoft} />
              <Text style={[styles.overlayBadgeText, { color: colors.greenSoft }]}>
                Women Only
              </Text>
            </View>
          )}
          {isSolaVisited && (
            <View style={[styles.overlayBadge, { backgroundColor: colors.blueFill }]}>
              <Ionicons name="checkmark-circle" size={10} color={colors.blueSoft} />
              <Text style={[styles.overlayBadgeText, { color: colors.blueSoft }]}>
                Verified
              </Text>
            </View>
          )}
          {!isSolaVisited && isVerified && (
            <View style={[styles.overlayBadge, { backgroundColor: colors.neutralFill }]}>
              <Ionicons name="checkmark-circle-outline" size={10} color={colors.textMuted} />
              <Text style={[styles.overlayBadgeText, { color: colors.textMuted }]}>
                Checked
              </Text>
            </View>
          )}
        </View>

        {/* Type pill */}
        {isAccommodation && typeLabel && (
          <View style={styles.typePill}>
            <Text style={styles.typePillText}>{typeLabel}</Text>
          </View>
        )}
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{place.name}</Text>

        {place.areaName && (
          <Text style={styles.areaName} numberOfLines={1}>{place.areaName}</Text>
        )}

        {/* Tags — max 3 */}
        {tags && tags.length > 0 && (
          <View style={styles.tagRow}>
            {tags.slice(0, 3).map((tag) => {
              const tc = tagColors(tag.filterGroup);
              return (
                <View key={tag.id} style={[styles.tagPill, { backgroundColor: tc.bg }]}>
                  <Text style={[styles.tagText, { color: tc.fg }]}>{tag.label}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const IMAGE_HEIGHT = 100;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.cardLg,
    overflow: 'hidden',
    backgroundColor: colors.background,
    marginBottom: spacing.md,
  },
  cardPressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform as any,
  },

  // Image
  imageWrap: {
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: IMAGE_HEIGHT,
  },
  imagePlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Overlay badges (top-left)
  badgeOverlay: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  overlayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  overlayBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },

  // Type pill (bottom-right)
  typePill: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  typePillText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Body
  body: {
    padding: spacing.md,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  areaName: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tagPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
});
