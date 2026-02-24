import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface StopCoord {
  name: string;
  lat: number | null;
  lng: number | null;
}

interface TripGalleryHeaderProps {
  heroUrl: string | null;
  secondaryUrl: string | null;
  stops: StopCoord[];
  statusStyle: { bg: string; text: string; label: string };
  dayNum: number | null;
  title: string;
  subtitle: string;
}

const PHOTO_HEIGHT = 140;
const MAP_HEIGHT = 80;

export const TripGalleryHeader: React.FC<TripGalleryHeaderProps> = ({
  heroUrl,
  secondaryUrl,
  stops,
  statusStyle,
  dayNum,
  title,
  subtitle,
}) => {
  // Collect stops with valid coordinates
  const validStops = stops.filter(
    (s): s is StopCoord & { lat: number; lng: number } =>
      s.lat != null && s.lng != null,
  );

  return (
    <View>
      {/* ── Photo grid ──────────────────────────────────────── */}
      <View style={styles.photoRow}>
        {heroUrl ? (
          <Image source={{ uri: heroUrl }} style={styles.photoLeft} contentFit="cover" />
        ) : (
          <View style={[styles.photoLeft, styles.photoPlaceholder]}>
            <Ionicons name="image-outline" size={28} color={colors.textMuted} />
          </View>
        )}
        {secondaryUrl ? (
          <Image source={{ uri: secondaryUrl }} style={styles.photoRight} contentFit="cover" />
        ) : (
          <View style={[styles.photoRight, styles.photoPlaceholder]}>
            <Ionicons name="image-outline" size={28} color={colors.textMuted} />
          </View>
        )}
      </View>

      {/* ── Map strip ───────────────────────────────────────── */}
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={20} color={colors.textMuted} />
        <Text style={styles.mapPlaceholderText}>
          {validStops.length > 0
            ? `${validStops.length} stop${validStops.length > 1 ? 's' : ''} planned`
            : 'Map preview'}
        </Text>
      </View>

      {/* ── Title section ───────────────────────────────────── */}
      <View style={styles.titleSection}>
        <View style={styles.statusRow}>
          <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusStyle.label}
              {dayNum ? ` \u00B7 Day ${dayNum}` : ''}
            </Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
      </View>
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Photo grid
  photoRow: {
    flexDirection: 'row',
    height: PHOTO_HEIGHT,
    gap: 2,
  },
  photoLeft: {
    flex: 1,
    height: PHOTO_HEIGHT,
  },
  photoRight: {
    flex: 1,
    height: PHOTO_HEIGHT,
  },
  photoPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Map
  mapPlaceholder: {
    height: MAP_HEIGHT,
    backgroundColor: colors.neutralFill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  mapPlaceholderText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },

  // Title section
  titleSection: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
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
    fontSize: 24,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
