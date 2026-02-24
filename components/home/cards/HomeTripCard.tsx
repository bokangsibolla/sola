import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

interface HomeTripCardProps {
  trip: {
    id: string;
    title?: string | null;
    destinationName: string;
    coverImageUrl?: string | null;
    arriving?: string | null;
    leaving?: string | null;
    status: string;
  };
  variant: 'active' | 'upcoming' | 'recap';
}

export function HomeTripCard({ trip, variant }: HomeTripCardProps) {
  const router = useRouter();

  const label =
    variant === 'active'
      ? 'Your trip right now'
      : variant === 'upcoming'
        ? 'Coming up'
        : 'How was your trip?';

  const cta = variant === 'recap' ? 'Add photos & share' : 'View trip';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(`/(tabs)/trips/${trip.id}` as any)}
    >
      {trip.coverImageUrl ? (
        <Image
          source={{ uri: trip.coverImageUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, styles.placeholder]} />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.65)']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {trip.title || trip.destinationName}
        </Text>
        {trip.arriving && trip.leaving && (
          <Text style={styles.dates}>
            {trip.arriving} — {trip.leaving}
          </Text>
        )}
        <View style={styles.ctaRow}>
          <Text style={styles.ctaText}>{cta} →</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 200,
    borderRadius: radius.cardLg,
    overflow: 'hidden',
  },
  pressed: pressedState,
  placeholder: {
    backgroundColor: colors.neutralFill,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 2,
  },
  dates: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  ctaRow: {
    marginTop: spacing.sm,
  },
  ctaText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
