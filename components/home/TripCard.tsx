import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';
import type { TripWithStops } from '@/data/trips/types';

interface TripCardProps {
  trip: TripWithStops;
  savedItemCount: number;
  cityImageUrl: string | null;
  status: 'active' | 'upcoming';
}

function formatDateRange(arriving: string | null, leaving: string | null): string {
  if (!arriving) return '';
  const start = new Date(arriving);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startStr = start.toLocaleDateString('en-US', options);
  if (!leaving) return startStr;
  const end = new Date(leaving);
  const endStr = end.toLocaleDateString('en-US', options);
  return `${startStr} – ${endStr}`;
}

export function TripCard({ trip, savedItemCount, cityImageUrl, status }: TripCardProps) {
  const router = useRouter();
  const displayTitle = trip.title || trip.destinationName;
  const dateRange = formatDateRange(trip.arriving, trip.leaving);
  const isActive = status === 'active';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={() => router.push(`/(tabs)/trips/${trip.id}` as any)}
      accessibilityRole="button"
      accessibilityLabel={`${displayTitle} trip`}
    >
      <View style={styles.card}>
        {cityImageUrl ? (
          <Image
            source={{ uri: cityImageUrl }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, styles.fallback]} />
        )}

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0.3 }}
          end={{ x: 0, y: 1 }}
        />

        <View style={styles.statusPillContainer}>
          <View style={[styles.statusPill, isActive ? styles.statusActive : styles.statusUpcoming]}>
            <Text style={[styles.statusText, isActive ? styles.statusTextActive : styles.statusTextUpcoming]}>
              {isActive ? 'Active' : 'Upcoming'}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {displayTitle}
          </Text>
          <View style={styles.meta}>
            {dateRange ? (
              <Text style={styles.metaText}>{dateRange}</Text>
            ) : null}
            {savedItemCount > 0 ? (
              <View style={styles.savedBadge}>
                <Feather name="bookmark" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.savedText}>{savedItemCount} saved</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.xl,
  },
  card: {
    height: 200,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  fallback: {
    backgroundColor: colors.neutralFill,
  },
  statusPillContainer: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    zIndex: 1,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  statusActive: {
    backgroundColor: colors.greenFill,
  },
  statusUpcoming: {
    backgroundColor: colors.orangeFill,
  },
  statusText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  statusTextActive: {
    color: colors.greenSoft,
  },
  statusTextUpcoming: {
    color: colors.orange,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  metaText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.8)',
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  savedText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.8)',
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },
});
