import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';
import type { HeroState } from '@/data/home/types';

// Fallback image for featured cities with no hero image (SEA launch)
const FALLBACK_IMAGE = require('@/assets/images/solo-bali-palms.jpg');

interface HeroCardProps {
  hero: HeroState;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getDayProgress(arriving: string | null, leaving: string | null): string | null {
  if (!arriving || !leaving) return null;
  const now = new Date();
  const start = new Date(arriving);
  const end = new Date(leaving);
  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = now.getTime() - start.getTime();
  if (totalMs <= 0) return null;
  const totalDays = Math.max(1, Math.ceil(totalMs / (1000 * 60 * 60 * 24)));
  const currentDay = Math.min(totalDays, Math.max(1, Math.ceil(elapsedMs / (1000 * 60 * 60 * 24))));
  return `Day ${currentDay} of ${totalDays}`;
}

function getDaysUntil(arriving: string | null): string | null {
  if (!arriving) return null;
  const now = new Date();
  const start = new Date(arriving);
  const diffMs = start.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return null;
  if (days === 1) return '1 day until departure';
  return `${days} days until departure`;
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

function formatLocalTime(timezone: string | null): string | null {
  if (!timezone) return null;
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
    }).format(new Date());
  } catch {
    return null;
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export function HeroCard({ hero }: HeroCardProps) {
  const router = useRouter();

  // Tick local time every minute for active trip
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (hero.kind !== 'active') return;
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, [hero.kind]);

  const handlePress = () => {
    if (hero.kind === 'active' || hero.kind === 'upcoming') {
      router.push(`/(tabs)/trips/${hero.trip.id}` as any);
    } else {
      router.push(`/(tabs)/discover/city/${hero.city.slug}` as any);
    }
  };

  // Determine image source — use local fallback if no remote URL
  const remoteUri = getImageUri(hero);
  const imageSource = remoteUri ? { uri: remoteUri } : FALLBACK_IMAGE;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
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
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={styles.gradient}
      />

      {/* Status pill */}
      <View style={styles.pillContainer}>
        {hero.kind === 'active' && (
          <View style={[styles.pill, styles.pillActive]}>
            <Text style={[styles.pillText, styles.pillTextActive]}>CURRENTLY TRAVELING</Text>
          </View>
        )}
        {hero.kind === 'upcoming' && (
          <View style={[styles.pill, styles.pillUpcoming]}>
            <Text style={[styles.pillText, styles.pillTextUpcoming]}>UPCOMING</Text>
          </View>
        )}
        {hero.kind === 'featured' && (
          <View style={[styles.pill, styles.pillFeatured]}>
            <Text style={[styles.pillText, styles.pillTextFeatured]}>FEATURED</Text>
          </View>
        )}
      </View>

      {/* Bottom overlay content */}
      <View style={styles.overlay}>
        {hero.kind === 'active' && renderActive(hero, now)}
        {hero.kind === 'upcoming' && renderUpcoming(hero)}
        {hero.kind === 'featured' && renderFeatured(hero)}
      </View>
    </Pressable>
  );
}

// ── Render helpers ─────────────────────────────────────────────────────────

function getImageUri(hero: HeroState): string | null {
  if (hero.kind === 'active' || hero.kind === 'upcoming') {
    return hero.cityImageUrl || null;
  }
  return hero.city.heroImageUrl || null;
}

function renderActive(hero: Extract<HeroState, { kind: 'active' }>, _tick: number) {
  const cityName = hero.trip.destinationName;
  const dayProgress = getDayProgress(hero.trip.arriving, hero.trip.leaving);
  const localTime = formatLocalTime(hero.cityTimezone);

  return (
    <>
      <Text style={styles.cityName} numberOfLines={1}>
        {cityName}
      </Text>
      {dayProgress && (
        <Text style={styles.metaText}>{dayProgress}</Text>
      )}
      {localTime && (
        <View style={styles.timeRow}>
          <Feather name="clock" size={12} color="rgba(255,255,255,0.8)" />
          <Text style={styles.timeText}>{localTime} local time</Text>
        </View>
      )}
    </>
  );
}

function renderUpcoming(hero: Extract<HeroState, { kind: 'upcoming' }>) {
  const cityName = hero.trip.destinationName;
  const countdown = getDaysUntil(hero.trip.arriving);
  const dateRange = formatDateRange(hero.trip.arriving, hero.trip.leaving);

  return (
    <>
      <Text style={styles.cityName} numberOfLines={1}>
        {cityName}
      </Text>
      {countdown && (
        <Text style={styles.metaText}>{countdown}</Text>
      )}
      {dateRange && (
        <Text style={styles.dateRangeText}>{dateRange}</Text>
      )}
    </>
  );
}

function renderFeatured(hero: Extract<HeroState, { kind: 'featured' }>) {
  return (
    <>
      <Text style={styles.cityName} numberOfLines={1}>
        {hero.city.name}
      </Text>
      <Text style={styles.countryName} numberOfLines={1}>
        {hero.city.countryName}
      </Text>
      {hero.city.shortBlurb && (
        <Text style={styles.blurbText} numberOfLines={2}>
          {hero.city.shortBlurb}
        </Text>
      )}
    </>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const CARD_HEIGHT = 180;

const styles = StyleSheet.create({
  container: {
    height: CARD_HEIGHT,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginHorizontal: spacing.screenX,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },

  // Status pills
  pillContainer: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.lg,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  pillActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  pillUpcoming: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  pillFeatured: {
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  pillText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  pillTextActive: {
    color: colors.greenFill,
  },
  pillTextUpcoming: {
    color: colors.orangeFill,
  },
  pillTextFeatured: {
    color: '#FFFFFF',
  },

  // Bottom overlay
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  cityName: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    lineHeight: 28,
    color: '#FFFFFF',
  },
  countryName: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  metaText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
  },
  dateRangeText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xs,
  },
  blurbText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  timeText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.8)',
  },
});
