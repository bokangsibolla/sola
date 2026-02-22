import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, pressedState, radius, spacing } from '@/constants/design';
import { TYPE_DOT_COLOR, TYPE_LABEL } from '@/components/trips/blockTypeColors';
import type { ItineraryBlockWithTags, TripDayWithBlocks } from '@/data/trips/itineraryTypes';
import type { Place } from '@/data/types';

interface DayOverviewCardProps {
  day: TripDayWithBlocks;
  onPress: () => void;
}

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const dayName = SHORT_DAYS[date.getUTCDay()];
  const dayNum = date.getUTCDate();
  const month = SHORT_MONTHS[date.getUTCMonth()];
  return `${dayName}, ${dayNum} ${month}`;
};

const formatCost = (cost: number | null): string | null => {
  if (cost == null || cost <= 0) return null;
  return `$${cost % 1 === 0 ? cost : cost.toFixed(0)}`;
};

const MAX_VISIBLE = 3;
const THUMB_SIZE = 56;

export const DayOverviewCard: React.FC<DayOverviewCardProps> = ({ day, onPress }) => {
  const visibleBlocks = day.blocks.slice(0, MAX_VISIBLE);
  const extraCount = Math.max(0, day.blocks.length - MAX_VISIBLE);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && pressedState]}
    >
      <View style={styles.accentBar} />

      <View style={styles.content}>
        {/* Header: Day label + date + chevron */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <SolaText style={styles.dayLabel}>Day {day.dayIndex}</SolaText>
            {day.date != null && (
              <SolaText style={styles.dateText}>{formatDate(day.date)}</SolaText>
            )}
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>

        {day.title != null && (
          <SolaText style={styles.title} numberOfLines={1}>
            {day.title}
          </SolaText>
        )}

        {/* Block entry rows */}
        {day.blocks.length > 0 && (
          <View style={styles.entries}>
            {visibleBlocks.map((block) => (
              <BlockEntryRow key={block.id} block={block} />
            ))}
            {extraCount > 0 && (
              <SolaText style={styles.moreText}>+{extraCount} more</SolaText>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
};

// ── Block entry row ───────────────────────────────────────────────────────────

const BlockEntryRow: React.FC<{ block: ItineraryBlockWithTags }> = ({ block }) => {
  const name = block.titleOverride ?? block.place?.name ?? block.blockType;
  const placeType = block.place?.placeType as Place['placeType'] | undefined;
  const dotColor = placeType ? TYPE_DOT_COLOR[placeType] : undefined;
  const typeLabel = placeType ? TYPE_LABEL[placeType] : undefined;
  const thumbUrl = block.place?.imageUrlCached ?? null;
  const cost = formatCost(block.costEstimate);

  return (
    <View style={styles.entryRow}>
      <View style={styles.entryInfo}>
        <SolaText style={styles.entryName} numberOfLines={1}>{name}</SolaText>
        <View style={styles.entryTagRow}>
          {dotColor && (
            <View style={[styles.tagDot, { backgroundColor: dotColor }]} />
          )}
          {typeLabel && (
            <SolaText style={styles.entryTagText}>{typeLabel}</SolaText>
          )}
          {cost && (
            <SolaText style={styles.costText}>{cost}</SolaText>
          )}
        </View>
      </View>
      {thumbUrl ? (
        <Image
          source={{ uri: thumbUrl }}
          style={styles.entryThumb}
          contentFit="cover"
        />
      ) : (
        <View style={styles.entryThumbPlaceholder}>
          <Ionicons name="image-outline" size={16} color={colors.textMuted} />
        </View>
      )}
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  accentBar: {
    width: 3,
    backgroundColor: colors.orange,
    borderRadius: radius.xs,
    alignSelf: 'stretch',
  },
  content: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dayLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  dateText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Entry rows
  entries: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  entryName: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  entryTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  tagDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  entryTagText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  costText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#2D8A4E',
    marginLeft: spacing.xs,
  },
  entryThumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.card,
  },
  entryThumbPlaceholder: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.card,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
});
