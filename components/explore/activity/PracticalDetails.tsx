import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import { MapPreview } from '@/components/explore/activity/MapPreview';
import type { Place } from '@/data/types';

interface PracticalDetailsProps {
  activity: Place;
  onSave: () => void;
  onOpenMaps: () => void;
  saved: boolean;
  canSave: boolean;
}

const PracticalDetails: React.FC<PracticalDetailsProps> = ({
  activity,
  onSave,
  onOpenMaps,
  saved,
  canSave,
}) => {
  const hasDetails =
    activity.address || activity.hoursText || activity.phone || activity.website;

  const handlePhone = () => {
    if (activity.phone) {
      Linking.openURL(`tel:${activity.phone}`);
    }
  };

  const handleWebsite = () => {
    if (activity.website) {
      const url = activity.website.startsWith('http')
        ? activity.website
        : `https://${activity.website}`;
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      {/* Map preview — always visible */}
      <View style={styles.mapSection}>
        <MapPreview
          lat={activity.lat}
          lng={activity.lng}
          name={activity.name}
          address={activity.address}
          onPress={onOpenMaps}
        />
      </View>

      {/* Details section */}
      {hasDetails && (
        <View style={styles.detailsSection}>
          <Text style={styles.sectionLabel}>DETAILS</Text>
          {activity.address && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color={colors.textMuted} />
              <Text style={styles.detailText}>{activity.address}</Text>
            </View>
          )}
          {activity.hoursText && (
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color={colors.textMuted} />
              <Text style={styles.detailText}>{activity.hoursText}</Text>
            </View>
          )}
          {activity.phone && (
            <Pressable style={styles.detailRow} onPress={handlePhone}>
              <Ionicons name="call-outline" size={16} color={colors.textMuted} />
              <Text style={styles.detailText}>{activity.phone}</Text>
            </Pressable>
          )}
          {activity.website && (
            <Pressable style={styles.detailRow} onPress={handleWebsite}>
              <Ionicons name="globe-outline" size={16} color={colors.blueSoft} />
              <Text style={[styles.detailText, styles.linkText]} numberOfLines={1}>
                {activity.website}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Action button — Save only (maps handled by map preview) */}
      <View style={styles.actionRow}>
        <Pressable
          onPress={onSave}
          disabled={!canSave}
          style={[
            styles.actionBtn,
            styles.saveBtn,
            saved && styles.saveBtnSaved,
            !canSave && styles.actionBtnDisabled,
          ]}
        >
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={20}
            color={colors.background}
          />
          <Text style={styles.saveBtnText}>
            {!canSave ? 'Sign in to save' : saved ? 'Saved' : 'Save'}
          </Text>
        </Pressable>

        <Pressable onPress={onOpenMaps} style={[styles.actionBtn, styles.mapsBtn]}>
          <Ionicons name="map-outline" size={20} color={colors.textPrimary} />
          <Text style={styles.mapsBtnText}>View on Maps</Text>
        </Pressable>
      </View>
    </View>
  );
};

export { PracticalDetails };

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xxl,
  },
  mapSection: {
    marginBottom: spacing.xl,
  },
  detailsSection: {
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  detailText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  linkText: {
    color: colors.blueSoft,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radius.full,
  },
  saveBtn: {
    backgroundColor: colors.orange,
  },
  saveBtnSaved: {
    backgroundColor: colors.greenSoft,
  },
  actionBtnDisabled: {
    backgroundColor: colors.textMuted,
  },
  saveBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.background,
  },
  mapsBtn: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  mapsBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
