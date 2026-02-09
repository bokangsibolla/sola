// components/explore/FeaturedCard.tsx
import { useCallback, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - spacing.screenX * 2;
const CARD_HEIGHT = 220;

interface FeaturedCardProps {
  imageUrl: string;
  title: string;
  blurb?: string | null;
  badge?: string | null;
  badgeVariant?: 'default' | 'highlight';
  onPress: () => void;
  onFavoritePress?: () => void;
  isFavorited?: boolean;
}

export default function FeaturedCard({
  imageUrl,
  title,
  blurb,
  badge,
  badgeVariant = 'default',
  onPress,
  onFavoritePress,
  isFavorited = false,
}: FeaturedCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
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

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <View style={styles.imageContainer} pointerEvents="box-none">
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            pointerEvents="none"
          />

          {/* Gradient overlay for text readability */}
          <View style={styles.gradient} pointerEvents="none" />

          {/* Badge */}
          {badge && badge.trim().length > 0 && (
            <View style={[
              styles.badge,
              badgeVariant === 'highlight' && styles.badgeHighlight
            ]}>
              <Text style={[
                styles.badgeText,
                badgeVariant === 'highlight' && styles.badgeTextHighlight
              ]}>
                {badge}
              </Text>
            </View>
          )}

          {/* Favorite button */}
          <Pressable style={styles.favoriteButton} onPress={handleFavoritePress} hitSlop={8}>
            <Ionicons
              name={localFavorited ? 'heart' : 'heart-outline'}
              size={18}
              color={localFavorited ? colors.orange : colors.textPrimary}
            />
          </Pressable>

          {/* Content overlay */}
          <View style={styles.contentOverlay} pointerEvents="none">
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {blurb && blurb.trim().length > 0 && (
              <Text style={styles.blurb} numberOfLines={2}>
                {blurb}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginHorizontal: spacing.screenX,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  badge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.none,
  },
  badgeHighlight: {
    backgroundColor: colors.orange,
  },
  badgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.textPrimary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  badgeTextHighlight: {
    color: '#FFFFFF',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  blurb: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
});
