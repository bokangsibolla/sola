import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, pressedState, radius, spacing } from '@/constants/design';
import { getTripItinerary } from '@/data/trips/itineraryApi';
import { useData } from '@/hooks/useData';
import type { ItineraryBlockWithTags, TripDayWithBlocks } from '@/data/trips/itineraryTypes';

// ── Props ──────────────────────────────────────────────────────

interface TripModeCardProps {
  tripId: string;
  tripTitle: string;
  arriving: string;
  leaving: string;
  destinationName: string;
  onPress: () => void;
}

// ── Icon mapping for block types ───────────────────────────────

const BLOCK_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  place: 'location-outline',
  accommodation: 'bed-outline',
  activity: 'walk-outline',
  transport: 'car-outline',
  meal: 'restaurant-outline',
  free_time: 'sunny-outline',
  note: 'document-text-outline',
  safety_check: 'shield-checkmark-outline',
};

const BLOCK_TYPE_LABELS: Record<string, string> = {
  place: 'Place',
  accommodation: 'Stay',
  activity: 'Activity',
  transport: 'Getting there',
  meal: 'Meal',
  free_time: 'Free time',
  note: 'Note',
  safety_check: 'Check-in',
};

// ── Helpers ────────────────────────────────────────────────────

const DAY_MS = 86_400_000;

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDayNumber(arriving: string): number {
  const start = new Date(arriving);
  const now = new Date();
  // Zero out times for clean day calculation
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((today.getTime() - startDay.getTime()) / DAY_MS) + 1;
}

function getCurrentTimeHHMM(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/** Format "HH:MM:SS" or "HH:MM" into "2:00 PM" style */
function formatBlockTime(time: string): string {
  const h = parseInt(time.slice(0, 2), 10);
  const m = time.slice(3, 5);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

/** Get the display title for a block */
function getBlockTitle(block: ItineraryBlockWithTags): string {
  return (
    block.titleOverride ??
    block.place?.name ??
    BLOCK_TYPE_LABELS[block.blockType] ??
    'Activity'
  );
}

/** Compute a relative time description like "In 45 minutes" or "In 2 hours" */
function getRelativeTime(blockTime: string): string | null {
  const now = new Date();
  const [bh, bm] = blockTime.split(':').map(Number);
  const blockMinutes = bh * 60 + bm;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const diff = blockMinutes - nowMinutes;

  if (diff < 0) return null;
  if (diff === 0) return 'Now';
  if (diff < 60) return `In ${diff} minute${diff === 1 ? '' : 's'}`;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (mins === 0) return `In ${hours} hour${hours === 1 ? '' : 's'}`;
  return `In ${hours}h ${mins}m`;
}

// ── Partitioned blocks ─────────────────────────────────────────

interface PartitionedBlocks {
  nextUp: ItineraryBlockWithTags | null;
  laterToday: ItineraryBlockWithTags[];
}

function partitionBlocks(blocks: ItineraryBlockWithTags[]): PartitionedBlocks {
  if (blocks.length === 0) {
    return { nextUp: null, laterToday: [] };
  }

  const currentTime = getCurrentTimeHHMM();
  const hasAnyTimes = blocks.some((b) => b.startTime != null);

  if (!hasAnyTimes) {
    // No time data: first block is "next up", rest are "later today"
    return {
      nextUp: blocks[0],
      laterToday: blocks.slice(1, 3),
    };
  }

  // Find the first block whose startTime >= now (or has no startTime and comes after timed blocks)
  let nextUpIndex = -1;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.startTime != null && b.startTime.slice(0, 5) >= currentTime) {
      nextUpIndex = i;
      break;
    }
    if (b.startTime == null && i > 0) {
      // Untimed block after some timed ones — could be next
      const prevHadTime = blocks.slice(0, i).some((pb) => pb.startTime != null && pb.startTime.slice(0, 5) >= currentTime);
      if (!prevHadTime) continue;
      nextUpIndex = i;
      break;
    }
  }

  // If all blocks have passed, show the last one as "next up" (still relevant context)
  if (nextUpIndex === -1) {
    // All blocks have passed — show nothing as "next up" or show last block
    return { nextUp: null, laterToday: [] };
  }

  return {
    nextUp: blocks[nextUpIndex],
    laterToday: blocks.slice(nextUpIndex + 1, nextUpIndex + 3),
  };
}

// ── Component ──────────────────────────────────────────────────

