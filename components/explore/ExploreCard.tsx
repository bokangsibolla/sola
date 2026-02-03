import { useCallback, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';

const SCREEN_WIDTH = Dimensions.get('window').width;
// Card width that shows ~1.5 cards with peek of next (Airbnb style)
const DEFAULT_CARD_WIDTH = (SCREEN_WIDTH - spacing.screenX * 2 - spacing.md) * 0.85;
// Portrait aspect ratio like Airbnb (4:5)
const IMAGE_ASPECT_RATIO = 4 / 5;

interface ExploreCardProps {
  imageUrl: string;
  title: string;
  subtitle?: string;
  metaRow?: string;
  rating?: number;
  reviewCount?: number;
  price?: {
    amount: number;
    currency: string;
    suffix?: string;
  };
  onPress: () => void;
  width?: number;
  showFavorite?: boolean;
}

export default function ExploreCard({
  imageUrl,
  title,
  subtitle,
  metaRow,
  rating,
  reviewCount,
  price,
  onPress,
  width = DEFAULT_CARD_WIDTH,
  showFavorite = true,
}: ExploreCardProps) {
  const [scale] = useState(new Animated.Value(1));
  const [isFavorited, setIsFavorited] = useState(false);

  // Calculate image height based on portrait aspect ratio
  const imageHeight = width / IMAGE_ASPECT_RATIO;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 50 }).start();
  }, [scale]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  }, [scale]);

  const handleFavoritePress = useCallback(() => {
    setIsFavorited((prev) => !prev);
  }, []);

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'USD') return `$${amount}`;
    if (currency === 'EUR') return `€${amount}`;
    if (currency === 'GBP') return `£${amount}`;
    return `${currency} ${amount}`;
  };

  return (
    <Animated.View style={[styles.container, { width, transform: [{ scale }] }]}>
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <View style={[styles.imageContainer, { width, height: imageHeight }]}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
          {showFavorite && (
            <Pressable style={styles.favoriteButton} onPress={handleFavoritePress}>
              <Ionicons
                name={isFavorited ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorited ? colors.orange : colors.textPrimary}
              />
            </Pressable>
          )}
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>

          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}

          {metaRow && (
            <Text style={styles.metaRow} numberOfLines={1}>
              {metaRow}
            </Text>
          )}

          {rating !== undefined && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.textPrimary} style={styles.starIcon} />
              <Text style={styles.ratingText}>{rating.toFixed(2)}</Text>
              {reviewCount !== undefined && (
                <Text style={styles.reviewCount}>({reviewCount.toLocaleString()})</Text>
              )}
            </View>
          )}

          {price && (
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>
                From {formatCurrency(price.amount, price.currency)}
                {price.suffix && <Text style={styles.priceSuffix}> {price.suffix}</Text>}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

// Export for use in tabs
export { DEFAULT_CARD_WIDTH };

const styles = StyleSheet.create({
  container: {},
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutralFill,
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentContainer: {
    paddingTop: 2,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  metaRow: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  starIcon: {
    marginRight: 4,
  },
  ratingText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
    marginRight: 4,
  },
  reviewCount: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  priceRow: {
    marginTop: 4,
  },
  priceText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  priceSuffix: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
});
