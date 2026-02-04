// components/explore/cards/CitySpotlightCard.tsx
import { Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, fonts, spacing, radius } from '@/constants/design';
import type { CityWithCountry } from '@/data/explore/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - spacing.screenX * 2;
const CARD_HEIGHT = CARD_WIDTH * (9 / 16); // 16:9 aspect ratio

interface CitySpotlightCardProps {
  city: CityWithCountry;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CitySpotlightCard({ city, onPress }: CitySpotlightCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const imageUrl = city.heroImageUrl ?? 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800';

  return (
    <View style={styles.container}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, animatedStyle]}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          pointerEvents="none"
        />
      </AnimatedPressable>
      <View style={styles.info}>
        <Text style={styles.name}>{city.name}</Text>
        <Text style={styles.country}>{city.countryName}</Text>
      </View>
      {city.shortBlurb && (
        <Text style={styles.blurb} numberOfLines={2}>{city.shortBlurb}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  country: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  blurb: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
