import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '@/hooks/useData';
import { getCityById } from '@/data/api';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { formatDateShort, getFlag, STATUS_COLORS } from '@/data/trips/helpers';
import type { TripWithStops } from '@/data/trips/types';

interface TripListCardProps {
  trip: TripWithStops;
  onDelete?: (tripId: string) => void;
}

const HERO_HEIGHT = 160;

export default function TripListCard({ trip, onDelete }: TripListCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const stops = trip.stops ?? [];
  const firstStop = stops[0];
  const { data: city } = useData(
    () => (firstStop?.cityId ? getCityById(firstStop.cityId) : Promise.resolve(null)),
    [firstStop?.cityId],
  );

  const heroUrl = city?.heroImageUrl ?? trip.coverImageUrl ?? null;
  const flag = getFlag(trip.countryIso2);
  const statusStyle = STATUS_COLORS[trip.status] ?? STATUS_COLORS.draft;

  const stopsText = stops.length > 1
    ? stops.map((s) => s.cityName || s.countryIso2).join(' \u2192 ')
    : trip.destinationName;

  const dateText = trip.arriving && trip.leaving
    ? `${formatDateShort(trip.arriving)} \u2014 ${formatDateShort(trip.leaving)}`
    : 'Flexible dates';

  const nightsLabel = trip.nights != null
    ? `${trip.nights} ${trip.nights === 1 ? 'night' : 'nights'}`
    : null;

  const handleDelete = () => {
    setMenuOpen(false);
    Alert.alert(
      'Delete trip',
      'This will permanently delete this trip. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(trip.id),
        },
      ],
    );
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        onPress={() => router.push(`/trips/${trip.id}`)}
      >
        {/* Hero image */}
        <View style={styles.heroContainer}>
          {heroUrl ? (
            <Image
              source={{ uri: heroUrl }}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.heroPlaceholder]}>
              <SolaText style={styles.heroPlaceholderFlag}>{flag}</SolaText>
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Status badge — top left */}
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <SolaText style={[styles.statusText, { color: statusStyle.text }]}>
                {statusStyle.label}
              </SolaText>
            </View>
          </View>

          {/* 3-dot menu — top right */}
          <Pressable
            style={styles.menuButton}
            onPress={() => setMenuOpen(!menuOpen)}
            hitSlop={8}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color="#FFFFFF" />
          </Pressable>

          {/* Title + meta — bottom */}
          <View style={styles.overlay}>
            <SolaText style={styles.title} numberOfLines={1}>
              {trip.title || trip.destinationName}
            </SolaText>
            <SolaText style={styles.subtitle} numberOfLines={1}>
              {flag} {stopsText}
            </SolaText>
          </View>
        </View>

        {/* Info bar below image */}
        <View style={styles.infoBar}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <SolaText style={styles.infoText}>{dateText}</SolaText>
          </View>
          {nightsLabel && (
            <View style={styles.infoItem}>
              <Ionicons name="moon-outline" size={13} color={colors.textSecondary} />
              <SolaText style={styles.infoText}>{nightsLabel}</SolaText>
            </View>
          )}
          {stops.length > 1 && (
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              <SolaText style={styles.infoText}>{stops.length} stops</SolaText>
            </View>
          )}
        </View>
      </Pressable>

      {/* Dropdown menu */}
      {menuOpen && (
        <>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setMenuOpen(false)}
          />
          <View style={styles.dropdown}>
            <Pressable style={styles.dropdownItem} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={16} color={colors.emergency} />
              <SolaText style={styles.dropdownTextDanger}>Delete trip</SolaText>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  card: {
    borderRadius: radius.cardLg,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  // Hero
  heroContainer: {
    height: HERO_HEIGHT,
  },
  heroPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholderFlag: {
    fontSize: 40,
    opacity: 0.6,
  },

  // Overlaid elements
  badgeRow: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  statusText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  menuButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },

  // Info bar
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Dropdown
  dropdown: {
    position: 'absolute',
    top: spacing.xxxl,
    right: spacing.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    paddingVertical: spacing.xs,
    zIndex: 100,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minWidth: 140,
  },
  dropdownTextDanger: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.emergency,
  },
});
