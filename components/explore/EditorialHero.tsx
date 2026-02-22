// components/explore/EditorialHero.tsx
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SolaText } from '@/components/ui/SolaText';
import type { Country } from '@/data/types';
import { CONTINENT_LABELS } from '@/data/discover/types';
import type { ContinentKey } from '@/data/discover/types';
import {
  colors,
  spacing,
  radius,
  typography,
  cardHeight,
  pressedState,
} from '@/constants/design';

interface EditorialHeroProps {
  country: Country;
}

export function EditorialHero({ country }: EditorialHeroProps) {
  const router = useRouter();
  const continentLabel = country.continent
    ? CONTINENT_LABELS[country.continent as ContinentKey]
    : null;

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/discover/country/${country.slug}`)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Featured: ${country.name}`}
    >
      <Image
        source={{ uri: country.heroImageUrl ?? undefined }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={['transparent', 'transparent', colors.heroGradientEnd]}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.content}>
        <View style={styles.pillContainer}>
          <SolaText variant="pillLabel" color={colors.textOnImage} uppercase letterSpacing={0.8}>
            {country.badgeLabel ?? 'Featured'}
          </SolaText>
        </View>
        <SolaText variant="heroTitle" color={colors.textOnImage}>{country.name}</SolaText>
        {continentLabel && (
          <SolaText variant="heroSubtitle" color={colors.textOnImageMuted} style={styles.subtitleSpacing}>{continentLabel}</SolaText>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: cardHeight.hero,
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
    padding: spacing.moduleInset,
  },
  pillContainer: {
    alignSelf: 'flex-start',
    backgroundColor: colors.frostedPillBg,
    borderWidth: 1,
    borderColor: colors.frostedPillBorder,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  subtitleSpacing: {
    marginTop: spacing.xs,
  },
});
