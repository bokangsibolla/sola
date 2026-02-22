import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TripEntry } from '@/data/trips/types';
import { ENTRY_ICONS, MOOD_COLORS, formatDateRelative } from '@/data/trips/helpers';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

interface JournalSectionProps {
  entries: TripEntry[];
  onViewAll: () => void;
  onEntryPress: (entry: TripEntry) => void;
}

export const JournalSection: React.FC<JournalSectionProps> = ({
  entries,
  onViewAll,
  onEntryPress,
}) => {
  if (entries.length === 0) return null;

  const preview = entries.slice(0, 3);

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionHeader}>JOURNAL</Text>
        {entries.length > 3 && (
          <Pressable onPress={onViewAll} hitSlop={12}>
            <Text style={styles.viewAll}>View all {'→'}</Text>
          </Pressable>
        )}
      </View>

      {preview.map((entry) => {
        const icon = ENTRY_ICONS[entry.entryType];
        const moodStyle = entry.moodTag ? MOOD_COLORS[entry.moodTag] : null;
        const dateLabel = formatDateRelative(entry.createdAt);

        return (
          <Pressable
            key={entry.id}
            onPress={() => onEntryPress(entry)}
            style={({ pressed }) => [styles.entryCard, pressed && pressedState]}
          >
            <Text style={styles.entryIcon}>{icon}</Text>
            <View style={styles.entryContent}>
              {entry.title && (
                <Text style={styles.entryTitle} numberOfLines={1}>
                  {entry.title}
                </Text>
              )}
              {entry.body && (
                <Text style={styles.entryBody} numberOfLines={2}>
                  {entry.body}
                </Text>
              )}
              <View style={styles.entryMeta}>
                <Text style={styles.entryDate}>{dateLabel}</Text>
                {entry.locationName && (
                  <Text style={styles.entryDate}> · {entry.locationName}</Text>
                )}
                {moodStyle && (
                  <View style={[styles.moodPill, { backgroundColor: moodStyle.bg }]}>
                    <Text style={[styles.moodText, { color: moodStyle.text }]}>
                      {moodStyle.label}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingTop: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.sm,
  },
  sectionHeader: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  viewAll: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
  entryCard: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.screenX,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  entryIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  entryContent: {
    flex: 1,
  },
  entryTitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  entryBody: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  entryDate: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  moodPill: {
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: spacing.sm,
  },
  moodText: {
    fontFamily: fonts.medium,
    fontSize: 10,
  },
});
