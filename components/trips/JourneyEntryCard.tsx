import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { formatTime, ENTRY_ICONS, ENTRY_LABELS, MOOD_COLORS } from '@/data/trips/helpers';
import type { TripEntry } from '@/data/trips/types';

interface JourneyEntryCardProps {
  entry: TripEntry;
  onPress?: () => void;
}

export default function JourneyEntryCard({ entry, onPress }: JourneyEntryCardProps) {
  if (entry.entryType === 'comfort_check' && entry.moodTag) {
    const mood = MOOD_COLORS[entry.moodTag];
    return (
      <Pressable
        style={({ pressed }) => [styles.comfortCard, { backgroundColor: mood.bg }, pressed && styles.pressed]}
        onPress={onPress}
      >
        <View style={styles.comfortRow}>
          <View style={[styles.moodDot, { backgroundColor: mood.text }]} />
          <SolaText style={[styles.comfortText, { color: mood.text }]}>
            Feeling {mood.label.toLowerCase()}
          </SolaText>
          <View style={styles.spacer} />
          {entry.locationName && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color={mood.text} />
              <SolaText style={[styles.locationText, { color: mood.text }]} numberOfLines={1}>
                {entry.locationName}
              </SolaText>
            </View>
          )}
          <SolaText style={[styles.timeText, { color: mood.text }]}>
            {formatTime(entry.createdAt)}
          </SolaText>
        </View>
      </Pressable>
    );
  }

  const icon = ENTRY_ICONS[entry.entryType];
  const label = ENTRY_LABELS[entry.entryType];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.headerRow}>
        <SolaText style={styles.icon}>{icon}</SolaText>
        <SolaText style={styles.title} numberOfLines={1}>
          {entry.title || label}
        </SolaText>
      </View>
      {entry.body ? (
        <SolaText style={styles.body} numberOfLines={2}>
          {entry.body}
        </SolaText>
      ) : null}
      <View style={styles.footerRow}>
        {entry.locationName && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={colors.textMuted} />
            <SolaText style={styles.locationText} numberOfLines={1}>
              {entry.locationName}
            </SolaText>
          </View>
        )}
        <View style={styles.spacer} />
        <SolaText style={styles.timeText}>{formatTime(entry.createdAt)}</SolaText>
      </View>
      {entry.entryType === 'tip' && entry.isShareableTip && (
        <View style={styles.shareableBadge}>
          <SolaText style={styles.shareableText}>Shareable</SolaText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 16,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    maxWidth: 150,
  },
  spacer: {
    flex: 1,
  },
  timeText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  shareableBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.orangeFill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  shareableText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.orange,
  },
  // Comfort check card
  comfortCard: {
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  comfortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  comfortText: {
    fontFamily: fonts.medium,
    fontSize: 14,
  },
});
