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

const MAP_HEIGHT = 180;

const MapPreview: React.FC<MapPreviewProps> = ({
  name,
  address,
  onPress,
}) => {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      {/* Styled placeholder that evokes a map */}
      <View style={styles.mapPlaceholder}>
        <View style={styles.gridOverlay}>
          <View style={styles.gridH} />
          <View style={[styles.gridH, { top: '50%' }]} />
          <View style={[styles.gridH, { top: '66%' }]} />
          <View style={styles.gridV} />
          <View style={[styles.gridV, { left: '50%' }]} />
          <View style={[styles.gridV, { left: '66%' }]} />
        </View>
        <View style={styles.pinContainer}>
          <View style={styles.pin} />
          <View style={styles.pinShadow} />
        </View>
      </View>

      {/* Label bar at bottom */}
      <View style={styles.labelBar}>
        <Ionicons name="location" size={14} color={colors.orange} />
        <Text style={styles.labelText} numberOfLines={1}>
          {address ?? name}
        </Text>
        <Text style={styles.openText}>Open</Text>
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
  mapPlaceholder: {
    width: '100%',
    height: MAP_HEIGHT,
    backgroundColor: colors.neutralFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '33%',
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
  gridV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '33%',
    width: 1,
    backgroundColor: colors.borderSubtle,
  },
  pinContainer: {
    alignItems: 'center',
  },
  pin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.orange,
    borderWidth: 3,
    borderColor: colors.background,
  },
  pinShadow: {
    width: 8,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginTop: 2,
  },
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
  openText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.orange,
  },
});
