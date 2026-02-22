import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import type { City } from '@/data/types';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

const CARD_WIDTH = Dimensions.get('window').width * 0.7;
const COMPACT_WIDTH = Dimensions.get('window').width * 0.6;
const CARD_HEIGHT = 200;
const COMPACT_HEIGHT = 160;

interface Props {
  city: City;
  compact?: boolean;
}

export function CityHorizontalCard({ city, compact }: Props) {
  const router = useRouter();
  const posthog = usePostHog();

  return (
    <Pressable
      onPress={() => {
        posthog.capture('city_tapped', { city_slug: city.slug, city_name: city.name });
        router.push(`/(tabs)/discover/city/${city.slug}` as any);
      }}
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        pressed && styles.pressed,
      ]}
    >
      {city.heroImageUrl ? (
        <Image
          source={{ uri: city.heroImageUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={200}
          pointerEvents="none"
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.neutralFill }]} pointerEvents="none" />
      )}

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={styles.gradient}
        pointerEvents="none"
      />

      {city.bestFor && (
        <View style={styles.bestForContainer}>
          <SolaText style={styles.bestForText}>{city.bestFor}</SolaText>
        </View>
      )}

      <View style={styles.overlay}>
        <SolaText style={styles.name}>{city.name}</SolaText>
        {city.shortBlurb && (
          <SolaText style={styles.blurb} numberOfLines={2}>{city.shortBlurb}</SolaText>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  cardCompact: {
    width: COMPACT_WIDTH,
    height: COMPACT_HEIGHT,
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: [{ scale: 0.98 }],
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  bestForContainer: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    zIndex: 1,
  },
  bestForText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#FFFFFF',
  },
  overlay: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  blurb: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
    lineHeight: 18,
  },
});
