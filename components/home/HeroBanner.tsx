import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';

// ---------------------------------------------------------------------------
// Plan Trip Card (no-trip state) — image-forward with text overlay
// ---------------------------------------------------------------------------

export function PlanTripCard({ cityImageUrl }: { cityImageUrl?: string | null }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/(tabs)/trips/new' as any)}
      style={({ pressed }) => [
        planStyles.card,
        pressed && { opacity: pressedState.opacity },
      ]}
    >
      {cityImageUrl ? (
        <Image
          source={{ uri: cityImageUrl }}
          style={planStyles.image}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={planStyles.imagePlaceholder} />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)']}
        style={planStyles.gradient}
      />
      <View style={planStyles.content}>
        <Text style={planStyles.title}>Plan your first solo trip</Text>
        <View style={planStyles.action}>
          <Text style={planStyles.actionText}>Start planning</Text>
          <Feather name="arrow-right" size={14} color={colors.orange} />
        </View>
      </View>
    </Pressable>
  );
}

const planStyles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.screenX,
    height: 180,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.neutralFill,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.orange,
  },
});

// ---------------------------------------------------------------------------
// Trip Status Card (has-trip state) — image-forward with overlay
// ---------------------------------------------------------------------------

interface TripStatusCardProps {
  tripId: string;
  tripTitle: string;
  destination: string;
  dates?: string;
  daysAway?: number;
  isActive?: boolean;
  imageUrl?: string | null;
}

export function TripStatusCard({
  tripId,
  tripTitle,
  destination,
  dates,
  daysAway,
  isActive,
  imageUrl,
}: TripStatusCardProps) {
  const router = useRouter();

  const statusText = isActive
    ? 'Currently traveling'
    : daysAway !== undefined && daysAway >= 0
      ? daysAway === 0
        ? 'Departing today'
        : daysAway === 1
          ? 'Tomorrow'
          : `${daysAway} days away`
      : undefined;

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/trips/${tripId}` as any)}
      style={({ pressed }) => [
        tripStyles.card,
        pressed && { opacity: pressedState.opacity },
      ]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={tripStyles.image}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={tripStyles.imagePlaceholder} />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={tripStyles.gradient}
      />

      {/* Status badge — top-left */}
      {statusText && (
        <View style={[
          tripStyles.statusBadge,
          isActive ? tripStyles.statusActive : tripStyles.statusUpcoming,
        ]}>
          <Text style={[
            tripStyles.statusText,
            isActive ? tripStyles.statusTextActive : tripStyles.statusTextUpcoming,
          ]}>
            {statusText}
          </Text>
        </View>
      )}

      {/* Content at bottom */}
      <View style={tripStyles.content}>
        <Text style={tripStyles.title} numberOfLines={1}>{tripTitle}</Text>
        {destination !== tripTitle && (
          <Text style={tripStyles.destination} numberOfLines={1}>{destination}</Text>
        )}
        {dates && <Text style={tripStyles.dates}>{dates}</Text>}
        <View style={tripStyles.action}>
          <Text style={tripStyles.actionText}>View trip</Text>
          <Feather name="arrow-right" size={14} color={colors.orange} />
        </View>
      </View>
    </Pressable>
  );
}

const tripStyles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.screenX,
    height: 200,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.neutralFill,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  statusActive: {
    backgroundColor: colors.greenFill,
  },
  statusUpcoming: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  statusText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
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
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  destination: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  dates: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.sm,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.orange,
  },
});
