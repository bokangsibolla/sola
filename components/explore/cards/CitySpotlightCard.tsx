// components/explore/cards/CitySpotlightCard.tsx
import { Pressable, StyleSheet, View, Dimensions } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';
import { colors, fonts, spacing, radius } from '@/constants/design';
import type { CityWithCountry } from '@/data/explore/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - spacing.screenX * 2;
const CARD_HEIGHT = CARD_WIDTH * (9 / 16); // 16:9 aspect ratio

interface CitySpotlightCardProps {
  city: CityWithCountry;
  onPress: () => void;
}

export function CitySpotlightCard({ city, onPress }: CitySpotlightCardProps) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        {city.heroImageUrl ? (
          <Image
            source={{ uri: city.heroImageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            pointerEvents="none"
          />
        ) : null}
      </Pressable>
      <View style={styles.info}>
        <SolaText style={styles.name}>{city.name}</SolaText>
        <SolaText style={styles.country}>{city.countryName}</SolaText>
      </View>
      {city.shortBlurb && (
        <SolaText style={styles.blurb} numberOfLines={2}>{city.shortBlurb}</SolaText>
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
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
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