export const TripModeCard: React.FC<TripModeCardProps> = ({
  tripId,
  tripTitle,
  arriving,
  destinationName,
  onPress,
}) => {
  const dayNumber = getDayNumber(arriving);
  const todayStr = getTodayString();

  // Fetch itinerary for the trip
  const { data: itinerary, loading } = useData(
    () => getTripItinerary(tripId),
    [tripId],
  );

  // Find today's day and partition blocks
  const { nextUp, laterToday, todayDay } = useMemo(() => {
    if (!itinerary) return { nextUp: null, laterToday: [] as ItineraryBlockWithTags[], todayDay: null as TripDayWithBlocks | null };

    const day = itinerary.days.find((d) => d.date === todayStr) ?? null;
    if (!day || day.blocks.length === 0) {
      return { nextUp: null, laterToday: [] as ItineraryBlockWithTags[], todayDay: day };
    }

    const partitioned = partitionBlocks(day.blocks);
    return { ...partitioned, todayDay: day };
  }, [itinerary, todayStr]);

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Open trip: ${tripTitle}`}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              Traveling{' '}{'\u00B7'}{' '}Day {dayNumber}
            </Text>
          </View>
          <Text style={styles.tripTitle} numberOfLines={1}>
            {destinationName}
          </Text>
        </View>

        {/* Content — blocks or empty state */}
        {loading ? null : !todayDay || (!nextUp && laterToday.length === 0) ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>No plans yet for today</Text>
          </View>
        ) : (
          <View style={styles.blocksSection}>
            {/* Next Up */}
            {nextUp != null && (
              <>
                <View style={styles.dividerRow}>
                  <Text style={styles.sectionLabel}>NEXT UP</Text>
                  <View style={styles.dividerLine} />
                </View>
                <BlockRow block={nextUp} isNextUp />
              </>
            )}

            {/* Later Today */}
            {laterToday.length > 0 && (
              <>
                <View style={styles.dividerRow}>
                  <Text style={styles.sectionLabel}>LATER TODAY</Text>
                  <View style={styles.dividerLine} />
                </View>
                {laterToday.map((block) => (
                  <BlockRow key={block.id} block={block} />
                ))}
              </>
            )}
          </View>
        )}

        {/* CTA */}
        <View style={styles.ctaRow}>
          <Text style={styles.ctaText}>{"Open today's plan"}</Text>
          <Ionicons
            name="arrow-forward"
            size={16}
            color={colors.orange}
          />
        </View>
      </Pressable>
    </View>
  );
};

// ── Block Row Sub-component ────────────────────────────────────

interface BlockRowProps {
  block: ItineraryBlockWithTags;
  isNextUp?: boolean;
}

const BlockRow: React.FC<BlockRowProps> = ({ block, isNextUp }) => {
  const iconName = BLOCK_TYPE_ICONS[block.blockType] ?? 'ellipse-outline';
  const title = getBlockTitle(block);

  // Build meta text
  const metaParts: string[] = [];
  if (block.startTime != null) {
    if (isNextUp) {
      const relative = getRelativeTime(block.startTime);
      if (relative) metaParts.push(relative);
    }
    metaParts.push(formatBlockTime(block.startTime));
  }
  const metaText = metaParts.join(' \u00B7 ');

  return (
    <View style={styles.blockRow}>
      <Ionicons
        name={iconName as keyof typeof Ionicons.glyphMap}
        size={16}
        color={isNextUp ? colors.orange : colors.textMuted}
        style={styles.blockIcon}
      />
      <View style={styles.blockContent}>
        <Text
          style={[styles.blockTitle, isNextUp && styles.blockTitleNextUp]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {metaText.length > 0 && (
          <Text style={styles.blockMeta} numberOfLines={1}>
            {metaText}
          </Text>
        )}
      </View>
    </View>
  );
};

// ── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.orangeFill,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.module,
    padding: spacing.lg,
  },

  // Header
  header: {
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.greenSoft,
    marginRight: spacing.sm,
  },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  tripTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.textPrimary,
  },

  // Empty state
  emptySection: {
    paddingVertical: spacing.md,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },

  // Blocks section
  blocksSection: {
    marginBottom: spacing.xs,
  },

  // Divider row
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.5,
    color: colors.textMuted,
    marginRight: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderDefault,
  },

  // Block row
  blockRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
  },
  blockIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  blockContent: {
    flex: 1,
  },
  blockTitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  blockTitleNextUp: {
    fontFamily: fonts.semiBold,
  },
  blockMeta: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 1,
  },

  // CTA
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    minHeight: 44,
  },
  ctaText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.orange,
    marginRight: spacing.xs,
  },
});
