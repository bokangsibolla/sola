import React, { useMemo } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useData } from '@/hooks/useData';
import { getTripEntries } from '@/data/trips/tripApi';
import type { TripEntry } from '@/data/trips/types';
import {
  ENTRY_ICONS,
  ENTRY_LABELS,
  MOOD_COLORS,
  formatDateRelative,
  groupEntriesByDate,
} from '@/data/trips/helpers';
import NavigationHeader from '@/components/NavigationHeader';
import LoadingScreen from '@/components/LoadingScreen';
import { colors, fonts, pressedState, radius, spacing } from '@/constants/design';
import { FLOATING_TAB_BAR_HEIGHT } from '@/components/TabBar';

// ── Types ─────────────────────────────────────────────────────────────────────

type SectionItem =
  | { type: 'date-header'; key: string; label: string }
  | { type: 'entry'; key: string; entry: TripEntry };

// ── Screen ────────────────────────────────────────────────────────────────────

export default function JournalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const { data: entries, loading } = useData(
    () => (id ? getTripEntries(id) : Promise.resolve([])),
    ['tripEntries', id],
  );

  const allEntries = entries ?? [];

  // Build a flat list with date section headers interleaved
  const listItems = useMemo((): SectionItem[] => {
    if (allEntries.length === 0) return [];

    const groups = groupEntriesByDate(allEntries);
    const items: SectionItem[] = [];

    for (const [dateLabel, groupEntries] of groups) {
      items.push({ type: 'date-header', key: `header-${dateLabel}`, label: dateLabel });
      for (const entry of groupEntries) {
        const typedEntry = entry as TripEntry;
        items.push({ type: 'entry', key: typedEntry.id, entry: typedEntry });
      }
    }

    return items;
  }, [allEntries]);

  // ── Render helpers ────────────────────────────────────────────────────────

  const renderItem = ({ item }: { item: SectionItem }) => {
    if (item.type === 'date-header') {
      return (
        <View style={styles.dateHeaderRow}>
          <Text style={styles.dateHeaderText}>{item.label}</Text>
        </View>
      );
    }

    const { entry } = item;
    const icon = ENTRY_ICONS[entry.entryType];
    const typeLabel = ENTRY_LABELS[entry.entryType];
    const moodStyle = entry.moodTag ? MOOD_COLORS[entry.moodTag] : null;

    return (
      <Pressable
        style={({ pressed }) => [styles.entryCard, pressed && pressedState]}
      >
        <Text style={styles.entryIcon}>{icon}</Text>
        <View style={styles.entryContent}>
          {/* Entry type label */}
          <Text style={styles.entryTypeLabel}>{typeLabel}</Text>

          {/* Title */}
          {entry.title && (
            <Text style={styles.entryTitle} numberOfLines={2}>
              {entry.title}
            </Text>
          )}

          {/* Body */}
          {entry.body && (
            <Text style={styles.entryBody} numberOfLines={4}>
              {entry.body}
            </Text>
          )}

          {/* Meta row: location + mood pill */}
          <View style={styles.entryMeta}>
            {entry.locationName && (
              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={12}
                  color={colors.textMuted}
                />
                <Text style={styles.entryLocation}>{entry.locationName}</Text>
              </View>
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
  };

  // ── Empty state ─────────────────────────────────────────────────────────

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyState}>
        <Ionicons name="book-outline" size={36} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>No journal entries yet</Text>
        <Text style={styles.emptySubtitle}>
          Your travel notes, arrival logs, and comfort checks will appear here.
        </Text>
      </View>
    );
  };

  // ── Main render ─────────────────────────────────────────────────────────

  if (loading) return <LoadingScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <NavigationHeader
        title="Journal"
        parentTitle="Trip"
      />

      <FlatList
        data={listItems}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: FLOATING_TAB_BAR_HEIGHT + spacing.xl },
          listItems.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  listContent: {
    paddingTop: spacing.sm,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },

  // ── Date section headers ──────────────────────────────────────────────
  dateHeaderRow: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  dateHeaderText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // ── Entry cards ───────────────────────────────────────────────────────
  entryCard: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.screenX,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    minHeight: 44,
  },
  entryIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  entryContent: {
    flex: 1,
  },
  entryTypeLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  entryTitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  entryBody: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 2,
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  entryLocation: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  moodPill: {
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  moodText: {
    fontFamily: fonts.medium,
    fontSize: 10,
  },

  // ── Empty state ───────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.xxxxl,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 20,
  },
});
