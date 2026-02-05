import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { useData } from '@/hooks/useData';
import { getCityById } from '@/data/api';
import { formatDateShort, getFlag, tripDayNumber, STATUS_COLORS } from '@/data/trips/helpers';
import type { TripWithStops } from '@/data/trips/types';

interface CurrentTripCardProps {
  trip: TripWithStops;
}

const QUICK_ACTIONS = [
  { label: 'Journal', icon: 'book-outline' as const, tab: 0 },
  { label: 'Plan', icon: 'map-outline' as const, tab: 1 },
  { label: 'People', icon: 'people-outline' as const, tab: 2 },
];

export default function CurrentTripCard({ trip }: CurrentTripCardProps) {
  const router = useRouter();
  const stops = trip.stops ?? [];
  const firstStop = stops[0];
  const { data: city } = useData(
    () => (firstStop?.cityId ? getCityById(firstStop.cityId) : Promise.resolve(null)),
    [firstStop?.cityId]
  );
  const heroUrl = city?.heroImageUrl ?? trip.coverImageUrl ?? null;
  const flag = getFlag(trip.countryIso2);
  const dayNum = tripDayNumber(trip);
  const stopsText = stops.length > 1
    ? stops.map((s) => s.cityName || s.countryIso2).join(' → ')
    : trip.destinationName;

  const dateText = trip.arriving && trip.leaving
    ? `${formatDateShort(trip.arriving)} — ${formatDateShort(trip.leaving)}`
    : 'Flexible dates';

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.heroContainer, pressed && styles.pressed]}
        onPress={() => router.push(`/trips/${trip.id}`)}
      >
        {heroUrl ? (
          <Image source={{ uri: heroUrl }} style={styles.heroImage} contentFit="cover" transition={200} />
        ) : (
          <View style={[styles.heroImage, styles.heroPlaceholder]} />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.65)']}
          style={styles.gradient}
        />
        <View style={styles.overlay}>
          <View style={styles.statusRow}>
            <View style={[styles.statusPill, { backgroundColor: STATUS_COLORS.active.bg }]}>
              <Text style={[styles.statusText, { color: STATUS_COLORS.active.text }]}>
                Active{dayNum ? ` · Day ${dayNum}` : ''}
              </Text>
            </View>
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {trip.title || trip.destinationName}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {flag} {stopsText} · {trip.nights} {trip.nights === 1 ? 'night' : 'nights'}
          </Text>
          <Text style={styles.dates}>{dateText}</Text>
        </View>
      </Pressable>

      <View style={styles.actionsRow}>
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.label}
            style={styles.actionPill}
            onPress={() => router.push(`/trips/${trip.id}?tab=${action.tab}`)}
          >
            <Ionicons name={action.icon} size={16} color={colors.orange} />
            <Text style={styles.actionText}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  heroContainer: {
    height: 200,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroPlaceholder: {
    backgroundColor: colors.neutralFill,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  statusText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  dates: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.pill,
  },
  actionText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
});
