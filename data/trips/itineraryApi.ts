import { supabase } from '@/lib/supabase';
import { toCamel, rowsToCamel } from '@/data/api';
import type {
  TripDay,
  ItineraryBlock,
  BlockTag,
  ItinerarySuggestion,
  ItineraryBlockWithTags,
  TripDayWithBlocks,
  TripItinerary,
  CreateBlockInput,
  UpdateBlockInput,
} from './itineraryTypes';

// ── Helpers ─────────────────────────────────────────────────────

/** Sort blocks by start_time (nulls last), then by order_index. */
function sortBlocks(blocks: ItineraryBlockWithTags[]): ItineraryBlockWithTags[] {
  return blocks.sort((a, b) => {
    if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
    if (a.startTime && !b.startTime) return -1;
    if (!a.startTime && b.startTime) return 1;
    return a.orderIndex - b.orderIndex;
  });
}

/** Attach tags and place data to raw blocks, producing ItineraryBlockWithTags[]. */
function assembleBlocksWithTags(
  rawBlocks: Record<string, unknown>[],
  allTags: BlockTag[],
): ItineraryBlockWithTags[] {
  // Index tags by blockId
  const tagsByBlock = new Map<string, BlockTag[]>();
  for (const tag of allTags) {
    const arr = tagsByBlock.get(tag.blockId) || [];
    arr.push(tag);
    tagsByBlock.set(tag.blockId, arr);
  }

  return rawBlocks.map((raw) => {
    // Extract nested place data before toCamel
    const placeData = raw.places as { name: string; place_type: string; address: string | null; city_area_id: string | null } | null;
    const block = toCamel<ItineraryBlock>(raw);
    const tags = tagsByBlock.get(block.id) || [];
    const place = placeData
      ? {
          name: placeData.name,
          placeType: placeData.place_type,
          address: placeData.address,
          cityAreaId: placeData.city_area_id,
        }
      : null;
    return { ...block, tags, place };
  });
}

// ── Read ────────────────────────────────────────────────────────

export async function getTripDays(tripId: string): Promise<TripDay[]> {
  const { data, error } = await supabase
    .from('trip_days')
    .select('*')
    .eq('trip_id', tripId)
    .order('day_index', { ascending: true });
  if (error) throw error;
  return rowsToCamel<TripDay>(data ?? []);
}

export async function getDayWithBlocks(dayId: string): Promise<TripDayWithBlocks | null> {
  // 1. Fetch the day row
  const { data: dayData, error: dayError } = await supabase
    .from('trip_days')
    .select('*')
    .eq('id', dayId)
    .single();
  if (dayError) return null;

  const day = toCamel<TripDay>(dayData);

  // 2. Fetch blocks with place join
  const { data: blocksData, error: blocksError } = await supabase
    .from('itinerary_blocks')
    .select('*, places(name, place_type, address, city_area_id)')
    .eq('trip_day_id', dayId);
  if (blocksError) throw blocksError;

  const rawBlocks = (blocksData ?? []) as Record<string, unknown>[];
  if (rawBlocks.length === 0) {
    return { ...day, blocks: [] };
  }

  // 3. Fetch tags for these blocks
  const blockIds = rawBlocks.map((b) => (b as { id: string }).id);
  const { data: tagsData, error: tagsError } = await supabase
    .from('itinerary_block_tags')
    .select('*')
    .in('block_id', blockIds);
  if (tagsError) throw tagsError;

  const allTags = rowsToCamel<BlockTag>(tagsData ?? []);

  // 4. Assemble and sort
  const blocks = assembleBlocksWithTags(rawBlocks, allTags);
  sortBlocks(blocks);

  return { ...day, blocks };
}

