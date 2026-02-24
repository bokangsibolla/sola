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
  lat,
  lng,
  name,
  address,
  onPress,
}) => {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.placeholder}>
        <Ionicons name="map-outline" size={32} color={colors.textMuted} />
        <Text style={styles.placeholderText}>Map (native only)</Text>
      </View>

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
  placeholder: {
    width: '100%',
    height: MAP_HEIGHT,
    backgroundColor: colors.neutralFill,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  placeholderText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
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
