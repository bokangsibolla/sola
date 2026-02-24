import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { Place, PlaceMedia, Tag } from '@/data/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = Math.round(SCREEN_HEIGHT * 0.45);

const SIGNAL_FILTER_GROUPS = ['safety', 'vibe', 'good_for'];

interface AccommodationHeroProps {
  accommodation: Place;
  media: PlaceMedia[];
  tags: Tag[];
  cityName?: string;
  countryName?: string;
  saved: boolean;
  onSave: () => void;
  canSave: boolean;
}

function formatCategory(placeType: string): string {
  return placeType.replace(/_/g, ' ').toUpperCase();
}

/** Derive a short women-focused trust line from the available data. */
function getTrustSignal(accommodation: Place): string | null {
  if (accommodation.womenOnly) return 'Women-only space';
  if (accommodation.soloFemaleReviews) return 'Reviewed by solo women';
  if (accommodation.whySelected) return 'Curated for solo women';
  return null;
}

const AccommodationHero: React.FC<AccommodationHeroProps> = ({
  accommodation,
  media,
  tags,
  cityName,
  countryName,
  saved,
  onSave,
  canSave,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = media.filter((m) => m.mediaType === 'image');
  const location = [cityName, countryName].filter(Boolean).join(', ');
  const trustSignal = getTrustSignal(accommodation);
  const signalTags = tags
    .filter((t) => SIGNAL_FILTER_GROUPS.includes(t.filterGroup))
    .slice(0, 3);

  const handleScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setActiveIndex(index);
    },
    [],
  );

  return (
    <View>
      {images.length > 0 ? (
        <View style={styles.carouselWrapper}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
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

          {/* Gradient overlay */}
          <LinearGradient
            colors={['transparent', colors.heroGradientEnd]}
            style={styles.gradient}
            pointerEvents="none"
          />

          {/* Category pill — top left */}
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>
              {formatCategory(accommodation.placeType)}
            </Text>
          </View>

          {/* Save button — top right */}
          <Pressable
            style={styles.saveButton}
            onPress={onSave}
            disabled={!canSave}
            hitSlop={12}
          >
            <Ionicons
              name={saved ? 'heart' : 'heart-outline'}
              size={22}
              color={saved ? colors.orange : colors.textOnImage}
            />
          </Pressable>

          {/* Counter pill */}
          {images.length > 1 && (
            <View style={styles.counterPill}>
              <Text style={styles.counterText}>
                {activeIndex + 1}/{images.length}
              </Text>
            </View>
          )}

          {/* Overlay content */}
          <View style={styles.overlayContent}>
            {/* Trust signal — leading element */}
            {trustSignal && (
              <View style={styles.trustBadge}>
                <Ionicons name="shield-checkmark" size={13} color={colors.orange} />
                <Text style={styles.trustText}>{trustSignal}</Text>
              </View>
            )}

            <Text style={styles.heroName}>{accommodation.name}</Text>

            {location.length > 0 && (
              <Text style={styles.heroLocation}>{location}</Text>
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
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="bed-outline" size={40} color={colors.textMuted} />
        </View>
      )}
    </View>
  );
};

export { AccommodationHero };

const styles = StyleSheet.create({
  carouselWrapper: {
    position: 'relative',
  },
  carouselImage: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: HERO_HEIGHT * 0.6,
  },
  categoryPill: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    backgroundColor: colors.overlaySoft,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  categoryText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.textOnImage,
  },
  saveButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterPill: {
    position: 'absolute',
    bottom: spacing.xl + spacing.xxxxl,
    right: spacing.lg,
    backgroundColor: colors.overlaySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  counterText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textOnImage,
  },
  overlayContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.xl,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  trustText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.3,
    color: colors.textOnImage,
  },
  heroName: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: colors.textOnImage,
    marginBottom: spacing.xs,
  },
  heroLocation: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textOnImageMuted,
  },
  signalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  signalPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  signalText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textOnImage,
  },
  placeholder: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
