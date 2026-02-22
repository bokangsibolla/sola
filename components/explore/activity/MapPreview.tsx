import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import MapView, { Marker } from 'react-native-maps';
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
  lat,
  lng,
  name,
  address,
  onPress,
}) => {
  const hasCoords = lat != null && lng != null;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      {hasCoords ? (
        <View style={styles.mapWrapper}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.008,
              longitudeDelta: 0.008,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            pointerEvents="none"
          >
            <Marker
              coordinate={{ latitude: lat, longitude: lng }}
              title={name}
            />
          </MapView>
          {/* Tap overlay — ensures the Pressable captures all taps */}
          <View style={styles.tapOverlay} />
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="map-outline" size={32} color={colors.textMuted} />
        </View>
      )}

      {/* Label bar at bottom */}
      <View style={styles.labelBar}>
        <Ionicons name="location" size={14} color={colors.orange} />
        <SolaText style={styles.labelText} numberOfLines={1}>
          {address ?? name}
        </SolaText>
        <SolaText style={styles.openText}>Open</SolaText>
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
  mapWrapper: {
    width: '100%',
    height: MAP_HEIGHT,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: MAP_HEIGHT,
  },
  tapOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholder: {
    width: '100%',
    height: MAP_HEIGHT,
    backgroundColor: colors.neutralFill,
    justifyContent: 'center',
    alignItems: 'center',
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
