import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
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

interface DestinationCardProps {
  city: PersonalizedCity;
  width: number;
}

function getSignalText(city: PersonalizedCity): string {
  if (city.soloLevel === 'beginner') return 'Great for first-timers';
  if (city.bestFor) return city.bestFor;
  return 'Solo-friendly';
}

export function DestinationCard({ city, width }: DestinationCardProps) {
  const router = useRouter();
  const signal = getSignalText(city);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { width },
        pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
      ]}
      onPress={() => router.push(`/discover/city/${city.slug}` as any)}
    >
      {city.heroImageUrl ? (
        <Image
          source={{ uri: city.heroImageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      <View style={styles.textArea}>
        <Text style={styles.cityName} numberOfLines={1}>
          {city.cityName}
        </Text>
        <Text style={styles.countryName} numberOfLines={1}>
          {city.countryName}
        </Text>
        <View style={styles.signalChip}>
          <Text style={styles.signalText} numberOfLines={1}>
            {signal}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const IMAGE_HEIGHT = 130;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.module,
    overflow: 'hidden',
    ...elevation.md,
  },
  image: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: colors.neutralFill,
  },
  placeholder: {
    backgroundColor: colors.neutralFill,
  },
  textArea: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  cityName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  countryName: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  signalChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: spacing.md,
  },
  signalText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textSecondary,
  },
});
