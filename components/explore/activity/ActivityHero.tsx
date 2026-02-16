import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { Place, PlaceMedia, Tag } from '@/data/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 300;

interface ActivityHeroProps {
  activity: Place;
  media: PlaceMedia[];
  cityName?: string;
  countryName?: string;
  tags: Tag[];
}

const SIGNAL_FILTER_GROUPS = ['safety', 'vibe', 'good_for'];

function formatDisplayType(activity: Place): string {
  if (activity.originalType) {
    return activity.originalType.replace(/_/g, ' ').toUpperCase();
  }
  return activity.placeType.replace(/_/g, ' ').toUpperCase();
}

function formatPrice(level: number | null): string | null {
  if (!level || level <= 0) return null;
  return '$'.repeat(level);
}

const ActivityHero: React.FC<ActivityHeroProps> = ({
  activity,
  media,
  cityName,
  countryName,
  tags,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = media.filter((m) => m.mediaType === 'image');
  const signalTags = tags
    .filter((t) => SIGNAL_FILTER_GROUPS.includes(t.filterGroup))
    .slice(0, 3);

  const useSerif = activity.name.length < 35;
  const price = formatPrice(activity.priceLevel);
  const location = [cityName, countryName].filter(Boolean).join(', ');

  return (
    <View>
      {/* Image carousel */}
      {images.length > 0 ? (
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
              );
              setActiveIndex(index);
            }}
          >
            {images.map((img) => (
              <Image
                key={img.id}
                source={{ uri: img.url }}
                style={styles.carouselImage}
                contentFit="cover"
                transition={200}
              />
            ))}
          </ScrollView>
          {images.length > 1 && (
            <View style={styles.counterPill}>
              <Text style={styles.counterText}>
                {activeIndex + 1}/{images.length}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="compass-outline" size={40} color={colors.textMuted} />
        </View>
      )}

      {/* Identity block */}
      <View style={styles.identity}>
        <Text style={styles.typeLabel}>{formatDisplayType(activity)}</Text>
        <View style={styles.nameRow}>
          <Text style={useSerif ? styles.nameSerif : styles.nameSans}>
            {activity.name}
          </Text>
          {price && <Text style={styles.price}>{price}</Text>}
        </View>
        {location.length > 0 && (
          <Text style={styles.location}>{location}</Text>
        )}

        {/* Signal tags */}
        {signalTags.length > 0 && (
          <View style={styles.signalRow}>
            {signalTags.map((tag) => (
              <View key={tag.id} style={styles.signalPill}>
                <Text style={styles.signalText}>{tag.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export { ActivityHero };

const styles = StyleSheet.create({
  carouselImage: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
  },
  counterPill: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  counterText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.background,
  },
  placeholder: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
  },
  typeLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.5,
    color: colors.orange,
    marginBottom: spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameSerif: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  nameSans: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  price: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  location: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  signalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  signalPill: {
    backgroundColor: colors.neutralFill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  signalText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
