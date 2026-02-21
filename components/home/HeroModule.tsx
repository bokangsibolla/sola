import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
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

interface HeroModuleProps {
  hero: HeroState;
  travelUpdate: TravelUpdate | null;
  height?: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getImageSource(hero: HeroState) {
  let uri: string | null = null;
  if (hero.kind === 'active' || hero.kind === 'upcoming') {
    uri = hero.cityImageUrl || null;
  } else {
    uri = hero.city.heroImageUrl || null;
  }
  return uri ? { uri } : FALLBACK_IMAGE;
}

function getDayProgress(arriving: string | null, leaving: string | null): string | null {
  if (!arriving || !leaving) return null;
  const now = new Date();
  const start = new Date(arriving);
  const end = new Date(leaving);
  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = now.getTime() - start.getTime();
  if (totalMs <= 0) return null;
  const totalDays = Math.max(1, Math.ceil(totalMs / (1000 * 60 * 60 * 24)));
  const currentDay = Math.min(
    totalDays,
    Math.max(1, Math.ceil(elapsedMs / (1000 * 60 * 60 * 24))),
  );
  return `Day ${currentDay} of ${totalDays}`;
}

function getDaysUntil(arriving: string | null): string | null {
  if (!arriving) return null;
  const days = Math.ceil(
    (new Date(arriving).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (days <= 0) return null;
  return `In ${days} ${days === 1 ? 'day' : 'days'}`;
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

const SEVERITY_STYLES = {
  info: { bg: colors.blueFill, color: colors.blueSoft, icon: 'info' as const },
  advisory: { bg: colors.warningFill, color: colors.warning, icon: 'alert-triangle' as const },
  alert: { bg: colors.emergencyFill, color: colors.emergency, icon: 'alert-circle' as const },
};

const DEFAULT_IMAGE_HEIGHT = 240;

// ── Component ────────────────────────────────────────────────────────────────

export function HeroModule({ hero, travelUpdate, height }: HeroModuleProps) {
  const IMAGE_HEIGHT = height ?? DEFAULT_IMAGE_HEIGHT;
  const router = useRouter();

  // Tick local time every minute for active trip
  const [, setTick] = useState(0);
  useEffect(() => {
    if (hero.kind !== 'active') return;
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, [hero.kind]);

  const handlePress = () => {
    if (hero.kind === 'active' || hero.kind === 'upcoming') {
      router.push(`/trips/${hero.trip.id}` as any);
    } else {
      router.push(`/discover/city/${hero.city.slug}` as any);
    }
  };

  const imageSource = getImageSource(hero);

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          { height: IMAGE_HEIGHT },
          pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
        ]}
        onPress={handlePress}
      >
        <Image
          source={imageSource}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.05)', colors.heroGradientEnd]}
          locations={[0, 0.4, 1]}
          style={styles.gradient}
        />

        {/* Status pill — frosted glass */}
        <View style={styles.pillContainer}>
          {hero.kind === 'active' && (
            <View style={styles.pill}>
              <View style={styles.liveDot} />
              <Text style={styles.pillText}>TRAVELING NOW</Text>
            </View>
          )}
          {hero.kind === 'upcoming' && (
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {getDaysUntil(hero.trip.arriving) ?? 'UPCOMING'}
              </Text>
            </View>
          )}
          {hero.kind === 'featured' && (
            <View style={styles.pill}>
              <Text style={styles.pillText}>FEATURED</Text>
            </View>
          )}
        </View>

        {/* Travel advisory overlay (active trip only) */}
        {hero.kind === 'active' && travelUpdate && (
          <View
            style={[
              styles.advisoryOverlay,
              { backgroundColor: SEVERITY_STYLES[travelUpdate.severity].bg },
            ]}
          >
            <Feather
              name={SEVERITY_STYLES[travelUpdate.severity].icon}
              size={12}
              color={SEVERITY_STYLES[travelUpdate.severity].color}
            />
            <Text
              style={[styles.advisoryText, { color: SEVERITY_STYLES[travelUpdate.severity].color }]}
              numberOfLines={1}
            >
              {travelUpdate.title}
            </Text>
          </View>
        )}

        {/* Overlay text at bottom */}
        <View style={styles.overlay}>
          {hero.kind === 'active' && (
            <>
              <Text style={styles.cityName} numberOfLines={1}>
                {hero.trip.destinationName}
              </Text>
              <Text style={styles.metaText}>
                {[
                  getDayProgress(hero.trip.arriving, hero.trip.leaving),
                  formatDateRange(hero.trip.arriving, hero.trip.leaving),
                ]
                  .filter(Boolean)
                  .join(' \u00B7 ')}
              </Text>
            </>
          )}
          {hero.kind === 'upcoming' && (
            <>
              <Text style={styles.cityName} numberOfLines={1}>
                {hero.trip.destinationName}
              </Text>
              <Text style={styles.metaText}>
                {formatDateRange(hero.trip.arriving, hero.trip.leaving)}
              </Text>
            </>
          )}
          {hero.kind === 'featured' && (
            <>
              <Text style={styles.cityName} numberOfLines={1}>
                {hero.city.name}, {hero.city.countryName}
              </Text>
              {hero.city.shortBlurb && (
                <Text style={styles.blurbText} numberOfLines={2}>
                  {hero.city.shortBlurb}
                </Text>
              )}
            </>
          )}
        </View>
      </Pressable>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: -spacing.lg, // break out of AppScreen padding for full-bleed
    marginBottom: spacing.xxl,
  },
  container: {
    borderBottomLeftRadius: radius.module,
    borderBottomRightRadius: radius.module,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },

  // Status pill — frosted glass
  pillContainer: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.xl,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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

  // Advisory overlay
  advisoryOverlay: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    maxWidth: '50%',
  },
  advisoryText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    flex: 1,
  },

  // Bottom overlay text
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  cityName: {
    fontFamily: fonts.semiBold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.textOnImage,
  },
  metaText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textOnImageMuted,
    marginTop: spacing.xs,
  },
  blurbText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textOnImageMuted,
    marginTop: spacing.xs,
  },
});
