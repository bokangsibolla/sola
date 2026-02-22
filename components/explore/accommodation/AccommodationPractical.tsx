import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import { MapPreview } from '@/components/explore/activity/MapPreview';
import type { Place } from '@/data/types';

interface AccommodationPracticalProps {
  accommodation: Place;
  onOpenMaps: () => void;
}

const AccommodationPractical: React.FC<AccommodationPracticalProps> = ({
  accommodation,
  onOpenMaps,
}) => {
  const handlePhone = () => {
    if (accommodation.phone) {
      Linking.openURL(`tel:${accommodation.phone}`);
    }
  };

  const handleWebsite = () => {
    if (accommodation.website) {
      const url = accommodation.website.startsWith('http')
        ? accommodation.website
        : `https://${accommodation.website}`;
      Linking.openURL(url);
    }
  };

  const hasDetails =
    accommodation.address ||
    accommodation.checkInTime ||
    accommodation.checkOutTime ||
    accommodation.website ||
    accommodation.phone ||
    (accommodation.paymentTypes && accommodation.paymentTypes.length > 0) ||
    accommodation.nearestTransport;

  return (
    <View style={styles.container}>
      <SolaText style={styles.sectionLabel}>DETAILS</SolaText>

      {/* Map preview */}
      <View style={styles.mapSection}>
        <MapPreview
          lat={accommodation.lat}
          lng={accommodation.lng}
          name={accommodation.name}
          address={accommodation.address}
          onPress={onOpenMaps}
        />
      </View>

      {/* Detail rows */}
      {hasDetails && (
        <View style={styles.detailsSection}>
          {accommodation.address && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color={colors.textMuted} />
              <SolaText variant="body" color={colors.textSecondary} style={styles.detailTextLayout}>{accommodation.address}</SolaText>
            </View>
          )}

          {accommodation.checkInTime && (
            <View style={styles.detailRow}>
              <Ionicons name="log-in-outline" size={16} color={colors.textMuted} />
              <SolaText variant="body" color={colors.textSecondary} style={styles.detailTextLayout}>
                Check-in: {accommodation.checkInTime}
              </SolaText>
            </View>
          )}

          {accommodation.checkOutTime && (
            <View style={styles.detailRow}>
              <Ionicons name="log-out-outline" size={16} color={colors.textMuted} />
              <SolaText variant="body" color={colors.textSecondary} style={styles.detailTextLayout}>
                Check-out: {accommodation.checkOutTime}
              </SolaText>
            </View>
          )}

          {accommodation.website && (
            <Pressable style={styles.detailRow} onPress={handleWebsite}>
              <Ionicons name="globe-outline" size={16} color={colors.blueSoft} />
              <SolaText variant="body" color={colors.blueSoft} style={styles.detailTextLayout} numberOfLines={1}>
                {accommodation.website}
              </SolaText>
            </Pressable>
          )}

          {accommodation.phone && (
            <Pressable style={styles.detailRow} onPress={handlePhone}>
              <Ionicons name="call-outline" size={16} color={colors.textMuted} />
              <SolaText variant="body" color={colors.textSecondary} style={styles.detailTextLayout}>{accommodation.phone}</SolaText>
            </Pressable>
          )}

          {accommodation.paymentTypes && accommodation.paymentTypes.length > 0 && (
            <View style={styles.detailRow}>
              <Ionicons name="card-outline" size={16} color={colors.textMuted} />
              <SolaText variant="body" color={colors.textSecondary} style={styles.detailTextLayout}>
                {accommodation.paymentTypes.join(', ')}
              </SolaText>
            </View>
          )}

          {accommodation.nearestTransport && (
            <View style={styles.detailRow}>
              <Ionicons name="bus-outline" size={16} color={colors.textMuted} />
              <SolaText variant="body" color={colors.textSecondary} style={styles.detailTextLayout}>
                {accommodation.nearestTransport}
              </SolaText>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export { AccommodationPractical };

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xxl,
  },
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  mapSection: {
    marginBottom: spacing.xl,
  },
  detailsSection: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  detailTextLayout: {
    flex: 1,
  },
});
