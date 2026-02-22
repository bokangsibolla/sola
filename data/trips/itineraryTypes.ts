// Type unions
export type BlockType = 'place' | 'accommodation' | 'activity' | 'transport' | 'meal' | 'free_time' | 'note' | 'safety_check';
export type BlockStatus = 'planned' | 'booked' | 'done' | 'skipped';
export type TripPace = 'relaxed' | 'balanced' | 'packed';
export type BlockTagType = 'vibe' | 'accessibility' | 'women_note' | 'logistics';
export type SuggestionType = 'reorder' | 'swap' | 'insert' | 'remove' | 'time_shift';
export type SuggestionStatus = 'pending' | 'applied' | 'dismissed';

// Core entities (camelCase, matching what toCamel() produces from DB)
export interface TripDay {
  id: string;
  tripId: string;
  dayIndex: number;
  date: string | null;
  title: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryBlock {
  id: string;
  tripId: string;
  tripDayId: string;
  blockType: BlockType;
  titleOverride: string | null;
  startTime: string | null;   // "HH:MM:SS" from Postgres time
  endTime: string | null;
  durationMin: number | null;
  orderIndex: number;
  placeId: string | null;
  locationLat: number | null;
  locationLng: number | null;
  costEstimate: number | null;
  bookingUrl: string | null;
  status: BlockStatus;
  meta: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface BlockTag {
  id: string;
  blockId: string;
  tagType: BlockTagType;
  label: string;
  createdAt: string;
}

export interface ItinerarySuggestion {
  id: string;
  tripId: string;
  tripDayId: string | null;
  blockId: string | null;
  suggestionType: SuggestionType;
  reason: string;
  payload: Record<string, unknown>;
  status: SuggestionStatus;
  createdAt: string;
}

// Enriched block with tags and optional place data
export interface ItineraryBlockWithTags extends ItineraryBlock {
  tags: BlockTag[];
  place?: {
    name: string;
    placeType: string;
    address: string | null;
    cityAreaId: string | null;
    imageUrlCached: string | null;
  } | null;
}

// Full day with ordered blocks
export interface TripDayWithBlocks extends TripDay {
  blocks: ItineraryBlockWithTags[];
}

// Trip itinerary overview (for Trip Home)
export interface TripItinerary {
  days: TripDayWithBlocks[];
  totalPlaces: number;
  totalCost: number;
}

// Input types for mutations
export interface CreateBlockInput {
  tripId: string;
  tripDayId: string;
  blockType: BlockType;
  titleOverride?: string;
  startTime?: string;
  endTime?: string;
  durationMin?: number;
  orderIndex: number;
  placeId?: string;
  locationLat?: number;
  locationLng?: number;
  costEstimate?: number;
  bookingUrl?: string;
  meta?: Record<string, unknown>;
}

export interface UpdateBlockInput {
  titleOverride?: string;
  startTime?: string | null;
  endTime?: string | null;
  durationMin?: number | null;
  orderIndex?: number;
  status?: BlockStatus;
  costEstimate?: number | null;
  bookingUrl?: string | null;
  meta?: Record<string, unknown>;
}

// Suggestion payload shapes
export interface ReorderPayload {
  moves: { blockId: string; newOrderIndex: number }[];
}

export interface InsertPayload {
  afterBlockId: string | null;
  block: Omit<CreateBlockInput, 'tripId' | 'tripDayId' | 'orderIndex'>;
}

export interface TimeShiftPayload {
  blockId: string;
  newStartTime: string;
  newEndTime?: string;
}

export interface RemovePayload {
  blockId: string;
  reason: string;
}
