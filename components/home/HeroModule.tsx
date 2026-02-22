import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  colors,
  fonts,
  radius,
  spacing,
  pressedState,
} from '@/constants/design';
import type { HeroState, TravelUpdate } from '@/data/home/types';

const FALLBACK_IMAGE = require('@/assets/images/solo-bali-palms.jpg');
const HERO_HEIGHT = 220;

interface HeroModuleProps {
  hero: HeroState;
  travelUpdate?: TravelUpdate | null;
}

function getImageSource(hero: HeroState) {
  let uri: string | null = null;
  if (hero.kind === 'active' || hero.kind === 'upcoming') {
    uri = hero.cityImageUrl || null;
  } else {
    uri = hero.city.heroImageUrl || null;
  }
  return uri ? { uri } : FALLBACK_IMAGE;
}

function formatDateRange(arriving: string | null, leaving: string | null): string | null {
  if (!arriving) return null;
  const fmt = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  if (leaving) return `${fmt(arriving)} \u2013 ${fmt(leaving)}`;
  return fmt(arriving);
}

function getSeasonalSubtitle(): string {
  const month = new Date().getMonth();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `Perfect for ${monthNames[month]}`;
}

export function HeroModule({ hero }: HeroModuleProps) {
  const router = useRouter();

  // Tick local time every minute for active trip
  const [, setTick] = useState(0);
  useEffect(() => {
    if (hero.kind !== 'active') return;
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, [hero.kind]);

  // Fall back to local image if remote URL fails to load
  const [useFallback, setUseFallback] = useState(false);

  const handlePress = () => {
    if (hero.kind === 'active' || hero.kind === 'upcoming') {
      router.push(`/trips/${hero.trip.id}` as any);
    } else {
      router.push(`/discover/city/${hero.city.slug}` as any);
    }
  };

  const remoteSource = getImageSource(hero);
  const imageSource = useFallback ? FALLBACK_IMAGE : remoteSource;

  // Determine pill text
  let pillText = 'RECOMMENDED';
  if (hero.kind === 'active') pillText = 'NOW TRAVELING';
  else if (hero.kind === 'upcoming') pillText = 'UPCOMING';

  // Determine title and subtitle
  let title = '';
  let subtitle: string | null = null;
  if (hero.kind === 'active') {
    title = hero.trip.destinationName;
    subtitle = formatDateRange(hero.trip.arriving, hero.trip.leaving);
  } else if (hero.kind === 'upcoming') {
    title = hero.trip.destinationName;
    subtitle = formatDateRange(hero.trip.arriving, hero.trip.leaving);
  } else {
    title = `${hero.city.name}, ${hero.city.countryName}`;
    subtitle = getSeasonalSubtitle();
  }

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
        ]}
        onPress={handlePress}
      >
        <Image
          source={imageSource}
          placeholder={FALLBACK_IMAGE}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={200}
          onError={() => setUseFallback(true)}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.05)', colors.overlayMedium]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Status pill — top left */}
        <View style={styles.pillContainer}>
          <View style={styles.pill}>
            {hero.kind === 'active' && <View style={styles.liveDot} />}
            <SolaText style={styles.pillText}>{pillText}</SolaText>
          </View>
        </View>

        {/* Action circle — top right */}
        <View style={styles.actionContainer}>
          <View style={styles.actionCircle}>
            <Ionicons
              name={hero.kind === 'featured' ? 'bookmark-outline' : 'arrow-forward'}
              size={16}
              color={colors.textPrimary}
            />
          </View>
        </View>

        {/* Bottom content */}
        <View style={styles.overlay}>
          <SolaText style={styles.title} numberOfLines={1}>{title}</SolaText>
          {subtitle && (
            <SolaText variant="heroSubtitle" color={colors.textOnImageMuted} style={styles.subtitle} numberOfLines={1}>{subtitle}</SolaText>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.screenX,
  },
  card: {
    height: HERO_HEIGHT,
    borderRadius: radius.module,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  pillContainer: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.frostedPillBg,
    borderWidth: 1,
    borderColor: colors.frostedPillBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.greenSoft,
  },
  pillText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
    color: colors.textOnImage,
  },
  actionContainer: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
  },
  actionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.textOnImage,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
});
