import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';
import type { PlaceWithCity } from '@/data/types';

interface HeroPlaceCardProps {
  place: PlaceWithCity;
}

export function HeroPlaceCard({ place }: HeroPlaceCardProps) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(`/(tabs)/discover/place-detail/${place.id}` as any)}
    >
      {place.imageUrl ? (
        <Image
          source={{ uri: place.imageUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={200}
          pointerEvents="none"
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, styles.placeholder]}>
          <Ionicons name="image-outline" size={32} color={colors.textMuted} />
        </View>
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <View style={styles.label}>
        <Text style={styles.labelText}>POPULAR WITH SOLO WOMEN</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
        <Text style={styles.location} numberOfLines={1}>
          {place.cityName}{place.countryName ? ` · ${place.countryName}` : ''}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 200,
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
  label: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.card,
  },
  labelText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  content: {
    padding: spacing.lg,
    gap: 2,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  location: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.8)',
  },
});
