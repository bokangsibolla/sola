import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';
import type { CityWithCountry } from '@/data/explore/types';

interface CityRowCardProps {
  city: CityWithCountry;
}

export function CityRowCard({ city }: CityRowCardProps) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(`/(tabs)/discover/city/${city.slug}` as any)}
    >
      {city.heroImageUrl ? (
        <Image
          source={{ uri: city.heroImageUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, styles.placeholder]}>
          <Ionicons name="image-outline" size={20} color={colors.textMuted} />
        </View>
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)']}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{city.name}</Text>
        <Text style={styles.country} numberOfLines={1}>{city.countryName}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    height: 160,
    borderRadius: radius.cardLg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  pressed: pressedState,
  placeholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.sm,
    gap: 1,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 17,
    color: '#FFFFFF',
  },
  country: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(255,255,255,0.7)',
  },
});
