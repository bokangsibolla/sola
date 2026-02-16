import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';
import type { TripBlockState } from '@/data/home/types';

interface TripBlockProps {
  tripBlock: TripBlockState;
}

function formatDateRange(arriving: string | null, leaving: string | null): string {
  if (!arriving) return '';
  const fmt = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  if (leaving) return `${fmt(arriving)} – ${fmt(leaving)}`;
  return fmt(arriving);
}

export function TripBlock({ tripBlock }: TripBlockProps) {
  const router = useRouter();

  if (tripBlock.kind === 'none') {
    return (
      <View style={styles.container}>
        <Pressable
          style={({ pressed }) => [
            styles.emptyCard,
            pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
          ]}
          onPress={() => router.push('/trips/new' as any)}
        >
          <View style={styles.emptyIcon}>
            <Feather name="map-pin" size={20} color={colors.orange} />
          </View>
          <View style={styles.emptyContent}>
            <Text style={styles.emptyTitle}>Start planning your next trip</Text>
            <Text style={styles.emptySubtitle}>
              Save places, set dates, and organise your journey
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </Pressable>
      </View>
    );
  }

  const { trip, savedItemCount } = tripBlock;
  const isActive = tripBlock.kind === 'active';
  const accentColor = isActive ? colors.greenSoft : colors.orange;
  const accentBg = isActive ? colors.greenFill : colors.orangeFill;
  const statusLabel = isActive ? 'Currently traveling' : 'Upcoming';

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          { borderColor: accentColor },
          pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
        ]}
        onPress={() => router.push(`/trips/${trip.id}` as any)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.statusPill, { backgroundColor: accentBg }]}>
            <Text style={[styles.statusText, { color: accentColor }]}>{statusLabel}</Text>
          </View>
        </View>

        <Text style={styles.tripTitle} numberOfLines={1}>
          {trip.title || trip.destinationName}
        </Text>

        <View style={styles.metaRow}>
          {trip.arriving && (
            <View style={styles.metaItem}>
              <Feather name="calendar" size={13} color={colors.textMuted} />
              <Text style={styles.metaText}>
                {formatDateRange(trip.arriving, trip.leaving)}
              </Text>
            </View>
          )}
          {trip.nights > 0 && (
            <View style={styles.metaItem}>
              <Feather name="moon" size={13} color={colors.textMuted} />
              <Text style={styles.metaText}>{trip.nights} nights</Text>
            </View>
          )}
          {savedItemCount > 0 && (
            <View style={styles.metaItem}>
              <Feather name="bookmark" size={13} color={colors.textMuted} />
              <Text style={styles.metaText}>{savedItemCount} saved</Text>
            </View>
          )}
        </View>

        <View style={styles.ctaRow}>
          <Text style={[styles.ctaText, { color: accentColor }]}>
            {isActive ? 'Continue your journey' : 'Continue planning'}
          </Text>
          <Feather name="arrow-right" size={14} color={accentColor} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.xl,
  },

  // Empty state
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContent: {
    flex: 1,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Active / Upcoming card
  card: {
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  statusText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  tripTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ctaText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
});
