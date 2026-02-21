import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  colors,
  elevation,
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

function formatDateRange(arriving: string | null, leaving: string | null): string | null {
  if (!arriving) return null;
  const fmt = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  if (leaving) return `${fmt(arriving)} \u2013 ${fmt(leaving)}`;
  return fmt(arriving);
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

const SEVERITY_STYLES = {
  info: { bg: colors.blueFill, color: colors.blueSoft, icon: 'info' as const },
  advisory: { bg: colors.warningFill, color: colors.warning, icon: 'alert-triangle' as const },
  alert: { bg: colors.emergencyFill, color: colors.emergency, icon: 'alert-circle' as const },
};

// ── Component ────────────────────────────────────────────────────────────────

export function HeroModule({ hero, travelUpdate }: HeroModuleProps) {
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
  const isFeatured = hero.kind === 'featured';

  return (
    <View style={styles.module}>
      {/* Image card */}
      <Pressable
        style={({ pressed }) => [
          pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
        ]}
        onPress={handlePress}
      >
        <Image
          source={imageSource}
          style={[styles.image, isFeatured && styles.imageFeatured]}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={[styles.gradient, isFeatured && styles.imageFeatured]}
        />

        {/* Status pill */}
        <View style={styles.pillContainer}>
          {hero.kind === 'active' && (
            <View style={[styles.pill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={[styles.pillText, { color: colors.greenFill }]}>
                CURRENTLY TRAVELING
              </Text>
            </View>
          )}
          {hero.kind === 'upcoming' && (
            <View style={[styles.pill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={[styles.pillText, { color: colors.orangeFill }]}>UPCOMING</Text>
            </View>
          )}
          {hero.kind === 'featured' && (
            <View style={[styles.pill, { backgroundColor: 'rgba(0,0,0,0.35)' }]}>
              <Text style={[styles.pillText, { color: '#FFFFFF' }]}>FEATURED</Text>
            </View>
          )}
        </View>

        {/* Overlay text */}
        <View style={styles.overlay}>
          {hero.kind === 'active' && (
            <>
              <Text style={styles.cityName} numberOfLines={1}>
                {hero.trip.destinationName}
              </Text>
              {(() => {
                const progress = getDayProgress(hero.trip.arriving, hero.trip.leaving);
                return progress ? <Text style={styles.metaText}>{progress}</Text> : null;
              })()}
            </>
          )}
          {hero.kind === 'upcoming' && (
            <>
              <Text style={styles.cityName} numberOfLines={1}>
                {hero.trip.destinationName}
              </Text>
              {(() => {
                const countdown = getDaysUntil(hero.trip.arriving);
                return countdown ? <Text style={styles.metaText}>{countdown}</Text> : null;
              })()}
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

      {/* Below-image content */}
      <View style={styles.belowImage}>
        {/* Active: data chips */}
        {hero.kind === 'active' && (
          <View style={styles.chipRow}>
            {(() => {
              const localTime = formatLocalTime(hero.cityTimezone);
              return localTime ? (
                <View style={styles.dataChip}>
                  <Feather name="clock" size={12} color={colors.textSecondary} />
                  <Text style={styles.chipText}>{localTime}</Text>
                </View>
              ) : null;
            })()}
          </View>
        )}

        {/* Upcoming: meta row + CTA */}
        {hero.kind === 'upcoming' && (
          <>
            <Text style={styles.dateRange}>
              {formatDateRange(hero.trip.arriving, hero.trip.leaving)}
              {hero.savedItemCount > 0 &&
                `  \u00B7  ${hero.savedItemCount} ${hero.savedItemCount === 1 ? 'place' : 'places'} saved`}
            </Text>
            <Pressable onPress={handlePress} hitSlop={8} style={styles.ctaRow}>
              <Text style={styles.ctaText}>Continue planning</Text>
              <Feather name="arrow-right" size={14} color={colors.orange} />
            </Pressable>
          </>
        )}

        {/* Featured: signal chips + CTA */}
        {hero.kind === 'featured' && (
          <>
            <View style={styles.chipRow}>
              <View style={styles.signalChip}>
                <Text style={styles.signalChipText}>Solo-friendly</Text>
              </View>
            </View>
            <Pressable onPress={handlePress} hitSlop={8} style={styles.ctaRow}>
              <Text style={styles.ctaText}>Start planning</Text>
              <Feather name="arrow-right" size={14} color={colors.orange} />
            </Pressable>
          </>
        )}

        {/* Travel advisory (active trip only) */}
        {hero.kind === 'active' && travelUpdate && (
          <View
            style={[
              styles.advisory,
              { backgroundColor: SEVERITY_STYLES[travelUpdate.severity].bg },
            ]}
          >
            <Feather
              name={SEVERITY_STYLES[travelUpdate.severity].icon}
              size={14}
              color={SEVERITY_STYLES[travelUpdate.severity].color}
            />
            <Text
              style={[
                styles.advisoryText,
                { color: SEVERITY_STYLES[travelUpdate.severity].color },
              ]}
              numberOfLines={1}
            >
              {travelUpdate.title}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const IMAGE_HEIGHT_TRIP = 200;
const IMAGE_HEIGHT_FEATURED = 220;

const styles = StyleSheet.create({
  module: {
    marginHorizontal: spacing.screenX,
    marginBottom: spacing.xl,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.module,
    overflow: 'hidden',
    ...elevation.lg,
  },
  image: {
    width: '100%',
    height: IMAGE_HEIGHT_TRIP,
  },
  imageFeatured: {
    height: IMAGE_HEIGHT_FEATURED,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    height: IMAGE_HEIGHT_TRIP,
  },

  // Status pill
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
  pillText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Overlay text
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
  metaText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
  },
  blurbText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
  },

  // Below image area
  belowImage: {
    padding: spacing.moduleInset,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dataChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  signalChip: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  signalChipText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  dateRange: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  ctaText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.orange,
  },

  // Advisory
  advisory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.cardLg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  advisoryText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});
