// components/explore/cards/CountryCard.tsx
import { Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, fonts, spacing, radius } from '@/constants/design';
import type { Country } from '@/data/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GAP = spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.screenX * 2 - GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.1;

interface CountryCardProps {
  country: Country;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CountryCard({ country, onPress }: CountryCardProps) {
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

  const imageUrl = country.heroImageUrl ?? 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400';

  return (
    <View style={styles.wrapper}>
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
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.gradient}
        />
        <Text style={styles.name}>{country.name}</Text>
      </AnimatedPressable>
      {country.shortBlurb && (
        <Text style={styles.blurb} numberOfLines={1}>{country.shortBlurb}</Text>
      )}
    </View>
  );
}

export { CARD_WIDTH as COUNTRY_CARD_WIDTH, GAP as COUNTRY_CARD_GAP };

const styles = StyleSheet.create({
  wrapper: {
    width: CARD_WIDTH,
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
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  name: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  blurb: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
});
