// components/explore/cards/CountryCard.tsx
import { Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';
import type { Country } from '@/data/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GAP = spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.screenX * 2 - GAP) / 2;

// Alternate heights for visual asymmetry — avoids "box grid" feel
const CARD_HEIGHT_SHORT = CARD_WIDTH * 0.75;
const CARD_HEIGHT_TALL = CARD_WIDTH * 0.95;

interface CountryCardProps {
  country: Country;
  onPress: () => void;
  /** Grid index — odd cards are taller for asymmetric rhythm */
  index?: number;
}

export function CountryCard({ country, onPress, index = 0 }: CountryCardProps) {
  const imageUrl = country.heroImageUrl ?? undefined;
  const cardHeight = index % 2 === 0 ? CARD_HEIGHT_SHORT : CARD_HEIGHT_TALL;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { height: cardHeight },
        pressed && styles.pressed,
      ]}
    >
      <Image
        source={{ uri: imageUrl }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={200}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)']}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{country.name}</Text>
        {country.shortBlurb ? (
          <Text style={styles.signal} numberOfLines={1}>{country.shortBlurb}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export { CARD_WIDTH as COUNTRY_CARD_WIDTH, GAP as COUNTRY_CARD_GAP };

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  signal: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});
