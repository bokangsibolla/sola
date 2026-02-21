import type {
  ItineraryBlockWithTags,
  TripDayWithBlocks,
  TripPace,
  SuggestionType,
} from './itineraryTypes';
import {
  createSuggestion,
  dismissSuggestion,
  getDaySuggestions,
} from './itineraryApi';

// ── Types ──────────────────────────────────────────────────────

export interface SuggestionCandidate {
  tripDayId: string;
  blockId: string | null;
  suggestionType: SuggestionType;
  reason: string;
  payload: Record<string, unknown>;
}

// ── Helpers (internal) ─────────────────────────────────────────

/** Parse "HH:MM:SS" or "HH:MM" to minutes since midnight. */
function parseTime(timeStr: string): number {
  const parts = timeStr.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

/** Convert minutes since midnight to "HH:MM:SS". */
function timeToStr(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}:00`;
}

/** Haversine distance in kilometers. */
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Get a human-readable title from a block. */
function blockTitle(block: ItineraryBlockWithTags): string {
  return block.titleOverride ?? block.place?.name ?? 'Untitled';
}

/** Get the end time in minutes for a block that has a start time. */
function blockEndMinutes(block: ItineraryBlockWithTags): number | null {
  if (block.endTime) return parseTime(block.endTime);
  if (block.startTime && block.durationMin != null) {
    return parseTime(block.startTime) + block.durationMin;
  }
  return null;
}

// ── Analyzers ──────────────────────────────────────────────────

/**
 * Detect overlapping consecutive timed blocks and suggest time shifts.
 */
export function detectTimeConflicts(
  dayId: string,
  blocks: ItineraryBlockWithTags[],
): SuggestionCandidate[] {
  const candidates: SuggestionCandidate[] = [];

  // Only blocks with startTime AND (endTime or durationMin)
  const timed = blocks.filter(
    (b) => b.startTime != null && (b.endTime != null || b.durationMin != null),
  );

  // Sort by start time
  const sorted = timed.slice().sort((a, b) =>
    (a.startTime as string).localeCompare(b.startTime as string),
  );

  for (let i = 0; i < sorted.length - 1; i++) {
    const blockA = sorted[i];
    const blockB = sorted[i + 1];
    const blockAEnd = blockEndMinutes(blockA);
    const blockBStart = parseTime(blockB.startTime as string);

    if (blockAEnd != null && blockAEnd > blockBStart) {
      const newTime = timeToStr(blockAEnd);
      candidates.push({
        tripDayId: dayId,
        blockId: blockB.id,
        suggestionType: 'time_shift',
        reason: `${blockTitle(blockB)} overlaps with ${blockTitle(blockA)} — shift to ${newTime}?`,
        payload: { blockId: blockB.id, newStartTime: newTime },
      });
    }
  }

  return candidates;
}

/**
 * Detect gaps longer than 3 hours between consecutive timed blocks.
 */
export function detectLongGaps(
  dayId: string,
  blocks: ItineraryBlockWithTags[],
): SuggestionCandidate[] {
  const candidates: SuggestionCandidate[] = [];

  // Timed blocks only (have startTime)
  const timed = blocks.filter((b) => b.startTime != null);
  const sorted = timed.slice().sort((a, b) =>
    (a.startTime as string).localeCompare(b.startTime as string),
  );

  for (let i = 0; i < sorted.length - 1; i++) {
    const blockA = sorted[i];
    const blockB = sorted[i + 1];
    const blockAEnd = blockEndMinutes(blockA);
    const blockBStart = parseTime(blockB.startTime as string);

    if (blockAEnd == null) continue;

    const gapMinutes = blockBStart - blockAEnd;

    if (gapMinutes > 180) {
      const gapHours = Math.round(gapMinutes / 60);
      candidates.push({
        tripDayId: dayId,
        blockId: null,
        suggestionType: 'insert',
        reason: `${gapHours} hour gap between ${blockTitle(blockA)} and ${blockTitle(blockB)} — add a stop?`,
        payload: {
          afterBlockId: blockA.id,
          block: { blockType: 'free_time', titleOverride: 'Free time' },
        },
      });
    }
  }

  return candidates;
}

/**
 * Detect a full day with no meal block and suggest inserting lunch.
 */
export function detectMissingMeals(
  dayId: string,
  blocks: ItineraryBlockWithTags[],
): SuggestionCandidate[] {
  const candidates: SuggestionCandidate[] = [];

  // Count non-note/non-safety_check blocks
  const substantive = blocks.filter(
    (b) => b.blockType !== 'note' && b.blockType !== 'safety_check',
  );

  if (substantive.length <= 3) return candidates;

  // Check if any block is already a meal
  const hasMeal = blocks.some((b) => b.blockType === 'meal');
  if (hasMeal) return candidates;

  // Check if blocks span the lunch window
  const timedBlocks = blocks.filter((b) => b.startTime != null);
  const hasBlockBefore11 = timedBlocks.some(
    (b) => parseTime(b.startTime as string) < parseTime('11:00'),
  );
  const hasBlockAfter14 = timedBlocks.some(
    (b) => parseTime(b.startTime as string) > parseTime('14:00'),
  );

  if (hasBlockBefore11 && hasBlockAfter14) {
    // Find the last block before noon to insert after
    const noonMinutes = parseTime('12:00');
    const beforeNoon = timedBlocks
      .filter((b) => parseTime(b.startTime as string) < noonMinutes)
      .sort((a, b) =>
        (b.startTime as string).localeCompare(a.startTime as string),
      );

    const afterBlockId = beforeNoon.length > 0 ? beforeNoon[0].id : blocks[0].id;

    candidates.push({
      tripDayId: dayId,
      blockId: null,
      suggestionType: 'insert',
      reason: 'Full day with no meal planned — add lunch around noon?',
      payload: {
        afterBlockId,
        block: {
          blockType: 'meal',
          titleOverride: 'Lunch break',
          startTime: '12:00:00',
          durationMin: 60,
        },
      },
    });
  }

  return candidates;
}

/**
 * Detect when the number of activities mismatches the trip pace.
 */
export function detectPaceMismatch(
  dayId: string,
  blocks: ItineraryBlockWithTags[],
  pace: TripPace | null,
): SuggestionCandidate[] {
  const candidates: SuggestionCandidate[] = [];

  if (pace === 'balanced' || pace == null) return candidates;

  // Count activity blocks (not note, safety_check, or free_time)
  const activityBlocks = blocks.filter(
    (b) =>
      b.blockType !== 'note' &&
      b.blockType !== 'safety_check' &&
      b.blockType !== 'free_time',
  );
  const activityCount = activityBlocks.length;

  if (pace === 'relaxed' && activityCount > 4) {
    const lastActivity = activityBlocks[activityBlocks.length - 1];
    candidates.push({
      tripDayId: dayId,
      blockId: lastActivity.id,
      suggestionType: 'remove',
      reason: `${activityCount} stops planned for a relaxed pace — consider moving one to another day`,
      payload: { blockId: lastActivity.id, reason: 'Relaxed pace exceeded' },
    });
  }

  if (pace === 'packed' && activityCount < 3) {
    // Only suggest if the day has a date set — we check this via the day object
    // passed from analyzeDaySuggestions, but here we only have blocks.
    // The caller (analyzeDaySuggestions) handles the date check before calling.
    const lastBlock = blocks[blocks.length - 1];
    candidates.push({
      tripDayId: dayId,
      blockId: null,
      suggestionType: 'insert',
      reason: `Only ${activityCount} stops — this day has room for more`,
      payload: {
        afterBlockId: lastBlock.id,
        block: { blockType: 'activity', titleOverride: 'Add an activity' },
      },
    });
  }

  return candidates;
}

/**
 * Detect when reordering geolocated blocks could reduce total travel distance
 * by at least 20%, using a nearest-neighbor heuristic.
 */
export function detectProximityReorder(
  dayId: string,
  blocks: ItineraryBlockWithTags[],
): SuggestionCandidate[] {
  const candidates: SuggestionCandidate[] = [];

  // Filter blocks with both lat and lng
  const geoBlocks = blocks.filter(
    (b) => b.locationLat != null && b.locationLng != null,
  );

  if (geoBlocks.length < 3) return candidates;

  // Compute current total distance
  let currentDistance = 0;
  for (let i = 0; i < geoBlocks.length - 1; i++) {
    currentDistance += haversineKm(
      geoBlocks[i].locationLat as number,
      geoBlocks[i].locationLng as number,
      geoBlocks[i + 1].locationLat as number,
      geoBlocks[i + 1].locationLng as number,
    );
  }

  // Nearest-neighbor starting from first block
  const visited: ItineraryBlockWithTags[] = [geoBlocks[0]];
  // Use Array.from() for Hermes compatibility
  const remaining = geoBlocks.slice(1);

  while (remaining.length > 0) {
    const last = visited[visited.length - 1];
    let closestIdx = 0;
    let closestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = haversineKm(
        last.locationLat as number,
        last.locationLng as number,
        remaining[i].locationLat as number,
        remaining[i].locationLng as number,
      );
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }

    visited.push(remaining[closestIdx]);
    remaining.splice(closestIdx, 1);
  }

  // Compute new total distance
  let newDistance = 0;
  for (let i = 0; i < visited.length - 1; i++) {
    newDistance += haversineKm(
      visited[i].locationLat as number,
      visited[i].locationLng as number,
      visited[i + 1].locationLat as number,
      visited[i + 1].locationLng as number,
    );
  }

  // Only suggest if 20%+ improvement
  if (newDistance < currentDistance * 0.8) {
    const saved = currentDistance - newDistance;
    candidates.push({
      tripDayId: dayId,
      blockId: null,
      suggestionType: 'reorder',
      reason: `Reordering stops could save ~${Math.round(saved)}km of travel`,
      payload: {
        moves: visited.map((b, i) => ({ blockId: b.id, newOrderIndex: i })),
      },
    });
  }

  return candidates;
}

// ── Main Entry Point ───────────────────────────────────────────

/**
 * Analyze a day's itinerary blocks and produce suggestion candidates
 * for conflicts, gaps, missing meals, pace mismatch, and proximity reorder.
 */
export function analyzeDaySuggestions(
  day: TripDayWithBlocks,
  pace: TripPace | null,
): SuggestionCandidate[] {
  const { blocks } = day;
  if (blocks.length === 0) return [];

  // For pace === 'packed', only suggest more activities if day has a date
  const paceCandidates =
    pace === 'packed' && day.date == null
      ? []
      : detectPaceMismatch(day.id, blocks, pace);

  return [
    ...detectTimeConflicts(day.id, blocks),
    ...detectLongGaps(day.id, blocks),
    ...detectMissingMeals(day.id, blocks),
    ...paceCandidates,
    ...detectProximityReorder(day.id, blocks),
  ];
}

// ── Sync ───────────────────────────────────────────────────────

/**
 * Sync suggestion candidates to the database:
 * - Dismiss stale suggestions that are no longer relevant
 * - Create new suggestions that don't already exist
 */
export async function syncSuggestions(
  tripId: string,
  dayId: string,
  candidates: SuggestionCandidate[],
): Promise<void> {
  // 1. Fetch existing pending suggestions for this day
  const existing = await getDaySuggestions(dayId);

  // 2. Dismiss suggestions that are no longer relevant
  for (const s of existing) {
    const stillRelevant = candidates.some(
      (c) => c.suggestionType === s.suggestionType && c.blockId === s.blockId,
    );
    if (!stillRelevant) {
      await dismissSuggestion(s.id);
    }
  }

  // 3. Create new suggestions that don't already exist
  for (const c of candidates) {
    const alreadyExists = existing.some(
      (s) => s.suggestionType === c.suggestionType && s.blockId === c.blockId,
    );
    if (!alreadyExists) {
      await createSuggestion(tripId, dayId, c.suggestionType, c.reason, c.payload);
    }
  }
}
