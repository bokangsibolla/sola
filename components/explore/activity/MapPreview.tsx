import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface MapPreviewProps {
  lat: number | null;
  lng: number | null;
  name: string;
  address: string | null;
  onPress: () => void;
}

const MAP_HEIGHT = 100;

const MapPreview: React.FC<MapPreviewProps> = ({
  lat,
  lng,
  name,
  address,
  onPress,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      {/* Stylised map area — muted tones, grid lines, pin */}
      <View style={styles.mapArea}>
        {/* Faint grid lines */}
        <View style={styles.gridH1} />
        <View style={styles.gridH2} />
        <View style={styles.gridV1} />
        <View style={styles.gridV2} />

        {/* Centre pin */}
        <View style={styles.pinShadow} />
        <Ionicons name="location" size={28} color={colors.orange} style={styles.pin} />

        {/* "Open in Maps" label */}
        <View style={styles.openPill}>
          <Text style={styles.openPillText}>Open in Maps</Text>
          <Ionicons name="open-outline" size={10} color={colors.textMuted} />
        </View>
      </View>

      {/* Address bar */}
      <View style={styles.labelBar}>
        <Ionicons name="location-outline" size={14} color={colors.orange} />
        <Text style={styles.labelText} numberOfLines={1}>
          {address ?? name}
        </Text>
      </View>
    </Pressable>
  );
};

export { MapPreview };

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  // Map area — soft background with subtle grid
  mapArea: {
    width: '100%',
    height: MAP_HEIGHT,
    backgroundColor: '#F0EDEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridH1: {
    position: 'absolute',
    top: '33%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  gridH2: {
    position: 'absolute',
    top: '66%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  gridV1: {
    position: 'absolute',
    left: '33%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  gridV2: {
    position: 'absolute',
    left: '66%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  pin: {
    marginBottom: 2,
  },
  pinShadow: {
    position: 'absolute',
    width: 8,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.10)',
    top: '50%',
    marginTop: 12,
  },
  openPill: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  openPillText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textSecondary,
  },

  // Address bar
  labelBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  labelText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
});
