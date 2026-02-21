import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
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
      <Text style={styles.sectionLabel}>DETAILS</Text>

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
              <Text style={styles.detailText}>{accommodation.address}</Text>
            </View>
          )}

          {accommodation.checkInTime && (
            <View style={styles.detailRow}>
              <Ionicons name="log-in-outline" size={16} color={colors.textMuted} />
              <Text style={styles.detailText}>
                Check-in: {accommodation.checkInTime}
              </Text>
            </View>
          )}

          {accommodation.checkOutTime && (
            <View style={styles.detailRow}>
              <Ionicons name="log-out-outline" size={16} color={colors.textMuted} />
              <Text style={styles.detailText}>
                Check-out: {accommodation.checkOutTime}
              </Text>
            </View>
          )}

          {accommodation.website && (
            <Pressable style={styles.detailRow} onPress={handleWebsite}>
              <Ionicons name="globe-outline" size={16} color={colors.blueSoft} />
              <Text style={[styles.detailText, styles.linkText]} numberOfLines={1}>
                {accommodation.website}
              </Text>
            </Pressable>
          )}

          {accommodation.phone && (
            <Pressable style={styles.detailRow} onPress={handlePhone}>
              <Ionicons name="call-outline" size={16} color={colors.textMuted} />
              <Text style={styles.detailText}>{accommodation.phone}</Text>
            </Pressable>
          )}

          {accommodation.paymentTypes && accommodation.paymentTypes.length > 0 && (
            <View style={styles.detailRow}>
              <Ionicons name="card-outline" size={16} color={colors.textMuted} />
              <Text style={styles.detailText}>
                {accommodation.paymentTypes.join(', ')}
              </Text>
            </View>
          )}

          {accommodation.nearestTransport && (
            <View style={styles.detailRow}>
              <Ionicons name="bus-outline" size={16} color={colors.textMuted} />
              <Text style={styles.detailText}>
                {accommodation.nearestTransport}
              </Text>
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
  detailText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  linkText: {
    color: colors.blueSoft,
  },
});
