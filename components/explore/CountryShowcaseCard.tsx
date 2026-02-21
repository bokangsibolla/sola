import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type { Country } from '@/data/types';
import { CONTINENT_LABELS } from '@/data/discover/types';
import type { ContinentKey } from '@/data/discover/types';
import {
  colors,
  fonts,
  spacing,
  radius,
  typography,
  pressedState,
} from '@/constants/design';

interface CountryShowcaseCardProps {
  country: Country;
}

const ASPECT_RATIO = 4 / 5;

export function CountryShowcaseCard({ country }: CountryShowcaseCardProps) {
  const router = useRouter();
  const continentLabel = country.continent
    ? CONTINENT_LABELS[country.continent as ContinentKey]
    : null;

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/discover/country/${country.slug}`)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={country.name}
    >
      <Image
        source={{ uri: country.heroImageUrl ?? undefined }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={['transparent', 'transparent', colors.cardGradientEnd]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.content}>
        {country.badgeLabel && (
          <View style={styles.pillContainer}>
            <Text style={styles.pillText}>{country.badgeLabel}</Text>
          </View>
        )}
        <Text style={styles.title} numberOfLines={1}>
          {country.name}
        </Text>
        {continentLabel && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {continentLabel}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: ASPECT_RATIO,
    borderRadius: radius.module,
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
  pillContainer: {
    alignSelf: 'flex-start',
    backgroundColor: colors.frostedPillBg,
    borderWidth: 1,
    borderColor: colors.frostedPillBorder,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginBottom: spacing.xs,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 13,
    color: colors.textOnImage,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    ...typography.cardTitle,
    color: colors.textOnImage,
  },
  subtitle: {
    ...typography.cardSubtitle,
    color: colors.textOnImageMuted,
    marginTop: 2,
  },
});
