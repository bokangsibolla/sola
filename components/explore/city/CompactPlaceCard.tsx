import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
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

export function CompactPlaceCard({ place, tags }: CompactPlaceCardProps) {
  const router = useRouter();

  const priceLabel = place.priceLevel && place.priceLevel > 0
    ? '$'.repeat(place.priceLevel)
    : null;

  return (
    <Pressable
      onPress={() => router.push(`/discover/place-detail/${place.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {/* Image */}
      {place.imageUrl ? (
        <Image
          source={{ uri: place.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}

      {/* Body */}
      <View style={styles.body}>
        {/* Top row: name + price */}
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
          {priceLabel && <Text style={styles.price}>{priceLabel}</Text>}
        </View>

        {/* Area name */}
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

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.background,
    marginBottom: spacing.md,
  },
  cardPressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform as any,
  },
  image: {
    width: 88,
    minHeight: 88,
  },
  imagePlaceholder: {
    backgroundColor: colors.neutralFill,
  },
  body: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  price: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.greenSoft,
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
