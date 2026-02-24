import type { CreateBlockInput, BlockType } from './itineraryTypes';

/** Minimal place data needed for auto-fill. */
export interface AutoFillPlace {
  id: string;
  name: string;
  placeType: string;
  cityAreaId: string | null;
  locationLat: number | null;
  locationLng: number | null;
  costEstimate: number | null;
}

/** Time slot definitions by place type. */
const TIME_SLOTS: Record<string, { start: string; end: string }> = {
  cafe:         { start: '08:00:00', end: '09:30:00' },
  landmark:     { start: '09:30:00', end: '11:30:00' },
  temple:       { start: '09:30:00', end: '11:30:00' },
  museum:       { start: '10:00:00', end: '12:00:00' },
  gallery:      { start: '10:00:00', end: '12:00:00' },
  activity:     { start: '10:00:00', end: '12:00:00' },
  tour:         { start: '09:00:00', end: '12:00:00' },
  market:       { start: '14:00:00', end: '16:00:00' },
  wellness:     { start: '14:00:00', end: '16:00:00' },
  spa:          { start: '14:00:00', end: '16:00:00' },
  neighborhood: { start: '14:00:00', end: '17:00:00' },
  restaurant:   { start: '19:00:00', end: '21:00:00' },
  bar:          { start: '20:00:00', end: '22:00:00' },
  rooftop:      { start: '17:00:00', end: '19:00:00' },
  club:         { start: '21:00:00', end: '23:00:00' },
  beach:        { start: '10:00:00', end: '15:00:00' },
};

const PACE_TARGETS = {
  relaxed:  { min: 2, max: 3 },
  balanced: { min: 3, max: 5 },
  packed:   { min: 5, max: 7 },
} as const;

type Pace = keyof typeof PACE_TARGETS;

export interface AutoFillResult {
  dayBlocks: Map<number, CreateBlockInput[]>;
  overflow: AutoFillPlace[];
}

/** Map place_type string to itinerary BlockType. */
function toBlockType(placeType: string): BlockType {
  const MEAL_TYPES = ['restaurant', 'cafe', 'bar', 'rooftop'];
  const ACCOMMODATION_TYPES = ['hotel', 'hostel', 'homestay', 'guesthouse', 'resort', 'villa', 'airbnb'];
  const ACTIVITY_TYPES = ['activity', 'tour', 'wellness', 'spa'];
  if (MEAL_TYPES.includes(placeType)) return 'meal';
  if (ACCOMMODATION_TYPES.includes(placeType)) return 'accommodation';
  if (ACTIVITY_TYPES.includes(placeType)) return 'activity';
  return 'place';
}

/** Get sort priority for time-of-day placement (earlier types first). */
function timeOrder(placeType: string): number {
  const slot = TIME_SLOTS[placeType];
  if (!slot) return 12;
  return parseInt(slot.start.split(':')[0], 10);
}

/**
 * Build an itinerary by distributing saved places across trip days.
 *
 * Logic:
 * 1. Sort places by time-of-day fit (morning first, evening last)
 * 2. Group by cityAreaId (same neighborhood = same cluster)
 * 3. Distribute across days respecting:
 *    - Pace targets (3-5 blocks/day for balanced)
 *    - Type diversity (max 2 of same type per day)
 *    - Time slot assignment based on place type
 * 4. Overflow places that don't fit any day
 */
export function buildAutoFillItinerary(
  places: AutoFillPlace[],
  dayCount: number,
  tripId: string,
  dayIds: string[],
  pace: Pace = 'balanced',
): AutoFillResult {
  const target = PACE_TARGETS[pace];
  const dayBlocks = new Map<number, CreateBlockInput[]>();
  const overflow: AutoFillPlace[] = [];

  for (let i = 0; i < dayCount; i++) {
    dayBlocks.set(i, []);
  }

  if (places.length === 0 || dayCount === 0) {
    return { dayBlocks, overflow };
  }

  // Sort by time of day
  const sorted = places.slice().sort((a, b) => timeOrder(a.placeType) - timeOrder(b.placeType));

  // Group by area for clustering
  const areaGroups = new Map<string, AutoFillPlace[]>();
  const noArea: AutoFillPlace[] = [];
  for (const place of sorted) {
    if (place.cityAreaId) {
      const group = areaGroups.get(place.cityAreaId) ?? [];
      group.push(place);
      areaGroups.set(place.cityAreaId, group);
    } else {
      noArea.push(place);
    }
  }

  // Flatten: area clusters first (keeps same-area places together), then ungrouped
  const ordered: AutoFillPlace[] = [];
  for (const group of Array.from(areaGroups.values())) {
    ordered.push(...group);
  }
  ordered.push(...noArea);

  // Track type counts per day for diversity
  const typeCounts = new Map<number, Map<string, number>>();

  for (const place of ordered) {
    let assigned = false;

    for (let dayIdx = 0; dayIdx < dayCount; dayIdx++) {
      const blocks = dayBlocks.get(dayIdx)!;
      if (blocks.length >= target.max) continue;

      // Type diversity: max 2 of same type per day
      const dayTypes = typeCounts.get(dayIdx) ?? new Map<string, number>();
      const typeCount = dayTypes.get(place.placeType) ?? 0;
      if (typeCount >= 2) continue;

      const slot = TIME_SLOTS[place.placeType] ?? { start: '12:00:00', end: '14:00:00' };

      const block: CreateBlockInput = {
        tripId,
        tripDayId: dayIds[dayIdx],
        blockType: toBlockType(place.placeType),
        titleOverride: place.name,
        startTime: slot.start,
        endTime: slot.end,
        orderIndex: blocks.length,
        placeId: place.id,
        locationLat: place.locationLat ?? undefined,
        locationLng: place.locationLng ?? undefined,
        costEstimate: place.costEstimate ?? undefined,
      };

      blocks.push(block);
      dayTypes.set(place.placeType, typeCount + 1);
      typeCounts.set(dayIdx, dayTypes);
      assigned = true;
      break;
    }

    if (!assigned) {
      overflow.push(place);
    }
  }

  return { dayBlocks, overflow };
}
