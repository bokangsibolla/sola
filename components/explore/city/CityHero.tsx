import { Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '@/constants/design';
import type { City } from '@/data/types';

interface CityHeroProps {
  city: City;
  countryName: string;
}

export function CityHero({ city, countryName }: CityHeroProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {city.heroImageUrl ? (
        <Image
          source={{ uri: city.heroImageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}

      <LinearGradient
        colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.6)']}
        locations={[0, 0.4, 1]}
        style={styles.gradient}
      />

      {/* Back button */}
      <Pressable
        onPress={() => router.back()}
        style={[styles.backButton, { top: insets.top + spacing.sm }]}
        hitSlop={8}
      >
        <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
      </Pressable>

      {/* City name + country + positioning line */}
      <View style={styles.overlay}>
        <SolaText style={styles.countryLabel}>{countryName.toUpperCase()}</SolaText>
        <SolaText style={styles.cityName}>{city.name}</SolaText>
        {city.positioningLine && (
          <SolaText style={styles.positioningLine}>{city.positioningLine}</SolaText>
        )}
      </View>
    </View>
  );
}

const HERO_HEIGHT = 260;

const styles = StyleSheet.create({
  container: {
    height: HERO_HEIGHT,
    width: '100%',
    position: 'relative',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  imagePlaceholder: {
    backgroundColor: colors.neutralFill,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  overlay: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.screenX,
    right: spacing.screenX,
  },
  countryLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  cityName: {
    fontFamily: fonts.semiBold,
    fontSize: 30,
    color: '#FFFFFF',
    lineHeight: 36,
  },
  positioningLine: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginTop: spacing.xs,
  },
});
