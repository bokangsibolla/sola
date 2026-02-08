import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing } from '@/constants/design';
import { groupEntriesByDate } from '@/data/trips/helpers';
import type { TripEntry } from '@/data/trips/types';
import JourneyEntryCard from './JourneyEntryCard';

interface JourneyTimelineProps {
  entries: TripEntry[];
}

export default function JourneyTimeline({ entries }: JourneyTimelineProps) {
  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Ionicons name="book-outline" size={28} color={colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>Your journey starts here</Text>
        <Text style={styles.emptyBody}>
          Add your first entry — a note, a check-in, or how you're feeling.
        </Text>
      </View>
    );
  }

  const grouped = groupEntriesByDate(entries);

  return (
    <View style={styles.container}>
      {grouped.map(([dateLabel, dayEntries]) => (
        <View key={dateLabel} style={styles.dateGroup}>
          <Text style={styles.dateLabel}>{dateLabel.toUpperCase()}</Text>
          {(dayEntries as TripEntry[]).map((entry) => (
            entry?.id ? <JourneyEntryCard key={entry.id} entry={entry} /> : null
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
  },
  dateGroup: {
    marginBottom: spacing.lg,
  },
  dateLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyBody: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