export async function getTripItinerary(tripId: string): Promise<TripItinerary> {
  // 1. Fetch all days
  const { data: daysData, error: daysError } = await supabase
    .from('trip_days')
    .select('*')
    .eq('trip_id', tripId)
    .order('day_index', { ascending: true });
  if (daysError) throw daysError;

  const days = rowsToCamel<TripDay>(daysData ?? []);

  // 2. Fetch all blocks with place join
  const { data: blocksData, error: blocksError } = await supabase
    .from('itinerary_blocks')
    .select('*, places(name, place_type, address, city_area_id)')
    .eq('trip_id', tripId);
  if (blocksError) throw blocksError;

  const rawBlocks = (blocksData ?? []) as Record<string, unknown>[];

  // 3. Fetch all tags
  const blockIds = rawBlocks.map((b) => (b as { id: string }).id);
  let allTags: BlockTag[] = [];
  if (blockIds.length > 0) {
    const { data: tagsData, error: tagsError } = await supabase
      .from('itinerary_block_tags')
      .select('*')
      .in('block_id', blockIds);
    if (tagsError) throw tagsError;
    allTags = rowsToCamel<BlockTag>(tagsData ?? []);
  }

  // 4. Assemble blocks with tags
  const allBlocks = assembleBlocksWithTags(rawBlocks, allTags);

  // 5. Group blocks by tripDayId
  const blocksByDay = new Map<string, ItineraryBlockWithTags[]>();
  for (const block of allBlocks) {
    const arr = blocksByDay.get(block.tripDayId) || [];
    arr.push(block);
    blocksByDay.set(block.tripDayId, arr);
  }

  // 6. Assemble days with sorted blocks
  const daysWithBlocks: TripDayWithBlocks[] = days.map((day) => {
    const dayBlocks = blocksByDay.get(day.id) || [];
    sortBlocks(dayBlocks);
    return { ...day, blocks: dayBlocks };
  });

  // 7. Compute totals
  const totalPlaces = allBlocks.filter((b) => b.placeId !== null).length;
  const totalCost = allBlocks.reduce(
    (sum, b) => sum + (b.costEstimate ?? 0),
    0,
  );

  return { days: daysWithBlocks, totalPlaces, totalCost };
}

export async function getDaySuggestions(dayId: string): Promise<ItinerarySuggestion[]> {
  const { data, error } = await supabase
    .from('itinerary_suggestions')
    .select('*')
    .eq('trip_day_id', dayId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return rowsToCamel<ItinerarySuggestion>(data ?? []);
}

// ── Write ───────────────────────────────────────────────────────

export async function createTripDay(
  tripId: string,
  dayIndex: number,
  date?: string,
  title?: string,
): Promise<TripDay> {
  const { data, error } = await supabase
    .from('trip_days')
    .insert({
      trip_id: tripId,
      day_index: dayIndex,
      date: date ?? null,
      title: title ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return toCamel<TripDay>(data);
}

export async function createBlock(input: CreateBlockInput): Promise<ItineraryBlock> {
  const { data, error } = await supabase
    .from('itinerary_blocks')
    .insert({
      trip_id: input.tripId,
      trip_day_id: input.tripDayId,
      block_type: input.blockType,
      title_override: input.titleOverride ?? null,
      start_time: input.startTime ?? null,
      end_time: input.endTime ?? null,
      duration_min: input.durationMin ?? null,
      order_index: input.orderIndex,
      place_id: input.placeId ?? null,
      location_lat: input.locationLat ?? null,
      location_lng: input.locationLng ?? null,
      cost_estimate: input.costEstimate ?? null,
      booking_url: input.bookingUrl ?? null,
      meta: input.meta ?? {},
    })
    .select()
    .single();
  if (error) throw error;
  return toCamel<ItineraryBlock>(data);
}

export async function updateBlock(blockId: string, updates: UpdateBlockInput): Promise<void> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.titleOverride !== undefined) dbUpdates.title_override = updates.titleOverride;
  if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
  if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
  if (updates.durationMin !== undefined) dbUpdates.duration_min = updates.durationMin;
  if (updates.orderIndex !== undefined) dbUpdates.order_index = updates.orderIndex;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.costEstimate !== undefined) dbUpdates.cost_estimate = updates.costEstimate;
  if (updates.bookingUrl !== undefined) dbUpdates.booking_url = updates.bookingUrl;
  if (updates.meta !== undefined) dbUpdates.meta = updates.meta;

  const { error } = await supabase
    .from('itinerary_blocks')
    .update(dbUpdates)
    .eq('id', blockId);
  if (error) throw error;
}

