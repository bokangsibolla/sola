import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  colors,
  elevation,
  fonts,
  radius,
  spacing,
  pressedState,
} from '@/constants/design';
import type { PersonalizedCity } from '@/data/home/types';

const CARD_HEIGHT = 180;

interface DestinationCardProps {
  city: PersonalizedCity;
  width: number;
}

export function DestinationCard({ city, width }: DestinationCardProps) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { width, height: CARD_HEIGHT },
        pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
      ]}
      onPress={() => router.push(`/discover/city/${city.slug}` as any)}
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
        colors={['transparent', colors.cardGradientEnd]}
        style={StyleSheet.absoluteFillObject}
      />
      {city.tagLabel && (
        <View style={styles.signalPill}>
          <SolaText style={styles.signalText}>{city.tagLabel}</SolaText>
        </View>
      )}
      <View style={styles.textOverlay}>
        <SolaText variant="cardTitle" color={colors.textOnImage} numberOfLines={1}>
          {city.cityName}
        </SolaText>
        <SolaText variant="cardSubtitle" color={colors.textOnImageMuted} style={styles.countryName}>
          {city.countryName}
        </SolaText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.module,
    overflow: 'hidden',
    ...elevation.md,
  },
  placeholder: {
    backgroundColor: colors.neutralFill,
  },
  signalPill: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.frostedPillBg,
    borderWidth: 1,
    borderColor: colors.frostedPillBorder,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  signalText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.3,
    color: colors.textOnImage,
    textTransform: 'uppercase',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  countryName: {
    marginTop: spacing.xs,
  },
});
