// components/explore/GridCard.tsx
import { useCallback, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing } from '@/constants/design';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = 12;
// Two columns with gap and screen padding
const GRID_CARD_WIDTH = (SCREEN_WIDTH - spacing.screenX * 2 - GRID_GAP) / 2;

interface GridCardProps {
  imageUrl: string;
  title: string;
  blurb?: string | null;
  badge?: string | null;
  rating?: number | null;
  price?: {
    amount: number;
    currency: string;
    suffix?: string;
  } | null;
  onPress: () => void;
  onFavoritePress?: () => void;
  isFavorited?: boolean;
  showFavorite?: boolean;
}

export default function GridCard({
  imageUrl,
  title,
  blurb,
  badge,
  rating,
  price,
  onPress,
  onFavoritePress,
  isFavorited = false,
  showFavorite = true,
}: GridCardProps) {
  const [scale] = useState(new Animated.Value(1));
  const [localFavorited, setLocalFavorited] = useState(isFavorited);

  const onPressIn = useCallback(() => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 50 }).start();
  }, [scale]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  }, [scale]);

  const handleFavoritePress = useCallback(() => {
    setLocalFavorited((prev) => !prev);
    onFavoritePress?.();
  }, [onFavoritePress]);

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'USD') return `$${amount.toLocaleString()}`;
    if (currency === 'EUR') return `€${amount.toLocaleString()}`;
    if (currency === 'GBP') return `£${amount.toLocaleString()}`;
    if (currency === 'ZAR') return `R${amount.toLocaleString()}`;
    return `${currency} ${amount.toLocaleString()}`;
  };

  // Only show price if amount > 0
  const showPrice = price && price.amount > 0;
  // Only show rating if valid
  const showRating = rating && rating > 0;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />

          {/* Optional badge - only render if badge exists */}
          {badge && badge.trim().length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}

          {/* Smaller, subtle favorite button */}
          {showFavorite && (
            <Pressable
              style={[
                styles.favoriteButton,
                localFavorited && styles.favoriteButtonActive
              ]}
              onPress={handleFavoritePress}
            >
              <Ionicons
                name={localFavorited ? 'heart' : 'heart-outline'}
                size={16}
                color={localFavorited ? colors.orange : colors.textMuted}
              />
            </Pressable>
          )}
        </View>

        <View style={styles.contentContainer}>
          {/* Title */}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          {/* Blurb - one-liner description */}
          {blurb && blurb.trim().length > 0 && (
            <Text style={styles.blurb} numberOfLines={1}>
              {blurb}
            </Text>
          )}

          {/* Price and/or rating - only show if data exists */}
          {(showPrice || showRating) && (
            <View style={styles.metaRow}>
              {showPrice && (
                <Text style={styles.price}>
                  From {formatCurrency(price.amount, price.currency)}
                  {price.suffix && <Text style={styles.priceSuffix}> {price.suffix}</Text>}
                </Text>
              )}
              {showRating && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={11} color={colors.textPrimary} />
                  <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export { GRID_CARD_WIDTH, GRID_GAP };

const styles = StyleSheet.create({
  container: {
    width: GRID_CARD_WIDTH,
  },
  imageContainer: {
    width: GRID_CARD_WIDTH,
    height: GRID_CARD_WIDTH, // Square aspect ratio
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  // Smaller, more subtle badge
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  // Smaller, subtle favorite button
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: colors.orangeFill,
  },
  contentContainer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  blurb: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  price: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  priceSuffix: {
    color: colors.textMuted,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textPrimary,
  },
});
