import { useCallback, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';

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
  width = 280,
  showFavorite = true,
}: ExploreCardProps) {
  const [scale] = useState(new Animated.Value(1));
  const [isFavorited, setIsFavorited] = useState(false);

  const onPressIn = useCallback(() => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
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
        <View style={[styles.imageContainer, { width, height: width }]}>
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
                size={20}
                color={isFavorited ? colors.orange : colors.textPrimary}
              />
            </Pressable>
          )}
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={1}>
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
              <Ionicons name="star" size={14} color={colors.textPrimary} />
              <Text style={styles.ratingText}>{rating.toFixed(2)}</Text>
              {reviewCount !== undefined && (
                <Text style={styles.reviewCount}>({reviewCount})</Text>
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

const styles = StyleSheet.create({
  container: {
    marginRight: spacing.md,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.borderDefault,
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    gap: spacing.xs,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  metaRow: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  reviewCount: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  priceRow: {
    marginTop: spacing.xs,
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