export async function deleteBlock(blockId: string): Promise<void> {
  const { error } = await supabase
    .from('itinerary_blocks')
    .delete()
    .eq('id', blockId);
  if (error) throw error;
}

export async function reorderBlocks(dayId: string, orderedBlockIds: string[]): Promise<void> {
  for (let i = 0; i < orderedBlockIds.length; i++) {
    const { error } = await supabase
      .from('itinerary_blocks')
      .update({ order_index: i })
      .eq('id', orderedBlockIds[i]);
    if (error) throw error;
  }
}

export async function addBlockTag(
  blockId: string,
  tagType: string,
  label: string,
): Promise<BlockTag> {
  const { data, error } = await supabase
    .from('itinerary_block_tags')
    .insert({ block_id: blockId, tag_type: tagType, label })
    .select()
    .single();
  if (error) throw error;
  return toCamel<BlockTag>(data);
}

export async function removeBlockTag(tagId: string): Promise<void> {
  const { error } = await supabase
    .from('itinerary_block_tags')
    .delete()
    .eq('id', tagId);
  if (error) throw error;
}

export async function createSuggestion(
  tripId: string,
  dayId: string,
  type: string,
  reason: string,
  payload: Record<string, unknown>,
): Promise<ItinerarySuggestion> {
  const { data, error } = await supabase
    .from('itinerary_suggestions')
    .insert({
      trip_id: tripId,
      trip_day_id: dayId,
      suggestion_type: type,
      reason,
      payload,
    })
    .select()
    .single();
  if (error) throw error;
  return toCamel<ItinerarySuggestion>(data);
}

export async function applySuggestion(suggestionId: string): Promise<void> {
  const { error } = await supabase
    .from('itinerary_suggestions')
    .update({ status: 'applied' })
    .eq('id', suggestionId);
  if (error) throw error;
}

export async function dismissSuggestion(suggestionId: string): Promise<void> {
  const { error } = await supabase
    .from('itinerary_suggestions')
    .update({ status: 'dismissed' })
    .eq('id', suggestionId);
  if (error) throw error;
}

export async function generateDaysFromTrip(tripId: string): Promise<TripDay[]> {
  // 1. Fetch the trip dates
  const { data: tripData, error: tripError } = await supabase
    .from('trips')
    .select('arriving, leaving')
    .eq('id', tripId)
    .single();
  if (tripError) throw tripError;

  const arriving = tripData?.arriving as string | null;
  const leaving = tripData?.leaving as string | null;
  if (!arriving || !leaving) return [];

  // 2. Check if days already exist
  const { count, error: countError } = await supabase
    .from('trip_days')
    .select('*', { count: 'exact', head: true })
    .eq('trip_id', tripId);
  if (countError) throw countError;

  if ((count ?? 0) > 0) {
    return getTripDays(tripId);
  }

  // 3. Compute day count and create rows
  const startDate = new Date(arriving);
  const endDate = new Date(leaving);
  const diffMs = endDate.getTime() - startDate.getTime();
  const dayCount = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1);

  const rows = [];
  for (let i = 0; i < dayCount; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    rows.push({
      trip_id: tripId,
      day_index: i + 1,
      date: dateStr,
    });
  }

  const { error: insertError } = await supabase.from('trip_days').insert(rows);
  if (insertError) throw insertError;

  return getTripDays(tripId);
}
