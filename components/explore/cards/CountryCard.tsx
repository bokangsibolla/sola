// components/explore/cards/CountryCard.tsx
import { Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';
import type { Country } from '@/data/types';

/**
 * Masonry-style height pattern — repeats every 3 cards per column.
 * Creates a varied rhythm: tall → short → medium.
 */
const ASPECT_RATIOS = [0.78, 1.1, 0.9, 1.05, 0.82, 0.95];

interface CountryCardProps {
  country: Country;
  onPress: () => void;
  /** Position index — drives height variation */
  index?: number;
}

export function CountryCard({ country, onPress, index = 0 }: CountryCardProps) {
  const imageUrl = country.heroImageUrl ?? undefined;
  const aspectRatio = ASPECT_RATIOS[index % ASPECT_RATIOS.length];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { aspectRatio },
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
        colors={['transparent', 'transparent', 'rgba(0,0,0,0.65)']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <View style={styles.content}>
        <SolaText style={styles.name} numberOfLines={1}>{country.name}</SolaText>
        {country.shortBlurb ? (
          <SolaText style={styles.signal} numberOfLines={1}>{country.shortBlurb}</SolaText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: spacing.md,
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
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  signal: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
});
