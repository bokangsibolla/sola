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
import type { Place, PlaceMedia } from '@/data/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = Math.round(SCREEN_HEIGHT * 0.45);

interface AccommodationHeroProps {
  accommodation: Place;
  media: PlaceMedia[];
  cityName?: string;
  countryName?: string;
  saved: boolean;
  onSave: () => void;
  canSave: boolean;
}

function formatCategory(placeType: string): string {
  return placeType.replace(/_/g, ' ').toUpperCase();
}

const AccommodationHero: React.FC<AccommodationHeroProps> = ({
  accommodation,
  media,
  cityName,
  countryName,
  saved,
  onSave,
  canSave,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = media.filter((m) => m.mediaType === 'image');
  const location = [cityName, countryName].filter(Boolean).join(', ');

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
            <Text style={styles.heroName}>{accommodation.name}</Text>
            <View style={styles.metaRow}>
              {accommodation.pricePerNight && (
                <Text style={styles.heroPrice}>
                  {accommodation.pricePerNight}/night
                </Text>
              )}
              {location.length > 0 && (
                <Text style={styles.heroLocation}>{location}</Text>
              )}
            </View>
            {accommodation.womenOnly && (
              <View style={styles.womenOnlyBadge}>
                <Ionicons name="shield-checkmark" size={12} color={colors.greenSoft} />
                <Text style={styles.womenOnlyText}>Women Only</Text>
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
  heroName: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: colors.textOnImage,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroPrice: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textOnImage,
  },
  heroLocation: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textOnImageMuted,
  },
  womenOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.greenFill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  womenOnlyText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.greenSoft,
  },
  placeholder: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
