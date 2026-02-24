import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import { fetchPersonalizedCities } from '@/data/home/homeApi';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

interface DiscoveryCardProps {
  /** Which personalized city slot to show (0-based index) */
  index?: number;
}

export function DiscoveryCard({ index = 0 }: DiscoveryCardProps) {
  const router = useRouter();
  const { userId } = useAuth();

  const { data: cities } = useData(
    () => (userId ? fetchPersonalizedCities(userId, 4) : Promise.resolve([])),
    [userId, 'home-discovery-cities'],
  );

  const city = cities?.[index];
  if (!city) return null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() =>
        router.push(`/(tabs)/discover/city/${city.slug}` as any)
      }
    >
      {city.heroImageUrl ? (
        <Image
          source={{ uri: city.heroImageUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, styles.placeholder]} />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.content}>
        <Text style={styles.label}>Recommended for you</Text>
        <Text style={styles.city} numberOfLines={1}>
          {city.cityName}
        </Text>
        <Text style={styles.country} numberOfLines={1}>
          {city.countryName}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 180,
    borderRadius: radius.cardLg,
    overflow: 'hidden',
  },
  pressed: pressedState,
  placeholder: {
    backgroundColor: colors.neutralFill,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  city: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 2,
  },
  country: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
});
